/**
 * YouTube RSS Feed Poller
 *
 * Free, no auth, no rate limit.
 * URL: https://www.youtube.com/feeds/videos.xml?channel_id={ID}
 * Returns: latest 15 videos with titles, dates, view counts.
 */

import { XMLParser } from "fast-xml-parser";

// ─── Types ───────────────────────────────────────────────────────

export interface RSSVideo {
  videoId: string;
  title: string;
  publishedAt: Date;
  viewCount: number;
  description: string;
}

export interface RSSChannelData {
  channelId: string;
  channelTitle: string;
  videos: RSSVideo[];
  uploadFrequency: number;      // avg days between uploads
  lastUploadDate: Date | null;
  videosLast7Days: number;
  videosLast30Days: number;
}

export interface BatchResult {
  channelId: string;
  success: boolean;
  data?: RSSChannelData;
  error?: string;
}

// ─── XML Parser Config ───────────────────────────────────────────

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  parseAttributeValue: true,
});

// ─── FUNCTION 1: pollChannelRSS ──────────────────────────────────

/**
 * Poll a channel's RSS feed for latest video data.
 * Completely free — no API key, no quota.
 */
export async function pollChannelRSS(channelId: string): Promise<RSSChannelData | null> {
  try {
    const url = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NichePulse/1.0; +https://nichepulse.io)",
      },
    });

    clearTimeout(timeout);

    if (res.status === 404) return null; // Channel gone
    if (!res.ok) {
      console.warn(`[RSS] Feed fetch failed for ${channelId}: ${res.status}`);
      return null;
    }

    const xmlText = await res.text();
    const parsed = parser.parse(xmlText);

    if (!parsed?.feed) return null;

    const channelTitle = parsed.feed.title || "";
    const rawEntries = parsed.feed.entry;

    // Handle single entry or array
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const entries: any[] = Array.isArray(rawEntries)
      ? rawEntries
      : rawEntries
        ? [rawEntries]
        : [];

    const now = Date.now();
    const sevenDaysAgo = now - 7 * 86_400_000;
    const thirtyDaysAgo = now - 30 * 86_400_000;

    const videos: RSSVideo[] = entries.map((entry) => {
      const videoId = entry["yt:videoId"] || "";
      const title = entry.title || "";
      const publishedAt = new Date(entry.published || entry.updated || now);
      const viewCount =
        entry?.["media:group"]?.["media:community"]?.["media:statistics"]?.[
          "@_views"
        ] || 0;
      const description = (
        entry?.["media:group"]?.["media:description"] || ""
      ).slice(0, 500);

      return { videoId, title, publishedAt, viewCount, description };
    });

    // Calculate upload frequency
    const uploadFrequency = calcUploadFrequency(videos);

    // Calculate activity stats
    const lastUploadDate = videos.length > 0 ? videos[0].publishedAt : null;
    const videosLast7Days = videos.filter(
      (v) => v.publishedAt.getTime() > sevenDaysAgo
    ).length;
    const videosLast30Days = videos.filter(
      (v) => v.publishedAt.getTime() > thirtyDaysAgo
    ).length;

    return {
      channelId,
      channelTitle,
      videos,
      uploadFrequency,
      lastUploadDate,
      videosLast7Days,
      videosLast30Days,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`[RSS] Timeout for ${channelId}`);
    } else {
      console.error(`[RSS] pollChannelRSS failed for ${channelId}:`, error);
    }
    return null;
  }
}

// ─── FUNCTION 2: pollChannelsBatch ───────────────────────────────

/**
 * Poll multiple channels in concurrent batches.
 */
export async function pollChannelsBatch(
  channelIds: string[],
  options: {
    concurrency?: number;
    delayBetweenBatches?: number;
    onProgress?: (completed: number, total: number) => void;
  } = {}
): Promise<BatchResult[]> {
  const { concurrency = 50, delayBetweenBatches = 1000, onProgress } = options;
  const results: BatchResult[] = [];
  let completed = 0;

  for (let i = 0; i < channelIds.length; i += concurrency) {
    const chunk = channelIds.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      chunk.map((id) => pollChannelRSS(id))
    );

    for (let j = 0; j < settled.length; j++) {
      completed++;
      const result = settled[j];
      if (result.status === "fulfilled" && result.value) {
        results.push({ channelId: chunk[j], success: true, data: result.value });
      } else {
        const error =
          result.status === "rejected" ? result.reason?.message : "No data";
        results.push({ channelId: chunk[j], success: false, error });
      }
      onProgress?.(completed, channelIds.length);
    }

    if (i + concurrency < channelIds.length) {
      await new Promise((r) => setTimeout(r, delayBetweenBatches));
    }
  }

  return results;
}

// ─── FUNCTION 3: detectOutlier ───────────────────────────────────

/**
 * Detect if a channel is an outlier.
 * Outlier = average video views > 30% of subscriber count.
 */
export function detectOutlier(
  subscriberCount: number,
  recentVideos: Array<{ viewCount: number }>
): boolean {
  const videosWithViews = recentVideos.filter((v) => v.viewCount > 0);
  if (videosWithViews.length < 3) return false;

  const avgViews =
    videosWithViews.reduce((sum, v) => sum + v.viewCount, 0) /
    videosWithViews.length;

  return avgViews > subscriberCount * 0.3;
}

// ─── Helpers ─────────────────────────────────────────────────────

function calcUploadFrequency(videos: RSSVideo[]): number {
  if (videos.length < 2) return 30; // Default to monthly if insufficient data

  const gaps: number[] = [];
  const sorted = [...videos].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );

  const pairs = Math.min(sorted.length - 1, 10);
  for (let i = 0; i < pairs; i++) {
    const gapMs =
      sorted[i].publishedAt.getTime() - sorted[i + 1].publishedAt.getTime();
    const gapDays = gapMs / 86_400_000;
    if (gapDays > 0) gaps.push(gapDays);
  }

  if (gaps.length === 0) return 30;
  return parseFloat((gaps.reduce((s, g) => s + g, 0) / gaps.length).toFixed(1));
}
