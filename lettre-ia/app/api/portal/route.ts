import { getSession } from "@/lib/access";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

// Espace client Stripe : résiliation, changement de carte, factures.
export async function POST(request: Request) {
  const base = siteUrl(request);
  const session = await getSession();
  if (!session) return Response.redirect(`${base}/connexion`, 303);
  try {
    const portal = await stripeClient().billingPortal.sessions.create({
      customer: session.customerId,
      locale: "fr",
      return_url: `${base}/compte`,
    });
    return Response.redirect(portal.url, 303);
  } catch (error) {
    console.error(error);
    return Response.redirect(`${base}/compte?erreur=1`, 303);
  }
}
