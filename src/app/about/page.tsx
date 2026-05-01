import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About — NichePulse" };

export default function AboutPage() {
  return (
    <main style={{ background: "#080B10", minHeight: "100vh", color: "#CBD5E1", fontSize: "16px", lineHeight: 1.8 }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
        <Link href="/" style={{ color: "#64FFDA", textDecoration: "none", fontSize: "14px" }}>← Back to Home</Link>
        <h1 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "2.5rem", fontWeight: 700, margin: "32px 0 16px" }}>About NichePulse</h1>
        <p style={{ color: "#94A3B8", fontSize: "1.1rem", marginBottom: "24px" }}>
          NichePulse is an AI-powered YouTube niche intelligence platform for faceless creators. We help you discover profitable niches, analyze competitor channels, and score opportunities — all with real data.
        </p>
        <p style={{ color: "#94A3B8", fontSize: "1.1rem", marginBottom: "24px" }}>
          Currently in early access. Built by creators, for creators.
        </p>
        <div style={{ background: "#0D1117", border: "1px solid #1E293B", borderRadius: "12px", padding: "24px", display: "flex", gap: "32px", flexWrap: "wrap" }}>
          {[
            { num: "210+", label: "Channels Indexed" },
            { num: "15", label: "Niche Categories" },
            { num: "97.6", label: "Top NicheScore" },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", color: "#64FFDA", fontSize: "1.5rem", fontWeight: 700 }}>{s.num}</div>
              <div style={{ color: "#64748B", fontSize: "0.8rem" }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
