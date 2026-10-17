// « Donne-moi 30 secondes » (≈34,5 s, 60 i/s, 9:16) — pub orientée conversion, DA MyMotiv épurée.
// Idée : un VRAI compte à rebours de 30 s traverse la vidéo (il part juste après « Donne-moi trente secondes » et tombe
// à 0,0 pile sur « ta lettre est prête ») : le spectateur vit la promesse (* temps mesuré : 27 à 35 s par lettre).
// Voix : ElevenLabs v4 (voix Hugo) générée phrase par phrase (tools/voix-elevenlabs.py), assemblée par
// tools/assembler-lignes.py + voix-chrono.json. Preuve : témoignage réel de Léni S. (mention obligatoire).
// Sans risque : 1re lettre offerte, sans inscription, sans carte bancaire (vrai sur le site). Appel à l'action en
// micro-étapes. Yann Motiveur présente en bas à gauche. Icônes vectorielles (lucide-react).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CheckCircle2, CreditCard, Gift, Link2, Search, UserX } from "lucide-react";
import { go } from "./apple";
import { PINK, PINK_L, clamp, lerp, rng, seg } from "./common";
import { AppIcon, Flash, GlossPill, Shockwave, ease, pulse } from "./motion";
import { Extruded, Pill, Rings } from "./AlternancePartout";
import { CvDoc, LETTER_BOX, LetterDoc } from "./NotreHistoire";
import voix from "./data/chrono-voix.json";
import voixEnv from "./data/chrono-env.json";
import "./fonts";

export const CHRONO_DUR = voix.duration;
const BG = "#0B0A0B", INK = "#F5F5F7", SOFT = "#8E8E93", MONO = "DejaVu Sans Mono, monospace";
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const show = (t: number, a: number, b: number) => t >= a && t < b;
const END = Wt(93), T0 = END - 30;                    // 0,0 pile sur « prête »
const T = {
  trente: Wt(2), lettre1: Wt(16), bateau: Wt(22), cette: Wt(23), offre: Wt(27), logo: Wt(30), cv: Wt(36), toi: Wt(38), ecrit: Wt(45),
  madame: Wt(47), monsieur: Wt(48), leni: Wt(49), onze: Wt(52), resultat: Wt(57), sept: Wt(58), offerte: Wt(64), inscription: Wt(65),
  carte: Wt(67), ouvre: Wt(70), copie: Wt(76), bio: Wt(79), trois: Wt(82), deux: Wt(83), un: Wt(84), voila: Wt(87),
};
const remain = (t: number) => clamp(30 - (t - T0), 0, 30);
function io(t: number, a: number, b: number, inD = 0.25, outD = 0.25): React.CSSProperties {
  const i = ease(t, a, a + inD), o = seg(t, b - outD, b);
  return { opacity: clamp(i * 1.3) * (1 - o), filter: `blur(${(1 - i) * 12 + o * 14}px)`, transform: `scale(${lerp(0.9, 1, i) * lerp(1, 1.06, o)})` };
}
const Note: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) =>
  show(t, a, b) ? <div style={{ position: "absolute", left: 370, right: 50, top: 1480, textAlign: "center", fontFamily: "Open Sans", fontSize: 22, color: "rgba(245,245,247,0.62)", opacity: seg(t, a, a + 0.25) * (1 - seg(t, b - 0.2, b)) }}>{children}</div> : null;

// ─── le chrono : grand au début et à la fin, petit en haut pendant la vidéo ───
const Ring: React.FC<{ t: number; size: number; label: string; glow?: number }> = ({ t, size, label, glow = 1 }) => {
  const R = size * 0.42, C = 2 * Math.PI * R, k = remain(t) / 30;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ position: "absolute", inset: 0 }}>
        <circle cx={size / 2} cy={size / 2} r={R} fill="rgba(20,18,19,0.92)" stroke="rgba(255,255,255,0.08)" strokeWidth={size * 0.06} />
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke={PINK} strokeWidth={size * 0.06} strokeLinecap="round" strokeDasharray={`${C * k} ${C}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ filter: `drop-shadow(0 0 ${12 * glow}px ${PINK})` }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: size * 0.24, color: "#fff", letterSpacing: -1 }}>{label}</div>
    </div>
  );
};
const mmss = (s: number) => `0:${String(Math.floor(s)).padStart(2, "0")}`;
const Chrono: React.FC<{ t: number }> = ({ t }) => {
  const toTop = ease(t, T0 + 0.1, T0 + 0.7), big = ease(t, T.trois - 0.35, T.trois);   // retour au centre pour 3-2-1
  const done = t >= END;
  if (big > 0 || t < T0 + 0.7) {
    // grand chrono : hook (0:30) puis finale (3,2… 0,0)
    const final = big > 0;
    const sc = final ? lerp(0.4, 1, big) : lerp(1, 0.4, toTop);
    const y = final ? lerp(160, 600, big) : lerp(600, 160, toTop);
    const label = final ? (done ? "0.0" : remain(t).toFixed(1)) : mmss(Math.ceil(remain(t)));
    const k0 = go(t, -0.15, 0.3, 0.6, 1);
    const out = seg(t, END + 0.08, END + 0.4);
    return (
      <div style={{ position: "absolute", left: 540 - 300, top: y, width: 600, height: 600, transform: `scale(${sc * (final ? 1 : k0) * (1 + 0.06 * pulse(t, END, 0.08) + 0.5 * out)})`, transformOrigin: "50% 0%", opacity: 1 - out }}>
        <Ring t={t} size={600} label={label} glow={1 + pulse(t, END, 0.1) * 3} />
      </div>
    );
  }
  // petit chrono en haut, qui bat chaque seconde
  const s = remain(t), beat = pulse((s % 1) - 0.999, 0, 0.05) + pulse(s % 1, 0, 0.05);
  return (
    <div style={{ position: "absolute", left: 540 - 120, top: 160, transform: `scale(${1 + 0.05 * beat})` }}>
      <Ring t={t} size={240} label={mmss(Math.ceil(s))} />
    </div>
  );
};

// ─── sous-titres mot par mot (texte du script, calés sur la transcription de chaque phrase) ───
const NO_CAPS = new Set([7]);
const KEY = /trente|myMotiv|cette|logo|cv|madame|monsieur|onze|sept|entretiens|offerte|inscription|carte|bio|prête/i;
const Captions: React.FC<{ t: number }> = ({ t }) => {
  const i = PH.findIndex(([a], k) => t >= a - 0.06 && (k + 1 >= PH.length || t < PH[k + 1][0] - 0.06));
  if (i < 0 || NO_CAPS.has(i) || t > PH[i][1] + 0.5) return null;
  const ph = voix.phrases[i], mots = voix.mots.filter((m) => m.phrase === i);
  const words = ph.text.split(" "), total = ph.text.length;
  let pos = 0;
  const times = words.map((w) => { const c = pos / Math.max(1, total); pos += w.length + 1; const k = c * (mots.length - 1), j = Math.floor(k);
    return mots.length ? lerp(mots[j].t0, mots[Math.min(mots.length - 1, j + 1)].t0, k - j) : ph.t0; });
  const out = seg(t, PH[i][1] + 0.25, PH[i][1] + 0.5);
  return (
    <div style={{ position: "absolute", left: 360, right: 50, top: 1250, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 52, lineHeight: 1.2, letterSpacing: -1, opacity: 1 - out }}>
      {words.map((w, k) => {
        const t0 = times[k] - 0.03, kk = seg(t, t0, t0 + 0.12), on = t >= t0;
        return <React.Fragment key={k}><span style={{ display: "inline-block", opacity: on ? 1 : 0, transform: `translateY(${(1 - kk) * 14}px) scale(${lerp(0.7, 1, kk)})`, color: KEY.test(w) ? PINK_L : INK, textShadow: "0 4px 20px rgba(0,0,0,0.85)" }}>{w}</span>{" "}</React.Fragment>;
      })}
    </div>
  );
};

// ─── Yann Motiveur ───
const YANN: [number, string][] = [[0, "surprise"], [1, "sourire"], [2, "reflexion"], [3, "rire"], [4, "surprise"], [5, "sourire"], [6, "reflexion"], [7, "rire"]];
const envAt = (t: number) => { const i = Math.floor(t * 60); return i >= 0 && i < voixEnv.length ? voixEnv[i] : 0; };
const Yann: React.FC<{ t: number }> = ({ t }) => {
  const enter = go(t, 0.25, 0.7, 0, 1), leave = seg(t, END + 0.6, END + 1.0);
  if (enter <= 0 || leave >= 1) return null;
  const pi = PH.reduce((a, [p0], i) => (t >= p0 - 0.08 ? i : a), 0);
  const entry = YANN.reduce((a, e) => (e[0] <= pi ? e : a), YANN[0]);
  const talk = (envAt(t) + envAt(t - 0.03)) / 2, w = 350, h = w * 1.49;
  return (
    <div style={{ position: "absolute", left: 10, top: 1920 - h + 40 + (1 - enter) * 600 + leave * 700 - talk * 14, width: w, zIndex: 20, transformOrigin: "50% 100%",
      transform: `rotate(${Math.sin(t * 1.7) * 1.5 + talk * 1.8 * Math.sin(t * 13)}deg) scale(${1 + 0.07 * pulse(t, PH[entry[0]][0] + 0.02, 0.08)})` }}>
      <div style={{ position: "absolute", left: -90, top: -60, width: w + 180, height: h, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,130,139,0.32), rgba(217,130,139,0) 65%)", opacity: 0.5 + talk * 0.5 }} />
      <Img src={staticFile(`mascotte/${entry[1]}.png`)} style={{ position: "relative", width: w, display: "block", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.6))" }} />
    </div>
  );
};

// ─── scènes ───
const P = (n: string) => staticFile(`parcours/${n}.png`);
const GEN = ["036", "037", "038", "039", "040", "041", "042", "043", "044", "045", "046", "047"];
const Scenes: React.FC<{ t: number }> = ({ t }) => {
  const sc = 0.3, wL = LETTER_BOX[2] * sc;
  return (
    <>
      {/* 1. « le temps qu'il faut à MyMotiv » : le vrai site qui génère */}
      {show(t, PH[1][0] - 0.1, PH[2][0] + 0.2) && (() => {
        const PW = 1080 * 0.34, PHh = 1920 * 0.34;
        const i = Math.min(GEN.length - 1, Math.floor(seg(t, PH[1][0], PH[1][1]) * GEN.length));
        return (
          <div style={{ position: "absolute", inset: 0, ...io(t, PH[1][0] - 0.1, PH[2][0] + 0.2) }}>
            <div style={{ position: "absolute", left: 540 - PW / 2, top: 470, width: PW, height: PHh, borderRadius: 50, overflow: "hidden", border: "8px solid #2C2C2E", boxShadow: "0 0 0 2px #48484A, 0 40px 100px rgba(0,0,0,0.7), 0 0 60px rgba(217,130,139,0.3)", transform: `perspective(1400px) rotateY(${Math.sin(t * 1.1) * 6}deg)` }}>
              <Img src={P(`${GEN[i]}-generation`)} style={{ width: PW, height: PHh }} />
            </div>
          </div>
        );
      })()}
      {/* 2. pas une lettre bateau → CETTE offre, le logo, le CV */}
      {show(t, PH[2][0] - 0.1, PH[3][0] + 0.15) && (() => {
        const boat = ease(t, T.bateau - 0.25, T.bateau + 0.05), gone = ease(t, T.cette - 0.15, T.cette + 0.25);
        const kL = ease(t, T.cette - 0.1, T.cette + 0.35), kC = ease(t, T.cv - 0.2, T.cv + 0.2), lock = ease(t, T.logo - 0.4, T.logo);
        const xL = lerp(540 - wL / 2, 130, kC), yL = 480;
        return (
          <div style={{ position: "absolute", inset: 0, ...io(t, PH[2][0] - 0.1, PH[3][0] + 0.15, 0.15, 0.25) }}>
            {gone < 1 && (
              <div style={{ position: "absolute", left: 540 - 200, top: 520, width: 400, height: 540, borderRadius: 24, background: "#3A3A3C", transform: `scale(${boat}) rotate(${lerp(0, -25, gone)}deg) translateY(${gone * 900}px)`, opacity: 1 - gone }}>
                {[0, 1, 2, 3, 4, 5].map((j) => <div key={j} style={{ position: "absolute", left: 36, right: 36 + (j % 3) * 40, top: 70 + j * 62, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.18)" }} />)}
                <div style={{ position: "absolute", left: 30, right: 30, top: 230, textAlign: "center", padding: "10px 0", border: "6px solid #FF5C7A", borderRadius: 14, color: "#FF5C7A", fontFamily: "Poppins", fontWeight: 700, fontSize: 52, letterSpacing: 3, transform: `rotate(-10deg) scale(${lerp(2, 1, ease(t, T.bateau, T.bateau + 0.15))})`, opacity: seg(t, T.bateau, T.bateau + 0.05) }}>BATEAU</div>
              </div>
            )}
            {kL > 0 && (
              <div style={{ position: "absolute", left: xL, top: yL, transform: `scale(${lerp(0.5, 1, kL)}) rotate(${lerp(0, -4, kC)}deg)`, opacity: kL }}>
                <LetterDoc sc={sc} />
                {t >= T.logo - 0.4 && <div style={{ position: "absolute", left: (110 - 83) * sc - lerp(110, 6, lock), top: (186 - 158) * sc - lerp(110, 6, lock), width: 100 * sc + lerp(220, 12, lock), height: 100 * sc + lerp(220, 12, lock), border: `4px solid ${t >= T.logo ? PINK_L : "#fff"}`, borderRadius: 12, boxShadow: t >= T.logo ? `0 0 26px ${PINK}` : "none", opacity: 1 - seg(t, T.logo + 0.6, T.logo + 0.9) }} />}
              </div>
            )}
            {t >= T.offre - 0.2 && <div style={{ position: "absolute", left: 540, top: 400, transform: `translate(-50%, 0) scale(${go(t, T.offre - 0.2, T.offre + 0.1, 0.4, 1) * lerp(1, 0.85, kC)})`, zIndex: 3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 26px", borderRadius: 40, background: "rgba(28,26,27,0.95)", border: "1px solid rgba(255,255,255,0.12)", fontFamily: "Open Sans", fontWeight: 600, fontSize: 30, color: INK, whiteSpace: "nowrap" }}>
                <Img src={staticFile("company.png")} style={{ width: 40, height: 40, borderRadius: 10 }} /> Maison Lumen · Manager des ventes
              </div>
            </div>}
            {kC > 0 && <div style={{ position: "absolute", left: lerp(540 - 145, 640, kC), top: 500, transform: `scale(${lerp(0.5, 1, kC)}) rotate(${lerp(0, 4, kC)}deg)`, opacity: kC }}><CvDoc w={290} h={480} /></div>}
          </div>
        );
      })()}
      {/* 3. « Toi, t'aurais écrit… Madame, Monsieur » */}
      {show(t, PH[3][0] - 0.05, PH[4][0] + 0.15) && (() => {
        const typed = "Madame, Monsieur,".slice(0, Math.round(17 * seg(t, T.madame - 0.05, T.monsieur + 0.35)));
        return (
          <div style={{ position: "absolute", inset: 0, ...io(t, PH[3][0] - 0.05, PH[4][0] + 0.15) }}>
            <div style={{ position: "absolute", left: 140, right: 140, top: 470, height: 700, borderRadius: 26, background: "#F2F0EF", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", padding: "70px 60px", filter: `saturate(0.2)` }}>
              <div style={{ fontFamily: "Georgia, serif", fontSize: 50, color: "#2C2C2E" }}>{typed}<span style={{ color: PINK, opacity: Math.floor(t * 2.5) % 2 }}>|</span></div>
              <div style={{ position: "absolute", left: 60, bottom: 50, fontFamily: MONO, fontSize: 22, color: SOFT }}>lettre_motivation_v12.docx · 2 mots</div>
            </div>
          </div>
        );
      })()}
      {/* 4. Léni : 11 candidatures → 7 entretiens */}
      {show(t, PH[4][0] - 0.05, PH[5][0] + 0.15) && (() => {
        const n11 = Math.round(11 * ease(t, T.onze - 0.3, T.onze + 0.4)), n7 = Math.round(7 * ease(t, T.sept - 0.4, T.sept + 0.2));
        return (
          <div style={{ position: "absolute", inset: 0, ...io(t, PH[4][0] - 0.05, PH[5][0] + 0.15) }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, color: "#fff" }}>
              <div style={{ fontSize: 46, color: SOFT, opacity: seg(t, T.leni - 0.1, T.leni + 0.2) }}>Léni S.</div>
              <div style={{ fontSize: 170, lineHeight: 1, letterSpacing: -6, opacity: seg(t, T.onze - 0.3, T.onze) }}>{n11}</div>
              <div style={{ fontSize: 44, color: SOFT, opacity: seg(t, T.onze, T.onze + 0.3) }}>candidatures</div>
            </div>
            {t >= T.sept - 0.45 && <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center" }}>
              <div style={{ transform: `scale(${go(t, T.sept - 0.45, T.sept + 0.05, 0.4, 1)})` }}><Extruded text={`${n7} entretiens`} size={130} /></div>
            </div>}
            <div style={{ position: "absolute", left: 0, right: 0, top: 1000, display: "flex", justifyContent: "center", opacity: seg(t, T.sept, T.sept + 0.3) }}>
              <span style={{ fontFamily: "Open Sans", fontWeight: 600, fontSize: 26, color: INK, padding: "8px 22px", borderRadius: 30, border: "1px solid rgba(255,255,255,0.18)", background: "rgba(28,26,27,0.9)" }}>Témoignage réel · résultats individuels non garantis</span>
            </div>
          </div>
        );
      })()}
      {/* 5. sans risque */}
      {show(t, PH[5][0] - 0.05, PH[6][0] + 0.15) && (
        <div style={{ position: "absolute", inset: 0, ...io(t, PH[5][0] - 0.05, PH[6][0] + 0.15) }}>
          {([[Gift, "1re lettre offerte", Wt(61) - 0.2, true], [UserX, "Sans inscription", T.inscription - 0.15, false], [CreditCard, "Sans carte bancaire", T.carte - 0.15, false]] as const).map(([I, label, at, pink], i) =>
            t >= at ? <div key={i} style={{ position: "absolute", left: 540, top: 460 + i * 190, transform: `translate(-50%, 0) scale(${go(t, at, at + 0.3, 0.3, 1)})` }}><Pill icon={I} label={label} pink={pink} size={1.1} /></div> : null)}
        </div>
      )}
      {/* 6. micro-étapes */}
      {show(t, PH[6][0] - 0.05, T.trois - 0.25) && (
        <div style={{ position: "absolute", inset: 0, ...io(t, PH[6][0] - 0.05, T.trois - 0.25, 0.2, 0.2) }}>
          {([[Search, "1. Ouvre une offre", T.ouvre - 0.15], [Link2, "2. Copie le lien", T.copie - 0.15]] as const).map(([I, label, at], i) =>
            t >= at ? <div key={i} style={{ position: "absolute", left: 540, top: 470 + i * 190, transform: `translate(-50%, 0) scale(${go(t, at, at + 0.3, 0.3, 1)})` }}><Pill icon={I} label={label} pink={i === 1} size={1.05} /></div> : null)}
          {t >= T.bio - 0.15 && <div style={{ position: "absolute", left: 540 - 300, top: 850, transform: `scale(${go(t, T.bio - 0.15, T.bio + 0.15, 0, 1)})` }}><GlossPill w={600} h={130}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 50, color: "#fff" }}>3. Lien en bio <span style={{ color: PINK_L, display: "inline-block", transform: `translateY(${Math.sin(t * 8) * 6}px)` }}>↑</span></span></GlossPill></div>}
        </div>
      )}
      {/* 7. 3, 2, 1… la lettre est prête */}
      {t >= T.trois - 0.1 && (() => {
        const land = ease(t, END - 0.05, END + 0.35), endK = ease(t, END + 1.0, END + 1.5);
        return (
          <div style={{ position: "absolute", inset: 0 }}>
            {t < END && [[T.trois, "3"], [T.deux, "2"], [T.un, "1"]].map(([at, n]) => show(t, (at as number) - 0.05, (at as number) + 0.6) && (
              <div key={n as string} style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 150, color: PINK_L, opacity: 1 - seg(t, (at as number) + 0.35, (at as number) + 0.6), transform: `scale(${lerp(1.6, 1, ease(t, (at as number) - 0.05, (at as number) + 0.15))})` }}>{n}</div>
            ))}
            {t >= END - 0.05 && (
              <>
                <Shockwave t={t} t0={END} x={540} y={900} r={700} />
                <div style={{ position: "absolute", left: 540 - wL / 2, top: lerp(1900, 640, land), transform: `rotate(${lerp(12, -3, land)}deg)`, opacity: 1 - endK }}>
                  <LetterDoc sc={sc} />
                  <div style={{ position: "absolute", right: -30, top: -30, width: 90, height: 90, borderRadius: 45, background: "#3FD4A0", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 30px rgba(63,212,160,0.6)", transform: `scale(${go(t, END + 0.25, END + 0.5, 0, 1)})` }}><CheckCircle2 size={60} color="#fff" /></div>
                </div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 78, color: "#fff", letterSpacing: -2, opacity: seg(t, END, END + 0.2) * (1 - endK) }}>Ta lettre est <span style={{ color: PINK_L }}>prête.</span></div>
              </>
            )}
            {endK > 0 && (
              <div style={{ position: "absolute", inset: 0, opacity: endK }}>
                <div style={{ position: "absolute", left: 540 - 110, top: 640, transform: `scale(${go(t, END + 1.0, END + 1.4, 0, 1)})` }}><AppIcon size={220} /></div>
                <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: 290, top: 900, width: 500, filter: `drop-shadow(0 0 18px ${PINK})` }} />
                <div style={{ position: "absolute", left: 0, right: 0, top: 1040, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 42, color: "#fff" }}>Postulez. <span style={{ color: PINK_L }}>Et faites-vous recruter.</span></div>
                <div style={{ position: "absolute", left: 540 - 270, top: 1140 }}><GlossPill w={540} h={120}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff" }}>Lien en bio <span style={{ color: PINK_L }}>↑</span></span></GlossPill></div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 1290, textAlign: "center", fontFamily: "Open Sans", fontWeight: 600, fontSize: 30, color: PINK_L }}>Ta 1re lettre est offerte</div>
              </div>
            )}
          </div>
        );
      })()}
    </>
  );
};

export const Chrono30: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const r = rng(frame + 9);
  const shake = (pulse(t, 0.02, 0.05) + pulse(t, T.bateau, 0.05) + pulse(t, T.sept, 0.06) + pulse(t, END, 0.07) * 1.5) * 10;
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <Audio src={staticFile("audio/chrono.wav")} />
      <Rings t={t} o={0.55} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 42%, rgba(217,130,139,0.12) 0%, rgba(11,10,11,0.6) 55%, rgba(11,10,11,0.9) 100%)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)` }}>
        <Scenes t={t} />
        <Chrono t={t} />
        <Captions t={t} />
        <Yann t={t} />
        <Note t={t} a={PH[1][0] + 0.3} b={PH[3][0]}>* temps mesuré : 27 à 35 s par lettre</Note>
      </div>
      <Flash k={pulse(t, END, 0.08) * 1.1} />
    </AbsoluteFill>
  );
};
