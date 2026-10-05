// Concept 1 « Le Cheat Code » (15 s) : WHY (l'IA classique qui oublie tout) → HOW (un lien, zéro prompt) → WHAT (CV + lettre sur mesure).
// L'interface MyMotiv vient des VRAIES captures du site (public/shots). Le chat de gauche est une IA générique, sans marque.
import { useLayoutEffect, useRef } from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { BG, PINK, PINK_L, WHITE, W, H, clamp, lerp, seg, easeOut, easeIn, easeInOut, rng, rr, Text3D, Cursor, ShatterLayer } from "./common";

// Temps clés (secondes).
const T = { wave: 3.0, how: 5.0, drop: 5.9, click: 6.4, laser0: 6.5, laser1: 7.3, suck: 7.3, what: 10.0, burn: 11.6, align: 12.5, final: 13.0 };

// ───────── WHY : chat d'IA générique qui bugge, pulvérisé par l'onde rose ─────────
const SceneWhy: React.FC<{ t: number }> = ({ t }) => {
  const move = easeInOut(seg(t, 3.6, 4.6));
  const cx = lerp(810, 540, move), s = lerp(0.46, 0.72, move), lbl = 1 - seg(t, 3.1, 3.35);
  return (
    <AbsoluteFill style={{ background: BG }}>
      {/* Droite : la vraie interface MyMotiv, immobile */}
      <div style={{ position: "absolute", left: move > 0 ? 0 : 540, top: 0, width: move > 0 ? W : 540, height: H, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: cx - 540 * s - (move > 0 ? 0 : 540), top: lerp(560, 520, move), width: 1080 * s, height: 1920 * s, borderRadius: 40 * s, overflow: "hidden", boxShadow: "0 0 90px rgba(217,130,139,0.35), 0 30px 60px rgba(0,0,0,0.6)" }}>
          <Img src={staticFile("shots/001-accueil.png")} style={{ width: "100%", height: "100%" }} />
        </div>
      </div>
      <ShatterLayer t={t} wave={T.wave} />
      <div style={{ position: "absolute", top: 250, left: 0, width: 540, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "#9a9ca3", opacity: lbl }}>IA classique</div>
      <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", top: 232, left: 810 - 140, width: 280, opacity: lbl }} />
      <div style={{ position: "absolute", left: 539, top: 0, width: 2, height: H, background: "rgba(255,255,255,0.12)", opacity: 1 - seg(t, T.wave, T.wave + 0.3) }} />
      <Text3D t={t} t0={3.35} y={120} size={104} lines={[[["Fini les IA", WHITE]], [["qui oublient tout.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── HOW : le lien tombe, clic, scan laser, mots-clés aspirés ─────────
const S2 = { s: 1.18, offY: 245 }; // capture agrandie, champ du lien au premier plan
const sx = (x: number) => 540 + (x - 540) * S2.s, sy = (y: number) => S2.offY + y * S2.s;
const FIELD = { x: sx(92.5), y: sy(428.3), w: 895 * S2.s, h: 117 * S2.s }, BTN = { x: sx(92.5), y: sy(565.3), w: 895 * S2.s, h: 117 * S2.s };
const PARA: (string | [string])[] = ["Accompagner une ", ["équipe"], " jusqu'à ses ", ["objectifs"], " : c'est mon quotidien, entre ", ["conseil client"], " et ", ["mise en scène"], " des produits. Devenir votre ", ["Manager des ventes"], " à ", ["Lyon"], " est la suite logique."];
const PANEL = { x: 70, y: 1090, w: 940, h: 600 };
function layoutPara(c: CanvasRenderingContext2D) { // positions mot à mot du paragraphe (retour à la ligne automatique)
  c.font = "600 40px Poppins"; const out: { s: string; kw: boolean; x: number; y: number; w: number; idx: number }[] = []; let x = PANEL.x + 50, y = PANEL.y + 110, kwIdx = 0;
  for (const p of PARA) {
    const kw = Array.isArray(p), words = kw ? [p[0]] : (p as string).split(/(?<= )/);
    for (const wd of words) { const w = c.measureText(wd).width + (kw ? 24 : 0); if (x + w > PANEL.x + PANEL.w - 50 && wd.trim()) { x = PANEL.x + 50; y += 74; } out.push({ s: wd, kw, x, y, w, idx: kw ? kwIdx : -1 }); x += w + (kw ? 8 : 0); }
    if (kw) kwIdx++;
  }
  return out;
}
const HowLayer: React.FC<{ t: number }> = ({ t }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!.getContext("2d")!; c.clearRect(0, 0, W, H);
    // Le lien qui tombe lourdement
    if (t >= 5.3 && t < T.drop) {
      const k = easeIn(seg(t, 5.3, T.drop)), y = lerp(-160, FIELD.y + FIELD.h / 2, k);
      c.save(); c.translate(540, y); c.scale(1 - 0.06 * k, 1 + 0.12 * k); rr(c, -470, -46, 940, 92, 46); c.fillStyle = "#1c181b"; c.shadowColor = PINK; c.shadowBlur = 30; c.fill(); c.shadowBlur = 0; c.strokeStyle = PINK; c.lineWidth = 3; c.stroke();
      c.fillStyle = WHITE; c.font = "600 34px 'Open Sans'"; c.textAlign = "center"; c.fillText("carrieres.maison-lumen.fr/offre/manager-ventes", 0, 12); c.restore();
      for (let i = 0; i < 6; i++) { c.fillStyle = `rgba(242,184,192,${0.15 - i * 0.02})`; c.fillRect(70, y - 46 - i * 40 * k, 940, 4); } // traînée de vitesse
    }
    // Impact : poussière rose sur les bords du champ
    if (t >= T.drop && t < T.drop + 0.5) {
      const k = (t - T.drop) / 0.5, r = rng(8); c.save(); c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 60; i++) { const side = i % 2 ? 1 : -1, x = 540 + side * (480 + r() * 40 + k * 260 * r()), y = FIELD.y + r() * FIELD.h - k * 120 * r(); c.fillStyle = `rgba(242,184,192,${(1 - k) * 0.8})`; c.fillRect(x, y, 4, 4); }
      c.restore();
    }
    // Scan laser
    if (t >= T.laser0 && t < T.laser1 + 0.1) {
      const k = seg(t, T.laser0, T.laser1); c.save(); c.globalCompositeOperation = "lighter";
      for (let b = 0; b < 3; b++) {
        const ph = (k * (3 + b) + b * 0.33) % 1, x = FIELD.x + (b % 2 ? 1 - ph : ph) * FIELD.w;
        const g = c.createLinearGradient(x - 30, 0, x + 30, 0); g.addColorStop(0, "rgba(217,130,139,0)"); g.addColorStop(0.5, "rgba(255,225,230,0.95)"); g.addColorStop(1, "rgba(217,130,139,0)");
        c.fillStyle = g; c.fillRect(x - 30, FIELD.y - 30, 60, FIELD.h + 60);
        c.fillStyle = "rgba(255,255,255,0.95)"; c.fillRect(x - 1.5, FIELD.y - 60, 3, FIELD.h + 120);
      }
      const hy = FIELD.y + ((k * 6) % 1) * FIELD.h; c.fillStyle = "rgba(255,200,208,0.8)"; c.fillRect(FIELD.x, hy, FIELD.w, 3);
      c.strokeStyle = `rgba(242,184,192,${0.6 + 0.4 * Math.sin(t * 40)})`; c.lineWidth = 4; rr(c, FIELD.x - 6, FIELD.y - 6, FIELD.w + 12, FIELD.h + 12, 26); c.stroke();
      c.restore();
    }
    // Panneau + paragraphe qui s'assemble, mots-clés aspirés hors du lien
    if (t >= 7.15) {
      const pa = easeOut(seg(t, 7.15, 7.5));
      c.save(); c.globalAlpha = pa; rr(c, PANEL.x, PANEL.y + (1 - pa) * 40, PANEL.w, PANEL.h, 36); c.fillStyle = "rgba(28,24,27,0.94)"; c.fill(); c.strokeStyle = "rgba(242,184,192,0.55)"; c.lineWidth = 2; c.stroke();
      c.fillStyle = PINK_L; c.font = "600 30px Poppins"; c.fillText("Votre lettre", PANEL.x + 50, PANEL.y + 56); c.restore();
      const words = layoutPara(c); c.font = "600 40px Poppins";
      const textA = seg(t, 8.35, 9.0);
      for (const w of words) {
        if (!w.kw) { if (textA > 0) { c.globalAlpha = textA; c.fillStyle = "#efe8ea"; c.fillText(w.s, w.x, w.y); c.globalAlpha = 1; } continue; }
        const t0 = T.suck + 0.12 * w.idx, land = t0 + 0.55, k = seg(t, t0, land); if (k <= 0) continue;
        const sx0 = FIELD.x + 80 + (w.idx / 5) * (FIELD.w - 360), sy0 = FIELD.y + FIELD.h / 2 + 12;
        const e = easeInOut(k), bend = Math.sin(e * Math.PI) * (w.idx % 2 ? 160 : -160);
        const x = lerp(sx0, w.x, e) + bend, y = lerp(sy0, w.y, e), stretch = 1 + Math.sin(e * Math.PI) * 0.5;
        c.save(); c.translate(x, y - 14); c.scale(stretch, 1 / stretch);
        if (k >= 1) { rr(c, -6, -38, w.w - 6, 56, 14); c.fillStyle = "rgba(217,130,139,0.28)"; c.fill(); c.strokeStyle = PINK; c.lineWidth = 2; c.stroke(); }
        c.shadowColor = PINK; c.shadowBlur = k < 1 ? 26 : 0; c.fillStyle = k < 1 ? WHITE : PINK_L; c.fillText(w.s, 6, 2); c.restore();
        if (t >= land && t < land + 0.25) { const f = (t - land) / 0.25; c.save(); c.globalCompositeOperation = "lighter"; c.strokeStyle = `rgba(255,230,234,${1 - f})`; c.lineWidth = 3; rr(c, w.x - 6 - 10 * f, w.y - 52 - 10 * f, w.w + 8 + 20 * f, 56 + 20 * f, 16); c.stroke(); c.restore(); }
      }
      // Petit liseré : les traînées des mots aspirés depuis le champ
      if (t < 8.4) { c.save(); c.globalCompositeOperation = "lighter"; const r = rng(Math.floor(t * 30)); for (let i = 0; i < 40; i++) { const u = r(); c.fillStyle = `rgba(242,184,192,${0.4 * (1 - seg(t, 7.9, 8.4))})`; c.fillRect(FIELD.x + u * FIELD.w, FIELD.y + FIELD.h + r() * (PANEL.y - FIELD.y - FIELD.h), 3, 3 + r() * 20); } c.restore(); }
    }
  }, [t]);
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0 }} />;
};
const SceneHow: React.FC<{ t: number }> = ({ t }) => {
  const shot = t < T.drop ? "004-offre-vide" : t < T.click + 0.05 ? "018-offre-lien" : t < 7.0 ? "019-offre-lecture" : "020-offre-lue";
  const push = easeOut(seg(t, T.how, T.how + 0.8)), zs = lerp(1.0, 1, push);
  const shake = t >= T.drop && t < T.drop + 0.22 ? Math.sin(t * 160) * 16 * (1 - (t - T.drop) / 0.22) : 0;
  const dim = 1 - 0.65 * seg(t, 7.15, 7.6);
  const pressBtn = t >= T.click && t < T.click + 0.12;
  const cur = t > 5.95 && t < 7.2 ? (() => { const k = easeOut(seg(t, 5.95, 6.3)); return [lerp(1000, 640, k), lerp(1500, BTN.y + 60, k)]; })() : null;
  return (
    <AbsoluteFill style={{ background: BG, transform: `translate(${shake}px, ${shake * 0.5}px) scale(${lerp(1.08, 1, push) * zs})`, opacity: seg(t, T.how, T.how + 0.12) }}>
      <div style={{ position: "absolute", left: 540 - 540 * S2.s, top: S2.offY, width: 1080 * S2.s, height: 1920 * S2.s, opacity: dim }}>
        <Img src={staticFile(`shots/${shot}.png`)} style={{ width: "100%", height: "100%" }} />
      </div>
      <div style={{ position: "absolute", left: 0, top: 0, width: W, height: S2.offY + 10, background: BG }} />
      {pressBtn && <div style={{ position: "absolute", left: BTN.x, top: BTN.y, width: BTN.w, height: BTN.h, borderRadius: 18, background: "rgba(255,255,255,0.45)" }} />}
      <HowLayer t={t} />
      {cur && <Cursor x={cur[0]} y={cur[1]} press={pressBtn} />}
      {t >= T.click && t < T.click + 0.4 && cur && (
        <div style={{ position: "absolute", left: cur[0] - 20 - 160 * easeOut((t - T.click) / 0.4), top: cur[1] - 20 - 160 * easeOut((t - T.click) / 0.4), width: 40 + 320 * easeOut((t - T.click) / 0.4), height: 40 + 320 * easeOut((t - T.click) / 0.4), borderRadius: "50%", border: `6px solid rgba(255,255,255,${1 - (t - T.click) / 0.4})` }} />
      )}
      <Text3D t={t} t0={7.55} y={40} size={92} lines={[[["Un lien collé.", WHITE]], [["Zéro prompt.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── WHAT : CV + lettre en plaques de verre, logo gravé à chaud ─────────
const LETTER = ["Madame, Monsieur,", "", "Accompagner une équipe jusqu'à ses objectifs :", "c'est ce que je fais chaque jour chez Maison & Déco,", "où j'ai fait progresser le panier moyen de 18 %.", "", "Votre boutique de Lyon mise sur le conseil client", "et la mise en scène des produits. Mon expérience", "du terrain et du management d'une équipe de 6", "conseillers vous permettra d'atteindre vos objectifs.", "", "Disponible immédiatement, je serais ravie d'en", "échanger lors d'un entretien.", "", "Je vous prie d'agréer, Madame, Monsieur,", "mes salutations distinguées.", "", "Camille Dubois"];
const PW = 440, PH = 622;
const Plate: React.FC<{ kind: "cv" | "lettre"; t: number }> = ({ kind, t }) => {
  const burnK = seg(t, T.burn, T.burn + 0.7), heat = t >= T.burn ? Math.exp(-(t - T.burn) * 2.6) : 0;
  return (
    <div style={{ width: PW, height: PH, borderRadius: 22, background: "rgba(40,32,37,0.72)", border: "2px solid rgba(242,184,192,0.55)", boxShadow: "0 0 60px rgba(217,130,139,0.25), inset 0 1px 0 rgba(255,255,255,0.25)", padding: "34px 30px", boxSizing: "border-box", color: "#f3ecee", fontFamily: "Open Sans", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(125deg, rgba(255,255,255,0.16), rgba(255,255,255,0) 40%)" }} />
      <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 30 }}>Camille Dubois</div>
      {kind === "cv" ? (
        <>
          <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 19, color: PINK_L, marginTop: 4 }}>Manager des ventes</div>
          <div style={{ fontSize: 14, color: "#bdb2b5", marginTop: 4 }}>camille@exemple.fr · Lyon</div>
          {[["Expérience", ["Conseillère de vente · Maison & Déco", "Management d'une équipe de 6", "Panier moyen : +18 %", "Conseil client, mise en scène"]], ["Formation", ["BTS Management des unités commerciales"]]].map(([h, items]) => (
            <div key={h as string} style={{ marginTop: 22 }}>
              <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 17, color: PINK, borderBottom: "1px solid rgba(242,184,192,0.35)", paddingBottom: 4 }}>{h as string}</div>
              {(items as string[]).map((it) => <div key={it} style={{ fontSize: 15, marginTop: 8 }}>• {it}</div>)}
            </div>
          ))}
          <div style={{ marginTop: 22, fontFamily: "Poppins", fontWeight: 600, fontSize: 17, color: PINK }}>Compétences</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{["équipe", "objectifs", "conseil client", "Lyon"].map((k) => <span key={k} style={{ fontSize: 14, padding: "4px 12px", borderRadius: 20, border: `1px solid ${PINK}`, background: "rgba(217,130,139,0.18)" }}>{k}</span>)}</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 14, color: "#bdb2b5", marginTop: 4 }}>camille@exemple.fr · Lyon</div>
          <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 16, color: PINK, marginTop: 16 }}>Objet : Candidature — Manager des ventes</div>
          <div style={{ marginTop: 14, fontSize: 13.4, lineHeight: 1.5 }}>{LETTER.map((l, i) => <div key={i} style={{ minHeight: 10 }}>{l}</div>)}</div>
        </>
      )}
      {/* Logo de l'entreprise gravé à chaud en haut à droite */}
      {t >= T.burn && (
        <div style={{ position: "absolute", right: 24, top: 24, width: 74, height: 74 }}>
          <div style={{ position: "absolute", inset: -40 * (1 - burnK) - 10, borderRadius: "50%", background: `radial-gradient(circle, rgba(255,250,240,${heat}) 0%, rgba(255,160,90,${heat * 0.9}) 35%, rgba(217,130,139,${heat * 0.7}) 60%, rgba(0,0,0,0) 72%)` }} />
          <div style={{ position: "absolute", inset: -8, borderRadius: 20, boxShadow: `0 0 ${10 + 30 * heat}px rgba(255,140,80,${0.3 + heat * 0.6}), inset 0 0 12px rgba(30,10,10,${0.5 * burnK})`, background: `rgba(20,8,8,${0.35 * burnK})` }} />
          <Img src={staticFile("company.png")} style={{ position: "absolute", inset: 0, width: 74, height: 74, borderRadius: 16, clipPath: `circle(${burnK * 75}% at 50% 50%)`, filter: `blur(${heat * 4}px) brightness(${1 + heat * 1.8}) sepia(${heat})` }} />
        </div>
      )}
    </div>
  );
};
const SceneWhat: React.FC<{ t: number }> = ({ t }) => {
  const app = easeOut(seg(t, T.what, T.what + 0.9)), al = easeInOut(seg(t, T.align, T.align + 0.6));
  const bob = Math.sin(t * 2.2) * 10 * (1 - al);
  const plate = (kind: "cv" | "lettre", side: -1 | 1) => {
    const x = 540 + side * 262 - PW / 2, rotY = lerp(side * -40, side * -18, app) * (1 - al), z = lerp(-1600, 0, app), y = lerp(640, 700, al) + bob * side;
    return (
      <div style={{ position: "absolute", left: x, top: y, transform: `translateZ(${z}px) rotateY(${rotY}deg) rotateX(${lerp(14, 4, app) * (1 - al)}deg) scale(1.1)`, transformOrigin: "50% 0", opacity: clamp(app * 1.6), filter: `brightness(${lerp(0.1, 1, app)})` }}>
        <Plate kind={kind} t={t} />
        <div style={{ position: "absolute", top: -48, left: 0, width: PW, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 30, color: PINK_L, opacity: seg(t, 10.6, 11.0) }}>{kind === "cv" ? "CV · 1 page" : "Lettre"}</div>
      </div>
    );
  };
  const ding = t >= T.burn + 0.35 && t < T.burn + 0.75 ? 1 - (t - T.burn - 0.35) / 0.4 : 0;
  return (
    <AbsoluteFill style={{ background: BG, opacity: seg(t, T.what, T.what + 0.15) }}>
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 52%, rgba(217,130,139,${0.18 * app}) 0%, rgba(0,0,0,0) 55%)` }} />
      <div style={{ position: "absolute", inset: 0, perspective: 1400, perspectiveOrigin: "50% 50%" }}>
        {plate("cv", -1)}
        {plate("lettre", 1)}
      </div>
      {ding > 0 && <div style={{ position: "absolute", inset: 0, background: `rgba(255,236,226,${ding * 0.18})` }} />}
      <Text3D t={t} t0={T.final} y={120} size={84} lines={[[["Ta candidature", WHITE]], [["sur-mesure.", PINK]], [["En 5 clics.", WHITE]]]} />
      <div style={{ position: "absolute", top: 1420, width: W, textAlign: "center", fontFamily: "Open Sans", fontSize: 38, opacity: easeOut(seg(t, 13.35, 13.8)), transform: `translateY(${(1 - easeOut(seg(t, 13.35, 13.8))) * 20}px)` }}>
        <b style={{ color: WHITE }}>+200 </b><b style={{ color: PINK }}>Motivés</b><span style={{ color: "#a99fa2" }}> nous font déjà confiance</span>
      </div>
      <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", top: 1560, left: 540 - 180, width: 360, opacity: seg(t, 13.6, 14.0) }} />
      <div style={{ position: "absolute", top: 1700, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "#cfc6c9", opacity: seg(t, 13.9, 14.3) }}>Lien en bio</div>
    </AbsoluteFill>
  );
};

export const CheatCode: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  return (
    <AbsoluteFill style={{ background: BG }}>
      {t < T.how ? <SceneWhy t={t} /> : t < T.what ? <SceneHow t={t} /> : <SceneWhat t={t} />}
      {/* Flash de transition entre WHY → HOW → WHAT */}
      {[T.how, T.what].map((tt) => t >= tt && t < tt + 0.12 && <div key={tt} style={{ position: "absolute", inset: 0, background: `rgba(255,240,243,${0.35 * (1 - (t - tt) / 0.12)})` }} />)}
      <Audio src={staticFile("audio/cheat-code.wav")} />
    </AbsoluteFill>
  );
};
