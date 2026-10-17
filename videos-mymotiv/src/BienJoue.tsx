// « Bien joué » (≈17 s, 30 i/s, 9:16) — série « typo animée », d'après la construction d'une pub de référence (compliments
// en relief sur des fonds qui alternent → éclat de rayons → « fais pareil pour… » en italique → explosion du produit →
// le produit sur un éclat → une phrase en arc → logo), en DA MyMotiv et avec nos propres mots (pas ceux de la référence).
// Les mots-clés : MyMotiv relève ceux de l'offre (vraie capture du site) et écrit la lettre avec (vraie capture).
// Voix : voix-bienjoue.json (Paul K). Son : synth_bienjoue.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { go } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import voix from "./data/bienjoue-voix.json";
import { Etincelles, Fond, INK, K, LettreCarte, Mot, Plans, Rayons, fit } from "./kinetic";
import { Crop } from "./motion";
import { FinOfferte, Mention, X, horloge } from "./pubMotion";

export const BIENJOUE_DUR = voix.duration;
const { at, sc } = horloge(voix);
const LOGO_BLANC: React.CSSProperties = { filter: "brightness(0) invert(1)" };
const P = (n: string) => staticFile(`parcours/${n}.png`);

const Arc: React.FC<{ t: number; a: number; text: string; y: number; size: number; color: string }> = ({ t, a, text, y, size, color }) => {
  if (t < a) return null;
  const s = go(t, a, a + 0.25, 0.5, 1), d = clamp((t - a) / 0.5);
  return (
    <svg width={900} height={420} viewBox="0 0 900 420" style={{ position: "absolute", left: X - 450, top: y - 210, transform: `scale(${s}) rotate(${-4 + Math.sin(t * 2) * 2}deg)`, overflow: "visible", zIndex: 5 }}>
      <defs><path id="arcBJ" d="M 60 330 Q 450 30 840 330" /></defs>
      <text fontFamily={K} fontWeight={900} fontSize={size} fill={color} textAnchor="middle" letterSpacing={-2} style={{ filter: "drop-shadow(0 10px 0 #7A3540)" }}>
        <textPath href="#arcBJ" startOffset="50%">{text.slice(0, Math.max(1, Math.round(d * text.length)))}</textPath>
      </text>
    </svg>
  );
};

export const BienJoue: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <Plans t={t} plans={[
        [-1, (t) => (<>
          <Fond c={PINK} />
          <Rayons t={t} c1={PINK} c2={PINK_L} cy={880} />
          <Mot t={t} a={-0.5} text="TOI," y={880} size={300} color={INK} ext="#FFFFFF" depth={10} slam />
          <Etincelles t={t} a={0.1} pts={[[230, 620, 70], [830, 640, 56], [780, 1120, 64], [260, 1100, 50]]} c={INK} />
        </>)],
        [at(4), (t) => (<>
          <Fond c={INK} />
          <Mot t={t} a={at(4)} text={"LES BONS\nPLANS"} y={880} size={fit("LES BONS", 150)} ext={PINK} depth={10} lh={1.02} slam />
          <div style={{ position: "absolute", left: 700, top: 560, width: 150, height: 96, borderRadius: 18, background: PINK, transform: `rotate(${-14 + Math.sin(t * 9) * 8}deg) scale(${go(t, at(4) + 0.1, at(4) + 0.3, 0, 1)})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: K, fontWeight: 900, fontSize: 44, color: INK }}>
            <div style={{ position: "absolute", left: 14, width: 18, height: 18, borderRadius: 9, background: INK }} />€
          </div>
        </>)],
        [at(7), (t) => (<>
          <Fond c={PINK} />
          <Mot t={t} a={at(7)} text={"LA BONNE\nPROMO"} y={880} size={fit("LA BONNE", 150)} color={INK} ext="#FFFFFF" depth={9} lh={1.02} slam />
          <div style={{ position: "absolute", left: 200, top: 520, width: 150, height: 150, borderRadius: 75, background: INK, color: PINK_L, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: K, fontWeight: 900, fontSize: 80, transform: `rotate(${t * 140}deg) scale(${go(t, at(7) + 0.1, at(7) + 0.3, 0, 1)})` }}>%</div>
        </>)],
        [at(10), (t) => {
          const k = go(t, at(10), at(10) + 0.3, 0, 1);
          return (<>
            <Fond c={INK} />
            <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
              <path d="M 140 1220 C 300 1300, 520 1180, 640 1080 S 860 860, 900 700" fill="none" stroke={PINK} strokeWidth={26} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - seg(t, at(10) + 0.1, at(10) + 0.5)} />
            </svg>
            <div style={{ position: "absolute", left: X, top: 760, transform: `translate(-50%, -50%) translateX(${(1 - k) * -700}px) skewX(-8deg)`, fontFamily: K, fontWeight: 900, fontSize: fit("RACCOURCI", 150, 690), lineHeight: 1.02, color: "#fff", textAlign: "center", whiteSpace: "pre", textShadow: Array.from({ length: 9 }, (_, i) => `${-(i + 1)}px ${i + 1}px 0 ${PINK}`).join(", ") }}>{"LE\nRACCOURCI"}</div>
          </>);
        }],
        [sc(1), (t) => (<>
          <Fond c={INK} />
          <Rayons t={t} c1="#2A1418" c2={INK} cy={860} />
          <Mot t={t} a={at(12)} text={"BIEN\nJOUÉ !"} y={860} size={fit("JOUÉ !", 230)} ext={PINK} depth={12} lh={1.0} slam />
          <Etincelles t={t} a={at(12) + 0.1} pts={[[210, 600, 70], [850, 640, 56], [800, 1130, 64], [240, 1110, 50], [520, 520, 40]]} c={PINK_L} />
        </>)],
        [sc(2), (t) => (<>
          <Fond c={INK} />
          <Mot t={t} a={at(14)} text="FAIS PAREIL" y={660} size={fit("FAIS PAREIL", 140)} ext={PINK} depth={8} italic rot={-5} slam />
          <Mot t={t} a={at(16)} text="POUR TES" y={810} size={fit("FAIS PAREIL", 140)} ext={PINK} depth={8} italic rot={-5} slam />
          <Mot t={t} a={at(18)} text="CANDIDATURES" y={960} size={fit("CANDIDATURES", 140)} color={PINK_L} ext="#7A3540" depth={8} italic rot={-5} slam />
        </>)],
        [sc(3), (t) => {
          const k = clamp((t - sc(3)) / 0.6);
          return (<>
            <Fond c={PINK} />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const ang = (i / 6) * Math.PI * 2 + 0.4, r = lerp(0, 560, Math.sqrt(k));
              return <div key={i} style={{ position: "absolute", left: X + Math.cos(ang) * r - 150, top: 860 + Math.sin(ang) * r * 0.9 - 110, transform: `rotate(${(i - 2.5) * 22 * k}deg) scale(0.5)`, transformOrigin: "50% 50%", opacity: 1 - seg(t, sc(3) + 0.45, sc(3) + 0.6) }}><LettreCarte t={t} w={600} /></div>;
            })}
            <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 300, top: 790, width: 600, ...LOGO_BLANC, transform: `scale(${go(t, at(19), at(19) + 0.25, 1.6, 1)})`, opacity: seg(t, at(19), at(19) + 0.06) }} />
          </>);
        }],
        [at(21), (t) => (<>
          <Fond c={INK} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.5 }}><Rayons t={t} c1="#3A1A1F" c2={INK} cy={880} /></div>
          <Mot t={t} a={at(21)} text={"LES MOTS-CLÉS\nDE L'OFFRE"} y={470} size={fit("LES MOTS-CLÉS", 110)} lh={1.04} />
          <Crop src={P("034-resultat")} box={[40, 943, 1000, 258]} full={[1080, 1920]} x={X - 380} y={760} sc={0.76 * go(t, at(21) + 0.1, at(21) + 0.4, 0.6, 1)} k={1} radius={14} />
          <Mot t={t} a={at(28)} text={"CEUX QUE LE\nRECRUTEUR CHERCHE"} y={1150} size={fit("RECRUTEUR CHERCHE", 90)} color={PINK} lh={1.06} />
        </>)],
        [at(33), (t) => (<>
          <Fond c={INK} />
          <Mot t={t} a={at(33)} text={"ET ÉCRIT\nTA LETTRE AVEC"} y={430} size={fit("TA LETTRE AVEC", 100)} lh={1.04} />
          <Crop src={P("048-lettre")} box={[83, 158, 915, 1000]} full={[1080, 1920]} x={X - 300} y={620} sc={0.66 * go(t, at(33) + 0.1, at(33) + 0.4, 0.7, 1)} k={1} radius={14} />
        </>)],
        [sc(4), (t) => (<>
          <Fond c={INK} />
          <Arc t={t} a={at(38)} text="EN 30 SECONDES*" y={860} size={92} color={PINK_L} />
          <Etincelles t={t} a={at(39)} pts={[[220, 700, 50], [820, 720, 44], [520, 560, 36]]} c={PINK_L} />
          <Mention t={t} a={at(38)} b={at(41) - 0.1} text="* temps mesuré : 27 à 35 s par lettre" />
        </>)],
        [at(41) - 0.1, (t) => (<>
          <Fond c={INK} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, rgba(217,130,139,0.25) 0%, rgba(11,10,11,0) 60%)" }} />
          <FinOfferte t={t} t0={at(41) - 0.05} aBio={at(43) + 0.6} dark />
        </>)],
      ]} />
      <Audio src={staticFile("audio/bienjoue.wav")} />
    </AbsoluteFill>
  );
};
