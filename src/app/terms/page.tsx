import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — NichePulse",
  description: "NichePulse terms of service.",
};

export default function TermsPage() {
  const sectionStyle = { marginBottom: "40px" as const };
  const h2Style = {
    fontFamily: "var(--font-syne), sans-serif",
    color: "#64FFDA",
    fontSize: "1.25rem" as const,
    fontWeight: 700 as const,
    marginBottom: "12px",
  };

  return (
    <main style={{ background: "#080B10", minHeight: "100vh", color: "#CBD5E1", fontSize: "16px", lineHeight: 1.8 }}>
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
        <Link href="/" style={{ color: "#64FFDA", textDecoration: "none", fontSize: "14px" }}>← Back to Home</Link>

        <h1 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "2.5rem", fontWeight: 700, margin: "32px 0 8px" }}>Terms of Service</h1>
        <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "48px" }}>Last updated: May 2026</p>

        <section style={sectionStyle}>
          <h2 style={h2Style}>1. Acceptance of Terms</h2>
          <p>By accessing or using NichePulse, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>2. Description of Service</h2>
          <p>NichePulse is a YouTube niche research tool that analyzes publicly available data to help creators find profitable niches. We only access public YouTube data — we never access private account information.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>3. User Accounts</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>You must provide accurate information during registration</li>
            <li>You must be at least 16 years old to use the service</li>
            <li>One account per person</li>
            <li>You are responsible for maintaining the security of your account</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>4. Acceptable Use</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>No reselling NichePulse data</li>
            <li>No scraping our database</li>
            <li>No spamming or abusing the platform</li>
            <li>No using the service for illegal purposes</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>5. Billing</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Cancel anytime — no long-term commitments</li>
            <li>14-day refund policy for paid plans</li>
            <li>Email <a href="mailto:support@nichepulse.io" style={{ color: "#64FFDA" }}>support@nichepulse.io</a> for billing issues</li>
            <li>Early Bird pricing is locked for the lifetime of your subscription</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>6. Data Accuracy</h2>
          <p>All niche scores, revenue estimates, and analytics are estimates only. NichePulse is not financial advice. We make no income guarantees.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>7. Intellectual Property</h2>
          <p>We own the NichePulse platform, its design, and algorithms. You own your content and any data you generate or export.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>8. Limitation of Liability</h2>
          <p>NichePulse is provided &quot;as is&quot; without warranty. We are not liable for any damages arising from your use of the service, including but not limited to lost profits or data.</p>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>9. Termination</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>We may suspend or terminate accounts that violate these terms</li>
            <li>You can delete your account at any time</li>
            <li>Upon termination, your data will be deleted within 30 days</li>
          </ul>
        </section>

        <section style={sectionStyle}>
          <h2 style={h2Style}>10. Contact</h2>
          <p>For questions about these terms, email <a href="mailto:support@nichepulse.io" style={{ color: "#64FFDA" }}>support@nichepulse.io</a></p>
        </section>
      </div>
    </main>
  );
}
