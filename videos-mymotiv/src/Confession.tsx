// « J'ai un très gros problème » (2 min 15, 30 i/s, 9:16) : équivalent 1:1 (même durée, même construction) d'une vidéo de
// référence envoyée par le propriétaire le 16/10/2026 : la confession d'un créateur face à l'IA, en icônes pixel roses sur
// fond gris, avec des « écrans » d'exemples, une liste pour / contre, et la conclusion « ce qui nous rend unique, c'est nous »
// (style mesuré dans styles/confession-pixel.md ; briques src/pixelRose.tsx). Chez nous : Yann avoue que l'IA rend toutes
// les lettres pareilles… alors qu'il vend une IA qui écrit des lettres ; son avis (pas une étude), le pour et le contre
// honnêtes (dont « je suis forcément un peu biaisé »), sa décision : une IA qui part de TOI (vrai site, rien d'inventé, tu
// valides), puis « commente GO » (lien en DM + 1re lettre offerte) et la mention vraie « cette vidéo a été faite avec de
// l'IA, mais l'histoire est la mienne ». Exemples fictifs (Camille, Maison Lumen, Atelier Nova, Boréal Logistique).
// Voix : voix-confession.json (--voix yann). Son : synth_confession.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PINK, easeInOut, lerp, seg } from "./common";
import voix from "./data/confession-voix.json";
import { makeCaption } from "./FauxDM";
import { CAP_BOX } from "./pixelTT";
import { X, horloge } from "./pubMotion";
import { Crt, FondGris, Icone, PixelEmoji, ROSE_C, ROSE_F, ROSE_M, Titre, pop } from "./pixelRose";
import { Capture } from "./splitDemo";
import "./fonts";
import "./fontsPixel";

export const CONFESSION_DUR = voix.duration;
const { at, sc } = horloge(voix);
const A = (i: number) => at(i, 0.1);
const HOT = new Set(["probleme", "ressemblent", "toutes", "ia", "yann", "avis", "fin", "secondes", "soiree", "toi", "camille", "negatif", "outil", "non",
  "inverse", "cv", "rien", "valides", "unique", "go", "offerte", "mienne", "contre", "pour"]);
const Caption = makeCaption(voix, HOT, { ...CAP_BOX, fontSize: 56 }, ROSE_M);
const PIX = "Silkscreen, monospace";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const CY = 880;                                                    // centre des icônes

// ─── petits éléments ───
const Etiquette: React.FC<{ t: number; a: number; b: number; x: number; y: number; text: string; size?: number; rose?: boolean }> = ({ t, a, b, x, y, text, size = 34, rose }) =>
  t < a || t >= b ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${pop(t, a)})`, fontFamily: PIX, fontWeight: 700, fontSize: size, color: rose ? "#fff" : ROSE_C,
      background: rose ? ROSE_F : "rgba(21,18,20,0.75)", padding: "8px 18px", borderRadius: 8, border: `3px solid ${rose ? ROSE_C : ROSE_F}`, whiteSpace: "nowrap", zIndex: 15 }}>{text}</div>
  );
const Tampon: React.FC<{ t: number; a: number; text: string; x?: number; y?: number; size?: number; rot?: number }> = ({ t, a, text, x = X, y = CY, size = 120, rot = -8 }) =>
  t < a ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${lerp(1.8, 1, ease(t, a, a + 0.14))})`, fontFamily: PIX, fontWeight: 700, fontSize: size,
      color: PINK, border: `${Math.round(size / 12)}px solid ${PINK}`, padding: "4px 26px", borderRadius: 14, background: "rgba(21,18,20,0.6)", opacity: seg(t, a, a + 0.06), zIndex: 18, whiteSpace: "nowrap" }}>{text}</div>
  );
const AppMM: React.FC<{ t: number; a: number; b: number; x?: number; y?: number; size?: number; barre?: boolean }> = ({ t, a, b, x = X, y = CY, size = 280, barre }) =>
  t < a || t >= b ? null : (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, borderRadius: size * 0.24, background: `linear-gradient(160deg, ${ROSE_M}, ${PINK})`,
      boxShadow: `0 0 50px rgba(229,154,184,0.45), inset 0 -${size * 0.05}px 0 rgba(0,0,0,0.15)`, transform: `scale(${pop(t, a)})`, display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: "Poppins", fontWeight: 900, fontSize: size * 0.34, color: "#fff", zIndex: 12 }}>
      mm.
      {barre && <div style={{ position: "absolute", inset: -20, display: "flex", alignItems: "center", justifyContent: "center" }}><PixelEmoji emoji="❌" n={18} px={size / 16} /></div>}
    </div>
  );

// ─── une lettre générique (papier, lignes, phrases surlignables) ───
const PHRASE = "Passionné, dynamique et motivé, je me permets de vous adresser ma candidature pour le poste de";
const MiniLettre: React.FC<{ x: number; y: number; w: number; titre?: string; surligne?: number; taille?: number }> = ({ x, y, w, titre, surligne = 0, taille = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, padding: `${14 * taille}px ${16 * taille}px`, boxSizing: "border-box", background: "#F4EFEA", borderRadius: 8 * taille,
    boxShadow: "0 10px 26px rgba(0,0,0,0.45)", fontFamily: "Georgia, 'DejaVu Serif', serif", color: "#3A3534", fontSize: 15 * taille, lineHeight: 1.35 }}>
    {titre && <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 15 * taille, color: "#1D1B1A", marginBottom: 8 * taille }}>{titre}</div>}
    <div>Madame, Monsieur,</div>
    <div style={{ marginTop: 6 * taille }}>
      <span style={{ background: surligne > 0 ? `rgba(229,154,184,${0.75 * surligne})` : "none", borderRadius: 3 }}>{PHRASE}</span> …
    </div>
    {[0.95, 0.8, 0.9].map((k, i) => <div key={i} style={{ height: 6 * taille, width: `${k * 100}%`, background: "#CFC8C1", borderRadius: 3, marginTop: 8 * taille }} />)}
  </div>
);

// ─── les écrans d'exemples ───
const EcranIA: React.FC<{ t: number }> = ({ t }) => {                // un assistant d'IA générique (aucune vraie marque)
  const demande = "Écris ma lettre de motivation", n = Math.floor(demande.length * seg(t, A(12), A(17) + 0.3));
  const go = A(19), lignes = PHRASE.split(" ");
  const k = Math.floor(lignes.length * seg(t, go, go + 0.8));
  return (
    <AbsoluteFill style={{ background: "#141215", padding: 34, boxSizing: "border-box" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}><PixelEmoji emoji="🤖" n={16} px={4} /><span style={{ fontFamily: PIX, fontSize: 30, color: ROSE_C }}>ASSISTANT IA</span></div>
      <div style={{ marginTop: 26, padding: "18px 22px", borderRadius: 16, background: "#221F23", border: "2px solid #3A3438", fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 30, color: "#fff", minHeight: 44 }}>
        {demande.slice(0, n)}{t < go && Math.floor(t * 3) % 2 === 0 ? "|" : ""}</div>
      {t >= go && (
        <div style={{ marginTop: 26, padding: "24px 26px", borderRadius: 12, background: "#F4EFEA", fontFamily: "Georgia, 'DejaVu Serif', serif", fontSize: 28, lineHeight: 1.45, color: "#3A3534" }}>
          <div>Madame, Monsieur,</div>
          <div style={{ marginTop: 10 }}>{lignes.slice(0, k).join(" ")}</div>
          {[0.9, 0.75, 0.85, 0.6].map((w, i) => <div key={i} style={{ height: 10, width: `${w * 100 * seg(t, go + 0.6 + i * 0.1, go + 0.9 + i * 0.1)}%`, background: "#CFC8C1", borderRadius: 4, marginTop: 14 }} />)}
        </div>
      )}
      {t >= go && <div style={{ position: "absolute", right: 30, bottom: 30, fontFamily: PIX, fontWeight: 700, fontSize: 40, color: "#fff", background: ROSE_F, padding: "6px 18px", borderRadius: 10,
        transform: `scale(${pop(t, go + 0.2)})` }}>3 SEC</div>}
    </AbsoluteFill>
  );
};
const Grille: React.FC<{ t: number }> = ({ t }) => {
  const s = seg(t, A(33), A(33) + 0.3);
  return (
    <AbsoluteFill style={{ background: "#141215" }}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = A(24) + i * 0.12;
        return t >= a && <div key={i} style={{ transform: `scale(${pop(t, a)})` }}><MiniLettre x={24 + (i % 3) * 222} y={36 + Math.floor(i / 3) * 268} w={200} surligne={s} taille={0.62} /></div>;
      })}
    </AbsoluteFill>
  );
};
const TroisPostes: React.FC<{ t: number }> = ({ t }) => {
  const s = seg(t, A(37), A(37) + 0.3);
  const postes = ["Vendeur·se — Atelier Nova", "Comptable — Boréal Logistique", "Assistant·e RH — Maison Lumen"];
  return (
    <AbsoluteFill style={{ background: "#141215" }}>
      {postes.map((p, i) => {
        const a = sc(2) + 0.1 + i * 0.2;
        return t >= a && <div key={i} style={{ position: "absolute", left: 0, top: 0, transform: `translate(${(i - 1) * 6}px, 0) rotate(${(i - 1) * 2.5}deg) scale(${pop(t, a)})` }}>
          <MiniLettre x={60} y={40 + i * 262} w={570} titre={p} surligne={s} taille={1} />
        </div>;
      })}
      {t >= A(48) && <div style={{ position: "absolute", left: 345, top: 430, transform: `translate(-50%, -50%) rotate(-10deg) scale(${lerp(1.6, 1, ease(t, A(48), A(48) + 0.14))})`, fontFamily: PIX,
        fontWeight: 700, fontSize: 62, color: PINK, border: `6px solid ${PINK}`, padding: "4px 20px", borderRadius: 10, background: "rgba(20,18,21,0.85)", whiteSpace: "nowrap" }}>MÊME TEXTE</div>}
    </AbsoluteFill>
  );
};
const LeVraiSite: React.FC<{ t: number }> = ({ t }) => {
  const img = t < A(392) ? "002-cv" : t < A(394) ? "013-cv-lu" : "040-lettre";
  const cams: [number, number, number, number][] = img === "002-cv" ? [[0, 540, 700, 1.0]] : img === "013-cv-lu" ? [[0, 540, 660, 1.0]] : [[A(394), 560, 760, 1.12], [A(397), 545, 870, 1.3]];
  return (
    <AbsoluteFill style={{ background: "#0B0A0B" }}>
      <Capture t={t} src={`tuto-tel/${img}.jpg`} W={1080} H={1920} vw={690} vh={850} cams={cams} cadres={img === "040-lettre" ? [{ a: A(397), box: [140, 808, 790, 134] }] : img === "013-cv-lu" ? [{ a: A(392) + 0.1, box: [40, 568, 1000, 185] }] : []} />
      {t >= A(400) && <div style={{ position: "absolute", left: 345, top: 120, transform: `translate(-50%, -50%) rotate(-6deg) scale(${lerp(1.6, 1, ease(t, A(400), A(400) + 0.14))})`, fontFamily: PIX,
        fontWeight: 700, fontSize: 46, color: "#fff", background: ROSE_F, border: `5px solid ${ROSE_C}`, padding: "4px 18px", borderRadius: 10, whiteSpace: "nowrap" }}>RIEN D'INVENTÉ</div>}
    </AbsoluteFill>
  );
};

// ─── la comparaison (2 panneaux, comme dans la référence) ───
const Panneau: React.FC<{ t: number; a: number; y: number; label: string; rose?: boolean; children: React.ReactNode; terne?: boolean }> = ({ t, a, y, label, rose, children, terne }) =>
  t < a ? null : (
    <div style={{ position: "absolute", left: 150, width: 740, top: y, borderRadius: 26, background: rose ? "#2A1E24" : "#1F2421", border: `4px solid ${rose ? ROSE_M : "#7FA88A"}`, padding: "26px 30px",
      boxSizing: "border-box", transform: `scale(${pop(t, a)})`, boxShadow: rose ? "0 0 50px rgba(229,154,184,0.35)" : "none", opacity: terne ? 0.45 : 1, zIndex: 12 }}>
      <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 32, color: rose ? ROSE_C : "#A9D3B3", marginBottom: 12 }}>{label}</div>
      <div style={{ fontFamily: "Georgia, 'DejaVu Serif', serif", fontSize: 38, lineHeight: 1.35, color: "#F4EFEA" }}>{children}</div>
    </div>
  );
const Marque: React.FC<{ on: boolean; children: React.ReactNode }> = ({ on, children }) => <span style={{ background: on ? "rgba(229,154,184,0.55)" : "none", borderRadius: 6, padding: "0 4px" }}>{children}</span>;

// ─── POUR / CONTRE ───
const LISTE: [string, boolean][] = [
  ["POUR", true], ["Écrire n'est plus un frein.", false], ["Tu postules plus souvent.", false], ["Plus besoin d'avoir « le bon style ».", false],
  ["CONTRE", true], ["Une IA peut inventer.", false], ["Les lettres finissent par toutes se ressembler.", false], ["Le recruteur ne sait plus qui est derrière.", false],
  ["ET SOYONS HONNÊTES", true], ["Je vends une IA : mon avis est forcément un peu biaisé.", false],
];
const PourContre: React.FC<{ t: number }> = ({ t }) => {
  const a = sc(12) + 0.2, d = (sc(13) - 0.6 - a) / LISTE.length;
  return (
    <div style={{ position: "absolute", left: 130, right: 170, top: 330, textAlign: "center", zIndex: 15 }}>
      {LISTE.map(([txt, titre], i) => (
        <div key={i} style={{ opacity: seg(t, a + i * d, a + i * d + 0.2), fontFamily: "Poppins", fontWeight: titre ? 800 : 700, fontSize: titre ? 40 : 36, color: titre ? ROSE_M : "#fff",
          marginTop: titre && i ? 34 : 10, lineHeight: 1.2 }}>{txt}</div>
      ))}
    </div>
  );
};

// ─── l'appel : commente GO ───
const Appel: React.FC<{ t: number }> = ({ t }) => {
  const aGo = A(449), n = Math.floor(2 * seg(t, A(451), A(451) + 0.3)), dm = A(452);
  return (
    <>
      {t >= aGo && <div style={{ position: "absolute", left: X, top: 360, transform: "translate(-50%, -50%)", fontFamily: "Poppins", fontWeight: 800, fontSize: 84, color: "#fff", zIndex: 20 }}>Commente</div>}
      {t >= aGo && <div style={{ position: "absolute", left: X, top: 590, transform: `translate(-50%, -50%) scale(${pop(t, A(451) - 0.15)})`, fontFamily: PIX, fontWeight: 700, fontSize: 300, lineHeight: 1,
        color: ROSE_C, textShadow: `10px 10px 0 ${ROSE_F}, 0 0 50px rgba(229,154,184,0.5)`, zIndex: 20 }}>GO</div>}
      {t >= aGo && (
        <div style={{ position: "absolute", left: 120, width: 800, top: 800, height: 104, borderRadius: 52, background: "#1C191C", border: "3px solid #4A4246", display: "flex", alignItems: "center",
          padding: "0 20px 0 38px", boxSizing: "border-box", fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: n ? "#fff" : "#7A7276", zIndex: 20 }}>
          <span style={{ flex: 1 }}>{n ? "GO".slice(0, n) : "Ajouter un commentaire..."}</span>
          <span style={{ width: 66, height: 66, borderRadius: 33, background: PINK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 38 }}>↑</span>
        </div>
      )}
      {t >= dm && (
        <div style={{ position: "absolute", left: 120, width: 800, top: 945, display: "flex", gap: 18, alignItems: "center", opacity: seg(t, dm, dm + 0.2), zIndex: 20 }}>
          <div style={{ width: 76, height: 76, borderRadius: 38, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>mm.</div>
          <div>
            <div style={{ fontFamily: "'Open Sans'", fontSize: 26, color: "#9A9296" }}>mymotiv · à l'instant</div>
            <div style={{ fontFamily: "'Open Sans', 'Noto Color Emoji'", fontWeight: 600, fontSize: 34, color: "#fff" }}>Le lien pour ta <span style={{ color: ROSE_C }}>1re lettre offerte</span> 💌</div>
          </div>
        </div>
      )}
    </>
  );
};

export const Confession: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const T_FIN = PHt(18)[1] + 0.15, D = CONFESSION_DUR;
  const reduit = ease(t, T_FIN, T_FIN + 0.6);                       // la fin : l'image se réduit en carte (comme la référence)
  const sansSousTitres = (t >= sc(12) && t < sc(13)) || t >= A(449);
  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `translateY(${70 * reduit}px) scale(${lerp(1, 0.58, reduit)})`, borderRadius: reduit * 40, overflow: "hidden", boxShadow: reduit ? "0 0 0 4px rgba(229,154,184,0.3)" : "none" }}>
        <FondGris />

        {/* 1. le problème */}
        <Titre t={t} a={0.25} b={A(6)} morceaux={[["J'ai un très gros"], ["problème", true]]} dur={1.1} />
        <Icone t={t} a={0.2} b={A(6)} emoji="👤" x={X} y={CY + 40} px={14} />
        {[0, 1, 2, 3, 4].map((k) => {
          const a = 0.6 + k * 0.12, ang = -Math.PI / 2 + (k - 2) * 0.62 + Math.sin(t * 2 + k) * 0.05;
          return t >= a && t < A(6) && <div key={k} style={{ position: "absolute", left: X + Math.cos(ang) * 230 - 26, top: CY + 40 + Math.sin(ang) * 230 - 30, width: 52, height: 60, borderRadius: 14,
            background: ROSE_M, border: "4px solid #151214", fontFamily: PIX, fontWeight: 700, fontSize: 40, color: "#151214", display: "flex", alignItems: "center", justifyContent: "center",
            transform: `scale(${pop(t, a)})`, zIndex: 11 }}>!</div>;
        })}

        {/* 2. depuis fin 2022 */}
        <Icone t={t} a={A(6)} b={A(9) - 0.05} emoji="🗓️" x={X} y={CY - 40} px={15} />
        <Etiquette t={t} a={A(7)} b={A(9) - 0.05} x={X} y={CY + 190} text="FIN 2022" size={70} rose />

        {/* 3-5. les écrans : l'IA, la grille, les trois postes */}
        <Crt t={t} a={A(9) - 0.05} b={A(24) - 0.05} y={300} h={850}><EcranIA t={t} /></Crt>
        <Crt t={t} a={A(24) - 0.05} b={sc(2)} y={300} h={850}><Grille t={t} /></Crt>
        <Crt t={t} a={sc(2)} b={sc(3)} y={300} h={850}><TroisPostes t={t} /></Crt>

        {/* 6-7. mon problème : je vends une IA */}
        <Titre t={t} a={sc(3) + 0.1} b={A(66)} morceaux={[["Et mon problème, c'est que moi..."]]} />
        <Icone t={t} a={sc(3) + 0.1} b={A(66)} emoji="🤔" x={X} y={CY} px={15} />
        <Titre t={t} a={A(66)} b={sc(4)} morceaux={[["je vends une"], ["IA", true], ["qui écrit des lettres"]]} />
        <AppMM t={t} a={A(66) + 0.05} b={sc(4)} />
        {t >= A(69) && t < sc(4) && <div style={{ position: "absolute", left: X, top: CY + 230, transform: "translate(-50%, -50%)", fontFamily: "Poppins", fontWeight: 800, fontSize: 64, color: "#fff", zIndex: 12 }}>MyMotiv</div>}

        {/* 8-10. qui je suis */}
        {t >= sc(4) && t < A(84) && (
          <div style={{ position: "absolute", left: X - 168, top: CY - 260, width: 336, height: 420, border: `6px solid ${ROSE_M}`, boxShadow: "0 0 50px rgba(229,154,184,0.4)", transform: `scale(${pop(t, sc(4))})`, zIndex: 12 }}>
            <Img src={staticFile("moi/portrait-2.png")} style={{ width: "100%", height: "100%", imageRendering: "pixelated" }} />
          </div>
        )}
        <Etiquette t={t} a={A(79)} b={A(84)} x={X} y={CY + 250} text="YANN · 24 ANS" size={52} rose />
        <Titre t={t} a={A(84)} b={A(103)} morceaux={[["1 an", true], ["en agence d'emploi"]]} />
        <Icone t={t} a={A(94)} b={A(103)} emoji="🔍" x={X - 210} y={CY} px={12} />
        <Etiquette t={t} a={A(94) + 0.1} b={A(103)} x={X - 210} y={CY + 180} text="CHERCHER" />
        <Icone t={t} a={A(97)} b={A(103)} emoji="🤝" x={X + 210} y={CY} px={12} />
        <Etiquette t={t} a={A(97) + 0.1} b={A(103)} x={X + 210} y={CY + 180} text="PRÉSENTER" />
        {t >= A(103) && t < sc(5) && Array.from({ length: 7 }, (_, i) => {
          const a = A(103) + i * 0.08, terne = seg(t, A(112), A(112) + 0.4);
          return t >= a && <div key={i} style={{ position: "absolute", left: 0, top: 0, transform: `translate(${(i - 3) * 22}px, ${(i - 3) * -16}px) rotate(${(i - 3) * 3}deg) scale(${pop(t, a)})`, filter: `grayscale(${terne}) brightness(${1 - 0.35 * terne})`, zIndex: 10 + i }}>
            <MiniLettre x={X - 230} y={CY - 200} w={460} taille={0.8} />
          </div>;
        })}
        <Titre t={t} a={A(112)} b={sc(5)} morceaux={[["plus aucune ne"], ["ressort", true]]} />

        {/* 11-12. mon avis, et reste jusqu'à la fin */}
        <Titre t={t} a={sc(5) + 0.1} b={A(138)} morceaux={[["Mon"], ["avis.", true], ["Pas une étude. Pas de chiffre magique."]]} size={52} />
        <Icone t={t} a={sc(5) + 0.1} b={A(132)} emoji="💡" x={X} y={CY} px={15} />
        <Icone t={t} a={A(132)} b={A(138)} emoji="👀" x={X} y={CY} px={15} />
        <Titre t={t} a={A(138)} b={sc(6)} morceaux={[["Reste jusqu'à la"], ["fin", true]]} />
        {t >= A(138) && t < sc(6) && (
          <div style={{ position: "absolute", left: X - 340, top: CY - 30, width: 680, height: 60, border: `5px solid ${ROSE_C}`, background: "#151214", zIndex: 12, transform: `scale(${pop(t, A(138))})` }}>
            <div style={{ height: "100%", width: `${88 * ease(t, A(138) + 0.2, sc(6) - 0.3)}%`, background: `repeating-linear-gradient(90deg, ${ROSE_M} 0 22px, ${ROSE_F} 22px 26px)` }} />
            <div style={{ position: "absolute", right: -110, top: -30, fontFamily: PIX, fontWeight: 700, fontSize: 90, color: ROSE_C }}>?</div>
          </div>
        )}

        {/* 13-16. 3 secondes contre une soirée, je les comprends, ça t'enlève toi */}
        <Titre t={t} a={A(166)} b={A(184)} morceaux={[["3 secondes", true], ["contre"], ["une soirée", true]]} />
        <Icone t={t} a={A(166)} b={A(184)} emoji="🤖" x={X - 200} y={CY} px={11} />
        <Etiquette t={t} a={A(166) + 0.1} b={A(184)} x={X - 200} y={CY + 170} text="3 S" size={60} rose />
        <Icone t={t} a={A(182)} b={A(184)} emoji="🌙" x={X + 200} y={CY} px={11} />
        <Etiquette t={t} a={A(182) + 0.1} b={A(184)} x={X + 200} y={CY + 170} text="1 SOIRÉE" size={52} />
        {t >= sc(6) && t < A(166) && <Icone t={t} a={sc(6) + 0.1} b={A(166)} emoji="⏱️" x={X} y={CY} px={15} />}
        <Titre t={t} a={A(184)} b={sc(7)} morceaux={[["et savoir"], ["quoi mettre dedans", true]]} />
        <Icone t={t} a={A(184)} b={sc(7)} emoji="🧠" x={X} y={CY} px={15} />
        <Titre t={t} a={sc(7) + 0.1} b={sc(8)} morceaux={[["Beaucoup choisissent les"], ["3 secondes", true]]} />
        <Icone t={t} a={A(200)} b={sc(8)} emoji="🫶" x={X} y={CY} px={15} />
        <Icone t={t} a={sc(7) + 0.1} b={A(200)} emoji="🤖" x={X} y={CY} px={15} />
        <Titre t={t} a={sc(8) + 0.1} b={sc(9)} morceaux={[["Ce que t'as de plus précieux :"], ["toi", true]]} />
        <Icone t={t} a={A(205)} b={A(218)} emoji="❌" x={X} y={CY} px={15} />
        {t >= A(218) && t < sc(9) && <div style={{ opacity: 1 - 0.6 * seg(t, A(218) + 0.3, sc(9)) }}><Icone t={t} a={A(218)} b={sc(9)} emoji="👤" x={X} y={CY} px={15} /></div>}

        {/* 17. la comparaison */}
        {t >= sc(9) && t < sc(10) && (
          <>
            <Panneau t={t} a={sc(9) + 0.1} y={330} label="N'IMPORTE QUI" terne={t >= A(236)}>« Fort d'une solide expérience, je suis convaincu que mon profil correspond parfaitement à vos attentes. »</Panneau>
            <Panneau t={t} a={A(236)} y={720} label="CAMILLE" rose>
              « Chez Maison &amp; Déco, j'ai fait progresser <Marque on={t >= A(252)}>le panier moyen de 18 %</Marque>, avec <Marque on={t >= A(246)}>une équipe de 6 conseillers</Marque>. »
            </Panneau>
          </>
        )}

        {/* 18-19. est-ce que c'est négatif ? */}
        <Titre t={t} a={A(266)} b={A(287)} morceaux={[["Est-ce que c'est vraiment négatif, l'IA dans les candidatures ?", true]]} size={50} />
        <Icone t={t} a={sc(10) + 0.1} b={A(286)} emoji="❓" x={X} y={CY} px={15} rot={Math.sin(t * 5) * 6} />
        <Icone t={t} a={A(286)} b={A(287)} emoji="✅" x={X} y={CY} px={15} />
        <Titre t={t} a={A(287)} b={sc(12)} morceaux={[["ça permet de"], ["postuler enfin", true]]} />
        <Icone t={t} a={A(296)} b={A(312)} emoji="✍️" x={X - 250} y={CY} px={10} />
        <Etiquette t={t} a={A(296) + 0.1} b={A(312)} x={X - 250} y={CY + 150} text="ÉCRIRE ?" size={30} />
        <Icone t={t} a={A(301)} b={A(312)} emoji="😔" x={X} y={CY} px={10} />
        <Etiquette t={t} a={A(301) + 0.1} b={A(312)} x={X} y={CY + 150} text="OSER ?" size={30} />
        <Icone t={t} a={A(305)} b={A(312)} emoji="⏳" x={X + 250} y={CY} px={10} />
        <Etiquette t={t} a={A(305) + 0.1} b={A(312)} x={X + 250} y={CY + 150} text="LE TEMPS ?" size={30} />
        <Icone t={t} a={A(312)} b={sc(12)} emoji="🚀" x={X} y={CY} px={15} />

        {/* 20. pour / contre */}
        {t >= sc(12) && t < sc(13) && <PourContre t={t} />}

        {/* 21-22. c'est un outil ; invente, copie, efface : non */}
        <Titre t={t} a={sc(13) + 0.1} b={A(336)} morceaux={[["C'est un"], ["outil", true]]} />
        <Titre t={t} a={A(336)} b={A(343)} morceaux={[["Tout dépend de"], ["comment on l'utilise", true]]} />
        <Icone t={t} a={sc(13) + 0.1} b={A(343)} emoji="🔧" x={X} y={CY} px={15} />
        <Etiquette t={t} a={sc(13) + 0.4} b={A(343)} x={X + 120} y={CY - 120} text="IA" size={64} rose />
        {[["🪄", "INVENTE", 347], ["📋", "COPIE", 349], ["👤", "EFFACE TOI", 351]].map(([e, l, i], k) => (
          <React.Fragment key={k}>
            <Icone t={t} a={A(i as number)} b={sc(14)} emoji={e as string} x={X + (k - 1) * 250} y={CY - 40} px={10} />
            <Etiquette t={t} a={A(i as number) + 0.1} b={sc(14)} x={X + (k - 1) * 250} y={CY + 110} text={l as string} size={28} />
            {t >= A(i as number) + 0.35 && t < sc(14) && <div style={{ position: "absolute", left: X + (k - 1) * 250 - 90, top: CY - 130, opacity: 0.9, zIndex: 13 }}><PixelEmoji emoji="❌" n={16} px={11} /></div>}
          </React.Fragment>
        ))}
        {t >= A(358) && t < sc(14) && <Tampon t={t} a={A(358)} text="NON" y={CY + 300} size={110} />}
        <Titre t={t} a={A(343)} b={sc(14)} morceaux={[["Une IA qui invente, qui copie, qui efface qui tu es :"], ["non", true]]} size={50} />

        {/* 23. qu'est-ce que je fais ? */}
        <Titre t={t} a={sc(14) + 0.1} b={sc(15)} morceaux={[["Qu'est-ce que je"], ["fais", true], ["?"]]} />
        <Icone t={t} a={sc(14) + 0.1} b={sc(15)} emoji="👤" x={X} y={CY + 20} px={13} />
        {[[-1, -0.9], [0, -1.25], [1, -0.9]].map(([dx, dy], k) => t >= sc(14) + 0.3 + k * 0.1 && t < sc(15) &&
          <div key={k} style={{ position: "absolute", left: X + dx * 170 - 30, top: CY + 20 + dy * 170 - 50, fontFamily: PIX, fontWeight: 700, fontSize: 96, color: ROSE_C, transform: `scale(${pop(t, sc(14) + 0.3 + k * 0.1)})`, zIndex: 12 }}>?</div>)}
        <AppMM t={t} a={A(368)} b={sc(15)} x={X - 290} y={CY + 230} size={130} barre />
        <Icone t={t} a={A(372)} b={sc(15)} emoji="👥" x={X + 290} y={CY + 230} px={7} />

        {/* 24. non : l'inverse, une IA qui part de toi (le vrai site) */}
        {t >= sc(15) && t < A(386) && <Tampon t={t} a={A(378)} text="NON." y={CY} size={150} rot={0} />}
        <Titre t={t} a={A(379)} b={A(386)} morceaux={[["J'ai décidé de faire"], ["l'inverse", true]]} />
        <Crt t={t} a={A(386)} b={sc(16)} y={300} h={850}><LeVraiSite t={t} /></Crt>
        <Etiquette t={t} a={A(404)} b={sc(16)} x={X} y={1080} text="✓ C'EST TOI QUI VALIDES" size={40} rose />

        {/* 25. ce qui te rend unique */}
        <Titre t={t} a={A(418)} b={A(430)} morceaux={[["la seule chose qui te rend"], ["unique", true]]} />
        <Icone t={t} a={sc(16) + 0.1} b={sc(17)} emoji="✨" x={X} y={CY} px={lerp(12, 17, ease(t, sc(16), sc(17)))} />
        {t >= A(430) && t < sc(17) && <div style={{ position: "absolute", left: X, top: 420, transform: `translate(-50%, -50%) scale(${pop(t, A(430))})`, fontFamily: PIX, fontWeight: 700, fontSize: 120, color: ROSE_C, textShadow: `8px 8px 0 ${ROSE_F}`, zIndex: 20 }}>C'EST TOI.</div>}

        {/* 26. commente GO */}
        <Titre t={t} a={sc(17) + 0.1} b={A(449)} morceaux={[["Si toi aussi tu veux qu'on te lise pour ce que t'as"], ["vraiment fait", true]]} size={54} />
        {t >= sc(17) && t < A(449) && <Icone t={t} a={sc(17) + 0.1} b={A(449)} emoji="💌" x={X} y={CY} px={15} />}
        {t >= sc(17) && t < sc(18) && <Appel t={t} />}

        {/* 27-28. la mention honnête, puis la carte de fin */}
        {t >= sc(18) && (
          <>
            <div style={{ position: "absolute", left: X, top: 390, transform: `translate(-50%, -50%) scale(${pop(t, sc(18))})`, padding: "10px 28px", borderRadius: 30, background: PINK, color: "#fff",
              fontFamily: "Poppins", fontWeight: 800, fontSize: 40, whiteSpace: "nowrap", zIndex: 20 }}>Commente « GO » 👇</div>
            <Icone t={t} a={sc(18) + 0.1} b={D + 1} emoji="✨" x={X} y={CY - 40} px={14} />
            {t >= A(465) && <div style={{ position: "absolute", left: 140, right: 180, top: 1080, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#fff", opacity: seg(t, A(465), A(465) + 0.3), zIndex: 20 }}>
              Cette vidéo a été faite avec de l'IA.</div>}
            {t >= A(472) && <div style={{ position: "absolute", left: 140, right: 180, top: 1150, textAlign: "center", fontFamily: "Poppins", fontWeight: 800, fontSize: 46, color: ROSE_M, opacity: seg(t, A(472), A(472) + 0.3), zIndex: 20 }}>
              Mais l'histoire, c'est la mienne.</div>}
          </>
        )}
        {!sansSousTitres && t < sc(18) && <div style={{ position: "absolute", inset: 0, zIndex: 25 }}><Caption t={t} /></div>}
      </AbsoluteFill>
      {reduit > 0 && <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 190, top: 290, width: 380, opacity: seg(t, T_FIN + 0.3, T_FIN + 0.7) }} />}
      <Audio src={staticFile("audio/confession.wav")} />
    </AbsoluteFill>
  );
};
function PHt(i: number) { return [voix.phrases[i].t0, voix.phrases[i].t1]; }
