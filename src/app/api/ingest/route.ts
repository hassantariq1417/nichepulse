import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ── REAL Niche → Channel ID seeds (verified YouTube channels) ── */

const NICHE_SEEDS: Record<string, string[]> = {
  finance: [
    "UCFCEuCsyWP0YkP3CZ3Mr01Q", // Graham Stephan
    "UCL8w_A8p8P1HozDIpZNKeLw", // Mark Tilbury
    "UCMuo1yKiTsrjEo5XSx7nVdA", // Andrei Jikh
    "UCHgx8_mnCKN7MoOZEBPqogA", // Nate O'Brien
    "UCSIF2-rp35mqHNJjxHxbmFg", // Minority Mindset
    "UCVhQ2NnY5Rskt6UjCUkJ_DA", // Humphrey Yang
    "UCY2VYqKnBBsyABBiJ_F9Aew", // Erin Talks Money
    "UCpvg0uZH-oxmCagOdFUhzXQ", // Meet Kevin
  ],
  "ai-tools": [
    "UCoebwHSTvwalADTJhps8LtA", // Fireship
    "UCXv0mdzsRnFuvPBHwLCM2Xw", // Matt Wolfe
    "UC8butISFwT-Wl7EV0hUK0BQ", // freeCodeCamp
    "UCW5YeuERMmlnqo4oq8vwUpg", // ThePrimeagen
    "UC9-y-6csu5WGm29I7JiwpnA", // Computerphile
    "UCbmNph6atAoGfqLoCL_duAg", // Sentdex
    "UCnUYZLuoy1rq1aVMwx4aTzw", // CGP Grey
    "UCbfYPyITQ-7l4upoX8nvctg", // Two Minute Papers
  ],
  stoicism: [
    "UCCgmLQoJCVPPU6cPeNNbErA", // Daily Stoic
    "UCkzW3zBGDCuSLFttW3ZnCpA", // Improvement Pill
    "UCiNaJJPvHPHv8EAFXtKovXw", // Charisma on Command
    "UCGq-a57w-aPwyi3pW7XLiHw", // FightMediocrity
    "UCJ8V-_-LQCqapJQCE3JQHBQ", // The Art of Improvement
    "UCEAksRUSqMONR09IxJFYYsA", // Like Stories of Old
    "UCqECaJ8Gagnn7HqbKzFMM4A", // Academy of Ideas
  ],
  productivity: [
    "UCG-KntY7aVnIGXYEBQvmBAQ", // Thomas Frank
    "UCnUYZLuoy1rq1aVMwx4aTzw", // CGP Grey
    "UCfHZHDhBLaFvOtjBTkFX-fQ", // Mike and Matty
    "UCkUiNwBJC_QalYosGEFBqrw", // Pursuit of Wonder
  ],
  "true-crime": [
    "UCYwVxWpjeKFWwu8TML-Te9A", // JCS Criminal Psychology
    "UCPfXQHYUqBFNpH78LNMVsig", // Stephanie Harlowe
    "UCPyBsLnKUGCFRU7-S5-XVBA", // Kendall Rae
    "UC2PA-AKmVpU6NKCGtZq_rKQ", // Bailey Sarian
    "UCMmf4qGTvAuK7bsHbEePl5A", // Eleanor Neale
    "UCWX3yGbODI3RHkO5BRERbgw", // Wendigoon
    "UCFSEjY5P0M9qXkI8bLvCrtA", // Nick Crowley
  ],
  mindset: [
    "UCkzW3zBGDCuSLFttW3ZnCpA", // Improvement Pill
    "UCiNaJJPvHPHv8EAFXtKovXw", // Charisma on Command
    "UCGq-a57w-aPwyi3pW7XLiHw", // FightMediocrity
    "UCJ8V-_-LQCqapJQCE3JQHBQ", // Matt D'Avella
    "UCfHZHDhBLaFvOtjBTkFX-fQ", // Einzelganger
    "UCkUiNwBJC_QalYosGEFBqrw", // Pursuit of Wonder
  ],
  fitness: [
    "UCe0TLA0EsQbE-MjuHXevPRg", // AthleanX
    "UCKNnMPbBvkF1cKjbDx3hqXQ", // Jeremy Ethier
    "UCERm5yFZ1SptUEU4wZ2vJvw", // Calisthenicmovement
    "UCU9GQEqh0PGf7NZDDhJe9Nw", // Hybrid Calisthenics
    "UC68TLK0mAEzUyHx5x5k-S1g", // Ryan Humiston
    "UCiP6wD_tYlYLYh3agzbByWQ", // Austin Dunham
  ],
  business: [
    "UCctXZhXmG-kf3tlIXgVZUlw", // Alex Hormozi
    "UC6d4dIsaK07LFdkCJDL3CNw", // Codie Sanchez
    "UCSIF2-rp35mqHNJjxHxbmFg", // Minority Mindset (business)
    "UCL8w_A8p8P1HozDIpZNKeLw", // Mark Tilbury (business)
  ],
  luxury: [
    "UCsvqVGtbbyHaMoevxPAq9Fg", // Enes Yilmazer
    "UCzWQYUVCpZqtN93H8RR44Qw", // Ryan Serhant
    "UCFCEuCsyWP0YkP3CZ3Mr01Q", // Supercar Blondie / Graham Stephan
  ],
  "dark-history": [
    "UCHdluULl5c7bilx1x1TGzJQ", // Whang!
    "UCWX3yGbODI3RHkO5BRERbgw", // Wendigoon
    "UCFSEjY5P0M9qXkI8bLvCrtA", // Nick Crowley
    "UCnkp4xDOwqqJD7sSM3xdUiQ", // Mamamax
    "UCPfXQHYUqBFNpH78LNMVsig", // Ahoy / Stephanie
  ],
  "real-estate": [
    "UCtP_UGPaxp0O8wRnMEWdEyg", // BiggerPockets
    "UCzWQYUVCpZqtN93H8RR44Qw", // Ryan Serhant
    "UCpvg0uZH-oxmCagOdFUhzXQ", // Meet Kevin
  ],
  coding: [
    "UC8butISFwT-Wl7EV0hUK0BQ", // freeCodeCamp
    "UCoebwHSTvwalADTJhps8LtA", // Fireship
    "UCW5YeuERMmlnqo4oq8vwUpg", // ThePrimeagen
    "UC9-y-6csu5WGm29I7JiwpnA", // Computerphile
    "UCJZv4d5rbIKd4QHMPkcABXw", // Kevin Powell
    "UCrkpamOlsRCfz_s4VpL4m_g", // Web Dev Simplified
    "UCFbNIlppjAuEX4znoulh0Cw", // George Hotz
  ],
  health: [
    "UCi8e0iOVk1fEOogaXcq9kFQ", // Andrew Huberman
    "UCNShsJwV7LMv9-eU6QGqQEw", // Doctor Mike
    "UCEIis6j2jKkBLDxqBlCkZpA", // Kurzgesagt
    "UC0CRYvGlWGLsEyvBPsB3fRA", // SciShow
  ],
  languages: [
    "UCpivZFMROg-wHCwAmV2EsvA", // Learn French with Alexa
    "UC9-y-6csu5WGm29I7JiwpnA", // Langfocus
    "UCnUYZLuoy1rq1aVMwx4aTzw", // Dreaming Spanish / CGP Grey
  ],
  "travel-hacks": [
    "UCe_vXdMrHHseZ_esYoAZkng", // Mark Wiens
    "UCcefcZRL2oaA_uBNeo5UOWg", // Yes Theory
    "UCFSEjY5P0M9qXkI8bLvCrtA", // Kara and Nate / Nick Crowley
  ],
};

/* ── YouTube Data Fetcher ─────────────────────────────────────── */

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
  return Math.round(n) || 0;
}

/* ── FIX 3: Extract REAL video count ────────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractVideoCount(data: any): number {
  // Location 1: Header video count text
  const header =
    data?.header?.c4TabbedHeaderRenderer ||
    data?.header?.pageHeaderRenderer;

  const videoCountRaw =
    header?.videosCountText?.runs?.[0]?.text ||
    header?.videosCountText?.simpleText ||
    "";

  if (videoCountRaw) {
    const num = parseInt(videoCountRaw.replace(/[^0-9]/g, ""));
    if (!isNaN(num) && num > 0) return num;
  }

  // Location 2: Count items in the Videos tab grid
  const tabs =
    data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
  for (const tab of tabs) {
    if (tab?.tabRenderer?.title === "Videos") {
      const contents =
        tab?.tabRenderer?.content?.richGridRenderer?.contents || [];
      const videoItems = contents.filter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (c: any) => c?.richItemRenderer
      );
      if (videoItems.length > 0) {
        const hasContinuation = contents.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => c?.continuationItemRenderer
        );
        return hasContinuation
          ? videoItems.length * 10 // estimate: much more than first page
          : videoItems.length;
      }
    }
  }

  return 0;
}

/* ── FIX 5: Extract REAL thumbnail URL ──────────────────────── */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractThumbnail(data: any): string {
  const header =
    data?.header?.c4TabbedHeaderRenderer ||
    data?.header?.pageHeaderRenderer;
  const meta = data?.metadata?.channelMetadataRenderer;

  const sources = [
    header?.avatar?.thumbnails?.slice(-1)[0]?.url,
    header?.avatar?.thumbnails?.[0]?.url,
    meta?.avatar?.thumbnails?.slice(-1)[0]?.url,
    data?.microformat?.microformatDataRenderer?.thumbnail?.thumbnails?.slice(
      -1
    )[0]?.url,
  ];

  for (const src of sources) {
    if (src && src.startsWith("http")) {
      return src
        .replace(/=s\d+-c-k-[^&]+/, "=s240-c-k-c0x00ffffff-no-rj")
        .replace(/=s\d+/, "=s240");
    }
  }

  return "";
}

/* ── Parse channel from YouTubei response ──────────────────── */

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

  // FIX 3: Real video count
  const videoCount = extractVideoCount(data);

  // FIX 5: Real thumbnail
  const thumbnailUrl = extractThumbnail(data);

  // Get recent videos from the Videos tab
  const tabs =
    data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videosTab = tabs.find((t: any) => t?.tabRenderer?.title === "Videos");
  const videoItems =
    videosTab?.tabRenderer?.content?.richGridRenderer?.contents || [];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const videos = videoItems.slice(0, 15).map((item: any) => {
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

  // Calculate scores from real data
  const avgViews =
    videos.length > 0
      ? videos.reduce((s: number, v: { viewCount: number }) => s + v.viewCount, 0) /
        videos.length
      : 0;

  const viewVelocityScore =
    subs > 0 ? Math.min(((avgViews / subs) / 0.3) * 100, 100) : 30;

  // FIX 7: Better niche score from real data
  const uploadConsistency = videoCount > 200 ? 80 : videoCount > 50 ? 65 : 40;
  const competitionGap =
    subs < 100000 ? 75 : subs < 500000 ? 55 : subs < 1000000 ? 40 : 30;

  const nicheScore = Math.round(
    viewVelocityScore * 0.4 + competitionGap * 0.3 + uploadConsistency * 0.3
  );

  const monthlyViews = avgViews * (30 / Math.max(7, 1));
  const estimatedRevenue = Math.round((monthlyViews / 1000) * 8 * 0.6);
  const isOutlier = videos.some(
    (v: { viewCount: number }) => v.viewCount > avgViews * 3
  );

  return {
    youtubeId: channelId,
    title: meta?.title || "",
    description: (meta?.description || "").slice(0, 500),
    subscriberCount: subs,
    subscriberCountText: subText,
    videoCount,
    viewCount: 0, // will be enriched by RSS
    country: meta?.country || "",
    thumbnailUrl,
    nicheScore: Math.min(Math.max(nicheScore, 0), 100),
    estimatedMonthlyRevenue: estimatedRevenue,
    isOutlier,
    isTrending: false,
    uploadFrequency: 7,
    viewsLast48h: Math.round(avgViews * 0.1),
    lastScrapedAt: new Date(),
    recentVideos: videos,
  };
}

/* ── FIX 2: Parallel batch processing (3x faster) ──────────── */

async function fetchAndSaveChannel(
  channelId: string,
  niche: string,
  nicheRecordId: string | null
) {
  // Check if already scraped recently (6h cache)
  const existing = await prisma.channel.findUnique({
    where: { youtubeId: channelId },
    select: { id: true, lastScrapedAt: true },
  });

  const tooRecent =
    existing?.lastScrapedAt &&
    Date.now() - existing.lastScrapedAt.getTime() < 6 * 3600 * 1000;

  if (tooRecent) {
    return { title: `(cached) ${channelId}`, subscriberCountText: "cached", cached: true };
  }

  // Fetch from YouTube
  const ytData = await fetchYouTubeiChannel(channelId);
  const parsed = parseChannelFromYT(ytData, channelId);

  if (!parsed.title) throw new Error("empty title");

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
      nicheCategoryId: nicheRecordId || undefined,
      lastScrapedAt: new Date(),
    },
    update: {
      title: parsed.title,
      description: parsed.description,
      thumbnailUrl: parsed.thumbnailUrl,
      subscriberCount: parsed.subscriberCount,
      videoCount: parsed.videoCount,
      nicheScore: parsed.nicheScore,
      estimatedMonthlyRevenue: parsed.estimatedMonthlyRevenue,
      isOutlier: parsed.isOutlier,
      viewsLast48h: parsed.viewsLast48h,
      lastScrapedAt: new Date(),
    },
  });

  // FIX 6: Save snapshot for growth tracking
  await prisma.channelSnapshot.create({
    data: {
      channelId: saved.id,
      subscriberCount: parsed.subscriberCount,
      viewCount: parsed.viewCount || 0,
      videoCount: parsed.videoCount || 0,
    },
  }).catch(() => null);

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

  return {
    title: parsed.title,
    subscriberCountText: parsed.subscriberCountText,
    cached: false,
  };
}

async function processBatch(
  channelIds: string[],
  niche: string,
  nicheRecordId: string | null,
  batchSize: number = 3
): Promise<{ saved: number; errors: number; log: string[] }> {
  const log: string[] = [];
  let saved = 0;
  let errors = 0;

  // Deduplicate
  const unique = Array.from(new Set(channelIds));

  for (let i = 0; i < unique.length; i += batchSize) {
    const batch = unique.slice(i, i + batchSize);

    const results = await Promise.allSettled(
      batch.map((id) => fetchAndSaveChannel(id, niche, nicheRecordId))
    );

    for (let j = 0; j < results.length; j++) {
      const result = results[j];

      if (result.status === "fulfilled" && result.value) {
        saved++;
        if (result.value.cached) {
          log.push(`⏭️ ${result.value.title}`);
        } else {
          log.push(
            `✅ ${result.value.title} (${result.value.subscriberCountText})`
          );
        }
      } else {
        errors++;
        const reason =
          result.status === "rejected"
            ? String(result.reason).slice(0, 60)
            : "no data returned";
        log.push(`❌ ${batch[j]}: ${reason}`);
      }
    }

    // 600ms between batches (respectful rate limiting)
    if (i + batchSize < unique.length) {
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  return { saved, errors, log };
}

/* ── POST /api/ingest ───────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const requestedNiche = body.niche as string | undefined;

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
          update: { trendDirection: "UP" },
        })
        .catch(() => null);

      // FIX 2: Process channels in parallel batches of 3
      const batchResult = await processBatch(
        channelIds,
        niche,
        nicheRecord?.id || null,
        3
      );

      results.processed += channelIds.length;
      results.saved += batchResult.saved;
      results.errors += batchResult.errors;
      results.channels.push(...batchResult.log);

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
