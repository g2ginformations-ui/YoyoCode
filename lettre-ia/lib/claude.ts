import Anthropic from "@anthropic-ai/sdk";

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-5-5";

const client = new Anthropic();

type Effort = "low" | "medium" | "high";

export class RefusalError extends Error {}

// Un appel texte → texte. Le fallback serveur prend le relais si le modèle principal décline.
export async function ask(system: string, prompt: string, effort: Effort): Promise<string> {
  const stream = client.beta.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort },
    system,
    messages: [{ role: "user", content: prompt }],
  });
  const message = await stream.finalMessage();

  if (message.stop_reason === "refusal") {
    throw new RefusalError("La demande n'a pas pu être traitée. Vérifiez le contenu des documents.");
  }

  const text = message.content
    .filter((block): block is Anthropic.Beta.BetaTextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();

  if (!text) throw new Error("Réponse vide du modèle.");
  return text;
}
