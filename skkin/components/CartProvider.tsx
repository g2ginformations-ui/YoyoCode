"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = { productId: string; slug: string; name: string; image: string; option: string; priceCents: number; qty: number };

type Cart = {
  lines: CartLine[];
  count: number;
  subtotalCents: number;
  add: (line: CartLine) => void;
  setQty: (productId: string, option: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<Cart | null>(null);
const STORAGE_KEY = "skkin_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setLines(JSON.parse(saved));
    } catch {}
  }, []);

  const persist = (next: CartLine[]) => {
    setLines(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {}
  };

  const value = useMemo<Cart>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotalCents: lines.reduce((n, l) => n + l.qty * l.priceCents, 0),
      add: (line) => {
        const existing = lines.find((l) => l.productId === line.productId && l.option === line.option);
        persist(
          existing
            ? lines.map((l) => (l === existing ? { ...l, qty: l.qty + line.qty } : l))
            : [...lines, line],
        );
      },
      setQty: (productId, option, qty) =>
        persist(
          qty <= 0
            ? lines.filter((l) => !(l.productId === productId && l.option === option))
            : lines.map((l) => (l.productId === productId && l.option === option ? { ...l, qty } : l)),
        ),
      clear: () => persist([]),
    }),
    [lines],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): Cart {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart doit être utilisé dans <CartProvider>.");
  return cart;
}
