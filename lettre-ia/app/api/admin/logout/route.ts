import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "@/lib/admin";
import { siteUrl } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const response = NextResponse.redirect(`${siteUrl(request)}/admin/avis`, 303);
  response.cookies.delete(ADMIN_COOKIE);
  return response;
}
