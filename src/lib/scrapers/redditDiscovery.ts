/**
 * Reddit Channel Discovery
 *
 * Mines Reddit's free JSON API for YouTube channel mentions.
 * Parses posts + comments for youtube.com URLs.
 * Free, no API key needed.
 */

// ─── Types ───────────────────────────────────────────────────────

export interface RedditDiscoveryResult {
  subreddit: string;
  channelIds: string[];
  postsScanned: number;
  linksFound: number;
}

// ─── YouTube URL Patterns ────────────────────────────────────────

const YT_URL_PATTERNS = [
  /youtube\.com\/@([\w.-]+)/gi,
  /youtube\.com\/channel\/(UC[\w-]{22})/gi,
  /youtube\.com\/c\/([\w.-]+)/gi,
  /youtube\.com\/user\/([\w.-]+)/gi,
  /youtu\.be\/([\w-]+)/gi, // shortened video links — useful for finding channels
];

function extractChannelIdentifiers(text: string): string[] {
  const ids = new Set<string>();

  for (const pattern of YT_URL_PATTERNS) {
    // Reset lastIndex for global regexes
    pattern.lastIndex = 0;
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const id = match[1];
      // Filter out video IDs (usually 11 chars) from youtu.be links
      if (id && id.length > 3 && !id.startsWith("watch")) {
        ids.add(id);
      }
    }
  }

  return Array.from(ids);
}

// ─── Target Subreddits ──────────────────────────────────────────

export const TARGET_SUBREDDITS = [
  "youtubeautomation",
  "youtubers",
  "passive_income",
  "smallyoutubersclub",
  "LifeProTips",
  "entrepreneur",
  "personalfinance",
  "productivity",
  "selfimprovement",
];

// ─── FUNCTION 1: scrapeSubredditForChannels ──────────────────────

/**
 * Scrape a subreddit's recent posts for YouTube channel mentions.
 * Uses Reddit's free JSON API (no auth needed).
 */
export async function scrapeSubredditForChannels(
  subreddit: string,
  pages = 5
): Promise<string[]> {
  const discovered = new Set<string>();
  let after: string | null = null;
  let postsScanned = 0;

  for (let page = 0; page < pages; page++) {
    try {
      let url = `https://www.reddit.com/r/${subreddit}/new.json?limit=100`;
      if (after) url += `&after=${after}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent": "NichePulse/1.0 (YouTube channel discovery)",
        },
      });

      if (res.status === 429) {
        console.warn(`[Reddit] Rate limited on r/${subreddit}, waiting...`);
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }

      if (!res.ok) {
        console.warn(`[Reddit] HTTP ${res.status} for r/${subreddit}`);
        break;
      }

      const data = await res.json();
      const posts = data?.data?.children || [];
      after = data?.data?.after || null;

      for (const post of posts) {
        const postData = post?.data;
        if (!postData) continue;
        postsScanned++;

        // Check direct URL field
        if (postData.url) {
          const ids = extractChannelIdentifiers(postData.url);
          ids.forEach((id) => discovered.add(id));
        }

        // Check post title
        if (postData.title) {
          const ids = extractChannelIdentifiers(postData.title);
          ids.forEach((id) => discovered.add(id));
        }

        // Check selftext (post body)
        if (postData.selftext) {
          const ids = extractChannelIdentifiers(postData.selftext);
          ids.forEach((id) => discovered.add(id));
        }

        // Check selftext_html for embedded links
        if (postData.selftext_html) {
          const decoded = decodeHTMLEntities(postData.selftext_html);
          const ids = extractChannelIdentifiers(decoded);
          ids.forEach((id) => discovered.add(id));
        }
      }

      // No more pages
      if (!after) break;

      // Rate limit: 1.5s between pages
      await new Promise((r) => setTimeout(r, 1500));
    } catch (error) {
      console.error(`[Reddit] Failed r/${subreddit} page ${page}:`, error);
    }
  }

  console.log(
    `[Reddit] r/${subreddit}: scanned ${postsScanned} posts, ` +
    `found ${discovered.size} channels`
  );

  return Array.from(discovered);
}

// ─── FUNCTION 2: discoverFromAllSubreddits ───────────────────────

/**
 * Run Reddit discovery across all target subreddits.
 */
export async function discoverFromAllSubreddits(
  subreddits: string[] = TARGET_SUBREDDITS,
  pagesPerSubreddit = 5,
  onProgress?: (subreddit: string, found: number) => void
): Promise<RedditDiscoveryResult[]> {
  const results: RedditDiscoveryResult[] = [];
  const allChannels = new Set<string>();

  for (const subreddit of subreddits) {
    const channelIds = await scrapeSubredditForChannels(
      subreddit,
      pagesPerSubreddit
    );

    const newChannels = channelIds.filter((id) => !allChannels.has(id));
    newChannels.forEach((id) => allChannels.add(id));

    results.push({
      subreddit,
      channelIds,
      postsScanned: 0,
      linksFound: channelIds.length,
    });

    onProgress?.(subreddit, channelIds.length);

    // Delay between subreddits
    await new Promise((r) => setTimeout(r, 3000));
  }

  console.log(
    `[Reddit] Total: ${allChannels.size} unique channels from ` +
    `${subreddits.length} subreddits`
  );

  return results;
}

// ─── Helpers ─────────────────────────────────────────────────────

function decodeHTMLEntities(html: string): string {
  return html
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}
