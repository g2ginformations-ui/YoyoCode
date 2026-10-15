// « Une IA pour ta lettre de motiv ? Red flag ou green flag ? » (≈42 s, 30 i/s, 9:16) : le format « red flag / green flag »
// appliqué à la CONFIANCE qu'on peut faire à un outil d'IA pour sa lettre. Chaque red flag est générique (on ne vise
// personne) ; chaque green flag est une vraie fonction de MyMotiv, vérifiée dans lettre-ia : « rien n'est inventé »
// (lib/prompts.ts, page /cv), une lettre par offre avec le nom et le logo de l'entreprise, sans engagement et résiliable
// en 2 clics (/abonnement, Mon compte), c'est toi qui relis, ajustes et valides. Et « personne ne peut te promettre un job ».
// Fin : 1re lettre offerte, lien en bio, puis « ton pire red flag en candidature ? » en commentaire.
// Voix : voix-flag.json (--voix yann). Son : synth_flag.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce } from "./apple";
import { PINK, easeInOut, seg } from "./common";
import voix from "./data/flag-voix.json";
import { makeCaption } from "./FauxDM";
import { INK, K, Mot, fit } from "./kinetic";
import { CAP_BOX } from "./pixelTT";
import { Coche, FinOfferte, X, horloge } from "./pubMotion";
import "./fonts";

export const FLAG_DUR = voix.duration;
const { PH, at, sc } = horloge(voix);
const HOT = new Set(["ia", "lettre", "invente", "cv", "rien", "promet", "job", "meme", "offres", "nom", "logo", "abonnement", "arreter",
  "engagement", "resilies", "clics", "relis", "ajustes", "valides", "mymotiv", "partout", "offerte", "bio", "pire", "commentaire"]);
const Caption = makeCaption(voix, HOT, CAP_BOX, PINK);
const EMOJI = "'Noto Color Emoji'";
const ROUGE = "#E8262B", VERT = "#22C55E";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const pop = (t: number, a: number) => bounce(t, [[a, 0.55], [a + 0.2, 1]], 0.09, 3, 7);

// ─── un drapeau qui flotte ───
const Drapeau: React.FC<{ t: number; x: number; y: number; couleur: string; s?: number; label?: string }> = ({ t, x, y, couleur, s = 1, label }) => {
  const pts = Array.from({ length: 11 }, (_, i) => i / 10);
  const haut = pts.map((k) => `${40 + k * 220},${20 + Math.sin(t * 7 + k * 5) * 12 * k}`).join(" L");
  const bas = pts.slice().reverse().map((k) => `${40 + k * 220},${170 + Math.sin(t * 7 + k * 5) * 12 * k}`).join(" L");
  return (
    <div style={{ position: "absolute", left: x - 140, top: y - 200, width: 280, height: 400, transform: `scale(${s})`, transformOrigin: "50% 50%" }}>
      <svg width="280" height="400" viewBox="0 0 280 400" style={{ position: "absolute", left: 0, top: 0, overflow: "visible", filter: `drop-shadow(0 0 30px ${couleur}66)` }}>
        <rect x="30" y="10" width="12" height="390" rx="6" fill="#D9D9DE" />
        <path d={`M${haut} L${bas} Z`} fill={couleur} />
      </svg>
      {label && <div style={{ position: "absolute", left: -100, right: -100, top: 410, textAlign: "center", fontFamily: K, fontWeight: 900, fontSize: 60, color: couleur, letterSpacing: 1 }}>{label}</div>}
    </div>
  );
};

// ─── une affirmation, puis le verdict ───
type Manche = { a: number; v: number; b: number; texte: string; vert: boolean };
const MANCHES: Manche[] = [
  { a: sc(1), v: at(25) - 0.1, b: sc(2), texte: "Elle t'invente des expériences pour faire joli", vert: false },
  { a: sc(2), v: at(36) - 0.1, b: sc(3), texte: "Elle part de ton CV et n'invente rien", vert: true },
  { a: sc(3), v: at(43) - 0.1, b: sc(4), texte: "Elle te promet un job", vert: false },
  { a: sc(4), v: at(57) - 0.1, b: sc(5), texte: "La même lettre pour toutes les offres", vert: false },
  { a: sc(5), v: at(72) - 0.1, b: sc(6), texte: "Une lettre par offre, avec le nom et le logo de l'entreprise", vert: true },
  { a: sc(6), v: at(79) - 0.1, b: sc(7), texte: "Un abonnement impossible à arrêter", vert: false },
  { a: sc(7), v: at(89) - 0.1, b: sc(8), texte: "Sans engagement, résiliable en 2 clics", vert: true },
];
const Verdict: React.FC<{ t: number; m: Manche }> = ({ t, m }) => {
  const c = m.vert ? VERT : ROUGE, tranche = t >= m.v;
  const secoue = !m.vert && tranche ? Math.sin((t - m.v) * 70) * 10 * Math.exp(-(t - m.v) * 6) : 0;
  return (
    <>
      <div style={{ position: "absolute", left: X - 400, top: 520, width: 800, padding: "40px 44px", boxSizing: "border-box", borderRadius: 34, background: tranche ? `${c}22` : "#1C1C1E",
        border: `6px solid ${tranche ? c : "#3A3A3C"}`, boxShadow: tranche ? `0 0 60px ${c}55` : "0 20px 60px rgba(0,0,0,0.5)", transform: `translateX(${secoue}px) scale(${pop(t, m.a)})`,
        fontFamily: "Poppins", fontWeight: 700, fontSize: 54, lineHeight: 1.2, color: "#fff", textAlign: "center" }}>
        « {m.texte} »
      </div>
      {tranche && (
        <div style={{ position: "absolute", left: X, top: 930, transform: `translate(-50%, -50%) rotate(${m.vert ? -4 : 4}deg) scale(${bounce(t, [[m.v, 2], [m.v + 0.14, 1]], 0.1, 3, 7)})`, display: "flex", alignItems: "center", gap: 18,
          padding: "12px 34px", borderRadius: 24, border: `7px solid ${c}`, color: c, background: "rgba(11,10,11,0.85)", fontFamily: `${K}, ${EMOJI}`, fontWeight: 900, fontSize: 76, whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: EMOJI, fontSize: 64 }}>{m.vert ? "✅" : "🚩"}</span>{m.vert ? "GREEN FLAG" : "RED FLAG"}
        </div>
      )}
    </>
  );
};
// la preuve sous un green flag : la phrase exacte du site, ou la vraie capture
const Citation: React.FC<{ t: number; a: number; texte: string }> = ({ t, a, texte }) =>
  t < a ? null : (
    <div style={{ position: "absolute", left: X - 380, top: 1030, width: 760, padding: "16px 26px", boxSizing: "border-box", borderLeft: `8px solid ${VERT}`, borderRadius: 14, background: "rgba(255,255,255,0.06)",
      opacity: seg(t, a, a + 0.2), transform: `translateY(${(1 - ease(t, a, a + 0.3)) * 30}px)`, fontFamily: "Open Sans", fontStyle: "italic", fontSize: 32, lineHeight: 1.35, color: "#E5E5EA" }}>
      {texte}<div style={{ fontStyle: "normal", fontSize: 24, color: "#8E8E93", marginTop: 6 }}>— sur le site MyMotiv</div>
    </div>
  );

export const Flags: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const m = MANCHES.find((x) => t >= x.a && t < x.b);
  const teinte = m && t >= m.v ? (m.vert ? VERT : ROUGE) : null;
  const S8 = sc(8), S9 = sc(9), T_FIN = at(112) - 0.1, T_CTA = at(121) - 0.1;
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at 20% 15%, ${ROUGE}26 0%, rgba(0,0,0,0) 40%), radial-gradient(circle at 85% 85%, ${VERT}22 0%, rgba(0,0,0,0) 42%)` }} />
      {teinte && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${teinte}33 0%, rgba(0,0,0,0) 65%)`, opacity: seg(t, m!.v, m!.v + 0.2) }} />}

      {/* 1. l'accroche, visible dès l'image 0 */}
      {t < sc(1) && (
        <>
          <Mot t={t} a={-0.5} text="UNE IA POUR" y={390} size={fit("UNE IA POUR", 100)} />
          <Mot t={t} a={-0.45} text="TA LETTRE DE MOTIV ?" y={500} size={fit("TA LETTRE DE MOTIV ?", 96)} color={PINK} />
          <Drapeau t={t} x={X - 200} y={880} couleur={ROUGE} s={t >= at(12) - 0.1 ? pop(t, at(12) - 0.1) : 0.7} label={t >= at(12) - 0.1 ? "RED FLAG" : undefined} />
          <Drapeau t={t + 0.4} x={X + 200} y={880} couleur={VERT} s={t >= at(15) - 0.1 ? pop(t, at(15) - 0.1) : 0.7} label={t >= at(15) - 0.1 ? "GREEN FLAG" : undefined} />
          {t >= at(14) - 0.1 && <div style={{ position: "absolute", left: X, top: 880, transform: `translate(-50%, -50%) scale(${pop(t, at(14) - 0.1)})`, fontFamily: K, fontWeight: 900, fontSize: 64, color: "#8E8E93" }}>OU</div>}
        </>
      )}

      {/* 2. les manches */}
      {m && <Verdict t={t} m={m} />}
      {m === MANCHES[1] && <Citation t={t} a={at(34) - 0.1} texte="« Rien n'est inventé : MyMotiv trie, raccourcit et reformule uniquement ce qui figure dans votre CV. »" />}
      {m === MANCHES[2] && t >= at(45) - 0.1 && <Mot t={t} a={at(45) - 0.1} text={"PERSONNE PEUT\nTE PROMETTRE ÇA."} y={1100} size={fit("PERSONNE PEUT\nTE PROMETTRE ÇA.", 64)} lh={1.05} />}
      {m === MANCHES[4] && t >= at(65) - 0.1 && (
        <div style={{ position: "absolute", left: X - 380, top: 1030, width: 760, height: 100, borderRadius: 18, overflow: "hidden", border: `4px solid ${VERT}`, opacity: seg(t, at(65) - 0.1, at(65) + 0.1),
          transform: `translateY(${(1 - ease(t, at(65) - 0.1, at(65) + 0.2)) * 30}px)` }}>
          <Img src={staticFile("tuto-tel/040-lettre.jpg")} style={{ position: "absolute", left: -100 * 0.864, top: -368 * 0.864, width: 1080 * 0.864, height: 1920 * 0.864 }} />
        </div>
      )}
      {m === MANCHES[6] && <Citation t={t} a={at(85) - 0.1} texte="« Sans engagement, résiliable en 2 clics. »" />}

      {/* 3. c'est toi qui relis, ajustes, valides */}
      {t >= S8 && t < S9 && (
        <>
          <Mot t={t} a={S8 + 0.05} text={"À LA FIN,\nC'EST TOI QUI…"} y={460} size={fit("À LA FIN,\nC'EST TOI QUI…", 92)} lh={1} />
          <Coche t={t} a={at(99) - 0.1} text="relis" y={700} dark size={52} />
          <Coche t={t} a={at(101) - 0.1} text="ajustes" y={820} dark size={52} />
          <Coche t={t} a={at(104) - 0.15} text="valides" y={940} dark size={52} />
        </>
      )}

      {/* 4. sur MyMotiv : green flag partout */}
      {t >= S9 && t < T_FIN && (
        <>
          <Mot t={t} a={S9 + 0.05} text="SUR MYMOTIV" y={420} size={fit("SUR MYMOTIV", 100)} color={PINK} />
          {["Rien d'inventé", "1 lettre par offre", "Résiliable en 2 clics", "C'est toi qui valides"].map((txt, i) => (
            <Coche key={txt} t={t} a={at(109) - 0.2 + i * 0.12} text={txt} y={600 + i * 115} dark size={46} />
          ))}
          {t >= at(111) - 0.1 && <Drapeau t={t} x={X + 330} y={1060} couleur={VERT} s={0.55 * pop(t, at(111) - 0.1)} />}
        </>
      )}
      {t >= T_FIN && t < T_CTA && <FinOfferte t={t} t0={T_FIN} aBio={at(117) - 0.05} dark sous="Green flag : sans carte bancaire." />}

      {/* 5. l'appel à commenter */}
      {t >= T_CTA && (
        <>
          <Drapeau t={t} x={X} y={620} couleur={ROUGE} s={0.9 * pop(t, T_CTA)} />
          <Mot t={t} a={at(124) - 0.1} text={"TON PIRE RED FLAG\nEN CANDIDATURE ?"} y={980} size={fit("TON PIRE RED FLAG\nEN CANDIDATURE ?", 84)} color="#fff" lh={1.02} />
          {t >= at(129) - 0.1 && <div style={{ position: "absolute", left: X, top: 1130, transform: `translate(-50%, -50%) scale(${pop(t, at(129) - 0.1)})`, padding: "10px 30px", borderRadius: 24, background: ROUGE, color: "#fff",
            fontFamily: `${K}, ${EMOJI}`, fontWeight: 900, fontSize: 48, whiteSpace: "nowrap" }}>EN COMMENTAIRE 👇</div>}
        </>
      )}
      {t >= sc(1) - 0.05 && <div style={{ position: "absolute", inset: 0, zIndex: 25 }}><Caption t={t} /></div>}
      <Audio src={staticFile("audio/flag.wav")} />
    </AbsoluteFill>
  );
};
