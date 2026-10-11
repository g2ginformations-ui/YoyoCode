# Son de « La première ligne » (PremiereLigne, ≈31 s) : même univers 8 bits que synth_fauxdm.py. Coup + glitch sur
# l'accroche, pulsation tendue, creux sur la lettre « banale » (tampon), remontée sur « ouvre sur leur besoin », majeur pour
# MyMotiv, ritournelle finale. Temps calés sur src/data/ligne-voix.json.
import sys
import numpy as np
sys.path.insert(0, "tools")
from histoire_son import SR
from pixel_son import PixelSon

s = PixelSon("ligne", seed=41)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
mt = s.mtof

# ─── musique ───
A = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]          # Am F Dm E
s.section(0.05, PH(3)[0] - 0.1, A, 0.55, g=0.85)
for k in range(int((at(51) - PH(3)[0])/0.55)):                                          # la lettre banale : basse + tic-tac
    t = PH(3)[0] + k*0.55
    s.hat(t, 0.025)
    if k % 2 == 0: s.put(s.mus, s.tri(mt(33), 0.5, 0.4), t, 0.08)
B = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [55, 59, 62]]                           # Am G F G
s.section(at(51) - 0.05, PH(5)[0] - 0.1, B, 0.55, g=0.85)
C = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]          # C G Am F
lead = [[(76, 1), (79, 1), (84, 2)], [(83, 2), (79, 2)], [(81, 1), (84, 1), (88, 2)], [(84, 3), (81, 1)]]
s.section(PH(5)[0] - 0.1, s.DUR - 1.2, C, 0.55, g=0.85, lead=lead)
s.pad(s.DUR - 1.6, s.DUR, [60, 64, 67, 72], g=1.2)
for j, n in enumerate([72, 76, 79, 84]): s.put(s.mus, s.square(mt(n), 0.25, 0.5, 0.15), W(104) + 0.4 + j*0.11, 0.05)

# ─── bruitages ───
for k in (2, 3, 4, 5, 6): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
# 0–1 — l'accroche et la lettre
s.impact(0.02, 0.35); s.glitch(0.02, 0.2, 0.1); s.ppop(0.05, 0.05, True)
s.ppop(at(13)); s.riseblips(at(15), 5, 500, 1.12, 0.1, 0.02); s.ppop(at(19), 0.05, True)
# 2 — l'effet de halo
s.ping(PH(2)[0] - 0.1, 0.04); s.ppop(at(24), 0.06, True); s.ppop(at(28)); s.shimmer(at(32), 0.035)
# 3 — la lettre banale
s.ppop(PH(3)[0] - 0.1); s.typer(at(37), 10); s.stamp(at(46), 0.22); s.glitch(at(46), 0.2, 0.08)
# 4 — leur besoin + une preuve
s.ping(PH(4)[0] - 0.1, 0.04); s.typer(at(51)); s.typer(at(57)); s.stamp(at(61) + 0.05, 0.07); s.riseblips(at(63), 10, 500, 1.1, 0.08, 0.016)
# 5 — MyMotiv
s.chime(PH(5)[0] - 0.05, 0.05); s.ppop(at(73))
for k, i in enumerate((75, 80, 83)): s.riseblips(at(i), 2, 880 + k*110, 1.25, 0.08, 0.025)
# 6 — offre, bio, commentaire
s.chime(at(87), 0.04, (1046.5, 1318.5, 1568)); s.ppop(at(90), 0.05, True); s.ping(at(93), 0.04)
for k in range(10): s.put(s.fx, s.square(1500 + 80*(k % 3), 0.03, 0.5, 0.015), at(95) + k/8, 0.012)
s.ppop(at(99), 0.05, True)

s.mix(mus_g=0.5, fx_g=1.5, amb_g=0.0, duck=0.5)
