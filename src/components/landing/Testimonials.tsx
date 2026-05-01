"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap } from "lucide-react";

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-[#F472B6]/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="relative rounded-2xl border border-[#1E293B] bg-[#0D1117] overflow-hidden max-w-3xl mx-auto">
          {/* Background effects */}
          <div className="absolute top-0 left-1/4 w-[300px] h-[150px] bg-[#64FFDA]/8 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 right-1/4 w-[200px] h-[150px] bg-[#F472B6]/8 rounded-full blur-[80px]" />

          <div className="relative z-10 px-6 sm:px-12 py-16 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#64FFDA]/10 border border-[#64FFDA]/20 mb-6">
              <Zap className="w-3.5 h-3.5 text-[#64FFDA]" />
              <span className="text-xs text-[#64FFDA] font-medium uppercase tracking-wider">
                Early Access
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Built for serious{" "}
              <span className="text-[#64FFDA]">faceless creators</span>
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto text-lg mb-8">
              NichePulse is in early access. Be among the first creators to use
              real AI-powered niche intelligence.
            </p>

            <Link href="/sign-up">
              <Button
                size="lg"
                className="bg-[#64FFDA] text-[#080B10] hover:bg-[#64FFDA]/90 font-semibold text-base px-8 h-12 gap-2 group"
              >
                Get Early Access
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
