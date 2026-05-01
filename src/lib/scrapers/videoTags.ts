/**
 * Video Tags Extractor (youtubei/v1/player)
 *
 * YouTube removed tags from the official API in 2022.
 * They're still fully available in the internal player endpoint.
 * Major competitive advantage — reveals creators' hidden keywords.
 *
 * Free, no API key, no quota.
 */

import {
  getChannelVideos,
} from "@/lib/data/youtubeiClient";

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Config ──────────────────────────────────────────────────────

const YT_PLAYER_URL = "https://www.youtube.com/youtubei/v1/player";

const WEB_CONTEXT = {
  client: {
    clientName: "WEB",
    clientVersion: "2.20231121.00.00",
    hl: "en",
    gl: "US",
  },
};

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
];

// ─── Types ───────────────────────────────────────────────────────

export interface VideoTagsResult {
  videoId: string;
  title: string;
  tags: string[];
  category: string;
  description: string;
}

export interface NicheKeywordEntry {
  keyword: string;
  frequency: number;
  channels: string[];
}

// ─── FUNCTION 1: getVideoTags ────────────────────────────────────

/**
 * Extract hidden video tags via youtubei/v1/player.
 * These are the creator's keyword tags — invisible in UI and official API.
 */
export async function getVideoTags(videoId: string): Promise<string[]> {
  try {
    const res = await fetch(YT_PLAYER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        Origin: "https://www.youtube.com",
        Referer: `https://www.youtube.com/watch?v=${videoId}`,
      },
      body: JSON.stringify({
        videoId,
        context: WEB_CONTEXT,
        playbackContext: {
          contentPlaybackContext: {
            signatureTimestamp: 19950,
          },
        },
      }),
    });

    if (!res.ok) {
      console.warn(`[VideoTags] HTTP ${res.status} for ${videoId}`);
      return [];
    }

    const data = await res.json();
    const keywords = data?.videoDetails?.keywords;

    if (Array.isArray(keywords)) {
      return keywords.map((k: string) => k.toLowerCase().trim()).filter(Boolean);
    }

    return [];
  } catch (error) {
    console.warn(`[VideoTags] Failed for ${videoId}:`, error);
    return [];
  }
}

/**
 * Get full video tag details including title, category, description.
 */
export async function getVideoTagsDetailed(
  videoId: string
): Promise<VideoTagsResult | null> {
  try {
    const res = await fetch(YT_PLAYER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        Origin: "https://www.youtube.com",
        Referer: `https://www.youtube.com/watch?v=${videoId}`,
      },
      body: JSON.stringify({
        videoId,
        context: WEB_CONTEXT,
        playbackContext: {
          contentPlaybackContext: {
            signatureTimestamp: 19950,
          },
        },
      }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    const details = data?.videoDetails;

    if (!details) return null;

    return {
      videoId,
      title: details.title || "",
      tags: (details.keywords || []).map((k: string) =>
        k.toLowerCase().trim()
      ),
      category: data?.microformat?.playerMicroformatRenderer?.category || "",
      description: (details.shortDescription || "").slice(0, 500),
    };
  } catch {
    return null;
  }
}

// ─── FUNCTION 2: buildNicheKeywordMap ────────────────────────────

/**
 * Build a keyword frequency map from tags across multiple channels.
 * Reveals the most-used keywords in a niche.
 *
 * @param channelIds - Channel IDs to analyze
 * @param videosPerChannel - How many recent videos to scrape per channel
 * @returns Map<keyword, frequency> sorted by frequency
 */
export async function buildNicheKeywordMap(
  channelIds: string[],
  videosPerChannel = 5
): Promise<Map<string, number>> {
  const tagCounts = new Map<string, number>();
  let totalVideosProcessed = 0;
  let totalTagsFound = 0;

  for (const channelId of channelIds) {
    try {
      // Get recent videos for this channel
      const videos = await getChannelVideos(channelId);
      const videosToProcess = videos.slice(0, videosPerChannel);

      for (const video of videosToProcess) {
        const tags = await getVideoTags(video.videoId);
        totalVideosProcessed++;

        for (const tag of tags) {
          const normalized = tag.toLowerCase().trim();
          if (normalized.length >= 2 && normalized.length <= 60) {
            tagCounts.set(normalized, (tagCounts.get(normalized) || 0) + 1);
            totalTagsFound++;
          }
        }

        // 300ms between video tag requests
        await new Promise((r) => setTimeout(r, 300));
      }

      // 500ms between channels
      await new Promise((r) => setTimeout(r, 500));
    } catch (error) {
      console.warn(`[VideoTags] Channel ${channelId} failed:`, error);
    }
  }

  console.log(
    `[VideoTags] Processed ${totalVideosProcessed} videos, ` +
    `found ${totalTagsFound} tags, ` +
    `${tagCounts.size} unique keywords`
  );

  // Sort by frequency (descending)
  const sorted = new Map(
    Array.from(tagCounts.entries()).sort((a, b) => b[1] - a[1])
  );

  return sorted;
}

/**
 * Build detailed keyword map with channel attribution.
 */
export async function buildDetailedKeywordMap(
  channelIds: string[],
  videosPerChannel = 3
): Promise<NicheKeywordEntry[]> {
  const keywords = new Map<string, { count: number; channels: Set<string> }>();

  for (const channelId of channelIds) {
    try {
      const videos = await getChannelVideos(channelId);

      for (const video of videos.slice(0, videosPerChannel)) {
        const tags = await getVideoTags(video.videoId);

        for (const tag of tags) {
          const normalized = tag.toLowerCase().trim();
          if (normalized.length < 2 || normalized.length > 60) continue;

          const entry = keywords.get(normalized) || {
            count: 0,
            channels: new Set<string>(),
          };
          entry.count++;
          entry.channels.add(channelId);
          keywords.set(normalized, entry);
        }

        await new Promise((r) => setTimeout(r, 300));
      }

      await new Promise((r) => setTimeout(r, 500));
    } catch {
      // Skip failed channels
    }
  }

  return Array.from(keywords.entries())
    .map(([keyword, data]) => ({
      keyword,
      frequency: data.count,
      channels: Array.from(data.channels),
    }))
    .sort((a, b) => b.frequency - a.frequency);
}
