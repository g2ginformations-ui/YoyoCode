import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/access";
import { OAUTH_NEXT_COOKIE, OAUTH_STATE_COOKIE, type Provider, exchangeCode, findOrCreateCustomer } from "@/lib/oauth";
import { siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

// Retour de Google (GET) ou d'Apple (POST « form_post ») : vérifie l'état, récupère l'e-mail vérifié
// et ouvre la session sur le client Stripe correspondant.
async function handle(request: Request, provider: string, values: { code?: string | null; state?: string | null }) {
  const base = siteUrl(request);
  const fail = (reason: string) => {
    console.error(`Connexion ${provider} impossible : ${reason}`);
    const response = NextResponse.redirect(`${base}/connexion?oauth=1`, 303);
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  };
  if (provider !== "google" && provider !== "apple") return fail("fournisseur inconnu");

  const jar = await cookies();
  const expected = jar.get(OAUTH_STATE_COOKIE)?.value;
  const next = jar.get(OAUTH_NEXT_COOKIE)?.value ?? "";
  if (!values.code || !values.state || !expected || values.state !== expected) return fail("état invalide");

  try {
    const identity = await exchangeCode(provider as Provider, base, values.code);
    const customer = await findOrCreateCustomer(identity, provider as Provider);
    const back = /^\/[a-z0-9/_-]*$/i.test(next) && !next.startsWith("//") ? next : "/";
    const response = NextResponse.redirect(`${base}${back}`, 303);
    response.cookies.delete(OAUTH_STATE_COOKIE);
    response.cookies.delete(OAUTH_NEXT_COOKIE);
    setSessionCookie(response, { customerId: customer.id, email: identity.email }, base.startsWith("https://"));
    return response;
  } catch (error) {
    return fail(error instanceof Error ? error.message : String(error));
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const url = new URL(request.url);
  const { provider } = await params;
  return handle(request, provider, { code: url.searchParams.get("code"), state: url.searchParams.get("state") });
}

export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const form = await request.formData().catch(() => null);
  const { provider } = await params;
  return handle(request, provider, {
    code: form?.get("code")?.toString(),
    state: form?.get("state")?.toString(),
  });
}
