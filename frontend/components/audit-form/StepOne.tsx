"use client";

import { useFormStore } from "@/lib/store";
import { BorrowerProfile } from "@/lib/types";

export const DEMO_PROFILES = {
  GREEN: {
    annual_income: 2400000, cibil_score: 810, loan_amount: 4500000,
    property_value: 8000000, loan_tenure_months: 180, employment_type: "GOVERNMENT" as any,
    city_tier: "TIER_1" as any, current_interest_rate: 7.9,
    loan_disbursement_date: "2023-01-10", existing_obligations_monthly: 5000,
    lender_name: "SBI"
  },
  YELLOW: {
    annual_income: 1500000, cibil_score: 735, loan_amount: 5500000,
    property_value: 8000000, loan_tenure_months: 240, employment_type: "SALARIED_PRIVATE" as any,
    city_tier: "TIER_2" as any, current_interest_rate: 9.55,
    loan_disbursement_date: "2022-03-20", existing_obligations_monthly: 12000,
    lender_name: "ICICI Bank"
  },
  RED: {
    annual_income: 1200000, cibil_score: 695, loan_amount: 6000000,
    property_value: 8500000, loan_tenure_months: 240, employment_type: "SELF_EMPLOYED_BUSINESS" as any,
    city_tier: "TIER_3" as any, current_interest_rate: 10.25,
    loan_disbursement_date: "2021-08-05", existing_obligations_monthly: 20000,
    lender_name: "NBFC Lender"
  }
};

export default function StepOne() {
  const { formData, updateForm, setStep } = useFormStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const loadDemo = (type: keyof typeof DEMO_PROFILES) => {
    updateForm(DEMO_PROFILES[type]);
    setStep(3);
  };

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() - 1);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <form onSubmit={handleNext}>
      {/* Demo Buttons */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        <button type="button" onClick={() => loadDemo("GREEN")} className="pill pill-green" style={{ cursor: "pointer", fontFamily: "var(--font-body)" }}>
          🟢 Load Green Demo
        </button>
        <button type="button" onClick={() => loadDemo("YELLOW")} className="pill pill-yellow" style={{ cursor: "pointer", fontFamily: "var(--font-body)" }}>
          🟡 Load Yellow Demo
        </button>
        <button type="button" onClick={() => loadDemo("RED")} className="pill" style={{ cursor: "pointer", fontFamily: "var(--font-body)" }}>
          🔴 Load Red Demo
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.4rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Loan Amount</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "0.75rem", top: "0.75rem", color: "var(--text-muted)" }}>₹</span>
            <input required type="number" min="100000" max="50000000" step="50000" className="input" style={{ paddingLeft: "1.75rem" }}
              value={formData.loan_amount || ""}
              onChange={(e) => updateForm({ loan_amount: Number(e.target.value) })} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.4rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Property Value</label>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "0.75rem", top: "0.75rem", color: "var(--text-muted)" }}>₹</span>
            <input required type="number" min={formData.loan_amount || "100000"} className="input" style={{ paddingLeft: "1.75rem" }}
              value={formData.property_value || ""}
              onChange={(e) => updateForm({ property_value: Number(e.target.value) })} />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.4rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Current Rate</label>
          <div style={{ position: "relative" }}>
            <input required type="number" min="5.0" max="20.0" step="0.05" className="input"
              value={formData.current_interest_rate || ""}
              onChange={(e) => updateForm({ current_interest_rate: Number(e.target.value) })} />
            <span style={{ position: "absolute", right: "0.75rem", top: "0.75rem", color: "var(--text-muted)" }}>%</span>
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.4rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Loan Tenure</label>
          <select required className="input"
            value={formData.loan_tenure_months || ""}
            onChange={(e) => updateForm({ loan_tenure_months: Number(e.target.value) })}>
            <option value="" disabled>Select tenure</option>
            <option value="120">120 months (10 years)</option>
            <option value="180">180 months (15 years)</option>
            <option value="240">240 months (20 years)</option>
            <option value="300">300 months (25 years)</option>
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.4rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Disbursement Date</label>
          <input required type="date" max={maxDateStr} className="input"
            value={formData.loan_disbursement_date || ""}
            onChange={(e) => updateForm({ loan_disbursement_date: e.target.value })} />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 500, marginBottom: "0.4rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Lender Name <span style={{ opacity: 0.5 }}>(Optional)</span></label>
          <input type="text" placeholder="e.g. HDFC Bank" className="input"
            value={formData.lender_name || ""}
            onChange={(e) => updateForm({ lender_name: e.target.value })} />
        </div>
      </div>

      <button type="submit" className="btn-primary" style={{ width: "100%", marginTop: "2rem", padding: "0.9rem" }}>
        Next: Financial Profile →
      </button>
    </form>
  );
}
