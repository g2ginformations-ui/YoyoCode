import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/access";
import { checkPassword } from "@/lib/password";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

// Connexion classique : e-mail + mot de passe. Le message d'erreur est le même que l'adresse
// existe ou non, pour ne pas révéler qui est client.
export async function POST(request: Request) {
  const base = siteUrl(request);
  const form = await request.formData().catch(() => null);
  const typed = String(form?.get("email") ?? "").trim();
  const email = typed.toLowerCase();
  const password = String(form?.get("password") ?? "");
  if (!email || !password) return NextResponse.redirect(`${base}/connexion?identifiants=1`, 303);
  if (!process.env.ACCESS_SECRET) return NextResponse.redirect(`${base}/connexion?erreur=1`, 303);

  try {
    // Le filtre e-mail de Stripe respecte la casse : on cherche l'adresse telle que saisie et en minuscules.
    const stripe = stripeClient();
    const lists = await Promise.all(
      [...new Set([typed, email])].map((address) => stripe.customers.list({ email: address, limit: 10 })),
    );
    let locked = false;
    for (const customer of lists.flatMap((list) => list.data)) {
      const result = await checkPassword(customer, password);
      if (result === "ok") {
        const response = NextResponse.redirect(`${base}/`, 303);
        setSessionCookie(response, { customerId: customer.id, email }, base.startsWith("https://"));
        return response;
      }
      if (result === "locked") locked = true;
    }
    return NextResponse.redirect(`${base}/connexion?${locked ? "bloque" : "identifiants"}=1`, 303);
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(`${base}/connexion?erreur=1`, 303);
  }
}
