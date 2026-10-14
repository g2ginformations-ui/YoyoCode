// « Les recruteurs veulent pas que tu saches ça » (≈44 s, 30 i/s, 9:16) : le format d'une vidéo de référence envoyée par
// le propriétaire (un tuto « écran filmé au téléphone » : face caméra, puis l'écran de l'ordinateur filmé de près, le
// texte d'accroche en bandeau tout du long), refait pour MyMotiv, honnête, avec les NOUVELLES fonctions mises en avant.
// 1. Yann masqué (ses vraies photos) : l'accroche → 2. une offre (page carrières d'une entreprise inventée, Maison Lumen) :
// partager → copier le lien → 3. le VRAI site sur ordinateur (captures public/tuto/, capture/capture-tuto.mjs) : CV glissé
// en PHOTO puis lu (nouveau), lien collé (ou le texte si le site bloque : c'est ce que dit le site pour LinkedIn et Indeed),
// analyse, score de matching (mots-clés cochés = déjà dans le CV ; les autres ne sont pas inventés), lettre en 30 s* avec le
// logo trouvé tout seul, 4 styles de PDF et CV adapté sur 1 page (mention : offres payantes, prix de lettre-ia/lib/pricing.ts)
// → 1re lettre offerte → Yann : « dis-moi ton score en commentaire ».
// On ne reprend PAS ce que dit la référence et qui n'est pas prouvé (« un CV qui passe les ATS », « 100 % adapté »), ni le
// nom de l'outil montré. Voix : voix-tuto.json (--voix yann). Son : synth_tuto.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PLANS } from "../../lettre-ia/lib/pricing";
import BOXES from "../public/tuto/boxes.json";
import { bounce } from "./apple";
import { PINK, PINK_L, clamp, easeInOut, lerp, seg } from "./common";
import voix from "./data/tuto-voix.json";
import { makeCaption } from "./FauxDM";
import { Pointer, Ripple } from "./Lien";
import { ease } from "./motion";
import { CAP_BOX } from "./pixelTT";
import { FinOfferte, Mention, X, horloge } from "./pubMotion";
import "./fonts";

export const TUTO_DUR = voix.duration;
const { PH, at, sc } = horloge(voix);
const HOT = new Set(["recruteurs", "montrer", "partager", "copier", "lien", "mymotiv", "cv", "photo", "colles", "texte", "besoins", "motscles", "score",
  "coche", "invente", "clic", "trente", "secondes", "lettre", "logo", "seul", "styles", "pdf", "adapte", "page", "offerte", "bio", "commentaire"]);
const Caption = makeCaption(voix, HOT, CAP_BOX, PINK);
const EMOJI = "'Noto Color Emoji'";

type Box = [number, number, number, number];
const BX = BOXES as unknown as Record<string, Record<string, Box>>;
const box = (img: string, k: string) => BX[img][k];
const ctr = (b: Box): [number, number] => [b[0] + b[2] / 2, b[1] + b[3] / 2];

// ─── les temps clés (calés sur la voix) ───
const T_ECRAN = sc(1);                     // fin du face caméra : l'écran de l'ordinateur
const T_PARTAGE = at(26) + 0.05;           // clic sur « partager »
const T_COPIE = at(27) + 0.05;             // clic sur « copier le lien »
const T_MM = at(30) - 0.1;                 // nouvel onglet : MyMotiv
const T_DESSUS = at(40) + 0.15;            // la photo du CV passe au-dessus de la zone
const T_LACHE = at(42) - 0.05;             // on la lâche : lecture
const T_LU = at(47) - 0.05;                // CV lu
const T_OFFRE = PH[3][0] - 0.1;            // étape du lien
const T_COLLE = at(50) + 0.05;             // lien collé
const T_LIRE = at(65) + 0.1;               // « Lire l'offre »
const T_ANALYSE = sc(4);
const T_RES = at(78) + 0.3;                // l'analyse est prête : score et mots-clés
const T_GEN = at(102) - 0.02;              // clic sur « Générer ma lettre offerte »
const T_LETTRE = at(110) - 0.05;
const T_TROUVE = at(122) - 0.1;            // « trouvé tout seul » : la ligne « Site et logo trouvés »
const T_STYLES = sc(7);
const T_CV = at(132) - 0.12;
const T_FIN = sc(8);
const T_YANN = sc(9);

// ─── ce qu'affiche l'écran ───
const LECTURE = ["003", "004", "005", "006", "007", "008", "009"].map((n) => `${n}-cv-lecture`);
const ANALYSE = Array.from({ length: 9 }, (_, i) => `0${16 + i}-analyse`);
const GENERATION = Array.from({ length: 6 }, (_, i) => `0${27 + i}-generation`);
const pick = (list: string[], t: number, a: number, b: number) => list[Math.min(list.length - 1, Math.floor(seg(t, a, b) * list.length))];
function capture(t: number): string | null {
  if (t < T_MM) return null;                                            // la page de l'offre (dessinée ici)
  if (t < T_DESSUS) return "001-cv";
  if (t < T_LACHE) return "002-cv-glisse";
  if (t < T_LU) return pick(LECTURE, t, T_LACHE, T_LU);
  if (t < T_OFFRE) return "012-cv-lu";
  if (t < T_COLLE) return "013-offre";
  if (t < T_LIRE) return "014-offre-collee";
  if (t < T_ANALYSE) return "015-offre-lecture";
  if (t < T_RES) return pick(ANALYSE, t, T_ANALYSE, T_RES - 0.2);
  if (t < T_GEN + 0.12) return "025-resultat";
  if (t < T_LETTRE) return pick(GENERATION, t, T_GEN + 0.12, T_LETTRE);
  if (t < T_TROUVE) return "039-lettre";
  if (t < T_STYLES) return "032-generation";
  if (t < T_CV) return "040-styles";
  return "043-cv-adapte";
}
const adresse = (t: number) => (t < T_MM ? "carrieres.maison-lumen.fr/offres/manager-des-ventes" : t < T_CV ? "yoyo-code.vercel.app/candidature" : "yoyo-code.vercel.app/cv");

// ─── la caméra (le téléphone qui filme l'écran) : [début, x, y, zoom, durée du mouvement] en pixels de capture ───
type Cle = [number, number, number, number, number];
const CY = 870;                                                         // centre de la zone utile (sous l'accroche, au-dessus des sous-titres)
const [rcx, rcy] = ctr(box("025-resultat", "ring"));
const CAM: Cle[] = [
  [T_ECRAN, 1280, 760, 0.4, 0], [at(17), 1000, 470, 0.74, 0.8], [at(24) - 0.2, 1060, 560, 0.86, 0.45], [T_COPIE + 0.15, 850, 120, 0.62, 0.4],
  [T_MM, 1280, 760, 0.4, 0], [at(34) - 0.1, 1280, 600, 0.88, 0.6], [at(36), 1420, 660, 0.8, 0.5], [T_LACHE, 1280, 640, 0.92, 0.4], [at(45) - 0.1, 1280, 615, 1.04, 0.4],
  [T_OFFRE, 1280, 560, 0.9, 0], [at(57) - 0.1, 1280, 650, 1.15, 0.5], [at(65) - 0.2, 1280, 1300, 0.78, 0.4],
  [T_ANALYSE, 1280, 868, 0.95, 0], [T_RES, 1280, 860, 1.0, 0], [at(83) - 0.1, 1280, 618, 1.0, 0.45], [sc(5), 1280, 880, 0.9, 0.45],
  [at(101) - 0.1, 1280, 1290, 0.8, 0.35], [T_GEN + 0.12, 1880, 640, 0.86, 0], [T_LETTRE, 950, 560, 0.86, 0], [at(111) - 0.1, 1150, 640, 0.86, 1.2],
  [at(117) - 0.15, 640, 400, 1.2, 0.45], [T_TROUVE, 1700, 470, 1.1, 0],
  [T_STYLES, 1014, 360, 0.68, 0], [T_CV, 1290, 700, 0.55, 0], [at(137) - 0.1, 1280, 760, 0.47, 0.6],
  [T_FIN, 1280, 800, 0.34, 1.0],
];
function camera(t: number) {
  let k = 0;
  CAM.forEach((c, i) => { if (t >= c[0]) k = i; });
  const cur = CAM[k], prev = CAM[Math.max(0, k - 1)];
  const e = cur[4] > 0 ? easeInOut(seg(t, cur[0], cur[0] + cur[4])) : 1;
  return { fx: lerp(prev[1], cur[1], e), fy: lerp(prev[2], cur[2], e), z: lerp(prev[3], cur[3], e) };
}

// ─── le curseur de la marque : [temps, x, y, survol] en pixels de capture ; clics ───
type Pt = [number, number, number, number];
const [shx, shy] = [780, 460], [cpx, cpy] = [880, 590];                 // bouton partager, « Copier le lien » (page de l'offre)
const [dzx, dzy] = ctr(box("001-cv", "drop"));
const [inx, iny] = [1000, ctr(box("013-offre", "input"))[1]];
const [pax, pay] = ctr(box("013-offre", "paste"));
const [nxx, nxy] = ctr(box("013-offre", "next"));
const STY = ["s0", "s1", "s2", "s3"].map((k) => ctr(box("040-styles", k)));
const TRAJETS: Pt[][] = [
  [[at(19), 1500, 900, 0], [T_PARTAGE - 0.12, shx, shy, 1], [T_PARTAGE + 0.25, shx + 20, shy + 40, 0], [T_COPIE - 0.1, cpx, cpy, 1], [T_COPIE + 0.45, cpx + 30, cpy + 30, 0]],
  [[at(36) - 0.1, 2300, 1150, 0], [T_DESSUS + 0.1, dzx + 230, dzy - 20, 0], [T_LACHE, dzx + 200, dzy - 40, 0], [T_LACHE + 0.6, dzx + 330, dzy + 200, 0]],
  [[T_OFFRE + 0.05, 1700, 900, 0], [T_COLLE - 0.08, inx, iny, 1], [at(57) - 0.1, inx + 60, iny + 40, 0], [at(62) - 0.2, pax + 290, pay + 30, 0], [at(65) - 0.2, pax + 300, pay + 120, 0], [T_LIRE - 0.08, nxx, nxy, 1]],
  [[at(101) - 0.2, 1650, 1250, 0], [T_GEN - 0.08, nxx, nxy - 50, 1]],
  [[T_STYLES + 0.2, 1100, 560, 0], [at(126) + 0.1, STY[1][0], STY[1][1], 1], [at(127) + 0.1, STY[2][0], STY[2][1], 1], [at(129), STY[3][0], STY[3][1], 1], [T_CV - 0.05, STY[3][0] + 60, STY[3][1] + 80, 0]],
];
const CLICS = [T_PARTAGE, T_COPIE, T_LACHE, T_COLLE, T_LIRE, T_GEN];
const press = (t: number) => CLICS.reduce((p, c) => Math.max(p, Math.exp(-Math.pow((t - c) / 0.08, 2))), 0);
function curseur(t: number): { x: number; y: number; h: number; o: number } | null {
  for (const tr of TRAJETS) {
    const a = tr[0][0], b = tr[tr.length - 1][0] + 0.35;
    if (t < a || t > b) continue;
    let k = 0;
    tr.forEach((p, i) => { if (t >= p[0]) k = i; });
    const p0 = tr[k], p1 = tr[Math.min(k + 1, tr.length - 1)];
    const e = p1 === p0 ? 1 : easeInOut(seg(t, p0[0], p1[0]));
    return { x: lerp(p0[1], p1[1], e), y: lerp(p0[2], p1[2], e), h: lerp(p0[3], p1[3], e), o: seg(t, a, a + 0.15) * (1 - seg(t, b - 0.3, b)) };
  }
  return null;
}

// ─── un cadre rose qui pulse autour d'une case de l'écran ───
const Cadre: React.FC<{ t: number; a: number; b: number; r: Box; pad?: number; dash?: boolean; color?: string; label?: string; z?: number }> = ({ t, a, b, r, pad = 12, dash, color = PINK, label, z = 1 }) => {
  if (t < a || t > b) return null;
  const k = bounce(t, [[a, 1.25], [a + 0.25, 1]], 0.08), o = seg(t, a, a + 0.12) * (1 - seg(t, b - 0.2, b));
  const glow = 0.5 + 0.5 * Math.sin((t - a) * 9);
  return (
    <div style={{ position: "absolute", left: r[0] - pad, top: r[1] - pad, width: r[2] + pad * 2, height: r[3] + pad * 2, borderRadius: Math.min(40, (r[3] + pad * 2) / 2), border: `${dash ? 6 : 8}px ${dash ? "dashed" : "solid"} ${color}`,
      boxShadow: dash ? undefined : `0 0 ${20 + 30 * glow}px ${color}`, transform: `scale(${k})`, opacity: o, zIndex: 8 }}>
      {label && <div style={{ position: "absolute", left: "50%", bottom: "100%", marginBottom: 14 / z, transform: "translateX(-50%)", padding: `${6 / z}px ${18 / z}px`, borderRadius: 14 / z, background: color, color: "#0B0A0B", fontFamily: "Poppins", fontWeight: 800, fontSize: 40 / z, whiteSpace: "nowrap" }}>{label}</div>}
    </div>
  );
};

// ─── la page de l'offre (site carrières d'une entreprise inventée), avec le menu « partager » ───
const Barre: React.FC<{ y: number; w: number; h?: number }> = ({ y, w, h = 24 }) => <div style={{ position: "absolute", left: 400, top: y, width: w, height: h, borderRadius: h / 2, background: "#E3E3E8" }} />;
const PageOffre: React.FC<{ t: number }> = ({ t }) => {
  const menu = t >= T_PARTAGE && t < T_COPIE + 0.15, copie = t >= T_COPIE;
  const survol = t >= T_COPIE - 0.35;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 2560, height: 1600, background: "#FFFFFF", fontFamily: "Open Sans", color: "#1D1D1F", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 2560, height: 120, borderBottom: "2px solid #EEE", display: "flex", alignItems: "center", gap: 24, paddingLeft: 400 }}>
        <Img src={staticFile("company.png")} style={{ width: 70, height: 70, borderRadius: 14 }} />
        <span style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 40 }}>Maison Lumen</span>
        <span style={{ fontSize: 34, color: "#86868B" }}>· Carrières</span>
      </div>
      <div style={{ position: "absolute", left: 400, top: 175, fontSize: 30, color: "#86868B" }}>Offres › Vente</div>
      <div style={{ position: "absolute", left: 400, top: 225, fontFamily: "Poppins", fontWeight: 800, fontSize: 84, letterSpacing: -1 }}>Manager des ventes (H/F)</div>
      <div style={{ position: "absolute", left: 400, top: 345, fontSize: 36, color: "#6E6E73" }}>Lyon · CDI · Temps plein</div>
      <div style={{ position: "absolute", left: 400, top: 410, width: 300, height: 100, borderRadius: 50, background: "#1D1D1F", color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>Postuler</div>
      {/* bouton partager (carré + flèche) */}
      <div style={{ position: "absolute", left: shx - 50, top: shy - 50, width: 100, height: 100, borderRadius: 26, border: "3px solid #D2D2D7", background: menu ? "#F2F2F5" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="52" height="52" viewBox="0 0 24 24"><path d="M12 3v12M12 3l-4.5 4.5M12 3l4.5 4.5M5 11v8a2 2 0 002 2h10a2 2 0 002-2v-8" fill="none" stroke="#1D1D1F" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ position: "absolute", left: 850, top: 410, width: 100, height: 100, borderRadius: 26, border: "3px solid #D2D2D7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, color: "#6E6E73" }}>♡</div>
      <div style={{ position: "absolute", left: 400, top: 600, fontFamily: "Poppins", fontWeight: 700, fontSize: 44 }}>Vos missions</div>
      {[0.62, 0.55, 0.6, 0.45].map((w, i) => <Barre key={i} y={680 + i * 56} w={w * 1300} />)}
      <div style={{ position: "absolute", left: 400, top: 940, fontFamily: "Poppins", fontWeight: 700, fontSize: 44 }}>Votre profil</div>
      {[0.58, 0.5, 0.62].map((w, i) => <Barre key={i} y={1020 + i * 56} w={w * 1300} />)}
      <div style={{ position: "absolute", left: 1820, top: 600, width: 340, height: 420, borderRadius: 30, background: "#F5F5F7", padding: 34, boxSizing: "border-box" }}>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 34 }}>L'entreprise</div>
        {[0.9, 0.7, 0.8, 0.5].map((w, i) => <div key={i} style={{ height: 20, width: `${w * 100}%`, borderRadius: 10, background: "#E3E3E8", marginTop: 26 }} />)}
      </div>
      {/* menu « partager » */}
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
          color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 44, whiteSpace: "nowrap", zIndex: 5, opacity: seg(t, T_COPIE + 0.05, T_COPIE + 0.15) }}>Lien copié ✓</div>
      )}
    </div>
  );
};

// ─── la photo du CV qu'on glisse (une feuille photographiée) ───
const PhotoCV: React.FC<{ x: number; y: number; t: number }> = ({ x, y, t }) => {
  if (t < at(36) - 0.1 || t > T_LACHE + 0.25) return null;
  const k = t < T_LACHE ? 1 : 1 - seg(t, T_LACHE, T_LACHE + 0.25);
  return (
    <div style={{ position: "absolute", left: x - 20, top: y - 10, transform: `rotate(-8deg) scale(${0.3 + 0.7 * k})`, transformOrigin: "20px 10px", opacity: k, zIndex: 9 }}>
      <div style={{ width: 250, height: 330, borderRadius: 10, background: "linear-gradient(160deg, #F7F3EC, #E6DFD3)", boxShadow: "0 30px 60px rgba(0,0,0,0.5)", padding: "34px 28px", boxSizing: "border-box" }}>
        <div style={{ width: 120, height: 18, background: "#555", borderRadius: 4 }} />
        {[0.9, 0.7, 0.85, 0.6, 0.8, 0.5, 0.75, 0.65].map((w, i) => <div key={i} style={{ width: `${w * 100}%`, height: 10, background: "#9A948B", borderRadius: 3, marginTop: 20 }} />)}
      </div>
      <div style={{ marginTop: 12, textAlign: "center", fontFamily: "Open Sans", fontWeight: 700, fontSize: 30, color: "#fff", background: "rgba(0,0,0,0.6)", borderRadius: 10, padding: "4px 10px" }}>CV_Camille.jpg</div>
    </div>
  );
};

// ─── l'écran filmé : navigateur (barre d'adresse) + page, moniteur, bureau ; la caméra bouge comme une main ───
const CH = 150;                                                         // hauteur de la barre du navigateur
const Ecran: React.FC<{ t: number }> = ({ t }) => {
  const { fx, fy, z } = camera(t);
  const dt = 1 / 30, c2 = camera(t + dt);
  const vitesse = Math.hypot((c2.fx - fx) * z, (c2.fy - fy) * z) / dt + Math.abs(c2.z - z) / dt * 900;
  const flou = Math.min(7, vitesse / 450);
  const sx = Math.sin(t * 1.7) * 7 + Math.sin(t * 4.3) * 3, sy = Math.cos(t * 1.3) * 6 + Math.sin(t * 3.7) * 3, rz = Math.sin(t * 0.9) * 0.7;
  const img = capture(t), c = curseur(t);
  const fin = seg(t, T_FIN, T_FIN + 0.8);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #1B1719 0%, #120F11 60%, #0B0A0B 100%)", perspective: 2400, filter: `blur(${flou + fin * 10}px) brightness(${1 - fin * 0.65})` }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${X}px ${CY}px`, transform: `translate(${sx}px, ${sy}px) rotateX(${6 + Math.sin(t * 0.7) * 1.5}deg) rotateY(${-5 + Math.sin(t * 0.5) * 2}deg) rotateZ(${rz}deg)` }}>
        <div style={{ position: "absolute", left: X - fx * z, top: CY - fy * z, width: 2560, height: 1600, transformOrigin: "0 0", transform: `scale(${z})` }}>
          {/* bureau, pied et moniteur */}
          <div style={{ position: "absolute", left: -3000, top: 1980, width: 8560, height: 3000, background: "linear-gradient(180deg, #2A2224 0%, #171213 40%, #0B0A0B 100%)" }} />
          <div style={{ position: "absolute", left: 1130, top: 1650, width: 300, height: 340, background: "linear-gradient(90deg, #222, #3A3A3C, #222)" }} />
          <div style={{ position: "absolute", left: 880, top: 1960, width: 800, height: 40, borderRadius: 20, background: "#2C2C2E" }} />
          <div style={{ position: "absolute", left: -46, top: -CH - 46, width: 2652, height: 1600 + CH + 92, borderRadius: 40, background: "#0A0A0A", boxShadow: "0 0 0 4px #2C2C2E, 0 80px 160px rgba(0,0,0,0.7)" }} />
          <div style={{ position: "absolute", left: 1220, top: -CH - 110, width: 120, height: 70, borderRadius: 20, background: "#151515", boxShadow: "0 0 0 3px #2A2A2A" }}>
            <div style={{ position: "absolute", left: 42, top: 18, width: 36, height: 36, borderRadius: 18, background: "radial-gradient(circle at 40% 40%, #3A4A6A, #05070A 70%)" }} />
          </div>
          {/* navigateur */}
          <div style={{ position: "absolute", left: 0, top: -CH, width: 2560, height: CH, background: "#202022", display: "flex", alignItems: "center", gap: 18, padding: "0 30px", boxSizing: "border-box" }}>
            {["#FF5F57", "#FEBC2E", "#28C840"].map((col) => <div key={col} style={{ width: 22, height: 22, borderRadius: 11, background: col }} />)}
            <div style={{ marginLeft: 30, flex: 1, height: 76, borderRadius: 38, background: "#3A3A3C", display: "flex", alignItems: "center", padding: "0 34px", fontFamily: "Open Sans", fontSize: 36, color: "#E5E5EA", gap: 16 }}>
              <span style={{ fontFamily: EMOJI, fontSize: 28 }}>🔒</span>
              <span style={{ background: t >= T_COPIE && t < T_MM ? "#3E6FD8" : "transparent", padding: "2px 4px", borderRadius: 4 }}>{adresse(t)}</span>
            </div>
          </div>
          {/* la page */}
          <div style={{ position: "absolute", left: 0, top: 0, width: 2560, height: 1600, overflow: "hidden", background: "#0B0A0B" }}>
            {img ? <Img src={staticFile(`tuto/${img}.jpg`)} style={{ width: 2560, height: 1600 }} /> : <PageOffre t={t} />}
            {/* cases mises en valeur */}
            <Cadre t={t} a={at(43)} b={T_LU} r={box("003-cv-lecture", "reading")} label="NOUVEAU" z={z} />
            <Cadre t={t} a={at(61) - 0.1} b={at(65) - 0.1} r={box("013-offre", "paste")} />
            <Cadre t={t} a={at(83)} b={sc(5)} r={box("025-resultat", "score")} pad={8} />
            {[1, 2, 3, 4, 5, 6, 7].map((i, j) => <Cadre key={i} t={t} a={at(85) + j * 0.13} b={at(91) - 0.1} r={box("025-resultat", `chip${i}`)} pad={6} />)}
            {[0, 8, 9].map((i, j) => <Cadre key={i} t={t} a={at(91) + j * 0.15} b={T_GEN - 0.3} r={box("025-resultat", `chip${i}`)} pad={6} dash color="#F5F5F7" />)}
            <Cadre t={t} a={at(117) - 0.05} b={T_TROUVE} r={box("039-lettre", "logo")} pad={14} />
            <Cadre t={t} a={T_TROUVE + 0.1} b={T_STYLES} r={[box("032-generation", "logoOk")[0] - 120, 410, box("032-generation", "logoOk")[2] + 140, 110]} label="TROUVÉ TOUT SEUL" z={z} />
            {["s0", "s1", "s2", "s3"].map((k, j) => <Cadre key={k} t={t} a={at(126) + j * 0.22} b={T_CV - 0.05} r={box("040-styles", k)} pad={6} />)}
            <Cadre t={t} a={at(137) + 0.2} b={T_FIN} r={[460, 278, 1640, 1146]} pad={10} label="1 PAGE" z={z} />
            <PhotoCV t={t} x={c?.x ?? dzx + 200} y={c?.y ?? dzy - 40} />
            <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
              {c && c.o > 0 && <Pointer x={c.x} y={c.y} hover={c.h} press={press(t)} o={c.o} />}
              {CLICS.map((a) => c && <Ripple key={a} x={c.x} y={c.y} t={t} t0={a} />)}
            </div>
            {/* reflet de l'écran et trame légère (on filme un écran) */}
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${115 + Math.sin(t * 0.4) * 6}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.07) 45%, rgba(255,255,255,0) 60%)`, zIndex: 20 }} />
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, rgba(0,0,0,0.05) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 5px)", zIndex: 20 }} />
          </div>
        </div>
      </div>
      {/* vignette de la caméra du téléphone */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// ─── Yann masqué, face caméra (ses vraies photos) ───
const POSES: [number, string, number][] = [[-1, "emo-reflexion", 1], [at(8), "g2-argumenter", 1.06], [at(13), "g2-argumenter", 1.16], [T_YANN - 1, "g2-expliquer", 1], [at(154), "emo-joie", 1.1]];
const Yann: React.FC<{ t: number }> = ({ t }) => {
  let k = 0;
  POSES.forEach(([a], i) => { if (t >= a) k = i; });
  const [a, pose, zoom] = POSES[k];
  const punch = zoom * (1 + 0.04 * Math.exp(-(t - a) * 10));
  const sx = Math.sin(t * 1.9) * 6, sy = Math.cos(t * 1.4) * 5, rz = Math.sin(t * 1.1) * 0.8;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 72% 30%, #4A3A36 0%, #2A2124 30%, #141013 70%, #0B0A0B 100%)", overflow: "hidden" }}>
      {/* lumière de fenêtre floue et petites lampes (bokeh) */}
      <div style={{ position: "absolute", left: 640, top: 160, width: 420, height: 760, background: "rgba(255,236,214,0.16)", filter: "blur(60px)", transform: `translateX(${-sx * 2}px)` }} />
      {[[140, 520, 90, "#D9828B"], [260, 760, 60, "#F2C46D"], [900, 1300, 110, "#F2B8C0"]].map(([x, y, r, col], i) => (
        <div key={i} style={{ position: "absolute", left: (x as number) - sx * 3, top: y as number, width: r as number, height: r as number, borderRadius: "50%", background: col as string, opacity: 0.18, filter: "blur(18px)" }} />
      ))}
      <div style={{ position: "absolute", left: X - 470, top: 470, width: 940, height: 1180, transformOrigin: "50% 25%", transform: `translate(${sx}px, ${sy}px) rotate(${rz}deg) scale(${punch})` }}>
        <Img src={staticFile(`yann/${pose}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 100%" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
};

// ─── l'accroche, en bandeau gris translucide tout du long (comme le texte TikTok de la référence) ───
const Accroche: React.FC = () => (
  <div style={{ position: "absolute", left: 0, width: 1080, top: 292, padding: "14px 0", background: "rgba(38,36,38,0.78)", zIndex: 30 }}>
    <div style={{ width: 800, marginLeft: 120, textAlign: "center", fontFamily: `Poppins, ${EMOJI}`, fontWeight: 600, fontSize: 46, lineHeight: 1.22, color: "#fff" }}>
      Les recruteurs veulent pas que<br />tu saches ça <span style={{ fontFamily: EMOJI }}>🤫‼️</span>
    </div>
  </div>
);

// ─── l'étape en cours : étiquette blanche (texte TikTok), numéro rose ───
const ETAPES: [number, number, string, string?][] = [
  [T_ECRAN + 0.3, T_MM, "1", "Copie le lien de l'offre"],
  [at(34), at(43) - 0.05, "2", "Glisse ton CV"],
  [at(43) - 0.05, T_OFFRE, "2", "Même en photo 📸"],
  [T_OFFRE + 0.05, T_ANALYSE, "3", "Colle le lien (ou le texte)"],
  [T_ANALYSE + 0.05, at(83) - 0.1, "4", "L'analyse"],
  [at(83) - 0.1, at(101) - 0.15, "4", "Ton score"],
  [at(101) - 0.15, at(117) - 0.15, "5", "Ta lettre en 30 s*"],
  [at(117) - 0.15, T_STYLES, "5", "Avec le logo de l'entreprise"],
  [T_STYLES + 0.05, T_CV, "6", "4 styles de PDF"],
  [T_CV, T_FIN, "6", "Ton CV adapté à l'offre"],
];
const Etape: React.FC<{ t: number }> = ({ t }) => {
  const e = ETAPES.find(([a, b]) => t >= a && t < b);
  if (!e) return null;
  const [a, , n, txt] = e;
  return (
    <div style={{ position: "absolute", left: X, top: 500, transform: `translate(-50%, -50%) scale(${bounce(t, [[a, 0.6], [a + 0.22, 1]], 0.08)})`, zIndex: 28,
      display: "flex", alignItems: "center", gap: 16, padding: "12px 28px 12px 14px", borderRadius: 22, background: "#fff", boxShadow: "0 12px 34px rgba(0,0,0,0.5)", whiteSpace: "nowrap" }}>
      <span style={{ width: 62, height: 62, borderRadius: 31, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: 38, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
      <span style={{ fontFamily: `Poppins, ${EMOJI}`, fontWeight: 800, fontSize: 48, color: "#0B0A0B" }}>{txt}</span>
    </div>
  );
};

// ─── le tampon « rien d'inventé » ───
const Tampon: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) =>
  t < a || t > b ? null : (
    <div style={{ position: "absolute", left: X, top: 1095, transform: `translate(-50%, -50%) rotate(-7deg) scale(${bounce(t, [[a, 2.2], [a + 0.16, 1]], 0.1, 3, 7)})`, opacity: seg(t, a, a + 0.06) * (1 - seg(t, b - 0.2, b)), zIndex: 27,
      padding: "10px 34px", border: `8px solid ${PINK_L}`, borderRadius: 20, color: PINK_L, fontFamily: "Poppins", fontWeight: 900, fontSize: 70, letterSpacing: 2, whiteSpace: "nowrap", background: "rgba(11,10,11,0.72)", boxShadow: `0 0 40px rgba(217,130,139,0.5)` }}>
      RIEN D'INVENTÉ
    </div>
  );

// ─── l'appel à commenter, à la fin ───
const AppelCommentaire: React.FC<{ t: number }> = ({ t }) => {
  const a = at(154) - 0.1;
  if (t < a) return null;
  return (
    <div style={{ position: "absolute", left: X, top: 520, transform: `translate(-50%, -50%) scale(${bounce(t, [[a, 0.6], [a + 0.22, 1]], 0.08)})`, zIndex: 28, padding: "14px 30px", borderRadius: 22, background: PINK, color: "#fff",
      fontFamily: `Poppins, ${EMOJI}`, fontWeight: 800, fontSize: 52, whiteSpace: "nowrap", boxShadow: "0 12px 34px rgba(0,0,0,0.5)" }}>
      Ton score en commentaire 👇
    </div>
  );
};

export const TutoEcran: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const yann = t < T_ECRAN || t >= T_YANN;
  return (
    <AbsoluteFill style={{ background: "#0B0A0B", overflow: "hidden" }}>
      {yann ? <Yann t={t} /> : <Ecran t={t} />}
      {/* un voile en bas pour lire les sous-titres, même sur une page blanche */}
      {!yann && <div style={{ position: "absolute", left: 0, right: 0, top: 1120, height: 800, background: "linear-gradient(180deg, rgba(11,10,11,0) 0%, rgba(11,10,11,0.7) 30%, rgba(11,10,11,0.85) 100%)", zIndex: 15 }} />}
      {t >= T_FIN && t < T_YANN && <FinOfferte t={t} t0={T_FIN} aBio={at(148) - 0.05} dark sous="Sans carte bancaire." />}
      <Etape t={t} />
      <Tampon t={t} a={at(96) - 0.05} b={T_GEN - 0.3} />
      <AppelCommentaire t={t} />
      <Mention t={t} a={at(105)} b={T_STYLES} text="* temps mesuré : 27 à 35 s par lettre" y={1405} color="#B8B8BD" />
      <Mention t={t} a={T_STYLES + 0.1} b={T_FIN} text={`CV adapté inclus dès ${PLANS.letter.price} · 4 styles de PDF avec les offres illimitées`} y={1385} color="#B8B8BD" />
      <div style={{ position: "absolute", inset: 0, zIndex: 25 }}><Caption t={t} /></div>
      <Accroche />
      <Audio src={staticFile("audio/tuto.wav")} />
    </AbsoluteFill>
  );
};
