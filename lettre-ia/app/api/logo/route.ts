import { DOMAIN_PATTERN, normalizeDomain } from "@/lib/company";

export const runtime = "nodejs";

const MAX_BYTES = 300_000;

// Logo (icône du site) d'une entreprise, via le service d'icônes de Google : le serveur n'appelle
// jamais directement le domaine saisi. Servi depuis notre domaine pour pouvoir l'insérer dans le PDF.
export async function GET(request: Request) {
  const domain = normalizeDomain(new URL(request.url).searchParams.get("domain") ?? "");
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
    return new Response(bytes, {
      headers: { "Content-Type": type, "Cache-Control": "public, max-age=86400, s-maxage=604800" },
    });
  } catch {
    return new Response("Logo indisponible", { status: 404 });
  }
}
