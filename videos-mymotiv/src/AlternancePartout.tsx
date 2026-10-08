// « Alternance partout » (≈55 s, 60 i/s, 9:16) — motion design épuré dans la DA MyMotiv, construction inspirée d'une pub
// 3D de référence (pilules brillantes, orbes qui fusionnent, icône sur rayons, téléphone devant un mot 3D géant,
// galerie sous projecteur, rubans, piédestal) — inspiration seulement, rien de ses logos, images ou couleurs.
// Voix : ElevenLabs v4 (public/audio/alternance-source.mp3) montée par tools/voix-narrateur.py + voix-alternance.json.
// Icônes vectorielles (lucide-react) à la place des emojis. Actu vérifiée : on peut commencer sa formation en CFA sans
// entreprise et signer son contrat dans les 3 mois (Code du travail, art. L6222-12-1).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Briefcase, Building2, CalendarDays, Camera, Crown, FileText, FileUser, Gift, GraduationCap, MessageSquareText, PenLine, RotateCcw, ShieldCheck, Timer } from "lucide-react";
import { go } from "./apple";
import { PINK, PINK_L, clamp, lerp, rng, seg } from "./common";
import { AppIcon, Flash, GlossPill, Shockwave, ease, pulse } from "./motion";
import voix from "./data/alternance-voix.json";
import "./fonts";

export const ALTERNANCE_DUR = voix.duration;
const BG = "#0B0A0B", GLASS = "linear-gradient(170deg, #2E2A2C 0%, #1A1718 100%)", INK = "#F5F5F7", SOFT = "#8E8E93";
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const show = (t: number, a: number, b: number) => t >= a && t < b;
function io(t: number, a: number, b: number, inD = 0.25, outD = 0.25): React.CSSProperties {
  const i = ease(t, a, a + inD), o = seg(t, b - outD, b);
  return { opacity: clamp(i * 1.3) * (1 - o), filter: `blur(${(1 - i) * 12 + o * 14}px)`, transform: `scale(${lerp(0.9, 1, i) * lerp(1, 1.06, o)})` };
}
// temps clés (s)
const T = {
  partout: Wt(8), ca: Wt(19), rentree: Wt(29), foutu: Wt(32), respire: Wt(33), pasFoutu: Wt(36), cfa: Wt(44), sans: Wt(45), troisMois: Wt(50),
  q3: PH[5][0], mm: Wt(62), meilleure: Wt(65), top: Wt(71), autres: PH[9][0], prompt: Wt(78), generique: Wt(83), reprendre: Wt(87),
  nous: PH[11][0], s30: Wt(89), colles: Wt(92), cv: Wt(98), lettre: Wt(100), entreprise: Wt(109), logo: Wt(112), inventer: Wt(115),
  vois: PH[16][0], ia: Wt(127), captures: Wt(133), offerte: Wt(140), bio: Wt(144), postule: Wt(147), recruter: Wt(151), end: PH[20][1],
};

// ─── sous-titres : mot par mot, calés par interpolation sur les mots de la transcription ───
const NO_CAPS = new Set([5, 7, 8, 11, 12, 18, 19, 20]);       // phrases déjà écrites en grand à l'écran
const KEY = /alternant|alternance|rentrée|foutu|cfa|trois|mois|myMotiv|meilleure|générique|reprendre|logo|inventer|ia|vraies|offerte|bio/i;
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = PH.findIndex(([a], k) => t >= a - 0.06 && (k + 1 >= PH.length || t < PH[k + 1][0] - 0.06));
  if (i < 0 || NO_CAPS.has(i) || t > PH[i][1] + 0.5) return null;
  const ph = voix.phrases[i], mots = voix.mots.filter((m) => m.phrase === i);
  const words = ph.text.split(" ");
  const total = ph.text.length;
  let pos = 0;
  const times = words.map((w) => { const c = pos / Math.max(1, total); pos += w.length + 1; const k = c * (mots.length - 1), j = Math.floor(k);
    return mots.length ? lerp(mots[j].t0, mots[Math.min(mots.length - 1, j + 1)].t0, k - j) : ph.t0; });
  const out = seg(t, PH[i][1] + 0.25, PH[i][1] + 0.5);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 1250, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 56, lineHeight: 1.2, letterSpacing: -1, opacity: 1 - out }}>
      {words.map((w, k) => {
        const t0 = times[k] - 0.03, kk = seg(t, t0, t0 + 0.12), on = t >= t0;
        return <React.Fragment key={k}><span style={{ display: "inline-block", opacity: on ? 1 : 0, transform: `translateY(${(1 - kk) * 14}px) scale(${lerp(0.7, 1, kk)})`, color: KEY.test(w) ? PINK_L : INK, textShadow: "0 4px 20px rgba(0,0,0,0.85)" }}>{w}</span>{" "}</React.Fragment>;
      })}
    </div>
  );
};

// ─── briques visuelles ───
type Ico = React.FC<{ size?: number; color?: string; strokeWidth?: number }>;
const Pill: React.FC<{ icon: Ico; label: string; pink?: boolean; size?: number }> = ({ icon: I, label, pink, size = 1 }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 18 * size, padding: `${18 * size}px ${34 * size}px ${18 * size}px ${22 * size}px`, borderRadius: 60 * size,
    background: pink ? `linear-gradient(170deg, ${PINK_L} 0%, ${PINK} 60%, #B9606B 100%)` : GLASS, border: `1px solid rgba(255,255,255,${pink ? 0.35 : 0.1})`,
    boxShadow: `0 ${10 * size}px 0 ${pink ? "#8E4450" : "#0E0C0D"}, 0 ${24 * size}px ${50 * size}px rgba(0,0,0,0.55), inset 0 ${2 * size}px 0 rgba(255,255,255,${pink ? 0.5 : 0.14})`, whiteSpace: "nowrap" }}>
    <div style={{ width: 64 * size, height: 64 * size, borderRadius: 20 * size, background: pink ? "rgba(255,255,255,0.22)" : "rgba(217,130,139,0.16)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <I size={36 * size} color={pink ? "#fff" : PINK_L} strokeWidth={2.2} />
    </div>
    <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 44 * size, color: "#fff", letterSpacing: -0.5 }}>{label}</span>
  </div>
);
const Extruded: React.FC<{ text: string; size: number; front?: string }> = ({ text, size, front = PINK_L }) => {
  const depth = Array.from({ length: 16 }, (_, i) => `0 ${(i + 1) * size / 120}px 0 rgb(${lerp(185, 40, i / 15)},${lerp(96, 22, i / 15)},${lerp(107, 26, i / 15)})`).join(",");
  return <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: size, letterSpacing: -size / 30, color: front, lineHeight: 1, whiteSpace: "nowrap", textShadow: `${depth}, 0 ${size * 0.3}px ${size * 0.35}px rgba(0,0,0,0.6)` }}>{text}</div>;
};
const Rings: React.FC<{ t: number; o: number }> = ({ t, o }) => (
  <div style={{ position: "absolute", inset: -300, opacity: o, background: `repeating-radial-gradient(circle at 50% 50%, #120E0F 0px, #1E1618 60px, #2A1C20 120px, #1E1618 180px, #120E0F 240px)`, transform: `scale(${1 + 0.05 * Math.sin(t * 0.9)})` }} />
);
const Spot: React.FC<{ o: number; x?: number }> = ({ o, x = 540 }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #232326 0%, #161618 70%, #0E0E10 100%)", opacity: o }} />
    <div style={{ position: "absolute", left: x - 560, top: -120, width: 1120, height: 2150, opacity: o, background: "linear-gradient(180deg, rgba(255,240,242,0.55) 0%, rgba(242,184,192,0.18) 50%, rgba(242,184,192,0.03) 100%)", clipPath: "polygon(45% 0, 55% 0, 100% 100%, 0 100%)", filter: "blur(16px)" }} />
  </>
);
const Note: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) =>
  show(t, a, b) ? <div style={{ position: "absolute", left: 60, right: 60, top: 1500, textAlign: "center", fontFamily: "Open Sans", fontSize: 23, color: "rgba(245,245,247,0.62)", opacity: seg(t, a, a + 0.25) * (1 - seg(t, b - 0.2, b)) }}>{children}</div> : null;

// ─── 1. hook : « alternant » partout, l'anneau, la rentrée, « t'es foutu » ───
const HOOK: [Ico, string, number, number, number][] = [   // icône, texte, x, y, rotation
  [GraduationCap, "Alternant", 540, 760, -4], [Briefcase, "Alternance", 300, 470, 6], [CalendarDays, "Rentrée", 780, 1040, -7], [GraduationCap, "Alternant", 760, 330, 5],
  [Building2, "Entreprise", 280, 1110, 4], [FileText, "Contrat", 820, 640, -9], [GraduationCap, "CFA", 250, 760, 8], [GraduationCap, "Alternant", 560, 1180, -3],
  [CalendarDays, "Septembre", 330, 260, -6], [GraduationCap, "Alternant", 820, 860, 7], [FileText, "Candidature", 520, 560, 3], [GraduationCap, "Alternant", 300, 960, -8],
];
const Hook: React.FC<{ t: number }> = ({ t }) => {
  if (t >= PH[3][0] + 0.2) return null;
  const ring = ease(t, PH[1][0], PH[1][0] + 0.9), spin = Math.pow(seg(t, PH[1][0], T.foutu), 1.6) * 260;
  const tight = ease(t, T.rentree - 0.3, T.foutu);
  const fall = seg(t, T.foutu - 0.05, T.foutu + 0.9);
  const word = 1 - seg(t, 1.0, 1.6);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {word > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", opacity: word, filter: `blur(${(1 - word) * 16}px)`,
          transform: `scale(${lerp(1.12, 1, ease(t, -0.2, 0.35)) * lerp(1, 1.2, 1 - word)})` }}>
          <Extruded text="ALTERNANT" size={148} />
        </div>
      )}
      {HOOK.map(([I, label, x, y, rot], i) => {
        const at = i === 0 ? -0.2 : 0.12 + i * 0.2;
        if (t < at) return null;
        const k = go(t, at, at + 0.3, 0, 1);
        const a = (i / HOOK.length) * Math.PI * 2 + (spin * Math.PI) / 180, R = lerp(370, 250, tight);
        const xr = 540 + Math.cos(a) * R, yr = 740 + Math.sin(a) * R * 1.08;
        const cx = lerp(x, xr, ring), cy = lerp(y, yr, ring) + fall * fall * (1500 + i * 60);
        const sc = (i === 0 ? lerp(1.2, 1, ring) : 0.82) * lerp(1, 0.8, ring) * k;
        return (
          <div key={i} style={{ position: "absolute", left: cx, top: cy, transform: `translate(-50%, -50%) rotate(${lerp(rot, rot * 0.3, ring) + fall * (i % 2 ? 40 : -40)}deg) scale(${sc})`, opacity: 1 - seg(t, T.foutu + 0.5, T.foutu + 0.9), zIndex: i === 0 ? 5 : 1 }}>
            <Pill icon={I} label={label} pink={i === 0 || label === "Alternant"} />
          </div>
        );
      })}
      {/* centre de l'anneau : la rentrée qui se rapproche */}
      {show(t, T.rentree - 0.3, T.foutu + 0.6) && (() => {
        const k = ease(t, T.rentree - 0.3, T.rentree + 0.1), left = 1 - seg(t, T.rentree, T.foutu);
        return (
          <div style={{ position: "absolute", left: 540 - 170, top: 760 - 150, width: 340, height: 300, borderRadius: 40, background: GLASS, border: "1px solid rgba(255,255,255,0.1)", transform: `scale(${k}) translateY(${fall * fall * 1600}px)`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
            <CalendarDays size={80} color={left < 0.25 ? "#FF5C7A" : PINK_L} strokeWidth={1.8} />
            <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 44, color: "#fff" }}>Rentrée</div>
            <div style={{ width: 240, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.1)" }}><div style={{ width: `${left * 100}%`, height: "100%", borderRadius: 5, background: left < 0.25 ? "#FF5C7A" : PINK }} /></div>
          </div>
        );
      })()}
    </div>
  );
};

// ─── 2. « Respire. » : l'orbe qui respire → CFA, 3 mois ───
const Breath: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, T.foutu + 0.6, T.mm + 0.1)) return null;
  const breath = 0.75 + 0.25 * Math.sin(seg(t, T.respire - 0.2, PH[4][0]) * Math.PI * 1.5 - Math.PI / 2);
  const toCard = ease(t, PH[4][0] - 0.1, PH[4][0] + 0.5);
  const big3 = ease(t, T.q3 - 0.1, T.q3 + 0.35);
  const merge = ease(t, PH[6][0], T.mm);
  const C = 2 * Math.PI * 130, fill = ease(t, T.troisMois - 0.1, T.troisMois + 1.2);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      {/* l'orbe */}
      <div style={{ position: "absolute", left: 540 - 200, top: 760 - 200, width: 400, height: 400, borderRadius: 200, background: `radial-gradient(circle, #fff 0%, ${PINK_L} 25%, rgba(217,130,139,0.4) 50%, rgba(217,130,139,0) 70%)`,
        transform: `scale(${breath * (1 - toCard) * (1 - big3)})`, opacity: seg(t, T.foutu + 0.6, T.respire) * (1 - toCard), filter: "blur(4px)" }} />
      {/* CFA sans entreprise + 3 mois */}
      {show(t, PH[4][0] - 0.1, T.q3 + 0.2) && (
        <div style={{ position: "absolute", inset: 0, opacity: toCard * (1 - big3), filter: `blur(${big3 * 14}px)` }}>
          <div style={{ position: "absolute", left: 540, top: 470, transform: `translate(-50%, -50%) scale(${go(t, T.cfa - 0.25, T.cfa + 0.1, 0.4, 1)})`, opacity: seg(t, T.cfa - 0.25, T.cfa) }}><Pill icon={GraduationCap} label="Formation en CFA" pink /></div>
          <div style={{ position: "absolute", left: 540, top: 640, transform: `translate(-50%, -50%) scale(${go(t, T.sans - 0.05, T.sans + 0.3, 0.4, 1)})`, opacity: seg(t, T.sans - 0.05, T.sans + 0.1) }}>
            <Pill icon={Building2} label="Entreprise : pas encore" />
          </div>
          <div style={{ position: "absolute", left: 540 - 160, top: 760, width: 320, height: 320, transform: `scale(${go(t, T.troisMois - 0.2, T.troisMois + 0.15, 0.3, 1)})`, opacity: seg(t, T.troisMois - 0.2, T.troisMois) }}>
            <svg width={320} height={320}><circle cx={160} cy={160} r={130} fill="rgba(28,26,27,0.9)" stroke="rgba(255,255,255,0.08)" strokeWidth={16} />
              <circle cx={160} cy={160} r={130} fill="none" stroke={PINK} strokeWidth={16} strokeLinecap="round" strokeDasharray={`${C * fill} ${C}`} transform="rotate(-90 160 160)" style={{ filter: `drop-shadow(0 0 12px ${PINK})` }} /></svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 110, color: "#fff", lineHeight: 1 }}>3</div>
              <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 34, color: PINK_L, letterSpacing: 4 }}>MOIS</div>
            </div>
          </div>
        </div>
      )}
      {/* « Trois mois ? » en grand */}
      {big3 > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 560, display: "flex", justifyContent: "center", transform: `scale(${lerp(1.6, 1, big3) * (1 - merge * 0.6)})`, opacity: big3 * (1 - merge), filter: `blur(${merge * 18}px)` }}>
          <Extruded text="3 MOIS ?" size={210} />
        </div>
      )}
      {/* orbes qui fusionnent → MyMotiv */}
      {show(t, PH[6][0] - 0.05, T.mm + 0.05) && [PINK_L, PINK, "#fff"].map((c, i) => {
        const a = (i / 3) * Math.PI * 2 + t * 4, r = lerp(320, 0, merge);
        return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * r - 80, top: 760 + Math.sin(a) * r - 80, width: 160, height: 160, borderRadius: 80, background: `radial-gradient(circle, #fff 0%, ${c} 35%, rgba(0,0,0,0) 70%)`, filter: "blur(5px)", opacity: seg(t, PH[6][0] - 0.05, PH[6][0] + 0.2) }} />;
      })}
      <Note t={t} a={PH[4][0] + 0.3} b={T.q3}>Code du travail, art. L6222-12-1 · début de formation sans employeur, 3 mois pour signer</Note>
    </div>
  );
};

// ─── 3. MyMotiv : icône sur rayons, « la meilleure solution », « le top du top » ───
const Reveal: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, T.mm - 0.02, T.autres + 0.1)) return null;
  const flip = ease(t, T.mm, T.mm + 0.6), up = ease(t, PH[7][0] - 0.1, PH[7][0] + 0.4), out = seg(t, T.autres - 0.3, T.autres + 0.1);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: `blur(${out * 16}px)` }}>
      <Rings t={t} o={1} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.8 * (1 - up * 0.6) }}>
        <g transform={`translate(540 ${lerp(760, 560, up)}) rotate(${(t - T.mm) * 14})`}>
          {Array.from({ length: 16 }, (_, i) => { const a0 = (i / 16) * Math.PI * 2, a1 = a0 + Math.PI / 16, R = 1700;
            return <path key={i} d={`M0 0 L${Math.cos(a0) * R} ${Math.sin(a0) * R} L${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`} fill={i % 2 ? "rgba(217,130,139,0.18)" : "rgba(242,184,192,0.07)"} />; })}
        </g>
      </svg>
      <Shockwave t={t} t0={T.mm} x={540} y={760} r={650} />
      <div style={{ position: "absolute", left: 540 - 150, top: lerp(760, 470, up) - 150, transform: `perspective(900px) rotateY(${lerp(180, 0, flip)}deg) scale(${go(t, T.mm, T.mm + 0.45, 0.3, 1) * lerp(1, 0.72, up)})` }}><AppIcon size={300} /></div>
      {up > 0 && (
        <div style={{ position: "absolute", left: 40, right: 40, top: 720, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, lineHeight: 1.05, letterSpacing: -3 }}>
          <div style={{ fontSize: 98, color: "#fff", opacity: seg(t, T.meilleure - 0.1, T.meilleure + 0.15), transform: `translateY(${(1 - ease(t, T.meilleure - 0.1, T.meilleure + 0.3)) * 40}px)` }}>La meilleure solution</div>
          <div style={{ fontSize: 98, color: PINK_L, opacity: seg(t, Wt(68) - 0.1, Wt(68) + 0.15), transform: `translateY(${(1 - ease(t, Wt(68) - 0.1, Wt(68) + 0.3)) * 40}px)` }}>pour les alternants.</div>
        </div>
      )}
      {t >= T.top - 0.1 && (
        <div style={{ position: "absolute", left: 540, top: 1060, transform: `translate(-50%, 0) scale(${go(t, T.top - 0.1, T.top + 0.2, 0.3, 1)})` }}><Pill icon={Crown} label="Le top du top" pink size={1.15} /></div>
      )}
    </div>
  );
};

// ─── 4. les autres outils (galerie sous projecteur) contre MyMotiv ───
const OTHERS: [Ico, string, number][] = [[PenLine, "Un prompt à écrire", 0], [MessageSquareText, "Un texte générique", 1], [RotateCcw, "Tout à reprendre", 2]];
const Compare: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, T.autres - 0.1, PH[13][0] + 0.1)) return null;
  const on = ease(t, T.autres, T.autres + 0.2), out = seg(t, PH[13][0] - 0.25, PH[13][0] + 0.1);
  const hits = [T.prompt, T.generique, T.reprendre];
  const active = hits.reduce((a, h, i) => (t >= h - 0.15 ? i : a), -1);
  const us = ease(t, T.nous - 0.05, T.nous + 0.3), s30 = ease(t, T.s30 - 0.1, T.s30 + 0.25);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: `blur(${out * 16}px)` }}>
      <Spot o={on} x={lerp(540, 540, us)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 70, color: SOFT, letterSpacing: -2, opacity: on * (1 - us) }}>Les autres outils ?</div>
      {OTHERS.map(([I, label, i]) => {
        const k = ease(t, hits[i] - 0.25, hits[i] + 0.1), lit = i === active && us < 0.5;
        return (
          <div key={i} style={{ position: "absolute", left: 140, right: 140, top: 470 + i * 190, height: 150, borderRadius: 34, background: "#1C1C1E", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: 28, padding: "0 36px",
            opacity: k * lerp(1, 0.25, us), transform: `translateX(${(1 - k) * 200}px) scale(${lit ? 1.04 : 0.96})`, filter: `brightness(${lit ? 1.15 : 0.6}) blur(${us * 4}px)`, boxShadow: lit ? "0 0 60px rgba(255,255,255,0.08)" : "none" }}>
            <I size={52} color={SOFT} strokeWidth={2} />
            <span style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 46, color: "#D1D1D6" }}>{label}</span>
            <div style={{ position: "absolute", left: 30, right: 30, top: "50%", height: 3, background: "#636366", transform: `scaleX(${ease(t, hits[i] + 0.35, hits[i] + 0.7)})`, transformOrigin: "0 50%" }} />
          </div>
        );
      })}
      {/* Nous ? 30 s */}
      {us > 0 && (
        <div style={{ position: "absolute", inset: 0 }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 90, color: "#fff", letterSpacing: -2, opacity: us }}>Nous ?</div>
          <div style={{ position: "absolute", left: 540 - 250, top: 560, width: 500, height: 500, borderRadius: 90, background: `linear-gradient(165deg, ${PINK_L}, ${PINK} 55%, #9E4E59)`, boxShadow: `0 16px 0 #7E3A45, 0 40px 120px rgba(217,130,139,0.45), inset 0 3px 0 rgba(255,255,255,0.5)`,
            transform: `scale(${lerp(0.2, 1, s30)}) rotate(${lerp(-12, 0, s30)}deg)`, opacity: clamp(s30 * 2), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10 }}>
            <Timer size={96} color="#fff" strokeWidth={2} />
            <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 170, color: "#fff", lineHeight: 1, letterSpacing: -6 }}>30 s<span style={{ fontSize: 70 }}>*</span></div>
          </div>
        </div>
      )}
      <Note t={t} a={T.s30} b={PH[13][0]}>* temps mesuré : 27 à 35 s par lettre</Note>
    </div>
  );
};

// ─── 5. le vrai parcours : téléphone devant « MYMOTIV », tuiles ; 6. « vraies captures » ───
const P = (n: string) => staticFile(`parcours/${n}.png`);
function phoneShot(t: number) {
  if (t < T.colles - 0.1) return P("009-offre");
  if (t < Wt(96) - 0.1) return P(`0${10 + Math.min(6, Math.floor(seg(t, T.colles - 0.1, Wt(96) - 0.15) * 7))}-offre-lien`);
  if (t < T.cv - 0.15) return P("007-cv");
  if (t < T.lettre - 0.2) return P("008-cv-ajoute");
  if (t < T.entreprise) { const G = ["036", "038", "040", "042", "044", "046", "047"]; return P(`${G[Math.min(6, Math.floor(seg(t, T.lettre - 0.2, T.entreprise) * 7))]}-generation`); }
  return P("048-lettre");
}
const TILES: [Ico, string, number, number, number][] = [[FileText, "Lettre d'alternance", T.lettre, 50, 470], [FileUser, "CV adapté", Wt(105), 650, 600], [Building2, "Logo de l'entreprise", T.logo, 50, 960], [ShieldCheck, "Rien d'inventé", T.inventer, 620, 1060]];
const Parcours: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, PH[13][0] - 0.1, PH[18][0] + 0.15)) return null;
  const inK = ease(t, PH[13][0] - 0.1, PH[13][0] + 0.5), out = seg(t, PH[18][0] - 0.2, PH[18][0] + 0.15);
  const back = ease(t, T.vois - 0.1, T.vois + 0.7);   // « Et ce que tu vois là ? » : recul, la capture est cadrée
  const PW = 1080 * 0.36, PHh = 1920 * 0.36;
  const ry = lerp(30, -8, inK) + Math.sin(t * 1.2) * 4 * (1 - back);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: `blur(${out * 16}px)` }}>
      <Rings t={t} o={inK} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 620, display: "flex", justifyContent: "center", opacity: inK * (1 - back * 0.7), transform: `translateX(${lerp(160, -80, seg(t, PH[13][0], T.vois))}px)` }}><Extruded text="MYMOTIV" size={230} /></div>
      <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
        <div style={{ position: "absolute", left: 540 - PW / 2, top: 500, width: PW, height: PHh, transformStyle: "preserve-3d", transform: `rotateY(${ry * (1 - back)}deg) rotateX(${4 * (1 - back)}deg) scale(${lerp(0.8, 1, inK) * lerp(1, 0.92, back)})` }}>
          <div style={{ position: "absolute", inset: -12, borderRadius: 66, background: "linear-gradient(135deg, #3A3A3C, #0B0A0B)", boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 60px rgba(217,130,139,0.25), inset 0 0 0 2px #4A4A4E" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 54, overflow: "hidden" }}><Img src={phoneShot(t)} style={{ width: PW, height: PHh }} /></div>
        </div>
      </div>
      {/* tuiles */}
      {TILES.map(([I, label, at, x, y], i) => {
        const k = ease(t, at - 0.15, at + 0.3);
        if (t < at - 0.15) return null;
        return <div key={i} style={{ position: "absolute", left: x, top: y, transform: `scale(${lerp(0.3, 0.78, k) * (1 - back)}) translateY(${(1 - k) * 60}px)`, transformOrigin: i % 2 ? "100% 50%" : "0% 50%", opacity: k * (1 - back) }}><Pill icon={I} label={label} pink={i === 0} /></div>;
      })}
      {/* cadre « capture réelle » */}
      {back > 0 && (
        <div style={{ position: "absolute", inset: 0, opacity: back }}>
          {[[540 - PW * 0.46 - 30, 500 + PHh * 0.04 - 30, 1, 1], [540 + PW * 0.46 + 30, 500 + PHh * 0.04 - 30, -1, 1], [540 - PW * 0.46 - 30, 500 + PHh * 0.96 + 30, 1, -1], [540 + PW * 0.46 + 30, 500 + PHh * 0.96 + 30, -1, -1]].map(([x, y, dx, dy], i) => (
            <div key={i} style={{ position: "absolute", left: dx > 0 ? x : x - 60, top: dy > 0 ? y : y - 60, width: 60, height: 60, borderLeft: dx > 0 ? `5px solid ${PINK_L}` : undefined, borderRight: dx < 0 ? `5px solid ${PINK_L}` : undefined, borderTop: dy > 0 ? `5px solid ${PINK_L}` : undefined, borderBottom: dy < 0 ? `5px solid ${PINK_L}` : undefined }} />
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 24px", borderRadius: 30, background: "rgba(28,26,27,0.9)", border: "1px solid rgba(255,255,255,0.12)", fontFamily: "Open Sans", fontWeight: 600, fontSize: 28, color: INK }}>
              <Camera size={30} color={PINK_L} /> Capture réelle · yoyo-code.vercel.app
            </div>
          </div>
          {t >= T.ia - 0.1 && (
            <div style={{ position: "absolute", left: 540, top: 1070, transform: `translate(-50%, 0) scale(${go(t, T.ia - 0.1, T.ia + 0.2, 0.3, 1)})` }}><Pill icon={ShieldCheck} label="0 image générée par IA" pink /></div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── 7. rubans → piédestal, 1re offerte, slogan ───
const Finale: React.FC<{ t: number }> = ({ t }) => {
  if (t < PH[18][0] - 0.1) return null;
  const rib = seg(t, PH[18][0] - 0.1, PH[18][0] + 0.75);
  const ped = ease(t, PH[18][0] + 0.35, PH[18][0] + 0.85), drop = go(t, PH[18][0] + 0.55, PH[18][0] + 1.05, -800, 0);
  const end = seg(t, T.end + 0.9, T.end + 1.6);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Spot o={seg(t, PH[18][0] + 0.2, PH[18][0] + 0.5)} />
      <div style={{ position: "absolute", left: 540 - 140, top: 1000, width: 280, height: 800, background: "linear-gradient(90deg, #1A1A1C, #3A3A3E 45%, #26262A 70%, #121214)", transform: `translateY(${(1 - ped) * 800}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -36, height: 72, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 40%, #4A4A4F, #222225)", boxShadow: `0 0 40px rgba(242,184,192,0.15)` }} />
      </div>
      <div style={{ position: "absolute", left: 540 - 120, top: 740 + drop }}><AppIcon size={240} /></div>
      {t >= T.offerte - 0.15 && <div style={{ position: "absolute", left: 540, top: 1130, transform: `translate(-50%, 0) scale(${go(t, T.offerte - 0.15, T.offerte + 0.15, 0.3, 1)})`, zIndex: 3 }}><Pill icon={Gift} label="1re lettre offerte" pink /></div>}
      {t >= T.bio - 0.2 && <div style={{ position: "absolute", left: 540 - 270, top: 1290, transform: `scale(${go(t, T.bio - 0.2, T.bio + 0.15, 0, 1)})`, zIndex: 3 }}><GlossPill w={540} h={120}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff" }}>Lien en bio <span style={{ color: PINK_L }}>↑</span></span></GlossPill></div>}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, letterSpacing: -4, lineHeight: 1.0 }}>
        <div style={{ fontSize: 150, color: "#fff", opacity: seg(t, T.postule - 0.1, T.postule + 0.1), transform: `translateY(${(1 - ease(t, T.postule - 0.1, T.postule + 0.3)) * 40}px)` }}>Postule.</div>
        <div style={{ fontSize: 78, color: PINK_L, marginTop: 14, opacity: seg(t, T.recruter - 0.35, T.recruter - 0.1), transform: `translateY(${(1 - ease(t, T.recruter - 0.35, T.recruter)) * 30}px)` }}>Et fais-toi recruter.</div>
      </div>
      {/* rubans */}
      {rib > 0 && rib < 1 && Array.from({ length: 8 }, (_, i) => {
        const col = [PINK, BG, "#F5F5F7", PINK_L][i % 4], dir = i % 2 ? 1 : -1, x = dir * lerp(1700, -1700, clamp(rib * 1.2 - i * 0.025));
        return <div key={i} style={{ position: "absolute", left: -450 + x, top: 60 + i * 240, width: 2000, height: 230, background: col, transform: "rotate(-12deg)", display: "flex", alignItems: "center", paddingLeft: 80, gap: 140, overflow: "hidden" }}>
          {[0, 1, 2, 3].map((j) => <span key={j} style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 120, letterSpacing: -3, color: col === BG ? PINK_L : col === PINK ? "#fff" : BG }}>MYMOTIV</span>)}
        </div>;
      })}
      {end > 0 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 10, background: `rgba(11,10,11,${end})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("logo-mymotiv.png")} style={{ width: 520, opacity: end, filter: `drop-shadow(0 0 20px ${PINK})` }} />
        </div>
      )}
    </div>
  );
};

export const AlternancePartout: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const r = rng(frame + 3);
  const hits = [0.0, T.partout, T.foutu, T.mm, T.top, T.s30, T.ia];
  const shake = hits.reduce((s, h) => s + pulse(t, h + 0.04, 0.06), 0) * 10;
  const flash = pulse(t, T.mm, 0.08) * 1.2 + pulse(t, 0.0, 0.04) * 0.2 + pulse(t, T.s30, 0.06) * 0.35;
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <Audio src={staticFile("audio/alternance.wav")} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, rgba(217,130,139,0.14) 0%, rgba(11,10,11,0) 55%)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)` }}>
        <Hook t={t} />
        <Breath t={t} />
        <Reveal t={t} />
        <Compare t={t} />
        <Parcours t={t} />
        <Finale t={t} />
        <Captions t={t} />
      </div>
      <Flash k={flash} />
    </AbsoluteFill>
  );
};
