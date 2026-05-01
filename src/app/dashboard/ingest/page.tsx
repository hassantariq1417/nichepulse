"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Database,
  Play,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Search,
  Zap,
  BarChart3,
  Video,
} from "lucide-react";

interface NicheStatus {
  name: string;
  slug: string;
  channelCount: number;
}

interface IngestResult {
  query: string;
  niche: string;
  channelsFound: number;
  newChannels: number;
  updatedChannels: number;
  skipped: number;
  errors?: string[];
}

// Niche search queries — maps each niche slug to YouTube search terms
const nicheQueries: Record<string, string> = {
  "productivity": "productivity tips systems organization",
  "true-crime": "true crime documentary analysis",
  "self-improvement": "self improvement habits motivation",
  "fitness": "fitness workout health tips",
  "mindset": "mindset motivation success growth",
  "coding": "coding programming tutorials developer",
  "finance": "personal finance investing money tips",
  "stoicism": "stoicism philosophy life advice wisdom",
  "ai-tools": "artificial intelligence AI tools technology",
  "business": "business entrepreneurship startup tips",
  "dark-history": "dark history historical mysteries",
  "luxury": "luxury lifestyle premium living",
  "real-estate": "real estate investing property tips",
  "languages": "language learning polyglot tips",
  "travel-hacks": "travel hacks budget tips destinations",
};

export default function IngestPage() {
  const [niches, setNiches] = useState<NicheStatus[]>([]);
  const [totalChannels, setTotalChannels] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [lastScraped, setLastScraped] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [results, setResults] = useState<IngestResult[]>([]);
  const [customQuery, setCustomQuery] = useState("");
  const [customSlug, setCustomSlug] = useState("");
  const [bulkRunning, setBulkRunning] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/youtube/ingest");
      const data = await res.json();
      setNiches(data.niches || []);
      setTotalChannels(data.totalChannels || 0);
      setTotalVideos(data.totalVideos || 0);
      setLastScraped(data.lastScrapedAt);
    } catch (err) {
      console.error("Failed to fetch status:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const ingestNiche = async (slug: string, query: string) => {
    setIngesting(slug);
    try {
      const res = await fetch("/api/youtube/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, nicheSlug: slug, maxChannels: 15 }),
      });
      const data = await res.json();
      if (res.ok) {
        setResults((prev) => [data.summary, ...prev]);
        await fetchStatus();
      } else {
        setResults((prev) => [
          {
            query,
            niche: slug,
            channelsFound: 0,
            newChannels: 0,
            updatedChannels: 0,
            skipped: 0,
            errors: [data.error || "Unknown error"],
          },
          ...prev,
        ]);
      }
    } catch (err) {
      setResults((prev) => [
        {
          query,
          niche: slug,
          channelsFound: 0,
          newChannels: 0,
          updatedChannels: 0,
          skipped: 0,
          errors: [err instanceof Error ? err.message : "Network error"],
        },
        ...prev,
      ]);
    } finally {
      setIngesting(null);
    }
  };

  const runBulkIngest = async () => {
    setBulkRunning(true);
    const entries = Object.entries(nicheQueries);
    for (const [slug, query] of entries) {
      await ingestNiche(slug, query);
      // Rate limit pause between niches
      await new Promise((r) => setTimeout(r, 1000));
    }
    setBulkRunning(false);
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-[#64FFDA]" />
            YouTube Data Ingestion
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Scrape real YouTube channels and videos into your database
          </p>
        </div>
        <button
          onClick={runBulkIngest}
          disabled={bulkRunning || !!ingesting}
          className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-gradient-to-r from-[#64FFDA] to-[#818CF8] text-[#080B10] text-sm font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity"
        >
          {bulkRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running All...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Ingest All Niches
            </>
          )}
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Channels", value: totalChannels, icon: BarChart3 },
          { label: "Total Videos", value: totalVideos, icon: Video },
          { label: "Niches", value: niches.length, icon: Search },
          {
            label: "Last Scraped",
            value: lastScraped
              ? new Date(lastScraped).toLocaleDateString()
              : "Never",
            icon: RefreshCw,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-4"
          >
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
              <stat.icon className="w-3.5 h-3.5" />
              {stat.label}
            </div>
            <div className="text-xl font-bold font-mono text-white">
              {typeof stat.value === "number"
                ? stat.value.toLocaleString()
                : stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Niche list */}
        <div className="lg:col-span-5 space-y-4">
          {/* Custom ingest */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-4 space-y-3">
            <h3 className="text-xs text-[#94A3B8] uppercase tracking-wider">
              Custom Ingest
            </h3>
            <div className="flex gap-2">
              <input
                type="text"
                value={customQuery}
                onChange={(e) => setCustomQuery(e.target.value)}
                placeholder="YouTube search query..."
                className="flex-1 h-9 px-3 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white placeholder-[#94A3B8] focus:outline-none focus:border-[#64FFDA]/50 transition-all"
              />
              <select
                value={customSlug}
                onChange={(e) => setCustomSlug(e.target.value)}
                className="h-9 px-3 rounded-lg bg-[#1E293B]/50 border border-[#1E293B] text-sm text-white focus:outline-none focus:border-[#64FFDA]/50 transition-all"
              >
                <option value="">Select niche...</option>
                {niches.map((n) => (
                  <option key={n.slug} value={n.slug}>
                    {n.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => {
                if (customQuery && customSlug)
                  ingestNiche(customSlug, customQuery);
              }}
              disabled={
                !customQuery || !customSlug || !!ingesting || bulkRunning
              }
              className="w-full h-9 rounded-lg bg-[#1E293B] text-white text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#334155] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <Play className="w-3.5 h-3.5" />
              Run Custom Ingest
            </button>
          </div>

          {/* Niche cards */}
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-4 space-y-2">
            <h3 className="text-xs text-[#94A3B8] uppercase tracking-wider mb-3">
              Niches ({niches.length})
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-[#94A3B8]" />
              </div>
            ) : (
              niches.map((niche) => (
                <div
                  key={niche.slug}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-transparent hover:border-[#1E293B] hover:bg-[#1E293B]/30 transition-all"
                >
                  <div>
                    <div className="text-sm text-white">{niche.name}</div>
                    <div className="text-[10px] text-[#94A3B8]">
                      {niche.channelCount} channels
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      ingestNiche(
                        niche.slug,
                        nicheQueries[niche.slug] || niche.name
                      )
                    }
                    disabled={
                      ingesting === niche.slug || bulkRunning || !!ingesting
                    }
                    className="inline-flex items-center gap-1.5 h-7 px-3 rounded-md text-xs font-medium bg-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#334155] disabled:opacity-40 cursor-pointer transition-all"
                  >
                    {ingesting === niche.slug ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    {ingesting === niche.slug ? "Ingesting..." : "Refresh"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Results log */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-4">
            <h3 className="text-xs text-[#94A3B8] uppercase tracking-wider mb-3">
              Ingestion Log
            </h3>
            {results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-12 h-12 rounded-xl bg-[#64FFDA]/10 flex items-center justify-center mb-3">
                  <Database className="w-6 h-6 text-[#64FFDA]" />
                </div>
                <p className="text-sm text-[#94A3B8]">
                  No ingestion runs yet. Click a niche to start scraping.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {results.map((result, i) => (
                  <div
                    key={i}
                    className={`rounded-lg border p-4 ${
                      result.errors && result.errors.length > 0
                        ? "border-[#EF4444]/30 bg-[#EF4444]/5"
                        : "border-[#34D399]/30 bg-[#34D399]/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {result.errors && result.errors.length > 0 ? (
                        <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-[#34D399]" />
                      )}
                      <span className="text-sm font-medium text-white">
                        {result.niche}
                      </span>
                      <span className="text-[10px] text-[#94A3B8]">
                        &quot;{result.query}&quot;
                      </span>
                    </div>
                    <div className="flex gap-4 text-xs text-[#94A3B8]">
                      <span>Found: {result.channelsFound}</span>
                      <span className="text-[#34D399]">
                        New: {result.newChannels}
                      </span>
                      <span className="text-[#818CF8]">
                        Updated: {result.updatedChannels}
                      </span>
                      {result.skipped > 0 && (
                        <span className="text-[#F59E0B]">
                          Skipped: {result.skipped}
                        </span>
                      )}
                    </div>
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-2 text-xs text-[#EF4444]">
                        {result.errors.map((err, j) => (
                          <div key={j}>• {err}</div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
