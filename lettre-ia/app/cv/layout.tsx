import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mon CV adapté à l'offre — MyMotiv",
  description: "Votre CV réorganisé pour l'offre visée, sur une page, en PDF. Rien n'est inventé.",
};

export default function CvLayout({ children }: { children: React.ReactNode }) {
  return children;
}
