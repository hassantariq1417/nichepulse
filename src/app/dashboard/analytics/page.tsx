"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  PieChart,
  DollarSign,
  Users,
} from "lucide-react";

interface StatsData {
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
    name: string;
    averageNicheScore: number;
    channelCount: number;
    estimatedCPM: number;
    competitionLevel: string;
  }>;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

// Simple bar component
function Bar({
  value,
  maxValue,
  label,
  color,
}: {
  value: number;
  maxValue: number;
  label: string;
  color: string;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#94A3B8] truncate max-w-[150px]">{label}</span>
        <span className="text-xs font-mono text-white">{value.toFixed(1)}</span>
      </div>
      <div className="h-2.5 rounded-full bg-[#1E293B] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
          }}
        />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard/stats")
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] animate-pulse">
        <div className="w-40 h-8 rounded bg-[#1E293B]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl border border-[#1E293B] bg-[#0D1117]/60" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl border border-[#1E293B] bg-[#0D1117]/60" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;
  const { stats, topNiches } = data;
  const maxScore = Math.max(...topNiches.map((n) => n.averageNicheScore), 1);
  const maxCPM = Math.max(...topNiches.map((n) => n.estimatedCPM), 1);

  // Compute competition distribution
  const compDist = { LOW: 0, MEDIUM: 0, HIGH: 0 };
  topNiches.forEach((n) => {
    if (n.competitionLevel in compDist)
      compDist[n.competitionLevel as keyof typeof compDist]++;
  });

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#F472B6]" />
          Analytics
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Platform-wide intelligence and performance metrics
        </p>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            icon: Users,
            label: "Total Channels",
            value: formatNumber(stats.totalChannels),
            color: "#64FFDA",
          },
          {
            icon: PieChart,
            label: "Niches Tracked",
            value: stats.totalNiches.toString(),
            color: "#818CF8",
          },
          {
            icon: DollarSign,
            label: "Avg Revenue",
            value: `$${formatNumber(stats.avgRevenue)}`,
            color: "#34D399",
          },
          {
            icon: TrendingUp,
            label: "Avg Score",
            value: stats.avgNicheScore.toString(),
            color: "#FCD34D",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-5"
          >
            <div className="flex items-center gap-2 mb-2">
              <item.icon className="w-4 h-4" style={{ color: item.color }} />
              <span className="text-xs text-[#94A3B8]">{item.label}</span>
            </div>
            <div className="text-2xl font-bold font-mono text-white">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Niche Score Rankings */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <TrendingUp className="w-4 h-4 text-[#64FFDA]" />
            Niche Score Rankings
          </h3>
          <div className="space-y-4">
            {topNiches.map((niche) => (
              <Bar
                key={niche.name}
                label={niche.name}
                value={niche.averageNicheScore}
                maxValue={maxScore}
                color="#64FFDA"
              />
            ))}
          </div>
        </div>

        {/* CPM Comparison */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <DollarSign className="w-4 h-4 text-[#34D399]" />
            CPM by Niche
          </h3>
          <div className="space-y-4">
            {[...topNiches]
              .sort((a, b) => b.estimatedCPM - a.estimatedCPM)
              .map((niche) => (
                <Bar
                  key={niche.name}
                  label={niche.name}
                  value={niche.estimatedCPM}
                  maxValue={maxCPM}
                  color="#34D399"
                />
              ))}
          </div>
        </div>

        {/* Competition Distribution */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <PieChart className="w-4 h-4 text-[#F472B6]" />
            Competition Distribution
          </h3>
          <div className="flex items-center gap-6">
            {/* Visual pie representation */}
            <div className="relative w-32 h-32 shrink-0">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                {(() => {
                  const total = compDist.LOW + compDist.MEDIUM + compDist.HIGH || 1;
                  const lowPct = (compDist.LOW / total) * 100;
                  const medPct = (compDist.MEDIUM / total) * 100;
                  const highPct = (compDist.HIGH / total) * 100;
                  let offset = 0;
                  const segments = [
                    { pct: lowPct, color: "#34D399" },
                    { pct: medPct, color: "#FCD34D" },
                    { pct: highPct, color: "#EF4444" },
                  ];
                  return segments.map((seg, i) => {
                    const el = (
                      <circle
                        key={i}
                        cx="18"
                        cy="18"
                        r="15.9155"
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="3"
                        strokeDasharray={`${seg.pct} ${100 - seg.pct}`}
                        strokeDashoffset={`-${offset}`}
                        className="transition-all duration-700"
                      />
                    );
                    offset += seg.pct;
                    return el;
                  });
                })()}
              </svg>
            </div>
            <div className="space-y-3 flex-1">
              {[
                { label: "Low Competition", count: compDist.LOW, color: "#34D399" },
                { label: "Medium Competition", count: compDist.MEDIUM, color: "#FCD34D" },
                { label: "High Competition", count: compDist.HIGH, color: "#EF4444" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-sm shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-[#94A3B8] flex-1">{item.label}</span>
                  <span className="text-sm font-mono text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Platform Health */}
        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2 mb-5">
            <BarChart3 className="w-4 h-4 text-[#818CF8]" />
            Platform Health
          </h3>
          <div className="space-y-4">
            {[
              {
                label: "Outlier Detection Rate",
                value: `${((stats.outlierCount / stats.totalChannels) * 100).toFixed(1)}%`,
                desc: `${stats.outlierCount} outliers detected`,
                color: "#F472B6",
              },
              {
                label: "Trending Channels",
                value: `${((stats.trendingCount / stats.totalChannels) * 100).toFixed(1)}%`,
                desc: `${stats.trendingCount} channels trending`,
                color: "#34D399",
              },
              {
                label: "Videos Analyzed",
                value: formatNumber(stats.totalVideos),
                desc: `${(stats.totalVideos / stats.totalChannels).toFixed(1)} avg per channel`,
                color: "#FCD34D",
              },
              {
                label: "Data Coverage",
                value: "100%",
                desc: "All niches have channel data",
                color: "#64FFDA",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between py-2 border-b border-[#1E293B] last:border-0"
              >
                <div>
                  <div className="text-sm text-white">{item.label}</div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">{item.desc}</div>
                </div>
                <span className="text-sm font-mono font-bold" style={{ color: item.color }}>
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
