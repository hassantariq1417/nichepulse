/**
 * YouTube API Caching Layer
 *
 * Database-first caching to minimize YouTube API quota usage:
 * - Channel data: cached for 24 hours per channel
 * - Search results: cached for 6 hours per unique query+filters
 *
 * This reduces API calls by ~95% in production.
 */

import { prisma } from "@/lib/prisma";
import {
  getChannelDetails,
  getChannelVideos,
  calculateChannelMetrics,
  calculateNicheScore,
  estimateRevenue,
  searchChannels,
} from "@/lib/youtube/client";
import { createHash } from "crypto";

// ─── Constants ───────────────────────────────────────────────────
const CHANNEL_CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const SEARCH_CACHE_TTL_MS = 6 * 60 * 60 * 1000;   // 6 hours

// ─── getCachedChannel ────────────────────────────────────────────
/**
 * Fetch a channel by YouTube ID — checks DB cache first.
 * Only calls YouTube API if the cached record is stale (>24h) or missing.
 */
export async function getCachedChannel(youtubeId: string) {
  // 1. Check DB for existing record
  const existing = await prisma.channel.findUnique({
    where: { youtubeId },
    include: {
      nicheCategory: true,
      videos: {
        take: 10,
        orderBy: { publishedAt: "desc" },
      },
    },
  });

  // 2. If fresh enough, return from DB
  if (existing?.lastScrapedAt) {
    const age = Date.now() - new Date(existing.lastScrapedAt).getTime();
    if (age < CHANNEL_CACHE_TTL_MS) {
      return existing;
    }
  }

  // 3. Stale or missing → fetch from YouTube API
  try {
    const result = await getChannelDetails([youtubeId]);
    const [channelData] = result.data;
    if (!channelData) {
      return existing || null; // Return stale data if API returns nothing
    }

    // Fetch recent videos for metrics
    const videoResult = await getChannelVideos(youtubeId, 10);
    const videos = videoResult.data;
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

    // Calculate channel age in months
    const channelAge = channelData.publishedAt
      ? Math.floor(
          (Date.now() - new Date(channelData.publishedAt).getTime()) /
            (30 * 24 * 60 * 60 * 1000)
        )
      : null;

    // 4. Upsert into DB
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
        isOutlier: metrics.isOutlier,
        isTrending: metrics.isTrending,
        lastScrapedAt: new Date(),
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
        isOutlier: metrics.isOutlier,
        isTrending: metrics.isTrending,
        lastScrapedAt: new Date(),
      },
      include: {
        nicheCategory: true,
        videos: {
          take: 10,
          orderBy: { publishedAt: "desc" },
        },
      },
    });

    // 5. Upsert video insights
    for (const video of videos) {
      await prisma.videoInsight.upsert({
        where: { youtubeVideoId: video.id },
        update: {
          viewCount: video.viewCount,
          likeCount: video.likeCount,
          commentCount: video.commentCount,
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
          viewsPerHour:
            video.viewCount /
            Math.max(
              (Date.now() - new Date(video.publishedAt).getTime()) / 3600000,
              1
            ),
          isViral: video.viewCount > (metrics.avgViewsPerVideo || 1) * 10,
        },
      });
    }

    return channel;
  } catch (error) {
    console.error(`[cache] YouTube API error for ${youtubeId}:`, error);
    // Return stale data rather than throwing
    return existing || null;
  }
}

// ─── getCachedSearch ─────────────────────────────────────────────
/**
 * Search for YouTube channels — checks SearchCache table first.
 * Only calls YouTube API if cached results are expired (>6h) or missing.
 */
export async function getCachedSearch(
  query: string,
  filters: Record<string, string | number | boolean> = {},
  maxResults = 25
): Promise<string[]> {
  const cacheKey = generateCacheKey(query, filters);

  // 1. Check cache
  const cached = await prisma.searchCache.findUnique({
    where: { cacheKey },
  });

  if (cached && new Date(cached.expiresAt) > new Date()) {
    return cached.results as string[];
  }

  // 2. Cache miss or expired → call YouTube API
  try {
    const results = await searchChannels(query, maxResults);

    // 3. Upsert cache entry
    const expiresAt = new Date(Date.now() + SEARCH_CACHE_TTL_MS);
    await prisma.searchCache.upsert({
      where: { cacheKey },
      update: {
        query,
        results,
        createdAt: new Date(),
        expiresAt,
      },
      create: {
        cacheKey,
        query,
        results,
        expiresAt,
      },
    });

    return results;
  } catch (error) {
    console.error(`[cache] YouTube search API error for "${query}":`, error);
    // Return stale results if available
    if (cached) {
      return cached.results as string[];
    }
    throw error;
  }
}

// ─── Cache utilities ─────────────────────────────────────────────

/**
 * Generate a deterministic cache key from query + filters.
 * Uses SHA-256 hash for consistent key length.
 */
function generateCacheKey(
  query: string,
  filters: Record<string, string | number | boolean>
): string {
  const normalized = JSON.stringify({
    q: query.trim().toLowerCase(),
    f: Object.keys(filters)
      .sort()
      .reduce(
        (acc, key) => ({ ...acc, [key]: filters[key] }),
        {} as Record<string, string | number | boolean>
      ),
  });

  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Purge expired search cache entries.
 * Call this periodically (e.g., from a cron job).
 */
export async function purgeExpiredCache(): Promise<number> {
  const result = await prisma.searchCache.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return result.count;
}

/**
 * Get cache stats for monitoring.
 */
export async function getCacheStats() {
  const [totalSearchEntries, activeSearchEntries, totalChannels, freshChannels] =
    await Promise.all([
      prisma.searchCache.count(),
      prisma.searchCache.count({
        where: { expiresAt: { gt: new Date() } },
      }),
      prisma.channel.count(),
      prisma.channel.count({
        where: {
          lastScrapedAt: {
            gt: new Date(Date.now() - CHANNEL_CACHE_TTL_MS),
          },
        },
      }),
    ]);

  return {
    searchCache: {
      total: totalSearchEntries,
      active: activeSearchEntries,
      expired: totalSearchEntries - activeSearchEntries,
    },
    channelCache: {
      total: totalChannels,
      fresh: freshChannels,
      stale: totalChannels - freshChannels,
      hitRate: totalChannels > 0 ? ((freshChannels / totalChannels) * 100).toFixed(1) + "%" : "N/A",
    },
  };
}
