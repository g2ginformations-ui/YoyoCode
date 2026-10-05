// « Le Cheat Code », version « Extraction du logo » (15 s).
// WHY : l'IA générique écrit une lettre banale puis plante → HOW : un lien collé, MyMotiv visite le site et extrait le logo
// pendant que la lettre s'écrit → WHAT : le logo vient frapper l'en-tête de la lettre (CLACK).
// L'interface MyMotiv vient des VRAIES captures du site ; le site de l'entreprise (Maison Lumen) est fictif.
import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { BG, PINK, PINK_L, WHITE, W, H, clamp, lerp, seg, easeOut, easeInOut, rng, rr, Text3D, Cursor, ShatterLayer } from "./common";

const T = { wave: 2.6, how: 4.0, paste: 4.4, click: 4.95, stream: 5.15, hit: 5.5, scan0: 5.7, scan1: 6.25, extract: 6.3, write0: 5.6, write1: 8.8, what: 9.0, fly: 9.55, clack: 10.0, final: 10.35, outro: 11.6 };
const URL_TXT = "carrieres.maison-lumen.fr/offre/manager-ventes";

// ───────── WHY ─────────
const SceneWhy: React.FC<{ t: number }> = ({ t }) => {
  const move = easeInOut(seg(t, 3.0, 3.9)), cx = lerp(810, 540, move), s = lerp(0.46, 0.66, move), lbl = 1 - seg(t, 2.7, 2.95);
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", left: move > 0 ? 0 : 540, top: 0, width: move > 0 ? W : 540, height: H, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: cx - 540 * s - (move > 0 ? 0 : 540), top: lerp(560, 640, move), width: 1080 * s, height: 1920 * s, borderRadius: 40 * s, overflow: "hidden", boxShadow: "0 0 90px rgba(217,130,139,0.35), 0 30px 60px rgba(0,0,0,0.6)" }}>
          <Img src={staticFile("shots/001-accueil.png")} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
      <ShatterLayer t={t} wave={T.wave} erase={false} />
      <div style={{ position: "absolute", top: 250, left: 0, width: 540, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "#9a9ca3", opacity: lbl }}>IA classique</div>
      <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", top: 232, left: 810 - 140, width: 280, opacity: lbl }} />
      <div style={{ position: "absolute", left: 539, top: 0, width: 2, height: H, background: "rgba(255,255,255,0.12)", opacity: 1 - seg(t, T.wave, T.wave + 0.3) }} />
      <Text3D t={t} t0={2.9} y={110} size={78} lines={[[["Fini les lettres", WHITE]], [["génériques", WHITE]], [["et les IA qui plantent.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── HOW ─────────
const S2 = { s: 1.18, offY: 245 };
const sx = (x: number) => 540 + (x - 540) * S2.s, sy = (y: number) => S2.offY + y * S2.s;
const FIELD = { x: sx(92.5), y: sy(428.3), w: 895 * S2.s, h: 117 * S2.s }, BTN = { x: sx(92.5), y: sy(565.3), w: 895 * S2.s, h: 117 * S2.s };
const PILL = { x: 70, y: 400, w: 940, h: 100 };           // le lien, une fois l'écran réduit
const GLOBE = { x: 805, y: 760 };                          // icône « site web »
const CARD = { x: 590, y: 620, w: 430, h: 350 };           // le site de l'entreprise, scanné
const ORB_REST = { x: 805, y: 1200 };                      // le logo extrait attend ici
// La lettre (page blanche) qui s'écrit, puis passe au premier plan.
const PW = 520, PH = 735;
const LINES: [string, string][] = [["h", "Camille Dubois"], ["m", "camille@exemple.fr · Lyon"], ["g", ""], ["s", "Objet : Candidature — Manager des ventes"], ["g", ""], ["t", "Madame, Monsieur,"], ["g", ""],
  ["t", "Accompagner une équipe jusqu'à ses objectifs :"], ["t", "c'est ce que je fais chaque jour chez Maison & Déco,"], ["t", "où j'ai fait progresser le panier moyen de 18 %."], ["g", ""],
  ["t", "Votre boutique de Lyon mise sur le conseil client"], ["t", "et la mise en scène des produits. Mon expérience"], ["t", "du management d'une équipe de 6 conseillers vous"], ["t", "permettra d'atteindre vos objectifs."], ["g", ""],
  ["t", "Disponible immédiatement, je serais ravie d'en"], ["t", "échanger lors d'un entretien."], ["g", ""], ["t", "Je vous prie d'agréer, Madame, Monsieur,"], ["t", "mes salutations distinguées."], ["g", ""], ["b", "Camille Dubois"]];
const TOTAL = LINES.reduce((n, [, s]) => n + Math.max(1, s.length), 0);
const YS = (() => { let y = 0; return LINES.map(([k]) => (y += k === "h" ? 54 : k === "g" ? 14 : k === "s" ? 34 : k === "m" ? 30 : 26)); })();
const LOGO = { x: PW - 118, y: 26, s: 84 };               // emplacement du logo dans l'en-tête de la lettre
function letterGeom(t: number) { // position de la page à l'écran
  const a = easeOut(seg(t, T.write0 - 0.3, T.write0 + 0.2)), m = easeInOut(seg(t, T.what, T.what + 0.7)), up = easeInOut(seg(t, T.outro, T.outro + 0.5));
  return { cx: lerp(300, 540, m), cy: lerp(lerp(1290, 1260, a), lerp(1010, 880, up), m), sc: lerp(0.95, lerp(1.32, 1.08, up), m), alpha: a, rot: lerp(-0.03, 0, m) };
}
function paintLetter(c: CanvasRenderingContext2D, t: number, logoK: number, flash: number) {
  rr(c, 0, 0, PW, PH, 14); c.fillStyle = "#fffdfd"; c.fill();
  let n = Math.floor(TOTAL * easeInOut(seg(t, T.write0, T.write1)));
  for (let k = 0; k < LINES.length; k++) {
    const [kind, s] = LINES[k], len = Math.max(1, s.length), shown = s.slice(0, Math.max(0, n)); n -= len;
    if (!s) { if (n < 0) break; continue; } if (!shown) break;
    c.font = kind === "h" ? "600 32px Poppins" : kind === "s" ? "600 17px Poppins" : kind === "b" ? "600 17px Poppins" : kind === "m" ? "400 15px 'Open Sans'" : "400 16px 'Liberation Serif', Georgia, serif";
    c.fillStyle = kind === "s" ? PINK : kind === "m" ? "#7a7174" : "#2a2326"; c.textAlign = "left"; c.fillText(shown, 38, 52 + YS[k]);
    if (n < 0) { const w = c.measureText(shown).width; c.fillStyle = PINK; c.fillRect(40 + w, 52 + YS[k] - 16, 3, 20); }
  }
  // Emplacement du logo : pointillés tant qu'il n'est pas arrivé
  if (logoK < 1) { c.save(); c.setLineDash([6, 6]); c.strokeStyle = "rgba(217,130,139,0.6)"; c.lineWidth = 2; rr(c, LOGO.x, LOGO.y, LOGO.s, LOGO.s, 16); c.stroke(); c.restore(); }
  if (flash > 0) { c.save(); c.globalCompositeOperation = "lighter"; const g = c.createRadialGradient(LOGO.x + LOGO.s / 2, LOGO.y + LOGO.s / 2, 0, LOGO.x + LOGO.s / 2, LOGO.y + LOGO.s / 2, 220); g.addColorStop(0, `rgba(255,255,255,${flash})`); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, PW, PH); c.restore(); }
}
function paintCv(c: CanvasRenderingContext2D) { // le CV, juste derrière la lettre
  rr(c, 0, 0, PW, PH, 14); c.fillStyle = "#f4eff0"; c.fill();
  c.fillStyle = "#2a2326"; c.font = "600 30px Poppins"; c.fillText("Camille Dubois", 38, 70); c.fillStyle = PINK; c.font = "600 18px Poppins"; c.fillText("Manager des ventes", 38, 100);
  let y = 150; for (const [h, items] of [["Expérience", ["Conseillère de vente · Maison & Déco", "Management d'une équipe de 6", "Panier moyen : +18 %"]], ["Formation", ["BTS Management des unités commerciales"]], ["Compétences", ["Équipe · Objectifs · Conseil client"]]] as [string, string[]][]) {
    c.fillStyle = PINK; c.font = "600 18px Poppins"; c.fillText(h, 38, y); c.fillStyle = "rgba(217,130,139,0.4)"; c.fillRect(38, y + 8, PW - 76, 1.5); y += 38;
    c.fillStyle = "#3a3236"; c.font = "400 15px 'Open Sans'"; for (const it of items) { c.fillText("• " + it, 44, y); y += 26; } y += 22;
  }
}
const pageCanvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
const logoImg = typeof Image !== "undefined" ? new Image() : null;
if (logoImg) { const h = delayRender("Logo de l'entreprise"); logoImg.onload = () => continueRender(h); logoImg.src = staticFile("company.png"); }

const HowWhatLayer: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!.getContext("2d")!; c.clearRect(0, 0, W, H);
    const pill = easeInOut(seg(t, 5.05, 5.4)); // l'écran se réduit au lien
    // Le lien (pastille), en haut
    if (t >= 5.05 && t < T.what + 0.3) {
      const a = pill * (1 - seg(t, T.what, T.what + 0.3)), y = lerp(FIELD.y, PILL.y, pill), h = lerp(FIELD.h, PILL.h, pill);
      c.save(); c.globalAlpha = a; rr(c, PILL.x, y, PILL.w, h, h / 2); c.fillStyle = "#151214"; c.fill(); c.strokeStyle = PINK; c.lineWidth = 3; c.shadowColor = PINK; c.shadowBlur = 24; c.stroke(); c.shadowBlur = 0;
      c.fillStyle = WHITE; c.font = "600 34px 'Open Sans'"; c.textAlign = "center"; c.fillText(URL_TXT, 540, y + h / 2 + 12); c.restore();
    }
    // Flux de données lumineux : du lien vers l'icône « site web »
    if (t >= T.stream && t < T.hit + 0.35) {
      c.save(); c.globalCompositeOperation = "lighter";
      const x0 = 800, y0 = PILL.y + PILL.h, path = (u: number) => [lerp(x0, GLOBE.x, u) + Math.sin(u * Math.PI) * 60, lerp(y0, GLOBE.y - 70, u)];
      const head = seg(t, T.stream, T.hit), tail = seg(t, T.stream + 0.12, T.hit + 0.3);
      for (let i = 0; i < 70; i++) { const u = lerp(tail, head, i / 69); const [x, y] = path(u); const r = rng(i * 7 + Math.floor(t * 30)); c.fillStyle = `rgba(${i % 3 ? "242,184,192" : "255,255,255"},${0.35 + 0.6 * (i / 69)})`; c.beginPath(); c.arc(x + (r() - 0.5) * 14, y + (r() - 0.5) * 14, 2 + 4 * (i / 69), 0, Math.PI * 2); c.fill(); }
      c.restore();
    }
    // Icône « site web » frappée, qui s'ouvre sur le site de l'entreprise
    if (t >= 5.2 && t < T.what + 0.3) {
      const out = 1 - seg(t, T.what, T.what + 0.3), pop = t < T.hit ? easeOut(seg(t, 5.2, 5.4)) : 1, open = easeInOut(seg(t, T.hit + 0.05, T.hit + 0.3));
      c.save(); c.globalAlpha = out;
      if (open < 1) { // globe
        const r = 64 * pop * (1 + (t >= T.hit && t < T.hit + 0.12 ? 0.25 : 0)); c.globalAlpha = out * (1 - open);
        c.beginPath(); c.arc(GLOBE.x, GLOBE.y, r, 0, Math.PI * 2); c.fillStyle = "#1c181b"; c.fill(); c.strokeStyle = PINK; c.lineWidth = 4; c.shadowColor = PINK; c.shadowBlur = 30; c.stroke(); c.shadowBlur = 0;
        c.strokeStyle = PINK_L; c.lineWidth = 3; c.beginPath(); c.arc(GLOBE.x, GLOBE.y, r * 0.62, 0, Math.PI * 2); c.stroke(); c.beginPath(); c.ellipse(GLOBE.x, GLOBE.y, r * 0.28, r * 0.62, 0, 0, Math.PI * 2); c.stroke();
        c.beginPath(); c.moveTo(GLOBE.x - r * 0.62, GLOBE.y); c.lineTo(GLOBE.x + r * 0.62, GLOBE.y); c.stroke();
      }
      if (open > 0) { // la carte du site (maquette neutre d'un site d'entreprise fictif)
        const w = lerp(120, CARD.w, open), h = lerp(120, CARD.h, open), x = GLOBE.x - w / 2, y = lerp(GLOBE.y - 60, CARD.y, open);
        c.globalAlpha = out * open; rr(c, x, y, w, h, 20); c.fillStyle = "#f7f3f1"; c.fill(); c.strokeStyle = PINK; c.lineWidth = 3; c.stroke();
        c.save(); rr(c, x, y, w, h, 20); c.clip();
        c.fillStyle = "#e6dfdc"; c.fillRect(x, y, w, 46); c.fillStyle = "#fff"; rr(c, x + 16, y + 9, w - 32, 28, 14); c.fill();
        c.fillStyle = "#6b6064"; c.font = "600 18px 'Open Sans'"; c.textAlign = "left"; c.fillText("maison-lumen.fr", x + 32, y + 30);
        const lx = x + 24, ly = y + 70, extracted = t >= T.extract;
        if (logoImg && !extracted) c.drawImage(logoImg, lx, ly, 64, 64);
        if (extracted) { c.save(); c.setLineDash([5, 5]); c.strokeStyle = "rgba(217,130,139,0.8)"; c.lineWidth = 2; rr(c, lx, ly, 64, 64, 12); c.stroke(); c.restore(); }
        c.fillStyle = "#2a2326"; c.font = "700 24px Poppins"; c.fillText("Maison Lumen", lx + 80, ly + 42);
        c.fillStyle = "#d8cfcc"; for (let i = 0; i < 4; i++) c.fillRect(x + 24, y + 160 + i * 26, (w - 48) * (i % 2 ? 0.7 : 0.92), 12);
        c.fillStyle = "#e9e1de"; c.fillRect(x + 24, y + 270, w - 48, 40);
        // Scan laser du haut vers le bas
        if (t >= T.scan0 && t < T.scan1 + 0.05) {
          const k = seg(t, T.scan0, T.scan1), yy = y + 46 + k * (h - 46); c.globalCompositeOperation = "lighter";
          const g = c.createLinearGradient(0, yy - 50, 0, yy); g.addColorStop(0, "rgba(217,130,139,0)"); g.addColorStop(1, "rgba(217,130,139,0.5)"); c.fillStyle = g; c.fillRect(x, yy - 50, w, 50);
          c.fillStyle = "rgba(255,240,243,1)"; c.fillRect(x, yy - 2, w, 4);
        }
        c.restore();
        c.fillStyle = PINK_L; c.font = "600 26px Poppins"; c.textAlign = "center"; c.globalAlpha = out * open * seg(t, T.scan0, T.scan0 + 0.2); c.fillText(t < T.extract ? "Scan du site…" : "✓ Logo officiel trouvé", CARD.x + CARD.w / 2, CARD.y + CARD.h + 44);
      }
      c.restore();
    }
    // La page (CV derrière, puis lettre) — dessinées dans un canevas annexe puis posées à l'écran
    const g = letterGeom(t), pc = pageCanvas!; pc.width = PW; pc.height = PH; const p = pc.getContext("2d")!;
    if (t >= T.what) { // le CV s'ajuste silencieusement derrière la lettre
      const k = easeInOut(seg(t, T.what + 0.2, T.what + 0.9)); paintCv(p);
      c.save(); c.globalAlpha = k * 0.85; c.translate(g.cx + lerp(0, 150, k), g.cy - lerp(0, 60, k)); c.rotate(0.07 * k); c.scale(g.sc * 0.96, g.sc * 0.96);
      c.shadowColor = "rgba(0,0,0,0.6)"; c.shadowBlur = 40; c.drawImage(pc, -PW / 2, -PH / 2); c.restore();
    }
    if (g.alpha > 0) {
      const logoK = seg(t, T.clack, T.clack + 0.01), flash = t >= T.clack ? Math.exp(-(t - T.clack) * 9) : 0;
      p.clearRect(0, 0, PW, PH); paintLetter(p, t, logoK, flash);
      if (logoImg && logoK >= 1) { p.save(); rr(p, LOGO.x, LOGO.y, LOGO.s, LOGO.s, 16); p.clip(); p.drawImage(logoImg, LOGO.x, LOGO.y, LOGO.s, LOGO.s); p.restore(); }
      const bump = t >= T.clack && t < T.clack + 0.18 ? 1 + 0.03 * Math.sin(((t - T.clack) / 0.18) * Math.PI) : 1;
      c.save(); c.globalAlpha = g.alpha; c.translate(g.cx, g.cy); c.rotate(g.rot); c.scale(g.sc * bump, g.sc * bump); c.shadowColor = t >= T.what ? "rgba(217,130,139,0.45)" : "rgba(0,0,0,0.6)"; c.shadowBlur = 60; c.drawImage(pc, -PW / 2, -PH / 2); c.restore();
    }
    // La particule lumineuse qui contient le logo
    const logoScreen = () => { const lx = (LOGO.x + LOGO.s / 2 - PW / 2) * g.sc, ly = (LOGO.y + LOGO.s / 2 - PH / 2) * g.sc; return [g.cx + lx * Math.cos(g.rot) - ly * Math.sin(g.rot), g.cy + lx * Math.sin(g.rot) + ly * Math.cos(g.rot)]; };
    if (t >= T.extract && t < T.clack) {
      const src = [CARD.x + 24 + 32, CARD.y + 70 + 32], k1 = easeOut(seg(t, T.extract, T.extract + 0.4));
      let [x, y] = [lerp(src[0], ORB_REST.x, k1), lerp(src[1], ORB_REST.y, k1)];
      if (t < T.fly) { y += Math.sin(t * 5) * 8 * k1; }
      if (t >= T.what) { const k0 = easeInOut(seg(t, T.what, T.fly)); x = lerp(ORB_REST.x, 860, k0); y = lerp(ORB_REST.y, 330, k0); }
      if (t >= T.fly) { const [tx, ty] = logoScreen(), k = seg(t, T.fly, T.clack), e = k * k * k; x = lerp(860, tx, e); y = lerp(330, ty, e) - Math.sin(k * Math.PI) * 120; }
      c.save(); c.globalCompositeOperation = "lighter";
      for (let i = 4; i >= 1; i--) { const rg = c.createRadialGradient(x, y, 0, x, y, 40 * i); rg.addColorStop(0, `rgba(255,236,240,${0.18 * (5 - i) / 4 + 0.1})`); rg.addColorStop(1, "rgba(217,130,139,0)"); c.fillStyle = rg; c.fillRect(x - 40 * i, y - 40 * i, 80 * i, 80 * i); }
      c.restore();
      if (logoImg) { c.save(); c.beginPath(); c.arc(x, y, 34, 0, Math.PI * 2); c.clip(); c.drawImage(logoImg, x - 34, y - 34, 68, 68); c.restore(); c.save(); c.beginPath(); c.arc(x, y, 36, 0, Math.PI * 2); c.strokeStyle = "#fff"; c.lineWidth = 3; c.shadowColor = PINK; c.shadowBlur = 30; c.stroke(); c.restore(); }
      const r = rng(Math.floor(t * 30)); c.save(); c.globalCompositeOperation = "lighter"; for (let i = 0; i < 18; i++) { const a = r() * Math.PI * 2, d = 40 + r() * 50; c.fillStyle = "rgba(242,184,192,0.7)"; c.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 3, 3); } c.restore();
    }
    // Impact : onde rose + éclats
    if (t >= T.clack && t < T.clack + 0.6) {
      const [x, y] = logoScreen(), k = (t - T.clack) / 0.6; c.save();
      c.beginPath(); c.arc(x, y, 50 + 320 * easeOut(k), 0, Math.PI * 2); c.strokeStyle = `rgba(217,130,139,${1 - k})`; c.lineWidth = 8 * (1 - k) + 1; c.shadowColor = PINK; c.shadowBlur = 30; c.stroke();
      c.globalCompositeOperation = "lighter"; const r = rng(4); for (let i = 0; i < 30; i++) { const a = r() * Math.PI * 2, d = 40 + easeOut(k) * (120 + r() * 200); c.strokeStyle = `rgba(255,236,240,${1 - k})`; c.lineWidth = 3; c.beginPath(); c.moveTo(x + Math.cos(a) * d, y + Math.sin(a) * d); c.lineTo(x + Math.cos(a) * (d + 24), y + Math.sin(a) * (d + 24)); c.stroke(); }
      c.restore();
    }
  }, [t]);
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0 }} />;
};

const SceneHowWhat: React.FC<{ t: number }> = ({ t }) => {
  const shot = t < T.paste ? "004-offre-vide" : t < T.click + 0.05 ? "018-offre-lien" : "019-offre-lecture";
  const push = easeOut(seg(t, T.how, T.how + 0.7)), pressBtn = t >= T.click && t < T.click + 0.12;
  const shrink = easeInOut(seg(t, 5.05, 5.45)); // l'écran s'efface, le lien reste
  const shake = t >= T.clack && t < T.clack + 0.2 ? Math.sin(t * 150) * 12 * (1 - (t - T.clack) / 0.2) : 0;
  const cur = t > T.paste + 0.05 && t < 5.2 ? (() => { const k = easeOut(seg(t, T.paste + 0.05, T.paste + 0.4)); return [lerp(1000, 640, k), lerp(1500, BTN.y + 60, k)]; })() : null;
  return (
    <AbsoluteFill style={{ background: BG, transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
      <div style={{ position: "absolute", left: 540 - 540 * S2.s, top: S2.offY, width: 1080 * S2.s, height: 1920 * S2.s, opacity: 1 - shrink, transform: `scale(${lerp(1.06, 1, push)})`, transformOrigin: "50% 30%" }}>
        <Img src={staticFile(`shots/${shot}.png`)} style={{ width: "100%", height: "100%" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: S2.offY + 10, background: BG }} />
      {t >= T.paste && t < T.paste + 0.12 && <div style={{ position: "absolute", left: FIELD.x, top: FIELD.y, width: FIELD.w, height: FIELD.h, borderRadius: 18, background: `rgba(242,184,192,${0.5 * (1 - (t - T.paste) / 0.12)})` }} />}
      {pressBtn && <div style={{ position: "absolute", left: BTN.x, top: BTN.y, width: BTN.w, height: BTN.h, borderRadius: 18, background: "rgba(255,255,255,0.45)" }} />}
      {t >= T.what - 0.3 && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 48%, rgba(217,130,139,${0.16 * seg(t, T.what - 0.3, T.what + 0.6)}) 0%, rgba(0,0,0,0) 60%)` }} />}
      <HowWhatLayer t={t} />
      {cur && <Cursor x={cur[0]} y={cur[1]} press={pressBtn} />}
      {t >= T.click && t < T.click + 0.4 && cur && <div style={{ position: "absolute", left: cur[0] - 20 - 150 * easeOut((t - T.click) / 0.4), top: cur[1] - 20 - 150 * easeOut((t - T.click) / 0.4), width: 40 + 300 * easeOut((t - T.click) / 0.4), height: 40 + 300 * easeOut((t - T.click) / 0.4), borderRadius: "50%", border: `6px solid rgba(255,255,255,${1 - (t - T.click) / 0.4})` }} />}
      {/* Texte par étapes : « 1 lien collé. » … « MyMotiv visite le site et extrait le logo… » */}
      <Text3D t={t} t0={T.paste + 0.05} t1={T.what} y={70} size={100} lines={[[["1 lien collé.", WHITE]]]} />
      <Text3D t={t} t0={T.stream + 0.15} t1={T.what} y={200} size={62} lines={[[["MyMotiv visite le site", PINK]], [["et extrait le logo…", PINK]]]} />
      <Text3D t={t} t0={T.final} y={110} size={76} lines={[[["…directement sur ta", WHITE]], [["lettre sur-mesure.", PINK]]]} />
      {/* Outro */}
      <div style={{ position: "absolute", top: 1420, width: W, textAlign: "center", fontFamily: "Open Sans", fontSize: 38, opacity: easeOut(seg(t, T.outro + 0.3, T.outro + 0.9)) }}>
        <b style={{ color: WHITE }}>+200 </b><b style={{ color: PINK }}>Motivés</b><span style={{ color: "#a99fa2" }}> nous font déjà confiance</span>
      </div>
      {t >= T.outro + 0.6 && (() => { const k = easeOut(seg(t, T.outro + 0.6, T.outro + 1.0)), pulse = 1 + 0.04 * Math.max(0, Math.sin((t - T.outro - 1.0) * 6)) * (t > T.outro + 1 ? 1 : 0); return (
        <div style={{ position: "absolute", left: 540 - 330, top: 1500, width: 660, height: 128, borderRadius: 64, background: PINK, boxShadow: `0 0 ${40 + 400 * (pulse - 1)}px ${PINK}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 50, color: "#2e1f22", opacity: k, transform: `translateY(${(1 - k) * 30}px) scale(${pulse})` }}>Générer ma lettre</div>); })()}
      <div style={{ position: "absolute", top: 1690, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "#cfc6c9", opacity: seg(t, T.outro + 1.0, T.outro + 1.4) }}>Lien en bio</div>
      {t >= T.clack && t < T.clack + 0.1 && <div style={{ position: "absolute", inset: 0, background: `rgba(255,255,255,${0.4 * (1 - (t - T.clack) / 0.1)})` }} />}
    </AbsoluteFill>
  );
};

export const CheatCodeLogo: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {t < T.how ? <SceneWhy t={t} /> : <SceneHowWhat t={t} />}
      {t >= T.how && t < T.how + 0.12 && <div style={{ position: "absolute", inset: 0, background: `rgba(255,240,243,${0.35 * (1 - (t - T.how) / 0.12)})` }} />}
      <Audio src={staticFile("audio/cheat-code-logo.wav")} />
    </AbsoluteFill>
  );
};
