import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | NichePulse",
  description: "How NichePulse collects, uses, and protects your information.",
};

const sections = [
  {
    title: "1. Introduction",
    content: [
      'NichePulse ("we", "us", "our") operates nichepulse.io.',
      "This policy explains how we collect, use, and protect your information. Last updated: May 2026.",
    ],
  },
  {
    title: "2. Information We Collect",
    items: [
      "Account info: email address, name (via Google OAuth or email signup)",
      "Usage data: searches performed, channels viewed, features used",
      "YouTube public data: we analyze publicly available YouTube channel data (subscriber counts, view counts, upload frequency). We do not access your private YouTube account data.",
      "Payment info: processed by Stripe. We never see or store your credit card details.",
    ],
  },
  {
    title: "3. How We Use Your Information",
    items: [
      "To provide and improve the NichePulse service",
      "To send product updates (you can unsubscribe anytime)",
      "To analyze usage patterns and improve features",
      "We NEVER sell your data to third parties",
    ],
  },
  {
    title: "4. Data Storage",
    items: [
      "Account data stored on Supabase (PostgreSQL)",
      "Servers located in the United States",
      "Data encrypted at rest and in transit",
    ],
  },
  {
    title: "5. Cookies",
    items: [
      "We use essential cookies for authentication only",
      "No advertising cookies",
      "No third-party tracking pixels",
    ],
  },
  {
    title: "6. Your Rights",
    items: [
      "Access your data: email privacy@nichepulse.io",
      "Delete your account: Settings → Delete Account",
      "Export your data: available in Settings",
      "GDPR: EU users have additional rights under GDPR",
    ],
  },
  {
    title: "7. Third-Party Services",
    items: [
      "Clerk (authentication)",
      "Stripe (payments)",
      "Supabase (database)",
      "Anthropic Claude (AI features)",
      "Upstash (caching)",
    ],
    content: ["Each has their own privacy policy."],
  },
  {
    title: "8. Contact",
    content: ["Email: privacy@nichepulse.io"],
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#080B10] text-[#CBD5E1]">
      <div className="mx-auto max-w-[800px] px-6 py-12 sm:py-16">
        <Link
          href="/"
          className="mb-12 inline-flex text-sm font-medium text-[#94A3B8] transition-colors hover:text-[#64FFDA]"
        >
          ← Back to Home
        </Link>

        <header className="mb-12">
          <h1 className="font-[family-name:var(--font-syne)] text-4xl font-bold tracking-tight text-[#64FFDA] sm:text-5xl">
            Privacy Policy
          </h1>
        </header>

        <div className="space-y-10 text-base leading-[1.8]">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-4 font-[family-name:var(--font-syne)] text-2xl font-semibold text-[#64FFDA]">
                {section.title}
              </h2>

              {section.content?.map((paragraph) => (
                <p key={paragraph} className="mb-3">
                  {paragraph}
                </p>
              ))}

              {section.items && (
                <ul className="list-disc space-y-2 pl-6">
                  {section.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
