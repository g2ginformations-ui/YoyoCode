# Son de « La lettre en 3 blocs » (TroisBlocs, ≈41 s) : piano électrique et beat doux (un conseil qu'on écoute), « pop » sur
# chaque étiquette de bloc, frappe quand une phrase de la lettre s'écrit, trait rouge sur les mauvais exemples, point final,
# enveloppes du test, tampon « RECOMMENCE », coches MyMotiv, fin. Temps calés sur src/TroisBlocs.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, frappe, feutre

s = PixelSon("bloc", seed=303)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
S1, S2, S3, S4, S5, S6, S7 = (sc(i) for i in range(1, 8))
B = 0.6
CH = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]   # Cmaj7 Am7 Fmaj7 G7
s.piano(0.0, s.DUR - 0.6, CH, beat=B, g=0.9)
t = 0.0; k = 0
while t < s.DUR - 1.0:
    if k % 2 == 0: s.kick(t, 0.1)
    s.hat(t + B / 2, 0.018); t += B; k += 1
s.pad(s.DUR - 2.6, s.DUR, [60, 64, 67, 72], g=1.0)
claque(s, 0.02, 1.0); s.chime(0.3, 0.035)
s.pop(at(11) - 0.1, 700, 1500, 0.045)
for a in (S1 + 0.05, S3 + 0.05, S5 + 0.05): s.whoosh(a, "Court", 0.05); s.pop(a, 600, 1400, 0.05)
for a in (at(19) - 0.1, at(52) - 0.1, at(77) - 0.15): s.pop(a, 700, 1500, 0.035)
feutre(s, at(18) + 0.25, 0.3, 0.05); feutre(s, at(52) + 0.25, 0.3, 0.05)
s.pop(at(42) - 0.1, 600, 1300, 0.035); s.pop(at(47) - 0.1, 700, 1400, 0.035)
frappe(s, S2 + 0.25, 30, 0.043, 0.035); frappe(s, S4 + 0.1, 30, 0.043, 0.035); frappe(s, at(77) - 0.1, 26, 0.05, 0.035)
feutre(s, at(71) - 0.1, 0.3, 0.05)
claque(s, at(84) - 0.1, 0.8)
s.whoosh(S6, "MoyenSourd", 0.06); s.paper(S6 + 0.2, 0.05)
for i in range(3): s.pop(at(93) + i * 0.25, 500 + 100 * i, 1100, 0.04)
s.stamp(at(101) - 0.15, 0.2)
s.whoosh(S7, "MoyenSourd", 0.06)
for a in (at(104) - 0.15, at(108) - 0.1, at(108) + 0.05, at(109)): s.pop(a, 700, 1500, 0.04)
s.chime(at(114) - 0.1, 0.045)
s.chime(at(116) + 0.1, 0.05, (1046.5, 1318.5, 1568)); s.pop(at(121) - 0.05, 700, 1500, 0.045)
s.mix(mus_g=0.4, fx_g=1.4, amb_g=0.0, duck=0.55)
