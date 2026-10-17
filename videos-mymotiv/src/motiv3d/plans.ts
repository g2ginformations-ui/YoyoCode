// Les plans de caméra des histoires « Motiv » (décor de Monde.tsx). pos2/look2 = fin du travelling lent.
import { Shot } from "./anim";
export const PLANS: Record<string, Shot> = {
  large: { pos: [-0.12, 1.38, 2.2], look: [-0.12, 1.05, -0.5], fov: 50, pos2: [-0.12, 1.33, 1.95], look2: [-0.12, 1.04, -0.5] },
  candidat: { pos: [0.81, 1.26, 0.3], look: [-0.54, 1.14, -0.46], fov: 36, pos2: [0.7, 1.25, 0.25] },
  motiv: { pos: [-0.42, 1.13, 0.24], look: [0.36, 1.0, -0.55], fov: 42, pos2: [-0.34, 1.12, 0.16] },
  holo: { pos: [-0.45, 1.25, 0.28], look: [-0.05, 1.2, -0.62], fov: 44, pos2: [-0.42, 1.25, 0.2] },
  telephone: { pos: [-0.14, 1.08, -0.04], look: [-0.16, 0.745, -0.2], fov: 34, pos2: [-0.15, 1.02, -0.08] },
  dessus: { pos: [-0.1, 4.2, 0.6], look: [-0.1, 0, -0.4], fov: 60 },
};
