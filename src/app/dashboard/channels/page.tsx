"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ArrowUpRight,
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
  Bookmark,
  ChevronUp,
  Calendar,
  BarChart3,
} from "lucide-react";

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
  lastScrapedAt: string | null;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Smart filter tabs
const FILTER_TABS = [
  { key: "all", label: "All Niches", icon: Users },
  { key: "outliers", label: "Outliers", icon: Flame },
  { key: "highScoreLowSubs", label: "Low Subscribers and High Views", icon: Gem },
  { key: "highRevenue", label: "High Revenue", icon: DollarSign },
  { key: "trending", label: "Trending", icon: TrendingUp },
  { key: "longForm", label: "Long Form", icon: Film },
  { key: "shortForm", label: "Short Form", icon: Zap },
];

// Sort options
const SORT_OPTIONS = [
  { key: "nicheScore", label: "Avg. Niche Score", icon: BarChart3 },
  { key: "subscriberCount", label: "Avg. Subscribers", icon: Users },
  { key: "viewCount", label: "Avg. Views Per Video", icon: Eye },
  { key: "estimatedMonthlyRevenue", label: "Avg. Revenue", icon: DollarSign },
  { key: "videoCount", label: "Avg. Uploads", icon: Video },
];

function formatNumber(n: number): string {
  if (n >= 1000000000) return (n / 1000000000).toFixed(2) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(2) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days > 365) return `${Math.floor(days / 365)} year${Math.floor(days / 365) > 1 ? "s" : ""} ago`;
  if (days > 30) return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  return "Today";
}

function daysSinceStart(dateStr: string | null): number {
  if (!dateStr) return 0;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

/* ── Outlier Score Bar — visual indicator like NexLev ── */
function OutlierScoreBar({ score, avgViews }: { score: number; avgViews: number }) {
  // Calculate outlier multiplier (how many times above average)
  const multiplier = avgViews > 0 ? score : 0;
  const barSegments = 5;
  const filledSegments = Math.min(Math.ceil((multiplier / 100) * barSegments), barSegments);

  const getSegmentColor = (index: number) => {
    if (index >= filledSegments) return "bg-[#1E293B]";
    if (multiplier >= 70) return "bg-[#34D399]";
    if (multiplier >= 40) return "bg-[#FCD34D]";
    return "bg-[#EF4444]";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: barSegments }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-1.5 rounded-full ${getSegmentColor(i)} transition-all duration-300`}
          />
        ))}
      </div>
      <span className="text-white font-mono text-lg font-bold">
        {(multiplier / 10).toFixed(2)}x
      </span>
    </div>
  );
}

/* ── Channel Card — NexLev-style rich card ── */
function ChannelCard({ channel, isExpanded, onToggle }: {
  channel: ChannelData;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const avgViews = channel.videoCount > 0 ? Math.round(channel.viewCount / channel.videoCount) : 0;
  const days = daysSinceStart(channel.createdAt);

  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 overflow-hidden transition-all duration-200 hover:border-[#1E293B]/80">
      {/* Channel Header */}
      <div
        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-[#1E293B]/10 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3.5">
          {/* Avatar */}
          {channel.thumbnailUrl ? (
            <Image
              src={channel.thumbnailUrl}
              alt={channel.title}
              width={44}
              height={44}
              className="rounded-full object-cover border-2 border-[#1E293B] shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#64FFDA]/20 to-[#818CF8]/20 flex items-center justify-center text-sm font-bold text-[#64FFDA] border-2 border-[#1E293B] shrink-0">
              {channel.title.charAt(0)}
            </div>
          )}

          {/* Channel name + metadata */}
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white">{channel.title}</h3>
              {/* Monetization badge */}
              {channel.estimatedMonthlyRevenue > 100 && (
                <span className="w-4 h-4 rounded-full bg-[#34D399]/20 flex items-center justify-center">
                  <DollarSign className="w-2.5 h-2.5 text-[#34D399]" />
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-[#94A3B8]">
                {formatNumber(channel.subscriberCount)} subscribers
              </span>
              {channel.isOutlier && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#F472B6]/10 text-[#F472B6]">
                  OUTLIER
                </span>
              )}
              {channel.isTrending && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-[#34D399]/10 text-[#34D399]">
                  TRENDING
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right side: Tags + actions */}
        <div className="flex items-center gap-3">
          {/* Category tag */}
          {channel.nicheCategory && (
            <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg text-[11px] font-medium bg-[#1E293B] text-[#94A3B8] border border-[#334155]">
              {channel.nicheCategory.name}
            </span>
          )}
          {/* Picked by AI badge if high score */}
          {channel.nicheScore >= 70 && (
            <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#818CF8]/10 text-[#818CF8] border border-[#818CF8]/20">
              <Zap className="w-3 h-3" />
              Picked by AI
            </span>
          )}
          {/* Bookmark */}
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors">
            <Bookmark className="w-4 h-4" />
          </button>
          {/* Expand */}
          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-[#1E293B] transition-colors">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-[#1E293B]">
          {/* 4 Stat Boxes — NexLev-style */}
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-[#1E293B]">
            <div className="px-5 py-4 border-r border-[#1E293B]">
              <div className="flex items-center gap-1.5 mb-1">
                <Eye className="w-3 h-3 text-[#94A3B8]" />
                <span className="text-[11px] text-[#94A3B8] font-medium">Avg. Views Per Video</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {formatNumber(avgViews)}
              </div>
            </div>
            <div className="px-5 py-4 border-r border-[#1E293B]">
              <div className="flex items-center gap-1.5 mb-1">
                <Calendar className="w-3 h-3 text-[#94A3B8]" />
                <span className="text-[11px] text-[#94A3B8] font-medium">Days Since Start</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {days}
              </div>
            </div>
            <div className="px-5 py-4 border-r border-[#1E293B]">
              <div className="flex items-center gap-1.5 mb-1">
                <Video className="w-3 h-3 text-[#94A3B8]" />
                <span className="text-[11px] text-[#94A3B8] font-medium">Uploads</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {channel.videoCount}
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="w-3 h-3 text-[#94A3B8]" />
                <span className="text-[11px] text-[#94A3B8] font-medium">Outlier Score</span>
              </div>
              <OutlierScoreBar score={channel.nicheScore} avgViews={avgViews} />
            </div>
          </div>

          {/* Most Popular Videos — Large thumbnails like NexLev */}
          {channel.videos && channel.videos.length > 0 && (
            <div className="px-5 py-5">
              <h4 className="text-sm font-semibold text-white mb-4">Most Popular Videos</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {channel.videos.slice(0, 5).map((video) => (
                  <a
                    key={video.id}
                    href={`https://www.youtube.com/watch?v=${video.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="relative rounded-lg overflow-hidden bg-[#1E293B] aspect-video mb-2">
                      {video.thumbnail ? (
                        <Image
                          src={video.thumbnail}
                          alt={video.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Play className="w-8 h-8 text-[#94A3B8]" />
                        </div>
                      )}
                      {/* Play overlay on hover */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-200 flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Play className="w-5 h-5 text-[#080B10] ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-white font-medium line-clamp-2 leading-snug group-hover:text-[#64FFDA] transition-colors">
                      {video.title}
                    </p>
                    <p className="text-[11px] text-[#94A3B8] mt-1">
                      {formatNumber(video.viewCount)} views • {timeAgo(video.publishedAt)}
                    </p>
                  </a>
                ))}
              </div>

              {/* View full analysis link */}
              <div className="mt-4 pt-4 border-t border-[#1E293B]/50">
                <Link
                  href={`/dashboard/channels/${channel.id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#64FFDA] hover:text-[#64FFDA]/80 transition-colors"
                >
                  View full channel analysis
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 15,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("nicheScore");
  const [expandedChannel, setExpandedChannel] = useState<string | null>(null);
  const [hideSeen, setHideSeen] = useState(false);

  const fetchChannels = useCallback(
    (page = 1) => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "15");
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
    <div className="space-y-5 max-w-[1200px]">
      {/* Header — NexLev-style breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
        <Link href="/dashboard" className="hover:text-white transition-colors">Niche Finder</Link>
        <span>›</span>
        <span className="text-white font-medium">Channels</span>
        <span>›</span>
        <span className="text-white font-medium">
          {FILTER_TABS.find((t) => t.key === activeTab)?.label || "All Channels"}
        </span>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          type="text"
          placeholder="Search AI Recommendations"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-11 pl-11 pr-12 rounded-xl bg-[#1E293B]/40 border border-[#1E293B] text-sm text-white placeholder-[#64748B] focus:outline-none focus:border-[#64FFDA]/50 focus:ring-1 focus:ring-[#64FFDA]/20 transition-all duration-200"
        />
        <button className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded flex items-center justify-center text-[#94A3B8] hover:text-white">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
        </button>
      </div>

      {/* Filter Tabs — NexLev-style horizontal scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer border ${
              activeTab === tab.key
                ? "bg-[#64FFDA]/10 border-[#64FFDA]/30 text-[#64FFDA]"
                : "bg-[#1E293B]/30 border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#334155]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sort Row — NexLev-style sort buttons */}
      <div className="flex items-center gap-4 overflow-x-auto pb-1">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setSortBy(opt.key)}
            className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              sortBy === opt.key ? "text-white" : "text-[#64748B] hover:text-[#94A3B8]"
            }`}
          >
            <opt.icon className="w-3 h-3" />
            {opt.label}
            {sortBy === opt.key && <ChevronDown className="w-3 h-3" />}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setHideSeen(!hideSeen)}
            className={`flex items-center gap-1.5 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
              hideSeen ? "text-[#64FFDA]" : "text-[#64748B] hover:text-[#94A3B8]"
            }`}
          >
            <Eye className="w-3 h-3" />
            Hide Seen Channels
          </button>
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-5 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-[#1E293B]" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-4 rounded bg-[#1E293B]" />
                  <div className="w-24 h-3 rounded bg-[#1E293B]" />
                </div>
                <div className="w-20 h-6 rounded bg-[#1E293B]" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Channel Cards */}
      {!loading && (
        <div className="space-y-3">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              isExpanded={expandedChannel === channel.id}
              onToggle={() =>
                setExpandedChannel(expandedChannel === channel.id ? null : channel.id)
              }
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
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
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => fetchChannels(pageNum)}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-colors ${
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
              className="w-9 h-9 rounded-lg flex items-center justify-center border border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
