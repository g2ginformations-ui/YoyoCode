// Pub « tout en un » qui convertit (≈32 s, 30 i/s, 9:16) : tous les leviers de vente dans une seule vidéo, pour la cible
// principale (marketing/persona.md : Lina, 19 ans, cherche son alternance, postule le soir sur son téléphone).
// 1. Accroche qui l'interpelle (« Tu cherches une alternance ? »), visible dès l'image 0 → 2. le problème (la même lettre
// pour tout le monde, avec « [NOM DE L'ENTREPRISE] » oublié ; ou toute la soirée à écrire) → 3. la démo sur le VRAI site,
// filmée comme un enregistrement d'écran de téléphone (captures public/tuto-tel/, capture/capture-tuto.mjs en MOBILE=1) :
// CV en photo, lien de l'offre, analyse, score, lettre en 30 s* avec le logo et les vraies preuves → 4. la preuve : le
// témoignage réel de Léni S. avec sa mention → 5. l'offre : 1re lettre offerte, sans carte bancaire, puis le prix de
// lettre-ia/lib/pricing.ts avec le CV adapté → 6. « Lien en bio, teste-la ce soir ».
// ⚠️ Le prix est aussi DIT par la voix (voix-tout.json, ligne y5) : s'il change, régénérer cette ligne.
// Voix : voix-tout.json (--voix yann). Son : synth_tout.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PLANS } from "../../lettre-ia/lib/pricing";
import BOXES from "../public/tuto-tel/boxes.json";
import { bounce } from "./apple";
import { PINK, PINK_L, clamp, easeInOut, lerp, seg } from "./common";
import voix from "./data/tout-voix.json";
import { makeCaption } from "./FauxDM";
import { Chrome, INK, K, Mot, fit } from "./kinetic";
import { GLOW_BG } from "./motion";
import { CAP_BOX } from "./pixelTT";
import { FinOfferte, Mention, X, horloge } from "./pubMotion";
import "./fonts";

export const TOUT_DUR = voix.duration;
const { PH, at, sc } = horloge(voix);
const HOT = new Set(["alternance", "candidature", "soiree", "mymotiv", "cv", "photo", "lien", "trente", "secondes", "lettre", "preuves",
  "leni", "onze", "sept", "entretiens", "offerte", "199", "adapte", "bio", "soir"]);
const Caption = makeCaption(voix, HOT, CAP_BOX, PINK);
const EMOJI = "'Noto Color Emoji'";
const PRIX = PLANS.letter.price;

type Box = [number, number, number, number];
const BX = BOXES as unknown as Record<string, Record<string, Box>>;
const ctr = (img: string, k: string): [number, number] => { const b = BX[img][k]; return [b[0] + b[2] / 2, b[1] + b[3] / 2]; };

// ─── les temps clés ───
const T_PB = sc(1), T_DEMO = sc(2), T_LIEN = sc(3), T_PREUVE = sc(4), T_OFFRE = sc(5), T_FIN = sc(6);
const T_ACC = at(4);                                      // « Regarde » : l'écran s'allume
const T_TAP_CTA = at(11) + 0.05;                          // « Lancer une candidature gratuite »
const T_HORLOGE = at(23) - 0.05;                          // « Mais en écrire une par offre »
const T_TAP_CV = at(39) - 0.05, T_PHOTO = T_TAP_CV + 0.45, T_LU = at(46) + 0.1;
const T_TAP_INPUT = at(48) - 0.1, T_COLLER = T_TAP_INPUT + 0.35, T_ANALYSE = at(54) - 0.1, T_SCORE = at(57) + 0.15, T_LETTRE = at(61) - 0.1;
const T_APRES = at(84) - 0.1;

// ─── l'enregistrement d'écran du téléphone : quelle capture, et la « caméra » (zoom) ───
const F = (n: number, nom: string) => `${String(n).padStart(3, "0")}-${nom}`;
const LECTURE = [4, 5, 6, 7, 8, 9].map((n) => F(n, "cv-lecture"));
const ANALYSE = [17, 18, 19, 20, 21, 22, 23, 24, 25].map((n) => F(n, "analyse"));
const pick = (list: string[], t: number, a: number, b: number) => list[Math.min(list.length - 1, Math.floor(seg(t, a, b) * list.length))];
function capture(t: number): string {
  if (t < T_PB) return "001-accueil";
  if (t < T_PHOTO + 0.3) return "002-cv";
  if (t < T_LU) return pick(LECTURE, t, T_PHOTO + 0.3, T_LU);
  if (t < T_LIEN) return "013-cv-lu";
  if (t < T_COLLER + 0.05) return "014-offre";
  if (t < T_ANALYSE) return "015-offre-collee";
  if (t < T_SCORE) return pick(ANALYSE, t, T_ANALYSE, T_SCORE);
  if (t < T_LETTRE) return "026-resultat";
  return "040-lettre";
}
type Cle = [number, number, number, number, number];       // [début, x, y, zoom, durée] en pixels de capture
const CAM: Cle[] = [
  [-1, 530, 880, 1, 0], [T_ACC, 540, 830, 1.16, 0.5], [at(9) - 0.1, 540, 1290, 1.1, 0.5],
  [T_DEMO, 540, 700, 1.1, 0], [T_PHOTO + 0.2, 540, 738, 1.12, 0.4],
  [T_LIEN, 540, 660, 1.08, 0], [T_ANALYSE, 540, 1000, 1.05, 0], [T_SCORE, 540, 790, 1.06, 0], [T_LETTRE, 540, 640, 1.06, 0], [at(66), 540, 700, 1.08, 1.0],
];
function camera(t: number) {
  let k = 0;
  CAM.forEach((c, i) => { if (t >= c[0]) k = i; });
  const cur = CAM[k], prev = CAM[Math.max(0, k - 1)];
  const e = cur[4] > 0 ? easeInOut(seg(t, cur[0], cur[0] + cur[4])) : 1;
  return { fx: lerp(prev[1], cur[1], e), fy: lerp(prev[2], cur[2], e), z: lerp(prev[3], cur[3], e) };
}
const TAPS: [number, number, number][] = [
  [T_TAP_CTA, ...ctr("001-accueil", "cta")], [T_TAP_CV, ...ctr("002-cv", "drop")], [T_TAP_INPUT, 540, ctr("014-offre", "input")[1]],
  [T_COLLER, 300, ctr("014-offre", "input")[1] - 120],
];
// une touche à l'écran (cercle blanc translucide, comme l'option « afficher les touches » d'un enregistrement d'écran)
const Touche: React.FC<{ t: number; a: number; x: number; y: number }> = ({ t, a, x, y }) => {
  if (t < a - 0.2 || t > a + 0.45) return null;
  const k = Math.exp(-Math.pow((t - a) / 0.09, 2));
  const o = seg(t, a - 0.2, a - 0.1) * (1 - seg(t, a + 0.25, a + 0.45));
  return <div style={{ position: "absolute", left: x - 55, top: y - 55, width: 110, height: 110, borderRadius: 55, background: "rgba(255,255,255,0.35)", border: "4px solid rgba(255,255,255,0.85)", transform: `scale(${1 - 0.2 * k})`, opacity: o, boxShadow: "0 0 30px rgba(0,0,0,0.4)", zIndex: 6 }} />;
};
// un cadre rose (dans l'écran) autour d'une zone
const Cadre: React.FC<{ t: number; a: number; b: number; r: Box; marker?: boolean }> = ({ t, a, b, r, marker }) => {
  if (t < a || t > b) return null;
  const o = seg(t, a, a + 0.1) * (1 - seg(t, b - 0.15, b));
  if (marker) return <div style={{ position: "absolute", left: r[0], top: r[1], width: r[2] * ease(t, a, a + 0.3), height: r[3], background: "rgba(217,130,139,0.42)", borderRadius: 8, opacity: o, zIndex: 4 }} />;
  return <div style={{ position: "absolute", left: r[0] - 10, top: r[1] - 10, width: r[2] + 20, height: r[3] + 20, borderRadius: 26, border: `7px solid ${PINK}`, boxShadow: `0 0 34px ${PINK}`, opacity: o, transform: `scale(${bounce(t, [[a, 1.15], [a + 0.25, 1]], 0.08)})`, zIndex: 5 }} />;
};
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));

const Ecran: React.FC<{ t: number }> = ({ t }) => {
  const { fx, fy, z } = camera(t);
  // on ne sort jamais de l'écran sur les côtés ni en bas ; en haut, le fond sombre du site se confond avec le noir
  const left = clamp(530 - fx * z, 1080 - 1080 * z, 0), top = Math.max(880 - fy * z, 1920 - 1920 * z);
  const allume = t < T_PB ? 0.25 + 0.75 * seg(t, T_ACC - 0.1, T_ACC + 0.3) : 1;
  const [dzx, dzy] = ctr("002-cv", "drop");
  const kp = ease(t, T_TAP_CV + 0.15, T_PHOTO);
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <div style={{ position: "absolute", left, top, width: 1080, height: 1920, transformOrigin: "0 0", transform: `scale(${z})`, filter: `brightness(${allume}) blur(${t < T_PB ? 16 * (1 - seg(t, T_ACC - 0.1, T_ACC + 0.3)) : 0}px)` }}>
        <Img src={staticFile(`tuto-tel/${capture(t)}.jpg`)} style={{ width: 1080, height: 1920 }} />
        {/* la photo du CV choisie dans la galerie, qui file vers la zone */}
        {t >= T_TAP_CV + 0.15 && t < T_PHOTO + 0.3 && (
          <div style={{ position: "absolute", left: lerp(760, dzx - 70, kp), top: lerp(2000, dzy - 90, kp), width: 140, height: 180, borderRadius: 10, transform: `rotate(${lerp(14, -6, kp)}deg) scale(${1 - 0.6 * seg(t, T_PHOTO, T_PHOTO + 0.3)})`,
            background: "linear-gradient(160deg, #F7F3EC, #E2DACE)", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", padding: "18px 14px", boxSizing: "border-box", zIndex: 7 }}>
            {[0.7, 0.9, 0.6, 0.85, 0.5, 0.75].map((w, i) => <div key={i} style={{ width: `${w * 100}%`, height: 7, background: "#8F897F", borderRadius: 3, marginTop: i ? 13 : 0 }} />)}
          </div>
        )}
        {/* bulle « Coller » au-dessus du champ du lien */}
        {t >= T_TAP_INPUT + 0.12 && t < T_COLLER + 0.2 && (
          <div style={{ position: "absolute", left: 220, top: ctr("014-offre", "input")[1] - 165, padding: "16px 34px", borderRadius: 18, background: "#2C2C2E", color: "#fff", fontFamily: "Open Sans", fontWeight: 600, fontSize: 38,
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)", transform: `scale(${bounce(t, [[T_TAP_INPUT + 0.12, 0.7], [T_TAP_INPUT + 0.3, 1]], 0.06)})`, zIndex: 7 }}>Coller</div>
        )}
        <Cadre t={t} a={at(42) - 0.1} b={T_LU} r={BX["004-cv-lecture"].reading} />
        <Cadre t={t} a={T_SCORE + 0.05} b={T_LETTRE} r={BX["026-resultat"].score} />
        <Cadre t={t} a={at(62) - 0.1} b={at(66)} r={[100, 368, 880, 116]} />
        <Cadre t={t} a={at(68) - 0.15} b={T_PREUVE} r={[598, 812, 318, 54]} marker />
        <Cadre t={t} a={at(68) - 0.05} b={T_PREUVE} r={[146, 878, 108, 54]} marker />
        {TAPS.map(([a, x, y]) => <Touche key={a} t={t} a={a} x={x} y={y} />)}
      </div>
    </AbsoluteFill>
  );
};

// ─── étiquettes : l'étape (blanche, en haut) et la fonction (rose, sous l'écran) ───
const Pilule: React.FC<{ t: number; a: number; b: number; y: number; text: string; n?: string; rose?: boolean; size?: number; tag?: string }> = ({ t, a, b, y, text, n, rose, size = 46, tag }) => {
  if (t < a || t >= b) return null;
  return (
    <div style={{ position: "absolute", left: X, top: y, transform: `translate(-50%, -50%) scale(${bounce(t, [[a, 0.6], [a + 0.22, 1]], 0.08)})`, zIndex: 20, display: "flex", alignItems: "center", gap: 14,
      padding: n ? "10px 26px 10px 12px" : "12px 30px", borderRadius: 24, background: rose ? PINK : "#fff", boxShadow: "0 12px 34px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>
      {n && <span style={{ width: size * 1.2, height: size * 1.2, borderRadius: size, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: size * 0.75, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>}
      <span style={{ fontFamily: `${K}, Poppins, ${EMOJI}`, fontWeight: 800, fontSize: size, color: rose ? "#fff" : INK }}>{text}</span>
      {tag && <span style={{ marginLeft: 6, padding: "4px 12px", borderRadius: 10, background: "#fff", color: PINK, fontFamily: "Poppins", fontWeight: 800, fontSize: size * 0.55 }}>{tag}</span>}
    </div>
  );
};

// ─── 2. le problème : la même lettre pour tout le monde, puis la soirée qui passe ───
const LettreType: React.FC<{ t: number; dx?: number; rot?: number; o?: number; trou?: number }> = ({ t, dx = 0, rot = -3, o = 1, trou }) => (
  <div style={{ position: "absolute", left: X - 330 + dx, top: 600, width: 660, borderRadius: 26, background: "#fff", padding: "40px 44px", boxSizing: "border-box", transform: `rotate(${rot}deg)`, opacity: o,
    fontFamily: "Georgia, 'DejaVu Serif', serif", fontSize: 34, lineHeight: 1.45, color: "#1D1D1F", boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}>
    <div>Madame, Monsieur,</div>
    <div style={{ marginTop: 22 }}>Motivé(e), je souhaite rejoindre</div>
    <div style={{ position: "relative", display: "inline-block", margin: "14px 0", fontWeight: 700, color: trou !== undefined ? "#C21F24" : "#1D1D1F", background: trou !== undefined ? "rgba(232,38,43,0.14)" : "transparent", borderRadius: 6, padding: "0 6px" }}>
      [NOM DE L'ENTREPRISE]
      {trou !== undefined && (
        <svg width="520" height="130" viewBox="0 0 520 130" style={{ position: "absolute", left: -48, top: -38, overflow: "visible" }}>
          <ellipse cx="260" cy="65" rx="250" ry="44" fill="none" stroke={PINK} strokeWidth="9" strokeDasharray="1700" strokeDashoffset={1700 * (1 - ease(t, trou, trou + 0.3))} strokeLinecap="round" transform="rotate(-3 260 65)" />
        </svg>
      )}
    </div>
    <div>afin de relever de nouveaux défis.</div>
    {[0.9, 0.75].map((w, i) => <div key={i} style={{ height: 16, width: `${w * 100}%`, background: "#E5E5EA", borderRadius: 8, marginTop: 22 }} />)}
  </div>
);
const Probleme: React.FC<{ t: number }> = ({ t }) => {
  if (t >= T_HORLOGE) {
    // la soirée qui défile : 20:00 → 00:47
    const k = ease(t, T_HORLOGE + 0.2, at(32) - 0.1), min = Math.round(lerp(20 * 60, 24 * 60 + 47, k)) % (24 * 60);
    const hh = String(Math.floor(min / 60)).padStart(2, "0"), mm = String(min % 60).padStart(2, "0");
    return (
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #1E1730 0%, #0E0B14 55%, #0B0A0B 100%)" }}>
        <Mot t={t} a={at(25) - 0.1} text="1 LETTRE PAR OFFRE" y={470} size={fit("1 LETTRE PAR OFFRE", 64)} color={PINK_L} />
        <div style={{ position: "absolute", left: X, top: 760, transform: "translate(-50%, -50%)", fontFamily: K, fontWeight: 900, fontSize: 230, color: "#fff", letterSpacing: -6, textShadow: "0 0 60px rgba(120,100,255,0.35)" }}>{hh}:{mm}</div>
        <div style={{ position: "absolute", left: X + 290, top: 560, fontFamily: EMOJI, fontSize: 80, transform: `rotate(${Math.sin(t * 3) * 8}deg)` }}>🌙</div>
        <Mot t={t} a={at(32) - 0.1} text={"TOUTE TA\nSOIRÉE."} y={1040} size={fit("TOUTE TA\nSOIRÉE.", 120)} color={PINK} slam lh={0.95} />
      </AbsoluteFill>
    );
  }
  const copies = seg(t, at(17) - 0.1, at(19));
  return (
    <AbsoluteFill style={{ background: INK }}>
      <Mot t={t} a={T_PB + 0.05} b={at(17) - 0.1} text="LA MÊME LETTRE" y={430} size={fit("LA MÊME LETTRE", 92)} />
      <Mot t={t} a={at(17) - 0.1} text={"À TOUT\nLE MONDE"} y={450} size={fit("À TOUT\nLE MONDE", 92)} lh={0.95} />
      {[3, 2, 1].map((i) => <LettreType key={i} t={t} dx={i * 40 * copies} rot={-3 + i * 4 * copies} o={copies * (1 - i * 0.15)} />)}
      <LettreType t={t} trou={t >= at(20) - 0.1 ? at(20) - 0.1 : undefined} />
      <Mot t={t} a={at(22) - 0.1} text="ÇA SE VOIT." y={1130} size={fit("ÇA SE VOIT.", 110)} color={PINK} slam rot={-3} />
    </AbsoluteFill>
  );
};

// ─── 4. la preuve : le témoignage réel de Léni S. ───
const Compteur: React.FC<{ t: number; a: number; n: number; label: string; color: string; y: number }> = ({ t, a, n, label, color, y }) => {
  if (t < a) return null;
  const v = Math.round(n * ease(t, a, a + 0.45));
  return (
    <div style={{ position: "absolute", left: X, top: y, transform: `translate(-50%, -50%) scale(${bounce(t, [[a, 0.7], [a + 0.25, 1]], 0.08)})`, display: "flex", alignItems: "baseline", gap: 24, whiteSpace: "nowrap" }}>
      <span style={{ fontFamily: K, fontWeight: 900, fontSize: 190, color, letterSpacing: -4, lineHeight: 1 }}>{v}</span>
      <span style={{ fontFamily: K, fontWeight: 800, fontSize: 64, color: "#fff" }}>{label}</span>
    </div>
  );
};
const Preuve: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: GLOW_BG }}>
    <Mot t={t} a={T_PREUVE + 0.05} text="AVEC MYMOTIV" y={420} size={60} color={PINK_L} />
    <div style={{ position: "absolute", left: X, top: 560, transform: `translate(-50%, -50%) scale(${bounce(t, [[T_PREUVE + 0.1, 0.7], [T_PREUVE + 0.35, 1]], 0.08)})`, display: "flex", alignItems: "center", gap: 22 }}>
      <div style={{ width: 110, height: 110, borderRadius: 55, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center" }}>L</div>
      <div>
        <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 56, color: "#fff" }}>Léni S.</div>
        <div style={{ fontSize: 40, color: "#F2C46D", letterSpacing: 6 }}>★★★★★</div>
      </div>
    </div>
    <Compteur t={t} a={at(75) - 0.35} n={11} label="candidatures" color="#fff" y={800} />
    {t >= at(77) - 0.3 && <div style={{ position: "absolute", left: X - 30, top: 905, fontFamily: K, fontWeight: 900, fontSize: 70, color: PINK_L, opacity: seg(t, at(77) - 0.3, at(77) - 0.1) }}>↓</div>}
    <Compteur t={t} a={at(77) - 0.15} n={7} label="entretiens" color={PINK} y={1070} />
    <Mention t={t} a={T_PREUVE + 0.3} b={T_OFFRE} text="Témoignage réel · résultats individuels non garantis" y={1405} color="#B8B8BD" />
  </AbsoluteFill>
);

// ─── 5. l'offre : 1re lettre offerte, puis le prix (lettre-ia/lib/pricing.ts) avec le CV adapté ───
const Offre: React.FC<{ t: number }> = ({ t }) => {
  const apres = t >= T_APRES;
  const kcv = ease(t, at(91) - 0.1, at(91) + 0.35);
  return (
    <AbsoluteFill style={{ background: INK }}>
      {!apres ? (
        <>
          <Mot t={t} a={T_OFFRE + 0.05} text="TA 1RE LETTRE" y={540} size={fit("TA 1RE LETTRE", 100)} />
          <Chrome t={t} a={at(83) - 0.1} text="OFFERTE" y={730} size={fit("OFFERTE", 170)} />
          <Pilule t={t} a={at(83) + 0.25} b={T_APRES} y={930} text="Sans carte bancaire" rose size={48} />
        </>
      ) : (
        <>
          <Mot t={t} a={T_APRES} text="ENSUITE" y={390} size={64} color={PINK_L} />
          <Chrome t={t} a={at(87) - 0.15} text={PRIX} y={540} size={fit(PRIX, 190)} />
          <Mot t={t} a={at(89) - 0.1} text="LA LETTRE" y={690} size={76} />
          {t >= at(91) - 0.1 && (
            <div style={{ position: "absolute", left: X - 180, top: 820, width: 360, height: 360, borderRadius: 22, overflow: "hidden", transform: `translateY(${(1 - kcv) * 500}px) rotate(${lerp(8, -3, kcv)}deg)`, boxShadow: "0 30px 70px rgba(0,0,0,0.6)", zIndex: 4 }}>
              <Img src={staticFile("tuto-tel/044-cv-adapte.jpg")} style={{ position: "absolute", left: -110 * 0.42, top: -440 * 0.42, width: 1080 * 0.42, height: 1920 * 0.42 }} />
            </div>
          )}
          <Pilule t={t} a={at(93) - 0.1} b={T_FIN} y={810} text="+ ton CV adapté ✓" rose size={46} />
        </>
      )}
    </AbsoluteFill>
  );
};

export const ToutEnUn: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const demo = t < T_PB || (t >= T_DEMO && t < T_PREUVE);
  // petit « coup de zoom » à chaque changement de scène
  const debut = [0, T_PB, T_DEMO, T_PREUVE, T_OFFRE, T_FIN].reduce((p, a) => (t >= a ? a : p), 0);
  const punch = 1 + 0.06 * Math.exp(-(t - debut) * 9);
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        {demo && <Ecran t={t} />}
        {t >= T_PB && t < T_DEMO && <Probleme t={t} />}
        {t >= T_PREUVE && t < T_OFFRE && <Preuve t={t} />}
        {t >= T_OFFRE && t < T_FIN && <Offre t={t} />}
        {t >= T_FIN && <AbsoluteFill style={{ background: GLOW_BG }} />}
      </AbsoluteFill>
      {/* accroche : visible dès l'image 0, sur l'écran d'accueil assombri */}
      {t < T_ACC + 0.1 && (
        <>
          <div style={{ position: "absolute", inset: 0, background: "rgba(11,10,11,0.7)" }} />
          <Mot t={t} a={-0.5} text="TU CHERCHES" y={640} size={fit("TU CHERCHES", 120)} b={T_ACC + 0.1} />
          <Mot t={t} a={-0.4} text={"UNE\nALTERNANCE ?"} y={850} size={fit("UNE\nALTERNANCE ?", 140)} color={PINK} lh={0.95} b={T_ACC + 0.1} />
        </>
      )}
      <Pilule t={t} a={T_ACC} b={T_PB} y={340} text="Regarde ça 👇" />
      {/* étapes de la démo */}
      <Pilule t={t} a={T_DEMO + 0.05} b={T_LIEN} y={340} n="1" text="Ton CV" />
      <Pilule t={t} a={at(42) - 0.1} b={T_LIEN} y={1120} text="Même en photo 📸" rose tag="NOUVEAU" />
      <Pilule t={t} a={T_LIEN + 0.05} b={T_ANALYSE} y={340} n="2" text="Le lien de l'offre" />
      <Pilule t={t} a={T_ANALYSE} b={T_PREUVE} y={340} n="3" text="Ta lettre" />
      <Pilule t={t} a={at(56) - 0.1} b={T_LETTRE} y={470} text="⏱ 30 s*" rose size={56} />
      <Pilule t={t} a={at(62) - 0.1} b={at(68) - 0.15} y={470} text="Faite pour cette offre" rose />
      <Pilule t={t} a={at(68) - 0.15} b={T_PREUVE} y={470} text="Avec tes vraies preuves" rose />
      <Mention t={t} a={at(56) - 0.1} b={T_PREUVE} text="* temps mesuré : 27 à 35 s par lettre" y={1405} color="#B8B8BD" />
      {/* un voile en bas pendant la démo, pour lire les sous-titres sur la page */}
      {demo && t >= T_ACC && <div style={{ position: "absolute", left: 0, right: 0, top: 1090, height: 830, background: "linear-gradient(180deg, rgba(11,10,11,0) 0%, rgba(11,10,11,0.82) 14%, rgba(11,10,11,0.92) 100%)", zIndex: 15 }} />}
      {t >= T_FIN && <FinOfferte t={t} t0={T_FIN} aBio={at(96) - 0.05} dark sous="Sans carte bancaire." />}
      {t >= T_ACC && <div style={{ position: "absolute", inset: 0, zIndex: 25 }}><Caption t={t} /></div>}
      <Audio src={staticFile("audio/tout.wav")} />
    </AbsoluteFill>
  );
};
