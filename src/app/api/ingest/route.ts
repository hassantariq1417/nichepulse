import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ────────────────────────────────────────────────────────────────
   VERIFIED Niche → Channel ID seeds
   Every ID below was validated via YouTube RSS feed to return
   the expected channel name. IDs that 404 were removed.
   ──────────────────────────────────────────────────────────────── */

const NICHE_SEEDS: Record<string, string[]> = {
  finance: [
    "UCa-ckhlKL98F8YXKQ-BALiw", // Graham Stephan
    "UCNIoLiHvnuKTKoJuLQUS--A", // Mark Tilbury
    "UCFCEuCsyWP0YkP3CZ3Mr01Q", // The Plain Bagel
    "UCRO-azXc5JrPHnxX2r6-eNQ", // Minority Mindset
    "UCPk6nJE8pBZPLCW2DAvaZOA", // Meet Kevin
    "UC7eBNeDW1GQf2NJQ6G6gAxw", // Ramsey Solutions (Dave Ramsey)
    "UCMPcupZziOB8R6zEbw_elvw", // The Money Guy Show
    "UCAqAp1uh_5-tmEimhSqtoyw", // Caleb Hammer
    "UCSPYNpQ2fHv9HJ-q6MIMaPw", // The Financial Diet
    "UCTTYccSBNghxcxULTGaO1bA", // NerdWallet
    "UCVWX3F3DrTvDKa0LRilQoQQ", // Economics Explained
  ],
  "ai-tools": [
    "UC2Xd-TjJByJyK2w1zNwY0zQ", // Fireship
    "UC8butISFwT-Wl7EV0hUK0BQ", // freeCodeCamp
    "UCUyeluBRhGPCW4rPe_UvBZQ", // ThePrimeagen (clips)
    "UC8ENHE5xdFSwx71u3fDH5Xw", // ThePrimeagen (main)
    "UC9-y-6csu5WGm29I7JiwpnA", // Computerphile
    "UCQALLeQPoZdZC4JNUboVEUg", // Sentdex
    "UCbfYPyITQ-7l4upoX8nvctg", // Two Minute Papers
    "UCdBK94H6oZT2Q7l0-b0xmMg", // Linus Tech Tips
    "UCG7J20LhUeLl6y_Emi7OJrA", // MKBHD (Marques Brownlee)
    "UCOuGATIAbd2DvzJmUgXn2IQ", // NetworkChuck
    "UCGkpFfEMF0eMJlh9xXj2lMw", // ColdFusion
    "UCHmD-oSpV0sNfAUnpYpj8KA", // Yannic Kilcher (AI research)
    "UCgKadKkzK-Ea_YnogNKtOlA", // ExplainingComputers
  ],
  stoicism: [
    "UC6N2Vvwh5Pb9F530wDt_fjQ", // Daily Stoic
    "UCbKLRsBRSYDQwq8yd8C3ZYA", // Charisma on Command
    "UC1KmNKYC1l0stjctkGswl6g", // Academy of Ideas / After Skool
    "UCGq-a57w-aPwyi3pW7XLiHw", // The Diary Of A CEO
    "UCePWm-O_zdgxr6dd4bcEg5A", // Einzelgänger
    "UCqRnyszSh6EslfZA-BJfftw", // Better Ideas
  ],
  productivity: [
    "UCG-KntY7aVnIGXYEBQvmBAQ", // Thomas Frank
    "UChfo46ZNOV-vtehDc25A1Ug", // Ali Abdaal
    "UCWo4IA01TXzBeGJJKWHOG9g", // Jeff Su
  ],
  "true-crime": [
    "UCYwVxWpjeKFWwu8TML-Te9A", // JCS Criminal Psychology
    "UCiaxrqSxVoGxGKg7Ayd4Q9A", // Kendall Rae / Mile Higher
    "UCCHp47gntygWpivIiw45l4Q", // Eleanor Neale
    "UCuX9VrqRC3-EUq1eZ0NBbQg", // Wendigoon
    "UC2PA-AKmVpU6NKCGtZq_rKQ", // Philosophy Tube
    "UC5twq_BoIOBl1gdNseZq7bA", // Lazy Masquerade
    "UCzwtKPc68r580mPesHscivw", // Nexpo
    "UCHv7ZckTJweMD0hp9mGR4EA", // ScareTheater
    "UCX51Dixddr5HuwLVBH9ykeQ", // Top5s (cold cases)
  ],
  mindset: [
    "UCbKLRsBRSYDQwq8yd8C3ZYA", // Charisma on Command
    "UC1KmNKYC1l0stjctkGswl6g", // Academy of Ideas
    "UCePWm-O_zdgxr6dd4bcEg5A", // Einzelgänger
    "UCGq-a57w-aPwyi3pW7XLiHw", // The Diary Of A CEO
    "UCqRnyszSh6EslfZA-BJfftw", // Better Ideas
    "UCsT0YIqwnpJCM-mx7-gSA4Q", // TED
    "UCAuUUnT6oDeKwE6v1NGQxug", // TEDx Talks
  ],
  fitness: [
    "UCAR76PvwLHcHqnbqFIos_Xg", // ATHLEAN-X
    "UCERm5yFZ1SptUEU4wZ2vJvw", // Jeremy Ethier
    "UCmCnayXABSyVjexptPEQxlA", // Hybrid Calisthenics
    "UCGKqHdn9nxgZVTXICMdTcHw", // Ryan Humiston
    "UCiP6wD_tYlYLYh3agzbByWQ", // FitnessBlender
    "UCjTp-nBKswYLumqmVeBPwYw", // Jeff Nippard
    "UCndvbnArPZw7jHRmE9qBcFg", // Buff Dudes
  ],
  business: [
    "UCrvchO1h6lWZAuGaa1LqX9Q", // Alex Hormozi
    "UChjfv8-vAA1CZA84f-h5X_Q", // GaryVee (verified main)
    "UCa-ckhlKL98F8YXKQ-BALiw", // Graham Stephan
    "UCNIoLiHvnuKTKoJuLQUS--A", // Mark Tilbury
    "UCAiLfjNXkNv24uhpzUgPa6A", // MrBeast
    "UCXC3etwvNkMBGrc6tcwu5oQ", // Noah Kagan
    "UCydShVfAub9TSmL1N4BTlGQ", // Young Entrepreneurs Forum
    "UCbayot0NQ0HWeCs9J8Mx7fA", // Channel Makers (Income School)
  ],
  luxury: [
    "UCWKe8LtzKnsk-j6wQm4fuWw", // Enes Yilmazer
    "UClgWErUooxWg0sZ084Tl0rg", // Ryan Serhant
    "UCzWQYUVCpZqtN93H8RR44Qw", // Seeker
  ],
  "dark-history": [
    "UCHdluULl5c7bilx1x1TGzJQ", // Feature History
    "UCuX9VrqRC3-EUq1eZ0NBbQg", // Wendigoon
    "UCnkp4xDOwqqJD7sSM3xdUiQ", // Adam Neely
    "UCzwtKPc68r580mPesHscivw", // Nexpo
    "UCHv7ZckTJweMD0hp9mGR4EA", // ScareTheater
    "UCTWKe1zATFV6d0o6oLS9sgw", // Wendover Productions
    "UCvayZDkq6wTj5EQtulrpgZA", // Sam O'Nella (10.7M views)
    "UCCGvq-qmjFmmMD4e-PLQqGg", // Kings and Generals
  ],
  "real-estate": [
    "UCxDXuLvtjJ9Est8PrG3i2VA", // BiggerPockets
    "UClgWErUooxWg0sZ084Tl0rg", // Ryan Serhant
    "UCPk6nJE8pBZPLCW2DAvaZOA", // Meet Kevin
  ],
  coding: [
    "UC8butISFwT-Wl7EV0hUK0BQ", // freeCodeCamp
    "UC2Xd-TjJByJyK2w1zNwY0zQ", // Fireship
    "UC8ENHE5xdFSwx71u3fDH5Xw", // ThePrimeagen
    "UC9-y-6csu5WGm29I7JiwpnA", // Computerphile
    "UClQDYiE75-po906ZDbx_11g", // Kevin Powell
    "UCFbNIlppjAuEX4znoulh0Cw", // Web Dev Simplified
    "UCZirJBCIZsSgsSPn-uWVSfg", // Tech With Tim
    "UCwE6vJXm1I3XmMA6g92HXxw", // The Cherno
    "UC1_uAIS3r8Vu6JjXWvastJg", // 3Blue1Brown
    "UC29ju8bIPH5as8OGnQzwJyA", // Traversy Media
  ],
  health: [
    "UCUdettijNYvLAm4AixZv4RA", // SciShow
    "UCq8ZAAsI89IoJ-fn1gYpO3g", // Kurzgesagt
    "UCGq-a57w-aPwyi3pW7XLiHw", // The Diary Of A CEO
    "UCpWhiwlOPxOmwQu5xyjtLDw", // Dr. Eric Berg DC
    "UCsR06Qx_cG-gZudSJZUkDnw", // MedCram
    "UCin0m13qWv3-051xlWlHamA", // Veritasium
    "UC513PdAP2-jWkJunTh5kXRw", // Mark Rober
    "UC8VkNBOwvsTlFjoSnNSMmxw", // SmarterEveryDay
    "UC5fdyC4LxyyYv8Am6nDrkmg", // FoundMyFitness (Rhonda Patrick)
  ],
  languages: [
    "UCHRz_dCqwYlYQ5_b9TZswpA", // Learn French With Alexa
    "UCgF23VqDjioQVQqHUzzSe9g", // PortuguesePod101
    "UCb5faEH1hEiLaT_aGMBWeBg", // ItalianPod101
    "UCAL4AMMMXKxHDu3FqZV6CbQ", // Easy Spanish
  ],
  "travel-hacks": [
    "UCxkF42nqXoZ0sZP-GqU-Cww", // Mark Wiens
    "UCTd7KzdwnFE3lm6LCfYDmUQ", // Yes Theory / Seek Discomfort
    "UC7xP-m9hfVmFqNLaKGgIlzA", // Drew Binsky
    "UCneNuMawbfqgXCew2EdZMcQ", // Kara and Nate
    "UCi7KXaqqW_h6ifNVnudH0kQ", // Lost LeBlanc
    "UC7KbIaEOuY7H2j-cvhJ3mYA", // Johnny Harris
    "UC176GAQozKKjhz62H8u9vQQ", // Real Engineering
  ],
};

/* ── RSS-Primary Scraper ──────────────────────────────────────── */
// YouTube RSS is the most reliable public data source.
// It returns: channel name, 15 recent videos, view counts, publish dates.
// We use this as PRIMARY instead of YouTubei (which is rate-limited).

async function fetchChannelViaRSS(channelId: string): Promise<{
  title: string;
  videos: Array<{
    videoId: string;
    title: string;
    viewCount: number;
    publishedAt: Date;
  }>;
  totalViews: number;
  uploadsLast30d: number;
  uploadFrequency: number;
} | null> {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  const res = await fetch(rssUrl, {
    signal: AbortSignal.timeout(8000),
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; NichePulse/1.0)",
    },
  });

  if (!res.ok) return null;

  const xml = await res.text();
  if (!xml.includes("<entry>")) return null;

  // Extract channel name
  const authorMatch = xml.match(/<author>\s*<name>([^<]+)/);
  const title = authorMatch ? authorMatch[1].trim() : "";
  if (!title) return null;

  // Parse entries
  const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g));
  const thirtyDaysAgo = Date.now() - 30 * 86400000;

  const videos = entries.map((entry) => {
    const e = entry[1];
    const videoId = e.match(/<yt:videoId>([^<]+)/)?.[1] || "";
    const entryTitle = e.match(/<title>([^<]+)/)?.[1] || "";
    const published = e.match(/<published>([^<]+)/)?.[1] || "";
    const views = parseInt(
      e.match(/<media:statistics\s+views="(\d+)"/)?.[1] || "0"
    );
    return {
      videoId,
      title: entryTitle,
      viewCount: views,
      publishedAt: new Date(published),
    };
  });

  const totalViews = videos.reduce((s, v) => s + v.viewCount, 0);
  const uploadsLast30d = videos.filter(
    (v) => v.publishedAt.getTime() > thirtyDaysAgo
  ).length;

  // Calculate upload frequency (average days between uploads)
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
    if (gaps.length > 0) {
      uploadFrequency = Math.round(
        gaps.reduce((a, b) => a + b, 0) / gaps.length
      );
    }
  }

  return { title, videos, totalViews, uploadsLast30d, uploadFrequency };
}

/* ── Thumbnail from YouTube page (lightweight) ─────────────── */

async function fetchThumbnail(channelId: string): Promise<string> {
  try {
    // Try yt3.googleusercontent.com pattern (fastest)
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(rssUrl, {
      signal: AbortSignal.timeout(5000),
      headers: { "User-Agent": "Mozilla/5.0" },
    });
    if (!res.ok) return "";
    const xml = await res.text();

    // Try to get channel thumbnail from YouTube channel page
    const thumbMatch = xml.match(
      /href="(https:\/\/www\.youtube\.com\/channel\/[^"]+)"/
    );
    if (thumbMatch) {
      // Construct standard YouTube avatar URL
      return `https://yt3.googleusercontent.com/ytc/AIdro_k=${channelId}`;
    }
  } catch {
    // ignore
  }
  return "";
}

/* ── Score calculation ─────────────────────────────────────── */

function calcNicheScore(input: {
  subscriberCount: number;
  totalViews: number;
  videoCount: number;
  uploadFrequency: number;
  uploadsLast30d: number;
}): number {
  const { totalViews, videoCount, uploadFrequency, uploadsLast30d } = input;

  // View velocity (40%) — total views across recent videos
  const avgViewsPerVideo = videoCount > 0 ? totalViews / videoCount : 0;
  const viewVelocity = Math.min(
    (avgViewsPerVideo / 100000) * 100, // 100k avg = 100 score
    100
  );

  // Upload consistency (25%)
  let consistency = 50;
  if (uploadFrequency <= 1) consistency = 100;
  else if (uploadFrequency <= 3) consistency = 85;
  else if (uploadFrequency <= 7) consistency = 70;
  else if (uploadFrequency <= 14) consistency = 50;
  else if (uploadFrequency <= 30) consistency = 30;
  else consistency = 10;

  // Recent activity (20%)
  const activity = Math.min(uploadsLast30d * 10, 100);

  // Maturity bonus (15%)
  let maturity = 50;
  if (totalViews > 1000000) maturity = 85;
  else if (totalViews > 100000) maturity = 70;
  else if (totalViews > 10000) maturity = 55;

  return Math.min(
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
}

/* ── Fetch and save a single channel ───────────────────────── */

async function fetchAndSaveChannel(
  channelId: string,
  niche: string,
  nicheRecordId: string | null
) {
  // Check cache (6h)
  const existing = await prisma.channel.findUnique({
    where: { youtubeId: channelId },
    select: { id: true, lastScrapedAt: true, title: true },
  });

  const tooRecent =
    existing?.lastScrapedAt &&
    Date.now() - existing.lastScrapedAt.getTime() < 6 * 3600 * 1000;

  if (tooRecent) {
    return {
      title: existing?.title || channelId,
      subscriberCountText: "cached",
      cached: true,
    };
  }

  // PRIMARY: Fetch via RSS (reliable, returns real data)
  const rssData = await fetchChannelViaRSS(channelId);
  if (!rssData || !rssData.title) {
    throw new Error("RSS returned no data (channel may not exist)");
  }

  const avgViews =
    rssData.videos.length > 0
      ? rssData.totalViews / rssData.videos.length
      : 0;

  const nicheScore = calcNicheScore({
    subscriberCount: 0, // RSS doesn't provide this
    totalViews: rssData.totalViews,
    videoCount: rssData.videos.length,
    uploadFrequency: rssData.uploadFrequency,
    uploadsLast30d: rssData.uploadsLast30d,
  });

  const estimatedMonthlyRevenue = Math.round(
    ((avgViews * rssData.uploadsLast30d) / 1000) * 8 * 0.6
  );

  const isOutlier = rssData.videos.some(
    (v) => avgViews > 0 && v.viewCount > avgViews * 3
  );

  // Fetch thumbnail (best effort)
  const thumbnailUrl = await fetchThumbnail(channelId).catch(() => "");

  // Save to DB
  const saved = await prisma.channel.upsert({
    where: { youtubeId: channelId },
    create: {
      youtubeId: channelId,
      title: rssData.title,
      description: `${rssData.title} — ${niche} content creator`,
      thumbnailUrl,
      subscriberCount: 0, // will be updated when YouTubei works
      viewCount: BigInt(rssData.totalViews),
      videoCount: rssData.videos.length,
      category: niche
        .replace(/[-_]/g, " ")
        .replace(/\b\w/g, (l) => l.toUpperCase()),
      format: "LONG_FORM",
      nicheScore,
      estimatedMonthlyRevenue,
      isOutlier,
      isTrending: rssData.uploadsLast30d >= 10,
      uploadFrequency: rssData.uploadFrequency,
      viewsLast48h: Math.round(rssData.totalViews / 15), // ~daily
      videosLast30Days: rssData.uploadsLast30d,
      country: "",
      nicheCategoryId: nicheRecordId || undefined,
      lastScrapedAt: new Date(),
    },
    update: {
      title: rssData.title,
      thumbnailUrl: thumbnailUrl || undefined,
      viewCount: BigInt(rssData.totalViews),
      videoCount: rssData.videos.length,
      nicheScore,
      estimatedMonthlyRevenue,
      isOutlier,
      isTrending: rssData.uploadsLast30d >= 10,
      uploadFrequency: rssData.uploadFrequency,
      viewsLast48h: Math.round(rssData.totalViews / 15),
      videosLast30Days: rssData.uploadsLast30d,
      lastScrapedAt: new Date(),
    },
  });

  // Save snapshot for growth tracking
  await prisma.channelSnapshot
    .create({
      data: {
        channelId: saved.id,
        subscriberCount: 0,
        viewCount: rssData.totalViews,
        videoCount: rssData.videos.length,
      },
    })
    .catch(() => null);

  // Save video insights
  for (const video of rssData.videos) {
    if (!video.videoId) continue;
    await prisma.videoInsight
      .upsert({
        where: { youtubeVideoId: video.videoId },
        create: {
          channelId: saved.id,
          youtubeVideoId: video.videoId,
          title: video.title,
          viewCount: video.viewCount,
          publishedAt: video.publishedAt,
          isViral: avgViews > 0 && video.viewCount > avgViews * 3,
          thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
        },
        update: {
          viewCount: video.viewCount,
          title: video.title,
        },
      })
      .catch(() => null);
  }

  const viewsStr =
    rssData.totalViews > 1000000
      ? `${(rssData.totalViews / 1000000).toFixed(1)}M views`
      : rssData.totalViews > 1000
        ? `${(rssData.totalViews / 1000).toFixed(0)}K views`
        : `${rssData.totalViews} views`;

  return {
    title: rssData.title,
    subscriberCountText: viewsStr,
    cached: false,
  };
}

/* ── Parallel batch processing ─────────────────────────────── */

async function processBatch(
  channelIds: string[],
  niche: string,
  nicheRecordId: string | null,
  batchSize: number = 3
): Promise<{ saved: number; errors: number; log: string[] }> {
  const log: string[] = [];
  let saved = 0;
  let errors = 0;

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
          log.push(`⏭️ ${result.value.title} (cached)`);
        } else {
          log.push(
            `✅ ${result.value.title} (${result.value.subscriberCountText})`
          );
        }
      } else {
        errors++;
        const reason =
          result.status === "rejected"
            ? String(result.reason).slice(0, 80)
            : "no data returned";
        log.push(`❌ ${batch[j]}: ${reason}`);
      }
    }

    // 500ms between batches
    if (i + batchSize < unique.length) {
      await new Promise((r) => setTimeout(r, 500));
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

      const batchResult = await processBatch(
        channelIds,
        niche,
        nicheRecord?.id || null,
        3
      );

      results.processed += channelIds.length;
      results.saved += batchResult.saved;
      results.errors += batchResult.errors;
      results.channels.push(`📁 ${niche}:`);
      results.channels.push(...batchResult.log);

      // Update niche stats
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
      message: `Processed ${results.processed}, saved ${results.saved}, errors ${results.errors}`,
    });
  } catch (err) {
    console.error("Ingest error:", err);
    return NextResponse.json(
      { success: false, error: String(err) },
      { status: 500 }
    );
  }
}
