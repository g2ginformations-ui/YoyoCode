import type Stripe from "stripe";
import { cancelUnpaidOrder, markOrderPaid } from "@/lib/orders";
import { stripeClient } from "@/lib/stripe";

// Stripe prévient ici quand un paiement aboutit ou expire, même si la cliente a fermé la page.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !process.env.STRIPE_SECRET_KEY) return new Response("Webhook non configuré", { status: 503 });

  let event: Stripe.Event;
  try {
    event = stripeClient().webhooks.constructEvent(await request.text(), request.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return new Response("Signature invalide", { status: 400 });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const orderId = session.client_reference_id;
  if (orderId) {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      if (session.payment_status === "paid") await markOrderPaid(orderId, session.id);
    } else if (event.type === "checkout.session.expired" || event.type === "checkout.session.async_payment_failed") {
      await cancelUnpaidOrder(orderId, session.id);
    }
  }
  return Response.json({ received: true });
}
