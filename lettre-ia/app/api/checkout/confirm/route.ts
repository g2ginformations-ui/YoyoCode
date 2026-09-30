import { NextResponse } from "next/server";
import { ACCESS_COOKIE, ACCESS_DAYS, createAccessToken } from "@/lib/access";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

const DAY_MS = 24 * 60 * 60 * 1000;

// Retour de Stripe : on vérifie le paiement côté serveur avant d'ouvrir l'accès.
export async function GET(request: Request) {
  const base = siteUrl(request);
  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return Response.redirect(`${base}/achat?erreur=1`, 303);

  try {
    const session = await stripeClient().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return Response.redirect(`${base}/achat?erreur=1`, 303);
    }
    // L'expiration part de la date d'achat : réutiliser le lien ne prolonge pas l'accès.
    const expiresAt = session.created * 1000 + ACCESS_DAYS * DAY_MS;
    if (expiresAt < Date.now()) return Response.redirect(`${base}/achat?expire=1`, 303);

    const response = NextResponse.redirect(`${base}/?paiement=ok`, 303);
    response.cookies.set(ACCESS_COOKIE, createAccessToken(session.id, expiresAt), {
      httpOnly: true,
      secure: base.startsWith("https://"),
      sameSite: "lax",
      path: "/",
      expires: new Date(expiresAt),
    });
    return response;
  } catch (error) {
    console.error(error);
    return Response.redirect(`${base}/achat?erreur=1`, 303);
  }
}
