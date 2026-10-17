// « Le vrai prix » (≈25 s, 60 i/s, 9:16) — pub motion design façon keynote (fond noir clair, cartes, accent rose), avec la
// voix pub « Paul K ». Levier de conversion : lever l'objection du prix, avec les vrais prix de lettre-ia/lib/pricing.ts.
// Une étiquette de prix qui tourne comme une machine à sous → elle s'arrête sur « 0 € » (la 1re lettre, sans inscription)
// → carte « 1 lettre » 1,99 € (avec le CV adapté, 3 ajustements, sans abonnement) → carte « Semaine » 3,99 € « Recommandé »
// (lettres illimitées*, CV adapté, 4 styles de PDF ; * 30 lettres par semaine au maximum ; Mois et À vie en petit) →
// « sans engagement » : un interrupteur qu'on coupe en 2 clics → « moins cher qu'un kebab » (une balance) → fin.
// Voix : voix-vraiprix.json. Son : synth_vraiprix.py.
import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, bounce, curve, go } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import voix from "./data/vraiprix-voix.json";
import { Pointer, Ripple } from "./Lien";
import { Flash, ease, pulse } from "./motion";
import { FinOfferte, Ligne, Mention, X, horloge } from "./pubMotion";
import { PLANS, LIFETIME_LETTERS, WEEKLY_LIMIT, ADJUSTMENTS_PER_LETTER } from "../../lettre-ia/lib/pricing";

export const VRAIPRIX_DUR = voix.duration;
const { at, sc } = horloge(voix);
const D = { bg: "#1C1C1E", card: "#2C2C2E", line: "#3A3A3C", ink: "#F5F5F7", soft: "#8E8E93" };
const ZERO = at(12), FIN = at(52) + 0.05;
const euros = (v: number) => `${v.toFixed(2).replace(".", ",")} €`;

// une ligne d'avantage cochée
const Avantage: React.FC<{ t: number; a: number; text: string; rose?: boolean }> = ({ t, a, text, rose }) => {
  const k = go(t, a, a + 0.3, 0, 1);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "14px 0", opacity: clamp(k * 2), transform: `translateX(${(1 - k) * 60}px)`, fontSize: 40, fontWeight: 600, color: rose ? PINK_L : D.ink, whiteSpace: "nowrap" }}>
      <span style={{ width: 50, height: 50, borderRadius: 25, background: PINK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, flex: "none" }}>✓</span>{text}
    </div>
  );
};

const Carte: React.FC<{ t: number; x: number; s: number; o: number; glow?: number; children: React.ReactNode }> = ({ x, s, o, glow = 0, children }) => (
  <div style={{ position: "absolute", left: x - 390, top: 560, width: 780, borderRadius: 52, background: D.card, padding: "44px 50px 40px", opacity: o, transform: `scale(${s})`, transformOrigin: "50% 0%",
    boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 0 ${glow ? 4 : 0}px rgba(217,130,139,0.85), 0 0 ${100 * glow}px rgba(217,130,139,0.5)`, fontFamily: "Poppins", color: D.ink }}>
    {children}
  </div>
);

export const VraiPrix: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;

  // ── 1. la machine à sous, qui s'arrête sur 0 € ──
  const spin = t < ZERO, hash = (n: number) => Math.floor((Math.abs(Math.sin(frame * 12.9898 + n * 78.233)) * 43758.5453) % 10);
  const slotS = bounce(t, [[-0.3, 0.6], [0.2, 1]]) * (t >= ZERO ? bounce(t, [[ZERO, 1.25], [ZERO + 0.3, 1]]) : 1);
  const slotOut = ease(t, sc(2) - 0.2, sc(2) + 0.15);

  // ── 2-3. les cartes de prix ──
  const c1In = ease(t, sc(2), sc(2) + 0.4), c1Out = ease(t, sc(3), sc(3) + 0.4);
  const c2In = ease(t, sc(3) + 0.1, sc(3) + 0.5), c2Out = ease(t, sc(4) - 0.1, sc(4) + 0.25);
  const prix1 = Math.min(PLANS.letter.cents / 100, (PLANS.letter.cents / 100) * ease(t, at(17) - 0.1, at(19)));
  const prix2 = Math.min(PLANS.week.cents / 100, (PLANS.week.cents / 100) * ease(t, at(30) - 0.1, at(32)));

  // ── 4. l'interrupteur « abonnement », coupé en 2 clics ──
  const c1 = at(45) - 0.05, c2 = at(46) + 0.05, swK = go(t, c2, c2 + 0.25, 1, 0);
  const [px, py] = curve(go(t, at(43), c1 - 0.1, 0, 1), [880, 1350], [X + 110, 830], [960, 1000]);
  const pPress = Math.max(pulse(t, c1, 0.06), pulse(t, c2, 0.06)), pO = seg(t, at(43), at(43) + 0.15) * (1 - seg(t, c2 + 0.3, c2 + 0.45));
  const swIn = ease(t, sc(4), sc(4) + 0.4), swOut = ease(t, sc(5) - 0.15, sc(5) + 0.2);

  // ── 5. la balance ──
  const bIn = ease(t, sc(5), sc(5) + 0.35), bOut = ease(t, FIN - 0.15, FIN + 0.15), tilt = go(t, at(51) - 0.1, at(51) + 0.3, 0, 12);
  const flash = pulse(t, ZERO, 0.12) * 0.7 + pulse(t, FIN, 0.12);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 48%, #3A2327 0%, ${D.bg} 62%)`, fontFamily: "Poppins", color: D.ink, overflow: "hidden" }}>
      {/* ── titres ── */}
      <Ligne t={t} t0={-0.3} text="Combien ça coûte," y={300} size={74} out={sc(1)} />
      <Ligne t={t} t0={at(3)} text="une lettre qui sort" y={385} size={62} out={sc(1)} />
      <Ligne t={t} t0={at(6)} text="de la pile ?" y={460} size={62} color={PINK_L} out={sc(1)} />
      <Ligne t={t} t0={sc(1) + 0.1} text="La 1re lettre ?" y={330} size={74} out={sc(2) - 0.1} />
      <Ligne t={t} t0={sc(2) + 0.1} text="Ensuite :" y={330} size={64} color={D.soft} out={sc(3) - 0.1} />
      <Ligne t={t} t0={sc(3) + 0.1} text="Ou à la semaine :" y={330} size={64} color={D.soft} out={sc(4) - 0.1} />
      <Ligne t={t} t0={at(41)} text="Sans engagement." y={330} size={76} out={sc(5) - 0.1} />
      <Ligne t={t} t0={at(47)} text="Moins cher" y={320} size={84} out={FIN - 0.1} />
      <Ligne t={t} t0={at(48)} text="qu'un kebab." y={410} size={84} color={PINK_L} out={FIN - 0.1} />

      {/* ── 1. la machine à sous ── */}
      {t < sc(2) + 0.2 && (
        <div style={{ position: "absolute", left: X - 380, top: 640, width: 760, height: 380, borderRadius: 60, background: D.card, display: "flex", alignItems: "center", justifyContent: "center",
          transform: `scale(${slotS * lerp(1, 0.7, slotOut)})`, opacity: 1 - slotOut, boxShadow: `0 40px 100px rgba(0,0,0,0.5), 0 0 ${t >= ZERO ? 110 : 30}px rgba(217,130,139,${t >= ZERO ? 0.6 : 0.2})`, overflow: "hidden" }}>
          {spin
            ? <div style={{ fontSize: 190, fontWeight: 800, letterSpacing: -4, color: D.ink, display: "flex" }}>{["?", ",", "?", "?", " €"].map((c, j) => <span key={j} style={{ display: "inline-block", whiteSpace: "pre", transform: c === "?" ? `translateY(${(hash(j) - 4.5) * 3}px) rotate(${(hash(j + 7) - 4.5) * 1.5}deg)` : undefined, filter: c === "?" ? "blur(1.5px)" : undefined }}>{c}</span>)}</div>
            : <div style={{ fontSize: 250, fontWeight: 800, letterSpacing: -6, color: PINK_L, textShadow: `0 0 50px ${PINK}` }}>0 €</div>}
        </div>
      )}
      {t >= at(14) && t < sc(2) + 0.2 && <div style={{ position: "absolute", left: X, top: 1110, transform: `translate(-50%, 0) scale(${go(t, at(14), at(14) + 0.3, 0.6, 1)})`, opacity: 1 - slotOut, padding: "16px 40px", borderRadius: 50, background: PINK, color: "#fff", fontSize: 48, fontWeight: 800, whiteSpace: "nowrap" }}>Sans inscription ✓</div>}

      {/* ── 2. carte « 1 lettre » ── */}
      {t >= sc(2) && t < sc(3) + 0.45 && (
        <Carte t={t} x={X - c1Out * 300} s={lerp(0.85, 1, c1In) * lerp(1, 0.8, c1Out)} o={clamp(c1In * 2) * (1 - c1Out)}>
          <div style={{ fontSize: 40, fontWeight: 600, color: D.soft }}>{PLANS.letter.name}</div>
          <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -4, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>{euros(prix1)}</div>
          <div style={{ fontSize: 34, color: D.soft, marginBottom: 18 }}>{PLANS.letter.period}</div>
          <Avantage t={t} a={at(21)} text="1 lettre personnalisée" />
          <Avantage t={t} a={at(24)} text="+ le CV adapté à l'offre" rose />
          <Avantage t={t} a={at(26)} text={`${ADJUSTMENTS_PER_LETTER} ajustements inclus`} />
          <Avantage t={t} a={at(28)} text="Sans abonnement" />
        </Carte>
      )}

      {/* ── 3. carte « Semaine », recommandée ── */}
      {t >= sc(3) && t < sc(4) + 0.3 && (
        <>
          <Carte t={t} x={X + (1 - c2In) * 300 - c2Out * 300} s={lerp(0.85, 1, c2In) * lerp(1, 0.8, c2Out)} o={clamp(c2In * 2) * (1 - c2Out)} glow={0.6 + 0.4 * pulse(t, at(30) + 0.4, 0.3)}>
            <div style={{ position: "absolute", right: 40, top: 44, padding: "8px 24px", borderRadius: 30, background: PINK, color: "#fff", fontSize: 32, fontWeight: 800 }}>{PLANS.week.badge}</div>
            <div style={{ fontSize: 40, fontWeight: 600, color: D.soft }}>{PLANS.week.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
              <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -4, lineHeight: 1.05, fontVariantNumeric: "tabular-nums", color: PINK_L }}>{euros(prix2)}</div>
              <div style={{ fontSize: 40, color: D.soft }}>/ sem.</div>
            </div>
            <div style={{ height: 14 }} />
            <Avantage t={t} a={at(35)} text="Lettres illimitées*" rose />
            <Avantage t={t} a={at(37)} text="CV adapté à l'offre" />
            <Avantage t={t} a={at(38)} text="4 styles de PDF" />
            <Avantage t={t} a={at(40)} text="Ajustements illimités" />
          </Carte>
          <div style={{ position: "absolute", left: 120, width: 800, top: 1300, textAlign: "center", fontSize: 32, fontWeight: 600, color: D.soft, opacity: seg(t, at(40), at(40) + 0.3) * (1 - c2Out) }}>
            Aussi : {PLANS.month.name} {PLANS.month.price} · {PLANS.lifetime.name} {PLANS.lifetime.price} ({LIFETIME_LETTERS} lettres)
          </div>
        </>
      )}
      <Mention t={t} a={at(35)} b={sc(4) + 0.2} text={`* ${WEEKLY_LIMIT} lettres par semaine au maximum`} />

      {/* ── 4. l'interrupteur ── */}
      {t >= sc(4) && t < sc(5) + 0.25 && (
        <div style={{ position: "absolute", left: X - 380, top: 640, width: 760, height: 380, borderRadius: 52, background: D.card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          transform: `scale(${lerp(0.8, 1, swIn) * lerp(1, 0.8, swOut)})`, opacity: clamp(swIn * 2) * (1 - swOut), boxShadow: "0 40px 100px rgba(0,0,0,0.5)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <div style={{ fontSize: 48, fontWeight: 700 }}>Abonnement</div>
            <div style={{ width: 200, height: 110, borderRadius: 55, background: swK > 0.5 ? PINK : D.line, position: "relative", boxShadow: swK > 0.5 ? `0 0 40px ${PINK}` : undefined }}>
              <div style={{ position: "absolute", top: 8, left: lerp(8, 98, swK), width: 94, height: 94, borderRadius: 47, background: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.35)" }} />
            </div>
          </div>
        </div>
      )}
      {t >= at(43) && t < sc(5) + 0.25 && (
        <div style={{ position: "absolute", left: 120, width: 800, top: 1080, textAlign: "center", fontSize: 56, fontWeight: 800, color: PINK_L, opacity: 1 - swOut }}>
          <TextDrop t={t} t0={at(43)} text="Résiliable en 2 clics" />
        </div>
      )}
      <Ripple x={X + 110} y={830} t={t} t0={c1} />
      <Ripple x={X + 110} y={830} t={t} t0={c2} />

      {/* ── 5. la balance : le kebab pèse plus lourd ── */}
      {t >= sc(5) && t < FIN + 0.2 && (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: clamp(bIn * 2) * (1 - bOut), transform: `scale(${lerp(0.85, 1, bIn)})`, transformOrigin: `${X}px 900px` }}>
          <div style={{ position: "absolute", left: X - 20, top: 820, width: 40, height: 380, borderRadius: 20, background: D.line }} />
          <div style={{ position: "absolute", left: X - 120, top: 1180, width: 240, height: 40, borderRadius: 20, background: D.line }} />
          <div style={{ position: "absolute", left: X - 300, top: 800, width: 600, height: 36, borderRadius: 18, background: D.soft, transform: `rotate(${tilt}deg)`, transformOrigin: "50% 50%" }}>
            {/* côté gauche (léger) : MyMotiv ; côté droit (lourd) : le kebab */}
            <div style={{ position: "absolute", left: 50 - 130, top: -130, width: 260, transform: `rotate(${-tilt}deg)`, textAlign: "center" }}>
              <div style={{ display: "inline-block", padding: "16px 26px", borderRadius: 40, background: PINK, color: "#fff", fontSize: 50, fontWeight: 800, whiteSpace: "nowrap" }}>{PLANS.week.price}</div>
            </div>
            <div style={{ position: "absolute", left: 550 - 130, top: -190, width: 260, transform: `rotate(${-tilt}deg)`, textAlign: "center", fontSize: 160, lineHeight: 1 }}>🥙</div>
          </div>
        </div>
      )}

      <FinOfferte t={t} t0={FIN} aBio={at(57)} dark sous={`Puis dès ${PLANS.letter.price}.`} />
      <Flash k={flash} />
      <div style={{ position: "absolute", inset: 0, zIndex: 20 }}><Pointer x={px} y={py} hover={seg(t, c1 - 0.3, c1 - 0.1)} press={pPress} o={pO} /></div>
      <Audio src={staticFile("audio/vraiprix.wav")} />
    </AbsoluteFill>
  );
};
