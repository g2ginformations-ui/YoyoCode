import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/access";
import { siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = NextResponse.redirect(`${siteUrl(request)}/`, 303);
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
