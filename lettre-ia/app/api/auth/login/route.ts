import { createToken, getEntitlements } from "@/lib/access";
import { emailEnabled, sendEmail } from "@/lib/email";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

const LINK_TTL_MS = 20 * 60 * 1000;

// Envoie un lien de connexion si l'adresse correspond à un client avec un achat en cours de validité.
// La réponse est la même dans tous les cas, pour ne pas révéler qui est abonné.
export async function POST(request: Request) {
  const base = siteUrl(request);
  const form = await request.formData();
  const typed = String(form.get("email") ?? "").trim();
  const email = typed.toLowerCase();

  if (!emailEnabled()) return Response.redirect(`${base}/connexion?indisponible=1`, 303);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.redirect(`${base}/connexion?invalide=1`, 303);

  try {
    // Le filtre e-mail de Stripe respecte la casse : on cherche l'adresse telle que saisie et en minuscules.
    const stripe = stripeClient();
    const lists = await Promise.all(
      [...new Set([typed, email])].map((address) => stripe.customers.list({ email: address, limit: 10 })),
    );
    for (const customer of lists.flatMap((list) => list.data)) {
      const rights = await getEntitlements(customer.id);
      if (!rights.unlimited && rights.credits === 0 && rights.adjustLeft === 0) continue;
      const token = createToken("login", { customerId: customer.id, email }, LINK_TTL_MS);
      const link = `${base}/api/auth/verify?token=${encodeURIComponent(token)}`;
      await sendEmail(
        email,
        "Votre lien de connexion à Ma lettre de motiv",
        `<p>Bonjour,</p><p>Cliquez sur ce lien pour vous connecter à Ma lettre de motiv :</p><p><a href="${link}">Me connecter</a></p><p>Ce lien est valable 20 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.</p>`,
        `Bonjour,\n\nPour vous connecter à Ma lettre de motiv, ouvrez ce lien (valable 20 minutes) :\n${link}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez ce message.`,
      );
      break;
    }
  } catch (error) {
    console.error(error);
  }
  return Response.redirect(`${base}/connexion?envoye=1`, 303);
}
