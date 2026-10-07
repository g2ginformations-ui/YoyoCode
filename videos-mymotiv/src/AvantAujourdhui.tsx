// « Avant / Aujourd'hui » (≈ 37 s, 60 i/s, 9:16) — voix NATURELLE de l'utilisateur (tools/assembler-prises.py :
// prise principale + prises séparées « La référence » et « La meilleure IA », puis tools/voix-narrateur.py +
// voix-avant.json ; effet téléphone sur les phrases « Avant »).
// Style Apple épuré (skill apple-motion) : fond clair, le logo MyMotiv reste IMMOBILE au centre pendant toute la vidéo,
// les animations se passent au-dessus, en dessous et en orbite autour de lui. Les passages « Avant » sont filmés en
// vieux cinéma (sépia, grain, vignettage, rayures, scintillement, bandes noires) ; le logo, lui, reste net et moderne.
// Seul curseur : la flèche de souris MyMotiv (jamais le viseur rond).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { APPLE, TextDrop, go, press } from "./apple";
import { PINK, PINK_L, clamp, lerp, rng, seg } from "./common";
import { Confetti, Pointer, Ripple } from "./Lien";
import { Bubbles, Flash, Shockwave, ease, pulse } from "./motion";
import voix from "./data/avant-voix.json";
import "./fonts";

export const AVANT_DUR = voix.duration;
const P = voix.phrases;
const mot = (w: string, ph: number) => voix.mots.find((m) => m.phrase === ph && m.w.toLowerCase().startsWith(w))?.t0 ?? P[ph].t0;
const CX = 540, LY = 960, LW = 460; // logo fixe : centre de l'écran
const INK = APPLE.ink, SOFT = APPLE.soft;

// Temps clés (s), d'après les phrases et les mots recalés de la voix
export const T = {
  photo: 0.25, aujourd: P[1].t0, burst: P[1].t0 + 0.75, parfaite: mot("parfaite", 1),
  avant2: P[2].t0, peu: mot("peu", 2), mais: P[3].t0, top: mot("top.", 3),
  recr: P[4].t0, lettre: P[5].t0, voit: mot("voit", 5), madame: P[6].t0,
  cree: P[7].t0, drop: mot("émotive", 7), ref: P[8].t0, pour: P[9].t0, ia: P[10].t0,
  ecrit: P[11].t0, cette: mot("cette", 11), s30: mot("30", 11), top2: P[12].t0, offerte: P[13].t0, offerteMot: mot("offerte", 13),
  fin: P[14].t0, bio: P[15].t0,
};
const GEN = T.ecrit + 0.2;                       // clic sur « Générer »
const RING0 = GEN + 0.1, RING1 = T.s30 + 0.45;   // l'anneau 30 s* fait le tour du logo

// passages « vieux cinéma » : début (jusqu'à « Aujourd'hui ») et « Avant, on se contentait de peu »
const filmK = (t: number) =>
  t < T.aujourd ? 1 - ease(t, T.aujourd - 0.2, T.aujourd + 0.1) : t < T.mais - 0.2 ? ease(t, T.avant2 - 0.25, T.avant2 + 0.05) : 1 - ease(t, T.mais - 0.2, T.mais + 0.1);

// apparition / sortie « Apple » : arrive avec un léger rebond et du flou, repart vers le haut en flou
export function inOut(t: number, a: number, b: number, dy = 50): React.CSSProperties {
  const i = clamp(go(t, a, a + 0.42, 0, 1), 0, 1.06), o = ease(t, b - 0.25, b);
  return { opacity: clamp(seg(t, a, a + 0.2)) * (1 - o), transform: `translateY(${(1 - i) * dy - o * dy}px) scale(${0.94 + 0.06 * i - 0.05 * o})`, filter: `blur(${Math.max(0, (1 - seg(t, a, a + 0.3)) * 12 + o * 12)}px)` };
}
export const show = (t: number, a: number, b: number) => t > a - 0.02 && t < b + 0.02;

const Line: React.FC<{ t: number; a: number; b: number; y: number; children: React.ReactNode; z?: number }> = ({ t, a, b, y, children, z = 30 }) =>
  !show(t, a, b) ? null : (
    <div style={{ position: "absolute", left: 50, right: 50, top: y, textAlign: "center", fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.1, zIndex: z, ...inOut(t, a, b) }}>{children}</div>
  );

// photo façon tirage (paysage dessiné, aucune image de banque)
const Photo: React.FC<{ blur: number; w?: number; grey?: number; glow?: number }> = ({ blur, w = 440, grey = 0, glow = 0 }) => (
  <div style={{ width: w, padding: w * 0.045, paddingBottom: w * 0.16, background: "#FFFFFF", borderRadius: 10, boxShadow: `0 30px 70px rgba(0,0,0,0.22), 0 0 ${80 * glow}px rgba(217,130,139,${0.7 * glow})`, filter: grey ? `grayscale(${grey})` : undefined }}>
    <svg width={w * 0.91} height={w * 0.8} viewBox="0 0 400 352" style={{ display: "block", borderRadius: 4, filter: `blur(${blur}px)` }}>
      <defs><linearGradient id="ciel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7DB8F2" /><stop offset="0.75" stopColor="#FFE0B8" /></linearGradient></defs>
      <rect width="400" height="352" fill="url(#ciel)" />
      <circle cx="292" cy="118" r="42" fill="#FFC56B" />
      <path d="M0 250 Q90 170 190 240 T400 220 V352 H0 Z" fill="#88B98A" />
      <path d="M0 300 Q120 240 240 290 T400 280 V352 H0 Z" fill="#5E9467" />
      <rect x="92" y="218" width="58" height="46" fill="#F4EDE4" /><path d="M86 220 L121 192 L156 220 Z" fill={PINK} />
    </svg>
  </div>
);

// lettre (carte blanche) : « Madame, Monsieur, » + lignes
export const Letter: React.FC<{ w?: number; grey?: number; logo?: boolean; write?: number }> = ({ w = 400, grey = 0, logo = false, write = 1 }) => (
  <div style={{ width: w, height: w * 1.25, borderRadius: 26, background: "#fff", padding: w * 0.09, boxShadow: "0 30px 70px rgba(0,0,0,0.18)", filter: grey ? `grayscale(${grey}) brightness(${1 - 0.12 * grey})` : undefined, boxSizing: "border-box", overflow: "hidden" }}>
    {logo ? (
      <div style={{ display: "flex", alignItems: "center", gap: w * 0.04 }}>
        <Img src={staticFile("company.png")} style={{ width: w * 0.2, height: w * 0.2, borderRadius: w * 0.05, boxShadow: `0 0 ${w * 0.06}px ${PINK}` }} />
        <div style={{ fontSize: w * 0.075, fontWeight: 800, color: INK, whiteSpace: "nowrap" }}>Maison Lumen</div>
      </div>
    ) : (
      <div style={{ fontFamily: "Georgia, serif", fontSize: w * 0.075, color: "#555", whiteSpace: "nowrap" }}>Madame, Monsieur,</div>
    )}
    {[94, 88, 96, 72, 90, 84, 60].map((p, i) => (
      <div key={i} style={{ marginTop: i ? w * 0.045 : w * 0.08, height: w * 0.028, borderRadius: 9, width: `${p * clamp(write * 7 - i)}%`, background: logo && i === 0 ? "#F2C9CE" : "#E3E3E8" }} />
    ))}
  </div>
);

export const Pill: React.FC<{ children: React.ReactNode; bg?: string; color?: string; size?: number; style?: React.CSSProperties }> = ({ children, bg = INK, color = "#fff", size = 40, style }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: `${size * 0.42}px ${size * 0.9}px`, borderRadius: 999, background: bg, color, fontSize: size, fontWeight: 800, whiteSpace: "nowrap", boxShadow: "0 18px 50px rgba(0,0,0,0.16)", ...style }}>{children}</div>
);

// ─── vieux film : grain, vignettage, rayures, poussières, scintillement, bandes noires ───
const FilmOverlay: React.FC<{ k: number; frame: number }> = ({ k, frame }) => {
  if (k <= 0.01) return null;
  const r = rng(Math.floor(frame / 2) + 7);
  const scratches = Array.from({ length: 3 }, () => [r() * 1080, r() * 0.5 + 0.2, r() > 0.45] as const);
  const dust = Array.from({ length: 7 }, () => [r() * 1080, r() * 1920, 2 + r() * 7, r() > 0.6] as const);
  return (
    <AbsoluteFill style={{ zIndex: 40, pointerEvents: "none" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.28 * k, mixBlendMode: "multiply" }}>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} /><feColorMatrix type="saturate" values="0" /></filter>
        <rect width="1080" height="1920" filter="url(#grain)" />
      </svg>
      <div style={{ position: "absolute", inset: 0, opacity: k, background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 42%, rgba(48,30,12,0.55) 100%)" }} />
      {scratches.map(([x, o, on], i) => on && <div key={i} style={{ position: "absolute", left: x, top: 0, width: 2, height: 1920, background: "rgba(40,28,15,0.55)", opacity: o * k }} />)}
      {dust.map(([x, y, s, on], i) => on && <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s * 1.4, borderRadius: "50%", background: "rgba(30,20,10,0.7)", opacity: k }} />)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 120 * k, background: "#0B0A0B" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120 * k, background: "#0B0A0B" }} />
    </AbsoluteFill>
  );
};

// ─── curseur (flèche de souris uniquement) : [temps du clic, x, y] ───
const CLICKS: [number, number, number][] = [[T.lettre + 0.3, 600, 520], [GEN, 600, 1390]];
function pointer(t: number) {
  const vis: [number, number][] = [[T.lettre - 0.25, T.lettre + 0.9], [GEN - 0.6, GEN + 0.5]];
  let o = 0; for (const [a, b] of vis) o = Math.max(o, seg(t, a, a + 0.15) * (1 - seg(t, b - 0.15, b)));
  const c = t < T.lettre + 1.2 ? CLICKS[0] : CLICKS[1];
  const k = ease(t, c[0] - 0.55, c[0] - 0.05);
  return { x: lerp(c[1] + 330, c[1], k), y: lerp(c[2] + 380, c[2], k) + Math.sin(k * Math.PI) * -60, pr: pulse(t, c[0], 0.07), o };
}

export const AvantAujourdhui: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const fk = filmK(t);
  const flick = fk * (rng(frame + 3)() - 0.5) * 0.12;
  const weave = fk * (rng(frame + 11)() - 0.5) * 6;
  const ptr = pointer(t);

  // photos : 1 floue (Avant), puis la rafale qui devient nette (Aujourd'hui)
  const shots = [0, 1, 2, 3, 4].map((i) => T.burst + i * 0.2);
  const nShots = shots.filter((s) => t >= s).length;
  const photoOut = T.avant2 + 0.05;
  // « de peu » : la photo rapetisse en petit carré terne ; puis 3 barres « le top du top »
  const shrink = ease(t, T.avant2 + 0.1, T.avant2 + 0.6);
  const bars = [[-170, 0.45], [0, 0.7], [170, 1]] as const;
  const barK = (i: number) => go(t, T.mais + 0.25 + i * 0.12, T.mais + 0.75 + i * 0.12, 0, 1);
  // lettres copiées-collées
  const copies = [0, 1, 2, 3].map((i) => T.lettre + 0.55 + i * 0.16);
  const greyK = ease(t, T.voit - 0.05, T.voit + 0.3);
  const fall = ease(t, T.cree - 0.3, T.cree + 0.25);
  // orbite autour du logo (« pour se faire recruter »), aspirée dans le logo sur « La meilleure IA »
  const orbitR = 1 - ease(t, T.ia + 0.75, T.ia + 1.25);
  const ring = ease(t, RING0, RING1);

  return (
    <AbsoluteFill style={{ background: APPLE.bg, fontFamily: "Poppins", color: INK, overflow: "hidden" }}>
      {/* ═════ scène (filtrée en vieux film pendant les passages « Avant ») ═════ */}
      <AbsoluteFill style={{ filter: fk > 0.01 ? `sepia(${0.85 * fk}) contrast(${1 + 0.18 * fk}) brightness(${1 - 0.06 * fk + flick}) blur(${0.6 * fk}px)` : undefined, transform: `translateY(${weave}px)` }}>
        <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%, #FFFFFF 0%, #F2F2F4 60%, #E9E9EE 100%)" }} />

        {/* 1. la photo floue, puis la rafale */}
        {t < T.mais + 0.4 && (
          <div style={{ position: "absolute", left: CX - 220, top: 230, zIndex: 5, transform: `translateY(${go(t, T.photo, T.photo + 0.5, -900, 0)}px) rotate(${lerp(-7, 0, shrink)}deg) scale(${lerp(1, 0.36, shrink)})`, transformOrigin: "50% 60%", opacity: 1 - seg(t, T.mais + 0.15, T.mais + 0.35) }}>
            <Photo blur={nShots ? 9 - nShots * 2 : 9} grey={shrink * 0.8} glow={ease(t, T.parfaite - 0.1, T.parfaite + 0.3) * (1 - shrink)} />
          </div>
        )}
        {shots.map((s, i) => t >= s && t < photoOut && (
          <div key={i} style={{ position: "absolute", left: CX - 220, top: 230, zIndex: 6 + i, transform: `rotate(${[5, -4, 3, -2, 0][i]}deg) scale(${go(t, s, s + 0.25, 1.25, 1)})`, opacity: i < nShots - 1 ? 0 : 1, filter: `blur(${(1 - seg(t, s, s + 0.12)) * 8}px)` }}>
            <Photo blur={Math.max(0, 7 - i * 2)} glow={i === 4 ? ease(t, T.parfaite - 0.1, T.parfaite + 0.3) * (1 - shrink) : 0} />
          </div>
        ))}
        {shots.map((s, i) => <Flash key={i} k={pulse(t, s + 0.02, 0.04) * 0.55} />)}
        {show(t, T.parfaite - 0.05, T.avant2) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 720, zIndex: 20, textAlign: "center", ...inOut(t, T.parfaite - 0.05, T.avant2) }}>
            <Pill bg={PINK} size={38}>✓ Parfaite</Pill>
          </div>
        )}

        {/* 2. le top du top : 3 barres qui montent */}
        {show(t, T.mais + 0.2, T.recr + 0.35) && bars.map(([dx, h], i) => {
          const k = barK(i), out = ease(t, T.recr - 0.05, T.recr + 0.3);
          const hh = 520 * h * k;
          return (
            <div key={i} style={{ position: "absolute", left: CX + dx - 60, top: 800 - hh, width: 120, height: hh, borderRadius: 30, background: `linear-gradient(180deg, ${i === 2 ? PINK : PINK_L}, rgba(242,184,192,0.35))`, boxShadow: i === 2 ? `0 0 ${60 * pulse(t, T.top, 0.3)}px ${PINK}` : undefined, opacity: 1 - out, transform: `scaleY(${1 - out * 0.6})`, transformOrigin: "50% 100%" }}>
              {i === 2 && <div style={{ position: "absolute", left: 0, right: 0, top: -96, textAlign: "center", fontSize: 76, transform: `scale(${go(t, T.top - 0.1, T.top + 0.25, 0, 1)}) rotate(${Math.sin(t * 5) * 6}deg)` }}>⭐</div>}
            </div>
          );
        })}

        {/* 3. le recruteur */}
        {show(t, T.recr + 0.05, T.lettre) && (
          <div style={{ position: "absolute", left: CX - 280, top: 280, width: 560, zIndex: 8, ...inOut(t, T.recr + 0.05, T.lettre) }}>
            <div style={{ background: "#fff", borderRadius: 40, padding: 34, boxShadow: "0 30px 70px rgba(0,0,0,0.14)", display: "flex", alignItems: "center", gap: 28 }}>
              <div style={{ width: 130, height: 130, borderRadius: 65, background: "#F4E1E4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72 }}>👔</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 40, fontWeight: 800 }}>Recruteur</div>
                {[90, 70].map((w, i) => <div key={i} style={{ marginTop: 16, height: 16, borderRadius: 8, width: `${w}%`, background: "#E3E3E8" }} />)}
              </div>
            </div>
            <div style={{ position: "absolute", left: 300 + Math.sin(t * 4) * 120, top: 200, fontSize: 90, transform: `rotate(${-15 + Math.sin(t * 4) * 8}deg)` }}>🔍</div>
          </div>
        )}

        {/* 4. la lettre copiée-collée, puis « Madame, Monsieur… » */}
        {show(t, T.lettre - 0.05, T.cree + 0.3) && (
          <div style={{ position: "absolute", left: CX - 180 - 39, top: 220, zIndex: 8, opacity: 1 - seg(t, T.cree + 0.05, T.cree + 0.3), transform: `translateY(${fall * 1300}px) rotate(${fall * 14}deg)`, filter: `blur(${fall * 6}px)` }}>
            <div style={{ ...inOut(t, T.lettre - 0.05, 99), transform: `${inOut(t, T.lettre - 0.05, 99).transform} scale(${lerp(1, 1.14, ease(t, T.madame - 0.1, T.madame + 0.5))}) scale(${press(t, CLICKS[0][0])})`, transformOrigin: "50% 0%" }}>
              {copies.map((c, i) => t >= c && (
                <div key={i} style={{ position: "absolute", left: (i + 1) * 26, top: (i + 1) * 26, transform: `scale(${go(t, c, c + 0.2, 0.8, 1)})`, opacity: seg(t, c, c + 0.08) }}><Letter w={360} grey={greyK} /></div>
              )).reverse()}
              <div style={{ position: "relative" }}><Letter w={360} grey={greyK} /></div>
            </div>
          </div>
        )}
        {show(t, T.voit - 0.05, T.cree) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 760, zIndex: 20, textAlign: "center", ...inOut(t, T.voit - 0.05, T.madame + 0.1) }}>
            <Pill bg="#C7C7CC" color="#fff" size={34}>⌘C · ⌘V</Pill>
          </div>
        )}

        {/* 5. « La référence » + orbite autour du logo */}
        {show(t, T.pour + 0.1, T.ia + 1.3) && ["📄 Ton CV", "🔗 L'offre", "✦ Ta lettre"].map((label, i) => {
          const th = (t - T.pour) * (1.5 + ease(t, T.ia, T.ia + 1.2) * 4) + (i * 2 * Math.PI) / 3 - Math.PI / 2;
          const r = orbitR * go(t, T.pour + 0.1 + i * 0.08, T.pour + 0.55 + i * 0.08, 0, 1);
          const depth = (Math.sin(th) + 1) / 2;
          return (
            <div key={label} style={{ position: "absolute", left: CX + Math.cos(th) * 330 * r, top: LY + Math.sin(th) * 200 * r, transform: `translate(-50%, -50%) scale(${(0.75 + 0.3 * depth) * clamp(r * 1.4)})`, zIndex: depth > 0.5 ? 12 : 4, opacity: clamp(r * 3), filter: `blur(${(1 - depth) * 2}px)` }}>
              <Pill bg="#fff" color={INK} size={34} style={{ boxShadow: "0 16px 40px rgba(0,0,0,0.14)" }}>{label}</Pill>
            </div>
          );
        })}

        {/* 6. Générer → anneau 30 s* autour du logo → la lettre pour CETTE entreprise */}
        {show(t, GEN - 0.7, T.s30 + 0.4) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1340, zIndex: 20, textAlign: "center", ...inOut(t, GEN - 0.7, T.s30 + 0.4) }}>
            <div style={{ display: "inline-block", transform: `scale(${press(t, GEN)})` }}><Pill bg={PINK} size={44}>✦ Générer ma lettre</Pill></div>
          </div>
        )}
        {t > RING0 - 0.1 && t < T.top2 + 0.3 && (
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, zIndex: 3, opacity: 1 - seg(t, T.top2 - 0.1, T.top2 + 0.3) }}>
            <circle cx={CX} cy={LY} r={320} fill="none" stroke="#E3E3E8" strokeWidth={14} />
            <circle cx={CX} cy={LY} r={320} fill="none" stroke={PINK} strokeWidth={14} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 320 * ring} 9999`} transform={`rotate(-90 ${CX} ${LY})`} style={{ filter: `drop-shadow(0 0 ${12 + 30 * pulse(t, RING1, 0.25)}px rgba(217,130,139,0.8))` }} />
          </svg>
        )}
        {show(t, T.s30 - 0.05, T.top2 + 0.1) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1320, zIndex: 20, textAlign: "center", ...inOut(t, T.s30 + 0.35, T.top2 + 0.1) }}>
            <div style={{ fontSize: 110, fontWeight: 800, letterSpacing: -4, color: PINK }}>30 s*</div>
          </div>
        )}
        {show(t, T.top2 - 0.3, AVANT_DUR) && (
          <div style={{ position: "absolute", left: CX - 230, top: 180, zIndex: 8, ...inOut(t, T.top2 - 0.3, T.fin + 0.1) }}>
            <div style={{ transform: `rotate(${Math.sin(t * 1.5) * 1.5}deg)` }}><Letter w={460} logo write={ease(t, T.top2 - 0.3, T.top2 + 0.5)} /></div>
            <div style={{ position: "absolute", right: -30, top: -26, width: 96, height: 96, borderRadius: 48, background: PINK, color: "#fff", fontSize: 54, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 40px ${PINK}`, transform: `scale(${go(t, T.top2 + 0.2, T.top2 + 0.5, 0, 1)})` }}>✓</div>
          </div>
        )}

        {/* 7. offerte */}
        {show(t, T.offerte - 0.05, T.fin + 0.1) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1300, zIndex: 20, textAlign: "center", ...inOut(t, T.offerte - 0.05, T.fin + 0.1) }}>
            <div style={{ display: "inline-block", transform: `scale(${go(t, T.offerteMot - 0.1, T.offerteMot + 0.2, 0.9, 1)})` }}><Pill bg={PINK} size={46}>🎁 Ta 1re lettre est offerte</Pill></div>
          </div>
        )}
        {t > T.offerteMot - 0.05 && t < T.offerteMot + 1.6 && <Confetti t={t} t0={T.offerteMot} />}

        {/* 8. fin */}
        {t > T.fin - 0.1 && <div style={{ position: "absolute", inset: 0, zIndex: 2, opacity: seg(t, T.fin - 0.1, T.fin + 0.4), filter: "saturate(1.1)" }}><Bubbles t={t} t0={T.fin} /></div>}
        {show(t, T.bio - 0.05, AVANT_DUR) && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 1380, zIndex: 20, textAlign: "center", ...inOut(t, T.bio - 0.05, AVANT_DUR + 1) }}>
            <Pill bg={INK} size={46}>Lien en bio ↑</Pill>
          </div>
        )}

        {/* ═════ titres ═════ */}
        <Line t={t} a={0.6} b={T.aujourd - 0.05} y={1130}><span style={{ fontSize: 96 }}><TextDrop t={t} t0={0.65} text="Avant," /></span><br /><span style={{ fontSize: 50, color: "#6B5A48" }}><TextDrop t={t} t0={1.25} text="une photo floue… on la gardait." by="chars" from={[0, 24]} stagger={0.025} dur={0.16} /></span></Line>
        <Line t={t} a={T.aujourd + 0.05} b={T.avant2 - 0.05} y={1130}><span style={{ fontSize: 100 }}><TextDrop t={t} t0={T.aujourd + 0.1} text="Aujourd'hui ?" /></span><br /><span style={{ fontSize: 48, color: PINK }}><TextDrop t={t} t0={T.aujourd + 0.95} text="On la refait jusqu'à ce qu'elle soit parfaite." by="chars" from={[0, 24]} stagger={0.018} dur={0.15} /></span></Line>
        <Line t={t} a={T.avant2 + 0.05} b={T.mais - 0.05} y={1130}><span style={{ fontSize: 66 }}><TextDrop t={t} t0={T.avant2 + 0.1} text="Avant, on se contentait" /></span><br /><span style={{ fontSize: 96, color: "#6B5A48" }}><TextDrop t={t} t0={T.peu - 0.2} text="de peu." by="chars" from={[0, 24]} stagger={0.04} dur={0.18} /></span></Line>
        <Line t={t} a={T.mais + 0.05} b={T.recr - 0.05} y={1130}><span style={{ fontSize: 60 }}><TextDrop t={t} t0={T.mais + 0.1} text="Aujourd'hui, on veut" /></span><br /><span style={{ fontSize: 108, color: PINK }}><TextDrop t={t} t0={T.top - 0.55} text="le top du top." by="chars" from={[0, -40]} stagger={0.035} dur={0.18} /></span></Line>
        <Line t={t} a={T.recr + 0.05} b={T.lettre - 0.05} y={1130}><span style={{ fontSize: 80 }}><TextDrop t={t} t0={T.recr + 0.1} text="Les recruteurs," /></span><br /><span style={{ fontSize: 80, color: PINK }}><TextDrop t={t} t0={T.recr + 0.55} text="c'est pareil." by="chars" from={[0, 24]} stagger={0.03} dur={0.16} /></span></Line>
        <Line t={t} a={T.lettre + 0.05} b={T.madame - 0.05} y={1130}><span style={{ fontSize: 66 }}><TextDrop t={t} t0={T.lettre + 0.1} text="Une lettre copiée-collée…" /></span><br /><span style={{ fontSize: 86, color: SOFT }}><TextDrop t={t} t0={T.voit - 0.3} text="ça se voit." by="chars" from={[0, 24]} stagger={0.03} dur={0.16} /></span></Line>
        <Line t={t} a={T.madame + 0.05} b={T.cree - 0.05} y={1150}><span style={{ fontSize: 76, fontFamily: "Georgia, serif", fontWeight: 400, fontStyle: "italic", color: SOFT, letterSpacing: 0 }}><TextDrop t={t} t0={T.madame + 0.1} text="« Madame, Monsieur… »" by="chars" from={[0, 10]} stagger={0.03} dur={0.2} /></span></Line>
        <Line t={t} a={T.cree + 0.05} b={T.ref - 0.05} y={1140}><span style={{ fontSize: 50, color: PINK }}>↑</span><br /><span style={{ fontSize: 64 }}><TextDrop t={t} t0={T.cree + 0.1} text="C'est pour ça qu'on a créé" /></span></Line>
        <Line t={t} a={T.ref} b={T.ia - 0.05} y={250}><span style={{ fontSize: 120, letterSpacing: -4 }}><TextDrop t={t} t0={T.ref + 0.05} text="La référence." /></span><br /><span style={{ fontSize: 58, color: PINK }}><TextDrop t={t} t0={T.pour + 0.05} text="pour se faire recruter." by="chars" from={[0, 24]} stagger={0.025} dur={0.16} /></span></Line>
        <Line t={t} a={T.ia} b={T.ecrit + 0.1} y={300}>
          <span style={{ fontSize: 112, letterSpacing: -4, backgroundImage: `linear-gradient(100deg, ${INK} ${lerp(-20, 80, seg(t, T.ia + 0.2, T.ia + 1.2))}%, ${PINK} ${lerp(0, 100, seg(t, T.ia + 0.2, T.ia + 1.2))}%, ${INK} ${lerp(20, 120, seg(t, T.ia + 0.2, T.ia + 1.2))}%)`, WebkitBackgroundClip: "text", color: "transparent", display: "inline-block", padding: "0 10px" }}>La meilleure IA</span>
        </Line>
        <Line t={t} a={T.ecrit + 0.15} b={T.top2 - 0.3} y={260}><span style={{ fontSize: 64 }}><TextDrop t={t} t0={T.ecrit + 0.2} text="écrit ta lettre pour" /></span><br /><span style={{ fontSize: 104, color: PINK, letterSpacing: -3 }}><TextDrop t={t} t0={T.cette - 0.1} text="CETTE entreprise." by="chars" from={[0, -30]} stagger={0.03} dur={0.16} /></span></Line>
        <Line t={t} a={T.top2 + 0.05} b={T.offerte - 0.05} y={1310}><span style={{ fontSize: 104, color: PINK, letterSpacing: -3 }}><TextDrop t={t} t0={T.top2 + 0.05} text="Le top du top." by="chars" from={[0, -40]} stagger={0.035} dur={0.18} /></span></Line>
        <Line t={t} a={T.fin + 0.05} b={AVANT_DUR + 1} y={1110}><span style={{ fontSize: 76 }}><TextDrop t={t} t0={T.fin + 0.1} text="Avec MyMotiv, postulez." /></span><br /><span style={{ fontSize: 76, color: PINK }}><TextDrop t={t} t0={T.fin + 1.4} text="Et faites-vous recruter." /></span></Line>
        {show(t, T.s30 - 0.1, T.top2 + 0.2) && <div style={{ position: "absolute", left: 0, right: 0, top: 1490, textAlign: "center", fontSize: 26, color: SOFT, fontFamily: "Open Sans", zIndex: 30, opacity: seg(t, T.s30, T.s30 + 0.3) * (1 - seg(t, T.top2, T.top2 + 0.2)) }}>* temps mesuré : 27 à 35 s par lettre · exemple fictif</div>}

        {/* moment MyMotiv : onde de choc depuis le logo */}
        <Shockwave t={t} t0={T.drop} x={CX} y={LY} r={620} />
        <Flash k={pulse(t, T.drop, 0.08) * 0.5} />
      </AbsoluteFill>

      <FilmOverlay k={fk} frame={frame} />

      {/* ═════ le logo MyMotiv : immobile, net, au-dessus de tout ═════ */}
      <div style={{ position: "absolute", left: CX - LW / 2, top: LY - (LW * 221) / 960 / 2, width: LW, zIndex: 50 }}>
        <div style={{ position: "absolute", inset: -60, borderRadius: 200, background: `radial-gradient(ellipse, rgba(242,184,192,${0.55 * (pulse(t, T.drop, 0.5) + 0.35 * ease(t, T.drop, T.drop + 0.5))}) 0%, rgba(242,184,192,0) 70%)` }} />
        <Img src={staticFile("logo-mymotiv.png")} style={{ width: LW, display: "block", position: "relative" }} />
        {/* reflet qui traverse le logo au moment « MyMotiv » et à la fin */}
        {[T.drop - 0.1, T.fin + 0.6].map((s) => t > s && t < s + 0.7 && (
          <div key={s} style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${staticFile("logo-mymotiv.png")})`, WebkitMaskSize: "100% 100%", background: `linear-gradient(100deg, rgba(255,255,255,0) ${lerp(-40, 110, seg(t, s, s + 0.6))}%, rgba(255,255,255,0.95) ${lerp(-25, 125, seg(t, s, s + 0.6))}%, rgba(255,255,255,0) ${lerp(-10, 140, seg(t, s, s + 0.6))}%)` }} />
        ))}
      </div>

      {/* curseur souris + onde du clic */}
      <AbsoluteFill style={{ zIndex: 60 }}>
        {CLICKS.map(([ct, x, y]) => <Ripple key={ct} x={x} y={y} t={t} t0={ct} />)}
        <Pointer x={ptr.x} y={ptr.y} hover={0} press={ptr.pr} o={ptr.o} />
      </AbsoluteFill>

      <Audio src={staticFile("audio/avant.wav")} />
    </AbsoluteFill>
  );
};
