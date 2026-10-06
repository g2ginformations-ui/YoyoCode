// Boîte à outils « style Apple » (morphing de formes, rebond d'inertie, décalages, texte qui tombe), transposée d'After
// Effects vers Remotion. Méthode : voir .claude/skills/apple-motion/SKILL.md à la racine du dépôt.
import React from "react";
import { spring } from "remotion";

export const APPLE = { bg: "#F2F2F4", card: "#FFFFFF", ink: "#1D1D1F", soft: "#86868B", dark: "#1D1D1F" };

// Clés [temps (s), valeur] interpolées linéairement, puis « inertial bounce » à chaque arrivée :
// dépassement amorti proportionnel à la vitesse d'arrivée (expression AE classique : amp 0,05 · fréq 4 · amort. 8).
export type Key = [number, number];
export function bounce(t: number, keys: Key[], amp = 0.05, freq = 4, decay = 8): number {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1] = keys[i + 1];
    if (t < t1) {
      // dans un segment : linéaire, mais avec le rebond du segment précédent qui finit de s'amortir
      const lin = v0 + ((v1 - v0) * (t - t0)) / (t1 - t0);
      return lin + (i > 0 ? overshoot(t - t0, keys[i - 1], keys[i], amp, freq, decay) : 0);
    }
  }
  const n = keys.length - 1;
  return keys[n][1] + overshoot(t - keys[n][0], keys[n - 1], keys[n], amp, freq, decay);
}
function overshoot(dt: number, a: Key, b: Key, amp: number, freq: number, decay: number) {
  const v = (b[1] - a[1]) / Math.max(1e-6, b[0] - a[0]);
  return (v * amp * Math.sin(freq * dt * 2 * Math.PI)) / Math.exp(decay * dt);
}

// Raccourci : une valeur qui va de a à b entre t0 et t1, avec rebond.
export const go = (t: number, t0: number, t1: number, a: number, b: number) => bounce(t, [[t0, a], [t1, b]]);

// Plusieurs étapes d'une même valeur : [[t0, v0], [t1, v1], …] (identique à bounce, nom plus parlant pour les morphings).
export const morph = bounce;

// Trajectoire courbe (comme une poignée de Bézier dans AE) : k ∈ [0,1] → point sur la courbe a → c → b.
export function curve(k: number, a: [number, number], b: [number, number], c: [number, number]): [number, number] {
  const u = 1 - k;
  return [u * u * a[0] + 2 * u * k * c[0] + k * k * b[0], u * u * a[1] + 2 * u * k * c[1] + k * k * b[1]];
}

// Appui de bouton : 1 → 0,86 → 1 en 0,25 s autour de t0 (ressort doux).
export function press(t: number, t0: number) {
  if (t < t0 - 0.1 || t > t0 + 0.5) return 1;
  const down = Math.min(1, Math.max(0, (t - (t0 - 0.1)) / 0.1));
  const up = Math.max(0, t - t0);
  return 1 - 0.14 * down * Math.exp(-up * 9) * Math.cos(up * 14);
}

// Texte qui « tombe » (animateur de texte AE) : par mots ou par lettres, chaque unité décalée de « stagger ».
// from : décalage de départ en px (y négatif = tombe d'en haut, x positif = arrive de la droite).
export const TextDrop: React.FC<{
  t: number; t0: number; text: string; by?: "words" | "chars"; from?: [number, number]; stagger?: number; dur?: number;
  out?: number; style?: React.CSSProperties;
}> = ({ t, t0, text, by = "words", from = [0, -60], stagger = 0.05, dur = 0.35, out, style }) => {
  const units = by === "words" ? text.split(/(\s+)/) : Array.from(text);
  let n = 0;
  const fade = out !== undefined ? Math.max(0, 1 - (t - out) / 0.2) : 1;
  return (
    <span style={{ display: "inline-block", whiteSpace: "pre", ...style, opacity: fade * ((style?.opacity as number) ?? 1) }}>
      {units.map((u, i) => {
        if (/^\s+$/.test(u)) return <span key={i}>{u}</span>;
        const s0 = t0 + n++ * stagger;
        const x = go(t, s0, s0 + dur, from[0], 0), y = go(t, s0, s0 + dur, from[1], 0);
        const o = Math.min(1, Math.max(0, (t - s0) / (dur * 0.8)));
        return <span key={i} style={{ display: "inline-block", transform: `translate(${x}px, ${y}px)`, opacity: o }}>{u}</span>;
      })}
    </span>
  );
};

// Ressort « Apple » (doux, sans rebond cartoon) pour les apparitions simples.
export const soft = (t: number, t0: number, fps: number) => spring({ frame: Math.max(0, (t - t0) * fps), fps, config: { stiffness: 170, damping: 26 } });
