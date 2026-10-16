# Son de « Combien de candidatures par jour ? » v2 (Frequence2, ≈49 s) : même fond que la v1 (piano électrique + beat
# léger loin sous la voix), un « pop » par étiquette et par chiffre compté, la musique qui se retient sur « chaque jour sans
# candidature » (aversion à la perte), un coup sec sur « JAMAIS PAREIL. » (la règle-ancre), petits blips pendant la démo,
# compteur de Léni, et la SIGNATURE SONORE MyMotiv (tools/pub_son.py) sur l'écran de fin, puis un rappel discret sur la
# règle répétée. Temps calés sur src/Frequence2.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, signature

s = PixelSon("frequence2", seed=719)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
T_FIN = at(148) - 0.1
B = 0.58
CH = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]   # Cmaj7 Am7 Fmaj7 G7
SOMBRE = [[57, 60, 64], [53, 57, 60]]                                              # Am F : la perte, le problème
s.piano(0.0, sc(3), CH, beat=B, g=0.85)
s.piano(sc(3), sc(5), SOMBRE, beat=B, g=0.7, arp=False)
s.piano(sc(5) + 0.4, s.DUR - 0.5, CH, beat=B, g=0.85)
t = 0.0; k = 0
while t < T_FIN:
    if not (sc(3) <= t < sc(5) + 0.4):
        if k % 2 == 0: s.kick(t, 0.08)
        s.hat(t + B / 2, 0.014)
    t += B; k += 1
s.pad(T_FIN - 0.2, s.DUR, [60, 64, 67, 72], g=1.1)
for a in (at(14) - 0.1, at(24) - 0.1, at(93) - 0.1, at(98) - 0.1): s.pop(a, 700, 1500, 0.04)
for i, n in enumerate((50, 54, 55, 56)): s.pop(at(n) - 0.05, 600 + 120 * i, 1300 + 120 * i, 0.04)
for i in range(3): s.pop(at(74) - 0.1 + i * 0.25, 420, 300, 0.04)
s.pop(at(106) - 0.1, 600, 1300, 0.04); claque(s, at(108) - 0.1, 1.0)
s.whoosh(sc(6), "MoyenSourd", 0.06); s.pop(sc(6) + 0.1, 600, 1400, 0.045)
for a in (at(120) - 0.1, at(125) - 0.1): s.click(a, 0.06)
s.ppop(at(130) - 0.1, 0.05, True); s.ppop(at(134) - 0.1, 0.04, True)
s.whoosh(sc(7), "Court", 0.05); s.riseblips(at(144) - 0.3, 8, 600, 1.1, 0.05, 0.012); s.chime(at(146) - 0.1, 0.035)
signature(s, T_FIN + 0.1, 0.05)
s.ppop(at(153) - 0.05, 0.05, True); s.pop(at(160) - 0.1, 700, 1500, 0.04)
claque(s, at(169) - 0.1, 0.6)
s.mix(mus_g=0.48, fx_g=1.4, amb_g=0.0, duck=0.5)
