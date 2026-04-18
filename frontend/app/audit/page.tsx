"use client";

import { useFormStore } from "@/lib/store";
import StepOne from "@/components/audit-form/StepOne";
import StepTwo from "@/components/audit-form/StepTwo";
import StepThree from "@/components/audit-form/StepThree";

export default function AuditPage() {
  const { step } = useFormStore();

  return (
    <main className="min-h-screen bg-[var(--bg)] py-12 text-[var(--text-primary)]">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-2">Loan Audit</h1>
        <p className="text-[var(--text-secondary)] mb-8">
          Step {step} of 3: Enter your loan details to benchmark your interest rate.
        </p>
        
        <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] p-8 shadow-xl">
          {step === 1 && <StepOne />}
          {step === 2 && <StepTwo />}
          {step === 3 && <StepThree />}
        </div>
      </div>
    </main>
  );
}
