# Son du tuto « TUTO lettre de motiv en 30 secondes* » (TutoDoigt, ≈23 s) : comme la vidéo de référence mesurée avec la
# compétence steal (spectrogramme : la voix seule, ni musique ni bruitage), on garde la voix et un léger fond de pièce,
# plus une note douce sur l'écran de fin. Temps calés sur src/TutoDoigt.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon

s = PixelSon("doigt", seed=55)
P4 = s.PH(4)[0] - 0.15
s.ambiance(0.0, s.DUR, g=0.7)
s.chime(P4 + 0.2, 0.03, (1046.5, 1318.5, 1568))
s.mix(mus_g=0.0, fx_g=1.0, amb_g=0.8, duck=0.6)
