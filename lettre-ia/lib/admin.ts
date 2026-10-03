import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { createToken, readToken } from "@/lib/access";

// Espace d'administration (modération des avis), protégé par le mot de passe ADMIN_PASSWORD.
export const ADMIN_COOKIE = "lettre_ia_admin";
const ADMIN_TTL_MS = 12 * 60 * 60 * 1000;

export function adminEnabled(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.ACCESS_SECRET);
}

export function checkAdminPassword(password: string): boolean {
  if (!adminEnabled()) return false;
  // Comparaison à longueur fixe et en temps constant.
  const digest = (value: string) => createHash("sha256").update(value).digest();
  return timingSafeEqual(digest(password), digest(process.env.ADMIN_PASSWORD!));
}

export function setAdminCookie(response: NextResponse, secure: boolean) {
  response.cookies.set(ADMIN_COOKIE, createToken("admin", { customerId: "admin", email: "" }, ADMIN_TTL_MS), {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: "/",
    maxAge: ADMIN_TTL_MS / 1000,
  });
}

export async function isAdmin(): Promise<boolean> {
  if (!adminEnabled()) return false;
  try {
    return readToken("admin", (await cookies()).get(ADMIN_COOKIE)?.value)?.customerId === "admin";
  } catch {
    return false;
  }
}
