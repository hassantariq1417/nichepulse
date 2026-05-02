"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, X, Zap } from "lucide-react";

/* ── Creator Avatars Row ─────────────────────────────────────── */

const heroCreators = [
  { initials: "MC", color: "#FF6B6B" },
  { initials: "SW", color: "#4ECDC4" },
  { initials: "DO", color: "#45B7D1" },
  { initials: "PP", color: "#96CEB4" },
  { initials: "JM", color: "#DDA0DD" },
];

function CreatorAvatars() {
  return (
    <div className="flex items-center justify-center gap-1 mb-6 animate-fade-in">
      <div className="flex -space-x-2">
        {heroCreators.map((c) => (
          <div
            key={c.initials}
            className="w-8 h-8 rounded-full border-2 border-[#080B10] flex items-center justify-center text-[10px] font-bold text-[#080B10]"
            style={{ background: c.color }}
          >
            {c.initials}
          </div>
        ))}
      </div>
      <span className="ml-3 text-sm text-[#94A3B8]">
        Join <span className="text-[#64FFDA] font-semibold">500+</span>{" "}
        creators already using NichePulse
      </span>
    </div>
  );
}

/* ── Animated stat counter ───────────────────────────────────── */

function StatCounter({
  target,
  suffix,
  label,
}: {
  target: number;
  suffix: string;
  label: string;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          setStarted(true);
          const duration = 2000;
          const startTime = Date.now();
          const timer = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(2, -10 * progress);
            setCount(Math.floor(eased * target));
            if (progress >= 1) {
              setCount(target);
              clearInterval(timer);
            }
          }, 16);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [target, started]);

  useEffect(() => {
    const fallback = setTimeout(() => {
      if (!started) {
        setCount(target);
        setStarted(true);
      }
    }, 3000);
    return () => clearTimeout(fallback);
  }, [started, target]);

  return (
    <div ref={ref} className="text-center">
      <div
        className="text-2xl sm:text-3xl font-bold font-mono tabular-nums"
        style={{
          fontFamily:
            "var(--font-jetbrains-mono, 'JetBrains Mono'), monospace",
          color: "#64FFDA",
        }}
      >
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-xs sm:text-sm mt-1" style={{ color: "#64748B" }}>
        {label}
      </div>
    </div>
  );
}

/* ── Demo Modal ──────────────────────────────────────────────── */

function DemoModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(8,11,16,0.95)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: "800px",
          width: "100%",
          borderRadius: "12px",
          border: "1px solid #1E293B",
          background: "#0D1117",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            background: "none",
            border: "none",
            color: "white",
            cursor: "pointer",
            zIndex: 10,
          }}
        >
          <X size={24} />
        </button>

        <div
          style={{
            aspectRatio: "16/9",
            background: "#0D1117",
            border: "1px solid #1E293B",
            borderRadius: "12px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <span style={{ fontSize: "48px" }}>🎬</span>
          <span
            style={{
              color: "#E2E8F0",
              fontSize: "1.25rem",
              fontWeight: 700,
              fontFamily: "var(--font-syne), sans-serif",
            }}
          >
            Demo video coming soon
          </span>
          <span style={{ color: "#64748B", fontSize: "0.875rem" }}>
            Sign up free to explore the dashboard
          </span>
          <Link
            href="/sign-up"
            style={{
              background: "linear-gradient(135deg,#64FFDA,#00B4D8)",
              color: "#080B10",
              padding: "10px 24px",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.875rem",
              textDecoration: "none",
              display: "inline-block",
              marginTop: "8px",
            }}
          >
            Get Started Free →
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Hero Component ──────────────────────────────────────────── */

export function Hero() {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#64FFDA]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#F472B6]/5 rounded-full blur-[100px]" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#64FFDA 1px, transparent 1px), linear-gradient(90deg, #64FFDA 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
        {/* Animated gradient orb */}
        <div className="absolute top-1/3 left-1/4 w-[200px] h-[200px] bg-[#64FFDA]/8 rounded-full blur-[80px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-[150px] h-[150px] bg-[#F472B6]/8 rounded-full blur-[60px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Creator Avatars */}
          <CreatorAvatars />

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#64FFDA]/10 border border-[#64FFDA]/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#64FFDA]" />
            <span className="text-sm text-[#64FFDA] font-medium">
              Powered by Claude AI · Real YouTube Data
            </span>
          </div>

          {/* Headline — Personal & Aspirational */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-slide-up">
            Stop Guessing.{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#64FFDA] via-[#00B4D8] to-[#64FFDA] animate-gradient-x">
                Start Winning
              </span>
              <svg
                className="absolute -bottom-2 left-0 w-full"
                viewBox="0 0 200 8"
                fill="none"
              >
                <path
                  d="M1 5.5C47 2 153 2 199 5.5"
                  stroke="#64FFDA"
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="opacity-60"
                />
              </svg>
            </span>
            <br />
            <span className="text-[#94A3B8] text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-semibold">
              on YouTube.
            </span>
          </h1>

          {/* Subheadline */}
          <p
            className="text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            The AI-powered niche intelligence platform that finds profitable
            faceless YouTube niches{" "}
            <span className="text-white font-medium">
              before they go mainstream
            </span>
            . Score niches. Detect outliers. Launch faster.
          </p>

          {/* CTA Buttons */}
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#64FFDA] to-[#00B4D8] text-[#080B10] hover:opacity-90 font-semibold text-base px-8 h-13 gap-2 group shadow-lg shadow-[#64FFDA]/20 transition-all duration-300 hover:shadow-[#64FFDA]/40 hover:-translate-y-0.5"
              >
                <Zap className="w-4 h-4" />
                Start Finding Niches — Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-[#1E293B] text-white hover:bg-[#1E293B]/50 h-12 px-8 gap-2"
              onClick={() => setDemoOpen(true)}
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </Button>
          </div>

          {/* Stats Row */}
          <div
            className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-slide-up"
            style={{ animationDelay: "0.3s" }}
          >
            <StatCounter target={12847} suffix="" label="Channels Tracked" />
            <StatCounter target={41} suffix="" label="Countries" />
            <StatCounter target={1744} suffix="+" label="Videos Analyzed" />
          </div>
        </div>

        {/* Dashboard Preview Card */}
        <div
          className="mt-20 max-w-5xl mx-auto animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <DashboardPreview />
        </div>
      </div>

      {/* Demo Modal */}
      <DemoModal isOpen={demoOpen} onClose={() => setDemoOpen(false)} />
    </section>
  );
}

/* ── Realistic Dashboard Preview ──────────────────────────────── */

const channels = [
  {
    name: "AI Automation Hub",
    initials: "AH",
    subs: "2.4M",
    score: 96,
    views48h: "1.8M",
    format: "Long",
  },
  {
    name: "Stoic Mindset",
    initials: "SM",
    subs: "1.9M",
    score: 84,
    views48h: "940K",
    format: "Short",
  },
  {
    name: "Finance Unlocked",
    initials: "FU",
    subs: "780K",
    score: 78,
    views48h: "620K",
    format: "Long",
  },
  {
    name: "Dark History Files",
    initials: "DH",
    subs: "1.1M",
    score: 91,
    views48h: "1.2M",
    format: "Long",
  },
  {
    name: "True Crime Central",
    initials: "TC",
    subs: "520K",
    score: 67,
    views48h: "380K",
    format: "Both",
  },
];

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 80
      ? "bg-[#4ADE80]/15 text-[#4ADE80]"
      : "bg-[#FCD34D]/15 text-[#FCD34D]";
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold tabular-nums ${color}`}
    >
      {score >= 80 ? "🔥" : "📈"} {score}
    </span>
  );
}

function DashboardPreview() {
  return (
    <div
      className="relative"
      style={{ animation: "heroFloat 6s ease-in-out infinite" }}
    >
      <style>{`
        @keyframes heroFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="relative rounded-xl border border-[#1E293B] bg-[#0D1117] overflow-hidden shadow-2xl shadow-[#64FFDA]/5">
        {/* Browser Chrome */}
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1E293B] bg-[#0A0E14]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <div className="w-3 h-3 rounded-full bg-[#FCD34D]" />
              <div className="w-3 h-3 rounded-full bg-[#34D399]" />
            </div>
            <div className="px-3 py-1 rounded-md bg-[#1E293B] text-[11px] text-[#94A3B8] font-mono flex items-center gap-1.5">
              <svg
                className="w-3 h-3 text-[#34D399]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              nichepulse.io/dashboard
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#4ADE80]/10">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
            <span className="text-[10px] font-medium text-[#4ADE80]">
              Live
            </span>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-5 grid grid-cols-12 gap-4">
          {/* Sidebar */}
          <div className="col-span-2 hidden lg:block space-y-1 border-r border-[#1E293B] pr-4">
            {[
              { label: "Overview", active: false },
              { label: "Niche Finder", active: false },
              { label: "Channels", active: true },
              { label: "Analytics", active: false },
            ].map((item) => (
              <div
                key={item.label}
                className={`px-3 py-2 rounded-lg text-[11px] font-medium transition-colors ${
                  item.active
                    ? "bg-[#64FFDA]/10 text-[#64FFDA] border border-[#64FFDA]/20"
                    : "text-[#94A3B8]"
                }`}
              >
                {item.label}
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="col-span-12 lg:col-span-10 space-y-4">
            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Tracked Channels",
                  value: "12,847",
                  change: null,
                  color: "text-white",
                },
                {
                  label: "New Today",
                  value: "+142",
                  change: "↑ 12%",
                  color: "text-[#4ADE80]",
                },
                {
                  label: "Avg. Niche Score",
                  value: "73.4",
                  change: "↑ 2.1",
                  color: "text-[#FCD34D]",
                },
                {
                  label: "Outliers Found",
                  value: "38",
                  change: "↑ 5",
                  color: "text-[#F472B6]",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-[#1E293B]/40 rounded-lg p-3 border border-[#1E293B]"
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`text-lg font-mono font-bold ${stat.color}`}
                    >
                      {stat.value}
                    </span>
                    {stat.change && (
                      <span className="text-[9px] font-medium text-[#4ADE80]">
                        {stat.change}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#94A3B8] mt-0.5">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Channel Table */}
            <div className="rounded-lg border border-[#1E293B] overflow-hidden">
              <div className="grid grid-cols-12 gap-2 px-4 py-2 bg-[#1E293B]/30 text-[10px] text-[#94A3B8] uppercase tracking-wider font-medium">
                <div className="col-span-4">Channel</div>
                <div className="col-span-2 text-right">Subs</div>
                <div className="col-span-2 text-center">Score</div>
                <div className="col-span-2 text-right">Views / 48h</div>
                <div className="col-span-2 text-right hidden sm:block">
                  Format
                </div>
              </div>
              {channels.map((ch, i) => (
                <div
                  key={ch.name}
                  className={`grid grid-cols-12 gap-2 px-4 py-2.5 items-center text-[11px] ${
                    i < channels.length - 1
                      ? "border-b border-[#1E293B]/60"
                      : ""
                  } hover:bg-[#1E293B]/20 transition-colors`}
                >
                  <div className="col-span-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-[#1E293B] flex items-center justify-center text-[8px] font-bold text-[#64FFDA] shrink-0">
                      {ch.initials}
                    </div>
                    <span className="text-white font-medium truncate">
                      {ch.name}
                    </span>
                  </div>
                  <div className="col-span-2 text-right text-[#CBD5E1] font-mono">
                    {ch.subs}
                  </div>
                  <div className="col-span-2 text-center">
                    <ScoreBadge score={ch.score} />
                  </div>
                  <div className="col-span-2 text-right text-[#CBD5E1] font-mono">
                    {ch.views48h}
                  </div>
                  <div className="col-span-2 text-right hidden sm:block">
                    <span className="text-[10px] text-[#94A3B8] px-1.5 py-0.5 rounded bg-[#1E293B]/50">
                      {ch.format}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mini Chart */}
            <div className="bg-[#1E293B]/20 rounded-lg p-3 border border-[#1E293B] h-20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-[#94A3B8] font-medium">
                  Growth Trend (30d)
                </span>
                <span className="text-[10px] text-[#4ADE80] font-mono">
                  +18.4%
                </span>
              </div>
              <div className="flex items-end justify-between h-[calc(100%-20px)] gap-0.5">
                {[
                  30, 45, 35, 55, 50, 65, 48, 72, 60, 78, 68, 85, 75, 82, 90,
                  80, 88, 92, 86, 95, 82, 90, 94, 88,
                ].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-sm bg-gradient-to-t from-[#64FFDA]/15 to-[#64FFDA]/50"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Gradient fade at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-[#080B10] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
