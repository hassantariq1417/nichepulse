import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "System Status — NichePulse" };

const services = [
  { name: "API", status: "Operational" },
  { name: "Database", status: "Operational" },
  { name: "AI Features", status: "Operational" },
  { name: "Auth", status: "Operational" },
];

export default function StatusPage() {
  return (
    <main style={{ background: "#080B10", minHeight: "100vh", color: "#CBD5E1", fontSize: "16px", lineHeight: 1.8 }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
        <Link href="/" style={{ color: "#64FFDA", textDecoration: "none", fontSize: "14px" }}>← Back to Home</Link>
        <h1 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "2.5rem", fontWeight: 700, margin: "32px 0 16px" }}>System Status</h1>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px", background: "#0D1117", border: "1px solid #1E293B", borderRadius: "12px", padding: "20px 24px" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px #34D399" }} />
          <span style={{ color: "#E2E8F0", fontSize: "1.1rem", fontWeight: 600 }}>All systems operational</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {services.map((s) => (
            <div key={s.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#0D1117", border: "1px solid #1E293B", borderRadius: "8px", padding: "16px 20px" }}>
              <span style={{ color: "#E2E8F0", fontWeight: 500 }}>{s.name}</span>
              <span style={{ display: "flex", alignItems: "center", gap: "8px", color: "#34D399", fontSize: "14px", fontWeight: 600 }}>
                ✅ {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
