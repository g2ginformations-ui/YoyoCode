// « Avant / Après » (≈22 s, 60 i/s, 9:16) — pub motion design style Apple sur fond clair, avec la voix pub « Paul K ».
// Levier de conversion : la preuve par le résultat. Une lettre générique (les formules creuses que lib/prompts.ts bannit)
// surlignée au feutre → elle se multiplie en 9 lettres identiques (« chez tout le monde ») → avec MyMotiv on colle le lien
// de l'offre → la carte se retourne : la lettre parle de l'entreprise (Maison Lumen, inventée), de ses vrais besoins, avec
// de vraies preuves (surlignées en rose, une coche par idée) → « en 30 secondes* » → 1re lettre offerte, lien en bio.
// Voix : voix-avantapres.json. Son : synth_avantapres.py (musique de l'utilisateur, ouverte au retournement de la carte).
import React from "react";
import { AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { APPLE, TextDrop, bounce, curve, go, press } from "./apple";
import { PINK, clamp, lerp, seg } from "./common";
import voix from "./data/avantapres-voix.json";
import { Pointer, Ripple } from "./Lien";
import { Coche, FinOfferte, Ligne, Mention, X, horloge } from "./pubMotion";

export const AVANTAPRES_DUR = voix.duration;
const { at, sc } = horloge(voix);
const CY = 1010, CW = 760, CH = 900;
const FLIP = sc(3) + 0.12, FIN = sc(5) + 0.05;
const T = { dyn: at(7), mot: at(8), rig: at(9), lue: at(10), monde: at(16), avec: at(20), logo: at(21), colle: at(23), tape: at(24), envoi: 10.3,
  ent: at(39), bes: at(43), pre: at(46), trente: at(48) };

// surligneur : le fond se peint de gauche à droite à partir de a
const Mark: React.FC<{ t: number; a: number; c: string; children: React.ReactNode }> = ({ t, a, c, children }) => (
  <span style={{ backgroundImage: `linear-gradient(${c}, ${c})`, backgroundRepeat: "no-repeat", backgroundSize: `${seg(t, a, a + 0.35) * 100}% 100%`, WebkitBoxDecorationBreak: "clone", boxDecorationBreak: "clone", padding: "0 4px", borderRadius: 6 }}>{children}</span>
);
const JAUNE = "#FFE27A", ROSE = "rgba(217,130,139,0.38)";
const P: React.FC<{ children: React.ReactNode; m?: number }> = ({ children, m = 22 }) => <p style={{ margin: `0 0 ${m}px` }}>{children}</p>;

// la lettre « avant » (les formules creuses)
const Avant: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ padding: "54px 56px", fontFamily: "Open Sans", fontSize: 31, lineHeight: 1.5, color: APPLE.ink }}>
    <P m={30}><span style={{ color: APPLE.soft, fontWeight: 600 }}>Objet : candidature spontanée</span></P>
    <P>Madame, Monsieur,</P>
    <P>Je suis <Mark t={t} a={T.dyn} c={JAUNE}>dynamique</Mark>, <Mark t={t} a={T.mot} c={JAUNE}>motivé</Mark> et <Mark t={t} a={T.rig} c={JAUNE}>rigoureux</Mark>.</P>
    <P>Fort de mon expérience, je souhaite relever de nouveaux défis au sein de votre prestigieuse entreprise.</P>
    <P>Je suis convaincu que mon profil correspond parfaitement à vos attentes.</P>
    <P>Dans l'attente de votre retour, veuillez agréer mes salutations distinguées.</P>
  </div>
);
// la lettre « après » (sur mesure, d'après l'exemple du vrai site)
const Apres: React.FC<{ t: number }> = ({ t }) => (
  <div style={{ padding: "40px 52px", fontFamily: "Open Sans", fontSize: 30, lineHeight: 1.48, color: APPLE.ink }}>
    <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 30 }}>
      <Img src={staticFile("company.png")} style={{ width: 84, height: 84, borderRadius: 18 }} />
      <div><div style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: 34 }}><Mark t={t} a={T.ent} c={ROSE}>Maison Lumen</Mark></div><div style={{ color: APPLE.soft, fontSize: 26, fontWeight: 600 }}>Manager des ventes</div></div>
    </div>
    <P>Madame, Monsieur,</P>
    <P>Accompagner une équipe jusqu'à ses objectifs : c'est ce que je fais chaque jour chez Maison &amp; Déco.</P>
    <P><Mark t={t} a={T.ent + 0.15} c={ROSE}>Votre boutique</Mark> mise sur <Mark t={t} a={T.bes} c={ROSE}>le conseil client et la mise en scène des produits</Mark> : c'est exactement mon terrain.</P>
    <P><Mark t={t} a={T.pre} c={ROSE}>J'y manage une équipe de conseillers</Mark> et je prépare avec eux les objectifs de chaque semaine.</P>
    <P>Disponible immédiatement, je serais ravie d'en échanger lors d'un entretien.</P>
    <P m={0}>Camille Dubois</P>
  </div>
);

const Carte: React.FC<{ t: number; x: number; y: number; s: number; rotY?: number; o?: number; apres?: boolean; gris?: number; glow?: number }> = ({ t, x, y, s, rotY = 0, o = 1, apres, gris = 0, glow = 0 }) => (
  <div style={{ position: "absolute", left: x - CW / 2, top: y - CH / 2, width: CW, height: CH, borderRadius: 44, background: "#fff", overflow: "hidden", opacity: o,
    boxShadow: `0 30px 80px rgba(0,0,0,0.12), 0 0 0 ${apres ? 4 : 0}px rgba(217,130,139,${0.6 * glow}), 0 0 ${90 * glow}px rgba(217,130,139,${0.55 * glow})`,
    transform: `perspective(1600px) rotateY(${rotY}deg) scale(${s})`, filter: gris ? `grayscale(${gris}) opacity(${1 - 0.45 * gris})` : undefined }}>
    {apres ? <Apres t={t} /> : <Avant t={t} />}
  </div>
);

export const AvantApres: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), t = frame / fps;

  // ── la carte principale : entrée, grille « chez tout le monde », retour grisé, retournement, aspirée par la pilule finale ──
  const grille = go(t, T.monde - 0.1, T.monde + 0.25, 0, 1) * (1 - go(t, sc(2), sc(2) + 0.35, 0, 1));
  const yIn = bounce(t, [[-0.3, CY + 700], [0.25, CY]]);
  const sMain = t < sc(2) ? lerp(0.92, 0.3, grille) : t < FLIP ? go(t, sc(2), sc(2) + 0.35, 0.92, 0.8) : t < FIN ? go(t, FLIP, FLIP + 0.35, 0.8, 0.85) : lerp(0.85, 0.05, seg(t, FIN - 0.1, FIN + 0.2));
  const xMain = X + lerp(0, -260, grille), yMain = t < sc(2) ? lerp(yIn, 980 - 300, grille) : lerp(CY, 840, seg(t, FIN - 0.1, FIN + 0.2));
  const flipK = seg(t, FLIP - 0.18, FLIP + 0.18), apres = flipK >= 0.5, rotY = apres ? lerp(-90, 0, go(t, FLIP, FLIP + 0.3, 0, 1)) : lerp(0, 90, flipK * 2);
  const gris = t >= sc(2) && !apres ? seg(t, sc(2) + 0.3, sc(2) + 0.6) : 0;
  const glow = apres ? Math.max(0.35, Math.exp(-Math.pow((t - FLIP - 0.1) / 0.25, 2))) : 0;

  // ── le lien de l'offre : barre qui apparaît, texte tapé, envoi, la barre plonge dans la carte ──
  const barK = go(t, T.colle, T.colle + 0.35, 0, 1), dive = seg(t, T.envoi + 0.1, FLIP - 0.05);
  const [bx, by] = curve(dive, [X, 570], [X, CY], [X + 260, 700]);
  const [px, py] = curve(go(t, T.tape + 0.2, T.envoi - 0.1, 0, 1), [900, 1300], [X + 330, 575], [980, 800]);
  const pPress = Math.exp(-Math.pow((t - T.envoi) / 0.08, 2)), pO = seg(t, T.tape + 0.2, T.tape + 0.35) * (1 - seg(t, T.envoi + 0.2, T.envoi + 0.35));
  const flash = Math.exp(-Math.pow((t - FLIP) / 0.12, 2));

  return (
    <AbsoluteFill style={{ background: APPLE.bg, fontFamily: "Poppins", color: APPLE.ink, overflow: "hidden" }}>
      {/* ── titres (ils suivent la voix) ── */}
      <Ligne t={t} t0={-0.3} text="Ta lettre de motivation" y={300} size={66} out={sc(1)} />
      <Ligne t={t} t0={0.0} text="ressemble à ça ?" y={380} size={66} color={PINK} out={sc(1)} />
      <Ligne t={t} t0={T.dyn - 0.05} text="« Dynamique, motivé," y={300} size={64} out={T.lue - 0.2} />
      <Ligne t={t} t0={T.rig - 0.05} text="rigoureux. »" y={380} size={64} out={T.lue - 0.2} />
      <Ligne t={t} t0={T.lue} text="Le recruteur" y={300} size={70} out={T.monde - 0.2} />
      <Ligne t={t} t0={T.lue + 0.25} text="l'a déjà lue." y={382} size={70} out={T.monde - 0.2} />
      <Ligne t={t} t0={T.monde} text="Chez tout le monde." y={330} size={70} color={PINK} out={sc(2) - 0.15} />
      {t >= T.logo && t < FLIP && <Img src={staticFile("logo-mymotiv.png")} style={{ position: "absolute", left: X - 190, top: 290, width: 380, zIndex: 10, opacity: seg(t, T.logo, T.logo + 0.2) * (1 - seg(t, FLIP - 0.25, FLIP)), transform: `scale(${go(t, T.logo, T.logo + 0.35, 0.7, 1)})` }} />}
      <Ligne t={t} t0={T.colle} text="Tu colles le lien." y={400} size={60} weight={700} out={FLIP - 0.25} />
      <Ligne t={t} t0={FLIP + 0.1} text="Ta lettre parle enfin" y={300} size={64} out={T.ent - 0.2} />
      <Ligne t={t} t0={FLIP + 0.35} text="de LEUR entreprise." y={380} size={64} color={PINK} out={T.ent - 0.2} />
      <Coche t={t} a={T.ent} text="Leur entreprise" y={330} out={sc(4)} />
      <Coche t={t} a={T.bes} text="Leurs vrais besoins" y={420} out={sc(4)} />
      <Coche t={t} a={T.pre} text="Tes vraies preuves" y={510} out={sc(4)} />
      <Ligne t={t} t0={sc(4) + 0.1} text="En 30 secondes*" y={380} size={80} color={PINK} out={FIN - 0.2} />
      <Mention t={t} a={sc(4) + 0.1} b={FIN} text="* temps mesuré : 27 à 35 s par lettre" />

      {/* ── la grille : 8 copies identiques autour de la carte ── */}
      {grille > 0.01 && [0, 1, 2, 3, 4, 5, 6, 7, 8].filter((i) => i !== 0).map((i) => {
        const c = i % 3, r = Math.floor(i / 3), k = go(t, T.monde + i * 0.04, T.monde + 0.3 + i * 0.04, 0, 1) * grille;
        return <Carte key={i} t={t} x={X + (c - 1) * 260} y={980 + (r - 1) * 300} s={0.3 * clamp(k)} o={clamp(k * 2)} />;
      })}
      {t < FIN + 0.2 && <Carte t={t} x={xMain} y={yMain} s={sMain} rotY={rotY} apres={apres} gris={gris} glow={glow} />}

      {/* ── la barre du lien ── */}
      {t >= T.colle && t < FLIP && (
        <div style={{ position: "absolute", left: bx - 390, top: by - 55, width: 780, height: 110, borderRadius: 55, background: "#fff", boxShadow: "0 18px 50px rgba(0,0,0,0.12), 0 0 0 3px rgba(217,130,139,0.6)", display: "flex", alignItems: "center", gap: 14, padding: "0 16px 0 30px", zIndex: 11,
          transform: `scale(${barK * lerp(1, 0.15, dive)})`, opacity: 1 - seg(t, FLIP - 0.15, FLIP), fontFamily: "Open Sans", fontSize: 28, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden" }}>
          <span style={{ fontSize: 34 }}>🔗</span>
          <TextDrop t={t} t0={T.tape} text="maison-lumen.fr/offre/manager-ventes" by="chars" from={[0, 14]} stagger={0.017} dur={0.1} />
          <div style={{ marginLeft: "auto", width: 80, height: 80, borderRadius: 40, background: PINK, color: "#fff", fontSize: 40, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", transform: `scale(${press(t, T.envoi)})` }}>→</div>
        </div>
      )}
      <Ripple x={X + 330} y={570} t={t} t0={T.envoi} />
      {flash > 0.02 && <div style={{ position: "absolute", inset: 0, zIndex: 13, background: `radial-gradient(circle at ${X}px ${CY}px, rgba(255,255,255,${0.9 * flash}) 0%, rgba(242,184,192,${0.6 * flash}) 35%, rgba(242,184,192,0) 70%)` }} />}

      <FinOfferte t={t} t0={FIN} aBio={at(56)} />
      <div style={{ position: "absolute", inset: 0, zIndex: 20 }}><Pointer x={px} y={py} hover={seg(t, T.envoi - 0.3, T.envoi - 0.1)} press={pPress} o={pO} /></div>
      <Audio src={staticFile("audio/avantapres.wav")} />
    </AbsoluteFill>
  );
};
