import Link from "next/link";
import { ArrowLeft, Tag } from "lucide-react";

export const metadata = {
  title: "Changelog | NichePulse",
  description: "What's new in NichePulse — release notes and updates.",
};

export default function ChangelogPage() {
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

        <h1 className="text-4xl font-bold text-white mb-2 font-[family-name:var(--font-syne)]">
          Changelog
        </h1>
        <p className="text-sm text-[#94A3B8] mb-12">
          All notable updates to NichePulse.
        </p>

        <div className="space-y-8">
          <div className="relative pl-8 border-l-2 border-[#1E293B]">
            <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[#4ADE80] border-2 border-[#080B10]" />
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#4ADE80]/10 text-[#4ADE80] text-xs font-semibold">
                <Tag className="w-3 h-3" />
                v0.1
              </span>
              <span className="text-xs text-[#94A3B8]">May 1, 2026</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Initial Launch</h3>
            <ul className="space-y-1.5 text-sm leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#4ADE80] mt-0.5">•</span>
                Niche Finder live with 15 indexed niches and real-time scoring
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4ADE80] mt-0.5">•</span>
                AI-powered niche recommendations active via Gemini
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4ADE80] mt-0.5">•</span>
                Channel Explorer with 210+ tracked channels
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4ADE80] mt-0.5">•</span>
                Content Studio with title, description, and hook generators
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#4ADE80] mt-0.5">•</span>
                YouTube Data ingestion pipeline for live data refresh
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
