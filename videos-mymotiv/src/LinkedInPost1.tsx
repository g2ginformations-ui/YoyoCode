// Visuel LinkedIn du post n°1 (histoire du fondateur), image fixe 1080×1350 (format portrait 4:5).
// « 3 lettres. 3 heures. » barré → « 30 secondes* » → les 3 gestes → la lettre avec le logo → MyMotiv, 1re lettre offerte.
// Rendu : COMP=LinkedInPost1 node render.mjs stills 0 → prev/LinkedInPost1-0.00.png
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { PINK, PINK_L } from "./common";
import { AppIcon, DARK, GLOW_BG } from "./motion";
import "./fonts";

const STEPS = [["📄", "Ton CV"], ["🔗", "Le lien\nde l'offre"], ["✦", "Ta lettre\nsur\u2011mesure"]];

export const LinkedInPost1: React.FC = () => (
  <AbsoluteFill style={{ background: GLOW_BG, fontFamily: "Poppins", color: DARK.ink, alignItems: "center" }}>
    {/* avant / après */}
    <div style={{ marginTop: 70, fontSize: 54, fontWeight: 700, color: DARK.soft, position: "relative" }}>
      3 lettres. 3 heures.
      <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 6, borderRadius: 3, background: PINK, transform: "rotate(-3deg)" }} />
    </div>
    <div style={{ marginTop: 10, fontSize: 132, fontWeight: 800, letterSpacing: -5, lineHeight: 1.05, color: PINK, textShadow: "0 0 60px rgba(217,130,139,0.45)" }}>30 secondes*</div>
    <div style={{ marginTop: 6, fontSize: 40, fontWeight: 700 }}>pour une lettre écrite pour <span style={{ color: PINK_L }}>CETTE</span> offre.</div>

    {/* les 3 gestes */}
    <div style={{ marginTop: 50, display: "flex", alignItems: "center", gap: 16 }}>
      {STEPS.map(([ic, l], i) => (
        <React.Fragment key={l}>
          {i > 0 && <div style={{ fontSize: 40, color: PINK, fontWeight: 800 }}>→</div>}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, width: 270, padding: "28px 10px", borderRadius: 36, background: i === 2 ? PINK : DARK.card, boxShadow: i === 2 ? "0 0 60px rgba(217,130,139,0.5)" : "0 0 0 1.5px rgba(255,255,255,0.08)", color: "#fff" }}>
            <div style={{ width: 84, height: 84, borderRadius: 42, background: i === 2 ? "rgba(255,255,255,0.22)" : "#3A3A3C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>{ic}</div>
            <div style={{ fontSize: 30, fontWeight: 700, textAlign: "center", lineHeight: 1.15, padding: "0 8px", whiteSpace: "pre-line" }}>{l}</div>
          </div>
        </React.Fragment>
      ))}
    </div>

    {/* la lettre */}
    <div style={{ marginTop: 50, width: 800, height: 300, borderRadius: 36, background: "#fff", color: "#1D1D1F", padding: 40, boxShadow: "0 40px 100px rgba(0,0,0,0.55)", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <Img src={staticFile("company.png")} style={{ width: 96, height: 96, borderRadius: 22, boxShadow: `0 0 30px ${PINK}` }} />
        <div style={{ whiteSpace: "nowrap" }}><div style={{ fontSize: 34, fontWeight: 800 }}>Maison Lumen</div><div style={{ fontSize: 24, fontWeight: 600, color: "#86868B" }}>Manager des ventes · Lyon</div></div>
        <div style={{ marginLeft: "auto", padding: "10px 20px", borderRadius: 999, background: "#FBE9EC", color: "#B9606B", fontSize: 24, fontWeight: 800, whiteSpace: "nowrap" }}>avec son logo ✓</div>
      </div>
      {[92, 86, 95, 70].map((w, i) => <div key={i} style={{ marginTop: i ? 20 : 34, height: 16, borderRadius: 8, width: `${w}%`, background: i === 0 ? "#F2C9CE" : "#E3E3E8" }} />)}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 90, background: "linear-gradient(rgba(255,255,255,0), #fff)" }} />
    </div>

    {/* marque + offre */}
    <div style={{ marginTop: 46, display: "flex", alignItems: "center", gap: 26 }}>
      <AppIcon size={96} />
      <Img src={staticFile("logo-mymotiv.png")} style={{ width: 380 }} />
    </div>
    <div style={{ marginTop: 22, padding: "18px 40px", borderRadius: 999, background: PINK, color: "#fff", fontSize: 36, fontWeight: 800, boxShadow: "0 0 50px rgba(217,130,139,0.5)" }}>🎁 1re lettre offerte · sans inscription</div>
    <div style={{ position: "absolute", bottom: 26, fontSize: 22, color: DARK.soft, fontFamily: "Open Sans" }}>* temps mesuré : 27 à 35 s par lettre · exemple fictif</div>
  </AbsoluteFill>
);
