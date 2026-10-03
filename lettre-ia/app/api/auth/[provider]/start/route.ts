import { NextResponse } from "next/server";
import { OAUTH_STATE_COOKIE, type Provider, appleEnabled, authorizeUrl, googleEnabled, newState } from "@/lib/oauth";
import { siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

// Démarre « Continuer avec Google / Apple » : mémorise un état aléatoire (anti-falsification) puis redirige.
export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const base = siteUrl(request);
  const { provider } = await params;
  const enabled = provider === "google" ? googleEnabled() : provider === "apple" ? appleEnabled() : false;
  if (!enabled || !process.env.ACCESS_SECRET) return NextResponse.redirect(`${base}/connexion?oauth=1`, 303);

  const state = newState();
  const secure = base.startsWith("https://");
  const response = NextResponse.redirect(authorizeUrl(provider as Provider, base, state), 303);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure,
    // Apple revient par un POST depuis son propre domaine : le cookie doit être envoyé en contexte tiers.
    sameSite: provider === "apple" && secure ? "none" : "lax",
    path: "/",
    maxAge: 10 * 60,
  });
  return response;
}
