// « L'affaire de la lettre copiée-collée » (≈64 s, 30 i/s, 9:16) — récit façon true crime, univers pixel noir et rouge,
// cadrée TikTok (zones sûres src/tiktok.ts). Style seulement (présent de narration, bruitages à la bouche « PAF », « SCHLAC »,
// silences, indignation puis empathie) : aucune voix, aucun nom ni aucun visuel d'un créateur réel.
// 14 mars, 23 h 47 : Camille envoie sa candidature à Maison Lumen → le lendemain, le recruteur ouvre… PAF → « Je rêve de
// rejoindre Atelier Nova » → supprimé, SCHLAC → l'enquête : 3 suspects, le coupable = le copier-coller → empathie (« ça peut
// arriver à tout le monde ») → MyMotiv part de l'offre (le bon nom, leurs vrais besoins, tes vraies preuves) → « affaire
// classée » → CTA « t'as déjà envoyé une lettre avec le mauvais nom ? avoue en commentaire ». Entreprises fictives du projet.
// Voix : voix-affaire.json (--voix yann). Son : synth_affaire.py.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./common";
import voix from "./data/affaire-voix.json";
import { Ecran, GREY, ICON, INK, P, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { Curseur, Tampon } from "./Barnum";
import { BigTT, FinMyMotiv } from "./fauxdmTT";
import { Bulle, CAP_BOX, X, deux } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";
import { Carte, LINA } from "./TesLequel";

export const AFFAIRE_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["perdre", "paf", "atelier", "nova", "lumen", "supprime", "schlac", "coupable", "copiercoller", "nom", "angoisse",
  "mymotiv", "offre", "besoins", "preuves", "classee", "avoue", "commentaire", "offerte"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : AFFAIRE_DUR + 1);

const LAPTOP = ["..gggggggggggg..", "..gwwwwwwwwwwg..", "..gwrrrrrrrrwg..", "..gwwwwwwwwwwg..", "..gwkkkkkkkkwg..", "..gwwwwwwwwwwg..",
  "..gwkkkkkwwwwg..", "..gwwwwwwwwwwg..", "..gggggggggggg..", ".gggggggggggggg.", "gggggggggggggggg"];
const CERCLE = 16;   // épaisseur du cercle rouge « au feutre »

// bande de police (décor : peut sortir de la zone sûre)
const Bande: React.FC<{ t: number; y: number; rot: number; sens?: number }> = ({ t, y, rot, sens = 1 }) => (
  <div style={{ position: "absolute", left: -120, width: 1320, top: y, height: 62, transform: `rotate(${rot}deg)`, background: "#F2C46D", overflow: "hidden", boxShadow: "0 6px 0 rgba(0,0,0,0.5)" }}>
    <div style={{ whiteSpace: "nowrap", fontFamily: PIX, fontWeight: 700, fontSize: 34, color: "#141010", lineHeight: "62px", transform: `translateX(${Math.round(((t * 60 * sens) % 520) / 4) * 4 - 520}px)` }}>
      {"NE PAS FRANCHIR - ENQUÊTE EN COURS - ".repeat(6)}
    </div>
  </div>
);
// tremblement en paliers (PAF, SCHLAC)
const secousse = (t: number, a: number) => (t >= a && t < a + 0.35 ? Math.round(Math.sin((t - a) * 90) * 3) * 6 * (1 - (t - a) / 0.35) : 0);

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) {
    const vol = clamp((t - at(4)) / 0.6), envoye = t >= at(4) + 0.6;
    return (
      <>
        <Bande t={t} y={210} rot={-4} />
        <P t={t} a={-0.2} x={X} y={340}><Tag text="AFFAIRE #014" red size={44} /></P>
        <P t={t} a={-0.1} x={X} y={490}><BigTT text={t < at(2) ? "14 MARS" : "14 MARS\n23H47"} size={88} /></P>
        <P t={t} a={-0.1} x={X} y={770}>
          <div style={{ position: "relative" }}>
            <Pix rows={LAPTOP} px={14} />
            {t >= at(4) && !envoye && <div style={{ position: "absolute", left: 60 + Math.round(vol * 4) / 4 * 240, top: 20 - Math.round(vol * 4) / 4 * 160 }}><Pix rows={ICON.envelope} px={6} /></div>}
            {envoye && <div style={{ position: "absolute", left: "50%", top: 26, transform: "translateX(-50%)" }}><Tag text="ENVOYÉ ✓" size={36} /></div>}
          </div>
        </P>
        <P t={t} a={at(15)} x={X} y={1045}><BigTT text={"ELLE VIENT DE\nTOUT PERDRE."} size={56} color={RED} /></P>
      </>
    );
  }
  if (scene(t, 1)) {
    const lignes = ["", "", "CAMILLE D.", "", ""];
    const paf = at(43), dx = secousse(t, paf);
    return (
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${dx}px)` }}>
        <P t={t} a={PH[1][0] - 0.15} x={X} y={340}><Tag text="LE LENDEMAIN, 9H00" size={44} /></P>
        {t >= at(28) && <P t={t} a={at(28)} x={X} y={640}>
          <div style={{ position: "relative" }}>
            <Win title="BOÎTE DE RÉCEPTION" w={800} red={false} ts={30}>
              {lignes.map((l, k) => t >= at(31) + k * 0.08 && (
                <div key={k} style={{ display: "flex", alignItems: "center", gap: 18, height: 64, borderBottom: "3px solid #3A2526", background: l && t >= at(39) ? "rgba(232,38,43,0.25)" : undefined }}>
                  <Pix rows={ICON.envelope} px={3} />
                  {l ? <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 40, color: t >= at(39) ? RED : W_ }}>{l}</span> : <div style={{ height: 20, width: [420, 360, 0, 480, 300][k], background: "#4A3C3B" }} />}
                </div>
              ))}
            </Win>
            {t >= at(35) && <div style={{ position: "absolute", left: 470 + Math.round(clamp((at(39) - t) / 0.5) * 4) * 30, top: 250 + Math.round(clamp((at(39) - t) / 0.5) * 4) * 25 }}><Curseur /></div>}
          </div>
        </P>}
        <P t={t} a={paf} x={X} y={1030}><BigTT text="PAF !" size={180} color={RED} /></P>
      </div>
    );
  }
  if (scene(t, 2)) return (
    <>
      <P t={t} a={PH[2][0] - 0.15} x={X} y={340}><Tag text="PIÈCE À CONVICTION #1" size={44} /></P>
      <P t={t} a={PH[2][0] - 0.1} x={X} y={560}>
        <Win title="CANDIDATURE DE CAMILLE" w={800} ts={30}>
          <div style={{ position: "relative", display: "inline-block" }}>
            <Bulle t={t} a={at(46)} text={"« JE RÊVE DE REJOINDRE\nATELIER NOVA. »"} size={38} />
            {t >= at(52) && <div style={{ position: "absolute", left: -18, top: 46, width: 400, height: 76, border: `${CERCLE / 2}px solid ${RED}`, borderRadius: "50%", transform: `rotate(-3deg) scale(${0.6 + 0.4 * Math.round(clamp((t - at(52)) / 0.25) * 4) / 4})` }} />}
          </div>
        </Win>
      </P>
      <P t={t} a={at(54)} x={X} y={830}><Tag text="LE POSTE EST CHEZ :" size={40} /></P>
      <P t={t} a={at(61)} x={X} y={935}><BigTT text="MAISON LUMEN" size={64} color={RED} /></P>
    </>
  );
  if (scene(t, 3)) {
    const a = at(63), k = Math.round(clamp((t - a) / 0.45) * 5) / 5, dx = secousse(t, at(64));
    return (
      <div style={{ position: "absolute", inset: 0, transform: `translateX(${dx}px)` }}>
        <P t={t} a={at(64)} x={X} y={440}><BigTT text="SCHLAC !" size={120} color={RED} /></P>
        {k < 1 && <div style={{ position: "absolute", left: X, top: 600 + k * 260, transform: `translate(-50%, -50%) scale(${1 - k * 0.75}) rotate(${Math.round(k * 4) * 8}deg)` }}>
          <Win title="CANDIDATURE DE CAMILLE" w={560} ts={26}><div style={{ height: 70, display: "flex", flexDirection: "column", gap: 12 }}><div style={{ height: 18, width: "90%", background: "#4A3C3B" }} /><div style={{ height: 18, width: "70%", background: "#4A3C3B" }} /></div></Win>
        </div>}
        <P t={t} a={PH[3][0] - 0.1} x={X} y={900}><Pix rows={ICON.trash} px={22} /></P>
        <P t={t} a={at(65)} x={X} y={1095}><Tag text="PAS LU LA 2E LIGNE" red size={44} /></P>
      </div>
    );
  }
  if (scene(t, 4)) {
    const suspect = (n: number, a: number, y: number, contenu: React.ReactNode, coupable?: boolean) => t >= a && (
      <P t={t} a={a} x={X} y={y}>
        <div style={{ position: "relative" }}>
          <Win title={`SUSPECT #${n}`} w={760} red={!!coupable} ts={30}>{contenu}</Win>
          <div style={{ position: "absolute", left: -10, top: -10, width: 22, height: 22, background: RED, border: `4px solid ${INK}` }} />
        </div>
      </P>
    );
    return (
      <>
        <P t={t} a={PH[4][0] - 0.15} x={X} y={335}><div style={{ display: "flex", gap: 16 }}><Tag text="L'ENQUÊTE" red size={44} /><Tag text="3 SUSPECTS" size={44} /></div></P>
        {suspect(1, at(78), 490, <Bulle t={t} a={at(80)} text={"« MADAME, MONSIEUR,\nJE ME PERMETS »"} size={38} />)}
        {suspect(2, at(85), 700, <Bulle t={t} a={at(87)} text={"« JE SUIS DYNAMIQUE\nET MOTIVÉE »"} size={38} />)}
        {suspect(3, at(92), 905, t >= at(96) ? <BigTT text="LE COPIER-COLLER" size={50} color={RED} /> : <BigTT text="???" size={50} color={GREY} />, true)}
        {t >= at(96) && <div style={{ position: "absolute", left: X, top: 1080, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="COUPABLE" t={t} a={at(96)} size={64} /></div>}
      </>
    );
  }
  if (scene(t, 5)) return (
    <>
      <P t={t} a={PH[5][0] - 0.15} x={X} y={545}><Carte rows={LINA} px={12} n="CAMILLE" on s={300} /></P>
      <P t={t} a={at(104)} x={X} y={800}>
        <div style={{ display: "flex", gap: 30, alignItems: "center" }}>
          {[0, 1, 2, 3].map((j) => t >= at(104) + j * 0.1 && <div key={j} style={{ position: "relative" }}><Pix rows={ICON.envelope} px={6} />{t >= at(112) && <div style={{ position: "absolute", left: "50%", top: -46, transform: "translateX(-50%)" }}><BigTT text="?" size={40} color={RED} /></div>}</div>)}
        </div>
      </P>
      <P t={t} a={at(104)} x={X} y={340}><Tag text="LA MÊME LETTRE PARTOUT" size={40} /></P>
      <P t={t} a={at(117)} x={X} y={1040}><Tag text={t < at(124) ? "ÇA PEUT ARRIVER\nÀ TOUT LE MONDE" : "C'EST L'ANGOISSE."} red size={44} style={deux()} /></P>
    </>
  );
  if (scene(t, 6)) return (
    <>
      <FinMyMotiv t={t} aLogo={at(129)} aWin={at(131)} etapes={[["PART DE L'OFFRE", at(133)], ["LE BON NOM", at(138)], ["LEURS VRAIS BESOINS", at(140)], ["TES VRAIES PREUVES", at(143)]]} aOffre={99} aBio={99} />
      {t >= at(146) && <div style={{ position: "absolute", left: X, top: 1060, transform: "translate(-50%, -50%)", whiteSpace: "nowrap" }}><Tampon text="AFFAIRE CLASSÉE" t={t} a={at(146)} size={52} /></div>}
    </>
  );
  if (scene(t, 7)) return (
    <>
      <Bande t={t} y={1470} rot={3} sens={-1} />
      {t < at(165) - 0.05 && <P t={t} a={PH[7][0] - 0.1} x={X} y={430}><BigTT text={"ET TOI ?"} size={110} color={RED} /></P>}
      <CtaCommentaire t={t} aOffre={at(165)} aBio={at(168)} aWin={at(159)} aType={at(164)} label={"J'AVOUE :"} />
    </>
  );
  return null;
};

export const AffaireLettre: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const coups = [PH[1][0], PH[2][0], PH[3][0], PH[4][0], PH[5][0], PH[6][0], PH[7][0], at(43), at(64), at(96)];
  const glitch = t < 0.18 || coups.some((c) => t > c - 0.12 && t < c + 0.08);
  return <Ecran t={t} glitch={glitch} audio="audio/affaire.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
