# Son de « Je donne la mission à MyMotiv » (DemoMission, ≈51 s), format « démo racontée » (styles/demo-racontee.md) :
# comme la référence, une musique douce mais bien présente (≈ 7-8 dB sous la voix, piano électrique + beat léger),
# un souffle sur le filé flou de l'accroche, frappe au clavier pendant la mission, petits « clics » quand le site change
# d'écran, « pop » sur chaque cadre rose, compteur 0:30, frappe du mot LETTRE, et la signature sonore MyMotiv sur la
# réponse en DM. Temps calés sur src/DemoMission.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import frappe, signature

s = PixelSon("mission", seed=820)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
S1 = sc(1)
B = 0.56
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [60, 64, 67, 71], [55, 59, 62, 65]]   # Am7 Fmaj7 Cmaj7 G7
s.pad(0.0, S1 + 0.2, [45, 52, 57, 60], g=1.0)                                   # l'accroche : nappe sombre
s.piano(S1 - 0.1, s.DUR - 0.4, CH, beat=B, g=0.9)
t = S1 - 0.1; k = 0
while t < s.DUR - 1.0:
    if k % 2 == 0: s.kick(t, 0.09)
    s.hat(t + B / 2, 0.016); t += B; k += 1
s.whoosh(at(17) - 0.05, "MoyenSourd", 0.08)
frappe(s, S1 + 0.3, 34, 0.07, 0.03)                                             # la mission s'écrit
s.pop(at(29) - 0.1, 500, 1200, 0.05)                                            # envoyée
for a in (at(29) + 0.35, sc(2) + 0.05, at(39) - 0.1, at(46) - 0.1, sc(3), at(55) - 0.1, sc(4), sc(6), at(103) - 0.1, sc(8), at(162) - 0.1):
    s.click(a, 0.05)
for a in (at(46) - 0.1, at(55) - 0.1, at(60) - 0.1, at(70) - 0.1, at(79) - 0.1, at(105) - 0.1, at(127) - 0.1, at(132) - 0.1, at(148) - 0.1, at(166) - 0.1):
    s.ppop(a, 0.04, True)
s.whoosh(at(70) - 0.15, "Court", 0.05); s.whoosh(sc(5) - 0.05, "Court", 0.05); s.whoosh(sc(7) - 0.05, "Court", 0.05)
s.chime(at(134) - 0.1, 0.035)
s.riseblips(at(159) - 0.1, 8, 700, 1.1, 0.09, 0.012)
s.ppop(at(179) - 0.1, 0.05, True)
frappe(s, at(186) - 0.1, 6, 0.08, 0.04)
signature(s, at(191) - 0.1, 0.05)
s.mix(mus_g=0.62, fx_g=1.4, amb_g=0.0, duck=0.45)
