import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — NichePulse",
  description: "NichePulse privacy policy. Learn how we handle your data.",
};

export default function PrivacyPage() {
  return (
    <main
      style={{
        background: "#080B10",
        minHeight: "100vh",
        color: "#CBD5E1",
        fontSize: "16px",
        lineHeight: 1.8,
      }}
    >
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "60px 24px" }}>
        <Link
          href="/"
          style={{ color: "#64FFDA", textDecoration: "none", fontSize: "14px" }}
        >
          ← Back to Home
        </Link>

        <h1
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            color: "#64FFDA",
            fontSize: "2.5rem",
            fontWeight: 700,
            margin: "32px 0 8px",
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ color: "#64748B", fontSize: "14px", marginBottom: "48px" }}>
          Last updated: May 2026
        </p>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}>1. Introduction</h2>
          <p>NichePulse is an AI-powered YouTube niche intelligence platform for faceless creators. This policy explains how we collect, use, and protect your information when you use our service.</p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}>2. Information We Collect</h2>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Email and name provided during signup</li>
            <li>Usage data — searches performed, features used</li>
            <li>Public YouTube data only — we never access private account information</li>
            <li>Payments are processed via Stripe — we never see or store your card details</li>
          </ul>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}>3. How We Use It</h2>
          <p>We use your data to improve the service, send product updates, and personalize your experience. We never sell your data to third parties.</p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}>4. Data Storage</h2>
          <p>Your data is stored on Supabase-hosted servers in the United States. All data is encrypted at rest and in transit.</p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}>5. Cookies</h2>
          <p>We use cookies for authentication only. We do not use advertising or tracking cookies.</p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}>6. Your Rights</h2>
          <p>You have the right to access, delete, or export your data at any time via your account settings.</p>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}>7. Third-Party Services</h2>
          <p>We use the following third-party services:</p>
          <ul style={{ paddingLeft: "20px" }}>
            <li>Clerk — Authentication</li>
            <li>Stripe — Payment processing</li>
            <li>Supabase — Database hosting</li>
            <li>Anthropic — AI recommendations (Claude)</li>
            <li>Upstash — Caching and rate limiting</li>
          </ul>
        </section>

        <section style={{ marginBottom: "40px" }}>
          <h2 style={{ fontFamily: "var(--font-syne), sans-serif", color: "#64FFDA", fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}>8. Contact</h2>
          <p>For privacy inquiries, email us at{" "}<a href="mailto:privacy@nichepulse.io" style={{ color: "#64FFDA" }}>privacy@nichepulse.io</a></p>
        </section>
      </div>
    </main>
  );
}
