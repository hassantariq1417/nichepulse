"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  {
    value: "210+",
    label: "YouTube Channels Indexed",
  },
  {
    value: "15",
    label: "Niche Categories Tracked",
  },
  {
    value: "97.6",
    label: "Highest NicheScore Found",
  },
];

export function EarlyAccess() {
  return (
    <section id="early-access" className="relative overflow-hidden bg-[radial-gradient(circle_at_center,#0D1117_0%,#080B10_68%)] py-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#64FFDA]/30 to-transparent" />
      <div className="absolute left-1/2 top-1/2 h-[360px] w-[360px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#64FFDA]/5 blur-[120px]" />

      <div className="container relative z-10 mx-auto px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Built for serious faceless creators
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[#94A3B8] sm:text-lg">
            NichePulse is in early access. Real data, real scores, no fluff.
            Be one of the first 100 creators to get Pro access at our launch
            price.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-[#1E293B] bg-[#0D1117]/90 px-6 py-8 shadow-2xl shadow-black/20 backdrop-blur"
            >
              <div className="font-mono text-4xl font-bold tabular-nums text-[#64FFDA] sm:text-5xl">
                {stat.value}
              </div>
              <div className="mt-3 text-sm font-medium text-[#64748B]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10">
          <Link href="/sign-up">
            <Button
              size="lg"
              className="h-12 bg-[#64FFDA] px-8 text-base font-semibold text-[#080B10] hover:bg-[#64FFDA]/90"
            >
              Claim Early Access
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
