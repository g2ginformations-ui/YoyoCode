import { NextResponse } from "next/server";
import { addCredits, grantLifetime, setSessionCookie } from "@/lib/access";
import { isPlanId } from "@/lib/pricing";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

// Retour de Stripe : on vérifie le paiement côté serveur, on délivre l'achat, puis on connecte le client.
export async function GET(request: Request) {
  const base = siteUrl(request);
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return NextResponse.redirect(`${base}/abonnement?erreur=1`, 303);

  try {
    const stripe = stripeClient();
    const checkout = await stripe.checkout.sessions.retrieve(sessionId);
    const customerId = typeof checkout.customer === "string" ? checkout.customer : checkout.customer?.id;
    const plan = isPlanId(checkout.metadata?.plan) ? checkout.metadata.plan : "month";
    if (checkout.status !== "complete" || !customerId) {
      return NextResponse.redirect(`${base}/abonnement?erreur=1`, 303);
    }

    if (checkout.mode === "payment") {
      if (checkout.payment_status !== "paid") return NextResponse.redirect(`${base}/abonnement?erreur=1`, 303);
      const intentId =
        typeof checkout.payment_intent === "string" ? checkout.payment_intent : checkout.payment_intent?.id;
      if (!intentId) return NextResponse.redirect(`${base}/abonnement?erreur=1`, 303);
      // Le paiement porte la marque « délivré » : recharger cette page ne crédite pas deux fois.
      const intent = await stripe.paymentIntents.retrieve(intentId);
      if (intent.metadata.fulfilled !== "true") {
        if (plan === "lifetime") await grantLifetime(customerId);
        else await addCredits(customerId, 1);
        await stripe.paymentIntents.update(intentId, { metadata: { fulfilled: "true" } });
      }
    }

    const email = checkout.customer_details?.email ?? "";
    const response = NextResponse.redirect(`${base}/?achat=${plan}`, 303);
    setSessionCookie(response, { customerId, email }, base.startsWith("https://"));
    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(`${base}/abonnement?erreur=1`, 303);
  }
}
