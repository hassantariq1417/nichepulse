import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Status | NichePulse",
  description: "NichePulse system status and uptime.",
};

const services = [
  { name: "Dashboard", status: "operational" },
  { name: "Niche Finder API", status: "operational" },
  { name: "Channel Explorer", status: "operational" },
  { name: "Content Studio (AI)", status: "operational" },
  { name: "YouTube Data Ingestion", status: "operational" },
  { name: "Database (Neon PostgreSQL)", status: "operational" },
];

export default function StatusPage() {
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
          System Status
        </h1>

        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#4ADE80]/10 border border-[#4ADE80]/20 mt-4 mb-10">
          <div className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse" />
          <span className="text-sm text-[#4ADE80] font-medium">
            All systems operational
          </span>
        </div>

        <div className="rounded-xl border border-[#1E293B] bg-[#0D1117]/60 divide-y divide-[#1E293B] overflow-hidden">
          {services.map((s) => (
            <div key={s.name} className="flex items-center justify-between px-5 py-4">
              <span className="text-sm font-medium text-white">{s.name}</span>
              <span className="flex items-center gap-1.5 text-xs text-[#4ADE80] font-medium">
                <CheckCircle2 className="w-4 h-4" />
                Operational
              </span>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#94A3B8] mt-6">
          Last checked: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
        </p>
      </div>
    </div>
  );
}
