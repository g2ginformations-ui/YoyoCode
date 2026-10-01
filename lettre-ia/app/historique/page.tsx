"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type HistoryEntry, clearHistory, deleteEntry, readHistory } from "@/lib/history";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function download(entry: HistoryEntry) {
  const blob = new Blob([entry.letter], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "lettre-de-motivation.txt";
  a.click();
  URL.revokeObjectURL(url);
}

export default function Historique() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => setEntries(readHistory()), []);

  async function copy(entry: HistoryEntry) {
    await navigator.clipboard.writeText(entry.letter);
    setCopied(entry.id);
    setTimeout(() => setCopied(null), 1500);
  }

  function remove(id: string) {
    if (!window.confirm("Supprimer cette lettre de l'historique ?")) return;
    deleteEntry(id);
    setEntries(readHistory());
  }

  function removeAll() {
    if (!window.confirm("Effacer tout l'historique de cet appareil ?")) return;
    clearHistory();
    setEntries([]);
  }

  return (
    <main className="narrow history">
      <Link href="/" className="back">← Rédiger une lettre</Link>
      <h1 className="title">Mes lettres</h1>
      <p className="muted">
        Vos lettres sont enregistrées uniquement sur cet appareil, dans votre navigateur. Elles ne sont pas envoyées sur
        nos serveurs.
      </p>

      {entries === null ? null : entries.length === 0 ? (
        <section className="card empty">
          <p>Aucune lettre pour l'instant.</p>
          <Link href="/" className="button primary">Rédiger ma première lettre</Link>
        </section>
      ) : (
        <>
          <ul className="history-list">
            {entries.map((entry) => (
              <li key={entry.id} className="card">
                <div className="history-head">
                  <div>
                    <strong>{entry.title}</strong>
                    <span className="muted small">{formatDate(entry.updatedAt)}</span>
                  </div>
                </div>
                {open === entry.id ? (
                  <pre className="history-letter">{entry.letter}</pre>
                ) : (
                  <p className="history-preview">{entry.letter.slice(0, 220)}…</p>
                )}
                <div className="actions wrap">
                  <button onClick={() => setOpen(open === entry.id ? null : entry.id)}>
                    {open === entry.id ? "Réduire" : "Lire"}
                  </button>
                  <Link href={`/?lettre=${entry.id}`} className="button">Reprendre</Link>
                  <button onClick={() => copy(entry)}>{copied === entry.id ? "Copié ✓" : "Copier"}</button>
                  <button onClick={() => download(entry)}>Télécharger</button>
                  <button className="danger" onClick={() => remove(entry.id)}>Supprimer</button>
                </div>
              </li>
            ))}
          </ul>
          <button className="link-button" onClick={removeAll}>Effacer tout l'historique</button>
        </>
      )}
    </main>
  );
}
