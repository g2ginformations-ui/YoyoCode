# Bande-son de l'histoire Motiv n°2 « Une heure du matin » (src/HistoireNuit.tsx) : voix (voix-nuit.json) + ambiance
# de nuit + piano électrique lent et mélancolique (fabriqué ici) qui se tait au refus, revient tendre avec Motiv,
# s'éclaire sur le vrai site, puis se pose quand il part dormir ; berceuse discrète pour le CTA final.
# Bruitages : clavier (phrase écrite, effacée, réécrite), téléphone qui vibre, hologramme, chaise, pas, carillon.
import sys; sys.path.insert(0, "tools")
from histoire_son import Son
s = Son("nuit", seed=17); W, PH = s.W_, s.PH
BUZZ = PH(4)[1] + 0.25; LEAVE = PH(12)[1] + 0.1; end = PH(14)[1]
s.ambiance()
s.typing(0.05, 1.25, 0.045); s.pop(0.3, 600, 1300, 0.04)
for t0, d in ((9.0, 0.7), (12.2, 0.5)):                                   # effacer (touche répétée)
    t = t0
    while t < t0 + d: s.key(t, 0.035); t += 0.05
s.typing(9.8, 11.0, 0.04); s.typing(12.8, 13.8, 0.04)
A = [[50, 57, 60, 65], [46, 53, 57, 62], [48, 55, 58, 64], [45, 52, 55, 60]]          # Ré m9, Si♭ maj7, Do 7sus, La m
s.piano(0.0, BUZZ - 0.1, A, 1.0, 0.85, arp=True)
s.pad(0.0, BUZZ + 0.5, [38, 45, 53], 0.9)
s.buzz(BUZZ, 2, 0.13); s.blip(BUZZ + 0.3, 900, 0.04)
s.pad(PH(5)[1] + 0.3, PH(9)[0], [41, 48, 53, 57], 1.0)                     # après le refus : nappe seule, puis Motiv
s.piano(PH(6)[0] - 0.2, PH(9)[0], [[53, 57, 60, 64], [50, 53, 57, 60]], 1.1, 0.7, arp=False)
B = [[53, 57, 60, 64], [48, 55, 60, 64], [45, 52, 57, 60], [50, 57, 62, 65]]          # Fa maj7, Do, La m, Ré m
s.piano(PH(9)[0] - 0.1, LEAVE + 1.2, B, 0.75, 1.0)
a = PH(9)[1] + 0.15; gen0 = a + 1.6; letter0 = PH(10)[0] - 0.25
s.shimmer(a, 0.06); s.pop(a + 0.8, 600, 1300, 0.05); s.pop(gen0, 700, 1400, 0.05)
for i in range(16): s.key(gen0 + 0.1 + i*0.1, 0.035)
s.chime(letter0, 0.045)
s.creak(LEAVE + 0.2, 0.05); s.steps(LEAVE + 1.4, 4, 0.06, 0.42); s.shimmer(LEAVE + 0.5, 0.025, up=False)
s.whoosh(PH(13)[0] - 0.6, "MoyenSourd", 0.1)
C = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]          # berceuse : Do maj7, La m7, Fa maj7, Sol 7
s.piano(PH(13)[0] - 0.4, s.DUR, C, 0.9, 0.75)
s.shimmer(PH(14)[0] - 0.2, 0.05); s.chime(end + 0.25, 0.045, (1046.5, 1318.5, 1568, 2093))
s.mix(mus_g=0.5, fx_g=1.5, amb_g=1.0)
