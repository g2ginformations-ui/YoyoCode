# Son de « Le jeu du recruteur » (QuizRecruteur, ≈1 min 05) : musique 8 bits qui s'arrête sur chaque compte à rebours
# (tic-tac + 3 bips), « bonne réponse » sur la B, tampon + buzzer sur la A, fanfare sur « 3 sur 3 », creux sur « on
# retombe dans la A », majeur pour MyMotiv, fin commune. Temps calés sur src/data/duels-voix.json.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon

s = PixelSon("duels", seed=61)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
mt = s.mtof
A = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]          # Am F Dm E
B = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [55, 59, 62]]                           # Am G F G
C = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]          # C G Am F
lead = [[(76, 1), (79, 1), (84, 2)], [(83, 2), (79, 2)], [(81, 1), (84, 1), (88, 2)], [(84, 3), (81, 1)]]
cpt = [(PH(q)[1] + 0.05, PH(q + 1)[0] - 0.05) for q in (1, 3, 5)]                     # les 3 comptes à rebours

# ─── musique ───
debut = 0.05
for c0, c1 in cpt:
    s.section(debut, c0, A, 0.55, g=0.85)
    k, t = 0, c0
    while t < c1 - 0.05:                                                                 # tic-tac pendant qu'on choisit
        s.hat(t, 0.03)
        if k % 4 == 0: s.put(s.mus, s.tri(mt(33), 0.5, 0.4), t, 0.08)
        t += 0.25; k += 1
    debut = c1
s.section(debut, PH(8)[0] - 0.1, B, 0.55, g=0.8)
for k in range(int((PH(9)[0] - PH(8)[0])/0.55)):                                         # « on retombe dans la A »
    t = PH(8)[0] + k*0.55
    s.hat(t, 0.025)
    if k % 2 == 0: s.put(s.mus, s.tri(mt(33), 0.5, 0.4), t, 0.08)
s.section(PH(9)[0] - 0.1, s.DUR - 1.2, C, 0.55, g=0.85, lead=lead)
s.pad(s.DUR - 1.6, s.DUR, [60, 64, 67, 72], g=1.2)
for j, n in enumerate([72, 76, 79, 84]): s.put(s.mus, s.square(mt(n), 0.25, 0.5, 0.15), W(162) + 0.4 + j*0.11, 0.05)

# ─── bruitages ───
for k in (1, 3, 5, 7, 8, 9, 10): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
s.impact(0.02, 0.35); s.glitch(0.02, 0.2, 0.1); s.ppop(0.05, 0.05, True); s.ppop(at(10), 0.06, True); s.ppop(at(15))   # intro
duels = [(20, 22, 30, 40, 35), (49, 50, 56, 58, 64), (69, 70, 78, 85, 83)]                # cartes A, B, B gagne, A perd, règle
for (iA, iB, iG, iP, iR), (c0, c1) in zip(duels, cpt):
    s.ppop(at(iA)); s.ppop(at(iB), 0.05, True)
    for j in range(3): s.put(s.fx, s.square(880, 0.12, 0.5, 0.08), c0 + j*(c1 - c0)/3, 0.045)
    s.put(s.fx, s.square(1760, 0.3, 0.5, 0.2), c1 - 0.02, 0.035)
    s.put(s.fx, s.square(1046.5, 0.12, 0.5, 0.08), at(iG), 0.05); s.put(s.fx, s.square(1568, 0.3, 0.5, 0.2), at(iG) + 0.1, 0.05)
    s.stamp(at(iP), 0.2); s.buzzer(at(iP) + 0.05, 0.025); s.ppop(at(iR), 0.05)
s.riseblips(at(90), 8, 600, 1.12, 0.06, 0.03); s.ppop(at(93), 0.06, True); s.ppop(at(98))                               # 3/3 ?
s.ppop(at(102)); s.typer(at(109), 12); s.stamp(at(115), 0.22); s.glitch(at(115), 0.2, 0.08)                              # retour à la A
s.chime(PH(9)[0] - 0.05, 0.05); s.ppop(at(124))                                                                          # MyMotiv
for k, i in enumerate((126, 132, 138, 144)): s.riseblips(at(i), 2, 880 + k*90, 1.25, 0.08, 0.025)
s.cta(at(156), at(160), at(146), at(151))
s.mix(mus_g=0.45, fx_g=1.5, amb_g=0.0, duck=0.5)
