import { AuditResult } from "@/lib/types";
import { formatLakhs } from "@/lib/formatters";

export default function VerdictBanner({ audit }: { audit: AuditResult }) {
  let bgClass = "bg-[var(--surface-2)] border-l-4 border-[var(--border)]";
  let label = "PENDING";
  let statusLine = "";
  let subLine = `Benchmarked against ${audit.cohort_size} borrowers with similar profiles.`;

  if (audit.verdict === "GREEN") {
    bgClass = "bg-[var(--green-bg)] border-l-4 border-[var(--green)]";
    label = "ELITE DEAL";
    statusLine = `You are saving money compared to market peers.`;
  } else if (audit.verdict === "YELLOW") {
    bgClass = "bg-[var(--yellow-bg)] border-l-4 border-[var(--yellow)]";
    label = "FAIR MARKET";
    statusLine = `Your rate is perfectly average for your cohort.`;
  } else if (audit.verdict === "RED") {
    bgClass = "bg-[var(--red-bg)] border-l-4 border-[var(--red)]";
    label = "ACTION REQUIRED";
    statusLine = `You are paying ${formatLakhs(audit.overpayment_total_inr)} more than your financial peers over your remaining tenure.`;
  }

  // Flash border when simulation updates
  const borderFlash = audit.is_simulation 
    ? "animate-[flashBorder_1s_ease-out]" 
    : "";

  return (
    <div className={`w-full py-8 px-4 transition-colors duration-500 ${bgClass} ${borderFlash}`}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className={`font-bold tracking-widest text-sm mb-2 ${audit.verdict === "GREEN" ? "text-[var(--green)]" : audit.verdict === "YELLOW" ? "text-[var(--yellow)]" : "text-[var(--red)]"}`}>
             {label}
           </div>
           <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white">{statusLine}</h2>
           <p className="text-[var(--text-secondary)]">{subLine}</p>
        </div>
        
        {audit.is_simulation && (
            <div className="bg-[var(--accent)] text-white px-3 py-1 rounded text-xs font-bold uppercase tracking-wider self-start md:self-center">
                Simulation Active
            </div>
        )}
      </div>
      <style jsx>{`
        @keyframes flashBorder {
          0% { border-left-width: 16px; border-color: white; }
          100% { border-left-width: 4px; }
        }
      `}</style>
    </div>
  );
}
