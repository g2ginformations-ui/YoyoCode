# Son de « Sans… » (SansRien, ≈13 s) : beat sec, « claquement » sur chaque « sans », trait de feutre sur chaque mot barré,
# impact sur le logo, 3 coups pour « 1 offre / 1 lettre / 30 s* », fin. Temps calés sur src/SansRien.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, feutre, groove

s = PixelSon("sans", seed=193)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 56, 59, 64]]
groove(s, 0.0, s.DUR - 1.0, 0.5, CH)
s.pad(s.DUR - 2.0, s.DUR, [57, 64, 69, 72], g=1.2)
for i in (0, 3, 6, 9): claque(s, at(i), 0.8)
for a in (at(2) + 0.25, at(5) + 0.25, at(8) + 0.25, at(13) + 0.2): feutre(s, a, 0.22, 0.07)
s.pop(at(13), 600, 1300, 0.04)
s.whoosh(sc(1) - 0.05, "MoyenSourd", 0.07); claque(s, at(17), 1.3); s.chime(at(17) + 0.05, 0.05)
for i in (19, 21, 23): claque(s, at(i), 0.9)
s.whoosh(sc(2) - 0.05, "Court", 0.06); claque(s, at(28), 0.8)
s.pop(at(30), 600, 1300, 0.05); s.chime(at(30) + 0.2, 0.05)
s.mix(mus_g=0.34, fx_g=1.5, amb_g=0.0, duck=0.6)
