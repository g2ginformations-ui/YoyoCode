import { getSession, getSubscription, isActive } from "@/lib/access";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

// Annule une résiliation programmée : l'abonnement continue normalement.
export async function POST(request: Request) {
  const base = siteUrl(request);
  const session = await getSession();
  if (!session) return Response.redirect(`${base}/connexion`, 303);
  try {
    const sub = await getSubscription(session.customerId);
    if (sub && isActive(sub) && sub.cancelAtPeriodEnd) {
      await stripeClient().subscriptions.update(sub.id, { cancel_at_period_end: false });
    }
  } catch (error) {
    console.error(error);
    return Response.redirect(`${base}/compte?resiliation=erreur`, 303);
  }
  return Response.redirect(`${base}/compte?resiliation=reprise`, 303);
}
