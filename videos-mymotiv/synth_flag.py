# Son de « Red flag ou green flag ? » (Flags, ≈42 s) : beat pop, chaque affirmation arrive sur un « whoosh », le verdict
# claque : « red flag » = impact grave + buzzer, « green flag » = impact + carillon clair ; les coches « tu relis, ajustes,
# valides », « green flag partout », fin, appel à commenter. Temps calés sur src/Flags.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, groove

s = PixelSon("flag", seed=404)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
CH = [[57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67], [52, 56, 59, 64]]     # Am F G E
groove(s, 0.0, s.DUR - 0.8, 0.5, CH, g=0.85)
s.pad(s.DUR - 2.4, s.DUR, [57, 64, 69, 72], g=1.0)
claque(s, 0.02, 1.0)
claque(s, at(12) - 0.1, 1.1); s.buzzer(at(12) - 0.05, 0.02)
claque(s, at(15) - 0.1, 1.0); s.chime(at(15) - 0.05, 0.04, (1318.5, 1568, 2093))
MANCHES = [(1, 25, False), (2, 36, True), (3, 43, False), (4, 57, False), (5, 72, True), (6, 79, False), (7, 89, True)]
for ph, mot, vert in MANCHES:
    s.whoosh(sc(ph), "Court", 0.05)
    claque(s, at(mot) - 0.1, 1.2)
    if vert: s.chime(at(mot) - 0.05, 0.045, (1318.5, 1568, 2093))
    else: s.buzzer(at(mot) - 0.05, 0.03)
s.pop(at(34) - 0.1, 600, 1300, 0.035); s.pop(at(65) - 0.1, 600, 1300, 0.035); s.pop(at(85) - 0.1, 600, 1300, 0.035)
s.whoosh(sc(8), "Court", 0.05)
for i in (99, 101, 104): s.pop(at(i) - 0.1, 700, 1500, 0.045)
s.whoosh(sc(9), "MoyenSourd", 0.06)
for j in range(4): s.pop(at(109) - 0.2 + j * 0.12, 700 + 80 * j, 1500, 0.035)
s.chime(at(112) + 0.1, 0.05, (1046.5, 1318.5, 1568)); s.pop(at(117) - 0.05, 700, 1500, 0.045)
claque(s, at(121) - 0.1, 1.0); s.pop(at(129) - 0.1, 600, 1300, 0.045)
s.mix(mus_g=0.34, fx_g=1.4, amb_g=0.0, duck=0.6)
