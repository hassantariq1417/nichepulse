import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const sort = searchParams.get("sort") || "nicheScore";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search") || "";
    const nicheId = searchParams.get("nicheId");
    const outlierOnly = searchParams.get("outlier") === "true";
    const trendingOnly = searchParams.get("trending") === "true";

    const where: Record<string, unknown> = {};
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }
    if (nicheId) where.nicheCategoryId = nicheId;
    if (outlierOnly) where.isOutlier = true;
    if (trendingOnly) where.isTrending = true;

    const [channels, total] = await Promise.all([
      prisma.channel.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          nicheCategory: { select: { name: true, slug: true } },
          _count: { select: { videos: true } },
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
