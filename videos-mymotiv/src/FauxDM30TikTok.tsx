// « Le faux DM » en 30 s, version cadrée pour TikTok (≈33 s, 30 i/s, 9:16). Même voix, même son et même déroulé que
// FauxDM30.tsx, mais tout dans les zones sûres de src/tiktok.ts, texte agrandi, sous-titres dans le tiers bas.
// Mêmes garde-fous : aucune photo ni ressemblance (silhouette générique), révélation « tout est faux » dans la vidéo.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import voix from "./data/fauxdm30-voix.json";
import { Ecran, ICON, P, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { FAUXDM30_DUR } from "./FauxDM30";
import { Deal, FinMyMotiv, FinScience, Lecture, Mecanisme, Message, Notif, Recruteur, ToutEstFaux } from "./fauxdmTT";
import { Bulle, CAP_BOX, X } from "./pixelTT";

const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const Caption = makeCaption(voix, undefined, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : FAUXDM30_DUR + 1);

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return <Notif t={t} hauts={[["1 NOUVEAU MESSAGE", -0.2, true]]} aEnv={at(5)} aFel={at(12)} />;
  if (scene(t, 1)) return (
    <>
      <Message t={t} a={PH[1][0] - 0.1} y={500} lignes={[["SUPPRIME TA VIDÉO.", at(17), true]]} />
      {t >= at(19) && <P t={t} a={at(19)} x={X + 300} y={700}><Pix rows={ICON.trash} px={12} /></P>}
      <P t={t} a={at(22)} x={X} y={930}>
        <Win title="MA VIDÉO" w={800} ts={30}>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}><Pix rows={ICON.play} px={18} /><div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 38, color: W_, lineHeight: 1.25, whiteSpace: "pre" }}>{"LA LETTRE DE\nMOTIVATION"}<br />{t >= at(24) ? <span style={{ color: RED }}>DE SQUEEZIE</span> : " "}</div></div>
        </Win>
      </P>
    </>
  );
  if (scene(t, 2)) return (
    <>
      {t >= at(27) && <div style={{ position: "absolute", left: X, top: 370, transform: "translateX(-50%)", display: "flex", gap: 16 }}>{["J+1", "J+2", "J+3", "J+4"].map((d, k) => <div key={d} style={{ opacity: t >= at(27) + k * 0.12 ? 1 : 0 }}><Tag text={d} red={k === 3} size={44} /></div>)}</div>}
      <P t={t} a={at(30)} x={X} y={640}>
        <Win title="DM N°2 · SQUEEZIE" w={800} ts={30}><Bulle t={t} a={at(32)} text="JE M'EXCUSE." size={48} /></Win>
      </P>
      <P t={t} a={at(37)} x={X} y={960}><Tag text="UN DEAL ?" red size={76} /></P>
    </>
  );
  if (scene(t, 3)) return (
    <Deal t={t} titre="LE DEAL" a={PH[3][0] - 0.1} y={700} lignes={[
      { s: "1. TU FAIS UNE VIDÉO ▶", a: at(39) },
      { s: "2. TU MENS DE A À Z", a: at(44), red: true, barre: true },
      { s: "3. ON RESTE JUSQU'AU BOUT", a: at(50), barre: true },
    ]} />
  );
  if (scene(t, 4)) return <ToutEstFaux t={t} a={at(57)} aEye={at(60)} />;
  if (scene(t, 5)) return <Mecanisme t={t} a={PH[5][0] - 0.1} aNom={at(68)} nom="ZEIGARNIK" tag={["HISTOIRE PAS FINIE", at(70)]} aCerveau={at(75)} aCadenas={at(78)} />;
  if (scene(t, 6)) {
    const ouvre = at(85), enjeu = at(90);
    return (
      <>
        <P t={t} a={PH[6][0] - 0.1} x={X} y={540}>
          <Win title="LETTRE DE MOTIVATION" w={800} red={t >= ouvre} ts={30}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <Bulle t={t} a={PH[6][0]} text={"« JE ME PERMETS\nDE VOUS... »"} size={38} />
              {t >= ouvre && <svg width={560} height={140} style={{ position: "absolute", left: -10, top: 0 }}><path d={`M0 74 L${Math.round(Math.min(1, (t - ouvre) / 0.2) * 4) / 4 * 540} 60`} stroke={RED} strokeWidth={10} /></svg>}
            </div>
            <div><Bulle t={t} a={enjeu} text="UN VRAI ENJEU." red size={46} /></div>
          </Win>
        </P>
        <P t={t} a={at(81)} x={X - 230} y={990}><Recruteur zzz={t >= at(81) + 0.4 && t < enjeu} /></P>
        <P t={t} a={at(93)} x={X + 150} y={1000}><Lecture t={t} a={at(93)} /></P>
      </>
    );
  }
  if (scene(t, 7)) return <FinMyMotiv t={t} aLogo={PH[7][0] - 0.1} aWin={at(104)} etapes={[["LIEN DE L'OFFRE", at(104) + 0.25], ["TON CV", at(104) + 0.47], ["UNE LETTRE QUI\nACCROCHE", at(104) + 0.69]]} aOffre={at(105)} aBio={at(108)} />;
  if (scene(t, 8)) return <FinScience t={t} a={PH[8][0]} aDesole={at(113)} aScience={at(116)} />;
  return null;
};

export const FauxDM30TikTok: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = t > Wt(57) - 0.1 && t < Wt(57) + 0.25;
  return <Ecran t={t} glitch={glitch} audio="audio/fauxdm30.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
