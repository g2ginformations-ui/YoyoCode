# Son de « Impact » (≈44 s), d'après la mesure de la pub de référence (styles/impact-ralenti.md) : 0-7 s un souffle aigu
# de ralenti qui monte (bruit filtré qui glisse vers l'aigu + grave qui enfle), petit tic à chaque demi-seconde, coupe
# sèche à 7 s ; ambiance calme sous la voix ; blips numériques sur le fil de fer ; la musique gonfle avec le téléphone
# et le vrai site ; SILENCE avant le choc, montée, impact (grave + éclats de papier) ; signature sonore MyMotiv sur le
# point du logo ; nappe claire et petits « pop » sur l'offre. Temps calés sur src/Impact.tsx.
import sys
import numpy as np
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from histoire_son import SR
from pub_son import claque, signature

s = PixelSon("impact", seed=921)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
T_VOIX = 7.0
T_FIL, T_TEL, T_SITE = at(10) - 0.15, sc(3) - 0.1, at(33) - 0.15
T_RETOUR = PH(4)[1] - 0.15; T_GRAND = T_RETOUR + 0.25; T_CHOC = T_GRAND + 0.6; T_LOGO = T_CHOC + 0.95
T_OFFRE, T_CENTIME, T_APPEL = sc(6), at(65) - 0.1, sc(7)

# ─── 0-7 s : le ralenti ───
n = int(T_VOIX * SR); tt = np.arange(n) / SR
souffle = np.zeros(n)
x = s.noise(T_VOIX)
for k, (lo, hi) in enumerate([(1800, 3200), (2600, 4400), (3600, 6000)]):
    a, b = int(k * n / 3), int((k + 1) * n / 3)
    souffle[a:b] = s.BP(x, lo, hi)[a:b]
env = (0.15 + 0.85 * (tt / T_VOIX) ** 2) * np.minimum(1, (T_VOIX - tt) / 0.04)
grave = (np.sin(2 * np.pi * 55 * tt) + 0.6 * np.sin(2 * np.pi * 82.4 * tt)) * (tt / T_VOIX) ** 3 * np.minimum(1, (T_VOIX - tt) / 0.04)
s.put(s.fx, souffle * env * 0.5 + grave * 0.5, 0.0, 0.12)
for k in range(14): s.click(k * 0.5, 0.03)

# ─── 7-16 s : calme, puis le fil de fer ───
s.pad(T_VOIX + 0.1, T_TEL + 0.3, [57, 64, 69, 71], g=0.7)
s.glitch(T_FIL, 0.25, 0.05); s.riseblips(T_FIL + 0.2, 6, 900, 1.08, 0.05, 0.01)
s.whoosh(sc(2), "Court", 0.04)

# ─── 16-26 s : le téléphone, le vrai site, la musique gonfle ───
s.whoosh(T_TEL, "MoyenSourd", 0.06)
B = 0.5
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [60, 64, 67, 71], [55, 59, 62, 65]]
s.piano(T_TEL + 0.2, T_RETOUR - 0.15, CH, beat=B, g=0.9)
t = T_SITE; k = 0
while t < T_RETOUR - 0.15:
    s.kick(t, 0.11); s.hat(t + B / 2, 0.02); t += B; k += 1
for a in (T_SITE, at(45) - 0.15, at(49) - 0.1): s.click(a, 0.05)
s.ppop(at(46), 0.04, True); s.ppop(at(50) - 0.1, 0.04, True)

# ─── le choc ───
m = int(0.6 * SR); up = s.BP(s.noise(0.6), 800, 7000) * np.linspace(0, 1, m) ** 2
s.put(s.fx, up, T_CHOC - 0.6, 0.07)
s.impact(T_CHOC, 0.45); claque(s, T_CHOC, 1.2)
for k in range(6): s.paper(T_CHOC + 0.05 + k * 0.08, 0.05)
signature(s, T_LOGO, 0.06)

# ─── l'offre ───
s.pad(T_LOGO + 0.4, s.DUR, [60, 64, 67, 72], g=1.0)
t = T_OFFRE; k = 0
while t < s.DUR - 1.0:
    if k % 2 == 0: s.kick(t, 0.07)
    s.hat(t + 0.29, 0.012); t += 0.58; k += 1
s.whoosh(T_OFFRE - 0.1, "Court", 0.05); s.pop(at(62) - 0.1, 600, 1400, 0.05)
s.chime(T_CENTIME, 0.04, (1046.5, 1318.5, 1568))
s.pop(T_APPEL, 700, 1500, 0.045); s.ppop(at(81) - 0.05, 0.05, True)
s.mix(mus_g=0.5, fx_g=1.4, amb_g=0.0, duck=0.45)
