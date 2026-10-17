// Textures dessinées (canvas) pour les histoires « Motiv » : ciel de nuit, lettre copiée-collée, écran du téléphone,
// écran de l'ordinateur, halo doux. Tout est fictif (Atelier Nova, Maison Lumen, Boréal Logistique).
import * as THREE from "three";

const make = (w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) => {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d")!);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return tex;
};
const wrap = (g: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) => {
  const words = text.split(" "); let line = ""; let yy = y;
  for (const w of words) { const test = line ? `${line} ${w}` : w; if (g.measureText(test).width > maxW && line) { g.fillText(line, x, yy); line = w; yy += lh; } else line = test; }
  if (line) g.fillText(line, x, yy);
  return yy + lh;
};

export const skyTex = () => make(64, 512, (g) => {
  const gr = g.createLinearGradient(0, 0, 0, 512);
  gr.addColorStop(0, "#05061a"); gr.addColorStop(0.55, "#101a4a"); gr.addColorStop(0.8, "#2a2160"); gr.addColorStop(1, "#5a2a5e");
  g.fillStyle = gr; g.fillRect(0, 0, 64, 512);
});

export const glowTex = (color = "255,255,255") => make(128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${color},1)`); gr.addColorStop(0.35, `rgba(${color},0.35)`); gr.addColorStop(1, `rgba(${color},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});

// La lettre passe-partout : `company` = nom affiché, `hl` = surlignage du nom (0..1), `focus` = 1re ligne mise en avant.
export const letterTex = (company: string, hl: number, focus: number) => make(720, 1280, (g) => {
  g.fillStyle = "#FBFAF8"; g.fillRect(0, 0, 720, 1280);
  g.fillStyle = "#2A2A2E"; g.font = "600 30px 'Open Sans', sans-serif";
  g.fillText("Camille Dubois", 60, 90);
  g.font = "400 24px 'Open Sans', sans-serif"; g.fillStyle = "#6B6B70";
  g.fillText("Objet : candidature spontanée", 60, 130);
  const dim = (a: number) => `rgba(42,42,46,${a})`;
  g.font = "400 30px 'Open Sans', sans-serif";
  g.fillStyle = dim(1); g.fillText("Madame, Monsieur,", 60, 220);
  if (focus > 0) { g.fillStyle = `rgba(242,184,192,${0.55 * focus})`; g.fillRect(50, 245, 620, 128); }
  g.fillStyle = dim(1);
  let y = wrap(g, "Je me permets de vous adresser ma candidature pour un poste au sein de votre entreprise.", 60, 285, 600, 42);
  g.fillStyle = dim(1 - 0.75 * focus);
  g.fillText("Je rêve depuis toujours de rejoindre", 60, y + 20);
  const tw = g.measureText(company + ".").width;
  if (hl > 0) { g.fillStyle = `rgba(255,214,90,${0.85 * hl})`; g.fillRect(56, y + 34, tw + 10, 46); }
  g.fillStyle = hl > 0.5 ? "#2A2A2E" : dim(1 - 0.75 * focus); g.font = "600 30px 'Open Sans', sans-serif";
  g.fillText(company + ".", 60, y + 68); g.font = "400 30px 'Open Sans', sans-serif";
  g.fillStyle = dim(1 - 0.75 * focus);
  y = wrap(g, "Dynamique, motivé et doté d'un excellent relationnel, je saurai m'adapter rapidement à vos besoins et mettre mes compétences au service de votre réussite.", 60, y + 150, 600, 42);
  y = wrap(g, "Je reste à votre disposition pour un entretien.", 60, y + 30, 600, 42);
  wrap(g, "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.", 60, y + 30, 600, 42);
});

// Écran du téléphone posé sur le bureau : heure + éventuelle notification (refus).
export const phoneTex = (time: string, notif: number) => make(540, 1080, (g) => {
  const gr = g.createLinearGradient(0, 0, 540, 1080); gr.addColorStop(0, "#1b1530"); gr.addColorStop(1, "#3a1f35");
  g.fillStyle = gr; g.fillRect(0, 0, 540, 1080);
  g.fillStyle = "#fff"; g.textAlign = "center"; g.font = "600 130px 'Poppins', sans-serif"; g.fillText(time, 270, 300);
  g.font = "400 30px 'Open Sans', sans-serif"; g.fillStyle = "rgba(255,255,255,0.7)"; g.fillText("mardi", 270, 350);
  if (notif > 0) {
    g.globalAlpha = notif; const y = 430 + (1 - notif) * -40;
    g.fillStyle = "rgba(255,255,255,0.92)"; g.beginPath(); g.roundRect(30, y, 480, 250, 36); g.fill();
    g.textAlign = "left"; g.fillStyle = "#6B6B70"; g.font = "600 24px 'Open Sans', sans-serif"; g.fillText("✉  E-mail · maintenant", 62, y + 50);
    g.fillStyle = "#1E1E22"; g.font = "600 30px 'Open Sans', sans-serif"; g.fillText("Atelier Nova", 62, y + 98);
    g.font = "400 26px 'Open Sans', sans-serif"; g.fillStyle = "#3A3A40";
    wrap(g, "Malheureusement, nous ne pouvons pas donner une suite favorable à votre candidature…", 62, y + 140, 420, 36);
    g.globalAlpha = 1;
  }
});

// Écran de l'ordinateur : un document avec la phrase réécrite (curseur qui clignote).
export const laptopTex = (typed: string, cursor: boolean) => make(1024, 640, (g) => {
  g.fillStyle = "#1c1c22"; g.fillRect(0, 0, 1024, 640);
  g.fillStyle = "#FBFAF8"; g.fillRect(232, 40, 560, 600);
  g.fillStyle = "#2A2A2E"; g.font = "400 22px 'Open Sans', sans-serif";
  g.fillText("Madame, Monsieur,", 270, 110);
  g.fillStyle = "#D9D6D2"; [140, 168, 196].forEach((y, i) => g.fillRect(270, y, [470, 430, 300][i], 10));
  g.fillStyle = "#2A2A2E"; const end = wrap(g, typed, 270, 260, 480, 32);
  if (cursor) { const lines = typed.split(" "); g.fillRect(270 + Math.min(470, g.measureText(lines.slice(-4).join(" ")).width), end - 56, 3, 28); }
});
