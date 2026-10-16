# Son de « Ballon » (≈44 s), d'après la mesure de la pub de référence (styles/ballon-pop.md) : 0-7,5 s ralenti muet
# (souffle aigu qui monte + grave qui enfle, tic de caméra chaque demi-seconde, petit grincement de latex quand la pointe
# touche), coupe sèche ; ambiance calme sous la voix ; blips sur le fil de fer ; la musique gonfle avec le téléphone et
# le vrai site ; l'offre sur une nappe tendue (le ballon n'a toujours pas éclaté) ; « Commente… » : montée, SILENCE,
# puis le POP du ballon pile sur le mot « POP » (claquement sec + grave + éclats de latex) ; signature sonore MyMotiv
# sur le point du logo. Temps calés sur src/Ballon.tsx.
import sys
import numpy as np
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from histoire_son import SR
from pub_son import signature

s = PixelSon("ballon", seed=777)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
T_MACRO, T_TOUCHE, T_VOIX = 1.9, 5.6, 7.5
T_FIL, T_FIL_FIN = at(11) - 0.15, sc(2)
T_TEL, T_SITE = sc(3) - 0.1, at(34) - 0.15
T_RETOUR = PH(4)[1] - 0.15; T_GRAND = T_RETOUR + 0.45
T_OFFRE, T_PRIX, T_CENTIME, T_SANS, T_OFFERTE = sc(5), at(58, 0.23), at(61) - 0.1, sc(6), at(73) - 0.1
T_COM, T_POP = sc(7), at(80)
T_LARGE, T_ECLATS, T_LOGO, T_APPEL = T_POP + 0.18, T_POP + 0.42, T_POP + 1.0, sc(8) - 0.1

def grince(t, g=0.03, f0=520, f1=780, d=0.35):        # latex qui grince (sinus rugueux qui glisse)
    n = int(d * SR); tt = np.arange(n) / SR
    f = f0 + (f1 - f0) * (tt / d) ** 0.7 + 25 * np.sin(2 * np.pi * 31 * tt)
    ph = 2 * np.pi * np.cumsum(f) / SR
    x = (np.sin(ph) + 0.4 * np.sin(2 * ph) + 0.25 * np.sign(np.sin(3 * ph))) * np.sin(np.pi * tt / d) ** 2
    s.put(s.fx, x, t, g)

# ─── 0-7,5 s : le ralenti ───
n = int(T_VOIX * SR); tt = np.arange(n) / SR
souffle = np.zeros(n); x = s.noise(T_VOIX)
for k, (lo, hi) in enumerate([(1600, 3000), (2400, 4200), (3400, 6000)]):
    a, b = int(k * n / 3), int((k + 1) * n / 3)
    souffle[a:b] = s.BP(x, lo, hi)[a:b]
fin = np.minimum(1, (T_VOIX - tt) / 0.04)
env = (0.15 + 0.85 * (tt / T_VOIX) ** 2) * fin
grave = (np.sin(2 * np.pi * 55 * tt) + 0.6 * np.sin(2 * np.pi * 82.4 * tt)) * (tt / T_VOIX) ** 3 * fin
s.put(s.fx, souffle * env * 0.5 + grave * 0.5, 0.0, 0.12)
for k in range(15): s.click(k * 0.5, 0.03)
s.whoosh(T_MACRO - 0.05, "Court", 0.04)
grince(T_TOUCHE - 0.05, 0.035); grince(T_TOUCHE + 0.9, 0.02, 480, 640, 0.5)

# ─── 7,5-16 s : calme, puis le fil de fer ───
s.pad(T_VOIX + 0.1, T_TEL + 0.3, [57, 64, 69, 71], g=0.7)
s.glitch(T_FIL, 0.25, 0.05); s.riseblips(T_FIL + 0.2, 6, 900, 1.08, 0.05, 0.01)
s.whoosh(T_FIL_FIN, "Court", 0.04)
grince(sc(2) + 1.2, 0.02, 450, 600, 0.6)

# ─── 16-27 s : le téléphone, le vrai site, la musique gonfle ───
s.whoosh(T_TEL, "MoyenSourd", 0.06)
B = 0.5
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [60, 64, 67, 71], [55, 59, 62, 65]]
s.piano(T_TEL + 0.2, T_RETOUR - 0.1, CH, beat=B, g=0.9)
t = T_SITE
while t < T_RETOUR - 0.15:
    s.kick(t, 0.11); s.hat(t + B / 2, 0.02); t += B
for a in (T_SITE, at(47) - 0.15, at(53) - 0.1): s.click(a, 0.05)
s.ppop(at(44), 0.04, True); s.ppop(at(48), 0.04, True); s.ppop(at(53), 0.04, True)
s.whoosh(T_RETOUR, "MoyenSourd", 0.05)

# ─── 27-37 s : l'offre, le ballon toujours sous tension ───
s.pad(T_GRAND, T_COM + 0.2, [57, 60, 64, 71], g=0.9)
t = T_OFFRE; k = 0
while t < T_COM - 0.2:
    if k % 2 == 0: s.kick(t, 0.07)
    s.hat(t + 0.29, 0.012); t += 0.58; k += 1
s.pop(T_PRIX, 600, 1400, 0.06); s.chime(T_CENTIME, 0.04, (1046.5, 1318.5, 1568))
s.ppop(T_SANS, 0.04, True); s.ppop(T_OFFERTE, 0.04, True)
grince(T_SANS + 0.4, 0.02, 500, 700, 0.5)

# ─── « Commente… » : montée, silence, POP ───
d = T_POP - 0.12 - T_COM
m = int(d * SR); up = s.BP(s.noise(d), 900, 7000) * np.linspace(0, 1, m) ** 2.2
s.put(s.fx, up, T_COM, 0.08)
grince(T_COM + 0.2, 0.03, 600, 950, d - 0.3)
# le pop : claquement très sec, grave court, puis la peau qui claque et les éclats
n = int(0.25 * SR); tt = np.arange(n) / SR
crack = s.BP(s.noise(0.25), 700, 9000) * np.exp(-tt / 0.018) * np.minimum(1, tt / 0.0004)
thump = np.sin(2 * np.pi * (95 - 40 * tt / 0.25) * tt) * np.exp(-tt / 0.06)
s.put(s.fx, crack * 1.0 + thump * 0.9, T_POP, 0.55)
s.impact(T_POP, 0.25)
for k in range(5): s.put(s.fx, s.BP(s.noise(0.06), 1500, 8000) * np.exp(-np.arange(int(0.06 * SR)) / SR / 0.012), T_LARGE + 0.03 + k * 0.05, 0.06)
for k in range(5): s.paper(T_ECLATS + k * 0.09, 0.035)
signature(s, T_LOGO - 0.3, 0.06)

# ─── la fin ───
s.pad(T_LOGO, s.DUR, [60, 64, 67, 72], g=0.9)
s.pop(T_APPEL, 700, 1500, 0.045)
s.mix(mus_g=0.5, fx_g=1.4, amb_g=0.0, duck=0.45)
