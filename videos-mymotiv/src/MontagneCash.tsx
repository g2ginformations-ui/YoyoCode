// « Comment faire une montagne de cash » (≈32 s, 30 i/s, 9:16) — faux tuto en 4 étapes, univers pixel, cadrée TikTok, version
// légère (peu d'éléments, textes 40 à 64 px). Storyboard : scripts/storyboard-montagne-de-cash.md.
// 1 offre → 2 une lettre qui part de l'offre (MyMotiv) → 3 « tu décroches le poste… ça dépend de toi, donne-toi toutes les
// chances » → 4 premier salaire 1 400 € tout en billets de 5 € (280 billets, calcul juste) → on empile → « Regarde-moi cette
// montagne » (gros plan, le petit Yann plante un drapeau) → la caméra recule par paliers : un petit tas à côté d'une tasse de
// café, « c'est une colline » → CTA « montagne ou colline ? ». Billets dessinés en pixel (aucune imitation d'un vrai billet).
// Voix : voix-montagne.json (--voix yann). Son : synth_montagne.py.
import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, rng } from "./common";
import voix from "./data/montagne-voix.json";
import { Ecran, P, PINK, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { Curseur, Tampon } from "./Barnum";
import { BigTT } from "./fauxdmTT";
import { Bouton, CAP_BOX, Ligne, X, deux } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";
import { YANN } from "./MonCV";

export const MONTAGNE_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["montagne", "cash", "offre", "mymotiv", "poste", "chances", "salaire", "euros", "cinq", "billets", "empiles", "colline",
  "commentaire", "offerte"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : MONTAGNE_DUR + 1);

const BILLET = ["pppppppppppppp", "pwwwwwwwwwwwwp", "pwppppwwppppwp", "pwpppwrrwpppwp", "pwppppwwppppwp", "pwwwwwwwwwwwwp", "pppppppppppppp"];
const NEIGE = BILLET.map((r) => r.replace(/p/g, "s"));                  // les billets du sommet, « enneigés »
const TASSE = [".wwwwwwwwwwww...", ".wkkkkkkkkkkw...", ".wrrrrrrrrrrwww.", ".wrrrrrrrrrrw.w.", ".wrrrrrrrrrrw.w.", ".wrrrrrrrrrrw.w.",
  ".wrrrrrrrrrrwww.", ".wrrrrrrrrrrw...", ".wrrrrrrrrrrw...", "..wrrrrrrrrw....", "...wwwwwwww....."];
const VAPEUR = ["...s....s....s..", "....s....s....s.", "...s....s....s..", "....s....s....s."];

// le « monde » : la table (y = 0), le tas de billets (8 rangées, 36 billets dessinés pour 280), le grimpeur, le drapeau et la
// tasse. Caméra = échelle S autour du point (X, 1150) : 1,7 pour la « montagne », 0,3 à 0,38 pour la colline.
const RANGS = [8, 7, 6, 5, 4, 3, 2, 1];
const BILLETS = (() => {
  const r = rng(5), out: { x: number; y: number; rot: number; neige: boolean }[] = [];
  RANGS.forEach((n, k) => { for (let j = 0; j < n; j++) out.push({ x: (j - (n - 1) / 2) * 80 + (r() - 0.5) * 14 - 42, y: -(k + 1) * 36 - 6, rot: Math.round((r() - 0.5) * 2) * 5, neige: k >= 6 }); });
  return out;
})();
const SOMMET = -294;
const Monde: React.FC<{ t: number; S: number; n?: number; grimpeur?: boolean; drapeau?: boolean; dy?: number; tasse?: boolean }> = ({ t, S, n = BILLETS.length, grimpeur, drapeau, dy = 0, tasse = true }) => (
  <div style={{ position: "absolute", left: X, top: 1150, transform: `scale(${S})`, transformOrigin: "0 0" }}>
    <div style={{ position: "absolute", left: -3000, top: 0, width: 6000, height: 24, background: "#5A4A48" }} />
    {BILLETS.slice(0, n).map((b, k) => <div key={k} style={{ position: "absolute", left: b.x, top: b.y, transform: `rotate(${b.rot}deg)` }}><Pix rows={b.neige ? NEIGE : BILLET} px={6} /></div>)}
    {drapeau && (
      <>
        <div style={{ position: "absolute", left: 40, top: SOMMET - 130, width: 8, height: 130, background: "#C9C2BA" }} />
        <div style={{ position: "absolute", left: 48, top: SOMMET - 130, padding: "4px 10px", background: RED, fontFamily: PIX, fontWeight: 700, fontSize: 24, color: W_, whiteSpace: "nowrap" }}>1 400 €</div>
      </>
    )}
    {grimpeur && <div style={{ position: "absolute", left: -30, top: SOMMET - 54 - dy }}><Pix rows={YANN} px={3} /></div>}
    {tasse && <div style={{ position: "absolute", left: 340, top: -11 * 44 - 4 * 22 }}><Pix rows={VAPEUR} px={22} style={{ opacity: 0.6 + 0.4 * (Math.floor(t * 3) % 2) }} /></div>}
    {tasse && <div style={{ position: "absolute", left: 340, top: -11 * 44 }}><Pix rows={TASSE} px={44} /></div>}
  </div>
);

const Etape: React.FC<{ t: number; a: number; n: number }> = ({ t, a, n }) => <P t={t} a={a} x={X} y={330}><Tag text={`ÉTAPE ${n}/4`} red size={40} /></P>;

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) return (
    <>
      <Monde t={t} S={1.7} grimpeur drapeau dy={Math.round(Math.abs(Math.sin(t * 4)) * 2) * 4} />
      <P t={t} a={-0.2} x={X} y={360}><BigTT text={"COMMENT FAIRE UNE\nMONTAGNE DE CASH"} size={52} /></P>
    </>
  );
  if (scene(t, 1)) {
    const clic = at(16), k = clamp((clic - t) / 0.6);
    return (
      <>
        <Etape t={t} a={PH[1][0] - 0.15} n={1} />
        <P t={t} a={at(13)} x={X} y={620}>
          <div style={{ position: "relative" }}>
            <Win title="OFFRE D'EMPLOI" w={720} red={false} ts={30}>
              <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 44, color: W_ }}>MAISON LUMEN</div>
              {[0.8, 0.6].map((w, j) => <div key={j} style={{ height: 18, width: `${w * 100}%`, margin: "16px 0 0", background: "#4A3C3B" }} />)}
              <div style={{ display: "flex", justifyContent: "center", marginTop: 26 }}><Bouton text="POSTULER" on={t >= clic} size={44} /></div>
            </Win>
            <div style={{ position: "absolute", left: 420 + Math.round(k * 4) * 40, top: 220 + Math.round(k * 4) * 20 }}><Curseur /></div>
          </div>
        </P>
      </>
    );
  }
  if (scene(t, 2)) return (
    <>
      <Etape t={t} a={PH[2][0] - 0.15} n={2} />
      <P t={t} a={at(28)} x={X} y={475}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 420 }} /></P>
      {t >= at(21) && <P t={t} a={at(21)} x={X} y={700}><Win title="TA LETTRE" w={720} ts={30}><Ligne t={t} a={at(23)} text={"QUI PART\nDE L'OFFRE ✓"} red size={44} /></Win></P>}
      <P t={t} a={at(31)} x={X} y={930}><div style={{ padding: "12px 22px", background: PINK, fontFamily: PIX, fontWeight: 700, fontSize: 44, color: W_ }}>1RE LETTRE OFFERTE</div></P>
    </>
  );
  if (scene(t, 3)) return (
    <>
      <Etape t={t} a={PH[3][0] - 0.15} n={3} />
      {t >= at(36) && <div style={{ position: "absolute", left: X, top: 620, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="EMBAUCHÉ ?" t={t} a={at(36)} size={60} /></div>}
      <P t={t} a={at(44)} x={X} y={900}><Tag text={"DONNE-TOI TOUTES\nLES CHANCES"} red size={44} style={deux()} /></P>
    </>
  );
  if (scene(t, 4)) {
    const c0 = at(56), c1 = at(60), nb = t < c0 ? 0 : Math.min(280, Math.round(clamp((t - c0) / (c1 - c0)) * 28) * 10);
    const empile = Math.round(clamp((t - at(61)) / 1.0) * BILLETS.length);
    return (
      <>
        <Etape t={t} a={PH[4][0] - 0.15} n={4} />
        {t >= at(50) && <P t={t} a={at(50)} x={X} y={500}><Win title="VIREMENT REÇU" w={640} ts={30}><div style={{ textAlign: "center" }}><BigTT text="+ 1 400 €" size={64} color={W_} /></div></Win></P>}
        <P t={t} a={c0} x={X} y={725}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><BigTT text={String(nb)} size={64} color={RED} /><Tag text="BILLETS DE 5 €" size={40} /></div></P>
        {t >= at(61) && <Monde t={t} S={1} n={empile} tasse={false} />}
      </>
    );
  }
  if (scene(t, 5) || scene(t, 6)) {
    // gros plan « montagne », puis recul par paliers 1,7 → 1 → 0,6 → 0,38
    const r0 = PH[6][0], pas = t < r0 ? 0 : Math.min(3, Math.floor((t - r0) / 0.18) + 1), S = [1.7, 1, 0.6, 0.38][pas];
    const plante = at(67), dy = t < plante ? Math.round(Math.abs(Math.sin(t * 5)) * 2) * 5 : 0;
    return (
      <>
        <Monde t={t} S={S} grimpeur drapeau={t >= plante} dy={dy} />
        {pas === 0 && <P t={t} a={at(68)} x={X} y={340}><Tag text="SOMMET ATTEINT" size={44} /></P>}
        {pas === 3 && <P t={t} a={Math.max(at(73), r0 + 0.6)} x={X} y={640}><Tag text="C'EST UNE COLLINE." red size={48} /></P>}
      </>
    );
  }
  if (scene(t, 7)) return (
    <>
      <Monde t={t} S={0.3} grimpeur drapeau />
      <CtaCommentaire t={t} aOffre={at(81)} aBio={at(84)} aWin={at(74)} aType={at(77)} label={"MONTAGNE OU\nCOLLINE ?"} />
    </>
  );
  return null;
};

export const MontagneCash: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const coups = [PH[1][0], PH[2][0], PH[3][0], PH[4][0], PH[5][0], PH[7][0]];
  const glitch = t < 0.18 || coups.some((c) => t > c - 0.12 && t < c + 0.06);
  return <Ecran t={t} glitch={glitch} audio="audio/montagne.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
