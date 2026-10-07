// Appel à l'API de Mistral AI (https://docs.mistral.ai), sans dépendance supplémentaire.
// Offre gratuite « Experiment » : environ 1 requête par seconde, les textes envoyés peuvent servir
// à entraîner les modèles de Mistral (voir la politique de confidentialité).
export const MISTRAL_MODEL = process.env.MISTRAL_MODEL || "mistral-large-latest";

export function mistralEnabled(): boolean {
  return Boolean(process.env.MISTRAL_API_KEY);
}

export class MistralError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

type Chunk = { type?: string; text?: string };
type Completion = { choices?: { message?: { content?: string | Chunk[] } }[] };

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function askMistral(system: string, prompt: string): Promise<string> {
  // L'offre gratuite limite le débit : on réessaie quelques fois en cas de 429 ou d'erreur passagère.
  for (let attempt = 0; ; attempt++) {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        max_tokens: 4000,
        temperature: 0.6,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (res.ok) {
      const data = (await res.json()) as Completion;
      const content = data.choices?.[0]?.message?.content;
      const text = (
        typeof content === "string"
          ? content
          : (content ?? []).filter((chunk) => chunk.type === "text").map((chunk) => chunk.text ?? "").join("")
      ).trim();
      if (!text) throw new Error("Réponse vide du modèle.");
      return text;
    }
    const retryable = res.status === 429 || res.status >= 500;
    if (retryable && attempt < 4) {
      await wait(1500 * (attempt + 1));
      continue;
    }
    throw new MistralError(res.status, `Mistral a répondu ${res.status} : ${(await res.text()).slice(0, 300)}`);
  }
}

// Lecture d'une image (CV en photo) avec un modèle Mistral qui voit les images.
export const MISTRAL_VISION_MODEL = process.env.MISTRAL_VISION_MODEL || "mistral-small-latest";

export async function readImageMistral(data: string, mediaType: string, instruction: string): Promise<string> {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MISTRAL_VISION_MODEL,
        max_tokens: 4000,
        temperature: 0,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: instruction },
              { type: "image_url", image_url: `data:${mediaType};base64,${data}` },
            ],
          },
        ],
      }),
    });
    if (res.ok) {
      const content = ((await res.json()) as Completion).choices?.[0]?.message?.content;
      const text = (
        typeof content === "string"
          ? content
          : (content ?? []).filter((chunk) => chunk.type === "text").map((chunk) => chunk.text ?? "").join("")
      ).trim();
      if (!text) throw new Error("Réponse vide du modèle.");
      return text;
    }
    if ((res.status === 429 || res.status >= 500) && attempt < 4) {
      await wait(1500 * (attempt + 1));
      continue;
    }
    throw new MistralError(res.status, `Mistral a répondu ${res.status} : ${(await res.text()).slice(0, 300)}`);
  }
}
