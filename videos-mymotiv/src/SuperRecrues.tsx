// « Super-recrues » (≈45 s, 60 i/s, 9:16) — film noir Art déco ORIGINAL, entièrement dessiné en code : ville de nuit,
// projecteurs, signal « ? » dans les nuages, héros FICTIFS en silhouette (aucun personnage, costume, logo ou image d'une
// marque existante), « Agence Nova » fictive. Histoire = mise en scène (mention à l'écran). Le justicier masqué est Yann en mode
// masqué (images fournies par le propriétaire, son choix), d'où la mention « Mise en scène · Parodie ».
// Voix : ElevenLabs v4, voix « Paul K » (français de France, accent parisien neutre), générée phrase par phrase puis
// assemblée (voix-heros.json → tools/assembler-lignes.py). Son : synth_heros.py.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Ban, Dumbbell, FileUser, Gift, Link2, Swords, Target, Timer } from "lucide-react";
import { go } from "./apple";
import { PINK, PINK_L, clamp, easeInOut, easeOutBack, lerp, rng, seg } from "./common";
import { Flash, GlossPill, ease, pulse } from "./motion";
import voix from "./data/heros-voix.json";
import voixEnv from "./data/heros-env.json";
import "./fonts";
import "./fontsDeco";

export const HEROS_DUR = voix.duration;
const NIGHT = "#07040A", RED = "#C8323C", WIN = "#F2C46D";
export const GOLD = "#D9B26F", GOLD_L = "#F3D99B", CREAM = "#F5ECD9";
export const GOLD_TXT: React.CSSProperties = { background: "linear-gradient(180deg, #FFF3CF 0%, #EBC77C 48%, #B98A3E 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };
export const DECO = "Limelight", JOSEFIN = "Josefin Sans";

const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const T = {
  avis: Wt(2), comment: Wt(3), on: Wt(4), recrute: Wt(5), un: Wt(6), heros: Wt(7),
  s1: PH[1][0], masque: Wt(11), s2: PH[2][0], rouge: Wt(24), s3: PH[3][0], test: Wt(29), duel: Wt(33),
  non: Wt(38), ils: Wt(39), simplement: Wt(41), leur: Wt(43), lettre: Wt(44), motivation: Wt(46), avec: Wt(47), mm: Wt(48),
  s5: PH[5][0], lien: Wt(50), cv: Wt(55), trente: Wt(58), lettre2: Wt(61), mission: Wt(66), pas: Wt(67), copie: Wt(70),
  s6: PH[6][0], postule: Wt(74), agence: Wt(77), nova: Wt(78), s7: PH[7][0], pris: Wt(83),
  s8: PH[8][0], toi: Wt(84), cape: Wt(89), pasGrave: Wt(90), tasCv: Wt(92), cv2: Wt(95),
  s9: PH[9][0], avec2: Wt(96), mm2: Wt(97), postulez: Wt(99), et: Wt(100), recruter: Wt(103),
  s10: PH[10][0], offerte: Wt(108), lien2: Wt(109), bio: Wt(111), end: PH[10][1],
};
// coupes entre les scènes
const C = {
  c1: T.s1 - 0.12, c2: T.s2 - 0.08, c3: T.s3 - 0.1, c4: T.non + 0.75, c5: T.s5 - 0.05,
  c6: T.s6 - 0.1, c7: T.s7 - 0.1, c8: T.s8 - 0.1, c9: T.s9 - 0.2,
};
const show = (t: number, a: number, b: number) => t >= a && t < b;
const kf = (t: number, keys: [number, number][]) => {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [a, va] = keys[i], [b, vb] = keys[i + 1]; if (t < b) return lerp(va, vb, easeInOut(seg(t, a, b))); }
  return keys[keys.length - 1][1];
};

// ─── la ville : trois plans d'immeubles à gradins (Art déco), fenêtres allumées, flèches et couronnes en éventail ───
type Bld = { x: number; w: number; tiers: [number, number, number][]; spire: number; fan: boolean };
function makeCity(seed: number, o: { hMin: number; hMax: number; wMin: number; wMax: number; gap: number; spireP: number }) {
  const r = rng(seed), out: Bld[] = [];
  let x = -40;
  while (x < 1120) {
    const w = lerp(o.wMin, o.wMax, r()), h = lerp(o.hMin, o.hMax, r());
    const h0 = h * lerp(0.55, 0.72, r());
    const tiers: [number, number, number][] = [[0, 0, h0]];   // retrait, bas (hauteur cumulée), hauteur
    let rest = h - h0, inset = 0, base = h0;
    const nt = 1 + Math.floor(r() * 3);
    for (let k = 0; k < nt && rest > 24; k++) {
      inset += w * lerp(0.1, 0.17, r());
      const th = k === nt - 1 ? rest : rest * lerp(0.4, 0.6, r());
      tiers.push([inset, base, th]); base += th; rest -= th;
    }
    const spire = r() < o.spireP ? lerp(50, 150, r()) : 0;
    out.push({ x, w, tiers, spire, fan: !spire && r() < 0.3 });
    x += w + lerp(0, o.gap, r());
  }
  return out;
}
const CityLayer: React.FC<{ seed: number; color: string; rim: string; win: number; cell: [number, number, number, number]; o: Parameters<typeof makeCity>[1]; deco?: boolean }> = ({ seed, color, rim, win, cell, o, deco }) => {
  const el = useMemo(() => {
    const blds = makeCity(seed, o), r = rng(seed + 99), G = 1920, items: React.ReactNode[] = [];
    blds.forEach((b, bi) => {
      b.tiers.forEach(([ins, base, h], k) => {
        const x0 = b.x + ins, w = b.w - 2 * ins, y0 = G - base - h;
        items.push(<rect key={`b${bi}-${k}`} x={x0} y={y0} width={w} height={h + 1} fill={color} />);
        items.push(<rect key={`r${bi}-${k}`} x={x0} y={y0} width={w} height={2} fill={rim} />);
        if (deco && k === 0) for (let px = x0 + 22; px < x0 + w - 10; px += 44) items.push(<rect key={`p${bi}-${px}`} x={px} y={y0 + 8} width={2} height={h} fill="rgba(217,178,111,0.07)" />);
        const [cw, rh, ww, wh] = cell;
        for (let yy = y0 + 14; yy < y0 + h - wh - 6; yy += rh) for (let xx = x0 + 8; xx < x0 + w - ww - 6; xx += cw) {
          if (r() < win) items.push(<rect key={`w${bi}-${k}-${xx}-${yy}`} x={xx} y={yy} width={ww} height={wh} fill={r() < 0.08 ? PINK_L : WIN} opacity={lerp(0.35, 0.95, r())} />);
        }
      });
      const top = b.tiers[b.tiers.length - 1], cx = b.x + b.w / 2, ty = G - top[1] - top[2];
      if (b.spire) items.push(<polygon key={`s${bi}`} points={`${cx - 7},${ty} ${cx + 7},${ty} ${cx},${ty - b.spire}`} fill={color} />);
      if (b.fan) {
        const R = (b.w - 2 * top[0]) * 0.42;
        items.push(<path key={`f${bi}`} d={`M${cx - R},${ty} A${R},${R} 0 0 1 ${cx + R},${ty} Z`} fill={color} />);
        for (let a = 1; a < 8; a++) { const an = Math.PI * (a / 8); items.push(<line key={`fr${bi}-${a}`} x1={cx} y1={ty} x2={cx - Math.cos(an) * R * 0.92} y2={ty - Math.sin(an) * R * 0.92} stroke="rgba(217,178,111,0.35)" strokeWidth={2} />); }
      }
    });
    return items;
  }, [seed, color, rim, win, cell, o, deco]);
  return <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>{el}</svg>;
};
const FAR = { hMin: 560, hMax: 1060, wMin: 70, wMax: 140, gap: 18, spireP: 0.35 };
const MID = { hMin: 420, hMax: 820, wMin: 110, wMax: 190, gap: 30, spireP: 0.25 };
const NEAR = { hMin: 220, hMax: 560, wMin: 160, wMax: 280, gap: 40, spireP: 0.15 };
const CELL_FAR: [number, number, number, number] = [14, 20, 5, 8], CELL_MID: [number, number, number, number] = [18, 26, 7, 11], CELL_NEAR: [number, number, number, number] = [24, 34, 10, 15];

// Projecteur : cône de lumière qui part du sol
const Beam: React.FC<{ x: number; ang: number; o: number; len?: number; spread?: number; color?: string }> = ({ x, ang, o, len = 2400, spread = 4, color = "255,236,205" }) => {
  if (o <= 0.01) return null;
  const wTop = 2 * len * Math.tan((spread * Math.PI) / 180);
  return <div style={{ position: "absolute", left: x - wTop / 2, top: 1940 - len, width: wTop, height: len, transformOrigin: "50% 100%", transform: `rotate(${ang}deg)`, opacity: o,
    clipPath: "polygon(48.5% 100%, 0 0, 100% 0, 51.5% 100%)", background: `linear-gradient(to top, rgba(${color},0.42), rgba(${color},0.1) 65%, rgba(${color},0))`, filter: "blur(3px)", mixBlendMode: "screen" }} />;
};
// Signal projeté sur les nuages (« ? » puis « mm. »)
const Signal: React.FC<{ y: number; o: number; glyph: "?" | "mm."; flick?: number }> = ({ y, o, glyph, flick = 1 }) => o <= 0.01 ? null : (
  <div style={{ position: "absolute", left: 540 - 270, top: y - 225, width: 540, height: 450, opacity: o * flick }}>
    <div style={{ position: "absolute", inset: -120, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,230,190,0.32) 0%, rgba(255,210,170,0.08) 50%, rgba(0,0,0,0) 70%)" }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 46%, rgba(255,248,226,0.97) 0%, rgba(255,236,196,0.9) 46%, rgba(255,214,168,0.5) 64%, rgba(255,214,168,0) 71%)", filter: "blur(2px)" }} />
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "perspective(900px) rotateX(18deg)" }}>
      {glyph === "?"
        ? <span style={{ fontFamily: DECO, fontSize: 290, color: "#1A0C14", opacity: 0.88, filter: "blur(1.5px)", marginTop: 20 }}>?</span>
        : <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 168, letterSpacing: -6, color: "#5A2030", opacity: 0.9, filter: "blur(1.2px)" }}>mm.</span>}
    </div>
  </div>
);
const Moon: React.FC<{ y: number; o: number }> = ({ y, o }) => o <= 0.01 ? null : (
  <div style={{ position: "absolute", left: 540 - 330, top: y - 330, width: 660, height: 660, opacity: o }}>
    <div style={{ position: "absolute", inset: -160, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,226,196,0.35) 0%, rgba(255,200,170,0.08) 45%, rgba(0,0,0,0) 68%)" }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 40% 38%, #FFF6E4 0%, #F3DFC0 55%, #D9BC98 100%)", boxShadow: "0 0 120px rgba(255,220,180,0.55)" }} />
    {[[180, 220, 70], [380, 160, 44], [420, 400, 90], [230, 450, 36], [300, 300, 28]].map(([x, yy, r], i) => (
      <div key={i} style={{ position: "absolute", left: x - r, top: yy - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: "radial-gradient(circle at 45% 40%, rgba(170,130,100,0.28), rgba(170,130,100,0.06) 70%, rgba(0,0,0,0))" }} />
    ))}
  </div>
);
const Zeppelin: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <svg width={300} height={110} viewBox="0 0 300 110" style={{ position: "absolute", left: x, top: y, opacity: 0.85 }}>
    <ellipse cx={150} cy={45} rx={140} ry={38} fill="#140A14" />
    <rect x={10} y={44} width={280} height={2} fill="rgba(242,184,192,0.25)" />
    <path d="M18 45 L0 18 L30 30 Z M18 45 L0 72 L30 60 Z" fill="#140A14" />
    <rect x={120} y={80} width={56} height={16} rx={4} fill="#140A14" />
    {[0, 1, 2, 3].map((i) => <rect key={i} x={126 + i * 12} y={85} width={6} height={5} fill={WIN} opacity={0.8} />)}
  </svg>
);

// ─── fond commun : ciel rouge-violet, nuages, ville en parallaxe, projecteurs ───
const Background: React.FC<{ t: number }> = ({ t }) => {
  const ty = kf(t, [[0, 0], [C.c2 - 0.12, 0], [C.c2 + 0.4, 420], [C.c3 - 0.05, 430], [C.c3 + 0.1, 200], [C.c6 - 0.1, 200], [C.c6 + 0.25, 60], [C.c9 - 0.1, 60], [C.c9 + 0.6, 0]]);
  const zoom = kf(t, [[0, 1.3], [3.6, 1.0], [C.c1, 1.0], [C.c2, 1.05], [C.c2 + 0.4, 1.0], [C.c9, 1.0], [T.end, 1.04]]);
  const blur = kf(t, [[C.c3 - 0.05, 0], [C.c3 + 0.15, 7], [C.c4, 7], [C.c4 + 0.4, 1.5], [C.c5, 1.5], [C.c5 + 0.2, 9], [C.c6, 9], [C.c6 + 0.25, 1], [C.c7, 1], [C.c7 + 0.2, 7], [C.c8, 7], [C.c8 + 0.1, 3], [C.c9, 3], [C.c9 + 0.5, 0]]);
  const dim = kf(t, [[C.c3 - 0.05, 0], [C.c3 + 0.15, 0.5], [C.c4, 0.5], [C.c4 + 0.4, 0.25], [C.c5, 0.25], [C.c5 + 0.2, 0.6], [C.c6, 0.6], [C.c6 + 0.25, 0.2], [C.c7, 0.2], [C.c7 + 0.2, 0.55], [C.c8, 0.55], [C.c8 + 0.1, 0.3], [C.c9, 0.3], [C.c9 + 0.5, 0.05]]);
  const sigO = t < C.c1 + 0.1 ? clamp(seg(t, -0.05, 0.12)) : t >= C.c9 - 0.1 ? seg(t, C.c9 - 0.1, C.c9 + 0.5) : 0;
  const glyph: "?" | "mm." = t < T.mm2 - 0.05 ? "?" : "mm.";
  const flick = t > T.mm2 - 0.3 && t < T.mm2 + 0.25 ? (Math.floor((t - T.mm2 + 0.3) * 22) % 3 === 1 ? 0.25 : 1) : t < 0.25 ? (Math.floor(t * 30) % 2 ? 0.5 : 1) : 1;
  const lightning = pulse(t, T.s1 + 0.05, 0.05) + 0.6 * pulse(t, T.s1 + 0.2, 0.04);
  const sweep = (ph: number, amp: number) => Math.sin(t * 0.55 + ph) * amp;
  const beamsO = t < C.c3 ? 0.9 : t < C.c6 ? 0.45 : 0.9;
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 640px", transform: `scale(${zoom})`, filter: `blur(${blur}px) brightness(${1 - dim})` }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #05030A 0%, #140820 26%, #3A1230 52%, #7A2238 72%, #A23A40 88%, #C4584C 100%)" }} />
      <div style={{ position: "absolute", inset: 0, background: `rgba(230,220,255,${lightning * 0.35})` }} />
      {Array.from({ length: 40 }, (_, i) => { const r = rng(i * 7 + 1); const x = r() * 1080, y = r() * 700; return <div key={i} style={{ position: "absolute", left: x, top: y + ty * 0.2, width: 3, height: 3, borderRadius: 2, background: "#fff", opacity: 0.25 + 0.35 * Math.abs(Math.sin(t * 1.3 + i)) }} />; })}
      <Moon y={kf(t, [[C.c2 - 0.1, 1700], [C.c2 + 0.45, 760], [C.c3, 740], [C.c3 + 0.2, 300]])} o={show(t, C.c2 - 0.1, C.c3 + 0.25) ? 1 - seg(t, C.c3, C.c3 + 0.2) : 0} />
      {/* nuages */}
      {[[200, 520, 700, 160], [760, 430, 620, 140], [520, 760, 900, 190], [120, 930, 520, 120], [900, 880, 560, 130], [520, 300, 800, 120]].map(([x, y, w, h], i) => (
        <div key={i} style={{ position: "absolute", left: x - w / 2 + Math.sin(t * 0.08 + i) * 40, top: y - h / 2 + ty * 0.5, width: w, height: h, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(120,50,80,0.55), rgba(90,30,60,0) 70%)", filter: "blur(18px)" }} />
      ))}
      <Zeppelin x={lerp(-320, 1200, seg(t, 0, 26))} y={250 + ty * 0.35} />
      {/* faisceau du signal + signal */}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${ty * 0.5}px)` }}>
        <Beam x={540} ang={0} o={sigO * 0.9 * flick} len={1320} spread={10} />
        <Signal y={640} o={sigO} glyph={glyph} flick={flick} />
      </div>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${ty * 0.55}px)` }}><CityLayer seed={11} color="#2A1430" rim="#5A2A44" win={0.12} cell={CELL_FAR} o={FAR} /></div>
      <Beam x={170} ang={-18 + sweep(0, 14)} o={beamsO} />
      <Beam x={930} ang={16 + sweep(2.1, 13)} o={beamsO} />
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${ty * 0.8}px)` }}><CityLayer seed={23} color="#170A19" rim="#4A1F33" win={0.2} cell={CELL_MID} o={MID} /></div>
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${ty}px)` }}><CityLayer seed={37} color="#0A050B" rim="#3A1626" win={0.28} cell={CELL_NEAR} o={NEAR} deco /></div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 500, background: "linear-gradient(180deg, rgba(122,34,56,0) 0%, rgba(122,34,56,0.18) 100%)" }} />
    </div>
  );
};

// ─── éléments Art déco ───
export const Fan: React.FC<{ size: number; color?: string; o?: number }> = ({ size, color = GOLD, o = 1 }) => (
  <svg width={size} height={size / 2} viewBox="0 0 100 50" style={{ opacity: o, display: "block" }}>
    <path d="M10 50 A40 40 0 0 1 90 50" fill="none" stroke={color} strokeWidth={2} />
    <path d="M28 50 A22 22 0 0 1 72 50" fill="none" stroke={color} strokeWidth={2} />
    {Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (0.1 + 0.8 * (i / 8)); return <line key={i} x1={50 - Math.cos(a) * 24} y1={50 - Math.sin(a) * 24} x2={50 - Math.cos(a) * 38} y2={50 - Math.sin(a) * 38} stroke={color} strokeWidth={2} />; })}
    <circle cx={50} cy={50} r={6} fill={color} />
  </svg>
);
export const cut = (c: number) => `polygon(${c}px 0, calc(100% - ${c}px) 0, calc(100% - ${c}px) ${c / 2}px, 100% ${c / 2}px, 100% calc(100% - ${c / 2}px), calc(100% - ${c}px) calc(100% - ${c / 2}px), calc(100% - ${c}px) 100%, ${c}px 100%, ${c}px calc(100% - ${c / 2}px), 0 calc(100% - ${c / 2}px), 0 ${c / 2}px, ${c}px ${c / 2}px)`;
// Cadre doré permanent (coins à redans, éventail en haut et en bas)
export const DecoFrame: React.FC<{ o: number }> = ({ o }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o, zIndex: 30, pointerEvents: "none" }}>
    {[[26, 2.5], [40, 1.2]].map(([m, sw], i) => {
      const s = 34 - i * 8, a = m, b = 1080 - m, c = m, d = 1920 - m;
      return <path key={i} fill="none" stroke={GOLD} strokeWidth={sw} opacity={0.75}
        d={`M${a + s},${c} H${b - s} V${c + s / 2} H${b} V${d - s / 2} H${b - s} V${d} H${a + s} V${d - s / 2} H${a} V${c + s / 2} H${a + s} Z`} />;
    })}
    <g transform="translate(490 26)"><path d="M0 0 A50 50 0 0 0 100 0" fill="none" stroke={GOLD} strokeWidth={2} /><path d="M25 0 A25 25 0 0 0 75 0" fill="none" stroke={GOLD} strokeWidth={2} /></g>
    <g transform="translate(490 1894)"><path d="M0 0 A50 50 0 0 1 100 0" fill="none" stroke={GOLD} strokeWidth={2} /><path d="M25 0 A25 25 0 0 1 75 0" fill="none" stroke={GOLD} strokeWidth={2} /></g>
  </svg>
);
// Plaque de titre (cartouche doré)
const Plaque: React.FC<{ t: number; a: number; b: number; top: number; title: string; sub?: string; size: number; subAt?: number }> = ({ t, a, b, top, title, sub, size, subAt = a }) => {
  if (!show(t, a - 0.05, b)) return null;
  const k = ease(t, a, a + 0.45), o = seg(t, b - 0.25, b);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", justifyContent: "center", opacity: clamp(k * 1.4) * (1 - o), transform: `translateY(${(1 - k) * -40 + o * -20}px) scale(${lerp(1.08, 1, k)})`, filter: `blur(${(1 - k) * 8 + o * 10}px)` }}>
      <div style={{ position: "relative", padding: "34px 40px 30px", background: "linear-gradient(180deg, rgba(20,10,18,0.88), rgba(10,5,10,0.92))", clipPath: cut(26), textAlign: "center", minWidth: 760 }}>
        <div style={{ position: "absolute", inset: 8, border: `2px solid ${GOLD}`, clipPath: cut(20), opacity: 0.85 }} />
        <div style={{ position: "absolute", inset: 14, border: `1px solid ${GOLD}`, clipPath: cut(16), opacity: 0.45 }} />
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><Fan size={90} /></div>
        <div style={{ fontFamily: DECO, fontSize: size, lineHeight: 1.05, letterSpacing: 2, ...GOLD_TXT, clipPath: `inset(0 ${(1 - ease(t, a + 0.05, a + 0.6)) * 100}% 0 0)` }}>{title}</div>
        {sub && <div style={{ fontFamily: JOSEFIN, fontWeight: 600, fontSize: 34, letterSpacing: 9, color: CREAM, marginTop: 12, textTransform: "uppercase", opacity: seg(t, subAt, subAt + 0.3) }}>{sub}</div>}
      </div>
    </div>
  );
};
// Mots qui tombent un par un, calés sur la voix
export const Words: React.FC<{ t: number; items: [string, number][]; style: React.CSSProperties; gold?: boolean; out?: [number, number] }> = ({ t, items, style, gold, out }) => {
  const o = out ? seg(t, out[0], out[1]) : 0;
  if (o >= 1) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, textAlign: "center", filter: `drop-shadow(0 8px 22px rgba(0,0,0,0.9)) blur(${o * 12}px)`, opacity: 1 - o, ...style }}>
      {items.map(([w, at], i) => {
        const k = seg(t, at - 0.04, at + 0.26), e = easeOutBack(k);
        return <React.Fragment key={i}><span style={{ display: "inline-block", opacity: clamp(k * 2.2), transform: `translateY(${(1 - e) * -46}px) scale(${lerp(1.35, 1, e)})`, filter: `blur(${(1 - k) * 8}px)`, ...(gold ? GOLD_TXT : {}) }}>{w}</span>{" "}</React.Fragment>;
      })}
    </div>
  );
};
// Volets dorés (transition) : se ferment avant `at`, s'ouvrent après
export const Blinds: React.FC<{ t: number; at: number }> = ({ t, at }) => {
  if (!show(t, at - 0.26, at + 0.32)) return null;
  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 40 }}>
      {Array.from({ length: 8 }, (_, i) => {
        const d = i * 0.018, cIn = easeInOut(seg(t, at - 0.24 + d, at - 0.02 + d * 0.3)), cOut = easeInOut(seg(t, at + 0.02 + d, at + 0.3));
        const top = cOut * 1920, h = cIn * 1920 - top;
        return h <= 0 ? null : <div key={i} style={{ position: "absolute", left: i * 135, width: 136, top, height: h, background: "linear-gradient(90deg, #0D070C, #1B0F17 50%, #0D070C)", borderLeft: `2px solid ${GOLD}`, borderRight: `1px solid rgba(217,178,111,0.4)`, boxShadow: `0 6px 0 ${GOLD}` }} />;
      })}
    </div>
  );
};
// Fermeture à l'iris (vieux film)
const Iris: React.FC<{ t: number; at: number; a: [number, number]; b: [number, number] }> = ({ t, at, a, b }) => {
  if (!show(t, at - 0.32, at + 0.42)) return null;
  const r = t < at ? lerp(1500, 0, easeInOut(seg(t, at - 0.3, at))) : lerp(0, 1500, easeInOut(seg(t, at + 0.04, at + 0.4)));
  const [x, y] = t < at ? a : b;
  return <div style={{ position: "absolute", inset: 0, zIndex: 40, background: `radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,0) ${r}px, ${GOLD} ${r + 1}px, ${GOLD} ${r + 4}px, #000 ${r + 5}px)` }} />;
};
// Pilule Art déco (fond noir, filet doré)
export const DecoPill: React.FC<{ icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>; label: string; pink?: boolean }> = ({ icon: I, label, pink }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 20, padding: "16px 36px 16px 18px", borderRadius: 60, background: pink ? `linear-gradient(170deg, ${PINK_L}, ${PINK} 60%, #B9606B)` : "linear-gradient(180deg, #1E1219, #0C070B)", border: `2px solid ${pink ? "rgba(255,255,255,0.45)" : GOLD}`, boxShadow: `0 18px 50px rgba(0,0,0,0.6), 0 0 30px ${pink ? "rgba(217,130,139,0.45)" : "rgba(217,178,111,0.25)"}`, whiteSpace: "nowrap" }}>
    <div style={{ width: 66, height: 66, borderRadius: 33, background: pink ? "rgba(255,255,255,0.22)" : "rgba(217,178,111,0.14)", display: "flex", alignItems: "center", justifyContent: "center" }}><I size={36} color={pink ? "#fff" : GOLD_L} strokeWidth={2.2} /></div>
    <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 44, color: "#fff", letterSpacing: -0.5 }}>{label}</span>
  </div>
);

// ─── silhouettes de héros fictifs (aucun emblème) ───
const Flyer: React.FC<{ t: number; w: number }> = ({ t, w }) => {
  const wv = (i: number) => Math.sin(t * 9 + i * 1.1) * 14;
  const cape = `M548 104 C470 70 ${360} ${46 + wv(1)} ${250} ${40 + wv(2)} C190 ${36 + wv(3)} 130 ${20 + wv(4)} 60 ${30 + wv(5)} C90 ${80 + wv(6)} 70 ${130 + wv(7)} 110 ${170 + wv(8)} C220 ${150 + wv(2)} 360 ${160 + wv(3)} 520 150 Z`;
  return (
    <svg width={w} height={(w * 260) / 700} viewBox="0 0 700 260" style={{ overflow: "visible", filter: "drop-shadow(0 -3px 0 rgba(255,236,205,0.7)) drop-shadow(0 0 24px rgba(255,200,160,0.35))" }}>
      <defs><linearGradient id="capeR" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E0434C" /><stop offset="1" stopColor="#7A1520" /></linearGradient></defs>
      <path d={cape} fill="url(#capeR)" />
      <path d="M560 112 L676 86 L684 104 L566 140 Z" fill="#0A0609" /><circle cx={682} cy={94} r={13} fill="#0A0609" />
      <ellipse cx={470} cy={136} rx={102} ry={36} transform="rotate(-6 470 136)" fill="#0A0609" />
      <path d="M384 130 L150 150 L150 168 L390 162 Z M386 146 L170 182 L174 198 L392 168 Z" fill="#0A0609" />
      <circle cx={604} cy={112} r={30} fill="#0A0609" />
      <path d="M540 100 Q560 92 590 96 L580 120 Z" fill="#B3262F" />
    </svg>
  );
};

// ─── 0. hook : le signal « ? » dans le ciel ───
const Hook: React.FC<{ t: number }> = ({ t }) => {
  if (t >= C.c1 + 0.02) return null;
  return (
    <>
      <Words t={t} items={[["À", T.avis - 0.45], ["VOTRE", T.avis - 0.3], ["AVIS…", T.avis]]} style={{ top: 230, fontFamily: JOSEFIN, fontWeight: 700, fontSize: 56, letterSpacing: 14, color: CREAM }} />
      <Words t={t} gold items={[["COMMENT", T.comment], ["ON", T.on]]} style={{ top: 960, fontFamily: DECO, fontSize: 96, lineHeight: 1.05 }} />
      <Words t={t} gold items={[["RECRUTE", T.recrute], ["UN", T.un]]} style={{ top: 1068, fontFamily: DECO, fontSize: 96, lineHeight: 1.05 }} />
      <Words t={t} gold items={[["SUPER-HÉROS", T.heros], ["?", T.heros + 0.35]]} style={{ top: 1176, fontFamily: DECO, fontSize: 108, lineHeight: 1.05 }} />
    </>
  );
};

// ─── 1. le justicier masqué sur son toit ───
const Ledge: React.FC<{ y?: number }> = ({ y = 1390 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
    <path d={`M0 ${y + 70} H300 V${y + 30} H380 V${y} H700 V${y + 30} H780 V${y + 70} H1080 V1920 H0 Z`} fill="#050306" />
    <path d={`M0 ${y + 70} H300 V${y + 30} H380 V${y} H700 V${y + 30} H780 V${y + 70} H1080`} fill="none" stroke={GOLD} strokeWidth={3} opacity={0.6} />
    {Array.from({ length: 26 }, (_, i) => <rect key={i} x={20 + i * 41} y={y + 90} width={3} height={420} fill="rgba(217,178,111,0.09)" />)}
    <path d={`M440 ${y + 40} L540 ${y + 120} L640 ${y + 40}`} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.4} />
  </svg>
);
const Rain: React.FC<{ t: number; o: number }> = ({ t, o }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
    {Array.from({ length: 90 }, (_, i) => { const r = rng(i + 500); const x = r() * 1300 - 100, sp = 1400 + r() * 900, y0 = r() * 1920; const y = (y0 + t * sp) % 2100 - 100;
      return <line key={i} x1={x - (y / 1920) * 160} y1={y} x2={x - (y / 1920) * 160 - 12} y2={y + 46} stroke="rgba(230,215,240,0.35)" strokeWidth={1.6} />; })}
  </svg>
);
// Yann en mode masqué, en pied (public/episode1/yann-masque-pied.png : tête masquée fournie par le propriétaire montée sur
// mascotte/pied.png), debout derrière le parapet, cape sombre qui claque au vent, reflet sur les lunettes au mot « masqué »
const MY_H = 950, MY_W = (MY_H * 959) / 1740, MY_X = 540 - MY_W / 2, MY_Y = 520;
const MaskedYann: React.FC<{ t: number; glint: number }> = ({ t, glint }) => {
  const wv = (i: number) => Math.sin(t * 4.2 + i * 1.3) * 22;
  const sx = MY_X + MY_W * 0.3, ex = MY_X + MY_W * 0.7, sy = MY_Y + MY_H * 0.33, wind = Math.sin(t * 1.6) * 0.5 + 0.5;
  const capeD = `M${sx} ${sy} C${sx - 170} ${sy + 120} ${sx - 380 - wind * 50} ${sy + 420} ${sx - 440 - wind * 80 + wv(1)} ${sy + 880}` +
    ` Q${sx - 200} ${sy + 830 + wv(2)} ${(sx + ex) / 2} ${sy + 890 + wv(3)} Q${ex + 210} ${sy + 830 + wv(4)} ${ex + 430 + wind * 70 + wv(5)} ${sy + 860}` +
    ` C${ex + 350} ${sy + 420} ${ex + 170} ${sy + 120} ${ex} ${sy} Z`;
  const collar = `M${sx - 4} ${sy + 10} L${sx - 90} ${sy - 120} L${sx + 40} ${sy - 50} Z M${ex + 4} ${sy + 10} L${ex + 90} ${sy - 120} L${ex - 40} ${sy - 50} Z`;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", filter: "drop-shadow(-3px -2px 0 rgba(242,140,150,0.55))" }}>
        <defs><linearGradient id="capeN" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#24142E" /><stop offset="1" stopColor="#07040A" /></linearGradient></defs>
        <path d={capeD} fill="url(#capeN)" stroke="#5A2E6A" strokeWidth={4} />
        <path d={collar} fill="#1C1024" stroke="#5A2E6A" strokeWidth={4} strokeLinejoin="round" />
        {[-0.7, -0.3, 0.3, 0.7].map((f, i) => <path key={i} d={`M${(sx + ex) / 2 + f * 120} ${sy + 60} Q${(sx + ex) / 2 + f * 380} ${sy + 450} ${(sx + ex) / 2 + f * 560 + wv(i)} ${sy + 860}`} fill="none" stroke="rgba(0,0,0,0.45)" strokeWidth={12} strokeLinecap="round" />)}
      </svg>
      <Img src={staticFile("episode1/yann-masque-pied.png")} style={{ position: "absolute", left: MY_X, top: MY_Y, width: MY_W, height: MY_H, filter: "drop-shadow(-3px -2px 0 rgba(242,140,150,0.6)) drop-shadow(0 0 30px rgba(196,88,76,0.45))" }} />
      {glint > 0 && glint < 1 && (
        <div style={{ position: "absolute", left: MY_X + MY_W * 0.6 - 60, top: MY_Y + MY_H * 0.172 - 60, width: 120, height: 120, opacity: Math.sin(glint * Math.PI), transform: `rotate(${glint * 90}deg) scale(${0.5 + glint})`,
          background: "radial-gradient(circle, #fff 0%, rgba(255,255,255,0.6) 12%, rgba(255,255,255,0) 40%), linear-gradient(90deg, rgba(255,255,255,0) 45%, #fff 50%, rgba(255,255,255,0) 55%), linear-gradient(0deg, rgba(255,255,255,0) 45%, #fff 50%, rgba(255,255,255,0) 55%)", mixBlendMode: "screen" }} />
      )}
    </>
  );
};
const VigScene: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, C.c1, C.c2 + 0.3)) return null;
  const push = lerp(1, 1.08, seg(t, C.c1, C.c2)), up = ease(t, C.c2 - 0.08, C.c2 + 0.3);
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 1000px", transform: `scale(${push}) translateY(${up * 900}px)`, filter: `blur(${pulse(t, C.c2 + 0.08, 0.12) * 14}px)` }}>
      <Rain t={t} o={0.8} />
      <MaskedYann t={t} glint={seg(t, T.masque - 0.15, T.masque + 0.1)} />
      <Ledge />
      <Plaque t={t} a={T.s1 + 0.05} b={C.c2 + 0.05} top={200} title="LE JUSTICIER MASQUÉ" sub="veille sur la ville, la nuit" size={74} subAt={T.masque + 0.4} />
    </div>
  );
};

// ─── 2. le héros à la cape rouge devant la lune ───
const FlyScene: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, C.c2, C.c3 + 0.05)) return null;
  const p = seg(t, T.s2 - 0.15, C.c3 + 0.15), k = p + (0.72 * Math.sin(2 * Math.PI * p)) / (2 * Math.PI);
  const x = lerp(-420, 1360, k), y = lerp(1420, 120, k) + Math.sin(t * 2) * 10;
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: x - 520 - i * 30, top: y + 60 + (i - 3) * 26, width: 520, height: 3, transformOrigin: "100% 50%", transform: "rotate(-36deg)", background: "linear-gradient(90deg, rgba(255,236,205,0), rgba(255,236,205,0.55))", opacity: 0.6 }} />
      ))}
      <div style={{ position: "absolute", left: x - 310, top: y - 115, transform: "rotate(-36deg)" }}><Flyer t={t} w={620} /></div>
      <Plaque t={t} a={T.s2 + 0.15} b={C.c3 + 0.02} top={190} title="LE HÉROS À LA CAPE ROUGE" sub="traverse le ciel" size={60} subAt={T.rouge + 0.5} />
    </>
  );
};

// ─── 3. test de force ? duel sur les toits ? → NON. ───
const Poster: React.FC<{ icon: React.FC<{ size?: number; color?: string; strokeWidth?: number }>; lines: string[] }> = ({ icon: I, lines }) => (
  <div style={{ position: "relative", width: 420, height: 560, background: "linear-gradient(170deg, #22121C, #0D070B)", clipPath: cut(30), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, boxShadow: "0 30px 80px rgba(0,0,0,0.7)" }}>
    <div style={{ position: "absolute", inset: 0, background: `repeating-conic-gradient(from 0deg at 50% 42%, rgba(217,178,111,0.10) 0deg 5deg, rgba(0,0,0,0) 5deg 15deg)` }} />
    <div style={{ position: "absolute", inset: 10, border: `2px solid ${GOLD}`, clipPath: cut(24) }} />
    <div style={{ position: "absolute", inset: 18, border: `1px solid rgba(217,178,111,0.5)`, clipPath: cut(20) }} />
    <I size={170} color={GOLD_L} strokeWidth={1.6} />
    <div style={{ textAlign: "center", fontFamily: DECO, fontSize: 52, lineHeight: 1.08, ...GOLD_TXT, position: "relative" }}>{lines.map((l, i) => <div key={i}>{l}</div>)}</div>
  </div>
);
const TrialScene: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, C.c3, C.c4 + 0.3)) return null;
  const cards: [typeof Dumbbell, string[], number, number, number, number][] = [[Dumbbell, ["TEST", "DE FORCE ?"], 70, 360, -6, T.test], [Swords, ["DUEL SUR", "LES TOITS ?"], 560, 620, 5, T.duel]];
  const st = seg(t, T.non - 0.04, T.non + 0.1), out = seg(t, C.c4 - 0.1, C.c4 + 0.25);
  return (
    <>
      {cards.map(([I, lines, x, y, rot, at], i) => {
        if (t < at - 0.12) return null;
        const drop = go(t, at - 0.12, at + 0.22, -1100, 0), fall = Math.max(0, t - T.non - 0.04 - i * 0.05);
        const wob = Math.sin(t * 3 + i) * 1.5;
        return <div key={i} style={{ position: "absolute", left: x, top: y + drop + fall * fall * 2600, transform: `rotate(${rot + wob + fall * (i ? 70 : -70)}deg)` }}><Poster icon={I} lines={lines} /></div>;
      })}
      {st > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center", opacity: 1 - out, filter: `blur(${out * 14}px)` }}>
          <div style={{ transform: `rotate(-10deg) scale(${lerp(2.6, 1, easeOutBack(st))})`, padding: "6px 50px 0", border: "12px double #E0464E", borderRadius: 18, fontFamily: DECO, fontSize: 240, color: "#E0464E", lineHeight: 1.05, textShadow: "0 0 40px rgba(224,70,78,0.5)", background: "rgba(10,5,8,0.35)" }}>NON.</div>
        </div>
      )}
    </>
  );
};

// ─── 4. « leur lettre de motivation… avec MyMotiv » : l'enveloppe descend dans la lumière, cachet « mm. » ───
const Envelope: React.FC<{ seal: number }> = ({ seal }) => (
  <div style={{ position: "relative", width: 560, height: 370 }}>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(170deg, #FBF3E2, #E9D8B8)", borderRadius: 10, boxShadow: "0 40px 90px rgba(0,0,0,0.6), 0 0 80px rgba(255,236,205,0.35)" }} />
    <svg width={560} height={370} style={{ position: "absolute", inset: 0 }}>
      <path d="M0 0 L280 210 L560 0" fill="#F4E7CC" stroke="#CDB58A" strokeWidth={2} />
      <path d="M0 370 L230 180 M560 370 L330 180" stroke="#D8C39C" strokeWidth={2} />
      <rect x={14} y={14} width={532} height={342} fill="none" stroke={GOLD} strokeWidth={2} opacity={0.7} rx={6} />
    </svg>
    {seal > 0 && (
      <div style={{ position: "absolute", left: 280 - 85, top: 205 - 85, width: 170, height: 170, borderRadius: "50%", transform: `scale(${lerp(1.8, 1, easeOutBack(seal))})`, opacity: clamp(seal * 3),
        background: `radial-gradient(circle at 40% 35%, ${PINK_L}, ${PINK} 55%, #9E4A55)`, boxShadow: "0 8px 0 #7E3843, 0 14px 30px rgba(0,0,0,0.45), inset 0 0 0 10px rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 64, letterSpacing: -2, color: "#fff" }}>mm.</div>
    )}
  </div>
);
const LetterScene: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, C.c4 - 0.1, C.c5 + 0.3)) return null;
  const o = ease(t, C.c4 - 0.1, C.c4 + 0.4), desc = easeInOut(seg(t, C.c4, T.lettre + 0.2));
  const zoom = seg(t, C.c5 - 0.25, C.c5 + 0.05);
  const ey = lerp(-520, 760, desc) + Math.sin(t * 1.8) * 8 * (1 - zoom);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: o * (1 - seg(t, C.c5, C.c5 + 0.2)) }}>
      <div style={{ position: "absolute", left: 540 - 420, top: -100, width: 840, height: 1500, background: "linear-gradient(180deg, rgba(255,240,220,0.5), rgba(255,236,205,0.16) 60%, rgba(255,236,205,0))", clipPath: "polygon(38% 0, 62% 0, 100% 100%, 0 100%)", filter: "blur(14px)", mixBlendMode: "screen" }} />
      <Words t={t} items={[["ILS", T.ils], ["ONT", T.ils + 0.17], ["SIMPLEMENT", T.simplement], ["FAIT…", T.simplement + 0.32]]} style={{ top: 220, fontFamily: JOSEFIN, fontWeight: 700, fontSize: 46, letterSpacing: 9, color: CREAM }} out={[C.c5 - 0.3, C.c5]} />
      <Words t={t} gold items={[["LEUR", T.leur], ["LETTRE", T.lettre]]} style={{ top: 300, fontFamily: DECO, fontSize: 116, lineHeight: 1.05 }} out={[C.c5 - 0.3, C.c5]} />
      <Words t={t} gold items={[["DE", T.motivation - 0.2], ["MOTIVATION.", T.motivation]]} style={{ top: 428, fontFamily: DECO, fontSize: 96, lineHeight: 1.05 }} out={[C.c5 - 0.3, C.c5]} />
      <div style={{ position: "absolute", left: 540 - 280, top: ey, transformOrigin: "280px 185px", transform: `rotate(${Math.sin(t * 1.3) * 3 * (1 - desc * 0.6)}deg) scale(${lerp(1, 4.5, Math.pow(zoom, 2.2))})` }}>
        <Envelope seal={seg(t, T.mm - 0.12, T.mm + 0.12)} />
      </div>
      {t >= T.avec && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1210, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: seg(t, T.avec, T.avec + 0.2) * (1 - zoom), transform: `scale(${go(t, T.avec, T.mm + 0.2, 0.6, 1)})` }}>
          <div style={{ fontFamily: JOSEFIN, fontWeight: 700, fontSize: 40, letterSpacing: 12, color: CREAM }}>AVEC</div>
          <Img src={staticFile("logo-mymotiv.png")} style={{ width: 470, filter: `drop-shadow(0 0 22px ${PINK})` }} />
        </div>
      )}
    </div>
  );
};

// ─── 5. le vrai site : lien de l'offre, CV, 30 s → une lettre sur LEUR mission (pas un modèle) ───
const GEN = ["044", "045", "046", "047", "048", "049", "050", "051", "052", "053"];
const HeroLetter: React.FC<{ t: number; t0: number; hl: number }> = ({ t, t0, hl }) => {
  const line = (i: number) => ({ opacity: seg(t, t0 + 0.12 + i * 0.12, t0 + 0.3 + i * 0.12), transform: `translateY(${(1 - ease(t, t0 + 0.12 + i * 0.12, t0 + 0.4 + i * 0.12)) * 14}px)` });
  return (
    <div style={{ position: "relative", width: 720, height: 900, background: "linear-gradient(175deg, #FCF6EA, #EFE2C8)", clipPath: cut(26), padding: "58px 60px", boxSizing: "border-box", fontFamily: "Open Sans", color: "#2A1E1A", boxShadow: "0 40px 100px rgba(0,0,0,0.6)" }}>
      <div style={{ position: "absolute", inset: 12, border: `2px solid ${GOLD}`, clipPath: cut(20) }} />
      <div style={{ display: "flex", justifyContent: "center" }}><Fan size={110} color="#B98A3E" /></div>
      <div style={{ ...line(0), fontFamily: JOSEFIN, fontWeight: 700, fontSize: 24, letterSpacing: 6, textAlign: "center", color: "#8A6A3A", marginTop: 6 }}>À L'ATTENTION DE L'AGENCE NOVA</div>
      <div style={{ ...line(1), fontWeight: 600, fontSize: 28, marginTop: 30 }}>Objet : candidature — Protecteur de nuit</div>
      <div style={{ ...line(2), fontSize: 28, marginTop: 30 }}>Madame la Directrice,</div>
      <div style={{ ...line(3), fontSize: 28, lineHeight: 1.5, marginTop: 18 }}>Chaque nuit, je veille sur la ville grise pendant qu'elle dort.</div>
      <div style={{ ...line(4), fontSize: 28, lineHeight: 1.5, marginTop: 14 }}>
        Votre mission —{" "}
        <span style={{ background: `linear-gradient(90deg, rgba(217,130,139,0.55) ${hl * 100}%, rgba(217,130,139,0) ${hl * 100}%)`, borderRadius: 6, padding: "0 4px", fontWeight: 600 }}>protéger chaque quartier, sans bruit</span>{" "}
        — est déjà la mienne.
      </div>
      <div style={{ ...line(5), fontSize: 28, lineHeight: 1.5, marginTop: 14 }}>Discret, rapide, toujours là quand on m'appelle : je serais fier de rejoindre vos équipes.</div>
      <div style={{ ...line(6), fontFamily: DECO, fontSize: 40, marginTop: 30, color: "#5A3A28" }}>Le Justicier masqué</div>
    </div>
  );
};
const ToolScene: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, C.c5, C.c6 + 0.35)) return null;
  const enter = ease(t, C.c5, C.c5 + 0.45), back = ease(t, T.lettre2 - 0.15, T.lettre2 + 0.35);
  const whip = seg(t, C.c6 - 0.05, C.c6 + 0.3);
  const shot = t < T.cv - 0.15 ? "parcours/010-offre-lien.png" : t < T.trente - 0.2 ? "parcours/008-cv-ajoute.png"
    : `shots/${GEN[Math.min(GEN.length - 1, Math.floor(seg(t, T.trente - 0.2, T.lettre2 - 0.15) * GEN.length))]}-generation.png`;
  const pills: [number, number, typeof Link2, string, boolean][] = [
    [T.lien - 0.1, T.cv - 0.15, Link2, "Le lien de l'offre", false], [T.cv - 0.15, T.trente - 0.15, FileUser, "Leur CV", false],
    [T.trente - 0.15, T.lettre2 - 0.05, Timer, "30 secondes*", true], [T.lettre2 - 0.05, T.pas - 0.1, Target, "Leur mission", false], [T.pas - 0.1, C.c6 + 0.4, Ban, "Zéro copié-collé", true]];
  const gen = seg(t, T.pas - 0.1, T.pas + 0.25), cross = seg(t, T.copie - 0.1, T.copie + 0.3), genFall = Math.max(0, t - T.copie - 0.35);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${-whip * 900}px)`, filter: `blur(${whip * 18}px)`, opacity: 1 - seg(t, C.c6 + 0.1, C.c6 + 0.3) }}>
      <div style={{ position: "absolute", inset: 0, perspective: 1700 }}>
        <div style={{ position: "absolute", left: 270, top: 250, width: 540, height: 960, borderRadius: 58, overflow: "hidden", border: "10px solid #120B10", boxShadow: `0 0 0 2px ${GOLD}, 0 0 70px rgba(217,178,111,0.35), 0 40px 100px rgba(0,0,0,0.7)`,
          transform: `translateX(${back * -250}px) rotateY(${lerp(16, 6, enter) + back * 18}deg) scale(${lerp(0.75, 1, enter) * lerp(1, 0.78, back)})`, opacity: clamp(enter * 1.5), filter: `blur(${(1 - enter) * 12 + back * 5}px) brightness(${1 - back * 0.45})` }}>
          <Img src={staticFile(shot)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </div>
      {t >= T.lettre2 - 0.15 && (
        <div style={{ position: "absolute", left: 180, top: 250, transformOrigin: "50% 50%", transform: `translateX(${(1 - back) * -200}px) scale(${lerp(0.4, 1, easeOutBack(back))})`, opacity: clamp(back * 2) }}>
          <HeroLetter t={t} t0={T.lettre2 - 0.1} hl={ease(t, T.mission - 0.25, T.mission + 0.35)} />
        </div>
      )}
      {gen > 0 && (
        <div style={{ position: "absolute", left: 470, top: 640 + genFall * genFall * 2600, width: 520, padding: 34, boxSizing: "border-box", background: "#D9D9DE", borderRadius: 14, transform: `rotate(${lerp(30, 8, ease(t, T.pas - 0.1, T.pas + 0.3)) + genFall * 60}deg) translateX(${(1 - ease(t, T.pas - 0.1, T.pas + 0.3)) * 700}px)`, fontFamily: "Open Sans", fontSize: 26, color: "#55555C", lineHeight: 1.5, boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
          <div style={{ fontWeight: 600, color: "#3A3A40", marginBottom: 8 }}>Modèle de lettre</div>
          Madame, Monsieur, je me permets de vous adresser ma candidature pour le poste de [POSTE] au sein de [ENTREPRISE]…
          <svg width={520} height={320} viewBox="0 0 520 320" style={{ position: "absolute", left: 0, top: 0 }}>
            <line x1={40} y1={40} x2={40 + 440 * cross} y2={40 + 240 * cross} stroke="#E0464E" strokeWidth={16} strokeLinecap="round" />
            <line x1={480} y1={40} x2={480 - 440 * seg(cross, 0.3, 1)} y2={40 + 240 * seg(cross, 0.3, 1)} stroke="#E0464E" strokeWidth={16} strokeLinecap="round" />
          </svg>
        </div>
      )}
      {pills.map(([a, b, I, label, pink], i) => show(t, a, b) && (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 1262, display: "flex", justifyContent: "center", transform: `scale(${go(t, a, a + 0.3, 0.4, 1)})`, opacity: seg(t, a, a + 0.12) * (1 - seg(t, b - 0.1, b)) }}>
          <DecoPill icon={I} label={label} pink={pink} />
        </div>
      ))}
      {t >= T.trente - 0.15 && <div style={{ position: "absolute", left: 0, right: 0, top: 1392, textAlign: "center", fontFamily: "Open Sans", fontSize: 24, color: "rgba(245,236,217,0.7)", opacity: seg(t, T.trente - 0.15, T.trente + 0.2) }}>* temps mesuré : 27 à 35 s par lettre</div>}
    </div>
  );
};

// ─── 6. l'Agence Nova (fictive) : la lettre file dans la tour, la couronne s'allume ───
const Tower: React.FC<{ neon: number; crown: number }> = ({ neon, crown }) => {
  const el = useMemo(() => {
    const r = rng(77), items: React.ReactNode[] = [];
    const tiers: [number, number, number][] = [[0, 1000, 600], [70, 760, 330], [140, 560, 200], [200, 440, 120]];   // retrait, haut, hauteur
    tiers.forEach(([ins, top, h], k) => {
      items.push(<rect key={`t${k}`} x={ins} y={top} width={600 - 2 * ins} height={h + 2} fill="#0B060B" />);
      items.push(<rect key={`tr${k}`} x={ins} y={top} width={600 - 2 * ins} height={3} fill={GOLD} opacity={0.55} />);
      for (let px = ins + 30; px < 600 - ins - 20; px += 46) items.push(<rect key={`tp${k}-${px}`} x={px} y={top + 10} width={3} height={h - 10} fill="rgba(217,178,111,0.16)" />);
      for (let yy = top + 26; yy < top + h - 24; yy += 34) for (let xx = ins + 40; xx < 600 - ins - 40; xx += 46) if (r() < 0.55) items.push(<rect key={`w${k}-${xx}-${yy}`} x={xx - 12} y={yy} width={14} height={18} fill={r() < 0.1 ? PINK_L : WIN} opacity={lerp(0.4, 0.95, r())} />);
    });
    return items;
  }, []);
  return (
    <svg width={600} height={1600} viewBox="0 0 600 1600" style={{ overflow: "visible" }}>
      <g opacity={0.5 + crown * 0.5} style={{ filter: crown > 0.05 ? `drop-shadow(0 0 ${30 * crown}px rgba(243,217,155,0.9))` : undefined }}>
        <path d="M200 440 A100 100 0 0 1 400 440 Z" fill="#0B060B" stroke={GOLD} strokeWidth={3} />
        {Array.from({ length: 11 }, (_, i) => { const a = Math.PI * (0.08 + 0.84 * (i / 10)); return <line key={i} x1={300} y1={440} x2={300 - Math.cos(a) * 96} y2={440 - Math.sin(a) * 96} stroke={GOLD_L} strokeWidth={3} opacity={0.4 + crown * 0.6} />; })}
        <path d="M150 440 A150 150 0 0 1 450 440" fill="none" stroke={GOLD} strokeWidth={3} />
        <polygon points="292,345 308,345 300,140" fill={GOLD} />
        <circle cx={300} cy={300} r={9} fill={GOLD_L} />
      </g>
      {el}
      <rect x={250} y={1500} width={100} height={100} fill="#1A0F14" stroke={GOLD} strokeWidth={3} />
      <g opacity={neon} style={{ filter: `drop-shadow(0 0 10px ${PINK}) drop-shadow(0 0 26px ${PINK})` }}>
        <rect x={110} y={880} width={380} height={96} rx={10} fill="rgba(10,5,8,0.85)" stroke={PINK_L} strokeWidth={4} />
        <text x={300} y={944} textAnchor="middle" fontFamily={JOSEFIN} fontWeight={700} fontSize={50} letterSpacing={9} fill="#FFE3E8">AGENCE NOVA</text>
      </g>
      <text x={300} y={1300} textAnchor="middle" fontFamily={JOSEFIN} fontWeight={600} fontSize={20} letterSpacing={6} fill={GOLD} opacity={0.6}>{`· FONDÉE POUR PROTÉGER ·`}</text>
    </svg>
  );
};
const AgencyScene: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, C.c6, C.c7 + 0.3)) return null;
  const k = ease(t, C.c6, C.c6 + 0.45), push = lerp(1, 1.12, seg(t, C.c6, C.c7));
  const neonFl = t < T.agence - 0.1 ? 0 : t < T.agence + 0.25 ? (Math.floor((t - T.agence) * 30) % 3 === 0 ? 0.3 : 1) : 1;
  const fly = seg(t, T.postule - 0.25, T.nova + 0.05), crown = ease(t, T.nova + 0.02, T.nova + 0.3);
  const top = 260;
  // trajectoire de la lettre (courbe) jusqu'à la couronne
  const pt = (q: number): [number, number] => { const a = [80, 1750], c = [-60, 700], b = [540, top + 330]; return [(1 - q) ** 2 * a[0] + 2 * (1 - q) * q * c[0] + q * q * b[0], (1 - q) ** 2 * a[1] + 2 * (1 - q) * q * c[1] + q * q * b[1]]; };
  const [lx, ly] = pt(easeInOut(fly));
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: `540px ${top + 400}px`, transform: `scale(${push}) translateX(${(1 - k) * 900}px)`, filter: `blur(${(1 - k) * 16}px)`, opacity: 1 - seg(t, C.c7 - 0.02, C.c7 + 0.1) }}>
      <Beam x={330} ang={-24 + Math.sin(t * 1.4) * 10} o={0.9} />
      <Beam x={750} ang={22 + Math.sin(t * 1.2 + 2) * 10} o={0.9} />
      <div style={{ position: "absolute", left: 240, top }}><Tower neon={neonFl} crown={crown} /></div>
      {fly > 0 && fly < 1 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <polyline fill="none" stroke={PINK_L} strokeWidth={6} strokeLinecap="round" opacity={0.85} style={{ filter: `drop-shadow(0 0 10px ${PINK})` }}
            points={Array.from({ length: 16 }, (_, i) => pt(easeInOut(Math.max(0, fly - (i / 15) * 0.25))).join(",")).join(" ")} />
        </svg>
      )}
      {fly > 0 && fly < 1 && (
        <div style={{ position: "absolute", left: lx - 60, top: ly - 40, transform: `rotate(${-20 + fly * 30}deg) scale(${lerp(0.42, 0.14, fly)})`, transformOrigin: "60px 40px", filter: `drop-shadow(0 0 30px ${PINK}) drop-shadow(0 0 60px ${PINK_L})` }}>
          <Envelope seal={1} />
        </div>
      )}
    </div>
  );
};

// ─── 7. Recrutés ! (cartes d'agent fictives) ───
const Bust: React.FC<{ kind: "mask" | "cape"; t: number }> = ({ kind, t }) => (
  <svg width={260} height={260} viewBox="0 0 260 260">
    <defs><radialGradient id={`bg${kind}`} cx="0.5" cy="0.35" r="0.7"><stop offset="0" stopColor={kind === "mask" ? "#4A2A44" : "#6A2A30"} /><stop offset="1" stopColor="#120810" /></radialGradient></defs>
    <rect width={260} height={260} fill={`url(#bg${kind})`} />
    {kind === "cape" && <path d="M40 260 Q50 170 130 168 Q210 170 220 260 Z" fill="#C8323C" />}
    <path d="M60 260 Q66 186 130 178 Q194 186 200 260 Z" fill="#070407" />
    <ellipse cx={130} cy={112} rx={44} ry={54} fill="#070407" />
    {kind === "mask" && <g style={{ filter: "drop-shadow(0 0 6px #fff)" }} opacity={0.85 + 0.15 * Math.sin(t * 6)}><path d="M98 106 L124 102 L122 114 L102 114 Z M162 106 L136 102 L138 114 L158 114 Z" fill="#fff" /></g>}
  </svg>
);
const AgentCard: React.FC<{ t: number; kind: "mask" | "cape"; name: string[]; role: string }> = ({ t, kind, name, role }) => (
  <div style={{ position: "relative", width: 430, height: 600, background: "linear-gradient(175deg, #F8EFDC, #E6D3AE)", clipPath: cut(26), display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 34, boxSizing: "border-box", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}>
    <div style={{ position: "absolute", inset: 10, border: `2px solid #B98A3E`, clipPath: cut(20) }} />
    <div style={{ fontFamily: JOSEFIN, fontWeight: 700, fontSize: 30, letterSpacing: 8, color: "#7A5A2A" }}>AGENCE NOVA</div>
    <div style={{ fontFamily: JOSEFIN, fontWeight: 600, fontSize: 18, letterSpacing: 6, color: "#9A7A4A", marginTop: 4 }}>CARTE D'AGENT</div>
    <div style={{ marginTop: 20, border: `3px solid #B98A3E`, lineHeight: 0 }}>
      {kind === "mask" ? <Img src={staticFile("episode1/visage-2.jpg")} style={{ width: 260, height: 260, objectFit: "cover", objectPosition: "50% 16%", display: "block" }} /> : <Bust kind={kind} t={t} />}
    </div>
    <div style={{ fontFamily: DECO, fontSize: 34, color: "#3A2418", textAlign: "center", marginTop: 20, lineHeight: 1.1 }}>{name.map((n, i) => <div key={i}>{n}</div>)}</div>
    <div style={{ fontFamily: "Open Sans", fontWeight: 600, fontSize: 22, color: "#6A5038", marginTop: 10 }}>{role}</div>
  </div>
);
const HiredScene: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, C.c7, C.c8 + 0.05)) return null;
  const st = seg(t, T.pris - 0.05, T.pris + 0.1);
  return (
    <>
      {([["mask", ["LE JUSTICIER", "MASQUÉ"], "Protecteur de nuit", 75, -4], ["cape", ["LE HÉROS À LA", "CAPE ROUGE"], "Patrouille du ciel", 575, 4]] as const).map(([kind, name, role, x, rot], i) => {
        const at = C.c7 + 0.1 + i * 0.14;
        if (t < at) return null;
        return <div key={i} style={{ position: "absolute", left: x, top: 400 + go(t, at, at + 0.35, -1300, 0), transform: `rotate(${rot}deg)` }}><AgentCard t={t} kind={kind} name={[...name]} role={role} /></div>;
      })}
      {st > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 590, display: "flex", justifyContent: "center", zIndex: 5 }}>
          <div style={{ transform: `rotate(-14deg) scale(${lerp(2.8, 1, easeOutBack(st))})`, opacity: clamp(st * 3), padding: "4px 44px 0", border: `12px double ${PINK}`, borderRadius: 18, fontFamily: DECO, fontSize: 150, color: PINK_L, lineHeight: 1.1, textShadow: `0 0 40px ${PINK}`, background: "rgba(20,8,14,0.55)" }}>RECRUTÉS</div>
        </div>
      )}
      {st > 0 && Array.from({ length: 46 }, (_, i) => {
        const r = rng(i + 900), a = r() * Math.PI * 2, sp = 500 + r() * 900, dt = Math.max(0, t - T.pris);
        const x = 540 + Math.cos(a) * sp * dt, y = 720 + Math.sin(a) * sp * dt + 900 * dt * dt;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 14, height: 8, background: r() < 0.6 ? GOLD_L : PINK_L, transform: `rotate(${dt * 600 * (r() - 0.5)}deg)`, opacity: 1 - seg(dt, 0.6, 0.9) }} />;
      })}
    </>
  );
};

// ─── 8. « Toi, t'as pas de cape ? Pas grave. T'as un CV. » — Yann sur le toit ───
const envAt = (t: number) => { const i = Math.floor(t * 60); return i >= 0 && i < voixEnv.length ? voixEnv[i] : 0; };
const YannScene: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, C.c8, C.c9 + 0.45)) return null;
  const talk = (envAt(t) + envAt(t - 0.03)) / 2;
  const leave = ease(t, C.c9 - 0.05, C.c9 + 0.4);
  const h = 1150, w = (h * 959) / 1733, x = 540 - w / 2, y = 1890 - h;
  const capeIn = ease(t, T.cape - 0.15, T.cape + 0.3), capeOff = seg(t, T.pasGrave + 0.05, T.pasGrave + 0.9);
  const wv = (i: number) => Math.sin(t * 5 + i * 1.2) * 20;
  const sx = x + w * 0.27, ex = x + w * 0.73, sy = y + h * 0.25;
  const cv = seg(t, T.tasCv - 0.05, T.tasCv + 0.25);
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateY(${leave * 1300}px)`, opacity: 1 - seg(t, C.c9 + 0.2, C.c9 + 0.45) }}>
      <div style={{ position: "absolute", left: 540 - 520, top: -100, width: 1040, height: 2100, background: "linear-gradient(180deg, rgba(255,226,232,0.5), rgba(242,184,192,0.14) 60%, rgba(242,184,192,0))", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)", filter: "blur(16px)", mixBlendMode: "screen" }} />
      <Ledge y={1300} />
      {capeIn > 0 && capeOff < 1 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, transformOrigin: `${(sx + ex) / 2}px ${sy}px`, transform: `translate(${-capeOff * 900}px, ${-capeOff * 1100}px) rotate(${-capeOff * 70}deg) scaleY(${capeIn})`, opacity: 1 - seg(capeOff, 0.6, 1) }}>
          <defs><linearGradient id="capeY" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E0434C" /><stop offset="1" stopColor="#7A1520" /></linearGradient></defs>
          <path fill="url(#capeY)" d={`M${sx} ${sy} C${sx - 90} ${sy + 160} ${sx - 170} ${sy + 420} ${sx - 230 + wv(1)} ${sy + 720} Q${sx - 120} ${sy + 690 + wv(4)} ${sx - 40} ${sy + 740 + wv(2)} Q${(sx + ex) / 2} ${sy + 700 + wv(5)} ${ex + 40} ${sy + 740 + wv(3)} Q${ex + 120} ${sy + 690 + wv(6)} ${ex + 230 + wv(3)} ${sy + 720} C${ex + 170} ${sy + 420} ${ex + 90} ${sy + 160} ${ex} ${sy} Q${(sx + ex) / 2} ${sy + 30} ${sx} ${sy} Z`} />
          {[-0.62, -0.25, 0.25, 0.62].map((f, i) => { const cx = (sx + ex) / 2 + f * (ex - sx) * 0.9; return <path key={i} d={`M${(sx + ex) / 2 + f * 60} ${sy + 40} Q${cx + f * 60} ${sy + 380} ${cx + f * 200 + wv(i)} ${sy + 700}`} fill="none" stroke="rgba(60,6,14,0.55)" strokeWidth={14} strokeLinecap="round" />; })}
          <path d={`M${sx} ${sy} Q${(sx + ex) / 2} ${sy + 30} ${ex} ${sy}`} fill="none" stroke={GOLD} strokeWidth={6} />
        </svg>
      )}
      <div style={{ position: "absolute", left: x, top: y - talk * 12, width: w, transformOrigin: "50% 100%", transform: `rotate(${Math.sin(t * 1.7) * 1.2 + talk * 1.4 * Math.sin(t * 13)}deg) scale(${lerp(0.9, 1, ease(t, C.c8, C.c8 + 0.5)) * (1 + 0.04 * pulse(t, T.pasGrave, 0.1))})` }}>
        <Img src={staticFile("mascotte/pied.png")} style={{ width: "100%", display: "block", filter: "drop-shadow(0 30px 50px rgba(0,0,0,0.7)) drop-shadow(0 -2px 0 rgba(242,184,192,0.6))" }} />
      </div>
      <Words t={t} gold items={[["T'AS", T.toi + 0.3], ["PAS", T.toi + 0.5], ["DE", T.cape - 0.12], ["CAPE ?", T.cape]]} style={{ top: 230, fontFamily: DECO, fontSize: 90 }} out={[T.tasCv - 0.25, T.tasCv]} />
      <Words t={t} items={[["PAS", T.pasGrave], ["GRAVE.", T.pasGrave + 0.28]]} style={{ top: 350, fontFamily: DECO, fontSize: 84, color: PINK_L }} out={[T.tasCv - 0.25, T.tasCv]} />
      <Words t={t} gold items={[["T'AS", T.tasCv], ["UN", T.tasCv + 0.14], ["CV.", T.cv2]]} style={{ top: 250, fontFamily: DECO, fontSize: 140 }} />
      {cv > 0 && (
        <div style={{ position: "absolute", left: 700, top: 1130, width: 230, height: 300, background: "linear-gradient(175deg, #FFFFFF, #F1E6EA)", borderRadius: 16, transform: `rotate(8deg) scale(${go(t, T.tasCv - 0.05, T.cv2 + 0.1, 0.2, 1)})`, boxShadow: `0 0 50px ${PINK}, 0 20px 50px rgba(0,0,0,0.5)`, display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 30, boxSizing: "border-box", gap: 14 }}>
          <FileUser size={90} color={PINK} strokeWidth={1.8} />
          {[150, 170, 120, 160].map((ww, i) => <div key={i} style={{ width: ww, height: 12, borderRadius: 6, background: i ? "#E3D2D6" : PINK_L }} />)}
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 30, color: "#3A2A30" }}>Ton CV</div>
        </div>
      )}
    </div>
  );
};

// ─── 9-10. le signal « mm. », le slogan, 1re lettre offerte, lien en bio ───
const YANN_FIN: [number, string][] = [[0, "sourire"], [T.offerte - 0.1, "rire"], [T.bio - 0.1, "sourire"]];
const Finale: React.FC<{ t: number }> = ({ t }) => {
  if (t < C.c9) return null;
  const end = seg(t, T.end + 0.35, T.end + 0.9);
  const talk = (envAt(t) + envAt(t - 0.03)) / 2;
  const enter = go(t, T.s9 + 0.1, T.s9 + 0.5, 0, 1), yw = 300, yh = yw * 1.49;
  const ex = YANN_FIN.reduce((a, e) => (t >= e[0] ? e : a), YANN_FIN[0]);
  return (
    <>
      <Words t={t} items={[["AVEC", T.avec2], ["MYMOTIV,", T.mm2]]} style={{ top: 905, fontFamily: JOSEFIN, fontWeight: 700, fontSize: 52, letterSpacing: 10, color: CREAM }} />
      <Words t={t} gold items={[["POSTULEZ.", T.postulez]]} style={{ top: 968, fontFamily: DECO, fontSize: 146 }} />
      <Words t={t} items={[["ET", T.et], ["FAITES-VOUS", T.et + 0.2], ["RECRUTER.", T.recruter]]} style={{ top: 1126, fontFamily: DECO, fontSize: 60, color: PINK_L }} />
      {t >= T.offerte - 0.25 && <div style={{ position: "absolute", left: 0, right: 0, top: 1238, display: "flex", justifyContent: "center", transform: `scale(${go(t, T.offerte - 0.25, T.offerte + 0.1, 0.3, 1)})` }}><DecoPill icon={Gift} label="Ta 1re lettre est offerte" pink /></div>}
      {t >= T.lien2 - 0.15 && <div style={{ position: "absolute", left: 540 - 260, top: 1372, transform: `scale(${go(t, T.lien2 - 0.15, T.bio + 0.05, 0, 1)})` }}><GlossPill w={520} h={110} style={{ boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 0 2px ${GOLD}` }}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff" }}>Lien en bio <span style={{ color: PINK_L }}>↑</span></span></GlossPill></div>}
      {enter > 0 && (
        <div style={{ position: "absolute", left: 14, top: 1920 - yh + 40 + (1 - enter) * 500 - talk * 12, width: yw, zIndex: 20, transformOrigin: "50% 100%", transform: `rotate(${Math.sin(t * 1.7) * 1.5 + talk * 1.6 * Math.sin(t * 13)}deg) scale(${1 + 0.07 * pulse(t, ex[0] + 0.1, 0.08)})`, opacity: 1 - end }}>
          <div style={{ position: "absolute", left: -80, top: -50, width: yw + 160, height: yh, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,130,139,0.3), rgba(217,130,139,0) 65%)" }} />
          <Img src={staticFile(`mascotte/${ex[1]}.png`)} style={{ position: "relative", width: yw, display: "block", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }} />
        </div>
      )}
      {end > 0 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 35, background: `rgba(7,4,10,${end})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 40 }}>
          <div style={{ opacity: end }}><Fan size={180} /></div>
          <Img src={staticFile("logo-mymotiv.png")} style={{ width: 580, opacity: end, filter: `drop-shadow(0 0 24px ${PINK})` }} />
          <div style={{ fontFamily: JOSEFIN, fontWeight: 700, fontSize: 32, letterSpacing: 5, color: CREAM, opacity: seg(t, T.end + 0.7, T.end + 1.0) }}>1RE LETTRE OFFERTE · LIEN EN BIO ↑</div>
        </div>
      )}
    </>
  );
};

// ─── sous-titres (phrases sans titre à l'écran) ───
const CAPS = new Set([6, 7]);
const KEY = /nova|pris/i;
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = PH.findIndex(([a], k) => t >= a - 0.06 && (k + 1 >= PH.length || t < PH[k + 1][0] - 0.06));
  if (i < 0 || !CAPS.has(i) || t > PH[i][1] + 0.45) return null;
  const ph = voix.phrases[i], mots = voix.mots.filter((m) => m.phrase === i), words = ph.text.split(" "), total = ph.text.length;
  let pos = 0;
  const times = words.map((w) => { const c = pos / Math.max(1, total); pos += w.length + 1; const k = c * (mots.length - 1), j = Math.floor(k);
    return mots.length ? lerp(mots[j].t0, mots[Math.min(mots.length - 1, j + 1)].t0, k - j) : ph.t0; });
  const out = seg(t, PH[i][1] + 0.2, PH[i][1] + 0.45);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: i === 7 ? 1180 : 1330, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 58, lineHeight: 1.2, letterSpacing: -1, opacity: 1 - out, zIndex: 25 }}>
      {words.map((w, k) => {
        const t0 = times[k] - 0.03, kk = seg(t, t0, t0 + 0.12);
        return <React.Fragment key={k}><span style={{ display: "inline-block", opacity: t >= t0 ? 1 : 0, transform: `translateY(${(1 - kk) * 14}px) scale(${lerp(0.7, 1, kk)})`, color: KEY.test(w) ? GOLD_L : "#fff", textShadow: "0 4px 20px rgba(0,0,0,0.95)" }}>{w}</span>{" "}</React.Fragment>;
      })}
    </div>
  );
};
const MiseEnScene: React.FC<{ t: number }> = ({ t }) => show(t, C.c1 + 0.2, C.c8) ? (
  <div style={{ position: "absolute", left: 66, top: 150, zIndex: 31, display: "flex", alignItems: "center", gap: 10, fontFamily: JOSEFIN, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: "rgba(245,236,217,0.78)", opacity: seg(t, C.c1 + 0.2, C.c1 + 0.5) * (1 - seg(t, C.c8 - 0.2, C.c8)) }}>
    <span style={{ width: 10, height: 10, background: GOLD, transform: "rotate(45deg)" }} />MISE EN SCÈNE · PARODIE
  </div>
) : null;
const Grain: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, zIndex: 45, opacity: 0.09, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <filter id="grainF"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={1080} height={1920} filter="url(#grainF)" />
  </svg>
);

export const SuperRecrues: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const r = rng(frame + 5);
  const hits: [number, number][] = [[0.02, 1], [T.non, 1.6], [T.mm, 1.0], [T.pris, 1.3], [T.postulez, 0.8], [T.cv2, 0.5]];
  const shake = hits.reduce((s, [h, g]) => s + g * pulse(t, h + 0.04, 0.06), 0) * 10;
  const flash = pulse(t, 0.02, 0.05) * 0.5 + pulse(t, T.mm, 0.08) * 0.9 + pulse(t, C.c5, 0.07) * 0.9 + pulse(t, T.pris, 0.06) * 0.35 + pulse(t, T.nova + 0.05, 0.06) * 0.35 + pulse(t, T.mm2, 0.06) * 0.3;
  const flicker = 1 - 0.035 * Math.abs(Math.sin(frame * 1.7)) * (frame % 7 === 0 ? 1 : 0.3);
  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, overflow: "hidden" }}>
      <Audio src={staticFile("audio/heros.wav")} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)`, filter: `brightness(${flicker})` }}>
        <Background t={t} />
        <Hook t={t} />
        <VigScene t={t} />
        <FlyScene t={t} />
        <TrialScene t={t} />
        <LetterScene t={t} />
        <ToolScene t={t} />
        <AgencyScene t={t} />
        <HiredScene t={t} />
        <YannScene t={t} />
        <Finale t={t} />
        <Captions t={t} />
      </div>
      <div style={{ position: "absolute", inset: 0, zIndex: 29, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)" }} />
      <MiseEnScene t={t} />
      <DecoFrame o={0.6} />
      <Blinds t={t} at={C.c1} />
      <Blinds t={t} at={C.c3} />
      <Blinds t={t} at={C.c7} />
      <Iris t={t} at={C.c8} a={[540, 900]} b={[540, 1100]} />
      <Grain frame={frame} />
      <Flash k={flash} />
    </AbsoluteFill>
  );
};
