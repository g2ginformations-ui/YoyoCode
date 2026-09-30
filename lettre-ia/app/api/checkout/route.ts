import { PRICE_CENTS, getSession } from "@/lib/access";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

// Crée une session Stripe Checkout d'abonnement et redirige vers la page de paiement.
// Apple Pay et Google Pay s'affichent automatiquement quand ils sont activés dans le tableau de bord Stripe.
export async function POST(request: Request) {
  const base = siteUrl(request);
  // Sans secret, l'accès ne pourrait pas être délivré après paiement : on refuse avant d'encaisser.
  if (!process.env.ACCESS_SECRET) {
    console.error("ACCESS_SECRET manquant : paiement bloqué.");
    return Response.redirect(`${base}/abonnement?erreur=1`, 303);
  }
  try {
    const session = await getSession();
    const priceId = process.env.STRIPE_PRICE_ID;
    const checkout = await stripeClient().checkout.sessions.create({
      mode: "subscription",
      locale: "fr",
      // Un client déjà connu (abonnement expiré) garde son compte Stripe et son historique de factures.
      ...(session ? { customer: session.customerId } : {}),
      billing_address_collection: "required",
      allow_promotion_codes: true,
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: PRICE_CENTS,
                recurring: { interval: "month" },
                product_data: {
                  name: "Lettre IA — abonnement mensuel",
                  description: "Lettres de motivation personnalisées et ajustements illimités.",
                },
              },
            },
      ],
      success_url: `${base}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/abonnement?annule=1`,
    });
    return Response.redirect(checkout.url!, 303);
  } catch (error) {
    console.error(error);
    return Response.redirect(`${base}/abonnement?erreur=1`, 303);
  }
}
