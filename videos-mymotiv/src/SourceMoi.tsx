// « Source : moi » (≈71 s, 30 i/s, 9:16) : script du propriétaire (16/10/2026). Yann masqué enchaîne des « faits » appuyés
// par des sources (cartes 📄 avec un petit astérisque rose), coupe ses phrases (boucles ouvertes), puis révèle : « toutes
// ces sources, je les ai inventées » → tampons « INVENTÉ ». Une source ne rend pas une info vraie, elle la fait paraître
// vraie ; la lettre de motivation fait pareil (« rigoureux, passionné », sans preuve) ; MyMotiv fait l'inverse : la preuve
// de la lettre vient du CV (vraies captures public/tuto-tel/ : la phrase « 18 % » de la lettre ← la ligne du CV).
// Garde-fous : toutes les sources sont inventées ET aucune ne porte le nom d'une vraie institution (pas d'université,
// d'école ni d'organisme réels) ; les faux chiffres ne parlent jamais de MyMotiv et sont tamponnés « INVENTÉ » dans la même
// vidéo ; la fin donne le seul vrai conseil (mains propres avant les lentilles). Voix : voix-source.json (--voix yann,
// la 1re phrase reprend celle de « Boucles ouvertes »). Son : synth_source.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce } from "./apple";
import { PINK, PINK_L, easeInOut, seg } from "./common";
import voix from "./data/source-voix.json";
import { makeCaption } from "./FauxDM";
import { INK, K, Mot, fit } from "./kinetic";
import { CAP_BOX } from "./pixelTT";
import { FinOfferte, X, horloge } from "./pubMotion";
import "./fonts";

const { PH, at, sc } = horloge(voix);
const FIN = PH[10][1] - 0.15;                                       // l'accroche revient : la vidéo boucle
export const SOURCE_DUR = PH[10][1] + 0.5;
const HOT = new Set(["lentilles", "telephone", "bacteries", "toilettes", "yeux", "dubacterie", "pire", "attends", "normal", "oublient", "milliards",
  "officiel", "fou", "inventees", "existe", "hoche", "tete", "source", "vraie", "paraitre", "rigoureux", "passionne", "prouve", "suivante",
  "mymotiv", "inverse", "cv", "vraies", "vrais", "toi", "fausses", "offerte", "bio", "mains", "sens"]);
const Caption = makeCaption(voix, HOT, CAP_BOX, PINK);
const EMOJI = "'Noto Color Emoji'";
const VERT = "#22C55E";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const pop = (t: number, a: number) => bounce(t, [[a, 0.55], [a + 0.2, 1]], 0.09, 3, 7);
const slamS = (t: number, a: number) => bounce(t, [[a, 1.7], [a + 0.14, 1]], 0.12, 3, 7);

// ─── les temps clés ───
const S = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (i ? sc(i) : 0));
const COUPE1 = at(55) + 0.15, COUPE3 = at(101) + 0.15;              // « … c'est que… » : la phrase s'arrête net
const T_TAMPON = at(109) - 0.1;                                     // « inventées »
const T_HOCHE = at(128) - 0.1;
const T_FIN = at(234) - 0.1;                                        // « Ta première lettre est offerte »

// ─── Yann face caméra ───
const POSES: [number, string][] = [
  [-1, "g2-argumenter"], [S[1], "g2-preciser"], [S[2], "g2-expliquer"], [at(44) - 0.1, "g1-preciser"], [at(51) - 0.1, "emo-peur"],
  [S[3], "emo-confusion"], [at(62) - 0.1, "g1-dialoguer"], [S[4], "emo-reflexion"], [at(90) - 0.1, "g2-insister"], [S[5], "emo-joie"],
  [at(124) - 0.1, "g2-affirmer"], [S[6], "g1-expliquer"], [S[9], "g1-convaincre"], [S[10], "g2-partager"], [FIN, "g2-argumenter"],
];
const Yann: React.FC<{ t: number }> = ({ t }) => {
  let k = 0;
  POSES.forEach(([a], i) => { if (t >= a) k = i; });
  const [a, pose] = POSES[k];
  const serre = t >= S[5] && t < S[6] ? ease(t, S[5], S[5] + 0.25) * 0.22 : 0;             // la révélation : plan serré
  const punch = 1 + 0.035 * Math.exp(-(t - a) * 10) + serre + (t >= S[3] && t < S[4] ? 0.06 : 0);
  const sx = Math.sin(t * 1.9) * 6, sy = Math.cos(t * 1.4) * 5, rz = Math.sin(t * 1.1) * 0.8;
  const glitch = (t >= S[3] && t < S[3] + 0.35) || (t >= S[5] && t < S[5] + 0.25) ? Math.sin(t * 90) * 14 : 0;
  const hoche = t >= T_HOCHE && t < T_HOCHE + 1.3 ? Math.sin((t - T_HOCHE) * Math.PI * 2 * 2.2) * 18 : 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 72% 22%, #6B5446 0%, #3E322B 32%, #1E1916 70%, #110E0C 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 640, top: 140, width: 420, height: 760, background: "rgba(255,236,214,0.15)", filter: "blur(70px)" }} />
      <div style={{ position: "absolute", left: X - 560, top: 600, width: 1120, height: 1380, transformOrigin: "50% 25%", transform: `translate(${sx + glitch}px, ${sy + hoche}px) rotate(${rz}deg) scale(${punch})` }}>
        <Img src={staticFile(`yann/${pose}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 100%" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// ─── une carte « 📄 SOURCE » (fausse : astérisque rose ; vraie : bord vert et ✓) ───
type Src = { titre: string; detail: string; emoji?: string; court?: string };
const SRC: Src[] = [
  { titre: "Institut Européen de la Lentille Propre", detail: "Étude 2023", court: "Institut de la Lentille Propre" },
  { titre: "Pr. Jean-Michel Dubactérie", detail: "Faculté des Sciences Oculaires · 2021", emoji: "👨‍🔬", court: "Pr. J.-M. Dubactérie" },
  { titre: "Étude internationale sur la mémoire courte", detail: "47 000 participants", court: "Étude « mémoire courte »" },
  { titre: "Revue des Probabilités Humaines", detail: "Vol. 12", court: "Revue des Probabilités" },
  { titre: "Centre National de la Statistique Étonnante", detail: "Rapport officiel n° 4471-B", court: "Centre de la Statistique Étonnante" },
];
const Tampon: React.FC<{ t: number; a: number; text: string; size: number; x: number; y: number; rot?: number }> = ({ t, a, text, size, x, y, rot = -8 }) =>
  t < a ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${slamS(t, a)})`, padding: "4px 18px", border: `${Math.round(size / 9)}px solid #E8262B`, borderRadius: 12,
      color: "#E8262B", fontFamily: K, fontWeight: 900, fontSize: size, letterSpacing: 2, whiteSpace: "nowrap", background: "rgba(255,253,249,0.82)", zIndex: 3 }}>{text}</div>
  );
const Carte: React.FC<{ t: number; a: number; b?: number; s: Src; y: number; vrai?: boolean; tampon?: number; secoue?: number; compact?: boolean; enfant?: React.ReactNode }> = ({ t, a, b, s, y, vrai, tampon, secoue, compact, enfant }) => {
  if (t < a || (b !== undefined && t >= b)) return null;
  const tremble = secoue !== undefined && t >= secoue && t < secoue + 0.35 ? Math.sin((t - secoue) * 80) * 10 : 0;
  const eteint = secoue !== undefined && t >= secoue ? 1 - 0.45 * seg(t, secoue + 0.2, secoue + 0.5) : 1;
  return (
    <div style={{ position: "absolute", left: X - 390, top: y, width: 780, height: compact ? 96 : undefined, padding: compact ? "0 24px 0 26px" : "18px 30px 20px 34px", boxSizing: "border-box", borderRadius: 20, background: "#FFFDF9",
      display: compact ? "flex" : "block", alignItems: "center",
      borderLeft: `12px solid ${vrai ? VERT : "#9AA3B5"}`, boxShadow: "0 18px 46px rgba(0,0,0,0.55)", transform: `translateX(${tremble}px) scale(${pop(t, a)})`, opacity: eteint, zIndex: 12 }}>
      {!compact && <div style={{ fontFamily: `'Open Sans', ${EMOJI}`, fontWeight: 700, fontSize: 24, letterSpacing: 3, color: vrai ? "#15803D" : "#7C8596" }}>{vrai ? "📄 SOURCE VÉRIFIÉE ✓" : "📄 SOURCE"}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: compact ? 0 : 6 }}>
        {s.emoji && <div style={{ width: compact ? 56 : 84, height: compact ? 56 : 84, borderRadius: "50%", background: "#E9EDF5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: EMOJI, fontSize: compact ? 34 : 52, flexShrink: 0 }}>{s.emoji}</div>}
        <div>
          <div style={{ fontFamily: `Georgia, 'DejaVu Serif', serif, ${EMOJI}`, fontWeight: 700, fontSize: compact ? 29 : 40, lineHeight: 1.15, color: "#1D1D1F", whiteSpace: compact ? "nowrap" : "normal" }}>{compact && !s.emoji ? "📄 " : ""}{compact ? s.court ?? s.titre : s.titre}</div>
          {!compact && <div style={{ fontFamily: "'Open Sans'", fontSize: 28, color: "#6B7280", marginTop: 4 }}>{s.detail}</div>}
        </div>
      </div>
      {enfant}
      {!vrai && <div style={{ position: "absolute", right: 18, top: 6, fontFamily: K, fontWeight: 900, fontSize: compact ? 44 : 58, color: PINK }}>*</div>}
      {tampon !== undefined && <Tampon t={t} a={tampon} text="INVENTÉ" size={compact ? 36 : 60} x={compact ? 672 : 560} y={compact ? 48 : 70} />}
    </div>
  );
};

// ─── pastille (conseil, comparaison) ───
const Pastille: React.FC<{ t: number; a: number; b: number; y: number; text: string; rose?: boolean; size?: number }> = ({ t, a, b, y, text, rose, size = 46 }) =>
  t < a || t >= b ? null : (
    <div style={{ position: "absolute", left: X, top: y, transform: `translate(-50%, -50%) scale(${pop(t, a)})`, padding: "12px 28px", borderRadius: 24, background: rose ? PINK : "#fff", color: rose ? "#fff" : INK,
      fontFamily: `${K}, Poppins, ${EMOJI}`, fontWeight: 800, fontSize: size, whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", zIndex: 13 }}>{text}</div>
  );

// ─── la lettre « qui sonne bien » : rigoureux, passionné, esprit d'équipe… et aucune preuve ───
const MOTS_CREUX: [string, number][] = [["rigoureux", at(164) - 0.1], ["passionné", at(165) - 0.1], ["esprit d'équipe", at(166) - 0.1]];
const LettreCreuse: React.FC<{ t: number }> = ({ t }) => {
  const a = at(161) - 0.15, hoche = at(184) - 0.1, part = at(189) - 0.1;
  const nod = t >= hoche && t < part ? Math.sin((t - hoche) * Math.PI * 2 * 2.2) * 16 : 0;
  const sortie = ease(t, part, part + 0.4);
  const mot = (w: string, ta: number) => (
    <span style={{ position: "relative", whiteSpace: "nowrap", background: t >= ta ? `linear-gradient(transparent 55%, ${PINK_L} 55%)` : "none", backgroundSize: `${seg(t, ta, ta + 0.25) * 100}% 100%`, backgroundRepeat: "no-repeat" }}>
      {w}
      {t >= ta && <span style={{ position: "absolute", left: "50%", top: -36, transform: `translateX(-50%) scale(${pop(t, ta)})`, padding: "0 12px", lineHeight: 1.4, borderRadius: 14, background: PINK, color: "#fff",
        fontFamily: `${K}, Poppins`, fontWeight: 800, fontSize: 23, whiteSpace: "nowrap" }}>source ?</span>}
    </span>
  );
  return (
    <>
      {/* la lettre d'après, déjà dans la pile */}
      <div style={{ position: "absolute", left: X - 370, top: 470, width: 740, height: 640, borderRadius: 18, background: "#EFEAE2", transform: "rotate(3deg)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)", opacity: seg(t, a, a + 0.3) }} />
      <div style={{ position: "absolute", left: X - 390, top: 440, width: 780, height: 680, padding: "50px 54px", boxSizing: "border-box", borderRadius: 18, background: "#FFFDF9", boxShadow: "0 30px 70px rgba(0,0,0,0.6)",
        transform: `translate(${-1300 * sortie}px, ${nod}px) rotate(${-2 - 14 * sortie}deg) scale(${pop(t, a)})`, fontFamily: "Georgia, 'DejaVu Serif', serif", fontSize: 40, lineHeight: 1.85, color: "#2B2B2B" }}>
        <div>Madame, Monsieur,</div>
        <div style={{ marginTop: 34 }}>
          Je suis {mot("rigoureux", MOTS_CREUX[0][1])}, {mot("passionné", MOTS_CREUX[1][1])} et doté d'un excellent {mot("esprit d'équipe", MOTS_CREUX[2][1])}. Mon profil correspond parfaitement à vos attentes.
        </div>
        {[0.9, 0.75].map((w, i) => <div key={i} style={{ height: 14, width: `${w * 100}%`, background: "#D9D3CA", borderRadius: 4, marginTop: i ? 22 : 40 }} />)}
        <Tampon t={t} a={at(174) - 0.1} text="AUCUNE PREUVE" size={66} x={340} y={520} rot={-10} />
      </div>
    </>
  );
};

// ─── MyMotiv : la preuve de la lettre vient du CV (vraies captures du site) ───
const L040 = { x: 83, y: 351, w: 915, h: 609 }, ZL = 0.82;          // haut de la vraie lettre (logo, « Maison Lumen », 1er paragraphe)
const CV044 = { x: 140, y: 1532, w: 790, h: 70 }, ZC = 0.88;        // la ligne du CV : « Panier moyen en hausse de 18 % en 2024 »
const PreuveCV: React.FC<{ t: number }> = ({ t }) => {
  const aL = S[8] + 0.2, aBox = at(200) - 0.1, aCV = at(209) - 0.1, aLien = aCV + 0.15;
  const top = 395, lx = X - (L040.w * ZL) / 2;
  const hl = { x: lx + (140 - L040.x) * ZL, y: top + (808 - L040.y) * ZL, w: 790 * ZL, h: 134 * ZL };
  const cvTop = 925;
  return (
    <>
      <div style={{ position: "absolute", left: lx, top, width: L040.w * ZL, height: L040.h * ZL, borderRadius: 26, overflow: "hidden", boxShadow: "0 40px 90px rgba(0,0,0,0.6)", transform: `scale(${pop(t, aL)})`, zIndex: 10 }}>
        <Img src={staticFile("tuto-tel/040-lettre.jpg")} style={{ position: "absolute", left: -L040.x * ZL, top: -L040.y * ZL, width: 1080 * ZL, height: 1920 * ZL }} />
      </div>
      {t >= aBox && <div style={{ position: "absolute", left: hl.x - 10, top: hl.y - 8, width: hl.w + 20, height: hl.h + 16, borderRadius: 16, border: `6px solid ${PINK}`, boxShadow: `0 0 30px ${PINK}`,
        opacity: seg(t, aBox, aBox + 0.2), zIndex: 11 }} />}
      {t >= aLien && <div style={{ position: "absolute", left: X - 4, top: hl.y + hl.h + 8, width: 8, height: (cvTop - (hl.y + hl.h + 8)) * ease(t, aLien, aLien + 0.3), background: PINK, borderRadius: 4, boxShadow: `0 0 18px ${PINK}`, zIndex: 11 }} />}
      <Carte t={t} a={aCV} s={{ titre: "Ton CV", detail: "Ta vraie expérience, ton vrai résultat" }} y={cvTop} vrai
        enfant={<div style={{ marginTop: 12, width: CV044.w * ZC, height: CV044.h * ZC, overflow: "hidden", borderRadius: 10, border: `4px solid ${PINK}`, position: "relative" }}>
          <Img src={staticFile("tuto-tel/044-cv-adapte.jpg")} style={{ position: "absolute", left: -CV044.x * ZC, top: -CV044.y * ZC, width: 1080 * ZC, height: 1920 * ZC }} />
        </div>} />
    </>
  );
};

const FOND_MARQUE = "radial-gradient(circle at 50% 40%, #3A2327 0%, #1E1719 38%, #0B0A0B 78%)";

export const SourceMoi: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const fin = t >= FIN;
  const scene = t < S[7] || t >= S[9] ? "yann" : "marque";
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      {scene === "yann" ? <Yann t={t} /> : <AbsoluteFill style={{ background: FOND_MARQUE }} />}

      {/* l'accroche (et la toute fin, pour que la vidéo boucle) */}
      {(t < S[1] || fin) && (
        <>
          <Mot t={fin ? t + 1 : t} a={-0.5} text="AVANT TES LENTILLES" y={320} size={fit("AVANT TES LENTILLES", 84)} />
          <Mot t={fin ? t + 1 : t} a={-0.45} text={"NE TOUCHE JAMAIS\nTON TÉLÉPHONE"} y={455} size={fit("NE TOUCHE JAMAIS\nTON TÉLÉPHONE", 92)} color={PINK} lh={0.98} />
        </>
      )}

      {/* fausse source 1 : les bactéries */}
      <Mot t={t} a={at(19) - 0.1} b={at(44) - 0.15} text="×10" y={380} size={190} color={PINK} slam ext="#3A1A1F" depth={8} />
      <Mot t={t} a={at(23) - 0.1} b={at(44) - 0.15} text="DE BACTÉRIES" y={520} size={fit("DE BACTÉRIES", 90)} />
      <Carte t={t} a={at(28) - 0.15} b={at(44) - 0.15} s={SRC[0]} y={610} />
      {/* fausse source 2 : le professeur */}
      <Carte t={t} a={at(47) - 0.1} b={COUPE1 + 0.05} s={SRC[1]} y={330} />

      {/* le faux oubli */}
      {t >= S[3] && t < at(65) - 0.1 && <div style={{ position: "absolute", left: X + 230, top: 520, fontFamily: K, fontWeight: 900, fontSize: 150, color: "#fff", opacity: 0.9, transform: `scale(${pop(t, S[3] + 0.3)}) rotate(12deg)`, zIndex: 13 }}>?</div>}
      {/* fausse source 3 : la mémoire */}
      <Mot t={t} a={at(65) - 0.1} b={at(84) - 0.15} text="73 %" y={380} size={180} color={PINK} slam ext="#3A1A1F" depth={8} />
      <Mot t={t} a={at(69) - 0.1} b={at(84) - 0.15} text={"OUBLIENT\nLEUR PHRASE"} y={560} size={fit("OUBLIENT\nLEUR PHRASE", 80)} lh={1} />
      <Carte t={t} a={at(71) - 0.1} b={at(84) - 0.15} s={SRC[2]} y={680} />

      {/* fausses sources 4 et 5 : la probabilité d'être né */}
      <Mot t={t} a={at(84) - 0.1} b={COUPE3 + 0.05} text="1 CHANCE SUR" y={360} size={fit("1 CHANCE SUR", 80)} />
      <Mot t={t} a={at(87) - 0.1} b={COUPE3 + 0.05} text={"400 000\nMILLIARDS"} y={510} size={fit("400 000\nMILLIARDS", 104)} color={PINK} slam ext="#3A1A1F" depth={8} lh={0.95} />
      <Carte t={t} a={at(89) - 0.1} b={COUPE3 + 0.05} s={SRC[3]} y={640} />
      <Carte t={t} a={at(94) - 0.1} b={COUPE3 + 0.05} s={SRC[4]} y={865} />

      {/* la révélation : toutes les sources, tamponnées */}
      {t >= S[5] && t < at(124) - 0.1 && SRC.map((s, i) => (
        <Carte key={i} t={t} a={at(103) - 0.1 + i * 0.08} s={s} y={300 + i * 112} compact tampon={T_TAMPON + i * 0.15}
          secoue={i === 1 ? at(115) - 0.1 : i === 3 ? at(122) - 0.1 : undefined} />
      ))}
      <Mot t={t} a={T_HOCHE} b={S[6]} text={"T'AS HOCHÉ\nLA TÊTE."} y={430} size={fit("T'AS HOCHÉ\nLA TÊTE.", 110)} color={PINK} slam ext="#3A1A1F" depth={8} lh={0.95} />

      {/* une source ne rend pas une info vraie */}
      <Mot t={t} a={at(134) - 0.1} b={at(144) - 0.1} text="UNE SOURCE" y={360} size={fit("UNE SOURCE", 100)} />
      <Mot t={t} a={at(139) - 0.1} b={at(144) - 0.1} text={"NE REND PAS\nUNE INFO VRAIE."} y={510} size={fit("NE REND PAS\nUNE INFO VRAIE.", 84)} lh={1} />
      <Mot t={t} a={at(144) - 0.1} b={S[7]} text={"ELLE LA FAIT\nPARAÎTRE VRAIE."} y={440} size={fit("ELLE LA FAIT\nPARAÎTRE VRAIE.", 96)} color={PINK} slam ext="#3A1A1F" depth={8} lh={0.98} />

      {/* la lettre qui sonne bien */}
      {t >= S[7] && t < S[8] && (
        <>
          <Mot t={t} a={S[7] + 0.05} text="TA LETTRE DE MOTIV" y={330} size={fit("TA LETTRE DE MOTIV", 80)} color={PINK} />
          <LettreCreuse t={t} />
        </>
      )}
      {/* MyMotiv fait l'inverse */}
      {t >= S[8] && t < S[9] && (
        <>
          <Mot t={t} a={S[8] + 0.05} b={at(215) - 0.1} text="MYMOTIV FAIT L'INVERSE" y={330} size={fit("MYMOTIV FAIT L'INVERSE", 80)} color={PINK} />
          <Mot t={t} a={at(215) - 0.1} text="TA SOURCE, C'EST TOI." y={330} size={fit("TA SOURCE, C'EST TOI.", 84)} color={PINK} slam ext="#3A1A1F" depth={6} />
          <PreuveCV t={t} />
        </>
      )}

      {/* fausses sources contre vraies preuves, puis l'offre */}
      <Pastille t={t} a={at(220) - 0.1} b={T_FIN} y={420} text="❌ Moi : de fausses sources" />
      <Pastille t={t} a={at(229) - 0.1} b={T_FIN} y={540} text="✅ Toi : tes vraies preuves" rose />
      {t >= T_FIN && t < S[10] && <AbsoluteFill style={{ background: FOND_MARQUE, zIndex: 9 }} />}
      {t >= T_FIN && t < S[10] && <FinOfferte t={t} t0={T_FIN} aBio={at(239) - 0.05} dark sous="Sans carte bancaire." />}

      {/* la seule vraie source */}
      <Pastille t={t} a={at(244) - 0.1} b={FIN} y={360} text="🧼 Mains propres avant tes lentilles" rose size={40} />
      <Carte t={t} a={at(253) - 0.15} b={FIN} s={{ titre: "Le bon sens", detail: "et n'importe quel ophtalmo" }} y={460} vrai />

      {t >= S[1] - 0.05 && !fin && !(t >= T_FIN && t < S[10]) && <div style={{ position: "absolute", inset: 0, zIndex: 25 }}><Caption t={t} /></div>}
      <Audio src={staticFile("audio/source.wav")} />
    </AbsoluteFill>
  );
};
