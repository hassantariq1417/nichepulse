/**
 * YouTube Client — Budget-Aware API Access
 *
 * ALL YouTube API calls must go through this module.
 * Routes each call to the correct QuotaManager bucket:
 *   - "search"    → user-triggered searches (2,000/day)
 *   - "discovery" → background category scrapes (4,000/day)
 *   - "refresh"   → channel detail refreshes (3,000/day)
 *
 * When a bucket is exhausted, automatically:
 *   1. Tries the buffer bucket (1,000/day)
 *   2. Falls back to HTML scraper (zero API cost)
 *   3. Returns stale/cached data with { fresh: false } flag
 */

import {
  searchChannels as apiSearchChannels,
  getChannelDetails as apiGetChannelDetails,
  getChannelVideos as apiGetChannelVideos,
  calculateChannelMetrics,
  calculateNicheScore,
  estimateRevenue,
} from "@/lib/youtube";
import {
  scrapeChannelPublicPage,
  scrapeVideoStats,
  scrapeChannelVideoIds,
} from "@/lib/scrapers/youtubeScraper";
import { quotaManager, type BucketName } from "@/lib/youtube/quotaManager";

// ─── API Cost Reference ──────────────────────────────────────────
// search.list   = 100 units
// channels.list = 1 unit per batch (up to 50 IDs)
// videos.list   = 1 unit per request
// search (video)= 100 units

const UNIT_COSTS = {
  search: 100,
  channels: 1,
  videos: 1,
  videoSearch: 100,
} as const;

// ─── Result wrapper ──────────────────────────────────────────────

export interface QuotaAwareResult<T> {
  data: T;
  fresh: boolean;
  source: "api" | "scraper" | "cache";
  message?: string;
}

// ─── Public API ──────────────────────────────────────────────────

/**
 * Search for channels by keyword.
 * Bucket: "search" (user-triggered) or "discovery" (background).
 * API cost: 100 units.
 */
export async function searchChannels(
  query: string,
  maxResults = 25,
  bucket: BucketName = "search"
): Promise<string[]> {
  const canSpend = await quotaManager.canSpend(UNIT_COSTS.search, bucket);

  if (!canSpend) {
    console.log(`[client] Quota exhausted for ${bucket}. Search "${query}" blocked — use cache.`);
    return [];
  }

  try {
    const results = await apiSearchChannels(query, maxResults);
    await quotaManager.spend(UNIT_COSTS.search, bucket);
    return results;
  } catch (error) {
    console.error(`[client] API search failed:`, error);
    return [];
  }
}

/**
 * Get detailed channel data.
 * Bucket: "refresh" (background) or "search" (user-triggered).
 * API cost: 1 unit per batch of up to 50 IDs.
 */
export async function getChannelDetails(
  channelIds: string[],
  bucket: BucketName = "refresh"
): Promise<QuotaAwareResult<ReturnType<typeof apiGetChannelDetails> extends Promise<infer T> ? T : never>> {
  const batches = Math.ceil(channelIds.length / 50);
  const cost = UNIT_COSTS.channels * batches;
  const canSpend = await quotaManager.canSpend(cost, bucket);

  if (!canSpend) {
    console.log(`[client] Quota exhausted for ${bucket}. Falling back to scraper for ${channelIds.length} channels.`);
    const scraped = await getChannelDetailsByScraper(channelIds);
    return { data: scraped, fresh: false, source: "scraper", message: "Using cached data — API quota limit reached" };
  }

  try {
    const results = await apiGetChannelDetails(channelIds);
    await quotaManager.spend(cost, bucket);
    return { data: results, fresh: true, source: "api" };
  } catch (error) {
    console.error(`[client] API getChannelDetails failed, falling back:`, error);
    const scraped = await getChannelDetailsByScraper(channelIds);
    return { data: scraped, fresh: false, source: "scraper", message: "API error — using scraped data" };
  }
}

/**
 * Get recent videos from a channel.
 * Bucket: "refresh" (background) or "search" (user-triggered).
 * API cost: 100 (video search) + 1 (video stats) = 101 units.
 */
export async function getChannelVideos(
  channelId: string,
  maxResults = 10,
  bucket: BucketName = "refresh"
): Promise<QuotaAwareResult<ReturnType<typeof apiGetChannelVideos> extends Promise<infer T> ? T : never>> {
  const cost = UNIT_COSTS.videoSearch + UNIT_COSTS.videos;
  const canSpend = await quotaManager.canSpend(cost, bucket);

  if (!canSpend) {
    console.log(`[client] Quota exhausted for ${bucket}. Falling back to scraper for videos of ${channelId}.`);
    const scraped = await getChannelVideosByScraper(channelId, maxResults);
    return { data: scraped, fresh: false, source: "scraper", message: "Using cached data" };
  }

  try {
    const results = await apiGetChannelVideos(channelId, maxResults);
    await quotaManager.spend(cost, bucket);
    return { data: results, fresh: true, source: "api" };
  } catch (error) {
    console.error(`[client] API getChannelVideos failed, falling back:`, error);
    const scraped = await getChannelVideosByScraper(channelId, maxResults);
    return { data: scraped, fresh: false, source: "scraper", message: "API error — using scraped data" };
  }
}

/**
 * Get full quota status for admin monitoring.
 */
export async function getQuotaStatus() {
  return quotaManager.getStatus();
}

// Re-export pure computation functions (no API cost)
export { calculateChannelMetrics, calculateNicheScore, estimateRevenue };

// ─── Scraper Fallbacks ───────────────────────────────────────────

async function getChannelDetailsByScraper(channelIds: string[]) {
  const results = [];
  for (const id of channelIds) {
    const scraped = await scrapeChannelPublicPage(id);
    if (scraped) {
      results.push({
        id,
        title: scraped.title,
        description: scraped.description,
        thumbnailUrl: scraped.thumbnailUrl,
        subscriberCount: scraped.subscriberCount,
        viewCount: scraped.viewCount,
        videoCount: scraped.videoCount,
        country: scraped.country,
        publishedAt: "",
      });
    }
  }
  return results;
}

async function getChannelVideosByScraper(channelId: string, maxResults: number) {
  const videoIds = await scrapeChannelVideoIds(channelId, maxResults);
  const results = [];
  for (const videoId of videoIds) {
    const stats = await scrapeVideoStats(videoId);
    if (stats) {
      results.push({
        id: videoId,
        title: stats.title,
        viewCount: stats.viewCount,
        likeCount: stats.likeCount,
        commentCount: 0,
        publishedAt: stats.publishedAt,
        thumbnail: `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
      });
    }
  }
  return results;
}
