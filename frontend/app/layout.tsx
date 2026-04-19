import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LoanLens — Stop Guessing, Start Auditing",
  description: "AI-powered home loan benchmarking engine. The Financial Mirror that reveals your true market standing with surgical precision.",
  keywords: ["home loan", "interest rate", "benchmarking", "AI", "CIBIL", "fair rate"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
