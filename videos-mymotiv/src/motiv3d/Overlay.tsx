// Couche 2D des histoires « Motiv » : sous-titres (blanc = candidat, rose = Motiv), poussières lumineuses, vignette,
// étiquette d'épisode au début.
import React from "react";
import { Voix, clamp, rnd, seg } from "./anim";
import { PINK, PINK_L } from "./Monde";
import "../fonts";

export const Subtitles: React.FC<{ t: number; v: Voix; qui: string[]; top?: number }> = ({ t, v, qui, top = 1290 }) => {
  const i = v.phrases.findIndex((p) => t >= p.t0 - 0.06 && t < p.t1 + 0.35);
  if (i < 0) return null;
  const p = v.phrases[i], o = seg(t, p.t0 - 0.06, p.t0 + 0.08) * (1 - seg(t, p.t1 + 0.2, p.t1 + 0.35));
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top, textAlign: "center", fontFamily: "Open Sans", fontWeight: 600, fontSize: 46, lineHeight: 1.3,
      color: qui[i] === "motiv" ? PINK_L : "#FFFFFF", opacity: o, textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 0 2px rgba(0,0,0,0.9)" }}>{p.text}</div>
  );
};

const DUST = (() => { const r = rnd(5); return Array.from({ length: 28 }, () => ({ x: r(), y: r(), s: 4 + r() * 20, v: 0.004 + r() * 0.012, ph: r() * 6, b: r() })); })();
export const Atmos: React.FC<{ t: number; dim?: number }> = ({ t, dim = 0 }) => (
  <>
    {DUST.map((d, i) => {
      const y = ((d.y - t * d.v) % 1 + 1) % 1, x = d.x + Math.sin(t * 0.3 + d.ph) * 0.02;
      return <div key={i} style={{ position: "absolute", left: x * 1080, top: y * 1920, width: d.s, height: d.s, borderRadius: "50%",
        background: d.b > 0.7 ? "rgba(242,184,192,0.9)" : "rgba(255,226,190,0.9)", opacity: (0.1 + 0.22 * (0.5 + 0.5 * Math.sin(t * 1.4 + d.ph))) * (d.s > 14 ? 0.6 : 1), filter: `blur(${d.s > 12 ? 4 : 1.5}px)` }} />;
    })}
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 52%, rgba(0,0,0,0.6) 100%)" }} />
    {dim > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(5,6,18,${dim})` }} />}
  </>
);

export const EpisodeTag: React.FC<{ t: number; ep: string; titre: string }> = ({ t, ep, titre }) => {
  const o = seg(t, 0.25, 0.7) * (1 - seg(t, 3.0, 3.5));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: o, transform: `translateY(${(1 - clamp(o * 1.5)) * 20}px)` }}>
      <div style={{ padding: "8px 22px", borderRadius: 30, border: `2px solid ${PINK}`, background: "rgba(11,10,11,0.6)", fontFamily: "Poppins", fontWeight: 700, fontSize: 30, letterSpacing: 4, color: PINK_L }}>MOTIV · {ep}</div>
      <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>{titre}</div>
    </div>
  );
};
