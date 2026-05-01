import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function fetchRSS(channelId: string) {
  const res = await fetch(
    `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
    {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36" },
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) return null;
  const xml = await res.text();

  // Parse upload frequency from publish dates
  const dateMatches = xml.match(/<published>([^<]+)<\/published>/g) || [];
  const dates = dateMatches
    .slice(1, 6) // skip channel-level date, take video dates
    .map((d) => new Date(d.replace(/<\/?published>/g, "")).getTime());

  let uploadFrequency = 7;
  if (dates.length >= 2) {
    const gaps: number[] = [];
    for (let i = 0; i < dates.length - 1; i++) {
      gaps.push((dates[i] - dates[i + 1]) / 86400000);
    }
    uploadFrequency = gaps.reduce((a, b) => a + b, 0) / gaps.length;
  }

  const lastUpload = dates[0] ? new Date(dates[0]) : null;

  // Count recent uploads
  const now = Date.now();
  const recent30 = dates.filter((d) => now - d < 30 * 86400000).length;

  return {
    uploadFrequency: Math.round(uploadFrequency * 10) / 10,
    lastVideoAt: lastUpload,
    videosLast30Days: recent30,
  };
}

export async function POST() {
  const channels = await prisma.channel.findMany({
    select: { id: true, youtubeId: true },
    take: 100,
    orderBy: { lastScrapedAt: "asc" },
  });

  let updated = 0;
  const BATCH = 20;

  for (let i = 0; i < channels.length; i += BATCH) {
    const batch = channels.slice(i, i + BATCH);
    await Promise.allSettled(
      batch.map(async (ch) => {
        const rss = await fetchRSS(ch.youtubeId);
        if (!rss) return;
        await prisma.channel.update({
          where: { id: ch.id },
          data: { uploadFrequency: rss.uploadFrequency },
        });
        updated++;
      })
    );
    // Rate limit between batches
    await new Promise((r) => setTimeout(r, 500));
  }

  return NextResponse.json({
    success: true,
    updated,
    total: channels.length,
  });
}
