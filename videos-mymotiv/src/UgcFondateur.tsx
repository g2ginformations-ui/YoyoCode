// « UGC fondateur » (≈31 s, 30 i/s, 9:16) : vidéo au format UGC (demande du propriétaire du 17/10/2026 « fais-moi une vidéo UGC
// pour vendre MyMotiv », d'après une pub d'un outil qui fabrique des UGC avec des acteurs IA). Chez nous, PAS d'acteur généré
// ni de faux client (ce serait un faux témoignage, et les visages générés sont exclus) : c'est Yann, le créateur, avec ses
// vraies photos masquées, qui parle face caméra. Codes du format : plan « selfie » tenu à la main (léger tremblé), coupes
// sautées (zoom différent à chaque phrase), sous-titres très gras avec le mot fort surligné en rose, « fond vert » devant le
// vrai site (public/tuto-tel/, réponses d'IA simulées : « le vrai site », jamais « en direct ») avec sa vraie main qui tape
// l'écran (public/yann/doigt.png), autocollants (30 s*, rien d'inventé, 1re lettre offerte, Semaine 3,99 €), appel
// « commente LETTRE » avec bandeau dès 0,3 s (src/bandeau.tsx). Prix et plafond lus dans lettre-ia/lib/pricing.ts.
// ⚠️ La voix DIT le prix de la Semaine (ligne u6 de voix-ugc.json) : à régénérer si pricing.ts change. Son : synth_ugc.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PLANS, WEEKLY_LIMIT } from "../../lettre-ia/lib/pricing";
import { bounce } from "./apple";
import { Bandeau, Rose } from "./bandeau";
import { PINK, easeInOut, lerp, seg } from "./common";
import voix from "./data/ugc-voix.json";
import { K } from "./kinetic";
import { X, horloge } from "./pubMotion";
import { blocs, norm, poseAt } from "./splitDemo";
import "./fonts";

export const UGC_DUR = voix.duration;
const { at, sc } = horloge(voix);
const W_ = PLANS.week, L_ = PLANS.letter, ROSE_C = "#F2B8C0";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const pop = (t: number, a: number) => bounce(t, [[a, 0.4], [a + 0.18, 1]], 0.1, 3, 7);
const euros = (c: number) => (c / 100).toFixed(2).replace(".", ",") + " €";

// ─── les temps clés (calés sur la voix) ───
const T_DEMO = sc(1), T_SELFIE2 = sc(5), T_CTA = sc(7);
const T_CV = at(13), T_PHOTO = at(16), T_LIEN = at(18), T_30 = at(29), T_LETTRE = at(34), T_PREUVES = at(41), T_RIEN = at(43);
const T_CREE = at(48), T_RECRU = at(58), T_OFFERTE = at(73), T_SEMAINE = at(81), T_CENTIME = at(87), T_TAPE = at(99), T_DM = at(103);

// ─── le plan « selfie » : mur chaud, tenu à la main, coupes sautées ───
const MUR = "linear-gradient(180deg, #1A0F12 0%, #3A1B20 28%, #A8545A 52%, #E39A86 60%, #7A3A3E 72%, #24141A 100%)";
const POSES: [number, string][] = [[0, "g2-insister"], [at(5), "g2-affirmer"], [T_SELFIE2, "g2-partager"], [T_RECRU, "g2-affirmer"], [T_OFFERTE, "emo-joie"], [T_SEMAINE, "g2-preciser"],
  [T_CENTIME, "g2-expliquer"], [T_CTA, "g1-conclure"]];
const COUPES = [0, at(5) - 0.05, T_SELFIE2, T_RECRU - 0.05, T_OFFERTE - 0.05, T_SEMAINE - 0.05, T_CENTIME - 0.05, T_CTA];
const Selfie: React.FC<{ t: number; flou?: number }> = ({ t, flou = 0 }) => {
  const { pose, a } = poseAt(t, POSES);
  let k = 0; COUPES.forEach((c, i) => { if (t >= c) k = i; });
  const serre = k % 2 === 1, z = serre ? 1.2 : 1.0, ox = serre ? (k % 4 === 1 ? -40 : 40) : 0;
  const punch = 1 + 0.035 * Math.exp(-(t - a) * 9);
  const sx = Math.sin(t * 1.3) * 7 + Math.sin(t * 3.1) * 3, sy = Math.cos(t * 1.1) * 6 + Math.sin(t * 2.7) * 2, rot = Math.sin(t * 0.9) * 0.5;
  return (
    <AbsoluteFill style={{ background: MUR, overflow: "hidden", filter: flou ? `blur(${flou}px) brightness(${1 - 0.04 * flou})` : "none" }}>
      <div style={{ position: "absolute", left: -80, top: 330, width: 1240, height: 1760, transform: `translate(${sx + ox}px, ${sy}px) rotate(${rot}deg) scale(${z * punch})`, transformOrigin: "50% 22%" }}>
        <Img src={staticFile(`yann/${pose}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 0%" }} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// ─── le « fond vert » : le vrai site plein écran, Yann détouré en bas à gauche, sa main qui tape ───
const ECRANS: [number, string][] = [[T_DEMO, "002-cv"], [T_PHOTO, "013-cv-lu"], [sc(2) - 0.05, "014-offre"], [T_LIEN + 0.25, "015-offre-collee"], [sc(3) - 0.05, "030-generation"], [T_LETTRE, "040-lettre"]];
const DOIGT_W = 429, DOIGT_H = 939, BOUT: [number, number] = [220, 10];
const APPUIS: [number, number, number][] = [[T_CV, 560, 850], [T_LIEN, 540, 910]];      // [temps, x, y] du bout de l'index
const Doigt: React.FC<{ t: number }> = ({ t }) => {
  const ap = APPUIS.find(([a]) => t >= a - 0.45 && t < a + 0.55);
  if (!ap) return null;
  const [a, x0, y0] = ap, entre = ease(t, a - 0.45, a - 0.05), sort = ease(t, a + 0.2, a + 0.55);
  const appui = Math.exp(-Math.pow((t - a) / 0.08, 2));
  const x = lerp(1250, x0, entre) + 600 * sort + appui * 8, y = lerp(1500, y0, entre) + 700 * sort + appui * 14, s = 0.95;
  return (
    <div style={{ position: "absolute", left: x - BOUT[0] * s, top: y - BOUT[1] * s, width: DOIGT_W * s, height: DOIGT_H * s, transformOrigin: `${BOUT[0] * s}px ${BOUT[1] * s}px`,
      transform: `rotate(${-14 + (x - 1280) / 120}deg)`, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.45))", zIndex: 12 }}>
      <div style={{ position: "absolute", left: 70 * s, top: 720 * s, width: 330 * s, height: 2200, borderRadius: `${150 * s}px ${150 * s}px 0 0`, background: "linear-gradient(90deg, #141416 0%, #2A2A2E 45%, #18181B 100%)" }} />
      <div style={{ position: "absolute", left: 95 * s, top: 735 * s, width: 280 * s, height: 60 * s, borderRadius: 30 * s, background: "#E9E4DC", opacity: 0.85 }} />
      <Img src={staticFile("yann/doigt.png")} style={{ position: "absolute", left: 0, top: 0, width: DOIGT_W * s, height: DOIGT_H * s }} />
      {appui > 0.05 && <div style={{ position: "absolute", left: BOUT[0] * s - 50, top: BOUT[1] * s - 50, width: 100, height: 100, borderRadius: 50, border: `5px solid ${PINK}`, opacity: appui, transform: `scale(${1.6 - 0.6 * appui})` }} />}
    </div>
  );
};
const FondVert: React.FC<{ t: number }> = ({ t }) => {
  let img = ECRANS[0][1]; ECRANS.forEach(([a, f]) => { if (t >= a) img = f; });
  const z = img === "040-lettre" ? lerp(1.0, 1.25, ease(t, T_PREUVES - 0.2, T_PREUVES + 0.5)) : 1.0 + 0.02 * Math.sin(t * 0.8);
  const cadre = img === "040-lettre" && t >= T_PREUVES;
  const { pose } = poseAt(t, [[T_DEMO, "g1-expliquer"], [sc(3), "g2-decrire"], [T_PREUVES, "g2-affirmer"]]);
  return (
    <AbsoluteFill style={{ background: "#0B0A0B", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${z})`, transformOrigin: "50% 45%" }}>
        <Img src={staticFile(`tuto-tel/${img}.jpg`)} style={{ position: "absolute", left: 0, top: 90, width: 1080, height: 1920 }} />
        {cadre && <div style={{ position: "absolute", left: 130, top: 888, width: 810, height: 154, borderRadius: 14, border: `6px solid ${PINK}`, boxShadow: `0 0 26px ${PINK}`, opacity: seg(t, T_PREUVES, T_PREUVES + 0.2) }} />}
      </div>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,0,0) 57%, rgba(0,0,0,0.8) 72%, rgba(0,0,0,0.92) 100%)" }} />
      <Doigt t={t} />
      <div style={{ position: "absolute", left: -30, top: 1175, width: 560, height: 830, transform: `translate(${Math.sin(t * 1.4) * 4}px, ${Math.cos(t * 1.2) * 3}px)` }}>
        <Img src={staticFile(`yann/${pose}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 0%", filter: "drop-shadow(0 0 30px rgba(0,0,0,0.6))" }} />
      </div>
    </AbsoluteFill>
  );
};

// ─── les autocollants ───
const Autocollant: React.FC<{ t: number; a: number; b: number; x: number; y: number; rot?: number; children: React.ReactNode; fond?: string; couleur?: string; size?: number }> = ({ t, a, b, x, y, rot = -4, children, fond = "#FFFFFF", couleur = "#1E1C1D", size = 40 }) => {
  if (t < a || t >= b) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${pop(t, a) * (1 - 0.3 * seg(t, b - 0.12, b))})`, zIndex: 30,
      padding: "12px 26px", borderRadius: 20, background: fond, color: couleur, fontFamily: "Poppins", fontWeight: 800, fontSize: size, whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(0,0,0,0.4)" }}>{children}</div>
  );
};
const Offre: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_SEMAINE - 0.05 || t >= T_CTA) return null;
  return (
    <div style={{ position: "absolute", left: X, top: 950, width: 780, transform: `translate(-50%, -50%) rotate(-2deg) scale(${pop(t, T_SEMAINE - 0.05)})`, zIndex: 30, background: "#FFFFFF", borderRadius: 28,
      padding: "22px 34px", boxSizing: "border-box", boxShadow: "0 20px 50px rgba(0,0,0,0.45)", opacity: 1 - seg(t, T_CTA - 0.2, T_CTA) }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <span style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 40, color: "#1E1C1D" }}>{W_.name} illimitée*</span>
        <span style={{ fontFamily: K, fontWeight: 900, fontSize: 76, color: PINK, transform: `scale(${pop(t, at(84) - 0.05)})`, display: "inline-block" }}>{W_.price}</span>
      </div>
      {t >= T_CENTIME - 0.05 && (
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 28, color: "#6E686B", opacity: seg(t, T_CENTIME - 0.05, T_CENTIME + 0.2) }}>
          2 lettres à l'unité = <s>{euros(2 * L_.cents)}</s> → <span style={{ color: PINK }}>+ 1 centime = toute la semaine</span></div>
      )}
      <div style={{ fontFamily: "'Open Sans'", fontSize: 20, color: "#8A8487", marginTop: 6 }}>* jusqu'à {WEEKLY_LIMIT} lettres par semaine · sans engagement</div>
    </div>
  );
};

// ─── l'appel : le champ de commentaire qui tape « LETTRE », la réponse en message privé ───
const Appel: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.floor(6 * seg(t, T_TAPE - 0.1, T_TAPE + 0.45)), tape = "LETTRE".slice(0, n);
  return (
    <>
      <div style={{ position: "absolute", left: X, top: 470, transform: `translate(-50%, -50%) scale(${pop(t, T_CTA)})`, fontFamily: "Poppins", fontWeight: 900, fontSize: 92, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>Commente</div>
      {t >= T_TAPE - 0.1 && <div style={{ position: "absolute", left: X, top: 610, transform: `translate(-50%, -50%) rotate(-3deg) scale(${pop(t, T_TAPE - 0.1)})`, padding: "6px 34px", borderRadius: 24, background: PINK,
        fontFamily: "Poppins", fontWeight: 900, fontSize: 130, color: "#fff", boxShadow: "0 16px 40px rgba(0,0,0,0.45)" }}>LETTRE</div>}
      <div style={{ position: "absolute", left: 120, width: 800, top: 760, height: 110, borderRadius: 55, background: "#1C191C", border: "2px solid #3A3436", display: "flex", alignItems: "center",
        padding: "0 22px 0 40px", boxSizing: "border-box", fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: n ? "#fff" : "#77706F" }}>
        <span style={{ flex: 1 }}>{n ? tape : "Ajouter un commentaire..."}</span>
        <span style={{ width: 70, height: 70, borderRadius: 35, background: PINK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>↑</span>
      </div>
      {t >= T_DM && (
        <div style={{ position: "absolute", left: 120, width: 800, top: 905, display: "flex", gap: 18, alignItems: "center", padding: "16px 22px", borderRadius: 28, background: "rgba(20,17,20,0.9)",
          opacity: seg(t, T_DM, T_DM + 0.2), transform: `translateY(${(1 - ease(t, T_DM, T_DM + 0.3)) * 20}px)` }}>
          <div style={{ width: 76, height: 76, borderRadius: 38, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>mm.</div>
          <div>
            <div style={{ fontFamily: "'Open Sans'", fontSize: 26, color: "#8E8A8B" }}>mymotiv · à l'instant</div>
            <div style={{ fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 34, color: "#fff" }}>Le lien pour ta <span style={{ color: ROSE_C }}>1re lettre offerte</span> 💌</div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── les sous-titres « UGC » : très gras, contour noir, le mot fort surligné en rose ───
const BL = blocs(voix);
const CLES = new Set(["lettre", "partout", "cv", "photo", "lien", "texte", "secondes", "preuves", "invente", "cree", "recrutement", "recruteur", "offerte", "semaine", "399", "centime", "lettre"]);
const SousTitreUgc: React.FC<{ t: number; y: number }> = ({ t, y }) => {
  const b = t < BL[0].t0 ? BL[0] : BL.find((x) => t >= x.t0 && t < x.t1);
  if (!b) return null;
  const contour = "0 0 0 #000, 4px 4px 0 #000, -4px 4px 0 #000, 4px -4px 0 #000, -4px -4px 0 #000, 0 5px 0 #000, 0 -5px 0 #000, 5px 0 0 #000, -5px 0 0 #000, 0 8px 20px rgba(0,0,0,0.5)";
  return (
    <div style={{ position: "absolute", left: 110, right: 150, top: y, transform: `translateY(-50%) scale(${t < b.t0 ? 1 : bounce(t, [[b.t0, 0.85], [b.t0 + 0.12, 1]], 0.04, 3, 8)})`, textAlign: "center", zIndex: 40,
      fontFamily: "Poppins", fontWeight: 900, fontSize: 74, lineHeight: 1.15, color: "#fff", textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {b.mots.map((w, i) => {
        const cle = CLES.has(norm(w)), txt = w.replace(/[,.:;!]+$/, "").replace(/\.\.\.$/, "");
        return <React.Fragment key={i}>
          <span style={cle ? { background: PINK, borderRadius: 14, padding: "0 14px", display: "inline-block", transform: "rotate(-2deg)", textShadow: "0 3px 0 rgba(0,0,0,0.35)" } : { textShadow: contour }}>{txt}</span>{" "}
        </React.Fragment>;
      })}
    </div>
  );
};

export const UgcFondateur: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const demo = t >= T_DEMO && t < T_SELFIE2, cta = t >= T_CTA;
  return (
    <AbsoluteFill style={{ background: "#0B0A0B", overflow: "hidden" }}>
      {demo ? <FondVert t={t} /> : <Selfie t={t} flou={cta ? 14 * seg(t, T_CTA, T_CTA + 0.3) : 0} />}
      {/* l'accroche : trois lettres identiques, barrées */}
      <Autocollant t={t} a={at(4) - 0.05} b={T_DEMO} x={X} y={980} rot={-3} size={44}>📄📄📄 = <span style={{ color: "#E5484D" }}>copier-coller</span></Autocollant>
      <Autocollant t={t} a={T_30 - 0.05} b={T_PREUVES - 0.1} x={X} y={360 + 90} rot={-4} fond={PINK} couleur="#fff" size={58}>⏱ 30 s*</Autocollant>
      {t >= T_30 && t < T_PREUVES - 0.1 && <div style={{ position: "absolute", left: 120, width: 800, top: 525, textAlign: "center", zIndex: 30 }}><span style={{ padding: "6px 16px", borderRadius: 12, background: "rgba(11,10,11,0.82)", fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 22, color: "#fff" }}>* temps mesuré : 27 à 35 s par lettre</span></div>}
      <Autocollant t={t} a={T_RIEN - 0.05} b={T_SELFIE2} x={X + 120} y={470} rot={5} fond="#1E1C1D" couleur="#fff" size={44}>✅ Rien d'inventé</Autocollant>
      <Autocollant t={t} a={T_CREE - 0.05} b={T_OFFERTE - 0.1} x={X} y={960} rot={-3} size={42}>👋 le créateur de <span style={{ color: PINK }}>MyMotiv</span></Autocollant>
      <Autocollant t={t} a={T_RECRU - 0.05} b={T_OFFERTE - 0.1} x={X + 60} y={1065} rot={3} fond="#1E1C1D" couleur="#fff" size={34}>1 an en agence d'emploi</Autocollant>
      <Autocollant t={t} a={T_OFFERTE - 0.05} b={T_SEMAINE - 0.1} x={X} y={960} rot={-4} fond={PINK} couleur="#fff" size={50}>🎁 1re lettre offerte</Autocollant>
      <Offre t={t} />
      {cta && <Appel t={t} />}
      {!cta && <SousTitreUgc t={t} y={demo ? 1112 : 1230} />}
      <Bandeau t={t} fin={T_CTA} rappels={[T_DEMO, T_OFFERTE]}>💬 Commente <Rose>« LETTRE »</Rose> → je t'envoie le lien</Bandeau>
      <Audio src={staticFile("audio/ugc.wav")} />
    </AbsoluteFill>
  );
};
