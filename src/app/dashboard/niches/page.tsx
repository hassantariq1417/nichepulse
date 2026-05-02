"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  DollarSign,
  Sparkles,
  BarChart3,
  Flame,
  TrendingUp,
  TrendingDown,
  Shield,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getScoreBadgeClasses } from "@/lib/scoring";

interface VideoData {
  id: string;
  title: string;
  thumbnail: string | null;
  viewCount: number;
  publishedAt: string;
}

interface ChannelInNiche {
  id: string;
  title: string;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  nicheScore: number;
  isOutlier: boolean;
  thumbnailUrl: string | null;
  estimatedMonthlyRevenue: number;
  videos: VideoData[];
}

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
  channels: ChannelInNiche[];
}

// Smart filter tabs — inspired by NexLev's best UX pattern
const FILTER_TABS = [
  { key: "all", label: "All Niches", icon: BarChart3 },
  { key: "outliers", label: "🔥 Outliers", icon: Flame },
  { key: "highGrowth", label: "📈 High Growth", icon: TrendingUp },
  { key: "highCPM", label: "💰 High CPM", icon: DollarSign },
  { key: "lowCompetition", label: "🏆 Low Competition", icon: Shield },
  { key: "declining", label: "📉 Declining", icon: TrendingDown },
];

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 365) return `${Math.floor(days / 365)}y ago`;
  if (days > 30) return `${Math.floor(days / 30)}mo ago`;
  if (days > 0) return `${days}d ago`;
  return "Today";
}

export default function NicheFinderPage() {
  const [niches, setNiches] = useState<NicheData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [expandedNiche, setExpandedNiche] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("tab", activeTab);
    if (searchQuery) params.set("search", searchQuery);

    setLoading(true);
    fetch(`/api/niches?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => setNiches(data.niches || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeTab, searchQuery]);

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

      {/* Smart Filter Tabs — NexLev-style horizontal scrollable */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 cursor-pointer border ${
              activeTab === tab.key
                ? "bg-[#64FFDA]/10 border-[#64FFDA]/30 text-[#64FFDA] shadow-[0_0_12px_rgba(100,255,218,0.08)]"
                : "bg-[#1E293B]/30 border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#334155]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search niches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#64FFDA]/50 focus:ring-1 focus:ring-[#64FFDA]/20 transition-all duration-200"
        />
      </div>

      {/* Results count */}
      <div className="text-xs text-[#94A3B8]">
        Showing <span className="text-white font-medium">{filtered.length}</span> niches
        {activeTab !== "all" && (
          <span className="ml-2 text-[#64FFDA]">
            • Filtered: {FILTER_TABS.find((t) => t.key === activeTab)?.label}
          </span>
        )}
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

              {/* Expanded: Top channels with video thumbnails */}
              {expandedNiche === niche.id && niche.channels.length > 0 && (
                <div className="border-t border-[#1E293B] px-5 py-4 bg-[#0A0E14]/50 space-y-4">
                  <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider">
                    Top Channels
                  </div>
                  {niche.channels.map((ch) => (
                    <div key={ch.id} className="space-y-2">
                      {/* Channel row */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {ch.thumbnailUrl ? (
                            <img
                              src={ch.thumbnailUrl}
                              alt={ch.title}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-[10px] font-bold text-[#94A3B8] shrink-0">
                              {ch.title.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs text-white truncate block">{ch.title}</span>
                            <span className="text-[10px] text-[#94A3B8]">
                              {formatNumber(ch.subscriberCount)} subs • {formatNumber(ch.viewCount)} views
                            </span>
                          </div>
                          {ch.isOutlier && (
                            <span className="px-1 py-0.5 rounded text-[8px] bg-[#F472B6]/10 text-[#F472B6] shrink-0">
                              OUTLIER
                            </span>
                          )}
                        </div>
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
                      
                      {/* Video thumbnails — NexLev-style "Most Popular Videos" */}
                      {ch.videos && ch.videos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-1 pl-10">
                          {ch.videos.map((video) => (
                            <div
                              key={video.id}
                              className="flex-shrink-0 w-[140px] group/vid"
                            >
                              <div className="relative rounded-lg overflow-hidden bg-[#1E293B] aspect-video mb-1">
                                {video.thumbnail ? (
                                  <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <Play className="w-5 h-5 text-[#94A3B8]" />
                                  </div>
                                )}
                                <div className="absolute bottom-1 right-1 bg-black/70 px-1 py-0.5 rounded text-[8px] text-white font-mono">
                                  {formatNumber(video.viewCount)}
                                </div>
                              </div>
                              <p className="text-[9px] text-[#94A3B8] line-clamp-2 leading-tight">
                                {video.title}
                              </p>
                              <p className="text-[8px] text-[#64748B]">{timeAgo(video.publishedAt)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  <Link
                    href={`/dashboard/niches/${niche.id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-2 rounded-lg bg-[#818CF8]/10 border border-[#818CF8]/20 text-xs font-medium text-[#818CF8] hover:bg-[#818CF8]/20 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    Deep AI Analysis →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <Search className="w-12 h-12 text-[#1E293B] mx-auto mb-4" />
          <p className="text-[#94A3B8] text-sm">No niches found for this filter.</p>
          <button
            onClick={() => { setActiveTab("all"); setSearchQuery(""); }}
            className="mt-3 text-[#64FFDA] text-sm hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
