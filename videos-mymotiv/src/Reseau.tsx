// « Comment se faire un réseau (sans piston) » (≈44 s, 30 i/s, 9:16) — univers pixel, cadrée TikTok. Une carte de réseau :
// Lina (« TOI ») seule, « RÉSEAU : 0 », pas de tonton → derrière chaque offre, une personne : chaque candidature envoie ton nom
// (une enveloppe qui file le long d'un lien) → lettre copiée-collée : le lien casse, le recruteur s'endort, « OUBLIÉ. » →
// lettre qui parle de son entreprise, de son poste, avec tes vraies preuves : le lien devient rouge, « RÉSEAU : 1 » → si c'est
// non : réponds, remercie, reste en contact → dix lettres comme ça : un anneau de 10 personnes → recul par paliers, d'autres
// personnes à venir, « une lettre à la fois » (+1) → MyMotiv (l'offre + ton CV, l'entreprise, ses vrais besoins, tes vraies
// preuves) → CTA « t'as eu un piston ? oui ou non en commentaire ». Aucune promesse : « une chance qu'elle retienne ton nom ».
// Voix : voix-reseau.json (--voix yann). Son : synth_reseau.py.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, lerp } from "./common";
import voix from "./data/reseau-voix.json";
import { Ecran, GREY, ICON, INK, P, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { Tampon } from "./Barnum";
import { BigTT, FinMyMotiv } from "./fauxdmTT";
import { CAP_BOX, Ligne, X } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";
import { FOND, LINA } from "./TesLequel";

export const RESEAU_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["reseau", "tonton", "fabrique", "personne", "nom", "copieecollee", "toublie", "preuves", "chance", "non", "contact", "dix",
  "construire", "fois", "mymotiv", "besoins", "piston", "commentaire", "offerte"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : RESEAU_DUR + 1);

type Pt = [number, number];
const kVol = (t: number, a: number, d: number) => Math.round(clamp((t - a) / d) * 8) / 8;     // trajet en 8 paliers

// ─── la carte : TOI au centre, les personnes autour, les liens, les enveloppes ───
const T2: Pt = [520, 880], R1: Pt = [770, 540], R2: Pt = [270, 540];                       // scènes 2 à 4
const C: Pt = [520, 770];                                                                   // scènes 6 et 7
const anneau = (n: number, r: number, off: number, ry = 1): Pt[] =>
  Array.from({ length: n }, (_, i) => { const a = ((off + (360 / n) * i) * Math.PI) / 180; return [C[0] + r * Math.cos(a), C[1] + r * ry * Math.sin(a)]; });
const A1 = anneau(10, 330, -72);                                                            // les 10 candidatures
const A2 = anneau(14, 560, -90 + 360 / 28, 0.92), A3 = anneau(20, 790, -81, 0.9);           // les personnes « à venir »
const ORDRE = [9, 0, 1, 2, 3, 4, 5, 6, 7];                                                  // A1[8] = la 1re personne (scène 4)
const CIBLE = 3;                                                                            // A2[3] : « une lettre à la fois »
const VOISINS = A1.map((p) => [...A2.keys()].sort((u, v) => Math.hypot(A2[u][0] - p[0], A2[u][1] - p[1]) - Math.hypot(A2[v][0] - p[0], A2[v][1] - p[1])).slice(0, 2));

// les instants où le compteur monte
const VOL2 = at(57) + 0.1, D2 = 0.5;                                                        // la bonne lettre → R2
const VOLS = ORDRE.map((_, j) => at(80) + j * 0.2), DV = 0.35;                              // les 9 autres
const VOL3 = at(103) + 0.05, D3 = 0.45;                                                     // « une lettre à la fois »
const ARRIVEES = [VOL2 + D2, ...VOLS.map((a) => a + DV), VOL3 + D3];

type Etat = "offre" | "perso" | "oubli" | "on" | "futur";
const BOY_GRIS = ICON.boy.map((r) => r.replace(/[ws]/g, "g").replace(/k/g, "m"));
const Noeud: React.FC<{ p: Pt; etat: Etat; t: number; s?: number }> = ({ p, etat, t, s = 160 }) => {
  const bord = etat === "on" ? RED : etat === "oubli" ? GREY : etat === "futur" ? "#5A4A48" : W_;
  return (
    <div style={{ position: "absolute", left: p[0] - s / 2, top: p[1] - s / 2, width: s, height: s, boxSizing: "border-box", background: etat === "offre" ? W_ : FOND,
      border: `${s >= 120 ? 6 : 4}px solid ${bord}`, boxShadow: etat === "on" ? "0 0 30px rgba(232,38,43,0.7)" : undefined, display: "flex", alignItems: "center", justifyContent: "center" }}>
      {etat === "offre" ? (
        <div style={{ width: "88%" }}>
          <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 30, color: INK, textAlign: "center" }}>OFFRE</div>
          {[1, 0.7, 0.85].map((w, j) => <div key={j} style={{ height: 10, width: `${w * 100}%`, marginTop: 12, background: GREY }} />)}
        </div>
      ) : etat === "futur" ? <Pix rows={ICON.person} px={Math.round(s * 0.065)} style={{ opacity: 0.75 }} />
        : <Pix rows={etat === "oubli" ? BOY_GRIS : ICON.boy} px={Math.round(s * 0.08)} />}
      {etat === "oubli" && <div style={{ position: "absolute", right: -s * 0.3, top: -s * 0.42 }}><Pix rows={ICON.zzz} px={Math.round(s * 0.08)} style={{ opacity: Math.floor(t * 2) % 2 ? 1 : 0.45 }} /></div>}
    </div>
  );
};

type Mode = "blanc" | "rouge" | "casse" | "futur";
const Lien: React.FC<{ a: Pt; b: Pt; k?: number; mode: Mode }> = ({ a, b, k = 1, mode }) => {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]), ang = (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI, h = mode === "futur" ? 4 : 8;
  const fill = mode === "rouge" ? RED : mode === "blanc" ? W_ : `repeating-linear-gradient(90deg, ${mode === "casse" ? GREY : "#4A3C3B"} 0 14px, rgba(0,0,0,0) 14px 26px)`;
  const bout = (x0: number, x1: number, chute = 0) => <div style={{ position: "absolute", left: x0, top: -h / 2 + chute, width: Math.max(0, x1 - x0), height: h, background: fill, boxShadow: mode === "rouge" ? "0 0 18px rgba(232,38,43,0.6)" : undefined }} />;
  return (
    <div style={{ position: "absolute", left: a[0], top: a[1], width: 0, height: 0, transform: `rotate(${ang}deg)`, transformOrigin: "0 0" }}>
      {mode === "casse" ? <>{bout(0, L * 0.42)}{bout(L * 0.58, L, 16)}</> : bout(0, L * k)}
    </div>
  );
};

// l'enveloppe qui file le long du lien, et le lien qui se dessine derrière elle (blanc), puis son état final
const Envoi: React.FC<{ t: number; a: number; d: number; de: Pt; vers: Pt; fin: Mode; px?: number }> = ({ t, a, d, de, vers, fin, px = 5 }) => {
  if (t < a) return null;
  const k = kVol(t, a, d);
  if (k >= 1) return <Lien a={de} b={vers} mode={fin} />;
  return (
    <>
      <Lien a={de} b={vers} k={k} mode="blanc" />
      <div style={{ position: "absolute", left: lerp(de[0], vers[0], k), top: lerp(de[1], vers[1], k), transform: "translate(-50%, -50%)" }}><Pix rows={ICON.envelope} px={px} /></div>
    </>
  );
};

const Toi: React.FC<{ p: Pt; s: number; tag?: boolean }> = ({ p, s, tag = true }) => (
  <>
    <div style={{ position: "absolute", left: p[0] - s / 2, top: p[1] - s / 2, width: s, height: s, boxSizing: "border-box", background: FOND, border: `6px solid ${W_}`, display: "flex", alignItems: "flex-end", justifyContent: "center", overflow: "hidden" }}>
      <Pix rows={LINA} px={Math.floor(s * 0.05)} style={{ marginBottom: s * 0.03 }} />
    </div>
    {tag && <div style={{ position: "absolute", left: p[0], top: p[1] + s / 2 + 40, transform: "translate(-50%, -50%)" }}><Tag text="TOI" red size={40} /></div>}
  </>
);

// le compteur « RÉSEAU : n » (en haut), qui grossit d'un cran à chaque nouvelle personne
const Compteur: React.FC<{ t: number }> = ({ t }) => {
  const passes = ARRIVEES.filter((a) => t >= a), n = passes.length, bump = n > 0 && t - passes[n - 1] < 0.12;
  return (
    <div style={{ position: "absolute", left: X, top: 340, transform: `translate(-50%, -50%) scale(${bump ? 1.2 : 1})`, whiteSpace: "nowrap" }}>
      <Tag text={`RÉSEAU : ${n}`} red={n > 0} size={48} />
    </div>
  );
};
const Gris: React.FC<{ text: string }> = ({ text }) => <Tag text={text} size={40} style={{ background: GREY, color: INK }} />;

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0) || scene(t, 1)) {
    const deux = scene(t, 1);
    return (
      <>
        <P t={t} a={deux ? PH[1][0] - 0.15 : -0.2} x={X} y={deux ? 400 : 380}>
          {deux ? <BigTT text={"UN RÉSEAU,\nÇA SE FABRIQUE."} size={60} /> : <BigTT text="PAS DE RÉSEAU ?" size={60} />}
        </P>
        <Toi p={[520, 720]} s={260} tag={false} />
        <P t={t} a={-0.2} x={X} y={910}><Tag text="RÉSEAU : 0" size={48} /></P>
        {!deux && <P t={t} a={at(7)} x={X} y={1040}><Gris text="TONTON : INTROUVABLE" /></P>}
        {deux && <P t={t} a={at(18)} x={X} y={1040}><Tag text="MODE CONSTRUCTION" red size={40} /></P>}
      </>
    );
  }
  if (scene(t, 2)) {
    const a = at(29), d = 0.5;
    return (
      <>
        <Compteur t={t} />
        <Envoi t={t} a={a} d={d} de={T2} vers={R1} fin="blanc" />
        <Toi p={T2} s={180} />
        {t >= at(21) && <Noeud p={R1} etat={t >= at(26) ? "perso" : "offre"} t={t} />}
        <P t={t} a={at(33)} x={R1[0]} y={R1[1] + 120}><Tag text="TON NOM" size={40} /></P>
      </>
    );
  }
  if (scene(t, 3)) {
    const oubli = t >= at(41);
    return (
      <>
        <Compteur t={t} />
        <Lien a={T2} b={R1} mode={oubli ? "casse" : "blanc"} />
        <Toi p={T2} s={180} />
        <Noeud p={R1} etat={oubli ? "oubli" : "perso"} t={t} />
        {t >= at(36) && <div style={{ position: "absolute", left: 390, top: 690, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="COPIÉ-COLLÉ" t={t} a={at(36)} size={44} /></div>}
        <P t={t} a={at(41)} x={R1[0]} y={R1[1] + 120}><Gris text="OUBLIÉ." /></P>
      </>
    );
  }
  if (scene(t, 4)) {
    if (t < at(57)) return (
      <>
        <Compteur t={t} />
        <P t={t} a={PH[4][0] - 0.1} x={X} y={760}>
          <Win title="TA LETTRE" w={800} ts={32}>
            {([["SON ENTREPRISE", 48, 0.8], ["SON POSTE", 51, 0.55], ["TES VRAIES PREUVES", 54, 0.9]] as [string, number, number][]).map(([l, i, w], j) => (
              <div key={l} style={{ height: 70, display: "flex", alignItems: "center" }}>
                {t < at(i) ? <div style={{ height: 18, width: `${w * 100}%`, background: "#4A3C3B" }} /> : <div style={{ flex: 1 }}><Ligne t={t} a={at(i)} text={l} red={j === 2} /></div>}
              </div>
            ))}
          </Win>
        </P>
      </>
    );
    const on = t >= VOL2 + D2;
    return (
      <>
        <Compteur t={t} />
        <Lien a={T2} b={R1} mode="casse" />
        <Envoi t={t} a={VOL2} d={D2} de={T2} vers={R2} fin="rouge" />
        <Toi p={T2} s={180} />
        <Noeud p={R1} etat="oubli" t={t} />
        <P t={t} a={at(57)} x={R2[0]} y={R2[1]}><Noeud p={[80, 80]} etat={on ? "on" : "perso"} t={t} /><div style={{ width: 160, height: 160 }} /></P>
        <P t={t} a={at(64)} x={R2[0] + 20} y={R2[1] + 120}><Tag text="TON NOM" red size={40} /></P>
      </>
    );
  }
  if (scene(t, 5)) return (
    <>
      <Compteur t={t} />
      <P t={t} a={at(70)} x={X} y={560}>
        <Win title="RÉPONSE DU RECRUTEUR" w={720} red={false} ts={30}><Ligne t={t} a={at(71)} text="NON, MERCI." /></Win>
      </P>
      <P t={t} a={at(72)} x={X} y={900}>
        <Win title="TA RÉPONSE" w={720} ts={30}>
          <Ligne t={t} a={at(72)} text="RÉPONDS" />
          <Ligne t={t} a={at(73)} text="REMERCIE" />
          <Ligne t={t} a={at(76)} text="RESTE EN CONTACT" red />
        </Win>
      </P>
    </>
  );
  if (scene(t, 6) || scene(t, 7)) {
    // l'anneau des 10 personnes, puis le recul par paliers 1 → 0,7 → 0,45 sur « commencer »
    const r0 = at(99), pas = scene(t, 7) && t >= r0 ? Math.min(2, Math.floor((t - r0) / 0.18) + 1) : 0, S = [1, 0.7, 0.45][pas];
    const debut = PH[6][0] - 0.15;
    return (
      <>
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${S})`, transformOrigin: `${C[0]}px ${C[1]}px` }}>
          {pas > 0 && t >= r0 + 0.36 && A1.flatMap((p, i) => VOISINS[i].map((j) => <Lien key={`${i}-${j}`} a={p} b={A2[j]} mode="futur" />))}
          {pas > 0 && [...A2, ...A3].map((p, i) => (A2.indexOf(p) === CIBLE ? null : <Noeud key={i} p={p} etat="futur" t={t} s={96} />))}
          <Lien a={C} b={A1[8]} mode="rouge" />
          {ORDRE.map((i, j) => <Envoi key={i} t={t} a={VOLS[j]} d={DV} de={C} vers={A1[i]} fin="rouge" />)}
          <Envoi t={t} a={VOL3} d={D3} de={C} vers={A2[CIBLE]} fin="rouge" px={6} />
          {pas > 0 && <Noeud p={A2[CIBLE]} etat={t >= VOL3 + D3 ? "on" : "futur"} t={t} s={96} />}
          {A1.map((p, i) => {
            const j = ORDRE.indexOf(i), on = i === 8 || (j >= 0 && t >= VOLS[j] + DV);
            return t >= debut + 0.04 * i && <Noeud key={i} p={p} etat={on ? "on" : "perso"} t={t} s={96} />;
          })}
          <Toi p={C} s={150} />
        </div>
        <Compteur t={t} />
        {scene(t, 7) && <P t={t} a={at(103)} x={X} y={1150}><Tag text="UNE LETTRE À LA FOIS." red size={40} /></P>}
      </>
    );
  }
  if (scene(t, 8)) return (
    <FinMyMotiv t={t} aLogo={at(108)} aWin={at(112)} aOffre={99} aBio={99}
      etapes={[["L'OFFRE + TON CV", at(117)], ["L'ENTREPRISE", at(123)], ["SES VRAIS BESOINS", at(126)], ["TES VRAIES PREUVES", at(130)]]} />
  );
  if (scene(t, 9)) return <CtaCommentaire t={t} aOffre={at(149)} aBio={at(152)} aWin={at(132)} aType={at(144)} label={"T'AS EU UN\nPISTON ?"} />;
  return null;
};

export const Reseau: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const coups = [PH[2][0], PH[3][0], at(41), PH[4][0], at(57), PH[5][0], PH[6][0], PH[8][0], PH[9][0]];
  const glitch = t < 0.18 || coups.some((c) => t > c - 0.12 && t < c + 0.06);
  return <Ecran t={t} glitch={glitch} audio="audio/reseau.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
