# Son de « Le vrai prix » (VraiPrix, ≈25 s) : piano feutré pendant la machine à sous (tic-tac des chiffres), le groove démarre
# sur « 0 € » (impact + carillon), « pop » des avantages cochés, compteurs des prix, deux clics sur l'interrupteur, la balance
# qui penche (« bonk »), fin. Temps calés sur src/VraiPrix.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon

s = PixelSon("vraiprix", seed=171)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
ZERO, FIN = at(12), at(52) + 0.05
CH = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]      # C G Am F
B = 0.5
s.piano(0.05, s.DUR - 0.8, CH, beat=B, g=0.8)
t = ZERO; k = 0
while t < s.DUR - 1.2:                                                          # grosse caisse et charleston après « 0 € »
    if k % 2 == 0: s.kick(t, 0.14)
    s.hat(t + B/2, 0.02); t += B; k += 1
s.pad(s.DUR - 2.0, s.DUR, [60, 64, 67, 72], g=1.2)

for i in range(int((ZERO - 0.1)/0.07)): s.click(0.05 + i*0.07, 0.035)          # la machine à sous
s.impact(ZERO, 0.22); s.chime(ZERO + 0.03, 0.05, (1568, 2093, 2637)); s.pop(at(14), 600, 1300, 0.05)
s.whoosh(sc(2) - 0.05, "MoyenSourd", 0.07)
for i in range(10): s.click(at(17) - 0.1 + i*0.09, 0.04)
for i in (21, 24, 26, 28): s.pop(at(i), 700, 1500, 0.04)
s.whoosh(sc(3) - 0.05, "Court", 0.07)
for i in range(10): s.click(at(30) - 0.1 + i*0.09, 0.04)
s.chime(at(30) + 0.5, 0.04)
for i in (35, 37, 38, 40): s.pop(at(i), 700, 1500, 0.04)
s.whoosh(sc(4) - 0.05, "MoyenSourd", 0.07)
c1, c2 = at(45) - 0.05, at(46) + 0.05
s.click(c1, 0.12); s.click(c2, 0.12); s.pop(c2 + 0.05, 1100, 500, 0.05)
s.whoosh(sc(5) - 0.05, "Court", 0.07)
s.put(s.fx, s.sweep(220, 90, 0.25)*s.env(int(0.25*48000), 0.002, 0.08), at(51) + 0.1, 0.25)       # la balance penche
s.impact(FIN, 0.22); s.chime(FIN + 0.05, 0.05)
s.pop(at(57), 600, 1300, 0.05)
s.mix(mus_g=0.32, fx_g=1.5, amb_g=0.0, duck=0.6)
