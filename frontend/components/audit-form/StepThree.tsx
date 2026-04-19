"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFormStore } from "@/lib/store";
import { formatINR, formatRate } from "@/lib/formatters";
import { submitAudit } from "@/lib/api";
import { BorrowerProfile } from "@/lib/types";

export default function StepThree() {
  const { formData, setStep } = useFormStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const estimatedLtv = formData.loan_amount && formData.property_value 
    ? (formData.loan_amount / formData.property_value * 100).toFixed(1) 
    : "0";

  const handleAudit = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = formData as BorrowerProfile;
      const res = await submitAudit(data);
      router.push(`/results/${res.audit_id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred running the audit.");
      setLoading(false);
    }
  };

  const rows = [
    { label: "Loan Amount", value: formatINR(formData.loan_amount || 0) },
    { label: "Property Value", value: formatINR(formData.property_value || 0) },
    { label: "Implied LTV", value: `${estimatedLtv}%`, accent: true },
    { label: "Current Rate", value: formatRate(formData.current_interest_rate || 0) },
    { label: "Annual Income", value: formatINR(formData.annual_income || 0) },
    { label: "CIBIL Score", value: String(formData.cibil_score || "—"), mono: true },
    { label: "Employment", value: formData.employment_type?.replace(/_/g, " ") || "—" },
    { label: "City Tier", value: formData.city_tier?.replace(/_/g, " ") || "—" },
    { label: "Tenure", value: formData.loan_tenure_months ? `${formData.loan_tenure_months} months` : "—" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Summary Card */}
      <div className="card-red" style={{ padding: "1.75rem" }}>
        <h3 style={{ marginBottom: "1.25rem", fontSize: "1.2rem" }}>Summary of Details</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", rowGap: "0.85rem" }}>
          {rows.map((row, i) => (
            <div key={i} style={{ display: "contents" }}>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{row.label}</span>
              <span style={{
                fontSize: "0.85rem",
                fontWeight: 500,
                textAlign: "right",
                color: row.accent ? "var(--accent)" : "var(--text-primary)",
                fontFamily: row.mono ? "monospace" : "inherit",
              }}>
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      <p style={{ fontSize: "0.75rem", textAlign: "center", color: "var(--text-muted)" }}>
        Your DTI ratio and remaining tenure will be computed server-side securely.
      </p>

      {error && (
        <div style={{
          padding: "0.75rem 1rem",
          background: "var(--red-bg)",
          color: "var(--red)",
          border: "1px solid var(--red-border)",
          borderRadius: "var(--radius-sm)",
          fontSize: "0.85rem",
          textAlign: "center",
        }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", gap: "1rem" }}>
        <button disabled={loading} type="button" onClick={() => setStep(2)} className="btn-outline" style={{ flex: 1 }}>
          ← Back
        </button>
        <button disabled={loading} onClick={handleAudit} className="btn-primary" style={{ flex: 2, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem" }}>
          {loading ? <span className="spinner" /> : "Run Audit →"}
        </button>
      </div>
    </div>
  );
}
