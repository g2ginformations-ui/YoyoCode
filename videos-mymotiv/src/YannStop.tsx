// « Arrête d'écrire tes lettres » (≈ 31 s, 60 i/s, 9:16) — pub TikTok style Apple sur fond uni noir clair, voix de Yann
// Motiveur (voix de synthèse, public/audio/yann-stop-voix.wav, phrases horodatées dans src/data/yann-stop-phrases.json),
// musique de fond de l'utilisateur dont les percussions tombent sur le clic « Générer ».
// Hook « Arrête. » + lettre barrée → 14:00 → 17:00, 3 lettres, aucune réponse → « Moi, c'est Yann. Regarde. » → le rond rose
// devient le champ « Lien de l'offre », puis « Mon CV », puis le bouton « Générer » (clic du curseur MyMotiv) → la lettre
// arrive, chrono 0 → 30 s → « Sur-mesure », le logo de l'entreprise se pose → Plus court / Plus long → « Ta 1re lettre
// est offerte · Sans inscription » → « Lien en bio ↑ » → logo, slogan, Yann en pied.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, bounce, curve, go, press, soft } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import { Confetti, Pointer, Ripple, SHOT } from "./Lien";
import data from "./data/yann-stop-phrases.json";
import "./fonts";

// Palette « Apple, mode sombre » : fond uni noir clair, cartes un ton au-dessus
const D = { bg: "#1C1C1E", card: "#2C2C2E", line: "#3A3A3C", ink: "#F5F5F7", soft: "#8E8E93" };
const CX = 540;
const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(",")})`;
};
// Temps clés au mot près (s)
const V = {
  arrete: 0.2, arrete2: 0.95, ecrire: 1.45, motivation: 2.45, heures: 3.38, lettres: 4.2, reponse: 5.45,
  moi: 6.42, yann: 7.1, regarde: 7.6, lien: 8.34, offre: 9.45, cv: 9.87, cvMot: 10.95, generer: 11.28, clic: 12.5,
  s30: 13.36, prete: 15.75, surMesure: 16.45, avecLogo: 17.7, logo: 18.3, court: 19.8, long: 20.55, unClic: 21.1,
  offerte: 21.82, offerteMot: 23.4, sans: 24.2, bio: 25.4, slogan: 26.85, recruter: 28.75, end: data.duration,
};
// Yann (buste en bas à gauche) : expression par moment
const FACES: [number, string][] = [
  [0, "colere"], [V.heures, "stress"], [V.moi, "sourire"], [V.lien, "reflexion"], [V.clic, "surprise"], [V.logo, "choc"],
  [V.court, "sourire"], [V.offerteMot, "rire"], [V.bio, "sourire"],
];
const speaking = (t: number) => data.phrases.some((p) => t >= p.t0 && t <= p.t1);

export const YannStop: React.FC<{ audio?: string }> = ({ audio = "audio/yann-stop.wav" }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;

  // ═════ Yann ═════
  let fi = 0; FACES.forEach(([a], i) => { if (t >= a) fi = i; });
  const [faceT, face] = FACES[fi];
  const pop = bounce(t, [[faceT, 1.08], [faceT + 0.25, 1]]);
  const big = go(t, V.moi - 0.1, V.moi + 0.3, 0, 1) * (1 - go(t, V.regarde, V.regarde + 0.4, 0, 1));   // Yann se présente en grand
  const yIn = go(t, 0.1, 0.5, 700, 0), yOut = go(t, V.slogan - 0.2, V.slogan + 0.25, 0, 900);
  const talk = speaking(t) ? Math.abs(Math.sin(t * 13)) * 8 : 0;
  const shake = face === "stress" ? Math.sin(t * 40) * 3 : 0;
  const yw = lerp(440, 640, big), yx = lerp(10, CX - 320, big) + shake, yTop = lerp(1300, 1110, big) + yIn + yOut - talk;

  // ═════ le cadre (une seule forme qui se transforme) ═════
  // lettre barrée → pilule horloge → (disparaît) → … → carte de la lettre → (disparaît)
  const fw = bounce(t, [[0.9, 0], [1.25, 640], [3.15, 640], [3.5, 760], [6.2, 760], [6.5, 0], [12.5, 0], [12.85, 720], [21.6, 720], [21.95, 0]]);
  const fh = bounce(t, [[0.9, 0], [1.25, 780], [3.15, 780], [3.5, 200], [6.2, 200], [6.5, 0], [12.5, 0], [12.85, 860],
    [V.court, 860], [V.court + 0.35, 700], [V.long, 700], [V.long + 0.35, 920], [V.unClic, 920], [V.unClic + 0.35, 860], [21.6, 860], [21.95, 0]]);
  const fcy = t < 3.2 ? 860 : t < 6.6 ? 700 : 790;
  const fRadius = fh > 400 ? 48 : Math.min(fw, fh) / 2;
  const fallK = seg(t, 2.85, 3.15);   // la lettre barrée s'efface

  // ═════ le bouton rose (rond → champ « lien » → champ « CV » → « Générer ») ═════
  const bw = bounce(t, [[V.regarde, 0], [V.regarde + 0.35, 190], [V.lien - 0.05, 190], [V.lien + 0.35, 860], [12.5, 860], [12.8, 0],
    [V.offerte, 0], [V.offerte + 0.35, 860], [V.bio - 0.1, 860], [V.bio + 0.25, 640], [V.slogan - 0.1, 640], [V.slogan + 0.25, 0]]);
  const bh = bounce(t, [[V.regarde, 0], [V.regarde + 0.35, 190], [V.lien - 0.05, 190], [V.lien + 0.35, 150], [12.5, 150], [12.8, 0],
    [V.offerte, 0], [V.offerte + 0.35, 200], [V.bio - 0.1, 200], [V.bio + 0.25, 180], [V.slogan - 0.1, 180], [V.slogan + 0.25, 0]]);
  let [bx, by] = [CX, 700];
  if (t >= V.lien - 0.05 && t < 12.9) [bx, by] = curve(go(t, V.lien - 0.05, V.lien + 0.35, 0, 1), [CX, 700], [CX, 470], [760, 520]);
  if (t >= V.offerte - 0.1) [bx, by] = [CX, 760];
  const bColor = t > V.lien && t < 12.9 ? mix(PINK, D.card, seg(t, V.lien, V.lien + 0.3)) : PINK;
  const bScale = press(t, V.lien - 0.1);

  // champs suivants (CV, Générer) : poussés sous le premier
  const cvK = go(t, V.cv, V.cv + 0.35, 0, 1), genK = go(t, V.generer, V.generer + 0.35, 0, 1);
  const stackOut = seg(t, 12.55, 12.8);
  const genY = 860, genScale = press(t, V.clic);

  // curseur MyMotiv : arrive en courbe sur « Générer », survol, clic
  const [px, py] = curve(go(t, 11.6, 12.25, 0, 1), [980, 1250], [CX, genY], [980, 900]);
  const pHover = seg(t, 12.15, 12.35), pPress = Math.exp(-Math.pow((t - V.clic) / 0.08, 2));
  const pO = seg(t, 11.55, 11.7) * (1 - seg(t, 12.75, 12.9));

  // chrono 0 → 30 s, puis « prête »
  const sec = Math.round(30 * clamp((t - 12.85) / (V.prete - 12.95)));
  // logo de l'entreprise qui vole jusqu'à l'en-tête de la lettre
  const lk = go(t, V.logo - 0.45, V.logo, 0, 1);
  const cardL = CX - 360, cardT = 790 - 430;
  const [lx, ly] = curve(clamp(lk), [1180, 200], [cardL + 76, cardT + 76], [900, 260]);

  const rot = bounce(t, [[V.bio + 0.6, 0], [V.bio + 0.95, 2.5], [V.bio + 1.3, -1.5], [V.bio + 1.6, 0]]);
  const endK = soft(t, V.slogan, fps);

  return (
    <AbsoluteFill style={{ background: D.bg, fontFamily: "Poppins", color: D.ink }}>
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${rot}deg)`, transformOrigin: "540px 860px" }}>
        {/* ── titres ── */}
        <div style={{ position: "absolute", left: 50, right: 50, top: 190, textAlign: "center", fontSize: 70, fontWeight: 700, lineHeight: 1.12 }}>
          {t > V.arrete2 - 0.2 && t < 3.3 && <><TextDrop t={t} t0={V.arrete2} text="Arrête d'écrire" out={3.1} /><br /><span style={{ color: PINK }}><TextDrop t={t} t0={V.ecrire + 0.3} text="tes lettres de motivation." out={3.1} /></span></>}
          {t > 3.3 && t < 6.4 && <><TextDrop t={t} t0={V.heures} text="3 heures." out={6.2} /> <TextDrop t={t} t0={V.lettres - 0.05} text="3 lettres." out={6.2} /><br /><span style={{ color: D.soft }}><TextDrop t={t} t0={V.reponse - 0.35} text="Toujours pas de réponse." out={6.2} /></span></>}
          {t > 13.2 && t < 16.4 && <TextDrop t={t} t0={V.s30} text="30 secondes plus tard…" out={16.2} />}
          {t > 16.3 && t < 19.65 && <><TextDrop t={t} t0={V.surMesure} text="Sur-mesure." out={19.5} /><br /><span style={{ color: PINK }}><TextDrop t={t} t0={V.avecLogo} text="Avec son logo." out={19.5} /></span></>}
          {t > 19.6 && t < 21.8 && <><TextDrop t={t} t0={V.court - 0.1} text="Plus court ?" out={21.6} /> <TextDrop t={t} t0={V.long - 0.1} text="Plus long ?" out={21.6} /><br /><span style={{ color: PINK }}><TextDrop t={t} t0={V.unClic} text="1 clic." out={21.6} /></span></>}
        </div>

        {/* ── hook : « Arrête. » géant ── */}
        {t > 0.1 && t < 1.2 && (
          <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", fontSize: 230, fontWeight: 800, letterSpacing: -6, color: PINK, transform: `scale(${bounce(t, [[0.2, 1.5], [0.5, 1]]) * (1 + Math.sin(t * 50) * 0.012 * (1 - seg(t, 0.5, 0.9)))})`, opacity: seg(t, 0.15, 0.25) * (1 - seg(t, 0.95, 1.15)) }}>
            Arrête.
          </div>
        )}

        {/* ── le cadre ── */}
        <div style={{ position: "absolute", left: CX - fw / 2, top: fcy - fh / 2 + fallK * 60, width: fw, height: fh, borderRadius: fRadius, background: D.card, overflow: "hidden", opacity: 1 - fallK * (t < 3.2 ? 1 : 0), boxShadow: "0 30px 80px rgba(0,0,0,0.45)", transform: `rotate(${t < 3.2 ? fallK * -6 : 0}deg)` }}>
          {/* 1. la lettre qu'on écrit à la main… barrée */}
          {t < 3.2 && fh > 300 && (
            <div style={{ position: "absolute", inset: 0 }}>
              <div style={{ position: "absolute", left: 50, top: 50, fontSize: 34, fontWeight: 700 }}>Lettre de motivation</div>
              {Array.from({ length: 11 }, (_, i) => { const a = 1.3 + i * 0.12; return <div key={i} style={{ position: "absolute", left: 50, top: 140 + i * 52, height: 16, borderRadius: 8, width: `${[80, 84, 72, 86, 64, 82, 76, 68, 84, 70, 42][i]}%`, background: D.line, transform: `scaleX(${go(t, a, a + 0.3, 0, 1)})`, transformOrigin: "0 50%" }} />; })}
              <svg width={640} height={780} style={{ position: "absolute", left: 0, top: 0 }}>
                {[[60, 120, 580, 700], [580, 120, 60, 700]].map(([x1, y1, x2, y2], i) => {
                  const k = seg(t, V.motivation - 0.25 + i * 0.18, V.motivation - 0.05 + i * 0.18);
                  return <line key={i} x1={x1} y1={y1} x2={lerp(x1, x2, k)} y2={lerp(y1, y2, k)} stroke={PINK} strokeWidth={22} strokeLinecap="round" opacity={k > 0 ? 1 : 0} />;
                })}
              </svg>
            </div>
          )}
          {/* 2. horloge 14:00 → 17:00 + 3 lettres */}
          {t > 3.3 && t < 6.4 && fh > 120 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 56px", opacity: seg(t, 3.35, 3.55) * (1 - seg(t, 6.1, 6.3)) }}>
              <div style={{ fontSize: 100, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: -2, overflow: "hidden", height: 126 }}>
                {(() => { const h = 14 + Math.min(3, Math.floor(seg(t, 3.4, 4.6) * 3.999)), h0 = 3.4 + (h - 14) * 0.4; return <span key={h} style={{ display: "inline-block", transform: `translateY(${go(t, h0, h0 + 0.3, -100, 0)}px)` }}>{h}</span>; })()}:00
              </div>
              <div style={{ display: "flex", gap: 14 }}>
                {[0, 1, 2].map((i) => { const k = go(t, V.lettres + i * 0.15, V.lettres + i * 0.15 + 0.35, 0, 1); return <div key={i} style={{ width: 60, height: 80, borderRadius: 10, background: D.bg, border: `3px solid ${D.line}`, transform: `scale(${k}) rotate(${(i - 1) * 6}deg)`, opacity: clamp(k * 2) }} />; })}
              </div>
            </div>
          )}
          {/* 5-7. la lettre */}
          {t > 12.7 && t < 21.95 && (
            <div style={{ position: "absolute", inset: 0, opacity: seg(t, 12.8, 13.05) * (1 - seg(t, 21.7, 21.9)) }}>
              <div style={{ position: "absolute", left: 28, top: 28, width: 96, height: 96, borderRadius: 22, border: `3px dashed ${D.line}`, opacity: 1 - seg(t, V.logo - 0.05, V.logo + 0.1) }} />
              <div style={{ position: "absolute", left: 144, top: 40, fontSize: 32, fontWeight: 700 }}>Maison Lumen</div>
              <div style={{ position: "absolute", left: 144, top: 82, fontSize: 25, fontWeight: 600, color: D.soft }}>Manager des ventes · Lyon</div>
              <div style={{ position: "absolute", left: 24, right: 24, top: 150, bottom: 24, overflow: "hidden", borderRadius: 22, background: "#fff" }}>
                <Img src={SHOT("030-lettre")} style={{ position: "absolute", left: -112 * 0.78, top: -332 * 0.78, width: 1080 * 0.78, height: 1920 * 0.78, clipPath: `inset(0 0 ${(1 - seg(t, 12.95, V.prete)) * 100}% 0)` }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 110, background: "linear-gradient(rgba(255,255,255,0), #fff)" }} />
              </div>
            </div>
          )}
        </div>

        {/* logo de l'entreprise */}
        {t > V.logo - 0.5 && t < 21.95 && (
          <Img src={staticFile("company.png")} style={{ position: "absolute", left: lx - 48, top: ly - 48, width: 96, height: 96, borderRadius: 20, transform: `scale(${bounce(t, [[V.logo - 0.45, 1.6], [V.logo, 1]])})`, boxShadow: `0 0 ${lerp(0, 44, seg(t, V.logo, V.logo + 0.2)) * (1 - seg(t, V.logo + 0.6, V.logo + 1.2))}px ${PINK}`, opacity: seg(t, V.logo - 0.5, V.logo - 0.35) * (1 - seg(t, 21.7, 21.9)) }} />
        )}

        {/* chrono puis « prête » */}
        {t > 12.85 && t < 16.4 && (
          <div style={{ position: "absolute", left: CX - 170, top: 1255, width: 340, height: 100, borderRadius: 50, background: PINK, color: "#fff", fontSize: 44, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap", transform: `scale(${go(t, 12.85, 13.2, 0, 1) * bounce(t, [[V.prete - 0.05, 1.12], [V.prete + 0.25, 1]])})`, opacity: 1 - seg(t, 16.2, 16.4) }}>
            {t < V.prete ? `⏱ ${sec} s*` : "Prête ✓"}
          </div>
        )}

        {/* Plus court / Plus long */}
        {t > V.court - 0.3 && t < 21.95 && ([["Plus court", 590, V.court], ["Plus long", 850, V.long]] as const).map(([label, x, a]) => {
          const k = go(t, V.court - 0.25, V.court + 0.1, 0, 1), hot = seg(t, a - 0.05, a + 0.05) * (1 - seg(t, a + 0.45, a + 0.65));
          return <div key={label} style={{ position: "absolute", left: x - 120, top: 1268, width: 240, height: 96, borderRadius: 48, background: mix(D.card, PINK, hot), color: "#fff", fontSize: 34, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k * press(t, a)})`, opacity: clamp(k * 2) * (1 - seg(t, 21.7, 21.9)) }}>{label}</div>;
        })}

        {/* champs CV et Générer, poussés sous le champ « lien » */}
        {t > V.cv && t < 12.85 && (
          <div style={{ position: "absolute", left: CX - 430, top: 690 - 75 + (1 - cvK) * -60, width: 860, height: 150, borderRadius: 75, background: D.card, display: "flex", alignItems: "center", gap: 26, padding: "0 40px", opacity: clamp(cvK * 2) * (1 - stackOut), transform: `scale(${lerp(0.9, 1, cvK) * (1 - stackOut * 0.3)})` }}>
            <div style={{ fontSize: 50 }}>📄</div>
            <div style={{ fontSize: 42, fontWeight: 600 }}><TextDrop t={t} t0={V.cv + 0.15} text="Mon CV.pdf" by="chars" from={[0, 24]} stagger={0.03} /></div>
            <div style={{ marginLeft: "auto", width: 64, height: 64, borderRadius: 32, background: PINK, color: "#fff", fontSize: 36, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${go(t, V.cvMot, V.cvMot + 0.3, 0, 1)})` }}>✓</div>
          </div>
        )}
        {t > V.generer && t < 12.85 && (
          <div style={{ position: "absolute", left: CX - 300, top: genY - 80, width: 600, height: 160, borderRadius: 80, background: PINK, color: "#fff", fontSize: 58, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 ${lerp(20, 70, pPress)}px rgba(217,130,139,0.6)`, transform: `translateY(${(1 - genK) * -60}px) scale(${lerp(0.85, 1, genK) * genScale * (1 - stackOut * 0.3)})`, opacity: clamp(genK * 2) * (1 - stackOut) }}>
            <TextDrop t={t} t0={V.generer + 0.1} text="Générer" from={[0, 50]} />
          </div>
        )}
        <Ripple x={CX} y={genY} t={t} t0={V.clic} />

        {/* ── le bouton rose ── */}
        <div style={{ position: "absolute", left: bx - bw / 2, top: by - bh / 2, width: bw, height: bh, borderRadius: bh / 2, background: bColor, transform: `scale(${bScale})`, display: "flex", alignItems: "center", overflow: "hidden", color: "#fff", boxShadow: "0 18px 50px rgba(217,130,139,0.25)", zIndex: 2, justifyContent: t > V.lien && t < 12.9 ? "flex-start" : "center" }}>
          {t < V.lien + 0.1 && bw > 20 && (
            <svg width={80} height={80} viewBox="0 0 70 70" style={{ transform: `scale(${go(t, V.regarde + 0.1, V.regarde + 0.45, 0, 1)})`, opacity: 1 - seg(t, V.lien - 0.05, V.lien + 0.1) }}>
              <path d="M26 16 L46 35 L26 54" fill="none" stroke="#fff" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {t > V.lien + 0.1 && t < 12.9 && (
            <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "0 40px", width: "100%" }}>
              <div style={{ fontSize: 50 }}>🔗</div>
              <div style={{ fontSize: 40, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", maxWidth: 560 }}>
                <TextDrop t={t} t0={V.lien + 0.3} text="…/offre/manager-ventes" by="chars" from={[0, 20]} stagger={0.028} dur={0.2} />
              </div>
              <div style={{ marginLeft: "auto", width: 64, height: 64, flex: "none", borderRadius: 32, background: PINK, fontSize: 36, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${go(t, V.offre, V.offre + 0.3, 0, 1)})` }}>✓</div>
            </div>
          )}
          {t > V.offerte + 0.1 && t < V.bio && <div style={{ fontSize: 54, fontWeight: 700, whiteSpace: "nowrap", opacity: 1 - seg(t, V.bio - 0.2, V.bio - 0.05) }}><TextDrop t={t} t0={V.offerte + 0.15} text="Ta 1re lettre est offerte" from={[0, 70]} /></div>}
          {t > V.bio && t < V.slogan && <div style={{ fontSize: 62, fontWeight: 700, whiteSpace: "nowrap", opacity: 1 - seg(t, V.slogan - 0.25, V.slogan - 0.1) }}><TextDrop t={t} t0={V.bio + 0.05} text="Lien en bio ↑" from={[0, 70]} /></div>}
        </div>
        {t > V.sans - 0.1 && t < V.bio && <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontSize: 50, fontWeight: 600, color: D.soft }}><TextDrop t={t} t0={V.sans} text="Sans inscription." out={V.bio - 0.2} /></div>}
        {t > V.bio + 0.1 && t < V.slogan && <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontSize: 38, fontWeight: 600, color: D.soft, opacity: 1 - seg(t, V.slogan - 0.25, V.slogan - 0.1) }}><TextDrop t={t} t0={V.bio + 0.25} text="tinyurl.com/try-mymotiv" by="chars" from={[0, 30]} stagger={0.012} /></div>}
        <Confetti t={t} t0={V.offerteMot} />
      </div>

      {/* nom de Yann quand il se présente */}
      {t > V.moi && t < V.regarde + 0.3 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 930, display: "flex", justifyContent: "center", opacity: 1 - seg(t, V.regarde, V.regarde + 0.25) }}>
          <div style={{ padding: "22px 44px", borderRadius: 999, background: D.card, fontSize: 50, fontWeight: 700, transform: `scale(${go(t, V.yann - 0.1, V.yann + 0.25, 0, 1)})` }}>
            Yann Motiveur <span style={{ color: PINK }}>· MyMotiv</span>
          </div>
        </div>
      )}

      {/* ── Yann (buste) ── */}
      {t < V.slogan + 0.4 && (
        <div style={{ position: "absolute", left: yx, top: yTop, width: yw, transformOrigin: "50% 100%", transform: `scale(${pop})` }}>
          <div style={{ position: "absolute", left: "10%", right: "10%", top: "5%", height: "70%", borderRadius: "50%", background: `radial-gradient(closest-side, rgba(217,130,139,0.35), rgba(217,130,139,0))`, filter: "blur(10px)" }} />
          <Img src={staticFile(`mascotte/${face}.png`)} style={{ position: "relative", width: "100%", display: "block" }} />
        </div>
      )}

      <Pointer x={px} y={py} hover={pHover} press={pPress} o={pO} />

      {/* mention du chrono */}
      {t > 12.9 && t < 16.3 && <div style={{ position: "absolute", left: 470, right: 40, top: 1380, textAlign: "center", fontSize: 26, color: D.soft, fontFamily: "Open Sans", opacity: seg(t, 12.9, 13.2) * (1 - seg(t, 16.1, 16.3)) }}>* temps mesuré : 27 à 35 s par lettre</div>}

      {/* fin : logo + slogan + Yann en pied */}
      {t > V.slogan - 0.1 && (
        <>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: CX - 280, top: 330, width: 560, opacity: endK, transform: `translateY(${(1 - endK) * 40}px) scale(${lerp(0.92, 1, endK)})` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 520, textAlign: "center", fontSize: 72, fontWeight: 700, lineHeight: 1.12 }}>
            <TextDrop t={t} t0={V.slogan + 0.2} text="Avec MyMotiv, postulez." from={[0, -60]} /><br />
            <span style={{ color: PINK }}><TextDrop t={t} t0={V.recruter - 0.1} text="Et faites-vous recruter." from={[0, -60]} /></span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 740, textAlign: "center", fontSize: 36, fontWeight: 600, color: PINK_L, opacity: seg(t, 29.6, 29.9) }}>Lien en bio ↑</div>
          <Img src={staticFile("mascotte/pied.png")} style={{ position: "absolute", left: CX - 300, top: 840 + go(t, V.slogan + 0.3, V.slogan + 0.75, 1100, 0), width: 600 }} />
        </>
      )}
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
