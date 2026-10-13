// « Suis ton instinct » (≈57 s, 30 i/s, 9:16) — défi en 3 choix A / B, univers pixel, cadrée TikTok (zones sûres src/tiktok.ts).
// Chaque « bon » choix est le VRAI parcours du propriétaire, sans parler de lui avant la fin : 1er stage (A : cabinet de
// recrutement → 12 rendez-vous qualifiés en 3 mois), alternance (B : agence toute neuve → 100 comptes clients ouverts),
// la suite (B : master en stratégie + son propre outil → MyMotiv). Compte à rebours de 3 s à chaque fois. Révélation :
// « Ce parcours, c'est le mien. J'ai 24 ans… dans deux ans, je me vois ouvrir ma première agence de recrutement », avec sa
// photo en mosaïque pixel qui « respire » avec la voix : 6 versions de la plus floue à la moins floue (public/moi/portrait-0…5.png,
// tools/portrait-niveaux.py ; même la plus nette garde le visage méconnaissable, l'original n'est jamais dans le dépôt),
// pilotées par l'enveloppe de la voix (src/data/instinct-env.json, tools/enveloppe-voix.py) : plus nette sur les syllabes
// fortes, plus floue dans les pauses et les respirations. CTA « ton score sur 3 en commentaire » + 1re lettre offerte. Voix : voix-instinct.json (--voix yann). Son : synth_instinct.py.
import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./common";
import voix from "./data/instinct-voix.json";
import enveloppe from "./data/instinct-env.json";
import { Ecran, GREY, ICON, P, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { BigTT } from "./fauxdmTT";
import { CAP_BOX, X, deux } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";

export const INSTINCT_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["instinct", "trois", "go", "cabinet", "drh", "marketing", "douze", "qualifies", "agence", "neuve", "seul", "cent",
  "ouverts", "cdi", "master", "outil", "mymotiv", "mien", "vingtquatre", "premiere", "recrutement", "score", "commentaire", "offerte"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
// la photo qui respire : niveau de netteté de 0,4 (pause, respiration) à 5 (syllabe forte), fondu entre deux versions voisines
const NIV = 6;
const nettete = (t: number) => { const e = enveloppe.env[Math.min(enveloppe.env.length - 1, Math.max(0, Math.round(t * enveloppe.fps)))] ?? 0; return 0.4 + 4.6 * Math.pow(e, 1.6); };
const PortraitVivant: React.FC<{ t: number; w: number }> = ({ t, w }) => {
  const L = Math.min(NIV - 1, nettete(t)), i = Math.floor(L), f = L - i, h = w * 1.25;
  const img = (k: number, o: number) => <Img key={k} src={staticFile(`moi/portrait-${k}.png`)} style={{ position: "absolute", left: 0, top: 0, width: w, height: h, imageRendering: "pixelated", opacity: o }} />;
  return <div style={{ position: "relative", width: w, height: h }}>{img(i, 1)}{i + 1 < NIV && f > 0.02 && img(i + 1, f)}</div>;
};
// scènes : accroche, défi 1 (question + réponse), défi 2, défi 3, révélation, CTA
const DEB = [-1, PH[1][0] - 0.15, PH[3][0] - 0.15, PH[5][0] - 0.15, PH[7][0] - 0.15, PH[8][0] - 0.15];
const scene = (t: number, i: number) => show(t, DEB[i], i + 1 < DEB.length ? DEB[i + 1] : INSTINCT_DUR + 1);
const enQuestion = (t: number) => [1, 3, 5].some((q) => t >= PH[q][0] - 0.1 && t < PH[q + 1][0] - 0.05);

type Defi = { n: number; theme: string; A: string; B: string; q: number; aA: number; aB: number; choix: "A" | "B"; aChoix: number; resultat: React.ReactNode; aRes: number };
const DEFIS: Defi[] = [
  { n: 1, theme: "1ER STAGE", A: "CABINET DE\nRECRUTEMENT\n+ APPELS AUX DRH", B: "STAGE TRANQUILLE\nEN MARKETING", q: 1, aA: at(11), aB: at(21), choix: "A", aChoix: at(32),
    resultat: <Tag text={"12 RDV QUALIFIÉS\nEN 3 MOIS"} red size={44} style={deux()} />, aRes: at(35) },
  { n: 2, theme: "L'ALTERNANCE", A: "GRANDE ENTREPRISE\nBIEN INSTALLÉE", B: "AGENCE TOUTE NEUVE\nTON SECTEUR, SEUL", q: 3, aA: at(44), aB: at(50), choix: "B", aChoix: at(65),
    resultat: <Tag text={"100 COMPTES\nCLIENTS OUVERTS"} red size={44} style={deux()} />, aRes: at(67) },
  { n: 3, theme: "LA SUITE", A: "UN CDI, ET ON\nN'EN PARLE PLUS", B: "MASTER EN STRATÉGIE\n+ TON PROPRE OUTIL", q: 5, aA: at(74), aB: at(83), choix: "B", aChoix: at(97),
    resultat: <div style={{ filter: "drop-shadow(0 0 24px rgba(217,130,139,0.8))" }}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 420 }} /></div>, aRes: at(102) },
];

// une carte de choix : gagnante (cadre rouge + lueur + « ✓ INSTINCT ») ou écartée (grisée)
const Choix: React.FC<{ t: number; lettre: string; texte: string; garde: boolean; a: number }> = ({ t, lettre, texte, garde, a }) => {
  const fini = t >= a, on = fini && garde, off = fini && !garde;
  return (
    <div style={{ position: "relative" }}>
      <div style={{ opacity: off ? 0.4 : 1, boxShadow: on ? "0 0 44px rgba(232,38,43,0.75)" : undefined }}>
        <Win title={`CHOIX ${lettre}`} w={800} red={on} ts={30}>
          <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 40, lineHeight: 1.15, color: off ? GREY : W_, whiteSpace: "pre" }}>{texte}</div>
        </Win>
      </div>
      {on && <div style={{ position: "absolute", right: 24, top: -34 }}><Tag text="✓ INSTINCT" red size={36} /></div>}
    </div>
  );
};

const ScDefi: React.FC<{ t: number; d: Defi }> = ({ t, d }) => {
  const c0 = PH[d.q][1] + 0.05, c1 = PH[d.q + 1][0] - 0.05, compte = t >= c0 && t < c1;
  const n = 3 - Math.floor(((t - c0) / (c1 - c0)) * 3);
  const yA = d.A.split("\n").length > 2 ? 590 : 600;
  return (
    <>
      <P t={t} a={PH[d.q][0] - 0.15} x={X} y={345}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Tag text={`DÉFI ${d.n}/3`} red size={44} /><Tag text={d.theme} size={40} /></div></P>
      <P t={t} a={d.aA} x={X} y={yA}><Choix t={t} lettre="A" texte={d.A} garde={d.choix === "A"} a={d.aChoix} /></P>
      <P t={t} a={d.aB} x={X} y={865}><Choix t={t} lettre="B" texte={d.B} garde={d.choix === "B"} a={d.aChoix} /></P>
      {compte && (
        <div style={{ position: "absolute", left: X, top: 1095, transform: "translate(-50%, -50%)", display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 40, color: W_, whiteSpace: "nowrap" }}>A OU B ?</span>
          <div style={{ width: 360, height: 38, border: `5px solid ${W_}` }}><div style={{ width: `${Math.round((1 - clamp((t - c0) / (c1 - c0))) * 12) / 12 * 100}%`, height: "100%", background: RED }} /></div>
          <BigTT text={String(Math.max(1, n))} size={64} color={RED} />
        </div>
      )}
      <P t={t} a={d.aRes} x={X} y={1092}>{d.resultat}</P>
    </>
  );
};

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return (
    <>
      <P t={t} a={-0.2} x={X} y={330}><Tag text="DÉFI" red size={48} /></P>
      <P t={t} a={-0.2} x={X} y={480}><BigTT text={"SUIS TON\nINSTINCT"} size={104} color={RED} /></P>
      <P t={t} a={-0.1} x={X} y={715}><div style={{ transform: `scale(${1 + 0.08 * Math.round(Math.abs(Math.sin(t * 5)) * 2) / 2})` }}><Pix rows={ICON.brain} px={22} /></div></P>
      <P t={t} a={at(4)} x={X} y={905}><div style={{ display: "flex", gap: 16 }}><Tag text="3 CHOIX" size={44} />{t >= at(6) && <Tag text="3 SECONDES" size={44} />}</div></P>
      <P t={t} a={at(8)} x={X} y={1070}><BigTT text="GO !" size={120} color={RED} /></P>
    </>
  );
  for (let k = 0; k < 3; k++) if (scene(t, k + 1)) return <ScDefi t={t} d={DEFIS[k]} />;
  if (scene(t, 4)) {
    const a = at(105), k = clamp((t - a) / 0.7), w = 340, h = w * 1.25;
    return (
      <>
        <P t={t} a={PH[7][0] - 0.15} x={X} y={345}><BigTT text={"CE PARCOURS,\nC'EST LE MIEN"} size={56} /></P>
        {t >= a && <P t={t} a={a} x={X} y={745}>
          <div style={{ position: "relative" }}>
            <Win title="LE CRÉATEUR" w={w + 40} ts={30}>
              <div style={{ width: w, height: h, overflow: "hidden", position: "relative" }}>
                {/* la mosaïque se « charge » de haut en bas, par paliers */}
                <div style={{ clipPath: `inset(0 0 ${100 - Math.round(k * 8) / 8 * 100}% 0)` }}><PortraitVivant t={t} w={w} /></div>
                {k < 1 && <div style={{ position: "absolute", left: 0, right: 0, top: Math.round(k * 8) / 8 * h - 4, height: 8, background: RED, boxShadow: "0 0 20px rgba(232,38,43,0.9)" }} />}
              </div>
            </Win>
            {t >= at(112) && <div style={{ position: "absolute", right: -90, top: "48%", transform: "rotate(-6deg)" }}><Tag text="24 ANS" red size={48} /></div>}
          </div>
        </P>}
        <P t={t} a={at(115)} x={X} y={1090}><Tag text={"DANS 2 ANS :\nMA 1RE AGENCE\nDE RECRUTEMENT"} red size={40} style={deux()} /></P>
      </>
    );
  }
  if (scene(t, 5)) return (
    <>
      <CtaCommentaire t={t} aOffre={at(142)} aBio={at(145)} aWin={at(127)} aType={at(135)} label={"MON SCORE :\n? / 3"} />
      <P t={t} a={PH[8][0] - 0.1} x={X} y={1080}><div style={{ border: `5px solid ${RED}`, background: "rgba(7,3,3,0.9)" }}><PortraitVivant t={t} w={140} /></div></P>
    </>
  );
  return null;
};

export const Instinct: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const coups = [DEB[1], DEB[2], DEB[3], DEB[4], DEB[5], at(32), at(65), at(97), at(105)];
  const glitch = t < 0.18 || coups.some((c) => t > c - 0.02 && t < c + 0.14);
  return <Ecran t={t} glitch={glitch} audio="audio/instinct.wav" zoom={1} caption={enQuestion(t) ? null : <Caption t={t} />}><Scenes t={t} /></Ecran>;
};
