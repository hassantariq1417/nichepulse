"use client";

import { useState, useEffect } from "react";
import {
  Database,
  Zap,
  BarChart3,
  Video,
  Loader2,
  RefreshCw,
  Rss,
} from "lucide-react";

const NICHES = [
  "finance",
  "ai-tools",
  "stoicism",
  "productivity",
  "true-crime",
  "mindset",
  "fitness",
  "business",
  "luxury",
  "dark-history",
  "real-estate",
  "coding",
  "health",
  "languages",
  "travel-hacks",
];

export default function IngestPage() {
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);
  const [stats, setStats] = useState({ channels: 0, niches: 0, videos: 0 });
  const [currentNiche, setCurrentNiche] = useState("");

  // Load current DB stats on mount
  useEffect(() => {
    fetch("/api/ingest/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => null);
  }, []);

  const addLog = (msg: string) =>
    setLog((prev) => [
      `${new Date().toLocaleTimeString()} ${msg}`,
      ...prev.slice(0, 99),
    ]);

  const refreshStats = () => {
    fetch("/api/ingest/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => null);
  };

  const runIngest = async (niche?: string) => {
    setRunning(true);
    setLog([]);

    const niches = niche ? [niche] : NICHES;

    addLog(`🚀 Starting ingest for ${niches.length} niche(s)...`);

    for (const n of niches) {
      setCurrentNiche(n);
      addLog(`📁 Processing: ${n}`);

      try {
        const res = await fetch("/api/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ niche: n }),
        });
        const data = await res.json();

        if (data.success) {
          addLog(`✅ ${n}: ${data.saved} channels saved, ${data.errors} errors`);
          data.channels?.forEach((ch: string) => addLog(`  ${ch}`));
          refreshStats();
        } else {
          addLog(`❌ ${n}: ${data.error}`);
        }
      } catch {
        addLog(`❌ ${n}: Network error`);
      }

      // 500ms between niches
      await new Promise((r) => setTimeout(r, 500));
    }

    setCurrentNiche("");
    setRunning(false);
    addLog("🎉 Ingest complete!");
    refreshStats();
  };

  const runRSS = async () => {
    setRunning(true);
    addLog("📡 Running RSS enrichment...");

    try {
      const res = await fetch("/api/ingest/rss", { method: "POST" });
      const data = await res.json();
      addLog(
        `✅ RSS: Updated ${data.updated}/${data.total} channels with upload frequency`
      );
    } catch {
      addLog("❌ RSS enrichment failed");
    }

    setRunning(false);
    refreshStats();
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Database className="w-6 h-6 text-[#64FFDA]" />
          YouTube Data Ingestion
        </h1>
        <p className="text-sm text-[#94A3B8] mt-1">
          Scrape real YouTube channels into your database using seed channel IDs
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Channels", value: stats.channels, icon: BarChart3 },
          { label: "Niches", value: stats.niches, icon: Database },
          { label: "Videos", value: stats.videos, icon: Video },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-5"
          >
            <div className="flex items-center gap-2 text-xs text-[#94A3B8] mb-1">
              <s.icon className="w-3.5 h-3.5" />
              {s.label}
            </div>
            <div
              className="text-2xl font-bold font-mono"
              style={{ color: "#64FFDA" }}
            >
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={() => runIngest()}
          disabled={running}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-semibold cursor-pointer transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: running
              ? "#1E293B"
              : "linear-gradient(135deg, #64FFDA, #00B4D8)",
            color: running ? "#64748B" : "#080B10",
          }}
        >
          {running && currentNiche ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Scraping {currentNiche}...
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              Ingest All 15 Niches
            </>
          )}
        </button>

        <button
          onClick={runRSS}
          disabled={running}
          className="inline-flex items-center gap-2 h-10 px-5 rounded-lg bg-[#0D1117] border border-[#1E293B] text-sm font-semibold text-[#94A3B8] hover:text-white hover:border-[#64FFDA]/30 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Rss className="w-4 h-4" />
          Enrich with RSS
        </button>

        <button
          onClick={refreshStats}
          className="inline-flex items-center gap-2 h-10 px-4 rounded-lg bg-[#0D1117] border border-[#1E293B] text-sm text-[#94A3B8] hover:text-white cursor-pointer transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Stats
        </button>
      </div>

      {/* Per-niche buttons */}
      <div className="flex gap-2 flex-wrap">
        {NICHES.map((n) => (
          <button
            key={n}
            onClick={() => runIngest(n)}
            disabled={running}
            className="h-8 px-3 rounded-md text-xs font-mono bg-[#0D1117] border border-[#1E293B] text-[#94A3B8] hover:text-white hover:border-[#64FFDA]/30 cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed capitalize"
          >
            {n.replace(/[-_]/g, " ")}
          </button>
        ))}
      </div>

      {/* Live Log */}
      {log.length > 0 && (
        <div
          className="rounded-xl border border-[#1E293B] bg-[#080B10] p-4 font-mono text-xs leading-7"
          style={{ maxHeight: "500px", overflowY: "auto" }}
        >
          {log.map((entry, i) => (
            <div
              key={i}
              style={{
                color: entry.includes("✅")
                  ? "#34D399"
                  : entry.includes("❌")
                    ? "#F87171"
                    : entry.includes("🚀") || entry.includes("🎉")
                      ? "#64FFDA"
                      : entry.includes("📡")
                        ? "#818CF8"
                        : "#94A3B8",
              }}
            >
              {entry}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
