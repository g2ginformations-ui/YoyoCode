import Stripe from "stripe";
import { getSession } from "@/lib/access";
import { PLANS, isPlanId } from "@/lib/pricing";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

// Crée une session Stripe Checkout pour l'offre choisie et redirige vers la page de paiement.
// Apple Pay et Google Pay s'affichent automatiquement quand ils sont activés dans le tableau de bord Stripe.
export async function POST(request: Request) {
  const base = siteUrl(request);
  // Sans secret, l'accès ne pourrait pas être délivré après paiement : on refuse avant d'encaisser.
  if (!process.env.ACCESS_SECRET) {
    console.error("ACCESS_SECRET manquant : paiement bloqué.");
    return Response.redirect(`${base}/abonnement?erreur=1&cause=ACCESS_SECRET`, 303);
  }
  if (!process.env.STRIPE_SECRET_KEY) {
    return Response.redirect(`${base}/abonnement?erreur=1&cause=STRIPE_SECRET_KEY`, 303);
  }

  const form = await request.formData().catch(() => null);
  const planId = form?.get("plan") ?? "month";
  if (!isPlanId(planId)) return Response.redirect(`${base}/abonnement?erreur=1`, 303);
  const plan = PLANS[planId];

  try {
    const session = await getSession();
    const priceData = {
      currency: "eur",
      unit_amount: plan.cents,
      // Le prix affiché est TTC : la TVA est comprise dans le montant.
      tax_behavior: "inclusive" as const,
      product_data: {
        name: plan.productName,
        // Code fiscal Stripe, exigé avec Managed Payments : SaaS à usage personnel par défaut.
        tax_code: process.env.STRIPE_TAX_CODE || "txcd_10103000",
      },
    };
    const common = {
      locale: "fr" as const,
      billing_address_collection: "required" as const,
      allow_promotion_codes: true,
      metadata: { plan: plan.id },
      success_url: `${base}/api/checkout/confirm?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/abonnement?annule=1`,
      // Un client déjà connu garde son compte Stripe, ses crédits et son historique de factures.
      ...(session ? { customer: session.customerId } : {}),
    };
    const checkout =
      plan.mode === "subscription"
        ? await stripeClient().checkout.sessions.create({
            ...common,
            mode: "subscription",
            line_items: [{ quantity: 1, price_data: { ...priceData, recurring: { interval: plan.interval! } } }],
          })
        : await stripeClient().checkout.sessions.create({
            ...common,
            mode: "payment",
            // Un paiement unique crée aussi une fiche client : c'est elle qui porte les crédits et l'accès à vie.
            ...(session ? {} : { customer_creation: "always" as const }),
            invoice_creation: { enabled: true },
            payment_intent_data: { metadata: { plan: plan.id } },
            line_items: [{ quantity: 1, price_data: priceData }],
          });
    return Response.redirect(checkout.url!, 303);
  } catch (error) {
    console.error(error);
    // Le message de Stripe aide à corriger la configuration ; on masque toute clé qu'il pourrait citer.
    const detail =
      error instanceof Stripe.errors.StripeError
        ? error.message.replace(/\b(sk|rk|pk)_(live|test)_[*\w]+/g, "[clé masquée]").slice(0, 300)
        : "";
    return Response.redirect(`${base}/abonnement?erreur=1&detail=${encodeURIComponent(detail)}`, 303);
  }
}
