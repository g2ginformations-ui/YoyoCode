import Stripe from "stripe";

export function stripeEnabled(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export function stripeClient(): Stripe {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}
