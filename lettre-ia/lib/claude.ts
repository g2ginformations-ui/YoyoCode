import Anthropic from "@anthropic-ai/sdk";

// Modèle des lettres payantes (offres, ajustements) et modèle, moins cher, de la lettre offerte.
export const PAID_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
export const TRIAL_MODEL = process.env.ANTHROPIC_TRIAL_MODEL || "claude-haiku-4-5";

const client = new Anthropic();

type Effort = "low" | "medium" | "high";

export class RefusalError extends Error {}

const REFUSAL_MESSAGE = "La demande n'a pas pu être traitée. Vérifiez le contenu des documents.";

function joinText(blocks: { type: string; text?: string }[]): string {
  const text = blocks
    .filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("")
    .trim();
  if (!text) throw new Error("Réponse vide du modèle.");
  return text;
}

// Un appel texte → texte.
export async function ask(system: string, prompt: string, effort: Effort, model = PAID_MODEL): Promise<string> {
  // Haiku 4.5 ne prend ni le réglage d'effort ni le relais automatique : appel simple, sans réflexion.
  if (model.startsWith("claude-haiku")) {
    const message = await client.messages
      .stream({ model, max_tokens: 16000, system, messages: [{ role: "user", content: prompt }] })
      .finalMessage();
    if (message.stop_reason === "refusal") throw new RefusalError(REFUSAL_MESSAGE);
    return joinText(message.content);
  }

  // Le fallback serveur prend le relais si le modèle principal décline.
  const message = await client.beta.messages
    .stream({
      model,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort },
      system,
      messages: [{ role: "user", content: prompt }],
    })
    .finalMessage();
  if (message.stop_reason === "refusal") throw new RefusalError(REFUSAL_MESSAGE);
  return joinText(message.content);
}
