import { DOMAIN_PATTERN, normalizeDomain } from "@/lib/company";
import { safeFetch } from "@/lib/safe-fetch";

export const runtime = "nodejs";

const MAX_BYTES = 300_000;

function image(bytes: ArrayBuffer | Uint8Array, type: string): Response {
  return new Response(bytes as BodyInit, {
    headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400, s-maxage=604800" },
  });
}

// Logo d'une entreprise, servi depuis notre domaine pour pouvoir l'insérer dans le PDF :
// - ?url= : logo officiel publié avec l'offre (lu avec les protections de safeFetch) ;
// - ?domain= : icône du site, via le service d'icônes de Google (le domaine saisi n'est jamais appelé).
// Seuls PNG et JPEG sont acceptés : ce sont les formats que le PDF sait intégrer.
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const logoUrl = params.get("url") ?? "";
  if (logoUrl) {
    try {
      const res = await safeFetch(logoUrl, "image/png,image/jpeg", MAX_BYTES);
      const type = res.type.split(";")[0];
      if (res.status >= 400 || !/^image\/(png|jpeg)$/.test(type)) return new Response("Logo introuvable", { status: 404 });
      return image(res.body, type);
    } catch {
      return new Response("Logo indisponible", { status: 404 });
    }
  }

  const domain = normalizeDomain(params.get("domain") ?? "");
  if (!DOMAIN_PATTERN.test(domain)) return new Response("Domaine invalide", { status: 400 });

  try {
    const res = await fetch(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`, {
      redirect: "follow",
      signal: AbortSignal.timeout(5000),
    });
    const type = res.headers.get("content-type") ?? "";
    if (!res.ok || !/^image\/(png|jpeg)/.test(type)) return new Response("Logo introuvable", { status: 404 });
    const bytes = await res.arrayBuffer();
    if (bytes.byteLength > MAX_BYTES) return new Response("Logo trop lourd", { status: 404 });
    return image(bytes, type);
  } catch {
    return new Response("Logo indisponible", { status: 404 });
  }
}
