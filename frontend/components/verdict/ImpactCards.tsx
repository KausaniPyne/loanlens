import { AuditResult } from "@/lib/types";
import { formatLakhs } from "@/lib/formatters";

export default function ImpactCards({ audit }: { audit: AuditResult }) {
  const isGreen = audit.verdict === "GREEN";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. Rate Gap */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl">
         <div className="text-[var(--text-secondary)] text-sm mb-2 font-semibold tracking-wide uppercase">Rate Gap</div>
         <div className="text-3xl font-bold mb-1">
             {audit.rate_gap > 0 ? `+${audit.rate_gap.toFixed(3)}%` : audit.rate_gap === 0 ? "At Market" : `${audit.rate_gap.toFixed(3)}%`}
         </div>
         <div className="text-xs text-[var(--text-secondary)]">vs peer median of {audit.fair_rate_corridor.p50}%</div>
      </div>

      {/* 2. Overpayment / Savings */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl relative overflow-hidden">
         {/* Slight colored glow */}
         <div className={`absolute top-0 right-0 w-24 h-24 blur-3xl -mx-8 -my-8 ${isGreen ? 'bg-[var(--green)]' : 'bg-[var(--red)]'} opacity-10`}></div>
         <div className="relative z-10">
            <div className="text-[var(--text-secondary)] text-sm mb-2 font-semibold tracking-wide uppercase">
                {isGreen ? "Lifetime Savings" : "Lifetime Overpayment"}
            </div>
            <div className={`text-3xl font-bold mb-1 ${isGreen ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {isGreen ? formatLakhs(Math.abs(audit.overpayment_total_inr)) : formatLakhs(audit.overpayment_total_inr)}
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
                {isGreen ? "vs average market rates" : `over remaining ${audit.remaining_tenure_months || 0} months`}
            </div>
         </div>
      </div>

      {/* 3. Peers Analyzed */}
      <div className="bg-[var(--surface)] border border-[var(--border)] p-6 rounded-xl">
         <div className="text-[var(--text-secondary)] text-sm mb-2 font-semibold tracking-wide uppercase">Peers Analyzed</div>
         <div className="text-3xl font-bold mb-1 font-mono tracking-tighter">
             {(audit.cohort_size || 0).toLocaleString()}
         </div>
         <div className="text-xs text-[var(--text-secondary)]">borrowers with matching financial profile</div>
      </div>
    </div>
  );
}
