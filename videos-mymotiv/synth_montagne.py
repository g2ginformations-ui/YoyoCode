# Son de « Comment faire une montagne de cash » (MontagneCash, ≈32 s) : tuto en mineur 8 bits, montée épique en majeur sur
# « tu empiles » et la montagne (fanfare, vent), puis tout se dégonfle sur « c'est une colline » (disque qui s'arrête +
# « wah-wah » triste), et majeur doux pour le CTA. Temps calés sur src/data/montagne-voix.json.
import sys
sys.path.insert(0, "tools")
from histoire_son import SR
from pixel_son import PixelSon

s = PixelSon("montagne", seed=131)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
mt = s.mtof
A = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]          # Am F Dm E (le tuto)
C = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]          # C G Am F (épique, puis CTA)
lead = [[(76, 1), (79, 1), (84, 2)], [(83, 2), (79, 2)], [(81, 1), (84, 1), (88, 2)], [(84, 3), (81, 1)]]
r0 = PH(6)[0]                                                                          # le recul : « c'est une colline »
s.section(0.05, at(61), A, 0.5, g=0.8)
s.section(at(61), r0 - 0.05, C, 0.42, g=1.0, lead=lead)                                # ça monte, ça monte…
s.tapestop(r0 + 0.3, 0.07)                                                             # … et ça se dégonfle
for j, (f, d) in enumerate([(392, 0.3), (370, 0.3), (349, 0.3), (330, 0.9)]):            # wah-wah triste
    s.put(s.mus, s.square(f, d, 0.5, d * 0.9), at(69) + j * 0.32, 0.05)
s.section(PH(7)[0] - 0.1, s.DUR - 1.2, C, 0.55, g=0.8)
s.pad(s.DUR - 1.6, s.DUR, [60, 64, 67, 72], g=1.1)
for j, n in enumerate([72, 76, 79, 84]): s.put(s.mus, s.square(mt(n), 0.25, 0.5, 0.15), W(86) + 0.4 + j * 0.11, 0.05)
for k in (1, 2, 3, 4, 7): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
# accroche : caisse enregistreuse
s.impact(0.02, 0.25); s.glitch(0.02, 0.15, 0.06); s.riseblips(0.05, 6, 1400, 1.08, 0.05, 0.03)
s.put(s.fx, s.BP(s.noise(0.12), 2000, 7000) * s.env(int(0.12 * SR), 0.001, 0.04), 0.3, 0.06); s.chime(0.35, 0.05, (2093, 2637, 3136))
# étapes
for k in (1, 2, 3, 4): s.ppop(PH(k)[0] - 0.1, 0.05, True)
s.ping(at(13), 0.03); s.click(at(16), 0.08); s.ppop(at(16), 0.05, True)                                   # postuler
s.ping(at(21), 0.03); s.typer(at(23), 8); s.chime(at(28) - 0.05, 0.045); s.ppop(at(31), 0.05, True)         # MyMotiv
s.stamp(at(36), 0.2); s.ppop(at(44), 0.05, True)                                                         # embauché ?
s.ping(at(50), 0.04); s.chime(at(50) + 0.08, 0.05, (2093, 2637, 3136))                                    # virement
c0, c1 = at(56), at(60)
for k in range(28): s.put(s.fx, s.square(1100 + 25 * k, 0.025, 0.5, 0.012), c0 + k * (c1 - c0) / 28, 0.018)   # le compteur
for k in range(36):                                                                                        # les billets tombent
    s.put(s.fx, s.BP(s.noise(0.05), 1500, 6000) * s.env(int(0.05 * SR), 0.001, 0.02), at(61) + k / 36 * 1.0, 0.025)
# la montagne : fanfare, vent, drapeau planté
s.impact(PH(5)[0], 0.22); s.riseblips(PH(5)[0], 8, 600, 1.12, 0.05, 0.03)
s.put(s.fx, s.BP(s.noise(2.6), 300, 1200) * s.env(int(2.6 * SR), 0.4, 1.2), PH(5)[0], 0.05)
s.stamp(at(67), 0.12); s.chime(at(67) + 0.1, 0.05, (1046.5, 1318.5, 1568, 2093))
# le recul par paliers
for j in range(3): s.ppop(r0 + j * 0.18, 0.05)
# CTA
s.ppop(PH(7)[0], 0.05, True); s.cta(at(81), at(84), at(74), at(77))
s.mix(mus_g=0.45, fx_g=1.5, amb_g=0.0, duck=0.5)
