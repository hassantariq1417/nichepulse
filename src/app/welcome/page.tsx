"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, Check } from "lucide-react";

const goals = [
  { id: "first-channel", emoji: "🚀", title: "Start my first faceless channel", desc: "I'm new and want to find the right niche" },
  { id: "scale", emoji: "📈", title: "Scale an existing channel", desc: "I have a channel and want to grow faster" },
  { id: "agency", emoji: "🏢", title: "Manage multiple channels / agency", desc: "I run or manage several channels" },
  { id: "research", emoji: "🔬", title: "Research niches before committing", desc: "I want to explore before I start" },
];

const niches = [
  { id: "finance", label: "Finance & Investing", emoji: "💰" },
  { id: "ai-tech", label: "AI & Tech", emoji: "🤖" },
  { id: "dark-history", label: "Dark History", emoji: "🏛️" },
  { id: "fitness", label: "Fitness & Health", emoji: "💪" },
  { id: "true-crime", label: "True Crime", emoji: "🔍" },
  { id: "motivation", label: "Motivation", emoji: "🧠" },
  { id: "real-estate", label: "Real Estate", emoji: "🏠" },
  { id: "gaming", label: "Gaming", emoji: "🎮" },
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "crypto", label: "Crypto & Web3", emoji: "⛓️" },
  { id: "travel", label: "Travel", emoji: "✈️" },
  { id: "cooking", label: "Cooking", emoji: "🍳" },
];

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);

  // If already onboarded, redirect
  useEffect(() => {
    if (typeof window !== "undefined") {
      const onboarded = localStorage.getItem("nichepulse_onboarded");
      if (onboarded === "true") {
        router.replace("/dashboard");
      }
    }
  }, [router]);

  const toggleNiche = (id: string) => {
    setSelectedNiches((prev) => {
      if (prev.includes(id)) return prev.filter((n) => n !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const completeOnboarding = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("nichepulse_onboarded", "true");
      localStorage.setItem("nichepulse_goal", selectedGoal || "");
      localStorage.setItem("nichepulse_niches", JSON.stringify(selectedNiches));
    }
    router.push("/dashboard?onboarded=true");
  };

  return (
    <div className="min-h-screen bg-[#080B10] flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#64FFDA]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-[#F472B6]/5 rounded-full blur-[100px]" />

      {/* Logo */}
      <div className="flex items-center gap-2 mb-10 relative z-10">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#64FFDA] to-[#64FFDA]/60 flex items-center justify-center">
          <Zap className="w-5 h-5 text-[#080B10]" />
        </div>
        <span className="text-xl font-bold">
          <span className="text-[#64FFDA]">Niche</span>
          <span className="text-white">Pulse</span>
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-md mb-8 relative z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#94A3B8]">Step {step} of 3</span>
          <span className="text-xs text-[#94A3B8]">{Math.round((step / 3) * 100)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-[#1E293B] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#64FFDA] to-[#22D3EE] transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-xl relative z-10">
        <div className="rounded-2xl border border-[#1E293B] bg-[#0D1117]/80 backdrop-blur-sm p-8">

          {/* ── STEP 1: Goal ──────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-syne)]">
                  What&apos;s your creator goal?
                </h1>
                <p className="text-sm text-[#94A3B8] mt-2">
                  This helps us personalize your dashboard experience.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goals.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => setSelectedGoal(goal.id)}
                    className={`text-left p-4 rounded-xl border transition-all duration-200 ${
                      selectedGoal === goal.id
                        ? "border-[#64FFDA] bg-[#64FFDA]/5 ring-1 ring-[#64FFDA]/20"
                        : "border-[#1E293B] bg-[#1E293B]/20 hover:border-[#64FFDA]/30"
                    }`}
                  >
                    <div className="text-2xl mb-2">{goal.emoji}</div>
                    <div className="text-sm font-semibold text-white">{goal.title}</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">{goal.desc}</div>
                    {selectedGoal === goal.id && (
                      <div className="mt-2">
                        <Check className="w-4 h-4 text-[#64FFDA]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={() => selectedGoal && setStep(2)}
                disabled={!selectedGoal}
                className={`w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                  selectedGoal
                    ? "bg-gradient-to-r from-[#64FFDA] to-[#22D3EE] text-[#080B10] hover:opacity-90"
                    : "bg-[#1E293B] text-[#475569] cursor-not-allowed"
                }`}
              >
                Continue
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Niches ─────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-syne)]">
                  Pick your niche interests
                </h1>
                <p className="text-sm text-[#94A3B8] mt-2">
                  Select 1–3 niches you&apos;re interested in. We&apos;ll customize your feed.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {niches.map((niche) => {
                  const selected = selectedNiches.includes(niche.id);
                  return (
                    <button
                      key={niche.id}
                      onClick={() => toggleNiche(niche.id)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                        selected
                          ? "border-[#64FFDA] bg-[#64FFDA]/10 text-[#64FFDA]"
                          : "border-[#1E293B] bg-[#1E293B]/20 text-[#94A3B8] hover:border-[#64FFDA]/30 hover:text-white"
                      }`}
                    >
                      <span>{niche.emoji}</span>
                      {niche.label}
                      {selected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>

              <div className="text-center text-xs text-[#94A3B8]">
                {selectedNiches.length}/3 selected
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 rounded-xl text-sm font-medium border border-[#1E293B] text-[#94A3B8] hover:text-white hover:bg-[#1E293B]/30 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => selectedNiches.length > 0 && setStep(3)}
                  disabled={selectedNiches.length === 0}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                    selectedNiches.length > 0
                      ? "bg-gradient-to-r from-[#64FFDA] to-[#22D3EE] text-[#080B10] hover:opacity-90"
                      : "bg-[#1E293B] text-[#475569] cursor-not-allowed"
                  }`}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Ready ──────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#64FFDA] to-[#22D3EE] flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-[#080B10]" />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white font-[family-name:var(--font-syne)]">
                  You&apos;re ready! 🎉
                </h1>
                <p className="text-sm text-[#94A3B8] mt-3 max-w-sm mx-auto leading-relaxed">
                  We&apos;ve pre-loaded 5 niche recommendations based on your goals.
                  Your personalized dashboard is ready.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-2">
                {selectedNiches.map((id) => {
                  const niche = niches.find((n) => n.id === id);
                  return niche ? (
                    <span
                      key={id}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#64FFDA]/10 text-[#64FFDA] text-xs font-medium border border-[#64FFDA]/20"
                    >
                      {niche.emoji} {niche.label}
                    </span>
                  ) : null;
                })}
              </div>

              <button
                onClick={completeOnboarding}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#64FFDA] to-[#22D3EE] text-[#080B10] text-sm font-bold flex items-center justify-center gap-2 hover:opacity-90 transition-all"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
