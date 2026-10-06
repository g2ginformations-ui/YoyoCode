// « Recherche » (44 s, 60 i/s, 9:16) — motion design premium sur la voix de l'utilisateur, traitée façon narrateur grave
// (tools/voix-narrateur.py → public/audio/recherche-voix.wav, temps dans src/data/recherche-voix.json).
// Fond sombre uni et propre (ADN MyMotiv), un seul accent rose, une idée par plan. Skill apple-motion (parties 1 et 2).
// 0. Une page internet : le curseur clique dans la barre, la caméra zoome, on tape tinyurl.com/try-mymotiv… puis retour
//    en arrière (« Avant ») → 1. 3 lettres, 3 heures, seul devant l'écran → 2. le chatbot : 20 min*, générique, sans logo
//    → 3. « Respire » : cercle qui respire → 4. retour à la barre, Entrée, flash, MyMotiv, 5 clics → 5. les 5 cartes
//    cliquées une à une → 6. anneau 30 s* → 7. la lettre, le logo se pose → 8. Plus court / Plus long → 9. 1re lettre
//    offerte → 10. les prix ramenés à des choses du quotidien → 11. lien en bio → 12. Postule. Respire. → fin + « enregistre ».
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, bounce, curve, go, press } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import { Confetti, Pointer, Ripple } from "./Lien";
import { AppIcon, Bubbles, DARK, Flash, GlossPill, Horizon, Shockwave, Spinner, ease, pulse } from "./motion";
import voix from "./data/recherche-voix.json";
import "./fonts";

export const RECHERCHE_DUR = voix.duration;
const CX = 540;
const BG = "radial-gradient(circle at 50% 42%, #19181B 0%, #0E0D0F 58%, #09090A 100%)";
// Temps clés, au mot près dans la voix finale (s)
export const V = {
  click: 0.55, type: 1.0, rewind: 2.25, lettres: 3.02, heures: 4.48, seul: 5.26, ecran: 5.8,
  meme: 7.76, min20: 9.62, generique: 11.3, sansLogo: 11.94, respire: 14.32, back: 15.7, avec: 16.46, flash: 16.62,
  clics: 17.34, cv: 18.92, lien: 19.5, longueur: 20.3, options: 20.95, generer: 21.9, s30: 23.64, ecrite: 24.4,
  logo: 26.4, detail: 28.58, court: 29.94, long: 30.66, unClic: 31.38, offerte: 32.72, offerteMot: 33.64,
  prix: 34.05, bio: 37.96, postule: 39.74, respire2: 40.66, end: 41.15, save: 42.5,
};
const LINK = "tinyurl.com/try-mymotiv";
// Fenêtre du navigateur (générique) et sa barre d'adresse
const WX = 80, WY = 370, WW = 920, WH = 1180, BAR_Y = WY + 84 + 42; // centre vertical de la barre
const PRICES = [
  { n: "1 lettre", p: "0,99 €", per: "la lettre", cmp: "Moins qu'un café", e: "☕" },
  { n: "Semaine", p: "1,99 €", per: "la semaine, illimité*", cmp: "Le prix d'une canette", e: "🥤" },
  { n: "Mois", p: "7,99 €", per: "le mois, illimité*", cmp: "Moins qu'une pizza", e: "🍕" },
  { n: "À vie", p: "12,99 €", per: "une seule fois, illimité*", cmp: "≈ un menu au fast-food. Pour toujours.", e: "🍔", best: true },
];
const STEPS = [
  { ic: "📄", l: "Ton CV", t: V.cv }, { ic: "🔗", l: "Le lien de l'offre", t: V.lien }, { ic: "↔", l: "La longueur", t: V.longueur },
  { ic: "✎", l: "Tes options", t: V.options }, { ic: "✦", l: "Générer", t: V.generer, pink: true },
];

// ── curseur : [temps du clic, x, y, appui long] ──
const CLICKS: [number, number, number][] = [[V.click, 330, BAR_Y], [V.avec, 985, 900], [V.cv, 820, 590], [V.lien, 820, 760], [V.longueur, 820, 930],
  [V.options, 820, 1100], [V.generer, 820, 1270], [V.court, 330, 1530], [V.long, 750, 1530], [V.save, 282, 1257]];
const SHOW: [number, number][] = [[0.05, 1.5], [15.85, 16.85], [18.2, 22.25], [29.3, 31.2], [41.9, 43.2]];
function pointer(t: number) {
  let i = CLICKS.findIndex(([ct]) => ct > t); if (i === -1) i = CLICKS.length;
  const prev = i > 0 ? CLICKS[i - 1] : [0, 1000, 1700] as [number, number, number], nxt = CLICKS[Math.min(CLICKS.length - 1, i)];
  const mv = ease(t, Math.max(prev[0] + 0.12, nxt[0] - 0.5), nxt[0] - 0.06);
  const [x, y] = i >= CLICKS.length ? [prev[1], prev[2]] : curve(mv, [prev[1], prev[2]], [nxt[1], nxt[2]], [(prev[1] + nxt[1]) / 2 + 140, Math.min(prev[2], nxt[2]) - 90]);
  let pr = 0, hv = 0;
  for (const [ct] of CLICKS) { pr = Math.max(pr, pulse(t, ct, 0.08)); hv = Math.max(hv, seg(t, ct - 0.3, ct - 0.12) * (1 - seg(t, ct + 0.15, ct + 0.35))); }
  let o = 0; for (const [a, b] of SHOW) o = Math.max(o, seg(t, a, a + 0.15) * (1 - seg(t, b - 0.15, b)));
  return { x, y, pr, hv, o };
}

const T: React.FC<{ t: number; t0: number; out: number; a: string; b?: string; bt?: number; y?: number; size?: number; grey?: boolean }> = ({ t, t0, out, a, b, bt, y = 170, size = 72, grey }) =>
  t < t0 - 0.05 || t > out + 0.25 ? null : (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, textAlign: "center", fontSize: size, fontWeight: 800, lineHeight: 1.12, letterSpacing: -1.5, zIndex: 20 }}>
      <TextDrop t={t} t0={t0} text={a} out={out} />
      {b && <><br /><span style={{ color: grey ? DARK.soft : PINK }}><TextDrop t={t} t0={bt ?? t0 + 0.35} text={b} by="chars" from={[0, 26]} stagger={0.024} dur={0.18} out={out} /></span></>}
    </div>
  );

// Version courte : temps de sortie → temps de la version longue, passage par passage ([début, fin, vitesse]).
export type Seg = [number, number, number];
export const segsDuration = (segs: Seg[]) => segs.reduce((acc, [a, b, v]) => acc + (b - a) / v, 0);
function warpTime(tOut: number, segs?: Seg[]) {
  if (!segs) return tOut;
  let acc = 0;
  for (const [a, b, v] of segs) { const d = (b - a) / v; if (tOut < acc + d) return a + (tOut - acc) * v; acc += d; }
  return segs[segs.length - 1][1];
}

export const Recherche: React.FC<{ audio?: string; segs?: Seg[] }> = ({ audio = "audio/recherche.wav", segs }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = warpTime(frame / fps, segs);

  // ═════ caméra du navigateur ═════
  const zoomIn = ease(t, V.click + 0.05, V.click + 0.5) * (1 - ease(t, V.rewind, V.rewind + 0.45)) + ease(t, V.back, V.back + 0.45) * (1 - seg(t, V.flash - 0.05, V.flash));
  const painScale = lerp(1, 0.84, ease(t, V.rewind + 0.1, V.rewind + 0.6)) * lerp(1, 1.06, ease(t, V.ecran - 0.2, V.meme - 0.4)) * lerp(1, 1 / (0.84 * 1.06), ease(t, V.back - 0.1, V.back + 0.3));
  const painY = lerp(0, 90, ease(t, V.rewind + 0.1, V.rewind + 0.6)) * (1 - ease(t, V.back - 0.1, V.back + 0.3));
  const shake = t > V.sansLogo && t < V.sansLogo + 0.9 ? Math.sin(t * 46) * 5 * (1 - seg(t, V.sansLogo + 0.4, V.sansLogo + 0.9)) : 0;
  const breathOut = ease(t, 13.1, 13.7) * (1 - ease(t, V.back - 0.2, V.back + 0.3));
  const bBlur = breathOut * 26 + lerp(10, 0, ease(t, 0, 0.45)) + (t > V.rewind && t < V.rewind + 0.5 ? 10 * Math.sin(Math.PI * seg(t, V.rewind, V.rewind + 0.5)) : 0);
  const rewindK = Math.sin(Math.PI * seg(t, V.rewind, V.rewind + 0.55));
  const bOpacity = seg(t, 0, 0.25) * (1 - 0.85 * breathOut) * (1 - seg(t, V.flash - 0.02, V.flash + 0.08));
  const camTilt = lerp(14, 4, ease(t, 0, 0.6)) + Math.sin(t * 0.7) * 1.5;
  const sat = t > V.rewind && t < V.back ? lerp(1, 0.55, ease(t, V.rewind, V.rewind + 0.5)) : 1;
  const typed = Math.round(LINK.length * seg(t, V.type, V.type + 0.95));
  const content = t < V.rewind + 0.3 ? "start" : t < V.meme - 0.25 ? "docs" : t < V.back ? "chat" : "start";
  const ck = (a: number) => ease(t, a, a + 0.3);

  // ═════ cercle « Respire » ═════
  const breath = t > 13.4 && t < V.back + 0.3;
  const br = bounce(t, [[13.55, 0], [13.95, 230]]) * (1 + 0.13 * Math.sin((t - 13.95) * 2.2)) * (1 - ease(t, V.back - 0.1, V.back + 0.3));

  // ═════ étapes ═════
  const stepIdx = STEPS.reduce((acc, s, i) => (t >= s.t ? i : acc), -1);
  const stepsIn = t > 17.95 && t < 22.75;
  const stepsCam = lerp(0, -40 * Math.max(0, stepIdx), ease(t, 18.0, 18.3));
  const collapse = ease(t, V.generer + 0.25, V.generer + 0.7);

  // ═════ anneau 30 s → lettre ═════
  const ringK = seg(t, 22.95, 24.25);
  const letterIn = t > V.ecrite - 0.1;
  const lh = bounce(t, [[V.ecrite - 0.1, 420], [V.ecrite + 0.3, 880], [V.court, 880], [V.court + 0.32, 700], [V.long, 700], [V.long + 0.32, 1000], [V.unClic, 1000], [V.unClic + 0.32, 880]]);
  const lw = bounce(t, [[V.ecrite - 0.1, 420], [V.ecrite + 0.3, 680]]);
  const lr = bounce(t, [[V.ecrite - 0.1, 210], [V.ecrite + 0.3, 40]]);
  const letterOut = ease(t, V.offerte - 0.15, V.offerte + 0.2);
  const lk = ease(t, V.logo - 0.45, V.logo);
  const [lx, ly] = curve(lk, [1200, 180], [CX - 340 + 30 + 52, 960 - lh / 2 + 30 + 52], [980, 260]);

  // ═════ prix ═════
  const pIdx = Math.min(3, Math.floor(Math.max(0, t - 34.3) / 0.85));
  const flashK = pulse(t, V.flash) * 1.15 + pulse(t, V.rewind + 0.27, 0.1) * 0.25;
  const ptr = pointer(t);

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: "Poppins", color: DARK.ink, overflow: "hidden" }}>
      {/* ═════ navigateur ═════ */}
      {bOpacity > 0.01 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
          <div style={{ position: "absolute", inset: 0, opacity: bOpacity, filter: `blur(${bBlur}px) saturate(${sat})`, transformOrigin: `${CX}px ${BAR_Y}px`,
            transform: `translateY(${(900 - BAR_Y) * zoomIn + painY}px) translateX(${shake + rewindK * -60}px) rotateX(${camTilt * (1 - zoomIn * 0.6)}deg) rotateY(${rewindK * 10}deg) scale(${(1 + 0.22 * zoomIn) * painScale})` }}>
            <div style={{ position: "absolute", left: WX, top: WY, width: WW, height: WH, borderRadius: 38, background: "#141416", boxShadow: "0 60px 140px rgba(0,0,0,0.7), 0 0 0 1.5px rgba(255,255,255,0.08)", overflow: "hidden" }}>
              {/* barre de titre */}
              <div style={{ position: "absolute", left: 30, top: 26, display: "flex", gap: 12 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: "#3A3A3E" }} />)}</div>
              <div style={{ position: "absolute", left: 130, top: 16, height: 40, padding: "0 22px", borderRadius: 12, background: "#222225", display: "flex", alignItems: "center", fontSize: 22, fontWeight: 600, color: DARK.soft }}>{content === "docs" ? "Lettre_FINALE_v3.docx" : content === "chat" ? "Chatbot IA" : "Nouvel onglet"}</div>
              {content === "docs" && (
                <div style={{ position: "absolute", right: 30, top: 16, height: 40, width: 120, borderRadius: 12, background: "#222225", overflow: "hidden", fontSize: 24, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontVariantNumeric: "tabular-nums" }}>
                  {(() => { const h = 14 + Math.min(3, Math.floor(seg(t, V.heures - 0.1, V.heures + 0.7) * 3.999)); const h0 = V.heures - 0.1 + (h - 14) * 0.2; return <span key={h} style={{ display: "inline-block", transform: `translateY(${go(t, h0, h0 + 0.18, -40, 0)}px)`, color: h === 17 ? PINK : DARK.ink }}>{h}:00</span>; })()}
                </div>
              )}
              {/* barre d'adresse */}
              <div style={{ position: "absolute", left: 40, top: 84, width: WW - 80, height: 84, borderRadius: 42, background: "#232326", boxShadow: zoomIn > 0.5 ? `0 0 0 ${3 * zoomIn}px ${PINK_L}, 0 0 ${50 * zoomIn}px rgba(217,130,139,0.45)` : "none", display: "flex", alignItems: "center", padding: "0 30px", gap: 16, fontSize: 32, fontWeight: 600 }}>
                <span style={{ fontSize: 28, opacity: 0.7 }}>🔍</span>
                {t < V.click + 0.05 ? <span style={{ color: DARK.soft }}>Rechercher ou saisir une adresse</span> : (
                  <span style={{ whiteSpace: "nowrap" }}>{content === "start" ? LINK.slice(0, typed) : content === "docs" ? "drive.exemple.fr/lettre-v3" : "chatbot.exemple.fr"}{t < V.type + 1.0 && Math.floor(t * 3) % 2 === 0 && <span style={{ color: PINK }}>|</span>}</span>
                )}
                {content === "start" && t > V.type + 0.95 && (
                  <div style={{ marginLeft: "auto", width: 60, height: 60, borderRadius: 30, background: PINK, color: "#fff", fontSize: 32, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${go(t, V.type + 0.95, V.type + 1.25, 0, 1) * press(t, V.avec)})`, boxShadow: `0 0 ${30 + 50 * pulse(t, V.avec, 0.12)}px rgba(217,130,139,0.7)` }}>↵</div>
                )}
                {t > V.avec && t < V.flash + 0.1 && <div style={{ position: "absolute", left: 0, bottom: 0, height: 6, borderRadius: 3, width: `${100 * ease(t, V.avec, V.flash)}%`, background: PINK }} />}
              </div>
              {/* page */}
              <div style={{ position: "absolute", left: 40, right: 40, top: 200, bottom: 40 }}>
                {content === "start" && (
                  <>
                    <div style={{ fontSize: 28, fontWeight: 700, color: DARK.soft }}>Favoris</div>
                    <div style={{ display: "flex", gap: 26, marginTop: 22 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ width: 180, height: 180, borderRadius: 36, background: "#1E1E21", boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.05)" }} />)}</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: DARK.soft, marginTop: 50 }}>Récents</div>
                    {[0, 1, 2].map((i) => <div key={i} style={{ marginTop: 22, height: 110, borderRadius: 26, background: "#1B1B1E" }} />)}
                  </>
                )}
                {content === "docs" && (
                  <>
                    <div style={{ display: "flex", gap: 14 }}>
                      {["Lettre_v1.docx", "Lettre_v2.docx", "Lettre_FINALE_v3"].map((n, i) => { const k = go(t, V.lettres + 0.1 + i * 0.22, V.lettres + 0.45 + i * 0.22, 0, 1); return <div key={n} style={{ padding: "16px 20px", borderRadius: 18, background: i === 2 ? "#2A2124" : "#202023", fontSize: 22, fontWeight: 600, color: i === 2 ? PINK_L : DARK.soft, transform: `scale(${k}) translateY(${(1 - k) * 30}px)`, opacity: clamp(k * 2), whiteSpace: "nowrap" }}>📄 {n}</div>; })}
                    </div>
                    <div style={{ marginTop: 30, height: 760, borderRadius: 26, background: "#1B1B1E", padding: 50, boxShadow: "inset 0 0 0 1.5px rgba(255,255,255,0.05)" }}>
                      {[78, 90, 84, 60, 88, 72].map((w, i) => {
                        const cyc = (t * 0.9 + i * 0.37) % 2, grow = cyc < 1 ? cyc : 2 - cyc;
                        return <div key={i} style={{ marginTop: i ? 34 : 0, height: 18, borderRadius: 9, background: "#2C2C30", width: `${w * (i < 3 ? 1 : 0.25 + 0.75 * grow)}%` }} />;
                      })}
                      <div style={{ marginTop: 34, width: 4, height: 40, background: PINK, opacity: Math.floor(t * 2.4) % 2 }} />
                    </div>
                  </>
                )}
                {content === "chat" && (
                  <>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <div style={{ maxWidth: 600, padding: "24px 30px", borderRadius: 30, background: "#2A2A2E", fontSize: 30, fontWeight: 600, opacity: ck(V.meme - 0.2) }}>
                        <TextDrop t={t} t0={V.meme} text="Écris-moi une lettre de motivation…" by="chars" from={[0, 14]} stagger={0.02} dur={0.12} />
                      </div>
                    </div>
                    <div style={{ marginTop: 40, display: "flex", gap: 20 }}>
                      <div style={{ width: 64, height: 64, borderRadius: 32, background: "#2A2A2E", flex: "none" }} />
                      <div style={{ flex: 1 }}>
                        {[92, 88, 95, 70, 90, 84, 66, 93, 58].map((w, i) => { const a = 8.75 + i * 0.22; return <div key={i} style={{ marginTop: i ? 26 : 8, height: 18, borderRadius: 9, width: `${w}%`, background: t > V.generique && t < V.generique + 0.6 ? mixGrey(seg(t, V.generique, V.generique + 0.2) * (1 - seg(t, V.generique + 0.4, V.generique + 0.6))) : "#2C2C30", transform: `scaleX(${go(t, a, a + 0.3, 0, 1)})`, transformOrigin: "0 50%" }} />; })}
                      </div>
                    </div>
                    <div style={{ position: "absolute", left: 0, bottom: 20, width: 130, height: 130, borderRadius: 28, border: `4px dashed ${t > V.sansLogo ? PINK : "#3A3A3E"}`, opacity: ck(V.sansLogo - 0.1), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: DARK.soft, fontWeight: 700 }}>logo ?</div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* pastilles du chatbot (premier plan) */}
      {t > V.min20 - 0.1 && t < 13.3 && ([["⏱ 20 min*", V.min20, 690, 640], ["Générique", V.generique, 260, 1010], ["Sans logo", V.sansLogo, 720, 1290]] as const).map(([l, a, x, y]) => {
        const k = bounce(t, [[a, 0], [a + 0.32, 1]]);
        return <div key={l} style={{ position: "absolute", left: x - 170, top: y, width: 340, height: 104, borderRadius: 52, background: "#F5F5F7", color: "#1D1D1F", fontSize: 40, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k * (1 - ease(t, 13.0, 13.3))}) rotate(${(x > 500 ? 1 : -1) * 4}deg)`, boxShadow: "0 30px 70px rgba(0,0,0,0.55)", zIndex: 15 }}>{l}</div>;
      })}
      {t > V.min20 && t < 13.3 && <div style={{ position: "absolute", left: 50, right: 50, top: 1640, textAlign: "center", fontSize: 25, color: DARK.soft, fontFamily: "Open Sans", opacity: seg(t, V.min20, V.min20 + 0.3) * (1 - seg(t, 13.0, 13.3)) }}>* estimation : 20 à 40 min par lettre personnalisée avec un chatbot IA</div>}

      {/* « Avant » (retour en arrière) */}
      {t > V.rewind && t < V.lettres && <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontSize: 120, fontWeight: 800, letterSpacing: -3, opacity: Math.sin(Math.PI * seg(t, V.rewind + 0.05, V.lettres)), transform: `scale(${lerp(1.15, 1, ease(t, V.rewind, V.rewind + 0.4))})`, zIndex: 21, textShadow: "0 10px 60px rgba(0,0,0,0.8)" }}>↺ <span style={{ color: PINK }}>Avant</span>…</div>}

      {/* titres du récit */}
      <T t={t} t0={V.lettres + 0.02} out={V.meme - 0.3} a="3 lettres. 3 heures." b="Toujours seul." bt={V.seul} grey />
      <T t={t} t0={V.meme + 0.05} out={13.05} a="Même avec un chatbot IA…" b="20 min par lettre*" bt={V.min20 + 0.05} />

      {/* « Respire » */}
      {breath && (
        <>
          <div style={{ position: "absolute", left: CX - br, top: 880 - br, width: br * 2, height: br * 2, borderRadius: "50%", background: `radial-gradient(circle at 40% 35%, ${PINK_L}, ${PINK} 60%, #B9606B)`, boxShadow: `0 0 ${br * 0.8}px rgba(217,130,139,0.55)`, opacity: 0.95 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontSize: 110, fontWeight: 800, letterSpacing: -2 }}>
            <TextDrop t={t} t0={V.respire} text="Respire." by="chars" from={[0, -30]} stagger={0.07} dur={0.35} out={V.back - 0.2} />
          </div>
        </>
      )}

      {/* ═════ MyMotiv : logo + 5 clics ═════ */}
      {t > V.flash - 0.02 && t < 18.1 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, 17.85, 18.1) }}>
          <div style={{ position: "absolute", left: CX - 90, top: 610, transform: `scale(${bounce(t, [[V.flash + 0.05, 0], [V.flash + 0.4, 1]])})` }}><AppIcon size={180} /></div>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: CX - 330, top: 860, width: 660, clipPath: `inset(0 ${100 - 100 * ease(t, V.flash + 0.25, V.flash + 0.7)}% 0 0)` }} />
          <div style={{ position: "absolute", left: CX - 230, top: 1110, width: 460, height: 140, borderRadius: 70, background: PINK, color: "#fff", fontSize: 66, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${bounce(t, [[V.clics - 0.05, 0], [V.clics + 0.3, 1]])})`, boxShadow: "0 0 70px rgba(217,130,139,0.55)" }}>
            <TextDrop t={t} t0={V.clics} text="5 clics." by="chars" from={[0, 30]} stagger={0.04} dur={0.18} />
          </div>
        </div>
      )}
      <Shockwave t={t} t0={V.flash} y={760} />

      {/* ═════ les 5 étapes ═════ */}
      {stepsIn && (
        <div style={{ position: "absolute", inset: 0, perspective: 1500 }}>
          <div style={{ position: "absolute", left: 40, right: 40, top: 200, display: "flex", justifyContent: "center", gap: 18, opacity: ease(t, 18.0, 18.3) * (1 - collapse) }}>
            {STEPS.map((s, i) => <div key={i} style={{ width: 56, height: 56, borderRadius: 28, background: t >= s.t ? PINK : "#232326", color: "#fff", fontWeight: 800, fontSize: 26, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${t >= s.t ? bounce(t, [[s.t, 1.35], [s.t + 0.3, 1]]) : 1})`, boxShadow: t >= s.t ? "0 0 24px rgba(217,130,139,0.6)" : "none" }}>{t >= s.t ? "✓" : i + 1}</div>)}
          </div>
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${stepsCam}px) rotateX(${6 + Math.sin(t) * 1.5}deg)`, transformOrigin: "540px 900px" }}>
            {STEPS.map((s, i) => {
              const k = bounce(t, [[18.0 + i * 0.07, 0], [18.35 + i * 0.07, 1]]), on = t >= s.t, act = on && t < s.t + 0.6;
              const y = 520 + i * 170, cy = lerp(y, 960 - 70, collapse);
              return (
                <div key={i} style={{ position: "absolute", left: CX - 420, top: cy, width: 840, height: 140, borderRadius: 70, background: s.pink ? PINK : on ? "#2A2124" : "#1C1C1F", boxShadow: on ? `0 0 0 2px ${PINK_L}, 0 0 ${act ? 70 : 30}px rgba(217,130,139,${act ? 0.55 : 0.25})` : "0 0 0 1.5px rgba(255,255,255,0.07)", display: "flex", alignItems: "center", gap: 26, padding: "0 40px", transform: `scale(${k * press(t, s.t) * (act ? 1.04 : 1) * lerp(1, 0.3, collapse)})`, opacity: clamp(k * 2) * (s.pink || on || t < 18.4 ? 1 : 0.55) * (1 - seg(t, V.generer + 0.55, V.generer + 0.75)), color: "#fff" }}>
                  <div style={{ width: 70, height: 70, borderRadius: 35, background: s.pink ? "rgba(255,255,255,0.22)" : "#2C2C30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flex: "none" }}>{s.ic}</div>
                  <div style={{ fontSize: 46, fontWeight: 700, flex: 1 }}>{s.l}</div>
                  {i === 2 && <div style={{ display: "flex", gap: 8, fontSize: 24, fontWeight: 700 }}>{["Court", "Standard", "Long"].map((x, j) => <span key={x} style={{ padding: "8px 14px", borderRadius: 999, background: j === 1 && on ? PINK : "#2C2C30" }}>{x}</span>)}</div>}
                  {!s.pink && i !== 2 && <div style={{ width: 56, height: 56, borderRadius: 28, background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 800, transform: `scale(${on ? bounce(t, [[s.t, 0], [s.t + 0.3, 1]]) : 0})` }}>✓</div>}
                </div>
              );
            })}
          </div>
          <Ripple x={820} y={1270 + stepsCam} t={t} t0={V.generer} />
        </div>
      )}

      {/* ═════ anneau 30 s ═════ */}
      {t > 22.5 && t < V.ecrite + 0.15 && (
        <div style={{ position: "absolute", left: CX - 260, top: 960 - 260, width: 520, height: 520, transform: `scale(${bounce(t, [[22.55, 0.3], [22.95, 1]])})`, opacity: 1 - seg(t, V.ecrite - 0.05, V.ecrite + 0.15) }}>
          <svg width={520} height={520} viewBox="0 0 520 520" style={{ position: "absolute", inset: 0 }}>
            <circle cx={260} cy={260} r={225} fill="none" stroke="#1E1E21" strokeWidth={38} />
            <circle cx={260} cy={260} r={225} fill="none" stroke={PINK} strokeWidth={38} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 225 * ringK} ${2 * Math.PI * 225}`} transform="rotate(-90 260 260)" style={{ filter: "drop-shadow(0 0 18px rgba(217,130,139,0.75))" }} />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontSize: 170, fontWeight: 800, letterSpacing: -5, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{Math.round(30 * ringK)}<span style={{ fontSize: 76, color: DARK.soft }}> s*</span></div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 12, fontSize: 32, color: DARK.soft, fontWeight: 600 }}>{ringK < 1 ? <><Spinner t={t} size={34} /> ta lettre s'écrit</> : <span style={{ color: PINK_L }}>prête ✓</span>}</div>
          </div>
        </div>
      )}
      <T t={t} t0={V.s30} out={V.ecrite - 0.1} a="En 30 secondes*" size={78} />
      {t > V.s30 && t < 32.6 && <div style={{ position: "absolute", left: 0, right: 0, top: 1650, textAlign: "center", fontSize: 25, color: DARK.soft, fontFamily: "Open Sans", opacity: seg(t, V.s30, V.s30 + 0.3) * (1 - seg(t, 32.3, 32.6)) }}>* temps mesuré : 27 à 35 s par lettre</div>}

      {/* ═════ la lettre ═════ */}
      {letterIn && t < V.offerte + 0.25 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
          <div style={{ position: "absolute", left: CX - lw / 2, top: 960 - lh / 2 - letterOut * 900, width: lw, height: lh, borderRadius: lr, background: "#FFFFFF", color: "#1D1D1F", overflow: "hidden", boxShadow: "0 50px 120px rgba(0,0,0,0.6), 0 0 80px rgba(217,130,139,0.18)", transform: `rotateX(${4 + Math.sin(t * 0.8) * 2}deg) rotateY(${Math.sin(t * 0.6) * 3}deg) scale(${1 - letterOut * 0.3})`, opacity: 1 - letterOut }}>
            <div style={{ position: "absolute", left: 30, top: 30, width: 104, height: 104, borderRadius: 24, border: "3px dashed #D2D2D7", opacity: 1 - seg(t, V.logo - 0.05, V.logo + 0.1) }} />
            {t >= V.logo && <Img src={staticFile("company.png")} style={{ position: "absolute", left: 30, top: 30, width: 104, height: 104, borderRadius: 24, boxShadow: `0 0 ${50 * pulse(t, V.logo + 0.15, 0.3)}px ${PINK}` }} />}
            <div style={{ position: "absolute", left: 158, top: 42, fontSize: 36, fontWeight: 800, opacity: ck(V.ecrite + 0.15) }}>Maison Lumen</div>
            <div style={{ position: "absolute", left: 158, top: 88, fontSize: 25, fontWeight: 600, color: "#86868B", opacity: ck(V.ecrite + 0.2) }}>Manager des ventes · Lyon</div>
            {[92, 86, 95, 70, 0, 90, 84, 93, 62, 0, 88, 79, 92, 45].map((w, i) => (
              <div key={i} style={{ position: "absolute", left: 44, top: 180 + i * 46, height: w ? 16 : 0, borderRadius: 8, width: `${w * 0.86}%`, background: i === 0 ? "#F2C9CE" : "#E3E3E8", transform: `scaleX(${go(t, V.ecrite + 0.25 + i * 0.06, V.ecrite + 0.55 + i * 0.06, 0, 1)})`, transformOrigin: "0 50%" }} />
            ))}
          </div>
          {t > V.logo - 0.5 && t < V.logo && <Img src={staticFile("company.png")} style={{ position: "absolute", left: lx - 52, top: ly - 52, width: 104, height: 104, borderRadius: 24, transform: `scale(${lerp(1.8, 1, lk)})`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }} />}
        </div>
      )}
      <T t={t} t0={V.ecrite + 0.05} out={V.detail - 0.25} a="Écrite pour CETTE offre." b="Avec son logo." bt={V.logo - 0.25} size={66} />
      <T t={t} t0={V.detail} out={V.offerte - 0.2} a="Un détail à changer ?" b="1 clic." bt={V.unClic} size={70} />
      {t > V.detail + 0.1 && t < V.offerte && ([["Plus court", 330, V.court], ["Plus long", 750, V.long]] as const).map(([l, x, a]) => {
        const k = bounce(t, [[V.detail + 0.15, 0], [V.detail + 0.5, 1]]), hot = seg(t, a - 0.05, a + 0.05) * (1 - seg(t, a + 0.45, a + 0.65));
        return <div key={l} style={{ position: "absolute", left: x - 180, top: 1480, width: 360, height: 110, borderRadius: 55, background: hot > 0.5 ? PINK : "#232326", color: "#fff", fontSize: 40, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k * press(t, a) * (1 - ease(t, V.offerte - 0.25, V.offerte))})`, boxShadow: hot > 0.5 ? "0 0 50px rgba(217,130,139,0.6)" : "0 0 0 1.5px rgba(255,255,255,0.08)", zIndex: 12 }}>{l}</div>;
      })}

      {/* ═════ offerte ═════ */}
      {t > V.offerte - 0.05 && t < V.prix + 0.2 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, V.prix - 0.1, V.prix + 0.2) }}>
          <Confetti t={t} t0={V.offerteMot} />
          <div style={{ position: "absolute", left: CX - 120, top: 640, fontSize: 200, transform: `scale(${bounce(t, [[V.offerte, 0], [V.offerte + 0.4, 1]])}) rotate(${Math.sin(t * 6) * 4}deg)` }}>🎁</div>
          <div style={{ position: "absolute", left: CX - 440, top: 960, width: 880, height: 180, borderRadius: 90, background: PINK, color: "#fff", fontSize: 62, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${bounce(t, [[V.offerte + 0.15, 0], [V.offerte + 0.5, 1]])})`, boxShadow: "0 0 90px rgba(217,130,139,0.6)" }}>
            <TextDrop t={t} t0={V.offerte + 0.2} text="Ta 1re lettre : offerte" by="chars" from={[0, 30]} stagger={0.03} dur={0.16} />
          </div>
        </div>
      )}

      {/* ═════ prix ramenés au quotidien ═════ */}
      {t > V.prix - 0.05 && t < V.bio && (
        <div style={{ position: "absolute", inset: 0, perspective: 1400, opacity: 1 - seg(t, V.bio - 0.25, V.bio) }}>
          <T t={t} t0={V.prix} out={V.bio - 0.3} a="Et ensuite ?" size={64} y={200} />
          {PRICES.map((p, i) => {
            const a = 34.3 + i * 0.85, kin = ease(t, a, a + 0.3), kout = i < 3 ? ease(t, a + 0.85, a + 1.12) : 0;
            if (t < a - 0.02 || kout >= 1) return null;
            return (
              <div key={p.n} style={{ position: "absolute", left: CX - 400, top: 470, width: 800, height: 900, borderRadius: 56, background: p.best ? `linear-gradient(160deg, ${PINK_L}, ${PINK} 55%, #B9606B)` : "#18181B", color: "#fff", boxShadow: p.best ? "0 0 100px rgba(217,130,139,0.55), 0 50px 120px rgba(0,0,0,0.6)" : "0 0 0 1.5px rgba(255,255,255,0.08), 0 50px 120px rgba(0,0,0,0.6)", textAlign: "center", transform: `translateX(${(1 - kin) * 700 - kout * 700}px) rotateY(${(1 - kin) * -35 + kout * 35}deg) scale(${lerp(0.85, 1, kin)})`, filter: `blur(${(1 - kin) * 10 + kout * 10}px)`, opacity: clamp(kin * 2) * (1 - kout) }}>
                {p.best && <div style={{ position: "absolute", left: 0, right: 0, top: -34, display: "flex", justifyContent: "center" }}><div style={{ padding: "14px 34px", borderRadius: 999, background: "#fff", color: PINK, fontSize: 30, fontWeight: 800 }}>Le plus avantageux</div></div>}
                <div style={{ marginTop: 80, fontSize: 44, fontWeight: 700, color: p.best ? "#fff" : DARK.soft }}>{p.n}</div>
                <div style={{ marginTop: 10, fontSize: 170, fontWeight: 800, letterSpacing: -6, lineHeight: 1.05, color: p.best ? "#fff" : PINK_L }}><TextDrop t={t} t0={a + 0.12} text={p.p} by="chars" from={[0, 60]} stagger={0.035} dur={0.18} /></div>
                <div style={{ fontSize: 34, fontWeight: 600, color: p.best ? "#FFE9EC" : DARK.soft }}>{p.per}</div>
                <div style={{ marginTop: 70, fontSize: 130, transform: `scale(${bounce(t, [[a + 0.25, 0], [a + 0.55, 1]])}) rotate(${Math.sin(t * 5 + i) * 5}deg)` }}>{p.e}</div>
                <div style={{ marginTop: 30, padding: "0 50px", fontSize: 48, fontWeight: 800, lineHeight: 1.15 }}>{p.cmp}</div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 40, top: 318, padding: "14px 26px", borderRadius: 999, background: "rgba(245,245,247,0.95)", color: "#1D1D1F", fontSize: 30, fontWeight: 800, transform: `scale(${bounce(t, [[34.9, 0], [35.25, 1]])}) rotate(${-4 + Math.sin(t * 4) * 2}deg)`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", zIndex: 5 }}>📌 Enregistre-la pour plus tard</div>
          <div style={{ position: "absolute", left: 50, right: 50, top: 1420, textAlign: "center", fontSize: 25, color: DARK.soft, fontFamily: "Open Sans", lineHeight: 1.5 }}>* illimité = 30 lettres par semaine au maximum<br />Comparaisons données à titre indicatif</div>
        </div>
      )}

      {/* ═════ lien en bio ═════ */}
      {t > V.bio - 0.05 && t < V.postule && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, V.postule - 0.2, V.postule) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 560 - Math.abs(Math.sin((t - V.bio) * 5)) * 40, textAlign: "center", fontSize: 150, color: PINK, fontWeight: 800 }}>↑</div>
          <div style={{ position: "absolute", left: CX - 380, top: 800, width: 760, height: 170, borderRadius: 85, background: PINK, color: "#fff", fontSize: 76, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${bounce(t, [[V.bio, 0], [V.bio + 0.35, 1]])})`, boxShadow: "0 0 90px rgba(217,130,139,0.6)" }}>Lien en bio</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1020, textAlign: "center", fontSize: 44, fontWeight: 700, color: DARK.soft }}><TextDrop t={t} t0={V.bio + 0.3} text={LINK} by="chars" from={[0, 20]} stagger={0.02} dur={0.12} /></div>
        </div>
      )}

      {/* ═════ Postule. Respire. ═════ */}
      {t > V.postule - 0.05 && t < V.end + 0.2 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 720, textAlign: "center", fontSize: 150, fontWeight: 800, lineHeight: 1.05, letterSpacing: -4, opacity: 1 - seg(t, V.end - 0.1, V.end + 0.2) }}>
          <TextDrop t={t} t0={V.postule} text="Postule." by="chars" from={[0, -50]} stagger={0.05} dur={0.25} /><br />
          <span style={{ color: PINK }}><TextDrop t={t} t0={V.respire2} text="Respire." by="chars" from={[0, -50]} stagger={0.05} dur={0.25} /></span>
        </div>
      )}

      {/* ═════ fin ═════ */}
      {t > V.end - 0.05 && (
        <div style={{ position: "absolute", inset: 0, opacity: ease(t, V.end, V.end + 0.4) }}>
          <Bubbles t={t} t0={V.end} />
          <Horizon k={ease(t, V.end + 0.1, V.end + 0.6)} y={1005} />
          <div style={{ position: "absolute", left: CX - 60, top: 570, transform: `scale(${bounce(t, [[V.end + 0.15, 0], [V.end + 0.5, 1]])})` }}><AppIcon size={120} /></div>
          <div style={{ position: "absolute", left: CX - 330, top: 760 }}><GlossPill scale={bounce(t, [[V.end, 0.6], [V.end + 0.35, 1]])}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 430, opacity: seg(t, V.end + 0.15, V.end + 0.35) }} /></GlossPill></div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1040, textAlign: "center", fontSize: 40, fontWeight: 700, lineHeight: 1.3 }}>
            <TextDrop t={t} t0={V.end + 0.4} text="Avec MyMotiv, postulez." from={[0, -30]} /><br />
            <span style={{ color: PINK }}><TextDrop t={t} t0={V.end + 0.7} text="Et faites-vous recruter." from={[0, -30]} /></span>
          </div>
          {/* enregistrer la vidéo */}
          <div style={{ position: "absolute", left: CX - 330, top: 1185, width: 660, height: 140, borderRadius: 70, background: "rgba(245,245,247,0.97)", color: "#1D1D1F", display: "flex", alignItems: "center", gap: 24, padding: "0 36px", transform: `scale(${bounce(t, [[V.end + 1.0, 0], [V.end + 1.35, 1]])})`, boxShadow: "0 30px 80px rgba(0,0,0,0.55)" }}>
            <svg width={64} height={76} viewBox="0 0 32 38" style={{ flex: "none", transform: `scale(${bounce(t, [[V.save, 1.5], [V.save + 0.3, 1]])})` }}>
              <path d="M4 3 Q4 1 6 1 L26 1 Q28 1 28 3 L28 36 L16 27 L4 36 Z" fill={t > V.save ? PINK : "none"} stroke={t > V.save ? PINK : "#1D1D1F"} strokeWidth={2.6} strokeLinejoin="round" />
            </svg>
            <div style={{ fontSize: 34, fontWeight: 800, lineHeight: 1.15 }}>{t > V.save ? "Enregistrée ✓" : "Enregistre cette vidéo"}<br /><span style={{ fontSize: 26, fontWeight: 600, color: "#86868B" }}>pour ta prochaine candidature</span></div>
          </div>
        </div>
      )}

      {/* curseur MyMotiv */}
      {ptr.o > 0 && <div style={{ position: "absolute", inset: 0, zIndex: 40 }}><Pointer x={ptr.x} y={ptr.y} hover={ptr.hv} press={ptr.pr} o={ptr.o} /></div>}
      <Flash k={flashK} />
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};

function mixGrey(k: number) {
  const a = [44, 44, 48], b = [217, 130, 139];
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * clamp(k))).join(",")})`;
}
