# Son de la micro-pub « Ton CV est en papier ? » (PhotoCV, ≈10 s) : beat pop dès la 1re image, déclic d'appareil photo
# sur « photo » (bruit sec + petit claquement mécanique), la photo qui file (whoosh), lecture (petits bips montants),
# « CV lu » (carillon), le lien collé, la lettre prête, fin. Temps calés sur src/PhotoCV.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, groove
from histoire_son import SR

s = PixelSon("photo", seed=77)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
T_DECLIC = at(9) - 0.05; T_SITE = T_DECLIC + 0.45; T_LU = at(13) + 0.05
T_OFFRE, T_ANALYSE, T_LETTRE, T_FIN = sc(2), at(18) - 0.1, at(24) - 0.1, sc(3)
CH = [[57, 60, 64, 69], [53, 57, 60, 65], [60, 64, 67, 72], [55, 59, 62, 67]]
groove(s, 0.0, s.DUR - 0.6, 0.47, CH, g=0.9)
s.pad(T_FIN, s.DUR, [57, 64, 69, 72], g=1.0)
claque(s, 0.02, 1.0); claque(s, 0.12, 0.7)
s.click(0.6, 0.04)                                                                  # mise au point
s.put(s.fx, s.BP(s.noise(0.05), 2000, 9000) * s.env(int(0.05 * SR), 0.0005, 0.015), T_DECLIC, 0.12)   # déclic
s.put(s.fx, s.BP(s.noise(0.06), 600, 3000) * s.env(int(0.06 * SR), 0.001, 0.02), T_DECLIC + 0.07, 0.08)
s.whoosh(T_DECLIC + 0.15, "Court", 0.06)
s.riseblips(T_SITE + 0.05, 7, 700, 1.08, (T_LU - T_SITE - 0.15) / 7, 0.011)
s.chime(T_LU, 0.04, (1318.5, 1568, 2093))
s.click(T_OFFRE + 0.1, 0.08); s.key(T_OFFRE + 0.15, 0.05)
for j in range(4): s.blip(T_ANALYSE + 0.05 + j * (T_LETTRE - T_ANALYSE - 0.1) / 4, 1100 + 120 * j, 0.022)
s.pop(at(20) - 0.1, 600, 1400, 0.05); s.chime(T_LETTRE, 0.05)
s.chime(T_FIN + 0.2, 0.05, (1046.5, 1318.5, 1568)); s.pop(at(30) - 0.05, 700, 1500, 0.045)
s.mix(mus_g=0.36, fx_g=1.4, amb_g=0.0, duck=0.6)
