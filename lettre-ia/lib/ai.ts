import { PAID_MODEL, TRIAL_MODEL, ask } from "@/lib/claude";
import { askMistral, mistralEnabled } from "@/lib/mistral";

// Choix du fournisseur d'IA : Mistral dès que MISTRAL_API_KEY est configurée, sinon Claude.
export type AiProvider = "mistral" | "claude";

export function aiProvider(): AiProvider {
  return mistralEnabled() ? "mistral" : "claude";
}

export function aiConfigured(): boolean {
  return mistralEnabled() || Boolean(process.env.ANTHROPIC_API_KEY);
}

type Effort = "low" | "medium" | "high";

export function generateText(system: string, prompt: string, effort: Effort, trial: boolean): Promise<string> {
  if (aiProvider() === "mistral") return askMistral(system, prompt);
  return ask(system, prompt, effort, trial ? TRIAL_MODEL : PAID_MODEL);
}
