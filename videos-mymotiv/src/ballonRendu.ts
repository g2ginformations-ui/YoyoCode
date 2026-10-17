// Rendu « 3D » du ballon rose de la vidéo Ballon, sans carte graphique : un petit lancer de rayons (raymarching) écrit à
// la main, pixel par pixel, dans un canevas. La scène : un ballon (ellipsoïde) rose en latex, son nœud, et une aiguille
// verticale dont la pointe creuse le ballon (un creux en entonnoir). Options : version fil de fer (« un ballon qui
// n'existe pas »), trou qui se déchire autour de l'aiguille (gros plan) et peau qui se rétracte vers le bas (plan large).
// Unité : le rayon du ballon (1). Le haut du ballon est en y = HAUT.

const RX = 1, RY = 1.12, RZ = 1;
export const HAUT = RY;

export type Vue = {
  cam: [number, number, number]; cible: [number, number, number]; fovX: number;   // caméra (fovX en degrés)
  pointe: number;          // hauteur de la pointe de l'aiguille
  creux: number;           // profondeur du creux sous l'aiguille
  largeur: number;         // largeur du creux
  fil: number;             // 0 = rendu, 1 = fil de fer
  dechire: number;         // rayon du trou autour de l'aiguille (0 = intact)
  coupe: number;           // hauteur de la peau qui se rétracte (> 2 = intacte)
  noeud: boolean; aiguille: boolean;
  spot?: number;           // rayon d'un projecteur centré sur l'aiguille (gros plan : le premier plan s'assombrit)
};

// paramètres de la scène, copiés ici pour la vitesse
let SPOT = 0, D = 0, A = 0.05, E2 = 0, PT = 9, DECH = 0, COUPE = 9, NOEUD = false, AIG = true, COQUE = false;
const RN = 0.0065, LT = 0.05;
let mat = 0;

function ballon(x: number, y: number, z: number): number {
  const qx = x / RX, qy = y / RY, qz = z / RZ;
  const k0 = Math.sqrt(qx * qx + qy * qy + qz * qz);
  const k1 = Math.sqrt(qx * qx / (RX * RX) + qy * qy / (RY * RY) + qz * qz / (RZ * RZ));
  let e = (k0 * (k0 - 1)) / k1;
  if (D > 0 && y > 0.5) {
    const rr = Math.sqrt(x * x + z * z + E2), w = y > 0.9 ? 1 : (y - 0.5) / 0.4, ex = Math.exp(-rr / A);
    e += D * ex * w;
    const g = (D / A) * ex * w;
    e /= Math.sqrt(1 + g * g);
  }
  if (COQUE) e = Math.abs(e) - 0.004;
  if (DECH > 0 && y > 0) {
    const th = Math.atan2(z, x), R = DECH * (1 + 0.22 * Math.sin(7 * th) + 0.12 * Math.sin(13 * th + 1.3));
    e = Math.max(e, R - Math.sqrt(x * x + z * z));
  }
  if (COUPE < 2) {
    const th = Math.atan2(z, x), yc = COUPE + 0.07 * Math.sin(5 * th + 2) + 0.04 * Math.sin(11 * th);
    e = Math.max(e, y - yc);
  }
  if (NOEUD) {
    const dy1 = y + 1.16, s1 = Math.sqrt(x * x + dy1 * dy1 + z * z) - 0.055;
    const yy = Math.min(Math.max(y, -1.3), -1.12), dy2 = y - yy, c = Math.sqrt(x * x + dy2 * dy2 + z * z) - 0.03;
    const dy3 = y + 1.31, s3 = Math.sqrt(x * x + dy3 * dy3 + z * z) - 0.045;
    e = Math.min(e, s1, c, s3);
  }
  return e;
}
function aiguille(x: number, y: number, z: number): number {
  const h = y - PT, r = Math.sqrt(x * x + z * z);
  return h <= 0 ? Math.sqrt(r * r + h * h) : r - RN * Math.min(1, h / LT);
}
function scene(x: number, y: number, z: number): number {
  const b = ballon(x, y, z);
  if (!AIG) { mat = 0; return b; }
  const n = aiguille(x, y, z);
  if (n < b) { mat = 1; return n; }
  mat = 0; return b;
}

// ─── l'éclairage de studio (reflets) ───
const KEY = norm3(-0.45, 0.8, -0.15), FILL = norm3(0.6, 0.2, 0.75), BAND = norm3(0.92, 0.25, -0.1), BACK = norm3(0, 0.22, -1), SOFT = norm3(-0.55, 0.62, 0.55);
function norm3(x: number, y: number, z: number): [number, number, number] { const l = Math.hypot(x, y, z); return [x / l, y / l, z / l]; }
const ss = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
function env(x: number, y: number, z: number): number {
  const k = x * KEY[0] + y * KEY[1] + z * KEY[2], b = x * BAND[0] + y * BAND[1] + z * BAND[2], c = x * BACK[0] + y * BACK[1] + z * BACK[2];
  const f = x * SOFT[0] + y * SOFT[1] + z * SOFT[2];
  return 0.01 + 2.6 * ss(0.8, 0.93, k) + 2.4 * ss(0.955, 0.985, f) + 1.6 * ss(0.94, 0.985, b) + 1.6 * ss(0.6, 0.97, c) + 0.04 * ss(-0.1, 0.6, y);
}
const aces = (x: number) => Math.min(1, Math.max(0, (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14)));
const g22 = (x: number) => Math.round(255 * Math.pow(aces(x), 1 / 2.2));

export function rendre(img: ImageData, v: Vue) {
  const W = img.width, H = img.height, px = img.data;
  D = v.creux; A = Math.max(0.01, v.largeur); E2 = (0.15 * A) * (0.15 * A); PT = v.pointe; DECH = v.dechire; COUPE = v.coupe;
  NOEUD = v.noeud; AIG = v.aiguille; SPOT = v.spot ?? 0; COQUE = v.dechire > 0 || v.coupe < 2;
  const [ox, oy, oz] = v.cam;
  let fx = v.cible[0] - ox, fy = v.cible[1] - oy, fz = v.cible[2] - oz; { const l = Math.hypot(fx, fy, fz); fx /= l; fy /= l; fz /= l; }
  let rx = -fz, rz = fx; { const l = Math.hypot(rx, rz); rx /= l; rz /= l; }          // droite = avant × haut
  const ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy;                           // haut = droite × avant
  const tx = Math.tan((v.fovX * Math.PI) / 360), ty = (tx * H) / W, pix = (2 * tx) / W;
  const fil = v.fil;
  for (let j = 0; j < H; j++) {
    const sy = 1 - (2 * (j + 0.5)) / H;
    for (let i = 0; i < W; i++) {
      const sx = (2 * (i + 0.5)) / W - 1;
      let dx = fx + rx * sx * tx + ux * sy * ty, dy = fy + uy * sy * ty, dz = fz + rz * sx * tx + uz * sy * ty;
      { const l = Math.hypot(dx, dy, dz); dx /= l; dy /= l; dz /= l; }
      // fond : noir chaud, halo rose très doux au milieu
      const halo = Math.exp(-(sx * sx * 1.4 + (sy + 0.05) * (sy + 0.05) * 3.2));
      let cr = 0.003 + 0.022 * halo, cg = 0.002 + 0.006 * halo, cb = 0.003 + 0.009 * halo;
      // volumes englobants : sphère (ballon + nœud) et cylindre (aiguille)
      let t0 = 1e9, t1 = -1;
      { const b = ox * dx + oy * dy + oz * dz, c = ox * ox + oy * oy + oz * oz - 1.45 * 1.45, h = b * b - c;
        if (h > 0) { const s = Math.sqrt(h); t0 = Math.max(0, -b - s); t1 = -b + s; } }
      if (AIG) {
        const a2 = dx * dx + dz * dz, b2 = ox * dx + oz * dz, c2 = ox * ox + oz * oz - 0.02 * 0.02, h2 = b2 * b2 - a2 * c2;
        if (h2 > 0 && a2 > 1e-9) { const s = Math.sqrt(h2), e0 = (-b2 - s) / a2, e1 = (-b2 + s) / a2; if (e1 > 0) { t0 = Math.min(t0, Math.max(0, e0)); t1 = Math.max(t1, e1); } }
        else if (c2 < 0) { t0 = 0; t1 = Math.max(t1, 30); }
      }
      if (t1 > t0) {
        let t = t0, hit = false, m = 0;
        for (let s = 0; s < 110; s++) {
          const d = scene(ox + dx * t, oy + dy * t, oz + dz * t);
          if (d < 0.35 * pix * t) { hit = true; m = mat; break; }
          t += d * 0.92;
          if (t > t1) break;
        }
        if (hit) {
          const x = ox + dx * t, y = oy + dy * t, z = oz + dz * t, ep = Math.max(1e-5, 0.6 * pix * t);
          // normale (méthode du tétraèdre)
          const a1 = scene(x + ep, y - ep, z - ep), a2_ = scene(x - ep, y - ep, z + ep), a3 = scene(x - ep, y + ep, z - ep), a4 = scene(x + ep, y + ep, z + ep);
          let nx = a1 - a2_ - a3 + a4, ny = -a1 - a2_ + a3 + a4, nz = -a1 + a2_ - a3 + a4;
          { const l = Math.hypot(nx, ny, nz) || 1; nx /= l; ny /= l; nz /= l; }
          const vn = -(dx * nx + dy * ny + dz * nz);
          if (vn < 0) { nx = -nx; ny = -ny; nz = -nz; }
          const ndv = Math.abs(vn);
          const rfx = dx + 2 * ndv * nx, rfy = dy + 2 * ndv * ny, rfz = dz + 2 * ndv * nz;
          if (m === 1) {
            // l'aiguille : métal poli, qui reflète le studio et le rose du ballon en dessous
            const e = env(rfx, rfy, rfz), rose = ss(0.05, -0.6, rfy);
            cr = 0.03 + 0.85 * e + 0.55 * rose; cg = 0.03 + 0.85 * e + 0.12 * rose; cb = 0.035 + 0.9 * e + 0.18 * rose;
            if (fil > 0) {
              const th = Math.atan2(z, x), ln = Math.max(ss(0.42, 0.5, Math.abs(((th / (2 * Math.PI)) * 10 + 10) % 1 - 0.5)), ss(0.38, 0.5, Math.abs(((y * 30) % 1 + 1) % 1 - 0.5)));
              const wr = 0.012 + 0.9 * ln, wg = 0.005 + 0.32 * ln, wb = 0.008 + 0.42 * ln;
              cr += (wr - cr) * fil; cg += (wg - cg) * fil; cb += (wb - cb) * fil;
            }
          } else {
            const inside = COQUE && (((x / RX) ** 2 + (y / RY) ** 2 + (z / RZ) ** 2) < 1 - 0.002);
            const dif = Math.max(0, nx * KEY[0] + ny * KEY[1] + nz * KEY[2]), wrap = Math.max(0, (nx * KEY[0] + ny * KEY[1] + nz * KEY[2] + 0.25) / 1.25);
            const spot = SPOT > 0 ? 0.12 + 0.88 * Math.exp(-(x * x + z * z) / (SPOT * SPOT)) : 1;
            const fr = 0.035 + 0.965 * Math.pow(1 - ndv, 5), rim = Math.pow(1 - ndv, 2.2);
            let ao = 1;
            if (D > 0 && y > 0.8) ao = 1 - 0.55 * Math.exp(-Math.sqrt(x * x + z * z) / (1.6 * A)) * (D / (D + 0.03));
            const e = env(rfx, rfy, rfz) * (SPOT > 0 ? 0.15 + 0.85 * spot : 1);
            if (inside) {
              cr = 0.16 * wrap + 0.02; cg = 0.03 * wrap + 0.004; cb = 0.05 * wrap + 0.008;
            } else {
              // latex rose : diffus « enveloppant » saturé, lumière qui traverse près des bords, reflets nets du studio
              const fill = Math.max(0, nx * FILL[0] + ny * FILL[1] + nz * FILL[2]);
              const li = (0.03 + 0.95 * wrap * spot + 0.1 * fill) * ao, sss = Math.pow(1 - ndv, 3);
              cr = 0.72 * li + 0.95 * sss * (0.3 + 0.7 * spot) + 0.85 * fr * e + 0.1 * Math.pow(dif, 40);
              cg = 0.12 * li + 0.3 * sss * (0.3 + 0.7 * spot) + 0.85 * fr * e + 0.08 * Math.pow(dif, 40);
              cb = 0.2 * li + 0.38 * sss * (0.3 + 0.7 * spot) + 0.85 * fr * e + 0.08 * Math.pow(dif, 40);
            }
            if (fil > 0) {
              // fil de fer : grille triangulée posée sur la surface, vue d'en haut
              const N = 26, wl = (1.1 * pix * t * N) / Math.max(0.25, Math.abs(ny));
              const gx = Math.abs(((x * N) % 1 + 1) % 1 - 0.5), gz = Math.abs(((z * N) % 1 + 1) % 1 - 0.5), gd = Math.abs((((x + z) * N) % 1 + 1) % 1 - 0.5);
              const ln = Math.max(ss(0.5 - wl, 0.5 - wl * 0.3, gx), ss(0.5 - wl, 0.5 - wl * 0.3, gz), 0.6 * ss(0.5 - wl, 0.5 - wl * 0.3, gd));
              const wr = 0.012 + 0.95 * ln, wg = 0.004 + 0.3 * ln, wb = 0.007 + 0.42 * ln;
              cr += (wr - cr) * fil; cg += (wg - cg) * fil; cb += (wb - cb) * fil;
            }
          }
        }
      }
      if (fil > 0 && t1 <= t0) { cr *= 1 - 0.5 * fil; cg *= 1 - 0.5 * fil; cb *= 1 - 0.5 * fil; }
      const k = (j * W + i) * 4;
      px[k] = g22(cr); px[k + 1] = g22(cg); px[k + 2] = g22(cb); px[k + 3] = 255;
    }
  }
}
