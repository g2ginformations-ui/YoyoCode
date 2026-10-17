# Son de « Suis ton instinct » (Instinct, ≈57 s) : musique 8 bits qui s'arrête sur chaque compte à rebours (tic-tac + 3 bips),
# « bon choix » à chaque réponse, majeur dès MyMotiv, creux doux sur la révélation (« ce parcours, c'est le mien »), majeur
# avec mélodie pour le CTA. Temps calés sur src/data/instinct-voix.json.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon

s = PixelSon("instinct", seed=29)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
mt = s.mtof
A = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]          # Am F Dm E
C = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]          # C G Am F
lead = [[(76, 1), (79, 1), (84, 2)], [(83, 2), (79, 2)], [(81, 1), (84, 1), (88, 2)], [(84, 3), (81, 1)]]
cpt = [(PH(q)[1] + 0.05, PH(q + 1)[0] - 0.05) for q in (1, 3, 5)]                     # les 3 comptes à rebours

# ─── musique ───
debut = 0.05
for c0, c1 in cpt:
    s.section(debut, c0, A, 0.5, g=0.85)
    k, t = 0, c0
    while t < c1 - 0.05:                                                                 # tic-tac pendant qu'on choisit
        s.hat(t, 0.03)
        if k % 4 == 0: s.put(s.mus, s.tri(mt(33), 0.5, 0.4), t, 0.08)
        t += 0.25; k += 1
    debut = c1
s.section(debut, PH(7)[0] - 0.1, C, 0.5, g=0.8)                                          # « cet outil, c'est MyMotiv »
for k in range(int((PH(8)[0] - PH(7)[0])/0.5)):                                          # révélation : creux doux
    t = PH(7)[0] + k*0.5
    s.hat(t, 0.02)
    if k % 2 == 0: s.put(s.mus, s.tri(mt(36), 0.5, 0.5), t, 0.07)
s.pad(PH(7)[0], PH(8)[0], [48, 55, 60, 64], g=0.7)
s.section(PH(8)[0] - 0.1, s.DUR - 1.2, C, 0.5, g=0.85, lead=lead)
s.pad(s.DUR - 1.6, s.DUR, [60, 64, 67, 72], g=1.2)
for j, n in enumerate([72, 76, 79, 84]): s.put(s.mus, s.square(mt(n), 0.25, 0.5, 0.15), W(147) + 0.4 + j*0.11, 0.05)

# ─── bruitages ───
for k in (1, 3, 5, 7, 8): s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)
s.impact(0.02, 0.32); s.glitch(0.02, 0.2, 0.1); s.ppop(0.05, 0.05, True); s.ppop(0.15, 0.05)                         # accroche
s.ppop(at(4)); s.ppop(at(6), 0.05, True); s.impact(at(8), 0.18); s.riseblips(at(8), 6, 800, 1.15, 0.04, 0.03)         # « Go »
defis = [(11, 21, 32, 35), (44, 50, 65, 67), (74, 83, 97, 102)]                        # carte A, carte B, choix, résultat
for (iA, iB, iC, iR), (c0, c1) in zip(defis, cpt):
    s.ppop(PH(1)[0] if iA == 11 else at(iA) - 0.6, 0.04)
    s.ppop(at(iA)); s.ppop(at(iB), 0.05, True)
    for j in range(3): s.put(s.fx, s.square(880, 0.12, 0.5, 0.08), c0 + j*(c1 - c0)/3, 0.045)
    s.put(s.fx, s.square(1760, 0.3, 0.5, 0.2), c1 - 0.02, 0.035)
    s.put(s.fx, s.square(1046.5, 0.12, 0.5, 0.08), at(iC), 0.05); s.put(s.fx, s.square(1568, 0.3, 0.5, 0.2), at(iC) + 0.1, 0.05)
    s.riseblips(at(iR), 6, 900, 1.12, 0.05, 0.022)
s.chime(at(102) - 0.05, 0.05)                                                                                           # MyMotiv
s.glitch(at(105), 0.25, 0.07); s.riseblips(at(105), 8, 500, 1.12, 0.085, 0.02)                                          # la photo se charge
s.stamp(at(112), 0.12); s.chime(at(115), 0.045, (1046.5, 1318.5, 1568, 2093))                                           # 24 ans, objectif
s.cta(at(142), at(145), at(127), at(135))
s.mix(mus_g=0.45, fx_g=1.5, amb_g=0.0, duck=0.5)
