import type { Metadata } from "next";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { visibleProducts } from "@/lib/catalog";
import { readStore } from "@/lib/store";

export const metadata: Metadata = { title: "Boutique" };

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ categorie?: string }> }) {
  const { categorie } = await searchParams;
  const store = await readStore();
  const category = store.settings.categories.find((c) => c.slug === categorie);
  const products = visibleProducts(store).filter((p) => !category || p.category === category.slug);

  return (
    <div className="container section">
      <h1>{category ? category.name : "Boutique"}</h1>
      {category ? <p className="lead muted">{category.description}</p> : null}
      <nav className="filters" aria-label="Catégories">
        <Link href="/boutique" className={!category ? "chip active" : "chip"}>
          Tout
        </Link>
        {store.settings.categories.map((c) => (
          <Link key={c.slug} href={`/boutique?categorie=${c.slug}`} className={c.slug === category?.slug ? "chip active" : "chip"}>
            {c.name}
          </Link>
        ))}
      </nav>
      {products.length ? (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <p className="muted">Aucun produit dans cette catégorie pour l'instant.</p>
      )}
    </div>
  );
}
