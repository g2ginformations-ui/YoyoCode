// « Le recruteur qui fait des tractions » (≈51 s, 60 i/s, 9:16) — vidéo TikTok du propriétaire, tournée par lui-même
// (public/tractions/barre.mp4 : tractions filmées de dos ; le son d'origine, un morceau du commerce, est retiré).
// Arrêt sur image au sommet d'une traction (« Tu me connais pour les tractions… ») → rembobinage façon cassette
// (« Mais avant… ») → tampon « RECRUTEUR. » → 5 mois en cabinet + 1 an d'alternance à Paris → profils payés plus de
// 100 000 €/an → deux CV, la lettre fait la différence → « C'est comme les tractions : sans méthode, tu forces… et tu
// stagnes » (retour au tournage net, gros plan, arrêt sur « stagnes ») → MyMotiv (vrai site, 30 s*) → Léni → « écris un
// métier en commentaire » → 1re lettre offerte, lien en bio → « Moi, je retourne à mes tractions » (dernière traction).
// Faits confirmés par le propriétaire (voir CLAUDE.md). Voix : ElevenLabs « Alexandre » (--voix yann), voix-tractions.json.
// Son : synth_tractions.py.
import React from "react";
import { AbsoluteFill, Audio, Freeze, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Check, FileUser, Gift, Link2, MapPin, MessageCircle, Timer } from "lucide-react";
import { go } from "./apple";
import { PINK, PINK_L, clamp, easeOutBack, lerp, rng, seg } from "./common";
import { Flash, GlossPill, ease, pulse } from "./motion";
import { Extruded, Pill } from "./AlternancePartout";
import { CvCard } from "./PresentationYann";
import voix from "./data/tractions-voix.json";
import "./fonts";

export const TRACTIONS_DUR = voix.duration;
const BG = "#0B0A0B", GLASS = "linear-gradient(170deg, #2E2A2C 0%, #1A1718 100%)", SOFT = "#8E8E93";
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const show = (t: number, a: number, b: number) => t >= a && t < b;
const T = {
  trac1: Wt(5), mais: Wt(6), etais: Wt(8), bureau: Wt(15), recr: Wt(16), cinq: Wt(17), cabinet: Wt(20), unAn: Wt(24), alternance: Wt(27),
  agence: Wt(30), paris: Wt(36), plus: Wt(43), cent: Wt(45), truc: Wt(57), deux: Wt(59), lettre: Wt(66), diff: Wt(70), trac2: Wt(75),
  sans: Wt(76), forces: Wt(79), stagnes: Wt(82), mymotiv: Wt(94), lien: Wt(96), cv: Wt(101), s30: Wt(104), cette: Wt(111), onze: Wt(116),
  sept: Wt(118), crois: Wt(128), ecris: Wt(132), metier: Wt(134), comment: Wt(136), teste: Wt(138), recr3: Wt(148), offerte: Wt(155),
  bio: Wt(159), moi: Wt(160), trac3: Wt(165), end: PH[9][1],
};

// ─── le tournage : temps de la vidéo source en fonction du temps du montage (arrêts, rembobinage, ralentis) ───
const SRC_MAX = 26.5;
const FREEZE = T.trac1 + 0.1;                         // sommet de la traction (3,45 s dans la source) sur « tractions »
const CUT1 = T.recr - 0.02, CUT2 = PH[5][0] - 0.06, CUT3 = PH[6][0] - 0.1, CUT4 = PH[9][0] - 0.06, TOP3 = T.trac3 + 0.05;
const KF: [number, number][] = [
  [0, 3.45 - FREEZE], [FREEZE, 3.45],                  // lecture normale jusqu'au sommet
  [T.mais - 0.12, 3.45],                               // arrêt sur image
  [T.bureau + 0.25, 0.05],                             // rembobinage
  [CUT1, 0.05],                                        // image figée, noir et blanc
  [CUT1 + 0.001, 4.0], [CUT2, 4.0 + (CUT2 - CUT1) * 0.8], // fond flou, ralenti
  [CUT2 + 0.001, 17.0], [T.stagnes + 0.02, 17.0 + (T.stagnes + 0.02 - CUT2)], // « sans méthode » : net, vitesse réelle (gros plan à 18,6 s)
  [CUT3, 17.0 + (T.stagnes + 0.02 - CUT2)],            // arrêt sur « stagnes »
  [CUT3 + 0.001, 5.0], [CUT4, 16.0],                   // fond flou, ralenti
  [CUT4 + 0.001, 24.35 - (TOP3 - (T.moi - 0.3)) - (T.moi - 0.3 - CUT4) * 0.6],
  [T.moi - 0.3, 24.35 - (TOP3 - (T.moi - 0.3))], [TOP3, 24.35], // dernière traction : sommet sur « tractions »
  [voix.duration, SRC_MAX],
];
const srcAt = (t: number) => {
  for (let i = 1; i < KF.length; i++) if (t <= KF[i][0]) { const [a, sa] = KF[i - 1], [b, sb] = KF[i]; return clamp(lerp(sa, sb, seg(t, a, b)), 0, SRC_MAX); }
  return SRC_MAX;
};
const Footage: React.FC<{ t: number }> = ({ t }) => {
  const frame = Math.round(srcAt(t) * 60);
  const blurOn = Math.max(seg(t, CUT1 - 0.05, CUT1 + 0.2) * (1 - seg(t, CUT2 - 0.05, CUT2 + 0.15)), seg(t, CUT3 - 0.12, CUT3 + 0.15) * (1 - seg(t, CUT4 - 0.15, CUT4)));
  const half = seg(t, CUT4 - 0.15, CUT4) * (1 - seg(t, T.moi - 0.45, T.moi - 0.15));
  const blur = blurOn * 30 + half * 8;
  const bright = lerp(1, 0.42, blurOn) * lerp(1, 0.5, half) * (1 - 0.25 * seg(t, T.bureau, CUT1) * (t < CUT1 ? 1 : 0));
  const bw = t < CUT1 ? Math.max(0.5 * seg(t, T.mais - 0.12, T.mais), seg(t, T.bureau, T.bureau + 0.4)) : show(t, T.stagnes, CUT3) ? seg(t, T.stagnes, T.stagnes + 0.25) * 0.8 : 0;
  const rewind = show(t, T.mais - 0.12, T.bureau + 0.25), r = rng(Math.round(t * 60) + 3);
  const punch = 1 + 0.07 * ease(t, FREEZE, FREEZE + 0.18) * (t < T.mais ? 1 : 0) + 0.05 * ease(t, T.bureau, CUT1) * (t < CUT1 ? 1 : 0) + 0.06 * ease(t, T.stagnes, T.stagnes + 0.2) * (show(t, T.stagnes, CUT3) ? 1 : 0);
  const zoom = blur > 0 ? 1.12 : punch;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${rewind ? (r() - 0.5) * 16 : 0}px) scale(${zoom})`, filter: `blur(${blur}px) brightness(${bright}) saturate(${1 - bw}) contrast(${1 + 0.15 * bw})` }}>
      <Freeze frame={frame}><OffthreadVideo src={staticFile("tractions/barre.mp4")} muted style={{ width: 1080, height: 1920 }} /></Freeze>
    </div>
  );
};

// ─── effet cassette pendant le rembobinage ───
const Vhs: React.FC<{ t: number }> = ({ t }) => {
  const k = seg(t, T.mais - 0.12, T.mais - 0.02) * (1 - seg(t, T.bureau + 0.2, T.bureau + 0.35));
  if (k <= 0) return null;
  const r = rng(Math.round(t * 30) + 11);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: k }}>
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.28) 0 2px, rgba(0,0,0,0) 2px 5px)" }} />
      {[0, 1, 2].map((i) => { const y = (t * 1100 + i * 700 + r() * 60) % 2100 - 100; return (
        <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 30 + r() * 70, background: "linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.22), rgba(242,184,192,0.12))", filter: "blur(3px)" }} />
      ); })}
      <div style={{ position: "absolute", left: 70, top: 150, fontFamily: "DejaVu Sans Mono, monospace", fontWeight: 700, fontSize: 64, color: "#fff", textShadow: "3px 0 0 rgba(217,130,139,0.9), -3px 0 0 rgba(120,200,255,0.6)", opacity: Math.floor(t * 4) % 2 ? 1 : 0.75 }}>◀◀ AVANT</div>
    </div>
  );
};

// ─── sous-titres mot à mot sur le tournage (texte corrigé, temps de la voix) ───
const Cap: React.FC<{ t: number; a: number; b: number; words: [string, number][]; top?: number; size?: number; hot?: number[] }> = ({ t, a, b, words, top = 1180, size = 70, hot = [] }) => {
  if (!show(t, a, b)) return null;
  const o = 1 - seg(t, b - 0.15, b);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `0 ${size * 0.28}px`, opacity: o }}>
      {words.map(([w, i], n) => { const at = Wt(i) - 0.06, k = easeOutBack(seg(t, at, at + 0.18)); return t >= at ? (
        <span key={n} style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: size, lineHeight: 1.12, letterSpacing: -1.5, color: hot.includes(n) ? PINK_L : "#fff", display: "inline-block",
          transform: `scale(${lerp(0.6, 1, k)}) translateY(${(1 - k) * 20}px)`, WebkitTextStroke: "2px rgba(11,10,11,0.9)", paintOrder: "stroke fill", textShadow: "0 6px 24px rgba(0,0,0,0.85)" }}>{w}</span>
      ) : null; })}
    </div>
  );
};

// ─── titres (scènes sur fond flou) ───
const Title: React.FC<{ t: number; a: number; b: number; top: number; children: React.ReactNode; size?: number }> = ({ t, a, b, top, children, size = 66 }) => {
  if (!show(t, a - 0.05, b)) return null;
  const k = ease(t, a, a + 0.35), o = seg(t, b - 0.2, b);
  return <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: size, lineHeight: 1.1, letterSpacing: -2, color: "#fff",
    opacity: clamp(k * 1.4) * (1 - o), transform: `translateY(${(1 - k) * 36}px)`, filter: `blur(${(1 - k) * 8 + o * 10}px)`, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>{children}</div>;
};
const Note: React.FC<{ t: number; a: number; b: number; top: number; children: React.ReactNode }> = ({ t, a, b, top, children }) =>
  show(t, a, b) ? <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", fontFamily: "Open Sans", fontSize: 26, color: "rgba(245,245,247,0.7)", opacity: seg(t, a, a + 0.25) * (1 - seg(t, b - 0.2, b)) }}>{children}</div> : null;
const Scene: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) =>
  show(t, a - 0.05, b) ? <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, b - 0.25, b - 0.02) }}>{children}</div> : null;

// ─── scènes ───
const Hook: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Cap t={t} a={0.3} b={T.mais - 0.1} top={1120} size={64} words={[["Tu", 0], ["me", 1], ["connais", 2], ["pour", 3], ["les", 4]]} />
    {show(t, T.trac1 - 0.12, T.mais - 0.1) && <div style={{ position: "absolute", left: 0, right: 0, top: 1210, display: "flex", justifyContent: "center", opacity: 1 - seg(t, T.mais - 0.25, T.mais - 0.1), transform: `scale(${go(t, T.trac1 - 0.12, T.trac1 + 0.12, 1.7, 1)}) rotate(-3deg)` }}><Extruded text="TRACTIONS…" size={150} /></div>}
    <Cap t={t} a={T.mais - 0.1} b={CUT1 - 0.05} top={1150} size={66} hot={[1]} words={[["Mais", 6], ["avant…", 7], ["j'étais", 8], ["de", 10], ["l'autre", 11], ["côté", 13], ["du", 14], ["bureau.", 15]]} />
    {show(t, CUT1 - 0.1, PH[2][0] + 0.05) && (
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", flexDirection: "column", alignItems: "center", opacity: 1 - seg(t, PH[2][0] - 0.2, PH[2][0] + 0.05) }}>
        <div style={{ transform: `scale(${go(t, CUT1 - 0.1, CUT1 + 0.12, 2.2, 1)}) rotate(-5deg)`, opacity: seg(t, CUT1 - 0.1, CUT1) }}><Extruded text="RECRUTEUR." size={150} /></div>
        <div style={{ marginTop: 60, fontFamily: "Poppins", fontWeight: 700, fontSize: 48, color: "#fff", opacity: seg(t, CUT1 + 0.25, CUT1 + 0.5), textShadow: "0 4px 20px rgba(0,0,0,0.8)" }}>Moi, c'est <span style={{ color: PINK_L }}>Yann</span>.</div>
      </div>
    )}
  </>
);
const Career: React.FC<{ t: number }> = ({ t }) => (
  <Scene t={t} a={PH[2][0]} b={PH[3][0]}>
    {[[T.cinq, "5 mois", "en cabinet de recrutement", 300], [T.unAn, "1 an", "en alternance", 720]].map(([at, big, small, top], i) => t >= (at as number) - 0.3 && (
      <div key={i} style={{ position: "absolute", left: 0, right: 0, top: top as number, textAlign: "center" }}>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 210, lineHeight: 1, letterSpacing: -8, color: PINK_L, transform: `scale(${go(t, (at as number) - 0.3, (at as number) + 0.05, 0.4, 1)})`, opacity: seg(t, (at as number) - 0.35, (at as number) - 0.15) }}>{big}</div>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 56, color: "#fff", marginTop: 8, opacity: seg(t, (at as number) + 0.15, (at as number) + 0.45) }}>{small}</div>
      </div>
    ))}
    {t >= T.agence - 0.35 && <div style={{ position: "absolute", left: 540, top: 1100, transform: `translate(-50%, 0) scale(${go(t, T.agence - 0.35, T.agence, 0.3, 0.9)})` }}><Pill icon={MapPin} label="Une agence à Paris" pink /></div>}
  </Scene>
);
const Hundred: React.FC<{ t: number }> = ({ t }) => {
  const n = Math.round(100000 * ease(t, T.cent - 0.9, T.cent + 0.05) / 1000) * 1000;
  return (
    <Scene t={t} a={PH[3][0]} b={PH[4][0]}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", opacity: ease(t, PH[3][0], PH[3][0] + 0.3) }}>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 58, color: "#fff" }}>J'ai recruté des profils payés</div>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 50, color: PINK_L, marginTop: 16, opacity: seg(t, T.plus - 0.1, T.plus + 0.15) }}>plus de</div>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 180, lineHeight: 1, letterSpacing: -6, color: "#fff", marginTop: 8, opacity: seg(t, T.cent - 0.9, T.cent - 0.7), transform: `scale(${1 + 0.08 * pulse(t, T.cent + 0.05, 0.1)})` }}>{n.toLocaleString("fr-FR")} €</div>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 60, color: PINK_L, marginTop: 10, opacity: seg(t, T.cent + 0.25, T.cent + 0.5) }}>par an</div>
      </div>
    </Scene>
  );
};
const Difference: React.FC<{ t: number }> = ({ t }) => {
  const cvs = ease(t, T.deux - 0.3, T.deux + 0.2), letter = ease(t, T.lettre - 0.2, T.lettre + 0.25), win = ease(t, T.diff - 0.2, T.diff + 0.2);
  return (
    <Scene t={t} a={PH[4][0]} b={PH[5][0]}>
      <Title t={t} a={PH[4][0]} b={T.deux - 0.3} top={700} size={70}>Et là-bas, j'ai vu un truc…</Title>
      <Title t={t} a={T.deux - 0.3} b={T.lettre - 0.15} top={300} size={64}>2 CV qui se ressemblent ?</Title>
      <Title t={t} a={T.lettre - 0.15} b={PH[5][0]} top={300} size={64}><span style={{ color: PINK_L }}>La lettre</span> fait la différence.</Title>
      {cvs > 0 && [0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: i ? 590 : 190, top: 560, transformOrigin: "50% 50%", transform: `translateY(${(1 - cvs) * 80}px) rotate(${(i ? 4 : -4) * cvs}deg) scale(${1.15 * (i ? 1 + 0.06 * win : 1 - 0.06 * win)})`, opacity: cvs }}>
          <CvCard glow={i ? win : 0} dim={i ? 0 : win} />
          {i === 1 && letter > 0 && (
            <div style={{ position: "absolute", left: 150, top: 180, width: 200, height: 250, borderRadius: 18, background: `linear-gradient(165deg, ${PINK_L}, ${PINK})`, transform: `translate(${(1 - letter) * 400}px, ${(1 - letter) * -300}px) rotate(${lerp(30, 8, letter)}deg)`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", padding: 20, boxSizing: "border-box" }}>
              <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 26, color: "#fff", marginBottom: 12 }}>Lettre</div>
              {[150, 130, 160, 110].map((w, k) => <div key={k} style={{ width: w, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.6)", marginBottom: 12 }} />)}
            </div>
          )}
          {i === 1 && win > 0 && <div style={{ position: "absolute", left: 20, top: 450, transform: `scale(${go(t, T.diff - 0.2, T.diff + 0.1, 0.3, 0.8)})`, transformOrigin: "0 50%" }}><Pill icon={Check} label="Retenu" pink /></div>}
        </div>
      ))}
    </Scene>
  );
};
const Methode: React.FC<{ t: number }> = ({ t }) => {
  const big = (at: number, b: number, text: string, front?: string) => show(t, at - 0.12, b) && (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1170, display: "flex", justifyContent: "center", opacity: 1 - seg(t, b - 0.1, b), transform: `scale(${go(t, at - 0.12, at + 0.12, 1.6, 1)}) rotate(-3deg)` }}><Extruded text={text} size={118} front={front} /></div>
  );
  return (
    <>
      <Cap t={t} a={PH[5][0]} b={T.sans - 0.12} top={1150} size={68} hot={[3]} words={[["C'est", 71], ["comme", 73], ["les", 74], ["tractions :", 75]]} />
      {big(T.sans, T.forces - 0.1, "SANS MÉTHODE,", "#fff")}
      {big(T.forces, T.stagnes - 0.1, "TU FORCES…", "#fff")}
      {big(T.stagnes, CUT3 + 0.05, "ET TU STAGNES.")}
      {show(t, T.stagnes + 0.05, CUT3) && <div style={{ position: "absolute", left: 70, top: 150, display: "flex", gap: 18, opacity: seg(t, T.stagnes + 0.05, T.stagnes + 0.15) }}>
        {[0, 1].map((i) => <div key={i} style={{ width: 30, height: 96, borderRadius: 8, background: "#fff", boxShadow: "0 6px 20px rgba(0,0,0,0.6)" }} />)}
      </div>}
    </>
  );
};
const GEN = ["044", "046", "048", "050", "052", "053"];
const Product: React.FC<{ t: number }> = ({ t }) => {
  const ph = ease(t, T.mymotiv - 0.3, T.mymotiv + 0.3);
  const shot = t < T.cv - 0.15 ? "parcours/010-offre-lien.png" : t < T.s30 - 0.1 ? "parcours/008-cv-ajoute.png" : t < T.cette - 0.3 ? `shots/${GEN[Math.min(5, Math.floor(seg(t, T.s30 - 0.1, T.cette - 0.3) * 6))]}-generation.png` : "shots/054-lettre.png";
  const PW = 1080 * 0.36, PHh = 1920 * 0.36;
  return (
    <Scene t={t} a={PH[6][0]} b={PH[7][0]}>
      <Title t={t} a={PH[6][0]} b={PH[7][0]} top={190} size={54}>Tout ce que j'ai appris, je l'ai mis dans</Title>
      {t >= T.mymotiv - 0.3 && <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: 540 - 220, top: 340, width: 440, filter: `drop-shadow(0 0 18px ${PINK})`, transform: `scale(${go(t, T.mymotiv - 0.3, T.mymotiv + 0.05, 0.4, 1)})` }} />}
      <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
        <div style={{ position: "absolute", left: 540 - PW / 2, top: 520, width: PW, height: PHh, transform: `rotateY(${lerp(26, -5, ph) + Math.sin(t * 1.2) * 3}deg) scale(${lerp(0.75, 1, ph)})`, opacity: ph }}>
          <div style={{ position: "absolute", inset: -13, borderRadius: 66, background: "linear-gradient(135deg, #3A3A3C, #0B0A0B)", boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 60px rgba(217,130,139,0.25), inset 0 0 0 2px #4A4A4E" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 54, overflow: "hidden" }}><Img src={staticFile(shot)} style={{ width: PW, height: PHh }} /></div>
        </div>
      </div>
      {([[Link2, "Le lien de l'offre", T.lien, 30, 640], [FileUser, "Ton CV", T.cv, 690, 880], [Timer, "30 s*", T.s30, 50, 1100]] as const).map(([I, label, at, x, y], i) => t >= at - 0.2 && (
        <div key={i} style={{ position: "absolute", left: x, top: y, transformOrigin: x < 540 ? "0 50%" : "100% 50%", transform: `scale(${go(t, at - 0.2, at + 0.1, 0.3, 0.8)})` }}><Pill icon={I} label={label} pink={i === 2} /></div>
      ))}
      <Note t={t} a={T.s30} b={PH[7][0]} top={1270}>* temps mesuré : 27 à 35 s par lettre</Note>
    </Scene>
  );
};
const Leni: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, PH[7][0], PH[7][0] + 0.35);
  const c1 = Math.round(11 * ease(t, T.onze - 0.5, T.onze + 0.05)), c2 = Math.round(7 * ease(t, T.sept - 0.4, T.sept + 0.05));
  return (
    <Scene t={t} a={PH[7][0]} b={PH[8][0]}>
      <div style={{ position: "absolute", left: 110, right: 110, top: 520, padding: "40px 40px", borderRadius: 44, background: GLASS, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", opacity: k, transform: `translateY(${(1 - k) * 60}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 84, height: 84, borderRadius: 42, background: `linear-gradient(160deg, ${PINK_L}, ${PINK})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 42, color: "#fff" }}>L</div>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff" }}>Léni S. l'a testé</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 26 }}>
          {[[c1, "candidatures"], [c2, "entretiens"]].map(([n, l], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 150, lineHeight: 1, letterSpacing: -4, color: i ? PINK_L : "#fff", transform: `scale(${1 + 0.1 * pulse(t, (i ? T.sept : T.onze) + 0.05, 0.08)})` }}>{n}</div>
              <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 34, color: SOFT }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, textAlign: "center", fontFamily: "Open Sans", fontSize: 24, color: "rgba(245,245,247,0.72)" }}>Témoignage réel · résultats individuels non garantis</div>
      </div>
    </Scene>
  );
};
const JOBS = ["Commerciale", "Boulanger", "Développeuse web", "Aide-soignant", "Comptable"];
const Comments: React.FC<{ t: number }> = ({ t }) => (
  <Scene t={t} a={PH[8][0]} b={PH[9][0]}>
    <Title t={t} a={PH[8][0]} b={T.ecris - 0.15} top={640} size={68}>Je suis recruteur :<br /><span style={{ color: PINK_L }}>je te crois pas sur parole.</span></Title>
    {t >= T.ecris - 0.2 && (
      <div style={{ position: "absolute", left: 0, right: 0, top: 200, display: "flex", flexDirection: "column", alignItems: "center", transform: `scale(${go(t, T.ecris - 0.2, T.ecris + 0.1, 0.5, 1)})` }}>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 76, letterSpacing: -2, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>Écris un <span style={{ color: PINK_L }}>métier</span></div>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 56, color: "#fff", opacity: seg(t, T.comment - 0.15, T.comment + 0.1) }}>en commentaire ↓</div>
      </div>
    )}
    {JOBS.map((j, i) => { const at = T.metier + 0.05 + i * 0.22, k = ease(t, at, at + 0.3); return t >= at && (
      <div key={j} style={{ position: "absolute", left: i % 2 ? 300 : 120, top: 470 + i * 116, display: "flex", alignItems: "center", gap: 16, padding: "14px 28px 14px 14px", borderRadius: 40, background: "rgba(30,26,28,0.92)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 16px 40px rgba(0,0,0,0.5)", opacity: k, transform: `translateY(${(1 - k) * 40}px) scale(${lerp(0.8, 1, easeOutBack(k))})` }}>
        <div style={{ width: 56, height: 56, borderRadius: 28, background: i % 2 ? GLASS : `linear-gradient(160deg, ${PINK_L}, ${PINK})`, display: "flex", alignItems: "center", justifyContent: "center" }}><MessageCircle size={28} color="#fff" /></div>
        <span style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 38, color: "#F5F5F7" }}>{j}</span>
      </div>
    ); })}
    {t >= T.teste - 0.25 && <div style={{ position: "absolute", left: 540, top: 1080, transform: `translate(-50%, 0) scale(${go(t, T.teste - 0.25, T.teste + 0.05, 0.3, 0.85)})` }}><Pill icon={Timer} label="Je teste en direct" /></div>}
    {t >= T.recr3 - 0.3 && <div style={{ position: "absolute", left: 540, top: 1230, transform: `translate(-50%, 0) scale(${go(t, T.recr3 - 0.3, T.recr3 + 0.05, 0.3, 0.85)})` }}><Pill icon={Check} label="L'avis d'un recruteur" pink /></div>}
  </Scene>
);
const Cta: React.FC<{ t: number }> = ({ t }) => (
  <>
    <Scene t={t} a={PH[9][0]} b={T.moi - 0.15}>
      {t >= T.offerte - 0.4 && <div style={{ position: "absolute", left: 540, top: 560, transform: `translate(-50%, 0) scale(${go(t, T.offerte - 0.4, T.offerte, 0.3, 1)})` }}><Pill icon={Gift} label="Ta 1re lettre est offerte" pink /></div>}
      {t >= T.bio - 0.3 && <div style={{ position: "absolute", left: 540 - 260, top: 760, transform: `scale(${go(t, T.bio - 0.3, T.bio + 0.05, 0, 1)})` }}><GlossPill w={520} h={110}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff" }}>Lien en bio <span style={{ color: PINK_L }}>↑</span></span></GlossPill></div>}
    </Scene>
    <Cap t={t} a={T.moi - 0.1} b={T.end + 0.6} top={1180} size={70} hot={[4]} words={[["Moi,", 160], ["je", 161], ["retourne", 162], ["à mes", 163], ["tractions.", 165]]} />
    {t >= T.end + 0.3 && (
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, display: "flex", flexDirection: "column", alignItems: "center", gap: 10, opacity: ease(t, T.end + 0.3, T.end + 0.8) }}>
        <Img src={staticFile("logo-mymotiv.png")} style={{ width: 380, filter: `drop-shadow(0 0 16px ${PINK}) drop-shadow(0 4px 20px rgba(0,0,0,0.8))` }} />
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 34, color: "#fff", textShadow: "0 4px 20px rgba(0,0,0,0.9)" }}>Yann · le recruteur qui fait des tractions</div>
        <div style={{ marginTop: 14, opacity: seg(t, T.end + 0.6, T.end + 0.9), transform: `scale(${go(t, T.end + 0.6, T.end + 0.9, 0.5, 0.8)})` }}><Pill icon={Gift} label="1re lettre offerte · lien en bio ↑" pink /></div>
      </div>
    )}
  </>
);

export const RecruteurTractions: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const r = rng(frame + 29);
  const hits = [FREEZE, T.recr, T.cent, T.diff, T.sans, T.forces, T.stagnes, T.s30, T.sept, TOP3];
  const shake = hits.reduce((s, h) => s + pulse(t, h + 0.04, 0.06), 0) * 9;
  const flash = pulse(t, FREEZE, 0.06) * 0.5 + pulse(t, CUT1, 0.07) * 0.8 + pulse(t, CUT2, 0.05) * 0.3 + pulse(t, T.stagnes, 0.05) * 0.4 + pulse(t, CUT4, 0.05) * 0.2 + pulse(t, TOP3, 0.07) * 0.5;
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <Audio src={staticFile("audio/tractions.wav")} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)` }}>
        <Footage t={t} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(11,10,11,0.45) 0%, rgba(11,10,11,0) 22%, rgba(11,10,11,0) 52%, rgba(11,10,11,0.55) 100%)" }} />
        <Vhs t={t} />
        <Hook t={t} />
        <Career t={t} />
        <Hundred t={t} />
        <Difference t={t} />
        <Methode t={t} />
        <Product t={t} />
        <Leni t={t} />
        <Comments t={t} />
        <Cta t={t} />
      </div>
      <Flash k={flash} />
    </AbsoluteFill>
  );
};
