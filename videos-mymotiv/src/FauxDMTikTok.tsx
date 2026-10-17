// « Le faux DM », version cadrée pour TikTok (≈1 min 46, 30 i/s, 9:16). Même voix, même son et même déroulé que
// FauxDM.tsx, mais tout dans les zones sûres de src/tiktok.ts, texte agrandi, sous-titres dans le tiers bas, moins
// d'éléments par écran. Mêmes garde-fous : aucune photo ni ressemblance, révélation « tout est faux » dans la vidéo.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./common";
import voix from "./data/fauxdm-voix.json";
import { Avatar, Ecran, FAUXDM_DUR, GREY, ICON, INK, P, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { BigTT, Deal, FinMyMotiv, FinScience, Lecture, Mecanisme, Message, Notif, Recruteur, ToutEstFaux } from "./fauxdmTT";
import { Bulle, CAP_BOX, X, deux } from "./pixelTT";

const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const Caption = makeCaption(voix, undefined, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : FAUXDM_DUR + 1);
const Curseur: React.FC = () => <svg width={44} height={60}><path d="M0 0 L0 48 L12 38 L20 58 L28 54 L20 34 L36 34 Z" fill={W_} stroke={INK} strokeWidth={3} /></svg>;
const icone = (t: number, rows: string[], label: string, a: number, x: number, red?: boolean) => (
  <P t={t} a={a} x={x} y={560}><div style={{ textAlign: "center" }}><div style={{ border: `4px solid ${GREY}`, padding: 14, display: "inline-block" }}><Pix rows={rows} px={12} /></div><div style={{ marginTop: 12 }}><Tag text={label} size={30} red={red} style={deux()} /></div></div></P>
);

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return <Notif t={t} hauts={[["1 NOUVEAU MESSAGE", -0.2, true], ["IL Y A 7 JOURS", at(10)]]} aEnv={at(4)} aFel={at(16)} />;
  if (scene(t, 1)) {
    const bars = [0.2, 0.3, 0.28, 0.45, 0.6, 0.85, 1];
    return (
      <>
        <P t={t} a={at(25)} x={X} y={360}><Tag text="DÉBUT OCTOBRE" size={42} /></P>
        <P t={t} a={at(28)} x={X} y={610}>
          <Win title="MA VIDÉO" w={800} ts={30}>
            <div style={{ display: "flex", alignItems: "center", gap: 28 }}><Pix rows={ICON.play} px={18} /><div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 38, color: W_, lineHeight: 1.25, whiteSpace: "pre" }}>{t >= at(35) ? "LA LETTRE DE\nMOTIVATION" : "...\n "}<br />{t >= at(39) ? <span style={{ color: RED }}>DE SQUEEZIE</span> : " "}</div></div>
          </Win>
        </P>
        {t >= at(48) && (
          <div style={{ position: "absolute", left: X - 330, top: 880, display: "flex", alignItems: "flex-end", gap: 16, height: 220 }}>
            {bars.map((h, k) => { const kk = clamp((t - at(48) - k * 0.08) / 0.25); return <div key={k} style={{ width: 56, height: Math.round(h * kk * 8) / 8 * 210, background: k === bars.length - 1 ? RED : "#5A4A48" }} />; })}
            <Tag text="VUES ▲" red size={36} style={{ marginLeft: 14 }} />
          </div>
        )}
      </>
    );
  }
  if (scene(t, 2)) return (
    <>
      <Message t={t} a={PH[2][0] - 0.1} y={560} lignes={[["SUPPRIME TA VIDÉO.", at(62), true], ["ÇA NUIT À MON IMAGE.", at(70)]]} />
      {t >= at(65) && <P t={t} a={at(65)} x={X + 290} y={930}><Pix rows={ICON.trash} px={13} /></P>}
    </>
  );
  if (scene(t, 3)) return (
    <>
      <P t={t} a={PH[3][0]} x={X} y={390}><Pix rows={ICON.scales} px={18} /></P>
      <P t={t} a={at(86)} x={X - 190} y={560}><Tag text="HUMOUR" size={44} /></P>
      <P t={t} a={at(91)} x={X + 190} y={560}><Tag text="✓ LÉGAL" red size={44} /></P>
      <P t={t} a={at(92)} x={X} y={810}>
        <Win title="MA RÉPONSE" w={800} red={false} ts={30}>
          <Bulle t={t} a={at(94)} text="C'EST DE L'HUMOUR." size={40} /><br />
          <Bulle t={t} a={at(94) + 0.6} text="ET C'EST LÉGAL :)" size={40} />
        </Win>
      </P>
      <P t={t} a={at(99)} x={X} y={1090}><Tag text="AUCUNE RÉPONSE" red size={50} /></P>
    </>
  );
  if (scene(t, 4)) return (
    <>
      <P t={t} a={at(113)} x={X + 150} y={470}><div style={{ position: "relative" }}><Pix rows={ICON.envelope} px={22} /><div style={{ position: "absolute", left: "50%", top: -58, transform: "translateX(-50%)", whiteSpace: "nowrap" }}><Tag text="CABINET D'AVOCATS" size={30} /></div></div></P>
      <P t={t} a={at(115) + 0.2} x={X + 150} y={700}><Tag text="MISE EN DEMEURE" red size={40} /></P>
      <P t={t} a={PH[4][0]} x={X - 250} y={690}><div style={{ textAlign: "center" }}><Pix rows={ICON.boy} px={18} style={{ margin: "0 auto" }} /><div style={{ marginTop: 10 }}><Tag text="MOI" size={34} /></div></div></P>
      <P t={t} a={at(117)} x={X} y={1010}><Tag text={"MOTIF : UNE LETTRE\nDE MOTIVATION"} red size={42} style={deux()} /></P>
    </>
  );
  if (scene(t, 5)) return (
    <>
      <P t={t} a={at(123)} x={X} y={470}><div style={{ border: `8px solid ${RED}`, padding: "22px 46px", textAlign: "center", transform: `translate(${Math.sin(t * 50) * 3}px, 0)` }}><BigTT text="PLOT" size={110} /><BigTT text="TWIST" size={110} color={RED} /></div></P>
      {t >= at(126) && <div style={{ position: "absolute", left: X, top: 690, transform: "translateX(-50%)", display: "flex", gap: 16 }}>{["J+1", "J+2", "J+3", "J+4"].map((d, k) => <div key={d} style={{ opacity: t >= at(126) + k * 0.15 ? 1 : 0 }}><Tag text={d} red={k === 3} size={44} /></div>)}</div>}
      <P t={t} a={at(130)} x={X} y={890}><Win title="DM N°2" w={640} ts={30}><div style={{ display: "flex", alignItems: "center", gap: 16 }}><Pix rows={ICON.person} px={5} /><span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 38, color: W_ }}>SQUEEZIE</span></div></Win></P>
      <P t={t} a={at(135)} x={X} y={1095}><Tag text="CHANGEMENT D'AMBIANCE" size={36} /></P>
    </>
  );
  if (scene(t, 6)) return (
    <Message t={t} titre="DM N°2 · SQUEEZIE" a={PH[6][0] - 0.1} y={700} size={40} lignes={[["JE M'EXCUSE.", at(140)], ["J'AI RÉAGI À CHAUD.", at(146)], ["J'AI REGARDÉ LA VIDÉO.", at(154)], ["TROP DRÔLE.", at(161), true]]} />
  );
  if (scene(t, 7)) return (
    <>
      <P t={t} a={at(166)} x={X} y={480}><Tag text="C'EST PAS FINI" size={64} /></P>
      <P t={t} a={at(176)} x={X} y={820}><Win title="PROPOSITION" w={800} ts={32}><div style={{ height: 180 }} /></Win></P>
    </>
  );
  if (scene(t, 8)) return (
    <Deal t={t} titre="PROPOSITION" a={PH[8][0] - 0.1} y={690} lignes={[
      { s: "1. TU FAIS UNE VIDÉO ▶", a: at(180) },
      { s: "2. TU MENS DE A À Z", a: at(185), red: true, barre: true },
      { s: "3. ON RESTE JUSQU'À LA FIN", a: at(196), barre: true },
      { s: "+ FIGURE D'AUTORITÉ", a: at(210), icone: ICON.crown },
      { s: "+ ENJEU FORT !", a: at(215) },
    ]} fin={["→ IL LA PARTAGE EN STORY", at(219)]} />
  );
  if (scene(t, 9)) {
    const reveal = at(238);
    if (t < at(227)) {
      const k = clamp((t - PH[9][0]) / 0.6);
      return <P t={t} a={PH[9][0]} x={X} y={720}><div style={{ position: "relative" }}><Tag text="ACCEPTER" size={72} style={{ border: `6px solid ${W_}` }} /><div style={{ position: "absolute", right: -70, bottom: -80, transform: `translate(${(1 - k) * 140}px, ${(1 - k) * 140}px) scale(1.6)`, transformOrigin: "0 0" }}><Curseur /></div></div></P>;
    }
    if (t < reveal) return <P t={t} a={at(227)} x={X} y={700}><Avatar t={t} size={360} ns={40} name="SQUEEZIE ?" cross={clamp((t - at(232)) / 0.2)} /></P>;
    return <ToutEstFaux t={t} a={reveal} aEye={at(244)} />;
  }
  if (scene(t, 10)) return (
    <>
      {t < at(254) && <P t={t} a={PH[10][0]} x={X} y={700}><div style={{ display: "flex", gap: 18 }}><Tag text="CRÉDULE ?" size={56} style={{ border: `5px solid ${W_}`, background: "transparent", color: W_ }} />{t >= at(252) && <Tag text="NON." red size={56} />}</div></P>}
      {t >= at(254) && <>
        {icone(t, ICON.boy, "UN\nINCONNU", at(259), X - 260)}
        {icone(t, ICON.envelope, "FORT\nENJEU", at(264), X)}
        {icone(t, ICON.crown, "AUTORITÉ", at(269), X + 260, true)}
        <P t={t} a={at(273)} x={X} y={890}><div style={{ display: "flex", alignItems: "center", gap: 22 }}><Pix rows={ICON.brain} px={13} /><Tag text="TON CERVEAU" size={48} /></div></P>
        <P t={t} a={at(278)} x={X} y={1050}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Pix rows={ICON.lock} px={11} /><Tag text="OBLIGÉ DE RESTER" red size={44} /></div></P>
      </>}
    </>
  );
  if (scene(t, 11)) return <Mecanisme t={t} a={PH[11][0]} aNom={at(288)} nom="ZEIGARNIK" tag={["HISTOIRE PAS FINIE =\nCERVEAU ACCROCHÉ", at(290)]} />;
  if (scene(t, 12)) return (
    <>
      <P t={t} a={PH[12][0]} x={X} y={560}>
        <Win title="LETTRE DE MOTIVATION" w={800} red={false} ts={30}>
          <Bulle t={t} a={at(310)} text={"« JE ME PERMETS DE VOUS\nADRESSER MA\nCANDIDATURE... »"} size={36} />
        </Win>
      </P>
      <P t={t} a={at(301)} x={X - 230} y={990}><Recruteur zzz={t >= at(321)} /></P>
      <P t={t} a={at(322)} x={X + 170} y={1000}><Tag text="DÉCROCHE" red size={52} /></P>
    </>
  );
  if (scene(t, 13)) return (
    <>
      <P t={t} a={PH[13][0]} x={X} y={580}>
        <Win title="LETTRE DE MOTIVATION" w={800} ts={30}>
          <Bulle t={t} a={at(334)} text="UN VRAI ENJEU." red size={44} /><br />
          <Bulle t={t} a={at(336)} text="LEUR PROBLÈME." size={44} /><br />
          <Bulle t={t} a={at(339)} text="TON HISTOIRE." size={44} />
        </Win>
      </P>
      <P t={t} a={at(340)} x={X} y={1030}><Lecture t={t} a={at(340)} w={620} /></P>
    </>
  );
  if (scene(t, 14)) return <FinMyMotiv t={t} aLogo={at(352)} aWin={at(353)} etapes={[["LIEN DE L'OFFRE", at(356)], ["TON CV", at(361)], ["UNE LETTRE QUI\nACCROCHE", at(366)]]} aOffre={at(372)} aBio={at(376)} />;
  if (scene(t, 15)) return <FinScience t={t} a={PH[15][0]} aDesole={at(384)} aScience={at(387)} />;
  return null;
};

export const FauxDMTikTok: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = (t > Wt(238) - 0.1 && t < Wt(238) + 0.25) || (t > Wt(123) - 0.1 && t < Wt(123) + 0.15);
  return <Ecran t={t} glitch={glitch} audio="audio/fauxdm.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
