import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";

export const metadata = {
  title: "Documentation | NichePulse",
  description: "NichePulse documentation and guides.",
};

export default function DocsPage() {
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
          <div className="w-12 h-12 rounded-xl bg-[#64FFDA]/10 flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-[#64FFDA]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white font-[family-name:var(--font-syne)]">
              Documentation
            </h1>
          </div>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-8 mt-8">
          <p className="text-base leading-7 mb-4">
            Full documentation is coming soon. We&apos;re working on comprehensive guides covering niche research, channel analysis, content generation, and API usage.
          </p>
          <p className="text-base leading-7">
            In the meantime, if you need help or have questions about NichePulse, email us at{" "}
            <a href="mailto:hello@nichepulse.io" className="text-[#64FFDA] hover:underline">
              hello@nichepulse.io
            </a>{" "}
            for early access support.
          </p>
        </div>
      </div>
    </div>
  );
}
