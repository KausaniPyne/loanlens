"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main style={{
      background: "var(--bg)",
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
    }}>
      <div style={{ textAlign: "center", maxWidth: "500px" }}>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "1rem", color: "var(--accent)" }}>Something went wrong</h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.7 }}>
          {error.message || "An unexpected error occurred. Please try again."}
        </p>
        <button onClick={reset} className="btn-primary">
          Try Again
        </button>
      </div>
    </main>
  );
}
