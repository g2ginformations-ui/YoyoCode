// « TUTO lettre de motiv en 30 secondes* » (≈23 s, 30 i/s, 9:16) : le style d'une vidéo de référence envoyée par le
// propriétaire, MESURÉ avec la compétence steal (.claude/skills/steal/, mesures dans styles/tuto-doigt.md) : un face caméra
// de 2 s, puis un ordinateur portable filmé au téléphone, un doigt qui montre l'écran, un titre fixe en haut tout du long,
// 4 coupes franches en 23 s (≈5,5 s par plan, la caméra bouge à la main entre les coupes, aucun zoom brusque), la voix
// seule (ni musique, ni bruitage), pas de sous-titres mot à mot.
// Version MyMotiv, honnête : pas de « décrocher un job en 24 h » (promesse de résultat) mais « ta lettre en 30 s* » (temps
// mesuré, mention en bas) ; pas de « copie le lien sur LinkedIn » (LinkedIn bloque la lecture) mais une page carrières ;
// pas de fiche de préparation d'entretien (MyMotiv n'en fait pas). Le doigt est la vraie main de Yann (photo masquée
// g2-argumenter, tools/detourer-doigt.py → public/yann/doigt.png). Captures du vrai site : public/tuto/.
// Voix : voix-doigt.json (--voix yann). Son : synth_doigt.py (voix + léger fond de pièce).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import BOXES from "../public/tuto/boxes.json";
import { bounce } from "./apple";
import { easeInOut, lerp, seg } from "./common";
import voix from "./data/doigt-voix.json";
import { FinOfferte, Mention, X, horloge } from "./pubMotion";
import "./fonts";

export const DOIGT_DUR = voix.duration;
const { at, sc } = horloge(voix);
const EMOJI = "'Noto Color Emoji'";
type Box = [number, number, number, number];
const BX = BOXES as unknown as Record<string, Record<string, Box>>;
const ctr = (img: string, k: string): [number, number] => { const b = BX[img][k]; return [b[0] + b[2] / 2, b[1] + b[3] / 2]; };
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));

// ─── les plans (coupes franches) et les temps clés ───
const P1 = sc(1), P2 = sc(2), P3 = sc(3), P4 = sc(4);
const T_PARTAGE = at(22) + 0.1, T_COPIE = at(27) + 0.05;
const T_CV = at(37) - 0.15, T_COLLE = at(39) - 0.05, T_ANALYSE = at(47) - 0.15;
const T_LETTRE = at(59) - 0.1, T_PREUVES = at(65) - 0.1, T_CVA = at(69) - 0.15;

// ─── ce qu'affiche l'écran ───
const ANALYSE = Array.from({ length: 9 }, (_, i) => `0${16 + i}-analyse`);
function capture(t: number): string | null {
  if (t < P2) return null;                                                  // la page carrières (dessinée ici)
  if (t < T_CV) return "001-cv";
  if (t < T_COLLE) return "012-cv-lu";
  if (t < T_COLLE + 0.25) return "013-offre";
  if (t < T_ANALYSE) return "014-offre-collee";
  if (t < P3) return ANALYSE[Math.min(8, Math.floor(seg(t, T_ANALYSE, P3 - 0.05) * 9))];
  if (t < T_LETTRE) return "025-resultat";
  if (t < T_CVA) return "039-lettre";
  return "043-cv-adapte";
}
const adresse = (t: number) => (t < P2 ? "carrieres.maison-lumen.fr/offres/manager-des-ventes" : t < T_CVA ? "yoyo-code.vercel.app/candidature" : "yoyo-code.vercel.app/cv");

// ─── la caméra (le téléphone) : [début, x, y, zoom, durée] en pixels de l'écran ; elle glisse, sans à-coup ───
type Cle = [number, number, number, number, number];
const CY = 860;
const CAM: Cle[] = [
  [P1, 1150, 640, 0.6, 0], [P1 + 0.1, 950, 520, 0.76, 2.2], [T_PARTAGE - 0.4, 880, 540, 0.84, 0.9], [T_COPIE - 0.3, 900, 560, 0.86, 0.6],
  [P2, 1280, 650, 0.8, 0], [P2 + 0.1, 1280, 600, 0.9, 1.2], [T_COLLE - 0.2, 1280, 610, 0.92, 0.6], [T_ANALYSE - 0.1, 1280, 860, 0.92, 0.5],
  [P3, 1280, 760, 0.78, 0], [P3 + 0.1, 1200, 900, 0.82, 1.2], [T_LETTRE, 950, 560, 0.84, 0.5], [T_PREUVES - 0.2, 1000, 600, 0.86, 0.6], [T_CVA, 1280, 760, 0.56, 0.4],
];
function camera(t: number) {
  let k = 0;
  CAM.forEach((c, i) => { if (t >= c[0]) k = i; });
  const cur = CAM[k], prev = CAM[Math.max(0, k - 1)];
  const e = cur[4] > 0 ? ease(t, cur[0], cur[0] + cur[4]) : 1;
  return { fx: lerp(prev[1], cur[1], e), fy: lerp(prev[2], cur[2], e), z: lerp(prev[3], cur[3], e) };
}

// ─── le doigt (vraie main de Yann) : [temps, x, y] du bout de l'index en pixels de l'écran ; appuis ───
const DOIGT_W = 429, DOIGT_H = 939, BOUT: [number, number] = [220, 10];
type Pt = [number, number, number];
const [shx, shy] = [780, 460], [cpx, cpy] = [880, 590];
const TRAJET: Pt[] = [
  [P1 + 0.2, 900, 1500], [at(13) - 0.1, 700, 330], [at(20) - 0.2, 720, 360], [T_PARTAGE - 0.1, shx + 10, shy + 20], [T_PARTAGE + 0.35, shx + 30, shy + 60], [T_COPIE - 0.1, cpx - 40, cpy + 10], [P2 - 0.05, cpx, cpy + 40],
  [P2 + 0.3, 1500, 1500], [T_CV - 0.05, ...ctr("012-cv-lu", "file")], [T_COLLE - 0.1, 1100, ctr("014-offre-collee", "input")[1] + 10], [T_ANALYSE - 0.2, 1250, 700], [T_ANALYSE + 0.2, 1080, 900], [P3 - 0.05, 1100, 1000],
  [P3 + 0.3, 1500, 1500], [at(56) - 0.2, 1050, 1250], [T_LETTRE - 0.15, 1060, 1280], [T_LETTRE + 0.2, 360, 400], [T_PREUVES - 0.1, 700, 560], [T_CVA - 0.1, 900, 640], [T_CVA + 0.3, 1950, 420], [P4 - 0.05, 1950, 440],
];
const APPUIS = [T_PARTAGE, T_COPIE, T_COLLE];
function doigt(t: number): { x: number; y: number; o: number } | null {
  if (t < P1 || t >= P4) return null;
  let k = 0;
  TRAJET.forEach((p, i) => { if (t >= p[0]) k = i; });
  const p0 = TRAJET[k], p1 = TRAJET[Math.min(k + 1, TRAJET.length - 1)];
  // aucun trajet d'un plan à l'autre : chaque coupe repart du bas de l'écran
  const coupe = [P2, P3].some((c) => p0[0] < c && p1[0] >= c);
  const e = p1 === p0 || coupe ? 0 : ease(t, p0[0], p1[0]);
  const tremble = Math.sin(t * 7) * 4 + Math.sin(t * 13) * 2;
  const appui = APPUIS.reduce((m, a) => Math.max(m, Math.exp(-Math.pow((t - a) / 0.09, 2))), 0);
  return { x: lerp(p0[1], p1[1], e) + tremble + appui * 10, y: lerp(p0[2], p1[2], e) + tremble * 0.6 + appui * 14, o: 1 };
}
const Doigt: React.FC<{ t: number }> = ({ t }) => {
  const d = doigt(t);
  if (!d) return null;
  const rot = -14 + (d.x - 1280) / 120;                                    // la main vient d'en bas à droite
  const s = 0.95;
  return (
    <div style={{ position: "absolute", left: d.x - BOUT[0] * s, top: d.y - BOUT[1] * s, width: DOIGT_W * s, height: DOIGT_H * s, transformOrigin: `${BOUT[0] * s}px ${BOUT[1] * s}px`, transform: `rotate(${rot}deg)`,
      filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.45))", zIndex: 12 }}>
      {/* la manche de la veste noire de Yann, qui descend hors du cadre (sinon la main flotte) */}
      <div style={{ position: "absolute", left: 70 * s, top: 720 * s, width: 330 * s, height: 2200, borderRadius: `${150 * s}px ${150 * s}px 0 0`, background: "linear-gradient(90deg, #141416 0%, #2A2A2E 45%, #18181B 100%)" }} />
      <div style={{ position: "absolute", left: 95 * s, top: 735 * s, width: 280 * s, height: 60 * s, borderRadius: 30 * s, background: "#E9E4DC", opacity: 0.85 }} />
      <Img src={staticFile("yann/doigt.png")} style={{ position: "absolute", left: 0, top: 0, width: DOIGT_W * s, height: DOIGT_H * s, filter: "brightness(1.02) saturate(0.95)" }} />
    </div>
  );
};

// ─── la page carrières (entreprise inventée), avec le menu « partager » ───
const Barre: React.FC<{ y: number; w: number }> = ({ y, w }) => <div style={{ position: "absolute", left: 400, top: y, width: w, height: 24, borderRadius: 12, background: "#E3E3E8" }} />;
const PageOffre: React.FC<{ t: number }> = ({ t }) => {
  const menu = t >= T_PARTAGE && t < T_COPIE + 0.15, copie = t >= T_COPIE, survol = t >= T_COPIE - 0.4;
  return (
    <div style={{ position: "absolute", inset: 0, background: "#FFFFFF", fontFamily: "Open Sans", color: "#1D1D1F", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 2560, height: 120, borderBottom: "2px solid #EEE", display: "flex", alignItems: "center", gap: 24, paddingLeft: 400 }}>
        <Img src={staticFile("company.png")} style={{ width: 70, height: 70, borderRadius: 14 }} />
        <span style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 40 }}>Maison Lumen</span>
        <span style={{ fontSize: 34, color: "#86868B" }}>· Carrières</span>
      </div>
      <div style={{ position: "absolute", left: 400, top: 175, fontSize: 30, color: "#86868B" }}>Offres › Vente</div>
      <div style={{ position: "absolute", left: 400, top: 225, fontFamily: "Poppins", fontWeight: 800, fontSize: 84, letterSpacing: -1 }}>Manager des ventes (H/F)</div>
      <div style={{ position: "absolute", left: 400, top: 345, fontSize: 36, color: "#6E6E73" }}>Lyon · CDI · Temps plein</div>
      <div style={{ position: "absolute", left: 400, top: 410, width: 300, height: 100, borderRadius: 50, background: "#1D1D1F", color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>Postuler</div>
      <div style={{ position: "absolute", left: shx - 50, top: shy - 50, width: 100, height: 100, borderRadius: 26, border: "3px solid #D2D2D7", background: menu ? "#F2F2F5" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="52" height="52" viewBox="0 0 24 24"><path d="M12 3v12M12 3l-4.5 4.5M12 3l4.5 4.5M5 11v8a2 2 0 002 2h10a2 2 0 002-2v-8" fill="none" stroke="#1D1D1F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ position: "absolute", left: 850, top: 410, width: 100, height: 100, borderRadius: 26, border: "3px solid #D2D2D7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, color: "#6E6E73" }}>♡</div>
      <div style={{ position: "absolute", left: 400, top: 600, fontFamily: "Poppins", fontWeight: 700, fontSize: 44 }}>Vos missions</div>
      {[0.62, 0.55, 0.6, 0.45].map((w, i) => <Barre key={i} y={680 + i * 56} w={w * 1300} />)}
      <div style={{ position: "absolute", left: 400, top: 940, fontFamily: "Poppins", fontWeight: 700, fontSize: 44 }}>Votre profil</div>
      {[0.58, 0.5, 0.62].map((w, i) => <Barre key={i} y={1020 + i * 56} w={w * 1300} />)}
      {menu && (
        <div style={{ position: "absolute", left: shx - 50, top: shy + 70, width: 440, borderRadius: 26, background: "#fff", boxShadow: "0 30px 80px rgba(0,0,0,0.22), 0 0 0 2px #E5E5EA", padding: "14px 0",
          transform: `scale(${bounce(t, [[T_PARTAGE, 0.85], [T_PARTAGE + 0.2, 1]], 0.06)})`, transformOrigin: "20% 0%", zIndex: 4 }}>
          {[["🔗", "Copier le lien"], ["✉️", "E-mail"], ["💬", "SMS"]].map(([ic, txt], i) => (
            <div key={txt} style={{ display: "flex", alignItems: "center", gap: 24, height: 80, padding: "0 30px", fontSize: 38, fontWeight: 600, background: i === 0 && survol ? "#F2E3E5" : "transparent" }}>
              <span style={{ fontFamily: EMOJI, fontSize: 36 }}>{ic}</span>{txt}
            </div>
          ))}
        </div>
      )}
      {copie && (
        <div style={{ position: "absolute", left: 1280, top: 150, transform: `translateX(-50%) scale(${bounce(t, [[T_COPIE + 0.05, 0.6], [T_COPIE + 0.3, 1]], 0.08)})`, padding: "18px 44px", borderRadius: 50, background: "#1D1D1F",
          color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 44, whiteSpace: "nowrap", zIndex: 5 }}>Lien copié ✓</div>
      )}
    </div>
  );
};

// ─── l'ordinateur portable filmé : écran (navigateur + page), clavier en perspective, bureau ; caméra à la main ───
const CH = 150;
const Portable: React.FC<{ t: number }> = ({ t }) => {
  const { fx, fy, z } = camera(t);
  const sx = Math.sin(t * 1.6) * 9 + Math.sin(t * 4.1) * 3, sy = Math.cos(t * 1.2) * 7 + Math.sin(t * 3.3) * 3, rz = Math.sin(t * 0.8) * 1.4 - 1;
  const img = capture(t);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #6E5D4E 0%, #4A3D33 45%, #2C241F 100%)", perspective: 2200 }}>
      {/* lumière chaude de la pièce, floue */}
      <div style={{ position: "absolute", left: -200, top: -300, width: 900, height: 900, borderRadius: "50%", background: "rgba(255,226,180,0.25)", filter: "blur(120px)" }} />
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${X}px ${CY}px`, transform: `translate(${sx}px, ${sy}px) rotateX(${11 + Math.sin(t * 0.6) * 2}deg) rotateY(${-4 + Math.sin(t * 0.45) * 3}deg) rotateZ(${rz}deg)` }}>
        <div style={{ position: "absolute", left: X - fx * z, top: CY - fy * z, width: 2560, height: 1600, transformOrigin: "0 0", transform: `scale(${z})` }}>
          {/* clavier (vu en perspective sous l'écran) */}
          <div style={{ position: "absolute", left: -260, top: 1600 + 70, width: 3080, height: 1500, transformOrigin: "50% 0", transform: "perspective(1400px) rotateX(58deg)", borderRadius: "0 0 60px 60px",
            background: "linear-gradient(180deg, #B9BCC2 0%, #9DA1A8 100%)", boxShadow: "inset 0 8px 20px rgba(0,0,0,0.35)" }}>
            {Array.from({ length: 5 }, (_, r) => (
              <div key={r} style={{ position: "absolute", left: 330 + r * 30, top: 120 + r * 175, display: "flex", gap: 22 }}>
                {Array.from({ length: 13 - (r === 4 ? 4 : 0) }, (_, k) => <div key={k} style={{ width: r === 4 && k === 4 ? 900 : 150, height: 150, borderRadius: 22, background: "#1E1F22", boxShadow: "0 6px 0 #0E0F11" }} />)}
              </div>
            ))}
          </div>
          {/* cadre de l'écran */}
          <div style={{ position: "absolute", left: -60, top: -CH - 70, width: 2680, height: 1600 + CH + 140, borderRadius: 50, background: "#0C0C0D", boxShadow: "0 0 0 5px #3A3B3E, 0 60px 120px rgba(0,0,0,0.55)" }} />
          {/* navigateur */}
          <div style={{ position: "absolute", left: 0, top: -CH, width: 2560, height: CH, background: "#E9E9EC", display: "flex", alignItems: "center", gap: 18, padding: "0 30px", boxSizing: "border-box" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((col) => <div key={col} style={{ width: 22, height: 22, borderRadius: 11, background: col }} />)}
            <div style={{ marginLeft: 30, flex: 1, height: 76, borderRadius: 38, background: "#fff", display: "flex", alignItems: "center", padding: "0 34px", fontFamily: "Open Sans", fontSize: 36, color: "#3A3A3C", gap: 16 }}>
              <span style={{ fontFamily: EMOJI, fontSize: 28 }}>🔒</span>
              <span style={{ background: t >= T_COPIE && t < P2 ? "#B4D5FE" : "transparent", padding: "2px 4px", borderRadius: 4 }}>{adresse(t)}</span>
            </div>
          </div>
          {/* la page */}
          <div style={{ position: "absolute", left: 0, top: 0, width: 2560, height: 1600, overflow: "hidden", background: "#0B0A0B" }}>
            {img ? <Img src={staticFile(`tuto/${img}.jpg`)} style={{ width: 2560, height: 1600 }} /> : <PageOffre t={t} />}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${120 + Math.sin(t * 0.4) * 6}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.08) 46%, rgba(255,255,255,0) 62%)` }} />
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.045) 0px, rgba(0,0,0,0.045) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)" }} />
          </div>
          <Doigt t={t} />
        </div>
      </div>
      {/* étalonnage chaud et vignette du téléphone */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,180,110,0.05)", mixBlendMode: "multiply" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.4) 100%)" }} />
    </AbsoluteFill>
  );
};

// ─── plan 1 : Yann face caméra (vraie photo masquée), étonné ───
const Yann: React.FC<{ t: number }> = ({ t }) => {
  const sx = Math.sin(t * 1.9) * 6, sy = Math.cos(t * 1.4) * 5, rz = Math.sin(t * 1.1) * 0.8;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 70% 25%, #8C7663 0%, #5C4B3F 35%, #2E2520 75%, #1A1512 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 600, top: 120, width: 420, height: 780, background: "rgba(255,236,214,0.18)", filter: "blur(70px)" }} />
      <div style={{ position: "absolute", left: X - 480, top: 430, width: 960, height: 1220, transformOrigin: "50% 25%", transform: `translate(${sx}px, ${sy}px) rotate(${rz}deg) scale(${1.04 + 0.03 * t})` }}>
        <Img src={staticFile("yann/emo-surprise.png")} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 100%" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// ─── le titre fixe, comme un texte TikTok (blanc cerné de noir), tout du long ───
const CONTOUR = [[-3, -3], [3, -3], [-3, 3], [3, 3], [0, 4], [0, -4], [4, 0], [-4, 0]].map(([x, y]) => `${x}px ${y}px 0 #000`).join(", ");
const Titre: React.FC = () => (
  <div style={{ position: "absolute", left: 120, width: 800, top: 300, textAlign: "center", fontFamily: `Poppins, ${EMOJI}`, fontWeight: 600, fontSize: 56, lineHeight: 1.18, color: "#fff", textShadow: CONTOUR, zIndex: 30 }}>
    TUTO lettre de motiv<br />en 30 secondes* <span style={{ fontFamily: EMOJI, textShadow: "none" }}>📄</span>
  </div>
);

export const TutoDoigt: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  return (
    <AbsoluteFill style={{ background: "#1A1512", overflow: "hidden" }}>
      {t < P1 ? <Yann t={t} /> : t < P4 ? <Portable t={t} /> : <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, #3A2327 0%, #1E1719 38%, #0B0A0B 78%)" }} />}
      {t >= P4 && <FinOfferte t={t} t0={P4} aBio={at(79) - 0.05} dark sous="Sans carte bancaire." />}
      <Titre />
      <Mention t={t} a={0} b={DOIGT_DUR + 1} text="* temps mesuré : 27 à 35 s par lettre" y={1405} color="rgba(255,255,255,0.75)" />
      <Audio src={staticFile("audio/doigt.wav")} />
    </AbsoluteFill>
  );
};
