// « Ton CV est en papier ? » (≈10 s, 30 i/s, 9:16) : micro-pub qui tourne en boucle, sur UNE nouvelle fonction du site :
// le CV en photo. Un viseur d'appareil photo (générique, aucune interface de marque) cadre un CV papier posé sur un
// bureau → déclic, flash → la photo file dans le vrai site sur téléphone (captures public/tuto-tel/ : « Lecture de votre
// photo », CV lu ✓) → le lien de l'offre collé → l'analyse → la lettre (logo), « ⏱ 30 s* » → 1re lettre offerte, lien en bio.
// Voix : voix-photo.json (--voix yann). Son : synth_photo.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import BOXES from "../public/tuto-tel/boxes.json";
import { bounce } from "./apple";
import { PINK, easeInOut, lerp, seg } from "./common";
import voix from "./data/photo-voix.json";
import { makeCaption } from "./FauxDM";
import { INK, K, Mot, fit } from "./kinetic";
import { CAP_BOX } from "./pixelTT";
import { FinOfferte, Mention, X, horloge } from "./pubMotion";
import "./fonts";

export const PHOTO_DUR = voix.duration;
const { PH, at, sc } = horloge(voix);
const HOT = new Set(["cv", "papier", "photo", "mymotiv", "lit", "offre", "trente", "secondes", "lettre", "offerte", "bio"]);
const Caption = makeCaption(voix, HOT, CAP_BOX, PINK);
const EMOJI = "'Noto Color Emoji'";
type Box = [number, number, number, number];
const BX = BOXES as unknown as Record<string, Record<string, Box>>;
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const pop = (t: number, a: number) => bounce(t, [[a, 0.55], [a + 0.2, 1]], 0.09, 3, 7);

// ─── les temps clés ───
const T_DECLIC = at(9) - 0.05;                    // « photo » : déclic et flash
const T_SITE = T_DECLIC + 0.45;                   // la photo arrive dans le site
const T_LU = at(13) + 0.05;                       // « lit » : CV lu ✓
const T_OFFRE = sc(2), T_ANALYSE = at(18) - 0.1, T_LETTRE = at(24) - 0.1, T_FIN = sc(3);

// ─── 1. le CV papier sur le bureau, dans le viseur ───
const CVPapier: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ position: "absolute", left: X - 330, top: 600, width: 660, height: 860, borderRadius: 8, background: "linear-gradient(170deg, #FFFDF8, #EFE9DE)", boxShadow: "0 40px 80px rgba(0,0,0,0.45)",
    transform: `perspective(1600px) rotateX(14deg) rotate(${-4 + Math.sin(t * 0.8) * 0.4}deg)`, padding: "56px 54px", boxSizing: "border-box", fontFamily: "Georgia, 'DejaVu Serif', serif", color: "#2B2B2B" }}>
    <div style={{ fontSize: 50, fontWeight: 700 }}>Camille Dubois</div>
    <div style={{ fontSize: 28, color: "#7A6F66", marginTop: 6 }}>Conseillère de vente · Lyon</div>
    {["EXPÉRIENCE", "FORMATION", "COMPÉTENCES"].map((titre, k) => (
      <div key={titre} style={{ marginTop: k ? 44 : 50 }}>
        <div style={{ fontSize: 22, letterSpacing: 3, fontWeight: 700, color: "#8A5A5F", borderBottom: "2px solid #C9B8AE", paddingBottom: 6 }}>{titre}</div>
        {[0.92, 0.78, 0.86].slice(0, k === 1 ? 2 : 3).map((w, i) => <div key={i} style={{ height: 14, width: `${w * 100}%`, background: "#B9B1A8", borderRadius: 4, marginTop: 18 }} />)}
      </div>
    ))}
  </div>
);
const Viseur: React.FC<{ t: number }> = ({ t }) => {
  const mise = pop(t, 0.55), flash = t >= T_DECLIC ? 1 - seg(t, T_DECLIC, T_DECLIC + 0.3) : 0;
  const reduit = ease(t, T_DECLIC + 0.1, T_SITE);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(160deg, #7A5638 0%, #5A3D28 45%, #3B271A 100%)", overflow: "hidden" }}>
      {/* veines du bois */}
      {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ position: "absolute", left: -100, right: -100, top: 120 + i * 210, height: 3, background: "rgba(0,0,0,0.12)", transform: `rotate(${-6 + (i % 3)}deg)` }} />)}
      <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1, 0.2, reduit)}) translate(${lerp(0, -900, reduit)}px, ${lerp(0, 2600, reduit)}px)`, transformOrigin: "50% 50%" }}>
        <CVPapier t={t} />
      </div>
      {/* le viseur : grille, cadre de mise au point, déclencheur */}
      {t < T_DECLIC + 0.1 && (
        <>
          {[1, 2].map((k) => <div key={`v${k}`} style={{ position: "absolute", left: (1080 * k) / 3, top: 0, bottom: 0, width: 2, background: "rgba(255,255,255,0.28)" }} />)}
          {[1, 2].map((k) => <div key={`h${k}`} style={{ position: "absolute", top: (1920 * k) / 3, left: 0, right: 0, height: 2, background: "rgba(255,255,255,0.28)" }} />)}
          <div style={{ position: "absolute", left: X - 180, top: 860, width: 360, height: 360, transform: `scale(${lerp(1.3, 1, seg(mise, 0, 1))})`, opacity: 0.9 }}>
            {[[0, 0, "borderTop", "borderLeft"], [1, 0, "borderTop", "borderRight"], [0, 1, "borderBottom", "borderLeft"], [1, 1, "borderBottom", "borderRight"]].map(([cx, cy, b1, b2], i) => (
              <div key={i} style={{ position: "absolute", left: (cx as number) * 300, top: (cy as number) * 300, width: 60, height: 60, [b1 as string]: "6px solid #F2C46D", [b2 as string]: "6px solid #F2C46D" }} />
            ))}
          </div>
          <div style={{ position: "absolute", left: X - 70, top: 1480, width: 140, height: 140, borderRadius: 70, border: "8px solid #fff", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 100, height: 100, borderRadius: 50, background: "#fff", transform: `scale(${1 - 0.15 * Math.exp(-Math.pow((t - T_DECLIC) / 0.08, 2))})` }} />
          </div>
        </>
      )}
      {flash > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash }} />}
    </AbsoluteFill>
  );
};

// ─── 2. le vrai site sur téléphone, plein écran, avec un zoom qui suit ───
const LECTURE = [4, 5, 6, 7, 8, 9].map((n) => `00${n}-cv-lecture`);
const ANALYSE = [17, 18, 19, 20, 21, 22].map((n) => `0${n}-analyse`);
const pick = (l: string[], t: number, a: number, b: number) => l[Math.min(l.length - 1, Math.floor(seg(t, a, b) * l.length))];
function capture(t: number) {
  if (t < T_LU) return pick(LECTURE, t, T_SITE, T_LU);
  if (t < T_OFFRE) return "013-cv-lu";
  if (t < T_ANALYSE) return "015-offre-collee";
  if (t < T_LETTRE) return pick(ANALYSE, t, T_ANALYSE, T_LETTRE);
  return "040-lettre";
}
const Ecran: React.FC<{ t: number }> = ({ t }) => {
  const focus = t < T_OFFRE ? [540, 740, 1.12] : t < T_ANALYSE ? [540, 700, 1.1] : t < T_LETTRE ? [540, 1000, 1.05] : [540, 700, 1.08];
  const [fx, fy, z] = focus;
  const left = Math.max(Math.min(530 - fx * z, 0), 1080 - 1080 * z), top = Math.max(880 - fy * z, 1920 - 1920 * z);
  const entree = ease(t, T_SITE, T_SITE + 0.3);
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <div style={{ position: "absolute", left, top, width: 1080, height: 1920, transformOrigin: "0 0", transform: `scale(${z * lerp(1.15, 1, entree)})`, filter: `blur(${(1 - entree) * 10}px)` }}>
        <Img src={staticFile(`tuto-tel/${capture(t)}.jpg`)} style={{ width: 1080, height: 1920 }} />
        {t < T_OFFRE && <div style={{ position: "absolute", left: BX["004-cv-lecture"].reading[0] - 10, top: BX["004-cv-lecture"].reading[1] - 10, width: BX["004-cv-lecture"].reading[2] + 20, height: BX["004-cv-lecture"].reading[3] + 20, borderRadius: 26, border: `7px solid ${PINK}`, boxShadow: `0 0 34px ${PINK}` }} />}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, height: 830, background: "linear-gradient(180deg, rgba(11,10,11,0) 0%, rgba(11,10,11,0.82) 14%, rgba(11,10,11,0.92) 100%)" }} />
    </AbsoluteFill>
  );
};

const Pilule: React.FC<{ t: number; a: number; b: number; text: string; rose?: boolean; y?: number; size?: number }> = ({ t, a, b, text, rose, y = 400, size = 50 }) =>
  t < a || t >= b ? null : (
    <div style={{ position: "absolute", left: X, top: y, transform: `translate(-50%, -50%) scale(${pop(t, a)})`, zIndex: 20, padding: "12px 32px", borderRadius: 26, background: rose ? PINK : "#fff",
      color: rose ? "#fff" : INK, fontFamily: `${K}, Poppins, ${EMOJI}`, fontWeight: 800, fontSize: size, whiteSpace: "nowrap", boxShadow: "0 12px 34px rgba(0,0,0,0.5)" }}>{text}</div>
  );

export const PhotoCV: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      {t < T_SITE ? <Viseur t={t} /> : t < T_FIN ? <Ecran t={t} /> : <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, #3A2327 0%, #1E1719 38%, #0B0A0B 78%)" }} />}
      {t < PH[1][0] && (
        <>
          <Mot t={t} a={-0.5} text="TON CV EST" y={400} size={fit("TON CV EST", 110)} />
          <Mot t={t} a={-0.4} text="EN PAPIER ?" y={530} size={fit("EN PAPIER ?", 120)} color={PINK} slam rot={-3} />
        </>
      )}
      <Pilule t={t} a={PH[1][0] - 0.1} b={T_SITE} text="Prends-le en photo 📸" rose />
      <Pilule t={t} a={T_LU - 0.15} b={T_OFFRE} text="MyMotiv le lit ✓" />
      <Pilule t={t} a={T_OFFRE} b={T_ANALYSE} text="Tu colles l'offre" />
      <Pilule t={t} a={at(20) - 0.1} b={T_FIN} text="⏱ 30 s*" rose size={60} />
      <Mention t={t} a={at(20) - 0.1} b={PHOTO_DUR + 1} text="* temps mesuré : 27 à 35 s par lettre" y={1405} color="#B8B8BD" />
      {t >= T_FIN && <FinOfferte t={t} t0={T_FIN} aBio={at(30) - 0.05} dark sous="Même avec un CV en photo." />}
      {t >= PH[1][0] - 0.1 && <div style={{ position: "absolute", inset: 0, zIndex: 25 }}><Caption t={t} /></div>}
      <Audio src={staticFile("audio/photo.wav")} />
    </AbsoluteFill>
  );
};
