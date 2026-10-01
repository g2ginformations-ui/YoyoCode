import type { Metadata } from "next";
import { CartView } from "@/app/(boutique)/panier/CartView";
import { readStore } from "@/lib/store";
import { stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = { title: "Panier" };

export default async function CartPage() {
  const { settings } = await readStore();
  return (
    <div className="container section">
      <h1>Votre panier</h1>
      <CartView
        shippingCents={settings.shippingCents}
        freeShippingFromCents={settings.freeShippingFromCents}
        onlinePayment={stripeEnabled()}
      />
    </div>
  );
}
