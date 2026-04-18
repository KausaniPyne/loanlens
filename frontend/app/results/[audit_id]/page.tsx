import VerdictDashboard from "@/components/verdict/VerdictDashboard";
import { redirect, notFound } from "next/navigation";
import { AuditResult } from "@/lib/types";

async function fetchAudit(auditId: string): Promise<AuditResult | null> {
  const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";
  try {
    const res = await fetch(`${BASE}/api/v1/audit/${auditId}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.error) return null;
    return data as AuditResult;
  } catch {
    return null;
  }
}

export default async function ResultsPage({ params }: { params: { audit_id: string } }) {
  const audit = await fetchAudit(params.audit_id);
  
  if (!audit) {
    notFound();
  }

  return <VerdictDashboard audit={audit} />;
}
