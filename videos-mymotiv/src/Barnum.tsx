// « Je lis dans ta tête » (≈49 s, 30 i/s, 9:16) — même univers pixel noir et rouge que FauxDM et MotRouge, autre axe : le
// faux mentaliste. Un « portrait » qui va à tout le monde (« tu en demandes beaucoup à toi-même… au fond, tu doutes ») →
// « ça te ressemble ? » (deux boutons OUI) → « j'ai dit la même chose à tout le monde » → effet Barnum → la lettre
// « motivé, dynamique, à l'écoute » va à tout le monde, donc ne dit rien de toi → ce que toi seul peux dire + ce dont
// l'entreprise a besoin → MyMotiv → CTA : « sois honnête en commentaire : t'y as cru ? » + 1re lettre offerte, lien en bio.
// Voix : voix-barnum.json (--voix yann). Son : synth_barnum.py. Éléments pixel importés de FauxDM.tsx.
import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./common";
import voix from "./data/barnum-voix.json";
import { Ecran, GREY, ICON, INK, Line, P, PINK, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";

export const BARNUM_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
export const HOT = new Set(["tete", "doutes", "ressemble", "barnum", "cerveau", "lettre", "motivation", "rien", "inverse", "seul", "besoin",
  "mymotiv", "honnete", "commentaire", "cru", "offerte"]);
const Caption = makeCaption(voix, HOT);
// début de chaque scène : un peu avant sa phrase ; le « OUI » cliqué reste pendant « Normal. », « une lettre unique » jusqu'au logo
const DEB = PH.map(([a], i) => (i === 0 ? -1 : i === 3 ? at(48) - 0.1 : i === 7 ? at(135) - 0.2 : a - 0.15));
const scene = (t: number, i: number) => show(t, DEB[i], i + 1 < DEB.length ? DEB[i + 1] : BARNUM_DUR + 1);

export const BOULE = [                                                          // boule de voyante (rouge, reflets roses)
  ".....rrrrrr.....", "...rrddddddrr...", "..rddddddddddr..", ".rddpwddddddddr.", ".rdppdddddddddr.", "rddpddddddddddr.",
  "rdddddddddddddr.", "rdddddddddddddr.", "rdddddddddddddr.", ".rddddddddddddr.", ".rddddddddddddr.", "..rddddddddddr..",
  "...rrddddddrr...", "....kkkkkkkk....", "...mmmmmmmmmm...", "..mmmmmmmmmmmm..",
];
export const PERS_R = ICON.person.map((r) => r.replace(/g/g, "r"));            // la silhouette en rouge (« toi »)
export const NOMS = ["CAMILLE", "INÈS", "YANN", "LÉA", "NOAH", "TOI"];
export const Big: React.FC<{ text: string; size: number; color?: string }> = ({ text, size, color = W_ }) => (
  <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: size, color, lineHeight: 1.05, textAlign: "center", whiteSpace: "pre" }}>{text}</div>
);
// petite fiche « profil » identique pour tout le monde
const Fiche: React.FC<{ nom: string }> = ({ nom }) => (
  <Win title={nom} w={300} red={nom === "TOI"}>
    {[0.9, 0.75, 0.82].map((w, j) => <div key={j} style={{ height: 12, width: `${w * 100}%`, background: "#5A4A48", margin: "8px 0" }} />)}
    <div style={{ height: 12, width: "70%", background: RED, margin: "8px 0" }} />
  </Win>
);
export const Tampon: React.FC<{ text: string; t: number; a: number; size?: number }> = ({ text, t, a, size = 40 }) => (
  <div style={{ transform: `rotate(-8deg) scale(${lerp1(clamp((t - a) / 0.12))})`, border: `6px solid ${RED}`, padding: "10px 22px", background: "rgba(7,3,3,0.85)", fontFamily: PIX, fontWeight: 700, fontSize: size, color: RED }}>{text}</div>
);
const lerp1 = (k: number) => 1.6 - 0.6 * k;                              // le tampon s'écrase de 1,6 à 1
export const Bouton: React.FC<{ text: string; on?: boolean }> = ({ text, on }) => (
  <div style={{ padding: "16px 40px", border: `5px solid ${W_}`, background: on ? W_ : "transparent", fontFamily: PIX, fontWeight: 700, fontSize: 48, color: on ? INK : W_ }}>{text}</div>
);
export const Curseur: React.FC = () => <svg width={44} height={60}><path d="M0 0 L0 48 L12 38 L20 58 L28 54 L20 34 L36 34 Z" fill={W_} stroke={INK} strokeWidth={3} /></svg>;

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  const C = 540, M = 980;
  if (scene(t, 0)) return (
    <>
      <P t={t} a={-0.2} x={C} y={M - 120}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -60, borderRadius: "50%", background: `radial-gradient(circle, rgba(232,38,43,${0.35 + 0.15 * Math.sin(t * 4)}) 0%, rgba(232,38,43,0) 65%)` }} />
          <Pix rows={BOULE} px={20} />
          {Array.from({ length: 6 }, (_, j) => { const a = t * 2.2 + j * 1.05, r = 70 + 20 * Math.sin(t * 3 + j); return <div key={j} style={{ position: "absolute", left: 150 + Math.round(Math.cos(a) * r / 10) * 10, top: 130 + Math.round(Math.sin(a) * r * 0.8 / 10) * 10, width: 14, height: 14, background: j % 2 ? PINK : W_, opacity: 0.8 }} />; })}
        </div>
      </P>
      <P t={t} a={at(2)} x={C} y={M + 200}><Tag text="10 SECONDES" red size={40} /></P>
      <P t={t} a={at(6)} x={C} y={M + 310}><Tag text="JE LIS DANS TA TÊTE" size={32} /></P>
    </>
  );
  if (scene(t, 1)) {
    const done = t >= at(38);
    return (
      <>
        <P t={t} a={PH[1][0] - 0.1} x={C} y={M - 330}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}><Pix rows={ICON.eye} px={8} /><Tag text={done ? "ANALYSE TERMINÉE" : `ANALYSE EN COURS${".".repeat(1 + (Math.floor(t * 3) % 3))}`} red={done} size={26} style={{ minWidth: 420 }} /></div>
        </P>
        <P t={t} a={PH[1][0]} x={C} y={M - 20}>
          <Win title="TON PROFIL" w={740}>
            <div style={{ height: 14, background: "#3A2526", marginBottom: 14 }}><div style={{ width: `${Math.round(clamp((t - PH[1][0]) / (at(38) - PH[1][0])) * 10) * 10}%`, height: 14, background: RED }} /></div>
            <Line t={t} a={at(10)} text="TU EN DEMANDES BEAUCOUP À TOI-MÊME." size={22} /><br />
            <Line t={t} a={at(19)} text="UN POTENTIEL PAS ENCORE EXPLOITÉ." size={22} /><br />
            <Line t={t} a={at(28)} text="À L'AISE DEVANT LES AUTRES…" size={22} /><br />
            <Line t={t} a={at(38)} text="MAIS AU FOND, TU DOUTES." red size={24} />
          </Win>
        </P>
      </>
    );
  }
  if (scene(t, 2)) {
    const b = at(43) + 0.3, k = clamp((t - b - 0.3) / 0.8);
    return (
      <>
        <P t={t} a={PH[2][0] - 0.1} x={C} y={M - 160}><Big text={"ÇA TE\nRESSEMBLE ?"} size={84} /></P>
        <P t={t} a={b} x={C} y={M + 160}>
          <div style={{ position: "relative", display: "flex", gap: 60 }}>
            <Bouton text="OUI" on={k >= 1} /><Bouton text="OUI" />
            <div style={{ position: "absolute", left: 210 - k * 120, top: 120 - k * 70 }}><Curseur /></div>
          </div>
        </P>
      </>
    );
  }
  if (scene(t, 3)) return (
    <>
      {NOMS.map((n, j) => <P key={n} t={t} a={at(48) + j * 0.1} x={C - 170 + (j % 2) * 340} y={M - 250 + Math.floor(j / 2) * 210}><Fiche nom={n} /></P>)}
      {t >= at(53) && <div style={{ position: "absolute", left: C, top: M - 40, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="MÊME TEXTE" t={t} a={at(53)} /></div>}
      <P t={t} a={at(56)} x={C} y={M + 330}><Tag text="POUR TOUT LE MONDE" size={30} /></P>
    </>
  );
  if (scene(t, 4)) return (
    <>
      <P t={t} a={PH[4][0] - 0.1} x={C} y={M - 120}>
        <Win title="MÉCANISME" w={720}>
          <div style={{ fontFamily: PIX, fontSize: 26, color: GREY }}>NOM :</div>
          {t >= at(62) && <div style={{ fontFamily: PIX, fontWeight: 700, lineHeight: 1.05 }}><div style={{ fontSize: 44, color: W_ }}>L'EFFET</div><div style={{ fontSize: 76, color: RED }}>BARNUM</div></div>}
          {t >= at(66) && <div style={{ marginTop: 14 }}><Tag text="ASSEZ VAGUE = ÇA VA À TOUT LE MONDE" size={18} /></div>}
        </Win>
      </P>
      <P t={t} a={at(75)} x={C} y={M + 250}><div style={{ display: "flex", alignItems: "center", gap: 20 }}><Pix rows={ICON.brain} px={14} /><Tag text="« C'EST MOI ! »" red size={30} /></div></P>
    </>
  );
  if (scene(t, 5)) return (
    <>
      <P t={t} a={PH[5][0] - 0.1} x={C} y={M - 170}>
        <Win title="LETTRE DE MOTIVATION" w={680} red={false}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", minHeight: 50 }}>
            {([["MOTIVÉ,", 92], ["DYNAMIQUE,", 93], ["À L'ÉCOUTE…", 94]] as const).map(([w, i]) => t >= at(i) && <Tag key={w} text={w} size={26} style={{ background: "transparent", color: W_, border: `3px solid ${GREY}` }} />)}
          </div>
        </Win>
      </P>
      {t >= at(97) && <div style={{ position: "absolute", left: C - 300, top: M + 20, display: "flex", gap: 30 }}>
        {NOMS.slice(0, 5).map((n, j) => t >= at(97) + j * 0.1 && <div key={n} style={{ textAlign: "center" }}><Pix rows={ICON.person} px={7} style={{ margin: "0 auto" }} /><div style={{ fontFamily: PIX, fontSize: 16, color: GREY, marginTop: 6 }}>{n}</div><div style={{ margin: "6px auto 0", width: 44, height: 30, background: W_ }} /></div>)}
      </div>}
      {t >= at(104) && <div style={{ position: "absolute", left: C, top: M + 330, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="ÇA DIT RIEN DE TOI" t={t} a={at(104)} /></div>}
    </>
  );
  if (scene(t, 6)) return (
    <>
      <P t={t} a={at(114)} x={C} y={M - 320}><Tag text="L'INVERSE" size={34} style={{ background: "transparent", color: W_, border: `4px solid ${W_}` }} /></P>
      <P t={t} a={at(117)} x={C} y={M - 190}><Tag text="CE QUE TOI SEUL PEUX DIRE" size={30} /></P>
      <P t={t} a={at(122)} x={C} y={M - 95}><Big text="+" size={60} /></P>
      <P t={t} a={at(124)} x={C} y={M + 5}><Tag text="CE DONT L'ENTREPRISE A BESOIN" red size={28} /></P>
      <P t={t} a={at(127)} x={C} y={M + 105}><Big text="=" size={60} /></P>
      <P t={t} a={at(128)} x={C} y={M + 230}><div style={{ padding: "18px 34px", background: PINK, border: `5px solid ${W_}`, fontFamily: PIX, fontWeight: 700, fontSize: 40, color: W_ }}>UNE LETTRE UNIQUE</div></P>
    </>
  );
  if (scene(t, 7)) return (
    <>
      <P t={t} a={at(135)} x={C} y={M - 310}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 460 }} /></P>
      <P t={t} a={at(136)} x={C} y={M - 40}>
        <Win title="MYMOTIV" w={680}>
          {([["LIEN DE L'OFFRE", 137], ["TON CV", 142], ["UNE LETTRE QUI N'EST QU'À TOI", 145]] as const).map(([l, i]) => t >= at(i) && <div key={l} style={{ fontFamily: PIX, fontSize: i === 145 ? 24 : 28, color: i === 145 ? RED : W_, margin: "10px 0" }}><span style={{ color: PINK }}>✓</span> {l}</div>)}
        </Win>
      </P>
      {t >= at(147) && <div style={{ position: "absolute", left: C - 280, top: M + 190, display: "flex", gap: 34 }}>
        {NOMS.slice(1).map((n, j) => <div key={n} style={{ textAlign: "center", opacity: n === "TOI" ? 1 : 0.45 }}><Pix rows={n === "TOI" ? PERS_R : ICON.person} px={7} style={{ margin: "0 auto" }} /><div style={{ fontFamily: PIX, fontSize: 16, color: n === "TOI" ? RED : GREY, marginTop: 6 }}>{n}</div></div>)}
      </div>}
    </>
  );
  if (scene(t, 8)) {
    const k = clamp((t - at(157) - 0.2) / 0.6);
    return (
      <>
        <P t={t} a={PH[8][0] - 0.05} x={C} y={M - 180}>
          <Win title="COMMENTAIRE" w={680} red={false}>
            <div style={{ fontFamily: PIX, fontSize: 32, color: W_, marginBottom: 14 }}>T'Y AS CRU ?</div>
            <div style={{ position: "relative", display: "flex", gap: 24 }}>
              <Tag text="OUI" size={30} style={{ border: `3px solid ${W_}`, background: k >= 1 ? W_ : "transparent", color: k >= 1 ? INK : W_ }} />
              <Tag text="NON" size={30} style={{ border: `3px solid ${W_}`, background: "transparent", color: W_ }} />
              <span style={{ width: 16, height: 40, background: RED, opacity: Math.floor(t * 2.5) % 2 ? 1 : 0 }} />
              {t >= at(157) && <div style={{ position: "absolute", left: 200 - k * 150, top: 40 - k * 20 }}><Curseur /></div>}
            </div>
          </Win>
        </P>
        <P t={t} a={at(153)} x={C} y={M + 30}><div style={{ display: "flex", alignItems: "center", gap: 16 }}><Pix rows={ICON.eye} px={9} /><Tag text="SOIS HONNÊTE" size={30} /></div></P>
        <P t={t} a={at(163)} x={C} y={M + 200}><div style={{ padding: "14px 26px", background: PINK, fontFamily: PIX, fontWeight: 700, fontSize: 32, color: W_ }}>1RE LETTRE OFFERTE</div></P>
        <P t={t} a={at(167)} x={C} y={M + 310}><Tag text="LIEN EN BIO ↑" size={32} /></P>
      </>
    );
  }
  return null;
};

export const Barnum: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = (t > at(48) - 0.05 && t < at(48) + 0.2) || (t > at(53) && t < at(53) + 0.12);
  return <Ecran t={t} glitch={glitch} audio="audio/barnum.wav" caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
