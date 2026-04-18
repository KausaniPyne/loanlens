"use client";

import { AuditResult } from "@/lib/types";
import { ComposedChart, ReferenceLine, ReferenceArea, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function RatePositionChart({ audit }: { audit: AuditResult }) {
  const { p10, p25, p50, p75, p90 } = audit.fair_rate_corridor;
  const current = audit.current_rate;

  const minRange = Math.min(p10, current) - 0.2;
  const maxRange = Math.max(p90, current) + 0.2;

  // We are just drawing a reference area, so we only need a fake data array to bind the x-axis
  const data = [
    { rate: minRange },
    { rate: maxRange }
  ];

  const verdictColor = 
    audit.verdict === "GREEN" ? "var(--green)" : 
    audit.verdict === "YELLOW" ? "var(--yellow)" : "var(--red)";

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
      <h3 className="text-xl font-bold mb-6 text-white">Rate Positional Benchmarking</h3>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data}>
            <XAxis dataKey="rate" type="number" domain={[minRange, maxRange]} tickFormatter={(v) => v.toFixed(2) + "%"} stroke="var(--text-secondary)" />
            <YAxis hide domain={[0, 1]} />
            <Tooltip />

            {/* P10 to P90 Outer Band */}
            <ReferenceArea x1={p10} x2={p90} fill="var(--text-secondary)" fillOpacity={0.1} />
            
            {/* P25 to P75 Inner Band */}
            <ReferenceArea x1={p25} x2={p75} fill="var(--text-secondary)" fillOpacity={0.2} />

            {/* p25 & p75 bounds */}
            <ReferenceLine x={p25} stroke="var(--text-secondary)" strokeDasharray="3 3" label={{ position: 'insideTopLeft', value: '25th pct', fill: 'var(--text-secondary)', fontSize: 12 }} />
            <ReferenceLine x={p75} stroke="var(--text-secondary)" strokeDasharray="3 3" label={{ position: 'insideTopRight', value: '75th pct', fill: 'var(--text-secondary)', fontSize: 12 }} />

            {/* Median Line */}
            <ReferenceLine x={p50} stroke="var(--text-primary)" strokeDasharray="3 3" label={{ position: 'insideTop', value: 'Median (₹Fair Rate)', fill: 'var(--text-primary)', fontSize: 13, fontWeight: 'bold' }} />

            {/* Current Rate Line */}
            <ReferenceLine x={current} stroke={verdictColor} strokeWidth={3} label={{ position: 'top', value: `You: ${current.toFixed(2)}%`, fill: verdictColor, fontSize: 14, fontWeight: 'bold' }} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-6 justify-center text-xs text-[var(--text-secondary)]">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[var(--text-secondary)] opacity-20 border border-[var(--border)]"></div>
            Market Range (10th-90th Pct)
         </div>
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[var(--text-secondary)] opacity-40 border border-[var(--border)]"></div>
            Core Cohort (25th-75th Pct)
         </div>
      </div>
    </div>
  );
}
