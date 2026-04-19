import Link from "next/link";

export default function NotFound() {
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
        <h1 style={{ fontSize: "5rem", marginBottom: "0.5rem", color: "var(--accent)" }}>404</h1>
        <h2 style={{ marginBottom: "1rem" }}>Audit Not Found</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "2rem", lineHeight: 1.7 }}>
          This audit ID doesn&apos;t exist or has expired. Run a new audit to benchmark your loan.
        </p>
        <Link href="/audit">
          <button className="btn-primary">
            Start a New Audit →
          </button>
        </Link>
      </div>
    </main>
  );
}
