// « La dernière phrase » (≈33 s, 30 i/s, 9:16) — série « effets psycho », univers pixel, cadrée TikTok.
// Accroche « La phrase qu'il retiendra de ta lettre… c'est la dernière » → effet de récence → la fin type « Je vous prie
// d'agréer… salutations distinguées » → « Bravo. Il retient… rien. » → finir sur ce que tu vas leur apporter + proposer un
// échange → MyMotiv (lettre construite sur l'offre, fin sobre qui propose un échange) → 1re lettre offerte, lien en bio,
// « tu finis comment tes lettres ? » en commentaire. Voix : voix-recence.json (--voix yann). Son : synth_recence.py.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import voix from "./data/recence-voix.json";
import { Ecran, GREY, P, PIX, RED, Tag, Win, makeCaption, show } from "./FauxDM";
import { Tampon } from "./Barnum";
import { BigTT, FinMyMotiv, Mecanisme, Recruteur } from "./fauxdmTT";
import { CAP_BOX, Ligne, X, deux } from "./pixelTT";
import { Carres, CtaCommentaire, LettreBarres } from "./pubTT";

export const RECENCE_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["retiendra", "derniere", "recence", "fin", "rien", "apporter", "echange", "mymotiv", "sobre", "offerte", "commentaire"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : RECENCE_DUR + 1);
const FORMULE: [string, number][] = [["« JE VOUS PRIE D'AGRÉER,", 40], ["MADAME, MONSIEUR,", 45], ["L'EXPRESSION DE MES", 48], ["SALUTATIONS", 51], ["DISTINGUÉES »", 52]];

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return (
    <>
      <P t={t} a={-0.2} x={X} y={430}><BigTT text={"LA DERNIÈRE\nPHRASE"} size={78} color={RED} /></P>
      <P t={t} a={-0.2} x={X} y={860}><LettreBarres t={t} avant="derniere" /></P>
    </>
  );
  if (scene(t, 1)) return (
    <>
      <Mecanisme t={t} a={PH[1][0] - 0.1} aNom={at(15)} nom="DE RÉCENCE" taille={80} tag={["ON RETIENT\nSURTOUT LA FIN", at(26)]} />
      {t >= at(30) && <div style={{ position: "absolute", left: X, top: 1030, transform: "translate(-50%, -50%)" }}><Carres n={6} rouge={5} s={80} gap={20} t={t} a={at(30)} big={t >= at(30) + 0.5} /></div>}
    </>
  );
  if (scene(t, 2)) return (
    <P t={t} a={PH[2][0] - 0.1} x={X} y={640}>
      <Win title="LA FIN DE TA LETTRE" w={800} red={false} ts={30}>
        <div style={{ minHeight: 230 }}>
          {FORMULE.map(([l, i]) => t >= at(i) && <div key={l} style={{ fontFamily: PIX, fontWeight: 700, fontSize: 34, color: GREY, lineHeight: 1.3, whiteSpace: "pre" }}>{l}</div>)}
        </div>
      </Win>
    </P>
  );
  if (scene(t, 3)) return (
    <>
      <P t={t} a={at(54)} x={X} y={420}><Tag text="BRAVO." size={60} /></P>
      <P t={t} a={PH[3][0]} x={X} y={720}><Recruteur zzz /></P>
      {t >= at(57) && <div style={{ position: "absolute", left: X, top: 1030, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="RETENU : RIEN" t={t} a={at(57)} size={60} /></div>}
    </>
  );
  if (scene(t, 4)) return (
    <>
      <P t={t} a={PH[4][0] - 0.1} x={X} y={560}>
        <Win title="TA FIN DE LETTRE" w={800} ts={30}>
          <Ligne t={t} a={at(60)} text={"CE QUE TU VAS\nLEUR APPORTER"} red size={42} />
          <Ligne t={t} a={at(69)} text={"UN ÉCHANGE\nPROPOSÉ"} size={42} />
        </Win>
      </P>
      <P t={t} a={PH[4][0]} x={X - 230} y={1010}><Recruteur alerte={t >= at(74)} /></P>
      <P t={t} a={at(74)} x={X + 150} y={1020}><Tag text={"IL RETIENT\nÇA"} red size={46} style={deux()} /></P>
    </>
  );
  if (scene(t, 5)) return <FinMyMotiv t={t} aLogo={PH[5][0] - 0.1} aWin={at(85)} etapes={[["CONSTRUITE\nSUR L'OFFRE", at(87)], ["UNE FIN SOBRE", at(93)], ["QUI PROPOSE\nUN ÉCHANGE", at(96)]]} aOffre={99} aBio={99} />;
  if (scene(t, 6)) return <CtaCommentaire t={t} aOffre={at(99)} aBio={at(102)} aWin={at(105)} aType={at(111)} label={"TA DERNIÈRE\nPHRASE :"} />;
  return null;
};

export const Recence: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = t < 0.18 || (t > at(57) - 0.05 && t < at(57) + 0.2);
  return <Ecran t={t} glitch={glitch} audio="audio/recence.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
