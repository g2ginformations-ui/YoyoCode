// Brouillon en cours (CV, offre, réglages, lettre), gardé dans le navigateur pour ne rien perdre
// en passant par « Mon compte », l'abonnement ou une autre page. Rien n'est envoyé au serveur.
export type Draft = {
  cv: string;
  offer: string;
  length: string;
  instructions: string;
  letter: string;
  historyId: string | null;
};

const KEY = "lettre-ia:brouillon";

export function readDraft(): Partial<Draft> | null {
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Partial<Draft>) : null;
  } catch {
    return null;
  }
}

export function saveDraft(draft: Draft): void {
  try {
    const empty = !draft.cv.trim() && !draft.offer.trim() && !draft.instructions.trim() && !draft.letter.trim();
    if (empty) window.localStorage.removeItem(KEY);
    else window.localStorage.setItem(KEY, JSON.stringify(draft));
  } catch {
    // Stockage plein ou indisponible : le brouillon n'est simplement pas conservé.
  }
}

export function clearDraft(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Rien à effacer.
  }
}
