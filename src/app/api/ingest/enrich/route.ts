import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ────────────────────────────────────────────────────────────────
   YouTube Page Scraper — Subscriber Counts & Channel Metadata
   
   YouTube SSR-renders subscriber counts, descriptions, and channel
   names in the initial HTML response. We parse the `ytInitialData`
   JSON blob embedded in the page — no headless browser needed.
   
   This runs as a background enrichment pass AFTER the main RSS scrape.
   ──────────────────────────────────────────────────────────────── */

async function scrapeYouTubePage(channelId: string): Promise<{
  subscriberCount: number;
  description: string;
  title: string;
  thumbnail: string;
  country: string;
} | null> {
  try {
    const url = `https://www.youtube.com/channel/${channelId}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) return null;
    const html = await res.text();

    // Extract ytInitialData JSON blob
    const dataMatch = html.match(
      /var\s+ytInitialData\s*=\s*(\{[\s\S]+?\});\s*<\/script>/
    );

    let subscriberCount = 0;
    let description = "";
    let title = "";
    let thumbnail = "";
    let country = "";

    if (dataMatch) {
      try {
        const data = JSON.parse(dataMatch[1]);

        // Channel name from metadata
        const metadata =
          data?.metadata?.channelMetadataRenderer ||
          data?.microformat?.microformatDataRenderer;
        if (metadata) {
          title = metadata.title || "";
          description = (metadata.description || "").slice(0, 500);
          thumbnail =
            metadata.avatar?.thumbnails?.[0]?.url ||
            metadata.thumbnail?.thumbnails?.[0]?.url ||
            "";
          country = metadata.country || "";
        }

        // Subscriber count from header
        const header =
          data?.header?.c4TabbedHeaderRenderer ||
          data?.header?.pageHeaderRenderer;

        if (header?.subscriberCountText?.simpleText) {
          subscriberCount = parseSubCount(
            header.subscriberCountText.simpleText
          );
        } else if (header?.content?.pageHeaderViewModel) {
          const vm = header.content.pageHeaderViewModel;
          const subText =
            vm?.metadata?.contentMetadataViewModel?.metadataRows?.[0]
              ?.metadataParts?.[0]?.text?.content || "";
          if (subText) subscriberCount = parseSubCount(subText);
        }

        // Fallback: search the entire JSON string for subscriber text
        if (subscriberCount === 0) {
          const subMatch = dataMatch[1].match(
            /"subscriberCountText":\s*\{\s*"simpleText":\s*"([^"]+)"/
          );
          if (subMatch) subscriberCount = parseSubCount(subMatch[1]);
        }
      } catch {
        // JSON parse failed, try regex fallback
      }
    }

    // Regex fallbacks for subscriber count
    if (subscriberCount === 0) {
      const subPatterns = [
        // Accessibility label: "label":"5.16 million subscribers"
        /"subscriberCountText"[^}]*"label":"([^"]+)"/,
        // Simple text: "simpleText":"5.16M subscribers"
        /"subscriberCountText":\{"simpleText":"([^"]+)"/,
        // Plain subscriber count
        /"subscriberCount":"(\d+)"/,
        // Nested accessibility
        /subscribers"[^}]*"simpleText":"([^"]+)"/,
      ];
      for (const pattern of subPatterns) {
        const m = html.match(pattern);
        if (m) {
          subscriberCount = parseSubCount(m[1]);
          if (subscriberCount > 0) break;
        }
      }
    }

    // OG title/description fallback
    if (!title) {
      const ogTitle = html.match(
        /<meta\s+property="og:title"\s+content="([^"]+)"/
      );
      if (ogTitle) title = ogTitle[1];
    }
    if (!description) {
      const ogDesc = html.match(
        /<meta\s+property="og:description"\s+content="([^"]+)"/
      );
      if (ogDesc) description = ogDesc[1];
    }
    if (!thumbnail) {
      const ogImg = html.match(
        /<meta\s+property="og:image"\s+content="([^"]+)"/
      );
      if (ogImg) thumbnail = ogImg[1];
    }

    return { subscriberCount, description, title, thumbnail, country };
  } catch {
    return null;
  }
}

function parseSubCount(text: string): number {
  if (!text) return 0;

  // Clean up: "5.16 million subscribers" → "5.16 million"
  const cleaned = text
    .replace(/\s*subscribers?/i, "")
    .replace(/\s*abonnés?/i, "")
    .trim();

  const multipliers: Record<string, number> = {
    K: 1_000,
    M: 1_000_000,
    B: 1_000_000_000,
    thousand: 1_000,
    million: 1_000_000,
    billion: 1_000_000_000,
    lakh: 100_000,
    crore: 10_000_000,
  };

  // "5.16 million" or "234 thousand"
  const wordMatch = cleaned.match(
    /^([\d.]+)\s+(thousand|million|billion|lakh|crore)$/i
  );
  if (wordMatch) {
    const num = parseFloat(wordMatch[1]);
    const mult = multipliers[wordMatch[2].toLowerCase()] || 1;
    return Math.round(num * mult);
  }

  // "5.16M" or "234K"
  const abbrMatch = cleaned.match(/^([\d.]+)\s*([KMB])$/i);
  if (abbrMatch) {
    const num = parseFloat(abbrMatch[1]);
    const mult = multipliers[abbrMatch[2].toUpperCase()] || 1;
    return Math.round(num * mult);
  }

  // Plain number: "12,345" or "12345"
  const plain = parseInt(cleaned.replace(/,/g, ""));
  return isNaN(plain) ? 0 : plain;
}

/* ── GET /api/ingest/enrich ─────────────────────────────────── */
// Enriches channels with subscriber counts by scraping YouTube pages.
// Processes 5 channels per call (those with subscriberCount=0).

export async function GET() {
  try {
    // Find channels missing subscriber data
    const channels = await prisma.channel.findMany({
      where: { subscriberCount: 0 },
      orderBy: { lastScrapedAt: "asc" },
      take: 5,
      select: {
        id: true,
        youtubeId: true,
        title: true,
        description: true,
        thumbnailUrl: true,
      },
    });

    if (channels.length === 0) {
      // All channels have subscriber data — re-enrich oldest ones
      const stale = await prisma.channel.findMany({
        orderBy: { updatedAt: "asc" },
        take: 5,
        select: { id: true, youtubeId: true, title: true },
      });

      if (stale.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No channels to enrich",
        });
      }

      // Re-enrich stale channels
      const log: string[] = [];
      let enriched = 0;

      for (const ch of stale) {
        const data = await scrapeYouTubePage(ch.youtubeId);
        if (data && data.subscriberCount > 0) {
          await prisma.channel.update({
            where: { id: ch.id },
            data: {
              subscriberCount: data.subscriberCount,
              ...(data.description && { description: data.description }),
              ...(data.thumbnail && { thumbnailUrl: data.thumbnail }),
              ...(data.country && { country: data.country }),
            },
          });
          enriched++;
          log.push(
            `✅ ${data.title || ch.title}: ${data.subscriberCount.toLocaleString()} subscribers`
          );
        } else {
          log.push(`⏭️ ${ch.title}: no subscriber data available`);
        }
        // Rate limit: 1 second between requests
        await new Promise((r) => setTimeout(r, 1000));
      }

      return NextResponse.json({
        success: true,
        enriched,
        total: stale.length,
        log,
        remaining: 0,
      });
    }

    const log: string[] = [];
    let enriched = 0;

    for (const ch of channels) {
      const data = await scrapeYouTubePage(ch.youtubeId);
      if (data) {
        const updateData: Record<string, unknown> = {};
        if (data.subscriberCount > 0)
          updateData.subscriberCount = data.subscriberCount;
        if (data.title && data.title !== ch.title)
          updateData.title = data.title;
        if (
          data.description &&
          data.description.length > (ch.description?.length || 0)
        )
          updateData.description = data.description;
        if (data.thumbnail) updateData.thumbnailUrl = data.thumbnail;
        if (data.country) updateData.country = data.country;

        if (Object.keys(updateData).length > 0) {
          await prisma.channel.update({
            where: { id: ch.id },
            data: updateData,
          });
          enriched++;
          log.push(
            `✅ ${data.title || ch.title}: ${data.subscriberCount > 0 ? data.subscriberCount.toLocaleString() + " subs" : "metadata updated"}`
          );
        } else {
          log.push(`⏭️ ${ch.title}: no new data`);
        }
      } else {
        log.push(`❌ ${ch.title}: page fetch failed`);
      }

      // Rate limit between requests
      await new Promise((r) => setTimeout(r, 1000));
    }

    // Count remaining
    const remaining = await prisma.channel.count({
      where: { subscriberCount: 0 },
    });

    return NextResponse.json({
      success: true,
      enriched,
      total: channels.length,
      log,
      remaining,
      hint:
        remaining > 0
          ? `Call this endpoint ${Math.ceil(remaining / 5)} more times to enrich all channels`
          : "All channels enriched!",
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
