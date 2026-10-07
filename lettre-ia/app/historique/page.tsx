"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { copyText } from "@/lib/clipboard";
import { type HistoryEntry, clearHistory, deleteEntry, readHistory } from "@/lib/history";
import { downloadLetterPdf } from "@/lib/pdf";

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Historique() {
  const [entries, setEntries] = useState<HistoryEntry[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => setEntries(readHistory()), []);

  async function copy(entry: HistoryEntry) {
    setError("");
    if (!(await copyText(entry.letter))) {
      setError("Copie impossible sur ce navigateur : ouvrez la lettre avec « Lire » et sélectionnez le texte.");
      return;
    }
    setCopied(entry.id);
    setTimeout(() => setCopied(null), 1500);
  }

  async function download(entry: HistoryEntry) {
    setError("");
    setPdfBusy(entry.id);
    try {
      await downloadLetterPdf(entry.letter, { domain: "" });
    } catch (e) {
      console.error(e);
      setError("Le PDF n'a pas pu être créé. Réessayez, ou copiez la lettre.");
    } finally {
      setPdfBusy(null);
    }
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
    <main id="contenu" className="narrow history">
      <Link href="/" className="back">← Rédiger une lettre</Link>
      <h1 className="title">Mes lettres</h1>
      <p className="muted">
        Vos lettres sont enregistrées uniquement sur cet appareil, dans votre navigateur. Elles ne sont pas envoyées sur
        nos serveurs.
      </p>

      {error && <p className="error">{error}</p>}

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
                  <p className="history-preview">
                    {entry.letter.length > 220 ? `${entry.letter.slice(0, 220)}…` : entry.letter}
                  </p>
                )}
                <div className="actions wrap">
                  <button onClick={() => setOpen(open === entry.id ? null : entry.id)}>
                    {open === entry.id ? "Réduire" : "Lire"}
                  </button>
                  <Link href={`/?lettre=${entry.id}`} className="button">Reprendre</Link>
                  <button onClick={() => copy(entry)}>{copied === entry.id ? "Copié ✓" : "Copier"}</button>
                  <button onClick={() => download(entry)} disabled={pdfBusy === entry.id}>
                    {pdfBusy === entry.id ? "PDF…" : "Télécharger en PDF"}
                  </button>
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
