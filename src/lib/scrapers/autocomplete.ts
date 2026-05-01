/**
 * YouTube Autocomplete Mining
 *
 * Mines YouTube's autocomplete API for trending search terms.
 * Reveals what people are searching for RIGHT NOW.
 * Free, no API key, no limits.
 */

// ─── FUNCTION 1: getYouTubeAutocompletions ───────────────────────

/**
 * Get autocomplete suggestions from YouTube for a seed query.
 * Uses Google's suggest API with YouTube-specific parameters.
 */
export async function getYouTubeAutocompletions(
  seed: string
): Promise<string[]> {
  try {
    const encoded = encodeURIComponent(seed);
    const url = `https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=${encoded}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
    });

    if (!res.ok) {
      console.warn(`[Autocomplete] HTTP ${res.status} for "${seed}"`);
      return [];
    }

    const text = await res.text();

    // Response is JSONP: window.google.ac.h([...])
    // Strip the callback wrapper to get the inner JSON
    const jsonMatch = text.match(/\((\[[\s\S]+\])\)/);
    if (!jsonMatch) {
      // Try alternate format: just a JSON array
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data) && Array.isArray(data[1])) {
          return data[1].map((item: string[]) =>
            Array.isArray(item) ? item[0] : String(item)
          );
        }
      } catch {
        // Not valid JSON either
      }
      return [];
    }

    const data = JSON.parse(jsonMatch[1]);

    // Structure: [query, [[suggestion1, 0], [suggestion2, 0], ...]]
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return data[1]
        .map((item: unknown) => {
          if (Array.isArray(item)) return String(item[0]);
          return String(item);
        })
        .filter((s: string) => s.length > 0 && s !== seed);
    }

    return [];
  } catch (error) {
    console.warn(`[Autocomplete] Failed for "${seed}":`, error);
    return [];
  }
}

// ─── FUNCTION 2: getExpandedSuggestions ──────────────────────────

/**
 * Get expanded suggestions by appending common suffixes.
 * This reveals deeper long-tail queries.
 */
export async function getExpandedSuggestions(
  seed: string
): Promise<string[]> {
  const suffixes = [
    "",
    " channel",
    " faceless",
    " tips",
    " explained",
    " tutorial",
    " for beginners",
    " automation",
    " how to",
    " 2024",
  ];

  const allSuggestions = new Set<string>();

  for (const suffix of suffixes) {
    const query = `${seed}${suffix}`;
    const suggestions = await getYouTubeAutocompletions(query);

    for (const s of suggestions) {
      allSuggestions.add(s.toLowerCase().trim());
    }

    // 200ms delay between requests
    await new Promise((r) => setTimeout(r, 200));
  }

  return Array.from(allSuggestions);
}

// ─── FUNCTION 3: buildNicheKeywordDatabase ───────────────────────

/**
 * Build a comprehensive keyword database for all niches.
 * For each niche: runs base + suffix queries → collects all suggestions.
 *
 * @param niches - Array of niche names to research
 * @returns Map<niche, keywords[]>
 */
export async function buildNicheKeywordDatabase(
  niches: string[]
): Promise<Map<string, string[]>> {
  const results = new Map<string, string[]>();

  for (const niche of niches) {
    console.log(`[Autocomplete] Mining keywords for "${niche}"...`);

    const keywords = await getExpandedSuggestions(niche);
    results.set(niche, keywords);

    console.log(
      `[Autocomplete] "${niche}": ${keywords.length} keywords found`
    );

    // 1s delay between niches
    await new Promise((r) => setTimeout(r, 1000));
  }

  const totalKeywords = Array.from(results.values()).reduce(
    (sum, kws) => sum + kws.length,
    0
  );

  console.log(
    `[Autocomplete] Total: ${totalKeywords} keywords across ${niches.length} niches`
  );

  return results;
}

// ─── FUNCTION 4: Alphabet expansion ──────────────────────────────

/**
 * Deep expansion: try each letter of the alphabet after the seed.
 * This reveals niche-specific long-tail terms.
 */
export async function deepExpandSuggestions(
  seed: string
): Promise<string[]> {
  const allSuggestions = new Set<string>();
  const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

  // First get base suggestions
  const base = await getYouTubeAutocompletions(seed);
  base.forEach((s) => allSuggestions.add(s.toLowerCase().trim()));

  // Then try each letter
  for (const letter of alphabet) {
    const query = `${seed} ${letter}`;
    const suggestions = await getYouTubeAutocompletions(query);
    suggestions.forEach((s) => allSuggestions.add(s.toLowerCase().trim()));

    await new Promise((r) => setTimeout(r, 150));
  }

  return Array.from(allSuggestions).sort();
}
