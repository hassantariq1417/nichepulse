"use client";

import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Alex Rivera",
    handle: "@alexcreates",
    role: "Faceless Channel · 340K subs",
    avatar: "AR",
    content:
      "NichePulse helped me find an untapped sub-niche in finance that nobody was covering. Went from 0 to 50K subs in 4 months. The outlier detection is insane.",
    color: "#64FFDA",
  },
  {
    name: "Sarah Chen",
    handle: "@sarahbuilds",
    role: "Content Agency · 12 channels",
    avatar: "SC",
    content:
      "We manage 12 faceless channels. Before NichePulse, niche research took 2 weeks per channel. Now it's 30 minutes. The AI recommendations are scarily accurate.",
    color: "#F472B6",
  },
  {
    name: "James Wright",
    handle: "@jameswright",
    role: "Solo Creator · 180K subs",
    avatar: "JW",
    content:
      "The revenue analytics alone are worth the subscription. I can see exactly which niches have the highest CPMs before I commit to creating content. Game changer.",
    color: "#FCD34D",
  },
  {
    name: "Priya Patel",
    handle: "@priyacreates",
    role: "Automation Channel · 95K subs",
    avatar: "PP",
    content:
      "Content Studio generates better titles than I do. My CTR went up 40% after switching to AI-generated titles from NichePulse. The thumbnail suggestions are chef's kiss.",
    color: "#64FFDA",
  },
  {
    name: "Marcus Johnson",
    handle: "@marcusjohnson",
    role: "Finance Niche · 520K subs",
    avatar: "MJ",
    content:
      "I was skeptical about another YouTube tool. But NichePulse actually uses real data, not guesswork. The niche scoring algorithm is the most accurate I've seen.",
    color: "#F472B6",
  },
  {
    name: "Emma Torres",
    handle: "@emmatorres",
    role: "History Channel · 210K subs",
    avatar: "ET",
    content:
      "Found 3 sub-niches in dark history that were completely blue ocean. Zero competition, high CPMs. I'm now making $8K/month from content I love creating.",
    color: "#FCD34D",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 relative overflow-hidden">
      <div className="absolute top-1/2 right-0 w-[300px] h-[300px] bg-[#F472B6]/5 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FCD34D]/10 border border-[#FCD34D]/20 mb-4">
            <Star className="w-3.5 h-3.5 text-[#FCD34D]" />
            <span className="text-xs text-[#FCD34D] font-medium uppercase tracking-wider">
              Testimonials
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Loved by <span className="text-[#FCD34D]">15,000+</span> creators
          </h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto text-lg">
            See why top faceless creators trust NichePulse for their niche research.
          </p>
        </div>

        {/* Testimonial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group rounded-xl border border-[#1E293B] bg-[#0D1117]/60 p-6 hover:border-[#1E293B]/80 transition-all duration-300"
            >
              {/* Quote icon */}
              <Quote
                className="w-8 h-8 mb-4 opacity-20"
                style={{ color: t.color }}
              />

              {/* Content */}
              <p className="text-sm text-[#CBD5E1] leading-relaxed mb-6">
                &ldquo;{t.content}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    backgroundColor: `${t.color}20`,
                    color: t.color,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    {t.name}
                  </div>
                  <div className="text-xs text-[#94A3B8]">{t.role}</div>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mt-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="w-3.5 h-3.5 fill-[#FCD34D] text-[#FCD34D]"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
