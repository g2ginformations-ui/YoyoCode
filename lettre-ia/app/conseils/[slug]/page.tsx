import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Partners from "@/components/Partners";
import { GUIDES, getGuide } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return GUIDES.map((guide) => ({ slug: guide.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return {};
  const url = `${SITE_URL}/conseils/${guide.slug}`;
  return {
    title: `${guide.title} — Lettre IA`,
    description: guide.description,
    alternates: { canonical: url },
    openGraph: { title: guide.title, description: guide.description, url, type: "article", locale: "fr_FR" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const others = GUIDES.filter((g) => g.slug !== guide.slug);

  return (
    <main className="narrow article">
      <Link href="/conseils" className="back">← Tous les conseils</Link>
      <article>
        <h1>{guide.title}</h1>
        <p className="lead">{guide.intro}</p>
        {guide.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.bullets && (
              <ul>
                {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
              </ul>
            )}
          </section>
        ))}
        {guide.example && (
          <section>
            <h2>{guide.example.heading}</h2>
            <blockquote>{guide.example.text}</blockquote>
          </section>
        )}
      </article>

      <aside className="card cta">
        <h2>Une lettre sur mesure en une minute</h2>
        <p>
          Importez votre CV et l'offre : Lettre IA rédige une lettre personnalisée pour cette entreprise, sans formules
          creuses. Votre première lettre est offerte.
        </p>
        <Link href="/" className="button primary">Essayer gratuitement</Link>
      </aside>

      <Partners />

      <nav className="related" aria-label="Autres conseils">
        <h2>Autres conseils</h2>
        <ul>
          {others.map((g) => (
            <li key={g.slug}>
              <Link href={`/conseils/${g.slug}`}>{g.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
