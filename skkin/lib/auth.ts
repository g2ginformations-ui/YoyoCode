import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_COOKIE = "skkin_admin";
export const ADMIN_SESSION_SECONDS = 7 * 24 * 60 * 60;

function secret(): string {
  const value = process.env.ADMIN_SECRET || process.env.ADMIN_PASSWORD;
  if (!value) throw new Error("ADMIN_PASSWORD manquant : définissez-le dans .env.local.");
  return value;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function passwordMatches(password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  return Boolean(expected) && safeEqual(sign(password), sign(expected!));
}

export function createAdminToken(): string {
  const payload = String(Date.now() + ADMIN_SESSION_SECONDS * 1000);
  return `${payload}.${sign(payload)}`;
}

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  try {
    return safeEqual(signature, sign(payload)) && Number(payload) > Date.now();
  } catch {
    return false;
  }
}

export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/connexion");
}
