# Son de « La dernière phrase » (Recence) : musique type des pubs pixel (PixelSon.pub) + bruitages calés sur
# src/data/recence-voix.json (creux pendant la formule de politesse et « il retient… rien »).
import sys
sys.path.insert(0, "tools")
from histoire_son import SR
from pixel_son import PixelSon

s = PixelSon("recence", seed=53)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
s.pub(PH(2)[0], PH(4)[0] - 0.1, PH(5)[0], W(115))
for k in range(1, 7): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
s.impact(0.02, 0.35); s.glitch(0.02, 0.2, 0.1); s.ppop(0.05, 0.05, True)                                                   # accroche
s.ping(PH(1)[0] - 0.1, 0.04); s.ppop(at(15), 0.06, True); s.ppop(at(26)); s.riseblips(at(30), 6, 500, 1.06, 0.06, 0.018)  # récence
s.chime(at(30) + 0.5, 0.03)
s.ppop(PH(2)[0] - 0.1)                                                                                                      # la formule
for i in (40, 45, 48, 51, 52): s.typer(at(i), 6)
s.ppop(at(54), 0.05, True)                                                                                                  # bravo… rien
for k in range(3): s.put(s.fx, s.BP(s.noise(0.06), 800, 4000)*s.env(int(0.06*SR), 0.002, 0.02), at(54) + 0.1 + k*0.14, 0.05)
for k in range(3): s.put(s.fx, s.square(500 - k*90, 0.2, 0.5, 0.15), PH(3)[0] + 0.3 + k*0.18, 0.025)
s.stamp(at(57), 0.22); s.glitch(at(57), 0.2, 0.08)
s.ping(PH(4)[0] - 0.1, 0.04); s.typer(at(60)); s.typer(at(69)); s.stamp(at(74) + 0.05, 0.07); s.ppop(at(74), 0.05, True)  # la bonne fin
s.chime(PH(5)[0] - 0.05, 0.05); s.ppop(at(85))                                                                             # MyMotiv
for k, i in enumerate((87, 93, 96)): s.riseblips(at(i), 2, 880 + k*110, 1.25, 0.08, 0.025)
s.cta(at(99), at(102), at(105), at(111))
s.mix(mus_g=0.5, fx_g=1.5, amb_g=0.0, duck=0.5)
