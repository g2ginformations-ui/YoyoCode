// « Maquette 3D » (33,5 s, 60 i/s, 9:16) — maquette animée d'une pub 3D façon studio (construction reprise d'une pub de
// référence : inspiration seulement, ni ses logos, ni ses images, ni ses couleurs). Sert de guide pour la version
// générée par IA (prompts Veo 3.1) et de cadre pour la voix off de l'utilisateur.
// A. studio clair : pilules 3D brillantes (stage, alternance, CDI, candidature spontanée) qui s'empilent, puis
//    tournent en anneau → B. noir : 4 orbes lumineux qui fusionnent → flash → icône « mm. » qui se retourne sur des
//    rayons roses + étoiles → C. cercles concentriques roses, texte 3D géant « MYMOTIV », téléphone (vraies captures)
//    qui pivote, « Une interface ultra fluide », gros plan incliné, tuiles 3D qui sortent de l'écran → D. « Et ce n'est
//    pas tout !! » + dossier et curseur → E. mur gris sous projecteur : galerie de cartes « Sur MyMotiv » →
//    F. rubans rose / noir / blanc → G. icône sur un piédestal sous le projecteur, slogan → fin.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { go } from "./apple";
import { PINK, PINK_L, clamp, lerp, rng, seg } from "./common";
import { AppIcon, Flash, ease, pulse } from "./motion";
import { Pointer } from "./Lien";
import "./fonts";

export const MAQUETTE3D_DUR = 33.5;
export const M = {
  pills: [0.0, 0.75, 1.5, 2.25], ring: 3.9, black: 5.2, flash: 6.45, icon: 6.5, wipe: 7.9, phone: 8.1, fluide: 9.0,
  flip: 10.7, tilt: 12.0, tiles: [12.8, 13.6, 14.4, 15.2], tout: 16.6, folder: 17.7, gallery: 18.6, cards: [18.9, 20.2, 21.5, 22.8, 24.1],
  ribbons: 25.5, pedestal: 26.4, slogan1: 27.3, slogan2: 28.6, cta: 30.0, end: 32.4,
};
const GREY_TXT = "#5D636B";

// ─── A. pilules 3D ───
const PILLS: { title: string; color: [string, string]; icons: string[]; tile: React.ReactNode }[] = [
  { title: "Lettre de stage", color: ["#F2C94C", "#C99A12"], icons: ["🎓", "📄", "✏️"], tile: <Img src={staticFile("company.png")} style={{ width: "100%", height: "100%" }} /> },
  { title: "Lettre d'alternance", color: ["#7C9CF5", "#3F5FC8"], icons: ["🏫", "🔁", "💼"], tile: <span>N</span> },
  { title: "Lettre pour un CDI", color: ["#6BC4AE", "#2F8C76"], icons: ["💼", "🤝", "✅"], tile: <span>B</span> },
  { title: "Candidature spontanée", color: ["#9A9AA2", "#5A5A62"], icons: ["✉️", "🚀", "❓"], tile: <span>?</span> },
];
const TILE_BG = ["#FFF3D1", "#2F4FB8", "#23705E", "#3A3A40"];
const Pill: React.FC<{ i: number; t: number; t0: number; w?: number }> = ({ i, t, t0, w = 820 }) => {
  const p = PILLS[i], h = w * 0.29;
  const typed = p.title.slice(0, Math.round(p.title.length * seg(t, t0 + 0.15, t0 + 0.65)));
  return (
    <div style={{ position: "relative", width: w, height: h }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: h * 0.26, background: `linear-gradient(170deg, ${p.color[0]} 0%, ${p.color[1]} 100%)`,
        boxShadow: `0 ${h * 0.07}px 0 ${p.color[1]}, 0 ${h * 0.12}px ${h * 0.25}px rgba(0,0,0,0.35), inset 0 ${h * 0.04}px 0 rgba(255,255,255,0.55), inset 0 -${h * 0.05}px ${h * 0.1}px rgba(0,0,0,0.18)` }}>
        <div style={{ position: "absolute", left: "6%", right: "30%", top: "6%", height: "34%", borderRadius: h * 0.2, background: "linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0))" }} />
        <div style={{ position: "absolute", left: "7%", top: "14%", fontFamily: "Poppins", fontWeight: 700, fontSize: h * 0.2, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.25)", whiteSpace: "nowrap" }}>{typed}</div>
        <div style={{ position: "absolute", left: "7%", bottom: "13%", display: "flex", gap: h * 0.08 }}>
          {p.icons.map((ic, k) => <div key={k} style={{ width: h * 0.26, height: h * 0.26, borderRadius: h * 0.07, background: "rgba(0,0,0,0.16)", boxShadow: "inset 0 2px 0 rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: h * 0.14, transform: `scale(${go(t, t0 + 0.35 + k * 0.08, t0 + 0.6 + k * 0.08, 0, 1)})` }}>{ic}</div>)}
        </div>
      </div>
      <div style={{ position: "absolute", right: -h * 0.12, top: -h * 0.12, width: h * 0.95, height: h * 0.95, borderRadius: h * 0.24, overflow: "hidden", background: TILE_BG[i],
        transform: `perspective(600px) rotateY(-16deg) rotateZ(4deg) scale(${go(t, t0 + 0.1, t0 + 0.45, 0.4, 1)})`, boxShadow: `0 ${h * 0.06}px 0 rgba(0,0,0,0.25), 0 ${h * 0.12}px ${h * 0.2}px rgba(0,0,0,0.35), inset 0 3px 0 rgba(255,255,255,0.4)`,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: h * 0.55, color: "#fff" }}>
        {p.tile}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(140deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 45%)" }} />
      </div>
    </div>
  );
};
const ActA: React.FC<{ t: number }> = ({ t }) => {
  if (t >= M.black + 0.05) return null;
  const ring = ease(t, M.ring, M.ring + 0.9), spin = seg(t, M.ring + 0.4, M.black) * 120, fade = seg(t, M.black - 0.35, M.black);
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, #FFFFFF 0%, #ECECEF 45%, #C9C9CF 100%)" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 1 - fade, filter: `blur(${fade * 14}px)` }}>
        {PILLS.map((_, i) => {
          const t0 = M.pills[i], k = ease(t, t0, t0 + 0.55);
          if (t < t0) return null;
          const shown = M.pills.filter((p) => t >= p + 0.3).length;
          const stackY = 330 + i * 270 - Math.max(0, shown - 1 - i) * 0 ;
          // empilement : chaque pilule arrive d'en haut à droite en tournant, puis se range dans la pile
          const x0 = lerp(700, 130, k), y0 = lerp(-400, stackY, k), rot = lerp(-24, -6, k);
          // anneau : les pilules se répartissent sur un cercle et tournent
          const a = (i / 4) * Math.PI * 2 + (spin * Math.PI) / 180 - Math.PI / 2;
          const xr = 540 + Math.cos(a) * 300 - 410 * 0.62, yr = 900 + Math.sin(a) * 300 - 119 * 0.62;
          const x = lerp(x0, xr, ring), y = lerp(y0, yr, ring), sc = lerp(1, 0.62, ring);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: y, transform: `rotate(${lerp(rot, (a * 180) / Math.PI + 90, ring)}deg) scale(${sc})`, transformOrigin: "0 0", zIndex: 10 - i }}>
              <Pill i={i} t={t} t0={t0} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── B. orbes → flash → icône sur rayons ───
const ORB = ["#F2C94C", "#7C9CF5", "#6BC4AE", PINK];
const ActB: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= M.black && t < M.wipe + 0.4)) return null;
  const merge = ease(t, M.black, M.flash), lit = t >= M.flash;
  const flip = ease(t, M.icon, M.icon + 0.6), out = seg(t, M.wipe, M.wipe + 0.4);
  const r = rng(9);
  const stars = Array.from({ length: 6 }, (_, i) => ({ a: r() * Math.PI * 2, d: 330 + r() * 120, s: 50 + r() * 40, sp: (r() - 0.5) * 300 }));
  return (
    <div style={{ position: "absolute", inset: 0, background: lit ? "#FBEFF1" : "#000" }}>
      {!lit && ORB.map((c, i) => {
        const a = (i / 4) * Math.PI * 2 + t * 3.2, rad = lerp(300, 0, merge);
        return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(a) * rad - 90, top: 900 + Math.sin(a) * rad - 90, width: 180, height: 180, borderRadius: 90,
          background: `radial-gradient(circle, #fff 0%, ${c} 35%, rgba(0,0,0,0) 70%)`, filter: "blur(6px)", opacity: 0.95, boxShadow: `0 0 120px ${c}` }} />;
      })}
      {lit && (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - out }}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <g transform={`translate(540 900) rotate(${(t - M.icon) * 22})`}>
              {Array.from({ length: 12 }, (_, i) => { const a0 = (i / 12) * Math.PI * 2, a1 = a0 + Math.PI / 12, R = 1600;
                return <path key={i} d={`M0 0 L${Math.cos(a0) * R} ${Math.sin(a0) * R} L${Math.cos(a1) * R} ${Math.sin(a1) * R} Z`} fill={[PINK, "#F2B8C0", "#B9606B", "#E8728A"][i % 4]} opacity={0.9} />; })}
            </g>
            <circle cx={540} cy={900} r={260} fill="#FBEFF1" opacity={0.85} />
          </svg>
          <div style={{ position: "absolute", left: 540 - 190, top: 900 - 190, transform: `perspective(900px) rotateY(${lerp(180, 0, flip)}deg) rotateZ(${lerp(-12, -4, flip)}deg) scale(${go(t, M.icon, M.icon + 0.5, 0.3, 1)})` }}><AppIcon size={380} /></div>
          {stars.map((s, i) => {
            const k = ease(t, M.icon + 0.15 + i * 0.05, M.icon + 0.6 + i * 0.05);
            return <div key={i} style={{ position: "absolute", left: 540 + Math.cos(s.a) * s.d * k - s.s / 2, top: 900 + Math.sin(s.a) * s.d * k - s.s / 2, fontSize: s.s, color: "#F2C94C", transform: `rotate(${(t - M.icon) * s.sp}deg)`, textShadow: "0 6px 0 #B98B10", opacity: k }}>★</div>;
          })}
        </div>
      )}
      {lit && out > 0 && <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 50% 60%, rgba(255,255,255,${out}) ${out * 70}%, rgba(255,255,255,0) ${out * 100}%)` }} />}
    </div>
  );
};

// ─── C–D. cercles concentriques, texte 3D géant, téléphone ───
const P = (n: string) => staticFile(`parcours/${n}.png`);
const Extruded: React.FC<{ text: string; size: number; color?: string }> = ({ text, size, color = "#C9A2A8" }) => {
  const depth = Array.from({ length: 14 }, (_, i) => `${i * 1.2}px ${(i + 1) * 1.6}px 0 rgb(${lerp(150, 80, i / 13)},${lerp(95, 50, i / 13)},${lerp(104, 56, i / 13)})`).join(",");
  return <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: size, letterSpacing: -4, color, textShadow: `${depth}, 0 ${size * 0.25}px ${size * 0.3}px rgba(0,0,0,0.25)`, whiteSpace: "nowrap" }}>{text}</div>;
};
const TILES: [string, string, string][] = [["📄", "Ton CV", "#FFFFFF"], ["🔗", "Le lien de l'offre", "#FFFFFF"], ["✉️", "Ta lettre", PINK], ["⏱️", "30 s*", "#1C1C1E"]];
const ActC: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= M.wipe && t < M.gallery + 0.1)) return null;
  const inK = ease(t, M.wipe, M.wipe + 0.4);
  const turn = ease(t, M.phone, M.phone + 0.8), flip = seg(t, M.flip, M.flip + 0.9), tilt = ease(t, M.tilt, M.tilt + 0.8);
  const ry = t < M.flip ? lerp(90, -12, turn) + Math.sin(t * 1.5) * 6 : lerp(-12, 348, ease(t, M.flip, M.flip + 0.9));
  const screen = t < M.flip + 0.45 ? P("001-accueil") : P("034-resultat");
  const toutK = seg(t, M.tout - 0.2, M.tout + 0.1), folder = ease(t, M.folder, M.folder + 0.5), zoom = ease(t, M.gallery - 0.45, M.gallery);
  const PW = 1080 * 0.42, PHh = 1920 * 0.42;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: inK }}>
      <div style={{ position: "absolute", inset: -400, background: `repeating-radial-gradient(circle at 50% 50%, ${PINK} 0px, #E8A0AA 70px, #FBEFF1 140px, #F2B8C0 210px, ${PINK} 280px)`, transform: `scale(${1 + 0.15 * Math.sin(t * 0.8)})` }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0) 40%, rgba(80,30,40,0.35) 100%)" }} />
      {/* texte 3D géant derrière le téléphone */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, display: "flex", justifyContent: "center", transform: `translateX(${lerp(200, -60, seg(t, M.wipe, M.tout))}px)`, opacity: 0.9 * (1 - toutK) }}>
        <Extruded text="MYMOTIV" size={250} />
      </div>
      {/* téléphone */}
      {t < M.tout && (
        <div style={{ position: "absolute", inset: 0, perspective: 1600, opacity: 1 - toutK }}>
          <div style={{ position: "absolute", left: 540 - PW / 2, top: lerp(640, 560, tilt), width: PW, height: PHh, transformStyle: "preserve-3d",
            transform: `rotateY(${ry}deg) rotateX(${lerp(6, 48, tilt)}deg) rotateZ(${lerp(0, -18, tilt)}deg) scale(${lerp(1, 1.55, tilt)})` }}>
            <div style={{ position: "absolute", inset: -14, borderRadius: 70, background: "linear-gradient(135deg, #3A3A3C, #0B0A0B)", boxShadow: "0 50px 120px rgba(60,10,20,0.55), inset 0 0 0 3px #5A5A5E" }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 58, overflow: "hidden" }}><Img src={screen} style={{ width: PW, height: PHh }} /></div>
            <div style={{ position: "absolute", inset: 0, borderRadius: 58, background: "linear-gradient(120deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 35%)" }} />
          </div>
          {/* tuiles 3D qui sortent de l'écran */}
          {TILES.map(([ic, label, bg], i) => {
            const at = M.tiles[i], k = ease(t, at, at + 0.45);
            if (t < at) return null;
            const pos = [[90, 560], [640, 700], [110, 1080], [660, 1150]][i];
            return (
              <div key={i} style={{ position: "absolute", left: pos[0], top: pos[1], width: 330, height: 200, borderRadius: 44, background: bg === PINK ? `linear-gradient(160deg, ${PINK_L}, ${PINK})` : bg === "#1C1C1E" ? "linear-gradient(160deg,#3A3A3C,#111)" : "linear-gradient(160deg,#fff,#E9E4E6)",
                boxShadow: "0 12px 0 rgba(0,0,0,0.2), 0 30px 60px rgba(60,10,20,0.45), inset 0 3px 0 rgba(255,255,255,0.6)", transform: `perspective(800px) rotateY(${(i % 2 ? -1 : 1) * 18}deg) translateZ(${lerp(-400, 0, k)}px) scale(${k})`, opacity: k,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
                <div style={{ fontSize: 70 }}>{ic}</div>
                <div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 36, color: bg === "#FFFFFF" ? "#1D1D1F" : "#fff" }}>{label}</div>
              </div>
            );
          })}
        </div>
      )}
      {/* « Une interface ultra fluide » */}
      {show(t, M.fluide, M.tilt) && (
        <div style={{ position: "absolute", left: 60, top: 330, transform: `perspective(900px) rotateY(18deg) rotateZ(-6deg)`, fontFamily: "Poppins", fontWeight: 700, fontStyle: "italic", fontSize: 92, lineHeight: 1.0, color: "#1D1D1F", letterSpacing: -3, opacity: 1 - seg(t, M.tilt - 0.25, M.tilt) }}>
          {"Une interface".slice(0, Math.round(13 * seg(t, M.fluide, M.fluide + 0.5)))}<br />
          <span style={{ color: "#fff", textShadow: `0 6px 0 ${PINK}` }}>{"ultra fluide".slice(0, Math.round(12 * seg(t, M.fluide + 0.5, M.fluide + 1.0)))}</span>
        </div>
      )}
      <Note t={t} a={M.tiles[3] + 0.2} b={M.tout}>* temps mesuré : 27 à 35 s par lettre</Note>
      {/* D. « Et ce n'est pas tout !! » + dossier */}
      {t >= M.tout - 0.05 && (
        <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + zoom * 3})`, transformOrigin: "640px 1180px", opacity: 1 - seg(t, M.gallery - 0.15, M.gallery) }}>
          <div style={{ position: "absolute", left: 40, right: 40, top: 760, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, color: "#1D1D1F", lineHeight: 1.05 }}>
            {["Et", "ce", "n'est", "pas", "tout", "!!"].map((w, i) => {
              const k = ease(t, M.tout + i * 0.12, M.tout + 0.3 + i * 0.12);
              return <span key={i} style={{ display: "inline-block", fontSize: [80, 80, 96, 110, 130, 130][i], margin: "0 10px", transform: `translateY(${(1 - k) * -120}px) rotate(${(1 - k) * (i % 2 ? 20 : -20)}deg)`, opacity: k, color: i >= 4 ? "#fff" : "#1D1D1F", textShadow: i >= 4 ? `0 6px 0 ${PINK}` : "none" }}>{w}</span>;
            })}
          </div>
          {t >= M.folder && (
            <>
              <div style={{ position: "absolute", left: lerp(1100, 560, folder), top: lerp(1500, 1100, folder), fontSize: 170, transform: `rotate(${lerp(30, -6, folder)}deg)` }}>📁</div>
              <Pointer x={lerp(1180, 690, folder)} y={lerp(1620, 1230, folder)} hover={0} press={pulse(t, M.folder + 0.6, 0.08)} />
            </>
          )}
        </div>
      )}
    </div>
  );
};

// ─── E. galerie sous projecteur ───
const CARDS: { icon: React.ReactNode; title: string; top: string }[] = [
  { icon: <span>📄</span>, title: "CV adapté à l'offre", top: "#E8728A" },
  { icon: <Img src={staticFile("company.png")} style={{ width: 120, height: 120, borderRadius: 28 }} />, title: "Logo de l'entreprise", top: "#7C9CF5" },
  { icon: <span>✨</span>, title: "Ajustements en 1 clic", top: "#B48CE0" },
  { icon: <span>🎨</span>, title: "4 styles de PDF*", top: "#F2A65A" },
  { icon: <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 80, color: "#fff" }}>70 %</span>, title: "Score de matching", top: "#5FB3A1" },
];
const Spotlight: React.FC<{ o?: number }> = ({ o = 1 }) => (
  <>
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #3B4046 0%, #2A2E33 60%, #1E2125 100%)" }} />
    <div style={{ position: "absolute", left: 540 - 520, top: -100, width: 1040, height: 2100, background: "linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0.35) 45%, rgba(255,255,255,0.08) 100%)", clipPath: "polygon(44% 0, 56% 0, 100% 100%, 0 100%)", filter: "blur(18px)", opacity: o }} />
  </>
);
const ActE: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= M.gallery && t < M.ribbons + 0.6)) return null;
  const pos = M.cards.reduce((p, c, i) => p + ease(t, c - 0.35, c + 0.05) * (i > 0 ? 1 : 0), 0);   // carte au centre (glisse)
  const moving = M.cards.some((c, i) => i > 0 && t > c - 0.35 && t < c + 0.05);
  const on = clamp(seg(t, M.gallery, M.gallery + 0.15) + pulse(t, M.gallery + 0.02, 0.03));
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Spotlight o={on} />
      {CARDS.map((c, i) => {
        const d = i - pos, x = 540 + d * 560 - 210, focus = clamp(1 - Math.abs(d));
        const k = ease(t, M.cards[0] - 0.2, M.cards[0] + 0.3);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: 640, width: 420, height: 560, borderRadius: 64, overflow: "hidden", background: "#141A22",
            boxShadow: `0 40px 90px rgba(0,0,0,0.55), inset 0 2px 0 rgba(255,255,255,0.15)`, transform: `scale(${lerp(0.8, 1.05, focus) * k})`, filter: `blur(${(1 - focus) * 6 + (moving ? 3 : 0)}px) brightness(${lerp(0.45, 1.1, focus)})` }}>
            <div style={{ height: 270, background: c.top, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 120, boxShadow: "inset 0 -20px 40px rgba(0,0,0,0.15)" }}>{c.icon}</div>
            <svg width={420} height={290} style={{ position: "absolute", left: 0, top: 270 }}>
              {[0, 1, 2].map((j) => <path key={j} d={`M ${300 + j * 22} 290 C ${330 + j * 20} 200, ${360 + j * 15} 120, ${420} ${40 + j * 25}`} stroke={[PINK, PINK_L, "#B9606B"][j]} strokeWidth={6} fill="none" />)}
            </svg>
            <div style={{ position: "absolute", left: 30, right: 30, top: 300, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 40, lineHeight: 1.1, color: "#fff" }}>{c.title}</div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", justifyContent: "center" }}>
              <span style={{ padding: "8px 26px", borderRadius: 12, background: PINK, color: "#fff", fontFamily: "Open Sans", fontWeight: 600, fontSize: 30 }}>Sur MyMotiv</span>
            </div>
          </div>
        );
      })}
      <Note t={t} a={M.cards[3]} b={M.ribbons}>* styles réservés aux offres illimitées</Note>
    </div>
  );
};

// ─── F. rubans ───
const ActF: React.FC<{ t: number }> = ({ t }) => {
  if (!(t >= M.ribbons && t < M.pedestal + 0.3)) return null;
  const k = seg(t, M.ribbons, M.pedestal + 0.3);
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {Array.from({ length: 9 }, (_, i) => {
        const col = [PINK, "#0B0A0B", "#FFFFFF"][i % 3], dir = i % 2 ? 1 : -1, y = 120 + i * 200;
        const x = dir * lerp(1600, -1600, Math.pow(clamp(k * 1.25 - i * 0.03), 0.9));
        return (
          <div key={i} style={{ position: "absolute", left: -400 + x, top: y, width: 1900, height: 190, background: col, transform: "rotate(-14deg)", display: "flex", alignItems: "center", gap: 120, paddingLeft: 60, overflow: "hidden" }}>
            {[0, 1, 2, 3].map((j) => <span key={j} style={{ fontFamily: "Poppins", fontWeight: 700, fontStyle: "italic", fontSize: 110, color: col === "#FFFFFF" ? "#0B0A0B" : col === PINK ? "#fff" : PINK, letterSpacing: -2 }}>MYMOTIV</span>)}
          </div>
        );
      })}
    </div>
  );
};

// ─── G. piédestal ───
const ActG: React.FC<{ t: number }> = ({ t }) => {
  if (t < M.pedestal) return null;
  const k = ease(t, M.pedestal, M.pedestal + 0.5), drop = go(t, M.pedestal + 0.2, M.pedestal + 0.75, -700, 0);
  const end = seg(t, M.end, M.end + 0.6);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <Spotlight />
      <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 150, letterSpacing: -5, color: GREY_TXT, opacity: seg(t, M.slogan1, M.slogan1 + 0.3), transform: `translateY(${(1 - ease(t, M.slogan1, M.slogan1 + 0.4)) * 40}px)` }}>Postulez.</div>
      {/* piédestal */}
      <div style={{ position: "absolute", left: 540 - 150, top: 1080, width: 300, height: 600, background: "linear-gradient(90deg, #BDBDC2, #F5F5F7 45%, #D5D5DA 70%, #9E9EA4)", transform: `translateY(${(1 - k) * 600}px)` }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: -40, height: 80, borderRadius: "50%", background: "radial-gradient(ellipse at 50% 40%, #FFFFFF, #DADADF)" }} />
      </div>
      <div style={{ position: "absolute", left: 540 - 140, top: 800 + drop, transform: `rotateZ(${Math.sin((t - M.pedestal) * 2) * 2}deg)` }}><AppIcon size={280} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 84, lineHeight: 1.05, letterSpacing: -3, opacity: seg(t, M.slogan2, M.slogan2 + 0.3), transform: `translateY(${(1 - ease(t, M.slogan2, M.slogan2 + 0.4)) * 40}px)` }}>
        <span style={{ color: "#fff" }}>Et faites-vous</span> <span style={{ color: PINK_L }}>recruter.</span>
      </div>
      {t >= M.cta && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1470, display: "flex", justifyContent: "center", zIndex: 3 }}>
          <span style={{ padding: "14px 34px", borderRadius: 40, background: "#0B0A0B", color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 38, boxShadow: `0 0 0 3px ${PINK_L}`, transform: `scale(${go(t, M.cta, M.cta + 0.3, 0, 1)})` }}>1re lettre offerte · Lien en bio <span style={{ color: PINK_L }}>↑</span></span>
        </div>
      )}
      {end > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(11,10,11,${end})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile("logo-mymotiv.png")} style={{ width: 520, opacity: end, filter: `drop-shadow(0 0 20px ${PINK})` }} />
        </div>
      )}
    </div>
  );
};

const show = (t: number, a: number, b: number) => t >= a && t < b;
const Note: React.FC<{ t: number; a: number; b: number; children: React.ReactNode }> = ({ t, a, b, children }) =>
  show(t, a, b) ? <div style={{ position: "absolute", left: 60, right: 60, top: 1500, textAlign: "center", fontFamily: "Open Sans", fontSize: 24, color: "rgba(30,30,32,0.75)", background: "rgba(255,255,255,0.55)", borderRadius: 14, padding: "4px 10px", opacity: seg(t, a, a + 0.25) * (1 - seg(t, b - 0.2, b)) }}>{children}</div> : null;

export const Maquette3D: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const flash = pulse(t, M.flash, 0.09) * 1.3 + pulse(t, M.pedestal, 0.06) * 0.5;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0A0B", overflow: "hidden" }}>
      <Audio src={staticFile("audio/maquette3d.wav")} />
      <ActA t={t} />
      <ActB t={t} />
      <ActC t={t} />
      <ActE t={t} />
      <ActG t={t} />
      <ActF t={t} />
      <Flash k={flash} />
    </AbsoluteFill>
  );
};
