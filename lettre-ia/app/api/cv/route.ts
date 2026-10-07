import Anthropic from "@anthropic-ai/sdk";
import { consumeCv, recordUnlimitedUse, resolveAccess } from "@/lib/access";
import { aiConfigured, generateText } from "@/lib/ai";
import { RefusalError } from "@/lib/claude";
import { CV_SYSTEM, cvPrompt, parseCvJson } from "@/lib/cv";
import { acquireLock, releaseLock } from "@/lib/guard";
import { MistralError } from "@/lib/mistral";
import { WEEKLY_LIMIT } from "@/lib/pricing";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_CHARS = 60_000;

function text(value: unknown): string {
  return typeof value === "string" ? value.trim().slice(0, MAX_CHARS + 1) : "";
}

function errorMessage(error: unknown): string {
  if (error instanceof RefusalError) return error.message;
  if (error instanceof MistralError && error.status === 429) return "Le service est très demandé, réessayez dans une minute.";
  if (error instanceof Anthropic.RateLimitError) return "Trop de demandes en même temps, réessayez dans un instant.";
  return "Le CV n'a pas pu être adapté. Réessayez dans un instant.";
}

// CV adapté à l'offre, sur une page : inclus dans les offres illimitées (semaine, mois, à vie), et un CV avec
// chaque lettre achetée à l'unité. Avec une offre illimitée, il compte dans la limite de sécurité hebdomadaire.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { cv?: unknown; offer?: unknown } | null;
  const { access, customerId } = await resolveAccess();
  const unlimited = access.active;
  if (!unlimited && access.cvLeft <= 0) {
    return Response.json(
      { error: "Le CV adapté à l'offre est inclus avec chaque lettre achetée et dans les offres illimitées.", paywall: true },
      { status: 402 },
    );
  }
  if (unlimited && access.weekLeft <= 0) {
    return Response.json(
      { error: `Limite de sécurité atteinte : ${WEEKLY_LIMIT} documents cette semaine. Elle se remet à zéro lundi.` },
      { status: 429 },
    );
  }
  if (!aiConfigured()) return Response.json({ error: "Service non configuré." }, { status: 500 });

  const cv = text(body?.cv);
  const offer = text(body?.offer);
  if (!cv || !offer) return Response.json({ error: "Le CV et l'offre d'emploi sont nécessaires." }, { status: 400 });
  if (cv.length > MAX_CHARS || offer.length > MAX_CHARS) {
    return Response.json({ error: "Document trop long (60 000 caractères maximum)." }, { status: 413 });
  }

  const lock = customerId ? `redaction:${customerId}` : null;
  if (lock && !(await acquireLock(lock, maxDuration + 30))) {
    return Response.json({ error: "Un document est déjà en cours de rédaction sur votre compte. Patientez." }, { status: 409 });
  }
  try {
    // Une seconde tentative si la réponse n'est pas un JSON exploitable.
    let tailored = null;
    for (let attempt = 0; attempt < 2 && !tailored; attempt++) {
      tailored = parseCvJson(await generateText(CV_SYSTEM, cvPrompt(cv, offer), "medium", false));
    }
    if (!tailored) return Response.json({ error: "Le CV n'a pas pu être mis en forme. Réessayez." }, { status: 502 });
    if (customerId) await (unlimited ? recordUnlimitedUse(customerId) : consumeCv(customerId)).catch((error) => console.error(error));
    return Response.json({ cv: tailored });
  } catch (error) {
    console.error(error);
    return Response.json({ error: errorMessage(error) }, { status: 502 });
  } finally {
    if (lock) await releaseLock(lock);
  }
}
