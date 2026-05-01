"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Check, Zap, Crown, Building2 } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "0",
    period: "forever",
    description: "Perfect for exploring niches and getting started.",
    icon: Zap,
    color: "#64FFDA",
    popular: false,
    features: [
      "5 niche searches / day",
      "Basic niche scoring",
      "Top 10 channel results",
      "Limited AI recommendations",
      "Community access",
    ],
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    price: "29",
    period: "per month",
    description: "For serious creators who want real niche intelligence.",
    icon: Crown,
    color: "#F472B6",
    popular: true,
    features: [
      "Unlimited niche searches",
      "Full niche scoring + all filters",
      "Unlimited channel analysis",
      "AI-powered niche recommendations (beta)",
      "Outlier detection alerts",
      "Revenue analytics",
      "Similar channels panel",
      "Priority support",
    ],
    cta: "Start Pro Trial",
  },
  {
    name: "Team",
    price: "79",
    period: "per month",
    description: "For agencies and multi-channel operations.",
    icon: Building2,
    color: "#FCD34D",
    popular: false,
    features: [
      "Everything in Pro",
      "5 team seats",
      "API access",
      "Bulk channel tracking",
      "White-label reports",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Contact Sales",
  },
];

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
            Start free, <span className="text-[#64FFDA]">scale</span> when ready
          </h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto text-lg">
            No credit card required. Upgrade or downgrade anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? "border-2 border-[#F472B6]/50 bg-[#0D1117] shadow-lg shadow-[#F472B6]/10"
                  : "border border-[#1E293B] bg-[#0D1117]/60"
              }`}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#F472B6] text-[#080B10] text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}

              {/* Plan header */}
              <div className="mb-6">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: `${plan.color}15` }}
                >
                  <plan.icon className="w-5 h-5" style={{ color: plan.color }} />
                </div>
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <p className="text-sm text-[#94A3B8] mt-1">{plan.description}</p>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold font-mono text-white">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-[#94A3B8]">/{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check
                      className="w-4 h-4 mt-0.5 shrink-0"
                      style={{ color: plan.color }}
                    />
                    <span className="text-sm text-[#94A3B8]">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link href="/sign-up">
                <Button
                  className={`w-full h-11 font-semibold ${
                    plan.popular
                      ? "bg-[#F472B6] text-white hover:bg-[#F472B6]/90"
                      : "bg-[#1E293B] text-white hover:bg-[#1E293B]/80 border border-[#1E293B]"
                  }`}
                >
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
