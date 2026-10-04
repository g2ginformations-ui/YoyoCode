import { findCompanyDomain } from "@/lib/company-site";
import { rateLimited } from "@/lib/guard";
import { kv, kvEnabled } from "@/lib/kv";

export const runtime = "nodejs";
export const maxDuration = 30;

// Site officiel d'une entreprise à partir de son nom (pour afficher son logo), quand l'offre ne le donne pas.
export async function GET(request: Request) {
  const name = (new URL(request.url).searchParams.get("nom") ?? "").trim().slice(0, 80);
  if (name.length < 2) return Response.json({ domain: "" });
  if (await rateLimited(request, "entreprise", 60, 60 * 60)) return Response.json({ domain: "" }, { status: 429 });

  // Résultat gardé 30 jours : la même entreprise revient souvent.
  const key = `site:${name.toLowerCase()}`;
  if (kvEnabled()) {
    const cached = await kv<string | null>(["GET", key]).catch(() => null);
    if (typeof cached === "string") return Response.json({ domain: cached });
  }
  const domain = await findCompanyDomain(name);
  if (kvEnabled()) await kv(["SET", key, domain, "EX", domain ? 30 * 86400 : 86400]).catch(() => {});
  return Response.json({ domain }, { headers: { "Cache-Control": "public, s-maxage=86400" } });
}
