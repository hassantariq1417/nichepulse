/**
 * Lightweight YouTube HTML Scraper
 *
 * Zero API quota cost — scrapes public YouTube pages using cheerio.
 * Used as fallback when YouTube Data API quota is exhausted.
 */

import * as cheerio from "cheerio";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const FETCH_OPTIONS: RequestInit = {
  headers: {
    "User-Agent": USER_AGENT,
    "Accept-Language": "en-US,en;q=0.9",
    Accept: "text/html,application/xhtml+xml",
  },
};

// ─── Types ───────────────────────────────────────────────────────

export interface ScrapedChannelData {
  title: string;
  description: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  thumbnailUrl: string;
  country: string | null;
}

export interface ScrapedVideoStats {
  viewCount: number;
  title: string;
  likeCount: number;
  publishedAt: string;
}

// ─── Channel Scraper ─────────────────────────────────────────────

/**
 * Scrape a YouTube channel's public page for basic data.
 * Costs ZERO API units.
 */
export async function scrapeChannelPublicPage(
  channelId: string
): Promise<ScrapedChannelData | null> {
  try {
    const url = `https://www.youtube.com/channel/${channelId}`;
    const res = await fetch(url, FETCH_OPTIONS);

    if (!res.ok) {
      console.warn(`[scraper] Channel page fetch failed: ${res.status}`);
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract from meta tags
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text().replace(" - YouTube", "").trim() ||
      "";

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    const thumbnailUrl =
      $('meta[property="og:image"]').attr("content") ||
      $('link[rel="image_src"]').attr("href") ||
      "";

    // Try to extract subscriber count from ytInitialData
    const subscriberCount = extractFromInitialData(html, "subscriberCountText");
    const videoCount = extractFromInitialData(html, "videosCountText");

    // Try to get view count from about page data embedded in HTML
    const viewCount = extractTotalViews(html);

    return {
      title,
      description,
      subscriberCount: parseHumanNumber(subscriberCount),
      videoCount: parseHumanNumber(videoCount),
      viewCount: parseHumanNumber(viewCount.toString()),
      thumbnailUrl,
      country: null, // Not reliably available from page scrape
    };
  } catch (error) {
    console.error(`[scraper] Channel scrape failed for ${channelId}:`, error);
    return null;
  }
}

// ─── Video Scraper ───────────────────────────────────────────────

/**
 * Scrape a YouTube video page for view count and basic stats.
 * Costs ZERO API units.
 */
export async function scrapeVideoStats(
  videoId: string
): Promise<ScrapedVideoStats | null> {
  try {
    const url = `https://www.youtube.com/watch?v=${videoId}`;
    const res = await fetch(url, FETCH_OPTIONS);

    if (!res.ok) {
      console.warn(`[scraper] Video page fetch failed: ${res.status}`);
      return null;
    }

    const html = await res.text();

    // Extract ytInitialData JSON from page
    const initialData = extractYtInitialData(html);
    if (!initialData) {
      // Fallback: try ytInitialPlayerResponse
      const playerData = extractYtInitialPlayerResponse(html);
      if (playerData) {
        return {
          viewCount: parseInt(playerData?.videoDetails?.viewCount || "0", 10),
          title: playerData?.videoDetails?.title || "",
          likeCount: 0,
          publishedAt: "",
        };
      }
      return null;
    }

    // Navigate the ytInitialData structure for video info
    const videoPrimary =
      initialData?.contents?.twoColumnWatchNextResults?.results?.results
        ?.contents;

    let viewCount = 0;
    let title = "";
    let publishedAt = "";

    if (Array.isArray(videoPrimary)) {
      for (const content of videoPrimary) {
        const primary = content?.videoPrimaryInfoRenderer;
        if (primary) {
          // View count
          const viewCountText =
            primary?.viewCount?.videoViewCountRenderer?.viewCount?.simpleText ||
            "";
          viewCount = parseHumanNumber(viewCountText);

          // Title
          title =
            primary?.title?.runs?.map((r: { text: string }) => r.text).join("") ||
            "";

          // Date
          publishedAt =
            primary?.dateText?.simpleText || "";
        }
      }
    }

    return {
      viewCount,
      title,
      likeCount: 0, // Not reliably extractable from scrape
      publishedAt,
    };
  } catch (error) {
    console.error(`[scraper] Video scrape failed for ${videoId}:`, error);
    return null;
  }
}

// ─── Scrape recent video IDs from a channel ──────────────────────

/**
 * Extract recent video IDs from a channel's page.
 * Useful as a zero-cost alternative to search.list API.
 */
export async function scrapeChannelVideoIds(
  channelId: string,
  maxResults = 10
): Promise<string[]> {
  try {
    const url = `https://www.youtube.com/channel/${channelId}/videos`;
    const res = await fetch(url, FETCH_OPTIONS);
    if (!res.ok) return [];

    const html = await res.text();
    const initialData = extractYtInitialData(html);
    if (!initialData) return [];

    const videoIds: string[] = [];

    // Navigate to the video tab content
    const tabs =
      initialData?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];

    for (const tab of tabs) {
      const tabContent = tab?.tabRenderer?.content;
      const items =
        tabContent?.richGridRenderer?.contents ||
        tabContent?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer
          ?.contents?.[0]?.gridRenderer?.items ||
        [];

      for (const item of items) {
        const videoId =
          item?.richItemRenderer?.content?.videoRenderer?.videoId ||
          item?.gridVideoRenderer?.videoId;

        if (videoId && videoIds.length < maxResults) {
          videoIds.push(videoId);
        }
      }
    }

    return videoIds;
  } catch (error) {
    console.error(
      `[scraper] Channel video scrape failed for ${channelId}:`,
      error
    );
    return [];
  }
}

// ─── Helpers ─────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

function extractYtInitialData(html: string): any | null {
  const match = html.match(/var\s+ytInitialData\s*=\s*({[\s\S]+?});/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function extractYtInitialPlayerResponse(html: string): any | null {
  const match = html.match(
    /var\s+ytInitialPlayerResponse\s*=\s*({[\s\S]+?});/
  );
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function extractFromInitialData(html: string, fieldName: string): string {
  // Quick regex extraction from the JSON blob
  const pattern = new RegExp(`"${fieldName}"\\s*:\\s*\\{[^}]*"simpleText"\\s*:\\s*"([^"]+)"`, "s");
  const match = html.match(pattern);
  return match?.[1] || "0";
}

function extractTotalViews(html: string): number {
  // Try to find total view count from channel about data
  const match = html.match(
    /"viewCountText":\s*{\s*"simpleText":\s*"([\d,]+)\s*views?"/i
  );
  if (match) return parseHumanNumber(match[1]);

  // Alternative pattern
  const alt = html.match(/"viewCount":\s*"(\d+)"/);
  if (alt) return parseInt(alt[1], 10);

  return 0;
}

/**
 * Parse human-readable numbers like "1.2M", "450K", "1,234,567"
 */
function parseHumanNumber(text: string): number {
  if (!text) return 0;

  // Remove commas and non-numeric prefix
  const cleaned = text.replace(/[,\s]/g, "").replace(/^[^\d.]+/, "");

  // Handle suffixes
  const suffixMatch = cleaned.match(/^([\d.]+)\s*([KkMmBb])?/);
  if (!suffixMatch) return parseInt(cleaned, 10) || 0;

  const num = parseFloat(suffixMatch[1]);
  const suffix = (suffixMatch[2] || "").toUpperCase();

  switch (suffix) {
    case "K":
      return Math.round(num * 1_000);
    case "M":
      return Math.round(num * 1_000_000);
    case "B":
      return Math.round(num * 1_000_000_000);
    default:
      return Math.round(num);
  }
}
