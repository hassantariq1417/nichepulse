/**
 * YouTube API Quota Budget Manager
 *
 * Allocates the daily 10,000 unit quota across 4 purpose-specific buckets.
 * Each bucket has its own Redis counter with midnight UTC expiry.
 *
 * Budget allocation:
 *   discovery  → 4,000 units (40%) — background category scrapes
 *   refresh    → 3,000 units (30%) — channel detail refreshes
 *   search     → 2,000 units (20%) — user-triggered searches
 *   buffer     → 1,000 units (10%) — emergency / overflow
 */

import { getRedisConnection } from "@/lib/redis";

// ─── Budget Configuration ────────────────────────────────────────

export const BUCKETS = {
  discovery: { limit: 4_000, key: "quota:discovery", label: "Category Discovery" },
  refresh:   { limit: 3_000, key: "quota:refresh",   label: "Channel Refresh" },
  search:    { limit: 2_000, key: "quota:search",    label: "User Search" },
  buffer:    { limit: 1_000, key: "quota:buffer",    label: "Emergency Buffer" },
} as const;

export type BucketName = keyof typeof BUCKETS;

const TOTAL_DAILY_LIMIT = 10_000;

// ─── QuotaManager Class ──────────────────────────────────────────

class QuotaManager {
  /**
   * Check if a bucket has enough remaining units to spend.
   * If the primary bucket is exhausted, checks the buffer bucket.
   */
  async canSpend(units: number, bucket: BucketName): Promise<boolean> {
    const remaining = await this.getRemaining(bucket);
    if (remaining >= units) return true;

    // Fall back to buffer bucket if primary is exhausted
    if (bucket !== "buffer") {
      const bufferRemaining = await this.getRemaining("buffer");
      return bufferRemaining >= units;
    }

    return false;
  }

  /**
   * Spend units from a bucket. If primary bucket is exhausted,
   * automatically spills over to the buffer bucket.
   * Returns the actual bucket that was charged.
   */
  async spend(units: number, bucket: BucketName): Promise<{ charged: BucketName; remaining: number }> {
    const remaining = await this.getRemaining(bucket);

    let targetBucket = bucket;
    if (remaining < units && bucket !== "buffer") {
      // Spill to buffer
      targetBucket = "buffer";
      console.warn(
        `[quota] ⚠️ ${BUCKETS[bucket].label} exhausted (${remaining} left). Spilling ${units} units to buffer.`
      );
    }

    const config = BUCKETS[targetBucket];
    const redis = getRedisConnection();

    try {
      const newVal = await redis.incrby(config.key, units);
      await this.ensureExpiry(config.key);

      const newRemaining = config.limit - newVal;
      console.log(
        `[quota] ${config.label}: spent ${units} → ${newVal}/${config.limit} used (${Math.max(newRemaining, 0)} remaining)`
      );

      return { charged: targetBucket, remaining: Math.max(newRemaining, 0) };
    } catch (error) {
      console.error(`[quota] Redis error during spend:`, error);
      return { charged: targetBucket, remaining: 0 };
    }
  }

  /**
   * Get remaining units for a specific bucket.
   */
  async getRemaining(bucket: BucketName): Promise<number> {
    const config = BUCKETS[bucket];
    try {
      const redis = getRedisConnection();
      const val = await redis.get(config.key);
      const used = val ? parseInt(val, 10) : 0;
      return Math.max(config.limit - used, 0);
    } catch {
      // Redis down — assume full budget to avoid blocking
      return config.limit;
    }
  }

  /**
   * Get full status of all buckets.
   */
  async getStatus(): Promise<{
    buckets: Record<BucketName, { used: number; limit: number; remaining: number; percent: string }>;
    total: { used: number; limit: number; remaining: number; percent: string };
    resetsInSeconds: number;
    mode: "api" | "degraded" | "scraper-only";
  }> {
    const redis = getRedisConnection();
    const bucketNames = Object.keys(BUCKETS) as BucketName[];

    const results: Record<string, { used: number; limit: number; remaining: number; percent: string }> = {};
    let totalUsed = 0;

    for (const name of bucketNames) {
      const config = BUCKETS[name];
      try {
        const val = await redis.get(config.key);
        const used = val ? parseInt(val, 10) : 0;
        const remaining = Math.max(config.limit - used, 0);
        results[name] = {
          used,
          limit: config.limit,
          remaining,
          percent: ((used / config.limit) * 100).toFixed(1) + "%",
        };
        totalUsed += used;
      } catch {
        results[name] = {
          used: 0,
          limit: config.limit,
          remaining: config.limit,
          percent: "0.0%",
        };
      }
    }

    // Check TTL for reset time
    let resetsInSeconds = 0;
    try {
      const ttl = await redis.ttl(BUCKETS.discovery.key);
      resetsInSeconds = ttl > 0 ? ttl : 0;
    } catch {
      // ignore
    }

    // Determine operating mode
    const searchRemaining = results.search?.remaining ?? 0;
    const bufferRemaining = results.buffer?.remaining ?? 0;
    let mode: "api" | "degraded" | "scraper-only" = "api";
    if (searchRemaining === 0 && bufferRemaining === 0) {
      mode = "scraper-only";
    } else if (searchRemaining === 0) {
      mode = "degraded";
    }

    return {
      buckets: results as Record<BucketName, { used: number; limit: number; remaining: number; percent: string }>,
      total: {
        used: totalUsed,
        limit: TOTAL_DAILY_LIMIT,
        remaining: Math.max(TOTAL_DAILY_LIMIT - totalUsed, 0),
        percent: ((totalUsed / TOTAL_DAILY_LIMIT) * 100).toFixed(1) + "%",
      },
      resetsInSeconds,
      mode,
    };
  }

  /**
   * Reset all buckets to zero. Called by midnight cron.
   */
  async resetDaily(): Promise<void> {
    const redis = getRedisConnection();
    const secondsInDay = 86400;

    for (const name of Object.keys(BUCKETS) as BucketName[]) {
      const config = BUCKETS[name];
      await redis.set(config.key, "0", "EX", secondsInDay);
    }

    console.log("[quota] ✅ Daily quota reset — all buckets at 0");
  }

  /**
   * Ensure a Redis key has a midnight UTC expiry set.
   */
  private async ensureExpiry(key: string): Promise<void> {
    try {
      const redis = getRedisConnection();
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setUTCHours(24, 0, 0, 0);
        const seconds = Math.floor((midnight.getTime() - now.getTime()) / 1000);
        await redis.expire(key, seconds);
      }
    } catch {
      // Non-critical — expiry is a safety net
    }
  }
}

// Singleton
export const quotaManager = new QuotaManager();
