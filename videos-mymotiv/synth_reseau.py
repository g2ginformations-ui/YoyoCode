# Son de « Comment se faire un réseau (sans piston) » (Reseau, ≈44 s) : début en mineur 8 bits (seul, pas de tonton, la
# lettre copiée-collée qui casse le lien), bascule en majeur sur la bonne lettre (le lien devient rouge), mélodie qui monte
# quand l'anneau des 10 personnes s'allume (une note de plus à chaque arrivée), majeur doux pour MyMotiv et le CTA.
# Temps calés sur src/data/reseau-voix.json et src/Reseau.tsx.
import sys
sys.path.insert(0, "tools")
from histoire_son import SR
from pixel_son import PixelSon

s = PixelSon("reseau", seed=137)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
mt = s.mtof
A = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]          # Am F Dm E (seul, sans réseau)
C = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]          # C G Am F (le réseau se construit)
lead = [[(76, 1), (79, 1), (84, 2)], [(83, 2), (79, 2)], [(81, 1), (84, 1), (88, 2)], [(84, 3), (81, 1)]]

# mêmes instants que src/Reseau.tsx
VOL1, D1 = at(29), 0.5
VOL2, D2 = at(57) + 0.1, 0.5
VOLS, DV = [at(80) + j * 0.2 for j in range(9)], 0.35
VOL3, D3 = at(103) + 0.05, 0.45
r0 = at(99)

s.section(0.05, at(57) - 0.05, A, 0.5, g=0.75)
s.section(at(57), PH(6)[0] - 0.1, C, 0.5, g=0.85)
s.section(PH(6)[0] - 0.1, PH(8)[0] - 0.1, C, 0.45, g=1.0, lead=lead)
s.section(PH(8)[0] - 0.1, s.DUR - 1.2, C, 0.55, g=0.8)
s.pad(s.DUR - 1.6, s.DUR, [60, 64, 67, 72], g=1.1)
for j, n in enumerate([72, 76, 79, 84]): s.put(s.mus, s.square(mt(n), 0.25, 0.5, 0.15), W(154) + 0.4 + j * 0.11, 0.05)
for k in (2, 3, 4, 5, 6, 8, 9): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)

def envoi(a, d, g=0.02):                                    # l'enveloppe file : petits bips qui montent, puis « ping » à l'arrivée
    s.riseblips(a, 6, 900, 1.1, d / 7, g)
    s.ping(a + d, 0.03)

# accroche : seul, « RÉSEAU : 0 », tonton introuvable
s.impact(0.02, 0.22); s.glitch(0.02, 0.15, 0.06)
s.ppop(at(7), 0.05)
for j, (f, d) in enumerate([(392, 0.18), (330, 0.4)]): s.put(s.fx, s.square(f, d, 0.5, d * 0.9), at(9) + j * 0.2, 0.035)   # « bwoum » triste
s.ppop(PH(1)[0] - 0.1, 0.05, True); s.chime(at(18), 0.05); s.ppop(at(18), 0.05, True)                                    # ça se fabrique
# derrière l'offre, une personne ; ta candidature part
s.ppop(at(21), 0.05); s.ppop(at(26), 0.05, True)
envoi(VOL1, D1); s.ppop(at(33), 0.05, True)
# copié-collé : tampon, le lien casse, le recruteur s'endort
s.stamp(at(36), 0.2)
s.buzzer(at(41), 0.05); s.glitch(at(41), 0.15, 0.06)
for j in range(3): s.put(s.fx, s.square(mt(67 - 3 * j), 0.16, 0.5, 0.12), at(41) + 0.35 + j * 0.2, 0.02)                 # zzz
# la bonne lettre : elle s'écrit, elle part, le lien devient rouge
for i in (48, 51, 54): s.typer(at(i), 7)
envoi(VOL2, D2, 0.025); s.impact(VOL2 + D2, 0.18); s.chime(VOL2 + D2 + 0.05, 0.05, (1046.5, 1318.5, 1568))
s.ppop(at(64), 0.05, True)
# si c'est non
s.ping(at(70), 0.04); s.typer(at(71), 6)
s.ping(at(72), 0.03)
for i in (72, 73, 76): s.typer(at(i), 6)
# l'anneau : une note de plus à chaque personne
for j in range(10): s.ppop(PH(6)[0] - 0.15 + 0.04 * j, 0.02)
gamme = [72, 74, 76, 79, 81, 84, 86, 88, 91]
for j, a in enumerate(VOLS):
    s.put(s.fx, s.square(mt(gamme[j] - 12), 0.06, 0.5, 0.04), a, 0.015)
    s.put(s.fx, s.square(mt(gamme[j]), 0.14, 0.5, 0.1), a + DV, 0.035)
# le recul, puis « une lettre à la fois »
for j in range(3): s.ppop(r0 + j * 0.18, 0.04)
envoi(VOL3, D3, 0.025); s.chime(VOL3 + D3 + 0.05, 0.05, (1046.5, 1318.5, 1568, 2093))
# MyMotiv
s.chime(at(108) - 0.05, 0.045)
for i in (117, 123, 126, 130): s.ppop(at(i), 0.05, True)
# CTA
s.cta(at(149), at(152), at(132), at(144))
s.mix(mus_g=0.45, fx_g=1.5, amb_g=0.0, duck=0.5)
