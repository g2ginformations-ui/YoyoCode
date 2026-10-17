# Son de « Les mots de l'offre » (MotsCles, ≈13 s) : papier qui tombe dans la machine sur une nappe, le beat démarre quand
# « ATS » claque, frappe dans la barre de recherche, « pop » des mots-clés, carillon quand la lettre les surligne, impact
# sur « sans rien inventer », fin. Temps calés sur src/MotsCles.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, frappe, groove

s = PixelSon("motscles", seed=181)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]
s.pad(0.05, at(7), [57, 64, 67], g=1.2)
for i in range(7): s.paper(0.1 + i*0.35, 0.03)
s.pop(at(5), 500, 1100, 0.05)
groove(s, at(7) - 0.05, s.DUR - 1.0, 0.5, CH)
s.pad(s.DUR - 2.0, s.DUR, [57, 64, 69, 72], g=1.2)
claque(s, at(7) - 0.05, 1.3); s.chime(at(7) + 0.05, 0.05)
s.whoosh(sc(1) - 0.05, "Court", 0.07); frappe(s, at(11), 30, 0.035, 0.03)
for i in range(3): s.pop(at(13) + i*0.15, 700, 1500, 0.045)
s.whoosh(sc(2) - 0.05, "MoyenSourd", 0.07); s.pop(at(17), 400, 1000, 0.05)
s.chime(at(20) + 0.1, 0.045, (1568, 2093, 2637))
claque(s, at(24) - 0.05, 1.1)
s.whoosh(sc(3) - 0.05, "MoyenSourd", 0.07); s.pop(sc(3) + 0.1, 300, 900, 0.06); s.chime(sc(3) + 0.3, 0.05)
s.pop(at(30), 600, 1300, 0.05)
s.mix(mus_g=0.34, fx_g=1.5, amb_g=0.0, duck=0.6)
