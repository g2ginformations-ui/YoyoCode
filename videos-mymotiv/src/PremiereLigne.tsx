// « La première ligne » (≈31 s, 30 i/s, 9:16) — pub MyMotiv dans l'univers pixel noir et rouge (FauxDM, MotRouge, Barnum),
// cadrée TikTok dès le départ (zones sûres de src/tiktok.ts, briques de src/pixelTT.tsx et src/fauxdmTT.tsx).
// Accroche : « Ta lettre de motivation se joue sur une seule ligne » (« 1 SEULE LIGNE. » dès la 1re image) → le recruteur
// lit le reste à travers elle → effet de halo → « je me permets de vous adresser… » = lettre banale → ouvrir sur leur
// besoin + une preuve de toi → MyMotiv → 1re lettre offerte, lien en bio, « colle ta 1re ligne en commentaire ».
// Voix : voix-ligne.json (--voix yann). Son : synth_ligne.py.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import voix from "./data/ligne-voix.json";
import { Ecran, ICON, P, PINK, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { Tampon } from "./Barnum";
import { BigTT, FinMyMotiv, Lecture, Mecanisme, Recruteur } from "./fauxdmTT";
import { Bulle, CAP_BOX, Ligne, X, deux } from "./pixelTT";

export const LIGNE_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["seule", "ligne", "premiere", "recruteur", "halo", "meilleur", "banale", "besoin", "preuve", "suite", "mymotiv",
  "juste", "offerte", "commentaire", "passe"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : LIGNE_DUR + 1);

const HALO = ["..pppppp..", ".p......p.", "..pppppp.."];
// la lettre schématique : 1re ligne allumée, les 5 autres en barres (grises, ou teintées « à travers » la 1re)
const Lettre: React.FC<{ t: number; teinte?: number }> = ({ t, teinte = 99 }) => (
  <Win title="LETTRE DE MOTIVATION" w={800} red={false} ts={30}>
    <div style={{ display: "flex", alignItems: "center", gap: 16, border: `5px solid ${RED}`, padding: "8px 14px", transform: `scale(${1 + 0.02 * Math.round(Math.sin(t * 6))})`, boxShadow: "0 0 30px rgba(232,38,43,0.55)" }}>
      <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 40, color: RED }}>1.</span>
      <div style={{ height: 30, flex: 1, background: W_ }} />
    </div>
    {[0.92, 0.85, 0.95, 0.7, 0.8].map((w, j) => (
      <div key={j} style={{ height: 24, width: `${w * 100}%`, margin: "20px 0 0 14px", background: t >= teinte + j * 0.1 ? "#B3262A" : "#4A3C3B" }} />
    ))}
  </Win>
);

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0) || scene(t, 1)) return (
    <>
      {scene(t, 0) && <P t={t} a={-0.2} x={X} y={450}><BigTT text={"1 SEULE\nLIGNE."} size={120} color={RED} /></P>}
      {scene(t, 1) && <P t={t} a={at(13)} x={X} y={430}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Pix rows={ICON.eye} px={12} /><Tag text="RECRUTEUR" size={44} /></div></P>}
      <P t={t} a={-0.2} x={X} y={850}><Lettre t={t} teinte={at(15)} /></P>
      {scene(t, 1) && <P t={t} a={at(19)} x={X} y={1130}><Tag text={"TOUT EST LU\nÀ TRAVERS ELLE"} red size={38} style={deux()} /></P>}
    </>
  );
  if (scene(t, 2)) return (
    <>
      <Mecanisme t={t} a={PH[2][0] - 0.1} aNom={at(24)} nom="HALO" taille={150} tag={["BONNE 1RE IMPRESSION =\nTOUT PARAÎT MIEUX", at(28)]} />
      <P t={t} a={at(32)} x={X} y={1030}>
        <div style={{ textAlign: "center", position: "relative" }}>
          <div style={{ transform: `translateY(${Math.round(Math.sin(t * 4) * 2) * 3}px)` }}><Pix rows={HALO} px={14} style={{ margin: "0 auto 10px" }} /></div>
          <Pix rows={ICON.person} px={10} style={{ margin: "0 auto" }} />
          {[0, 1, 2].map((j) => <div key={j} style={{ position: "absolute", left: 30 + j * 70 + Math.round(Math.sin(t * 3 + j) * 2) * 6, top: 10 + (j % 2) * 40, width: 14, height: 14, background: PINK, opacity: Math.floor(t * 4 + j) % 2 ? 1 : 0.3 }} />)}
        </div>
      </P>
    </>
  );
  if (scene(t, 3)) return (
    <>
      <P t={t} a={PH[3][0] - 0.1} x={X} y={620}>
        <Win title="LETTRE DE MOTIVATION" w={800} red={false} ts={30}>
          <Bulle t={t} a={at(37)} text={"« JE ME PERMETS DE VOUS\nADRESSER MA\nCANDIDATURE »"} size={38} />
          {[0.9, 0.8, 0.95].map((w, j) => <div key={j} style={{ height: 22, width: `${w * 100}%`, margin: "18px 0 0 6px", background: "#4A3C3B" }} />)}
        </Win>
      </P>
      {t >= at(46) && <div style={{ position: "absolute", left: X, top: 1050, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="BANALE" t={t} a={at(46)} size={96} /></div>}
    </>
  );
  if (scene(t, 4)) return (
    <>
      <P t={t} a={PH[4][0] - 0.1} x={X} y={560}>
        <Win title="TA LETTRE" w={800} ts={30}>
          <Ligne t={t} a={at(51)} text="1. LEUR BESOIN" red size={46} />
          <Ligne t={t} a={at(57)} text={"2. UNE PREUVE\n   DE TOI"} size={44} />
        </Win>
      </P>
      <P t={t} a={PH[4][0]} x={X - 230} y={1000}><Recruteur alerte={t >= at(61)} /></P>
      <P t={t} a={at(63)} x={X + 150} y={1010}><Lecture t={t} a={at(63)} /></P>
    </>
  );
  if (scene(t, 5)) return <FinMyMotiv t={t} aLogo={PH[5][0] - 0.1} aWin={at(73)} etapes={[["LIEN DE L'OFFRE", at(75)], ["TON CV", at(80)], ["UNE 1RE LIGNE\nQUI FRAPPE JUSTE", at(83)]]} aOffre={99} aBio={99} />;
  if (scene(t, 6)) return (
    <>
      <P t={t} a={at(87)} x={X} y={380}><div style={{ padding: "16px 26px", background: PINK, fontFamily: PIX, fontWeight: 700, fontSize: 52, color: W_ }}>1RE LETTRE OFFERTE</div></P>
      <P t={t} a={at(90)} x={X} y={510}><Tag text="LIEN EN BIO ↑" size={52} /></P>
      <P t={t} a={at(93)} x={X} y={790}>
        <Win title="COMMENTAIRE" w={800} red={false} ts={32}>
          <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 52, color: W_, marginBottom: 16 }}>TA 1RE LIGNE :</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {Array.from({ length: Math.min(10, Math.max(0, Math.floor((t - at(95)) * 8))) }, (_, j) => <span key={j} style={{ width: 44, height: 46, background: "#4A3C3B" }} />)}
            <span style={{ width: 20, height: 56, marginLeft: 6, background: RED, opacity: Math.floor(t * 2.5) % 2 ? 1 : 0 }} />
          </div>
        </Win>
      </P>
      <P t={t} a={at(99)} x={X} y={1090}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Pix rows={ICON.eye} px={10} /><Tag text={"JE TE DIS SI\nELLE PASSE"} red size={42} style={deux()} /></div></P>
    </>
  );
  return null;
};

export const PremiereLigne: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = t < 0.18 || (t > at(46) - 0.05 && t < at(46) + 0.2) || (t > at(26) && t < at(26) + 0.12);
  return <Ecran t={t} glitch={glitch} audio="audio/ligne.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
