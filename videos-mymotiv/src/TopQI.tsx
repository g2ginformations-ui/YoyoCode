// « Top 5 QI » (≈ 30 s, 60 i/s, 9:16) — présenté par Yann Motiveur (mascotte, en bas à droite, expression qui change).
// Voix NATURELLE de l'utilisateur (tools/voix-narrateur.py + voix-qi.json, coupes explicites) ; chœur final des 4 génies
// « Avec MyMotiv, postulez. Et faites-vous recruter ! » (synth_qi.py → src/data/qi-choeur.json : les portraits sautillent
// sur l'enveloppe du chœur). Portraits anciens du domaine public (public/qi/SOURCES.txt). Logo MyMotiv fixe en haut.
// Classement façon émission : cartes qui pivotent, grand numéro, roulement de tambour avant le n° 1, couronne, tableau final.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, go } from "./apple";
import { PINK, PINK_L, lerp, seg } from "./common";
import { Confetti } from "./Lien";
import { DARK, Flash, Shockwave, ease, pulse } from "./motion";
import { Pill, inOut, show } from "./AvantAujourdhui";
import voix from "./data/qi-voix.json";
import choeur from "./data/qi-choeur.json";
import "./fonts";

export const QI_DUR = voix.duration;
const P = voix.phrases;
const CX = 540;
const GOLD = "#F5C66B";

export const Q = {
  intro: P[0].t0, n5: P[1].t0, toi: P[2].t0, parce: P[3].t0, n4: P[4].t0, n3: P[5].t0, newton: P[6].t0, n2: P[7].t0, vinci: P[8].t0,
  un: P[9].t0, archi: P[10].t0, cie: P[11].t0, offerte: P[12].t0, choeur: choeur.t0, split: choeur.t0 + choeur.split, fin: choeur.t0 + choeur.dur,
};
type Genie = { id: string; nom: string; pos: string; badge: string };
const G: Record<string, Genie> = {
  galilee: { id: "galilee", nom: "Galilée", pos: "50% 18%", badge: "🔭" },
  newton: { id: "newton", nom: "Isaac Newton", pos: "50% 28%", badge: "🍎" },
  vinci: { id: "vinci", nom: "Léonard de Vinci", pos: "36% 34%", badge: "🎨" },
  archimede: { id: "archimede", nom: "Archimède", pos: "86% 20%", badge: "💡" },
};
// classement : [rang, génie (ou « toi »), début de la carte, fin, apparition du portrait/nom]
const RANKS: [number, string, number, number, number][] = [
  [5, "toi", Q.n5, Q.n4, Q.toi], [4, "galilee", Q.n4, Q.n3, Q.n4 + 0.55], [3, "newton", Q.n3, Q.n2, Q.newton],
  [2, "vinci", Q.n2, Q.un, Q.vinci], [1, "archimede", Q.un, Q.cie, Q.archi],
];

const Portrait: React.FC<{ g: Genie; w: number; h: number; r?: number; style?: React.CSSProperties }> = ({ g, w, h, r = 40, style }) => (
  <Img src={staticFile(`qi/${g.id}.jpg`)} style={{ width: w, height: h, objectFit: "cover", objectPosition: g.pos, borderRadius: r, display: "block", ...style }} />
);
const Silhouette: React.FC<{ s: number; c?: string }> = ({ s, c = "#4A4A50" }) => (
  <svg width={s} height={s} viewBox="0 0 100 100"><circle cx="50" cy="38" r="19" fill={c} /><path d="M12 100 Q50 52 88 100 Z" fill={c} /></svg>
);

// Yann Motiveur : expression selon le moment
const YANN: [number, string][] = [[0, "surprise"], [Q.toi - 0.05, "rire"], [Q.n4, "sourire"], [Q.n3, "reflexion"], [Q.n2, "surprise"],
  [Q.un, "stress"], [Q.archi, "choc"], [Q.cie, "rire"], [Q.offerte, "sourire"], [Q.choeur - 0.2, "rire"]];

export const TopQI: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const yi = YANN.reduce((a, [s], i) => (t >= s ? i : a), 0);
  const [ys, yimg] = YANN[yi];
  const speaking = P.some((p) => t > p.t0 && t < p.t1);
  const chIdx = Math.floor((t - Q.choeur) * 60);
  const chEnv = chIdx >= 0 && chIdx < choeur.env.length ? choeur.env[chIdx] : 0;
  const shake = (pulse(t, Q.toi, 0.08) + pulse(t, Q.archi, 0.1)) * Math.sin(t * 90) * 12 + (t > Q.un && t < Q.archi ? Math.sin(t * 70) * 3 * seg(t, Q.un, Q.archi) : 0);

  return (
    <AbsoluteFill style={{ background: "#0E0D10", fontFamily: "Poppins", color: DARK.ink, overflow: "hidden" }}>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 42%, #2A2026 0%, #141215 50%, #09080A 100%)" }} />
      {/* projecteurs qui balaient pendant le roulement de tambour */}
      {t > Q.un - 0.1 && t < Q.cie && [0, 1].map((i) => (
        <div key={i} style={{ position: "absolute", left: CX - 200, top: -100, width: 400, height: 1300, transformOrigin: "50% 0%", transform: `rotate(${Math.sin(t * 5 + i * 2) * 28 * (1 - ease(t, Q.archi - 0.15, Q.archi))}deg)`, background: `linear-gradient(180deg, rgba(255,240,210,0.22), rgba(255,240,210,0))`, clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)", opacity: seg(t, Q.un - 0.1, Q.un + 0.2) * (1 - seg(t, Q.cie - 0.3, Q.cie)) }} />
      ))}

      <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.4}px)` }}>
        {/* ═════ intro : TOP 5 + tableau mystère ═════ */}
        {show(t, 0, Q.n5) && (
          <>
            <div style={{ position: "absolute", left: 40, right: 40, top: 290, textAlign: "center", ...inOut(t, 0.05, Q.n5) }}>
              <div style={{ fontSize: 46, fontWeight: 700, color: DARK.soft }}><TextDrop t={t} t0={0.1} text="C'est pas pour vous faire peur…" /></div>
              <div style={{ fontSize: 230, fontWeight: 800, letterSpacing: -10, lineHeight: 1, marginTop: 10, color: PINK, textShadow: `0 0 ${60 + 60 * pulse(t, 1.95, 0.2)}px rgba(217,130,139,0.6)`, transform: `scale(${go(t, 1.75, 2.05, 2.6, 1)})`, opacity: seg(t, 1.75, 1.85) }}>TOP 5</div>
              <div style={{ fontSize: 54, fontWeight: 800, marginTop: 6 }}><TextDrop t={t} t0={2.5} text="des QI les plus élevés 🧠" by="chars" from={[0, 24]} stagger={0.025} dur={0.15} /></div>
            </div>
            {[5, 4, 3, 2, 1].map((r, i) => (
              <div key={r} style={{ position: "absolute", left: 140, right: 140, top: 820 + i * 92, height: 76, borderRadius: 24, background: "rgba(255,255,255,0.07)", border: "1.5px solid rgba(255,255,255,0.12)", display: "flex", alignItems: "center", padding: "0 30px", gap: 24, fontSize: 36, fontWeight: 800, ...inOut(t, 3.3 + i * 0.12, Q.n5) }}>
                <span style={{ color: PINK }}>#{r}</span><span style={{ color: DARK.soft, letterSpacing: 6 }}>? ? ?</span>
              </div>
            ))}
          </>
        )}

        {/* ═════ cartes du classement ═════ */}
        {RANKS.map(([r, id, a, b, reveal]) => {
          if (!show(t, a, b)) return null;
          const inK = ease(t, a, a + 0.38), outK = ease(t, b - 0.25, b);
          const g = G[id];
          const rv = ease(t, reveal - 0.05, reveal + 0.25);
          const crown = r === 1 ? go(t, Q.archi + 0.15, Q.archi + 0.45, 0, 1) : 0;
          return (
            <div key={r} style={{ position: "absolute", inset: 0, perspective: 1600 }}>
              {/* grand numéro */}
              <div style={{ position: "absolute", left: 50, top: 250, fontSize: 260, fontWeight: 800, fontStyle: "italic", letterSpacing: -12, color: "transparent", WebkitTextStroke: `5px ${r === 1 ? GOLD : PINK}`, opacity: inK * (1 - outK), transform: `translateX(${(1 - inK) * -200 + outK * -200}px) scale(${go(t, a, a + 0.35, 1.6, 1)})`, zIndex: 6 }}>#{r}</div>
              <div style={{ position: "absolute", left: CX - 270, top: 380, width: 540, height: 660, zIndex: 5, transform: `rotateY(${(1 - inK) * 85 - outK * 85}deg) scale(${0.85 + 0.15 * inK})`, opacity: inK * (1 - outK), filter: `blur(${(1 - inK) * 10 + outK * 10}px)` }}>
                <div style={{ position: "absolute", inset: 0, borderRadius: 44, overflow: "hidden", background: "#1C1C1E", boxShadow: `0 40px 100px rgba(0,0,0,0.6), 0 0 0 4px ${r === 1 ? GOLD : PINK}, 0 0 ${60 + 80 * pulse(t, reveal + 0.1, 0.3)}px ${r === 1 ? "rgba(245,198,107,0.7)" : "rgba(217,130,139,0.6)"}` }}>
                  {/* avant la révélation : silhouette et « ? » */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", opacity: 1 - rv }}>
                    <Silhouette s={320} />
                    <div style={{ fontSize: 110, fontWeight: 800, color: DARK.soft, marginTop: -40 }}>?</div>
                  </div>
                  {id === "toi" ? (
                    <div style={{ position: "absolute", inset: 0, opacity: rv, background: `radial-gradient(circle at 50% 40%, ${PINK_L}, ${PINK} 60%, #9E4E58)`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                      <Silhouette s={300} c="rgba(255,255,255,0.9)" />
                      <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -6, color: "#fff", marginTop: -30, transform: `scale(${go(t, reveal, reveal + 0.3, 1.8, 1)})` }}>TOI</div>
                    </div>
                  ) : (
                    <div style={{ position: "absolute", inset: 0, opacity: rv, transform: `scale(${lerp(1.25, 1.05, rv) + 0.04 * Math.sin(t * 0.8)})` }}><Portrait g={g} w={540} h={660} r={0} /></div>
                  )}
                </div>
                {/* badge et couronne */}
                {id !== "toi" && <div style={{ position: "absolute", right: -30, top: -30, width: 110, height: 110, borderRadius: 55, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 60, boxShadow: "0 10px 30px rgba(0,0,0,0.4)", transform: `scale(${go(t, reveal + 0.25, reveal + 0.55, 0, 1)})` }}>{g.badge}</div>}
                {r === 1 && crown > 0 && <div style={{ position: "absolute", left: 0, right: 0, top: -105, textAlign: "center", fontSize: 120, transform: `translateY(${(1 - crown) * -300}px) rotate(${Math.sin(t * 4) * 5}deg)` }}>👑</div>}
                {id === "newton" && t > Q.newton + 0.4 && <div style={{ position: "absolute", left: 230, top: lerp(-400, 40, Math.min(1, Math.pow(seg(t, Q.newton + 0.4, Q.newton + 0.95), 2))), fontSize: 90, transform: `rotate(${seg(t, Q.newton + 0.95, Q.newton + 1.5) * 40}deg)` }}>🍎</div>}
              </div>
              {/* nom */}
              <div style={{ position: "absolute", left: 0, right: 0, top: 1085, textAlign: "center", zIndex: 7, opacity: rv * (1 - outK), transform: `translateY(${(1 - rv) * 40}px) scale(${go(t, reveal + 0.05, reveal + 0.35, 0.8, 1)})` }}>
                <Pill bg={r === 1 ? GOLD : id === "toi" ? "#fff" : PINK} color={r === 1 || id === "toi" ? "#1D1D1F" : "#fff"} size={50}>{id === "toi" ? "Toi 🫵" : g.nom}</Pill>
                {id === "toi" && <div style={{ marginTop: 16, fontSize: 36, fontWeight: 700, color: PINK_L, opacity: seg(t, Q.parce + 0.3, Q.parce + 0.6) }}>tu utilises MyMotiv pour tes lettres ✍️</div>}
                {r === 1 && <div style={{ marginTop: 14, fontSize: 52, fontWeight: 800, color: GOLD, opacity: seg(t, Q.archi + 0.5, Q.archi + 0.7), transform: `scale(${go(t, Q.archi + 0.5, Q.archi + 0.8, 0.5, 1)})` }}>« Eurêka ! »</div>}
              </div>
            </div>
          );
        })}
        <Flash k={pulse(t, Q.toi, 0.07) * 0.6 + pulse(t, Q.archi, 0.08) * 0.7} />
        <Shockwave t={t} t0={Q.toi} x={CX} y={700} r={650} />
        <Shockwave t={t} t0={Q.archi} x={CX} y={700} r={750} />

        {/* ═════ tableau final : « T'es en bonne compagnie » ═════ */}
        {show(t, Q.cie - 0.05, Q.choeur - 0.1) && (
          <div style={{ position: "absolute", left: 90, right: 90, top: 300, ...inOut(t, Q.cie - 0.05, Q.choeur - 0.1) }}>
            {[[1, "archimede"], [2, "vinci"], [3, "newton"], [4, "galilee"], [5, "toi"]].map(([r, id], i) => {
              const me = id === "toi"; const g = G[id as string];
              return (
                <div key={r} style={{ display: "flex", alignItems: "center", gap: 26, height: 116, marginBottom: 16, padding: "0 26px", borderRadius: 30, background: me ? PINK : "rgba(255,255,255,0.08)", border: me ? "none" : "1.5px solid rgba(255,255,255,0.12)", boxShadow: me ? `0 0 ${40 + 40 * Math.sin(t * 6) ** 2}px rgba(217,130,139,0.7)` : undefined, transform: `translateX(${(1 - ease(t, Q.cie + i * 0.07, Q.cie + 0.35 + i * 0.07)) * (i % 2 ? 400 : -400)}px) scale(${me ? 1 + 0.04 * pulse(t, Q.cie + 0.5, 0.2) : 1})` }}>
                  <div style={{ width: 70, fontSize: 46, fontWeight: 800, color: me ? "#fff" : r === 1 ? GOLD : PINK }}>#{r}</div>
                  {me ? <div style={{ width: 84, height: 84, borderRadius: 42, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}><Silhouette s={70} c="#fff" /></div>
                    : <Portrait g={g} w={84} h={84} r={42} />}
                  <div style={{ fontSize: 42, fontWeight: 800, whiteSpace: "nowrap" }}>{me ? "Toi 🫵" : g.nom}</div>
                </div>
              );
            })}
          </div>
        )}
        {show(t, Q.offerte + 0.4, Q.choeur - 0.1) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1080, textAlign: "center", ...inOut(t, Q.offerte + 0.4, Q.choeur - 0.1) }}>
            <Pill bg={PINK} size={42}>🎁 Ta 1re lettre est offerte</Pill>
          </div>
        )}
        {t > Q.offerte + 0.55 && t < Q.offerte + 2.2 && <Confetti t={t} t0={Q.offerte + 0.55} />}

        {/* ═════ chœur final : les 4 génies (et toi) ═════ */}
        {t > Q.choeur - 0.4 && (
          <>
            {(["galilee", "newton", "vinci", "archimede"] as const).map((id, i) => {
              const k = go(t, Q.choeur - 0.4 + i * 0.07, Q.choeur + i * 0.07, 0, 1);
              const ph = Math.sin(t * 9 + i * 1.7) * 0.5 + 0.5;
              const b = chEnv * (0.7 + 0.3 * ph);
              return (
                <div key={id} style={{ position: "absolute", left: 60 + i * 245, top: 420 + (i % 2) * 70, width: 220, transform: `translateY(${(1 - k) * 600 - b * 40}px) scale(${k * (1 + 0.1 * b)}) rotate(${(i - 1.5) * 4 + Math.sin(t * 6 + i) * 3 * b}deg)` }}>
                  <div style={{ borderRadius: 110, overflow: "hidden", boxShadow: `0 0 0 5px ${i === 3 ? GOLD : PINK}, 0 20px 50px rgba(0,0,0,0.5)` }}><Portrait g={G[id]} w={220} h={220} r={110} /></div>
                  <div style={{ textAlign: "center", marginTop: 12, fontSize: 26, fontWeight: 700, color: DARK.soft, whiteSpace: "nowrap" }}>{G[id].nom}</div>
                </div>
              );
            })}
            <div style={{ position: "absolute", left: 40, right: 40, top: 800, textAlign: "center", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.08 }}>
              <div style={{ fontSize: 70 }}><TextDrop t={t} t0={Q.choeur - 0.05} text="Avec MyMotiv, postulez." /></div>
              <div style={{ fontSize: 82, color: PINK, marginTop: 8 }}><TextDrop t={t} t0={Q.split - 0.1} text="Et faites-vous recruter !" by="chars" from={[0, 30]} stagger={0.03} dur={0.15} /></div>
            </div>
            {show(t, Q.fin - 0.4, QI_DUR + 1) && (
              <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", ...inOut(t, Q.fin - 0.4, QI_DUR + 1) }}>
                <Pill bg="#fff" color="#1D1D1F" size={46}>Lien en bio ↑</Pill>
              </div>
            )}
          </>
        )}
      </AbsoluteFill>

      {/* ═════ logo MyMotiv : fixe en haut ═════ */}
      <div style={{ position: "absolute", left: CX - 150, top: 120, width: 300, zIndex: 40 }}>
        <Img src={staticFile("logo-mymotiv.png")} style={{ width: 300, display: "block" }} />
        {[Q.toi - 0.1, Q.choeur].map((s) => t > s && t < s + 0.7 && (
          <div key={s} style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${staticFile("logo-mymotiv.png")})`, WebkitMaskSize: "100% 100%", background: `linear-gradient(100deg, rgba(255,255,255,0) ${lerp(-40, 110, seg(t, s, s + 0.6))}%, rgba(255,255,255,0.95) ${lerp(-25, 125, seg(t, s, s + 0.6))}%, rgba(255,255,255,0) ${lerp(-10, 140, seg(t, s, s + 0.6))}%)` }} />
        ))}
      </div>

      {/* ═════ Yann Motiveur, le présentateur ═════ */}
      <div style={{ position: "absolute", left: 690, top: 1920 - 600, width: 404, zIndex: 45, transformOrigin: "50% 100%", transform: `translateY(${(1 - go(t, 0.1, 0.5, 0, 1)) * 600 - (speaking ? Math.abs(Math.sin(t * 11)) * 8 : 0) - chEnv * 25}px) scale(${1 + 0.08 * pulse(t, ys + 0.08, 0.08)}) rotate(${Math.sin(t * 1.6) * 2}deg)` }}>
        <Img src={staticFile(`mascotte/${yimg}.png`)} style={{ width: 404, display: "block" }} />
      </div>

      <Audio src={staticFile("audio/qi.wav")} />
    </AbsoluteFill>
  );
};
