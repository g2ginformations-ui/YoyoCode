// « Combien de candidatures par jour ? » (≈31 s, 30 i/s, 9:16) : même construction qu'une vidéo de référence envoyée par le
// propriétaire (16/10/2026, un créateur face caméra : « combien de posts par jour ? ») — style mesuré dans
// styles/combien-par-jour.md : UN seul plan face caméra sans coupe, bandeau blanc fixe en haut avec la question, doigt levé
// sur l'accroche, comptage « une, deux, trois, quatre », signe OK sur « la régularité, c'est la clé », doigt vers la caméra
// sur « la meilleure fréquence », débit rapide sans pause, musique douce loin sous la voix. On reprend la construction et le
// rythme, jamais son image, son nom, son décor ni ses affirmations (pas de « d'après les statistiques »). Sujet : la
// fréquence de candidature, puis le lien avec MyMotiv (une lettre sur mesure en 30 s* → on tient le rythme sans
// copier-coller). Yann masqué = ses vraies photos (public/yann/), changements de geste en fondu court pour garder l'effet
// « plan continu ». Voix : voix-frequence.json (--voix yann). Son : synth_frequence.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce } from "./apple";
import { PINK, seg } from "./common";
import voix from "./data/frequence-voix.json";
import { makeCaption } from "./FauxDM";
import { INK, K } from "./kinetic";
import { CAP_BOX } from "./pixelTT";
import { FinOfferte, Mention, X, horloge } from "./pubMotion";
import "./fonts";

export const FREQ_DUR = voix.duration;
const { at } = horloge(voix);
const HOT = new Set(["candidatures", "jour", "simple", "possible", "duree", "exact", "une", "deux", "trois", "quatre", "semaine", "regularite", "cle",
  "frequence", "tenir", "copier-coller", "temps", "mymotiv", "trente", "secondes", "cv", "offerte", "bio"]);
const Caption = makeCaption(voix, HOT, CAP_BOX, PINK);
const EMOJI = "'Noto Color Emoji'";
const pop = (t: number, a: number) => bounce(t, [[a, 0.55], [a + 0.2, 1]], 0.09, 3, 7);
const T_FIN = at(108) - 0.1;                                        // « Ta première est offerte »

// ─── les gestes, calés sur les mots (comme la référence) ───
const POSES: [number, string][] = [
  [-1, "g2-argumenter"],                 // accroche : doigt levé
  [at(12) - 0.1, "g1-expliquer"],        // « La réponse est très simple »
  [at(17) - 0.1, "g2-insister"],         // « Tu dois en envoyer… »
  [at(22) - 0.1, "g2-decrire"],          // « …le plus possible » : mains ouvertes
  [at(24) - 0.1, "g1-preciser"],         // « tant que tu peux tenir dans la durée »
  [at(32) - 0.1, "g1-debattre"],         // « Il n'y a pas de nombre exact »
  [at(43) - 0.1, "g2-argumenter"],       // on compte : une, deux, trois, quatre
  [at(50) - 0.1, "g1-narrer"],           // « du moment que tu tiens le rythme chaque semaine »
  [at(59) - 0.1, "g2-preciser"],         // « La régularité, c'est la clé » : signe OK
  [at(65) - 0.1, "g1-dialoguer"],        // « la meilleure fréquence » : vers la caméra
  [at(71) - 0.1, "g1-conclure"],         // « c'est celle que tu peux tenir »
  [at(76) - 0.1, "emo-degout"],          // « sans copier-coller tes lettres » : la main qui repousse
  [at(81) - 0.1, "g2-expliquer"],        // « Une lettre sur mesure, à la main… »
  [at(88) - 0.1, "emo-tristesse"],       // « …ça prend du temps »
  [at(92) - 0.1, "emo-joie"],            // « Avec MyMotiv, c'est 30 secondes »
  [at(99) - 0.1, "g2-partager"],         // « à partir de l'offre et de ton CV »
];
const FONDU = 0.1;
const Pose: React.FC<{ pose: string; opacity: number; t: number }> = ({ pose, opacity, t }) => {
  const sx = Math.sin(t * 1.3) * 4, sy = Math.cos(t * 1.1) * 3;
  return (
    <div style={{ position: "absolute", left: X - 560, top: 600, width: 1120, height: 1380, opacity, transform: `translate(${sx}px, ${sy}px)` }}>
      <Img src={staticFile(`yann/${pose}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 100%" }} />
    </div>
  );
};
const Yann: React.FC<{ t: number }> = ({ t }) => {
  let k = 0;
  POSES.forEach(([a], i) => { if (t >= a) k = i; });
  const [a, pose] = POSES[k], f = seg(t, a, a + FONDU);
  return (
    <>
      {k > 0 && f < 1 && <Pose pose={POSES[k - 1][1]} opacity={1} t={t} />}
      <Pose pose={pose} opacity={k > 0 ? f : 1} t={t} />
    </>
  );
};

// ─── le décor : pièce sombre, étagère, bande LED rose derrière les épaules ───
const Decor: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg, #17141A 0%, #121014 45%, #0E0C0F 100%)", overflow: "hidden" }}>
    <div style={{ position: "absolute", left: -40, right: -40, top: 250, height: 14, background: "#2A2420", boxShadow: "0 6px 18px rgba(0,0,0,0.6)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1070, height: 60, background: PINK, opacity: 0.35 + 0.03 * Math.sin(t * 2), filter: "blur(40px)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1094, height: 8, background: "#FFD9DF", boxShadow: `0 0 26px 8px ${PINK}` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 1102, bottom: 0, background: "linear-gradient(180deg, #2A2226 0%, #151216 40%)" }} />
    <div style={{ position: "absolute", left: 760, top: 300, width: 380, height: 700, borderRadius: "50%", background: "rgba(217,130,139,0.10)", filter: "blur(80px)" }} />
  </AbsoluteFill>
);

// ─── le bandeau fixe (comme la référence) ───
const Bandeau: React.FC = () => (
  <div style={{ position: "absolute", left: X, top: 430, transform: "translate(-50%, -50%)", padding: "12px 26px", borderRadius: 14, background: "#fff", color: INK,
    fontFamily: "Poppins", fontWeight: 800, fontSize: 36, letterSpacing: 0.5, whiteSpace: "nowrap", boxShadow: "0 8px 24px rgba(0,0,0,0.45)", zIndex: 20 }}>COMBIEN DE CANDIDATURES PAR JOUR ?</div>
);

// ─── le comptage : 1, 2, 3, 4 à côté du doigt levé ───
const COMPTE: [string, number][] = [["1", at(43) - 0.05], ["2", at(47) - 0.05], ["3", at(48) - 0.05], ["4", at(49) - 0.05]];
const Compte: React.FC<{ t: number }> = ({ t }) => {
  if (t < COMPTE[0][1] || t >= at(50) + 0.3) return null;
  let k = 0;
  COMPTE.forEach(([, a], i) => { if (t >= a) k = i; });
  const [n, a] = COMPTE[k];
  return (
    <div style={{ position: "absolute", left: 270, top: 760, transform: `translate(-50%, -50%) scale(${pop(t, a)}) rotate(-6deg)`, fontFamily: K, fontWeight: 900, fontSize: 230, color: PINK,
      textShadow: "0 10px 0 #3A1A1F, 0 24px 40px rgba(0,0,0,0.5)", zIndex: 15 }}>{n}</div>
  );
};

const Pastille: React.FC<{ t: number; a: number; b: number; y: number; text: string; rose?: boolean; size?: number }> = ({ t, a, b, y, text, rose, size = 44 }) =>
  t < a || t >= b ? null : (
    <div style={{ position: "absolute", left: X, top: y, transform: `translate(-50%, -50%) scale(${pop(t, a)})`, padding: "12px 28px", borderRadius: 24, background: rose ? PINK : "#fff", color: rose ? "#fff" : INK,
      fontFamily: `${K}, Poppins, ${EMOJI}`, fontWeight: 800, fontSize: size, whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", zIndex: 16 }}>{text}</div>
  );

export const Frequence: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const fin = t >= T_FIN;
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      {!fin ? (
        <>
          <Decor t={t} />
          <Yann t={t} />
          <Bandeau />
          <Compte t={t} />
          <Pastille t={t} a={at(87) - 0.1} b={at(92) - 0.1} y={560} text="✍️ À la main : ça prend du temps" size={40} />
          <Pastille t={t} a={at(92) - 0.1} b={at(99) - 0.1} y={560} text="⏱ 30 s* avec MyMotiv" rose size={52} />
          <Pastille t={t} a={at(99) - 0.1} b={T_FIN} y={560} text="📄 L'offre + ton CV = ta lettre" size={42} />
          <div style={{ position: "absolute", inset: 0, zIndex: 25 }}><Caption t={t} /></div>
        </>
      ) : (
        <>
          <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, #3A2327 0%, #1E1719 38%, #0B0A0B 78%)" }} />
          <FinOfferte t={t} t0={T_FIN} aBio={at(112) - 0.05} dark sous="Sans carte bancaire." />
        </>
      )}
      <Mention t={t} a={at(92) - 0.1} b={FREQ_DUR + 1} text="* temps mesuré : 27 à 35 s par lettre" y={1405} color="#B8B8BD" />
      <Audio src={staticFile("audio/frequence.wav")} />
    </AbsoluteFill>
  );
};
