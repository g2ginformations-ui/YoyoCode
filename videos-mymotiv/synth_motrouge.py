# Son de « Le mot rouge » (MotRouge) : même univers 8 bits que synth_fauxdm.py. Petite boucle de suspense, liste des
# 8 mots sur un tic-tac (bip par mot, « coup » sur TRACTIONS), silence + 3 bips de compte à rebours, révélation, explication
# plus légère, majeur pour MyMotiv, ritournelle finale. Temps calés sur src/data/motrouge-voix.json.
import sys
import numpy as np
sys.path.insert(0, "tools")
from histoire_son import SR
from pixel_son import PixelSon

s = PixelSon("motrouge", seed=21)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
mt = s.mtof

# ─── musique ───
A = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]          # Am F Dm E
s.section(0.1, PH(1)[0] - 0.15, A, 0.6, g=0.75, kicks=False)
for k in range(int((PH(2)[0] - PH(1)[0])/0.5)):                                        # la liste : tic-tac + basse
    t = PH(1)[0] - 0.1 + k*0.5
    s.hat(t, 0.03)
    if k % 2 == 0: s.put(s.mus, s.tri(mt(33), 0.55, 0.4), t, 0.08)
B = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [55, 59, 62]]                           # Am G F G
s.section(PH(4)[0] - 0.05, at(107) - 0.3, B, 0.6, g=0.75, kicks=False)
C = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]          # C G Am F
lead = [[(76, 1), (79, 1), (84, 2)], [(83, 2), (79, 2)], [(81, 1), (84, 1), (88, 2)], [(84, 3), (81, 1)]]
s.section(at(107) - 0.05, PH(8)[0] - 0.1, C, 0.55, g=0.9, lead=lead)
s.section(PH(8)[0] - 0.1, s.DUR - 1.2, C, 0.55, g=0.6, kicks=False, lead=None)
s.pad(s.DUR - 1.6, s.DUR, [60, 64, 67, 72], g=1.2)
for j, n in enumerate([72, 76, 79, 84]): s.put(s.mus, s.square(mt(n), 0.25, 0.5, 0.15), W(142) + 0.45 + j*0.11, 0.05)

# ─── bruitages ───
for k in range(1, 9): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
# 0 — le test
s.ppop(0.05, 0.05); s.ppop(at(5), 0.06, True); s.ppop(at(7)); s.ppop(at(13))
# 1 — les 8 mots
for j in range(8):
    if j == 4:                                                                          # TRACTIONS : le mot rouge
        s.stamp(at(20), 0.16); s.chime(at(20), 0.045, (1318.5, 1760, 2349)); s.glitch(at(20), 0.15, 0.06)
    else:
        s.put(s.fx, s.square(1046.5 + j*40, 0.08, 0.5, 0.05), at(16 + j), 0.035)
# 2 — la question, le compte à rebours
s.ppop(PH(2)[0] - 0.1); s.ppop(at(25), 0.06, True)
c0 = PH(2)[1] + 0.1
for k in range(3): s.put(s.fx, s.square(880, 0.15, 0.5, 0.1), c0 + k*0.7, 0.05)
s.put(s.fx, s.square(1760, 0.35, 0.5, 0.25), c0 + 2.1, 0.04)
# 3 — la mémoire brouillée, puis TRACTIONS
for k in range(8): s.put(s.fx, s.square(600 + k*25, 0.04, 0.5, 0.03), PH(3)[0] - 0.1 + k*0.05, 0.02)
s.ppop(at(32)); s.impact(at(45), 0.25); s.chime(at(45), 0.05, (1318.5, 1760, 2349))
# 4 — Von Restorff
s.ping(PH(4)[0] - 0.1, 0.04); s.ppop(at(49), 0.06, True); s.ppop(at(52)); s.riseblips(at(55), 8, 500, 1.06, 0.06, 0.018)
s.chime(at(61), 0.035); s.ppop(at(61), 0.05, True)
# 5 — la pile de lettres
s.ppop(at(73))
for k in range(5): s.paper(at(75) + k*0.08, 0.05)
s.typer(at(78)); s.typer(at(80), 5)
for k in range(3): s.put(s.fx, s.square(500 - k*90, 0.2, 0.5, 0.15), at(81) + k*0.18, 0.025)
s.ppop(at(81))
# 6 — ta lettre, le mot rouge
s.ping(at(88)); s.stamp(at(88) + 0.05, 0.08); s.typer(at(91)); s.typer(at(95)); s.ppop(at(95), 0.05, True)
# 7 — MyMotiv
s.chime(at(107), 0.05); s.ppop(at(108))
for k, i in enumerate((111, 116, 120)): s.riseblips(at(i), 2, 880 + k*110, 1.25, 0.08, 0.025)
# 8 — CTA
s.ppop(PH(8)[0] - 0.05); s.typer(PH(8)[0] + 0.1, 6); s.ppop(at(132))
s.chime(at(136), 0.04, (1046.5, 1318.5, 1568)); s.ppop(at(140), 0.05, True)

s.mix(mus_g=0.5, fx_g=1.5, amb_g=0.0, duck=0.5)
