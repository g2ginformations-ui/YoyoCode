import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TRIAL_COOKIE, getSession } from "@/lib/access";
import { rateLimited } from "@/lib/guard";
import { REVIEW_COOKIE, addReview, reviewSummary, reviewsStorageEnabled } from "@/lib/reviews";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Peut laisser un avis : qui a déjà reçu une lettre (lettre offerte utilisée ou client connecté),
// une seule fois par navigateur.
async function canReview(): Promise<boolean> {
  if (!reviewsStorageEnabled()) return false;
  const store = await cookies();
  if (store.get(REVIEW_COOKIE)) return false;
  return Boolean(store.get(TRIAL_COOKIE)) || Boolean(await getSession());
}

export async function GET() {
  const summary = await reviewSummary();
  return NextResponse.json({ ...summary, canReview: await canReview() });
}

export async function POST(request: Request) {
  if (!(await canReview())) {
    return NextResponse.json(
      { error: "Vous pourrez laisser un avis après avoir reçu votre première lettre (un avis par personne)." },
      { status: 403 },
    );
  }
  // Quelques avis au plus par connexion et par jour : le formulaire ne peut pas servir à inonder la page.
  if (await rateLimited(request, "avis", 3, 24 * 60 * 60)) {
    return NextResponse.json(
      { error: "Trop d'avis envoyés depuis cette connexion. Réessayez demain." },
      { status: 429 },
    );
  }
  const body = (await request.json().catch(() => ({}))) as { name?: unknown; rating?: unknown; text?: unknown };
  const name = String(body.name ?? "").replace(/\s+/g, " ").trim().slice(0, 30);
  const text = String(body.text ?? "").trim().slice(0, 500);
  const rating = Number(body.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Choisissez une note de 1 à 5 étoiles." }, { status: 400 });
  }
  if (text.length < 2) return NextResponse.json({ error: "Écrivez quelques mots." }, { status: 400 });
  if (/https?:\/\/|www\./i.test(`${name} ${text}`)) {
    return NextResponse.json({ error: "Les liens ne sont pas autorisés dans les avis." }, { status: 400 });
  }

  const review = { name: name || "Anonyme", rating, text, date: new Date().toISOString() };
  try {
    await addReview(review);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Votre avis n'a pas pu être enregistré. Réessayez plus tard." }, { status: 503 });
  }
  const response = NextResponse.json({ ok: true, review });
  response.cookies.set(REVIEW_COOKIE, "1", {
    httpOnly: true,
    secure: new URL(request.url).protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: 365 * 24 * 60 * 60,
  });
  return response;
}
