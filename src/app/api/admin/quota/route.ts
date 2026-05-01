import { NextRequest, NextResponse } from "next/server";
import { quotaManager } from "@/lib/youtube/quotaManager";
import { getCacheStats } from "@/lib/youtube/cache";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "dev-admin-secret";

/**
 * GET /api/admin/quota — Full quota budget status + cache stats.
 * Protected by x-admin-secret header.
 *
 * Also accessible without secret if ?widget=true (returns minimal data
 * for the dashboard header widget — only shows mode + total percent).
 */
export async function GET(request: NextRequest) {
  const isWidget = request.nextUrl.searchParams.get("widget") === "true";

  // Widget mode — lightweight, no auth required (only shows safe data)
  if (isWidget) {
    try {
      const status = await quotaManager.getStatus();
      return NextResponse.json({
        mode: status.mode,
        totalPercent: status.total.percent,
        totalRemaining: status.total.remaining,
        resetsInSeconds: status.resetsInSeconds,
      });
    } catch {
      return NextResponse.json({ mode: "api", totalPercent: "0.0%", totalRemaining: 10000, resetsInSeconds: 0 });
    }
  }

  // Full admin view — requires secret
  const secret = request.headers.get("x-admin-secret");
  if (secret !== ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [status, cache] = await Promise.all([
      quotaManager.getStatus(),
      getCacheStats(),
    ]);

    return NextResponse.json({ quota: status, cache });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to get quota status",
        details: error instanceof Error ? error.message : "Unknown",
      },
      { status: 500 }
    );
  }
}
