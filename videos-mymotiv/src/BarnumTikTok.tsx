// « Je lis dans ta tête », version cadrée pour TikTok (≈49 s, 30 i/s, 9:16). Même voix, même son et même déroulé que
// Barnum.tsx, mais tout reste dans les zones sûres de src/tiktok.ts (rien sous les onglets du haut, la colonne de boutons
// à droite ni la description du bas), sans agrandissement global, avec un texte pixel ≥ 40 px, des sous-titres de 60 px
// dans le tiers bas et moins d'éléments par écran : la version d'origine était illisible une fois compressée par TikTok.
import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./common";
import voix from "./data/barnum-voix.json";
import { Ecran, GREY, ICON, INK, P, PINK, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { BARNUM_DUR, BOULE, Big, Curseur, HOT, NOMS, PERS_R, Tampon } from "./Barnum";
import { Bouton, CAP_BOX, Ligne, X, deux } from "./pixelTT";

const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const Caption = makeCaption(voix, HOT, CAP_BOX);
const DEB = PH.map(([a], i) => (i === 0 ? -1 : i === 3 ? at(48) - 0.1 : i === 7 ? at(135) - 0.2 : a - 0.15));
const scene = (t: number, i: number) => show(t, DEB[i], i + 1 < DEB.length ? DEB[i + 1] : BARNUM_DUR + 1);

const Fiche: React.FC<{ nom: string }> = ({ nom }) => (
  <Win title={nom} w={340} red={nom === "TOI"} ts={30}>
    {[0.9, 0.75, 0.82].map((w, j) => <div key={j} style={{ height: 16, width: `${w * 100}%`, background: "#5A4A48", margin: "12px 0" }} />)}
    <div style={{ height: 16, width: "70%", background: RED, margin: "12px 0" }} />
  </Win>
);
const Gens: React.FC<{ noms: string[]; toi?: boolean; lettre?: boolean; t: number; a: number }> = ({ noms, toi, lettre, t, a }) => (
  <div style={{ display: "flex", gap: 26 }}>
    {noms.map((n, j) => t >= a + j * 0.1 && (
      <div key={n} style={{ textAlign: "center", width: 112, opacity: toi && n !== "TOI" ? 0.45 : 1 }}>
        <Pix rows={toi && n === "TOI" ? PERS_R : ICON.person} px={9} style={{ margin: "0 auto" }} />
        <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 22, color: toi && n === "TOI" ? RED : GREY, marginTop: 8 }}>{n}</div>
        {lettre && <div style={{ margin: "8px auto 0", width: 56, height: 38, background: W_ }} />}
      </div>
    ))}
  </div>
);

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return (
    <>
      <P t={t} a={-0.2} x={X} y={420}><Big text={"JE LIS DANS\nTA TÊTE"} size={78} /></P>
      <P t={t} a={-0.2} x={X} y={770}>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: -60, borderRadius: "50%", background: `radial-gradient(circle, rgba(232,38,43,${0.35 + 0.15 * Math.sin(t * 4)}) 0%, rgba(232,38,43,0) 65%)` }} />
          <Pix rows={BOULE} px={22} />
          {Array.from({ length: 6 }, (_, j) => { const a = t * 2.2 + j * 1.05, r = 80 + 22 * Math.sin(t * 3 + j); return <div key={j} style={{ position: "absolute", left: 165 + Math.round(Math.cos(a) * r / 11) * 11, top: 145 + Math.round(Math.sin(a) * r * 0.8 / 11) * 11, width: 16, height: 16, background: j % 2 ? PINK : W_, opacity: 0.8 }} />; })}
        </div>
      </P>
      <P t={t} a={at(2)} x={X} y={1095}><Tag text="10 SECONDES" red size={56} /></P>
    </>
  );
  if (scene(t, 1)) {
    const done = t >= at(38);
    return (
      <>
        <P t={t} a={PH[1][0] - 0.1} x={X} y={370}>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}><Pix rows={ICON.eye} px={10} /><Tag text={done ? "ANALYSE TERMINÉE" : `ANALYSE EN COURS${".".repeat(1 + (Math.floor(t * 3) % 3))}`} red={done} size={38} style={{ minWidth: 560 }} /></div>
        </P>
        <P t={t} a={PH[1][0]} x={X} y={790}>
          <Win title="TON PROFIL" w={800} ts={32}>
            <div style={{ height: 18, background: "#3A2526", marginBottom: 18 }}><div style={{ width: `${Math.round(clamp((t - PH[1][0]) / (at(38) - PH[1][0])) * 10) * 10}%`, height: 18, background: RED }} /></div>
            <Ligne t={t} a={at(10)} text="PERFECTIONNISTE" />
            <Ligne t={t} a={at(19)} text="POTENTIEL CACHÉ" />
            <Ligne t={t} a={at(28)} text="À L'AISE... EN APPARENCE" />
            <Ligne t={t} a={at(38)} text="AU FOND : DES DOUTES" red />
          </Win>
        </P>
      </>
    );
  }
  if (scene(t, 2)) {
    const b = at(43) + 0.3, k = clamp((t - b - 0.3) / 0.8);
    return (
      <>
        <P t={t} a={PH[2][0] - 0.1} x={X} y={560}><Big text={"ÇA TE\nRESSEMBLE ?"} size={80} /></P>
        <P t={t} a={b} x={X} y={930}>
          <div style={{ position: "relative", display: "flex", gap: 60 }}>
            <Bouton text="OUI" on={k >= 1} /><Bouton text="OUI" />
            <div style={{ position: "absolute", left: 300 - k * 170, top: 150 - k * 90, transform: "scale(1.5)", transformOrigin: "0 0" }}><Curseur /></div>
          </div>
        </P>
      </>
    );
  }
  if (scene(t, 3)) return (
    <>
      {NOMS.map((n, j) => <P key={n} t={t} a={at(48) + j * 0.1} x={X - 185 + (j % 2) * 370} y={460 + Math.floor(j / 2) * 230}><Fiche nom={n} /></P>)}
      {t >= at(53) && <div style={{ position: "absolute", left: X, top: 690, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="MÊME TEXTE" t={t} a={at(53)} size={72} /></div>}
      <P t={t} a={at(56)} x={X} y={1110}><Tag text="POUR TOUT LE MONDE" size={46} /></P>
    </>
  );
  if (scene(t, 4)) return (
    <>
      <P t={t} a={PH[4][0] - 0.1} x={X} y={640}>
        <Win title="MÉCANISME" w={800} ts={32}>
          <div style={{ fontFamily: PIX, fontSize: 34, color: GREY }}>NOM :</div>
          {t >= at(62) && <div style={{ fontFamily: PIX, fontWeight: 700, lineHeight: 1.05 }}><div style={{ fontSize: 60, color: W_ }}>L'EFFET</div><div style={{ fontSize: 120, color: RED }}>BARNUM</div></div>}
          {t >= at(66) && <div style={{ marginTop: 18 }}><Tag text={"ASSEZ VAGUE =\nÇA VA À TOUT LE MONDE"} size={34} style={deux({ textAlign: "left" })} /></div>}
        </Win>
      </P>
      <P t={t} a={at(75)} x={X} y={1070}><div style={{ display: "flex", alignItems: "center", gap: 22 }}><Pix rows={ICON.brain} px={14} /><Tag text="« C'EST MOI ! »" red size={52} /></div></P>
    </>
  );
  if (scene(t, 5)) return (
    <>
      <P t={t} a={PH[5][0] - 0.1} x={X} y={500}>
        <Win title="LETTRE DE MOTIVATION" w={800} red={false} ts={30}>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", minHeight: 150, alignContent: "flex-start" }}>
            {([["MOTIVÉ,", 92], ["DYNAMIQUE,", 93], ["À L'ÉCOUTE...", 94]] as const).map(([w, i]) => t >= at(i) && <Tag key={w} text={w} size={44} style={{ background: "transparent", color: W_, border: `4px solid ${GREY}` }} />)}
          </div>
        </Win>
      </P>
      {t >= at(97) && <div style={{ position: "absolute", left: X, top: 800, transform: "translateX(-50%)" }}><Gens noms={NOMS.slice(0, 5)} lettre t={t} a={at(97)} /></div>}
      {t >= at(104) && <div style={{ position: "absolute", left: X, top: 1095, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="ÇA DIT RIEN DE TOI" t={t} a={at(104)} size={50} /></div>}
    </>
  );
  if (scene(t, 6)) return (
    <>
      <P t={t} a={at(114)} x={X} y={360}><Tag text="L'INVERSE" size={46} style={{ background: "transparent", color: W_, border: `5px solid ${W_}` }} /></P>
      <P t={t} a={at(117)} x={X} y={520}><Tag text={"CE QUE TOI SEUL\nPEUX DIRE"} size={44} style={deux()} /></P>
      <P t={t} a={at(122)} x={X} y={650}><Big text="+" size={76} /></P>
      <P t={t} a={at(124)} x={X} y={780}><Tag text={"CE DONT L'ENTREPRISE\nA BESOIN"} red size={44} style={deux()} /></P>
      <P t={t} a={at(127)} x={X} y={905}><Big text="=" size={76} /></P>
      <P t={t} a={at(128)} x={X} y={1060}><div style={{ padding: "18px 34px", background: PINK, border: `6px solid ${W_}`, fontFamily: PIX, fontWeight: 700, fontSize: 60, color: W_, ...deux() }}>{"UNE LETTRE\nUNIQUE"}</div></P>
    </>
  );
  if (scene(t, 7)) return (
    <>
      <P t={t} a={DEB[7]} x={X} y={400}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 540 }} /></P>
      <P t={t} a={at(136)} x={X} y={730}>
        <Win title="MYMOTIV" w={800} ts={32}>
          {([["LIEN DE L'OFFRE", 137], ["TON CV", 142], ["UNE LETTRE QUI\nN'EST QU'À TOI", 145]] as const).map(([l, i]) => t >= at(i) && (
            <div key={l} style={{ display: "flex", gap: 18, fontFamily: PIX, fontWeight: 700, fontSize: 42, color: i === 145 ? RED : W_, margin: "12px 0", whiteSpace: "pre", lineHeight: 1.15 }}><span style={{ color: PINK }}>✓</span><span>{l}</span></div>
          ))}
        </Win>
      </P>
      {t >= at(147) && <div style={{ position: "absolute", left: X, top: 990, transform: "translateX(-50%)" }}><Gens noms={NOMS.slice(1)} toi t={t} a={at(147) - 0.5} /></div>}
    </>
  );
  if (scene(t, 8)) {
    const k = clamp((t - at(157) - 0.2) / 0.6);
    return (
      <>
        <P t={t} a={PH[8][0] - 0.05} x={X} y={520}>
          <Win title="COMMENTAIRE" w={800} red={false} ts={32}>
            <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 60, color: W_, marginBottom: 18 }}>T'Y AS CRU ?</div>
            <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 30 }}>
              <Tag text="OUI" size={52} style={{ border: `4px solid ${W_}`, background: k >= 1 ? W_ : "transparent", color: k >= 1 ? INK : W_ }} />
              <Tag text="NON" size={52} style={{ border: `4px solid ${W_}`, background: "transparent", color: W_ }} />
              <span style={{ width: 20, height: 56, background: RED, opacity: Math.floor(t * 2.5) % 2 ? 1 : 0 }} />
              {t >= at(157) && <div style={{ position: "absolute", left: 280 - k * 210, top: 50 - k * 25, transform: "scale(1.4)", transformOrigin: "0 0" }}><Curseur /></div>}
            </div>
          </Win>
        </P>
        <P t={t} a={at(153)} x={X} y={790}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Pix rows={ICON.eye} px={10} /><Tag text="SOIS HONNÊTE" size={48} /></div></P>
        <P t={t} a={at(163)} x={X} y={945}><div style={{ padding: "16px 26px", background: PINK, fontFamily: PIX, fontWeight: 700, fontSize: 50, color: W_ }}>1RE LETTRE OFFERTE</div></P>
        <P t={t} a={at(167)} x={X} y={1085}><Tag text="LIEN EN BIO ↑" size={52} /></P>
      </>
    );
  }
  return null;
};

export const BarnumTikTok: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = (t > at(48) - 0.05 && t < at(48) + 0.2) || (t > at(53) && t < at(53) + 0.12);
  return <Ecran t={t} glitch={glitch} audio="audio/barnum.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
