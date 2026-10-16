// « Ballon » (≈44 s, 30 i/s, 9:16) : construction d'une 2e pub de référence de la même agence qu'Impact, envoyée par le
// propriétaire le 16/10/2026 (un ballon au ralenti extrême sous une aiguille, « images avant l'impact », « tu viens de
// regarder un ballon pendant 7 secondes… qui n'existe pas… et t'es encore là, à attendre qu'il éclate… imagine que
// c'était ta marque », le ballon éclate, le logo, l'appel en DM) — style mesuré dans styles/ballon-pop.md. Chez nous :
// un BALLON ROSE MyMotiv, rendu en 3D maison (src/ballonRendu.ts, aucune image externe), fond noir de la marque ; le
// compte à rebours s'appelle « IMAGES AVANT LE POP » (le mot de l'appel est installé dès la 1re seconde) ; la scène
// rentre dans un téléphone qui montre le vrai site (public/tuto-tel/) ; puis, AVANT que le ballon éclate (la boucle reste
// ouverte pendant l'offre), l'offre mise en avant : la SEMAINE illimitée* (prix, plafond et avantages lus dans
// lettre-ia/lib/pricing.ts), avec la même phrase-ancre qu'Impact « un centime de plus que deux lettres à l'unité » ;
// le ballon éclate pile sur le mot « POP » de « Commente… POP ! », les éclats deviennent le point de « mymotiv. ».
// Bandeau fixe « 💬 Commente « POP » → je t'envoie le lien » dès la 1re seconde (demande du propriétaire du 16/10/2026).
// ⚠️ La voix DIT les prix (ligne b5 de voix-ballon.json, copie de i6) : si pricing.ts change, la régénérer. Son : synth_ballon.py.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PLANS, WEEKLY_LIMIT } from "../../lettre-ia/lib/pricing";
import { bounce } from "./apple";
import { PINK, easeInOut, easeIn, lerp, rng, seg } from "./common";
import voix from "./data/ballon-voix.json";
import { K } from "./kinetic";
import { X, horloge } from "./pubMotion";
import { Capture } from "./splitDemo";
import { HAUT, Vue, rendre } from "./ballonRendu";
import "./fonts";
import "./fontsDeco";

export const BALLON_DUR = voix.duration;
const { at, sc, PH } = horloge(voix);
const NOIR = "#0B0A0B", GRIS = "#9A9396", MONO = "'DejaVu Sans Mono', monospace", FIN_ = "'Josefin Sans', Poppins", ROSE_C = "#F2B8C0";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const pop = (t: number, a: number) => bounce(t, [[a, 0.6], [a + 0.2, 1]], 0.08, 3, 7);
const euros = (c: number) => (c / 100).toFixed(2).replace(".", ",") + " €";

// ─── les temps clés (calés sur la voix) ───
const T_MACRO = 1.9;                                   // coupe : plan large → gros plan
const T_TOUCHE = 5.6;                                  // la pointe touche le ballon
const T_VOIX = 7.5;                                    // fin du ralenti muet
const T_FIL = at(11) - 0.15, T_FIL_FIN = sc(2);        // « … qui n'existe pas » : fil de fer
const T_TEL = sc(3) - 0.1;                             // « Maintenant, imagine… » : la scène rentre dans un téléphone
const T_SITE = at(34) - 0.15;                          // « MyMotiv l'écrit… » : le vrai site
const T_RETOUR = PH[4][1] - 0.15, T_GRAND = T_RETOUR + 0.45;
const T_OFFRE = sc(5), T_PRIX = at(58, 0.23), T_CENTIME = at(61) - 0.1, T_SANS = sc(6), T_OFFERTE = at(73) - 0.1;
const T_COM = sc(7);                                   // « Commente… »
const T_POP = at(80);                                  // « POP ! » : le ballon éclate (attaque mesurée sur la voix)
const T_LARGE = T_POP + 0.18, T_ECLATS = T_POP + 0.42, T_LOGO = T_POP + 1.0, T_APPEL = sc(8) - 0.1;

// ─── la caméra et l'aiguille au fil du temps ───
function creux(t: number) {
  if (t < T_TOUCHE) return 0;
  return 0.1 * easeOut(seg(t, T_TOUCHE, 9.5)) + 0.08 * seg(t, 9.5, T_COM) + 0.07 * easeIn(seg(t, T_COM, T_POP));
}
function vueAt(t: number): Vue {
  const base = { fil: 0, dechire: 0, coupe: 9, noeud: false, aiguille: true, largeur: 0.05, creux: 0 };
  if (t < T_MACRO) {
    const k = seg(t, 0, T_MACRO);
    return { ...base, cam: [0, 0.42, lerp(5.7, 5.35, k)], cible: [0, 0.38, 0], fovX: 28, pointe: HAUT + lerp(0.6, 0.5, k), noeud: true };
  }
  if (t >= T_LARGE) {                                  // plan large : la peau se rétracte vers le bas
    return { ...base, cam: [0, 0.42, 5.35], cible: [0, 0.38, 0], fovX: 28, pointe: HAUT - 0.12, noeud: true, coupe: lerp(1.0, -1.45, easeIn(seg(t, T_LARGE, T_LARGE + 0.3))) };
  }
  const D = creux(t), A = 0.035 + 0.22 * D;
  const pointe = t < T_TOUCHE ? HAUT + 0.42 * Math.pow(1 - seg(t, T_MACRO, T_TOUCHE), 1.6) : HAUT - D * Math.exp(-0.15);
  const dist = lerp(0.92, 0.8, ease(t, T_MACRO, 16)) - 0.04 * ease(t, T_COM, T_POP);
  const off = ease(t, T_GRAND - 0.2, T_GRAND + 0.7) * (1 - ease(t, T_COM - 0.3, T_COM + 0.4));   // l'offre : la caméra fait de la place
  const tr = t > T_COM ? 0.0025 * seg(t, T_COM, T_POP) * Math.sin(t * 90) : 0;                  // ça tremble avant le pop
  const cx = -0.13 * off + tr, cyC = 1.02 + 0.14 * off;
  const v: Vue = { ...base, cam: [cx, 1.3 + tr, dist], cible: [cx, cyC, 0], fovX: 34, pointe, creux: D, largeur: A, spot: 0.22 };
  if (t >= T_FIL - 0.06 && t < T_FIL_FIN + 0.06) v.fil = Math.min(seg(t, T_FIL - 0.06, T_FIL + 0.06), 1 - seg(t, T_FIL_FIN - 0.06, T_FIL_FIN + 0.06));
  if (t >= T_POP) { const k = seg(t, T_POP, T_LARGE); v.dechire = lerp(0.01, 0.6, easeOut(k)); v.creux = D * (1 - k); v.pointe = HAUT - D * Math.exp(-0.15) * (1 - k); }
  return v;
}

// ─── le ballon dans un canevas (rendu à mi-résolution), avec un flou de profondeur sur le premier plan ───
const RW = 540, RH = 960;
const BallonCanvas: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<HTMLCanvasElement>(null), flouRef = useRef<HTMLCanvasElement>(null);
  const v = vueAt(t), macro = v.spot !== undefined && v.fil < 0.5;
  useLayoutEffect(() => {
    const c = ref.current, ctx = c?.getContext("2d");
    if (!c || !ctx) return;
    const img = ctx.createImageData(RW, RH);
    rendre(img, v);
    ctx.putImageData(img, 0, 0);
    const f = flouRef.current?.getContext("2d");
    if (f) { f.clearRect(0, 0, RW, RH); f.drawImage(c, 0, 0); }
  });
  return (
    <AbsoluteFill>
      <canvas ref={ref} width={RW} height={RH} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <canvas ref={flouRef} width={RW} height={RH} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", filter: "blur(9px)", opacity: macro ? 1 : 0,
        WebkitMaskImage: "linear-gradient(180deg, rgba(0,0,0,0) 56%, rgba(0,0,0,1) 86%)", maskImage: "linear-gradient(180deg, rgba(0,0,0,0) 56%, rgba(0,0,0,1) 86%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// ─── le HUD de caméra ───
const Hud: React.FC<{ t: number }> = ({ t }) => {
  const c = "rgba(255,255,255,0.55)", clign = Math.floor(t * 2) % 2 === 0;
  const coin = (s: React.CSSProperties) => <div style={{ position: "absolute", width: 44, height: 44, borderColor: c, borderStyle: "solid", borderWidth: 0, ...s }} />;
  const tc = `00:00:${String(Math.floor(t)).padStart(2, "0")}:${String(Math.floor((t % 1) * 30)).padStart(2, "0")}`;
  return (
    <AbsoluteFill style={{ zIndex: 40, pointerEvents: "none" }}>
      {t < T_VOIX && <>
        {coin({ left: 40, top: 150, borderLeftWidth: 3, borderTopWidth: 3 })}{coin({ right: 40, top: 150, borderRightWidth: 3, borderTopWidth: 3 })}
        {coin({ left: 40, bottom: 120, borderLeftWidth: 3, borderBottomWidth: 3 })}{coin({ right: 40, bottom: 120, borderRightWidth: 3, borderBottomWidth: 3 })}
        <div style={{ position: "absolute", left: 60, top: 110, fontFamily: MONO, fontSize: 22, color: c }}><span style={{ color: clign ? "#E8262B" : "transparent" }}>●</span> REC {tc}</div>
        <div style={{ position: "absolute", right: 60, top: 110, fontFamily: MONO, fontSize: 22, color: c }}>{t < T_MACRO ? "85 MM" : "100 MM MACRO"}</div>
      </>}
      {t >= T_VOIX && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 110, textAlign: "center", fontFamily: MONO, fontSize: 22, color: c }}>
          <span style={{ color: "#E8262B" }}>●</span> tu regardes depuis {t.toFixed(1).replace(".", ",")} s</div>
      )}
    </AbsoluteFill>
  );
};

// ─── le compte à rebours « images avant le pop » (30 images par seconde, il s'arrête à 001) ───
const Compte: React.FC<{ t: number }> = ({ t }) => {
  if (t >= T_VOIX) return null;
  const n = Math.max(1, Math.round(197 - 30 * t));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1235, textAlign: "center", zIndex: 30, opacity: 1 - seg(t, T_VOIX - 0.15, T_VOIX) }}>
      <div style={{ fontFamily: MONO, fontSize: 22, letterSpacing: 4, color: "rgba(255,255,255,0.7)", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>IMAGES AVANT LE POP</div>
      <div style={{ fontFamily: FIN_, fontWeight: 400, fontSize: 130, lineHeight: 1.05, color: n <= 25 ? ROSE_C : "#fff", textShadow: "0 4px 24px rgba(0,0,0,0.55)" }}>{String(n).padStart(3, "0")}</div>
    </div>
  );
};

// ─── le texte en deux étages (petite ligne, grande ligne dont les mots arrivent avec la voix, mots forts en rose) ───
type Texte = { a: number; b: number; petit: string; grand: string; fort: string[]; g?: number; fin: number };
const TEXTES: Texte[] = [
  { a: T_VOIX + 0.1, b: sc(1), petit: "Tu viens de regarder un ballon", grand: "pendant 7 secondes.", fort: ["7"], g: at(6), fin: at(8) + 0.2 },
  { a: sc(1) + 0.15, b: sc(2), petit: "Un ballon", grand: "qui n'existe pas.", fort: ["n'existe", "pas."], g: at(11), fin: at(14) + 0.2 },
  { a: sc(2) + 0.15, b: sc(3) - 0.1, petit: "Et t'es encore là,", grand: "à attendre qu'il éclate.", fort: ["éclate."], g: at(20), fin: at(24) + 0.2 },
  { a: sc(3) + 0.15, b: sc(4), petit: "Maintenant, imagine que c'était", grand: "ta lettre de motivation.", fort: ["ta", "lettre"], g: at(30), fin: at(33) + 0.2 },
  { a: sc(4) + 0.1, b: at(47) - 0.15, petit: "MyMotiv l'écrit", grand: "pour qu'on ait envie de lire la suite.", fort: ["lire", "la", "suite."], g: at(38), fin: at(46) + 0.2 },
  { a: at(47) - 0.15, b: T_RETOUR, petit: "Faite pour l'offre,", grand: "avec tes vraies preuves.", fort: ["vraies", "preuves."], g: at(51), fin: at(54) + 0.2 },
  { a: T_COM + 0.05, b: T_POP + 0.12, petit: "Ta 1re lettre est offerte.", grand: "Commente...", fort: [], g: at(79), fin: at(79) + 0.3 },
];
const DeuxEtages: React.FC<{ t: number; y: number; size?: number }> = ({ t, y, size = 66 }) => {
  const tx = TEXTES.find((x) => t >= x.a && t < x.b);
  if (!tx) return null;
  const mots = tx.grand.split(" "), g = tx.g ?? tx.a + 0.3, d = Math.max(0.04, (tx.fin - g) / mots.length);
  return (
    <div style={{ position: "absolute", left: 120, right: 160, top: y, textAlign: "center", zIndex: 35, textShadow: "0 3px 18px rgba(0,0,0,0.75)" }}>
      <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "rgba(255,255,255,0.78)", opacity: seg(t, tx.a, tx.a + 0.2) }}>{tx.petit}</div>
      <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: size, lineHeight: 1.12, color: "#fff", marginTop: 4 }}>
        {mots.map((m, i) => <span key={i} style={{ opacity: t >= g + i * d ? 1 : 0, color: tx.fort.includes(m) ? ROSE_C : "#fff", fontWeight: tx.fort.includes(m) ? 800 : 700 }}>{m} </span>)}
      </div>
    </div>
  );
};

// ─── la version fil de fer : petites étiquettes techniques ───
const Etiquettes: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_FIL + 0.1 || t >= T_FIL_FIN) return null;
  const s: React.CSSProperties = { fontFamily: MONO, fontSize: 22, color: "rgba(242,184,192,0.85)", whiteSpace: "nowrap" };
  return (
    <div style={{ position: "absolute", left: 130, top: 1388, zIndex: 36, opacity: seg(t, T_FIL + 0.1, T_FIL + 0.3) }}>
      <div style={s}>ballon_rose.obj  |  existe : non</div>
      <div style={s}>aiguille.obj     |  pop : bientôt</div>
    </div>
  );
};

// ─── le téléphone : la scène rentre dedans, puis le vrai site ───
const TEL = { x: 290, y: 545, w: 500, h: 1000 };
const Telephone: React.FC<{ t: number }> = ({ t }) => {
  const k = t < T_RETOUR ? ease(t, T_TEL, T_TEL + 0.6) : 1 - ease(t, T_RETOUR, T_GRAND);
  const x = lerp(0, TEL.x, k), y = lerp(0, TEL.y, k), w = lerp(1080, TEL.w, k), h = lerp(1920, TEL.h, k), r = lerp(0, 64, k), b = lerp(0, 14, k);
  const site = t >= T_SITE && t < T_RETOUR;
  const img = t < at(47) - 0.15 ? "040-lettre" : t < at(53) - 0.1 ? "026-resultat" : "040-lettre";
  const cams: [number, number, number, number][] = img === "026-resultat" ? [[at(47) - 0.15, 480, 780, 1.2], [at(53), 470, 880, 1.25]]
    : t < at(47) ? [[T_SITE, 540, 700, 1.0], [at(47), 540, 650, 1.2]] : [[at(53) - 0.1, 535, 860, 1.25], [T_RETOUR, 535, 870, 1.35]];
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, borderRadius: r, border: `${b}px solid #1B191A`, boxSizing: "border-box", overflow: "hidden",
      boxShadow: k > 0.05 ? `0 0 0 2px rgba(255,255,255,${0.08 * k}), 0 0 70px rgba(217,130,139,${0.25 * k}), 0 40px 90px rgba(0,0,0,${0.6 * k})` : "none", background: NOIR }}>
      {site ? (
        <Capture t={t} src={`tuto-tel/${img}.jpg`} W={1080} H={1920} vw={w - 2 * b} vh={h - 2 * b} cams={cams}
          cadres={img === "026-resultat" ? [{ a: at(48), box: [80, 613, 260, 260] }] : t >= at(53) - 0.1 ? [{ a: at(53), box: [140, 808, 790, 134] }] : [{ a: at(44), box: [140, 808, 790, 134] }]} />
      ) : <BallonCanvas t={t} />}
    </div>
  );
};

// ─── l'offre mise en avant, AVANT le pop (la boucle reste ouverte) : la Semaine ───
const W_ = PLANS.week, L_ = PLANS.letter;
const Offre: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_OFFRE || t >= T_COM + 0.3) return null;
  const sortie = 1 - seg(t, T_COM - 0.1, T_COM + 0.25);
  const ligne = (a: number, child: React.ReactNode, mt = 10) => (
    <div style={{ marginTop: mt, opacity: seg(t, a, a + 0.25), transform: `translateY(${(1 - ease(t, a, a + 0.3)) * 24}px)` }}>{child}</div>
  );
  const ok = W_.features.find((f) => f.toLowerCase().startsWith("sans engagement")) ?? "Sans engagement";
  return (
    <div style={{ position: "absolute", left: 120, width: 600, top: 372, zIndex: 34, opacity: sortie, textShadow: "0 3px 16px rgba(0,0,0,0.6)" }}>
      {ligne(T_OFFRE, W_.badge ? <span style={{ display: "inline-block", padding: "6px 18px", borderRadius: 16, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 24, letterSpacing: 2, textShadow: "none" }}>{W_.badge.toUpperCase()}</span> : null, 0)}
      {ligne(T_OFFRE + 0.15, <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 50, color: "#fff" }}>{W_.name} illimitée*</div>)}
      {t >= T_PRIX && (
        <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 0 }}>
          <span style={{ fontFamily: K, fontWeight: 900, fontSize: 140, color: "#fff", letterSpacing: -4, transform: `scale(${pop(t, T_PRIX)})`, transformOrigin: "0% 80%", display: "inline-block" }}>{W_.price}</span>
        </div>
      )}
      {t >= T_PRIX && ligne(T_PRIX + 0.25, <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 34, color: GRIS, marginTop: -14 }}>{W_.period}</div>, 0)}
      {t >= T_CENTIME && ligne(T_CENTIME, <>
        <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 30, color: GRIS }}>2 lettres à l'unité = <span style={{ textDecoration: "line-through" }}>{euros(2 * L_.cents)}</span></div>
        <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 36, color: ROSE_C }}>+ {euros(W_.cents - 2 * L_.cents).replace("0,01 €", "1 centime")} = toute la semaine</div>
      </>, 18)}
      {t >= T_SANS && ligne(T_SANS, <div style={{ fontFamily: "'Open Sans'", fontWeight: 700, fontSize: 30, color: "#fff" }}><span style={{ color: ROSE_C }}>✓</span> {ok}</div>, 22)}
      {t >= T_OFFERTE && ligne(T_OFFERTE, <div style={{ fontFamily: "'Open Sans'", fontWeight: 700, fontSize: 30, color: "#fff" }}><span style={{ color: ROSE_C }}>✓</span> Ta 1re lettre est offerte</div>, 8)}
      {ligne(T_OFFRE + 0.3, <div style={{ fontFamily: "'Open Sans'", fontSize: 22, color: GRIS }}>* jusqu'à {WEEKLY_LIMIT} lettres par semaine</div>, 18)}
    </div>
  );
};

// ─── le bandeau fixe (demande du propriétaire : dès la 1re seconde, on sait qu'il faut commenter pour avoir le lien) ───
const T_BANDEAU = 0.3;
const Bandeau: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_BANDEAU || t >= T_APPEL + 0.1) return null;
  const rappel = [T_VOIX, T_GRAND + 0.4, T_COM].reduce((m, a) => m + 0.05 * Math.exp(-Math.pow((t - a - 0.15) / 0.12, 2)), 0);   // petit rappel aux moments clés
  return (
    <div style={{ position: "absolute", left: X, top: 312, transform: `translate(-50%, -50%) scale(${pop(t, T_BANDEAU) * (1 + rappel)})`, zIndex: 46,
      opacity: 1 - seg(t, T_APPEL - 0.25, T_APPEL + 0.05), padding: "11px 28px", borderRadius: 40, background: "rgba(11,10,11,0.74)", border: `2.5px solid ${ROSE_C}`,
      boxShadow: "0 0 26px rgba(217,130,139,0.35)", fontFamily: "Poppins", fontWeight: 700, fontSize: 31, color: "#fff", whiteSpace: "nowrap" }}>
      💬 Commente <span style={{ color: ROSE_C }}>« POP »</span> → je t'envoie le lien</div>
  );
};

// ─── le pop : le mot, le flash, les éclats de latex rose ───
const ECLATS = (() => { const r = rng(77); return Array.from({ length: 54 }, () => ({ a: r() * Math.PI * 2, v: 420 + r() * 1100, l: 26 + r() * 54, ep: 7 + r() * 9, rot: (r() - 0.5) * 1100, rot0: r() * 360, c: r() > 0.45 ? "#D9708A" : r() > 0.5 ? "#F2B8C0" : "#A4405A", g: 300 + r() * 500, f: 0.6 + r() * 0.8 })); })();
const MotPop: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_POP || t >= T_LOGO) return null;
  const d = t - T_POP, s = bounce(t, [[T_POP, 0.3], [T_POP + 0.12, 1.08], [T_POP + 0.3, 1]], 0.06, 4, 8);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 560, textAlign: "center", zIndex: 45, opacity: 1 - seg(t, T_LOGO - 0.35, T_LOGO - 0.05),
      transform: `scale(${s}) translateX(${d < 0.25 ? Math.sin(d * 140) * 10 : 0}px)` }}>
      <span style={{ fontFamily: K, fontWeight: 900, fontSize: 250, color: ROSE_C, letterSpacing: -6, textShadow: "0 0 60px rgba(217,130,139,0.8), 0 10px 40px rgba(0,0,0,0.6)" }}>POP</span>
    </div>
  );
};
const Eclats: React.FC<{ t: number }> = ({ t }) => {
  const d = t - T_ECLATS;
  if (d < 0 || d > 1.4) return null;
  const cx = X, cy = 1040;
  return (
    <AbsoluteFill style={{ zIndex: 20 }}>
      {ECLATS.map((e, i) => {
        const k = d * e.f, x = cx + Math.cos(e.a) * e.v * k * (1 - 0.3 * k), y = cy + Math.sin(e.a) * e.v * k * (1 - 0.3 * k) + e.g * k * k;
        return (
          <svg key={i} width={e.l * 2} height={e.l} viewBox={`0 0 ${e.l * 2} ${e.l}`} style={{ position: "absolute", left: x - e.l, top: y - e.l / 2, overflow: "visible",
            transform: `rotate(${e.rot0 + e.rot * k}deg)`, opacity: 1 - seg(d, 0.8, 1.35) }}>
            <path d={`M4 ${e.l / 2} q ${e.l / 4} ${-e.l / 2.5} ${e.l / 2} 0 t ${e.l / 2} 0 t ${e.l / 2} 0`} fill="none" stroke={e.c} strokeWidth={e.ep} strokeLinecap="round" />
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};

// ─── la fin : le point rose, le logo, l'appel ───
const Marque: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_LOGO - 0.3) return null;
  const LOGO_TOP = 640, dot = { x: X - 320 + 930 * (640 / 960), y: LOGO_TOP + 151 * (640 / 960), d: 48 * (640 / 960) };   // le point de « mymotiv. »
  const ds = pop(t, T_LOGO - 0.3);
  return (
    <AbsoluteFill style={{ zIndex: 30 }}>
      <div style={{ position: "absolute", left: dot.x - (dot.d * ds) / 2, top: dot.y - (dot.d * ds) / 2, width: dot.d * ds, height: dot.d * ds, borderRadius: "50%", background: "#DB8A9B",
        boxShadow: "0 0 40px rgba(217,130,139,0.8)", opacity: 1 - seg(t, T_LOGO + 0.1, T_LOGO + 0.3) }} />
      <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 320, top: LOGO_TOP, width: 640,
        opacity: seg(t, T_LOGO, T_LOGO + 0.25), filter: `blur(${(1 - seg(t, T_LOGO, T_LOGO + 0.3)) * 8}px) drop-shadow(0 0 30px rgba(217,130,139,0.35))` }} />
      <div style={{ position: "absolute", left: X - 460, width: 920, top: 850, textAlign: "center", fontFamily: FIN_, fontWeight: 400, fontSize: 31, letterSpacing: 6, color: "rgba(255,255,255,0.75)",
        opacity: seg(t, T_LOGO + 0.35, T_LOGO + 0.75) }}>POSTULEZ  |  FAITES-VOUS RECRUTER</div>
      {t >= T_APPEL && (
        <div style={{ position: "absolute", left: X, top: 1030, transform: `translate(-50%, -50%) scale(${pop(t, T_APPEL)})`, padding: "16px 36px", borderRadius: 44,
          border: `3px solid ${ROSE_C}`, background: "rgba(217,130,139,0.12)", fontFamily: "Poppins", fontWeight: 700, fontSize: 36, color: "#fff", whiteSpace: "nowrap" }}>
          Commente <span style={{ color: ROSE_C }}>« POP »</span> · 1re lettre offerte</div>
      )}
      {t >= T_APPEL + 0.4 && (
        <div style={{ position: "absolute", left: X - 400, width: 800, top: 1105, textAlign: "center", fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 27, color: GRIS, opacity: seg(t, T_APPEL + 0.4, T_APPEL + 0.7) }}>
          {W_.name} {W_.price} · sans engagement · *jusqu'à {WEEKLY_LIMIT} lettres par semaine</div>
      )}
    </AbsoluteFill>
  );
};

export const Ballon: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const tel = t >= T_TEL && t < T_GRAND;
  const scene = t < T_ECLATS + 0.05;                   // le ballon est à l'écran jusqu'aux éclats
  const flash = t >= T_POP && t < T_POP + 0.08 ? 0.55 * (1 - (t - T_POP) / 0.08) : t >= T_LARGE && t < T_LARGE + 0.04 ? 0.2 : 0;
  return (
    <AbsoluteFill style={{ background: NOIR, overflow: "hidden" }}>
      {scene && (tel ? <Telephone t={t} /> : <BallonCanvas t={t} />)}
      <Eclats t={t} />
      <Marque t={t} />
      <Offre t={t} />
      <Compte t={t} />
      <Etiquettes t={t} />
      {t < T_POP + 0.12 && <DeuxEtages t={t} y={tel ? 365 : 1190} size={tel ? 54 : 66} />}
      <MotPop t={t} />
      <Bandeau t={t} />
      {flash > 0 && <AbsoluteFill style={{ background: "#FFF1F4", opacity: flash, zIndex: 50 }} />}
      <Hud t={t} />
      <Audio src={staticFile("audio/ballon.wav")} />
    </AbsoluteFill>
  );
};
