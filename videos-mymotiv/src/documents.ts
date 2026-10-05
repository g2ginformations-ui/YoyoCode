// Lettre de motivation et CV de l'exemple fictif (Camille Dubois → Maison Lumen), dessinés sur canevas.
import { PINK, clamp, rr } from "./common";

export const PW = 520, PH = 735;
export const LOGO_SLOT = { x: PW - 118, y: 26, s: 84 }; // emplacement du logo, en haut à droite
export const LETTER_LINES: [string, string][] = [
  ["h", "Camille Dubois"], ["m", "camille@exemple.fr · Lyon"], ["g", ""], ["s", "Objet : Candidature — Manager des ventes"], ["g", ""], ["t", "Madame, Monsieur,"], ["g", ""],
  ["t", "Accompagner une équipe jusqu'à ses objectifs :"], ["t", "c'est ce que je fais chaque jour chez Maison & Déco,"], ["t", "où j'ai fait progresser le panier moyen de 18 %."], ["g", ""],
  ["t", "Votre boutique de Lyon mise sur le conseil client"], ["t", "et la mise en scène des produits. Mon expérience"], ["t", "du management d'une équipe de 6 conseillers vous"], ["t", "permettra d'atteindre vos objectifs."], ["g", ""],
  ["t", "Disponible immédiatement, je serais ravie d'en"], ["t", "échanger lors d'un entretien."], ["g", ""], ["t", "Je vous prie d'agréer, Madame, Monsieur,"], ["t", "mes salutations distinguées."], ["g", ""], ["b", "Camille Dubois"],
];
export const LETTER_TOTAL = LETTER_LINES.reduce((n, [, s]) => n + Math.max(1, s.length), 0);
const YS = (() => { let y = 0; return LETTER_LINES.map(([k]) => (y += k === "h" ? 54 : k === "g" ? 14 : k === "s" ? 34 : k === "m" ? 30 : 26)); })();

// progress : part de la lettre écrite (0 → 1) ; logo : image à poser (ou null → emplacement en pointillés).
export function paintLetter(c: CanvasRenderingContext2D, progress: number, logo: HTMLImageElement | null, flash = 0) {
  rr(c, 0, 0, PW, PH, 14); c.fillStyle = "#fffdfd"; c.fill();
  let n = Math.floor(LETTER_TOTAL * clamp(progress));
  for (let k = 0; k < LETTER_LINES.length; k++) {
    const [kind, s] = LETTER_LINES[k], len = Math.max(1, s.length), shown = s.slice(0, Math.max(0, n)); n -= len;
    if (!s) { if (n < 0) break; continue; } if (!shown) break;
    c.font = kind === "h" ? "600 32px Poppins" : kind === "s" || kind === "b" ? "600 17px Poppins" : kind === "m" ? "400 15px 'Open Sans'" : "400 16px 'Liberation Serif', Georgia, serif";
    c.fillStyle = kind === "s" ? PINK : kind === "m" ? "#7a7174" : "#2a2326"; c.textAlign = "left"; c.fillText(shown, 38, 52 + YS[k]);
    if (n < 0) { const w = c.measureText(shown).width; c.fillStyle = PINK; c.fillRect(40 + w, 52 + YS[k] - 16, 3, 20); }
  }
  slot(c, logo, flash);
}
export function paintCv(c: CanvasRenderingContext2D, logo: HTMLImageElement | null, flash = 0) {
  rr(c, 0, 0, PW, PH, 14); c.fillStyle = "#f6f1f2"; c.fill();
  c.textAlign = "left"; c.fillStyle = "#2a2326"; c.font = "600 30px Poppins"; c.fillText("Camille Dubois", 38, 70);
  c.fillStyle = PINK; c.font = "600 18px Poppins"; c.fillText("Manager des ventes", 38, 100);
  let y = 160;
  for (const [h, items] of [["Expérience", ["Conseillère de vente · Maison & Déco", "Management d'une équipe de 6", "Panier moyen : +18 %"]], ["Formation", ["BTS Management des unités commerciales"]], ["Compétences", ["Équipe · Objectifs · Conseil client"]]] as [string, string[]][]) {
    c.fillStyle = PINK; c.font = "600 18px Poppins"; c.fillText(h, 38, y); c.fillStyle = "rgba(217,130,139,0.4)"; c.fillRect(38, y + 8, PW - 76, 1.5); y += 38;
    c.fillStyle = "#3a3236"; c.font = "400 15px 'Open Sans'"; for (const it of items) { c.fillText("• " + it, 44, y); y += 26; } y += 22;
  }
  slot(c, logo, flash);
}
function slot(c: CanvasRenderingContext2D, logo: HTMLImageElement | null, flash: number) {
  const { x, y, s } = LOGO_SLOT;
  if (!logo) { c.save(); c.setLineDash([6, 6]); c.strokeStyle = "rgba(217,130,139,0.6)"; c.lineWidth = 2; rr(c, x, y, s, s, 16); c.stroke(); c.restore(); }
  else { c.save(); rr(c, x, y, s, s, 16); c.clip(); c.drawImage(logo, x, y, s, s); c.restore(); }
  if (flash > 0) { c.save(); c.globalCompositeOperation = "lighter"; const g = c.createRadialGradient(x + s / 2, y + s / 2, 0, x + s / 2, y + s / 2, 240); g.addColorStop(0, `rgba(255,255,255,${flash})`); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, PW, PH); c.restore(); }
}
