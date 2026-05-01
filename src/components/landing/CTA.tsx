"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

/* ── FIX 9 — Updated CTA copy ───────────────────────────────── */

export function CTA() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-2xl border border-[#1E293B] bg-[#0D1117] overflow-hidden">
          {/* Background effects */}
          <div className="absolute top-0 left-1/4 w-[400px] h-[200px] bg-[#64FFDA]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-[#F472B6]/10 rounded-full blur-[100px]" />

          <div className="relative z-10 px-6 sm:px-12 py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#64FFDA]/10 border border-[#64FFDA]/20 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-[#64FFDA]" />
              <span className="text-xs text-[#64FFDA] font-medium">
                No credit card required
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Ready to find your{" "}
              <span className="text-[#64FFDA]">winning niche</span>?
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto text-lg mb-8">
              Join the early access list. Start with 3 free searches per day.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="bg-[#64FFDA] text-[#080B10] hover:bg-[#64FFDA]/90 font-semibold text-base px-8 h-12 gap-2 group"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Trust signals */}
            <div className="flex items-center justify-center gap-6 mt-8 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                Free forever plan
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
                Cancel anytime
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
