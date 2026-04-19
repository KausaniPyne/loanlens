"use client";

import { AuditResult } from "@/lib/types";
import { ComposedChart, ReferenceLine, ReferenceArea, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function RatePositionChart({ audit }: { audit: AuditResult }) {
  const { p10, p25, p50, p75, p90 } = audit.fair_rate_corridor;
  const current = audit.current_rate;

  const minRange = Math.min(p10, current) - 0.3;
  const maxRange = Math.max(p90, current) + 0.3;

  const data = [
    { rate: minRange },
    { rate: maxRange }
  ];

  const verdictColor = 
    audit.verdict === "GREEN" ? "var(--green)" : 
    audit.verdict === "YELLOW" ? "var(--yellow)" : "var(--red)";

  return (
    <div className="card" style={{ padding: "2rem" }}>
      <h3 style={{ marginBottom: "1.5rem" }}>Rate Positional Benchmarking</h3>
      
      <div style={{ height: "250px", width: "100%" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey="rate" type="number" domain={[minRange, maxRange]}
              tickFormatter={(v) => v.toFixed(2) + "%"}
              stroke="var(--text-muted)" tick={{ fill: "var(--text-secondary)", fontSize: 11 }} />
            <YAxis hide domain={[0, 1]} />
            <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }} />

            {/* P10 to P90 Outer Band */}
            <ReferenceArea x1={p10} x2={p90} fill="var(--text-secondary)" fillOpacity={0.06} />
            
            {/* P25 to P75 Inner Band */}
            <ReferenceArea x1={p25} x2={p75} fill="var(--text-secondary)" fillOpacity={0.12} />

            {/* p25 & p75 bounds */}
            <ReferenceLine x={p25} stroke="var(--text-muted)" strokeDasharray="3 3"
              label={{ position: "insideTopLeft", value: "25th pct", fill: "var(--text-muted)", fontSize: 11 }} />
            <ReferenceLine x={p75} stroke="var(--text-muted)" strokeDasharray="3 3"
              label={{ position: "insideTopRight", value: "75th pct", fill: "var(--text-muted)", fontSize: 11 }} />

            {/* Median Line */}
            <ReferenceLine x={p50} stroke="var(--text-secondary)" strokeDasharray="5 3" strokeWidth={2}
              label={{ position: "insideTop", value: "Median (Fair Rate)", fill: "var(--text-primary)", fontSize: 12, fontWeight: "bold" }} />

            {/* Current Rate Line */}
            <ReferenceLine x={current} stroke={verdictColor} strokeWidth={3}
              label={{ position: "top", value: `You: ${current.toFixed(2)}%`, fill: verdictColor, fontSize: 13, fontWeight: "bold" }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.25rem", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          <div style={{ width: "12px", height: "12px", background: "var(--text-secondary)", opacity: 0.1, border: "1px solid var(--border)", borderRadius: "2px" }} />
          Market Range (10th-90th)
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>
          <div style={{ width: "12px", height: "12px", background: "var(--text-secondary)", opacity: 0.2, border: "1px solid var(--border)", borderRadius: "2px" }} />
          Core Cohort (25th-75th)
        </div>
      </div>
    </div>
  );
}
