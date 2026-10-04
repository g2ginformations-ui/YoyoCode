import { DOMAIN_PATTERN, normalizeDomain } from "@/lib/company";
import { fetchLogoImage, findLogo } from "@/lib/company-site";

export const runtime = "nodejs";

// Logo d'une entreprise, servi depuis notre domaine pour l'aperçu et le PDF :
// - ?url= : logo officiel publié avec l'offre ;
// - ?domain= : logo trouvé sur le site de l'entreprise (voir lib/company-site.ts).
// Formats acceptés : PNG, JPEG, GIF, WebP, ICO (convertis en PNG dans le navigateur pour le PDF). Jamais de SVG.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const logoUrl = params.get("url") ?? "";
  const domain = normalizeDomain(params.get("domain") ?? "");
  // Nom de l'entreprise (facultatif) : permet de trouver son logo officiel quand le site bloque les robots.
  const name = (params.get("nom") ?? "").trim().slice(0, 80);
  if (!logoUrl && !DOMAIN_PATTERN.test(domain)) return new Response("Domaine invalide", { status: 400 });

  const logo = logoUrl ? await fetchLogoImage(logoUrl) : await findLogo(domain, name);
  if (!logo) return new Response("Logo introuvable", { status: 404, headers: { "Cache-Control": "public, s-maxage=3600" } });
  return new Response(logo.body as BodyInit, {
    headers: {
      "Content-Type": logo.type,
      "Cache-Control": "public, max-age=86400, s-maxage=604800",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
