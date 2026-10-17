"use client";

import { useEffect, useState } from "react";

// « Notez votre lettre ★★★★★ » juste sous la lettre (demande du propriétaire du 17/10/2026 : récolter de vrais avis).
// Un clic sur une étoile suffit ; un mot et un prénom sont facultatifs. Même règle que le formulaire d'avis de l'accueil
// (/api/avis) : réservé à qui a reçu une lettre, un avis par personne. `onSent` rafraîchit la liste des avis.
export default function NoteLettre({ onSent }: { onSent?: () => void }) {
  const [allowed, setAllowed] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    fetch("/api/avis", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { canReview?: boolean } | null) => setAllowed(Boolean(json?.canReview)))
      .catch(() => {});
  }, []);

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!rating) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/avis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, text, name }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Votre note n'a pas pu être enregistrée.");
      setThanks(true);
      onSent?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Votre note n'a pas pu être enregistrée.");
    } finally {
      setSending(false);
    }
  }

  if (thanks) return <p className="note-lettre success">Merci pour votre note ! Elle aide les autres candidats à se décider.</p>;
  if (!allowed) return null;

  return (
    <form className="note-lettre" onSubmit={send}>
      <div className="note-lettre-head">
        <strong>Notez votre lettre</strong>
        <div className="star-input" role="radiogroup" aria-label="Note de la lettre" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} étoile${n > 1 ? "s" : ""}`}
              className={(hover || rating) >= n ? "on" : ""}
              onMouseEnter={() => setHover(n)}
              onClick={() => setRating(n)}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      {rating > 0 && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Un mot pour les autres candidats (facultatif)"
            maxLength={500}
            rows={2}
          />
          <div className="note-lettre-row">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prénom et initiale (facultatif)"
              maxLength={30}
            />
            <button type="submit" className="primary" disabled={sending}>
              {sending ? "Envoi…" : "Envoyer ma note"}
            </button>
          </div>
          <p className="muted small">Votre note est publiée dans les avis de MyMotiv, sans contrepartie. Un avis par personne.</p>
        </>
      )}
      {error && <p className="error small">{error}</p>}
    </form>
  );
}
