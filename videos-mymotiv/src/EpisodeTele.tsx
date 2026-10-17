// « Les Super-recrues · Épisode 1 » version TÉLÉ (≈49,6 s, 60 i/s, 9:16) : salon plongé dans le noir (dessiné en code,
// inspiré d'une vidéo de référence : télé murale, halo lumineux sur le mur, meuble bas), la télé s'allume tout en douceur,
// titre de la série sur l'écran, puis la caméra plonge dans l'écran jusqu'à ce que l'épisode remplisse tout le cadre
// (« mode cinéma ») ; à la fin, retour dans le salon et la télé s'éteint. L'épisode est le vrai composant EpisodeEntretien.
// Étalonnage « nuit Art déco » appliqué au rendu final (tools/lut-nuit-deco.py → public/lut/nuit-deco.cube).
// Son : synth_tele.py (télécommande, allumage, fanfare du titre, plongée, extinction) + bande-son de l'épisode.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PINK_L, clamp, easeInOut, lerp, rng, seg } from "./common";
import { ease, pulse } from "./motion";
import { CREAM, DECO, Fan, GOLD, GOLD_TXT, JOSEFIN } from "./SuperRecrues";
import { EpisodeEntretien, EPISODE1_DUR } from "./EpisodeEntretien";
import "./fonts";
import "./fontsDeco";

const INTRO = 2.75;                                 // l'épisode démarre à ce temps
export const TELE_DUR = INTRO + EPISODE1_DUR + 0.9;
const ON = 0.3, DIVE = [2.5, 3.45] as const;      // allumage, plongée dans l'écran
const BACK = [INTRO + EPISODE1_DUR - 1.95, INTRO + EPISODE1_DUR - 1.05] as const;   // retour dans le salon (sur le logo)
const OFF = INTRO + EPISODE1_DUR - 0.55;           // extinction
// écran de la télé (coordonnées du salon)
const TV = { x: 50, y: 600, w: 980, h: (980 * 9) / 16 };
const TVC = [TV.x + TV.w / 2, TV.y + TV.h / 2] as const;
const SD = 1920 / TV.h;                             // zoom qui fait remplir le cadre à l'écran
const EK = TV.h / 1920;                             // échelle de l'épisode dans l'écran

// ─── le salon ───
const Room: React.FC<{ light: number; glow: string }> = ({ light, glow }) => {
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #121019 0%, #0E0D13 60%, #0A090D 100%)" }} />
      {/* panneau à lattes en haut à droite */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 70, background: "linear-gradient(180deg, rgba(255,226,190,0.10), rgba(255,226,190,0))" }} />
      <div style={{ position: "absolute", left: 600, top: -40, width: 520, height: 560, opacity: 0.6 + light * 0.4,
        background: "repeating-linear-gradient(90deg, #1B1922 0px, #1B1922 16px, #0F0E13 16px, #0F0E13 26px)", maskImage: "linear-gradient(180deg, #000 60%, transparent)", WebkitMaskImage: "linear-gradient(180deg, #000 60%, transparent)" }} />
      {/* halo de la télé sur le mur (façon ambilight) */}
      <div style={{ position: "absolute", left: TV.x - 260, top: TV.y - 330, width: TV.w + 520, height: TV.h + 560, borderRadius: "40%", background: `radial-gradient(ellipse at 50% 50%, ${glow} 0%, rgba(0,0,0,0) 62%)`, opacity: light, filter: "blur(30px)", mixBlendMode: "screen" }} />
      <div style={{ position: "absolute", left: TV.x - 60, top: TV.y - 120, width: TV.w + 120, height: 200, background: `radial-gradient(ellipse at 50% 100%, ${glow} 0%, rgba(0,0,0,0) 70%)`, opacity: light * 0.9, filter: "blur(24px)", mixBlendMode: "screen" }} />
      {/* sol */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, bottom: 0, background: "linear-gradient(180deg, #0B0A0E, #050407)" }} />
      <div style={{ position: "absolute", left: 120, right: 120, top: 1560, height: 260, background: `radial-gradient(ellipse at 50% 0%, ${glow} 0%, rgba(0,0,0,0) 70%)`, opacity: light * 0.35, filter: "blur(20px)", mixBlendMode: "screen" }} />
      {/* meuble bas */}
      <div style={{ position: "absolute", left: 130, top: 1330, width: 820, height: 230, borderRadius: 6, background: `linear-gradient(180deg, rgb(${lerp(38, 92, light)},${lerp(37, 90, light)},${lerp(44, 104, light)}), rgb(${lerp(22, 52, light)},${lerp(21, 50, light)},${lerp(26, 60, light)}))`, boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 4, background: `rgba(255,255,255,${0.06 + light * 0.18})` }} />
        <div style={{ position: "absolute", left: 230, top: 50, width: 360, height: 92, borderRadius: 4, background: "#0A090C", boxShadow: "inset 0 6px 14px rgba(0,0,0,0.8)" }}>
          <div style={{ position: "absolute", left: 120, top: 38, width: 120, height: 24, borderRadius: 4, background: "#16151A" }} />
          <div style={{ position: "absolute", left: 176, top: 47, width: 6, height: 6, borderRadius: 3, background: "#5AA0FF", boxShadow: "0 0 8px #5AA0FF", opacity: 0.8 }} />
        </div>
        {[0, 1].map((i) => <div key={i} style={{ position: "absolute", left: i ? 610 : 20, top: 30, width: 190, height: 170, borderRadius: 3, border: "1px solid rgba(0,0,0,0.35)" }} />)}
      </div>
      {/* barre de son sur le meuble */}
      <div style={{ position: "absolute", left: 340, top: 1296, width: 400, height: 34, borderRadius: 8, background: "linear-gradient(180deg, #1C1B21, #0C0B0F)", boxShadow: `0 -2px 0 rgba(255,255,255,${0.04 + light * 0.1}) inset` }}>
        <div style={{ position: "absolute", left: 12, right: 12, top: 8, bottom: 8, borderRadius: 4, background: "repeating-linear-gradient(90deg, #121116 0 3px, #1F1E25 3px 5px)" }} />
      </div>
      {/* plante en ombre chinoise, éclairée par la télé sur la tranche */}
      <svg width={300} height={620} viewBox="0 0 300 620" style={{ position: "absolute", left: -20, top: 960, filter: `drop-shadow(3px -2px 0 rgba(${glow.slice(5, glow.lastIndexOf(","))},${0.25 + light * 0.4}))` }}>
        <path d="M95 520 L205 520 L190 615 L110 615 Z" fill="#141217" />
        {[[150, 520, 60, 120, -25], [150, 520, 220, 60, 20], [150, 520, 30, 260, -40], [150, 520, 260, 240, 35], [150, 520, 120, 20, -5], [150, 520, 200, 160, 15], [150, 520, 80, 300, -30]].map(([x0, y0, x1, y1], i) => (
          <path key={i} d={`M${x0} ${y0} Q${(x0 + x1) / 2 + (i % 2 ? 95 : -95)} ${(y0 + y1) / 2 - 20} ${x1} ${y1} Q${(x0 + x1) / 2 + (i % 2 ? 10 : -10)} ${(y0 + y1) / 2 + 60} ${x0} ${y0}`} fill="#0D0C10" />
        ))}
      </svg>
      {/* petit vase sur le meuble */}
      <div style={{ position: "absolute", left: 690, top: 1262, width: 70, height: 70, borderRadius: "50%", background: `radial-gradient(circle at 40% 30%, rgb(${lerp(70, 170, light)},${lerp(68, 165, light)},${lerp(72, 175, light)}), #1A191E 70%)` }} />
    </>
  );
};

// ─── ce qu'affiche la télé avant l'épisode : allumage puis titre de la série (format paysage, plein écran) ───
const TitleTV: React.FC<{ t: number }> = ({ t }) => {
  const bloom = ease(t, ON + 0.05, ON + 0.4);
  const line = seg(t, ON, ON + 0.12);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#030305" }}>
      {line > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: TV.h / 2 - (TV.h / 2) * bloom - 2, height: Math.max(4, TV.h * bloom), opacity: clamp(line * 2),
          background: `radial-gradient(ellipse at 50% 50%, rgba(255,240,220,${0.9 * (1 - bloom)}) 0%, rgba(0,0,0,0) 70%), linear-gradient(180deg, #1A1050 0%, #2A1460 45%, #0D0A2A 100%)` }}>
          {/* rayons Art déco */}
          <div style={{ position: "absolute", inset: 0, opacity: 0.5 * bloom, background: `repeating-conic-gradient(from -90deg at 50% 118%, rgba(217,178,111,0.16) 0deg 3deg, rgba(0,0,0,0) 3deg 9deg)` }} />
          {/* silhouette de ville en bas */}
          <svg width={TV.w} height={TV.h} style={{ position: "absolute", left: 0, top: 0, opacity: bloom }}>
            {Array.from({ length: 22 }, (_, i) => { const rr = rng(i + 40); const w = 30 + rr() * 50, h = 60 + rr() * 170, x = i * 46 - 10;
              return <g key={i}><rect x={x} y={TV.h - h} width={w} height={h} fill="#090620" />{Array.from({ length: 8 }, (_, j) => <rect key={j} x={x + 6 + (j % 3) * 10} y={TV.h - h + 12 + Math.floor(j / 3) * 18} width={4} height={6} fill="#F2C46D" opacity={rr() < 0.6 ? 0.85 : 0} />)}</g>; })}
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, paddingBottom: 60 }}>
            <div style={{ opacity: seg(t, 0.95, 1.25), transform: `translateY(${(1 - ease(t, 0.95, 1.3)) * 10}px)` }}><Fan size={110} /></div>
            <div style={{ fontFamily: JOSEFIN, fontWeight: 700, fontSize: 22, letterSpacing: 9, color: CREAM, opacity: seg(t, 0.95, 1.3) }}>MYMOTIV PRÉSENTE</div>
            <div style={{ position: "relative", fontFamily: DECO, fontSize: 82, lineHeight: 1.05, ...GOLD_TXT, clipPath: `inset(0 ${(1 - ease(t, 1.3, 1.95)) * 100}% 0 0)`, filter: "drop-shadow(0 4px 14px rgba(0,0,0,0.8))" }}>LES SUPER-RECRUES</div>
            <div style={{ fontFamily: JOSEFIN, fontWeight: 700, fontSize: 26, letterSpacing: 8, color: PINK_L, opacity: seg(t, 1.85, 2.15) }}>ÉPISODE 1 · L'ENTRETIEN</div>
          </div>
          {/* reflet qui balaie le titre */}
          <div style={{ position: "absolute", top: 0, bottom: 0, width: 140, left: lerp(-200, TV.w + 60, seg(t, 2.0, 2.5)), background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,246,220,0.35), rgba(255,255,255,0))", transform: "skewX(-20deg)" }} />
        </div>
      )}
    </div>
  );
};

// ─── l'épisode dans l'écran : l'image verticale au centre + un fond flou du même plan pour remplir les bords ───
const EpisodeInTV: React.FC<{ fill: boolean }> = ({ fill }) => (
  <>
    {fill && (
      <div style={{ position: "absolute", left: (TV.w - 1080 * (TV.w / 1080)) / 2, top: (TV.h - 1920 * (TV.w / 1080)) / 2, width: 1080, height: 1920, transformOrigin: "0 0", transform: `scale(${TV.w / 1080})`, filter: "blur(28px) brightness(0.55) saturate(1.2)" }}>
        <EpisodeEntretien muted />
      </div>
    )}
    <div style={{ position: "absolute", left: (TV.w - 1080 * EK) / 2, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `scale(${EK})`, boxShadow: "0 0 60px rgba(0,0,0,0.6)" }}>
      <EpisodeEntretien muted />
    </div>
  </>
);

export const EpisodeTele: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const inside = t >= DIVE[1] && t < BACK[0];       // plein cadre : l'épisode seul, net
  // caméra : léger travelling avant, plongée, retour
  const kIn = easeInOut(seg(t, DIVE[0], DIVE[1])), kOut = easeInOut(seg(t, BACK[0], BACK[1]));
  const k = t < BACK[0] ? kIn : 1 - kOut;
  const drift = 1 + 0.035 * seg(t, 0, DIVE[0]) + 0.02 * seg(t, BACK[1], TELE_DUR);
  const s = lerp(drift, SD, Math.pow(k, 1.15));
  const cy = lerp(960, TVC[1], k), cx = TVC[0];
  const blurMove = Math.sin(Math.PI * seg(t, DIVE[0], DIVE[1])) * 5 + Math.sin(Math.PI * seg(t, BACK[0], BACK[1])) * 5;
  // lumière de l'écran (pour le halo et la pièce)
  const offK = seg(t, OFF, OFF + 0.35);
  const light = clamp(ease(t, ON + 0.05, ON + 0.5) * 0.85 + pulse(t, ON + 0.12, 0.08) * 0.5) * (1 - offK);
  const glow = t < INTRO + 1 ? "rgba(110,80,230,0.85)" : "rgba(150,70,170,0.85)";
  const showEp = t >= INTRO - 0.12;
  const epFade = clamp(seg(t, INTRO - 0.12, INTRO + 0.2));
  if (inside) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#000" }}>
        <Audio src={staticFile("audio/tele.wav")} />
        <Sequence from={Math.round(INTRO * fps)}><EpisodeEntretien muted /></Sequence>
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: "#000", overflow: "hidden" }}>
      <Audio src={staticFile("audio/tele.wav")} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${540 - cx * s}px, ${960 - cy * s}px) scale(${s})`, filter: `blur(${blurMove * (1 - k * 0.9)}px)` }}>
        <Room light={light} glow={glow} />
        {/* la télé */}
        <div style={{ position: "absolute", left: TV.x - 12, top: TV.y - 12, width: TV.w + 24, height: TV.h + 24, borderRadius: 10, background: "#060608", boxShadow: `0 0 0 1px rgba(255,255,255,0.06), 0 40px 80px rgba(0,0,0,${0.7 - light * 0.3})` }} />
        <div style={{ position: "absolute", left: TV.x, top: TV.y, width: TV.w, height: TV.h, overflow: "hidden", background: "#030305" }}>
          {t < INTRO + 0.25 && <TitleTV t={t} />}
          {showEp && (
            <div style={{ position: "absolute", inset: 0, opacity: epFade }}>
              <Sequence from={Math.round(INTRO * fps)} layout="none"><EpisodeInTV fill /></Sequence>
            </div>
          )}
          {/* extinction : l'image se resserre en une ligne puis un point */}
          {offK > 0 && (() => {
            const v = easeInOut(seg(t, OFF, OFF + 0.16)), h = easeInOut(seg(t, OFF + 0.14, OFF + 0.32));
            return (
              <>
                <div style={{ position: "absolute", inset: 0, background: "#030305", clipPath: `polygon(0 0, 100% 0, 100% ${v * 50}%, 0 ${v * 50}%)` }} />
                <div style={{ position: "absolute", inset: 0, background: "#030305", clipPath: `polygon(0 ${100 - v * 50}%, 100% ${100 - v * 50}%, 100% 100%, 0 100%)` }} />
                {v >= 1 && <div style={{ position: "absolute", left: 0, right: 0, top: TV.h / 2 - 2, height: 4, background: `rgba(255,255,255,${0.9 * (1 - h)})`, clipPath: `inset(0 ${h * 49.5}% 0 ${h * 49.5}%)`, boxShadow: "0 0 18px #fff" }} />}
              </>
            );
          })()}
          {/* reflet de la dalle */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0) 35%, rgba(255,255,255,0) 70%, rgba(255,255,255,0.04) 100%)", opacity: 1 - k }} />
        </div>
        {/* voyant de veille */}
        <div style={{ position: "absolute", left: TVC[0] - 4, top: TV.y + TV.h + 4, width: 8, height: 4, borderRadius: 2, background: "#FF3B30", opacity: t < ON || t > OFF + 0.3 ? 0.9 : 0, boxShadow: "0 0 6px #FF3B30" }} />
      </div>
      {/* vignette de cinéma */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.6) 100%)", opacity: 1 - k }} />
      {t < 0.2 && <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${1 - seg(t, 0, 0.2)})` }} />}
    </AbsoluteFill>
  );
};
