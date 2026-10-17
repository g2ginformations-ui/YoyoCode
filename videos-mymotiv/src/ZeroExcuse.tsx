// « Zéro excuse » (≈29 s, 60 i/s, 9:16) — pub motion design style « Révélation » (fond sombre, lumière rose, cartes en 3D),
// avec la voix pub « Paul K ». Levier de conversion : lever les objections une par une, puis la preuve sociale.
// 4 excuses (« pas le temps », « quoi écrire », « ça va faire robot », « c'est payant ») : chaque carte est barrée au feutre
// puis se retourne sur la vraie réponse (30 s*, il part de l'offre, zéro phrase toute faite et c'est toi qui valides,
// 1re lettre offerte) → le témoignage réel de Léni S. (11 candidatures → 7 entretiens, avec sa mention) → « plus d'excuse »,
// fin à bulles. Voix : voix-zeroexcuse.json. Son : synth_zeroexcuse.py.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, go, press } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import voix from "./data/zeroexcuse-voix.json";
import { Bubbles, DARK, Flash, GLOW_BG, ease, pulse } from "./motion";
import { FinOfferte, Ligne, Mention, X, horloge } from "./pubMotion";

export const ZEROEXCUSE_DUR = voix.duration;
const { at, sc } = horloge(voix);
const CY = 860, CW = 800, CH = 520;
type Exc = { ph: number; q: string; barre: number; flip: number };
const EXC: Exc[] = [
  { ph: 1, q: "« J'ai pas\nle temps. »", barre: at(14) - 0.05, flip: at(14) + 0.2 },
  { ph: 2, q: "« Je sais pas\nquoi écrire. »", barre: at(23) - 0.05, flip: at(23) + 0.2 },
  { ph: 3, q: "« Ça va faire\nrobot. »", barre: at(38) - 0.05, flip: at(38) + 0.2 },
  { ph: 4, q: "« C'est\npayant. »", barre: at(51) - 0.05, flip: at(51) + 0.2 },
];
const MAIN = ["Pas le temps", "Quoi écrire ?", "Ça fait robot", "C'est payant"];

const Pill: React.FC<{ t: number; a: number; text: string; barre?: boolean; dark?: boolean }> = ({ t, a, text, barre, dark }) => {
  if (t < a) return null;
  const k = go(t, a, a + 0.3, 0, 1);
  return (
    <div style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 24px", borderRadius: 40, background: dark ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.92)", color: dark ? "#fff" : "#1D1D1F", fontFamily: "Poppins", fontWeight: 700, fontSize: 36, whiteSpace: "nowrap", transform: `scale(${0.7 + 0.3 * k})`, opacity: clamp(k * 2), margin: "8px" }}>
      {text}
      {barre && <div style={{ position: "absolute", left: 12, right: 12, top: "50%", height: 6, borderRadius: 3, background: "#1D1D1F", transformOrigin: "0 50%", transform: `scaleX(${ease(t, a + 0.25, a + 0.5)})` }} />}
    </div>
  );
};

// la réponse (dos de la carte), selon l'excuse
const Reponse: React.FC<{ t: number; i: number }> = ({ t, i }) => {
  const box: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", fontFamily: "Poppins", color: "#fff", padding: 30 };
  if (i === 0) return (
    <div style={box}>
      <div style={{ fontSize: 190, fontWeight: 800, lineHeight: 1, letterSpacing: -6 }}>{Math.round(30 * ease(t, EXC[0].flip + 0.1, EXC[0].flip + 0.7))} s*</div>
      <div style={{ fontSize: 52, fontWeight: 700, marginTop: 10 }}>par lettre</div>
    </div>
  );
  if (i === 1) return (
    <div style={box}>
      <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>Tu colles l'offre.</div>
      <div style={{ fontSize: 40, fontWeight: 600, margin: "10px 0 16px", opacity: seg(t, at(27), at(27) + 0.2) }}>Il trouve ce qu'elle cherche :</div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 720 }}>
        <Pill t={t} a={at(28)} text="✓ vente" /><Pill t={t} a={at(28) + 0.15} text="✓ conseil client" /><Pill t={t} a={at(28) + 0.3} text="✓ objectifs" />
      </div>
    </div>
  );
  if (i === 2) return (
    <div style={box}>
      <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1.1 }}>Zéro phrase toute faite.</div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", margin: "12px 0 18px" }}>
        <Pill t={t} a={at(39)} text="« dynamique et motivé »" barre />
      </div>
      {t >= at(42) && <div style={{ padding: "18px 46px", borderRadius: 50, background: "#fff", color: "#1D1D1F", fontSize: 46, fontWeight: 800, transform: `scale(${go(t, at(42), at(42) + 0.3, 0.6, 1) * press(t, at(47))})`, boxShadow: "0 10px 40px rgba(0,0,0,0.3)" }}>Tu valides ✓</div>}
    </div>
  );
  return (
    <div style={box}>
      <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05 }}>1re lettre<br />offerte.</div>
      {t >= at(56) && <div style={{ marginTop: 20, padding: "10px 30px", borderRadius: 40, background: "rgba(0,0,0,0.25)", fontSize: 42, fontWeight: 700, transform: `scale(${go(t, at(56), at(56) + 0.3, 0.6, 1)})` }}>Sans inscription ✓</div>}
    </div>
  );
};

const CarteExcuse: React.FC<{ t: number; i: number }> = ({ t, i }) => {
  const e = EXC[i], t0 = sc(e.ph), t1 = sc(e.ph + 1);
  const inK = ease(t, t0, t0 + 0.45), outK = ease(t, t1 - 0.3, t1);
  const flipK = go(t, e.flip, e.flip + 0.45, 0, 1), rotY = 180 * flipK + lerp(30, 0, inK) - outK * 40 + Math.sin(t * 0.8) * 3;
  const barreK = ease(t, e.barre, e.barre + 0.25), dos = ((rotY % 360) + 360) % 360 > 90 && ((rotY % 360) + 360) % 360 < 270;
  const face: React.CSSProperties = { position: "absolute", inset: 0, borderRadius: 48, overflow: "hidden" };
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1700 }}>
      <div style={{ position: "absolute", left: X - CW / 2, top: CY - CH / 2, width: CW, height: CH,
        transform: `translateX(${(1 - inK) * 420 - outK * 520}px) rotateX(${6 + Math.cos(t * 0.6) * 2}deg) rotateY(${rotY}deg) scale(${lerp(0.7, 1, inK) * lerp(1, 0.8, outK)})`, filter: `blur(${(1 - inK) * 14 + outK * 14}px)` }}>
        {/* face : l'excuse, barrée au feutre */}
        <div style={{ ...face, background: DARK.card, boxShadow: "0 40px 100px rgba(0,0,0,0.6), inset 0 0 0 2px #3A3A3C", display: dos ? "none" : "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "relative", fontFamily: "Poppins", fontWeight: 800, fontSize: 82, lineHeight: 1.1, color: DARK.ink, textAlign: "center", whiteSpace: "pre" }}>
            <TextDrop t={t} t0={t0 + 0.1} text={e.q} by="words" stagger={0.06} />
            <div style={{ position: "absolute", left: -20, right: -20, top: "48%", height: 16, borderRadius: 8, background: PINK, boxShadow: `0 0 24px ${PINK}`, transformOrigin: "0 50%", transform: `rotate(-6deg) scaleX(${barreK})` }} />
          </div>
        </div>
        {/* dos : la réponse */}
        <div style={{ ...face, transform: "rotateY(180deg)", background: `linear-gradient(150deg, ${PINK_L} 0%, ${PINK} 55%, #B9606B 100%)`, boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 90px rgba(217,130,139,0.55)", display: dos ? "block" : "none" }}>
          <Reponse t={t} i={i} />
        </div>
      </div>
    </div>
  );
};

// le témoignage réel de Léni S.
const Temoignage: React.FC<{ t: number }> = ({ t }) => {
  const t0 = sc(5), k = ease(t, t0, t0 + 0.45), outK = ease(t, sc(6) - 0.3, sc(6));
  const n1 = Math.round(11 * ease(t, at(64), at(64) + 0.6)), n2 = Math.round(7 * ease(t, at(66), at(66) + 0.5));
  return (
    <div style={{ position: "absolute", inset: 0, perspective: 1700 }}>
      <div style={{ position: "absolute", left: X - 400, top: 560, width: 800, height: 620, borderRadius: 48, background: DARK.card, boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 0 3px rgba(242,184,192,0.5), 0 0 80px rgba(217,130,139,${0.35 + 0.3 * pulse(t, at(66) + 0.3, 0.25)})`,
        transform: `rotateY(${lerp(-25, 0, k) + outK * 30 + Math.sin(t * 0.7) * 2}deg) rotateX(5deg) scale(${lerp(0.75, 1, k) * lerp(1, 0.8, outK)})`, filter: `blur(${(1 - k) * 12 + outK * 14}px)`, opacity: clamp(k * 2) * (1 - outK), fontFamily: "Poppins", color: DARK.ink }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "40px 46px 0" }}>
          <div style={{ width: 96, height: 96, borderRadius: 48, background: `linear-gradient(145deg, ${PINK_L}, ${PINK})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 50, fontWeight: 800, color: "#fff" }}>L</div>
          <div><div style={{ fontSize: 44, fontWeight: 800 }}>Léni S.</div><div style={{ fontSize: 30, color: PINK_L, letterSpacing: 4 }}>★★★★★</div></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", alignItems: "center", marginTop: 46 }}>
          <div style={{ textAlign: "center", opacity: seg(t, at(64) - 0.1, at(64) + 0.1) }}>
            <div style={{ fontSize: 170, fontWeight: 800, lineHeight: 1, letterSpacing: -4 }}>{n1}</div>
            <div style={{ fontSize: 38, fontWeight: 600, color: DARK.soft }}>candidatures</div>
          </div>
          <div style={{ fontSize: 80, color: PINK, opacity: seg(t, at(66) - 0.2, at(66)) }}>→</div>
          <div style={{ textAlign: "center", opacity: seg(t, at(66) - 0.1, at(66) + 0.1) }}>
            <div style={{ fontSize: 170, fontWeight: 800, lineHeight: 1, letterSpacing: -4, color: PINK_L, textShadow: `0 0 40px ${PINK}` }}>{n2}</div>
            <div style={{ fontSize: 38, fontWeight: 600, color: DARK.soft }}>entretiens</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ZeroExcuse: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const cur = EXC.findIndex((e) => t >= sc(e.ph) && t < sc(e.ph + 1));
  const fin = at(69) + 0.3;
  const flash = EXC.reduce((m, e) => Math.max(m, pulse(t, e.flip + 0.2, 0.1) * 0.4), 0) + pulse(t, fin, 0.12);
  return (
    <AbsoluteFill style={{ background: GLOW_BG, fontFamily: "Poppins", color: DARK.ink, overflow: "hidden" }}>
      {/* ── accroche : la main de 4 excuses ── */}
      <Ligne t={t} t0={-0.3} text="Tu repousses encore" y={310} size={70} out={sc(1)} />
      <Ligne t={t} t0={0.0} text="tes candidatures ?" y={392} size={70} color={PINK_L} out={at(5) - 0.15} />
      <Ligne t={t} t0={at(5)} text="On démonte tes excuses." y={392} size={62} color={PINK_L} out={sc(1)} />
      {t < sc(1) + 0.3 && MAIN.map((m, i) => {
        const a = i === 0 ? -0.2 : 0.25 + i * 0.12, k = go(t, a, a + 0.4, 0, 1), out = ease(t, sc(1) - 0.25, sc(1) + 0.2);
        const ang = [-6, 5, 4, -5][i], x = X + (i % 2 ? 200 : -200), y = (i < 2 ? 820 : 1080) - out * 900 * (i % 2 ? 1 : 0.8);
        return (
          <div key={m} style={{ position: "absolute", left: x - 180, top: y - 110, width: 360, height: 220, borderRadius: 32, background: DARK.card, boxShadow: `0 30px 70px rgba(0,0,0,0.55), inset 0 0 0 2px #3A3A3C, 0 0 ${40 * pulse(t, at(8) + i * 0.1, 0.2)}px ${PINK}`,
            transform: `rotate(${ang * k + out * (i % 2 ? 20 : -20)}deg) scale(${lerp(0.6, 1, k)})`, opacity: clamp(k * 2) * (1 - out), display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: 40, fontWeight: 800, padding: 20 }}>{m}</div>
        );
      })}

      {/* ── les 4 excuses ── */}
      {cur >= 0 && (
        <>
          <div style={{ position: "absolute", left: X, top: 360, transform: `translate(-50%, -50%) scale(${go(t, sc(EXC[cur].ph), sc(EXC[cur].ph) + 0.3, 0.6, 1)})`, zIndex: 10, padding: "12px 34px", borderRadius: 40, fontSize: 44, fontWeight: 800, whiteSpace: "nowrap",
            background: t >= EXC[cur].flip + 0.25 ? PINK : DARK.card, color: t >= EXC[cur].flip + 0.25 ? "#fff" : PINK_L, boxShadow: "0 0 40px rgba(217,130,139,0.35)" }}>
            {t >= EXC[cur].flip + 0.25 ? "EXCUSE DÉMONTÉE ✓" : `EXCUSE ${cur + 1}/4`}
          </div>
          <CarteExcuse t={t} i={cur} />
        </>
      )}
      <Mention t={t} a={EXC[0].flip + 0.2} b={sc(2)} text="* temps mesuré : 27 à 35 s par lettre" />

      {/* ── la preuve ── */}
      {t >= sc(5) && t < sc(6) + 0.05 && (
        <>
          <Ligne t={t} t0={sc(5) + 0.1} text="Avec MyMotiv," y={330} size={64} out={sc(6) - 0.2} />
          <Ligne t={t} t0={at(61) - 0.1} text="Léni a postulé." y={410} size={64} color={PINK_L} out={sc(6) - 0.2} />
          <Temoignage t={t} />
        </>
      )}
      <Mention t={t} a={sc(5) + 0.2} b={sc(6) + 0.05} text="Témoignage réel · résultats individuels non garantis" color="#B8B0B3" y={1225} />

      {/* ── fin ── */}
      <Ligne t={t} t0={at(68)} text="Alors, plus d'excuse." y={330} size={70} color={PINK_L} />
      {t >= fin - 0.05 && <div style={{ position: "absolute", inset: 0, opacity: 0.65 * ease(t, fin, fin + 0.4) }}><Bubbles t={t} t0={fin} /></div>}
      <FinOfferte t={t} t0={fin} aBio={at(72)} dark />
      <Flash k={flash} />
      <Audio src={staticFile("audio/zeroexcuse.wav")} />
    </AbsoluteFill>
  );
};
