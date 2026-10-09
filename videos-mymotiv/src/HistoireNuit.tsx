// Histoire Motiv n°2 « Une heure du matin » (≈56 s, 30 i/s, 9:16, 3D low-poly) — même décor et mêmes personnages que
// l'épisode 1. Il est 1 h 10, le candidat réécrit la même phrase depuis une heure → le téléphone vibre : « Malheureusement… »
// (Atelier Nova, fictif) → Motiv : « c'est pas à toi qu'ils ont dit non, c'est à la lettre » → « Donne-moi l'offre » → le
// VRAI site en hologramme → « Tu la relis demain, reposé… c'est ta lettre » → « Je garde la lumière allumée. Va dormir. »
// → il part se coucher → CTA différent : Motiv se tourne vers nous, « Et toi ? T'es encore debout ? Colle-moi le lien de
// ton offre. Je t'attends. » (l'écran « Collez le lien de l'offre » s'allume au-dessus de lui).
// Mise en scène, entreprise fictive. Voix : voix-nuit.json (--voix candidat / --voix motiv). Son : synth_nuit.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { HUMAN, Human, MOTIV, Monde, Motiv, PINK, PINK_L, World } from "./motiv3d/Monde";
import { Keys, Shot, Voix, camAt, lerp, mouthOf, seg, track } from "./motiv3d/anim";
import { PLANS } from "./motiv3d/plans";
import { Atmos, EpisodeTag, Subtitles } from "./motiv3d/Overlay";
import voixJ from "./data/nuit-voix.json";
import env from "./data/nuit-env.json";
import cfg from "../voix-nuit.json";
import "./fonts";

const V = voixJ as Voix;
export const NUIT_DUR = V.duration;
const QUI = cfg.lignes.map((l) => l.qui);
const PH = V.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const W = (i: number) => V.mots.find((m) => m.i === i)?.t0 ?? 0;
const T = { dix: W(7), phrase: W(20), pile: W(31), malheur: W(32), encore: W(33), non: W(53), lettre3: W(58), montrer: W(70), offre: W(77),
  voila: W(78), taLettre: W(94), lumiere: W(107), dormir: W(110), debout: W(116), colle: W(117), attends: W(128), end: PH[14][1] };
const GEN = ["044", "045", "046", "048", "050", "052"];
const IMAGES = ["parcours/016-offre-lien.png", "parcours/008-cv-ajoute.png", ...GEN.map((g) => `shots/${g}-generation.png`), "shots/054-lettre.png", "parcours/009-offre.png"];
const BUZZ = PH[4][1] + 0.25, LEAVE = PH[12][1] + 0.1;

// ─── plans ───
const ECRAN: Shot = { pos: [-0.5, 1.12, -0.06], look: [-0.29, 0.87, -0.47], fov: 38, pos2: [-0.48, 1.1, -0.12] };
const FACE: Shot = { pos: [0.3, 1.06, 0.78], look: [0.3, 1.035, -0.42], fov: 44, pos2: [0.3, 1.055, 0.62] };
const SHOTS: [number, Shot][] = [
  [0, { ...PLANS.large, pos: [-0.12, 1.45, 2.6] }], [PH[1][0] - 0.2, PLANS.motiv], [PH[2][0] - 0.15, PLANS.candidat], [PH[3][0] - 0.15, ECRAN],
  [PH[4][0] - 0.15, PLANS.candidat], [BUZZ - 0.05, PLANS.telephone], [PH[5][0] - 0.15, PLANS.candidat], [PH[6][0] - 0.2, PLANS.motiv],
  [PH[8][0] - 0.2, PLANS.candidat], [PH[9][0] - 0.15, PLANS.motiv], [PH[9][1] + 0.1, PLANS.holo], [PH[10][0] + 1.3, PLANS.large],
  [PH[11][0] - 0.2, PLANS.candidat], [PH[12][0] - 0.15, PLANS.motiv], [LEAVE, { ...PLANS.large, pos2: [-0.12, 1.36, 2.1] }], [PH[13][0] - 0.6, FACE],
];

// ─── le candidat ───
const LOOK_M = { hYaw: 0.32, hPitch: 0.1, eyeX: 0, eyeY: 0 }, LOOK_H = { hYaw: 0.5, hPitch: -0.22, eyeY: 0.6 }, LOOK_PC = { hYaw: 0.02, hPitch: 0.24, eyeY: -0.6 };
const LOOK_TEL = { hYaw: 0.35, hPitch: 0.5, eyeY: -1 };
const REST = { aLx: 0.78, aLz: 0.1, aLe: 0.85, aRx: 0.78, aRz: 0.1, aRe: 0.85 }, TYPE = { aLx: 0.6, aLz: 0.06, aLe: 1.2, aRx: 0.6, aRz: 0.06, aRe: 1.2 };
const TIRED = { lids: 0.55, lean: 0.25, brow: -0.25 };
const H_KEYS: Keys<Human> = [
  [0, { ...TYPE, ...LOOK_PC, ...TIRED, type: 1 }], [PH[0][0] - 0.3, { type: 0, aLx: 2.3, aLz: 0.2, aLe: 2.35, hPitch: 0.15 }, 0.5], [PH[0][1] - 0.3, { ...LOOK_M, ...REST }, 0.5],
  [PH[1][1] + 0.1, { hPitch: 0.3, hRoll: -0.06 }, 0.4], [PH[2][0] + 0.1, { ...LOOK_M, hRoll: 0 }, 0.4],
  [PH[3][0], { ...LOOK_PC, ...TYPE, type: 1 }, 0.4], [PH[4][0] - 0.1, { ...LOOK_M, type: 0, aLx: 0.5, aLz: 0.4, aLe: 1.5, aRx: 0.5, aRz: 0.4, aRe: 1.5, brow: -0.5 }, 0.35],
  [BUZZ + 0.1, { ...LOOK_TEL, ...REST, brow: -0.2 }, 0.5],
  [PH[5][0] - 0.1, { hPitch: 0.45, hYaw: 0.25, lids: 0.65, brow: -0.65, lean: 0.32 }, 0.6], [PH[5][1] + 0.2, { hPitch: 0.55, hRoll: -0.1 }, 0.8],
  [PH[7][1] - 0.2, { ...LOOK_M, hRoll: 0, lids: 0.45, brow: -0.7, bUp: 0.4 }, 0.6], [PH[9][0] + 0.3, { brow: -0.3, bUp: 0.2 }, 0.6],
  [PH[9][1], { ...LOOK_H, lids: 0.3, lean: 0.2 }, 0.5], [PH[10][1], { ...LOOK_M, lids: 0.4, brow: -0.2, bUp: 0.3 }, 0.6],
  [PH[12][0] + 0.8, { lids: 0.35, brow: 0, bUp: 0.2, hRoll: 0.06 }, 0.6],
  [LEAVE + 0.1, { sit: 0, x: -0.5, z: -0.48, lean: 0, hPitch: 0.05, hYaw: 0.2, aLx: 0.12, aLz: 0.1, aLe: 0.2, aRx: 0.12, aRz: 0.1, aRe: 0.2, lids: 0.3 }, 0.8],
  [LEAVE + 1.0, { ry: -1.45, hYaw: 0 }, 0.6], [LEAVE + 1.4, { x: -1.7, z: -0.2, walk: 6 }, 1.6],
];
// ─── Motiv ───
const M_KEYS: Keys<Motiv> = [
  [0, { lid: 0.3, py: -0.3, px: -0.3, flap: 0.25 }], [PH[0][1], { py: 0, px: 0 }, 0.3],
  [PH[1][0], { lid: 0.2, flap: 0.35 }, 0.3], [PH[3][0], { lid: 0.25, rz: 0.08, flap: 0.45 }, 0.4], [PH[4][0], { rz: 0, lid: 0.15 }, 0.4],
  [BUZZ + 0.1, { px: -0.8, py: -0.5, eye: 1.1, lid: 0 }, 0.3], [PH[5][0] + 0.5, { px: 0, py: 0, flap: 0.7, eye: 1, lid: 0.15 }, 0.5],
  [PH[6][0], { rz: 0.12, hL: 0.35, smile: 0.2, y: 0.98, x: 0.3 }, 0.5], [PH[7][0] + 0.3, { hL: 0.55, hR: 0.2 }, 0.4], [PH[8][0], { hL: 0.2, hR: 0, rz: 0.05 }, 0.5],
  [PH[9][0], { flap: -0.2, eye: 1.1, lid: 0, rz: 0, smile: 0.4, y: 1.02, x: 0.34, hL: 0.6, hR: 0.6 }, 0.35], [PH[9][1], { glow: 1.6, hL: 0.35, hR: 0.35 }, 0.4],
  [PH[10][0], { smile: 0.8, lid: 0.2, flap: 0.3, glow: 1, eye: 1 }, 0.4], [PH[11][0], { smile: 0.5, hL: 0, hR: 0 }, 0.4],
  [PH[12][0], { smile: 0.9, lid: 0.32, rz: 0.08 }, 0.4], [LEAVE + 0.5, { px: -1, py: -0.1, rz: 0, smile: 0.6 }, 0.5],
  [PH[13][0] - 0.6, { ry: 0, x: 0.3, z: -0.42, y: 1.08, px: 0, py: 0, smile: 0.3, lid: 0.25, flap: 0.3, glow: 2.4 }, 0.7],
  [PH[14][0] - 0.1, { smile: 0.8, hL: 0.9, lid: 0.1, flap: 0.4 }, 0.4], [T.attends - 0.2, { hL: 0.3, rz: 0.1, smile: 1, lid: 0.3 }, 0.4],
];
const blinkAt = (t: number, seed: number) => { const k = ((t + seed) % 4.1); return k < 0.14 ? Math.sin((k / 0.14) * Math.PI) : 0; };

// ─── l'ordinateur : la même phrase écrite, effacée, réécrite ───
const TYPED: [number, number, string][] = [[0, 1.2, "Je suis très motivé par votre entreprise"], [9.0, 0.7, ""], [9.8, 1.2, "Passionné depuis toujours par"], [12.2, 0.5, ""], [12.8, 1.0, "Je suis très motivé"]];
const typedAt = (t: number) => {
  let prev = "", cur = "";
  for (const [t0, d, txt] of TYPED) {
    if (t < t0) break;
    const k = seg(t, t0, t0 + d);
    cur = txt === "" ? prev.slice(0, Math.round(prev.length * (1 - k))) : txt.slice(0, Math.round(txt.length * k));
    prev = txt;
  }
  return cur;
};

const holoAt = (t: number) => {
  const pos: [number, number, number] = [-0.05, 1.32, -0.62];
  if (t >= PH[14][0] - 0.2) return { on: seg(t, PH[14][0] - 0.2, PH[14][0] + 0.25) * (1 - seg(t, T.end + 0.2, T.end + 0.6)), src: IMAGES[9], crop: 1, pos: [0.3, 1.32, -0.45] as typeof pos, ry: 0, scale: 0.55 };
  if (t < PH[9][1] + 0.15) return { on: 0, src: IMAGES[0], crop: 1, pos, ry: -0.64, scale: 1 };
  const a = PH[9][1] + 0.15, gen0 = a + 1.6, letter0 = PH[10][0] - 0.25;
  const src = t < a + 0.8 ? IMAGES[0] : t < gen0 ? IMAGES[1] : t < letter0 ? IMAGES[2 + Math.min(5, Math.floor(seg(t, gen0, letter0) * 6))] : IMAGES[8];
  const crop = t < letter0 ? 1 : lerp(1, 0.62, seg(t, letter0, letter0 + 0.4));
  return { on: seg(t, a, a + 0.4) * (1 - seg(t, LEAVE + 0.4, LEAVE + 0.8)), src, crop, pos, ry: -0.64, scale: 1 };
};

export const HistoireNuit: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const cam = camAt(SHOTS, t, V.duration);
  const human = track(HUMAN, H_KEYS, t);
  human.mouth = mouthOf(V, QUI, env, "candidat", t);
  human.blink = Math.max(human.blink, blinkAt(t, 0.9));
  if (human.type > 0.5) { human.aLe += Math.sin(t * 21) * 0.05; human.aRe += Math.sin(t * 17 + 1) * 0.05; }
  const motiv = track(MOTIV, M_KEYS, t);
  motiv.mouth = mouthOf(V, QUI, env, "motiv", t);
  motiv.eye *= 1 - 0.9 * blinkAt(t, 2.6);
  const notif = seg(t, BUZZ + 0.25, BUZZ + 0.55);
  const w: World = {
    t, cam, human, motiv, holo: holoAt(t), lamp: 1,
    phone: { time: t < BUZZ ? "01:10" : "01:12", notif, light: t < BUZZ ? 0.12 : lerp(1, 0.12, seg(t, PH[6][0], PH[6][0] + 1)) },
    laptop: { typed: typedAt(t), cursor: Math.floor(t * 2) % 2 === 0, light: lerp(1, 0.08, seg(t, LEAVE + 1.0, LEAVE + 1.6)) },
  };
  const end = seg(t, T.end + 0.2, T.end + 0.7);
  return (
    <AbsoluteFill style={{ backgroundColor: "#05061a" }}>
      <Audio src={staticFile("audio/nuit.wav")} />
      <Monde w={w} images={IMAGES} />
      <Atmos t={t} dim={end * 0.35} />
      <EpisodeTag t={t} ep="ÉP. 2" titre="« Une heure du matin »" />
      {end < 1 && <div style={{ opacity: 1 - end }}><Subtitles t={t} v={V} qui={QUI} /></div>}
      {end > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: end, transform: `translateY(${(1 - end) * 30}px)` }}>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 60, lineHeight: 1.1, color: "#fff", textAlign: "center", textShadow: "0 6px 30px rgba(0,0,0,0.9)" }}>Colle le lien de ton offre.<br /><span style={{ color: PINK_L }}>Motiv t'attend.</span></div>
          <Img src={staticFile("logo-mymotiv.png")} style={{ width: 300, marginTop: 10, filter: `drop-shadow(0 0 16px ${PINK})` }} />
          <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 30, color: PINK_L, textShadow: "0 4px 16px rgba(0,0,0,0.9)" }}>Lien en bio · 1re lettre offerte</div>
          <div style={{ marginTop: 6, fontFamily: "Open Sans", fontSize: 22, color: "rgba(255,255,255,0.5)" }}>Mise en scène · entreprise fictive</div>
        </div>
      )}
    </AbsoluteFill>
  );
};
