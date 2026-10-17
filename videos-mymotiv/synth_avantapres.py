# Son de « Avant / Après » (AvantApres, ≈22 s) : musique de l'utilisateur étouffée sur la lettre générique, grande ouverte
# quand la carte se retourne (ses percussions tombent dessus) ; feutre sur chaque formule creuse puis sur chaque preuve,
# petits « pop » de la grille, frappe du lien, clic d'envoi, impact + carillon au retournement, fin. Temps : src/AvantApres.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import feutre, frappe, musique_utilisateur

s = PixelSon("avantapres", seed=151)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
FLIP, FIN = sc(3) + 0.12, sc(5) + 0.05
musique_utilisateur(s, FLIP)
s.whoosh(0.0, "Court", 0.06); s.pop(0.15, 300, 800, 0.06)
for i in (7, 8, 9): feutre(s, at(i))
for i in range(8): s.pop(at(16) + i*0.04, 500 + i*50, 1100 + i*80, 0.03, (i % 3 - 1)*0.4)
s.whoosh(sc(2) - 0.05, "MoyenSourd", 0.06)
s.pop(at(21), 400, 1000, 0.06)
s.pop(at(23), 500, 1100, 0.05); frappe(s, at(24), 36, 0.017, 0.035)
s.click(10.3, 0.12); s.pop(10.3, 600, 1300, 0.05); s.whoosh(10.4, "Court", 0.07)
s.impact(FLIP, 0.25); s.chime(FLIP + 0.03, 0.05)
for a in (at(39), at(39) + 0.15, at(43), at(46)): feutre(s, a, 0.3, 0.035)
for a in (at(39), at(43), at(46)): s.pop(a, 700, 1500, 0.045)
for i in range(10): s.click(sc(4) + 0.15 + i*0.09, 0.05)
s.chime(sc(4) + 1.05, 0.04, (1568, 2093, 2637))
s.whoosh(FIN - 0.15, "MoyenSourd", 0.07); s.pop(FIN, 300, 900, 0.07); s.chime(FIN + 0.25, 0.05)
s.pop(at(56), 600, 1300, 0.05)
s.mix(mus_g=0.3, fx_g=1.5, amb_g=0.0, duck=0.6)
