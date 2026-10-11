# Son de « G comme gagner ta vie » (GagnerTaVie) : musique type des pubs pixel (PixelSon.pub, tempo plus rapide) +
# bruitages calés sur src/data/gagner-voix.json (caisse enregistreuse sur l'accroche, disque qui s'arrête sur « Calme-toi »).
import sys
sys.path.insert(0, "tools")
from histoire_son import SR
from pixel_son import PixelSon

s = PixelSon("gagner", seed=71)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
s.pub(PH(4)[0], at(55), PH(5)[0], W(109), beat=0.5)
for k in range(2, 7): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
# accroche : caisse enregistreuse + pièces
s.impact(0.02, 0.3); s.riseblips(0.05, 6, 1400, 1.08, 0.05, 0.03)
s.put(s.fx, s.BP(s.noise(0.12), 2000, 7000)*s.env(int(0.12*SR), 0.001, 0.04), 0.3, 0.06); s.chime(0.35, 0.05, (2093, 2637, 3136))
# « Calme-toi. G comme gagner ta vie »
s.tapestop(PH(1)[0] + 0.05, 0.05); s.ppop(PH(1)[0], 0.06, True); s.impact(at(8), 0.25); s.glitch(at(8), 0.15, 0.06)
s.ppop(at(10)); s.chime(at(11), 0.04, (1046.5, 1318.5, 1568))
# pas de taf → salaire
s.ppop(at(18), 0.06, True); s.ppop(at(22))
for j in range(8): s.put(s.fx, s.square(1200 + j*60, 0.05, 0.5, 0.03), at(26) + j*0.12, 0.025)
s.ppop(at(26), 0.05, True)
# le point sensible
s.ppop(at(41)); s.ppop(PH(3)[0]); s.ping(at(42), 0.04); s.ppop(at(48), 0.05, True)
# la lettre
s.ping(PH(4)[0] - 0.1, 0.04); s.typer(at(51)); s.paper(at(54) + 0.25, 0.06); s.typer(at(55)); s.typer(at(59)); s.stamp(at(63), 0.12)
# MyMotiv
s.chime(PH(5)[0] - 0.05, 0.05); s.ppop(at(72))
for k, i in enumerate((74, 78, 84)): s.riseblips(at(i), 2, 880 + k*110, 1.25, 0.08, 0.025)
s.ppop(at(87), 0.05, True)
s.cta(at(103), at(106), at(92), at(96)); s.riseblips(at(94), 6, 1400, 1.08, 0.05, 0.02)
s.mix(mus_g=0.45, fx_g=1.5, amb_g=0.0, duck=0.5)
