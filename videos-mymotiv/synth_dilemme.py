# Sound design de « Le Dilemme à 1,99 € » (50 s) — calé sur src/Dilemme.tsx. Musique et jingle composés ici (aucun extrait de jeu).
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 50.0; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(199)
def LP(x, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], x)
def HP(x, c): return x - LP(x, c)
def env(n, a, d): x = np.arange(n)/SR; return np.minimum(1, x/max(a, 1e-4))*np.exp(-x/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a=0.002, dec=None): x = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*x)*env(len(x), a, dec or d/3)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i+len(s))
    if i < 0 or i >= N or j <= i: return
    s = s[:j-i]*g; L[i:j] += s*(1-max(0, pan)); R[i:j] += s*(1+min(0, pan))
def click(at, g=0.6): add(HP(noise(0.02), 2500)*env(int(0.02*SR), 0.0003, 0.004), at, g); add(tone(1600, 0.04, 0.0005, 0.01)*0.2, at)
def whoosh(at, d=0.45, g=0.3, lo=250, hi=4000): w = LP(HP(noise(d), lo), hi)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g; add(w, at, 1, rng.uniform(-0.3, 0.3))
def pop(at, g=0.35): add(sweep(300, 900, 0.08)*env(int(0.08*SR), 0.002, 0.03), at, g)
def ding(at, f=1568, g=0.12): add(tone(f, 0.9, 0.002, 0.3) + 0.4*tone(f*2.01, 0.9, 0.002, 0.18), at, g)
def bip(at, f=1320, g=0.12): add(np.sign(np.sin(2*np.pi*f*np.arange(int(0.06*SR))/SR))*env(int(0.06*SR), 0.001, 0.02)*0.5 + tone(f, 0.06, 0.001, 0.02), at, g)
def impact(at, g=0.8): add(sweep(150, 36, 0.7)*env(int(0.7*SR), 0.001, 0.22)*g, at); add(LP(noise(0.5), 3000)*env(int(0.5*SR), 0.001, 0.12)*0.35*g, at)
def riser(at, d, g=0.25): x = np.linspace(0, 1, int(d*SR)); add(HP(noise(d), 1500)*x**2*g + sweep(200, 2400, d)*x**2*g*0.3, at)
def kick(g=1): return sweep(140, 40, 0.35)*env(int(0.35*SR), 0.001, 0.1)*g
def snare(g=1): return (HP(noise(0.2), 1200)*env(int(0.2*SR), 0.001, 0.06) + tone(190, 0.2, 0.001, 0.05)*0.6)*g
def hat(g=1): return HP(noise(0.04), 7000)*env(int(0.04*SR), 0.0005, 0.012)*g
def b808(f, d, g): x = np.arange(int(d*SR))/SR; fr = f*(1 + 0.6*np.exp(-x/0.03)); return np.tanh(np.sin(2*np.pi*np.cumsum(fr)/SR)*2)*np.exp(-x/(d*0.7))*g
def pad(at, d, freqs, g, cut=1800):
    x = np.arange(int(d*SR))/SR; p = LP(sum(np.sin(2*np.pi*f*x) + 0.2*np.sin(2*np.pi*2.003*f*x) for f in freqs), cut)*np.minimum(1, x/0.3)*np.minimum(1, (d-x)/0.3)*g
    add(p, at, 1, -0.25); add(p, at + 0.012, 1, 0.25)
# ── musique « braquage » : 96 BPM, trap sombre en mineur
B = 60/96; ROOT = [41.2, 41.2, 49.0, 36.7]   # Mi, Mi, Sol, Ré (graves)
def beat(t0, t1, g=1.0, hats=True):
    b = t0; k = 0
    while b < t1 - 0.01:
        add(kick(0.55*g), b) if k % 4 in (0, 3) else None
        if k % 4 == 2: add(snare(0.3*g), b, 1, 0.1)
        if hats:
            for h in range(2): add(hat(0.06*g), b + h*B/2, 1, 0.3)
            if k % 8 == 7: [add(hat(0.05*g), b + B/2 + j*B/8, 1, -0.3) for j in range(4)]
        if k % 4 == 0: add(b808(ROOT[(k//4) % 4], B*4, 0.32*g), b)
        b += B; k += 1
pad(0.0, 4.6, [164.8, 196, 246.9], 0.03, 1500)
add(np.sin(2*np.pi*55*np.arange(int(3.0*SR))/SR)*np.linspace(0, 1, int(3.0*SR))**2*0.12, 0.0)   # tension qui monte pendant la course
beat(4.6, 25.4, 1.0)
pad(4.6, 20.8, [164.8, 196, 246.9, 293.7], 0.016, 1600)
# roue au ralenti : tout s'étouffe, pulsation lente
pad(25.5, 9.5, [82.4, 123.5, 164.8], 0.06, 600)
for b in np.arange(25.6, 35.0, B*2): add(kick(0.35), b); add(LP(noise(0.5), 300)*env(int(0.5*SR), 0.01, 0.2)*0.08, b)
# chargement : ambiance + battement léger
pad(35.0, 8.0, [164.8, 207.7, 246.9, 329.6], 0.035, 2000)
beat(35.0, 43.0, 0.55, True)
# ── 1. accroche
# couloir : course (pas lourds, souffle), puis coupe sur la canette
for k, st in enumerate(np.arange(0.05, 2.95, 0.15)): add(LP(noise(0.08), 400)*env(int(0.08*SR), 0.001, 0.03)*0.45 + sweep(120, 60, 0.08)*env(int(0.08*SR), 0.001, 0.03)*0.3, st, 1, 0.25 if k % 2 else -0.25)
for st in np.arange(0.1, 2.9, 0.7): add(HP(LP(noise(0.35), 2500), 500)*np.sin(np.linspace(0, np.pi, int(0.35*SR)))*0.08, st)
add(HP(noise(3.0), 3000)*np.linspace(0.2, 1, int(3.0*SR))*0.05, 0.0)
impact(3.0, 0.9); whoosh(2.85, 0.45, 0.45, 200, 6000)
for i, w in enumerate([0.25, 0.32, 0.39, 0.46, 0.53]): pop(w + 0.05, 0.18)
for i, w in enumerate([3.0, 3.07, 3.14]): pop(w + 0.05, 0.2)
add(HP(noise(0.06), 3000)*env(int(0.06*SR), 0.0005, 0.02)*0.6, 3.53); impact(3.55, 0.7)   # déclencheur + arrêt sur image
add(sweep(900, 200, 0.25)*env(int(0.25*SR), 0.002, 0.1)*0.2, 3.57)                      # étiquette qui claque
for i in range(10): add(HP(noise(0.03), 1500)*env(int(0.03*SR), 0.001, 0.01)*rng.uniform(0.2, 0.5), 4.25 + i*0.035, 1, rng.uniform(-0.7, 0.7))  # glitch
add(np.sign(np.sin(2*np.pi*90*np.arange(int(0.4*SR))/SR))*env(int(0.4*SR), 0.001, 0.12)*0.1, 4.25)
# ── 2. tableau de mission
whoosh(4.7, 0.5, 0.35, 200, 5000); impact(4.95, 0.35)
for n in (5.8, 6.8, 7.6, 8.4): bip(n, 1320 if n in (5.8, 7.6) else 990)
pop(5.25, 0.3); pop(5.42, 0.2); pop(8.62, 0.2)
# ── 3. curseur, hésitation, choix, éclats
bip(13.65, 520, 0.18); add(tone(220, 0.25, 0.005, 0.1)*0.15, 13.75)                       # « non » sur la canette
bip(14.62, 1760, 0.08)
click(15.0, 0.8); ding(15.05, 1568, 0.14); ding(15.12, 2093, 0.09)
impact(15.15, 0.8)
for i in range(26): add(tone(rng.uniform(2500, 7000), 0.12, 0.0005, 0.04), 15.15 + rng.uniform(0, 0.5), rng.uniform(0.03, 0.07), rng.uniform(-0.8, 0.8))   # éclats de verre / métal
add(HP(noise(0.6), 2000)*env(int(0.6*SR), 0.001, 0.15)*0.3, 15.15)
riser(16.4, 0.8, 0.3); add(LP(noise(0.5), 6000)*env(int(0.5*SR), 0.001, 0.15)*0.3, 17.18)
# ── 4. HelloWork → MyMotiv
pop(17.3, 0.35); ding(17.35, 1318.5, 0.08)
pop(18.3, 0.3)
click(19.35, 0.8); ding(19.42, 2093, 0.12)
whoosh(20.3, 0.5, 0.45, 150, 7000)
add(HP(noise(0.03), 2500)*env(int(0.03*SR), 0.0003, 0.006)*0.5, 21.0); add(HP(noise(0.03), 2500)*env(int(0.03*SR), 0.0003, 0.006)*0.5, 21.08)   # Ctrl+V
ding(21.05, 1760, 0.1)
click(22.2, 0.8); add(sweep(400, 1600, 0.25)*env(int(0.25*SR), 0.01, 0.1)*0.08, 22.25)
ding(23.2, 1760, 0.1); ding(23.6, 2637, 0.08); pop(23.6, 0.25)
# ── 5. roue d'armes (ralenti)
add(sweep(1200, 80, 1.0)*env(int(1.0*SR), 0.01, 0.4)*0.25, 25.4); whoosh(25.45, 0.9, 0.3, 100, 1500)
for s0 in (26.2, 29.2, 32.2):
    for i, d in enumerate([-0.7, -0.5, -0.3]): bip(s0 + d, 660 + i*110, 0.05)
    click(s0, 0.7); impact(s0 + 0.02, 0.55); add(LP(noise(0.8), 900)*env(int(0.8*SR), 0.01, 0.3)*0.15, s0)
whoosh(34.6, 0.5, 0.3, 300, 6000)
# ── 6. chargement, 7/11
whoosh(35.0, 0.6, 0.25, 200, 4000); pop(35.4, 0.25)
pop(38.6, 0.25)
for i in range(8): bip(38.9 + i*0.1, 880 + i*90, 0.05)
impact(38.85, 0.55); ding(39.7, 2093, 0.1)
# ── 7. « MISSION PASSED » : jingle original (cuivres synthétiques, cadence I–IV–V–I en mi mineur → majeur)
def brass(f, d, g):
    x = np.arange(int(d*SR))/SR
    s = sum((1/k)*np.sin(2*np.pi*f*k*x + 0.3*np.sin(2*np.pi*5*x)) for k in range(1, 8))
    return LP(s, 2600)*np.minimum(1, x/0.03)*np.minimum(1, (d-x)/0.08)*g
J = 43.25
for at, chord, d in ((0.0, [164.8, 207.7, 246.9], 0.35), (0.38, [220, 277.2, 329.6], 0.35), (0.76, [246.9, 311.1, 370], 0.35), (1.14, [329.6, 415.3, 493.9, 659.3], 1.6)):
    for f in chord: add(brass(f, d, 0.05), J + at, 1, rng.uniform(-0.3, 0.3))
add(kick(0.7), J); add(kick(0.7), J + 1.14); add(snare(0.4), J + 1.14)
impact(43.25, 0.6)
for i in range(14): add(tone(rng.uniform(2500, 6000), 0.1, 0.001, 0.04), 43.6 + rng.uniform(0, 0.8), 0.04, rng.uniform(-0.8, 0.8))
whoosh(45.35, 0.5, 0.3, 200, 5000); pop(45.6, 0.3); pop(46.0, 0.3); ding(46.05, 2637, 0.07)
beat(45.4, 49.6, 0.75)
pad(45.4, 4.6, [164.8, 207.7, 246.9, 329.6], 0.025, 2200)
for i in range(10): pop(47.5 + i*0.08, 0.12)
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.4)/np.tanh(1.4); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.8*SR):] *= np.linspace(1, 0, int(0.8*SR))[:, None]
with wave.open("public/audio/dilemme.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
