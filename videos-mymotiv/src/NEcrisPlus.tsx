// « N'écris plus. » (17,2 s, 60 i/s, 9:16) — reprise de la construction d'une pub de référence (TikTok d'un studio de
// motion design, inspiration seulement : rien de ses images, de son logo ni de ses couleurs n'est réutilisé).
// Un ordinateur portable dans le noir, l'écran raconte tout, sans voix ; deux légendes fixes façon TikTok.
// Hook : un fichier « lettre_motivation_v47.docx » qui s'efface tout seul à toute vitesse → la question tapée mot par mot
// → recherche « lettre de motivation rapide » → résultat MyMotiv → clic → l'écran passe au blanc → « N'écris plus. » →
// lettres pour CETTE offre en éventail → colle le lien, Générer → tableau « Mes lettres » + ce que contient la lettre →
// « Lettre prête. » → retour au noir : logo, slogan, lien en bio → la boucle repart sur « Tu ».
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, curve, go, press } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import { Pointer, Ripple } from "./Lien";
import { ease, pulse } from "./motion";
import "./fonts";

export const NECRIS_DUR = 17.2;
const SW = 972, SH = 562;           // écran (intérieur)
const SX = 54, SY = 600;            // position de l'écran dans l'image
const INK = "#1D1D1F", SOFT = "#86868B";

// temps clés (s)
export const N = {
  erase: 0.12, q: 0.62, qOut: 1.75, search: 1.95, type0: 2.15, type1: 3.3, load: 3.42, result: 3.8, click: 4.35, white: 4.55,
  ne: 4.95, neOut: 6.62, fan: 6.8, s30: 7.35, fanOut: 8.4, link: 8.75, linkType0: 9.0, linkType1: 9.75, gen: 10.15, linkOut: 10.6,
  dash: 10.78, panel: 11.55, dashOut: 13.3, spin: 13.45, done: 13.8, doneOut: 14.95, logo: 15.05, loop: 17.0,
};
const QUERY = "lettre de motivation rapide";
const LINK = "emploi.fr/offre/commercial-lyon";
const DOC = "Madame, Monsieur,\nJe me permets de vous adresser ma candidature au poste de… Fort d'une expérience significative, je suis convaincu que mon profil dynamique et motivé saura répondre à vos attentes.";

const show = (t: number, a: number, b: number) => t >= a && t < b;
function blurIO(t: number, a: number, b: number, inD = 0.2, outD = 0.2): React.CSSProperties {
  const i = seg(t, a, a + inD), o = seg(t, b - outD, b);
  return { opacity: i * (1 - o), filter: `blur(${(1 - i) * 14 + o * 16}px)`, transform: `scale(${lerp(1.06, 1, i) * lerp(1, 1.08, o)})` };
}

const MMIcon: React.FC<{ s: number }> = ({ s }) => (
  <div style={{ width: s, height: s, borderRadius: s * 0.26, background: `linear-gradient(145deg, ${PINK_L}, ${PINK} 55%, #B9606B)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: s * 0.42, flexShrink: 0 }}>mm.</div>
);
const CO: [string, string][] = [["Maison Lumen", "#F4C95D"], ["Atelier Nova", "#7C9CF5"], ["Boréal Logistique", "#5FB3A1"], ["Maison Lumen", "#F4C95D"], ["Atelier Nova", "#7C9CF5"]];
const CoLogo: React.FC<{ i: number; s: number }> = ({ i, s }) =>
  i % 3 === 0 ? <Img src={staticFile("company.png")} style={{ width: s, height: s, borderRadius: s * 0.24 }} />
    : <div style={{ width: s, height: s, borderRadius: s * 0.24, background: CO[i][1], color: "#fff", fontWeight: 800, fontSize: s * 0.45, display: "flex", alignItems: "center", justifyContent: "center" }}>{CO[i][0][0]}</div>;

// ─── contenu de l'écran ───
const Screen: React.FC<{ t: number }> = ({ t }) => {
  const light = t >= N.white && t < N.logo;
  const typed = (a: number, b: number, s: string) => s.slice(0, Math.round(s.length * seg(t, a, b)));
  const cur = Math.floor(t * 2.5) % 2 ? "|" : "";
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 10, background: light ? "#FAF7F6" : "#0A090B", fontFamily: "Poppins" }}>
      {/* fond sombre : horizon rose */}
      {!light && <div style={{ position: "absolute", left: -200, right: -200, top: SH * 0.66, height: 900, borderRadius: "50%", background: `radial-gradient(ellipse at 50% 0%, ${PINK} 0%, rgba(217,130,139,0.35) 14%, rgba(10,9,11,0) 40%)`, boxShadow: `0 -6px 40px rgba(242,184,192,${0.55 + 0.2 * Math.sin(t * 2)})`, borderTop: `3px solid ${PINK_L}` }} />}
      {light && <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 50% 120%, rgba(242,184,192,0.45), rgba(250,247,246,0) 60%)" }} />}

      {/* A. hook : la lettre v47 qui s'efface toute seule */}
      {t < N.q && (
        <div style={{ position: "absolute", inset: 0, background: "#fff", padding: "30px 46px", color: INK, opacity: 1 - seg(t, N.q - 0.08, N.q) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 20, color: SOFT, fontFamily: "Open Sans" }}><span style={{ fontSize: 22 }}>📄</span> lettre_motivation_<b style={{ color: "#E5484D" }}>v47</b>.docx</div>
          <div style={{ marginTop: 26, fontFamily: "Georgia, serif", fontSize: 30, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>
            {DOC.slice(0, Math.round(DOC.length * (1 - Math.pow(seg(t, N.erase, N.q - 0.1), 0.7))))}<span style={{ color: PINK }}>|</span>
          </div>
        </div>
      )}

      {/* B. la question */}
      {show(t, N.q, N.search) && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 58, lineHeight: 1.15, letterSpacing: -1.5, textShadow: "0 0 30px rgba(255,255,255,0.35)", ...blurIO(t, N.q, N.search, 0.05, 0.22) }}>
          <TextDrop t={t} t0={N.q} text="Tu écris" stagger={0.14} dur={0.18} from={[0, 0]} />{" "}
          <span style={{ display: "inline-block", padding: "0 12px", borderRadius: 12, background: t > N.q + 0.33 ? PINK : "transparent", border: `3px solid ${PINK_L}`, opacity: seg(t, N.q + 0.3, N.q + 0.36) }}>encore</span>
          <br />
          <TextDrop t={t} t0={N.q + 0.48} text="tes" from={[0, 0]} dur={0.12} />{" "}
          <span style={{ display: "inline-flex", verticalAlign: "middle", width: 64, height: 54, borderRadius: 12, background: "#2C2C2E", border: "2px solid #48484A", alignItems: "center", justifyContent: "center", fontSize: 32, opacity: seg(t, N.q + 0.58, N.q + 0.62) }}>✍️</span>{" "}
          <TextDrop t={t} t0={N.q + 0.68} text="lettres ?" stagger={0.12} from={[0, 0]} dur={0.14} />
        </div>
      )}

      {/* C. la recherche */}
      {show(t, N.search, N.white + 0.3) && (() => {
        const res = t >= N.result;
        const expand = ease(t, N.click + 0.1, N.white + 0.25);
        const w = lerp(res ? 560 : 640, SW + 20, expand), h = lerp(64, SH + 20, expand);
        return (
          <div style={{ position: "absolute", left: SW / 2 - w / 2, top: lerp(SH * 0.42, -10, expand), width: w, height: h, borderRadius: lerp(32, 0, expand), background: res ? (expand > 0 ? `rgba(250,247,246,${0.2 + 0.8 * expand})` : "rgba(250,247,246,0.92)") : "rgba(255,255,255,0.12)", border: "1.5px solid rgba(255,255,255,0.35)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", padding: "0 22px", gap: 14, color: res ? INK : "#fff", fontSize: 24, ...blurIO(t, N.search, 99, 0.25, 0), transform: `scale(${go(t, N.search, N.search + 0.35, 0.8, 1) * press(t, N.click)})` }}>
            {expand < 0.3 && (res ? (
              <>
                <MMIcon s={40} />
                <span style={{ fontWeight: 700, whiteSpace: "nowrap" }}>MyMotiv — Ta lettre en 30 s*</span>
                <span style={{ marginLeft: "auto", width: 30, height: 30, borderRadius: 15, background: PINK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>→</span>
              </>
            ) : t >= N.load ? (
              <div style={{ flex: 1, height: 10, borderRadius: 5, background: `linear-gradient(90deg, rgba(255,255,255,0.15) ${(t - N.load) * 300 - 40}%, rgba(255,255,255,0.7) ${(t - N.load) * 300}%, rgba(255,255,255,0.15) ${(t - N.load) * 300 + 40}%)` }} />
            ) : (
              <>
                <span style={{ fontSize: 24, opacity: 0.8 }}>⌕</span>
                <span style={{ whiteSpace: "nowrap", opacity: t < N.type0 ? 0.5 : 1 }}>{t < N.type0 ? "Rechercher" : typed(N.type0, N.type1, QUERY)}{t >= N.type0 && cur}</span>
              </>
            ))}
          </div>
        );
      })()}

      {/* D. N'écris plus. */}
      {show(t, N.ne, N.neOut) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...blurIO(t, N.ne, N.neOut, 0.15, 0.2) }}>
          <div style={{ position: "relative", fontSize: 84, fontWeight: 800, color: INK, letterSpacing: -3 }}>
            <TextDrop t={t} t0={N.ne + 0.05} text="N'écris plus." by="chars" stagger={0.04} dur={0.16} from={[0, 0]} />
            {/* le stylo passe et se fait barrer */}
            {t > N.ne + 0.6 && (() => {
              const k = ease(t, N.ne + 0.65, N.ne + 1.35);
              return (
                <>
                  <div style={{ position: "absolute", left: lerp(-20, 520, k), top: 40, fontSize: 70, transform: `rotate(${-20 + Math.sin(t * 20) * 6}deg)`, opacity: 1 - seg(t, N.ne + 1.25, N.ne + 1.45) }}>✏️</div>
                  <svg width={560} height={40} style={{ position: "absolute", left: -10, top: 108, overflow: "visible" }}>
                    <path d="M5 20 Q140 5 280 20 T555 18" fill="none" stroke={PINK} strokeWidth={10} strokeLinecap="round" strokeDasharray={600} strokeDashoffset={600 * (1 - ease(t, N.ne + 0.7, N.ne + 1.35))} />
                  </svg>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* E. lettres pour CETTE offre, en éventail */}
      {show(t, N.fan, N.fanOut + 0.3) && (
        <div style={{ position: "absolute", inset: 0, ...blurIO(t, N.fan, N.fanOut + 0.3, 0.15, 0.3) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 46, textAlign: "center", color: INK, fontWeight: 800, fontSize: 40, letterSpacing: -1 }}>
            <TextDrop t={t} t0={N.fan} text="Une lettre pour CETTE offre." stagger={0.06} from={[0, 0]} dur={0.14} />
            <div style={{ color: PINK, fontSize: 32, marginTop: 2 }}><TextDrop t={t} t0={N.s30} text="En 30 secondes*" by="chars" stagger={0.025} from={[0, 0]} dur={0.12} /></div>
          </div>
          {[0, 1, 2, 3, 4].map((i) => {
            const k = go(t, N.fan + 0.2 + i * 0.07, N.fan + 0.65 + i * 0.07, 0, 1);
            const squash = ease(t, N.fanOut - 0.05, N.fanOut + 0.25);
            const ang = (i - 2) * 9 * (1 - squash), x = SW / 2 + (i - 2) * 150 * (1 - squash * 0.8);
            return (
              <div key={i} style={{ position: "absolute", left: x - 85, top: 230 + Math.abs(i - 2) * 18, width: 170, height: 230, borderRadius: 16, background: "#fff", boxShadow: "0 16px 40px rgba(0,0,0,0.18)", padding: 14, transformOrigin: "50% 160%", transform: `translateY(${(1 - k) * 380}px) rotate(${ang}deg)`, zIndex: 5 - Math.abs(i - 2) }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><CoLogo i={i} s={34} /><span style={{ fontSize: 13, fontWeight: 800, color: INK, lineHeight: 1.1 }}>{CO[i][0]}</span></div>
                {[90, 80, 95, 70, 85, 60].map((w, j) => <div key={j} style={{ marginTop: j ? 9 : 16, height: 8, borderRadius: 4, width: `${w}%`, background: j === 0 ? "#F2C9CE" : "#E8E8EC" }} />)}
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 12, textAlign: "center", fontSize: 15, color: SOFT, fontFamily: "Open Sans", opacity: seg(t, N.s30, N.s30 + 0.3) }}>* temps mesuré : 27 à 35 s par lettre · exemples fictifs</div>
        </div>
      )}

      {/* F. colle le lien, Générer */}
      {show(t, N.link, N.linkOut) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 26, ...blurIO(t, N.link, N.linkOut, 0.15, 0.2) }}>
          <div style={{ fontSize: 44, fontWeight: 800, color: INK, letterSpacing: -1 }}><TextDrop t={t} t0={N.link} text="Colle le lien de l'offre" stagger={0.05} from={[0, 0]} dur={0.14} /></div>
          <div style={{ width: 600, height: 64, borderRadius: 32, background: "#fff", boxShadow: "0 8px 30px rgba(0,0,0,0.1), 0 0 0 1.5px #E5E5EA", display: "flex", alignItems: "center", padding: "0 24px", gap: 12, fontSize: 22, color: INK, opacity: seg(t, N.link + 0.2, N.link + 0.35) }}>
            <span>🔗</span><span style={{ whiteSpace: "nowrap" }}>{typed(N.linkType0, N.linkType1, LINK)}{t > N.linkType0 && t < N.linkType1 + 0.2 && cur}</span>
          </div>
          <div style={{ padding: "14px 34px", borderRadius: 999, background: t > N.gen ? PINK : INK, color: "#fff", fontSize: 24, fontWeight: 800, transform: `scale(${press(t, N.gen) * go(t, N.link + 0.3, N.link + 0.6, 0.6, 1)})`, boxShadow: t > N.gen ? `0 0 40px ${PINK}` : undefined }}>{t > N.gen ? "Générée ✓" : "✦ Générer"}</div>
        </div>
      )}

      {/* G. tableau « Mes lettres » + ce que contient la lettre */}
      {show(t, N.dash, N.dashOut) && (
        <div style={{ position: "absolute", inset: 0, padding: "26px 30px", color: INK, ...blurIO(t, N.dash, N.dashOut, 0.18, 0.18) }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 26, fontWeight: 800 }}><MMIcon s={34} /> Mes lettres</div>
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12, width: 520, height: 72, padding: "0 14px", borderRadius: 16, background: "#fff", boxShadow: "0 4px 14px rgba(0,0,0,0.06)", transform: `translateX(${(1 - ease(t, N.dash + 0.1 + i * 0.07, N.dash + 0.4 + i * 0.07)) * -120}px)`, opacity: seg(t, N.dash + 0.1 + i * 0.07, N.dash + 0.25 + i * 0.07) }}>
              <CoLogo i={i} s={44} />
              <div><div style={{ fontSize: 19, fontWeight: 800 }}>{CO[i][0]}</div><div style={{ fontSize: 14, color: SOFT }}>{["Commercial terrain", "Chargée de clientèle", "Assistant logistique", "Vendeuse conseil", "Alternance marketing"][i]}</div></div>
              <span style={{ marginLeft: "auto", padding: "5px 12px", borderRadius: 999, background: i === 0 ? PINK : "#F2F2F4", color: i === 0 ? "#fff" : SOFT, fontSize: 14, fontWeight: 800 }}>{i === 0 ? "Nouvelle" : "Prête"}</span>
            </div>
          ))}
          <div style={{ position: "absolute", right: 26, top: 70, width: 360, borderRadius: 22, background: "#fff", boxShadow: "0 16px 50px rgba(0,0,0,0.14)", padding: "20px 22px", transform: `translateX(${(1 - go(t, N.panel, N.panel + 0.4, 0, 1)) * 420}px)` }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>Ta lettre contient</div>
            {["ton vrai parcours (ton CV)", "les mots-clés de l'offre", "le logo de l'entreprise", "un ton humain, pas robot"].map((l, j) => (
              <div key={l} style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 14, fontSize: 18, opacity: seg(t, N.panel + 0.35 + j * 0.28, N.panel + 0.45 + j * 0.28) }}>
                <span style={{ width: 26, height: 26, borderRadius: 13, background: PINK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, transform: `scale(${go(t, N.panel + 0.35 + j * 0.28, N.panel + 0.6 + j * 0.28, 0, 1)})` }}>✓</span>{l}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* H. lettre prête */}
      {show(t, N.spin, N.doneOut) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: INK, opacity: 1 - seg(t, N.doneOut - 0.12, N.doneOut) }}>
          {t < N.done ? (
            <svg width={64} height={64} style={{ transform: `rotate(${t * 720}deg)` }}><circle cx={32} cy={32} r={24} fill="none" stroke={PINK} strokeWidth={5} strokeDasharray="110 60" strokeLinecap="round" /></svg>
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: 36, background: PINK, color: "#fff", fontSize: 40, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${go(t, N.done, N.done + 0.3, 0, 1)})`, boxShadow: `0 0 ${30 + 40 * pulse(t, N.done + 0.1, 0.25)}px ${PINK}` }}>✓</div>
          )}
          <div style={{ marginTop: 18, fontSize: 40, fontWeight: 800, letterSpacing: -1, opacity: seg(t, N.done + 0.15, N.done + 0.3) }}>Lettre prête.</div>
          <div style={{ marginTop: 6, fontSize: 22, color: PINK, fontWeight: 700, opacity: seg(t, N.done + 0.45, N.done + 0.6) }}>Ta 1re lettre est offerte 🎁</div>
        </div>
      )}

      {/* I. fin : logo, slogan, lien en bio */}
      {t >= N.logo && t < N.loop && (
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, transform: `scale(${lerp(1.15, 1, ease(t, N.logo, N.logo + 0.6))})`, filter: `blur(${(1 - seg(t, N.logo, N.logo + 0.25)) * 12}px)`, paddingBottom: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 18, clipPath: `inset(0 ${(1 - ease(t, N.logo + 0.05, N.logo + 0.6)) * 100}% 0 0)` }}>
            <MMIcon s={78} /><Img src={staticFile("logo-mymotiv.png")} style={{ width: 300 }} />
          </div>
          <div style={{ color: "#fff", fontSize: 26, fontWeight: 700, opacity: seg(t, N.logo + 0.55, N.logo + 0.75) }}>Postulez. Et faites-vous recruter.</div>
          <div style={{ marginTop: 6, padding: "10px 26px", borderRadius: 999, background: "rgba(255,255,255,0.9)", color: INK, fontSize: 20, fontWeight: 800, opacity: seg(t, N.logo + 0.85, N.logo + 1.0), transform: `scale(${go(t, N.logo + 0.85, N.logo + 1.15, 0.7, 1)})` }}>Lien en bio ↑</div>
        </div>
      )}
      {t >= N.loop && <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", color: "#fff", fontWeight: 800, fontSize: 58 }}>Tu</div>}
    </div>
  );
};

export const NEcrisPlus: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;
  const light = t >= N.white && t < N.logo;
  const lightK = clamp(ease(t, N.white - 0.05, N.white + 0.3) * (1 - ease(t, N.logo - 0.08, N.logo + 0.1)));
  // caméra : lente poussée, légère dérive, petite secousse aux grands moments
  const cam = lerp(1, 1.05, seg(t, 0, NECRIS_DUR)) + 0.012 * pulse(t, N.white, 0.15) + 0.01 * pulse(t, N.logo, 0.15);
  const dx = Math.sin(t * 0.7) * 6, dy = Math.cos(t * 0.5) * 4;
  // curseur : clic sur le résultat (C), clic sur Générer (F)
  const clicks: [number, number, number][] = [[N.click, SX + SW / 2 + 180, SY + SH * 0.42 + 32], [N.gen, SX + SW / 2 + 20, SY + SH / 2 + 85]];
  let pr = 0, px = 0, py = 0, po = 0;
  for (const [ct, x, y] of clicks) {
    const vis = seg(t, ct - 0.6, ct - 0.45) * (1 - seg(t, ct + 0.3, ct + 0.45));
    if (vis > 0) { const k = ease(t, ct - 0.6, ct - 0.05); [px, py] = curve(k, [x + 260, y + 220], [x, y], [x + 200, y - 40]); po = vis; pr = pulse(t, ct, 0.07); }
  }

  return (
    <AbsoluteFill style={{ background: "#050405", overflow: "hidden", fontFamily: "Poppins" }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${cam})`, transformOrigin: "50% 48%" }}>
        {/* halo de l'écran sur le bureau */}
        <div style={{ position: "absolute", left: -100, right: -100, top: 500, height: 1200, background: light ? `radial-gradient(ellipse at 50% 30%, rgba(255,240,236,${0.22 * lightK}), rgba(0,0,0,0) 60%)` : `radial-gradient(ellipse at 50% 35%, rgba(217,130,139,0.16), rgba(0,0,0,0) 60%)` }} />
        {/* ordinateur : écran */}
        <div style={{ position: "absolute", left: SX - 14, top: SY - 14, width: SW + 28, height: SH + 28, borderRadius: 26, background: "#1A1A1C", boxShadow: "0 0 0 2px #2C2C2E, 0 30px 80px rgba(0,0,0,0.8)" }}>
          <div style={{ position: "absolute", left: 14, top: 14, width: SW, height: SH }}><Screen t={t} /></div>
          <div style={{ position: "absolute", left: SW / 2 + 8, top: 4, width: 8, height: 8, borderRadius: 4, background: "#333" }} />
        </div>
        {/* clavier */}
        <div style={{ position: "absolute", left: 10, top: SY + SH + 22, width: 1060, height: 300, clipPath: "polygon(4% 0, 96% 0, 100% 100%, 0 100%)", background: "linear-gradient(180deg, #19181B, #0C0B0D)" }}>
          {Array.from({ length: 5 }, (_, r) => (
            <div key={r} style={{ position: "absolute", left: 70 - r * 8, right: 70 - r * 8, top: 24 + r * 46, height: 36, display: "flex", gap: 7 }}>
              {Array.from({ length: 14 }, (_, c) => <div key={c} style={{ flex: r === 4 && c === 6 ? 5 : 1, borderRadius: 6, background: "#222125", boxShadow: `inset 0 0 0 1px #2E2D31, 0 0 ${light ? 10 * lightK : 6}px ${light ? `rgba(255,236,232,${0.35 * lightK})` : "rgba(217,130,139,0.18)"}` }} />)}
            </div>
          ))}
        </div>
      </AbsoluteFill>

      {/* légendes fixes, façon TikTok */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "10px 20px", borderRadius: 12, background: "#fff", color: INK, fontSize: 40, fontWeight: 700, lineHeight: 1.25, fontFamily: "Open Sans" }}>Tu écris encore tes<br />lettres de motivation ? 👀</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center" }}>
        <span style={{ display: "inline-block", padding: "10px 22px", borderRadius: 12, background: "#fff", color: INK, fontSize: 40, fontWeight: 700, fontFamily: "Open Sans" }}>N'écris plus.</span>
      </div>

      {/* curseur souris (flèche MyMotiv) */}
      {po > 0 && (
        <AbsoluteFill style={{ transform: `translate(${dx}px, ${dy}px) scale(${cam})`, transformOrigin: "50% 48%" }}>
          {clicks.map(([ct, x, y]) => <Ripple key={ct} x={x} y={y} t={t} t0={ct} />)}
          <div style={{ position: "absolute", left: 0, top: 0, transform: "scale(0.55)", transformOrigin: `${px}px ${py}px` }}><Pointer x={px} y={py} hover={0} press={pr} o={po} /></div>
        </AbsoluteFill>
      )}
      <Audio src={staticFile("audio/necris.wav")} />
    </AbsoluteFill>
  );
};
