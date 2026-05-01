/**
 * YouTubei Internal API Client
 *
 * Replaces YouTube Data API v3 entirely.
 * Uses YouTube's own internal endpoints (youtubei/v1).
 * No API key. No quota. Free forever.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Types ───────────────────────────────────────────────────────

export interface ChannelData {
  channelId: string;
  channelTitle: string;
  handle: string;
  description: string;
  subscriberCountText: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  country: string;
  keywords: string[];
  thumbnailUrl: string;
  bannerUrl: string;
  isVerified: boolean;
  relatedChannels: RelatedChannel[];
  recentVideos: VideoData[];
  uploadFrequency?: number;
  nicheScore?: number;
  estimatedMonthlyRevenue?: number;
}

export interface RelatedChannel {
  channelId: string;
  channelTitle: string;
  handle: string;
  subscriberCountText: string;
  subscriberCount: number;
  thumbnailUrl: string;
}

export interface VideoData {
  videoId: string;
  title: string;
  viewCountText: string;
  viewCount: number;
  publishedTimeText: string;
  publishedAt?: Date;
  lengthText: string;
  lengthSeconds: number;
  thumbnailUrl: string;
  channelId?: string;
  channelTitle?: string;
  isShort: boolean;
  viewsPerHour?: number;
}

// ─── Configuration ───────────────────────────────────────────────

const YT_BASE = "https://www.youtube.com/youtubei/v1";

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
];

const WEB_CONTEXT = {
  client: {
    clientName: "WEB",
    clientVersion: "2.20231121.00.00",
    hl: "en",
    gl: "US",
  },
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Rate Limiter ────────────────────────────────────────────────

class RateLimiter {
  private queue: Array<() => void> = [];
  private processing = false;
  private intervalMs = 600;

  async throttle<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          resolve(await fn());
        } catch (e) {
          reject(e);
        }
      });
      if (!this.processing) this.process();
    });
  }

  private async process() {
    this.processing = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (task) await task();
      if (this.queue.length > 0) await sleep(this.intervalMs);
    }
    this.processing = false;
  }
}

const rateLimiter = new RateLimiter();

// ─── Core HTTP Helper ────────────────────────────────────────────

async function ytFetch(endpoint: string, body: object, retries = 3): Promise<any> {
  const url = `${YT_BASE}/${endpoint}`;
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": userAgent,
          "Accept-Language": "en-US,en;q=0.9",
          Origin: "https://www.youtube.com",
          Referer: "https://www.youtube.com/",
          "X-YouTube-Client-Name": "1",
          "X-YouTube-Client-Version": "2.20231121.00.00",
        },
        body: JSON.stringify({ ...body, context: WEB_CONTEXT }),
      });

      if (res.status === 429) {
        console.warn(`[YouTubei] Rate limited (attempt ${attempt}/${retries})`);
        await sleep(2000 * attempt);
        continue;
      }
      if (!res.ok) {
        throw new Error(`YouTube ${res.status}: ${res.statusText}`);
      }
      return await res.json();
    } catch (error) {
      if (attempt === retries) throw error;
      await sleep(1000 * attempt);
    }
  }
}

// Always call through rate limiter
async function ytRequest(endpoint: string, body: object): Promise<any> {
  return rateLimiter.throttle(() => ytFetch(endpoint, body));
}

// ─── FUNCTION 1: getChannelData ──────────────────────────────────

/**
 * Fetch full channel data. Replaces youtube.channels.list (was 1 unit).
 * Accepts channel ID (UCxxx) or @handle.
 */
export async function getChannelData(channelIdOrHandle: string): Promise<ChannelData | null> {
  try {
    const browseId = channelIdOrHandle.startsWith("@")
      ? channelIdOrHandle
      : channelIdOrHandle;

    const data = await ytRequest("browse", { browseId });
    if (!data) return null;

    // Extract metadata
    const metadata = data?.metadata?.channelMetadataRenderer || {};
    const header =
      data?.header?.c4TabbedHeaderRenderer ||
      data?.header?.pageHeaderRenderer?.content?.pageHeaderViewModel || {};

    const channelId = metadata.externalId || channelIdOrHandle;
    const channelTitle = metadata.title || extractTextRuns(header?.title) || "";
    const description = metadata.description || "";
    const country = metadata.country || "";
    const keywords = metadata.keywords ? metadata.keywords.split(",").map((k: string) => k.trim()) : [];
    const handle = metadata.vanityChannelUrl || "";

    // Subscriber count
    const subText =
      header?.subscriberCountText?.simpleText ||
      extractTextRuns(header?.subscriberCountText) ||
      header?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content ||
      "0";
    const subscriberCount = parseSubscriberCount(subText);

    // Thumbnails
    const thumbnailUrl =
      metadata?.avatar?.thumbnails?.slice(-1)?.[0]?.url ||
      header?.avatar?.thumbnails?.slice(-1)?.[0]?.url ||
      "";

    const bannerUrl =
      header?.banner?.imageBannerViewModel?.image?.sources?.[0]?.url ||
      header?.banner?.thumbnails?.slice(-1)?.[0]?.url ||
      "";

    // Verified check
    const badges = header?.badges || [];
    const isVerified = badges.some(
      (b: any) =>
        b?.metadataBadgeRenderer?.style?.includes("VERIFIED") ||
        b?.metadataBadgeRenderer?.icon?.iconType === "CHECK_CIRCLE_THICK"
    );

    // Related channels from sidebar
    const relatedChannels = parseRelatedChannels(data);

    // Recent videos from tabs
    const recentVideos = parseRecentVideos(data);

    // Video count (estimate from metadata or tabs)
    const videoCount = recentVideos.length > 0 ? recentVideos.length : 0;

    // View count (estimate from videos)
    const viewCount = recentVideos.reduce((sum, v) => sum + v.viewCount, 0);

    return {
      channelId,
      channelTitle,
      handle,
      description,
      subscriberCountText: subText,
      subscriberCount,
      videoCount,
      viewCount,
      country,
      keywords,
      thumbnailUrl,
      bannerUrl,
      isVerified,
      relatedChannels,
      recentVideos,
    };
  } catch (error) {
    console.error(`[YouTubei] getChannelData failed for ${channelIdOrHandle}:`, error);
    return null;
  }
}

// ─── FUNCTION 2: searchChannels ──────────────────────────────────

/**
 * Search for channels by keyword. Replaces youtube.search.list (was 100 units!).
 * params EgIQAg%3D%3D = filter to channels only.
 */
export async function searchChannels(
  query: string,
  maxResults = 20
): Promise<ChannelData[]> {
  try {
    const data = await ytRequest("search", {
      query,
      params: "EgIQAg%3D%3D", // Channel filter
    });

    if (!data) return [];

    const contents =
      data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents || [];

    const channels: ChannelData[] = [];

    for (const section of contents) {
      const items = section?.itemSectionRenderer?.contents || [];
      for (const item of items) {
        const renderer = item?.channelRenderer;
        if (!renderer || channels.length >= maxResults) continue;

        const channelId = renderer.channelId || "";
        const channelTitle = renderer.title?.simpleText || extractTextRuns(renderer.title) || "";
        const subText = renderer.subscriberCountText?.simpleText || extractTextRuns(renderer.subscriberCountText) || "0";
        const thumbnailUrl = renderer.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || "";
        const handle = renderer.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || "";
        const description = renderer.descriptionSnippet?.runs?.map((r: any) => r.text).join("") || "";
        const videoCountText = renderer.videoCountText?.simpleText || extractTextRuns(renderer.videoCountText) || "0";

        channels.push({
          channelId,
          channelTitle,
          handle,
          description,
          subscriberCountText: subText,
          subscriberCount: parseSubscriberCount(subText),
          videoCount: parseViewCount(videoCountText),
          viewCount: 0,
          country: "",
          keywords: [],
          thumbnailUrl,
          bannerUrl: "",
          isVerified: false,
          relatedChannels: [],
          recentVideos: [],
        });
      }
    }

    return channels;
  } catch (error) {
    console.error(`[YouTubei] searchChannels failed for "${query}":`, error);
    return [];
  }
}

// ─── FUNCTION 3: getChannelVideos ────────────────────────────────

/**
 * Get a channel's videos tab. params = Videos tab filter.
 */
export async function getChannelVideos(channelId: string): Promise<VideoData[]> {
  try {
    const data = await ytRequest("browse", {
      browseId: channelId,
      params: "EgZ2aWRlb3PyBgQKAjoA", // Videos tab
    });

    if (!data) return [];
    return parseRecentVideos(data);
  } catch (error) {
    console.error(`[YouTubei] getChannelVideos failed for ${channelId}:`, error);
    return [];
  }
}

// ─── FUNCTION 4: getTrending ─────────────────────────────────────

/**
 * Get trending videos. browseId FEtrending = Trending page.
 */
export async function getTrending(): Promise<VideoData[]> {
  try {
    const data = await ytRequest("browse", { browseId: "FEtrending" });
    if (!data) return [];

    const videos: VideoData[] = [];
    const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];

    for (const tab of tabs) {
      const sections =
        tab?.tabRenderer?.content?.sectionListRenderer?.contents || [];
      for (const section of sections) {
        const items =
          section?.itemSectionRenderer?.contents?.[0]?.shelfRenderer?.content
            ?.expandedShelfContentsRenderer?.items ||
          section?.itemSectionRenderer?.contents || [];

        for (const item of items) {
          const vr = item?.videoRenderer;
          if (vr) videos.push(parseVideoRenderer(vr));
        }
      }
    }

    return videos;
  } catch (error) {
    console.error("[YouTubei] getTrending failed:", error);
    return [];
  }
}

// ─── FUNCTION 5: getSimilarChannels ──────────────────────────────

/**
 * Get channels related to a given channel from its page sidebar.
 */
export async function getSimilarChannels(channelId: string): Promise<RelatedChannel[]> {
  try {
    const data = await ytRequest("browse", { browseId: channelId });
    if (!data) return [];
    return parseRelatedChannels(data);
  } catch (error) {
    console.error(`[YouTubei] getSimilarChannels failed for ${channelId}:`, error);
    return [];
  }
}

// ─── Batch helper ────────────────────────────────────────────────

/**
 * Fetch multiple channels in batches with concurrency control.
 */
export async function batchGetChannels(
  channelIds: string[],
  concurrency = 3
): Promise<Map<string, ChannelData>> {
  const results = new Map<string, ChannelData>();

  for (let i = 0; i < channelIds.length; i += concurrency) {
    const chunk = channelIds.slice(i, i + concurrency);
    const settled = await Promise.allSettled(
      chunk.map((id) => getChannelData(id))
    );

    for (let j = 0; j < settled.length; j++) {
      const result = settled[j];
      if (result.status === "fulfilled" && result.value) {
        results.set(chunk[j], result.value);
      }
    }

    if (i + concurrency < channelIds.length) {
      await sleep(500);
    }
  }

  return results;
}

// ─── Parsers ─────────────────────────────────────────────────────

function parseRelatedChannels(data: any): RelatedChannel[] {
  const channels: RelatedChannel[] = [];
  const sidebar = data?.sidebar?.channelSidebarRenderer?.items || [];

  for (const item of sidebar) {
    const section = item?.channelAboutFullMetadataRenderer?.relatedChannels;
    const renderers =
      section?.miniChannelRenderer ?
        [section.miniChannelRenderer] :
        item?.relatedChannelListRenderer?.channels || [];

    for (const ch of renderers) {
      const renderer = ch?.miniChannelRenderer || ch;
      if (!renderer?.channelId) continue;

      const subText = renderer.subscriberCountText?.simpleText || extractTextRuns(renderer.subscriberCountText) || "0";
      channels.push({
        channelId: renderer.channelId,
        channelTitle: renderer.title?.simpleText || extractTextRuns(renderer.title) || "",
        handle: "",
        subscriberCountText: subText,
        subscriberCount: parseSubscriberCount(subText),
        thumbnailUrl: renderer.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || "",
      });
    }
  }

  return channels;
}

function parseRecentVideos(data: any): VideoData[] {
  const videos: VideoData[] = [];
  const tabs = data?.contents?.twoColumnBrowseResultsRenderer?.tabs || [];

  for (const tab of tabs) {
    const tabTitle = tab?.tabRenderer?.title || "";
    const content = tab?.tabRenderer?.content;
    if (!content) continue;

    // Check Videos tab or any tab with video content
    const items =
      content?.richGridRenderer?.contents ||
      content?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer
        ?.contents?.[0]?.gridRenderer?.items ||
      [];

    for (const item of items) {
      const vr =
        item?.richItemRenderer?.content?.videoRenderer ||
        item?.gridVideoRenderer ||
        item?.videoRenderer;

      if (vr) {
        videos.push(parseVideoRenderer(vr));
        if (tabTitle === "Videos" && videos.length >= 15) break;
      }
    }

    if (tabTitle === "Videos" && videos.length > 0) break;
  }

  return videos;
}

function parseVideoRenderer(vr: any): VideoData {
  const viewText = vr.viewCountText?.simpleText || extractTextRuns(vr.viewCountText) || "0";
  const lengthText = vr.lengthText?.simpleText || extractTextRuns(vr.lengthText) || "0:00";
  const publishedText = vr.publishedTimeText?.simpleText || extractTextRuns(vr.publishedTimeText) || "";
  const title = extractTextRuns(vr.title) || vr.title?.simpleText || "";
  const lengthSeconds = parseLengthText(lengthText);

  return {
    videoId: vr.videoId || "",
    title,
    viewCountText: viewText,
    viewCount: parseViewCount(viewText),
    publishedTimeText: publishedText,
    publishedAt: parseRelativeDate(publishedText) || undefined,
    lengthText,
    lengthSeconds,
    thumbnailUrl: vr.thumbnail?.thumbnails?.slice(-1)?.[0]?.url || "",
    channelId: vr.longBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || undefined,
    channelTitle: vr.longBylineText?.runs?.[0]?.text || vr.shortBylineText?.runs?.[0]?.text || undefined,
    isShort: lengthSeconds > 0 && lengthSeconds <= 60,
  };
}

// ─── Utility Functions ───────────────────────────────────────────

export function extractTextRuns(obj: any): string {
  if (!obj) return "";
  if (typeof obj === "string") return obj;
  if (obj.simpleText) return obj.simpleText;
  if (obj.runs) return obj.runs.map((r: any) => r.text || "").join("");
  if (obj.content) return obj.content;
  return "";
}

export function parseSubscriberCount(text: string): number {
  if (!text) return 0;
  const cleaned = text.replace(/subscribers?/i, "").trim();
  return parseHumanNumber(cleaned);
}

export function parseViewCount(text: string): number {
  if (!text) return 0;
  const cleaned = text.replace(/views?/i, "").replace(/,/g, "").trim();
  return parseHumanNumber(cleaned);
}

function parseHumanNumber(text: string): number {
  if (!text) return 0;
  const cleaned = text.replace(/[,\s]/g, "").trim();
  const match = cleaned.match(/^([\d.]+)\s*([KkMmBb])?/);
  if (!match) return parseInt(cleaned, 10) || 0;

  const num = parseFloat(match[1]);
  const suffix = (match[2] || "").toUpperCase();

  switch (suffix) {
    case "K": return Math.round(num * 1_000);
    case "M": return Math.round(num * 1_000_000);
    case "B": return Math.round(num * 1_000_000_000);
    default:  return Math.round(num);
  }
}

export function parseRelativeDate(text: string): Date | null {
  if (!text) return null;
  const match = text.match(/(\d+)\s*(second|minute|hour|day|week|month|year)s?\s*ago/i);
  if (!match) return null;

  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const now = Date.now();
  const ms: Record<string, number> = {
    second: 1000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_592_000_000,
    year: 31_536_000_000,
  };

  return new Date(now - amount * (ms[unit] || 0));
}

export function parseLengthText(text: string): number {
  if (!text) return 0;
  const parts = text.split(":").map(Number);
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}
