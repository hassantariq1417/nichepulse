import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ────────────────────────────────────────────────────────────────
   Auto-Discovery Cron — Finds and adds NEW channels automatically
   
   Runs daily via Vercel Cron. Each run picks 2 random niches,
   executes 1 random search query per niche, and discovers up
   to 5 new channels per query.
   
   This runs ALONGSIDE the refresh cron to keep growing the DB.
   ──────────────────────────────────────────────────────────────── */

const DISCOVERY_QUERIES: Record<string, string[]> = {
  // ── Original niches ──
  finance: [
    "personal finance tips 2025",
    "investing for beginners",
    "financial independence retire early",
    "credit card rewards strategy",
    "budgeting tips money management",
    "stock market analysis explained",
    "real estate investing beginners",
    "crypto portfolio strategy",
  ],
  "ai-tools": [
    "AI tools for productivity",
    "machine learning tutorial",
    "ChatGPT tips and tricks",
    "artificial intelligence explained",
    "AI coding assistant",
    "AI image generation tutorial",
    "AI automation workflow",
    "AI voice cloning tools",
  ],
  fitness: [
    "home workout routine",
    "muscle building tips",
    "weight loss transformation",
    "calisthenics for beginners",
    "nutrition and meal prep",
    "yoga for flexibility",
    "running marathon training",
  ],
  business: [
    "how to start a business",
    "entrepreneurship advice",
    "side hustle ideas 2025",
    "online business from home",
    "dropshipping tutorial",
    "amazon fba guide",
    "print on demand business",
  ],
  "true-crime": [
    "true crime documentary",
    "unsolved mysteries cold case",
    "serial killer documentary",
    "crime investigation",
    "disappearance mystery documentary",
  ],
  coding: [
    "learn to code beginner",
    "web development tutorial",
    "python programming projects",
    "javascript frameworks 2025",
    "software engineering career",
    "react tutorial project",
    "system design interview",
  ],
  health: [
    "health and wellness tips",
    "nutrition science explained",
    "mental health awareness",
    "sleep optimization",
    "longevity biohacking",
  ],
  productivity: [
    "productivity system",
    "time management tips",
    "notion setup tutorial",
    "morning routine productive",
    "second brain building",
  ],
  // ── NEW niches for expanded coverage ──
  gaming: [
    "gaming tips and tricks",
    "game review 2025",
    "gaming setup tour",
    "esports highlights",
    "speedrun world record",
  ],
  "self-improvement": [
    "self improvement habits",
    "stoicism philosophy explained",
    "mindset motivation",
    "discipline routine daily",
    "atomic habits summary",
  ],
  cooking: [
    "easy recipes for beginners",
    "meal prep weekly budget",
    "cooking tips and hacks",
    "restaurant quality at home",
    "air fryer recipes easy",
  ],
  history: [
    "history documentary",
    "ancient civilizations explained",
    "world war documentary",
    "history facts interesting",
    "historical mysteries unsolved",
  ],
  science: [
    "science explained simply",
    "space exploration documentary",
    "physics for beginners",
    "chemistry experiments",
    "biology documentary nature",
  ],
  psychology: [
    "psychology explained",
    "dark psychology manipulation",
    "human behavior analysis",
    "emotional intelligence tips",
    "body language reading",
  ],
  luxury: [
    "luxury lifestyle",
    "expensive things review",
    "supercar review test drive",
    "luxury watches collection",
    "millionaire lifestyle",
  ],
  "real-estate": [
    "real estate investing 2025",
    "house flipping tutorial",
    "rental property income",
    "real estate market analysis",
    "first time home buyer tips",
  ],
  education: [
    "study tips for students",
    "learn anything fast",
    "online course review",
    "scholarship tips guide",
    "exam preparation strategy",
  ],
  animation: [
    "animated story time",
    "animation explainer",
    "animated facts",
    "whiteboard animation",
    "cartoon storytelling",
  ],
  crypto: [
    "cryptocurrency explained",
    "bitcoin analysis 2025",
    "defi tutorial beginner",
    "altcoin gems research",
    "web3 development guide",
  ],
  "travel-hacks": [
    "budget travel tips",
    "travel hacks save money",
    "digital nomad lifestyle",
    "best countries to visit",
    "solo travel tips safety",
  ],
};

async function searchYouTubeForChannels(query: string): Promise<string[]> {
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAg%3D%3D`;
    const res = await fetch(searchUrl, {
      signal: AbortSignal.timeout(10000),
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    if (!res.ok) return [];
    const html = await res.text();

    const channelIds = new Set<string>();
    const idMatches = Array.from(
      html.matchAll(/"channelId":"(UC[a-zA-Z0-9_-]{22})"/g)
    );
    for (const m of idMatches) {
      channelIds.add(m[1]);
    }
    const urlMatches = Array.from(
      html.matchAll(/\/channel\/(UC[a-zA-Z0-9_-]{22})/g)
    );
    for (const m of urlMatches) {
      channelIds.add(m[1]);
    }
    return Array.from(channelIds).slice(0, 15);
  } catch {
    return [];
  }
}

async function validateAndSaveChannel(
  channelId: string,
  niche: string,
  nicheRecordId: string
): Promise<string | null> {
  try {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
    const res = await fetch(rssUrl, {
      signal: AbortSignal.timeout(6000),
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NichePulse/1.0)" },
    });
    if (!res.ok) return null;
    const xml = await res.text();
    if (!xml.includes("<entry>")) return null;

    const authorMatch = xml.match(/<author>\s*<name>([^<]+)/);
    const title = authorMatch ? authorMatch[1].trim() : "";
    if (!title) return null;

    const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g));
    const thirtyDaysAgo = Date.now() - 30 * 86400000;

    const videos = entries.map((entry) => {
      const e = entry[1];
      return {
        videoId: e.match(/<yt:videoId>([^<]+)/)?.[1] || "",
        title: e.match(/<title>([^<]+)/)?.[1] || "",
        viewCount: parseInt(e.match(/<media:statistics\s+views="(\d+)"/)?.[1] || "0"),
        publishedAt: new Date(e.match(/<published>([^<]+)/)?.[1] || ""),
      };
    });

    const totalViews = videos.reduce((s, v) => s + v.viewCount, 0);
    if (totalViews < 5000) return null; // Skip low-traffic channels

    const uploadsLast30d = videos.filter((v) => v.publishedAt.getTime() > thirtyDaysAgo).length;

    let uploadFrequency = 30;
    if (videos.length >= 2) {
      const sorted = [...videos].sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
      const gaps: number[] = [];
      for (let i = 0; i < Math.min(sorted.length - 1, 10); i++) {
        const gap = (sorted[i].publishedAt.getTime() - sorted[i + 1].publishedAt.getTime()) / 86400000;
        if (gap > 0) gaps.push(gap);
      }
      if (gaps.length > 0) uploadFrequency = Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
    }

    const avgViews = videos.length > 0 ? totalViews / videos.length : 0;
    const viewVelocity = Math.min((avgViews / 100000) * 100, 100);
    let consistency = 50;
    if (uploadFrequency <= 1) consistency = 100;
    else if (uploadFrequency <= 3) consistency = 85;
    else if (uploadFrequency <= 7) consistency = 70;
    else if (uploadFrequency <= 14) consistency = 50;
    else if (uploadFrequency <= 30) consistency = 30;
    const activity = Math.min(uploadsLast30d * 10, 100);
    let maturity = 50;
    if (totalViews > 1000000) maturity = 85;
    else if (totalViews > 100000) maturity = 70;
    const nicheScore = Math.min(
      Math.max(Math.round(viewVelocity * 0.4 + consistency * 0.25 + activity * 0.2 + maturity * 0.15), 1),
      100
    );

    await prisma.channel.create({
      data: {
        youtubeId: channelId,
        title,
        description: `${title} — auto-discovered`,
        subscriberCount: 0,
        viewCount: BigInt(totalViews),
        videoCount: videos.length,
        category: niche.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
        format: "LONG_FORM",
        nicheScore,
        estimatedMonthlyRevenue: Math.round(((avgViews * uploadsLast30d) / 1000) * 8 * 0.6),
        isOutlier: videos.some((v) => avgViews > 0 && v.viewCount > avgViews * 3),
        isTrending: uploadsLast30d >= 10,
        uploadFrequency,
        viewsLast48h: Math.round(totalViews / 15),
        videosLast30Days: uploadsLast30d,
        nicheCategoryId: nicheRecordId,
        lastScrapedAt: new Date(),
      },
    });

    // Save videos with thumbnails
    const savedChannel = await prisma.channel.findUnique({
      where: { youtubeId: channelId },
      select: { id: true },
    });

    if (savedChannel) {
      for (const video of videos) {
        if (!video.videoId) continue;
        await prisma.videoInsight
          .create({
            data: {
              channelId: savedChannel.id,
              youtubeVideoId: video.videoId,
              title: video.title,
              viewCount: video.viewCount,
              publishedAt: video.publishedAt,
              isViral: avgViews > 0 && video.viewCount > avgViews * 3,
              thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
            },
          })
          .catch(() => null);
      }
    }

    return `✅ ${title}: ${totalViews.toLocaleString()} views, score=${nicheScore}`;
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const allNiches = Object.keys(DISCOVERY_QUERIES);
    // Pick 2 random niches per run
    const selectedNiches: string[] = [];
    const shuffled = [...allNiches].sort(() => Math.random() - 0.5);
    selectedNiches.push(shuffled[0], shuffled[1]);

    const log: string[] = [];
    let totalSaved = 0;

    for (const niche of selectedNiches) {
      const queries = DISCOVERY_QUERIES[niche];
      const query = queries[Math.floor(Math.random() * queries.length)];

      log.push(`\n🔍 Discovering "${niche}" → query: "${query}"`);

      const channelIds = await searchYouTubeForChannels(query);
      if (channelIds.length === 0) {
        log.push(`  ⚠️ No channels found`);
        continue;
      }

      // Filter already known
      const existing = await prisma.channel.findMany({
        where: { youtubeId: { in: channelIds } },
        select: { youtubeId: true },
      });
      const existingIds = new Set(existing.map((c) => c.youtubeId));
      const newIds = channelIds.filter((id) => !existingIds.has(id));

      log.push(`  Found ${channelIds.length} channels (${existingIds.size} known, ${newIds.length} new)`);

      if (newIds.length === 0) continue;

      // Ensure niche category
      const nicheSlug = niche.toLowerCase().replace(/\s+/g, "-");
      const nicheRecord = await prisma.nicheCategory.upsert({
        where: { slug: nicheSlug },
        create: {
          name: niche.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
          slug: nicheSlug,
          iconEmoji: "🔍",
        },
        update: {},
      });

      // Process up to 5 per niche
      for (const channelId of newIds.slice(0, 5)) {
        const result = await validateAndSaveChannel(channelId, niche, nicheRecord.id);
        if (result) {
          log.push(`  ${result}`);
          totalSaved++;
        }
        await new Promise((r) => setTimeout(r, 500));
      }

      // Update niche stats
      const stats = await prisma.channel.aggregate({
        where: { nicheCategoryId: nicheRecord.id },
        _count: true,
        _avg: { nicheScore: true },
      });
      await prisma.nicheCategory.update({
        where: { id: nicheRecord.id },
        data: {
          channelCount: stats._count,
          averageNicheScore: stats._avg.nicheScore || 0,
        },
      });
    }

    return NextResponse.json({
      success: true,
      niches: selectedNiches,
      totalSaved,
      totalNichesAvailable: allNiches.length,
      log,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
