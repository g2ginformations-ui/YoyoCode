import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/access";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

// Retour de Stripe : on vérifie l'abonnement côté serveur, puis on connecte le client.
export async function GET(request: Request) {
  const base = siteUrl(request);
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.redirect(`${base}/abonnement?erreur=1`, 303);

  try {
    const checkout = await stripeClient().checkout.sessions.retrieve(sessionId);
    const customerId = typeof checkout.customer === "string" ? checkout.customer : checkout.customer?.id;
    if (checkout.status !== "complete" || !customerId) {
      return NextResponse.redirect(`${base}/abonnement?erreur=1`, 303);
    }
    const email = checkout.customer_details?.email ?? "";
    const response = NextResponse.redirect(`${base}/?abonnement=ok`, 303);
    setSessionCookie(response, { customerId, email }, base.startsWith("https://"));
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(`${base}/abonnement?erreur=1`, 303);
  }
}
