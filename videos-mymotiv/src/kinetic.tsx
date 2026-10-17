// Briques de la série « typo animée » (MotsCles, BienJoue, SansRien, AhATS) : la construction de 4 pubs de référence
// (typographie géante en deux couleurs, coupes sèches, mots barrés, titres en relief, éclat de rayons), refaite avec la DA
// MyMotiv : noir #0B0A0B, rose #D9828B / #F2B8C0, blanc, police Poppins très grasse (800 et 900, licence OFL).
// On ne reprend ni les couleurs, ni la police, ni les illustrations, ni les slogans des pubs de référence.
// Cadrage TikTok : axe x = 520, texte dans 780 px de large, entre y 280 et 1440.
import React from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { bounce, go } from "./apple";
import { PINK, PINK_L, clamp, seg } from "./common";
import CHASSE from "./data/poppins-k.json";
import { X } from "./pubMotion";

export const INK = "#0B0A0B";
export const K = "PoppinsK";
// Poppins 800 / 900 (et 900 italique) sous un nom à part, pour ne pas changer le rendu des autres vidéos.
if (typeof document !== "undefined") {
  const handle = delayRender("Poppins très grasse");
  Promise.all(([["800", "normal", "poppins-latin-800-normal"], ["900", "normal", "poppins-latin-900-normal"], ["900", "italic", "poppins-latin-900-italic"]] as const).map(([weight, style, f]) => {
    const face = new FontFace(K, `url(${staticFile(`fonts/${f}.woff2`)})`, { weight, style });
    document.fonts.add(face);
    return face.load();
  })).then(() => continueRender(handle));
}

// plans à coupes sèches : le plan actif est le dernier dont le début est passé
export type Plan = [number, (t: number) => React.ReactNode];
export const Plans: React.FC<{ t: number; plans: Plan[] }> = ({ t, plans }) => {
  let cur = plans[0];
  for (const p of plans) if (t >= p[0]) cur = p;
  return <>{cur[1](t)}</>;
};
export const Fond: React.FC<{ c: string }> = ({ c }) => <div style={{ position: "absolute", inset: 0, background: c }} />;

// taille qui tient dans 760 px pour la ligne la plus longue, d'après la chasse réelle de chaque caractère en Poppins 900
// (mesurée dans Chromium par tools/largeurs-police.mjs → src/data/poppins-k.json), lettres resserrées de 2 %
const largeur = (ligne: string, w: "800" | "900") => Array.from(ligne.toUpperCase()).reduce((s, c) => s + ((CHASSE[w] as Record<string, number>)[c] ?? 0.75) - 0.02, 0);
export const largeurPx = (text: string, size: number, poids: "800" | "900" = "900") => size * Math.max(...text.split("\n").map((l) => largeur(l, poids)));
export const fit = (text: string, max: number, w = 760, poids: "800" | "900" = "900") => Math.min(max, w / Math.max(...text.split("\n").map((l) => largeur(l, poids))));
const relief = (n: number, c: string, dx = 1, dy = 1) => Array.from({ length: n }, (_, i) => `${(i + 1) * dx}px ${(i + 1) * dy}px 0 ${c}`).join(", ");

// un mot géant qui « claque » (arrive de 1,5 à 1 avec rebond) ou « pop » (de 0,6 à 1), avec un relief optionnel
export const Mot: React.FC<{ t: number; a: number; text: string; y: number; size: number; color?: string; ext?: string; depth?: number; italic?: boolean;
  slam?: boolean; rot?: number; skew?: number; b?: number; w?: 800 | 900; lh?: number }> = ({ t, a, text, y, size, color = "#fff", ext, depth = 0, italic, slam, rot = 0, skew = 0, b, w = 900, lh = 1 }) => {
  if (t < a || (b !== undefined && t >= b)) return null;
  const s = slam ? bounce(t, [[a, 1.5], [a + 0.14, 1]], 0.12, 3, 7) : bounce(t, [[a, 0.6], [a + 0.18, 1]], 0.1, 3, 7);
  return (
    <div style={{ position: "absolute", left: X, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) skewX(${skew}deg) scale(${s})`, opacity: clamp((t - a) / 0.05),
      fontFamily: K, fontWeight: w, fontStyle: italic ? "italic" : "normal", fontSize: size, lineHeight: lh, letterSpacing: -size * 0.02, color, whiteSpace: "pre", textAlign: "center", textTransform: "uppercase",
      textShadow: ext && depth ? relief(depth, ext, 1, 1) + ", 0 20px 40px rgba(0,0,0,0.35)" : undefined, zIndex: 5 }}>{text}</div>
  );
};

// titre « chrome rose » : relief foncé derrière, dégradé métallique devant
export const Chrome: React.FC<{ t: number; a: number; text: string; y: number; size: number; b?: number }> = ({ t, a, text, y, size, b }) => {
  if (t < a || (b !== undefined && t >= b)) return null;
  const s = bounce(t, [[a, 1.6], [a + 0.15, 1]], 0.12, 3, 7);
  const base: React.CSSProperties = { position: "absolute", left: 0, top: 0, fontFamily: K, fontWeight: 900, fontSize: size, lineHeight: 1, letterSpacing: -size * 0.02, whiteSpace: "pre", textAlign: "center", width: "100%" };
  return (
    <div style={{ position: "absolute", left: X - 400, width: 800, top: y - size / 2, height: size * 1.1, transform: `scale(${s}) rotate(-3deg)`, zIndex: 5 }}>
      <div style={{ ...base, color: "#5A2A31", textShadow: relief(Math.round(size / 18), "#3A1A1F", 1, 1.2) + ", 0 30px 60px rgba(0,0,0,0.5)" }}>{text}</div>
      <div style={{ ...base, backgroundImage: `linear-gradient(180deg, #FFFFFF 0%, ${PINK_L} 38%, ${PINK} 52%, #FFE3E8 70%, #FFFFFF 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>{text}</div>
    </div>
  );
};

// trait qui barre un mot (de gauche à droite, légèrement penché)
export const Barre: React.FC<{ t: number; a: number; y: number; w: number; color?: string; h?: number }> = ({ t, a, y, w, color = PINK, h = 18 }) =>
  t < a ? null : <div style={{ position: "absolute", left: X - w / 2, top: y - h / 2, width: w, height: h, borderRadius: h / 2, background: color, transformOrigin: "0 50%", transform: `rotate(-3deg) scaleX(${go(t, a, a + 0.18, 0, 1)})`, zIndex: 6, boxShadow: `0 0 20px ${color}` }} />;

// éclat de rayons qui tourne (derrière un mot géant)
export const Rayons: React.FC<{ t: number; c1: string; c2: string; cx?: number; cy?: number }> = ({ t, c1, c2, cx = X, cy = 860 }) => (
  <div style={{ position: "absolute", left: cx - 1400, top: cy - 1400, width: 2800, height: 2800, borderRadius: "50%", background: `repeating-conic-gradient(${c1} 0deg 11.25deg, ${c2} 11.25deg 22.5deg)`, transform: `rotate(${t * 18}deg)` }} />
);

// petites étoiles qui scintillent autour d'un titre
export const Etincelles: React.FC<{ t: number; a: number; pts: [number, number, number][]; c?: string }> = ({ t, a, pts, c = "#fff" }) => (
  <>{t >= a && pts.map(([x, y, s], i) => {
    const k = Math.max(0, Math.sin((t - a) * 6 + i * 1.7));
    return <svg key={i} width={s} height={s} viewBox="-10 -10 20 20" style={{ position: "absolute", left: x - s / 2, top: y - s / 2, transform: `scale(${0.4 + 0.6 * k}) rotate(${(t - a) * 90}deg)`, zIndex: 6 }}><path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill={c} /></svg>;
  })}</>
);

// une carte « lettre » MyMotiv (papier blanc), mots-clés surlignés en rose à partir de aMarks
export const LettreCarte: React.FC<{ t: number; aMarks?: number; w?: number }> = ({ t, aMarks = 99, w = 600 }) => {
  const m = (txt: string, i: number) => {
    const k = seg(t, aMarks + i * 0.12, aMarks + i * 0.12 + 0.25);
    return <span style={{ backgroundImage: `linear-gradient(rgba(217,130,139,0.45), rgba(217,130,139,0.45))`, backgroundRepeat: "no-repeat", backgroundSize: `${k * 100}% 100%`, borderRadius: 6, padding: "0 4px", fontWeight: 700 }}>{txt}</span>;
  };
  return (
    <div style={{ width: w, borderRadius: 36, background: "#fff", color: "#1D1D1F", padding: "34px 40px", fontFamily: "Open Sans", fontSize: w * 0.05, lineHeight: 1.5, boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
      <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: w * 0.06, marginBottom: 6 }}>Maison Lumen</div>
      <div style={{ color: "#86868B", fontSize: w * 0.042, fontWeight: 600, marginBottom: 18 }}>Manager des ventes</div>
      <div>Votre boutique mise sur le {m("conseil client", 0)} et la mise en scène des produits.</div>
      <div style={{ marginTop: 12 }}>J'accompagne une équipe en {m("vente", 1)} jusqu'à ses {m("objectifs", 2)}, chaque semaine.</div>
      {[0.9, 0.7].map((x, i) => <div key={i} style={{ height: w * 0.022, width: `${x * 100}%`, background: "#E5E5EA", borderRadius: 6, marginTop: 16 }} />)}
    </div>
  );
};

// pastille de mot-clé
export const Puce: React.FC<{ t: number; a: number; text: string; dark?: boolean; size?: number }> = ({ t, a, text, dark, size = 40 }) =>
  t < a ? null : (
    <div style={{ display: "inline-block", margin: 8, padding: `${size * 0.25}px ${size * 0.6}px`, borderRadius: size, background: dark ? INK : "#fff", color: dark ? "#fff" : INK, fontFamily: K, fontWeight: 800, fontSize: size, whiteSpace: "nowrap",
      transform: `scale(${bounce(t, [[a, 0.5], [a + 0.18, 1]], 0.1, 3, 7)})`, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>{text}</div>
  );
