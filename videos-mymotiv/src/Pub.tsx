// Publicité « Ta lettre parle d'eux. » (24 s) — épurée et rythmée : typographie calée sur le tempo (120 BPM, 1 temps = 0,5 s).
// Noir, blanc, rose ; une police (Poppins). Le cliché « Madame, Monsieur… » barré → le recruteur cherche SON nom, SES mots →
// un lien, le logo, ses mots-clés → la lettre qui parle d'eux → une offre, sa lettre → première lettre offerte.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { BG, PINK, PINK_L, WHITE, W, lerp, seg, easeIn, easeInOut } from "./common";
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


// ───────── Les 3 étapes (2 s chacune) : 1. Ton CV · 2. Le lien de l'offre · 3. Générer ─────────
const STEP_NAMES = ["Ton CV", "Le lien de l'offre", "Générer"];
const Panel: React.FC<{ children: React.ReactNode; k: number }> = ({ children, k }) => (
  <div style={{ position: "absolute", left: 90, top: 700, width: 900, height: 560, borderRadius: 36, background: "#151215", border: "2px solid #2e2830", boxSizing: "border-box", padding: 50, opacity: k, transform: `translateY(${(1 - k) * 40}px)`, fontFamily: "Poppins", color: WHITE }}>{children}</div>
);
const Steps: React.FC<{ t: number; beat: number }> = ({ t, beat }) => {
  const step = Math.min(2, Math.floor((beat - 18) / 4)), b0 = 18 + step * 4, k = easeOutExpo(seg(t, b0 * BEAT, b0 * BEAT + 0.3));
  const at = (b: number) => t >= b * BEAT;
  return (
    <>
      {/* repère toujours visible : 1 · 2 · 3 */}
      <div style={{ position: "absolute", top: 230, left: 0, width: W, display: "flex", justifyContent: "center", gap: 26 }}>
        {STEP_NAMES.map((n, i) => (
          <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderRadius: 40, border: `3px solid ${i <= step ? PINK : "#3a333c"}`, background: i === step ? "rgba(217,130,139,0.18)" : "transparent", fontFamily: "Poppins", fontWeight: 600, fontSize: 30, color: i <= step ? WHITE : "#6f6a72" }}>
            <span style={{ width: 44, height: 44, borderRadius: "50%", background: i < step ? PINK : i === step ? PINK : "#2a252c", color: "#2e1f22", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{i < step ? "✓" : i + 1}</span>{n}
          </div>
        ))}
      </div>
      <Word t={t} b={b0} y={520} size={110} color={WHITE}><span style={{ color: PINK }}>{step + 1}.</span> {STEP_NAMES[step]}</Word>
      {step === 0 && (
        <Panel k={k}>
          <div style={{ fontWeight: 600, fontSize: 40, color: PINK_L }}>Votre CV</div>
          <div style={{ marginTop: 30, height: 200, borderRadius: 24, border: `3px dashed ${at(19.5) ? PINK : "#4a434c"}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, fontSize: 40, fontWeight: 600, color: at(19.5) ? WHITE : "#8d8890", background: at(19.5) ? "rgba(217,130,139,0.1)" : "transparent" }}>
            {at(19.5) ? <><span style={{ width: 54, height: 68, borderRadius: 8, background: PINK, display: "inline-block" }} />CV_Ines_Martin.pdf <span style={{ color: "#7fd6a4" }}>✓</span></> : "Ajouter un CV"}
          </div>
          {at(20) && [88, 74, 82].map((w2, i) => <div key={i} style={{ height: 16, borderRadius: 8, background: "#2e282f", marginTop: i ? 18 : 34, width: `${w2 * easeOutExpo(seg(t, (20 + i * 0.4) * BEAT, (20 + i * 0.4) * BEAT + 0.3))}%` }} />)}
          {/* le fichier qui tombe dans la zone */}
          {t >= 18.6 * BEAT && t < 19.5 * BEAT && (() => { const q = easeIn(seg(t, 18.6 * BEAT, 19.5 * BEAT)); return <div style={{ position: "absolute", left: 400, top: lerp(-500, 110, q), width: 100, height: 128, borderRadius: 12, background: PINK, transform: `rotate(${(1 - q) * -20}deg)`, boxShadow: `0 0 40px ${PINK}` }} />; })()}
        </Panel>
      )}
      {step === 1 && (
        <Panel k={k}>
          <div style={{ fontWeight: 600, fontSize: 40, color: PINK_L }}>L'offre d'emploi</div>
          <div style={{ marginTop: 30, height: 110, borderRadius: 22, border: `3px solid ${at(23) ? PINK : "#4a434c"}`, display: "flex", alignItems: "center", padding: "0 30px", fontFamily: "Open Sans", fontWeight: 600, fontSize: 34, color: at(23) ? WHITE : "#6f6a72", overflow: "hidden", whiteSpace: "nowrap" }}>
            {at(23) ? "carrieres.maison-lumen.fr/offre/alternance" : "Collez le lien de l'offre"}
          </div>
          <div style={{ marginTop: 26, height: 100, borderRadius: 22, background: at(24) ? PINK : "#3a2f36", color: at(24) ? "#2e1f22" : WHITE, border: `3px solid ${PINK}`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: 40, transform: `scale(${t >= 24 * BEAT && t < 24 * BEAT + 0.12 ? 0.95 : 1})` }}>{at(24.6) ? "✓ Offre lue" : "Lire l'offre"}</div>
          {at(25) && <div style={{ position: "absolute", left: 50, bottom: -170, right: 50, display: "flex", alignItems: "center", gap: 24, padding: "22px 30px", borderRadius: 26, background: "rgba(217,130,139,0.14)", border: `3px solid ${PINK}`, opacity: punch(t, 25).o, transform: `scale(${punch(t, 25).s})` }}>
            <CoLogo k="lumen" size={90} /><div><div style={{ fontWeight: 700, fontSize: 38 }}>Maison Lumen</div><div style={{ fontFamily: "Open Sans", fontSize: 28, color: PINK_L }}>✓ Site et logo trouvés</div></div>
          </div>}
        </Panel>
      )}
      {step === 2 && (() => {
        const fill = easeInOut(seg(t, 27 * BEAT, 29.6 * BEAT)), lbl = fill < 0.33 ? "Analyse de l'offre…" : fill < 0.66 ? "Rédaction…" : fill < 1 ? "Relecture…" : "✓ Lettre prête";
        return (
          <Panel k={k}>
            <div style={{ fontWeight: 600, fontSize: 40, color: PINK_L }}>Votre lettre</div>
            <div style={{ position: "relative", marginTop: 40, height: 140, borderRadius: 70, background: "#3a2f36", overflow: "hidden", transform: `scale(${t >= 27 * BEAT && t < 27 * BEAT + 0.12 ? 0.95 : 1})`, border: `3px solid ${PINK}` }}>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, background: `linear-gradient(90deg, ${PINK}, ${PINK_L})` }} />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 48, color: fill > 0.45 ? "#2e1f22" : WHITE }}>{at(27) ? `${Math.round(fill * 100)} %` : "Générer ma lettre"}</div>
            </div>
            <div style={{ marginTop: 40, textAlign: "center", fontFamily: "Open Sans", fontWeight: 600, fontSize: 38, color: fill >= 1 ? "#7fd6a4" : "#cfc6c9", opacity: at(27) ? 1 : 0 }}>{lbl}</div>
          </Panel>
        );
      })()}
    </>
  );
};

const CLICHE = ["Madame,", "Monsieur,", "je me permets", "de vous adresser", "ma candidature", "pour le poste…"];

export const Pub: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps, beat = Math.floor(t / BEAT);
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
      {/* 6–9 s : le recruteur cherche SON nom, SES mots */}
      {between(t, 12, 14) && <>
        <Word t={t} b={12} y={860} size={120}>Le recruteur,</Word>
        {beat >= 13 && <Word t={t} b={13} y={1010} size={120} color="#bdb6bf">lui, cherche…</Word>}
      </>}
      {between(t, 14, 16) && <Word t={t} b={14} size={190}>SON <span style={{ color: PINK }}>nom.</span></Word>}
      {between(t, 16, 18) && <Word t={t} b={16} size={190}>SES <span style={{ color: PINK }}>mots.</span></Word>}
      {/* 9–15 s : les 3 étapes, une par une (2 s chacune) */}
      {between(t, 18, 30) && <Steps t={t} beat={beat} />}
      {/* 15–17 s : la lettre qui parle d'eux */}
      {between(t, 30, 38) && (() => {
        const k = easeOutExpo(seg(t, 30 * BEAT, 30 * BEAT + 0.3)), co = beat < 34 ? COS[0] : COS[[1, 2, 0, 1][Math.min(3, beat - 34)]];
        const swap = beat >= 34 ? punch(t, beat).s : 1;
        return <>
          <div style={{ position: "absolute", left: 540 - 300, top: 560, width: 600, height: 820, borderRadius: 22, background: "#fffdfd", color: "#2a2326", padding: 44, boxSizing: "border-box", transform: `scale(${lerp(0.7, 1, k) * swap})`, opacity: k, boxShadow: "0 0 80px rgba(217,130,139,0.35)" }}>
            <div style={{ position: "absolute", right: 36, top: 36 }}><CoLogo k={co.key} size={110} /></div>
            <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 38 }}>Inès Martin</div>
            <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 22, color: PINK, marginTop: 60 }}>Candidature — {co.name}</div>
            {[92, 84, 90, 76, 88].map((w2, i) => <div key={i} style={{ height: 14, borderRadius: 7, background: "#e3dbdd", marginTop: i ? 20 : 34, width: `${w2}%` }} />)}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 40 }}>{(beat < 34 ? ["retail", "Lyon", "réseaux sociaux", "équipe"] : co.kw).map((w2) => <span key={w2} style={{ padding: "8px 18px", borderRadius: 20, background: "rgba(217,130,139,0.2)", border: `2px solid ${PINK}`, fontFamily: "Poppins", fontWeight: 600, fontSize: 24, color: "#8a3f49" }}>{w2}</span>)}</div>
          </div>
          {beat < 34 && <Word t={t} b={30} y={300} size={96}>Ta lettre parle</Word>}
          {beat < 34 && beat >= 31 && <Word t={t} b={31} y={430} size={130} color={PINK}>d'eux.</Word>}
          {beat < 34 && beat >= 32 && <div style={{ position: "absolute", top: 1440, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "#cfc6c9", opacity: punch(t, 32).o }}>Leur logo · leurs mots-clés</div>}
          {beat >= 34 && <Word t={t} b={34} y={360} size={92}>Une offre.</Word>}
          {beat >= 35 && <Word t={t} b={35} y={1520} size={110} color={PINK}>Sa lettre.</Word>}
        </>;
      })()}
      {/* 19–24 s : fin */}
      {t >= 38 * BEAT && (() => {
        const pulse = 1 + 0.05 * Math.max(0, Math.sin((t - 43 * BEAT) * Math.PI * 2));
        return <>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: 540 - 260, top: 420, width: 520, transform: `scale(${punch(t, 38).s})`, opacity: punch(t, 38).o }} />
          {beat >= 40 && <Word t={t} b={40} y={820} size={96}>Ta première lettre</Word>}
          {beat >= 41 && <Word t={t} b={41} y={940} size={96} color={PINK}>est offerte.</Word>}
          {beat >= 42 && <div style={{ position: "absolute", left: 540 - 330, top: 1110, width: 660, height: 130, borderRadius: 65, background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 52, color: "#2e1f22", boxShadow: `0 0 ${30 + 500 * (pulse - 1)}px ${PINK}`, transform: `scale(${punch(t, 42).s * (beat >= 43 ? pulse : 1)})`, opacity: punch(t, 42).o }}>Générer ma lettre</div>}
          {beat >= 43 && <div style={{ position: "absolute", top: 1300, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "#cfc6c9", opacity: punch(t, 43).o }}>Lien en bio</div>}
        </>;
      })()}
      {/* liseré rose qui bat la mesure en bas de l'écran */}
      <div style={{ position: "absolute", left: 0, bottom: 0, height: 10, width: W * easeInOut(seg(t, 0, 24)), background: PINK, opacity: 0.85 }} />
      {/* petit flash blanc sur les temps forts */}
      {[8, 14, 18, 22, 26, 30, 38].map((b) => t >= b * BEAT && t < b * BEAT + 0.08 && <div key={b} style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${0.18 * (1 - (t - b * BEAT) / 0.08)})` }} />)}
      {/* coupure : 1 temps de noir total avant « Le recruteur » */}
      {between(t, 11, 12) && <div style={{ position: "absolute", inset: 0, background: BG }} />}
      <Audio src={staticFile("audio/pub.wav")} />
    </AbsoluteFill>
  );
};
