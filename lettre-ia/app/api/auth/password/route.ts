import { getSession } from "@/lib/access";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, setPassword } from "@/lib/password";
import { siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

// Création ou changement du mot de passe, pour un client déjà connecté (après son achat, par exemple).
export async function POST(request: Request) {
  const base = siteUrl(request);
  const session = await getSession();
  if (!session) return Response.redirect(`${base}/connexion`, 303);

  const form = await request.formData().catch(() => null);
  const password = String(form?.get("password") ?? "");
  const confirm = String(form?.get("confirm") ?? "");
  if (password.length < MIN_PASSWORD_LENGTH) return Response.redirect(`${base}/compte?mdp=court`, 303);
  if (password.length > MAX_PASSWORD_LENGTH) return Response.redirect(`${base}/compte?mdp=long`, 303);
  if (password !== confirm) return Response.redirect(`${base}/compte?mdp=different`, 303);

  try {
    await setPassword(session.customerId, password);
  } catch (error) {
    console.error(error);
    return Response.redirect(`${base}/compte?mdp=erreur`, 303);
  }
  return Response.redirect(`${base}/compte?mdp=ok`, 303);
}
