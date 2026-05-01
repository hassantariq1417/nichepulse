import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sort = searchParams.get("sort") || "averageNicheScore";
    const order = searchParams.get("order") || "desc";
    const competition = searchParams.get("competition");
    const trend = searchParams.get("trend");

    // Build where clause
    const where: Record<string, unknown> = {};
    if (competition) where.competitionLevel = competition;
    if (trend) where.trendDirection = trend;

    const niches = await prisma.nicheCategory.findMany({
      where,
      orderBy: { [sort]: order },
      include: {
        _count: { select: { channels: true } },
        channels: {
          take: 3,
          orderBy: { nicheScore: "desc" },
          select: {
            id: true,
            title: true,
            subscriberCount: true,
            nicheScore: true,
            isOutlier: true,
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
