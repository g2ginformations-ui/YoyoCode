import { createPrivateKey, randomBytes, sign } from "node:crypto";
import type Stripe from "stripe";
import { getEntitlements } from "@/lib/access";
import { stripeClient } from "@/lib/stripe";

// Connexion avec Google ou Apple (OpenID Connect, flux « authorization code »).
// Le jeton d'identité est lu dans la réponse directe du serveur Google/Apple (HTTPS), jamais depuis le navigateur.
export type Provider = "google" | "apple";

export const OAUTH_STATE_COOKIE = "lettre_ia_oauth";
// Page interne où revenir après la connexion (facultatif).
export const OAUTH_NEXT_COOKIE = "lettre_ia_oauth_next";

export function googleEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function appleEnabled(): boolean {
  return Boolean(
    process.env.APPLE_SERVICES_ID &&
      process.env.APPLE_TEAM_ID &&
      process.env.APPLE_KEY_ID &&
      process.env.APPLE_PRIVATE_KEY,
  );
}

export function newState(): string {
  return randomBytes(24).toString("base64url");
}

export function callbackUrl(base: string, provider: Provider): string {
  return `${base}/api/auth/${provider}/callback`;
}

export function authorizeUrl(provider: Provider, base: string, state: string): string {
  if (provider === "google") {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: callbackUrl(base, "google"),
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
  }
  // Apple exige « form_post » dès que l'e-mail est demandé : le retour est un POST depuis appleid.apple.com.
  const params = new URLSearchParams({
    client_id: process.env.APPLE_SERVICES_ID!,
    redirect_uri: callbackUrl(base, "apple"),
    response_type: "code",
    response_mode: "form_post",
    scope: "name email",
    state,
  });
  return `https://appleid.apple.com/auth/authorize?${params}`;
}

// Secret client Apple : un JWT ES256 signé avec la clé privée (.p8) du compte Apple Developer.
function appleClientSecret(): string {
  const encode = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const now = Math.floor(Date.now() / 1000);
  const header = encode({ alg: "ES256", kid: process.env.APPLE_KEY_ID });
  const payload = encode({
    iss: process.env.APPLE_TEAM_ID,
    iat: now,
    exp: now + 300,
    aud: "https://appleid.apple.com",
    sub: process.env.APPLE_SERVICES_ID,
  });
  // Vercel peut stocker les retours à la ligne de la clé sous forme de « \n » littéraux.
  const key = createPrivateKey(process.env.APPLE_PRIVATE_KEY!.replace(/\\n/g, "\n"));
  const signature = sign("sha256", Buffer.from(`${header}.${payload}`), { key, dsaEncoding: "ieee-p1363" });
  return `${header}.${payload}.${signature.toString("base64url")}`;
}

function decodeIdToken(idToken: string): Record<string, unknown> {
  const part = idToken.split(".")[1];
  if (!part) throw new Error("Jeton d'identité invalide.");
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
}

export type Identity = { email: string; name: string | null };

// Échange le code contre un jeton d'identité et renvoie l'e-mail vérifié de la personne.
export async function exchangeCode(provider: Provider, base: string, code: string): Promise<Identity> {
  const google = provider === "google";
  const res = await fetch(google ? "https://oauth2.googleapis.com/token" : "https://appleid.apple.com/auth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: callbackUrl(base, provider),
      client_id: google ? process.env.GOOGLE_CLIENT_ID! : process.env.APPLE_SERVICES_ID!,
      client_secret: google ? process.env.GOOGLE_CLIENT_SECRET! : appleClientSecret(),
    }),
  });
  if (!res.ok) throw new Error(`Échange du code ${provider} refusé (${res.status}) : ${await res.text()}`);
  const { id_token: idToken } = (await res.json()) as { id_token?: string };
  if (!idToken) throw new Error(`Réponse ${provider} sans jeton d'identité.`);

  const claims = decodeIdToken(idToken);
  const audience = google ? process.env.GOOGLE_CLIENT_ID : process.env.APPLE_SERVICES_ID;
  const issuers = google ? ["https://accounts.google.com", "accounts.google.com"] : ["https://appleid.apple.com"];
  const verified = claims.email_verified === true || claims.email_verified === "true";
  if (claims.aud !== audience || !issuers.includes(String(claims.iss)) || Number(claims.exp) * 1000 < Date.now()) {
    throw new Error(`Jeton ${provider} non valide pour cette application.`);
  }
  if (typeof claims.email !== "string" || !verified) throw new Error(`Adresse e-mail ${provider} non vérifiée.`);
  return { email: claims.email.toLowerCase(), name: typeof claims.name === "string" ? claims.name : null };
}

// Client Stripe correspondant à l'e-mail : de préférence celui qui a un achat en cours de validité,
// sinon le premier trouvé, sinon un nouveau client (qui pourra acheter ensuite avec ce compte).
export async function findOrCreateCustomer(identity: Identity, provider: Provider): Promise<Stripe.Customer> {
  const stripe = stripeClient();
  const { data } = await stripe.customers.list({ email: identity.email, limit: 10 });
  for (const customer of data) {
    const rights = await getEntitlements(customer.id);
    if (rights.unlimited || rights.credits > 0 || rights.adjustLeft > 0) return customer;
  }
  if (data[0]) return data[0];
  return stripe.customers.create({
    email: identity.email,
    ...(identity.name ? { name: identity.name } : {}),
    metadata: { signup: provider },
  });
}
