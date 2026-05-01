"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Eye,
  Video,
  DollarSign,
  TrendingUp,
  Flame,
  Heart,
  BarChart3,
  ExternalLink,
  Zap,
} from "lucide-react";
import { getScoreBadgeClasses } from "@/lib/scoring";

interface ChannelDetail {
  id: string;
  title: string;
  description: string | null;
  youtubeId: string;
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
  channelAge: number | null;
  nicheCategory: {
    name: string;
    slug: string;
    estimatedCPM: number;
    competitionLevel: string;
  } | null;
  videos: Array<{
    id: string;
    title: string;
    youtubeVideoId: string;
    viewCount: number;
    likeCount: number;
    commentCount: number;
    publishedAt: string;
    isViral: boolean;
    viewsPerHour: number;
    thumbnail: string | null;
  }>;
}

interface Analytics {
  viralVideos: number;
  avgViews: number;
  avgLikes: number;
  engagementRate: string;
  totalVideosAnalyzed: number;
}

function formatNumber(n: number): string {
  if (n >= 1000000000) return (n / 1000000000).toFixed(1) + "B";
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color }} />
        <span className="text-xs text-[#94A3B8]">{label}</span>
      </div>
      <div className="text-xl font-bold font-mono text-white">{value}</div>
      {sub && <div className="text-[10px] text-[#94A3B8] mt-1">{sub}</div>}
    </div>
  );
}

export default function ChannelDetailPage() {
  const { id } = useParams();
  const [channel, setChannel] = useState<ChannelDetail | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/channels/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setChannel(data.channel);
        setAnalytics(data.analytics);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 max-w-[1400px] animate-pulse">
        <div className="w-40 h-6 rounded bg-[#1E293B]" />
        <div className="w-64 h-8 rounded bg-[#1E293B]" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl border border-[#1E293B] bg-[#0D1117]/60" />
          ))}
        </div>
      </div>
    );
  }

  if (!channel || !analytics) {
    return (
      <div className="text-center py-20">
        <h2 className="text-lg font-bold text-white">Channel not found</h2>
        <Link href="/dashboard/channels" className="text-sm text-[#64FFDA] hover:underline mt-2 inline-block cursor-pointer">
          ← Back to channels
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/channels"
        className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to channels
      </Link>

      {/* Channel header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#64FFDA]/20 to-[#F472B6]/20 flex items-center justify-center text-xl font-bold text-[#64FFDA] border border-[#1E293B] shrink-0">
            {channel.title.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{channel.title}</h1>
              <span
                className={`px-3 py-1 rounded-md text-sm font-mono font-bold border ${getScoreBadgeClasses(
                  channel.nicheScore
                )}`}
              >
                {channel.nicheScore.toFixed(1)}
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {channel.nicheCategory && (
                <span className="text-sm text-[#64FFDA]">{channel.nicheCategory.name}</span>
              )}
              {channel.isOutlier && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#F472B6]/10 text-[#F472B6]">
                  OUTLIER
                </span>
              )}
              {channel.isTrending && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#34D399]/10 text-[#34D399]">
                  TRENDING
                </span>
              )}
              {channel.country && (
                <span className="text-xs text-[#94A3B8]">{channel.country}</span>
              )}
            </div>
            {channel.description && (
              <p className="text-sm text-[#94A3B8] mt-2 max-w-2xl line-clamp-2">
                {channel.description}
              </p>
            )}
          </div>
        </div>
        <a
          href={`https://youtube.com/channel/${channel.youtubeId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1E293B] text-sm text-[#94A3B8] hover:text-white hover:border-[#64FFDA]/30 transition-all duration-200 cursor-pointer shrink-0"
        >
          <ExternalLink className="w-4 h-4" />
          View on YouTube
        </a>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={Users}
          label="Subscribers"
          value={formatNumber(channel.subscriberCount)}
          color="#64FFDA"
        />
        <MetricCard
          icon={Eye}
          label="Total Views"
          value={formatNumber(channel.viewCount)}
          color="#818CF8"
        />
        <MetricCard
          icon={Video}
          label="Videos"
          value={channel.videoCount.toString()}
          sub={`${channel.uploadFrequency.toFixed(1)} / week`}
          color="#FCD34D"
        />
        <MetricCard
          icon={DollarSign}
          label="Est. Monthly Revenue"
          value={`$${formatNumber(Math.round(channel.estimatedMonthlyRevenue))}`}
          sub={channel.nicheCategory ? `$${channel.nicheCategory.estimatedCPM.toFixed(2)} CPM` : undefined}
          color="#34D399"
        />
        <MetricCard
          icon={TrendingUp}
          label="Growth (30d)"
          value={`${channel.growthRate30d > 0 ? "+" : ""}${channel.growthRate30d.toFixed(1)}%`}
          sub={`7d: ${channel.growthRate7d > 0 ? "+" : ""}${channel.growthRate7d.toFixed(1)}%`}
          color={channel.growthRate30d > 0 ? "#34D399" : "#EF4444"}
        />
        <MetricCard
          icon={Zap}
          label="Views (48h)"
          value={formatNumber(channel.viewsLast48h)}
          color="#F472B6"
        />
        <MetricCard
          icon={Heart}
          label="Engagement Rate"
          value={`${analytics.engagementRate}%`}
          sub={`Avg ${formatNumber(analytics.avgLikes)} likes/video`}
          color="#EF4444"
        />
        <MetricCard
          icon={Flame}
          label="Viral Videos"
          value={analytics.viralVideos.toString()}
          sub={`of ${analytics.totalVideosAnalyzed} analyzed`}
          color="#F472B6"
        />
      </div>

      {/* Top Videos */}
      <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1E293B]">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#FCD34D]" />
            Top Performing Videos
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-[#94A3B8] border-b border-[#1E293B]">
                <th className="text-left px-6 py-3 font-medium">Title</th>
                <th className="text-right px-4 py-3 font-medium">Views</th>
                <th className="text-right px-4 py-3 font-medium">Likes</th>
                <th className="text-right px-4 py-3 font-medium">Comments</th>
                <th className="text-right px-4 py-3 font-medium">Views/hr</th>
                <th className="text-right px-6 py-3 font-medium">Published</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1E293B]">
              {channel.videos.map((video) => (
                <tr
                  key={video.id}
                  className="hover:bg-[#1E293B]/20 transition-colors duration-150"
                >
                  <td className="px-6 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-white truncate max-w-[300px]">
                        {video.title}
                      </span>
                      {video.isViral && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-[#F472B6]/10 text-[#F472B6] shrink-0">
                          VIRAL
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-white text-right font-mono">
                    {formatNumber(video.viewCount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#94A3B8] text-right font-mono">
                    {formatNumber(video.likeCount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#94A3B8] text-right font-mono">
                    {formatNumber(video.commentCount)}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-mono">
                    <span className={video.viewsPerHour > 100 ? "text-[#34D399]" : "text-[#94A3B8]"}>
                      {formatNumber(Math.round(video.viewsPerHour))}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm text-[#94A3B8] text-right">
                    {new Date(video.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
