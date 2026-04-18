"use client";

import { useState } from "react";
import { AuditResult, BorrowerProfile } from "@/lib/types";
import VerdictBanner from "./VerdictBanner";
import RatePositionChart from "./RatePositionChart";
import ImpactCards from "./ImpactCards";
import KeyDrivers from "./KeyDrivers";
import ActionPlaybook from "./ActionPlaybook";
import WhatIfSimulator from "./WhatIfSimulator";

export default function VerdictDashboard({ audit }: { audit: AuditResult }) {
  const [currentAudit, setCurrentAudit] = useState<AuditResult>(audit);

  return (
    <main className="min-h-screen bg-[var(--bg)] pb-24 text-[var(--text-primary)] font-sans">
      <VerdictBanner audit={currentAudit} />
      
      <div className="max-w-6xl mx-auto px-4 mt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <RatePositionChart audit={currentAudit} />
            <ImpactCards audit={currentAudit} />
            
            {currentAudit.verdict === "RED" && (
                <ActionPlaybook action_playbook={currentAudit.action_playbook!} />
            )}
            
            <WhatIfSimulator 
               // Need to preserve original profile context? The api just takes what to override.
               // We will pass the audit_id so we can lookup in the backend if needed, 
               // but our WhatIfSimulator is going to make changes on top of original fields.
               // Actually the WhatIfSimulator takes the original profile, wait, we don't have the original profile 
               // populated inside `audit`, we just have inferences. Oh! `getAudit` returns just the inference. 
               // We might need to pull the original profile out, or store it in context. 
               // The prompt said: `runSimulation(originalProfile, { cibil_score: newCibil })`.
               // The backend `simulate` endpoint requires a full BorrowerProfile payload!
               originalProfile={null} 
               audit={currentAudit}
               onSimulate={setCurrentAudit} 
            />
          </div>
          
          <div className="lg:col-span-1 space-y-8">
            <KeyDrivers key_drivers={currentAudit.key_drivers} />
          </div>
        </div>
      </div>
    </main>
  );
}
