"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "What exactly is NichePulse?",
    answer:
      "NichePulse is an AI-powered YouTube niche intelligence platform built specifically for faceless channel creators. It helps you discover profitable niches, analyze competitor channels, detect outlier videos, and generate data-driven content strategies — all in one dashboard.",
  },
  {
    question: "How accurate is the data?",
    answer:
      "We scrape real YouTube data via RSS feeds and channel pages. Our database currently tracks 12,800+ channels with 1,744+ videos. Subscriber counts, view counts, and upload frequencies are real — not estimated. NicheScores are calculated using our proprietary algorithm based on growth velocity, competition density, and revenue potential.",
  },
  {
    question: "How does NichePulse compare to NexLev or VidIQ?",
    answer:
      "VidIQ and TubeBuddy are great for optimizing existing channels. NexLev focuses on niche discovery with a Chrome extension. NichePulse is purpose-built for faceless creators who need to find untapped niches before starting a channel. We combine niche scoring, outlier detection, AI recommendations (via Claude), and revenue analytics in one platform — at a fraction of the price.",
  },
  {
    question: "What does the free plan include?",
    answer:
      "The free plan gives you 3 niche searches per day with basic NicheScore data and top 5 results. It's perfect for exploring the platform and getting a feel for our scoring system. Revenue estimates, advanced filters, and AI recommendations are available in the Pro plan.",
  },
  {
    question: "Can I really lock in $9/month forever?",
    answer:
      "Yes. Our Early Bird pricing is available for the first 100 Pro subscribers. Once you lock in at $9/month, that's your price forever — even when we raise prices to $29/month for new users. This is a genuine limited offer.",
  },
  {
    question: "What is a NicheScore?",
    answer:
      "NicheScore is our proprietary rating (0-100) that evaluates a YouTube niche's profitability potential. It factors in growth velocity (how fast channels in the niche are growing), competition density (how saturated it is), revenue potential (CPM and monetization data), and trend direction (whether interest is rising or falling).",
  },
  {
    question: "How does the Claude AI recommendation work?",
    answer:
      "When you analyze a niche, our Claude AI integration reviews the data and generates personalized recommendations including: niche viability assessment, content angle suggestions, optimal posting frequency, thumbnail style recommendations, and competitive gaps you can exploit. It's like having a YouTube strategist on demand.",
  },
  {
    question: "Do I need to install anything?",
    answer:
      "No. NichePulse is a web-based platform. No Chrome extensions, no browser plugins, no downloads. Just sign in and start researching. We're planning a Chrome extension for future releases, but the core platform works in any browser.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. No contracts, no commitments. Cancel with one click from your account settings. We also offer a 14-day money-back guarantee on Pro plans — if you're not satisfied, you get a full refund, no questions asked.",
  },
  {
    question: "Is my data private?",
    answer:
      "Yes. Your niche searches, saved channels, and research data are completely private and never shared with other users. We use Stripe for payment processing and don't store any credit card information on our servers.",
  },
];

function FAQItem({
  faq,
  isOpen,
  onToggle,
}: {
  faq: (typeof faqs)[0];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={`border rounded-xl transition-all duration-300 ${
        isOpen
          ? "border-[#64FFDA]/30 bg-[#0D1117]"
          : "border-[#1E293B] bg-[#0D1117]/40 hover:border-[#1E293B]/80"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left cursor-pointer"
      >
        <span
          className={`text-base font-medium pr-4 transition-colors ${
            isOpen ? "text-white" : "text-[#CBD5E1]"
          }`}
        >
          {faq.question}
        </span>
        <ChevronDown
          className={`w-5 h-5 shrink-0 transition-all duration-300 ${
            isOpen ? "rotate-180 text-[#64FFDA]" : "text-[#64748B]"
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <p className="px-5 pb-5 text-sm text-[#94A3B8] leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </div>
  );
}

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 relative" id="faq">
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-[#64FFDA]/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#64FFDA]/10 border border-[#64FFDA]/20 mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-[#64FFDA]" />
            <span className="text-xs text-[#64FFDA] font-medium uppercase tracking-wider">
              FAQ
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Frequently Asked{" "}
            <span className="text-[#64FFDA]">Questions</span>
          </h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto text-lg">
            Everything you need to know about NichePulse.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, index) => (
            <FAQItem
              key={index}
              faq={faq}
              isOpen={openIndex === index}
              onToggle={() =>
                setOpenIndex(openIndex === index ? null : index)
              }
            />
          ))}
        </div>

        {/* Still have questions? */}
        <div className="text-center mt-12">
          <p className="text-[#64748B] text-sm">
            Still have questions?{" "}
            <a
              href="mailto:support@nichepulse.io"
              className="text-[#64FFDA] hover:underline font-medium"
            >
              Contact our team →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
