// « Le faux DM » en 30 s (≈33 s, 30 i/s, 9:16) — résumé de FauxDM avec le même déroulé : faux DM de Squeezie → excuses et
// proposition (« mens de A à Z ») → « Tout est faux » → effet Zeigarnik → la lettre qui ouvre sur un vrai enjeu → MyMotiv →
// « Désolé Squeezie, c'était pour la science ». Mêmes garde-fous (aucune photo ni ressemblance, révélation dans la vidéo,
// MyMotiv jamais associé à lui) et mêmes éléments pixel (importés de FauxDM.tsx).
// Voix : voix-fauxdm30.json (--voix yann). Son : synth_fauxdm30.py.
import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./common";
import voix from "./data/fauxdm30-voix.json";
import { Avatar, Ecran, GREY, ICON, Line, P, PINK, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";

export const FAUXDM30_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const Caption = makeCaption(voix);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : FAUXDM30_DUR + 1);

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  const C = 540, M = 980;
  const bar = (a: number) => <div style={{ height: 14, background: "#3A2526", marginTop: 6 }}><div style={{ width: `${Math.round(clamp((t - a) / 1.0) * 10) * 10}%`, height: 14, background: RED }} /></div>;
  if (scene(t, 0)) return (
    <>
      <P t={t} a={-0.2} x={C} y={M}><Avatar t={t} /></P>
      <P t={t} a={at(5)} x={C + 200} y={M - 190}><div style={{ position: "relative" }}><Pix rows={ICON.envelope} px={9} /><div style={{ position: "absolute", right: -14, top: -14, width: 30, height: 30, background: RED, color: W_, fontFamily: PIX, fontSize: 20, textAlign: "center", lineHeight: "30px" }}>1</div></div></P>
      <P t={t} a={at(12)} x={C} y={M + 290}><div style={{ position: "relative" }}><Tag text="FÉLICITATIONS" size={28} /><svg width={300} height={50} style={{ position: "absolute", left: -20, top: -6 }}><path d="M0 40 L300 4" stroke={RED} strokeWidth={8} /></svg></div></P>
    </>
  );
  if (scene(t, 1)) return (
    <>
      <P t={t} a={PH[1][0] - 0.1} x={C} y={M - 130}>
        <div style={{ position: "relative" }}>
          <Win title="MESSAGE PRIVÉ" w={640}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}><Pix rows={ICON.person} px={4} /><span style={{ fontFamily: PIX, fontSize: 26, color: W_ }}>SQUEEZIE</span></div>
            <Line t={t} a={at(17)} text="SUPPRIME TA VIDÉO." red />
          </Win>
          {t >= at(19) && <div style={{ position: "absolute", right: -30, top: -130 }}><Pix rows={ICON.trash} px={12} /></div>}
        </div>
      </P>
      <P t={t} a={at(22)} x={C} y={M + 210}><Win title="MA VIDÉO" w={620}><div style={{ display: "flex", alignItems: "center", gap: 24 }}><Pix rows={ICON.play} px={16} /><div style={{ fontFamily: PIX, fontSize: 26, color: W_, lineHeight: 1.4 }}>LA LETTRE DE MOTIVATION<br />{t >= at(24) ? <span style={{ color: RED }}>DE SQUEEZIE</span> : ""}</div></div></Win></P>
    </>
  );
  if (scene(t, 2)) return (
    <>
      {t >= at(27) && <div style={{ position: "absolute", left: C - 280, top: M - 330, display: "flex", gap: 16 }}>{["J+1", "J+2", "J+3", "J+4"].map((d, k) => t >= at(27) + k * 0.12 && <Tag key={d} text={d} red={k === 3} size={30} />)}</div>}
      <P t={t} a={at(30)} x={C} y={M - 40}><Win title="DM N°2 · SQUEEZIE" w={640}><Line t={t} a={at(32)} text="JE M'EXCUSE." /></Win></P>
      <P t={t} a={at(37)} x={C} y={M + 230}><Tag text="UN DEAL ?" red size={44} /></P>
    </>
  );
  if (scene(t, 3)) return (
    <P t={t} a={PH[3][0] - 0.1} x={C} y={M}>
      <Win title="LE DEAL" w={720}>
        <div style={{ fontFamily: PIX, fontSize: 26, color: W_, lineHeight: 1.6 }}>
          {t >= at(39) && <div>1. TU FAIS UNE VIDÉO ▶</div>}
          {t >= at(44) && <div style={{ color: RED }}>2. TU MENS DE A À Z{bar(at(44))}</div>}
          {t >= at(50) && <div>3. ON RESTE JUSQU'AU BOUT{bar(at(50))}</div>}
        </div>
      </Win>
    </P>
  );
  if (scene(t, 4)) {
    const reveal = at(57);
    return (
      <>
        {t >= reveal && <div style={{ position: "absolute", left: -300, right: -300, top: M - 260, height: 8, background: RED }} />}
        <P t={t} a={reveal} x={C} y={M - 120}><div style={{ textAlign: "center", fontFamily: PIX, fontWeight: 700, lineHeight: 1.05 }}><div style={{ fontSize: 90, color: W_ }}>TOUT EST</div><div style={{ fontSize: 140, color: RED, transform: `translate(${(Math.sin(t * 60) > 0.6 ? 6 : 0)}px, 0)` }}>FAUX</div></div></P>
        {t >= reveal && <div style={{ position: "absolute", left: -300, right: -300, top: M + 60, height: 8, background: RED }} />}
        <P t={t} a={at(60)} x={C} y={M + 230}><div style={{ textAlign: "center" }}><Pix rows={ICON.eye} px={14} /><div style={{ marginTop: 12 }}><Tag text="ET T'ES ENCORE LÀ." size={30} /></div></div></P>
      </>
    );
  }
  if (scene(t, 5)) return (
    <>
      <P t={t} a={PH[5][0] - 0.1} x={C} y={M - 90}>
        <Win title="MÉCANISME" w={700}>
          <div style={{ fontFamily: PIX, fontSize: 26, color: GREY }}>NOM :</div>
          {t >= at(68) && <div style={{ fontFamily: PIX, fontWeight: 700, lineHeight: 1.05 }}><div style={{ fontSize: 44, color: W_ }}>L'EFFET</div><div style={{ fontSize: 72, color: RED }}>ZEIGARNIK</div></div>}
          {t >= at(70) && <div style={{ marginTop: 14 }}><Tag text="HISTOIRE PAS FINIE" size={22} /></div>}
        </Win>
      </P>
      <P t={t} a={at(75)} x={C} y={M + 230}><div style={{ display: "flex", alignItems: "center", gap: 20 }}><Pix rows={ICON.brain} px={14} /><Tag text="TON CERVEAU" size={26} /></div></P>
      <P t={t} a={at(78)} x={C} y={M + 350}><div style={{ display: "flex", alignItems: "center", gap: 16 }}><Pix rows={ICON.lock} px={10} /><Tag text="OBLIGÉ DE RESTER" red size={26} /></div></P>
    </>
  );
  if (scene(t, 6)) {
    const ouvre = at(85), enjeu = at(90), lit = at(93);
    return (
      <>
        <P t={t} a={PH[6][0] - 0.1} x={C} y={M - 140}>
          <Win title="LETTRE DE MOTIVATION" w={720} red={t >= ouvre}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <Line t={t} a={PH[6][0]} text="« JE ME PERMETS DE VOUS… »" size={24} />
              {t >= ouvre && <svg width={560} height={60} style={{ position: "absolute", left: -10, top: 0 }}><path d={`M0 34 L${Math.round(clamp((t - ouvre) / 0.2) * 4) / 4 * 560} 30`} stroke={RED} strokeWidth={8} /></svg>}
            </div>
            <br />
            <Line t={t} a={enjeu} text="UN VRAI ENJEU." red size={28} />
          </Win>
        </P>
        <P t={t} a={at(81)} x={C - 250} y={M + 250}><div style={{ position: "relative" }}><Pix rows={ICON.boy} px={14} /><div style={{ marginTop: 6 }}><Tag text="RECRUTEUR" size={20} /></div>{t >= at(81) + 0.4 && t < enjeu && <div style={{ position: "absolute", left: 120, top: -30 }}><Pix rows={ICON.zzz} px={9} /></div>}</div></P>
        <P t={t} a={lit} x={C + 110} y={M + 260}><div style={{ width: 420 }}><div style={{ display: "flex", justifyContent: "space-between", fontFamily: PIX, fontSize: 22, color: W_, marginBottom: 8 }}><span>LECTURE</span><span style={{ color: RED }}>JUSQU'AU BOUT</span></div><div style={{ height: 26, border: `3px solid ${W_}` }}><div style={{ width: `${Math.round(clamp((t - lit) / 0.8) * 10) * 10}%`, height: "100%", background: RED }} /></div></div></P>
      </>
    );
  }
  if (scene(t, 7)) {
    const m = at(104);
    return (
      <>
        <P t={t} a={m} x={C} y={M - 300}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 460 }} /></P>
        <P t={t} a={m + 0.1} x={C} y={M - 30}>
          <Win title="MYMOTIV" w={660}>
            {(["LIEN DE L'OFFRE", "TON CV", "UNE LETTRE QUI ACCROCHE"] as const).map((l, k) => t >= m + 0.25 + k * 0.22 && <div key={l} style={{ fontFamily: PIX, fontSize: 28, color: W_, margin: "10px 0" }}><span style={{ color: PINK }}>✓</span> {l}</div>)}
          </Win>
        </P>
        <P t={t} a={at(105)} x={C} y={M + 230}><div style={{ padding: "14px 26px", background: PINK, fontFamily: PIX, fontWeight: 700, fontSize: 30, color: W_ }}>1RE LETTRE OFFERTE</div></P>
        <P t={t} a={at(108)} x={C} y={M + 330}><Tag text="LIEN EN BIO ↑" size={30} /></P>
      </>
    );
  }
  if (scene(t, 8)) return (
    <>
      <P t={t} a={PH[8][0]} x={C} y={M - 60}><Avatar t={t} heart /></P>
      <P t={t} a={at(113)} x={C} y={M + 250}><Tag text="DÉSOLÉ SQUEEZIE." size={32} /></P>
      <P t={t} a={at(116)} x={C} y={M + 340}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><Tag text="C'ÉTAIT POUR LA SCIENCE." red size={28} /><Pix rows={ICON.flask} px={9} /></div></P>
    </>
  );
  return null;
};

export const FauxDM30: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const glitch = t > Wt(57) - 0.1 && t < Wt(57) + 0.25;
  return <Ecran t={t} glitch={glitch} audio="audio/fauxdm30.wav" caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
