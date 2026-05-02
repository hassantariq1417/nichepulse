"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Flame,
  Users,
  Eye,
  DollarSign,
  Video,
  Play,
  Gem,
  Zap,
  Film,
} from "lucide-react";
import { getScoreBadgeClasses } from "@/lib/scoring";

interface VideoData {
  id: string;
  title: string;
  thumbnail: string | null;
  viewCount: number;
  publishedAt: string;
}

interface ChannelData {
  id: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  subscriberCount: number;
  viewCount: number;
  videoCount: number;
  category: string | null;
  format: string;
  estimatedMonthlyRevenue: number;
  nicheScore: number;
  growthRate7d: number;
  growthRate30d: number;
  viewsLast48h: number;
  uploadFrequency: number;
  isOutlier: boolean;
  isTrending: boolean;
  country: string | null;
  nicheCategory: { name: string; slug: string } | null;
  _count: { videos: number };
  videos: VideoData[];
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Smart filter tabs — NexLev-style
const FILTER_TABS = [
  { key: "all", label: "All Channels", icon: Users },
  { key: "outliers", label: "🔥 Outliers", icon: Flame },
  { key: "trending", label: "📈 Trending", icon: TrendingUp },
  { key: "highScoreLowSubs", label: "💎 Hidden Gems", icon: Gem },
  { key: "highRevenue", label: "💰 High Revenue", icon: DollarSign },
  { key: "longForm", label: "🎬 Long Form", icon: Film },
  { key: "shortForm", label: "⚡ Short Form", icon: Zap },
];

function formatNumber(n: number): string {
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
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

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("nicheScore");
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);

  const fetchChannels = useCallback(
    (page = 1) => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      params.set("tab", activeTab);
      params.set("sort", sortBy);
      params.set("order", "desc");
      if (searchQuery) params.set("search", searchQuery);

      setLoading(true);
      fetch(`/api/channels?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          setChannels(data.channels || []);
          setPagination(data.pagination);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [sortBy, searchQuery, activeTab]
  );

  useEffect(() => {
    fetchChannels(1);
  }, [fetchChannels]);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-[#FCD34D]" />
          Channel Explorer
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Analyze <span className="text-white font-medium">{pagination.total.toLocaleString()}</span> tracked channels across all niches
        </p>
      </div>

      {/* Smart Filter Tabs — NexLev-style */}
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

      {/* Search + Sort bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search channels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#64FFDA]/50 focus:ring-1 focus:ring-[#64FFDA]/20 transition-all duration-200"
          />
        </div>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-10 px-3 pr-8 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white appearance-none cursor-pointer focus:outline-none focus:border-[#64FFDA]/50"
          >
            <option value="nicheScore">Niche Score</option>
            <option value="subscriberCount">Subscribers</option>
            <option value="growthRate30d">Growth (30d)</option>
            <option value="estimatedMonthlyRevenue">Revenue</option>
            <option value="viewsLast48h">Views (48h)</option>
            <option value="viewCount">Total Views</option>
            <option value="videoCount">Total Videos</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
        </div>
      </div>

      {/* Active filter indicator */}
      {activeTab !== "all" && (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-[#94A3B8]">Active filter:</span>
          <span className="px-2 py-1 rounded-lg bg-[#64FFDA]/10 text-[#64FFDA] font-medium">
            {FILTER_TABS.find((t) => t.key === activeTab)?.label}
          </span>
          <button
            onClick={() => setActiveTab("all")}
            className="text-[#94A3B8] hover:text-white cursor-pointer"
          >
            ✕ Clear
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 overflow-hidden">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-[#1E293B] animate-pulse">
              <div className="w-10 h-10 rounded-full bg-[#1E293B]" />
              <div className="flex-1 space-y-2">
                <div className="w-48 h-4 rounded bg-[#1E293B]" />
                <div className="w-24 h-3 rounded bg-[#1E293B]" />
              </div>
              <div className="w-20 h-6 rounded bg-[#1E293B]" />
            </div>
          ))}
        </div>
      )}

      {/* Channels table */}
      {!loading && (
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-xs text-[#94A3B8] border-b border-[#1E293B] bg-[#0A0E14]/50">
                  <th className="text-left px-6 py-3 font-medium">Channel</th>
                  <th className="text-left px-4 py-3 font-medium">Niche</th>
                  <th className="text-right px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Users className="w-3 h-3" /> Subs
                    </span>
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Eye className="w-3 h-3" /> Views
                    </span>
                  </th>
                  <th className="text-right px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <Video className="w-3 h-3" /> Videos
                    </span>
                  </th>
                  <th className="text-right px-4 py-3 font-medium">Growth (30d)</th>
                  <th className="text-right px-4 py-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Revenue
                    </span>
                  </th>
                  <th className="text-center px-4 py-3 font-medium">Format</th>
                  <th className="text-right px-6 py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]">
                {channels.map((channel) => (
                  <tr key={channel.id} className="group">
                    <td colSpan={9} className="p-0">
                      {/* Main row */}
                      <div
                        className="flex items-center hover:bg-[#1E293B]/20 transition-colors duration-150 cursor-pointer"
                        onClick={() => setExpandedChannel(expandedChannel === channel.id ? null : channel.id)}
                      >
                        <div className="px-6 py-3.5 flex items-center gap-3 min-w-[240px]">
                          {channel.thumbnailUrl ? (
                            <img
                              src={channel.thumbnailUrl}
                              alt={channel.title}
                              className="w-9 h-9 rounded-full object-cover border border-[#1E293B] shrink-0"
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E293B] to-[#0D1117] flex items-center justify-center text-xs font-bold text-[#64FFDA] border border-[#1E293B] shrink-0">
                              {channel.title.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-white truncate max-w-[180px]">
                              {channel.title}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {channel.isOutlier && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#F472B6]/10 text-[#F472B6]">
                                  OUTLIER
                                </span>
                              )}
                              {channel.isTrending && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#34D399]/10 text-[#34D399]">
                                  TRENDING
                                </span>
                              )}
                              {channel.country && (
                                <span className="text-[10px] text-[#94A3B8]">
                                  {channel.country}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="px-4 py-3.5 text-sm text-[#94A3B8] min-w-[100px]">
                          {channel.nicheCategory?.name || "—"}
                        </div>
                        <div className="px-4 py-3.5 text-sm text-white text-right font-mono min-w-[80px]">
                          {formatNumber(channel.subscriberCount)}
                        </div>
                        <div className="px-4 py-3.5 text-sm text-white text-right font-mono min-w-[80px]">
                          {formatNumber(channel.viewCount)}
                        </div>
                        <div className="px-4 py-3.5 text-sm text-[#94A3B8] text-right font-mono min-w-[60px]">
                          {channel._count.videos}
                        </div>
                        <div className="px-4 py-3.5 text-right min-w-[80px]">
                          <span
                            className={`inline-flex items-center gap-1 text-sm font-mono ${
                              channel.growthRate30d > 0
                                ? "text-[#34D399]"
                                : channel.growthRate30d < 0
                                ? "text-[#EF4444]"
                                : "text-[#94A3B8]"
                            }`}
                          >
                            {channel.growthRate30d > 0 ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : channel.growthRate30d < 0 ? (
                              <ArrowDownRight className="w-3 h-3" />
                            ) : null}
                            {channel.growthRate30d > 0 ? "+" : ""}
                            {channel.growthRate30d.toFixed(1)}%
                          </span>
                        </div>
                        <div className="px-4 py-3.5 text-sm text-[#34D399] text-right font-mono min-w-[80px]">
                          ${formatNumber(Math.round(channel.estimatedMonthlyRevenue))}
                        </div>
                        <div className="px-4 py-3.5 text-center min-w-[60px]">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1E293B]/50 text-[#94A3B8]">
                            {channel.format === "LONG_FORM"
                              ? "Long"
                              : channel.format === "SHORT_FORM"
                              ? "Short"
                              : "Both"}
                          </span>
                        </div>
                        <div className="px-6 py-3.5 text-right min-w-[70px]">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getScoreBadgeClasses(
                              channel.nicheScore
                            )}`}
                          >
                            {channel.nicheScore.toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Expanded: Video thumbnails — NexLev-style */}
                      {expandedChannel === channel.id && channel.videos && channel.videos.length > 0 && (
                        <div className="px-6 py-4 bg-[#0A0E14]/60 border-t border-[#1E293B]/50">
                          <div className="text-[10px] text-[#94A3B8] uppercase tracking-wider mb-3">
                            Most Popular Videos
                          </div>
                          <div className="flex gap-3 overflow-x-auto pb-2">
                            {channel.videos.map((video) => (
                              <div key={video.id} className="flex-shrink-0 w-[180px]">
                                <div className="relative rounded-lg overflow-hidden bg-[#1E293B] aspect-video mb-1.5">
                                  {video.thumbnail ? (
                                    <img
                                      src={video.thumbnail}
                                      alt={video.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Play className="w-6 h-6 text-[#94A3B8]" />
                                    </div>
                                  )}
                                  <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-white font-mono">
                                    {formatNumber(video.viewCount)} views
                                  </div>
                                </div>
                                <p className="text-[10px] text-white line-clamp-2 leading-tight font-medium">
                                  {video.title}
                                </p>
                                <p className="text-[9px] text-[#64748B] mt-0.5">
                                  {timeAgo(video.publishedAt)}
                                </p>
                              </div>
                            ))}
                          </div>
                          <Link
                            href={`/dashboard/channels/${channel.id}`}
                            className="inline-flex items-center gap-1 mt-2 text-xs text-[#64FFDA] hover:underline"
                          >
                            View full channel analysis →
                          </Link>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-[#1E293B]">
            <div className="text-sm text-[#94A3B8]">
              Showing{" "}
              <span className="text-white font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>
              –
              <span className="text-white font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="text-white font-medium">{pagination.total.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => fetchChannels(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => fetchChannels(pageNum)}
                    className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-colors duration-200 cursor-pointer ${
                      pagination.page === pageNum
                        ? "bg-[#64FFDA]/10 text-[#64FFDA] border border-[#64FFDA]/30"
                        : "border border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => fetchChannels(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors duration-200"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
