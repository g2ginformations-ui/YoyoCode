# Son de « Le faux DM » en 30 s (FauxDM30) : même univers que synth_fauxdm.py, resserré. Musique 8 bits sombre (la) qui
# monte jusqu'à la coupure sur « Tout est faux », reprise légère pour l'effet Zeigarnik, majeur pour MyMotiv, ritournelle
# finale. Temps calés sur src/data/fauxdm30-voix.json.
import sys
import numpy as np
sys.path.insert(0, "tools")
from histoire_son import SR
from pixel_son import PixelSon

s = PixelSon("fauxdm30", seed=12)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
mt = s.mtof

# ─── musique ───
cut = W(57) - 0.05                                                                       # « Tout est faux »
A = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]          # Am F Dm E
s.section(0.1, PH(2)[0] - 0.1, A, 0.6, g=0.8, kicks=False)
s.section(PH(2)[0] - 0.1, cut - 1.6, A, 0.6, g=1.0)                                   # 2e DM : la pulsation arrive
d = 1.6; tt = np.arange(int(d*SR))/SR                                                   # montée : basse seule + bruit
s.put(s.mus, s.BP(s.noise(d), 600, 5000)*(tt/d)**2*0.06, cut - d)
for k in range(int(d/0.15)): s.put(s.mus, s.tri(mt(45), 0.13, 0.2), cut - d + k*0.15, 0.10)
B = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [55, 59, 62]]                           # Am G F G
s.section(PH(5)[0] - 0.05, at(104) - 0.3, B, 0.6, g=0.7, kicks=False)
C = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]          # C G Am F
lead = [[(76, 1), (79, 1), (84, 2)], [(83, 2), (79, 2)], [(81, 1), (84, 1), (88, 2)], [(84, 3), (81, 1)]]
s.section(at(104) - 0.05, PH(8)[0] - 0.1, C, 0.55, g=0.9, lead=lead)
s.pad(PH(8)[0] - 0.2, s.DUR, [57, 60, 64, 69], g=1.4)
for j, n in enumerate([72, 76, 79, 84]): s.put(s.mus, s.square(mt(n), 0.25, 0.5, 0.15), W(118) + 0.5 + j*0.11, 0.05)

# ─── bruitages ───
for k in (1, 2, 3, 5, 6, 7, 8): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
# 0 — le DM
s.ppop(0.05, 0.05); s.ping(at(5) + 0.05); s.ppop(at(12), hi=True)
s.put(s.fx, s.BP(s.noise(0.25), 800, 5000)*s.env(int(0.25*SR), 0.01, 0.08), at(12) + 0.12, 0.05)   # rature
# 1 — « supprime ta vidéo »
s.ping(PH(1)[0] - 0.1); s.typer(at(17)); s.stamp(at(19) + 0.1, 0.12); s.ppop(at(22)); s.typer(at(24), 5)
# 2 — 4 jours après, les excuses, le deal
for k in range(4): s.put(s.fx, s.square(880 if k < 3 else 1320, 0.07, 0.5, 0.04), at(27) + k*0.12, 0.03)
s.ping(at(30)); s.typer(at(32)); s.ppop(at(37), 0.06, True)
# 3 — la proposition
s.ppop(PH(3)[0] - 0.1); s.typer(at(39)); s.typer(at(44)); s.riseblips(at(44), 10, 500, 1.08, 0.1, 0.012)
s.typer(at(50)); s.riseblips(at(50), 10, 500, 1.08, 0.1, 0.012)
# 4 — TOUT EST FAUX
s.tapestop(cut); s.impact(W(57) - 0.03, 0.4); s.glitch(W(57) - 0.03, 0.45, 0.12); s.ppop(at(60))
# 5 — Zeigarnik
s.ping(PH(5)[0] - 0.1, 0.04); s.ppop(at(68), 0.06, True); s.ppop(at(70)); s.ppop(at(75)); s.click(at(78)); s.stamp(at(78) + 0.05, 0.06)
# 6 — la lettre
s.ppop(PH(6)[0] - 0.1); s.typer(PH(6)[0]); s.ppop(at(81))
for k in range(3): s.put(s.fx, s.square(500 - k*90, 0.2, 0.5, 0.15), at(81) + 0.4 + k*0.18, 0.025)        # zzz
s.put(s.fx, s.BP(s.noise(0.25), 800, 5000)*s.env(int(0.25*SR), 0.01, 0.08), at(85), 0.06)                # rature
s.typer(at(90)); s.riseblips(at(93), 10, 500, 1.1, 0.08, 0.016)
# 7 — MyMotiv
m = at(104)
s.chime(m, 0.05); s.ppop(m + 0.1)
for k in range(3): s.riseblips(m + 0.25 + k*0.22, 2, 880 + k*110, 1.25, 0.08, 0.025)
s.chime(at(105), 0.04, (1046.5, 1318.5, 1568)); s.ppop(at(108), 0.05, True)
# 8 — la fin
s.ppop(PH(8)[0]); s.ppop(at(113)); s.ppop(at(116), hi=True)

s.mix(mus_g=0.5, fx_g=1.5, amb_g=0.0, duck=0.5)
