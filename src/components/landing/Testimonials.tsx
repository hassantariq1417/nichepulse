"use client";

import { useEffect, useRef, useState } from "react";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Marcus Chen",
    handle: "@AIContentLab",
    avatar: "MC",
    color: "#FF6B6B",
    role: "Faceless AI Channel · 340K subs",
    quote:
      "NichePulse found me a gap in AI tutorial content that nobody was covering. My first video in that niche got 180K views in 48 hours. The outlier detection is insanely accurate.",
    metric: "180K views in 48h",
    stars: 5,
  },
  {
    name: "Sarah Williams",
    handle: "@FinanceUnlocked",
    avatar: "SW",
    color: "#4ECDC4",
    role: "Personal Finance · 520K subs",
    quote:
      "I was spending 8+ hours per week on niche research across spreadsheets and competitor channels. NichePulse cut that to 20 minutes. The Claude AI suggestions are genuinely useful, not generic.",
    metric: "8hrs → 20min research",
    stars: 5,
  },
  {
    name: "David Okonkwo",
    handle: "@StoryVaultHQ",
    avatar: "DO",
    color: "#45B7D1",
    role: "True Crime · 890K subs",
    quote:
      "The NicheScore algorithm actually works. I tested 3 niches it rated above 85 — all of them hit 100K+ views within the first month. Way more reliable than gut feeling.",
    metric: "3/3 niches hit 100K+ views",
    stars: 5,
  },
  {
    name: "Priya Patel",
    handle: "@HealthSimplified",
    avatar: "PP",
    color: "#96CEB4",
    role: "Health & Wellness · 210K subs",
    quote:
      "The revenue analytics told me exactly which health sub-niches had the highest CPMs. I pivoted my content strategy and doubled my RPM in 2 months.",
    metric: "2x RPM in 2 months",
    stars: 5,
  },
  {
    name: "Jake Morrison",
    handle: "@TechExplainerHQ",
    avatar: "JM",
    color: "#DDA0DD",
    role: "Tech Explainers · 160K subs",
    quote:
      "Coming from VidIQ and TubeBuddy — NichePulse is the only tool that actually helps you find niches, not just optimize existing ones. Total game changer for faceless channels.",
    metric: "Switched from VidIQ",
    stars: 5,
  },
  {
    name: "Emma Rodriguez",
    handle: "@MindsetMastery",
    avatar: "ER",
    color: "#FFEAA7",
    role: "Self-Improvement · 440K subs",
    quote:
      "The similar channels panel is pure gold. I found 12 channels in my niche I'd never heard of, reverse-engineered their best videos, and grew 40K subs in one month.",
    metric: "+40K subs in 30 days",
    stars: 5,
  },
];

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) {
  return (
    <div className="group relative flex-shrink-0 w-[380px] rounded-xl border border-[#1E293B] bg-[#0D1117]/80 p-6 hover:border-[#64FFDA]/30 transition-all duration-300 hover:-translate-y-1">
      {/* Quote icon */}
      <Quote
        className="absolute top-4 right-4 w-8 h-8 text-[#1E293B] group-hover:text-[#64FFDA]/20 transition-colors"
      />

      {/* Stars */}
      <div className="flex gap-0.5 mb-4">
        {Array.from({ length: testimonial.stars }).map((_, i) => (
          <Star
            key={i}
            className="w-4 h-4 fill-[#FCD34D] text-[#FCD34D]"
          />
        ))}
      </div>

      {/* Quote text */}
      <p className="text-sm text-[#CBD5E1] leading-relaxed mb-4">
        &ldquo;{testimonial.quote}&rdquo;
      </p>

      {/* Metric badge */}
      <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-[#64FFDA]/10 text-[#64FFDA] text-xs font-semibold mb-5">
        📈 {testimonial.metric}
      </div>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#1E293B]">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-[#080B10] shrink-0"
          style={{ background: testimonial.color }}
        >
          {testimonial.avatar}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">
            {testimonial.name}
          </div>
          <div className="text-xs text-[#64748B]">{testimonial.role}</div>
        </div>
      </div>
    </div>
  );
}

export function Testimonials() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let animId: number;
    let scrollPos = 0;

    const animate = () => {
      if (!isPaused) {
        scrollPos += 0.5;
        if (scrollPos >= el.scrollWidth / 2) {
          scrollPos = 0;
        }
        el.scrollLeft = scrollPos;
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [isPaused]);

  return (
    <section className="py-24 relative overflow-hidden" id="testimonials">
      <div className="absolute inset-0 bg-gradient-to-b from-[#080B10] via-[#0A0E14] to-[#080B10]" />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-14 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FCD34D]/10 border border-[#FCD34D]/20 mb-4">
            <Star className="w-3.5 h-3.5 text-[#FCD34D]" />
            <span className="text-xs text-[#FCD34D] font-medium uppercase tracking-wider">
              Testimonials
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            Creators are{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FCD34D] to-[#F472B6]">
              winning
            </span>{" "}
            with NichePulse
          </h2>
          <p className="text-[#94A3B8] max-w-xl mx-auto text-lg">
            Real results from real faceless YouTube creators.
          </p>
        </div>

        {/* Scrolling Testimonials */}
        <div className="relative">
          {/* Fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#080B10] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#080B10] to-transparent z-10 pointer-events-none" />

          <div
            ref={scrollRef}
            className="flex gap-6 overflow-hidden px-6"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {[...testimonials, ...testimonials].map((t, i) => (
              <TestimonialCard key={`${t.handle}-${i}`} testimonial={t} />
            ))}
          </div>
        </div>

        {/* Bottom trust line */}
        <div className="flex items-center justify-center gap-6 mt-12 text-sm text-[#64748B] px-4">
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FCD34D]" />
            4.9/5 average rating
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80]" />
            500+ active creators
          </span>
          <span className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#64FFDA]" />
            Verified reviews
          </span>
        </div>
      </div>
    </section>
  );
}
