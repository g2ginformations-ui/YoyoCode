// « 0 vue » (≈ 36 s, 60 i/s, 9:16) — voix NATURELLE de l'utilisateur (tools/voix-narrateur.py + voix-vue.json :
// effet téléphone sur le message « Vu », écho fantôme sur « Dernier choisi », écho final) + voix moqueuses de fond
// (tools/voix-moqueries.py + src/data/moqueries-vue.json, affichées en bulles de commentaires).
// Style Apple épuré (skill apple-motion) : le logo MyMotiv reste IMMOBILE au centre toute la vidéo.
// Partie « problème » sur fond sombre, puis la lumière s'ouvre depuis le logo sur « Sauf avec MyMotiv » (fond clair).
// Hook visuel éprouvé : arrêt sur image + retour arrière (la candidature part à la poubelle → STOP → rembobinage).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { APPLE, TextDrop, curve, go } from "./apple";
import { PINK, PINK_L, lerp, seg } from "./common";
import { Confetti } from "./Lien";
import { Bubbles, DARK, Flash, Horizon, Shockwave, ease, pulse } from "./motion";
import { Letter, Pill, inOut, show } from "./AvantAujourdhui";
import voix from "./data/vue-voix.json";
import moq from "./data/moqueries-vue.json";
import "./fonts";

export const ZERO_VUE_DUR = voix.duration;
const P = voix.phrases;
const mot = (w: string, ph: number) => voix.mots.find((m) => m.phrase === ph && m.w.toLowerCase().startsWith(w))?.t0 ?? P[ph].t0;
const CX = 540, LY = 960, LW = 440;

// Temps clés (s)
export const Z = {
  freeze: 0.85, rewind: 1.25, rewEnd: 1.8, hook: P[0].t0,
  post: P[1].t0, zero: mot("zéro", 1), vu: P[2].t0, sans: P[3].t0, foot: P[4].t0, toi: mot("toi", 4),
  cand: P[5].t0, s0: P[6].t0, s1: P[7].t0, s2: P[8].t0, sauf: P[9].t0, drop: mot("émotive", 9),
  simple: P[10].t0, tout: mot("tout", 11), rapide: P[12].t0, s30: mot("30", 13), efficace: P[14].t0, cette: mot("cette", 15),
  ref: P[16].t0, refMot: mot("référence", 16), offerte: P[17].t0, offerteMot: mot("offerte", 17), bio: P[18].t0,
};
// voix moqueuses : [id, temps, x, y] (temps partagés avec synth_vue.py)
export const MOQ: [string, number, number, number][] = [
  ["zero1", P[1].t1 + 0.05, 260, 800], ["zero2", P[1].t1 + 0.4, 820, 800], ["zero3", P[1].t0 + 1.1, 820, 220],
  ["vu2", P[3].t1 + 0.05, 330, 800], ["foot1", P[4].t0 + 0.55, 250, 740], ["foot2", P[4].t0 + 1.05, 830, 740],
  ["foot4", P[4].t0 + 1.6, 250, 830], ["foot3", P[4].t1 + 0.05, 790, 830],
];
const TXT: Record<string, string> = Object.fromEntries(moq.map((e) => [e.id, e.texte]));
const LIGHT = Z.drop - 0.12;                 // la lumière s'ouvre depuis le logo
const WHITE = DARK.ink;

const Line: React.FC<{ t: number; a: number; b: number; y: number; children: React.ReactNode }> = ({ t, a, b, y, children }) =>
  !show(t, a, b) ? null : <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.08, zIndex: 30, ...inOut(t, a, b) }}>{children}</div>;

// silhouette (avatar)
const Avatar: React.FC<{ s?: number; c?: string }> = ({ s = 110, c = "#5A5A5F" }) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#2C2C2E" /><circle cx="50" cy="40" r="17" fill={c} /><path d="M18 88 Q50 52 82 88 Z" fill={c} /></svg>
);
// carte « Ta candidature »
const Cand: React.FC<{ grey?: number; glow?: number }> = ({ grey = 0, glow = 0 }) => (
  <div style={{ width: 420, borderRadius: 34, background: "#fff", padding: 30, boxShadow: `0 30px 70px rgba(0,0,0,0.45), 0 0 ${90 * glow}px rgba(217,130,139,${0.8 * glow})`, filter: grey ? `grayscale(${grey}) brightness(${1 - 0.35 * grey})` : undefined, boxSizing: "border-box" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ width: 70, height: 70, borderRadius: 20, background: "#FBE9EC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>✉️</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: APPLE.ink, whiteSpace: "nowrap" }}>Ta candidature</div>
    </div>
    {[92, 78, 60].map((w, i) => <div key={i} style={{ marginTop: i ? 14 : 26, height: 14, borderRadius: 7, width: `${w}%`, background: "#E3E3E8" }} />)}
  </div>
);
const Stamp: React.FC<{ t: number; t0: number; text: string; rot: number; y: number }> = ({ t, t0, text, rot, y }) =>
  t < t0 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top: y, display: "flex", justifyContent: "center", zIndex: 12 }}>
      <div style={{ padding: "10px 30px", border: "8px solid #E5484D", borderRadius: 18, color: "#E5484D", fontSize: 60, fontWeight: 800, letterSpacing: 2, background: "rgba(255,255,255,0.85)", transform: `rotate(${rot}deg) scale(${go(t, t0, t0 + 0.18, 2.4, 1)})`, opacity: seg(t, t0, t0 + 0.06), whiteSpace: "nowrap" }}>{text}</div>
    </div>
  );

export const ZeroVue: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const light = ease(t, LIGHT, LIGHT + 0.55);              // ouverture de la lumière
  const ink = t < LIGHT + 0.2 ? WHITE : APPLE.ink;

  // ─── hook : la candidature vole vers la poubelle → arrêt sur image → rembobinage ───
  const fly = t < Z.freeze ? ease(t, 0.35, Z.freeze + 0.12) : t < Z.rewind ? ease(Z.freeze, 0.35, Z.freeze + 0.12) : (1 - ease(t, Z.rewind, Z.rewEnd)) * ease(Z.freeze, 0.35, Z.freeze + 0.12);
  const [hx, hy] = curve(fly, [CX, 470], [840, 1520], [980, 600]);
  const frozen = t >= Z.freeze && t < Z.rewind, rewinding = t >= Z.rewind && t < Z.rewEnd;
  const saved = ease(t, Z.rewEnd - 0.05, Z.rewEnd + 0.3);
  const candOut = ease(t, Z.post - 0.3, Z.post);

  // ─── « Tes candidatures » : enveloppe tamponnée ───
  const env = go(t, Z.cand + 0.1, Z.cand + 0.55, 0, 1);
  const envOut = ease(t, Z.sauf + 0.05, Z.sauf + 0.45);

  // ─── valeurs ───
  const VALS: [string, number][] = [["Simple", Z.simple], ["Rapide", Z.rapide], ["Efficace", Z.efficace]];
  const absorb = ease(t, Z.tout - 0.35, Z.tout + 0.05);
  const ring = ease(t, Z.s30 - 0.9, Z.s30 + 0.6);

  // vibration de l'écran sur les tampons et l'impact
  const shake = [Z.s0, Z.s1, Z.s2, Z.drop].reduce((a, s) => a + pulse(t, s + 0.12, 0.08), 0) * Math.sin(t * 90) * 10;

  return (
    <AbsoluteFill style={{ background: "#0E0D10", fontFamily: "Poppins", color: ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #26252B 0%, #121115 55%, #09080A 100%)" }} />
      {/* lumière qui s'ouvre depuis le logo */}
      {light > 0 && <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, #FFFFFF 0%, #F2F2F4 60%, #E8E8ED 100%)", clipPath: `circle(${light * 1250}px at ${CX}px ${LY}px)` }} />}

      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.4}px)${frozen ? " scale(1.04)" : ""}`, filter: frozen ? "grayscale(0.85) contrast(1.15)" : undefined }}>
        {/* ═════ HOOK ═════ */}
        {t < Z.post && (
          <>
            <div style={{ position: "absolute", left: 800, top: 1440, fontSize: 150, opacity: seg(t, 0.15, 0.3) * (1 - seg(t, Z.rewEnd, Z.rewEnd + 0.3)), transform: `scale(${go(t, 0.15, 0.45, 0.4, 1)}) rotate(${pulse(t, Z.freeze - 0.05, 0.06) * 12}deg)` }}>🗑️</div>
            <div style={{ position: "absolute", left: hx - 210, top: hy - 90, zIndex: 8, opacity: 1 - candOut, transform: `translateY(${go(t, 0, 0.3, -900, 0) - candOut * 120}px) rotate(${fly * -160}deg) scale(${lerp(1, 0.4, fly) * (1 + 0.06 * saved)})`, filter: rewinding ? "blur(2px)" : undefined }}>
              <Cand glow={saved} />
              {rewinding && [-14, 14].map((dx, i) => <div key={i} style={{ position: "absolute", inset: 0, transform: `translateX(${dx}px)`, opacity: 0.45, mixBlendMode: "screen", filter: `drop-shadow(0 0 0 ${i ? "#00E5FF" : "#FF3B6B"})` }}><Cand /></div>)}
              {saved > 0.01 && <div style={{ position: "absolute", right: -28, top: -28, width: 90, height: 90, borderRadius: 45, background: PINK, color: "#fff", fontSize: 50, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${go(t, Z.rewEnd, Z.rewEnd + 0.3, 0, 1)})`, boxShadow: `0 0 40px ${PINK}` }}>✓</div>}
            </div>
            {/* arrêt sur image : cadre, « STOP », trait de feutre */}
            {frozen && (
              <>
                <div style={{ position: "absolute", inset: 30, border: "6px solid rgba(255,255,255,0.9)", borderRadius: 30 }} />
                <div style={{ position: "absolute", left: 70, top: 170, fontSize: 64, fontWeight: 800, color: "#fff", letterSpacing: 4, transform: `scale(${go(t, Z.freeze, Z.freeze + 0.15, 1.6, 1)})` }}>❚❚ STOP</div>
              </>
            )}
            {rewinding && (
              <>
                <div style={{ position: "absolute", left: 70, top: 170, fontSize: 64, fontWeight: 800, color: "#fff", letterSpacing: 4, opacity: Math.floor(t * 8) % 2 ? 1 : 0.4 }}>◀◀</div>
                {Array.from({ length: 6 }, (_, i) => { const y = ((t * 2400 + i * 330) % 1920); return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: y, height: 6 + (i % 3) * 4, background: "rgba(255,255,255,0.18)" }} />; })}
              </>
            )}
          </>
        )}
        <Flash k={pulse(t, Z.freeze, 0.05) * 0.8 + pulse(t, Z.rewEnd, 0.06) * 0.5} />

        {/* ═════ 1. TikTok à 0 vue ═════ */}
        {show(t, Z.post, Z.vu) && (
          <div style={{ position: "absolute", left: CX - 160, top: 230, zIndex: 8, ...inOut(t, Z.post, Z.vu) }}>
            <div style={{ width: 320, height: 520, borderRadius: 44, background: "linear-gradient(160deg, #3A3A3F, #1C1C1E)", boxShadow: "0 30px 80px rgba(0,0,0,0.6), 0 0 0 2px #3A3A3C", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 120, height: 120, borderRadius: 60, background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56, color: "#fff", paddingLeft: 10 }}>▶</div>
              <div style={{ marginTop: 70, display: "flex", alignItems: "center", gap: 14, fontSize: 64, fontWeight: 800, color: t > Z.zero - 0.1 ? PINK : "#fff", transform: `scale(${1 + 0.5 * pulse(t, Z.zero + 0.05, 0.18)}) translateX(${Math.sin(t * 60) * 6 * pulse(t, Z.zero + 0.1, 0.2)}px)` }}>👁 0</div>
              <div style={{ marginTop: 6, fontSize: 26, color: DARK.soft }}>vue</div>
            </div>
          </div>
        )}

        {/* ═════ 2. message laissé en « Vu » ═════ */}
        {show(t, Z.vu, Z.foot) && (
          <div style={{ position: "absolute", left: 90, right: 90, top: 300, zIndex: 8, ...inOut(t, Z.vu, Z.foot) }}>
            <div style={{ marginLeft: "auto", width: 640, padding: "28px 34px", borderRadius: "40px 40px 10px 40px", background: PINK, color: "#fff", fontSize: 38, fontWeight: 600, lineHeight: 1.3, transform: `scale(${go(t, Z.vu, Z.vu + 0.3, 0.6, 1)})`, transformOrigin: "100% 100%" }}>Bonjour, je me permets de relancer ma candidature 🙏</div>
            <div style={{ textAlign: "right", marginTop: 12, fontSize: 30, fontWeight: 700, color: DARK.soft, opacity: seg(t, Z.vu + 0.6, Z.vu + 0.8) }}>Vu ✓✓</div>
            {t > Z.vu + 1.0 && t < Z.sans + 0.25 && (
              <div style={{ marginTop: 26, width: 150, padding: "26px 0", borderRadius: "40px 40px 40px 10px", background: "#2C2C2E", display: "flex", justifyContent: "center", gap: 14, transform: `scale(${go(t, Z.vu + 1.0, Z.vu + 1.25, 0.5, 1) * (1 - ease(t, Z.sans, Z.sans + 0.25))})`, transformOrigin: "0 100%" }}>
                {[0, 1, 2].map((i) => <div key={i} style={{ width: 20, height: 20, borderRadius: 10, background: "#8E8E93", opacity: 0.4 + 0.6 * Math.max(0, Math.sin(t * 9 - i * 0.9)) }} />)}
              </div>
            )}
          </div>
        )}

        {/* ═════ 3. le dernier choisi au foot ═════ */}
        {show(t, Z.foot, Z.cand + 0.3) && Array.from({ length: 7 }, (_, i) => {
          const order = [0, 6, 1, 5, 2, 4], k = order.indexOf(i);
          const pickT = Z.foot + 0.5 + k * 0.28;
          const p = k < 0 ? 0 : ease(t, pickT, pickT + 0.3);
          const side = k % 2 ? 1 : -1;
          const x0 = CX + (i - 3) * 135, x1 = CX + side * (330 + (Math.floor(k / 2)) * 60);
          const [x, y] = curve(p, [x0, 560], [x1, 300 + Math.floor(k / 2) * 40], [(x0 + x1) / 2, 380]);
          const out = ease(t, Z.cand, Z.cand + 0.3);
          const alone = i === 3;
          return (
            <div key={i} style={{ position: "absolute", left: x - 60, top: y - 60, zIndex: 8, opacity: (k < 0 ? 1 : 1 - 0.55 * p) * seg(t, Z.foot + i * 0.04, Z.foot + 0.2 + i * 0.04) * (1 - out), transform: `scale(${(k < 0 ? 1 + 0.25 * ease(t, Z.toi - 0.4, Z.toi) : 1 - 0.3 * p) * go(t, Z.foot + i * 0.04, Z.foot + 0.35 + i * 0.04, 0.3, 1)}) rotate(${alone ? Math.sin(t * 6) * 4 * ease(t, Z.toi - 1, Z.toi) : 0}deg)` }}>
              <Avatar s={120} c={alone && t > Z.toi - 0.4 ? PINK_L : "#5A5A5F"} />
            </div>
          );
        })}
        {show(t, Z.toi - 0.5, Z.cand) && (
          <>
            <div style={{ position: "absolute", left: CX - 160, top: 0, width: 320, height: 640, zIndex: 6, background: "linear-gradient(180deg, rgba(255,255,255,0.0), rgba(255,255,255,0.16))", clipPath: "polygon(40% 0, 60% 0, 100% 100%, 0 100%)", opacity: ease(t, Z.toi - 0.5, Z.toi) * (1 - ease(t, Z.cand - 0.2, Z.cand)) }} />
            <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", zIndex: 9, ...inOut(t, Z.toi - 0.1, Z.cand) }}><Pill bg={PINK} size={34}>Toi</Pill></div>
          </>
        )}

        {/* ═════ 4. tes candidatures : tampons ═════ */}
        {show(t, Z.cand + 0.05, Z.sauf + 0.5) && (
          <div style={{ position: "absolute", left: CX - 210, top: 360, zIndex: 8, opacity: env * (1 - envOut), transform: `scale(${lerp(0.6, 1, env) * (1 - 0.4 * envOut)}) translateY(${envOut * -500}px) rotate(${envOut * -25}deg)`, filter: `blur(${envOut * 8}px)` }}>
            <Cand grey={ease(t, Z.s0, Z.s2 + 0.8) * 0.9} />
          </div>
        )}
        {t < Z.sauf + 0.4 && (
          <div style={{ opacity: 1 - envOut }}>
            <Stamp t={t} t0={Z.s0} text="0 VUE" rot={-12} y={340} />
            <Stamp t={t} t0={Z.s1} text="VU" rot={9} y={470} />
            <Stamp t={t} t0={Z.s2} text="DERNIER CHOISI" rot={-4} y={600} />
          </div>
        )}

        {/* ═════ 5. valeurs : Simple / Rapide / Efficace ═════ */}
        {show(t, Z.simple - 0.1, Z.ref + 0.3) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 190, display: "flex", justifyContent: "center", gap: 18, zIndex: 20, opacity: 1 - ease(t, Z.ref, Z.ref + 0.3) }}>
            {VALS.map(([v, s], i) => {
              const on = t > s - 0.05, active = on && (i === 2 || t < VALS[i + 1][1] - 0.05);
              return (
                <div key={v} style={{ opacity: on ? 1 : 0.25, transform: `scale(${on ? go(t, s - 0.05, s + 0.25, 0.7, 1) : 0.9})` }}>
                  <Pill bg={active ? PINK : "#fff"} color={active ? "#fff" : APPLE.ink} size={34}>{on && !active ? "✓ " : ""}{v}</Pill>
                </div>
              );
            })}
          </div>
        )}
        {/* Simple : le CV et le lien plongent dans le logo */}
        {show(t, Z.simple + 0.4, Z.tout + 0.1) && [["📄", "Ton CV", -1], ["🔗", "Le lien de l'offre", 1]].map(([ic, l, sd], i) => {
          const a = Z.simple + 0.45 + i * 0.55;
          const [x, y] = curve(absorb, [CX + (sd as number) * 250, 560], [CX, LY], [CX + (sd as number) * 380, 820]);
          return (
            <div key={l as string} style={{ position: "absolute", left: x, top: y, zIndex: 9, transform: `translate(-50%, -50%) scale(${go(t, a, a + 0.3, 0, 1) * (1 - 0.85 * absorb)})`, opacity: 1 - seg(t, Z.tout - 0.02, Z.tout + 0.06) }}>
              <Pill bg="#fff" color={APPLE.ink} size={36} style={{ boxShadow: "0 18px 50px rgba(0,0,0,0.18)" }}>{ic} {l}</Pill>
            </div>
          );
        })}
        <Shockwave t={t} t0={Z.tout + 0.05} x={CX} y={LY} r={360} />
        {/* Rapide : anneau 30 s* autour du logo */}
        {t > Z.rapide - 0.1 && t < Z.cette && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, zIndex: 3, opacity: seg(t, Z.rapide - 0.1, Z.rapide + 0.2) * (1 - seg(t, Z.efficace + 0.2, Z.cette)) }}>
            <circle cx={CX} cy={LY} r={310} fill="none" stroke="#E3E3E8" strokeWidth={14} />
            <circle cx={CX} cy={LY} r={310} fill="none" stroke={PINK} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 310 * ring} 9999`} transform={`rotate(-90 ${CX} ${LY})`} style={{ filter: `drop-shadow(0 0 ${12 + 30 * pulse(t, Z.s30 + 0.6, 0.25)}px rgba(217,130,139,0.8))` }} />
          </svg>
        )}
        {/* Efficace : la lettre pour CETTE entreprise */}
        {show(t, Z.efficace + 0.2, Z.ref + 0.1) && (
          <div style={{ position: "absolute", left: CX - 200, top: 280, zIndex: 8, ...inOut(t, Z.efficace + 0.2, Z.ref + 0.1) }}>
            <div style={{ transform: `rotate(${Math.sin(t * 1.5) * 1.5}deg) scale(0.92)`, transformOrigin: "50% 0%" }}><Letter w={400} logo write={ease(t, Z.efficace + 0.3, Z.cette + 0.4)} /></div>
            <div style={{ position: "absolute", right: -26, top: -24, width: 92, height: 92, borderRadius: 46, background: PINK, color: "#fff", fontSize: 50, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${PINK}`, transform: `scale(${go(t, Z.cette + 0.4, Z.cette + 0.7, 0, 1)})` }}>✓</div>
          </div>
        )}

        {/* ═════ 6. la référence, offerte, fin ═════ */}
        <Horizon k={ease(t, Z.refMot - 0.1, Z.refMot + 0.4) * (1 - ease(t, Z.offerte - 0.2, Z.offerte + 0.1))} y={1290} />
        {show(t, Z.offerte - 0.05, Z.bio + 0.1) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1240, zIndex: 20, textAlign: "center", ...inOut(t, Z.offerte - 0.05, Z.bio + 0.1) }}>
            <div style={{ display: "inline-block", transform: `scale(${go(t, Z.offerteMot - 0.1, Z.offerteMot + 0.2, 0.9, 1)})` }}><Pill bg={PINK} size={46}>🎁 Ta 1re lettre est offerte</Pill></div>
          </div>
        )}
        {t > Z.offerteMot - 0.05 && t < Z.offerteMot + 1.6 && <Confetti t={t} t0={Z.offerteMot} />}
        {t > Z.bio - 0.1 && <div style={{ position: "absolute", inset: 0, zIndex: 2, opacity: seg(t, Z.bio - 0.1, Z.bio + 0.4) }}><Bubbles t={t} t0={Z.bio} /></div>}
        {show(t, Z.bio, ZERO_VUE_DUR + 1) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1230, zIndex: 20, textAlign: "center", ...inOut(t, Z.bio, ZERO_VUE_DUR + 1) }}>
            <Pill bg={APPLE.ink} size={50}>Lien en bio ↑</Pill>
            <div style={{ marginTop: 22, fontSize: 32, fontWeight: 700, color: APPLE.soft }}>tinyurl.com/try-mymotiv</div>
          </div>
        )}

        {/* ═════ titres ═════ */}
        <Line t={t} a={Z.hook} b={Z.post - 0.05} y={1150}><span style={{ fontSize: 66 }}><TextDrop t={t} t0={Z.hook + 0.05} text="Plus personne ne se" /></span><br /><span style={{ fontSize: 84, color: PINK }}><TextDrop t={t} t0={Z.hook + 0.9} text="débarrassera de toi." by="chars" from={[0, 26]} stagger={0.03} dur={0.16} /></span></Line>
        <Line t={t} a={Z.post + 0.05} b={Z.vu - 0.05} y={1150}><span style={{ fontSize: 62 }}><TextDrop t={t} t0={Z.post + 0.1} text="T'as déjà posté…" /></span><br /><span style={{ fontSize: 92, color: PINK }}><TextDrop t={t} t0={Z.zero - 0.45} text="…et eu zéro vue ?" by="chars" from={[0, 26]} stagger={0.03} dur={0.16} /></span></Line>
        <Line t={t} a={Z.vu + 0.05} b={Z.foot - 0.05} y={1150}><span style={{ fontSize: 62 }}><TextDrop t={t} t0={Z.vu + 0.1} text="Laissé en « Vu »…" /></span><br /><span style={{ fontSize: 92, color: DARK.soft }}><TextDrop t={t} t0={Z.sans} text="Sans réponse ?" by="chars" from={[0, 26]} stagger={0.03} dur={0.16} /></span></Line>
        <Line t={t} a={Z.foot + 0.05} b={Z.cand - 0.05} y={1150}><span style={{ fontSize: 62 }}><TextDrop t={t} t0={Z.foot + 0.1} text="Le dernier choisi au foot…" /></span><br /><span style={{ fontSize: 76, color: PINK }}><TextDrop t={t} t0={Z.toi - 1.2} text="parce qu'il restait que toi ?" by="chars" from={[0, 26]} stagger={0.025} dur={0.16} /></span></Line>
        <Line t={t} a={Z.cand + 0.05} b={Z.s0 - 0.05} y={1150}><span style={{ fontSize: 76 }}><TextDrop t={t} t0={Z.cand + 0.1} text="Tes candidatures ?" /></span><br /><span style={{ fontSize: 76, color: PINK }}><TextDrop t={t} t0={Z.cand + 0.7} text="C'est pareil." by="chars" from={[0, 26]} stagger={0.03} dur={0.16} /></span></Line>
        <Line t={t} a={Z.s0} b={Z.s1 - 0.02} y={1170}><span style={{ fontSize: 120, letterSpacing: -4 }}>Zéro vue.</span></Line>
        <Line t={t} a={Z.s1} b={Z.s2 - 0.02} y={1170}><span style={{ fontSize: 120, letterSpacing: -4 }}>Vu.</span></Line>
        <Line t={t} a={Z.s2} b={Z.sauf - 0.05} y={1170}><span style={{ fontSize: 110, letterSpacing: -4, color: DARK.soft }}>Dernier choisi.</span></Line>
        <Line t={t} a={Z.sauf + 0.05} b={Z.simple - 0.05} y={1150}><span style={{ fontSize: 50, color: PINK }}>↑</span><br /><span style={{ fontSize: 92 }}><TextDrop t={t} t0={Z.sauf + 0.1} text="Sauf avec MyMotiv." /></span></Line>
        <Line t={t} a={Z.simple} b={Z.rapide - 0.05} y={1170}><span style={{ fontSize: 110, color: PINK, letterSpacing: -4 }}><TextDrop t={t} t0={Z.simple} text="Simple." by="chars" from={[0, -40]} stagger={0.03} dur={0.16} /></span><br /><span style={{ fontSize: 50 }}><TextDrop t={t} t0={Z.simple + 0.5} text="Ton CV + le lien. C'est tout." /></span></Line>
        <Line t={t} a={Z.rapide} b={Z.efficace - 0.05} y={1310}><span style={{ fontSize: 110, color: PINK, letterSpacing: -4 }}>{t < Z.s30 - 0.1 ? <TextDrop t={t} t0={Z.rapide} text="Rapide." by="chars" from={[0, -40]} stagger={0.03} dur={0.16} /> : <TextDrop t={t} t0={Z.s30 - 0.1} text="30 s*" by="chars" from={[0, -40]} stagger={0.05} dur={0.16} />}</span></Line>
        {show(t, Z.s30 - 0.1, Z.efficace) && <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", fontSize: 26, color: APPLE.soft, fontFamily: "Open Sans", zIndex: 30, opacity: seg(t, Z.s30, Z.s30 + 0.3) * (1 - seg(t, Z.efficace - 0.2, Z.efficace)) }}>* temps mesuré : 27 à 35 s par lettre</div>}
        <Line t={t} a={Z.efficace} b={Z.ref - 0.05} y={1170}><span style={{ fontSize: 110, color: PINK, letterSpacing: -4 }}><TextDrop t={t} t0={Z.efficace} text="Efficace." by="chars" from={[0, -40]} stagger={0.03} dur={0.16} /></span><br /><span style={{ fontSize: 56 }}><TextDrop t={t} t0={Z.cette - 0.3} text="Pour CETTE entreprise." /></span></Line>
        {show(t, Z.efficace + 0.2, Z.ref) && <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", fontSize: 26, color: APPLE.soft, fontFamily: "Open Sans", zIndex: 30, opacity: seg(t, Z.cette, Z.cette + 0.3) * (1 - seg(t, Z.ref - 0.2, Z.ref)) }}>exemple fictif</div>}
        <Line t={t} a={Z.ref + 0.05} b={Z.offerte - 0.05} y={1130}><span style={{ fontSize: 56, color: APPLE.soft }}><TextDrop t={t} t0={Z.ref + 0.1} text="MyMotiv, c'est" /></span><br /><span style={{ fontSize: 120, letterSpacing: -4 }}><TextDrop t={t} t0={Z.refMot - 0.35} text="la référence." /></span></Line>
        <Line t={t} a={Z.offerte} b={Z.bio + 0.1} y={250}><span style={{ fontSize: 60 }}><TextDrop t={t} t0={Z.offerte + 0.05} text="Postulez." /></span><br /><span style={{ fontSize: 60, color: PINK }}><TextDrop t={t} t0={Z.offerte + 0.5} text="Faites-vous recruter." /></span></Line>

        {/* bulles de moqueries (voix de fond) */}
        {MOQ.map(([id, s, x, y]) => show(t, s - 0.05, s + 1.5) && (
          <div key={id} style={{ position: "absolute", left: x, top: y, zIndex: 25, transform: `translate(-50%, -50%) translateY(${-(t - s) * 40}px) scale(${go(t, s - 0.05, s + 0.2, 0.4, 1)})`, opacity: seg(t, s - 0.05, s + 0.1) * (1 - seg(t, s + 1.2, s + 1.5)) }}>
            <div style={{ padding: "16px 26px", borderRadius: 30, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(10px)", border: "1.5px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" }}>💬 {TXT[id]}</div>
          </div>
        ))}

        {/* moment MyMotiv */}
        <Shockwave t={t} t0={Z.drop} x={CX} y={LY} r={700} />
        <Flash k={pulse(t, Z.drop, 0.08) * 0.6} />
      </AbsoluteFill>

      {/* ═════ logo MyMotiv : immobile, au centre, au-dessus de tout ═════ */}
      <div style={{ position: "absolute", left: CX - LW / 2, top: LY - (LW * 221) / 960 / 2, width: LW, zIndex: 50 }}>
        <div style={{ position: "absolute", inset: -70, borderRadius: 200, background: `radial-gradient(ellipse, rgba(217,130,139,${0.5 * pulse(t, Z.drop, 0.5) + 0.25 * pulse(t, Z.tout, 0.3) + (t < LIGHT ? 0.18 : 0)}) 0%, rgba(217,130,139,0) 70%)` }} />
        <Img src={staticFile("logo-mymotiv.png")} style={{ width: LW, display: "block", position: "relative" }} />
        {[Z.drop - 0.1, Z.refMot - 0.1, Z.bio + 0.5].map((s) => t > s && t < s + 0.7 && (
          <div key={s} style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${staticFile("logo-mymotiv.png")})`, WebkitMaskSize: "100% 100%", background: `linear-gradient(100deg, rgba(255,255,255,0) ${lerp(-40, 110, seg(t, s, s + 0.6))}%, rgba(255,255,255,0.95) ${lerp(-25, 125, seg(t, s, s + 0.6))}%, rgba(255,255,255,0) ${lerp(-10, 140, seg(t, s, s + 0.6))}%)` }} />
        ))}
      </div>

      <Audio src={staticFile("audio/vue.wav")} />
    </AbsoluteFill>
  );
};
