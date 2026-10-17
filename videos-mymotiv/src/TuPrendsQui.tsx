// « Tu prends qui ? » (≈33 s, 30 i/s, 9:16) : vidéo faite pour les COMMENTAIRES (demande du propriétaire du 16/10/2026 :
// beaucoup de vues, trop peu de commentaires, « clivant mais subtilement »). Un vrai dilemme de recruteur, sans bonne
// réponse, qui coupe le public en deux camps : la lettre A, écrite seul en 2 heures, sincère mais avec des fautes, contre
// la lettre B, faite avec une IA en 30 s*, sans faute, dont tout vient du CV. Déclencheurs (tous vrais) : deux camps
// équilibrés, « interdit de répondre ça dépend », la réponse de Yann promise sous le commentaire le plus liké, une 3e faute
// non entourée dans la lettre A pour ceux qui regardent bien, bandeau « A ou B en commentaire » dès 0,3 s, fin qui reboucle
// sur la 1re image. Aucun prénom ni genre pour les candidats (A et B), aucune entreprise réelle. Format par défaut « démo
// racontée » (src/splitDemo.tsx) : les lettres en haut, sous-titres au milieu, Yann masqué en bas. Son : synth_tuprends.py.
import React from "react";
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce } from "./apple";
import { Bandeau, Rose } from "./bandeau";
import { PINK, easeInOut, lerp, seg } from "./common";
import voix from "./data/tuprends-voix.json";
import { X, horloge } from "./pubMotion";
import { Fond, SERIF, SousTitre, Visage, blocs } from "./splitDemo";
import "./fonts";

if (typeof document !== "undefined") {
  const h = delayRender("Caveat (écriture à la main)");
  const face = new FontFace("Caveat", `url(${staticFile("fonts/caveat-latin-700-normal.woff2")})`, { weight: "700" });
  document.fonts.add(face);
  face.load().then(() => continueRender(h)).catch(() => continueRender(h));
}

export const TUPRENDS_DUR = voix.duration;
const { at, sc } = horloge(voix);
const ROSE_C = "#F2B8C0", ROUGE = "#E5484D";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const pop = (t: number, a: number) => bounce(t, [[a, 0.5], [a + 0.18, 1]], 0.08, 3, 7);

// ─── les temps clés (calés sur la voix) ───
const T_A = sc(1), T_B = sc(2), T_VS = sc(3), T_QUI = at(53), T_DEPEND = at(59), T_STAMP = at(61) + 0.3, T_YANN = sc(5), T_FIN = sc(6);
const T_ZOOM = at(22), T_CERCLES = at(27);

// ─── le panneau du haut (sous le bandeau) ───
const P = { x: 30, y: 375, w: 1020, h: 640 };
const VS_W = 360, CARTE = { w: 470, h: 560 }, k0 = VS_W / CARTE.w;
type Pos = [number, number, number];                 // x, y (coin haut gauche, en px de l'image), échelle
const VS_A: Pos = [125, 500, k0], VS_B: Pos = [555, 500, k0], SEUL: Pos = [120, 425, 1], GAUCHE: Pos = [-520, 425, 1], DROITE: Pos = [1120, 425, 1];
function posAt(t: number, keys: [number, Pos][]): Pos {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [a, p0] = keys[i], [b, p1] = keys[i + 1];
    if (t < b) { const k = ease(t, a, b); return [lerp(p0[0], p1[0], k), lerp(p0[1], p1[1], k), lerp(p0[2], p1[2], k)]; }
  }
  return keys[keys.length - 1][1];
}
const KA: [number, Pos][] = [[T_A - 0.1, VS_A], [T_A + 0.35, SEUL], [T_B - 0.1, SEUL], [T_B + 0.3, GAUCHE], [T_VS - 0.15, GAUCHE], [T_VS + 0.3, VS_A]];
const KB: [number, Pos][] = [[T_A - 0.1, VS_B], [T_A + 0.3, DROITE], [T_B - 0.1, DROITE], [T_B + 0.35, SEUL], [T_VS - 0.15, SEUL], [T_VS + 0.3, VS_B]];

// ─── les deux lettres ───
const Faute: React.FC<{ t: number; cercle?: number; children: React.ReactNode }> = ({ t, cercle, children }) => {
  const k = cercle === undefined ? 0 : seg(t, cercle, cercle + 0.3);
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {children}
      {k > 0 && <span style={{ position: "absolute", left: -12, top: -2, right: -12, bottom: -2, border: `4px solid ${ROUGE}`, borderRadius: "50%", transform: "rotate(-4deg)",
        clipPath: `inset(0 ${100 - 100 * k}% 0 0)` }} />}
    </span>
  );
};
const LettreA: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ width: CARTE.w, height: CARTE.h, background: "#F6F0E4", borderRadius: 10, padding: "30px 34px", boxSizing: "border-box", position: "relative", overflow: "hidden",
    backgroundImage: "repeating-linear-gradient(180deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0) 41px, rgba(70,90,160,0.18) 41px, rgba(70,90,160,0.18) 42px)", backgroundPosition: "0 22px",
    fontFamily: "Caveat", fontWeight: 700, fontSize: 33, lineHeight: "42px", color: "#22306B", boxShadow: "0 24px 60px rgba(0,0,0,0.55)" }}>
    <div style={{ textAlign: "right", fontSize: 27 }}>À l'attention de Maison Lumen</div>
    <div>Madame, Monsieur,</div>
    <div>Votre boutique, je la connais par cœur : j'y passe depuis le lycée et j'ai toujours <Faute t={t} cercle={T_CERCLES}>rêver</Faute> d'y travailler.</div>
    <div>Conseiller les clients, c'est ce qui me <Faute t={t} cercle={T_CERCLES + 0.25}>tiens</Faute> à cœur. Je suis disponible a partir de lundi.</div>
    <div>Merci de votre attention.</div>
    <div style={{ textAlign: "right", fontSize: 38 }}>A.</div>
  </div>
);
const LettreB: React.FC<{ t: number }> = ({ t }) => {
  const preuve = seg(t, at(45), at(45) + 0.25) * (1 - seg(t, T_VS - 0.2, T_VS));
  return (
    <div style={{ width: CARTE.w, height: CARTE.h, background: "#FFFFFF", borderRadius: 10, padding: "34px 36px", boxSizing: "border-box", position: "relative", overflow: "hidden",
      fontFamily: "'Open Sans'", fontWeight: 400, fontSize: 21, lineHeight: 1.55, color: "#1E1C1D", boxShadow: "0 24px 60px rgba(0,0,0,0.55)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 16, color: "#8A8487", marginBottom: 18 }}><span>Candidat B</span><span>Pour : Maison Lumen</span></div>
      <div style={{ marginBottom: 12 }}>Madame, Monsieur,</div>
      <div style={{ marginBottom: 12 }}>Votre offre cherche quelqu'un qui fasse grandir le panier moyen. Je l'ai déjà fait chez Maison &amp; Déco :{" "}
        <span style={{ fontWeight: 600, borderRadius: 6, padding: "0 4px", background: `rgba(217,130,139,${0.28 * preuve})`, boxShadow: preuve > 0 ? `0 0 0 ${3 * preuve}px ${PINK}` : "none" }}>+18 % en un an</span>, en conseillant chaque client.</div>
      <div style={{ marginBottom: 12 }}>Disponible dès lundi, j'aimerais vous en parler de vive voix.</div>
      <div>Cordialement,</div>
      <div style={{ textAlign: "right", fontWeight: 600, marginTop: 8 }}>B.</div>
    </div>
  );
};
const Carte: React.FC<{ t: number; keys: [number, Pos][]; lettre: "A" | "B"; zoom?: number; dim?: number; pulse?: number }> = ({ t, keys, lettre, zoom = 1, dim = 0, pulse = 1 }) => {
  const [x, y, s] = posAt(t, keys);
  const vs = s < 0.95;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: CARTE.w, height: CARTE.h, transform: `scale(${s * pulse}) rotate(${lettre === "A" ? -1.5 : 1.2}deg)`, transformOrigin: "0 0" }}>
      <div style={{ width: "100%", height: "100%", transform: `scale(${zoom})`, transformOrigin: "12% 50%", filter: dim ? `brightness(${1 - 0.55 * dim}) blur(${3 * dim}px)` : "none" }}>
        {lettre === "A" ? <LettreA t={t} /> : <LettreB t={t} />}
      </div>
      {vs && (
        <div style={{ position: "absolute", left: CARTE.w / 2 - 62, top: CARTE.h - 62, width: 124, height: 124, borderRadius: 62, background: lettre === "A" ? PINK : "#FFFFFF",
          color: lettre === "A" ? "#fff" : "#0B0A0B", fontFamily: "Poppins", fontWeight: 900, fontSize: 84, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.6)", opacity: seg(s, 0.95, 0.85) }}>{lettre}</div>
      )}
    </div>
  );
};

// ─── les étiquettes de chaque lettre (elles arrivent avec la voix) ───
type Puce = [number, string, string];
const PUCES_A: Puce[] = [[at(14), "✍️", "Écrite seul"], [at(17), "⏱️", "2 heures"], [at(21), "🫶", "Sincère"], [at(27), "❌", "Des fautes"]];
const PUCES_B: Puce[] = [[at(33), "🤖", "Avec une IA"], [at(35), "⏱️", "30 secondes*"], [at(37), "✅", "0 faute"], [at(45), "📄", "Tout vient de son CV"]];
const Puces: React.FC<{ t: number; puces: Puce[]; a: number; b: number }> = ({ t, puces, a, b }) => {
  if (t < a || t >= b) return null;
  return (
    <div style={{ position: "absolute", left: 615, top: 455, width: 300, zIndex: 5, opacity: 1 - seg(t, b - 0.25, b) }}>
      {puces.filter(([p]) => t >= p).map(([p, e, txt], i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22, padding: "12px 18px", borderRadius: 18, background: "#221C1F",
          border: "1.5px solid rgba(255,255,255,0.14)", transform: `translateX(${(1 - ease(t, p, p + 0.25)) * 40}px) scale(${pop(t, p)})`, transformOrigin: "0 50%",
          fontFamily: "Poppins", fontWeight: 700, fontSize: txt.length > 14 ? 25 : 28, color: "#fff", lineHeight: 1.15, whiteSpace: txt.length > 14 ? "normal" : "nowrap" }}>
          <span style={{ fontSize: 34 }}>{e}</span><span>{txt}</span>
        </div>
      ))}
    </div>
  );
};

// ─── les moments « versus » : le titre, la question, « ça dépend » interdit, le commentaire le plus liké ───
const Titre: React.FC<{ t: number; a: number; b: number; children: React.ReactNode; y?: number; size?: number }> = ({ t, a, b, children, y = 425, size = 64 }) => {
  if (t < a || t >= b) return null;
  return (
    <div style={{ position: "absolute", left: 120, width: 800, top: y, transform: `translate(0, -50%) scale(${pop(t, a)})`, textAlign: "center", fontFamily: "Poppins", fontWeight: 800,
      fontSize: size, color: "#fff", lineHeight: 1.05, zIndex: 8, textShadow: "0 4px 24px rgba(0,0,0,0.8)", opacity: 1 - seg(t, b - 0.15, b) }}>{children}</div>
  );
};
const Serif: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size }) => (
  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, color: ROSE_C, fontSize: size }}>{children}</span>
);
const CaDepend: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_DEPEND || t >= T_YANN + 0.05) return null;
  const st = t >= T_STAMP ? bounce(t, [[T_STAMP, 1.6], [T_STAMP + 0.12, 0.95], [T_STAMP + 0.25, 1]], 0.04, 3, 8) : 0;
  return (
    <div style={{ position: "absolute", left: X, top: 700, transform: `translate(-50%, -50%) scale(${pop(t, T_DEPEND)})`, zIndex: 9 }}>
      <div style={{ position: "relative", padding: "26px 54px", borderRadius: 46, background: "#FFFFFF", fontFamily: "Poppins", fontWeight: 800, fontSize: 70, color: "#1E1C1D", whiteSpace: "nowrap",
        boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }}>
        « ça dépend »
        <div style={{ position: "absolute", left: 60, bottom: -26, width: 0, height: 0, borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderTop: "30px solid #fff" }} />
        {st > 0 && <div style={{ position: "absolute", left: 30, right: 30, top: "52%", height: 9, background: ROUGE, borderRadius: 5, transform: `scaleX(${seg(t, T_STAMP, T_STAMP + 0.15)})`, transformOrigin: "0 50%" }} />}
      </div>
      {st > 0 && (
        <div style={{ position: "absolute", left: "50%", top: 150, transform: `translate(-50%, -50%) rotate(-10deg) scale(${st})`, padding: "8px 30px", border: `7px solid ${ROUGE}`, borderRadius: 14,
          fontFamily: "Poppins", fontWeight: 900, fontSize: 64, letterSpacing: 6, color: ROUGE, background: "rgba(11,10,11,0.55)", whiteSpace: "nowrap" }}>INTERDIT</div>
      )}
    </div>
  );
};
const LePlusLike: React.FC<{ t: number }> = ({ t }) => {
  const a = at(76), b = at(83) - 0.1;
  if (t < a || t >= b + 0.2) return null;
  return (
    <div style={{ position: "absolute", left: 140, width: 760, top: 400, zIndex: 9, display: "flex", gap: 18, alignItems: "center", padding: "18px 24px", borderRadius: 26,
      background: "rgba(28,25,28,0.92)", border: `2px solid ${ROSE_C}`, transform: `scale(${pop(t, a)})`, boxShadow: "0 16px 50px rgba(0,0,0,0.6)", opacity: 1 - seg(t, b, b + 0.2) }}>
      <div style={{ width: 70, height: 70, borderRadius: 35, background: "#3A3436", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38, flexShrink: 0 }}>👤</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 24, color: "#8E8A8B" }}>le commentaire le plus liké</div>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 32, color: "#fff" }}>↳ <Rose>ma réponse</Rose>, juste en dessous 👀</div>
      </div>
      <div style={{ fontSize: 36 }}>❤️</div>
    </div>
  );
};

// ─── sous-titres, poses de Yann ───
const BL = blocs(voix);
const CLES = new Set(["recruteur", "entretien", "seul", "heures", "sincere", "fautes", "ia", "secondes", "zero", "cv", "profil", "poste", "qui", "interdit", "depend", "recrutement", "pris", "like"]);
const POSES: [number, string][] = [[0, "g2-affirmer"], [T_A, "g2-raconter"], [T_ZOOM, "emo-confusion"], [T_B, "g2-decrire"], [at(37), "g2-preciser"], [T_VS, "g1-debattre"],
  [sc(4), "g2-insister"], [T_STAMP, "emo-joie"], [T_YANN, "emo-reflexion"], [at(69), "g2-affirmer"], [T_FIN, "g1-conclure"], [at(82), "g2-partager"]];

export const TuPrendsQui: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const plein = t >= T_YANN && t < T_FIN;
  const zoomA = 1 + 0.38 * ease(t, T_ZOOM, T_ZOOM + 0.5) * (1 - ease(t, T_B, T_B + 0.4));
  const dimVs = Math.max(ease(t, T_QUI - 0.1, T_QUI + 0.2) * (1 - ease(t, T_YANN - 0.2, T_YANN)), t >= T_FIN ? ease(t, at(76) - 0.1, at(76) + 0.2) * (1 - ease(t, at(83) - 0.4, at(83) - 0.1)) : 0);
  const finale = t >= at(83) - 0.1;
  const pulseA = finale ? 1 + 0.035 * Math.max(0, Math.sin((t - at(83)) * 7)) : 1, pulseB = finale ? 1 + 0.035 * Math.max(0, -Math.sin((t - at(83)) * 7)) : 1;
  return (
    <AbsoluteFill style={{ background: "#070607", overflow: "hidden" }}>
      <Fond />
      {plein ? <Visage t={t} poses={POSES} plein /> : (
        <>
          <div style={{ position: "absolute", left: P.x, top: P.y, width: P.w, height: P.h, borderRadius: 34, overflow: "hidden",
            background: "radial-gradient(circle at 50% 40%, #3A2327 0%, #1E1719 45%, #121013 80%)", boxShadow: "0 0 0 2px rgba(255,255,255,0.06), 0 0 60px rgba(217,130,139,0.18)" }}>
            <div style={{ position: "absolute", left: -P.x, top: -P.y, width: 1080, height: 1920 }}>
              <Carte t={t} keys={KA} lettre="A" zoom={zoomA} dim={dimVs} pulse={pulseA} />
              <Carte t={t} keys={KB} lettre="B" dim={dimVs} pulse={pulseB} />
              {t < T_A + 0.2 && <div style={{ position: "absolute", left: 540 - 50, top: 680, width: 100, textAlign: "center", fontFamily: "Poppins", fontWeight: 900, fontSize: 54, color: "rgba(255,255,255,0.85)",
                opacity: 1 - seg(t, T_A - 0.1, T_A + 0.15), zIndex: 3 }}>VS</div>}
              {t >= T_VS + 0.2 && <div style={{ position: "absolute", left: 540 - 50, top: 680, width: 100, textAlign: "center", fontFamily: "Poppins", fontWeight: 900, fontSize: 54, color: "rgba(255,255,255,0.85)",
                opacity: seg(t, T_VS + 0.2, T_VS + 0.4), zIndex: 3 }}>VS</div>}
              <Puces t={t} puces={PUCES_A} a={T_A + 0.3} b={T_B - 0.05} />
              <Puces t={t} puces={PUCES_B} a={T_B + 0.3} b={T_VS - 0.1} />
              <Titre t={t} a={0} b={at(5) - 0.05} y={445}>Tu es <Serif size={76}>recruteur</Serif>.</Titre>
              <Titre t={t} a={at(5) - 0.05} b={T_A + 0.05} y={445} size={58}>2 lettres. <Serif size={70}>Un seul</Serif> entretien.</Titre>
              <Titre t={t} a={at(49) - 0.05} b={T_QUI - 0.05} y={445} size={54}>Même profil · même poste</Titre>
              <Titre t={t} a={T_QUI - 0.05} b={T_DEPEND} y={700} size={104}>Tu prends <Serif size={130}>qui</Serif> ?</Titre>
              <CaDepend t={t} />
              <LePlusLike t={t} />
              {finale && <Titre t={t} a={at(83) - 0.1} b={99} y={445} size={80}><Serif size={100}>A</Serif> ou <Serif size={100}>B</Serif> ?</Titre>}
              {t >= at(35) && t < T_VS && <div style={{ position: "absolute", left: 615, width: 300, top: 925, fontFamily: "'Open Sans'", fontSize: 20, lineHeight: 1.3, color: "#B8B1B3", opacity: seg(t, at(35), at(35) + 0.3) * (1 - seg(t, T_VS - 0.3, T_VS)), zIndex: 6 }}>
                * temps mesuré : 27 à 35 s par lettre</div>}
              <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: 470, top: 978, width: 140, opacity: 0.85, zIndex: 6 }} />
            </div>
          </div>
          <Visage t={t} poses={POSES} />
        </>
      )}
      <SousTitre t={t} bl={BL} cles={CLES} y={plein ? 1330 : 1112} size={64} />
      <Bandeau t={t} rappels={[T_QUI, T_FIN, at(83)]}>💬 Tu prends qui ? <Rose>A ou B</Rose> en commentaire</Bandeau>
      <Audio src={staticFile("audio/tuprends.wav")} />
    </AbsoluteFill>
  );
};
