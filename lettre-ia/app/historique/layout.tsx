import type { Metadata } from "next";

export const metadata: Metadata = { title: "Mes lettres — MyMotiv", robots: { index: false } };

export default function HistoriqueLayout({ children }: { children: React.ReactNode }) {
  return children;
}
