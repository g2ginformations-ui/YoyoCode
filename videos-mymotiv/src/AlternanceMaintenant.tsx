// « Commence ton alternance maintenant » (≈55 s, 60 i/s, 9:16) — deux parties, dans la DA MyMotiv (pilules roses, mots 3D,
// Yann qui présente) : PARTIE 1 « pourquoi maintenant » (frise des mois : tu es ici → 1res offres dès février → pic de mars
// à juin → « Février, c'est demain » → MAINTENANT) ; PARTIE 2 « l'alternance de tes rêves en 4 étapes » (métier puis
// formation, liste d'entreprises de rêve, une lettre par entreprise avec MyMotiv, postuler avant la vague + relance —
// conseil d'ancien recruteur), preuve Léni, 1re lettre offerte. Source de la partie 1 (affichée) : Bloom Alternance,
// « Quand chercher une alternance », 21/01/2026. Voix ElevenLabs « Paul K » (voix-maintenant.json). Son : synth_maintenant.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AlarmClock, ArrowDown, Award, Briefcase, Check, FileUser, Flag, Gift, GraduationCap, Heart, Link2, MapPin, RotateCcw, Send, Timer } from "lucide-react";
import { go } from "./apple";
import { PINK, PINK_L, clamp, easeInOut, easeOutBack, lerp, rng, seg } from "./common";
import { AppIcon, Flash, GlossPill, ease, pulse } from "./motion";
import { Extruded, Pill } from "./AlternancePartout";
import voix from "./data/maintenant-voix.json";
import voixEnv from "./data/maintenant-env.json";
import "./fonts";

export const MAINTENANT_DUR = voix.duration;
const BG = "#0B0A0B", GLASS = "linear-gradient(170deg, #2E2A2C 0%, #1A1718 100%)", INK = "#F5F5F7", SOFT = "#8E8E93";
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const show = (t: number, a: number, b: number) => t >= a && t < b;
const T = {
  fev: Wt(19), pic: Wt(22), mars: Wt(26), juin: Wt(28), demain: Wt(32), maintenant: Wt(36), choisis: Wt(39), etapes: Wt(47),
  un: Wt(48), formation: Wt(59), deux: Wt(63), trois: Wt(72), copier: Wt(79), mission: Wt(87), mm: Wt(89), lien: Wt(93), cv: Wt(98), s30: Wt(104),
  quatre: Wt(106), spontanee: Wt(113), relance: Wt(118), conseil: Wt(122), onze: Wt(130), sept: Wt(132), offerte: Wt(138), bio: Wt(141), go: Wt(144), end: PH[10][1],
};
const P2 = PH[3][0] - 0.3;                                                 // début de la partie 2
const STEPS = [PH[4][0] - 0.2, PH[5][0] - 0.2, PH[6][0] - 0.2, PH[8][0] - 0.2, PH[9][0] - 0.2];   // étapes 1 à 4, puis Léni

// ─── étiquette de chapitre (le « modèle » en deux parties) + points d'étapes ───
const Chapter: React.FC<{ t: number }> = ({ t }) => {
  if (t > PH[10][0]) return null;
  const p2 = t >= P2, k = p2 ? ease(t, P2, P2 + 0.35) : ease(t, 0.15, 0.5);
  const step = STEPS.reduce((a, s, i) => (t >= s ? i : a), -1);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 170, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, opacity: k * (1 - seg(t, PH[10][0] - 0.3, PH[10][0])) }}>
      <div style={{ padding: "10px 26px", borderRadius: 40, border: `2px solid ${PINK}`, background: "rgba(217,130,139,0.12)", fontFamily: "Poppins", fontWeight: 700, fontSize: 28, letterSpacing: 1, color: PINK_L, transform: `translateY(${(1 - k) * -20}px)` }}>
        {p2 ? "PARTIE 2 · L'ALTERNANCE DE TES RÊVES" : "PARTIE 1 · POURQUOI MAINTENANT"}
      </div>
      {p2 && t >= T.etapes - 0.2 && (
        <div style={{ display: "flex", gap: 14 }}>
          {[0, 1, 2, 3].map((i) => <div key={i} style={{ width: i === step ? 46 : 14, height: 14, borderRadius: 7, background: i <= step ? PINK : "rgba(255,255,255,0.18)", transition: "none" }} />)}
        </div>
      )}
    </div>
  );
};

// ─── PARTIE 1 · hook : « trop tôt ? » ───
const Hook: React.FC<{ t: number }> = ({ t }) => {
  if (t > PH[1][0] + 0.2) return null;
  const out = seg(t, PH[1][0] - 0.15, PH[1][0] + 0.2), ring = Math.sin(t * 38) * 9 * (1 - seg(t, 0.9, 1.4));
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: `blur(${out * 14}px)` }}>
      <div style={{ position: "absolute", left: 540 - 130, top: 360, transform: `rotate(${ring}deg) scale(${go(t, -0.1, 0.25, 0.4, 1)})` }}>
        <div style={{ width: 260, height: 260, borderRadius: 70, background: `linear-gradient(145deg, ${PINK_L}, ${PINK} 55%, #B9606B)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 30px 80px rgba(217,130,139,0.45), inset 0 3px 0 rgba(255,255,255,0.4)" }}>
          <AlarmClock size={150} color="#fff" strokeWidth={1.8} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 720, display: "flex", justifyContent: "center", transform: `scale(${go(t, 0.15, 0.5, 1.25, 1)})`, opacity: seg(t, 0.1, 0.25) }}><Extruded text="TROP TÔT ?" size={150} /></div>
      {t >= Wt(10) - 0.2 && <div style={{ position: "absolute", left: 540, top: 960, transform: `translate(-50%, 0) scale(${go(t, Wt(10) - 0.2, Wt(10) + 0.1, 0.3, 1)})` }}><Pill icon={GraduationCap} label="Ton alternance" pink /></div>}
    </div>
  );
};

// ─── PARTIE 1 · la frise des mois ───
const MONTHS = ["OCT", "NOV", "DÉC", "JANV", "FÉV", "MARS", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT"];
const MX = (i: number) => 200 + i * 230, LINE_Y = 860;
const Timeline: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, PH[1][0] - 0.3, P2 + 0.2)) return null;
  const inK = ease(t, PH[1][0] - 0.3, PH[1][0] + 0.2), out = seg(t, T.maintenant - 0.25, T.maintenant + 0.1);
  // caméra sur la frise
  const keys: [number, number, number][] = [[PH[1][0], MX(1), 1], [T.fev - 0.35, MX(1), 1], [T.fev + 0.15, MX(4), 1], [T.pic - 0.3, MX(4), 1], [T.pic + 0.25, (MX(5) + MX(8)) / 2, 0.82], [T.juin, (MX(5) + MX(8)) / 2, 0.82], [T.juin + 0.45, (MX(0) + MX(11)) / 2, 0.4], [T.demain - 0.5, (MX(0) + MX(11)) / 2, 0.4], [T.demain + 0.1, MX(1.5), 0.62]];
  let cx = keys[0][1], z = keys[0][2];
  for (let i = 0; i < keys.length - 1; i++) { const [a, x0, z0] = keys[i], [b, x1, z1] = keys[i + 1]; if (t >= a) { const k = easeInOut(seg(t, a, b)); cx = lerp(x0, x1, k); z = lerp(z0, z1, k); } }
  const squeeze = easeInOut(seg(t, T.demain - 0.55, T.demain - 0.05));   // « Février, c'est demain » : novembre → janvier s'écrasent
  const mx = (i: number) => (i >= 1 && i <= 3 ? lerp(MX(i), MX(0) + 110, squeeze) : i >= 4 ? MX(i) - 3 * 230 * squeeze : MX(i));
  const wave = ease(t, T.pic - 0.1, T.pic + 0.5), first = ease(t, T.fev - 0.1, T.fev + 0.25), rentree = ease(t, T.juin + 0.2, T.juin + 0.6);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: inK * (1 - out), filter: `blur(${out * 14}px)` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 3000, height: 1920, transformOrigin: `0 ${LINE_Y}px`, transform: `translateX(${540 - cx * z}px) scale(${z})` }}>
        {/* la vague (schéma) au-dessus de mars → juin */}
        <svg width={3000} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs><linearGradient id="vague" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={PINK_L} stopOpacity={0.9} /><stop offset="1" stopColor={PINK} stopOpacity={0.05} /></linearGradient></defs>
          <path d={`M${mx(4)} ${LINE_Y - 40} C${mx(5)} ${LINE_Y - 40} ${mx(5)} ${LINE_Y - 40 - 420 * wave} ${(mx(6) + mx(7)) / 2} ${LINE_Y - 40 - 420 * wave} C${mx(8)} ${LINE_Y - 40 - 420 * wave} ${mx(8)} ${LINE_Y - 40} ${mx(9)} ${LINE_Y - 40} Z`} fill="url(#vague)" opacity={wave * (1 - squeeze * 0.6)} />
          <line x1={MX(0) - 120} y1={LINE_Y} x2={MX(11) + 120} y2={LINE_Y} stroke="rgba(255,255,255,0.18)" strokeWidth={6} strokeLinecap="round" />
        </svg>
        {wave > 0.05 && <div style={{ position: "absolute", left: (mx(6) + mx(7)) / 2 - 300, top: LINE_Y - 560, width: 600, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 52, color: "#fff", opacity: wave * (1 - squeeze) }}>Le pic : mars → juin</div>}
        {MONTHS.map((m, i) => {
          const hide = i >= 1 && i <= 3 ? squeeze : 0, hot = i >= 5 && i <= 8 && wave > 0.5, fev = i === 4 && first > 0.3;
          return (
            <div key={m} style={{ position: "absolute", left: mx(i) - 85, top: LINE_Y - 42, width: 170, height: 84, borderRadius: 42, background: fev || hot ? `linear-gradient(170deg, ${PINK_L}, ${PINK})` : GLASS, border: "1px solid rgba(255,255,255,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 38, color: fev || hot ? "#fff" : "#D1D1D6", opacity: 1 - hide, transform: `scale(${1 - hide * 0.6}) scale(${fev ? 1 + 0.08 * pulse(t, T.fev + 0.05, 0.1) : 1})` }}>{m}</div>
          );
        })}
        {/* tu es ici */}
        <div style={{ position: "absolute", left: MX(0) - 40 - 120, top: LINE_Y + 70, width: 420, display: "flex", alignItems: "center", gap: 10, fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: PINK_L, opacity: seg(t, PH[1][0] - 0.1, PH[1][0] + 0.2) }}>
          <MapPin size={44} color={PINK_L} /> Tu es ici
        </div>
        {/* premières offres */}
        {first > 0 && (
          <div style={{ position: "absolute", left: mx(4) - 160, top: LINE_Y - 250, width: 320, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, transform: `translateY(${(1 - first) * 40}px)`, opacity: first * (1 - seg(squeeze, 0, 0.3)) }}>
            <Flag size={70} color={PINK_L} strokeWidth={2} />
            <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#fff", textAlign: "center", lineHeight: 1.1 }}>1res offres</div>
          </div>
        )}
        {/* rentrée */}
        {rentree > 0 && <div style={{ position: "absolute", left: MX(11) - 160, top: LINE_Y + 70, width: 320, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 44, color: SOFT, opacity: rentree * (1 - squeeze) }}>Rentrée</div>}
        {/* « demain » sur février */}
        {squeeze > 0.5 && <div style={{ position: "absolute", left: mx(4) - 150, top: LINE_Y - 230, width: 300, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 64, color: PINK_L, transform: `rotate(-6deg) scale(${go(t, T.demain - 0.1, T.demain + 0.15, 1.8, 1)})`, opacity: seg(t, T.demain - 0.1, T.demain) }}>DEMAIN</div>}
      </div>
      {t < T.demain - 0.3 && <div style={{ position: "absolute", left: 60, right: 60, top: 1110, textAlign: "center", fontFamily: "Open Sans", fontSize: 24, color: "rgba(245,245,247,0.6)", opacity: inK }}>Source : Bloom Alternance, « Quand chercher une alternance », 21/01/2026 · schéma illustratif</div>}
      {t >= T.demain - 0.6 && <div style={{ position: "absolute", left: 40, right: 40, top: 420, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 86, letterSpacing: -2, color: "#fff", opacity: seg(t, T.demain - 0.6, T.demain - 0.3), transform: `translateY(${(1 - ease(t, T.demain - 0.6, T.demain - 0.2)) * 30}px)` }}>Février, c'est demain.</div>}
    </div>
  );
};
const Now: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, T.maintenant - 0.2, P2 + 0.25)) return null;
  const k = seg(t, T.maintenant - 0.2, T.maintenant), out = seg(t, P2 - 0.1, P2 + 0.25);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: `blur(${out * 14}px)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 640, display: "flex", justifyContent: "center", opacity: clamp(k * 2), transform: `scale(${go(t, T.maintenant - 0.2, T.maintenant + 0.2, 1.6, 1)})` }}><Extruded text="MAINTENANT" size={150} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 76, letterSpacing: -2, color: PINK_L, opacity: seg(t, T.choisis - 0.35, T.choisis - 0.1) }}>que tu choisis.</div>
    </div>
  );
};

// ─── PARTIE 2 · intro + étapes ───
const Part2Intro: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, P2, STEPS[0] + 0.2)) return null;
  const k = ease(t, P2, P2 + 0.4), out = seg(t, STEPS[0] - 0.15, STEPS[0] + 0.2);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out, filter: `blur(${out * 14}px)` }}>
      <div style={{ position: "absolute", left: 40, right: 40, top: 470, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, lineHeight: 1.05, letterSpacing: -3, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
        <div style={{ fontSize: 100, color: "#fff" }}>L'alternance</div>
        <div style={{ fontSize: 100, color: PINK_L }}>de tes rêves</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center", gap: 34 }}>
        {[1, 2, 3, 4].map((n, i) => { const at = T.etapes - 0.35 + i * 0.09; return (
          <div key={n} style={{ width: 150, height: 150, borderRadius: 75, background: `linear-gradient(160deg, ${PINK_L}, ${PINK} 60%, #B9606B)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 80, color: "#fff",
            boxShadow: "0 10px 0 #8E4450, 0 24px 60px rgba(217,130,139,0.4)", transform: `scale(${t < at ? 0 : go(t, at, at + 0.25, 0, 1)})` }}>{n}</div>
        ); })}
      </div>
    </div>
  );
};
const StepHead: React.FC<{ t: number; at: number; n: number; title: string }> = ({ t, at, n, title }) => {
  const k = ease(t, at, at + 0.35);
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 300, display: "flex", alignItems: "center", gap: 28, opacity: k, transform: `translateX(${(1 - k) * -60}px)` }}>
      <div style={{ flex: "0 0 auto", width: 130, height: 130, borderRadius: 65, background: `linear-gradient(160deg, ${PINK_L}, ${PINK} 60%, #B9606B)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 76, color: "#fff", boxShadow: "0 8px 0 #8E4450", transform: `scale(${go(t, at, at + 0.3, 0.3, 1)})` }}>{n}</div>
      <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 64, lineHeight: 1.05, letterSpacing: -2, color: "#fff" }}>{title}</div>
    </div>
  );
};
const stepIO = (t: number, a: number, b: number) => ({ opacity: 1 - seg(t, b - 0.2, b + 0.1), filter: `blur(${seg(t, b - 0.2, b + 0.1) * 14}px)` });
const Step1: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = [STEPS[0], STEPS[1]];
  if (!show(t, a, b + 0.1)) return null;
  const f = ease(t, T.formation - 0.25, T.formation + 0.1);
  return (
    <div style={{ position: "absolute", inset: 0, ...stepIO(t, a, b) }}>
      <StepHead t={t} at={a} n={1} title="Le métier d'abord" />
      <div style={{ position: "absolute", left: 540, top: 600, transform: `translate(-50%, 0) scale(${go(t, a + 0.3, a + 0.6, 0.3, 1)})` }}><Pill icon={Briefcase} label="Le métier que tu veux" pink /></div>
      <div style={{ position: "absolute", left: 540 - 40, top: 760, opacity: f, transform: `translateY(${(1 - f) * -30}px)` }}><ArrowDown size={80} color={PINK_L} strokeWidth={2.4} /></div>
      {t >= T.formation - 0.25 && <div style={{ position: "absolute", left: 540, top: 900, transform: `translate(-50%, 0) scale(${go(t, T.formation - 0.25, T.formation + 0.1, 0.3, 1)})` }}><Pill icon={GraduationCap} label="La formation qui y mène" /></div>}
    </div>
  );
};
const COMPANIES = ["Maison Lumen", "Atelier Nova", "Boréal Logistique"];
const Step2: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = [STEPS[1], STEPS[2]];
  if (!show(t, a, b + 0.1)) return null;
  const k = ease(t, a + 0.2, a + 0.6);
  return (
    <div style={{ position: "absolute", inset: 0, ...stepIO(t, a, b) }}>
      <StepHead t={t} at={a} n={2} title="Ta liste de rêve" />
      <div style={{ position: "absolute", left: 140, right: 140, top: 520, padding: "34px 40px", borderRadius: 40, background: GLASS, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", opacity: k, transform: `translateY(${(1 - k) * 60}px) scale(${lerp(0.9, 1, k)})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#fff", marginBottom: 24 }}><Heart size={40} color={PINK_L} fill={PINK} /> Mes entreprises de rêve</div>
        {COMPANIES.map((c, i) => { const at = a + 1.0 + i * 0.55, ck = ease(t, at, at + 0.25); return (
          <div key={c} style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 0", borderTop: "1px solid rgba(255,255,255,0.08)", opacity: lerp(0.35, 1, ck) }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: ck > 0.5 ? PINK : "rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${1 + 0.15 * pulse(t, at + 0.12, 0.08)})` }}>{ck > 0.5 && <Check size={34} color="#fff" strokeWidth={3} />}</div>
            <span style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 42, color: INK }}>{c}</span>
          </div>
        ); })}
        <div style={{ marginTop: 10, fontFamily: "Open Sans", fontSize: 22, color: SOFT }}>Exemples fictifs</div>
      </div>
    </div>
  );
};
const MiniLetter: React.FC<{ company: string; glow: number }> = ({ company, glow }) => (
  <div style={{ width: 300, height: 400, borderRadius: 20, background: "#FBFAF8", padding: 26, boxSizing: "border-box", boxShadow: `0 30px 70px rgba(0,0,0,0.55), 0 0 ${60 * glow}px rgba(217,130,139,${0.7 * glow})` }}>
    <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 24, color: PINK, marginBottom: 14 }}>{company}</div>
    {[230, 250, 180, 240, 210, 150].map((w, i) => <div key={i} style={{ width: w, height: 12, borderRadius: 6, background: i === 2 ? "rgba(217,130,139,0.55)" : "#E4E1DE", marginBottom: 14 }} />)}
  </div>
);
const GEN = ["044", "045", "046", "047", "048", "049", "050", "051", "052", "053"];
const Step3: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = [STEPS[2], STEPS[3]];
  if (!show(t, a, b + 0.1)) return null;
  const fan = ease(t, a + 0.3, a + 0.9), cross = seg(t, T.copier + 0.1, T.copier + 0.5), glow = ease(t, T.mission - 0.3, T.mission + 0.2);
  const phone = ease(t, PH[7][0] - 0.25, PH[7][0] + 0.3), lettersOut = seg(t, PH[7][0] - 0.3, PH[7][0]);
  const shot = t < T.cv - 0.15 ? "parcours/010-offre-lien.png" : t < T.s30 - 0.6 ? "parcours/008-cv-ajoute.png" : `shots/${GEN[Math.min(9, Math.floor(seg(t, T.s30 - 0.6, b) * 10))]}-generation.png`;
  const PW = 1080 * 0.33, PHh = 1920 * 0.33;
  return (
    <div style={{ position: "absolute", inset: 0, ...stepIO(t, a, b) }}>
      <StepHead t={t} at={a} n={3} title="Une lettre par entreprise" />
      {lettersOut < 1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - lettersOut }}>
          {COMPANIES.map((c, i) => (
            <div key={c} style={{ position: "absolute", left: 540 - 150, top: 560, transformOrigin: "50% 120%", transform: `rotate(${(i - 1) * 16 * fan}deg) translateX(${(i - 1) * 120 * fan}px) translateY(${Math.abs(i - 1) * 30 * fan}px)`, zIndex: i === 1 ? 2 : 1 }}><MiniLetter company={c} glow={glow} /></div>
          ))}
          {t >= T.copier - 0.25 && (
            <div style={{ position: "absolute", left: 540 - 210, top: 760, width: 420, padding: 26, boxSizing: "border-box", borderRadius: 18, background: "#C9C9CE", transform: `rotate(-5deg) translateX(${(1 - ease(t, T.copier - 0.25, T.copier + 0.05)) * 700}px) translateY(${seg(t, T.mission - 0.4, T.mission) * 900}px)`, fontFamily: "Open Sans", fontSize: 24, color: "#5A5A60", lineHeight: 1.45, zIndex: 3 }}>
              <div style={{ fontWeight: 600, color: "#3A3A40" }}>Copier-coller</div>
              Madame, Monsieur, je souhaite rejoindre [ENTREPRISE]…
              <svg width={420} height={200} viewBox="0 0 420 200" style={{ position: "absolute", left: 0, top: 0 }}>
                <line x1={30} y1={30} x2={30 + 360 * cross} y2={30 + 140 * cross} stroke="#E0464E" strokeWidth={14} strokeLinecap="round" />
                <line x1={390} y1={30} x2={390 - 360 * seg(cross, 0.3, 1)} y2={30 + 140 * seg(cross, 0.3, 1)} stroke="#E0464E" strokeWidth={14} strokeLinecap="round" />
              </svg>
            </div>
          )}
        </div>
      )}
      {phone > 0 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
          <div style={{ position: "absolute", left: 540 - PW / 2, top: 470, width: PW, height: PHh, transform: `rotateY(${lerp(28, -6, phone) + Math.sin(t * 1.2) * 3}deg) scale(${lerp(0.8, 1, phone)})`, opacity: phone }}>
            <div style={{ position: "absolute", inset: -12, borderRadius: 60, background: "linear-gradient(135deg, #3A3A3C, #0B0A0B)", boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 60px rgba(217,130,139,0.25), inset 0 0 0 2px #4A4A4E" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 50, overflow: "hidden" }}><Img src={staticFile(shot)} style={{ width: PW, height: PHh }} /></div>
          </div>
          {([[Link2, "Le lien de l'offre", T.lien, 30, 560, false], [FileUser, "Ton CV", T.cv, 650, 760, false], [Timer, "30 s*", T.s30, 60, 960, true]] as const).map(([I, label, at, x, y, pink], i) => t >= at - 0.2 && (
            <div key={i} style={{ position: "absolute", left: x, top: y, transformOrigin: x < 540 ? "0 50%" : "100% 50%", transform: `scale(${go(t, at - 0.2, at + 0.1, 0.3, 0.8)})` }}><Pill icon={I} label={label} pink={pink} /></div>
          ))}
          {t >= T.s30 - 0.2 && <div style={{ position: "absolute", left: 60, right: 60, top: 1140, textAlign: "center", fontFamily: "Open Sans", fontSize: 24, color: "rgba(245,245,247,0.65)" }}>* temps mesuré : 27 à 35 s par lettre</div>}
        </div>
      )}
    </div>
  );
};
const Step4: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = [STEPS[3], STEPS[4]];
  if (!show(t, a, b + 0.1)) return null;
  const waveK = ease(t, a + 0.3, a + 1.2), sp = ease(t, T.spontanee - 0.3, T.spontanee + 0.2), rel = ease(t, T.relance - 0.2, T.relance + 0.2), badge = seg(t, T.conseil - 0.15, T.conseil + 0.05);
  return (
    <div style={{ position: "absolute", inset: 0, ...stepIO(t, a, b) }}>
      <StepHead t={t} at={a} n={4} title="Postule avant la vague" />
      {/* la vague arrive par la droite */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs><linearGradient id="vague4" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={PINK} stopOpacity={0.05} /><stop offset="1" stopColor={PINK_L} stopOpacity={0.75} /></linearGradient></defs>
        <path d={`M${lerp(1180, 640, waveK)} 1060 C${lerp(1200, 700, waveK)} 760 ${lerp(1260, 820, waveK)} 620 1080 600 L1080 1060 Z`} fill="url(#vague4)" />
      </svg>
      <div style={{ position: "absolute", left: lerp(1100, 760, waveK), top: 640, fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#fff", opacity: waveK }}>FÉV<br /><span style={{ fontSize: 28, color: PINK_L }}>la vague</span></div>
      {/* toi, avant la vague */}
      {sp > 0 && <div style={{ position: "absolute", left: 60, top: 600, transform: `scale(${lerp(0.3, 0.85, sp)})`, transformOrigin: "0 50%", opacity: sp }}><Pill icon={Send} label="Spontanée en janvier" pink /></div>}
      {rel > 0 && <div style={{ position: "absolute", left: 60, top: 800, transform: `scale(${lerp(0.3, 0.85, rel)})`, transformOrigin: "0 50%", opacity: rel }}><Pill icon={RotateCcw} label="Relance à J+7" /></div>}
      {badge > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1010, display: "flex", justifyContent: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 30px", border: `5px solid ${PINK_L}`, borderRadius: 18, color: PINK_L, fontFamily: "Poppins", fontWeight: 700, fontSize: 38, letterSpacing: 1, background: "rgba(11,10,11,0.75)",
            transform: `rotate(-6deg) scale(${lerp(2.2, 1, easeOutBack(badge))})`, opacity: clamp(badge * 3) }}><Award size={44} color={PINK_L} /> CONSEIL D'ANCIEN RECRUTEUR</div>
        </div>
      )}
    </div>
  );
};
const Leni: React.FC<{ t: number }> = ({ t }) => {
  const [a, b] = [STEPS[4], PH[10][0] - 0.1];
  if (!show(t, a, b + 0.1)) return null;
  const k = ease(t, a, a + 0.4), c1 = Math.round(11 * ease(t, T.onze - 0.5, T.onze + 0.05)), c2 = Math.round(7 * ease(t, T.sept - 0.4, T.sept + 0.05));
  return (
    <div style={{ position: "absolute", inset: 0, ...stepIO(t, a, b) }}>
      <div style={{ position: "absolute", left: 120, right: 120, top: 380, padding: "40px 44px", borderRadius: 44, background: GLASS, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 60px rgba(217,130,139,0.18)", opacity: k, transform: `translateY(${(1 - k) * 60}px) scale(${lerp(0.9, 1, k)})` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 90, height: 90, borderRadius: 45, background: `linear-gradient(160deg, ${PINK_L}, ${PINK})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff" }}>L</div>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 48, color: "#fff" }}>Léni S.</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 36 }}>
          {[[c1, "candidatures"], [c2, "entretiens"]].map(([n, l], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 150, lineHeight: 1, letterSpacing: -4, color: i ? PINK_L : "#fff", transform: `scale(${1 + 0.1 * pulse(t, (i ? T.sept : T.onze) + 0.05, 0.08)})` }}>{n}</div>
              <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 36, color: SOFT }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 30, textAlign: "center", fontFamily: "Open Sans", fontSize: 24, color: "rgba(245,245,247,0.7)" }}>Témoignage réel · résultats individuels non garantis</div>
      </div>
    </div>
  );
};
const Finale: React.FC<{ t: number }> = ({ t }) => {
  if (t < PH[10][0] - 0.15) return null;
  const end = seg(t, T.end + 0.55, T.end + 1.0);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", left: 540 - 110, top: 320, transform: `scale(${go(t, PH[10][0] - 0.15, PH[10][0] + 0.25, 0, 1)})` }}><AppIcon size={220} /></div>
      {t >= T.offerte - 0.3 && <div style={{ position: "absolute", left: 540, top: 600, transform: `translate(-50%, 0) scale(${go(t, T.offerte - 0.3, T.offerte + 0.05, 0.3, 1)})` }}><Pill icon={Gift} label="Ta 1re lettre est offerte" pink /></div>}
      {t >= T.bio - 0.2 && <div style={{ position: "absolute", left: 540 - 260, top: 770, transform: `scale(${go(t, T.bio - 0.2, T.bio + 0.1, 0, 1)})` }}><GlossPill w={520} h={110}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff" }}>Lien en bio <span style={{ color: PINK_L }}>↑</span></span></GlossPill></div>}
      {t >= T.go - 0.25 && <div style={{ position: "absolute", left: 0, right: 0, top: 960, display: "flex", justifyContent: "center", opacity: seg(t, T.go - 0.25, T.go - 0.1), transform: `scale(${go(t, T.go - 0.25, T.go + 0.15, 1.6, 1)})` }}><Extruded text="MAINTENANT." size={130} /></div>}
      {end > 0 && (
        <div style={{ position: "absolute", inset: 0, zIndex: 30, background: `rgba(11,10,11,${end})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26 }}>
          <Img src={staticFile("logo-mymotiv.png")} style={{ width: 520, opacity: end, filter: `drop-shadow(0 0 20px ${PINK})` }} />
          <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 36, color: INK, opacity: end }}>Avec MyMotiv, postulez. Et faites-vous recruter.</div>
        </div>
      )}
    </div>
  );
};

// ─── sous-titres mot par mot (à côté de Yann) ───
const CAPS = new Set([0, 1, 4, 5, 6, 7, 8, 9]);
const KEY = /alternance|février|pic|mars|juin|métier|formation|rêves|lettre|mission|myMotiv|janvier|relance|recruteur|onze|sept/i;
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = PH.findIndex(([a], k) => t >= a - 0.06 && (k + 1 >= PH.length || t < PH[k + 1][0] - 0.06));
  if (i < 0 || !CAPS.has(i) || t > PH[i][1] + 0.45) return null;
  const ph = voix.phrases[i], mots = voix.mots.filter((m) => m.phrase === i), words = ph.text.split(" "), total = ph.text.length;
  let pos = 0;
  const times = words.map((w) => { const c = pos / Math.max(1, total); pos += w.length + 1; const k = c * (mots.length - 1), j = Math.floor(k);
    return mots.length ? lerp(mots[j].t0, mots[Math.min(mots.length - 1, j + 1)].t0, k - j) : ph.t0; });
  const out = seg(t, PH[i][1] + 0.2, PH[i][1] + 0.45);
  return (
    <div style={{ position: "absolute", left: 360, right: 50, top: 1250, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 50, lineHeight: 1.2, letterSpacing: -1, opacity: 1 - out, zIndex: 15 }}>
      {words.map((w, k) => {
        const t0 = times[k] - 0.03, kk = seg(t, t0, t0 + 0.12);
        return <React.Fragment key={k}><span style={{ display: "inline-block", opacity: t >= t0 ? 1 : 0, transform: `translateY(${(1 - kk) * 14}px) scale(${lerp(0.7, 1, kk)})`, color: KEY.test(w) ? PINK_L : INK, textShadow: "0 4px 20px rgba(0,0,0,0.85)" }}>{w}</span>{" "}</React.Fragment>;
      })}
    </div>
  );
};

// ─── Yann présente (en bas à gauche, expression par phrase, bouge au rythme de la voix) ───
const YANN = ["surprise", "reflexion", "choc", "rire", "sourire", "reflexion", "colere", "surprise", "sourire", "rire", "sourire"];
const envAt = (t: number) => { const i = Math.floor(t * 60); return i >= 0 && i < voixEnv.length ? voixEnv[i] : 0; };
const Yann: React.FC<{ t: number }> = ({ t }) => {
  const enter = go(t, 0.3, 0.75, 0, 1), leave = seg(t, T.end + 0.45, T.end + 0.85);
  if (enter <= 0 || leave >= 1) return null;
  const pi = PH.reduce((a, [p0], i) => (t >= p0 - 0.08 ? i : a), 0);
  const talk = (envAt(t) + envAt(t - 0.03)) / 2, w = 350, h = w * 1.49;
  return (
    <div style={{ position: "absolute", left: 10, top: 1920 - h + 40 + (1 - enter) * 600 + leave * 700 - talk * 14, width: w, zIndex: 20, transformOrigin: "50% 100%",
      transform: `rotate(${Math.sin(t * 1.7) * 1.5 + talk * 1.8 * Math.sin(t * 13)}deg) scale(${1 + 0.07 * pulse(t, PH[pi][0] + 0.02, 0.08)})` }}>
      <div style={{ position: "absolute", left: -90, top: -60, width: w + 180, height: h, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,130,139,0.32), rgba(217,130,139,0) 65%)", opacity: 0.5 + talk * 0.5 }} />
      <Img src={staticFile(`mascotte/${YANN[pi]}.png`)} style={{ position: "relative", width: w, display: "block", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }} />
    </div>
  );
};

export const AlternanceMaintenant: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const r = rng(frame + 11);
  const hits = [0.02, T.fev, T.demain, T.maintenant, T.etapes, T.copier + 0.3, T.conseil, T.sept, T.go];
  const shake = hits.reduce((s, h) => s + pulse(t, h + 0.04, 0.06), 0) * 9;
  const flash = pulse(t, T.maintenant, 0.08) * 0.9 + pulse(t, P2, 0.07) * 0.5 + pulse(t, T.go, 0.07) * 0.7 + pulse(t, 0.0, 0.04) * 0.2;
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <Audio src={staticFile("audio/maintenant.wav")} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, rgba(217,130,139,0.14) 0%, rgba(11,10,11,0) 55%)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)` }}>
        <Hook t={t} />
        <Timeline t={t} />
        <Now t={t} />
        <Part2Intro t={t} />
        <Step1 t={t} />
        <Step2 t={t} />
        <Step3 t={t} />
        <Step4 t={t} />
        <Leni t={t} />
        <Finale t={t} />
        <Chapter t={t} />
        <Captions t={t} />
        <Yann t={t} />
      </div>
      <Flash k={flash} />
    </AbsoluteFill>
  );
};
