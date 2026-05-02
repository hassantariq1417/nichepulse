import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Preset tab filters — NexLev-style smart filter tabs
const TAB_PRESETS: Record<string, { where: Record<string, unknown>; orderBy?: Record<string, string> }> = {
  all: { where: {} },
  outliers: {
    where: { competitionLevel: "LOW", averageNicheScore: { gte: 70 } },
    orderBy: { averageNicheScore: "desc" },
  },
  highGrowth: {
    where: { trendDirection: "UP" },
    orderBy: { averageNicheScore: "desc" },
  },
  highCPM: {
    where: { estimatedCPM: { gte: 10 } },
    orderBy: { estimatedCPM: "desc" },
  },
  lowCompetition: {
    where: { competitionLevel: "LOW" },
    orderBy: { averageNicheScore: "desc" },
  },
  declining: {
    where: { trendDirection: "DOWN" },
    orderBy: { channelCount: "desc" },
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "all";
    const sort = searchParams.get("sort") || "averageNicheScore";
    const order = searchParams.get("order") || "desc";
    const competition = searchParams.get("competition");
    const trend = searchParams.get("trend");
    const search = searchParams.get("search") || "";

    // Start from tab preset or empty
    const preset = TAB_PRESETS[tab] || TAB_PRESETS.all;
    const where: Record<string, unknown> = { ...preset.where };

    // Layer on additional manual filters
    if (competition) where.competitionLevel = competition;
    if (trend) where.trendDirection = trend;
    if (search) {
      where.name = { contains: search, mode: "insensitive" };
    }

    const orderBy = preset.orderBy || { [sort]: order };

    const niches = await prisma.nicheCategory.findMany({
      where,
      orderBy,
      include: {
        _count: { select: { channels: true } },
        channels: {
          take: 5,
          orderBy: { nicheScore: "desc" },
          select: {
            id: true,
            title: true,
            subscriberCount: true,
            viewCount: true,
            videoCount: true,
            nicheScore: true,
            isOutlier: true,
            thumbnailUrl: true,
            estimatedMonthlyRevenue: true,
            videos: {
              take: 3,
              orderBy: { viewCount: "desc" },
              select: {
                id: true,
                title: true,
                thumbnail: true,
                viewCount: true,
                publishedAt: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json({ niches });
  } catch (error) {
    console.error("Niches API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch niches" },
      { status: 500 }
    );
  }
}
