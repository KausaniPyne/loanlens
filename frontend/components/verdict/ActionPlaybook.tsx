import { useState } from "react";
import { ActionPlaybook } from "@/lib/types";
import { Copy, CheckCircle, ChevronDown, Rocket, FileText, Banknote, Star } from "lucide-react";
import { formatRate, formatLakhs } from "@/lib/formatters";

export default function ActionPlaybookComponent({ action_playbook }: { action_playbook: ActionPlaybook }) {
  const [openPanel, setOpenPanel] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  if (!action_playbook) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(action_playbook.negotiation_script.script_text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cibil = action_playbook.cibil_roadmap;
  const bt = action_playbook.balance_transfer_options;

  return (
    <div className="bg-[var(--surface)] border border-[var(--red)] border-opacity-30 rounded-xl overflow-hidden shadow-[0_0_20px_-5px_var(--red-bg)]">
      <div className="bg-[var(--red-bg)] p-6 border-b border-[var(--red)] border-opacity-30">
        <h3 className="text-xl font-bold tracking-tight text-[var(--red)]">Action Playbook</h3>
        <p className="text-[var(--text-secondary)] mt-1">Surgical steps to eliminate the gap.</p>
      </div>

      <div className="divide-y divide-[var(--border)]">
        
        {/* Panel 1: Negotiation Script */}
        <div>
          <button onClick={() => setOpenPanel(openPanel === 1 ? 0 : 1)} className="w-full text-left p-6 flex justify-between items-center hover:bg-[var(--surface-2)] transition-colors">
            <div className="flex items-center gap-3">
               <FileText className="text-[var(--accent)]" />
               <span className="font-semibold">Step 1: Confront Your Lender</span>
            </div>
            <ChevronDown className={`transition-transform ${openPanel === 1 ? "rotate-180" : ""}`} />
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ${openPanel === 1 ? "max-h-[800px]" : "max-h-0"}`}>
            <div className="px-6 pb-6 pt-2">
               <p className="text-sm text-[var(--text-secondary)] mb-4">Email this mathematically sound negotiation script to your RM to demand an immediate rate cut.</p>
               <div className="relative bg-[var(--surface-2)] p-4 rounded-lg font-mono text-xs md:text-sm text-gray-300 border border-[var(--border)] leading-relaxed whitespace-pre-wrap">
                  {action_playbook.negotiation_script.script_text}
                  
                  <button onClick={handleCopy} className="absolute top-4 right-4 bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--accent)] text-white p-2 rounded transition-colors flex items-center gap-2">
                     {copied ? <CheckCircle size={16} className="text-[var(--green)]" /> : <Copy size={16} />}
                     <span className="text-xs font-sans">{copied ? "Copied!" : "Copy"}</span>
                  </button>
               </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Balance Transfer Analysis */}
        <div>
          <button onClick={() => setOpenPanel(openPanel === 2 ? 0 : 2)} className="w-full text-left p-6 flex justify-between items-center hover:bg-[var(--surface-2)] transition-colors">
            <div className="flex items-center gap-3">
               <Banknote className="text-[var(--accent)]" />
               <span className="font-semibold">Step 2: Balance Transfer Alternatives</span>
            </div>
            <ChevronDown className={`transition-transform ${openPanel === 2 ? "rotate-180" : ""}`} />
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ${openPanel === 2 ? "max-h-[800px]" : "max-h-0"}`}>
            <div className="px-6 pb-6 pt-2">
               <p className="text-sm text-[var(--text-secondary)] mb-4">If they refuse, these alternative lenders currently provide better NPV after computing switching costs.</p>
               
               {bt && bt.length > 0 ? (
                 <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                      <thead>
                        <tr className="bg-[var(--surface-2)] text-[var(--text-secondary)] border-y border-[var(--border)]">
                          <th className="py-3 px-4 font-medium">Lender</th>
                          <th className="py-3 px-4 font-medium">Rate</th>
                          <th className="py-3 px-4 font-medium">Max Break-Even</th>
                          <th className="py-3 px-4 font-medium text-right">Total Savings (After Fees)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {bt.sort((a,b) => b.total_savings_post_breakeven - a.total_savings_post_breakeven).map((opt, i) => (
                           <tr key={opt.lender} className={i === 0 ? "bg-[var(--green-bg)]/20" : ""}>
                             <td className="py-3 px-4 font-semibold flex items-center gap-2">
                               {i === 0 && <Star size={14} className="text-[var(--green)] fill-[var(--green)]" />}
                               {opt.lender}
                             </td>
                             <td className="py-3 px-4 font-mono">{formatRate(opt.indicative_rate)}</td>
                             <td className="py-3 px-4">{opt.break_even_months === 999 ? "Never" : `${opt.break_even_months} mos`}</td>
                             <td className={`py-3 px-4 text-right font-bold ${opt.total_savings_post_breakeven > 0 ? "text-[var(--green)]" : ""}`}>
                                {formatLakhs(opt.total_savings_post_breakeven)}
                             </td>
                           </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               ) : (
                 <div className="text-sm text-gray-500 italic p-4 border border-[var(--border)] rounded text-center">No viable balance transfers found.</div>
               )}
            </div>
          </div>
        </div>

        {/* Panel 3: CIBIL Roadmap */}
        <div>
          <button onClick={() => setOpenPanel(openPanel === 3 ? 0 : 3)} className="w-full text-left p-6 flex justify-between items-center hover:bg-[var(--surface-2)] transition-colors">
            <div className="flex items-center gap-3">
               <Rocket className="text-[var(--accent)]" />
               <span className="font-semibold">Step 3: CIBIL Enhancement Plan</span>
            </div>
            <ChevronDown className={`transition-transform ${openPanel === 3 ? "rotate-180" : ""}`} />
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ${openPanel === 3 ? "max-h-[800px]" : "max-h-0"}`}>
            <div className="px-6 pb-6 pt-2">
               {cibil.target_score ? (
                   <>
                     <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono tracking-widest text-[var(--red)]">Current: {cibil.current_score}</span>
                        <span className="text-sm font-mono tracking-widest text-[var(--green)]">Target: {cibil.target_score}</span>
                     </div>
                     <div className="h-2 bg-[var(--surface-2)] rounded-full overflow-hidden mb-6 relative">
                         {/* Fake fill */}
                         <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-[var(--red)] to-[var(--green)] w-2/3"></div>
                     </div>
                     
                     {cibil.steps && (
                         <ul className="space-y-3">
                            {cibil.steps.map((step, idx) => (
                                <li key={idx} className="flex gap-3 text-sm text-[var(--text-secondary)]">
                                   <div className="bg-[var(--surface-2)] text-[var(--text-primary)] w-5 h-5 rounded flex items-center justify-center shrink-0 font-mono text-[10px] border border-[var(--border)] mt-0.5">{idx+1}</div>
                                   <span className="leading-relaxed">{step}</span>
                                </li>
                            ))}
                         </ul>
                     )}
                     
                     <div className="mt-6 flex items-center justify-between bg-[var(--surface-2)] p-3 rounded border border-[var(--border)] text-xs">
                         <span className="font-semibold text-white">Estimated time to profile upgrade:</span>
                         <span className="font-mono text-[var(--accent)]">{cibil.timeline_days} DAYS</span>
                     </div>
                   </>
               ) : (
                   <p className="text-sm font-bold text-[var(--green)]">{cibil.message}</p>
               )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
