# Son de « Le miroir » (Miroir) : musique type des pubs pixel (PixelSon.pub) + bruitages calés sur src/data/miroir-voix.json.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon

s = PixelSon("miroir", seed=52)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
s.pub(PH(3)[0], PH(4)[0] - 0.1, PH(5)[0], W(111))
for k in range(1, 7): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
s.impact(0.02, 0.35); s.glitch(0.02, 0.2, 0.1); s.ppop(0.05, 0.05, True)                                                   # accroche
s.chime(at(4), 0.03, (1568, 2093, 2637)); s.ppop(at(5), 0.05, True)
s.ping(PH(1)[0] - 0.1, 0.04); s.ppop(at(14)); s.ppop(at(20), 0.06, True); s.ppop(at(22) + 0.3)                           # similarité
s.ppop(PH(2)[0] - 0.1); s.ppop(at(23)); s.ppop(at(25)); s.ppop(at(25) + 0.2); s.ppop(at(25) + 0.3); s.ppop(at(28))        # mêmes mots
s.chime(at(34), 0.03)
s.ppop(PH(3)[0] - 0.1); s.typer(at(42), 10); s.stamp(at(47), 0.2); s.glitch(at(47), 0.2, 0.08)                          # pas la même langue
s.ping(PH(4)[0] - 0.1, 0.04); s.riseblips(at(56), 2, 700, 1.3, 0.12, 0.025); s.ppop(at(60)); s.typer(at(64)); s.typer(at(67))
s.chime(at(70), 0.04, (1046.5, 1318.5, 1568))
s.chime(PH(5)[0] - 0.05, 0.05); s.ppop(at(79))                                                                             # MyMotiv
for k, i in enumerate((81, 86, 92)): s.riseblips(at(i), 2, 880 + k*110, 1.25, 0.08, 0.025)
s.cta(at(96), at(99), at(103), at(108))
s.mix(mus_g=0.4, fx_g=1.5, amb_g=0.0, duck=0.5)
