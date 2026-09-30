import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Offre unique : paiement de 19,95 € qui débloque la génération pendant ACCESS_DAYS jours.
export const PRICE_CENTS = 1995;
export const PRICE_LABEL = "19,95 €";
export const ACCESS_DAYS = Number(process.env.ACCESS_DAYS) || 30;

export const ACCESS_COOKIE = "lettre_ia_acces";

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

// Jeton « <id session Stripe>.<expiration ms>.<signature> » stocké dans un cookie httpOnly.
export function createAccessToken(sessionId: string, expiresAt: number): string {
  const payload = `${sessionId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

export function readAccessToken(token: string | undefined): { expiresAt: number } | null {
  if (!token) return null;
  const lastDot = token.lastIndexOf(".");
  if (lastDot < 0) return null;
  const payload = token.slice(0, lastDot);
  const given = Buffer.from(token.slice(lastDot + 1));
  const expected = Buffer.from(sign(payload));
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return null;
  const expiresAt = Number(payload.split(".").pop());
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return null;
  return { expiresAt };
}

export async function currentAccess(): Promise<{ active: boolean; until: number | null }> {
  if (!paywallEnabled()) return { active: true, until: null };
  const store = await cookies();
  const access = readAccessToken(store.get(ACCESS_COOKIE)?.value);
  return access ? { active: true, until: access.expiresAt } : { active: false, until: null };
}
