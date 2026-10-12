// « Mon CV, niveau par niveau » (≈78 s, 30 i/s, 9:16) — univers pixel « jeu de rôle », cadrée TikTok (zones sûres src/tiktok.ts).
// Qui est derrière MyMotiv : le VRAI parcours du propriétaire, tiré de son CV et de ses deux lettres de recommandation.
// Vie privée (son choix) : ni nom de famille, ni ville, ni nom du cabinet (décrit : « cabinet de recrutement spécialisé dans
// les cadres ») ; Temporis est gardé (réseau en franchise). Aucune information n'est inventée ni remplacée par une autre.
// Yann masqué (casquette beige et brune, cagoule) fait des tractions → NIV.1 l'école (bachelor, semestre en Allemagne, master en
// cours, langues) → NIV.2 le cabinet (appels aux DRH, 12 rendez-vous qualifiés en 3 mois) → NIV.3 Temporis (agence toute neuve,
// secteur géré seul) → bilan (100 comptes dont 60 concessions, ≈ 160 000 € de CA estimé) → citations exactes de Richard et
// Guillaume → ce qu'un recruteur cherche → MyMotiv → CTA « pose ta question sur le recrutement en commentaire ».
// Voix : voix-cv.json (--voix yann). Son : synth_cv.py.
import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./common";
import voix from "./data/cv-voix.json";
import { Ecran, ICON, P, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { BigTT, FinMyMotiv } from "./fauxdmTT";
import { Bulle, CAP_BOX, Ligne, X, deux } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";
import { Carte, Stat } from "./TesLequel";

export const CV_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["mymotiv", "yann", "tractions", "cv", "bachelor", "allemagne", "master", "libanais", "cadres", "drh", "besoins", "douze", "qualifies",
  "temporis", "neuve", "seul", "cent", "soixante", "concessions", "mille", "euros", "richard", "ecoute", "persuasion", "adaptation", "guillaume",
  "temperament", "commercial", "reserve", "besoin", "preuves", "formules", "offre", "faits", "chiffres", "question", "commentaire", "offerte"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
// scènes : accroche, niv. 1, niv. 2, niv. 3, bilan, recommandations (2 phrases), l'autre côté du bureau, MyMotiv, CTA
const DEB = [-1, PH[1][0] - 0.15, PH[2][0] - 0.15, PH[3][0] - 0.15, PH[4][0] - 0.15, PH[5][0] - 0.15, PH[7][0] - 0.15, PH[8][0] - 0.15, PH[9][0] - 0.15];
const scene = (t: number, i: number) => show(t, DEB[i], i + 1 < DEB.length ? DEB[i + 1] : CV_DUR + 1);

// Yann masqué, bras levés (les 2 premières lignes = les mains sur la barre) : casquette beige (c) et brune (n), cagoule (k),
// sweat gris foncé (m) avec un petit rose (p), baskets blanches
const YANN = [".ss........ss.", ".ss........ss.", ".mm..cccc..mm.", ".mm.cccccc.mm.", ".mm.cccccc.mm.", ".mm.nnnnnn.mm.", ".mm.kkkkkk.mm.",
  ".mm.skssks.mm.", ".mm.kkkkkk.mm.", ".mmmkkkkkkmmm.", "..mmmmmmmmmm..", "..mmmmppmmmm..", "..mmmmmmmmmm..", "...mmmmmmmm...", "...kkk..kkk...",
  "...kkk..kkk...", "...kkk..kkk...", "...ww....ww..."];
const TEL = ["kkkkkk", "kwwwwk", "kwrrwk", "kwwwwk", "kwwwwk", "kkwwkk", "kkkkkk"];
const AGENCE = ["rrrrrrrrrrrrrr", "rwwwwwwwwwwwwr", "rrrrrrrrrrrrrr", ".wwwwwwwwwwww.", ".wkkwwkkwwkkw.", ".wkkwwkkwwkkw.", ".wwwwwwwwwwww.",
  ".wkkwwwwwwkkw.", ".wkkwwmmwwkkw.", ".wwwwwmmwwwww.", ".wwwwwmmwwwww."];
const traction = (t: number, a = 0) => Math.round((1 - Math.abs(Math.cos(((t - a) / 0.7) * Math.PI))) * 2) / 2 * 22;   // 0 → 22 px → 0 toutes les 0,7 s

// en-tête d'un niveau : étiquette rouge + titre ; « LEVEL UP ! » en grand pendant « Niveau x »
const Entete: React.FC<{ t: number; a: number; niv: string; titre: string }> = ({ t, a, niv, titre }) => (
  <P t={t} a={a} x={X} y={330}><div style={{ display: "flex", alignItems: "center", gap: 16 }}><Tag text={niv} red size={40} /><Tag text={titre} size={40} /></div></P>
);
const LevelUp: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) => (t >= a && t < b ? (
  <P t={t} a={a} x={X} y={700}><div style={{ opacity: Math.floor(t * 8) % 2 ? 1 : 0.7 }}><BigTT text={"LEVEL\nUP !"} size={110} color={RED} /></div></P>
) : null);
// tampon sur deux lignes (le Tampon de Barnum ne passe pas à la ligne)
const Tampon2: React.FC<{ t: number; a: number; text: string; size: number }> = ({ t, a, text, size }) => (
  <div style={{ transform: `rotate(-6deg) scale(${1.6 - 0.6 * clamp((t - a) / 0.12)})`, border: `6px solid ${RED}`, padding: "10px 22px", background: "rgba(7,3,3,0.88)", fontFamily: PIX, fontWeight: 700, fontSize: size, lineHeight: 1.15, color: RED, whiteSpace: "pre", textAlign: "center" }}>{text}</div>
);

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return (
    <>
      <P t={t} a={-0.2} x={X} y={380}><BigTT text={"QUI EST\nDERRIÈRE"} size={80} /></P>
      <P t={t} a={-0.1} x={X} y={548}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 440 }} /><BigTT text="?" size={96} color={RED} /></div></P>
      <P t={t} a={at(5)} x={X} y={810}><Carte rows={YANN} px={12} n="YANN" on s={300} dy={traction(t, at(5))} traction /></P>
      <P t={t} a={at(8)} x={X} y={1085}><Tag text={"LE RECRUTEUR QUI\nFAIT DES TRACTIONS"} red size={40} style={deux()} /></P>
    </>
  );
  if (scene(t, 1)) return (
    <>
      <Entete t={t} a={PH[1][0] - 0.15} niv="NIV.1" titre="L'ÉCOLE" />
      <LevelUp t={t} a={PH[1][0] - 0.1} b={at(26) - 0.05} />
      {t >= at(26) && <P t={t} a={at(26)} x={X} y={600}>
        <Win title="FORMATION" w={800} ts={30}>
          <Ligne t={t} a={at(26)} text={"BACHELOR EN\nDÉV. COMMERCIAL"} />
          <Ligne t={t} a={at(31)} text={"1 SEMESTRE EN\nALLEMAGNE"} />
          <Ligne t={t} a={at(37)} text={"MASTER CONSEIL EN\nSTRATÉGIE (EN COURS)"} red />
        </Win>
      </P>}
      {t >= at(41) && <P t={t} a={at(41)} x={X} y={1000}>
        <Win title="LANGUES" w={800} ts={30}>
          <Stat t={t} j={{ label: "ANGLAIS C1", a: at(43), etapes: [[at(43), 0.8]] }} />
          <Stat t={t} j={{ label: "ALLEMAND B2", a: at(44), etapes: [[at(44), 0.7]] }} />
          <Stat t={t} j={{ label: "LIBANAIS C1", a: at(46), etapes: [[at(46), 0.8]] }} />
        </Win>
      </P>}
    </>
  );
  if (scene(t, 2)) return (
    <>
      <Entete t={t} a={PH[2][0] - 0.15} niv="NIV.2" titre="CABINET CADRES" />
      <LevelUp t={t} a={PH[2][0] - 0.1} b={at(58) - 0.05} />
      {t >= at(58) && <P t={t} a={at(58)} x={X} y={590}>
        <Win title="MA MISSION" w={800} ts={30}>
          <div style={{ position: "relative" }}>
            <Ligne t={t} a={at(60)} text={"APPELER LES DRH ET\nLES DIRECTEURS"} />
            <Ligne t={t} a={at(65)} text={"COMPRENDRE LEURS\nBESOINS"} red />
            <div style={{ position: "absolute", right: 0, top: 0, transform: `rotate(${t < at(65) ? (Math.floor(t * 14) % 2 ? 10 : -10) : 0}deg)` }}><Pix rows={TEL} px={11} /></div>
          </div>
        </Win>
      </P>}
      <P t={t} a={at(68)} x={X} y={840}><Tag text="SUCCÈS DÉBLOQUÉ" size={40} /></P>
      <P t={t} a={at(68)} x={X} y={960}><BigTT text="12 RDV" size={120} color={RED} /></P>
      <P t={t} a={at(71)} x={X} y={1090}><Tag text="QUALIFIÉS EN 3 MOIS" red size={40} /></P>
    </>
  );
  if (scene(t, 3)) return (
    <>
      <Entete t={t} a={PH[3][0] - 0.15} niv="NIV.3" titre="TEMPORIS" />
      <LevelUp t={t} a={PH[3][0] - 0.1} b={at(82) - 0.05} />
      <P t={t} a={at(82)} x={X} y={450}><Tag text={"RÉSEAU NATIONAL\nD'AGENCES D'EMPLOI"} size={40} style={deux()} /></P>
      <P t={t} a={at(89)} x={X} y={572}><div style={{ display: "flex", alignItems: "center", gap: 20 }}><Pix rows={AGENCE} px={5} /><Tag text="AGENCE TOUTE NEUVE" red size={40} /></div></P>
      {t >= at(93) && <P t={t} a={at(93)} x={X} y={845}>
        <Win title="SEUL SUR MON SECTEUR" w={800} ts={30}>
          <Ligne t={t} a={at(98)} text="TROUVER LES POSTES" size={38} />
          <Ligne t={t} a={at(101)} text="TROUVER LES CANDIDATS" size={38} />
          <Ligne t={t} a={at(104)} text={"ÉVALUER LEURS\nCOMPÉTENCES"} size={38} />
          <Ligne t={t} a={at(109)} text={"PRÉSENTER AUX\nENTREPRISES"} size={38} red />
        </Win>
      </P>}
    </>
  );
  if (scene(t, 4)) {
    const n = t < at(113) ? 0 : Math.min(100, Math.floor(clamp((t - at(113)) / 0.8) * 10) * 10);
    return (
      <>
        <Entete t={t} a={PH[4][0] - 0.15} niv="BILAN" titre="TEMPORIS" />
        <P t={t} a={at(113)} x={X} y={500}><BigTT text={String(n)} size={170} color={RED} /></P>
        <P t={t} a={at(114)} x={X} y={660}><Tag text={"COMPTES CLIENTS\nOUVERTS"} size={40} style={deux()} /></P>
        <P t={t} a={at(118)} x={X} y={820}><Tag text={"DONT 60 GRANDES\nCONCESSIONS AUTO"} red size={40} style={deux()} /></P>
        <P t={t} a={at(123)} x={X} y={990}><BigTT text="ENV. 160 000 €" size={64} /></P>
        <P t={t} a={at(128)} x={X} y={1090}><Tag text="CA ESTIMÉ" red size={40} /></P>
      </>
    );
  }
  if (scene(t, 5)) return (
    <>
      <P t={t} a={PH[5][0] - 0.15} x={X} y={330}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Pix rows={ICON.envelope} px={5} /><Tag text="RECOMMANDATIONS" size={40} /></div></P>
      {t >= at(140) && <P t={t} a={at(140)} x={X} y={575}>
        <Win title="RICHARD, PRÉSIDENT" w={800} ts={30}><Bulle t={t} a={at(144)} text={"« UN EXCELLENT SENS\nDE L'ÉCOUTE, DE\nPERSUASION ET\nD'ADAPTATION »"} size={38} /></Win>
      </P>}
      {t >= at(155) && <P t={t} a={at(155)} x={X} y={885}>
        <Win title="GUILLAUME, PRÉSIDENT" w={800} ts={30}><Bulle t={t} a={at(160)} text={"« UN RÉEL\nTEMPÉRAMENT\nCOMMERCIAL »"} size={38} red /></Win>
      </P>}
      {t >= at(168) && <div style={{ position: "absolute", left: X, top: 1085, transform: "translate(-50%, -50%)" }}><Tampon2 t={t} a={at(168)} text={"« JE RECOMMANDE\nSANS RÉSERVE » X2"} size={46} /></div>}
    </>
  );
  if (scene(t, 6)) return (
    <>
      <P t={t} a={PH[7][0] - 0.15} x={X} y={340}><Tag text="L'AUTRE CÔTÉ DU BUREAU" size={40} /></P>
      <P t={t} a={at(184)} x={X} y={530}><div style={{ textAlign: "center" }}><Pix rows={ICON.boy} px={18} style={{ margin: "0 auto" }} /><div style={{ marginTop: 10 }}><Tag text="RECRUTEUR" red size={40} /></div></div></P>
      {t >= at(185) && <P t={t} a={at(185)} x={X} y={845}>
        <Win title="CE QU'IL CHERCHE" w={800} ts={30}>
          <Ligne t={t} a={at(188)} text={"QUELQU'UN QUI RÉPOND\nÀ SON BESOIN"} red />
          <Ligne t={t} a={at(193)} text="AVEC DES PREUVES" />
        </Win>
      </P>}
      <P t={t} a={at(196)} x={X} y={1080}>
        <div style={{ position: "relative" }}>
          <Tag text="« FORMULES »" size={44} />
          {t >= at(197) && <svg width={420} height={80} style={{ position: "absolute", left: -20, top: -6 }}><path d={`M0 50 L${Math.round(clamp((t - at(197)) / 0.2) * 4) / 4 * 400} 22`} stroke={RED} strokeWidth={10} /></svg>}
        </div>
      </P>
    </>
  );
  if (scene(t, 7)) return (
    <>
      <FinMyMotiv t={t} aLogo={at(207)} aWin={at(209)} etapes={[["PART DE L'OFFRE", at(211)], ["ET DE TON CV", at(215)], ["TES VRAIES PREUVES", at(220)]]} aOffre={99} aBio={99} />
      {t < at(223) ? <P t={t} a={PH[8][0] - 0.15} x={X} y={1010}><Carte rows={YANN} px={7} n="YANN" on s={200} dy={traction(t, PH[8][0]) * 0.6} traction /></P>
        : <P t={t} a={at(223)} x={X} y={1010}><Tag text={"DES FAITS,\nDES CHIFFRES"} red size={48} style={deux()} /></P>}
    </>
  );
  if (scene(t, 8)) return (
    <>
      <CtaCommentaire t={t} aOffre={at(239)} aBio={at(242)} aWin={at(231)} aType={at(235)} label={"MA QUESTION DE\nRECRUTEMENT :"} />
      <P t={t} a={PH[9][0] - 0.1} x={X} y={1080}><Carte rows={YANN} px={7} n="YANN" on s={200} dy={traction(t, PH[9][0]) * 0.6} traction /></P>
    </>
  );
  return null;
};

export const MonCV: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const coups = [DEB[1], DEB[2], DEB[3], DEB[4], DEB[5], DEB[6], DEB[7], DEB[8], at(168)];
  const glitch = t < 0.18 || coups.some((c) => t > c - 0.02 && t < c + 0.14);
  return <Ecran t={t} glitch={glitch} audio="audio/cv.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
