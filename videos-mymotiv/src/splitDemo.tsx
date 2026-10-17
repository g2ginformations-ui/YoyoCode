// Briques du format « démo racontée en écran partagé » (style mesuré dans styles/demo-racontee.md, d'après une vidéo de
// référence envoyée par le propriétaire le 16/10/2026) : en haut, le VRAI site dans un panneau arrondi avec une caméra qui
// se promène dessus et des cadres roses sur ce qu'on nomme ; au milieu, des sous-titres de 1 à 3 mots (Poppins blanc, le
// mot-clé en italique à empattements rose, police Instrument Serif, OFL) ; en bas, Yann masqué dans un panneau chaud
// (lumière rose de fin de journée) ; de temps en temps un plan plein écran (visage, détail du site, chiffres, appel
// « commente … »). Utilisé par DemoMission (1re vidéo du format). Les règles de CLAUDE.md passent avant.
import React from "react";
import { AbsoluteFill, Img, continueRender, delayRender, staticFile } from "remotion";
import { PINK, easeInOut, lerp, seg } from "./common";

if (typeof document !== "undefined") {
  const h = delayRender("Instrument Serif");
  const face = new FontFace("Instrument Serif", `url(${staticFile("fonts/instrument-serif-latin-400-italic.woff2")})`, { style: "italic", weight: "400" });
  document.fonts.add(face);
  face.load().then(() => continueRender(h)).catch(() => continueRender(h));
}
export const SERIF = "'Instrument Serif', Georgia, serif";
export const NOIR = "#070607";

// ─── géométrie (référence mesurée sur 1080×1920, décalée pour rester dans les zones sûres TikTok) ───
export const ECRAN = { x: 30, y: 230, w: 1020, h: 770 };       // panneau du site, en haut
export const ST_Y = 1078;                                      // sous-titres entre les deux panneaux
export const ST_Y_PLEIN = 1385;                                // sous-titres des plans plein écran
export const VISAGE = { x: 47, y: 1250, w: 986 };              // panneau visage, jusqu'en bas de l'image

// ─── fond noir à trame de points très discrète ───
export const Fond: React.FC = () => (
  <AbsoluteFill style={{ background: NOIR, backgroundImage: "radial-gradient(rgba(255,255,255,0.045) 1.4px, transparent 1.6px)", backgroundSize: "30px 30px" }} />
);

// ─── une capture du site, avec caméra (centre cx, cy en px de l'image ; z = 1 : l'image remplit la largeur) et cadres ───
export type Cam = [number, number, number, number];             // [t, cx, cy, z]
export type Cadre = { a: number; b?: number; box: [number, number, number, number] };
export function camAt(t: number, cams: Cam[]): [number, number, number] {
  if (t <= cams[0][0]) return [cams[0][1], cams[0][2], cams[0][3]];
  for (let i = 0; i < cams.length - 1; i++) {
    const [a, x0, y0, z0] = cams[i], [b, x1, y1, z1] = cams[i + 1];
    if (t < b) { const k = easeInOut(seg(t, a, b)); return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)]; }
  }
  const l = cams[cams.length - 1];
  return [l[1], l[2], l[3]];
}
export const Capture: React.FC<{ t: number; src: string; W: number; H: number; vw: number; vh: number; cams: Cam[]; cadres?: Cadre[] }> = ({ t, src, W, H, vw, vh, cams, cadres = [] }) => {
  const [cx, cy, z] = camAt(t, cams), s = (vw / W) * z;
  const iw = W * s, ih = H * s;
  const left = iw >= vw ? Math.min(0, Math.max(vw - iw, vw / 2 - cx * s)) : (vw - iw) / 2;
  const top = ih >= vh ? Math.min(0, Math.max(vh - ih, vh / 2 - cy * s)) : (vh - ih) / 2;
  return (
    <>
      <Img src={staticFile(src)} style={{ position: "absolute", left, top, width: iw, height: ih }} />
      {cadres.filter((c) => t >= c.a && (c.b === undefined || t < c.b)).map((c, i) => {
        const o = seg(t, c.a, c.a + 0.18), [x, y, w, h] = c.box, pad = 10;
        return <div key={i} style={{ position: "absolute", left: left + x * s - pad, top: top + y * s - pad, width: w * s + 2 * pad, height: h * s + 2 * pad, borderRadius: 16,
          border: `5px solid ${PINK}`, boxShadow: `0 0 26px ${PINK}, inset 0 0 14px rgba(217,130,139,0.35)`, opacity: o, transform: `scale(${1.06 - 0.06 * o})` }} />;
      })}
    </>
  );
};

// ─── le panneau arrondi du haut (le site) ───
export const Panneau: React.FC<{ children: React.ReactNode; r?: { x: number; y: number; w: number; h: number } }> = ({ children, r = ECRAN }) => (
  <div style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 34, overflow: "hidden", background: "#121013",
    boxShadow: "0 0 0 2px rgba(255,255,255,0.06), 0 0 60px rgba(217,130,139,0.18), 0 30px 70px rgba(0,0,0,0.7)" }}>{children}</div>
);

// ─── Yann masqué dans le panneau chaud du bas (ou plein écran) ───
export function poseAt(t: number, poses: [number, string][]) {
  let k = 0;
  poses.forEach(([a], i) => { if (t >= a) k = i; });
  return { pose: poses[k][1], a: poses[k][0] };
}
const MUR = "linear-gradient(180deg, #1A0F12 0%, #3A1B20 28%, #A8545A 52%, #E39A86 60%, #7A3A3E 72%, #24141A 100%)";
export const Visage: React.FC<{ t: number; poses: [number, string][]; plein?: boolean }> = ({ t, poses, plein }) => {
  const { pose, a } = poseAt(t, poses);
  const punch = 1 + 0.03 * Math.exp(-(t - a) * 10), sx = Math.sin(t * 1.3) * 4, sy = Math.cos(t * 1.1) * 3;
  if (plein) return (
    <AbsoluteFill style={{ background: MUR, overflow: "hidden" }}>
      <div style={{ position: "absolute", left: -60, top: 380, width: 1200, height: 1700, transform: `translate(${sx}px, ${sy}px) scale(${punch})`, transformOrigin: "50% 20%" }}>
        <Img src={staticFile(`yann/${pose}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 0%" }} />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0) 50%, rgba(0,0,0,0.5) 100%)" }} />
    </AbsoluteFill>
  );
  return (
    <>
      <div style={{ position: "absolute", left: VISAGE.x - 120, top: VISAGE.y - 260, width: VISAGE.w + 240, height: 520, background: "radial-gradient(ellipse at 50% 70%, rgba(227,140,120,0.35) 0%, rgba(217,130,139,0.12) 40%, rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", left: VISAGE.x, top: VISAGE.y, width: VISAGE.w, height: 1920 - VISAGE.y + 40, borderRadius: "44px 44px 0 0", overflow: "hidden", background: MUR }}>
        <div style={{ position: "absolute", left: -20, top: 30, width: VISAGE.w + 40, height: 1240, transform: `translate(${sx}px, ${sy}px) scale(${punch})`, transformOrigin: "50% 20%" }}>
          <Img src={staticFile(`yann/${pose}.png`)} style={{ width: "100%", height: "100%", objectFit: "contain", objectPosition: "50% 0%" }} />
        </div>
      </div>
    </>
  );
};

// ─── sous-titres de 1 à 3 mots, le mot-clé en italique rose ───
type Voix = { phrases: { text: string; t0: number; t1: number }[]; mots: { w: string; i: number; phrase: number; t0: number }[] };
export const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[^a-z0-9%]/g, "");
type Bloc = { t0: number; t1: number; mots: string[] };
export function blocs(v: Voix): Bloc[] {
  const out: Bloc[] = [];
  v.phrases.forEach((ph, i) => {
    const mots = v.mots.filter((m) => m.phrase === i && norm(m.w).length), words = ph.text.split(" ").filter(Boolean);
    const tt = mots.map((m) => norm(m.w).length), tTot = Math.max(1, tt.reduce((a, b) => a + b, 0));
    const tf: number[] = []; let acc = 0; tt.forEach((n) => { tf.push(acc / tTot); acc += n; });
    const wl = words.map((w) => Math.max(1, norm(w).length)), wTot = wl.reduce((a, b) => a + b, 0);
    let pos = 0;
    const times = words.map((w, j) => {
      const f = pos / wTot; pos += wl[j];
      let m = 0; tf.forEach((val, k) => { if (f >= val - 1e-6) m = k; });
      const f0 = tf[m], f1 = m + 1 < tf.length ? tf[m + 1] : 1, a = mots[m]?.t0 ?? ph.t0, b = m + 1 < mots.length ? mots[m + 1].t0 : ph.t1;
      return mots.length ? lerp(a, Math.min(b, a + 0.6), (f - f0) / Math.max(1e-6, f1 - f0)) : ph.t0;
    });
    let cur: number[] = [];
    const flush = () => { if (cur.length) out.push({ t0: times[cur[0]] - 0.05, t1: ph.t1 + 0.25, mots: cur.map((k) => words[k]) }); cur = []; };
    words.forEach((w, k) => { cur.push(k); if (/[,.:;?!…]$/.test(w) || cur.length >= 3) flush(); });
    flush();
  });
  out.forEach((b, i) => { if (i + 1 < out.length) b.t1 = Math.min(b.t1, out[i + 1].t0); });
  return out;
}
export const SousTitre: React.FC<{ t: number; bl: Bloc[]; cles: Set<string>; y?: number; size?: number }> = ({ t, bl, cles, y = ST_Y, size = 70 }) => {
  const b = bl.find((x) => t >= x.t0 && t < x.t1);
  if (!b) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 100, top: y, transform: "translateY(-50%)", textAlign: "center", lineHeight: 1.1, zIndex: 30, whiteSpace: "nowrap", fontFamily: "Poppins", fontWeight: 700, fontSize: size }}>
      {b.mots.map((w, i) => {
        const cle = cles.has(norm(w)), txt = w.replace(/[,.:;!]+$/, "");
        return <React.Fragment key={i}>
          <span style={cle ? { fontFamily: SERIF, fontStyle: "italic", fontSize: size * 1.32, color: PINK, textShadow: "0 3px 18px rgba(0,0,0,0.6)" }
            : { fontFamily: "Poppins", fontWeight: 700, fontSize: size, color: "#fff", textShadow: "0 3px 14px rgba(0,0,0,0.7)" }}>{txt}</span>{" "}
        </React.Fragment>;
      })}
    </div>
  );
};

// ─── le passage « je te montre » : filé horizontal flou ───
export const fileFlou = (t: number, a: number, b: number) => {
  const k = seg(t, a, b);
  return { transform: `translateX(${-1400 * easeInOut(k)}px)`, filter: `blur(${Math.sin(k * Math.PI) * 26}px)` } as React.CSSProperties;
};
