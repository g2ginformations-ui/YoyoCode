import { NextResponse } from "next/server";
import { TRIAL_COOKIE } from "@/lib/access";

export const runtime = "nodejs";

// Appelé par la page une fois la lettre offerte reçue : un échec de génération ne consomme pas l'essai.
export async function POST(request: Request) {
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
