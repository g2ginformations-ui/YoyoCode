// Bandeau fixe « 💬 Commente … » (règle du propriétaire du 16/10/2026 : dès la 1re seconde, on sait qu'il faut commenter).
// Pilule sombre à bord rose, en haut de la zone sûre TikTok (y 312, centrée sur x 520, ≤ 800 px de large), qui apparaît
// avec un petit rebond, rebondit légèrement aux moments « rappels », et s'efface à « fin » (la pilule de fin prend le relais).
// Première version écrite dans src/Ballon.tsx ; celle-ci sert aux vidéos suivantes.
import React from "react";
import { bounce } from "./apple";
import { seg } from "./common";
import { X } from "./pubMotion";

const ROSE_C = "#F2B8C0";
export const BANDEAU_Y = 312;
export const Bandeau: React.FC<{ t: number; a?: number; fin?: number; rappels?: number[]; size?: number; children: React.ReactNode }> = ({ t, a = 0.3, fin = 1e9, rappels = [], size = 31, children }) => {
  if (t < a || t >= fin + 0.1) return null;
  const s = bounce(t, [[a, 0.6], [a + 0.2, 1]], 0.08, 3, 7);
  const r = rappels.reduce((m, x) => m + 0.05 * Math.exp(-Math.pow((t - x - 0.15) / 0.12, 2)), 0);
  return (
    <div style={{ position: "absolute", left: X, top: BANDEAU_Y, transform: `translate(-50%, -50%) scale(${s * (1 + r)})`, zIndex: 46,
      opacity: 1 - seg(t, fin - 0.25, fin + 0.05), padding: "11px 28px", borderRadius: 40, background: "rgba(11,10,11,0.78)", border: `2.5px solid ${ROSE_C}`,
      boxShadow: "0 0 26px rgba(217,130,139,0.35)", fontFamily: "Poppins", fontWeight: 700, fontSize: size, color: "#fff", whiteSpace: "nowrap" }}>
      {children}
    </div>
  );
};
export const Rose: React.FC<{ children: React.ReactNode }> = ({ children }) => <span style={{ color: ROSE_C }}>{children}</span>;
