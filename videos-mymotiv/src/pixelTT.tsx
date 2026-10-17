// Briques communes des vidéos pixel cadrées pour TikTok (BarnumTikTok, MotRougeTikTok, FauxDMTikTok, FauxDM30TikTok) :
// tout reste dans les zones sûres de src/tiktok.ts, texte pixel en gras ≥ 36 px, sous-titres de 60 px dans le tiers bas.
import React from "react";
import { clamp } from "./common";
import { GREY, INK, PIX, RED, W_ } from "./FauxDM";
import { SAFE, SAFE_CX } from "./tiktok";

export const X = SAFE_CX;                                                // axe central de la zone sûre
export const CAP_BOX: React.CSSProperties = {                            // sous-titres : tiers bas, au-dessus de la description
  left: SAFE.left, right: 1080 - SAFE.right, top: 1215, fontSize: 60, fontWeight: 800, lineHeight: 1.15,
  textShadow: "0 4px 0 rgba(0,0,0,0.85), 0 0 18px rgba(0,0,0,0.9)",
};
export const deux = (s: React.CSSProperties = {}): React.CSSProperties => ({ whiteSpace: "pre", textAlign: "center", lineHeight: 1.2, ...s });

// une ligne à puce carrée dont le texte s'écrit (« ... » et pas « … », absent de la police pixel ; « \n » pour 2 lignes)
export const Ligne: React.FC<{ t: number; a: number; text: string; red?: boolean; size?: number }> = ({ t, a, text, red, size = 40 }) => {
  if (t < a) return null;
  const n = Math.max(1, Math.floor(clamp((t - a) / 0.45) * text.length));
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 18, margin: "12px 0", whiteSpace: "pre" }}>
      <span style={{ width: size * 0.75, height: size * 0.75, marginTop: size * 0.12, background: red ? RED : W_, flex: "none" }} />
      <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: size, lineHeight: 1.15, color: red ? RED : W_ }}>{text.slice(0, n)}</span>
    </div>
  );
};
// une réplique encadrée qui s'écrit (messages, lettre)
export const Bulle: React.FC<{ t: number; a: number; text: string; red?: boolean; size?: number }> = ({ t, a, text, red, size = 40 }) => {
  if (t < a) return null;
  const n = Math.max(1, Math.floor(clamp((t - a) / 0.5) * text.length));
  return <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: size, lineHeight: 1.15, whiteSpace: "pre", color: red ? RED : W_, margin: "10px 0", border: `4px solid ${red ? RED : GREY}`, padding: "8px 14px", display: "inline-block" }}>{text.slice(0, n)}</div>;
};
export const Bouton: React.FC<{ text: string; on?: boolean; size?: number }> = ({ text, on, size = 64 }) => (
  <div style={{ padding: `${size * 0.28}px ${size * 0.68}px`, border: `6px solid ${W_}`, background: on ? W_ : "transparent", fontFamily: PIX, fontWeight: 700, fontSize: size, color: on ? INK : W_ }}>{text}</div>
);
// barre de progression en 10 paliers
export const Barre: React.FC<{ t: number; a: number; d?: number; h?: number }> = ({ t, a, d = 1, h = 18 }) => (
  <div style={{ height: h, background: "#3A2526", marginTop: 8 }}><div style={{ width: `${Math.round(clamp((t - a) / d) * 10) * 10}%`, height: h, background: RED }} /></div>
);
