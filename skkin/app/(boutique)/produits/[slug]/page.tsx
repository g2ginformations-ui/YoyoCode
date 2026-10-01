import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AddToCart } from "@/components/AddToCart";
import { Markdown } from "@/components/Markdown";
import { ProductCard } from "@/components/ProductCard";
import { visibleProducts } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { readStore } from "@/lib/store";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = (await readStore()).products.find((p) => p.slug === slug && p.published);
  return product ? { title: product.name, description: product.subtitle } : {};
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const store = await readStore();
  const products = visibleProducts(store);
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);

  return (
    <div className="container section">
      <div className="product-layout">
        <div className="gallery">
          {product.images.length ? (
            product.images.map((src, i) => <img key={src + i} src={src} alt={i === 0 ? product.name : ""} />)
          ) : (
            <div className="product-image" />
          )}
        </div>
        <div className="product-info">
          <h1>{product.name}</h1>
          {product.subtitle ? <p className="lead muted">{product.subtitle}</p> : null}
          <p className="price big">
            {formatPrice(product.priceCents)}
            {product.compareAtCents ? <s>{formatPrice(product.compareAtCents)}</s> : null}
          </p>
          <AddToCart product={product} />
          {product.description ? <Markdown source={product.description} /> : null}
          {product.howToUse ? (
            <details open>
              <summary>Utilisation</summary>
              <Markdown source={product.howToUse} />
            </details>
          ) : null}
          {product.ingredients ? (
            <details>
              <summary>Composition</summary>
              <Markdown source={product.ingredients} />
            </details>
          ) : null}
        </div>
      </div>
      {related.length > 0 && (
        <section className="section">
          <h2>Vous aimerez aussi</h2>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
