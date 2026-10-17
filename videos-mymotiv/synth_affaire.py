# Son de « L'affaire de la lettre copiée-collée » (AffaireLettre) : ambiance true crime en 8 bits (PixelSon.pub : mineur
# tendu, creux pendant l'enquête, B sur l'empathie, majeur pour MyMotiv) + battements de cœur sur l'accroche, machine à
# écrire, « PAF », « SCHLAC », tampons. Temps calés sur src/data/affaire-voix.json.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon

s = PixelSon("affaire", seed=113)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
s.pub(PH(4)[0], PH(5)[0], PH(6)[0], W(171), beat=0.6)
for k in range(1, 8): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
# accroche : battements de cœur, date tapée à la machine, l'enveloppe part, « tout perdre »
for j in range(7): s.kick(0.1 + j*1.1, 0.14); s.kick(0.1 + j*1.1 + 0.22, 0.09)
s.glitch(0.02, 0.2, 0.08); s.typer(0.0, 6); s.typer(at(2), 5); s.ppop(at(3))
s.riseblips(at(4), 5, 900, 1.15, 0.08, 0.02); s.ping(at(4) + 0.6, 0.035)
s.impact(at(19), 0.3); s.glitch(at(19), 0.25, 0.06)
# le lendemain : la boîte mail, le clic, PAF
s.typer(PH(1)[0], 8); s.ppop(at(28))
for k in range(5): s.ppop(at(31) + k*0.08, 0.025)
s.click(at(39), 0.08); s.impact(at(43), 0.36); s.glitch(at(43), 0.3, 0.1); s.stamp(at(43), 0.18)
# la pièce à conviction
s.ppop(PH(2)[0]); s.typer(at(46), 10); s.paper(at(52), 0.07); s.ppop(at(54)); s.buzzer(at(61), 0.035)
# supprimé, SCHLAC
s.whoosh(at(63), "Court", 0.12); s.stamp(at(64), 0.22); s.glitch(at(64), 0.2, 0.08); s.ppop(at(65), 0.05, True)
# l'enquête : les suspects, le coupable
for i in (78, 85, 92): s.ppop(at(i), 0.05, True)
for i in (80, 87): s.typer(at(i), 8)
s.stamp(at(96), 0.24); s.impact(at(96), 0.2); s.buzzer(at(96) + 0.1, 0.03)
# l'empathie
s.ppop(PH(5)[0]); 
for j in range(4): s.ppop(at(104) + j*0.1, 0.03)
s.ping(at(112), 0.025); s.ppop(at(117), 0.05, True)
# MyMotiv, affaire classée
s.chime(at(129) - 0.05, 0.05); s.ppop(at(131))
for k, i in enumerate((133, 138, 140, 143)): s.riseblips(at(i), 2, 880 + k*90, 1.25, 0.08, 0.025)
s.stamp(at(146), 0.22); s.chime(at(146) + 0.1, 0.05, (1046.5, 1318.5, 1568, 2093))
# CTA
s.ppop(PH(7)[0], 0.05, True); s.cta(at(165), at(168), at(159), at(164))
s.mix(mus_g=0.42, fx_g=1.5, amb_g=0.0, duck=0.5)
