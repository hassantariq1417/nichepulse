import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ────────────────────────────────────────────────────────────────
   Channel Discovery — Auto-find new YouTube channels by keyword
   
   Scrapes YouTube search results page for channel IDs, then
   validates each via RSS feed before adding to the database.
   
   Usage: POST /api/ingest/discover
   Body:  { "query": "personal finance tips", "niche": "finance" }
   ──────────────────────────────────────────────────────────────── */

async function searchYouTubeForChannels(
  query: string
): Promise<string[]> {
  try {
    // Fetch YouTube search results page
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAg%3D%3D`;
    // sp=EgIQAg== is the filter for "Channels" type

    const res = await fetch(searchUrl, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) return [];
    const html = await res.text();

    // Extract channel IDs from ytInitialData
    const channelIds = new Set<string>();

    // Pattern 1: channelId in search results JSON
    const idMatches = Array.from(
      html.matchAll(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/g)
    );
    for (const m of idMatches) {
      channelIds.add(m[1]);
    }

    // Pattern 2: /channel/UC... URLs
    const urlMatches = Array.from(
      html.matchAll(/\/channel\/(UC[a-zA-Z0-9_-]{22})/g)
    );
    for (const m of urlMatches) {
      channelIds.add(m[1]);
    }

    return Array.from(channelIds).slice(0, 20); // Max 20 per search
  } catch {
    return [];
  }
}

async function validateChannelViaRSS(channelId: string): Promise<{
  title: string;
  totalViews: number;
  videoCount: number;
  uploadsLast30d: number;
  uploadFrequency: number;
  videos: Array<{
    videoId: string;
    title: string;
    viewCount: number;
    publishedAt: Date;
  }>;
} | null> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(rssUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NichePulse/1.0)" },
    });

    if (!res.ok) return null;
    const xml = await res.text();
    if (!xml.includes("<entry>")) return null;

    const authorMatch = xml.match(/<author>\s*<name>([^<]+)/);
    const title = authorMatch ? authorMatch[1].trim() : "";
    if (!title) return null;

    const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g));
    const thirtyDaysAgo = Date.now() - 30 * 86400000;

    const videos = entries.map((entry) => {
      const e = entry[1];
      return {
        videoId: e.match(/<yt:videoId>([^<]+)/)?.[1] || "",
        title: e.match(/<title>([^<]+)/)?.[1] || "",
        viewCount: parseInt(
          e.match(/<media:statistics\s+views="(\d+)"/)?.[1] || "0"
        ),
        publishedAt: new Date(
          e.match(/<published>([^<]+)/)?.[1] || ""
        ),
      };
    });

    const totalViews = videos.reduce((s, v) => s + v.viewCount, 0);
    const uploadsLast30d = videos.filter(
      (v) => v.publishedAt.getTime() > thirtyDaysAgo
    ).length;

    let uploadFrequency = 30;
    if (videos.length >= 2) {
      const sorted = [...videos].sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
      );
      const gaps: number[] = [];
      for (let i = 0; i < Math.min(sorted.length - 1, 10); i++) {
        const gap =
          (sorted[i].publishedAt.getTime() -
            sorted[i + 1].publishedAt.getTime()) /
          86400000;
        if (gap > 0) gaps.push(gap);
      }
      if (gaps.length > 0)
        uploadFrequency = Math.round(
          gaps.reduce((a, b) => a + b, 0) / gaps.length
        );
    }

    return {
      title,
      totalViews,
      videoCount: videos.length,
      uploadsLast30d,
      uploadFrequency,
      videos,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = body.query as string;
    const niche = body.niche as string;

    if (!query || !niche) {
      return NextResponse.json(
        {
          error: "Missing 'query' and 'niche' in request body",
          example: {
            query: "personal finance tips",
            niche: "finance",
          },
        },
        { status: 400 }
      );
    }

    // Step 1: Search YouTube for channels
    const channelIds = await searchYouTubeForChannels(query);
    if (channelIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No channels found for query: " + query,
      });
    }

    // Step 2: Filter out channels we already have
    const existing = await prisma.channel.findMany({
      where: { youtubeId: { in: channelIds } },
      select: { youtubeId: true },
    });
    const existingIds = new Set(existing.map((c) => c.youtubeId));
    const newIds = channelIds.filter((id) => !existingIds.has(id));

    // Step 3: Ensure niche category exists
    const nicheSlug = niche.toLowerCase().replace(/\s+/g, "-");
    const nicheRecord = await prisma.nicheCategory.upsert({
      where: { slug: nicheSlug },
      create: {
        name: niche
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
        slug: nicheSlug,
        iconEmoji: "🔍",
      },
      update: {},
    });

    // Step 4: Validate and save new channels (max 8 per call)
    const toProcess = newIds.slice(0, 8);
    const log: string[] = [];
    let saved = 0;

    log.push(
      `🔍 Search "${query}" found ${channelIds.length} channels (${existingIds.size} already exist, ${newIds.length} new)`
    );

    for (const channelId of toProcess) {
      try {
        const rssData = await validateChannelViaRSS(channelId);
        if (!rssData) {
          log.push(`⏭️ ${channelId}: RSS validation failed`);
          continue;
        }

        // Skip channels with very few views (likely inactive)
        if (rssData.totalViews < 1000) {
          log.push(
            `⏭️ ${rssData.title}: skipped (${rssData.totalViews} views too low)`
          );
          continue;
        }

        const avgViews =
          rssData.videoCount > 0
            ? rssData.totalViews / rssData.videoCount
            : 0;

        // Calculate score
        const avgViewsPerVideo =
          rssData.totalViews / Math.max(rssData.videoCount, 1);
        const viewVelocity = Math.min(
          (avgViewsPerVideo / 100000) * 100,
          100
        );
        let consistency = 50;
        if (rssData.uploadFrequency <= 1) consistency = 100;
        else if (rssData.uploadFrequency <= 3) consistency = 85;
        else if (rssData.uploadFrequency <= 7) consistency = 70;
        else if (rssData.uploadFrequency <= 14) consistency = 50;
        else if (rssData.uploadFrequency <= 30) consistency = 30;
        const activity = Math.min(rssData.uploadsLast30d * 10, 100);
        let maturity = 50;
        if (rssData.totalViews > 1000000) maturity = 85;
        else if (rssData.totalViews > 100000) maturity = 70;
        const nicheScore = Math.min(
          Math.max(
            Math.round(
              viewVelocity * 0.4 +
                consistency * 0.25 +
                activity * 0.2 +
                maturity * 0.15
            ),
            1
          ),
          100
        );

        // Save channel
        await prisma.channel.create({
          data: {
            youtubeId: channelId,
            title: rssData.title,
            description: `${rssData.title} — discovered via "${query}"`,
            subscriberCount: 0,
            viewCount: BigInt(rssData.totalViews),
            videoCount: rssData.videoCount,
            category: niche
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase()),
            format: "LONG_FORM",
            nicheScore,
            estimatedMonthlyRevenue: Math.round(
              ((avgViews * rssData.uploadsLast30d) / 1000) * 8 * 0.6
            ),
            isOutlier: rssData.videos.some(
              (v) => avgViews > 0 && v.viewCount > avgViews * 3
            ),
            isTrending: rssData.uploadsLast30d >= 10,
            uploadFrequency: rssData.uploadFrequency,
            viewsLast48h: Math.round(rssData.totalViews / 15),
            videosLast30Days: rssData.uploadsLast30d,
            nicheCategoryId: nicheRecord.id,
            lastScrapedAt: new Date(),
          },
        });

        // Save videos
        for (const video of rssData.videos) {
          if (!video.videoId) continue;
          await prisma.videoInsight
            .create({
              data: {
                channelId: (
                  await prisma.channel.findUnique({
                    where: { youtubeId: channelId },
                    select: { id: true },
                  })
                )!.id,
                youtubeVideoId: video.videoId,
                title: video.title,
                viewCount: video.viewCount,
                publishedAt: video.publishedAt,
                isViral: avgViews > 0 && video.viewCount > avgViews * 3,
                thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
              },
            })
            .catch(() => null);
        }

        saved++;
        log.push(
          `✅ ${rssData.title}: ${rssData.totalViews.toLocaleString()} views, score=${nicheScore}`
        );
      } catch (err) {
        log.push(`❌ ${channelId}: ${String(err).slice(0, 100)}`);
      }

      await new Promise((r) => setTimeout(r, 500));
    }

    // Update niche category stats
    const nicheStats = await prisma.channel.aggregate({
      where: { nicheCategoryId: nicheRecord.id },
      _count: true,
      _avg: { nicheScore: true },
    });

    await prisma.nicheCategory.update({
      where: { id: nicheRecord.id },
      data: {
        channelCount: nicheStats._count,
        averageNicheScore: nicheStats._avg.nicheScore || 0,
      },
    });

    return NextResponse.json({
      success: true,
      query,
      niche,
      discovered: channelIds.length,
      alreadyExist: existingIds.size,
      newChannels: newIds.length,
      saved,
      log,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}

/* ── GET — Bulk discover across predefined search terms ────── */

const DISCOVERY_QUERIES: Record<string, string[]> = {
  finance: [
    "personal finance tips 2025",
    "investing for beginners",
    "financial independence retire early",
    "credit card rewards strategy",
    "budgeting tips money management",
  ],
  "ai-tools": [
    "AI tools for productivity",
    "machine learning tutorial",
    "ChatGPT tips and tricks",
    "artificial intelligence explained",
    "AI coding assistant",
  ],
  fitness: [
    "home workout routine",
    "muscle building tips",
    "weight loss transformation",
    "calisthenics for beginners",
    "nutrition and meal prep",
  ],
  business: [
    "how to start a business",
    "entrepreneurship advice",
    "side hustle ideas 2025",
    "online business from home",
    "dropshipping tutorial",
  ],
  "true-crime": [
    "true crime documentary",
    "unsolved mysteries cold case",
    "serial killer documentary",
    "crime investigation",
  ],
  coding: [
    "learn to code beginner",
    "web development tutorial",
    "python programming projects",
    "javascript frameworks 2025",
    "software engineering career",
  ],
  health: [
    "health and wellness tips",
    "nutrition science explained",
    "mental health awareness",
    "sleep optimization",
  ],
  productivity: [
    "productivity system",
    "time management tips",
    "notion setup tutorial",
    "morning routine productive",
  ],
  "travel-hacks": [
    "budget travel tips",
    "travel hacks save money",
    "digital nomad lifestyle",
    "best countries to visit",
  ],
};

export async function GET() {
  try {
    // Pick a random niche to discover
    const niches = Object.keys(DISCOVERY_QUERIES);
    const niche = niches[Math.floor(Math.random() * niches.length)];
    const queries = DISCOVERY_QUERIES[niche];
    const query = queries[Math.floor(Math.random() * queries.length)];

    // Search and discover
    const channelIds = await searchYouTubeForChannels(query);
    const existing = await prisma.channel.findMany({
      where: { youtubeId: { in: channelIds } },
      select: { youtubeId: true },
    });
    const existingIds = new Set(existing.map((c) => c.youtubeId));
    const newIds = channelIds.filter((id) => !existingIds.has(id));

    // Quick validate the first 3 new channels
    const validated: string[] = [];
    for (const id of newIds.slice(0, 3)) {
      const rss = await validateChannelViaRSS(id);
      if (rss && rss.totalViews >= 5000) {
        validated.push(`${rss.title} (${rss.totalViews.toLocaleString()} views)`);
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    return NextResponse.json({
      success: true,
      niche,
      query,
      found: channelIds.length,
      alreadyKnown: existingIds.size,
      newCandidates: newIds.length,
      validated,
      hint: `POST /api/ingest/discover with {"query": "${query}", "niche": "${niche}"} to add these channels`,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
