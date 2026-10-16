// « Combien de candidatures par jour ? » v2 (≈49 s, 30 i/s, 9:16) : même construction que Frequence (plan face caméra,
// bandeau fixe, gestes calés sur les mots, comptage) + des leviers de persuasion HONNÊTES pour ancrer MyMotiv :
// 1. autorité vraie (« un an en agence d'emploi ») et similarité vraie (« en alternance moi aussi ») = l'humain derrière ;
// 2. aversion à la perte (« des offres où ton nom n'est même pas ») ; 3. le problème vécu (« une soirée par lettre →
// copier-coller ») ; 4. une règle-ancre courte, nommée, répétée 2 fois et écrite en géant : « SOUVENT, JAMAIS PAREIL. » ;
// 5. MONTRER au lieu d'énumérer (une seule démo du vrai site : offre collée → lettre, preuve tirée du CV, 30 s*) ;
// 6. preuve réelle (Léni, avec sa mention) ; 7. pied dans la porte (1re lettre offerte, sans carte bancaire) + engagement
// public en commentaire (« combien t'en envoies cette semaine ? ») ; 8. marque présente dès la 1re image (« mm. » dans le
// bandeau) et signature sonore MyMotiv sur la fin (tools/pub_son.py → signature). Rien d'inventé : pas de fausse urgence,
// pas de faux chiffre, pas de culpabilisation. Voix : voix-frequence2.json. Son : synth_frequence2.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce } from "./apple";
import { PINK, PINK_L, easeInOut, seg } from "./common";
import voix from "./data/frequence2-voix.json";
import { makeCaption } from "./FauxDM";
import { Bandeau, Compte, Decor, Pastille, YannGestes } from "./Frequence";
import { INK, K, Mot, fit } from "./kinetic";
import { CAP_BOX } from "./pixelTT";
import { FinOfferte, Mention, X, horloge } from "./pubMotion";
import "./fonts";

export const FREQ2_DUR = voix.duration;
const { at, sc } = horloge(voix);
const HOT = new Set(["candidatures", "jour", "emploi", "alternance", "possible", "exact", "une", "deux", "trois", "quatre", "semaine", "nom",
  "soiree", "voit", "souvent", "pareil", "mymotiv", "offre", "trente", "secondes", "preuves", "cv", "onze", "sept", "entretiens", "offerte", "bio", "commentaire"]);
const Caption = makeCaption(voix, HOT, CAP_BOX, PINK);
const EMOJI = "'Noto Color Emoji'";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const pop = (t: number, a: number) => bounce(t, [[a, 0.55], [a + 0.2, 1]], 0.09, 3, 7);
const FOND_MARQUE = "radial-gradient(circle at 50% 46%, #3A2327 0%, #1E1719 38%, #0B0A0B 78%)";

// ─── les temps clés ───
const S6 = sc(6), S7 = sc(7);
const T_FIN = at(148) - 0.1;                                        // « Ta première lettre est offerte »

const POSES: [number, string][] = [
  [-1, "g2-argumenter"],                 // la question, doigt levé
  [at(12) - 0.1, "g2-affirmer"],         // « J'ai bossé un an en agence d'emploi » : main sur le cœur
  [at(28) - 0.1, "g1-expliquer"],        // « Alors la vraie réponse »
  [at(32) - 0.1, "g2-decrire"],          // « le plus possible »
  [at(39) - 0.1, "g1-debattre"],         // « Il n'y a pas de nombre exact »
  [at(50) - 0.1, "g2-argumenter"],       // on compte
  [at(57) - 0.1, "g1-narrer"],           // « du moment que tu tiens le rythme »
  [at(66) - 0.1, "g2-insister"],         // « chaque jour sans candidature… »
  [at(83) - 0.1, "g2-expliquer"],        // « Mais à la main… »
  [at(91) - 0.1, "emo-tristesse"],       // « …une soirée »
  [at(96) - 0.1, "emo-degout"],          // « on copie-colle… et ça se voit »
  [at(104) - 0.1, "g2-preciser"],        // « Ma règle » : signe OK
];
const COMPTE: [string, number][] = [["1", at(50) - 0.05], ["2", at(54) - 0.05], ["3", at(55) - 0.05], ["4", at(56) - 0.05]];

// ─── la démo : le vrai site sur téléphone (public/tuto-tel/) ───
const ZP = 0.39, PW = 1080 * ZP, PH_ = 1920 * ZP, PX = X - PW / 2, PY = 400;
const Telephone: React.FC<{ t: number }> = ({ t }) => {
  const img = t < at(120) - 0.1 ? "001-accueil" : t < at(125) - 0.1 ? "015-offre-collee" : "040-lettre";
  const preuve = at(134) - 0.1;
  return (
    <>
      <div style={{ position: "absolute", left: PX - 14, top: PY - 14, width: PW + 28, height: PH_ + 28, borderRadius: 48, background: "#1D1D1F", boxShadow: "0 40px 90px rgba(0,0,0,0.6)",
        transform: `scale(${pop(t, S6 + 0.1)}) rotate(${-1.5 + 1.5 * ease(t, S6, S6 + 0.6)}deg)`, zIndex: 10 }}>
        <div style={{ position: "absolute", left: 14, top: 14, width: PW, height: PH_, borderRadius: 36, overflow: "hidden" }}>
          <Img src={staticFile(`tuto-tel/${img}.jpg`)} style={{ width: PW, height: PH_ }} />
          {t >= preuve && img === "040-lettre" && <div style={{ position: "absolute", left: 132 * ZP, top: 800 * ZP, width: 810 * ZP, height: 150 * ZP, borderRadius: 10, border: `5px solid ${PINK}`,
            boxShadow: `0 0 24px ${PINK}`, opacity: seg(t, preuve, preuve + 0.2) }} />}
        </div>
      </div>
      {t >= at(130) - 0.1 && <div style={{ position: "absolute", left: X + 210, top: PY + 40, transform: `translate(-50%, -50%) rotate(6deg) scale(${pop(t, at(130) - 0.1)})`, padding: "10px 26px", borderRadius: 24,
        background: PINK, color: "#fff", fontFamily: `${K}, ${EMOJI}`, fontWeight: 900, fontSize: 52, zIndex: 12 }}>⏱ 30 s*</div>}
    </>
  );
};

// ─── la preuve : le témoignage réel de Léni S. ───
const Compteur: React.FC<{ t: number; a: number; n: number; label: string; color: string; y: number }> = ({ t, a, n, label, color, y }) => t < a ? null : (
  <div style={{ position: "absolute", left: X, top: y, transform: `translate(-50%, -50%) scale(${bounce(t, [[a, 0.7], [a + 0.25, 1]], 0.08)})`, display: "flex", alignItems: "baseline", gap: 24, whiteSpace: "nowrap" }}>
    <span style={{ fontFamily: K, fontWeight: 900, fontSize: 180, color, letterSpacing: -4, lineHeight: 1 }}>{Math.round(n * ease(t, a, a + 0.45))}</span>
    <span style={{ fontFamily: K, fontWeight: 800, fontSize: 60, color: "#fff" }}>{label}</span>
  </div>
);
const Leni: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ position: "absolute", left: X, top: 470, transform: `translate(-50%, -50%) scale(${pop(t, S7 + 0.05)})`, display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ width: 110, height: 110, borderRadius: 55, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>L</div>
      <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 56, color: "#fff" }}>Léni S.</div>
    </div>
    <Compteur t={t} a={at(144) - 0.3} n={11} label="candidatures" color="#fff" y={700} />
    {t >= at(146) - 0.3 && <div style={{ position: "absolute", left: X - 30, top: 800, fontFamily: K, fontWeight: 900, fontSize: 70, color: PINK_L, opacity: seg(t, at(146) - 0.3, at(146) - 0.1) }}>↓</div>}
    <Compteur t={t} a={at(146) - 0.15} n={7} label="entretiens" color={PINK} y={960} />
  </>
);

// ─── la règle-ancre, écrite en géant ───
const Regle: React.FC<{ t: number; a1: number; a2: number; y: number; petit?: boolean }> = ({ t, a1, a2, y, petit }) => (
  <>
    <Mot t={t} a={a1} text="SOUVENT," y={y} size={petit ? 74 : fit("SOUVENT,", 130)} ext={petit ? undefined : "#2A2226"} depth={petit ? 0 : 6} />
    <Mot t={t} a={a2} text="JAMAIS PAREIL." y={y + (petit ? 84 : 140)} size={petit ? 80 : fit("JAMAIS PAREIL.", 130)} color={PINK} slam ext="#3A1A1F" depth={petit ? 5 : 9} rot={-3} />
  </>
);

export const Frequence2: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const scene = t < S6 ? "face" : t < T_FIN ? "marque" : "fin";
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      {scene === "face" && (
        <>
          <Decor t={t} />
          <YannGestes t={t} poses={POSES} />
          <Bandeau badge />
          <Compte t={t} compte={COMPTE} fin={at(57) + 0.3} />
          {/* qui parle : autorité et similarité, vraies */}
          <Pastille t={t} a={at(14) - 0.1} b={at(28) - 0.1} y={560} text="💼 1 an en agence d'emploi" size={42} />
          <Pastille t={t} a={at(24) - 0.1} b={at(28) - 0.1} y={655} text="🎓 En alternance, comme toi" rose size={42} />
          {/* l'aversion à la perte */}
          <Pastille t={t} a={at(74) - 0.1} b={sc(4)} y={560} text="📭 Maison Lumen : sans toi" size={40} />
          <Pastille t={t} a={at(74) + 0.15} b={sc(4)} y={650} text="📭 Atelier Nova : sans toi" size={40} />
          <Pastille t={t} a={at(74) + 0.4} b={sc(4)} y={740} text="📭 Boréal Logistique : sans toi" size={40} />
          {/* le problème vécu */}
          <Pastille t={t} a={at(93) - 0.1} b={at(96) - 0.1} y={560} text="🌙 Une soirée par lettre" size={44} />
          <Pastille t={t} a={at(98) - 0.1} b={sc(5)} y={560} text="📋 Copié-collé = ça se voit" size={44} />
          {/* la règle-ancre */}
          {t >= sc(5) && <Regle t={t} a1={at(106) - 0.1} a2={at(108) - 0.1} y={600} />}
        </>
      )}
      {scene === "marque" && (
        <>
          <AbsoluteFill style={{ background: FOND_MARQUE }} />
          {t < S7 ? (
            <>
              <Mot t={t} a={S6 + 0.05} b={at(134) - 0.1} text="MYMOTIV" y={320} size={84} color={PINK} />
              <Pastille t={t} a={at(134) - 0.1} b={S7} y={320} text="✓ Les vraies preuves de ton CV" size={44} />
              <Telephone t={t} />
            </>
          ) : <Leni t={t} />}
        </>
      )}
      {scene === "fin" && (
        <>
          <AbsoluteFill style={{ background: FOND_MARQUE }} />
          <FinOfferte t={t} t0={T_FIN} aBio={at(153) - 0.05} dark sous="Sans carte bancaire." />
          <Pastille t={t} a={at(160) - 0.1} b={FREQ2_DUR + 1} y={1275} text="💬 Combien t'en envoies cette semaine ?" size={40} />
          <Regle t={t} a1={at(167) - 0.1} a2={at(169) - 0.1} y={340} petit />
        </>
      )}
      <Mention t={t} a={at(130) - 0.1} b={S7} text="* temps mesuré : 27 à 35 s par lettre" y={1405} color="#B8B8BD" />
      <Mention t={t} a={S7 + 0.2} b={T_FIN} text="Témoignage réel · résultats individuels non garantis" y={1405} color="#B8B8BD" />
      {t < T_FIN && <div style={{ position: "absolute", inset: 0, zIndex: 25 }}><Caption t={t} /></div>}
      <Audio src={staticFile("audio/frequence2.wav")} />
    </AbsoluteFill>
  );
};
