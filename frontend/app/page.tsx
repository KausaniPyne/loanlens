"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ background: "var(--bg)", minHeight: "100vh" }}>
      {/* ── HERO SECTION ── */}
      <section style={{
        position: "relative",
        overflow: "hidden",
        padding: "6rem 2rem 5rem",
        display: "flex",
        justifyContent: "center",
      }}>
        {/* Red ambient glow */}
        <div style={{
          position: "absolute",
          top: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "800px",
          height: "800px",
          background: "radial-gradient(circle, rgba(192,57,43,0.15) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "900px", textAlign: "center", position: "relative", zIndex: 1 }}>
          <h1 style={{ fontSize: "3.8rem", marginBottom: "1.5rem", lineHeight: 1.1 }}>
            LoanLens: Stop Guessing,{" "}
            <span style={{ color: "var(--accent)" }}>Start Auditing</span>
          </h1>

          <p style={{
            fontSize: "1.2rem",
            color: "var(--text-secondary)",
            maxWidth: "700px",
            margin: "0 auto 2rem",
            lineHeight: 1.7,
          }}>
            The AI-Powered <strong style={{ color: "var(--text-primary)" }}>&quot;Financial Mirror&quot;</strong> for
            Home Loans — revealing your true market standing with surgical precision.
          </p>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap", marginBottom: "2.5rem" }}>
            <span className="pill">⚡ AI-First Advocacy</span>
            <span className="pill-blue pill">🔬 Research-Backed</span>
            <span className="pill-green pill">📊 Borrower-Centric</span>
          </div>

          <div className="quote-block" style={{ maxWidth: "500px", margin: "0 auto 3rem", textAlign: "left" }}>
            &quot;Don&apos;t just take a loan. Own your market value.&quot;
          </div>

          <Link href="/audit">
            <button className="btn-primary" style={{ fontSize: "1.1rem", padding: "1rem 3rem" }}>
              Audit Your Loan Now →
            </button>
          </Link>
        </div>
      </section>

      {/* ── PROBLEM SECTION ── */}
      <section style={{ padding: "4rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem" }}>The Problem: The Price Transparency Gap</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2.5rem", maxWidth: "800px" }}>
          Every year, millions of home loan borrowers sign off on rates they don&apos;t understand,
          can&apos;t benchmark, and have no mechanism to challenge. Banks operate on information asymmetry.
          You don&apos;t know what your neighbor got. You just sign.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div className="card-red" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>What Borrowers Don&apos;t Know</h3>
            <ul style={{ color: "var(--text-secondary)", paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.6rem", fontSize: "0.95rem" }}>
              <li>Whether their rate is above, below, or at market par</li>
              <li>How their CIBIL score translates into real rate adjustments</li>
              <li>How much extra they pay over 20 years from a 0.5% gap</li>
              <li>That switching lenders mid-loan can save lakhs — legally</li>
            </ul>
          </div>

          <div className="card" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "1rem", color: "var(--text-primary)" }}>The Real Cost of Ignorance</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", lineHeight: 1.8 }}>
              On a ₹50 lakh home loan at 8.8% vs. 8.3% over 20 years, the difference is{" "}
              <strong style={{ color: "var(--accent)" }}>₹3.5 to ₹6.2 lakhs</strong> in total interest paid.
              That&apos;s a car. A child&apos;s education. Paid silently. Paid unnecessarily.
            </p>
          </div>
        </div>
      </section>

      {/* ── SOLUTION SECTION ── */}
      <section style={{ padding: "4rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem" }}>The Solution: Your Financial Mirror</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2.5rem", maxWidth: "800px" }}>
          LoadLens is not a rate aggregator. It&apos;s a <strong style={{ color: "var(--text-primary)" }}>benchmarking engine</strong> — an
          AI-powered system that finds borrowers who look exactly like you, analyzes their rates, and tells you
          with cold precision: are you being overcharged?
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
          {[
            {
              title: "The Mirror Concept",
              desc: "LoadLens reflects your true market position — not based on what your bank told you, but on what thousands of real borrowers with identical profiles actually received.",
            },
            {
              title: "Financial Twin Matching",
              desc: "Using K-Means clustering, LoadLens identifies your \"Financial Twins\" — borrowers who share your income profile, credit score, LTV ratio, employment type, and loan tenure.",
            },
            {
              title: "Stacked AI Verdict",
              desc: "CatBoost and TabNet generate a fair-rate corridor — a range that your loan should fall within. Anything outside that corridor is an overcharge. And LoadLens tells you so.",
            },
          ].map((item, i) => (
            <div key={i} className="card" style={{ padding: "2rem" }}>
              <h3 style={{ marginBottom: "0.75rem", fontSize: "1.3rem" }}>{item.title}</h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── AI ENGINE SECTION ── */}
      <section style={{ padding: "4rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem" }}>The Brain: Stacked AI Engine</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2.5rem", maxWidth: "800px" }}>
          Most fintech tools run a single model and call it &quot;AI.&quot; LoadLens runs two fundamentally different
          neural architectures in a stacked ensemble — because no single model captures the full complexity of lending data.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
          <div className="card-red" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>⚡ CatBoost — The Precision Engine</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1rem" }}>
              A gradient boosting algorithm purpose-built for heterogeneous, tabular financial data.
              Handles categorical features natively without encoding tricks that introduce bias.
            </p>
            <ul style={{ color: "var(--text-secondary)", paddingLeft: "1.2rem", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <li>Handles categorical features natively</li>
              <li>Resistant to overfitting on small datasets</li>
              <li>Ranked #1 on financial tabular benchmarks</li>
            </ul>
          </div>

          <div className="card-red" style={{ padding: "2rem" }}>
            <h3 style={{ marginBottom: "0.75rem" }}>🔍 TabNet — The Deep Learning Auditor</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7, marginBottom: "1rem" }}>
              A transformer-inspired deep learning model that introduces sequential attention — learning which
              features to focus on, step by step, for each individual prediction.
            </p>
            <ul style={{ color: "var(--text-secondary)", paddingLeft: "1.2rem", fontSize: "0.85rem", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <li>Sequential feature attention per prediction</li>
              <li>Built-in interpretability</li>
              <li>Trained on 100K research-backed dataset</li>
            </ul>
          </div>
        </div>

        <div className="card-blue" style={{ padding: "1.5rem 2rem" }}>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
            <strong style={{ color: "var(--blue-accent)" }}>ℹ The Stacked Ensemble:</strong>{" "}
            CatBoost predictions are fed as features into TabNet&apos;s final inference layer — creating a meta-model
            that captures both structured pattern recognition and deep sequential attention. The result is a fair-rate
            prediction with measurably lower error than either model alone.
          </p>
        </div>
      </section>

      {/* ── VERDICT SECTION ── */}
      <section style={{ padding: "4rem 2rem", maxWidth: "1100px", margin: "0 auto" }}>
        <h2 style={{ marginBottom: "1rem" }}>The Verdict Interface: Traffic Light Dashboard</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2.5rem", maxWidth: "800px" }}>
          It converts a complex ensemble prediction into a single, unambiguous status — and tells you exactly
          what to do next. No jargon. Just the truth about your loan.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
          <div className="card verdict-green" style={{ padding: "2rem" }}>
            <h3 style={{ color: "var(--green)", marginBottom: "0.75rem", fontSize: "1.25rem" }}>🟢 GREEN — Elite Deal</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.7 }}>
              Your rate falls <strong>below</strong> the 25th percentile of your Financial Twin cohort. You are paying
              less than 75% of borrowers with your exact profile. Lock in your rate and revisit at next RBI rate cycle.
            </p>
          </div>
          <div className="card verdict-yellow" style={{ padding: "2rem" }}>
            <h3 style={{ color: "var(--yellow)", marginBottom: "0.75rem", fontSize: "1.25rem" }}>🟡 YELLOW — Fair Market</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.7 }}>
              Your rate falls <strong>within</strong> the 25th–75th percentile. You&apos;re at market par. Monitor quarterly.
              A 50-point CIBIL improvement or 2% LTV reduction could shift you to Green within 12 months.
            </p>
          </div>
          <div className="card verdict-red" style={{ padding: "2rem" }}>
            <h3 style={{ color: "var(--red)", marginBottom: "0.75rem", fontSize: "1.25rem" }}>🔴 RED — Action Required</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", lineHeight: 1.7 }}>
              Your rate falls <strong>above</strong> the 75th percentile. <strong>You are losing money, daily.</strong>{" "}
              LoadLens activates the negotiation module — generating a rate script, balance transfer table, and projected savings.
            </p>
          </div>
        </div>

        <div className="card-red" style={{ padding: "1.5rem 2rem", display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <span style={{ fontSize: "1.2rem" }}>⊗</span>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", lineHeight: 1.7 }}>
            A Red status on a ₹50L loan with 15 years remaining isn&apos;t just a number — it can represent{" "}
            <strong style={{ color: "var(--accent)" }}>₹4–8 lakhs</strong> in unnecessary interest payments.
            LoadLens quantifies this to the rupee and arms you to act.
          </p>
        </div>
      </section>

      {/* ── CTA FOOTER ── */}
      <section style={{
        padding: "5rem 2rem",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          bottom: "-200px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "600px",
          background: "radial-gradient(circle, rgba(192,57,43,0.12) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <h2 style={{ marginBottom: "1rem", position: "relative", zIndex: 1 }}>
          Ready to See the Truth?
        </h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", position: "relative", zIndex: 1 }}>
          Three clicks. Zero cost. Full transparency.
        </p>
        <Link href="/audit" style={{ position: "relative", zIndex: 1 }}>
          <button className="btn-primary" style={{ fontSize: "1.1rem", padding: "1rem 3rem" }}>
            Start Your Audit →
          </button>
        </Link>
      </section>
    </main>
  );
}
