// « MyMotiv, façon Apple » (10,5 s, 60 i/s, 9:16) — démo de la méthode .claude/skills/apple-motion :
// un rond (bouton rose + flèche) → s'étire en pilule « Ta lettre de motivation » (le bouton pousse le cadre) → appui →
// morphing en carte produit (la lettre, « Lettre sur-mesure », « dès 0,99 € », bouton « Générer ») → appui →
// morphing en pilule rose « Ta lettre est prête ✓ » → petite rotation d'ensemble → retour au rond → logo + slogan.
// Tout bouge avec le rebond d'inertie (src/apple.tsx), les éléments sont décalés de quelques centièmes de seconde.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { APPLE, TextDrop, bounce, curve, go, press, soft } from "./apple";
import { PINK, clamp, lerp, seg } from "./common";
import { SHOT } from "./Lien";
import "./fonts";

const CX = 540, CY = 960;
const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(",")})`;
};

export const AppleMyMotiv: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;

  // ── cadre blanc : rond → pilule → carte → (disparaît) ──
  const fw = bounce(t, [[0, 0], [0.45, 220], [1.2, 220], [1.6, 840], [2.7, 840], [3.15, 880], [4.6, 880], [5.05, 760]]);
  const fh = bounce(t, [[0, 0], [0.45, 220], [2.7, 220], [3.15, 1180], [4.6, 1180], [5.05, 200]]);
  const fOpacity = 1 - seg(t, 4.75, 5.05);
  const fRadius = fh > 420 ? 64 : Math.max(0, Math.min(fw, fh) / 2);

  // ── bouton : rond rose → pilule sombre « Générer » → pilule rose « prête » → rond → disparaît ──
  const k2 = go(t, 2.7, 3.15, 0, 1), k3 = go(t, 4.6, 5.05, 0, 1);
  let [bx, by] = [bounce(t, [[1.2, CX], [1.6, 855]]), CY];
  if (t >= 2.7) [bx, by] = curve(k2, [855, CY], [CX, 1440], [855, 1440]);
  if (t >= 4.6) [bx, by] = curve(k3, [CX, 1440], [CX, CY], [300, 1250]);
  const bw = bounce(t, [[0.1, 0], [0.55, 170], [2.7, 170], [3.15, 760], [4.6, 760], [5.05, 760], [7.6, 760], [8.0, 220], [8.25, 220], [8.55, 0]]);
  const bh = bounce(t, [[0.1, 0], [0.55, 170], [2.7, 170], [3.15, 150], [4.6, 150], [5.05, 200], [7.6, 200], [8.0, 220], [8.25, 220], [8.55, 0]]);
  const bColor = t < 4.6 ? mix(PINK, APPLE.dark, seg(t, 2.7, 3.0)) : mix(APPLE.dark, PINK, seg(t, 4.6, 4.9));
  const bScale = press(t, 2.5) * press(t, 4.4) * press(t, 7.4);
  const arrow = go(t, 0.2, 0.6, 0, 1) * (1 - seg(t, 2.7, 2.85));

  // ── la lettre (le « produit ») : arrive dans la carte, puis devient une miniature dans la pilule ──
  const aLeft = bounce(t, [[4.6, 140], [5.05, 192]]), aTop = t < 4.6 ? go(t, 2.85, 3.3, 560, 430) : bounce(t, [[4.6, 430], [5.05, CY - 75]]);
  const aScale = bounce(t, [[4.6, 1], [5.05, 0.29]]);
  const aOpacity = seg(t, 2.85, 3.05) * (1 - seg(t, 7.55, 7.75));

  // ── rotation d'ensemble (le « liant » de la fin du tutoriel) ──
  const rot = bounce(t, [[6.0, 0], [6.35, 3], [6.8, -2], [7.2, 0]]);
  const fx = CX - fw / 2, fy = CY - fh / 2 + (fh > 420 ? 0 : 0);
  const cardTop = CY - 590, cardLeft = CX - 440;
  const endK = soft(t, 8.25, fps);

  return (
    <AbsoluteFill style={{ background: APPLE.bg, fontFamily: "Poppins", color: APPLE.ink }}>
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${rot}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
        {/* cadre */}
        <div style={{ position: "absolute", left: fx, top: fy, width: fw, height: fh, borderRadius: fRadius, background: APPLE.card, opacity: fOpacity, boxShadow: "0 30px 80px rgba(0,0,0,0.08)" }} />
        {/* pilule 1 : « Ta lettre de motivation » */}
        {t > 1.3 && t < 3.0 && (
          <div style={{ position: "absolute", left: CX - 420 + 52, top: CY - 34, fontSize: 46, fontWeight: 600, overflow: "hidden", height: 72, width: 600 }}>
            <TextDrop t={t} t0={1.42} text="Ta lettre de motivation" from={[0, -70]} out={2.72} />
          </div>
        )}
        {/* carte : la lettre + titre + prix */}
        <div style={{ position: "absolute", left: aLeft, top: aTop, width: 360, height: 510, borderRadius: 22, overflow: "hidden", opacity: aOpacity, zIndex: t > 4.6 ? 3 : 1, transformOrigin: "0 0", transform: `scale(${aScale})`, boxShadow: "0 20px 50px rgba(0,0,0,0.12)", background: "#fff" }}>
          <Img src={SHOT("030-lettre")} style={{ position: "absolute", left: -46, top: -78, width: 452, height: 804 }} />
        </div>
        {t > 2.9 && t < 4.8 && (
          <>
            <div style={{ position: "absolute", left: cardLeft + 470, top: cardTop + 90, fontSize: 58, fontWeight: 700, lineHeight: 1.1, opacity: 1 - seg(t, 4.6, 4.75) }}>
              <TextDrop t={t} t0={3.05} text="Lettre" from={[-60, 0]} /><br />
              <TextDrop t={t} t0={3.12} text="sur-mesure" from={[-60, 0]} />
            </div>
            <div style={{ position: "absolute", left: cardLeft + 470, top: cardTop + 260, fontSize: 40, fontWeight: 600, color: APPLE.soft, opacity: 1 - seg(t, 4.6, 4.75) }}>
              <TextDrop t={t} t0={3.25} text="dès 0,99 €" by="chars" from={[90, 0]} stagger={0.03} />
            </div>
            <div style={{ position: "absolute", left: cardLeft + 470, top: cardTop + 330, fontSize: 30, fontWeight: 600, color: APPLE.soft, opacity: 1 - seg(t, 4.6, 4.75), lineHeight: 1.35 }}>
              <TextDrop t={t} t0={3.4} text="avec le logo" from={[0, 40]} /><br />
              <TextDrop t={t} t0={3.48} text="de l'entreprise" from={[0, 40]} />
            </div>
          </>
        )}
        {/* bouton */}
        <div style={{ position: "absolute", left: bx - bw / 2, top: by - bh / 2, width: bw, height: bh, borderRadius: bh / 2, background: bColor, transform: `scale(${bScale})`, zIndex: 2, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 14px 34px rgba(217,130,139,0.28)" }}>
          {arrow > 0.01 && (
            <svg width={70} height={70} viewBox="0 0 70 70" style={{ transform: `scale(${go(t, 0.3, 0.7, 0, 1)})`, opacity: 1 - seg(t, 2.7, 2.85) }}>
              <path d="M26 16 L46 35 L26 54" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {t > 3.0 && t < 4.75 && <div style={{ position: "absolute", color: "#fff", fontSize: 46, fontWeight: 600, opacity: 1 - seg(t, 4.55, 4.7) }}><TextDrop t={t} t0={3.1} text="Générer" from={[0, 60]} /></div>}
          {t > 4.85 && t < 7.75 && <div style={{ position: "absolute", left: 190, color: "#fff", fontSize: 48, fontWeight: 600, whiteSpace: "nowrap", opacity: 1 - seg(t, 7.55, 7.7) }}><TextDrop t={t} t0={4.95} text="Ta lettre est prête ✓" from={[0, 70]} /></div>}
        </div>
      </div>

      {/* fin : logo + slogan */}
      {t > 8.2 && (
        <>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: CX - 280, top: 780, width: 560, opacity: endK, transform: `translateY(${(1 - endK) * 40}px) scale(${lerp(0.92, 1, endK)})` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", fontSize: 46, fontWeight: 600, overflow: "hidden", height: 140 }}>
            <TextDrop t={t} t0={8.55} text="Avec MyMotiv, postulez." from={[0, -60]} /><br />
            <TextDrop t={t} t0={8.85} text="Et faites-vous recruter." from={[0, -60]} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontSize: 34, fontWeight: 600, color: PINK }}>
            <TextDrop t={t} t0={9.35} text="Ta 1re lettre est offerte · Lien en bio" by="chars" from={[0, 30]} stagger={0.012} />
          </div>
        </>
      )}
      <Audio src={staticFile("audio/apple-mymotiv.wav")} />
    </AbsoluteFill>
  );
};
