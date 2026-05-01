import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchChannel } from "@/lib/data/dataService";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // 1. Try Prisma DB first (for channels we've already stored)
    const dbChannel = await prisma.channel.findFirst({
      where: {
        OR: [
          { id },
          { youtubeId: id },
        ],
      },
      include: {
        nicheCategory: true,
        videos: {
          orderBy: { viewCount: "desc" },
          take: 20,
        },
      },
    });

    if (dbChannel) {
      const viralVideos = dbChannel.videos.filter((v) => v.isViral).length;
      const avgViews =
        dbChannel.videos.length > 0
          ? Math.round(
              dbChannel.videos.reduce((sum, v) => sum + v.viewCount, 0) /
                dbChannel.videos.length
            )
          : 0;
      const avgLikes =
        dbChannel.videos.length > 0
          ? Math.round(
              dbChannel.videos.reduce((sum, v) => sum + v.likeCount, 0) /
                dbChannel.videos.length
            )
          : 0;
      const engagementRate =
        avgViews > 0 ? ((avgLikes / avgViews) * 100).toFixed(2) : "0";

      return NextResponse.json({
        channel: { ...dbChannel, viewCount: Number(dbChannel.viewCount) },
        analytics: {
          viralVideos,
          avgViews,
          avgLikes,
          engagementRate,
          totalVideosAnalyzed: dbChannel.videos.length,
        },
        source: "database",
      });
    }

    // 2. Fall back to live YouTubei fetch (handles UC IDs and @handles)
    const liveData = await fetchChannel(id);
    if (!liveData) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    const avgViews =
      liveData.recentVideos.length > 0
        ? Math.round(
            liveData.recentVideos.reduce((sum, v) => sum + v.viewCount, 0) /
              liveData.recentVideos.length
          )
        : 0;

    return NextResponse.json({
      channel: liveData,
      analytics: {
        viralVideos: 0,
        avgViews,
        avgLikes: 0,
        engagementRate: "0",
        totalVideosAnalyzed: liveData.recentVideos.length,
      },
      source: "youtubei",
    });
  } catch (error) {
    console.error("Channel detail error:", error);
    return NextResponse.json(
      { error: "Failed to fetch channel" },
      { status: 500 }
    );
  }
}
