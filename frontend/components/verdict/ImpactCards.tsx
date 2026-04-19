import { AuditResult } from "@/lib/types";
import { formatLakhs } from "@/lib/formatters";

export default function ImpactCards({ audit }: { audit: AuditResult }) {
  const isGreen = audit.verdict === "GREEN";

  const cards = [
    {
      label: "Rate Gap",
      value: audit.rate_gap > 0 ? `+${audit.rate_gap.toFixed(3)}%` : audit.rate_gap === 0 ? "At Market" : `${audit.rate_gap.toFixed(3)}%`,
      sub: `vs peer median of ${audit.fair_rate_corridor.p50}%`,
      accent: false,
      color: "",
    },
    {
      label: isGreen ? "Lifetime Savings" : "Lifetime Overpayment",
      value: isGreen ? formatLakhs(Math.abs(audit.overpayment_total_inr)) : formatLakhs(audit.overpayment_total_inr),
      sub: isGreen ? "vs average market rates" : `over remaining ${audit.remaining_tenure_months || 0} months`,
      accent: true,
      color: isGreen ? "var(--green)" : "var(--red)",
    },
    {
      label: "Peers Analyzed",
      value: (audit.cohort_size || 0).toLocaleString(),
      sub: "borrowers with matching financial profile",
      accent: false,
      color: "",
      mono: true,
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
      {cards.map((card, i) => (
        <div key={i} className="card" style={{ padding: "1.5rem", position: "relative", overflow: "hidden" }}>
          {card.accent && (
            <div style={{
              position: "absolute",
              top: "-20px",
              right: "-20px",
              width: "100px",
              height: "100px",
              background: `radial-gradient(circle, ${card.color}20 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />
          )}
          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              marginBottom: "0.5rem",
            }}>
              {card.label}
            </div>
            <div style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "0.25rem",
              color: card.accent ? card.color : "var(--text-primary)",
              fontFamily: card.mono ? "monospace" : "inherit",
              letterSpacing: card.mono ? "-0.03em" : "inherit",
            }}>
              {card.value}
            </div>
            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
              {card.sub}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
