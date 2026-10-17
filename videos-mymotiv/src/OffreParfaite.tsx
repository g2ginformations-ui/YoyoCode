// « L'offre parfaite » (≈85 s, 30 i/s, 9:16) — histoire glauque INVENTÉE façon true crime, univers pixel version horreur
// (plus sombre, grain VHS, rouge = danger), cadrée TikTok. Storyboard : scripts/storyboard-offre-parfaite.md.
// 2 h 40 : Camille, 23 ans, tombe sur une offre trop parfaite → comme d'habitude, elle colle le lien dans MyMotiv, qui en
// sort les vrais besoins : « disponible la nuit », « aucun proche dans la région », « ne prévenir personne » → c'était écrit
// en tout petit → 2 h 48, numéro masqué : « on a vu que vous regardiez notre offre » → elle n'a rien envoyé → « venez seule »
// → l'entreprise n'existe pas, bâtiment fermé → le lendemain, quelqu'un a attendu devant la porte → « une vraie offre ne te
// demandera jamais de ne prévenir personne » → CTA « il y avait un détail dès la 1re seconde, tu l'as vu ? ». Détail caché
// dès l'image 0 (« NE PRÉVENEZ PERSONNE. » en petit), dernière image = première (la vidéo reboucle). Aucune violence montrée,
// aucune vraie affaire, entreprise inventée ; nos voix seulement (aucun clonage). Voix : voix-offre.json. Son : synth_offre.py.
import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, rng } from "./common";
import voix from "./data/offre-voix.json";
import { Ecran, GREY, P, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { BigTT } from "./fauxdmTT";
import { Barre, CAP_BOX, Ligne, X, deux } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";

export const OFFRE_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["parfaite", "peur", "mymotiv", "besoins", "nuit", "proche", "personne", "signature", "masque", "rien", "seule",
  "aucun", "ferme", "longtemps", "jamais", "detail", "premiere", "seconde", "commentaire", "offerte"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : OFFRE_DUR + 1);
const BOUCLE = OFFRE_DUR - 0.5;                                                  // dernière demi-seconde = première image

const DOS = ["....mmmmmm....", "...mmmmmmmm...", "..mmmmmmmmmm..", "..mmmmmmmmmm..", "..mmmmmmmmmm..", "..mmmmmmmmmm..", "..mmmmmmmmmm..",
  "..mm.ssss.mm..", ".mmppppppppmm.", ".pppppppppppp.", ".pppppppppppp.", ".pppppppppppp.", ".ss.pppppp.ss.", "....bbbbbb....", "....bbbbbb....",
  "....bb..bb....", "....bb..bb....", "...mmm..mmm..."];
const LAPTOP = ["..gggggggggggg..", "..gwwwwwwwwwwg..", "..gwsssssssswg..", "..gwwwwwwwwwwg..", "..gwkkkkkkkkwg..", "..gwwwwwwwwwwg..",
  "..gwkkkkkwwwwg..", "..gwwwwwwwwwwg..", "..gggggggggggg..", ".gggggggggggggg.", "gggggggggggggggg"];
const BATIMENT = ["gggggggggggggggggg", "gmmmmmmmmmmmmmmmmg", "gmnknmmnknmmnknmmg", "gmknkmmknkmmknkmmg", "gmnknmmnknmmnknmmg", "gmmmmmmmmmmmmmmmmg",
  "gmnknmmnknmmnknmmg", "gmknkmmknkmmknkmmg", "gmnknmmnknmmnknmmg", "gmmmmmmmmmmmmmmmmg", "gmmmmmmnnnnmmmmmmg", "gmmmmmmnkknmmmmmmg",
  "gmmmmmmnknkmmmmmmg", "gmmmmmmnnnnmmmmmmg", "gggggggggggggggggg"];
export const SILHOUETTE = ["...mmm...", "..mkkkm..", "..mkkkm..", "...mkm...", ".mmkkkmm.", "mkkkkkkkm", "mkkkkkkkm", "mkkkkkkkm", ".mkkkkkm.", ".mkkkkkm.",
  "..mk.km..", "..mk.km..", "..mk.km..", ".mmk.kmm."];

// voile d'horreur : bords noirs + lignes VHS qui sautent (par-dessus les scènes, sous les sous-titres)
export const Voile: React.FC<{ t: number; fort?: number }> = ({ t, fort = 0.85 }) => {
  const r = rng(Math.floor(t * 12) + 3);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 46%, rgba(0,0,0,0) 30%, rgba(0,0,0,${fort}) 78%)` }} />
      {[0, 1, 2].map((k) => r() < 0.55 && <div key={k} style={{ position: "absolute", left: 0, right: 0, top: Math.floor(r() * 1920), height: 2 + Math.floor(r() * 5), background: `rgba(244,241,236,${0.04 + r() * 0.06})` }} />)}
    </>
  );
};
export const Horloge: React.FC<{ t: number; a: number; h: string }> = ({ t, a, h }) => <P t={t} a={a} x={X} y={330}><BigTT text={h} size={64} color={RED} /></P>;

// l'offre : la même fenêtre au début, au milieu et à la fin (boucle). Le petit texte du bas est le « détail caché ».
// version 2 : une faute volontaire dans la fausse offre (« EXPÉRIANCE »), vrai signe d'arnaque que les gens relèvent en commentaire
const LIGNES: [string, number][] = [["LOGÉE", 41], ["DÉBUT IMMÉDIAT", 42], ["AUCUNE EXPÉRIENCE", 44], ["SALAIRE :\nTRÈS ATTRACTIF", 49]];
export const Offre: React.FC<{ t: number; toutes?: boolean; faute?: boolean }> = ({ t, toutes, faute }) => (
  <Win title="OFFRE D'EMPLOI" w={760} red={false} ts={30} style={{ boxShadow: "0 0 0 4px #070303, 0 0 90px rgba(201,194,186,0.18)" }}>
    <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 30, color: GREY, marginBottom: 10 }}>ÉTABLISSEMENTS MORVELLE</div>
    <BigTT text={"ASSISTANTE\nDE DIRECTION"} size={52} />
    <div style={{ marginTop: 8 }}>{LIGNES.map(([l, i], k) => (toutes || t >= at(i)) && <Ligne key={l} t={t} a={toutes ? -9 : at(i)} text={faute && k === 2 ? "AUCUNE EXPÉRIANCE" : l} size={40} red={k === 3} />)}</div>
    <div style={{ textAlign: "right", fontFamily: PIX, fontWeight: 700, fontSize: 22, color: "#6E6965", marginTop: 14 }}>NE PRÉVENEZ PERSONNE.</div>
  </Win>
);
const flotte = (t: number) => Math.round(Math.sin(t * 1.3) * 2) * 3;
// la 1re image (et la dernière, pour la boucle) ; version 2 : provocation « toi aussi, t'aurais postulé »
export const Ouverture: React.FC<{ t: number; v2?: boolean }> = ({ t, v2 }) => (
  <>
    {v2 && <P t={t} a={-0.2} x={X} y={345}><Tag text={"TOI AUSSI,\nT'AURAIS POSTULÉ."} red size={40} style={deux()} /></P>}
    <P t={t} a={-0.2} x={X} y={700 + flotte(t)}><Offre t={t} toutes faute={v2} /></P>
  </>
);
const YEUX = SILHOUETTE.map((r, k) => (k === 1 ? "..mrkrm.." : r));   // version 2 : la silhouette tourne la tête (≈ 0,3 s)
export const COUPS_DEBUT = [PH[1][0], PH[2][0], PH[3][0], at(86), PH[5][0], at(123), PH[8][0], PH[10][0], PH[11][0], at(172)];
export const SURSAUT = at(179);
export const FIN_SCENES_V1 = PH[12][0] - 0.15;                                   // après : la leçon de la version 1

export const Scenes: React.FC<{ t: number; v2?: boolean }> = ({ t, v2 }) => {
  if ((!v2 && t >= BOUCLE) || scene(t, 0)) return <Ouverture t={t} v2={v2} />;
  if (scene(t, 1)) return (
    <>
      <Horloge t={t} a={at(31)} h="02:40" />
      <div style={{ position: "absolute", left: X - 300, top: 880, width: 600, height: 340, background: "radial-gradient(ellipse at 60% 30%, rgba(201,194,186,0.28) 0%, rgba(0,0,0,0) 65%)" }} />
      <div style={{ position: "absolute", left: X - 60, top: 900, width: 420, height: 24, background: "#3A3433" }} />
      <div style={{ position: "absolute", left: X + 40, top: 770 }}><Pix rows={LAPTOP} px={12} /></div>
      <div style={{ position: "absolute", left: X - 250, top: 760 }}><Pix rows={DOS} px={13} /></div>
      <P t={t} a={at(18)} x={X} y={560}><Tag text="CAMILLE, 23 ANS" size={44} /></P>
    </>
  );
  if (scene(t, 2)) return <P t={t} a={PH[2][0] - 0.1} x={X} y={700}><Offre t={t} faute={v2} /></P>;
  if (scene(t, 3) || scene(t, 4)) {
    const la = at(86), rouge: [string, number][] = [["DISPONIBLE LA NUIT.", 89], ["AUCUN PROCHE DANS\nLA RÉGION.", 92], ["NE PRÉVENIR PERSONNE\nAVANT LA SIGNATURE.", 97]];
    return (
      <>
        <P t={t} a={at(63)} x={X} y={420}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 400, opacity: 0.9 }} /></P>
        <P t={t} a={PH[3][0] - 0.1} x={X} y={790}>
          <Win title="MYMOTIV" w={760} ts={30}>
            <Ligne t={t} a={at(58)} text="LIEN DE L'OFFRE ✓" size={40} />
            {t >= at(64) && t < at(73) && <Barre t={t} a={at(64)} d={1.4} h={22} />}
            {t >= at(73) && <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 40, color: W_, margin: "16px 0 6px" }}>LES VRAIS BESOINS :</div>}
            {t < la ? (
              <>
                <Ligne t={t} a={at(82)} text="RIGUEUR" size={40} />
                <Ligne t={t} a={at(83)} text="TRAVAIL EN ÉQUIPE" size={40} />
              </>
            ) : rouge.map(([l, i]) => t >= at(i) && <Ligne key={l} t={t} a={at(i)} text={l} size={40} red />)}
          </Win>
        </P>
      </>
    );
  }
  if (scene(t, 5)) {
    // zoom par paliers vers le petit texte du bas
    // le petit texte (≈ x 686, y 952) arrive au centre de l'écran à l'échelle 2 (largeur ≈ 740 px, dans la zone sûre)
    const pas = t < at(109) ? 0 : t < at(112) ? 1 : 2, s = [1, 1.45, 2][pas], k = s - 1;
    return (
      <div style={{ position: "absolute", inset: 0, transform: `translate(${k * (X - 2 * 686)}px, ${k * (800 - 2 * 952)}px) scale(${s})`, transformOrigin: "0 0" }}>
        <P t={t} a={PH[5][0] - 0.1} x={X} y={700}><Offre t={t} toutes faute={v2} /></P>
      </div>
    );
  }
  if (scene(t, 6) || scene(t, 7)) {
    const vib = t >= at(123) && t < PH[7][0] ? Math.round(Math.sin(t * 80)) * 10 : 0, appel = t >= PH[7][0] - 0.1;
    return (
      <>
        <Horloge t={t} a={at(120)} h="02:48" />
        {t >= at(122) && (
          <div style={{ position: "absolute", left: X, top: 760, transform: `translate(calc(-50% + ${vib}px), -50%)`, width: 360, height: 620, border: "12px solid #3A3433", borderRadius: 34, background: "#0E0A0A", boxShadow: "0 0 80px rgba(201,194,186,0.15)" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center" }}>
              {t >= at(124) && <Tag text={"NUMÉRO\nMASQUÉ"} size={40} style={deux()} />}
              {appel && <div style={{ marginTop: 40, fontFamily: PIX, fontWeight: 700, fontSize: 40, color: RED }}>{`00:0${Math.min(9, Math.floor(t - PH[7][0]) + 1)}`}</div>}
              {appel && <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 40 }}>{[0, 1, 2, 3, 4].map((k) => <div key={k} style={{ width: 22, height: 20 + Math.round(Math.abs(Math.sin(t * 9 + k * 1.7)) * 3) * 22, background: RED }} />)}</div>}
            </div>
          </div>
        )}
      </>
    );
  }
  if (scene(t, 8)) return <P t={t} a={at(136)} x={X} y={760}><BigTT text={"ELLE N'A ENCORE\nRIEN ENVOYÉ."} size={56} /></P>;
  if (scene(t, 9)) return (
    <P t={t} a={PH[9][0] - 0.1} x={X} y={720}>
      <Win title="MESSAGE - NUMÉRO MASQUÉ" w={700} ts={30}>
        <Ligne t={t} a={at(142)} text="ENTRETIEN DEMAIN." size={44} />
        <Ligne t={t} a={at(145)} text="23H." size={44} />
        <Ligne t={t} a={at(146)} text="VENEZ SEULE." size={44} red />
      </Win>
    </P>
  );
  if (scene(t, 10) || scene(t, 11)) {
    const nuit = t >= PH[11][0] - 0.15, lampe = Math.floor(t * 7) % 9 === 0 ? 0.35 : 1;
    const h = !nuit ? "" : t < at(172) ? "23:00" : t < at(179) ? "23:40" : "00:15";
    return (
      <>
        {!nuit && (
          <>
            <P t={t} a={PH[10][0] - 0.1} x={X} y={420}>
              <Win title="RECHERCHE" w={760} red={false} ts={30}>
                <div style={{ border: "4px solid #8A8580", padding: "8px 14px", fontFamily: PIX, fontWeight: 700, fontSize: 36, color: W_ }}>ÉTABLISSEMENTS MORVELLE</div>
                {t >= at(152) && <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 44, color: RED, marginTop: 16 }}>0 RÉSULTAT</div>}
              </Win>
            </P>
          </>
        )}
        {nuit && <Horloge t={t} a={PH[11][0] - 0.15} h={h} />}
        {(t >= at(156) || nuit) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}>
            <div style={{ position: "absolute", left: X - 300, top: 700 }}><Pix rows={BATIMENT} px={22} /></div>
            <div style={{ position: "absolute", left: X + 160, top: 640, width: 10, height: 390, background: "#5A4A48" }} />
            <div style={{ position: "absolute", left: X + 140, top: 630, width: 50, height: 18, background: "#F2C46D", opacity: lampe }} />
            <div style={{ position: "absolute", left: X - 10, top: 648, width: 380, height: 390, background: "linear-gradient(180deg, rgba(242,196,109,0.32), rgba(242,196,109,0.05))", clipPath: "polygon(43% 0, 57% 0, 100% 100%, 0 100%)", opacity: lampe }} />
            {nuit && t >= at(172) && <div style={{ position: "absolute", left: X + 125, top: 856 }}><Pix rows={v2 && t >= SURSAUT && t < SURSAUT + 0.3 ? YEUX : SILHOUETTE} px={13} /></div>}
            <div style={{ position: "absolute", left: X - 400, top: 1028, width: 800, height: 10, background: "#3A3433" }} />
          </div>
        )}
        {!nuit && t >= at(158) && <P t={t} a={at(158)} x={X} y={1110}><Tag text={"FERMÉ DEPUIS\nDES ANNÉES"} red size={40} style={deux()} /></P>}
      </>
    );
  }
  if (scene(t, 12)) return (
    <>
      <P t={t} a={PH[12][0] - 0.1} x={X} y={640}><Tag text={"UNE VRAIE OFFRE NE TE\nDEMANDE JAMAIS DE\nNE PRÉVENIR PERSONNE."} red size={40} style={deux()} /></P>
      <P t={t} a={at(191)} x={X} y={900}><Tag text={"LIS CE QU'ELLE\nDEMANDE VRAIMENT."} size={40} style={deux()} /></P>
    </>
  );
  if (scene(t, 13)) return (
    <>
      {t < at(233) && <P t={t} a={at(211)} x={X} y={430}><BigTT text={"TU L'AS VU ?"} size={64} color={RED} /></P>}
      <CtaCommentaire t={t} aOffre={at(233)} aBio={at(236)} aWin={at(215)} aType={at(218)} label={"J'AI VU :"} />
    </>
  );
  return null;
};

export const OffreParfaite: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const coups = [PH[1][0], PH[2][0], PH[3][0], at(86), PH[5][0], at(123), PH[8][0], PH[10][0], PH[11][0], at(172), PH[13][0], BOUCLE];
  const glitch = t < 0.12 || coups.some((c) => t > c - 0.06 && t < c + 0.1);
  return (
    <Ecran t={t} glitch={glitch} audio="audio/offre.wav" zoom={1} caption={t >= BOUCLE ? null : <Caption t={t} />}>
      <Scenes t={t} />
      <Voile t={t} fort={scene(t, 8) ? 0.95 : 0.85} />
    </Ecran>
  );
};
