// Histoire Motiv n°1 « Change juste le nom » (≈53 s, 30 i/s, 9:16, 3D low-poly) — inspirée du format « petite histoire
// la nuit avec son IA », avec nos propres personnages : le candidat (cheveux bouclés) et Motiv, la petite lettre rose.
// Il veut envoyer à Maison Lumen sa lettre « je rêve de rejoindre Atelier Nova » en changeant juste le nom → Motiv lit la
// 1re ligne d'un ton las (« Madame, Monsieur, je me permets… ») → « Fais mieux, alors » → Motiv projette le VRAI site
// (lien de l'offre, CV, génération, « Lettre sur mesure pour Maison Lumen ») → « C'est vraiment moi, ça ? » →
// CTA différent : Motiv se tourne vers nous, « t'as un pote qui change juste le nom ? Identifie-le. »
// Mise en scène, entreprises fictives. Voix : voix-nom.json (--voix candidat / --voix motiv). Son : synth_nom.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HUMAN, Human, MOTIV, Monde, Motiv, PINK, PINK_L, World } from "./motiv3d/Monde";
import { Keys, Shot, Voix, camAt, lerp, mouthOf, seg, track } from "./motiv3d/anim";
import { PLANS } from "./motiv3d/plans";
import { Atmos, EpisodeTag, Subtitles } from "./motiv3d/Overlay";
import voixJ from "./data/nom-voix.json";
import env from "./data/nom-env.json";
import cfg from "../voix-nom.json";
import "./fonts";

const V = voixJ as Voix;
export const NOM_DUR = V.duration;
const QUI = cfg.lignes.map((l) => l.qui);
const PH = V.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const W = (i: number) => V.mots.find((m) => m.i === i)?.t0 ?? 0;
const T = { nova: W(15), nom: W(21), partout: W(27), ligne: W(43), madame: W(44), suivante: W(61), mieux: W(64), lien: W(69), cv: W(75),
  voila: W(76), lumen: W(82), parcours: W(89), attends: W(90), toi: W(98), pote: W(107), identifie: W(113), end: PH[14][1] };
const GEN = ["044", "045", "046", "048", "050", "052"];
const IMAGES = ["parcours/016-offre-lien.png", "parcours/008-cv-ajoute.png", ...GEN.map((g) => `shots/${g}-generation.png`), "shots/054-lettre.png"];

// ─── plans ───
const FACE: Shot = { pos: [0.34, 1.1, 0.78], look: [0.34, 1.02, -0.45], fov: 38, pos2: [0.34, 1.08, 0.6] };
const SHOTS: [number, Shot][] = [
  [0, PLANS.large], [PH[1][0] - 0.2, PLANS.motiv], [PH[2][0] - 0.15, PLANS.candidat], [PH[3][0] - 0.15, PLANS.holo], [PH[4][0] - 0.15, PLANS.candidat],
  [PH[5][0] - 0.15, PLANS.motiv], [T.madame - 0.3, PLANS.holo], [PH[7][0] - 0.2, PLANS.candidat], [PH[8][0] - 0.15, PLANS.motiv], [T.suivante + 0.45, PLANS.large],
  [PH[9][0] - 0.1, PLANS.candidat], [PH[10][0] - 0.2, PLANS.motiv], [PH[10][1] + 0.1, PLANS.holo], [T.lumen + 0.2, PLANS.large],
  [PH[12][0] - 0.2, PLANS.candidat], [PH[13][0] - 0.15, PLANS.motiv], [PH[14][0] - 0.75, FACE],
];

// ─── le candidat ───
const LOOK_M = { hYaw: 0.32, hPitch: 0.1, eyeX: 0, eyeY: 0 }, LOOK_H = { hYaw: 0.5, hPitch: -0.22, eyeY: 0.6 }, LOOK_PC = { hYaw: 0.02, hPitch: 0.2, eyeY: -0.6 };
const REST = { aLx: 0.78, aLz: 0.1, aLe: 0.85, aRx: 0.78, aRz: 0.1, aRe: 0.85 }, TYPE = { aLx: 0.6, aLz: 0.06, aLe: 1.2, aRx: 0.6, aRz: 0.06, aRe: 1.2 };
const H_KEYS: Keys<Human> = [
  [0, { ...TYPE, ...LOOK_PC, type: 1 }], [PH[0][0] + 0.1, { ...LOOK_M, type: 0 }, 0.4], [PH[0][0] + 0.5, { ...REST }, 0.5],
  [PH[2][0] - 0.2, { hYaw: 0.08, hRoll: -0.08, eyeX: -0.9, brow: -0.3, aRx: 2.75, aRz: 0.35, aRe: 1.95 }, 0.45],
  [PH[3][0], { ...LOOK_H, hRoll: 0, eyeX: 0, brow: 0, ...REST }, 0.5],
  [PH[4][0] - 0.1, { ...LOOK_M, aLx: 0.55, aLz: 0.55, aLe: 1.45, aRx: 0.55, aRz: 0.55, aRe: 1.45, hRoll: 0.12, brow: -0.35, bUp: 0.5 }, 0.35],
  [PH[5][0] + 0.1, { ...REST, hRoll: 0, bUp: 0, brow: 0 }, 0.5], [T.madame - 0.2, { ...LOOK_H }, 0.4],
  [PH[7][0] - 0.15, { ...LOOK_M, lean: 0.3, bUp: 0.6 }, 0.35], [PH[8][0] + 0.2, { lean: 0.15, bUp: 0 }, 0.5],
  [T.suivante + 0.3, { lean: -0.1, hPitch: -0.32, hYaw: 0.15, aLx: 0.2, aLe: 0.25, aRx: 0.2, aRe: 0.25, aLz: 0.15, aRz: 0.15 }, 0.6],
  [PH[9][0] + 0.3, { ...LOOK_M, ...REST, lean: 0.12, hRoll: 0.06 }, 0.6], [PH[10][1], { ...LOOK_H, lean: 0.25, hRoll: 0 }, 0.4],
  [PH[12][0] - 0.15, { ...LOOK_M, bUp: 1, lean: -0.04, aLx: 1.05, aLz: 0.1, aLe: 2.0, lids: -0.2 }, 0.3],
  [PH[13][0] + 0.3, { ...LOOK_H, bUp: 0.3, lean: 0.25, ...REST }, 0.6],
];
// ─── Motiv ───
const M_KEYS: Keys<Motiv> = [
  [0, { px: -0.3, py: -0.2 }], [PH[0][0] + 0.3, { px: 0, py: 0 }, 0.3],
  [PH[1][0] - 0.1, { lid: 0.45, flap: -0.5, hL: 0.35 }, 0.4], [T.nova - 0.1, { hL: 0.7 }, 0.2],
  [PH[2][0], { lid: 0.62, py: -0.2, hL: 0 }, 0.4], [PH[3][0], { lid: 0.4, rz: 0.1, py: 0, flap: -0.3 }, 0.35],
  [PH[4][0], { lid: 0.3, rz: 0 }, 0.4], [PH[5][0], { lid: 0.15, flap: 0.25, hL: 0.45 }, 0.3],
  [T.madame - 0.2, { lid: 0.78, py: -0.55, flap: -0.6, hL: 0, rz: 0.06 }, 0.35],
  [PH[7][0], { lid: 0.2, py: 0, flap: 0, rz: 0 }, 0.3], [PH[8][0], { px: -0.6 }, 0.3], [T.suivante - 0.35, { hR: 1, rz: -0.12 }, 0.2], [T.suivante + 0.1, { hR: 0, rz: 0, px: 0 }, 0.3],
  [PH[9][0], { lid: 0.1 }, 0.4], [PH[10][0] - 0.1, { smile: 1, flap: 0.5, eye: 1.12, hL: 0.7, hR: 0.7, y: 1.03, lid: 0 }, 0.3],
  [PH[10][1], { hL: 0.4, hR: 0.4, glow: 1.6, smile: 0.6 }, 0.4], [PH[11][0], { smile: 0.9, rx: -0.12, glow: 1 }, 0.4],
  [PH[12][0], { smile: 0.6, rx: 0 }, 0.4], [PH[13][0], { smile: 1, lid: 0.25, rz: 0.08 }, 0.35],
  [PH[14][0] - 0.75, { ry: 0, x: 0.34, z: -0.45, y: 1.03, smile: 0.8, lid: 0.1, rz: 0, px: 0, py: 0, hL: 0, hR: 0 }, 0.6],
  [PH[14][0] + 0.1, { rz: 0.12, flap: 0.35 }, 0.3], [T.identifie - 0.15, { s: 1.06, hL: 0.9, rz: -0.05, lid: 0.3 }, 0.25],
];
const blinkAt = (t: number, seed: number) => { const k = ((t + seed) % 3.7); return k < 0.12 ? Math.sin((k / 0.12) * Math.PI) : 0; };

// ─── l'écran holographique ───
const COMPANIES = ["Boréal Logistique", "Atelier Nova", "Maison Lumen", "Boréal Logistique", "Atelier Nova"];
const holoAt = (t: number) => {
  const pos: [number, number, number] = [-0.05, 1.32, -0.62];
  if (t < PH[1][0] + 0.6) return { on: 0, src: "letter", crop: 1, pos, ry: -0.64, scale: 1 };
  if (t < T.suivante + 0.6) {
    const swipe = seg(t, T.suivante - 0.25, T.suivante + 0.45);
    let company = t < T.nom ? "Atelier Nova" : "Maison Lumen";
    if (t > T.partout - 0.8 && t < T.partout + 0.9) company = COMPANIES[Math.floor((t - T.partout + 0.8) / 0.22) % COMPANIES.length];
    const hl = t < T.nova - 0.1 ? 0 : t < PH[4][0] ? 1 : 0;
    const focus = seg(t, T.madame - 0.3, T.madame);
    return { on: seg(t, PH[1][0] + 0.6, PH[1][0] + 1.0) * (1 - swipe), src: "letter", crop: 1, pos: [pos[0] - swipe * 0.5, pos[1], pos[2]] as typeof pos, ry: -0.64 - swipe * 0.9, scale: 1, letter: { company, hl, focus } };
  }
  if (t < PH[10][1]) return { on: 0, src: "letter", crop: 1, pos, ry: -0.64, scale: 1 };
  const a = PH[10][1] + 0.15, gen0 = a + 1.6, letter0 = PH[11][0] - 0.25;
  const src = t < a + 0.8 ? IMAGES[0] : t < gen0 ? IMAGES[1] : t < letter0 ? IMAGES[2 + Math.min(5, Math.floor(seg(t, gen0, letter0) * 6))] : IMAGES[8];
  const crop = t < letter0 ? 1 : lerp(1, 0.62, seg(t, letter0, letter0 + 0.4));
  return { on: seg(t, a, a + 0.4) * (1 - seg(t, PH[14][0] - 0.9, PH[14][0] - 0.6)), src, crop, pos, ry: -0.64, scale: 1 };
};

export const HistoireNom: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(SHOTS, t, V.duration);
  const human = track(HUMAN, H_KEYS, t);
  human.mouth = mouthOf(V, QUI, env, "candidat", t);
  human.blink = Math.max(human.blink, blinkAt(t, 0.4));
  if (human.type > 0.5) { human.aLe += Math.sin(t * 23) * 0.05; human.aRe += Math.sin(t * 19 + 1) * 0.05; }
  const motiv = track(MOTIV, M_KEYS, t);
  motiv.mouth = mouthOf(V, QUI, env, "motiv", t);
  motiv.eye *= 1 - 0.9 * blinkAt(t, 2.1);
  const w: World = {
    t, cam, human, motiv, holo: holoAt(t), lamp: 1,
    phone: { time: "23:47", notif: 0, light: 0.15 }, laptop: { typed: "Je rêve depuis toujours de rejoindre Atelier Nova.", cursor: Math.floor(t * 2) % 2 === 0, light: 1 },
  };
  const end = seg(t, T.end + 0.2, T.end + 0.7);
  return (
    <AbsoluteFill style={{ backgroundColor: "#05061a" }}>
      <Audio src={staticFile("audio/nom.wav")} />
      <Monde w={w} images={IMAGES} />
      <Atmos t={t} dim={end * 0.72} />
      <EpisodeTag t={t} ep="ÉP. 1" titre="« Change juste le nom »" />
      {show(t, PH[10][1] + 1.5, PH[11][0] + 0.2) && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", opacity: seg(t, PH[10][1] + 1.5, PH[10][1] + 1.8) * (1 - seg(t, PH[11][0] - 0.1, PH[11][0] + 0.2)) }}>
          <div style={{ display: "inline-block", padding: "10px 26px", borderRadius: 30, background: "rgba(11,10,11,0.75)", border: `2px solid ${PINK}`, fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#fff" }}>30 secondes plus tard*</div>
          <div style={{ marginTop: 10, fontFamily: "Open Sans", fontSize: 24, color: "rgba(255,255,255,0.7)" }}>* temps mesuré : 27 à 35 s par lettre</div>
        </div>
      )}
      {end < 1 && <div style={{ opacity: 1 - end }}><Subtitles t={t} v={V} qui={QUI} /></div>}
      {end > 0 && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, opacity: end, transform: `translateY(${(1 - end) * 30}px)` }}>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 70, lineHeight: 1.1, color: "#fff", textAlign: "center", textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>Identifie-le<br /><span style={{ color: PINK_L }}>en commentaire ↓</span></div>
          <div style={{ fontFamily: "Open Sans", fontWeight: 600, fontSize: 34, color: "rgba(255,255,255,0.85)", textAlign: "center" }}>Celui qui envoie la même lettre partout.</div>
          <Img src={staticFile("logo-mymotiv.png")} style={{ width: 380, marginTop: 30, filter: `drop-shadow(0 0 16px ${PINK})` }} />
          <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 30, color: PINK_L }}>1re lettre offerte · lien en bio</div>
          <div style={{ position: "absolute", bottom: 330, fontFamily: "Open Sans", fontSize: 22, color: "rgba(255,255,255,0.5)" }}>Mise en scène · entreprises fictives</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
const show = (t: number, a: number, b: number) => t >= a && t < b;
