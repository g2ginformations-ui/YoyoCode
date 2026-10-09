// Outils d'animation des histoires « Motiv » en 3D : poses par images clés (fondu doux entre deux clés),
// plans de caméra (coupes franches + lent travelling), voix (qui parle, enveloppe pour la bouche).
export type V3 = [number, number, number];
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const lerp3 = (a: V3, b: V3, k: number): V3 => [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)];

// Une piste = liste [temps, valeurs partielles] ; chaque clé tient jusqu'à la suivante, avec un fondu de `dur` secondes.
export type Keys<P> = [number, Partial<P>, number?][];
export function track<P extends Record<string, number>>(base: P, keys: Keys<P>, t: number): P {
  const out = { ...base };
  let prev: P = { ...base };
  for (const [t0, vals, dur = 0.35] of keys) {
    const target = { ...prev, ...vals } as P;
    if (t < t0) break;
    const k = smooth(seg(t, t0, t0 + dur));
    for (const key of Object.keys(target) as (keyof P)[]) (out as Record<string, number>)[key as string] = lerp(prev[key] as number, target[key] as number, k);
    prev = (k >= 1 ? target : ({ ...out } as P));
  }
  return out;
}

export type Shot = { pos: V3; look: V3; fov: number; pos2?: V3; look2?: V3; fov2?: number };
// Plans : [temps de début, plan] ; à l'intérieur d'un plan, la caméra glisse de pos vers pos2 (travelling lent).
export function camAt(shots: [number, Shot][], t: number, end: number) {
  let i = 0;
  for (let k = 0; k < shots.length; k++) if (t >= shots[k][0]) i = k;
  const [t0, s] = shots[i], t1 = i + 1 < shots.length ? shots[i + 1][0] : end;
  const k = smooth(seg(t, t0, t1)) * 0.6 + seg(t, t0, t1) * 0.4;
  return { pos: lerp3(s.pos, s.pos2 ?? s.pos, k), look: lerp3(s.look, s.look2 ?? s.look, k), fov: lerp(s.fov, s.fov2 ?? s.fov, k), cut: t0 };
}

export type Voix = { duration: number; phrases: { text: string; t0: number; t1: number }[]; mots: { w: string; i: number; phrase: number; t0: number }[] };
export const envAt = (env: number[], t: number) => { const i = Math.floor(t * 60); return i >= 0 && i < env.length ? env[i] : 0; };
// Bouche : ouverte selon l'enveloppe de la voix, seulement quand c'est ce personnage qui parle.
export function mouthOf(v: Voix, qui: string[], env: number[], who: string, t: number) {
  const p = v.phrases.findIndex((ph) => t >= ph.t0 - 0.02 && t <= ph.t1 + 0.05);
  if (p < 0 || qui[p] !== who) return 0;
  return clamp((envAt(env, t) + envAt(env, t - 0.033)) * 0.9);
}
export const rnd = (seed: number) => { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
