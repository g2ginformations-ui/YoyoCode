// « Révélation MyMotiv » (16,5 s, 60 i/s, 9:16) — reprend, étape par étape, la construction d'une pub produit de référence
// (particule de lumière → flash → icône + nom → fenêtre de l'app en 3D → zoom sur le tableau → gros plan à faible profondeur
// de champ → carte inclinée « coller le lien / générer / résultat » → traînées de lumière qui forment une barre de saisie →
// menu des étapes + cartes en éventail → envoi → flash → écran de fin à bulles et pilule noire), adaptée à MyMotiv :
// fond sombre, lumière rose, vraie démarche de l'app (CV, lien de l'offre, analyse, lettre avec logo). Motion « Apple »
// (src/apple.tsx : rebond d'inertie, décalages, TextDrop) + caméra 3D (perspective, rotations, flou de mise au point).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, bounce, curve, go, press } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import { SHOT } from "./Lien";
import "./fonts";

export const REVEAL_DUR = 16.5;
const C = { bg0: "#0B0A0B", bg1: "#1C1C1E", side: "#161618", panel: "#232325", card: "#2C2C2E", line: "#3A3A3C", ink: "#F5F5F7", soft: "#8E8E93" };
const CX = 540, CY = 960;
export const K = { flash: 0.95, icon: 1.0, word: 1.35, iconOut: 2.2, win: 2.45, zoom: 3.3, analyse: 4.05, pop: 5.6, close: 6.95,
  card: 8.15, genClic: 8.75, result: 8.95, trails: 9.5, bar: 10.4, type: 10.6, menu: 11.5, barBack: 12.95, send: 13.35, flash2: 13.75, end: 14.0 };
const e3 = (k: number) => 1 - Math.pow(1 - clamp(k), 3);
const ease = (t: number, a: number, b: number) => e3(seg(t, a, b));

// ── petits éléments ──
const Dots = () => <div style={{ display: "flex", gap: 10 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 8, background: "#4A4A4E" }} />)}</div>;
const Spinner: React.FC<{ t: number; size?: number }> = ({ t, size = 40 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40"><circle cx={20} cy={20} r={16} fill="none" stroke={C.line} strokeWidth={5} />
    <circle cx={20} cy={20} r={16} fill="none" stroke={PINK} strokeWidth={5} strokeLinecap="round" strokeDasharray="30 100" transform={`rotate(${t * 520} 20 20)`} /></svg>
);
const Icon: React.FC<{ size: number }> = ({ size }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, background: `linear-gradient(145deg, ${PINK_L}, ${PINK} 55%, #B9606B)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: size * 0.42, letterSpacing: -1, boxShadow: `0 0 ${size * 0.5}px rgba(217,130,139,0.55), inset 0 2px 0 rgba(255,255,255,0.35)` }}>mm.</div>
);

export const Reveal: React.FC<{ audio?: string }> = ({ audio = "audio/reveal.wav" }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const bgGlow = t < K.end ? `radial-gradient(circle at 50% 46%, #3A2327 0%, #1E1719 38%, ${C.bg0} 78%)` : `radial-gradient(circle at 50% 50%, #3A2327 0%, #1C1416 45%, ${C.bg0} 85%)`;

  // ═════ 1. particule → flash ═════
  const ok = ease(t, 0.05, K.flash);
  const [ox, oy] = curve(ok, [250, 1560], [CX, CY], [180, 1050]);
  const orbR = lerp(5, 34, ok);
  const flashK = Math.exp(-Math.pow((t - K.flash) / 0.12, 2)) + Math.exp(-Math.pow((t - K.flash2) / 0.12, 2)) * 1.1;
  const ringK = seg(t, K.flash, K.flash + 0.55);

  // ═════ 2. icône + nom ═════
  const iconS = bounce(t, [[K.icon, 0], [K.icon + 0.35, 1]]) * lerp(1, 1.5, ease(t, K.iconOut, K.win + 0.05));
  const iconBlur = lerp(0, 16, seg(t, K.iconOut, K.win));
  const iconO = seg(t, K.icon, K.icon + 0.1) * (1 - seg(t, K.iconOut + 0.05, K.win));
  const wordClip = 100 - 100 * ease(t, K.word, K.word + 0.45);

  // ═════ 3-4. fenêtre de l'app, caméra 3D ═════
  const winIn = ease(t, K.win, K.win + 0.65);
  const zk = ease(t, K.zoom, K.zoom + 0.6);
  const drift = seg(t, K.zoom + 0.6, K.close);
  const wRY = lerp(30, 9, winIn) + lerp(0, -14, zk), wRX = lerp(14, 5, winIn) + lerp(0, 2, zk);
  const wS = lerp(0.62, 0.86, winIn) * lerp(1, 1.42, zk) * lerp(1, 1.06, drift);
  const wTX = lerp(0, -205, zk) + lerp(0, -30, drift), wTY = lerp(80, 0, winIn) + lerp(0, 120, zk);
  const wBlur = lerp(16, 0, ease(t, K.win, K.win + 0.5)) + lerp(0, 22, seg(t, K.close - 0.18, K.close));
  const wO = seg(t, K.win, K.win + 0.2) * (1 - seg(t, K.close - 0.1, K.close + 0.02));
  const link = "…/offre/manager-ventes";
  const typed = Math.round(link.length * seg(t, K.zoom + 0.15, K.analyse - 0.15));
  const ROWS: [string, number][] = [["Management d'équipe", 0.96], ["Conseil client", 0.9], ["Objectifs de vente", 0.84], ["Merchandising", 0.7], ["Mise en scène produit", 0.62], ["Esprit d'équipe", 0.78]];
  const popK = go(t, K.pop, K.pop + 0.42, 0, 1);

  // ═════ 5. gros plan à faible profondeur de champ ═════
  const cuK = seg(t, K.close, K.card);
  const cuY = lerp(260, -260, cuK);
  const cuO = seg(t, K.close - 0.05, K.close + 0.12) * (1 - seg(t, K.card - 0.12, K.card + 0.02));
  const CU: { y: number; el: React.ReactNode }[] = [
    { y: 0, el: <div style={{ fontSize: 34, fontWeight: 700, color: C.soft, letterSpacing: 3 }}>POINTS FORTS REPÉRÉS <span style={{ color: PINK }}>6</span></div> },
    ...["Management d'équipe", "Conseil client", "Objectifs de vente"].map((s, i) => ({ y: 110 + i * 170, el: (
      <div style={{ display: "flex", alignItems: "center", gap: 30, width: 860, padding: "26px 34px", borderRadius: 30, background: C.card, border: i === 1 ? `3px solid ${PINK}` : "3px solid transparent" }}>
        <div style={{ width: 76, height: 76, borderRadius: 20, background: "#3A2A2D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: PINK, fontWeight: 800 }}>✓</div>
        <div><div style={{ fontSize: 50, fontWeight: 700 }}>{s}</div><div style={{ fontSize: 30, color: C.soft }}>dans ton CV · demandé par l'offre</div></div>
      </div>) })),
    { y: 640, el: <div style={{ fontSize: 50, fontWeight: 700 }}>Ton CV <span style={{ color: PINK }}>✓ lu</span></div> },
    { y: 790, el: <div style={{ fontSize: 34, fontWeight: 700, color: C.soft, letterSpacing: 3 }}>EN COURS <span style={{ color: PINK }}>1</span></div> },
    { y: 880, el: (
      <div style={{ display: "flex", alignItems: "center", gap: 30, width: 860, padding: "28px 34px", borderRadius: 30, background: C.card, border: `3px solid ${PINK}` }}>
        <Spinner t={t} size={76} />
        <div><div style={{ fontSize: 52, fontWeight: 700 }}>Rédaction de ta lettre</div><div style={{ fontSize: 30, color: C.soft }}>Structure, ton, logo de l'entreprise</div></div>
      </div>) },
  ];

  // ═════ 6. carte inclinée : lien → Générer → résultat ═════
  const cIn = ease(t, K.card, K.card + 0.45);
  const cRZ = lerp(-12, -5, cIn) + lerp(0, 4, ease(t, K.result, K.result + 0.5)), cRX = lerp(30, 16, cIn) - lerp(0, 8, ease(t, K.result, K.trails));
  const cS = lerp(0.7, 1, cIn) * lerp(1, 1.08, seg(t, K.result, K.trails));
  const cBlur = lerp(14, 0, cIn) + lerp(0, 18, seg(t, K.trails - 0.15, K.trails + 0.05));
  const cO = seg(t, K.card - 0.02, K.card + 0.15) * (1 - seg(t, K.trails - 0.1, K.trails + 0.05));
  const resK = ease(t, K.result, K.result + 0.35);

  // ═════ 7. traînées de lumière → barre de saisie ═════
  const trK = ease(t, K.trails, K.bar + 0.05);
  const barIn = bounce(t, [[K.bar - 0.05, 0], [K.bar + 0.3, 1]]);
  const barW = 980 * barIn * lerp(1, 0.13, ease(t, K.send + 0.1, K.flash2 - 0.05));
  const barO = seg(t, K.bar - 0.05, K.bar + 0.05) * (1 - seg(t, K.flash2 - 0.1, K.flash2));
  const barBlur = lerp(0, 18, seg(t, K.menu - 0.15, K.menu)) * (1 - seg(t, K.menu + 0.05, K.menu + 0.25)) + lerp(0, 18, seg(t, K.barBack - 0.15, K.barBack)) * (1 - seg(t, K.barBack + 0.05, K.barBack + 0.25));
  const inMenu = t > K.menu && t < K.barBack;
  const barY = inMenu ? 1180 : CY;
  const barS = (inMenu ? 1.08 : 1) * press(t, K.send);
  const p1 = "M 120 520 Q 160 300 420 360 T 540 960", p2 = "M 960 440 Q 980 760 760 700 T 540 960";
  const menuItems = ["Analyser l'offre", "Écrire la lettre", "Adapter le CV", "Postuler"];
  const hi = Math.min(3, Math.floor(seg(t, K.menu + 0.35, K.barBack - 0.2) * 4));
  const STY: [string, string, string][] = [["Classique", "#fff", "#fff"], ["Moderne", "#fff", PINK], ["Minimaliste", "#FAFAFA", "#FAFAFA"], ["Sombre", "#1D1D1F", PINK]];

  // ═════ 11. fin ═════
  const endIn = ease(t, K.end, K.end + 0.5);
  const pillS = bounce(t, [[K.end, 0.6], [K.end + 0.35, 1]]);

  return (
    <AbsoluteFill style={{ background: bgGlow, fontFamily: "Poppins", color: C.ink, overflow: "hidden" }}>
      {/* 1. particule */}
      {t < K.flash + 0.05 && (
        <>
          {[0.08, 0.16, 0.24, 0.32].map((d, i) => { const [tx, ty] = curve(ease(t - d * 0.6, 0.05, K.flash), [250, 1560], [CX, CY], [180, 1050]); return <div key={i} style={{ position: "absolute", left: tx - orbR * (0.7 - i * 0.12), top: ty - orbR * (0.7 - i * 0.12), width: orbR * (1.4 - i * 0.24), height: orbR * (1.4 - i * 0.24), borderRadius: "50%", background: PINK_L, opacity: 0.35 - i * 0.07, filter: "blur(6px)" }} />; })}
          <div style={{ position: "absolute", left: ox - orbR, top: oy - orbR, width: orbR * 2, height: orbR * 2, borderRadius: "50%", background: "#fff", boxShadow: `0 0 ${orbR * 2}px ${orbR}px ${PINK_L}, 0 0 ${orbR * 6}px ${orbR * 3}px rgba(217,130,139,0.55)` }} />
        </>
      )}
      {ringK > 0 && ringK < 1 && <div style={{ position: "absolute", left: CX - lerp(60, 520, e3(ringK)), top: CY - lerp(60, 520, e3(ringK)), width: lerp(120, 1040, e3(ringK)), height: lerp(120, 1040, e3(ringK)), borderRadius: "50%", border: `${lerp(14, 2, ringK)}px solid ${PINK_L}`, opacity: 1 - ringK, filter: "blur(2px)" }} />}

      {/* 2. icône + nom */}
      {iconO > 0.01 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 690, display: "flex", flexDirection: "column", alignItems: "center", opacity: iconO, filter: `blur(${iconBlur}px)`, transform: `scale(${iconS})` }}>
          <Icon size={240} />
          <Img src={staticFile("logo-mymotiv.png")} style={{ width: 440, marginTop: 50, clipPath: `inset(0 ${wordClip}% 0 0)` }} />
        </div>
      )}

      {/* 3-4. fenêtre de l'app */}
      {wO > 0.01 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1700 }}>
          <div style={{ position: "absolute", left: CX - 500, top: CY - 660, width: 1000, height: 1320, borderRadius: 40, background: C.panel, overflow: "hidden", boxShadow: "0 60px 140px rgba(0,0,0,0.6), 0 0 0 2px #2E2E31", opacity: wO, filter: `blur(${wBlur}px)`, transformOrigin: "50% 50%", transform: `translate(${wTX}px, ${wTY}px) rotateY(${wRY}deg) rotateX(${wRX}deg) scale(${wS})` }}>
            {/* barre latérale */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 300, background: C.side, padding: "34px 26px" }}>
              <Dots />
              <Img src={staticFile("logo-mymotiv.png")} style={{ width: 220, marginTop: 40 }} />
              {[["⌂", "Accueil"], ["✦", "Candidature"], ["✉", "Mes lettres"], ["▤", "Mon CV"], ["€", "Tarifs"]].map(([ic, s], i) => (
                <div key={s} style={{ marginTop: i === 0 ? 50 : 12, display: "flex", alignItems: "center", gap: 18, padding: "18px 20px", borderRadius: 20, background: i === 1 ? PINK : "transparent", color: i === 1 ? "#fff" : C.soft, fontSize: 30, fontWeight: 600 }}><span style={{ width: 30, textAlign: "center" }}>{ic}</span>{s}</div>
              ))}
              <div style={{ position: "absolute", left: 26, bottom: 34, padding: "10px 22px", borderRadius: 999, background: "#3A2A2D", color: PINK_L, fontSize: 24, fontWeight: 700 }}>Accès à vie</div>
            </div>
            {/* panneau principal */}
            <div style={{ position: "absolute", left: 330, right: 30, top: 34 }}>
              <div style={{ fontSize: 46, fontWeight: 700 }}>Lancer une candidature</div>
              <div style={{ marginTop: 26, display: "flex", gap: 16 }}>
                <div style={{ flex: 1, height: 84, borderRadius: 22, background: C.card, display: "flex", alignItems: "center", padding: "0 24px", fontSize: 30, fontWeight: 600, gap: 14, whiteSpace: "nowrap", overflow: "hidden" }}>🔗 {link.slice(0, typed)}<span style={{ width: 3, height: 34, background: PINK, opacity: t < K.analyse && Math.floor(t * 3) % 2 === 0 ? 1 : 0 }} /></div>
                <div style={{ width: 190, height: 84, borderRadius: 22, background: PINK, color: "#fff", fontSize: 30, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press(t, K.analyse)})` }}>Analyser</div>
              </div>
              <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14, fontSize: 26, color: C.soft, fontWeight: 600 }}>📄 CV_Camille_Dubois.pdf <span style={{ color: PINK }}>✓</span></div>
              <div style={{ marginTop: 26, fontSize: 22, letterSpacing: 2, color: C.soft, fontWeight: 700 }}>COMPÉTENCES DEMANDÉES</div>
              <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 12 }}>
                {[["Management", PINK], ["Conseil client", "#F2B8C0"], ["Objectifs", "#E7C27D"], ["Merchandising", "#9AB8E8"]].map(([s, col], i) => {
                  const k = go(t, K.analyse + 0.2 + i * 0.08, K.analyse + 0.5 + i * 0.08, 0, 1);
                  return <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: C.card, fontSize: 24, fontWeight: 600, transform: `scale(${k})`, opacity: clamp(k * 2) }}><span style={{ width: 12, height: 12, borderRadius: 6, background: col }} />{s}</div>;
                })}
              </div>
              <div style={{ marginTop: 26, fontSize: 26, color: C.soft, fontWeight: 600 }}><span style={{ color: C.ink, fontWeight: 800 }}>{Math.round(6 * seg(t, K.analyse + 0.4, K.analyse + 1.3))}</span> points forts repérés</div>
              <div style={{ marginTop: 18, display: "flex", fontSize: 22, color: C.soft, fontWeight: 700, letterSpacing: 1, borderBottom: `2px solid ${C.line}`, paddingBottom: 12 }}><div style={{ flex: 1 }}>COMPÉTENCE</div><div style={{ width: 200 }}>CORRESPONDANCE</div></div>
              {ROWS.map(([s, v], i) => {
                const a = K.analyse + 0.45 + i * 0.13, k = ease(t, a, a + 0.3);
                return (
                  <div key={s} style={{ display: "flex", alignItems: "center", height: 92, borderBottom: `2px solid ${C.line}`, opacity: k, transform: `translateY(${(1 - k) * 24}px)`, background: i === 0 && t > K.pop - 0.2 ? "rgba(217,130,139,0.12)" : "transparent" }}>
                    <div style={{ width: 54, height: 54, borderRadius: 14, background: "#3A2A2D", color: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 28 }}>✓</div>
                    <div style={{ flex: 1, marginLeft: 18, fontSize: 30, fontWeight: 600 }}>{s}</div>
                    <div style={{ width: 200, height: 14, borderRadius: 7, background: C.line, overflow: "hidden" }}><div style={{ width: `${v * 100 * ease(t, a + 0.15, a + 0.6)}%`, height: "100%", background: PINK }} /></div>
                  </div>
                );
              })}
            </div>
          </div>
          {/* carte de détail qui surgit (devant la fenêtre) + cartes flottantes */}
          {t > K.pop - 0.05 && (
            <div style={{ position: "absolute", inset: 0, opacity: wO }}>
              {[[-1, 0.9, "CV_Camille_Dubois.pdf", 700, 1240], [1, 0.75, "Lettre · brouillon", 860, 1420]].map(([d, s, label, x, y], i) => {
                const k = go(t, K.pop + 0.15 + i * 0.1, K.pop + 0.55 + i * 0.1, 0, 1);
                return <div key={String(label)} style={{ position: "absolute", left: (x as number) - 170 + (1 - k) * 300, top: (y as number) - 110 + Math.sin(t * 2 + i) * 8, width: 340, height: 220, borderRadius: 26, background: C.card, boxShadow: "0 30px 70px rgba(0,0,0,0.55)", transform: `perspective(1200px) rotateY(${-16 * (d as number)}deg) scale(${(s as number) * k})`, opacity: clamp(k * 2), padding: 24 }}>
                  <div style={{ fontSize: 24, fontWeight: 700 }}>{label}</div>
                  {[0, 1, 2, 3].map((j) => <div key={j} style={{ marginTop: 14, height: 12, borderRadius: 6, width: `${[90, 76, 84, 50][j]}%`, background: C.line }} />)}
                </div>;
              })}
              <div style={{ position: "absolute", left: 560 + (1 - popK) * 420, top: 520, width: 470, borderRadius: 34, background: "#2F2F32", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", padding: 32, transform: `perspective(1200px) rotateY(-12deg) scale(${lerp(0.85, 1, popK)})`, opacity: clamp(popK * 2) }}>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <Img src={staticFile("company.png")} style={{ width: 80, height: 80, borderRadius: 18 }} />
                  <div><div style={{ fontSize: 32, fontWeight: 700 }}>Maison Lumen</div><div style={{ fontSize: 24, color: C.soft }}>Manager des ventes · Lyon</div></div>
                </div>
                <div style={{ marginTop: 26, fontSize: 22, color: C.soft, fontWeight: 700, letterSpacing: 1 }}>CORRESPONDANCE AVEC TON CV</div>
                <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ flex: 1, height: 16, borderRadius: 8, background: C.line, overflow: "hidden" }}><div style={{ width: `${86 * ease(t, K.pop + 0.3, K.pop + 0.9)}%`, height: "100%", background: PINK }} /></div>
                  <div style={{ fontSize: 30, fontWeight: 800, color: PINK }}>Forte</div>
                </div>
                <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
                  {["Logo ✓", "Ton ✓", "Mots-clés ✓"].map((s, i) => <div key={s} style={{ padding: "10px 16px", borderRadius: 999, background: "#3A2A2D", color: PINK_L, fontSize: 22, fontWeight: 700, transform: `scale(${go(t, K.pop + 0.5 + i * 0.08, K.pop + 0.8 + i * 0.08, 0, 1)})` }}>{s}</div>)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. gros plan, faible profondeur de champ */}
      {cuO > 0.01 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1400, opacity: cuO }}>
          <div style={{ position: "absolute", left: 60, top: 0, width: 960, height: 1920, transform: "rotateX(14deg) rotateZ(-3deg) scale(1.12)", transformOrigin: "50% 50%" }}>
            {CU.map(({ y, el }, i) => {
              const yy = 520 + y + cuY, dist = Math.abs(yy + 60 - CY);
              return <div key={i} style={{ position: "absolute", left: 50, top: yy, filter: `blur(${Math.min(14, Math.max(0, dist - 160) / 28)}px)` }}>{el}</div>;
            })}
          </div>
        </div>
      )}

      {/* 6. carte inclinée : lien → Générer → lettre */}
      {cO > 0.01 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1500 }}>
          <div style={{ position: "absolute", left: CX - 470, top: CY - 520, width: 940, height: 1040, borderRadius: 44, background: C.panel, boxShadow: "0 60px 140px rgba(0,0,0,0.6), 0 0 0 2px #333", overflow: "hidden", opacity: cO, filter: `blur(${cBlur}px)`, transform: `rotateX(${cRX}deg) rotateZ(${cRZ}deg) scale(${cS})` }}>
            <div style={{ position: "absolute", left: 40, top: 36 }}><Dots /></div>
            <div style={{ position: "absolute", left: 40, right: 40, top: 100, display: "flex", gap: 16, opacity: 1 - resK }}>
              <div style={{ flex: 1, height: 96, borderRadius: 26, background: C.card, display: "flex", alignItems: "center", padding: "0 28px", fontSize: 34, fontWeight: 600, whiteSpace: "nowrap" }}>🔗 …/offre/manager-ventes</div>
              <div style={{ width: 340, height: 96, borderRadius: 26, background: PINK, color: "#fff", fontSize: 32, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press(t, K.genClic)})`, boxShadow: `0 0 ${40 * Math.exp(-Math.pow((t - K.genClic) / 0.1, 2))}px ${PINK}` }}>Générer ✦</div>
            </div>
            <div style={{ position: "absolute", left: 40, top: 230, fontSize: 28, color: C.soft, fontWeight: 600, opacity: 1 - resK }}>Analyse terminée · 6 points forts</div>
            {/* résultat */}
            <div style={{ position: "absolute", inset: 0, opacity: resK, transform: `translateY(${(1 - resK) * 40}px)` }}>
              <div style={{ position: "absolute", left: 40, top: 96, width: 470, height: 860, borderRadius: 26, overflow: "hidden", background: "#fff" }}>
                <Img src={SHOT("030-lettre")} style={{ position: "absolute", left: -112 * 0.62, top: -270 * 0.62, width: 1080 * 0.62, height: 1920 * 0.62 }} />
              </div>
              <div style={{ position: "absolute", left: 545, top: 110, right: 40 }}>
                <Img src={staticFile("company.png")} style={{ width: 96, height: 96, borderRadius: 22, transform: `scale(${bounce(t, [[K.result + 0.15, 1.5], [K.result + 0.45, 1]])})`, opacity: seg(t, K.result + 0.15, K.result + 0.25) }} />
                <div style={{ marginTop: 20, fontSize: 36, fontWeight: 700, lineHeight: 1.15 }}>Lettre sur-mesure</div>
                <div style={{ fontSize: 26, color: C.soft, marginTop: 6 }}>Maison Lumen</div>
                <div style={{ marginTop: 26, fontSize: 64, fontWeight: 800, color: PINK_L }}>≈ 30 s*</div>
                <div style={{ marginTop: 26, padding: "18px 0", borderRadius: 22, background: PINK, color: "#fff", fontSize: 28, fontWeight: 700, textAlign: "center" }}>Télécharger en PDF</div>
                <div style={{ marginTop: 14, padding: "18px 0", borderRadius: 22, background: C.card, fontSize: 28, fontWeight: 600, textAlign: "center" }}>Plus court · Plus long</div>
              </div>
            </div>
          </div>
          {/* badge */}
          {t > K.genClic && <div style={{ position: "absolute", left: CX - 300, top: CY + 470, width: 600, height: 100, borderRadius: 50, background: "rgba(44,44,46,0.92)", border: `2px solid ${PINK}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, fontSize: 32, fontWeight: 700, opacity: cO, transform: `scale(${go(t, K.genClic + 0.05, K.genClic + 0.4, 0, 1)}) rotateZ(-4deg)` }}>
            {t < K.result + 0.2 ? <Spinner t={t} size={44} /> : <span style={{ color: PINK }}>✓</span>} Lettre générée en <span style={{ color: PINK_L }}>30 s*</span>
          </div>}
        </div>
      )}

      {/* 7. traînées de lumière */}
      {t > K.trails && t < K.bar + 0.5 && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: 1 - seg(t, K.bar + 0.2, K.bar + 0.5) }}>
          <defs><filter id="glw"><feGaussianBlur stdDeviation="8" /></filter></defs>
          {[p1, p2].map((d, i) => (
            <g key={i}>
              <path d={d} fill="none" stroke={PINK} strokeWidth={14} pathLength={1} strokeDasharray={`${0.35} 1`} strokeDashoffset={-trK + 0.35} filter="url(#glw)" strokeLinecap="round" />
              <path d={d} fill="none" stroke="#fff" strokeWidth={5} pathLength={1} strokeDasharray={`${0.35} 1`} strokeDashoffset={-trK + 0.35} strokeLinecap="round" />
            </g>
          ))}
        </svg>
      )}

      {/* 8. menu des étapes + cartes en éventail */}
      {inMenu && (
        <>
          {STY.map(([n, paper, acc], i) => {
            const k = go(t, K.menu + 0.35 + i * 0.07, K.menu + 0.75 + i * 0.07, 0, 1);
            return <div key={n} style={{ position: "absolute", left: 600 + i * 70, top: 470 + Math.abs(i - 1.5) * 16, width: 200, height: 270, borderRadius: 18, background: paper, boxShadow: "0 20px 50px rgba(0,0,0,0.55)", transformOrigin: "50% 120%", transform: `rotate(${(i - 1.5) * 9 * k}deg) scale(${k})`, opacity: clamp(k * 2) * (1 - seg(t, K.barBack - 0.25, K.barBack - 0.05)), overflow: "hidden" }}>
              {acc !== paper && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: acc }} />}
              {[0, 1, 2, 3, 4, 5].map((j) => <div key={j} style={{ position: "absolute", left: 26, top: 30 + j * 34, height: 10, borderRadius: 5, width: `${[60, 80, 70, 84, 64, 40][j]}%`, background: paper === "#1D1D1F" ? "#3A3A3C" : "#DADADF" }} />)}
              <div style={{ position: "absolute", left: 0, right: 0, bottom: 16, textAlign: "center", fontSize: 20, fontWeight: 700, color: paper === "#1D1D1F" ? "#fff" : "#1D1D1F" }}>{n}</div>
            </div>;
          })}
          <div style={{ position: "absolute", left: 110, top: 680, width: 520, borderRadius: 30, background: "rgba(44,44,46,0.96)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", padding: 16, transform: `scale(${bounce(t, [[K.menu + 0.05, 0.6], [K.menu + 0.4, 1]])})`, transformOrigin: "20% 100%", opacity: seg(t, K.menu + 0.05, K.menu + 0.15) * (1 - seg(t, K.barBack - 0.25, K.barBack - 0.05)) }}>
            {menuItems.map((s, i) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 18, padding: "20px 22px", borderRadius: 20, background: i === hi ? "rgba(217,130,139,0.18)" : "transparent", fontSize: 34, fontWeight: 600, color: i <= hi ? C.ink : C.soft }}>
                <span style={{ width: 34, color: PINK }}>{["◎", "✎", "▤", "➤"][i]}</span>{s}{i < hi && <span style={{ marginLeft: "auto", color: PINK, fontWeight: 800 }}>✓</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* 7-9. barre de saisie */}
      {barO > 0.01 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1400 }}>
          <div style={{ position: "absolute", left: CX - barW / 2, top: barY - 70, width: barW, height: 140 + (inMenu ? 0 : 0), borderRadius: 34, background: "#F5F5F7", color: "#1D1D1F", boxShadow: `0 0 70px rgba(217,130,139,0.45), 0 30px 80px rgba(0,0,0,0.5)`, overflow: "hidden", opacity: barO, filter: `blur(${barBlur}px)`, transform: `rotateX(10deg) rotateZ(-3deg) scale(${barS})` }}>
            <div style={{ position: "absolute", left: 34, top: 28, fontSize: 32, fontWeight: 700, whiteSpace: "nowrap" }}>
              <TextDrop t={t} t0={K.type} text="Écris ma lettre " by="chars" from={[0, 16]} stagger={0.03} dur={0.15} />
              <span style={{ color: "#C9636F" }}><TextDrop t={t} t0={K.type + 0.48} text="en 30 secondes*" by="chars" from={[0, 16]} stagger={0.03} dur={0.15} /></span>
              <TextDrop t={t} t0={K.type + 0.95} text=" avec MyMotiv" by="chars" from={[0, 16]} stagger={0.03} dur={0.15} />
            </div>
            <div style={{ position: "absolute", left: 34, bottom: 18, display: "flex", gap: 12, fontSize: 22, fontWeight: 600, color: "#86868B" }}>
              <span style={{ padding: "6px 14px", borderRadius: 999, background: "#E8E8ED" }}>Lettre ▾</span><span style={{ padding: "6px 14px", borderRadius: 999, background: "#E8E8ED" }}>CV ▾</span>
            </div>
            <div style={{ position: "absolute", right: 24, top: 38, width: 64, height: 64, borderRadius: 32, background: PINK, color: "#fff", fontSize: 34, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${press(t, K.send)})` }}>↑</div>
          </div>
        </div>
      )}

      {/* mention */}
      {((t > K.result && t < K.trails) || (t > K.type + 0.5 && t < K.flash2)) && <div style={{ position: "absolute", left: 0, right: 0, top: 1620, textAlign: "center", fontSize: 26, color: C.soft, fontFamily: "Open Sans" }}>* temps mesuré : 27 à 35 s par lettre</div>}

      {/* 11. fin : bulles, icône, pilule noire, slogan */}
      {t > K.end - 0.05 && (
        <div style={{ position: "absolute", inset: 0, opacity: endIn }}>
          {[[150, 470, 130], [930, 380, 170], [110, 1520, 200], [980, 1540, 130], [330, 1760, 60], [790, 1790, 90], [520, 240, 50], [880, 660, 40]].map(([x, y, r], i) => (
            <div key={i} style={{ position: "absolute", left: x - r, top: y - r + Math.sin(t * 1.3 + i) * 12 - (t - K.end) * (10 + i * 3), width: r * 2, height: r * 2, borderRadius: "50%", border: `${Math.max(3, r / 12)}px solid rgba(242,184,192,0.55)`, background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.18), rgba(217,130,139,0.05) 60%, rgba(0,0,0,0))", boxShadow: "inset 0 0 30px rgba(217,130,139,0.35)", transform: `scale(${go(t, K.end + i * 0.04, K.end + 0.4 + i * 0.04, 0.6, 1)})` }} />
          ))}
          <div style={{ position: "absolute", left: 0, right: 0, top: 1035, height: 4, background: `linear-gradient(90deg, rgba(217,130,139,0), ${PINK_L}, rgba(217,130,139,0))`, boxShadow: `0 0 30px ${PINK}`, transform: `scaleX(${ease(t, K.end + 0.1, K.end + 0.6)})` }} />
          <div style={{ position: "absolute", left: CX - 60, top: 640, transform: `scale(${bounce(t, [[K.end + 0.2, 0], [K.end + 0.55, 1]])})` }}><Icon size={120} /></div>
          <div style={{ position: "absolute", left: CX - 330, top: 820, width: 660, height: 180, borderRadius: 90, background: "linear-gradient(180deg, #2A2A2D 0%, #0B0A0B 55%, #000 100%)", boxShadow: "0 30px 80px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.25), 0 0 0 2px #3A3A3C", display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${pillS})` }}>
            <Img src={staticFile("logo-mymotiv.png")} style={{ width: 430, opacity: seg(t, K.end + 0.15, K.end + 0.35) }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", fontSize: 44, fontWeight: 700, lineHeight: 1.3 }}>
            <TextDrop t={t} t0={K.end + 0.5} text="Colle l'offre." by="chars" from={[0, 20]} stagger={0.03} dur={0.2} />{" "}
            <span style={{ color: PINK_L }}><TextDrop t={t} t0={K.end + 0.95} text="MyMotiv écrit la lettre." by="chars" from={[0, 20]} stagger={0.03} dur={0.2} /></span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontSize: 32, fontWeight: 600, color: C.soft }}>
            <TextDrop t={t} t0={K.end + 1.8} text="Ta 1re lettre est offerte · Lien en bio ↑" from={[0, 30]} stagger={0.04} />
          </div>
        </div>
      )}

      {/* flashs */}
      {flashK > 0.01 && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 50%, rgba(255,255,255,${0.95 * clamp(flashK)}) 0%, rgba(242,184,192,${0.8 * clamp(flashK)}) 30%, rgba(217,130,139,${0.35 * clamp(flashK)}) 60%, rgba(0,0,0,0) 85%)` }} />}
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
