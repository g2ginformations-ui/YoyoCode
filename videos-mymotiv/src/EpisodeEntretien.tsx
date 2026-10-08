// « Les Super-recrues · Épisode 1 : L'entretien » (≈45 s, 60 i/s, 9:16) — BD animée façon webtoon, à partir des images
// fournies par le propriétaire (4 cases + 8 expressions de Yann masqué, public/episode1/). Les anciennes bulles sont
// remplacées par des bulles vierges de MÊME forme (bulle-N.png) où le nouveau texte s'écrit au rythme des voix.
// Humour : le héros arrogant (« les légendes ne postulent pas ») se fait doubler par un candidat qui avait une lettre
// MyMotiv. Dialogue ElevenLabs v4 (accent parisien neutre) : voix-episode1.json → tools/assembler-lignes.py.
// Aucun nom de personnage ou de marque existant ; mention « Mise en scène · Parodie ». Son : synth_episode1.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Gift } from "lucide-react";
import { go } from "./apple";
import { PINK, PINK_L, clamp, easeInOut, easeOutBack, lerp, rng, seg } from "./common";
import { Flash, GlossPill, ease, pulse } from "./motion";
import { Blinds, CREAM, DECO, DecoFrame, DecoPill, Fan, GOLD, GOLD_L, GOLD_TXT, JOSEFIN, Words } from "./SuperRecrues";
import voix from "./data/episode1-voix.json";
import voixEnv from "./data/episode1-env.json";
import bulles from "./data/episode1-bulles.json";
import "./fonts";
import "./fontsDeco";

export const EPISODE1_DUR = voix.duration;
const PH = voix.phrases.map((p) => [p.t0, p.t1] as [number, number]);
const Wt = (i: number) => voix.mots.find((m) => m.i === i)?.t0 ?? 0;
const T = { moi: Wt(4), lundi: Wt(40), sur: Wt(35), mm: Wt(53), toits: Wt(62), cv: Wt(75), trente5: Wt(76), offerte: Wt(91), lien: Wt(92), bio: Wt(94), end: PH[11][1] };
const show = (t: number, a: number, b: number) => t >= a && t < b;
const envAt = (t: number) => { const i = Math.floor(t * 60); return i >= 0 && i < voixEnv.length ? voixEnv[i] : 0; };

// temps de chaque mot du TEXTE d'une réplique : position de ses lettres dans la phrase, recalée sur les mots transcrits
// (un mot qui suit un silence démarre donc bien à son propre temps)
const norm = (w: string) => w.toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "");
function wordTimes(i: number) {
  const ph = voix.phrases[i], mots = voix.mots.filter((m) => m.phrase === i), words = ph.text.split(" ");
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
// Texte qui s'écrit dans une bulle : la réplique est découpée en morceaux (indices de mots) qui se remplacent
const BubbleText: React.FC<{ t: number; line: number; parts: number[]; size: number; w: number; keep?: boolean }> = ({ t, line, parts, size, w, keep }) => {
  const wt = wordTimes(line);
  const starts = parts.map((p) => wt[p][1] - 0.08);
  let k = 0; starts.forEach((s, i) => { if (t >= s) k = i; });
  const from = parts[k], to = k + 1 < parts.length ? parts[k + 1] : wt.length;
  if (t < starts[0] - 0.2 || (!keep && t > PH[line][1] + 0.6)) return null;
  return (
    <div style={{ width: w, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: size, lineHeight: 1.18, color: "#121014", letterSpacing: -0.3 }}>
      {wt.slice(from, to).map(([word, at], i) => {
        const kk = seg(t, at - 0.05, at + 0.08);
        return <React.Fragment key={i}><span style={{ display: "inline-block", opacity: t >= at - 0.05 ? 1 : 0, transform: `scale(${lerp(0.6, 1, easeOutBack(kk))})` }}>{word}</span>{" "}</React.Fragment>;
      })}
    </div>
  );
};

// ─── la planche (coordonnées « page », largeur 1080) ───
const S = 1080 / 1106;                              // échelle des cases 1106 px → 1080 px
const HW = 528, HH = Math.round(820 * (HW / 524)); // gros plans côte à côte
const ROWS = { c1: 0, c2: 819, c3: 1638, r4: 2461, r5: 3311, c4: 4161, r7: 4983 };
type Pan = { img: string; x: number; y: number; w: number; h: number };
const PANELS: Record<string, Pan> = {
  c1: { img: "case-1-propre.jpg", x: 0, y: ROWS.c1, w: 1080, h: 814 * S }, c2: { img: "case-2-propre.jpg", x: 0, y: ROWS.c2, w: 1080, h: 814 * S },
  c3: { img: "case-3-propre.jpg", x: 0, y: ROWS.c3, w: 1080, h: 818 * S }, c4: { img: "case-4-propre.jpg", x: 0, y: ROWS.c4, w: 1080, h: 818 * S },
  v3: { img: "visage-3.jpg", x: 0, y: ROWS.r4, w: HW, h: HH }, v8: { img: "visage-8.jpg", x: 1080 - HW, y: ROWS.r4, w: HW, h: HH },
  v4: { img: "visage-4.jpg", x: 0, y: ROWS.r5, w: HW, h: HH }, v7: { img: "visage-7.jpg", x: 1080 - HW, y: ROWS.r5, w: HW, h: HH },
  v1: { img: "visage-1.jpg", x: 0, y: ROWS.r7, w: HW, h: HH }, v5: { img: "visage-5.jpg", x: 1080 - HW, y: ROWS.r7, w: HW, h: HH },
};
// qui est au point à chaque réplique : [case, cx, cy, zoom de départ, zoom d'arrivée]
const ctr = (p: Pan) => [p.x + p.w / 2, p.y + p.h / 2] as const;
const FOCUS: [string, number, number, number, number][] = [
  ["c1", 620, 400, 1.2, 1.3], ["c2", 540, ROWS.c2 + 400, 1.05, 1.1], ["c3", 600, ROWS.c3 + 400, 1.18, 1.3],
  ["v3", ...ctr(PANELS.v3), 1.5, 1.62], ["v8", ...ctr(PANELS.v8), 1.5, 1.58], ["v4", ...ctr(PANELS.v4), 1.5, 1.6], ["v7", ...ctr(PANELS.v7), 1.5, 1.58],
  ["c4", 520, ROWS.c4 + 400, 1.0, 1.04], ["v1", ...ctr(PANELS.v1), 1.5, 1.6], ["v5", ...ctr(PANELS.v5), 1.5, 1.66],
];
// début de chaque plan (≈ 0,25 s avant la réplique) ; la réplique 1 → plan 0, etc.
const SHOT_T = [PH[1][0] - 0.3, PH[2][0] - 0.25, PH[3][0] - 0.25, PH[4][0] - 0.2, PH[5][0] - 0.2, PH[6][0] - 0.25, PH[7][0] - 0.25, PH[8][0] - 0.25, PH[9][0] - 0.25, PH[10][0] - 0.25];
const TITLE = [PH[0][1] + 0.1, PH[1][0] - 0.3];      // carton-titre entre le hook et la case 1
const ENDS = PH[10][1] + 0.35;                       // fin de la planche → écran final
function camera(t: number) {
  let i = 0; SHOT_T.forEach((s, k) => { if (t >= s) i = k; });
  const f = FOCUS[i], prev = FOCUS[Math.max(0, i - 1)];
  const k = i === 0 ? 1 : easeInOut(seg(t, SHOT_T[i], SHOT_T[i] + 0.38));
  const hold = seg(t, SHOT_T[i], i + 1 < SHOT_T.length ? SHOT_T[i + 1] : ENDS);
  const z0 = lerp(prev[4], f[3], k), z = lerp(z0, f[4], easeInOut(hold) * k);
  const cx = lerp(prev[1], f[1], k), cy = lerp(prev[2], f[2], k);
  const speed = i === 0 ? 0 : Math.sin(Math.PI * seg(t, SHOT_T[i], SHOT_T[i] + 0.38));
  return { cx, cy, z, focus: f[0], speed };
}

// bulle dessinée (gros plans) : ellipse + queue, trait noir épais comme dans les cases d'origine
const DrawnBubble: React.FC<{ t: number; at: number; until: number; cx: number; cy: number; rx: number; ry: number; tail: [number, number]; line: number; parts?: number[]; size?: number }> =
  ({ t, at, until, cx, cy, rx, ry, tail, line, parts = [0], size = 34 }) => {
    if (!show(t, at, until)) return null;
    const k = easeOutBack(seg(t, at, at + 0.22)), out = seg(t, until - 0.15, until);
    const a = Math.atan2(tail[1] - cy, tail[0] - cx), bx = cx + Math.cos(a) * rx * 0.72, by = cy + Math.sin(a) * ry * 0.72, n = [-Math.sin(a), Math.cos(a)];
    const pts = `${bx + n[0] * 34},${by + n[1] * 34} ${tail[0]},${tail[1]} ${bx - n[0] * 34},${by - n[1] * 34}`;
    return (
      <div style={{ position: "absolute", left: 0, top: 0, width: 0, height: 0, opacity: 1 - out, transformOrigin: `${tail[0]}px ${tail[1]}px`, transform: `scale(${lerp(0.3, 1, k)})` }}>
        <svg width={2000} height={7000} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <polygon points={pts} fill="#fff" stroke="#121014" strokeWidth={6} strokeLinejoin="round" />
          <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill="#fff" stroke="#121014" strokeWidth={6} />
          <polygon points={pts} fill="#fff" stroke="none" transform={`translate(${-Math.cos(a) * 8} ${-Math.sin(a) * 8})`} />
        </svg>
        <div style={{ position: "absolute", left: cx - rx * 0.78, top: cy - ry * 0.8, width: rx * 1.56, height: ry * 1.6, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <BubbleText t={t} line={line} parts={parts} size={size} w={rx * 1.5} />
        </div>
      </div>
    );
  };
// bulle d'origine vidée (cases) + son nouveau texte
const CaseBubble: React.FC<{ t: number; n: number; at: number; line: number; parts: number[]; size?: number; dy?: number; on: boolean }> = ({ t, n, at, line, parts, size = 31, dy = 0, on }) => {
  const p = PANELS[`c${n}`], b = bulles[String(n) as "1" | "2" | "3" | "4"];
  const k = t < at ? 1 : 1 + 0.05 * pulse(t, at + 0.08, 0.08);
  const [x0, y0, x1, y1] = b.body;
  if (!on && t < at - 0.3) return null;                // bulle pas encore lue : cachée tant que la case n'est pas au point
  return (
    <div style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, pointerEvents: "none", filter: on ? "none" : "brightness(0.42) saturate(0.7) blur(2px)" }}>
      <Img src={staticFile(`episode1/bulle-${n}.png`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", transformOrigin: `${((x0 + x1) / 2) * S}px ${((y0 + y1) / 2) * S}px`, transform: `scale(${k})` }} />
      <div style={{ position: "absolute", left: x0 * S, top: y0 * S + dy, width: (x1 - x0) * S, height: (y1 - y0) * S, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BubbleText t={t} line={line} parts={parts} size={size} w={(x1 - x0) * S * 0.74} keep />
      </div>
    </div>
  );
};
// onomatopée de BD
const Sfx: React.FC<{ t: number; at: number; until: number; x: number; y: number; text: string; size: number; color: string; rot?: number }> = ({ t, at, until, x, y, text, size, color, rot = -8 }) => {
  if (!show(t, at, until)) return null;
  const k = easeOutBack(seg(t, at, at + 0.2));
  return <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%, -50%) rotate(${rot}deg) scale(${lerp(2.2, 1, k)})`, opacity: clamp(seg(t, at, at + 0.06) * 2) * (1 - seg(t, until - 0.15, until)),
    fontFamily: "Poppins", fontWeight: 700, fontStyle: "italic", fontSize: size, letterSpacing: -1, color, WebkitTextStroke: "3px #121014", paintOrder: "stroke fill", textShadow: "5px 6px 0 #121014", whiteSpace: "nowrap" }}>{text}</div>;
};

const Page: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, TITLE[0] + 0.2, ENDS + 0.4)) return null;
  const { cx, cy, z, focus, speed } = camera(t);
  const talk = (envAt(t) + envAt(t - 0.03)) / 2;
  return (
    <div style={{ position: "absolute", inset: 0, filter: `blur(${speed * 6}px)` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 6000, transformOrigin: "0 0", transform: `translate(${540 - cx * z}px, ${960 - cy * z}px) scale(${z})` }}>
        {Object.entries(PANELS).map(([id, p]) => {
          const on = id === focus;
          const bump = on && id.startsWith("v") ? 1 + talk * 0.012 : 1;
          return (
            <div key={id} style={{ position: "absolute", left: p.x, top: p.y, width: p.w, height: p.h, overflow: "hidden", border: "6px solid #121014", boxSizing: "border-box", boxShadow: on ? `0 0 0 3px ${GOLD}, 0 30px 80px rgba(0,0,0,0.7)` : "0 20px 50px rgba(0,0,0,0.5)",
              filter: on ? "none" : "brightness(0.42) saturate(0.7) blur(2px)" }}>
              <Img src={staticFile(`episode1/${p.img}`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${bump * (1 + 0.03 * Math.sin(t * 0.4 + p.y))})` }} />
            </div>
          );
        })}
        {/* bulles d'origine, vidées puis réécrites */}
        <CaseBubble t={t} n={1} at={PH[1][0]} line={1} parts={[0, 5]} size={38} on={focus === "c1"} />
        <CaseBubble t={t} n={2} at={PH[2][0]} line={2} parts={[0, 4, 9]} size={40} on={focus === "c2"} />
        <CaseBubble t={t} n={3} at={PH[3][0]} line={3} parts={[0, 4, 9]} size={38} on={focus === "c3"} />
        <CaseBubble t={t} n={4} at={PH[8][0]} line={8} parts={[0, 3]} size={38} on={focus === "c4"} />
        {/* la lettre sur mesure brille dans la main du recruteur */}
        {show(t, T.sur - 0.2, SHOT_T[3] + 0.4) && (
          <div style={{ position: "absolute", left: 600, top: ROWS.c3 + 560, width: 300, height: 150, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(242,184,192,0.75), rgba(217,130,139,0) 70%)", mixBlendMode: "screen", opacity: seg(t, T.sur - 0.2, T.sur + 0.2) }}>
            <div style={{ position: "absolute", left: 160, top: 22, padding: "4px 12px", borderRadius: 12, background: PINK, color: "#fff", fontFamily: "Poppins", fontWeight: 700, fontSize: 26, transform: `rotate(-12deg) scale(${go(t, T.sur - 0.1, T.sur + 0.2, 0, 1)})` }}>mm.</div>
          </div>
        )}
        {/* gros plans : bulles dessinées */}
        <DrawnBubble t={t} at={PH[4][0] - 0.05} until={SHOT_T[4] + 0.3} cx={250} cy={ROWS.r4 + 140} rx={170} ry={88} tail={[300, ROWS.r4 + 330]} line={4} size={46} />
        <Sfx t={t} at={T.lundi + 0.05} until={SHOT_T[4] + 0.3} x={440} y={ROWS.r4 + 560} text="!?" size={130} color="#E0464E" rot={10} />
        <DrawnBubble t={t} at={PH[5][0] - 0.05} until={SHOT_T[5] + 0.3} cx={816} cy={ROWS.r4 + 150} rx={232} ry={118} tail={[800, ROWS.r4 + 340]} line={5} size={33} />
        <DrawnBubble t={t} at={PH[6][0] - 0.05} until={SHOT_T[6] + 0.3} cx={290} cy={ROWS.r5 + 140} rx={220} ry={105} tail={[-40, ROWS.r5 + 330]} line={6} size={36} />
        <Sfx t={t} at={PH[6][0] + 0.9} until={SHOT_T[6] + 0.3} x={170} y={ROWS.r5 + 610} text="GLUP." size={78} color={GOLD_L} rot={-12} />
        <DrawnBubble t={t} at={PH[7][0] - 0.05} until={SHOT_T[7] + 0.3} cx={816} cy={ROWS.r5 + 145} rx={236} ry={118} tail={[760, ROWS.r5 + 330]} line={7} parts={[0, 2]} size={36} />
        <DrawnBubble t={t} at={PH[9][0] - 0.05} until={SHOT_T[9] + 0.3} cx={280} cy={ROWS.r7 + 130} rx={200} ry={92} tail={[-40, ROWS.r7 + 300]} line={9} size={38} />
        <Sfx t={t} at={PH[10][0] + 0.1} until={T.trente5 - 0.05} x={820} y={ROWS.r7 + 150} text="SOUPIR…" size={64} color={CREAM} rot={8} />
        <DrawnBubble t={t} at={T.trente5 - 0.25} until={ENDS + 0.4} cx={800} cy={ROWS.r7 + 135} rx={210} ry={96} tail={[790, ROWS.r7 + 320]} line={10} size={42} />
      </div>
    </div>
  );
};

// ─── hook : gros plan arrogant ───
const Hook: React.FC<{ t: number }> = ({ t }) => {
  if (t > TITLE[0] + 0.35) return null;
  const talk = (envAt(t) + envAt(t - 0.03)) / 2;
  const z = lerp(1.18, 1.0, ease(t, 0, 0.7)) * (1 + talk * 0.015);
  return (
    <>
      <div style={{ position: "absolute", left: 0, top: 110, width: 1080, height: 1690, overflow: "hidden", border: "6px solid #121014", boxSizing: "border-box", boxShadow: `0 0 0 3px ${GOLD}` }}>
        <Img src={staticFile("episode1/visage-2.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transformOrigin: "50% 40%", transform: `scale(${z})` }} />
      </div>
      <DrawnBubble t={t} at={0.55} until={TITLE[0] + 0.35} cx={540} cy={330} rx={360} ry={150} tail={[600, 560]} line={0} size={60} />
    </>
  );
};
// ─── carton-titre ───
const TitleCard: React.FC<{ t: number }> = ({ t }) => {
  if (!show(t, TITLE[0], TITLE[1] + 0.05)) return null;
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 45%, #2A1230 0%, #120A16 60%, #07040A 100%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <Fan size={200} />
      <Words t={t} gold items={[["LES", TITLE[0] + 0.15], ["SUPER-RECRUES", TITLE[0] + 0.3]]} style={{ position: "relative", left: 0, right: 0, fontFamily: DECO, fontSize: 100 }} />
      <Words t={t} items={[["ÉPISODE", TITLE[0] + 0.6], ["1", TITLE[0] + 0.7]]} style={{ position: "relative", left: 0, right: 0, fontFamily: JOSEFIN, fontWeight: 700, fontSize: 44, letterSpacing: 14, color: CREAM }} />
      <Words t={t} items={[["L'ENTRETIEN", TITLE[0] + 0.85]]} style={{ position: "relative", left: 0, right: 0, fontFamily: DECO, fontSize: 92, color: PINK_L }} />
    </div>
  );
};
// ─── fin : il rit, « À suivre… », 1re lettre offerte, lien en bio, logo ───
const EndScene: React.FC<{ t: number }> = ({ t }) => {
  if (t < ENDS - 0.05) return null;
  const k = ease(t, ENDS, ENDS + 0.5);
  const logo = seg(t, T.end + 0.6, T.end + 1.1);
  return (
    <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 35%, #2A1230 0%, #120A16 60%, #07040A 100%)" }}>
      <div style={{ position: "absolute", left: 540 - 250, top: 190, width: 500, height: 783, border: "6px solid #121014", boxSizing: "border-box", boxShadow: `0 0 0 3px ${GOLD}, 0 30px 80px rgba(0,0,0,0.7)`, overflow: "hidden",
        transform: `rotate(${lerp(-8, -2, k) + Math.sin(t * 9) * 0.8 * (1 - seg(t, ENDS + 1.6, ENDS + 2))}deg) scale(${lerp(0.6, 1, easeOutBack(k))})`, opacity: clamp(k * 2) }}>
        <Img src={staticFile("episode1/visage-6.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </div>
      <Sfx t={t} at={ENDS + 0.15} until={99} x={850} y={250} text="HA HA !" size={70} color={GOLD_L} rot={12} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center" }}>
        <div style={{ transform: `rotate(-6deg) scale(${lerp(2.4, 1, easeOutBack(seg(t, ENDS + 0.45, ENDS + 0.65)))})`, opacity: clamp(seg(t, ENDS + 0.45, ENDS + 0.55) * 2), padding: "6px 40px 0", border: `10px double ${PINK}`, borderRadius: 16, background: "rgba(10,5,10,0.75)", fontFamily: DECO, fontSize: 84, color: PINK_L, textShadow: `0 0 30px ${PINK}` }}>À SUIVRE…</div>
      </div>
      <Words t={t} items={wordTimes(11).slice(0, 7).map(([w, at]) => [w.toUpperCase(), at])} style={{ top: 1050, fontFamily: JOSEFIN, fontWeight: 700, fontSize: 44, letterSpacing: 4, color: CREAM, lineHeight: 1.25 }} />
      {t >= T.offerte - 0.3 && <div style={{ position: "absolute", left: 0, right: 0, top: 1200, display: "flex", justifyContent: "center", transform: `scale(${go(t, T.offerte - 0.3, T.offerte + 0.05, 0.3, 1)})` }}><DecoPill icon={Gift} label="Ta 1re lettre est offerte" pink /></div>}
      {t >= T.lien - 0.15 && <div style={{ position: "absolute", left: 540 - 260, top: 1336, transform: `scale(${go(t, T.lien - 0.15, T.bio + 0.05, 0, 1)})` }}><GlossPill w={520} h={110} style={{ boxShadow: `0 30px 80px rgba(0,0,0,0.7), 0 0 0 2px ${GOLD}` }}><span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff" }}>Lien en bio <span style={{ color: PINK_L }}>↑</span></span></GlossPill></div>}
      {logo > 0 && (
        <div style={{ position: "absolute", inset: 0, background: `rgba(7,4,10,${logo})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 30, zIndex: 5 }}>
          <div style={{ opacity: logo }}><Fan size={170} /></div>
          <Img src={staticFile("logo-mymotiv.png")} style={{ width: 560, opacity: logo, filter: `drop-shadow(0 0 24px ${PINK})` }} />
          <div style={{ fontFamily: JOSEFIN, fontWeight: 700, fontSize: 36, letterSpacing: 6, color: CREAM, opacity: seg(t, T.end + 0.9, T.end + 1.2), textAlign: "center", lineHeight: 1.5 }}>AVEC MYMOTIV, POSTULEZ.<br />ET FAITES-VOUS RECRUTER.</div>
        </div>
      )}
    </div>
  );
};
const Tags: React.FC<{ t: number }> = ({ t }) => (
  <>
    {t < T.end + 0.6 && <div style={{ position: "absolute", left: 66, top: 150, zIndex: 31, display: "flex", alignItems: "center", gap: 10, fontFamily: JOSEFIN, fontWeight: 700, fontSize: 24, letterSpacing: 5, color: "rgba(245,236,217,0.85)", textShadow: "0 2px 8px #000" }}>
      <span style={{ width: 10, height: 10, background: GOLD, transform: "rotate(45deg)" }} />MISE EN SCÈNE · PARODIE
    </div>}
    {show(t, PH[6][0], ENDS) && <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", zIndex: 31, fontFamily: "Open Sans", fontSize: 26, color: "rgba(245,236,217,0.85)", textShadow: "0 2px 8px #000", opacity: seg(t, PH[6][0], PH[6][0] + 0.3) }}>* temps mesuré : 27 à 35 s par lettre</div>}
  </>
);
const Grain: React.FC<{ frame: number }> = ({ frame }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, zIndex: 45, opacity: 0.07, mixBlendMode: "overlay", pointerEvents: "none" }}>
    <filter id="grainE"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={frame % 12} /><feColorMatrix type="saturate" values="0" /></filter>
    <rect width={1080} height={1920} filter="url(#grainE)" />
  </svg>
);

export const EpisodeEntretien: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig();
  const t = frame / fps;
  const r = rng(frame + 9);
  const hits: [number, number][] = [[T.moi, 0.6], [T.lundi, 1.3], [PH[6][0] + 0.9, 0.5], [T.trente5, 0.5], [ENDS + 0.5, 1]];
  const shake = hits.reduce((s, [h, g]) => s + g * pulse(t, h + 0.04, 0.06), 0) * 10;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0810", overflow: "hidden" }}>
      <Audio src={staticFile("audio/episode1.wav")} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 40%, #241030 0%, #0B0810 70%)" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.18, backgroundImage: "radial-gradient(rgba(217,178,111,0.5) 1.5px, rgba(0,0,0,0) 1.6px)", backgroundSize: "18px 18px" }} />
      <div style={{ position: "absolute", inset: 0, transform: `translate(${(r() - 0.5) * shake}px, ${(r() - 0.5) * shake}px)` }}>
        <Hook t={t} />
        <Page t={t} />
        <TitleCard t={t} />
        <EndScene t={t} />
      </div>
      <div style={{ position: "absolute", inset: 0, zIndex: 29, pointerEvents: "none", background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.5) 100%)" }} />
      <Tags t={t} />
      <DecoFrame o={0.55} />
      <Blinds t={t} at={TITLE[0]} />
      <Blinds t={t} at={TITLE[1]} />
      <Blinds t={t} at={ENDS} />
      <Grain frame={frame} />
      <Flash k={pulse(t, T.lundi, 0.05) * 0.25 + pulse(t, ENDS + 0.5, 0.06) * 0.3} />
    </AbsoluteFill>
  );
};
