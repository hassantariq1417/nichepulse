"use client";

import { Package } from "lucide-react";

interface CachedBadgeProps {
  lastUpdated?: Date | string | null;
  className?: string;
}

/**
 * Subtle badge shown when data is served from cache / scraper.
 * Displays: "📦 Cached · Updated 4h ago"
 */
export function CachedBadge({ lastUpdated, className = "" }: CachedBadgeProps) {
  const timeAgo = lastUpdated ? getTimeAgo(new Date(lastUpdated)) : null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FCD34D]/10 border border-[#FCD34D]/15 text-[10px] font-medium text-[#FCD34D] ${className}`}
      title={
        lastUpdated
          ? `Data from cache. Last refreshed: ${new Date(lastUpdated).toLocaleString()}`
          : "Serving cached data"
      }
    >
      <Package className="w-3 h-3" />
      Cached{timeAgo ? ` · Updated ${timeAgo}` : ""}
    </span>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
