import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ── FIX 4: Parse RSS feeds with real view counts ──────────── */

function parseRSSWithViews(xml: string) {
  const entries = Array.from(xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g));

  const videos: Array<{
    videoId: string;
    title: string;
    publishedAt: Date;
    viewCount: number;
  }> = [];

  let totalRecentViews = 0;
  const thirtyDaysAgo = Date.now() - 30 * 86400000;

  for (const entry of entries) {
    const entryXml = entry[1];

    const videoId =
      entryXml.match(/<yt:videoId>([^<]+)<\/yt:videoId>/)?.[1] || "";
    const title = entryXml.match(/<title>([^<]+)<\/title>/)?.[1] || "";
    const published =
      entryXml.match(/<published>([^<]+)<\/published>/)?.[1] || "";
    const views = parseInt(
      entryXml.match(/<media:statistics\s+views="(\d+)"/)?.[1] ||
        entryXml.match(/<yt:statistics\s+views="(\d+)"/)?.[1] ||
        "0"
    );

    const publishedAt = new Date(published);

    if (publishedAt.getTime() > thirtyDaysAgo) {
      totalRecentViews += views;
    }

    videos.push({ videoId, title, publishedAt, viewCount: views });
  }

  const uploadsLast30Days = videos.filter(
    (v) => v.publishedAt.getTime() > thirtyDaysAgo
  ).length;

  return { videos, totalRecentViews, uploadsLast30Days };
}

function calculateUploadFreq(
  videos: Array<{ publishedAt: Date }>
): number {
  if (videos.length < 2) return 30;
  const sorted = [...videos].sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  );
  const gaps: number[] = [];
  for (let i = 0; i < Math.min(sorted.length - 1, 10); i++) {
    const gap =
      (sorted[i].publishedAt.getTime() - sorted[i + 1].publishedAt.getTime()) /
      86400000;
    if (gap > 0) gaps.push(gap);
  }
  if (gaps.length === 0) return 30;
  return Math.round(gaps.reduce((a, b) => a + b, 0) / gaps.length);
}

/* ── POST /api/ingest/rss ──────────────────────────────────── */

export async function POST() {
  try {
    const channels = await prisma.channel.findMany({
      select: { id: true, youtubeId: true, title: true },
      orderBy: { lastScrapedAt: "asc" },
      take: 50, // process up to 50 per request
    });

    let updated = 0;
    const log: string[] = [];

    for (const channel of channels) {
      try {
        const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channel.youtubeId}`;
        const res = await fetch(rssUrl, {
          signal: AbortSignal.timeout(8000),
          headers: {
            "User-Agent":
              "Mozilla/5.0 (compatible; NichePulse/1.0; +https://nichepulse.com)",
          },
        });

        if (!res.ok) {
          log.push(`❌ ${channel.title}: RSS ${res.status}`);
          continue;
        }

        const xml = await res.text();
        const { videos, totalRecentViews, uploadsLast30Days } =
          parseRSSWithViews(xml);

        const uploadFreq = calculateUploadFreq(videos);

        // Update channel with real RSS data
        await prisma.channel.update({
          where: { id: channel.id },
          data: {
            viewsLast48h: Math.round(totalRecentViews / 15), // rough daily average
            uploadFrequency: uploadFreq,
            videosLast30Days: uploadsLast30Days,
            lastScrapedAt: new Date(),
          },
        });

        // Also update video insights with real view counts
        for (const video of videos.slice(0, 15)) {
          if (!video.videoId) continue;
          await prisma.videoInsight
            .upsert({
              where: { youtubeVideoId: video.videoId },
              create: {
                channelId: channel.id,
                youtubeVideoId: video.videoId,
                title: video.title,
                viewCount: video.viewCount,
                publishedAt: video.publishedAt,
                isViral: false,
                thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
              },
              update: {
                viewCount: video.viewCount,
                title: video.title,
              },
            })
            .catch(() => null);
        }

        updated++;
        log.push(
          `✅ ${channel.title}: ${uploadsLast30Days} uploads/30d, ${totalRecentViews.toLocaleString()} recent views, freq=${uploadFreq}d`
        );

        // 300ms between channels to be respectful
        await new Promise((r) => setTimeout(r, 300));
      } catch {
        log.push(`❌ ${channel.title}: timeout/error`);
      }
    }

    return NextResponse.json({
      success: true,
      total: channels.length,
      updated,
      log,
    });
  } catch (error) {
    console.error("RSS error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
