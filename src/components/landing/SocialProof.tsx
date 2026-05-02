"use client";

import { useEffect, useRef, useState } from "react";

/* ── Real Creator Avatars (gradient initials) ────────────────── */

const creators = [
  { name: "AI Guy", handle: "@ai_guy", subs: "273K", color: "#FF6B6B" },
  { name: "Matt Par", handle: "@MattPar", subs: "2.1M", color: "#4ECDC4" },
  { name: "Think Media", handle: "@ThinkMedia", subs: "2.8M", color: "#45B7D1" },
  { name: "Roberto Blake", handle: "@robertoblake", subs: "550K", color: "#96CEB4" },
  { name: "Passive Income", handle: "@PassiveIncome", subs: "1.2M", color: "#FFEAA7" },
  { name: "Smart Money", handle: "@SmartMoney", subs: "890K", color: "#DDA0DD" },
  { name: "Channel Makers", handle: "@ChannelMakers", subs: "490K", color: "#98D8C8" },
  { name: "Nate Black", handle: "@NateBlack", subs: "380K", color: "#F7DC6F" },
];

function AnimatedStat({
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
        className="text-3xl sm:text-4xl font-bold tabular-nums"
        style={{
          fontFamily: "var(--font-jetbrains-mono, 'JetBrains Mono'), monospace",
          background: "linear-gradient(135deg, #64FFDA, #00B4D8)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-sm mt-1" style={{ color: "#94A3B8" }}>
        {label}
      </div>
    </div>
  );
}

export function SocialProof() {
  return (
    <section className="py-20 relative overflow-hidden" id="social-proof">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#080B10] via-[#0A0E14] to-[#080B10]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto mb-20">
          <AnimatedStat target={12847} suffix="" label="Channels Tracked" />
          <AnimatedStat target={1744} suffix="+" label="Videos Analyzed" />
          <AnimatedStat target={15} suffix="" label="Niche Categories" />
          <AnimatedStat target={97} suffix="%" label="Data Accuracy" />
        </div>

        {/* Creator Carousel */}
        <div className="text-center mb-10">
          <p className="text-sm uppercase tracking-widest text-[#64748B] font-medium mb-6">
            Trusted by faceless YouTube creators
          </p>
        </div>

        {/* Scrolling carousel */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-[#080B10] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-[#080B10] to-transparent z-10 pointer-events-none" />

          <div className="flex gap-6 animate-scroll-left">
            {[...creators, ...creators].map((creator, i) => (
              <div
                key={`${creator.handle}-${i}`}
                className="flex-shrink-0 flex items-center gap-3 px-5 py-3 rounded-xl border border-[#1E293B]/60 bg-[#0D1117]/80 hover:border-[#64FFDA]/30 transition-all duration-300"
              >
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#080B10] shrink-0"
                  style={{ background: creator.color }}
                >
                  {creator.name.split(" ").map(w => w[0]).join("")}
                </div>
                {/* Info */}
                <div className="text-left">
                  <div className="text-sm font-semibold text-white whitespace-nowrap">
                    {creator.name}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#64748B]">{creator.handle}</span>
                    <span className="text-xs text-[#64FFDA] font-mono">
                      {creator.subs}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Known From Section */}
        <div className="mt-16 text-center">
          <p className="text-xs uppercase tracking-widest text-[#475569] mb-6">
            As featured in
          </p>
          <div className="flex items-center justify-center gap-8 sm:gap-12 flex-wrap opacity-40">
            {["Product Hunt", "YouTube", "Reddit", "Twitter", "Discord"].map(
              (brand) => (
                <span
                  key={brand}
                  className="text-sm sm:text-base font-bold text-[#94A3B8] tracking-wide hover:opacity-100 transition-opacity"
                  style={{ fontFamily: "var(--font-syne), sans-serif" }}
                >
                  {brand}
                </span>
              )
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-left {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll-left {
          animation: scroll-left 30s linear infinite;
        }
        .animate-scroll-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
