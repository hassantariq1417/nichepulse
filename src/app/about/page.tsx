import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

export const metadata = {
  title: "About | NichePulse",
  description: "About NichePulse — AI-powered YouTube niche intelligence.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#080B10] text-[#CBD5E1]">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#64FFDA] transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#64FFDA] to-[#64FFDA]/60 flex items-center justify-center">
            <Zap className="w-6 h-6 text-[#080B10]" />
          </div>
          <h1 className="text-4xl font-bold text-white font-[family-name:var(--font-syne)]">
            About NichePulse
          </h1>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-8">
          <div className="space-y-6 text-base leading-7">
            <p>
              NichePulse is an AI-powered intelligence platform built specifically for faceless YouTube creators. We analyze publicly available YouTube data to help creators discover profitable niches, identify outlier channels, estimate revenue potential, and generate content ideas — all from a single dashboard.
            </p>
            <p>
              We&apos;re currently in <strong className="text-white">early access</strong>. Our platform tracks 210+ channels across 15 high-growth niches with over 1,000 video data points, and we&apos;re expanding every week.
            </p>
            <p>
              NichePulse was built because we believe niche selection is the single most important decision a faceless creator makes — and most people get it wrong because they rely on gut feeling instead of data. We&apos;re here to change that.
            </p>
            <p>
              Questions? Reach out at{" "}
              <a href="mailto:hello@nichepulse.io" className="text-[#64FFDA] hover:underline">
                hello@nichepulse.io
              </a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
