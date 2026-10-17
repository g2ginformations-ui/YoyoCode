// « C'est combien ? » (≈10 s, 30 i/s, 9:16) : adaptation d'un mème envoyé par le propriétaire le 16/10/2026 (une capture
// de messages privés : « c'est combien ? », le prix, un vocal hurlé d'excitation, puis « bloque-moi un rdv de suite !!! »).
// Chez nous : « c'est combien pour être recruté ? 😭 » → « Ça, ça s'achète pas 😅 Mais une lettre sur mesure pour chaque
// offre : 3,99 € la semaine, en illimité* » → le vocal affolé (voix « Amelie », balises d'émotion, aucune voix réelle
// copiée) → « ACTIVE-MOI ÇA DE SUITE J'AI 15 CANDIDATURES À ENVOYER !!!! » → écran de fin (offre Semaine + appel).
// Tout est visible dès la 1re image, comme dans le mème : on lit pendant que le vocal crie. Interface de messages
// DESSINÉE par nous (bulles roses MyMotiv), aucune reprise de l'interface d'une vraie appli. Prix et plafond lus dans
// lettre-ia/lib/pricing.ts (⚠️ le vocal DIT « 3,99 € » : à régénérer si le prix change). Son : synth_combien.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PLANS, WEEKLY_LIMIT } from "../../lettre-ia/lib/pricing";
import { bounce } from "./apple";
import { Bandeau, Rose } from "./bandeau";
import { PINK, seg } from "./common";
import data from "./data/combien-env.json";
import { K } from "./kinetic";
import { X } from "./pubMotion";
import "./fonts";

export const COMBIEN_DUR = data.dur;
const T_VOCAL = data.vocal, T_FIN = data.fin, DUREE_V = data.dureeVocal;
const W_ = PLANS.week;
const FOND = "#0E0C0E", GRIS = "#262225", ROSE_C = "#F2B8C0";
const pop = (t: number, a: number) => bounce(t, [[a, 0.5], [a + 0.18, 1]], 0.08, 3, 7);
const envAt = (t: number) => data.env[Math.max(0, Math.min(data.env.length - 1, Math.round(t * 30)))] ?? 0;

const Bulle: React.FC<{ gauche?: boolean; y: number; w?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ gauche, y, w = 640, children, style }) => (
  <div style={{ position: "absolute", top: y, ...(gauche ? { left: 130 } : { right: 160 }), maxWidth: w, padding: "22px 30px", boxSizing: "border-box",
    borderRadius: gauche ? "34px 34px 34px 10px" : "34px 34px 10px 34px", background: gauche ? GRIS : `linear-gradient(135deg, #E59AA6 0%, ${PINK} 60%, #C9707D 100%)`,
    color: "#fff", fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 38, lineHeight: 1.3, ...style }}>{children}</div>
);

// le vocal : lecture, onde qui avance, minuteur qui descend, la bulle tremble avec le cri
const BARRES = Array.from({ length: 34 }, (_, i) => 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6)));
const Vocal: React.FC<{ t: number }> = ({ t }) => {
  const p = seg(t, T_VOCAL, T_VOCAL + DUREE_V), joue = t >= T_VOCAL && t < T_VOCAL + DUREE_V, e = envAt(t);
  const reste = Math.ceil(DUREE_V * (1 - p));
  const sx = joue ? Math.sin(t * 70) * 7 * e : 0, sc = 1 + (joue ? 0.05 * e : 0);
  return (
    <div style={{ position: "absolute", left: 130, top: 830, width: 600, height: 120, borderRadius: "34px 34px 34px 10px", background: GRIS, display: "flex", alignItems: "center", gap: 20,
      padding: "0 26px", boxSizing: "border-box", transform: `translateX(${sx}px) scale(${sc})`, transformOrigin: "0 50%", boxShadow: joue && e > 0.5 ? `0 0 ${40 * e}px rgba(217,130,139,${0.5 * e})` : "none" }}>
      <div style={{ width: 70, height: 70, borderRadius: 35, background: PINK, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {joue ? <div style={{ display: "flex", gap: 8 }}><div style={{ width: 8, height: 28, background: "#fff", borderRadius: 2 }} /><div style={{ width: 8, height: 28, background: "#fff", borderRadius: 2 }} /></div>
          : <div style={{ width: 0, height: 0, borderTop: "16px solid transparent", borderBottom: "16px solid transparent", borderLeft: "26px solid #fff", marginLeft: 6 }} />}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 5, height: 70 }}>
        {BARRES.map((h, i) => {
          const fait = i / BARRES.length < p, vive = joue && Math.abs(i / BARRES.length - p) < 0.06;
          return <div key={i} style={{ flex: 1, height: `${Math.min(100, 100 * h * (vive ? 1 + 0.8 * e : 1))}%`, borderRadius: 3, background: fait ? "#fff" : "rgba(255,255,255,0.35)" }} />;
        })}
      </div>
      <div style={{ fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 26, color: "rgba(255,255,255,0.75)", width: 60, textAlign: "right" }}>0:{String(reste).padStart(2, "0")}</div>
    </div>
  );
};

const Conversation: React.FC<{ t: number }> = ({ t }) => {
  const e = envAt(t), joue = t >= T_VOCAL && t < T_VOCAL + DUREE_V;
  const shake = joue && e > 0.6 ? [Math.sin(t * 91) * 6 * e, Math.cos(t * 77) * 5 * e] : [0, 0];
  return (
    <AbsoluteFill style={{ background: FOND, transform: `translate(${shake[0]}px, ${shake[1]}px)` }}>
      {/* l'en-tête (décor, hors zone sûre) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 120, height: 130, display: "flex", alignItems: "center", gap: 22, padding: "0 50px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ fontFamily: "Poppins", fontSize: 64, color: "#fff", marginTop: -8 }}>‹</div>
        <div style={{ width: 76, height: 76, borderRadius: 38, background: "#5A4C52", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 36, color: "#fff" }}>I</div>
        <div>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 34, color: "#fff" }}>Inès</div>
          <div style={{ fontFamily: "'Open Sans'", fontSize: 24, color: "#9A9396" }}><span style={{ color: "#4CD07D" }}>●</span> en ligne</div>
        </div>
      </div>
      <Bulle gauche y={385}>Coucou, c'est combien pour être recruté ? 😭</Bulle>
      <Bulle y={545} w={680}>Ça, ça s'achète pas 😅<br />Mais une lettre sur mesure pour chaque offre : <b>{W_.price} la semaine</b>, en illimité* ✨</Bulle>
      <div style={{ position: "absolute", right: 165, top: 792, fontFamily: "'Open Sans'", fontSize: 22, color: "#9A9396" }}>* jusqu'à {WEEKLY_LIMIT} lettres par semaine</div>
      <Vocal t={t} />
      <Bulle gauche y={985} w={700} style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 40, lineHeight: 1.25 }}>ACTIVE-MOI ÇA DE SUITE J'AI 15 CANDIDATURES À ENVOYER !!!!</Bulle>
      {/* la barre de saisie (décor) */}
      <div style={{ position: "absolute", left: 130, width: 790, top: 1330, height: 86, borderRadius: 43, border: "2px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center",
        padding: "0 34px", boxSizing: "border-box", fontFamily: "'Open Sans'", fontSize: 30, color: "#77706F" }}>Écris un message...</div>
    </AbsoluteFill>
  );
};

const Fin: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, T_FIN, T_FIN + 0.25);
  return (
    <AbsoluteFill style={{ background: `rgba(11,10,11,${0.92 * k})` }}>
      <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 260, top: 520, width: 520, opacity: seg(t, T_FIN + 0.2, T_FIN + 0.45), transform: `scale(${pop(t, T_FIN + 0.2)})` }} />
      <div style={{ position: "absolute", left: 120, width: 800, top: 720, textAlign: "center", opacity: seg(t, T_FIN + 0.45, T_FIN + 0.7) }}>
        <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 52, color: "#fff" }}>{W_.name} <span style={{ fontFamily: K, fontWeight: 900, color: ROSE_C }}>{W_.price}</span> · en illimité*</div>
        <div style={{ fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 26, color: "#9A9396", marginTop: 10 }}>* jusqu'à {WEEKLY_LIMIT} lettres par semaine · ta 1re lettre est offerte</div>
      </div>
      {t >= T_FIN + 0.75 && (
        <div style={{ position: "absolute", left: X, top: 960, transform: `translate(-50%, -50%) scale(${pop(t, T_FIN + 0.75)})`, padding: "16px 34px", borderRadius: 44, border: `3px solid ${ROSE_C}`,
          background: "rgba(217,130,139,0.12)", fontFamily: "Poppins", fontWeight: 700, fontSize: 34, color: "#fff", whiteSpace: "nowrap" }}>
          💬 Commente <Rose>« LETTRE »</Rose> → je t'envoie le lien</div>
      )}
    </AbsoluteFill>
  );
};

export const CestCombien: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  return (
    <AbsoluteFill style={{ background: FOND, overflow: "hidden" }}>
      <Conversation t={t} />
      {t >= T_FIN && <Fin t={t} />}
      <Bandeau t={t} a={0.0} fin={T_FIN} size={30}>💬 Commente <Rose>« LETTRE »</Rose> → je t'envoie le lien</Bandeau>
      <Audio src={staticFile("audio/combien.wav")} />
    </AbsoluteFill>
  );
};
