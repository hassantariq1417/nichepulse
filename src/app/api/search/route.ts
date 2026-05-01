import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseSubscribers(text: string): number {
  if (!text) return 0;
  const n = parseFloat(text.replace(/[^0-9.]/g, ""));
  if (/m/i.test(text)) return Math.round(n * 1e6);
  if (/k/i.test(text)) return Math.round(n * 1e3);
  return Math.round(n);
}

async function searchYouTubei(query: string) {
  const res = await fetch("https://www.youtube.com/youtubei/v1/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      "X-YouTube-Client-Name": "1",
      "X-YouTube-Client-Version": "2.20231121.00.00",
    },
    body: JSON.stringify({
      query,
      params: "EgIQAg%3D%3D", // channels only
      context: {
        client: {
          clientName: "WEB",
          clientVersion: "2.20231121.00.00",
          hl: "en",
          gl: "US",
        },
      },
    }),
    signal: AbortSignal.timeout(10000),
  });
  return res.json();
}

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get("q") || "";
  const limitParam = parseInt(req.nextUrl.searchParams.get("limit") || "20", 10);
  const limit = Math.min(limitParam, 50);

  if (!query.trim() || query.trim().length < 2) {
    return NextResponse.json({ channels: [], total: 0, query: "" });
  }

  try {
    // First check DB
    const dbResults = await prisma.channel.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { nicheScore: "desc" },
      take: limit,
      include: {
        nicheCategory: { select: { name: true, slug: true } },
      },
    });

    if (dbResults.length >= 5) {
      return NextResponse.json({
        channels: dbResults.map((c) => ({ ...c, viewCount: Number(c.viewCount) })),
        total: dbResults.length,
        query,
        source: "database",
      });
    }

    // DB has insufficient results — use YouTubei
    const ytData = await searchYouTubei(query);
    const contents =
      ytData?.contents?.twoColumnSearchResultsRenderer?.primaryContents
        ?.sectionListRenderer?.contents || [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ytChannels: any[] = [];
    for (const section of contents) {
      for (const item of section?.itemSectionRenderer?.contents || []) {
        const ch = item?.channelRenderer;
        if (!ch?.channelId) continue;

        const subText = ch?.subscriberCountText?.simpleText || "0";

        ytChannels.push({
          id: `yt-${ch.channelId}`,
          youtubeId: ch.channelId,
          title: ch?.title?.simpleText || "",
          subscriberCount: parseSubscribers(subText),
          subscriberCountText: subText,
          thumbnailUrl: ch?.thumbnail?.thumbnails?.slice(-1)[0]?.url || "",
          nicheScore: 50,
          category: query,
          isOutlier: false,
          description: ch?.descriptionSnippet?.runs
            ?.map((r: { text: string }) => r.text)
            .join("") || "",
          viewCount: 0,
        });
      }
    }

    return NextResponse.json({
      channels: [
        ...dbResults.map((c) => ({ ...c, viewCount: Number(c.viewCount) })),
        ...ytChannels,
      ].slice(0, limit),
      total: dbResults.length + ytChannels.length,
      query,
      source: dbResults.length > 0 ? "mixed" : "youtube",
    });
  } catch (error) {
    console.error("Search error:", error);

    // Fallback to DB-only
    const dbResults = await prisma.channel.findMany({
      where: {
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { category: { contains: query, mode: "insensitive" } },
        ],
      },
      orderBy: { nicheScore: "desc" },
      take: limit,
    });

    return NextResponse.json({
      channels: dbResults.map((c) => ({ ...c, viewCount: Number(c.viewCount) })),
      total: dbResults.length,
      query,
      source: "database_fallback",
    });
  }
}
