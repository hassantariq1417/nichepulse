/**
 * Data Service — Single Entry Point for ALL App Data
 *
 * Every component, API route, and page imports from HERE ONLY.
 * Never import youtubeiClient or rssPoller directly.
 *
 * Pipeline: Cache → YouTubei → RSS → Score → Cache → Return
 */

import {
  getChannelData,
  searchChannels as ytSearch,
  getChannelVideos as ytGetVideos,
  getTrending as ytGetTrending,
  getSimilarChannels as ytGetSimilar,
  batchGetChannels,
  type ChannelData,
  type RelatedChannel,
  type VideoData,
} from "@/lib/data/youtubeiClient";

import { pollChannelRSS, detectOutlier } from "@/lib/data/rssPoller";

import {
  getCachedChannel,
  setCachedChannel,
  getCachedSearch,
  setCachedSearch,
  getCachedTrending,
  setCachedTrending,
  getCachedSimilar,
  setCachedSimilar,
  getCachedChannelVideos,
  setCachedChannelVideos,
  batchGetCachedChannels,
  incrementDailyStat,
  withCache,
  TTL,
} from "@/lib/cache/redisCache";

import {
  calculateNicheScore,
  estimateMonthlyRevenue,
  estimateMonthlyViews,
  getScoreLabel,
} from "@/lib/scoring";

// ─── Re-export types for convenience ─────────────────────────────

export type { ChannelData, RelatedChannel, VideoData };

export interface SearchResult {
  channels: ChannelData[];
  query: string;
  cached: boolean;
}

// ─── MAIN FUNCTIONS ──────────────────────────────────────────────

/**
 * Fetch a single channel with full enrichment.
 * Pipeline: Cache → YouTubei → RSS → Score → Cache
 */
export async function fetchChannel(
  channelIdOrHandle: string
): Promise<ChannelData | null> {
  // 1. Check cache
  const cached = await getCachedChannel(channelIdOrHandle);
  if (cached) return cached;

  // 2. Fetch from YouTubei
  const data = await getChannelData(channelIdOrHandle);
  if (!data) return null;

  // 3. Enrich with RSS feed data
  try {
    const rss = await pollChannelRSS(data.channelId);
    if (rss) {
      data.uploadFrequency = rss.uploadFrequency;
      // Merge view counts from RSS if we have them
      if (rss.videos.length > 0) {
        for (const rssVideo of rss.videos) {
          const existing = data.recentVideos.find(
            (v) => v.videoId === rssVideo.videoId
          );
          if (existing && rssVideo.viewCount > 0) {
            existing.viewCount = rssVideo.viewCount;
          }
        }
      }
    }
  } catch {
    // RSS enrichment is optional
  }

  // 4. Calculate niche score
  const avgViews =
    data.recentVideos.length > 0
      ? data.recentVideos.reduce((sum, v) => sum + v.viewCount, 0) /
        data.recentVideos.length
      : 0;

  data.nicheScore = calculateNicheScore({
    subscriberCount: data.subscriberCount,
    videoCount: data.videoCount,
    uploadFrequency: data.uploadFrequency || 7,
    recentVideos: data.recentVideos,
    avgViews,
  });

  // 5. Estimate revenue
  const monthlyViews = estimateMonthlyViews(
    data.subscriberCount,
    data.uploadFrequency || 7
  );
  data.estimatedMonthlyRevenue = estimateMonthlyRevenue(monthlyViews);

  // 6. Store in cache
  await setCachedChannel(data.channelId, data);
  // Also cache by handle if available
  if (data.handle && data.handle !== data.channelId) {
    await setCachedChannel(data.handle, data);
  }

  await incrementDailyStat("channels_scraped");
  return data;
}

/**
 * Fetch multiple channels in batch with cache optimization.
 * 1 Redis MGET for all → only fetch missing from YouTubei.
 */
export async function fetchChannelsBatch(
  ids: string[]
): Promise<Map<string, ChannelData>> {
  // 1. Batch cache lookup (1 Redis command)
  const cachedMap = await batchGetCachedChannels(ids);

  // 2. Find missing IDs
  const missingIds = ids.filter((id) => !cachedMap.has(id));

  if (missingIds.length === 0) return cachedMap;

  // 3. Fetch missing from YouTubei
  const freshMap = await batchGetChannels(missingIds, 3);

  // 4. Enrich + cache each fresh result
  const entries = Array.from(freshMap.entries());
  for (const [id, data] of entries) {
    try {
      const rss = await pollChannelRSS(data.channelId);
      if (rss) data.uploadFrequency = rss.uploadFrequency;
    } catch {
      // optional
    }

    const avgViews =
      data.recentVideos.length > 0
        ? data.recentVideos.reduce((sum: number, v: { viewCount: number }) => sum + v.viewCount, 0) /
          data.recentVideos.length
        : 0;

    data.nicheScore = calculateNicheScore({
      subscriberCount: data.subscriberCount,
      videoCount: data.videoCount,
      uploadFrequency: data.uploadFrequency || 7,
      recentVideos: data.recentVideos,
      avgViews,
    });

    data.estimatedMonthlyRevenue = estimateMonthlyRevenue(
      estimateMonthlyViews(data.subscriberCount, data.uploadFrequency || 7)
    );

    await setCachedChannel(id, data);
    cachedMap.set(id, data);
  }

  return cachedMap;
}

/**
 * Search for channels by keyword.
 * Cached for 2 hours, tracked in daily stats.
 */
export async function searchForChannels(
  query: string,
  maxResults = 20
): Promise<SearchResult> {
  // 1. Check cache
  const cached = await getCachedSearch(query);
  if (cached) {
    return { channels: cached, query, cached: true };
  }

  // 2. Search via YouTubei
  const channels = await ytSearch(query, maxResults);

  // 3. Enrich each channel with score
  for (const ch of channels) {
    const avgViews =
      ch.recentVideos.length > 0
        ? ch.recentVideos.reduce((sum, v) => sum + v.viewCount, 0) /
          ch.recentVideos.length
        : 0;

    ch.nicheScore = calculateNicheScore({
      subscriberCount: ch.subscriberCount,
      videoCount: ch.videoCount,
      uploadFrequency: ch.uploadFrequency || 7,
      recentVideos: ch.recentVideos,
      avgViews,
    });

    ch.estimatedMonthlyRevenue = estimateMonthlyRevenue(
      estimateMonthlyViews(ch.subscriberCount, ch.uploadFrequency || 7)
    );
  }

  // 4. Cache and track
  await setCachedSearch(query, channels);
  await incrementDailyStat("searches");

  return { channels, query, cached: false };
}

/**
 * Fetch trending videos.
 */
export async function fetchTrending(
  category?: string
): Promise<VideoData[]> {
  const cached = await getCachedTrending(category);
  if (cached) return cached;

  const videos = await ytGetTrending();
  if (videos.length > 0) {
    await setCachedTrending(videos, category);
  }

  return videos;
}

/**
 * Fetch channels similar to a given channel.
 */
export async function fetchSimilarChannels(
  channelId: string
): Promise<RelatedChannel[]> {
  const cached = await getCachedSimilar(channelId);
  if (cached) return cached;

  const channels = await ytGetSimilar(channelId);
  if (channels.length > 0) {
    await setCachedSimilar(channelId, channels);
  }

  return channels;
}

/**
 * Fetch a channel's recent videos.
 */
export async function fetchChannelVideos(
  channelId: string,
  includeShorts?: boolean
): Promise<VideoData[]> {
  return (
    (await withCache<VideoData[]>(
      `np:cv:${channelId}`,
      TTL.CHANNEL_VIDEOS,
      async () => {
        const videos = await ytGetVideos(channelId);
        if (!includeShorts) {
          return videos.filter((v) => !v.isShort);
        }
        return videos;
      }
    )) || []
  );
}

/**
 * Check if a channel is an outlier based on view/sub ratio.
 */
export async function checkOutlier(channelId: string): Promise<boolean> {
  const data = await fetchChannel(channelId);
  if (!data) return false;
  return detectOutlier(data.subscriberCount, data.recentVideos);
}
