# Son de « Sept secondes » (≈53 s) : tic de chronomètre sur 7,4 s ; regard du recruteur (petits blips à chaque saut
# d'œil) ; feutre sur la phrase creuse ; « Poubelle » : trait rouge, papier froissé, chute, coup sourd ; la bonne lettre
# sur un accord plus chaud ; téléphone qui vibre sur « on a envie de l'appeler » ; tampon « RIEN D'INVENTÉ » ; tuto en
# groove léger avec un clic par écran ; « 30 s » en carillon ; la musique monte sur « juste toi, mais mieux dit », se
# tend sur « la phrase que je déteste… », puis COUPE SÈCHE (silence total) et petit « pop » sur « PARTIE 2 ».
# Temps calés sur src/SeptSecondes.tsx.
import sys
import numpy as np
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from histoire_son import SR
from pub_son import signature

s = PixelSon("sept", seed=707)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
T_LETTRE, T_REGARD, T_POUB, T_BONNE, T_LIT, T_APPEL = sc(1), at(19), at(36), at(37), at(40), at(56)
T_DIFF, T_TUTO, T_30, T_TOI, T_DETESTE = sc(7), sc(8), at(120), sc(10), sc(11)
T_CUT = PH(11)[1] + 0.05; T_FIN = T_CUT + 0.35

def vibre(t, d=0.9, g=0.05):                           # téléphone qui vibre (bourdon haché)
    n = int(d * SR); tt = np.arange(n) / SR
    x = np.sign(np.sin(2 * np.pi * 150 * tt)) * (np.sin(2 * np.pi * 6 * tt) > -0.2)
    s.put(s.fx, s.BP(x, 90, 600) * np.minimum(1, (d - tt) / 0.05), t, g)

# ─── musique : piano + kick discret, s'arrête net à la coupe ───
B = 0.5
CH1 = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67], [52, 56, 59, 64]]
CH2 = [[60, 64, 67, 71], [57, 60, 64, 69], [53, 57, 60, 65], [55, 59, 62, 67]]
s.piano(0.0, T_BONNE, CH1, beat=B, g=0.7)
s.piano(T_BONNE, T_DETESTE, CH2, beat=B, g=0.8)
t = T_TUTO
while t < T_DETESTE - 0.1:
    s.kick(t, 0.08); s.hat(t + B / 2, 0.014); t += B
s.pad(T_DETESTE, T_CUT, [57, 60, 64, 70], g=0.9)
m = int((T_CUT - T_DETESTE) * SR); up = s.BP(s.noise(T_CUT - T_DETESTE), 800, 6000) * np.linspace(0, 1, m) ** 2.5
s.put(s.fx, up, T_DETESTE, 0.05)

# ─── 0-4 s : le chronomètre ───
for k in range(11): s.click(0.45 + k * 0.1, 0.04)
s.pop(1.5, 600, 1400, 0.05)

# ─── la mauvaise lettre : le regard saute, feutre, poubelle ───
s.whoosh(T_LETTRE - 0.1, "Court", 0.05)
for k in range(12): s.pop(T_REGARD + [0, .4, .75, 1.1, 1.4, 1.7, 2.0, 2.3, 2.7, 3.1, 3.6, 4.2][k], 1200, 1600, 0.012)
s.paper(at(24), 0.025)
s.put(s.fx, s.BP(s.noise(0.2), 2000, 7000) * np.linspace(1, 0, int(0.2 * SR)), T_POUB - 0.05, 0.05)   # trait rouge
for k in range(4): s.paper(T_POUB + 0.3 + k * 0.06, 0.04)                                          # papier froissé
s.stamp(T_POUB + 1.0, 0.16)

# ─── la bonne lettre : le regard s'arrête, le téléphone vibre ───
s.whoosh(T_BONNE - 0.05, "Court", 0.05)
for a in (T_LIT, T_LIT + 0.45, T_LIT + 0.9, T_LIT + 1.4, at(52)): s.pop(a, 1200, 1600, 0.012)
s.chime(at(53), 0.03, (1046.5, 1318.5, 1568))
vibre(T_APPEL, 0.5, 0.06); vibre(T_APPEL + 0.8, 0.5, 0.06)

# ─── la différence, le tuto ───
s.whoosh(T_DIFF - 0.1, "Court", 0.05)
s.stamp(at(69) + 0.1, 0.18)
s.whoosh(T_TUTO - 0.1, "MoyenSourd", 0.05)
for a in (at(87), at(92), at(94), at(106), at(114)): s.click(a, 0.05)
for a in (at(87), at(94), at(106)): s.ppop(a, 0.04, True)
s.chime(T_30 - 0.1, 0.04, (1046.5, 1318.5, 1568))
for a in (at(122), at(126), at(129), at(131)): s.ppop(a - 0.05, 0.04, True)

# ─── la coupe sèche, puis « PARTIE 2 » ───
c = int(T_CUT * SR); s.mus[c:] = 0; s.fx[c:] = 0          # silence total à la coupe
s.pop(T_FIN, 600, 1400, 0.06); signature(s, T_FIN + 0.6, 0.045)
s.mix(mus_g=0.42, fx_g=1.3, amb_g=0.0, duck=0.5)
