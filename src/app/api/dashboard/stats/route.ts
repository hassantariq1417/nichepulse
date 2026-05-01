import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalChannels,
      totalNiches,
      totalVideos,
      outlierCount,
      trendingCount,
      topNiches,
      recentChannels,
    ] = await Promise.all([
      prisma.channel.count(),
      prisma.nicheCategory.count(),
      prisma.videoInsight.count(),
      prisma.channel.count({ where: { isOutlier: true } }),
      prisma.channel.count({ where: { isTrending: true } }),
      prisma.nicheCategory.findMany({
        orderBy: { averageNicheScore: "desc" },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          averageNicheScore: true,
          channelCount: true,
          competitionLevel: true,
          trendDirection: true,
          estimatedCPM: true,
        },
      }),
      prisma.channel.findMany({
        orderBy: { nicheScore: "desc" },
        take: 8,
        select: {
          id: true,
          title: true,
          subscriberCount: true,
          viewCount: true,
          nicheScore: true,
          growthRate30d: true,
          isOutlier: true,
          isTrending: true,
          estimatedMonthlyRevenue: true,
          category: true,
          nicheCategory: { select: { name: true } },
          lastScrapedAt: true,
        },
      }),
    ]);

    // Aggregate stats
    const avgScore = await prisma.channel.aggregate({
      _avg: { nicheScore: true },
    });

    const avgRevenue = await prisma.channel.aggregate({
      _avg: { estimatedMonthlyRevenue: true },
    });

    return NextResponse.json({
      stats: {
        totalChannels,
        totalNiches,
        totalVideos,
        outlierCount,
        trendingCount,
        avgNicheScore: Math.round((avgScore._avg.nicheScore ?? 0) * 10) / 10,
        avgRevenue: Math.round(avgRevenue._avg.estimatedMonthlyRevenue ?? 0),
      },
      topNiches,
      recentChannels: recentChannels.map((c) => ({
        ...c,
        viewCount: Number(c.viewCount),
      })),
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
