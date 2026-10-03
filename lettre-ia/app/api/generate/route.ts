import Anthropic from "@anthropic-ai/sdk";
import { consumeAdjustment, consumeCredit, recordUnlimitedUse, resolveAccess } from "@/lib/access";
import { WEEKLY_LIMIT } from "@/lib/pricing";
import { aiConfigured, generateText } from "@/lib/ai";
import { RefusalError } from "@/lib/claude";
import { acquireLock, rateLimited, releaseLock } from "@/lib/guard";
import { MistralError } from "@/lib/mistral";
import {
  ADJUST_SYSTEM,
  ANALYSIS_SYSTEM,
  HUMANIZER_SYSTEM,
  type Length,
  WRITER_SYSTEM,
  adjustPrompt,
  analysisPrompt,
  humanizerPrompt,
  writerPrompt,
} from "@/lib/prompts";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_CHARS = 60_000;
const MAX_LETTER_CHARS = 20_000;
const LENGTHS: Length[] = ["court", "standard", "long"];
// Lettres offertes par adresse IP et par jour : empêche d'en obtenir à volonté en effaçant ses cookies.
const TRIALS_PER_IP_PER_DAY = 2;

type Body = {
  cv?: unknown;
  offer?: unknown;
  length?: unknown;
  instructions?: unknown;
  // Disponibilité du candidat (« immédiate », « dès mars »…), ajoutée aux consignes.
  availability?: unknown;
  // Nom de l'entreprise visée, confirmé ou corrigé par l'utilisateur.
  company?: unknown;
  // Mode ajustement : lettre existante + demande (« plus court », « plus long », …)
  letter?: unknown;
  adjust?: unknown;
};

type Event =
  | { type: "step"; step: "analyse" | "redaction" | "humanisation" | "ajustement" }
  | { type: "done"; letter: string }
  | { type: "error"; message: string };

function errorMessage(error: unknown): string {
  if (error instanceof RefusalError) return error.message;
  if (error instanceof MistralError) {
    if (error.status === 401) return "Clé API Mistral invalide ou absente.";
    if (error.status === 429) return "Le service est très demandé en ce moment, réessayez dans une minute.";
    return `Erreur du service IA (${error.status}).`;
  }
  if (error instanceof Anthropic.AuthenticationError) return "Clé API Anthropic invalide ou absente.";
  if (error instanceof Anthropic.RateLimitError) return "Trop de demandes en même temps, réessayez dans un instant.";
  if (error instanceof Anthropic.APIError) return `Erreur du service IA (${error.status}).`;
  return "Une erreur inattendue est survenue.";
}

// Texte reçu du navigateur : tout ce qui n'est pas une chaîne est ignoré.
function text(value: unknown, max = MAX_CHARS + 1): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Body | null;
  if (!body || typeof body !== "object") {
    return Response.json({ error: "Requête invalide." }, { status: 400 });
  }
  const letterToAdjust = text(body.letter, MAX_LETTER_CHARS);
  const adjustRequest = text(body.adjust, 1000);
  const isAdjust = Boolean(letterToAdjust && adjustRequest);

  // Qui paie cette génération : offre illimitée (avec limite hebdomadaire), lettre à l'unité, ou lettre offerte.
  const { access, customerId } = await resolveAccess();
  type Billing = "unlimited" | "credit" | "paid-adjust" | "trial";
  let billing: Billing | null = null;
  if (access.active) {
    if (access.weekLeft <= 0) {
      return Response.json(
        {
          error: `Limite de sécurité atteinte : ${WEEKLY_LIMIT} lettres cette semaine. Elle se remet à zéro lundi.`,
          limit: true,
        },
        { status: 429 },
      );
    }
    billing = "unlimited";
  } else if (isAdjust) {
    if (access.adjustLeft > 0) billing = "paid-adjust";
  } else if (access.credits > 0) {
    billing = "credit";
  } else if (access.trialAvailable) {
    billing = "trial";
  }
  if (!billing) {
    return Response.json(
      {
        error: isAdjust
          ? "Les ajustements de cette lettre sont épuisés : choisissez une offre pour continuer à la modifier."
          : "Votre lettre offerte a déjà été utilisée : choisissez une offre, dès 0,99 € la lettre.",
        paywall: true,
      },
      { status: 402 },
    );
  }

  // Décompte après une lettre réussie seulement : un échec ne coûte rien au client.
  async function charge() {
    if (!customerId) return;
    try {
      if (billing === "unlimited") await recordUnlimitedUse(customerId);
      else if (billing === "credit") await consumeCredit(customerId);
      else if (billing === "paid-adjust") await consumeAdjustment(customerId);
    } catch (error) {
      console.error("Décompte de l'usage impossible :", error);
    }
  }

  // Avec Claude, la lettre offerte utilise un modèle moins cher que les lettres payantes.
  const trial = billing === "trial";

  const cv = text(body.cv);
  const offer = text(body.offer);
  const length = LENGTHS.includes(body.length as Length) ? (body.length as Length) : "standard";
  const availability = text(body.availability, 120);
  const company = text(body.company, 80);
  const instructions = [
    text(body.instructions, 1000),
    company && `Entreprise visée : ${company}. Utilise exactement ce nom dans la lettre.`,
    availability && `Disponibilité du candidat, à mentionner clairement dans la lettre : ${availability}.`,
  ]
    .filter(Boolean)
    .join("\n");

  if (!aiConfigured()) {
    return Response.json(
      { error: "Service non configuré : ajoutez MISTRAL_API_KEY (ou ANTHROPIC_API_KEY) dans les variables d'environnement." },
      { status: 500 },
    );
  }
  if (!cv || !offer) {
    return Response.json({ error: "Le CV et l'offre d'emploi sont nécessaires." }, { status: 400 });
  }
  if (cv.length > MAX_CHARS || offer.length > MAX_CHARS) {
    return Response.json({ error: "Document trop long (60 000 caractères maximum)." }, { status: 413 });
  }
  if (trial && (await rateLimited(request, "essai", TRIALS_PER_IP_PER_DAY, 24 * 60 * 60))) {
    return Response.json(
      {
        error: "Trop de lettres offertes depuis cette connexion aujourd'hui : choisissez une offre, dès 0,99 € la lettre.",
        paywall: true,
      },
      { status: 429 },
    );
  }
  // Une seule rédaction à la fois par compte : un crédit ne peut pas servir à plusieurs lettres en parallèle.
  const lock = customerId ? `redaction:${customerId}` : null;
  if (lock && !(await acquireLock(lock, maxDuration + 30))) {
    return Response.json(
      { error: "Une lettre est déjà en cours de rédaction sur votre compte. Patientez quelques secondes." },
      { status: 409 },
    );
  }

  // Réponse en NDJSON : une ligne par étape, pour afficher la progression côté client.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Event) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        if (isAdjust) {
          send({ type: "step", step: "ajustement" });
          const letter = await generateText(
            ADJUST_SYSTEM,
            adjustPrompt(cv, offer, letterToAdjust, adjustRequest),
            "high",
            trial,
          );
          await charge();
          send({ type: "done", letter });
        } else {
          send({ type: "step", step: "analyse" });
          const brief = await generateText(ANALYSIS_SYSTEM, analysisPrompt(cv, offer), "medium", trial);

          send({ type: "step", step: "redaction" });
          const draft = await generateText(WRITER_SYSTEM, writerPrompt(cv, offer, brief, length, instructions), "high", trial);

          send({ type: "step", step: "humanisation" });
          const letter = await generateText(
            HUMANIZER_SYSTEM,
            humanizerPrompt(cv, offer, draft, length, instructions),
            "high",
            trial,
          );
          await charge();
          send({ type: "done", letter });
        }
      } catch (error) {
        console.error(error);
        send({ type: "error", message: errorMessage(error) });
      } finally {
        if (lock) await releaseLock(lock);
        controller.close();
      }
    },
  });

  // La lettre offerte n'est marquée comme utilisée qu'une fois reçue (voir /api/essai).
  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
