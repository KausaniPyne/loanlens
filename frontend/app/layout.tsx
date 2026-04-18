import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoanLens — AI Home Loan Benchmarking",
  description:
    "Audit your home loan interest rate against similar borrowers. Discover if you're overpaying and get a personalised negotiation playbook.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
