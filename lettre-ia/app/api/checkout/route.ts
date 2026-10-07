import Stripe from "stripe";
import { getSession } from "@/lib/access";
import { PLANS, PLAN_ORDER, isPlanId } from "@/lib/pricing";
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
  // Seules les offres en vente peuvent être achetées (l'ancienne offre « À vie » n'est plus proposée).
  if (!isPlanId(planId) || !PLAN_ORDER.includes(planId)) return Response.redirect(`${base}/abonnement?erreur=1`, 303);
  const plan = PLANS[planId];
  // Contenu numérique livré immédiatement : renonciation expresse au droit de rétractation (art. L221-28 13°).
  if (form?.get("consent") !== "1") return Response.redirect(`${base}/abonnement?consentement=1`, 303);

  // Parcours « candidature » et panneau de l'accueil : e-mail prérempli chez Stripe, et retour sur place si annulation.
  const email = String(form?.get("email") ?? "").trim().slice(0, 200);
  const from = form?.get("from");

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
      cancel_url:
        from === "candidature" ? `${base}/candidature?annule=1` : from === "accueil" ? `${base}/?annule=1` : `${base}/abonnement?annule=1`,
      // Un client déjà connu garde son compte Stripe, ses crédits et son historique de factures.
      ...(session
        ? { customer: session.customerId }
        : /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)
          ? { customer_email: email }
          : {}),
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
    // En mode test, le message de Stripe aide à corriger la configuration ; on masque toute clé qu'il pourrait citer.
    const detail =
      error instanceof Stripe.errors.StripeError && !/_live_/.test(process.env.STRIPE_SECRET_KEY ?? "")
        ? error.message.replace(/\b(sk|rk|pk)_(live|test)_[*\w]+/g, "[clé masquée]").slice(0, 300)
        : "";
    return Response.redirect(`${base}/abonnement?erreur=1&detail=${encodeURIComponent(detail)}`, 303);
  }
}
