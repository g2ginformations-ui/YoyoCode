// Éléments partagés par les vidéos MyMotiv (Remotion).
import { useLayoutEffect, useRef } from "react";

export const W = 1080, H = 1920;
export const BG = "#0B0A0B", PINK = "#D9828B", PINK_L = "#F2B8C0", POWDER = "#E8B4BC", WHITE = "#FFFFFF";
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeIn = (x: number) => x * x * x;
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const easeOutBack = (x: number) => { const c1 = 1.2, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
export function rng(seed: number) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }


// ───────── Texte 3D : extrudé en rose, bascule vers l'avant à l'entrée ─────────
export type Part = [string, string];
export const Text3D: React.FC<{ t: number; t0: number; t1?: number; y: number; size: number; lines: Part[][] }> = ({ t, t0, t1 = 99, y, size, lines }) => {
  if (t < t0 || t > t1) return null;
  const k = easeOutBack(seg(t, t0, t0 + 0.45)), out = seg(t, t1 - 0.2, t1);
  const depth = Array.from({ length: 12 }, (_, i) => `0 ${(i + 1) * 1.6}px 0 rgb(${lerp(170, 70, i / 11)},${lerp(92, 38, i / 11)},${lerp(102, 44, i / 11)})`).join(",");
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: W, perspective: 1100, textAlign: "center", opacity: clamp(seg(t, t0, t0 + 0.15)) * (1 - out) }}>
      <div style={{ transform: `rotateX(${lerp(78, 12, k)}deg) translateZ(${lerp(-300, 0, k)}px) scale(${1 + out * 0.1})`, transformOrigin: "50% 100%" }}>
        {lines.map((parts, i) => (
          <div key={i} style={{ fontFamily: "Poppins", fontWeight: 700, fontSize: size, lineHeight: 1.12, letterSpacing: -1 }}>
            {parts.map(([s, col], j) => (
              <span key={j} style={{ color: col, textShadow: `${depth}, 0 ${size * 0.4}px ${size * 0.5}px rgba(0,0,0,0.65)` }}>{s}</span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const Cursor: React.FC<{ x: number; y: number; press: boolean }> = ({ x, y, press }) => (
  <svg width={60} height={70} viewBox="0 0 30 42" style={{ position: "absolute", left: x, top: y, transform: `scale(${press ? 1.4 : 1.6})`, transformOrigin: "0 0", filter: "drop-shadow(0 3px 6px rgba(0,0,0,0.6))" }}>
    <path d="M0 0 L0 34 L9 26 L15 39 L21 36 L15 23 L26 23 Z" fill={WHITE} stroke={BG} strokeWidth={2} />
  </svg>
);


const CHAT_TYPED = "Bien sûr ! Voici votre lettre :\nMadame, Monsieur,\nJe me permets de vous adresser ma\ncandidature pour le poste de…";
const chatCanvas = typeof document !== "undefined" ? document.createElement("canvas") : null;
export function paintChat(t: number, erase = true) {
  const c = chatCanvas!.getContext("2d")!; chatCanvas!.width = 540; chatCanvas!.height = H;
  c.fillStyle = "#34353a"; c.fillRect(0, 0, 540, H);
  const jit = rng(Math.floor(t * 12) + 3); const bug = t > 1.4 ? (jit() < 0.35 ? (jit() - 0.5) * 16 : 0) : 0;
  c.save(); c.translate(bug, 0);
  rr(c, 30, 420, 480, 1080, 26); c.fillStyle = "#26272b"; c.fill(); c.strokeStyle = "#45464c"; c.lineWidth = 2; c.stroke();
  c.fillStyle = "#8b8d94"; c.font = "600 30px 'Open Sans'"; c.fillText("Assistant IA", 66, 482);
  for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(440 + i * 22, 472, 6, 0, Math.PI * 2); c.fillStyle = "#55565c"; c.fill(); }
  c.fillStyle = "#3a3b40"; c.fillRect(30, 512, 480, 2);
  // Message du candidat
  rr(c, 150, 550, 330, 120, 22); c.fillStyle = "#4b4d55"; c.fill(); c.fillStyle = "#e4e4e8"; c.font = "400 25px 'Open Sans'";
  c.fillText("Écris ma lettre pour", 172, 597); c.fillText("l'offre Maison Lumen", 172, 634);
  // Réponse qui s'écrit… puis s'efface
  const typed = Math.floor(clamp((t - 0.25) / 1.0) * CHAT_TYPED.length), erased = erase ? Math.floor(clamp((t - 1.45) / 0.55) * typed) : 0;
  const shown = CHAT_TYPED.slice(0, Math.max(0, typed - erased));
  c.fillStyle = "#c9cad0"; c.font = "400 25px 'Open Sans'"; shown.split("\n").forEach((l, i) => c.fillText(l, 60, 730 + i * 38));
  if (t < 2.05 && Math.floor(t * 4) % 2 === 0) { c.fillStyle = "#c9cad0"; c.fillRect(60 + c.measureText(shown.split("\n").pop() || "").width + 4, 708 + (shown.split("\n").length - 1) * 38, 3, 28); }
  // Erreur rouge qui clignote + l'IA a oublié le CV
  if (t > 2.05) {
    const on = Math.floor((t - 2.05) / 0.16) % 2 === 0;
    rr(c, 50, 900, 440, 92, 16); c.fillStyle = on ? "#5c1d22" : "#3e1a1d"; c.fill(); c.strokeStyle = on ? "#ff5a5f" : "#8a2c31"; c.lineWidth = 3; c.stroke();
    c.fillStyle = on ? "#ff6b6f" : "#b0454a"; c.beginPath(); c.moveTo(90, 966); c.lineTo(108, 930); c.lineTo(126, 966); c.closePath(); c.fill();
    c.fillStyle = "#26272b"; c.font = "700 22px Poppins"; c.fillText("!", 104, 962);
    c.fillStyle = on ? "#ff8a8d" : "#c25a5e"; c.font = "600 28px 'Open Sans'"; c.fillText("Erreur : contexte perdu", 144, 957);
  }
  if (t > 2.35) {
    rr(c, 50, 1030, 420, 120, 22); c.fillStyle = "#3a3b40"; c.fill(); c.fillStyle = "#b9bac0"; c.font = "400 25px 'Open Sans'";
    c.fillText("Pouvez-vous me renvoyer", 74, 1078); c.fillText("votre CV et l'offre ?", 74, 1114);
  }
  rr(c, 50, 1400, 440, 70, 35); c.fillStyle = "#2f3035"; c.fill(); c.fillStyle = "#6c6e75"; c.font = "400 24px 'Open Sans'"; c.fillText("Envoyer un message…", 80, 1444);
  c.restore();
  if (t > 1.4) { // bandes décalées : l'interface bugge
    const r = rng(Math.floor(t * 15) + 99);
    for (let b = 0; b < 3; b++) if (r() < 0.5) { const y = 420 + Math.floor(r() * 1000), h = 8 + Math.floor(r() * 26); c.drawImage(chatCanvas!, 0, y, 540, h, (r() - 0.5) * 40, y, 540, h); }
  }
}
const TILE = 30, COLS = 540 / TILE, ROWS = H / TILE;
 // front de l'onde, de droite à gauche
export const ShatterLayer: React.FC<{ t: number; wave: number; erase?: boolean }> = ({ t, wave, erase = true }) => {
  const waveX = (tt: number) => W - (tt - wave) * 1800;
  const ref = useRef<HTMLCanvasElement>(null);
  useLayoutEffect(() => {
    const c = ref.current!.getContext("2d")!; c.clearRect(0, 0, W, H);
    paintChat(Math.min(t, wave + 0.35), erase);
    const fx = waveX(t);
    if (t < wave || fx > 540) c.drawImage(chatCanvas!, 0, 0);
    else {
      c.save(); c.beginPath(); c.rect(0, 0, Math.max(0, fx), H); c.clip(); c.drawImage(chatCanvas!, 0, 0); c.restore();
      const r = rng(17);
      for (let gy = 0; gy < ROWS; gy++) for (let gx = 0; gx < COLS; gx++) {
        const vx = -500 - r() * 1300, vy = (r() - 0.5) * 700, vr = (r() - 0.5) * 9, life = 0.6 + r() * 0.5, x0 = gx * TILE, y0 = gy * TILE;
        const tp = wave + (W - (x0 + TILE / 2)) / 1800, k = t - tp; if (k < 0 || k > life) continue;
        const e = k / life, x = x0 + vx * k * (1 - e * 0.4), y = y0 + vy * k - 120 * k, s = 1 - e;
        c.save(); c.globalAlpha = (1 - e) * 0.95; c.translate(x + TILE / 2, y + TILE / 2); c.rotate(vr * k); c.scale(s, s);
        c.drawImage(chatCanvas!, x0, y0, TILE, TILE, -TILE / 2, -TILE / 2, TILE, TILE);
        c.globalCompositeOperation = "source-atop"; c.fillStyle = `rgba(232,180,188,${Math.min(1, e * 1.6)})`; c.fillRect(-TILE / 2, -TILE / 2, TILE, TILE); c.restore();
      }
    }
    // L'onde : bande rose poudré lumineuse + poussière
    if (t >= wave && fx > -200) {
      const g = c.createLinearGradient(fx - 160, 0, fx + 60, 0); g.addColorStop(0, "rgba(232,180,188,0)"); g.addColorStop(0.75, "rgba(232,180,188,0.85)"); g.addColorStop(0.9, "rgba(255,240,243,1)"); g.addColorStop(1, "rgba(232,180,188,0)");
      c.fillStyle = g; c.fillRect(fx - 160, 0, 220, H);
      const r = rng(Math.floor(t * 60));
      c.globalCompositeOperation = "lighter";
      for (let i = 0; i < 140; i++) { const x = fx - r() * 260, y = r() * H, s = 1 + r() * 4; c.fillStyle = `rgba(242,184,192,${0.25 + r() * 0.5})`; c.fillRect(x, y, s, s); }
      c.globalCompositeOperation = "source-over";
    }
  }, [t]);
  return <canvas ref={ref} width={W} height={H} style={{ position: "absolute", inset: 0 }} />;
};
