import Link from "next/link";

export const metadata = {
  title: "Terms of Service | NichePulse",
  description: "Terms and conditions for using the NichePulse platform.",
};

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: [
      "By using NichePulse you agree to these terms.",
      "If you don't agree, don't use the service.",
    ],
  },
  {
    title: "2. Description of Service",
    content: [
      "NichePulse provides YouTube niche research and analytics tools for content creators. We analyze publicly available YouTube data to provide niche scoring and recommendations.",
    ],
  },
  {
    title: "3. User Accounts",
    items: [
      "You must provide accurate information when signing up",
      "You are responsible for your account security",
      "One account per person",
      "You must be 16+ to use NichePulse",
    ],
  },
  {
    title: "4. Acceptable Use",
    content: ["You may NOT:"],
    items: [
      "Resell or redistribute NichePulse data",
      "Use the service to spam or harass other creators",
      "Attempt to scrape or extract our database",
      "Use automated tools to abuse the service",
      "Misrepresent our data as your own proprietary research",
    ],
  },
  {
    title: "5. Subscription and Billing",
    items: [
      "Pro plan billed monthly or annually",
      "Cancel anytime — access continues until end of period",
      "14-day refund policy: email support@nichepulse.io",
      "Prices may change with 30 days notice to existing users",
      "Early Bird pricing is locked for life for qualifying users",
    ],
  },
  {
    title: "6. Data and Accuracy",
    items: [
      "YouTube data is sourced from public sources",
      "Revenue estimates are approximations, not guarantees",
      "NicheScores are algorithmic estimates, not financial advice",
      "We do not guarantee any channel growth or income results",
    ],
  },
  {
    title: "7. Intellectual Property",
    items: [
      "NichePulse owns the platform, design, and algorithms",
      "You own any content you create using our tools",
      "Our data may not be redistributed without permission",
    ],
  },
  {
    title: "8. Limitation of Liability",
    content: [
      "NichePulse is not liable for any business decisions made based on our data. Use insights as one of many inputs, not as sole decision-making criteria.",
    ],
  },
  {
    title: "9. Termination",
    content: [
      "We may suspend accounts that violate these terms.",
      "You may delete your account at any time in Settings.",
    ],
  },
  {
    title: "10. Contact",
    content: ["support@nichepulse.io"],
  },
];

export default function TermsPage() {
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
            Terms of Service
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
