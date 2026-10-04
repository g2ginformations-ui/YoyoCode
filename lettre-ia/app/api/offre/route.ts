import { rateLimited } from "@/lib/guard";
import { parseOfferPage } from "@/lib/offer-page";
import { FetchRefused, safeFetch } from "@/lib/safe-fetch";

export const runtime = "nodejs";

const MAX_PAGE_BYTES = 3_000_000;
const MAX_TEXT = 20_000;
// En dessous, la page ne contient sans doute pas l'offre (page de connexion, protection anti-robots…).
const MIN_TEXT = 400;

const BLOCKED =
  "Ce site ne permet pas la lecture automatique de ses offres. Copiez le texte de l'annonce et collez-le dans le cadre ci-dessous.";

// Lecture d'une offre d'emploi à partir de son lien, à la demande du candidat.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const raw = typeof body?.url === "string" ? body.url.trim().slice(0, 2000) : "";
  if (!raw) return Response.json({ error: "Collez le lien de l'offre." }, { status: 400 });
  if (await rateLimited(request, "offre", 30, 60 * 60)) {
    return Response.json({ error: "Trop de liens lus en peu de temps : réessayez dans une heure." }, { status: 429 });
  }

  try {
    const page = await safeFetch(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`, "text/html,application/xhtml+xml", MAX_PAGE_BYTES);
    if (page.status >= 400 || !page.type.includes("html")) return Response.json({ error: BLOCKED }, { status: 422 });
    const offer = parseOfferPage(new TextDecoder().decode(page.body), page.url);
    if (offer.text.length < MIN_TEXT) return Response.json({ error: BLOCKED }, { status: 422 });
    return Response.json({ ...offer, text: offer.text.slice(0, MAX_TEXT) });
  } catch (error) {
    if (error instanceof FetchRefused) return Response.json({ error: error.message }, { status: 400 });
    console.error(error);
    return Response.json({ error: BLOCKED }, { status: 422 });
  }
}
