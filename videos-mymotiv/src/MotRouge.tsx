// « Le mot rouge » (≈50 s, 30 i/s, 9:16) — même univers pixel noir et rouge que FauxDM, autre axe : un test auquel on joue
// (« retiens ces 8 mots, je t'interroge à la fin »). Personne ne se souvient du 3e mot, tout le monde se souvient de
// « TRACTIONS » (le mot rouge, clin d'œil au recruteur qui fait des tractions) → effet Von Restorff : le cerveau garde ce
// qui détonne → une pile de lettres toutes pareilles → ta lettre doit être le mot rouge → MyMotiv (« la candidature qui
// sort de la pile ») → CTA : « dis-moi en commentaire le 3e mot, sans tricher » + 1re lettre offerte, lien en bio.
// Voix : voix-motrouge.json (--voix yann). Son : synth_motrouge.py. Éléments pixel importés de FauxDM.tsx.
import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import voix from "./data/motrouge-voix.json";
import { Ecran, GREY, ICON, INK, Line, P, PINK, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";

export const MOTROUGE_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
export const HOT = new Set(["test", "fin", "tractions", "troisieme", "mot", "restorff", "cerveau", "reste", "recruteur", "pareilles", "rouge", "concret",
  "mymotiv", "pile", "commentaire", "tricher", "offerte"]);
const Caption = makeCaption(voix, HOT);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : MOTROUGE_DUR + 1);

export const MOTS = ["DYNAMIQUE", "MOTIVÉ", "RIGOUREUX", "POLYVALENT", "TRACTIONS", "AUTONOME", "SÉRIEUX", "PASSIONNÉ"];
export const ROUGE = 4;                                                         // l'indice du mot rouge
export const PULLUP = [                                                         // petit bonhomme qui fait une traction
  "rrrrrrrrrrrrrr", ".w..........w.", ".w..........w.", "..w..wwww..w..", "...w.wwww.w...", "....wwwwww....", "....wwwwww....",
  ".....wwww.....", "....wwwwww....", "....wwwwww....", "....ww..ww....", "....ww..ww....",
];
export const Big: React.FC<{ text: string; size: number; color?: string }> = ({ text, size, color = W_ }) => (
  <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: size, color, lineHeight: 1, textAlign: "center" }}>{text}</div>
);
// une ligne de la « mémoire » : bloc gris brouillé, ou le mot révélé
const Slot: React.FC<{ t: number; k: number; reveal?: boolean; q?: boolean }> = ({ t, k, reveal, q }) => (
  <div style={{ width: 460, height: 58, display: "flex", alignItems: "center", gap: 14, padding: "0 14px", border: `3px solid ${reveal ? RED : "#3A2C2C"}`, background: reveal ? RED : "rgba(20,12,12,0.9)" }}>
    <span style={{ fontFamily: PIX, fontSize: 22, color: reveal ? W_ : GREY, width: 30 }}>{k + 1}.</span>
    {reveal ? <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 32, color: W_ }}>{MOTS[k]}</span>
      : <span style={{ display: "flex", gap: 4 }}>{Array.from({ length: 9 }, (_, j) => <span key={j} style={{ width: 26, height: 22, background: (Math.floor(t * 8) + j * 3 + k) % 4 ? "#4A3C3B" : "#2A2020" }} />)}</span>}
    {q && <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 32, color: RED, opacity: Math.floor(t * 3) % 2 ? 1 : 0.3, marginLeft: "auto" }}>?</span>}
  </div>
);

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  const C = 540, M = 980;
  if (scene(t, 0)) return (
    <>
      <P t={t} a={-0.2} x={C} y={M - 260}><div style={{ textAlign: "center" }}><Pix rows={ICON.brain} px={16} style={{ margin: "0 auto 26px" }} /><Big text="PETIT TEST" size={92} /></div></P>
      <P t={t} a={at(5)} x={C} y={M - 20}><Tag text="8 MOTS" red size={60} /></P>
      <P t={t} a={at(7)} x={C} y={M + 120}><Tag text="RETIENS-LES." size={34} /></P>
      <P t={t} a={at(13)} x={C} y={M + 240}><Tag text="QUESTION À LA FIN ?" size={30} style={{ background: "transparent", color: W_, border: `4px solid ${W_}` }} /></P>
    </>
  );
  if (scene(t, 1)) {
    let k = -1; MOTS.forEach((_, j) => { if (t >= at(16 + j)) k = j; });
    const red = k === ROUGE;
    return (
      <>
        {k >= 0 && <P key={k} t={t} a={at(16 + k)} x={C} y={M - 40}>
          <div style={{ textAlign: "center" }}>
            {red && <div style={{ transform: `translateY(${Math.round(Math.abs(Math.sin((t - at(20)) * 5)) * 3) * -6}px)`, marginBottom: 20 }}><Pix rows={PULLUP} px={12} style={{ margin: "0 auto" }} /></div>}
            <div style={{ padding: "26px 40px", background: red ? RED : W_, border: `6px solid ${red ? W_ : INK}` }}><Big text={MOTS[k]} size={red ? 84 : 72} color={red ? W_ : INK} /></div>
          </div>
        </P>}
        <div style={{ position: "absolute", left: C - 250, top: M + 250, display: "flex", gap: 12 }}>
          {MOTS.map((_, j) => <div key={j} style={{ width: 50, height: 22, background: j <= k ? (j === ROUGE ? RED : W_) : "#3A2C2C" }} />)}
        </div>
        <P t={t} a={PH[1][0]} x={C} y={M + 320}><span style={{ fontFamily: PIX, fontSize: 26, color: GREY }}>{Math.max(1, k + 1)} / 8</span></P>
      </>
    );
  }
  if (scene(t, 2)) {
    const c0 = PH[2][1] + 0.1, n = 3 - Math.floor((t - c0) / 0.7);
    return (
      <>
        <P t={t} a={PH[2][0] - 0.1} x={C} y={M - 280}><Tag text="QUESTION :" size={34} /></P>
        <P t={t} a={at(25)} x={C} y={M - 120}><Big text="LE 3E MOT ?" size={88} color={RED} /></P>
        {t >= c0 && n >= 1 && <P key={n} t={t} a={c0 + (3 - n) * 0.7} x={C} y={M + 170}><Big text={String(n)} size={220} /></P>}
      </>
    );
  }
  if (scene(t, 3)) return (
    <>
      {MOTS.map((_, k) => <P key={k} t={t} a={PH[3][0] - 0.1 + k * 0.05} x={C} y={M - 280 + k * 80}><Slot t={t} k={k} reveal={k === ROUGE && t >= at(45)} q={k === 2} /></P>)}
      <P t={t} a={at(32)} x={C + 330} y={M - 120}><Tag text="???" size={30} /></P>
    </>
  );
  if (scene(t, 4)) return (
    <>
      <P t={t} a={PH[4][0] - 0.1} x={C} y={M - 120}>
        <Win title="MÉCANISME" w={720}>
          <div style={{ fontFamily: PIX, fontSize: 26, color: GREY }}>NOM :</div>
          {t >= at(49) && <div style={{ fontFamily: PIX, fontWeight: 700, lineHeight: 1.05 }}><div style={{ fontSize: 44, color: W_ }}>L'EFFET</div><div style={{ fontSize: 60, color: RED }}>VON RESTORFF</div></div>}
          {t >= at(52) && <div style={{ marginTop: 14 }}><Tag text="CE QUI DÉTONNE = CE QUI RESTE" size={20} /></div>}
        </Win>
      </P>
      {t >= at(55) && <div style={{ position: "absolute", left: C - 286, top: M + 190, display: "flex", gap: 14 }}>
        {MOTS.map((_, j) => t >= at(55) + j * 0.06 && <div key={j} style={{ width: 58, height: 58, background: j === ROUGE ? RED : "#4A3C3B", transform: j === ROUGE && t >= at(61) ? "scale(1.25)" : undefined, boxShadow: j === ROUGE ? "0 0 30px rgba(232,38,43,0.6)" : undefined }} />)}
      </div>}
      <P t={t} a={at(61)} x={C} y={M + 350}><Tag text="RETENU" red size={26} /></P>
    </>
  );
  if (scene(t, 5)) return (
    <>
      {[4, 3, 2, 1, 0].map((k) => <P key={k} t={t} a={at(75) + (4 - k) * 0.08} x={C + 40 + k * 22} y={M - 130 + k * 22}>
        <Win title="LETTRE DE MOTIVATION" w={640} red={false}>
          {k === 0 ? <><Line t={t} a={at(78)} text="DYNAMIQUE, MOTIVÉ," size={24} /><br /><Line t={t} a={at(80)} text="RIGOUREUX…" size={24} /></> : <div style={{ height: 96 }} />}
        </Win>
      </P>)}
      <P t={t} a={at(73)} x={C - 250} y={M + 270}><div style={{ position: "relative" }}><Pix rows={ICON.boy} px={14} /><div style={{ marginTop: 6 }}><Tag text="RECRUTEUR" size={20} /></div>{t >= at(81) && <div style={{ position: "absolute", left: 120, top: -30 }}><Pix rows={ICON.zzz} px={9} /></div>}</div></P>
      <P t={t} a={at(81)} x={C + 140} y={M + 280}><Tag text="TOUTES PAREILLES" size={28} /></P>
    </>
  );
  if (scene(t, 6)) return (
    <>
      {[3, 2, 1].map((k) => <div key={k} style={{ position: "absolute", left: C - 280 + k * 22, top: M - 300 + k * 22, opacity: 0.35 }}><Win title="LETTRE DE MOTIVATION" w={640} red={false}><div style={{ height: 96 }} /></Win></div>)}
      <P t={t} a={at(88)} x={C} y={M - 40}>
        <Win title="TA LETTRE" w={680}>
          <Line t={t} a={at(91)} text="UN DÉTAIL CONCRET SUR TOI." red size={26} /><br />
          <Line t={t} a={at(95)} text="→ RELIÉ À CE QU'ILS CHERCHENT." size={24} />
        </Win>
      </P>
      <P t={t} a={PH[6][0]} x={C - 250} y={M + 280}><div style={{ position: "relative" }}><Pix rows={ICON.boy} px={14} /><div style={{ marginTop: 6 }}><Tag text="RECRUTEUR" size={20} /></div>{t >= at(88) && <div style={{ position: "absolute", left: 120, top: -40 }}><Tag text="!" red size={40} /></div>}</div></P>
      <P t={t} a={at(95)} x={C + 150} y={M + 290}><Tag text="IL S'EN SOUVIENT" red size={26} /></P>
    </>
  );
  if (scene(t, 7)) return (
    <>
      <P t={t} a={at(107)} x={C} y={M - 300}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 460 }} /></P>
      <P t={t} a={at(108)} x={C} y={M - 30}>
        <Win title="MYMOTIV" w={680}>
          {([["LIEN DE L'OFFRE", 111], ["TON CV", 116], ["TA LETTRE SORT DE LA PILE", 120]] as const).map(([l, i]) => t >= at(i) && <div key={l} style={{ fontFamily: PIX, fontSize: 28, color: i === 120 ? RED : W_, margin: "10px 0" }}><span style={{ color: PINK }}>✓</span> {l}</div>)}
        </Win>
      </P>
      <P t={t} a={at(120)} x={C} y={M + 250}><div style={{ display: "flex", gap: 10 }}>{MOTS.map((_, j) => <div key={j} style={{ width: 40, height: 40, background: j === ROUGE ? RED : "#4A3C3B" }} />)}</div></P>
    </>
  );
  if (scene(t, 8)) return (
    <>
      <P t={t} a={PH[8][0] - 0.05} x={C} y={M - 170}>
        <Win title="COMMENTAIRE" w={660} red={false}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span style={{ fontFamily: PIX, fontSize: 30, color: W_ }}>LE 3E MOT :</span>
            <span style={{ display: "flex", gap: 4 }}>{Array.from({ length: 6 }, (_, j) => <span key={j} style={{ width: 22, height: 26, background: "#4A3C3B" }} />)}</span>
            <span style={{ width: 16, height: 34, background: RED, opacity: Math.floor(t * 2.5) % 2 ? 1 : 0 }} />
          </div>
        </Win>
      </P>
      <P t={t} a={at(132)} x={C} y={M + 10}><div style={{ display: "flex", alignItems: "center", gap: 16 }}><Pix rows={ICON.eye} px={9} /><Tag text="SANS TRICHER" size={30} /></div></P>
      <P t={t} a={at(136)} x={C} y={M + 200}><div style={{ padding: "14px 26px", background: PINK, fontFamily: PIX, fontWeight: 700, fontSize: 32, color: W_ }}>1RE LETTRE OFFERTE</div></P>
      <P t={t} a={at(140)} x={C} y={M + 310}><Tag text="LIEN EN BIO ↑" size={32} /></P>
    </>
  );
  return null;
};

export const MotRouge: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = (t > at(45) - 0.05 && t < at(45) + 0.2) || (t > at(20) && t < at(20) + 0.12);
  return <Ecran t={t} glitch={glitch} audio="audio/motrouge.wav" caption={scene(t, 1) ? null : <Caption t={t} />}><Scenes t={t} /></Ecran>;   // pendant la liste, la grande carte suffit
};
