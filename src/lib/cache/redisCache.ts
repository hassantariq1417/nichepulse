/**
 * Redis Cache Layer — Upstash REST API
 *
 * Uses Upstash free tier (10,000 commands/day).
 * Works in Vercel Edge + Node.js (HTTP-based, no TCP sockets).
 * Cache failure NEVER breaks the app — all operations gracefully degrade.
 */

import type { ChannelData, RelatedChannel, VideoData } from "@/lib/data/youtubeiClient";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── TTL Values (seconds) ────────────────────────────────────────

export const TTL = {
  CHANNEL: 21600,        // 6 hours
  CHANNEL_VIDEOS: 10800, // 3 hours
  SEARCH: 7200,          // 2 hours
  TRENDING: 1800,        // 30 minutes
  SIMILAR: 43200,        // 12 hours
  NICHE_SCORE: 86400,    // 24 hours
} as const;

// ─── Key Patterns ────────────────────────────────────────────────

const PREFIX = "np:";

function channelKey(id: string) { return `${PREFIX}ch:${id}`; }
function channelVideosKey(id: string) { return `${PREFIX}cv:${id}`; }
function searchKey(query: string) { return `${PREFIX}sr:${hashStr(query)}`; }
function trendingKey(cat?: string) { return `${PREFIX}tr:${cat || "all"}`; }
function similarKey(id: string) { return `${PREFIX}sim:${id}`; }
function statKey(stat: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `${PREFIX}stats:${today}:${stat}`;
}

// ─── Hash Utility ────────────────────────────────────────────────

function hashStr(str: string): string {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
    hash = hash >>> 0;
  }
  return hash.toString(36);
}

// ─── Upstash REST Client ────────────────────────────────────────

async function redisCall(command: string[]): Promise<any> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    // Silently degrade — no Redis, no caching
    return null;
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(command),
    });

    if (!res.ok) {
      console.warn(`[Cache] Redis error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.result;
  } catch (error) {
    console.warn("[Cache] Redis connection failed:", error);
    return null;
  }
}

async function redisGet(key: string): Promise<string | null> {
  return redisCall(["GET", key]);
}

async function redisSet(key: string, value: string, ttl: number): Promise<void> {
  await redisCall(["SET", key, value, "EX", String(ttl)]);
}

async function redisDel(key: string): Promise<void> {
  await redisCall(["DEL", key]);
}

async function redisIncr(key: string): Promise<number> {
  return (await redisCall(["INCR", key])) || 0;
}

async function redisExpire(key: string, ttl: number): Promise<void> {
  await redisCall(["EXPIRE", key, String(ttl)]);
}

async function redisMget(keys: string[]): Promise<(string | null)[]> {
  if (keys.length === 0) return [];
  const result = await redisCall(["MGET", ...keys]);
  return Array.isArray(result) ? result : [];
}

// ─── Generic Cache Wrapper ───────────────────────────────────────

/**
 * Cache-aside pattern: try cache first, then fetcher, then cache result.
 * Cache failure never breaks the app.
 */
export async function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T | null>
): Promise<T | null> {
  // 1. Try cache
  try {
    const cached = await redisGet(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }
  } catch {
    // Cache read failed — continue to fetcher
  }

  // 2. Call fetcher
  const data = await fetcher();

  // 3. Store in cache (fire-and-forget)
  if (data) {
    try {
      await redisSet(key, JSON.stringify(data), ttl);
    } catch {
      // Cache write failed — non-critical
    }
  }

  return data;
}

// ─── Typed Cache Accessors ───────────────────────────────────────

export async function getCachedChannel(id: string): Promise<ChannelData | null> {
  try {
    const raw = await redisGet(channelKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedChannel(id: string, data: ChannelData): Promise<void> {
  try {
    await redisSet(channelKey(id), JSON.stringify(data), TTL.CHANNEL);
  } catch {
    // non-critical
  }
}

export async function getCachedSearch(query: string): Promise<ChannelData[] | null> {
  try {
    const raw = await redisGet(searchKey(query));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedSearch(query: string, data: ChannelData[]): Promise<void> {
  try {
    await redisSet(searchKey(query), JSON.stringify(data), TTL.SEARCH);
  } catch {
    // non-critical
  }
}

export async function getCachedTrending(category?: string): Promise<VideoData[] | null> {
  try {
    const raw = await redisGet(trendingKey(category));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedTrending(data: VideoData[], category?: string): Promise<void> {
  try {
    await redisSet(trendingKey(category), JSON.stringify(data), TTL.TRENDING);
  } catch {
    // non-critical
  }
}

export async function getCachedSimilar(id: string): Promise<RelatedChannel[] | null> {
  try {
    const raw = await redisGet(similarKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedSimilar(id: string, data: RelatedChannel[]): Promise<void> {
  try {
    await redisSet(similarKey(id), JSON.stringify(data), TTL.SIMILAR);
  } catch {
    // non-critical
  }
}

export async function getCachedChannelVideos(id: string): Promise<VideoData[] | null> {
  try {
    const raw = await redisGet(channelVideosKey(id));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setCachedChannelVideos(id: string, data: VideoData[]): Promise<void> {
  try {
    await redisSet(channelVideosKey(id), JSON.stringify(data), TTL.CHANNEL_VIDEOS);
  } catch {
    // non-critical
  }
}

// ─── Batch Cache ─────────────────────────────────────────────────

/**
 * Get multiple channels in 1 Redis command (MGET).
 * Much more efficient than individual GETs.
 */
export async function batchGetCachedChannels(
  ids: string[]
): Promise<Map<string, ChannelData>> {
  const map = new Map<string, ChannelData>();
  if (ids.length === 0) return map;

  try {
    const keys = ids.map(channelKey);
    const results = await redisMget(keys);

    for (let i = 0; i < ids.length; i++) {
      const raw = results[i];
      if (raw) {
        try {
          map.set(ids[i], JSON.parse(raw));
        } catch {
          // Skip malformed entry
        }
      }
    }
  } catch {
    // Cache failure — return empty map
  }

  return map;
}

// ─── Stats Tracking ──────────────────────────────────────────────

/**
 * Increment a daily stat counter.
 * Keys auto-expire after 7 days.
 */
export async function incrementDailyStat(stat: string): Promise<void> {
  try {
    const key = statKey(stat);
    await redisIncr(key);
    await redisExpire(key, 7 * 86400);
  } catch {
    // Stats tracking is non-critical
  }
}

// ─── Cache Admin ─────────────────────────────────────────────────

export async function invalidateChannel(id: string): Promise<void> {
  await redisDel(channelKey(id));
  await redisDel(channelVideosKey(id));
  await redisDel(similarKey(id));
}
