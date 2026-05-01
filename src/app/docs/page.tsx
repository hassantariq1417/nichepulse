import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Documentation — NichePulse" };

export default function DocsPage() {
  return (
    <main style={{ background: "#080B10", minHeight: "100vh", color: "#CBD5E1", fontSize: "16px", lineHeight: 1.8 }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
        <Link href="/" style={{ color: "#64FFDA", textDecoration: "none", fontSize: "14px" }}>← Back to Home</Link>
        <h1 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "2.5rem", fontWeight: 700, margin: "32px 0 16px" }}>Documentation</h1>
        <p style={{ color: "#94A3B8", fontSize: "1.1rem", marginBottom: "32px" }}>Full documentation is coming soon.</p>
        <div style={{ background: "#0D1117", border: "1px solid #1E293B", borderRadius: "12px", padding: "24px" }}>
          <p style={{ color: "#94A3B8" }}>Need help with early access? Email us at{" "}
            <a href="mailto:support@nichepulse.io" style={{ color: "#64FFDA" }}>support@nichepulse.io</a>
          </p>
        </div>
      </div>
    </main>
  );
}
