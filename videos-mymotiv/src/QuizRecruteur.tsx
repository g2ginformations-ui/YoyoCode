// « Le jeu du recruteur » (≈1 min 05, 30 i/s, 9:16) — univers pixel, cadrée TikTok dès le départ (zones sûres src/tiktok.ts).
// Quiz : « Je suis recruteur. Aujourd'hui c'est toi qui recrutes : 3 duels, tu gardes une seule lettre. » → 3 duels A/B
// (la 1re phrase, la preuve, la fin) avec compte à rebours de 3 s, puis la réponse (toujours la B) et la règle → twist
// « 3 sur 3 ? Normal… mais au moment d'écrire la sienne, on retombe dans la A » → MyMotiv écrit la B → CTA « ton score sur 3
// en commentaire » + 1re lettre offerte, lien en bio. Voix : voix-duels.json (--voix yann). Son : synth_duels.py.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./common";
import voix from "./data/duels-voix.json";
import { Ecran, GREY, ICON, P, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { Tampon } from "./Barnum";
import { BigTT, FinMyMotiv } from "./fauxdmTT";
import { Bulle, CAP_BOX, X, deux } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";

export const QUIZ_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["recruteur", "toi", "duels", "seule", "enjeu", "partout", "preuve", "rien", "resultat", "echange", "oublie", "normal",
  "probleme", "retombe", "mymotiv", "preuves", "score", "commentaire", "offerte"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
// scènes : intro, duel 1 (question + réponse), duel 2, duel 3, « 3 sur 3 ? », retour à la A, MyMotiv, CTA
const DEB = [-1, PH[1][0] - 0.15, PH[3][0] - 0.15, PH[5][0] - 0.15, PH[7][0] - 0.15, PH[8][0] - 0.15, PH[9][0] - 0.15, PH[10][0] - 0.15];
const scene = (t: number, i: number) => show(t, DEB[i], i + 1 < DEB.length ? DEB[i + 1] : QUIZ_DUR + 1);
const enQuestion = (t: number) => [1, 3, 5].some((q) => t >= PH[q][0] - 0.1 && t < PH[q + 1][0] - 0.05);

type Duel = { n: number; theme: string; A: string; B: string; q: number; aCartes: number; aB: number; aPerd: number; tampon: string; aGagne: number; regle: string; aRegle: number };
const DUELS: Duel[] = [
  { n: 1, theme: "LA 1RE PHRASE", A: "« JE ME PERMETS DE VOUS\nADRESSER MA CANDIDATURE. »", B: "« VOTRE BOUTIQUE OUVRE À\nLYON : IL VOUS FAUDRA DES\nCLIENTS DÈS LE 1ER MOIS. »",
    q: 1, aCartes: at(20), aB: at(22), aGagne: at(30), aPerd: at(40), tampon: "DÉJÀ VUE PARTOUT", regle: "LEUR ENJEU D'ABORD", aRegle: at(35) },
  { n: 2, theme: "LA PREUVE", A: "« JE SUIS DYNAMIQUE,\nRIGOUREUX ET MOTIVÉ. »", B: "« EN ALTERNANCE, J'AI\nRELANCÉ 40 CLIENTS\nINACTIFS. 12 ONT\nRECOMMANDÉ. »",
    q: 3, aCartes: at(49), aB: at(50), aGagne: at(56), aPerd: at(58), tampon: "ZÉRO PREUVE", regle: "1 PREUVE > 3 ADJECTIFS", aRegle: at(64) },
  { n: 3, theme: "LA FIN", A: "« JE VOUS PRIE D'AGRÉER\nMES SALUTATIONS\nDISTINGUÉES. »", B: "« JE PEUX VOUS MONTRER\nCOMMENT JE M'Y PRENDRAIS :\nON EN PARLE CETTE\nSEMAINE ? »",
    q: 5, aCartes: at(69), aB: at(70), aGagne: at(78), aPerd: at(85), tampon: "OUBLIÉE", regle: "FINIR SUR UN ÉCHANGE", aRegle: at(83) },
];

const Carte: React.FC<{ t: number; lettre: string; texte: string; perdue?: number; gagnee?: number; tampon?: string }> = ({ t, lettre, texte, perdue = 99, gagnee = 99, tampon }) => {
  const g = t >= gagnee, p = t >= perdue;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ opacity: p ? 0.45 : 1, boxShadow: g ? "0 0 40px rgba(232,38,43,0.7)" : undefined }}>
        <Win title={`LETTRE ${lettre}`} w={800} red={g} ts={30}>
          <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 34, lineHeight: 1.25, color: p ? GREY : W_, whiteSpace: "pre" }}>{texte}</div>
        </Win>
      </div>
      {g && <div style={{ position: "absolute", right: 24, top: -34 }}><Tag text="✓ GARDÉE" red size={34} /></div>}
      {p && tampon && <div style={{ position: "absolute", left: "50%", top: "55%", transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text={tampon} t={t} a={perdue} size={48} /></div>}
    </div>
  );
};

const ScDuel: React.FC<{ t: number; d: Duel }> = ({ t, d }) => {
  const c0 = PH[d.q][1] + 0.05, c1 = PH[d.q + 1][0] - 0.05, compte = t >= c0 && t < c1;
  const n = 3 - Math.floor(((t - c0) / (c1 - c0)) * 3);
  return (
    <>
      <P t={t} a={PH[d.q][0] - 0.1} x={X} y={345}><div style={{ display: "flex", alignItems: "center", gap: 20 }}><Tag text={`DUEL ${d.n}/3`} red size={44} /><Tag text={d.theme} size={38} /></div></P>
      <P t={t} a={d.aCartes} x={X} y={590}><Carte t={t} lettre="A" texte={d.A} perdue={d.aPerd} tampon={d.tampon} /></P>
      <P t={t} a={d.aB} x={X} y={885}><Carte t={t} lettre="B" texte={d.B} gagnee={d.aGagne} /></P>
      {compte && (
        <div style={{ position: "absolute", left: X, top: 1105, transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 34, color: W_, whiteSpace: "nowrap" }}>A OU B ?</span>
          <div style={{ width: 380, height: 36, border: `5px solid ${W_}` }}><div style={{ width: `${Math.round((1 - clamp((t - c0) / (c1 - c0))) * 12) / 12 * 100}%`, height: "100%", background: RED }} /></div>
          <BigTT text={String(Math.max(1, n))} size={64} color={RED} />
        </div>
      )}
      {t >= d.aRegle && <P t={t} a={d.aRegle} x={X} y={1105}><Tag text={d.regle} red size={40} /></P>}
    </>
  );
};

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return (
    <>
      <P t={t} a={-0.2} x={X} y={430}><BigTT text={"C'EST TOI\nLE RECRUTEUR"} size={76} color={RED} /></P>
      <P t={t} a={-0.2} x={X} y={770}><div style={{ textAlign: "center" }}><Pix rows={ICON.boy} px={20} style={{ margin: "0 auto" }} /><div style={{ marginTop: 12 }}><Tag text="TOI" red size={40} /></div></div></P>
      <P t={t} a={at(10)} x={X} y={1000}><Tag text="3 DUELS" red size={64} /></P>
      <P t={t} a={at(15)} x={X} y={1110}><Tag text="1 SEULE LETTRE GARDÉE" size={38} /></P>
    </>
  );
  for (let k = 0; k < 3; k++) if (scene(t, k + 1)) return <ScDuel t={t} d={DUELS[k]} />;
  if (scene(t, 4)) return (
    <>
      <P t={t} a={at(90)} x={X} y={580}><BigTT text="3/3 ?" size={190} color={RED} /></P>
      <P t={t} a={at(93)} x={X} y={850}><Tag text="NORMAL." size={64} /></P>
      <P t={t} a={at(98)} x={X} y={1060}><Tag text={"TOUT LE MONDE\nRECONNAÎT LA B"} size={42} style={deux()} /></P>
    </>
  );
  if (scene(t, 5)) return (
    <>
      <P t={t} a={at(102)} x={X} y={420}><Tag text="MAIS QUAND TU ÉCRIS..." size={40} /></P>
      <P t={t} a={at(109)} x={X} y={680}><Win title="TA LETTRE" w={800} red={false} ts={30}><Bulle t={t} a={at(109)} text={"« JE ME PERMETS DE\nVOUS ADRESSER... »"} size={40} /></Win></P>
      {t >= at(115) && <div style={{ position: "absolute", left: X, top: 990, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="RETOUR À LA A" t={t} a={at(115)} size={64} /></div>}
    </>
  );
  if (scene(t, 6)) return <FinMyMotiv t={t} aLogo={PH[9][0] - 0.1} aWin={at(124)} etapes={[["IL ÉCRIT LA B", at(126)], ["LEURS BESOINS", at(132)], ["TES VRAIES PREUVES", at(138)], ["UNE FIN QUI\nPROPOSE UN ÉCHANGE", at(144)]]} aOffre={99} aBio={99} />;
  if (scene(t, 7)) return <CtaCommentaire t={t} aOffre={at(156)} aBio={at(160)} aWin={at(146)} aType={at(151)} label={"MON SCORE :\n? / 3"} />;
  return null;
};

export const QuizRecruteur: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const coups = [at(40), at(58), at(85), at(115), at(90)];
  const glitch = t < 0.18 || coups.some((c) => t > c - 0.05 && t < c + 0.18);
  return <Ecran t={t} glitch={glitch} audio="audio/duels.wav" zoom={1} caption={enQuestion(t) ? null : <Caption t={t} />}><Scenes t={t} /></Ecran>;
};
