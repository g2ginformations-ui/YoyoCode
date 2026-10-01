"use client";

import { useState } from "react";
import { useCart } from "@/components/CartProvider";
import type { Product } from "@/lib/types";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [option, setOption] = useState(product.optionValues[0] ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const soldOut = product.stock <= 0;

  return (
    <div className="add-to-cart">
      {product.optionValues.length > 0 && (
        <fieldset className="options">
          <legend>{product.optionName || "Option"}</legend>
          {product.optionValues.map((value) => (
            <button key={value} type="button" className={value === option ? "chip active" : "chip"} onClick={() => setOption(value)}>
              {value}
            </button>
          ))}
        </fieldset>
      )}
      <div className="buy-row">
        <label className="qty">
          <span className="sr-only">Quantité</span>
          <button type="button" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Moins">−</button>
          <span>{qty}</span>
          <button type="button" onClick={() => setQty(qty + 1)} aria-label="Plus">+</button>
        </label>
        <button
          type="button"
          className="button primary grow"
          disabled={soldOut}
          onClick={() => {
            add({
              productId: product.id,
              slug: product.slug,
              name: product.name,
              image: product.images[0] ?? "",
              option,
              priceCents: product.priceCents,
              qty,
            });
            setAdded(true);
            setTimeout(() => setAdded(false), 2000);
          }}
        >
          {soldOut ? "Épuisé" : added ? "Ajouté au panier ✓" : "Ajouter au panier"}
        </button>
      </div>
    </div>
  );
}
