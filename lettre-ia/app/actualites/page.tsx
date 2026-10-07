import type { Metadata } from "next";
import Link from "next/link";
import { NEWS, formatNewsDate } from "@/lib/news";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Actualités de l'emploi, de l'alternance et du droit du travail — MyMotiv",
  description:
    "Les dernières nouveautés du recrutement, de l'intérim, de l'alternance, des stages et du droit du travail, expliquées simplement et sourcées.",
  alternates: { canonical: `${SITE_URL}/actualites` },
};

export default function Actualites() {
  const articles = [...NEWS].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <main id="contenu" className="narrow article">
      <Link href="/" className="back">← Rédiger ma lettre</Link>
      <h1>Actualités de l'emploi</h1>
      <p className="lead">
        Recrutement, intérim, alternance, stages et droit du travail : les nouveautés qui comptent pour votre recherche,
        expliquées simplement. Chaque article cite ses sources.
      </p>
      <ul className="guide-list">
        {articles.map((article) => (
          <li key={article.slug}>
            <Link href={`/actualites/${article.slug}`} className="card guide-card">
              <small className="news-meta">
                {article.category} · {formatNewsDate(article.date)}
              </small>
              <strong>{article.title}</strong>
              <span>{article.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
