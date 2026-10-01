"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { shippingFor } from "@/lib/catalog";
import { readStore, updateStore } from "@/lib/store";
import { stripeClient, stripeEnabled } from "@/lib/stripe";
import type { Order, OrderItem } from "@/lib/types";

export type CheckoutState = { error: string } | null;

type RequestedLine = { productId: string; option: string; qty: number };

async function siteUrl(): Promise<string> {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  return `${h.get("x-forwarded-proto") ?? "http"}://${h.get("host")}`;
}

export async function placeOrder(_state: CheckoutState, form: FormData): Promise<CheckoutState> {
  const field = (name: string) => String(form.get(name) ?? "").trim();
  const customer = {
    name: field("name"),
    email: field("email"),
    phone: field("phone"),
    address: field("address"),
    zip: field("zip"),
    city: field("city"),
    country: field("country") || "France",
    note: field("note"),
  };
  if (!customer.name || !customer.email || !customer.address || !customer.zip || !customer.city) {
    return { error: "Merci de remplir votre nom, e-mail et adresse de livraison." };
  }

  let requested: RequestedLine[];
  try {
    requested = JSON.parse(field("cart"));
  } catch {
    return { error: "Panier illisible, rechargez la page." };
  }

  // Les prix viennent toujours du catalogue, jamais du navigateur.
  const store = await readStore();
  const items: OrderItem[] = [];
  for (const line of Array.isArray(requested) ? requested : []) {
    const product = store.products.find((p) => p.id === line.productId && p.published);
    const qty = Math.floor(Number(line.qty));
    if (!product || !(qty > 0)) continue;
    if (product.stock < qty) return { error: `Stock insuffisant pour « ${product.name} ».` };
    const option = product.optionValues.includes(line.option) ? line.option : (product.optionValues[0] ?? "");
    items.push({ productId: product.id, name: product.name, option, priceCents: product.priceCents, qty });
  }
  if (!items.length) return { error: "Votre panier est vide." };

  const subtotalCents = items.reduce((n, i) => n + i.priceCents * i.qty, 0);
  const shippingCents = shippingFor(store, subtotalCents);
  const order: Order = {
    id: `CMD-${Date.now().toString(36).toUpperCase()}-${randomUUID().slice(0, 4).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    items,
    customer,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    status: "en attente",
    stripeSessionId: null,
  };

  let destination = `/commande/merci?commande=${order.id}`;
  if (stripeEnabled()) {
    const base = await siteUrl();
    const session = await stripeClient().checkout.sessions.create({
      mode: "payment",
      customer_email: customer.email,
      client_reference_id: order.id,
      line_items: [
        ...items.map((i) => ({
          quantity: i.qty,
          price_data: {
            currency: "eur",
            unit_amount: i.priceCents,
            product_data: { name: i.option ? `${i.name} (${i.option})` : i.name },
          },
        })),
        ...(shippingCents
          ? [{ quantity: 1, price_data: { currency: "eur", unit_amount: shippingCents, product_data: { name: "Livraison" } } }]
          : []),
      ],
      success_url: `${base}/commande/merci?commande=${order.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/panier`,
    });
    order.stripeSessionId = session.id;
    destination = session.url!;
  }

  await updateStore((s) => {
    s.orders.unshift(order);
    for (const item of items) {
      const product = s.products.find((p) => p.id === item.productId);
      if (product) product.stock = Math.max(0, product.stock - item.qty);
    }
  });
  redirect(destination);
}
