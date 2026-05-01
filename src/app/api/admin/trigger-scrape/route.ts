import { NextRequest, NextResponse } from "next/server";
import {
  enqueueScrapeCategory,
  enqueueScrapeChannel,
  enqueueRefreshTrending,
} from "@/lib/jobs/scraperQueue";
import { scrapeAllCategories } from "@/lib/jobs/scheduler";

// Admin secret — set ADMIN_SECRET in env vars
const ADMIN_SECRET = process.env.ADMIN_SECRET || "dev-admin-secret";

/**
 * POST /api/admin/trigger-scrape
 *
 * Protected admin endpoint to manually trigger scrape jobs.
 * Requires x-admin-secret header for authentication.
 *
 * Body: { action: "scrape-category" | "scrape-channel" | "refresh-trending" | "scrape-all", ...params }
 */
export async function POST(request: NextRequest) {
  // Auth check
  const secret = request.headers.get("x-admin-secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case "scrape-category": {
        const { category, nicheSlug, maxResults = 25 } = body;
        if (!category || !nicheSlug) {
          return NextResponse.json(
            { error: "Missing category or nicheSlug" },
            { status: 400 }
          );
        }
        const job = await enqueueScrapeCategory(category, nicheSlug, maxResults);
        return NextResponse.json({
          success: true,
          jobId: job.id,
          message: `Enqueued category scrape: ${category}`,
        });
      }

      case "scrape-channel": {
        const { youtubeId } = body;
        if (!youtubeId) {
          return NextResponse.json(
            { error: "Missing youtubeId" },
            { status: 400 }
          );
        }
        const job = await enqueueScrapeChannel(youtubeId);
        return NextResponse.json({
          success: true,
          jobId: job.id,
          message: `Enqueued channel scrape: ${youtubeId}`,
        });
      }

      case "refresh-trending": {
        const { limit = 100 } = body;
        const job = await enqueueRefreshTrending(limit);
        return NextResponse.json({
          success: true,
          jobId: job.id,
          message: `Enqueued trending refresh for top ${limit} channels`,
        });
      }

      case "scrape-all": {
        const result = await scrapeAllCategories();
        return NextResponse.json({
          success: true,
          message: `Enqueued all categories`,
          ...result,
        });
      }

      default:
        return NextResponse.json(
          {
            error: `Unknown action: ${action}`,
            validActions: [
              "scrape-category",
              "scrape-channel",
              "refresh-trending",
              "scrape-all",
            ],
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[admin/trigger-scrape] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to enqueue job",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
