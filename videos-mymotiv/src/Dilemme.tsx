// « Le Dilemme à 1,99 € » (50 s, 60 i/s, TikTok 9:16) — univers « braquage » de jeu vidéo, néon rose poudré, Yann aux commandes.
// Accroche (course dans un couloir, vidéo Gemini de l'utilisateur, puis photo de la canette, poussée de caméra, texte qui claque, arrêt sur image + étiquette 1,99 €) → glitch →
// tableau « Choisis ta mission » (écran partagé : 1 canette / 1 semaine MyMotiv, même prix) → le curseur MyMotiv vise,
// clique, la canette vole en éclats → traversée vers HelloWork : on copie le lien de l'offre → on le colle sur le VRAI site →
// roue d'armes au ralenti (lettre sur-mesure, logo, 5 clics) → écran de chargement à astuces (temps mesuré, témoignage
// réel de Léni S.) → « MISSION PASSED · RESPECT + » → appel à l'action (lien en bio, question en commentaire).
// Effets inspirés du vocabulaire EyeCannndy : push in, speed ramp, freeze frame, glitch, split screen, shatter, pass through,
// whip pan, slow motion, typographie cinétique, flash, tremblement.
import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, PINK, PINK_L, clamp, easeIn, easeInOut, easeOut, lerp, rng, seg } from "./common";
import { Confetti, Kin, NEON, OUTLINE, Phone, Pointer, Ripple, Screen, SHOT, sp } from "./Lien";
import "./fonts";

const D = (f: string) => staticFile(`dilemme/${f}`);
// Sites d'emploi de l'éventail (logos fournis par l'utilisateur), HelloWork posé par-dessus au centre.
const BOARDS = ["indeed", "france-travail", "leboncoin", "wttj", "cadremploi", "apec", "linkedin"];
const GOLD = "linear-gradient(180deg, #fff3b0 0%, #f7c948 45%, #c98b16 100%)";

// Temps clés (s)
const T = {
  hook2: 3.0, freeze: 3.55, glitch: 4.25, board: 4.6, yann: 5.2,
  cursor: 13.0, hoverA: 13.75, tapB: 15.0, shatter: 15.15, dive: 16.55, offer: 17.2,
  pill: 18.3, copy: 19.35, whip: 20.35, paste: 21.0, tapRead: 22.2, read: 22.4, logo: 23.1,
  wheel: 25.5, w1: 26.2, w2: 29.2, w3: 32.2, wheelOut: 34.6,
  proof: 35.0, tip2: 38.6, passed: 43.0, cta: 45.4, total: 50,
};

// Carte d'option du tableau de mission
const Card: React.FC<{ x: number; y: number; side: "A" | "B"; style?: React.CSSProperties }> = ({ x, y, side, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 480, height: 780, borderRadius: 30, overflow: "hidden", background: "#151215", border: "2px solid rgba(255,255,255,0.12)", ...style }}>
    {side === "A" ? (
      <Img src={D("canette.jpg")} style={{ width: 480, height: 435, objectFit: "cover", display: "block" }} />
    ) : (
      <div style={{ width: 480, height: 435, position: "relative", background: `radial-gradient(circle at 50% 40%, rgba(217,130,139,0.55), #151215 70%)`, overflow: "hidden" }}>
        <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: 70, top: 60, width: 340 }} />
        <Img src={staticFile("mascotte/sourire.png")} style={{ position: "absolute", left: 120, top: 150, height: 300 }} />
      </div>
    )}
    <div style={{ padding: "22px 28px", fontFamily: "Poppins" }}>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: 5, color: side === "A" ? "#9fb7ff" : PINK_L }}>OPTION {side}</div>
      <div style={{ fontSize: side === "A" ? 44 : 38, fontWeight: 700, color: "#fff", lineHeight: 1.1, marginTop: 6, whiteSpace: "nowrap" }}>{side === "A" ? "1 canette" : "1 semaine MyMotiv"}</div>
      <div style={{ fontSize: 30, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginTop: 10 }}>{side === "A" ? "⏱ 5 min de plaisir" : "✉ Lettres illimitées*"}</div>
      <div style={{ fontSize: 30, fontWeight: 600, color: "rgba(255,255,255,0.7)", marginTop: 4 }}>{side === "A" ? "😵 Puis le stress revient" : "😌 Zéro stress"}</div>
      <div style={{ position: "absolute", left: 28, bottom: 24, fontSize: 72, fontWeight: 700, color: side === "A" ? "#fff" : PINK_L }}>1,99 €</div>
    </div>
  </div>
);

// Montage resserré (version 30 s) : temps de sortie → temps de la version longue, passage par passage.
export type Seg = [number, number, number];
const warpTime = (tOut: number, segs?: Seg[]) => {
  if (!segs) return tOut;
  let acc = 0;
  for (const [a, b, speed] of segs) {
    const d = (b - a) / speed;
    if (tOut < acc + d) return a + (tOut - acc) * speed;
    acc += d;
  }
  const last = segs[segs.length - 1];
  return last[1];
};

export const Dilemme: React.FC<{ segs?: Seg[]; audio?: string }> = ({ segs, audio = "audio/dilemme.wav" }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = warpTime(frame / fps, segs);
  const spr = (t0: number, stiffness = 300, damping = 20) => spring({ frame: Math.max(0, (t - t0) * fps), fps, config: { stiffness, damping } });
  const shake = (t0: number, amp = 18, d = 0.35) => { const k = seg(t, t0, t0 + d); return k > 0 && k < 1 ? Math.sin(t * 95) * amp * (1 - k) : 0; };
  const cursor = (t0: number, tap: number, tx: number, ty: number, fx = 1000, fy = 1750) => {
    const k = easeInOut(seg(t, t0, tap - 0.25)), out = easeIn(seg(t, tap + 0.3, tap + 0.65));
    return {
      x: lerp(fx, tx, k) + out * 260, y: lerp(fy, ty, k) + out * 420,
      hover: clamp(seg(t, tap - 0.42, tap - 0.2) - seg(t, tap + 0.18, tap + 0.34)),
      press: clamp(1 - Math.abs(t - tap) / 0.09),
      o: clamp(seg(t, t0, t0 + 0.15)) * (1 - seg(t, tap + 0.45, tap + 0.65)),
    };
  };
  const flash = (t0: number, d = 0.12) => clamp(1 - Math.abs(t - t0) / d);

  // grille néon en perspective (fond du « jeu »)
  const Grid = ({ o = 1 }: { o?: number }) => (
    <div style={{ position: "absolute", inset: 0, opacity: o, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -540, right: -540, top: 1150, height: 1400, transformOrigin: "50% 0", transform: "perspective(700px) rotateX(62deg)", backgroundImage: `linear-gradient(rgba(217,130,139,0.45) 2px, transparent 2px), linear-gradient(90deg, rgba(217,130,139,0.45) 2px, transparent 2px)`, backgroundSize: "120px 120px", backgroundPosition: `0 ${(t * 160) % 120}px` }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, height: 400, background: `linear-gradient(180deg, ${BG}, rgba(11,10,11,0))` }} />
    </div>
  );

  // ═════════ 1. Accroche ═════════
  const hookOn = t < T.board + 0.05;
  const punch = easeOut(seg(t, T.hook2, T.hook2 + 0.4));
  const freezeK = seg(t, T.freeze, T.freeze + 0.15);
  const camS = lerp(1.7, 1.12, punch) + seg(t, T.hook2 + 0.4, T.freeze) * 0.22;
  const glitchK = seg(t, T.glitch, T.board);

  // ═════════ 2-3. Tableau de mission, choix, éclats ═════════
  const boardOn = t >= T.board && t < T.offer + 0.05;
  const split = easeOut(seg(t, T.board + 0.1, T.board + 0.6));
  // sélection qui navigue entre A et B (menu), puis le curseur prend la main
  const navs = [5.8, 6.8, 7.6, 8.4];
  const selB = t < T.cursor ? navs.filter((n) => t >= n).length % 2 === 1 : t >= 14.35;
  const selX = lerp(40, 560, easeInOut(clamp((t < T.cursor ? (selB ? 1 : 0) : t < 14.35 ? 0 : 1))));
  const shattered = t >= T.shatter;
  const dive = easeIn(seg(t, T.dive, T.offer));
  const accepted = spr(T.tapB + 0.08, 400, 15);

  // ═════════ 4. HelloWork → MyMotiv ═════════
  const offerOn = t >= T.offer - 0.05 && t < T.wheel + 0.1;
  const toSite = easeInOut(seg(t, T.whip, T.whip + 0.4));
  const siteShot = t < T.paste ? "006-offre-vide" : t < T.read ? "016-offre-lien" : t < T.logo ? "017-offre-lue" : "018-entreprise";
  const zoomLogo = easeInOut(seg(t, T.logo, T.logo + 0.5));
  const siteCam = { s: lerp(1.08, 1.4, zoomLogo), x: lerp(540, 420, zoomLogo), y: lerp(700, 1100, zoomLogo) };
  const projS = (x: number, y: number): [number, number] => [540 - siteCam.x * siteCam.s + x * siteCam.s, 960 - siteCam.y * siteCam.s + y * siteCam.s];

  // ═════════ 5. Roue d'armes (ralenti) ═════════
  const wheelOn = t >= T.wheel - 0.05 && t < T.proof + 0.1;
  const wIn = spr(T.wheel, 220, 16), wOut = easeIn(seg(t, T.wheelOut, T.proof));
  const wSel = t < T.w1 ? -1 : t < T.w2 ? 0 : t < T.w3 ? 1 : 2;
  const WEAPONS = [
    { n: "1", title: "Lettre sur-mesure", sub: "écrite pour CETTE offre", icon: "✍️", a: -90 },
    { n: "2", title: "Logo de l'entreprise", sub: "récupéré, posé sur ta lettre", icon: "🎯", a: 30 },
    { n: "3", title: "5 clics", sub: "zéro page blanche, zéro stress", icon: "⚡", a: 150 },
  ];
  const selT = [T.w1, T.w2, T.w3];

  // ═════════ 6. Écran de chargement : les preuves ═════════
  const proofOn = t >= T.proof - 0.05 && t < T.passed + 0.4;
  const load = seg(t, T.proof, T.passed);
  const seven = Math.round(lerp(0, 7, easeOut(seg(t, T.tip2 + 0.3, T.tip2 + 1.1))));

  // ═════════ 7. Mission passed + appel à l'action ═════════
  const passedOn = t >= T.passed;
  const mp = spr(T.passed + 0.25, 180, 14), resp = spr(T.passed + 0.95, 260, 14);
  const ctaK = easeOut(seg(t, T.cta, T.cta + 0.4));

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden", fontFamily: "Poppins" }}>
      {/* ═════ 1. ACCROCHE ═════ */}
      {hookOn && (
        <div style={{ position: "absolute", inset: 0, transform: `translateX(${shake(T.freeze, 22, 0.3)}px)` }}>
          {/* glitch : bandes horizontales décalées pendant la sortie */}
          {(glitchK > 0 ? [0, 1, 2, 3, 4, 5, 6, 7] : [-1]).map((i) => {
            const r = rng(i + 3), off = i < 0 ? 0 : (r() - 0.5) * 220 * glitchK;
            const clip = i < 0 ? undefined : `inset(${i * 12.5}% 0 ${100 - (i + 1) * 12.5}% 0)`;
            return (
              <div key={i} style={{ position: "absolute", inset: 0, clipPath: clip, transform: `translateX(${off}px)`, opacity: 1 - glitchK * 0.4 }}>
                <Img src={D("ciro.jpg")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, transformOrigin: "547px 676px", transform: `scale(${camS})`, filter: `${freezeK > 0 ? `grayscale(${0.75 * freezeK}) contrast(1.2)` : ""} ${punch < 1 ? `blur(${(1 - punch) * 10}px)` : ""}` }} />
              </div>
            );
          })}
          {freezeK > 0 && <div style={{ position: "absolute", inset: 0, background: "rgba(11,10,11,0.35)", mixBlendMode: "multiply" }} />}
          {/* 0 → 3 s : la course dans le couloir (vidéo générée par l'utilisateur avec Gemini, recadrée en vertical, ×1,25) */}
          {t < T.hook2 && (
            <div style={{ position: "absolute", inset: 0, transform: `scale(${1.04 + seg(t, 0, T.hook2) * 0.08}) translateX(${Math.sin(t * 11) * 4}px)` }}>
              <OffthreadVideo src={D("course.mp4")} muted style={{ position: "absolute", inset: 0, width: 1080, height: 1920 }} />
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)" }} />
            </div>
          )}
          {flash(T.hook2, 0.08) > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash(T.hook2, 0.08) }} />}
          {/* aberration chromatique à l'arrêt sur image */}
          {freezeK > 0 && freezeK < 1 && <div style={{ position: "absolute", inset: 0, boxShadow: "inset 30px 0 60px rgba(255,0,90,0.5), inset -30px 0 60px rgba(0,210,255,0.5)" }} />}
          <Kin t={t} t0={0.25} t1={T.hook2 - 0.05} y={230} size={104} fps={fps} words={[["Toi"], ["aussi"], ["tu"], ["cours"], ["après…"]]} />
          <Kin t={t} t0={T.hook2} t1={T.glitch} y={1180} size={104} fps={fps} words={[["…les"], ["réponses", true], ["?"]]} />
          {/* étiquette de prix qui claque sur la canette */}
          {t >= T.freeze && (() => {
            const k = spr(T.freeze, 420, 13);
            return <div style={{ position: "absolute", left: 610, top: 420, padding: "18px 34px", borderRadius: 20, background: `linear-gradient(135deg, ${PINK_L}, ${PINK})`, color: BG, fontSize: 88, fontWeight: 700, transform: `rotate(${lerp(-40, -8, k)}deg) scale(${lerp(3, 1, k)})`, opacity: clamp(k * 2), boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>1,99 €</div>;
          })()}
          {flash(T.freeze, 0.08) > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash(T.freeze, 0.08) * 0.8 }} />}
        </div>
      )}

      {/* ═════ 2-3. CHOISIS TA MISSION ═════ */}
      {boardOn && (
        <div style={{ position: "absolute", inset: 0, transformOrigin: "800px 770px", transform: `scale(${lerp(1, 7, dive)})`, opacity: 1 - seg(t, T.offer - 0.15, T.offer) }}>
          <Grid />
          <div style={{ position: "absolute", left: 0, right: 0, top: 120, textAlign: "center", opacity: split }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: 10, color: PINK_L }}>BUDGET : 1,99 €</div>
            <div style={{ fontSize: 76, fontWeight: 700, color: "#fff", textShadow: OUTLINE, letterSpacing: 2 }}>CHOISIS TA MISSION</div>
          </div>
          {/* carte A (canette) : entière, puis en éclats */}
          {!shattered ? (
            <Card x={lerp(-560, 40, split)} y={330} side="A" style={{ transform: `translateX(${t > T.hoverA && t < 14.3 ? Math.sin(t * 70) * 10 : 0}px)` }} />
          ) : (
            Array.from({ length: 24 }, (_, i) => {
              const cx = i % 4, cy = Math.floor(i / 4), r = rng(i + 40), d = t - T.shatter;
              const px = 40 + cx * 120, py = 330 + cy * 130;
              const vx = (r() - 0.6) * 1400, vy = -400 - r() * 700;
              return (
                <div key={i} style={{ position: "absolute", left: px + vx * d, top: py + vy * d + 1900 * d * d, width: 120, height: 130, overflow: "hidden", transform: `rotate(${(r() - 0.5) * 900 * d}deg)`, opacity: clamp(1.3 - d), background: "#151215" }}>
                  {cy < 4 && <Img src={D("canette.jpg")} style={{ position: "absolute", left: -cx * 120, top: -cy * 130, width: 480, height: 435 }} />}
                </div>
              );
            })
          )}
          <Card x={lerp(1080, 560, split)} y={330} side="B" style={{ boxShadow: t >= T.tapB ? `0 0 ${60 + accepted * 40}px rgba(217,130,139,0.9)` : "none", transform: `scale(${1 + flash(T.tapB, 0.15) * 0.05})` }} />
          {/* cadre de sélection néon */}
          {t < T.shatter && <div style={{ position: "absolute", left: selX - 12, top: 318, width: 504, height: 804, borderRadius: 38, border: `6px solid ${selB ? NEON : "#9fb7ff"}`, boxShadow: `0 0 40px ${selB ? "rgba(217,130,139,0.8)" : "rgba(159,183,255,0.7)"}`, opacity: split }} />}
          {t > T.hoverA && t < 14.3 && <div style={{ position: "absolute", left: 40, top: 330, width: 480, height: 780, borderRadius: 30, background: "rgba(229,72,77,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 260, color: "#ff5a5f", fontWeight: 700 }}>✕</div>}
          {t >= T.tapB && <div style={{ position: "absolute", left: 560, top: 640, width: 480, textAlign: "center", fontSize: 50, fontWeight: 700, color: BG, transform: `rotate(-10deg) scale(${lerp(2.4, 1, accepted)})`, opacity: clamp(accepted * 2) }}><span style={{ background: `linear-gradient(135deg, ${PINK_L}, ${PINK})`, padding: "10px 22px", borderRadius: 14 }}>MISSION ACCEPTÉE</span></div>}
          <div style={{ position: "absolute", left: 560, top: 1130, width: 480, textAlign: "center", fontSize: 22, color: "rgba(255,255,255,0.55)", fontFamily: "Open Sans", opacity: split }}>* dans la limite de 30 lettres par semaine</div>
          {/* Yann + sous-titres */}
          {t >= T.yann && t < T.cursor + 0.6 && (
            <>
              <Img src={staticFile(`mascotte/${t < 8.6 ? "stress" : "sourire"}.png`)} style={{ position: "absolute", left: -30, bottom: -40, height: 640, transform: `translateY(${(1 - spr(T.yann, 260, 16)) * 700 + easeIn(seg(t, T.cursor, T.cursor + 0.6)) * 700}px)` }} />
              {[[5.4, 8.5, "Le stress des candidatures ? 1,99 €. Deux choix."], [8.6, 12.9, "Un soda… ou une semaine pour braquer ton prochain CDI."]].map(([a, b, txt]) => {
                const a0 = a as number, b0 = b as number;
                if (t < a0 || t > b0) return null;
                const k = spr(a0, 380, 20);
                return <div key={a0} style={{ position: "absolute", left: 380, right: 40, top: 1300, padding: "26px 30px", borderRadius: 30, background: "rgba(255,255,255,0.95)", color: BG, fontSize: 46, fontWeight: 700, lineHeight: 1.2, transform: `scale(${k})`, transformOrigin: "0% 100%", opacity: 1 - seg(t, b0 - 0.15, b0) }}>{txt as string}</div>;
              })}
            </>
          )}
          {/* le curseur MyMotiv : hésite sur A, choisit B */}
          {t >= T.cursor && t < T.tapB + 0.7 && (() => {
            const toA = easeInOut(seg(t, T.cursor, T.hoverA - 0.1)), toB = easeInOut(seg(t, 14.3, T.tapB - 0.22));
            const x = t < 14.3 ? lerp(1000, 280, toA) : lerp(280, 800, toB), y = t < 14.3 ? lerp(1800, 700, toA) : 700;
            const hover = clamp(seg(t, T.hoverA - 0.1, T.hoverA + 0.1) - seg(t, 14.2, 14.35) + seg(t, T.tapB - 0.4, T.tapB - 0.2));
            const out = seg(t, T.tapB + 0.4, T.tapB + 0.7);
            return <><Ripple x={800} y={700} t={t} t0={T.tapB} /><Pointer x={x + out * 260} y={y + out * 400} hover={clamp(hover)} press={clamp(1 - Math.abs(t - T.tapB) / 0.09)} o={1 - out} /></>;
          })()}
        </div>
      )}
      {flash(T.offer - 0.02, 0.1) > 0 && <div style={{ position: "absolute", inset: 0, background: PINK_L, opacity: flash(T.offer - 0.02, 0.1) }} />}

      {/* ═════ 4. HELLOWORK → MYMOTIV ═════ */}
      {offerOn && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, T.wheel - 0.1, T.wheel + 0.1) }}>
          {/* HelloWork : on copie le lien de l'offre */}
          {t < T.whip + 0.45 && (
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${-toSite * 1300}px)`, filter: toSite > 0 ? `blur(${Math.sin(toSite * Math.PI) * 16}px)` : undefined }}>
              <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 35%, rgba(217,130,139,0.25), ${BG} 65%)` }} />
              {/* éventail de cartes : les sites d'emploi distribués en arc, HelloWork posé au centre */}
              {BOARDS.map((b, i) => {
                const a = ((-39 + i * 13) * Math.PI) / 180, k = spr(T.offer + 0.12 + i * 0.07, 240, 17);
                const cx = 540 + Math.sin(a) * 700, cy = 1250 - Math.cos(a) * 700;
                return (
                  <div key={b} style={{ position: "absolute", left: lerp(540, cx, k) - 95, top: lerp(2150, cy, k) - 95, width: 190, height: 190, borderRadius: 24, background: "#fff", display: "flex", alignItems: "center", justifyContent: "flex-start", paddingLeft: 10, boxSizing: "border-box", transform: `rotate(${lerp(0, a, k)}rad)`, boxShadow: "0 18px 50px rgba(0,0,0,0.5)", opacity: clamp(k * 3) }}>
                    <Img src={D(`boards/${b}.png`)} style={{ maxWidth: 148, maxHeight: 120, objectFit: "contain" }} />
                  </div>
                );
              })}
              {(() => {
                const k = spr(T.offer + 0.75, 300, 14);
                return (
                  <div style={{ position: "absolute", left: 540 - 240, top: 905 - 135, width: 480, height: 270, borderRadius: 34, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${(1 - k) * 900}px) scale(${lerp(0.7, 1, k)})`, boxShadow: `0 30px 90px rgba(0,0,0,0.6), 0 0 0 6px ${PINK_L}, 0 0 60px rgba(217,130,139,0.7)` }}>
                    <Img src={D("boards/hellowork.png")} style={{ width: 400 }} />
                  </div>
                );
              })()}
              <Kin t={t} t0={T.offer + 0.35} t1={T.whip} y={150} size={74} fps={fps} words={[["Ton"], ["site"], ["d'emploi", true], ["préféré"]]} />
              {t >= T.pill && (
                <div style={{ position: "absolute", left: 120, top: 1150, width: 840, height: 130, borderRadius: 999, background: "rgba(11,10,11,0.85)", border: `3px solid ${PINK_L}`, color: "#fff", fontSize: 40, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, transform: `scale(${spr(T.pill, 340, 16) * (1 - flash(T.copy, 0.1) * 0.06)})` }}>🔗 le lien de l'offre qui te fait rêver</div>
              )}
              {t >= T.copy && <div style={{ position: "absolute", left: 540 - 170, top: 1320, width: 340, height: 100, borderRadius: 999, background: "#3ccf8e", color: "#fff", fontSize: 44, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${spr(T.copy + 0.05, 420, 14)})` }}>Copié ✓</div>}
              {/* le lien « s'envole » vers le site */}
              {t > T.copy + 0.3 && <div style={{ position: "absolute", left: 120 + easeIn(seg(t, T.copy + 0.3, T.whip)) * 900, top: 1150 - easeIn(seg(t, T.copy + 0.3, T.whip)) * 300, width: 840, height: 130, borderRadius: 999, border: `3px dashed ${PINK_L}`, opacity: 0.6 * (1 - seg(t, T.copy + 0.3, T.whip)) }} />}
              <Ripple x={700} y={1215} t={t} t0={T.copy} />
              <Pointer {...cursor(T.pill + 0.1, T.copy, 700, 1215)} />
            </div>
          )}
          {/* MyMotiv : on colle, « Lire l'offre », logo trouvé */}
          {t >= T.whip && (
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - toSite) * 1300}px)` }}>
              <Grid o={0.5} />
              <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: `translate(${540 - siteCam.x * siteCam.s}px, ${960 - siteCam.y * siteCam.s}px) scale(${siteCam.s})` }}>
                <Phone><Screen src={siteShot} />{t >= T.paste && t < T.paste + 0.5 && (() => { const [, uy] = [0, 428]; return <div style={{ position: "absolute", left: 92.5 * 0.7593, top: uy * 0.7593, width: 895 * 0.7593, height: 117 * 0.7593, borderRadius: 12, boxShadow: `0 0 0 6px ${PINK_L}, 0 0 40px ${PINK}`, opacity: 1 - seg(t, T.paste, T.paste + 0.5) }} />; })()}</Phone>
              </div>
              <Kin t={t} t0={T.paste - 0.1} t1={T.logo - 0.05} y={110} size={74} fps={fps} words={[["Tu"], ["le"], ["colles.", true]]} />
              <Kin t={t} t0={T.logo + 0.1} t1={T.wheel - 0.1} y={110} size={68} fps={fps} words={[["Et"], ["tu"], ["nous"], ["laisses"], ["faire.", true]]} />
              {t > T.paste + 0.2 && t < T.tapRead + 0.7 && (() => { const [bx, by] = projS(...sp(540, 623)); return <><Ripple x={bx} y={by} t={t} t0={T.tapRead} /><Pointer {...cursor(T.paste + 0.2, T.tapRead, bx, by)} /></>; })()}
              {t > T.logo + 0.5 && <div style={{ position: "absolute", left: 90, right: 90, top: 1560, padding: "18px 0", borderRadius: 26, background: "rgba(11,10,11,0.85)", textAlign: "center", fontSize: 50, fontWeight: 700, color: "#fff", textShadow: OUTLINE, transform: `scale(${spr(T.logo + 0.5, 360, 16)})` }}>✓ Logo de l'entreprise trouvé</div>}
            </div>
          )}
        </div>
      )}

      {/* ═════ 5. ROUE D'ARMES (ralenti) ═════ */}
      {wheelOn && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - wOut }}>
          {/* fond : la lettre, floutée et désaturée (ralenti) */}
          <Img src={SHOT("030-lettre")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, filter: "blur(18px) grayscale(0.8) brightness(0.45)", transform: `scale(${1.1 + seg(t, T.wheel, T.proof) * 0.1})` }} />
          <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 30%, rgba(0,0,0,0.75) 80%)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontSize: 34, fontWeight: 700, letterSpacing: 12, color: PINK_L, opacity: wIn }}>ARSENAL MYMOTIV</div>
          <div style={{ position: "absolute", left: 540 - 430, top: 980 - 430, width: 860, height: 860, transform: `scale(${wIn}) rotate(${(1 - wIn) * -60}deg)` }}>
            <svg width={860} height={860} viewBox="-430 -430 860 860" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
              {WEAPONS.map((w, i) => {
                const a0 = ((w.a - 58) * Math.PI) / 180, a1 = ((w.a + 58) * Math.PI) / 180, R = 410, r0 = 175;
                const p = (a: number, rr: number) => `${(rr * Math.cos(a)).toFixed(1)},${(rr * Math.sin(a)).toFixed(1)}`;
                const on = wSel === i;
                const pulse = on ? 1 + flash(selT[i] + 0.05, 0.2) * 0.06 : 1;
                return <path key={i} d={`M${p(a0, r0)} L${p(a0, R)} A${R},${R} 0 0 1 ${p(a1, R)} L${p(a1, r0)} A${r0},${r0} 0 0 0 ${p(a0, r0)} Z`} fill={on ? "rgba(217,130,139,0.85)" : "rgba(20,17,19,0.82)"} stroke={on ? PINK_L : "rgba(255,255,255,0.25)"} strokeWidth={on ? 8 : 3} transform={`scale(${pulse})`} style={{ filter: on ? "drop-shadow(0 0 24px rgba(217,130,139,0.9))" : undefined }} />;
              })}
              <circle r={160} fill="rgba(11,10,11,0.92)" stroke="rgba(255,255,255,0.2)" strokeWidth={3} />
            </svg>
            {WEAPONS.map((w, i) => {
              const a = (w.a * Math.PI) / 180, cx = 430 + Math.cos(a) * 292, cy = 430 + Math.sin(a) * 292;
              return <div key={i} style={{ position: "absolute", left: cx - 90, top: cy - 70, width: 180, textAlign: "center", fontSize: 92, transform: `rotate(${-(1 - wIn) * -60}deg)` }}>{w.icon}<div style={{ fontSize: 40, fontWeight: 700, color: "#fff", marginTop: -10 }}>{w.n}</div></div>;
            })}
            {/* centre : l'arme choisie */}
            {wSel >= 0 && <div style={{ position: "absolute", left: 430 - 150, top: 430 - 150, width: 300, height: 300, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", color: PINK_L, fontSize: 120, fontWeight: 700, transform: `scale(${spr(selT[wSel], 400, 15)})` }}>{WEAPONS[wSel].n}</div>}
          </div>
          {/* titre de l'arme (arrêt sur image : flash + secousse) */}
          {wSel >= 0 && (() => {
            const w = WEAPONS[wSel], k = spr(selT[wSel] + 0.05, 340, 16);
            return (
              <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", transform: `translateX(${shake(selT[wSel], 14, 0.3)}px) scale(${lerp(1.4, 1, k)})`, opacity: clamp(k * 2) }}>
                <div style={{ fontSize: 80, fontWeight: 700, color: "#fff", textShadow: OUTLINE }}>{w.title}</div>
                <div style={{ fontSize: 42, fontWeight: 600, color: PINK_L }}>{w.sub}</div>
              </div>
            );
          })()}
          {selT.map((s0) => flash(s0, 0.08) > 0 && <div key={s0} style={{ position: "absolute", inset: 0, background: "#fff", opacity: flash(s0, 0.08) * 0.5 }} />)}
          {/* le curseur pointe chaque arme */}
          {(() => {
            const pts = WEAPONS.map((w) => { const a = (w.a * Math.PI) / 180; return [540 + Math.cos(a) * 292, 980 + Math.sin(a) * 292]; });
            let x = 1000, y = 1800;
            selT.forEach((s0, i) => { const k = easeInOut(seg(t, s0 - 0.7, s0 - 0.1)); if (t >= s0 - 0.7) { x = lerp(i === 0 ? 1000 : pts[i - 1][0], pts[i][0], k); y = lerp(i === 0 ? 1800 : pts[i - 1][1], pts[i][1], k); } });
            const hover = clamp(selT.reduce((m, s0) => Math.max(m, seg(t, s0 - 0.3, s0 - 0.1) - seg(t, s0 + 0.5, s0 + 0.8)), 0));
            const press = clamp(selT.reduce((m, s0) => Math.max(m, 1 - Math.abs(t - s0) / 0.09), 0));
            return <Pointer x={x} y={y} hover={hover} press={press} o={clamp(seg(t, T.wheel + 0.2, T.wheel + 0.4)) * (1 - wOut)} />;
          })()}
        </div>
      )}

      {/* ═════ 6. CHARGEMENT : LES PREUVES ═════ */}
      {proofOn && (
        <div style={{ position: "absolute", inset: 0, opacity: clamp(seg(t, T.proof - 0.05, T.proof + 0.3)) * (1 - seg(t, T.passed, T.passed + 0.4)) }}>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(160deg, #2a1418 0%, ${BG} 55%, #1a0f12 100%)` }} />
          <Img src={staticFile("mascotte/pied.png")} style={{ position: "absolute", right: -120, top: 260, height: 1450, transform: `translateX(${(1 - easeOut(seg(t, T.proof, T.proof + 0.8))) * 500}px)`, opacity: 0.95 }} />
          <div style={{ position: "absolute", left: 60, top: 300, fontSize: 120, fontWeight: 700, lineHeight: 0.95, color: "#fff", textShadow: OUTLINE, transform: `translateX(${(1 - easeOut(seg(t, T.proof, T.proof + 0.6))) * -400}px)` }}>LES<br /><span style={{ color: PINK_L }}>MOTIVÉS</span></div>
          {/* gros compteur 7/11 */}
          {t >= T.tip2 && (
            <div style={{ position: "absolute", left: 60, top: 640, transform: `scale(${spr(T.tip2 + 0.2, 300, 13)})`, transformOrigin: "0 50%" }}>
              <div style={{ fontSize: 230, fontWeight: 700, color: PINK_L, lineHeight: 1, textShadow: "0 0 60px rgba(217,130,139,0.7)" }}>{seven}<span style={{ fontSize: 120, color: "#fff" }}>/11</span></div>
              <div style={{ fontSize: 48, fontWeight: 700, color: "#fff" }}>candidatures → entretiens</div>
            </div>
          )}
          {/* astuces en bas, façon écran de chargement */}
          <div style={{ position: "absolute", left: 40, right: 40, bottom: 260, padding: "28px 34px", borderRadius: 24, background: "rgba(0,0,0,0.65)", border: "2px solid rgba(255,255,255,0.12)" }}>
            {t < T.tip2 ? (
              <div style={{ color: "#fff", fontSize: 38, lineHeight: 1.3, opacity: seg(t, T.proof + 0.4, T.proof + 0.7) }}><b style={{ color: PINK_L }}>ASTUCE</b> · Une lettre sur-mesure ≈ 30 secondes <span style={{ color: "rgba(255,255,255,0.6)" }}>(temps mesuré sur MyMotiv)</span></div>
            ) : (
              <div style={{ color: "#fff", fontSize: 38, lineHeight: 1.3, opacity: seg(t, T.tip2, T.tip2 + 0.3) }}><b style={{ color: PINK_L }}>TÉMOIGNAGE RÉEL</b> · Léni S. : 11 candidatures, 7 entretiens.<div style={{ fontSize: 26, color: "rgba(255,255,255,0.6)", marginTop: 6 }}>Résultats individuels non garantis.</div></div>
            )}
          </div>
          <div style={{ position: "absolute", left: 40, right: 40, bottom: 190, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
            <div style={{ width: `${load * 100}%`, height: "100%", background: `linear-gradient(90deg, ${PINK}, ${PINK_L})` }} />
          </div>
          <div style={{ position: "absolute", right: 44, bottom: 130, color: "rgba(255,255,255,0.7)", fontSize: 30, fontWeight: 600 }}>Chargement… {Math.round(load * 100)} %</div>
        </div>
      )}

      {/* ═════ 7. MISSION PASSED + APPEL À L'ACTION ═════ */}
      {passedOn && (
        <>
          <Img src={SHOT("030-lettre")} style={{ position: "absolute", inset: 0, width: 1080, height: 1920, filter: `blur(${lerp(0, 14, seg(t, T.passed, T.passed + 0.6))}px) grayscale(${lerp(0, 1, seg(t, T.passed, T.passed + 0.6))}) brightness(0.5)`, transform: `scale(${1 + seg(t, T.passed, T.total) * 0.12})`, opacity: 1 - ctaK * 0.85 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: lerp(760, 250, ctaK), textAlign: "center", transform: `scale(${lerp(2.2, 1, mp) * lerp(1, 0.62, ctaK)})` }}>
            <div style={{ fontSize: 132, fontWeight: 700, fontStyle: "italic", letterSpacing: lerp(30, 2, mp), background: GOLD, WebkitBackgroundClip: "text", color: "transparent", filter: "drop-shadow(0 6px 0 #3a2400) drop-shadow(0 0 30px rgba(247,201,72,0.6))", opacity: clamp(mp * 2) }}>MISSION PASSED</div>
            <div style={{ fontSize: 76, fontWeight: 700, color: "#fff", textShadow: OUTLINE, opacity: clamp(resp * 2), transform: `scale(${resp})` }}>RESPECT <span style={{ color: PINK_L }}>+</span></div>
          </div>
          {flash(T.passed + 0.3, 0.1) > 0 && <div style={{ position: "absolute", inset: 0, background: "#fff7d6", opacity: flash(T.passed + 0.3, 0.1) * 0.7 }} />}
          {t >= T.cta && (
            <div style={{ position: "absolute", inset: 0, opacity: ctaK }}>
              <div style={{ position: "absolute", left: 140, top: 700, width: 800, height: 190, borderRadius: 34, background: "rgba(255,255,255,0.08)", border: `3px solid ${PINK_L}`, display: "flex", alignItems: "center", justifyContent: "center", gap: 24, transform: `scale(${spr(T.cta + 0.2, 300, 15)})`, boxShadow: "0 0 60px rgba(217,130,139,0.5)" }}>
                <div style={{ fontSize: 46, fontWeight: 700, color: "#fff" }}>1 semaine MyMotiv</div>
                <div style={{ fontSize: 76, fontWeight: 700, color: PINK_L }}>1,99 €</div>
              </div>
              <div style={{ position: "absolute", left: 540 - 380, top: 950, width: 760, height: 110, borderRadius: 999, background: PINK_L, color: BG, fontSize: 42, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${spr(T.cta + 0.6, 300, 15)})` }}>🔗 tinyurl.com/try-mymotiv</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 1090 - Math.abs(Math.sin(t * 5)) * 26, textAlign: "center", fontSize: 60, fontWeight: 700, color: PINK_L, opacity: seg(t, T.cta + 0.9, T.cta + 1.2) }}>↑ Lien en bio ↑</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontSize: 44, fontWeight: 600, color: "#fff", opacity: seg(t, T.cta + 1.4, T.cta + 1.8) }}>Rejoins <b style={{ color: PINK_L }}>Les Motivés</b>.</div>
              <Kin t={t} t0={T.cta + 2.1} t1={T.total + 1} y={1340} size={58} fps={fps} words={[["Soda"], ["🥤"], ["ou"], ["CDI", true], ["🚀"], ["?"], ["Dis-le"], ["en"], ["commentaire"], ["👇"]]} />
              <Img src={staticFile("mascotte/rire.png")} style={{ position: "absolute", right: -40, bottom: -40, height: 470, transform: `translateY(${(1 - spr(T.cta + 0.4, 260, 15)) * 600}px)` }} />
            </div>
          )}
          <Confetti t={t} t0={T.passed + 0.3} />
        </>
      )}

      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
