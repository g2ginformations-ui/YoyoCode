// Historique des lettres, enregistré uniquement dans le navigateur de l'utilisateur (localStorage).
// Rien n'est envoyé ni conservé sur le serveur.
export type HistoryEntry = {
  id: string;
  createdAt: number;
  updatedAt: number;
  title: string;
  letter: string;
  cv: string;
  offer: string;
};

const KEY = "lettre-ia:historique";
const MAX_ENTRIES = 50;
// CV et offre sont tronqués pour rester loin de la limite de stockage du navigateur (~5 Mo).
const MAX_SOURCE_CHARS = 12_000;

export function readHistory(): HistoryEntry[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    const entries = raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
    return Array.isArray(entries) ? entries.sort((a, b) => b.updatedAt - a.updatedAt) : [];
  } catch {
    return [];
  }
}

function writeHistory(entries: HistoryEntry[]): void {
  let kept = entries.slice(0, MAX_ENTRIES);
  // Stockage plein : on retire les plus anciennes jusqu'à ce que l'écriture passe.
  while (kept.length > 0) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(kept));
      return;
    } catch {
      kept = kept.slice(0, -1);
    }
  }
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Stockage indisponible (navigation privée stricte) : l'historique est simplement désactivé.
  }
}

// Titre lisible : la ligne « Objet : … » de la lettre, sinon le début de l'offre.
export function titleFor(letter: string, offer: string): string {
  const subject = letter.match(/^\s*Objet\s*:\s*(.+)$/im)?.[1]?.trim();
  const fallback = offer.trim().split("\n")[0]?.trim();
  return (subject || fallback || "Lettre de motivation").slice(0, 120);
}

export function saveEntry(entry: { id?: string; letter: string; cv: string; offer: string }): string {
  const entries = readHistory();
  const now = Date.now();
  const id = entry.id ?? `${now.toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const existing = entries.find((e) => e.id === id);
  const next: HistoryEntry = {
    id,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    title: titleFor(entry.letter, entry.offer),
    letter: entry.letter,
    cv: entry.cv.slice(0, MAX_SOURCE_CHARS),
    offer: entry.offer.slice(0, MAX_SOURCE_CHARS),
  };
  writeHistory([next, ...entries.filter((e) => e.id !== id)]);
  return id;
}

export function getEntry(id: string): HistoryEntry | undefined {
  return readHistory().find((e) => e.id === id);
}

export function deleteEntry(id: string): void {
  writeHistory(readHistory().filter((e) => e.id !== id));
}

export function clearHistory(): void {
  try {
    window.localStorage.removeItem(KEY);
  } catch {
    // Rien à effacer si le stockage est indisponible.
  }
}
