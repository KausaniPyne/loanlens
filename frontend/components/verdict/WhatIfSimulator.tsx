"use client";

import { useState } from "react";
import { AuditResult } from "@/lib/types";
import { runSimulation } from "@/lib/api";
import { RefreshCcw, ArrowRight } from "lucide-react";
import { formatLakhs } from "@/lib/formatters";

export default function WhatIfSimulator({ onSimulate, audit }: { onSimulate: (data: AuditResult) => void, originalProfile?: any, audit: AuditResult }) {
  // Use current metrics as base
  const baseCibil = audit.is_simulation ? audit.key_drivers.includes("SIMULATED") ? 750 : 750 : 750; 
  // Since we don't have originalProfile bound cleanly in this setup, we will just use the returned API metrics. 
  // Wait, backend `simulate` API requires sending back the *BorrowerProfile* for overriding. 
  // This is a flaw if the frontend lacks the full payload. However, since the user form is in `useFormStore`, 
  // We can fetch it directly from Zustand!
  const useFormStore = require('@/lib/store').useFormStore;
  const formData = useFormStore((s: any) => s.formData);

  const [cibil, setCibil] = useState<number>(Math.min(900, (formData.cibil_score || 720) + 40));
  const [ltvTarget, setLtvTarget] = useState<number>(
     formData.loan_amount && formData.property_value 
     ? Math.round(formData.loan_amount / formData.property_value * 100) 
     : 75
  );

  const [loading, setLoading] = useState(false);

  // Compute what original was depending if we are currently looking at a simulation result
  const originalGap = formData._base_gap || audit.rate_gap;
  const originalOverpayment = formData._base_overpayment || audit.overpayment_total_inr;

  const handleSimulate = async () => {
    setLoading(true);
    try {
        // Pre-compute loan amount based on LTV target
        const simulatedLoanAmount = (ltvTarget / 100) * (formData.property_value || 10000000);
        
        // Cache original values before first simulation
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

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
          <RefreshCcw size={120} />
      </div>
      
      <h3 className="text-xl font-bold mb-2 text-white flex items-center gap-2">
         What-If Simulator
      </h3>
      <p className="text-sm text-[var(--text-secondary)] mb-6">Instantly test how profile improvements alter your structural interest rate boundary.</p>
      
      <div className="flex flex-col md:flex-row gap-4 items-end mb-8 relative z-10">
         <div className="w-full md:w-1/3">
             <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">If my CIBIL improves to</label>
             <input type="number" min="300" max="900"
               className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded p-3 text-white font-mono focus:border-[var(--accent)] outline-none"
               value={cibil}
               onChange={e => setCibil(e.target.valueAsNumber)} />
         </div>
         <div className="w-full md:w-1/3">
             <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-2">If I reduce LTV to (%)</label>
             <input type="number" min="10" max="95" step="1"
               className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded p-3 text-white font-mono focus:border-[var(--accent)] outline-none"
               value={ltvTarget}
               onChange={e => setLtvTarget(e.target.valueAsNumber)} />
         </div>
         <div className="w-full md:w-1/3">
             <button disabled={loading} onClick={handleSimulate} className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded font-bold transition-colors flex justify-center items-center gap-2 h-[50px]">
                 {loading ? <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span> : "Simulate"}
             </button>
         </div>
      </div>

      {audit.is_simulation && (
          <div className="bg-[var(--surface-2)] border border-blue-900/50 rounded p-4 flex flex-col md:flex-row justify-between items-center gap-4 animate-[fadeIn_0.5s_ease-out]">
             <div className="flex items-center gap-4 w-full md:w-auto">
                 <div className="text-center">
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase">Original Gap</div>
                    <div className="font-mono text-white">{originalGap.toFixed(2)}%</div>
                 </div>
                 <ArrowRight className="text-[var(--text-secondary)]" size={16} />
                 <div className="text-center bg-[var(--bg)] p-2 rounded border border-[var(--border)] min-w-[80px]">
                    <div className="text-[10px] text-[var(--text-secondary)] uppercase">New Gap</div>
                    <div className={`font-mono font-bold ${audit.rate_gap < originalGap ? 'text-[var(--green)]' : 'text-white'}`}>{audit.rate_gap.toFixed(2)}%</div>
                 </div>
             </div>
             
             <div className="text-center w-full md:w-auto bg-[var(--green-bg)]/30 border border-[var(--green)]/30 px-4 py-2 rounded">
                 <div className="text-[10px] text-[var(--green)] font-bold uppercase mb-1">Simulated Benefit</div>
                 <div className="font-mono font-bold text-white">
                     {formatLakhs(originalOverpayment - audit.overpayment_total_inr)} Saved
                 </div>
             </div>
          </div>
      )}
    </div>
  );
}
