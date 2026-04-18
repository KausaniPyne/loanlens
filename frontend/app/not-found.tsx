import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--text-primary)]">
      <div className="max-w-md w-full mx-auto p-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-center space-y-6">
        <div className="text-6xl font-bold text-[var(--text-secondary)]">404</div>
        <h2 className="text-2xl font-bold">Audit Not Found</h2>
        <p className="text-[var(--text-secondary)] text-sm">
          This audit ID does not exist or has expired.
        </p>
        <Link
          href="/audit"
          className="inline-block bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
        >
          Run New Audit
        </Link>
      </div>
    </main>
  );
}
