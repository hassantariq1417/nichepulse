"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

function AnimatedCounter({ target, suffix = "", duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * target));
            if (progress < 1) requestAnimationFrame(animate);
          };
          animate();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref} className="font-mono tabular-nums">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        {/* Radial gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-[#64FFDA]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#F472B6]/5 rounded-full blur-[100px]" />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(#64FFDA 1px, transparent 1px), linear-gradient(90deg, #64FFDA 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#64FFDA]/10 border border-[#64FFDA]/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-[#64FFDA]" />
            <span className="text-sm text-[#64FFDA] font-medium">
              Powered by Claude AI
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6 animate-slide-up">
            Find Profitable YouTube{" "}
            <span className="relative">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#64FFDA] to-[#64FFDA]/70">
                Niches
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
            </span>{" "}
            Before Everyone Else
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            AI-powered intelligence platform for faceless YouTube creators.
            Discover untapped niches, analyze competitor channels, and generate
            viral content ideas — all in one dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-[#64FFDA] text-[#080B10] hover:bg-[#64FFDA]/90 font-semibold text-base px-8 h-12 gap-2 group"
              >
                Start Finding Niches
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="border-[#1E293B] text-white hover:bg-[#1E293B]/50 h-12 px-8 gap-2"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </Button>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedCounter target={98} suffix="M+" />
              </div>
              <div className="text-xs sm:text-sm text-[#94A3B8] mt-1">Channels Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedCounter target={41} suffix="" />
              </div>
              <div className="text-xs sm:text-sm text-[#94A3B8] mt-1">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-[#64FFDA]">
                <AnimatedCounter target={15} suffix="K+" />
              </div>
              <div className="text-xs sm:text-sm text-[#94A3B8] mt-1">Active Creators</div>
            </div>
          </div>
        </div>

        {/* Dashboard Preview Card */}
        <div className="mt-20 max-w-5xl mx-auto animate-slide-up" style={{ animationDelay: "0.4s" }}>
          <div className="relative rounded-xl border border-[#1E293B] bg-[#0D1117]/80 backdrop-blur-sm overflow-hidden shadow-2xl shadow-[#64FFDA]/5">
            {/* Window controls */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1E293B]">
              <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
              <div className="w-3 h-3 rounded-full bg-[#FCD34D]" />
              <div className="w-3 h-3 rounded-full bg-[#34D399]" />
              <div className="ml-4 px-3 py-1 rounded-md bg-[#1E293B] text-xs text-[#94A3B8] font-mono">
                nichepulse.io/dashboard
              </div>
            </div>
            {/* Mock Dashboard */}
            <div className="p-6 grid grid-cols-12 gap-4">
              {/* Sidebar mock */}
              <div className="col-span-2 hidden lg:block space-y-3">
                {["Dashboard", "Niche Finder", "Content Studio", "Analytics"].map((item, i) => (
                  <div
                    key={item}
                    className={`px-3 py-2 rounded-lg text-xs ${
                      i === 0
                        ? "bg-[#64FFDA]/10 text-[#64FFDA]"
                        : "text-[#94A3B8]"
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
              {/* Main content mock */}
              <div className="col-span-12 lg:col-span-10 space-y-4">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Tracked Channels", value: "12,847", color: "text-white" },
                    { label: "New Today", value: "+142", color: "text-[#34D399]" },
                    { label: "Avg. Niche Score", value: "73.4", color: "text-[#FCD34D]" },
                    { label: "Outliers Found", value: "38", color: "text-[#F472B6]" },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-[#1E293B]/50 rounded-lg p-3 border border-[#1E293B]">
                      <div className={`text-lg font-mono font-bold ${stat.color}`}>{stat.value}</div>
                      <div className="text-[10px] text-[#94A3B8]">{stat.label}</div>
                    </div>
                  ))}
                </div>
                {/* Chart mock */}
                <div className="bg-[#1E293B]/30 rounded-lg p-4 border border-[#1E293B] h-32">
                  <div className="flex items-end justify-between h-full gap-1">
                    {[40, 55, 35, 65, 50, 78, 60, 85, 70, 92, 75, 88, 95, 80, 90, 72, 86, 94, 82, 97].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-sm bg-gradient-to-t from-[#64FFDA]/20 to-[#64FFDA]/60"
                        style={{ height: `${h}%`, animationDelay: `${i * 50}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Gradient fade at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-[#080B10] to-transparent" />
          </div>
        </div>
      </div>
    </section>
  );
}
