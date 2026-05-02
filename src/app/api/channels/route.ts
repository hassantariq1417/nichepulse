import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Preset tab filters — NexLev-style smart filter tabs
const TAB_PRESETS: Record<string, { where: Record<string, unknown>; orderBy?: Record<string, string> }> = {
  all: { where: {} },
  outliers: {
    where: { isOutlier: true },
    orderBy: { nicheScore: "desc" },
  },
  trending: {
    where: { isTrending: true },
    orderBy: { growthRate30d: "desc" },
  },
  highScoreLowSubs: {
    where: { nicheScore: { gte: 65 }, subscriberCount: { lt: 100000 } },
    orderBy: { nicheScore: "desc" },
  },
  highRevenue: {
    where: { estimatedMonthlyRevenue: { gt: 0 } },
    orderBy: { estimatedMonthlyRevenue: "desc" },
  },
  longForm: {
    where: { format: "LONG_FORM" },
    orderBy: { nicheScore: "desc" },
  },
  shortForm: {
    where: { format: "SHORT_FORM" },
    orderBy: { nicheScore: "desc" },
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tab = searchParams.get("tab") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "nicheScore";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search") || "";
    const nicheId = searchParams.get("nicheId");

    // Start from tab preset
    const preset = TAB_PRESETS[tab] || TAB_PRESETS.all;
    const where: Record<string, unknown> = { ...preset.where };

    // Layer on search and manual filters
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (nicheId) where.nicheCategoryId = nicheId;

    const orderBy = preset.orderBy || { [sort]: order };

    const [channels, total] = await Promise.all([
      prisma.channel.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          nicheCategory: { select: { name: true, slug: true } },
          _count: { select: { videos: true } },
          videos: {
            take: 4,
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
      }),
      prisma.channel.count({ where }),
    ]);

    return NextResponse.json({
      channels: channels.map((c) => ({
        ...c,
        viewCount: Number(c.viewCount),
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Channels API error:", error);
    return NextResponse.json({ error: "Failed to fetch channels" }, { status: 500 });
  }
}
