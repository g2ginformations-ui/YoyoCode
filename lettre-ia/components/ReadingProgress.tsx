"use client";

import { useEffect, useState } from "react";

// Animation pendant la lecture d'un document (CV, offre) : retour d'un client qui n'avait pas vu que son fichier
// était en cours de lecture. Une page qui se fait « scanner », une barre qui avance et des étapes qui défilent.
// La barre est une estimation (la lecture d'une photo par l'IA prend quelques secondes de plus qu'un PDF) :
// elle ralentit en approchant de la fin et ne se remplit qu'à la réponse.
const STEPS = ["Ouverture du fichier…", "Lecture du texte…", "Repérage de vos expériences…", "Mise en forme…", "Presque fini…"];

export default function ReadingProgress({ fileName, photo = false }: { fileName?: string; photo?: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => setElapsed((Date.now() - start) / 1000), 120);
    return () => clearInterval(timer);
  }, []);
  const expected = photo ? 9 : 2.5;
  const percent = Math.round(95 * (1 - Math.exp(-elapsed / (expected / 2))));
  const step = STEPS[Math.min(STEPS.length - 1, Math.floor((elapsed / expected) * (STEPS.length - 1)))];

  return (
    <div className="reading" role="status" aria-live="polite">
      <div className="reading-doc" aria-hidden="true">
        {[90, 70, 84, 60, 76].map((w, i) => <i key={i} style={{ width: `${w}%` }} />)}
        <span className="reading-beam" />
      </div>
      <div className="reading-text">
        <strong>{photo ? "Lecture de votre photo" : "Lecture de votre document"}{fileName ? ` · ${fileName}` : ""}</strong>
        <span>{step}</span>
        <div className="reading-bar"><b style={{ width: `${percent}%` }} /></div>
      </div>
    </div>
  );
}
