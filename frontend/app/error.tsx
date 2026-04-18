"use client";

import Link from "next/link";

export default function ErrorBoundary({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="min-h-screen bg-[var(--bg)] flex items-center justify-center text-[var(--text-primary)]">
      <div className="max-w-md w-full mx-auto p-8 bg-[var(--surface)] border border-[var(--border)] rounded-xl text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-[var(--red-bg)] border border-[var(--red)] flex items-center justify-center">
          <span className="text-[var(--red)] text-2xl font-bold">!</span>
        </div>
        <h2 className="text-2xl font-bold">Something went wrong</h2>
        <p className="text-[var(--text-secondary)] text-sm leading-relaxed">
          {error.message || "Our team has been notified. Please try again."}
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/audit"
            className="border border-[var(--border)] hover:bg-[var(--surface-2)] text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            New Audit
          </Link>
        </div>
      </div>
    </main>
  );
}
