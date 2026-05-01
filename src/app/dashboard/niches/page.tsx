"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  ChevronDown,
  Sparkles,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getScoreBadgeClasses } from "@/lib/scoring";

interface NicheData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  averageNicheScore: number;
  channelCount: number;
  competitionLevel: string;
  trendDirection: string;
  estimatedCPM: number;
  iconEmoji: string | null;
  _count: { channels: number };
  channels: Array<{
    id: string;
    title: string;
    subscriberCount: number;
    nicheScore: number;
    isOutlier: boolean;
  }>;
}

function getTrendBadge(direction: string) {
  if (direction === "UP")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#34D399]/10 text-[#34D399]">
        <ArrowUpRight className="w-3 h-3" /> Rising
      </span>
    );
  if (direction === "DOWN")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#EF4444]/10 text-[#EF4444]">
        <ArrowDownRight className="w-3 h-3" /> Declining
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#94A3B8]/10 text-[#94A3B8]">
      Stable
    </span>
  );
}

function getCompBadge(level: string) {
  const colors: Record<string, string> = {
    LOW: "bg-[#34D399]/10 text-[#34D399]",
    MEDIUM: "bg-[#FCD34D]/10 text-[#FCD34D]",
    HIGH: "bg-[#EF4444]/10 text-[#EF4444]",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
        colors[level] || colors.MEDIUM
      }`}
    >
      {level}
    </span>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export default function NicheFinderPage() {
  const [niches, setNiches] = useState<NicheData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [competitionFilter, setCompetitionFilter] = useState("");
  const [trendFilter, setTrendFilter] = useState("");
  const [sortBy, setSortBy] = useState("averageNicheScore");
  const [expandedNiche, setExpandedNiche] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("sort", sortBy);
    params.set("order", "desc");
    if (competitionFilter) params.set("competition", competitionFilter);
    if (trendFilter) params.set("trend", trendFilter);

    setLoading(true);
    fetch(`/api/niches?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setNiches(data.niches))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [sortBy, competitionFilter, trendFilter]);

  const filtered = niches.filter((n) =>
    n.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Search className="w-6 h-6 text-[#64FFDA]" />
            Niche Finder
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Discover and score profitable YouTube niches with AI-powered analysis
          </p>
        </div>
        <Button className="bg-[#64FFDA] text-[#080B10] hover:bg-[#64FFDA]/90 font-semibold gap-2 cursor-pointer">
          <Sparkles className="w-4 h-4" />
          AI Recommend
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search niches..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#64FFDA]/50 focus:ring-1 focus:ring-[#64FFDA]/20 transition-all duration-200"
          />
        </div>

        {/* Competition filter */}
        <div className="relative">
          <select
            value={competitionFilter}
            onChange={(e) => setCompetitionFilter(e.target.value)}
            className="h-10 px-3 pr-8 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#64FFDA]/50"
          >
            <option value="">All Competition</option>
            <option value="LOW">Low Competition</option>
            <option value="MEDIUM">Medium Competition</option>
            <option value="HIGH">High Competition</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
        </div>

        {/* Trend filter */}
        <div className="relative">
          <select
            value={trendFilter}
            onChange={(e) => setTrendFilter(e.target.value)}
            className="h-10 px-3 pr-8 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#64FFDA]/50"
          >
            <option value="">All Trends</option>
            <option value="UP">Rising</option>
            <option value="STABLE">Stable</option>
            <option value="DOWN">Declining</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 pr-8 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#64FFDA]/50"
          >
            <option value="averageNicheScore">Score (High → Low)</option>
            <option value="estimatedCPM">CPM (High → Low)</option>
            <option value="channelCount">Channels</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-[#94A3B8]">
        Showing <span className="text-white font-medium">{filtered.length}</span> niches
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-5 animate-pulse"
            >
              <div className="w-32 h-5 rounded bg-[#1E293B] mb-3" />
              <div className="w-full h-4 rounded bg-[#1E293B] mb-4" />
              <div className="flex gap-2 mb-4">
                <div className="w-16 h-5 rounded bg-[#1E293B]" />
                <div className="w-16 h-5 rounded bg-[#1E293B]" />
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="h-14 rounded bg-[#1E293B]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Niche Cards Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((niche) => (
            <div
              key={niche.id}
              className="group rounded-xl border border-[#1E293B] bg-[#0D1117]/60 hover:border-[#64FFDA]/20 transition-all duration-200 cursor-pointer overflow-hidden"
              onClick={() =>
                setExpandedNiche(expandedNiche === niche.id ? null : niche.id)
              }
            >
              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-white">{niche.name}</h3>
                  <div
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border shrink-0 ${getScoreBadgeClasses(
                      niche.averageNicheScore
                    )}`}
                  >
                    {niche.averageNicheScore.toFixed(1)}
                  </div>
                </div>

                {/* Description */}
                {niche.description && (
                  <p className="text-xs text-[#94A3B8] leading-relaxed mb-3 line-clamp-2">
                    {niche.description}
                  </p>
                )}

                {/* Tags */}
                <div className="flex items-center gap-2 mb-4">
                  {getTrendBadge(niche.trendDirection)}
                  {getCompBadge(niche.competitionLevel)}
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-2.5 rounded-lg bg-[#1E293B]/30">
                    <div className="flex items-center justify-center gap-1 text-[#94A3B8] mb-1">
                      <Users className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-mono font-bold text-white">
                      {niche._count.channels}
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">Channels</div>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-[#1E293B]/30">
                    <div className="flex items-center justify-center gap-1 text-[#94A3B8] mb-1">
                      <DollarSign className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-mono font-bold text-[#34D399]">
                      ${niche.estimatedCPM.toFixed(0)}
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">Avg CPM</div>
                  </div>
                  <div className="text-center p-2.5 rounded-lg bg-[#1E293B]/30">
                    <div className="flex items-center justify-center gap-1 text-[#94A3B8] mb-1">
                      <BarChart3 className="w-3 h-3" />
                    </div>
                    <div className="text-sm font-mono font-bold text-[#FCD34D]">
                      {niche.averageNicheScore.toFixed(0)}
                    </div>
                    <div className="text-[10px] text-[#94A3B8]">Score</div>
                  </div>
                </div>
              </div>

              {/* Expanded: Top channels */}
              {expandedNiche === niche.id && niche.channels.length > 0 && (
                <div className="border-t border-[#1E293B] px-5 py-3 bg-[#0A0E14]/50 animate-slide-down">
                  <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider mb-2">
                    Top Channels
                  </div>
                  {niche.channels.map((ch) => (
                    <div
                      key={ch.id}
                      className="flex items-center justify-between py-1.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-[#1E293B] flex items-center justify-center text-[9px] font-bold text-[#94A3B8] shrink-0">
                          {ch.title.charAt(0)}
                        </div>
                        <span className="text-xs text-white truncate">{ch.title}</span>
                        {ch.isOutlier && (
                          <span className="px-1 py-0.5 rounded text-[8px] bg-[#F472B6]/10 text-[#F472B6] shrink-0">
                            OUTLIER
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-[#94A3B8] font-mono">
                          {formatNumber(ch.subscriberCount)}
                        </span>
                        <span
                          className={`text-xs font-mono font-bold ${
                            ch.nicheScore >= 80
                              ? "text-[#34D399]"
                              : ch.nicheScore >= 60
                              ? "text-[#FCD34D]"
                              : "text-[#94A3B8]"
                          }`}
                        >
                          {ch.nicheScore.toFixed(0)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
