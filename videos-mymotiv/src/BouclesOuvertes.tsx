// « Boucles ouvertes » (≈59 s, 30 i/s, 9:16) : le script du propriétaire (16/10/2026) construit sur des boucles ouvertes
// (effet Zeigarnik) : on lance trois sujets sans jamais les finir (le téléphone et les lentilles, le faux oubli, la
// probabilité d'être né), puis la révélation « j'ai fini aucune phrase et t'es encore là », le lien avec la lettre de
// motivation (commence par LEUR problème : c'est ce que fait MyMotiv, lib/prompts.ts) et une fin qui pousse à revoir.
// Version honnête : pas d'étude citée sans source (« bien plus sale que ce que tu crois »), pas de « des gens en sont
// morts », pas de chiffre sur la probabilité de naître ; le seul conseil santé est le conseil d'hygiène standard
// (mains propres avant de toucher ses lentilles). Chaque sujet a sa barre de progression qui s'arrête avant la fin.
// Yann masqué : ses vraies photos (public/yann/). Voix : voix-boucle.json (--voix yann). Son : synth_boucle.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce } from "./apple";
import { PINK, PINK_L, easeInOut, seg } from "./common";
import voix from "./data/boucle-voix.json";
import { makeCaption } from "./FauxDM";
import { INK, K, Mot, fit } from "./kinetic";
import { CAP_BOX } from "./pixelTT";
import { FinOfferte, Mention, X, horloge } from "./pubMotion";
import "./fonts";

const { PH, at, sc } = horloge(voix);
const FIN = PH[8][1] - 0.2;                                         // sur « raté » : l'accroche revient, la vidéo boucle
export const BOUCLE_DUR = PH[8][1] + 0.55;
const HOT = new Set(["lentilles", "telephone", "sale", "yeux", "infection", "grave", "pire", "attends", "oublies", "probabilite", "toi", "ridiculement",
  "fou", "remarque", "aucune", "phrase", "encore", "cerveau", "finies", "lettre", "probleme", "suite", "mymotiv", "besoins", "secondes", "offerte", "bio", "deuxieme"]);
const Caption = makeCaption(voix, HOT, CAP_BOX, PINK);
const EMOJI = "'Noto Color Emoji'";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const pop = (t: number, a: number) => bounce(t, [[a, 0.55], [a + 0.2, 1]], 0.09, 3, 7);

// ─── les temps clés ───
const S1 = sc(1), S2 = sc(2), S3 = sc(3), S4 = sc(4), S5 = sc(5), S6 = sc(6), S7 = sc(7), S8 = sc(8);
const COUPE1 = at(68) + 0.15, COUPE3 = at(117) + 0.15;            // « … c'est que… » : la phrase s'arrête net
const T_FIN = at(190) - 0.1;                                        // « Ta première est offerte »

// ─── Yann face caméra : une pose par passage ───
const POSES: [number, string][] = [
  [-1, "g2-argumenter"], [S1, "g1-expliquer"], [S2, "g2-insister"], [at(63) - 0.1, "emo-peur"], [S3, "emo-confusion"], [S4, "emo-reflexion"],
  [at(102) - 0.1, "g2-decrire"], [S5, "emo-joie"], [S6, "g1-expliquer"], [S8, "emo-joie"], [FIN, "g2-argumenter"],
];
const Yann: React.FC<{ t: number }> = ({ t }) => {
  let k = 0;
  POSES.forEach(([a], i) => { if (t >= a) k = i; });
  const [a, pose] = POSES[k];
  const punch = 1 + 0.035 * Math.exp(-(t - a) * 10) + (t >= S3 && t < S4 ? 0.06 : 0);
  const sx = Math.sin(t * 1.9) * 6, sy = Math.cos(t * 1.4) * 5, rz = Math.sin(t * 1.1) * 0.8;
  const glitch = t >= S3 && t < S3 + 0.35 ? Math.sin(t * 90) * 14 : 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 72% 22%, #6B5446 0%, #3E322B 32%, #1E1916 70%, #110E0C 100%)", overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 640, top: 140, width: 420, height: 760, background: "rgba(255,236,214,0.15)", filter: "blur(70px)" }} />
      <div style={{ position: "absolute", left: X - 560, top: 600, width: 1120, height: 1380, transformOrigin: "50% 25%", transform: `translate(${sx + glitch}px, ${sy}px) rotate(${rz}deg) scale(${punch})` }}>
        <Img src={staticFile(`yann/${pose}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 100%" }} />
      </div>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
    </AbsoluteFill>
  );
};

// ─── une barre de progression par histoire, qui s'arrête avant la fin ───
const Boucle: React.FC<{ t: number; a: number; stop: number; label: string; y: number; emoji: string; fige?: boolean }> = ({ t, a, stop, label, y, emoji, fige }) => {
  if (t < a) return null;
  const k = Math.min(0.82, 0.82 * seg(t, a, stop)), arret = t >= stop;
  const points = ".".repeat(1 + (Math.floor(t * 3) % 3));
  return (
    <div style={{ position: "absolute", left: X - 380, top: y, width: 760, padding: "14px 22px", boxSizing: "border-box", borderRadius: 22, background: "rgba(20,18,20,0.88)", border: `3px solid ${arret ? PINK : "#3A3A3C"}`,
      transform: `scale(${pop(t, a)})`, zIndex: 12, boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14, fontFamily: `${K}, Poppins, ${EMOJI}`, fontWeight: 800, fontSize: 38, color: "#fff" }}>
        <span style={{ fontFamily: EMOJI }}>{emoji}</span>{label}
        <span style={{ marginLeft: "auto", fontSize: 32, color: arret ? PINK_L : "#8E8E93" }}>{arret ? (fige ? "⏸ pas fini" : `⏸ ${points}`) : "en cours"}</span>
      </div>
      <div style={{ marginTop: 12, height: 16, borderRadius: 8, background: "#2C2C2E", overflow: "hidden" }}>
        <div style={{ width: `${k * 100}%`, height: "100%", borderRadius: 8, background: arret ? PINK : "#E5E5EA" }} />
      </div>
    </div>
  );
};

// ─── petites étiquettes (lieux, conseil) ───
const Pastille: React.FC<{ t: number; a: number; b: number; x: number; y: number; text: string; rose?: boolean; size?: number }> = ({ t, a, b, x, y, text, rose, size = 42 }) =>
  t < a || t >= b ? null : (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${pop(t, a)})`, padding: "10px 24px", borderRadius: 22, background: rose ? PINK : "#fff", color: rose ? "#fff" : INK,
      fontFamily: `${K}, Poppins, ${EMOJI}`, fontWeight: 800, fontSize: size, whiteSpace: "nowrap", boxShadow: "0 10px 30px rgba(0,0,0,0.45)", zIndex: 13 }}>{text}</div>
  );

// ─── toi, un point parmi des milliers ───
const Points: React.FC<{ t: number; a: number; b: number }> = ({ t, a, b }) => {
  if (t < a || t >= b) return null;
  const cols = 34, rows = 16, cell = 22, apparu = seg(t, a, a + 0.6), toi = t >= at(95) - 0.15;
  return (
    <div style={{ position: "absolute", left: X - (cols * cell) / 2, top: 720, width: cols * cell, height: rows * cell, opacity: apparu, zIndex: 11 }}>
      <div style={{ position: "absolute", inset: -18, borderRadius: 26, background: "rgba(11,10,11,0.62)", backdropFilter: "blur(6px)" }} />
      {Array.from({ length: cols * rows }, (_, i) => {
        const c = i % cols, r = Math.floor(i / cols), lui = c === 19 && r === 6;
        return <div key={i} style={{ position: "absolute", left: c * cell + 6, top: r * cell + 6, width: 10, height: 10, borderRadius: 5, background: lui && toi ? PINK : "rgba(255,255,255,0.35)",
          transform: lui && toi ? `scale(${2.6 * pop(t, at(95) - 0.15)})` : "none", boxShadow: lui && toi ? `0 0 20px ${PINK}` : "none" }} />;
      })}
      {toi && <div style={{ position: "absolute", left: 19 * cell + 44, top: 6 * cell - 26, padding: "6px 20px", borderRadius: 20, background: PINK, fontFamily: K, fontWeight: 900, fontSize: 44, color: "#fff", whiteSpace: "nowrap", transformOrigin: "0 50%", transform: `scale(${pop(t, at(95) - 0.1)})` }}>C'EST TOI</div>}
    </div>
  );
};

// ─── la lettre : la 1re phrase qui parle de toi (✗) contre celle qui parle de leur problème (✓) ───
const Comparaison: React.FC<{ t: number }> = ({ t }) => {
  const carte = (a: number, y: number, ok: boolean, texte: string) => t < a ? null : (
    <div style={{ position: "absolute", left: X - 390, top: y, width: 780, padding: "22px 28px 22px 92px", boxSizing: "border-box", borderRadius: 24, background: "#FFFDF9", transform: `scale(${pop(t, a)})`,
      fontFamily: "Georgia, 'DejaVu Serif', serif", fontSize: 36, lineHeight: 1.35, color: ok ? "#1D1D1F" : "#8E8E93", border: `6px solid ${ok ? "#22C55E" : "#E8262B"}`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", zIndex: 12 }}>
      <span style={{ position: "absolute", left: 22, top: 18, fontFamily: EMOJI, fontSize: 50 }}>{ok ? "✅" : "❌"}</span>
      {texte}
    </div>
  );
  return (
    <>
      {carte(at(154) - 0.1, 440, false, "« Je me permets de vous écrire pour vous présenter ma candidature… »")}
      {carte(at(163) - 0.15, 700, true, "« Votre boutique de Lyon mise sur le conseil client et la mise en scène des produits. »")}
    </>
  );
};

export const BouclesOuvertes: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const revele = t >= S5 && t < S6;
  const fin = t >= FIN;                                              // les dernières images = la première (boucle)
  return (
    <AbsoluteFill style={{ background: INK, overflow: "hidden" }}>
      {t < S7 || t >= S8 ? <Yann t={t} /> : t < T_FIN ? (
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, #3A2327 0%, #1E1719 38%, #0B0A0B 78%)" }}>
          <Mot t={t} a={S7 + 0.05} text="MYMOTIV OUVRE SUR" y={400} size={fit("MYMOTIV OUVRE SUR", 80)} color={PINK} />
          <Mot t={t} a={at(182) - 0.1} text="LEURS VRAIS BESOINS" y={500} size={fit("LEURS VRAIS BESOINS", 80)} />
          <div style={{ position: "absolute", left: X - 300, top: 620, width: 600, height: 520, borderRadius: 30, overflow: "hidden", border: "10px solid #1D1D1F", transform: `scale(${pop(t, S7 + 0.2)}) rotate(-2deg)`, boxShadow: "0 40px 90px rgba(0,0,0,0.6)" }}>
            <Img src={staticFile("tuto-tel/040-lettre.jpg")} style={{ position: "absolute", left: -95 * 0.62, top: -345 * 0.62, width: 1080 * 0.62, height: 1920 * 0.62 }} />
          </div>
          {t >= at(188) - 0.1 && <div style={{ position: "absolute", left: X + 210, top: 640, transform: `translate(-50%, -50%) rotate(6deg) scale(${pop(t, at(188) - 0.1)})`, padding: "10px 26px", borderRadius: 24, background: PINK, color: "#fff",
            fontFamily: `${K}, ${EMOJI}`, fontWeight: 900, fontSize: 52 }}>⏱ 30 s*</div>}
        </AbsoluteFill>
      ) : <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 46%, #3A2327 0%, #1E1719 38%, #0B0A0B 78%)" }} />}
      {t >= T_FIN && t < S8 && <FinOfferte t={t} t0={T_FIN} aBio={at(194) - 0.05} dark sous="Sans carte bancaire." />}

      {/* l'accroche (et la toute fin, pour que la vidéo boucle) */}
      {(t < S1 || fin) && (
        <>
          <Mot t={fin ? t + 1 : t} a={-0.5} text="AVANT TES LENTILLES" y={320} size={fit("AVANT TES LENTILLES", 84)} />
          <Mot t={fin ? t + 1 : t} a={-0.45} text={"NE TOUCHE JAMAIS\nTON TÉLÉPHONE"} y={455} size={fit("NE TOUCHE JAMAIS\nTON TÉLÉPHONE", 92)} color={PINK} lh={0.98} />
        </>
      )}

      {/* histoire 1 : le téléphone */}
      {t >= S1 && t < S5 && <Boucle t={t} a={S1} stop={COUPE1} label="Le téléphone" emoji="📱" y={300} fige={t >= S3} />}
      <Pastille t={t} a={at(24) - 0.1} b={S2} x={X - 220} y={520} text="🚽 toilettes" />
      <Pastille t={t} a={at(27) - 0.1} b={S2} x={X + 200} y={560} text="🚇 métro" />
      <Pastille t={t} a={at(29) - 0.1} b={S2} x={X - 60} y={660} text="🍽️ table" />
      {t >= at(34) - 0.1 && t < S2 && <div style={{ position: "absolute", left: X + 250, top: 690, fontFamily: EMOJI, fontSize: 90, transform: `scale(${pop(t, at(34) - 0.1)}) rotate(${Math.sin(t * 6) * 8}deg)`, zIndex: 13 }}>🦠</div>}
      <Pastille t={t} a={at(47) - 0.1} b={S3} x={X} y={520} text="🧼 Mains propres avant tes lentilles" rose size={40} />

      {/* histoire 2 : le faux oubli */}
      {t >= S3 && t < S5 && <Boucle t={t} a={S3 + 0.3} stop={S4 - 0.1} label="Ce que je voulais dire" emoji="🤔" y={440} fige={t >= S4} />}
      {t >= S3 && t < S4 && <div style={{ position: "absolute", left: X + 240, top: 640, fontFamily: K, fontWeight: 900, fontSize: 140, color: "#fff", opacity: 0.85, transform: `scale(${pop(t, S3 + 0.4)}) rotate(12deg)`, zIndex: 13 }}>?</div>}

      {/* histoire 3 : la probabilité d'être né */}
      {t >= S4 && t < S5 && <Boucle t={t} a={S4 + 0.1} stop={COUPE3} label="Toi, exactement toi" emoji="🎲" y={580} />}
      <Points t={t} a={at(90) - 0.1} b={at(102) + 1.5} />

      {/* la révélation */}
      {revele && (
        <>
          <Boucle t={t} a={S5 + 0.05} stop={S5 + 0.06} label="Le téléphone" emoji="📱" y={300} fige />
          <Boucle t={t} a={at(129) - 0.1} stop={at(129) - 0.09} label="Ce que je voulais dire" emoji="🤔" y={440} fige />
          <Boucle t={t} a={at(131) - 0.1} stop={at(131) - 0.09} label="Toi, exactement toi" emoji="🎲" y={580} fige />
          {t >= at(135) - 0.15 && <Mot t={t} a={at(135) - 0.15} text={"0 PHRASE\nFINIE."} y={880} size={fit("0 PHRASE\nFINIE.", 120)} color={PINK} ext="#3A1A1F" depth={8} slam lh={0.95} />}
        </>
      )}
      {t >= S6 && t < S7 && (
        <>
          <div style={{ position: "absolute", left: X, top: 330, transform: `translate(-50%, -50%) scale(${pop(t, S6 + 0.05)})`, padding: "10px 28px", borderRadius: 24, background: "#fff", color: INK, fontFamily: K, fontWeight: 900, fontSize: 44, whiteSpace: "nowrap", zIndex: 13 }}>EFFET ZEIGARNIK</div>
          {t < at(154) - 0.1 && <Mot t={t} a={at(146) - 0.1} text={"TON CERVEAU DÉTESTE\nLES HISTOIRES PAS FINIES"} y={520} size={fit("TON CERVEAU DÉTESTE\nLES HISTOIRES PAS FINIES", 70)} lh={1.05} />}
          <Comparaison t={t} />
        </>
      )}
      {/* la fin : regarde-la encore */}
      {t >= S8 && !fin && <Pastille t={t} a={at(202) - 0.15} b={BOUCLE_DUR + 1} x={X} y={420} text="↻ Regarde-la une 2e fois" rose size={52} />}

      <Mention t={t} a={at(188) - 0.1} b={S8} text="* temps mesuré : 27 à 35 s par lettre" y={1405} color="#B8B8BD" />
      {t >= S1 - 0.05 && !fin && !(t >= T_FIN && t < S8) && <div style={{ position: "absolute", inset: 0, zIndex: 25 }}><Caption t={t} /></div>}
      <Audio src={staticFile("audio/boucle.wav")} />
    </AbsoluteFill>
  );
};
