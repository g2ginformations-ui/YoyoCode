import type { Product, Store } from "@/lib/types";

export function visibleProducts(store: Store): Product[] {
  return store.products.filter((p) => p.published).sort((a, b) => a.position - b.position);
}

export function shippingFor(store: Store, subtotalCents: number): number {
  const { shippingCents, freeShippingFromCents } = store.settings;
  return subtotalCents === 0 || (freeShippingFromCents > 0 && subtotalCents >= freeShippingFromCents) ? 0 : shippingCents;
}
