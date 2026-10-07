// « Notre histoire » (60,4 s, 60 i/s, 9:16) — motion design futuriste (HUD, grille au sol, glitchs) sur la voix de
// l'utilisateur (public/audio/histoire-source.wav, montée par tools/voix-narrateur.py + voix-histoire.json).
// Hook : un chrono qui s'emballe (« 2 h… 3 h… ») et se rembobine sur « Moi ? 30 secondes. » → logo → le vrai parcours
// du site dans un téléphone holographique (l'offre, le CV, la génération) → lettre + CV adaptés → logo de l'entreprise
// et vérification « rien d'inventé » → pas de prompt, pas de robot qui déraille → la lettre qui sort de la pile →
// 1re lettre offerte → les prix → TROU SANS VOIX : comparatif avec l'outil gratuit de France Travail (test de
// l'utilisateur du 07/10/2026 : ≈ 15 min, 8 pages ; note relevée sur la fiche : 3,3/5 sur 9 votes ; MyMotiv : 5/5 sur
// 11 avis, affichés sur le site) → ce qu'on a en plus → « Gratuit, c'est bien. Recruté, c'est mieux. » → fin.
// Pas de logo ni d'interface de France Travail : seulement son nom (publicité comparative, faits vérifiables).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, go } from "./apple";
import { PINK, PINK_L, clamp, lerp, rng, seg } from "./common";
import { AppIcon, Flash, GlossPill, Shockwave, ease, pulse } from "./motion";
import voix from "./data/histoire-voix.json";
import "./fonts";

export const HISTOIRE_DUR = voix.duration;
const MONO = "DejaVu Sans Mono, Liberation Mono, monospace";
const RED = "#FF5C7A", GREY = "#8E8E93", INK = "#F5F5F7";

// temps clés (s), calés sur les mots de src/data/histoire-voix.json
export const K = {
  tu: 0.94, combien: 1.42, motiv: 2.76, h2: 3.99, h3: 4.93, moi: 5.69, s30: 6.49, flash: 7.32, avec: 8.26, mm: 8.44,
  phone: 8.95, offre: 9.4, cv: 10.6, ia: 11.64, lettre: 12.6, cv2: 13.48, entreprise: 14.4,
  logo0: 15.0, logo: 15.77, sans: 16.11, profil: 17.63,
  prompt0: 18.3, ecrire: 19.33, robot0: 19.8, m1: 19.92, m2: 20.6, m3: 21.3, pile0: 21.95, sort: 23.71, pile: 24.17,
  offerte0: 25.05, offerte: 26.05, prix0: 26.85, c1: 27.18, p1: 28.74, c2: 30.32, p2: 31.96, c3: 33.4, p3: 35.12,
  paye: 35.76, sansEng: 36.96, ft: 38.95, test: 41.5, vs: 45.5, plus: 49.4, punch: 51.9, end: 53.45, mm2: 53.6,
  lettre2: 54.8, clics: 56.0, bio: 56.97,
};
const GLITCHES = [0.02, 0.18, K.h2, K.h3, K.moi, K.flash, K.prompt0, K.ecrire + 0.08, K.m3, K.m3 + 0.35, K.pile0 - 0.05, K.prix0 - 0.05, K.ft - 0.1, K.ft + 0.3, K.vs, K.punch, K.punch + 0.5, K.end];
const SCENES: [number, string][] = [[0, "01 // TEMPS"], [K.flash, "02 // MYMOTIV"], [K.phone, "03 // PROCESS"], [K.logo0, "04 // VÉRIF"], [K.prompt0, "05 // SANS PROMPT"], [K.pile0, "06 // LA PILE"], [K.prix0, "07 // TARIFS"], [K.ft, "08 // COMPARATIF"], [K.end, "09 // GO"]];

const show = (t: number, a: number, b: number) => t >= a && t < b;
function blurIO(t: number, a: number, b: number, inD = 0.22, outD = 0.22): React.CSSProperties {
  const i = seg(t, a, a + inD), o = seg(t, b - outD, b);
  return { opacity: i * (1 - o), filter: `blur(${(1 - i) * 16 + o * 18}px)`, transform: `scale(${lerp(1.08, 1, i) * lerp(1, 1.1, o)})` };
}
const glitchK = (t: number) => GLITCHES.reduce((s, g) => s + pulse(t, g + 0.04, 0.06), 0);
const rgb = (g: number, base = "0 0 26px rgba(242,184,192,0.35)") =>
  g < 0.03 ? base : `${(g * 9).toFixed(1)}px 0 rgba(255,40,90,0.8), ${(-g * 9).toFixed(1)}px 0 rgba(40,220,255,0.75), ${base}`;
const hhmmss = (s: number) => {
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = Math.floor(s % 60);
  return [h, m, x].map((v) => String(v).padStart(2, "0")).join(":");
};

// ─── décor : grille au sol, halo, lignes de balayage, cadre HUD ───
const Grid: React.FC<{ t: number; o: number; horizon?: number }> = ({ t, o, horizon = 1250 }) => {
  if (o <= 0.01) return null;
  const hz = horizon, rows = Array.from({ length: 16 }, (_, i) => (i + ((t * 0.9) % 1)) / 16);
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
      <defs>
        <linearGradient id="gridFade" x1="0" y1={hz} x2="0" y2={1920} gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={PINK_L} stopOpacity={0} /><stop offset="0.25" stopColor={PINK} stopOpacity={0.55} /><stop offset="1" stopColor={PINK} stopOpacity={0.9} />
        </linearGradient>
      </defs>
      {rows.map((z, i) => { const y = hz + (1920 - hz) * Math.pow(z, 2.4); return <line key={i} x1={0} x2={1080} y1={y} y2={y} stroke="url(#gridFade)" strokeWidth={1 + z * 2} />; })}
      {Array.from({ length: 23 }, (_, j) => j - 11).map((j) => <line key={j} x1={540 + j * 14} y1={hz} x2={540 + j * 190} y2={1920} stroke="url(#gridFade)" strokeWidth={1.5} />)}
      <rect x={0} y={hz - 2} width={1080} height={4} fill={PINK_L} opacity={0.8} style={{ filter: `drop-shadow(0 0 14px ${PINK})` }} />
    </svg>
  );
};
const Backdrop: React.FC<{ t: number; grid: number }> = ({ t, grid }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 42%, #2A1A1E 0%, #140E10 40%, #0B0A0B 75%)" }} />
    <div style={{ position: "absolute", left: -300, right: -300, top: 1250 - 520, height: 1040, background: "radial-gradient(ellipse at 50% 50%, rgba(217,130,139,0.28) 0%, rgba(217,130,139,0) 60%)", opacity: grid }} />
    <Grid t={t} o={grid} />
  </>
);
const Scanlines: React.FC = () => (
  <>
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 4px)" }} />
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
  </>
);
const Bracket: React.FC<{ x: number; y: number; dx: number; dy: number; s?: number; c?: string; o?: number }> = ({ x, y, dx, dy, s = 46, c = PINK_L, o = 0.85 }) => (
  <div style={{ position: "absolute", left: dx > 0 ? x : x - s, top: dy > 0 ? y : y - s, width: s, height: s, opacity: o,
    borderLeft: dx > 0 ? `3px solid ${c}` : undefined, borderRight: dx < 0 ? `3px solid ${c}` : undefined,
    borderTop: dy > 0 ? `3px solid ${c}` : undefined, borderBottom: dy < 0 ? `3px solid ${c}` : undefined, filter: `drop-shadow(0 0 6px ${PINK})` }} />
);
const Hud: React.FC<{ t: number; o: number }> = ({ t, o }) => {
  const scene = [...SCENES].reverse().find(([a]) => t >= a)?.[1] ?? "";
  const tc = `T+${String(Math.floor(t / 60)).padStart(2, "0")}:${t.toFixed(2).padStart(5, "0")}`;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o, fontFamily: MONO, color: PINK_L, fontSize: 22, letterSpacing: 2 }}>
      <Bracket x={52} y={210} dx={1} dy={1} /><Bracket x={1028} y={210} dx={-1} dy={1} />
      <Bracket x={52} y={1640} dx={1} dy={-1} /><Bracket x={1028} y={1640} dx={-1} dy={-1} />
      <div style={{ position: "absolute", left: 70, top: 222, opacity: 0.8 }}>MM.SYS <span style={{ color: "#fff" }}>{scene}</span></div>
      <div style={{ position: "absolute", right: 70, top: 222, opacity: 0.8 }}>{tc}</div>
      <div style={{ position: "absolute", left: 70, top: 1596, opacity: 0.8 }}><span style={{ color: RED, opacity: Math.floor(t * 2) % 2 ? 1 : 0.25 }}>●</span> REC</div>
    </div>
  );
};

// Titre d'état (lisible sans le son), mots qui tombent, aberration chromatique pendant les glitchs
const Title: React.FC<{ t: number; a: number; b: number; y: number; size?: number; lines: [string, string?][]; g: number; stagger?: number }> = ({ t, a, b, y, size = 82, lines, g, stagger = 0.08 }) => {
  if (!show(t, a - 0.02, b)) return null;
  let n = 0;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: size, lineHeight: 1.1, letterSpacing: -1.5, color: "#fff", textShadow: rgb(g), ...blurIO(t, a, b, 0.12, 0.2) }}>
      {lines.map(([s, c], i) => {
        const t0 = a + n * stagger; n += s.split(" ").length;
        return <div key={i} style={{ color: c ?? "#fff" }}><TextDrop t={t} t0={t0} text={s} stagger={stagger} dur={0.28} from={[0, -50]} /></div>;
      })}
    </div>
  );
};
const Mono: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: MONO, color: PINK_L, fontSize: 24, letterSpacing: 3, ...style }}>{children}</div>
);
const Note: React.FC<{ t: number; a: number; b: number; y: number; children: React.ReactNode }> = ({ t, a, b, y, children }) =>
  show(t, a, b) ? <div style={{ position: "absolute", left: 60, right: 60, top: y, textAlign: "center", fontFamily: "Open Sans", fontSize: 25, color: "rgba(245,245,247,0.7)", opacity: seg(t, a, a + 0.25) * (1 - seg(t, b - 0.2, b)) }}>{children}</div> : null;

// Panneau « hologramme »
const holo = (k = 1, glow = 1): React.CSSProperties => ({
  background: "linear-gradient(160deg, rgba(48,26,32,0.78), rgba(16,11,13,0.82))", border: `2px solid rgba(242,184,192,${0.35 + 0.4 * glow})`,
  borderRadius: 28, boxShadow: `0 0 ${50 * glow}px rgba(217,130,139,${0.35 * glow * k}), inset 0 1px 0 rgba(255,255,255,0.12), 0 30px 80px rgba(0,0,0,0.6)`,
});

// ─── A–C : le chrono ───
const Chrono: React.FC<{ t: number; g: number }> = ({ t, g }) => {
  if (t >= K.flash + 0.1) return null;
  const r = rng(Math.floor(t * 60) + 7);
  let secs: number;
  if (t < K.h2) secs = lerp(14 * 60, 116 * 60, Math.pow(seg(t, 0.3, K.h2 - 0.05), 1.25));
  else if (t < K.h3) secs = 7200 + (t - K.h2) * 1100;
  else if (t < K.moi) secs = 10800 + (t - K.h3) * 1100;
  else secs = lerp(10800 + (K.moi - K.h3) * 1100, 30, Math.pow(seg(t, K.moi + 0.05, K.moi + 0.7), 0.6));
  const scramble = t < 0.32 || pulse(t, K.moi + 0.05, 0.05) > 0.5;
  const txt = scramble ? Array.from("00:00:00").map((c) => (c === ":" ? ":" : String(Math.floor(r() * 10)))).join("") : hhmmss(secs);
  const heat = t < K.moi ? clamp(secs / 10800) : 0;
  const col = t < K.moi ? `rgb(${lerp(245, 255, heat)},${lerp(245, 92, heat)},${lerp(247, 122, heat)})` : PINK_L;
  const after = t >= K.moi;
  const ringK = after ? ease(t, K.s30 - 0.45, K.s30 + 0.35) : heat;
  const big30 = seg(t, K.s30 - 0.05, K.s30 + 0.1);
  const out = seg(t, K.flash - 0.3, K.flash);
  const sc = lerp(1, 0.06, Math.pow(out, 2)) * (1 + 0.06 * pulse(t, K.h2, 0.08) + 0.06 * pulse(t, K.h3, 0.08)) * (1 + 0.08 * pulse(t, K.s30, 0.1));
  const R = 330, C = 2 * Math.PI * R;
  return (
    <div style={{ position: "absolute", left: 540 - 420, top: 900 - 420, width: 840, height: 840, transform: `scale(${sc}) rotate(${out * 120}deg)`, opacity: 1 - seg(t, K.flash - 0.05, K.flash + 0.05) }}>
      <svg width={840} height={840} style={{ position: "absolute", inset: 0 }}>
        <g transform={`rotate(${t * 40} 420 420)`}>
          {Array.from({ length: 72 }, (_, i) => { const a = (i / 72) * Math.PI * 2, l = i % 6 ? 14 : 30;
            return <line key={i} x1={420 + Math.cos(a) * 395} y1={420 + Math.sin(a) * 395} x2={420 + Math.cos(a) * (395 - l)} y2={420 + Math.sin(a) * (395 - l)} stroke={after ? PINK_L : "#6E6E73"} strokeWidth={i % 6 ? 2 : 4} opacity={0.8} />; })}
        </g>
        <circle cx={420} cy={420} r={R} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={22} />
        <circle cx={420} cy={420} r={R} fill="none" stroke={after ? PINK : col} strokeWidth={22} strokeLinecap="round" strokeDasharray={`${C * clamp(ringK)} ${C}`} transform="rotate(-90 420 420)" style={{ filter: `drop-shadow(0 0 18px ${after ? PINK : RED})` }} />
        <circle cx={420} cy={420} r={R - 40} fill="none" stroke="rgba(242,184,192,0.25)" strokeWidth={2} strokeDasharray="6 10" transform={`rotate(${-t * 60} 420 420)`} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 255, textAlign: "center" }}>
        <Mono style={{ fontSize: 24, color: after ? PINK_L : "#C7C7CC" }}>{after ? "MYMOTIV // CHRONO" : "TEMPS PASSÉ · 1 LETTRE"}</Mono>
      </div>
      {big30 < 1 && <div style={{ position: "absolute", left: 0, right: 0, top: 360, textAlign: "center", fontFamily: MONO, fontSize: 112, fontWeight: 700, color: col, letterSpacing: 2, textShadow: rgb(g + (scramble ? 0.6 : 0), `0 0 30px ${t < K.moi ? "rgba(255,92,122,0.4)" : "rgba(242,184,192,0.5)"}`), opacity: 1 - big30, transform: `translateX(${(r() - 0.5) * 30 * g}px)` }}>{txt}</div>}
      {big30 > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 250, color: PINK_L, letterSpacing: -6, opacity: big30, transform: `scale(${lerp(1.6, 1, ease(t, K.s30 - 0.05, K.s30 + 0.25))})`, textShadow: `0 0 50px ${PINK}` }}>30 s<span style={{ fontSize: 90, verticalAlign: "top" }}>*</span></div>}
      {!after && t > 0.6 && (
        <div style={{ position: "absolute", left: 220, right: 220, top: 540 }}>
          <Mono style={{ fontSize: 20, color: heat > 0.95 ? RED : "#C7C7CC", display: "flex", justifyContent: "space-between" }}><span>PATIENCE</span><span>{Math.round((1 - heat) * 100)} %</span></Mono>
          <div style={{ marginTop: 10, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ width: `${(1 - heat) * 100}%`, height: "100%", background: heat > 0.66 ? RED : PINK_L, boxShadow: `0 0 12px ${heat > 0.66 ? RED : PINK}` }} />
          </div>
        </div>
      )}
    </div>
  );
};

// ─── E : téléphone holographique avec les vraies captures du site ───
const P = (n: string) => staticFile(`parcours/${n}.png`);
const GEN = ["036", "037", "038", "039", "040", "041", "042", "043", "044", "045", "046", "047"];
function phoneShot(t: number): string {
  if (t < K.offre) return P("009-offre");
  if (t < K.offre + 0.9) return P(`0${10 + Math.min(6, Math.floor(seg(t, K.offre, K.offre + 0.85) * 7))}-offre-lien`);
  if (t < K.cv - 0.05) return P("016-offre-lien");
  if (t < K.cv + 0.25) return P("007-cv");
  if (t < K.ia - 0.1) return P("008-cv-ajoute");
  const i = Math.min(GEN.length - 1, Math.floor(seg(t, K.ia - 0.1, K.lettre) * GEN.length));
  return P(`${GEN[i]}-generation`);
}
const PHONE_SC = 0.5, PW = 1080 * PHONE_SC, PH = 1920 * PHONE_SC;
const HoloPhone: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, K.phone, K.logo0 + 0.2)) return null;
  const inK = ease(t, K.phone, K.phone + 0.55), back = ease(t, K.lettre - 0.15, K.lettre + 0.4), out = seg(t, K.logo0 - 0.2, K.logo0 + 0.2);
  const ry = lerp(38, -7, inK) + Math.sin(t * 1.4) * 3, rx = 6 + Math.sin(t * 1.1) * 2;
  const scanning = show(t, K.ia - 0.1, K.lettre);
  const scanY = ((t - K.ia) * 1.4 % 1) * PH;
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1700 }}>
      <div style={{ position: "absolute", left: 540 - PW / 2, top: 560, width: PW, height: PH, transformStyle: "preserve-3d",
        transform: `translateY(${lerp(80, 0, inK) + back * 140}px) rotateY(${ry}deg) rotateX(${rx}deg) scale(${lerp(0.7, 1, inK) * lerp(1, 0.78, back)})`,
        filter: `blur(${(1 - inK) * 16 + back * 7 + out * 10}px) brightness(${lerp(1, 0.45, back)})`, opacity: inK * (1 - out) }}>
        <div style={{ position: "absolute", inset: -14, borderRadius: 64, border: `2px solid ${PINK_L}`, boxShadow: `0 0 60px rgba(217,130,139,0.55), inset 0 0 40px rgba(217,130,139,0.25)` }} />
        <div style={{ position: "absolute", inset: 0, borderRadius: 50, overflow: "hidden", background: "#0B0A0B" }}>
          <Img src={phoneShot(t)} style={{ width: PW, height: PH }} />
          {scanning && <div style={{ position: "absolute", left: 0, right: 0, top: scanY - 60, height: 120, background: `linear-gradient(180deg, rgba(242,184,192,0), rgba(242,184,192,0.45), rgba(242,184,192,0))`, mixBlendMode: "screen" }} />}
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(242,184,192,0.05) 0px, rgba(242,184,192,0.05) 1px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)" }} />
        </div>
        <Bracket x={-40} y={-40} dx={1} dy={1} s={60} /><Bracket x={PW + 40} y={-40} dx={-1} dy={1} s={60} />
        <Bracket x={-40} y={PH + 40} dx={1} dy={-1} s={60} /><Bracket x={PW + 40} y={PH + 40} dx={-1} dy={-1} s={60} />
      </div>
    </div>
  );
};

// Lettre (vraie capture) et CV adapté (dessiné), éjectés du téléphone
const LETTER_BOX: [number, number, number, number] = [83, 158, 915, 1602];
const LetterDoc: React.FC<{ sc: number; glow?: number }> = ({ sc, glow = 1 }) => (
  <div style={{ width: LETTER_BOX[2] * sc, height: LETTER_BOX[3] * sc, borderRadius: 26 * sc, overflow: "hidden", position: "relative", boxShadow: `0 0 0 3px rgba(242,184,192,${0.8 * glow}), 0 0 ${70 * glow}px rgba(217,130,139,0.6), 0 30px 80px rgba(0,0,0,0.6)` }}>
    <Img src={P("048-lettre")} style={{ position: "absolute", left: -LETTER_BOX[0] * sc, top: -LETTER_BOX[1] * sc, width: 1080 * sc, height: 1920 * sc }} />
  </div>
);
const CvDoc: React.FC<{ w: number; h: number }> = ({ w, h }) => {
  const s = w / 380;
  const line = (wd: number, key: number, dark = false) => <div key={key} style={{ height: 9 * s, width: `${wd}%`, borderRadius: 5 * s, background: dark ? "#3A3A3C" : "#D8D2D4", marginTop: 11 * s }} />;
  return (
    <div style={{ width: w, height: h, borderRadius: 18 * s, background: "#FBF8F7", overflow: "hidden", position: "relative", boxShadow: `0 0 0 3px rgba(242,184,192,0.8), 0 0 70px rgba(217,130,139,0.6), 0 30px 80px rgba(0,0,0,0.6)`, fontFamily: "Poppins" }}>
      <div style={{ height: 120 * s, background: `linear-gradient(120deg, ${PINK}, #B9606B)`, padding: `${22 * s}px ${24 * s}px`, color: "#fff" }}>
        <div style={{ fontWeight: 700, fontSize: 30 * s, lineHeight: 1.1 }}>Camille Dubois</div>
        <div style={{ fontFamily: "Open Sans", fontSize: 16 * s, marginTop: 6 * s, opacity: 0.95 }}>Manager des ventes</div>
      </div>
      <div style={{ padding: `${18 * s}px ${24 * s}px`, color: "#1D1D1F" }}>
        <div style={{ fontWeight: 700, fontSize: 15 * s, color: PINK, letterSpacing: 1 }}>EXPÉRIENCE</div>
        {[92, 80, 86, 60].map((v, i) => line(v, i, i === 0))}
        <div style={{ fontWeight: 700, fontSize: 15 * s, color: PINK, letterSpacing: 1, marginTop: 22 * s }}>COMPÉTENCES</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7 * s, marginTop: 10 * s }}>
          {["Management", "Conseil client", "Merchandising", "Objectifs"].map((c) => <span key={c} style={{ fontFamily: "Open Sans", fontSize: 13 * s, padding: `${4 * s}px ${10 * s}px`, borderRadius: 20 * s, background: "#F6E3E6", color: "#9E4B55", fontWeight: 600 }}>{c}</span>)}
        </div>
        <div style={{ fontWeight: 700, fontSize: 15 * s, color: PINK, letterSpacing: 1, marginTop: 22 * s }}>FORMATION</div>
        {[70, 54].map((v, i) => line(v, 10 + i))}
      </div>
      <div style={{ position: "absolute", right: 14 * s, bottom: 14 * s, display: "flex", alignItems: "center", gap: 6 * s, fontFamily: "Open Sans", fontSize: 12 * s, color: "#6E6E73" }}>
        <Img src={staticFile("company.png")} style={{ width: 22 * s, height: 22 * s, borderRadius: 6 * s }} />pour Maison Lumen
      </div>
    </div>
  );
};
const Docs: React.FC<{ t: number; g: number }> = ({ t, g }) => {
  if (!show(t, K.lettre - 0.1, K.prompt0)) return null;
  const kL = ease(t, K.lettre - 0.05, K.lettre + 0.45), kC = ease(t, K.cv2 - 0.15, K.cv2 + 0.35);
  const focus = ease(t, K.logo0 - 0.2, K.logo0 + 0.4);   // la lettre vient au centre, le CV s'efface
  const out = seg(t, K.prompt0 - 0.3, K.prompt0);
  const scL = lerp(0.4, 0.56, focus), wL = LETTER_BOX[2] * scL, hL = LETTER_BOX[3] * scL;
  const xL = lerp(lerp(540 - 160, 70, kL), 540 - wL / 2, focus), yL = lerp(lerp(1000, 610, kL), 560, focus);
  const lx = xL + (110 - 83) * scL, ly = yL + (186 - 158) * scL, ls = 100 * scL;   // logo de l'entreprise sur la lettre
  const lock = ease(t, K.logo - 0.5, K.logo), locked = t >= K.logo;
  const scan = seg(t, K.sans, K.profil + 0.2);
  const tags: [number, string][] = [[0.25, "ton expérience ✓"], [0.47, "tes chiffres ✓"], [0.68, "tes compétences ✓"]];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: `blur(${out * 16}px)` }}>
      <div style={{ position: "absolute", left: lerp(540 - 160, 634, kC), top: lerp(1000, 610, kC), opacity: kC * (1 - focus), transform: `rotateY(-10deg) scale(${lerp(0.4, 1, kC)})`, filter: `blur(${focus * 12}px)` }}>
        <CvDoc w={376} h={641} />
        <Mono style={{ marginTop: 20, textAlign: "center", fontSize: 22 }}>CV_ADAPTÉ.PDF</Mono>
      </div>
      <div style={{ position: "absolute", left: xL, top: yL, opacity: kL, transform: `scale(${lerp(0.4, 1, kL)})`, transformOrigin: "50% 0%" }}>
        <LetterDoc sc={scL} />
        {focus < 0.5 && <Mono style={{ marginTop: 20, textAlign: "center", fontSize: 22, opacity: 1 - focus * 2 }}>LETTRE.PDF</Mono>}
        {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: -20, right: -20, top: hL * scan - 3, height: 6, background: PINK_L, boxShadow: `0 0 24px 6px ${PINK}` }} />}
      </div>
      {/* visée sur le logo de l'entreprise */}
      {show(t, K.logo - 0.55, K.sans + 0.3) && (() => {
        const pad = lerp(220, 10, lock), o = seg(t, K.logo - 0.55, K.logo - 0.4) * (1 - seg(t, K.sans, K.sans + 0.3));
        const c = locked ? PINK_L : "#fff";
        return (
          <div style={{ position: "absolute", left: lx - pad, top: ly - pad, width: ls + pad * 2, height: ls + pad * 2, opacity: o, transform: `rotate(${(1 - lock) * 90}deg)` }}>
            <Bracket x={0} y={0} dx={1} dy={1} s={26} c={c} /><Bracket x={ls + pad * 2} y={0} dx={-1} dy={1} s={26} c={c} />
            <Bracket x={0} y={ls + pad * 2} dx={1} dy={-1} s={26} c={c} /><Bracket x={ls + pad * 2} y={ls + pad * 2} dx={-1} dy={-1} s={26} c={c} />
          </div>
        );
      })()}
      {show(t, K.logo, K.sans + 0.3) && (
        <div style={{ position: "absolute", left: lx + ls + 30, top: ly + ls / 2 - 26, padding: "10px 20px", borderRadius: 30, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 26, boxShadow: `0 0 30px ${PINK}`, transform: `scale(${go(t, K.logo, K.logo + 0.3, 0.3, 1)})`, transformOrigin: "0% 50%", opacity: 1 - seg(t, K.sans, K.sans + 0.3) }}>LOGO DE L'ENTREPRISE ✓</div>
      )}
      {show(t, K.logo - 0.05, K.logo + 0.4) && <div style={{ position: "absolute", left: lx - 40, top: ly - 40, width: ls + 80, height: ls + 80, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,255,255,${0.9 * pulse(t, K.logo, 0.1)}), rgba(242,184,192,0) 70%)` }} />}
      {/* vérification : chaque passage vient du CV */}
      {tags.map(([at, s], i) => scan > at - 0.02 && (
        <div key={i} style={{ position: "absolute", right: 34, top: yL + hL * at - 24, padding: "9px 18px", borderRadius: 26, ...holo(1, 1), fontFamily: MONO, fontSize: 21, color: PINK_L, letterSpacing: 1, whiteSpace: "nowrap", zIndex: 5,
          transform: `translateX(${go(t, K.sans + (K.profil + 0.2 - K.sans) * at, K.sans + (K.profil + 0.2 - K.sans) * at + 0.3, 60, 0)}px)`, opacity: seg(t, K.sans + (K.profil - K.sans) * at, K.sans + (K.profil - K.sans) * at + 0.15), textShadow: rgb(g) }}>
          SOURCE : {s}
        </div>
      ))}
    </div>
  );
};

// ─── G : pas de prompt ───
const PROMPT = "Agis comme un expert RH et rédige une lettre de motivation percutante, professionnelle mais pas trop, pour ce poste, en reprenant mon CV et…";
const PromptBar: React.FC<{ t: number; g: number }> = ({ t, g }) => {
  if (!show(t, K.prompt0, K.robot0 + 0.1)) return null;
  const inK = ease(t, K.prompt0, K.prompt0 + 0.35), cut = ease(t, K.ecrire - 0.05, K.ecrire + 0.15), split = ease(t, K.ecrire + 0.15, K.robot0);
  const typed = PROMPT.slice(0, Math.round(PROMPT.length * seg(t, K.prompt0 + 0.15, K.ecrire)));
  const half = (side: -1 | 1) => (
    <div style={{ position: "absolute", left: 70, top: 830, width: 940, height: 170, ...holo(1, 0.6), clipPath: side < 0 ? "polygon(0 0, 52% 0, 46% 100%, 0 100%)" : "polygon(52% 0, 100% 0, 100% 100%, 46% 100%)",
      transform: `translate(${side * split * 160}px, ${split * 220}px) rotate(${side * split * 14}deg)`, opacity: inK * (1 - split), overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 34, right: 34, top: 28, fontFamily: MONO, fontSize: 30, color: "#E5E5EA", lineHeight: 1.5, display: "flex", justifyContent: "flex-end", whiteSpace: "nowrap", overflow: "hidden" }}>
        <span>{typed}<span style={{ color: PINK, opacity: Math.floor(t * 4) % 2 }}>▌</span></span>
      </div>
      <div style={{ position: "absolute", left: 34, bottom: 22, fontFamily: MONO, fontSize: 20, color: GREY, letterSpacing: 2 }}>PROMPT · {typed.length} CARACTÈRES</div>
    </div>
  );
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {half(-1)}{half(1)}
      {cut > 0 && split < 1 && <div style={{ position: "absolute", left: 30, top: 912, width: 1020 * cut, height: 10, borderRadius: 5, background: PINK_L, boxShadow: `0 0 30px 8px ${PINK}`, transform: "rotate(-6deg)", transformOrigin: "0 50%", opacity: 1 - split, textShadow: rgb(g) }} />}
    </div>
  );
};

// ─── H : le robot qui déraille ───
const BUBBLES: [number, string, boolean][] = [
  [K.m1, "Voici une lettre de motivation percutante !", false],
  [K.m2, "Bien sûr ! Voici une version plus professionnelle.", false],
  [K.m3, "En tant que modèle, je Madame Madame ▓▒░ Monsieur Monsieur ░▒▓ ERREUR", true],
];
const Robot: React.FC<{ t: number; g: number }> = ({ t, g }) => {
  if (!show(t, K.robot0, K.pile0 + 0.1)) return null;
  const fall = ease(t, K.pile0 - 0.4, K.pile0);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {BUBBLES.map(([at, s, bad], i) => {
        const k = ease(t, at - 0.05, at + 0.3), r = rng(Math.floor(t * 30) + i);
        const jit = bad ? clamp((t - at) / 0.3) * (1 - fall) : 0;
        return (
          <div key={i} style={{ position: "absolute", left: 80, top: 560 + i * 250, width: 820, padding: "26px 32px", borderRadius: "34px 34px 34px 10px",
            background: bad ? "rgba(70,18,28,0.85)" : "rgba(44,44,46,0.9)", border: `2px solid ${bad ? RED : "#48484A"}`, boxShadow: bad ? `0 0 40px rgba(255,92,122,0.45)` : "0 20px 60px rgba(0,0,0,0.5)",
            opacity: k * (1 - fall), transform: `translate(${lerp(-80, 0, k) + (r() - 0.5) * 40 * jit}px, ${fall * (300 + i * 120)}px) rotate(${fall * (i - 1) * 12}deg)`,
            filter: `blur(${fall * 10}px)` }}>
            <Mono style={{ fontSize: 20, color: bad ? RED : GREY }}>MESSAGE {i + 1}{bad ? " · ÇA DÉRAILLE" : ""}</Mono>
            <div style={{ marginTop: 10, fontFamily: "Open Sans", fontSize: 36, lineHeight: 1.35, color: bad ? "#FFD3DB" : INK, textShadow: bad ? rgb(0.6 + g) : "none" }}>{s}</div>
          </div>
        );
      })}
    </div>
  );
};

// ─── I–J : la lettre qui sort de la pile, 1re lettre offerte ───
const Pile: React.FC<{ t: number; g: number }> = ({ t }) => {
  if (!show(t, K.pile0 - 0.05, K.prix0 + 0.1)) return null;
  const inK = ease(t, K.pile0, K.pile0 + 0.5), rise = ease(t, K.sort - 0.35, K.pile + 0.1), out = seg(t, K.prix0 - 0.35, K.prix0);
  const stamp = ease(t, K.offerte - 0.08, K.offerte + 0.12);
  const r = rng(11);
  const cards = Array.from({ length: 10 }, (_, i) => ({ dz: i * 16, rz: (r() - 0.5) * 22, dx: (r() - 0.5) * 70 }));
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1500, opacity: 1 - out, filter: `blur(${out * 16}px)` }}>
      {/* faisceau */}
      <div style={{ position: "absolute", left: 540 - 230, top: 0, width: 460, height: 1350, background: "linear-gradient(180deg, rgba(242,184,192,0), rgba(242,184,192,0.28) 60%, rgba(242,184,192,0.05))", opacity: rise * 0.9, filter: "blur(30px)" }} />
      <div style={{ position: "absolute", left: 540 - 220, top: 1060, width: 440, height: 600, transformStyle: "preserve-3d", transform: `rotateX(64deg) scale(${lerp(0.7, 1, inK)})`, opacity: inK }}>
        {cards.map((c, i) => (
          <div key={i} style={{ position: "absolute", inset: 0, borderRadius: 18, background: i % 2 ? "#3A3A3C" : "#48484A", border: "1px solid #5A5A5E", transform: `translateZ(${c.dz}px) translateX(${c.dx}px) rotateZ(${c.rz}deg)`, boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}>
            {[0, 1, 2, 3, 4].map((j) => <div key={j} style={{ position: "absolute", left: 40, right: 40 + (j % 3) * 50, top: 70 + j * 60, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.12)" }} />)}
          </div>
        ))}
      </div>
      {/* LA lettre */}
      <div style={{ position: "absolute", left: 540 - 220, top: lerp(1080, 560, rise), width: 440, height: 600, transformStyle: "preserve-3d", transform: `rotateX(${lerp(64, 0, rise)}deg) translateZ(${lerp(176, 0, rise)}px) scale(${lerp(0.7 + 0.3 * inK, 1.12, rise)})`, opacity: inK }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: "#FBF8F7", boxShadow: `0 0 0 3px ${PINK_L}, 0 0 ${90 * (0.3 + rise)}px rgba(217,130,139,0.8)`, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 34, top: 34, display: "flex", alignItems: "center", gap: 14 }}>
            <Img src={staticFile("company.png")} style={{ width: 62, height: 62, borderRadius: 14 }} />
            <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 24, color: "#1D1D1F" }}>Pour Maison Lumen</div>
          </div>
          {[0, 1, 2, 3, 4, 5, 6].map((j) => <div key={j} style={{ position: "absolute", left: 34, right: 34 + (j % 3) * 46, top: 140 + j * 52, height: 14, borderRadius: 7, background: j === 0 ? "#3A3A3C" : "#DDD6D8" }} />)}
          <div style={{ position: "absolute", left: 34, bottom: 34, fontFamily: "Poppins", fontWeight: 600, fontSize: 22, color: PINK }}>Camille Dubois</div>
        </div>
        {stamp > 0 && (
          <div style={{ position: "absolute", left: 40, right: 40, top: 230, padding: "18px 0", textAlign: "center", border: `6px solid ${PINK}`, borderRadius: 20, color: PINK, background: "rgba(251,248,247,0.9)",
            fontFamily: "Poppins", fontWeight: 700, fontSize: 64, letterSpacing: 4, transform: `rotate(-9deg) scale(${lerp(2.6, 1, stamp)})`, opacity: clamp(stamp * 3), boxShadow: `0 0 40px rgba(217,130,139,${0.6 * stamp})` }}>OFFERTE</div>
        )}
      </div>
      <Shockwave t={t} t0={K.offerte} x={540} y={860} r={600} />
    </div>
  );
};

// ─── K : les prix ───
const CARDS: { at: number; pAt: number; tag: string; price: string; sub: string; badge?: string; y: number }[] = [
  { at: K.c1, pAt: K.p1, tag: "CANDIDATURE COMPLÈTE", price: "1,99 €", sub: "1 lettre + son CV adapté", y: 470 },
  { at: K.c2, pAt: K.p2, tag: "SEMAINE", price: "3,99 €", sub: "Lettres illimitées*", badge: "Recommandé", y: 830 },
  { at: K.c3, pAt: K.p3, tag: "ACCÈS À VIE", price: "24,99 €", sub: "120 lettres, sans date limite", y: 1190 },
];
const Prices: React.FC<{ t: number; g: number }> = ({ t, g }) => {
  if (!show(t, K.prix0, K.ft)) return null;
  const out = seg(t, K.ft - 0.3, K.ft);
  const active = CARDS.reduce((a, c, i) => (t >= c.at ? i : a), -1);
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1600, opacity: 1 - out, filter: `blur(${out * 18}px)` }}>
      <Mono style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontSize: 24, opacity: seg(t, K.prix0, K.prix0 + 0.3) }}>TARIFS // PRIX TTC</Mono>
      {CARDS.map((c, i) => {
        if (t < c.at - 0.05) return null;
        const k = ease(t, c.at - 0.05, c.at + 0.45), on = i === active;
        const r = rng(Math.floor(t * 30) + i * 13);
        const rolling = t < c.pAt;
        const price = rolling ? Array.from(c.price).map((ch) => (/[0-9]/.test(ch) ? String(Math.floor(r() * 10)) : ch)).join("") : c.price;
        const land = pulse(t, c.pAt + 0.04, 0.08);
        return (
          <div key={i} style={{ position: "absolute", left: 110, top: c.y, width: 860, height: 320, ...holo(k, on ? 1 : 0.25), padding: "34px 44px",
            transform: `rotateX(${lerp(-70, 0, k)}deg) translateZ(${lerp(-400, 0, k)}px) scale(${(on ? 1 : 0.94) * (1 + 0.04 * land)})`, transformOrigin: "50% 0%",
            opacity: k * (on ? 1 : 0.62), filter: `blur(${on ? 0 : 1.2}px)` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <Mono style={{ fontSize: 26, color: PINK_L }}>{c.tag}</Mono>
              {c.badge && <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 22, padding: "4px 16px", borderRadius: 20, background: PINK, color: "#fff" }}>{c.badge}</span>}
            </div>
            <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 124, letterSpacing: -4, color: rolling ? "rgba(255,255,255,0.55)" : "#fff", marginTop: 6, lineHeight: 1.1, textShadow: rolling ? rgb(0.5) : rgb(g + land * 0.5, "0 0 30px rgba(242,184,192,0.45)") }}>{t >= c.pAt - 0.5 ? price : ""}</div>
            <div style={{ fontFamily: "Open Sans", fontWeight: 600, fontSize: 32, color: "rgba(245,245,247,0.85)", marginTop: 4 }}>{c.sub}</div>
            {i === 2 && (
              <div style={{ position: "absolute", right: 36, top: 36, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 12 }}>
                {[[K.paye, "Payé une seule fois"], [K.sansEng, "Sans abonnement"]].map(([at, s]) => t >= (at as number) - 0.05 && (
                  <span key={s as string} style={{ fontFamily: "Open Sans", fontWeight: 600, fontSize: 24, padding: "8px 18px", borderRadius: 22, border: `2px solid ${PINK_L}`, color: PINK_L, background: "rgba(217,130,139,0.12)", transform: `scale(${go(t, at as number, (at as number) + 0.3, 0.5, 1)})`, transformOrigin: "100% 50%" }}>✓ {s as string}</span>
                ))}
              </div>
            )}
          </div>
        );
      })}
      <Note t={t} a={K.c2 + 0.3} b={K.ft} y={1540}>* 30 lettres par semaine au maximum</Note>
    </div>
  );
};

// ─── L : le comparatif (sans voix) ───
const Stars: React.FC<{ v: number; k: number; color: string; size?: number }> = ({ v, k, color, size = 44 }) => (
  <div style={{ display: "inline-flex", gap: 4 }}>
    {[0, 1, 2, 3, 4].map((i) => {
      const fill = clamp(v - i) * clamp(k * 5 - i);
      return (
        <span key={i} style={{ position: "relative", fontSize: size, lineHeight: 1, color: "rgba(255,255,255,0.18)" }}>★
          <span style={{ position: "absolute", left: 0, top: 0, width: `${fill * 100}%`, overflow: "hidden", color, textShadow: `0 0 14px ${color}` }}>★</span>
        </span>
      );
    })}
  </div>
);
const Compare: React.FC<{ t: number; g: number }> = ({ t, g }) => {
  if (!show(t, K.ft - 0.05, K.end + 0.1)) return null;
  const pages = Math.min(8, 1 + Math.floor(seg(t, K.test + 0.4, K.test + 2.9) * 8));
  const mins = 15 * 60 * Math.pow(seg(t, K.test + 0.3, K.test + 2.9), 1.2);
  const ROWS: { label: string; l: string; r: string; at: number; kind: "time" | "steps" | "note" }[] = [
    { label: "TEMPS POUR UNE LETTRE", l: "≈ 15 min", r: "30 s*", at: K.vs + 0.35, kind: "time" },
    { label: "PARCOURS", l: "8 pages", r: "5 clics", at: K.vs + 1.15, kind: "steps" },
    { label: "NOTE DES UTILISATEURS", l: "3,3/5", r: "5/5", at: K.vs + 1.95, kind: "note" },
  ];
  const PLUS = ["Analyse de l'offre + score", "Lettre et CV adaptés", "Logo de l'entreprise", "Ajustements en 1 clic", "Tes lettres gardées"];
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* L1 : la question */}
      {show(t, K.ft, K.test) && (
        <div style={{ position: "absolute", inset: 0, ...blurIO(t, K.ft, K.test, 0.15, 0.25) }}>
          <Mono style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", fontSize: 26 }}>{"COMPARATIF // LETTRE DE MOTIVATION".slice(0, Math.round(34 * seg(t, K.ft, K.ft + 0.5)))}</Mono>
          <div style={{ position: "absolute", left: 40, right: 40, top: 650, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 88, lineHeight: 1.12, letterSpacing: -2, color: "#fff", textShadow: rgb(g) }}>
            <TextDrop t={t} t0={K.ft + 0.2} text="Et l'outil gratuit" stagger={0.1} dur={0.3} /><br />
            <TextDrop t={t} t0={K.ft + 0.55} text="de" stagger={0.1} dur={0.3} />{" "}
            <span style={{ color: PINK_L }}><TextDrop t={t} t0={K.ft + 0.65} text="France Travail ?" stagger={0.12} dur={0.3} /></span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", fontFamily: "Open Sans", fontSize: 36, color: "rgba(245,245,247,0.8)", opacity: seg(t, K.ft + 1.3, K.ft + 1.6) }}>On l'a testé pour toi.</div>
        </div>
      )}
      {/* L2 : le test */}
      {show(t, K.test, K.vs) && (
        <div style={{ position: "absolute", inset: 0, ...blurIO(t, K.test, K.vs, 0.2, 0.25) }}>
          <Title t={t} a={K.test} b={K.vs} y={330} size={76} g={g} lines={[["Notre test de"], ["l'outil gratuit", PINK_L]]} />
          <div style={{ position: "absolute", left: 80, top: 600, width: 440, height: 520, ...holo(1, 0.6), padding: 34 }}>
            <Mono style={{ fontSize: 22 }}>CHRONO</Mono>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 100, color: "#fff", marginTop: 60, textAlign: "center", textShadow: rgb(g) }}>{`${String(Math.floor(mins / 60)).padStart(2, "0")}:${String(Math.floor(mins % 60)).padStart(2, "0")}`}</div>
            <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 44, color: PINK_L, textAlign: "center", marginTop: 50, opacity: seg(t, K.test + 2.8, K.test + 3.0) }}>≈ 15 min</div>
          </div>
          <div style={{ position: "absolute", left: 560, top: 600, width: 440, height: 520, ...holo(1, 0.6), padding: 34 }}>
            <Mono style={{ fontSize: 22 }}>PAGES OUVERTES</Mono>
            <div style={{ position: "absolute", left: 120, top: 120, width: 200, height: 250 }}>
              {Array.from({ length: pages }, (_, i) => (
                <div key={i} style={{ position: "absolute", left: i * 10, top: i * 10, width: 130, height: 170, borderRadius: 12, border: `2px solid ${i === pages - 1 ? PINK_L : "rgba(242,184,192,0.35)"}`, background: "rgba(20,12,15,0.9)" }}>
                  {[0, 1, 2].map((j) => <div key={j} style={{ margin: "18px 16px 0", height: 8, borderRadius: 4, background: "rgba(255,255,255,0.15)" }} />)}
                </div>
              ))}
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 44, color: PINK_L }}>{pages} page{pages > 1 ? "s" : ""}</div>
          </div>
          <Note t={t} a={K.test + 0.3} b={K.vs} y={1180}>Test réalisé par MyMotiv le 07/10/2026 (outil « lettre de motivation »)</Note>
        </div>
      )}
      {/* L3 : face à face */}
      {show(t, K.vs, K.plus) && (
        <div style={{ position: "absolute", inset: 0, ...blurIO(t, K.vs, K.plus, 0.2, 0.25) }}>
          <div style={{ position: "absolute", left: 60, width: 440, top: 330, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#C7C7CC", transform: `translateX(${go(t, K.vs, K.vs + 0.35, -200, 0)}px)` }}>France Travail<div style={{ fontFamily: MONO, fontSize: 20, color: GREY, letterSpacing: 2, marginTop: 6 }}>OUTIL GRATUIT</div></div>
          <div style={{ position: "absolute", left: 580, width: 440, top: 335, textAlign: "center", transform: `translateX(${go(t, K.vs, K.vs + 0.35, 200, 0)}px)` }}>
            <Img src={staticFile("logo-mymotiv.png")} style={{ width: 330, filter: `drop-shadow(0 0 18px ${PINK})` }} />
            <div style={{ fontFamily: MONO, fontSize: 20, color: PINK_L, letterSpacing: 2, marginTop: 6 }}>1RE LETTRE OFFERTE</div>
          </div>
          <div style={{ position: "absolute", left: 538, top: 340, width: 4, height: 1060, background: `linear-gradient(180deg, rgba(242,184,192,0), ${PINK_L}, rgba(242,184,192,0))`, transform: `scaleY(${ease(t, K.vs + 0.1, K.vs + 0.6)})`, boxShadow: `0 0 20px ${PINK}` }} />
          <div style={{ position: "absolute", left: 490, top: 440, width: 100, height: 100, borderRadius: 50, background: "#0B0A0B", border: `3px solid ${PINK_L}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 36, color: "#fff", boxShadow: `0 0 30px ${PINK}`, transform: `scale(${go(t, K.vs + 0.2, K.vs + 0.5, 0, 1)})` }}>VS</div>
          {ROWS.map((row, i) => {
            const k = ease(t, row.at, row.at + 0.35), y = 610 + i * 270;
            return (
              <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
                <Mono style={{ textAlign: "center", fontSize: 21, color: GREY }}>{row.label}</Mono>
                <div style={{ position: "absolute", left: 60, width: 440, top: 44, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 64, color: "#D1D1D6" }}>{row.l}</div>
                <div style={{ position: "absolute", left: 580, width: 440, top: 44, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 64, color: PINK_L, textShadow: rgb(g, `0 0 26px ${PINK}`) }}>{row.r}</div>
                {row.kind === "time" && (
                  <>
                    <div style={{ position: "absolute", left: 90, top: 150, width: 380 * ease(t, row.at + 0.1, row.at + 0.9), height: 14, borderRadius: 7, background: "#6E6E73" }} />
                    <div style={{ position: "absolute", left: 610, top: 150, width: Math.max(14, 380 * (35 / 900)) * ease(t, row.at + 0.1, row.at + 0.3), height: 14, borderRadius: 7, background: PINK_L, boxShadow: `0 0 16px ${PINK}` }} />
                  </>
                )}
                {row.kind === "note" && (
                  <>
                    <div style={{ position: "absolute", left: 60, width: 440, top: 130, textAlign: "center" }}><Stars v={3.3} k={seg(t, row.at + 0.1, row.at + 0.8)} color="#C7C7CC" size={40} /><div style={{ fontFamily: "Open Sans", fontSize: 22, color: GREY, marginTop: 4 }}>sur 9 votes</div></div>
                    <div style={{ position: "absolute", left: 580, width: 440, top: 130, textAlign: "center" }}><Stars v={5} k={seg(t, row.at + 0.1, row.at + 0.8)} color={PINK_L} size={40} /><div style={{ fontFamily: "Open Sans", fontSize: 22, color: PINK_L, marginTop: 4 }}>sur 11 avis</div></div>
                  </>
                )}
              </div>
            );
          })}
          <Note t={t} a={K.vs + 2.3} b={K.plus} y={1440}>* temps mesuré : 27 à 35 s par lettre · notes relevées le 07/10/2026</Note>
        </div>
      )}
      {/* L4 : ce qu'on a en plus */}
      {show(t, K.plus, K.punch) && (
        <div style={{ position: "absolute", inset: 0, ...blurIO(t, K.plus, K.punch, 0.2, 0.25) }}>
          <Title t={t} a={K.plus} b={K.punch} y={330} size={76} g={g} lines={[["En plus,"], ["chez MyMotiv :", PINK_L]]} />
          {PLUS.map((s, i) => {
            const at = K.plus + 0.35 + i * 0.26, k = ease(t, at, at + 0.3);
            return (
              <div key={i} style={{ position: "absolute", left: 120, right: 120, top: 580 + i * 152, height: 120, ...holo(k, 0.7), display: "flex", alignItems: "center", gap: 28, padding: "0 36px", opacity: k, transform: `translateX(${(1 - k) * 160}px)` }}>
                <div style={{ width: 62, height: 62, borderRadius: 31, background: PINK, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 36, fontWeight: 700, boxShadow: `0 0 20px ${PINK}`, flexShrink: 0, transform: `scale(${go(t, at + 0.1, at + 0.35, 0, 1)})` }}>✓</div>
                <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 42, color: "#fff" }}>{s}</div>
              </div>
            );
          })}
        </div>
      )}
      {/* L5 : la phrase */}
      {show(t, K.punch, K.end) && (
        <div style={{ position: "absolute", inset: 0, ...blurIO(t, K.punch, K.end, 0.15, 0.2) }}>
          <div style={{ position: "absolute", left: 40, right: 40, top: 640, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 96, lineHeight: 1.15, letterSpacing: -2 }}>
            <div style={{ color: "#C7C7CC" }}><TextDrop t={t} t0={K.punch + 0.05} text="Gratuit, c'est bien." stagger={0.1} dur={0.3} /></div>
            <div style={{ color: PINK_L, textShadow: rgb(g, `0 0 40px ${PINK}`), marginTop: 20 }}><TextDrop t={t} t0={K.punch + 0.55} text="Recruté, c'est mieux." stagger={0.12} dur={0.3} /></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── M : écran de fin ───
const End: React.FC<{ t: number; g: number }> = ({ t, g }) => {
  if (t < K.end) return null;
  const icon = go(t, K.end, K.end + 0.45, 0, 1), logo = seg(t, K.mm2 + 0.1, K.mm2 + 0.6);
  const bio = go(t, K.bio - 0.1, K.bio + 0.3, 0, 1);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {[0, 1, 2].map((i) => { const k = ((t - K.end) * 0.45 + i / 3) % 1; const rr = 140 + k * 520;
        return <div key={i} style={{ position: "absolute", left: 540 - rr, top: 690 - rr, width: rr * 2, height: rr * 2, borderRadius: "50%", border: `2px solid ${PINK_L}`, opacity: (1 - k) * 0.35 * seg(t, K.end, K.end + 0.5) }} />; })}
      <div style={{ position: "absolute", left: 540 - 105, top: 590, transform: `scale(${icon})` }}><AppIcon size={210} /></div>
      <div style={{ position: "absolute", left: 540 - 300, top: 860, width: 600, clipPath: `inset(0 ${(1 - logo) * 100}% 0 0)` }}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 600, filter: `drop-shadow(0 0 20px ${PINK})` }} /></div>
      <div style={{ position: "absolute", left: 40, right: 40, top: 1050, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 60, lineHeight: 1.15, color: "#fff", textShadow: rgb(g) }}>
        <TextDrop t={t} t0={K.lettre2} text="Ta lettre de motivation" stagger={0.08} dur={0.28} /><br />
        <span style={{ color: PINK_L }}><TextDrop t={t} t0={K.clics - 0.1} text="en 5 clics." stagger={0.1} dur={0.28} /></span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1250, display: "flex", justifyContent: "center", opacity: seg(t, K.clics + 0.3, K.clics + 0.5) }}>
        <span style={{ fontFamily: "Open Sans", fontWeight: 600, fontSize: 30, padding: "10px 26px", borderRadius: 30, border: `2px solid ${PINK_L}`, color: PINK_L }}>Ta 1re lettre est offerte</span>
      </div>
      <div style={{ position: "absolute", left: 540 - 300, top: 1340, transform: `scale(${bio})` }}>
        <GlossPill w={600} h={130}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 48, color: "#fff" }}>Lien en bio <span style={{ color: PINK_L }}>↑</span></span></GlossPill>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 34, color: "rgba(245,245,247,0.85)", opacity: seg(t, K.bio + 0.5, K.bio + 0.9) }}>Avec MyMotiv, postulez. <span style={{ color: PINK_L }}>Et faites-vous recruter.</span></div>
    </div>
  );
};

export const NotreHistoire: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const g = glitchK(t);
  const r = rng(frame * 3 + 1);
  const shake = g * 18;
  const gridO = t < K.phone ? 0.8 : t < K.ft ? 0.35 : t < K.end ? 0.45 : 1;
  const flashK = pulse(t, K.flash, 0.1) * 1.2 + pulse(t, K.end, 0.1) * 1.1 + pulse(t, 0.03, 0.05) * 0.8 + pulse(t, K.moi, 0.05) * 0.6 + pulse(t, K.offerte, 0.07) * 0.5;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0A0B", overflow: "hidden" }}>
      <Audio src={staticFile("audio/histoire.wav")} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)` }}>
        <Backdrop t={t} grid={gridO} />
        <Chrono t={t} g={g} />
        {/* titres du hook */}
        <Title t={t} a={K.tu} b={K.h2 - 0.15} y={330} size={84} g={g} stagger={0.12} lines={[["Combien de temps"], ["pour UNE lettre ?", PINK_L]]} />
        {show(t, K.h2 - 0.05, K.moi) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 190, letterSpacing: -6, color: RED, textShadow: rgb(g + 0.3, "0 0 40px rgba(255,92,122,0.5)"), opacity: 1 - seg(t, K.moi - 0.1, K.moi) }}>
            <span style={{ display: "inline-block", transform: `scale(${lerp(1.5, 1, ease(t, K.h2 - 0.05, K.h2 + 0.15))})` }}>2 h…</span>
            {t >= K.h3 - 0.05 && <span style={{ display: "inline-block", marginLeft: 40, transform: `scale(${lerp(1.5, 1, ease(t, K.h3 - 0.05, K.h3 + 0.15))})` }}>3 h…</span>}
          </div>
        )}
        <Title t={t} a={K.moi} b={K.flash - 0.2} y={300} size={150} g={g} lines={[["Moi ?", PINK_L]]} />
        <Note t={t} a={K.s30 + 0.1} b={K.flash - 0.1} y={1420}>* temps mesuré : 27 à 35 s par lettre</Note>

        {/* logo */}
        {show(t, K.flash - 0.05, K.phone + 0.4) && (() => {
          const ic = go(t, K.flash, K.flash + 0.45, 0, 1), lg = seg(t, K.mm - 0.1, K.mm + 0.35), out = seg(t, K.phone - 0.1, K.phone + 0.3);
          return (
            <div style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: `blur(${out * 16}px)`, transform: `scale(${1 + out * 0.3})` }}>
              <Shockwave t={t} t0={K.flash} x={540} y={820} r={700} />
              <div style={{ position: "absolute", left: 540 - 120, top: 700, transform: `scale(${ic})` }}><AppIcon size={240} /></div>
              <div style={{ position: "absolute", left: 540 - 300, top: 1010, width: 600, clipPath: `inset(0 ${(1 - lg) * 100}% 0 0)` }}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 600, filter: `drop-shadow(0 0 20px ${PINK})` }} /></div>
              <Mono style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", opacity: seg(t, K.mm + 0.2, K.mm + 0.4) }}>{"SYSTÈME EN LIGNE".slice(0, Math.round(16 * seg(t, K.mm + 0.2, K.mm + 0.5)))}</Mono>
            </div>
          );
        })()}

        <HoloPhone t={t} />
        <Title t={t} a={K.offre - 0.1} b={K.cv - 0.1} y={300} size={76} g={g} lines={[["① Colle l'offre"]]} />
        <Title t={t} a={K.cv - 0.05} b={K.ia - 0.1} y={300} size={76} g={g} lines={[["② Ajoute ton CV"]]} />
        <Title t={t} a={K.ia - 0.05} b={K.lettre - 0.1} y={300} size={76} g={g} lines={[["③ L'IA rédige…", PINK_L]]} />
        <Title t={t} a={K.lettre - 0.05} b={K.logo0 - 0.1} y={300} size={70} g={g} lines={[["Lettre + CV adaptés"], ["à l'entreprise", PINK_L]]} />
        <Docs t={t} g={g} />
        <Title t={t} a={K.logo0} b={K.sans - 0.05} y={330} size={84} g={g} lines={[["Avec son logo."]]} />
        <Title t={t} a={K.sans} b={K.prompt0 - 0.05} y={330} size={76} g={g} lines={[["Rien d'inventé :"], ["tout vient de ton CV.", PINK_L]]} />

        <PromptBar t={t} g={g} />
        <Title t={t} a={K.prompt0 + 0.05} b={K.robot0} y={430} size={84} g={g} lines={[["Pas de prompt"], ["à écrire.", PINK_L]]} />
        <Robot t={t} g={g} />
        <Title t={t} a={K.robot0} b={K.pile0} y={330} size={76} g={g} lines={[["Pas de robot"], ["qui déraille.", RED]]} />
        <Pile t={t} g={g} />
        <Title t={t} a={K.pile0 + 0.3} b={K.offerte0 - 0.05} y={300} size={76} g={g} lines={[["La candidature"], ["qui sort de la pile.", PINK_L]]} />
        <Title t={t} a={K.offerte0} b={K.prix0 - 0.1} y={300} size={76} g={g} lines={[["Et ta 1re lettre"], ["est offerte.", PINK_L]]} />
        <Prices t={t} g={g} />
        <Compare t={t} g={g} />
        <End t={t} g={g} />
        <Hud t={t} o={0.9} />
      </div>
      <Scanlines />
      <Flash k={flashK} />
    </AbsoluteFill>
  );
};
