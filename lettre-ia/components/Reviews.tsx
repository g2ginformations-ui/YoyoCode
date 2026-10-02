"use client";

import { useEffect, useState } from "react";

type Review = { name: string; rating: number; text: string; date?: string; imported?: boolean };
type Data = { reviews: Review[]; average: number; count: number; imported: number; canReview: boolean };

const PAGE = 8;

function stars(rating: number): string {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function formatAverage(average: number): string {
  return average.toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

// Avis clients en bas de la page d'accueil. `refreshKey` change quand une lettre vient d'être reçue :
// le formulaire apparaît alors pour qui y a droit.
export default function Reviews({ refreshKey }: { refreshKey: number }) {
  const [data, setData] = useState<Data | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    fetch("/api/avis", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: Data | null) => json && setData(json))
      .catch(() => {});
  }, [refreshKey]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!rating) {
      setError("Choisissez une note de 1 à 5 étoiles.");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/avis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, text }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Votre avis n'a pas pu être enregistré.");
      setThanks(true);
      setData((d) =>
        d && {
          ...d,
          reviews: [json.review, ...d.reviews],
          count: d.count + 1,
          average: (d.average * d.count + json.review.rating) / (d.count + 1),
          canReview: false,
        },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Votre avis n'a pas pu être enregistré.");
    } finally {
      setSending(false);
    }
  }

  if (!data || data.count === 0) return null;

  return (
    <section id="avis" className="reviews" aria-labelledby="avis-titre">
      <h2 id="avis-titre">Ils ont essayé Lettre IA</h2>
      <div className="rating-banner">
        <span className="rating-stars" aria-hidden="true">{stars(data.average)}</span>
        <strong>{formatAverage(data.average)}/5</strong>
        <span>· {data.count} avis</span>
      </div>

      {data.canReview && !thanks && (
        <form className="card review-form" onSubmit={submit}>
          <h3>Votre lettre vous a aidé ? Laissez un avis</h3>
          <div className="star-input" role="radiogroup" aria-label="Note" onMouseLeave={() => setHover(0)}>
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
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Prénom et initiale (ex. : Julie M.) — facultatif"
            maxLength={30}
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Votre avis en quelques mots"
            maxLength={500}
            rows={3}
            required
          />
          {error && <p className="error small">{error}</p>}
          <button type="submit" className="primary" disabled={sending}>
            {sending ? "Envoi…" : "Publier mon avis"}
          </button>
        </form>
      )}
      {thanks && <p className="success">Merci ! Votre avis est publié.</p>}

      <ul className="review-list">
        {data.reviews.slice(0, shown).map((review, i) => (
          <li key={`${review.name}-${review.date ?? i}`} className="review">
            <div className="review-head">
              <strong>
                {review.name}
                {review.imported && <span className="review-source">Précédent site</span>}
              </strong>
              <span className="rating-stars" aria-label={`${review.rating} sur 5`}>{stars(review.rating)}</span>
            </div>
            <p>{review.text}</p>
          </li>
        ))}
      </ul>
      {shown < data.reviews.length && (
        <button type="button" className="more" onClick={() => setShown((n) => n + PAGE * 2)}>
          Voir plus d'avis ({data.reviews.length - shown})
        </button>
      )}
      <p className="muted small">
        Les avis sont déposés par des personnes ayant reçu au moins une lettre sur Lettre IA, un par personne. Ils
        sont publiés sans contrepartie ni contrôle préalable, du plus récent au plus ancien
        {data.imported > 0 ? ", suivis des avis recueillis sur notre précédent site, qui proposait le même service" : ""}.
      </p>
    </section>
  );
}
