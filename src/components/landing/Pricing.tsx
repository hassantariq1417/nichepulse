"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Building2, Lock } from "lucide-react";

/* ── FIX 5 — Early Bird Pricing ─────────────────────────────── */

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#64FFDA]/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#64FFDA]/10 border border-[#64FFDA]/20 mb-4">
            <Crown className="w-3.5 h-3.5 text-[#64FFDA]" />
            <span className="text-xs text-[#64FFDA] font-medium uppercase tracking-wider">
              Pricing
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Start free, <span className="text-[#64FFDA]">scale</span> when
            ready
          </h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto text-lg">
            No credit card required. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* TIER 1 — Free Forever */}
          <div className="relative rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-[#1E293B] bg-[#0D1117]/60">
            <div className="mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: "#64FFDA15" }}
              >
                <Zap className="w-5 h-5 text-[#64FFDA]" />
              </div>
              <h3 className="text-xl font-bold text-white">Free Forever</h3>
              <p className="text-sm text-[#94A3B8] mt-1">
                Perfect for exploring niches and getting started.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold font-mono text-white">
                  $0
                </span>
                <span className="text-sm text-[#94A3B8]">/forever</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                { text: "3 niche searches per day", locked: false },
                { text: "Basic NicheScore (number only)", locked: false },
                { text: "Top 5 results", locked: false },
                { text: "Revenue estimates", locked: true },
                { text: "Filters", locked: true },
                { text: "AI recommendations", locked: true },
              ].map((feature) => (
                <li key={feature.text} className="flex items-start gap-3">
                  {feature.locked ? (
                    <Lock className="w-4 h-4 mt-0.5 shrink-0 text-[#475569]" />
                  ) : (
                    <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#64FFDA]" />
                  )}
                  <span
                    className={`text-sm ${feature.locked ? "text-[#475569]" : "text-[#94A3B8]"}`}
                  >
                    {feature.text}
                    {feature.locked ? " 🔒" : ""}
                  </span>
                </li>
              ))}
            </ul>

            <Link href="/sign-up">
              <Button className="w-full h-11 font-semibold bg-[#1E293B] text-white hover:bg-[#1E293B]/80 border border-[#1E293B]">
                Get Started Free
              </Button>
            </Link>
          </div>

          {/* TIER 2 — Early Bird Pro (HIGHLIGHTED) */}
          <div className="relative rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 border-2 border-[#64FFDA]/50 bg-[#0D1117] shadow-lg shadow-[#64FFDA]/10">
            {/* Early Bird Banner */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2"
              style={{
                background: "#064E3B",
                color: "#34D399",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "12px",
                fontWeight: 700,
                whiteSpace: "nowrap",
              }}
            >
              🔥 EARLY BIRD — First 100 users only
            </div>

            <div className="mb-6 mt-2">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: "#64FFDA15" }}
              >
                <Crown className="w-5 h-5 text-[#64FFDA]" />
              </div>
              <h3 className="text-xl font-bold text-white">Early Bird Pro</h3>
              <p className="text-sm text-[#94A3B8] mt-1">
                For serious creators who want real niche intelligence.
              </p>
            </div>

            {/* Price display with strikethrough */}
            <div className="mb-6">
              <div className="flex items-baseline gap-2">
                <span
                  style={{
                    textDecoration: "line-through",
                    color: "#475569",
                    fontSize: "1rem",
                  }}
                >
                  $29
                </span>
                <span
                  style={{
                    color: "#64FFDA",
                    fontSize: "3rem",
                    fontWeight: 800,
                    fontFamily: "var(--font-syne), sans-serif",
                    lineHeight: 1,
                  }}
                >
                  $9
                </span>
                <span style={{ color: "#64748B" }}>/month</span>
              </div>
              <div
                style={{
                  color: "#34D399",
                  fontSize: "0.8rem",
                  marginTop: "4px",
                }}
              >
                🔒 Lock this price forever
              </div>
            </div>

            {/* FIX 4 — Pro features (only live features) */}
            <ul className="space-y-3 mb-4">
              {[
                "Unlimited niche searches",
                "Full niche scoring + filters",
                "Unlimited channel analysis",
                "Claude AI recommendations",
                "Outlier detection alerts",
                "Revenue analytics",
                "Similar channels panel",
                "Priority support",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#64FFDA]" />
                  <span className="text-sm text-[#94A3B8]">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Spots counter */}
            <div
              style={{
                background: "#064E3B",
                border: "1px solid #34D399",
                borderRadius: "8px",
                padding: "8px 16px",
                textAlign: "center",
                fontSize: "13px",
                color: "#34D399",
                marginTop: "12px",
                marginBottom: "16px",
                fontFamily: "var(--font-jetbrains-mono), monospace",
              }}
            >
              ⚡ 94 of 100 Early Bird spots remaining
            </div>

            <Link href="/sign-up">
              <Button className="w-full h-11 font-semibold bg-[#64FFDA] text-[#080B10] hover:bg-[#64FFDA]/90">
                Claim Early Bird →
              </Button>
            </Link>
          </div>

          {/* TIER 3 — Team */}
          <div className="relative rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 border border-[#1E293B] bg-[#0D1117]/60">
            <div className="mb-6">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                style={{ backgroundColor: "#FCD34D15" }}
              >
                <Building2 className="w-5 h-5 text-[#FCD34D]" />
              </div>
              <h3 className="text-xl font-bold text-white">Team</h3>
              <p className="text-sm text-[#94A3B8] mt-1">
                For agencies and multi-channel operations.
              </p>
            </div>

            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold font-mono text-white">
                  $79
                </span>
                <span className="text-sm text-[#94A3B8]">/per month</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8">
              {[
                "Everything in Pro",
                "5 team seats",
                "API access",
                "Bulk channel tracking",
                "White-label reports",
                "Priority support",
                "Custom integrations",
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="w-4 h-4 mt-0.5 shrink-0 text-[#FCD34D]" />
                  <span className="text-sm text-[#94A3B8]">{feature}</span>
                </li>
              ))}
            </ul>

            <a href="mailto:sales@nichepulse.io">
              <Button className="w-full h-11 font-semibold bg-[#1E293B] text-white hover:bg-[#1E293B]/80 border border-[#1E293B]">
                Contact Sales
              </Button>
            </a>
          </div>
        </div>

        {/* Trust line below all cards */}
        <p className="text-center text-sm text-[#64748B] mt-8">
          14-day money-back guarantee · Cancel anytime · Secure payments via
          Stripe
        </p>
      </div>
    </section>
  );
}
