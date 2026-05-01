// YouTube Data API v3 service for channel and video data ingestion
const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeChannelData {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  country: string | null;
  publishedAt: string;
}

interface YouTubeVideoData {
  id: string;
  title: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  publishedAt: string;
  thumbnail: string;
}

function getApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) throw new Error("YOUTUBE_API_KEY is not set");
  return key;
}

// Search for YouTube channels by keyword/niche
export async function searchChannels(
  query: string,
  maxResults = 25
): Promise<string[]> {
  const key = getApiKey();
  const url = `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${encodeURIComponent(
    query
  )}&maxResults=${maxResults}&key=${key}`;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(
      `YouTube search failed: ${err.error?.message || res.statusText}`
    );
  }

  const data = await res.json();
  return data.items.map(
    (item: { snippet: { channelId: string } }) => item.snippet.channelId
  );
}

// Get detailed channel data by channel IDs
export async function getChannelDetails(
  channelIds: string[]
): Promise<YouTubeChannelData[]> {
  const key = getApiKey();
  const channels: YouTubeChannelData[] = [];

  // API limit: 50 IDs per request
  for (let i = 0; i < channelIds.length; i += 50) {
    const batch = channelIds.slice(i, i + 50);
    const url = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics&id=${batch.join(
      ","
    )}&key=${key}`;

    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json();
      throw new Error(
        `YouTube channels fetch failed: ${err.error?.message || res.statusText}`
      );
    }

    const data = await res.json();
    for (const item of data.items) {
      channels.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description || "",
        thumbnailUrl:
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          "",
        subscriberCount: parseInt(item.statistics.subscriberCount || "0", 10),
        viewCount: parseInt(item.statistics.viewCount || "0", 10),
        videoCount: parseInt(item.statistics.videoCount || "0", 10),
        country: item.snippet.country || null,
        publishedAt: item.snippet.publishedAt,
      });
    }
  }

  return channels;
}

// Get recent videos from a channel
export async function getChannelVideos(
  channelId: string,
  maxResults = 10
): Promise<YouTubeVideoData[]> {
  const key = getApiKey();

  // Step 1: Search for recent videos from this channel
  const searchUrl = `${YOUTUBE_API_BASE}/search?part=snippet&channelId=${channelId}&type=video&order=date&maxResults=${maxResults}&key=${key}`;
  const searchRes = await fetch(searchUrl);
  if (!searchRes.ok) {
    const err = await searchRes.json();
    throw new Error(
      `YouTube video search failed: ${err.error?.message || searchRes.statusText}`
    );
  }

  const searchData = await searchRes.json();
  const videoIds = searchData.items.map(
    (item: { id: { videoId: string } }) => item.id.videoId
  );

  if (videoIds.length === 0) return [];

  // Step 2: Get full video statistics
  const statsUrl = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics&id=${videoIds.join(
    ","
  )}&key=${key}`;
  const statsRes = await fetch(statsUrl);
  if (!statsRes.ok) {
    const err = await statsRes.json();
    throw new Error(
      `YouTube video stats failed: ${err.error?.message || statsRes.statusText}`
    );
  }

  const statsData = await statsRes.json();
  return statsData.items.map(
    (item: {
      id: string;
      snippet: {
        title: string;
        publishedAt: string;
        thumbnails: { medium?: { url: string }; default?: { url: string } };
      };
      statistics: {
        viewCount?: string;
        likeCount?: string;
        commentCount?: string;
      };
    }) => ({
      id: item.id,
      title: item.snippet.title,
      viewCount: parseInt(item.statistics.viewCount || "0", 10),
      likeCount: parseInt(item.statistics.likeCount || "0", 10),
      commentCount: parseInt(item.statistics.commentCount || "0", 10),
      publishedAt: item.snippet.publishedAt,
      thumbnail:
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url ||
        "",
    })
  );
}

// Calculate channel metrics from video data
export function calculateChannelMetrics(videos: YouTubeVideoData[]) {
  if (videos.length === 0) {
    return {
      growthRate30d: 0,
      growthRate7d: 0,
      viewsLast48h: 0,
      uploadFrequency: 0,
      isOutlier: false,
      isTrending: false,
      avgViewsPerVideo: 0,
    };
  }

  const now = Date.now();
  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0);
  const avgViews = totalViews / videos.length;

  // Videos published in last 48 hours
  const recent48h = videos.filter(
    (v) => now - new Date(v.publishedAt).getTime() < 48 * 60 * 60 * 1000
  );
  const viewsLast48h = recent48h.reduce((sum, v) => sum + v.viewCount, 0);

  // Videos published in last 7 days
  const recent7d = videos.filter(
    (v) => now - new Date(v.publishedAt).getTime() < 7 * 24 * 60 * 60 * 1000
  );

  // Upload frequency: videos per week
  const dates = videos.map((v) => new Date(v.publishedAt).getTime());
  const timespan = Math.max(...dates) - Math.min(...dates);
  const weeks = Math.max(timespan / (7 * 24 * 60 * 60 * 1000), 1);
  const uploadFrequency = parseFloat((videos.length / weeks).toFixed(1));

  // Growth rate approximation
  const recentAvg =
    recent7d.length > 0
      ? recent7d.reduce((sum, v) => sum + v.viewCount, 0) / recent7d.length
      : 0;
  const olderVideos = videos.filter(
    (v) => now - new Date(v.publishedAt).getTime() > 7 * 24 * 60 * 60 * 1000
  );
  const olderAvg =
    olderVideos.length > 0
      ? olderVideos.reduce((sum, v) => sum + v.viewCount, 0) /
        olderVideos.length
      : recentAvg;

  const growthRate7d =
    olderAvg > 0
      ? parseFloat((((recentAvg - olderAvg) / olderAvg) * 100).toFixed(1))
      : 0;
  const growthRate30d = parseFloat((growthRate7d * 1.5).toFixed(1)); // rough estimate

  // Outlier detection: views much higher than average
  const maxViews = Math.max(...videos.map((v) => v.viewCount));
  const isOutlier = maxViews > avgViews * 10;

  // Trending: recent videos performing significantly better
  const isTrending = recent7d.length > 0 && recentAvg > avgViews * 1.5;

  return {
    growthRate30d,
    growthRate7d,
    viewsLast48h,
    uploadFrequency,
    isOutlier,
    isTrending,
    avgViewsPerVideo: Math.round(avgViews),
  };
}

// Estimate monthly revenue from views and CPM
export function estimateRevenue(
  totalViews: number,
  videoCount: number,
  cpm = 8.0
): number {
  // Rough estimate: (views per month) * CPM / 1000
  // Assume videos get 30% of their lifetime views in first month
  const monthlyViews = videoCount > 0 ? (totalViews / videoCount) * 4 * 0.3 : 0;
  return parseFloat(((monthlyViews * cpm) / 1000).toFixed(2));
}

// Calculate niche score (0-100)
export function calculateNicheScore(
  subscriberCount: number,
  viewCount: number,
  videoCount: number,
  growthRate: number,
  uploadFrequency: number
): number {
  let score = 0;

  // Views per video (25 points max)
  const vpv = videoCount > 0 ? viewCount / videoCount : 0;
  if (vpv > 1000000) score += 25;
  else if (vpv > 500000) score += 22;
  else if (vpv > 100000) score += 18;
  else if (vpv > 50000) score += 14;
  else if (vpv > 10000) score += 10;
  else if (vpv > 1000) score += 5;

  // Subscriber count (20 points max)
  if (subscriberCount > 1000000) score += 20;
  else if (subscriberCount > 500000) score += 17;
  else if (subscriberCount > 100000) score += 14;
  else if (subscriberCount > 50000) score += 11;
  else if (subscriberCount > 10000) score += 8;
  else if (subscriberCount > 1000) score += 4;

  // Growth rate (20 points max)
  if (growthRate > 50) score += 20;
  else if (growthRate > 25) score += 16;
  else if (growthRate > 10) score += 12;
  else if (growthRate > 5) score += 8;
  else if (growthRate > 0) score += 4;

  // Upload consistency (15 points max)
  if (uploadFrequency >= 3) score += 15;
  else if (uploadFrequency >= 2) score += 12;
  else if (uploadFrequency >= 1) score += 9;
  else if (uploadFrequency >= 0.5) score += 5;

  // Total views engagement (20 points max)
  if (viewCount > 100000000) score += 20;
  else if (viewCount > 50000000) score += 16;
  else if (viewCount > 10000000) score += 12;
  else if (viewCount > 1000000) score += 8;
  else if (viewCount > 100000) score += 4;

  return Math.min(score, 100);
}
