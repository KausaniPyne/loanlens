import { AuditResult } from "@/lib/types";
import { formatLakhs } from "@/lib/formatters";

export default function VerdictBanner({ audit }: { audit: AuditResult }) {
  const verdictConfig = {
    GREEN: {
      emoji: "🟢",
      label: "ELITE DEAL",
      color: "var(--green)",
      bg: "var(--green-bg)",
      border: "var(--green-border)",
      status: "You are saving money compared to market peers.",
    },
    YELLOW: {
      emoji: "🟡",
      label: "FAIR MARKET",
      color: "var(--yellow)",
      bg: "var(--yellow-bg)",
      border: "var(--yellow-border)",
      status: "Your rate is perfectly average for your cohort.",
    },
    RED: {
      emoji: "🔴",
      label: "ACTION REQUIRED",
      color: "var(--red)",
      bg: "var(--red-bg)",
      border: "var(--red-border)",
      status: `You are paying ${formatLakhs(audit.overpayment_total_inr)} more than your financial peers over your remaining tenure.`,
    },
  };

  const config = verdictConfig[audit.verdict] || verdictConfig.YELLOW;

  return (
    <div style={{
      width: "100%",
      padding: "2.5rem 2rem",
      background: config.bg,
      borderLeft: `4px solid ${config.color}`,
      borderRadius: "var(--radius)",
      transition: "all 0.5s ease",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute",
        top: "-50%",
        right: "-10%",
        width: "300px",
        height: "300px",
        background: `radial-gradient(circle, ${config.color}15 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, maxWidth: "900px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "1.25rem" }}>{config.emoji}</span>
          <span style={{
            fontWeight: 700,
            letterSpacing: "0.15em",
            fontSize: "0.8rem",
            color: config.color,
            textTransform: "uppercase",
            fontFamily: "var(--font-body)",
          }}>
            {config.label}
          </span>
          {audit.is_simulation && (
            <span className="pill" style={{ fontSize: "0.6rem", padding: "0.2rem 0.6rem" }}>
              Simulation Active
            </span>
          )}
        </div>

        <h2 style={{ fontSize: "1.8rem", marginBottom: "0.5rem" }}>{config.status}</h2>

        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Benchmarked against <strong style={{ color: "var(--text-primary)" }}>{audit.cohort_size.toLocaleString()}</strong> borrowers
          with similar financial profiles.
        </p>
      </div>
    </div>
  );
}
