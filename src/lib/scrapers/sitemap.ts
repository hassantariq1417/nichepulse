/**
 * YouTube Sitemap Parser
 *
 * YouTube publishes public sitemaps listing channel URLs.
 * Parse once → get thousands of channel IDs instantly.
 * Free, no auth, single run.
 */

import { XMLParser } from "fast-xml-parser";

// ─── Types ───────────────────────────────────────────────────────

export interface SitemapResult {
  channelIds: string[];
  handles: string[];
  sitemapsProcessed: number;
  totalUrlsFound: number;
}

// ─── XML Parser ──────────────────────────────────────────────────

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
});

// ─── Channel ID/Handle Extraction ────────────────────────────────
function extractFromUrl(url: string): { type: "id" | "handle"; value: string } | null {
  // UC-style channel ID
  const idMatch = url.match(/youtube\.com\/channel\/(UC[\w-]{22})/);
  if (idMatch) return { type: "id", value: idMatch[1] };

  // @handle
  const handleMatch = url.match(/youtube\.com\/@([\w.-]+)/);
  if (handleMatch) return { type: "handle", value: `@${handleMatch[1]}` };

  // /c/name
  const cMatch = url.match(/youtube\.com\/c\/([\w.-]+)/);
  if (cMatch) return { type: "handle", value: cMatch[1] };

  return null;
}

// ─── FUNCTION 1: parseYouTubeSitemap ─────────────────────────────

/**
 * Parse YouTube's public sitemap to discover channel URLs.
 * Fetches the sitemap index, then samples child sitemaps.
 *
 * @param maxChildSitemaps - How many child sitemaps to process (default 10)
 * @returns Deduplicated channel IDs and handles
 */
export async function parseYouTubeSitemap(
  maxChildSitemaps = 10
): Promise<SitemapResult> {
  const channelIds = new Set<string>();
  const handles = new Set<string>();
  let sitemapsProcessed = 0;
  let totalUrlsFound = 0;

  try {
    // Step 1: Fetch the sitemap index
    console.log("[Sitemap] Fetching YouTube sitemap index...");

    const indexRes = await fetch("https://www.youtube.com/sitemaps/sitemap.xml", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; NichePulse/1.0; +https://nichepulse.io)",
      },
    });

    if (!indexRes.ok) {
      console.warn(`[Sitemap] Index fetch failed: ${indexRes.status}`);
      return { channelIds: [], handles: [], sitemapsProcessed: 0, totalUrlsFound: 0 };
    }

    const indexXml = await indexRes.text();
    const indexData = parser.parse(indexXml);

    // Extract child sitemap URLs
    const sitemapUrls = extractSitemapUrls(indexData);

    if (sitemapUrls.length === 0) {
      console.warn("[Sitemap] No child sitemaps found in index");
      return { channelIds: [], handles: [], sitemapsProcessed: 0, totalUrlsFound: 0 };
    }

    console.log(`[Sitemap] Found ${sitemapUrls.length} child sitemaps`);

    // Step 2: Sample child sitemaps
    const toProcess = sitemapUrls.slice(0, maxChildSitemaps);

    for (const sitemapUrl of toProcess) {
      try {
        console.log(`[Sitemap] Processing: ${sitemapUrl}`);

        const res = await fetch(sitemapUrl, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; NichePulse/1.0; +https://nichepulse.io)",
          },
        });

        if (!res.ok) {
          console.warn(`[Sitemap] Child sitemap failed: ${res.status}`);
          continue;
        }

        const xml = await res.text();
        const data = parser.parse(xml);

        // Extract all <loc> URLs
        const urls = extractLocUrls(data);
        totalUrlsFound += urls.length;

        for (const url of urls) {
          const extracted = extractFromUrl(url);
          if (extracted) {
            if (extracted.type === "id") {
              channelIds.add(extracted.value);
            } else {
              handles.add(extracted.value);
            }
          }
        }

        sitemapsProcessed++;

        // 500ms delay between sitemaps
        await new Promise((r) => setTimeout(r, 500));
      } catch (error) {
        console.warn(`[Sitemap] Failed to process ${sitemapUrl}:`, error);
      }
    }
  } catch (error) {
    console.error("[Sitemap] Sitemap parsing failed:", error);
  }

  console.log(`[Sitemap] ═══════════════════════════════════════`);
  console.log(`[Sitemap] Sitemaps processed:  ${sitemapsProcessed}`);
  console.log(`[Sitemap] Total URLs scanned:  ${totalUrlsFound}`);
  console.log(`[Sitemap] Channel IDs found:   ${channelIds.size}`);
  console.log(`[Sitemap] Handles found:       ${handles.size}`);
  console.log(`[Sitemap] ═══════════════════════════════════════`);

  return {
    channelIds: Array.from(channelIds),
    handles: Array.from(handles),
    sitemapsProcessed,
    totalUrlsFound,
  };
}

// ─── Helpers ─────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */

function extractSitemapUrls(data: any): string[] {
  const urls: string[] = [];

  // <sitemapindex> → <sitemap> → <loc>
  const sitemaps = data?.sitemapindex?.sitemap;
  if (!sitemaps) return urls;

  const items = Array.isArray(sitemaps) ? sitemaps : [sitemaps];
  for (const item of items) {
    const loc = item?.loc;
    if (typeof loc === "string" && loc.startsWith("http")) {
      urls.push(loc);
    }
  }

  return urls;
}

function extractLocUrls(data: any): string[] {
  const urls: string[] = [];

  // <urlset> → <url> → <loc>
  const urlEntries = data?.urlset?.url;
  if (!urlEntries) return urls;

  const items = Array.isArray(urlEntries) ? urlEntries : [urlEntries];
  for (const item of items) {
    const loc = item?.loc;
    if (typeof loc === "string") {
      urls.push(loc);
    }
  }

  return urls;
}
