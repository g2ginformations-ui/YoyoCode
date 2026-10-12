// « T'es lequel des 4 ? » (≈51 s, 30 i/s, 9:16) — univers pixel, cadrée TikTok dès le départ (zones sûres src/tiktok.ts).
// Écran « choisis ton personnage » façon jeu vidéo : « Tu le sais pas encore… mais t'es l'un de ces quatre personnages. »
// Puis une fiche par profil, avec des portraits où tout le monde se reconnaît (l'effet n'est pas nommé, choix du
// propriétaire) : N°1 l'alternance (persona Lina), N°2 le 1er job (Karim), N°3 la reconversion (Sandrine), N°4 la cellule
// (pour l'humour : « entre deux tractions, t'as trouvé un téléphone… »). → « Si tu t'es reconnu, MyMotiv est fait pour
// toi » → CTA « T'es lequel ? 1, 2, 3 ou 4 en commentaire » + 1re lettre offerte → chute « le N°4… rends le téléphone ».
// Les « stats » sont des jauges de jeu, sans aucun chiffre réel. « ° » est absent de la police pixel : « #1 » et pas « N°1 ». Voix : voix-lequel.json (--voix yann). Son : synth_lequel.py.
import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { clamp } from "./common";
import voix from "./data/lequel-voix.json";
import { Ecran, INK, P, PIX, Pix, RED, Tag, W_, Win, makeCaption, show } from "./FauxDM";
import { BigTT, FinMyMotiv } from "./fauxdmTT";
import { CAP_BOX, X, deux } from "./pixelTT";
import { CtaCommentaire } from "./pubTT";

export const LEQUEL_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const at = (i: number, d = 0.08) => Wt(i) - d;
const HOT = new Set(["alternance", "soir", "raconter", "offrir", "diplome", "candidatures", "bon", "montrer", "metier", "experience", "domaine",
  "decousu", "force", "cellule", "tractions", "telephone", "sortie", "reconnu", "mymotiv", "offre", "cv", "preuves", "chances", "lequel",
  "commentaire", "offerte", "rends"]);
const Caption = makeCaption(voix, HOT, CAP_BOX);
const scene = (t: number, i: number) => show(t, i === 0 ? -1 : PH[i][0] - 0.15, i < 6 ? PH[i + 1][0] - 0.15 : LEQUEL_DUR + 1);

// ─── les 4 personnages (14 × 18, palette de FauxDM : s peau, k noir, m gris foncé, p rose, r rouge, b bleu, y jaune) ───
const LINA = ["....kkkkkk....", "...kkkkkkkk...", "..kssssssssk..", "..kskssssksk..", "..kssssssssk..", "..ksssppsssk..",
  "..kksssssskk..", "..kk..ss..kk..", ".kkppppppppkk.", ".pppppppppppp.", ".pprpppppprpp.", ".pprpppppprpp.", ".ss.pppppp.ss.", "....bbbbbb....",
  "....bbbbbb....", "....bb..bb....", "....bb..bb....", "...kkk..kkk..."];
const KARIM = ["...kkkkkkkk...", ".kkkkkkkkkkkk.", "...kkkkkkkky..", "...ssssssssy..", "...skssssks...", "...ssssssss...", "...sssmmsss...",
  "....ssssss....", ".....ssss.....", "..wwwwrrwwww..", ".wwwwwrrwwwww.", ".wwwwwrrwwwww.", ".ww.wwrrww.ww.", ".ss.mmmmmm.ss.", "....mmmmmm....",
  "....mm..mm....", "....mm..mm....", "...kkk..kkk..."];
const SANDRINE = ["......mm......", ".....mmmm.....", "...mmmmmmmm...", "..mmssssssmm..", "..mkkksskkkm..", "..mssssssssm..", "...sssppsss...",
  "....ssssss....", ".....ssss.....", "..rrrwwwwrrr..", ".rrrrrwwrrrrr.", ".rrrrrwwrrrrr.", ".rr.rrrrrr.rr.", ".ss.kkkkkk.ss.", "....kkkkkk....",
  "....kk..kk....", "....kk..kk....", "...rrr..rrr..."];
const DETENU = [".ss........ss.", ".ss........ss.", ".ww..mmmm..ww.", ".kk.mmmmmm.kk.", ".ww.ssssss.ww.", ".kk.skssks.kk.", ".ww.ssssss.ww.",
  ".kk.smmmms.kk.", ".ww..ssss..ww.", ".kkwwwwwwwwkk.", "..kkkkkkkkkk..", "..wwwwwwwwww..", "..kkkkkkkkkk..", "...wwwwwwww...", "...kkk..kkk...",
  "...www..www...", "...kkk..kkk...", "...mm....mm..."];
const TEL = ["kkkkkk", "kwwwwk", "kwrrwk", "kwwwwk", "kwwwwk", "kkwwkk", "kkkkkk"];
const PERSOS = [
  { n: 1, nom: "L'ALTERNANCE", rows: LINA },
  { n: 2, nom: "LE 1ER JOB", rows: KARIM },
  { n: 3, nom: "LA RECONVERSION", rows: SANDRINE },
  { n: 4, nom: "LA CELLULE", rows: DETENU },
];
export const FOND = "#3B1012";

// une case de l'écran de sélection (ou la grande carte d'un profil) ; traction : barre en haut, les 2 premières lignes du
// sprite (les mains) restent sur la barre et le corps monte de dy ; prison : traction + barreaux devant (réutilisée par MonCV)
export const Carte: React.FC<{ rows: string[]; px: number; n: number | string; on?: boolean; s: number; dy?: number; prison?: boolean; traction?: boolean }> = ({ rows, px, n, on, s, dy = 0, prison, traction = prison }) => (
  <div style={{ position: "relative", width: s, height: s, background: FOND, border: `6px solid ${on ? RED : W_}`, boxShadow: on ? "0 0 40px rgba(232,38,43,0.7)" : undefined, overflow: "hidden" }}>
    {traction && <div style={{ position: "absolute", left: 0, right: 0, top: s * 0.94 - rows.length * px + px * 0.3, height: px * 0.9, background: "#8A8580" }} />}
    {traction ? (
      <>{/* les mains restent sur la barre, le corps monte de dy */}
        <div style={{ position: "absolute", left: "50%", top: s * 0.94 - rows.length * px, transform: "translateX(-50%)" }}><Pix rows={rows.slice(0, 2)} px={px} /></div>
        <div style={{ position: "absolute", left: "50%", top: s * 0.94 - (rows.length - 2) * px - dy, transform: "translateX(-50%)" }}><Pix rows={rows.slice(2)} px={px} /></div>
      </>
    ) : <div style={{ position: "absolute", left: "50%", top: s * 0.94 - rows.length * px - dy, transform: "translateX(-50%)" }}><Pix rows={rows} px={px} /></div>}
    {prison && [0.12, 0.34, 0.66, 0.88].map((x) => <div key={x} style={{ position: "absolute", left: `${x * 100}%`, top: 0, bottom: 0, width: px * 0.7, background: "rgba(138,133,128,0.55)" }} />)}
    <div style={{ position: "absolute", left: 0, top: 0, padding: "2px 12px", background: on ? RED : W_, fontFamily: PIX, fontWeight: 700, fontSize: Math.max(40, s * 0.13), color: on ? W_ : INK }}>{n}</div>
  </div>
);

// une jauge de jeu en 10 crans : étapes [instant, niveau] (montée en 0,4 s), boucle (s'enchaîne), ou « décousue » jusqu'à un instant
export type Jauge = { label: string; a: number; etapes: [number, number][]; red?: boolean; boucle?: boolean; decousu?: number; tag?: [string, number]; texte?: (t: number) => string };
const niveau = (t: number, j: Jauge) => {
  if (j.boucle) return ((t - j.a) / 0.9) % 1.15;
  let v = 0;
  for (const [a, n] of j.etapes) if (t >= a) v = v + (n - v) * clamp((t - a) / 0.4);
  return v;
};
const MOTIF = [1, 0, 1, 1, 0, 0, 1, 0, 1, 0];
export const Stat: React.FC<{ t: number; j: Jauge }> = ({ t, j }) => {
  if (t < j.a) return null;
  const v = Math.round(clamp(niveau(t, j)) * 10), casse = j.decousu !== undefined && t < j.decousu;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "14px 0", position: "relative" }}>
      <span style={{ width: 420, fontFamily: PIX, fontWeight: 700, fontSize: 40, color: W_ }}>{j.label}</span>
      {j.texte ? <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 52, color: RED }}>{j.texte(t)}</span> : (
        <div style={{ display: "flex", gap: 5 }}>
          {Array.from({ length: 10 }, (_, k) => {
            const plein = casse ? MOTIF[k] === 1 : k < v;
            return <span key={k} style={{ width: 26, height: 40, background: plein ? (j.red || (j.decousu !== undefined && !casse) ? RED : W_) : "#3A2526", transform: casse ? `translateY(${(MOTIF[(k + Math.floor(t * 6)) % 10] - 0.5) * 10}px)` : undefined }} />;
          })}
        </div>
      )}
      {j.tag && t >= j.tag[1] && <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", opacity: Math.floor(t * 4) % 2 ? 1 : 0.75 }}><Tag text={j.tag[0]} red size={40} style={{ boxShadow: "0 0 30px rgba(232,38,43,0.8)" }} /></div>}
    </div>
  );
};

// la fiche d'un profil : « N°x » + nom, la grande carte, puis les jauges qui arrivent avec la voix
const Fiche: React.FC<{ t: number; k: number; jauges: Jauge[]; dy?: number; extra?: React.ReactNode }> = ({ t, k, jauges, dy = 0, extra }) => {
  const p = PERSOS[k], a = PH[k + 1][0] - 0.15;
  return (
    <>
      <P t={t} a={a} x={X} y={350}><div style={{ display: "flex", alignItems: "center", gap: 20 }}><BigTT text={`#${p.n}`} size={64} color={RED} /><Tag text={p.nom} size={40} /></div></P>
      <P t={t} a={a + 0.05} x={X} y={600}><Carte rows={p.rows} px={15} n={p.n} on s={340} dy={dy} prison={p.n === 4} /></P>
      {extra}
      {t >= jauges[0].a && <P t={t} a={jauges[0].a} x={X} y={965}><Win title="STATS" w={800} ts={30}>{jauges.map((j) => <Stat key={j.label} t={t} j={j} />)}</Win></P>}
    </>
  );
};

const Scenes: React.FC<{ t: number }> = ({ t }) => {
  if (scene(t, 0)) {
    const tous = t >= at(13), sel = Math.floor((t + 0.2) / 0.32) % 4;
    return (
      <>
        <P t={t} a={-0.2} x={X} y={405}>{t < at(6) ? <BigTT text={"TU LE SAIS\nPAS ENCORE..."} size={64} /> : <BigTT text={"T'ES L'UN\nDE CES 4"} size={80} color={RED} />}</P>
        {PERSOS.map((p, j) => (
          <P key={p.n} t={t} a={-0.2 + j * 0.1} x={X + (j % 2 ? 160 : -160)} y={j < 2 ? 690 : 1005}>
            <Carte rows={p.rows} px={11} n={p.n} on={tous ? Math.floor(t * 5) % 2 === 0 : sel === j} s={300} prison={p.n === 4} />
          </P>
        ))}
      </>
    );
  }
  if (scene(t, 1)) return <Fiche t={t} k={0} jauges={[
    { label: "DEADLINE", a: at(20), etapes: [[at(20), 1]], red: true },
    { label: "SOMMEIL", a: at(24), etapes: [[at(24), 0.2]] },
    { label: "POTENTIEL", a: at(33), etapes: [[at(33), 0.1], [at(41), 1]], tag: ["MAX", at(43)] },
  ]} />;
  if (scene(t, 2)) return <Fiche t={t} k={1} jauges={[
    { label: "CANDIDATURES", a: at(55), etapes: [], boucle: true },
    { label: "TALENT", a: at(63), etapes: [[at(63), 1]] },
    { label: "SUR TON CV", a: at(66), etapes: [[at(66), 0.2]], red: true, tag: ["???", at(70)] },
  ]} />;
  if (scene(t, 3)) return <Fiche t={t} k={2} jauges={[
    { label: "EXPÉRIENCE", a: at(81), etapes: [[at(81), 1]] },
    { label: "CE DOMAINE", a: at(83), etapes: [[at(83), 0.1]] },
    { label: "PARCOURS", a: at(92), etapes: [[at(92), 1]], decousu: at(100), tag: ["TA FORCE", at(100)] },
  ]} />;
  if (scene(t, 4)) {
    const a = PH[4][0], arret = at(119), rep = (Math.min(t, arret) - a) / 0.7, dy = t < arret ? Math.round((1 - Math.abs(Math.cos(rep * Math.PI))) * 2) / 2 * 30 : 0;
    const tel = t >= arret;
    return <Fiche t={t} k={3} dy={dy} jauges={[
      { label: "TRACTIONS", a: at(114), etapes: [], texte: () => String(20 + Math.max(0, Math.floor((Math.min(t, arret) - a) / 0.7))) },
      { label: "TÉLÉPHONE", a: arret, etapes: [], texte: () => "TROUVÉ" },
      { label: "SORTIE", a: at(122), etapes: [[at(122), 0.3], [at(125), 0.7]], red: true },
    ]} extra={tel && <P t={t} a={arret} x={X + 270} y={520}><div style={{ transform: `rotate(${(Math.floor(t * 14) % 2 ? 1 : -1) * (t < arret + 0.9 ? 12 : 0)}deg)` }}><Pix rows={TEL} px={16} /></div></P>} />;
  }
  if (scene(t, 5)) return (
    <>
      <FinMyMotiv t={t} aLogo={at(131)} aWin={at(136)} etapes={[["PART DE L'OFFRE", at(137)], ["ET DE TON CV", at(142)], ["TES VRAIES PREUVES", at(147)]]} aOffre={99} aBio={99} />
      {t < at(151) ? (
        <div style={{ position: "absolute", left: X, top: 1010, transform: "translate(-50%, -50%)", display: "flex", gap: 20 }}>
          {PERSOS.map((p, j) => t >= PH[5][0] - 0.1 + j * 0.12 && <Carte key={p.n} rows={p.rows} px={5} n={p.n} on={t >= at(130) && Math.floor(t * 4 + j) % 2 === 0} s={150} prison={p.n === 4} />)}
        </div>
      ) : <P t={t} a={at(151)} x={X} y={1010}><Tag text={"DONNE-TOI TOUTES\nLES CHANCES"} red size={44} style={deux()} /></P>}
    </>
  );
  if (scene(t, 6)) return (
    <>
      <CtaCommentaire t={t} aOffre={at(168)} aBio={at(171)} aWin={at(156)} aType={at(159)} label={"MOI, C'EST\nLE ..."} />
      {t >= PH[7][0] - 0.1 && (
        <P t={t} a={PH[7][0] - 0.1} x={X} y={1060}>
          <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
            <Carte rows={DETENU} px={5} n={4} on s={140} prison />
            {t >= at(179) && <Tag text={"RENDS LE\nTÉLÉPHONE."} red size={44} style={deux()} />}
          </div>
        </P>
      )}
    </>
  );
  return null;
};

export const TesLequel: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const coups = [PH[1][0], PH[2][0], PH[3][0], PH[4][0], at(179)];
  const glitch = t < 0.18 || coups.some((c) => t > c - 0.12 && t < c + 0.06) || (t > at(100) && t < at(100) + 0.12);
  return <Ecran t={t} glitch={glitch} audio="audio/lequel.wav" zoom={1} caption={<Caption t={t} />}><Scenes t={t} /></Ecran>;
};
