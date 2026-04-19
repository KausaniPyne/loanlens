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

  const panelBtn = (idx: number, icon: React.ReactNode, title: string): React.CSSProperties => ({});

  return (
    <div style={{
      background: "var(--surface)",
      border: "1px solid var(--red-border)",
      borderRadius: "var(--radius)",
      overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        background: "var(--red-bg)",
        padding: "1.5rem 2rem",
        borderBottom: "1px solid var(--red-border)",
      }}>
        <h3 style={{ color: "var(--red)", marginBottom: "0.25rem" }}>Action Playbook</h3>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>Surgical steps to eliminate the gap.</p>
      </div>

      {/* Panels */}
      <div>
        {/* Panel 1: Negotiation Script */}
        <div style={{ borderBottom: "1px solid var(--border)" }}>
          <button onClick={() => setOpenPanel(openPanel === 1 ? 0 : 1)} style={{
            width: "100%",
            textAlign: "left",
            padding: "1.25rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <FileText size={18} color="var(--accent)" />
              <strong>Step 1 — Confront Your Lender</strong>
            </span>
            <ChevronDown size={18} style={{ transform: openPanel === 1 ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          
          <div style={{
            overflow: "hidden",
            maxHeight: openPanel === 1 ? "800px" : "0",
            transition: "max-height 0.3s ease",
          }}>
            <div style={{ padding: "0 2rem 1.5rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                Email this mathematically sound negotiation script to your RM to demand an immediate rate cut.
              </p>
              <div style={{
                position: "relative",
                background: "var(--surface-2)",
                padding: "1.25rem",
                borderRadius: "var(--radius-sm)",
                fontFamily: "monospace",
                fontSize: "0.8rem",
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
              }}>
                {action_playbook.negotiation_script.script_text}
                
                <button onClick={handleCopy} style={{
                  position: "absolute",
                  top: "0.75rem",
                  right: "0.75rem",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  color: "var(--text-primary)",
                  padding: "0.4rem 0.75rem",
                  borderRadius: "var(--radius-sm)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.7rem",
                  fontFamily: "var(--font-body)",
                }}>
                  {copied ? <CheckCircle size={14} color="var(--green)" /> : <Copy size={14} />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 2: Balance Transfer */}
        <div style={{ borderBottom: "1px solid var(--border)" }}>
          <button onClick={() => setOpenPanel(openPanel === 2 ? 0 : 2)} style={{
            width: "100%",
            textAlign: "left",
            padding: "1.25rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Banknote size={18} color="var(--accent)" />
              <strong>Step 2 — Balance Transfer Alternatives</strong>
            </span>
            <ChevronDown size={18} style={{ transform: openPanel === 2 ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          
          <div style={{
            overflow: "hidden",
            maxHeight: openPanel === 2 ? "800px" : "0",
            transition: "max-height 0.3s ease",
          }}>
            <div style={{ padding: "0 2rem 1.5rem" }}>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
                If they refuse, these alternative lenders provide better NPV after switching costs.
              </p>
              
              {bt && bt.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                    <thead>
                      <tr style={{ background: "var(--surface-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 500, color: "var(--text-secondary)" }}>Lender</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 500, color: "var(--text-secondary)" }}>Rate</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 500, color: "var(--text-secondary)" }}>Break-Even</th>
                        <th style={{ padding: "0.75rem 1rem", textAlign: "right", fontWeight: 500, color: "var(--text-secondary)" }}>Total Savings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bt.sort((a, b) => b.total_savings_post_breakeven - a.total_savings_post_breakeven).map((opt, i) => (
                        <tr key={opt.lender} style={{ borderBottom: "1px solid var(--border)" }}>
                          <td style={{ padding: "0.75rem 1rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            {i === 0 && <Star size={12} color="var(--green)" fill="var(--green)" />}
                            {opt.lender}
                          </td>
                          <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace" }}>{formatRate(opt.indicative_rate)}</td>
                          <td style={{ padding: "0.75rem 1rem" }}>{opt.break_even_months === 999 ? "Never" : `${opt.break_even_months} mos`}</td>
                          <td style={{
                            padding: "0.75rem 1rem",
                            textAlign: "right",
                            fontWeight: 700,
                            color: opt.total_savings_post_breakeven > 0 ? "var(--green)" : "var(--text-primary)",
                          }}>
                            {formatLakhs(opt.total_savings_post_breakeven)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div style={{
                  padding: "1rem",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  textAlign: "center",
                  color: "var(--text-muted)",
                  fontSize: "0.85rem",
                  fontStyle: "italic",
                }}>
                  No viable balance transfers found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel 3: CIBIL Roadmap */}
        <div>
          <button onClick={() => setOpenPanel(openPanel === 3 ? 0 : 3)} style={{
            width: "100%",
            textAlign: "left",
            padding: "1.25rem 2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "transparent",
            border: "none",
            color: "var(--text-primary)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: "0.95rem",
          }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <Rocket size={18} color="var(--accent)" />
              <strong>Step 3 — CIBIL Enhancement Plan</strong>
            </span>
            <ChevronDown size={18} style={{ transform: openPanel === 3 ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
          </button>
          
          <div style={{
            overflow: "hidden",
            maxHeight: openPanel === 3 ? "800px" : "0",
            transition: "max-height 0.3s ease",
          }}>
            <div style={{ padding: "0 2rem 1.5rem" }}>
              {cibil.target_score ? (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.85rem", fontFamily: "monospace", letterSpacing: "0.1em", color: "var(--red)" }}>Current: {cibil.current_score}</span>
                    <span style={{ fontSize: "0.85rem", fontFamily: "monospace", letterSpacing: "0.1em", color: "var(--green)" }}>Target: {cibil.target_score}</span>
                  </div>
                  <div style={{ height: "6px", background: "var(--surface-2)", borderRadius: "3px", overflow: "hidden", marginBottom: "1.5rem", position: "relative" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: "66%", background: "linear-gradient(to right, var(--red), var(--green))", borderRadius: "3px" }} />
                  </div>
                  
                  {cibil.steps && (
                    <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                      {cibil.steps.map((step, idx) => (
                        <li key={idx} style={{ display: "flex", gap: "0.75rem", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                          <div style={{
                            background: "var(--surface-2)",
                            color: "var(--text-primary)",
                            width: "22px",
                            height: "22px",
                            borderRadius: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            fontFamily: "monospace",
                            fontSize: "0.65rem",
                            border: "1px solid var(--border)",
                            marginTop: "2px",
                          }}>{idx + 1}</div>
                          <span style={{ lineHeight: 1.6 }}>{step}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  <div style={{
                    marginTop: "1.25rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "var(--surface-2)",
                    padding: "0.75rem 1rem",
                    borderRadius: "var(--radius-sm)",
                    border: "1px solid var(--border)",
                    fontSize: "0.8rem",
                  }}>
                    <span style={{ fontWeight: 600 }}>Estimated time to profile upgrade:</span>
                    <span style={{ fontFamily: "monospace", color: "var(--accent)", fontWeight: 700 }}>{cibil.timeline_days} DAYS</span>
                  </div>
                </>
              ) : (
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--green)" }}>{cibil.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
