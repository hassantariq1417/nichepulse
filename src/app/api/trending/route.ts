import { NextRequest, NextResponse } from "next/server";
import { fetchTrending } from "@/lib/data/dataService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const category = request.nextUrl.searchParams.get("category") || undefined;
    const videos = await fetchTrending(category);

    return NextResponse.json({ videos, count: videos.length });
  } catch (error) {
    console.error("Trending API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending" },
      { status: 500 }
    );
  }
}
