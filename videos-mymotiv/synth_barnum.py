# Son de « Je lis dans ta tête » (Barnum) : même univers 8 bits que synth_fauxdm.py. Ambiance « voyante » (arpèges lents,
# scintillement de la boule), bips d'analyse, silence sur « ça te ressemble ? », coupure + tampon sur la révélation,
# explication plus légère, majeur pour MyMotiv, ritournelle finale. Temps calés sur src/data/barnum-voix.json.
import sys
import numpy as np
sys.path.insert(0, "tools")
from histoire_son import SR
from pixel_son import PixelSon

s = PixelSon("barnum", seed=31)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
mt = s.mtof

# ─── musique ───
M_ = [[57, 60, 64, 69], [50, 53, 57, 62], [53, 57, 60, 65], [52, 56, 59, 64]]         # Am Dm F E (voyante)
s.section(0.1, PH(2)[0] - 0.2, M_, 0.75, g=0.7, kicks=False, hats=False)
s.pad(0.1, PH(2)[0], [45, 52, 57], g=1.2)
B = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [55, 59, 62]]                           # Am G F G
s.section(PH(4)[0] - 0.05, at(135) - 0.4, B, 0.6, g=0.75, kicks=False)
C = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]          # C G Am F
lead = [[(76, 1), (79, 1), (84, 2)], [(83, 2), (79, 2)], [(81, 1), (84, 1), (88, 2)], [(84, 3), (81, 1)]]
s.section(at(135) - 0.05, PH(8)[0] - 0.1, C, 0.55, g=0.9, lead=lead)
s.section(PH(8)[0] - 0.1, s.DUR - 1.2, C, 0.55, g=0.6, kicks=False)
s.pad(s.DUR - 1.6, s.DUR, [60, 64, 67, 72], g=1.2)
for j, n in enumerate([72, 76, 79, 84]): s.put(s.mus, s.square(mt(n), 0.25, 0.5, 0.15), W(169) + 0.45 + j*0.11, 0.05)

# ─── bruitages ───
for k in (1, 2, 3, 4, 5, 6, 8): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
s.whoosh(at(135) - 0.3, "Court", 0.05)
# 0 — la boule
s.shimmer(0.05, 0.04); s.ppop(at(2), 0.06, True); s.ppop(at(6))
# 1 — l'analyse
s.ppop(PH(1)[0] - 0.1); s.ping(PH(1)[0], 0.04)
for k in range(int((at(38) - PH(1)[0])/0.4)): s.put(s.fx, s.square(1400 if k % 2 else 1250, 0.04, 0.5, 0.03), PH(1)[0] + 0.2 + k*0.4, 0.012)
for i in (10, 19, 28): s.typer(at(i))
s.typer(at(38)); s.chime(at(38) + 0.1, 0.04)
# 2 — « ça te ressemble ? »
b = at(43) + 0.3
s.ppop(PH(2)[0] - 0.1); s.ppop(b, 0.05, True); s.click(b + 1.1); s.blip(b + 1.12, 1500, 0.03)
# 3 — la révélation
s.tapestop(at(47) - 0.05); s.impact(at(48), 0.3); s.glitch(at(48), 0.3, 0.1)
for j in range(6): s.ppop(at(48) + j*0.1, 0.035)
s.stamp(at(53), 0.2); s.ppop(at(56))
# 4 — Barnum
s.ping(PH(4)[0] - 0.1, 0.04); s.ppop(at(62), 0.06, True); s.ppop(at(66)); s.ppop(at(75)); s.chime(at(75) + 0.1, 0.03)
# 5 — la lettre qui va à tout le monde
s.ppop(PH(5)[0] - 0.1)
for i in (92, 93, 94): s.ppop(at(i), 0.04)
for j in range(5): s.put(s.fx, s.square(700 + j*60, 0.05, 0.5, 0.03), at(97) + j*0.1, 0.02)
s.stamp(at(104), 0.2)
# 6 — l'inverse
for i in (114, 117, 122, 127): s.ppop(at(i))
s.ppop(at(124), 0.05, True); s.chime(at(128), 0.045, (1046.5, 1318.5, 1568))
# 7 — MyMotiv
s.chime(at(135), 0.05); s.ppop(at(136))
for k, i in enumerate((137, 142, 145)): s.riseblips(at(i), 2, 880 + k*110, 1.25, 0.08, 0.025)
s.ppop(at(147), 0.05, True)
# 8 — CTA
s.ppop(PH(8)[0] - 0.05); s.typer(PH(8)[0] + 0.1, 6); s.ppop(at(153)); s.click(at(157) + 0.8)
s.chime(at(163), 0.04, (1046.5, 1318.5, 1568)); s.ppop(at(167), 0.05, True)

s.mix(mus_g=0.5, fx_g=1.5, amb_g=0.0, duck=0.5)
