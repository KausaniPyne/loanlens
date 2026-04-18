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
      // Validate complete profile
      const data = formData as BorrowerProfile;
      const res = await submitAudit(data);
      router.push(`/results/${res.audit_id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred running the audit.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--surface-2)] p-6 rounded-xl border border-[var(--border)]">
        <h3 className="font-semibold mb-4 text-white">Summary of Details</h3>
        
        <dl className="grid grid-cols-2 gap-y-4 text-sm">
          <dt className="text-[var(--text-secondary)]">Loan Amount</dt>
          <dd className="text-right font-medium">{formatINR(formData.loan_amount || 0)}</dd>
          
          <dt className="text-[var(--text-secondary)]">Property Value</dt>
          <dd className="text-right font-medium">{formatINR(formData.property_value || 0)}</dd>

          <dt className="text-[var(--text-secondary)]">Implied LTV</dt>
          <dd className="text-right font-medium text-[var(--accent)]">{estimatedLtv}%</dd>

          <dt className="text-[var(--text-secondary)]">Current Rate</dt>
          <dd className="text-right font-medium">{formatRate(formData.current_interest_rate || 0)}</dd>

          <dt className="text-[var(--text-secondary)]">Annual Income</dt>
          <dd className="text-right font-medium">{formatINR(formData.annual_income || 0)}</dd>

          <dt className="text-[var(--text-secondary)]">CIBIL Score</dt>
          <dd className="text-right font-medium font-mono">{formData.cibil_score}</dd>

          <dt className="text-[var(--text-secondary)]">City</dt>
          <dd className="text-right font-medium">{formData.city_tier?.replace(/_/g, ' ')}</dd>
        </dl>
      </div>

      <p className="text-xs text-center text-[var(--text-secondary)]">
        Your Debt-to-Income (DTI) ratio and remaining tenure will be computed server-side securely.
      </p>

      {error && <div className="p-3 bg-[var(--red-bg)] text-[var(--red)] border border-[var(--red)] rounded text-sm text-center">{error}</div>}

      <div className="flex gap-4">
        <button disabled={loading} type="button" onClick={() => setStep(2)} className="w-1/3 border border-[var(--border)] hover:bg-[var(--surface-2)] text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50">
            Back
        </button>
        <button disabled={loading} onClick={handleAudit} className="w-2/3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
            {loading ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> : "Run Audit"}
        </button>
      </div>
    </div>
  );
}
