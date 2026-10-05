// Concept 3 « L'Onde de Choc Visuelle » (20 s).
// 0–4 s WHY : hyper-lapse de pages d'offres et de CV gris qui bouchent la caméra, un laser rose coupe tout en deux.
// 4–8 s HOW 1 : snap zoom sur la VRAIE interface MyMotiv, le lien glisse dans le champ, clic, impulsion.
// 8–13 s HOW 2 : espace 3D, flux rose → globe holographique (site de l'entreprise), le logo arraché en cristal.
// 13–17 s WHAT : le cristal s'écrase sur la lettre (CLACK), le texte tombe en cascade, le CV s'illumine.
// 17–20 s Outro : la caméra tourne autour des deux documents, bouton néon.
// Site d'emploi générique (sans marque), entreprise fictive (Maison Lumen).
import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { BG, PINK, PINK_L, WHITE, W, H, clamp, lerp, seg, easeOut, easeIn, easeInOut, rng, rr, Text3D, Cursor } from "./common";
import { PH, PW, LOGO_SLOT, paintCv, paintLetter } from "./documents";

const SPACE = "#0B0B0E";
const T = { laser: 2.55, split: 2.75, how: 4.0, slide: 4.45, slid: 4.9, click: 5.9, space: 8.0, hit: 8.75, wrap1: 10.2, rip: 10.4, what: 13.0, clack: 13.6, cascade1: 14.3, glow: 14.3, outro: 17.0 };
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));

const img: Record<string, HTMLImageElement> = {};
if (typeof Image !== "undefined") {
  for (const [k, f] of [["logo", "company.png"]]) { const h = delayRender(`Image ${f}`), i = new Image(); i.onload = () => continueRender(h); i.src = staticFile(f); img[k] = i; }
}
const mk = (w: number, h: number) => { if (typeof document === "undefined") return null; const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };

// ───────── WHY : hyper-lapse 3D ─────────
const PAGE_W = 600, PAGE_H = 800;
const pageJob = mk(PAGE_W, PAGE_H), pageCv = mk(PAGE_W, PAGE_H), scene = mk(W, H);
let pagesReady = false;
function preparePages() { // une page d'offres (site d'emploi générique) et un CV gris, dessinés une fois
  if (pagesReady || !pageJob || !pageCv) return; pagesReady = true;
  let c = pageJob.getContext("2d")!; c.fillStyle = "#d7d7dc"; c.fillRect(0, 0, PAGE_W, PAGE_H); c.fillStyle = "#a9a9b2"; c.fillRect(0, 0, PAGE_W, 90);
  c.fillStyle = "#6e6e78"; c.font = "700 34px Poppins"; c.fillText("Offres d'emploi", 30, 58);
  for (let i = 0; i < 6; i++) { const y = 120 + i * 112; c.fillStyle = "#ececf0"; rr(c, 24, y, PAGE_W - 48, 96, 12); c.fill(); c.fillStyle = "#9d9da6"; rr(c, 40, y + 16, 64, 64, 10); c.fill(); c.fillStyle = "#8a8a94"; c.fillRect(124, y + 22, 300, 16); c.fillStyle = "#b4b4bc"; c.fillRect(124, y + 50, 200, 12); c.fillRect(124, y + 70, 120, 10); }
  c = pageCv.getContext("2d")!; c.fillStyle = "#c9c9ce"; c.fillRect(0, 0, PAGE_W, PAGE_H); c.fillStyle = "#9a9aa2"; c.beginPath(); c.arc(100, 110, 56, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#77777f"; c.fillRect(180, 76, 280, 24); c.fillStyle = "#9a9aa2"; c.fillRect(180, 116, 200, 14);
  for (let s = 0; s < 3; s++) { const y = 220 + s * 180; c.fillStyle = "#86868e"; c.fillRect(44, y, 160, 18); for (let i = 0; i < 4; i++) { c.fillStyle = "#acacb3"; c.fillRect(44, y + 40 + i * 28, i % 2 ? 380 : 480, 12); } }
  c.fillStyle = "#77777f"; c.font = "600 26px 'Open Sans'"; c.fillText("CV_classique.pdf", 180, 160);
}
const PAGES = (() => { const r = rng(21), out: { ts: number; X: number; Y: number; zEnd: number; rot: number; cv: boolean; tint: number }[] = [];
  // des dizaines de pages en vol dès le début ; les dernières viennent se coller à la caméra
  for (let i = 0; i < 90; i++) { const late = i >= 72; out.push({ ts: late ? 1.6 + (i - 72) * 0.05 : -1.2 + i * 0.038, X: (r() - 0.5) * (late ? 700 : 2600), Y: (r() - 0.5) * (late ? 1000 : 4200), zEnd: late ? 260 + r() * 260 : 900 + r() * 2200, rot: (r() - 0.5) * 0.5, cv: r() < 0.5, tint: r() }); }
  return out; })();
const F = 800;
function paintHyperlapse(c: CanvasRenderingContext2D, t: number) {
  preparePages();
  c.fillStyle = "#101014"; c.fillRect(0, 0, W, H);
  // lignes de vitesse
  const r = rng(Math.floor(t * 30) + 1); c.save(); c.strokeStyle = "rgba(220,220,230,0.25)"; c.lineWidth = 2;
  for (let i = 0; i < 40; i++) { const a = r() * Math.PI * 2, d0 = 100 + r() * 500, len = 200 + r() * 600 * seg(t, 0, 2.5); c.beginPath(); c.moveTo(540 + Math.cos(a) * d0, 960 + Math.sin(a) * d0); c.lineTo(540 + Math.cos(a) * (d0 + len), 960 + Math.sin(a) * (d0 + len)); c.stroke(); }
  c.restore();
  const live = PAGES.filter((p) => t >= p.ts).map((p) => { const k = easeIn(seg(t, p.ts, p.ts + 1.1)); return { p, z: Math.max(200, lerp(5000, p.zEnd, k) - Math.max(0, t - p.ts - 1.1) * 0.35 * p.zEnd) }; }).sort((a, b) => b.z - a.z);
  for (const { p, z } of live) {
    const s = F / z, x = 540 + p.X * s * 0.6, y = 960 + p.Y * s * 0.6, a = clamp((5000 - z) / 1500);
    c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(p.rot); c.scale(s, s); c.shadowColor = "rgba(0,0,0,0.6)"; c.shadowBlur = 30 / s;
    c.drawImage(p.cv ? pageCv! : pageJob!, -PAGE_W / 2, -PAGE_H / 2); c.shadowBlur = 0; c.fillStyle = `rgba(16,16,20,${0.15 + p.tint * 0.3})`; c.fillRect(-PAGE_W / 2, -PAGE_H / 2, PAGE_W, PAGE_H); c.restore();
  }
}
// La ligne du laser (diagonale) et la coupure.
const LA: [number, number] = [-40, 1180], LB: [number, number] = [1120, 760];
function paintWhy(c: CanvasRenderingContext2D, t: number) {
  const sc = scene!.getContext("2d")!; paintHyperlapse(sc, Math.min(t, T.split));
  const nx = -(LB[1] - LA[1]), ny = LB[0] - LA[0], nl = Math.hypot(nx, ny), ux = nx / nl, uy = ny / nl; // normale à la ligne
  c.fillStyle = BG; c.fillRect(0, 0, W, H);
  if (t < T.split) c.drawImage(scene!, 0, 0);
  else { // les deux moitiés s'écartent
    const k = easeOut(seg(t, T.split, T.split + 0.6)), d = 900 * k, a = 1 - seg(t, T.split + 0.2, T.split + 0.7);
    for (const side of [-1, 1]) {
      c.save(); c.globalAlpha = a; c.beginPath();
      if (side < 0) { c.moveTo(LA[0], LA[1]); c.lineTo(LB[0], LB[1]); c.lineTo(W + 100, -100); c.lineTo(-100, -100); } else { c.moveTo(LA[0], LA[1]); c.lineTo(LB[0], LB[1]); c.lineTo(W + 100, H + 100); c.lineTo(-100, H + 100); }
      c.closePath(); c.clip(); c.translate(ux * d * side, uy * d * side); c.rotate(side * 0.05 * k); c.drawImage(scene!, 0, 0); c.restore();
    }
  }
  if (t >= T.laser && t < T.split + 0.5) { // le laser rose poudré
    const k = easeOutExpo(seg(t, T.laser, T.split)), fade = 1 - seg(t, T.split + 0.1, T.split + 0.5), x = lerp(LA[0], LB[0], k), y = lerp(LA[1], LB[1], k);
    c.save(); c.globalAlpha = fade; c.lineCap = "round";
    for (const [lw, col, bl] of [[34, "rgba(217,130,139,0.35)", 60], [12, "rgba(242,184,192,0.9)", 30], [4, "rgba(255,255,255,1)", 10]] as [number, string, number][]) { c.strokeStyle = col; c.lineWidth = lw; c.shadowColor = PINK; c.shadowBlur = bl; c.beginPath(); c.moveTo(LA[0], LA[1]); c.lineTo(x, y); c.stroke(); }
    c.globalCompositeOperation = "lighter"; const g = c.createRadialGradient(x, y, 0, x, y, 120); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(217,130,139,0)"); c.fillStyle = g; c.fillRect(x - 120, y - 120, 240, 240);
    const r = rng(Math.floor(t * 60)); for (let i = 0; i < 40; i++) { c.fillStyle = "rgba(242,184,192,0.8)"; c.fillRect(x + (r() - 0.6) * 200, y + (r() - 0.5) * 200, 3, 3); }
    c.restore();
  }
}

// ───────── HOW 1 : la vraie interface (captures) ─────────
const S2 = { s: 1.18, offY: 245 };
const sx = (x: number) => 540 + (x - 540) * S2.s, sy = (y: number) => S2.offY + y * S2.s;
const FIELD = { x: sx(92.5), y: sy(428.3), w: 895 * S2.s, h: 117 * S2.s }, BTN = { x: sx(92.5), y: sy(565.3), w: 895 * S2.s, h: 117 * S2.s };
const URL_TXT = "carrieres.maison-lumen.fr/offre/manager-ventes";
const SceneUI: React.FC<{ t: number }> = ({ t }) => {
  const shot = t < T.slid ? "004-offre-vide" : t < T.click + 0.05 ? "018-offre-lien" : t < 6.8 ? "019-offre-lecture" : "020-offre-lue";
  const snap = easeOutExpo(seg(t, T.how, T.how + 0.3)), out = easeIn(seg(t, 7.75, T.space));
  const scale = lerp(2.6, 1, snap) * lerp(1, 4, out), blur = lerp(14, 0, snap) + 10 * out;
  const press = t >= T.click && t < T.click + 0.12;
  const cur = t > 5.15 && t < 6.6 ? (() => { const k = easeOut(seg(t, 5.15, 5.75)); return [lerp(1000, 640, k) + Math.sin(k * 14) * 30 * (1 - k), lerp(1550, BTN.y + 60, k)]; })() : null;
  // le lien glisse frénétiquement depuis la droite
  const sl = seg(t, T.slide, T.slid), slideX = lerp(1150, 0, easeOutExpo(sl)) + (sl < 1 ? Math.sin(t * 90) * 24 * (1 - sl) : 0);
  const imp = t >= T.click ? (t - T.click) / 0.6 : -1;
  return (
    <AbsoluteFill style={{ background: BG, opacity: 1 - out }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${scale})`, transformOrigin: `540px ${FIELD.y + FIELD.h / 2}px`, filter: `blur(${blur}px)` }}>
        <div style={{ position: "absolute", left: 540 - 540 * S2.s, top: S2.offY, width: 1080 * S2.s, height: 1920 * S2.s }}><Img src={staticFile(`shots/${shot}.png`)} style={{ width: "100%", height: "100%" }} /></div>
        <div style={{ position: "absolute", left: 0, top: 0, width: W, height: S2.offY + 10, background: BG }} />
        {t >= T.slide && t < T.slid && (
          <div style={{ position: "absolute", left: FIELD.x + 26 + slideX, top: FIELD.y + FIELD.h / 2 - 30, height: 60, padding: "0 22px", borderRadius: 30, background: "rgba(217,130,139,0.25)", border: `2px solid ${PINK}`, color: WHITE, fontFamily: "Open Sans", fontWeight: 600, fontSize: 34, lineHeight: "56px", whiteSpace: "nowrap", boxShadow: `0 0 30px ${PINK}` }}>{URL_TXT}</div>
        )}
        {t >= T.slid && t < T.slid + 0.15 && <div style={{ position: "absolute", left: FIELD.x, top: FIELD.y, width: FIELD.w, height: FIELD.h, borderRadius: 18, background: `rgba(242,184,192,${0.5 * (1 - (t - T.slid) / 0.15)})` }} />}
        {press && <div style={{ position: "absolute", left: BTN.x, top: BTN.y, width: BTN.w, height: BTN.h, borderRadius: 18, background: "rgba(255,255,255,0.5)" }} />}
      </div>
      {imp >= 0 && imp < 1 && cur && (<>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at ${cur[0]}px ${cur[1]}px, rgba(255,236,240,${0.6 * (1 - imp)}) 0%, rgba(217,130,139,${0.25 * (1 - imp)}) 25%, rgba(0,0,0,0) 55%)` }} />
        {[0, 0.15, 0.3].map((d) => { const k = clamp((imp - d) / (1 - d)); return k > 0 && <div key={d} style={{ position: "absolute", left: cur[0] - 900 * easeOut(k), top: cur[1] - 900 * easeOut(k), width: 1800 * easeOut(k), height: 1800 * easeOut(k), borderRadius: "50%", border: `${8 * (1 - k) + 1}px solid rgba(242,184,192,${1 - k})`, boxShadow: `0 0 40px rgba(217,130,139,${1 - k})` }} />; })}
      </>)}
      {cur && <Cursor x={cur[0]} y={cur[1]} press={press} />}
    </AbsoluteFill>
  );
};

// ───────── HOW 2 : l'espace 3D digital, le globe, le cristal ─────────
const GL = { x: 540, y: 1080, r: 250 };
const PILL = { x: 80, y: 330, w: 920, h: 90 };
const CRY = { x: 540, y: 640 };
function globePoint(lat: number, lon: number, spin: number): [number, number, number] { // sphère tournante, projection orthographique
  const x = Math.cos(lat) * Math.sin(lon + spin), y = Math.sin(lat), z = Math.cos(lat) * Math.cos(lon + spin); const tilt = 0.35;
  const y2 = y * Math.cos(tilt) - z * Math.sin(tilt), z2 = y * Math.sin(tilt) + z * Math.cos(tilt); return [GL.x + x * GL.r, GL.y - y2 * GL.r, z2];
}
function paintGlobe(c: CanvasRenderingContext2D, t: number, a: number, flash: number) {
  const spin = t * 0.9; c.save(); c.globalAlpha = a; c.lineWidth = 2.2;
  const halo = c.createRadialGradient(GL.x, GL.y, GL.r * 0.6, GL.x, GL.y, GL.r * 1.5); halo.addColorStop(0, `rgba(217,130,139,${0.12 + flash * 0.4})`); halo.addColorStop(1, "rgba(217,130,139,0)"); c.fillStyle = halo; c.fillRect(GL.x - 400, GL.y - 400, 800, 800);
  const seg2 = (pts: [number, number, number][]) => { for (let i = 1; i < pts.length; i++) { const z = (pts[i][2] + pts[i - 1][2]) / 2; c.strokeStyle = z > 0 ? `rgba(242,184,192,${0.85})` : "rgba(217,130,139,0.22)"; c.beginPath(); c.moveTo(pts[i - 1][0], pts[i - 1][1]); c.lineTo(pts[i][0], pts[i][1]); c.stroke(); } };
  for (let m = 0; m < 12; m++) { const lon = (m / 12) * Math.PI * 2, pts: [number, number, number][] = []; for (let i = 0; i <= 32; i++) pts.push(globePoint(-Math.PI / 2 + (i / 32) * Math.PI, lon, spin)); seg2(pts); }
  for (let p = 1; p < 8; p++) { const lat = -Math.PI / 2 + (p / 8) * Math.PI, pts: [number, number, number][] = []; for (let i = 0; i <= 48; i++) pts.push(globePoint(lat, (i / 48) * Math.PI * 2, spin)); seg2(pts); }
  c.beginPath(); c.arc(GL.x, GL.y, GL.r, 0, Math.PI * 2); c.strokeStyle = `rgba(242,184,192,${0.9})`; c.lineWidth = 3; c.shadowColor = PINK; c.shadowBlur = 30; c.stroke();
  c.shadowBlur = 0; c.fillStyle = PINK_L; c.font = "600 34px Poppins"; c.textAlign = "center"; c.fillText("maison-lumen.fr", GL.x, GL.y + GL.r + 70);
  c.restore();
}
function glowLine(c: CanvasRenderingContext2D, pts: [number, number][], head: boolean) {
  c.save(); c.lineCap = "round"; c.lineJoin = "round";
  for (const [lw, col, bl] of [[16, "rgba(217,130,139,0.35)", 40], [6, "rgba(242,184,192,0.95)", 16], [2, "rgba(255,255,255,1)", 6]] as [number, string, number][]) { c.strokeStyle = col; c.lineWidth = lw; c.shadowColor = PINK; c.shadowBlur = bl; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }
  if (head && pts.length) { const [x, y] = pts[pts.length - 1]; c.globalCompositeOperation = "lighter"; const g = c.createRadialGradient(x, y, 0, x, y, 60); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(217,130,139,0)"); c.fillStyle = g; c.fillRect(x - 60, y - 60, 120, 120); }
  c.restore();
}
function crystal(c: CanvasRenderingContext2D, x: number, y: number, s: number, spin: number, alpha = 1) { // cristal hexagonal avec le logo, qui tourne sur lui-même
  const sx = Math.max(0.08, Math.abs(Math.cos(spin))), R = 110 * s;
  c.save(); c.globalAlpha = alpha; c.translate(x, y); c.scale(sx, 1);
  const g = c.createRadialGradient(0, 0, 0, 0, 0, R * 1.9); g.addColorStop(0, "rgba(255,236,240,0.55)"); g.addColorStop(1, "rgba(217,130,139,0)"); c.globalCompositeOperation = "lighter"; c.fillStyle = g; c.fillRect(-R * 2, -R * 2, R * 4, R * 4); c.globalCompositeOperation = "source-over";
  const P = [...Array(6)].map((_, i) => [Math.cos(-Math.PI / 2 + (i * Math.PI) / 3) * R, Math.sin(-Math.PI / 2 + (i * Math.PI) / 3) * R * 1.15]);
  for (let i = 0; i < 6; i++) { const [ax, ay] = P[i], [bx, by] = P[(i + 1) % 6]; c.beginPath(); c.moveTo(0, 0); c.lineTo(ax, ay); c.lineTo(bx, by); c.closePath(); c.fillStyle = `rgba(${lerp(242, 255, i / 5)},${lerp(160, 230, (i % 3) / 2)},${lerp(175, 236, (i % 2))},${0.55 + 0.1 * (i % 3)})`; c.fill(); }
  c.beginPath(); P.forEach(([px, py], i) => (i ? c.lineTo(px, py) : c.moveTo(px, py))); c.closePath(); c.strokeStyle = "#fff"; c.lineWidth = 4; c.shadowColor = PINK; c.shadowBlur = 30; c.stroke(); c.shadowBlur = 0;
  if (Math.cos(spin) > 0 && img.logo) { const L = 96 * s; c.save(); rr(c, -L / 2, -L / 2, L, L, 18 * s); c.clip(); c.drawImage(img.logo, -L / 2, -L / 2, L, L); c.restore(); }
  c.restore();
}
function paintSpace(c: CanvasRenderingContext2D, t: number) {
  c.fillStyle = SPACE; c.fillRect(0, 0, W, H);
  // sol en grille qui défile vers la caméra
  c.save(); c.strokeStyle = "rgba(217,130,139,0.18)"; c.lineWidth = 2; const hy = 1240;
  for (let i = -12; i <= 12; i++) { c.beginPath(); c.moveTo(540 + i * 30, hy); c.lineTo(540 + i * 260, H); c.stroke(); }
  for (let k = 0; k < 12; k++) { const u = ((k + (t * 1.5) % 1) / 12), y = hy + Math.pow(u, 2.2) * (H - hy); c.globalAlpha = u; c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
  c.restore();
  const r = rng(3); c.save(); for (let i = 0; i < 90; i++) { const x = r() * W, y = r() * 1200, tw = 0.3 + 0.7 * Math.abs(Math.sin(t * 2 + i)); c.fillStyle = `rgba(242,184,192,${0.35 * tw})`; c.fillRect(x, y, 2, 2); } c.restore();
  const outK = seg(t, T.what - 0.3, T.what + 0.2), a = 1 - outK;
  // le lien
  c.save(); c.globalAlpha = a * easeOut(seg(t, T.space, T.space + 0.3)); rr(c, PILL.x, PILL.y, PILL.w, PILL.h, 45); c.fillStyle = "#151418"; c.fill(); c.strokeStyle = PINK; c.lineWidth = 3; c.shadowColor = PINK; c.shadowBlur = 24; c.stroke(); c.shadowBlur = 0;
  c.fillStyle = WHITE; c.font = "600 32px 'Open Sans'"; c.textAlign = "center"; c.fillText(URL_TXT, 540, PILL.y + 57); c.restore();
  const flash = t >= T.hit ? Math.exp(-(t - T.hit) * 5) : 0, dim = t >= T.rip ? lerp(1, 0.45, seg(t, T.rip, T.rip + 0.5)) : 1;
  paintGlobe(c, t, a * dim * easeOut(seg(t, T.space + 0.1, T.space + 0.6)), flash);
  // flux d'énergie : du lien vers le globe
  if (t >= T.space + 0.25 && t < T.wrap1 + 0.3) {
    const k = easeIn(seg(t, T.space + 0.25, T.hit)), tail = seg(t, T.hit + 0.6, T.wrap1 + 0.3), pts: [number, number][] = [];
    for (let i = 0; i <= 40; i++) { const u = lerp(tail, k, i / 40); pts.push([lerp(540, GL.x, u) + Math.sin(u * Math.PI * 3) * 70 * (1 - u), lerp(PILL.y + PILL.h, GL.y - GL.r, u)]); }
    c.save(); c.globalAlpha = a; glowLine(c, pts, k < 1); c.restore();
  }
  // le flux rebondit et enveloppe le globe (spirale)
  if (t >= T.hit && t < T.rip + 0.3) {
    const k = easeInOut(seg(t, T.hit, T.wrap1)), tail = seg(t, T.wrap1 - 0.3, T.rip + 0.3), pts: [number, number][] = [];
    for (let i = 0; i <= 120; i++) { const u = lerp(tail, k, i / 120), lat = -Math.PI / 2 + 0.15 + u * (Math.PI - 0.3), lon = u * Math.PI * 6; const [x, y, z] = globePoint(lat, lon, t * 0.9); pts.push([x + (z < 0 ? 0 : 0), y]); }
    c.save(); c.globalAlpha = a; glowLine(c, pts, k < 1); c.restore();
  }
  // le logo arraché en cristal, qui tourne avec une traînée
  if (t >= T.rip && t < T.what + 0.05) {
    const k = easeOutExpo(seg(t, T.rip, T.rip + 0.5)), orbit = t > T.rip + 0.5 ? (t - T.rip - 0.5) : 0;
    const pos = (tt: number): [number, number] => { const o = tt > T.rip + 0.5 ? (tt - T.rip - 0.5) : 0, kk = easeOutExpo(seg(tt, T.rip, T.rip + 0.5)); return [lerp(GL.x, CRY.x, kk) + Math.sin(o * 3) * 70 * Math.min(1, o), lerp(GL.y, CRY.y, kk) + Math.sin(o * 6) * 22 * Math.min(1, o)]; };
    for (let g = 6; g >= 1; g--) { const [gx, gy] = pos(t - g * 0.035); crystal(c, gx, gy, lerp(0.3, 1, k), (t - g * 0.035) * 5, 0.09 * (7 - g)); }
    const [x, y] = pos(t); crystal(c, x, y, lerp(0.3, 1, k), t * 5 + orbit);
    if (t < T.rip + 0.25) { c.save(); c.globalCompositeOperation = "lighter"; const f = 1 - (t - T.rip) / 0.25, g = c.createRadialGradient(GL.x, GL.y, 0, GL.x, GL.y, 500); g.addColorStop(0, `rgba(255,255,255,${f})`); g.addColorStop(1, "rgba(217,130,139,0)"); c.fillStyle = g; c.fillRect(0, 500, W, 1200); c.restore(); }
  }
}

// ───────── WHAT + Outro : l'impact, la cascade, l'orbite de caméra ─────────
const docCanvas = mk(PW, PH);
function drawPlane(c: CanvasRenderingContext2D, im: HTMLCanvasElement, cx: number, cy: number, rotY: number, scale: number) { // page inclinée en 3D (bandes verticales)
  const FOC = 1800, N = 70, sw = PW / N, proj = (lx: number, ly: number): [number, number] => { const x3 = (lx - PW / 2) * scale, z = x3 * Math.sin(rotY), f = FOC / (FOC + z); return [cx + x3 * Math.cos(rotY) * f, cy + (ly - PH / 2) * scale * f]; };
  for (let s = 0; s < N; s++) { const [x0, y0] = proj(s * sw, 0), [x1] = proj((s + 1) * sw, 0), [, y1] = proj(s * sw, PH); c.drawImage(im, s * sw, 0, sw, PH, Math.min(x0, x1), y0, Math.abs(x1 - x0) + 0.8, y1 - y0); }
  return proj;
}
function paintWhat(c: CanvasRenderingContext2D, t: number) {
  c.fillStyle = SPACE; c.fillRect(0, 0, W, H);
  const appear = easeOut(seg(t, T.what - 0.1, T.what + 0.3)), orbit = easeInOut(seg(t, T.outro, 20)), theta = lerp(0, 0.5, orbit) - 0.25 * orbit, bob = Math.sin(t * 2) * 12 * seg(t, T.outro - 0.5, T.outro + 0.5);
  const halo = c.createRadialGradient(540, 980, 0, 540, 980, 900); halo.addColorStop(0, `rgba(217,130,139,${0.16 * appear})`); halo.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = halo; c.fillRect(0, 0, W, H);
  const dc = docCanvas!, p = dc.getContext("2d")!;
  // Les deux documents dans l'espace : CV derrière (z = 260), lettre devant (z = 0) ; la caméra tourne de theta.
  const docsZ = [{ kind: "cv", X: 120, Y: -80, Z: 260, sc: 1.0 }, { kind: "letter", X: -20, Y: 0, Z: 0, sc: 1.02 }];
  const glowCv = seg(t, T.glow, T.glow + 0.5);
  let slot: [number, number] = [0, 0], letterScale = 1;
  for (const d of docsZ) {
    const xr = d.X * Math.cos(theta) + d.Z * Math.sin(theta), zr = -d.X * Math.sin(theta) + d.Z * Math.cos(theta), f = 1600 / (1600 + zr);
    const cx = 540 + xr * f, cy = 980 + d.Y * f + (d.kind === "cv" ? -bob : bob), scale = d.sc * f * lerp(0.7, 1, appear);
    p.clearRect(0, 0, PW, PH);
    if (d.kind === "cv") paintCv(p, t >= T.glow ? img.logo : null, 0); else paintLetter(p, easeOut(seg(t, T.clack, T.cascade1)), t >= T.clack ? img.logo : null, t >= T.clack ? Math.exp(-(t - T.clack) * 8) : 0);
    c.save(); c.globalAlpha = appear * (d.kind === "cv" ? lerp(0.55, 0.95, glowCv) : 1);
    const corners = [[0, 0], [PW, 0], [PW, PH], [0, PH]];
    const FOC = 1800, proj = (lx: number, ly: number): [number, number] => { const x3 = (lx - PW / 2) * scale, z = x3 * Math.sin(theta), ff = FOC / (FOC + z); return [cx + x3 * Math.cos(theta) * ff, cy + (ly - PH / 2) * scale * ff]; };
    c.beginPath(); corners.forEach(([a, b], i) => { const [x, y] = proj(a, b); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath();
    const glow = d.kind === "cv" ? glowCv : 1; c.shadowColor = d.kind === "cv" ? `rgba(217,130,139,${0.3 + 0.6 * glow})` : "rgba(217,130,139,0.45)"; c.shadowBlur = d.kind === "cv" ? 30 + 60 * glow : 70; c.shadowOffsetY = 24; c.fillStyle = "#f6f1f2"; c.fill(); c.shadowColor = "transparent";
    drawPlane(c, dc, cx, cy, theta, scale);
    if (d.kind === "cv" && glowCv > 0 && glowCv < 1) { c.beginPath(); corners.forEach(([a, b], i) => { const [x, y] = proj(a, b); i ? c.lineTo(x, y) : c.moveTo(x, y); }); c.closePath(); c.strokeStyle = `rgba(242,184,192,${Math.sin(glowCv * Math.PI)})`; c.lineWidth = 6; c.shadowColor = PINK; c.shadowBlur = 40; c.stroke(); }
    c.restore();
    if (d.kind === "letter") { slot = proj(LOGO_SLOT.x + LOGO_SLOT.s / 2, LOGO_SLOT.y + LOGO_SLOT.s / 2); letterScale = scale; }
  }
  // le cristal fonce vers la caméra, puis s'écrase sur l'en-tête de la lettre
  if (t < T.clack) {
    const k1 = easeIn(seg(t, T.what, T.what + 0.35)), k2 = easeIn(seg(t, T.what + 0.35, T.clack));
    const x = lerp(lerp(CRY.x, 540, k1), slot[0], k2), y = lerp(lerp(CRY.y, 900, k1), slot[1], k2), s = lerp(lerp(1, 3.4, k1), (LOGO_SLOT.s * letterScale) / 190, k2);
    for (let g = 4; g >= 1; g--) crystal(c, lerp(x, CRY.x, g * 0.06), lerp(y, CRY.y, g * 0.06), s * (1 - g * 0.05), t * 6, 0.1 * (5 - g));
    crystal(c, x, y, s, t * 6);
  }
  if (t >= T.clack && t < T.clack + 0.7) { // impact : crochets mécaniques + onde
    const k = (t - T.clack) / 0.7, [x, y] = slot, s = (LOGO_SLOT.s / 2) * letterScale + 10, gap = lerp(46, 0, easeOut(Math.min(1, k * 4)));
    c.save(); c.strokeStyle = PINK; c.lineWidth = 6; c.shadowColor = PINK; c.shadowBlur = 24; c.globalAlpha = 1 - seg(k, 0.6, 1);
    for (const [sx2, sy2] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const cx = x + sx2 * (s + gap), cy = y + sy2 * (s + gap); c.beginPath(); c.moveTo(cx, cy - sy2 * 24); c.lineTo(cx, cy); c.lineTo(cx - sx2 * 24, cy); c.stroke(); }
    c.globalAlpha = 1 - k; c.beginPath(); c.arc(x, y, 50 + 420 * easeOut(k), 0, Math.PI * 2); c.lineWidth = 8 * (1 - k) + 1; c.stroke();
    c.globalCompositeOperation = "lighter"; const r = rng(9); for (let i = 0; i < 36; i++) { const a = r() * Math.PI * 2, d = 50 + easeOut(k) * (150 + r() * 260); c.strokeStyle = `rgba(255,236,240,${1 - k})`; c.lineWidth = 3; c.beginPath(); c.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d); c.lineTo(x + Math.cos(a) * (d + 30), y + Math.sin(a) * (d + 30)); c.stroke(); }
    c.restore();
  }
  // l'écran s'assombrit autour des documents (outro)
  const v = seg(t, T.outro, T.outro + 0.8); if (v > 0) { const g = c.createRadialGradient(540, 980, 350, 540, 980, 1100); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${0.75 * v})`); c.fillStyle = g; c.fillRect(0, 0, W, H); }
}

const Layer: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const c = ref.current!.getContext("2d")!; c.clearRect(0, 0, W, H); if (t < T.how) paintWhy(c, t); else if (t < T.space) return; else if (t < T.what) paintSpace(c, t); else paintWhat(c, t); }, [t]);
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0 }} />;
};

export const Onde: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const trem = t < T.split ? Math.sin(t * 70) * 7 * seg(t, 0.4, 2.5) : 0;
  const hit = (tc: number, a: number) => (t >= tc && t < tc + 0.25 ? Math.sin(t * 150) * a * (1 - (t - tc) / 0.25) : 0);
  const shake = trem + hit(T.clack, 20) + hit(T.split, 10) + hit(T.hit, 6);
  const pulse = 1 + 0.05 * Math.max(0, Math.sin((t - T.outro - 1.2) * 6));
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake * 0.6}px)` }}>
        {t >= T.how && t < T.space && <SceneUI t={t} />}
        <Layer t={t} />
      </div>
      <Text3D t={t} t0={2.8} t1={T.how} y={760} size={96} lines={[[["Ne postulez plus", WHITE]], [["au hasard.", PINK]]]} />
      <Text3D t={t} t0={T.how + 0.3} t1={7.85} y={70} size={84} lines={[[["Collez le lien", WHITE]], [["de l'offre.", PINK]]]} />
      <Text3D t={t} t0={T.space + 0.6} t1={T.what - 0.1} y={110} size={74} lines={[[["MyMotiv extrait", WHITE]], [["le logo officiel.", PINK]]]} />
      <Text3D t={t} t0={T.clack + 0.35} t1={T.outro} y={80} size={78} lines={[[["Votre lettre sur-mesure", WHITE]], [["en 30 s.", PINK]]]} />
      <Text3D t={t} t0={T.outro + 0.15} y={90} size={92} lines={[[["Sortez de la pile.", WHITE]], [["Foncez.", PINK]]]} />
      {t >= T.outro + 0.6 && (() => { const k = easeOut(seg(t, T.outro + 0.6, T.outro + 1.1)); return (
        <>
          <div style={{ position: "absolute", left: 540 - 340, top: 1560, width: 680, height: 132, borderRadius: 66, background: PINK, boxShadow: `0 0 ${30 + 500 * (pulse - 1)}px ${PINK}, 0 0 ${80 + 900 * (pulse - 1)}px rgba(217,130,139,0.6), inset 0 0 20px rgba(255,255,255,0.4)`, border: `3px solid ${PINK_L}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 52, color: "#2e1f22", opacity: k, transform: `translateY(${(1 - k) * 30}px) scale(${t > T.outro + 1.2 ? pulse : 1})` }}>Générer ma lettre</div>
          <div style={{ position: "absolute", top: 1740, width: W, textAlign: "center", fontFamily: "Open Sans", fontSize: 34, opacity: seg(t, T.outro + 1.0, T.outro + 1.5) }}>
            <b style={{ color: WHITE }}>+200 </b><b style={{ color: PINK }}>Motivés</b><span style={{ color: "#a99fa2" }}> nous font déjà confiance · Lien en bio</span>
          </div>
        </>); })()}
      {[[T.clack, 0.45], [T.space, 0.5], [T.how, 0.3], [T.rip, 0.25]].map(([tc, a]) => t >= tc && t < tc + 0.1 && <div key={tc} style={{ position: "absolute", inset: 0, background: `rgba(255,240,243,${a * (1 - (t - tc) / 0.1)})` }} />)}
      <Audio src={staticFile("audio/onde.wav")} />
    </AbsoluteFill>
  );
};
