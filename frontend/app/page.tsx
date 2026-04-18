import Link from "next/link";
import { ArrowRight, BarChart3, TrendingDown, Target } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-sans">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center pt-32 pb-24 px-4 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--surface-2)] text-[var(--text-secondary)] text-sm mb-8 border border-[var(--border)]">
          <span className="w-2 h-2 rounded-full bg-[var(--green)]"></span>
          Live Machine Learning Pipeline
        </div>
        <h1 className="text-5xl md:text-7xl font-bold max-w-4xl tracking-tight mb-6 leading-tight">
          Stop Guessing, <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-500">
            Start Auditing.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-12 leading-relaxed">
          The AI-powered benchmarking engine that tells you if your home loan rate is fair — with surgical precision. 
          Stop overpaying the bank in silence.
        </p>
        <Link 
          href="/audit"
          className="inline-flex items-center gap-2 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-8 py-4 rounded-lg font-semibold transition-all duration-200 shadow-[0_0_40px_-10px_var(--accent)]"
        >
          Run Free Audit
          <ArrowRight size={20} />
        </Link>
      </section>

      {/* Problem Strip */}
      <section className="py-20 border-y border-[var(--border)] bg-[var(--surface)]">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-[var(--border)]">
          <div className="pt-6 md:pt-0 md:px-8">
            <TrendingDown className="w-10 h-10 text-[var(--red)] mb-4 mx-auto md:mx-0" />
            <h3 className="text-3xl font-bold mb-2">₹3.5–6.2 Lakhs</h3>
            <p className="text-[var(--text-secondary)]">The average wealth lost per invisible rate hike cycle.</p>
          </div>
          <div className="pt-6 md:pt-0 md:px-8">
            <BarChart3 className="w-10 h-10 text-[var(--yellow)] mb-4 mx-auto md:mx-0" />
            <h3 className="text-3xl font-bold mb-2">0.5% Rate Gap</h3>
            <p className="text-[var(--text-secondary)]">Is enough to silently drain your compounding wealth over a long tenure.</p>
          </div>
          <div className="pt-6 md:pt-0 md:px-8">
            <Target className="w-10 h-10 text-[var(--green)] mb-4 mx-auto md:mx-0" />
            <h3 className="text-3xl font-bold mb-2">20 Years</h3>
            <p className="text-[var(--text-secondary)]">Of compounding silence. Take control of your financial destiny today.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 max-w-5xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">How it works</h2>
          <p className="text-[var(--text-secondary)]">A 4-step surgical ML sequence.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--surface)] p-8 rounded-xl border border-[var(--border)] hover:border-gray-600 transition-colors">
            <div className="text-[var(--text-secondary)] font-mono text-sm mb-4">01</div>
            <h3 className="text-xl font-bold mb-2">Data Ingestion</h3>
            <p className="text-[var(--text-secondary)]">We securely parse your loan configuration and financial profile.</p>
          </div>
          <div className="bg-[var(--surface)] p-8 rounded-xl border border-[var(--border)] hover:border-gray-600 transition-colors">
            <div className="text-[var(--text-secondary)] font-mono text-sm mb-4">02</div>
            <h3 className="text-xl font-bold mb-2">Peer Grouping</h3>
            <p className="text-[var(--text-secondary)]">Sklearn K-Means isolates your exact financial cohort from 50,000 borrowers.</p>
          </div>
          <div className="bg-[var(--surface)] p-8 rounded-xl border border-[var(--border)] hover:border-gray-600 transition-colors">
            <div className="text-[var(--text-secondary)] font-mono text-sm mb-4">03</div>
            <h3 className="text-xl font-bold mb-2">AI Benchmarking</h3>
            <p className="text-[var(--text-secondary)]">TabNet gradients assess what your rate *should* mathematically be.</p>
          </div>
          <div className="bg-[var(--surface)] p-8 rounded-xl border border-[var(--border)] hover:border-gray-600 transition-colors">
            <div className="text-[var(--text-secondary)] font-mono text-sm mb-4">04</div>
            <h3 className="text-xl font-bold mb-2">The Verdict</h3>
            <p className="text-[var(--text-secondary)]">We render your position along with an actionable negotiation script.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--border)] text-center text-[var(--text-secondary)] text-sm">
        <p>Powered by CatBoost + TabNet stacked ensemble. Benchmarked against real Indian home loan portfolio distributions.</p>
      </footer>
    </main>
  );
}
