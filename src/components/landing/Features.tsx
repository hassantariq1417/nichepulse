"use client";

import {
  Search,
  Brain,
  TrendingUp,
  BarChart3,
  Sparkles,
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "Niche Finder Engine",
    description:
      "Score niches by growth velocity, competition density, and revenue potential with our proprietary algorithm. Filter by CPM, subscriber count, and trend direction.",
    color: "#64FFDA",
    tag: "Core Feature",
  },
  {
    icon: Brain,
    title: "Claude AI Recommendations",
    description:
      "Get AI-powered niche suggestions tailored to your content style, budget, and growth goals. Personalized strategies, not generic advice.",
    color: "#F472B6",
    tag: "AI Powered",
  },
  {
    icon: TrendingUp,
    title: "Outlier Detection",
    description:
      "Automatically discover small channels getting disproportionate views. Find the signals before they become trends.",
    color: "#64FFDA",
    tag: "Real-time",
  },
  {
    icon: BarChart3,
    title: "Revenue Analytics",
    description:
      "Estimate monthly earnings per niche using CPM data, view velocity, and monetization benchmarks. Know what niches actually pay.",
    color: "#F472B6",
    tag: "Data-Driven",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 relative">
      {/* Background accent */}
      <div className="absolute top-1/2 left-0 w-[300px] h-[300px] bg-[#64FFDA]/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F472B6]/10 border border-[#F472B6]/20 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#F472B6]" />
            <span className="text-xs text-[#F472B6] font-medium uppercase tracking-wider">
              Features
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Everything you need to{" "}
            <span className="text-[#64FFDA]">dominate</span> YouTube
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto text-lg">
            From niche discovery to content generation — one platform replaces
            five tools. Built for faceless channel creators who move fast.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6 hover:border-[#64FFDA]/30 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Tag */}
              <div
                className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider mb-4"
                style={{
                  backgroundColor: `${feature.color}15`,
                  color: feature.color,
                }}
              >
                {feature.tag}
              </div>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                style={{
                  backgroundColor: `${feature.color}10`,
                }}
              >
                <feature.icon
                  className="w-6 h-6"
                  style={{ color: feature.color }}
                />
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed">
                {feature.description}
              </p>

              {/* Hover glow */}
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{
                  background: `radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), ${feature.color}08, transparent 40%)`,
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
