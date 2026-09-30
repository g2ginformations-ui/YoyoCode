import { NextResponse } from "next/server";
import { readToken, setSessionCookie } from "@/lib/access";
import { siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const base = siteUrl(request);
  const session = readToken("login", new URL(request.url).searchParams.get("token") ?? undefined);
  if (!session) return NextResponse.redirect(`${base}/connexion?expire=1`, 303);
  const response = NextResponse.redirect(`${base}/`, 303);
  setSessionCookie(response, session, base.startsWith("https://"));
  return response;
}
