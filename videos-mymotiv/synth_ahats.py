# Son de « Ahhh, l'ATS ! » (AhATS, ≈19 s) : cri qui monte (bruit qui enfle), le beat démarre quand « L'ATS ! » claque,
# cartes qui se trient, la phrase qui se retourne (whoosh), « elle les a ? », logo, 3 coches, « sans rien inventer », fin.
# Temps calés sur src/AhATS.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, groove

s = PixelSon("ahats", seed=197)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]
s.riseblips(0.05, 9, 300, 1.12, 0.12, 0.02)
groove(s, at(1) - 0.05, s.DUR - 1.0, 0.5, CH)
s.pad(s.DUR - 2.0, s.DUR, [57, 64, 69, 72], g=1.2)
claque(s, at(1) - 0.05, 1.4); s.chime(at(1), 0.05)
for i in (5, 7, 9): claque(s, at(i), 0.7)
for i in range(6): s.paper(at(9) + i*0.14, 0.03)
s.whoosh(at(11) - 0.1, "MoyenSourd", 0.08); claque(s, at(16), 1.0)
s.whoosh(sc(2) - 0.05, "Court", 0.06); claque(s, at(23), 1.1)
s.whoosh(at(26) - 0.05, "MoyenSourd", 0.07); claque(s, at(26), 1.0)
for i in (29, 37): s.pop(at(i), 700, 1500, 0.05)
claque(s, at(40), 1.0)
claque(s, at(42) - 0.1, 0.9); claque(s, at(44) - 0.1, 0.9)
s.whoosh(sc(4) - 0.05, "MoyenSourd", 0.07); s.pop(sc(4) + 0.1, 300, 900, 0.06); s.chime(sc(4) + 0.3, 0.05)
s.pop(at(48), 600, 1300, 0.05)
s.mix(mus_g=0.34, fx_g=1.5, amb_g=0.0, duck=0.6)
