import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Changelog — NichePulse" };

export default function ChangelogPage() {
  return (
    <main style={{ background: "#080B10", minHeight: "100vh", color: "#CBD5E1", fontSize: "16px", lineHeight: 1.8 }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
        <Link href="/" style={{ color: "#64FFDA", textDecoration: "none", fontSize: "14px" }}>← Back to Home</Link>
        <h1 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "2.5rem", fontWeight: 700, margin: "32px 0 32px" }}>Changelog</h1>

        <div style={{ background: "#0D1117", border: "1px solid #1E293B", borderRadius: "12px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
            <span style={{ background: "#064E3B", color: "#34D399", borderRadius: "6px", padding: "4px 10px", fontSize: "12px", fontWeight: 700 }}>v0.1.0</span>
            <span style={{ color: "#64748B", fontSize: "14px" }}>May 2026</span>
          </div>
          <h3 style={{ color: "#E2E8F0", fontSize: "1.1rem", fontWeight: 600, marginBottom: "8px" }}>Initial Launch</h3>
          <ul style={{ paddingLeft: "20px", color: "#94A3B8" }}>
            <li>Niche Finder live with 15 categories</li>
            <li>Claude AI recommendations active</li>
            <li>210+ channels indexed and scored</li>
            <li>Outlier detection and revenue analytics</li>
            <li>Early Bird pricing launched</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
