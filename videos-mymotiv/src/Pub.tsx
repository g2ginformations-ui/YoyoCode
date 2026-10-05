// Publicité « Ta lettre parle d'eux. » (23 s) — épurée et rythmée : typographie calée sur le tempo (120 BPM, 1 temps = 0,5 s).
// Noir, blanc, rose ; une police (Poppins). Le cliché « Madame, Monsieur… » barré → le recruteur cherche SON nom, SES mots →
// un lien, le logo, ses mots-clés → la lettre qui parle d'eux → une offre, sa lettre → première lettre offerte.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { BG, PINK, PINK_L, WHITE, W, lerp, seg, easeOut, easeInOut } from "./common";
import { CoLogo, COS } from "./Duel";

const BEAT = 0.5;
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
// « punch » : l'élément arrive pile sur le temps, légèrement plus grand puis se pose
const punch = (t: number, b: number) => { const k = easeOutExpo(seg(t, b * BEAT, b * BEAT + 0.22)); return { o: Math.min(1, k * 2), s: lerp(1.14, 1, k) }; };
const between = (t: number, b0: number, b1: number) => t >= b0 * BEAT && t < b1 * BEAT;

const Word: React.FC<{ t: number; b: number; children: React.ReactNode; size?: number; color?: string; y?: number; serif?: boolean }> = ({ t, b, children, size = 150, color = WHITE, y = 960, serif }) => {
  const p = punch(t, b);
  return <div style={{ position: "absolute", left: 0, width: W, top: y, transform: `translateY(-50%) scale(${p.s})`, opacity: p.o, textAlign: "center", fontFamily: serif ? "Liberation Serif, Georgia, serif" : "Poppins", fontWeight: serif ? 400 : 700, fontSize: size, letterSpacing: serif ? 0 : -3, lineHeight: 1.05, color }}>{children}</div>;
};

const CLICHE = ["Madame,", "Monsieur,", "je me permets", "de vous adresser", "ma candidature", "pour le poste…"];

export const Pub: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps, beat = Math.floor(t / BEAT);
  const KW: [string, number, number, number][] = [["retail", 24, 260, 640], ["Lyon", 25, 820, 760], ["réseaux sociaux", 26, 300, 1330], ["équipe", 27, 800, 1250]];
  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden" }}>
      {/* 0–4 s : le cliché, mot à mot, puis tout le paragraphe barré */}
      {between(t, 0, 6) && <Word t={t} b={beat} size={110} color="#8d8890" serif>{CLICHE[Math.min(5, beat)]}</Word>}
      {between(t, 6, 8) && (
        <div style={{ position: "absolute", left: 0, width: W, top: 960, transform: "translateY(-50%)", textAlign: "center", fontFamily: "Liberation Serif, Georgia, serif", fontSize: 76, lineHeight: 1.25, color: "#6f6a72", opacity: punch(t, 6).o }}>
          {CLICHE.map((l) => <div key={l}>{l}</div>)}
          <div style={{ position: "absolute", left: 140, top: "50%", height: 14, borderRadius: 7, background: PINK, width: 800 * easeOutExpo(seg(t, 7 * BEAT, 7 * BEAT + 0.25)), boxShadow: `0 0 30px ${PINK}`, transform: "rotate(-6deg)" }} />
        </div>
      )}
      {/* 4–6 s : tout le monde écrit ça. */}
      {between(t, 8, 11) && <>
        <Word t={t} b={8} y={820} size={130}>Tout le monde</Word>
        {beat >= 9 && <Word t={t} b={9} y={980} size={130}>écrit</Word>}
        {beat >= 10 && <Word t={t} b={10} y={1140} size={130} color={PINK}>ça.</Word>}
      </>}
      {/* 6–10 s : le recruteur cherche SON nom, SES mots */}
      {between(t, 12, 16) && <>
        <Word t={t} b={12} y={860} size={120}>Le recruteur,</Word>
        {beat >= 13 && <Word t={t} b={13} y={1010} size={120} color="#bdb6bf">lui, cherche…</Word>}
      </>}
      {between(t, 16, 18) && <Word t={t} b={16} size={190}>SON <span style={{ color: PINK }}>nom.</span></Word>}
      {between(t, 18, 20) && <Word t={t} b={18} size={190}>SES <span style={{ color: PINK }}>mots.</span></Word>}
      {/* 10–14 s : un lien → le logo → ses mots-clés */}
      {between(t, 20, 28) && (() => {
        const field = punch(t, 20), pasted = t >= 20.6 * BEAT, logoK = easeOutExpo(seg(t, 22 * BEAT, 22 * BEAT + 0.3)), out = seg(t, 22 * BEAT, 22 * BEAT + 0.2);
        return <>
          <div style={{ position: "absolute", left: 90, top: 900, width: 900, height: 120, borderRadius: 60, border: `3px solid ${pasted ? PINK : "#45404c"}`, background: "#141114", opacity: field.o * (1 - out), transform: `scale(${field.s})`, display: "flex", alignItems: "center", padding: "0 44px", boxSizing: "border-box", fontFamily: "Poppins", fontWeight: 600, fontSize: 34, color: pasted ? WHITE : "#6f6a72", whiteSpace: "nowrap", overflow: "hidden" }}>
            {pasted ? "carrieres.maison-lumen.fr/offre/…" : "Colle le lien de l'offre"}
            {t >= 21 * BEAT && <span style={{ marginLeft: "auto", padding: "10px 26px", borderRadius: 40, background: PINK, color: "#2e1f22", transform: `scale(${t < 21 * BEAT + 0.12 ? 0.9 : 1})` }}>Lire</span>}
          </div>
          {t >= 22 * BEAT && (
            <div style={{ position: "absolute", left: 540 - 130, top: 960 - 130, width: 260, height: 260, transform: `scale(${lerp(0.4, 1, logoK)})`, opacity: logoK, filter: `drop-shadow(0 0 ${60 * (1 - logoK) + 20}px rgba(217,130,139,0.7))` }}><CoLogo k="lumen" size={260} /></div>
          )}
          {t >= 22 * BEAT && <div style={{ position: "absolute", top: 1130, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: PINK_L, opacity: punch(t, 23).o }}>maison-lumen.fr ✓</div>}
          {KW.map(([w, b, x, y]) => beat >= b && <div key={w} style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${punch(t, b).s})`, opacity: punch(t, b).o, padding: "14px 30px", borderRadius: 40, border: `3px solid ${PINK}`, background: "rgba(217,130,139,0.15)", fontFamily: "Poppins", fontWeight: 700, fontSize: 48, color: WHITE, whiteSpace: "nowrap" }}>{w}</div>)}
        </>;
      })()}
      {/* 14–18 s : la lettre qui parle d'eux, puis une offre = sa lettre */}
      {between(t, 28, 36) && (() => {
        const k = easeOutExpo(seg(t, 28 * BEAT, 28 * BEAT + 0.3)), co = beat < 32 ? COS[0] : COS[[1, 2, 0, 1][Math.min(3, beat - 32)]];
        const swap = beat >= 32 ? punch(t, beat).s : 1;
        return <>
          <div style={{ position: "absolute", left: 540 - 300, top: 560, width: 600, height: 820, borderRadius: 22, background: "#fffdfd", color: "#2a2326", padding: 44, boxSizing: "border-box", transform: `scale(${lerp(0.7, 1, k) * swap})`, opacity: k, boxShadow: "0 0 80px rgba(217,130,139,0.35)" }}>
            <div style={{ position: "absolute", right: 36, top: 36 }}><CoLogo k={co.key} size={110} /></div>
            <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 38 }}>Inès Martin</div>
            <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 22, color: PINK, marginTop: 60 }}>Candidature — {co.name}</div>
            {[92, 84, 90, 76, 88].map((w2, i) => <div key={i} style={{ height: 14, borderRadius: 7, background: "#e3dbdd", marginTop: i ? 20 : 34, width: `${w2}%` }} />)}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40 }}>{(beat < 32 ? ["retail", "Lyon", "réseaux sociaux", "équipe"] : co.kw).map((w2) => <span key={w2} style={{ padding: "8px 18px", borderRadius: 20, background: "rgba(217,130,139,0.2)", border: `2px solid ${PINK}`, fontFamily: "Poppins", fontWeight: 600, fontSize: 24, color: "#8a3f49" }}>{w2}</span>)}</div>
          </div>
          {beat < 32 && <Word t={t} b={29} y={360} size={92}>Ta lettre parle</Word>}
          {beat < 32 && beat >= 30 && <Word t={t} b={30} y={1520} size={130} color={PINK}>d'eux.</Word>}
          {beat >= 32 && <Word t={t} b={32} y={360} size={92}>Une offre.</Word>}
          {beat >= 33 && <Word t={t} b={33} y={1520} size={110} color={PINK}>Sa lettre.</Word>}
        </>;
      })()}
      {/* 18–23 s : fin */}
      {t >= 36 * BEAT && (() => {
        const pulse = 1 + 0.05 * Math.max(0, Math.sin((t - 41 * BEAT) * Math.PI * 2));
        return <>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: 540 - 260, top: 420, width: 520, transform: `scale(${punch(t, 36).s})`, opacity: punch(t, 36).o }} />
          {beat >= 38 && <Word t={t} b={38} y={820} size={96}>Ta première lettre</Word>}
          {beat >= 39 && <Word t={t} b={39} y={940} size={96} color={PINK}>est offerte.</Word>}
          {beat >= 40 && <div style={{ position: "absolute", left: 540 - 330, top: 1110, width: 660, height: 130, borderRadius: 65, background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 52, color: "#2e1f22", boxShadow: `0 0 ${30 + 500 * (pulse - 1)}px ${PINK}`, transform: `scale(${punch(t, 40).s * (beat >= 41 ? pulse : 1)})`, opacity: punch(t, 40).o }}>Générer ma lettre</div>}
          {beat >= 41 && <div style={{ position: "absolute", top: 1300, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "#cfc6c9", opacity: punch(t, 41).o }}>Lien en bio</div>}
        </>;
      })()}
      {/* liseré rose qui bat la mesure en bas de l'écran */}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 10, width: W * easeInOut(seg(t, 0, 23)), background: PINK, opacity: 0.85 }} />
      {/* petit flash blanc sur les temps forts */}
      {[8, 16, 20, 28, 36].map((b) => t >= b * BEAT && t < b * BEAT + 0.08 && <div key={b} style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${0.18 * (1 - (t - b * BEAT) / 0.08)})` }} />)}
      {/* coupure : 1 temps de noir total avant « Le recruteur » */}
      {between(t, 11, 12) && <div style={{ position: "absolute", inset: 0, background: BG }} />}
      <Audio src={staticFile("audio/pub.wav")} />
    </AbsoluteFill>
  );
};
