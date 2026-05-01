/**
 * 🌱 NichePulse Full Database Seeder — 4-Phase Pipeline
 *
 * Phase 1: DISCOVERY   — Google, Reddit, SocialBlade, Sitemap (parallel)
 * Phase 2: ENRICHMENT  — YouTubei + RSS + Score for all pending channels
 * Phase 3: GRAPH       — Follow recommendation links (750 → 10K+)
 * Phase 4: KEYWORDS    — Build niche keyword intelligence map
 *
 * Run:  npx tsx scripts/seedDatabase.ts
 * Time: 2-4 hours (background)
 * Cost: $0
 */

import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// Core pipeline
import {
  searchChannels,
  getChannelData,
} from "../src/lib/data/youtubeiClient";
import { pollChannelRSS, detectOutlier } from "../src/lib/data/rssPoller";
import {
  calculateNicheScore,
  estimateMonthlyRevenue,
  estimateMonthlyViews,
  getScoreLabel,
} from "../src/lib/scoring";

// Scrapers
import { searchGoogleForChannels } from "../src/lib/scrapers/googleSearch";
import { discoverFromAllSubreddits, TARGET_SUBREDDITS } from "../src/lib/scrapers/redditDiscovery";
import { scrapeTopChannels } from "../src/lib/scrapers/socialBlade";
import { parseYouTubeSitemap } from "../src/lib/scrapers/sitemap";
import { expandChannelGraph } from "../src/lib/scrapers/recommendationGraph";
import { buildNicheKeywordMap } from "../src/lib/scrapers/videoTags";
import { buildNicheKeywordDatabase } from "../src/lib/scrapers/autocomplete";

const prisma = new PrismaClient();

// ─── Niche Configuration ────────────────────────────────────────

const SEED_CATEGORIES: Record<string, { slug: string; queries: string[] }> = {
  Finance: {
    slug: "finance",
    queries: [
      "personal finance faceless channel",
      "investing beginners youtube",
      "passive income explained channel",
      "stock market faceless channel",
      "financial freedom youtube automation",
    ],
  },
  "AI Tools": {
    slug: "ai_tools",
    queries: [
      "AI tools tutorial channel",
      "ChatGPT tips faceless youtube",
      "artificial intelligence explained channel",
      "AI automation workflow youtube",
      "machine learning beginner faceless",
    ],
  },
  Stoicism: {
    slug: "stoicism",
    queries: [
      "stoicism daily wisdom channel",
      "stoic philosophy youtube",
      "marcus aurelius teachings channel",
      "ancient philosophy modern life",
      "stoic mindset youtube faceless",
    ],
  },
  "True Crime": {
    slug: "true_crime",
    queries: [
      "true crime documentary faceless",
      "unsolved mysteries channel",
      "cold case investigation youtube",
      "criminal psychology channel",
    ],
  },
  "Dark History": {
    slug: "dark_history",
    queries: [
      "dark history facts youtube",
      "untold history stories channel",
      "forgotten history faceless",
      "historical mysteries channel",
    ],
  },
  Fitness: {
    slug: "fitness",
    queries: [
      "home workout faceless channel",
      "calisthenics beginner youtube",
      "weight loss tips channel",
      "fitness motivation faceless",
    ],
  },
  Productivity: {
    slug: "productivity",
    queries: [
      "productivity system youtube channel",
      "notion workflow tips channel",
      "time management faceless",
      "second brain system channel",
    ],
  },
  Luxury: {
    slug: "luxury",
    queries: [
      "luxury lifestyle faceless channel",
      "billionaire habits youtube",
      "expensive things explained faceless",
    ],
  },
  Mindset: {
    slug: "mindset",
    queries: [
      "growth mindset youtube channel",
      "psychology of success faceless",
      "self improvement tips channel",
      "motivation daily youtube",
    ],
  },
  Business: {
    slug: "business",
    queries: [
      "business ideas explained faceless",
      "entrepreneurship tips youtube",
      "side hustle ideas channel",
      "startup stories faceless channel",
    ],
  },
  "Real Estate": {
    slug: "real_estate",
    queries: [
      "real estate investing beginner channel",
      "rental property tips youtube",
      "house flipping explained faceless",
    ],
  },
  Coding: {
    slug: "coding",
    queries: [
      "programming tutorial faceless channel",
      "software engineering tips youtube",
      "web development explained channel",
    ],
  },
  Language: {
    slug: "language",
    queries: [
      "language learning tips channel",
      "learn english fast youtube",
      "polyglot tips faceless channel",
    ],
  },
  Travel: {
    slug: "travel",
    queries: [
      "travel hacks faceless channel",
      "budget travel tips youtube",
      "travel destinations facts channel",
    ],
  },
  Health: {
    slug: "health",
    queries: [
      "health tips faceless channel",
      "medical facts explained youtube",
      "mental health tips channel",
    ],
  },
};

// ─── Helpers ─────────────────────────────────────────────────────

function banner(text: string) {
  console.log("\n" + "═".repeat(60));
  console.log(`  ${text}`);
  console.log("═".repeat(60));
}

function elapsed(start: number): string {
  const ms = Date.now() - start;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}m ${s}s`;
}

async function ensureNicheCategories() {
  for (const [name, config] of Object.entries(SEED_CATEGORIES)) {
    await prisma.nicheCategory.upsert({
      where: { slug: config.slug },
      update: {},
      create: {
        name,
        slug: config.slug,
        description: `${name} niche category`,
        averageNicheScore: 0,
        channelCount: 0,
        competitionLevel: "MEDIUM",
        trendDirection: "STABLE",
        estimatedCPM: 7,
      },
    });
  }
  console.log(`✅ ${Object.keys(SEED_CATEGORIES).length} niche categories ensured`);
}

async function upsertChannel(
  youtubeId: string,
  nicheCategoryId: string,
  categoryName: string,
  categorySlug: string,
  status: string
) {
  await prisma.channel.upsert({
    where: { youtubeId },
    update: {},
    create: {
      youtubeId,
      title: `Pending: ${youtubeId}`,
      category: categoryName,
      nicheCategoryId,
      nicheScore: 0,
      subscriberCount: 0,
      viewCount: BigInt(0),
      videoCount: 0,
      lastScrapedAt: null,
    },
  });
}

// ═════════════════════════════════════════════════════════════════
// PHASE 1: DISCOVERY — Find channel IDs from all sources
// ═════════════════════════════════════════════════════════════════

async function phase1Discovery(): Promise<Set<string>> {
  banner("PHASE 1 — DISCOVERY");
  const start = Date.now();
  const allIds = new Set<string>();

  // ─── 1A: YouTubei Search ─────────────────────────────
  console.log("\n📺 1A: YouTubei Search...");
  for (const [name, config] of Object.entries(SEED_CATEGORIES)) {
    for (const query of config.queries) {
      try {
        const results = await searchChannels(query, 10);
        for (const ch of results) {
          if (ch.channelId) allIds.add(ch.channelId);
        }
      } catch (e) {
        console.warn(`  ⚠ Search failed: "${query}"`);
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    console.log(`  ✅ ${name}: ${allIds.size} total IDs`);
  }

  // ─── 1B: Google Search ───────────────────────────────
  console.log("\n🔍 1B: Google Search...");
  const nicheNames = Object.keys(SEED_CATEGORIES);
  for (const niche of nicheNames) {
    try {
      const googleIds = await searchGoogleForChannels(niche, 2);
      for (const id of googleIds) allIds.add(id);
      console.log(`  ✅ "${niche}": +${googleIds.length} channels`);
    } catch (e) {
      console.warn(`  ⚠ Google failed for "${niche}"`);
    }
  }

  // ─── 1C: Reddit Discovery ───────────────────────────
  console.log("\n🤖 1C: Reddit Discovery...");
  try {
    const redditResults = await discoverFromAllSubreddits(TARGET_SUBREDDITS, 3);
    for (const result of redditResults) {
      for (const id of result.channelIds) allIds.add(id);
    }
    console.log(`  ✅ Reddit: ${redditResults.reduce((s, r) => s + r.channelIds.length, 0)} channels`);
  } catch (e) {
    console.warn("  ⚠ Reddit discovery failed:", e);
  }

  // ─── 1D: SocialBlade Top Channels ───────────────────
  console.log("\n📊 1D: SocialBlade...");
  const sbCategories = Array.from(new Set(Object.values(SEED_CATEGORIES).map((c) => c.slug)));
  for (const cat of sbCategories) {
    try {
      const topChannels = await scrapeTopChannels(cat);
      // Extract channel IDs from SocialBlade URLs
      for (const ch of topChannels) {
        const match = ch.channelUrl.match(/\/(UC[\w-]{22})/);
        if (match) allIds.add(match[1]);
      }
      console.log(`  ✅ "${cat}": +${topChannels.length} channels`);
    } catch (e) {
      console.warn(`  ⚠ SocialBlade failed for "${cat}"`);
    }
  }

  // ─── 1E: YouTube Sitemap ────────────────────────────
  console.log("\n🗺️  1E: YouTube Sitemap...");
  try {
    const sitemapResult = await parseYouTubeSitemap(5);
    for (const id of sitemapResult.channelIds) allIds.add(id);
    for (const handle of sitemapResult.handles) allIds.add(handle);
    console.log(`  ✅ Sitemap: +${sitemapResult.channelIds.length + sitemapResult.handles.length} channels`);
  } catch (e) {
    console.warn("  ⚠ Sitemap parsing failed:", e);
  }

  // ─── Store all discovered IDs ─────────────────────
  console.log(`\n📦 Storing ${allIds.size} discovered channel IDs...`);

  const defaultNiche = await prisma.nicheCategory.findFirst({ where: { slug: "ai_tools" } });

  let stored = 0;
  const allIdsArr = Array.from(allIds);
  for (const id of allIdsArr) {
    try {
      await prisma.channel.upsert({
        where: { youtubeId: id },
        update: {},
        create: {
          youtubeId: id,
          title: `Pending: ${id}`,
          category: "Uncategorized",
          nicheCategoryId: defaultNiche?.id || "",
          nicheScore: 0,
          subscriberCount: 0,
          viewCount: BigInt(0),
          videoCount: 0,
          lastScrapedAt: null,
        },
      });
      stored++;
    } catch {
      // Skip duplicates / errors
    }
  }

  console.log(`\n✅ Phase 1 Complete | ${stored} channels stored | ${elapsed(start)}`);
  return allIds;
}

// ═════════════════════════════════════════════════════════════════
// PHASE 2: ENRICHMENT — Fetch full data for all pending channels
// ═════════════════════════════════════════════════════════════════

async function phase2Enrichment() {
  banner("PHASE 2 — ENRICHMENT");
  const start = Date.now();

  // Find all channels that haven't been scraped yet
  const pendingChannels = await prisma.channel.findMany({
    where: {
      OR: [
        { lastScrapedAt: null },
        { subscriberCount: 0 },
      ],
    },
    select: { id: true, youtubeId: true, nicheCategoryId: true, category: true },
    take: 2000,
  });

  console.log(`📋 Found ${pendingChannels.length} channels to enrich`);

  let enriched = 0;
  let failed = 0;

  for (const pending of pendingChannels) {
    try {
      // Get full channel data via YouTubei
      const data = await getChannelData(pending.youtubeId);
      if (!data || !data.channelTitle) {
        failed++;
        continue;
      }

      // RSS enrichment
      const rss = await pollChannelRSS(data.channelId);
      const uploadFrequency = rss?.uploadFrequency || 7;

      // Calculate score
      const avgViews =
        data.recentVideos.length > 0
          ? data.recentVideos.reduce((s, v) => s + v.viewCount, 0) /
            data.recentVideos.length
          : 0;

      const score = calculateNicheScore({
        subscriberCount: data.subscriberCount,
        videoCount: data.videoCount,
        uploadFrequency,
        recentVideos: data.recentVideos,
        avgViews,
      });

      const monthlyViews = estimateMonthlyViews(data.subscriberCount, uploadFrequency);
      const revenue = estimateMonthlyRevenue(monthlyViews);
      const isOutlier = detectOutlier(data.subscriberCount, data.recentVideos);

      // Update channel record
      await prisma.channel.update({
        where: { id: pending.id },
        data: {
          title: data.channelTitle,
          description: data.description.slice(0, 2000),
          thumbnailUrl: data.thumbnailUrl,
          subscriberCount: data.subscriberCount,
          viewCount: BigInt(data.viewCount),
          videoCount: data.videoCount,
          nicheScore: score,
          estimatedMonthlyRevenue: revenue,
          uploadFrequency,
          isOutlier,
          country: data.country,
          lastScrapedAt: new Date(),
        },
      });

      // Upsert recent video insights
      for (const video of data.recentVideos.slice(0, 5)) {
        if (!video.videoId) continue;
        const hoursAge = video.publishedAt
          ? Math.max((Date.now() - video.publishedAt.getTime()) / 3_600_000, 1)
          : 24;
        const viewsPerHour = parseFloat((video.viewCount / hoursAge).toFixed(1));
        const isViral = viewsPerHour > 500 || video.viewCount > 1_000_000;

        try {
          await prisma.videoInsight.upsert({
            where: { youtubeVideoId: video.videoId },
            create: {
              channelId: pending.id,
              youtubeVideoId: video.videoId,
              title: video.title,
              viewCount: video.viewCount,
              likeCount: 0,
              commentCount: 0,
              publishedAt: video.publishedAt || new Date(),
              isViral,
              viewsPerHour,
              thumbnail: video.thumbnailUrl,
            },
            update: {
              viewCount: video.viewCount,
              isViral,
              viewsPerHour,
            },
          });
        } catch {
          // Skip video errors
        }
      }

      enriched++;

      if (enriched % 50 === 0) {
        const { emoji } = getScoreLabel(score);
        console.log(
          `  [${enriched}/${pendingChannels.length}] ` +
          `${data.channelTitle} | Score: ${score} ${emoji} | ` +
          `Subs: ${(data.subscriberCount / 1000).toFixed(0)}K`
        );
      }

      // Rate limit
      await new Promise((r) => setTimeout(r, 400));
    } catch (error) {
      failed++;
      if (failed % 20 === 0) {
        console.warn(`  ⚠ ${failed} enrichment failures so far`);
      }
    }
  }

  // Update niche category stats
  for (const [name, config] of Object.entries(SEED_CATEGORIES)) {
    const niche = await prisma.nicheCategory.findUnique({ where: { slug: config.slug } });
    if (!niche) continue;

    const nicheChannels = await prisma.channel.findMany({
      where: { nicheCategoryId: niche.id, subscriberCount: { gt: 0 } },
      select: { nicheScore: true },
    });

    if (nicheChannels.length > 0) {
      const avg = nicheChannels.reduce((s, c) => s + c.nicheScore, 0) / nicheChannels.length;
      await prisma.nicheCategory.update({
        where: { id: niche.id },
        data: {
          channelCount: nicheChannels.length,
          averageNicheScore: parseFloat(avg.toFixed(1)),
        },
      });
    }
  }

  console.log(`\n✅ Phase 2 Complete | ${enriched} enriched, ${failed} failed | ${elapsed(start)}`);
}

// ═════════════════════════════════════════════════════════════════
// PHASE 3: GRAPH EXPANSION — Follow recommendation links
// ═════════════════════════════════════════════════════════════════

async function phase3GraphExpansion() {
  banner("PHASE 3 — GRAPH EXPANSION");
  const start = Date.now();

  // Get all active channel IDs as seeds
  const activeChannels = await prisma.channel.findMany({
    where: { subscriberCount: { gt: 0 }, lastScrapedAt: { not: null } },
    select: { youtubeId: true },
    take: 500, // Use top 500 as seeds
    orderBy: { nicheScore: "desc" },
  });

  const seedIds = activeChannels.map((c) => c.youtubeId);
  console.log(`🌱 Starting graph expansion with ${seedIds.length} seeds`);

  const result = await expandChannelGraph(seedIds, 2, 5000);

  // Store all newly discovered channel IDs
  const existingIds = new Set(
    (await prisma.channel.findMany({
      select: { youtubeId: true },
    })).map((c) => c.youtubeId)
  );

  const newIds = result.discovered.filter((id) => !existingIds.has(id));
  console.log(`📦 Storing ${newIds.length} newly discovered channels...`);

  const defaultNiche = await prisma.nicheCategory.findFirst({ where: { slug: "ai_tools" } });
  let stored = 0;

  for (const id of newIds) {
    try {
      await prisma.channel.create({
        data: {
          youtubeId: id,
          title: `Graph: ${id}`,
          category: "Uncategorized",
          nicheCategoryId: defaultNiche?.id || "",
          nicheScore: 0,
          subscriberCount: 0,
          viewCount: BigInt(0),
          videoCount: 0,
          lastScrapedAt: null,
        },
      });
      stored++;
    } catch {
      // Skip duplicates
    }
  }

  console.log(`\n✅ Phase 3 Complete | ${stored} new channels stored | ${elapsed(start)}`);
  console.log(`  (Run Phase 2 again to enrich these new channels)`);
}

// ═════════════════════════════════════════════════════════════════
// PHASE 4: KEYWORD MAP — Build niche intelligence layer
// ═════════════════════════════════════════════════════════════════

async function phase4Keywords() {
  banner("PHASE 4 — KEYWORD INTELLIGENCE");
  const start = Date.now();

  const nicheNames = Object.keys(SEED_CATEGORIES);

  // 4A: YouTube autocomplete keywords
  console.log("\n🔤 4A: Mining autocomplete suggestions...");
  const autocompleteMap = await buildNicheKeywordDatabase(nicheNames);

  // 4B: Video tag keywords per niche
  console.log("\n🏷️  4B: Extracting video tags...");
  for (const [name, config] of Object.entries(SEED_CATEGORIES)) {
    const niche = await prisma.nicheCategory.findUnique({
      where: { slug: config.slug },
    });
    if (!niche) continue;

    const channels = await prisma.channel.findMany({
      where: {
        nicheCategoryId: niche.id,
        subscriberCount: { gt: 0 },
      },
      select: { youtubeId: true },
      take: 10,
      orderBy: { nicheScore: "desc" },
    });

    if (channels.length === 0) continue;

    const tagMap = await buildNicheKeywordMap(
      channels.map((c) => c.youtubeId),
      3
    );

    // Merge autocomplete + video tags
    const autocompleteKws = autocompleteMap.get(name) || [];
    const allKeywords = new Map<string, number>();

    // Add video tags
    const tagEntries = Array.from(tagMap.entries());
    for (const [kw, count] of tagEntries) {
      allKeywords.set(kw, (allKeywords.get(kw) || 0) + count);
    }

    // Add autocomplete terms (weight: 1 each)
    for (const kw of autocompleteKws) {
      allKeywords.set(kw, (allKeywords.get(kw) || 0) + 1);
    }

    // Log top keywords
    const topKws = Array.from(allKeywords.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    console.log(`  📁 ${name}: ${allKeywords.size} keywords`);
    console.log(`     Top 5: ${topKws.slice(0, 5).map(([k]) => k).join(", ")}`);
  }

  console.log(`\n✅ Phase 4 Complete | ${elapsed(start)}`);
}

// ═════════════════════════════════════════════════════════════════
// MAIN
// ═════════════════════════════════════════════════════════════════

async function main() {
  const totalStart = Date.now();

  console.log("🌱 NichePulse Full Database Seeder");
  console.log("═".repeat(60));
  console.log(`📊 Categories: ${Object.keys(SEED_CATEGORIES).length}`);
  console.log(`💰 Total cost: $0`);
  console.log("");

  // Ensure niche categories exist
  await ensureNicheCategories();

  // Parse CLI args for phase selection
  const args = process.argv.slice(2);
  const runAll = args.length === 0;
  const phases = new Set(args.map(Number));

  // Phase 1: Discovery
  if (runAll || phases.has(1)) {
    await phase1Discovery();
  }

  // Phase 2: Enrichment
  if (runAll || phases.has(2)) {
    await phase2Enrichment();
  }

  // Phase 3: Graph Expansion
  if (runAll || phases.has(3)) {
    await phase3GraphExpansion();
  }

  // Phase 4: Keywords
  if (runAll || phases.has(4)) {
    await phase4Keywords();
  }

  // Final stats
  const totalChannels = await prisma.channel.count();
  const enrichedChannels = await prisma.channel.count({
    where: { subscriberCount: { gt: 0 } },
  });
  const totalVideos = await prisma.videoInsight.count();

  banner("🎉 SEEDING COMPLETE");
  console.log(`  📺 Total channels:    ${totalChannels}`);
  console.log(`  ✅ Enriched channels: ${enrichedChannels}`);
  console.log(`  🎬 Video insights:    ${totalVideos}`);
  console.log(`  ⏱  Total time:        ${elapsed(totalStart)}`);
  console.log(`  💰 Total cost:        $0`);
  console.log("");
  console.log("  Usage: npx tsx scripts/seedDatabase.ts [phases]");
  console.log("  Examples:");
  console.log("    npx tsx scripts/seedDatabase.ts       # Run all phases");
  console.log("    npx tsx scripts/seedDatabase.ts 1     # Discovery only");
  console.log("    npx tsx scripts/seedDatabase.ts 2 3   # Enrichment + Graph");
  console.log("═".repeat(60));

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  prisma.$disconnect();
  process.exit(1);
});
