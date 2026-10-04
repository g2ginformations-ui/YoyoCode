import { kv, kvEnabled } from "@/lib/kv";

// Mini-enquête proposée au moment de la résiliation (facultative : on peut résilier sans répondre).
// `feedback` correspond aux motifs reconnus par Stripe, visibles dans son tableau de bord.
export const CANCEL_REASONS = [
  { id: "emploi", label: "J'ai trouvé un emploi 🎉", feedback: "other" },
  { id: "plus-besoin", label: "Je n'en ai plus besoin pour l'instant", feedback: "unused" },
  { id: "prix", label: "C'est trop cher", feedback: "too_expensive" },
  { id: "qualite", label: "Les lettres ne me conviennent pas", feedback: "low_quality" },
  { id: "fonctions", label: "Il manque une fonctionnalité", feedback: "missing_features" },
  { id: "autre-service", label: "J'utilise un autre service", feedback: "switched_service" },
  { id: "autre", label: "Autre raison", feedback: "other" },
] as const;

export type CancelReasonId = (typeof CANCEL_REASONS)[number]["id"];

export function findReason(id: unknown) {
  return CANCEL_REASONS.find((reason) => reason.id === id) ?? null;
}

export type CancellationAnswer = { date: string; plan: string; reason: string | null; comment: string };

const KEY = "resiliations";
const MAX_STORED = 1000;

// Les réponses sont aussi gardées dans la base Redis, pour les consulter dans l'espace d'administration.
export async function recordCancellation(answer: CancellationAnswer): Promise<void> {
  if (!kvEnabled()) return;
  try {
    await kv(["LPUSH", KEY, JSON.stringify(answer)]);
    await kv(["LTRIM", KEY, 0, MAX_STORED - 1]);
  } catch (error) {
    console.error(error);
  }
}

export async function cancellationAnswers(): Promise<CancellationAnswer[]> {
  if (!kvEnabled()) return [];
  const rows = await kv<string[]>(["LRANGE", KEY, 0, MAX_STORED - 1]);
  return rows.flatMap((raw) => {
    try {
      return [JSON.parse(raw) as CancellationAnswer];
    } catch {
      return [];
    }
  });
}
