// « Le mot rouge », version cadrée pour TikTok (≈50 s, 30 i/s, 9:16). Même voix, même son et même déroulé que MotRouge.tsx,
// mais tout dans les zones sûres de src/tiktok.ts, texte pixel en gras ≥ 36 px, sous-titres de 60 px dans le tiers bas,
// moins d'éléments par écran (la version d'origine était illisible une fois postée).
import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import voix from "./data/motrouge-voix.json";
import { Ecran, GREY, ICON, INK, P, PINK, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { Big, HOT, MOTROUGE_DUR, MOTS, PULLUP, ROUGE } from "./MotRouge";
import { CAP_BOX, Ligne, X, deux } from "./pixelTT";
import { Recruteur } from "./fauxdmTT";

const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const Caption = makeCaption(voix, HOT, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : MOTROUGE_DUR + 1);
const contour = (w = 5): React.CSSProperties => ({ background: "transparent", color: W_, border: `${w}px solid ${W_}` });

// une ligne de la « mémoire » : bloc brouillé, ou le mot révélé
const Slot: React.FC<{ t: number; k: number; reveal?: boolean; q?: boolean }> = ({ t, k, reveal, q }) => (
  <div style={{ width: 640, height: 76, display: "flex", alignItems: "center", gap: 18, padding: "0 18px", border: `4px solid ${reveal ? RED : "#3A2C2C"}`, background: reveal ? RED : "rgba(20,12,12,0.92)" }}>
    <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 34, color: reveal ? W_ : GREY, width: 44 }}>{k + 1}.</span>
    {reveal ? <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 48, color: W_ }}>{MOTS[k]}</span>
      : <span style={{ display: "flex", gap: 6 }}>{Array.from({ length: 9 }, (_, j) => <span key={j} style={{ width: 36, height: 30, background: (Math.floor(t * 8) + j * 3 + k) % 4 ? "#4A3C3B" : "#2A2020" }} />)}</span>}
    {q && <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 48, color: RED, opacity: Math.floor(t * 3) % 2 ? 1 : 0.3, marginLeft: "auto" }}>?</span>}
  </div>
);
const Carres: React.FC<{ s: number; gap: number; big?: boolean }> = ({ s, gap, big }) => (
  <div style={{ display: "flex", gap }}>{MOTS.map((_, j) => <div key={j} style={{ width: s, height: s, background: j === ROUGE ? RED : "#4A3C3B", transform: big && j === ROUGE ? "scale(1.3)" : undefined, boxShadow: j === ROUGE ? "0 0 30px rgba(232,38,43,0.6)" : undefined }} />)}</div>
);
const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return (
    <>
      <P t={t} a={-0.2} x={X} y={470}><div style={{ textAlign: "center" }}><Pix rows={ICON.brain} px={16} style={{ margin: "0 auto 26px" }} /><Big text="PETIT TEST" size={92} /></div></P>
      <P t={t} a={at(5)} x={X} y={790}><Tag text="8 MOTS" red size={76} /></P>
      <P t={t} a={at(7)} x={X} y={950}><Tag text="RETIENS-LES." size={52} /></P>
      <P t={t} a={at(13)} x={X} y={1090}><Tag text="QUESTION À LA FIN ?" size={42} style={contour()} /></P>
    </>
  );
  if (scene(t, 1)) {
    let k = -1; MOTS.forEach((_, j) => { if (t >= at(16 + j)) k = j; });
    const red = k === ROUGE;
    return (
      <>
        {k >= 0 && <P key={k} t={t} a={at(16 + k)} x={X} y={red ? 620 : 680}>
          <div style={{ textAlign: "center" }}>
            {red && <div style={{ transform: `translateY(${Math.round(Math.abs(Math.sin((t - at(20)) * 5)) * 3) * -6}px)`, marginBottom: 24 }}><Pix rows={PULLUP} px={15} style={{ margin: "0 auto" }} /></div>}
            <div style={{ padding: "30px 40px", background: red ? RED : W_, border: `8px solid ${red ? W_ : INK}` }}><Big text={MOTS[k]} size={red ? 96 : 86} color={red ? W_ : INK} /></div>
          </div>
        </P>}
        <div style={{ position: "absolute", left: X - 292, top: 990, display: "flex", gap: 16 }}>
          {MOTS.map((_, j) => <div key={j} style={{ width: 59, height: 26, background: j <= k ? (j === ROUGE ? RED : W_) : "#3A2C2C" }} />)}
        </div>
        <P t={t} a={PH[1][0]} x={X} y={1090}><span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 42, color: GREY }}>{Math.max(1, k + 1)} / 8</span></P>
      </>
    );
  }
  if (scene(t, 2)) {
    const c0 = PH[2][1] + 0.1, n = 3 - Math.floor((t - c0) / 0.7);
    return (
      <>
        <P t={t} a={PH[2][0] - 0.1} x={X} y={380}><Tag text="QUESTION :" size={48} /></P>
        <P t={t} a={at(25)} x={X} y={560}><Big text="LE 3E MOT ?" size={92} color={RED} /></P>
        {t >= c0 && n >= 1 && <P key={n} t={t} a={c0 + (3 - n) * 0.7} x={X} y={900}><Big text={String(n)} size={280} /></P>}
      </>
    );
  }
  if (scene(t, 3)) return (
    <>{MOTS.map((_, k) => <P key={k} t={t} a={PH[3][0] - 0.1 + k * 0.05} x={X} y={420 + k * 92}><Slot t={t} k={k} reveal={k === ROUGE && t >= at(45)} q={k === 2} /></P>)}</>
  );
  if (scene(t, 4)) return (
    <>
      <P t={t} a={PH[4][0] - 0.1} x={X} y={600}>
        <Win title="MÉCANISME" w={800} ts={32}>
          <div style={{ fontFamily: PIX, fontSize: 34, color: GREY }}>NOM :</div>
          {t >= at(49) && <div style={{ fontFamily: PIX, fontWeight: 700, lineHeight: 1.05 }}><div style={{ fontSize: 60, color: W_ }}>L'EFFET</div><div style={{ fontSize: 68, color: RED }}>VON RESTORFF</div></div>}
          {t >= at(52) && <div style={{ marginTop: 18 }}><Tag text={"CE QUI DÉTONNE\n= CE QUI RESTE"} size={36} style={deux({ textAlign: "left" })} /></div>}
        </Win>
      </P>
      {t >= at(55) && <div style={{ position: "absolute", left: X, top: 940, transform: "translate(-50%, -50%)" }}><Carres s={72} gap={16} big={t >= at(61)} /></div>}
      <P t={t} a={at(61)} x={X} y={1080}><Tag text="RETENU" red size={44} /></P>
    </>
  );
  if (scene(t, 5)) return (
    <>
      {[3, 2, 1, 0].map((k) => <P key={k} t={t} a={at(75) + (3 - k) * 0.08} x={X + k * 18 - 27} y={560 + k * 18}>
        <Win title="LETTRE DE MOTIVATION" w={700} red={false} ts={28}>
          {k === 0 ? <><Ligne t={t} a={at(78)} text={"DYNAMIQUE, MOTIVÉ,"} size={38} /><Ligne t={t} a={at(80)} text="RIGOUREUX..." size={38} /></> : <div style={{ height: 150 }} />}
        </Win>
      </P>)}
      <P t={t} a={at(73)} x={X - 230} y={1000}><Recruteur zzz={t >= at(81)} /></P>
      <P t={t} a={at(81)} x={X + 150} y={1010}><Tag text={"TOUTES\nPAREILLES"} size={42} style={deux()} /></P>
    </>
  );
  if (scene(t, 6)) return (
    <>
      {[2, 1].map((k) => <div key={k} style={{ position: "absolute", left: X - 350 + k * 18, top: 360 + k * 18, opacity: 0.3 }}><Win title="LETTRE DE MOTIVATION" w={700} red={false} ts={28}><div style={{ height: 150 }} /></Win></div>)}
      <P t={t} a={at(88)} x={X} y={620}>
        <Win title="TA LETTRE" w={800} ts={32}>
          <Ligne t={t} a={at(91)} text={"UN DÉTAIL CONCRET\nSUR TOI"} red size={42} />
          <Ligne t={t} a={at(95)} text={"RELIÉ À CE QU'ILS\nCHERCHENT"} size={42} />
        </Win>
      </P>
      <P t={t} a={PH[6][0]} x={X - 230} y={1010}><Recruteur alerte={t >= at(88)} /></P>
      <P t={t} a={at(95)} x={X + 150} y={1020}><Tag text={"IL S'EN\nSOUVIENT"} red size={44} style={deux()} /></P>
    </>
  );
  if (scene(t, 7)) return (
    <>
      <P t={t} a={at(107)} x={X} y={400}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 540 }} /></P>
      <P t={t} a={at(108)} x={X} y={730}>
        <Win title="MYMOTIV" w={800} ts={32}>
          {([["LIEN DE L'OFFRE", 111], ["TON CV", 116], ["TA LETTRE SORT\nDE LA PILE", 120]] as const).map(([l, i]) => t >= at(i) && (
            <div key={l} style={{ display: "flex", gap: 18, fontFamily: PIX, fontWeight: 700, fontSize: 44, color: i === 120 ? RED : W_, margin: "12px 0", whiteSpace: "pre", lineHeight: 1.15 }}><span style={{ color: PINK }}>✓</span><span>{l}</span></div>
          ))}
        </Win>
      </P>
      <P t={t} a={at(120)} x={X} y={1090}><Carres s={54} gap={14} /></P>
    </>
  );
  if (scene(t, 8)) return (
    <>
      <P t={t} a={PH[8][0] - 0.05} x={X} y={500}>
        <Win title="COMMENTAIRE" w={800} red={false} ts={32}>
          <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 56, color: W_, marginBottom: 18 }}>LE 3E MOT :</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {Array.from({ length: 9 }, (_, j) => <span key={j} style={{ width: 44, height: 50, background: "#4A3C3B" }} />)}
            <span style={{ width: 20, height: 60, marginLeft: 10, background: RED, opacity: Math.floor(t * 2.5) % 2 ? 1 : 0 }} />
          </div>
        </Win>
      </P>
      <P t={t} a={at(132)} x={X} y={780}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Pix rows={ICON.eye} px={10} /><Tag text="SANS TRICHER" size={48} /></div></P>
      <P t={t} a={at(136)} x={X} y={940}><div style={{ padding: "16px 26px", background: PINK, fontFamily: PIX, fontWeight: 700, fontSize: 50, color: W_ }}>1RE LETTRE OFFERTE</div></P>
      <P t={t} a={at(140)} x={X} y={1085}><Tag text="LIEN EN BIO ↑" size={52} /></P>
    </>
  );
  return null;
};

export const MotRougeTikTok: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = (t > at(45) - 0.05 && t < at(45) + 0.2) || (t > at(20) && t < at(20) + 0.12);
  return <Ecran t={t} glitch={glitch} audio="audio/motrouge.wav" zoom={1} caption={scene(t, 1) ? null : <Caption t={t} />}><Scenes t={t} /></Ecran>;
};
