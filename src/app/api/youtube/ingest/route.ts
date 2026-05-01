import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  searchChannels,
  getChannelData,
} from "@/lib/data/youtubeiClient";
import { pollChannelRSS, detectOutlier } from "@/lib/data/rssPoller";
import {
  calculateNicheScore,
  estimateMonthlyRevenue,
  estimateMonthlyViews,
} from "@/lib/scoring";
export const dynamic = "force-dynamic";


// POST /api/youtube/ingest — Ingest channels for a given niche query (FREE)
export async function POST(request: NextRequest) {
  try {
    const { query, nicheSlug, maxChannels = 15 } = await request.json();

    if (!query || !nicheSlug) {
      return NextResponse.json(
        { error: "Missing query or nicheSlug" },
        { status: 400 }
      );
    }

    const niche = await prisma.nicheCategory.findUnique({
      where: { slug: nicheSlug },
    });

    if (!niche) {
      return NextResponse.json(
        { error: `Niche '${nicheSlug}' not found` },
        { status: 404 }
      );
    }

    // Step 1: Search for channels (FREE — YouTubei)
    const searchResults = await searchChannels(query, maxChannels);

    if (searchResults.length === 0) {
      return NextResponse.json(
        { error: "No channels found for this query" },
        { status: 404 }
      );
    }

    let ingested = 0;
    let skipped = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const searchResult of searchResults) {
      try {
        // Step 2: Get full channel data (FREE — YouTubei)
        const channel = await getChannelData(searchResult.channelId);
        if (!channel) {
          skipped++;
          continue;
        }

        // Step 3: Enrich with RSS feed (FREE — public XML)
        const rss = await pollChannelRSS(channel.channelId);
        const uploadFrequency = rss?.uploadFrequency || 7;

        // Step 4: Calculate scoring
        const avgViews =
          channel.recentVideos.length > 0
            ? channel.recentVideos.reduce((sum, v) => sum + v.viewCount, 0) /
              channel.recentVideos.length
            : 0;

        const nicheScore = calculateNicheScore({
          subscriberCount: channel.subscriberCount,
          videoCount: channel.videoCount,
          uploadFrequency,
          recentVideos: channel.recentVideos,
          avgViews,
        });

        const monthlyViews = estimateMonthlyViews(
          channel.subscriberCount,
          uploadFrequency
        );
        const revenue = estimateMonthlyRevenue(monthlyViews, niche.slug);

        const isOutlier = detectOutlier(
          channel.subscriberCount,
          channel.recentVideos
        );

        // Determine format
        const format =
          uploadFrequency > 5
            ? "SHORT_FORM"
            : uploadFrequency > 2
              ? "BOTH"
              : "LONG_FORM";

        // Step 5: Upsert into database
        const existingChannel = await prisma.channel.findUnique({
          where: { youtubeId: channel.channelId },
        });

        const channelData = {
          title: channel.channelTitle,
          description: channel.description.slice(0, 2000),
          thumbnailUrl: channel.thumbnailUrl,
          subscriberCount: channel.subscriberCount,
          viewCount: BigInt(channel.viewCount),
          videoCount: channel.videoCount,
          category: niche.name,
          format: format as "LONG_FORM" | "SHORT_FORM" | "BOTH",
          estimatedMonthlyRevenue: revenue,
          nicheScore,
          growthRate7d: 0,
          growthRate30d: 0,
          viewsLast48h: 0,
          uploadFrequency,
          isOutlier,
          isTrending: false,
          country: channel.country,
          nicheCategoryId: niche.id,
          lastScrapedAt: new Date(),
        };

        if (existingChannel) {
          await prisma.channel.update({
            where: { youtubeId: channel.channelId },
            data: channelData,
          });
          updated++;
        } else {
          await prisma.channel.create({
            data: {
              youtubeId: channel.channelId,
              ...channelData,
            },
          });
          ingested++;
        }

        // Step 6: Upsert video insights from recent videos
        const dbChannel = await prisma.channel.findUnique({
          where: { youtubeId: channel.channelId },
        });

        if (dbChannel) {
          for (const video of channel.recentVideos.slice(0, 10)) {
            if (!video.videoId) continue;

            const hoursAge = video.publishedAt
              ? Math.max(
                  (Date.now() - video.publishedAt.getTime()) / 3_600_000,
                  1
                )
              : 24;

            const viewsPerHour = parseFloat(
              (video.viewCount / hoursAge).toFixed(1)
            );
            const isViral = viewsPerHour > 500 || video.viewCount > 1_000_000;

            await prisma.videoInsight.upsert({
              where: { youtubeVideoId: video.videoId },
              create: {
                channelId: dbChannel.id,
                youtubeVideoId: video.videoId,
                title: video.title,
                viewCount: video.viewCount,
                likeCount: 0,
                commentCount: 0,
                publishedAt: video.publishedAt || new Date(),
                isViral,
                viewsPerHour,
                thumbnail: video.thumbnailUrl,
              },
              update: {
                title: video.title,
                viewCount: video.viewCount,
                isViral,
                viewsPerHour,
              },
            });
          }
        }

        // Respect rate limits
        await new Promise((r) => setTimeout(r, 300));
      } catch (channelError) {
        const msg =
          channelError instanceof Error
            ? channelError.message
            : "Unknown error";
        errors.push(`${searchResult.channelTitle}: ${msg}`);
        skipped++;
      }
    }

    // Step 7: Update niche category stats
    const nicheChannels = await prisma.channel.findMany({
      where: { nicheCategoryId: niche.id },
      select: { nicheScore: true },
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
        channelsFound: searchResults.length,
        newChannels: ingested,
        updatedChannels: updated,
        skipped,
        errors: errors.length > 0 ? errors : undefined,
        cost: "$0 (YouTubei + RSS)",
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
    dataSource: "YouTubei + RSS (free)",
  });
}
