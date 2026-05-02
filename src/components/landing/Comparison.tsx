"use client";

import { Check, X, Minus, Crown, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface ComparisonRow {
  feature: string;
  nichepulse: "yes" | "no" | "partial" | string;
  nexlev: "yes" | "no" | "partial" | "coming" | string;
  highlight?: boolean;
}

const comparisonData: ComparisonRow[] = [
  { feature: "Niche Finder with Scoring", nichepulse: "yes", nexlev: "yes" },
  { feature: "Channel Explorer + Filters", nichepulse: "yes", nexlev: "yes" },
  { feature: "Keyword Discovery", nichepulse: "yes", nexlev: "yes" },
  { feature: "Video Thumbnail Previews", nichepulse: "yes", nexlev: "yes" },
  { feature: "Outlier Detection", nichepulse: "yes", nexlev: "yes" },
  { feature: "AI Content Studio (Titles, Scripts, Hooks)", nichepulse: "yes", nexlev: "no", highlight: true },
  { feature: "AI Deep Niche Analysis", nichepulse: "yes", nexlev: "no", highlight: true },
  { feature: "AI Strategy Briefs & Content Calendar", nichepulse: "yes", nexlev: "no", highlight: true },
  { feature: "Revenue Analytics & RPM Calculator", nichepulse: "yes", nexlev: "coming", highlight: true },
  { feature: "Content Gap Detection", nichepulse: "yes", nexlev: "no", highlight: true },
  { feature: "Risk Assessment per Niche", nichepulse: "yes", nexlev: "no" },
  { feature: "Chrome Extension", nichepulse: "coming", nexlev: "yes" },
  { feature: "YouTube Course Included", nichepulse: "no", nexlev: "Paid extra" },
];

function CellIcon({ value }: { value: string }) {
  if (value === "yes") {
    return (
      <div className="w-6 h-6 rounded-full bg-[#34D399]/15 flex items-center justify-center">
        <Check className="w-3.5 h-3.5 text-[#34D399]" />
      </div>
    );
  }
  if (value === "no") {
    return (
      <div className="w-6 h-6 rounded-full bg-[#EF4444]/10 flex items-center justify-center">
        <X className="w-3.5 h-3.5 text-[#EF4444]" />
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="w-6 h-6 rounded-full bg-[#FCD34D]/15 flex items-center justify-center">
        <Minus className="w-3.5 h-3.5 text-[#FCD34D]" />
      </div>
    );
  }
  if (value === "coming") {
    return (
      <span className="text-[10px] font-medium text-[#FCD34D] bg-[#FCD34D]/10 px-2 py-0.5 rounded">
        Coming Soon
      </span>
    );
  }
  return <span className="text-xs text-[#94A3B8]">{value}</span>;
}

export function Comparison() {
  return (
    <section id="comparison" className="py-24 relative">
      {/* Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#64FFDA]/3 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#818CF8]/10 border border-[#818CF8]/20 mb-4">
            <Crown className="w-3.5 h-3.5 text-[#818CF8]" />
            <span className="text-xs text-[#818CF8] font-medium uppercase tracking-wider">
              Comparison
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Same features.{" "}
            <span className="text-[#64FFDA]">5x cheaper.</span>
            <br />
            <span className="text-[#94A3B8] text-2xl sm:text-3xl font-semibold">
              Plus AI that competitors can&apos;t match.
            </span>
          </h2>
          <p className="text-[#94A3B8] max-w-2xl mx-auto text-lg">
            We match every core feature and add AI-powered tools they don&apos;t have — 
            at a fraction of the price.
          </p>
        </div>

        {/* Comparison Table */}
        <div className="max-w-3xl mx-auto">
          <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/80 overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 items-center border-b border-[#1E293B] bg-[#0A0E14]/60">
              <div className="col-span-6 px-6 py-4">
                <span className="text-xs text-[#94A3B8] uppercase tracking-wider font-medium">
                  Feature
                </span>
              </div>
              <div className="col-span-3 px-4 py-4 text-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#64FFDA]/10 border border-[#64FFDA]/20">
                  <Zap className="w-3.5 h-3.5 text-[#64FFDA]" />
                  <span className="text-xs font-bold text-[#64FFDA]">
                    NichePulse
                  </span>
                </div>
                <div className="text-[10px] text-[#64FFDA] mt-1 font-mono font-bold">
                  $9/mo
                </div>
              </div>
              <div className="col-span-3 px-4 py-4 text-center">
                <span className="text-xs font-medium text-[#94A3B8]">
                  NexLev
                </span>
                <div className="text-[10px] text-[#94A3B8] mt-1 font-mono">
                  $51/mo
                </div>
              </div>
            </div>

            {/* Rows */}
            {comparisonData.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-12 items-center ${
                  i < comparisonData.length - 1 ? "border-b border-[#1E293B]/50" : ""
                } ${row.highlight ? "bg-[#64FFDA]/[0.02]" : ""} hover:bg-[#1E293B]/20 transition-colors`}
              >
                <div className="col-span-6 px-6 py-3.5">
                  <span
                    className={`text-sm ${
                      row.highlight ? "text-white font-medium" : "text-[#94A3B8]"
                    }`}
                  >
                    {row.feature}
                    {row.highlight && (
                      <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-[#64FFDA]/10 text-[#64FFDA] font-bold">
                        OUR EDGE
                      </span>
                    )}
                  </span>
                </div>
                <div className="col-span-3 px-4 py-3.5 flex justify-center">
                  <CellIcon value={row.nichepulse} />
                </div>
                <div className="col-span-3 px-4 py-3.5 flex justify-center">
                  <CellIcon value={row.nexlev} />
                </div>
              </div>
            ))}

            {/* Price summary row */}
            <div className="grid grid-cols-12 items-center border-t-2 border-[#1E293B] bg-[#0A0E14]/60">
              <div className="col-span-6 px-6 py-5">
                <span className="text-sm font-bold text-white">
                  Monthly Price
                </span>
              </div>
              <div className="col-span-3 px-4 py-5 text-center">
                <span className="text-2xl font-bold font-mono text-[#64FFDA]">
                  $9
                </span>
              </div>
              <div className="col-span-3 px-4 py-5 text-center">
                <span className="text-2xl font-bold font-mono text-[#EF4444] line-through opacity-60">
                  $51
                </span>
              </div>
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-10">
            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#64FFDA] to-[#00B4D8] text-[#080B10] hover:opacity-90 font-semibold text-base px-10 h-13 gap-2 group shadow-lg shadow-[#64FFDA]/20 transition-all duration-300 hover:shadow-[#64FFDA]/40"
              >
                <Zap className="w-4 h-4" />
                Get NichePulse for $9/mo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <p className="text-xs text-[#64748B] mt-3">
              Save $504/year vs. NexLev Pro
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
