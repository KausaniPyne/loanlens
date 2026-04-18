export default function ResultsPage({
  params,
}: {
  params: { audit_id: string };
}) {
  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Results</h1>
        <p className="text-gray-600 mb-8">Audit ID: {params.audit_id}</p>
        {/* Verdict components will be integrated in Phase 04 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <p className="text-gray-400 text-center">
            Results dashboard — placeholder for Phase 04
          </p>
        </div>
      </div>
    </main>
  );
}
