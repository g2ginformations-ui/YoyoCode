// « Ahhh, l'ATS ! » (≈19 s, 30 i/s, 9:16) — série « typo animée », d'après la construction d'une pub de référence (cri plein
// écran → mots géants qui s'enchaînent, une phrase qui se retourne → le produit → 3 lignes empilées sur un bloc plein →
// « sans … » → logo), en DA MyMotiv. Ce qu'on dit de l'ATS reste vrai et sans chiffre : c'est le logiciel où arrivent et se
// trient les candidatures, le recruteur peut y chercher les mots de son offre ; MyMotiv met ces mots dans la lettre, avec tes
// vraies preuves, sans rien inventer. Voix : voix-ahats.json (Paul K). Son : synth_ahats.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { go } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import voix from "./data/ahats-voix.json";
import { Chrome, Etincelles, Fond, INK, Mot, Plans, Rayons, fit } from "./kinetic";
import { FinOfferte, Mention, X, horloge } from "./pubMotion";

export const AHATS_DUR = voix.duration;
const { at, sc } = horloge(voix);
const LOGO_BLANC: React.CSSProperties = { filter: "brightness(0) invert(1)" };

// une phrase qui arrive en se retournant (rotation sur l'axe horizontal)
const Retourne: React.FC<{ t: number; a: number; children: React.ReactNode }> = ({ t, a, children }) => (
  <div style={{ position: "absolute", inset: 0, perspective: 1400 }}>
    <div style={{ position: "absolute", inset: 0, transform: `rotateX(${lerp(-110, 0, go(t, a, a + 0.3, 0, 1))}deg)`, transformOrigin: "50% 50%" }}>{children}</div>
  </div>
);

export const AhATS: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const h = 2 + Math.min(5, Math.floor(clamp(t / 1.0) * 5));
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <Plans t={t} plans={[
        [-1, (t) => (<>
          <Fond c={PINK} />
          <div style={{ position: "absolute", left: X, top: 860, transform: `translate(-50%, -50%) translate(${Math.sin(t * 61) * 6}px, ${Math.cos(t * 53) * 6}px) scale(${1 + Math.min(1, t) * 0.06})`, fontFamily: "PoppinsK", fontWeight: 900, fontSize: fit("A" + "H".repeat(h), 230, 700), color: INK, letterSpacing: -4 }}>{"A" + "H".repeat(h)}</div>
        </>)],
        [at(1) - 0.05, (t) => (<>
          <Fond c={INK} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.4 }}><Rayons t={t} c1="#2A1418" c2={INK} cy={860} /></div>
          <Chrome t={t} a={at(1) - 0.05} text="L'ATS !" y={860} size={170} />
          <Etincelles t={t} a={at(1) + 0.1} pts={[[220, 660, 56], [840, 700, 46], [780, 1060, 50]]} c={PINK_L} />
        </>)],
        [sc(1), (t) => (<>
          <Fond c={INK} />
          <Mot t={t} a={at(5)} text="LE LOGICIEL" y={600} size={fit("LE LOGICIEL", 130)} />
          <Mot t={t} a={at(7)} text="QUI TRIE" y={740} size={fit("LE LOGICIEL", 130)} color={PINK} />
          <Mot t={t} a={at(9)} text="LES CANDIDATURES" y={860} size={fit("LES CANDIDATURES", 130)} w={800} />
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = at(9) + i * 0.14, k = go(t, a, a + 0.25, 0, 1);
            return t >= a && <div key={i} style={{ position: "absolute", left: X - 55 + (i % 2 ? 1 : -1) * 190 * k, top: 1020 + Math.floor(i / 2) * 22 * k, width: 110, height: 146, borderRadius: 14, background: i % 2 ? PINK_L : "#fff", transform: `rotate(${(i % 2 ? 8 : -8) * k}deg)`, boxShadow: "0 10px 20px rgba(0,0,0,0.4)" }} />;
          })}
        </>)],
        [at(11) - 0.05, (t) => (
          <Retourne t={t} a={at(11) - 0.05}>
            <Fond c={PINK} />
            <Mot t={t} a={at(11) - 0.05} text="LE RECRUTEUR" y={600} size={fit("LE RECRUTEUR", 130)} color={INK} />
            <Mot t={t} a={at(14)} text="Y CHERCHE" y={730} size={fit("LE RECRUTEUR", 130)} color={INK} />
            <Mot t={t} a={at(16)} text={"LES MOTS\nDE SON OFFRE"} y={960} size={fit("DE SON OFFRE", 130, 700)} ext="#7A3540" depth={9} lh={1.02} slam />
          </Retourne>
        )],
        [sc(2), (t) => (<>
          <Fond c={INK} />
          <Mot t={t} a={at(20)} text="ET TA LETTRE," y={700} size={fit("ET TA LETTRE,", 120, 720)} />
          <Mot t={t} a={at(23)} text={"ELLE\nLES A ?"} y={960} size={fit("LES A ?", 200)} color={PINK} lh={1} rot={Math.sin(t * 7) * 3} slam />
        </>)],
        [at(26), (t) => (<>
          <Fond c={PINK} />
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 260, top: 420, width: 520, ...LOGO_BLANC, transform: `scale(${go(t, at(26), at(26) + 0.25, 1.6, 1)})` }} />
          <Mot t={t} a={at(29)} text="LES MOTS-CLÉS ✓" y={760} size={fit("TES VRAIES PREUVES ✓", 110)} color={INK} />
          <Mot t={t} a={at(37)} text="TES VRAIES PREUVES ✓" y={880} size={fit("TES VRAIES PREUVES ✓", 110)} color={INK} />
          <Mot t={t} a={at(40)} text="EN 30 S* ✓" y={1030} size={fit("EN 30 S* ✓", 150)} color="#fff" ext="#7A3540" depth={7} slam />
          <Mention t={t} a={at(40)} b={at(42) - 0.1} text="* temps mesuré : 27 à 35 s par lettre" color={INK} />
        </>)],
        [at(42) - 0.1, (t) => (<>
          <Fond c={INK} />
          <Mot t={t} a={at(42) - 0.1} text="SANS RIEN" y={780} size={fit("SANS RIEN", 160, 720)} slam />
          <Mot t={t} a={at(44) - 0.1} text="INVENTER" y={930} size={fit("SANS RIEN", 160, 720)} color={PINK} slam />
        </>)],
        [sc(4), (t) => (<>
          <Fond c={INK} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, rgba(217,130,139,0.25) 0%, rgba(11,10,11,0) 60%)" }} />
          <FinOfferte t={t} t0={sc(4) + 0.05} aBio={at(48)} dark />
        </>)],
      ]} />
      <Audio src={staticFile("audio/ahats.wav")} />
    </AbsoluteFill>
  );
};
