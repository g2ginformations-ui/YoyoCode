import type Stripe from "stripe";
import { addCredits, grantLifetime } from "@/lib/access";
import { acquireLock, releaseLock } from "@/lib/guard";
import { type PlanId, isPlanId } from "@/lib/pricing";
import { stripeClient } from "@/lib/stripe";

export type Fulfillment = { ok: boolean; customerId: string | null; plan: PlanId };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Délivre un achat payé (lettre à l'unité, accès à vie) une seule fois par paiement. Appelé au retour
// du client sur le site et par le webhook Stripe (si le client ferme l'onglet avant d'être redirigé).
// Les abonnements n'ont rien à délivrer : leur état est lu directement chez Stripe.
export async function fulfillCheckout(checkout: Stripe.Checkout.Session): Promise<Fulfillment> {
  const customerId = typeof checkout.customer === "string" ? checkout.customer : (checkout.customer?.id ?? null);
  const plan: PlanId = isPlanId(checkout.metadata?.plan)
    ? checkout.metadata.plan
    : checkout.mode === "payment"
      ? "letter"
      : "month";
  const result = { customerId, plan };
  if (checkout.status !== "complete" || !customerId) return { ok: false, ...result };
  if (checkout.mode !== "payment") return { ok: true, ...result };
  // Accès à vie rendu gratuit par un code promo à 100 % (créé dans Stripe) : aucun paiement à marquer.
  // L'accès à vie peut être accordé plusieurs fois sans effet de bord ; une lettre à l'unité gratuite, non.
  if (checkout.payment_status === "no_payment_required" && plan === "lifetime" && (checkout.amount_total ?? 1) === 0) {
    await grantLifetime(customerId);
    return { ok: true, ...result };
  }
  if (checkout.payment_status !== "paid") return { ok: false, ...result };

  const intentId = typeof checkout.payment_intent === "string" ? checkout.payment_intent : checkout.payment_intent?.id;
  if (!intentId) return { ok: false, ...result };

  const stripe = stripeClient();
  const lock = `achat:${intentId}`;
  if (!(await acquireLock(lock, 120))) {
    // Un autre traitement délivre ce paiement en ce moment : on attend qu'il ait fini.
    for (let attempt = 0; attempt < 10; attempt++) {
      await wait(500);
      const intent = await stripe.paymentIntents.retrieve(intentId);
      if (intent.metadata.fulfilled === "true") return { ok: true, ...result };
    }
    return { ok: false, ...result };
  }
  try {
    // Le paiement porte la marque « délivré » : un rechargement ou un second appel ne crédite pas deux fois.
    const intent = await stripe.paymentIntents.retrieve(intentId);
    if (intent.metadata.fulfilled !== "true") {
      if (plan === "lifetime") await grantLifetime(customerId);
      else await addCredits(customerId, 1);
      await stripe.paymentIntents.update(intentId, { metadata: { fulfilled: "true" } });
    }
    return { ok: true, ...result };
  } finally {
    await releaseLock(lock);
  }
}
