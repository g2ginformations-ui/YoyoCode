// Publicité « IA × humain » (25 s, 60 i/s) — effets et transitions à fond, texte au strict minimum.
// Démarrage du cœur IA → « IA × humain » (battement de cœur → signature) → ① Ton CV (scan laser, données extraites) →
// ② L'offre (lien, logo matérialisé, mots-clés reliés) → ③ Générer (onde, réseau en surchauffe, la lettre se matérialise) →
// vérification : « Relue & humanisée » par l'IA, « Validée par toi » par Inès → fin : première lettre offerte.
// Exact : l'IA de MyMotiv est un modèle de dernière génération ; la vérification humaine, c'est le candidat qui valide et ajuste.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { BG, PINK, PINK_L, WHITE, W, H, clamp, lerp, seg, easeOut, easeIn, easeInOut, rng } from "./common";
import { INES, Persona } from "./Persona";
import { CoLogo } from "./Duel";

const LILAC = "#b9a3ff";
const T = { human: 3.0, cv: 5.0, scan0: 6.0, scan1: 7.4, extract: 7.6, cvDone: 9.3, offer: 10.0, type0: 10.5, type1: 11.5, read: 11.9, logo: 12.4, kw: 13.3, gen: 15.0, press: 15.6, mat0: 16.1, mat1: 17.9, check: 18.5, ai: 18.9, tick0: 19.6, tick1: 20.1, you: 20.3, end: 21.5 };
const CUTS = [T.human, T.cv, T.offer, T.gen, T.check, T.end];
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const Pop = (t: number, t0: number, d = 0.3) => easeOutExpo(seg(t, t0, t0 + d));

// ───────── couche d'effets (canevas) : réseau neuronal, cœur IA, particules, lumière, grain, lignes de balayage ─────────
const CORE = { x: 540, y: 880 };
const NODES = (() => { const r = rng(77), out: { x: number; y: number; d: number }[] = []; for (let i = 0; i < 80; i++) { const a = r() * Math.PI * 2, d = 160 + Math.pow(r(), 0.7) * 760; out.push({ x: CORE.x + Math.cos(a) * d * 0.8, y: CORE.y + Math.sin(a) * d * 1.15, d }); } return out; })();
const EDGES = (() => { const out: [number, number][] = []; NODES.forEach((a, i) => { NODES.map((b, j) => [j, Math.hypot(a.x - b.x, a.y - b.y)] as [number, number]).filter(([j]) => j !== i).sort((p, q) => p[1] - q[1]).slice(0, 2).forEach(([j]) => { if (i < j) out.push([i, j]); }); }); return out; })();
const grainTiles: HTMLCanvasElement[] = [];
function grain() {
  if (grainTiles.length || typeof document === "undefined") return;
  for (let k = 0; k < 6; k++) { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d")!, im = g.createImageData(256, 256), r = rng(k * 9 + 1); for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 22; } g.putImageData(im, 0, 0); grainTiles.push(c); }
}
// intensité du réseau selon le moment (au repos, en éveil, en surchauffe pendant la génération)
const netLevel = (t: number) => (t < T.human ? seg(t, 0.4, 2.4) : t < T.gen ? 0.55 : t < T.check ? lerp(1, 1.8, seg(t, T.press, T.press + 0.4)) : t < T.end ? 0.4 : 0.6);
function paintFX(c: CanvasRenderingContext2D, t: number) {
  c.clearRect(0, 0, W, H);
  const warm = seg(t, T.check, T.check + 0.6) * (1 - seg(t, T.end, T.end + 0.4));
  // lumière d'ambiance qui dérive (« light leaks »)
  c.save(); c.globalCompositeOperation = "lighter";
  for (const [x0, y0, r0, col, sp] of [[200, 400, 700, warm > 0.5 ? "255,170,140" : "217,130,139", 0.4], [900, 1500, 800, "185,163,255", 0.3], [540, 900, 500, "242,184,192", 0.6]] as [number, number, number, string, number][]) {
    const x = x0 + Math.sin(t * sp) * 160, y = y0 + Math.cos(t * sp * 1.3) * 200, g = c.createRadialGradient(x, y, 0, x, y, r0);
    g.addColorStop(0, `rgba(${col},${0.13 + 0.05 * Math.sin(t * 2)})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  c.restore();
  // réseau neuronal
  const lvl = netLevel(t), vis = (i: number) => clamp((t - 0.5 - (NODES[i].d / 900) * 1.8) / 0.4);
  c.save(); c.globalCompositeOperation = "lighter";
  for (const [a, b] of EDGES) {
    const A = NODES[a], Bn = NODES[b], v = Math.min(vis(a), vis(b)) * clamp(lvl); if (v <= 0) continue;
    c.strokeStyle = `rgba(217,130,139,${0.18 * v})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(Bn.x, Bn.y); c.stroke();
    const sp = 0.6 + lvl * 1.2, u = ((t * sp + (a * 0.137) % 1) % 1); // impulsions qui circulent
    const px = lerp(A.x, Bn.x, u), py = lerp(A.y, Bn.y, u), g = c.createRadialGradient(px, py, 0, px, py, 14 + lvl * 6);
    g.addColorStop(0, `rgba(255,236,240,${0.9 * v})`); g.addColorStop(1, "rgba(217,130,139,0)"); c.fillStyle = g; c.fillRect(px - 24, py - 24, 48, 48);
  }
  NODES.forEach((n, i) => { const v = vis(i) * clamp(lvl); if (v <= 0) return; c.fillStyle = `rgba(242,184,192,${0.7 * v})`; c.beginPath(); c.arc(n.x, n.y, 3 + 2 * Math.sin(t * 4 + i), 0, Math.PI * 2); c.fill(); });
  c.restore();
  // cœur IA (pulse sur le tempo)
  const coreA = t < T.cv ? 1 : t < T.end ? 0.35 : 0, beatK = Math.exp(-((t % 0.5) * 8)), coreR = (t < 0.3 ? 0 : 70 * easeOutExpo(seg(t, 0.3, 1.2))) * (1 + 0.12 * beatK) * (t >= T.press && t < T.check ? 1.6 : 1);
  if (coreR > 0) {
    c.save(); c.globalCompositeOperation = "lighter";
    const g = c.createRadialGradient(CORE.x, CORE.y, 0, CORE.x, CORE.y, coreR * 5); g.addColorStop(0, `rgba(255,240,244,${0.9 * coreA})`); g.addColorStop(0.15, `rgba(242,184,192,${0.6 * coreA})`); g.addColorStop(1, "rgba(217,130,139,0)"); c.fillStyle = g; c.fillRect(CORE.x - coreR * 5, CORE.y - coreR * 5, coreR * 10, coreR * 10);
    for (let k = 0; k < 3; k++) { const ph = ((t * 0.8 + k / 3) % 1); c.strokeStyle = `rgba(242,184,192,${(1 - ph) * 0.5 * coreA})`; c.lineWidth = 3; c.beginPath(); c.arc(CORE.x, CORE.y, coreR * (1 + ph * 4), 0, Math.PI * 2); c.stroke(); }
    c.restore();
  }
  // particules de données : du CV vers le cœur (extraction), puis des mots-clés vers le logo
  if (t >= T.extract && t < T.cvDone + 0.3) {
    c.save(); c.globalCompositeOperation = "lighter"; const r = rng(5);
    for (let i = 0; i < 160; i++) { const t0 = T.extract + r() * 1.4, k = easeIn(seg(t, t0, t0 + 0.7)); if (k <= 0 || k >= 1) continue; const sx = 330 + r() * 420, sy = 980 + r() * 520; const x = lerp(sx, CORE.x, k), y = lerp(sy, CORE.y - 520, k) - Math.sin(k * Math.PI) * 120; c.fillStyle = `rgba(255,230,236,${1 - k * 0.5})`; c.fillRect(x, y, 4, 10 + 20 * k); }
    c.restore();
  }
  // matérialisation de la lettre (pluie de particules qui convergent)
  if (t >= T.mat0 - 0.2 && t < T.mat1) {
    c.save(); c.globalCompositeOperation = "lighter"; const r = rng(12);
    for (let i = 0; i < 260; i++) { const t0 = T.mat0 - 0.2 + r() * 1.5, k = easeOut(seg(t, t0, t0 + 0.5)); if (k <= 0 || k >= 1) continue; const tx = 260 + r() * 560, ty = 640 + r() * 780, a = r() * Math.PI * 2, d = 500 + r() * 400; const x = lerp(tx + Math.cos(a) * d, tx, k), y = lerp(ty + Math.sin(a) * d, ty, k); c.fillStyle = `rgba(242,184,192,${1 - k})`; c.beginPath(); c.arc(x, y, 3, 0, Math.PI * 2); c.fill(); }
    c.restore();
  }
  // transitions : tranches glitchées + bruit, sur chaque coupe
  for (const tc of CUTS) {
    const k = (t - tc + 0.12) / 0.3; if (k < 0 || k > 1) continue;
    const r = rng(Math.floor(t * 60)); c.save();
    for (let i = 0; i < 14; i++) { const y = r() * H, h = 6 + r() * 60, off = (r() - 0.5) * 300 * Math.sin(k * Math.PI); c.fillStyle = i % 3 ? `rgba(242,184,192,${0.35 * Math.sin(k * Math.PI)})` : `rgba(185,163,255,${0.3 * Math.sin(k * Math.PI)})`; c.fillRect(off, y, W, h); }
    c.fillStyle = `rgba(255,255,255,${0.35 * Math.max(0, 1 - Math.abs(k - 0.4) * 4)})`; c.fillRect(0, 0, W, H);
    c.restore();
  }
  // lignes de balayage + grain (texture « écran »)
  c.save(); c.fillStyle = "rgba(0,0,0,0.16)"; for (let y = (t * 120) % 6; y < H; y += 6) c.fillRect(0, y, W, 2); c.restore();
  grain(); if (grainTiles.length) { const tile = grainTiles[Math.floor(t * 60) % grainTiles.length], ox = (Math.floor(t * 600) * 37) % 256, oy = (Math.floor(t * 600) * 91) % 256; for (let x = -ox; x < W; x += 256) for (let y = -oy; y < H; y += 256) c.drawImage(tile, x, y); }
  // vignette
  const v = c.createRadialGradient(540, 960, 600, 540, 960, 1250); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)"); c.fillStyle = v; c.fillRect(0, 0, W, H);
}
const FX: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { paintFX(ref.current!.getContext("2d")!, t); }, [t]);
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />;
};

// ───────── éléments d'interface « holographiques » ─────────
const glitchAmt = (t: number) => CUTS.reduce((m, tc) => Math.max(m, clamp(1 - Math.abs(t - tc) / 0.25)), 0);
// texte à aberration chromatique (couches rose / lilas décalées)
const Chroma: React.FC<{ t: number; children: React.ReactNode; style: React.CSSProperties; amt?: number }> = ({ t, children, style, amt }) => {
  const g = (amt ?? glitchAmt(t)) * 14 + 2;
  return (
    <div style={{ position: "absolute", ...style }}>
      <div style={{ position: "absolute", inset: 0, color: "rgba(255,90,120,0.75)", transform: `translate(${-g}px, 0)`, mixBlendMode: "screen" }}>{children}</div>
      <div style={{ position: "absolute", inset: 0, color: "rgba(120,170,255,0.7)", transform: `translate(${g}px, 0)`, mixBlendMode: "screen" }}>{children}</div>
      <div style={{ position: "relative", textShadow: `0 0 30px rgba(242,184,192,0.8)` }}>{children}</div>
    </div>
  );
};
const Holo: React.FC<{ t: number; t0: number; t1: number; style: React.CSSProperties; children?: React.ReactNode }> = ({ t, t0, t1, style, children }) => {
  const k = easeOutExpo(seg(t, t0, t0 + 0.5)), out = easeIn(seg(t, t1 - 0.25, t1));
  if (t < t0 || t > t1) return null;
  return (
    <div style={{ position: "absolute", perspective: 1400, ...style }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 34, background: "linear-gradient(160deg, rgba(60,40,55,0.55), rgba(20,16,22,0.75))", border: "2px solid rgba(242,184,192,0.55)", boxShadow: "0 0 60px rgba(217,130,139,0.35), inset 0 0 40px rgba(242,184,192,0.12)", backdropFilter: "blur(10px)", overflow: "hidden", transform: `rotateX(${lerp(65, 0, k) + out * -40}deg) scale(${lerp(0.7, 1, k) * (1 - out * 0.2)})`, opacity: k * (1 - out), transformOrigin: "50% 100%" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(242,184,192,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(242,184,192,0.07) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: `${((t * 40) % 120) - 10}%`, height: 80, background: "linear-gradient(180deg, rgba(242,184,192,0), rgba(242,184,192,0.12), rgba(242,184,192,0))" }} />
        {children}
      </div>
    </div>
  );
};
const STEPS = ["Ton CV", "L'offre", "Générer"];
const Pills: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.cv - 0.2 || t >= T.check + 0.2) return null;
  const step = t < T.offer ? 0 : t < T.gen ? 1 : 2, a = Pop(t, T.cv - 0.2) * (1 - seg(t, T.check - 0.1, T.check + 0.2));
  return (
    <div style={{ position: "absolute", top: 200, left: 0, width: W, display: "flex", justifyContent: "center", gap: 24, opacity: a }}>
      {STEPS.map((n, i) => { const on = i === step, done = i < step || (i === 0 && t >= T.cvDone) || (i === 1 && t >= T.kw + 1); return (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 28px", borderRadius: 44, border: `3px solid ${i <= step ? PINK : "#3a333c"}`, background: on ? "rgba(217,130,139,0.22)" : "rgba(20,16,22,0.6)", boxShadow: on ? `0 0 ${30 + 20 * Math.sin(t * 8)}px rgba(217,130,139,0.7)` : "none", fontFamily: "Poppins", fontWeight: 700, fontSize: 34, color: i <= step ? WHITE : "#6f6a72", transform: `scale(${on ? 1.08 : 1})` }}>
          <span style={{ width: 50, height: 50, borderRadius: "50%", background: i <= step ? PINK : "#2a252c", color: "#2e1f22", display: "flex", alignItems: "center", justifyContent: "center" }}>{done ? "✓" : i + 1}</span>{n}
        </div>); })}
    </div>
  );
};
const Ripple: React.FC<{ t: number; tc: number; x: number; y: number; big?: boolean }> = ({ t, tc, x, y, big }) => {
  const k = (t - tc) / (big ? 0.9 : 0.5); if (k < 0 || k > 1) return null; const R = (big ? 1400 : 300) * easeOut(k);
  return <><div style={{ position: "absolute", left: x - R, top: y - R, width: R * 2, height: R * 2, borderRadius: "50%", border: `${big ? 16 : 6}px solid rgba(242,184,192,${1 - k})`, boxShadow: `0 0 60px rgba(217,130,139,${1 - k}), inset 0 0 60px rgba(217,130,139,${(1 - k) * 0.6})` }} />{big && <div style={{ position: "absolute", left: x - R * 0.6, top: y - R * 0.6, width: R * 1.2, height: R * 1.2, borderRadius: "50%", border: `6px solid rgba(185,163,255,${1 - k})` }} />}</>;
};
const Flare: React.FC<{ x: number; y: number; a: number; w?: number }> = ({ x, y, a, w = 900 }) => a <= 0 ? null : (
  <>
    <div style={{ position: "absolute", left: x - w / 2, top: y - 6, width: w, height: 12, borderRadius: 6, background: "linear-gradient(90deg, rgba(242,184,192,0), rgba(255,240,244,0.95), rgba(242,184,192,0))", opacity: a, filter: "blur(2px)" }} />
    <div style={{ position: "absolute", left: x - 90, top: y - 90, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.95), rgba(242,184,192,0.4) 40%, rgba(242,184,192,0) 70%)", opacity: a }} />
  </>
);

// ───────── scènes ─────────
const Boot: React.FC<{ t: number }> = ({ t }) => {
  const l = Pop(t, 1.8, 0.5), out = seg(t, T.human - 0.25, T.human);
  return <>
    <div style={{ position: "absolute", left: 0, top: 958, width: W * easeOutExpo(seg(t, 0.1, 0.45)), height: 4, background: "#fff", boxShadow: `0 0 30px ${PINK}`, opacity: 1 - seg(t, 0.45, 0.8) }} />
    {t >= 1.8 && <Chroma t={t} amt={clamp(1 - (t - 1.8) / 0.5)} style={{ left: 540 - 300, top: 1300, width: 600, opacity: l * (1 - out), transform: `scale(${lerp(1.4, 1, l)})` }}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 600, display: "block" }} /></Chroma>}
    <Flare x={540} y={1370} a={t >= 1.8 ? (1 - seg(t, 1.8, 2.6)) : 0} w={1100} />
  </>;
};
const Human: React.FC<{ t: number }> = ({ t }) => {
  // ligne de battement de cœur qui devient une signature
  const k = seg(t, T.human, T.human + 1.0), morph = easeInOut(seg(t, T.human + 1.0, T.human + 1.5)), out = seg(t, T.cv - 0.25, T.cv);
  const pts: string[] = []; for (let i = 0; i <= 120; i++) { const u = i / 120, x = 60 + u * 960; const ecg = ((u * 4) % 1), beat = ecg > 0.45 && ecg < 0.55 ? Math.sin((ecg - 0.45) * Math.PI * 10) * -160 : 0; const sig = Math.sin(u * 14) * 70 * Math.sin(u * Math.PI) + Math.cos(u * 23) * 25; pts.push(`${x},${1320 + lerp(beat, sig, morph)}`); }
  return <div style={{ opacity: 1 - out }}>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}><polyline points={pts.join(" ")} fill="none" stroke={morph > 0.5 ? PINK : WHITE} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={2600} strokeDashoffset={2600 * (1 - k)} style={{ filter: `drop-shadow(0 0 14px ${PINK})` }} /></svg>
    <Chroma t={t} style={{ left: 0, top: 560, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 190, letterSpacing: 10, color: WHITE, opacity: Pop(t, T.human + 0.1) }}>IA</Chroma>
    <div style={{ position: "absolute", left: 0, top: 790, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 300, fontSize: 90, color: PINK_L, opacity: Pop(t, T.human + 0.5) }}>×</div>
    <div style={{ position: "absolute", left: 0, top: 900, width: W, textAlign: "center", fontFamily: "Liberation Serif, Georgia, serif", fontStyle: "italic", fontSize: 170, color: PINK, opacity: Pop(t, T.human + 0.9, 0.5), filter: `blur(${(1 - Pop(t, T.human + 0.9, 0.5)) * 12}px)`, textShadow: "0 0 40px rgba(217,130,139,0.6)" }}>humain</div>
  </div>;
};
const StepCV: React.FC<{ t: number }> = ({ t }) => {
  const doc = Pop(t, T.cv + 0.35, 0.5), scan = seg(t, T.scan0, T.scan1), done = t >= T.cvDone;
  return <Holo t={t} t0={T.cv} t1={T.offer} style={{ left: 140, top: 520, width: 800, height: 1100 }}>
    <div style={{ position: "absolute", left: 160, top: 120, width: 480, height: 660, borderRadius: 18, background: "#f6f2f1", padding: 36, boxSizing: "border-box", transform: `translateY(${(1 - doc) * 500}px) rotate(${(1 - doc) * 12}deg)`, opacity: doc, boxShadow: done ? `0 0 60px ${PINK}` : "0 20px 40px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", gap: 18, alignItems: "center" }}><div style={{ width: 84, height: 84, borderRadius: "50%", background: "#d8cfcc" }} /><div><div style={{ height: 22, width: 200, borderRadius: 11, background: "#6b5f63" }} /><div style={{ height: 14, width: 140, borderRadius: 7, background: "#b8adb0", marginTop: 12 }} /></div></div>
      {[0, 1, 2].map((s) => <div key={s} style={{ marginTop: 40 }}><div style={{ height: 16, width: 140, borderRadius: 8, background: "#c98a92" }} />{[88, 72, 80].map((w2, i) => <div key={i} style={{ height: 11, width: `${w2}%`, borderRadius: 6, background: "#ddd5d6", marginTop: 14 }} />)}</div>)}
      {/* grille laser qui balaie le CV */}
      {scan > 0 && scan < 1 && <>
        <div style={{ position: "absolute", left: -30, right: -30, top: -20 + scan * 700, height: 6, background: "#fff", boxShadow: `0 0 30px 8px ${PINK}` }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: scan * 680, background: "linear-gradient(180deg, rgba(217,130,139,0.08), rgba(217,130,139,0.28))", backgroundImage: "linear-gradient(rgba(217,130,139,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(217,130,139,0.35) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      </>}
    </div>
    {done && <div style={{ position: "absolute", left: 400 - 70, top: 860, width: 140, height: 140, borderRadius: "50%", background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 80, color: "#2e1f22", transform: `scale(${lerp(2, 1, Pop(t, T.cvDone))})`, opacity: Pop(t, T.cvDone), boxShadow: `0 0 60px ${PINK}` }}>✓</div>}
  </Holo>;
};
const OFFER_URL = "carrieres.maison-lumen.fr/offre";
const scramble = (s: string, k: number, seed: number) => { const r = rng(seed), n = Math.floor(s.length * k); return s.split("").map((ch, i) => (i < n ? ch : i < n + 6 ? "#%&@*$01"[Math.floor(r() * 8)] : "")).join(""); };
const StepOffer: React.FC<{ t: number }> = ({ t }) => {
  const typed = scramble(OFFER_URL, seg(t, T.type0, T.type1), Math.floor(t * 30)), press = t >= T.read && t < T.read + 0.12, logo = Pop(t, T.logo, 0.6);
  const KW: [string, number, number][] = [["retail", 220, 1180], ["Lyon", 860, 1130], ["réseaux sociaux", 290, 1500], ["équipe", 800, 1460]];
  return <>
    <Holo t={t} t0={T.offer} t1={T.gen} style={{ left: 90, top: 420, width: 900, height: 300 }}>
      <div style={{ position: "absolute", left: 40, top: 46, right: 40, height: 100, borderRadius: 50, border: `3px solid ${t > T.type0 ? PINK : "#4a434c"}`, display: "flex", alignItems: "center", padding: "0 34px", fontFamily: "Open Sans", fontWeight: 600, fontSize: 38, color: WHITE, boxShadow: t > T.type0 ? `0 0 30px rgba(217,130,139,0.5)` : "none" }}>
        {t < T.type0 ? <span style={{ color: "#6f6a72" }}>https://…</span> : typed}{t < T.read && Math.floor(t * 4) % 2 === 0 && <span style={{ width: 4, height: 44, background: PINK, marginLeft: 4, display: "inline-block" }} />}
      </div>
      <div style={{ position: "absolute", left: 300, top: 170, width: 300, height: 90, borderRadius: 45, background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#2e1f22", transform: `scale(${press ? 0.9 : 1})`, boxShadow: `0 0 ${press ? 80 : 30}px ${PINK}` }}>{t >= T.read + 0.2 ? "✓" : "Lire"}</div>
    </Holo>
    <Ripple t={t} tc={T.read} x={540} y={635} />
    {/* radar puis logo matérialisé en pixels */}
    {t >= T.read + 0.1 && t < T.gen && [0, 0.2, 0.4].map((d) => { const k = seg(t, T.read + 0.1 + d, T.read + 0.8 + d); return k > 0 && k < 1 && <div key={d} style={{ position: "absolute", left: 540 - 400 * k, top: 1000 - 400 * k, width: 800 * k, height: 800 * k, borderRadius: "50%", border: `3px solid rgba(242,184,192,${1 - k})` }} />; })}
    {t >= T.logo && t < T.gen && (
      <div style={{ position: "absolute", left: 540 - 150, top: 1000 - 150, width: 300, height: 300, transform: `scale(${lerp(0.5, 1, logo)}) rotateY(${(1 - logo) * 180}deg)`, opacity: Math.min(1, logo * 1.5) * (1 - seg(t, T.gen - 0.25, T.gen)), filter: `drop-shadow(0 0 ${50 * (1 - logo) + 25}px ${PINK})` }}>
        <CoLogo k="lumen" size={300} />
        {logo < 1 && <div style={{ position: "absolute", inset: 0, backgroundImage: `repeating-linear-gradient(0deg, rgba(11,10,11,${1 - logo}) 0 ${Math.max(1, 30 * (1 - logo))}px, transparent ${Math.max(1, 30 * (1 - logo))}px ${Math.max(2, 60 * (1 - logo))}px)` }} />}
      </div>
    )}
    <Flare x={540} y={1000} a={t >= T.logo + 0.3 ? 1 - seg(t, T.logo + 0.3, T.logo + 1.0) : 0} />
    {/* mots-clés reliés au logo par des faisceaux */}
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, T.gen - 0.25, T.gen) }}>{KW.map(([w, x, y], i) => { const k = Pop(t, T.kw + i * 0.25, 0.4); return k > 0 && <line key={w} x1={540} y1={1000} x2={lerp(540, x, k)} y2={lerp(1000, y, k)} stroke={PINK_L} strokeWidth={3} style={{ filter: `drop-shadow(0 0 8px ${PINK})` }} />; })}</svg>
    {KW.map(([w, x, y], i) => { const k = Pop(t, T.kw + i * 0.25, 0.4); return k > 0 && t < T.gen && <div key={w} style={{ position: "absolute", left: lerp(540, x, k), top: lerp(1000, y, k), transform: "translate(-50%,-50%)", padding: "14px 28px", borderRadius: 40, border: `3px solid ${PINK}`, background: "rgba(30,20,28,0.85)", boxShadow: `0 0 30px rgba(217,130,139,0.6)`, fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: WHITE, opacity: k * (1 - seg(t, T.gen - 0.25, T.gen)), whiteSpace: "nowrap" }}>{w}</div>; })}
  </>;
};
const LETTER_LINES = [94, 86, 90, 70, 0, 92, 84, 88, 64, 0, 90, 76];
const StepGen: React.FC<{ t: number }> = ({ t }) => {
  const press = t >= T.press && t < T.press + 0.14, btnOut = seg(t, T.press + 0.2, T.press + 0.5), mat = seg(t, T.mat0, T.mat1);
  const outline = easeInOut(seg(t, T.mat0, T.mat0 + 0.5)), lines = Math.floor(LETTER_LINES.length * seg(t, T.mat0 + 0.4, T.mat1 - 0.3)), logoIn = Pop(t, T.mat1 - 0.3, 0.3);
  const warm = seg(t, T.check, T.check + 0.6);
  return <>
    {/* le grand bouton */}
    {btnOut < 1 && <div style={{ position: "absolute", left: 540 - 330, top: 900, width: 660, height: 170, borderRadius: 85, background: `linear-gradient(90deg, ${PINK}, ${PINK_L}, ${PINK})`, backgroundSize: "200% 100%", backgroundPosition: `${(t * 120) % 200}% 0`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 64, color: "#2e1f22", boxShadow: `0 0 ${60 + 40 * Math.sin(t * 10)}px ${PINK}, 0 0 160px rgba(217,130,139,0.5)`, transform: `scale(${lerp(0.6, 1, Pop(t, T.gen + 0.1)) * (press ? 0.9 : 1) * (1 + btnOut * 0.6)})`, opacity: 1 - btnOut }}>Générer</div>}
    <Ripple t={t} tc={T.press} x={540} y={985} big />
    {t >= T.press && t < T.press + 0.12 && <div style={{ position: "absolute", inset: 0, background: `rgba(255,245,248,${0.6 * (1 - (t - T.press) / 0.12)})` }} />}
    {/* la lettre se matérialise : contour → lignes → logo */}
    {t >= T.mat0 && t < T.end && (
      <div style={{ position: "absolute", left: 230, top: 600, width: 620, height: 860, transform: `translateX(${t >= T.check ? lerp(0, 120, easeInOut(seg(t, T.check, T.check + 0.6))) : 0}px)` }}>
        <svg width={620} height={860} style={{ position: "absolute", inset: 0, overflow: "visible" }}><rect x={2} y={2} width={616} height={856} rx={22} fill={`rgba(255,253,253,${seg(t, T.mat0 + 0.3, T.mat0 + 0.9)})`} stroke={PINK_L} strokeWidth={4} strokeDasharray={2950} strokeDashoffset={2950 * (1 - outline)} style={{ filter: `drop-shadow(0 0 ${20 + 20 * (1 - mat)}px ${PINK})` }} /></svg>
        <div style={{ position: "absolute", left: 46, top: 50, fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#2a2326", opacity: seg(t, T.mat0 + 0.4, T.mat0 + 0.7) }}>Inès Martin</div>
        {LETTER_LINES.map((w2, i) => i < lines && w2 > 0 && <div key={i} style={{ position: "absolute", left: 46, top: 190 + i * 46, height: 14, borderRadius: 7, width: (w2 / 100) * 520, background: i % 5 === 1 ? "rgba(217,130,139,0.55)" : "#e0d8da", boxShadow: i === lines - 1 ? `0 0 20px ${PINK}` : "none" }} />)}
        {lines > 0 && lines < LETTER_LINES.length && <div style={{ position: "absolute", left: 20, right: 20, top: 190 + lines * 46 - 10, height: 6, background: "#fff", boxShadow: `0 0 30px 8px ${PINK}` }} />}
        {logoIn > 0 && <div style={{ position: "absolute", right: 40, top: 40, transform: `scale(${lerp(2.2, 1, logoIn)})`, opacity: logoIn }}><CoLogo k="lumen" size={110} /></div>}
        {/* vérification : la coche dessinée « à la main » */}
        {t >= T.tick0 && <svg width={620} height={860} style={{ position: "absolute", inset: 0, overflow: "visible" }}><path d="M 150 520 L 260 640 L 500 330" fill="none" stroke={PINK} strokeWidth={30} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={600} strokeDashoffset={600 * (1 - easeInOut(seg(t, T.tick0, T.tick1)))} style={{ filter: `drop-shadow(0 0 18px ${PINK})` }} /></svg>}
      </div>
    )}
    {/* la touche humaine : Inès valide (lumière plus chaude) */}
    {t >= T.check && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 70%, rgba(255,180,150,${0.18 * warm}), rgba(0,0,0,0) 60%)` }} />}
    {t >= T.check && <Persona look={INES} x={lerp(-200, 160, easeOutExpo(seg(t, T.check, T.check + 0.7)))} y={1380} scale={0.65} mood="happy" pose="stand" t={t} />}
    {t >= T.ai && <Chip t={t} t0={T.ai} y={360} label="Relue & humanisée" sub="par l'IA" />}
    {t >= T.you && <Chip t={t} t0={T.you} y={1560} label="Validée par toi" sub="la touche humaine" warm />}
  </>;
};
const Chip: React.FC<{ t: number; t0: number; y: number; label: string; sub: string; warm?: boolean }> = ({ t, t0, y, label, sub, warm }) => {
  const k = Pop(t, t0, 0.4), out = seg(t, T.end - 0.25, T.end);
  return <div style={{ position: "absolute", left: warm ? 340 : 160, top: y, width: warm ? 700 : 760, padding: "22px 0", borderRadius: 50, textAlign: "center", background: warm ? "rgba(255,190,160,0.16)" : "rgba(185,163,255,0.14)", border: `3px solid ${warm ? "#ffc4a8" : LILAC}`, boxShadow: `0 0 40px ${warm ? "rgba(255,180,150,0.5)" : "rgba(185,163,255,0.5)"}`, transform: `scale(${lerp(1.4, 1, k)})`, opacity: k * (1 - out) }}>
    <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 52, color: WHITE }}>✓ {label}</div>
    <div style={{ fontFamily: warm ? "Liberation Serif, Georgia, serif" : "Poppins", fontStyle: warm ? "italic" : "normal", fontSize: 34, color: warm ? "#ffd6c2" : "#d9ceff" }}>{sub}</div>
  </div>;
};
const End: React.FC<{ t: number }> = ({ t }) => {
  const pulse = 1 + 0.05 * Math.max(0, Math.sin((t - T.end - 1.4) * Math.PI * 2));
  return <>
    <Chroma t={t} amt={clamp(1 - (t - T.end) / 0.4)} style={{ left: 540 - 260, top: 380, width: 520, opacity: Pop(t, T.end) }}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 520, display: "block" }} /></Chroma>
    <Flare x={540} y={440} a={1 - seg(t, T.end, T.end + 0.9)} w={1100} />
    <div style={{ position: "absolute", top: 700, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 92, lineHeight: 1.1, color: WHITE, opacity: Pop(t, T.end + 0.4), transform: `translateY(${(1 - Pop(t, T.end + 0.4)) * 40}px)`, textShadow: "0 0 30px rgba(217,130,139,0.5)" }}>Ta première lettre<br /><span style={{ color: PINK }}>est offerte.</span></div>
    <div style={{ position: "absolute", left: 540 - 340, top: 1010, width: 680, height: 140, borderRadius: 70, background: `linear-gradient(90deg, ${PINK}, ${PINK_L}, ${PINK})`, backgroundSize: "200% 100%", backgroundPosition: `${(t * 120) % 200}% 0`, border: `3px solid ${PINK_L}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 56, color: "#2e1f22", boxShadow: `0 0 ${40 + 600 * (pulse - 1)}px ${PINK}, 0 0 ${100 + 900 * (pulse - 1)}px rgba(217,130,139,0.6)`, transform: `scale(${t > T.end + 1.4 ? pulse : lerp(0.7, 1, Pop(t, T.end + 0.9))})`, opacity: Pop(t, T.end + 0.9) }}>Générer ma lettre</div>
    <div style={{ position: "absolute", top: 1220, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "#cfc6c9", opacity: Pop(t, T.end + 1.3) }}>Lien en bio</div>
    <div style={{ position: "absolute", top: 1660, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 32, color: "#d9ceff", letterSpacing: 2, opacity: Pop(t, T.end + 1.7) }}>IA de dernière génération <span style={{ color: PINK_L }}>×</span> <span style={{ fontFamily: "Liberation Serif, Georgia, serif", fontStyle: "italic", color: "#ffd6c2" }}>touche humaine</span></div>
  </>;
};

export const IAHumain: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  // caméra : petite dérive permanente + « punch » à chaque coupe (zoom + flou de mouvement)
  const cut = CUTS.reduce((m, tc) => Math.max(m, clamp(1 - Math.abs(t - tc) / 0.18)), 0);
  const drift = `translate(${Math.sin(t * 0.7) * 8}px, ${Math.cos(t * 0.5) * 10}px) scale(${1 + 0.06 * cut + 0.01 * Math.sin(t * 0.9)}) rotate(${Math.sin(t * 0.4) * 0.3}deg)`;
  const shake = t >= T.press && t < T.press + 0.3 ? Math.sin(t * 160) * 18 * (1 - (t - T.press) / 0.3) : 0;
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `${drift} translate(${shake}px, ${shake * 0.6}px)`, filter: cut > 0.05 ? `blur(${cut * 6}px) saturate(${1 + cut})` : "none" }}>
        {t < T.human && <Boot t={t} />}
        {t >= T.human && t < T.cv && <Human t={t} />}
        {t >= T.cv && t < T.offer && <StepCV t={t} />}
        {t >= T.offer && t < T.gen && <StepOffer t={t} />}
        {t >= T.gen && t < T.end && <StepGen t={t} />}
        {t >= T.end && <End t={t} />}
        <Pills t={t} />
      </div>
      <FX t={t} />
      <Audio src={staticFile("audio/ia-humain.wav")} />
    </AbsoluteFill>
  );
};
