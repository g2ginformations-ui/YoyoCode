// « Même CV. Pas la même réponse. » (30 s) — Léo et Inès (série), côté recruteur avec Mme Roche (RH, Maison Lumen).
// Même CV ; Léo l'envoie seul, Inès ajoute sa lettre MyMotiv. Arrêt sur image, corbeille pour l'un, entretien à 15h30 pour l'autre,
// regrets de Léo, signature du contrat (caméra du haut vers le bas de la feuille). Mise en scène ; boîte mail générique.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import "./fonts";
import { BG, PINK, PINK_L, WHITE, W, clamp, lerp, seg, easeOut, easeIn, easeInOut, Text3D, Cursor } from "./common";
import { INES, LEO, ROCHE, Persona } from "./Persona";

const T = { send: 3.0, ines: 4.6, inbox: 7.0, m1: 7.6, m2: 8.2, freeze: 10.0, unfreeze: 11.0, open1: 11.3, trash0: 12.4, trash1: 13.2, open2: 14.2, scan0: 15.0, scan1: 16.6, reply: 17.4, mail: 18.0, type1: 19.3, zoom0: 19.5, zoom1: 20.3, leo: 21.0, meet: 23.0, contract: 24.2, sign0: 26.0, sign1: 26.6, stamp: 26.75, cta: 27.2 };
const easeOutExpo = (x: number) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const Pop = (t: number, t0: number, d = 0.3) => easeOut(seg(t, t0, t0 + d));
const OFFER = "Alternance · Chargé(e) de marketing";
const SUBJECT = "Candidature – Alternance Chargé(e) de marketing";
const measure = (() => { const c = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : null; return (s: string, font: string) => { if (!c) return s.length * 20; c.font = font; return c.measureText(s).width; }; })();

const Panel: React.FC<{ style: React.CSSProperties; children?: React.ReactNode }> = ({ style, children }) => (
  <div style={{ position: "absolute", borderRadius: 28, background: "#1d191c", border: "2px solid rgba(242,184,192,0.3)", boxShadow: "0 24px 60px rgba(0,0,0,0.6)", color: WHITE, fontFamily: "Open Sans", overflow: "hidden", ...style }}>{children}</div>
);
const Chip: React.FC<{ label: string; pink?: boolean; logo?: boolean }> = ({ label, pink, logo }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 16px", borderRadius: 14, background: pink ? "rgba(217,130,139,0.2)" : "#2b2a30", border: `2px solid ${pink ? PINK : "#45444c"}`, fontSize: 26, fontWeight: 600, color: pink ? PINK_L : "#d6d3da", marginRight: 12 }}>
    {logo ? <Img src={staticFile("company.png")} style={{ width: 30, height: 30, borderRadius: 7 }} /> : <span style={{ width: 22, height: 28, borderRadius: 4, background: "#8d8d98", display: "inline-block" }} />}{label}
  </span>
);
// Un CV (identique pour les deux)
const CvDoc: React.FC<{ name: string; style: React.CSSProperties }> = ({ name, style }) => (
  <div style={{ position: "absolute", width: 380, height: 520, borderRadius: 18, background: "#f6f2f1", color: "#2a2326", padding: 30, boxSizing: "border-box", boxShadow: "0 20px 40px rgba(0,0,0,0.5)", ...style }}>
    <div style={{ display: "flex", gap: 16, alignItems: "center" }}><div style={{ width: 70, height: 70, borderRadius: "50%", background: "#d8cfcc" }} /><div><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 28 }}>{name}</div><div style={{ fontFamily: "Poppins", fontSize: 17, color: "#7a7174" }}>Étudiant(e) en marketing</div></div></div>
    {["Expérience", "Formation", "Compétences"].map((h, i) => (
      <div key={h} style={{ marginTop: 26 }}><div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 18, color: "#8a7f82" }}>{h}</div>
        {[0, 1].map((j) => <div key={j} style={{ height: 9, borderRadius: 5, background: "#ddd5d6", marginTop: 10, width: `${[88, 70, 80, 62, 90, 74][i * 2 + j]}%` }} />)}</div>
    ))}
  </div>
);

// ───────── 0–3 s : même CV ─────────
const Hook: React.FC<{ t: number }> = ({ t }) => {
  const m = easeInOut(seg(t, 1.0, 1.7)), flash = t >= 1.7 && t < 1.9 ? 1 - (t - 1.7) / 0.2 : 0;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, rgba(217,130,139,0.12), rgba(11,10,11,1) 70%)" }}>
      <Persona look={LEO} x={270} y={1260} scale={0.62} mood="neutral" pose="stand" t={t} />
      <Persona look={INES} x={810} y={1260} scale={0.62} mood="neutral" pose="stand" t={t + 0.6} />
      {["Léo", "Inès"].map((n, i) => <div key={n} style={{ position: "absolute", top: 1760, left: i * 540, width: 540, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 50, color: i ? PINK : "#b9b9c2", opacity: Pop(t, 0.3) }}>{n}</div>)}
      <CvDoc name="Léo B." style={{ left: lerp(80, 350, m), top: lerp(560, 520, m), transform: `rotate(${lerp(-6, 0, m)}deg) scale(${Pop(t, 0.2, 0.4)})`, opacity: 1 }} />
      <CvDoc name="Inès M." style={{ left: lerp(620, 350, m), top: lerp(560, 520, m), transform: `rotate(${lerp(6, 0, m)}deg) scale(${Pop(t, 0.35, 0.4)})`, opacity: lerp(1, 0.55, m) }} />
      {flash > 0 && <div style={{ position: "absolute", left: 340, top: 510, width: 400, height: 540, borderRadius: 22, border: `6px solid rgba(242,184,192,${flash})`, boxShadow: `0 0 60px rgba(217,130,139,${flash})` }} />}
      {t >= 1.75 && <div style={{ position: "absolute", left: 540 - 170, top: 1060, width: 340, padding: "10px 0", borderRadius: 30, textAlign: "center", background: "rgba(217,130,139,0.2)", border: `2px solid ${PINK}`, fontFamily: "Poppins", fontWeight: 700, fontSize: 34, color: PINK_L, opacity: Pop(t, 1.75), transform: `scale(${lerp(1.4, 1, Pop(t, 1.75))})` }}>Identiques</div>}
      <Text3D t={t} t0={0.4} t1={T.send} y={110} size={88} lines={[[["Même CV.", WHITE]], [["Mêmes expériences.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── 3–7 s : les envois ─────────
const Sends: React.FC<{ t: number }> = ({ t }) => {
  const leo = t < T.ines;
  if (leo) {
    const fly = seg(t, 3.9, 4.5);
    return (
      <AbsoluteFill style={{ background: "#141417" }}>
        <Panel style={{ left: 110, top: 330, width: 860, height: 380, opacity: Pop(t, 3.0) * (1 - fly), transform: `translate(${easeIn(fly) * 900}px, ${-easeIn(fly) * 200}px) rotate(${fly * 12}deg) scale(${1 - fly * 0.5})`, background: "#1f1f24", border: "2px solid #3a3a42" }}>
          <div style={{ padding: "26px 34px", fontSize: 28, color: "#9a9aa2" }}>À : recrutement@maison-lumen.fr</div>
          <div style={{ padding: "0 34px", fontFamily: "Poppins", fontWeight: 600, fontSize: 30 }}>{SUBJECT}</div>
          <div style={{ padding: "26px 34px" }}><Chip label="CV.pdf" /></div>
          <div style={{ position: "absolute", right: 30, bottom: 26, padding: "14px 34px", borderRadius: 30, background: t >= 3.75 && t < 3.87 ? "#8a8a94" : "#5b5b64", fontFamily: "Poppins", fontWeight: 600, fontSize: 30 }}>Envoyer</div>
        </Panel>
        {t > 3.2 && t < 3.95 && <Cursor x={lerp(900, 830, Pop(t, 3.2, 0.4))} y={lerp(1000, 650, Pop(t, 3.2, 0.4))} press={t >= 3.75 && t < 3.87} />}
        <Persona look={LEO} x={540} y={1120} scale={0.95} mood="neutral" pose="desk" t={t} />
        <Text3D t={t} t0={3.15} t1={T.ines} y={1570} size={88} lines={[[["Lui : un CV.", "#c9c9d2"]]]} />
      </AbsoluteFill>
    );
  }
  const shot = t < 5.2 ? "018-offre-lien" : "020-offre-lue", letter = Pop(t, 5.5, 0.45), attach = easeInOut(seg(t, 6.1, 6.6));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, rgba(217,130,139,0.2), rgba(11,10,11,1) 70%)" }}>
      <div style={{ position: "absolute", left: 300, top: 300, width: 480, height: 853, borderRadius: 48, border: `4px solid ${PINK}`, overflow: "hidden", boxShadow: "0 0 60px rgba(217,130,139,0.4)", opacity: Pop(t, T.ines) * (1 - attach * 0.6), transform: `scale(${lerp(0.9, 1, Pop(t, T.ines))})` }}>
        <Img src={staticFile(`shots/${shot}.png`)} style={{ position: "absolute", left: -40, top: -120, width: 560, height: 996 }} />
        {t >= 5.05 && t < 5.4 && <div style={{ position: "absolute", left: 240 - 30 - 100 * seg(t, 5.05, 5.4), top: 340 - 30 - 100 * seg(t, 5.05, 5.4), width: 60 + 200 * seg(t, 5.05, 5.4), height: 60 + 200 * seg(t, 5.05, 5.4), borderRadius: "50%", border: `5px solid rgba(255,255,255,${1 - seg(t, 5.05, 5.4)})` }} />}
      </div>
      {/* la lettre sur-mesure sort du téléphone et rejoint le CV dans le mail */}
      {t >= 5.5 && (
        <div style={{ position: "absolute", left: lerp(lerp(390, 560, letter), 540, attach), top: lerp(lerp(700, 380, letter), 1180, attach), width: 320, height: 440, borderRadius: 16, background: "#fffdfd", padding: 22, boxSizing: "border-box", boxShadow: "0 0 50px rgba(217,130,139,0.5)", color: "#2a2326", transform: `rotate(${lerp(-10, 6, letter)}deg) scale(${lerp(0.4, 1, letter) * lerp(1, 0.45, attach)})`, transformOrigin: "0 0" }}>
          <Img src={staticFile("company.png")} style={{ position: "absolute", right: 18, top: 18, width: 60, height: 60, borderRadius: 12 }} />
          <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 22 }}>Inès Martin</div>
          <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 13, color: PINK, marginTop: 30 }}>Objet : {OFFER}</div>
          {[92, 80, 88, 70, 90, 60].map((w, i) => <div key={i} style={{ height: 8, borderRadius: 4, background: "#ddd5d6", marginTop: i ? 11 : 20, width: `${w}%` }} />)}
        </div>
      )}
      {attach > 0 && (
        <Panel style={{ left: 110, top: 1150, width: 860, height: 300, opacity: attach }}>
          <div style={{ padding: "24px 34px", fontSize: 28, color: "#bdb2b5" }}>À : recrutement@maison-lumen.fr</div>
          <div style={{ padding: "0 34px" }}><Chip label="CV.pdf" /><Chip label="Lettre_Maison-Lumen.pdf" pink logo /></div>
          <div style={{ position: "absolute", right: 30, bottom: 26, padding: "14px 34px", borderRadius: 30, background: PINK, color: "#2e1f22", fontFamily: "Poppins", fontWeight: 600, fontSize: 30, transform: `scale(${t >= 6.75 && t < 6.87 ? 0.92 : 1})` }}>Envoyer</div>
        </Panel>
      )}
      <Text3D t={t} t0={T.ines + 0.15} t1={T.inbox} y={70} size={70} lines={[[["Elle : CV +", WHITE]], [["lettre sur-mesure.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── 7–18 s : la boîte mail de Mme Roche ─────────
const Row: React.FC<{ who: string; letter: boolean; t: number; t0: number; y: number; hover?: boolean; gone?: number }> = ({ who, letter, t, t0, y, hover, gone = 0 }) => {
  if (t < t0) return null;
  const a = easeOutExpo(seg(t, t0, t0 + 0.4));
  return (
    <div style={{ position: "absolute", left: 30, top: y - (1 - a) * 80, width: 820, height: 190, borderRadius: 20, background: hover ? "#2c2529" : "#24202a", border: `2px solid ${hover ? PINK : "#3a3540"}`, opacity: a * (1 - gone), padding: "22px 26px", boxSizing: "border-box", transform: `translate(${easeIn(gone) * 500}px, ${easeIn(gone) * 700}px) scale(${1 - gone * 0.7}) rotate(${gone * 30}deg)` }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 32 }}>{who}</span><span style={{ fontSize: 24, color: "#9a95a0" }}>à l'instant</span></div>
      <div style={{ fontSize: 26, color: "#cfc9d4", marginTop: 4 }}>{SUBJECT}</div>
      <div style={{ marginTop: 14 }}><Chip label="CV.pdf" />{letter && <Chip label="Lettre_Maison-Lumen.pdf" pink logo />}</div>
    </div>
  );
};
const Inbox: React.FC<{ t: number }> = ({ t }) => {
  const frozen = t >= T.freeze && t < T.unfreeze, tt = frozen ? T.freeze : t; // le temps s'arrête
  const open1 = t >= T.open1 && t < T.trash1 + 0.3, open2 = t >= T.open2;
  const gone = easeInOut(seg(t, T.trash0, T.trash1));
  // curseur de Mme Roche
  const keys: [number, number, number][] = [[8.6, 980, 1500], [9.6, 560, 770], [10.0, 560, 770], [11.1, 560, 600], [12.2, 600, 600], [12.4, 600, 600], [13.0, 980, 1270], [13.9, 560, 820], [16.8, 560, 820], [17.3, 840, 1290]];
  let cx = keys[0][1], cy = keys[0][2];
  for (let i = 0; i < keys.length - 1; i++) { const [a0, x0, y0] = keys[i], [a1, x1, y1] = keys[i + 1]; if (tt >= a0 && tt < a1) { const k = easeInOut(seg(tt, a0, Math.min(a1, a0 + 0.5))); cx = lerp(x0, x1, k); cy = lerp(y0, y1, k); break; } if (tt >= a1) { cx = x1; cy = y1; } }
  const press = [T.open1, T.open2, T.reply].some((c) => t >= c && t < c + 0.12) || (t >= T.trash0 && t < T.trash1);
  const scan = seg(t, T.scan0, T.scan1);
  const KW = ["réseaux sociaux", "retail", "Lyon", "contenu"];
  return (
    <AbsoluteFill style={{ background: "#0f0d10", filter: frozen ? "grayscale(0.85) contrast(1.1)" : "none" }}>
      {/* Mme Roche à son bureau */}
      <Persona look={ROCHE} x={540} y={1500} scale={0.7} mood={open2 ? "happy" : open1 ? "neutral" : "neutral"} pose="desk" t={tt} />
      <div style={{ position: "absolute", top: 1840, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 30, color: "#c9d2e6", opacity: Pop(t, T.inbox) }}>Mme Roche · RH, Maison Lumen</div>
      {/* l'écran : boîte de réception générique */}
      <Panel style={{ left: 70, top: 280, width: 940, height: 1000, opacity: Pop(t, T.inbox), background: "#19161b" }}>
        <div style={{ height: 90, background: "#221e25", display: "flex", alignItems: "center", gap: 18, padding: "0 30px" }}>
          <Img src={staticFile("company.png")} style={{ width: 50, height: 50, borderRadius: 12 }} />
          <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 32 }}>Boîte de réception</span><span style={{ fontSize: 26, color: "#9a95a0" }}>· Recrutement</span>
        </div>
        <div style={{ position: "absolute", left: 30, top: 110, right: 30 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ height: 100, borderRadius: 16, background: "#1f1b22", marginTop: i ? 14 : 0, opacity: 0.6 }} />)}
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: 940, height: 1000, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: 0, left: 0 }}>
            <Row who="Léo B." letter={false} t={tt} t0={T.m1} y={420} hover={tt >= 11.1 && tt < T.trash0} gone={gone} />
            <Row who="Inès M." letter t={tt} t0={T.m2} y={640} hover={tt >= 13.9} />
          </div>
        </div>
        {/* corbeille */}
        {t >= 12.2 && t < 14.0 && <div style={{ position: "absolute", right: 40, bottom: 40, width: 120, height: 140, opacity: Pop(t, 12.2) * (1 - seg(t, 13.7, 14.0)) }}><svg viewBox="0 0 100 120" width={120} height={140}><rect x={18} y={30} width={64} height={84} rx={8} fill="#3a3540" stroke="#8a8590" strokeWidth={4} /><rect x={8} y={18} width={84} height={12} rx={4} fill="#8a8590" transform={`rotate(${t >= T.trash1 - 0.3 && t < T.trash1 + 0.1 ? -20 : 0} 8 24)`} /><rect x={38} y={8} width={24} height={10} rx={3} fill="#8a8590" /></svg></div>}
      </Panel>
      {/* aperçu du mail de Léo : un CV seul */}
      {open1 && (
        <Panel style={{ left: 180, top: 520, width: 720, height: 560, opacity: Pop(t, T.open1 + 0.05) * (1 - seg(t, T.trash0 - 0.1, T.trash0 + 0.2)), background: "#e9e6e8", color: "#4b4b52", padding: 36, boxSizing: "border-box" }}>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 34, color: "#2a2326" }}>Léo B. · CV.pdf</div>
          <div style={{ fontSize: 26, marginTop: 6 }}>Aucune lettre de motivation</div>
          {[86, 70, 90, 64, 78, 58, 84].map((w, i) => <div key={i} style={{ height: 14, borderRadius: 7, background: "#cfcacd", marginTop: i ? 18 : 34, width: `${w}%` }} />)}
        </Panel>
      )}
      {/* papier froissé qui tombe dans la corbeille */}
      {t >= T.trash0 + 0.2 && t < T.trash1 + 0.1 && (() => { const k = easeIn(seg(t, T.trash0 + 0.2, T.trash1)); return <svg width={140} height={140} viewBox="-70 -70 140 140" style={{ position: "absolute", left: lerp(560, 890, k) - 70, top: lerp(780, 1190, k) - 70, transform: `rotate(${k * 400}deg) scale(${lerp(1.2, 0.6, k)})` }}><polygon points="-50,-30 -20,-55 25,-48 52,-15 45,30 10,55 -35,45 -55,10" fill="#e9e6e8" stroke="#bdb8bc" strokeWidth={4} /><path d="M -30 -20 L 10 0 L -10 30 M 20 -30 L 0 0 L 35 15" stroke="#bdb8bc" strokeWidth={4} fill="none" /></svg>; })()}
      {/* la lettre d'Inès, lue par Mme Roche */}
      {open2 && (
        <div style={{ position: "absolute", left: 150, top: lerp(440, 380, Pop(t, T.open2)), width: 780, height: 900, borderRadius: 20, background: "#fffdfd", color: "#2a2326", padding: 46, boxSizing: "border-box", opacity: Pop(t, T.open2 + 0.05) * (1 - seg(t, T.mail - 0.15, T.mail)), boxShadow: "0 0 70px rgba(217,130,139,0.45)" }}>
          <Img src={staticFile("company.png")} style={{ position: "absolute", right: 36, top: 36, width: 96, height: 96, borderRadius: 18, boxShadow: scan > 0 && scan < 0.3 ? `0 0 30px ${PINK}` : "none" }} />
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 40 }}>Inès Martin</div>
          <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 22, color: PINK, marginTop: 40 }}>Objet : {OFFER}</div>
          <div style={{ fontFamily: "Liberation Serif, Georgia, serif", fontSize: 30, lineHeight: 1.55, marginTop: 26 }}>
            Madame Roche,<br />
            Faire vivre une marque sur les{" "}
            {KW.map((k, i) => { const on = scan > (i + 1) / (KW.length + 1); const sep = i === KW.length - 1 ? "." : i === 0 ? " d'une enseigne de " : i === 1 ? " à " : ", avec un "; return <React.Fragment key={k}><span style={{ background: on ? "rgba(217,130,139,0.35)" : "transparent", borderRadius: 6, padding: "0 4px", boxShadow: on ? `0 0 18px rgba(217,130,139,0.6)` : "none" }}>{k}</span>{i === 2 ? ", en créant du " : sep}</React.Fragment>; })}
            <br />C'est exactement ce que propose Maison Lumen…
          </div>
          {/* le regard de la recruteuse qui balaie la lettre */}
          {scan > 0 && scan < 1 && <div style={{ position: "absolute", left: 30, right: 30, top: 300 + scan * 340, height: 6, borderRadius: 3, background: `linear-gradient(90deg, rgba(217,130,139,0), ${PINK}, rgba(217,130,139,0))`, boxShadow: `0 0 20px ${PINK}` }} />}
          <div style={{ position: "absolute", left: 46, bottom: 40, padding: "16px 40px", borderRadius: 32, background: PINK, color: "#2e1f22", fontFamily: "Poppins", fontWeight: 600, fontSize: 32, opacity: Pop(t, 16.9), transform: `scale(${t >= T.reply && t < T.reply + 0.12 ? 0.92 : 1})` }}>Répondre</div>
        </div>
      )}
      {t >= 8.6 && t < T.mail && <Cursor x={cx} y={cy} press={press} />}
      {frozen && <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 0 14px rgba(255,255,255,0.85)" }} />}
      <Text3D t={t} t0={T.inbox + 0.2} t1={T.freeze} y={90} size={84} lines={[[["Côté recruteur…", WHITE]]]} />
      <Text3D t={t} t0={T.freeze + 0.05} t1={T.unfreeze + 0.25} y={90} size={96} lines={[[["Toi, tu es", WHITE]], [["lequel ?", PINK]]]} />
      <Text3D t={t} t0={T.open1 + 0.2} t1={T.open2} y={90} size={84} lines={[[["Pas de lettre.", WHITE]], [["Suivant.", "#b9b9c2"]]]} />
      <Text3D t={t} t0={T.open2 + 0.3} t1={T.mail - 0.1} y={90} size={84} lines={[[["Elle a lu", WHITE]], [["SON offre.", PINK]]]} />
    </AbsoluteFill>
  );
};

// ───────── 18–21 s : le mail d'invitation + zoom sur 15h30 ─────────
const BODY = ["Bonjour Inès,", "Votre candidature a retenu toute", "notre attention. Seriez-vous disponible", "pour un entretien demain à 15h30 ?", "Bien cordialement,", "Mme Roche – RH, Maison Lumen"];
const MailReply: React.FC<{ t: number }> = ({ t }) => {
  const total = BODY.join("").length, typed = Math.floor(total * easeOut(seg(t, T.mail + 0.3, T.type1)));
  let rest = typed;
  const z = easeInOut(seg(t, T.zoom0, T.zoom1)), hot = t >= T.zoom1 - 0.1;
  // position de « 15h30 » dans le panneau (mesurée avec la vraie police)
  const P = { x: 70, y: 420, w: 940 }, padX = 50, lineY0 = 300, lh = 62, font = "400 40px 'Open Sans'";
  const wx = P.x + padX + measure("pour un entretien demain à ", font) + measure("15h30", font) / 2, wy = P.y + lineY0 + 3 * lh - 12;
  const sc = lerp(1, 3.2, z), tx = (540 - wx) * z, ty = (960 - wy) * z;
  return (
    <AbsoluteFill style={{ background: "#0f0d10" }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${sc})`, transformOrigin: `${wx}px ${wy}px` }}>
        <Panel style={{ left: P.x, top: P.y, width: P.w, height: 820, opacity: Pop(t, T.mail), background: "#fbf9fa", color: "#2a2326", border: "none" }}>
          <div style={{ height: 90, background: "#efeaec", display: "flex", alignItems: "center", padding: "0 40px", fontFamily: "Poppins", fontWeight: 700, fontSize: 32 }}>Nouveau message</div>
          <div style={{ padding: "22px 50px 0", fontSize: 30, color: "#6f666a" }}>À : <b style={{ color: "#2a2326" }}>Inès M.</b></div>
          <div style={{ padding: "10px 50px 0", fontSize: 30, color: "#6f666a" }}>Objet : <b style={{ color: "#2a2326" }}>Entretien – Alternance marketing</b></div>
          <div style={{ position: "absolute", left: padX, top: lineY0 - 46, right: 40, fontSize: 40, lineHeight: `${lh}px` }}>
            {BODY.map((line, i) => { const shown = line.slice(0, Math.max(0, rest)); rest -= line.length; if (i !== 3) return <div key={i} style={{ minHeight: lh, marginTop: i === 4 ? 30 : 0 }}>{shown}</div>;
              const pre = "pour un entretien demain à ", hl = shown.length > pre.length;
              return <div key={i} style={{ minHeight: lh }}>{shown.slice(0, pre.length)}{hl && <span style={{ color: hot ? PINK : "#2a2326", fontWeight: hot ? 700 : 400, textShadow: hot ? `0 0 14px rgba(217,130,139,0.7)` : "none", background: hot ? "rgba(217,130,139,0.15)" : "transparent", borderRadius: 6 }}>{shown.slice(pre.length, pre.length + 5)}</span>}{shown.slice(pre.length + 5)}</div>; })}
          </div>
        </Panel>
      </div>
      {hot && <div style={{ position: "absolute", left: 540 - 380 * Pop(t, T.zoom1 - 0.1, 0.4), top: 960 - 380 * Pop(t, T.zoom1 - 0.1, 0.4), width: 760 * Pop(t, T.zoom1 - 0.1, 0.4), height: 760 * Pop(t, T.zoom1 - 0.1, 0.4), borderRadius: "50%", border: `6px solid rgba(242,184,192,${1 - Pop(t, T.zoom1 - 0.1, 0.4)})` }} />}
    </AbsoluteFill>
  );
};

// ───────── 21–23 s : les regrets de Léo ─────────
const Regret: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: "#141417" }}>
    <div style={{ position: "absolute", top: 300, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 40, color: "#77777f", opacity: Pop(t, T.leo) }}>Aucune réponse</div>
    <Persona look={LEO} x={540} y={1150} scale={1} mood="sad" pose="phone" t={t} />
    <div style={{ position: "absolute", left: 120, top: lerp(470, 430, Pop(t, T.leo + 0.4)), width: 840, padding: "36px 40px", boxSizing: "border-box", borderRadius: 60, background: "#f4f1f3", color: "#2a2326", fontFamily: "Poppins", fontWeight: 700, fontSize: 52, textAlign: "center", opacity: Pop(t, T.leo + 0.4), boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>
      « J'aurais dû utiliser <span style={{ color: PINK }}>MyMotiv</span>… »
      {[0, 1, 2].map((i) => <div key={i} style={{ position: "absolute", left: 470 - i * 20, top: 190 + i * 50, width: 44 - i * 12, height: 44 - i * 12, borderRadius: "50%", background: "#f4f1f3" }} />)}
    </div>
  </AbsoluteFill>
);

// ───────── 23–27 s : l'entretien, puis la signature (caméra du haut vers le bas) ─────────
const Hired: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.contract) {
    const shake = Math.sin(t * 9) * 6;
    return (
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, rgba(217,130,139,0.2), rgba(11,10,11,1) 70%)" }}>
        <div style={{ position: "absolute", top: 250, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 44, color: PINK_L, opacity: Pop(t, T.meet) }}>Le lendemain, 15h30</div>
        <Persona look={INES} x={330} y={1060} scale={0.75} mood="happy" pose="stand" t={t} />
        <Persona look={ROCHE} x={750} y={1060} scale={0.75} mood="happy" pose="stand" t={t + 0.4} />
        {/* poignée de main */}
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <path d={`M 440 1110 Q 500 ${1180 + shake} 540 ${1180 + shake}`} stroke={INES.top} strokeWidth={46} fill="none" strokeLinecap="round" opacity={Pop(t, T.meet + 0.3)} />
          <path d={`M 640 1110 Q 580 ${1180 + shake} 540 ${1180 + shake}`} stroke={ROCHE.top} strokeWidth={46} fill="none" strokeLinecap="round" opacity={Pop(t, T.meet + 0.3)} />
          <circle cx={540} cy={1180 + shake} r={30} fill={INES.skin} opacity={Pop(t, T.meet + 0.3)} />
          <circle cx={556} cy={1176 + shake} r={26} fill={ROCHE.skin} opacity={Pop(t, T.meet + 0.3)} />
        </svg>
        {t > T.meet + 0.5 && [0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2, k = seg(t, T.meet + 0.5, T.meet + 1.1); return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * (40 + 120 * k) - 6, top: 1180 + Math.sin(a) * (40 + 120 * k) - 6, width: 12, height: 12, borderRadius: "50%", background: PINK_L, opacity: 1 - k }} />; })}
      </AbsoluteFill>
    );
  }
  // le contrat, filmé du haut vers le bas
  const DOC_H = 2700, pan = easeInOut(seg(t, T.contract + 0.2, T.sign0 - 0.1)), y = lerp(260, 1920 - DOC_H - 120, pan);
  const sign = seg(t, T.sign0, T.sign1), stamp = easeIn(seg(t, T.stamp, T.stamp + 0.15));
  return (
    <AbsoluteFill style={{ background: "#0f0d10" }}>
      <div style={{ position: "absolute", left: 110, top: y, width: 860, height: DOC_H, background: "#fffdfd", borderRadius: 18, color: "#2a2326", padding: 60, boxSizing: "border-box", opacity: Pop(t, T.contract, 0.2), boxShadow: "0 0 70px rgba(217,130,139,0.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 52 }}>Contrat d'alternance</div><Img src={staticFile("company.png")} style={{ width: 100, height: 100, borderRadius: 20 }} /></div>
        <div style={{ fontSize: 30, color: "#7a7174", marginTop: 14 }}>{OFFER}</div>
        <div style={{ fontSize: 30, marginTop: 40 }}>Entre <b>Maison Lumen</b> et <b>Inès Martin</b></div>
        {Array.from({ length: 7 }, (_, s) => (
          <div key={s} style={{ marginTop: 60 }}><div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 30 }}>Article {s + 1}</div>
            {[0, 1, 2, 3].map((j) => <div key={j} style={{ height: 14, borderRadius: 7, background: "#e5dddf", marginTop: 20, width: `${[94, 86, 90, 62][j]}%` }} />)}</div>
        ))}
        <div style={{ position: "absolute", left: 60, right: 60, bottom: 90 }}>
          <div style={{ fontSize: 28, color: "#7a7174" }}>Signature de l'alternant(e)</div>
          <svg width={500} height={170} style={{ display: "block", marginTop: 6 }}><path d="M 10 120 C 60 20, 90 160, 140 80 S 220 30, 250 110 S 330 70, 480 90" fill="none" stroke="#2a2326" strokeWidth={7} strokeLinecap="round" strokeDasharray={800} strokeDashoffset={800 * (1 - sign)} /></svg>
          <div style={{ height: 3, background: "#cfc6c9", width: 520 }} />
          {stamp > 0 && <div style={{ position: "absolute", right: 10, bottom: 30, padding: "12px 30px", border: `9px solid ${PINK}`, borderRadius: 20, color: PINK, fontFamily: "Poppins", fontWeight: 700, fontSize: 76, transform: `rotate(-14deg) scale(${lerp(2.4, 1, stamp)})`, opacity: stamp }}>SIGNÉ</div>}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ───────── 27–30 s : fin ─────────
const Cta: React.FC<{ t: number }> = ({ t }) => {
  const pulse = 1 + 0.05 * Math.max(0, Math.sin((t - T.cta - 1.2) * 6));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(217,130,139,0.2), rgba(11,10,11,1) 70%)" }}>
      <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", top: lerp(380, 340, Pop(t, T.cta)), left: 540 - 230, width: 460, opacity: Pop(t, T.cta), filter: "drop-shadow(0 0 30px rgba(217,130,139,0.6))" }} />
      <Text3D t={t} t0={T.cta + 0.2} y={620} size={84} lines={[[["Avec MyMotiv, postulez.", WHITE]], [["Et faites-vous recruter.", PINK]]]} />
      <div style={{ position: "absolute", top: 1010, width: W, textAlign: "center", fontFamily: "Open Sans", fontSize: 38, opacity: Pop(t, T.cta + 0.7) }}><b style={{ color: WHITE }}>+200 </b><b style={{ color: PINK }}>Motivés</b><span style={{ color: "#a99fa2" }}> nous font déjà confiance</span></div>
      <div style={{ position: "absolute", left: 540 - 340, top: 1120, width: 680, height: 136, borderRadius: 68, background: PINK, border: `3px solid ${PINK_L}`, boxShadow: `0 0 ${30 + 500 * (pulse - 1)}px ${PINK}, 0 0 ${80 + 900 * (pulse - 1)}px rgba(217,130,139,0.6)`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 54, color: "#2e1f22", opacity: Pop(t, T.cta + 0.9), transform: `scale(${t > T.cta + 1.2 ? pulse : lerp(0.8, 1, Pop(t, T.cta + 0.9))})` }}>Générer ma lettre</div>
      <div style={{ position: "absolute", top: 1310, width: W, textAlign: "center", fontFamily: "Poppins", fontWeight: 600, fontSize: 42, color: "#cfc6c9", opacity: Pop(t, T.cta + 1.2) }}>Lien en bio</div>
    </AbsoluteFill>
  );
};

export const Recruteur: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const scene = t < T.send ? <Hook t={t} /> : t < T.inbox ? <Sends t={t} /> : t < T.mail ? <Inbox t={t} /> : t < T.leo ? <MailReply t={t} /> : t < T.meet ? <Regret t={t} /> : t < T.cta ? <Hired t={t} /> : <Cta t={t} />;
  const stampHit = t >= T.stamp + 0.12 && t < T.stamp + 0.32 ? Math.sin(t * 150) * 12 : 0;
  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ position: "absolute", inset: 0, transform: `translate(${stampHit}px, ${stampHit * 0.5}px)` }}>{scene}</div>
      <div style={{ position: "absolute", right: 34, bottom: 30, fontFamily: "Open Sans", fontSize: 24, color: "rgba(255,255,255,0.45)", opacity: t < T.cta ? 1 : 0 }}>Mise en scène</div>
      {[T.send, T.ines, T.inbox, T.unfreeze, T.mail, T.leo, T.meet, T.contract, T.cta].map((tc) => t >= tc && t < tc + 0.1 && <div key={tc} style={{ position: "absolute", inset: 0, background: `rgba(255,240,243,${0.28 * (1 - (t - tc) / 0.1)})` }} />)}
      {t >= T.freeze && t < T.freeze + 0.08 && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.5)" }} />}
      <Audio src={staticFile("audio/recruteur.wav")} />
    </AbsoluteFill>
  );
};
