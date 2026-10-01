import type { Metadata } from "next";
import Link from "next/link";
import { ClearCart } from "@/app/(boutique)/commande/merci/ClearCart";
import { formatPrice } from "@/lib/format";
import { readStore, updateStore } from "@/lib/store";
import { stripeClient, stripeEnabled } from "@/lib/stripe";

export const metadata: Metadata = { title: "Merci" };

type Props = { searchParams: Promise<{ commande?: string; session_id?: string }> };

export default async function ThankYouPage({ searchParams }: Props) {
  const { commande, session_id } = await searchParams;
  let order = (await readStore()).orders.find((o) => o.id === commande);

  // Retour de Stripe : on vérifie le paiement auprès de Stripe avant de marquer la commande payée.
  if (order && session_id && stripeEnabled() && order.stripeSessionId === session_id && order.status === "en attente") {
    const session = await stripeClient().checkout.sessions.retrieve(session_id);
    if (session.payment_status === "paid") {
      order = await updateStore((s) => {
        const o = s.orders.find((x) => x.id === commande)!;
        o.status = "payée";
        return o;
      });
    }
  }

  return (
    <div className="container narrow section">
      <ClearCart />
      <h1>Merci pour votre commande !</h1>
      {order ? (
        <>
          <p>
            Commande <strong>{order.id}</strong> · {formatPrice(order.totalCents)} ·{" "}
            {order.status === "payée" ? "paiement reçu" : "en attente de paiement"}.
          </p>
          <p className="muted">Nous vous écrirons à {order.customer.email} pour le suivi de votre commande.</p>
        </>
      ) : null}
      <Link href="/boutique" className="button primary">Retour à la boutique</Link>
    </div>
  );
}
