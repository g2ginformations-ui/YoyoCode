# Son de « Mon CV, niveau par niveau » (MonCV) : musique type des pubs pixel (PixelSon.pub : quête en mineur, creux pendant
# les recommandations, B sur « l'autre côté du bureau », majeur pour MyMotiv) + bruitages de jeu de rôle calés sur
# src/data/cv-voix.json (tractions, « level up », téléphone, compteur, tampon, rature).
import sys
sys.path.insert(0, "tools")
from histoire_son import SR
from pixel_son import PixelSon

s = PixelSon("cv", seed=97)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
s.pub(PH(5)[0], PH(7)[0], PH(8)[0], W(244), beat=0.5)
for k in (1, 2, 3, 4, 5, 7, 8, 9): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
# accroche : titre, logo, Yann qui fait des tractions
s.impact(0.02, 0.22); s.ppop(0.02, 0.05); s.ppop(0.12, 0.05, True)
s.ppop(at(5), 0.05, True)
r = 1
while at(5) + r*0.7 < PH(1)[0] - 0.2:
    s.put(s.fx, s.square(520, 0.06, 0.5, 0.03), at(5) + (r - 0.5)*0.7, 0.025); r += 1
s.ppop(at(8), 0.05)
# « level up » à chaque niveau
def level(t): s.riseblips(t, 6, 660, 1.15, 0.05, 0.03); s.chime(t + 0.3, 0.04, (1046.5, 1318.5, 1568, 2093)); s.ppop(t, 0.05, True)
for k in (1, 2, 3): level(PH(k)[0] - 0.1)
def jauge(t, n=5, f0=700): s.ping(t, 0.025); s.riseblips(t + 0.02, n, f0, 1.1, 0.06, 0.018)
# niveau 1
s.ping(at(26), 0.03)
for i in (26, 31, 37): s.typer(at(i))
s.ping(at(41), 0.03)
for i in (43, 44, 46): jauge(at(i))
# niveau 2 : le téléphone sonne, puis le succès
s.ping(at(58), 0.03)
j = 0
while at(58) + j*0.16 < at(65):
    s.put(s.fx, s.square(1320 if j % 2 else 1660, 0.07, 0.5, 0.05), at(58) + j*0.16, 0.018); j += 1
for i in (60, 65): s.typer(at(i))
s.impact(at(68), 0.14); s.chime(at(68) + 0.05, 0.05, (1318.5, 1568, 2093)); s.ppop(at(71), 0.05, True)
# niveau 3
s.ppop(at(82)); s.ppop(at(89), 0.05, True); s.riseblips(at(89), 4, 1200, 1.12, 0.04, 0.02); s.ping(at(93), 0.03)
for i in (98, 101, 104, 109): s.typer(at(i))
# bilan : compteur, puis les chiffres
for k in range(10): s.put(s.fx, s.square(1100 + 70*k, 0.03, 0.5, 0.015), at(113) + k*0.08, 0.02)
s.impact(at(113) + 0.8, 0.12); s.ppop(at(114)); s.stamp(at(118), 0.1); s.riseblips(at(123), 6, 800, 1.12, 0.05, 0.022); s.ppop(at(128), 0.05, True)
# recommandations
s.ppop(PH(5)[0]); s.ping(at(140), 0.03); s.typer(at(144), 14); s.ping(at(155), 0.03); s.typer(at(160), 10)
s.ppop(at(165), 0.05, True); s.stamp(at(168), 0.16); s.chime(at(168) + 0.08, 0.05, (1046.5, 1318.5, 1568))
# l'autre côté du bureau
s.ppop(PH(7)[0]); s.ppop(at(184), 0.05, True); s.ping(at(185), 0.03)
for i in (188, 193): s.typer(at(i))
s.ppop(at(196)); s.buzzer(at(197), 0.03)
# MyMotiv
s.chime(at(207) - 0.05, 0.05); s.ppop(at(209))
for k, i in enumerate((211, 215, 220)): s.riseblips(at(i), 2, 880 + k*110, 1.25, 0.08, 0.025)
s.ppop(at(223), 0.05, True)
# CTA
s.cta(at(239), at(242), at(231), at(235))
s.mix(mus_g=0.42, fx_g=1.5, amb_g=0.0, duck=0.5)
