# Son de « Zéro excuse » (ZeroExcuse, ≈29 s) : nappe sombre sur l'accroche, puis le groove (grosse caisse, basse, charleston)
# démarre quand la 1re excuse est démontée ; feutre sur chaque excuse barrée, impact + carillon à chaque carte retournée,
# compteur du chrono, « pop » des mots-clés, clic sur « Tu valides », compteurs du témoignage, fin à bulles.
# Temps calés sur src/ZeroExcuse.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import feutre

s = PixelSon("zeroexcuse", seed=161)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
BARRE = [at(14) - 0.05, at(23) - 0.05, at(38) - 0.05, at(51) - 0.05]
FLIP = [b + 0.25 for b in BARRE]
FIN = at(69) + 0.3
CH = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 52, 55, 60], [55, 59, 62, 67]]     # Am F C G
B = 0.55
t = 0.05; k = 0
while t < s.DUR - 1.5:                                                           # nappe, un accord par mesure
    s.pad(t, t + 4*B + 0.6, CH[k % 4], g=1.1); t += 4*B; k += 1
s.section(FLIP[0] + 0.2, FIN - 0.15, [[c[0] - 12] + c for c in CH], B, g=0.9, arp=False)
s.section(FIN, s.DUR - 1.2, [[c[0] - 12] + c for c in CH], B, g=0.75, arp=False)
s.pad(s.DUR - 2.0, s.DUR, [57, 64, 69, 72], g=1.4)

s.impact(0.02, 0.18); s.whoosh(0.0, "Court", 0.06)
for i in range(4): s.pop(0.25 + i*0.12 if i else 0.0, 400 + i*80, 1000 + i*100, 0.05, (i - 1.5)*0.3)
for k in range(1, 5): s.whoosh(sc(k) - 0.05, "MoyenSourd" if k % 2 else "Court", 0.07)
for b, f in zip(BARRE, FLIP):
    feutre(s, b, 0.25, 0.06)
    s.whoosh(f - 0.05, "Court", 0.05); s.impact(f + 0.15, 0.12); s.chime(f + 0.2, 0.04)
for i in range(8): s.click(FLIP[0] + 0.15 + i*0.07, 0.05)                                  # 0 → 30 s*
for i in range(3): s.pop(at(28) + i*0.15, 700, 1500, 0.045)                               # mots-clés
s.pop(at(39), 500, 1100, 0.04); feutre(s, at(39) + 0.25, 0.25, 0.035)
s.pop(at(42), 600, 1300, 0.05); s.click(at(47), 0.12)                                      # « Tu valides ✓ »
s.pop(at(56), 700, 1500, 0.05)
s.whoosh(sc(5) - 0.05, "MoyenSourd", 0.07)
for i in range(11): s.click(at(64) + i*0.055, 0.045)
for i in range(7): s.click(at(66) + i*0.07, 0.05)
s.chime(at(66) + 0.5, 0.05, (1568, 2093, 2637))
s.whoosh(sc(6) - 0.1, "MoyenSourd", 0.07)
s.impact(FIN, 0.25); s.chime(FIN + 0.05, 0.05)
for i in range(8): s.pop(FIN + i*0.04, 300 + i*60, 700 + i*90, 0.03)
s.pop(at(72), 600, 1300, 0.05)
s.mix(mus_g=0.32, fx_g=1.5, amb_g=0.0, duck=0.6)
