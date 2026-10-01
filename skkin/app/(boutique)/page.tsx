import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { visibleProducts } from "@/lib/catalog";
import { readStore } from "@/lib/store";

export default async function HomePage() {
  const store = await readStore();
  const { settings } = store;
  const products = visibleProducts(store);
  const featured = products.filter((p) => p.featured);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-text">
            <h1>{settings.hero.title}</h1>
            <p className="lead">{settings.hero.subtitle}</p>
            {settings.hero.ctaLabel ? (
              <Link href={settings.hero.ctaHref || "/boutique"} className="button primary">
                {settings.hero.ctaLabel}
              </Link>
            ) : null}
          </div>
          {settings.hero.image ? <img className="hero-image" src={settings.hero.image} alt="" /> : null}
        </div>
      </section>

      {settings.benefits.length > 0 && (
        <section className="benefits">
          <div className="container benefits-grid">
            {settings.benefits.map((b) => (
              <div key={b.title}>
                <h3>{b.title}</h3>
                <p className="muted">{b.text}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container section">
        <div className="section-head">
          <h2>Nos essentiels</h2>
          <Link href="/boutique">Tout voir →</Link>
        </div>
        <div className="product-grid">
          {(featured.length ? featured : products.slice(0, 4)).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="container section">
        <h2>Par catégorie</h2>
        <div className="category-grid">
          {settings.categories.map((c) => (
            <Link key={c.slug} href={`/boutique?categorie=${c.slug}`} className="category-card">
              <h3>{c.name}</h3>
              <p className="muted small">{c.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {settings.testimonials.length > 0 && (
        <section className="testimonials">
          <div className="container">
            <h2>Elles en parlent</h2>
            <div className="testimonial-grid">
              {settings.testimonials.map((t, i) => (
                <blockquote key={i}>
                  <p className="stars" aria-label={`${t.rating} sur 5`}>
                    {"★".repeat(Math.max(0, Math.min(5, t.rating)))}
                  </p>
                  <p>{t.text}</p>
                  <footer className="muted small">{t.name}</footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
