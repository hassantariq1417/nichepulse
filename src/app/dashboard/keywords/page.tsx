"use client";

import { useEffect, useState } from "react";
import {
  Search,
  Hash,
  Users,
  Eye,
  DollarSign,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Clock,
} from "lucide-react";
import { getScoreBadgeClasses } from "@/lib/scoring";

interface KeywordData {
  id: string;
  keyword: string;
  slug: string;
  description: string | null;
  totalChannels: number;
  avgSubscribers: number;
  avgViewsPerVideo: number;
  avgUploads: number;
  avgChannelAge: number;
  avgScore: number;
  avgRevenue: number;
  estimatedCPM: number;
  competitionLevel: string;
  trendDirection: string;
  outlierCount: number;
  trendingCount: number;
}

const FILTER_TABS = [
  { key: "all", label: "All Keywords" },
  { key: "outliers", label: "🔥 Has Outliers" },
  { key: "highViews", label: "📈 High Avg Views" },
  { key: "lowCompetition", label: "🏆 Low Competition" },
  { key: "highRevenue", label: "💰 High Revenue" },
  { key: "rising", label: "📊 Rising Trends" },
];

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function getCompColor(level: string) {
  switch (level) {
    case "LOW": return "text-[#34D399] bg-[#34D399]/10";
    case "MEDIUM": return "text-[#FCD34D] bg-[#FCD34D]/10";
    case "HIGH": return "text-[#EF4444] bg-[#EF4444]/10";
    default: return "text-[#94A3B8] bg-[#94A3B8]/10";
  }
}

function getTrendIcon(direction: string) {
  if (direction === "UP") return <ArrowUpRight className="w-3.5 h-3.5 text-[#34D399]" />;
  if (direction === "DOWN") return <ArrowDownRight className="w-3.5 h-3.5 text-[#EF4444]" />;
  return <span className="w-3.5 h-3.5 text-[#94A3B8]">—</span>;
}

export default function KeywordsPage() {
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("avgScore");

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    params.set("sort", sortBy);
    if (searchQuery) params.set("search", searchQuery);

    setLoading(true);
    fetch(`/api/keywords?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setKeywords(data.keywords || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab, sortBy, searchQuery]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Hash className="w-6 h-6 text-[#A78BFA]" />
          Keyword Discovery
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Explore keywords and niches with aggregated channel performance data
        </p>
      </div>

      {/* Smart Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer border ${
              activeTab === tab.key
                ? "bg-[#A78BFA]/10 border-[#A78BFA]/30 text-[#A78BFA] shadow-[0_0_12px_rgba(167,139,250,0.08)]"
                : "bg-[#1E293B]/30 border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#334155]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search + Sort */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#A78BFA]/50 focus:ring-1 focus:ring-[#A78BFA]/20 transition-all duration-200"
          />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 pr-8 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#A78BFA]/50"
          >
            <option value="avgScore">Avg. NicheScore</option>
            <option value="avgSubscribers">Avg. Subscribers</option>
            <option value="avgViewsPerVideo">Avg. Views/Video</option>
            <option value="totalChannels">Total Channels</option>
            <option value="avgRevenue">Avg. Revenue</option>
            <option value="estimatedCPM">Est. CPM</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
        </div>
      </div>

      {/* Results count */}
      <div className="text-xs text-[#94A3B8]">
        Showing <span className="text-white font-medium">{keywords.length}</span> keywords
        {activeTab !== "all" && (
          <span className="ml-2 text-[#A78BFA]">
            • {FILTER_TABS.find((t) => t.key === activeTab)?.label}
          </span>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-5 animate-pulse">
              <div className="w-40 h-5 rounded bg-[#1E293B] mb-3" />
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="h-16 rounded-lg bg-[#1E293B]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Keywords Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {keywords.map((kw) => (
            <div
              key={kw.id}
              className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 hover:border-[#A78BFA]/20 transition-all duration-200 p-5 group"
            >
              {/* Keyword Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-[#A78BFA]/10 flex items-center justify-center shrink-0">
                    <Hash className="w-4 h-4 text-[#A78BFA]" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{kw.keyword}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${getCompColor(kw.competitionLevel)}`}>
                        {kw.competitionLevel}
                      </span>
                      {getTrendIcon(kw.trendDirection)}
                      {kw.outlierCount > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#F472B6]/10 text-[#F472B6]">
                          {kw.outlierCount} outlier{kw.outlierCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div
                  className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border shrink-0 ${getScoreBadgeClasses(
                    kw.avgScore
                  )}`}
                >
                  {kw.avgScore.toFixed(1)}
                </div>
              </div>

              {/* Description */}
              {kw.description && (
                <p className="text-[11px] text-[#94A3B8] leading-relaxed mb-3 line-clamp-2">
                  {kw.description}
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-lg bg-[#1E293B]/30">
                  <div className="flex items-center gap-1.5 text-[#94A3B8] mb-1">
                    <Eye className="w-3 h-3" />
                    <span className="text-[10px]">Avg. Views/Video</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-white">
                    {formatNumber(kw.avgViewsPerVideo)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#1E293B]/30">
                  <div className="flex items-center gap-1.5 text-[#94A3B8] mb-1">
                    <Users className="w-3 h-3" />
                    <span className="text-[10px]">Avg. Subscribers</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-white">
                    {formatNumber(kw.avgSubscribers)}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#1E293B]/30">
                  <div className="flex items-center gap-1.5 text-[#94A3B8] mb-1">
                    <DollarSign className="w-3 h-3" />
                    <span className="text-[10px]">Avg. Revenue</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-[#34D399]">
                    ${formatNumber(kw.avgRevenue)}/mo
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#1E293B]/30">
                  <div className="flex items-center gap-1.5 text-[#94A3B8] mb-1">
                    <BarChart3 className="w-3 h-3" />
                    <span className="text-[10px]">Total Channels</span>
                  </div>
                  <div className="text-sm font-mono font-bold text-white">
                    {kw.totalChannels}
                  </div>
                </div>
              </div>

              {/* Bottom bar — CPM + Age */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#1E293B]/50">
                <div className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
                  <DollarSign className="w-3 h-3" />
                  CPM: <span className="text-[#34D399] font-mono font-bold">${kw.estimatedCPM.toFixed(0)}</span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-[#94A3B8]">
                  <Clock className="w-3 h-3" />
                  Avg. Age: <span className="text-white font-mono">{kw.avgChannelAge}mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && keywords.length === 0 && (
        <div className="text-center py-16">
          <Hash className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
          <p className="text-[#94A3B8] text-sm">No keywords found for this filter.</p>
          <button
            onClick={() => { setActiveTab("all"); setSearchQuery(""); }}
            className="mt-3 text-[#A78BFA] text-sm hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
