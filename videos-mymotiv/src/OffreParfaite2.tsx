// « L'offre parfaite » VERSION 2, « qui fait parler » (≈91 s) — même histoire inventée que OffreParfaite (mêmes phrases et
// mêmes temps jusqu'à « Longtemps »), avec 5 déclencheurs de commentaires, sans aucune violence montrée :
// 1. provocation dès l'image 0 : « TOI AUSSI, T'AURAIS POSTULÉ. » ; 2. faute volontaire dans la fausse offre (« EXPÉRIANCE »,
// vrai signe d'arnaque) ; 3. petit sursaut : la silhouette tourne la tête, deux yeux rouges pendant 0,3 s ; 4. fin à théories :
// le lendemain matin, « Merci d'être venue, Camille »… or elle n'y est jamais allée ; 5. CTA « qui est venu à 23 h ? ta théorie
// en commentaire » + le détail de la 1re seconde. Dernière image = première (boucle). Voix : voix-offre2.json. Son : synth_offre2.py.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import voix from "./data/offre2-voix.json";
import { Ecran, P, RED, Tag, Win, makeCaption, show } from "./FauxDM";
import { BigTT } from "./fauxdmTT";
import { CAP_BOX, Ligne, X, deux } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";
import { COUPS_DEBUT, FIN_SCENES_V1, Horloge, Ouverture, SURSAUT, Scenes, Voile } from "./OffreParfaite";

export const OFFRE2_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["parfaite", "peur", "mymotiv", "besoins", "nuit", "proche", "personne", "signature", "masque", "rien", "seule",
  "aucun", "ferme", "longtemps", "venue", "jamais", "venu", "theorie", "detail", "premiere", "seconde", "commentaire", "offerte"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
const TWIST = Math.min(PH[12][0] - 0.15, FIN_SCENES_V1);                         // « Le lendemain matin… »
const BOUCLE = OFFRE2_DUR - 0.5;
const scene = (t: number, i: number) => show(t, PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : OFFRE2_DUR + 1);

const Fin: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 12) || scene(t, 13)) return (
    <>
      <Horloge t={t} a={PH[12][0] - 0.1} h="07:12" />
      {t >= at(184) && <P t={t} a={at(184)} x={X} y={740}>
        <Win title="MESSAGE - NUMÉRO MASQUÉ" w={720} ts={30}>
          <Ligne t={t} a={at(189)} text={"MERCI D'ÊTRE VENUE,\nCAMILLE."} size={44} red />
        </Win>
      </P>}
    </>
  );
  if (scene(t, 14)) return <P t={t} a={at(194)} x={X} y={760}><BigTT text={"ELLE N'Y EST\nJAMAIS ALLÉE."} size={60} color={RED} /></P>;
  if (scene(t, 15)) return (
    <>
      <P t={t} a={PH[15][0] - 0.1} x={X} y={640}><Tag text={"UNE VRAIE OFFRE NE TE\nDEMANDE JAMAIS DE\nNE PRÉVENIR PERSONNE."} red size={40} style={deux()} /></P>
      <P t={t} a={at(210)} x={X} y={900}><Tag text={"LIS CE QU'ELLE\nDEMANDE VRAIMENT."} size={40} style={deux()} /></P>
    </>
  );
  if (scene(t, 16)) return (
    <>
      {t < at(240) && <P t={t} a={at(219)} x={X} y={430}><BigTT text={"QUI EST VENU ?"} size={64} color={RED} /></P>}
      <CtaCommentaire t={t} aOffre={at(240)} aBio={at(243)} aWin={at(225)} aType={at(227)} label={"MA THÉORIE :"} />
    </>
  );
  return null;
};

export const OffreParfaite2: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const coups = [...COUPS_DEBUT, SURSAUT, PH[12][0], at(189), PH[14][0], PH[16][0], BOUCLE];
  const glitch = t < 0.12 || coups.some((c) => t > c - 0.06 && t < c + 0.1) || (t > SURSAUT && t < SURSAUT + 0.3);
  return (
    <Ecran t={t} glitch={glitch} audio="audio/offre2.wav" zoom={1} caption={t >= BOUCLE ? null : <Caption t={t} />}>
      {t >= BOUCLE ? <Ouverture t={t} v2 /> : t < TWIST ? <Scenes t={t} v2 /> : <Fin t={t} />}
      <Voile t={t} fort={scene(t, 14) ? 0.95 : 0.85} />
    </Ecran>
  );
};
