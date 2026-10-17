# Son de « Tu prends qui ? » (≈33 s) : groove léger et un peu tendu sous la voix de Yann (piano en mineur, kick discret),
# papier qui glisse quand les lettres bougent, petits « pop » sur chaque étiquette, feutre qui entoure les fautes, tic-tac
# pendant « Tu prends qui ? », tampon sur « INTERDIT », la musique se retire pour « je sais lequel j'aurais pris »,
# signature sonore MyMotiv douce sur « A ou B ? » (la fin reboucle sur le début). Temps calés sur src/TuPrendsQui.tsx.
import sys
import numpy as np
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from histoire_son import SR
from pub_son import signature

s = PixelSon("tuprends", seed=314)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
T_A, T_B, T_VS, T_QUI = sc(1), sc(2), sc(3), at(53)
T_DEPEND, T_STAMP, T_YANN, T_FIN = at(59), at(61) + 0.3, sc(5), sc(6)
T_ZOOM, T_CERCLES = at(22), at(27)

def feutre(t, d=0.3, g=0.03):                         # trait de feutre sur le papier
    n = int(d * SR); x = s.BP(s.noise(d), 2500, 8000) * (0.6 + 0.4 * np.sin(np.linspace(0, 9 * np.pi, n)) ** 2) * np.sin(np.linspace(0, np.pi, n))
    s.put(s.fx, x, t, g)

# ─── musique : piano mineur + kick discret, coupée pendant « je sais lequel j'aurais pris » ───
B = 0.52
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67], [52, 56, 59, 64]]
s.piano(0.0, T_YANN + 0.1, CH, beat=B, g=0.8)
t = 0.0; k = 0
while t < T_YANN - 0.1:
    if not (T_QUI - 0.2 < t < T_STAMP): s.kick(t, 0.08 if k % 2 == 0 else 0.05)
    s.hat(t + B / 2, 0.012); t += B; k += 1
s.pad(T_YANN, T_FIN + 0.2, [57, 64, 69], g=0.6)
s.piano(T_FIN, s.DUR, CH, beat=B, g=0.75)
t = T_FIN
while t < s.DUR - 0.3:
    s.kick(t, 0.07); s.hat(t + B / 2, 0.012); t += B

# ─── les lettres ───
for a in (T_A - 0.1, T_B - 0.1, T_VS - 0.15): s.whoosh(a, "Court", 0.05); s.paper(a + 0.05, 0.03)
for a in (at(14), at(17), at(21), at(27), at(33), at(35), at(37), at(45)): s.ppop(a, 0.035, True)
s.whoosh(T_ZOOM, "Court", 0.03)
feutre(T_CERCLES, 0.3, 0.035); feutre(T_CERCLES + 0.25, 0.3, 0.035)
s.chime(at(45), 0.025, (1046.5, 1318.5, 1568))

# ─── la question : tic-tac, puis « ça dépend » tamponné ───
for k in range(int((T_STAMP - T_QUI) / 0.5) + 1): s.click(T_QUI + k * 0.5, 0.06 if k % 2 == 0 else 0.04)
s.pop(T_QUI, 500, 1200, 0.05)
s.pop(T_DEPEND, 400, 900, 0.04)
s.stamp(T_STAMP, 0.22)
s.whoosh(T_YANN, "MoyenSourd", 0.04)

# ─── la fin : le commentaire le plus liké, « A ou B ? » ───
s.ppop(at(76), 0.04, True)
signature(s, at(83) - 0.05, 0.045)
s.mix(mus_g=0.42, fx_g=1.3, amb_g=0.0, duck=0.5)
