import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { stripeClient } from "@/lib/stripe";

import { ADJUSTMENTS_PER_LETTER, type PlanId, WEEKLY_LIMIT } from "@/lib/pricing";

// Stripe est la source de vérité, aucun stockage côté serveur :
// abonnements (semaine, mois) via l'API, accès à vie et crédits dans les métadonnées du client.

export const SESSION_COOKIE = "lettre_ia_session";
// Marque l'essai gratuit comme utilisé sur ce navigateur.
export const TRIAL_COOKIE = "lettre_ia_essai";
const SESSION_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export type Session = { customerId: string; email: string };

export function paywallEnabled(): boolean {
  return process.env.PAYWALL_DISABLED !== "true";
}

// Une lettre offerte par navigateur ; FREE_TRIAL=false la désactive.
export function freeTrialEnabled(): boolean {
  return process.env.FREE_TRIAL !== "false";
}

export async function trialAvailable(): Promise<boolean> {
  if (!freeTrialEnabled()) return false;
  const store = await cookies();
  return !store.get(TRIAL_COOKIE);
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

export type Subscription = {
  id: string;
  status: string;
  interval: string | null;
  renewsAt: number | null;
  cancelAtPeriodEnd: boolean;
};

// Abonnement le plus récent du client, tel que Stripe le connaît maintenant.
export async function getSubscription(customerId: string): Promise<Subscription | null> {
  const { data } = await stripeClient().subscriptions.list({ customer: customerId, status: "all", limit: 10 });
  const sub = data.find((s) => ACTIVE_STATUSES.has(s.status)) ?? data[0];
  if (!sub) return null;
  const item = sub.items.data[0];
  return {
    id: sub.id,
    status: sub.status,
    interval: item?.price.recurring?.interval ?? null,
    renewsAt: item?.current_period_end ? item.current_period_end * 1000 : null,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  };
}

export function isActive(sub: Subscription | null): boolean {
  return Boolean(sub && ACTIVE_STATUSES.has(sub.status));
}

// Semaine ISO (« 2026-W40 ») : la limite des offres illimitées se remet à zéro chaque lundi.
export function weekKey(date = new Date()): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d.getTime() - yearStart.getTime()) / DAY_MS + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

export type Entitlements = {
  plan: PlanId | null;
  unlimited: boolean;
  subscription: Subscription | null;
  credits: number;
  adjustLeft: number;
  weekUsed: number;
};

const NO_ENTITLEMENTS: Entitlements = {
  plan: null,
  unlimited: false,
  subscription: null,
  credits: 0,
  adjustLeft: 0,
  weekUsed: 0,
};

function toInt(value: string | undefined): number {
  const n = Number.parseInt(value ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

async function customerMetadata(customerId: string): Promise<Record<string, string> | null> {
  const customer = await stripeClient().customers.retrieve(customerId);
  return "deleted" in customer && customer.deleted ? null : customer.metadata;
}

// Droits du client : abonnement actif, accès à vie, lettres à l'unité et usage de la semaine.
export async function getEntitlements(customerId: string): Promise<Entitlements> {
  const [metadata, subscription] = await Promise.all([customerMetadata(customerId), getSubscription(customerId)]);
  if (!metadata) return NO_ENTITLEMENTS;
  const lifetime = metadata.lifetime === "true";
  const subscribed = isActive(subscription);
  return {
    plan: lifetime ? "lifetime" : subscribed ? (subscription?.interval === "week" ? "week" : "month") : null,
    unlimited: lifetime || subscribed,
    subscription,
    credits: toInt(metadata.credits),
    adjustLeft: toInt(metadata.adjust_left),
    weekUsed: metadata.usage_week === weekKey() ? toInt(metadata.usage_count) : 0,
  };
}

async function updateMetadata(customerId: string, change: (metadata: Record<string, string>) => Record<string, string>) {
  const metadata = (await customerMetadata(customerId)) ?? {};
  await stripeClient().customers.update(customerId, { metadata: change(metadata) });
}

// Une génération avec une offre illimitée : compte pour la limite de la semaine.
export function recordUnlimitedUse(customerId: string) {
  return updateMetadata(customerId, (m) => {
    const key = weekKey();
    const count = m.usage_week === key ? toInt(m.usage_count) : 0;
    return { usage_week: key, usage_count: String(count + 1) };
  });
}

// Une lettre à l'unité est utilisée : on retire un crédit et on ouvre ses ajustements inclus.
export function consumeCredit(customerId: string) {
  return updateMetadata(customerId, (m) => ({
    credits: String(Math.max(0, toInt(m.credits) - 1)),
    adjust_left: String(ADJUSTMENTS_PER_LETTER),
  }));
}

export function consumeAdjustment(customerId: string) {
  return updateMetadata(customerId, (m) => ({ adjust_left: String(Math.max(0, toInt(m.adjust_left) - 1)) }));
}

export function addCredits(customerId: string, count: number) {
  return updateMetadata(customerId, (m) => ({ credits: String(toInt(m.credits) + count) }));
}

export function grantLifetime(customerId: string) {
  return updateMetadata(customerId, () => ({ lifetime: "true" }));
}

export type Access = {
  active: boolean;
  loggedIn: boolean;
  email: string | null;
  trialAvailable: boolean;
  plan: PlanId | null;
  credits: number;
  adjustLeft: number;
  weekLeft: number;
};

// Accès du visiteur courant, avec l'identifiant client pour les routes qui doivent décompter l'usage.
export async function resolveAccess(): Promise<{ access: Access; customerId: string | null }> {
  if (!paywallEnabled()) {
    return {
      access: {
        active: true,
        loggedIn: false,
        email: null,
        trialAvailable: false,
        plan: null,
        credits: 0,
        adjustLeft: 0,
        weekLeft: WEEKLY_LIMIT,
      },
      customerId: null,
    };
  }
  const session = await getSession();
  let entitlements = NO_ENTITLEMENTS;
  if (session) {
    try {
      entitlements = await getEntitlements(session.customerId);
    } catch (error) {
      console.error(error);
    }
  }
  return {
    access: {
      active: entitlements.unlimited,
      loggedIn: Boolean(session),
      email: session?.email ?? null,
      trialAvailable: !entitlements.unlimited && entitlements.credits === 0 && (await trialAvailable()),
      plan: entitlements.plan,
      credits: entitlements.credits,
      adjustLeft: entitlements.adjustLeft,
      weekLeft: Math.max(0, WEEKLY_LIMIT - entitlements.weekUsed),
    },
    customerId: session?.customerId ?? null,
  };
}

export async function currentAccess(): Promise<Access> {
  return (await resolveAccess()).access;
}
