"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";

/* ── FIX 13 — Multi-step onboarding wizard ───────────────────── */

const STEPS = [
  {
    title: "What best describes you?",
    options: [
      { value: "solo_creator", label: "Solo Creator", desc: "Building my first faceless channel" },
      { value: "agency", label: "Agency / MCN", desc: "Managing multiple channels" },
      { value: "curious", label: "Just Exploring", desc: "Checking out the platform" },
    ],
    key: "role" as const,
  },
  {
    title: "Which niches interest you?",
    options: [
      { value: "tech_ai", label: "Tech & AI" },
      { value: "finance", label: "Finance & Investing" },
      { value: "health", label: "Health & Wellness" },
      { value: "history", label: "History & Education" },
      { value: "true_crime", label: "True Crime" },
      { value: "motivation", label: "Motivation & Stoicism" },
      { value: "other", label: "Other" },
    ],
    key: "interests" as const,
    multi: true,
  },
  {
    title: "How many subscribers do you have?",
    options: [
      { value: "0", label: "Haven't started yet" },
      { value: "1k", label: "Under 1K" },
      { value: "10k", label: "1K — 10K" },
      { value: "100k", label: "10K — 100K" },
      { value: "100k+", label: "100K+" },
    ],
    key: "experience" as const,
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({
    role: "",
    interests: [],
    experience: "",
  });

  const current = STEPS[step];
  const isMulti = "multi" in current && current.multi;

  const handleSelect = (value: string) => {
    if (isMulti) {
      const prev = (answers[current.key] as string[]) || [];
      if (prev.includes(value)) {
        setAnswers({ ...answers, [current.key]: prev.filter((v) => v !== value) });
      } else {
        setAnswers({ ...answers, [current.key]: [...prev, value] });
      }
    } else {
      setAnswers({ ...answers, [current.key]: value });
    }
  };

  const isSelected = (value: string) => {
    const val = answers[current.key];
    if (Array.isArray(val)) return val.includes(value);
    return val === value;
  };

  const canProceed = () => {
    const val = answers[current.key];
    if (Array.isArray(val)) return val.length > 0;
    return !!val;
  };

  const handleNext = async () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      return;
    }

    // Final step — save and redirect
    setLoading(true);
    try {
      // In production, POST to /api/onboarding to save metadata
      await new Promise((r) => setTimeout(r, 800));
      router.push("/dashboard");
    } catch {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080B10",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div style={{ maxWidth: "520px", width: "100%" }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #64FFDA, #818CF8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Zap size={20} color="#080B10" />
          </div>
          <span style={{ fontSize: "20px", fontWeight: 700, color: "white" }}>NichePulse</span>
        </div>

        {/* Progress bar */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            marginBottom: "32px",
          }}
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "4px",
                borderRadius: "2px",
                background: i <= step ? "#64FFDA" : "#1E293B",
                transition: "background 0.3s",
              }}
            />
          ))}
        </div>

        {/* Step counter */}
        <div style={{ color: "#64748B", fontSize: "14px", marginBottom: "8px" }}>
          Step {step + 1} of {STEPS.length}
        </div>

        {/* Title */}
        <h1
          style={{
            fontFamily: "var(--font-syne), sans-serif",
            color: "#E2E8F0",
            fontSize: "1.75rem",
            fontWeight: 700,
            marginBottom: "24px",
          }}
        >
          {current.title}
        </h1>

        {/* Options grid */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "32px",
          }}
        >
          {current.options.map((opt) => {
            const selected = isSelected(opt.value);
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "16px 20px",
                  borderRadius: "12px",
                  border: `2px solid ${selected ? "#64FFDA" : "#1E293B"}`,
                  background: selected ? "#64FFDA10" : "#0D1117",
                  color: selected ? "#E2E8F0" : "#94A3B8",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.2s",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: isMulti ? "4px" : "50%",
                    border: `2px solid ${selected ? "#64FFDA" : "#475569"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {selected && <CheckCircle size={14} color="#64FFDA" />}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: "15px" }}>{opt.label}</div>
                  {"desc" in opt && opt.desc && (
                    <div style={{ fontSize: "13px", color: "#64748B", marginTop: "2px" }}>
                      {opt.desc}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px 20px",
                borderRadius: "8px",
                border: "1px solid #1E293B",
                background: "transparent",
                color: "#94A3B8",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            disabled={!canProceed() || loading}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "12px 24px",
              borderRadius: "8px",
              background: canProceed() ? "#64FFDA" : "#1E293B",
              color: canProceed() ? "#080B10" : "#475569",
              cursor: canProceed() ? "pointer" : "not-allowed",
              fontWeight: 700,
              fontSize: "14px",
              border: "none",
              transition: "all 0.2s",
            }}
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : step === STEPS.length - 1 ? (
              <>
                Go to Dashboard
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>

        {/* Skip link */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              background: "none",
              border: "none",
              color: "#475569",
              fontSize: "13px",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
