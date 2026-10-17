// « Impact » (≈44 s, 30 i/s, 9:16) : construction d'une pub de référence envoyée par le propriétaire (16/10/2026 : un
// ralenti extrême d'une balle vers une canette, « images avant l'impact », puis « tu viens de regarder une balle pendant
// 7 secondes… qui n'existe pas… imagine que c'était ta marque », l'impact, le logo, l'appel en DM) — style mesuré dans
// styles/impact-ralenti.md. Chez nous : une LETTRE ROSE MyMotiv vole au ralenti vers LA PILE de candidatures grises
// (« la candidature qui sort de la pile », titre du site) ; fond crème, HUD de caméra, compte à rebours ; révélation en
// fil de fer ; la scène rentre dans un téléphone et devient le vrai site (public/tuto-tel/) ; l'impact fait exploser la
// pile ; le point de « mymotiv. » ; puis l'offre mise en avant : la SEMAINE illimitée* (prix, avantages et plafond lus
// dans lettre-ia/lib/pricing.ts), « un centime de plus que deux lettres à l'unité », 1re lettre offerte, « commente
// IMPACT ». ⚠️ La voix DIT les prix (ligne i6 de voix-impact.json) : si pricing.ts change, la régénérer. Son : synth_impact.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PLANS, WEEKLY_LIMIT } from "../../lettre-ia/lib/pricing";
import { bounce } from "./apple";
import { PINK, easeInOut, easeIn, lerp, rng, seg } from "./common";
import voix from "./data/impact-voix.json";
import { K } from "./kinetic";
import { X, horloge } from "./pubMotion";
import { Capture } from "./splitDemo";
import "./fonts";
import "./fontsDeco";

export const IMPACT_DUR = voix.duration;
const { at, sc } = horloge(voix);
const CREME = "#F3F0EB", ENCRE = "#1D1B1A", GRIS = "#8C8782", MONO = "'DejaVu Sans Mono', monospace", FIN_ = "'Josefin Sans', Poppins";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const pop = (t: number, a: number) => bounce(t, [[a, 0.6], [a + 0.2, 1]], 0.08, 3, 7);
const euros = (c: number) => (c / 100).toFixed(2).replace(".", ",") + " €";

// ─── les temps clés ───
const T_VOIX = 7.0;                                  // fin du ralenti muet : « tu viens de regarder… »
const T_FIL = at(10) - 0.15, T_FIL_FIN = sc(2);       // « Une lettre… qui n'existe pas » : fil de fer
const T_TEL = sc(3) - 0.1;                           // « Maintenant, imagine… » : la scène rentre dans un téléphone
const T_SITE = at(33) - 0.15;                        // « MyMotiv écrit… » : le téléphone montre le vrai site
const T_RETOUR = PHt(4)[1] - 0.15, T_GRAND = T_RETOUR + 0.25, T_CHOC = T_GRAND + 0.6;
const T_LOGO = T_CHOC + 0.95, T_OFFRE = sc(6), T_CENTIME = at(65) - 0.1, T_APPEL = sc(7);
function PHt(i: number) { return [voix.phrases[i].t0, voix.phrases[i].t1]; }

// ─── la scène : la lettre rose, la pile grise, la traînée ───
const PILE = { cx: 720, bas: 1010, w: 330, n: 13 };
const LET = { w: 250, h: 165, y: 760 };
const xLettre = (t: number) => {                      // très lent, puis il fonce dans la pile au moment du choc
  const xContact = PILE.cx - PILE.w / 2 - LET.w + 30;
  if (t < T_GRAND) return lerp(-60, xContact - 70, seg(t, 0, T_GRAND));
  return lerp(xContact - 70, xContact + 40, easeIn(seg(t, T_GRAND, T_CHOC)));
};
const Enveloppe: React.FC<{ fil?: boolean }> = ({ fil }) => (
  <svg width={LET.w} height={LET.h} viewBox="0 0 250 165" style={{ overflow: "visible" }}>
    {fil ? (
      <>
        <defs><pattern id="grille" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M16 0H0V16" fill="none" stroke="#9A948E" strokeWidth="1" /></pattern></defs>
        <rect x="2" y="2" width="246" height="161" rx="10" fill="url(#grille)" stroke="#6E6964" strokeWidth="2" />
        <path d="M4 6 L125 92 L246 6" fill="none" stroke="#6E6964" strokeWidth="2" />
      </>
    ) : (
      <>
        <rect x="0" y="0" width="250" height="165" rx="12" fill="url(#rose)" />
        <defs><linearGradient id="rose" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E9A3AB" /><stop offset="1" stopColor="#C7707A" /></linearGradient></defs>
        <path d="M6 8 L125 96 L244 8" fill="none" stroke="#A9555F" strokeWidth="5" strokeLinejoin="round" />
        <path d="M6 158 L98 80 M244 158 L152 80" stroke="rgba(169,85,95,0.45)" strokeWidth="3" />
        <circle cx="125" cy="96" r="24" fill="#FFF6F2" />
        <text x="125" y="104" textAnchor="middle" fontFamily="Poppins" fontWeight="800" fontSize="21" fill={PINK}>mm.</text>
      </>
    )}
  </svg>
);
const Pile: React.FC<{ fil?: boolean }> = ({ fil }) => {
  const r = rng(7);
  const couches = Array.from({ length: PILE.n }, (_, i) => ({ dx: (r() - 0.5) * 22, rot: (r() - 0.5) * 3, c: i % 2 ? "#D9D5CF" : "#CEC9C2" }));
  const hC = 36;
  return (
    <div style={{ position: "absolute", left: PILE.cx - PILE.w / 2, top: PILE.bas - PILE.n * hC, width: PILE.w, height: PILE.n * hC }}>
      {!fil && <div style={{ position: "absolute", left: -40, right: -40, bottom: -26, height: 46, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.28), rgba(0,0,0,0) 70%)" }} />}
      {couches.map((c, i) => (
        <div key={i} style={{ position: "absolute", left: c.dx, top: i * hC, width: PILE.w, height: hC + 6, borderRadius: 6, transform: `rotate(${c.rot}deg)`,
          background: fil ? "transparent" : `linear-gradient(180deg, ${c.c}, #BDB7B0)`, border: fil ? "2px solid #6E6964" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: fil ? "none" : "0 2px 3px rgba(0,0,0,0.12)" }}>
          {!fil && <div style={{ position: "absolute", left: 18, right: 18, top: 14, height: 3, background: "rgba(0,0,0,0.12)" }} />}
        </div>
      ))}
      <div style={{ position: "absolute", left: PILE.w / 2 - 70, top: 2 * hC + 4, width: 140, padding: "6px 0", background: fil ? "transparent" : "#F7E9A8", border: fil ? "2px dashed #6E6964" : "none",
        transform: "rotate(-4deg)", textAlign: "center", fontFamily: MONO, fontWeight: 700, fontSize: 20, color: "#4A4640", boxShadow: fil ? "none" : "0 3px 6px rgba(0,0,0,0.15)" }}>À TRIER</div>
    </div>
  );
};
const Scene: React.FC<{ t: number; fil?: boolean; choc?: boolean }> = ({ t, fil, choc }) => {
  const x = xLettre(t), wob = Math.sin(t * 2.2) * 1.5;
  return (
    <AbsoluteFill style={{ background: fil ? "#F1EEE8" : CREME, backgroundImage: fil ? "linear-gradient(#DDD8D1 1px, transparent 1px), linear-gradient(90deg, #DDD8D1 1px, transparent 1px)" : "none",
      backgroundSize: "40px 40px", overflow: "hidden" }}>
      {/* la traînée */}
      <div style={{ position: "absolute", left: 0, width: Math.max(0, x + 20), top: LET.y - 1, height: 2, background: "linear-gradient(90deg, rgba(140,135,130,0), rgba(140,135,130,0.55))" }} />
      {!choc && <Pile fil={fil} />}
      <div style={{ position: "absolute", left: x, top: LET.y - LET.h / 2, transform: `rotate(${-3 + wob}deg)`, filter: fil ? "none" : "drop-shadow(0 18px 18px rgba(0,0,0,0.18))" }}><Enveloppe fil={fil} /></div>
      {fil && (
        <>
          <div style={{ position: "absolute", left: x, top: LET.y - LET.h / 2 - 44, fontFamily: MONO, fontSize: 20, color: "#6E6964", whiteSpace: "nowrap" }}>lettre.svg  |  0 mot écrit</div>
          <div style={{ position: "absolute", left: PILE.cx - 120, top: PILE.bas - PILE.n * 36 - 48, fontFamily: MONO, fontSize: 20, color: "#6E6964", whiteSpace: "nowrap" }}>pile.obj  |  0 lettre lue</div>
          <div style={{ position: "absolute", left: X - 300, width: 600, top: PILE.bas + 50, textAlign: "center", fontFamily: MONO, fontSize: 20, color: "#6E6964" }}>vitesse = ×0,0001  |  impact = jamais</div>
        </>
      )}
    </AbsoluteFill>
  );
};

// ─── le HUD de caméra ───
const Hud: React.FC<{ t: number; sombre?: boolean }> = ({ t, sombre }) => {
  const c = sombre ? "rgba(255,255,255,0.55)" : "#77716B", clign = Math.floor(t * 2) % 2 === 0;
  const coin = (s: React.CSSProperties) => <div style={{ position: "absolute", width: 44, height: 44, borderColor: c, borderStyle: "solid", borderWidth: 0, ...s }} />;
  const tc = `00:00:${String(Math.floor(t)).padStart(2, "0")}:${String(Math.floor((t % 1) * 30)).padStart(2, "0")}`;
  return (
    <AbsoluteFill style={{ zIndex: 40, pointerEvents: "none" }}>
      {coin({ left: 40, top: 150, borderLeftWidth: 3, borderTopWidth: 3 })}{coin({ right: 40, top: 150, borderRightWidth: 3, borderTopWidth: 3 })}
      {coin({ left: 40, bottom: 120, borderLeftWidth: 3, borderBottomWidth: 3 })}{coin({ right: 40, bottom: 120, borderRightWidth: 3, borderBottomWidth: 3 })}
      {t < T_VOIX ? (
        <>
          <div style={{ position: "absolute", left: 60, top: 110, fontFamily: MONO, fontSize: 22, color: c }}><span style={{ color: clign ? "#E8262B" : "transparent" }}>●</span> REC {tc}</div>
          <div style={{ position: "absolute", right: 60, top: 110, fontFamily: MONO, fontSize: 22, color: c }}>100 000 I/S</div>
        </>
      ) : (
        <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontFamily: MONO, fontSize: 22, color: c }}>
          <span style={{ color: "#E8262B" }}>●</span> tu regardes depuis {t.toFixed(1).replace(".", ",")} s</div>
      )}
    </AbsoluteFill>
  );
};

// ─── le compte à rebours « images avant l'impact » (0 → 7 s) ───
const Compte: React.FC<{ t: number }> = ({ t }) => {
  if (t >= T_VOIX) return null;
  const n = Math.max(6, Math.round(182 * Math.exp(-0.487 * t)));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1235, textAlign: "center", zIndex: 30 }}>
      <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: GRIS }}>IMAGES AVANT L'IMPACT</div>
      <div style={{ fontFamily: FIN_, fontWeight: 300, fontSize: 130, lineHeight: 1.05, color: n <= 25 ? PINK : "#3A3632" }}>{String(n).padStart(3, "0")}</div>
    </div>
  );
};

// ─── le texte en deux étages (petite ligne grise, grande ligne noire dont les mots arrivent un à un) ───
type Texte = { a: number; b: number; petit: string; grand: string; fort: string[]; fin: number };
const TEXTES: Texte[] = [
  { a: T_VOIX + 0.1, b: sc(1), petit: "Tu viens de regarder une lettre voler", grand: "pendant 7 secondes.", fort: ["7", "secondes."], fin: at(9) + 0.2 },
  { a: sc(1) + 0.15, b: sc(2), petit: "Une lettre", grand: "qui n'existe pas.", fort: ["n'existe", "pas."], fin: at(15) + 0.2 },
  { a: sc(2) + 0.15, b: sc(3) - 0.1, petit: "Et t'es encore là,", grand: "à attendre qu'elle arrive.", fort: ["arrive."], fin: at(25) + 0.2 },
  { a: sc(3) + 0.15, b: sc(4), petit: "Maintenant, imagine", grand: "que c'était ta candidature.", fort: ["ta", "candidature."], fin: at(32) + 0.2 },
  { a: sc(4) + 0.1, b: at(45) - 0.15, petit: "MyMotiv écrit des lettres", grand: "pensées pour qu'on lise la suite.", fort: ["lise", "la", "suite."], fin: at(44) + 0.2 },
  { a: at(45) - 0.15, b: T_RETOUR, petit: "Faites pour l'offre,", grand: "avec tes vraies preuves.", fort: ["vraies", "preuves."], fin: at(52) + 0.2 },
];
const DeuxEtages: React.FC<{ t: number; y: number; sombre?: boolean }> = ({ t, y, sombre }) => {
  const tx = TEXTES.find((x) => t >= x.a && t < x.b);
  if (!tx) return null;
  const mots = tx.grand.split(" "), d = (tx.fin - tx.a - 0.3) / mots.length;
  return (
    <div style={{ position: "absolute", left: 80, right: 120, top: y, textAlign: "center", zIndex: 35 }}>
      <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: sombre ? "rgba(255,255,255,0.65)" : GRIS, opacity: seg(t, tx.a, tx.a + 0.2) }}>{tx.petit}</div>
      <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 64, lineHeight: 1.15, color: sombre ? "#fff" : ENCRE, marginTop: 4 }}>
        {mots.map((m, i) => <span key={i} style={{ opacity: t >= tx.a + 0.3 + i * d ? 1 : 0, fontWeight: tx.fort.includes(m) ? 800 : 600 }}>{m} </span>)}
      </div>
    </div>
  );
};

// ─── le téléphone (la scène rentre dedans, puis le vrai site) ───
const TEL = { x: 270, y: 470, w: 540, h: 1080 };
const Telephone: React.FC<{ t: number }> = ({ t }) => {
  const k = t < T_GRAND ? ease(t, T_TEL, T_TEL + 0.6) : 1 - ease(t, T_GRAND, T_GRAND + 0.45);
  const x = lerp(0, TEL.x, k), y = lerp(0, TEL.y, k), w = lerp(1080, TEL.w, k), h = lerp(1920, TEL.h, k), r = lerp(0, 64, k), b = lerp(0, 14, k);
  const site = t >= T_SITE && t < T_RETOUR, s = w / 1080;
  const img = t < at(45) - 0.15 ? "040-lettre" : t < at(49) - 0.1 ? "026-resultat" : "040-lettre";
  const cams: [number, number, number, number][] = img === "026-resultat" ? [[at(45) - 0.15, 480, 780, 1.2], [at(49), 470, 880, 1.25]]
    : t < at(45) ? [[T_SITE, 540, 700, 1.0], [at(45), 540, 640, 1.2]] : [[at(49) - 0.1, 535, 860, 1.25], [T_RETOUR, 535, 870, 1.35]];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, border: `${b}px solid #141414`, boxSizing: "border-box", overflow: "hidden",
      boxShadow: k > 0.05 ? `0 40px 80px rgba(0,0,0,${0.25 * k})` : "none", background: CREME }}>
      {site ? (
        <div style={{ position: "absolute", inset: 0, background: "#0B0A0B" }}>
          <Capture t={t} src={`tuto-tel/${img}.jpg`} W={1080} H={1920} vw={w - 2 * b} vh={h - 2 * b} cams={cams}
            cadres={img === "026-resultat" ? [{ a: at(46), box: [80, 613, 260, 260] }] : t >= at(49) - 0.1 ? [{ a: at(50) - 0.1, box: [140, 808, 790, 134] }] : []} />
        </div>
      ) : (
        <div style={{ position: "absolute", left: -b, top: -b, width: 1080, height: 1920, transform: `scale(${s})`, transformOrigin: "0 0" }}><Scene t={t} /></div>
      )}
    </div>
  );
};

// ─── le choc : la pile éclate, la lettre reste, devient le point de « mymotiv. » ───
const ECLATS = (() => { const r = rng(42); return Array.from({ length: 46 }, () => ({ a: r() * Math.PI * 2, v: 300 + r() * 900, w: 14 + r() * 40, h: 6 + r() * 16, rot: (r() - 0.5) * 900, c: r() > 0.5 ? "#C9C3BC" : "#B5AEA6", g: 200 + r() * 300 })); })();
const POINT = { x: X - 320 + 930 * (640 / 960), y: 600 + 151 * (640 / 960), d: 48 * (640 / 960) };   // le point de « mymotiv. » dans le logo
const Choc: React.FC<{ t: number; fond: boolean }> = ({ t, fond }) => {
  const d = t - T_CHOC, cx = PILE.cx - 20, cy = PILE.bas - 200;
  const flash = d >= 0 && d < 0.12 ? 1 - d / 0.12 : 0;
  const pt = seg(t, T_CHOC + 0.25, T_LOGO);                        // la lettre glisse au centre et se réduit en point
  const lx = lerp(xLettre(T_CHOC) + LET.w / 2, POINT.x, easeInOut(pt)), ly = lerp(LET.y, POINT.y, easeInOut(pt)), ls = lerp(1, POINT.d / LET.w, easeInOut(pt));
  return (
    <AbsoluteFill style={{ background: fond ? CREME : "transparent" }}>
      {d >= 0 && d < 1.6 && ECLATS.map((e, i) => {
        const k = Math.min(d, 1.6);
        return <div key={i} style={{ position: "absolute", left: cx + Math.cos(e.a) * e.v * k * (1 - 0.35 * k), top: cy + Math.sin(e.a) * e.v * k * (1 - 0.35 * k) + e.g * k * k, width: e.w, height: e.h,
          background: e.c, borderRadius: 3, transform: `rotate(${e.rot * k}deg)`, opacity: 1 - seg(d, 0.7, 1.5) }} />;
      })}
      {t < T_LOGO + 0.15 && (pt > 0.85
        ? <div style={{ position: "absolute", left: lx - (LET.w * ls) / 2, top: ly - (LET.w * ls) / 2, width: LET.w * ls, height: LET.w * ls, borderRadius: "50%", background: PINK }} />
        : <div style={{ position: "absolute", left: lx - LET.w / 2, top: ly - LET.h / 2, transform: `scale(${ls}) rotate(${-3 * (1 - pt)}deg)` }}><Enveloppe /></div>)}
      {flash > 0 && <AbsoluteFill style={{ background: "#FFFDF8", opacity: flash }} />}
    </AbsoluteFill>
  );
};

// ─── le logo, le slogan, puis l'offre mise en avant : la Semaine ───
const W_ = PLANS.week, L_ = PLANS.letter;
const Marque: React.FC<{ t: number }> = ({ t }) => {
  const monte = ease(t, T_OFFRE - 0.2, T_OFFRE + 0.4);
  const logoY = lerp(690, 340, monte), logoS = lerp(1, 0.62, monte);
  const carte = t >= T_OFFRE;
  return (
    <AbsoluteFill style={{ background: CREME }}>
      <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 320, top: logoY - 90, width: 640, transform: `scale(${logoS})`, opacity: seg(t, T_LOGO, T_LOGO + 0.25),
        filter: `blur(${(1 - seg(t, T_LOGO, T_LOGO + 0.3)) * 8}px)` }} />
      {t < T_OFFRE + 0.2 && <div style={{ position: "absolute", left: X - 460, width: 920, top: 850, textAlign: "center", fontFamily: FIN_, fontWeight: 400, fontSize: 31, letterSpacing: 6, color: "#4A4640",
        opacity: seg(t, sc(5) + 0.2, sc(5) + 0.6) * (1 - seg(t, T_OFFRE - 0.2, T_OFFRE + 0.1)) }}>POSTULEZ  |  FAITES-VOUS RECRUTER</div>}
      {carte && (
        <div style={{ position: "absolute", left: 140, width: 760, top: 470, borderRadius: 36, background: "#FFFFFF", boxShadow: "0 30px 70px rgba(60,40,30,0.16)", padding: "36px 44px 30px",
          boxSizing: "border-box", transform: `translateY(${(1 - ease(t, T_OFFRE, T_OFFRE + 0.45)) * 80}px)`, opacity: seg(t, T_OFFRE, T_OFFRE + 0.3) }}>
          {W_.badge && <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 16, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 24, letterSpacing: 2 }}>{W_.badge.toUpperCase()}</div>}
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: ENCRE, marginTop: 14 }}>{W_.name} illimitée*</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 4 }}>
            <span style={{ fontFamily: K, fontWeight: 900, fontSize: 130, color: ENCRE, letterSpacing: -4, transform: `scale(${pop(t, at(62) - 0.1)})`, display: "inline-block" }}>{W_.price}</span>
            <span style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 36, color: GRIS }}>{W_.period}</span>
          </div>
          <div style={{ marginTop: 6, minHeight: 92, opacity: seg(t, T_CENTIME, T_CENTIME + 0.25) }}>
            <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 30, color: GRIS }}>2 lettres à l'unité = <span style={{ textDecoration: "line-through" }}>{euros(2 * L_.cents)}</span></div>
            <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 34, color: PINK }}>+ {euros(W_.cents - 2 * L_.cents).replace("0,01 €", "1 centime")} = toute la semaine</div>
          </div>
          <div style={{ marginTop: 14 }}>
            {W_.features.map((ft, i) => (
              <div key={i} style={{ fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 30, color: "#3A3632", marginTop: 8, opacity: seg(t, T_OFFRE + 0.3 + i * 0.12, T_OFFRE + 0.5 + i * 0.12) }}>
                <span style={{ color: PINK, fontWeight: 800 }}>✓</span> {ft}</div>
            ))}
          </div>
          <div style={{ fontFamily: "'Open Sans'", fontSize: 22, color: GRIS, marginTop: 14 }}>* jusqu'à {WEEKLY_LIMIT} lettres par semaine</div>
        </div>
      )}
      {t >= T_APPEL && (
        <div style={{ position: "absolute", left: X, top: 1345, transform: `translate(-50%, -50%) scale(${pop(t, T_APPEL) * (1 + 0.05 * Math.exp(-Math.pow((t - (at(81) - 0.05)) / 0.12, 2)))})`,
          padding: "14px 34px", borderRadius: 40, border: `3px solid ${ENCRE}`, background: CREME, fontFamily: "Poppins", fontWeight: 700, fontSize: 32, color: ENCRE, whiteSpace: "nowrap" }}>
          1re lettre offerte · commente <span style={{ color: PINK }}>« IMPACT »</span></div>
      )}
    </AbsoluteFill>
  );
};

export const Impact: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  // 0-7 s : la caméra s'approche ; à 7 s, coupe sèche en plan large
  const zoom = t < T_VOIX ? lerp(1, 1.42, easeInOut(seg(t, 0, T_VOIX))) : 1;
  const tel = t >= T_TEL && t < T_GRAND + 0.45;
  return (
    <AbsoluteFill style={{ background: CREME, overflow: "hidden" }}>
      {t < T_CHOC ? (
        tel ? <><AbsoluteFill style={{ background: CREME }} /><Telephone t={t} /></> : (
          <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: `${PILE.cx - 160}px ${LET.y}px` }}>
            <Scene t={t} fil={t >= T_FIL && t < T_FIL_FIN} />
          </AbsoluteFill>
        )
      ) : <>{t >= T_LOGO && <Marque t={t} />}{t < T_CHOC + 1.6 && <Choc t={t} fond={t < T_LOGO} />}</>}
      <Compte t={t} />
      {t < T_CHOC && <DeuxEtages t={t} y={tel ? 270 : 1170} />}
      {t < T_CHOC + 0.3 && <Hud t={t} />}
      <Audio src={staticFile("audio/impact.wav")} />
    </AbsoluteFill>
  );
};
