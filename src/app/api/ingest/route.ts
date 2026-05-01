import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/* ── Niche → Channel ID seeds ──────────────────────────────── */

const NICHE_SEEDS: Record<string, string[]> = {
  finance: [
    "UCFCEuCsyWP0YkP3CZ3Mr01Q", // Graham Stephan
    "UCL8w_A8p8P1HozDIpZNKeLw", // Mark Tilbury
    "UCMuo1yKiTsrjEo5XSx7nVdA", // Andrei Jikh
    "UCSIF2-rp35mqHNJjxHxbmFg", // Minority Mindset
    "UCHgx8_mnCKN7MoOZEBPqogA", // Nate O'Brien
  ],
  "ai-tools": [
    "UCVhQ2NnY5Rskt6UjCUkJ_DA", // Two Minute Papers
    "UC9-y-6csu5WGm29I7JiwpnA", // Computerphile
    "UCbmNph6atAoGfqLoCL_duAg", // Sentdex
  ],
  stoicism: [
    "UCCgmLQoJCVPPU6cPeNNbErA", // Daily Stoic
    "UCEAksRUSqMONR09IxJFYYsA", // Ryan Holiday
  ],
  productivity: [
    "UCG-KntY7aVnIGXYEBQvmBAQ", // Thomas Frank
    "UCnUYZLuoy1rq1aVMwx4aTzw", // CGP Grey
  ],
  "true-crime": [
    "UCFdTiwkHNBHiYEBROFVQd_A", // JCS Criminal Psychology
    "UCPfXQHYUqBFNpH78LNMVsig", // Stephanie Harlowe
  ],
  mindset: [
    "UCkzW3zBGDCuSLFttW3ZnCpA", // Improvement Pill
    "UCiNaJJPvHPHv8EAFXtKovXw", // Charisma on Command
  ],
  fitness: [
    "UCe0TLA0EsQbE-MjuHXevPRg", // AthleanX
    "UCKNnMPbBvkF1cKjbDx3hqXQ", // Jeremy Ethier
  ],
  business: [
    "UCctXZhXmG-kf3tlIXgVZUlw", // Alex Hormozi
    "UCpvg0uZH-oxmCagOdFUhzXQ", // My First Million
  ],
  luxury: [
    "UCsvqVGtbbyHaMoevxPAq9Fg", // Enes Yilmazer
    "UCzWQYUVCpZqtN93H8RR44Qw", // Ryan Serhant
  ],
  "dark-history": [
    "UCHdluULl5c7bilx1x1TGzJQ", // Whang!
    "UCWX3yGbODI3RHkO5BRERbgw", // Wendigoon
  ],
  "real-estate": [
    "UCpvg0uZH-oxmCagOdFUhzXQ", // Meet Kevin
    "UCtP_UGPaxp0O8wRnMEWdEyg", // BiggerPockets
  ],
  coding: [
    "UCW5YeuERMmlnqo4oq8vwUpg", // The Primeagen
    "UC8butISFwT-Wl7EV0hUK0BQ", // freeCodeCamp
    "UCoebwHSTvwalADTJhps8LtA", // Fireship
  ],
  health: [
    "UC0CRYvGlWGLsEyvBPsB3fRA", // SciShow
    "UCEIis6j2jKkBLDxqBlCkZpA", // Kurzgesagt
  ],
  languages: [
    "UCmHkYTcxRkjR7CBXRJV5ZnQ", // Learn French
    "UCVgO39Bk5sMo66-6o6Spn6Q", // SpanishPod101
  ],
  "travel-hacks": [
    "UCe_vXdMrHHseZ_esYoAZkng", // Mark Wiens
    "UCcefcZRL2oaA_uBNeo5UOWg", // Yes Theory
  ],
};

/* ── YouTube Data Fetcher ──────────────────────────────────── */

async function fetchYouTubeiChannel(channelId: string) {
  const res = await fetch("https://www.youtube.com/youtubei/v1/browse", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      "X-YouTube-Client-Name": "1",
      "X-YouTube-Client-Version": "2.20231121.00.00",
    },
    body: JSON.stringify({
      browseId: channelId,
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20231121.00.00",
          hl: "en",
          gl: "US",
        },
      },
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`YouTube ${res.status}`);
  return res.json();
}

function parseSubscribers(text: string): number {
  if (!text) return 0;
  const n = parseFloat(text.replace(/[^0-9.]/g, ""));
  if (/b/i.test(text)) return Math.round(n * 1e9);
  if (/m/i.test(text)) return Math.round(n * 1e6);
  if (/k/i.test(text)) return Math.round(n * 1e3);
  return Math.round(n);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseChannelFromYT(data: any, channelId: string) {
  const meta = data?.metadata?.channelMetadataRenderer;
  const header =
    data?.header?.c4TabbedHeaderRenderer || data?.header?.pageHeaderRenderer;

  const subText =
    header?.subscriberCountText?.simpleText ||
    header?.subscriberCountText?.runs?.[0]?.text ||
    "0";

  const subs = parseSubscribers(subText);

  // Get recent videos from the Videos tab
  const tabs =
    data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
  const videosTab = tabs.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (t: any) => t?.tabRenderer?.title === "Videos"
  );
  const videoItems =
    videosTab?.tabRenderer?.content?.richGridRenderer?.contents || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videos = videoItems.slice(0, 10).map((item: any) => {
      const v = item?.richItemRenderer?.content?.videoRenderer;
      if (!v) return null;
      const viewText = v?.viewCountText?.simpleText || "0";
      const views = parseInt(viewText.replace(/[^0-9]/g, "")) || 0;
      return {
        videoId: v.videoId || "",
        title: v?.title?.runs?.[0]?.text || "",
        viewCount: views,
        publishedTimeText: v?.publishedTimeText?.simpleText || "",
        thumbnailUrl: v?.thumbnail?.thumbnails?.slice(-1)[0]?.url || "",
      };
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter(Boolean) as any[];

  // Calculate niche score
  const avgViews =
    videos.length > 0
      ? videos.reduce((s: number, v: { viewCount: number }) => s + v.viewCount, 0) / videos.length
      : 0;

  const viewVelocityScore =
    subs > 0
      ? Math.min(((avgViews / subs) / 0.3) * 100, 100)
      : 30;

  const nicheScore = Math.round(
    viewVelocityScore * 0.4 +
      (subs < 100000 ? 75 : subs < 1000000 ? 60 : 40) * 0.3 +
      65 * 0.3
  );

  // Estimate monthly revenue
  const monthlyViews = avgViews * 12;
  const estimatedRevenue = Math.round((monthlyViews / 1000) * 8 * 0.6);

  return {
    youtubeId: channelId,
    title: meta?.title || "",
    handle:
      meta?.vanityChannelUrl?.replace("http://www.youtube.com/", "") || "",
    description: (meta?.description || "").slice(0, 500),
    subscriberCount: subs,
    subscriberCountText: subText,
    videoCount: 0,
    viewCount: 0,
    country: meta?.country || "",
    keywords: (meta?.keywords || "")
      .split(",")
      .slice(0, 10)
      .map((k: string) => k.trim()),
    thumbnailUrl:
      header?.avatar?.thumbnails?.slice(-1)[0]?.url ||
      meta?.avatar?.thumbnails?.slice(-1)[0]?.url ||
      "",
    nicheScore: Math.min(Math.max(nicheScore, 0), 100),
    estimatedMonthlyRevenue: estimatedRevenue,
    isOutlier: viewVelocityScore > 70,
    isTrending: false,
    uploadFrequency: 7,
    viewsLast48h: Math.round(avgViews * 0.1),
    lastScrapedAt: new Date(),
    recentVideos: videos,
  };
}

/* ── POST /api/ingest ──────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedNiche = body.niche as string | undefined;
    const limit = Math.min(body.limit || 999, 999);

    const nichesToProcess = requestedNiche
      ? { [requestedNiche]: NICHE_SEEDS[requestedNiche] || [] }
      : NICHE_SEEDS;

    const results = {
      processed: 0,
      saved: 0,
      errors: 0,
      channels: [] as string[],
    };

    for (const [niche, channelIds] of Object.entries(nichesToProcess)) {
      if (!channelIds || channelIds.length === 0) {
        results.channels.push(`⚠️ ${niche}: no seed channels`);
        continue;
      }

      // Upsert the niche category
      const nicheRecord = await prisma.nicheCategory
        .upsert({
          where: { slug: niche },
          create: {
            name: niche
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            slug: niche,
            description: `${niche} niche channels`,
            competitionLevel: "MEDIUM",
            trendDirection: "UP",
            estimatedCPM: 8,
          },
          update: {
            trendDirection: "UP",
          },
        })
        .catch(() => null);

      // Process channels for this niche
      for (const channelId of channelIds.slice(0, limit)) {
        results.processed++;
        try {
          // Check if already scraped recently (6h cache)
          const existing = await prisma.channel.findUnique({
            where: { youtubeId: channelId },
            select: { lastScrapedAt: true },
          });

          const tooRecent =
            existing?.lastScrapedAt &&
            Date.now() - existing.lastScrapedAt.getTime() < 6 * 3600 * 1000;

          if (tooRecent) {
            results.channels.push(`${channelId} (cached)`);
            results.saved++;
            continue;
          }

          // Fetch from YouTube
          const ytData = await fetchYouTubeiChannel(channelId);
          const parsed = parseChannelFromYT(ytData, channelId);

          if (!parsed.title) {
            results.errors++;
            results.channels.push(`❌ ${channelId}: empty title`);
            continue;
          }

          // Save to DB
          const saved = await prisma.channel.upsert({
            where: { youtubeId: channelId },
            create: {
              youtubeId: parsed.youtubeId,
              title: parsed.title,
              description: parsed.description,
              thumbnailUrl: parsed.thumbnailUrl,
              subscriberCount: parsed.subscriberCount,
              viewCount: BigInt(parsed.viewCount),
              videoCount: parsed.videoCount,
              category: niche
                .replace(/[-_]/g, " ")
                .replace(/\b\w/g, (l) => l.toUpperCase()),
              format: "LONG_FORM",
              nicheScore: parsed.nicheScore,
              estimatedMonthlyRevenue: parsed.estimatedMonthlyRevenue,
              isOutlier: parsed.isOutlier,
              isTrending: false,
              uploadFrequency: parsed.uploadFrequency,
              viewsLast48h: parsed.viewsLast48h,
              country: parsed.country,
              nicheCategoryId: nicheRecord?.id || undefined,
              lastScrapedAt: new Date(),
            },
            update: {
              title: parsed.title,
              description: parsed.description,
              thumbnailUrl: parsed.thumbnailUrl,
              subscriberCount: parsed.subscriberCount,
              nicheScore: parsed.nicheScore,
              estimatedMonthlyRevenue: parsed.estimatedMonthlyRevenue,
              isOutlier: parsed.isOutlier,
              viewsLast48h: parsed.viewsLast48h,
              lastScrapedAt: new Date(),
            },
          });

          // Save videos
          for (const video of parsed.recentVideos) {
            if (!video.videoId) continue;
            await prisma.videoInsight
              .upsert({
                where: { youtubeVideoId: video.videoId },
                create: {
                  channelId: saved.id,
                  youtubeVideoId: video.videoId,
                  title: video.title,
                  viewCount: video.viewCount,
                  publishedAt: new Date(),
                  isViral: video.viewCount > parsed.subscriberCount * 0.5,
                  thumbnail: video.thumbnailUrl,
                },
                update: {
                  viewCount: video.viewCount,
                },
              })
              .catch(() => null);
          }

          results.saved++;
          results.channels.push(
            `✅ ${parsed.title} (${parsed.subscriberCountText})`
          );

          // Respectful delay — 400ms between channels
          await new Promise((r) => setTimeout(r, 400));
        } catch (err) {
          results.errors++;
          results.channels.push(
            `❌ ${channelId}: ${String(err).slice(0, 80)}`
          );
        }
      }

      // Update niche category stats
      if (nicheRecord) {
        const nicheChannels = await prisma.channel.findMany({
          where: { nicheCategoryId: nicheRecord.id },
          select: { nicheScore: true },
        });
        const avgScore =
          nicheChannels.length > 0
            ? nicheChannels.reduce((sum, c) => sum + c.nicheScore, 0) /
              nicheChannels.length
            : 0;
        await prisma.nicheCategory
          .update({
            where: { id: nicheRecord.id },
            data: {
              channelCount: nicheChannels.length,
              averageNicheScore: parseFloat(avgScore.toFixed(1)),
            },
          })
          .catch(() => null);
      }
    }

    return NextResponse.json({
      success: true,
      ...results,
      message: `Processed ${results.processed} channels, saved ${results.saved}, errors ${results.errors}`,
    });
  } catch (err) {
    console.error("Ingest error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
