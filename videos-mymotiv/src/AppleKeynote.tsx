// « La keynote MyMotiv » (22,5 s, 60 i/s, 9:16) — motion design style Apple (skill apple-motion) sur fond uni noir clair,
// sans voix (tout se lit à l'écran), sur la musique de l'utilisateur : ses percussions tombent sur la révélation des prix.
// Hook « On a réinventé la lettre de motivation. » → point rose → rond → pilule « mymotiv. » → champ « lien de l'offre »
// → carte de la lettre (s'écrit, chrono 30 s*, le logo de l'entreprise se pose) → Plus court / Plus long → 4 styles de PDF
// → CV adapté → tout se resserre en un point rose → « boum » : les 4 offres (prix réels de lettre-ia/lib/pricing.ts)
// → « Ta 1re lettre est offerte » → rotation, rond, logo, slogan, lien en bio.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { TextDrop, bounce, curve, go, press, soft } from "./apple";
import { PINK, PINK_L, clamp, lerp, seg } from "./common";
import "./fonts";

const D = { bg: "#1C1C1E", card: "#2C2C2E", line: "#3A3A3C", ink: "#F5F5F7", soft: "#8E8E93" };
const CX = 540, CY = 880;
export const KEYNOTE_DUR = 22.5;
const mix = (a: string, b: string, k: number) => {
  const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const A = p(a), B = p(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k)))).join(",")})`;
};
// Temps clés (s)
const T = { dot: 2.2, logo: 3.25, lien: 4.7, lettre: 6.45, logoEnt: 8.5, court: 9.75, long: 10.3, styles: 11.0, cv: 12.45,
  point: 13.6, drop: 14.5, offerte: 18.1, fin: 19.9 };
// Les 4 offres (lettre-ia/lib/pricing.ts)
const PLANS = [
  { name: "1 lettre", price: "0,99 €", period: "paiement unique" },
  { name: "Semaine", price: "1,99 €", period: "par semaine" },
  { name: "Mois", price: "7,99 €", period: "par mois" },
  { name: "À vie", price: "12,99 €", period: "paiement unique", badge: "Le plus avantageux" },
];
const STYLES: [string, string, string, string][] = [   // nom, papier, encre des lignes, accent
  ["Classique", "#FFFFFF", "#D9D9DE", "#FFFFFF"], ["Moderne", "#FFFFFF", "#D9D9DE", PINK], ["Minimaliste", "#FAFAFA", "#E6E6EA", "#FAFAFA"], ["Sombre", "#1D1D1F", "#3A3A3C", PINK],
];
const LINES = [86, 90, 78, 92, 70, 88, 82, 64, 90, 76, 84, 46];

export const AppleKeynote: React.FC<{ audio?: string }> = ({ audio = "audio/apple-keynote.wav" }) => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;

  // ═════ la forme unique : point → rond rose → pilule (logo, lien) → carte (lettre, styles, CV) → rien ═════
  const fw = bounce(t, [[T.dot, 0], [T.dot + 0.35, 220], [T.logo, 220], [T.logo + 0.4, 660], [T.lien, 660], [T.lien + 0.4, 860],
    [T.lettre, 860], [T.lettre + 0.4, 700], [T.point, 700], [T.point + 0.35, 0]]);
  const fh = bounce(t, [[T.dot, 0], [T.dot + 0.35, 220], [T.logo, 220], [T.logo + 0.4, 200], [T.lien, 200], [T.lien + 0.4, 150],
    [T.lettre, 150], [T.lettre + 0.4, 880], [T.court, 880], [T.court + 0.35, 700], [T.long, 700], [T.long + 0.35, 980],
    [T.styles - 0.2, 980], [T.styles + 0.15, 880], [T.point, 880], [T.point + 0.35, 0]]);
  const fColor = t < T.logo + 0.3 ? mix(PINK, D.card, seg(t, T.logo, T.logo + 0.3)) : D.card;
  const fScale = press(t, T.logo - 0.12) * press(t, T.lien - 0.12) * press(t, T.lettre - 0.12) * press(t, T.cv - 0.12);
  const fRadius = fh > 300 ? 52 : Math.min(fw, fh) / 2;
  const fx = CX - fw / 2, fy = CY - fh / 2;
  const paperL = fx + 30, paperT = fy + 150, paperW = fw - 60, paperH = fh - 180;

  // style de PDF courant
  const si = t < T.styles ? 0 : Math.min(3, Math.floor((t - T.styles) / 0.36));
  const st = STYLES[t > T.cv ? 0 : si];

  // logo de l'entreprise : vole en courbe jusqu'à l'en-tête
  const lk = go(t, T.logoEnt - 0.45, T.logoEnt, 0, 1);
  const [lx, ly] = curve(clamp(lk), [1180, 260], [fx + 78, fy + 76], [900, 300]);

  // point rose de tension, puis les 4 offres
  const dotR = bounce(t, [[T.point + 0.15, 0], [T.point + 0.5, 70], [T.drop - 0.12, 70], [T.drop, 40], [T.drop + 0.12, 0]]) * (1 + 0.06 * Math.sin((t - T.point) * 14));
  const out = go(t, T.offerte - 0.3, T.offerte, 0, 1);

  // pilule finale « offerte » → rond → logo
  const pw = bounce(t, [[T.offerte - 0.05, 0], [T.offerte + 0.35, 860], [T.fin, 860], [T.fin + 0.35, 220], [T.fin + 0.6, 220], [T.fin + 0.9, 0]]);
  const ph = bounce(t, [[T.offerte - 0.05, 0], [T.offerte + 0.35, 200], [T.fin, 200], [T.fin + 0.35, 220], [T.fin + 0.6, 220], [T.fin + 0.9, 0]]);
  const rot = bounce(t, [[T.fin - 0.7, 0], [T.fin - 0.35, 2.5], [T.fin, -1.5], [T.fin + 0.3, 0]]);
  const endK = soft(t, T.fin + 0.75, fps);

  const title = (a: number, b: number, l1: string, l2?: string, pink2 = true) => t > a - 0.1 && t < b + 0.25 && (
    <div style={{ position: "absolute", left: 50, right: 50, top: 200, textAlign: "center", fontSize: 70, fontWeight: 700, lineHeight: 1.14 }}>
      <TextDrop t={t} t0={a} text={l1} out={b} />
      {l2 && <><br /><span style={{ color: pink2 ? PINK : D.soft }}><TextDrop t={t} t0={a + 0.35} text={l2} out={b} /></span></>}
    </div>
  );

  return (
    <AbsoluteFill style={{ background: D.bg, fontFamily: "Poppins", color: D.ink }}>
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${rot}deg)`, transformOrigin: `${CX}px ${CY}px` }}>
        {/* ── hook ── */}
        {t < 2.3 && (
          <div style={{ position: "absolute", left: 40, right: 40, top: 640, textAlign: "center", fontSize: 104, fontWeight: 800, lineHeight: 1.08, letterSpacing: -2 }}>
            <TextDrop t={t} t0={0.12} text="On a réinventé" out={2.0} stagger={0.07} /><br />
            <span style={{ color: PINK }}><TextDrop t={t} t0={0.55} text="la lettre de" out={2.0} stagger={0.07} /><br /><TextDrop t={t} t0={0.75} text="motivation." out={2.0} /></span>
          </div>
        )}

        {/* ── titres ── */}
        {title(T.logo + 0.2, T.lien - 0.2, "Voici MyMotiv.")}
        {title(T.lien + 0.15, T.lettre - 0.2, "Colle le lien", "de l'offre.")}
        {title(T.lettre + 0.15, T.court - 0.25, "Ta lettre, sur-mesure.")}
        {t > T.lettre + 0.4 && t < T.logoEnt - 0.1 && <div style={{ position: "absolute", left: 50, right: 50, top: 280, textAlign: "center", fontSize: 70, fontWeight: 700, color: PINK }}><TextDrop t={t} t0={T.lettre + 0.5} text="En 30 secondes*." out={T.logoEnt - 0.35} /></div>}
        {t > T.logoEnt - 0.25 && t < T.court && <div style={{ position: "absolute", left: 50, right: 50, top: 280, textAlign: "center", fontSize: 70, fontWeight: 700, color: PINK }}><TextDrop t={t} t0={T.logoEnt - 0.2} text="Avec son logo." out={T.court - 0.25} /></div>}
        {title(T.court - 0.05, T.styles - 0.2, "Plus court ? Plus long ?", "1 clic.")}
        {title(T.styles + 0.05, T.cv - 0.2, "4 styles de PDF.")}
        {title(T.cv + 0.1, T.point - 0.15, "Et ton CV,", "adapté à l'offre.")}
        {title(T.point + 0.1, T.drop - 0.1, "Et le prix ?", undefined)}
        {t > T.drop - 0.05 && t < T.offerte && <div style={{ position: "absolute", left: 50, right: 50, top: 230, textAlign: "center", fontSize: 70, fontWeight: 700 }}><TextDrop t={t} t0={T.drop + 0.05} text="Choisis ta formule." out={T.offerte - 0.3} /></div>}

        {/* ── la forme ── */}
        <div style={{ position: "absolute", left: fx, top: fy, width: fw, height: fh, borderRadius: fRadius, background: fColor, transform: `scale(${fScale})`, overflow: "hidden", boxShadow: t < T.logo + 0.3 ? "0 18px 60px rgba(217,130,139,0.35)" : "0 30px 80px rgba(0,0,0,0.45)" }}>
          {/* pilule logo */}
          {t > T.logo + 0.1 && t < T.lien + 0.1 && (
            <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: (fw - 440) / 2, top: (fh - 101) / 2, width: 440, opacity: seg(t, T.logo + 0.2, T.logo + 0.45) * (1 - seg(t, T.lien - 0.15, T.lien)), transform: `translateY(${go(t, T.logo + 0.2, T.logo + 0.55, 40, 0)}px)` }} />
          )}
          {/* champ lien */}
          {t > T.lien + 0.1 && t < T.lettre + 0.1 && (
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", gap: 24, padding: "0 40px", opacity: 1 - seg(t, T.lettre - 0.15, T.lettre) }}>
              <div style={{ fontSize: 48 }}>🔗</div>
              <div style={{ fontSize: 40, fontWeight: 600, whiteSpace: "nowrap" }}><TextDrop t={t} t0={T.lien + 0.3} text="…/offre/manager-ventes" by="chars" from={[0, 20]} stagger={0.03} dur={0.2} /></div>
              <div style={{ marginLeft: "auto", flex: "none", width: 64, height: 64, borderRadius: 32, background: PINK, color: "#fff", fontSize: 36, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${go(t, T.lien + 1.1, T.lien + 1.4, 0, 1)})` }}>✓</div>
            </div>
          )}
          {/* carte : en-tête + papier (lettre, styles, puis CV) */}
          {t > T.lettre + 0.2 && t < T.point + 0.3 && (
            <div style={{ position: "absolute", inset: 0, opacity: seg(t, T.lettre + 0.25, T.lettre + 0.45) * (1 - seg(t, T.point - 0.1, T.point + 0.1)) }}>
              <div style={{ position: "absolute", left: 30, top: 28, width: 96, height: 96, borderRadius: 22, border: `3px dashed ${D.line}`, opacity: t > T.cv ? 0 : 1 - seg(t, T.logoEnt - 0.05, T.logoEnt + 0.1) }} />
              <div style={{ position: "absolute", left: 148, top: 40, fontSize: 32, fontWeight: 700 }}>{t > T.cv ? "CV · Camille Dubois" : "Maison Lumen"}</div>
              <div style={{ position: "absolute", left: 148, top: 82, fontSize: 25, fontWeight: 600, color: D.soft }}>{t > T.cv ? "Adapté à : Manager des ventes" : "Manager des ventes · Lyon"}</div>
              <div style={{ position: "absolute", left: 30, top: 150, width: paperW, height: Math.max(0, paperH), borderRadius: 22, overflow: "hidden", background: st[1], transform: `scale(${t > T.styles && t < T.cv ? bounce(t, [[T.styles + si * 0.36, 0.96], [T.styles + si * 0.36 + 0.2, 1]]) : 1})` }}>
                {st[3] !== st[1] && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 18, background: st[3] }} />}
                {t < T.cv ? LINES.map((w, i) => {
                  const a = T.lettre + 0.45 + i * 0.1;
                  return <div key={i} style={{ position: "absolute", left: 50, top: 50 + i * 54, width: `${w * 0.86}%`, height: 16, borderRadius: 8, background: i === 0 ? mix(st[2], PINK, 0.4) : st[2], transform: `scaleX(${go(t, a, a + 0.3, 0, 1)})`, transformOrigin: "0 50%" }} />;
                }) : (
                  <>
                    <div style={{ position: "absolute", left: 44, top: 40, width: 90, height: 90, borderRadius: 45, background: "#E6E6EA" }} />
                    <div style={{ position: "absolute", left: 156, top: 52, width: 260, height: 26, borderRadius: 13, background: "#C7C7CC" }} />
                    <div style={{ position: "absolute", left: 156, top: 94, width: 180, height: 18, borderRadius: 9, background: "#E6E6EA" }} />
                    {Array.from({ length: 9 }, (_, i) => {
                      const hl = [1, 3, 6].includes(i), a = T.cv + 0.4 + i * 0.06;
                      return (
                        <div key={i} style={{ position: "absolute", left: 44, top: 170 + i * 52, width: `${[60, 82, 74, 88, 50, 78, 84, 70, 56][i]}%`, height: 18, borderRadius: 9, background: "#E6E6EA", overflow: "hidden" }}>
                          {hl && <div style={{ position: "absolute", inset: 0, background: PINK, transform: `scaleX(${go(t, a + 0.3, a + 0.65, 0, 1)})`, transformOrigin: "0 50%" }} />}
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* logo de l'entreprise */}
        {t > T.logoEnt - 0.5 && t < T.cv && (
          <Img src={staticFile("company.png")} style={{ position: "absolute", left: lx - 48, top: ly - 48, width: 96, height: 96, borderRadius: 20, transform: `scale(${bounce(t, [[T.logoEnt - 0.45, 1.6], [T.logoEnt, 1]])})`, boxShadow: `0 0 ${lerp(0, 44, seg(t, T.logoEnt, T.logoEnt + 0.2)) * (1 - seg(t, T.logoEnt + 0.6, T.logoEnt + 1.2))}px ${PINK}`, opacity: seg(t, T.logoEnt - 0.5, T.logoEnt - 0.35) * (1 - seg(t, T.cv - 0.15, T.cv)) }} />
        )}

        {/* chrono */}
        {t > T.lettre + 0.4 && t < T.court - 0.1 && (
          <div style={{ position: "absolute", left: CX - 150, top: CY + 440 - 50, width: 300, height: 96, borderRadius: 48, background: PINK, color: "#fff", fontSize: 42, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontVariantNumeric: "tabular-nums", transform: `scale(${go(t, T.lettre + 0.4, T.lettre + 0.75, 0, 1)})`, opacity: 1 - seg(t, T.court - 0.3, T.court - 0.1) }}>
            ⏱ {Math.round(30 * seg(t, T.lettre + 0.5, T.lettre + 1.8))} s*
          </div>
        )}
        {t > T.lettre + 0.5 && t < T.court && <div style={{ position: "absolute", left: 0, right: 0, top: CY + 580, textAlign: "center", fontSize: 26, color: D.soft, fontFamily: "Open Sans", opacity: seg(t, T.lettre + 0.5, T.lettre + 0.8) * (1 - seg(t, T.court - 0.3, T.court - 0.1)) }}>* temps mesuré : 27 à 35 s par lettre</div>}

        {/* Plus court / Plus long */}
        {t > T.court - 0.3 && t < T.styles && ([["Plus court", CX - 160, T.court], ["Plus long", CX + 160, T.long]] as const).map(([label, x, a]) => {
          const k = go(t, T.court - 0.3, T.court + 0.05, 0, 1), hot = seg(t, a - 0.1, a) * (1 - seg(t, a + 0.4, a + 0.55));
          return <div key={label} style={{ position: "absolute", left: x - 140, top: 1440, width: 280, height: 100, borderRadius: 50, background: mix(D.card, PINK, hot), color: "#fff", fontSize: 36, fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${k * press(t, a)})`, opacity: clamp(k * 2) * (1 - seg(t, T.styles - 0.2, T.styles)) }}>{label}</div>;
        })}
        {/* nom du style */}
        {t > T.styles - 0.1 && t < T.cv && (
          <div style={{ position: "absolute", left: CX - 200, top: 1360, width: 400, height: 100, borderRadius: 50, background: PINK, color: "#fff", fontSize: 40, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transform: `scale(${go(t, T.styles - 0.1, T.styles + 0.25, 0, 1)})`, opacity: 1 - seg(t, T.cv - 0.2, T.cv) }}>
            <span key={si} style={{ display: "inline-block", transform: `translateY(${go(t, T.styles + si * 0.36, T.styles + si * 0.36 + 0.25, -60, 0)}px)` }}>{STYLES[si][0]}</span>
          </div>
        )}

        {/* point rose de tension */}
        {dotR > 0.5 && <div style={{ position: "absolute", left: CX - dotR, top: CY - dotR, width: dotR * 2, height: dotR * 2, borderRadius: "50%", background: PINK, boxShadow: `0 0 ${dotR}px rgba(217,130,139,0.6)` }} />}

        {/* ── les 4 offres ── */}
        {t > T.drop - 0.02 && t < T.offerte + 0.05 && PLANS.map((p, i) => {
          const a = T.drop + i * 0.08, k = go(t, a, a + 0.42, 0, 1);
          const tx = i % 2 === 0 ? 290 : 790, ty = 640 + Math.floor(i / 2) * 400;
          const [x, y] = curve(clamp(k) * (1 - out), [CX, CY], [tx, ty], [CX + (i % 2 ? 300 : -300), CY]);
          const s = lerp(0.2, 1, clamp(k)) * (1 - out * 0.8);
          const best = !!p.badge;
          return (
            <div key={p.name} style={{ position: "absolute", left: x - 230, top: y - 170, width: 460, height: 340, borderRadius: 44, background: best ? PINK : D.card, color: best ? "#fff" : D.ink, transform: `scale(${s})`, opacity: clamp(k * 3) * (1 - out), boxShadow: best ? "0 20px 60px rgba(217,130,139,0.45)" : "0 20px 50px rgba(0,0,0,0.4)", textAlign: "center", zIndex: 3 }}>
              {best && <div style={{ position: "absolute", left: 0, right: 0, top: -30, display: "flex", justifyContent: "center" }}><div style={{ padding: "10px 26px", borderRadius: 999, background: "#fff", color: PINK, fontSize: 26, fontWeight: 700, transform: `scale(${go(t, a + 0.5, a + 0.8, 0, 1)})` }}>{p.badge}</div></div>}
              <div style={{ marginTop: 56, fontSize: 38, fontWeight: 600, color: best ? "#fff" : D.soft }}>{p.name}</div>
              <div style={{ marginTop: 6, fontSize: 92, fontWeight: 800, letterSpacing: -2, color: best ? "#fff" : PINK_L }}><TextDrop t={t} t0={a + 0.15} text={p.price} by="chars" from={[0, 50]} stagger={0.03} /></div>
              <div style={{ marginTop: 2, fontSize: 28, fontWeight: 600, color: best ? "#FFE9EC" : D.soft }}>{p.period}</div>
            </div>
          );
        })}
        {t > T.drop + 0.6 && t < T.offerte && <div style={{ position: "absolute", left: 40, right: 40, top: 1490, textAlign: "center", fontSize: 26, color: D.soft, fontFamily: "Open Sans", lineHeight: 1.5, opacity: seg(t, T.drop + 0.6, T.drop + 0.9) * (1 - out) }}>Semaine, Mois, À vie : lettres illimitées* · CV adapté · 4 styles de PDF<br />* 30 lettres par semaine au maximum</div>}

        {/* ── pilule finale ── */}
        <div style={{ position: "absolute", left: CX - pw / 2, top: CY - ph / 2, width: pw, height: ph, borderRadius: ph / 2, background: PINK, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", boxShadow: "0 18px 50px rgba(217,130,139,0.35)", transform: `scale(${press(t, T.fin - 0.1)})`, zIndex: 4 }}>
          {t > T.offerte + 0.1 && t < T.fin && <div style={{ fontSize: 56, fontWeight: 700, whiteSpace: "nowrap", opacity: 1 - seg(t, T.fin - 0.2, T.fin - 0.05) }}><TextDrop t={t} t0={T.offerte + 0.2} text="Ta 1re lettre est offerte" from={[0, 70]} /></div>}
        </div>
        {t > T.offerte + 0.4 && t < T.fin && <div style={{ position: "absolute", left: 0, right: 0, top: CY + 150, textAlign: "center", fontSize: 50, fontWeight: 600, color: D.soft }}><TextDrop t={t} t0={T.offerte + 0.6} text="Sans inscription." out={T.fin - 0.2} /></div>}
      </div>

      {/* ── fin : logo + slogan + lien ── */}
      {t > T.fin + 0.6 && (
        <>
          <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: CX - 300, top: 640, width: 600, opacity: endK, transform: `translateY(${(1 - endK) * 40}px) scale(${lerp(0.92, 1, endK)})` }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontSize: 64, fontWeight: 700, lineHeight: 1.15 }}>
            <TextDrop t={t} t0={T.fin + 0.95} text="Avec MyMotiv, postulez." from={[0, -60]} /><br />
            <span style={{ color: PINK }}><TextDrop t={t} t0={T.fin + 1.3} text="Et faites-vous recruter." from={[0, -60]} /></span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: 1110, textAlign: "center", fontSize: 40, fontWeight: 700, color: PINK_L }}>
            <TextDrop t={t} t0={T.fin + 1.75} text="Lien en bio ↑" from={[0, 40]} />
          </div>
        </>
      )}
      <Audio src={staticFile(audio)} />
    </AbsoluteFill>
  );
};
