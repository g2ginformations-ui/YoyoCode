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

// Lecture d'une image ou d'un PDF scanné (CV en photo) : le modèle transcrit le texte du document.
// Modèle réglable par ANTHROPIC_OCR_MODEL ; par défaut, le modèle de la lettre offerte.
export const OCR_MODEL = process.env.ANTHROPIC_OCR_MODEL || TRIAL_MODEL;

export type OcrMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif" | "application/pdf";

export async function readDocument(data: string, mediaType: OcrMediaType, instruction: string): Promise<string> {
  const source: Anthropic.ContentBlockParam =
    mediaType === "application/pdf"
      ? { type: "document", source: { type: "base64", media_type: "application/pdf", data } }
      : { type: "image", source: { type: "base64", media_type: mediaType, data } };
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: [source, { type: "text", text: instruction }] }];

  if (OCR_MODEL.startsWith("claude-haiku")) {
    const message = await client.messages.stream({ model: OCR_MODEL, max_tokens: 8000, messages }).finalMessage();
    if (message.stop_reason === "refusal") throw new RefusalError(REFUSAL_MESSAGE);
    return joinText(message.content);
  }
  const message = await client.beta.messages
    .stream({
      model: OCR_MODEL,
      max_tokens: 8000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      messages,
    })
    .finalMessage();
  if (message.stop_reason === "refusal") throw new RefusalError(REFUSAL_MESSAGE);
  return joinText(message.content);
}
