import { NextResponse } from "next/server";
import { fetchSimilarChannels } from "@/lib/data/dataService";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const channels = await fetchSimilarChannels(params.id);
    return NextResponse.json({ channels, count: channels.length });
  } catch (error) {
    console.error("Similar channels error:", error);
    return NextResponse.json(
      { error: "Failed to fetch similar channels" },
      { status: 500 }
    );
  }
}
