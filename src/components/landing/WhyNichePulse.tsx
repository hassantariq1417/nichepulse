"use client";

import {
  Brain,
  FileText,
  DollarSign,
  Target,
  Zap,
  Shield,
} from "lucide-react";

const advantages = [
  {
    icon: Brain,
    title: "AI Strategy Briefs",
    description:
      "Get Claude-powered analysis of any niche — strategy advice, content gaps, risk assessment, and optimal posting schedule. No other tool does this.",
    color: "#818CF8",
    tag: "Exclusive",
    size: "large",
  },
  {
    icon: FileText,
    title: "Content Studio",
    description:
      "Generate click-worthy titles, SEO descriptions, script outlines, and video hooks — all trained on what works in your niche.",
    color: "#F472B6",
    tag: "AI-Powered",
    size: "large",
  },
  {
    icon: DollarSign,
    title: "Live Revenue Analytics",
    description:
      "RPM calculator, CPM by niche, earnings estimator, and revenue leaderboard — all live. Competitors say \"Coming Soon.\"",
    color: "#34D399",
    tag: "Live Now",
    size: "small",
  },
  {
    icon: Target,
    title: "Content Gap Detection",
    description:
      "AI identifies underserved content angles in any niche — find what nobody else is making.",
    color: "#FCD34D",
    tag: "Data-Driven",
    size: "small",
  },
  {
    icon: Zap,
    title: "5.7x Cheaper",
    description:
      "Full-featured niche intelligence for $9/month instead of $51. Same data quality, better AI tools, lower price.",
    color: "#64FFDA",
    tag: "Best Value",
    size: "small",
  },
  {
    icon: Shield,
    title: "Risk Assessment",
    description:
      "Know the saturation risk, competition level, and growth trajectory before you commit to a niche.",
    color: "#FF6B6B",
    tag: "Smart",
    size: "small",
  },
];

export function WhyNichePulse() {
  return (
    <section className="py-24 relative">
      {/* Background accents */}
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-[#818CF8]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-0 w-[300px] h-[300px] bg-[#64FFDA]/5 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#64FFDA]/10 border border-[#64FFDA]/20 mb-4">
            <Zap className="w-3.5 h-3.5 text-[#64FFDA]" />
            <span className="text-xs text-[#64FFDA] font-medium uppercase tracking-wider">
              Why NichePulse
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            The <span className="text-[#64FFDA]">unfair advantage</span>
            <br />
            other tools can&apos;t give you
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto text-lg">
            Every niche tool gives you data. We give you data{" "}
            <span className="text-white font-medium italic">plus AI that thinks for you</span>.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {advantages.map((item) => {
            const isLarge = item.size === "large";
            return (
              <div
                key={item.title}
                className={`group relative rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6 hover:border-[${item.color}]/30 transition-all duration-300 hover:-translate-y-1 ${
                  isLarge ? "lg:col-span-2 lg:row-span-1" : ""
                }`}
              >
                {/* Tag */}
                <div
                  className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-medium uppercase tracking-wider mb-4"
                  style={{
                    backgroundColor: `${item.color}15`,
                    color: item.color,
                  }}
                >
                  {item.tag}
                </div>

                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${item.color}10`,
                  }}
                >
                  <item.icon
                    className="w-6 h-6"
                    style={{ color: item.color }}
                  />
                </div>

                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  {item.description}
                </p>

                {/* Hover glow */}
                <div
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{
                    background: `radial-gradient(300px circle at 50% 50%, ${item.color}06, transparent 50%)`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
