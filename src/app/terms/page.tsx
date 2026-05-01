import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | NichePulse",
  description: "Terms and conditions for using the NichePulse platform.",
};

export default function TermsPage() {
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
          Terms of Service
        </h1>
        <p className="text-sm text-[#94A3B8] mb-12">
          Last updated: May 1, 2026
        </p>

        <div className="space-y-10 text-base leading-7">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using NichePulse (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the Service. NichePulse reserves the right to update these terms at any time, with notice provided through the platform or via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              2. Acceptable Use
            </h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use automated scripts, bots, or scrapers to extract data from NichePulse beyond the provided API or dashboard interface.</li>
              <li>Resell, redistribute, or sublicense any data, insights, or analytics obtained through the platform.</li>
              <li>Attempt to reverse-engineer, decompile, or exploit the platform&apos;s algorithms or scoring systems.</li>
              <li>Use the Service for any illegal purpose or in violation of YouTube&apos;s Terms of Service.</li>
              <li>Create multiple free accounts to circumvent usage limits.</li>
            </ul>
            <p className="mt-3">
              Violation of these terms may result in immediate account suspension or termination without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              3. Subscriptions &amp; Billing
            </h2>
            <p className="mb-3">
              NichePulse offers both free and paid subscription plans. For paid plans:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Subscriptions are billed monthly or annually, as selected at checkout.</li>
              <li>You may cancel your subscription at any time. Cancellation takes effect at the end of the current billing period.</li>
              <li>No prorated refunds are issued for partial billing periods.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              4. Refund Policy
            </h2>
            <p>
              We offer a <strong className="text-white">14-day money-back guarantee</strong> on all paid plans. If you are unsatisfied with the Service within the first 14 days of your paid subscription, contact us at{" "}
              <a href="mailto:support@nichepulse.io" className="text-[#64FFDA] hover:underline">
                support@nichepulse.io
              </a>{" "}
              for a full refund. After 14 days, all charges are non-refundable.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              5. Disclaimer of Warranties
            </h2>
            <p>
              NichePulse provides data, analytics, and AI-generated recommendations for informational purposes only. We make <strong className="text-white">no guarantees</strong> of YouTube success, revenue generation, subscriber growth, or any specific outcome from using the Service. All niche scores, revenue estimates, and growth projections are approximations based on publicly available data and should not be treated as financial advice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              6. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by law, NichePulse and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service, including but not limited to loss of revenue, data, or business opportunity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              7. Intellectual Property
            </h2>
            <p>
              All content, branding, algorithms, and design elements of NichePulse are the intellectual property of NichePulse and its licensors. You may not copy, reproduce, or distribute any part of the Service without prior written consent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              8. Governing Law
            </h2>
            <p>
              These Terms of Service shall be governed by and construed in accordance with the laws of the State of Delaware, United States, without regard to its conflict of law provisions. Any disputes arising under these terms shall be subject to the exclusive jurisdiction of the courts located in Delaware.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3 font-[family-name:var(--font-syne)]">
              9. Contact
            </h2>
            <p>
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:support@nichepulse.io" className="text-[#64FFDA] hover:underline">
                support@nichepulse.io
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
