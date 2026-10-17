# Bande-son de l'histoire Motiv n°1 « Change juste le nom » (src/HistoireNom.tsx) : voix (voix-nom.json) + ambiance de
# nuit + piano électrique feutré (fabriqué ici) qui s'arrête net après « ils passent à la suivante », repart plus lumineux
# quand Motiv projette le vrai site + bruitages (clavier, hologramme, noms qui défilent, glissement, chaise, carillon).
import sys; sys.path.insert(0, "tools")
from histoire_son import Son
s = Son("nom", seed=11); W, PH = s.W_, s.PH
nova, nom, partout, madame, suivante, lien, cv = W(15), W(21), W(27), W(44), W(61), W(69), W(75)
voila, identifie, end = W(76), W(113), PH(14)[1]
s.ambiance()
s.typing(0.05, 0.75, 0.05); s.pop(0.3, 600, 1300, 0.05)
A = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]          # La m7, Fa maj7, Do maj7, Sol 7
s.piano(0.0, suivante + 0.25, A, 0.83, 0.9)
s.pad(0.0, suivante + 0.6, [45, 52, 57], 0.8)
s.shimmer(PH(1)[0] + 0.6, 0.05)
s.blip(nova - 0.05, 1500, 0.05)
s.blip(nom - 0.05, 1100, 0.06); s.key(nom - 0.02, 0.07)
t = partout - 0.8
while t < partout + 0.9: s.key(t, 0.06); s.blip(t, 1700, 0.02); t += 0.22
s.whoosh(madame - 0.3, "Court", 0.08)
s.whoosh(suivante - 0.05, "MoyenClair", 0.14); s.paper(suivante - 0.1, 0.06)
s.creak(suivante + 0.35, 0.05)
B = [[53, 57, 60, 64], [55, 59, 62, 67], [52, 55, 59, 62], [57, 60, 64, 69]]          # Fa maj7, Sol, Mi m7, La m
s.piano(PH(10)[0] - 0.1, PH(14)[0] - 0.8, B, 0.62, 1.1)
s.pad(PH(10)[0] - 0.1, PH(14)[0] - 0.5, [53, 60, 64], 0.8)
a = PH(10)[1] + 0.15; gen0 = a + 1.6; letter0 = PH(11)[0] - 0.25
s.shimmer(a, 0.06); s.pop(a + 0.8, 600, 1300, 0.05); s.pop(gen0, 700, 1400, 0.05)
for i in range(16): s.key(gen0 + 0.1 + i*0.1, 0.035)
s.chime(letter0, 0.05)
s.whoosh(PH(14)[0] - 0.7, "MoyenClair", 0.12)
C = [[60, 64, 67, 72], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]          # Do, La m, Fa, Sol : plus léger
s.piano(PH(14)[0] - 0.6, s.DUR, C, 0.5, 0.9, arp=True)
s.pop(identifie - 0.1, 700, 1500, 0.07); s.chime(end + 0.25, 0.05, (1046.5, 1318.5, 1568, 2093))
s.mix(mus_g=0.5, fx_g=1.5, amb_g=1.0)
