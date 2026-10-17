// « Ta lettre traduite en langage recruteur » (≈36 s, 30 i/s, 9:16) — format pensé pour être partagé : un traducteur
// « candidat → recruteur » (notre propre interface : carte blanche en haut, carte rose en bas, bouton d'échange qui tourne).
// La voix pub (Paul K), solennelle, lit 5 formules creuses ; Yann les « traduit » sèchement (humour, aucun chiffre).
// Les 5 formules sont exactement celles que MyMotiv interdit (lettre-ia/lib/prompts.ts) → « MyMotiv les a toutes
// interdites » est vrai. Fin : 1re lettre offerte, puis jeu en commentaire (« traduis celle-là ») ; dernière image =
// l'interface du début (boucle). Voix : voix-traduc.json. Son : synth_traduc.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce, go } from "./apple";
import { PINK, PINK_L, clamp, seg } from "./common";
import voix from "./data/traduc-voix.json";
import { Barre, INK, K } from "./kinetic";
import { X, horloge } from "./pubMotion";

export const TRADUC_DUR = voix.duration;
const { PH, at } = horloge(voix);
// [phrase lue, phrase traduite, instant où la traduction claque]
const PAIRES: [number, number, number][] = [[1, 2, at(14) - 0.05], [3, 4, PH[4][0] - 0.05], [5, 6, PH[6][0] - 0.05], [7, 8, PH[8][0] - 0.05], [9, 10, PH[10][0] - 0.05]];
const TXT = voix.phrases.map((p) => p.text);
const TRAD = ["J'ai aucun exemple.", "Pardon d'exister.", "J'ai fait un stage.", "J'ai pas lu ce que vous faites.", "J'ai envoyé la même à tout le monde."];
const FIN = PH[11][0] - 0.15, CTA = PH[12][0] - 0.15;
const LISTE = ["« Dynamique et motivé »", "« Je me permets de »", "« Fort de mon expérience »", "« Votre prestigieuse entreprise »", "« Mon profil correspond parfaitement »"];

// la phrase de la carte du haut s'écrit mot par mot pendant que la voix la lit
const Ecrit: React.FC<{ t: number; text: string; t0: number; t1: number }> = ({ t, text, t0, t1 }) => {
  const mots = text.split(" "), n = t < t0 ? mots.length : Math.max(1, Math.ceil(seg(t, t0, t1 - 0.1) * mots.length));
  return <>{mots.map((m, i) => <span key={i} style={{ opacity: i < n ? 1 : 0.12 }}>{m} </span>)}</>;
};

const Interface: React.FC<{ t: number; haut: React.ReactNode; bas: React.ReactNode; tour: number; fait: number; flash?: number }> = ({ t, haut, bas, tour, fait, flash = 0 }) => (
  <>
    <div style={{ position: "absolute", left: X, top: 335, transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: 18, fontFamily: K, fontWeight: 900, fontSize: 46, color: "#fff", whiteSpace: "nowrap" }}>
      CANDIDAT <svg width={64} height={34} viewBox="0 0 64 34"><path d="M4 17 H54 M42 5 L56 17 L42 29" fill="none" stroke={PINK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></svg> RECRUTEUR
    </div>
    <div style={{ position: "absolute", left: X, top: 405, transform: "translate(-50%, -50%)", display: "flex", gap: 14 }}>
      {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ width: i < fait ? 54 : 22, height: 14, borderRadius: 7, background: i < fait ? PINK : "#3A3A3C" }} />)}
    </div>
    <div style={{ position: "absolute", left: X - 400, top: 450, width: 800, height: 340, borderRadius: 44, background: "#fff", padding: "34px 42px", boxShadow: "0 30px 80px rgba(0,0,0,0.45)" }}>
      <div style={{ fontFamily: K, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: "#8E8E93" }}>CE QUE TU ÉCRIS</div>
      <div style={{ marginTop: 14, fontFamily: "Poppins", fontWeight: 700, fontSize: 52, lineHeight: 1.16, color: INK }}>{haut}</div>
    </div>
    <div style={{ position: "absolute", left: X - 62, top: 790, width: 124, height: 124, borderRadius: 62, background: INK, border: `8px solid ${PINK}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 3, transform: `rotate(${tour}deg)`, boxShadow: "0 0 40px rgba(217,130,139,0.6)" }}>
      <svg width={60} height={60} viewBox="0 0 24 24"><path d="M7 4 L7 18 M3 14 L7 18 L11 14 M17 20 L17 6 M13 10 L17 6 L21 10" fill="none" stroke="#fff" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
    <div style={{ position: "absolute", left: X - 400, top: 880, width: 800, height: 330, borderRadius: 44, background: `linear-gradient(150deg, ${PINK_L}, ${PINK} 60%, #B9606B)`, padding: "58px 42px 30px", boxShadow: `0 30px 80px rgba(0,0,0,0.45), 0 0 ${80 * flash}px rgba(242,184,192,${flash})` }}>
      <div style={{ fontFamily: K, fontWeight: 800, fontSize: 28, letterSpacing: 2, color: "rgba(255,255,255,0.85)" }}>CE QUE LE RECRUTEUR LIT</div>
      <div style={{ marginTop: 14 }}>{bas}</div>
    </div>
  </>
);

const Points: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ display: "flex", gap: 16, paddingTop: 20 }}>
    {[0, 1, 2].map((i) => <div key={i} style={{ width: 26, height: 26, borderRadius: 13, background: "#fff", opacity: 0.35 + 0.65 * Math.max(0, Math.sin(t * 9 - i * 0.9)) }} />)}
  </div>
);
const Claque: React.FC<{ t: number; a: number; text: string }> = ({ t, a, text }) => (
  <div style={{ fontFamily: K, fontWeight: 900, fontSize: text.length > 24 ? 56 : text.length > 18 ? 64 : 72, lineHeight: 1.08, color: "#fff", transformOrigin: "0% 50%", transform: `scale(${bounce(t, [[a, 1.35], [a + 0.14, 1]], 0.12, 3, 7)}) rotate(${-1.5}deg)`, textShadow: "0 6px 0 #8E3E49" }}>{text}</div>
);

export const Traducteur: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  let k = 0;
  PAIRES.forEach(([p], i) => { if (t >= PH[p][0] - 0.15) k = i; });
  const [p, , slam] = PAIRES[k];
  const fait = PAIRES.filter(([, , s]) => t >= s).length;
  const tour = PAIRES.reduce((r, [, , s]) => r + 180 * go(t, s - 0.35, s - 0.05, 0, 1), 0) + 180 * go(t, CTA + 0.2, CTA + 0.5, 0, 1);
  const flash = Math.exp(-Math.pow((t - slam - 0.05) / 0.15, 2));
  const shake = t > slam && t < slam + 0.18 ? Math.sin(t * 90) * 8 : 0;

  let scene: React.ReactNode;
  if (t < FIN) scene = (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${shake}px)` }}>
      <Interface t={t} tour={tour} fait={fait} flash={flash}
        haut={<>« <Ecrit t={t} text={TXT[p].replace(/[«»]/g, "").trim()} t0={PH[p][0]} t1={PH[p][1]} /> »</>}
        bas={t >= slam ? <Claque t={t} a={slam} text={TRAD[k]} /> : <Points t={t} />} />
    </div>
  );
  else if (t < CTA) {
    const ent = at(73) - 0.1, off = at(83) - 0.1, bio = at(86) - 0.1;
    scene = t < ent ? (
      <>
        {LISTE.map((q, i) => (
          <div key={i}>
            <div style={{ position: "absolute", left: X, top: 520 + i * 120, transform: "translate(-50%, -50%)", fontFamily: "Poppins", fontWeight: 700, fontSize: 38, color: "#fff", whiteSpace: "nowrap", opacity: seg(t, FIN + i * 0.06, FIN + i * 0.06 + 0.1) }}>{q}</div>
            <Barre t={t} a={at(69) + i * 0.12} y={520 + i * 120} w={Math.min(800, q.length * 21 + 20)} />
          </div>
        ))}
        {t >= at(72) - 0.1 && <div style={{ position: "absolute", left: X, top: 790, transform: `translate(-50%, -50%) rotate(-9deg) scale(${bounce(t, [[at(72) - 0.1, 1.8], [at(72) + 0.05, 1]], 0.12, 3, 7)})`, padding: "14px 36px", border: `10px solid ${PINK}`, borderRadius: 24, fontFamily: K, fontWeight: 900, fontSize: 96, color: PINK, background: "rgba(11,10,11,0.85)", whiteSpace: "nowrap" }}>INTERDITES</div>}
      </>
    ) : (
      <>
        <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 260, top: 380, width: 520, transform: `scale(${go(t, ent, ent + 0.3, 0.7, 1)})` }} />
        <div style={{ position: "absolute", left: 120, width: 800, top: 600, textAlign: "center", fontFamily: K, fontWeight: 900, fontSize: 64, lineHeight: 1.1, color: "#fff", opacity: seg(t, ent, ent + 0.15) }}>
          TA LETTRE PARLE<br />DE <span style={{ color: PINK }}>LEUR OFFRE</span>,<br />AVEC <span style={{ color: PINK }}>TES</span> PREUVES.
        </div>
        {t >= off && <div style={{ position: "absolute", left: X, top: 990, transform: `translate(-50%, -50%) scale(${go(t, off, off + 0.3, 0.6, 1)})`, padding: "18px 40px", borderRadius: 60, background: PINK, fontFamily: K, fontWeight: 900, fontSize: 56, color: "#fff", whiteSpace: "nowrap" }}>1RE LETTRE OFFERTE</div>}
        {t >= bio && <div style={{ position: "absolute", left: X, top: 1120, transform: `translate(-50%, -50%) translateY(${Math.sin((t - bio) * 6) * 6}px)`, fontFamily: K, fontWeight: 800, fontSize: 56, color: PINK_L, whiteSpace: "nowrap" }}>LIEN EN BIO ↑</div>}
      </>
    );
  } else {
    const q = TXT[12].replace(/[«»]/g, "").trim(), aT = PH[13][0] - 0.1;
    scene = (
      <>
        <Interface t={t} tour={tour} fait={5} flash={0}
          haut={<>« <Ecrit t={t} text={q} t0={PH[12][0]} t1={PH[12][1]} /> »</>}
          bas={t < aT ? <Points t={t} /> : <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: K, fontWeight: 900, fontSize: 66, color: "#fff" }}>À TOI !<span style={{ width: 10, height: 70, background: "#fff", opacity: Math.floor(t * 2.5) % 2 }} /></div>} />
        {t >= aT && <div style={{ position: "absolute", left: X, top: 1300, transform: `translate(-50%, -50%) scale(${go(t, aT + 0.3, aT + 0.6, 0.6, 1)})`, padding: "16px 36px", borderRadius: 60, background: "#fff", fontFamily: K, fontWeight: 900, fontSize: 46, lineHeight: 1.1, color: INK, whiteSpace: "pre", textAlign: "center", opacity: seg(t, aT + 0.3, aT + 0.4) }}>{"TA TRADUCTION\nEN COMMENTAIRE ↓"}</div>}
      </>
    );
  }
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, #2A1418 0%, ${INK} 62%)`, overflow: "hidden" }}>
      {scene}
      <Audio src={staticFile("audio/traduc.wav")} />
    </AbsoluteFill>
  );
};
