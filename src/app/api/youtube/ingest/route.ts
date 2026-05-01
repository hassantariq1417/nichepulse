import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  searchChannels,
  getChannelDetails,
  getChannelVideos,
  calculateChannelMetrics,
  estimateRevenue,
  calculateNicheScore,
} from "@/lib/youtube";

// POST /api/youtube/ingest — Ingest channels for a given niche query
export async function POST(request: NextRequest) {
  try {
    const { query, nicheSlug, maxChannels = 15 } = await request.json();

    if (!query || !nicheSlug) {
      return NextResponse.json(
        { error: "Missing query or nicheSlug" },
        { status: 400 }
      );
    }

    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json(
        { error: "YOUTUBE_API_KEY not configured. Add your key to .env.local — see the setup guide in the artifacts folder." },
        { status: 500 }
      );
    }

    // Find the niche category
    const niche = await prisma.nicheCategory.findUnique({
      where: { slug: nicheSlug },
    });

    if (!niche) {
      return NextResponse.json(
        { error: `Niche '${nicheSlug}' not found` },
        { status: 404 }
      );
    }

    // Step 1: Search YouTube for channels
    const channelIds = await searchChannels(query, maxChannels);

    if (channelIds.length === 0) {
      return NextResponse.json(
        { error: "No channels found for this query" },
        { status: 404 }
      );
    }

    // Step 2: Get channel details
    const channelDetails = await getChannelDetails(channelIds);

    let ingested = 0;
    let skipped = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const channel of channelDetails) {
      try {
        // Step 3: Get recent videos for this channel
        const videos = await getChannelVideos(channel.id, 10);

        // Step 4: Calculate metrics
        const metrics = calculateChannelMetrics(videos);
        const revenue = estimateRevenue(
          channel.viewCount,
          channel.videoCount,
          niche.estimatedCPM || 8.0
        );
        const nicheScore = calculateNicheScore(
          channel.subscriberCount,
          channel.viewCount,
          channel.videoCount,
          metrics.growthRate30d,
          metrics.uploadFrequency
        );

        // Determine channel format from video durations
        const format = metrics.uploadFrequency > 5 ? "SHORT_FORM" : 
                       metrics.uploadFrequency > 2 ? "BOTH" : "LONG_FORM";

        // Channel age in months
        const channelAge = Math.floor(
          (Date.now() - new Date(channel.publishedAt).getTime()) /
            (30 * 24 * 60 * 60 * 1000)
        );

        // Step 5: Upsert into database
        const existingChannel = await prisma.channel.findUnique({
          where: { youtubeId: channel.id },
        });

        const channelData = {
          title: channel.title,
          description: channel.description.slice(0, 2000),
          thumbnailUrl: channel.thumbnailUrl,
          subscriberCount: channel.subscriberCount,
          viewCount: BigInt(channel.viewCount),
          videoCount: channel.videoCount,
          category: niche.name,
          format: format as "LONG_FORM" | "SHORT_FORM" | "BOTH",
          estimatedMonthlyRevenue: revenue,
          nicheScore,
          growthRate7d: metrics.growthRate7d,
          growthRate30d: metrics.growthRate30d,
          viewsLast48h: metrics.viewsLast48h,
          uploadFrequency: metrics.uploadFrequency,
          isOutlier: metrics.isOutlier,
          isTrending: metrics.isTrending,
          country: channel.country,
          channelAge,
          nicheCategoryId: niche.id,
          lastScrapedAt: new Date(),
        };

        if (existingChannel) {
          await prisma.channel.update({
            where: { youtubeId: channel.id },
            data: channelData,
          });
          updated++;
        } else {
          await prisma.channel.create({
            data: {
              youtubeId: channel.id,
              ...channelData,
            },
          });
          ingested++;
        }

        // Step 6: Upsert videos
        for (const video of videos) {
          const hoursAge = Math.max(
            (Date.now() - new Date(video.publishedAt).getTime()) /
              (60 * 60 * 1000),
            1
          );
          const viewsPerHour = parseFloat(
            (video.viewCount / hoursAge).toFixed(1)
          );
          const isViral = viewsPerHour > 500 || video.viewCount > 1000000;

          const dbChannel = await prisma.channel.findUnique({
            where: { youtubeId: channel.id },
          });

          if (dbChannel) {
            await prisma.videoInsight.upsert({
              where: { youtubeVideoId: video.id },
              create: {
                channelId: dbChannel.id,
                youtubeVideoId: video.id,
                title: video.title,
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                commentCount: video.commentCount,
                publishedAt: new Date(video.publishedAt),
                isViral,
                viewsPerHour,
                thumbnail: video.thumbnail,
              },
              update: {
                title: video.title,
                viewCount: video.viewCount,
                likeCount: video.likeCount,
                commentCount: video.commentCount,
                isViral,
                viewsPerHour,
              },
            });
          }
        }

        // Small delay to respect rate limits
        await new Promise((r) => setTimeout(r, 200));
      } catch (channelError) {
        const msg =
          channelError instanceof Error
            ? channelError.message
            : "Unknown error";
        errors.push(`${channel.title}: ${msg}`);
        skipped++;
      }
    }

    // Step 7: Update niche category stats
    const nicheChannels = await prisma.channel.findMany({
      where: { nicheCategoryId: niche.id },
      select: { nicheScore: true, estimatedMonthlyRevenue: true },
    });

    const avgScore =
      nicheChannels.length > 0
        ? nicheChannels.reduce((sum, c) => sum + c.nicheScore, 0) /
          nicheChannels.length
        : 0;

    await prisma.nicheCategory.update({
      where: { id: niche.id },
      data: {
        channelCount: nicheChannels.length,
        averageNicheScore: parseFloat(avgScore.toFixed(1)),
      },
    });

    return NextResponse.json({
      success: true,
      summary: {
        query,
        niche: niche.name,
        channelsFound: channelDetails.length,
        newChannels: ingested,
        updatedChannels: updated,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
      },
    });
  } catch (error) {
    console.error("YouTube ingestion error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to ingest channels",
      },
      { status: 500 }
    );
  }
}

// GET /api/youtube/ingest — Get ingestion status / last run
export async function GET() {
  const totalChannels = await prisma.channel.count();
  const totalVideos = await prisma.videoInsight.count();
  const niches = await prisma.nicheCategory.findMany({
    select: { name: true, channelCount: true, slug: true },
    orderBy: { channelCount: "desc" },
  });

  const lastScraped = await prisma.channel.findFirst({
    where: { lastScrapedAt: { not: null } },
    orderBy: { lastScrapedAt: "desc" },
    select: { lastScrapedAt: true },
  });

  return NextResponse.json({
    totalChannels,
    totalVideos,
    niches,
    lastScrapedAt: lastScraped?.lastScrapedAt || null,
  });
}
