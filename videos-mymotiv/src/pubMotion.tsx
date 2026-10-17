// Briques communes des pubs motion design avec voix (AvantApres, ZeroExcuse, VraiPrix) : temps calés sur la voix, titres
// qui tombent mot par mot (ils servent aussi de sous-titres), pastilles cochées, mention en bas, écran de fin « 1re lettre
// offerte ». Cadrage TikTok : axe x = 520, tout entre x 120 et 920, y 280 et 1440. Méthode : skill apple-motion.
import React from "react";
import { Img, staticFile } from "remotion";
import { TextDrop, bounce, go } from "./apple";
import { PINK, PINK_L, clamp, seg } from "./common";
import { SAFE_CX } from "./tiktok";
import "./fonts";

export const X = SAFE_CX;
type Voix = { duration: number; phrases: { t0: number; t1: number }[]; mots: { i: number; t0: number }[] };
export function horloge(voix: Voix) {
  const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
  const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
  return { PH, at: (i: number, d = 0.08) => Wt(i) - d, sc: (i: number) => PH[i][0] - 0.15 };
}

// une ligne de titre qui tombe mot par mot, puis s'efface en fondu à « out »
export const Ligne: React.FC<{ t: number; t0: number; text: string; out?: number; size?: number; color?: string; y: number; weight?: number }> = ({ t, t0, text, out, size = 72, color, y, weight = 800 }) =>
  t < t0 - 0.01 || (out !== undefined && t > out + 0.25) ? null : (
    <div style={{ position: "absolute", left: 120, width: 800, top: y, textAlign: "center", fontFamily: "Poppins", fontWeight: weight, fontSize: size, lineHeight: 1.1, letterSpacing: -1, color, zIndex: 10 }}>
      <TextDrop t={t} t0={t0} text={text} out={out} stagger={0.05} dur={0.32} />
    </div>
  );

// petite mention obligatoire (temps mesuré, 30 lettres max, témoignage réel…)
export const Mention: React.FC<{ t: number; a: number; b: number; text: string; color?: string; y?: number }> = ({ t, a, b, text, color = "#8E8E93", y = 1415 }) =>
  t < a || t > b ? null : (
    <div style={{ position: "absolute", left: 120, width: 800, top: y, textAlign: "center", fontFamily: "Open Sans", fontSize: 28, color, opacity: seg(t, a, a + 0.25) * (1 - seg(t, b - 0.25, b)), zIndex: 12 }}>{text}</div>
  );

// pastille cochée (✓) qui arrive de la droite avec un rebond
export const Coche: React.FC<{ t: number; a: number; text: string; y: number; dark?: boolean; size?: number; out?: number }> = ({ t, a, text, y, dark, size = 42, out }) => {
  if (t < a || (out !== undefined && t > out)) return null;
  const k = go(t, a, a + 0.35, 0, 1), o = out !== undefined ? 1 - seg(t, out - 0.2, out) : 1;
  return (
    <div style={{ position: "absolute", left: X, top: y, transform: `translate(-50%, -50%) translateX(${(1 - k) * 160}px) scale(${0.8 + 0.2 * k})`, opacity: clamp(k * 2) * o, zIndex: 10,
      display: "flex", alignItems: "center", gap: 16, padding: "12px 30px 12px 14px", borderRadius: 60, background: dark ? "#2C2C2E" : "#fff", boxShadow: dark ? "0 0 40px rgba(217,130,139,0.25)" : "0 10px 30px rgba(0,0,0,0.08)",
      fontFamily: "Poppins", fontWeight: 700, fontSize: size, color: dark ? "#F5F5F7" : "#1D1D1F", whiteSpace: "nowrap" }}>
      <span style={{ width: size * 1.3, height: size * 1.3, borderRadius: size, background: PINK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.8 }}>✓</span>
      {text}
    </div>
  );
};

// écran de fin : la pilule rose « Ta 1re lettre est offerte », le logo, « Lien en bio ↑ »
export const FinOfferte: React.FC<{ t: number; t0: number; aBio: number; dark?: boolean; sous?: string }> = ({ t, t0, aBio, dark, sous = "Sans inscription." }) => {
  if (t < t0) return null;
  const w = bounce(t, [[t0, 120], [t0 + 0.35, 800]]), h = bounce(t, [[t0, 120], [t0 + 0.35, 160]]);
  const pulse = 1 + 0.025 * Math.sin(Math.max(0, t - t0 - 0.6) * 5) * (t > t0 + 0.6 ? 1 : 0);
  return (
    <>
      <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 240, top: 520, width: 480, opacity: seg(t, t0 + 0.15, t0 + 0.4), transform: `translateY(${(1 - go(t, t0 + 0.15, t0 + 0.5, 0, 1)) * 40}px)`, zIndex: 10 }} />
      <div style={{ position: "absolute", left: X - w / 2, top: 840 - h / 2, width: w, height: h, borderRadius: h / 2, background: PINK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", fontFamily: "Poppins", fontWeight: 800, fontSize: 56, whiteSpace: "nowrap", boxShadow: "0 20px 60px rgba(217,130,139,0.45)", transform: `scale(${pulse})`, zIndex: 10 }}>
        <TextDrop t={t} t0={t0 + 0.2} text="Ta 1re lettre est offerte" from={[0, 60]} />
      </div>
      <div style={{ position: "absolute", left: 120, width: 800, top: 960, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 44, color: dark ? "#8E8E93" : "#86868B", zIndex: 10 }}>
        <TextDrop t={t} t0={t0 + 0.45} text={sous} from={[0, 30]} />
      </div>
      <div style={{ position: "absolute", left: 120, width: 800, top: 1080, textAlign: "center", fontFamily: "Poppins", fontWeight: 800, fontSize: 64, color: dark ? PINK_L : "#1D1D1F", zIndex: 10, transform: `translateY(${Math.sin(Math.max(0, t - aBio) * 6) * 6}px)` }}>
        <TextDrop t={t} t0={aBio} text="Lien en bio ↑" from={[0, 50]} />
      </div>
    </>
  );
};
