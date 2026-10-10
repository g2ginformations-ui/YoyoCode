// « Le faux DM » (≈106 s, 30 i/s, 9:16) — format « histoire à fort enjeu puis révélation » (effet Zeigarnik), demandé par le
// propriétaire avec Squeezie comme figure d'autorité (son choix). Garde-fous : aucune photo ni ressemblance (avatar pixel
// générique + son nom), faux messages bienveillants, révélation « tout est faux » dans la même vidéo, MyMotiv jamais associé
// à lui (« Squeezie, désolé, c'était pour la science »). Style : fond noir, lueur rouge, fenêtres et icônes en pixel art,
// texte en haut qui s'écrit au rythme de la voix. La chute relie le mécanisme aux lettres de motivation → MyMotiv.
// Voix : voix-fauxdm.json (--voix yann). Son : synth_fauxdm.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { clamp, lerp, rng, seg } from "./common";
import voix from "./data/fauxdm-voix.json";
import "./fonts";
import "./fontsPixel";

export const FAUXDM_DUR = voix.duration;
const RED = "#E8262B", RED_D = "#8E1216", INK = "#070303", W_ = "#F4F1EC", GREY = "#8A8580", PINK = "#D9828B";
const PIX = "Silkscreen";
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const show = (t: number, a: number, b: number) => t >= a && t < b;
const at = (i: number, d = 0.08) => Wt(i) - d;                 // un élément apparaît juste avant son mot
const pop = (t: number, a: number) => { const k = clamp((t - a) / 0.16); return Math.round(k * 4) / 4; };   // apparition « pixel » en 4 paliers

// ─── texte du haut : la phrase découpée en morceaux, les mots s'écrivent au rythme de la voix ───
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
const CHUNKS = voix.phrases.map((_, i) => {
  const out: [string, number][][] = []; let cur: [string, number][] = [];
  for (const w of wordTimes(i)) { cur.push(w); if (/[,.:…?!»]$/.test(w[0]) || cur.length >= 6) { out.push(cur); cur = []; } }
  if (cur.length) out.push(cur);
  return out;
});
const HOT = new Set(["squeezie", "feliciter", "lettre", "motivation", "supprimer", "image", "humour", "legal", "avocat", "plot", "twist", "changement", "drole",
  "proposition", "mens", "autorite", "enjeu", "faux", "encore", "credule", "cerveau", "zeigarnik", "recruteur", "decroche", "bout", "mymotiv", "offerte", "science", "fin"]);
const Caption: React.FC<{ t: number }> = ({ t }) => {
  let pi = -1; PH.forEach(([a], i) => { if (t >= a - 0.1) pi = i; });
  if (pi < 0 || t > PH[pi][1] + 0.5) return null;
  const chunks = CHUNKS[pi]; let ci = 0; chunks.forEach((c, k) => { if (t >= c[0][1] - 0.08) ci = k; });
  return (
    <div style={{ position: "absolute", left: 70, right: 70, top: 250, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 52, lineHeight: 1.2, color: W_, textShadow: "0 3px 0 rgba(0,0,0,0.6)" }}>
      {chunks[ci].map(([w, a], i) => t >= a - 0.08 && <React.Fragment key={i}><span style={{ color: HOT.has(norm(w)) ? RED : W_ }}>{w}</span>{" "}</React.Fragment>)}
    </div>
  );
};

// ─── pixel art ───
const PAL: Record<string, string> = { w: W_, r: RED, d: RED_D, k: "#141010", g: GREY, s: "#C9C2BA", p: "#F08A9A", y: "#F2C46D", b: "#5E6BFF", m: "#3A3433" };
const Pix: React.FC<{ rows: string[]; px?: number; style?: React.CSSProperties }> = ({ rows, px = 10, style }) => (
  <svg width={rows[0].length * px} height={rows.length * px} style={{ display: "block", ...style }} shapeRendering="crispEdges">
    {rows.flatMap((r, y) => r.split("").map((c, x) => (c === "." ? null : <rect key={`${x}-${y}`} x={x * px} y={y * px} width={px} height={px} fill={PAL[c] ?? c} />)))}
  </svg>
);
const ICON = {
  person: ["...gggg...", "..gggggg..", "..gggggg..", "..gggggg..", "...gggg...", "....gg....", ".gggggggg.", "gggggggggg", "gggggggggg", "gggggggggg"],
  envelope: ["wwwwwwwwwwwwww", "wrwwwwwwwwwwrw", "wwrwwwwwwwwrww", "wwwrwwwwwwrwww", "wwwwrrwwrrwwww", "wwwwwwrrwwwwww", "wwwwwwrrwwwwww", "wwwwwwwwwwwwww", "wwwwwwwwwwwwww"],
  trash: ["..rrrrrr..", "rrrrrrrrrr", ".r.r..r.r.", ".r.r..r.r.", ".r.r..r.r.", ".r.r..r.r.", ".r.r..r.r.", ".rrrrrrrr."],
  scales: ["......w......", ".....www.....", "wwwwwwwwwwwww", ".w....w....w.", "www...w...www", "www...w...www", "......w......", "....wwwww...."],
  brain: ["..pppppp..", ".pprpppppp", "pppppprppp", "pprpppppp.", "pppppprppp", ".pppprpppp", "..pppppp..", "....pp...."],
  lock: ["..rrrr..", ".r....r.", ".r....r.", "rrrrrrrr", "rrrwwrrr", "rrrwwrrr", "rrrrrrrr"],
  crown: ["r..r..r..r", "rr.rr.rr.r", "rrrrrrrrrr", "rrrrrrrrrr", "rwrrwrrwrr"],
  heart: [".rr.rr.", "rrrrrrr", "rrrrrrr", ".rrrrr.", "..rrr..", "...r..."],
  flask: ["..www..", "..w.w..", "..w.w..", ".wr.rw.", "wrrrrrw", "wrrrrrw", ".wwwww."],
  eye: ["...wwwww...", ".ww.....ww.", "w...rrr...w", "w..rrkrr..w", "w...rrr...w", ".ww.....ww.", "...wwwww..."],
  play: ["rr....", "rrrr..", "rrrrrr", "rrrr..", "rr...."],
  boy: ["..ssss..", ".ssssss.", ".skssks.", ".ssssss.", "..s..s..", ".wwwwww.", "wwwwwwww", "wwwwwwww"],
  zzz: ["wwww..", "...w..", "..w...", ".w....", "wwww.."],
  shield: ["rrrrrrrrr", "rrrrwrrrr", "rrrrwrrrr", "rrwwwwwrr", "rrrrwrrrr", ".rrrwrrr.", "..rrrrr..", "...rrr...", "....r...."],
};
const Win: React.FC<{ title: string; w: number; children?: React.ReactNode; style?: React.CSSProperties; red?: boolean }> = ({ title, w, children, style, red = true }) => (
  <div style={{ width: w, border: `4px solid ${red ? RED : W_}`, background: "rgba(7,3,3,0.92)", boxShadow: `0 0 0 4px ${INK}, 0 0 40px rgba(232,38,43,0.25)`, ...style }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: red ? RED : W_, padding: "6px 12px" }}>
      <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 22, color: red ? W_ : INK }}>{title}</span>
      <span style={{ display: "flex", gap: 6 }}>{[0, 1, 2].map((i) => <span key={i} style={{ width: 12, height: 12, background: red ? INK : RED }} />)}</span>
    </div>
    <div style={{ padding: "18px 20px", minHeight: 40 }}>{children}</div>
  </div>
);
const Line: React.FC<{ t: number; a: number; text: string; red?: boolean; size?: number }> = ({ t, a, text, red, size = 26 }) => {
  if (t < a) return null;
  const n = Math.floor(clamp((t - a) / 0.5) * text.length);
  return <div style={{ fontFamily: PIX, fontSize: size, color: red ? RED : W_, margin: "8px 0", border: red ? `3px solid ${RED}` : `3px solid ${GREY}`, padding: "6px 10px", display: "inline-block" }}>{text.slice(0, Math.max(1, n))}</div>;
};
const Tag: React.FC<{ text: string; red?: boolean; size?: number; style?: React.CSSProperties }> = ({ text, red, size = 26, style }) => (
  <div style={{ display: "inline-block", fontFamily: PIX, fontWeight: 700, fontSize: size, padding: "6px 14px", background: red ? RED : W_, color: red ? W_ : INK, ...style }}>{text}</div>
);
// un élément qui « pop » en paliers à l'instant a (et reste visible)
const P: React.FC<{ t: number; a: number; x: number; y: number; children: React.ReactNode; o?: number }> = ({ t, a, x, y, children, o = 1 }) => {
  if (t < a) return null;
  const k = pop(t, a);
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) scale(${lerp(0.5, 1, k)})`, opacity: o, whiteSpace: "nowrap" }}>{children}</div>;
};
// l'avatar : silhouette pixel générique dans un cercle (aucune photo, aucune ressemblance), anneau rouge en pointillés
const Avatar: React.FC<{ t: number; size?: number; name?: string; cross?: number; heart?: boolean }> = ({ t, size = 340, name = "SQUEEZIE", cross = 0, heart }) => (
  <div style={{ position: "relative", width: size, height: size }}>
    <svg width={size + 60} height={size + 60} style={{ position: "absolute", left: -30, top: -30, transform: `rotate(${t * 20}deg)` }}>
      <circle cx={(size + 60) / 2} cy={(size + 60) / 2} r={size / 2 + 22} fill="none" stroke={RED} strokeWidth={4} strokeDasharray="14 12" opacity={0.8} />
    </svg>
    <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle at 50% 40%, #3A1517, #120607)", overflow: "hidden", display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <Pix rows={ICON.person} px={size / 13} style={{ marginBottom: -size / 26 }} />
    </div>
    {cross > 0 && <svg width={size} height={size} style={{ position: "absolute", inset: 0, opacity: cross }}><path d={`M${size * 0.15} ${size * 0.15} L${size * 0.85} ${size * 0.85} M${size * 0.85} ${size * 0.15} L${size * 0.15} ${size * 0.85}`} stroke={RED} strokeWidth={size / 9} /></svg>}
    {heart && <div style={{ position: "absolute", left: -40, top: -10 }}><Pix rows={ICON.heart} px={11} /></div>}
    <div style={{ position: "absolute", left: "50%", bottom: -30, transform: "translateX(-50%)" }}><Tag text={name} size={30} /></div>
  </div>
);

// ─── les scènes (une par phrase) ───
const scene = (t: number, i: number) => show(t, PH[i][0] - 0.15, i + 1 < PH.length ? PH[i + 1][0] - 0.15 : FAUXDM_DUR);
const Scenes: React.FC<{ t: number }> = ({ t }) => {
  const C = 540, M = 980;
  if (scene(t, 0)) return (
    <>
      <P t={t} a={0} x={C} y={M}><Avatar t={t} /></P>
      <P t={t} a={at(4)} x={C + 200} y={M - 190}><div style={{ position: "relative" }}><Pix rows={ICON.envelope} px={9} /><div style={{ position: "absolute", right: -14, top: -14, width: 30, height: 30, background: RED, color: W_, fontFamily: PIX, fontSize: 20, textAlign: "center", lineHeight: "30px" }}>1</div></div></P>
      <P t={t} a={at(10)} x={C - 230} y={M - 210}><Tag text="IL Y A 7 JOURS" size={24} /></P>
      {t >= at(16) && <P t={t} a={at(16)} x={C} y={M + 290}><div style={{ position: "relative" }}><Tag text="FÉLICITATIONS" size={28} /><svg width={300} height={50} style={{ position: "absolute", left: -20, top: -6 }}><path d="M0 40 L300 4" stroke={RED} strokeWidth={8} /></svg></div></P>}
    </>
  );
  if (scene(t, 1)) {
    const bars = [0.2, 0.3, 0.28, 0.45, 0.6, 0.85, 1];
    return (
      <>
        <P t={t} a={at(25)} x={C - 230} y={M - 230}><Tag text="DÉBUT OCTOBRE" size={24} /></P>
        <P t={t} a={at(28)} x={C} y={M - 40}><Win title="MA VIDÉO" w={620}><div style={{ display: "flex", alignItems: "center", gap: 24 }}><Pix rows={ICON.play} px={16} /><div style={{ fontFamily: PIX, fontSize: 26, color: W_, lineHeight: 1.4 }}>{t >= at(35) ? "LA LETTRE DE MOTIVATION" : "..."}<br />{t >= at(39) ? <span style={{ color: RED }}>DE SQUEEZIE</span> : ""}</div></div></Win></P>
        {t >= at(48) && (
          <div style={{ position: "absolute", left: C - 220, top: M + 170, display: "flex", alignItems: "flex-end", gap: 14, height: 200 }}>
            {bars.map((h, k) => { const kk = clamp((t - at(48) - k * 0.08) / 0.25); return <div key={k} style={{ width: 44, height: Math.round(h * kk * 8) / 8 * 190, background: k === bars.length - 1 ? RED : "#5A4A48" }} />; })}
            <Tag text="VUES ▲" red size={24} style={{ marginLeft: 14 }} />
          </div>
        )}
      </>
    );
  }
  if (scene(t, 2)) return (
    <P t={t} a={PH[2][0] - 0.1} x={C} y={M}>
      <div style={{ position: "relative" }}>
        <Win title="MESSAGE PRIVÉ" w={660}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}><Pix rows={ICON.person} px={4} /><span style={{ fontFamily: PIX, fontSize: 26, color: W_ }}>SQUEEZIE</span></div>
          <Line t={t} a={at(62)} text="SUPPRIME TA VIDÉO." red /><br />
          <Line t={t} a={at(70)} text="ÇA NUIT À MON IMAGE." />
        </Win>
        {t >= at(65) && <div style={{ position: "absolute", right: -30, top: -130 }}><Pix rows={ICON.trash} px={12} /></div>}
      </div>
    </P>
  );
  if (scene(t, 3)) return (
    <>
      <P t={t} a={PH[3][0]} x={C} y={M - 230}><Pix rows={ICON.scales} px={16} /></P>
      <P t={t} a={at(86)} x={C - 210} y={M - 110}><Tag text="HUMOUR" size={26} /></P>
      <P t={t} a={at(91)} x={C + 200} y={M - 110}><Tag text="✓ LÉGAL" red size={26} /></P>
      <P t={t} a={at(92)} x={C} y={M + 120}><Win title="MA RÉPONSE" w={640} red={false}><Line t={t} a={at(94)} text="C'EST DE L'HUMOUR." /><br /><Line t={t} a={at(94) + 0.6} text="ET C'EST LÉGAL :)" /></Win></P>
      <P t={t} a={at(99)} x={C} y={M + 360}><Tag text="AUCUNE RÉPONSE" red size={30} /></P>
    </>
  );
  if (scene(t, 4)) return (
    <>
      <P t={t} a={PH[4][0]} x={C - 200} y={M + 80}><div><Pix rows={ICON.boy} px={18} /><div style={{ textAlign: "center", marginTop: 8 }}><Tag text="MOI" size={22} /></div></div></P>
      <P t={t} a={at(110)} x={C - 60} y={M - 60}><div style={{ display: "flex", gap: 10 }}>{[10, 16, 22].map((s, k) => <div key={k} style={{ width: s, height: s, background: GREY }} />)}</div></P>
      <P t={t} a={at(113)} x={C + 140} y={M - 200}><div style={{ position: "relative" }}><Pix rows={ICON.envelope} px={22} /><div style={{ position: "absolute", left: -20, top: -46 }}><Tag text="CABINET D'AVOCATS" size={20} /></div></div></P>
      <P t={t} a={at(115) + 0.2} x={C + 140} y={M - 60}><Tag text="MISE EN DEMEURE" red size={26} /></P>
      <P t={t} a={at(117)} x={C} y={M + 260}><Tag text="MOTIF : UNE LETTRE DE MOTIVATION" red size={22} /></P>
    </>
  );
  if (scene(t, 5)) return (
    <>
      <P t={t} a={at(123)} x={C} y={M - 230}><div style={{ border: `6px solid ${RED}`, padding: "20px 40px", textAlign: "center", transform: `translate(${Math.sin(t * 50) * 3}px, 0)` }}><div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 90, color: W_, lineHeight: 1 }}>PLOT</div><div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 90, color: RED, lineHeight: 1 }}>TWIST</div></div></P>
      {t >= at(126) && <div style={{ position: "absolute", left: C - 280, top: M - 40, display: "flex", gap: 16 }}>{["J+1", "J+2", "J+3", "J+4"].map((d, k) => t >= at(126) + k * 0.15 && <Tag key={d} text={d} red={k === 3} size={30} />)}</div>}
      <P t={t} a={at(130)} x={C} y={M + 160}><Win title="DM N°2" w={560}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><Pix rows={ICON.person} px={4} /><span style={{ fontFamily: PIX, fontSize: 26, color: W_ }}>SQUEEZIE</span></div></Win></P>
      <P t={t} a={at(135)} x={C} y={M + 310}><Tag text="CHANGEMENT D'AMBIANCE" size={26} /></P>
    </>
  );
  if (scene(t, 6)) return (
    <P t={t} a={PH[6][0] - 0.1} x={C} y={M}>
      <Win title="DM N°2 · SQUEEZIE" w={680}>
        <Line t={t} a={at(140)} text="JE M'EXCUSE." /><br />
        <Line t={t} a={at(146)} text="J'AI RÉAGI À CHAUD." /><br />
        <Line t={t} a={at(154)} text="J'AI REGARDÉ LA VIDÉO." /><br />
        <Line t={t} a={at(161)} text="TROP DRÔLE." red />
      </Win>
    </P>
  );
  if (scene(t, 7)) return (
    <>
      <P t={t} a={at(166)} x={C} y={M - 160}><Tag text="C'EST PAS FINI" size={40} /></P>
      <P t={t} a={at(176)} x={C} y={M + 120}><Win title="PROPOSITION" w={640}><div style={{ height: 120 }} /></Win></P>
    </>
  );
  if (scene(t, 8)) {
    const bar = (a: number) => <div style={{ height: 14, background: "#3A2526", marginTop: 6 }}><div style={{ width: `${Math.round(clamp((t - a) / 1.2) * 10) * 10}%`, height: 14, background: RED }} /></div>;
    return (
      <P t={t} a={PH[8][0] - 0.1} x={C} y={M}>
        <Win title="PROPOSITION" w={720}>
          <div style={{ fontFamily: PIX, fontSize: 25, color: W_, lineHeight: 1.6 }}>
            {t >= at(180) && <div>1. TU FAIS UNE VIDÉO ▶</div>}
            {t >= at(185) && <div style={{ color: RED }}>2. TU MENS DE A À Z{bar(at(185))}</div>}
            {t >= at(196) && <div>3. ON RESTE JUSQU'À LA FIN{bar(at(196))}</div>}
            {t >= at(210) && <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 8 }}>+ FIGURE D'AUTORITÉ <Pix rows={ICON.crown} px={6} /></div>}
            {t >= at(215) && <div>+ ENJEU FORT <span style={{ color: RED }}>!</span></div>}
            {t >= at(219) && <div style={{ marginTop: 10 }}><Tag text="→ IL LA PARTAGE EN STORY" red size={22} /></div>}
          </div>
        </Win>
      </P>
    );
  }
  if (scene(t, 9)) {
    const reveal = at(238);
    if (t < at(227)) return <P t={t} a={PH[9][0]} x={C} y={M}><div style={{ position: "relative" }}><Tag text="ACCEPTER" size={44} style={{ border: `4px solid ${W_}` }} /><div style={{ position: "absolute", right: -50, bottom: -50, transform: `translate(${(1 - clamp((t - PH[9][0]) / 0.6)) * 120}px, ${(1 - clamp((t - PH[9][0]) / 0.6)) * 120}px)` }}><svg width={44} height={60}><path d="M0 0 L0 48 L12 38 L20 58 L28 54 L20 34 L36 34 Z" fill={W_} stroke={INK} strokeWidth={3} /></svg></div></div></P>;
    if (t < reveal) return <P t={t} a={at(227)} x={C} y={M}><Avatar t={t} size={300} name="SQUEEZIE ?" cross={clamp((t - at(232)) / 0.2)} /></P>;
    return (
      <>
        <div style={{ position: "absolute", left: 0, right: 0, top: M - 260, height: 8, background: RED }} />
        <P t={t} a={reveal} x={C} y={M - 120}><div style={{ textAlign: "center", fontFamily: PIX, fontWeight: 700, lineHeight: 1.05 }}><div style={{ fontSize: 90, color: W_ }}>TOUT EST</div><div style={{ fontSize: 140, color: RED, transform: `translate(${(Math.sin(t * 60) > 0.6 ? 6 : 0)}px, 0)` }}>FAUX</div></div></P>
        <div style={{ position: "absolute", left: 0, right: 0, top: M + 60, height: 8, background: RED, opacity: t >= reveal ? 1 : 0 }} />
        <P t={t} a={at(244)} x={C} y={M + 230}><div style={{ textAlign: "center" }}><Pix rows={ICON.eye} px={14} /><div style={{ marginTop: 12 }}><Tag text="ET T'ES ENCORE LÀ." size={30} /></div></div></P>
      </>
    );
  }
  if (scene(t, 10)) {
    const icon = (rows: string[], label: string, a: number, x: number) => <P t={t} a={a} x={x} y={M - 40}><div style={{ textAlign: "center" }}><div style={{ border: `3px solid ${GREY}`, padding: 14, display: "inline-block" }}><Pix rows={rows} px={11} /></div><div style={{ marginTop: 10 }}><Tag text={label} size={20} red={label === "AUTORITÉ"} /></div></div></P>;
    return (
      <>
        {t < at(254) && <P t={t} a={PH[10][0]} x={C} y={M - 40}><div style={{ position: "relative" }}><Tag text="CRÉDULE ?" size={40} style={{ border: `4px solid ${W_}`, background: "transparent", color: W_ }} />{t >= at(252) && <div style={{ position: "absolute", left: "100%", top: 0, marginLeft: 12 }}><Tag text="NON." red size={40} /></div>}</div></P>}
        {t >= at(254) && <>
          {icon(ICON.boy, "UN INCONNU", at(259), C - 245)}
          {icon(ICON.envelope, "FORT ENJEU", at(264), C)}
          {icon(ICON.crown, "AUTORITÉ", at(269), C + 245)}
          <P t={t} a={at(273)} x={C} y={M + 250}><div style={{ display: "flex", alignItems: "center", gap: 20 }}><Pix rows={ICON.brain} px={14} /><Tag text="TON CERVEAU" size={26} /></div></P>
          <P t={t} a={at(278)} x={C} y={M + 380}><div style={{ display: "flex", alignItems: "center", gap: 16 }}><Pix rows={ICON.lock} px={10} /><Tag text="OBLIGÉ DE RESTER" red size={26} /></div></P>
        </>}
      </>
    );
  }
  if (scene(t, 11)) return (
    <P t={t} a={PH[11][0]} x={C} y={M}>
      <Win title="MÉCANISME" w={700}>
        <div style={{ fontFamily: PIX, fontSize: 26, color: GREY }}>NOM :</div>
        {t >= at(288) && <div style={{ fontFamily: PIX, fontWeight: 700, lineHeight: 1.05 }}><div style={{ fontSize: 44, color: W_ }}>L'EFFET</div><div style={{ fontSize: 72, color: RED }}>ZEIGARNIK</div></div>}
        {t >= at(290) && <div style={{ marginTop: 14 }}><Tag text="HISTOIRE PAS FINIE = CERVEAU ACCROCHÉ" size={20} /></div>}
      </Win>
    </P>
  );
  if (scene(t, 12)) return (
    <>
      <P t={t} a={PH[12][0]} x={C} y={M - 120}><Win title="LETTRE DE MOTIVATION" w={720} red={false}><Line t={t} a={at(310)} text="« JE ME PERMETS DE VOUS" size={24} /><br /><Line t={t} a={at(316)} text="ADRESSER MA CANDIDATURE… »" size={24} /></Win></P>
      <P t={t} a={at(301)} x={C - 160} y={M + 250}><div style={{ position: "relative" }}><Pix rows={ICON.boy} px={14} /><div style={{ marginTop: 6 }}><Tag text="RECRUTEUR" size={20} /></div>{t >= at(321) && <div style={{ position: "absolute", left: 120, top: -30 }}><Pix rows={ICON.zzz} px={9} /></div>}</div></P>
      <P t={t} a={at(322)} x={C + 170} y={M + 260}><Tag text="DÉCROCHE" red size={34} /></P>
    </>
  );
  if (scene(t, 13)) return (
    <>
      <P t={t} a={PH[13][0]} x={C} y={M - 120}><Win title="LETTRE DE MOTIVATION" w={720}><Line t={t} a={at(334)} text="UN VRAI ENJEU." red size={26} /><br /><Line t={t} a={at(336)} text="LEUR PROBLÈME." size={26} /><br /><Line t={t} a={at(339)} text="TON HISTOIRE." size={26} /></Win></P>
      <P t={t} a={at(340)} x={C} y={M + 260}><div style={{ width: 560 }}><div style={{ display: "flex", justifyContent: "space-between", fontFamily: PIX, fontSize: 22, color: W_, marginBottom: 8 }}><span>LECTURE</span><span style={{ color: RED }}>JUSQU'AU BOUT</span></div><div style={{ height: 26, border: `3px solid ${W_}` }}><div style={{ width: `${Math.round(clamp((t - at(340)) / 0.9) * 10) * 10}%`, height: "100%", background: RED }} /></div></div></P>
    </>
  );
  if (scene(t, 14)) return (
    <>
      <P t={t} a={at(352)} x={C} y={M - 300}><Img src={staticFile("logo-mymotiv.png")} style={{ width: 460 }} /></P>
      <P t={t} a={at(353)} x={C} y={M - 30}>
        <Win title="MYMOTIV" w={660}>
          {([["LIEN DE L'OFFRE", 356], ["TON CV", 361], ["UNE LETTRE QUI ACCROCHE", 366]] as const).map(([l, i]) => t >= at(i) && <div key={l} style={{ fontFamily: PIX, fontSize: 28, color: W_, margin: "10px 0" }}><span style={{ color: PINK }}>✓</span> {l}</div>)}
        </Win>
      </P>
      <P t={t} a={at(372)} x={C} y={M + 230}><div style={{ padding: "14px 26px", background: PINK, fontFamily: PIX, fontWeight: 700, fontSize: 30, color: W_ }}>1RE LETTRE OFFERTE</div></P>
      <P t={t} a={at(376)} x={C} y={M + 330}><Tag text="LIEN EN BIO ↑" size={30} /></P>
    </>
  );
  if (scene(t, 15)) return (
    <>
      <P t={t} a={PH[15][0]} x={C} y={M - 60}><Avatar t={t} heart /></P>
      <P t={t} a={at(384)} x={C} y={M + 250}><Tag text="DÉSOLÉ SQUEEZIE." size={32} /></P>
      <P t={t} a={at(387)} x={C} y={M + 340}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><Tag text="C'ÉTAIT POUR LA SCIENCE." red size={28} /><Pix rows={ICON.flask} px={9} /></div></P>
    </>
  );
  return null;
};

export const FauxDM: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const r = rng(7);
  const glitch = (t > Wt(238) - 0.1 && t < Wt(238) + 0.25) || (t > Wt(123) - 0.1 && t < Wt(123) + 0.15);
  return (
    <AbsoluteFill style={{ backgroundColor: INK, overflow: "hidden" }}>
      <Audio src={staticFile("audio/fauxdm.wav")} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 52%, rgba(120,12,14,0.55) 0%, rgba(50,6,8,0.35) 40%, rgba(7,3,3,0) 72%)" }} />
      {Array.from({ length: 40 }, (_, i) => { const x = r() * 1080, y = r() * 1920, s = r() < 0.2 ? 6 : 3; return <div key={i} style={{ position: "absolute", left: x, top: (y + t * 6 * (i % 3)) % 1920, width: s, height: s, background: i % 4 ? "rgba(232,38,43,0.35)" : "rgba(244,241,236,0.25)", opacity: 0.4 + 0.6 * Math.abs(Math.sin(t * 0.8 + i)) }} />; })}
      <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 980px", transform: `${glitch ? `translate(${(Math.sin(t * 97) * 8).toFixed(1)}px, 0) ` : ""}scale(1.35)` }}>
        <Scenes t={t} />
      </div>
      <Caption t={t} />
      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, rgba(0,0,0,0) 2px 4px)", pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
