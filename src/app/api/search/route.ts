import { NextRequest, NextResponse } from "next/server";
import { searchForChannels } from "@/lib/data/dataService";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q");
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    if (!q || q.trim().length < 2) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required (min 2 chars)" },
        { status: 400 }
      );
    }

    const result = await searchForChannels(q.trim(), Math.min(limit, 50));

    return NextResponse.json({
      channels: result.channels,
      query: result.query,
      cached: result.cached,
      count: result.channels.length,
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}
