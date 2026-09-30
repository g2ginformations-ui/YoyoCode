import Anthropic from "@anthropic-ai/sdk";
import { currentAccess } from "@/lib/access";
import { RefusalError, ask } from "@/lib/claude";
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
const LENGTHS: Length[] = ["court", "standard", "long"];

type Body = {
  cv?: string;
  offer?: string;
  length?: Length;
  instructions?: string;
  // Mode ajustement : lettre existante + demande (« plus court », « plus long », …)
  letter?: string;
  adjust?: string;
};

type Event =
  | { type: "step"; step: "analyse" | "redaction" | "humanisation" | "ajustement" }
  | { type: "done"; letter: string }
  | { type: "error"; message: string };

function errorMessage(error: unknown): string {
  if (error instanceof RefusalError) return error.message;
  if (error instanceof Anthropic.AuthenticationError) return "Clé API Anthropic invalide ou absente.";
  if (error instanceof Anthropic.RateLimitError) return "Trop de demandes en même temps, réessayez dans un instant.";
  if (error instanceof Anthropic.APIError) return `Erreur du service IA (${error.status}).`;
  return "Une erreur inattendue est survenue.";
}

export async function POST(request: Request) {
  if (!(await currentAccess()).active) {
    return Response.json(
      { error: "Accès réservé : débloquez l'accès complet pour générer votre lettre.", paywall: true },
      { status: 402 },
    );
  }

  const body = (await request.json()) as Body;
  const cv = (body.cv ?? "").trim();
  const offer = (body.offer ?? "").trim();
  const length = LENGTHS.includes(body.length as Length) ? (body.length as Length) : "standard";
  const instructions = (body.instructions ?? "").slice(0, 1000);
  const isAdjust = Boolean(body.letter?.trim() && body.adjust?.trim());

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "Service non configuré : ajoutez ANTHROPIC_API_KEY dans les variables d'environnement." },
      { status: 500 },
    );
  }
  if (!cv || !offer) {
    return Response.json({ error: "Le CV et l'offre d'emploi sont nécessaires." }, { status: 400 });
  }
  if (cv.length > MAX_CHARS || offer.length > MAX_CHARS) {
    return Response.json({ error: "Document trop long (60 000 caractères maximum)." }, { status: 413 });
  }

  // Réponse en NDJSON : une ligne par étape, pour afficher la progression côté client.
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Event) => controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      try {
        if (isAdjust) {
          send({ type: "step", step: "ajustement" });
          const letter = await ask(
            ADJUST_SYSTEM,
            adjustPrompt(cv, offer, body.letter!, body.adjust!.slice(0, 1000)),
            "high",
          );
          send({ type: "done", letter });
        } else {
          send({ type: "step", step: "analyse" });
          const brief = await ask(ANALYSIS_SYSTEM, analysisPrompt(cv, offer), "medium");

          send({ type: "step", step: "redaction" });
          const draft = await ask(WRITER_SYSTEM, writerPrompt(cv, offer, brief, length, instructions), "high");

          send({ type: "step", step: "humanisation" });
          const letter = await ask(
            HUMANIZER_SYSTEM,
            humanizerPrompt(cv, offer, draft, length, instructions),
            "high",
          );
          send({ type: "done", letter });
        }
      } catch (error) {
        console.error(error);
        send({ type: "error", message: errorMessage(error) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" },
  });
}
