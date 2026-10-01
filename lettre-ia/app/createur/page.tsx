import { existsSync } from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { PROMO } from "@/lib/promo";

export const metadata: Metadata = {
  title: `${PROMO.title} — ${PROMO.name}`,
  description: PROMO.text[0],
};

// L'image est facultative : tant qu'elle n'est pas déposée dans public/, on affiche les initiales.
const hasImage = existsSync(path.join(process.cwd(), "public", PROMO.image.src));

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
        <p className="eyebrow">{PROMO.headline}</p>
        <h1 className="title">{PROMO.title}</h1>
        <p className="muted">Par {PROMO.name}</p>
        <a href={PROMO.url} target="_blank" rel="noopener" className="promo-image" aria-label={PROMO.cta}>
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={PROMO.image.src} alt={PROMO.image.alt} width={PROMO.image.width} height={PROMO.image.height} />
          ) : (
            <span className="promo-initials">{initials}</span>
          )}
        </a>
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
