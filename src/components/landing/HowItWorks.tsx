"use client";

import { Search, BarChart3, Sparkles, Rocket } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: Search,
    title: "Discover Niches",
    description:
      "Enter a topic or browse categories. Our algorithm scores each niche on growth velocity, competition density, and revenue potential.",
    color: "#64FFDA",
  },
  {
    step: "02",
    icon: BarChart3,
    title: "Analyze Channels",
    description:
      "Deep-dive into any channel. See subscriber growth, upload frequency, viral videos, and estimated monthly revenue at a glance.",
    color: "#F472B6",
  },
  {
    step: "03",
    icon: Sparkles,
    title: "Get AI Insights",
    description:
      "Claude AI analyzes the data and generates personalized recommendations: niche viability, content angles, and optimal posting strategy.",
    color: "#FCD34D",
  },
  {
    step: "04",
    icon: Rocket,
    title: "Create & Launch",
    description:
      "Use Content Studio to generate titles, descriptions, scripts, and thumbnail ideas. Everything optimized for your chosen niche.",
    color: "#64FFDA",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#F472B6]/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FCD34D]/10 border border-[#FCD34D]/20 mb-4">
            <Rocket className="w-3.5 h-3.5 text-[#FCD34D]" />
            <span className="text-xs text-[#FCD34D] font-medium uppercase tracking-wider">
              How It Works
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            From zero to{" "}
            <span className="text-[#FCD34D]">profitable niche</span>
            <br />
            in 4 steps
          </h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto text-lg">
            No guesswork. No spreadsheets. Just data-driven decisions.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-[72px] left-[12.5%] right-[12.5%] h-[2px] bg-gradient-to-r from-[#64FFDA]/30 via-[#F472B6]/30 to-[#64FFDA]/30" />

          {steps.map((step) => (
            <div key={step.step} className="relative text-center group">
              {/* Step number circle */}
              <div className="relative inline-flex mb-6">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: `${step.color}10`,
                    borderColor: `${step.color}30`,
                  }}
                >
                  <step.icon
                    className="w-7 h-7"
                    style={{ color: step.color }}
                  />
                </div>
                {/* Step badge */}
                <div
                  className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: step.color,
                    color: "#080B10",
                  }}
                >
                  {step.step}
                </div>
              </div>

              {/* Content */}
              <h3 className="text-lg font-semibold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-[#94A3B8] leading-relaxed max-w-[280px] mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
