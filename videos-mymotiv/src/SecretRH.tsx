// « Les RH ne veulent pas que vous sachiez ça mais blc » (≈42 s, 30 i/s, 9:16) — même accroche qu'une vidéo de référence
// envoyée par le propriétaire (une créatrice masquée qui montre un outil de candidature), en version MyMotiv et honnête :
// Yann masqué (ses vraies photos, public/yann/), qui a vraiment travaillé dans le recrutement, montre le vrai parcours du
// site (captures public/parcours/). Le texte d'accroche reste en haut pendant toute la vidéo, comme sur TikTok.
// 1. Yann : « j'ai bossé dans le recrutement… je vais vous montrer » → 2. une offre (navigateur générique, entreprise
// inventée Maison Lumen), on copie le lien → 3. MyMotiv : CV une seule fois, on colle le lien → l'analyse (besoins,
// mots-clés, ce que le CV a déjà) → la lettre en 30 s* (+ CV adapté en option) → 4. Yann : « le secret : ce qui sort de la
// pile, c'est ce qui colle à l'offre » → 1re lettre offerte → CTA « les RH en commentaire… dites-leur la vérité ».
// Pas d'affirmation inventée (aucun « les RH ne lisent pas les CV », aucun chiffre) ; mention « * temps mesuré ».
// Voix : voix-secretrh.json (--voix yann). Son : synth_secretrh.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce, go } from "./apple";
import { PINK, clamp, lerp, seg } from "./common";
import voix from "./data/secretrh-voix.json";
import { makeCaption } from "./FauxDM";
import { Pointer } from "./Lien";
import { GLOW_BG, ease } from "./motion";
import { CAP_BOX, X } from "./pixelTT";
import "./fonts";

export const SECRETRH_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const sc = (i: number) => PH[i][0] - 0.15;                                       // début de la scène de la phrase i
const HOT = new Set(["rh", "recrutement", "montrer", "lien", "mymotiv", "cv", "besoins", "motscles", "secondes", "lettre", "preuves", "secret",
  "pile", "offre", "vite", "offerte", "bio", "verite", "commentaire"]);
const Caption = makeCaption(voix, HOT, CAP_BOX, PINK);
const INK = "#0B0A0B";

// ─── le texte d'accroche, blanc cerné de noir (style texte TikTok), en haut pendant toute la vidéo ───
const CONTOUR = [[-3, -3], [3, -3], [-3, 3], [3, 3], [0, 4], [0, -4], [4, 0], [-4, 0]].map(([x, y]) => `${x}px ${y}px 0 #000`).join(", ") + ", 0 0 14px rgba(0,0,0,0.7)";
const Accroche: React.FC = () => (
  <div style={{ position: "absolute", left: 120, width: 800, top: 300, textAlign: "center", fontFamily: "Poppins", fontWeight: 800, fontSize: 45, lineHeight: 1.12, color: "#fff", textShadow: CONTOUR, zIndex: 30, letterSpacing: -0.5 }}>
    LES RH NE VEULENT PAS QUE<br />VOUS SACHIEZ ÇA MAIS BLC
  </div>
);

// ─── une étiquette façon texte TikTok (fond plein, coins arrondis) qui apparaît avec un petit rebond ───
const Sticker: React.FC<{ t: number; a: number; b?: number; y: number; text: string; bg?: string; color?: string; size?: number; barre?: boolean }> = ({ t, a, b = 99, y, text, bg = "#fff", color = "#000", size = 46, barre }) => {
  if (t < a || t >= b) return null;
  return (
    <div style={{ position: "absolute", left: X, top: y, transform: `translate(-50%, -50%) scale(${bounce(t, [[a, 0.6], [a + 0.25, 1]], 0.08)})`, zIndex: 25 }}>
      <div style={{ position: "relative", padding: "10px 24px", borderRadius: 16, background: bg, color, fontFamily: "Poppins", fontWeight: 800, fontSize: size, lineHeight: 1.15, whiteSpace: "pre", textAlign: "center", boxShadow: "0 10px 30px rgba(0,0,0,0.45)" }}>
        {text}
        {barre && <div style={{ position: "absolute", left: 14, right: 14, top: "52%", height: 7, borderRadius: 4, background: "#E8262B", transformOrigin: "0 50%", transform: `scaleX(${ease(t, a + 0.25, a + 0.5)})` }} />}
      </div>
    </div>
  );
};

// ─── Yann masqué qui parle : une pose par morceau de phrase, coupe sèche avec un léger zoom (comme un face caméra) ───
const POSES: [number, string][] = [
  [-1, "g2-affirmer"], [at(6), "g2-argumenter"], [at(16), "g1-conclure"],
  [sc(5), "emo-reflexion"], [at(105), "g1-debattre"], [at(115), "g2-insister"], [at(130), "emo-degout"],
  [sc(6), "g1-expliquer"], [at(136), "emo-confusion"], [at(148), "emo-joie"], [sc(7), "g2-raconter"],
];
const Yann: React.FC<{ t: number }> = ({ t }) => {
  let k = 0;
  POSES.forEach(([a], i) => { if (t >= a) k = i; });
  const zoom = k % 2 ? 1.1 : 1, bob = Math.sin(t * 2.1) * 4, rot = Math.sin(t * 1.3) * 0.6;
  return (
    <div style={{ position: "absolute", left: X - 430, top: 440, width: 860, height: 960, transform: `translateY(${bob}px) rotate(${rot}deg) scale(${zoom})`, transformOrigin: "50% 22%" }}>
      <Img src={staticFile(`yann/${POSES[k][1]}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 100%", WebkitMaskImage: "linear-gradient(to bottom, #000 72%, rgba(0,0,0,0) 97%)", maskImage: "linear-gradient(to bottom, #000 72%, rgba(0,0,0,0) 97%)" }} />
    </div>
  );
};

// ─── 2. l'offre dans un navigateur générique, « filmé » en biais ; on copie le lien ───
const ADRESSE = "carrieres.maison-lumen.fr/offre/manager-ventes";
const Navigateur: React.FC<{ t: number }> = ({ t }) => {
  const t0 = sc(1), inK = ease(t, t0, t0 + 0.4), copie = 7.35;
  const px = t < 6.9 ? 640 : lerp(640, 300, ease(t, 6.9, 7.3)), py = t < 6.9 ? 520 : lerp(520, 52, ease(t, 6.9, 7.3));
  const press = Math.exp(-Math.pow((t - copie) / 0.08, 2)), hover = seg(t, 7.1, 7.3);
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
      <div style={{ position: "absolute", left: 120, top: 540, width: 800, height: 600, borderRadius: 22, overflow: "hidden", background: "#F7F7F8", boxShadow: "0 50px 120px rgba(0,0,0,0.6), 0 0 0 3px #2C2C2E",
        transform: `translateX(${(1 - inK) * 300}px) rotateX(${10 + Math.sin(t * 0.8) * 1.5}deg) rotateY(${lerp(28, -7, inK) + Math.sin(t * 0.6) * 2}deg) rotateZ(-2deg)`, filter: `blur(${(1 - inK) * 14}px)`, fontFamily: "Open Sans", color: "#1D1D1F" }}>
        {/* barre du navigateur */}
        <div style={{ height: 104, background: "#E9E9EC", display: "flex", alignItems: "center", gap: 12, padding: "0 20px" }}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />)}
          <div style={{ flex: 1, marginLeft: 12, height: 60, borderRadius: 30, background: "#fff", display: "flex", alignItems: "center", padding: "0 22px", fontSize: 24, whiteSpace: "nowrap", overflow: "hidden" }}>
            <span style={{ marginRight: 10 }}>🔒</span>
            <span style={{ background: t >= copie ? "#B4D5FE" : "transparent", padding: "2px 0" }}>{ADRESSE}</span>
          </div>
        </div>
        {/* l'offre (entreprise inventée) */}
        <div style={{ padding: "34px 40px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 14, background: "#2D3A4A", color: "#fff", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>ML</div>
            <div style={{ fontSize: 30, fontWeight: 700 }}>Maison Lumen</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 22 }}>
            <div style={{ fontFamily: "Poppins", fontSize: 46, fontWeight: 800 }}>Manager des ventes (H/F)</div>
            <div style={{ fontSize: 50, color: t >= at(28) ? PINK : "#C7C7CC", transform: `scale(${t >= at(28) ? bounce(t, [[at(28), 1.6], [at(28) + 0.3, 1]], 0.1) : 1})` }}>♥</div>
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 18 }}>
            {["CDI", "Temps plein", "Magasin"].map((c) => <div key={c} style={{ padding: "6px 18px", borderRadius: 20, background: "#E9E9EC", fontSize: 24, fontWeight: 600 }}>{c}</div>)}
          </div>
          {[0.95, 0.8, 0.9, 0.6].map((w, j) => <div key={j} style={{ height: 16, width: `${w * 100}%`, borderRadius: 8, marginTop: j ? 16 : 34, background: "#DADADF" }} />)}
          <div style={{ marginTop: 34, width: 220, height: 66, borderRadius: 33, background: "#1F2328", color: "#fff", fontSize: 28, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>Postuler</div>
        </div>
        {/* « lien copié » */}
        {t >= copie + 0.1 && <div style={{ position: "absolute", left: 400, top: 140, transform: `translateX(-50%) scale(${bounce(t, [[copie + 0.1, 0.6], [copie + 0.35, 1]], 0.08)})`, padding: "12px 28px", borderRadius: 30, background: "#1F2328", color: "#fff", fontSize: 30, fontWeight: 700, whiteSpace: "nowrap" }}>Lien copié ✓</div>}
        {t >= 6.75 && <Pointer x={px} y={py} hover={hover} press={press} o={1 - seg(t, 7.8, 8.0)} />}
      </div>
    </div>
  );
};

// ─── 3. le vrai site dans le téléphone : captures enchaînées et cases « isolées » ───
const PS = 0.6, SL = X - 324, ST = 440, SW = 1080 * PS, SH = 1920 * PS;
const P = (n: string) => staticFile(`parcours/${n}.png`);
type Box = [number, number, number, number];
const T_GEN = 18.62;                                                              // clic sur « Générer ma lettre offerte »
function ecran(t: number): string {
  if (t < at(38)) return "001-accueil";
  if (t < at(45)) return t < 10.55 ? "007-cv" : "008-cv-ajoute";
  if (t < sc(3)) return t < 11.7 ? "009-offre" : `0${10 + Math.min(6, Math.floor(seg(t, 11.7, 12.35) * 6.999))}-offre-lien`;
  if (t < 13.0) return "017-offre-lecture";
  if (t < 15.45) return `0${20 + Math.min(7, Math.floor(seg(t, 13.0, 14.5) * 7.999))}-analyse`;
  if (t < T_GEN + 0.15) return "034-resultat";
  if (t < 19.75) return `0${36 + Math.min(11, Math.floor(seg(t, T_GEN + 0.15, 19.7) * 11.999))}-generation`;
  if (t < at(93)) return "048-lettre";
  return "035-resultat-bas";
}
type Lift = { t0: number; t1: number; src: (t: number) => string; box: Box; m: number; cy: number; titre?: string };
const LIFTS: Lift[] = [
  { t0: 8.25, t1: 9.55, src: () => "001-accueil", box: [40, 675, 1000, 298], m: 1.25, cy: 860 },
  { t0: 9.65, t1: 11.4, src: ecran, box: [40, 568, 1000, 389], m: 1.25, cy: 860, titre: "1. TON CV, UNE FOIS" },
  { t0: 11.45, t1: 12.6, src: ecran, box: [40, 623, 1000, 142], m: 1.3, cy: 860, titre: "2. LE LIEN DE L'OFFRE" },
  { t0: 13.05, t1: 15.4, src: ecran, box: [40, 690, 1000, 650], m: 1.15, cy: 860, titre: "3. IL LIT L'OFFRE" },
  { t0: 15.5, t1: 16.45, src: () => "034-resultat", box: [40, 943, 1000, 258], m: 1.3, cy: 860, titre: "LES MOTS-CLÉS" },
  { t0: 16.5, t1: 18.25, src: () => "034-resultat", box: [40, 573, 1000, 340], m: 1.3, cy: 860, titre: "CE QUE TON CV A DÉJÀ" },
  { t0: 18.3, t1: 18.9, src: () => "034-resultat", box: [40, 1750, 1000, 135], m: 1.3, cy: 900 },
  { t0: 19.8, t1: 22.3, src: () => "048-lettre", box: [83, 158, 915, 1000], m: 1.1, cy: 870 },
  { t0: 22.4, t1: 24.4, src: () => "035-resultat-bas", box: [40, 543, 1000, 674], m: 1.15, cy: 870, titre: "+ TON CV ADAPTÉ (OPTION)" },
];
const liftK = (t: number, L: Lift) => bounce(t, [[L.t0, 0], [L.t0 + 0.38, 1], [L.t1 - 0.28, 1], [L.t1, 0]]);
function geom(L: Lift, k: number) {
  const [bx, by, bw, bh] = L.box, sx = SL + bx * PS, sy = ST + by * PS, w = bw * PS, h = bh * PS, mm = lerp(1, L.m, k);
  return { x: lerp(sx, X - (w * L.m) / 2, k), y: lerp(sy, L.cy - (h * L.m) / 2, k), w: w * mm, h: h * mm, mm };
}
// clics du curseur dans la démo : [apparition, clic, disparition, x, y]
const CLICS: [number, number, number, number, number][] = [[11.15, 11.55, 12.3, X + 40, 880], [18.25, T_GEN, 18.95, X + 40, 915]];

const Telephone: React.FC<{ t: number }> = ({ t }) => {
  const t0 = sc(2), t1 = sc(5), inK = ease(t, t0, t0 + 0.4), outK = ease(t, t1 - 0.3, t1);
  let dof = 0;
  for (const L of LIFTS) if (t >= L.t0 && t <= L.t1) dof = Math.max(dof, clamp(liftK(t, L)));
  const rY = lerp(30, 0, inK) - outK * 30 + Math.sin(t * 0.7) * 3, rX = 6 + Math.cos(t * 0.5) * 2;
  const cur = LIFTS.find((L) => t >= L.t0 && t < L.t1);
  const chrono = t >= at(78) && t < 22.3;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, perspective: 1800 }}>
        <div style={{ position: "absolute", left: SL - 14, top: ST - 14, width: SW + 28, height: SH + 28, borderRadius: 70, background: "#0E0E10", boxShadow: "0 60px 140px rgba(0,0,0,0.65), 0 0 0 2px #2E2E31, 0 0 80px rgba(217,130,139,0.12)",
          transform: `translateX(${(1 - inK) * 400 - outK * 520}px) rotateY(${rY}deg) rotateX(${rX}deg) scale(${lerp(0.82, 1, inK) * lerp(1, 0.85, outK)})`, filter: `blur(${(1 - inK) * 16 + outK * 16 + dof * 7}px) brightness(${lerp(1, 0.5, dof)})` }}>
          <div style={{ position: "absolute", left: 14, top: 14, width: SW, height: SH, borderRadius: 58, overflow: "hidden", background: INK }}>
            <Img src={P(ecran(t))} style={{ position: "absolute", left: 0, top: 0, width: SW, height: SH }} />
          </div>
        </div>
      </div>
      {LIFTS.map((L, i) => {
        const k = liftK(t, L);
        if (t < L.t0 || t > L.t1 || k <= 0.002) return null;
        const g = geom(L, k), [bx, by] = L.box;
        return (
          <div key={i} style={{ position: "absolute", left: g.x, top: g.y, width: g.w, height: g.h, borderRadius: 18 * g.mm, overflow: "hidden", zIndex: 5,
            boxShadow: `0 0 0 ${3 * k}px rgba(242,184,192,${0.9 * k}), 0 30px 80px rgba(0,0,0,${0.6 * k}), 0 0 ${70 * k}px rgba(217,130,139,${0.55 * k})`,
            transform: `scale(${1 - 0.05 * Math.exp(-Math.pow((t - T_GEN) / 0.08, 2)) * (i === 6 ? 1 : 0)})` }}>
            <Img src={P(L.src(t))} style={{ position: "absolute", left: -bx * PS * g.mm, top: -by * PS * g.mm, width: SW * g.mm, height: SH * g.mm }} />
          </div>
        );
      })}
      {cur?.titre && (
        <div key={cur.t0} style={{ position: "absolute", left: X, top: 520, transform: `translate(-50%, -50%) scale(${bounce(t, [[cur.t0 + 0.05, 0.6], [cur.t0 + 0.3, 1]], 0.08)})`, opacity: 1 - seg(t, cur.t1 - 0.25, cur.t1 - 0.05), zIndex: 6,
          padding: "10px 26px", borderRadius: 40, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: 40, whiteSpace: "nowrap", boxShadow: "0 0 40px rgba(217,130,139,0.5)" }}>{cur.titre}</div>
      )}
      {/* chrono pendant l'écriture et sur la lettre, avec la mention du temps mesuré */}
      {chrono && (
        <div style={{ position: "absolute", left: X, top: 485, transform: `translate(-50%, -50%) scale(${go(t, at(78), at(78) + 0.3, 0, 1)})`, padding: "12px 34px", borderRadius: 50, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: 44, zIndex: 7, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {t < 19.75 ? `⏱ ${Math.round(30 * seg(t, at(78), 19.75))} s*` : "≈ 30 s* ✓"}
        </div>
      )}
      {chrono && <div style={{ position: "absolute", left: X, top: 1405, transform: "translate(-50%, -50%)", padding: "4px 16px", borderRadius: 12, background: "rgba(11,10,11,0.8)", fontFamily: "Open Sans", fontSize: 28, color: "#D9D2D4", zIndex: 16, whiteSpace: "nowrap" }}>* temps mesuré : 27 à 35 s par lettre</div>}
      {CLICS.map(([a, c, b, x, y]) => t >= a && t < b && (
        <div key={c} style={{ position: "absolute", inset: 0, zIndex: 8 }}>
          <Pointer x={lerp(x + 200, x, ease(t, a, c - 0.1))} y={lerp(y + 260, y, ease(t, a, c - 0.1))} hover={seg(t, c - 0.3, c - 0.1)} press={Math.exp(-Math.pow((t - c) / 0.08, 2))} o={seg(t, a, a + 0.15) * (1 - seg(t, b - 0.15, b))} />
        </div>
      ))}
    </>
  );
};

export const SecretRH: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const demo = t >= sc(1) && t < sc(5);
  return (
    <AbsoluteFill style={{ background: GLOW_BG, overflow: "hidden" }}>
      {!demo && <Yann t={t} />}
      {t >= sc(1) && t < sc(2) && <Navigateur t={t} />}
      {t >= sc(2) && t < sc(5) && <Telephone t={t} />}
      {/* pendant la démo, le bas de l'écran s'assombrit pour que les sous-titres restent lisibles sur le téléphone */}
      {demo && <div style={{ position: "absolute", left: 0, right: 0, top: 1120, height: 420, background: "linear-gradient(to bottom, rgba(11,10,11,0), rgba(11,10,11,0.88) 35%, rgba(11,10,11,0.88) 80%, rgba(11,10,11,0))", zIndex: 15 }} />}
      {/* le grain et le vignettage d'une vidéo filmée */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.55) 100%)", zIndex: 20 }} />
      {/* étiquettes de Yann */}
      <Sticker t={t} a={at(112)} b={at(124)} y={1090} text="ON TRIE VITE." />
      <Sticker t={t} a={at(124)} b={at(130)} y={1090} text="CE QUI COLLE À L'OFFRE ✓" bg={PINK} color="#fff" />
      <Sticker t={t} a={at(130)} b={sc(6)} y={1090} text="LES GRANDES PHRASES" barre />
      <Sticker t={t} a={at(148)} b={sc(7)} y={1010} text="1RE LETTRE OFFERTE" bg={PINK} color="#fff" />
      <Sticker t={t} a={at(151)} b={sc(7)} y={1115} text="LIEN EN BIO ↑" size={42} />
      <Sticker t={t} a={at(155)} y={1070} text={"RH EN COMMENTAIRE :\nDITES LA VÉRITÉ ↓"} size={44} />
      <Accroche />
      <div style={{ position: "absolute", inset: 0, zIndex: 40 }}><Caption t={t} /></div>
      <Audio src={staticFile("audio/secretrh.wav")} />
    </AbsoluteFill>
  );
};
