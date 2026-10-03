import { NextResponse } from "next/server";
import { checkAdminPassword, setAdminCookie } from "@/lib/admin";
import { siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const base = siteUrl(request);
  const form = await request.formData().catch(() => null);
  if (!checkAdminPassword(String(form?.get("password") ?? ""))) {
    // Ralentit les essais de mots de passe.
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return NextResponse.redirect(`${base}/admin/avis?refus=1`, 303);
  }
  const response = NextResponse.redirect(`${base}/admin/avis`, 303);
  setAdminCookie(response, base.startsWith("https://"));
  return response;
}
