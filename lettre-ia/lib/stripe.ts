import Stripe from "stripe";

export function stripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY manquant.");
  return new Stripe(key);
}

// URL publique du site (pour les redirections Stripe et les liens envoyés par e-mail).
export function siteUrl(request: Request): string {
  return (process.env.APP_URL || new URL(request.url).origin).replace(/\/$/, "");
}
