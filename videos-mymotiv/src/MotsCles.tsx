// « Les mots de l'offre » (≈13 s, 30 i/s, 9:16) — série « typo animée », d'après la construction d'une pub de référence
// (illustration → titre chrome en relief → le produit qui tourne → l'avantage en relief dans un bloc → logo), en DA MyMotiv.
// Sujet : l'ATS, dit honnêtement. Les candidatures arrivent dans un logiciel (ATS) ; le recruteur peut y chercher les mots
// de son offre ; MyMotiv les reprend dans la lettre, sans rien inventer (lettre-ia/lib/prompts.ts). Aucun chiffre, aucune
// promesse de « passer l'ATS ». Voix : voix-motscles.json (Paul K). Son : synth_motscles.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, go } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import voix from "./data/motscles-voix.json";
import { Chrome, Etincelles, Fond, INK, K, LettreCarte, Mot, Plans, Puce, Rayons, fit } from "./kinetic";
import { FinOfferte, X, horloge } from "./pubMotion";

export const MOTSCLES_DUR = voix.duration;
const { at, sc } = horloge(voix);

// la « machine » : des lettres tombent dans un logiciel
const Machine: React.FC<{ t: number }> = ({ t }) => (
  <>
    {Array.from({ length: 9 }, (_, i) => {
      const p = ((t * 0.9 + i / 9) % 1), x = X + ((i * 97) % 5 - 2) * 70, y = lerp(600, 930, p);
      return <div key={i} style={{ position: "absolute", left: x - 45, top: y - 60, width: 90, height: 120, borderRadius: 12, background: i % 3 ? "#fff" : PINK_L, transform: `rotate(${(i % 2 ? 1 : -1) * (10 + i * 3)}deg)`, opacity: 1 - seg(p, 0.85, 1), boxShadow: "0 10px 20px rgba(0,0,0,0.4)" }}>
        {[0.7, 0.5, 0.6].map((w, j) => <div key={j} style={{ margin: "16px 12px 0", height: 8, width: `${w * 100}%`, borderRadius: 4, background: "#D9D3D5" }} />)}
      </div>;
    })}
    <div style={{ position: "absolute", left: X - 280, top: 930, width: 560, height: 340, borderRadius: 48, background: PINK, boxShadow: "0 0 80px rgba(217,130,139,0.5), inset 0 -16px 0 #B9606B", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", top: -14, left: 120, width: 320, height: 28, borderRadius: 14, background: INK }} />
      <div style={{ width: 420, height: 170, borderRadius: 24, background: INK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: K, fontWeight: 900, fontSize: 64, color: PINK_L }}>
        {t >= at(5) ? <TextDrop t={t} t0={at(5)} text="LOGICIEL" by="chars" stagger={0.03} dur={0.12} from={[0, 20]} /> : <span style={{ opacity: Math.floor(t * 4) % 2 }}>_</span>}
      </div>
    </div>
  </>
);

export const MotsCles: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const cherche = "vente  conseil client  objectifs";
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <Plans t={t} plans={[
        [-1, (t) => (<>
          <Fond c={INK} />
          <Machine t={t} />
          <Mot t={t} a={-0.5} text={"TES\nCANDIDATURES"} y={400} size={fit("CANDIDATURES", 96, 720)} />
        </>)],
        [at(7) - 0.05, (t) => (<>
          <Fond c={INK} />
          <div style={{ position: "absolute", inset: 0, opacity: 0.35 }}><Rayons t={t} c1="#2A1418" c2={INK} cy={760} /></div>
          <Chrome t={t} a={at(7) - 0.05} text="ATS" y={760} size={380} />
          <Etincelles t={t} a={at(7) + 0.1} pts={[[230, 560, 60], [830, 600, 46], [760, 980, 54], [280, 960, 40]]} c={PINK_L} />
          <Mot t={t} a={at(7) + 0.35} text={"LOGICIEL DE SUIVI\nDES CANDIDATURES"} y={1090} size={46} color={PINK_L} w={800} lh={1.15} />
        </>)],
        [sc(1), (t) => (<>
          <Fond c={INK} />
          <Mot t={t} a={sc(1)} text="LE RECRUTEUR" y={380} size={fit("LE RECRUTEUR", 92)} />
          <Mot t={t} a={at(11)} text="Y CHERCHE" y={480} size={fit("LE RECRUTEUR", 92)} />
          <Mot t={t} a={at(13)} text={"LES MOTS\nDE SON OFFRE"} y={1170} size={fit("DE SON OFFRE", 96)} color={PINK} lh={1.02} />
          <div style={{ position: "absolute", left: X - 380, top: 640, width: 760, height: 130, borderRadius: 65, background: "#fff", display: "flex", alignItems: "center", gap: 22, padding: "0 36px",
            transform: `scale(${go(t, sc(1) + 0.15, sc(1) + 0.45, 0.6, 1)})`, opacity: seg(t, sc(1) + 0.15, sc(1) + 0.3), boxShadow: "0 0 60px rgba(217,130,139,0.45)", overflow: "hidden" }}>
            <svg width={56} height={56} viewBox="0 0 24 24"><circle cx={10} cy={10} r={7} fill="none" stroke={INK} strokeWidth={3} /><path d="M15 15 L21 21" stroke={INK} strokeWidth={3} strokeLinecap="round" /></svg>
            <div style={{ fontFamily: "Open Sans", fontWeight: 600, fontSize: 38, color: INK, whiteSpace: "pre" }}>{cherche.slice(0, Math.floor(seg(t, at(11), at(16)) * cherche.length))}<span style={{ opacity: Math.floor(t * 3) % 2 }}>|</span></div>
          </div>
          <div style={{ position: "absolute", left: 120, width: 800, top: 820, textAlign: "center" }}>
            <Puce t={t} a={at(13)} text="vente" /><Puce t={t} a={at(13) + 0.15} text="conseil client" /><Puce t={t} a={at(13) + 0.3} text="objectifs" />
          </div>
        </>)],
        [sc(2), (t) => {
          const k = go(t, sc(2), sc(2) + 0.5, 0, 1);
          return (<>
            <Fond c={INK} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 55%, rgba(217,130,139,0.35) 0%, rgba(11,10,11,0) 60%)" }} />
            <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 230, top: 300, width: 460, transform: `scale(${go(t, at(17), at(17) + 0.3, 0.6, 1)})`, opacity: seg(t, at(17), at(17) + 0.1) }} />
            <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
              <div style={{ position: "absolute", left: X - 320, top: 560, transform: `rotateY(${lerp(200, 0, k) + Math.sin(t * 1.2) * 6}deg) rotateX(${8 + Math.cos(t) * 3}deg) scale(${lerp(0.5, 1, clamp(k))})` }}>
                <LettreCarte t={t} aMarks={at(20)} w={640} />
              </div>
            </div>
            <Mot t={t} a={at(20)} text="DANS TA LETTRE" y={1290} size={fit("DANS TA LETTRE", 84)} color={PINK_L} />
          </>);
        }],
        [at(24) - 0.05, (t) => (<>
          <Fond c={INK} />
          <div style={{ position: "absolute", inset: 0, perspective: 1400 }}>
            <div style={{ position: "absolute", left: X - 380, top: 600, width: 760, height: 460, borderRadius: 56, background: `linear-gradient(160deg, ${PINK_L}, ${PINK} 60%, #B9606B)`, boxShadow: "0 40px 90px rgba(0,0,0,0.6), inset 0 -18px 0 rgba(0,0,0,0.18)",
              transform: `rotateY(${Math.sin(t * 1.5) * 8}deg) rotateX(${6 + Math.cos(t * 1.2) * 4}deg) scale(${go(t, at(24) - 0.05, at(24) + 0.25, 0.5, 1)})` }} />
          </div>
          <Mot t={t} a={at(24)} text={"SANS RIEN\nINVENTER"} y={830} size={112} ext="#7A3540" depth={9} lh={1.02} slam />
          <div style={{ position: "absolute", left: 120, width: 800, top: 1120, textAlign: "center", fontFamily: "Open Sans", fontWeight: 600, fontSize: 36, color: "#fff", opacity: seg(t, at(26), at(26) + 0.3) }}>Aucune expérience, aucun chiffre qui ne soit pas dans ton CV.</div>
        </>)],
        [sc(3), (t) => (<>
          <Fond c={INK} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, rgba(217,130,139,0.25) 0%, rgba(11,10,11,0) 60%)" }} />
          <FinOfferte t={t} t0={sc(3) + 0.05} aBio={at(30)} dark />
        </>)],
      ]} />
      <Audio src={staticFile("audio/motscles.wav")} />
    </AbsoluteFill>
  );
};
