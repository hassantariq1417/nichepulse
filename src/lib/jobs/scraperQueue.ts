/**
 * BullMQ Queue: channel-scraper
 *
 * Job types:
 * - "scrape-category": Discover channels in a niche via YouTube Search
 * - "scrape-channel":  Full channel + video data fetch and DB upsert
 * - "refresh-trending": Re-scrape stale high-score channels
 */

import { Queue } from "bullmq";
import { getRedisConnection } from "@/lib/redis";

export const QUEUE_NAME = "channel-scraper";

let queue: Queue | null = null;

export function getScraperQueue(): Queue {
  if (!queue) {
    queue = new Queue(QUEUE_NAME, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 5000 },
        removeOnComplete: { count: 500 },
        removeOnFail: { count: 200 },
      },
    });
  }
  return queue;
}

// ─── Job Creators ────────────────────────────────────────────────

/**
 * Enqueue a category scrape — discovers top channels in a niche.
 */
export async function enqueueScrapeCategory(
  category: string,
  nicheSlug: string,
  maxResults = 25
) {
  const q = getScraperQueue();
  return q.add(
    "scrape-category",
    { category, nicheSlug, maxResults },
    {
      jobId: `scrape-cat-${nicheSlug}-${Date.now()}`,
      priority: 2,
    }
  );
}

/**
 * Enqueue a single channel scrape — full stats + video fetch.
 */
export async function enqueueScrapeChannel(
  youtubeId: string,
  nicheSlug?: string
) {
  const q = getScraperQueue();
  return q.add(
    "scrape-channel",
    { youtubeId, nicheSlug },
    {
      jobId: `scrape-ch-${youtubeId}-${Date.now()}`,
      priority: 3,
    }
  );
}

/**
 * Enqueue a trending refresh — re-scrape stale top channels.
 */
export async function enqueueRefreshTrending(limit = 100) {
  const q = getScraperQueue();
  return q.add(
    "refresh-trending",
    { limit },
    {
      jobId: `refresh-trending-${Date.now()}`,
      priority: 1,
    }
  );
}
