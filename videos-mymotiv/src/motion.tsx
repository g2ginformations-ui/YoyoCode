// Boîte à outils « Révélation » (motion design premium, fond sombre, lumière rose), en complément de src/apple.tsx.
// Méthode complète : .claude/skills/apple-motion/SKILL.md (partie 2). Exemples : src/Reveal.tsx, src/ParcoursSite.tsx.
import React from "react";
import { Img } from "remotion";
import { go } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";

// Palette sombre (fond « noir clair » et cartes un ton au-dessus)
export const DARK = { bg0: "#0B0A0B", bg1: "#1C1C1E", card: "#2C2C2E", line: "#3A3A3C", ink: "#F5F5F7", soft: "#8E8E93" };
// Fond : halo rose très sombre au centre, noir sur les bords
export const GLOW_BG = `radial-gradient(circle at 50% 46%, #3A2327 0%, #1E1719 38%, ${DARK.bg0} 78%)`;

// Courbes : sortie douce (cubique) entre deux temps
export const e3 = (k: number) => 1 - Math.pow(1 - clamp(k), 3);
export const ease = (t: number, a: number, b: number) => e3(seg(t, a, b));
// Impulsion gaussienne autour de t0 (flash, appui, éclat) : 1 au pic, ~0 à ±2·w
export const pulse = (t: number, t0: number, w = 0.12) => Math.exp(-Math.pow((t - t0) / w, 2));

// Flash de transition plein écran (blanc → rose → transparent). k = intensité (0 à 1+).
export const Flash: React.FC<{ k: number }> = ({ k }) => (k <= 0.01 ? null : (
  <div style={{ position: "absolute", inset: 0, zIndex: 50, pointerEvents: "none", background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.95 * clamp(k)}) 0%, rgba(242,184,192,${0.8 * clamp(k)}) 30%, rgba(217,130,139,${0.35 * clamp(k)}) 60%, rgba(0,0,0,0) 85%)` }} />
));

// Onde de choc : anneau qui s'agrandit et s'efface après t0
export const Shockwave: React.FC<{ t: number; t0: number; x?: number; y?: number; r?: number }> = ({ t, t0, x = 540, y = 960, r = 520 }) => {
  const k = seg(t, t0, t0 + 0.55);
  if (k <= 0 || k >= 1) return null;
  const rr = lerp(60, r, e3(k));
  return <div style={{ position: "absolute", left: x - rr, top: y - rr, width: rr * 2, height: rr * 2, borderRadius: "50%", border: `${lerp(14, 2, k)}px solid ${PINK_L}`, opacity: 1 - k, filter: "blur(2px)" }} />;
};

// Indicateur de chargement rose
export const Spinner: React.FC<{ t: number; size?: number }> = ({ t, size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40"><circle cx={20} cy={20} r={16} fill="none" stroke={DARK.line} strokeWidth={5} />
    <circle cx={20} cy={20} r={16} fill="none" stroke={PINK} strokeWidth={5} strokeLinecap="round" strokeDasharray="30 100" transform={`rotate(${t * 520} 20 20)`} /></svg>
);

// Icône d'app MyMotiv (carré arrondi rose « mm. »)
export const AppIcon: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, background: `linear-gradient(145deg, ${PINK_L}, ${PINK} 55%, #B9606B)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: size * 0.42, letterSpacing: -1, boxShadow: `0 0 ${size * 0.5}px rgba(217,130,139,0.55), inset 0 2px 0 rgba(255,255,255,0.35)` }}>mm.</div>
);

// Bulles de verre roses qui flottent (écran de fin). Positions choisies pour laisser libre la bande centrale (y 600-1300).
export const Bubbles: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => (
  <>
    {[[150, 470, 130], [930, 380, 170], [110, 1520, 200], [980, 1540, 130], [330, 1760, 60], [790, 1790, 90], [520, 240, 50], [880, 660, 40]].map(([x, y, r], i) => (
      <div key={i} style={{ position: "absolute", left: x - r, top: y - r + Math.sin(t * 1.3 + i) * 12 - (t - t0) * (10 + i * 3), width: r * 2, height: r * 2, borderRadius: "50%", border: `${Math.max(3, r / 12)}px solid rgba(242,184,192,0.55)`, background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(217,130,139,0.05) 60%, rgba(0,0,0,0))", boxShadow: "inset 0 0 30px rgba(217,130,139,0.35)", transform: `scale(${go(t, t0 + i * 0.04, t0 + 0.4 + i * 0.04, 0.6, 1)})` }} />
    ))}
  </>
);

// Pilule noire brillante (verre sombre) avec un contenu centré (logo)
export const GlossPill: React.FC<{ w?: number; h?: number; scale?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ w = 660, h = 180, scale = 1, children, style }) => (
  <div style={{ width: w, height: h, borderRadius: h / 2, background: "linear-gradient(180deg, #2A2A2D 0%, #0B0A0B 55%, #000 100%)", boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.25), 0 0 0 2px #3A3A3C", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${scale})`, ...style }}>{children}</div>
);

// Ligne d'horizon lumineuse (sous la pilule de fin)
export const Horizon: React.FC<{ k: number; y: number }> = ({ k, y }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: y, height: 4, background: `linear-gradient(90deg, rgba(217,130,139,0), ${PINK_L}, rgba(217,130,139,0))`, boxShadow: `0 0 30px ${PINK}`, transform: `scaleX(${k})` }} />
);

// Traînées de lumière : chemins SVG dessinés par un segment lumineux qui avance (k de 0 à 1)
export const LightTrails: React.FC<{ paths: string[]; k: number; len?: number; opacity?: number }> = ({ paths, k, len = 0.35, opacity = 1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity }}>
    <defs><filter id="trailGlow"><feGaussianBlur stdDeviation="8" /></filter></defs>
    {paths.map((d, i) => (
      <g key={i}>
        <path d={d} fill="none" stroke={PINK} strokeWidth={14} pathLength={1} strokeDasharray={`${len} 1`} strokeDashoffset={-k + len} filter="url(#trailGlow)" strokeLinecap="round" />
        <path d={d} fill="none" stroke="#fff" strokeWidth={5} pathLength={1} strokeDasharray={`${len} 1`} strokeDashoffset={-k + len} strokeLinecap="round" />
      </g>
    ))}
  </svg>
);

// Trait au feutre (entourer un élément) : chemin SVG qui se dessine, k de 0 à 1
export const MarkerStroke: React.FC<{ d: string; k: number; width?: number }> = ({ d, k, width = 9 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <path d={d} fill="none" stroke={PINK} strokeWidth={width} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp(k)} style={{ filter: `drop-shadow(0 0 10px ${PINK})` }} />
  </svg>
);

// « Isoler » une case d'une capture d'écran : découpe le rectangle box=[x,y,w,h] (pixels de la capture) et l'affiche
// à l'écran en (x, y) avec l'échelle sc (pixels écran par pixel de capture). Halo rose et ombre selon k (0 à 1).
export const Crop: React.FC<{ src: string; box: [number, number, number, number]; full: [number, number]; x: number; y: number; sc: number; k?: number; radius?: number; press?: number }> = ({ src, box, full, x, y, sc, k = 1, radius = 18, press = 0 }) => {
  const [bx, by, bw, bh] = box;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: bw * sc, height: bh * sc, borderRadius: radius * sc / 0.6, overflow: "hidden", transform: `scale(${1 - 0.05 * press})`, boxShadow: `0 0 0 ${3 * k}px rgba(242,184,192,${0.9 * k}), 0 30px 80px rgba(0,0,0,${0.6 * k}), 0 0 ${70 * k}px rgba(217,130,139,${0.55 * k})` }}>
      <Img src={src} style={{ position: "absolute", left: -bx * sc, top: -by * sc, width: full[0] * sc, height: full[1] * sc }} />
    </div>
  );
};

// Profondeur de champ d'une liste : flou proportionnel à la distance au plan net (focusY)
export const dofBlur = (y: number, focusY: number, sharp = 160, per = 28, max = 14) => Math.min(max, Math.max(0, Math.abs(y - focusY) - sharp) / per);
