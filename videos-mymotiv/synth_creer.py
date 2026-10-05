# Sound design de « Créer ma lettre » (20 s) : interface en verre, ressorts, jello, succès — calé sur src/Creer.tsx.
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 20.0; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(21)
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
def glass(at, f=2200, g=0.12, pan=0.0): x = np.arange(int(0.25*SR))/SR; add((np.sin(2*np.pi*f*x) + 0.5*np.sin(2*np.pi*f*2.76*x) + 0.25*np.sin(2*np.pi*f*5.4*x))*np.exp(-x/0.05), at, g, pan)
def pop(at, g=0.35): add(sweep(300, 900, 0.08)*env(int(0.08*SR), 0.002, 0.03), at, g)
def click(at, g=0.6): add(HP(noise(0.02), 2500)*env(int(0.02*SR), 0.0003, 0.004), at, g); add(tone(1800, 0.03, 0.0005, 0.008)*0.15, at)
def whoosh(at, d=0.45, g=0.3, lo=250, hi=4000): w = LP(HP(noise(d), lo), hi)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g; add(w, at, 1, rng.uniform(-0.3, 0.3))
def kick(g=1): return sweep(120, 42, 0.3)*env(int(0.3*SR), 0.001, 0.08)*g
def hat(g=1): return HP(noise(0.04), 7000)*env(int(0.04*SR), 0.0005, 0.01)*g
# ── nappe d'ambiance : claire (fond blanc), plus profonde et pulsée dans le noir, claire à la fin
def pad(at, d, freqs, g, cut=1800):
    x = np.arange(int(d*SR))/SR; p = LP(sum(np.sin(2*np.pi*f*x) + 0.2*np.sin(2*np.pi*2.003*f*x) for f in freqs), cut)*np.minimum(1, x/0.3)*np.minimum(1, (d-x)/0.3)*g
    add(p, at, 1, -0.25); add(p, at + 0.012, 1, 0.25)
pad(0.0, 4.0, [523.2, 659.3, 784], 0.022, 2600)
pad(4.0, 11.4, [130.8, 196, 261.6, 329.6], 0.035, 1400)
pad(15.3, 4.7, [523.2, 659.3, 784, 987.8], 0.025, 2600)
B = 0.5; b = 4.4
while b < 15.2:   # pulsation douce (120 BPM) dans la partie sombre
    k = round((b - 4.4)/B); add(kick(0.45 if b < 13.1 else 0.3), b)
    add(hat(0.07), b + 0.25, 1, 0.3)
    if k % 2: add(HP(noise(0.12), 1800)*env(int(0.12*SR), 0.001, 0.03)*0.12, b)
    b += B
# ── 1. le logo se forme
for i in range(3): glass(0.35 + i*0.08, 1600 + i*300, 0.08, (i-1)*0.4)
whoosh(0.95, 0.5, 0.18, 1000, 8000); glass(1.15, 2637, 0.09); glass(1.22, 3520, 0.06)
# ── 2. bouton, survol, clic, bascule dans le noir
pop(2.4, 0.3); glass(2.45, 1975, 0.07)
add(tone(1318.5, 0.15, 0.01, 0.06)*0.05, 3.3)
click(3.75); add(sweep(400, 60, 0.6)*env(int(0.6*SR), 0.005, 0.2)*0.5, 3.85); whoosh(3.8, 0.6, 0.35, 120, 2000)
add(sweep(90, 35, 1.0)*env(int(1.0*SR), 0.01, 0.4)*0.5, 4.15)
# ── 3. menu, surlignage, choix, carte 3D
for i in range(4): glass(4.45 + 0.07*i, 1760 + 220*i, 0.06, -0.3 + 0.2*i)
add(tone(2400, 0.05, 0.001, 0.015)*0.05, 5.0); add(tone(2600, 0.05, 0.001, 0.015)*0.05, 5.55)
click(6.0); whoosh(6.05, 0.5, 0.3, 300, 6000); add(sweep(200, 700, 0.4)*env(int(0.4*SR), 0.01, 0.15)*0.15, 6.1)
add(HP(noise(0.3), 4000)*np.sin(np.linspace(0, np.pi, int(0.3*SR)))*0.08, 6.75); glass(6.95, 2093, 0.07)
# ── 4. fenêtre, frappe du lien, Générer
pop(7.1, 0.3); glass(7.15, 1568, 0.06)
k = 7.75
while k < 8.95: add(HP(noise(0.02), 2500)*env(int(0.02*SR), 0.0003, 0.005)*rng.uniform(0.15, 0.3), k, 1, rng.uniform(-0.3, 0.3)); k += 1.2/32
click(9.6, 0.8); glass(9.62, 2349, 0.08)
# ── 5. jello + barres
x = np.arange(int(0.7*SR))/SR; boing = np.sin(2*np.pi*np.cumsum(220 + 90*np.sin(2*np.pi*7*x)*np.exp(-x/0.25))/SR)*np.exp(-x/0.22)
add(boing*0.3, 9.85); add(LP(noise(0.3), 800)*env(int(0.3*SR), 0.005, 0.08)*0.2, 9.85)
add(sweep(300, 1400, 2.0)*np.linspace(0, 1, int(2.0*SR))*0.04, 10.35)
for tb, f in ((11.35, 1318.5), (12.05, 1568), (12.35, 1975.5)): glass(tb, f, 0.1)
# ── 6. pastille → cercle, rebond, succès, bulles
whoosh(12.75, 0.4, 0.25, 400, 5000); add(sweep(500, 200, 0.4)*env(int(0.4*SR), 0.005, 0.15)*0.15, 12.8)
x = np.arange(int(0.9*SR))/SR; bounce = np.sin(2*np.pi*np.cumsum(140 + 60*np.sin(2*np.pi*4.5*x)*np.exp(-x/0.3))/SR)*np.exp(-x/0.3)
add(bounce*0.45, 13.15); add(sweep(110, 40, 0.5)*env(int(0.5*SR), 0.001, 0.15)*0.5, 13.15)
for f, dt in ((1046.5, 0.0), (1318.5, 0.08), (1568, 0.16), (2093, 0.24)): add((tone(f, 1.2, 0.003, 0.45) + 0.3*tone(f*2, 1.2, 0.003, 0.3))*0.08, 13.3 + dt)
for i in range(18): add(tone(rng.uniform(2500, 6500), 0.08, 0.001, 0.03), 13.3 + rng.uniform(0, 0.6), 0.04, rng.uniform(-0.8, 0.8))
pop(14.05, 0.3); pop(14.25, 0.25)
# ── 7. flash, slogan tapé, appel à l'action
add(HP(noise(0.5), 3000)*np.linspace(0, 1, int(0.5*SR))**2*0.25, 14.8); add(sweep(300, 3000, 0.5)*np.linspace(0, 1, int(0.5*SR))**2*0.08, 14.8)
add(LP(noise(0.6), 6000)*env(int(0.6*SR), 0.001, 0.2)*0.25, 15.3)
full = "Avec MyMotiv, postulez. Et faites-vous recruter."
for i, ch in enumerate(full):
    if ch != " ": add(HP(noise(0.04), 2000)*env(int(0.04*SR), 0.0003, 0.006)*0.25 + LP(noise(0.04), 500)*env(int(0.04*SR), 0.001, 0.015)*0.25, 15.6 + i*(2.2/len(full)), 1, rng.uniform(-0.3, 0.3))
x = np.arange(int(2.0*SR))/SR; add(LP(sum(np.sin(2*np.pi*f*x) + 0.3*np.sin(2*np.pi*2*f*x) for f in [261.6, 329.6, 392, 523.2]), 2500)*np.minimum(1, x/0.05)*np.exp(-x/1.0)*0.06, 18.15)
pop(18.45, 0.3); glass(18.47, 2637, 0.08)
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.3)/np.tanh(1.3); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.6*SR):] *= np.linspace(1, 0, int(0.6*SR))[:, None]
with wave.open("public/audio/creer.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
