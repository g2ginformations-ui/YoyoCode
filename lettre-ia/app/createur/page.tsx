import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { PROMO } from "@/lib/promo";

export const metadata: Metadata = {
  title: `${PROMO.name} — Lettre IA`,
  description: PROMO.text[0],
};

// La photo est facultative : tant qu'elle n'est pas déposée dans public/, on affiche les initiales.
const hasPhoto = existsSync(path.join(process.cwd(), "public", PROMO.photo));

export default function Createur() {
  const initials = PROMO.name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();

  return (
    <main className="narrow">
      <Link href="/" className="back">← Retour</Link>
      <section className="card promo">
        <a href={PROMO.url} target="_blank" rel="noopener" className="promo-photo" aria-label={PROMO.cta}>
          {hasPhoto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={PROMO.photo} alt={PROMO.name} width={160} height={160} />
          ) : (
            <span className="promo-initials">{initials}</span>
          )}
        </a>
        <p className="eyebrow">{PROMO.headline}</p>
        <h1 className="title">{PROMO.name}</h1>
        {PROMO.text.map((paragraph) => (
          <p key={paragraph} className="muted">{paragraph}</p>
        ))}
        <a href={PROMO.url} target="_blank" rel="noopener" className="button primary pay">
          {PROMO.cta}
        </a>
      </section>
    </main>
  );
}
