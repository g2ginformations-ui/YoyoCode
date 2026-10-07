import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NEWS, formatNewsDate, getNews } from "@/lib/news";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return NEWS.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const article = getNews((await params).slug);
  if (!article) return {};
  const url = `${SITE_URL}/actualites/${article.slug}`;
  return {
    title: `${article.title} — MyMotiv`,
    description: article.description,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.description,
      url,
      type: "article",
      locale: "fr_FR",
      publishedTime: article.date,
    },
  };
}

export default async function NewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const article = getNews((await params).slug);
  if (!article) notFound();
  const others = NEWS.filter((a) => a.slug !== article.slug);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    inLanguage: "fr-FR",
    mainEntityOfPage: `${SITE_URL}/actualites/${article.slug}`,
    author: { "@type": "Organization", name: "MyMotiv", url: SITE_URL },
    publisher: { "@type": "Organization", name: "MyMotiv", url: SITE_URL },
    citation: article.sources.map((source) => source.url),
  };

  return (
    <main id="contenu" className="narrow article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Link href="/actualites" className="back">← Toutes les actualités</Link>
      <article>
        <p className="news-meta">
          {article.category} · <time dateTime={article.date}>{formatNewsDate(article.date)}</time>
        </p>
        <h1>{article.title}</h1>
        <p className="lead">{article.intro}</p>
        {article.sections.map((section) => (
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
        <section className="news-sources">
          <h2>Sources</h2>
          <ul>
            {article.sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">{source.label}</a>{" "}
                <small>({formatNewsDate(source.date)})</small>
              </li>
            ))}
          </ul>
          <p className="news-note">
            Article d'information générale : pour votre situation personnelle, vérifiez auprès de la source officielle.
          </p>
        </section>
      </article>

      <aside className="card cta">
        <h2>Le conseil MyMotiv</h2>
        <p>{article.tip}</p>
        <Link href="/" className="button primary">Essayer gratuitement</Link>
      </aside>

      <nav className="related" aria-label="Autres actualités">
        <h2>Autres actualités</h2>
        <ul>
          {others.map((a) => (
            <li key={a.slug}>
              <Link href={`/actualites/${a.slug}`}>{a.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
