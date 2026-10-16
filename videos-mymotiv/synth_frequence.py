# Son de « Combien de candidatures par jour ? » (Frequence, ≈31 s) : comme la référence, une musique douce et régulière
# loin sous la voix (piano électrique + beat léger, sans bruitage pendant le face caméra), juste un petit « pop » sur chaque
# chiffre compté, un léger relief sur « la régularité, c'est la clé », un « pop » par étiquette MyMotiv et le carillon de
# l'offre. Temps calés sur src/Frequence.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon

s = PixelSon("frequence", seed=618)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
T_FIN = at(108) - 0.1
B = 0.58
CH = [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65]]   # Cmaj7 Am7 Fmaj7 G7
s.piano(0.0, s.DUR - 0.5, CH, beat=B, g=0.85)
t = 0.0; k = 0
while t < T_FIN:
    if k % 2 == 0: s.kick(t, 0.08)
    s.hat(t + B / 2, 0.014); t += B; k += 1
s.pad(T_FIN - 0.2, s.DUR, [60, 64, 67, 72], g=1.1)
for i, n in enumerate((43, 47, 48, 49)): s.pop(at(n) - 0.05, 600 + 120 * i, 1300 + 120 * i, 0.04)
s.chime(at(64) - 0.05, 0.025)                                        # « c'est la clé »
for a in (at(87) - 0.1, at(92) - 0.1, at(99) - 0.1): s.pop(a, 700, 1500, 0.04)
s.chime(T_FIN, 0.045, (1046.5, 1318.5, 1568)); s.ppop(at(112) - 0.05, 0.05, True)
s.mix(mus_g=0.48, fx_g=1.4, amb_g=0.0, duck=0.5)
