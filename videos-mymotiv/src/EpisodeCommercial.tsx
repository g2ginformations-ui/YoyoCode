// « Les Super-recrues · Épisode 2 : Le SuperCommercial » (≈66 s, 60 i/s, 9:16) — direction artistique « Dark Deco »
// (cel animation 90s peinte sur fond noir), à partir des images du propriétaire : la case 1 (public/episode2/) et les
// expressions d'OroSerpente, le personnage en cagoule et casquette (public/oroserpente/). Le globe « Daily Planet » de la case 1 est gardé (décision du
// propriétaire) ; il reste hors champ dans les recadrages verticaux de cet épisode. OroSerpente postule chez Boréal Logistique (fictif) : « Commercial ? Je sauve des villes entières » → entretien (le recruteur
// est une ombre chinoise au premier plan) : prospection sur les toits à minuit, « Budget ? Décideur ? Besoin ? Délai ? »
// façon interrogatoire, la lettre « je ne dors jamais » (« commercial ou vigile de nuit ? ») → « On vous rappellera »
// → le VRAI site MyMotiv (capture du parcours avec l'offre Boréal Logistique) → « Vous commencez lundi » → « C'est un CDI,
// pas une patrouille » → « Et la cagoule, c'est autorisé ? » → CTA : signal « mm. » dans le ciel, « dis-moi en
// commentaire le poste que tu vises ». Mise en scène · parodie. Voix : voix-commercial.json. Son : synth_commercial.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { PINK, PINK_L, clamp, easeInOut, easeOutBack, lerp, rng, seg } from "./common";
import { Flash, ease, pulse } from "./motion";
import { Blinds, CREAM, DECO, Fan, GOLD, GOLD_L, GOLD_TXT, JOSEFIN, cut } from "./SuperRecrues";
import voix from "./data/commercial-voix.json";
import "./fonts";
import "./fontsDeco";

export const COMMERCIAL_DUR = voix.duration;
const INK = "#05040A", PAPER = "#FFF8EA";
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const show = (t: number, a: number, b: number) => t >= a && t < b;
const T = {
  b2b: Wt(5), commercial: Wt(8), villes: Wt(12), palettes: Wt(19), prospection: Wt(27), toit: Wt(34), minuit: Wt(39),
  budget: Wt(45), decideur: Wt(46), besoin: Wt(47), delai: Wt(48), interro: Wt(55), lettre: Wt(57), rapide: Wt(60), jamais: Wt(66),
  vous: Wt(67), vigile: Wt(73), deux: Wt(79), rappellera: Wt(92), lien: Wt(94), cv: Wt(99), s30: Wt(102), lettre2: Wt(105),
  clients: Wt(110), delais: Wt(113), metier: Wt(116), plaquette: Wt(126), lundi: Wt(129), soir: Wt(133), cdi: Wt(137),
  patrouille: Wt(140), cagoule: Wt(143), mission: Wt(152), colle: Wt(153), offerte: Wt(163), end: PH[15][1],
};
// découpage : chaque plan commence à un temps (coupes franches, comme une BD qu'on feuillette)
const S = {
  title: PH[1][1] + 0.12, interview: PH[2][0] - 0.12, joyeux: PH[3][0] - 0.12, ots2: PH[4][0] - 0.12, interro: PH[5][0] - 0.14,
  ots3: PH[6][0] - 0.12, letter: PH[7][0] - 0.12, surpris: T.vous - 0.12, pensif: PH[8][0] - 0.12, triste: PH[9][0] - 0.12,
  nuit: PH[9][1] + 0.35, site: PH[10][0] + 0.1, ots4: PH[11][0] - 0.25, joyeux2: PH[12][0] - 0.12, ots5: PH[13][0] - 0.12,
  inquiet: PH[14][0] - 0.15, cta: PH[15][0] - 0.3, endCard: PH[15][1] + 0.25,
};

// mots du TEXTE d'une réplique, recalés sur les mots transcrits (même méthode que l'épisode 1)
const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
function wordTimes(i: number) {
  const ph = voix.phrases[i], mots = voix.mots.filter((m) => m.phrase === i && norm(m.w).length), words = ph.text.split(" ");
  const tt = mots.map((m) => norm(m.w).length), tTot = Math.max(1, tt.reduce((a, b) => a + b, 0));
  const tf: number[] = []; let acc = 0; tt.forEach((n) => { tf.push(acc / tTot); acc += n; });
  const wl = words.map((w) => norm(w).length), wTot = Math.max(1, wl.reduce((a, b) => a + b, 0));
  let pos = 0;
  return words.map((w, j) => {
    const f = pos / wTot; pos += wl[j];
    let m = 0; tf.forEach((v, k) => { if (f >= v - 1e-6) m = k; });
    const f0 = tf[m], f1 = m + 1 < tf.length ? tf[m + 1] : 1, t0 = mots[m]?.t0 ?? ph.t0, t1 = m + 1 < mots.length ? mots[m + 1].t0 : ph.t1;
    return [w, mots.length ? lerp(t0, Math.min(t1, t0 + 0.6), (f - f0) / Math.max(1e-6, f1 - f0)) : ph.t0] as [string, number];
  });
}

// ─── images ───
const IMG = (n: string) => staticFile(`episode2/${n}`);
// une expression d'OroSerpente, plein cadre (peinte sur fond noir), lente poussée de caméra vers le visage
const Panel: React.FC<{ t: number; t0: number; name: string; push?: number; dim?: number; shake?: number }> = ({ t, t0, name, push = 0.06, dim = 0, shake = 0 }) => {
  const k = easeInOut(seg(t, t0, t0 + 4)), r = rng(Math.floor(t * 60) + 5);
  return (
    <div style={{ position: "absolute", left: -95, top: 180, width: 1270, height: 1558, transformOrigin: "635px 520px",
      transform: `scale(${1 + push * k}) translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)`, filter: dim ? `brightness(${1 - dim}) saturate(${1 - dim * 0.5})` : undefined }}>
      <Img src={staticFile(`oroserpente/${name}.jpg`)} style={{ width: 1270, height: 1558 }} />
    </div>
  );
};
// la case 1 (paysage 2576×1438) affichée sur toute la hauteur, la caméra glisse de x0 à x1 (pixels de l'image source)
const CaseOne: React.FC<{ t: number; a: number; b: number; x0: number; x1: number; z0?: number; z1?: number; fy?: number; dim?: number; cam?: [number, number] }> = ({ t, a, b, x0, x1, z0 = 1, z1 = 1.06, fy = 0.45, dim = 0, cam }) => {
  const s = 1920 / 1438, k = easeInOut(seg(t, a, b)), x = cam ? cam[0] : lerp(x0, x1, k), z = cam ? cam[1] : lerp(z0, z1, k);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", filter: dim ? `brightness(${1 - dim})` : undefined }}>
      <div style={{ position: "absolute", left: -x * s, top: 0, width: 2576 * s, height: 1920, transformOrigin: `${(x + 404) * s}px ${1920 * fy}px`, transform: `scale(${z})` }}>
        <Img src={IMG("case-1.jpg")} style={{ width: 2576 * s, height: 1920 }} />
      </div>
    </div>
  );
};
// faisceaux de projecteurs qui balaient le ciel (par-dessus l'image, en lumière additive)
const Beams: React.FC<{ t: number; o: number }> = ({ t, o }) => (
  <div style={{ position: "absolute", inset: 0, mixBlendMode: "screen", opacity: o }}>
    {[[260, -24, 0], [820, 22, 1.7]].map(([x, a, ph], i) => (
      <div key={i} style={{ position: "absolute", left: x - 90, top: -200, width: 180, height: 1400, transformOrigin: "50% 100%", transform: `rotate(${a + Math.sin(t * 0.6 + ph) * 7}deg)`,
        clipPath: "polygon(0 0, 100% 0, 54% 100%, 46% 100%)", background: "linear-gradient(to top, rgba(170,200,255,0.35), rgba(170,200,255,0.05))" }} />
    ))}
  </div>
);
const Rain: React.FC<{ t: number; o: number }> = ({ t, o }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
    {Array.from({ length: 90 }, (_, i) => {
      const r = rng(i * 7 + 3), x = r() * 1180 - 50, sp = 1500 + r() * 900, y = ((r() * 2200 + t * sp) % 2200) - 140, len = 50 + r() * 70;
      return <line key={i} x1={x} y1={y} x2={x - len * 0.18} y2={y + len} stroke="rgba(170,190,255,0.45)" strokeWidth={2} />;
    })}
  </svg>
);

// ─── le recruteur : ombre chinoise au premier plan (de trois-quarts dos), liseré bleu électrique ───
const Recruiter: React.FC<{ t: number; o?: number; letter?: number }> = ({ t, o = 1, letter = 0 }) => {
  const breathe = Math.sin(t * 1.6) * 3;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
      <g transform={`translate(0 ${breathe})`}>
        <path d="M-60 1920 L-40 1650 C-20 1590 60 1560 160 1548 L330 1548 C430 1560 520 1600 560 1680 L640 1920 Z" fill={INK} />
        <path d="M190 1560 L300 1560 L292 1470 L198 1470 Z" fill={INK} />
        <ellipse cx={245} cy={1360} rx={128} ry={150} fill={INK} />
        <path d="M118 1330 C120 1210 200 1185 260 1188 C330 1192 378 1240 372 1330 C340 1270 300 1252 250 1255 C190 1258 150 1280 118 1330 Z" fill="#0B0816" />
        <path d="M370 1290 C384 1350 380 1420 350 1470 M330 1548 C430 1560 520 1600 560 1680" fill="none" stroke="#7FB2FF" strokeWidth={5} strokeLinecap="round" opacity={0.95} />
        <path d="M262 1190 C330 1194 376 1238 372 1300" fill="none" stroke="#E7A04F" strokeWidth={4} strokeLinecap="round" opacity={0.85} />
        <path d="M372 1345 L420 1338" stroke="#E7A04F" strokeWidth={3} opacity={0.8} />
        {letter > 0 && (
          <g transform="translate(470 1530) rotate(-12)" opacity={letter}>
            <rect x={0} y={0} width={230} height={300} rx={6} fill={PAPER} />
            <rect x={0} y={0} width={230} height={300} rx={6} fill="none" stroke={PINK} strokeWidth={6} />
            {[40, 70, 100, 130, 160, 190].map((y, i) => <rect key={i} x={24} y={y} width={[170, 150, 182, 120, 160, 100][i]} height={9} rx={4} fill="#C9C1B4" />)}
          </g>
        )}
      </g>
    </svg>
  );
};

// ─── bulles de BD ───
const Bubble: React.FC<{ t: number; line: number; a?: number; b: number; x: number; y: number; w: number; tail: [number, number]; size?: number; from?: number }> = ({ t, line, a, b, x, y, w, tail, size = 48, from = 0 }) => {
  const start = a ?? PH[line][0] - 0.1;
  if (!show(t, start, b)) return null;
  const k = easeOutBack(seg(t, start, start + 0.22)), wt = wordTimes(line).slice(from);
  const cx = x + w / 2;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity: clamp(k * 2) * (1 - seg(t, b - 0.12, b)) }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M${cx - 34} ${y + 40} L${tail[0]} ${tail[1]} L${cx + 34} ${y + 40} Z`} fill={PAPER} stroke={INK} strokeWidth={6} strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", left: x, top: y - 30, width: w, padding: "28px 34px", boxSizing: "border-box", borderRadius: 56, background: PAPER, border: `6px solid ${INK}`,
        boxShadow: "0 18px 40px rgba(0,0,0,0.55)", transformOrigin: `${tail[0] - x}px ${tail[1] - y}px`, transform: `scale(${lerp(0.5, 1, k)})`, textAlign: "center" }}>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: size, lineHeight: 1.16, color: "#121014", letterSpacing: -0.4 }}>
          {wt.map(([word, at], i) => { const kk = seg(t, at - 0.06, at + 0.06); return <React.Fragment key={i}><span style={{ opacity: 0.12 + 0.88 * kk }}>{word}</span>{" "}</React.Fragment>; })}
        </div>
      </div>
    </div>
  );
};
// récitatif (voix off) : cartouche noir à filet doré, capitales espacées
const Recit: React.FC<{ t: number; line: number; a?: number; b: number; top?: number }> = ({ t, line, a, b, top = 130 }) => {
  const start = a ?? PH[line][0] - 0.15;
  if (!show(t, start, b)) return null;
  const k = ease(t, start, start + 0.3), wt = wordTimes(line);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top, display: "flex", justifyContent: "center", opacity: k * (1 - seg(t, b - 0.15, b)), transform: `translateY(${(1 - k) * -20}px)` }}>
      <div style={{ position: "relative", padding: "26px 40px", background: "rgba(8,5,10,0.92)", clipPath: cut(20), textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 7, border: `2px solid ${GOLD}`, clipPath: cut(15), opacity: 0.85 }} />
        <div style={{ fontFamily: JOSEFIN, fontWeight: 700, fontSize: 42, lineHeight: 1.25, letterSpacing: 3, textTransform: "uppercase", color: CREAM }}>
          {wt.map(([word, at], i) => <React.Fragment key={i}><span style={{ opacity: 0.15 + 0.85 * seg(t, at - 0.06, at + 0.08) }}>{word}</span>{" "}</React.Fragment>)}
        </div>
      </div>
    </div>
  );
};

// ─── scènes ───
const Annonce: React.FC<{ t: number }> = ({ t }) => {
  const a = 0.45, b = PH[0][1] + 0.3;
  if (!show(t, a, b)) return null;
  const k = ease(t, a, a + 0.5), o = seg(t, b - 0.3, b);
  return (
    <div style={{ position: "absolute", left: 120, right: 120, top: 1120, opacity: k * (1 - o), transform: `translateY(${(1 - k) * 40}px) rotate(-2deg)` }}>
      <div style={{ position: "relative", padding: "30px 30px 26px", background: "linear-gradient(180deg, #F6EBD3, #E6D5B3)", clipPath: cut(22), textAlign: "center", boxShadow: "0 30px 60px rgba(0,0,0,0.6)" }}>
        <div style={{ position: "absolute", inset: 8, border: "2px solid #2A1A12", clipPath: cut(17), opacity: 0.7 }} />
        <div style={{ fontFamily: JOSEFIN, fontWeight: 700, fontSize: 30, letterSpacing: 7, color: "#5A3A22" }}>BORÉAL LOGISTIQUE RECRUTE</div>
        <div style={{ fontFamily: DECO, fontSize: 66, color: "#1A0F0A", margin: "10px 0 6px", opacity: seg(t, T.b2b - 0.9, T.b2b - 0.6) }}>SuperCommercial B2B</div>
        <div style={{ fontFamily: JOSEFIN, fontWeight: 600, fontSize: 28, letterSpacing: 5, color: "#5A3A22", opacity: seg(t, T.b2b - 0.2, T.b2b + 0.1) }}>CDI · PARIS · DÉCIDEURS EXIGEANTS</div>
      </div>
    </div>
  );
};
const TitleCard: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, S.title, S.interview)) return null;
  const k = ease(t, S.title + 0.05, S.title + 0.45);
  return (
    <AbsoluteFill style={{ backgroundColor: INK }}>
      <Beams t={t} o={0.8} />
      <div style={{ position: "absolute", left: 80, right: 80, top: 700, textAlign: "center", opacity: k, transform: `scale(${lerp(1.1, 1, k)})` }}>
        <div style={{ display: "flex", justifyContent: "center" }}><Fan size={140} /></div>
        <div style={{ fontFamily: JOSEFIN, fontWeight: 600, fontSize: 30, letterSpacing: 7, color: CREAM, marginTop: 16, whiteSpace: "nowrap" }}>LES SUPER-RECRUES · ÉPISODE 2</div>
        <div style={{ fontFamily: DECO, fontSize: 104, lineHeight: 1.05, marginTop: 18, ...GOLD_TXT }}>Le Super&shy;Commercial</div>
      </div>
    </AbsoluteFill>
  );
};
// interrogatoire : une ampoule qui se balance, le reste plonge dans le noir, les mots tombent comme des tampons
const Interro: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, S.interro, S.ots3 + 0.6)) return null;
  const o = 1 - seg(t, S.ots3, S.ots3 + 0.6), ang = Math.sin((t - S.interro) * 2.4) * 9, flick = 0.92 + 0.08 * Math.sin(t * 47) * Math.sin(t * 13);
  const words: [string, number][] = [["BUDGET ?", T.budget], ["DÉCIDEUR ?", T.decideur], ["BESOIN ?", T.besoin], ["DÉLAI ?", T.delai]];
  const cur = words.reduce((c, w, i) => (t >= w[1] - 0.08 ? i : c), -1);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: o * flick, background: `conic-gradient(from ${180 - 26 + ang}deg at 540px 250px, rgba(0,0,0,0) 0deg, rgba(0,0,0,0) 52deg, rgba(3,2,6,0.86) 52.5deg, rgba(3,2,6,0.86) 360deg)` }} />
      <div style={{ position: "absolute", inset: 0, opacity: o * 0.35 * flick, mixBlendMode: "screen", background: `conic-gradient(from ${180 - 26 + ang}deg at 540px 250px, rgba(255,196,110,0.5) 0deg, rgba(255,196,110,0.15) 52deg, rgba(0,0,0,0) 52.5deg)` }} />
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: o }}>
        <g transform={`rotate(${ang} 540 0)`}>
          <line x1={540} y1={0} x2={540} y2={225} stroke="#111" strokeWidth={5} />
          <path d="M500 225 L580 225 L560 250 L520 250 Z" fill="#141414" />
          <circle cx={540} cy={262} r={22} fill="#FFE6B8" />
        </g>
      </svg>
      {cur >= 0 && t < S.ots3 && (() => {
        const [w, at] = words[cur], k = easeOutBack(seg(t, at - 0.08, at + 0.12));
        return <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", fontFamily: DECO, fontSize: 132, color: "#F2C46D", textShadow: "0 0 30px rgba(242,196,109,0.5), 0 10px 0 #5A2A10",
          transform: `scale(${lerp(1.8, 1, k)}) rotate(${cur % 2 ? 3 : -3}deg)`, opacity: clamp(k * 2) }}>{w}</div>;
      })()}
    </>
  );
};
const LetterInsert: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, S.letter, S.surpris)) return null;
  const k = ease(t, S.letter, S.letter + 0.4);
  const typed: [string, number][] = [["« Je suis rapide,", T.rapide - 0.35], ["fort,", T.rapide + 0.55], ["et je ne dors", T.jamais - 0.55], ["jamais. »", T.jamais - 0.05]];
  return (
    <AbsoluteFill style={{ backgroundColor: "#140A08" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 42%, rgba(255,170,80,0.45) 0%, rgba(120,60,20,0.18) 38%, rgba(5,4,10,0.95) 70%)" }} />
      <div style={{ position: "absolute", left: 130, top: 460, width: 820, height: 1000, background: PAPER, transform: `rotate(-4deg) translateY(${(1 - k) * 120}px) scale(${1 + 0.04 * seg(t, S.letter, S.surpris)})`, boxShadow: "0 40px 80px rgba(0,0,0,0.7)", padding: "80px 70px", boxSizing: "border-box" }}>
        <div style={{ fontFamily: "DejaVu Sans Mono, monospace", fontSize: 34, color: "#2A2420", lineHeight: 1.5 }}>Madame, Monsieur,</div>
        <div style={{ height: 50 }} />
        {typed.map(([w, at], i) => <span key={i} style={{ fontFamily: "DejaVu Sans Mono, monospace", fontSize: 50, fontWeight: 700, color: "#1A1512", lineHeight: 1.45, opacity: t >= at ? 1 : 0 }}>{w}{" "}</span>)}
        <div style={{ height: 60 }} />
        {[600, 560, 620, 420].map((w, i) => <div key={i} style={{ width: w, height: 14, borderRadius: 7, background: "#DDD3C3", marginBottom: 22 }} />)}
      </div>
      <Recruiter t={t} o={0.95} />
    </AbsoluteFill>
  );
};
const GEN = ["037", "038", "039", "040", "042", "044", "046", "048"];
const SiteInsert: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, S.site, S.ots4)) return null;
  const k = ease(t, S.site, S.site + 0.45);
  const shot = t < T.cv - 0.15 ? "017-offre-lien" : t < T.s30 - 0.1 ? "008-cv-ajoute" : t < T.lettre2 - 0.15 ? `${GEN[Math.min(7, Math.floor(seg(t, T.s30 - 0.1, T.lettre2 - 0.15) * 8))]}-generation` : "049-lettre";
  const PW = 1080 * 0.52, PHh = 1920 * 0.52;
  const tags: [string, number, number][] = [["LEURS CLIENTS", T.clients, 640], ["LEURS DÉLAIS", T.delais, 1080], ["LEUR MÉTIER", T.metier, 1440]];
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "rgba(5,4,10,0.72)" }} />
      <div style={{ position: "absolute", left: 540 - PW / 2, top: 520, width: PW, height: PHh, opacity: k, transform: `translateY(${(1 - k) * 90}px) scale(${lerp(0.9, 1, k)})` }}>
        <div style={{ position: "absolute", inset: -22, clipPath: cut(26), background: `linear-gradient(180deg, ${GOLD_L}, ${GOLD} 50%, #8A6630)` }} />
        <div style={{ position: "absolute", inset: -12, clipPath: cut(20), background: INK }} />
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 18 }}><Img src={staticFile(`parcours-boreal/${shot}.png`)} style={{ width: PW, height: PHh }} /></div>
      </div>
      {tags.map(([label, at, y], i) => t >= at - 0.15 && (
        <div key={i} style={{ position: "absolute", left: i % 2 ? 560 : 60, top: y, transform: `scale(${easeOutBack(seg(t, at - 0.15, at + 0.15))}) rotate(${i % 2 ? 3 : -3}deg)` }}>
          <div style={{ padding: "14px 30px", clipPath: cut(14), background: `linear-gradient(180deg, ${PINK_L}, ${PINK})`, fontFamily: JOSEFIN, fontWeight: 700, fontSize: 40, letterSpacing: 3, color: "#fff", boxShadow: "0 16px 40px rgba(0,0,0,0.5)" }}>{label}</div>
        </div>
      ))}
      {t >= T.s30 - 0.1 && <div style={{ position: "absolute", left: 60, right: 60, top: 1600, textAlign: "center", fontFamily: "Open Sans", fontSize: 26, color: "rgba(245,236,217,0.75)", opacity: seg(t, T.s30 - 0.1, T.s30 + 0.2) }}>* temps mesuré : 27 à 35 s par lettre</div>}
    </>
  );
};
// signal « mm. » projeté sur les nuages (CTA)
const MmSignal: React.FC<{ t: number; o: number }> = ({ t, o }) => o <= 0.01 ? null : (
  <div style={{ position: "absolute", left: 540 - 250, top: 300, width: 500, height: 380, opacity: o * (0.94 + 0.06 * Math.sin(t * 31)) }}>
    <div style={{ position: "absolute", inset: -110, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,184,192,0.35) 0%, rgba(217,130,139,0.08) 50%, rgba(0,0,0,0) 70%)" }} />
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 46%, rgba(255,240,242,0.95) 0%, rgba(242,184,192,0.85) 50%, rgba(217,130,139,0.4) 66%, rgba(217,130,139,0) 72%)" }} />
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: "perspective(900px) rotateX(16deg)" }}>
      <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 150, letterSpacing: -6, color: "#4A1626", opacity: 0.88 }}>mm.</span>
    </div>
  </div>
);
const EndCard: React.FC<{ t: number }> = ({ t }) => {
  if (t < S.endCard) return null;
  const k = ease(t, S.endCard, S.endCard + 0.5);
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 900, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
      <div style={{ position: "relative", padding: "36px 30px 30px", background: "rgba(8,5,10,0.93)", clipPath: cut(26), textAlign: "center" }}>
        <div style={{ position: "absolute", inset: 8, border: `2px solid ${GOLD}`, clipPath: cut(20), opacity: 0.85 }} />
        <div style={{ fontFamily: DECO, fontSize: 58, lineHeight: 1.12, ...GOLD_TXT }}>Ta mission :<br />le poste que tu vises.</div>
        <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 40, color: "#fff", marginTop: 20 }}>Dis-le-moi en commentaire ↓</div>
        <Img src={staticFile("logo-mymotiv.png")} style={{ width: 300, marginTop: 24, filter: `drop-shadow(0 0 14px ${PINK})` }} />
        <div style={{ fontFamily: "Poppins", fontWeight: 600, fontSize: 30, color: PINK_L, marginTop: 8 }}>1re lettre offerte · lien en bio</div>
      </div>
    </div>
  );
};

export const EpisodeCommercial: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const hits = [T.commercial, T.budget, T.decideur, T.besoin, T.delai, T.lundi, T.cagoule];
  const flash = pulse(t, S.title, 0.06) * 0.7 + pulse(t, T.lundi + 0.05, 0.06) * 0.35 + pulse(t, S.cta, 0.07) * 0.5;
  const shake = hits.reduce((s, h) => s + pulse(t, h + 0.04, 0.05), 0) * 10;
  const yannAt = (name: string, a: number, b: number, extra: Partial<React.ComponentProps<typeof Panel>> = {}) => show(t, a, b) ? <Panel t={t} t0={a} name={name} {...extra} /> : null;
  // bulles : Yann en haut (pointe vers son visage), recruteur en bas à gauche (pointe vers son ombre)
  const YB = (line: number, b: number, size?: number) => <Bubble t={t} line={line} b={b} x={110} y={240} w={860} tail={[560, 560]} size={size} />;
  const RB = (line: number, b: number, size?: number) => <Bubble t={t} line={line} b={b} x={150} y={1010} w={820} tail={[300, 1250]} size={size} />;
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <Audio src={staticFile("audio/commercial.wav")} />
      {/* 1. l'annonce : la tour de Boréal Logistique, puis la caméra glisse jusqu'à Yann */}
      {t < S.title && <>
        {(() => { // la tour, puis un travelling rapide sur « Commercial ? » jusqu'à Yann, puis une lente poussée sur son visage
          const p = easeInOut(seg(t, T.commercial - 0.75, T.commercial + 0.15));
          const z = t < T.commercial - 0.75 ? lerp(1.08, 1.0, seg(t, 0, T.commercial - 0.75)) : lerp(1.0, 1.14, easeInOut(seg(t, T.commercial, S.title)));
          return <CaseOne t={t} a={0} b={1} x0={0} x1={0} fy={0.34} cam={[lerp(1180, 420, p), z]} />;
        })()}
        <Beams t={t} o={0.55} />
        <Recit t={t} line={0} b={PH[0][1] + 0.4} />
        <Annonce t={t} />
        <Bubble t={t} line={1} b={S.title} x={60} y={170} w={660} tail={[790, 470]} size={44} />
      </>}
      <TitleCard t={t} />
      {/* 2. l'entretien */}
      {show(t, S.interview, S.letter) && <>
        {yannAt("neutre", S.interview, S.joyeux)}
        {yannAt("joyeux", S.joyeux, S.ots2)}
        {yannAt("neutre", S.ots2, S.interro)}
        {yannAt("colere", S.interro, S.letter, { push: 0.12, shake })}
        {(show(t, S.interview, S.joyeux) || show(t, S.ots2, S.interro) || show(t, S.ots3, S.letter)) && <Recruiter t={t} />}
        <Interro t={t} />
        {RB(2, S.joyeux)}{YB(3, S.ots2)}{RB(4, S.interro)}{RB(6, S.letter, 46)}
      </>}
      <LetterInsert t={t} />
      {show(t, S.surpris, S.nuit) && <>
        {yannAt("surpris", S.surpris, S.pensif, { push: 0.1 })}
        {yannAt("pensif", S.pensif, S.triste)}
        {yannAt("triste", S.triste, S.nuit, { dim: 0.25 * seg(t, T.rappellera, T.rappellera + 0.6) })}
        {(show(t, S.surpris, S.pensif) || show(t, S.triste, S.nuit)) && <Recruiter t={t} />}
        <Bubble t={t} line={7} a={S.surpris} b={S.pensif} x={150} y={1010} w={820} tail={[300, 1250]} size={46} from={14} />
        {YB(8, S.triste)}{RB(9, S.nuit)}
      </>}
      {/* 3. la nuit, seul : MyMotiv */}
      {show(t, S.nuit, S.ots4) && <>
        <CaseOne t={t} a={S.nuit} b={S.ots4} x0={430} x1={430} z0={1.18} z1={1.08} fy={0.4} dim={0.1} />
        <Rain t={t} o={0.8} />
        <SiteInsert t={t} />
        <Recit t={t} line={10} a={S.site + 0.2} b={S.ots4} top={120} />
      </>}
      {/* 4. le deuxième entretien */}
      {show(t, S.ots4, S.cta) && <>
        {yannAt("neutre", S.ots4, S.joyeux2)}
        {yannAt("joyeux", S.joyeux2, S.ots5, { push: 0.1 })}
        {yannAt("sceptique", S.ots5, S.inquiet)}
        {yannAt("inquiet", S.inquiet, S.cta, { push: 0.12 })}
        {(show(t, S.ots4, S.joyeux2) || show(t, S.ots5, S.inquiet)) && <Recruiter t={t} letter={show(t, S.ots4, S.joyeux2) ? 1 : 0} />}
        {RB(11, S.joyeux2, 44)}{YB(12, S.ots5)}{RB(13, S.inquiet)}{YB(14, S.cta)}
      </>}
      {/* 5. CTA : le signal « mm. » sur la ville */}
      {t >= S.cta && <>
        <CaseOne t={t} a={S.cta} b={COMMERCIAL_DUR} x0={1180} x1={1180} z0={1.0} z1={1.1} fy={0.3} dim={0.25 * seg(t, S.endCard, S.endCard + 0.5)} />
        <Beams t={t} o={0.7} />
        <MmSignal t={t} o={ease(t, S.cta + 0.1, S.cta + 0.6)} />
        <Recit t={t} line={15} a={S.cta + 0.2} b={S.endCard} top={1180} />
        <EndCard t={t} />
      </>}
      <Blinds t={t} at={S.title} />
      <Blinds t={t} at={S.interview} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 54, textAlign: "center", fontFamily: JOSEFIN, fontWeight: 600, fontSize: 22, letterSpacing: 5, color: "rgba(245,236,217,0.55)" }}>MISE EN SCÈNE · PARODIE · ENTREPRISE FICTIVE</div>
      <Flash k={flash} />
    </AbsoluteFill>
  );
};
