import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";

export const metadata = {
  title: "Careers | NichePulse",
  description: "Join the NichePulse team.",
};

export default function CareersPage() {
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
          Careers
        </h1>

        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-8 mt-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#F472B6]/10 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#F472B6]" />
            </div>
            <h2 className="text-lg font-semibold text-white">We&apos;re a small team</h2>
          </div>
          <p className="text-base leading-7 mb-4">
            NichePulse is currently a lean, focused team building fast. We don&apos;t have formal open positions listed yet, but we&apos;re always interested in hearing from talented people who are passionate about YouTube, data, and AI.
          </p>
          <p className="text-base leading-7">
            Interested? Send us an email at{" "}
            <a href="mailto:hello@nichepulse.io" className="text-[#64FFDA] hover:underline">
              hello@nichepulse.io
            </a>{" "}
            with a bit about yourself and what you&apos;d like to work on.
          </p>
        </div>
      </div>
    </div>
  );
}
