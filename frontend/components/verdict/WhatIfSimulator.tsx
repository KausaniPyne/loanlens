"use client";

import { useState } from "react";
import { AuditResult } from "@/lib/types";
import { runSimulation } from "@/lib/api";
import { RefreshCcw, ArrowRight } from "lucide-react";
import { formatLakhs } from "@/lib/formatters";

export default function WhatIfSimulator({ onSimulate, audit }: { onSimulate: (data: AuditResult) => void, originalProfile?: any, audit: AuditResult }) {
  const useFormStore = require('@/lib/store').useFormStore;
  const formData = useFormStore((s: any) => s.formData);

  const [cibil, setCibil] = useState<number>(Math.min(900, (formData.cibil_score || 720) + 40));
  const [ltvTarget, setLtvTarget] = useState<number>(
    formData.loan_amount && formData.property_value
      ? Math.round(formData.loan_amount / formData.property_value * 100)
      : 75
  );

  const [loading, setLoading] = useState(false);

  const originalGap = formData._base_gap || audit.rate_gap;
  const originalOverpayment = formData._base_overpayment || audit.overpayment_total_inr;

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const simulatedLoanAmount = (ltvTarget / 100) * (formData.property_value || 10000000);
      if (!formData._base_gap) {
        useFormStore.setState((s: any) => ({
          formData: { ...s.formData, _base_gap: audit.rate_gap, _base_overpayment: audit.overpayment_total_inr }
        }));
      }
      const overrides = {
        cibil_score: Number(cibil),
        loan_amount: Number(simulatedLoanAmount)
      };
      const res = await runSimulation(formData as any, overrides);
      onSimulate(res);
    } catch (e) {
      console.error(e);
      alert("Simulation failed. See console.");
    } finally {
      setLoading(false);
    }
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.75rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--text-secondary)",
    marginBottom: "0.5rem",
  };

  return (
    <div className="card" style={{ padding: "2rem", position: "relative", overflow: "hidden" }}>
      {/* Decorative bg icon */}
      <div style={{ position: "absolute", top: 0, right: 0, padding: "1rem", opacity: 0.05, pointerEvents: "none" }}>
        <RefreshCcw size={120} />
      </div>

      <h3 style={{ marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        What-If Simulator
      </h3>
      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
        Instantly test how profile improvements alter your structural interest rate boundary.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "1.5rem", position: "relative", zIndex: 1 }}>
        <div>
          <label style={labelStyle}>If CIBIL improves to</label>
          <input type="number" min="300" max="900" className="input" style={{ fontFamily: "monospace" }}
            value={cibil}
            onChange={e => setCibil(e.target.valueAsNumber)} />
        </div>
        <div>
          <label style={labelStyle}>If I reduce LTV to (%)</label>
          <input type="number" min="10" max="95" step="1" className="input" style={{ fontFamily: "monospace" }}
            value={ltvTarget}
            onChange={e => setLtvTarget(e.target.valueAsNumber)} />
        </div>
        <div>
          <label style={labelStyle}>If I switch job to</label>
          <select className="input" style={{ padding: "0.75rem", fontSize: "0.85rem" }}
            value={formData.employment_type || ""}
            onChange={e => useFormStore.setState((s: any) => ({ formData: { ...s.formData, employment_type: e.target.value } }))}>
            <option value="SALARIED_PRIVATE">Private Sector</option>
            <option value="SALARIED_PSU">Public Sector</option>
            <option value="GOVERNMENT">Government</option>
            <option value="SELF_EMPLOYED_BUSINESS">Business</option>
            <option value="SELF_EMPLOYED_PROFESSIONAL">Professional</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>If I move to</label>
          <select className="input" style={{ padding: "0.75rem", fontSize: "0.85rem" }}
            value={formData.city_tier || ""}
            onChange={e => useFormStore.setState((s: any) => ({ formData: { ...s.formData, city_tier: e.target.value } }))}>
            <option value="TIER_1">Tier 1 City</option>
            <option value="TIER_2">Tier 2 City</option>
            <option value="TIER_3">Tier 3 City</option>
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end" }}>
          <button disabled={loading} onClick={handleSimulate} className="btn-primary" style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "0.5rem",
          }}>
            {loading ? <span className="spinner" /> : "Simulate →"}
          </button>
        </div>
      </div>

      {audit.is_simulation && (
        <div className="fade-in" style={{
          background: "var(--surface-2)",
          border: "1px solid var(--blue-border)",
          borderRadius: "var(--radius-sm)",
          padding: "1rem 1.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.15rem" }}>Original Gap</div>
              <div style={{ fontFamily: "monospace", fontWeight: 600 }}>{originalGap.toFixed(2)}%</div>
            </div>
            <ArrowRight size={14} color="var(--text-muted)" />
            <div style={{
              textAlign: "center",
              background: "var(--bg)",
              padding: "0.4rem 0.75rem",
              borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border)",
            }}>
              <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "0.15rem" }}>New Gap</div>
              <div style={{
                fontFamily: "monospace",
                fontWeight: 700,
                color: audit.rate_gap < originalGap ? "var(--green)" : "var(--text-primary)",
              }}>{audit.rate_gap.toFixed(2)}%</div>
            </div>
          </div>

          <div style={{
            textAlign: "center",
            background: "rgba(39, 174, 96, 0.08)",
            border: "1px solid rgba(39, 174, 96, 0.2)",
            padding: "0.5rem 1rem",
            borderRadius: "var(--radius-sm)",
          }}>
            <div style={{ fontSize: "0.6rem", textTransform: "uppercase", color: "var(--green)", fontWeight: 700, marginBottom: "0.15rem" }}>Simulated Benefit</div>
            <div style={{ fontFamily: "monospace", fontWeight: 700 }}>
              {formatLakhs(originalOverpayment - audit.overpayment_total_inr)} Saved
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
