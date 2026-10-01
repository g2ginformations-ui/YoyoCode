"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export function CartButton() {
  const { count } = useCart();
  return (
    <Link href="/panier" className="cart-button" aria-label={`Panier, ${count} article${count > 1 ? "s" : ""}`}>
      Panier <span className="cart-count">{count}</span>
    </Link>
  );
}
