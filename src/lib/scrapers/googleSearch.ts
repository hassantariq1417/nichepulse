/**
 * Google Search Channel Discovery
 *
 * Scrapes Google SERPs to find YouTube channels by niche.
 * Uses site:youtube.com operator to filter results.
 * Free, no API key needed.
 */

import * as cheerio from "cheerio";

// ─── Rate Limiter ────────────────────────────────────────────────

const REQUEST_DELAY_MS = 3000;
let lastRequestTime = 0;

async function rateLimitedFetch(url: string, headers: Record<string, string>): Promise<Response> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < REQUEST_DELAY_MS) {
    await new Promise((r) => setTimeout(r, REQUEST_DELAY_MS - elapsed));
  }
  lastRequestTime = Date.now();
  return fetch(url, { headers });
}

// ─── User-Agent Rotation ─────────────────────────────────────────

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0",
];

function randomUA(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// ─── YouTube URL Parsers ─────────────────────────────────────────

const CHANNEL_PATTERNS = [
  /youtube\.com\/@([\w.-]+)/i,
  /youtube\.com\/channel\/(UC[\w-]{22})/i,
  /youtube\.com\/c\/([\w.-]+)/i,
  /youtube\.com\/user\/([\w.-]+)/i,
];

function extractChannelIdentifier(url: string): string | null {
  for (const pattern of CHANNEL_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// ─── Main Function ───────────────────────────────────────────────

/**
 * Search Google for YouTube channels in a given niche.
 * Returns deduplicated array of channel identifiers (@handles or UCxx IDs).
 */
export async function searchGoogleForChannels(
  niche: string,
  pages = 3
): Promise<string[]> {
  const discovered = new Set<string>();

  const queryVariants = [
    `site:youtube.com "@" ${niche} channel`,
    `site:youtube.com/@ ${niche}`,
    `site:youtube.com "${niche}" faceless channel`,
  ];

  for (const baseQuery of queryVariants) {
    for (let page = 0; page < pages; page++) {
      try {
        const start = page * 10;
        const encodedQuery = encodeURIComponent(baseQuery);
        const url = `https://www.google.com/search?q=${encodedQuery}&num=100&start=${start}`;

        const res = await rateLimitedFetch(url, {
          "User-Agent": randomUA(),
          "Accept-Language": "en-US,en;q=0.9",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Cache-Control": "no-cache",
        });

        if (res.status === 429) {
          console.warn(`[GoogleSearch] Rate limited on page ${page}, backing off...`);
          await new Promise((r) => setTimeout(r, 10000));
          continue;
        }

        if (!res.ok) {
          console.warn(`[GoogleSearch] HTTP ${res.status} on page ${page}`);
          continue;
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        // Extract all links from search results
        $("a[href]").each((_, el) => {
          const href = $(el).attr("href") || "";

          // Google wraps URLs in /url?q= redirects
          const actualUrl = href.startsWith("/url?q=")
            ? decodeURIComponent(href.split("/url?q=")[1]?.split("&")[0] || "")
            : href;

          const id = extractChannelIdentifier(actualUrl);
          if (id) discovered.add(id);
        });

        // Also check plain text for YouTube URLs
        const bodyText = $("body").text();
        const urlMatches = bodyText.match(/youtube\.com\/([@\w/.-]+)/gi) || [];
        for (const match of urlMatches) {
          const id = extractChannelIdentifier(`https://www.${match}`);
          if (id) discovered.add(id);
        }
      } catch (error) {
        console.error(`[GoogleSearch] Page ${page} failed for "${niche}":`, error);
      }
    }
  }

  console.log(`[GoogleSearch] Discovered ${discovered.size} channels for "${niche}"`);
  return Array.from(discovered);
}

/**
 * Run Google discovery for multiple niches.
 */
export async function discoverChannelsFromGoogle(
  niches: string[],
  pagesPerNiche = 3
): Promise<Map<string, string[]>> {
  const results = new Map<string, string[]>();

  for (const niche of niches) {
    const channels = await searchGoogleForChannels(niche, pagesPerNiche);
    results.set(niche, channels);

    // Extra delay between niches to avoid captcha
    await new Promise((r) => setTimeout(r, 5000));
  }

  return results;
}
