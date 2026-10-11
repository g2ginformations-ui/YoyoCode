// « Le miroir » (≈33 s, 30 i/s, 9:16) — série « effets psycho », univers pixel, cadrée TikTok.
// Accroche « Le recruteur va te préférer… sans savoir pourquoi » → on fait plus confiance à ceux qui nous ressemblent →
// biais de similarité → mêmes mots, « lui, il me comprend » → beaucoup de lettres parlent leur propre langue (tampon) →
// l'offre dit « autonome, orienté client », ta lettre en parle avec une preuve → MyMotiv (il repère leurs vrais besoins,
// ta lettre parle leur langue) → 1re lettre offerte, lien en bio, « le poste que tu vises » en commentaire.
// Voix : voix-miroir.json (--voix yann). Son : synth_miroir.py.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import voix from "./data/miroir-voix.json";
import { Ecran, GREY, ICON, P, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { Tampon } from "./Barnum";
import { BigTT, FinMyMotiv, Mecanisme } from "./fauxdmTT";
import { Bulle, CAP_BOX, Ligne, X, deux } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";

export const MIROIR_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["preferer", "pourquoi", "ressemblent", "similarite", "comprend", "langue", "entreprise", "autonome", "client", "preuve",
  "mymotiv", "besoins", "offerte", "commentaire", "poste"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : MIROIR_DUR + 1);

const COEUR = [".rr.rr.", "rrrrrrr", "rrrrrrr", ".rrrrr.", "..rrr..", "...r..."];
const contour: React.CSSProperties = { background: "transparent", color: W_, border: `4px solid ${GREY}` };
const Duo: React.FC<{ t: number; milieu: React.ReactNode; gauche?: string[]; droite?: string[]; noms?: [string, string] }> = ({ milieu, gauche = ICON.boy, droite = ICON.person, noms = ["RECRUTEUR", "TOI"] }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
    <div style={{ textAlign: "center" }}><Pix rows={gauche} px={16} style={{ margin: "0 auto" }} /><div style={{ marginTop: 8 }}><Tag text={noms[0]} size={28} /></div></div>
    <div>{milieu}</div>
    <div style={{ textAlign: "center" }}><Pix rows={droite} px={gauche === droite ? 16 : 13} style={{ margin: "0 auto" }} /><div style={{ marginTop: 8 }}><Tag text={noms[1]} size={28} /></div></div>
  </div>
);
const Puces: React.FC<{ t: number; mots: [string, number][]; rouge?: number }> = ({ t, mots, rouge = 99 }) => (
  <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
    {mots.map(([m, a]) => t >= a && <Tag key={m} text={m} size={40} red={t >= rouge} style={t >= rouge ? {} : contour} />)}
  </div>
);

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return (
    <>
      <P t={t} a={-0.2} x={X} y={430}><BigTT text={"IL VA TE\nPRÉFÉRER"} size={104} /></P>
      <P t={t} a={-0.2} x={X} y={810}><Duo t={t} milieu={t >= at(4) ? <Pix rows={COEUR} px={14} /> : <BigTT text="?" size={90} color={RED} />} /></P>
      <P t={t} a={at(5)} x={X} y={1090}><Tag text="SANS SAVOIR POURQUOI" red size={40} /></P>
    </>
  );
  if (scene(t, 1)) return (
    <>
      <Mecanisme t={t} a={PH[1][0] - 0.1} aNom={at(20)} avant="LE BIAIS DE" nom="SIMILARITÉ" taille={80} tag={["ON FAIT CONFIANCE À\nCEUX QUI NOUS RESSEMBLENT", at(22) + 0.3]} />
      <P t={t} a={at(14)} x={X} y={1040}><Duo t={t} gauche={ICON.person} droite={ICON.person} noms={["EUX", "NOUS"]} milieu={<BigTT text="=" size={90} color={RED} />} /></P>
    </>
  );
  if (scene(t, 2)) return (
    <>
      <P t={t} a={PH[2][0] - 0.1} x={X} y={450}><Win title="TOI" w={800} ts={30}><Puces t={t} mots={[["MÊMES MOTS", at(23)], ["MÊME FAÇON DE PARLER", at(25)]]} /></Win></P>
      <P t={t} a={at(25) + 0.2} x={X} y={700}><Win title="LUI" w={800} red={false} ts={30}><Puces t={t} mots={[["MÊMES MOTS", at(25) + 0.3], ["MÊME FAÇON DE PARLER", at(28)]]} /></Win></P>
      <P t={t} a={at(34)} x={X} y={1000}><div style={{ display: "flex", alignItems: "center", gap: 20 }}><Pix rows={ICON.brain} px={12} /><Tag text={"« LUI, IL ME\nCOMPREND »"} red size={42} style={deux()} /></div></P>
    </>
  );
  if (scene(t, 3)) return (
    <>
      <P t={t} a={PH[3][0] - 0.1} x={X} y={450}><Win title="L'OFFRE" w={800} ts={30}><Puces t={t} mots={[["AUTONOME", PH[3][0]], ["ORIENTÉ CLIENT", PH[3][0] + 0.1]]} /></Win></P>
      <P t={t} a={at(42)} x={X} y={730}><Win title="LA LETTRE" w={800} red={false} ts={30}><Bulle t={t} a={at(42)} text={"« JE SUIS DYNAMIQUE\nET RIGOUREUX... »"} size={38} /></Win></P>
      {t >= at(47) && <div style={{ position: "absolute", left: X, top: 1050, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="PAS LA MÊME LANGUE" t={t} a={at(47)} size={44} /></div>}
    </>
  );
  if (scene(t, 4)) return (
    <>
      <P t={t} a={PH[4][0] - 0.1} x={X} y={440}><Win title="L'OFFRE" w={800} ts={30}><Puces t={t} mots={[["AUTONOME", PH[4][0]], ["ORIENTÉ CLIENT", PH[4][0] + 0.1]]} rouge={at(56)} /></Win></P>
      <P t={t} a={at(60)} x={X} y={750}>
        <Win title="TA LETTRE" w={800} ts={30}>
          <Ligne t={t} a={at(64)} text="AUTONOMIE → PREUVE" red size={40} />
          <Ligne t={t} a={at(67)} text="CLIENTS → PREUVE" red size={40} />
        </Win>
      </P>
      <P t={t} a={at(70)} x={X} y={1080}><Tag text="MÊME LANGUE ✓" red size={48} /></P>
    </>
  );
  if (scene(t, 5)) return <FinMyMotiv t={t} aLogo={PH[5][0] - 0.1} aWin={at(79)} etapes={[["LIEN DE L'OFFRE", at(81)], ["LEURS VRAIS BESOINS", at(86)], ["TA LETTRE PARLE\nLEUR LANGUE", at(92)]]} aOffre={99} aBio={99} />;
  if (scene(t, 6)) return <CtaCommentaire t={t} aOffre={at(96)} aBio={at(99)} aWin={at(103)} aType={at(108)} label="LE POSTE VISÉ :" />;
  return null;
};

export const Miroir: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = t < 0.18 || (t > at(47) - 0.05 && t < at(47) + 0.2);
  return <Ecran t={t} glitch={glitch} audio="audio/miroir.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
