"use client";

import { useState } from "react";
import { AuditResult } from "@/lib/types";
import VerdictBanner from "./VerdictBanner";
import RatePositionChart from "./RatePositionChart";
import ImpactCards from "./ImpactCards";
import KeyDrivers from "./KeyDrivers";
import ActionPlaybook from "./ActionPlaybook";
import WhatIfSimulator from "./WhatIfSimulator";
import Link from "next/link";

export default function VerdictDashboard({ audit }: { audit: AuditResult }) {
  const [currentAudit, setCurrentAudit] = useState<AuditResult>(audit);

  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh", paddingBottom: "6rem" }}>
      {/* Top Nav */}
      <div style={{
        padding: "1rem 2rem",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <Link href="/" style={{ color: "var(--text-muted)", textDecoration: "none", fontSize: "0.85rem" }}>
          ← Back to LoanLens
        </Link>
        <Link href="/audit">
          <button className="btn-outline" style={{ padding: "0.5rem 1.25rem", fontSize: "0.8rem" }}>
            New Audit
          </button>
        </Link>
      </div>

      {/* Banner */}
      <div style={{ padding: "2rem 2rem 0", maxWidth: "1200px", margin: "0 auto" }}>
        <VerdictBanner audit={currentAudit} />
      </div>

      {/* Dashboard Content */}
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem" }}>
          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            <RatePositionChart audit={currentAudit} />
            <ImpactCards audit={currentAudit} />

            {currentAudit.verdict === "RED" && (
              <ActionPlaybook action_playbook={currentAudit.action_playbook!} />
            )}

            <WhatIfSimulator 
              originalProfile={null}
              audit={currentAudit}
              onSimulate={setCurrentAudit}
            />
          </div>

          {/* Right Column */}
          <div>
            <KeyDrivers key_drivers={currentAudit.key_drivers} />
          </div>
        </div>
      </div>
    </main>
  );
}
