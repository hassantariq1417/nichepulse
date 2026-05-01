"use client";

import { Bookmark, Search, Inbox } from "lucide-react";

export default function SavedPage() {
  return (
    <div className="space-y-6 max-w-[1400px]">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Bookmark className="w-6 h-6 text-[#FCD34D]" />
          Saved Niches
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Your bookmarked niches and channels for quick access
        </p>
      </div>

      <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 flex flex-col items-center justify-center min-h-[400px] text-center px-8">
        <div className="w-16 h-16 rounded-2xl bg-[#FCD34D]/10 flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-[#FCD34D]" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No saved items yet</h3>
        <p className="text-sm text-[#94A3B8] max-w-sm">
          Save niches and channels from the Niche Finder or Channel Explorer to
          build your watchlist. They&apos;ll appear here for quick access.
        </p>
        <a
          href="/dashboard/niches"
          className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#64FFDA]/10 text-[#64FFDA] text-sm font-medium hover:bg-[#64FFDA]/20 transition-colors cursor-pointer"
        >
          <Search className="w-4 h-4" />
          Explore Niches
        </a>
      </div>
    </div>
  );
}
