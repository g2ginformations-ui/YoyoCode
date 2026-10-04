import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { TRIAL_COOKIE } from "@/lib/access";
import { rateLimited } from "@/lib/guard";
import { countMotive } from "@/lib/motives";

export const runtime = "nodejs";

// Appelé par la page une fois la lettre offerte reçue : un échec de génération ne consomme pas l'essai.
export async function POST(request: Request) {
  // Nouvel utilisateur (première lettre reçue sur ce navigateur) : il rejoint les « Motivés ».
  // Limité par adresse IP : le compteur ne peut pas être gonflé en appelant cette adresse en boucle.
  if (!(await cookies()).get(TRIAL_COOKIE) && !(await rateLimited(request, "motive", 2, 24 * 60 * 60))) {
    await countMotive();
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TRIAL_COOKIE, "1", {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });
  return response;
}
