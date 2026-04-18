import { BrainCircuit, Activity, LineChart, Star, Briefcase, MapPin, Building, ShieldCheck, Scale, DollarSign } from "lucide-react";
import { FEATURE_LABELS } from "@/lib/formatters";

const getExplanation = (featureKey: string) => {
  switch (featureKey) {
    case "cibil_score_scaled": return "Your credit score is the dominant rate determinant.";
    case "dti_ratio_scaled": return "Your debt load relative to income influenced the prediction.";
    case "ltv_ratio_scaled": return "How much you borrowed vs property value affected pricing.";
    case "employment_encoded": return "Your employment category carries a risk premium.";
    case "city_encoded": return "Geographic property factors and local norms applied.";
    case "log_loan_amount_scaled": return "The absolute volume of capital borrowed shifts margin tiers.";
    case "log_annual_income_scaled": return "Income elasticity dictates repayment safety scores.";
    case "loan_tenure_scaled": return "Time decay and duration risk shifted the rate curve.";
    case "catboost_pred": return "AI matched your profile to historic non-linear rate boundaries.";
    default: return "This factor mathematically swung grading margins.";
  }
};

const getIcon = (featureKey: string) => {
    switch(featureKey) {
        case "cibil_score_scaled": return <ShieldCheck size={20} className="text-[var(--accent)]" />;
        case "dti_ratio_scaled": return <Scale size={20} className="text-[var(--yellow)]" />;
        case "ltv_ratio_scaled": return <Building size={20} className="text-[var(--green)]" />;
        case "employment_encoded": return <Briefcase size={20} className="text-[var(--text-secondary)]" />;
        case "city_encoded": return <MapPin size={20} className="text-[var(--text-secondary)]" />;
        case "log_loan_amount_scaled": return <DollarSign size={20} className="text-[var(--text-secondary)]" />;
        case "log_annual_income_scaled": return <Activity size={20} className="text-[var(--text-secondary)]" />;
        case "catboost_pred": return <BrainCircuit size={20} className="text-[var(--text-secondary)]" />;
        default: return <LineChart size={20} className="text-[var(--text-secondary)]" />;
    }
}

export default function KeyDrivers({ key_drivers }: { key_drivers: string[] }) {
  if (!key_drivers || key_drivers.length === 0) return null;
  const topDrivers = key_drivers.slice(0, 3);

  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
         <Star size={20} className="text-[var(--yellow)] fill-[var(--yellow)]" />
         <h3 className="text-xl font-bold text-white">AI Grading Drivers</h3>
      </div>
      <p className="text-sm text-[var(--text-secondary)] mb-6">TabNet neural attention weighted these factors highest for your specific rate prediction.</p>
      
      <div className="space-y-4">
        {topDrivers.map((driver, idx) => (
          <div key={driver} className="flex gap-4 p-4 rounded-lg bg-[var(--surface-2)] border border-[var(--border)] items-start">
            <div className="mt-1 bg-[var(--surface)] p-2 rounded-full border border-[var(--border)]">
                {getIcon(driver)}
            </div>
            <div>
               <div className="font-semibold text-white mb-1 flex items-center gap-2">
                 {FEATURE_LABELS[driver] || driver}
                 <span className="text-[10px] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded-full text-[var(--text-secondary)] font-mono">#{idx+1}</span>
               </div>
               <div className="text-sm text-[var(--text-secondary)] leading-relaxed">
                 {getExplanation(driver)}
               </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
