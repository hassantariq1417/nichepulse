import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | NichePulse",
  description: "How NichePulse collects, stores, and protects your data.",
};

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-[#94A3B8] mb-12">
          Last updated: May 1, 2026
        </p>

        <div className="space-y-10 text-base leading-7">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              When you use NichePulse, we may collect the following categories of information:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-white">Account Information:</strong> Your name, email address, and avatar when you create an account.
              </li>
              <li>
                <strong className="text-white">Usage Data:</strong> Pages visited, features used, search queries, and interaction patterns within the dashboard.
              </li>
              <li>
                <strong className="text-white">YouTube Public Data:</strong> We access publicly available YouTube data (channel names, subscriber counts, view counts, video metadata) through the YouTube Data API v3. We do not access any private YouTube account data.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              2. How We Store Your Data
            </h2>
            <p className="mb-3">
              Your data is stored securely using industry-standard practices:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>All user and analytics data is stored in a PostgreSQL database hosted on Neon (cloud-managed PostgreSQL).</li>
              <li>Data is encrypted in transit using TLS/SSL and at rest via the hosting provider&apos;s encryption standards.</li>
              <li>We do <strong className="text-white">not</strong> sell, rent, or share your personal data with third parties for marketing purposes.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              3. Cookies &amp; Analytics
            </h2>
            <p>
              NichePulse uses essential cookies to maintain your session and authentication state. We may use privacy-respecting analytics tools to understand aggregate usage patterns. We do not use invasive tracking pixels or sell data to ad networks.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              4. Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-white">Access:</strong> Request a copy of all data we hold about you.</li>
              <li><strong className="text-white">Delete:</strong> Request permanent deletion of your account and all associated data.</li>
              <li><strong className="text-white">Export:</strong> Request an export of your data in a machine-readable format.</li>
              <li><strong className="text-white">Correct:</strong> Update or correct any inaccurate information.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at the email below.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              5. Third-Party Services
            </h2>
            <p>
              We use the following third-party services to operate NichePulse: Vercel (hosting), Neon (database), YouTube Data API v3 (public data), and Google Gemini (AI features). Each provider has their own privacy policies, and we encourage you to review them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              6. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. If we make material changes, we will notify you via email or through the platform. Continued use of NichePulse after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              7. Contact
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at{" "}
              <a href="mailto:privacy@nichepulse.io" className="text-[#64FFDA] hover:underline">
                privacy@nichepulse.io
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
