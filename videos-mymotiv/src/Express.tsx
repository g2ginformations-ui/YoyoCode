// « 19 minutes gagnées » (22,5 s, 60 i/s, 9:16) — version simple, rapide et épurée du parcours (pas de captures du site :
// des éléments dessinés, une idée par plan), style « Révélation » (skill apple-motion, parties 1 et 2).
// 19 min gagnées* (hook + flash) → Ton CV ✓ → le lien de l'offre (frappe) → appui sur « Générer » (drop de la musique)
// → anneau 0 → 30 s* → la lettre, le logo se pose → 20 min* vs 30 s → 0,99 € la lettre, moins qu'un café →
// témoignage réel de Léni (11 candidatures → 7 entretiens, mention obligatoire) → « Sans stress. Sans être un pro du
// recrutement. » → flash → fin à bulles. Caméra 3D sur chaque plan (entrée en coup de fouet, dérive, zoom qui suit
// l'action, sortie floue), rebond d'inertie et décalages, texte lettre par lettre, appui avant chaque action.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, bounce, curve, go, press } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import { Pointer, Ripple } from "./Lien";
import { AppIcon, Bubbles, DARK, Flash, GLOW_BG, GlossPill, Horizon, Shockwave, ease, pulse } from "./motion";
import "./fonts";

export const EXPRESS_DUR = 22.5;
const CX = 540, CY = 900;
// Plans : [début, fin]
export const X = { hook: [0, 1.7], cv: [1.7, 3.5], lien: [3.5, 5.3], gen: [5.3, 8.4], lettre: [8.4, 10.6], temps: [10.6, 12.9],
  cafe: [12.9, 15.1], leni: [15.1, 17.6], stress: [17.6, 19.5], end: [19.6, 22.5] } as const;
export const EX = { flash1: 1.05, clicGen: 6.0, logo: 9.35, flash2: 19.5 };

// Caméra d'un plan : entrée en coup de fouet (rotation, glissé, flou), dérive lente, sortie floue
function cam(t: number, [a, b]: readonly [number, number], zoom = 0) {
  const kin = ease(t, a, a + 0.38), kout = seg(t, b - 0.28, b);
  const drift = (t - a) / Math.max(0.1, b - a);
  return {
    on: t > a - 0.02 && t < b + 0.02,
    style: {
      position: "absolute" as const, inset: 0, opacity: clamp(kin * 1.5) * (1 - kout),
      filter: `blur(${(1 - kin) * 14 + kout * 16}px)`,
      transform: `translateX(${(1 - kin) * 380 - kout * 380}px) rotateY(${(1 - kin) * -26 + kout * 26 + Math.sin(t * 0.8) * 2.5}deg) rotateX(${4 + Math.cos(t * 0.6) * 2}deg) scale(${lerp(0.86, 1, kin) * (1 + drift * 0.04 + zoom)})`,
      transformOrigin: `${CX}px ${CY}px`,
    },
  };
}
const Title: React.FC<{ t: number; t0: number; out: number; a: string; b?: string; y?: number; size?: number }> = ({ t, t0, out, a, b, y = 210, size = 70 }) => (
  <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontSize: size, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1 }}>
    <TextDrop t={t} t0={t0} text={a} out={out} />
    {b && <><br /><span style={{ color: PINK }}><TextDrop t={t} t0={t0 + 0.25} text={b} by="chars" from={[0, 24]} stagger={0.025} dur={0.2} out={out} /></span></>}
  </div>
);
const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({ position: "absolute", background: DARK.card, borderRadius: 40, boxShadow: "0 40px 100px rgba(0,0,0,0.55), 0 0 0 2px #36363A", ...extra });
const Check: React.FC<{ k: number; size?: number }> = ({ k, size = 70 }) => (
  <div style={{ width: size, height: size, borderRadius: size / 2, background: PINK, color: "#fff", fontWeight: 800, fontSize: size * 0.5, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})`, flex: "none", boxShadow: `0 0 ${30 * k}px rgba(217,130,139,0.6)` }}>✓</div>
);

export const Express: React.FC<{ audio?: string }> = ({ audio = "audio/express.wav" }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const flashK = pulse(t, EX.flash1) + pulse(t, EX.flash2) * 1.1;

  // ── curseur : appuis sur « Générer » ──
  const [px, py] = curve(ease(t, 5.45, EX.clicGen - 0.08), [980, 1500], [CX, 1180], [1000, 1150]);
  const pPress = pulse(t, EX.clicGen, 0.08), pHover = seg(t, EX.clicGen - 0.3, EX.clicGen - 0.12) * (1 - seg(t, EX.clicGen + 0.15, EX.clicGen + 0.35));
  const pO = seg(t, 5.4, 5.55) * (1 - seg(t, EX.clicGen + 0.3, EX.clicGen + 0.45));

  const hook = cam(t, X.hook), cv = cam(t, X.cv), lien = cam(t, X.lien), gen = cam(t, X.gen, ease(t, 6.2, 7.0) * 0.08), lettre = cam(t, X.lettre, ease(t, EX.logo - 0.3, EX.logo + 0.4) * 0.06);
  const temps = cam(t, X.temps), cafe = cam(t, X.cafe), leni = cam(t, X.leni), stress = cam(t, X.stress);
  const ring = seg(t, 6.35, 7.95);

  return (
    <AbsoluteFill style={{ background: GLOW_BG, fontFamily: "Poppins", color: DARK.ink, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, perspective: 1700 }}>
        {/* ── hook : 19 min gagnées* ── */}
        {hook.on && (
          <div style={hook.style}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center" }}>
              <div style={{ fontSize: 250, fontWeight: 800, letterSpacing: -10, lineHeight: 1, color: PINK, transform: `scale(${bounce(t, [[EX.flash1 - 0.02, 1.25], [EX.flash1 + 0.3, 1]])})`, textShadow: "0 0 60px rgba(217,130,139,0.45)" }}>
                <TextDrop t={t} t0={0.1} text="19 min" by="chars" from={[0, -80]} stagger={0.06} dur={0.3} />
              </div>
              <div style={{ fontSize: 96, fontWeight: 800, marginTop: 10 }}><TextDrop t={t} t0={0.55} text="gagnées*" by="chars" from={[0, 40]} stagger={0.04} dur={0.22} /></div>
              <div style={{ fontSize: 40, fontWeight: 600, color: DARK.soft, marginTop: 30 }}><TextDrop t={t} t0={EX.flash1 + 0.05} text="par lettre de motivation" from={[0, 20]} /></div>
            </div>
            <div style={{ position: "absolute", left: 60, right: 60, top: 1330, textAlign: "center", fontSize: 26, color: DARK.soft, fontFamily: "Open Sans", opacity: seg(t, EX.flash1, EX.flash1 + 0.3) }}>* vs ≈ 20 min avec un chatbot IA (estimation) · MyMotiv : 27 à 35 s mesurées</div>
          </div>
        )}
        <Shockwave t={t} t0={EX.flash1} y={760} />

        {/* ── 1. Ton CV ── */}
        {cv.on && (
          <div style={cv.style}>
            <Title t={t} t0={X.cv[0] + 0.15} out={X.cv[1] - 0.25} a="1. Ton CV" b="une seule fois" />
            <div style={card({ left: CX - 400, top: 720, width: 800, height: 330, border: `4px dashed ${lerp(0, 1, ease(t, 2.6, 2.8)) > 0.5 ? PINK : "#4A4A4E"}`, background: "rgba(44,44,46,0.6)" })} />
            <div style={card({ left: CX - 340, top: lerp(380, 820, ease(t, 2.05, 2.55)), width: 680, height: 130, display: "flex", alignItems: "center", gap: 26, padding: "0 34px", transform: `rotate(${lerp(-8, 0, ease(t, 2.05, 2.6))}deg) scale(${bounce(t, [[2.5, 1.06], [2.8, 1]])})` })}>
              <div style={{ fontSize: 54 }}>📄</div>
              <div style={{ fontSize: 40, fontWeight: 700, flex: 1 }}>Mon CV.pdf</div>
              <Check k={go(t, 2.65, 2.95, 0, 1)} />
            </div>
          </div>
        )}

        {/* ── 2. Le lien de l'offre ── */}
        {lien.on && (
          <div style={lien.style}>
            <Title t={t} t0={X.lien[0] + 0.15} out={X.lien[1] - 0.25} a="2. Le lien de l'offre" b="n'importe quel site" />
            <div style={card({ left: CX - 450, top: 820, width: 900, height: 150, borderRadius: 75, display: "flex", alignItems: "center", gap: 22, padding: "0 40px", transform: `scale(${bounce(t, [[X.lien[0] + 0.1, 0.8], [X.lien[0] + 0.45, 1]])})`, boxShadow: `0 0 0 3px ${PINK_L}, 0 0 60px rgba(217,130,139,0.4), 0 40px 100px rgba(0,0,0,0.5)` })}>
              <div style={{ fontSize: 48 }}>🔗</div>
              <div style={{ fontSize: 42, fontWeight: 600, whiteSpace: "nowrap", flex: 1, overflow: "hidden" }}><TextDrop t={t} t0={3.95} text="…/offre/manager-ventes" by="chars" from={[0, 18]} stagger={0.032} dur={0.14} /></div>
              <Check k={go(t, 4.75, 5.05, 0, 1)} />
            </div>
          </div>
        )}

        {/* ── 3. Générer → anneau 30 s ── */}
        {gen.on && (
          <div style={gen.style}>
            <Title t={t} t0={X.gen[0] + 0.15} out={X.gen[1] - 0.25} a="3. Générer." b={t > 6.3 ? "30 secondes*" : undefined} />
            {t < 6.45 && (
              <div style={{ position: "absolute", left: CX - 330, top: 1100, width: 660, height: 170, borderRadius: 85, background: PINK, color: "#fff", fontSize: 64, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${lerp(30, 100, pPress)}px rgba(217,130,139,0.7)`, transform: `scale(${bounce(t, [[X.gen[0] + 0.1, 0.6], [X.gen[0] + 0.45, 1]]) * press(t, EX.clicGen) * lerp(1, 0.2, ease(t, 6.1, 6.45))})`, opacity: 1 - seg(t, 6.3, 6.45) }}>
                Générer ✦
              </div>
            )}
            <Ripple x={CX} y={1185} t={t} t0={EX.clicGen} />
            {t > 6.15 && (
              <div style={{ position: "absolute", left: CX - 260, top: 1040 - 260, width: 520, height: 520, transform: `scale(${bounce(t, [[6.15, 0.3], [6.55, 1]])})` }}>
                <svg width={520} height={520} viewBox="0 0 520 520" style={{ position: "absolute", inset: 0 }}>
                  <circle cx={260} cy={260} r={225} fill="none" stroke={DARK.card} strokeWidth={38} />
                  <circle cx={260} cy={260} r={225} fill="none" stroke={PINK} strokeWidth={38} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 225 * ring} ${2 * Math.PI * 225}`} transform="rotate(-90 260 260)" style={{ filter: "drop-shadow(0 0 16px rgba(217,130,139,0.7))" }} />
                </svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ fontSize: 170, fontWeight: 800, letterSpacing: -5, lineHeight: 1, fontVariantNumeric: "tabular-nums", transform: `scale(${bounce(t, [[7.95, 1.12], [8.25, 1]])})` }}>{Math.round(30 * ring)}<span style={{ fontSize: 76, color: DARK.soft }}> s*</span></div>
                  <div style={{ fontSize: 34, fontWeight: 600, color: DARK.soft, marginTop: 8 }}>{ring < 1 ? "ta lettre s'écrit…" : "prête ✓"}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 4. La lettre, le logo se pose ── */}
        {lettre.on && (
          <div style={lettre.style}>
            <Title t={t} t0={X.lettre[0] + 0.15} out={X.lettre[1] - 0.25} a="Sur-mesure." b="avec son logo" />
            <div style={card({ left: CX - 330, top: 520, width: 660, height: 880, background: "#fff", color: "#1D1D1F", padding: 46, transform: `scale(${bounce(t, [[X.lettre[0] + 0.1, 0.85], [X.lettre[0] + 0.45, 1]])})` })}>
              <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                <div style={{ width: 104, height: 104, borderRadius: 24, border: "3px dashed #D2D2D7", position: "relative" }}>
                  {t > EX.logo - 0.45 && <Img src={staticFile("company.png")} style={{ position: "absolute", left: -3, top: -3, width: 104, height: 104, borderRadius: 22, transform: `translate(${lerp(420, 0, ease(t, EX.logo - 0.45, EX.logo))}px, ${lerp(-320, 0, ease(t, EX.logo - 0.45, EX.logo))}px) scale(${bounce(t, [[EX.logo - 0.45, 1.7], [EX.logo, 1]])})`, boxShadow: `0 0 ${40 * pulse(t, EX.logo + 0.15, 0.25)}px ${PINK}` }} />}
                </div>
                <div><div style={{ fontSize: 36, fontWeight: 800 }}>Maison Lumen</div><div style={{ fontSize: 26, color: "#86868B", fontWeight: 600 }}>Manager des ventes · Lyon</div></div>
              </div>
              {[92, 86, 95, 70, 0, 90, 84, 93, 62, 0, 88, 79, 45].map((w, i) => (
                <div key={i} style={{ marginTop: w ? 20 : 26, height: w ? 16 : 0, borderRadius: 8, width: `${w}%`, background: i === 0 ? "#F2C9CE" : "#E3E3E8", transform: `scaleX(${go(t, X.lettre[0] + 0.3 + i * 0.05, X.lettre[0] + 0.6 + i * 0.05, 0, 1)})`, transformOrigin: "0 50%" }} />
              ))}
            </div>
          </div>
        )}

        {/* ── 5. 20 min* vs 30 s ── */}
        {temps.on && (
          <div style={temps.style}>
            <Title t={t} t0={X.temps[0] + 0.15} out={X.temps[1] - 0.25} a="19 min gagnées*" b="à chaque lettre" />
            {[["Chatbot IA", "≈ 20 min*", 1, DARK.soft, X.temps[0] + 0.35], ["MyMotiv", "30 s", 0.025, PINK, X.temps[0] + 0.7]].map(([n, v, w, col, a], i) => (
              <div key={String(n)} style={{ position: "absolute", left: 110, right: 110, top: 720 + i * 260 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 44, fontWeight: 700 }}><span style={{ color: i ? PINK : DARK.ink }}>{n}</span><span style={{ color: col as string }}><TextDrop t={t} t0={(a as number) + 0.35} text={v as string} by="chars" from={[0, 20]} stagger={0.03} dur={0.15} /></span></div>
                <div style={{ marginTop: 20, height: 60, borderRadius: 30, background: DARK.card, overflow: "hidden" }}>
                  <div style={{ width: `${Math.max(3, (w as number) * 100) * ease(t, a as number, (a as number) + 0.6)}%`, height: "100%", borderRadius: 30, background: col as string, boxShadow: i ? `0 0 30px ${PINK}` : "none" }} />
                </div>
              </div>
            ))}
            <div style={{ position: "absolute", left: 60, right: 60, top: 1280, textAlign: "center", fontSize: 26, color: DARK.soft, fontFamily: "Open Sans", lineHeight: 1.5 }}>* Chatbot : estimation de 20 à 40 min par lettre personnalisée.<br />MyMotiv : temps mesuré, 27 à 35 s par lettre.</div>
          </div>
        )}

        {/* ── 6. Moins qu'un café ── */}
        {cafe.on && (
          <div style={cafe.style}>
            <Title t={t} t0={X.cafe[0] + 0.15} out={X.cafe[1] - 0.25} a="0,99 € la lettre." b="moins qu'un café" />
            <svg width={420} height={420} viewBox="0 0 200 200" style={{ position: "absolute", left: CX - 210, top: 650, transform: `scale(${bounce(t, [[X.cafe[0] + 0.25, 0.4], [X.cafe[0] + 0.6, 1]])}) rotate(${Math.sin(t * 3) * 2}deg)` }}>
              {[0, 1, 2].map((i) => <path key={i} d={`M ${78 + i * 22} 58 C ${70 + i * 22} 44, ${88 + i * 22} 36, ${80 + i * 22} 20`} fill="none" stroke={PINK_L} strokeWidth={5} strokeLinecap="round" opacity={0.35 + 0.35 * Math.sin(t * 4 + i)} />)}
              <path d="M 45 70 L 155 70 L 145 160 Q 143 175 128 175 L 72 175 Q 57 175 55 160 Z" fill={DARK.card} stroke={PINK} strokeWidth={6} strokeLinejoin="round" />
              <path d="M 152 88 Q 182 92 176 118 Q 170 140 146 136" fill="none" stroke={PINK} strokeWidth={6} strokeLinecap="round" />
              <text x={100} y={132} textAnchor="middle" fontFamily="Poppins" fontWeight={800} fontSize={30} fill={PINK_L}>mm.</text>
            </svg>
            <div style={{ position: "absolute", left: CX - 230, top: 1110, width: 460, height: 150, borderRadius: 75, background: PINK, color: "#fff", fontSize: 76, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${bounce(t, [[X.cafe[0] + 0.55, 0], [X.cafe[0] + 0.9, 1]])}) rotate(-4deg)`, boxShadow: "0 0 60px rgba(217,130,139,0.55)" }}>
              <TextDrop t={t} t0={X.cafe[0] + 0.7} text="0,99 €" by="chars" from={[0, 30]} stagger={0.04} dur={0.18} />
            </div>
          </div>
        )}

        {/* ── 7. La preuve : Léni ── */}
        {leni.on && (
          <div style={leni.style}>
            <Title t={t} t0={X.leni[0] + 0.15} out={X.leni[1] - 0.25} a="Et des entretiens ?" />
            <div style={card({ left: CX - 420, top: 560, width: 840, height: 700, padding: 56, transform: `scale(${bounce(t, [[X.leni[0] + 0.2, 0.85], [X.leni[0] + 0.55, 1]])})` })}>
              <div style={{ fontSize: 44, fontWeight: 800 }}>Léni S.</div>
              <div style={{ fontSize: 28, color: DARK.soft, fontWeight: 600, marginTop: 4 }}>Témoignage réel</div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 70 }}>
                {[["11", "candidatures", X.leni[0] + 0.5], ["7", "entretiens", X.leni[0] + 0.95]].map(([n, l, a], i) => (
                  <React.Fragment key={String(l)}>
                    {i === 1 && <div style={{ fontSize: 80, color: PINK, fontWeight: 800, opacity: seg(t, X.leni[0] + 0.75, X.leni[0] + 0.9) }}>→</div>}
                    <div style={{ textAlign: "center", transform: `scale(${bounce(t, [[a as number, 0], [(a as number) + 0.35, 1]])})` }}>
                      <div style={{ fontSize: 170, fontWeight: 800, lineHeight: 1, color: i ? PINK : DARK.ink, textShadow: i ? "0 0 50px rgba(217,130,139,0.5)" : "none" }}>{n}</div>
                      <div style={{ fontSize: 36, fontWeight: 600, color: DARK.soft }}>{l}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div style={{ position: "absolute", left: 56, right: 56, bottom: 48, fontSize: 26, color: DARK.soft, fontFamily: "Open Sans", textAlign: "center", opacity: seg(t, X.leni[0] + 0.6, X.leni[0] + 0.9) }}>Témoignage réel · résultats individuels non garantis</div>
            </div>
          </div>
        )}

        {/* ── 8. Sans stress ── */}
        {stress.on && (
          <div style={stress.style}>
            <div style={{ position: "absolute", left: 40, right: 40, top: 640, textAlign: "center", fontSize: 92, fontWeight: 800, lineHeight: 1.12, letterSpacing: -2 }}>
              <TextDrop t={t} t0={X.stress[0] + 0.1} text="Sans stress." by="chars" from={[0, -40]} stagger={0.035} dur={0.2} /><br />
              <span style={{ color: PINK }}><TextDrop t={t} t0={X.stress[0] + 0.6} text="Sans être un pro" by="chars" from={[0, -40]} stagger={0.03} dur={0.2} /><br /><TextDrop t={t} t0={X.stress[0] + 1.1} text="du recrutement." by="chars" from={[0, -40]} stagger={0.03} dur={0.2} /></span>
            </div>
          </div>
        )}
      </div>

      {/* curseur MyMotiv */}
      {pO > 0 && <Pointer x={px} y={py} hover={pHover} press={pPress} o={pO} />}

      {/* ── fin ── */}
      {t > X.end[0] - 0.05 && (
        <div style={{ position: "absolute", inset: 0, opacity: ease(t, X.end[0], X.end[0] + 0.5) }}>
          <Bubbles t={t} t0={X.end[0]} />
          <Horizon k={ease(t, X.end[0] + 0.1, X.end[0] + 0.6)} y={1035} />
          <div style={{ position: "absolute", left: CX - 60, top: 640, transform: `scale(${bounce(t, [[X.end[0] + 0.2, 0], [X.end[0] + 0.55, 1]])})` }}><AppIcon size={120} /></div>
          <div style={{ position: "absolute", left: CX - 330, top: 820 }}>
            <GlossPill scale={bounce(t, [[X.end[0], 0.6], [X.end[0] + 0.35, 1]])}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 430, opacity: seg(t, X.end[0] + 0.15, X.end[0] + 0.35) }} /></GlossPill>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", fontSize: 46, fontWeight: 800, color: PINK_L }}>
            <TextDrop t={t} t0={X.end[0] + 0.5} text="Ta 1re lettre est offerte" by="chars" from={[0, 20]} stagger={0.025} dur={0.2} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center", fontSize: 40, fontWeight: 700, color: DARK.soft }}>
            <TextDrop t={t} t0={X.end[0] + 1.2} text="Lien en bio ↑" from={[0, 30]} />
          </div>
        </div>
      )}
      <Flash k={flashK} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
