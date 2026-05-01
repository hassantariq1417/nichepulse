import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Blog — NichePulse" };

export default function BlogPage() {
  return (
    <main style={{ background: "#080B10", minHeight: "100vh", color: "#CBD5E1", fontSize: "16px", lineHeight: 1.8 }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
        <Link href="/" style={{ color: "#64FFDA", textDecoration: "none", fontSize: "14px" }}>← Back to Home</Link>
        <h1 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "2.5rem", fontWeight: 700, margin: "32px 0 16px" }}>Blog</h1>
        <p style={{ color: "#94A3B8", fontSize: "1.1rem", marginBottom: "32px" }}>Blog launching soon. Stay tuned for niche research tips, creator strategies, and platform updates.</p>
        <div style={{ background: "#0D1117", border: "1px solid #1E293B", borderRadius: "12px", padding: "24px" }}>
          <p style={{ color: "#94A3B8", marginBottom: "16px" }}>Get notified when we publish:</p>
          <div style={{ display: "flex", gap: "8px" }}>
            <input type="email" placeholder="your@email.com" style={{ flex: 1, height: "40px", padding: "0 12px", borderRadius: "8px", background: "#080B10", border: "1px solid #1E293B", color: "#E2E8F0", fontSize: "14px", outline: "none" }} />
            <button style={{ background: "#64FFDA", color: "#080B10", padding: "0 20px", borderRadius: "8px", fontWeight: 700, fontSize: "14px", border: "none", cursor: "pointer" }}>Notify Me</button>
          </div>
        </div>
      </div>
    </main>
  );
}
