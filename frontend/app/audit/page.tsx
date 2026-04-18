export default function AuditPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Audit</h1>
        <p className="text-gray-600 mb-8">
          Enter your loan details to benchmark your interest rate.
        </p>
        {/* FormWrapper component will be integrated in Phase 04 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-400 text-center">
            Audit form — placeholder for Phase 04
          </p>
        </div>
      </div>
    </main>
  );
}
