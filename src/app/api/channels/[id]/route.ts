import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const channel = await prisma.channel.findUnique({
      where: { id: params.id },
      include: {
        nicheCategory: true,
        videos: {
          orderBy: { viewCount: "desc" },
          take: 20,
        },
      },
    });

    if (!channel) {
      return NextResponse.json({ error: "Channel not found" }, { status: 404 });
    }

    // Compute extra analytics
    const viralVideos = channel.videos.filter((v) => v.isViral).length;
    const avgViews =
      channel.videos.length > 0
        ? Math.round(
            channel.videos.reduce((sum, v) => sum + v.viewCount, 0) /
              channel.videos.length
          )
        : 0;
    const avgLikes =
      channel.videos.length > 0
        ? Math.round(
            channel.videos.reduce((sum, v) => sum + v.likeCount, 0) /
              channel.videos.length
          )
        : 0;
    const engagementRate =
      avgViews > 0 ? ((avgLikes / avgViews) * 100).toFixed(2) : "0";

    return NextResponse.json({
      channel: {
        ...channel,
        viewCount: Number(channel.viewCount),
      },
      analytics: {
        viralVideos,
        avgViews,
        avgLikes,
        engagementRate,
        totalVideosAnalyzed: channel.videos.length,
      },
    });
  } catch (error) {
    console.error("Channel detail error:", error);
    return NextResponse.json({ error: "Failed to fetch channel" }, { status: 500 });
  }
}
