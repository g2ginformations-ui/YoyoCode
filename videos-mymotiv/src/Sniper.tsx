// Concept 2 « Le Sniper » (version ciblage et extraction du logo), 15 s.
// WHY : la noyade sur un site d'emploi (générique, sans marque), le viseur verrouille UNE offre →
// HOW : la boucle d'extraction (lien analysé → site scanné, logo extrait → intégration dans la lettre) →
// WHAT : le logo s'écrase sur la lettre puis sur le CV (CLACK), mots-clés de l'offre repris 6/6.
// La zone « lien de l'offre » est une VRAIE capture du site MyMotiv ; Maison Lumen et son site sont fictifs.
import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { BG, PINK, PINK_L, WHITE, W, H, clamp, lerp, seg, easeOut, easeIn, easeInOut, rng, rr, Text3D } from "./common";
import { PH, PW, LOGO_SLOT, paintCv, paintLetter } from "./documents";

const T = { stop: 2.3, dark: 2.2, lock: 2.85, how: 4.0, radar1: 5.5, ab: 5.6, scan0: 6.1, scan1: 6.75, rip: 6.85, bc: 7.4, write0: 7.6, write1: 9.6, loop0: 9.3, loop1: 9.9, what: 10.0, clack1: 10.55, clack2: 10.85, count0: 11.1, count1: 11.8, final: 12.2, outro: 13.0 };

// Images (chargées une fois, le rendu attend qu'elles soient prêtes).
const img: Record<string, HTMLImageElement> = {};
if (typeof Image !== "undefined") {
  for (const [k, f] of [["logo", "company.png"], ["mm", "logo-mymotiv.png"], ["field", "shots/018-offre-lien.png"]]) {
    const h = delayRender(`Image ${f}`), i = new Image(); i.onload = () => continueRender(h); i.src = staticFile(f); img[k] = i;
  }
}
const off = typeof document !== "undefined" ? document.createElement("canvas") : null;

// ───────── WHY : le site d'emploi qui défile, les lettres identiques qui s'empilent ─────────
const JOBS = ["Conseiller de vente (CDI)", "Chargé de clientèle", "Vendeur polyvalent", "Responsable de rayon", "Assistant commercial", "Conseiller en boutique", "Commercial terrain", "Hôte de caisse"];
const COS = ["Atelier Nova", "Boréal Logistique", "Groupe Arcadie", "Vertigo Retail", "Les Halles du Sud", "Maison Orsel", "Altis Conseil"];
const CARD_H = 172, GAP = 22, STEP = CARD_H + GAP, TARGET = 30, BASE = 300, LOCK_Y = 440;
const END = BASE + TARGET * STEP - LOCK_Y;
const scroll = (t: number) => END - 6200 * (1 - easeOut(seg(t, 0, T.stop)));
const cardY = (i: number, t: number) => BASE + i * STEP - scroll(t);
function jobCard(c: CanvasRenderingContext2D, i: number, y: number, t: number, target: boolean, alpha: number) {
  const r = rng(i * 13 + 7), title = target ? "Manager des ventes (CDI)" : JOBS[Math.floor(r() * JOBS.length)], co = target ? "Maison Lumen · Lyon" : `${COS[Math.floor(r() * COS.length)]} · Lyon`;
  const n = Math.floor(120 + r() * 300 + t * (40 + r() * 60));
  c.save(); c.globalAlpha = alpha; rr(c, 60, y, 960, CARD_H, 22); c.fillStyle = target ? "#221c20" : "#1d1d22"; c.fill(); c.strokeStyle = target ? PINK : "#33333a"; c.lineWidth = target ? 3 : 2; c.stroke();
  c.fillStyle = "#3a3a44"; rr(c, 92, y + 34, 76, 76, 16); c.fill(); c.fillStyle = "#8d8d98"; c.font = "700 34px Poppins"; c.textAlign = "center"; c.fillText((target ? "M" : co[0]), 130, y + 84);
  c.textAlign = "left"; c.fillStyle = "#ececf0"; c.font = "600 34px Poppins"; c.fillText(title, 196, y + 64);
  c.fillStyle = "#9a9aa6"; c.font = "400 26px 'Open Sans'"; c.fillText(co, 196, y + 104);
  c.fillStyle = "#7b7b86"; c.font = "600 22px 'Open Sans'"; c.fillText(`${n} candidatures`, 196, y + 142);
  rr(c, 830, y + 108, 160, 46, 23); c.fillStyle = "#30303a"; c.fill(); c.fillStyle = "#c9c9d2"; c.font = "600 22px Poppins"; c.textAlign = "center"; c.fillText("Postuler", 910, y + 139);
  c.restore();
}
const BLAND = ["Madame, Monsieur,", "Je me permets de vous adresser", "ma candidature pour le poste", "proposé au sein de votre société…"];
function blandLetter(c: CanvasRenderingContext2D, x: number, y: number, rot: number, a: number) {
  c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(rot); rr(c, -250, -150, 500, 300, 14); c.fillStyle = "#b9b9c0"; c.shadowColor = "rgba(0,0,0,0.6)"; c.shadowBlur = 24; c.fill(); c.shadowBlur = 0;
  c.fillStyle = "#5d5d66"; c.font = "400 24px 'Liberation Serif', Georgia, serif"; c.textAlign = "left"; BLAND.forEach((l, i) => c.fillText(l, -214, -92 + i * 36));
  c.fillStyle = "#9c9ca4"; for (let i = 0; i < 2; i++) c.fillRect(-214, 62 + i * 30, i ? 260 : 400, 12); c.restore();
}
function reticle(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, k: number, t: number, locked: boolean) {
  c.save(); c.strokeStyle = PINK; c.shadowColor = PINK; c.shadowBlur = 24; c.lineWidth = 6; const L = 46, gap = lerp(140, 0, k);
  const x0 = x - w / 2 - gap, x1 = x + w / 2 + gap, y0 = y - h / 2 - gap, y1 = y + h / 2 + gap;
  for (const [cx, cy, sx, sy] of [[x0, y0, 1, 1], [x1, y0, -1, 1], [x0, y1, 1, -1], [x1, y1, -1, -1]]) { c.beginPath(); c.moveTo(cx, cy + sy * L); c.lineTo(cx, cy); c.lineTo(cx + sx * L, cy); c.stroke(); }
  c.lineWidth = 2; c.globalAlpha = 0.8; c.beginPath(); c.arc(x, y, 34 + 6 * Math.sin(t * 12), 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.moveTo(x - 70, y); c.lineTo(x - 20, y); c.moveTo(x + 20, y); c.lineTo(x + 70, y); c.moveTo(x, y - 70); c.lineTo(x, y - 20); c.moveTo(x, y + 20); c.lineTo(x, y + 70); c.stroke();
  c.globalAlpha = 1; c.shadowBlur = 0; c.font = "600 24px Poppins"; c.fillStyle = PINK_L; c.textAlign = "left"; c.fillText(locked ? "CIBLE VERROUILLÉE" : "RECHERCHE…", x0, y0 - 18);
  c.restore();
}
function paintWhy(c: CanvasRenderingContext2D, t: number) {
  c.fillStyle = "#121216"; c.fillRect(0, 0, W, H);
  const v = t < T.stop ? 6200 * 3 * Math.pow(1 - seg(t, 0, T.stop), 2) / T.stop : 0; // vitesse (px/s) pour le flou de mouvement
  for (let i = -6; i < 40; i++) {
    const y = cardY(i, t); if (y < 140 || y > H) continue;
    const ghosts = Math.min(4, Math.floor(v / 1500));
    for (let g = ghosts; g >= 0; g--) jobCard(c, i, y + g * v * 0.012, t, false, g ? 0.18 : 1);
  }
  // En-tête du site d'emploi (générique)
  c.fillStyle = "#18181d"; c.fillRect(0, 0, W, 250); c.fillStyle = "#2a2a31"; c.fillRect(0, 248, W, 2);
  c.fillStyle = "#e6e6ec"; c.font = "700 44px Poppins"; c.textAlign = "left"; c.fillText("Offres d'emploi", 60, 110);
  rr(c, 60, 145, 960, 76, 38); c.fillStyle = "#24242b"; c.fill(); c.fillStyle = "#9a9aa6"; c.font = "400 30px 'Open Sans'"; c.fillText("commercial · Lyon", 110, 194);
  // Les lettres identiques qui s'empilent
  for (let i = 0; i < 16; i++) {
    const t0 = 0.25 + i * 0.12, k = seg(t, t0, t0 + 0.28); if (k <= 0) continue;
    const r = rng(i * 31 + 5), x = 540 + (r() - 0.5) * 140, yEnd = 1660 - i * 16, y = lerp(-200, yEnd, easeIn(k)), rot = (r() - 0.5) * 0.3;
    blandLetter(c, x, y, rot * k, 1);
  }
  // Assombrissement soudain + la cible reste lumineuse
  const d = seg(t, T.dark, T.dark + 0.08);
  if (d > 0) { c.fillStyle = `rgba(5,4,5,${0.82 * d})`; c.fillRect(0, 0, W, H); }
  if (t >= T.dark) {
    const y = cardY(TARGET, t), lift = easeOut(seg(t, T.lock, T.lock + 0.3));
    c.save(); c.translate(540, y + CARD_H / 2); c.scale(1 + 0.04 * lift, 1 + 0.04 * lift); c.translate(-540, -(y + CARD_H / 2));
    c.shadowColor = PINK; c.shadowBlur = 50 * lift; jobCard(c, TARGET, y, t, true, 1); c.restore();
    const k = easeOut(seg(t, 2.3, T.lock)), hx = lerp(820, 540, k) + (1 - k) * Math.sin(t * 9) * 60, hy = lerp(1100, y + CARD_H / 2, k);
    reticle(c, hx, hy, lerp(200, 980, k), lerp(200, CARD_H + 10, k), k, t, t >= T.lock);
    if (t >= T.lock && t < T.lock + 0.25) { const f = (t - T.lock) / 0.25; c.save(); c.strokeStyle = `rgba(255,236,240,${1 - f})`; c.lineWidth = 4; rr(c, 60 - 30 * f, y - 30 * f, 960 + 60 * f, CARD_H + 60 * f, 26); c.stroke(); c.restore(); }
  }
}

// ───────── HOW : la boucle d'extraction ─────────
const A = { x: 90, y: 330, w: 900, h: 272 };              // nœud 1 : le champ du lien (vraie capture)
const B = { x: 610, y: 690, w: 410, h: 320 };             // nœud 2 : le site de l'entreprise
const C = { x: 540, y: 1330, sc: 0.72 };                  // nœud 3 : la lettre qui s'écrit
const CROP = { sx: 60, sy: 410, sw: 960, sh: 290 };       // zone de la capture 018 (champ + bouton)
type Pt = [number, number];
const PATH_AB: Pt[] = [[815, A.y + A.h], [815, B.y]];
const PATH_BC: Pt[] = [[B.x, B.y + B.h / 2], [C.x, B.y + B.h / 2], [C.x, C.y - (PH * C.sc) / 2]];
const PATH_CA: Pt[] = [[C.x - (PW * C.sc) / 2, C.y], [60, C.y], [60, A.y + A.h / 2], [A.x, A.y + A.h / 2]];
function along(path: Pt[], u: number): Pt { // point à la fraction u du chemin
  const lens = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1])), tot = lens.reduce((a, b) => a + b, 0);
  let d = clamp(u) * tot; for (let i = 0; i < lens.length; i++) { if (d <= lens[i]) { const k = lens[i] ? d / lens[i] : 0; return [lerp(path[i][0], path[i + 1][0], k), lerp(path[i][1], path[i + 1][1], k)]; } d -= lens[i]; }
  return path[path.length - 1];
}
function trace(c: CanvasRenderingContext2D, path: Pt[], u: number, t: number) { // ligne lumineuse qui se trace
  if (u <= 0) return; c.save(); c.lineCap = "round"; c.lineJoin = "round";
  const pts: Pt[] = []; for (let i = 0; i <= 60; i++) pts.push(along(path, (i / 60) * u));
  for (const [lw, col, blur] of [[10, "rgba(217,130,139,0.35)", 30], [4, "rgba(242,184,192,0.95)", 12]] as [number, string, number][]) { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.strokeStyle = col; c.lineWidth = lw; c.shadowColor = PINK; c.shadowBlur = blur; c.stroke(); }
  if (u < 1) { const [x, y] = pts[pts.length - 1]; c.globalCompositeOperation = "lighter"; const g = c.createRadialGradient(x, y, 0, x, y, 40); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(217,130,139,0)"); c.fillStyle = g; c.fillRect(x - 40, y - 40, 80, 80); }
  // impulsions qui circulent sur la ligne
  c.globalCompositeOperation = "lighter"; for (let k = 0; k < 3; k++) { const [x, y] = along(path, (((t * 0.9 + k / 3) % 1) * u)); c.fillStyle = "rgba(255,240,243,0.9)"; c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill(); }
  c.restore();
}
function siteCard(c: CanvasRenderingContext2D, t: number, open: number, ripped: boolean) {
  const w = lerp(130, B.w, open), h = lerp(130, B.h, open), x = B.x + B.w / 2 - w / 2, y = B.y + (B.h - h) / 2;
  if (open < 1) { // icône « site web »
    const cx = B.x + B.w / 2, cy = B.y + B.h / 2, r = 70 * (1 - open) + 10; c.save(); c.globalAlpha = 1 - open;
    c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fillStyle = "#1c181b"; c.fill(); c.strokeStyle = PINK; c.lineWidth = 4; c.shadowColor = PINK; c.shadowBlur = 26; c.stroke(); c.shadowBlur = 0;
    c.strokeStyle = PINK_L; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, r * 0.6, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.ellipse(cx, cy, r * 0.27, r * 0.6, 0, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.moveTo(cx - r * 0.6, cy); c.lineTo(cx + r * 0.6, cy); c.stroke(); c.restore();
  }
  if (open <= 0) return;
  c.save(); c.globalAlpha = open; rr(c, x, y, w, h, 20); c.fillStyle = "#f7f3f1"; c.fill(); c.strokeStyle = PINK; c.lineWidth = 3; c.stroke(); c.clip();
  c.fillStyle = "#e6dfdc"; c.fillRect(x, y, w, 48); c.fillStyle = "#fff"; rr(c, x + 16, y + 10, w - 32, 28, 14); c.fill();
  c.fillStyle = "#6b6064"; c.font = "600 19px 'Open Sans'"; c.textAlign = "left"; c.fillText("maison-lumen.fr", x + 32, y + 31);
  const lx = x + 26, ly = y + 74;
  if (!ripped) c.drawImage(img.logo, lx, ly, 70, 70); else { c.save(); c.setLineDash([5, 5]); c.strokeStyle = "rgba(217,130,139,0.9)"; c.lineWidth = 2; rr(c, lx, ly, 70, 70, 12); c.stroke(); c.restore(); }
  c.fillStyle = "#2a2326"; c.font = "700 26px Poppins"; c.fillText("Maison Lumen", lx + 88, ly + 45);
  c.fillStyle = "#d8cfcc"; for (let i = 0; i < 4; i++) c.fillRect(x + 26, y + 172 + i * 26, (w - 52) * (i % 2 ? 0.7 : 0.92), 12);
  c.fillStyle = "#e9e1de"; c.fillRect(x + 26, y + 272, w - 52, 30);
  if (t >= T.scan0 && t < T.scan1 + 0.05) { const k = seg(t, T.scan0, T.scan1), yy = y + 48 + k * (h - 48); c.globalCompositeOperation = "lighter"; const g = c.createLinearGradient(0, yy - 60, 0, yy); g.addColorStop(0, "rgba(217,130,139,0)"); g.addColorStop(1, "rgba(217,130,139,0.55)"); c.fillStyle = g; c.fillRect(x, yy - 60, w, 60); c.fillStyle = "#fff"; c.fillRect(x, yy - 2, w, 4); }
  c.restore();
}
function orb(c: CanvasRenderingContext2D, x: number, y: number, s = 1) {
  c.save(); c.globalCompositeOperation = "lighter";
  for (let i = 4; i >= 1; i--) { const g = c.createRadialGradient(x, y, 0, x, y, 40 * i * s); g.addColorStop(0, `rgba(255,236,240,${0.12 * (5 - i) + 0.08})`); g.addColorStop(1, "rgba(217,130,139,0)"); c.fillStyle = g; c.fillRect(x - 40 * i * s, y - 40 * i * s, 80 * i * s, 80 * i * s); }
  c.restore(); c.save(); c.beginPath(); c.arc(x, y, 34 * s, 0, Math.PI * 2); c.clip(); c.drawImage(img.logo, x - 34 * s, y - 34 * s, 68 * s, 68 * s); c.restore();
  c.save(); c.beginPath(); c.arc(x, y, 36 * s, 0, Math.PI * 2); c.strokeStyle = "#fff"; c.lineWidth = 3; c.shadowColor = PINK; c.shadowBlur = 30; c.stroke(); c.restore();
}
// Géométrie de la lettre et du CV (nœud 3, puis premier plan).
function docs(t: number) {
  const m = easeInOut(seg(t, T.what, T.what + 0.55));
  return { letter: { x: lerp(C.x, 470, m), y: lerp(C.y, 900, m), sc: lerp(C.sc, 1.02, m), rot: lerp(0, -0.02, m) }, cv: { x: lerp(C.x, 660, m), y: lerp(C.y, 820, m), sc: lerp(C.sc, 0.9, m), rot: lerp(0, 0.06, m), a: m } };
}
function slotScreen(d: { x: number; y: number; sc: number; rot: number }): Pt { const lx = (LOGO_SLOT.x + LOGO_SLOT.s / 2 - PW / 2) * d.sc, ly = (LOGO_SLOT.y + LOGO_SLOT.s / 2 - PH / 2) * d.sc; return [d.x + lx * Math.cos(d.rot) - ly * Math.sin(d.rot), d.y + lx * Math.sin(d.rot) + ly * Math.cos(d.rot)]; }
function place(c: CanvasRenderingContext2D, d: { x: number; y: number; sc: number; rot: number }, alpha: number, glow: string) {
  c.save(); c.globalAlpha = alpha; c.translate(d.x, d.y); c.rotate(d.rot); c.scale(d.sc, d.sc); c.shadowColor = glow; c.shadowBlur = 60; c.drawImage(off!, -PW / 2, -PH / 2); c.restore();
}
function paintHowWhat(c: CanvasRenderingContext2D, t: number) {
  c.fillStyle = BG; c.fillRect(0, 0, W, H);
  const why = 1 - seg(t, T.how, T.how + 0.35), nodes = 1 - seg(t, T.what, T.what + 0.4);
  // Nœud 1 : la vraie capture du champ, scannée par le radar
  if (nodes > 0) {
    const a = easeOut(seg(t, T.how + 0.05, T.how + 0.45)) * nodes;
    c.save(); c.globalAlpha = a; rr(c, A.x, A.y, A.w, A.h, 26); c.save(); c.clip(); c.drawImage(img.field, CROP.sx, CROP.sy, CROP.sw, CROP.sh, A.x, A.y, A.w, A.h); c.restore();
    c.strokeStyle = "rgba(242,184,192,0.6)"; c.lineWidth = 2; rr(c, A.x, A.y, A.w, A.h, 26); c.stroke(); c.restore();
    if (t < T.radar1 + 0.3) { // radar : le viseur devenu cercles + balayage
      const cx = 540, cy = A.y + A.h / 2, k = easeOut(seg(t, T.how, T.how + 0.5)), rad = lerp(420, 300, k), fade = 1 - seg(t, T.radar1, T.radar1 + 0.3);
      c.save(); c.globalAlpha = fade; c.strokeStyle = "rgba(217,130,139,0.7)"; c.lineWidth = 2; for (let i = 1; i <= 3; i++) { c.beginPath(); c.arc(cx, cy, (rad * i) / 3, 0, Math.PI * 2); c.stroke(); }
      const ang = t * 7; c.globalCompositeOperation = "lighter"; for (let i = 0; i < 24; i++) { const a0 = ang - i * 0.04; c.strokeStyle = `rgba(242,184,192,${0.8 * (1 - i / 24)})`; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a0) * rad, cy + Math.sin(a0) * rad); c.stroke(); }
      const r = rng(Math.floor(t * 8)); for (let i = 0; i < 5; i++) { c.fillStyle = "rgba(255,240,243,0.9)"; c.beginPath(); c.arc(A.x + 40 + r() * (A.w - 80), A.y + 60 + r() * 60, 5, 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
    if (t >= T.radar1 - 0.1 && t < T.radar1 + 0.4) { const f = seg(t, T.radar1 - 0.1, T.radar1 + 0.4); c.save(); c.strokeStyle = `rgba(127,214,164,${1 - f})`; c.lineWidth = 5; rr(c, A.x - 8, A.y - 8, A.w + 16, A.h + 16, 30); c.stroke(); c.restore(); }
    // Lignes du circuit
    trace(c, PATH_AB, easeIn(seg(t, T.ab, T.ab + 0.3)), t);
    trace(c, PATH_BC, easeIn(seg(t, T.bc, T.bc + 0.35)), t);
    trace(c, PATH_CA, easeInOut(seg(t, T.loop0, T.loop1)), t);
    // Nœud 2 : le site, ouvert par l'impact, scanné, logo arraché
    if (t >= T.ab + 0.2) { c.save(); c.globalAlpha = nodes; siteCard(c, t, easeInOut(seg(t, T.ab + 0.3, T.scan0)), t >= T.rip); c.restore(); }
  }
  // Nœud 3 / premier plan : CV derrière, lettre devant
  const d = docs(t), pc = off!; pc.width = PW; pc.height = PH; const p = pc.getContext("2d")!;
  if (t >= T.what) { p.clearRect(0, 0, PW, PH); paintCv(p, t >= T.clack2 ? img.logo : null, t >= T.clack2 ? Math.exp(-(t - T.clack2) * 9) : 0); place(c, d.cv, d.cv.a * 0.92, "rgba(0,0,0,0.6)"); }
  if (t >= T.bc + 0.2) {
    const a = easeOut(seg(t, T.bc + 0.2, T.bc + 0.5)), bump = (tc: number) => (t >= tc && t < tc + 0.18 ? 1 + 0.035 * Math.sin(((t - tc) / 0.18) * Math.PI) : 1);
    p.clearRect(0, 0, PW, PH); paintLetter(p, easeInOut(seg(t, T.write0, T.write1)), t >= T.clack1 ? img.logo : null, t >= T.clack1 ? Math.exp(-(t - T.clack1) * 9) : 0);
    place(c, { ...d.letter, sc: d.letter.sc * bump(T.clack1) }, a, t >= T.what ? "rgba(217,130,139,0.5)" : "rgba(0,0,0,0.6)");
  }
  // La particule « logo » : arrachée du site, ramenée au centre, puis écrasée sur la lettre et sur le CV
  if (t >= T.rip && t < T.clack2) {
    const src: Pt = [B.x + 26 + 35, B.y + 74 + 35], hover: Pt = [C.x + 250, C.y - 330];
    let pt: Pt;
    if (t < T.bc) pt = [lerp(src[0], src[0] + 40, easeOut(seg(t, T.rip, T.bc))), lerp(src[1], src[1] - 40, easeOut(seg(t, T.rip, T.bc)))];
    else if (t < T.what) { const k = easeInOut(seg(t, T.bc, T.bc + 0.6)); const a0: Pt = [src[0] + 40, src[1] - 40]; pt = [lerp(a0[0], hover[0], k), lerp(a0[1], hover[1], k) + Math.sin(t * 5) * 8 * k]; }
    else if (t < T.clack1) { const tgt = slotScreen(d.letter), k = seg(t, T.what + 0.15, T.clack1), e = k * k * k; pt = [lerp(hover[0], tgt[0], e), lerp(hover[1], tgt[1], e) - Math.sin(k * Math.PI) * 140]; }
    else { const s0 = slotScreen(d.letter), tgt = slotScreen(d.cv), k = seg(t, T.clack1 + 0.05, T.clack2), e = k * k; pt = [lerp(s0[0], tgt[0], e), lerp(s0[1], tgt[1], e) - Math.sin(k * Math.PI) * 90]; }
    if (!(t >= T.clack1 && t < T.clack1 + 0.05)) orb(c, pt[0], pt[1], t >= T.clack1 ? 0.8 : 1);
  }
  // Verrouillage mécanique : crochets qui se referment + onde, sur la lettre puis le CV
  for (const [tc, dd] of [[T.clack1, d.letter], [T.clack2, d.cv]] as [number, { x: number; y: number; sc: number; rot: number }][]) {
    if (t < tc || t > tc + 0.7) continue;
    const [x, y] = slotScreen(dd), k = (t - tc) / 0.7, s = (LOGO_SLOT.s / 2) * dd.sc + 10, gap = lerp(40, 0, easeOut(Math.min(1, k * 4)));
    c.save(); c.strokeStyle = PINK; c.lineWidth = 5; c.shadowColor = PINK; c.shadowBlur = 20; c.globalAlpha = 1 - seg(k, 0.6, 1);
    for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const cx = x + sx * (s + gap), cy = y + sy * (s + gap); c.beginPath(); c.moveTo(cx, cy - sy * 22); c.lineTo(cx, cy); c.lineTo(cx - sx * 22, cy); c.stroke(); }
    c.globalAlpha = 1 - k; c.beginPath(); c.arc(x, y, 40 + 260 * easeOut(k), 0, Math.PI * 2); c.lineWidth = 6 * (1 - k) + 1; c.stroke(); c.restore();
  }
  // Compteur : mots-clés de l'offre repris (fonction réelle du site)
  if (t >= T.count0 - 0.2) {
    const a = easeOut(seg(t, T.count0 - 0.2, T.count0 + 0.1)), n = Math.round(6 * easeOut(seg(t, T.count0, T.count1))), done = t >= T.count1, y = 1470;
    c.save(); c.globalAlpha = a; c.textAlign = "center";
    c.font = "700 120px Poppins"; c.fillStyle = done ? PINK : WHITE; c.shadowColor = done ? PINK : "transparent"; c.shadowBlur = done ? 30 : 0; const pop = done && t < T.count1 + 0.15 ? 1.08 : 1;
    c.translate(540, y); c.scale(pop, pop); c.fillText(`${n}/6`, 0, 0); c.restore();
    c.save(); c.globalAlpha = a; c.textAlign = "center"; c.font = "600 40px Poppins"; c.fillStyle = "#e9e1e3"; c.fillText("mots-clés de l'offre repris", 540, y + 64); c.restore();
  }
  if (why > 0) { c.save(); c.globalAlpha = why; paintWhy(c, Math.min(t, T.how)); c.restore(); }
}

const Layer: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => { const c = ref.current!.getContext("2d")!; c.clearRect(0, 0, W, H); if (t < T.how) paintWhy(c, t); else paintHowWhat(c, t); }, [t]);
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0 }} />;
};

export const Sniper: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const shake = (tc: number, a: number) => (t >= tc && t < tc + 0.22 ? Math.sin(t * 150) * a * (1 - (t - tc) / 0.22) : 0);
  const sx = shake(T.clack1, 16) + shake(T.clack2, 9) + shake(T.lock, 6);
  const step = t < T.ab ? 0 : t < T.bc ? 1 : 2;
  const steps: [string, string][] = [["Lien de l'offre", "analysé…"], ["…Scan du site et", "extraction du logo…"], ["…Intégration", "immédiate."]];
  const stepT0 = [T.how + 0.35, T.ab + 0.1, T.bc + 0.1][step];
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${sx}px, ${sx * 0.5}px)` }}><Layer t={t} /></div>
      <Text3D t={t} t0={2.95} t1={T.how} y={60} size={70} lines={[[["Ne postulez plus", WHITE]], [["avec les mêmes mots", WHITE]], [["que tout le monde.", PINK]]]} />
      {t >= T.how && t < T.what && <Text3D key={step} t={t} t0={stepT0} t1={step === 2 ? T.what : 99} y={90} size={68} lines={[[[steps[step][0], step === 0 ? WHITE : PINK_L]], [[steps[step][1], PINK]]]} />}
      <Text3D t={t} t0={T.final} y={70} size={92} lines={[[["Ta lettre d'élite.", WHITE]], [["Sors de la pile.", PINK]]]} />
      <div style={{ position: "absolute", top: 1660, width: W, textAlign: "center", fontFamily: "Open Sans", fontSize: 36, opacity: easeOut(seg(t, T.outro, T.outro + 0.6)) }}>
        <b style={{ color: WHITE }}>+200 </b><b style={{ color: PINK }}>Motivés</b><span style={{ color: "#a99fa2" }}> nous font déjà confiance</span>
      </div>
      <div style={{ position: "absolute", top: 1740, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 38, color: "#cfc6c9", opacity: seg(t, T.outro + 0.4, T.outro + 0.8) }}>Lien en bio</div>
      {[T.clack1, T.clack2].map((tc) => t >= tc && t < tc + 0.1 && <div key={tc} style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${(tc === T.clack1 ? 0.4 : 0.25) * (1 - (t - tc) / 0.1)})` }} />)}
      {t >= T.how && t < T.how + 0.1 && <div style={{ position: "absolute", inset: 0, background: `rgba(255,240,243,${0.3 * (1 - (t - T.how) / 0.1)})` }} />}
      <Audio src={staticFile("audio/sniper.wav")} />
    </AbsoluteFill>
  );
};
