import Link from "next/link";
import { ArrowLeft, PenLine } from "lucide-react";

export const metadata = {
  title: "Blog | NichePulse",
  description: "Insights on YouTube growth, niche research, and content strategy.",
};

export default function BlogPage() {
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

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#F472B6]/10 flex items-center justify-center">
            <PenLine className="w-6 h-6 text-[#F472B6]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white font-[family-name:var(--font-syne)]">
              Blog
            </h1>
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-8 mt-8">
          <p className="text-base leading-7">
            Blog launching soon. We&apos;ll be sharing insights on YouTube niche research, content strategy, growth tactics for faceless channels, and behind-the-scenes updates on NichePulse.
          </p>
        </div>
      </div>
    </div>
  );
}
