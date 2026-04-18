"use client";
import { useFormStore } from "@/lib/store";

export default function StepTwo() {
  const { formData, updateForm, setStep } = useFormStore();

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  return (
    <form onSubmit={handleNext} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Annual Income</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-[var(--text-secondary)]">₹</span>
            <input required type="number" min="100000" 
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded p-2 pl-8 focus:border-[var(--accent)] outline-none"
              value={formData.annual_income || ""}
              onChange={(e) => updateForm({ annual_income: Number(e.target.value) })} />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--text-secondary)]">Existing Monthly Obligations</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-[var(--text-secondary)]">₹</span>
            <input required type="number" min="0" title="Include all current EMIs, credit card minimums, and loan repayments."
              className="w-full bg-[var(--surface-2)] border border-[var(--border)] rounded p-2 pl-8 focus:border-[var(--accent)] outline-none"
              value={formData.existing_obligations_monthly ?? ""}
              onChange={(e) => updateForm({ existing_obligations_monthly: Number(e.target.value) })} />
          </div>
          <p className="text-xs text-[var(--text-secondary)] mt-1">Total of all your EMIs/dues</p>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-2">
          <label className="block text-sm font-medium text-[var(--text-secondary)]">CIBIL Score</label>
          <span className="text-2xl font-bold font-mono text-[var(--accent)]">{formData.cibil_score || 300}</span>
        </div>
        <input required type="range" min="300" max="900" step="1"
            className="w-full accent-[var(--accent)]"
            value={formData.cibil_score || 300}
            onChange={(e) => updateForm({ cibil_score: Number(e.target.value) })} />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>300</span><span>900</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">Employment Type</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {["SALARIED_PRIVATE", "SALARIED_PSU", "SELF_EMPLOYED_BUSINESS", "SELF_EMPLOYED_PROFESSIONAL", "GOVERNMENT"].map(type => (
            <label key={type} className={`border p-3 rounded cursor-pointer transition-colors ${formData.employment_type === type ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-white' : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-gray-600'}`}>
                <input required type="radio" className="hidden" name="employment" value={type} 
                  checked={formData.employment_type === type} 
                  onChange={(e) => updateForm({ employment_type: e.target.value as any })} />
                <span className="text-sm font-medium">{type.replace(/_/g, ' ')}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-[var(--text-secondary)]">City Tier</label>
        <div className="grid grid-cols-3 gap-2">
           <label className={`border border-[var(--border)] p-3 rounded text-center cursor-pointer transition-colors ${formData.city_tier === "TIER_1" ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-white' : 'text-[var(--text-secondary)] hover:border-gray-600'}`}>
              <input required type="radio" className="hidden" name="city" value="TIER_1"
                 checked={formData.city_tier === "TIER_1"} onChange={(e) => updateForm({ city_tier: "TIER_1" })} />
              <div className="text-sm font-medium">Tier 1</div>
              <div className="text-[10px] mt-1 opacity-60">Mumbai, Delhi, Blr</div>
           </label>
           <label className={`border border-[var(--border)] p-3 rounded text-center cursor-pointer transition-colors ${formData.city_tier === "TIER_2" ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-white' : 'text-[var(--text-secondary)] hover:border-gray-600'}`}>
              <input required type="radio" className="hidden" name="city" value="TIER_2"
                 checked={formData.city_tier === "TIER_2"} onChange={(e) => updateForm({ city_tier: "TIER_2" })} />
              <div className="text-sm font-medium">Tier 2</div>
              <div className="text-[10px] mt-1 opacity-60">Pune, Hyd, Chen</div>
           </label>
           <label className={`border border-[var(--border)] p-3 rounded text-center cursor-pointer transition-colors ${formData.city_tier === "TIER_3" ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-white' : 'text-[var(--text-secondary)] hover:border-gray-600'}`}>
              <input required type="radio" className="hidden" name="city" value="TIER_3"
                 checked={formData.city_tier === "TIER_3"} onChange={(e) => updateForm({ city_tier: "TIER_3" })} />
              <div className="text-sm font-medium">Tier 3</div>
              <div className="text-[10px] mt-1 opacity-60">Others</div>
           </label>
        </div>
      </div>

      <div className="flex gap-4">
        <button type="button" onClick={() => setStep(1)} className="w-1/3 border border-[var(--border)] hover:bg-[var(--surface-2)] text-white py-3 rounded-lg font-semibold transition-colors">
            Back
        </button>
        <button type="submit" className="w-2/3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white py-3 rounded-lg font-semibold transition-colors">
            Review Details
        </button>
      </div>
    </form>
  );
}
