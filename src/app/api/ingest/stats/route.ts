import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [channels, niches, videos] = await Promise.all([
      prisma.channel.count(),
      prisma.nicheCategory.count(),
      prisma.videoInsight.count(),
    ]);
    return NextResponse.json({ channels, niches, videos });
  } catch {
    return NextResponse.json({ channels: 0, niches: 0, videos: 0 });
  }
}
