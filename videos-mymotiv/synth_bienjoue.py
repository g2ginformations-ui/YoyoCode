# Son de « Bien joué » (BienJoue, ≈17 s) : beat dès la 1re image, un « claquement » à chaque mot géant, éclat sur « bien
# joué », explosion des lettres, pops des mots-clés, fin. Temps calés sur src/BienJoue.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, groove

s = PixelSon("bienjoue", seed=191)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
CH = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]
groove(s, 0.0, s.DUR - 1.0, 0.48, CH)
s.pad(s.DUR - 2.0, s.DUR, [60, 64, 67, 72], g=1.2)
claque(s, 0.0, 1.2)
for i in (4, 7, 10): claque(s, at(i), 0.9); s.whoosh(at(i) - 0.08, "Court", 0.05)
claque(s, at(12), 1.4); s.chime(at(12) + 0.05, 0.05)
for i in (14, 16, 18): claque(s, at(i), 0.7)
s.whoosh(sc(3) - 0.05, "MoyenSourd", 0.07); s.impact(sc(3), 0.2)
for i in range(6): s.paper(sc(3) + i*0.05, 0.03)
s.pop(at(19), 400, 1000, 0.06)
s.whoosh(at(21) - 0.05, "Court", 0.06)
for i in range(4): s.pop(at(23) + i*0.12, 700, 1500, 0.04)
s.whoosh(at(33) - 0.05, "Court", 0.06); s.chime(at(34), 0.04)
s.whoosh(sc(4) - 0.05, "MoyenSourd", 0.06); s.riseblips(at(38), 8, 600, 1.12, 0.05, 0.02)
s.pop(at(41), 300, 900, 0.06); s.chime(at(41) + 0.25, 0.05)
s.mix(mus_g=0.34, fx_g=1.5, amb_g=0.0, duck=0.6)
