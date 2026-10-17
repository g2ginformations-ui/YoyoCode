# Son de « J'ai un très gros problème » (Confession, 2 min 15) : comme la référence, une musique douce et un peu mélancolique
# sous la voix (piano électrique en la mineur, beat très léger), un « pop » à chaque icône, un grésillement quand un écran
# d'exemple s'allume ou s'éteint, la frappe de la demande à l'IA, un tampon sur « MÊME TEXTE » et « NON », puis la musique
# s'éclaire (do majeur) à « j'ai décidé de faire l'inverse », la frappe de « GO », la signature sonore MyMotiv à la fin.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import frappe, signature

s = PixelSon("confession", seed=1016)
W, PH = s.W_, s.PH
A = lambda i: W(i) - 0.1
sc = lambda i: PH(i)[0] - 0.15
B = 0.62
TRISTE = [[57, 60, 64, 67], [53, 57, 60, 64], [50, 53, 57, 60], [52, 56, 59, 62]]   # Am7 Fmaj7 Dm7 E
CLAIR = [[60, 64, 67, 71], [55, 59, 62, 65], [57, 60, 64, 67], [53, 57, 60, 64]]   # Cmaj7 G7 Am7 Fmaj7
s.piano(0.1, A(378), TRISTE, beat=B, g=0.8)
s.piano(A(378), s.DUR - 0.5, CLAIR, beat=B, g=0.85)
t = 0.1; k = 0
while t < s.DUR - 1.5:
    if not (sc(12) <= t < sc(13)):
        if k % 2 == 0: s.kick(t, 0.06)
        s.hat(t + B / 2, 0.011)
    t += B; k += 1
s.pad(sc(12), sc(13) + 0.3, [57, 64, 69], g=0.9)                                 # pour / contre : on respire
# icônes et étiquettes
for i in (0, 6, 7, 66, 79, 84, 94, 97, 103, 112, 132, 138, 166, 182, 184, 200, 205, 218, 236, 246, 252, 266, 286, 296, 301, 305, 312, 330, 336, 347, 349, 351, 368, 372, 392, 397, 404, 418, 430, 449, 452, 465, 472):
    s.ppop(A(i), 0.035, i % 2 == 0)
for k in range(5): s.pop(0.6 + k * 0.12, 500 + 90 * k, 1200, 0.03)
# les écrans
for a in (A(9) - 0.05, A(24) - 0.05, sc(2), A(386)): s.glitch(a, 0.2, 0.05)
for b in (sc(3) - 0.15, sc(16) - 0.15): s.glitch(b, 0.15, 0.04)
frappe(s, A(12), 22, 0.06, 0.03); s.riseblips(A(19), 8, 900, 1.08, 0.05, 0.012)
s.stamp(A(48), 0.16); s.stamp(A(358), 0.2); s.stamp(A(378), 0.2)
s.chime(A(286), 0.03); s.riseblips(A(312), 6, 700, 1.12, 0.05, 0.012)
s.chime(A(400), 0.035); s.chime(A(430), 0.04, (1046.5, 1318.5, 1568))
frappe(s, A(451), 2, 0.12, 0.05)
signature(s, PH(18)[1] + 0.3, 0.05)
s.mix(mus_g=0.45, fx_g=1.4, amb_g=0.0, duck=0.5)
