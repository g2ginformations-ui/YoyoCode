// « MyMotiv expliqué par sa mascotte » — voix off réelle (nettoyée), 9:16, rendu 2K (×4/3), 60 i/s, ~41,5 s.
// La mascotte (public/mascotte) réagit à ce qui est dit (8 expressions) et bouge au rythme de la voix ;
// sous-titres karaoké mot à mot ; chaque phrase est illustrée pile au moment où elle est dite (Pourquoi → Comment → Résultat).
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { BG, PINK, PINK_L, WHITE, W, H, clamp, lerp, seg, easeOut, easeIn, easeInOut, rng } from "./common";
import { CoLogo } from "./Duel";
import VOIX from "./data/voix-mascotte.json";

const LILAC = "#b9a3ff";
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const Pop = (t: number, t0: number, d = 0.3) => easeOutExpo(seg(t, t0, t0 + d));
const Out = (t: number, t1: number, d = 0.25) => 1 - easeIn(seg(t, t1 - d, t1));
// instants clés (secondes, voix nettoyée)
const K = { dizaines: 1.06, repond: 2.96, normal: 3.42, copie: 4.58, recruteur: 5.42, reconnait: 6.14, deux: 6.7, veut: 7.48, sentir: 8.44, son: 9.34, how: 10.0, mymotiv: 10.22, ajoutes: 11.2, cv: 12.02, fois: 12.5, step2: 13.3, colles: 13.48, lit: 15.38, site: 16.2, meme: 17.24, logo: 17.64, step3: 18.1, longueur: 18.76, consigne: 19.88, dispo: 20.64, generer: 22.24, trentaine: 23.34, ia: 24.36, relit: 26.08, humanise: 26.8, mots: 28.0, what: 28.9, resultat: 29.04, mesure: 30.44, logo3: 31.56, modifier: 33.14, clic: 33.8, pdf0: 34.28, pdf: 35.26, adapter: 36.32, cv2: 37.62, end: 38.4, total: 41.5 };
const CUTS = [K.normal, K.veut, K.how, K.step2, K.step3, K.trentaine - 0.4, K.what, K.pdf0, K.end];

// ───────── mascotte : expression selon la phrase, « pop » à chaque changement, bouge avec la voix ─────────
const MOODS: [number, string][] = [[0, "stress"], [3.4, "reflexion"], [4.58, "colere"], [6.14, "choc"], [7.48, "sourire"], [10.06, "surprise"], [11.1, "sourire"], [13.3, "reflexion"], [17.24, "choc"], [18.1, "sourire"], [22.24, "surprise"], [22.94, "reflexion"], [26.08, "sourire"], [29.04, "rire"], [31.0, "sourire"], [34.28, "surprise"], [36.16, "rire"]];
const moodAt = (t: number) => { let m = MOODS[0]; for (const x of MOODS) if (t >= x[0]) m = x; return m; };
const envAt = (t: number) => { const e = VOIX.env as number[]; const i = Math.floor(t * 60); return i >= 0 && i < e.length ? e[i] : 0; };
const Mascot: React.FC<{ t: number }> = ({ t }) => {
  if (t >= K.end + 0.3) return null;
  const [t0, mood] = moodAt(t), since = t - t0, pop = since < 0.35 ? 1 + 0.08 * Math.sin((since / 0.35) * Math.PI) * (1 - since / 0.35) * 2 : 1;
  const talk = (envAt(t) + envAt(t - 0.03)) / 2, bob = talk * 16, tilt = Math.sin(t * 2.1) * 1.5 + talk * 2 * Math.sin(t * 13);
  const enter = Pop(t, 0, 0.6), leave = easeIn(seg(t, K.end - 0.05, K.end + 0.3));
  const w = 520;
  return (
    <div style={{ position: "absolute", left: 540 - w / 2, top: 1920 - 760 * (w / 530) + 30 + bob + (1 - enter) * 500 + leave * 700, width: w, transform: `rotate(${tilt}deg) scale(${pop})`, transformOrigin: "50% 100%" }}>
      {/* halo derrière la mascotte */}
      <div style={{ position: "absolute", left: -120, top: -80, width: w + 240, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,130,139,0.35), rgba(217,130,139,0) 65%)", opacity: 0.6 + talk * 0.6 }} />
      <Img src={staticFile(`mascotte/${mood}.png`)} style={{ position: "relative", width: w, display: "block", filter: "drop-shadow(0 0 22px rgba(217,130,139,0.45))" }} />
      {/* éclat à chaque changement d'expression */}
      {since < 0.3 && t > 0.3 && <div style={{ position: "absolute", left: w / 2 - 260 * (since / 0.3) - 40, top: 200 - 260 * (since / 0.3) - 40, width: 80 + 520 * (since / 0.3), height: 80 + 520 * (since / 0.3), borderRadius: "50%", border: `5px solid rgba(242,184,192,${1 - since / 0.3})` }} />}
    </div>
  );
};

// ───────── sous-titres karaoké ─────────
type Wd = { w: string; t0: number; t1: number };
const WORDS = VOIX.words as Wd[];
const CHUNKS: Wd[][] = (() => { const out: Wd[][] = []; let cur: Wd[] = [];
  WORDS.forEach((w, i) => { cur.push(w); const nxt = WORDS[i + 1], end = /[.,?!]$/.test(w.w) || cur.length >= 4 || (nxt && nxt.t0 - w.t1 > 0.3); if (end || !nxt) { out.push(cur); cur = []; } });
  return out; })();
const Captions: React.FC<{ t: number }> = ({ t }) => {
  if (t >= K.end - 0.05) return null;
  const ci = CHUNKS.findIndex((c, i) => t >= c[0].t0 - 0.05 && (i === CHUNKS.length - 1 || t < CHUNKS[i + 1][0].t0 - 0.05));
  if (ci < 0) return null;
  const ch = CHUNKS[ci], a = Pop(t, ch[0].t0 - 0.05, 0.18);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 1080, display: "flex", justifyContent: "center", flexWrap: "wrap", columnGap: 26, rowGap: 0, transform: `translateY(${(1 - a) * 24}px) scale(${lerp(0.94, 1, a)})`, opacity: a }}>
      {ch.map((w, i) => { const on = t >= w.t0 - 0.03, cur = on && (i === ch.length - 1 || t < ch[i + 1].t0 - 0.03); return (
        <span key={i} style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 70, lineHeight: 1.15, color: cur ? PINK : on ? WHITE : "rgba(255,255,255,0.4)", textShadow: cur ? `0 0 26px rgba(217,130,139,0.9), 0 4px 0 #3a1d23` : "0 4px 0 rgba(0,0,0,0.6), 0 0 18px rgba(0,0,0,0.7)", transform: `scale(${cur ? 1.06 : 1})`, transformOrigin: "50% 60%", display: "inline-block", padding: "0 4px" }}>{w.w.replace(/[,.]$/, "")}</span>); })}
    </div>
  );
};

// ───────── couche d'effets : halos, particules, glitch des coupes, grain, vignette ─────────
const grainTiles: HTMLCanvasElement[] = [];
function grain() { if (grainTiles.length || typeof document === "undefined") return; for (let k = 0; k < 4; k++) { const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d")!, im = g.createImageData(256, 256), r = rng(k * 7 + 3); for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 12; } g.putImageData(im, 0, 0); grainTiles.push(c); } }
const DUST = (() => { const r = rng(4); return Array.from({ length: 70 }, () => ({ x: r() * W, y: r() * H, s: 1 + r() * 3, v: 10 + r() * 30, p: r() * 6 })); })();
function paintFX(c: CanvasRenderingContext2D, t: number) {
  c.clearRect(0, 0, W, H);
  c.save(); c.globalCompositeOperation = "lighter";
  const why = t < K.how ? 1 : 0, warm = seg(t, K.humanise, K.humanise + 0.5);
  for (const [x0, y0, r0, col, sp] of [[220, 500, 750, why ? "150,150,170" : "217,130,139", 0.35], [880, 1300, 800, "185,163,255", 0.27], [540, 760, 520, warm ? "255,180,150" : "242,184,192", 0.5]] as [number, number, number, string, number][]) {
    const x = x0 + Math.sin(t * sp) * 150, y = y0 + Math.cos(t * sp * 1.2) * 180, g = c.createRadialGradient(x, y, 0, x, y, r0);
    g.addColorStop(0, `rgba(${col},${0.12 + 0.04 * Math.sin(t * 2)})`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  for (const d of DUST) { const y = (d.y - t * d.v) % H, yy = y < 0 ? y + H : y; c.fillStyle = `rgba(242,184,192,${0.25 + 0.25 * Math.sin(t * 2 + d.p)})`; c.beginPath(); c.arc(d.x + Math.sin(t + d.p) * 20, yy, d.s, 0, Math.PI * 2); c.fill(); }
  c.restore();
  for (const tc of CUTS) { const k = (t - tc + 0.08) / 0.24; if (k < 0 || k > 1) continue; const r = rng(Math.floor(t * 60)), a = Math.sin(k * Math.PI);
    c.save(); for (let i = 0; i < 10; i++) { const y = r() * H, h = 6 + r() * 50; c.fillStyle = i % 3 ? `rgba(242,184,192,${0.28 * a})` : `rgba(185,163,255,${0.25 * a})`; c.fillRect((r() - 0.5) * 240 * a, y, W, h); } c.restore(); }
  c.save(); c.fillStyle = "rgba(0,0,0,0.08)"; for (let y = (t * 90) % 5; y < H; y += 5) c.fillRect(0, y, W, 1.5); c.restore();
  grain(); if (grainTiles.length) { const tile = grainTiles[Math.floor(t * 60) % grainTiles.length], o = (Math.floor(t * 60) * 53) % 256; for (let x = -o; x < W; x += 256) for (let y = -o; y < H; y += 256) c.drawImage(tile, x, y); }
  const v = c.createRadialGradient(540, 900, 650, 540, 900, 1300); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.55)"); c.fillStyle = v; c.fillRect(0, 0, W, H);
}
const FX: React.FC<{ t: number }> = ({ t }) => { const ref = useRef<HTMLCanvasElement>(null); useLayoutEffect(() => paintFX(ref.current!.getContext("2d")!, t), [t]); return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />; };

// ───────── éléments réutilisés ─────────
const Glass: React.FC<{ style: React.CSSProperties; children?: React.ReactNode; glow?: boolean }> = ({ style, children, glow }) => (
  <div style={{ position: "absolute", borderRadius: 30, background: "linear-gradient(160deg, rgba(48,36,46,0.88), rgba(20,16,22,0.92))", border: `2px solid ${glow ? PINK : "rgba(242,184,192,0.35)"}`, boxShadow: glow ? `0 0 50px rgba(217,130,139,0.5)` : "0 20px 50px rgba(0,0,0,0.5)", fontFamily: "Poppins", color: WHITE, overflow: "hidden", ...style }}>{children}</div>
);
const Shock: React.FC<{ t: number; tc: number; x: number; y: number; size?: number }> = ({ t, tc, x, y, size = 700 }) => { const k = (t - tc) / 0.6; if (k < 0 || k > 1) return null; const R = size * easeOut(k); return <div style={{ position: "absolute", left: x - R, top: y - R, width: 2 * R, height: 2 * R, borderRadius: "50%", border: `${10 * (1 - k) + 2}px solid rgba(242,184,192,${1 - k})`, boxShadow: `0 0 50px rgba(217,130,139,${1 - k})` }} />; };
const Flare: React.FC<{ t: number; tc: number; x: number; y: number }> = ({ t, tc, x, y }) => { const a = t >= tc ? 1 - seg(t, tc, tc + 0.8) : 0; return a <= 0 ? null : <><div style={{ position: "absolute", left: x - 500, top: y - 5, width: 1000, height: 10, background: "linear-gradient(90deg, rgba(242,184,192,0), rgba(255,240,244,0.95), rgba(242,184,192,0))", opacity: a }} /><div style={{ position: "absolute", left: x - 100, top: y - 100, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.95), rgba(242,184,192,0.35) 45%, rgba(242,184,192,0) 70%)", opacity: a }} /></>; };
const Check: React.FC<{ t: number; t0: number; label: string; style: React.CSSProperties; warm?: boolean }> = ({ t, t0, label, style, warm }) => { const k = Pop(t, t0, 0.35); return t < t0 ? null : <div style={{ position: "absolute", padding: "14px 30px", borderRadius: 40, background: warm ? "rgba(255,190,160,0.16)" : "rgba(127,214,164,0.14)", border: `3px solid ${warm ? "#ffc4a8" : "#7fd6a4"}`, color: WHITE, fontFamily: "Poppins", fontWeight: 700, fontSize: 40, transform: `scale(${lerp(1.5, 1, k)})`, opacity: k, whiteSpace: "nowrap", boxShadow: `0 0 30px ${warm ? "rgba(255,180,150,0.45)" : "rgba(127,214,164,0.35)"}`, ...style }}>✓ {label}</div>; };
const LetterDoc: React.FC<{ progress: number; logo: number; style: React.CSSProperties; hl?: number; alt?: number }> = ({ progress, logo, style, hl = 0, alt = 0 }) => {
  const L = [92, 84, 90, 70, 0, 88, 80, 92, 62, 0, 86, 74], n = Math.floor(L.length * progress);
  return (
    <div style={{ position: "absolute", width: 520, height: 720, borderRadius: 20, background: "#fffdfd", padding: 40, boxSizing: "border-box", boxShadow: "0 0 70px rgba(217,130,139,0.45)", ...style }}>
      <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 34, color: "#2a2326" }}>Camille Dubois</div>
      <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 18, color: PINK, marginTop: 40 }}>Alternance · Chargé(e) de marketing</div>
      {L.map((w2, i) => i < n && w2 > 0 && <div key={i} style={{ height: 13, borderRadius: 7, marginTop: i ? 18 : 30, width: `${(alt > 0 && i % 3 === 0 ? w2 - 18 * alt : w2)}%`, background: hl > 0 && i % 4 === 1 ? `rgba(217,130,139,${0.25 + 0.35 * hl})` : "#e3dbdd" }} />)}
      {progress > 0 && progress < 1 && <div style={{ position: "absolute", left: 24, right: 24, top: 150 + n * 31, height: 5, background: "#fff", boxShadow: `0 0 26px 8px ${PINK}` }} />}
      {logo > 0 && <div style={{ position: "absolute", right: 30, top: 30, transform: `scale(${lerp(2.4, 1, logo)})`, opacity: logo }}><CoLogo k="lumen" size={96} /></div>}
    </div>
  );
};
const Pills: React.FC<{ t: number }> = ({ t }) => {
  if (t < K.how + 0.7 || t >= K.what) return null;
  const step = t < K.step2 ? 0 : t < K.step3 ? 1 : 2, a = Pop(t, K.how + 0.7) * Out(t, K.what);
  return (
    <div style={{ position: "absolute", top: 120, left: 0, width: W, display: "flex", justifyContent: "center", gap: 20, opacity: a }}>
      {["Ton CV", "L'offre", "Générer"].map((n, i) => (
        <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderRadius: 40, border: `3px solid ${i <= step ? PINK : "#3a333c"}`, background: i === step ? "rgba(217,130,139,0.22)" : "rgba(20,16,22,0.6)", boxShadow: i === step ? `0 0 ${26 + 14 * Math.sin(t * 8)}px rgba(217,130,139,0.7)` : "none", fontFamily: "Poppins", fontWeight: 700, fontSize: 32, color: i <= step ? WHITE : "#6f6a72", transform: `scale(${i === step ? 1.06 : 1})` }}>
          <span style={{ width: 46, height: 46, borderRadius: "50%", background: i <= step ? PINK : "#2a252c", color: "#2e1f22", display: "flex", alignItems: "center", justifyContent: "center" }}>{i < step ? "✓" : i + 1}</span>{n}
        </div>))}
    </div>
  );
};

// ───────── scènes (zone de jeu : y ≈ 250 → 1040) ─────────
const Why: React.FC<{ t: number }> = ({ t }) => (
  <>
    {/* des dizaines de candidatures qui partent… */}
    {t < K.normal && Array.from({ length: 26 }, (_, i) => { const t0 = 0.15 + i * 0.1, k = seg(t, t0, t0 + 0.9); if (k <= 0 || k >= 1) return null; const r = rng(i * 7 + 1)(); return <div key={i} style={{ position: "absolute", left: 120 + r * 700 + easeIn(k) * 300, top: 900 - easeOut(k) * 700, width: 120, height: 80, borderRadius: 10, background: "#c9c9d2", opacity: 1 - k, transform: `rotate(${(r - 0.5) * 40 + k * 30}deg)`, boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }}><div style={{ position: "absolute", inset: 0, clipPath: "polygon(0 0, 50% 55%, 100% 0)", background: "#a9a9b4" }} /></div>; })}
    {/* … et 0 réponse */}
    {t >= K.repond - 0.2 && t < K.normal + 0.1 && (
      <Glass style={{ left: 140, top: 380, width: 800, height: 420, opacity: Pop(t, K.repond - 0.2) * Out(t, K.normal + 0.1, 0.15), transform: `scale(${lerp(1.2, 1, Pop(t, K.repond - 0.2))})` }}>
        <div style={{ padding: "30px 40px", fontSize: 38, fontWeight: 700 }}>Boîte de réception</div>
        <div style={{ textAlign: "center", marginTop: 50, fontSize: 120, fontWeight: 700, color: "#ff8a8d", textShadow: "0 0 30px rgba(255,107,107,0.6)" }}>0</div>
        <div style={{ textAlign: "center", fontSize: 40, color: "#cfc6c9" }}>réponse</div>
      </Glass>
    )}
    {/* la lettre copiée-collée, clonée à l'infini */}
    {t >= K.normal && t < K.veut && Array.from({ length: 6 }, (_, i) => { const t0 = K.copie + i * 0.1, k = Pop(t, t0, 0.3); return (t >= K.normal + 0.3) && <div key={i} style={{ position: "absolute", left: 240 + i * 34 - (t < K.copie ? 0 : 0), top: 320 + i * 34, width: 520, height: 620, borderRadius: 16, background: "#d9d9de", padding: 34, boxSizing: "border-box", opacity: i === 0 ? Pop(t, K.normal + 0.3) : k, transform: `rotate(${(i - 2.5) * 1.2}deg)`, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", fontFamily: "Liberation Serif, Georgia, serif", fontSize: 28, color: "#5d5d66", lineHeight: 1.4, filter: `grayscale(1) brightness(${1 - i * 0.04})` }}>Madame, Monsieur,<br />Je me permets de vous adresser ma candidature…</div>; })}
    {t >= K.copie && t < K.reconnait && <div style={{ position: "absolute", left: 700, top: 300, padding: "12px 26px", borderRadius: 16, background: "#2b2b31", fontFamily: "Poppins", fontWeight: 700, fontSize: 38, color: WHITE, transform: `scale(${Math.floor((t - K.copie) / 0.15) % 2 ? 1.08 : 1})` }}>{Math.floor((t - K.copie) / 0.3) % 2 ? "Ctrl + V" : "Ctrl + C"}</div>}
    {/* le recruteur la reconnaît… en 2 secondes */}
    {t >= K.reconnait && t < K.veut && <div style={{ position: "absolute", left: 300, top: 560, padding: "16px 40px", border: "10px solid #ff6b6b", borderRadius: 22, color: "#ff6b6b", fontFamily: "Poppins", fontWeight: 700, fontSize: 70, transform: `rotate(-12deg) scale(${lerp(2.2, 1, easeIn(seg(t, K.reconnait, K.reconnait + 0.15)))})`, opacity: seg(t, K.reconnait, K.reconnait + 0.08) * Out(t, K.veut, 0.15), background: "rgba(20,10,12,0.6)" }}>COPIÉ-COLLÉ</div>}
    {t >= K.deux && t < K.veut && (() => { const k = seg(t, K.deux, K.deux + 0.75); return <svg width={220} height={220} viewBox="-110 -110 220 220" style={{ position: "absolute", left: 760, top: 760, opacity: Out(t, K.veut, 0.15) }}><circle r={90} fill="rgba(20,16,22,0.9)" stroke="#45404c" strokeWidth={12} /><circle r={90} fill="none" stroke="#ff8a8d" strokeWidth={12} strokeDasharray={565} strokeDashoffset={565 * k} transform="rotate(-90)" strokeLinecap="round" /><text y={22} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={70} fill={WHITE}>{Math.max(0, 2 - Math.floor(k * 2))}s</text></svg>; })()}
    {/* ce qu'il veut : sentir que tu as lu SON offre */}
    {t >= K.veut && t < K.how + 0.1 && (
      <Glass glow style={{ left: 110, top: 330, width: 860, height: 560, opacity: Pop(t, K.veut) * Out(t, K.how + 0.1, 0.15), transform: `scale(${lerp(0.9, 1, Pop(t, K.veut))})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: 36 }}><CoLogo k="lumen" size={96} /><div><div style={{ fontWeight: 700, fontSize: 40 }}>Chargé(e) de marketing</div><div style={{ fontFamily: "Open Sans", fontSize: 30, color: "#cfc6c9" }}>Maison Lumen · Alternance</div></div></div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: "10px 36px" }}>{["réseaux sociaux", "retail", "Lyon", "contenu", "équipe"].map((k2, i) => { const on = t >= K.sentir + i * 0.22; return <span key={k2} style={{ padding: "12px 24px", borderRadius: 30, fontWeight: 700, fontSize: 34, border: `3px solid ${on ? PINK : "#45404c"}`, background: on ? "rgba(217,130,139,0.25)" : "transparent", boxShadow: on ? `0 0 26px rgba(217,130,139,0.7)` : "none", color: on ? WHITE : "#8d8890" }}>{k2}</span>; })}</div>
        {/* loupe */}
        <div style={{ position: "absolute", left: lerp(80, 560, easeInOut(seg(t, K.sentir, K.son + 0.4))), top: 250, width: 170, height: 170, borderRadius: "50%", border: `8px solid ${PINK_L}`, background: "rgba(242,184,192,0.12)", boxShadow: `0 0 30px ${PINK}` }}><div style={{ position: "absolute", right: -60, bottom: -40, width: 90, height: 22, borderRadius: 11, background: PINK_L, transform: "rotate(40deg)" }} /></div>
      </Glass>
    )}
  </>
);
const HowCV: React.FC<{ t: number }> = ({ t }) => {
  const logo = Pop(t, K.mymotiv, 0.4), logoUp = easeInOut(seg(t, K.mymotiv + 0.7, K.ajoutes));
  return <>
    <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: 540 - lerp(380, 0, logoUp), top: lerp(520, -200, logoUp), width: lerp(760, 0, logoUp), opacity: logo * (1 - logoUp), filter: `drop-shadow(0 0 40px ${PINK})` }} />
    <Flare t={t} tc={K.mymotiv} x={540} y={600} />
    {t >= K.ajoutes - 0.2 && (
      <Glass style={{ left: 140, top: 300, width: 800, height: 640, opacity: Pop(t, K.ajoutes - 0.2) * Out(t, K.step2 + 0.05, 0.2), transform: `perspective(1200px) rotateX(${lerp(55, 0, Pop(t, K.ajoutes - 0.2, 0.5))}deg)` }}>
        <div style={{ padding: "34px 40px", fontWeight: 600, fontSize: 40, color: PINK_L }}>Votre CV</div>
        <div style={{ margin: "0 40px", height: 260, borderRadius: 24, border: `4px dashed ${t >= K.cv ? PINK : "#4a434c"}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 24, fontSize: 42, fontWeight: 700, color: t >= K.cv ? WHITE : "#8d8890", background: t >= K.cv ? "rgba(217,130,139,0.12)" : "transparent" }}>
          {t >= K.cv ? <><span style={{ width: 70, height: 90, borderRadius: 10, background: PINK, display: "inline-block", boxShadow: `0 0 30px ${PINK}` }} />CV.pdf</> : "Ajouter un CV"}
        </div>
        {t >= K.cv - 0.5 && t < K.cv && <div style={{ position: "absolute", left: 360, top: lerp(-300, 220, easeIn(seg(t, K.cv - 0.5, K.cv))), width: 90, height: 116, borderRadius: 12, background: PINK, boxShadow: `0 0 40px ${PINK}` }} />}
        <Check t={t} t0={K.fois} label="Une seule fois" style={{ left: 220, top: 450 }} />
      </Glass>
    )}
    <Shock t={t} tc={K.cv} x={540} y={630} size={500} />
  </>;
};
const HowOffer: React.FC<{ t: number }> = ({ t }) => {
  const sl = seg(t, K.colles, K.colles + 0.35), scan = seg(t, 14.64, K.lit + 0.3), site = Pop(t, K.site - 0.3, 0.4), logo = Pop(t, K.logo, 0.45);
  return <>
    <Glass glow={t >= K.colles} style={{ left: 90, top: 280, width: 900, height: 120, borderRadius: 60, opacity: Pop(t, K.step2), display: "flex", alignItems: "center", padding: "0 40px", boxSizing: "border-box" }}>
      <span style={{ fontFamily: "Open Sans", fontWeight: 600, fontSize: 36, transform: `translateX(${lerp(900, 0, easeOutExpo(sl))}px)`, color: t >= K.colles ? WHITE : "#6f6a72", whiteSpace: "nowrap" }}>{t >= K.colles ? "carrieres.maison-lumen.fr/offre" : "Colle le lien de l'offre"}</span>
      {scan > 0 && scan < 1 && <div style={{ position: "absolute", top: 0, bottom: 0, left: `${scan * 100}%`, width: 8, background: "#fff", boxShadow: `0 0 30px 10px ${PINK}` }} />}
    </Glass>
    {t >= K.lit && <Check t={t} t0={K.lit} label="Offre lue" style={{ left: 380, top: 440 }} />}
    {/* le site trouvé, puis le logo arraché */}
    {t >= K.site - 0.3 && (
      <div style={{ position: "absolute", left: 160, top: 560, width: 760, height: 420, borderRadius: 26, background: "#f7f3f1", opacity: site, transform: `scale(${lerp(0.7, 1, site)})`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", overflow: "hidden" }}>
        <div style={{ height: 70, background: "#e6dfdc", display: "flex", alignItems: "center", padding: "0 26px" }}><div style={{ flex: 1, height: 42, borderRadius: 21, background: "#fff", display: "flex", alignItems: "center", padding: "0 22px", fontFamily: "Open Sans", fontWeight: 600, fontSize: 28, color: "#6b6064" }}>maison-lumen.fr</div></div>
        <div style={{ display: "flex", alignItems: "center", gap: 26, padding: 34 }}>
          <div style={{ width: 110, height: 110, borderRadius: 22, border: t >= K.logo ? `4px dashed ${PINK}` : "none" }}>{t < K.logo && <CoLogo k="lumen" size={110} />}</div>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 44, color: "#2a2326" }}>Maison Lumen</div>
        </div>
        {[0.9, 0.7, 0.85].map((w2, i) => <div key={i} style={{ height: 16, width: `${w2 * 88}%`, marginLeft: 34, marginTop: 18, borderRadius: 8, background: "#ddd4d1" }} />)}
      </div>
    )}
    {/* le logo jaillit et grossit (« et même son logo ») */}
    {t >= K.logo && <div style={{ position: "absolute", left: lerp(215, 540, logo) - lerp(55, 150, logo), top: lerp(680, 760, logo) - lerp(55, 150, logo), transform: `rotate(${(1 - logo) * -25}deg)`, filter: `drop-shadow(0 0 ${30 + 30 * (1 - logo)}px ${PINK})` }}><CoLogo k="lumen" size={lerp(110, 300, logo)} /></div>}
    <Flare t={t} tc={K.logo + 0.2} x={540} y={760} />
    <Shock t={t} tc={K.logo} x={540} y={760} />
  </>;
};
const HowGen: React.FC<{ t: number }> = ({ t }) => {
  const press = t >= K.generer && t < K.generer + 0.14;
  return <>
    <Glass style={{ left: 110, top: 270, width: 860, height: 560, opacity: Pop(t, K.step3) * (1 - seg(t, K.generer + 0.1, K.generer + 0.4)) }}>
      <div style={{ padding: "30px 40px 0", fontWeight: 600, fontSize: 32, color: "#cfc6c9" }}>Longueur</div>
      <div style={{ display: "flex", margin: "14px 40px 0", borderRadius: 20, border: "2px solid #4a434c", overflow: "hidden" }}>{["Courte", "Standard", "Longue"].map((l, i) => { const on = i === 1 && t >= K.longueur; return <div key={l} style={{ flex: 1, textAlign: "center", padding: "20px 0", fontWeight: 700, fontSize: 34, background: on ? PINK : "transparent", color: on ? "#2e1f22" : "#cfc6c9", boxShadow: on ? `0 0 30px ${PINK}` : "none" }}>{l}</div>; })}</div>
      <div style={{ padding: "26px 40px 0", fontWeight: 600, fontSize: 32, color: "#cfc6c9" }}>Consigne</div>
      <div style={{ margin: "12px 40px 0", height: 80, borderRadius: 18, border: `2px solid ${t >= K.consigne ? PINK : "#4a434c"}`, display: "flex", alignItems: "center", padding: "0 24px", fontFamily: "Open Sans", fontSize: 32, color: WHITE }}>{"Mettre en avant mon expérience".slice(0, Math.floor(30 * seg(t, K.consigne - 0.2, K.consigne + 0.4)))}</div>
      <div style={{ padding: "26px 40px 0", fontWeight: 600, fontSize: 32, color: "#cfc6c9" }}>Disponibilité</div>
      <div style={{ margin: "12px 40px 0", width: 300, height: 80, borderRadius: 18, border: `2px solid ${t >= K.dispo ? PINK : "#4a434c"}`, display: "flex", alignItems: "center", padding: "0 24px", fontFamily: "Open Sans", fontSize: 32, color: WHITE }}>{t >= K.dispo ? "Immédiate" : ""}</div>
    </Glass>
    {/* le bouton */}
    {t >= K.step3 + 0.3 && t < K.generer + 0.5 && <div style={{ position: "absolute", left: 540 - 300, top: 870, width: 600, height: 140, borderRadius: 70, background: `linear-gradient(90deg, ${PINK}, ${PINK_L}, ${PINK})`, backgroundSize: "200% 100%", backgroundPosition: `${(t * 120) % 200}% 0`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 58, color: "#2e1f22", boxShadow: `0 0 ${50 + 30 * Math.sin(t * 9)}px ${PINK}`, transform: `scale(${(press ? 0.9 : 1) * (1 + 0.5 * seg(t, K.generer + 0.12, K.generer + 0.5))})`, opacity: Pop(t, K.step3 + 0.3) * (1 - seg(t, K.generer + 0.2, K.generer + 0.5)) }}>Générer</div>}
    <Shock t={t} tc={K.generer} x={540} y={940} size={1300} />
    {t >= K.generer && t < K.generer + 0.12 && <div style={{ position: "absolute", inset: 0, background: `rgba(255,245,248,${0.55 * (1 - (t - K.generer) / 0.12)})` }} />}
  </>;
};
const Writing: React.FC<{ t: number }> = ({ t }) => {
  const c0 = K.trentaine - 0.4, sec = Math.round(30 * easeOut(seg(t, c0, K.ia))), write = seg(t, K.ia, K.relit - 0.1), kw = seg(t, K.mots - 0.6, K.mots + 0.6), out = Out(t, K.what);
  return <div style={{ opacity: out }}>
    {/* chrono ~30 s */}
    <svg width={260} height={260} viewBox="-130 -130 260 260" style={{ position: "absolute", left: 60, top: 250, opacity: Pop(t, c0) }}><circle r={108} fill="rgba(20,16,22,0.9)" stroke="#45404c" strokeWidth={14} /><circle r={108} fill="none" stroke={PINK} strokeWidth={14} strokeDasharray={679} strokeDashoffset={679 * (1 - sec / 30)} transform="rotate(-90)" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${PINK})` }} /><text y={20} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={70} fill={WHITE}>~{sec}s</text></svg>
    <LetterDoc progress={write} logo={Pop(t, K.relit - 0.3)} hl={kw} style={{ left: 380, top: 250, transform: `scale(${lerp(0.7, 0.92, Pop(t, K.ia - 0.3, 0.5))})`, transformOrigin: "50% 0", opacity: Pop(t, K.ia - 0.3) }} />
    <Check t={t} t0={K.relit} label="Relue" style={{ left: 60, top: 600 }} />
    <Check t={t} t0={K.humanise} label="Humanisée" style={{ left: 60, top: 720 }} warm />
    {/* les mots-clés de l'offre volent dans la lettre */}
    {["réseaux sociaux", "retail", "Lyon", "contenu"].map((k2, i) => { const t0 = K.mots - 0.6 + i * 0.22, k = seg(t, t0, t0 + 0.6); if (k <= 0 || k >= 1) return null; return <span key={k2} style={{ position: "absolute", left: lerp(100 + i * 60, 600, easeInOut(k)), top: lerp(900, 420 + i * 70, easeInOut(k)), padding: "10px 22px", borderRadius: 26, border: `3px solid ${PINK}`, background: "rgba(30,20,28,0.9)", fontFamily: "Poppins", fontWeight: 700, fontSize: 32, color: WHITE, opacity: 1 - k * 0.5, transform: `scale(${1 - k * 0.4})`, boxShadow: `0 0 24px ${PINK}` }}>{k2}</span>; })}
  </div>;
};
const What: React.FC<{ t: number }> = ({ t }) => {
  const hero = Pop(t, K.resultat - 0.1, 0.45), toPdf = easeInOut(seg(t, K.pdf - 0.6, K.pdf)), adapt = Pop(t, K.adapter, 0.5), cvAdapt = seg(t, K.cv2 - 0.3, K.cv2 + 0.3);
  const glowLogo = t >= K.logo3 && t < K.logo3 + 0.8 ? 1 - seg(t, K.logo3, K.logo3 + 0.8) : 0, alt = seg(t, K.clic, K.clic + 0.4);
  return <div style={{ opacity: Out(t, K.end, 0.3) }}>
    <LetterDoc progress={1} logo={1} hl={1} alt={alt} style={{ left: 280, top: 260, transform: `scale(${lerp(1.3, 1, hero) * lerp(1, 0.4, toPdf)}) translate(${lerp(0, -520, toPdf)}px, ${lerp(0, -100, toPdf)}px) rotate(${lerp(0, -6, toPdf)}deg)`, transformOrigin: "50% 0", opacity: hero }} />
    {glowLogo > 0 && <div style={{ position: "absolute", left: 280 + 520 - 30 - 48 - 70, top: 260 + 30 + 48 - 70, width: 140, height: 140, borderRadius: 30, border: `6px solid rgba(242,184,192,${glowLogo})`, boxShadow: `0 0 60px rgba(217,130,139,${glowLogo})`, transform: `scale(${1 + (1 - glowLogo) * 0.6})` }} />}
    <Check t={t} t0={K.mesure} label="Sur-mesure" style={{ left: 100, top: 1000 - 30, opacity: t < K.pdf0 ? 1 : 0 }} />
    {/* modifier en un clic */}
    {t >= K.modifier && t < K.pdf0 && <div style={{ position: "absolute", left: 600, top: 960, display: "flex", gap: 12, opacity: Pop(t, K.modifier) }}>{["Plus court", "Ajuster"].map((b, i) => <div key={b} style={{ padding: "14px 24px", borderRadius: 24, background: i ? PINK : "rgba(30,25,29,0.95)", border: `2px solid ${PINK}`, fontFamily: "Poppins", fontWeight: 700, fontSize: 30, color: i ? "#2e1f22" : WHITE, transform: `scale(${i && t >= K.clic && t < K.clic + 0.12 ? 0.9 : 1})` }}>{b}</div>)}</div>}
    {t >= K.clic && t < K.clic + 0.4 && <Shock t={t} tc={K.clic} x={890} y={995} size={260} />}
    {/* PDF + CV adapté */}
    {t >= K.pdf - 0.3 && <div style={{ position: "absolute", left: 140, top: 380, width: 300, height: 380, borderRadius: 24, background: "#2a2026", border: `3px solid ${PINK}`, boxShadow: `0 0 40px ${PINK}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, opacity: Pop(t, K.pdf - 0.3), transform: `scale(${lerp(0.6, 1, Pop(t, K.pdf - 0.3))})` }}>
      <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 80, color: PINK_L }}>PDF</div>
      <svg width={90} height={90} viewBox="0 0 24 24" style={{ transform: `translateY(${Math.sin(t * 8) * 6}px)` }}><path d="M12 3v12m0 0l-5-5m5 5l5-5M5 20h14" stroke={WHITE} strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>}
    {t >= K.adapter && <div style={{ position: "absolute", left: 520, top: 330, width: 420, height: 560, borderRadius: 18, background: "#f6f2f1", padding: 30, boxSizing: "border-box", opacity: adapt, transform: `scale(${lerp(0.7, 1, adapt)}) rotate(${lerp(8, 2, adapt)}deg)`, boxShadow: cvAdapt > 0 ? `0 0 ${60 * cvAdapt}px ${PINK}` : "0 20px 40px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", gap: 14, alignItems: "center" }}><div style={{ width: 70, height: 70, borderRadius: "50%", background: "#d8cfcc" }} /><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 28, color: "#2a2326" }}>CV</div>{cvAdapt > 0.5 && <div style={{ marginLeft: "auto" }}><CoLogo k="lumen" size={64} /></div>}</div>
      {[88, 70, 80, 62, 90, 74, 66].map((w2, i) => <div key={i} style={{ height: 12, width: `${w2}%`, marginTop: i ? 16 : 30, borderRadius: 6, background: cvAdapt > 0 && i % 3 === 1 ? `rgba(217,130,139,${0.3 + 0.4 * cvAdapt})` : "#ddd5d6" }} />)}
      {cvAdapt >= 1 && <div style={{ position: "absolute", left: 30, bottom: 26, fontFamily: "Poppins", fontWeight: 700, fontSize: 26, color: PINK }}>✓ Adapté à l'offre</div>}
    </div>}
  </div>;
};
const End: React.FC<{ t: number }> = ({ t }) => {
  const pulse = 1 + 0.05 * Math.max(0, Math.sin((t - K.end - 1.4) * Math.PI * 2)), body = Pop(t, K.end + 0.1, 0.6);
  return <>
    <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: 540 - 250, top: 250, width: 500, opacity: Pop(t, K.end), transform: `scale(${lerp(1.3, 1, Pop(t, K.end))})`, filter: `drop-shadow(0 0 30px ${PINK})` }} />
    <Flare t={t} tc={K.end} x={540} y={310} />
    <div style={{ position: "absolute", top: 470, left: 60, width: 600, fontFamily: "Poppins", fontWeight: 700, fontSize: 84, lineHeight: 1.1, color: WHITE, opacity: Pop(t, K.end + 0.3), transform: `translateX(${(1 - Pop(t, K.end + 0.3)) * -60}px)`, textShadow: "0 0 30px rgba(217,130,139,0.5)" }}>Ta première lettre <span style={{ color: PINK }}>est offerte.</span></div>
    <div style={{ position: "absolute", left: 60, top: 920, width: 560, height: 130, borderRadius: 65, background: `linear-gradient(90deg, ${PINK}, ${PINK_L}, ${PINK})`, backgroundSize: "200% 100%", backgroundPosition: `${(t * 120) % 200}% 0`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 48, color: "#2e1f22", boxShadow: `0 0 ${40 + 600 * (pulse - 1)}px ${PINK}`, transform: `scale(${t > K.end + 1.4 ? pulse : lerp(0.7, 1, Pop(t, K.end + 0.7))})`, opacity: Pop(t, K.end + 0.7) }}>Générer ma lettre</div>
    <div style={{ position: "absolute", left: 60, top: 1090, width: 560, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 44, color: "#e9e1e3", opacity: Pop(t, K.end + 1.0) }}>Lien en bio <span style={{ display: "inline-block", transform: `translateY(${Math.abs(Math.sin(t * 6)) * 12}px)`, color: PINK }}>↓</span></div>
    {/* la mascotte en pied */}
    <Img src={staticFile("mascotte/pied.png")} style={{ position: "absolute", left: 640, top: lerp(1950, 560, body), width: 400, filter: `drop-shadow(0 0 30px rgba(217,130,139,0.5))`, transform: `rotate(${Math.sin(t * 2) * 1.5}deg)` }} />
  </>;
};

export const Mascotte: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const cut = CUTS.reduce((m, tc) => Math.max(m, clamp(1 - Math.abs(t - tc) / 0.16)), 0);
  const cam = `translate(${Math.sin(t * 0.6) * 6}px, ${Math.cos(t * 0.45) * 8}px) scale(${1 + 0.05 * cut})`;
  const shake = [K.reconnait, K.generer, K.logo].reduce((s, tc) => s + (t >= tc && t < tc + 0.25 ? Math.sin(t * 150) * 14 * (1 - (t - tc) / 0.25) : 0), 0);
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `${cam} translate(${shake}px, ${shake * 0.5}px)`, filter: cut > 0.05 ? `blur(${cut * 5}px)` : "none" }}>
        {t < K.how + 0.15 && <Why t={t} />}
        {t >= K.how && t < K.step2 + 0.1 && <HowCV t={t} />}
        {t >= K.step2 && t < K.step3 + 0.05 && <HowOffer t={t} />}
        {t >= K.step3 && t < K.trentaine - 0.4 && <HowGen t={t} />}
        {t >= K.trentaine - 0.4 && t < K.what && <Writing t={t} />}
        {t >= K.what && t < K.end && <What t={t} />}
        {t >= K.end && <End t={t} />}
        <Pills t={t} />
      </div>
      <FX t={t} />
      <Mascot t={t} />
      <Captions t={t} />
      <Audio src={staticFile("audio/mascotte.wav")} />
    </AbsoluteFill>
  );
};

// Version 2K native (1440×2560) : toute la scène est agrandie ×4/3 (textes et formes restent nets).
export const Mascotte2K: React.FC = () => (
  <AbsoluteFill style={{ background: BG }}>
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: "scale(1.3333333333)", transformOrigin: "0 0" }}><Mascotte /></div>
  </AbsoluteFill>
);
