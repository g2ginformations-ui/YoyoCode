// « La lettre de motivation qui marche, en 3 blocs » (≈41 s, 30 i/s, 9:16) : un conseil utile, à enregistrer (les
// « enregistrements » font circuler une vidéo). La structure est exactement celle que suit MyMotiv (lettre-ia/lib/prompts.ts) :
// 1. l'accroche = leur projet, pas toi (« ouvre sur l'angle spécifique à l'entreprise ») ; 2. la preuve = un besoin de
// l'offre, une preuve tirée du CV, un fait ou un chiffre, pas un adjectif ; 3. la suite = une phrase sobre qui propose un
// échange. Le test : si la lettre peut partir telle quelle chez une autre entreprise, recommence. Exemple : Camille Dubois
// pour Maison Lumen (le chiffre de 18 % est dans son CV d'exemple). Fin : MyMotiv fait les 3 blocs pour chaque offre, 30 s*.
// Voix : voix-bloc.json (--voix yann). Son : synth_bloc.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce } from "./apple";
import { PINK, PINK_L, easeInOut, seg } from "./common";
import voix from "./data/bloc-voix.json";
import { makeCaption } from "./FauxDM";
import { Chrome, INK, K, Mot, fit } from "./kinetic";
import { GLOW_BG } from "./motion";
import { CAP_BOX } from "./pixelTT";
import { Coche, FinOfferte, Mention, X, horloge } from "./pubMotion";
import "./fonts";

export const BLOC_DUR = voix.duration;
const { at, sc } = horloge(voix);
const HOT = new Set(["trois", "blocs", "enregistre", "accroche", "projet", "preuve", "besoin", "cv", "fait", "chiffre", "adjectif", "suite",
  "echange", "point", "test", "recommence", "mymotiv", "secondes", "offerte", "bio"]);
const Caption = makeCaption(voix, HOT, CAP_BOX, PINK);
const EMOJI = "'Noto Color Emoji'";
const ROUGE = "#E8262B";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const pop = (t: number, a: number) => bounce(t, [[a, 0.55], [a + 0.2, 1]], 0.09, 3, 7);
const tape = (t: number, a: number, texte: string, d = 1.3) => texte.slice(0, Math.round(texte.length * seg(t, a, a + d)));

// ─── les temps clés ───
const S1 = sc(1), S2 = sc(2), S3 = sc(3), S4 = sc(4), S5 = sc(5), S6 = sc(6), S7 = sc(7), T_FIN = at(116) - 0.1;
const P1 = "Votre boutique de Lyon mise sur le conseil client et la mise en scène des produits.";
const P2 = "Chez Maison & Déco, j'ai fait progresser le panier moyen de 18 %, avec une équipe de 6 conseillers.";
const P3 = "Disponible dès maintenant, je serais ravie d'en échanger avec vous.";

// ─── l'étiquette du bloc en cours ───
const Etiquette: React.FC<{ t: number; a: number; n: string; titre: string }> = ({ t, a, n, titre }) => (
  <div style={{ position: "absolute", left: X, top: 360, transform: `translate(-50%, -50%) scale(${pop(t, a)})`, display: "flex", alignItems: "center", gap: 16, padding: "10px 30px 10px 12px", borderRadius: 26,
    background: PINK, boxShadow: "0 12px 34px rgba(217,130,139,0.4)", whiteSpace: "nowrap", zIndex: 10 }}>
    <span style={{ width: 70, height: 70, borderRadius: 35, background: "#fff", color: PINK, fontFamily: K, fontWeight: 900, fontSize: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
    <span style={{ fontFamily: K, fontWeight: 900, fontSize: 52, color: "#fff" }}>{titre}</span>
  </div>
);
// une phrase barrée (le mauvais exemple)
const Barree: React.FC<{ t: number; a: number; b: number; texte: string; y: number; size?: number }> = ({ t, a, b, texte, y, size = 38 }) =>
  t < a || t >= b ? null : (
    <div style={{ position: "absolute", left: X, top: y, transform: `translate(-50%, -50%) scale(${pop(t, a)})`, padding: "10px 24px", borderRadius: 16, background: "rgba(255,255,255,0.08)", whiteSpace: "nowrap", zIndex: 9 }}>
      <span style={{ position: "relative", fontFamily: "Georgia, 'DejaVu Serif', serif", fontStyle: "italic", fontSize: size, color: "#C7C7CC" }}>
        {texte}
        <span style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 6, borderRadius: 3, background: ROUGE, transformOrigin: "0 50%", transform: `scaleX(${ease(t, a + 0.35, a + 0.6)})` }} />
      </span>
    </div>
  );

// ─── la lettre qui se construit, un bloc à la fois ───
const Lettre: React.FC<{ t: number }> = ({ t }) => {
  const actif = t < S3 ? 1 : t < S5 ? 2 : t < S6 ? 3 : 0;
  const bloc = (n: number, texte: string, aT: number, rempli: boolean) => (
    <div style={{ position: "relative", marginTop: n === 1 ? 0 : 22, padding: "14px 18px 14px 64px", borderRadius: 16, border: `4px ${rempli ? "solid" : "dashed"} ${actif === n ? PINK : rempli ? "transparent" : "#D7D2CC"}`,
      background: actif === n ? "rgba(217,130,139,0.08)" : "transparent", minHeight: 66 }}>
      <span style={{ position: "absolute", left: 12, top: 14, width: 40, height: 40, borderRadius: 20, background: rempli || actif === n ? PINK : "#D7D2CC", color: "#fff", fontFamily: K, fontWeight: 900, fontSize: 26,
        display: "flex", alignItems: "center", justifyContent: "center" }}>{n}</span>
      {rempli && (n === 2 && t >= at(71) - 0.1
        ? <span>{tape(t, aT, texte).replace(/18 %.*$/, "")}<span style={{ background: `linear-gradient(rgba(217,130,139,0.5), rgba(217,130,139,0.5)) no-repeat 0 0 / ${ease(t, at(71) - 0.1, at(71) + 0.2) * 100}% 100%`, borderRadius: 6, fontWeight: 700 }}>18 %</span>{texte.split("18 %")[1]}</span>
        : tape(t, aT, texte))}
      {n === 3 && t >= at(84) - 0.1 && <span style={{ display: "inline-block", marginLeft: 8, width: 26, height: 26, borderRadius: 13, background: PINK, transform: `scale(${bounce(t, [[at(84) - 0.1, 2.4], [at(84) + 0.05, 1]], 0.1, 3, 7)})` }} />}
    </div>
  );
  return (
    <div style={{ position: "absolute", left: X - 390, top: 640, width: 780, borderRadius: 28, background: "#FFFDF9", padding: "30px 30px 34px", boxSizing: "border-box", boxShadow: "0 40px 90px rgba(0,0,0,0.5)",
      fontFamily: "Georgia, 'DejaVu Serif', serif", fontSize: 32, lineHeight: 1.42, color: "#1D1D1F", transform: `scale(${pop(t, S1 + 0.1)})`, zIndex: 5 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18, fontFamily: "Poppins", fontSize: 26, color: "#86868B" }}>
        <Img src={staticFile("company.png")} style={{ width: 40, height: 40, borderRadius: 9 }} /> Lettre pour <b style={{ color: "#1D1D1F" }}>Maison Lumen</b>
      </div>
      {bloc(1, P1, S2 + 0.25, t >= S2 + 0.25)}
      {bloc(2, P2, S4 + 0.1, t >= S4 + 0.1)}
      {bloc(3, P3, at(77) - 0.1, t >= at(77) - 0.1)}
    </div>
  );
};

// ─── le test : une lettre passe-partout rentre dans toutes les enveloppes ───
const Test: React.FC<{ t: number }> = ({ t }) => {
  const env = ["Maison Lumen", "Atelier Nova", "Boréal Logistique"];
  return (
    <>
      <Mot t={t} a={S6 + 0.05} text={"ELLE PEUT PARTIR\nAILLEURS ?"} y={420} size={fit("ELLE PEUT PARTIR\nAILLEURS ?", 92)} lh={1} />
      <div style={{ position: "absolute", left: X - 300, top: 600, width: 600, borderRadius: 22, background: "#E9E7E3", padding: "24px 28px", boxSizing: "border-box", transform: `rotate(-2deg) scale(${pop(t, S6 + 0.2)})`,
        fontFamily: "Georgia, 'DejaVu Serif', serif", fontSize: 28, lineHeight: 1.4, color: "#4A4A4F", boxShadow: "0 30px 70px rgba(0,0,0,0.5)" }}>
        Madame, Monsieur, je souhaite rejoindre votre entreprise afin de mettre mon dynamisme à votre service…
      </div>
      {env.map((nom, i) => {
        const a = at(93) + i * 0.25, x = X - 260 + i * 260;
        return t < a ? null : (
          <div key={nom} style={{ position: "absolute", left: x - 115, top: 900, width: 230, height: 150, transform: `scale(${pop(t, a)})` }}>
            <svg width="230" height="150" viewBox="0 0 230 150"><rect x="3" y="3" width="224" height="144" rx="12" fill="#F5EFE5" stroke="#CFC4B5" strokeWidth="4" /><path d="M6 8 L115 85 L224 8" fill="none" stroke="#CFC4B5" strokeWidth="4" /></svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: 160, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 26, color: "#E5E5EA" }}>{nom}</div>
            {t >= a + 0.3 && <div style={{ position: "absolute", right: -10, top: -20, fontFamily: EMOJI, fontSize: 52, transform: `scale(${pop(t, a + 0.3)})` }}>✅</div>}
          </div>
        );
      })}
      {t >= at(101) - 0.15 && (
        <div style={{ position: "absolute", left: X, top: 760, transform: `translate(-50%, -50%) rotate(-8deg) scale(${bounce(t, [[at(101) - 0.15, 2.2], [at(101), 1]], 0.1, 3, 7)})`, padding: "10px 34px", border: `8px solid ${ROUGE}`, borderRadius: 18,
          color: ROUGE, background: "rgba(11,10,11,0.85)", fontFamily: K, fontWeight: 900, fontSize: 84, whiteSpace: "nowrap", zIndex: 12 }}>RECOMMENCE.</div>
      )}
    </>
  );
};

export const TroisBlocs: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  return (
    <AbsoluteFill style={{ background: GLOW_BG, overflow: "hidden" }}>
      {/* 1. l'accroche (visible dès l'image 0) */}
      {t < S1 && (
        <>
          <Mot t={t} a={-0.5} text={"LA LETTRE\nQUI MARCHE"} y={470} size={fit("LA LETTRE\nQUI MARCHE", 120)} lh={0.98} />
          <Chrome t={t} a={-0.4} text="EN 3 BLOCS" y={720} size={fit("EN 3 BLOCS", 150)} />
          {t >= at(11) - 0.1 && <div style={{ position: "absolute", left: X, top: 920, transform: `translate(-50%, -50%) scale(${pop(t, at(11) - 0.1)})`, padding: "14px 34px", borderRadius: 28, background: "#fff", color: INK,
            fontFamily: `${K}, Poppins, ${EMOJI}`, fontWeight: 800, fontSize: 50, whiteSpace: "nowrap" }}>📌 Enregistre cette vidéo</div>}
        </>
      )}
      {/* 2-4. les trois blocs */}
      {t >= S1 && t < S6 && (
        <>
          {t < S3 && <Etiquette t={t} a={S1 + 0.05} n="1" titre="L'ACCROCHE" />}
          {t >= S3 && t < S5 && <Etiquette t={t} a={S3 + 0.05} n="2" titre="LA PREUVE" />}
          {t >= S5 && <Etiquette t={t} a={S5 + 0.05} n="3" titre="LA SUITE" />}
          {t < S2 && <Mot t={t} a={at(19) - 0.1} text="LEUR PROJET, PAS TOI" y={480} size={fit("LEUR PROJET, PAS TOI", 64)} color={PINK_L} />}
          <Barree t={t} a={at(18) - 0.1} b={S2 + 0.5} texte="« Je m'appelle Camille et je suis motivée… »" y={560} size={34} />
          {t >= S3 && t < at(52) - 0.1 && t >= at(42) - 0.1 && (
            <div style={{ position: "absolute", left: X, top: 490, transform: `translate(-50%, -50%) scale(${pop(t, at(42) - 0.1)})`, display: "flex", alignItems: "center", gap: 14, fontFamily: K, fontWeight: 900, fontSize: 40, color: "#fff", whiteSpace: "nowrap" }}>
              <span style={{ padding: "8px 20px", borderRadius: 18, background: "#2C2C2E" }}>BESOIN DE L'OFFRE</span>
              <span style={{ color: PINK, fontSize: 52 }}>→</span>
              <span style={{ padding: "8px 20px", borderRadius: 18, background: "#2C2C2E", opacity: seg(t, at(47) - 0.1, at(47) + 0.05) }}>PREUVE DU CV</span>
            </div>
          )}
          {t >= at(52) - 0.1 && t < S4 && <Mot t={t} a={at(52) - 0.1} text="UN FAIT · UN CHIFFRE" y={470} size={fit("UN FAIT · UN CHIFFRE", 64)} color={PINK_L} />}
          <Barree t={t} a={at(52) - 0.1} b={S4 + 0.5} texte="« dynamique et motivée »" y={555} size={36} />
          {t >= S5 && <Mot t={t} a={at(77) - 0.15} text="UNE PHRASE, UN ÉCHANGE." y={480} size={fit("UNE PHRASE, UN ÉCHANGE.", 64)} color={PINK_L} />}
          <Lettre t={t} />
        </>
      )}
      {/* 5. le test */}
      {t >= S6 && t < S7 && <Test t={t} />}
      {/* 6. MyMotiv fait les 3 blocs */}
      {t >= S7 && t < T_FIN && (
        <>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 220, top: 340, width: 440, transform: `scale(${pop(t, at(104) - 0.15)})`, opacity: t >= at(104) - 0.15 ? 1 : 0 }} />
          <Mot t={t} a={at(106) - 0.1} text="TE FAIT LES 3 BLOCS" y={560} size={fit("TE FAIT LES 3 BLOCS", 80)} />
          <Coche t={t} a={at(108) - 0.1} text="1 · L'accroche" y={700} dark size={44} />
          <Coche t={t} a={at(108) + 0.05} text="2 · La preuve" y={800} dark size={44} />
          <Coche t={t} a={at(109) + 0.0} text="3 · La suite" y={900} dark size={44} />
          {t >= at(114) - 0.1 && <div style={{ position: "absolute", left: X, top: 1040, transform: `translate(-50%, -50%) scale(${pop(t, at(114) - 0.1)})`, padding: "10px 30px", borderRadius: 26, background: PINK, color: "#fff",
            fontFamily: `${K}, Poppins, ${EMOJI}`, fontWeight: 800, fontSize: 52, whiteSpace: "nowrap" }}>pour chaque offre · ⏱ 30 s*</div>}
        </>
      )}
      {t >= T_FIN && <FinOfferte t={t} t0={T_FIN} aBio={at(121) - 0.05} dark sous="Sans carte bancaire." />}
      <Mention t={t} a={at(114) - 0.1} b={BLOC_DUR + 1} text="* temps mesuré : 27 à 35 s par lettre" y={1405} color="#B8B8BD" />
      {t >= S1 - 0.05 && <div style={{ position: "absolute", inset: 0, zIndex: 25 }}><Caption t={t} /></div>}
      <Audio src={staticFile("audio/bloc.wav")} />
    </AbsoluteFill>
  );
};
