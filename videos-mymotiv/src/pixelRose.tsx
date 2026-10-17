// Briques du style « confession pixel rose » (styles/confession-pixel.md, d'après une vidéo de référence envoyée par le
// propriétaire le 16/10/2026) : fond gris anthracite à trame de points, icônes en PIXEL ROSE fabriquées à partir d'un émoji
// (dessiné en tout petit sur un canevas, puis recoloré en 3 roses + contour sombre : n'importe quelle idée devient une icône
// du même style), titres en haut avec le mot fort en rose, et « écrans » déformés façon vieux téléviseur (lignes, halo rose)
// pour montrer des exemples. Utilisé par Confession.
import React from "react";
import { AbsoluteFill, continueRender, delayRender } from "remotion";
import { bounce } from "./apple";
import { seg } from "./common";

const EMOJI = "'Noto Color Emoji'";
if (typeof document !== "undefined") {
  const h = delayRender("Police émoji");
  document.fonts.load(`40px ${EMOJI}`).then(() => continueRender(h)).catch(() => continueRender(h));
}
export const GRIS_FOND = "#2C2A2C";
export const ROSE_C = "#F7C3D6", ROSE_M = "#E59AB8", ROSE_F = "#A9557A", CONTOUR = "#151214";

// ─── l'émoji transformé en icône pixel rose ───
type Cell = [number, number, string];
const cache = new Map<string, Cell[]>();
function cellules(emoji: string, n: number): Cell[] {
  const key = `${emoji}|${n}`;
  const hit = cache.get(key);
  if (hit) return hit;
  if (typeof document === "undefined") return [];
  const c = document.createElement("canvas"); c.width = n; c.height = n;
  const ctx = c.getContext("2d");
  if (!ctx) return [];
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.font = `${Math.round(n * 0.84)}px ${EMOJI}`;
  ctx.fillText(emoji, n / 2, n / 2 + n * 0.05);
  const d = ctx.getImageData(0, 0, n, n).data;
  const plein: boolean[] = [], out: Cell[] = [];
  for (let i = 0; i < n * n; i++) plein.push(d[i * 4 + 3] > 120);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const i = y * n + x;
    if (plein[i]) {
      const l = (0.3 * d[i * 4] + 0.59 * d[i * 4 + 1] + 0.11 * d[i * 4 + 2]) / 255;
      out.push([x, y, l < 0.22 ? CONTOUR : l < 0.45 ? ROSE_F : l < 0.72 ? ROSE_M : ROSE_C]);
    } else if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const xx = x + dx, yy = y + dy; return xx >= 0 && yy >= 0 && xx < n && yy < n && plein[yy * n + xx]; })) {
      out.push([x, y, CONTOUR]);
    }
  }
  if (out.length) cache.set(key, out);
  return out;
}
export const PixelEmoji: React.FC<{ emoji: string; n?: number; px?: number; style?: React.CSSProperties }> = ({ emoji, n = 20, px = 13, style }) => {
  const cells = cellules(emoji, n);
  return (
    <svg width={n * px} height={n * px} shapeRendering="crispEdges" style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 0 18px rgba(229,154,184,0.35))", ...style }}>
      {cells.map(([x, y, c], i) => <rect key={i} x={x * px} y={y * px} width={px} height={px} fill={c} />)}
    </svg>
  );
};

// ─── une icône posée (apparition à rebond, léger flottement, sortie) ───
export const pop = (t: number, a: number) => bounce(t, [[a, 0.4], [a + 0.22, 1]], 0.1, 3, 7);
export const Icone: React.FC<{ t: number; a: number; b: number; emoji: string; x: number; y: number; px?: number; n?: number; rot?: number }> = ({ t, a, b, emoji, x, y, px = 13, n = 20, rot = 0 }) => {
  if (t < a || t >= b) return null;
  const s = pop(t, a) * (1 - 0.6 * seg(t, b - 0.12, b)), fl = Math.sin((t - a) * 2.4) * 6;
  return (
    <div style={{ position: "absolute", left: x - (n * px) / 2, top: y - (n * px) / 2 + fl, transform: `scale(${s}) rotate(${rot + Math.sin((t - a) * 1.7) * 2}deg)`, zIndex: 10 }}>
      <PixelEmoji emoji={emoji} n={n} px={px} />
    </div>
  );
};

// ─── le fond : gris anthracite, trame de points, vignette ───
export const FondGris: React.FC = () => (
  <AbsoluteFill style={{ background: GRIS_FOND, backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1.6px, transparent 1.8px)", backgroundSize: "26px 26px" }}>
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)" }} />
  </AbsoluteFill>
);

// ─── un titre en haut : les mots arrivent un à un, le mot fort en rose ───
export type Morceau = [string, boolean?];
export const Titre: React.FC<{ t: number; a: number; b: number; morceaux: Morceau[]; y?: number; size?: number; dur?: number }> = ({ t, a, b, morceaux, y = 400, size = 62, dur }) => {
  if (t < a || t >= b) return null;
  const mots: [string, boolean][] = [];
  morceaux.forEach(([txt, rose]) => txt.split(" ").filter(Boolean).forEach((m) => mots.push([m, !!rose])));
  const d = (dur ?? Math.min(1.4, mots.length * 0.16)) / Math.max(1, mots.length);
  return (
    <div style={{ position: "absolute", left: 110, right: 150, top: y, transform: "translateY(-50%)", textAlign: "center", fontFamily: "Poppins", fontWeight: 800, fontSize: size, lineHeight: 1.12,
      color: "#fff", textShadow: "0 4px 16px rgba(0,0,0,0.5)", zIndex: 20, opacity: 1 - seg(t, b - 0.15, b) }}>
      {mots.map(([m, rose], i) => <span key={i} style={{ opacity: t >= a + i * d ? 1 : 0, color: rose ? ROSE_M : "#fff", textTransform: rose ? "uppercase" : "none" }}>{m} </span>)}
    </div>
  );
};

// ─── « l'écran » déformé (vieux téléviseur) qui montre un exemple ───
export const Crt: React.FC<{ t: number; a: number; b: number; children: React.ReactNode; x?: number; y?: number; w?: number; h?: number }> = ({ t, a, b, children, x = 175, y = 300, w = 690, h = 1060 }) => {
  if (t < a || t >= b) return null;
  const k = seg(t, a, a + 0.25), fin = seg(t, b - 0.18, b);
  const glitch = (t - a < 0.2 || b - t < 0.15) ? Math.sin(t * 120) * 10 : 0;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: 46, overflow: "hidden", background: "#0C0A0C", zIndex: 8,
      transform: `translateX(${glitch}px) scale(${(0.9 + 0.1 * k) * (1 - 0.1 * fin)})`, opacity: k * (1 - fin),
      boxShadow: "0 0 0 3px rgba(229,154,184,0.25), 0 0 60px rgba(229,154,184,0.35), 0 40px 90px rgba(0,0,0,0.6)" }}>
      <div style={{ position: "absolute", inset: 0, filter: "contrast(1.06) saturate(1.1)" }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.13) 0px, rgba(0,0,0,0.13) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 90px 30px rgba(0,0,0,0.75), inset 6px 0 0 rgba(255,0,90,0.18), inset -6px 0 0 rgba(0,200,255,0.14)", borderRadius: 46, pointerEvents: "none" }} />
    </div>
  );
};
