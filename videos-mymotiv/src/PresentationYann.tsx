// « Moi c'est Yann » (≈48 s, 60 i/s, 9:16) — la page de présentation du propriétaire avant MyMotiv, avec SES 24 photos
// (public/yann/ : 16 gestes + 8 émotions, détourées) : mosaïque des 24 portraits en ouverture → zoom sur « Moi, c'est Yann »
// → derrière MyMotiv → 1 an ½ de recrutement à Paris → profils payés plus de 100 000 €/an → deux CV identiques, la lettre
// fait la différence → MyMotiv (vrai site, 30 s*) → l'offre Semaine 3,99 € → une lettre sur mesure par offre → Léni →
// 1re lettre offerte → mosaïque finale + logo. Le présentateur change de pose au fil des phrases (les 24 servent).
// Faits confirmés par le propriétaire (voir CLAUDE.md). Voix : ElevenLabs « Alexandre » (--voix yann), voix-yann.json.
// Son : synth_yann.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CalendarCheck, Check, FileUser, Gift, Link2, MapPin, Timer } from "lucide-react";
import { go } from "./apple";
import { PINK, PINK_L, clamp, easeOutBack, lerp, rng, seg } from "./common";
import { AppIcon, Flash, GlossPill, ease, pulse } from "./motion";
import { Extruded, Pill } from "./AlternancePartout";
import voix from "./data/yann-voix.json";
import voixEnv from "./data/yann-env.json";
import photos from "./data/yann-photos.json";
import "./fonts";

export const YANN_DUR = voix.duration;
const BG = "#0B0A0B", GLASS = "linear-gradient(170deg, #2E2A2C 0%, #1A1718 100%)", INK = "#F5F5F7", SOFT = "#8E8E93";
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const show = (t: number, a: number, b: number) => t >= a && t < b;
const T = {
  bonjour: Wt(0), yann: Wt(4), mm: Wt(11), possible: Wt(18), anDemi: Wt(21), paris: Wt(30), recrute: Wt(33), cent: Wt(39),
  bureau: Wt(50), chose: Wt(55), deuxCv: Wt(57), lettre: Wt(64), diff: Wt(68), cree: Wt(72), lien: Wt(78), cv: Wt(83), s30: Wt(86),
  cette: Wt(95), travail: Wt(103), semaine: Wt(106), prix: Wt(109), mesure: Wt(114), bien: Wt(121), chances: Wt(127), entretiens: Wt(131),
  leni: Wt(132), onze: Wt(135), sept: Wt(137), offerte: Wt(143), bio: Wt(149), jouer: Wt(153), end: PH[9][1],
};
const ALL = Object.keys(photos);                   // les 24 photos détourées
const P = (n: string) => staticFile(`yann/${n}`);

// ─── le présentateur : une pose par moment de la voix (les 24 photos y passent) ───
const POSES: [number, string][] = [
  [1.25, "g2-affirmer"], [PH[1][0], "g2-partager"], [4.8, "g1-converser"], [PH[2][0], "g1-expliquer"], [8.0, "g2-decrire"],
  [PH[3][0], "g2-argumenter"], [T.cent - 0.15, "emo-peur"], [PH[4][0], "g1-narrer"], [T.chose - 0.6, "emo-reflexion"],
  [T.deuxCv - 0.25, "g1-debattre"], [T.deuxCv + 0.85, "emo-confusion"], [T.lettre - 0.1, "g2-insister"], [PH[5][0], "g1-dialoguer"],
  [T.lien - 0.45, "g2-expliquer"], [T.cv - 0.05, "g1-preciser"], [T.cette - 1.1, "g2-raconter"], [PH[6][0], "emo-tristesse"],
  [T.travail - 0.4, "emo-colere"], [T.semaine - 0.7, "g1-convaincre"], [T.prix - 0.2, "emo-surprise"], [PH[7][0], "g2-preciser"],
  [T.bien - 0.15, "emo-degout"], [T.chances - 0.6, "g2-affirmer"], [PH[8][0], "emo-joie"], [PH[9][0], "g1-conclure"],
];
const envAt = (t: number) => { const i = Math.floor(t * 60); return i >= 0 && i < voixEnv.length ? voixEnv[i] : 0; };
const Presenter: React.FC<{ t: number; w?: number; x?: number }> = ({ t, w = 790, x = 540 }) => {
  if (t < POSES[0][0] - 0.05 || t > T.end + 0.25) return null;
  const idx = POSES.reduce((a, [p0], i) => (t >= p0 ? i : a), 0);
  const [since, name] = POSES[idx], prev = idx > 0 ? POSES[idx - 1][1] : null;
  const fade = seg(t, since, since + 0.12), talk = (envAt(t) + envAt(t - 0.03)) / 2;
  const h = w * 1.215;                              // même cadrage pour toutes les poses (les photos plus hautes sont coupées en bas)
  const leave = seg(t, T.end, T.end + 0.25);
  const style = (o: number): React.CSSProperties => ({ position: "absolute", left: 0, top: 0, width: w, opacity: o, filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.6)) drop-shadow(0 0 2px rgba(242,184,192,0.6))" });
  return (
    <div style={{ position: "absolute", left: x - w / 2, top: 1920 - h + 30 + leave * 400 - talk * 8, width: w, height: h, transformOrigin: "50% 100%", opacity: 1 - leave,
      transform: `scale(${(1 + 0.05 * pulse(t, since + 0.06, 0.07)) * (1 + talk * 0.008)}) rotate(${Math.sin(t * 1.3) * 0.6}deg)` }}>
      <div style={{ position: "absolute", left: -120, right: -120, top: -80, height: h, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 40%, rgba(242,184,192,0.30), rgba(217,130,139,0) 62%)" }} />
      {prev && fade < 1 && <Img src={P(`${prev}.png`)} style={style(1 - fade)} />}
      <Img src={P(`${name}.png`)} style={style(fade)} />
    </div>
  );
};

// ─── la mosaïque des 24 portraits (ouverture et fin) ───
const Mosaic: React.FC<{ t: number; t0: number; zoomTo?: string; zk?: number; dim?: number }> = ({ t, t0, zoomTo, zk = 0, dim = 0 }) => {
  const cols = 4, cw = 270, ch = 320;
  const zi = zoomTo ? ALL.indexOf(zoomTo) : -1;
  const zx = zi >= 0 ? (zi % cols) * cw + cw / 2 : 540, zy = zi >= 0 ? Math.floor(zi / cols) * ch + ch / 2 : 960;
  const s = lerp(1, 4, zk);
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${lerp(0, 540 - zx * s, zk)}px, ${lerp(0, 960 - zy * s, zk)}px) scale(${s})`, opacity: 1 - dim }}>
      {ALL.map((n, i) => {
        const c = i % cols, r = Math.floor(i / cols), d = Math.hypot(c - 1.5, r - 2.5);
        const at = t0 + d * 0.06, k = easeOutBack(seg(t, at, at + 0.3));
        const meta = photos[n as keyof typeof photos], iw = cw - 16, ih = (iw * meta.h) / meta.w;
        return (
          <div key={n} style={{ position: "absolute", left: c * cw + 8, top: r * ch + 8, width: cw - 16, height: ch - 16, borderRadius: 26, overflow: "hidden", opacity: clamp(k * 1.5),
            transform: `scale(${lerp(0.4, 1, k)})`, background: i % 3 === 0 ? `linear-gradient(160deg, ${PINK_L}, ${PINK})` : "linear-gradient(160deg, #2E2A2C, #161415)", boxShadow: "0 12px 30px rgba(0,0,0,0.5)" }}>
            <Img src={P(n)} style={{ position: "absolute", left: 0, top: Math.max(4, ch - 16 - ih), width: iw, height: ih }} />
          </div>
        );
      })}
    </div>
  );
};

// ─── titres ───
const Title: React.FC<{ t: number; a: number; b: number; top: number; children: React.ReactNode; size?: number; color?: string }> = ({ t, a, b, top, children, size = 70, color = "#fff" }) => {
  if (!show(t, a - 0.05, b)) return null;
  const k = ease(t, a, a + 0.35), o = seg(t, b - 0.2, b);
  return <div style={{ position: "absolute", left: 50, right: 50, top, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: size, lineHeight: 1.08, letterSpacing: -2, color,
    opacity: clamp(k * 1.4) * (1 - o), transform: `translateY(${(1 - k) * 36}px)`, filter: `blur(${(1 - k) * 8 + o * 10}px)`, textShadow: "0 6px 30px rgba(0,0,0,0.8)" }}>{children}</div>;
};
const Note: React.FC<{ t: number; a: number; b: number; top?: number; children: React.ReactNode }> = ({ t, a, b, top = 860, children }) =>
  show(t, a, b) ? <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", fontFamily: "Open Sans", fontSize: 24, color: "rgba(245,245,247,0.65)", opacity: seg(t, a, a + 0.25) * (1 - seg(t, b - 0.2, b)), zIndex: 12 }}>{children}</div> : null;

// ─── scènes ───
const Hook: React.FC<{ t: number }> = ({ t }) => {
  if (t > PH[1][0] + 0.2) return null;
  const zk = Math.pow(ease(t, T.bonjour - 0.1, 1.3), 1.4), out = seg(t, 1.15, 1.45);
  return (
    <>
      {out < 1 && <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}><Mosaic t={t} t0={-0.1} zoomTo="g2-affirmer.png" zk={zk} /></div>}
      <Title t={t} a={T.bonjour - 0.15} b={PH[1][0] + 0.15} top={220} size={64}>Bonjour, moi c'est</Title>
      {t >= T.yann - 0.2 && <div style={{ position: "absolute", left: 0, right: 0, top: 320, display: "flex", justifyContent: "center", opacity: 1 - seg(t, PH[1][0], PH[1][0] + 0.2), transform: `scale(${go(t, T.yann - 0.2, T.yann + 0.15, 1.6, 1)})` }}><Extruded text="YANN" size={250} /></div>}
    </>
  );
};
const Behind: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, PH[1][0] - 0.05, PH[2][0] + 0.1)) return null;
  const out = seg(t, PH[2][0] - 0.15, PH[2][0] + 0.1);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      <Title t={t} a={PH[1][0]} b={PH[2][0]} top={230} size={64}>C'est moi qui suis derrière</Title>
      {t >= T.mm - 0.25 && <div style={{ position: "absolute", left: 0, right: 0, top: 360, display: "flex", flexDirection: "column", alignItems: "center", gap: 24, transform: `scale(${go(t, T.mm - 0.25, T.mm + 0.1, 0.4, 1)})` }}>
        <AppIcon size={170} />
        <Img src={staticFile("logo-mymotiv.png")} style={{ width: 480, filter: `drop-shadow(0 0 18px ${PINK})` }} />
      </div>}
      {t >= T.possible - 0.4 && <div style={{ position: "absolute", left: 540, top: 760, transform: `translate(-50%, 0) scale(${go(t, T.possible - 0.4, T.possible, 0.3, 0.85)})` }}><Pill icon={Check} label="Et qui rend tout possible" pink /></div>}
    </div>
  );
};
const Career: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, PH[2][0] - 0.05, PH[4][0] + 0.1)) return null;
  const out = seg(t, PH[4][0] - 0.15, PH[4][0] + 0.1), p2 = ease(t, PH[3][0] - 0.1, PH[3][0] + 0.3);
  const n = Math.round(100000 * ease(t, T.cent - 0.9, T.cent + 0.05) / 1000) * 1000;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 220, textAlign: "center", opacity: 1 - p2, transform: `translateY(${-p2 * 60}px)`, filter: `blur(${p2 * 10}px)` }}>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 220, lineHeight: 1, letterSpacing: -8, color: PINK_L, transform: `scale(${go(t, T.anDemi - 0.3, T.anDemi + 0.05, 0.4, 1)})`, opacity: seg(t, T.anDemi - 0.35, T.anDemi - 0.15) }}>1 an ½</div>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 60, color: "#fff", marginTop: 10, opacity: seg(t, T.anDemi + 0.2, T.anDemi + 0.5) }}>de recrutement</div>
        {t >= T.paris - 0.35 && <div style={{ display: "flex", justifyContent: "center", marginTop: 26, transform: `scale(${go(t, T.paris - 0.35, T.paris, 0.3, 0.85)})` }}><Pill icon={MapPin} label="à Paris" pink /></div>}
        <div style={{ fontFamily: "Open Sans", fontSize: 28, color: SOFT, marginTop: 18, opacity: seg(t, T.paris, T.paris + 0.3) }}>5 mois en cabinet · 1 an en alternance</div>
      </div>
      {p2 > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 230, textAlign: "center", opacity: p2 }}>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 52, color: "#fff" }}>J'ai recruté des profils payés</div>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: PINK_L, marginTop: 14, opacity: seg(t, T.cent - 1.1, T.cent - 0.85) }}>plus de</div>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 170, lineHeight: 1, letterSpacing: -6, color: "#fff", marginTop: 6, opacity: seg(t, T.cent - 0.9, T.cent - 0.7), transform: `scale(${1 + 0.08 * pulse(t, T.cent + 0.05, 0.1)})` }}>{n.toLocaleString("fr-FR")} €</div>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 56, color: PINK_L, marginTop: 8, opacity: seg(t, T.cent + 0.2, T.cent + 0.45) }}>par an</div>
        </div>
      )}
    </div>
  );
};
const CvCard: React.FC<{ glow: number; dim: number }> = ({ glow, dim }) => (
  <div style={{ width: 300, height: 380, borderRadius: 24, background: "#FBFAF8", padding: 28, boxSizing: "border-box", boxShadow: `0 30px 70px rgba(0,0,0,0.55), 0 0 ${70 * glow}px rgba(217,130,139,${0.8 * glow})`, filter: `brightness(${1 - dim * 0.55}) saturate(${1 - dim})` }}>
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}><FileUser size={44} color={PINK} /><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 30, color: "#2A2A2E" }}>CV</span></div>
    {[230, 200, 240, 170, 220, 190].map((w, i) => <div key={i} style={{ width: w, height: 13, borderRadius: 7, background: "#E2DFDC", marginBottom: 15 }} />)}
  </div>
);
const Difference: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, PH[4][0] - 0.05, PH[5][0] + 0.1)) return null;
  const out = seg(t, PH[5][0] - 0.15, PH[5][0] + 0.1), cvs = ease(t, T.deuxCv - 0.3, T.deuxCv + 0.2), letter = ease(t, T.lettre - 0.2, T.lettre + 0.25), win = ease(t, T.diff - 0.2, T.diff + 0.2);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      <Title t={t} a={PH[4][0]} b={T.deuxCv - 0.3} top={300} size={64}>De l'autre côté du bureau…</Title>
      {cvs > 0 && (
        <>
          <Title t={t} a={T.deuxCv - 0.3} b={T.lettre - 0.15} top={210} size={60}>2 CV qui se ressemblent ?</Title>
          <Title t={t} a={T.lettre - 0.15} b={PH[5][0]} top={210} size={60}><span style={{ color: PINK_L }}>La lettre</span> fait la différence.</Title>
          {[0, 1].map((i) => (
            <div key={i} style={{ position: "absolute", left: i ? 590 : 190, top: 340, transform: `translateY(${(1 - cvs) * 80}px) rotate(${(i ? 4 : -4) * cvs}deg) scale(${i ? 1 + 0.06 * win : 1 - 0.06 * win})`, opacity: cvs }}>
              <CvCard glow={i ? win : 0} dim={i ? 0 : win} />
              {i === 1 && letter > 0 && (
                <div style={{ position: "absolute", left: 150, top: 180, width: 200, height: 250, borderRadius: 18, background: `linear-gradient(165deg, ${PINK_L}, ${PINK})`, transform: `translate(${(1 - letter) * 400}px, ${(1 - letter) * -300}px) rotate(${lerp(30, 8, letter)}deg)`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)", padding: 20, boxSizing: "border-box" }}>
                  <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 26, color: "#fff", marginBottom: 12 }}>Lettre</div>
                  {[150, 130, 160, 110].map((w, k) => <div key={k} style={{ width: w, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.6)", marginBottom: 12 }} />)}
                </div>
              )}
              {i === 1 && win > 0 && <div style={{ position: "absolute", left: 30, top: 420, transform: `scale(${go(t, T.diff - 0.2, T.diff + 0.1, 0.3, 0.8)})`, transformOrigin: "0 50%" }}><Pill icon={Check} label="Retenu" pink /></div>}
            </div>
          ))}
        </>
      )}
    </div>
  );
};
const GEN = ["044", "046", "048", "050", "052", "053"];
const Product: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, PH[5][0] - 0.05, PH[6][0] + 0.1)) return null;
  const out = seg(t, PH[6][0] - 0.15, PH[6][0] + 0.1), ph = ease(t, T.cree - 0.2, T.cree + 0.3);
  const shot = t < T.cv - 0.15 ? "parcours/010-offre-lien.png" : t < T.s30 - 0.1 ? "parcours/008-cv-ajoute.png" : t < T.cette - 0.3 ? `shots/${GEN[Math.min(5, Math.floor(seg(t, T.s30 - 0.1, T.cette - 0.3) * 6))]}-generation.png` : "shots/054-lettre.png";
  const PW = 1080 * 0.27, PHh = 1920 * 0.27;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      <Title t={t} a={PH[5][0]} b={T.lien - 0.3} top={200} size={64}>Alors j'ai créé <span style={{ color: PINK_L }}>MyMotiv</span>.</Title>
      <div style={{ position: "absolute", inset: 0, perspective: 1600 }}>
        <div style={{ position: "absolute", left: 540 - PW / 2, top: 330, width: PW, height: PHh, transform: `rotateY(${lerp(26, -5, ph) + Math.sin(t * 1.2) * 3}deg) scale(${lerp(0.75, 1, ph)})`, opacity: ph }}>
          <div style={{ position: "absolute", inset: -11, borderRadius: 56, background: "linear-gradient(135deg, #3A3A3C, #0B0A0B)", boxShadow: "0 50px 120px rgba(0,0,0,0.7), 0 0 60px rgba(217,130,139,0.25), inset 0 0 0 2px #4A4A4E" }} />
          <div style={{ position: "absolute", inset: 0, borderRadius: 46, overflow: "hidden" }}><Img src={staticFile(shot)} style={{ width: PW, height: PHh }} /></div>
        </div>
      </div>
      {([[Link2, "Le lien de l'offre", T.lien, 20, 360], [FileUser, "Ton CV", T.cv, 720, 520], [Timer, "30 s*", T.s30, 40, 680]] as const).map(([I, label, at, x, y], i) => t >= at - 0.2 && (
        <div key={i} style={{ position: "absolute", left: x, top: y, transformOrigin: x < 540 ? "0 50%" : "100% 50%", transform: `scale(${go(t, at - 0.2, at + 0.1, 0.3, 0.72)})` }}><Pill icon={I} label={label} pink={i === 2} /></div>
      ))}
      <Note t={t} a={T.s30} b={PH[6][0]} top={890}>* temps mesuré : 27 à 35 s par lettre</Note>
    </div>
  );
};
const FEATURES = ["Lettres illimitées*", "Ajustements illimités", "CV adapté à l'offre", "Sans engagement"];
const Offer: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, PH[6][0] - 0.05, PH[8][0] + 0.1)) return null;
  const out = seg(t, PH[8][0] - 0.15, PH[8][0] + 0.1), card = ease(t, T.semaine - 0.3, T.semaine + 0.25), p7 = ease(t, PH[7][0] - 0.1, PH[7][0] + 0.35);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      <Title t={t} a={PH[6][0]} b={T.semaine - 0.3} top={300} size={66}>Tu cherches du travail ?</Title>
      {card > 0 && (
        <div style={{ position: "absolute", left: 140, right: 140, top: 200, padding: "34px 40px", borderRadius: 44, background: GLASS, border: `2px solid ${PINK}`, boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 70px rgba(217,130,139,0.25)",
          transform: `translateY(${(1 - card) * 80}px) scale(${lerp(0.85, 1, card) * lerp(1, 0.86, p7)})`, transformOrigin: "50% 0", opacity: card }}>
          <div style={{ position: "absolute", right: 30, top: -24, padding: "8px 20px", borderRadius: 20, background: PINK, fontFamily: "Poppins", fontWeight: 700, fontSize: 26, color: "#fff" }}>Recommandé</div>
          <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 48, color: "#fff" }}>La Semaine</div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: 6 }}>
            <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 130, letterSpacing: -5, color: PINK_L, lineHeight: 1, transform: `scale(${1 + 0.08 * pulse(t, T.prix + 0.05, 0.1)})`, display: "inline-block", opacity: seg(t, T.prix - 0.3, T.prix - 0.1) }}>3,99 €</span>
            <span style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 34, color: SOFT, opacity: seg(t, T.prix - 0.1, T.prix + 0.2) }}>par semaine</span>
          </div>
          <div style={{ marginTop: 14 }}>
            {FEATURES.map((f, i) => { const at = T.prix + 0.25 + i * 0.12; return (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10, opacity: seg(t, at, at + 0.2), transform: `translateX(${(1 - ease(t, at, at + 0.25)) * 30}px)` }}>
                <Check size={30} color={PINK_L} strokeWidth={3} /><span style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 32, color: INK }}>{f}</span>
              </div>
            ); })}
          </div>
        </div>
      )}
      {p7 > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 700, display: "flex", justifyContent: "center", gap: 14, opacity: p7 * (1 - seg(t, PH[8][0] - 0.2, PH[8][0])) }}>
          {["Maison Lumen", "Atelier Nova", "Boréal Logistique"].map((c, i) => { const at = T.mesure - 0.2 + i * 0.18, k = ease(t, at, at + 0.25); return (
            <div key={c} style={{ padding: "12px 18px", borderRadius: 18, background: "rgba(217,130,139,0.16)", border: `1px solid ${PINK}`, fontFamily: "Poppins", fontWeight: 600, fontSize: 24, color: INK, transform: `scale(${lerp(0.5, 1, easeOutBack(k))})`, opacity: k }}>✉ {c}</div>
          ); })}
        </div>
      )}
      {t >= T.entretiens - 0.35 && <div style={{ position: "absolute", left: 540, top: 780, transform: `translate(-50%, 0) scale(${go(t, T.entretiens - 0.35, T.entretiens, 0.3, 0.85)})` }}><Pill icon={CalendarCheck} label="Tes entretiens" pink /></div>}
      <Note t={t} a={T.prix + 0.3} b={PH[8][0]} top={890}>* 30 lettres par semaine au maximum · exemples d'entreprises fictifs</Note>
    </div>
  );
};
const Leni: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, PH[8][0] - 0.05, PH[9][0] + 0.1)) return null;
  const k = ease(t, PH[8][0], PH[8][0] + 0.35), out = seg(t, PH[9][0] - 0.15, PH[9][0] + 0.1);
  const c1 = Math.round(11 * ease(t, T.onze - 0.5, T.onze + 0.05)), c2 = Math.round(7 * ease(t, T.sept - 0.4, T.sept + 0.05));
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: 260, padding: "36px 40px", borderRadius: 44, background: GLASS, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 40px 100px rgba(0,0,0,0.6)", opacity: k * (1 - out), transform: `translateY(${(1 - k) * 60}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 80, height: 80, borderRadius: 40, background: `linear-gradient(160deg, ${PINK_L}, ${PINK})`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#fff" }}>L</div>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 44, color: "#fff" }}>Léni S.</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-around", marginTop: 26 }}>
        {[[c1, "candidatures"], [c2, "entretiens"]].map(([n, l], i) => (
          <div key={i} style={{ textAlign: "center" }}>
            <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 140, lineHeight: 1, letterSpacing: -4, color: i ? PINK_L : "#fff", transform: `scale(${1 + 0.1 * pulse(t, (i ? T.sept : T.onze) + 0.05, 0.08)})` }}>{n}</div>
            <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 32, color: SOFT }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 22, textAlign: "center", fontFamily: "Open Sans", fontSize: 23, color: "rgba(245,245,247,0.7)" }}>Témoignage réel · résultats individuels non garantis</div>
    </div>
  );
};
const Cta: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, PH[9][0] - 0.05, T.end + 0.4)) return null;
  const out = seg(t, T.end + 0.05, T.end + 0.35);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
      {t >= T.offerte - 0.4 && <div style={{ position: "absolute", left: 540, top: 260, transform: `translate(-50%, 0) scale(${go(t, T.offerte - 0.4, T.offerte, 0.3, 1)})` }}><Pill icon={Gift} label="Ta 1re lettre est offerte" pink /></div>}
      {t >= T.bio - 0.3 && <div style={{ position: "absolute", left: 540 - 260, top: 420, transform: `scale(${go(t, T.bio - 0.3, T.bio + 0.05, 0, 1)})` }}><GlossPill w={520} h={110}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff" }}>Lien en bio <span style={{ color: PINK_L }}>↑</span></span></GlossPill></div>}
      {t >= T.jouer - 0.35 && <div style={{ position: "absolute", left: 0, right: 0, top: 600, display: "flex", justifyContent: "center", transform: `scale(${go(t, T.jouer - 0.35, T.jouer + 0.1, 1.5, 1)})`, opacity: seg(t, T.jouer - 0.35, T.jouer - 0.2) }}><Extruded text="À TOI DE JOUER" size={96} /></div>}
    </div>
  );
};
const Outro: React.FC<{ t: number }> = ({ t }) => {
  if (t < T.end) return null;
  const k = ease(t, T.end + 0.05, T.end + 0.6);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Mosaic t={t} t0={T.end} dim={0.62} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 700, padding: "40px 30px", borderRadius: 44, background: "rgba(11,10,11,0.88)", border: `2px solid ${PINK}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 18, opacity: k, transform: `scale(${lerp(0.85, 1, k)})` }}>
        <Img src={staticFile("logo-mymotiv.png")} style={{ width: 460, filter: `drop-shadow(0 0 18px ${PINK})` }} />
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#fff" }}>Yann · derrière MyMotiv</div>
        <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 28, color: PINK_L, textAlign: "center" }}>Avec MyMotiv, postulez. Et faites-vous recruter.</div>
      </div>
    </div>
  );
};

export const PresentationYann: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const r = rng(frame + 17);
  const hits = [T.yann, T.mm, T.cent, T.diff, T.s30, T.prix, T.sept, T.jouer];
  const shake = hits.reduce((s, h) => s + pulse(t, h + 0.04, 0.06), 0) * 8;
  const flash = pulse(t, T.yann, 0.07) * 0.6 + pulse(t, T.mm, 0.06) * 0.3 + pulse(t, T.jouer, 0.07) * 0.4;
  return (
    <AbsoluteFill style={{ backgroundColor: BG, overflow: "hidden" }}>
      <Audio src={staticFile("audio/yann.wav")} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 70%, rgba(217,130,139,0.18) 0%, rgba(11,10,11,0) 55%)" }} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)` }}>
        <Presenter t={t} />
        <Hook t={t} />
        <Behind t={t} />
        <Career t={t} />
        <Difference t={t} />
        <Product t={t} />
        <Offer t={t} />
        <Leni t={t} />
        <Cta t={t} />
        <Outro t={t} />
      </div>
      <Flash k={flash} />
    </AbsoluteFill>
  );
};
