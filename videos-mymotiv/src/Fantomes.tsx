// « 80 fantômes » (≈ 35 s, 60 i/s, 9:16) — sur la voix NATURELLE de l'utilisateur (tools/voix-narrateur.py, config
// voix-fantomes.json : voix off pro + bégaiement « C-c-cent », écho fantôme, téléphone, chorus, écho final),
// fond sombre propre, accent rose (skill apple-motion, parties 1 et 2).
// Page internet : clic, zoom, on tape tinyurl.com/try-mymotiv → glitch « C-c-cent candidatures » (100 enveloppes) →
// 20 refus (grisées ✕) → 80 fantômes (s'effacent et s'envolent) → « Le problème, c'est pas toi. C'est ta lettre. »
// (copier-coller en cascade, écran façon vieux téléviseur) → Respire (cercle) → retour à la barre, Entrée, flash,
// MyMotiv, 5 clics → CV / lien / Générer → anneau 30 s* → lettre + logo → 1re lettre offerte → moins cher qu'un café
// → enregistre cette vidéo (signet) → lien en bio → Postule. Respire. → fin.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, bounce, curve, go, press } from "./apple";
import { PINK, PINK_L, clamp, lerp, rng, seg } from "./common";
import { Confetti, Pointer, Ripple } from "./Lien";
import { AppIcon, Bubbles, DARK, Flash, GlossPill, Horizon, Shockwave, Spinner, ease, pulse } from "./motion";
import voix from "./data/fantomes-voix.json";
import "./fonts";

export const FANTOMES_DUR = voix.duration;
const CX = 540;
const BG = "radial-gradient(circle at 50% 42%, #19181B 0%, #0E0D0F 58%, #09090A 100%)";
const LINK = "tinyurl.com/try-mymotiv";
const P = voix.phrases;
// Temps clés (s), d'après les phrases et les mots recalés de la voix
export const F = {
  click: 0.3, type: 0.55, cent: P[0].t0, grid: P[0].t0 + 0.35, refus: P[1].t0, fant: P[2].t0 + 0.6, ghost: voix.effets[0].t0,
  pasToi: P[3].t0, lettre: P[4].t0, meme: P[4].t0 + 1.0, respire: P[5].t0, avec: P[6].t0, flash: P[6].t0 + 0.25, clics: P[6].t1 - 0.65,
  cv: P[7].t0 + 0.4, lien: P[7].t0 + 1.0, generer: P[7].t1 - 0.6, s30: P[8].t0, ecrite: P[8].t0 + 1.25, logo: P[8].t1 - 1.25,
  offerte: P[9].t0, offerteMot: P[9].t0 + 1.2, apres: P[9].t1 - 0.5, cafe: P[10].t0, save: P[11].t0, saveTap: P[11].t0 + 1.4,
  bio: P[12].t0, postule: P[13].t0, respire2: P[13].t0 + 1.05, end: P[13].t1 - 0.2,
};
const WX = 80, WY = 370, WW = 920, WH = 1180, BAR_Y = WY + 84 + 42;

// curseur : [temps du clic, x, y]
const CLICKS: [number, number, number][] = [[F.click, 330, BAR_Y], [F.avec + 0.1, 985, 900], [F.cv, 820, 700], [F.lien, 820, 900], [F.generer, 820, 1100], [F.saveTap, 228, 965]];
const SHOW: [number, number][] = [[0.02, 1.0], [P[5].t1 - 0.1, F.flash + 0.2], [F.cv - 0.6, F.generer + 0.35], [F.saveTap - 0.7, F.saveTap + 0.5]];
function pointer(t: number) {
  let i = CLICKS.findIndex(([ct]) => ct > t); if (i === -1) i = CLICKS.length;
  const prev = i > 0 ? CLICKS[i - 1] : ([0, 1000, 1700] as [number, number, number]), nxt = CLICKS[Math.min(CLICKS.length - 1, i)];
  const mv = ease(t, Math.max(prev[0] + 0.1, nxt[0] - 0.45), nxt[0] - 0.05);
  const [x, y] = i >= CLICKS.length ? [prev[1], prev[2]] : curve(mv, [prev[1], prev[2]], [nxt[1], nxt[2]], [(prev[1] + nxt[1]) / 2 + 140, Math.min(prev[2], nxt[2]) - 90]);
  let pr = 0, hv = 0, o = 0;
  for (const [ct] of CLICKS) { pr = Math.max(pr, pulse(t, ct, 0.08)); hv = Math.max(hv, seg(t, ct - 0.28, ct - 0.1) * (1 - seg(t, ct + 0.15, ct + 0.32))); }
  for (const [a, b] of SHOW) o = Math.max(o, seg(t, a, a + 0.12) * (1 - seg(t, b - 0.12, b)));
  return { x, y, pr, hv, o };
}

// 100 enveloppes : ordre aléatoire fixe des 20 refus
const R = rng(80); const ORDER = Array.from({ length: 100 }, (_, i) => i).sort(() => R() - 0.5);
const REFUS = new Set(ORDER.slice(0, 20));

const Title: React.FC<{ t: number; t0: number; out: number; a: string; b?: string; bt?: number; y?: number; size?: number; grey?: boolean }> = ({ t, t0, out, a, b, bt, y = 170, size = 74, grey }) =>
  t < t0 - 0.05 || t > out + 0.25 ? null : (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontSize: size, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1.5, zIndex: 20 }}>
      <TextDrop t={t} t0={t0} text={a} out={out} />
      {b && <><br /><span style={{ color: grey ? DARK.soft : PINK }}><TextDrop t={t} t0={bt ?? t0 + 0.35} text={b} by="chars" from={[0, 26]} stagger={0.024} dur={0.18} out={out} /></span></>}
    </div>
  );

export const Fantomes: React.FC<{ audio?: string }> = ({ audio = "audio/fantomes.wav" }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const ptr = pointer(t);

  // ═════ navigateur : intro (0 → 1,6 s) et retour sur la barre (Respire → flash) ═════
  const backK = ease(t, P[5].t1 - 0.15, P[5].t1 + 0.25);
  const bOn = t < F.cent + 0.05 || (t > P[5].t1 - 0.2 && t < F.flash + 0.08);
  const zoomIn = t < F.cent ? ease(t, F.click + 0.03, F.click + 0.4) : 1;
  const bOpacity = t < F.cent ? seg(t, 0, 0.15) : backK * (1 - seg(t, F.flash - 0.02, F.flash + 0.06));
  const typed = Math.round(LINK.length * seg(t, F.type, F.type + 0.85));
  const glitch = t > F.cent - 0.05 && t < P[0].t0 + 0.42; // bégaiement « C-c-cent »
  const gk = glitch ? Math.floor(t * 40) % 3 : 0;

  // ═════ grille de 100 enveloppes ═════
  const gridOn = t > F.cent - 0.05 && t < P[3].t0 + 0.2;
  const ghostK = ease(t, F.ghost - 0.05, F.ghost + 0.9);
  const count = Math.round(100 * ease(t, F.grid, F.grid + 0.9));

  // ═════ copier-coller ═════
  const copyOn = t > P[4].t0 - 0.1 && t < P[5].t0 + 0.1;
  const crt = copyOn ? 1 - seg(t, P[5].t0 - 0.25, P[5].t0) : 0;

  // ═════ Respire ═════
  const breath = t > P[5].t0 - 0.2 && t < P[5].t1 + 0.35;
  const br = bounce(t, [[P[5].t0 - 0.15, 0], [P[5].t0 + 0.25, 220]]) * (1 + 0.12 * Math.sin((t - P[5].t0) * 2.4)) * (1 - ease(t, P[5].t1, P[5].t1 + 0.35));

  // ═════ étapes, anneau, lettre ═════
  const STEPS = [{ ic: "📄", l: "Ton CV", t: F.cv }, { ic: "🔗", l: "Le lien de l'offre", t: F.lien }, { ic: "✦", l: "Générer", t: F.generer, pink: true }];
  const stepsOn = t > P[7].t0 - 0.3 && t < P[8].t0 + 0.3;
  const collapse = ease(t, F.generer + 0.2, F.generer + 0.55);
  const ringK = seg(t, P[8].t0 + 0.05, F.ecrite - 0.1);
  const lw = bounce(t, [[F.ecrite - 0.1, 420], [F.ecrite + 0.3, 680]]), lh = bounce(t, [[F.ecrite - 0.1, 420], [F.ecrite + 0.3, 880]]), lr = bounce(t, [[F.ecrite - 0.1, 210], [F.ecrite + 0.3, 40]]);
  const letterOut = ease(t, F.offerte - 0.15, F.offerte + 0.2);
  const lk = ease(t, F.logo - 0.45, F.logo);
  const [lx, ly] = curve(lk, [1200, 180], [CX - 340 + 30 + 52, 960 - 440 + 30 + 52], [980, 260]);
  const flashK = pulse(t, F.flash) * 1.15 + (glitch ? 0.18 : 0) + pulse(t, F.end, 0.14) * 0.5;

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: "Poppins", color: DARK.ink, overflow: "hidden" }}>
      {/* ═════ navigateur (générique) ═════ */}
      {bOn && bOpacity > 0.01 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
          <div style={{ position: "absolute", inset: 0, opacity: bOpacity, filter: `blur(${lerp(10, 0, ease(t, 0, 0.35)) + (t > F.cent ? (1 - backK) * 20 : 0)}px)`, transformOrigin: `${CX}px ${BAR_Y}px`, transform: `translateY(${(900 - BAR_Y) * zoomIn}px) rotateX(${lerp(12, 3, ease(t, 0, 0.5)) * (1 - zoomIn * 0.6)}deg) scale(${1 + 0.22 * zoomIn})` }}>
            <div style={{ position: "absolute", left: WX, top: WY, width: WW, height: WH, borderRadius: 38, background: "#141416", boxShadow: "0 60px 140px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(255,255,255,0.08)", overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 30, top: 26, display: "flex", gap: 12 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: "#3A3A3E" }} />)}</div>
              <div style={{ position: "absolute", left: 130, top: 16, height: 40, padding: "0 22px", borderRadius: 12, background: "#222225", display: "flex", alignItems: "center", fontSize: 22, fontWeight: 600, color: DARK.soft }}>Nouvel onglet</div>
              <div style={{ position: "absolute", left: 40, top: 84, width: WW - 80, height: 84, borderRadius: 42, background: "#232326", boxShadow: `0 0 0 3px ${PINK_L}, 0 0 50px rgba(217,130,139,0.45)`, display: "flex", alignItems: "center", padding: "0 30px", gap: 16, fontSize: 32, fontWeight: 600 }}>
                <span style={{ fontSize: 28, opacity: 0.7 }}>🔍</span>
                {t < F.click + 0.05 ? <span style={{ color: DARK.soft }}>Rechercher ou saisir une adresse</span> : <span style={{ whiteSpace: "nowrap" }}>{LINK.slice(0, typed)}{t < F.type + 0.9 && Math.floor(t * 4) % 2 === 0 && <span style={{ color: PINK }}>|</span>}</span>}
                {t > F.type + 0.85 && <div style={{ marginLeft: "auto", width: 60, height: 60, borderRadius: 30, background: PINK, color: "#fff", fontSize: 32, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${go(t, F.type + 0.85, F.type + 1.1, 0, 1) * press(t, F.avec + 0.1)})`, boxShadow: `0 0 ${30 + 50 * pulse(t, F.avec + 0.1, 0.12)}px rgba(217,130,139,0.7)` }}>↵</div>}
                {t > F.avec + 0.1 && t < F.flash + 0.1 && <div style={{ position: "absolute", left: 0, bottom: 0, height: 6, borderRadius: 3, width: `${100 * ease(t, F.avec + 0.1, F.flash)}%`, background: PINK }} />}
              </div>
              <div style={{ position: "absolute", left: 40, right: 40, top: 200 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: DARK.soft }}>Favoris</div>
                <div style={{ display: "flex", gap: 26, marginTop: 22 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 180, height: 180, borderRadius: 36, background: "#1E1E21" }} />)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════ 100 candidatures / 20 refus / 80 fantômes ═════ */}
      {gridOn && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, P[3].t0 - 0.1, P[3].t0 + 0.2), transform: glitch ? `translateX(${(gk - 1) * 18}px) skewX(${(gk - 1) * 4}deg)` : "none" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 210, fontWeight: 800, letterSpacing: -8, lineHeight: 1, fontVariantNumeric: "tabular-nums", textShadow: glitch ? `${(gk - 1) * 10}px 0 0 ${PINK}, ${(1 - gk) * 10}px 0 0 #6CF` : "0 0 60px rgba(217,130,139,0.3)" }}>
            {t < F.refus ? count : t < F.fant ? <span style={{ color: DARK.soft }}>20</span> : <span style={{ color: PINK_L }}>80</span>}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontSize: 58, fontWeight: 800 }}>
            {t < F.refus ? <TextDrop t={t} t0={F.cent + 0.15} text="candidatures" by="chars" from={[0, 20]} stagger={0.02} dur={0.15} /> : t < F.fant ? <TextDrop t={t} t0={F.refus} text="refus" by="chars" from={[0, 20]} stagger={0.03} dur={0.15} /> : <span style={{ color: PINK_L }}><TextDrop t={t} t0={F.fant} text="fantômes 👻" from={[0, 20]} /></span>}
          </div>
          <div style={{ position: "absolute", left: 90, top: 520, width: 900, display: "grid", gridTemplateColumns: "repeat(10, 1fr)", gap: 14 }}>
            {Array.from({ length: 100 }, (_, i) => {
              const a = F.grid + i * 0.009, k = go(t, a, a + 0.25, 0, 1), refus = REFUS.has(i);
              const gone = refus ? 0 : ghostK, rk = refus ? ease(t, F.refus + (ORDER.indexOf(i) % 20) * 0.02, F.refus + 0.25 + (ORDER.indexOf(i) % 20) * 0.02) : 0;
              const floatY = -gone * (120 + (i % 7) * 30), sway = Math.sin(t * 3 + i) * 8 * gone;
              return (
                <div key={i} style={{ height: 74, borderRadius: 12, background: refus ? lerpCol(rk) : "#2C2C30", border: refus ? "none" : `2px solid rgba(242,184,192,${0.5 * (1 - gone) + 0.2})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, color: refus ? "#8E8E93" : PINK_L, transform: `translate(${sway}px, ${floatY}px) scale(${k * (1 + 0.15 * gone)})`, opacity: clamp(k * 2) * (refus ? 1 : 1 - 0.85 * gone), filter: gone > 0.05 ? `blur(${gone * 4}px)` : "none" }}>
                  {refus && rk > 0.5 ? "✕" : "✉"}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═════ Le problème, c'est pas toi. C'est ta lettre. ═════ */}
      <Title t={t} t0={P[3].t0} out={P[4].t0 - 0.1} a="Le problème," b="c'est pas toi." bt={P[3].t0 + 0.75} size={86} y={760} />
      {copyOn && (
        <div style={{ position: "absolute", inset: 0, opacity: crt }}>
          <Title t={t} t0={P[4].t0} out={P[5].t0 - 0.15} a="C'est ta lettre." b="La même, envoyée partout." bt={F.meme} size={70} />
          {Array.from({ length: 7 }, (_, i) => {
            const a = F.meme + 0.05 + i * 0.16, k = go(t, a, a + 0.25, 0, 1);
            return (
              <div key={i} style={{ position: "absolute", left: CX - 260 + (i - 3) * 34, top: 560 + i * 70, width: 520, height: 330, borderRadius: 26, background: "#E9E9EE", color: "#1D1D1F", padding: 30, boxShadow: "0 20px 60px rgba(0,0,0,0.55)", transform: `rotate(${(i - 3) * 2.5}deg) scale(${i === 0 ? bounce(t, [[P[4].t0 + 0.1, 0.6], [P[4].t0 + 0.45, 1]]) : k})`, opacity: i === 0 ? seg(t, P[4].t0, P[4].t0 + 0.15) : clamp(k * 2) }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: "#86868B" }}>Lettre_type.docx</div>
                <div style={{ marginTop: 10, fontSize: 26, fontWeight: 700 }}>Madame, Monsieur,</div>
                {[90, 84, 92, 70].map((w, j) => <div key={j} style={{ marginTop: 18, height: 14, borderRadius: 7, width: `${w}%`, background: "#C9C9CF" }} />)}
                {i > 0 && <div style={{ position: "absolute", right: 20, top: 20, padding: "6px 14px", borderRadius: 10, background: "#1D1D1F", color: "#fff", fontSize: 20, fontWeight: 800 }}>Ctrl + V</div>}
              </div>
            );
          })}
          {/* écran façon vieux téléviseur (effet téléphone) */}
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 6px)", mixBlendMode: "multiply", opacity: 0.8 }} />
          <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 220px rgba(0,0,0,0.9)" }} />
        </div>
      )}

      {/* ═════ Respire ═════ */}
      {breath && (
        <>
          {[1.35, 1.15].map((m, i) => <div key={i} style={{ position: "absolute", left: CX - br * m, top: 860 - br * m, width: br * m * 2, height: br * m * 2, borderRadius: "50%", border: `3px solid rgba(242,184,192,${0.25 - i * 0.08})`, transform: `scale(${1 + 0.05 * Math.sin(t * 3 + i)})` }} />)}
          <div style={{ position: "absolute", left: CX - br, top: 860 - br, width: br * 2, height: br * 2, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${PINK_L}, ${PINK} 60%, #B9606B)`, boxShadow: `0 0 ${br * 0.8}px rgba(217,130,139,0.55)` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center", fontSize: 110, fontWeight: 800, letterSpacing: -2, opacity: 1 - seg(t, P[5].t1, P[5].t1 + 0.3) }}>
            <TextDrop t={t} t0={P[5].t0} text="Respire." by="chars" from={[0, -30]} stagger={0.06} dur={0.3} />
          </div>
        </>
      )}

      {/* ═════ MyMotiv : logo + 5 clics ═════ */}
      {t > F.flash - 0.02 && t < P[7].t0 + 0.1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, P[7].t0 - 0.15, P[7].t0 + 0.1) }}>
          <div style={{ position: "absolute", left: CX - 90, top: 610, transform: `scale(${bounce(t, [[F.flash + 0.05, 0], [F.flash + 0.4, 1]])})` }}><AppIcon size={180} /></div>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: CX - 330, top: 860, width: 660, clipPath: `inset(0 ${100 - 100 * ease(t, F.flash + 0.25, F.flash + 0.7)}% 0 0)` }} />
          <div style={{ position: "absolute", left: CX - 230, top: 1110, width: 460, height: 140, borderRadius: 70, background: PINK, color: "#fff", fontSize: 66, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${bounce(t, [[F.clics - 0.05, 0], [F.clics + 0.3, 1]])})`, boxShadow: "0 0 70px rgba(217,130,139,0.55)" }}>
            <TextDrop t={t} t0={F.clics} text="5 clics." by="chars" from={[0, 30]} stagger={0.04} dur={0.18} />
          </div>
        </div>
      )}
      <Shockwave t={t} t0={F.flash} y={760} />

      {/* ═════ CV / lien / Générer ═════ */}
      {stepsOn && (
        <div style={{ position: "absolute", inset: 0, perspective: 1500 }}>
          <div style={{ position: "absolute", inset: 0, transform: `rotateX(${6 + Math.sin(t) * 1.5}deg)`, transformOrigin: "540px 900px" }}>
            {STEPS.map((s, i) => {
              const k = bounce(t, [[P[7].t0 - 0.25 + i * 0.07, 0], [P[7].t0 + 0.1 + i * 0.07, 1]]), on = t >= s.t, act = on && t < s.t + 0.6;
              const y = lerp(630 + i * 200, 960 - 70, collapse);
              return (
                <div key={i} style={{ position: "absolute", left: CX - 420, top: y, width: 840, height: 140, borderRadius: 70, background: s.pink ? PINK : on ? "#2A2124" : "#1C1C1F", boxShadow: on ? `0 0 0 2px ${PINK_L}, 0 0 ${act ? 70 : 30}px rgba(217,130,139,${act ? 0.55 : 0.25})` : "0 0 0 1.5px rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 26, padding: "0 40px", transform: `scale(${k * press(t, s.t) * (act ? 1.04 : 1) * lerp(1, 0.3, collapse)})`, opacity: clamp(k * 2) * (1 - seg(t, F.generer + 0.45, F.generer + 0.65)), color: "#fff" }}>
                  <div style={{ width: 70, height: 70, borderRadius: 35, background: s.pink ? "rgba(255,255,255,0.22)" : "#2C2C30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flex: "none" }}>{s.ic}</div>
                  <div style={{ fontSize: 48, fontWeight: 700, flex: 1 }}>{s.l}</div>
                  {!s.pink && <div style={{ width: 56, height: 56, borderRadius: 28, background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, transform: `scale(${on ? bounce(t, [[s.t, 0], [s.t + 0.3, 1]]) : 0})` }}>✓</div>}
                </div>
              );
            })}
          </div>
          <Ripple x={820} y={1100} t={t} t0={F.generer} />
        </div>
      )}

      {/* ═════ anneau 30 s ═════ */}
      {t > P[8].t0 - 0.1 && t < F.ecrite + 0.15 && (
        <div style={{ position: "absolute", left: CX - 260, top: 960 - 260, width: 520, height: 520, transform: `scale(${bounce(t, [[P[8].t0 - 0.05, 0.3], [P[8].t0 + 0.3, 1]])})`, opacity: 1 - seg(t, F.ecrite - 0.05, F.ecrite + 0.15) }}>
          <svg width={520} height={520} viewBox="0 0 520 520" style={{ position: "absolute", inset: 0 }}>
            <circle cx={260} cy={260} r={225} fill="none" stroke="#1E1E21" strokeWidth={38} />
            <circle cx={260} cy={260} r={225} fill="none" stroke={PINK} strokeWidth={38} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 225 * ringK} ${2 * Math.PI * 225}`} transform="rotate(-90 260 260)" style={{ filter: "drop-shadow(0 0 18px rgba(217,130,139,0.75))" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 170, fontWeight: 800, letterSpacing: -5, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{Math.round(30 * ringK)}<span style={{ fontSize: 76, color: DARK.soft }}> s*</span></div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, fontSize: 32, color: DARK.soft, fontWeight: 600 }}>{ringK < 1 ? <><Spinner t={t} size={34} /> ta lettre s'écrit</> : <span style={{ color: PINK_L }}>prête ✓</span>}</div>
          </div>
        </div>
      )}
      <Title t={t} t0={P[8].t0} out={F.ecrite - 0.1} a="30 secondes plus tard…" size={70} />
      {t > P[8].t0 && t < P[9].t0 && <div style={{ position: "absolute", left: 0, right: 0, top: 1650, textAlign: "center", fontSize: 25, color: DARK.soft, fontFamily: "Open Sans", opacity: seg(t, P[8].t0, P[8].t0 + 0.3) * (1 - seg(t, P[9].t0 - 0.3, P[9].t0)) }}>* temps mesuré : 27 à 35 s par lettre</div>}

      {/* ═════ la lettre ═════ */}
      {t > F.ecrite - 0.1 && t < F.offerte + 0.25 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
          <div style={{ position: "absolute", left: CX - lw / 2, top: 960 - lh / 2 - letterOut * 900, width: lw, height: lh, borderRadius: lr, background: "#FFFFFF", color: "#1D1D1F", overflow: "hidden", boxShadow: "0 50px 120px rgba(0,0,0,0.6), 0 0 80px rgba(217,130,139,0.18)", transform: `rotateX(${4 + Math.sin(t * 0.8) * 2}deg) rotateY(${Math.sin(t * 0.6) * 3}deg) scale(${1 - letterOut * 0.3})`, opacity: 1 - letterOut }}>
            <div style={{ position: "absolute", left: 30, top: 30, width: 104, height: 104, borderRadius: 24, border: "3px dashed #D2D2D7", opacity: 1 - seg(t, F.logo - 0.05, F.logo + 0.1) }} />
            {t >= F.logo && <Img src={staticFile("company.png")} style={{ position: "absolute", left: 30, top: 30, width: 104, height: 104, borderRadius: 24, boxShadow: `0 0 ${50 * pulse(t, F.logo + 0.15, 0.3)}px ${PINK}` }} />}
            <div style={{ position: "absolute", left: 158, top: 42, fontSize: 36, fontWeight: 800 }}>Maison Lumen</div>
            <div style={{ position: "absolute", left: 158, top: 88, fontSize: 25, fontWeight: 600, color: "#86868B" }}>Manager des ventes · Lyon</div>
            {[92, 86, 95, 70, 0, 90, 84, 93, 62, 0, 88, 79, 92, 45].map((w, i) => (
              <div key={i} style={{ position: "absolute", left: 44, top: 180 + i * 46, height: w ? 16 : 0, borderRadius: 8, width: `${w * 0.86}%`, background: i === 0 ? "#F2C9CE" : "#E3E3E8", transform: `scaleX(${go(t, F.ecrite + 0.2 + i * 0.05, F.ecrite + 0.5 + i * 0.05, 0, 1)})`, transformOrigin: "0 50%" }} />
            ))}
          </div>
          {t > F.logo - 0.5 && t < F.logo && <Img src={staticFile("company.png")} style={{ position: "absolute", left: lx - 52, top: ly - 52, width: 104, height: 104, borderRadius: 24, transform: `scale(${lerp(1.8, 1, lk)})` }} />}
        </div>
      )}
      <Title t={t} t0={F.ecrite + 0.05} out={F.offerte - 0.2} a="Écrite pour CETTE offre." b="Avec son logo." bt={F.logo - 0.25} size={66} />

      {/* ═════ offerte → café ═════ */}
      {t > F.offerte - 0.05 && t < P[11].t0 + 0.15 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, P[11].t0 - 0.15, P[11].t0 + 0.15) }}>
          <Confetti t={t} t0={F.offerteMot} />
          {t < F.cafe && <div style={{ position: "absolute", left: CX - 120, top: 620, fontSize: 200, transform: `scale(${bounce(t, [[F.offerte, 0], [F.offerte + 0.4, 1]]) * (1 - ease(t, F.cafe - 0.2, F.cafe))}) rotate(${Math.sin(t * 6) * 4}deg)` }}>🎁</div>}
          {t > F.cafe - 0.2 && <div style={{ position: "absolute", left: CX - 120, top: 600, fontSize: 210, transform: `scale(${bounce(t, [[F.cafe - 0.2, 0], [F.cafe + 0.2, 1]])}) rotate(${Math.sin(t * 4) * 5}deg)` }}>☕</div>}
          <div style={{ position: "absolute", left: CX - 440, top: 960, width: 880, height: 180, borderRadius: 90, background: PINK, color: "#fff", fontSize: 60, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${bounce(t, [[F.offerte + 0.15, 0], [F.offerte + 0.5, 1]])})`, boxShadow: "0 0 90px rgba(217,130,139,0.6)", overflow: "hidden" }}>
            {t < F.cafe - 0.1 ? <TextDrop t={t} t0={F.offerte + 0.2} text="Ta 1re lettre : offerte" by="chars" from={[0, 30]} stagger={0.03} dur={0.16} /> : <TextDrop t={t} t0={F.cafe - 0.05} text="Moins cher qu'un café" by="chars" from={[0, 30]} stagger={0.025} dur={0.16} />}
          </div>
          {t > F.apres - 0.1 && t < F.cafe && <div style={{ position: "absolute", left: 0, right: 0, top: 1190, textAlign: "center", fontSize: 60, fontWeight: 800, color: DARK.soft }}><TextDrop t={t} t0={F.apres} text="Après ?" /></div>}
          {t > F.cafe + 0.3 && <div style={{ position: "absolute", left: 0, right: 0, top: 1190, textAlign: "center", fontSize: 54, fontWeight: 800, color: PINK_L }}><TextDrop t={t} t0={F.cafe + 0.35} text="0,99 € la lettre" by="chars" from={[0, 20]} stagger={0.03} dur={0.15} /></div>}
        </div>
      )}

      {/* ═════ enregistre cette vidéo ═════ */}
      {t > P[11].t0 - 0.05 && t < P[12].t0 + 0.15 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, P[12].t0 - 0.1, P[12].t0 + 0.15) }}>
          <div style={{ position: "absolute", left: CX - 420, top: 840, width: 840, height: 240, borderRadius: 60, background: "rgba(245,245,247,0.97)", color: "#1D1D1F", display: "flex", alignItems: "center", gap: 30, padding: "0 50px", transform: `scale(${bounce(t, [[P[11].t0, 0.5], [P[11].t0 + 0.35, 1]])})`, boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}>
            <svg width={110} height={130} viewBox="0 0 32 38" style={{ flex: "none", transform: `scale(${bounce(t, [[F.saveTap, 1.5], [F.saveTap + 0.3, 1]])})` }}>
              <path d="M4 3 Q4 1 6 1 L26 1 Q28 1 28 3 L28 36 L16 27 L4 36 Z" fill={t > F.saveTap ? PINK : "none"} stroke={t > F.saveTap ? PINK : "#1D1D1F"} strokeWidth={2.6} strokeLinejoin="round" />
            </svg>
            <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1.12 }}>{t > F.saveTap ? "Enregistrée ✓" : "Enregistre cette vidéo"}<br /><span style={{ fontSize: 34, fontWeight: 600, color: "#86868B" }}>pour ta prochaine candidature</span></div>
          </div>
        </div>
      )}

      {/* ═════ lien en bio ═════ */}
      {t > P[12].t0 - 0.05 && t < P[13].t0 + 0.05 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, P[13].t0 - 0.15, P[13].t0 + 0.05) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 560 - Math.abs(Math.sin((t - P[12].t0) * 5)) * 40, textAlign: "center", fontSize: 150, color: PINK, fontWeight: 800 }}>↑</div>
          <div style={{ position: "absolute", left: CX - 380, top: 800, width: 760, height: 170, borderRadius: 85, background: PINK, color: "#fff", fontSize: 76, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${bounce(t, [[P[12].t0, 0], [P[12].t0 + 0.35, 1]])})`, boxShadow: "0 0 90px rgba(217,130,139,0.6)" }}>Lien en bio</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1020, textAlign: "center", fontSize: 44, fontWeight: 700, color: DARK.soft }}><TextDrop t={t} t0={P[12].t0 + 0.25} text={LINK} by="chars" from={[0, 20]} stagger={0.02} dur={0.12} /></div>
        </div>
      )}

      {/* ═════ Postule. Respire. ═════ */}
      {t > P[13].t0 - 0.05 && t < F.end + 0.2 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", fontSize: 150, fontWeight: 800, lineHeight: 1.05, letterSpacing: -4, opacity: 1 - seg(t, F.end - 0.1, F.end + 0.2) }}>
          <TextDrop t={t} t0={P[13].t0} text="Postule." by="chars" from={[0, -50]} stagger={0.05} dur={0.25} /><br />
          <span style={{ color: PINK }}><TextDrop t={t} t0={F.respire2} text="Respire." by="chars" from={[0, -50]} stagger={0.05} dur={0.25} /></span>
        </div>
      )}

      {/* ═════ fin (pendant l'écho) ═════ */}
      {t > F.end - 0.05 && (
        <div style={{ position: "absolute", inset: 0, opacity: ease(t, F.end, F.end + 0.4) }}>
          <Bubbles t={t} t0={F.end} />
          <Horizon k={ease(t, F.end + 0.1, F.end + 0.6)} y={1005} />
          <div style={{ position: "absolute", left: CX - 60, top: 570, transform: `scale(${bounce(t, [[F.end + 0.15, 0], [F.end + 0.5, 1]])})` }}><AppIcon size={120} /></div>
          <div style={{ position: "absolute", left: CX - 330, top: 760 }}><GlossPill scale={bounce(t, [[F.end, 0.6], [F.end + 0.35, 1]])}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 430, opacity: seg(t, F.end + 0.15, F.end + 0.35) }} /></GlossPill></div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1040, textAlign: "center", fontSize: 40, fontWeight: 700, lineHeight: 1.3 }}>
            <TextDrop t={t} t0={F.end + 0.35} text="Avec MyMotiv, postulez." from={[0, -30]} /><br />
            <span style={{ color: PINK }}><TextDrop t={t} t0={F.end + 0.6} text="Et faites-vous recruter." from={[0, -30]} /></span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", fontSize: 36, fontWeight: 700, color: PINK_L }}><TextDrop t={t} t0={F.end + 0.9} text="1re lettre offerte · Lien en bio ↑" from={[0, 20]} /></div>
        </div>
      )}

      {ptr.o > 0 && <div style={{ position: "absolute", inset: 0, zIndex: 40 }}><Pointer x={ptr.x} y={ptr.y} hover={ptr.hv} press={ptr.pr} o={ptr.o} /></div>}
      <Flash k={flashK} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};

function lerpCol(k: number) {
  const a = [44, 44, 48], b = [70, 70, 74];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * clamp(k))).join(",")})`;
}
