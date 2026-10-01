import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/produits/${product.slug}`} className="product-card">
      <div className="product-image">
        {product.images[0] ? <img src={product.images[0]} alt={product.name} loading="lazy" /> : null}
        {product.compareAtCents ? <span className="badge">Promo</span> : null}
        {product.stock <= 0 ? <span className="badge dark">Épuisé</span> : null}
      </div>
      <h3>{product.name}</h3>
      {product.subtitle ? <p className="muted small">{product.subtitle}</p> : null}
      <p className="price">
        {formatPrice(product.priceCents)}
        {product.compareAtCents ? <s>{formatPrice(product.compareAtCents)}</s> : null}
      </p>
    </Link>
  );
}
