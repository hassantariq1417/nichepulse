/**
 * SocialBlade Scraper
 *
 * Extracts historical growth data that YouTube API never exposed.
 * Gives us 30d/90d subscriber & view growth rates.
 * Free, no API key.
 */

import * as cheerio from "cheerio";

// ─── Types ───────────────────────────────────────────────────────

export interface ChannelGrowthData {
  channelName: string;
  channelUrl: string;
  subscriberCount: number;
  monthlyViews: number;
  rank: number;
}

export interface MonthlyDataPoint {
  date: string;
  subscribers: number;
  views: number;
}

export interface GrowthHistory {
  channelId: string;
  monthlyData: MonthlyDataPoint[];
  subscriberGrowth30d: number;
  subscriberGrowth90d: number;
  viewGrowth30d: number;
  trend: "up" | "stable" | "down";
}

// ─── Rate Limiter ────────────────────────────────────────────────

const REQUEST_DELAY_MS = 2000;
let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response | null> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_DELAY_MS) {
    await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS - elapsed));
  }
  lastRequestTime = Date.now();

  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) {
      console.warn(`[SocialBlade] HTTP ${res.status} for ${url}`);
      return null;
    }

    return res;
  } catch (error) {
    console.warn(`[SocialBlade] Fetch failed for ${url}:`, error);
    return null;
  }
}

// ─── SocialBlade Category Map ────────────────────────────────────

const SOCIALBLADE_CATEGORIES: Record<string, string> = {
  finance: "education",
  ai_tools: "science",
  stoicism: "education",
  true_crime: "entertainment",
  dark_history: "education",
  fitness: "sports",
  productivity: "howto",
  luxury: "entertainment",
  mindset: "education",
  business: "education",
  real_estate: "education",
  coding: "science",
  language: "education",
  travel: "travel",
  health: "howto",
};

// ─── FUNCTION 1: scrapeTopChannels ───────────────────────────────

/**
 * Scrape SocialBlade's top channels list for a category.
 * Returns channel names, URLs, sub counts, and monthly views.
 */
export async function scrapeTopChannels(
  category: string
): Promise<ChannelGrowthData[]> {
  const sbCategory = SOCIALBLADE_CATEGORIES[category] || category;
  const url = `https://socialblade.com/youtube/top/50/category/${sbCategory}`;

  const res = await rateLimitedFetch(url);
  if (!res) return [];

  try {
    const html = await res.text();
    const $ = cheerio.load(html);
    const channels: ChannelGrowthData[] = [];

    // SocialBlade uses div-based table rows
    $("div[style*='line-height']").each((index, el) => {
      const row = $(el);
      const cells = row.find("div[style*='float']");

      if (cells.length >= 4) {
        const nameEl = cells.eq(1).find("a");
        const channelName = nameEl.text().trim();
        const channelUrl = nameEl.attr("href") || "";

        const subscriberText = cells.eq(2).text().trim();
        const viewsText = cells.eq(3).text().trim();

        if (channelName && channelName.length > 0) {
          channels.push({
            channelName,
            channelUrl: channelUrl.startsWith("/")
              ? `https://socialblade.com${channelUrl}`
              : channelUrl,
            subscriberCount: parseCompactNumber(subscriberText),
            monthlyViews: parseCompactNumber(viewsText),
            rank: index + 1,
          });
        }
      }
    });

    // Fallback: try table-based layout
    if (channels.length === 0) {
      $("table tbody tr, .TableMonthlyStats tr").each((index, el) => {
        const row = $(el);
        const cells = row.find("td");

        if (cells.length >= 3) {
          const nameEl = cells.eq(0).find("a").first();
          const channelName = nameEl.text().trim() || cells.eq(0).text().trim();
          const channelUrl = nameEl.attr("href") || "";

          if (channelName) {
            channels.push({
              channelName,
              channelUrl: channelUrl.startsWith("/")
                ? `https://socialblade.com${channelUrl}`
                : channelUrl,
              subscriberCount: parseCompactNumber(cells.eq(1).text().trim()),
              monthlyViews: parseCompactNumber(cells.eq(2).text().trim()),
              rank: index + 1,
            });
          }
        }
      });
    }

    console.log(`[SocialBlade] Found ${channels.length} top channels for "${category}"`);
    return channels;
  } catch (error) {
    console.error(`[SocialBlade] Parse failed for "${category}":`, error);
    return [];
  }
}

// ─── FUNCTION 2: scrapeChannelGrowth ─────────────────────────────

/**
 * Scrape historical growth data for a specific channel.
 * Extracts monthly subscriber/view data from SocialBlade's history table.
 * Returns growth rates that YouTube API never exposed.
 */
export async function scrapeChannelGrowth(
  channelId: string
): Promise<GrowthHistory | null> {
  const url = `https://socialblade.com/youtube/channel/${channelId}`;

  const res = await rateLimitedFetch(url);
  if (!res) return null;

  try {
    const html = await res.text();
    const $ = cheerio.load(html);
    const monthlyData: MonthlyDataPoint[] = [];

    // SocialBlade embeds stats in div elements with specific IDs/styles
    // Try multiple selectors for their changing layouts

    // Pattern 1: monthly stats table
    $("div#socialblade-user-content table tbody tr, .TableMonthlyStats tr").each(
      (_, el) => {
        const cells = $(el).find("td");
        if (cells.length >= 3) {
          const date = cells.eq(0).text().trim();
          const subs = parseCompactNumber(cells.eq(1).text().trim());
          const views = parseCompactNumber(cells.eq(2).text().trim());

          if (date && (subs > 0 || views > 0)) {
            monthlyData.push({ date, subscribers: subs, views });
          }
        }
      }
    );

    // Pattern 2: inline stat divs
    if (monthlyData.length === 0) {
      const statDivs = $("div[style*='width: 860px'] > div");
      let currentDate = "";

      statDivs.each((_, el) => {
        const text = $(el).text().trim();
        const dateMatch = text.match(
          /(\w{3}\s+\d{1,2}(?:st|nd|rd|th)?,?\s*\d{4})/
        );

        if (dateMatch) {
          currentDate = dateMatch[1];
        }

        if (currentDate) {
          const subMatch = text.match(/([\d,.]+[KMB]?)\s*subscriber/i);
          const viewMatch = text.match(/([\d,.]+[KMB]?)\s*view/i);

          if (subMatch || viewMatch) {
            monthlyData.push({
              date: currentDate,
              subscribers: subMatch ? parseCompactNumber(subMatch[1]) : 0,
              views: viewMatch ? parseCompactNumber(viewMatch[1]) : 0,
            });
            currentDate = "";
          }
        }
      });
    }

    // Pattern 3: extract from embedded JavaScript data
    if (monthlyData.length === 0) {
      const scriptData = html.match(
        /chart[_-]?data[\s]*[=:][\s]*\[([^\]]+)\]/i
      );
      if (scriptData) {
        try {
          const dataPoints = JSON.parse(`[${scriptData[1]}]`);
          for (const point of dataPoints) {
            if (Array.isArray(point) && point.length >= 2) {
              monthlyData.push({
                date: String(point[0]),
                subscribers: Number(point[1]) || 0,
                views: point[2] ? Number(point[2]) : 0,
              });
            }
          }
        } catch {
          // JSON parse failed, skip
        }
      }
    }

    if (monthlyData.length < 2) {
      console.warn(`[SocialBlade] Insufficient data for ${channelId}`);
      return null;
    }

    // Calculate growth rates
    const subscriberGrowth30d = calculateGrowthRate(
      monthlyData,
      "subscribers",
      30
    );
    const subscriberGrowth90d = calculateGrowthRate(
      monthlyData,
      "subscribers",
      90
    );
    const viewGrowth30d = calculateGrowthRate(monthlyData, "views", 30);

    // Determine trend
    let trend: "up" | "stable" | "down";
    if (subscriberGrowth30d > 5) trend = "up";
    else if (subscriberGrowth30d < -5) trend = "down";
    else trend = "stable";

    return {
      channelId,
      monthlyData: monthlyData.slice(0, 12),
      subscriberGrowth30d,
      subscriberGrowth90d,
      viewGrowth30d,
      trend,
    };
  } catch (error) {
    console.error(`[SocialBlade] Growth scrape failed for ${channelId}:`, error);
    return null;
  }
}

/**
 * Batch scrape growth data for multiple channels.
 */
export async function batchScrapeGrowth(
  channelIds: string[],
  onProgress?: (completed: number, total: number) => void
): Promise<Map<string, GrowthHistory>> {
  const results = new Map<string, GrowthHistory>();

  for (let i = 0; i < channelIds.length; i++) {
    const growth = await scrapeChannelGrowth(channelIds[i]);
    if (growth) results.set(channelIds[i], growth);

    onProgress?.(i + 1, channelIds.length);
  }

  return results;
}

// ─── Helpers ─────────────────────────────────────────────────────

function parseCompactNumber(text: string): number {
  if (!text) return 0;
  const cleaned = text.replace(/[,\s$+]/g, "").trim();
  const match = cleaned.match(/^-?([\d.]+)\s*([KMBkmb])?/);
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

function calculateGrowthRate(
  data: MonthlyDataPoint[],
  field: "subscribers" | "views",
  days: number
): number {
  if (data.length < 2) return 0;

  const recent = data[0][field];
  const monthsBack = Math.min(Math.ceil(days / 30), data.length - 1);
  const older = data[monthsBack]?.[field] || data[data.length - 1][field];

  if (older === 0) return 0;
  return parseFloat((((recent - older) / older) * 100).toFixed(1));
}
