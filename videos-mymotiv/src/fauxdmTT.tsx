// Écrans communs de « Le faux DM » cadré TikTok (FauxDMTikTok ≈1 min 46 et FauxDM30TikTok ≈33 s) : chaque bloc reçoit
// ses instants d'apparition (calés sur les mots de la voix) et reste dans les zones sûres de src/tiktok.ts.
import React from "react";
import { Img, staticFile } from "remotion";
import { clamp } from "./common";
import { Avatar, GREY, ICON, P, PINK, PIX, Pix, RED, Tag, W_, Win } from "./FauxDM";
import { Barre, Bulle, X, deux } from "./pixelTT";

type Tps = { t: number };
const Big: React.FC<{ text: string; size: number; color?: string }> = ({ text, size, color = W_ }) => (
  <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: size, color, lineHeight: 1.05, textAlign: "center", whiteSpace: "pre" }}>{text}</div>
);
export { Big as BigTT };

// la notification : en haut, des étiquettes qui se remplacent ; l'avatar (silhouette générique) ; l'enveloppe ; « félicitations » barré
export const Notif: React.FC<Tps & { hauts: [string, number, boolean?][]; aEnv: number; aFel: number }> = ({ t, hauts, aEnv, aFel }) => {
  let h = -1; hauts.forEach(([, a], i) => { if (t >= a) h = i; });
  return (
    <>
      {h >= 0 && <P key={h} t={t} a={hauts[h][1]} x={X} y={350}><Tag text={hauts[h][0]} red={hauts[h][2]} size={42} /></P>}
      <P t={t} a={-0.2} x={X} y={700}><Avatar t={t} size={360} ns={40} /></P>
      <P t={t} a={aEnv} x={X + 255} y={480}><div style={{ position: "relative" }}><Pix rows={ICON.envelope} px={11} /><div style={{ position: "absolute", right: -16, top: -16, width: 40, height: 40, background: RED, color: W_, fontFamily: PIX, fontWeight: 700, fontSize: 28, textAlign: "center", lineHeight: "40px" }}>1</div></div></P>
      <P t={t} a={aFel} x={X} y={1095}><div style={{ position: "relative" }}><Tag text="FÉLICITATIONS" size={50} /><svg width={540} height={80} style={{ position: "absolute", left: -20, top: -8 }}><path d="M0 68 L540 6" stroke={RED} strokeWidth={10} /></svg></div></P>
    </>
  );
};

// fenêtre de message privé (expéditeur + répliques)
export const Message: React.FC<Tps & { titre?: string; a: number; y: number; lignes: [string, number, boolean?][]; size?: number }> = ({ t, titre = "MESSAGE PRIVÉ", a, y, lignes, size = 42 }) => (
  <P t={t} a={a} x={X} y={y}>
    <Win title={titre} w={800} ts={30}>
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 6 }}><Pix rows={ICON.person} px={5} /><span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 36, color: W_ }}>SQUEEZIE</span></div>
      {lignes.map(([s, at, red]) => <div key={s}><Bulle t={t} a={at} text={s} red={red} size={size} /></div>)}
    </Win>
  </P>
);

// la proposition / le deal : lignes numérotées, barres qui se remplissent
export const Deal: React.FC<Tps & { titre: string; a: number; y: number; lignes: { s: string; a: number; red?: boolean; barre?: boolean; icone?: string[] }[]; fin?: [string, number] }> = ({ t, titre, a, y, lignes, fin }) => (
  <P t={t} a={a} x={X} y={y}>
    <Win title={titre} w={800} ts={30}>
      <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 36, color: W_, lineHeight: 1.35 }}>
        {lignes.map((l) => t >= l.a && (
          <div key={l.s} style={{ color: l.red ? RED : W_, margin: "6px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 14 }}>{l.s}{l.icone && <Pix rows={l.icone} px={6} />}</span>
            {l.barre && <Barre t={t} a={l.a} d={1.2} />}
          </div>
        ))}
        {fin && t >= fin[1] && <div style={{ marginTop: 14 }}><Tag text={fin[0]} red size={32} /></div>}
      </div>
    </Win>
  </P>
);

// « TOUT EST FAUX » entre deux traits rouges, puis l'œil et « et t'es encore là »
export const ToutEstFaux: React.FC<Tps & { a: number; aEye: number }> = ({ t, a, aEye }) => (
  <>
    {t >= a && <div style={{ position: "absolute", left: 0, right: 0, top: 410, height: 10, background: RED }} />}
    <P t={t} a={a} x={X} y={620}><div style={{ textAlign: "center", fontFamily: PIX, fontWeight: 700, lineHeight: 1.05 }}><div style={{ fontSize: 110, color: W_ }}>TOUT EST</div><div style={{ fontSize: 190, color: RED, transform: `translate(${(Math.sin(t * 60) > 0.6 ? 8 : 0)}px, 0)` }}>FAUX</div></div></P>
    {t >= a && <div style={{ position: "absolute", left: 0, right: 0, top: 830, height: 10, background: RED }} />}
    <P t={t} a={aEye} x={X} y={1040}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Pix rows={ICON.eye} px={10} /><Tag text="ET T'ES ENCORE LÀ." size={44} /></div></P>
  </>
);

// la fenêtre « mécanisme » + « ton cerveau / obligé de rester »
export const Mecanisme: React.FC<Tps & { a: number; aNom: number; nom: string; avant?: string; taille?: number; tag?: [string, number]; aCerveau?: number; aCadenas?: number }> = ({ t, a, aNom, nom, avant = "L'EFFET", taille = 104, tag, aCerveau, aCadenas }) => (
  <>
    <P t={t} a={a} x={X} y={590}>
      <Win title="MÉCANISME" w={800} ts={32}>
        <div style={{ fontFamily: PIX, fontSize: 34, color: GREY }}>NOM :</div>
        {t >= aNom && <div style={{ fontFamily: PIX, fontWeight: 700, lineHeight: 1.05 }}><div style={{ fontSize: 60, color: W_ }}>{avant}</div><div style={{ fontSize: taille, color: RED }}>{nom}</div></div>}
        {tag && t >= tag[1] && <div style={{ marginTop: 18 }}><Tag text={tag[0]} size={34} style={deux({ textAlign: "left" })} /></div>}
      </Win>
    </P>
    {aCerveau !== undefined && <P t={t} a={aCerveau} x={X} y={925}><div style={{ display: "flex", alignItems: "center", gap: 22 }}><Pix rows={ICON.brain} px={13} /><Tag text="TON CERVEAU" size={48} /></div></P>}
    {aCadenas !== undefined && <P t={t} a={aCadenas} x={X} y={1075}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Pix rows={ICON.lock} px={11} /><Tag text="OBLIGÉ DE RESTER" red size={44} /></div></P>}
  </>
);

// le recruteur (endormi ou alerté)
export const Recruteur: React.FC<{ zzz?: boolean; alerte?: boolean }> = ({ zzz, alerte }) => (
  <div style={{ position: "relative", textAlign: "center" }}>
    <Pix rows={ICON.boy} px={16} style={{ margin: "0 auto" }} />
    <div style={{ marginTop: 8 }}><Tag text="RECRUTEUR" size={30} /></div>
    {zzz && <div style={{ position: "absolute", left: 140, top: -40 }}><Pix rows={ICON.zzz} px={11} /></div>}
    {alerte && <div style={{ position: "absolute", left: 140, top: -50 }}><Tag text="!" red size={56} /></div>}
  </div>
);

// « lu jusqu'au bout » : barre qui se remplit (≈ 0,85 em par lettre en police pixel grasse : 30 px tient dans 440 px)
export const Lecture: React.FC<Tps & { a: number; w?: number }> = ({ t, a, w = 440 }) => (
  <div style={{ width: w }}>
    <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 30, color: RED, marginBottom: 10, whiteSpace: "nowrap" }}>LU JUSQU'AU BOUT</div>
    <div style={{ height: 38, border: `5px solid ${W_}` }}><div style={{ width: `${Math.round(clamp((t - a) / 0.9) * 10) * 10}%`, height: "100%", background: RED }} /></div>
  </div>
);

// la fin MyMotiv : logo, fenêtre des 3 étapes, 1re lettre offerte, lien en bio
export const FinMyMotiv: React.FC<Tps & { aLogo: number; aWin: number; etapes: [string, number][]; aOffre: number; aBio: number }> = ({ t, aLogo, aWin, etapes, aOffre, aBio }) => (
  <>
    <P t={t} a={aLogo} x={X} y={400}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 540 }} /></P>
    <P t={t} a={aWin} x={X} y={690}>
      <Win title="MYMOTIV" w={800} ts={32}>
        {etapes.map(([l, a]) => t >= a && <div key={l} style={{ display: "flex", gap: 18, fontFamily: PIX, fontWeight: 700, fontSize: 42, color: W_, margin: "12px 0", whiteSpace: "pre" }}><span style={{ color: PINK }}>✓</span><span>{l}</span></div>)}
      </Win>
    </P>
    <P t={t} a={aOffre} x={X} y={950}><div style={{ padding: "16px 26px", background: PINK, fontFamily: PIX, fontWeight: 700, fontSize: 50, color: W_ }}>1RE LETTRE OFFERTE</div></P>
    <P t={t} a={aBio} x={X} y={1085}><Tag text="LIEN EN BIO ↑" size={52} /></P>
  </>
);

// la fin : l'avatar avec un cœur, « désolé Squeezie », « c'était pour la science »
export const FinScience: React.FC<Tps & { a: number; aDesole: number; aScience: number }> = ({ t, a, aDesole, aScience }) => (
  <>
    <P t={t} a={a} x={X} y={610}><Avatar t={t} size={340} ns={40} heart /></P>
    <P t={t} a={aDesole} x={X} y={925}><Tag text="DÉSOLÉ SQUEEZIE." size={50} /></P>
    <P t={t} a={aScience} x={X} y={1075}><div style={{ display: "flex", alignItems: "center", gap: 18 }}><Tag text={"C'ÉTAIT POUR\nLA SCIENCE."} red size={44} style={deux()} /><Pix rows={ICON.flask} px={11} /></div></P>
  </>
);
