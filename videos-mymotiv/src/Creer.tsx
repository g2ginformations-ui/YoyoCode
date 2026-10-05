// « Créer ma lettre » (20 s, 60 i/s) — transposition MyMotiv de la référence « Créer → publier » :
// logo qui se forme sur fond clair → bouton en verre « + Créer ma lettre » → bascule dans le noir avec une lueur qui suit la main →
// menu en verre (4 options, surlignage qui glisse) → l'option se déforme en carte 3D → fenêtre « Créer ma lettre » (lien tapé) →
// effet « jello » vers « Génération de ta lettre… » (barres) → pastille → cercle ✓ qui rebondit « Ta lettre est prête ! » + bulles →
// flash blanc → slogan tapé → appel à l'action.
// React + Tailwind CSS + icônes Lucide ; la physique « spring » (raideur 300, amortissement 20) est celle de Framer Motion,
// calculée image par image avec spring() de Remotion pour un rendu vidéo net et déterministe.
import React from "react";
import { AbsoluteFill, Audio, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { AlignLeft, CalendarCheck, Check, FileUp, Link2, PenLine, Search, Sparkles, X } from "lucide-react";
import "./tailwind.css";
import "./fonts";

const PINK = "#D9828B", PINK_L = "#F2B8C0", VIOLET = "#8b5cf6";
const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

// Icône MyMotiv : « mm. » sur fond rose (le monogramme de la marque)
const AppIcon: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <div style={{ width: size, height: size, borderRadius: size * 0.26, background: `linear-gradient(135deg, ${PINK_L}, ${PINK})`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 ${size * 0.08}px ${size * 0.3}px rgba(217,130,139,0.55)`, ...style }}>
    <span style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: size * 0.44, color: "#fff", letterSpacing: -size * 0.02, transform: `translateY(-${size * 0.03}px)` }}>mm.</span>
  </div>
);

// Temps clés (s)
const T = { logo: 0.35, word: 1.0, btn: 2.4, hover: 3.3, click: 3.75, dark: 4.15, menu: 4.45, pick: 6.0, card: 6.05, modal: 7.1, type0: 7.75, type1: 8.95, genClick: 9.6, jello: 9.85, bars: 10.35, pill: 12.75, circle: 13.15, done: 13.75, bubbles: 14.05, flash: 15.3, tag0: 15.6, tag1: 17.8, cta: 18.15, end: 20.0 };

export const Creer: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  // ressort « Framer Motion » : stiffness 300, damping 20 (et une version plus massive pour le ✓)
  const sp = (t0: number, cfg = { stiffness: 300, damping: 20 }) => spring({ frame: Math.max(0, (t - t0) * fps), fps, config: { ...cfg, mass: 1 } });
  const dark = t >= T.dark && t < T.flash;
  const toDark = seg(t, T.click + 0.1, T.dark + 0.25), toLight = seg(t, T.flash, T.flash + 0.2);

  // ───────── trajectoire de la main (curseur) ─────────
  const KEYS: [number, number, number][] = [[2.9, 1150, 1500], [3.55, 600, 985], [3.75, 590, 990], [4.6, 760, 1300], [5.0, 520, 775], [5.55, 530, 900], [6.1, 540, 905], [6.7, 900, 1350], [9.0, 900, 1350], [9.4, 712, 1085], [9.6, 712, 1085], [10.6, 980, 1500], [15.3, 980, 1500]];
  let cx = KEYS[0][1], cy = KEYS[0][2];
  for (let i = 0; i < KEYS.length - 1; i++) { const [a0, x0, y0] = KEYS[i], [a1, x1, y1] = KEYS[i + 1]; if (t >= a0 && t < a1) { const k = easeInOut(seg(t, a0, a1)); cx = lerp(x0, x1, k); cy = lerp(y0, y1, k); } else if (t >= a1) { cx = x1; cy = y1; } }
  const pressing = [T.click, T.pick, T.genClick].some((c) => t >= c && t < c + 0.14);
  const cursorOn = (t > 2.9 && t < T.dark - 0.05) || (t > T.menu + 0.1 && t < 10.8);
  // la lueur suit la main avec un léger retard (lissage)
  const lag = (dt: number) => { let gx = cx, gy = cy; const tt = t - dt; for (let i = 0; i < KEYS.length - 1; i++) { const [a0, x0, y0] = KEYS[i], [a1, x1, y1] = KEYS[i + 1]; if (tt >= a0 && tt < a1) { const k = easeInOut(seg(tt, a0, a1)); gx = lerp(x0, x1, k); gy = lerp(y0, y1, k); } } return [gx, gy]; };
  const [gx, gy] = t < 10.8 ? lag(0.18) : [540, 960 + Math.sin(t * 1.4) * 60];

  // ───────── styles « verre » ─────────
  const glassDark = "border border-white/10 bg-white/[0.06] backdrop-blur-md shadow-2xl";
  const glassLight = "border border-black/5 bg-white/60 backdrop-blur-md";

  return (
    <AbsoluteFill className="overflow-hidden" style={{ fontFamily: "Poppins", background: "#f3f1f2" }}>
      {/* ───── fond clair → noir (cercle qui s'ouvre depuis le bouton) ───── */}
      {t >= T.click && <div className="absolute inset-0" style={{ background: "#07060a", clipPath: `circle(${lerp(0, 160, easeInOut(toDark))}% at 540px 990px)`, opacity: 1 - toLight }} />}
      {/* lueur rose/violette qui suit la souris */}
      {dark && <div className="absolute rounded-full" style={{ left: gx - 520, top: gy - 520, width: 1040, height: 1040, background: `radial-gradient(circle, rgba(217,130,139,0.55) 0%, rgba(139,92,246,0.35) 35%, rgba(7,6,10,0) 70%)`, filter: "blur(40px)", opacity: seg(t, T.dark, T.dark + 0.4) }} />}
      {dark && <div className="absolute rounded-full" style={{ left: 540 - 700, top: 960 - 700, width: 1400, height: 1400, background: "radial-gradient(circle, rgba(59,70,200,0.18), rgba(7,6,10,0) 65%)", filter: "blur(30px)" }} />}

      {/* ───── 1. le logo se forme (formes qui fusionnent), puis le nom se défloute ───── */}
      {t < T.btn + 0.2 && (() => {
        const k = sp(T.logo), word = seg(t, T.word, T.word + 0.5), out = seg(t, T.btn - 0.3, T.btn);
        return (
          <div className="absolute inset-0 flex items-center justify-center" style={{ opacity: 1 - out, transform: `translateY(${-out * 40}px)` }}>
            {/* trois pétales roses qui tournent et se rejoignent en un point */}
            <div className="relative" style={{ width: 150, height: 150, marginRight: lerp(0, 24, word) }}>
              {[0, 1, 2].map((i) => (
                <div key={i} className="absolute rounded-full" style={{ left: 45, top: 45, width: 60, height: 60, background: i === 1 ? PINK_L : PINK, transform: `rotate(${i * 120 + (1 - k) * 220}deg) translateY(${lerp(-40, 0, seg(t, T.logo + 0.3, T.word))}px) scale(${k})`, mixBlendMode: "multiply", opacity: 1 - seg(t, T.word - 0.1, T.word + 0.15) }} />
              ))}
              <AppIcon size={150} style={{ position: "absolute", left: 0, top: 0, transform: `scale(${sp(T.word - 0.1)})` }} />
            </div>
            <div style={{ width: lerp(0, 520, easeOut(word)), overflow: "hidden" }}>
              <Img src={staticFile("logo-mymotiv.png")} style={{ width: 520, display: "block", filter: `blur(${(1 - word) * 18}px)`, opacity: word }} />
            </div>
          </div>
        );
      })()}

      {/* ───── 2. bouton en verre « + Créer ma lettre » (fond clair) ───── */}
      {t >= T.btn && t < T.dark + 0.1 && (() => {
        const k = sp(T.btn), hover = sp(T.hover), press = t >= T.click && t < T.click + 0.14 ? 0.9 : 1, out = seg(t, T.click + 0.12, T.dark);
        return (
          <div className={`absolute flex items-center gap-4 rounded-full px-14 py-8 ${glassLight}`} style={{ left: 540, top: 990, transform: `translate(-50%,-50%) scale(${k * (1 + 0.06 * hover) * press * (1 - out * 0.3)})`, boxShadow: `0 20px 60px rgba(217,130,139,${0.25 + 0.2 * hover})`, color: "#b25d68", opacity: 1 - out, filter: `blur(${out * 6}px)` }}>
            <span style={{ fontSize: 64, fontWeight: 500, lineHeight: 1 }}>+</span>
            <span style={{ fontSize: 50, fontWeight: 600, whiteSpace: "nowrap" }}>Créer ma lettre de motivation</span>
          </div>
        );
      })()}

      {/* ───── 3. menu en verre, 4 options, surlignage qui glisse ───── */}
      {t >= T.menu && t < T.card + 0.3 && (() => {
        const OPTS = [[FileUp, "Ajouter mon CV"], [Link2, "Coller le lien de l'offre"], [AlignLeft, "Choisir la longueur"], [CalendarCheck, "Ajouter ma disponibilité"]] as const;
        const hl = t < 5.0 ? 0 : t < 5.55 ? lerp(0, 1, easeInOut(seg(t, 5.0, 5.55))) : 1, out = seg(t, T.card, T.card + 0.3);
        return (
          <div className={`absolute rounded-[44px] p-6 ${glassDark}`} style={{ left: 540, top: 960, width: 760, transform: `translate(-50%,-50%) scale(${sp(T.menu)})`, opacity: 1 - out }}>
            <div className="absolute rounded-[28px]" style={{ left: 24, right: 24, top: 24 + hl * 132, height: 120, background: "rgba(217,130,139,0.22)", border: `2px solid rgba(242,184,192,0.5)`, opacity: seg(t, 4.9, 5.1) }} />
            {OPTS.map(([Icon, label], i) => (
              <div key={label} className="relative flex items-center gap-7 px-8" style={{ height: 132, opacity: sp(T.menu + 0.07 * i), transform: `translateX(${(1 - sp(T.menu + 0.07 * i)) * -40}px)` }}>
                <Icon size={50} color={i === 1 && t >= 5.3 ? PINK_L : "#e9e4ec"} strokeWidth={2} />
                <span style={{ fontSize: 42, fontWeight: 600, color: "#f3eef5" }}>{label}</span>
              </div>
            ))}
          </div>
        );
      })()}
      {/* l'option choisie se détache, pivote en 3D (flou de mouvement) et devient une carte */}
      {t >= T.card && t < T.modal + 0.15 && (() => {
        const k = sp(T.card, { stiffness: 220, damping: 16 }), flip = easeInOut(seg(t, 6.75, 7.05)), out = seg(t, T.modal - 0.05, T.modal + 0.15);
        return (
          <div className="absolute" style={{ left: 540, top: 960, perspective: 1400, opacity: 1 - out }}>
            <div className={`flex flex-col items-center justify-center gap-6 rounded-[48px] ${glassDark}`} style={{ width: lerp(712, 460, k), height: lerp(120, 360, k), transform: `translate(-50%,-50%) rotateX(${(1 - k) * 40}deg) rotateY(${(1 - k) * -30 + flip * 12}deg) rotateZ(${(1 - k) * -8}deg)`, background: flip > 0 ? `linear-gradient(135deg, rgba(217,130,139,${0.25 + 0.55 * flip}), rgba(139,92,246,${0.2 + 0.4 * flip}))` : undefined, filter: `blur(${(1 - k) * 8}px)`, boxShadow: `0 0 ${60 + 60 * flip}px rgba(217,130,139,${0.3 + 0.4 * flip})` }}>
              <Link2 size={92} color="#fff" strokeWidth={2} />
              <span style={{ fontSize: 44, fontWeight: 600, color: "#fff" }}>Lien de l'offre</span>
            </div>
          </div>
        );
      })()}

      {/* ───── 4. fenêtre « Créer ma lettre » : le lien se tape, puis « Générer » ───── */}
      {t >= T.modal && t < T.jello + 0.5 && (() => {
        const k = sp(T.modal), url = "carrieres.maison-lumen.fr/offre", n = Math.floor(url.length * seg(t, T.type0, T.type1)), press = t >= T.genClick && t < T.genClick + 0.14;
        // effet « jello » : la fenêtre se déforme en rétrécissant
        const j = seg(t, T.jello, T.jello + 0.5), wob = Math.sin(j * Math.PI * 4) * (1 - j);
        return (
          <div className={`absolute rounded-[44px] p-12 ${glassDark}`} style={{ left: 540, top: 960, width: 860, transform: `translate(-50%,-50%) scale(${k * lerp(1, 0.6, easeInOut(j))}) scaleX(${1 + wob * 0.12}) scaleY(${1 - wob * 0.12}) skewX(${wob * 6}deg)`, opacity: 1 - seg(t, T.jello + 0.3, T.jello + 0.5) }}>
            <div style={{ fontSize: 46, fontWeight: 700, color: "#fff" }}>Créer ma lettre de motivation</div>
            <div className="mt-8 flex items-center rounded-3xl px-8" style={{ height: 112, background: "rgba(255,255,255,0.08)", border: `2px solid ${t >= T.type0 ? PINK_L : "rgba(255,255,255,0.15)"}`, boxShadow: t >= T.type0 ? `0 0 30px rgba(217,130,139,0.4)` : "none" }}>
              <Link2 size={40} color={PINK_L} />
              <span className="ml-5" style={{ fontSize: 36, color: "#fff", fontFamily: "Open Sans", fontWeight: 600 }}>{n ? url.slice(0, n) : <span style={{ color: "rgba(255,255,255,0.4)" }}>Collez le lien de l'offre</span>}</span>
              {Math.floor(t * 2.5) % 2 === 0 && t < T.genClick && <span style={{ width: 4, height: 46, background: PINK_L, marginLeft: 4 }} />}
            </div>
            <div className="mt-10 flex items-center justify-end gap-10">
              <span style={{ fontSize: 38, fontWeight: 600, color: "rgba(255,255,255,0.55)" }}>Annuler</span>
              <span className="rounded-full px-12 py-5" style={{ fontSize: 40, fontWeight: 700, color: "#2e1f22", background: `linear-gradient(90deg, ${PINK}, ${PINK_L})`, boxShadow: `0 0 ${press ? 80 : 36}px ${PINK}`, transform: `scale(${press ? 0.9 : 1 + 0.04 * sp(9.3)})` }}>Générer ma lettre</span>
            </div>
          </div>
        );
      })()}

      {/* ───── 5. « Génération en cours… » : deux (trois) barres qui se remplissent ───── */}
      {t >= T.jello + 0.25 && t < T.circle + 0.1 && (() => {
        const k = sp(T.jello + 0.25, { stiffness: 260, damping: 12 }), wob = Math.sin(seg(t, T.jello + 0.25, T.jello + 0.9) * Math.PI * 3) * (1 - seg(t, T.jello + 0.25, T.jello + 0.9));
        const toPill = easeInOut(seg(t, T.pill, T.circle));
        const ROWS = [[Search, "Analyse du CV et de l'offre", T.bars, T.bars + 1.0], [PenLine, "Rédaction personnalisée", T.bars + 0.3, T.bars + 1.7], [Sparkles, "Relecture et humanisation", T.bars + 0.6, T.bars + 2.0]] as const;
        return (
          <div className={`absolute overflow-hidden ${glassDark}`} style={{ left: 540, top: 960, width: lerp(820, 180, toPill), height: lerp(470, 180, toPill), borderRadius: lerp(44, 90, toPill), transform: `translate(-50%,-50%) scale(${k}) scaleX(${1 + wob * 0.1}) scaleY(${1 - wob * 0.1}) rotate(${wob * -3}deg)`, background: toPill > 0.6 ? `rgba(217,130,139,${(toPill - 0.6) * 1.5})` : undefined }}>
            <div className="p-12" style={{ opacity: 1 - seg(t, T.pill, T.pill + 0.2) }}>
              <div className="flex items-center justify-between"><span style={{ fontSize: 40, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Génération de ta lettre…</span><X size={44} color="rgba(255,255,255,0.7)" /></div>
              {ROWS.map(([Icon, label, a, b]) => { const p = easeInOut(seg(t, a, b)), ok = p >= 1; return (
                <div key={label} className="mt-9 flex items-center gap-6">
                  <Icon size={42} color={PINK_L} />
                  <div className="flex-1">
                    <div style={{ fontSize: 28, color: "rgba(255,255,255,0.75)", marginBottom: 10, whiteSpace: "nowrap" }}>{label}</div>
                    <div className="rounded-full" style={{ height: 12, background: "rgba(255,255,255,0.12)" }}><div className="rounded-full" style={{ height: 12, width: `${p * 100}%`, background: `linear-gradient(90deg, ${VIOLET}, ${PINK_L})`, boxShadow: `0 0 18px ${PINK}` }} /></div>
                  </div>
                  <div className="flex items-center justify-center rounded-full" style={{ width: 42, height: 42, background: ok ? PINK_L : "rgba(255,255,255,0.12)", transform: `scale(${ok ? sp(b, { stiffness: 400, damping: 12 }) : 1})` }}>{ok && <Check size={28} color="#2e1f22" strokeWidth={3} />}</div>
                </div>); })}
            </div>
          </div>
        );
      })()}

      {/* ───── 6. le cercle ✓ (rebond massif), « Lettre prête !! », bulles ───── */}
      {t >= T.circle && t < T.flash + 0.2 && (() => {
        const k = spring({ frame: Math.max(0, (t - T.circle) * fps), fps, config: { stiffness: 180, damping: 7, mass: 1.4 } }), pulse = 1 + 0.03 * Math.sin((t - T.circle) * 6);
        return <>
          <div className="absolute rounded-full" style={{ left: 540 - 300, top: 900 - 300, width: 600, height: 600, background: `radial-gradient(circle, rgba(242,184,192,${0.5 * k}), rgba(217,130,139,0) 65%)`, filter: "blur(20px)" }} />
          <div className="absolute flex items-center justify-center rounded-full" style={{ left: 540 - 130, top: 900 - 130, width: 260, height: 260, background: `linear-gradient(135deg, ${PINK_L}, ${PINK})`, boxShadow: `0 0 80px ${PINK}, inset 0 6px 20px rgba(255,255,255,0.5)`, transform: `scale(${k * pulse})` }}>
            <Check size={150} color="#fff" strokeWidth={3.5} style={{ transform: `scale(${sp(T.circle + 0.15, { stiffness: 400, damping: 10 })}) rotate(${(1 - sp(T.circle + 0.15)) * -40}deg)` }} />
          </div>
          {/* éclats en cercle au moment du rebond */}
          {Array.from({ length: 12 }, (_, i) => { const q = seg(t, T.circle + 0.1, T.circle + 0.7), a = (i / 12) * Math.PI * 2; return q > 0 && q < 1 && <div key={i} className="absolute rounded-full" style={{ left: 540 + Math.cos(a) * (150 + 220 * easeOut(q)) - 8, top: 900 + Math.sin(a) * (150 + 220 * easeOut(q)) - 8, width: 16, height: 16, background: i % 2 ? PINK_L : "#fff", opacity: 1 - q }} />; })}
          <div className="absolute w-full text-center" style={{ top: 1110, fontSize: 64, fontWeight: 700, color: "#fff", opacity: sp(T.done), transform: `translateY(${(1 - sp(T.done)) * 30}px)`, textShadow: `0 0 30px ${PINK}` }}>Ta lettre est prête !</div>
          {/* bulles : le logo de l'entreprise trouvé + la lettre */}
          <div className="absolute flex items-center justify-center rounded-full" style={{ left: 540 + 120, top: 900 - 200, width: 130, height: 130, background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.4)", transform: `scale(${sp(T.bubbles, { stiffness: 400, damping: 14 })})` }}><AppIcon size={96} /></div>
          <div className="absolute flex items-center gap-3 rounded-full px-7 py-4" style={{ left: 540, top: 1210, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)", transform: `translateX(-50%) scale(${sp(T.bubbles + 0.2, { stiffness: 400, damping: 14 })})`, transformOrigin: "50% 50%" }}><Check size={30} color={PINK_L} strokeWidth={3} /><span style={{ fontSize: 30, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>Logo de l'entreprise ajouté</span></div>
        </>;
      })()}

      {/* ───── 7. flash blanc, slogan tapé, appel à l'action ───── */}
      {t >= T.flash && t < T.flash + 0.25 && <div className="absolute inset-0" style={{ background: `rgba(255,255,255,${1 - seg(t, T.flash + 0.05, T.flash + 0.25)})` }} />}
      {t >= T.tag0 && (() => {
        const full = "Avec MyMotiv, postulez. Et faites-vous recruter.", n = Math.floor(full.length * seg(t, T.tag0, T.tag1)), shown = full.slice(0, n), cut = full.indexOf("Et faites");
        const cta = sp(T.cta), pulse = 1 + 0.04 * Math.max(0, Math.sin((t - T.cta - 0.6) * 6));
        return <>
          <div className="absolute w-full text-center" style={{ top: lerp(880, 700, easeInOut(seg(t, T.cta - 0.2, T.cta + 0.3))), fontSize: 64, fontWeight: 500, color: "#6b6670", lineHeight: 1.35, padding: "0 60px", boxSizing: "border-box" }}>
            {shown.slice(0, Math.min(n, cut))}{n > cut && <br />}{n > cut && <span style={{ color: PINK, fontWeight: 700 }}>{shown.slice(cut)}</span>}
            {t < T.cta && Math.floor(t * 2.5) % 2 === 0 && <span style={{ display: "inline-block", width: 4, height: 64, background: "#6b6670", marginLeft: 4, verticalAlign: "middle" }} />}
          </div>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: 540 - 200, top: 1000, width: 400, opacity: cta, transform: `scale(${lerp(0.8, 1, cta)})` }} />
          <div className={`absolute flex items-center gap-4 rounded-full px-12 py-7 ${glassLight}`} style={{ left: 540, top: 1260, transform: `translate(-50%,-50%) scale(${sp(T.cta + 0.3) * pulse})`, boxShadow: `0 20px 60px rgba(217,130,139,0.45)`, background: `linear-gradient(90deg, ${PINK}, ${PINK_L})` }}>
            <span style={{ fontSize: 48, fontWeight: 700, color: "#2e1f22", whiteSpace: "nowrap" }}>Ta 1re lettre est offerte</span>
          </div>
          <div className="absolute w-full text-center" style={{ top: 1380, fontSize: 40, fontWeight: 600, color: "#8a838f", opacity: sp(T.cta + 0.6) }}>Lien en bio</div>
        </>;
      })()}

      {/* ───── la main (curseur) ───── */}
      {cursorOn && (
        <svg width={90} height={100} viewBox="0 0 24 26" style={{ position: "absolute", left: cx - 30, top: cy - 6, transform: `scale(${pressing ? 0.85 : 1})`, filter: `drop-shadow(0 4px 10px rgba(0,0,0,0.45))`, opacity: t < 3.05 ? seg(t, 2.9, 3.05) : 1 }}>
          <path d="M9 11V4.5a1.5 1.5 0 0 1 3 0V10m0-.5V3.5a1.5 1.5 0 0 1 3 0V10m0-1.5a1.5 1.5 0 0 1 3 0V12m0-1.5a1.5 1.5 0 0 1 3 0V16a7 7 0 0 1-7 7h-1.5a7 7 0 0 1-5.6-2.8L3 16.5a1.6 1.6 0 0 1 2.4-2.1L9 17" fill="#fff" stroke="#1a1720" strokeWidth={1.2} strokeLinejoin="round" />
        </svg>
      )}
      {[T.click, T.pick, T.genClick].map((c) => t >= c && t < c + 0.4 && <div key={c} className="absolute rounded-full" style={{ left: cx - 20 - 90 * seg(t, c, c + 0.4), top: cy - 20 - 90 * seg(t, c, c + 0.4), width: 40 + 180 * seg(t, c, c + 0.4), height: 40 + 180 * seg(t, c, c + 0.4), border: `4px solid rgba(${c === T.click ? "217,130,139" : "255,255,255"},${1 - seg(t, c, c + 0.4)})` }} />)}
      <Audio src={staticFile("audio/creer.wav")} />
    </AbsoluteFill>
  );
};
