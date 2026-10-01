"use client";

import { useEffect } from "react";
import { useCart } from "@/components/CartProvider";

export function ClearCart() {
  const { count, clear } = useCart();
  useEffect(() => {
    if (count) clear();
  }, [count, clear]);
  return null;
}
