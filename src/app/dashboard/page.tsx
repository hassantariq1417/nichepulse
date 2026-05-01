"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
} from "lucide-react";
import { getScoreBadgeClasses } from "@/lib/scoring";
import { CachedBadge } from "@/components/dashboard/CachedBadge";

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

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change?: string;
  color: string;
}) {
  const isPositive = change && !change.startsWith("-");
  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-5 hover:border-[#1E293B]/80 transition-all duration-200 cursor-default">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        {change && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              isPositive ? "text-[#34D399]" : "text-[#EF4444]"
            }`}
          >
            {isPositive ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {change}
          </div>
        )}
      </div>
      <div className="text-2xl font-bold font-mono text-white">{value}</div>
      <div className="text-xs text-[#94A3B8] mt-1">{label}</div>
    </div>
  );
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function getTrendIcon(direction: string) {
  if (direction === "UP") return <ArrowUpRight className="w-3.5 h-3.5 text-[#34D399]" />;
  if (direction === "DOWN") return <ArrowDownRight className="w-3.5 h-3.5 text-[#EF4444]" />;
  return <span className="w-3.5 h-3.5 text-[#94A3B8]">—</span>;
}

function getCompetitionColor(level: string) {
  if (level === "LOW") return "text-[#34D399] bg-[#34D399]/10";
  if (level === "HIGH") return "text-[#EF4444] bg-[#EF4444]/10";
  return "text-[#FCD34D] bg-[#FCD34D]/10";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboarded = localStorage.getItem("nichepulse_onboarded");
      if (onboarded !== "true") {
        router.replace("/welcome");
        return;
      }
    }
  }, [router]);

  // Show welcome toast on first arrival from onboarding
  useEffect(() => {
    if (searchParams.get("onboarded") === "true") {
      setShowToast(true);
      // Clean URL
      window.history.replaceState({}, "", "/dashboard");
      const timer = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Skeleton stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-5 animate-pulse"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1E293B] mb-3" />
              <div className="w-20 h-7 rounded bg-[#1E293B] mb-2" />
              <div className="w-24 h-4 rounded bg-[#1E293B]" />
            </div>
          ))}
        </div>
        {/* Skeleton table */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6 animate-pulse">
          <div className="w-40 h-6 rounded bg-[#1E293B] mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 py-3">
              <div className="w-full h-5 rounded bg-[#1E293B]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { stats, topNiches, recentChannels } = data;

  return (
    <>
    <div className="space-y-6 max-w-[1400px]">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Your YouTube niche intelligence at a glance
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="Tracked Channels"
          value={formatNumber(stats.totalChannels)}
          change="+12%"
          color="#64FFDA"
        />
        <StatCard
          icon={Flame}
          label="Outlier Channels"
          value={stats.outlierCount.toString()}
          change="+3"
          color="#F472B6"
        />
        <StatCard
          icon={BarChart3}
          label="Avg. Niche Score"
          value={stats.avgNicheScore.toString()}
          color="#FCD34D"
        />
        <StatCard
          icon={DollarSign}
          label="Avg. Monthly Revenue"
          value={`$${formatNumber(stats.avgRevenue)}`}
          change="+8%"
          color="#34D399"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Niches — 2 columns */}
        <div className="lg:col-span-2 rounded-xl border border-[#1E293B] bg-[#0D1117]/60 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B]">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#64FFDA]" />
              Top Performing Niches
            </h2>
            <a
              href="/dashboard/niches"
              className="text-xs text-[#64FFDA] hover:text-[#64FFDA]/80 cursor-pointer transition-colors"
            >
              View all →
            </a>
          </div>
          <div className="divide-y divide-[#1E293B]">
            {topNiches.map((niche, i) => (
              <div
                key={niche.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#1E293B]/20 transition-colors duration-150 cursor-pointer"
              >
                <div className="text-sm font-mono text-[#94A3B8] w-6 text-center">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {niche.name}
                  </div>
                  <div className="text-xs text-[#94A3B8] mt-0.5">
                    {niche.channelCount} channels · ${niche.estimatedCPM.toFixed(2)} CPM
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getTrendIcon(niche.trendDirection)}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${getCompetitionColor(
                      niche.competitionLevel
                    )}`}
                  >
                    {niche.competitionLevel}
                  </span>
                  <div
                    className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getScoreBadgeClasses(
                      niche.averageNicheScore
                    )}`}
                  >
                    {niche.averageNicheScore.toFixed(1)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats Panel */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6 space-y-5">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Search className="w-4 h-4 text-[#F472B6]" />
            Quick Intel
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">Niches Tracked</span>
              <span className="text-sm font-mono font-bold text-white">{stats.totalNiches}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">Videos Analyzed</span>
              <span className="text-sm font-mono font-bold text-white">
                {formatNumber(stats.totalVideos)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">Trending Now</span>
              <span className="text-sm font-mono font-bold text-[#34D399]">
                {stats.trendingCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">Outliers Found</span>
              <span className="text-sm font-mono font-bold text-[#F472B6]">
                {stats.outlierCount}
              </span>
            </div>
          </div>

          {/* Mini chart placeholder */}
          <div className="pt-4 border-t border-[#1E293B]">
            <div className="text-xs text-[#94A3B8] mb-3">Score Distribution</div>
            <div className="flex items-end gap-1 h-16">
              {[20, 35, 55, 70, 85, 65, 75, 90, 60, 80, 45, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm bg-gradient-to-t from-[#64FFDA]/20 to-[#64FFDA]/50 transition-all duration-300 hover:to-[#64FFDA]/80"
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Channels Table */}
      <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B]">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#FCD34D]" />
            Highest Scoring Channels
          </h2>
          <a
            href="/dashboard/channels"
            className="text-xs text-[#64FFDA] hover:text-[#64FFDA]/80 cursor-pointer transition-colors"
          >
            View all →
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-[#94A3B8] border-b border-[#1E293B]">
                <th className="text-left px-6 py-3 font-medium">Channel</th>
                <th className="text-left px-4 py-3 font-medium">Niche</th>
                <th className="text-right px-4 py-3 font-medium">Subscribers</th>
                <th className="text-right px-4 py-3 font-medium">Views</th>
                <th className="text-right px-4 py-3 font-medium">Growth</th>
                <th className="text-right px-4 py-3 font-medium">Revenue</th>
                <th className="text-right px-6 py-3 font-medium">Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {recentChannels.map((channel) => (
                <tr
                  key={channel.id}
                  className="hover:bg-[#1E293B]/20 transition-colors duration-150 cursor-pointer"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1E293B] flex items-center justify-center text-xs font-bold text-[#94A3B8]">
                        {channel.title.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white truncate max-w-[200px]">
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
                          {channel.lastScrapedAt &&
                            Date.now() - new Date(channel.lastScrapedAt).getTime() > 6 * 60 * 60 * 1000 && (
                              <CachedBadge lastUpdated={channel.lastScrapedAt} />
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-[#94A3B8]">
                    {channel.nicheCategory?.name || channel.category || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-white text-right font-mono">
                    {formatNumber(channel.subscriberCount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-white text-right font-mono">
                    {formatNumber(channel.viewCount)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-sm font-mono ${
                        channel.growthRate30d > 0 ? "text-[#34D399]" : "text-[#EF4444]"
                      }`}
                    >
                      {channel.growthRate30d > 0 ? "+" : ""}
                      {channel.growthRate30d.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-white text-right font-mono">
                    ${formatNumber(Math.round(channel.estimatedMonthlyRevenue))}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${getScoreBadgeClasses(
                        channel.nicheScore
                      )}`}
                    >
                      {channel.nicheScore.toFixed(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
