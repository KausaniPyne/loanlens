import { BrainCircuit, Activity, LineChart, Star, Briefcase, MapPin, Building, ShieldCheck, Scale, DollarSign } from "lucide-react";
import { FEATURE_LABELS } from "@/lib/formatters";

const getExplanation = (featureKey: string) => {
  switch (featureKey) {
    case "cibil_score_scaled": return "Your credit score is the dominant rate determinant.";
    case "dti_ratio_scaled": return "Your debt load relative to income influenced the prediction.";
    case "ltv_ratio_scaled": return "How much you borrowed vs property value affected pricing.";
    case "employment_encoded": return "Your employment category carries a risk premium.";
    case "city_encoded": return "Geographic property factors and local norms applied.";
    case "log_loan_amount_scaled": return "The absolute volume of capital borrowed shifts margin tiers.";
    case "log_annual_income_scaled": return "Income elasticity dictates repayment safety scores.";
    case "loan_tenure_scaled": return "Time decay and duration risk shifted the rate curve.";
    case "catboost_pred": return "AI matched your profile to historic non-linear rate boundaries.";
    default: return "This factor mathematically swung grading margins.";
  }
};

const getIcon = (featureKey: string) => {
  const iconProps = { size: 18 };
  switch (featureKey) {
    case "cibil_score_scaled": return <ShieldCheck {...iconProps} color="var(--accent)" />;
    case "dti_ratio_scaled": return <Scale {...iconProps} color="var(--yellow)" />;
    case "ltv_ratio_scaled": return <Building {...iconProps} color="var(--green)" />;
    case "employment_encoded": return <Briefcase {...iconProps} color="var(--text-secondary)" />;
    case "city_encoded": return <MapPin {...iconProps} color="var(--text-secondary)" />;
    case "log_loan_amount_scaled": return <DollarSign {...iconProps} color="var(--text-secondary)" />;
    case "log_annual_income_scaled": return <Activity {...iconProps} color="var(--text-secondary)" />;
    case "catboost_pred": return <BrainCircuit {...iconProps} color="var(--text-secondary)" />;
    default: return <LineChart {...iconProps} color="var(--text-secondary)" />;
  }
};

export default function KeyDrivers({ key_drivers }: { key_drivers: string[] }) {
  if (!key_drivers || key_drivers.length === 0) return null;
  const topDrivers = key_drivers.slice(0, 3);

  return (
    <div className="card" style={{ padding: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
        <Star size={18} color="var(--yellow)" fill="var(--yellow)" />
        <h3 style={{ fontSize: "1.3rem" }}>AI Grading Drivers</h3>
      </div>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
        TabNet neural attention weighted these factors highest for your specific rate prediction.
      </p>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
        {topDrivers.map((driver, idx) => (
          <div key={driver} style={{
            display: "flex",
            gap: "1rem",
            padding: "1rem",
            borderRadius: "var(--radius-sm)",
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            alignItems: "flex-start",
          }}>
            <div style={{
              marginTop: "2px",
              background: "var(--surface)",
              padding: "0.5rem",
              borderRadius: "50%",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              {getIcon(driver)}
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                {FEATURE_LABELS[driver] || driver}
                <span style={{
                  fontSize: "0.6rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  padding: "0.15rem 0.5rem",
                  borderRadius: "100px",
                  color: "var(--text-muted)",
                  fontFamily: "monospace",
                }}>#{idx + 1}</span>
              </div>
              <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
                {getExplanation(driver)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
