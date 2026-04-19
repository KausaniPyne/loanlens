"use client";
import { useFormStore } from "@/lib/store";

export default function StepTwo() {
  const { formData, updateForm, setStep } = useFormStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const labelStyle: React.CSSProperties = {
    display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.4rem",
    color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em",
  };

  return (
    <form onSubmit={handleNext} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div>
          <label style={labelStyle}>Annual Income</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "0.75rem", top: "0.75rem", color: "var(--text-muted)" }}>₹</span>
            <input required type="number" min="100000" className="input" style={{ paddingLeft: "1.75rem" }}
              value={formData.annual_income || ""}
              onChange={(e) => updateForm({ annual_income: Number(e.target.value) })} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Monthly Obligations</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "0.75rem", top: "0.75rem", color: "var(--text-muted)" }}>₹</span>
            <input required type="number" min="0" className="input" style={{ paddingLeft: "1.75rem" }}
              title="Include all current EMIs, credit card minimums, and loan repayments."
              value={formData.existing_obligations_monthly ?? ""}
              onChange={(e) => updateForm({ existing_obligations_monthly: Number(e.target.value) })} />
          </div>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.35rem" }}>Total of all your EMIs/dues</p>
        </div>
      </div>

      {/* CIBIL Score Slider */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
          <label style={labelStyle}>CIBIL Score</label>
          <span style={{ fontSize: "1.5rem", fontWeight: 700, fontFamily: "monospace", color: "var(--accent)" }}>
            {formData.cibil_score || 300}
          </span>
        </div>
        <input required type="range" min="300" max="900" step="1"
          style={{ width: "100%", accentColor: "var(--accent)" }}
          value={formData.cibil_score || 300}
          onChange={(e) => updateForm({ cibil_score: Number(e.target.value) })} />
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
          <span>300</span><span>900</span>
        </div>
      </div>

      {/* Employment Type */}
      <div>
        <label style={{ ...labelStyle, marginBottom: "0.75rem" }}>Employment Type</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
          {["SALARIED_PRIVATE", "SALARIED_PSU", "SELF_EMPLOYED_BUSINESS", "SELF_EMPLOYED_PROFESSIONAL", "GOVERNMENT"].map(type => (
            <label key={type} style={{
              border: `1px solid ${formData.employment_type === type ? "var(--accent)" : "var(--border)"}`,
              background: formData.employment_type === type ? "var(--accent-soft)" : "transparent",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-sm)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: formData.employment_type === type ? "var(--text-primary)" : "var(--text-secondary)",
            }}>
              <input required type="radio" style={{ display: "none" }} name="employment" value={type}
                checked={formData.employment_type === type}
                onChange={(e) => updateForm({ employment_type: e.target.value as any })} />
              <span style={{ fontSize: "0.85rem", fontWeight: 500 }}>{type.replace(/_/g, " ")}</span>
            </label>
          ))}
        </div>
      </div>

      {/* City Tier */}
      <div>
        <label style={{ ...labelStyle, marginBottom: "0.75rem" }}>City Tier</label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
          {[
            { value: "TIER_1", label: "Tier 1", sub: "Mumbai, Delhi, Blr" },
            { value: "TIER_2", label: "Tier 2", sub: "Pune, Hyd, Chen" },
            { value: "TIER_3", label: "Tier 3", sub: "Others" },
          ].map(({ value, label, sub }) => (
            <label key={value} style={{
              border: `1px solid ${formData.city_tier === value ? "var(--accent)" : "var(--border)"}`,
              background: formData.city_tier === value ? "var(--accent-soft)" : "transparent",
              padding: "0.75rem",
              borderRadius: "var(--radius-sm)",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s ease",
              color: formData.city_tier === value ? "var(--text-primary)" : "var(--text-secondary)",
            }}>
              <input required type="radio" style={{ display: "none" }} name="city" value={value}
                checked={formData.city_tier === value}
                onChange={() => updateForm({ city_tier: value as any })} />
              <div style={{ fontSize: "0.85rem", fontWeight: 500 }}>{label}</div>
              <div style={{ fontSize: "0.65rem", marginTop: "0.25rem", opacity: 0.6 }}>{sub}</div>
            </label>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: "1rem" }}>
        <button type="button" onClick={() => setStep(1)} className="btn-outline" style={{ flex: 1 }}>
          ← Back
        </button>
        <button type="submit" className="btn-primary" style={{ flex: 2 }}>
          Review Details →
        </button>
      </div>
    </form>
  );
}
