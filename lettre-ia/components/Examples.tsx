"use client";

import { EXAMPLES, EXAMPLE_CONTEXT } from "@/lib/examples";
import { useState } from "react";

// Exemples de résultats : la même candidature rédigée aux trois longueurs, puis téléchargée dans trois styles de PDF.
export default function Examples() {
  const [current, setCurrent] = useState(EXAMPLES[1].id);
  const example = EXAMPLES.find((e) => e.id === current) ?? EXAMPLES[1];

  return (
    <details className="examples">
      <summary>
        <span>Voir des exemples de lettres</span>
        <span className="muted small">courte, standard, longue et 3 styles de PDF</span>
      </summary>
      <p className="muted small">
        Six exemples réellement générés par MyMotiv pour la même candidature : {EXAMPLE_CONTEXT.toLowerCase()}.
      </p>
      <div className="segmented examples-tabs" role="tablist" aria-label="Exemple de lettre">
        {EXAMPLES.map((e) => (
          <button
            key={e.id}
            type="button"
            role="tab"
            aria-selected={current === e.id}
            className={current === e.id ? "active" : ""}
            onClick={() => setCurrent(e.id)}
          >
            {e.kind === "pdf" && <span className={`swatch swatch-${e.id}`} aria-hidden="true" />}
            {e.label}
          </button>
        ))}
      </div>
      {example.kind === "texte" ? (
        <article className="paper" role="tabpanel">
          <p className="paper-meta">Exemple de lettre {example.label.toLowerCase()}</p>
          <div className="paper-text">{example.text}</div>
        </article>
      ) : (
        <article className="paper paper-pdf" role="tabpanel">
          <p className="paper-meta">
            PDF au style {example.label} (inclus dans les offres illimitées) ·{" "}
            <a href={example.pdf} target="_blank" rel="noopener">
              ouvrir le PDF
            </a>
          </p>
          <img
            src={example.image}
            width={1241}
            height={1754}
            alt={`Aperçu de la lettre de motivation au style ${example.label}, téléchargée en PDF depuis MyMotiv`}
          />
          <p className="paper-meta">
            Les crochets [ … ] signalent une information absente du CV : MyMotiv ne l'invente pas, vous la complétez.
          </p>
        </article>
      )}
    </details>
  );
}
