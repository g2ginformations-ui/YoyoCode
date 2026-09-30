import { PRICE_CENTS } from "@/lib/access";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

// Crée une session Stripe Checkout et redirige vers la page de paiement.
// Apple Pay et Google Pay s'affichent automatiquement quand ils sont activés dans le tableau de bord Stripe.
export async function POST(request: Request) {
  const base = siteUrl(request);
  // Sans secret, l'accès ne pourrait pas être délivré après paiement : on refuse avant d'encaisser.
  if (!process.env.ACCESS_SECRET) {
    console.error("ACCESS_SECRET manquant : paiement bloqué.");
    return Response.redirect(`${base}/achat?erreur=1`, 303);
  }
  try {
    const priceId = process.env.STRIPE_PRICE_ID;
    const session = await stripeClient().checkout.sessions.create({
      mode: "payment",
      locale: "fr",
      line_items: [
        priceId
          ? { price: priceId, quantity: 1 }
          : {
              quantity: 1,
              price_data: {
                currency: "eur",
                unit_amount: PRICE_CENTS,
                product_data: {
                  name: "Lettre IA — accès complet",
                  description: "Lettres de motivation personnalisées et ajustements illimités.",
                },
              },
            },
      ],
      success_url: `${base}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/achat?annule=1`,
    });
    return Response.redirect(session.url!, 303);
  } catch (error) {
    console.error(error);
    return Response.redirect(`${base}/achat?erreur=1`, 303);
  }
}
