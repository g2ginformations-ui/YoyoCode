# Son de « Le premier chiffre » (Ancrage) : musique type des pubs pixel (PixelSon.pub) + bruitages calés sur
# src/data/ancrage-voix.json (coup sur l'accroche, prix barré, ancre qui tombe, tampon, barres de valeur, fin commune).
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon

s = PixelSon("ancrage", seed=51)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
s.pub(PH(3)[0], at(61), PH(5)[0], W(122))
for k in range(1, 7): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
s.impact(0.02, 0.35); s.glitch(0.02, 0.2, 0.1); s.ppop(0.05, 0.05, True); s.ppop(at(6), 0.05, True)                     # accroche
s.ppop(PH(1)[0] - 0.1); s.ppop(at(13)); s.paper(at(15) + 0.05, 0.06); s.riseblips(at(17), 4, 1200, 1.12, 0.05, 0.03)     # la montre
s.glitch(at(17), 0.15, 0.06); s.ppop(at(19))
s.ping(PH(2)[0] - 0.1, 0.04); s.ppop(at(24), 0.06, True); s.stamp(at(30), 0.12); s.ppop(at(33))                         # l'ancrage
s.ppop(PH(3)[0] - 0.1); s.typer(at(49), 10); s.stamp(at(58), 0.22); s.glitch(at(58), 0.2, 0.08); s.ppop(at(60))          # ancre faible
s.ping(PH(4)[0] - 0.1, 0.04); s.typer(at(70)); s.typer(at(73)); s.riseblips(at(76), 5, 500, 1.15, 0.1, 0.02)             # vraie preuve
s.chime(PH(5)[0] - 0.05, 0.05); s.ppop(at(88)); s.riseblips(at(94), 2, 880, 1.25, 0.08, 0.025)                            # MyMotiv
s.riseblips(at(97), 2, 990, 1.25, 0.08, 0.025); s.buzzer(at(101), 0.025)
s.cta(at(105), at(108), at(111), at(118))
s.mix(mus_g=0.5, fx_g=1.5, amb_g=0.0, duck=0.5)
