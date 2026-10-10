# Son de « Le faux DM » (FauxDM) : musique 8 bits sombre (la), coupure sèche sur « Tout est faux »,
# reprise plus légère pour l'explication, passage en majeur pour MyMotiv ; bruitages pixel (notifications,
# texte qui s'écrit, corbeille, tampon, buzzer, glitch). Temps calés sur src/data/fauxdm-voix.json.
import sys
import numpy as np
sys.path.insert(0, "tools")
from histoire_son import Son, SR

s = Son("fauxdm", seed=11)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d


# ─── instruments 8 bits (adoucis) ───
def square(f, d, duty=0.5, dec=0.25, a=0.004):
    t = np.arange(int(d*SR))/SR
    x = np.where((t*f) % 1 < duty, 1.0, -1.0)
    return s.LP(x, 2600)*s.env(len(t), a, dec)
def tri(f, d, dec=0.6):
    t = np.arange(int(d*SR))/SR
    return (2*np.abs(2*((t*f) % 1) - 1) - 1)*np.minimum(1, t/0.004)*np.minimum(1, (d - t)/0.02)*np.exp(-t/dec)
def hat(at_, g=0.02):
    s.put(s.mus, s.HP(s.noise(0.04), 6000)*s.env(int(0.04*SR), 0.0005, 0.012), at_, g, 0.2)
def kick(at_, g=0.18):
    d = 0.22; f = np.geomspace(140, 45, int(d*SR))
    s.put(s.mus, np.sin(2*np.pi*np.cumsum(f)/SR)*s.env(len(f), 0.002, 0.08), at_, g)
mt = s.mtof


def section(t0, t1, chords, beat, g=1.0, kicks=True, hats=True, arp=True, lead=None):
    """chords : liste d'accords MIDI (fondamentale en premier), un accord par mesure de 4 temps."""
    t, k = t0, 0
    while t < t1 - 0.05:
        ch = chords[(k // 16) % len(chords)]               # k = double-croche
        step = k % 16
        if step % 4 == 0 and kicks and step in (0, 8): kick(t, 0.16*g)
        if step % 2 == 0: s.put(s.mus, tri(mt(ch[0] - 12), beat/2*0.95, 0.5), t, 0.10*g)     # basse en croches
        if hats and step % 4 == 2: hat(t, 0.025*g)
        if arp: s.put(s.mus, square(mt(ch[step % len(ch)] + 12), beat/4*0.9, 0.25, 0.08), t, 0.020*g, 0.3 if step % 2 else -0.3)
        if lead and step == 0:
            for j, (n, dd) in enumerate(lead[(k // 16) % len(lead)]):
                s.put(s.mus, square(mt(n), dd*beat, 0.5, 0.5, 0.01), t + j*beat, 0.026*g)
        t += beat/4; k += 1


# A — l'histoire du DM (tension, la mineur), jusqu'à la coupure sur « Tout est faux »
cut = W(238) - 0.05
A = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]          # Am F Dm E
section(0.15, PH(5)[0] - 0.9, A, 0.6, g=0.8, kicks=False)
section(at(123), cut - 2.6, A, 0.6, g=1.0)                                           # après le plot twist : plus de pulsation
# montée avant la révélation : basse seule + bruit qui monte
d = 2.6; tt = np.arange(int(d*SR))/SR
s.put(s.mus, s.BP(s.noise(d), 600, 5000)*(tt/d)**2*0.06, cut - 2.6)
for k in range(int(d/0.15)): s.put(s.mus, tri(mt(45), 0.13, 0.2), cut - 2.6 + k*0.15, 0.10)

# B — l'explication (plus légère), après un silence
B = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [55, 59, 62]]                           # Am G F G
section(PH(10)[0] + 0.1, PH(14)[0] - 0.3, B, 0.6, g=0.7, kicks=False)
# C — MyMotiv (majeur, plus lumineux)
C = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]          # C G Am F
lead = [[(76, 1), (79, 1), (84, 2)], [(83, 2), (79, 2)], [(81, 1), (84, 1), (88, 2)], [(84, 3), (81, 1)]]
section(at(352) - 0.05, PH(15)[0] - 0.1, C, 0.55, g=0.9, lead=lead)
# D — la fin : accord tenu, petite ritournelle sur « pour la science »
s.pad(PH(15)[0] - 0.2, s.DUR, [57, 60, 64, 69], g=1.4)
for j, n in enumerate([72, 76, 79, 84]): s.put(s.mus, square(mt(n), 0.25, 0.5, 0.15), W(387) + 0.55 + j*0.11, 0.05)


# ─── bruitages ───
def ping(t, g=0.06):                       # notification « message reçu »
    s.put(s.fx, square(988, 0.09, 0.5, 0.05) , t, g); s.put(s.fx, square(1319, 0.18, 0.5, 0.08), t + 0.08, g)
def pop(t, g=0.04, hi=False): s.pop(t, 700 if hi else 420, 1500 if hi else 900, g, s.rng.uniform(-0.3, 0.3))
def typer(t0, n=8, g=0.012):               # texte qui s'écrit (bips de dialogue)
    for k in range(n): s.put(s.fx, square(1700 + 120*(k % 3), 0.025, 0.5, 0.012), t0 + k*0.06, g)
def stamp(t, g=0.2):                       # tampon / coup sourd
    s.put(s.fx, s.LP(s.noise(0.12), 500)*s.env(int(0.12*SR), 0.001, 0.04), t, g)
    f = np.geomspace(160, 50, int(0.18*SR)); s.put(s.fx, np.sin(2*np.pi*np.cumsum(f)/SR)*s.env(len(f), 0.001, 0.06), t, g*0.8)
def buzzer(t, g=0.05):
    for k in range(2): s.put(s.fx, square(140, 0.16, 0.5, 0.3), t + k*0.2, g)
def riseblips(t, n=8, f0=600, step=1.12, dt=0.06, g=0.02):
    for k in range(n): s.put(s.fx, square(f0*step**k, 0.05, 0.5, 0.03), t + k*dt, g)
def impact(t, g=0.32):
    f = np.geomspace(110, 30, int(0.9*SR)); s.put(s.fx, np.sin(2*np.pi*np.cumsum(f)/SR)*s.env(len(f), 0.002, 0.35), t, g)
    s.put(s.fx, s.LP(s.noise(0.5), 2500)*s.env(int(0.5*SR), 0.001, 0.12), t, g*0.35)
def glitch(t, d=0.35, g=0.09):             # bruit « bitcrush » haché
    n = int(d*SR); x = s.noise(d); hold = np.repeat(x[::90], 90)[:n]
    gate = (np.sin(np.arange(n)/SR*2*np.pi*23) > -0.2).astype(float)
    s.put(s.fx, s.BP(hold, 200, 6000)*gate*np.exp(-np.arange(n)/SR/0.25), t, g)
def click(t, g=0.08): s.put(s.fx, s.BP(s.noise(0.015), 1500, 6000)*s.env(int(0.015*SR), 0.0003, 0.004), t, g)

# transitions entre scènes
for k in range(1, 16):
    if k in (10,): continue
    s.whoosh(PH(k)[0] - 0.12, "Court" if k % 2 else "MoyenSourd", 0.05)

# 0 — le DM
pop(0.2, 0.05); ping(at(4) + 0.05); pop(at(10)); pop(at(16), hi=True)
s.put(s.fx, s.BP(s.noise(0.25), 800, 5000)*s.env(int(0.25*SR), 0.01, 0.08), at(16) + 0.12, 0.05)   # rature
# 1 — la vidéo
pop(at(25)); pop(at(28), 0.05); typer(at(35)); typer(at(39), 5); riseblips(at(48), 7, 400, 1.15, 0.08)
# 2 — le DM « supprime »
ping(PH(2)[0]); typer(at(62)); stamp(at(65) + 0.1, 0.12); typer(at(70))
# 3 — la réponse
pop(PH(3)[0]); pop(at(86)); pop(at(91), hi=True); pop(at(92)); typer(at(94)); typer(at(94) + 0.6)
s.put(s.fx, square(300, 0.4, 0.5, 0.3), at(99), 0.035); s.put(s.fx, square(225, 0.5, 0.5, 0.35), at(99) + 0.18, 0.035)
# 4 — l'avocat
pop(PH(4)[0]); riseblips(at(110), 3, 500, 1.2, 0.12); pop(at(113)); stamp(at(115) + 0.2); pop(at(117))
# 5 — plot twist
s.put(s.fx, s.BP(s.noise(0.6), 400, 6000)*np.linspace(0, 1, int(0.6*SR))**3, at(123) - 0.6, 0.08)
impact(at(123)); glitch(at(123), 0.2)
for k in range(4): s.put(s.fx, square(880 if k < 3 else 1320, 0.07, 0.5, 0.04), at(126) + k*0.15, 0.03)
ping(at(130)); pop(at(135))
# 6 — les excuses
pop(PH(6)[0]); typer(at(140)); typer(at(146)); typer(at(154)); typer(at(161), 6)
# 7–8 — la proposition
pop(at(166), 0.05); ping(at(176)); typer(at(180)); typer(at(185)); riseblips(at(185), 10, 500, 1.08, 0.12, 0.012)
typer(at(196)); riseblips(at(196), 10, 500, 1.08, 0.12, 0.012); pop(at(210)); pop(at(215)); pop(at(219), hi=True)
# 9 — « accepter », la croix, TOUT EST FAUX
pop(PH(9)[0]); click(PH(9)[0] + 0.7); s.blip(PH(9)[0] + 0.72, 1500, 0.03)
pop(at(227)); buzzer(at(232))
s.put(s.fx, np.sin(2*np.pi*np.cumsum(np.geomspace(700, 60, int(0.35*SR)))/SR)*np.linspace(1, 0, int(0.35*SR)), cut - 0.33, 0.05)   # « disque qui s'arrête »
impact(W(238) - 0.03, 0.4); glitch(W(238) - 0.03, 0.45, 0.12); pop(at(244))
# 10 — explication
pop(PH(10)[0]); stamp(at(252), 0.1); pop(at(259)); pop(at(264)); pop(at(269), hi=True); pop(at(273)); click(at(278)); stamp(at(278) + 0.05, 0.06)
# 11 — Zeigarnik
ping(PH(11)[0], 0.04); pop(at(288), 0.06, True); pop(at(290))
# 12 — la lettre qui endort
pop(PH(12)[0]); pop(at(301)); typer(at(310)); typer(at(316))
for k in range(3): s.put(s.fx, square(500 - k*90, 0.2, 0.5, 0.15), at(321) + k*0.18, 0.025)
stamp(at(322), 0.1)
# 13 — la lettre qui accroche
pop(PH(13)[0]); typer(at(334)); typer(at(336)); typer(at(339)); riseblips(at(340), 10, 500, 1.1, 0.09, 0.016)
# 14 — MyMotiv
s.chime(at(352), 0.05)
pop(at(353)); riseblips(at(356), 2, 880, 1.25, 0.08, 0.025); riseblips(at(361), 2, 990, 1.25, 0.08, 0.025); riseblips(at(366), 3, 1100, 1.25, 0.08, 0.025)
s.chime(at(372), 0.04, (1046.5, 1318.5, 1568)); pop(at(376), 0.05, True)
# 15 — la fin
pop(PH(15)[0]); pop(at(384)); pop(at(387), hi=True)

s.mix(mus_g=0.5, fx_g=1.5, amb_g=0.0, duck=0.5)
