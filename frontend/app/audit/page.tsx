"use client";

import { useFormStore } from "@/lib/store";
import StepOne from "@/components/audit-form/StepOne";
import StepTwo from "@/components/audit-form/StepTwo";
import StepThree from "@/components/audit-form/StepThree";
import Link from "next/link";

export default function AuditPage() {
  const { step } = useFormStore();

  const stepLabels = ["Loan Details", "Financial Profile", "Review & Submit"];

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", padding: "3rem 1.5rem" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: "0.35rem", marginBottom: "1rem" }}>
            ← Back to Home
          </Link>
          <h1 style={{ fontSize: "2.4rem", marginBottom: "0.5rem" }}>Loan Audit</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            Enter your loan details to benchmark your interest rate against 100,000 real borrower profiles.
          </p>
        </div>

        {/* Step Indicator */}
        <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem" }}>
          {stepLabels.map((label, i) => (
            <div key={i} style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "0.5rem",
            }}>
              <div style={{
                width: "100%",
                height: "3px",
                borderRadius: "2px",
                background: i + 1 <= step ? "var(--accent)" : "var(--border)",
                transition: "background 0.3s ease",
              }} />
              <span style={{
                fontSize: "0.7rem",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: i + 1 <= step ? "var(--text-primary)" : "var(--text-muted)",
              }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="card" style={{ padding: "2.5rem" }}>
          {step === 1 && <StepOne />}
          {step === 2 && <StepTwo />}
          {step === 3 && <StepThree />}
        </div>
      </div>
    </main>
  );
}
