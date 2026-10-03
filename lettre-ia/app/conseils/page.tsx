import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Conseils pour votre lettre de motivation — Ma lettre de motiv",
  description:
    "Guides pratiques pour rédiger une lettre de motivation : stage, alternance, reconversion, premier emploi, candidature spontanée.",
  alternates: { canonical: `${SITE_URL}/conseils` },
};

export default function Conseils() {
  return (
    <main className="narrow article">
      <Link href="/" className="back">← Rédiger ma lettre</Link>
      <h1>Conseils pour votre lettre de motivation</h1>
      <p className="lead">Des méthodes simples et des exemples concrets, selon votre situation.</p>
      <ul className="guide-list">
        {GUIDES.map((guide) => (
          <li key={guide.slug}>
            <Link href={`/conseils/${guide.slug}`} className="card guide-card">
              <strong>{guide.title}</strong>
              <span>{guide.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
