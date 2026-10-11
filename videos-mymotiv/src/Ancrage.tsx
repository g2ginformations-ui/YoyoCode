// « Le premier chiffre » (≈35 s, 30 i/s, 9:16) — série « effets psycho » (après PremiereLigne), univers pixel, cadrée TikTok.
// Accroche « Le premier chiffre que tu vois décide de tout le reste » → montre à 900 € soldée à 300 € → effet d'ancrage →
// une lettre qui commence par « je suis motivé » = ancre faible → ancrer sur une vraie preuve, un vrai résultat → MyMotiv
// (tes meilleures preuves pour cette offre, zéro « je suis motivé ») → 1re lettre offerte, lien en bio, « ta meilleure
// preuve ? » en commentaire. Voix : voix-ancrage.json (--voix yann). Son : synth_ancrage.py.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./common";
import voix from "./data/ancrage-voix.json";
import { Ecran, P, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { Tampon } from "./Barnum";
import { BigTT, FinMyMotiv, Mecanisme } from "./fauxdmTT";
import { Bulle, CAP_BOX, Ligne, X, deux } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";

export const ANCRAGE_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["premier", "chiffre", "tout", "affaire", "ancrage", "premiere", "motive", "ancre", "concret", "preuve", "resultat",
  "valeur", "mymotiv", "preuves", "zero", "offerte", "commentaire"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : ANCRAGE_DUR + 1);

const MONTRE = ["...gggg...", "...gggg...", "..wwwwww..", ".wkkkkkkw.", "wkkkrkkkkw", "wkkkrkkkkw", "wkkkrrrkkw", "wkkkkkkkkw", ".wkkkkkkw.", "..wwwwww..", "...gggg...", "...gggg..."];
const ANCRE = ["....ww....", "...w..w...", "....ww....", "....ww....", ".wwwwwwww.", "....ww....", "....ww....", "w...ww...w", "ww..ww..ww", ".wwwwwwww.", "..wwwwww.."];
const ANCRE_R = ANCRE.map((r) => r.replace(/w/g, "r"));
const Prix: React.FC<{ text: string; red?: boolean; size: number }> = ({ text, red, size }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.25, padding: `${size * 0.18}px ${size * 0.4}px`, background: red ? RED : W_, border: `6px solid ${red ? W_ : RED}` }}>
    <span style={{ width: size * 0.28, height: size * 0.28, borderRadius: "50%", background: red ? W_ : RED }} />
    <BigTT text={text} size={size} color={red ? W_ : "#070303"} />
  </div>
);

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return (
    <>
      <P t={t} a={-0.2} x={X} y={430}><BigTT text={"LE 1ER\nCHIFFRE"} size={120} color={RED} /></P>
      <P t={t} a={-0.2} x={X} y={820}><Prix text="900 €" size={110} /></P>
      <P t={t} a={at(6)} x={X} y={1090}><Tag text="DÉCIDE DE TOUT" red size={50} /></P>
    </>
  );
  if (scene(t, 1)) return (
    <>
      <P t={t} a={PH[1][0] - 0.1} x={X} y={470}><Pix rows={MONTRE} px={17} /></P>
      <P t={t} a={at(13)} x={X} y={800}><div style={{ position: "relative" }}><Prix text="900 €" size={72} />{t >= at(15) && <svg width={420} height={140} style={{ position: "absolute", left: -20, top: -10 }}><path d={`M0 120 L${Math.round(clamp((t - at(15)) / 0.2) * 4) / 4 * 420} 10`} stroke={RED} strokeWidth={12} /></svg>}</div></P>
      <P t={t} a={at(17)} x={X} y={960}><Prix text="300 €" red size={96} /></P>
      <P t={t} a={at(19)} x={X} y={1110}><Tag text="UNE AFFAIRE ?" size={44} /></P>
    </>
  );
  if (scene(t, 2)) return (
    <>
      <Mecanisme t={t} a={PH[2][0] - 0.1} aNom={at(24)} nom="D'ANCRAGE" taille={84} tag={["1RE INFO = REPÈRE\nPOUR TOUT LE RESTE", at(33)]} />
      <P t={t} a={at(30)} x={X} y={1030}><div style={{ transform: `rotate(${Math.round(Math.sin(t * 3) * 3) * 3}deg)`, transformOrigin: "50% 0" }}><Pix rows={ANCRE} px={14} /></div></P>
    </>
  );
  if (scene(t, 3)) return (
    <>
      <P t={t} a={PH[3][0] - 0.1} x={X} y={580}>
        <Win title="LETTRE DE MOTIVATION" w={800} red={false} ts={30}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Bulle t={t} a={at(49)} text="« JE SUIS MOTIVÉ... »" size={42} />
            {t >= at(60) && <Pix rows={ANCRE_R} px={7} />}
          </div>
          {[0.9, 0.8, 0.95].map((w, j) => <div key={j} style={{ height: 22, width: `${w * 100}%`, margin: "18px 0 0 6px", background: "#4A3C3B" }} />)}
        </Win>
      </P>
      {t >= at(58) && <div style={{ position: "absolute", left: X, top: 1020, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="ANCRE FAIBLE" t={t} a={at(58)} size={64} /></div>}
    </>
  );
  if (scene(t, 4)) {
    const bars = [0.25, 0.4, 0.55, 0.75, 1];
    return (
      <>
        <P t={t} a={PH[4][0] - 0.1} x={X} y={540}>
          <Win title="TA LETTRE" w={800} ts={30}>
            <Ligne t={t} a={at(70)} text="UNE VRAIE PREUVE" red size={44} />
            <Ligne t={t} a={at(73)} text="UN VRAI RÉSULTAT" size={44} />
          </Win>
        </P>
        {t >= at(76) && (
          <div style={{ position: "absolute", left: X - 300, top: 860, display: "flex", alignItems: "flex-end", gap: 18, height: 240 }}>
            {bars.map((h, k) => { const kk = clamp((t - at(76) - k * 0.1) / 0.3); return <div key={k} style={{ width: 70, height: Math.round(h * kk * 8) / 8 * 230, background: k === bars.length - 1 ? RED : "#5A4A48" }} />; })}
            <Tag text="VALEUR ▲" red size={40} style={{ marginLeft: 14 }} />
          </div>
        )}
      </>
    );
  }
  if (scene(t, 5)) return (
    <>
      <FinMyMotiv t={t} aLogo={PH[5][0] - 0.1} aWin={at(88)} etapes={[["TON CV", at(94)], ["TES MEILLEURES\nPREUVES", at(97)]]} aOffre={99} aBio={99} />
      <P t={t} a={at(101)} x={X} y={1000}><div style={{ position: "relative" }}><Tag text={"ZÉRO\n« JE SUIS MOTIVÉ »"} red size={40} style={deux()} /></div></P>
    </>
  );
  if (scene(t, 6)) return <CtaCommentaire t={t} aOffre={at(105)} aBio={at(108)} aWin={at(111)} aType={at(118)} label={"TA MEILLEURE\nPREUVE :"} />;
  return null;
};

export const Ancrage: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = t < 0.18 || (t > at(58) - 0.05 && t < at(58) + 0.2) || (t > at(17) && t < at(17) + 0.12);
  return <Ecran t={t} glitch={glitch} audio="audio/ancrage.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
