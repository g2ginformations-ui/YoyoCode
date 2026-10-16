// « Je donne la mission à MyMotiv » (≈51 s, 30 i/s, 9:16) : 1re vidéo du format « démo racontée en écran partagé »
// (briques src/splitDemo.tsx, style mesuré dans styles/demo-racontee.md, d'après une vidéo de référence envoyée par le
// propriétaire le 16/10/2026 : on reprend la construction et le rythme, jamais son image, son produit ni ses phrases).
// Déroulé : accroche « j'ai construit un site… je te montre » (ordinateur dans une pièce sombre, filé flou) → écran partagé :
// la mission (Camille → Maison Lumen) → il lit le CV (même en photo) → il lit l'offre (lien, ou texte si le site bloque) →
// il compare : 70 % et les mots-clés (plan plein écran) → « c'est le vrai site, pas une maquette » (visage plein écran) →
// la lettre avec le logo → « le plus fou » : la preuve « 18 % » de la lettre reliée à la ligne du CV → « il n'invente pas »
// (texte du site) → chiffres : 1 lettre, 0:30* → le CV adapté (avec son prix réel, lettre-ia/lib/pricing.ts) → « commente
// LETTRE, je t'envoie le lien en DM ». Captures : public/tuto/ (ordinateur) et public/tuto-tel/ (téléphone), réponses de
// l'IA simulées pour l'exemple, d'où « le vrai site, pas une maquette » et jamais « en direct ». Voix voix-mission.json.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PLANS } from "../../lettre-ia/lib/pricing";
import { bounce } from "./apple";
import { PINK, PINK_L, easeInOut, lerp, seg } from "./common";
import voixBrute from "./data/mission-voix.json";
import { K } from "./kinetic";
import { Mention, X, horloge } from "./pubMotion";
import { Cadre, Cam, Capture, ECRAN, Fond, Panneau, SERIF, ST_Y, SousTitre, Visage, blocs, fileFlou } from "./splitDemo";
import "./fonts";

export const MISSION_DUR = voixBrute.duration;
const { at, sc } = horloge(voixBrute);
// les nombres dits en lettres s'écrivent en chiffres dans les sous-titres
const ECRIT: [RegExp, string][] = [[/soixante-dix pour cent/, "70 %"], [/dix-huit pour cent/, "18 %"], [/trente secondes/, "30 secondes"]];
const voix = { ...voixBrute, phrases: voixBrute.phrases.map((p) => ({ ...p, text: ECRIT.reduce((s, [r, v]) => s.replace(r, v), p.text) })) };
const BL = blocs(voix);
const CLES = new Set(["lettre", "cv", "mission", "mymotiv", "photo", "offre", "lien", "texte", "70", "motscles", "maquette", "logo", "seul", "fou",
  "preuve", "18", "repris", "invente", "mesure", "30", "page", "offerte", "lettre", "montre", "camille"]);
const pop = (t: number, a: number) => bounce(t, [[a, 0.6], [a + 0.18, 1]], 0.08, 3, 7);
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const TW = 2560, TH = 1600;                                         // captures ordinateur (public/tuto)
const f3 = (n: number) => String(n).padStart(3, "0");
const film = (t: number, a: number, b: number, ids: number[], nom: string) => `tuto/${f3(ids[Math.min(ids.length - 1, Math.floor(seg(t, a, b) * ids.length))])}-${nom}.jpg`;

// ─── les temps clés ───
const S1 = sc(1), T_FILE = at(17) - 0.05, T_ENVOI = at(29) - 0.1;
const T_SCORE = at(70) - 0.1, T_PLUSFOU = sc(7), T_PREUVE = at(120) - 0.1, T_CHIFFRES = sc(9), T_CVA = at(162) - 0.1;
const T_FIN = sc(10), T_CTA = at(184) - 0.1, T_DM = at(191) - 0.1;

const POSES: [number, string][] = [
  [-1, "g1-expliquer"], [T_ENVOI, "g2-partager"], [sc(2), "g1-narrer"], [sc(3), "g2-expliquer"], [sc(4), "g1-debattre"], [sc(5), "g1-convaincre"],
  [sc(6), "g2-raconter"], [T_PLUSFOU, "emo-surprise"], [T_PREUVE, "g2-insister"], [T_CHIFFRES, "g2-preciser"], [T_CVA, "g1-expliquer"],
  [T_FIN, "g2-affirmer"], [T_CTA, "g2-argumenter"], [T_DM, "g1-dialoguer"],
];

// ─── 0. l'accroche : l'ordinateur dans une pièce sombre, lumière rose-rouge ───
const Accroche: React.FC<{ t: number }> = ({ t }) => {
  const sx = Math.sin(t * 2.3) * 7, sy = Math.cos(t * 1.7) * 6, z = 1 + 0.05 * seg(t, 0, 4.6);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 72% 30%, #8A2433 0%, #3A0E16 38%, #0B0A0B 75%)", overflow: "hidden", ...fileFlou(t, T_FILE, S1 + 0.1) }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sx}px, ${sy}px) scale(${z})` }}>
        <div style={{ position: "absolute", left: 300, top: 700, width: 760, perspective: 1400 }}>
          <div style={{ transform: "rotateY(-16deg) rotateX(7deg)", transformOrigin: "50% 100%" }}>
            <div style={{ width: 760, height: 490, borderRadius: 22, background: "#111", padding: 14, boxSizing: "border-box", boxShadow: "0 0 80px rgba(217,130,139,0.35)" }}>
              <div style={{ position: "relative", width: 732, height: 462, borderRadius: 10, overflow: "hidden" }}>
                <Capture t={t} src="tuto/039-lettre.jpg" W={TW} H={TH} vw={732} vh={462} cams={[[0, 1280, 760, 1.05], [4.6, 1100, 600, 1.35]]} />
              </div>
            </div>
            <div style={{ width: 860, height: 34, marginLeft: -50, background: "linear-gradient(180deg, #2A2A2E, #121214)", borderRadius: "0 0 26px 26px", transform: "perspective(600px) rotateX(55deg)" }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: -330, top: 760, width: 820, height: 1220 }}>
          <Img src={staticFile("yann/g2-argumenter.png")} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 0%", filter: "brightness(0.8) saturate(0.9)" }} />
        </div>
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.55) 100%)" }} />
    </AbsoluteFill>
  );
};

// ─── la mission (carte maison, pas une interface du site) ───
const MISSION = "Camille Dubois → Manager des ventes chez Maison Lumen";
const Mission: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.floor(MISSION.length * seg(t, S1 + 0.3, at(27) + 0.4)), envoye = t >= T_ENVOI;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 30%, #2A1A1E 0%, #121013 70%)" }}>
      <div style={{ position: "absolute", left: 50, top: 150, right: 50, fontFamily: "Poppins, 'Noto Color Emoji'", fontWeight: 700, fontSize: 30, letterSpacing: 4, color: PINK_L }}>📁 NOUVELLE MISSION</div>
      <div style={{ position: "absolute", left: 50, right: 50, top: 230, minHeight: 210, borderRadius: 28, background: "#1C191C", border: `2px solid ${envoye ? PINK : "#3A3436"}`, padding: "32px 120px 32px 36px",
        boxSizing: "border-box", fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 46, lineHeight: 1.35, color: "#fff" }}>
        {MISSION.slice(0, n)}{!envoye && Math.floor(t * 2.5) % 2 === 0 && <span style={{ color: PINK }}>|</span>}
        <div style={{ position: "absolute", right: 26, bottom: 26, width: 76, height: 76, borderRadius: 38, background: PINK, color: "#fff", fontSize: 44, fontWeight: 800,
          display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${envoye ? 1 - 0.18 * Math.exp(-Math.pow((t - T_ENVOI) / 0.08, 2)) : 1})` }}>↑</div>
      </div>
      {[["📄 CV_Camille.jpg", at(22) - 0.1], ["🔗 L'offre de Maison Lumen", at(27) - 0.1]].map(([txt, a], i) => t >= (a as number) && (
        <div key={i} style={{ position: "absolute", left: 50 + i * 420, top: 480, padding: "12px 24px", borderRadius: 20, background: "#241F23", color: "#E9E3E5",
          fontFamily: "'Open Sans', 'Noto Color Emoji'", fontWeight: 600, fontSize: 32, transform: `scale(${pop(t, a as number)})` }}>{txt as string}</div>
      ))}
    </AbsoluteFill>
  );
};

// ─── le panneau du haut : les plans du site, l'un après l'autre ───
type Plan = { a: number; img: (t: number) => string; cams: Cam[]; cadres?: Cadre[]; W?: number; H?: number };
const PLANS_HAUT: Plan[] = [
  { a: T_ENVOI + 0.35, img: () => "tuto/001-cv.jpg", cams: [[T_ENVOI, 1280, 560, 2.0], [sc(2), 1280, 620, 2.15]] },
  { a: sc(2) + 0.05, img: (t) => t < at(39) - 0.1 ? "tuto/002-cv-glisse.jpg" : t < at(46) - 0.1 ? film(t, at(39) - 0.1, at(46) - 0.1, [3, 4, 5, 6, 7, 8, 9, 10, 11], "cv-lecture") : "tuto/012-cv-lu.jpg",
    cams: [[sc(2), 1280, 640, 2.1], [at(46), 1280, 560, 2.45]], cadres: [{ a: at(46) - 0.1, box: [832, 478, 896, 148] }] },
  { a: sc(3), img: (t) => t < at(55) - 0.1 ? "tuto/013-offre.jpg" : "tuto/014-offre-collee.jpg",
    cams: [[sc(3), 1280, 480, 2.1], [at(55), 1280, 600, 2.45]], cadres: [{ a: at(55) - 0.1, b: at(60) - 0.1, box: [832, 523, 896, 114] }, { a: at(60) - 0.1, box: [1036, 636, 488, 81] }] },
  { a: sc(4), img: (t) => film(t, sc(4), T_SCORE, [16, 17, 18, 19, 20, 21], "analyse"), cams: [[sc(4), 1280, 760, 2.0], [T_SCORE, 1280, 740, 2.15]] },
  { a: sc(6), img: (t) => t < at(103) - 0.1 ? film(t, sc(6), at(103) - 0.1, [33, 34, 35, 36, 37, 38], "generation") : "tuto/039-lettre.jpg",
    cams: [[sc(6), 1280, 800, 1.0], [at(103) - 0.1, 1280, 800, 1.0], [at(103) + 0.5, 760, 470, 2.3]], cadres: [{ a: at(105) - 0.1, box: [280, 308, 760, 104] }] },
  { a: sc(8), img: () => "tuto/041-cv-page.jpg", cams: [[sc(8), 740, 860, 2.2], [at(148) - 0.4, 740, 860, 2.2], [at(148) + 0.1, 760, 430, 2.2]],
    cadres: [{ a: at(148) - 0.1, box: [205, 382, 1050, 100] }] },
  { a: T_CVA, img: () => "tuto/043-cv-adapte.jpg", cams: [[T_CVA, 1280, 640, 1.5], [at(166), 1000, 900, 2.2]], cadres: [{ a: at(166) - 0.1, box: [540, 946, 630, 52] }] },
];
const Haut: React.FC<{ t: number }> = ({ t }) => {
  let p: Plan | null = null;
  PLANS_HAUT.forEach((x) => { if (t >= x.a) p = x; });
  return (
    <Panneau>
      {t < T_ENVOI + 0.35 ? <Mission t={t} /> : p && <Capture t={t} src={(p as Plan).img(t)} W={TW} H={TH} vw={ECRAN.w} vh={ECRAN.h} cams={(p as Plan).cams} cadres={(p as Plan).cadres} />}
      {t >= T_CVA && t < T_FIN && <div style={{ position: "absolute", left: X - ECRAN.x, top: ECRAN.h - 70, transform: `translate(-50%, -50%) scale(${pop(t, at(166) + 0.2)})`, padding: "10px 26px",
        borderRadius: 22, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 34, whiteSpace: "nowrap", opacity: t >= at(166) + 0.2 ? 1 : 0 }}>CV adapté : inclus dès {PLANS.letter.price}</div>}
    </Panneau>
  );
};

// ─── plans plein écran ───
const Score: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Fond />
    <Panneau r={{ x: 40, y: 300, w: 1000, h: 830 }}>
      <Capture t={t} src="tuto/025-resultat.jpg" W={TW} H={TH} vw={1000} vh={830} cams={[[T_SCORE, 1280, 735, 2.4], [sc(5), 1280, 760, 2.5]]}
        cadres={[{ a: T_SCORE, b: at(79) - 0.1, box: [864, 514, 208, 208] }, { a: at(79) - 0.1, box: [832, 778, 896, 206] }]} />
    </Panneau>
  </>
);
const Preuve: React.FC<{ t: number }> = ({ t }) => {
  const carte = (a: number, y: number, label: string, enfant: React.ReactNode, h = 160) => t < a ? null : (
    <div style={{ position: "absolute", left: 60, right: 60, top: y, borderRadius: 28, background: "#141215", border: "2px solid #2E2A2D", padding: "22px 30px 26px", boxSizing: "border-box",
      transform: `scale(${pop(t, a)})`, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
      <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 28, letterSpacing: 4, color: PINK_L, marginBottom: 14 }}>{label}</div>
      <div style={{ position: "relative", width: 900, height: h, borderRadius: 14, overflow: "hidden", margin: "0 auto" }}>{enfant}</div>
    </div>
  );
  return (
    <>
      <Fond />
      {carte(T_PREUVE + 0.05, 330, "SA LETTRE", <Capture t={t} src="tuto-tel/040-lettre.jpg" W={1080} H={1920} vw={900} vh={160} cams={[[0, 560, 872, 1.227]]}
        cadres={[{ a: at(127) - 0.1, box: [140, 808, 790, 134] }]} />)}
      {carte(at(126) - 0.1, 690, "SON CV", <Capture t={t} src="tuto/041-cv-page.jpg" W={TW} H={TH} vw={900} vh={124} cams={[[0, 575, 860, 4.2]]}
        cadres={[{ a: at(132) - 0.1, box: [272, 858, 600, 40] }]} />, 124)}
      {t >= at(134) - 0.1 && <div style={{ position: "absolute", left: X, top: 1035, transform: `translate(-50%, -50%) scale(${pop(t, at(134) - 0.1)})`, padding: "12px 30px", borderRadius: 26,
        background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: 42, whiteSpace: "nowrap" }}>✓ Repris de son CV, rien d'inventé</div>}
    </>
  );
};
const Chiffres: React.FC<{ t: number }> = ({ t }) => {
  const temps = t >= at(159) - 0.1;
  const sec = Math.round(30 * ease(t, at(159) - 0.1, at(159) + 0.7));
  return (
    <>
      <Fond />
      <div style={{ position: "absolute", left: X, top: 470, transform: `translate(-50%, -50%) scale(${pop(t, temps ? at(159) - 0.1 : T_CHIFFRES + 0.05)})`, fontFamily: K, fontWeight: 900,
        fontSize: temps ? 240 : 300, color: "#fff", letterSpacing: -6, whiteSpace: "nowrap" }}>{temps ? `0:${String(sec).padStart(2, "0")}*` : "1"}</div>
      <div style={{ position: "absolute", left: X, top: 690, transform: "translate(-50%, -50%)", fontFamily: SERIF, fontStyle: "italic", fontSize: 130, color: PINK, whiteSpace: "nowrap" }}>
        {temps ? "par lettre" : "lettre sur mesure"}</div>
    </>
  );
};
const Appel: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.floor(6 * seg(t, at(186) - 0.1, at(186) + 0.45)), tape = "LETTRE".slice(0, n);
  return (
    <>
      <Fond />
      <div style={{ position: "absolute", left: X, top: 360, transform: "translate(-50%, -50%)", fontFamily: "Poppins", fontWeight: 800, fontSize: 96, color: "#fff" }}>Commente</div>
      {t >= at(186) - 0.1 && <div style={{ position: "absolute", left: X, top: 540, transform: `translate(-50%, -50%) scale(${pop(t, at(186) - 0.1)})`, fontFamily: SERIF, fontStyle: "italic",
        fontSize: 250, color: PINK, lineHeight: 1 }}>LETTRE</div>}
      <div style={{ position: "absolute", left: 120, width: 800, top: 720, height: 110, borderRadius: 55, background: "#1C191C", border: "2px solid #3A3436", display: "flex", alignItems: "center",
        padding: "0 22px 0 40px", boxSizing: "border-box", fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: n ? "#fff" : "#77706F" }}>
        <span style={{ flex: 1 }}>{n ? tape : "Ajouter un commentaire..."}</span>
        <span style={{ width: 70, height: 70, borderRadius: 35, background: PINK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>↑</span>
      </div>
      {t >= T_DM && (
        <div style={{ position: "absolute", left: 120, width: 800, top: 870, display: "flex", gap: 18, alignItems: "center", opacity: seg(t, T_DM, T_DM + 0.2), transform: `translateY(${(1 - ease(t, T_DM, T_DM + 0.3)) * 20}px)` }}>
          <div style={{ width: 76, height: 76, borderRadius: 38, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>mm.</div>
          <div>
            <div style={{ fontFamily: "'Open Sans'", fontSize: 26, color: "#8E8A8B" }}>mymotiv · à l'instant</div>
            <div style={{ fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 34, color: "#fff" }}>Le lien pour ta <span style={{ color: PINK_L }}>1re lettre offerte</span> 💌</div>
          </div>
        </div>
      )}
    </>
  );
};
const Offerte: React.FC = () => (
  <Panneau>
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #3A2327 0%, #1E1719 45%, #121013 80%)" }} />
    <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: ECRAN.w / 2 - 260, top: 150, width: 520 }} />
  </Panneau>
);

export const DemoMission: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const entre = ease(t, S1 - 0.12, S1 + 0.2);
  const plein = (t >= T_SCORE && t < sc(6)) || (t >= T_PLUSFOU && t < sc(8));
  const visage = t >= sc(5) && t < sc(6) || (t >= T_PLUSFOU && t < T_PREUVE);
  return (
    <AbsoluteFill style={{ background: "#070607", overflow: "hidden" }}>
      {t >= S1 - 0.12 && (
        <AbsoluteFill style={{ transform: `translateX(${lerp(1400, 0, entre)}px)`, filter: `blur(${(1 - entre) * 22}px)` }}>
          {visage ? <Visage t={t} poses={POSES} plein /> : plein ? (t < sc(5) ? <Score t={t} /> : <Preuve t={t} />) : (
            <>
              <Fond />
              {t < T_CHIFFRES ? <Haut t={t} /> : t < T_CVA ? <Chiffres t={t} /> : t < T_FIN ? <Haut t={t} /> : t < T_CTA ? <Offerte /> : <Appel t={t} />}
              {t >= T_FIN && t < T_CTA && (
                <>
                  <div style={{ position: "absolute", left: X, top: ECRAN.y + 560, transform: `translate(-50%, -50%) scale(${pop(t, at(179) - 0.1)})`, padding: "18px 44px", borderRadius: 40, background: PINK,
                    color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: 54, whiteSpace: "nowrap", boxShadow: `0 0 0 ${t >= at(179) ? 6 : 0}px rgba(217,130,139,0.35), 0 0 40px ${PINK}`, opacity: t >= at(179) - 0.1 ? 1 : 0 }}>Ta 1re lettre est offerte</div>
                  <div style={{ position: "absolute", left: X, top: ECRAN.y + 660, transform: "translate(-50%, -50%)", fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 34, color: "#B8B1B3", opacity: seg(t, at(181), at(181) + 0.3), whiteSpace: "nowrap" }}>Sans inscription, sans carte bancaire</div>
                </>
              )}
              <Visage t={t} poses={POSES} />
            </>
          )}
        </AbsoluteFill>
      )}
      {t < S1 + 0.1 && <Accroche t={t} />}
      <Sous t={t} plein={plein} visage={visage} />
      <Mention t={t} a={at(159) - 0.1} b={T_CVA} text="* temps mesuré : 27 à 35 s par lettre" y={820} color="#B8B8BD" />
      <Audio src={staticFile("audio/mission.wav")} />
    </AbsoluteFill>
  );
};

// les sous-titres : en haut sur l'accroche, au milieu sur l'écran partagé, plus bas sur les plans pleins
const Sous: React.FC<{ t: number; plein: boolean; visage: boolean }> = ({ t, plein, visage }) => {
  const y = t < S1 ? 330 : visage ? 1150 : plein ? 1240 : ST_Y;
  return <SousTitre t={t} bl={BL} cles={CLES} y={y} size={t < S1 ? 74 : 70} />;
};
