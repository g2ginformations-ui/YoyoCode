import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";

// Abonnement mensuel : Stripe est la source de vérité, aucun stockage côté serveur.
export const PRICE_CENTS = 1995;
export const PRICE_LABEL = "19,95 €";
export const PERIOD_LABEL = "par mois";

export const SESSION_COOKIE = "lettre_ia_session";
const SESSION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export type Session = { customerId: string; email: string };

export function paywallEnabled(): boolean {
  return process.env.PAYWALL_DISABLED !== "true";
}

function secret(): string {
  const value = process.env.ACCESS_SECRET;
  if (!value) throw new Error("ACCESS_SECRET manquant.");
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

// Jeton signé « <données base64url>.<signature> ». `purpose` empêche d'utiliser un lien de connexion comme cookie.
export function createToken(purpose: string, data: Session, ttlMs: number): string {
  const payload = Buffer.from(JSON.stringify({ ...data, purpose, exp: Date.now() + ttlMs })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readToken(purpose: string, token: string | undefined): Session | null {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const given = Buffer.from(signature);
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString());
    if (data.purpose !== purpose || typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return { customerId: data.customerId, email: data.email };
  } catch {
    return null;
  }
}

export function setSessionCookie(response: NextResponse, session: Session, secure: boolean) {
  response.cookies.set(SESSION_COOKIE, createToken("session", session, SESSION_DAYS * DAY_MS), {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
  });
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  try {
    return readToken("session", store.get(SESSION_COOKIE)?.value);
  } catch {
    return null;
  }
}

export type Subscription = { status: string; renewsAt: number | null; cancelAtPeriodEnd: boolean };

// Abonnement le plus récent du client, tel que Stripe le connaît maintenant.
export async function getSubscription(customerId: string): Promise<Subscription | null> {
  const { data } = await stripeClient().subscriptions.list({ customer: customerId, status: "all", limit: 10 });
  const sub = data.find((s) => ACTIVE_STATUSES.has(s.status)) ?? data[0];
  if (!sub) return null;
  const periodEnd = sub.items.data[0]?.current_period_end;
  return {
    status: sub.status,
    renewsAt: periodEnd ? periodEnd * 1000 : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };
}

export function isActive(sub: Subscription | null): boolean {
  return Boolean(sub && ACTIVE_STATUSES.has(sub.status));
}

export async function currentAccess(): Promise<{ active: boolean; loggedIn: boolean; email: string | null }> {
  if (!paywallEnabled()) return { active: true, loggedIn: false, email: null };
  const session = await getSession();
  if (!session) return { active: false, loggedIn: false, email: null };
  try {
    return { active: isActive(await getSubscription(session.customerId)), loggedIn: true, email: session.email };
  } catch (error) {
    console.error(error);
    return { active: false, loggedIn: true, email: session.email };
  }
}
