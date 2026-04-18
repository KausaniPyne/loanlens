export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-brand-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-brand-800 mb-4">LoanLens</h1>
        <p className="text-xl text-brand-600 mb-8">
          AI-Powered Home Loan Benchmarking Engine
        </p>
        <a
          href="/audit"
          className="inline-block px-8 py-3 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 transition-colors"
        >
          Start Your Audit
        </a>
      </div>
    </main>
  );
}
