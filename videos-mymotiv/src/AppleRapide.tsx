// « 3 étapes, 30 secondes » (16,5 s, 60 i/s, 9:16) — motion design style Apple (skill apple-motion) sur fond uni noir clair,
// orienté solution et rapidité, sans voix, sur la musique de l'utilisateur (percussions sur le clic « Générer »).
// Slogan d'entrée → « 3 étapes. 30 secondes* » → pilules Ton CV ✓ / Le lien de l'offre ✓ / Générer (clic du curseur
// MyMotiv) → les pilules se fondent en un anneau chrono 0 → 30 s* (façon Apple Watch) → l'anneau devient la carte de la
// lettre, le logo de l'entreprise se pose → la lettre part en courbe, « Envoyée ✓ » → « Ta 1re lettre est offerte ·
// Sans inscription » → logo, lien en bio.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, bounce, curve, go, press, soft } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import { Pointer, Ripple, SHOT } from "./Lien";
import "./fonts";

const D = { bg: "#1C1C1E", card: "#2C2C2E", line: "#3A3A3C", ink: "#F5F5F7", soft: "#8E8E93" };
const CX = 540, CY = 860;
export const RAPIDE_DUR = 16.5;
const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(",")})`;
};
// Temps clés (s)
export const R = { etapes: 2.5, cv: 3.1, lien: 3.9, gen: 4.7, clic: 5.6, ring: 5.9, pret: 8.4, logo: 9.2, envoi: 10.7,
  envoyee: 11.3, offerte: 12.5, fin: 14.3 };
const STEPS = [["📄", "Ton CV", R.cv], ["🔗", "Le lien de l'offre", R.lien]] as const;

export const AppleRapide: React.FC<{ audio?: string }> = ({ audio = "audio/apple-rapide.wav" }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;

  // ── pilules des étapes (y fixes), puis aspirées vers le centre au clic ──
  const suck = go(t, R.clic + 0.1, R.ring + 0.1, 0, 1);
  const stepY = [640, 820];
  const genY = 1000;

  // curseur : arrive en courbe sur « Générer », clic
  const [px, py] = curve(go(t, R.gen + 0.3, R.clic - 0.15, 0, 1), [990, 1500], [CX + 120, genY + 10], [1000, 1080]);
  const pHover = seg(t, R.clic - 0.3, R.clic - 0.12), pPress = Math.exp(-Math.pow((t - R.clic) / 0.08, 2));
  const pO = seg(t, R.gen + 0.25, R.gen + 0.4) * (1 - seg(t, R.clic + 0.2, R.clic + 0.35));

  // ── anneau chrono → carte de la lettre ──
  const ringK = go(t, R.ring, R.ring + 0.4, 0, 1);
  const prog = seg(t, R.ring + 0.2, R.pret - 0.2);
  const sec = Math.round(30 * prog);
  const cw = bounce(t, [[R.pret - 0.05, 420], [R.pret + 0.35, 720]]), ch = bounce(t, [[R.pret - 0.05, 420], [R.pret + 0.35, 900]]);
  const cr = bounce(t, [[R.pret - 0.05, 210], [R.pret + 0.35, 52]]);
  const ringO = t < R.pret ? ringK : 0;
  // la lettre part (envoi) : courbe vers le haut à droite, rapetisse
  const ek = go(t, R.envoi, R.envoi + 0.55, 0, 1);
  const [ex, ey] = curve(clamp(ek), [CX, CY], [1300, -300], [CX + 80, CY + 260]);
  const es = lerp(1, 0.15, clamp(ek)), erot = lerp(0, 18, clamp(ek));
  const cardShow = t > R.pret - 0.05 && t < R.envoi + 0.6;

  // logo de l'entreprise
  const lk = go(t, R.logo - 0.45, R.logo, 0, 1);
  const [lx, ly] = curve(clamp(lk), [1180, 240], [CX - 360 + 78, CY - 450 + 76], [900, 280]);

  // pilule finale
  const pw = bounce(t, [[R.offerte - 0.05, 0], [R.offerte + 0.35, 860], [R.fin, 860], [R.fin + 0.35, 220], [R.fin + 0.55, 220], [R.fin + 0.85, 0]]);
  const ph = bounce(t, [[R.offerte - 0.05, 0], [R.offerte + 0.35, 200], [R.fin, 200], [R.fin + 0.35, 220], [R.fin + 0.55, 220], [R.fin + 0.85, 0]]);
  const rot = bounce(t, [[R.fin - 0.6, 0], [R.fin - 0.25, 2.5], [R.fin + 0.1, -1.5], [R.fin + 0.4, 0]]);
  const endK = soft(t, R.fin + 0.7, fps);

  return (
    <AbsoluteFill style={{ background: D.bg, fontFamily: "Poppins", color: D.ink }}>
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${rot}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
        {/* ── slogan d'entrée ── */}
        {t < 2.6 && (
          <div style={{ position: "absolute", left: 40, right: 40, top: 650, textAlign: "center", fontSize: 100, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2 }}>
            <TextDrop t={t} t0={0} text="Avec MyMotiv," out={2.3} stagger={0.06} dur={0.3} /><br />
            <TextDrop t={t} t0={0.3} text="postulez." out={2.3} dur={0.3} /><br />
            <span style={{ color: PINK }}><TextDrop t={t} t0={0.85} text="Et faites-vous" out={2.3} stagger={0.06} /><br /><TextDrop t={t} t0={1.1} text="recruter." out={2.3} /></span>
          </div>
        )}

        {/* ── titres ── */}
        {t > R.etapes && t < R.pret && (
          <div style={{ position: "absolute", left: 40, right: 40, top: 220, textAlign: "center", fontSize: 76, fontWeight: 700, lineHeight: 1.12 }}>
            <TextDrop t={t} t0={R.etapes} text="3 étapes." out={R.pret - 0.25} /><br />
            <span style={{ color: PINK }}><TextDrop t={t} t0={R.etapes + 0.3} text="30 secondes*." out={R.pret - 0.25} /></span>
          </div>
        )}
        {t > R.pret && t < R.envoi + 0.2 && (
          <div style={{ position: "absolute", left: 40, right: 40, top: 150, textAlign: "center", fontSize: 66, fontWeight: 700, lineHeight: 1.12 }}>
            <TextDrop t={t} t0={R.pret + 0.1} text="Ta lettre est prête." out={R.envoi} /><br />
            <span style={{ color: PINK }}><TextDrop t={t} t0={R.logo - 0.15} text="Sur-mesure, avec son logo." out={R.envoi} /></span>
          </div>
        )}
        {t > R.envoi + 0.1 && t < R.offerte && (
          <div style={{ position: "absolute", left: 40, right: 40, top: 700, textAlign: "center", fontSize: 86, fontWeight: 800, lineHeight: 1.1, letterSpacing: -1 }}>
            <TextDrop t={t} t0={R.envoyee} text="Tu postules." out={R.offerte - 0.25} /><br />
            <span style={{ color: PINK }}><TextDrop t={t} t0={R.envoyee + 0.35} text="Plus vite." out={R.offerte - 0.25} /></span>
          </div>
        )}

        {/* ── étapes ── */}
        {t > R.cv - 0.05 && t < R.ring + 0.15 && STEPS.map(([icon, label, a], i) => {
          const k = go(t, a, a + 0.38, 0, 1), ok = go(t, a + 0.45, a + 0.75, 0, 1);
          const y = lerp(stepY[i], CY, suck), s = lerp(0.9, 1, k) * lerp(1, 0.2, suck);
          return (
            <div key={label} style={{ position: "absolute", left: CX - 430, top: y - 75, width: 860, height: 150, borderRadius: 75, background: mix(D.card, "#3A2A2D", ok), display: "flex", alignItems: "center", gap: 26, padding: "0 40px", transform: `translateY(${(1 - k) * 60}px) scale(${s})`, opacity: clamp(k * 2) * (1 - seg(t, R.ring - 0.1, R.ring + 0.1)) }}>
              <div style={{ width: 70, height: 70, borderRadius: 35, background: mix(D.line, PINK, ok), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700, color: "#fff", flex: "none" }}>{ok > 0.5 ? "✓" : i + 1}</div>
              <div style={{ fontSize: 46, fontWeight: 600, whiteSpace: "nowrap" }}><TextDrop t={t} t0={a + 0.1} text={label} from={[40, 0]} /></div>
              <div style={{ marginLeft: "auto", fontSize: 50 }}>{icon}</div>
            </div>
          );
        })}
        {t > R.gen - 0.05 && t < R.ring + 0.15 && (() => {
          const k = go(t, R.gen, R.gen + 0.38, 0, 1), y = lerp(genY, CY, suck);
          return (
            <div style={{ position: "absolute", left: CX - 430, top: y - 80, width: 860, height: 160, borderRadius: 80, background: PINK, color: "#fff", display: "flex", alignItems: "center", gap: 26, padding: "0 40px", boxShadow: `0 0 ${lerp(24, 80, pPress)}px rgba(217,130,139,0.55)`, transform: `translateY(${(1 - k) * 60}px) scale(${lerp(0.9, 1, k) * press(t, R.clic) * lerp(1, 0.2, suck)})`, opacity: clamp(k * 2) * (1 - seg(t, R.ring - 0.1, R.ring + 0.1)) }}>
              <div style={{ width: 70, height: 70, borderRadius: 35, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 700, flex: "none" }}>3</div>
              <div style={{ fontSize: 54, fontWeight: 700 }}><TextDrop t={t} t0={R.gen + 0.1} text="Générer" from={[40, 0]} /></div>
              <div style={{ marginLeft: "auto", fontSize: 50 }}>✨</div>
            </div>
          );
        })()}
        <Ripple x={CX} y={genY} t={t} t0={R.clic} />

        {/* ── anneau chrono ── */}
        {ringO > 0.01 && (
          <div style={{ position: "absolute", left: CX - 230, top: CY - 230, width: 460, height: 460, transform: `scale(${lerp(0.4, 1, ringO)})`, opacity: clamp(ringO * 2) }}>
            <svg width={460} height={460} viewBox="0 0 460 460" style={{ position: "absolute", inset: 0 }}>
              <circle cx={230} cy={230} r={200} fill="none" stroke={D.card} strokeWidth={34} />
              <circle cx={230} cy={230} r={200} fill="none" stroke={PINK} strokeWidth={34} strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 200 * prog} ${2 * Math.PI * 200}`} transform="rotate(-90 230 230)" style={{ filter: "drop-shadow(0 0 14px rgba(217,130,139,0.6))" }} />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <div style={{ fontSize: 150, fontWeight: 800, letterSpacing: -4, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{sec}<span style={{ fontSize: 70, color: D.soft }}> s*</span></div>
              <div style={{ fontSize: 34, fontWeight: 600, color: D.soft, marginTop: 10 }}>ta lettre s'écrit…</div>
            </div>
          </div>
        )}

        {/* ── carte de la lettre ── */}
        {cardShow && (
          <div style={{ position: "absolute", left: ex - cw / 2, top: ey - ch / 2, width: cw, height: ch, borderRadius: cr, background: D.card, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.45)", transform: `scale(${es}) rotate(${erot}deg)`, opacity: 1 - seg(t, R.envoi + 0.4, R.envoi + 0.6) }}>
            <div style={{ position: "absolute", inset: 0, opacity: seg(t, R.pret + 0.15, R.pret + 0.4) }}>
              <div style={{ position: "absolute", left: 30, top: 28, width: 96, height: 96, borderRadius: 22, border: `3px dashed ${D.line}`, opacity: 1 - seg(t, R.logo - 0.05, R.logo + 0.1) }} />
              <div style={{ position: "absolute", left: 148, top: 40, fontSize: 32, fontWeight: 700 }}>Maison Lumen</div>
              <div style={{ position: "absolute", left: 148, top: 82, fontSize: 25, fontWeight: 600, color: D.soft }}>Manager des ventes · Lyon</div>
              <div style={{ position: "absolute", left: 24, right: 24, top: 150, bottom: 24, overflow: "hidden", borderRadius: 22, background: "#fff" }}>
                <Img src={SHOT("030-lettre")} style={{ position: "absolute", left: -112 * 0.78, top: -332 * 0.78, width: 1080 * 0.78, height: 1920 * 0.78 }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110, background: "linear-gradient(rgba(255,255,255,0), #fff)" }} />
              </div>
            </div>
            {t > R.logo - 0.05 && <Img src={staticFile("company.png")} style={{ position: "absolute", left: 30, top: 28, width: 96, height: 96, borderRadius: 20, boxShadow: `0 0 ${lerp(0, 44, seg(t, R.logo, R.logo + 0.2)) * (1 - seg(t, R.logo + 0.6, R.logo + 1.2))}px ${PINK}` }} />}
          </div>
        )}
        {/* logo qui vole (avant de se poser dans la carte) */}
        {t > R.logo - 0.5 && t < R.logo - 0.03 && (
          <Img src={staticFile("company.png")} style={{ position: "absolute", left: lx - 48, top: ly - 48, width: 96, height: 96, borderRadius: 20, transform: `scale(${lerp(1.6, 1, clamp(lk))})`, opacity: seg(t, R.logo - 0.5, R.logo - 0.35) }} />
        )}
        {/* « Envoyée ✓ » */}
        {t > R.envoi + 0.3 && t < R.offerte && (
          <div style={{ position: "absolute", left: CX - 210, top: 1080, width: 420, height: 110, borderRadius: 55, background: PINK, color: "#fff", fontSize: 46, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${go(t, R.envoi + 0.35, R.envoi + 0.7, 0, 1)})`, opacity: 1 - seg(t, R.offerte - 0.25, R.offerte - 0.05) }}>Envoyée ✓</div>
        )}

        {/* ── pilule finale ── */}
        <div style={{ position: "absolute", left: CX - pw / 2, top: CY - ph / 2, width: pw, height: ph, borderRadius: ph / 2, background: PINK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 18px 50px rgba(217,130,139,0.35)", transform: `scale(${press(t, R.fin - 0.1)})` }}>
          {t > R.offerte + 0.1 && t < R.fin && <div style={{ fontSize: 56, fontWeight: 700, whiteSpace: "nowrap", opacity: 1 - seg(t, R.fin - 0.2, R.fin - 0.05) }}><TextDrop t={t} t0={R.offerte + 0.2} text="Ta 1re lettre est offerte" from={[0, 70]} /></div>}
        </div>
        {t > R.offerte + 0.4 && t < R.fin && <div style={{ position: "absolute", left: 0, right: 0, top: CY + 150, textAlign: "center", fontSize: 50, fontWeight: 600, color: D.soft }}><TextDrop t={t} t0={R.offerte + 0.6} text="Sans inscription." out={R.fin - 0.2} /></div>}
      </div>

      <Pointer x={px} y={py} hover={pHover} press={pPress} o={pO} />
      {t > R.etapes + 0.4 && t < R.pret && <div style={{ position: "absolute", left: 0, right: 0, top: 1320, textAlign: "center", fontSize: 26, color: D.soft, fontFamily: "Open Sans", opacity: seg(t, R.etapes + 0.4, R.etapes + 0.7) * (1 - seg(t, R.pret - 0.2, R.pret)) }}>* temps mesuré : 27 à 35 s par lettre</div>}

      {/* ── fin ── */}
      {t > R.fin + 0.55 && (
        <>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: CX - 300, top: 700, width: 600, opacity: endK, transform: `translateY(${(1 - endK) * 40}px) scale(${lerp(0.92, 1, endK)})` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 940, textAlign: "center", fontSize: 56, fontWeight: 700, color: PINK_L }}>
            <TextDrop t={t} t0={R.fin + 0.9} text="Lien en bio ↑" from={[0, 50]} />
          </div>
        </>
      )}
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
