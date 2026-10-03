import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { deleteReview } from "@/lib/reviews";
import { siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

// Supprime un avis (modération). Réservé à l'administrateur connecté.
export async function POST(request: Request) {
  const base = siteUrl(request);
  if (!(await isAdmin())) return NextResponse.redirect(`${base}/admin/avis`, 303);
  const form = await request.formData().catch(() => null);
  const raw = String(form?.get("raw") ?? "");
  if (!raw) return NextResponse.redirect(`${base}/admin/avis`, 303);
  try {
    await deleteReview(raw);
  } catch (error) {
    console.error(error);
    return NextResponse.redirect(`${base}/admin/avis?erreur=1`, 303);
  }
  return NextResponse.redirect(`${base}/admin/avis?supprime=1`, 303);
}
