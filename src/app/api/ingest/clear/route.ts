import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    // Delete in correct order to respect FK constraints
    const [deletedSnapshots, deletedVideos, deletedSaved, deletedChannels] =
      await Promise.all([
        prisma.channelSnapshot.deleteMany({}),
        prisma.videoInsight.deleteMany({}),
        prisma.userSavedNiche.deleteMany({}),
        prisma.channel.deleteMany({}),
      ]);

    return NextResponse.json({
      success: true,
      deletedChannels: deletedChannels.count,
      deletedVideos: deletedVideos.count,
      deletedSnapshots: deletedSnapshots.count,
      deletedSaved: deletedSaved.count,
      message: "Database cleared. Ready for fresh ingest.",
    });
  } catch (error) {
    console.error("Clear error:", error);
    return NextResponse.json(
      { success: false, error: String(error) },
      { status: 500 }
    );
  }
}
