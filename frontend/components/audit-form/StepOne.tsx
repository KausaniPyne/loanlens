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
    city_tier: "TIER_2" as any, current_interest_rate: 8.55,
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
    <form onSubmit={handleNext} className="space-y-6">
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button type="button" onClick={() => loadDemo("GREEN")} className="text-xs bg-[var(--green-bg)] text-[var(--green)] px-3 py-1 rounded border border-[var(--green)] whitespace-nowrap">Load Green Demo</button>
        <button type="button" onClick={() => loadDemo("YELLOW")} className="text-xs bg-[var(--yellow-bg)] text-[var(--yellow)] px-3 py-1 rounded border border-[var(--yellow)] whitespace-nowrap">Load Yellow Demo</button>
        <button type="button" onClick={() => loadDemo("RED")} className="text-xs bg-[var(--red-bg)] text-[var(--red)] px-3 py-1 rounded border border-[var(--red)] whitespace-nowrap">Load Red Demo</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Loan Amount</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-[var(--text-secondary)]">₹</span>
            <input required type="number" min="100000" max="50000000" step="50000" 
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded p-2 pl-8 focus:border-[var(--accent)] outline-none"
              value={formData.loan_amount || ""}
              onChange={(e) => updateForm({ loan_amount: Number(e.target.value) })} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Property Value</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-[var(--text-secondary)]">₹</span>
            <input required type="number" min={formData.loan_amount || "100000"} 
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded p-2 pl-8 focus:border-[var(--accent)] outline-none"
              value={formData.property_value || ""}
              onChange={(e) => updateForm({ property_value: Number(e.target.value) })} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Current Rate</label>
          <div className="relative">
            <input required type="number" min="5.0" max="20.0" step="0.05"
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded p-2 focus:border-[var(--accent)] outline-none"
              value={formData.current_interest_rate || ""}
              onChange={(e) => updateForm({ current_interest_rate: Number(e.target.value) })} />
            <span className="absolute right-3 top-2 text-[var(--text-secondary)]">%</span>
          </div>
        </div>

        <div>
           <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Loan Tenure</label>
           <select required className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded p-2 focus:border-[var(--accent)] outline-none"
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
          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Disbursement Date</label>
          <input required type="date" max={maxDateStr}
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded p-2 focus:border-[var(--accent)] outline-none"
            value={formData.loan_disbursement_date || ""}
            onChange={(e) => updateForm({ loan_disbursement_date: e.target.value })} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Lender Name (Optional)</label>
          <input type="text" placeholder="e.g. HDFC Bank"
            className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded p-2 focus:border-[var(--accent)] outline-none"
            value={formData.lender_name || ""}
            onChange={(e) => updateForm({ lender_name: e.target.value })} />
        </div>
      </div>

      <button type="submit" className="w-full bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white py-3 rounded-lg font-semibold mt-4 transition-colors">
        Next: Financial Profile
      </button>
    </form>
  );
}
