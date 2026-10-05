// « Le parcours d'Inès » (36 s) : de la recommandation de sa mère jusqu'à son recrutement.
// Lien de maman → le logo sort du téléphone → 1. CV une fois → 2. l'offre en un lien (site + logo trouvés) → 3. Générer →
// arrêt sur image sur la lettre AVEC le logo → 3 offres = 3 lettres → postuler → le lendemain : appel manqué + mail → recrutée →
// Inès répond à sa mère. Fin : « Ta première lettre est offerte. ». Mise en scène ; vraies captures du site dans le téléphone.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { BG, PINK, PINK_L, WHITE, W, clamp, lerp, seg, easeOut, easeIn, easeInOut, Text3D } from "./common";
import { INES, ROCHE, Persona } from "./Persona";
import { COS, CoLogo, MiniLetter } from "./Duel";

const T = { tapLink: 2.6, portal: 3.2, step1: 5.2, tapCv: 6.2, cvIn: 6.6, saved: 7.0, step2: 9.0, slide: 9.4, slid: 9.9, tapRead: 10.5, read: 11.0, found: 11.6, step3: 13.0, tapGen: 13.4, gen0: 13.5, gen1: 15.4, letter: 15.6, freeze: 16.2, unfreeze: 18.0, apply: 21.0, send: 22.6, night: 23.5, day: 25.5, missed: 25.8, mail: 26.5, zoom0: 27.4, zoom1: 28.1, jump: 28.5, hired: 29.6, contract: 30.6, reply: 31.9, cta: 33.2 };
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const Pop = (t: number, t0: number, d = 0.3) => easeOut(seg(t, t0, t0 + d));
const measure = (() => { const c = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null; return (s: string, font: string) => { if (!c) return s.length * 20; c.font = font; return c.measureText(s).width; }; })();

const Card: React.FC<{ style: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", borderRadius: 28, background: "rgba(30,25,29,0.97)", border: "2px solid rgba(242,184,192,0.35)", boxShadow: "0 22px 55px rgba(0,0,0,0.55)", color: WHITE, fontFamily: "Open Sans", overflow: "hidden", ...style }}>{children}</div>
);
const Bubble: React.FC<{ text: string; me?: boolean; style?: React.CSSProperties }> = ({ text, me, style }) => (
  <div style={{ marginLeft: me ? "auto" : 0, width: "fit-content", maxWidth: 700, padding: "18px 26px", borderRadius: 30, background: me ? PINK : "#3a3540", color: me ? "#2e1f22" : WHITE, fontSize: 36, fontWeight: me ? 700 : 400, ...style }}>{text}</div>
);

// ───────── le téléphone d'Inès, plein écran, avec une vraie capture et une caméra (fx, fy, z) ─────────
const PH = { x: 210, y: 300, w: 660, h: 1173 };
function cam(fx: number, fy: number, z: number) { const k = PH.w / 1080; return { x: (x: number) => PH.w / 2 + (x - fx) * k * z, y: (y: number) => PH.h / 2 + (y - fy) * k * z, s: k * z }; }
const Phone: React.FC<{ shot: string; fx: number; fy: number; z: number; alpha?: number; gray?: boolean; children?: (c: ReturnType<typeof cam>) => React.ReactNode }> = ({ shot, fx, fy, z, alpha = 1, gray, children }) => {
  const c = cam(fx, fy, z);
  return (
    <div style={{ position: "absolute", left: PH.x - 18, top: PH.y - 18, width: PH.w + 36, height: PH.h + 36, borderRadius: 70, background: "#1a1418", border: `4px solid ${PINK}`, boxShadow: "0 0 80px rgba(217,130,139,0.4)", opacity: alpha, filter: gray ? "grayscale(0.8)" : "none" }}>
      <div style={{ position: "absolute", left: 18, top: 18, width: PH.w, height: PH.h, borderRadius: 52, overflow: "hidden", background: BG }}>
        <Img src={staticFile(`shots/${shot}.png`)} style={{ position: "absolute", left: c.x(0), top: c.y(0), width: 1080 * c.s, height: 1920 * c.s }} />
        {children && children(c)}
      </div>
    </div>
  );
};
const Tap: React.FC<{ t: number; tc: number; x: number; y: number }> = ({ t, tc, x, y }) => {
  if (t < tc || t > tc + 0.45) return null; const q = (t - tc) / 0.45;
  return <div style={{ position: "absolute", left: x - 30 - 110 * q, top: y - 30 - 110 * q, width: 60 + 220 * q, height: 60 + 220 * q, borderRadius: "50%", border: `6px solid rgba(255,255,255,${1 - q})`, background: `rgba(255,255,255,${0.3 * (1 - q)})` }} />;
};
const StepBadge: React.FC<{ t: number; t0: number; n: number }> = ({ t, t0, n }) => (
  <div style={{ position: "absolute", left: 60, top: 300, width: 110, height: 110, borderRadius: "50%", background: PINK, color: "#2e1f22", fontFamily: "Poppins", fontWeight: 700, fontSize: 64, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${PINK}`, transform: `scale(${lerp(1.8, 1, Pop(t, t0, 0.35))})`, opacity: Pop(t, t0, 0.2) }}>{n}</div>
);

// ───────── 0–5 s : le message de maman, le logo qui sort du téléphone ─────────
const Intro: React.FC<{ t: number }> = ({ t }) => {
  const logoK = seg(t, T.portal, T.portal + 0.9), portal = easeIn(seg(t, T.portal + 1.2, T.step1));
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #11131f 0%, #0B0A0B 70%)" }}>
      {/* salon le soir : lampe */}
      <div style={{ position: "absolute", left: 760, top: 1000, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,200,140,0.18), rgba(0,0,0,0) 70%)" }} />
      <div style={{ position: "absolute", left: 0, top: 1560, width: W, height: 360, background: "#2a2028", borderRadius: "60px 60px 0 0" }} />
      <Persona look={INES} x={540} y={1150} scale={1} mood={t > 1.6 ? "determined" : "neutral"} pose="phone" t={t} phoneShake={t >= 0.3 && t < 0.7 ? 1 : 0} opacity={1 - portal} />
      {/* le message de maman */}
      <Card style={{ left: 90, top: lerp(240, 200, Pop(t, 0.4)), width: 900, padding: "28px 32px", boxSizing: "border-box", opacity: Pop(t, 0.4) * (1 - seg(t, T.portal, T.portal + 0.3)) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}><div style={{ width: 64, height: 64, borderRadius: "50%", background: "#c9a27e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 30, color: "#3a2a20" }}>M</div><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 34 }}>Maman</span><span style={{ fontSize: 26, color: "#9a95a0" }}>· 21:04</span></div>
        <Bubble text="Ma chérie, la fille de ma collègue a été prise grâce à ça ! Essaie →" />
        <div style={{ marginTop: 16, width: 600, borderRadius: 22, background: "#2a2430", border: `2px solid ${t >= T.tapLink && t < T.tapLink + 0.2 ? PINK : "#45404c"}`, padding: 22, display: "flex", alignItems: "center", gap: 20, transform: `scale(${t >= T.tapLink && t < T.tapLink + 0.15 ? 0.96 : 1})`, opacity: Pop(t, 0.9) }}>
          <div style={{ width: 90, height: 90, borderRadius: 20, background: BG, display: "flex", alignItems: "center", justifyContent: "center" }}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 80 }} /></div>
          <div><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 30, color: PINK_L }}>MyMotiv</div><div style={{ fontSize: 26, color: "#cfc9d4" }}>Génère ta lettre sur-mesure</div></div>
        </div>
      </Card>
      <Tap t={t} tc={T.tapLink} x={400} y={560} />
      {/* le logo sort du téléphone, tourne, puis devient un portail */}
      {t >= T.portal && (() => {
        const k = easeOutExpo(logoK), spin = (1 - k) * 720 + Math.sin(t * 3) * 8, x = 540, y = lerp(1280, 760, k), w = lerp(80, 620, k);
        return (<>
          {[0.08, 0.16, 0.24].map((d, i) => { const kk = easeOutExpo(seg(t - d, T.portal, T.portal + 0.9)); return <Img key={i} src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: x - lerp(80, 620, kk) / 2, top: lerp(1280, 760, kk) - lerp(80, 620, kk) * 0.115, width: lerp(80, 620, kk), opacity: 0.18 * (1 - portal) }} />; })}
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: x - w / 2, top: y - w * 0.115, width: w, transform: `perspective(900px) rotateY(${spin}deg) scale(${1 + portal * 6})`, opacity: 1 - portal * 0.9, filter: `drop-shadow(0 0 40px ${PINK})` }} />
          {portal > 0 && <div style={{ position: "absolute", left: 540 - 1400 * portal, top: 760 - 1400 * portal, width: 2800 * portal, height: 2800 * portal, borderRadius: "50%", background: `radial-gradient(circle, rgba(11,10,11,1) 55%, rgba(217,130,139,0.8) 62%, rgba(217,130,139,0) 70%)` }} />}
        </>);
      })()}
      <Text3D t={t} t0={T.portal + 0.25} t1={T.step1} y={120} size={84} lines={[[["Ça marche", WHITE]], [["vraiment ?", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── 5–16 s : les 3 étapes dans le vrai site ─────────
const Steps: React.FC<{ t: number }> = ({ t }) => {
  let shot = "002-cv-vide", fx = 540, fy = 760, z = 1.15;
  if (t >= T.cvIn) shot = "003-cv-ajoute";
  if (t >= T.step2) { shot = t < T.slid ? "004-offre-vide" : t < T.tapRead + 0.05 ? "018-offre-lien" : t < T.read ? "019-offre-lecture" : "020-offre-lue"; fy = 760; }
  if (t >= T.found) { shot = "021-entreprise"; const k = easeInOut(seg(t, T.found, T.found + 0.5)); fy = lerp(900, 1000, k); z = lerp(1.15, 1.3, k); }
  if (t >= T.step3) { const genFrames = ["044", "045", "046", "047", "048", "049", "050", "051", "052", "053"]; shot = t < T.gen0 ? "043-avant-generer" : t < T.gen1 ? `${genFrames[Math.min(9, Math.floor(seg(t, T.gen0, T.gen1) * 10))]}-generation` : "054-lettre"; fy = t < T.letter ? 1000 : lerp(1000, 480, easeInOut(seg(t, T.letter, T.letter + 0.5))); z = t < T.letter ? 1.15 : lerp(1.15, 1.25, easeInOut(seg(t, T.letter, T.letter + 0.5))); }
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(217,130,139,0.18), rgba(11,10,11,1) 70%)" }}>
      <Phone shot={shot} fx={fx} fy={fy} z={z} alpha={Pop(t, T.step1, 0.3)}>
        {(c) => (<>
          <Tap t={t} tc={T.tapCv} x={c.x(540)} y={c.y(711)} />
          {t >= T.slide && t < T.slid && <div style={{ position: "absolute", left: c.x(120) + lerp(700, 0, easeOutExpo(seg(t, T.slide, T.slid))), top: c.y(487) - 28, padding: "0 16px", height: 56, lineHeight: "52px", borderRadius: 28, background: "rgba(217,130,139,0.3)", border: `2px solid ${PINK}`, color: WHITE, fontFamily: "Open Sans", fontWeight: 600, fontSize: 26, whiteSpace: "nowrap" }}>carrieres.maison-lumen.fr/offre/alternance-marketing</div>}
          <Tap t={t} tc={T.tapRead} x={c.x(540)} y={c.y(624)} />
          {t >= T.found + 0.4 && t < T.step3 && <div style={{ position: "absolute", left: c.x(30), top: c.y(1100), width: 680 * c.s, height: 120 * c.s, borderRadius: 18, border: `5px solid ${PINK}`, boxShadow: `0 0 30px ${PINK}`, opacity: Pop(t, T.found + 0.4) }} />}
          <Tap t={t} tc={T.tapGen} x={c.x(540)} y={c.y(959)} />
        </>)}
      </Phone>
      {/* badge « enregistré une fois » */}
      {t >= T.saved && t < T.step2 && <div style={{ position: "absolute", left: 540 - 300, top: 1530, width: 600, padding: "18px 0", borderRadius: 40, textAlign: "center", background: "rgba(127,214,164,0.15)", border: "3px solid #7fd6a4", color: "#bff0d3", fontFamily: "Poppins", fontWeight: 700, fontSize: 38, transform: `scale(${lerp(1.4, 1, Pop(t, T.saved))})`, opacity: Pop(t, T.saved) }}>✓ Enregistré · une seule fois</div>}
      {t >= T.found + 0.4 && t < T.step3 && <div style={{ position: "absolute", left: 540 - 320, top: 1530, width: 640, padding: "18px 0", borderRadius: 40, textAlign: "center", background: "rgba(217,130,139,0.18)", border: `3px solid ${PINK}`, color: PINK_L, fontFamily: "Poppins", fontWeight: 700, fontSize: 38, opacity: Pop(t, T.found + 0.4), transform: `scale(${lerp(1.4, 1, Pop(t, T.found + 0.4))})` }}>✓ Site et logo trouvés</div>}
      <StepBadge t={t} t0={T.step1} n={t < T.step2 ? 1 : t < T.step3 ? 2 : 3} />
      <Text3D t={t} t0={T.step1 + 0.1} t1={T.step2} y={110} size={80} lines={[[["Ton CV,", WHITE]], [["une seule fois.", PINK]]]} />
      <Text3D t={t} t0={T.step2 + 0.1} t1={T.step3} y={110} size={80} lines={[[["L'offre,", WHITE]], [["en un lien.", PINK]]]} />
      <Text3D t={t} t0={T.step3 + 0.1} t1={T.freeze} y={130} size={96} lines={[[["Générer.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── 16–18 s : arrêt sur image, la lettre AVEC le logo ─────────
const Freeze: React.FC<{ t: number }> = ({ t }) => {
  // la capture reste cadrée sur l'en-tête de la lettre ; c'est le téléphone entier qui zoome vers le logo
  const k = easeInOut(seg(t, T.freeze, T.freeze + 0.45)), pulse = 1 + 0.06 * Math.sin((t - T.freeze) * 10);
  const fx = 540, fy = 480, z = 1.25, c = cam(fx, fy, z), lx = PH.x + c.x(160), ly = PH.y + c.y(238);
  return (
    <AbsoluteFill style={{ background: "#0f0d10" }}>
      <div style={{ position: "absolute", inset: 0, transform: `scale(${lerp(1, 1.7, k)})`, transformOrigin: `${lx}px ${ly}px` }}>
        <Phone shot="054-lettre" fx={fx} fy={fy} z={z} gray>
          {() => <div style={{ position: "absolute", left: c.x(112) - 10, top: c.y(192) - 10, width: 96 * c.s + 20, height: 96 * c.s + 20, borderRadius: 22, border: `5px solid ${PINK}`, boxShadow: `0 0 40px ${PINK}`, transform: `scale(${pulse})`, opacity: Pop(t, T.freeze + 0.45) }} />}
        </Phone>
      </div>
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 0 14px rgba(255,255,255,0.85)" }} />
      <div style={{ position: "absolute", left: 120, top: 1560, width: 840, padding: "20px 28px", boxSizing: "border-box", borderRadius: 26, background: "rgba(30,25,29,0.95)", border: `3px solid ${PINK}`, fontFamily: "Poppins", fontWeight: 600, fontSize: 36, color: WHITE, textAlign: "center", opacity: Pop(t, T.freeze + 0.5) }}>« Lettre sur mesure pour <b style={{ color: PINK_L }}>Maison Lumen</b> »</div>
      <Text3D t={t} t0={T.freeze + 0.15} t1={T.unfreeze} y={110} size={92} lines={[[["Avec LEUR logo.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── 18–23,5 s : 3 offres = 3 lettres, puis postuler ─────────
const Apply: React.FC<{ t: number }> = ({ t }) => {
  const mail = Pop(t, T.apply, 0.35), fly = easeIn(seg(t, T.send + 0.1, T.send + 0.6));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(217,130,139,0.2), rgba(11,10,11,1) 70%)" }}>
      {t < T.apply + 0.3 && COS.map((co, i) => (
        <div key={co.key} style={{ position: "absolute", inset: 0, opacity: 1 - seg(t, T.apply, T.apply + 0.3) }}>
          <MiniLetter co={co} t={t} t0={T.unfreeze + 0.1 + i * 0.75} x={[250, 540, 830][i]} y={[900, 820, 900][i]} rot={[-8, 0, 8][i]} scale={i === 1 ? 1.08 : 0.98} />
          {t >= T.unfreeze + 0.1 + i * 0.75 && <div style={{ position: "absolute", left: [250, 540, 830][i] - 170, top: 1210, width: 340, textAlign: "center", fontFamily: "Open Sans", fontWeight: 600, fontSize: 24, color: "#cfc9d4", opacity: Pop(t, T.unfreeze + 0.4 + i * 0.75) }}>{co.site}</div>}
        </div>
      ))}
      {t >= T.apply && (
        <Card style={{ left: 90, top: lerp(560, 520, mail), width: 900, height: 420, opacity: mail * (1 - fly), transform: `translate(${fly * 900}px, ${-fly * 300}px) rotate(${fly * 14}deg) scale(${1 - fly * 0.5})` }}>
          <div style={{ padding: "28px 36px", fontSize: 30, color: "#bdb2b5" }}>À : recrutement@maison-lumen.fr</div>
          <div style={{ padding: "0 36px", fontFamily: "Poppins", fontWeight: 600, fontSize: 32 }}>Candidature – Alternance marketing</div>
          <div style={{ padding: "28px 36px", display: "flex", gap: 14 }}>
            <span style={{ padding: "10px 18px", borderRadius: 14, background: "#2b2a30", border: "2px solid #45444c", fontSize: 26, fontWeight: 600 }}>CV.pdf</span>
            <span style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 14, background: "rgba(217,130,139,0.2)", border: `2px solid ${PINK}`, fontSize: 26, fontWeight: 600, color: PINK_L, transform: `scale(${lerp(1.6, 1, Pop(t, T.apply + 0.5))})`, opacity: Pop(t, T.apply + 0.5) }}><Img src={staticFile("company.png")} style={{ width: 30, height: 30, borderRadius: 7 }} />Lettre_Maison-Lumen.pdf</span>
          </div>
          <div style={{ position: "absolute", right: 34, bottom: 30, padding: "16px 40px", borderRadius: 34, background: PINK, color: "#2e1f22", fontFamily: "Poppins", fontWeight: 600, fontSize: 34, transform: `scale(${t >= T.send && t < T.send + 0.12 ? 0.92 : 1})` }}>Envoyer</div>
        </Card>
      )}
      <Tap t={t} tc={T.send} x={850} y={890} />
      {t >= T.send + 0.3 && [0, 1].map((i) => { const k = easeIn(seg(t, T.send + 0.3 + i * 0.2, T.send + 0.8 + i * 0.2)); return k > 0 && k < 1 && <div key={i} style={{ position: "absolute", left: 300 + k * 900, top: 1150 - k * 400 + i * 120, width: 160, height: 104, borderRadius: 12, background: PINK_L, opacity: 1 - k, transform: `rotate(${k * 20}deg)` }} />; })}
      <Text3D t={t} t0={T.unfreeze + 0.15} t1={T.apply} y={110} size={80} lines={[[["3 offres.", WHITE]], [["3 lettres.", PINK]]]} />
      <Text3D t={t} t0={T.apply + 0.1} t1={T.night} y={130} size={100} lines={[[["Postuler.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── 23,5–29,5 s : la nuit passe, appel manqué, le mail ─────────
const MAIL = "Bonjour Inès, j'ai tenté de vous joindre. Quand seriez-vous disponible pour un entretien ?";
const NextDay: React.FC<{ t: number }> = ({ t }) => {
  const d = easeInOut(seg(t, T.night + 0.2, T.day - 0.2));
  if (t < T.day) {
    return (
      <AbsoluteFill style={{ background: `linear-gradient(180deg, rgb(${lerp(14, 250, d)},${lerp(16, 196, d)},${lerp(34, 170, d)}) 0%, rgb(${lerp(11, 60, d)},${lerp(10, 40, d)},${lerp(11, 50, d)}) 100%)` }}>
        <div style={{ position: "absolute", left: 700, top: lerp(300, 1500, d), width: 180, height: 180, borderRadius: "50%", background: "#e9e6f0", boxShadow: "0 0 60px rgba(255,255,255,0.4)", opacity: 1 - d }} />
        <div style={{ position: "absolute", left: 200, top: lerp(1500, 360, d), width: 240, height: 240, borderRadius: "50%", background: "#ffd38a", boxShadow: "0 0 120px rgba(255,200,120,0.8)", opacity: d }} />
        <div style={{ position: "absolute", top: 900, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 110, color: WHITE, textShadow: "0 8px 30px rgba(0,0,0,0.5)" }}>{d < 0.5 ? "23:47" : "9:12"}</div>
        <div style={{ position: "absolute", top: 1060, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 50, color: WHITE, opacity: seg(t, T.night + 0.9, T.night + 1.2) }}>Le lendemain</div>
      </AbsoluteFill>
    );
  }
  // le mail + zoom sur « entretien »
  const z = easeInOut(seg(t, T.zoom0, T.zoom1)), jump = t >= T.jump ? Math.abs(Math.sin((t - T.jump) * 7)) * 90 * (1 - seg(t, T.jump + 0.8, T.hired)) : 0;
  const P = { x: 70, y: 470, w: 940 }, font = "400 40px 'Open Sans'", lineW = P.w - 80;
  // position de « entretien » : on recompose les lignes comme le navigateur (retour à la ligne par mots)
  const words = MAIL.split(" "); let line = "", lines: string[] = [];
  for (const w of words) { const test = line ? line + " " + w : w; if (measure(test, font) > lineW && line) { lines.push(line); line = w; } else line = test; } lines.push(line);
  const li = lines.findIndex((l) => l.includes("entretien")), pre = lines[li].slice(0, lines[li].indexOf("entretien"));
  const wx = P.x + 40 + measure(pre, font) + measure("entretien", font) / 2, wy = P.y + 190 + li * 60 + 22;
  const sc = lerp(1, 2.4, z), hot = t >= T.zoom1 - 0.1;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 70%, rgba(217,130,139,0.2), rgba(11,10,11,1) 70%)" }}>
      <Persona look={INES} x={540} y={1300 - jump} scale={0.85} mood={t >= T.zoom1 ? "happy" : "neutral"} pose="phone" t={t} phoneShake={t >= T.missed && t < T.missed + 0.5 ? 1 : 0} />
      {t >= T.jump && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => { const k = seg(t, T.jump, T.jump + 1.0), a = (i / 10) * Math.PI * 2; return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * 380 * k - 10, top: 1100 + Math.sin(a) * 380 * k + 300 * k * k - 10, width: 20, height: 28, borderRadius: 4, background: i % 2 ? PINK : PINK_L, opacity: 1 - k, transform: `rotate(${k * 500 + i * 40}deg)` }} />; })}
      <Card style={{ left: 70, top: 230, width: 940, height: 120, display: "flex", alignItems: "center", gap: 22, padding: "0 28px", boxSizing: "border-box", opacity: Pop(t, T.missed), transform: `translateY(${(1 - Pop(t, T.missed)) * -80}px)`, border: "2px solid #ff8a8d" }}>
        <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(255,107,107,0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#ff8a8d", fontFamily: "Poppins", fontWeight: 700, fontSize: 36 }}><svg width={36} height={36} viewBox="0 0 24 24"><path d="M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z" fill="#ff8a8d" /></svg></div>
        <div><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 30 }}>Appel manqué · Maison Lumen</div><div style={{ fontSize: 26, color: "#bdb2b5" }}>9:12</div></div>
      </Card>
      {t >= T.mail && (
        <div style={{ position: "absolute", inset: 0, transform: `translate(${(540 - wx) * z}px, ${(900 - wy) * z}px) scale(${sc})`, transformOrigin: `${wx}px ${wy}px` }}>
          <Card style={{ left: P.x, top: P.y, width: P.w, height: 430, opacity: Pop(t, T.mail), background: "#fbf9fa", color: "#2a2326", border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "26px 40px", background: "#efeaec" }}><Img src={staticFile("company.png")} style={{ width: 64, height: 64, borderRadius: 14 }} /><div><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 30 }}>Mme Roche · Maison Lumen</div><div style={{ fontSize: 24, color: "#7a7174" }}>Objet : Votre candidature</div></div></div>
            <div style={{ position: "absolute", left: 40, top: 150, width: lineW, fontSize: 40, lineHeight: "60px" }}>
              {lines.map((l, i) => { if (i !== li) return <div key={i}>{l}</div>; const a = l.indexOf("entretien"); return <div key={i}>{l.slice(0, a)}<span style={{ color: hot ? PINK : "#2a2326", fontWeight: hot ? 700 : 400, background: hot ? "rgba(217,130,139,0.15)" : "transparent", borderRadius: 6, textShadow: hot ? "0 0 14px rgba(217,130,139,0.6)" : "none" }}>entretien</span>{l.slice(a + 9)}</div>; })}
            </div>
          </Card>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ───────── 29,6–33,2 s : recrutée, puis Inès répond à sa mère ─────────
const Hired: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.contract) {
    const shake = Math.sin(t * 9) * 6, a = Pop(t, T.hired + 0.2);
    return (
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(217,130,139,0.2), rgba(11,10,11,1) 70%)" }}>
        <Persona look={INES} x={330} y={1060} scale={0.75} mood="happy" pose="stand" t={t} />
        <Persona look={ROCHE} x={750} y={1060} scale={0.75} mood="happy" pose="stand" t={t + 0.4} />
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: a }}>
          <path d={`M 440 1110 Q 500 ${1180 + shake} 540 ${1180 + shake}`} stroke={INES.top} strokeWidth={46} fill="none" strokeLinecap="round" />
          <path d={`M 640 1110 Q 580 ${1180 + shake} 540 ${1180 + shake}`} stroke={ROCHE.top} strokeWidth={46} fill="none" strokeLinecap="round" />
          <circle cx={540} cy={1180 + shake} r={30} fill={INES.skin} /><circle cx={556} cy={1176 + shake} r={26} fill={ROCHE.skin} />
        </svg>
        <div style={{ position: "absolute", top: 300, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 64, color: WHITE, opacity: Pop(t, T.hired) }}>Entretien réussi.</div>
      </AbsoluteFill>
    );
  }
  if (t < T.reply) {
    const sign = seg(t, T.contract + 0.3, T.contract + 0.8), stamp = easeIn(seg(t, T.contract + 0.9, T.contract + 1.05));
    return (
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(217,130,139,0.2), rgba(11,10,11,1) 70%)" }}>
        <div style={{ position: "absolute", left: 190, top: 400, width: 700, height: 900, borderRadius: 20, background: "#fffdfd", color: "#2a2326", padding: 50, boxSizing: "border-box", transform: `rotate(-2deg) scale(${lerp(0.85, 1, Pop(t, T.contract))})`, boxShadow: "0 0 60px rgba(217,130,139,0.4)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 42 }}>Contrat d'alternance</div><Img src={staticFile("company.png")} style={{ width: 80, height: 80, borderRadius: 16 }} /></div>
          <div style={{ fontSize: 26, color: "#7a7174", marginTop: 10 }}>Maison Lumen · Inès Martin</div>
          {[90, 78, 86, 70, 88, 64].map((w, i) => <div key={i} style={{ height: 12, borderRadius: 6, background: "#e5dddf", marginTop: 26, width: `${w}%` }} />)}
          <svg width={420} height={160} style={{ position: "absolute", left: 50, bottom: 120 }}><path d="M 10 110 C 60 20, 90 150, 140 70 S 220 30, 250 100 S 330 60, 400 80" fill="none" stroke="#2a2326" strokeWidth={6} strokeLinecap="round" strokeDasharray={700} strokeDashoffset={700 * (1 - sign)} /></svg>
          <div style={{ position: "absolute", left: 50, bottom: 100, width: 420, height: 3, background: "#cfc6c9" }} />
          {stamp > 0 && <div style={{ position: "absolute", right: 40, bottom: 80, padding: "10px 26px", border: `8px solid ${PINK}`, borderRadius: 18, color: PINK, fontFamily: "Poppins", fontWeight: 700, fontSize: 64, transform: `rotate(-14deg) scale(${lerp(2.2, 1, stamp)})`, opacity: stamp }}>SIGNÉ</div>}
        </div>
      </AbsoluteFill>
    );
  }
  // Inès répond à sa mère : la boucle est bouclée
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #1a1420 0%, #0B0A0B 70%)" }}>
      <Card style={{ left: 90, top: 260, width: 900, padding: "28px 32px", boxSizing: "border-box", opacity: Pop(t, T.reply) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 18 }}><div style={{ width: 64, height: 64, borderRadius: "50%", background: "#c9a27e", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 30, color: "#3a2a20" }}>M</div><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 34 }}>Maman</span></div>
        <Bubble text="Ma chérie, la fille de ma collègue a été prise grâce à ça ! Essaie →" style={{ fontSize: 30, opacity: 0.6 }} />
        <div style={{ marginTop: 20, opacity: Pop(t, T.reply + 0.35), transform: `translateY(${(1 - Pop(t, T.reply + 0.35)) * 30}px)` }}><Bubble me text="Maman, c'est bon, j'ai été prise !!!" /></div>
        <div style={{ textAlign: "right", fontSize: 24, color: "#9a95a0", marginTop: 8, opacity: Pop(t, T.reply + 0.8) }}>Vu</div>
      </Card>
      <Persona look={INES} x={540} y={1300} scale={0.9} mood="happy" pose="phone" t={t} />
    </AbsoluteFill>
  );
};

// ───────── 33,2–36 s : la fin ─────────
const Cta: React.FC<{ t: number }> = ({ t }) => {
  const pulse = 1 + 0.05 * Math.max(0, Math.sin((t - T.cta - 1.2) * 6));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(217,130,139,0.22), rgba(11,10,11,1) 70%)" }}>
      <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", top: lerp(300, 260, Pop(t, T.cta)), left: 540 - 220, width: 440, opacity: Pop(t, T.cta), filter: "drop-shadow(0 0 30px rgba(217,130,139,0.6))" }} />
      <Text3D t={t} t0={T.cta + 0.15} y={520} size={104} lines={[[["Ta première lettre", WHITE]], [["est offerte.", PINK]]]} />
      <div style={{ position: "absolute", top: 830, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 44, color: "#e9e1e3", opacity: Pop(t, T.cta + 0.6) }}>Avec MyMotiv, postulez.<br /><span style={{ color: PINK_L }}>Et faites-vous recruter.</span></div>
      <div style={{ position: "absolute", left: 540 - 340, top: 1060, width: 680, height: 136, borderRadius: 68, background: PINK, border: `3px solid ${PINK_L}`, boxShadow: `0 0 ${30 + 500 * (pulse - 1)}px ${PINK}, 0 0 ${80 + 900 * (pulse - 1)}px rgba(217,130,139,0.6)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 54, color: "#2e1f22", opacity: Pop(t, T.cta + 0.8), transform: `scale(${t > T.cta + 1.2 ? pulse : lerp(0.8, 1, Pop(t, T.cta + 0.8))})` }}>Générer ma lettre</div>
      <div style={{ position: "absolute", top: 1240, width: W, textAlign: "center", fontFamily: "Open Sans", fontSize: 36, opacity: Pop(t, T.cta + 1.0) }}><b style={{ color: WHITE }}>+200 </b><b style={{ color: PINK }}>Motivés</b><span style={{ color: "#a99fa2" }}> nous font déjà confiance</span></div>
      <div style={{ position: "absolute", top: 1330, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 42, color: "#cfc6c9", opacity: Pop(t, T.cta + 1.2) }}>Lien en bio</div>
    </AbsoluteFill>
  );
};

export const Parcours: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const scene = t < T.step1 ? <Intro t={t} /> : t < T.freeze ? <Steps t={t} /> : t < T.unfreeze ? <Freeze t={t} /> : t < T.night ? <Apply t={t} /> : t < T.hired ? <NextDay t={t} /> : t < T.cta ? <Hired t={t} /> : <Cta t={t} />;
  const stampHit = t >= T.contract + 1.05 && t < T.contract + 1.25 ? Math.sin(t * 150) * 12 : 0;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${stampHit}px, ${stampHit * 0.5}px)` }}>{scene}</div>
      <div style={{ position: "absolute", right: 34, bottom: 30, fontFamily: "Open Sans", fontSize: 24, color: "rgba(255,255,255,0.45)", opacity: t < T.cta ? 1 : 0 }}>Mise en scène</div>
      {[T.step1, T.freeze, T.unfreeze, T.night, T.day, T.hired, T.contract, T.reply, T.cta].map((tc) => t >= tc && t < tc + 0.1 && <div key={tc} style={{ position: "absolute", inset: 0, background: `rgba(255,240,243,${(tc === T.freeze ? 0.55 : 0.28) * (1 - (t - tc) / 0.1)})` }} />)}
      <Audio src={staticFile("audio/parcours.wav")} />
    </AbsoluteFill>
  );
};
