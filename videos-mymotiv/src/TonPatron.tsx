// « Ton patron va détester cette vidéo. » (36,9 s, 60 i/s, 9:16) — typographie cinétique calée MOT PAR MOT sur la voix
// de l'utilisateur (public/audio/patron-source.wav, montée par tools/voix-narrateur.py + voix-patron.json).
// Hook malicieux : une notification « Ton patron » qui vibre, le swipe se verrouille → actu vérifiée : depuis le
// 1er octobre 2026, saisir les prud'hommes est plus simple (décret n° 2026-683 du 27/07/2026 : dernier bulletin de paie
// + bordereau des pièces) → « encore plus simple ? » → « CHANGER DE PATRON. » (le CDI barré au feutre) → une lettre,
// c'est des heures (horloge) → chatbot « générique », outil gratuit « à retravailler » (cartes grises tamponnées) →
// MyMotiv (vraies captures du site) → 30 s*, lettre + CV adaptés, logo de l'entreprise → 1re offerte, lien en bio →
// la notification revient : « Il faut qu'on parle » → pot de départ, confettis → logo.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { go } from "./apple";
import { PINK, PINK_L, clamp, lerp, rng, seg } from "./common";
import { AppIcon, Flash, GlossPill, MarkerStroke, Shockwave, ease, pulse } from "./motion";
import { CvDoc, LETTER_BOX, LetterDoc } from "./NotreHistoire";
import voix from "./data/patron-voix.json";
import "./fonts";

export const PATRON_DUR = voix.duration;
const GREY = "#8E8E93", INK = "#F5F5F7", CARD = "#1C1C1E";
const W_ = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;   // temps d'un mot de la transcription

// temps clés (s), lus dans src/data/patron-voix.json
export const T = {
  ton: W_(0), detester: W_(3), video: W_(5), depuis: W_(6), oct: W_(8), prud: W_(12), simple1: W_(15),
  bulletin: W_(19), liste: W_(24), suffisent: W_(28), mais: W_(29), simple2: W_(36),
  changer: W_(38), patron4: W_(40), sauf: W_(41), heures: W_(49), chatbot: W_(51), generique: W_(52),
  outil: W_(54), retravailler: W_(59), mm: W_(60), colles: W_(63), ajoutes: W_(66), cv: W_(68),
  s30: W_(69), lettre: W_(72), cv2: W_(75), entreprise: W_(79), logo: W_(82), offerte: W_(86), lien: W_(88), bio: W_(91),
  et: W_(92), patron11: W_(94), pot: W_(99), depart: W_(101),
};
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const START = (i: number) => PH[i][0] - 0.08;

// ─── sous-titres mot par mot (texte corrigé ; chaque mot est calé sur un mot de la transcription) ───
type Wd = [string, number, boolean?];
const CAPS: (Wd[] | null)[] = [
  [["Ton", 0], ["patron", 1], ["va", 2], ["DÉTESTER", 3, true], ["cette", 4], ["vidéo.", 5]],
  [["Depuis", 6], ["le", 7], ["1er", 8, true], ["octobre,", 9, true], ["saisir", 10], ["les", 11], ["prud'hommes,", 12], ["c'est", 13], ["plus", 15, true], ["simple.", 16, true]],
  [["Ton", 17], ["dernier", 18], ["bulletin", 19, true], ["de", 20], ["paie", 21, true], ["et", 22], ["la", 23], ["liste", 24, true], ["de", 25], ["tes", 26], ["pièces", 27, true], ["suffisent.", 28]],
  [["Mais", 29], ["tu", 30], ["sais", 31], ["ce", 32], ["qui", 33], ["est", 34], ["encore", 35], ["plus", 36, true], ["simple ?", 37, true]],
  null,
  [["Sauf", 41], ["qu'une", 43], ["lettre", 44], ["de", 45], ["motivation,", 46], ["c'est", 47], ["des", 49, true], ["heures.", 49, true]],
  [["Un", 50], ["chatbot ?", 51], ["Générique.", 52, true]],
  [["Un", 53], ["outil", 54], ["gratuit ?", 55], ["Une", 56], ["base…", 57], ["à", 58], ["retravailler.", 59, true]],
  [["MyMotiv :", 60, true], ["tu", 62], ["colles", 63], ["l'offre,", 64], ["t'ajoutes", 66], ["ton", 67], ["CV.", 68]],
  [["30", 69, true], ["secondes :", 70, true], ["ta", 71], ["lettre", 72], ["et", 73], ["ton", 74], ["CV", 75], ["adaptés", 76], ["à", 77], ["l'entreprise,", 79], ["avec", 80], ["son", 81], ["logo.", 82, true]],
  [["Ta", 83], ["1re", 84], ["lettre", 85], ["est", 85], ["offerte,", 86, true], ["le", 87], ["lien", 88], ["est", 89], ["en", 90], ["bio.", 91, true]],
  [["Et", 92], ["ton", 93], ["patron ?", 94], ["Il", 95], ["l'apprendra", 96], ["au", 97], ["pot", 99, true], ["de", 100, true], ["départ.", 101, true]],
];
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = PH.findIndex(([a], k) => t >= a - 0.08 && (k + 1 >= PH.length || t < PH[k + 1][0] - 0.08));
  const last = i === PH.length - 1, hold = last ? 0.05 : 0.9;
  if (i < 0 || !CAPS[i] || t > PH[i][1] + hold + 0.3) return null;
  const words = CAPS[i]!, out = seg(t, PH[i][1] + hold, PH[i][1] + hold + 0.3);
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 1190, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 68, lineHeight: 1.18, letterSpacing: -1, opacity: 1 - out }}>
      {words.map(([s, wi, hl], k) => {
        const t0 = W_(wi) - 0.04, k0 = seg(t, t0, t0 + 0.12), on = t >= t0;
        const now = on && (k + 1 >= words.length || t < W_(words[k + 1][1]) - 0.04);
        return (
          <React.Fragment key={k}>
            <span style={{ display: "inline-block", transform: `scale(${lerp(0.55, 1, k0) * (now ? 1.06 : 1)}) translateY(${(1 - k0) * 18}px)`, opacity: on ? 1 : 0.0,
              color: hl ? PINK_L : "#fff", padding: hl && now ? "0 10px" : "0 2px", borderRadius: 14, background: hl && now ? "rgba(217,130,139,0.28)" : "transparent",
              textShadow: "0 4px 24px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)" }}>{s}</span>{" "}
          </React.Fragment>
        );
      })}
    </div>
  );
};

// ─── outils ───
const show = (t: number, a: number, b: number) => t >= a && t < b;
function io(t: number, a: number, b: number, inD = 0.2, outD = 0.2): React.CSSProperties {
  const i = ease(t, a, a + inD), o = seg(t, b - outD, b);
  return { opacity: clamp(i * 1.4) * (1 - o), filter: `blur(${(1 - i) * 12 + o * 16}px)`, transform: `scale(${lerp(0.85, 1, i) * lerp(1, 1.12, o)})` };
}
const shakeX = (t: number, t0: number, d = 0.5, a = 14) => (t >= t0 && t < t0 + d ? Math.sin((t - t0) * 90) * a * (1 - (t - t0) / d) : 0);
const Stamp: React.FC<{ t: number; t0: number; text: string; color?: string; size?: number; rot?: number; style?: React.CSSProperties }> = ({ t, t0, text, color = "#FF5C7A", size = 46, rot = -12, style }) => {
  if (t < t0 - 0.02) return null;
  const k = ease(t, t0 - 0.02, t0 + 0.14);
  return <div style={{ position: "absolute", padding: "8px 22px", border: `6px solid ${color}`, borderRadius: 14, color, fontFamily: "Poppins", fontWeight: 700, fontSize: size, letterSpacing: 2, background: "rgba(11,10,11,0.55)",
    transform: `rotate(${rot}deg) scale(${lerp(2.4, 1, k)})`, opacity: clamp(k * 3), whiteSpace: "nowrap", boxShadow: `0 0 30px ${color}55`, ...style }}>{text}</div>;
};
const Chip: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", padding: "10px 24px", borderRadius: 40, background: "rgba(217,130,139,0.16)", border: `2px solid ${PINK_L}`, color: PINK_L, fontFamily: "Open Sans", fontWeight: 600, fontSize: 30, whiteSpace: "nowrap", ...style }}>{children}</div>
);
const Note: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) =>
  show(t, a, b) ? <div style={{ position: "absolute", left: 60, right: 60, top: 1478, textAlign: "center", fontFamily: "Open Sans", fontSize: 23, color: "rgba(245,245,247,0.68)", opacity: seg(t, a, a + 0.25) * (1 - seg(t, b - 0.2, b)) }}>{children}</div> : null;

// ─── la notification « Ton patron » (hook, et retour à la fin) ───
const Notif: React.FC<{ t: number; t0: number; t1: number; body: string; buzz: number[] }> = ({ t, t0, t1, body, buzz }) => {
  if (!show(t, Math.max(0, t0), t1)) return null;
  const k = go(t, t0, t0 + 0.35, 0, 1), out = ease(t, t1 - 0.3, t1);
  const sx = buzz.reduce((s, b) => s + shakeX(t, b, 0.45, 16), 0);
  return (
    <div style={{ position: "absolute", left: 70, width: 940, top: lerp(-260, 300, k) - out * 500, transform: `translateX(${sx}px) rotate(${sx * 0.08}deg)`, opacity: 1 - out * 0.6,
      background: "rgba(44,44,46,0.92)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 44, padding: "30px 34px", display: "flex", gap: 26, alignItems: "center", boxShadow: "0 30px 90px rgba(0,0,0,0.6)" }}>
      <div style={{ width: 110, height: 110, borderRadius: 30, background: "linear-gradient(145deg, #5A5A5E, #2C2C2E)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 64, flexShrink: 0 }}>👔</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Open Sans", fontSize: 28, color: GREY }}><span style={{ fontFamily: "Poppins", fontWeight: 700, color: "#fff", fontSize: 38 }}>Ton patron</span><span>à l'instant</span></div>
        <div style={{ fontFamily: "Open Sans", fontSize: 38, color: INK, marginTop: 6 }}>{body}</div>
      </div>
      <div style={{ position: "absolute", right: -12, top: -12, width: 44, height: 44, borderRadius: 22, background: "#FF3B30", color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${go(t, t0 + 0.2, t0 + 0.45, 0, 1)})` }}>1</div>
    </div>
  );
};

// ─── documents ───
const Payslip: React.FC = () => (
  <div style={{ width: 300, height: 380, borderRadius: 20, background: "#FBF8F7", padding: 26, fontFamily: "Open Sans", color: "#1D1D1F", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
    <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 26 }}>Bulletin de paie</div>
    <div style={{ fontSize: 18, color: GREY }}>Septembre 2026</div>
    {[88, 70, 80, 64, 76].map((w, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", marginTop: 18 }}><div style={{ width: `${w - 30}%`, height: 10, borderRadius: 5, background: "#DDD6D8" }} /><div style={{ width: 50, height: 10, borderRadius: 5, background: "#C9C2C4" }} /></div>)}
    <div style={{ marginTop: 26, borderTop: "2px solid #E5E5EA", paddingTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 20 }}><span>Net à payer</span><span style={{ width: 70, height: 14, borderRadius: 7, background: PINK, marginTop: 6 }} /></div>
  </div>
);
const Checklist: React.FC = () => (
  <div style={{ width: 300, height: 380, borderRadius: 20, background: "#FBF8F7", padding: 26, fontFamily: "Open Sans", color: "#1D1D1F", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
    <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 26 }}>Liste des pièces</div>
    {[0, 1, 2, 3, 4].map((i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 22 }}><div style={{ width: 24, height: 24, borderRadius: 6, border: `3px solid ${PINK}`, color: PINK, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div><div style={{ width: `${70 - (i % 3) * 12}%`, height: 10, borderRadius: 5, background: "#DDD6D8" }} /></div>)}
  </div>
);
const P = (n: string) => staticFile(`parcours/${n}.png`);
const PHONE = 0.36, PW = 1080 * PHONE, PHh = 1920 * PHONE;
function phoneShot(t: number) {
  if (t < T.colles - 0.2) return P("009-offre");
  if (t < T.ajoutes - 0.1) return P(`0${10 + Math.min(6, Math.floor(seg(t, T.colles - 0.2, T.ajoutes - 0.2) * 7))}-offre-lien`);
  if (t < T.cv - 0.15) return P("007-cv");
  if (t < T.s30) return P("008-cv-ajoute");
  const G = ["036", "038", "040", "042", "044", "046", "047"];
  return P(`${G[Math.min(G.length - 1, Math.floor(seg(t, T.s30, T.lettre) * G.length))]}-generation`);
}

export const TonPatron: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const hits = [0.02, T.detester, T.changer, T.mm, T.logo, T.pot];
  const shake = hits.reduce((s, h) => s + pulse(t, h + 0.04, 0.07), 0) * 12;
  const r = rng(frame + 5);
  const flash = pulse(t, T.changer, 0.07) * 1.1 + pulse(t, T.mm, 0.09) * 1.2 + pulse(t, T.pot, 0.07) * 0.6;
  const beat = t >= T.mm ? pulse(((t - T.mm) % (60 / 104)), 0, 0.06) : 0;   // halo qui bat au tempo après MyMotiv
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0A0B", overflow: "hidden" }}>
      <Audio src={staticFile("audio/patron.wav")} />
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 38%, rgba(217,130,139,${0.16 + beat * 0.1}) 0%, rgba(30,23,25,0.9) 40%, #0B0A0B 75%)` }} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)` }}>

        {/* 0. hook : la notification qui vibre, le swipe se verrouille */}
        <Notif t={t} t0={-0.32} t1={T.depuis + 0.1} body="Tu regardes quoi, là ? 👀" buzz={[0.0, 0.5, T.detester]} />
        {show(t, 0, T.depuis + 0.1) && (
          <div style={{ position: "absolute", left: 340, top: 640, width: 400, height: 400, ...io(t, -0.12, T.depuis + 0.1) }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 200, border: `4px solid ${t >= T.video ? "#48484A" : PINK_L}`, background: t >= T.video ? "rgba(72,72,74,0.25)" : "rgba(217,130,139,0.12)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", transform: `translateY(${t < T.video ? Math.sin(t * 6) * 16 : 0}px)` }}>
              <div style={{ fontSize: 150, lineHeight: 1, color: t >= T.video ? "#636366" : "#fff", fontFamily: "Poppins", fontWeight: 700 }}>↑</div>
              <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 44, color: t >= T.video ? "#636366" : "#fff", textDecoration: t >= T.video ? "line-through" : "none" }}>Swipe</div>
            </div>
            {t >= T.video && <div style={{ position: "absolute", right: -10, bottom: 10, fontSize: 110, transform: `scale(${go(t, T.video, T.video + 0.25, 0, 1)}) rotate(-10deg)` }}>🔒</div>}
          </div>
        )}

        {/* 1. l'actu : 1er octobre, les prud'hommes */}
        {show(t, T.depuis - 0.1, T.mais) && <Chip style={{ left: 70, top: 300, opacity: seg(t, T.depuis, T.depuis + 0.2) * (1 - seg(t, T.mais - 0.25, T.mais)) }}>📰 L'actu du 1er octobre 2026</Chip>}
        {show(t, T.depuis, T.prud + 0.1) && (
          <div style={{ position: "absolute", left: 330, top: 470, width: 420, perspective: 1200, ...io(t, T.depuis, T.prud + 0.1, 0.25, 0.25) }}>
            <div style={{ borderRadius: 30, overflow: "hidden", background: "#FBF8F7", boxShadow: "0 30px 80px rgba(0,0,0,0.6)", transform: `rotateX(${lerp(70, 0, ease(t, T.depuis, T.depuis + 0.35))}deg)`, transformOrigin: "50% 0%" }}>
              <div style={{ background: PINK, color: "#fff", textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 40, padding: "18px 0", letterSpacing: 3 }}>OCTOBRE 2026</div>
              <div style={{ textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 250, color: "#1D1D1F", lineHeight: 1.25, transform: `scale(${go(t, T.oct - 0.05, T.oct + 0.25, 0.3, 1)})`, opacity: seg(t, T.oct - 0.05, T.oct + 0.05) }}>1<sup style={{ fontSize: 80 }}>er</sup></div>
            </div>
          </div>
        )}
        {show(t, T.prud - 0.1, T.bulletin - 0.2) && (() => {
          const melt = ease(t, T.simple1 - 0.05, T.simple1 + 0.45);
          return (
            <div style={{ position: "absolute", left: 340, top: 520, width: 400, height: 560, ...io(t, T.prud - 0.1, T.bulletin - 0.2, 0.2, 0.2) }}>
              {Array.from({ length: 12 }, (_, i) => {
                const gone = i >= 2 ? melt : 0, side = i % 2 ? 1 : -1;
                return <div key={i} style={{ position: "absolute", left: 40 + (i % 3) * 6, top: 500 - i * 34, width: 320, height: 60, borderRadius: 10, background: i % 2 ? "#E5DDD8" : "#D6CEC9", border: "2px solid #B9B0AA",
                  transform: `translate(${side * gone * (300 + i * 20)}px, ${-gone * 200}px) rotate(${(i % 3 - 1) * 2 + side * gone * 40}deg)`, opacity: 1 - gone }} />;
              })}
              <div style={{ position: "absolute", left: 0, right: 0, top: 560 - 12 * 34 - 90, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#fff", opacity: 1 - melt }}>Dossier prud'hommes</div>
              {melt > 0.5 && <Stamp t={t} t0={T.simple1 + 0.25} text="PLUS SIMPLE" color={PINK_L} size={52} style={{ left: 40, top: 200 }} />}
            </div>
          );
        })()}
        {show(t, T.bulletin - 0.25, T.mais + 0.1) && (() => {
          const a = ease(t, T.bulletin - 0.2, T.bulletin + 0.25), b = ease(t, T.liste - 0.2, T.liste + 0.25), close = ease(t, T.suffisent - 0.25, T.suffisent + 0.1);
          return (
            <div style={{ position: "absolute", inset: 0, ...io(t, T.bulletin - 0.25, T.mais + 0.1, 0.15, 0.25) }}>
              <div style={{ position: "absolute", left: lerp(-320, 100, a) + close * 140, top: 470 + close * 260, transform: `rotate(${lerp(-20, -6, a)}deg) scale(${lerp(1, 0.45, close)})`, opacity: 1 - close * 0.9 }}><Payslip /></div>
              <div style={{ position: "absolute", left: lerp(1100, 680, b) - close * 140, top: 470 + close * 260, transform: `rotate(${lerp(20, 6, b)}deg) scale(${lerp(1, 0.45, close)})`, opacity: b * (1 - close * 0.9) }}><Checklist /></div>
              <div style={{ position: "absolute", left: 340, top: 760, width: 400, height: 260, borderRadius: 18, background: "linear-gradient(160deg, #F2B8C0, #D9828B)", boxShadow: "0 30px 80px rgba(0,0,0,0.5)", transform: `scale(${lerp(0.9, 1, a)})` }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 150, background: "#E8A2AC", clipPath: "polygon(0 0, 100% 0, 50% 100%)", transform: `scaleY(${lerp(-1, 1, close)})`, transformOrigin: "50% 0%" }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 26, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 30, color: "#5A2830" }}>Conseil de prud'hommes</div>
              </div>
              <Stamp t={t} t0={T.suffisent} text="✓ SUFFISANT" color="#3FD4A0" size={50} rot={-8} style={{ left: 380, top: 640 }} />
            </div>
          );
        })()}
        <Note t={t} a={T.prud} b={T.mais}>Décret n° 2026-683 du 27/07/2026 · saisines depuis le 01/10/2026 · les pièces restent à produire à l'audience</Note>

        {/* 3. « encore plus simple ? » */}
        {show(t, T.mais, PH[4][0]) && (
          <div style={{ position: "absolute", left: 340, top: 520, width: 400, height: 400, ...io(t, T.mais, PH[4][0], 0.25, 0.12) }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 200, border: `6px solid ${PINK_L}`, boxShadow: `0 0 ${40 + 40 * Math.sin(t * 12)}px ${PINK}`, transform: `scale(${1 + 0.05 * Math.sin(t * 12) + 0.25 * seg(t, T.mais, PH[4][0])})` }} />
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 280, color: "#fff", textShadow: `0 0 40px ${PINK}` }}>?</div>
          </div>
        )}

        {/* 4. CHANGER DE PATRON. */}
        {show(t, PH[4][0], T.sauf) && (() => {
          const k = ease(t, T.changer - 0.03, T.changer + 0.2), k2 = ease(t, T.patron4 - 0.25, T.patron4), out = seg(t, T.sauf - 0.25, T.sauf);
          return (
            <div style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: `blur(${out * 16}px)` }}>
              <div style={{ position: "absolute", left: 0, right: 0, top: 440, height: 520, background: PINK, transform: `scaleY(${k}) skewY(-4deg)`, boxShadow: `0 0 80px ${PINK}` }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 170, lineHeight: 1.0, letterSpacing: -6, color: "#fff", transform: "rotate(-4deg)" }}>
                <div style={{ transform: `scale(${lerp(1.8, 1, k)})`, opacity: clamp(k * 2) }}>CHANGER</div>
                <div style={{ transform: `scale(${lerp(1.8, 1, k2)})`, opacity: clamp(k2 * 2), color: "#0B0A0B" }}>DE PATRON.</div>
              </div>
              {t > T.changer + 0.1 && (() => {
                const fly = ease(t, T.patron4 + 0.35, T.sauf - 0.1);
                return (
                  <div style={{ position: "absolute", left: 250, top: 1010, width: 580, height: 140, borderRadius: 24, background: CARD, border: "2px solid #48484A", display: "flex", alignItems: "center", gap: 22, padding: "0 30px",
                    transform: `translate(${fly * 900}px, ${-fly * 120}px) rotate(${fly * 25}deg)`, opacity: seg(t, T.changer + 0.1, T.changer + 0.25) }}>
                    <div style={{ fontSize: 60 }}>🏢</div>
                    <div><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#fff" }}>CDI actuel</div><div style={{ fontFamily: "Open Sans", fontSize: 26, color: GREY }}>Ton patron · depuis trop longtemps</div></div>
                  </div>
                );
              })()}
              <MarkerStroke d="M 230 1090 C 420 1060, 640 1100, 850 1070" k={seg(t, T.patron4 - 0.05, T.patron4 + 0.3) * (1 - ease(t, T.patron4 + 0.35, T.sauf - 0.1))} width={14} />
            </div>
          );
        })()}

        {/* 5. une lettre, c'est des heures */}
        {show(t, T.sauf - 0.05, T.chatbot - 0.15) && (() => {
          const spin = Math.pow(seg(t, T.sauf, T.heures + 0.4), 1.6) * 3;   // 3 tours = 3 heures
          const hrs = Math.min(3, Math.floor(spin)), late = seg(t, T.heures - 0.1, T.heures + 0.2);
          const col = late > 0.5 ? "#FF5C7A" : "#fff";
          return (
            <div style={{ position: "absolute", left: 290, top: 440, width: 500, height: 500, ...io(t, T.sauf - 0.05, T.chatbot - 0.15, 0.2, 0.2) }}>
              <svg width={500} height={500}>
                <circle cx={250} cy={250} r={230} fill="#1C1C1E" stroke={col} strokeWidth={10} />
                {Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return <line key={i} x1={250 + Math.sin(a) * 200} y1={250 - Math.cos(a) * 200} x2={250 + Math.sin(a) * 180} y2={250 - Math.cos(a) * 180} stroke="#8E8E93" strokeWidth={i % 3 ? 4 : 8} />; })}
                <line x1={250} y1={250} x2={250 + Math.sin(spin / 12 * Math.PI * 2) * 110} y2={250 - Math.cos(spin / 12 * Math.PI * 2) * 110} stroke="#fff" strokeWidth={14} strokeLinecap="round" />
                <line x1={250} y1={250} x2={250 + Math.sin(spin * Math.PI * 2) * 170} y2={250 - Math.cos(spin * Math.PI * 2) * 170} stroke={PINK} strokeWidth={8} strokeLinecap="round" />
                <circle cx={250} cy={250} r={14} fill="#fff" />
              </svg>
              <div style={{ position: "absolute", right: -150, top: -40, fontFamily: "Poppins", fontWeight: 700, fontSize: 120, color: col, textShadow: `0 0 30px ${late > 0.5 ? "#FF5C7A" : PINK}`, transform: `scale(${1 + 0.15 * pulse(spin % 1, 0, 0.08)})` }}>{hrs > 0 ? `${hrs} h` : ""}</div>
            </div>
          );
        })()}

        {/* 6-7. chatbot « générique », outil gratuit « à retravailler » */}
        {show(t, T.chatbot - 0.2, T.mm - 0.05) && (() => {
          const out = seg(t, T.mm - 0.3, T.mm - 0.05);
          const card = (x: number, at: number, icon: React.ReactNode, title: string, stamp: string, st: number) => {
            const k = ease(t, at - 0.2, at + 0.2);
            return (
              <div style={{ position: "absolute", left: x, top: 470, width: 440, height: 520, borderRadius: 36, background: CARD, border: "2px solid #3A3A3C", transform: `translateY(${(1 - k) * 160}px) rotate(${(1 - k) * (x < 500 ? -10 : 10)}deg)`, opacity: k, filter: t >= st ? "grayscale(1) brightness(0.8)" : "none" }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 80, display: "flex", justifyContent: "center" }}>{icon}</div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 48, color: "#fff" }}>{title}</div>
                <Stamp t={t} t0={st} text={stamp} size={44} style={{ left: 30, top: 400 }} />
              </div>
            );
          };
          const bubble = (
            <div style={{ position: "relative", width: 220, height: 170 }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 50, background: "#3A3A3C", display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
                {[0, 1, 2].map((i) => <div key={i} style={{ width: 26, height: 26, borderRadius: 13, background: "#8E8E93", transform: `translateY(${Math.sin(t * 10 + i) * 8}px)` }} />)}
              </div>
              <div style={{ position: "absolute", left: 30, bottom: -26, width: 50, height: 50, background: "#3A3A3C", clipPath: "polygon(0 0, 100% 0, 0 100%)" }} />
            </div>
          );
          const form = (
            <div style={{ width: 220, height: 200, borderRadius: 24, background: "#3A3A3C", padding: 24 }}>
              {[0, 1, 2, 3].map((i) => <div key={i} style={{ height: 22, borderRadius: 8, background: "#5A5A5E", marginBottom: 18, width: `${100 - (i % 2) * 30}%` }} />)}
            </div>
          );
          return (
            <div style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: `blur(${out * 14}px)` }}>
              {card(80, T.chatbot, bubble, "Un chatbot", "GÉNÉRIQUE", T.generique)}
              {card(560, T.outil, form, "Outil gratuit", "À RETRAVAILLER", T.retravailler)}
            </div>
          );
        })()}

        {/* 8-9. MyMotiv : vrai parcours, lettre + CV, logo */}
        {show(t, T.mm - 0.05, PH[10][0] + 0.2) && (() => {
          const icon = go(t, T.mm, T.mm + 0.35, 0, 1), up = ease(t, T.mm + 0.5, T.mm + 0.9);
          const phIn = ease(t, T.mm + 0.55, T.mm + 1.0), phBack = ease(t, T.lettre - 0.2, T.lettre + 0.3);
          const kL = ease(t, T.lettre - 0.1, T.lettre + 0.35), kC = ease(t, T.cv2 - 0.15, T.cv2 + 0.3);
          const sc = 0.31, wL = LETTER_BOX[2] * sc, hL = LETTER_BOX[3] * sc;
          const lock = ease(t, T.logo - 0.45, T.logo);
          const out = seg(t, PH[10][0] - 0.1, PH[10][0] + 0.2);
          return (
            <div style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: `blur(${out * 16}px)` }}>
              <Shockwave t={t} t0={T.mm} x={540} y={640} r={700} />
              <div style={{ position: "absolute", left: 540 - lerp(110, 50, up), top: lerp(520, 270, up), transform: `scale(${icon})`, transformOrigin: "50% 50%" }}><AppIcon size={lerp(220, 100, up)} /></div>
              <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: lerp(270, 400, up), top: lerp(790, 388, up), width: lerp(540, 280, up), clipPath: `inset(0 ${(1 - seg(t, T.mm + 0.1, T.mm + 0.4)) * 100}% 0 0)`, filter: `drop-shadow(0 0 18px ${PINK})` }} />
              {/* téléphone : vraies captures du site */}
              {phIn > 0 && (
                <div style={{ position: "absolute", left: 540 - PW / 2, top: 490, width: PW, height: PHh, borderRadius: 44, overflow: "hidden", border: "6px solid #2C2C2E", boxShadow: `0 0 0 2px #48484A, 0 30px 90px rgba(0,0,0,0.7), 0 0 60px rgba(217,130,139,0.35)`,
                  transform: `translateY(${(1 - phIn) * 300 + phBack * 120}px) scale(${lerp(0.8, 1, phIn) * lerp(1, 0.8, phBack)})`, opacity: phIn * (1 - phBack * 0.8), filter: `blur(${phBack * 8}px)` }}>
                  <Img src={phoneShot(t)} style={{ width: PW, height: PHh }} />
                </div>
              )}
              {/* 30 s */}
              {t >= T.s30 - 0.05 && (() => {
                const k = ease(t, T.s30 - 0.05, T.s30 + 0.25), ring = ease(t, T.s30, T.s30 + 0.9), C = 2 * Math.PI * 70;
                return (
                  <div style={{ position: "absolute", left: 800, top: 520, width: 180, height: 180, transform: `scale(${k * (1 - ease(t, T.lettre - 0.2, T.lettre + 0.1))})` }}>
                    <svg width={180} height={180}><circle cx={90} cy={90} r={70} fill="rgba(11,10,11,0.8)" stroke="rgba(255,255,255,0.12)" strokeWidth={12} />
                      <circle cx={90} cy={90} r={70} fill="none" stroke={PINK_L} strokeWidth={12} strokeLinecap="round" strokeDasharray={`${C * ring} ${C}`} transform="rotate(-90 90 90)" style={{ filter: `drop-shadow(0 0 10px ${PINK})` }} /></svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 54, color: "#fff" }}>30 s<span style={{ fontSize: 26, color: PINK_L }}>*</span></div>
                  </div>
                );
              })()}
              {/* lettre + CV adaptés */}
              {kL > 0 && (
                <div style={{ position: "absolute", left: lerp(540 - wL / 2, 120, kL), top: lerp(700, 560, kL), transform: `rotate(${lerp(0, -5, kL)}deg) scale(${lerp(0.5, 1, kL)})`, opacity: kL }}>
                  <LetterDoc sc={sc} />
                  {/* visée sur le logo de l'entreprise */}
                  {t >= T.logo - 0.45 && <div style={{ position: "absolute", left: (110 - 83) * sc - lerp(120, 6, lock), top: (186 - 158) * sc - lerp(120, 6, lock), width: 100 * sc + lerp(240, 12, lock), height: 100 * sc + lerp(240, 12, lock),
                    border: `4px solid ${t >= T.logo ? PINK_L : "#fff"}`, borderRadius: 14, opacity: seg(t, T.logo - 0.45, T.logo - 0.3) * (1 - seg(t, T.logo + 0.5, T.logo + 0.8)), boxShadow: t >= T.logo ? `0 0 30px ${PINK}` : "none" }} />}
                </div>
              )}
              {kC > 0 && <div style={{ position: "absolute", left: lerp(540 - 150, 640, kC), top: lerp(700, 580, kC), transform: `rotate(${lerp(0, 5, kC)}deg) scale(${lerp(0.5, 1, kC)})`, opacity: kC }}><CvDoc w={290} h={494} /></div>}
              {t >= T.entreprise - 0.1 && <Chip style={{ left: 330, top: 1090, transform: `scale(${go(t, T.entreprise - 0.1, T.entreprise + 0.2, 0, 1)})` }}><Img src={staticFile("company.png")} style={{ width: 34, height: 34, borderRadius: 8, verticalAlign: "middle", marginRight: 10 }} />pour Maison Lumen</Chip>}
              {t >= T.logo && <div style={{ position: "absolute", left: 0, right: 0, top: 492, display: "flex", justifyContent: "center", zIndex: 4 }}><div style={{ padding: "10px 26px", borderRadius: 40, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 30, boxShadow: `0 0 30px ${PINK}`, transform: `scale(${go(t, T.logo, T.logo + 0.25, 0, 1)})` }}>✓ Logo de l'entreprise · rien d'inventé</div></div>}
            </div>
          );
        })()}
        <Note t={t} a={T.s30 + 0.2} b={PH[10][0] + 0.1}>* temps mesuré : 27 à 35 s par lettre</Note>

        {/* 10. 1re lettre offerte, lien en bio */}
        {show(t, PH[10][0], PH[11][0] + 0.1) && (
          <div style={{ position: "absolute", inset: 0, ...io(t, PH[10][0], PH[11][0] + 0.1, 0.2, 0.25) }}>
            <div style={{ position: "absolute", left: 540 - 110, top: 330, fontSize: 200, transform: `scale(${go(t, T.offerte - 0.3, T.offerte, 0.2, 1)}) rotate(${Math.sin(t * 8) * 5}deg)` }}>🎁</div>
            <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", justifyContent: "center" }}>
              <div style={{ padding: "22px 46px", borderRadius: 60, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 58, boxShadow: `0 0 50px ${PINK}`, transform: `scale(${go(t, T.offerte - 0.05, T.offerte + 0.25, 0, 1)})` }}>1re lettre OFFERTE</div>
            </div>
            <div style={{ position: "absolute", left: 540 - 300, top: 800, transform: `scale(${go(t, T.lien - 0.1, T.lien + 0.25, 0, 1)})` }}>
              <GlossPill w={600} h={140}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 54, color: "#fff" }}>Lien en bio <span style={{ color: PINK_L, display: "inline-block", transform: `translateY(${Math.sin(t * 8) * 6}px)` }}>↑</span></span></GlossPill>
            </div>
          </div>
        )}

        {/* 11. la notification revient… puis le pot de départ */}
        <Notif t={t} t0={T.et - 0.05} t1={T.pot + 0.15} body="Tu as 5 minutes ? Il faut qu'on parle. 😬" buzz={[T.et, T.patron11]} />
        {t >= T.pot - 0.1 && (() => {
          const k = go(t, T.pot - 0.1, T.pot + 0.25, 0, 1), end = ease(t, PH[11][1] + 0.1, PH[11][1] + 0.6);
          const rr = rng(77);
          const conf = Array.from({ length: 70 }, () => ({ x: rr() * 1080, vx: (rr() - 0.5) * 900, vy: -600 - rr() * 1100, c: [PINK, PINK_L, "#fff", "#F4C95D", "#7C9CF5"][Math.floor(rr() * 5)], s: 12 + rr() * 16, rot: rr() * 720 }));
          const dt = t - T.pot;
          return (
            <div style={{ position: "absolute", inset: 0 }}>
              {conf.map((c, i) => {
                const x = 540 + c.vx * dt, y = 820 + c.vy * dt + 900 * dt * dt;
                return y < 2000 ? <div key={i} style={{ position: "absolute", left: x, top: y, width: c.s, height: c.s * 0.5, background: c.c, transform: `rotate(${c.rot + dt * 400}deg)`, opacity: clamp(2.5 - dt * 0.6) }} /> : null;
              })}
              <div style={{ position: "absolute", left: 0, right: 0, top: lerp(380, 300, end), textAlign: "center", transform: `scale(${k * lerp(1, 0.55, end)})`, transformOrigin: "50% 0%" }}>
                <div style={{ fontSize: 230, lineHeight: 1 }}>🎂🥂</div>
                <div style={{ display: "inline-block", marginTop: 20, padding: "14px 40px", borderRadius: 20, background: "#FBF8F7", color: "#1D1D1F", fontFamily: "Poppins", fontWeight: 700, fontSize: 60, transform: "rotate(-3deg)", boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>Pot de départ</div>
              </div>
              {/* écran de fin */}
              {end > 0 && (
                <div style={{ position: "absolute", inset: 0, opacity: end }}>
                  <div style={{ position: "absolute", left: 540 - 85, top: 720, transform: `scale(${go(t, PH[11][1] + 0.1, PH[11][1] + 0.45, 0, 1)})` }}><AppIcon size={170} /></div>
                  <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: 290, top: 920, width: 500, clipPath: `inset(0 ${(1 - seg(t, PH[11][1] + 0.25, PH[11][1] + 0.6)) * 100}% 0 0)`, filter: `drop-shadow(0 0 18px ${PINK})` }} />
                  <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff", opacity: seg(t, PH[11][1] + 0.5, PH[11][1] + 0.8) }}>Postulez. <span style={{ color: PINK_L }}>Et faites-vous recruter.</span></div>
                  <div style={{ position: "absolute", left: 540 - 270, top: 1180, transform: `scale(${go(t, PH[11][1] + 0.7, PH[11][1] + 1.0, 0, 1)})` }}>
                    <GlossPill w={540} h={120}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff" }}>Lien en bio <span style={{ color: PINK_L }}>↑</span></span></GlossPill>
                  </div>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 1340, textAlign: "center", fontFamily: "Open Sans", fontWeight: 600, fontSize: 30, color: PINK_L, opacity: seg(t, PH[11][1] + 0.9, PH[11][1] + 1.2) }}>Ta 1re lettre est offerte</div>
                </div>
              )}
            </div>
          );
        })()}

        <Captions t={t} />
      </div>
      <Flash k={flash} />
    </AbsoluteFill>
  );
};
