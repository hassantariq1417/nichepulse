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
} from "lucide-react";
import { getScoreBadgeClasses } from "@/lib/scoring";

interface ChannelData {
  id: string;
  title: string;
  description: string | null;
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
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function formatNumber(n: number): string {
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
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
  const [sortBy, setSortBy] = useState("nicheScore");
  const [showOutliers, setShowOutliers] = useState(false);
  const [showTrending, setShowTrending] = useState(false);

  const fetchChannels = useCallback(
    (page = 1) => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "20");
      params.set("sort", sortBy);
      params.set("order", "desc");
      if (searchQuery) params.set("search", searchQuery);
      if (showOutliers) params.set("outlier", "true");
      if (showTrending) params.set("trending", "true");

      setLoading(true);
      fetch(`/api/channels?${params.toString()}`)
        .then((r) => r.json())
        .then((data) => {
          setChannels(data.channels);
          setPagination(data.pagination);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    },
    [sortBy, searchQuery, showOutliers, showTrending]
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
          Analyze {pagination.total} tracked channels across all niches
        </p>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
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

        {/* Sort */}
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
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8] pointer-events-none" />
        </div>

        {/* Toggle buttons */}
        <button
          onClick={() => setShowOutliers(!showOutliers)}
          className={`h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer border ${
            showOutliers
              ? "bg-[#F472B6]/10 border-[#F472B6]/30 text-[#F472B6]"
              : "bg-[#1E293B]/50 border-[#1E293B] text-[#94A3B8] hover:text-white"
          }`}
        >
          <Flame className="w-4 h-4" />
          Outliers
        </button>
        <button
          onClick={() => setShowTrending(!showTrending)}
          className={`h-10 px-4 rounded-lg text-sm font-medium flex items-center gap-2 transition-all duration-200 cursor-pointer border ${
            showTrending
              ? "bg-[#34D399]/10 border-[#34D399]/30 text-[#34D399]"
              : "bg-[#1E293B]/50 border-[#1E293B] text-[#94A3B8] hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Trending
        </button>
      </div>

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
                  <Link
                    key={channel.id}
                    href={`/dashboard/channels/${channel.id}`}
                    className="table-row hover:bg-[#1E293B]/20 transition-colors duration-150 cursor-pointer"
                  >
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1E293B] to-[#0D1117] flex items-center justify-center text-xs font-bold text-[#64FFDA] border border-[#1E293B] shrink-0">
                          {channel.title.charAt(0)}
                        </div>
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
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-[#94A3B8]">
                        {channel.nicheCategory?.name || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-white text-right font-mono">
                      {formatNumber(channel.subscriberCount)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-white text-right font-mono">
                      {formatNumber(channel.viewCount)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#94A3B8] text-right font-mono">
                      {channel._count.videos}
                    </td>
                    <td className="px-4 py-3.5 text-right">
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
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#34D399] text-right font-mono">
                      ${formatNumber(Math.round(channel.estimatedMonthlyRevenue))}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#1E293B]/50 text-[#94A3B8]">
                        {channel.format === "LONG_FORM"
                          ? "Long"
                          : channel.format === "SHORT_FORM"
                          ? "Short"
                          : "Both"}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getScoreBadgeClasses(
                          channel.nicheScore
                        )}`}
                      >
                        {channel.nicheScore.toFixed(1)}
                      </span>
                    </td>
                  </Link>
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
              of <span className="text-white font-medium">{pagination.total}</span>
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
