// Briques des pubs « effet psycho » cadrées TikTok (PremiereLigne, Ancrage, Miroir, Recence) : la lettre schématique en
// barres, l'appel à commenter, les carrés « mémoire ». Tout reste dans les zones sûres de src/tiktok.ts.
import React from "react";
import { P, PINK, PIX, RED, Tag, W_, Win } from "./FauxDM";
import { X } from "./pixelTT";

// la lettre en barres : une ligne mise en avant (la première ou la dernière), les autres grises ou teintées
export const LettreBarres: React.FC<{ t: number; avant: "premiere" | "derniere"; teinte?: number; titre?: string }> = ({ t, avant, teinte = 99, titre = "LETTRE DE MOTIVATION" }) => {
  const ligne = (
    <div style={{ display: "flex", alignItems: "center", gap: 16, border: `5px solid ${RED}`, padding: "8px 14px", margin: avant === "derniere" ? "20px 0 0" : 0, transform: `scale(${1 + 0.02 * Math.round(Math.sin(t * 6))})`, boxShadow: "0 0 30px rgba(232,38,43,0.55)" }}>
      <span style={{ fontFamily: PIX, fontWeight: 700, fontSize: 40, color: RED }}>{avant === "premiere" ? "1." : "FIN."}</span>
      <div style={{ height: 30, flex: 1, background: W_ }} />
    </div>
  );
  const barres = [0.92, 0.85, 0.95, 0.7, 0.8].map((w, j) => (
    <div key={j} style={{ height: 24, width: `${w * 100}%`, margin: `${avant === "premiere" || j > 0 ? 20 : 0}px 0 0 14px`, background: t >= teinte + j * 0.1 ? "#B3262A" : "#4A3C3B" }} />
  ));
  return <Win title={titre} w={800} red={false} ts={30}>{avant === "premiere" ? <>{ligne}{barres}</> : <>{barres}{ligne}</>}</Win>;
};

// fin : 1re lettre offerte, lien en bio, fenêtre « commentaire » qui se remplit
export const CtaCommentaire: React.FC<{ t: number; aOffre: number; aBio: number; aWin: number; aType: number; label: string }> = ({ t, aOffre, aBio, aWin, aType, label }) => (
  <>
    <P t={t} a={aOffre} x={X} y={380}><div style={{ padding: "16px 26px", background: PINK, fontFamily: PIX, fontWeight: 700, fontSize: 52, color: W_ }}>1RE LETTRE OFFERTE</div></P>
    <P t={t} a={aBio} x={X} y={510}><Tag text="LIEN EN BIO ↑" size={52} /></P>
    <P t={t} a={aWin} x={X} y={810}>
      <Win title="COMMENTAIRE" w={800} red={false} ts={32}>
        <div style={{ fontFamily: PIX, fontWeight: 700, fontSize: 52, lineHeight: 1.15, color: W_, marginBottom: 16, whiteSpace: "pre" }}>{label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {Array.from({ length: Math.min(10, Math.max(0, Math.floor((t - aType) * 8))) }, (_, j) => <span key={j} style={{ width: 44, height: 46, background: "#4A3C3B" }} />)}
          <span style={{ width: 20, height: 56, marginLeft: 6, background: RED, opacity: Math.floor(t * 2.5) % 2 ? 1 : 0 }} />
        </div>
      </Win>
    </P>
  </>
);

// une rangée de carrés « mémoire » : un seul en rouge (retenu)
export const Carres: React.FC<{ n: number; rouge: number; s: number; gap: number; t: number; a: number; big?: boolean }> = ({ n, rouge, s, gap, t, a, big }) => (
  <div style={{ display: "flex", gap }}>
    {Array.from({ length: n }, (_, j) => t >= a + j * 0.06 && <div key={j} style={{ width: s, height: s, background: j === rouge ? RED : "#4A3C3B", transform: big && j === rouge ? "scale(1.3)" : undefined, boxShadow: j === rouge ? "0 0 30px rgba(232,38,43,0.6)" : undefined }} />)}
  </div>
);
