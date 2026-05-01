import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchTrending } from "@/lib/data/dataService";

export async function GET() {
  try {
    const [outliers, trending, viral] = await Promise.all([
      // Outlier channels from DB
      prisma.channel.findMany({
        where: { isOutlier: true },
        orderBy: { nicheScore: "desc" },
        take: 12,
        select: {
          id: true,
          youtubeId: true,
          title: true,
          thumbnailUrl: true,
          subscriberCount: true,
          viewCount: true,
          nicheScore: true,
          growthRate30d: true,
          estimatedMonthlyRevenue: true,
          category: true,
          nicheCategory: { select: { name: true } },
        },
      }),

      // Trending from YouTubei (cached 30 min)
      fetchTrending(),

      // Viral videos from DB
      prisma.videoInsight.findMany({
        where: { isViral: true },
        orderBy: { viewsPerHour: "desc" },
        take: 12,
        select: {
          id: true,
          youtubeVideoId: true,
          title: true,
          viewCount: true,
          viewsPerHour: true,
          thumbnail: true,
          channel: {
            select: { title: true, youtubeId: true },
          },
        },
      }),
    ]);

    return NextResponse.json({
      outliers: outliers.map((o) => ({
        ...o,
        viewCount: Number(o.viewCount),
      })),
      trending: trending.slice(0, 12),
      viral,
    });
  } catch (error) {
    console.error("Dashboard feed error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard feed" },
      { status: 500 }
    );
  }
}
