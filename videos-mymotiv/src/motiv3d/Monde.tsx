// Le décor 3D (low-poly) des histoires « Motiv » : une chambre la nuit, la ville par la fenêtre, un bureau avec lampe,
// ordinateur (logo « mm. » au dos de l'écran), téléphone, tasse ; le candidat (cheveux bouclés, sweat) et Motiv, la
// petite lettre rose qui parle (personnage original MyMotiv) ; l'écran holographique où Motiv projette le vrai site.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { ThreeCanvas } from "@remotion/three";
import { continueRender, delayRender, staticFile } from "remotion";
import { V3, rnd } from "./anim";
import { glowTex, laptopTex, letterTex, phoneTex, skyTex } from "./textures";
import "../fonts";

export const PINK = "#E38C97", PINK_D = "#C66F7B", PINK_L = "#F2B8C0";

export type Human = {
  x: number; z: number; ry: number; sit: number; walk: number; lean: number; twist: number;
  hYaw: number; hPitch: number; hRoll: number; aLx: number; aLz: number; aLe: number; aRx: number; aRz: number; aRe: number;
  brow: number; bUp: number; blink: number; mouth: number; eyeX: number; eyeY: number; lids: number; type: number;
};
export const HUMAN: Human = {
  x: -0.62, z: -0.5, ry: 1.12, sit: 1, walk: 0, lean: 0.12, twist: 0, hYaw: 0, hPitch: 0.05, hRoll: 0,
  aLx: 0.55, aLz: 0.12, aLe: 1.05, aRx: 0.55, aRz: 0.12, aRe: 1.05, brow: 0, bUp: 0, blink: 0, mouth: 0, eyeX: 0, eyeY: 0, lids: 0, type: 0,
};
export type Motiv = {
  x: number; y: number; z: number; ry: number; rx: number; rz: number; s: number; bob: number;
  eye: number; lid: number; px: number; py: number; mouth: number; smile: number; flap: number; hL: number; hR: number; glow: number;
};
export const MOTIV: Motiv = { x: 0.36, y: 1.0, z: -0.55, ry: -1.1, rx: 0, rz: 0, s: 1, bob: 1, eye: 1, lid: 0, px: 0, py: 0, mouth: 0, smile: 0, flap: 0, hL: 0, hR: 0, glow: 1 };
export type Holo = { on: number; src: string; crop: number; pos: V3; ry: number; scale: number; letter?: { company: string; hl: number; focus: number }; cursor?: number };
export type World = {
  t: number; cam: { pos: V3; look: V3; fov: number }; human: Human; motiv: Motiv; holo: Holo;
  phone: { time: string; notif: number; light: number }; laptop: { typed: string; cursor: boolean; light: number }; lamp: number; dust?: number;
};

const mat = (color: string, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) => new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.85, metalness: 0, ...extra });
const M = {
  skin: mat("#C98F6C"), hair: mat("#22160F", { roughness: 1 }), hoodie: mat("#3B4668"), hood: mat("#323C5A"), pants: mat("#23262F"), shoe: mat("#E9E6E1"),
  dark: mat("#0E0E12"), white: mat("#F7F5F2"), pinkStr: mat(PINK_L), wood: mat("#4A3122"), woodD: mat("#33221A"), wall: mat("#1B1E33"), floor: mat("#231A1A"),
  frame: mat("#2A2E4A"), metal: mat("#8C8F99", { metalness: 0.4, roughness: 0.5 }), lid: mat("#2C2D33", { metalness: 0.3, roughness: 0.5 }), chair: mat("#2B2B33"),
  mug: mat("#E7E2DA"), book1: mat("#6E4A7A"), book2: mat("#2F5D62"), book3: mat("#B8673E"), plant: mat("#2F6B4A"), pot: mat("#9A5B45"),
  motiv: mat(PINK, { roughness: 0.6, emissive: new THREE.Color("#4a1a22"), emissiveIntensity: 0.12 }), motivD: mat(PINK_D, { roughness: 0.6 }), seal: mat("#A84F5D", { roughness: 0.4 }),
  eyeW: mat("#FFFFFF", { roughness: 0.3, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.15 }), pupil: mat("#141016", { roughness: 0.2 }),
  mouthM: mat("#5A1E2A"), skinD: mat("#A8705A"),
};

// ─── textures d'images (captures du vrai site) ───
const useImages = (srcs: string[]) => {
  const [handle] = useState(() => delayRender("Textures 3D"));
  const texs = useMemo(() => {
    let n = srcs.length; const loader = new THREE.TextureLoader(); const done = () => { if (--n <= 0) continueRender(handle); };
    if (!n) continueRender(handle);
    return Object.fromEntries(srcs.map((s) => [s, loader.load(staticFile(s), (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; done(); }, undefined, done)]));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return texs as Record<string, THREE.Texture>;
};
const useFontsReady = () => {
  const [ok, setOk] = useState(false);
  useEffect(() => { const h = delayRender("Polices 3D"); document.fonts.ready.then(() => { setOk(true); continueRender(h); }); }, []);
  return ok;
};

const CamRig: React.FC<{ pos: V3; look: V3; fov: number }> = ({ pos, look, fov }) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camera.position.set(...pos); camera.fov = fov; camera.near = 0.02; camera.far = 60; camera.lookAt(...look); camera.updateProjectionMatrix();
  return null;
};

// ─── la ville et la chambre ───
const City: React.FC = () => {
  const { boxes, wins } = useMemo(() => {
    const r = rnd(7); const boxes: [number, number, number, number, number][] = []; const wins: [number, number, number, string][] = [];
    for (let i = 0; i < 46; i++) {
      const x = -9 + r() * 18, z = -6 - r() * 9, w = 0.8 + r() * 1.6, h = 2 + r() * (Math.abs(x) < 3 ? 7 : 10), d = 0.8 + r() * 1.2;
      boxes.push([x, z, w, h, d]);
      for (let k = 0; k < Math.floor(h * w * 5); k++) if (r() < 0.4) wins.push([x - w / 2 + 0.15 + r() * (w - 0.3), 0.3 + r() * (h - 0.6), z + d / 2 + 0.01, r() < 0.75 ? "#FFD9A0" : r() < 0.5 ? "#BFD4FF" : PINK_L]);
    }
    return { boxes, wins };
  }, []);
  const winMesh = useMemo(() => {
    const geo = new THREE.PlaneGeometry(0.07, 0.1); const m = new THREE.MeshBasicMaterial({ toneMapped: false });
    const im = new THREE.InstancedMesh(geo, m, wins.length); const o = new THREE.Object3D();
    wins.forEach(([x, y, z, c], i) => { o.position.set(x, y - 1.2, z); o.updateMatrix(); im.setMatrixAt(i, o.matrix); im.setColorAt(i, new THREE.Color(c).multiplyScalar(0.9)); });
    return im;
  }, [wins]);
  const sky = useMemo(() => skyTex(), []);
  const stars = useMemo(() => {
    const r = rnd(3); const pts = new Float32Array(240 * 3);
    for (let i = 0; i < 240; i++) { pts[i * 3] = -14 + r() * 28; pts[i * 3 + 1] = 3 + r() * 12; pts[i * 3 + 2] = -19; }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pts, 3)); return g;
  }, []);
  return (
    <group>
      <mesh position={[0, 4, -20]}><planeGeometry args={[60, 30]} /><meshBasicMaterial map={sky} toneMapped={false} /></mesh>
      <points geometry={stars}><pointsMaterial color="#ffffff" size={0.05} sizeAttenuation toneMapped={false} /></points>
      <mesh position={[3.5, 8.5, -19]}><circleGeometry args={[0.7, 20]} /><meshBasicMaterial color="#F5EBD8" toneMapped={false} /></mesh>
      {boxes.map(([x, z, w, h, d], i) => <mesh key={i} position={[x, h / 2 - 1.2, z]}><boxGeometry args={[w, h, d]} /><meshStandardMaterial color={i % 3 ? "#1E2556" : "#171D48"} emissive={i % 2 ? "#0C1030" : "#100C2A"} flatShading roughness={1} /></mesh>)}
      <primitive object={winMesh} />
    </group>
  );
};
const Room: React.FC = () => (
  <group>
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[8, 6]} /><primitive object={M.floor} attach="material" /></mesh>
    {/* mur du fond avec la grande fenêtre (x -1.15..1.15, y 0.95..2.7) */}
    {([[-2.55, 1.6, 2.8, 3.2], [2.55, 1.6, 2.8, 3.2], [0, 0.475, 2.3, 0.95], [0, 3.05, 2.3, 0.7]] as const).map(([x, y, w, h], i) => (
      <mesh key={i} position={[x, y, -1.6]} receiveShadow><boxGeometry args={[w, h, 0.1]} /><primitive object={M.wall} attach="material" /></mesh>
    ))}
    {([[0, 0.95, 2.36, 0.07], [0, 2.7, 2.36, 0.07], [-1.15, 1.825, 0.07, 1.82], [1.15, 1.825, 0.07, 1.82], [0, 1.825, 0.045, 1.8], [0, 1.9, 2.3, 0.04]] as const).map(([x, y, w, h], i) => (
      <mesh key={i} position={[x, y, -1.56]}><boxGeometry args={[w, h, 0.08]} /><primitive object={M.frame} attach="material" /></mesh>
    ))}
    <mesh position={[0, 0.93, -1.48]}><boxGeometry args={[2.4, 0.04, 0.2]} /><primitive object={M.frame} attach="material" /></mesh>
    {/* murs de côté, dans l'ombre */}
    <mesh position={[-2.2, 1.6, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[6, 3.2]} /><primitive object={M.wall} attach="material" /></mesh>
    <mesh position={[2.2, 1.6, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[6, 3.2]} /><primitive object={M.wall} attach="material" /></mesh>
    {/* étagère avec livres et plante, à gauche */}
    <mesh position={[-1.6, 1.55, -1.45]}><boxGeometry args={[0.7, 0.03, 0.22]} /><primitive object={M.wood} attach="material" /></mesh>
    {[0, 1, 2, 3].map((i) => <mesh key={i} position={[-1.85 + i * 0.07, 1.68, -1.45]} rotation={[0, 0, i === 3 ? 0.25 : 0]}><boxGeometry args={[0.05, 0.24 - (i % 2) * 0.04, 0.17]} /><primitive object={[M.book1, M.book2, M.book3, M.book1][i]} attach="material" /></mesh>)}
    <mesh position={[-1.42, 1.62, -1.45]}><cylinderGeometry args={[0.06, 0.05, 0.12, 7]} /><primitive object={M.pot} attach="material" /></mesh>
    {[0, 1, 2, 3, 4].map((i) => <mesh key={i} position={[-1.42 + Math.cos(i * 1.3) * 0.04, 1.76, -1.45 + Math.sin(i * 1.3) * 0.04]} rotation={[Math.cos(i * 1.3) * 0.5, 0, Math.sin(i * 1.3) * 0.5]}><coneGeometry args={[0.03, 0.2, 4]} /><primitive object={M.plant} attach="material" /></mesh>)}
  </group>
);

// ─── le bureau ───
const Desk: React.FC<{ w: World; screen: THREE.Texture; phone: THREE.Texture; glow: THREE.Texture }> = ({ w, screen, phone, glow }) => (
  <group>
    <mesh position={[0, 0.72, -0.45]} castShadow receiveShadow><boxGeometry args={[1.6, 0.04, 0.7]} /><primitive object={M.wood} attach="material" /></mesh>
    {([[-0.76, -0.76], [0.76, -0.76], [-0.76, -0.14], [0.76, -0.14]] as const).map(([x, z], i) => <mesh key={i} position={[x, 0.35, z]}><boxGeometry args={[0.05, 0.7, 0.05]} /><primitive object={M.woodD} attach="material" /></mesh>)}
    {/* chaise, à la place du candidat */}
    <group position={[HUMAN.x, 0, HUMAN.z]} rotation={[0, HUMAN.ry, 0]}>
      <mesh position={[0, 0.44, -0.02]} castShadow><boxGeometry args={[0.46, 0.05, 0.44]} /><primitive object={M.chair} attach="material" /></mesh>
      <mesh position={[0, 0.8, -0.24]} castShadow><boxGeometry args={[0.46, 0.62, 0.05]} /><primitive object={M.chair} attach="material" /></mesh>
      <mesh position={[0, 0.22, -0.02]}><cylinderGeometry args={[0.03, 0.03, 0.42, 6]} /><primitive object={M.metal} attach="material" /></mesh>
    </group>
    {/* ordinateur : socle + écran tourné vers le candidat, logo « mm. » rose au dos */}
    <group position={[-0.24, 0.742, -0.5]} rotation={[0, 2.03, 0]}>
      <mesh castShadow><boxGeometry args={[0.36, 0.014, 0.24]} /><primitive object={M.lid} attach="material" /></mesh>
      <group position={[0, 0.007, -0.12 + 0.24]} rotation={[0.28, 0, 0]}>
        <group position={[0, 0.118, 0]}>
          <mesh castShadow><boxGeometry args={[0.36, 0.236, 0.01]} /><primitive object={M.lid} attach="material" /></mesh>
          <mesh position={[0, 0, -0.0055]} rotation={[0, Math.PI, 0]}><planeGeometry args={[0.34, 0.215]} /><meshBasicMaterial map={screen} toneMapped={false} color={new THREE.Color(1, 1, 1).multiplyScalar(0.55 + 0.45 * w.laptop.light)} /></mesh>
          <mesh position={[0, 0.005, 0.0055]}><circleGeometry args={[0.028, 20]} /><meshBasicMaterial color={PINK_L} toneMapped={false} /></mesh>
          <mesh position={[0, 0.005, 0.0056]}><circleGeometry args={[0.016, 20]} /><meshBasicMaterial color="#2C2D33" /></mesh>
        </group>
      </group>
    </group>
    <pointLight position={[-0.42, 0.98, -0.42]} color="#BFD4FF" intensity={0.04 + 0.1 * w.laptop.light} distance={0.7} decay={2} />
    {/* téléphone posé à plat */}
    <group position={[-0.16, 0.745, -0.2]} rotation={[0, 0.5, 0]}>
      <mesh castShadow><boxGeometry args={[0.075, 0.008, 0.15]} /><primitive object={M.dark} attach="material" /></mesh>
      <mesh position={[0, 0.0045, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[0.068, 0.142]} /><meshBasicMaterial map={phone} toneMapped={false} color={new THREE.Color(1, 1, 1).multiplyScalar(0.25 + 0.75 * w.phone.light)} /></mesh>
    </group>
    {w.phone.light > 0.3 && <pointLight position={[-0.16, 0.85, -0.2]} color="#E8D8FF" intensity={0.6 * w.phone.light} distance={0.6} decay={1.5} />}
    {/* tasse, livres */}
    <group position={[0.62, 0.74, -0.7]}>
      <mesh castShadow><cylinderGeometry args={[0.045, 0.04, 0.1, 9]} /><primitive object={M.mug} attach="material" /></mesh>
      <mesh position={[0.05, 0.0, 0]} rotation={[0, 0, Math.PI / 2]}><torusGeometry args={[0.025, 0.008, 5, 8]} /><primitive object={M.mug} attach="material" /></mesh>
    </group>
    {[0, 1, 2].map((i) => <mesh key={i} position={[0.6, 0.76 + i * 0.035, -0.24]} rotation={[0, 0.2 * i - 0.1, 0]} castShadow><boxGeometry args={[0.24, 0.034, 0.17]} /><primitive object={[M.book2, M.book3, M.book1][i]} attach="material" /></mesh>)}
    {/* lampe de bureau, à gauche */}
    <group position={[0.02, 0.74, -0.74]} rotation={[0, -0.5, 0]}>
      <mesh><cylinderGeometry args={[0.07, 0.08, 0.025, 10]} /><primitive object={M.dark} attach="material" /></mesh>
      <mesh position={[0.03, 0.2, 0]} rotation={[0, 0, -0.25]}><cylinderGeometry args={[0.012, 0.012, 0.42, 6]} /><primitive object={M.dark} attach="material" /></mesh>
      <mesh position={[0.13, 0.4, 0.04]} rotation={[0.2, 0, 0.7]}><coneGeometry args={[0.1, 0.13, 10, 1, true]} /><meshStandardMaterial color="#141418" side={THREE.DoubleSide} flatShading /></mesh>
      <mesh position={[0.16, 0.37, 0.05]}><sphereGeometry args={[0.03, 8, 6]} /><meshBasicMaterial color="#FFE2B0" toneMapped={false} /></mesh>
      <sprite position={[0.16, 0.37, 0.05]} scale={[0.5 * w.lamp, 0.5 * w.lamp, 1]}><spriteMaterial map={glow} color="#FFB870" transparent opacity={0.35 * w.lamp} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>
    </group>
  </group>
);

// ─── le candidat ───
const HAIR = (() => {
  const r = rnd(11); const out: [number, number, number, number][] = [];
  while (out.length < 120) {
    const th = r() * Math.PI * 2, ph = Math.acos(1 - r() * 1.25);           // calotte (haut + arrière + côtés)
    const d: V3 = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)];
    if (d[2] > 0.35 && d[1] < 0.55) continue;                                 // dégager le visage
    const R = 0.14 + r() * 0.05; out.push([d[0] * R, d[1] * (R + 0.015) + 0.025, d[2] * R, 0.03 + r() * 0.022]);
  }
  return out;
})();
const Arm: React.FC<{ side: 1 | -1; x: number; z: number; e: number }> = ({ side, x, z, e }) => (
  <group position={[side * 0.235, 0.47, 0]} rotation={[-x, 0, side * z]}>
    <mesh position={[0, -0.15, 0]} castShadow><boxGeometry args={[0.11, 0.3, 0.11]} /><primitive object={M.hoodie} attach="material" /></mesh>
    <group position={[0, -0.3, 0]} rotation={[-e, 0, 0]}>
      <mesh position={[0, -0.13, 0]} castShadow><boxGeometry args={[0.095, 0.27, 0.095]} /><primitive object={M.hoodie} attach="material" /></mesh>
      <mesh position={[0, -0.3, 0]} castShadow><icosahedronGeometry args={[0.05, 0]} /><primitive object={M.skin} attach="material" /></mesh>
    </group>
  </group>
);
const HumanM: React.FC<{ p: Human }> = ({ p }) => {
  const hipY = 0.47 + (1 - p.sit) * 0.42 + Math.abs(Math.sin(p.walk * Math.PI)) * 0.02 * (1 - p.sit);
  const legA = (side: number) => -Math.PI / 2 * p.sit + (1 - p.sit) * Math.sin(p.walk * Math.PI) * 0.45 * side;
  const knee = (side: number) => Math.PI / 2 * p.sit + (1 - p.sit) * Math.max(0, -Math.sin(p.walk * Math.PI) * side) * 0.6;
  const eyeH = 0.024 * (1 - p.blink) * (1 - 0.45 * p.lids) + 0.003;
  return (
    <group position={[p.x, 0, p.z]} rotation={[0, p.ry, 0]}>
      <group position={[0, hipY, 0]}>
        {[1, -1].map((s) => (
          <group key={s} position={[s * 0.1, 0, 0]} rotation={[legA(s), 0, 0]}>
            <mesh position={[0, -0.21, 0]} castShadow><boxGeometry args={[0.15, 0.44, 0.15]} /><primitive object={M.pants} attach="material" /></mesh>
            <group position={[0, -0.43, 0]} rotation={[knee(s), 0, 0]}>
              <mesh position={[0, -0.21, 0]} castShadow><boxGeometry args={[0.13, 0.42, 0.13]} /><primitive object={M.pants} attach="material" /></mesh>
              <mesh position={[0, -0.43, 0.05]} castShadow><boxGeometry args={[0.12, 0.07, 0.24]} /><primitive object={M.shoe} attach="material" /></mesh>
            </group>
          </group>
        ))}
        <group rotation={[p.lean, p.twist, 0]}>
          <mesh position={[0, 0.27, 0]} castShadow receiveShadow><boxGeometry args={[0.42, 0.52, 0.24]} /><primitive object={M.hoodie} attach="material" /></mesh>
          <mesh position={[0, 0.5, -0.1]} castShadow><boxGeometry args={[0.3, 0.12, 0.12]} /><primitive object={M.hood} attach="material" /></mesh>
          {[-0.05, 0.05].map((x) => <mesh key={x} position={[x, 0.36, 0.125]}><boxGeometry args={[0.012, 0.13, 0.01]} /><primitive object={M.pinkStr} attach="material" /></mesh>)}
          <mesh position={[0, 0.1, 0.123]}><boxGeometry args={[0.24, 0.12, 0.01]} /><primitive object={M.hood} attach="material" /></mesh>
          <Arm side={1} x={p.aLx} z={p.aLz} e={p.aLe} />
          <Arm side={-1} x={p.aRx} z={p.aRz} e={p.aRe} />
          <mesh position={[0, 0.57, 0]} receiveShadow><cylinderGeometry args={[0.05, 0.055, 0.1, 6]} /><primitive object={M.skinD} attach="material" /></mesh>
          <group position={[0, 0.72, 0]} rotation={[p.hPitch, p.hYaw, p.hRoll]}>
            <mesh scale={[1, 1.12, 1.02]} castShadow><icosahedronGeometry args={[0.135, 1]} /><primitive object={M.skin} attach="material" /></mesh>
            {HAIR.map(([x, y, z, r], i) => <mesh key={i} position={[x, y, z]} castShadow><icosahedronGeometry args={[r, 1]} /><primitive object={M.hair} attach="material" /></mesh>)}
            {[-0.135, 0.135].map((x) => <mesh key={x} position={[x, -0.01, 0]}><icosahedronGeometry args={[0.028, 0]} /><primitive object={M.skinD} attach="material" /></mesh>)}
            {[1, -1].map((s) => (
              <group key={s}>
                <mesh position={[s * 0.048 + p.eyeX * 0.008, 0.012 + p.eyeY * 0.006, 0.128]}><boxGeometry args={[0.016, eyeH, 0.012]} /><primitive object={M.dark} attach="material" /></mesh>
                <mesh position={[s * 0.05, 0.058 - p.lids * 0.006 + p.bUp * 0.014, 0.124]} rotation={[0, 0, s * p.brow * 0.35]}><boxGeometry args={[0.042, 0.008, 0.012]} /><primitive object={M.hair} attach="material" /></mesh>
              </group>
            ))}
            <mesh position={[0, -0.02, 0.138]}><boxGeometry args={[0.016, 0.03, 0.014]} /><primitive object={M.skinD} attach="material" /></mesh>
            <mesh position={[0, -0.075, 0.122]}><boxGeometry args={[0.04 - p.mouth * 0.01, 0.006 + p.mouth * 0.024, 0.012]} /><primitive object={M.mouthM} attach="material" /></mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

// ─── Motiv : une enveloppe rose qui flotte, deux grands yeux, un rabat en V qui fait office de sourcils ───
const MotivM: React.FC<{ p: Motiv; t: number; glow: THREE.Texture }> = ({ p, t, glow }) => {
  const bob = Math.sin(t * 2.1) * 0.012 * p.bob, tilt = Math.sin(t * 1.3) * 0.04 * p.bob;
  const tipY = 0.03 + p.flap * 0.03, cx = 0.13, cy = 0.088;
  const len = Math.hypot(cx, cy - tipY), ang = Math.atan2(cy - tipY, cx);
  const eyeS = Math.max(0.06, p.eye * (1 - p.lid * 0.55));
  return (
    <group position={[p.x, p.y + bob, p.z]} rotation={[p.rx, p.ry, p.rz + tilt]} scale={p.s}>
      <mesh castShadow><boxGeometry args={[0.27, 0.185, 0.055]} /><primitive object={M.motiv} attach="material" /></mesh>
      {[1, -1].map((s) => (
        <mesh key={s} position={[s * cx / 2, (cy + tipY) / 2, 0.029]} rotation={[0, 0, -s * ang]}><boxGeometry args={[len + 0.01, 0.012, 0.006]} /><primitive object={M.motivD} attach="material" /></mesh>
      ))}
      <mesh position={[0, tipY, 0.031]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.022, 0.022, 0.008, 12]} /><primitive object={M.seal} attach="material" /></mesh>
      {[1, -1].map((s) => (
        <group key={s} position={[s * 0.058, -0.022, 0.03]} scale={[1, eyeS, 1]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.03, 0.03, 0.008, 16]} /><primitive object={M.eyeW} attach="material" /></mesh>
          <mesh position={[p.px * 0.011, p.py * 0.011, 0.006]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.0155, 0.0155, 0.006, 12]} /><primitive object={M.pupil} attach="material" /></mesh>
          <mesh position={[p.px * 0.011 + 0.005, p.py * 0.011 + 0.006, 0.01]}><circleGeometry args={[0.005, 8]} /><meshBasicMaterial color="#ffffff" /></mesh>
        </group>
      ))}
      {p.lid > 0.02 && [1, -1].map((s) => <mesh key={s} position={[s * 0.058, -0.022 + 0.03 * (1 - p.lid * 0.7), 0.036]}><boxGeometry args={[0.066, 0.03 * p.lid * 1.2, 0.006]} /><primitive object={M.motiv} attach="material" /></mesh>)}
      <mesh position={[0, -0.066 + p.smile * 0.004, 0.029]} scale={[1 + p.smile * 0.4, 0.25 + p.mouth * 1.1, 1]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.016, 0.016, 0.006, 12]} /><primitive object={M.mouthM} attach="material" /></mesh>
      {[1, -1].map((s) => <mesh key={s} position={[s * 0.165, -0.03 + (s > 0 ? p.hL : p.hR) * 0.08, 0.01]}><icosahedronGeometry args={[0.022, 0]} /><primitive object={M.motiv} attach="material" /></mesh>)}
      <pointLight position={[0, 0.05, 0.32]} color="#FF9AAA" intensity={0.14 * p.glow} distance={0.9} decay={1.8} />
      <sprite scale={[0.55, 0.55, 1]} position={[0, 0, -0.04]}><spriteMaterial map={glow} color={PINK} transparent opacity={0.18 * p.glow} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>
    </group>
  );
};

// ─── l'écran holographique projeté par Motiv ───
const HoloM: React.FC<{ h: Holo; tex: THREE.Texture | undefined; glow: THREE.Texture }> = ({ h, tex, glow }) => {
  if (h.on <= 0.01 || !tex) return null;
  const W = 0.27 * h.scale, H = W * (1920 / 1080) * h.crop;
  tex.repeat.set(1, h.crop); tex.offset.set(0, 1 - h.crop);
  const k = h.on;
  return (
    <group>
      <group position={h.pos} rotation={[0, h.ry, 0]} scale={[k, 0.2 + 0.8 * k, 1]}>
        <mesh><planeGeometry args={[W, H]} /><meshBasicMaterial map={tex} toneMapped={false} transparent opacity={0.96 * k} side={THREE.DoubleSide} /></mesh>
        {([[0, H / 2, W + 0.012, 0.006], [0, -H / 2, W + 0.012, 0.006], [W / 2, 0, 0.006, H], [-W / 2, 0, 0.006, H]] as const).map(([x, y, w, hh], i) => (
          <mesh key={i} position={[x, y, 0.001]}><planeGeometry args={[w, hh]} /><meshBasicMaterial color={PINK_L} toneMapped={false} transparent opacity={k} /></mesh>
        ))}
        <sprite scale={[W * 2.4, H * 1.6, 1]} position={[0, 0, -0.02]}><spriteMaterial map={glow} color={PINK} transparent opacity={0.22 * k} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} /></sprite>
      </group>
      <pointLight position={h.pos} color="#FFB3C0" intensity={0.5 * k} distance={1.2} decay={1.5} />
    </group>
  );
};

export const Monde: React.FC<{ w: World; images: string[] }> = ({ w, images }) => {
  const imgs = useImages(images);
  const fontsOk = useFontsReady();
  const glow = useMemo(() => glowTex(), []);
  const lt = w.holo.letter;
  const letter = useMemo(() => (fontsOk && lt ? letterTex(lt.company, lt.hl, lt.focus) : undefined), [fontsOk, lt?.company, Math.round((lt?.hl ?? 0) * 10), Math.round((lt?.focus ?? 0) * 10)]); // eslint-disable-line react-hooks/exhaustive-deps
  const phone = useMemo(() => phoneTex(w.phone.time, w.phone.notif), [fontsOk, w.phone.time, Math.round(w.phone.notif * 12)]); // eslint-disable-line react-hooks/exhaustive-deps
  const screen = useMemo(() => laptopTex(w.laptop.typed, w.laptop.cursor), [fontsOk, w.laptop.typed, w.laptop.cursor]); // eslint-disable-line react-hooks/exhaustive-deps
  const holoTex = w.holo.src === "letter" ? letter : imgs[w.holo.src];
  const spot = useMemo(() => {
    const l = new THREE.SpotLight("#FFB36E", 5, 3.2, 1.0, 0.7, 1.4); l.position.set(0.12, 1.12, -0.68); l.target.position.set(-0.12, 0.72, -0.42);
    l.castShadow = true; l.shadow.mapSize.set(1024, 1024); l.shadow.bias = -0.0005; return l;
  }, []);
  const p = w.motiv;
  return (
    <ThreeCanvas width={1080} height={1920} shadows gl={{ antialias: true, preserveDrawingBuffer: true }} style={{ position: "absolute", inset: 0 }}>
      <CamRig {...w.cam} />
      <color attach="background" args={["#05061a"]} />
      <fog attach="fog" args={["#0a0c22", 6, 22]} />
      <ambientLight color="#3B4A8C" intensity={0.28} />
      <hemisphereLight args={["#2E3E86", "#160E14", 0.32]} />
      <directionalLight position={[1.2, 3.2, -4]} color="#8FA8FF" intensity={0.9} />
      <primitive object={spot} intensity={5 * w.lamp} />
      <primitive object={spot.target} />
      <pointLight position={[0.12, 1.2, -0.66]} color="#FFB36E" intensity={0.7 * w.lamp} distance={2.4} decay={1.6} />
      <City />
      <Room />
      <Desk w={w} screen={screen} phone={phone} glow={glow} />
      <HumanM p={w.human} />
      <MotivM p={p} t={w.t} glow={glow} />
      <HoloM h={w.holo} tex={holoTex} glow={glow} />
    </ThreeCanvas>
  );
};
