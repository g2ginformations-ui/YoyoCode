// « L'après-midi candidatures » (30,5 s, 60 i/s, 9:16) — style Apple (skill apple-motion), calé sur la voix de l'utilisateur
// (public/audio/apres-midi-voix.wav, mots horodatés dans src/data/apres-midi-mots.json).
// Pilule-horloge 14:00 → 17:00 et 3 lettres (« 3 lettres en 3 heures, toujours seul ») → fenêtre de chatbot grise qui
// tremble (20 min*, générique, sans logo) → « Respire. » : rond rose qui respire → pilule « 5 clics » → carte des étapes
// qui s'allument au mot près → « Générer » → carte de la lettre, chrono « ≈ 30 s », le logo se pose → Plus court / Plus long
// → pilule « Ta 1re lettre est offerte » / « Lien en bio » → rotation, rond, logo, « Postule. Respire. ».
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { APPLE, TextDrop, bounce, curve, go, press, soft } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import { SHOT } from "./Lien";
import "./fonts";

const CX = 540;
const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(",")})`;
};
// Temps clés, au mot près dans la voix (s)
const V = {
  lettres: 0.32, heures: 1.82, seul: 2.64, ecran: 3.6, meme: 4.43, min20: 6.39, generique: 8.19, sansLogo: 8.83,
  respire: 10.44, avec: 11.63, clics: 12.77, cv: 13.47, lien: 14.07, longueur: 14.95, options: 15.67, generer: 16.67,
  en30: 17.55, s30: 17.77, ecrite: 18.77, logo: 20.33, detail: 21.67, court: 22.92, long: 23.61, unClic: 24.28,
  offerte: 25.02, bio: 26.36, postule: 27.6, respire2: 28.58, end: 30.5,
};
const STEPS = [["Ton CV", V.cv], ["Le lien de l'offre", V.lien], ["La longueur", V.longueur], ["Tes options", V.options]] as const;

export const ApresMidi: React.FC<{ audio?: string }> = ({ audio = "audio/apres-midi.wav" }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;

  // ═════ le cadre blanc (une seule forme, de l'horloge à la carte de la lettre) ═════
  const fw = bounce(t, [[0, 0], [0.35, 640], [3.95, 640], [4.4, 860], [10.15, 860], [10.5, 0], [12.85, 0], [13.25, 860], [17.3, 860], [17.7, 760], [24.8, 760], [25.15, 0]]);
  const fh = bounce(t, [[0, 0], [0.35, 220], [3.95, 220], [4.4, 1000], [10.15, 1000], [10.5, 0], [12.85, 0], [13.25, 1060], [17.3, 1060], [17.7, 1080],
    [V.court, 1080], [V.court + 0.35, 880], [V.long, 880], [V.long + 0.35, 1240], [V.unClic, 1240], [V.unClic + 0.35, 1080], [24.8, 1080], [25.15, 0]]);
  const fcy = t < 4.0 ? 1000 : t < 17.3 ? 1000 : 960;
  const stress = t > 7.4 && t < 10.1 ? Math.sin(t * 38) * 3 * seg(t, 7.4, 8.4) : 0;
  const fx = CX - fw / 2 + stress, fy = fcy - fh / 2;
  const fRadius = fh > 400 ? 60 : Math.min(fw, fh) / 2;

  // ═════ le bouton rose (rond qui respire → pilule → « Générer » → chrono → pilule finale → rond) ═════
  const bw = bounce(t, [[10.2, 0], [10.55, 260], [11.5, 260], [11.9, 760], [12.85, 760], [13.3, 640], [17.3, 640], [17.7, 230], [21.4, 230], [21.7, 0],
    [24.8, 0], [25.15, 820], [27.4, 820], [27.8, 220], [28.05, 220], [28.35, 0]]);
  const bh = bounce(t, [[10.2, 0], [10.55, 260], [11.5, 260], [11.9, 190], [12.85, 190], [13.3, 140], [17.3, 140], [17.7, 96], [21.4, 96], [21.7, 0],
    [24.8, 0], [25.15, 210], [27.4, 210], [27.8, 220], [28.05, 220], [28.35, 0]]);
  const breathe = t > 10.5 && t < 11.5 ? 1 + 0.06 * Math.sin((t - 10.5) * Math.PI * 2 * 0.9) : 1;
  let [bx, by] = [CX, 1000];
  if (t >= 12.85 && t < 17.3) [bx, by] = curve(go(t, 12.85, 13.3, 0, 1), [CX, 1000], [CX, 1000 + 530 - 110], [760, 1300]);
  if (t >= 17.3 && t < 21.7) [bx, by] = curve(go(t, 17.3, 17.7, 0, 1), [CX, 1420], [CX + 380 - 150, 960 - 540 + 80], [820, 1200]);
  if (t >= 24.8) [bx, by] = [CX, 960];
  const bColor = t >= 12.85 && t < 17.3 ? mix(PINK, APPLE.dark, seg(t, 12.9, 13.2)) : PINK;
  const bScale = press(t, V.generer) * press(t, V.respire - 0.15) * breathe;

  // ═════ rotation d'ensemble (liant final) ═════
  const rot = bounce(t, [[26.6, 0], [26.95, 2.5], [27.3, -1.5], [27.6, 0]]);
  const endK = soft(t, 27.95, fps);

  // horloge 14:00 → 17:00 (l'heure tombe à chaque changement)
  const hour = 14 + Math.min(3, Math.floor(seg(t, 0.6, 2.2) * 3.999));
  const hourT0 = 0.6 + (hour - 14) * 0.4;

  // logo de l'entreprise : arrive en courbe et se pose dans l'en-tête de la lettre
  const lk = go(t, V.logo - 0.45, V.logo, 0, 1);
  const [lx, ly] = curve(clamp(lk), [1180, 260], [248, 508], [900, 330]);

  return (
    <AbsoluteFill style={{ background: APPLE.bg, fontFamily: "Poppins", color: APPLE.ink }}>
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${rot}deg)`, transformOrigin: "540px 960px" }}>
        {/* ── titres au-dessus du cadre ── */}
        <div style={{ position: "absolute", left: 60, right: 60, top: 190, textAlign: "center", fontSize: 72, fontWeight: 700, lineHeight: 1.12 }}>
          {t < 4.3 && <><TextDrop t={t} t0={V.lettres} text="3 lettres." out={4.1} /> <TextDrop t={t} t0={V.heures} text="3 heures." out={4.1} /><br /><span style={{ color: APPLE.soft }}><TextDrop t={t} t0={V.seul - 0.3} text="Et toujours seul." out={4.1} /></span></>}
          {t > 4.3 && t < 10.3 && <TextDrop t={t} t0={V.meme} text="Avec un chatbot IA…" out={10.1} />}
          {t > 12.6 && t < 17.4 && <TextDrop t={t} t0={V.clics - 0.1} text="5 clics." out={17.2} />}
          {t > 18.5 && t < 21.6 && <><TextDrop t={t} t0={V.ecrite} text="Écrite pour cette offre." out={21.45} /><br /><span style={{ color: PINK }}><TextDrop t={t} t0={V.logo - 0.1} text="Avec son logo." out={21.45} /></span></>}
          {t > 21.5 && t < 24.9 && <><TextDrop t={t} t0={V.detail} text="Un détail à changer ?" out={24.75} /><br /><span style={{ color: PINK }}><TextDrop t={t} t0={V.unClic} text="1 clic." out={24.75} /></span></>}
        </div>

        {/* ── le cadre ── */}
        <div style={{ position: "absolute", left: fx, top: fy, width: fw, height: fh, borderRadius: fRadius, background: t > 4.0 && t < 10.5 ? "#FBFBFD" : APPLE.card, boxShadow: "0 30px 80px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {/* 1. horloge + 3 lettres */}
          {t < 4.1 && fh > 150 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 56px", opacity: 1 - seg(t, 3.8, 4.0) }}>
              <div style={{ fontSize: 96, fontWeight: 700, fontVariantNumeric: "tabular-nums", letterSpacing: -2, overflow: "hidden", height: 120 }}>
                <span key={hour} style={{ display: "inline-block", transform: `translateY(${go(t, hourT0, hourT0 + 0.3, -90, 0)}px)` }}>{hour}</span>:00
              </div>
              <div style={{ display: "flex", gap: 12 }}>
                {[0, 1, 2].map((i) => { const k = go(t, V.lettres + i * 0.17, V.lettres + i * 0.17 + 0.35, 0, 1); return <div key={i} style={{ width: 56, height: 74, borderRadius: 10, background: APPLE.bg, border: "2px solid #D2D2D7", transform: `scale(${k}) rotate(${(i - 1) * 6}deg)`, opacity: clamp(k * 2) }} />; })}
              </div>
            </div>
          )}
          {/* 2. fenêtre de chatbot (grise, générique) */}
          {t > 4.2 && t < 10.4 && (
            <div style={{ position: "absolute", inset: 0, opacity: seg(t, 4.3, 4.55) * (1 - seg(t, 10.05, 10.3)) }}>
              <div style={{ position: "absolute", left: 36, top: 32, display: "flex", gap: 12 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 20, height: 20, borderRadius: 10, background: "#D2D2D7" }} />)}</div>
              <div style={{ position: "absolute", right: 40, top: 100, maxWidth: 600, padding: "22px 28px", borderRadius: 28, background: "#E8E8ED", fontSize: 32, fontWeight: 600, color: APPLE.ink }}>
                <TextDrop t={t} t0={4.6} text="Écris-moi une lettre de motivation…" by="chars" from={[0, 20]} stagger={0.018} dur={0.2} />
              </div>
              {Array.from({ length: 9 }, (_, i) => { const a = 5.5 + i * 0.22; return <div key={i} style={{ position: "absolute", left: 50, top: 290 + i * 46, height: 18, borderRadius: 9, width: `${[78, 82, 70, 85, 60, 80, 74, 66, 40][i]}%`, background: "#E3E3E8", transform: `scaleX(${go(t, a, a + 0.3, 0, 1)})`, transformOrigin: "0 50%" }} />; })}
              <div style={{ position: "absolute", left: 50, top: 290 + 9 * 46, width: 6, height: 34, background: APPLE.soft, opacity: Math.floor(t * 2.5) % 2 }} />
              <div style={{ position: "absolute", left: 40, right: 40, bottom: 40, display: "flex", gap: 16, justifyContent: "center" }}>
                {([["⏱ 20 min*", V.min20], ["Générique", V.generique], ["Sans logo", V.sansLogo]] as const).map(([label, a]) => {
                  const k = go(t, a, a + 0.35, 0, 1);
                  return <div key={label} style={{ padding: "16px 26px", borderRadius: 999, background: "#fff", border: "2px solid #D2D2D7", fontSize: 32, fontWeight: 600, color: APPLE.soft, transform: `scale(${k})`, opacity: clamp(k * 2), whiteSpace: "nowrap" }}>{label}</div>;
                })}
              </div>
            </div>
          )}
          {/* 4. carte des 5 clics */}
          {t > 12.9 && t < 17.45 && (
            <div style={{ position: "absolute", inset: 0, opacity: seg(t, 13.0, 13.25) * (1 - seg(t, 17.25, 17.4)) }}>
              {STEPS.map(([label, a], i) => {
                const on = seg(t, a, a + 0.15), k = go(t, a, a + 0.35, 0.94, 1);
                return (
                  <div key={label} style={{ position: "absolute", left: 50, right: 50, top: 70 + i * 170, height: 130, borderRadius: 65, background: mix("#F2F2F4", "#FBE9EC", on), display: "flex", alignItems: "center", padding: "0 30px", gap: 24, transform: `scale(${t >= a ? k : 0.94})`, opacity: lerp(0.45, 1, on) }}>
                    <div style={{ width: 70, height: 70, borderRadius: 35, background: mix("#D2D2D7", PINK, on), color: "#fff", fontSize: 36, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{on > 0.5 ? "✓" : i + 1}</div>
                    <div style={{ fontSize: 44, fontWeight: 600 }}>{label}</div>
                  </div>
                );
              })}
            </div>
          )}
          {/* 5-6. la lettre : en-tête (le logo s'y pose) + le texte réel */}
          {t > 17.4 && t < 24.95 && (
            <div style={{ position: "absolute", inset: 0, opacity: seg(t, 17.55, 17.8) * (1 - seg(t, 24.75, 24.95)) }}>
              <div style={{ position: "absolute", left: 40, top: 40, width: 96, height: 96, borderRadius: 22, border: "3px dashed #D2D2D7", opacity: 1 - seg(t, V.logo - 0.05, V.logo + 0.1) }} />
              <div style={{ position: "absolute", left: 156, top: 58, fontSize: 30, fontWeight: 700 }}>Maison Lumen</div>
              <div style={{ position: "absolute", left: 156, top: 98, fontSize: 24, fontWeight: 600, color: APPLE.soft }}>Manager des ventes · Lyon</div>
              <div style={{ position: "absolute", left: 30, right: 30, top: 170, bottom: 30, overflow: "hidden", borderRadius: 18 }}>
                <Img src={SHOT("030-lettre")} style={{ position: "absolute", left: -110 * 0.814, top: -330 * 0.814, width: 1080 * 0.814, height: 1920 * 0.814 }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 120, background: "linear-gradient(rgba(255,255,255,0), #fff)" }} />
              </div>
            </div>
          )}
        </div>

        {/* logo de l'entreprise qui vole jusqu'à l'en-tête */}
        {t > V.logo - 0.5 && t < 24.95 && (
          <Img src={staticFile("company.png")} style={{ position: "absolute", left: lx - 48, top: ly - 48, width: 96, height: 96, borderRadius: 20, background: "#fff", transform: `scale(${bounce(t, [[V.logo - 0.45, 1.6], [V.logo, 1]])})`, boxShadow: `0 0 ${lerp(0, 40, seg(t, V.logo, V.logo + 0.2)) * (1 - seg(t, V.logo + 0.6, V.logo + 1.2))}px ${PINK}`, opacity: seg(t, V.logo - 0.5, V.logo - 0.35) * (1 - seg(t, 24.75, 24.95)) }} />
        )}

        {/* pastilles Plus court / Plus long */}
        {t > 21.7 && t < 24.95 && ([["Plus court", 330, V.court], ["Plus long", 750, V.long]] as const).map(([label, x, a]) => {
          const k = go(t, 21.85, 22.2, 0, 1), hot = seg(t, a - 0.05, a + 0.05) * (1 - seg(t, a + 0.4, a + 0.6));
          return <div key={label} style={{ position: "absolute", left: x - 170, top: 1640, width: 340, height: 120, borderRadius: 60, background: mix("#FFFFFF", PINK, hot), color: hot > 0.5 ? "#fff" : APPLE.ink, fontSize: 40, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 14px 34px rgba(0,0,0,0.08)", transform: `scale(${k * press(t, a)})`, opacity: clamp(k * 2) * (1 - seg(t, 24.75, 24.95)) }}>{label}</div>;
        })}

        {/* ── le bouton ── */}
        <div style={{ position: "absolute", left: bx - bw / 2, top: by - bh / 2, width: bw, height: bh, borderRadius: bh / 2, background: bColor, transform: `scale(${bScale})`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", color: "#fff", boxShadow: "0 18px 44px rgba(217,130,139,0.35)", zIndex: 2 }}>
          {t > 11.6 && t < 12.95 && <div style={{ fontSize: 52, fontWeight: 700, whiteSpace: "nowrap", opacity: 1 - seg(t, 12.8, 12.95) }}><TextDrop t={t} t0={V.avec} text="MyMotiv" from={[0, 60]} /><span style={{ color: PINK_L }}> · </span><TextDrop t={t} t0={V.clics} text="5 clics" from={[0, 60]} /></div>}
          {t > 13.2 && t < 17.35 && <div style={{ fontSize: 46, fontWeight: 600, opacity: 1 - seg(t, 17.2, 17.35) }}><TextDrop t={t} t0={13.3} text="Générer" from={[0, 50]} /></div>}
          {t > 17.6 && t < 21.55 && <div style={{ fontSize: 40, fontWeight: 700, whiteSpace: "nowrap", opacity: 1 - seg(t, 21.35, 21.5) }}><TextDrop t={t} t0={V.s30} text="≈ 30 s" by="chars" from={[0, 40]} stagger={0.04} /></div>}
          {t > 25.0 && t < 26.5 && <div style={{ fontSize: 50, fontWeight: 600, whiteSpace: "nowrap", opacity: 1 - seg(t, 26.3, 26.45) }}><TextDrop t={t} t0={V.offerte - 0.05} text="Ta 1re lettre est offerte" from={[0, 70]} /></div>}
          {t > 26.3 && t < 27.6 && <div style={{ fontSize: 56, fontWeight: 700, whiteSpace: "nowrap", opacity: 1 - seg(t, 27.4, 27.55) }}><TextDrop t={t} t0={V.bio - 0.05} text="Lien en bio ↑" from={[0, 70]} /></div>}
        </div>
        {t > 26.4 && t < 27.6 && <div style={{ position: "absolute", left: 0, right: 0, top: 1100, textAlign: "center", fontSize: 36, fontWeight: 600, color: APPLE.soft, opacity: 1 - seg(t, 27.4, 27.55) }}><TextDrop t={t} t0={26.5} text="tinyurl.com/try-mymotiv" by="chars" from={[0, 30]} stagger={0.012} /></div>}
        {t > 10.3 && t < 11.5 && <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontSize: 76, fontWeight: 700, color: APPLE.ink }}><TextDrop t={t} t0={V.respire} text="Respire." from={[0, -60]} out={11.35} /></div>}
      </div>

      {/* mention de la comparaison */}
      {t > V.min20 && t < 10.2 && <div style={{ position: "absolute", left: 0, right: 0, bottom: 150, textAlign: "center", fontSize: 26, color: APPLE.soft, fontFamily: "Open Sans", opacity: seg(t, V.min20, V.min20 + 0.3) * (1 - seg(t, 10.0, 10.2)) }}>* estimation · avec MyMotiv : temps mesuré</div>}

      {/* fin : logo + « Postule. Respire. » + slogan */}
      {t > 27.9 && (
        <>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: CX - 270, top: 680, width: 540, opacity: endK, transform: `translateY(${(1 - endK) * 40}px) scale(${lerp(0.92, 1, endK)})` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", fontSize: 92, fontWeight: 700, lineHeight: 1.1 }}>
            <TextDrop t={t} t0={V.postule} text="Postule." from={[0, -70]} /><br />
            <span style={{ color: PINK }}><TextDrop t={t} t0={V.respire2} text="Respire." from={[0, -70]} /></span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center", fontSize: 34, fontWeight: 600, color: APPLE.soft }}>
            <TextDrop t={t} t0={29.2} text="Avec MyMotiv, postulez. Et faites-vous recruter." from={[0, 30]} stagger={0.04} />
          </div>
        </>
      )}
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
