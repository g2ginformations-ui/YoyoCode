// « Sept secondes » (≈53 s, 30 i/s, 9:16) : script collé par le propriétaire le 16/10/2026 (accroche « sept secondes »,
// la mauvaise lettre contre la bonne, le tuto MyMotiv, coupure qui annonce une partie 2), adapté aux règles du projet :
// - le chiffre est VÉRIFIÉ et dit pour ce qu'il mesure : Ladders 2018 (suivi du regard) = 7,4 s en moyenne pour le premier
//   tri d'un CV ; on dit « imagine que c'est ta lettre », jamais « un recruteur passe 7 s sur ta lettre » ; source à l'écran ;
// - « lui, on l'appelle » devient « lui, on a envie de l'appeler » (aucune promesse de résultat) ;
// - « en deux minutes » devient « en trente secondes* » (temps mesuré : 27 à 35 s par lettre) ;
// - « la phrase que les recruteurs détestent » devient « la phrase que JE déteste » (un avis, pas une étude).
// Format par défaut « démo racontée » (src/splitDemo.tsx) : panneau en haut (chronomètre, lettres avec le regard du
// recruteur, tuto sur le vrai site, public/tuto-tel/), sous-titres au milieu, Yann masqué en bas ; plein écran pour la
// coupure ; bandeau « 💬 À la fin, devine la phrase en commentaire » dès 0,3 s (src/bandeau.tsx). Son : synth_sept.py.
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bounce } from "./apple";
import { Bandeau, Rose } from "./bandeau";
import { PINK, easeInOut, easeIn, lerp, seg } from "./common";
import voix from "./data/sept-voix.json";
import { K } from "./kinetic";
import { X, horloge } from "./pubMotion";
import { Fond, SERIF, SousTitre, Visage, blocs } from "./splitDemo";
import "./fonts";

export const SEPT_DUR = voix.duration;
const { at, sc, PH } = horloge(voix);
const ROSE_C = "#F2B8C0", ROUGE = "#E5484D", GRIS = "#B8B1B3";
const ease = (t: number, a: number, b: number) => easeInOut(seg(t, a, b));
const pop = (t: number, a: number) => bounce(t, [[a, 0.5], [a + 0.18, 1]], 0.08, 3, 7);
const virgule = (x: number) => x.toFixed(1).replace(".", ",");

// ─── les temps clés (calés sur la voix) ───
const T_LETTRE = sc(1), T_REGARD = at(19), T_PHRASE = sc(2), T_POUB = at(36), T_BONNE = at(37), T_LIT = at(40), T_APPEL = at(56);
const T_DIFF = sc(7), T_TUTO = sc(8), T_30 = at(120), T_TOI = sc(10), T_DETESTE = sc(11), T_CUT = PH[11][1] + 0.05, T_FIN = T_CUT + 0.35;

// ─── le panneau du haut ───
const P = { x: 30, y: 375, w: 1020, h: 640 };
const Panneau: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", left: P.x, top: P.y, width: P.w, height: P.h, borderRadius: 34, overflow: "hidden",
    background: "radial-gradient(circle at 50% 40%, #3A2327 0%, #1E1719 45%, #121013 80%)", boxShadow: "0 0 0 2px rgba(255,255,255,0.06), 0 0 60px rgba(217,130,139,0.18)" }}>
    <div style={{ position: "absolute", left: -P.x, top: -P.y, width: 1080, height: 1920 }}>{children}</div>
  </div>
);

// ─── A. le chronomètre : 7,4 s ───
const Chrono: React.FC<{ t: number }> = ({ t }) => {
  const v = 7.4 * (1 - Math.pow(1 - seg(t, 0.45, 1.5), 3));
  return (
    <>
      <div style={{ position: "absolute", left: X, top: 640, transform: `translate(-50%, -50%) scale(${pop(t, 0.3)})`, whiteSpace: "nowrap", color: "#fff" }}>
        <span style={{ fontFamily: K, fontWeight: 900, fontSize: 230, letterSpacing: -6 }}>{virgule(v)}</span>
        <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 200, color: ROSE_C }}> s*</span>
      </div>
      <div style={{ position: "absolute", left: 120, width: 800, top: 805, textAlign: "center", fontFamily: "Poppins", fontWeight: 700, fontSize: 46, color: "#fff", opacity: seg(t, at(5), at(5) + 0.3) }}>
        pour le premier tri d'un <Rose>CV</Rose></div>
      <div style={{ position: "absolute", left: 120, width: 800, top: 905, textAlign: "center", fontFamily: "'Open Sans'", fontSize: 21, lineHeight: 1.35, color: GRIS, opacity: seg(t, 0.6, 1.0) }}>
        * Ladders, 2018 : temps moyen d'un premier tri de CV,<br />mesuré par suivi du regard (les estimations varient)</div>
    </>
  );
};

// ─── B et C. les deux lettres, le regard du recruteur, le minuteur ───
const CARTE = { x: 230, y: 455, w: 600, h: 500 };
const Marque: React.FC<{ on: number; couleur: string; children: React.ReactNode }> = ({ on, couleur, children }) => (
  <span style={{ background: `linear-gradient(90deg, ${couleur} ${on * 100}%, rgba(0,0,0,0) ${on * 100}%)`, borderRadius: 4, padding: "0 2px" }}>{children}</span>
);
const Mauvaise: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, color: "#8A8487", marginBottom: 18 }}><span>Candidature</span><span>Pour : Maison Lumen</span></div>
    <div style={{ marginBottom: 14 }}>Madame, Monsieur,</div>
    <div style={{ marginBottom: 14 }}><Marque on={seg(t, at(24), at(33) + 0.3)} couleur="rgba(250,220,90,0.55)">Je suis passionné, rigoureux, avec un bon esprit d'équipe.</Marque></div>
    <div style={{ marginBottom: 14 }}>Motivé et prêt à relever de nouveaux défis, je souhaite mettre mes compétences au service de votre entreprise.</div>
    <div>Cordialement.</div>
  </>
);
const Bonne: React.FC<{ t: number }> = ({ t }) => (
  <>
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, color: "#8A8487", marginBottom: 18 }}><span>Candidature</span><span>Pour : Maison Lumen</span></div>
    <div style={{ marginBottom: 14 }}>Madame, Monsieur,</div>
    <div style={{ marginBottom: 14 }}>Pendant deux étés, j'ai tenu seul la caisse d'un magasin :{" "}
      <span style={{ fontWeight: 700 }}><Marque on={seg(t, at(52), at(55) + 0.3)} couleur="rgba(217,130,139,0.45)">300 clients par jour.</Marque></span></div>
    <div style={{ marginBottom: 14 }}>Votre offre parle de rush et de relation client : c'est exactement ce que j'ai appris à gérer.</div>
    <div>Disponible dès lundi, j'aimerais en parler avec vous.</div>
  </>
);
const Feuille: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ width: CARTE.w, height: CARTE.h, background: "#FFFFFF", borderRadius: 12, padding: "30px 38px", boxSizing: "border-box", fontFamily: "'Open Sans'", fontSize: 25, lineHeight: 1.5,
    color: "#1E1C1D", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", position: "relative", overflow: "hidden" }}>{children}</div>
);
// le regard : [début, x, y] en px de la feuille ; chaque fixation laisse une tache qui grossit tant qu'on la regarde
type Fix = [number, number, number];
const REGARD_MAUVAISE: Fix[] = [[T_REGARD, 90, 120], [T_REGARD + 0.4, 300, 128], [T_REGARD + 0.75, 470, 130], [T_REGARD + 1.1, 120, 205], [T_REGARD + 1.4, 380, 210],
  [T_REGARD + 1.7, 200, 290], [T_REGARD + 2.0, 470, 300], [T_REGARD + 2.3, 130, 380], [T_REGARD + 2.7, 420, 120], [T_REGARD + 3.1, 260, 210], [T_REGARD + 3.6, 520, 440], [T_REGARD + 4.2, 140, 440]];
const REGARD_BONNE: Fix[] = [[T_LIT, 90, 120], [T_LIT + 0.45, 260, 135], [T_LIT + 0.9, 470, 135], [T_LIT + 1.4, 160, 175], [at(52), 330, 180], [at(53) + 0.4, 430, 180], [at(56) + 0.6, 250, 255]];
const Regard: React.FC<{ t: number; fix: Fix[]; fin: number }> = ({ t, fix, fin }) => {
  const actifs = fix.filter(([a]) => t >= a);
  if (!actifs.length) return null;
  const cur = actifs[actifs.length - 1];
  return (
    <>
      {actifs.map(([a, x, y], i) => {
        const b = i + 1 < fix.length ? fix[i + 1][0] : fin, d = Math.min(t, b) - a, r = 26 + 34 * Math.min(1, d / 1.2) + (d > 1.2 ? 40 * Math.min(1, (d - 1.2) / 1.5) : 0);
        return <div key={i} style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", mixBlendMode: "multiply",
          background: `radial-gradient(circle, rgba(229,72,77,${0.55 * (1 - 0.5 * seg(t, b, b + 1.5))}) 0%, rgba(229,130,70,0.25) 45%, rgba(255,200,80,0) 72%)` }} />;
      })}
      <div style={{ position: "absolute", left: cur[1] - 20, top: cur[2] - 20, width: 40, height: 40, borderRadius: "50%", border: `4px solid ${PINK}`, boxShadow: `0 0 12px ${PINK}`,
        transform: `scale(${1 + 0.15 * Math.sin(t * 12)})` }} />
    </>
  );
};
const Minuteur: React.FC<{ t: number; valeur: number; max?: number }> = ({ t, valeur, max = 7 }) => {
  const depasse = valeur > max;
  return (
    <div style={{ position: "absolute", left: CARTE.x, top: 398, width: CARTE.w, display: "flex", alignItems: "center", gap: 18 }}>
      <span style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 30, color: depasse ? ROSE_C : "#fff", minWidth: 150 }}>👁 {virgule(valeur)} s</span>
      <div style={{ flex: 1, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.12)", overflow: "hidden" }}>
        <div style={{ width: `${Math.min(1, valeur / max) * 100}%`, height: "100%", background: depasse ? PINK : valeur >= max - 0.05 ? ROUGE : "#fff" }} />
      </div>
    </div>
  );
};
const Lettres: React.FC<{ t: number }> = ({ t }) => {
  const mauvaise = t < T_BONNE + 0.2, entreeM = ease(t, T_LETTRE - 0.1, T_LETTRE + 0.35);
  const chute = easeIn(seg(t, T_POUB + 0.45, T_POUB + 1.0)), barre = seg(t, T_POUB - 0.05, T_POUB + 0.15);
  const entreeB = ease(t, T_BONNE - 0.05, T_BONNE + 0.4);
  const vMauvaise = 7 * seg(t, T_REGARD, T_POUB), vBonne = 1.4 * Math.max(0, t - T_LIT);
  return (
    <>
      {mauvaise && (
        <div style={{ position: "absolute", left: CARTE.x + lerp(700, 0, entreeM), top: CARTE.y + 600 * chute, transform: `rotate(${-1.5 + 25 * chute}deg) scale(${1 - 0.45 * chute})`, opacity: 1 - seg(t, T_POUB + 0.8, T_POUB + 1.0) }}>
          <Feuille>
            <Mauvaise t={t} />
            <Regard t={t} fix={REGARD_MAUVAISE} fin={T_POUB} />
          </Feuille>
          {barre > 0 && <div style={{ position: "absolute", left: -20, top: CARTE.h / 2 - 6, width: (CARTE.w + 40) * barre, height: 14, background: ROUGE, borderRadius: 7, transform: "rotate(-24deg)", transformOrigin: "0 50%", boxShadow: "0 0 18px rgba(229,72,77,0.7)" }} />}
        </div>
      )}
      {t >= T_POUB && t < T_BONNE + 0.3 && (
        <div style={{ position: "absolute", left: X - 60, top: 880, fontSize: 110, transform: `scale(${pop(t, T_POUB + 0.1)})`, opacity: 1 - seg(t, T_BONNE - 0.1, T_BONNE + 0.2) }}>🗑️</div>
      )}
      {t >= T_BONNE - 0.05 && (
        <div style={{ position: "absolute", left: CARTE.x + lerp(760, 0, entreeB), top: CARTE.y, transform: "rotate(1deg)" }}>
          <Feuille>
            <Bonne t={t} />
            <Regard t={t} fix={REGARD_BONNE} fin={T_DIFF} />
          </Feuille>
          {t >= T_APPEL && (
            <div style={{ position: "absolute", left: CARTE.w - 70, top: -40, width: 110, height: 110, borderRadius: 55, background: PINK, display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 60, boxShadow: `0 0 0 ${10 + 8 * Math.abs(Math.sin(t * 9))}px rgba(217,130,139,0.25), 0 10px 30px rgba(0,0,0,0.5)`,
              transform: `scale(${pop(t, T_APPEL)}) rotate(${Math.sin(t * 60) * 9 * (Math.sin(t * 6) > 0 ? 1 : 0)}deg)` }}>📞</div>
          )}
        </div>
      )}
      {t >= T_REGARD && t < T_POUB + 0.9 && <Minuteur t={t} valeur={vMauvaise} />}
      {t >= T_LIT && <Minuteur t={t} valeur={vBonne} />}
    </>
  );
};

// ─── D. la différence : la phrase de la lettre vient du CV ───
const Difference: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T_DIFF - 0.1, T_DIFF + 0.35), lien = seg(t, at(70), at(70) + 0.5), tampon = at(69) + 0.1;
  const carte: React.CSSProperties = { position: "absolute", top: 470, background: "#FFFFFF", borderRadius: 12, padding: "24px 26px", boxSizing: "border-box", fontFamily: "'Open Sans'",
    fontSize: 22, lineHeight: 1.45, color: "#1E1C1D", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" };
  return (
    <>
      <div style={{ ...carte, left: lerp(-400, 125, k), width: 350, height: 400 }}>
        <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 30, marginBottom: 6 }}>CV</div>
        <div style={{ height: 8, width: 160, background: "#E6E1E3", borderRadius: 4, marginBottom: 18 }} />
        <div style={{ fontWeight: 700 }}>Expérience</div>
        <div style={{ padding: "6px 8px", borderRadius: 8, marginTop: 6, background: `rgba(217,130,139,${0.3 * lien})`, boxShadow: lien > 0 ? `0 0 0 ${3 * lien}px ${PINK}` : "none" }}>
          Caissier · magasin<br /><span style={{ color: "#6E686B" }}>étés 2024 et 2025</span><br />≈ 300 clients par jour</div>
        <div style={{ height: 8, width: 220, background: "#E6E1E3", borderRadius: 4, marginTop: 22 }} />
        <div style={{ height: 8, width: 180, background: "#E6E1E3", borderRadius: 4, marginTop: 12 }} />
      </div>
      <div style={{ ...carte, left: lerp(1100, 555, k), width: 360, height: 400 }}>
        <div style={{ fontSize: 16, color: "#8A8487", marginBottom: 14 }}>Lettre · Maison Lumen</div>
        <div style={{ padding: "6px 8px", borderRadius: 8, background: `rgba(217,130,139,${0.3 * lien})`, boxShadow: lien > 0 ? `0 0 0 ${3 * lien}px ${PINK}` : "none" }}>
          Pendant deux étés, j'ai tenu seul la caisse d'un magasin : <b>300 clients par jour.</b></div>
        <div style={{ height: 8, width: 260, background: "#E6E1E3", borderRadius: 4, marginTop: 22 }} />
        <div style={{ height: 8, width: 200, background: "#E6E1E3", borderRadius: 4, marginTop: 12 }} />
      </div>
      {lien > 0 && (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1080} height={1920}>
          <path d="M 470 640 C 520 640, 510 600, 560 600" fill="none" stroke={PINK} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lien} />
        </svg>
      )}
      {t >= tampon && (
        <div style={{ position: "absolute", left: X, top: 915, transform: `translate(-50%, -50%) rotate(-6deg) scale(${bounce(t, [[tampon, 1.6], [tampon + 0.12, 0.95], [tampon + 0.25, 1]], 0.04, 3, 8)})`,
          padding: "6px 26px", border: `6px solid ${ROSE_C}`, borderRadius: 12, fontFamily: "Poppins", fontWeight: 900, fontSize: 46, letterSpacing: 3, color: ROSE_C, background: "rgba(11,10,11,0.75)", whiteSpace: "nowrap" }}>
          RIEN D'INVENTÉ</div>
      )}
    </>
  );
};

// ─── E. le tuto sur le vrai site (captures téléphone, réponses d'IA simulées : « le vrai site », jamais « en direct ») ───
const ECRANS: [number, string][] = [[T_TUTO, "001-accueil"], [at(87), "002-cv"], [at(92), "013-cv-lu"], [at(94), "015-offre-collee"], [at(106), "030-generation"], [at(114), "040-lettre"]];
const ETAPES: [number, string, string][] = [[at(87), "Ton CV", "même en photo"], [at(94), "L'offre", "le lien, ou le texte"], [at(106), "Ta lettre", "faite pour cette offre"]];
const Tuto: React.FC<{ t: number }> = ({ t }) => {
  const k = ease(t, T_TUTO - 0.1, T_TUTO + 0.35);
  let img = ECRANS[0][1]; ECRANS.forEach(([a, f]) => { if (t >= a) img = f; });
  const TW = 330, TH = Math.round(TW * 1920 / 1080), s = TW / 1080, tx = 150, ty = 405;
  const actif = ETAPES.reduce((m, [a], i) => (t >= a ? i : m), -1);
  return (
    <>
      <div style={{ position: "absolute", left: tx, top: ty + lerp(700, 0, k), width: TW, height: TH, borderRadius: 40, border: "10px solid #1B191A", overflow: "hidden", boxSizing: "content-box",
        boxShadow: "0 0 0 2px rgba(255,255,255,0.08), 0 0 50px rgba(217,130,139,0.25)", background: "#0B0A0B" }}>
        <Img src={staticFile(`tuto-tel/${img}.jpg`)} style={{ width: TW, height: TH }} />
        {img === "040-lettre" && t >= at(115) && (
          <div style={{ position: "absolute", left: 140 * s - 6, top: 808 * s - 6, width: 790 * s + 12, height: 134 * s + 12, borderRadius: 8, border: `4px solid ${PINK}`, boxShadow: `0 0 16px ${PINK}`, opacity: seg(t, at(115), at(115) + 0.2) }} />
        )}
      </div>
      <div style={{ position: "absolute", left: 540, top: 455, width: 370 }}>
        {ETAPES.map(([a, titre, sous], i) => t >= a && (
          <div key={i} style={{ display: "flex", gap: 18, alignItems: "center", marginBottom: 30, opacity: i === actif ? 1 : 0.45, transform: `scale(${pop(t, a)})`, transformOrigin: "0 50%" }}>
            <div style={{ width: 64, height: 64, borderRadius: 32, background: i === actif ? PINK : "#3A3436", color: "#fff", fontFamily: "Poppins", fontWeight: 900, fontSize: 34,
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</div>
            <div>
              <div style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 38, color: "#fff", lineHeight: 1.1 }}>{titre}</div>
              <div style={{ fontFamily: "'Open Sans'", fontWeight: 600, fontSize: 24, color: GRIS }}>{sous}</div>
            </div>
          </div>
        ))}
        {t >= T_30 - 0.1 && (
          <div style={{ marginTop: 6, display: "inline-block", padding: "10px 26px", borderRadius: 30, background: PINK, fontFamily: K, fontWeight: 900, fontSize: 52, color: "#fff", transform: `scale(${pop(t, T_30 - 0.1)})`, transformOrigin: "0 50%" }}>30 s*</div>
        )}
      </div>
      {t >= T_30 - 0.1 && <div style={{ position: "absolute", left: 540, top: 975, fontFamily: "'Open Sans'", fontSize: 20, color: GRIS, opacity: seg(t, T_30, T_30 + 0.3) }}>* temps mesuré : 27 à 35 s par lettre</div>}
    </>
  );
};

// ─── F. « Pas de mots creux. Pas de mensonges. Juste toi… mais mieux dit. » ───
const Toi: React.FC<{ t: number }> = ({ t }) => {
  const l = (a: number, child: React.ReactNode, y: number) => t >= a && (
    <div style={{ position: "absolute", left: 120, width: 800, top: y, textAlign: "center", transform: `scale(${pop(t, a)})`, whiteSpace: "nowrap" }}>{child}</div>
  );
  const barre: React.CSSProperties = { fontFamily: "Poppins", fontWeight: 800, fontSize: 60, color: "#fff" };
  return (
    <>
      {l(at(122) - 0.05, <span style={barre}><span style={{ color: ROUGE }}>✕</span> Pas de mots creux.</span>, 450)}
      {l(at(126) - 0.05, <span style={barre}><span style={{ color: ROUGE }}>✕</span> Pas de mensonges.</span>, 545)}
      {l(at(129) - 0.05, <span style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: 84, color: "#fff" }}>Juste toi,</span>, 680)}
      {l(at(131) - 0.05, <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 120, color: ROSE_C }}>mais mieux dit.</span>, 790)}
    </>
  );
};

// ─── la fin : coupe sèche, puis « PARTIE 2 » ───
const Partie2: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill style={{ background: "#070607" }}>
    {t >= T_FIN && (
      <>
        <div style={{ position: "absolute", left: X, top: 640, transform: `translate(-50%, -50%) scale(${pop(t, T_FIN)})`, fontFamily: K, fontWeight: 900, fontSize: 170, color: ROSE_C, letterSpacing: -4, whiteSpace: "nowrap",
          textShadow: "0 0 50px rgba(217,130,139,0.6)" }}>PARTIE 2</div>
        <div style={{ position: "absolute", left: 120, width: 800, top: 790, textAlign: "center", fontFamily: "Poppins", fontWeight: 800, fontSize: 52, color: "#fff", lineHeight: 1.2, opacity: seg(t, T_FIN + 0.35, T_FIN + 0.6) }}>
          Devine la phrase<br />en commentaire 👇</div>
        <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 120, top: 1040, width: 240, opacity: 0.9 * seg(t, T_FIN + 0.6, T_FIN + 0.9) }} />
      </>
    )}
  </AbsoluteFill>
);

// ─── sous-titres et poses ───
const BL = blocs(voix);
const CLES = new Set(["secondes", "cv", "lettre", "voit", "passionne", "rigoureux", "poubelle", "clients", "jour", "appeler", "difference", "invente", "parcours", "mymotiv", "photo", "lien", "texte",
  "concretes", "offre", "deteste", "motivation"]);
const POSES: [number, string][] = [[0, "g2-affirmer"], [T_LETTRE, "g2-raconter"], [T_PHRASE, "emo-degout"], [at(34), "g2-insister"], [T_BONNE, "g2-partager"], [T_APPEL, "emo-joie"],
  [T_DIFF, "g2-expliquer"], [T_TUTO, "g1-expliquer"], [at(94), "g2-preciser"], [at(106), "g2-decrire"], [T_TOI, "g1-convaincre"], [at(129), "emo-joie"], [T_DETESTE, "emo-reflexion"], [at(139), "emo-degout"]];

export const SeptSecondes: React.FC = () => {
  const f = useCurrentFrame(), { fps } = useVideoConfig(), t = f / fps;
  return (
    <AbsoluteFill style={{ background: "#070607", overflow: "hidden" }}>
      {t >= T_CUT ? <Partie2 t={t} /> : <Scene t={t} />}
      <Audio src={staticFile("audio/sept.wav")} />
    </AbsoluteFill>
  );
};
const Scene: React.FC<{ t: number }> = ({ t }) => {
  const plein = t >= T_DETESTE;
  const push = 1 + 0.1 * ease(t, T_DETESTE, T_CUT);
  return (
    <AbsoluteFill style={{ background: "#070607", overflow: "hidden" }}>
      <Fond />
      {plein ? <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 40%" }}><Visage t={t} poses={POSES} plein /></AbsoluteFill> : (
        <>
          <Panneau>
            {t < T_LETTRE + 0.3 && <div style={{ opacity: 1 - seg(t, T_LETTRE - 0.1, T_LETTRE + 0.2) }}><Chrono t={t} /></div>}
            {t >= T_LETTRE - 0.1 && t < T_DIFF + 0.3 && <div style={{ opacity: 1 - seg(t, T_DIFF - 0.1, T_DIFF + 0.2) }}><Lettres t={t} /></div>}
            {t >= T_DIFF - 0.1 && t < T_TUTO + 0.3 && <div style={{ opacity: 1 - seg(t, T_TUTO - 0.1, T_TUTO + 0.2) }}><Difference t={t} /></div>}
            {t >= T_TUTO - 0.1 && t < T_TOI + 0.3 && <div style={{ opacity: 1 - seg(t, T_TOI - 0.1, T_TOI + 0.2) }}><Tuto t={t} /></div>}
            {t >= T_TOI - 0.1 && <Toi t={t} />}
          </Panneau>
          <Visage t={t} poses={POSES} />
        </>
      )}
      {!(t >= T_TOI && t < T_DETESTE) && <SousTitre t={t} bl={BL} cles={CLES} y={plein ? 1330 : 1112} size={64} />}
      <Bandeau t={t} size={29} rappels={[T_DETESTE]}>💬 À la fin, <Rose>devine la phrase</Rose> en commentaire</Bandeau>
    </AbsoluteFill>
  );
};
