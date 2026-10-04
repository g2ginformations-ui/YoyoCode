"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

// Bouton principal qui se remplit d'un liquide rose (la couleur du logo) pendant la génération.
// `progress` va de 0 à 100 ; le liquide n'apparaît que lorsque `filling` est vrai.
export default function LiquidButton({
  filling,
  progress,
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { filling: boolean; progress: number; children: ReactNode }) {
  const fill = Math.max(3, Math.min(100, progress));
  return (
    <button {...props} className={`primary liquid-button ${filling ? "filling" : ""} ${className}`.trim()} aria-busy={filling}>
      {filling && (
        <span className="liquid" style={{ width: `${fill}%` }} aria-hidden="true">
          <span className="liquid-wave" />
        </span>
      )}
      <span className="liquid-label">{children}</span>
      {/* Même texte, foncé, visible seulement sur la partie remplie : lisible des deux côtés du liquide. */}
      {filling && (
        <span className="liquid-label liquid-label-on" aria-hidden="true" style={{ clipPath: `inset(0 ${100 - fill}% 0 0)` }}>
          {children}
        </span>
      )}
    </button>
  );
}
