import Stripe from "stripe";
import { fulfillCheckout } from "@/lib/fulfill";

export const runtime = "nodejs";

// Webhook Stripe : délivre un achat même si le client a fermé l'onglet avant de revenir sur le site.
// À déclarer dans Stripe (Développeurs → Webhooks) avec les événements checkout.session.completed et
// checkout.session.async_payment_succeeded ; son secret de signature va dans STRIPE_WEBHOOK_SECRET.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return Response.json({ error: "Webhook non configuré." }, { status: 404 });

  const payload = await request.text();
  let event: Stripe.Event;
  try {
    // La signature prouve que l'appel vient bien de Stripe.
    event = Stripe.webhooks.constructEvent(payload, request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return Response.json({ error: "Signature invalide." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
    try {
      await fulfillCheckout(event.data.object);
    } catch (error) {
      console.error(error);
      // Stripe renvoie l'événement plus tard en cas d'erreur.
      return Response.json({ error: "Traitement impossible." }, { status: 500 });
    }
  }
  return Response.json({ received: true });
}
