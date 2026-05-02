import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "avgScore";
    const tab = searchParams.get("tab") || "all";

    // Fetch all niches with channel stats
    const niches = await prisma.nicheCategory.findMany({
      where: search
        ? { name: { contains: search, mode: "insensitive" } }
        : undefined,
      include: {
        _count: { select: { channels: true } },
        channels: {
          select: {
            subscriberCount: true,
            viewCount: true,
            videoCount: true,
            uploadFrequency: true,
            channelAge: true,
            nicheScore: true,
            estimatedMonthlyRevenue: true,
            isOutlier: true,
            isTrending: true,
          },
        },
      },
    });

    // Compute aggregated keyword stats
    const keywords = niches.map((niche) => {
      const channels = niche.channels;
      const count = channels.length;

      if (count === 0) {
        return {
          id: niche.id,
          keyword: niche.name,
          slug: niche.slug,
          description: niche.description,
          totalChannels: 0,
          avgSubscribers: 0,
          avgViewsPerVideo: 0,
          avgUploads: 0,
          avgChannelAge: 0,
          avgScore: niche.averageNicheScore,
          avgRevenue: 0,
          estimatedCPM: niche.estimatedCPM,
          competitionLevel: niche.competitionLevel,
          trendDirection: niche.trendDirection,
          outlierCount: 0,
          trendingCount: 0,
        };
      }

      const totalSubs = channels.reduce((sum, c) => sum + c.subscriberCount, 0);
      const totalViews = channels.reduce((sum, c) => sum + Number(c.viewCount), 0);
      const totalVideos = channels.reduce((sum, c) => sum + c.videoCount, 0);
      const totalUploadFreq = channels.reduce((sum, c) => sum + c.uploadFrequency, 0);
      const totalAge = channels.reduce((sum, c) => sum + (c.channelAge || 0), 0);
      const totalRevenue = channels.reduce((sum, c) => sum + c.estimatedMonthlyRevenue, 0);
      const outlierCount = channels.filter((c) => c.isOutlier).length;
      const trendingCount = channels.filter((c) => c.isTrending).length;

      return {
        id: niche.id,
        keyword: niche.name,
        slug: niche.slug,
        description: niche.description,
        totalChannels: count,
        avgSubscribers: Math.round(totalSubs / count),
        avgViewsPerVideo: totalVideos > 0 ? Math.round(totalViews / totalVideos) : 0,
        avgUploads: Math.round(totalUploadFreq / count),
        avgChannelAge: Math.round(totalAge / count),
        avgScore: niche.averageNicheScore,
        avgRevenue: Math.round(totalRevenue / count),
        estimatedCPM: niche.estimatedCPM,
        competitionLevel: niche.competitionLevel,
        trendDirection: niche.trendDirection,
        outlierCount,
        trendingCount,
      };
    });

    // Apply tab filters
    let filtered = keywords;
    switch (tab) {
      case "outliers":
        filtered = keywords.filter((k) => k.outlierCount > 0);
        break;
      case "highViews":
        filtered = keywords.filter((k) => k.avgViewsPerVideo > 50000);
        break;
      case "lowCompetition":
        filtered = keywords.filter((k) => k.competitionLevel === "LOW");
        break;
      case "highRevenue":
        filtered = keywords.filter((k) => k.avgRevenue > 0);
        break;
      case "rising":
        filtered = keywords.filter((k) => k.trendDirection === "UP");
        break;
    }

    // Sort
    const sortMap: Record<string, (a: (typeof keywords)[0], b: (typeof keywords)[0]) => number> = {
      avgScore: (a, b) => b.avgScore - a.avgScore,
      avgSubscribers: (a, b) => b.avgSubscribers - a.avgSubscribers,
      avgViewsPerVideo: (a, b) => b.avgViewsPerVideo - a.avgViewsPerVideo,
      totalChannels: (a, b) => b.totalChannels - a.totalChannels,
      avgRevenue: (a, b) => b.avgRevenue - a.avgRevenue,
      estimatedCPM: (a, b) => b.estimatedCPM - a.estimatedCPM,
    };

    if (sortMap[sort]) {
      filtered.sort(sortMap[sort]);
    }

    return NextResponse.json({ keywords: filtered });
  } catch (error) {
    console.error("Keywords API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch keywords" },
      { status: 500 }
    );
  }
}
