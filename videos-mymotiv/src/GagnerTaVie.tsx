// « G comme gagner ta vie » (≈34 s, 30 i/s, 9:16) — univers pixel, cadrée TikTok dès le départ.
// Accroche : une phrase de rap entre guillemets, « Le biff trouve tout, même ton point G » (choix du propriétaire, sans citer l'artiste) sur une pluie de billets,
// aussitôt retournée en jeu de mots : « Calme-toi. G comme… gagner ta vie. » → pas de taf ? trouve un travail qui paie bien →
// le « point sensible » du recruteur : ce qu'il cherche vraiment → pas « je suis motivé », leur vrai besoin + ta preuve →
// MyMotiv → CTA « ton premier salaire, tu le claques dans quoi ? ». Rien ne lie l'argent au corps de quelqu'un.
// Voix : voix-gagner.json (--voix yann). Son : synth_gagner.py.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, rng } from "./common";
import voix from "./data/gagner-voix.json";
import { Ecran, ICON, P, Pix, RED, Tag, Win, makeCaption, show } from "./FauxDM";
import { BigTT, FinMyMotiv } from "./fauxdmTT";
import { Bulle, CAP_BOX, Ligne, X, deux } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";

export const GAGNER_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["biff", "point", "gagner", "vie", "taf", "remedier", "paie", "sensible", "recruteur", "vraiment", "motive", "besoin", "preuve",
  "mymotiv", "juste", "chances", "salaire", "commentaire", "offerte"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : GAGNER_DUR + 1);

const BILLET = ["pppppppppppppp", "pwwwwwwwwwwwwp", "pwppppwwppppwp", "pwpppwrrwpppwp", "pwppppwwppppwp", "pwwwwwwwwwwwwp", "pppppppppppppp"];
const CIBLE = ["..rrrrr..", ".rwwwwwr.", "rwwrrrwwr", "rwrrwrrwr", "rwrwwwrwr", "rwrrwrrwr", "rwwrrrwwr", ".rwwwwwr.", "..rrrrr.."];
// pluie de billets pixel (décor : peut passer derrière l'interface TikTok, mais pas sur les sous-titres)
const Pluie: React.FC<{ t: number; n: number; a?: number; vitesse?: number }> = ({ t, n, a = -2, vitesse = 520 }) => {
  if (t < a) return null;
  const r = rng(11);
  return (
    <>
      {Array.from({ length: n }, (_, j) => {
        const x = 40 + r() * 1000, y0 = -200 - r() * 1600, v = vitesse * (0.7 + r() * 0.6), rot = Math.round(Math.sin(t * 2 + j) * 3) * 10;
        const y = ((y0 + (t - a) * v) % 2300 + 2300) % 2300 - 200;
        const op = 0.85 * clamp((Math.abs(y + 28 - 1215) - 70) / 90, 0.1, 1);   // s'efface en traversant les sous-titres
        return <div key={j} style={{ position: "absolute", left: x, top: y, transform: `rotate(${rot}deg)`, opacity: op }}><Pix rows={BILLET} px={8} /></div>;
      })}
    </>
  );
};

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return (
    <>
      <Pluie t={t} n={16} />
      <P t={t} a={-0.2} x={X} y={620}><div style={{ background: "rgba(7,3,3,0.75)", padding: "26px 30px", border: `6px solid ${RED}` }}><BigTT text={"« LE BIFF\nTROUVE TOUT,\nMÊME TON\nPOINT G »"} size={64} /></div></P>
    </>
  );
  if (scene(t, 1)) return (
    <>
      {t < at(10) && <Pluie t={t} n={8} vitesse={300} />}
      <P t={t} a={PH[1][0] - 0.1} x={X} y={400}><Tag text="CALME-TOI." size={60} /></P>
      <P t={t} a={at(10)} x={X} y={690}><BigTT text="G" size={300} color={RED} /></P>
      <P t={t} a={at(12)} x={X} y={1030}><BigTT text={t >= at(13) ? "COMME GAGNER\nTA VIE" : "COMME..."} size={66} /></P>
    </>
  );
  if (scene(t, 2)) return (
    <>
      <P t={t} a={at(20)} x={X} y={410}><Tag text="PAS DE TAF ?" size={70} /></P>
      <P t={t} a={at(24)} x={X} y={720}>
        <Win title="TON FUTUR SALAIRE" w={800} ts={30}>
          <div style={{ display: "flex", gap: 10, minHeight: 64, alignItems: "center" }}>
            {Array.from({ length: 8 }, (_, j) => t >= at(28) + j * 0.12 && <Pix key={j} rows={BILLET} px={6} />)}
          </div>
        </Win>
      </P>
      <P t={t} a={at(28)} x={X} y={1040}><Tag text={"TROUVE UN TAF\nQUI PAIE BIEN"} red size={50} style={deux()} /></P>
    </>
  );
  if (scene(t, 3)) return (
    <>
      <P t={t} a={at(43)} x={X} y={390}><Tag text="SON POINT SENSIBLE :" size={42} /></P>
      <P t={t} a={PH[3][0]} x={X} y={680}>
        <div style={{ position: "relative", textAlign: "center" }}>
          <Pix rows={ICON.boy} px={24} style={{ margin: "0 auto" }} />
          <div style={{ marginTop: 10 }}><Tag text="RECRUTEUR" size={34} /></div>
          {t >= at(44) && <div style={{ position: "absolute", left: "50%", top: 120, transform: `translateX(-50%) scale(${1 + 0.12 * Math.round(Math.abs(Math.sin(t * 5)) * 2) / 2})` }}><Pix rows={CIBLE} px={9} /></div>}
        </div>
      </P>
      <P t={t} a={at(50)} x={X} y={1040}><Tag text={"CE QU'IL CHERCHE\nVRAIMENT"} red size={48} style={deux()} /></P>
    </>
  );
  if (scene(t, 4)) {
    const barre = at(56) + 0.2;
    return (
      <>
        <P t={t} a={PH[4][0] - 0.1} x={X} y={600}>
          <Win title="TA LETTRE" w={800} ts={30}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <Bulle t={t} a={at(53)} text="« JE SUIS MOTIVÉ »" size={44} />
              {t >= barre && <svg width={560} height={80} style={{ position: "absolute", left: -10, top: 0 }}><path d={`M0 52 L${Math.round(clamp((t - barre) / 0.2) * 4) / 4 * 520} 34`} stroke={RED} strokeWidth={10} /></svg>}
            </div>
            <Ligne t={t} a={at(57)} text="LEUR VRAI BESOIN" red size={44} />
            <Ligne t={t} a={at(61)} text="+ TA PREUVE" size={44} />
          </Win>
        </P>
        <P t={t} a={at(65)} x={X} y={1040}><div style={{ display: "flex", alignItems: "center", gap: 20 }}><Pix rows={CIBLE} px={8} /><Tag text="DANS LE MILLE" red size={50} /></div></P>
      </>
    );
  }
  if (scene(t, 5)) return (
    <>
      <FinMyMotiv t={t} aLogo={PH[5][0] - 0.1} aWin={at(74)} etapes={[["PART DE L'OFFRE", at(76)], ["LEURS VRAIS BESOINS", at(80)], ["TA LETTRE\nVISE JUSTE", at(86)]]} aOffre={99} aBio={99} />
      <P t={t} a={at(89)} x={X} y={1010}><Tag text={"DONNE-TOI TOUTES\nLES CHANCES"} red size={44} style={deux()} /></P>
    </>
  );
  if (scene(t, 6)) return (
    <>
      <CtaCommentaire t={t} aOffre={at(105)} aBio={at(108)} aWin={at(94)} aType={at(98)} label={"MON 1ER\nSALAIRE :"} />
    </>
  );
  return null;
};

export const GagnerTaVie: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = t < 0.18 || (t > PH[1][0] - 0.1 && t < PH[1][0] + 0.15) || (t > at(10) && t < at(10) + 0.15);
  return <Ecran t={t} glitch={glitch} audio="audio/gagner.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
