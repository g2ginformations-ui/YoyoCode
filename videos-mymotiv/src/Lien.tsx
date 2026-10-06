// « Le lien dans ma bio » (35 s, 60 i/s, TikTok 9:16) — POV : on clique sur le profil @oroserpente92z, puis sur le lien de la bio,
// on traverse l'écran (« pass through ») et on arrive sur le VRAI site MyMotiv (captures du site) :
// 2 chemins en écran partagé (« split screen ») → 3 étapes (CV une fois, l'offre, Générer) → chrono accéléré (« speed ramp »,
// ≈ 30 s réels) → la lettre avec le logo (arrêt sur image) → Yann Motiveur postule → raccord (« match cut ») ✓ → soleil →
// jour/nuit en balayage par fentes (« slit scan ») → le lendemain : appel manqué + e-mail d'entretien → appel à l'action.
// Effets inspirés du vocabulaire EyeCannndy : iris, poussée de caméra, pass through, aberration chromatique, whip pan,
// split screen, speed ramp, freeze frame, match cut, slit scan, typographie cinétique, flash, tremblement d'impact.
import React, { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BG, PINK, PINK_L, clamp, easeIn, easeInOut, easeOut, easeOutBack, lerp, rng, seg } from "./common";
import "./fonts";

// Téléphone : position de l'écran dans l'image (les captures du site font 1080×1920, celle du profil 923×2000).
export const SX = 130, SY = 290, SW = 820, SH = 1458, K = SW / 1080, KP = SW / 923;
export const sp = (x: number, y: number): [number, number] => [SX + x * K, SY + y * K]; // point d'une capture du site → écran
const pp = (x: number, y: number): [number, number] => [SX + x * KP, SY + y * KP]; // point de la capture du profil → écran
const AVATAR = pp(773, 378), LINK = pp(267, 647);
// Points touchés par la main : bas de la photo de profil, fin du lien (la main déborde vers le bas à droite, le reste reste lisible).
const AV_TAP: [number, number] = [630, 1000], LINK_TAP = pp(470, 652);

// Temps clés (s)
const T = {
  tapAv: 0.62, iris: 0.66, push: 1.2, tapLink: 2.6, pass: 2.75, flash: 3.42, site: 3.5,
  split: 4.75, scrollUp: 5.25, tapCta: 6.75, whip: 8.25,
  s1: 8.9, tapCv: 9.65, cvOk: 10.15, s2: 11.0, type0: 11.45, type1: 12.55, tapRead: 12.75, read: 12.95, logo: 13.45,
  s3: 14.2, tapGen: 14.85, ramp: 15.6, rampEnd: 18.2, letter: 18.35,
  yann: 19.8, send: 21.35, sent: 21.9, match: 23.15, night: 23.45, morning: 25.9,
  notif: 26.0, call: 26.6, mail: 27.45, react: 28.7, laugh: 29.6,
  end: 31.3, total: 35,
};

export const SHOT = (n: string) => staticFile(`shots2/${n}.png`);
const TYPING = ["007-offre-lien", "008-offre-lien", "009-offre-lien", "010-offre-lien", "011-offre-lien", "012-offre-lien", "013-offre-lien", "014-offre-lien", "015-offre-lien", "016-offre-lien"];
const GEN = ["020-generation", "021-generation", "022-generation", "023-generation", "024-generation", "025-generation", "026-generation", "027-generation", "028-generation", "029-generation"];

// Contour sombre du texte : lisible sur fond blanc (profil, lettre) comme sur fond noir.
export const OUTLINE = [[-4, 0], [4, 0], [0, -4], [0, 4], [-3, -3], [3, -3], [-3, 3], [3, 3], [0, 8]].map(([x, y]) => `${x}px ${y}px 0 ${BG}`).join(", ") + ", 0 0 30px rgba(0,0,0,0.6)";

// ───────── petits éléments ─────────
// Main (photo fournie, détourée, retournée en main droite) : le bout du doigt le plus haut appuie en (x, y).
const HW = 720, HK = HW / 995, HOT: [number, number] = [179 * HK, 45 * HK];
const PhotoHand: React.FC<{ x: number; y: number; press: number; o?: number; rot?: number }> = ({ x, y, press, o = 1, rot = -6 }) => (
  <Img src={staticFile("mains/main-photo.png")} style={{ position: "absolute", left: x - HOT[0], top: y - HOT[1], width: HW, height: 1049 * HK, opacity: o, transformOrigin: `${HOT[0]}px ${HOT[1]}px`, transform: `rotate(${rot}deg) scale(${1 - press * 0.05})`, filter: `drop-shadow(${lerp(34, 12, press)}px ${lerp(44, 16, press)}px ${lerp(40, 16, press)}px rgba(0,0,0,0.55))` }} />
);

// Curseurs MyMotiv (fournis) : flèche néon « mm. » par défaut, viseur au survol d'un bouton.
// Point actif : la pointe de la flèche (en haut à gauche, comme une vraie souris), le centre du viseur.
// La flèche est le dessin d'origine retourné horizontalement (x → 630 − x).
const AW = 170, AS = AW / 510, ATIP: [number, number] = [(90 - 60) * AS, (100 - 70) * AS];
const ARROW = "M90,100 L530,320 L389.6,360.9 L544.6,512.9 A38,38 0 0 1 491.4,567.1 L336.4,415.1 L285,555 Z";
export const RW = 205, NEON = "#E58A94";
const arcPath = (a0: number, a1: number, r = 200) => {
  const p = (a: number) => `${(r * Math.cos((a * Math.PI) / 180)).toFixed(1)},${(r * Math.sin((a * Math.PI) / 180)).toFixed(1)}`;
  return `M${p(a0)} A${r},${r} 0 0 1 ${p(a1)}`;
};
export const Pointer: React.FC<{ x: number; y: number; hover: number; press: number; o?: number }> = ({ x, y, hover: h, press, o = 1 }) => {
  if (o <= 0) return null;
  const glow = "drop-shadow(0 0 10px rgba(217,130,139,0.95)) drop-shadow(0 0 26px rgba(217,130,139,0.5))";
  const br = lerp(330, 235, h) - press * 40; // les coins du viseur se resserrent au survol et au clic
  return (
    <>
      {h < 1 && (
        <svg width={AW} height={540 * AS} viewBox="60 70 510 540" style={{ position: "absolute", left: x - ATIP[0], top: y - ATIP[1], opacity: o * (1 - h), transformOrigin: `${ATIP[0]}px ${ATIP[1]}px`, transform: `scale(${(1 - h * 0.5) * (1 - press * 0.15)})`, filter: glow, overflow: "visible" }}>
          <defs>
            <linearGradient id="mmArrow" x1="0.8" y1="0.2" x2="0.38" y2="0.62">
              <stop offset="0.5" stopColor="#3a3940" />
              <stop offset="0.5" stopColor="#1d1c21" />
            </linearGradient>
          </defs>
          <path d={ARROW} fill="none" stroke={NEON} strokeWidth={22} strokeLinejoin="round" />
          <path d={ARROW} fill="none" stroke="#141215" strokeWidth={12} strokeLinejoin="round" />
          <path d={ARROW} fill="none" stroke={NEON} strokeWidth={5} strokeLinejoin="round" />
          <path d={ARROW} fill="url(#mmArrow)" />
          <text transform="translate(452,482) rotate(44)" fontFamily="Poppins" fontWeight={700} fontSize={36} fill={NEON}>mm.</text>
        </svg>
      )}
      {h > 0 && (
        <svg width={RW} height={RW} viewBox="-260 -260 520 520" style={{ position: "absolute", left: x - RW / 2, top: y - RW / 2, opacity: o * h, transform: `rotate(${(1 - h) * 90}deg) scale(${lerp(1.7, 1, h) * (1 - press * 0.2)})`, filter: glow, overflow: "visible" }}>
          {[[4, 86], [94, 176], [184, 266], [274, 356]].map(([a0, a1]) => <path key={a0} d={arcPath(a0, a1)} fill="none" stroke={NEON} strokeWidth={26} />)}
          <circle r={24 + press * 12} fill={NEON} />
          {[[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dx, dy], i) => <line key={i} x1={dx * 44} y1={dy * 44} x2={dx * 84} y2={dy * 84} stroke={NEON} strokeWidth={7} />)}
          {[[1, 1], [-1, 1], [1, -1], [-1, -1]].map(([sx, sy], i) => <path key={i} d={`M${sx * br},${sy * (br - 40)} L${sx * br},${sy * br} L${sx * (br - 40)},${sy * br}`} fill="none" stroke={NEON} strokeWidth={7} />)}
        </svg>
      )}
    </>
  );
};

export const Ripple: React.FC<{ x: number; y: number; t: number; t0: number; color?: string }> = ({ x, y, t, t0, color = PINK_L }) => {
  if (t < t0 || t > t0 + 0.7) return null;
  return (
    <>
      {[0, 0.12].map((d) => {
        const k = seg(t, t0 + d, t0 + d + 0.55);
        if (k <= 0 || k >= 1) return null;
        const r = lerp(10, 120, easeOut(k));
        return <div key={d} style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, borderRadius: "50%", border: `${lerp(10, 2, k)}px solid ${color}`, opacity: 1 - k }} />;
      })}
    </>
  );
};

// Typographie cinétique : chaque mot arrive avec un ressort ; [mot, rose?]
export const Kin: React.FC<{ t: number; t0: number; t1: number; y: number; size: number; words: [string, boolean?][]; fps: number; align?: "center" | "left" }> = ({ t, t0, t1, y, size, words, fps }) => {
  if (t < t0 || t > t1 + 0.25) return null;
  const out = seg(t, t1, t1 + 0.25);
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: y, display: "flex", flexWrap: "wrap", justifyContent: "center", columnGap: size * 0.28, rowGap: size * 0.05, opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
      {words.map(([w, pink], i) => {
        const s = spring({ frame: Math.max(0, (t - t0 - i * 0.07) * fps), fps, config: { stiffness: 320, damping: 18 } });
        return (
          <span key={i} style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: size, lineHeight: 1.12, color: pink ? BG : "#fff", background: pink ? `linear-gradient(135deg, ${PINK_L}, ${PINK})` : "none", padding: pink ? `0 ${size * 0.18}px` : 0, borderRadius: size * 0.16, transform: `translateY(${(1 - s) * 60}px) scale(${lerp(0.6, 1, s)}) rotate(${(1 - s) * (i % 2 ? 6 : -6)}deg)`, opacity: clamp(s * 1.5), textShadow: pink ? "none" : OUTLINE, display: "inline-block" }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Phone: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ position: "absolute", left: SX - 18, top: SY - 18, width: SW + 36, height: SH + 36, borderRadius: 92, background: "#151214", boxShadow: "0 40px 120px rgba(0,0,0,0.7), inset 0 0 0 3px rgba(255,255,255,0.08)", ...style }}>
    <div style={{ position: "absolute", left: 18, top: 18, width: SW, height: SH, borderRadius: 76, overflow: "hidden", background: "#0e0c0d" }}>{children}</div>
    <div style={{ position: "absolute", left: (SW + 36) / 2 - 110, top: 34, width: 220, height: 56, borderRadius: 30, background: "#000" }} />
  </div>
);

// Capture du site plein écran du téléphone
export const Screen: React.FC<{ src: string; o?: number; y?: number }> = ({ src, o = 1, y = 0 }) => (
  <Img src={SHOT(src)} style={{ position: "absolute", left: 0, top: -y * K, width: SW, height: 1920 * K, opacity: o }} />
);

// Ciel jour/nuit en « slit scan » : chaque bande verticale vit avec un léger décalage de temps.
const SlitSky: React.FC<{ q: number }> = ({ q }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!.getContext("2d")!;
    const W = 1080, H = 1920, band = 8;
    const stars = (() => { const r = rng(7); return Array.from({ length: 140 }, () => [r() * W, r() * H * 0.75, r() * 2.4 + 0.8, r()]); })();
    const keys: [number, string, string][] = [[0, "#ff9a6b", "#5b2a4d"], [0.3, "#1b1640", "#07060e"], [0.62, "#121a3e", "#05050c"], [0.8, "#f6b28d", "#6f6aa8"], [1, "#9fd3ff", "#e9f4ff"]];
    const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const col = (tau: number, top: boolean) => {
      let i = 0; while (i < keys.length - 2 && tau > keys[i + 1][0]) i++;
      const [a0, t0, b0] = keys[i], [a1, t1, b1] = keys[i + 1], k = clamp((tau - a0) / (a1 - a0));
      const A = hex(top ? t0 : b0), B = hex(top ? t1 : b1);
      return `rgb(${A.map((v, j) => Math.round(lerp(v, B[j], k))).join(",")})`;
    };
    for (let x = 0; x < W; x += band) {
      const tau = clamp(q * 1.25 - (x / W) * 0.25);
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, col(tau, true)); g.addColorStop(1, col(tau, false));
      c.save(); c.beginPath(); c.rect(x, 0, band + 0.5, H); c.clip();
      c.fillStyle = g; c.fillRect(x, 0, band, H);
      const night = clamp(1 - Math.abs(tau - 0.46) / 0.22);
      for (const [sx, sy, sr, ph] of stars) if (sx >= x - 4 && sx < x + band + 4) { c.globalAlpha = night * (0.5 + 0.5 * Math.sin(ph * 20 + q * 30)); c.fillStyle = "#fff"; c.beginPath(); c.arc(sx, sy, sr, 0, 7); c.fill(); }
      c.globalAlpha = 1;
      // soleil couchant → lune → soleil levant
      const sun1 = seg(tau, 0, 0.32), moon = seg(tau, 0.22, 0.72), sun2 = seg(tau, 0.68, 1);
      if (sun1 < 1) { const sy = lerp(900, 2150, easeIn(sun1)), sx = lerp(540, 470, sun1); const g2 = c.createRadialGradient(sx, sy, 0, sx, sy, 330); g2.addColorStop(0, "rgba(255,190,120,0.9)"); g2.addColorStop(1, "rgba(255,120,90,0)"); c.fillStyle = g2; c.fillRect(x, 0, band, H); c.fillStyle = "#ffd9a0"; c.beginPath(); c.arc(sx, sy, 110, 0, 7); c.fill(); }
      if (moon > 0 && moon < 1) { const my = 2150 - Math.sin(moon * Math.PI) * 1650, mx = lerp(260, 820, moon); c.fillStyle = "#f4f1e6"; c.beginPath(); c.arc(mx, my, 80, 0, 7); c.fill(); c.fillStyle = col(tau, true); c.beginPath(); c.arc(mx + 34, my - 18, 72, 0, 7); c.fill(); }
      if (sun2 > 0) { const sy = lerp(2150, 560, easeOut(sun2)), sx = lerp(300, 360, sun2); const g3 = c.createRadialGradient(sx, sy, 0, sx, sy, 380); g3.addColorStop(0, "rgba(255,240,200,0.95)"); g3.addColorStop(1, "rgba(255,220,160,0)"); c.fillStyle = g3; c.fillRect(x, 0, band, H); c.fillStyle = "#fff4d6"; c.beginPath(); c.arc(sx, sy, 105, 0, 7); c.fill(); }
      c.restore();
    }
    // horizon : silhouette de ville
    c.fillStyle = `rgba(10,8,14,${lerp(0.9, 0.55, seg(q, 0.75, 1))})`;
    const r = rng(3); let bx = 0; while (bx < W) { const bw = 60 + r() * 120, bh = 160 + r() * 380; c.fillRect(bx, H - bh, bw - 6, bh); bx += bw; }
  });
  return <canvas ref={ref} width={1080} height={1920} style={{ position: "absolute", inset: 0 }} />;
};

// Confettis roses
export const Confetti: React.FC<{ t: number; t0: number }> = ({ t, t0 }) => {
  if (t < t0) return null;
  const r = rng(11), d = t - t0;
  return (
    <>
      {Array.from({ length: 60 }, (_, i) => {
        const a = r() * Math.PI * 2, v = 600 + r() * 900, x = 540 + Math.cos(a) * v * d, y = 1100 + Math.sin(a) * v * d + 900 * d * d, rot = r() * 720 * d;
        const c = [PINK, PINK_L, "#fff", "#ffd27a"][i % 4];
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 18, height: 30, background: c, transform: `rotate(${rot}deg)`, opacity: clamp(1.6 - d) }} />;
      })}
    </>
  );
};

export const Lien: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const spr = (t0: number, stiffness = 300, damping = 20) => spring({ frame: Math.max(0, (t - t0) * fps), fps, config: { stiffness, damping } });
  // curseur : arrive vers la cible, passe en viseur juste avant le clic, clique, redevient flèche et repart
  const cursor = (t0: number, tap: number, tx: number, ty: number, fx = 1000, fy = 1750) => {
    const k = easeInOut(seg(t, t0, tap - 0.25)), out = easeIn(seg(t, tap + 0.3, tap + 0.65));
    return {
      x: lerp(fx, tx, k) + out * 260, y: lerp(fy, ty, k) + out * 420,
      hover: clamp(seg(t, tap - 0.42, tap - 0.2) - seg(t, tap + 0.18, tap + 0.34)),
      press: clamp(1 - Math.abs(t - tap) / 0.09),
      o: clamp(seg(t, t0, t0 + 0.15)) * (1 - seg(t, tap + 0.45, tap + 0.65)),
    };
  };
  const shake = (t0: number, amp = 18, d = 0.35) => { const k = seg(t, t0, t0 + d); return k > 0 && k < 1 ? Math.sin(t * 90) * amp * (1 - k) : 0; };

  // ── fond : noir du site avec une lueur rose qui respire
  const glowY = 960 + Math.sin(t * 0.9) * 180;

  // ═════════ 1. Profil → lien de la bio → on traverse l'écran ═════════
  const scene1 = t < T.site + 0.1;
  const iris = easeInOut(seg(t, T.iris, T.iris + 0.55));
  const push = easeInOut(seg(t, T.push, T.tapLink));
  const pass = easeIn(seg(t, T.pass, T.flash + 0.05));
  // caméra : poussée vers la bio, puis plongée dans le lien
  const camS = lerp(1, 1.45, push) * lerp(1, 16, pass);
  const fx = lerp(540, LINK[0] + 40, push), fy = lerp(960, LINK[1], push);
  const cam = `translate(${540 - fx * camS + shake(T.tapLink, 10, 0.25)}px, ${960 - fy * camS}px) scale(${camS})`;
  const proj = (x: number, y: number): [number, number] => [540 - fx * camS + x * camS, 960 - fy * camS + y * camS];
  const linkOnScreen = proj(LINK[0], LINK[1]);
  const ca = lerp(0, 22, pass) + (t > T.tapLink && t < T.tapLink + 0.2 ? 8 : 0); // aberration chromatique

  // main : arrive sur l'avatar, tape, repart vers le lien, tape
  let hx = 1150, hy = 2100, press = 0;
  const h1 = easeOut(seg(t, 0.05, 0.5)), h2 = easeInOut(seg(t, 1.75, 2.45)), h3 = easeIn(seg(t, 2.8, 3.1));
  const avatarScreen = AV_TAP;
  const linkTapOnScreen = proj(LINK_TAP[0], LINK_TAP[1]);
  hx = lerp(1150, avatarScreen[0], h1); hy = lerp(2100, avatarScreen[1], h1);
  if (t > 0.75) { hx = lerp(avatarScreen[0], 980, easeIn(seg(t, 0.75, 1.1))); hy = lerp(avatarScreen[1], 2000, easeIn(seg(t, 0.75, 1.1))); }
  if (t > 1.75) { hx = lerp(980, linkTapOnScreen[0], h2); hy = lerp(2000, linkTapOnScreen[1], h2); }
  if (t > 2.8) { hx = linkTapOnScreen[0] + h3 * 500; hy = linkTapOnScreen[1] + h3 * 1200; }
  press = Math.max(clamp(1 - Math.abs(t - T.tapAv) / 0.09), clamp(1 - Math.abs(t - T.tapLink) / 0.09));
  const flash = clamp(1 - Math.abs(t - T.flash) / 0.12);

  // ═════════ 2. Le site, puis les 2 chemins en écran partagé ═════════
  const siteIn = easeOut(seg(t, T.site - 0.1, T.site + 0.5));
  const scene2 = t >= T.site - 0.1 && t < T.s1 + 0.1;
  const splitK = easeInOut(seg(t, T.split, T.split + 0.45));
  const whipK = easeIn(seg(t, T.whip, T.s1));
  const scroll = easeInOut(seg(t, T.scrollUp, T.scrollUp + 1.1)); // on remonte la page
  const ACC_TOOL = 2041; // position de l'outil dans la capture de la page entière (px)

  // ═════════ 3. Les 3 étapes ═════════
  const stepShot = (): string => {
    if (t < T.cvOk) return "004-cv-vide";
    if (t < T.s2) return "005-cv-ajoute";
    if (t < T.type0) return "006-offre-vide";
    if (t < T.type1) return TYPING[Math.min(TYPING.length - 1, Math.floor(seg(t, T.type0, T.type1) * TYPING.length))];
    if (t < T.read) return "016-offre-lien";
    if (t < T.logo) return "017-offre-lue";
    if (t < T.s3) return "018-entreprise";
    if (t < T.tapGen + 0.08) return "019-avant-generer";
    return GEN[Math.min(GEN.length - 1, Math.floor(seg(t, T.tapGen, T.rampEnd) * GEN.length))];
  };
  const scene3 = t >= T.s1 - 0.05 && t < T.letter + 1.6;
  // whip pan entre les étapes
  const whipAt = (t0: number) => { const k = seg(t, t0 - 0.12, t0 + 0.12); return k > 0 && k < 1 ? Math.sin(k * Math.PI) : 0; };
  const whip = Math.max(whipAt(T.s2), whipAt(T.s3));
  const stepCam = (() => {
    // poussée légère sur la zone utile de chaque étape
    if (t < T.s2) return { s: lerp(1, 1.12, easeOut(seg(t, T.s1, T.s2))), y: 830 };
    if (t < T.logo) return { s: 1.1, y: 700 };
    if (t < T.s3) return { s: lerp(1.1, 1.45, easeInOut(seg(t, T.logo, T.logo + 0.4))), y: 1100, x: 420 };
    return { s: lerp(1.15, 1.05, seg(t, T.s3, T.ramp)), y: 1018 };
  })();
  const cam3 = `translate(${540 - (stepCam.x ?? 540) * stepCam.s + whip * -260}px, ${960 - stepCam.y * stepCam.s}px) scale(${stepCam.s})`;
  const proj3 = (x: number, y: number): [number, number] => [540 - (stepCam.x ?? 540) * stepCam.s + x * stepCam.s, 960 - stepCam.y * stepCam.s + y * stepCam.s];

  // chrono accéléré (≈ 30 s réels)
  const rampK = seg(t, T.ramp, T.rampEnd);
  const secs = 30 * (rampK < 0.5 ? 2 * rampK * rampK * (1.2 - 0.4 * rampK) : 1 - Math.pow(-2 * rampK + 2, 2.4) / 2);
  const chronoOn = t >= T.ramp - 0.1 && t < T.letter + 0.15;
  const letterK = easeOut(seg(t, T.letter, T.letter + 0.3));

  // ═════════ 4. Yann postule ═════════
  const scene4 = t >= T.yann - 0.1 && t < T.night + 0.2;
  const yIn = spr(T.yann + 0.15, 260, 16);
  const fold = easeInOut(seg(t, T.send, T.send + 0.35));
  const fly = easeIn(seg(t, T.send + 0.35, T.sent + 0.3));
  const sentK = spr(T.sent + 0.15, 300, 14);
  const toSun = easeInOut(seg(t, T.match, T.night + 0.05));

  // ═════════ 5. Jour / nuit ═════════
  const q = seg(t, T.night, T.morning);
  const clockMin = Math.round(lerp(18 * 60 + 42, (24 + 9) * 60 + 4, easeInOut(q)));
  const hh = String(Math.floor(clockMin / 60) % 24).padStart(2, "0"), mm = String(clockMin % 60).padStart(2, "0");

  // ═════════ 6. Le lendemain : appel manqué + e-mail ═════════
  const scene6 = t >= T.notif - 0.05 && t < T.end + 0.2;
  const phoneUp = easeOutBack(seg(t, T.notif, T.notif + 0.55));
  const callK = spr(T.call, 380, 16), mailK = spr(T.mail, 380, 18);
  const pushMail = easeInOut(seg(t, T.mail + 0.6, T.react));

  // ═════════ 7. Fin ═════════
  const endK = seg(t, T.end, T.end + 0.4);
  const story = t >= T.yann && t < T.end;

  return (
    <AbsoluteFill style={{ background: BG, overflow: "hidden", fontFamily: "Poppins" }}>
      <div style={{ position: "absolute", left: 540 - 800, top: glowY - 800, width: 1600, height: 1600, borderRadius: "50%", background: "radial-gradient(circle, rgba(217,130,139,0.28), rgba(11,10,11,0) 62%)" }} />

      {/* ═════ 1 ═════ */}
      {scene1 && (
        <>
          {/* avatar au départ (avant l'iris) */}
          {t < T.iris + 0.4 && (
            <div style={{ position: "absolute", left: 540 - 200, top: 900 - 200, width: 400, height: 400, transform: `scale(${spr(0, 200, 14) * (1 - press * 0.08)})`, opacity: 1 - seg(t, T.iris + 0.15, T.iris + 0.4) }}>
              {[0, 1].map((i) => { const k = ((t * 0.9 + i * 0.5) % 1); return <div key={i} style={{ position: "absolute", inset: -k * 90, borderRadius: "50%", border: `6px solid ${PINK}`, opacity: 1 - k }} />; })}
              <div style={{ position: "absolute", inset: -14, borderRadius: "50%", background: `conic-gradient(${PINK_L}, ${PINK}, #ffd27a, ${PINK_L})`, transform: `rotate(${t * 120}deg)` }} />
              <Img src={SHOT("avatar")} style={{ position: "absolute", inset: 0, width: 400, height: 400, borderRadius: "50%", border: `10px solid ${BG}` }} />
            </div>
          )}
          {/* le profil, révélé par un iris qui part de l'avatar */}
          <div style={{ position: "absolute", inset: 0, clipPath: `circle(${lerp(0, 2300, iris)}px at 540px 900px)` }}>
            <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: cam, filter: ca ? `drop-shadow(${ca}px 0 0 rgba(255,0,90,0.55)) drop-shadow(${-ca}px 0 0 rgba(0,210,255,0.55))` : undefined }}>
              <Phone>
                <Img src={SHOT("profil")} style={{ position: "absolute", left: 0, top: 0, width: SW, height: 2000 * KP }} />
                {/* surbrillance du lien */}
                {t > 1.6 && <div style={{ position: "absolute", left: 38 * KP - 10, top: 647 * KP - 30, width: 470 * KP, height: 60, borderRadius: 14, background: "rgba(217,130,139,0.25)", boxShadow: `0 0 ${30 + Math.sin(t * 12) * 10}px rgba(242,184,192,0.8)`, opacity: seg(t, 1.6, 1.9) }} />}
              </Phone>
            </div>
          </div>
          <Kin t={t} t0={0.08} t1={2.55} y={120} size={64} fps={fps} words={[["POV :"], ["tu"], ["cliques"], ["sur"], ["le"], ["lien", true], ["de"], ["ma"], ["bio"]]} />
          <Ripple x={avatarScreen[0]} y={avatarScreen[1]} t={t} t0={T.tapAv} />
          <Ripple x={linkTapOnScreen[0]} y={linkTapOnScreen[1]} t={t} t0={T.tapLink} />
          {t < 3.15 && <PhotoHand x={hx} y={hy} press={press} />}
        </>
      )}

      {/* ═════ 2 ═════ */}
      {scene2 && (
        <>
          {/* arrivée sur le site (sortie du « pass through ») */}
          <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1.6, 1, siteIn) * lerp(1, 0.94, splitK)})`, opacity: siteIn * (1 - splitK) }}>
            <Phone><Screen src="001-accueil" /></Phone>
          </div>
          <Kin t={t} t0={T.site + 0.25} t1={T.split - 0.05} y={130} size={68} fps={fps} words={[["Bienvenue"], ["sur"], ["MyMotiv", true]]} />
          {/* écran partagé : 2 chemins */}
          {t >= T.split && (
            <>
              {[0, 1].map((side) => {
                const from = side === 0 ? -600 : 600;
                const x0 = side === 0 ? 40 : 560, w = 480, h = (w * 1920) / 1080;
                const big = side === 0 ? whipK : 0;
                const left = lerp(x0 + from * (1 - splitK), SX, big), top = lerp(560, SY, big), ww = lerp(w, SW, big), hh2 = lerp(h, SH, big);
                const kk = ww / 1080;
                const off = side === 1 ? lerp(ACC_TOOL, 0, scroll) : 0;
                const showFunnel = side === 1 && t > T.tapCta + 0.2;
                return (
                  <div key={side} style={{ position: "absolute", left, top, width: ww, height: hh2, borderRadius: lerp(40, 76, big), overflow: "hidden", border: `4px solid ${side === 0 ? PINK_L : "rgba(255,255,255,0.25)"}`, boxShadow: "0 30px 80px rgba(0,0,0,0.6)", opacity: side === 1 ? 1 - whipK : 1, filter: big > 0 && big < 1 ? `blur(${Math.sin(big * Math.PI) * 6}px)` : undefined }}>
                    {side === 0 ? <Img src={SHOT("004-cv-vide")} style={{ width: ww, height: 1920 * kk }} />
                      : showFunnel ? <Img src={SHOT("003-parcours-profil-ok")} style={{ width: ww, height: 1920 * kk, opacity: seg(t, T.tapCta + 0.2, T.tapCta + 0.4) }} />
                      : <Img src={SHOT("accueil-haut")} style={{ position: "absolute", top: -off * kk, width: ww, height: 5200 * kk }} />}
                  </div>
                );
              })}
              {/* étiquettes */}
              <div style={{ position: "absolute", left: 40, top: 300, width: 480, textAlign: "center", opacity: splitK * (1 - whipK) }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: PINK_L, letterSpacing: 4 }}>OPTION 1</div>
                <div style={{ fontSize: 42, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Tu génères direct</div>
              </div>
              <div style={{ position: "absolute", left: 560, top: 300, width: 480, textAlign: "center", opacity: splitK * (1 - whipK) }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: PINK_L, letterSpacing: 4 }}>OPTION 2</div>
                <div style={{ fontSize: 42, fontWeight: 700, color: "#fff", lineHeight: 1.1 }}>Tu remontes ↑</div>
              </div>
              <div style={{ position: "absolute", left: 560, top: 1450, width: 480, textAlign: "center", opacity: seg(t, T.tapCta - 0.3, T.tapCta) * (1 - whipK), fontSize: 34, fontWeight: 600, color: "#fff" }}>« Lancer une candidature »</div>
              {/* la page remonte (défilement), puis le curseur vise « Lancer une candidature » */}
              {t < T.tapCta + 0.7 && (() => {
                const kk = 480 / 1080;
                const swipe = seg(t, T.scrollUp, T.scrollUp + 1.1);
                const tx = 800, ty0 = 560 + 1422 * kk;
                const go = easeInOut(seg(t, T.scrollUp + 1.15, T.tapCta - 0.22));
                const out = easeIn(seg(t, T.tapCta + 0.3, T.tapCta + 0.65));
                const cx2 = lerp(860, tx, go) + out * 260, cy2 = lerp(1250 - Math.sin(swipe * Math.PI) * 50, ty0, go) + out * 420;
                const hover = clamp(seg(t, T.tapCta - 0.42, T.tapCta - 0.2) - seg(t, T.tapCta + 0.18, T.tapCta + 0.34));
                const o = easeOut(seg(t, T.split + 0.2, T.split + 0.5)) * (1 - seg(t, T.tapCta + 0.45, T.tapCta + 0.65));
                return (
                  <>
                    {swipe > 0 && swipe < 1 && [0, 1].map((i) => <div key={i} style={{ position: "absolute", left: 845, top: 1150 - i * 34 - ((t * 3) % 1) * 20, color: NEON, fontSize: 40, fontWeight: 700, opacity: Math.sin(swipe * Math.PI) * (1 - i * 0.4), textShadow: "0 0 12px rgba(217,130,139,0.9)" }}>︿</div>)}
                    <Ripple x={tx} y={ty0} t={t} t0={T.tapCta} />
                    <Pointer x={cx2} y={cy2} hover={hover} press={clamp(1 - Math.abs(t - T.tapCta) / 0.09)} o={o} />
                  </>
                );
              })()}
            </>
          )}
        </>
      )}

      {/* ═════ 3 ═════ */}
      {scene3 && (
        <>
          <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, T.letter + 1.1, T.letter + 1.5) }}>
            <div style={{ position: "absolute", inset: 0, transformOrigin: "0 0", transform: t < T.letter ? cam3 : `scale(${lerp(1.08, 1, letterK)})`, filter: whip > 0.05 ? `blur(${whip * 14}px)` : undefined }}>
              <Phone>
                {t < T.letter ? <Screen src={stepShot()} /> : <Screen src="030-lettre" />}
                {/* « freeze frame » sur la lettre : flash blanc */}
                {t >= T.letter && <div style={{ position: "absolute", inset: 0, background: "#fff", opacity: 1 - letterK }} />}
              </Phone>
            </div>
            {/* étapes : grand numéro + titre */}
            {([[T.s1, T.s2 - 0.1, "1", "Ton CV", "une seule fois"], [T.s2, T.s3 - 0.1, "2", "L'offre", "lien ou texte"], [T.s3, T.ramp - 0.05, "3", "Générer", "1 clic"]] as const).map(([a, b, n, title, sub]) => {
              if (t < a || t > b + 0.2) return null;
              const k = spr(a, 340, 17), out = seg(t, b, b + 0.2);
              return (
                <div key={n} style={{ position: "absolute", left: 0, right: 0, top: 70, display: "flex", alignItems: "center", justifyContent: "center", gap: 26, opacity: 1 - out, transform: `translateX(${(1 - k) * 300 - out * 300}px)` }}>
                  <div style={{ width: 150, height: 150, borderRadius: 40, background: `linear-gradient(135deg, ${PINK_L}, ${PINK})`, color: BG, fontSize: 104, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `rotate(${(1 - k) * -30}deg) scale(${lerp(0.4, 1, k)})` }}>{n}</div>
                  <div>
                    <div style={{ fontSize: 76, fontWeight: 700, color: "#fff", lineHeight: 1, textShadow: "0 5px 0 rgba(0,0,0,0.4)" }}>{title}</div>
                    <div style={{ fontSize: 40, fontWeight: 600, color: PINK_L }}>{sub}</div>
                  </div>
                </div>
              );
            })}
            {/* étape 1 : la main ajoute le CV, le fichier arrive */}
            {t > T.s1 + 0.2 && t < T.cvOk + 0.6 && (() => {
              const [dx, dy] = proj3(...sp(540, 711));
              const chip = easeInOut(seg(t, T.tapCv + 0.05, T.cvOk));
              return (
                <>
                  <Ripple x={dx} y={dy} t={t} t0={T.tapCv} />
                  {chip > 0 && chip < 1 && <div style={{ position: "absolute", left: lerp(900, dx - 150, chip), top: lerp(1900, dy - 60, chip), width: 300, height: 120, borderRadius: 24, background: "#fff", color: BG, display: "flex", alignItems: "center", gap: 16, padding: "0 22px", fontSize: 30, fontWeight: 700, transform: `rotate(${(1 - chip) * 25}deg)` }}><span style={{ background: "#e5484d", color: "#fff", borderRadius: 10, padding: "8px 10px", fontSize: 24 }}>PDF</span>CV_Yann.pdf</div>}
                  <Pointer {...cursor(T.s1 + 0.2, T.tapCv, dx, dy)} />
                </>
              );
            })()}
            {t > T.cvOk && t < T.s2 && <div style={{ position: "absolute", left: 540 - 90, top: 1160, width: 180, height: 180, borderRadius: "50%", background: "#3ccf8e", color: "#fff", fontSize: 110, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${spr(T.cvOk, 400, 14)})`, boxShadow: "0 0 60px rgba(60,207,142,0.6)" }}>✓</div>}
            {/* étape 2 : « Lire l'offre », puis le logo trouvé */}
            {t > T.type1 - 0.3 && t < T.tapRead + 0.7 && (() => {
              const [bx, by] = proj3(...sp(540, 623));
              return <><Ripple x={bx} y={by} t={t} t0={T.tapRead} /><Pointer {...cursor(T.type1 - 0.3, T.tapRead, bx, by)} /></>;
            })()}
            {t > T.logo + 0.35 && t < T.s3 && <Kin t={t} t0={T.logo + 0.35} t1={T.s3 - 0.1} y={1500} size={60} fps={fps} words={[["✓"], ["Logo", true], ["de"], ["l'entreprise"], ["trouvé"]]} />}
            {/* étape 3 : on touche « Générer » */}
            {t > T.s3 + 0.15 && t < T.tapGen + 0.7 && (() => {
              const [gx, gy] = proj3(...sp(540, 959));
              return <><Ripple x={gx} y={gy} t={t} t0={T.tapGen} /><Pointer {...cursor(T.s3 + 0.15, T.tapGen, gx, gy)} /></>;
            })()}
            {/* chrono accéléré */}
            {chronoOn && (() => {
              const k = easeOutBack(seg(t, T.ramp - 0.1, T.ramp + 0.3)), out = seg(t, T.rampEnd + 0.05, T.letter + 0.15);
              const s = Math.floor(secs), c = Math.floor((secs - s) * 100);
              const ringR = 250;
              return (
                <div style={{ position: "absolute", inset: 0, background: `rgba(11,10,11,${0.55 * (1 - out)})` }}>
                  {/* traînées de vitesse */}
                  {Array.from({ length: 22 }, (_, i) => { const r = rng(i + 5); const a = r() * 6.28, d = ((t * 3 + r()) % 1) * 900; return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * (280 + d), top: 900 + Math.sin(a) * (280 + d), width: 90 + r() * 120, height: 5, background: PINK_L, opacity: (1 - out) * 0.6 * Math.sin(rampK * Math.PI), transform: `rotate(${a}rad)`, transformOrigin: "0 50%" }} />; })}
                  <svg width={600} height={600} style={{ position: "absolute", left: 240, top: 600, transform: `scale(${k * (1 - out * 0.3)})`, opacity: 1 - out }}>
                    <circle cx={300} cy={300} r={ringR} fill="rgba(20,17,19,0.92)" stroke="rgba(255,255,255,0.12)" strokeWidth={22} />
                    <circle cx={300} cy={300} r={ringR} fill="none" stroke={PINK} strokeWidth={22} strokeLinecap="round" strokeDasharray={`${(secs / 30) * 2 * Math.PI * ringR} 9999`} transform="rotate(-90 300 300)" />
                    <line x1={300} y1={300} x2={300 + Math.sin(secs / 30 * 6.283) * 200} y2={300 - Math.cos(secs / 30 * 6.283) * 200} stroke="#fff" strokeWidth={8} strokeLinecap="round" />
                    <circle cx={300} cy={300} r={16} fill="#fff" />
                  </svg>
                  <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", opacity: 1 - out }}>
                    <div style={{ fontSize: 150, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums", transform: `skewX(${-Math.sin(rampK * Math.PI) * 10}deg)`, textShadow: `${Math.sin(rampK * Math.PI) * 14}px 0 rgba(255,0,90,0.5), ${-Math.sin(rampK * Math.PI) * 14}px 0 rgba(0,210,255,0.5)` }}>00:{String(s).padStart(2, "0")}<span style={{ fontSize: 80, color: PINK_L }}>,{String(c).padStart(2, "0")}</span></div>
                    <div style={{ fontSize: 36, fontWeight: 600, color: PINK_L }}>{rampK < 1 ? "chrono en accéléré ⏩" : "≈ 30 secondes, en vrai"}</div>
                  </div>
                </div>
              );
            })()}
            {/* la lettre : arrêt sur image */}
            {t >= T.letter && <Kin t={t} t0={T.letter + 0.2} t1={T.yann - 0.15} y={110} size={70} fps={fps} words={[["Ta"], ["lettre."], ["Avec"], ["son"], ["logo.", true]]} />}
            {t >= T.letter + 0.3 && t < T.yann && (() => { const [bx, by] = sp(540, 237); const k = spr(T.letter + 0.3, 300, 15); return <div style={{ position: "absolute", left: bx - 470 * k, top: by - 70, width: 940 * k, height: 140, borderRadius: 24, border: `6px solid ${PINK_L}`, boxShadow: `0 0 40px ${PINK}`, opacity: k }} />; })()}
          </div>
        </>
      )}

      {/* ═════ 4 : Yann postule ═════ */}
      {scene4 && (
        <>
          {/* la lettre devient une carte, se plie et s'envole */}
          {t < T.sent + 0.4 && (
            <div style={{ position: "absolute", left: 540 - 300, top: lerp(380, 300, fly) - fly * 1400, width: 600, height: 780, transform: `scale(${lerp(1, 0.25, fly)}) rotate(${fly * 35}deg) perspective(1200px) rotateX(${fold * 70}deg)`, transformOrigin: "50% 50%", opacity: clamp(seg(t, T.yann - 0.1, T.yann + 0.2)) }}>
              <div style={{ position: "absolute", inset: 0, borderRadius: 26, overflow: "hidden", boxShadow: "0 30px 90px rgba(0,0,0,0.6)", background: "#fff" }}>
                <Img src={SHOT("030-lettre")} style={{ position: "absolute", left: -110 * (600 / 860), top: -187 * (600 / 860), width: 1080 * (600 / 860), height: 1920 * (600 / 860) }} />
              </div>
              {fold > 0.6 && <div style={{ position: "absolute", inset: 0, borderRadius: 26, background: `linear-gradient(160deg, ${PINK_L}, ${PINK})`, opacity: seg(fold, 0.6, 1) }}><div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "55%", clipPath: "polygon(0 0, 100% 0, 50% 100%)", background: "rgba(255,255,255,0.35)" }} /></div>}
            </div>
          )}
          {/* traînée d'envol */}
          {fly > 0 && fly < 1 && <div style={{ position: "absolute", left: 520, top: 700 - fly * 1400, width: 40, height: 700, background: `linear-gradient(to top, rgba(242,184,192,0), ${PINK_L})`, filter: "blur(8px)", transform: "rotate(25deg)" }} />}
          {/* bouton « Postuler » */}
          {t < T.sent && (() => {
            const k = spr(T.yann + 0.5, 340, 16), pr = clamp(1 - Math.abs(t - T.send) / 0.1);
            return <div style={{ position: "absolute", left: 540 - 300, top: 1210, width: 600, height: 140, borderRadius: 999, background: `linear-gradient(135deg, ${PINK_L}, ${PINK})`, color: BG, fontSize: 54, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k * (1 - pr * 0.1)})`, boxShadow: `0 0 ${40 + Math.sin(t * 10) * 15}px rgba(217,130,139,0.7)` }}>Postuler ➜</div>;
          })()}
          {t > T.yann + 0.6 && t < T.sent + 0.7 && <><Ripple x={600} y={1280} t={t} t0={T.send} /><Pointer {...cursor(T.yann + 0.6, T.send, 600, 1280)} /></>}
          {/* ✓ Envoyée — ce cercle devient le soleil (match cut) */}
          {t >= T.sent && (
            <div style={{ position: "absolute", left: lerp(540, 540, toSun) - lerp(130, 110, toSun), top: lerp(760, 900, toSun) - lerp(130, 110, toSun), width: lerp(260, 220, toSun), height: lerp(260, 220, toSun), borderRadius: "50%", background: toSun > 0 ? `rgb(${Math.round(lerp(217, 255, toSun))},${Math.round(lerp(130, 217, toSun))},${Math.round(lerp(139, 160, toSun))})` : PINK, color: "#fff", fontSize: 150 * (1 - toSun), fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${sentK})`, boxShadow: `0 0 ${80 + toSun * 200}px rgba(255,190,140,${0.5 + toSun * 0.4})` }}>{toSun < 0.9 ? "✓" : ""}</div>
          )}
          {t >= T.sent && t < T.match && <Kin t={t} t0={T.sent + 0.1} t1={T.match - 0.05} y={1080} size={70} fps={fps} words={[["Candidature"], ["envoyée", true]]} />}
          {/* Yann */}
          {t < T.match + 0.1 && <Img src={staticFile(`mascotte/${t < T.send ? "sourire" : "rire"}.png`)} style={{ position: "absolute", left: t < T.send ? -40 : -20, bottom: -30, height: 760, transform: `translateY(${(1 - yIn) * 700 + seg(t, T.match - 0.3, T.match + 0.1) * 800}px) rotate(${(1 - yIn) * -12}deg)`, transformOrigin: "50% 100%" }} />}
          {t < T.send && <Kin t={t} t0={T.yann + 0.2} t1={T.send - 0.05} y={110} size={72} fps={fps} words={[["Yann"], ["postule.", true]]} />}
        </>
      )}

      {/* ═════ 5 : jour / nuit (slit scan) ═════ */}
      {t >= T.night && t < T.notif + 0.6 && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, T.notif, T.notif + 0.5) }}>
          <SlitSky q={q} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", color: "#fff", fontSize: 190, fontWeight: 700, fontVariantNumeric: "tabular-nums", textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>{hh}:{mm}</div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center", color: "#fff", fontSize: 58, fontWeight: 700, opacity: seg(q, 0.1, 0.3), textShadow: "0 6px 30px rgba(0,0,0,0.6)" }}>{q < 0.62 ? "La nuit passe…" : "Le lendemain matin"}</div>
        </div>
      )}

      {/* ═════ 6 : appel manqué + e-mail ═════ */}
      {scene6 && (
        <>
          <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 760px", transform: `translateY(${(1 - phoneUp) * 1600 - pushMail * 200}px) scale(${lerp(1, 1.25, pushMail)}) translateX(${shake(T.call, 14, 0.5) + shake(T.mail, 10, 0.4)}px)`, opacity: 1 - endK }}>
            <Phone>
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #9fd3ff 0%, #f6c7c0 60%, #d9828b 100%)" }} />
              <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", color: "#fff", fontSize: 44, fontWeight: 600, textShadow: "0 2px 10px rgba(0,0,0,0.2)" }}>mercredi 8 octobre</div>
              <div style={{ position: "absolute", left: 0, right: 0, top: 200, textAlign: "center", color: "#fff", fontSize: 230, fontWeight: 700, textShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>9:04</div>
              {/* appel manqué */}
              <div style={{ position: "absolute", left: 30, right: 30, top: 560, borderRadius: 44, background: "rgba(255,255,255,0.86)", padding: "26px 30px", display: "flex", gap: 22, alignItems: "center", transform: `translateY(${(1 - callK) * -300}px) scale(${lerp(0.8, 1, callK)})`, opacity: clamp(callK * 2), boxShadow: "0 20px 50px rgba(0,0,0,0.18)" }}>
                <div style={{ width: 92, height: 92, borderRadius: 24, background: "#e5484d", color: "#fff", fontSize: 54, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>✆</div>
                <div style={{ color: "#1d2226" }}>
                  <div style={{ fontSize: 34, fontWeight: 700 }}>Appel manqué</div>
                  <div style={{ fontSize: 30, fontFamily: "Open Sans" }}>Maison Lumen · Recrutement</div>
                </div>
                <div style={{ marginLeft: "auto", color: "#5e6670", fontSize: 26, fontFamily: "Open Sans" }}>9:02</div>
              </div>
              {/* e-mail */}
              <div style={{ position: "absolute", left: 30, right: 30, top: 760, borderRadius: 44, background: "rgba(255,255,255,0.92)", padding: "28px 30px", transform: `translateY(${(1 - mailK) * -300}px) scale(${lerp(0.8, 1, mailK)})`, opacity: clamp(mailK * 2), boxShadow: `0 20px 50px rgba(0,0,0,0.18), 0 0 0 ${pushMail * 6}px ${PINK_L}` }}>
                <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
                  <div style={{ width: 70, height: 70, borderRadius: 18, background: "#2f7cf6", color: "#fff", fontSize: 40, display: "flex", alignItems: "center", justifyContent: "center" }}>✉</div>
                  <div style={{ color: "#1d2226", fontSize: 32, fontWeight: 700 }}>Maison Lumen · RH</div>
                  <div style={{ marginLeft: "auto", color: "#5e6670", fontSize: 26, fontFamily: "Open Sans" }}>9:04</div>
                </div>
                <div style={{ color: "#1d2226", fontSize: 31, fontWeight: 700, marginTop: 16 }}>Votre candidature · Manager des ventes</div>
                <div style={{ color: "#33393f", fontSize: 33, fontFamily: "Open Sans", lineHeight: 1.35, marginTop: 8 }}>
                  Bonjour Yann, j'ai tenté de vous joindre ce matin. <b style={{ background: `rgba(217,130,139,${0.35 * pushMail})`, borderRadius: 8 }}>Êtes-vous disponible demain pour un entretien ?</b>
                </div>
              </div>
            </Phone>
          </div>
          {/* ondes de vibration à l'appel */}
          {t > T.call && t < T.call + 0.8 && [0, 1, 2].map((i) => { const k = seg(t, T.call + i * 0.1, T.call + 0.5 + i * 0.1); return <div key={i} style={{ position: "absolute", left: SX - 30 - k * 60, top: SY - 30 - k * 60, width: SW + 60 + k * 120, height: SH + 60 + k * 120, borderRadius: 110, border: `5px solid ${PINK_L}`, opacity: (1 - k) * 0.7 }} />; })}
          {/* Yann réagit */}
          {t > T.react && t < T.end + 0.3 && <Img src={staticFile(`mascotte/${t < T.laugh ? "choc" : "rire"}.png`)} style={{ position: "absolute", right: -40, bottom: -40, height: 500, transform: `translateY(${(1 - spr(T.react, 300, 14)) * 800 + endK * 800}px) rotate(${t < T.laugh ? Math.sin(t * 40) * 2 : 0}deg)`, transformOrigin: "50% 100%" }} />}
          <Confetti t={t} t0={T.laugh} />
          {t > T.laugh && <Kin t={t} t0={T.laugh + 0.05} t1={T.end - 0.1} y={110} size={78} fps={fps} words={[["Entretien"], ["décroché.", true]]} />}
          {t > T.call && t < T.laugh && <Kin t={t} t0={T.call + 0.1} t1={T.laugh - 0.1} y={110} size={66} fps={fps} words={[["Le"], ["lendemain…"]]} />}
        </>
      )}

      {/* ═════ 7 : appel à l'action ═════ */}
      {t >= T.end && (
        <div style={{ position: "absolute", inset: 0, opacity: endK }}>
          <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 45%, rgba(217,130,139,0.35), ${BG} 60%)` }} />
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: 540 - 300, top: 470, width: 600, transform: `scale(${spr(T.end + 0.1, 260, 15)})` }} />
          <Kin t={t} t0={T.end + 0.35} t1={T.total + 1} y={760} size={80} fps={fps} words={[["Ta"], ["1re"], ["lettre"], ["est"], ["offerte", true]]} />
          {/* lien de la bio + flèche vers le haut */}
          {(() => {
            const k = spr(T.end + 0.9, 300, 16), b = Math.abs(Math.sin(t * 5)) * 30;
            return (
              <>
                <div style={{ position: "absolute", left: 540 - 380, top: 1090, width: 760, height: 120, borderRadius: 999, background: "rgba(255,255,255,0.08)", border: `3px solid ${PINK_L}`, color: "#fff", fontSize: 44, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k})`, boxShadow: `0 0 50px rgba(217,130,139,0.5)` }}>🔗 tinyurl.com/try-mymotiv</div>
                <div style={{ position: "absolute", left: 0, right: 0, top: 1290 - b, textAlign: "center", fontSize: 64, fontWeight: 700, color: PINK_L, opacity: k }}>↑ Lien en bio ↑</div>
              </>
            );
          })()}
          <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", fontSize: 38, fontWeight: 600, color: "rgba(255,255,255,0.8)", opacity: seg(t, T.end + 1.6, T.end + 2.1) }}>Avec MyMotiv, postulez. Et faites-vous recruter.</div>
        </div>
      )}

      {/* mention « Mise en scène » pendant l'histoire */}
      {story && <div style={{ position: "absolute", left: 36, top: 36, padding: "8px 18px", borderRadius: 999, background: "rgba(0,0,0,0.45)", color: "rgba(255,255,255,0.85)", fontSize: 26, fontFamily: "Open Sans", fontWeight: 600 }}>Mise en scène</div>}

      {/* flash du « pass through » */}
      {flash > 0 && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${linkOnScreen[0]}px ${linkOnScreen[1]}px, #fff, ${PINK_L})`, opacity: flash }} />}
      <Audio src={staticFile("audio/lien.wav")} />
    </AbsoluteFill>
  );
};
