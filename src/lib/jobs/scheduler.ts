/**
 * Cron Scheduler
 *
 * Registers repeatable BullMQ jobs on cron schedules:
 * - Every 6 hours:  refresh-trending (top 100 channels)
 * - Every 24 hours: scrape-category for all 15 niches
 * - Every hour:     process pending channel scrapes (handled by worker)
 *
 * Call registerSchedules() once on app startup or from the worker process.
 */

import { prisma } from "@/lib/prisma";
import {
  getScraperQueue,
  enqueueScrapeCategory,
  // enqueueRefreshTrending is used in registerSchedules via getScraperQueue
} from "@/lib/jobs/scraperQueue";
// quotaManager used for runtime quota checks

/**
 * Register all repeatable cron jobs.
 * Safe to call multiple times — BullMQ deduplicates by repeat key.
 */
export async function registerSchedules() {
  const q = getScraperQueue();

  // ── Midnight UTC: Reset quota budgets ────────────────────────
  await q.add(
    "reset-quota",
    {},
    {
      repeat: { pattern: "0 0 * * *" }, // Midnight UTC
      jobId: "cron-reset-quota",
      priority: 0, // Highest priority
    }
  );

  // ── Every 6 hours: Refresh trending channels ─────────────────
  await q.add(
    "refresh-trending",
    { limit: 100 },
    {
      repeat: { pattern: "0 */6 * * *" }, // 00:00, 06:00, 12:00, 18:00
      jobId: "cron-refresh-trending",
      priority: 1,
    }
  );

  // ── Every 24 hours: Full category scrape ─────────────────────
  await q.add(
    "scrape-all-categories",
    {},
    {
      repeat: { pattern: "0 3 * * *" }, // 3:00 AM daily
      jobId: "cron-scrape-all-categories",
      priority: 2,
    }
  );

  console.log("[scheduler] Cron schedules registered (quota-reset + scraping)");
}

/**
 * Trigger a full scrape of all niche categories.
 * Called by the "scrape-all-categories" cron job or manually.
 */
export async function scrapeAllCategories() {
  const niches = await prisma.nicheCategory.findMany({
    select: { name: true, slug: true },
  });

  const jobs = [];
  for (const niche of niches) {
    const searchQuery = `${niche.name} youtube channel faceless`;
    jobs.push(enqueueScrapeCategory(searchQuery, niche.slug, 25));
  }

  const results = await Promise.allSettled(jobs);
  const succeeded = results.filter((r) => r.status === "fulfilled").length;

  console.log(
    `[scheduler] Enqueued ${succeeded}/${niches.length} category scrape jobs`
  );
  return { total: niches.length, enqueued: succeeded };
}

/**
 * Trigger a trending refresh — re-scrape channels with stale data.
 */
export async function refreshTrendingChannels(limit = 100) {
  const staleThreshold = new Date(Date.now() - 12 * 60 * 60 * 1000); // 12h

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

  const { enqueueScrapeChannel } = await import("@/lib/jobs/scraperQueue");

  let enqueued = 0;
  for (const ch of staleChannels) {
    try {
      await enqueueScrapeChannel(ch.youtubeId);
      enqueued++;
    } catch {
      // Skip duplicates or Redis errors
    }
  }

  console.log(
    `[scheduler] Enqueued ${enqueued}/${staleChannels.length} trending refresh jobs`
  );
  return { stale: staleChannels.length, enqueued };
}
