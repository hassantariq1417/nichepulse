"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  TrendingUp,
  BarChart3,
  Search,
  Zap,
  Flame,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Eye,
  Video,
  ChevronRight,
} from "lucide-react";
import { getScoreBadgeClasses } from "@/lib/scoring";

interface DashboardStats {
  stats: {
    totalChannels: number;
    totalNiches: number;
    totalVideos: number;
    outlierCount: number;
    trendingCount: number;
    avgNicheScore: number;
    avgRevenue: number;
  };
  topNiches: Array<{
    id: string;
    name: string;
    slug: string;
    averageNicheScore: number;
    channelCount: number;
    competitionLevel: string;
    trendDirection: string;
    estimatedCPM: number;
  }>;
  recentChannels: Array<{
    id: string;
    title: string;
    subscriberCount: number;
    viewCount: number;
    videoCount: number;
    nicheScore: number;
    growthRate30d: number;
    isOutlier: boolean;
    isTrending: boolean;
    estimatedMonthlyRevenue: number;
    category: string | null;
    nicheCategory: { name: string } | null;
    lastScrapedAt: string | null;
  }>;
}

function formatNumber(n: number): string {
  if (n >= 1000000000) return (n / 1000000000).toFixed(2) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

function getCompetitionColor(level: string) {
  if (level === "LOW") return "text-[#34D399] bg-[#34D399]/10";
  if (level === "HIGH") return "text-[#EF4444] bg-[#EF4444]/10";
  return "text-[#FCD34D] bg-[#FCD34D]/10";
}

function DashboardContent() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboarded = localStorage.getItem("nichepulse_onboarded");
      if (onboarded !== "true") {
        router.replace("/welcome");
        return;
      }
    }
  }, [router]);

  useEffect(() => {
    if (searchParams.get("onboarded") === "true") {
      setShowToast(true);
      window.history.replaceState({}, "", "/dashboard");
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => {
        if (!r.ok) throw new Error(`Stats API ${r.status}`);
        return r.json();
      })
      .then((d) => {
        if (d?.stats?.totalChannels !== undefined) {
          setData(d);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1200px]">
        <div className="animate-pulse space-y-6">
          <div className="w-64 h-8 bg-[#1E293B] rounded" />
          <div className="w-48 h-5 bg-[#1E293B] rounded" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="h-64 bg-[#1E293B]/50 rounded-xl border border-[#1E293B]" />
            <div className="h-64 bg-[#1E293B]/50 rounded-xl border border-[#1E293B]" />
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#64FFDA]/10 flex items-center justify-center mb-4">
          <BarChart3 className="w-8 h-8 text-[#64FFDA]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Data Yet</h2>
        <p className="text-sm text-[#94A3B8] max-w-md mb-6">
          Your database is empty. Run the data ingest to start scraping real YouTube channels.
        </p>
        <a
          href="/dashboard/ingest"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold"
          style={{ background: "linear-gradient(135deg, #64FFDA, #00B4D8)", color: "#080B10" }}
        >
          <Zap className="w-4 h-4" />
          Go to Data Ingest
        </a>
      </div>
    );
  }

  const { stats, topNiches, recentChannels } = data;

  // Get outlier channels sorted by score
  const outlierChannels = [...recentChannels]
    .filter((c) => c.isOutlier)
    .sort((a, b) => b.nicheScore - a.nicheScore)
    .slice(0, 5);

  // Get channels sorted for competition view
  const competitionChannels = [...recentChannels]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  return (
    <>
      <div className="space-y-6 max-w-[1200px]">
        {/* NexLev-style breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
          <Zap className="w-4 h-4 text-[#64FFDA]" />
          <span className="text-white font-medium">Niche Finder</span>
          <span>›</span>
          <span className="text-white">Overview</span>
        </div>

        {/* Upgrade Banner — similar to NexLev */}
        <div className="rounded-xl bg-gradient-to-r from-[#818CF8]/10 to-[#64FFDA]/10 border border-[#818CF8]/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-[#818CF8]" />
            <span className="text-sm font-medium text-white">
              Unlock AI Content Studio & Deep Analysis
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/content"
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#64FFDA] text-[#080B10] hover:bg-[#64FFDA]/90 transition-colors"
            >
              Try Content Studio
            </Link>
            <Link
              href="/dashboard/niches"
              className="px-4 py-2 rounded-lg text-xs font-medium text-[#94A3B8] border border-[#1E293B] hover:text-white hover:border-[#334155] transition-colors"
            >
              Browse Niches
            </Link>
          </div>
        </div>

        {/* Search bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-lg">
            <div className="flex items-center gap-2 h-10 px-3 rounded-xl bg-[#1E293B]/40 border border-[#1E293B]">
              <span className="text-xs text-[#94A3B8] bg-[#0D1117] px-2 py-0.5 rounded border border-[#1E293B]">
                Keyword ▾
              </span>
              <Search className="w-4 h-4 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Search by keyword"
                className="flex-1 bg-transparent text-sm text-white placeholder-[#64748B] focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Welcome Section */}
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome!</h1>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-sm text-[#94A3B8]">Total Channels Analyzed:</span>
            <span className="text-sm font-bold font-mono text-white">
              {stats.totalChannels.toLocaleString()}
            </span>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold font-mono bg-[#34D399]/10 text-[#34D399]">
              +{stats.trendingCount > 0 ? formatNumber(stats.trendingCount * 100) : "0"} 
            </span>
          </div>
        </div>

        {/* Two-panel layout — NexLev-style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Panel 1: Recently Added Outlier Channels */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Recently Added Outlier Channels
                </h2>
                <p className="text-[11px] text-[#64748B] mt-0.5">Last 24 Hours</p>
              </div>
              <Link
                href="/dashboard/channels?tab=outliers"
                className="text-[11px] text-[#64FFDA] hover:text-[#64FFDA]/80 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-[#1E293B]/50">
              {outlierChannels.length > 0 ? (
                outlierChannels.map((channel) => {
                  const avgViews = channel.videoCount > 0 ? channel.viewCount / channel.videoCount : 0;
                  const outlierMultiplier = avgViews > 0 ? (avgViews / 10000).toFixed(1) : "0.0";
                  return (
                    <Link
                      key={channel.id}
                      href={`/dashboard/channels?search=${encodeURIComponent(channel.title)}`}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-[#1E293B]/20 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F472B6]/20 to-[#818CF8]/20 flex items-center justify-center text-xs font-bold text-[#F472B6] border border-[#1E293B]">
                          {channel.title.charAt(0)}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white truncate max-w-[180px]">
                            {channel.title}
                          </div>
                          <div className="text-[11px] text-[#64748B]">
                            {formatNumber(channel.subscriberCount)} subscribers
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold font-mono text-[#F472B6]">
                          {outlierMultiplier}x
                        </span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="px-5 py-8 text-center text-sm text-[#64748B]">
                  No outlier channels found yet
                </div>
              )}
            </div>
          </div>

          {/* Panel 2: Niches with High Future Competition */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Niches with High Future Competition
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-[#64748B]">Last 24 hours</span>
                  <ChevronRight className="w-3 h-3 text-[#64748B]" />
                </div>
              </div>
              <Link
                href="/dashboard/niches"
                className="text-[11px] text-[#64FFDA] hover:text-[#64FFDA]/80 font-medium"
              >
                View All
              </Link>
            </div>
            <div className="divide-y divide-[#1E293B]/50">
              {competitionChannels.map((channel) => {
                const avgViews = channel.videoCount > 0 ? channel.viewCount / channel.videoCount : 0;
                return (
                  <div
                    key={channel.id}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-[#1E293B]/20 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#64FFDA]/20 to-[#34D399]/20 flex items-center justify-center text-xs font-bold text-[#64FFDA] border border-[#1E293B]">
                        {channel.title.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white truncate max-w-[140px]">
                          {channel.title}
                        </div>
                        <div className="text-[11px] text-[#64748B]">
                          {formatNumber(channel.subscriberCount)} subscribers
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] font-mono">
                      <div className="flex items-center gap-1 text-[#94A3B8]">
                        <Eye className="w-3 h-3" />
                        {formatNumber(Math.round(avgViews))}
                      </div>
                      <div className="flex items-center gap-1 text-[#94A3B8]">
                        <ArrowUpRight className="w-3 h-3" />
                        {channel.growthRate30d > 0 ? channel.growthRate30d.toFixed(0) : "0"}
                      </div>
                      <div className="flex items-center gap-1 text-[#94A3B8]">
                        <Video className="w-3 h-3" />
                        {channel.videoCount}
                      </div>
                      <div className="flex items-center gap-1 text-[#34D399]">
                        <TrendingUp className="w-3 h-3" />
                        {(channel.nicheScore / 10).toFixed(1)}x
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top Performing Niches — Full width */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1E293B]">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#FCD34D]" />
              Top Performing Niches
            </h2>
            <Link
              href="/dashboard/niches"
              className="text-[11px] text-[#64FFDA] hover:text-[#64FFDA]/80 font-medium"
            >
              View all →
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[11px] text-[#64748B] border-b border-[#1E293B]">
                  <th className="text-left px-5 py-2.5 font-medium">#</th>
                  <th className="text-left px-4 py-2.5 font-medium">Niche</th>
                  <th className="text-right px-4 py-2.5 font-medium">Channels</th>
                  <th className="text-right px-4 py-2.5 font-medium">CPM</th>
                  <th className="text-center px-4 py-2.5 font-medium">Competition</th>
                  <th className="text-center px-4 py-2.5 font-medium">Trend</th>
                  <th className="text-right px-5 py-2.5 font-medium">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E293B]/50">
                {topNiches.map((niche, i) => (
                  <tr
                    key={niche.id}
                    className="hover:bg-[#1E293B]/20 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3 text-xs font-mono text-[#64748B]">{i + 1}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/niches/${niche.id}`}
                        className="text-sm font-medium text-white hover:text-[#64FFDA] transition-colors"
                      >
                        {niche.name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#94A3B8] text-right font-mono">
                      {niche.channelCount}
                    </td>
                    <td className="px-4 py-3 text-sm text-[#34D399] text-right font-mono">
                      ${niche.estimatedCPM.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-medium uppercase ${getCompetitionColor(
                          niche.competitionLevel
                        )}`}
                      >
                        {niche.competitionLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {niche.trendDirection === "UP" ? (
                        <ArrowUpRight className="w-4 h-4 text-[#34D399] mx-auto" />
                      ) : niche.trendDirection === "DOWN" ? (
                        <ArrowDownRight className="w-4 h-4 text-[#EF4444] mx-auto" />
                      ) : (
                        <span className="text-[#64748B] text-xs">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getScoreBadgeClasses(
                          niche.averageNicheScore
                        )}`}
                      >
                        {niche.averageNicheScore.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Stats Footer */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-[#64FFDA]" />
              <span className="text-[11px] text-[#64748B]">Tracked Channels</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {formatNumber(stats.totalChannels)}
            </div>
          </div>
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-[#F472B6]" />
              <span className="text-[11px] text-[#64748B]">Outlier Channels</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {stats.outlierCount}
            </div>
          </div>
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="w-4 h-4 text-[#FCD34D]" />
              <span className="text-[11px] text-[#64748B]">Avg. Score</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {stats.avgNicheScore}
            </div>
          </div>
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-[#34D399]" />
              <span className="text-[11px] text-[#64748B]">Avg. Revenue</span>
            </div>
            <div className="text-xl font-bold font-mono text-white">
              ${formatNumber(stats.avgRevenue)}
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Toast */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl border border-[#64FFDA]/20 bg-[#0D1117] shadow-lg shadow-[#64FFDA]/5">
            <span className="text-lg">🎉</span>
            <div>
              <div className="text-sm font-semibold text-white">Welcome!</div>
              <div className="text-xs text-[#94A3B8]">Your personalized niches are ready.</div>
            </div>
            <button
              onClick={() => setShowToast(false)}
              className="ml-2 text-[#94A3B8] hover:text-white text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080B10]" />}>
      <DashboardContent />
    </Suspense>
  );
}
