# Son de « Ton matcha est mieux préparé que ta lettre » (Matcha, ≈42 s) : lo-fi jazzy de coffee shop (piano électrique
# Fmaj7 Em7 Dm7 Cmaj7, grosse caisse douce, balais) sur un fond de café (brouhaha très bas, tasses qui tintent) ; bruitages
# du matcha (fouet en bambou, lait qui coule, mousse), du café filtre (verse, tapis), du marqueur sur le gobelet, du tampon,
# de la craie, de l'imprimante à tickets, de la sonnette du comptoir ; fin. Temps calés sur src/Matcha.tsx.
import sys
import numpy as np
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, feutre
from histoire_son import SR

s = PixelSon("matcha", seed=909)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
S1, S2, S3, S4, S5, S6, S7, S8 = (sc(i) for i in range(1, 9))
T_LAIT, T_MOUSSE, T_ECRIT, T_SERVIE, T_TEAM = at(19) - 0.1, at(24) - 0.1, at(45) - 0.05, at(83) - 0.15, at(117) - 0.1

B = 0.66                                                                        # ≈ 91 bpm, lo-fi
CH = [[53, 57, 60, 64], [52, 55, 59, 62], [50, 53, 57, 60], [48, 52, 55, 59]]   # Fmaj7 Em7 Dm7 Cmaj7
s.piano(0.0, s.DUR - 0.5, CH, beat=B, g=0.95)
t = 0.0; k = 0
while t < s.DUR - 1.0:
    if k % 4 in (0, 2): s.kick(t, 0.09)
    s.put(s.mus, s.BP(s.noise(0.09), 2500, 9000) * s.env(int(0.09 * SR), 0.004, 0.04), t + B / 2, 0.022)   # balais
    if k % 4 in (1, 3): s.put(s.mus, s.BP(s.noise(0.18), 1200, 6000) * s.env(int(0.18 * SR), 0.01, 0.07), t, 0.03)
    t += B; k += 1
s.pad(s.DUR - 3.0, s.DUR, [53, 60, 64, 69], g=1.1)

# fond de café : brouhaha très bas + tasses qui tintent de temps en temps
d = s.DUR
bruit = s.BP(s.noise(d), 250, 1800) * (0.7 + 0.3 * np.sin(np.arange(int(d * SR)) / SR * 0.7))
s.put(s.amb, bruit * 0.012, 0, 1.0, -0.2); s.put(s.amb, s.BP(s.noise(d), 300, 2200) * 0.01, 0, 1.0, 0.25)
for a in np.arange(1.3, d - 1, 3.1):
    s.put(s.amb, s.tone(2600 + s.rng.uniform(-300, 300), 0.5, 0.001, 0.12) * 0.5 + s.tone(4100, 0.5, 0.001, 0.08) * 0.3, a + s.rng.uniform(0, 1.2), 0.012, s.rng.uniform(-0.6, 0.6))

def fouet(t0, t1, g=0.05):                                                      # fouet en bambou dans le bol
    x = t0
    while x < t1:
        s.put(s.fx, s.BP(s.noise(0.06), 1800, 7000) * s.env(int(0.06 * SR), 0.003, 0.025), x, g, s.rng.uniform(-0.2, 0.2)); x += 0.072
def verse(t0, dd, g=0.06, lo=300, hi=1500):                                      # liquide qui coule
    n = int(dd * SR); y = s.BP(s.noise(dd), lo, hi) * (0.7 + 0.3 * np.sin(np.arange(n) / SR * 2 * np.pi * 9)) * np.sin(np.linspace(0, np.pi, n)) ** 0.5
    s.put(s.fx, y, t0, g)

# accroche + matcha
claque(s, 0.02, 1.0); s.chime(0.25, 0.03, (1318.5, 1760, 2093))
fouet(S1 + 0.1, T_LAIT - 0.2, 0.05)
for a in (at(13) - 0.1, T_LAIT, T_MOUSSE): s.pop(a, 700, 1500, 0.04)
verse(T_LAIT + 0.1, 0.9, 0.07)
for j in range(8): s.put(s.fx, s.tone(1400 + 300 * j, 0.06, 0.001, 0.02), T_MOUSSE + j * 0.07, 0.012)   # bulles de mousse
# café filtre
for a in (S2, S3, S4, S5, T_SERVIE, S6, S7, S8, T_TEAM): s.whoosh(a, "MoyenSourd", 0.06)
verse(S2 + 0.1, 1.4, 0.05, 200, 900)
x = S2
while x < S3 - 0.2: s.click(x, 0.02); x += 0.25                               # tapis roulant
claque(s, at(40) - 0.2, 1.0); s.put(s.fx, s.sweep(500, 220, 0.4) * s.env(int(0.4 * SR), 0.01, 0.2), at(40) - 0.15, 0.05)   # « tiède »
# prénom de travers
feutre(s, T_ECRIT, 0.7, 0.06); s.pop(at(46) - 0.1, 700, 1400, 0.04); s.buzzer(at(50) - 0.05, 0.03)
# autre entreprise
s.paper(S4 + 0.2, 0.05); s.put(s.fx, s.sweep(500, 900, 0.3) * s.env(int(0.3 * SR), 0.01, 0.12), at(63) - 0.15, 0.04)
s.stamp(at(64) - 0.1, 0.2)
# MyMotiv : craie, chrono, la lettre servie
for a in (at(68) - 0.1, at(73) - 0.1, at(75) - 0.1, at(79) - 0.1):
    for j in range(6): s.put(s.fx, s.BP(s.noise(0.05), 2500, 8000) * s.env(int(0.05 * SR), 0.004, 0.02), a + j * 0.07, 0.03)   # craie
s.chime(T_SERVIE, 0.05); s.paper(T_SERVIE, 0.04)
for a in (at(85) - 0.1, at(88) - 0.1, at(92) - 0.15): s.pop(a, 700, 1500, 0.045)
# le barista : imprimante à tickets, sonnette du comptoir, gobelet qui glisse
for j in range(int(0.95 / 0.035)): s.click(S6 + 0.05 + j * 0.035, 0.025)
s.put(s.fx, s.tone(2349, 1.2, 0.001, 0.5) + 0.5 * s.tone(3520, 1.2, 0.001, 0.3), at(98) - 0.15, 0.05)   # « ding »
verse(at(99) - 0.4, 0.45, 0.04, 400, 2500); s.chime(at(99) + 0.05, 0.035, (1568, 2093, 2637))
# l'offre
claque(s, at(104) - 0.15, 1.2); s.chime(at(104), 0.04, (1568, 2093, 2637)); claque(s, at(107), 1.0); s.pop(at(109) - 0.15, 600, 1300, 0.05)
# fin
s.chime(S8 + 0.2, 0.05, (1046.5, 1318.5, 1568)); s.pop(at(114) - 0.05, 700, 1500, 0.045)
s.pop(at(122) - 0.1, 500, 1000, 0.05); s.pop(at(125) - 0.1, 600, 1200, 0.05); s.pop(at(126) - 0.1, 700, 1500, 0.045)
s.mix(mus_g=0.42, fx_g=1.4, amb_g=1.0, duck=0.55)
