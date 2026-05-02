import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/* ── Auto-Refresh: Re-scrape the oldest-data channels ──────── */
// Called by Vercel Cron every 6 hours to keep data fresh.
// Processes 10 channels per run (oldest-scraped first).

async function fetchChannelViaRSS(channelId: string) {
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
  const res = await fetch(rssUrl, {
    signal: AbortSignal.timeout(8000),
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
    const videoId = e.match(/<yt:videoId>([^<]+)/)?.[1] || "";
    const entryTitle = e.match(/<title>([^<]+)/)?.[1] || "";
    const published = e.match(/<published>([^<]+)/)?.[1] || "";
    const views = parseInt(
      e.match(/<media:statistics\s+views="(\d+)"/)?.[1] || "0"
    );
    return { videoId, title: entryTitle, viewCount: views, publishedAt: new Date(published) };
  });

  const totalViews = videos.reduce((s, v) => s + v.viewCount, 0);
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

  return { title, videos, totalViews, uploadsLast30d, uploadFrequency };
}

export async function GET() {
  try {
    // Get 10 oldest-scraped channels
    const channels = await prisma.channel.findMany({
      orderBy: { lastScrapedAt: "asc" },
      take: 10,
      select: { id: true, youtubeId: true, title: true, nicheCategoryId: true },
    });

    if (channels.length === 0) {
      return NextResponse.json({ success: true, message: "No channels to refresh" });
    }

    const log: string[] = [];
    let refreshed = 0;

    for (const channel of channels) {
      try {
        const rssData = await fetchChannelViaRSS(channel.youtubeId);
        if (!rssData) {
          log.push(`⏭️ ${channel.title}: RSS unavailable`);
          // Still update lastScrapedAt so it doesn't block the queue
          await prisma.channel.update({
            where: { id: channel.id },
            data: { lastScrapedAt: new Date() },
          });
          continue;
        }

        const avgViews = rssData.videos.length > 0 ? rssData.totalViews / rssData.videos.length : 0;

        // Calculate score
        const avgViewsPerVideo = rssData.totalViews / Math.max(rssData.videos.length, 1);
        const viewVelocity = Math.min((avgViewsPerVideo / 100000) * 100, 100);
        let consistency = 50;
        if (rssData.uploadFrequency <= 1) consistency = 100;
        else if (rssData.uploadFrequency <= 3) consistency = 85;
        else if (rssData.uploadFrequency <= 7) consistency = 70;
        else if (rssData.uploadFrequency <= 14) consistency = 50;
        else if (rssData.uploadFrequency <= 30) consistency = 30;
        const activity = Math.min(rssData.uploadsLast30d * 10, 100);
        let maturity = 50;
        if (rssData.totalViews > 1000000) maturity = 85;
        else if (rssData.totalViews > 100000) maturity = 70;
        const nicheScore = Math.min(Math.max(
          Math.round(viewVelocity * 0.4 + consistency * 0.25 + activity * 0.2 + maturity * 0.15), 1), 100);

        await prisma.channel.update({
          where: { id: channel.id },
          data: {
            viewCount: BigInt(rssData.totalViews),
            videoCount: rssData.videos.length,
            nicheScore,
            uploadFrequency: rssData.uploadFrequency,
            viewsLast48h: Math.round(rssData.totalViews / 15),
            videosLast30Days: rssData.uploadsLast30d,
            estimatedMonthlyRevenue: Math.round(((avgViews * rssData.uploadsLast30d) / 1000) * 8 * 0.6),
            isOutlier: rssData.videos.some((v) => avgViews > 0 && v.viewCount > avgViews * 3),
            isTrending: rssData.uploadsLast30d >= 10,
            lastScrapedAt: new Date(),
          },
        });

        // Save snapshot for growth tracking
        await prisma.channelSnapshot.create({
          data: {
            channelId: channel.id,
            subscriberCount: 0,
            viewCount: rssData.totalViews,
            videoCount: rssData.videos.length,
          },
        }).catch(() => null);

        // Update videos
        for (const video of rssData.videos) {
          if (!video.videoId) continue;
          await prisma.videoInsight.upsert({
            where: { youtubeVideoId: video.videoId },
            create: {
              channelId: channel.id,
              youtubeVideoId: video.videoId,
              title: video.title,
              viewCount: video.viewCount,
              publishedAt: video.publishedAt,
              isViral: avgViews > 0 && video.viewCount > avgViews * 3,
              thumbnail: `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`,
            },
            update: { viewCount: video.viewCount, title: video.title },
          }).catch(() => null);
        }

        refreshed++;
        log.push(`✅ ${rssData.title}: ${rssData.totalViews.toLocaleString()} views, score=${nicheScore}`);
      } catch (err) {
        log.push(`❌ ${channel.title}: ${String(err).slice(0, 80)}`);
      }
    }

    return NextResponse.json({
      success: true,
      refreshed,
      total: channels.length,
      log,
      nextRefreshAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
