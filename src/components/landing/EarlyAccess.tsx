"use client";

/* ── FIX 2 — Honest early access section (replaces testimonials) ── */

export function EarlyAccess() {
  return (
    <section
      className="py-24 text-center"
      style={{
        background: "linear-gradient(180deg, #080B10 0%, #0D1117 100%)",
      }}
    >
      <h2
        style={{
          fontFamily: "var(--font-syne), sans-serif",
          color: "#E2E8F0",
          fontSize: "2rem",
          fontWeight: 700,
          marginBottom: "12px",
        }}
      >
        Built for serious faceless creators
      </h2>

      <p
        style={{
          color: "#64748B",
          fontSize: "1.1rem",
          marginBottom: "48px",
          maxWidth: "500px",
          margin: "0 auto 48px",
        }}
      >
        NichePulse is in early access. Real data, real scores, no inflated
        numbers.
      </p>

      <div
        style={{
          display: "flex",
          gap: "24px",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "48px",
        }}
      >
        {[
          { num: "210+", label: "Channels Indexed" },
          { num: "15", label: "Niche Categories" },
          { num: "97.6", label: "Highest NicheScore" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "#0D1117",
              border: "1px solid #1E293B",
              borderRadius: "12px",
              padding: "24px 40px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                color: "#64FFDA",
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              {stat.num}
            </div>
            <div
              style={{
                color: "#64748B",
                fontSize: "0.875rem",
                marginTop: "4px",
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      <a
        href="/sign-up"
        style={{
          background: "linear-gradient(135deg,#64FFDA,#00B4D8)",
          color: "#080B10",
          padding: "14px 32px",
          borderRadius: "8px",
          fontFamily: "var(--font-syne), sans-serif",
          fontWeight: 700,
          fontSize: "1rem",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        Claim Early Access →
      </a>
    </section>
  );
}
