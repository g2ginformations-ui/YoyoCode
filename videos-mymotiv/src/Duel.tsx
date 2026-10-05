// « Même offre. Pas le même destin. » (30 s) — duel de personnages, Why → How → What.
// Léo (méthode classique) contre Inès (MyMotiv) sur la même offre d'alternance. Histoire = mise en scène ;
// le chiffre « 11 candidatures, 7 entretiens » est le témoignage réel de Léni S. (accord donné), affiché comme tel.
// L'interface MyMotiv dans le téléphone d'Inès vient des VRAIES captures du site. Entreprises fictives.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { BG, PINK, PINK_L, WHITE, W, clamp, lerp, seg, easeOut, easeIn, easeInOut, Text3D } from "./common";
import { INES, LEO, Persona } from "./Persona";

const T = { leo: 3.0, ines: 9.0, zoom: 10.2, slide: 10.9, slid: 11.3, tap: 11.7, read: 12.2, pop: 12.35, fan: 13.4, notif: 17.0, doors: 20.0, testi: 23.0, contract: 25.0, cta: 26.3 };
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const OFFER = "Alternance · Chargé(e) de marketing";

// ───────── petits éléments ─────────
type Co = { key: string; name: string; site: string; kw: string[] };
const COS: Co[] = [
  { key: "lumen", name: "Maison Lumen", site: "maison-lumen.fr", kw: ["retail", "réseaux sociaux", "Lyon"] },
  { key: "nova", name: "Atelier Nova", site: "atelier-nova.fr", kw: ["branding", "contenu", "créativité"] },
  { key: "boreal", name: "Boréal Logistique", site: "boreal-logistique.fr", kw: ["B2B", "e-mailing", "data"] },
];
const CoLogo: React.FC<{ k: string; size: number }> = ({ k, size }) => k === "lumen"
  ? <Img src={staticFile("company.png")} style={{ width: size, height: size, borderRadius: size * 0.2 }} />
  : (
    <svg width={size} height={size} viewBox="0 0 100 100" style={{ borderRadius: size * 0.2 }}>
      <rect width={100} height={100} rx={20} fill={k === "nova" ? "#12324a" : "#1f3d2b"} />
      {k === "nova" ? <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="#7fd6e8" /> : <polygon points="50,20 82,78 18,78" fill="#9fe0a8" />}
      <text x={50} y={k === "nova" ? 60 : 68} textAnchor="middle" fontFamily="Poppins" fontWeight={700} fontSize={28} fill={k === "nova" ? "#12324a" : "#1f3d2b"}>{k === "nova" ? "N" : "B"}</text>
    </svg>
  );
const Card: React.FC<{ style: React.CSSProperties; children: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", borderRadius: 28, background: "rgba(28,24,27,0.95)", border: "2px solid rgba(242,184,192,0.35)", boxShadow: "0 20px 50px rgba(0,0,0,0.55)", fontFamily: "Open Sans", color: WHITE, ...style }}>{children}</div>
);
const Pop = (t: number, t0: number, d = 0.3) => easeOut(seg(t, t0, t0 + d));
const Label: React.FC<{ t: number; t0: number; t1: number; text: string }> = ({ t, t0, t1, text }) => (
  <div style={{ position: "absolute", right: 34, bottom: 30, fontFamily: "Open Sans", fontSize: 24, color: "rgba(255,255,255,0.45)", opacity: seg(t, t0, t0 + 0.3) * (1 - seg(t, t1 - 0.2, t1)) }}>{text}</div>
);

// ───────── 0–3 s : l'accroche (écran partagé) ─────────
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const k = Pop(t, 0.1, 0.4), out = easeInOut(seg(t, T.leo - 0.05, T.leo + 0.35));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, top: 0, width: lerp(540, 1080, out), height: 1920, background: "#17171b" }} />
      <div style={{ position: "absolute", left: lerp(540, 1080, out), top: 0, width: 540, height: 1920, background: "radial-gradient(circle at 50% 55%, rgba(217,130,139,0.18), rgba(11,10,11,1) 70%)", opacity: 1 - out }} />
      <div style={{ position: "absolute", left: lerp(539, 1080, out), top: 0, width: 3, height: 1920, background: "rgba(255,255,255,0.25)" }} />
      <Card style={{ left: 90, top: lerp(140, 200, k), width: 900, height: 170, opacity: k * (1 - out), display: "flex", alignItems: "center", gap: 28, padding: "0 36px", boxSizing: "border-box", background: "#f6f2f1", color: "#2a2326", border: "none" }}>
        <div style={{ width: 96, height: 96, borderRadius: 20, background: "#e7dfdc", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 44, color: "#9b8e8a" }}>?</div>
        <div><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 40 }}>{OFFER}</div><div style={{ fontSize: 28, color: "#7a7174" }}>Une offre · Deux candidats</div></div>
      </Card>
      <Persona look={LEO} x={lerp(270, 540, out)} y={lerp(860, 900, out)} scale={lerp(0.72, 1, out)} mood="neutral" pose="desk" t={t} typing />
      {out < 1 && <Persona look={INES} x={810 + out * 600} y={860} scale={0.72} mood="determined" pose="desk" t={t + 0.7} typing laptopLogo opacity={1 - out} />}
      {["Léo", "Inès"].map((n, i) => <div key={n} style={{ position: "absolute", top: 1330, left: i * 540, width: 540, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 52, color: i ? PINK : "#b9b9c2", opacity: Pop(t, 0.5) * (1 - out) }}>{n}</div>)}
      <Text3D t={t} t0={0.6} t1={T.leo} y={1440} size={92} lines={[[["Même offre.", WHITE]], [["Même diplôme.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── 3–9 s : WHY — Léo copie-colle, envoie, attend ─────────
const Leo: React.FC<{ t: number }> = ({ t }) => {
  const sent = Math.min(11, Math.max(0, Math.floor(lerp(0, 11.99, seg(t, 3.6, 6.3)))));
  const phase2 = t >= 6.5, phone = t >= 7.15;
  const keys = Math.floor((t - 3.5) / 0.25) % 2 ? "Ctrl + V" : "Ctrl + C";
  return (
    <AbsoluteFill style={{ background: "#141417" }}>
      {/* la même lettre, copiée-collée */}
      {!phase2 && (
        <Card style={{ left: 120, top: lerp(160, 190, Pop(t, 3.2)), width: 840, height: 330, opacity: Pop(t, 3.2) * (1 - seg(t, 6.3, 6.5)), background: "#e9e9ec", color: "#4b4b52", border: "none", padding: 34, boxSizing: "border-box" }}>
          <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 26, color: "#77777f" }}>Lettre_motivation_FINAL_v3.docx</div>
          <div style={{ fontFamily: "Liberation Serif, Georgia, serif", fontSize: 30, marginTop: 18, lineHeight: 1.35 }}>Madame, Monsieur,<br />Je me permets de vous adresser ma candidature pour le poste proposé…</div>
          {t > 3.5 && <div style={{ position: "absolute", right: 24, bottom: -30, padding: "10px 22px", borderRadius: 14, background: "#2b2b31", color: WHITE, fontFamily: "Poppins", fontWeight: 600, fontSize: 30 }}>{keys}</div>}
        </Card>
      )}
      {!phase2 && sent > 0 && (
        <div style={{ position: "absolute", top: 560, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 44, color: "#c9c9d2", opacity: 1 - seg(t, 6.3, 6.5) }}>Envoyée ✓ <span style={{ color: WHITE }}>{sent}</span>/11</div>
      )}
      {/* enveloppes qui partent */}
      {!phase2 && Array.from({ length: 11 }, (_, i) => { const t0 = 3.6 + i * 0.245, k = seg(t, t0, t0 + 0.5); if (k <= 0 || k >= 1) return null; return <div key={i} style={{ position: "absolute", left: 540 + easeIn(k) * 600, top: 720 - easeOut(k) * 120 + (i % 3) * 30, width: 90, height: 60, borderRadius: 8, background: "#9a9aa2", opacity: 1 - k, transform: `rotate(${k * 30}deg)` }} />; })}
      {/* le temps passe : horloge et calendrier */}
      {phase2 && (
        <>
          <svg width={200} height={200} viewBox="-100 -100 200 200" style={{ position: "absolute", left: 90, top: 200, opacity: Pop(t, 6.5) }}>
            <circle r={88} fill="#1f1f24" stroke="#77777f" strokeWidth={8} />
            <line x1={0} y1={0} x2={0} y2={-60} stroke="#c9c9d2" strokeWidth={8} strokeLinecap="round" transform={`rotate(${t * 900})`} />
            <line x1={0} y1={0} x2={0} y2={-40} stroke="#9a9aa2" strokeWidth={10} strokeLinecap="round" transform={`rotate(${t * 75})`} />
          </svg>
          {Array.from({ length: 6 }, (_, i) => { const t0 = 6.6 + i * 0.32, k = seg(t, t0, t0 + 0.6); return (
            <div key={i} style={{ position: "absolute", left: 760 + k * 200, top: 200 - k * 160 + k * k * 400, width: 170, height: 190, borderRadius: 16, background: "#e9e9ec", opacity: t < t0 ? 0 : 1 - k * 0.9, transform: `rotate(${k * 60}deg)`, fontFamily: "Poppins", fontWeight: 700, fontSize: 70, color: "#5b5b64", textAlign: "center", paddingTop: 50, boxSizing: "border-box", zIndex: 10 - i }}>
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 42, background: "#8a8a94", borderRadius: "16px 16px 0 0" }} />{12 + i}
            </div>); })}
          <div style={{ position: "absolute", top: 450, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "#9a9aa2", opacity: Pop(t, 6.7) }}>0 notification</div>
        </>
      )}
      {phone && (
        <Card style={{ left: 180, top: lerp(560, 540, Pop(t, 7.4)), width: 720, padding: "26px 30px", boxSizing: "border-box", opacity: Pop(t, 7.4), background: "#1f1f24", border: "2px solid #3a3a42" }}>
          <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 28, color: "#9a9aa2" }}>Tonton</div>
          <div style={{ marginTop: 14, marginLeft: "auto", width: "fit-content", maxWidth: 560, padding: "16px 24px", borderRadius: 26, background: "#3b3b45", fontSize: 34 }}>T'aurais pas un contact&nbsp;?</div>
          <div style={{ textAlign: "right", fontSize: 24, color: "#77777f", marginTop: 8, opacity: seg(t, 8.1, 8.3) }}>Vu</div>
        </Card>
      )}
      <Persona look={LEO} x={540} y={phone ? 1080 : 1000} scale={1} mood={t > 5.6 ? "sad" : "neutral"} pose={phone ? "phone" : "desk"} t={t} typing={!phase2} />
      <Text3D t={t} t0={3.45} t1={6.45} y={1500} size={86} lines={[[["11 lettres.", WHITE]], [["Toutes pareilles.", "#b9b9c2"]]]} />
      <Text3D t={t} t0={6.6} t1={T.ines} y={1560} size={92} lines={[[["Et toujours rien.", "#b9b9c2"]]]} />
    </AbsoluteFill>
  );
};

// ───────── 9–17 s : HOW — Inès, MyMotiv sur son téléphone, 3 offres = 3 lettres ─────────
const S = { w: 600, h: 1067 }; // écran du téléphone (9:16)
const PhoneScreen: React.FC<{ t: number }> = ({ t }) => {
  const shot = t < T.slid ? "004-offre-vide" : t < T.tap + 0.05 ? "018-offre-lien" : t < T.read ? "019-offre-lecture" : "020-offre-lue";
  const k = S.w / 1080, z = 1.12, fx = 540, fy = 860, sl = seg(t, T.slide, T.slid);
  const toX = (x: number) => S.w / 2 + (x - fx) * k * z, toY = (y: number) => S.h / 2 + (y - fy) * k * z;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 50, background: BG }}>
      <Img src={staticFile(`shots/${shot}.png`)} style={{ position: "absolute", left: toX(0), top: toY(0), width: 1080 * k * z, height: 1920 * k * z }} />
      {t >= T.slide && t < T.slid && <div style={{ position: "absolute", left: toX(120) + lerp(700, 0, easeOutExpo(sl)), top: toY(487) - 26, padding: "0 16px", height: 52, lineHeight: "50px", borderRadius: 26, background: "rgba(217,130,139,0.3)", border: `2px solid ${PINK}`, color: WHITE, fontFamily: "Open Sans", fontWeight: 600, fontSize: 24, whiteSpace: "nowrap" }}>carrieres.maison-lumen.fr/offre/alternance-marketing</div>}
      {t >= T.tap && t < T.tap + 0.45 && (() => { const q = (t - T.tap) / 0.45; return <div style={{ position: "absolute", left: toX(540) - 30 - 120 * q, top: toY(624) - 30 - 120 * q, width: 60 + 240 * q, height: 60 + 240 * q, borderRadius: "50%", border: `6px solid rgba(255,255,255,${1 - q})`, background: `rgba(255,255,255,${0.3 * (1 - q)})` }} />; })()}
    </div>
  );
};
const MiniLetter: React.FC<{ co: Co; t: number; t0: number; x: number; y: number; rot: number; scale: number }> = ({ co, t, t0, x, y, rot, scale }) => {
  const k = easeOutExpo(seg(t, t0, t0 + 0.45)), slam = t >= t0 + 0.25 && t < t0 + 0.45 ? 1.06 : 1, logoK = seg(t, t0 + 0.2, t0 + 0.35);
  if (t < t0) return null;
  return (
    <div style={{ position: "absolute", left: x - 170, top: y - 240, width: 340, height: 480, borderRadius: 18, background: "#fffdfd", boxShadow: "0 0 50px rgba(217,130,139,0.45), 0 20px 40px rgba(0,0,0,0.5)", transform: `translate(${(1 - k) * (540 - x)}px, ${(1 - k) * (1500 - y)}px) rotate(${rot * k}deg) scale(${scale * lerp(0.3, 1, k) * slam})`, padding: 24, boxSizing: "border-box", color: "#2a2326" }}>
      <div style={{ position: "absolute", right: 20, top: 20, transform: `scale(${lerp(2.2, 1, logoK)})`, opacity: logoK }}><CoLogo k={co.key} size={64} /></div>
      <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 24 }}>Inès Martin</div>
      <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 14, color: PINK, marginTop: 30 }}>Objet : {OFFER}</div>
      <div style={{ fontFamily: "Poppins", fontSize: 14, color: "#7a7174", marginTop: 4 }}>chez {co.name}</div>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => <div key={i} style={{ height: 9, borderRadius: 5, background: "#ddd5d6", marginTop: i === 0 ? 22 : 12, width: `${[92, 80, 88, 70, 90, 60, 84][i]}%` }} />)}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 22 }}>{co.kw.map((w) => <span key={w} style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 14, padding: "4px 10px", borderRadius: 12, background: "rgba(217,130,139,0.2)", border: `1px solid ${PINK}`, color: "#8a3f49" }}>✓ {w}</span>)}</div>
    </div>
  );
};
const Ines: React.FC<{ t: number }> = ({ t }) => {
  const zoom = easeInOut(seg(t, T.zoom, T.zoom + 0.5)), back = easeInOut(seg(t, T.fan - 0.1, T.fan + 0.4));
  // le téléphone : des mains d'Inès → plein écran → en bas
  const pw = lerp(lerp(112, S.w, zoom), 230, back), sc = pw / S.w, px = 540, py = lerp(lerp(1150, 1010, zoom), 1590, back);
  const orb = seg(t, T.pop, T.pop + 0.5);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, rgba(217,130,139,0.2), rgba(11,10,11,1) 70%)" }}>
      {zoom < 1 && <Persona look={INES} x={540} y={1000} scale={lerp(1, 2.4, zoom)} mood="determined" pose="phone" t={t} opacity={1 - zoom} />}
      {zoom > 0 && (
        <div style={{ position: "absolute", left: px - (S.w * sc) / 2 - 16 * sc, top: py - (S.h * sc) / 2 - 16 * sc, width: (S.w + 32) * sc, height: (S.h + 32) * sc, borderRadius: 66 * sc, background: "#1a1418", border: `${4 * sc}px solid ${PINK}`, boxShadow: `0 0 ${80 * sc}px rgba(217,130,139,0.45)`, opacity: clamp(zoom * 3) }}>
          <div style={{ position: "absolute", left: 16 * sc, top: 16 * sc, width: S.w, height: S.h, transform: `scale(${sc})`, transformOrigin: "0 0" }}><PhoneScreen t={t} /></div>
        </div>
      )}
      {/* le logo jaillit du téléphone */}
      {t >= T.pop && t < T.fan + 0.2 && (
        <div style={{ position: "absolute", left: lerp(540, 820, easeOut(orb)) - 60, top: lerp(1000, 330, easeOut(orb)) - 60, width: 120, height: 120, borderRadius: 26, boxShadow: `0 0 60px ${PINK}, 0 0 120px rgba(217,130,139,0.6)`, transform: `scale(${lerp(0.3, 1, easeOut(orb))}) rotate(${(1 - easeOut(orb)) * 180}deg)`, opacity: 1 - seg(t, T.fan, T.fan + 0.2) }}><CoLogo k="lumen" size={120} /></div>
      )}
      {COS.map((co, i) => <MiniLetter key={co.key} co={co} t={t} t0={T.fan + 0.15 + i * 0.7} x={[250, 540, 830][i]} y={[880, 800, 880][i]} rot={[-8, 0, 8][i]} scale={i === 1 ? 1.08 : 0.98} />)}
      <Text3D t={t} t0={9.2} t1={T.fan} y={120} size={84} lines={[[["Une lettre", WHITE]], [["par offre.", PINK]]]} />
      <Text3D t={t} t0={T.fan + 0.2} t1={T.notif} y={150} size={84} lines={[[["Leur logo.", WHITE]], [["Leurs mots.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── 17–23 s : WHAT — les appels, puis les portes qui s'ouvrent ─────────
const NOTIFS: [string, string, string][] = [["lumen", "Maison Lumen", "Appel entrant…"], ["nova", "Atelier Nova", "Dispo pour un entretien jeudi ?"], ["boreal", "Boréal Logistique", "Nous aimerions vous rencontrer"], ["lumen", "Agenda", "Mardi 10 h · Entretien"]];
const Calls: React.FC<{ t: number }> = ({ t }) => {
  const ring = NOTIFS.some((_, i) => t >= T.notif + 0.3 + i * 0.6 && t < T.notif + 0.3 + i * 0.6 + 0.35) ? 1 : 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 65%, rgba(217,130,139,0.22), rgba(11,10,11,1) 70%)" }}>
      {NOTIFS.map(([k, who, msg], i) => { const t0 = T.notif + 0.3 + i * 0.6, a = easeOutExpo(seg(t, t0, t0 + 0.35)); if (t < t0) return null; return (
        <Card key={i} style={{ left: 70, top: 120 + i * 150 - (1 - a) * 120, width: 940, height: 128, opacity: a, display: "flex", alignItems: "center", gap: 24, padding: "0 28px", boxSizing: "border-box", background: "rgba(36,30,34,0.97)", border: `2px solid ${i === 3 ? PINK : "rgba(242,184,192,0.35)"}` }}>
          {i === 3 ? <div style={{ width: 72, height: 72, borderRadius: 18, background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 30, color: "#2e1f22" }}>10h</div> : <CoLogo k={k} size={72} />}
          <div><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 30 }}>{who}</div><div style={{ fontSize: 30, color: "#e9e1e3" }}>{msg}</div></div>
        </Card>); })}
      <Persona look={INES} x={540} y={1180} scale={0.95} mood="happy" pose="phone" t={t} phoneShake={ring} />
      {ring > 0 && [0, 1].map((j) => <div key={j} style={{ position: "absolute", left: 540 - 140 - j * 40, top: 1300 - j * 40, width: 280 + j * 80, height: 280 + j * 80, borderRadius: "50%", border: `4px solid rgba(217,130,139,${0.6 - j * 0.25})` }} />)}
      {/* pendant ce temps, Léo */}
      <Card style={{ left: 40, top: 1080, width: 330, padding: "20px 22px", boxSizing: "border-box", opacity: Pop(t, 18.2), background: "#1f1f24", border: "2px solid #3a3a42" }}>
        <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 24, color: "#9a9aa2" }}>Léo · Tonton</div>
        <div style={{ fontSize: 26, marginTop: 8, color: "#c9c9d2" }}>T'aurais pas un contact&nbsp;?</div>
        <div style={{ fontSize: 22, color: "#77777f", marginTop: 6 }}>Vu · pas de réponse</div>
      </Card>
      <Text3D t={t} t0={17.2} t1={T.doors} y={1590} size={68} lines={[[["Pendant qu'ils attendent", WHITE]], [["un piston…", "#b9b9c2"]]]} />
    </AbsoluteFill>
  );
};
const Doors: React.FC<{ t: number }> = ({ t }) => {
  const i = Math.min(2, Math.floor((t - T.doors) / 0.95)), t0 = T.doors + i * 0.95, open = easeIn(seg(t, t0 + 0.3, t0 + 0.55)), co = COS[i];
  const near = lerp(0.55, 0.95, (i + seg(t, t0, t0 + 0.95)) / 3);
  return (
    <AbsoluteFill style={{ background: "#0e0c0e" }}>
      {/* couloir en perspective */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[-1, 1].map((s) => [0, 1, 2, 3].map((k) => <line key={`${s}${k}`} x1={540 + s * 60} y1={700 + k * 140} x2={540 + s * 900} y2={lerp(-200, 2400, k / 3)} stroke="rgba(217,130,139,0.12)" strokeWidth={2} />))}
      </svg>
      <Persona look={INES} x={540} y={lerp(1000, 820, near)} scale={near} mood="determined" pose="walk" t={t} />
      {/* la porte au premier plan, qui s'ouvre vers nous */}
      {open < 1 && (
        <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
          {[0, 1].map((s) => (
            <div key={s} style={{ position: "absolute", top: 260, left: s ? 540 : 110, width: 430, height: 1500, background: "linear-gradient(180deg,#2a2226,#1a1518)", border: `3px solid rgba(217,130,139,0.5)`, transformOrigin: s ? "100% 50%" : "0% 50%", transform: `rotateY(${(s ? -1 : 1) * 105 * open}deg)`, boxSizing: "border-box" }}>
              <div style={{ position: "absolute", top: 700, [s ? "left" : "right"]: 30, width: 20, height: 140, borderRadius: 10, background: PINK_L }} />
            </div>
          ))}
          <div style={{ position: "absolute", top: 120, left: 540 - 300, width: 600, height: 120, borderRadius: 24, background: "#f6f2f1", display: "flex", alignItems: "center", justifyContent: "center", gap: 20, opacity: 1 - open, fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#2a2326" }}><CoLogo k={co.key} size={80} />{co.name}</div>
        </div>
      )}
      {t >= t0 + 0.3 && t < t0 + 0.9 && (() => { const q = (t - t0 - 0.3) / 0.6; return <div style={{ position: "absolute", left: 540 - 1200 * q, top: 1000 - 1200 * q, width: 2400 * q, height: 2400 * q, borderRadius: "50%", border: `${14 * (1 - q) + 2}px solid rgba(242,184,192,${1 - q})`, boxShadow: `0 0 60px rgba(217,130,139,${1 - q})` }} />; })()}
      <Text3D t={t} t0={T.doors + 0.35} t1={T.testi} y={1560} size={100} lines={[[["…toi, tu rentres.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── 23–25 s : le vrai témoignage ─────────
const Testimony: React.FC<{ t: number }> = ({ t }) => {
  const a = Pop(t, T.testi, 0.4), n1 = Math.round(11 * easeOut(seg(t, T.testi + 0.3, T.testi + 0.9))), n2 = Math.round(7 * easeOut(seg(t, T.testi + 0.6, T.testi + 1.2)));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(217,130,139,0.2), rgba(11,10,11,1) 70%)" }}>
      <div style={{ position: "absolute", top: 300, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 46, color: PINK_L, opacity: a }}>Le vrai résultat de</div>
      <Card style={{ left: 90, top: lerp(460, 420, a), width: 900, height: 700, opacity: a, padding: 50, boxSizing: "border-box", border: `3px solid ${PINK}`, boxShadow: `0 0 80px rgba(217,130,139,0.35)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
          <div style={{ width: 120, height: 120, borderRadius: "50%", background: PINK, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 60, color: "#2e1f22" }}>L</div>
          <div><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 58 }}>Léni S.</div><div style={{ fontSize: 30, color: "#bdb2b5" }}>Motivé · utilisateur MyMotiv</div></div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: 80, textAlign: "center" }}>
          <div><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 200, lineHeight: 1 }}>{n1}</div><div style={{ fontSize: 38, color: "#e9e1e3" }}>candidatures</div></div>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 120, color: PINK, alignSelf: "center" }}>→</div>
          <div><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 200, lineHeight: 1, color: PINK, textShadow: `0 0 40px ${PINK}` }}>{n2}</div><div style={{ fontSize: 38, color: "#e9e1e3" }}>entretiens</div></div>
        </div>
      </Card>
      <div style={{ position: "absolute", top: 1180, width: W, textAlign: "center", fontFamily: "Open Sans", fontSize: 28, color: "rgba(255,255,255,0.6)", opacity: a }}>Témoignage réel · résultats individuels non garantis</div>
    </AbsoluteFill>
  );
};

// ───────── 25–30 s : contrat signé, puis l'appel à l'action ─────────
const Outro: React.FC<{ t: number }> = ({ t }) => {
  const c = Pop(t, T.contract, 0.35), cOut = seg(t, T.cta - 0.15, T.cta + 0.15), sign = seg(t, T.contract + 0.35, T.contract + 0.9), stamp = easeIn(seg(t, T.contract + 0.9, T.contract + 1.05));
  const pulse = 1 + 0.05 * Math.max(0, Math.sin((t - T.cta - 1.2) * 6));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(217,130,139,0.2), rgba(11,10,11,1) 70%)" }}>
      {cOut < 1 && (
        <div style={{ position: "absolute", left: 190, top: 380, width: 700, height: 900, borderRadius: 20, background: "#fffdfd", color: "#2a2326", padding: 50, boxSizing: "border-box", opacity: c * (1 - cOut), transform: `scale(${lerp(0.8, 1, c) * (1 - cOut * 0.3)}) rotate(${lerp(-6, -2, c)}deg)`, boxShadow: "0 0 60px rgba(217,130,139,0.4)" }}>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 44 }}>Contrat d'alternance</div>
          <div style={{ fontFamily: "Open Sans", fontSize: 26, color: "#7a7174", marginTop: 10 }}>{OFFER}</div>
          {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} style={{ height: 12, borderRadius: 6, background: "#e5dddf", marginTop: 26, width: `${[90, 78, 86, 70, 88, 64][i]}%` }} />)}
          <svg width={420} height={160} style={{ position: "absolute", left: 50, bottom: 120 }}><path d="M 10 110 C 60 20, 90 150, 140 70 S 220 30, 250 100 S 330 60, 400 80" fill="none" stroke="#2a2326" strokeWidth={6} strokeLinecap="round" strokeDasharray={700} strokeDashoffset={700 * (1 - sign)} /></svg>
          <div style={{ position: "absolute", left: 50, bottom: 100, width: 420, height: 3, background: "#cfc6c9" }} />
          {stamp > 0 && <div style={{ position: "absolute", right: 40, bottom: 80, padding: "10px 26px", border: `8px solid ${PINK}`, borderRadius: 18, color: PINK, fontFamily: "Poppins", fontWeight: 700, fontSize: 64, transform: `rotate(-14deg) scale(${lerp(2.2, 1, stamp)})`, opacity: stamp }}>SIGNÉ</div>}
        </div>
      )}
      {t >= T.cta && (
        <>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", top: lerp(560, 520, Pop(t, T.cta)), left: 540 - 230, width: 460, opacity: Pop(t, T.cta), filter: `drop-shadow(0 0 30px rgba(217,130,139,0.6))` }} />
          <Text3D t={t} t0={T.cta + 0.25} y={820} size={110} lines={[[["Sors de la pile.", WHITE]]]} />
          <div style={{ position: "absolute", top: 1080, width: W, textAlign: "center", fontFamily: "Open Sans", fontSize: 38, opacity: Pop(t, T.cta + 0.7) }}><b style={{ color: WHITE }}>+200 </b><b style={{ color: PINK }}>Motivés</b><span style={{ color: "#a99fa2" }}> nous font déjà confiance</span></div>
          <div style={{ position: "absolute", left: 540 - 340, top: 1190, width: 680, height: 136, borderRadius: 68, background: PINK, border: `3px solid ${PINK_L}`, boxShadow: `0 0 ${30 + 500 * (pulse - 1)}px ${PINK}, 0 0 ${80 + 900 * (pulse - 1)}px rgba(217,130,139,0.6)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 54, color: "#2e1f22", opacity: Pop(t, T.cta + 0.9), transform: `scale(${t > T.cta + 1.2 ? pulse : lerp(0.8, 1, Pop(t, T.cta + 0.9))})` }}>Générer ma lettre</div>
          <div style={{ position: "absolute", top: 1380, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 42, color: "#cfc6c9", opacity: Pop(t, T.cta + 1.2) }}>Lien en bio</div>
        </>
      )}
    </AbsoluteFill>
  );
};

export const Duel: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const scene = t < T.leo ? <Hook t={t} /> : t < T.ines ? <Leo t={t} /> : t < T.notif ? <Ines t={t} /> : t < T.doors ? <Calls t={t} /> : t < T.testi ? <Doors t={t} /> : t < T.contract ? <Testimony t={t} /> : <Outro t={t} />;
  const doorHit = [0, 1, 2].some((i) => { const tc = T.doors + i * 0.95 + 0.3; return t >= tc && t < tc + 0.2; });
  const shake = doorHit ? Math.sin(t * 150) * 14 : 0;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${shake}px, ${shake * 0.5}px)` }}>{t < T.leo ? <Hook t={t} /> : scene}</div>
      <Label t={t} t0={0} t1={T.testi} text="Mise en scène" />
      {[T.ines, T.notif, T.doors, T.testi, T.cta].map((tc) => t >= tc && t < tc + 0.12 && <div key={tc} style={{ position: "absolute", inset: 0, background: `rgba(255,240,243,${(tc === T.ines ? 0.5 : 0.3) * (1 - (t - tc) / 0.12)})` }} />)}
      <Audio src={staticFile("audio/duel.wav")} />
    </AbsoluteFill>
  );
};
