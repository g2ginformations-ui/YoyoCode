import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/access";
import { fulfillCheckout } from "@/lib/fulfill";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

// Retour de Stripe : on vérifie le paiement côté serveur, on délivre l'achat, puis on connecte le client.
export async function GET(request: Request) {
  const base = siteUrl(request);
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.redirect(`${base}/abonnement?erreur=1`, 303);

  try {
    const checkout = await stripeClient().checkout.sessions.retrieve(sessionId);
    const { ok, customerId, plan } = await fulfillCheckout(checkout);
    if (!ok || !customerId) return NextResponse.redirect(`${base}/abonnement?erreur=1`, 303);

    const email = checkout.customer_details?.email ?? "";
    const response = NextResponse.redirect(`${base}/?achat=${plan}`, 303);
    setSessionCookie(response, { customerId, email }, base.startsWith("https://"));
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(`${base}/abonnement?erreur=1`, 303);
  }
}
