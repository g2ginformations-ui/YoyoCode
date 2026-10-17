# Son de « T'es lequel des 4 ? » (TesLequel) : musique type des pubs pixel (PixelSon.pub) + bruitages calés sur
# src/data/lequel-voix.json (écran de sélection, jauges qui se remplissent, tractions, sonnerie du téléphone, CTA).
import sys
sys.path.insert(0, "tools")
from histoire_son import SR
from pixel_son import PixelSon

s = PixelSon("lequel", seed=83)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
s.pub(PH(4)[0], at(126), at(131), W(181), beat=0.5)
for k in range(1, 8): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
# écran de sélection : les 4 cases, le curseur qui passe de l'une à l'autre, tous allumés sur « quatre »
for j in range(4): s.ppop(0.02 + j*0.1, 0.05, j % 2 == 1)
k = 1
while (k*0.32 - 0.2) < at(13):
    s.click(k*0.32 - 0.2, 0.05); k += 1
s.impact(at(6), 0.12); s.ppop(at(6), 0.05, True)
s.chime(at(13), 0.05, (1046.5, 1318.5, 1568)); s.riseblips(at(13), 6, 880, 1.12, 0.05, 0.025)
# chaque fiche : « sélection » + jauges
for k in range(1, 5): s.riseblips(PH(k)[0] - 0.05, 4, 880, 1.26, 0.05, 0.03); s.ppop(PH(k)[0] + 0.05, 0.05, True)
def jauge(t, n=5, f0=700): s.ping(t, 0.025); s.riseblips(t + 0.02, n, f0, 1.1, 0.06, 0.018)
for i in (20, 24, 33, 63, 66, 81, 83): jauge(at(i))
s.riseblips(at(41), 8, 900, 1.1, 0.04, 0.025); s.impact(at(43), 0.16); s.chime(at(43), 0.04, (1318.5, 1568, 2093))       # potentiel MAX
for j in range(6): s.put(s.fx, s.square(1200 + 90*(j % 3), 0.04, 0.5, 0.02), at(55) + j*0.9, 0.02)               # candidatures en boucle
s.buzzer(at(70), 0.035)                                                                                           # sur ton CV : ???
s.glitch(at(92), 0.4, 0.05); s.stamp(at(100), 0.14); s.chime(at(100) + 0.05, 0.04, (1046.5, 1318.5, 1568))       # décousu → ta force
# la cellule : une traction toutes les 0,7 s jusqu'au téléphone, puis la sonnerie
a, arret = PH(4)[0], at(119)
r = 1
while a + r*0.7 < arret:
    s.put(s.fx, s.square(520, 0.06, 0.5, 0.03), a + (r - 0.5)*0.7, 0.03); s.ppop(a + r*0.7, 0.04); r += 1
s.ping(at(114), 0.03)
for j in range(10): s.put(s.fx, s.square(1320 if j % 2 else 1660, 0.07, 0.5, 0.05), arret + j*0.08, 0.03)
s.riseblips(at(122), 5, 600, 1.12, 0.08, 0.02)
# MyMotiv
s.ppop(at(130), 0.05, True); s.chime(at(131) - 0.05, 0.05); s.ppop(at(136))
for k, i in enumerate((137, 142, 147)): s.riseblips(at(i), 2, 880 + k*110, 1.25, 0.08, 0.025)
s.ppop(at(151), 0.05, True)
# CTA puis la chute
s.cta(at(168), at(171), at(156), at(159)); s.riseblips(at(163), 4, 1200, 1.1, 0.05, 0.02)
s.ppop(PH(7)[0], 0.05); s.buzzer(at(179), 0.04); s.stamp(at(179) + 0.05, 0.1)
s.mix(mus_g=0.45, fx_g=1.5, amb_g=0.0, duck=0.5)
