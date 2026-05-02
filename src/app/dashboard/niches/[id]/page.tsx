"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  Target,
  AlertTriangle,
  Calendar,
  BarChart3,
  Users,
  Eye,
  DollarSign,
  TrendingUp,
  Flame,
  RefreshCw,
  Sparkles,
} from "lucide-react";

interface AnalysisData {
  strategy: string;
  contentGaps: string[];
  risks: string[];
  calendar: Array<{ day: string; type: string; description: string }>;
  metrics: {
    avgSubscribers: number;
    avgViews: number;
    totalRevenue: number;
    outlierCount: number;
    avgGrowth: number;
    nicheScore: number;
    cpm: number;
  };
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toString();
}

export default function NicheAnalysisPage() {
  const params = useParams();
  const router = useRouter();
  const nicheId = params.id as string;
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAnalysis = () => {
    setLoading(true);
    setError("");
    fetch(`/api/ai/analysis?nicheId=${nicheId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setAnalysis(data.analysis);
          setSource(data.source);
        }
      })
      .catch(() => setError("Failed to load analysis"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (nicheId) fetchAnalysis();
  }, [nicheId]);

  if (loading) {
    return (
      <div className="max-w-[1000px] space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#1E293B] animate-pulse" />
          <div className="w-48 h-6 rounded bg-[#1E293B] animate-pulse" />
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-[#1E293B] animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-xl bg-[#1E293B] animate-pulse" />
        <div className="h-48 rounded-xl bg-[#1E293B] animate-pulse" />
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-[1000px] flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="w-12 h-12 text-[#EF4444] mb-4" />
        <p className="text-white font-medium mb-2">Analysis Unavailable</p>
        <p className="text-sm text-[#94A3B8] mb-4">{error || "Could not load niche analysis."}</p>
        <button
          onClick={() => router.back()}
          className="text-[#64FFDA] text-sm hover:underline cursor-pointer"
        >
          ← Go back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] space-y-6">
      {/* Back button + Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Niches
        </button>
        <div className="flex items-center gap-3">
          {source && (
            <span className="px-2 py-1 rounded-lg bg-[#818CF8]/10 text-[10px] font-medium text-[#818CF8]">
              {source === "claude" ? "✨ AI-Powered" : "📊 Data-Driven"}
            </span>
          )}
          <button
            onClick={fetchAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-[#94A3B8] hover:text-white border border-[#1E293B] hover:border-[#334155] cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Refresh
          </button>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-white flex items-center gap-3">
        <Brain className="w-7 h-7 text-[#818CF8]" />
        Niche Deep Analysis
      </h1>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0D1117]/60">
          <div className="flex items-center gap-1.5 text-[#94A3B8] mb-2">
            <Users className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider">Avg. Subs</span>
          </div>
          <div className="text-xl font-mono font-bold text-white">
            {formatNumber(analysis.metrics.avgSubscribers)}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0D1117]/60">
          <div className="flex items-center gap-1.5 text-[#94A3B8] mb-2">
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider">Avg. Views</span>
          </div>
          <div className="text-xl font-mono font-bold text-white">
            {formatNumber(analysis.metrics.avgViews)}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0D1117]/60">
          <div className="flex items-center gap-1.5 text-[#94A3B8] mb-2">
            <DollarSign className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider">CPM</span>
          </div>
          <div className="text-xl font-mono font-bold text-[#34D399]">
            ${analysis.metrics.cpm.toFixed(2)}
          </div>
        </div>
        <div className="p-4 rounded-xl border border-[#1E293B] bg-[#0D1117]/60">
          <div className="flex items-center gap-1.5 text-[#94A3B8] mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider">30d Growth</span>
          </div>
          <div className={`text-xl font-mono font-bold ${analysis.metrics.avgGrowth >= 0 ? "text-[#34D399]" : "text-[#EF4444]"}`}>
            {analysis.metrics.avgGrowth >= 0 ? "+" : ""}{analysis.metrics.avgGrowth}%
          </div>
        </div>
      </div>

      {/* Score + Outliers mini strip */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B]/30 border border-[#1E293B]">
          <BarChart3 className="w-4 h-4 text-[#FCD34D]" />
          <span className="text-xs text-[#94A3B8]">NicheScore:</span>
          <span className="text-sm font-mono font-bold text-[#FCD34D]">
            {analysis.metrics.nicheScore.toFixed(1)}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B]/30 border border-[#1E293B]">
          <Flame className="w-4 h-4 text-[#F472B6]" />
          <span className="text-xs text-[#94A3B8]">Outliers:</span>
          <span className="text-sm font-mono font-bold text-[#F472B6]">
            {analysis.metrics.outlierCount}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B]/30 border border-[#1E293B]">
          <DollarSign className="w-4 h-4 text-[#34D399]" />
          <span className="text-xs text-[#94A3B8]">Total Revenue:</span>
          <span className="text-sm font-mono font-bold text-[#34D399]">
            ${formatNumber(analysis.metrics.totalRevenue)}/mo
          </span>
        </div>
      </div>

      {/* Strategy Brief */}
      <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#818CF8]" />
          AI Strategy Brief
        </h2>
        <div className="prose prose-sm prose-invert max-w-none text-[#CBD5E1] leading-relaxed whitespace-pre-line">
          {analysis.strategy}
        </div>
      </div>

      {/* Content Gaps */}
      <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-[#34D399]" />
          Content Gap Analysis
        </h2>
        <div className="space-y-3">
          {analysis.contentGaps.map((gap, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-lg bg-[#1E293B]/20 border border-[#1E293B]/50"
            >
              <div className="w-6 h-6 rounded-full bg-[#34D399]/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-[10px] font-bold text-[#34D399]">{i + 1}</span>
              </div>
              <p className="text-sm text-[#CBD5E1] leading-relaxed">{gap}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <AlertTriangle className="w-5 h-5 text-[#FCD34D]" />
          Risk Assessment
        </h2>
        <div className="space-y-3">
          {analysis.risks.map((risk, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-[#FCD34D]/5 border border-[#FCD34D]/10"
            >
              <p className="text-sm text-[#CBD5E1] leading-relaxed whitespace-pre-line">{risk}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Content Calendar */}
      <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-[#64FFDA]" />
          Recommended Content Calendar
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {analysis.calendar.map((item, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-[#1E293B]/20 border border-[#1E293B]/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#64FFDA]/10 text-[#64FFDA]">
                  {item.day}
                </span>
                <span className="text-xs font-medium text-white">{item.type}</span>
              </div>
              <p className="text-[11px] text-[#94A3B8] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
