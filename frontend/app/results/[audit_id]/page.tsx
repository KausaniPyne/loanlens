import { getAudit } from "@/lib/api";
import VerdictDashboard from "@/components/verdict/VerdictDashboard";
import { redirect } from "next/navigation";

export default async function ResultsPage({ params }: { params: { audit_id: string } }) {
  try {
    const audit = await getAudit(params.audit_id);
    if (!audit || audit.error as any) {
        return redirect("/audit");
    }
    return <VerdictDashboard audit={audit} />;
  } catch (err) {
    return redirect("/audit");
  }
}
