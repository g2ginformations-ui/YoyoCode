// « Le parcours MyMotiv » (31 s, 60 i/s, 9:16) — le vrai parcours client du site actuel, dans le style de « Révélation »
// (fond sombre, lumière rose, caméra 3D, flou de mise au point, flashs, écran de fin à bulles).
// Profil TikTok (capture fournie) : on entoure le lien de la bio → il s'isole et vole dans la barre d'adresse d'un
// navigateur (générique) → « Rechercher » → flash → le site : accueil, questionnaire, CV, lien de l'offre, prénom,
// analyse, engagement, score de matching, « Générer ma lettre offerte », la lettre avec le logo → fin.
// Captures réelles : public/parcours/*.png (capture/capture-parcours.mjs) ; les cases et boutons sont « isolés » :
// découpés dans la capture d'après public/parcours/boxes.json, ils sortent du téléphone et passent au premier plan
// pendant que le téléphone se floute derrière (profondeur de champ).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, bounce, curve, go } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import { Pointer } from "./Lien";
import { Bubbles } from "./motion";
import "./fonts";

export const PARCOURS_SITE_DUR = 31;
const C = { bg0: "#0B0A0B", card: "#2C2C2E", line: "#3A3A3C", ink: "#F5F5F7", soft: "#8E8E93" };
const CX = 540;
const e3 = (k: number) => 1 - Math.pow(1 - clamp(k), 3);
const ease = (t: number, a: number, b: number) => e3(seg(t, a, b));
const P = (n: string) => staticFile(`parcours/${n}.png`);
type Box = [number, number, number, number];

// Téléphone : écran 1080×1920 réduit à 0,6 → 648×1152, coin haut-gauche (216, 434)
const PS = 0.6, SL = 216, ST = 434, SW = 1080 * PS, SH = 1920 * PS;
const S = (x: number, y: number): [number, number] => [SL + x * PS, ST + y * PS];
// Profil TikTok : 923×2000, calé en largeur dans l'écran
const PK = SW / 923;

// Temps clés (s)
export const PT = { circle: 0.3, linkLift: 1.0, browser: 1.5, type: 1.95, search: 2.85, flash1: 3.35, site: 3.4, cta: 5.55,
  profil: 5.9, o2: 6.6, n1: 7.35, douleur: 7.7, o1: 8.35, n2: 9.0, reponse: 9.3, n3: 10.4, cv: 10.6, file: 11.55, n4: 12.2,
  offre: 12.4, lire: 14.4, compte: 14.8, rempli: 15.45, n5: 16.15, analyse: 16.4, engage: 18.6, hold: 19.55, note: 20.35,
  resultat: 20.9, gen: 23.3, ecrit: 23.6, lettre: 24.9, flash2: 28.0, end: 28.1 };

// Écran affiché dans le téléphone selon le temps
function screenAt(t: number): string {
  if (t < PT.site) return "";
  if (t < PT.profil) return "001-accueil";
  if (t < PT.douleur) return t < PT.o2 ? "002-profil" : "003-profil-choisi";
  if (t < PT.reponse) return t < PT.o1 ? "004-douleur" : "005-douleur-choisie";
  if (t < PT.cv) return "006-reponse";
  if (t < PT.offre) return t < PT.file ? "007-cv" : "008-cv-ajoute";
  if (t < PT.compte) {
    if (t >= PT.lire + 0.05) return "017-offre-lecture";
    const k = Math.floor(seg(t, 13.0, 13.9) * 6.999);
    return t < 13.0 ? "009-offre" : `0${10 + k}-offre-lien`;
  }
  if (t < PT.analyse) return t < PT.rempli ? "018-compte" : "019-compte-rempli";
  if (t < PT.engage) return `0${20 + Math.min(7, Math.floor(seg(t, PT.analyse + 0.1, PT.engage - 0.15) * 7.999))}-analyse`;
  if (t < PT.resultat) return t < PT.hold ? "028-engagement" : "029-engagement-maintien";
  if (t < PT.ecrit) return "034-resultat";
  if (t < PT.lettre) return "040-generation";
  return "048-lettre";
}

// Cases et boutons isolés : [début, fin, capture, cadre, titre, sous-titre, échelle cible, centre y cible]
type Lift = { t0: number; t1: number; src: (t: number) => string; box: Box; l1?: string; l2?: string; m?: number; cy?: number };
const LIFTS: Lift[] = [
  { t0: 3.85, t1: 4.95, src: () => "001-accueil", box: [40, 675, 1000, 298], l1: "Le site MyMotiv", m: 1.4, cy: 900 },
  { t0: 5.0, t1: 5.9, src: () => "001-accueil", box: [40, 1347, 1000, 150], l1: "1 clic pour commencer", m: 1.45, cy: 1000 },
  { t0: 6.1, t1: 7.05, src: (t) => (t < PT.o2 ? "002-profil" : "003-profil-choisi"), box: [40, 922, 1000, 174], l1: "Ton niveau", l2: "le ton s'adapte", cy: 980 },
  { t0: 7.85, t1: 8.8, src: (t) => (t < PT.o1 ? "004-douleur" : "005-douleur-choisie"), box: [40, 828, 1000, 135], l1: "Ce qui te bloque", cy: 980 },
  { t0: 9.4, t1: 10.25, src: () => "006-reponse", box: [40, 606, 1000, 951], l1: "Une lettre pour UNE offre", m: 1.3, cy: 1010 },
  { t0: 10.75, t1: 11.5, src: () => "007-cv", box: [40, 568, 1000, 389], l1: "Ton CV", l2: "une seule fois", m: 1.45, cy: 980 },
  { t0: 11.6, t1: 12.1, src: () => "008-cv-ajoute", box: [40, 568, 1000, 185], l1: "Ton CV", l2: "une seule fois", m: 1.45, cy: 980 },
  { t0: 12.55, t1: 14.25, src: (t) => screenAt(t), box: [40, 623, 1000, 142], l1: "Le lien de l'offre", l2: "n'importe quel site d'emploi", m: 1.45, cy: 980 },
  { t0: 14.95, t1: 15.95, src: (t) => (t < PT.rempli ? "018-compte" : "019-compte-rempli"), box: [40, 553, 1000, 335], l1: "Ton prénom", m: 1.45, cy: 980 },
  { t0: 16.55, t1: 18.45, src: (t) => screenAt(t), box: [40, 690, 1000, 650], l1: "Analyse de l'offre", l2: "en direct", m: 1.4, cy: 1000 },
  { t0: 18.75, t1: 19.4, src: () => "028-engagement", box: [40, 790, 1000, 180], l1: "Ton engagement", m: 1.45, cy: 980 },
  { t0: 21.05, t1: 21.95, src: () => "034-resultat", box: [70, 603, 280, 280], l1: "Ton score de matching", l2: "calculé sur ton CV", m: 2.4, cy: 960 },
  { t0: 22.0, t1: 22.85, src: () => "034-resultat", box: [40, 943, 1000, 258], l1: "Les mots-clés de l'offre", l2: "déjà dans ton CV", m: 1.45, cy: 980 },
  { t0: 22.9, t1: 23.55, src: () => "034-resultat", box: [40, 1750, 1000, 135], l1: "Ta 1re lettre", l2: "est offerte", m: 1.45, cy: 1000 },
  { t0: 23.75, t1: 24.8, src: () => "040-generation", box: [20, 230, 1040, 400], l1: "Ta lettre s'écrit…", m: 1.3, cy: 960 },
  { t0: 25.05, t1: 27.9, src: () => "048-lettre", box: [83, 158, 915, 1602], l1: "Sur-mesure.", l2: "Avec son logo.", m: 1.12, cy: 1040 },
];
function liftK(t: number, L: Lift) { return bounce(t, [[L.t0, 0], [L.t0 + 0.38, 1], [L.t1 - 0.28, 1], [L.t1, 0]]); }
function liftGeom(L: Lift, k: number) {
  const [bx, by, bw, bh] = L.box, [sx, sy] = S(bx, by), w = bw * PS, h = bh * PS;
  const m = L.m ?? Math.min(1.5, 960 / w), cy = L.cy ?? sy + h / 2;
  const mm = lerp(1, m, k);
  return { x: lerp(sx, CX - (w * m) / 2, k), y: lerp(sy, cy - (h * m) / 2, k), w: w * mm, h: h * mm, mm, cx: lerp(sx + w / 2, CX, k), cyy: lerp(sy + h / 2, cy, k) };
}

// Clics du curseur : [temps, x, y, appui long ?]
const CLICKS: [number, number, number, number?][] = [
  [1.05, 404, 889], [PT.search, CX, 1150], [PT.cta, CX, 1000], [PT.o2, CX, 980], [PT.n1, ...S(540, 1817)], [PT.o1, CX, 980], [PT.n2, ...S(540, 1817)],
  [PT.n3, ...S(540, 1817)], [11.0, CX, 980], [PT.n4, ...S(540, 1817)], [12.85, CX, 980], [PT.lire, ...S(540, 1817)], [15.2, CX, 900],
  [PT.n5, ...S(540, 1817)], [PT.hold, ...S(540, 1687), 0.75], [PT.gen, CX, 1000],
];
function pointerAt(t: number) {
  let i = CLICKS.findIndex(([ct]) => ct > t);
  if (i === -1) i = CLICKS.length;
  const prev = CLICKS[Math.max(0, i - 1)], nxt = CLICKS[Math.min(CLICKS.length - 1, i)];
  const hold = prev[3] ?? 0;
  const mv = ease(t, Math.max(prev[0] + hold + 0.1, nxt[0] - 0.5), nxt[0] - 0.08);
  const [x, y] = i === 0 || i === CLICKS.length ? [prev[1], prev[2]] : curve(mv, [prev[1], prev[2]], [nxt[1], nxt[2]], [(prev[1] + nxt[1]) / 2 + 160, Math.min(prev[2], nxt[2]) - 120]);
  let press = 0, hover = 0;
  for (const [ct, , , hd] of CLICKS) {
    press = Math.max(press, t >= ct && t <= ct + (hd ?? 0) ? 1 : Math.exp(-Math.pow((t - ct - (hd ?? 0)) / 0.08, 2)));
    hover = Math.max(hover, seg(t, ct - 0.3, ct - 0.12) * (1 - seg(t, ct + (hd ?? 0) + 0.15, ct + (hd ?? 0) + 0.35)));
  }
  return { x, y, press, hover };
}

export const ParcoursSite: React.FC<{ audio?: string }> = ({ audio = "audio/parcours-site.wav" }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;

  // ── caméra du téléphone : entrée du profil, coup de fouet vers le navigateur, vers le site, sortie ──
  const inSite = t >= PT.site && t < PT.flash2;
  const whip = t < PT.browser ? 0 : t < PT.site ? 1 - ease(t, PT.browser, PT.browser + 0.35) : 1 - ease(t, PT.site, PT.site + 0.4);
  const exitK = seg(t, PT.flash2 - 0.25, PT.flash2);
  const drift = Math.sin(t * 0.7) * 3;
  const rY = (t < PT.site && t >= PT.browser ? 1 : 0) * whip * -26 + (t >= PT.site ? whip * -30 : 0) + drift + exitK * 30;
  const rX = 6 + Math.cos(t * 0.5) * 2 + (t < 0.6 ? lerp(18, 0, ease(t, 0, 0.6)) : 0);
  const pS = (t < 0.6 ? lerp(0.85, 1, ease(t, 0, 0.6)) : 1) * lerp(1, 0.9, whip) * lerp(1, 0.8, exitK);
  const pX = whip * 520 - exitK * 520;
  let liftMax = 0;
  for (const L of LIFTS) liftMax = Math.max(liftMax, clamp(liftK(t, L)));
  const browserLift = t > PT.browser && t < PT.site ? ease(t, PT.browser, PT.browser + 0.3) * (1 - seg(t, PT.flash1 - 0.15, PT.flash1)) : 0;
  const linkLift = t > PT.linkLift - 0.02 && t < PT.browser + 0.5 ? ease(t, PT.linkLift, PT.linkLift + 0.35) : 0;
  const dof = Math.max(liftMax, browserLift, linkLift * 0.6);
  const pBlur = whip * 16 + exitK * 18 + dof * 7;
  const src = screenAt(t);
  const sceneT0 = [PT.profil, PT.douleur, PT.reponse, PT.cv, PT.offre, PT.compte, PT.analyse, PT.engage, PT.resultat, PT.ecrit, PT.lettre].filter((a) => a <= t).pop() ?? PT.site;
  const scrK = inSite ? ease(t, sceneT0, sceneT0 + 0.3) : 1;
  const flashK = Math.exp(-Math.pow((t - PT.flash1) / 0.12, 2)) + Math.exp(-Math.pow((t - PT.flash2) / 0.12, 2)) * 1.1 + Math.exp(-Math.pow((t - PT.note) / 0.1, 2)) * 0.45;
  const ptr = pointerAt(t);
  const ptrO = seg(t, 0.75, 0.9) * (1 - seg(t, PT.gen + 0.3, PT.gen + 0.45));
  const endIn = ease(t, PT.end, PT.end + 0.5);

  // titres des cases isolées
  const curLift = LIFTS.find((L) => t >= L.t0 && t < L.t1);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 46%, #3A2327 0%, #1E1719 38%, ${C.bg0} 78%)`, fontFamily: "Poppins", color: C.ink, overflow: "hidden" }}>
      {/* ── le téléphone ── */}
      {t < PT.flash2 + 0.05 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
          <div style={{ position: "absolute", left: SL - 14, top: ST - 14, width: SW + 28, height: SH + 28, borderRadius: 70, background: "#0E0E10", boxShadow: "0 60px 140px rgba(0,0,0,0.65), 0 0 0 2px #2E2E31, 0 0 80px rgba(217,130,139,0.12)", transform: `translateX(${pX}px) rotateY(${rY}deg) rotateX(${rX}deg) scale(${pS})`, filter: `blur(${pBlur}px) brightness(${lerp(1, 0.55, dof)})`, opacity: 1 - seg(t, PT.flash2 - 0.05, PT.flash2 + 0.05) }}>
            <div style={{ position: "absolute", left: 14, top: 14, width: SW, height: SH, borderRadius: 58, overflow: "hidden", background: "#0B0A0B" }}>
              {/* profil TikTok */}
              {t < PT.browser + 0.2 && <Img src={staticFile("shots2/profil.png")} style={{ position: "absolute", left: 0, top: 0, width: SW, height: 2000 * PK }} />}
              {/* navigateur (générique) */}
              {t >= PT.browser && t < PT.site && (
                <div style={{ position: "absolute", inset: 0, background: "#1C1C1E" }}>
                  <div style={{ position: "absolute", left: 30, right: 30, top: 120, fontSize: 30, fontWeight: 700, color: C.soft }}>Favoris</div>
                  {[0, 1, 2, 3].map((i) => <div key={i} style={{ position: "absolute", left: 30 + i * 150, top: 180, width: 120, height: 120, borderRadius: 26, background: C.card }} />)}
                  <div style={{ position: "absolute", left: 24, right: 24, bottom: 60, height: 84, borderRadius: 42, background: C.card, display: "flex", alignItems: "center", padding: "0 28px", fontSize: 26, color: C.soft }}>🔍 Rechercher ou saisir une adresse</div>
                </div>
              )}
              {/* le site */}
              {src && <Img src={P(src)} style={{ position: "absolute", left: (1 - scrK) * 120, top: 0, width: SW, height: SH, opacity: scrK }} />}
            </div>
          </div>
        </div>
      )}

      {/* ── 1. on entoure le lien de la bio ── */}
      {t > PT.circle && t < PT.browser + 0.1 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, PT.linkLift, PT.linkLift + 0.2) }}>
          <path d="M 590 880 C 600 840, 420 836, 260 852 C 190 862, 200 920, 300 928 C 440 940, 600 926, 596 884 C 592 862, 540 850, 500 848" fill="none" stroke={PINK} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - ease(t, PT.circle, PT.circle + 0.6)} style={{ filter: `drop-shadow(0 0 10px ${PINK})` }} />
        </svg>
      )}
      {t < PT.browser - 0.2 && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 170, textAlign: "center", fontSize: 68, fontWeight: 800, lineHeight: 1.1 }}>
          <TextDrop t={t} t0={0.15} text="Le lien est" out={PT.browser - 0.4} /><br /><span style={{ color: PINK }}><TextDrop t={t} t0={0.4} text="dans ma bio." out={PT.browser - 0.4} /></span>
        </div>
      )}
      {/* le lien isolé, qui vole jusqu'à la barre d'adresse */}
      {linkLift > 0.01 && t < PT.type + 0.05 && (() => {
        const fly = ease(t, PT.browser, PT.type);
        const [x0, y0] = [SL + 30 * PK, ST + 612 * PK];
        const sc = lerp(lerp(1, 1.5, linkLift), 1.1, fly);
        const [x, y] = curve(fly, [lerp(x0, CX - 230 * 1.5 * PK, linkLift), lerp(y0, 760, linkLift)], [CX - 230 * 1.1 * PK, 870], [900, 640]);
        return (
          <div style={{ position: "absolute", left: x, top: y, width: 480 * PK * sc, height: 70 * PK * sc, overflow: "hidden", borderRadius: 16, background: "#fff", boxShadow: `0 0 0 4px ${PINK}, 0 20px 60px rgba(0,0,0,0.5), 0 0 50px rgba(217,130,139,0.6)`, opacity: 1 - seg(t, PT.type - 0.1, PT.type + 0.05) }}>
            <Img src={staticFile("shots2/profil.png")} style={{ position: "absolute", left: -30 * PK * sc, top: -612 * PK * sc, width: 923 * PK * sc, height: 2000 * PK * sc }} />
          </div>
        );
      })()}

      {/* ── 2. la barre d'adresse, isolée en grand ── */}
      {browserLift > 0.01 && (
        <div style={{ position: "absolute", inset: 0, opacity: browserLift }}>
          <div style={{ position: "absolute", left: 60, right: 60, top: 190, textAlign: "center", fontSize: 64, fontWeight: 800 }}><TextDrop t={t} t0={PT.browser + 0.15} text="Tu le cherches." out={PT.flash1 - 0.2} /></div>
          <div style={{ position: "absolute", left: CX - 450, top: 860, width: 900, height: 130, borderRadius: 65, background: "#F5F5F7", color: "#1D1D1F", display: "flex", alignItems: "center", gap: 20, padding: "0 40px", fontSize: 42, fontWeight: 600, boxShadow: "0 0 70px rgba(217,130,139,0.45), 0 30px 80px rgba(0,0,0,0.5)", transform: `scale(${bounce(t, [[PT.browser, 0.7], [PT.browser + 0.35, 1]])})`, overflow: "hidden" }}>
            <span style={{ fontSize: 38 }}>🔍</span>
            <TextDrop t={t} t0={PT.type} text="tinyurl.com/try-mymotiv" by="chars" from={[0, 16]} stagger={0.022} dur={0.12} />
            {t > PT.search && <div style={{ position: "absolute", left: 0, bottom: 0, height: 8, width: `${100 * ease(t, PT.search, PT.flash1)}%`, background: PINK }} />}
          </div>
          {t > PT.type + 0.5 && (
            <div style={{ position: "absolute", left: CX - 260, top: 1080, width: 520, height: 120, borderRadius: 60, background: PINK, color: "#fff", fontSize: 46, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${go(t, PT.type + 0.5, PT.type + 0.85, 0, 1) * (1 - 0.08 * Math.exp(-Math.pow((t - PT.search) / 0.08, 2)))})`, boxShadow: "0 18px 50px rgba(217,130,139,0.4)" }}>Rechercher</div>
          )}
        </div>
      )}

      {/* ── cases et boutons isolés ── */}
      {LIFTS.map((L, i) => {
        const k = liftK(t, L);
        if (t < L.t0 || t > L.t1 || k <= 0.002) return null;
        const g = liftGeom(L, k), [bx, by] = L.box;
        const pr = 1 - 0.05 * ptr.press * (Math.abs(ptr.x - g.cx) < g.w / 2 && Math.abs(ptr.y - g.cyy) < g.h / 2 ? 1 : 0);
        return (
          <div key={i} style={{ position: "absolute", left: g.x, top: g.y, width: g.w, height: g.h, borderRadius: 18 * g.mm, overflow: "hidden", boxShadow: `0 0 0 ${3 * k}px rgba(242,184,192,${0.9 * k}), 0 30px 80px rgba(0,0,0,${0.6 * k}), 0 0 ${70 * k}px rgba(217,130,139,${0.55 * k})`, transform: `scale(${pr})`, zIndex: 3 }}>
            <Img src={P(L.src(t))} style={{ position: "absolute", left: -bx * PS * g.mm, top: -by * PS * g.mm, width: SW * g.mm, height: SH * g.mm }} />
          </div>
        );
      })}
      {/* le fichier CV qui tombe dans la zone */}
      {t > 11.05 && t < 11.6 && <div style={{ position: "absolute", left: CX - 230, top: lerp(560, 930, ease(t, 11.05, 11.4)), width: 460, height: 120, borderRadius: 30, background: C.card, border: `3px solid ${PINK}`, display: "flex", alignItems: "center", gap: 18, padding: "0 28px", fontSize: 34, fontWeight: 700, zIndex: 4, opacity: 1 - seg(t, 11.45, 11.6), boxShadow: "0 30px 70px rgba(0,0,0,0.55)" }}>📄 CV_Camille_Dubois.pdf</div>}
      {/* « C'est noté » */}
      {t > PT.note - 0.05 && t < PT.resultat && <div style={{ position: "absolute", left: CX - 300, top: 900, width: 600, height: 150, borderRadius: 75, background: PINK, color: "#fff", fontSize: 58, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${bounce(t, [[PT.note, 0.4], [PT.note + 0.35, 1]])})`, opacity: 1 - seg(t, PT.resultat - 0.2, PT.resultat), boxShadow: "0 0 80px rgba(217,130,139,0.6)", zIndex: 4 }}>C'est noté ✓</div>}
      {/* chrono pendant l'écriture et sur la lettre */}
      {t > 24.0 && t < 27.8 && <div style={{ position: "absolute", left: CX - 170, top: 1540, width: 340, height: 100, borderRadius: 50, background: PINK, color: "#fff", fontSize: 44, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 5, transform: `scale(${go(t, 24.0, 24.35, 0, 1)})`, opacity: 1 - seg(t, 27.6, 27.8), fontVariantNumeric: "tabular-nums" }}>{t < PT.lettre ? `⏱ ${Math.round(30 * seg(t, 24.0, PT.lettre))} s*` : "≈ 30 s* ✓"}</div>}
      {t > 24.0 && t < 27.8 && <div style={{ position: "absolute", left: 0, right: 0, top: 1660, textAlign: "center", fontSize: 26, color: C.soft, fontFamily: "Open Sans", zIndex: 5, opacity: 1 - seg(t, 27.6, 27.8) }}>* temps mesuré : 27 à 35 s par lettre</div>}

      {/* titres */}
      {curLift?.l1 && (
        <div key={curLift.t0} style={{ position: "absolute", left: 50, right: 50, top: 180, textAlign: "center", fontSize: 66, fontWeight: 800, lineHeight: 1.12, zIndex: 6 }}>
          <TextDrop t={t} t0={curLift.t0 + 0.05} text={curLift.l1} out={curLift.t1 - 0.2} />
          {curLift.l2 && <><br /><span style={{ color: PINK, fontSize: 52 }}><TextDrop t={t} t0={curLift.t0 + 0.3} text={curLift.l2} out={curLift.t1 - 0.2} /></span></>}
        </div>
      )}

      {/* curseur MyMotiv */}
      {ptrO > 0 && <div style={{ position: "absolute", inset: 0, zIndex: 7 }}><Pointer x={ptr.x} y={ptr.y} hover={ptr.hover} press={ptr.press} o={ptrO} /></div>}

      {/* ── fin : bulles, icône, pilule noire, slogan ── */}
      {t > PT.end - 0.05 && (
        <div style={{ position: "absolute", inset: 0, opacity: endIn }}>
          <Bubbles t={t} t0={PT.end} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1035, height: 4, background: `linear-gradient(90deg, rgba(217,130,139,0), ${PINK_L}, rgba(217,130,139,0))`, boxShadow: `0 0 30px ${PINK}`, transform: `scaleX(${ease(t, PT.end + 0.1, PT.end + 0.6)})` }} />
          <div style={{ position: "absolute", left: CX - 330, top: 820, width: 660, height: 180, borderRadius: 90, background: "linear-gradient(180deg, #2A2A2D 0%, #0B0A0B 55%, #000 100%)", boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.25), 0 0 0 2px #3A3A3C", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${bounce(t, [[PT.end, 0.6], [PT.end + 0.35, 1]])})` }}>
            <Img src={staticFile("logo-mymotiv.png")} style={{ width: 430, opacity: seg(t, PT.end + 0.15, PT.end + 0.35) }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontSize: 50, fontWeight: 800, lineHeight: 1.2 }}>
            <TextDrop t={t} t0={PT.end + 0.3} text="Avec MyMotiv, postulez." from={[0, -50]} /><br />
            <span style={{ color: PINK }}><TextDrop t={t} t0={PT.end + 0.6} text="Et faites-vous recruter." from={[0, -50]} /></span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", fontSize: 44, fontWeight: 700, color: PINK_L }}>
            <TextDrop t={t} t0={PT.end + 1.0} text="Ta 1re lettre est offerte" by="chars" from={[0, 20]} stagger={0.025} dur={0.2} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center", fontSize: 38, fontWeight: 600, color: C.soft }}>
            <TextDrop t={t} t0={PT.end + 1.7} text="Lien en bio ↑" from={[0, 30]} />
          </div>
        </div>
      )}

      {/* flashs */}
      {flashK > 0.01 && <div style={{ position: "absolute", inset: 0, zIndex: 8, background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.95 * clamp(flashK)}) 0%, rgba(242,184,192,${0.8 * clamp(flashK)}) 30%, rgba(217,130,139,${0.35 * clamp(flashK)}) 60%, rgba(0,0,0,0) 85%)` }} />}
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
