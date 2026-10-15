// « Ton matcha est mieux préparé que ta lettre de motivation » (≈42 s, 30 i/s, 9:16) : tout le champ lexical du café
// (matcha fouetté, lait d'avoine, mousse, café filtre, barista, prénom écrit de travers sur le gobelet, menu à la craie,
// ticket de commande, « une lettre sur mesure pour… Camille ! ») relié à MyMotiv. Ambiance coffee shop : fond crème,
// vert matcha, brun café, et le rose MyMotiv pour la marque. Tout est dessiné ici (aucune image de stock, aucune marque
// de café) ; la seule capture est la vraie lettre du site (public/tuto-tel/040-lettre.jpg).
// 1. Accroche dès l'image 0 → 2. le matcha (fouetté, lait d'avoine, mousse) → 3. ta lettre = un café filtre, la même pour
// tout le monde, tiède → 4. le prénom écrit de travers (« Kamil ») → 5. la lettre qui parle d'une autre entreprise →
// 6. MyMotiv « préparé minute » (menu à la craie : ton CV, l'offre, 30 s*) + la vraie lettre (bon nom, bon logo, vraies
// preuves) → 7. le barista : « Une lettre sur mesure pour… Camille ! » (ticket) → 8. 1re lettre offerte, la suivante
// (prix de lettre-ia/lib/pricing.ts) moins chère que ton matcha → 9. lien en bio + « team matcha ou team café ? ».
// Voix : voix-matcha.json (Yann --voix yann ; le barista = voix pub Paul K). Son : synth_matcha.py.
import React from "react";
import { AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PLANS } from "../../lettre-ia/lib/pricing";
import { bounce } from "./apple";
import { PINK, PINK_L, clamp, easeInOut, lerp, seg } from "./common";
import voix from "./data/matcha-voix.json";
import { makeCaption } from "./FauxDM";
import { Chrome, K, Mot, fit } from "./kinetic";
import { CAP_BOX } from "./pixelTT";
import { Coche, FinOfferte, Mention, X, horloge } from "./pubMotion";
import "./fonts";

if (typeof document !== "undefined") {
  const handle = delayRender("Caveat (écriture à la main)");
  const face = new FontFace("Caveat", `url(${staticFile("fonts/caveat-latin-700-normal.woff2")})`, { weight: "700" });
  document.fonts.add(face);
  face.load().then(() => continueRender(handle));
}

export const MATCHA_DUR = voix.duration;
const { PH, at, sc } = horloge(voix);
const HOT = new Set(["matcha", "lettre", "motivation", "fouette", "avoine", "mousse", "filtre", "tiede", "prenom", "travers", "recruteur", "entreprise",
  "mymotiv", "minute", "cv", "offre", "trente", "secondes", "servie", "nom", "logo", "preuves", "camille", "offerte", "bio", "cafe", "commentaire"]);
// sous-titres sur un bandeau café (le fond crème rendrait le texte blanc difficile à lire)
const Caption = makeCaption(voix, HOT, { ...CAP_BOX, top: 1205, padding: "10px 18px", borderRadius: 26, background: "rgba(43,30,23,0.86)", textShadow: "none" }, PINK_L);
const EMOJI = "'Noto Color Emoji'";
const MAIN = "Caveat";

// ─── couleurs du coffee shop ───
const CREME = "#F3EBDF", LATTE = "#E4D3BD", CAFE = "#2B1E17", CAFE_M = "#6B4A35", MATCHA = "#7FA650", MATCHA_D = "#56782F", MATCHA_L = "#CFE0A8", LAIT = "#FBF7EF";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const pop = (t: number, a: number) => bounce(t, [[a, 0.5], [a + 0.22, 1]], 0.09, 3, 7);

// ─── les temps clés ───
const S1 = sc(1), S2 = sc(2), S3 = sc(3), S4 = sc(4), S5 = sc(5), S6 = sc(6), S7 = sc(7), S8 = sc(8);
const T_LAIT = at(19) - 0.1, T_MOUSSE = at(24) - 0.1, T_ECRIT = at(45) - 0.05, T_SERVIE = at(83) - 0.15, T_TEAM = at(117) - 0.1;

// ─── le verre de matcha latte (lait qui monte, mousse) et le fouet en bambou ───
const Verre: React.FC<{ t: number; cx: number; cy: number; s?: number; lait: number; mousse: number }> = ({ t, cx, cy, s = 1, lait, mousse }) => {
  const w = 300, h = 420;
  const niveauMatcha = 0.42, niveauLait = niveauMatcha + 0.38 * lait;
  const yM = h * (1 - niveauMatcha), yL = h * (1 - niveauLait);
  const vague = (y: number, a: number) => `M0 ${y} Q ${w * 0.25} ${y - a} ${w * 0.5} ${y} T ${w} ${y} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg width={w * s} height={(h + 40) * s} viewBox={`-10 -30 ${w + 20} ${h + 40}`} style={{ position: "absolute", left: cx - (w * s) / 2, top: cy - (h * s) / 2, overflow: "visible" }}>
      <defs>
        <clipPath id="verreClip"><path d={`M8 0 L${w - 8} 0 L${w - 26} ${h - 6} Q${w - 28} ${h} ${w - 40} ${h} L40 ${h} Q28 ${h} 26 ${h - 6} Z`} /></clipPath>
        <linearGradient id="verreReflet" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.55" /><stop offset="0.18" stopColor="#fff" stopOpacity="0" /><stop offset="0.85" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#fff" stopOpacity="0.35" /></linearGradient>
      </defs>
      <ellipse cx={w / 2} cy={h + 8} rx={w * 0.45} ry={14} fill="rgba(43,30,23,0.18)" />
      <g clipPath="url(#verreClip)">
        <rect x="0" y="0" width={w} height={h} fill="rgba(255,255,255,0.35)" />
        <path d={vague(yM, 10 * Math.sin(t * 3))} fill={MATCHA} />
        {lait > 0 && <path d={vague(yL, 12 * Math.sin(t * 2.4 + 1))} fill={LAIT} opacity={0.96} />}
        {lait > 0 && <path d={vague(yM - 6, 8)} fill={MATCHA_L} opacity={0.7} />}
        {mousse > 0 && <rect x="0" y={yL - 34 * mousse} width={w} height={36 * mousse + 6} rx="14" fill="#EFE8D6" />}
        {mousse > 0 && Array.from({ length: 14 }, (_, i) => <circle key={i} cx={20 + ((i * 53) % (w - 40))} cy={yL - 22 * mousse + ((i * 17) % 18)} r={3 + (i % 3)} fill="#fff" opacity={0.75 * mousse} />)}
        <rect x="0" y="0" width={w} height={h} fill="url(#verreReflet)" />
      </g>
      <path d={`M8 0 L${w - 8} 0 L${w - 26} ${h - 6} Q${w - 28} ${h} ${w - 40} ${h} L40 ${h} Q28 ${h} 26 ${h - 6} Z`} fill="none" stroke="rgba(43,30,23,0.25)" strokeWidth="5" />
    </svg>
  );
};
const Fouet: React.FC<{ t: number; x: number; y: number; on: number; s?: number }> = ({ t, x, y, on, s = 0.75 }) => {
  if (on <= 0) return null;
  const dx = Math.sin(t * 22) * 46 * on, rot = Math.sin(t * 22) * 10 * on;
  return (
    <svg width={160 * s} height={330 * s} viewBox="-80 0 160 330" style={{ position: "absolute", left: x - 80 * s + dx, top: y - 330 * s, transform: `rotate(${rot}deg)`, transformOrigin: "50% 100%", opacity: clamp(on * 3) }}>
      <rect x="-16" y="0" width="32" height="160" rx="14" fill="#D7B47A" stroke="#A9864C" strokeWidth="3" />
      {Array.from({ length: 15 }, (_, i) => { const a = (i / 14 - 0.5) * 1.3; return <path key={i} d={`M0 150 Q ${Math.sin(a) * 90} 250 ${Math.sin(a) * 62} 325`} fill="none" stroke="#E2C48D" strokeWidth="5" strokeLinecap="round" />; })}
    </svg>
  );
};

// ─── un gobelet en carton (couvercle, manchon), avec ou sans prénom écrit au marqueur ───
const Gobelet: React.FC<{ x: number; y: number; s?: number; nom?: string; ecrit?: number; couleur?: string; label?: string; rot?: number }> = ({ x, y, s = 1, nom, ecrit = 1, couleur = CAFE, label, rot = 0 }) => (
  <div style={{ position: "absolute", left: x - 130 * s, top: y - 190 * s, width: 260 * s, height: 380 * s, transform: `rotate(${rot}deg)` }}>
    <svg width={260 * s} height={380 * s} viewBox="0 0 260 380" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
      <ellipse cx="130" cy="376" rx="105" ry="10" fill="rgba(43,30,23,0.18)" />
      <path d="M30 60 L230 60 L208 372 L52 372 Z" fill="#FFFDF8" stroke="#E2D6C4" strokeWidth="3" />
      <path d="M41 160 L219 160 L212 262 L48 262 Z" fill="#B88A5E" />
      <rect x="18" y="34" width="224" height="32" rx="10" fill="#F5EFE5" stroke="#E2D6C4" strokeWidth="3" />
      <path d="M40 34 Q130 0 220 34 Z" fill="#EFE7DA" stroke="#E2D6C4" strokeWidth="3" />
    </svg>
    {label && <div style={{ position: "absolute", left: 0, right: 0, top: 182 * s, textAlign: "center", fontFamily: "Poppins", fontWeight: 800, fontSize: 30 * s, color: "#fff", letterSpacing: 2 }}>{label}</div>}
    {nom && (
      <div style={{ position: "absolute", left: 0, right: 0, top: 84 * s, textAlign: "center", fontFamily: MAIN, fontWeight: 700, fontSize: 76 * s, color: couleur, transform: "rotate(-6deg)", clipPath: `inset(0 ${100 - ecrit * 100}% 0 0)` }}>{nom}</div>
    )}
  </div>
);

// ─── 2. le matcha ───
const ScMatcha: React.FC<{ t: number }> = ({ t }) => {
  const lait = ease(t, T_LAIT, T_LAIT + 1.0), mousse = ease(t, T_MOUSSE, T_MOUSSE + 0.5);
  const fouet = t < S1 ? 0 : 1 - seg(t, T_LAIT - 0.3, T_LAIT);
  const versement = t >= T_LAIT - 0.1 && t < T_LAIT + 1.1;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 70%, #FFF8EC 0%, ${CREME} 55%, ${LATTE} 100%)` }}>
      {/* comptoir */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, bottom: 0, background: "linear-gradient(180deg, #C9A57E, #A57F58)" }} />
      <Verre t={t} cx={X} cy={940} s={t < S1 ? 0.95 : 1.05} lait={lait} mousse={mousse} />
      <Fouet t={t} x={X} y={860} on={fouet} />
      {/* brique de lait d'avoine (sans marque) qui verse */}
      {versement && (
        <div style={{ position: "absolute", left: X + 110, top: 600, transform: `rotate(${lerp(10, -48, ease(t, T_LAIT - 0.1, T_LAIT + 0.2))}deg)`, transformOrigin: "20% 80%", opacity: 1 - seg(t, T_LAIT + 0.9, T_LAIT + 1.1) }}>
          <div style={{ width: 150, height: 230, borderRadius: 12, background: "linear-gradient(90deg, #EFE6D6, #FFFDF8)", border: "3px solid #E0D3BF", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
            fontFamily: MAIN, fontWeight: 700, fontSize: 40, color: CAFE_M, lineHeight: 1 }}>lait<br />d'avoine</div>
        </div>
      )}
      {versement && t > T_LAIT + 0.15 && <div style={{ position: "absolute", left: X + 60, top: 700, width: 14, height: 160, borderRadius: 7, background: LAIT, opacity: 1 - seg(t, T_LAIT + 0.8, T_LAIT + 1.0) }} />}
      {/* mousse : petites étoiles */}
      {mousse > 0 && [[-170, 760, 30], [170, 720, 26], [140, 820, 20], [-140, 840, 22]].map(([dx, y, sz], i) => {
        const k = Math.max(0, Math.sin((t - T_MOUSSE) * 6 + i * 1.7));
        return <svg key={i} width={sz} height={sz} viewBox="-10 -10 20 20" style={{ position: "absolute", left: X + dx, top: y, transform: `scale(${0.4 + 0.8 * k})` }}><path d="M0 -10 L2 -2 L10 0 L2 2 L0 10 L-2 2 L-10 0 L-2 -2 Z" fill="#fff" /></svg>;
      })}
      {t >= S1 && <Coche t={t} a={at(13) - 0.1} text="Fouetté à la main" y={400} size={40} />}
      {t >= S1 && <Coche t={t} a={T_LAIT} text="Lait d'avoine" y={480} size={40} />}
      {t >= S1 && <Coche t={t} a={T_MOUSSE} text="Mousse parfaite" y={560} size={40} />}
    </AbsoluteFill>
  );
};

// ─── 3. ta lettre = un café filtre, la même pour tout le monde, tiède ───
const ScFiltre: React.FC<{ t: number }> = ({ t }) => {
  const defile = (t - S2) * 160, tiede = ease(t, at(40) - 0.2, at(40) + 0.3);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${CREME}, ${LATTE})` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1028, height: 40, background: "#3A3330" }} />
      <Mot t={t} a={S2 + 0.05} b={at(33) - 0.1} text="CAFÉ FILTRE" y={430} size={fit("CAFÉ FILTRE", 110)} color={CAFE} />
      <Mot t={t} a={at(33) - 0.1} b={at(40) - 0.2} text={"LA MÊME POUR\nTOUT LE MONDE"} y={450} size={fit("LA MÊME POUR\nTOUT LE MONDE", 90)} color={CAFE} lh={0.95} />
      <Mot t={t} a={at(40) - 0.2} text="ET TIÈDE." y={440} size={fit("ET TIÈDE.", 120)} color={CAFE_M} slam rot={-3} />
      {/* la carafe qui verse au-dessus du tapis */}
      <div style={{ position: "absolute", left: X - 230, top: 560, transform: `rotate(${-20 + Math.sin(t * 2) * 3}deg)` }}>
        <svg width="200" height="230" viewBox="0 0 200 230">
          <path d="M40 40 L160 40 L180 200 Q180 220 160 220 L40 220 Q20 220 20 200 Z" fill="rgba(255,255,255,0.5)" stroke="#9C8B7A" strokeWidth="5" />
          <path d="M28 120 L172 120 L180 200 Q180 220 160 220 L40 220 Q20 220 20 200 Z" fill="#5A3A26" opacity={0.9} />
          <rect x="30" y="20" width="140" height="26" rx="8" fill="#3A3330" />
        </svg>
      </div>
      {/* les gobelets identiques sur le tapis, tous « LETTRE » */}
      {Array.from({ length: 7 }, (_, i) => {
        const x = ((i * 250 + defile) % 1750) - 300;
        return <Gobelet key={i} x={x} y={890} s={0.72} label="LETTRE" />;
      })}
      {/* thermomètre : tiède */}
      {t >= at(40) - 0.25 && (
        <div style={{ position: "absolute", left: X + 230, top: 520, transform: `scale(${pop(t, at(40) - 0.25)})` }}>
          <div style={{ width: 54, height: 260, borderRadius: 27, background: "#fff", border: "5px solid #CBBBA8", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", left: 10, right: 10, bottom: 10, height: lerp(220, 70, tiede), borderRadius: 14, background: lerp(1, 0, tiede) > 0.5 ? "#E06A4B" : "#E8B36A" }} />
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

// ─── 4. le prénom écrit de travers ───
const ScPrenom: React.FC<{ t: number }> = ({ t }) => {
  const ecrit = ease(t, T_ECRIT, T_ECRIT + 0.7), enerve = t >= at(50) - 0.1;
  const tremble = enerve ? Math.sin(t * 60) * 6 * (1 - seg(t, at(50) + 0.3, at(50) + 0.9)) : 0;
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 60%, #FFF8EC 0%, ${CREME} 60%, ${LATTE} 100%)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, bottom: 0, background: "linear-gradient(180deg, #C9A57E, #A57F58)" }} />
      <Mot t={t} a={S3 + 0.05} text="TON PRÉNOM" y={420} size={fit("TON PRÉNOM", 100)} color={CAFE} />
      <Mot t={t} a={at(48) - 0.1} text="DE TRAVERS" y={540} size={fit("DE TRAVERS", 100)} color={PINK} slam rot={-4} />
      <div style={{ transform: `translateX(${tremble}px)` }}><Gobelet x={X} y={900} s={1.25} nom="Kamil" ecrit={ecrit} couleur="#1F1F1F" /></div>
      {/* le marqueur */}
      {t >= T_ECRIT - 0.2 && t < T_ECRIT + 1.0 && (
        <div style={{ position: "absolute", left: X - 120 + ecrit * 230, top: 690 - Math.sin(ecrit * 18) * 10, transform: "rotate(35deg)", opacity: 1 - seg(t, T_ECRIT + 0.8, T_ECRIT + 1.0) }}>
          <div style={{ width: 30, height: 190, borderRadius: 10, background: "linear-gradient(90deg, #222, #444, #222)" }} />
          <div style={{ width: 16, height: 24, margin: "0 auto", background: "#111", borderRadius: "0 0 8px 8px" }} />
        </div>
      )}
      {/* « c'est Camille ! » */}
      {t >= at(46) - 0.1 && (
        <div style={{ position: "absolute", left: X + 110, top: 650, transform: `scale(${pop(t, at(46) - 0.1)}) rotate(6deg)`, padding: "10px 22px", borderRadius: 18, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
          fontFamily: MAIN, fontWeight: 700, fontSize: 56, color: MATCHA_D }}>Camille ?!</div>
      )}
      {enerve && <div style={{ position: "absolute", left: X - 330, top: 640, fontFamily: EMOJI, fontSize: 110, transform: `scale(${pop(t, at(50) - 0.1)}) rotate(-10deg)` }}>😤</div>}
    </AbsoluteFill>
  );
};

// ─── 5. la lettre qui parle d'une autre entreprise ───
const ScAutre: React.FC<{ t: number }> = ({ t }) => {
  const cercle = ease(t, at(63) - 0.15, at(63) + 0.25);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${CREME}, ${LATTE})` }}>
      <Mot t={t} a={S4 + 0.05} text={"PAREIL POUR\nLE RECRUTEUR"} y={450} size={fit("PAREIL POUR\nLE RECRUTEUR", 96)} color={CAFE} lh={0.95} />
      {/* l'offre */}
      <div style={{ position: "absolute", left: X - 300, top: 600, transform: `scale(${pop(t, S4 + 0.15)})`, display: "flex", alignItems: "center", gap: 16, padding: "14px 26px", borderRadius: 20, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.12)" }}>
        <Img src={staticFile("company.png")} style={{ width: 56, height: 56, borderRadius: 12 }} />
        <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 36, color: CAFE }}>Offre : <b>Maison Lumen</b></span>
      </div>
      {/* la lettre */}
      <div style={{ position: "absolute", left: X - 320, top: 740, width: 640, borderRadius: 24, background: "#fff", padding: "34px 40px", boxSizing: "border-box", transform: `rotate(-2deg) scale(${pop(t, S4 + 0.3)})`,
        fontFamily: "Georgia, 'DejaVu Serif', serif", fontSize: 34, lineHeight: 1.45, color: "#1D1D1F", boxShadow: "0 30px 70px rgba(43,30,23,0.3)" }}>
        <div>Madame, Monsieur,</div>
        <div style={{ marginTop: 18 }}>C'est avec plaisir que je souhaite rejoindre</div>
        <div style={{ position: "relative", display: "inline-block", margin: "10px 0", fontWeight: 700, color: "#C21F24" }}>
          Atelier Nova
          <svg width="330" height="110" viewBox="0 0 330 110" style={{ position: "absolute", left: -48, top: -30, overflow: "visible" }}>
            <ellipse cx="165" cy="55" rx="155" ry="42" fill="none" stroke="#E8262B" strokeWidth="8" strokeDasharray="1100" strokeDashoffset={1100 * (1 - cercle)} strokeLinecap="round" transform="rotate(-4 165 55)" />
          </svg>
        </div>
        <div>et mettre mon énergie au service…</div>
      </div>
      {t >= at(64) - 0.1 && (
        <div style={{ position: "absolute", left: X, top: 1080, transform: `translate(-50%, -50%) rotate(-8deg) scale(${bounce(t, [[at(64) - 0.1, 2], [at(64) + 0.06, 1]], 0.1, 3, 7)})`, padding: "8px 26px", border: "7px solid #E8262B", borderRadius: 16,
          color: "#E8262B", fontFamily: K, fontWeight: 900, fontSize: 44, background: "rgba(255,255,255,0.85)", whiteSpace: "nowrap" }}>MAUVAISE ENTREPRISE</div>
      )}
    </AbsoluteFill>
  );
};

// ─── 6. MyMotiv, préparé minute : le menu à la craie, puis la vraie lettre ───
const Craie: React.FC<{ t: number; a: number; text: string; y: number; size?: number; color?: string; center?: boolean }> = ({ t, a, text, y, size = 66, color = "#F5F1E8", center }) =>
  t < a ? null : (
    <div style={{ position: "absolute", left: center ? 120 : 70, right: center ? 160 : 70, top: y, textAlign: center ? "center" : "left", fontFamily: MAIN, fontWeight: 700, fontSize: size, color, whiteSpace: "nowrap", clipPath: `inset(0 ${100 - ease(t, a, a + 0.45) * 100}% 0 0)`, textShadow: "0 0 2px rgba(255,255,255,0.4)" }}>{text}</div>
  );
const ScMenu: React.FC<{ t: number }> = ({ t }) => {
  if (t >= T_SERVIE) {
    // la vraie lettre du site, servie sur un plateau
    const k = ease(t, T_SERVIE, T_SERVIE + 0.45);
    return (
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, #FFF8EC 0%, ${CREME} 55%, ${LATTE} 100%)` }}>
        <div style={{ position: "absolute", left: X - 270, top: 650 + (1 - k) * 700, width: 540, height: 530, borderRadius: 30, overflow: "hidden", border: "10px solid #1D1D1F", boxShadow: "0 40px 90px rgba(43,30,23,0.35)", transform: `rotate(${lerp(6, -2, k)}deg)` }}>
          <Img src={staticFile("tuto-tel/040-lettre.jpg")} style={{ position: "absolute", left: -95 * 0.6, top: -345 * 0.6, width: 1080 * 0.6, height: 1920 * 0.6 }} />
        </div>
        <Coche t={t} a={at(85) - 0.1} text="Le bon nom" y={420} size={44} />
        <Coche t={t} a={at(88) - 0.1} text="Le bon logo" y={510} size={44} />
        <Coche t={t} a={at(92) - 0.15} text="Tes vraies preuves" y={600} size={44} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ background: "#2A211C" }}>
      {/* l'ardoise */}
      <div style={{ position: "absolute", left: 60, right: 60, top: 330, height: 860, borderRadius: 26, background: "radial-gradient(circle at 40% 30%, #2F3A33 0%, #1F2622 70%)", border: "18px solid #8A6440", boxShadow: "inset 0 0 60px rgba(0,0,0,0.6), 0 30px 80px rgba(0,0,0,0.5)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", transform: `scale(${pop(t, S5 + 0.05)})` }}>
        <Img src={staticFile("logo-mymotiv.png")} style={{ width: 360 }} />
      </div>
      <Craie t={t} a={at(68) - 0.1} text="— Préparé minute —" y={500} size={64} color={PINK_L} center />
      <div style={{ position: "absolute", left: 150, top: 0 }} />
      <div style={{ position: "absolute", left: 60, width: 960 }}>
        <div style={{ position: "relative", left: 80 }}>
          <Craie t={t} a={at(73) - 0.1} text="1. Ton CV ........... ✓" y={640} />
          <Craie t={t} a={at(75) - 0.1} text="2. L'offre ............ ✓" y={760} />
          <Craie t={t} a={at(79) - 0.1} text="3. Servie en 30 s*" y={880} color="#F2C46D" />
        </div>
      </div>
      {/* sablier / chrono */}
      {t >= at(79) - 0.1 && (
        <svg width="150" height="150" viewBox="-75 -75 150 150" style={{ position: "absolute", left: X + 190, top: 990, transform: `scale(${pop(t, at(79) - 0.1)})` }}>
          <circle r="60" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="12" />
          <circle r="60" fill="none" stroke={PINK} strokeWidth="12" strokeDasharray={377} strokeDashoffset={377 * (1 - ease(t, at(79), T_SERVIE))} transform="rotate(-90)" strokeLinecap="round" />
        </svg>
      )}
    </AbsoluteFill>
  );
};

// ─── 7. le barista appelle la commande ───
const LIGNES_TICKET = ["MYMOTIV · COMMANDE N° 027", "--------------------------", "1 × Lettre sur mesure", "Pour : Camille", "Entreprise : Maison Lumen", "Logo : ✓   Preuves : ✓", "Préparation : 30 s*", "--------------------------", "À emporter. Bonne chance !"];
const ScBarista: React.FC<{ t: number }> = ({ t }) => {
  const imp = ease(t, S6 + 0.05, S6 + 1.0), glisse = ease(t, at(99) - 0.4, at(99) + 0.05);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, #FFF8EC 0%, ${CREME} 60%, ${LATTE} 100%)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1150, bottom: 0, background: "linear-gradient(180deg, #C9A57E, #A57F58)" }} />
      {/* l'imprimante et le ticket */}
      <div style={{ position: "absolute", left: X - 320, top: 380, width: 440, height: 70, borderRadius: 18, background: "#3A3330" }} />
      <div style={{ position: "absolute", left: X - 300, top: 430, width: 400, height: 600 * imp, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, bottom: 0, width: 400, height: 600, background: "#FFFEFA", boxShadow: "0 10px 30px rgba(0,0,0,0.12)", padding: "24px 20px", boxSizing: "border-box",
          fontFamily: "'DejaVu Sans Mono', monospace", fontSize: 22, lineHeight: 1.75, color: "#2B2B2B", clipPath: "polygon(0 0, 100% 0, 100% 97%, 94% 100%, 88% 97%, 82% 100%, 76% 97%, 70% 100%, 64% 97%, 58% 100%, 52% 97%, 46% 100%, 40% 97%, 34% 100%, 28% 97%, 22% 100%, 16% 97%, 10% 100%, 4% 97%, 0 100%)" }}>
          {LIGNES_TICKET.map((l, i) => <div key={i} style={{ fontWeight: i === 0 || i === 2 ? 700 : 400, whiteSpace: "pre" }}>{l}</div>)}
        </div>
      </div>
      {/* la bulle du barista */}
      {t >= S6 + 0.1 && (
        <div style={{ position: "absolute", left: X - 340, top: 1010, width: 470, transform: `scale(${pop(t, S6 + 0.1)})`, transformOrigin: "10% 100%", padding: "20px 28px", borderRadius: "30px 30px 30px 6px", background: CAFE, color: "#fff",
          fontFamily: "Poppins", fontWeight: 700, fontSize: 40, lineHeight: 1.15, boxShadow: "0 16px 40px rgba(43,30,23,0.35)" }}>
          « Une lettre sur mesure pour… <span style={{ color: PINK_L }}>Camille</span> ! »
        </div>
      )}
      {/* le gobelet, bien écrit cette fois, qui glisse sur le comptoir */}
      {t >= at(99) - 0.4 && <Gobelet x={lerp(1250, X + 230, glisse)} y={930} s={0.95} nom="Camille" ecrit={1} couleur={PINK} rot={lerp(8, 0, glisse)} />}
      {t >= at(99) + 0.05 && <div style={{ position: "absolute", left: X + 300, top: 640, fontFamily: EMOJI, fontSize: 80, transform: `scale(${pop(t, at(99) + 0.05)})` }}>✨</div>}
    </AbsoluteFill>
  );
};

// ─── 8. l'offre, moins chère que ton matcha ───
const ScPrix: React.FC<{ t: number }> = ({ t }) => {
  const suite = t >= at(105) - 0.1;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${CREME}, ${LATTE})` }}>
      {!suite ? (
        <>
          <Mot t={t} a={S7 + 0.05} text="TA 1RE LETTRE" y={560} size={fit("TA 1RE LETTRE", 100)} color={CAFE} />
          <Chrome t={t} a={at(104) - 0.15} text="OFFERTE" y={750} size={fit("OFFERTE", 170)} />
        </>
      ) : (
        <>
          <Mot t={t} a={at(105) - 0.1} text="LA SUIVANTE" y={430} size={fit("LA SUIVANTE", 80)} color={CAFE} />
          <Chrome t={t} a={at(107)} text={PLANS.letter.price} y={600} size={fit(PLANS.letter.price, 180)} />
          {t >= at(109) - 0.15 && (
            <div style={{ position: "absolute", left: X, top: 800, transform: `translate(-50%, -50%) scale(${pop(t, at(109) - 0.15)})`, display: "flex", alignItems: "center", gap: 18, padding: "14px 34px", borderRadius: 30, background: MATCHA_D, color: "#fff",
              fontFamily: `${K}, Poppins, ${EMOJI}`, fontWeight: 800, fontSize: 56, whiteSpace: "nowrap" }}>moins cher que ton matcha 🍵</div>
          )}
          <Verre t={t} cx={X} cy={1060} s={0.42} lait={1} mousse={1} />
        </>
      )}
    </AbsoluteFill>
  );
};

// ─── 9. fin : lien en bio, puis « team matcha ou team café ? » ───
const ScFin: React.FC<{ t: number }> = ({ t }) => {
  if (t < T_TEAM) return <AbsoluteFill style={{ background: GLOW }} />;
  const carte = (a: number, x: number, emoji: string, titre: string, bg: string) => (
    <div style={{ position: "absolute", left: x - 190, top: 640, width: 380, height: 420, borderRadius: 40, background: bg, transform: `scale(${pop(t, a)}) rotate(${x < X ? -3 : 3}deg)`, boxShadow: "0 30px 70px rgba(43,30,23,0.3)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ fontFamily: EMOJI, fontSize: 150 }}>{emoji}</div>
      <div style={{ fontFamily: K, fontWeight: 900, fontSize: 52, color: "#fff", textAlign: "center", lineHeight: 1, whiteSpace: "pre" }}>{titre}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${CREME}, ${LATTE})` }}>
      <div style={{ position: "absolute", left: X, top: 450, transform: `translate(-50%, -50%) scale(${pop(t, T_TEAM)})`, padding: "12px 30px", borderRadius: 26, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 800, fontSize: 40, whiteSpace: "nowrap" }}>
        1re lettre offerte · lien en bio ↑
      </div>
      {carte(at(122) - 0.1, X - 200, "🍵", "TEAM\nMATCHA", MATCHA_D)}
      {carte(at(125) - 0.1, X + 200, "☕", "TEAM\nCAFÉ", CAFE_M)}
      {t >= at(126) - 0.1 && <div style={{ position: "absolute", left: X, top: 1130, transform: `translate(-50%, -50%) scale(${pop(t, at(126) - 0.1)})`, fontFamily: `${K}, Poppins, ${EMOJI}`, fontWeight: 900, fontSize: 52, color: CAFE, whiteSpace: "nowrap" }}>DIS-LE EN COMMENTAIRE 👇</div>}
    </AbsoluteFill>
  );
};
const GLOW = `radial-gradient(circle at 50% 46%, #FFF6EA 0%, ${CREME} 50%, ${LATTE} 100%)`;

export const Matcha: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  const debut = [0, S2, S3, S4, S5, T_SERVIE, S6, S7, S8, T_TEAM].reduce((p, a) => (t >= a ? a : p), 0);
  const punch = 1 + 0.05 * Math.exp(-(t - debut) * 9);
  return (
    <AbsoluteFill style={{ background: CREME, overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${punch})` }}>
        {t < S2 && <ScMatcha t={t} />}
        {t >= S2 && t < S3 && <ScFiltre t={t} />}
        {t >= S3 && t < S4 && <ScPrenom t={t} />}
        {t >= S4 && t < S5 && <ScAutre t={t} />}
        {t >= S5 && t < S6 && <ScMenu t={t} />}
        {t >= S6 && t < S7 && <ScBarista t={t} />}
        {t >= S7 && t < S8 && <ScPrix t={t} />}
        {t >= S8 && <ScFin t={t} />}
      </AbsoluteFill>
      {/* accroche : visible dès l'image 0 */}
      {t < S1 && (
        <>
          <Mot t={t} a={-0.5} text="TON MATCHA" y={400} size={fit("TON MATCHA", 120)} color={MATCHA_D} />
          <Mot t={t} a={-0.45} text={"EST MIEUX PRÉPARÉ\nQUE TA LETTRE"} y={570} size={fit("EST MIEUX PRÉPARÉ\nQUE TA LETTRE", 84)} color={CAFE} lh={1} />
          <Mot t={t} a={-0.4} text="DE MOTIV." y={720} size={fit("DE MOTIV.", 96)} color={PINK} slam rot={-3} />
        </>
      )}
      {t >= S8 && t < T_TEAM && <FinOfferte t={t} t0={S8} aBio={at(114) - 0.05} sous="Sans carte bancaire." />}
      <Mention t={t} a={at(79) - 0.1} b={S7} text="* temps mesuré : 27 à 35 s par lettre" y={1405} color={t >= T_SERVIE && t < S6 ? "#8C7B6B" : "#B8A99A"} />
      {/* pas de sous-titres pendant l'accroche ni pendant l'appel du barista : le texte est déjà à l'écran */}
      {t >= S1 && !(t >= S6 && t < S7) && <div style={{ position: "absolute", inset: 0, zIndex: 25 }}><Caption t={t} /></div>}
      <Audio src={staticFile("audio/matcha.wav")} />
    </AbsoluteFill>
  );
};
