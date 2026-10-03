"use client";

import { EXAMPLES, EXAMPLE_CONTEXT } from "@/lib/examples";
import { useState } from "react";

// Exemples de résultats : la même candidature rédigée aux trois longueurs proposées.
export default function Examples() {
  const [current, setCurrent] = useState(EXAMPLES[1].id);
  const example = EXAMPLES.find((e) => e.id === current) ?? EXAMPLES[1];

  return (
    <details className="examples">
      <summary>
        <span>Voir des exemples de lettres</span>
        <span className="muted small">courte, standard, longue</span>
      </summary>
      <p className="muted small">
        Trois lettres réellement générées par Ma lettre de motiv pour la même candidature : {EXAMPLE_CONTEXT.toLowerCase()}.
      </p>
      <div className="segmented" role="tablist" aria-label="Longueur de l'exemple">
        {EXAMPLES.map((e) => (
          <button
            key={e.id}
            type="button"
            role="tab"
            aria-selected={current === e.id}
            className={current === e.id ? "active" : ""}
            onClick={() => setCurrent(e.id)}
          >
            {e.label}
          </button>
        ))}
      </div>
      <article className="paper" role="tabpanel">
        <p className="paper-meta">
          Exemple de lettre {example.label.toLowerCase()}
        </p>
        <div className="paper-text">{example.text}</div>
      </article>
    </details>
  );
}
