/**
 * BullMQ Worker: channel-scraper
 *
 * Runs as a SEPARATE process (Railway / VPS), NOT on Vercel.
 * Processes all job types from the "channel-scraper" queue.
 *
 * Start: npx tsx workers/scraper.worker.ts
 */

import "dotenv/config";
import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import { PrismaClient } from "@prisma/client";
import {
  searchChannels,
  getChannelDetails,
  getChannelVideos,
  calculateChannelMetrics,
  calculateNicheScore,
  estimateRevenue,
} from "../src/lib/youtube";

const QUEUE_NAME = "channel-scraper";

// Standalone Prisma instance for worker process
const prisma = new PrismaClient();

// Standalone Redis connection for worker
const redis = new IORedis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

console.log("[worker] Starting channel-scraper worker...");

const worker = new Worker(
  QUEUE_NAME,
  async (job: Job) => {
    console.log(`[worker] Processing job: ${job.name} (${job.id})`);

    switch (job.name) {
      case "scrape-category":
        return handleScrapeCategory(job);
      case "scrape-channel":
        return handleScrapeChannel(job);
      case "refresh-trending":
        return handleRefreshTrending(job);
      case "scrape-all-categories":
        return handleScrapeAllCategories(job);
      case "reset-quota":
        return handleResetQuota(job);
      default:
        throw new Error(`Unknown job type: ${job.name}`);
    }
  },
  {
    connection: redis,
    concurrency: 3, // Process 3 jobs in parallel
    limiter: {
      max: 10,
      duration: 60_000, // Max 10 jobs per minute to respect API quota
    },
  }
);

// ─── Job Handlers ────────────────────────────────────────────────

async function handleScrapeCategory(job: Job) {
  const { category, nicheSlug, maxResults = 25 } = job.data;

  await job.updateProgress(10);

  // 1. Search YouTube for channels
  const channelIds = await searchChannels(category, maxResults);
  await job.updateProgress(30);

  // 2. Find the niche category in DB
  const niche = nicheSlug
    ? await prisma.nicheCategory.findUnique({ where: { slug: nicheSlug } })
    : null;

  // 3. Get channel details in batches
  const channels = await getChannelDetails(channelIds);
  await job.updateProgress(60);

  // 4. Upsert each channel and enqueue individual scrapes
  let stored = 0;
  const queue = (await import("bullmq")).Queue;
  const scraperQueue = new queue(QUEUE_NAME, { connection: redis });

  for (const ch of channels) {
    await prisma.channel.upsert({
      where: { youtubeId: ch.id },
      update: {
        title: ch.title,
        description: ch.description,
        thumbnailUrl: ch.thumbnailUrl,
        subscriberCount: ch.subscriberCount,
        viewCount: ch.viewCount,
        videoCount: ch.videoCount,
        country: ch.country,
        ...(niche ? { nicheCategoryId: niche.id, category: niche.name } : {}),
      },
      create: {
        youtubeId: ch.id,
        title: ch.title,
        description: ch.description,
        thumbnailUrl: ch.thumbnailUrl,
        subscriberCount: ch.subscriberCount,
        viewCount: ch.viewCount,
        videoCount: ch.videoCount,
        country: ch.country,
        ...(niche ? { nicheCategoryId: niche.id, category: niche.name } : {}),
      },
    });

    // Enqueue individual deep scrape
    await scraperQueue.add(
      "scrape-channel",
      { youtubeId: ch.id, nicheSlug },
      {
        jobId: `scrape-ch-${ch.id}-${Date.now()}`,
        priority: 3,
        delay: stored * 2000, // Stagger to avoid API bursts
      }
    );

    stored++;
  }

  await scraperQueue.close();
  await job.updateProgress(100);

  // 5. Update niche category stats
  if (niche) {
    const channelCount = await prisma.channel.count({
      where: { nicheCategoryId: niche.id },
    });
    const avgScore = await prisma.channel.aggregate({
      where: { nicheCategoryId: niche.id },
      _avg: { nicheScore: true },
    });

    await prisma.nicheCategory.update({
      where: { id: niche.id },
      data: {
        channelCount,
        averageNicheScore: avgScore._avg.nicheScore || 0,
      },
    });
  }

  return { channelsFound: channelIds.length, stored };
}

async function handleScrapeChannel(job: Job) {
  const { youtubeId, nicheSlug } = job.data;

  await job.updateProgress(10);

  // 1. Fetch full channel stats (1 API unit)
  const [channelData] = await getChannelDetails([youtubeId]);
  if (!channelData) {
    throw new Error(`Channel not found: ${youtubeId}`);
  }

  await job.updateProgress(30);

  // 2. Fetch latest 10 videos (1 API unit)
  const videos = await getChannelVideos(youtubeId, 10);
  await job.updateProgress(50);

  // 3. Calculate metrics
  const metrics = calculateChannelMetrics(videos);
  const nicheScore = calculateNicheScore(
    channelData.subscriberCount,
    channelData.viewCount,
    channelData.videoCount,
    metrics.growthRate30d,
    metrics.uploadFrequency
  );
  const estimatedRevenue = estimateRevenue(
    channelData.viewCount,
    channelData.videoCount
  );

  // Outlier detection: views in last 48h > 30% of subscriber count
  const isOutlier =
    metrics.viewsLast48h > channelData.subscriberCount * 0.3 ||
    metrics.isOutlier;

  const channelAge = channelData.publishedAt
    ? Math.floor(
        (Date.now() - new Date(channelData.publishedAt).getTime()) /
          (30 * 24 * 60 * 60 * 1000)
      )
    : null;

  await job.updateProgress(70);

  // 4. Upsert channel
  const niche = nicheSlug
    ? await prisma.nicheCategory.findUnique({ where: { slug: nicheSlug } })
    : null;

  const channel = await prisma.channel.upsert({
    where: { youtubeId },
    update: {
      title: channelData.title,
      description: channelData.description,
      thumbnailUrl: channelData.thumbnailUrl,
      subscriberCount: channelData.subscriberCount,
      viewCount: channelData.viewCount,
      videoCount: channelData.videoCount,
      country: channelData.country,
      channelAge,
      nicheScore,
      estimatedMonthlyRevenue: estimatedRevenue,
      growthRate7d: metrics.growthRate7d,
      growthRate30d: metrics.growthRate30d,
      viewsLast48h: metrics.viewsLast48h,
      uploadFrequency: metrics.uploadFrequency,
      isOutlier,
      isTrending: metrics.isTrending,
      lastScrapedAt: new Date(),
      ...(niche ? { nicheCategoryId: niche.id, category: niche.name } : {}),
    },
    create: {
      youtubeId,
      title: channelData.title,
      description: channelData.description,
      thumbnailUrl: channelData.thumbnailUrl,
      subscriberCount: channelData.subscriberCount,
      viewCount: channelData.viewCount,
      videoCount: channelData.videoCount,
      country: channelData.country,
      channelAge,
      nicheScore,
      estimatedMonthlyRevenue: estimatedRevenue,
      growthRate7d: metrics.growthRate7d,
      growthRate30d: metrics.growthRate30d,
      viewsLast48h: metrics.viewsLast48h,
      uploadFrequency: metrics.uploadFrequency,
      isOutlier,
      isTrending: metrics.isTrending,
      lastScrapedAt: new Date(),
      ...(niche ? { nicheCategoryId: niche.id, category: niche.name } : {}),
    },
  });

  // 5. Upsert video insights
  for (const video of videos) {
    const hoursLive = Math.max(
      (Date.now() - new Date(video.publishedAt).getTime()) / 3600000,
      1
    );

    await prisma.videoInsight.upsert({
      where: { youtubeVideoId: video.id },
      update: {
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        commentCount: video.commentCount,
        viewsPerHour: video.viewCount / hoursLive,
        isViral: video.viewCount > (metrics.avgViewsPerVideo || 1) * 10,
      },
      create: {
        channelId: channel.id,
        youtubeVideoId: video.id,
        title: video.title,
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        commentCount: video.commentCount,
        publishedAt: new Date(video.publishedAt),
        thumbnail: video.thumbnail,
        viewsPerHour: video.viewCount / hoursLive,
        isViral: video.viewCount > (metrics.avgViewsPerVideo || 1) * 10,
      },
    });
  }

  await job.updateProgress(100);
  return { youtubeId, nicheScore, isOutlier, videos: videos.length };
}

async function handleRefreshTrending(job: Job) {
  const { limit = 100 } = job.data;
  const staleThreshold = new Date(Date.now() - 12 * 60 * 60 * 1000);

  const staleChannels = await prisma.channel.findMany({
    where: {
      OR: [
        { lastScrapedAt: null },
        { lastScrapedAt: { lt: staleThreshold } },
      ],
    },
    orderBy: { nicheScore: "desc" },
    take: limit,
    select: { youtubeId: true },
  });

  const queue = (await import("bullmq")).Queue;
  const scraperQueue = new queue(QUEUE_NAME, { connection: redis });

  let enqueued = 0;
  for (const ch of staleChannels) {
    await scraperQueue.add(
      "scrape-channel",
      { youtubeId: ch.youtubeId },
      {
        jobId: `refresh-${ch.youtubeId}-${Date.now()}`,
        priority: 3,
        delay: enqueued * 3000,
      }
    );
    enqueued++;
  }

  await scraperQueue.close();
  await job.updateProgress(100);
  return { stale: staleChannels.length, enqueued };
}

async function handleScrapeAllCategories(job: Job) {
  const niches = await prisma.nicheCategory.findMany({
    select: { name: true, slug: true },
  });

  const queue = (await import("bullmq")).Queue;
  const scraperQueue = new queue(QUEUE_NAME, { connection: redis });

  let enqueued = 0;
  for (const niche of niches) {
    const searchQuery = `${niche.name} youtube channel faceless`;
    await scraperQueue.add(
      "scrape-category",
      { category: searchQuery, nicheSlug: niche.slug, maxResults: 25 },
      {
        jobId: `scrape-cat-${niche.slug}-${Date.now()}`,
        priority: 2,
        delay: enqueued * 10000, // 10s between categories
      }
    );
    enqueued++;
  }

  await scraperQueue.close();
  await job.updateProgress(100);
  return { categories: niches.length, enqueued };
}

// ─── Quota Reset Handler ─────────────────────────────────────────

const QUOTA_KEYS = ["quota:discovery", "quota:refresh", "quota:search", "quota:buffer"];

async function handleResetQuota(job: Job) {
  for (const key of QUOTA_KEYS) {
    await redis.set(key, "0", "EX", 86400);
  }
  await job.updateProgress(100);
  console.log("[worker] ✅ Daily quota budgets reset to 0");
  return { reset: true, buckets: QUOTA_KEYS.length };
}

// ─── Worker Events ───────────────────────────────────────────────

worker.on("completed", (job) => {
  console.log(`[worker] ✅ ${job.name} (${job.id}) completed`);
});

worker.on("failed", (job, err) => {
  console.error(`[worker] ❌ ${job?.name} (${job?.id}) failed:`, err.message);
});

worker.on("error", (err) => {
  console.error("[worker] Worker error:", err);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("[worker] Shutting down...");
  await worker.close();
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("[worker] Shutting down...");
  await worker.close();
  await prisma.$disconnect();
  await redis.quit();
  process.exit(0);
});

console.log("[worker] ✅ channel-scraper worker is running");
