// « Sans… » (≈13 s, 30 i/s, 9:16) — série « typo animée », d'après la construction d'une pub de référence (« SANS » fixe, les
// mots barrés un par un, le logo, un bloc plein qui empile 3 lignes, une phrase en deux couleurs, logo), en DA MyMotiv.
// Sans page blanche, sans copier-coller, sans formules creuses, sans oublier les mots-clés de l'offre (ATS) → MyMotiv :
// 1 offre, 1 lettre, 30 s* → la 1re est offerte. Voix : voix-sans.json (Paul K). Son : synth_sans.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, go } from "./apple";
import { PINK, PINK_L, seg } from "./common";
import voix from "./data/sans-voix.json";
import { Barre, Fond, INK, Mot, Plans, fit, largeurPx } from "./kinetic";
import { Mention, X, horloge } from "./pubMotion";

export const SANS_DUR = voix.duration;
const { at, sc } = horloge(voix);
// les mots barrés : [texte, apparition, trait]
const MOTS: [string, number, number][] = [
  ["PAGE\nBLANCHE", at(1), at(2) + 0.25],
  ["COPIER-\nCOLLER", at(4), at(5) + 0.25],
  ["FORMULES\nCREUSES", at(7), at(8) + 0.25],
  ["OUBLIER LES\nMOTS-CLÉS", at(10), at(13) + 0.2],
];
const TAILLE = Math.min(...MOTS.map(([m]) => fit(m, 170)));

export const SansRien: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const sans = [at(0), at(3), at(6), at(9)];
  const pouls = Math.max(...sans.map((a) => (t >= a && t < a + 0.2 ? 1 - (t - a) / 0.2 : 0)));
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <Plans t={t} plans={[
        [-1, (t) => {
          const i = MOTS.reduce((k, m, j) => (t >= m[1] ? j : k), -1);
          return (<>
            <Fond c={INK} />
            <div style={{ position: "absolute", left: X, top: 560, transform: `translate(-50%, -50%) scale(${1 + 0.12 * pouls})`, fontFamily: "PoppinsK", fontWeight: 900, fontSize: 150, color: PINK, letterSpacing: -3 }}>SANS</div>
            {i >= 0 && (() => {
              const [m, a, b] = MOTS[i], l = m.split("\n");
              return (<>
                <Mot key={i} t={t} a={a} text={m} y={830} size={TAILLE} lh={1} />
                {l.map((ln, j) => <Barre key={j} t={t} a={b + j * 0.08} y={830 + (j - (l.length - 1) / 2) * TAILLE + TAILLE * 0.05} w={Math.min(760, largeurPx(ln, TAILLE) + 10)} />)}
              </>);
            })()}
            {t >= at(10) && <div style={{ position: "absolute", left: X, top: 1080, transform: `translate(-50%, -50%) scale(${go(t, at(13), at(13) + 0.25, 0, 1)})`, padding: "10px 28px", borderRadius: 40, background: PINK_L, color: INK, fontFamily: "PoppinsK", fontWeight: 800, fontSize: 40, whiteSpace: "nowrap" }}>ceux qu'on cherche dans l'ATS</div>}
          </>);
        }],
        [sc(1), (t) => (<>
          <Fond c={INK} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 46%, rgba(217,130,139,0.35) 0%, rgba(11,10,11,0) 55%)" }} />
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 340, top: 780, width: 680, transform: `scale(${go(t, at(17), at(17) + 0.25, 1.6, 1)})`, opacity: seg(t, at(17), at(17) + 0.06) }} />
        </>)],
        [at(19), (t) => (<>
          <Fond c={PINK} />
          <Mot t={t} a={at(19)} text="1 OFFRE" y={660} size={fit("1 LETTRE", 150)} color={INK} slam />
          <Mot t={t} a={at(21)} text="1 LETTRE" y={820} size={fit("1 LETTRE", 150)} color={INK} slam />
          <Mot t={t} a={at(23)} text="30 S*" y={980} size={fit("1 LETTRE", 150)} color="#fff" ext="#7A3540" depth={8} slam />
          <Mention t={t} a={at(23)} b={sc(2)} text="* temps mesuré : 27 à 35 s par lettre" color={INK} />
        </>)],
        [sc(2), (t) => (<>
          <Fond c={INK} />
          <Mot t={t} a={at(26)} text="LA 1RE" y={780} size={fit("OFFERTE.", 170)} />
          <Mot t={t} a={at(28)} text={"EST\nOFFERTE."} y={1000} size={fit("OFFERTE.", 170)} color={PINK} lh={1} />
        </>)],
        [at(30) - 0.1, (t) => (<>
          <Fond c={INK} />
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 260, top: 720, width: 520, transform: `scale(${go(t, at(30) - 0.1, at(30) + 0.2, 0.7, 1)})` }} />
          <div style={{ position: "absolute", left: 120, width: 800, top: 940, textAlign: "center", fontFamily: "PoppinsK", fontWeight: 800, fontSize: 64, color: PINK_L }}><TextDrop t={t} t0={at(30)} text="Lien en bio ↑" from={[0, 40]} /></div>
        </>)],
      ]} />
      <Audio src={staticFile("audio/sans.wav")} />
    </AbsoluteFill>
  );
};
