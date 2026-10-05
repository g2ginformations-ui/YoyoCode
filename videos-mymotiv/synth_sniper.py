# Bande son du concept « Le Sniper » (15 s), calée sur les temps de src/Sniper.tsx.
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 15.0; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(5)
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
def kick(g=1): return sweep(140, 42, 0.3)*env(int(0.3*SR), 0.001, 0.09)*g
def snare(g=1): d = 0.2; return (HP(noise(d), 1200)*0.7 + np.sin(2*np.pi*190*np.arange(int(d*SR))/SR)*0.35)*env(int(d*SR), 0.001, 0.06)*g
def hat(g=1): return HP(noise(0.04), 7000)*env(int(0.04*SR), 0.0005, 0.01)*g
def click(g=1): return HP(noise(0.025), 2500)*env(int(0.025*SR), 0.0003, 0.005)*g


def slam(at, g=0.7): add(sweep(110, 45, 0.45)*env(int(0.45*SR), 0.001, 0.13), at, g); add(HP(noise(0.15), 1500)*env(int(0.15*SR), 0.001, 0.04), at, g*0.6)
def beep(at, f=1800, g=0.12): add(tone(f, 0.06, 0.001, 0.02)*g, at)
notes = [55, 55, 65.41, 49]
def bass(f, d, g): x = np.arange(int(d*SR))/SR; s = np.sign(np.sin(2*np.pi*f*x))*0.6+np.sin(2*np.pi*f*x); return LP(s, 600)*env(len(x), 0.005, d*0.8)*g
# WHY 0–2,2 s : défilement frénétique (bruit de molette), papiers qui tombent, rythme nerveux
b = 0.0
while b < 2.2:
    add(kick(0.55), b); add(hat(0.12), b+0.125); add(hat(0.08), b+0.25, 1, 0.3); add(hat(0.12), b+0.375); b += 0.5
k = 0.0
while k < 2.25: add(click(0.18 + 0.12*(1-k/2.25)), k, 1, rng.uniform(-0.6, 0.6)); k += 0.02 + 0.06*(k/2.25)**2
for i in range(16): add(LP(HP(noise(0.12), 800), 5000)*env(int(0.12*SR), 0.005, 0.04)*0.22, 0.25+i*0.12+0.28, 1, rng.uniform(-0.5, 0.5))
# 2,2 s : tout s'assombrit (coupure + souffle grave), viseur qui cherche, verrouillage
cut = int(2.2*SR); fd = int(0.006*SR)
for ch in (L, R): ch[cut:cut+fd] *= np.linspace(1, 0, fd); ch[cut+fd:] = 0
add(sweep(80, 35, 1.6)*env(int(1.6*SR), 0.02, 0.6), 2.2, 0.55)
for i, tb in enumerate([2.35, 2.5, 2.62, 2.72, 2.79]): beep(tb, 1500 + i*150, 0.1)
d = 0.5; xx = np.arange(int(d*SR))/SR
lock = HP(noise(d), 2500)*np.exp(-xx/0.01)*0.8 + np.sin(2*np.pi*np.cumsum(np.geomspace(300, 90, len(xx)))/SR)*np.exp(-xx/0.06)*0.8 + np.sin(2*np.pi*2400*xx)*np.exp(-xx/0.12)*0.15
add(lock, 2.85, 0.8); slam(2.95, 0.6)
# HOW 4 → 10 s : musique pulsée, radar, circuit, scan, arrachage du logo, écriture frénétique
b = 4.0
while b < 10.0:
    beat = round((b-4.0)/0.5); dense = b >= 5.6
    add(kick(0.85 if dense else 0.65), b)
    if dense and beat % 2 == 1: add(snare(0.45), b)
    for h in range(4): add(hat(0.15 if h % 2 else 0.09), b+h*0.125, 1, 0.3 if h % 2 else -0.3)
    add(bass(notes[(beat//2) % 4]*2, 0.48, 0.28), b)
    b += 0.5
for i in range(10): add(tone(900, 0.25, 0.002, 0.08)*0.06*(1 - i/10), 4.1 + i*0.14, 1, 0.4 if i % 2 else -0.4)   # sonar
add(tone(1318.5, 0.3, 0.002, 0.1)*0.1, 5.45); add(tone(1760, 0.3, 0.002, 0.1)*0.1, 5.52)   # lien analysé
def zap(at, d=0.3): add(sweep(300, 2600, d)*np.linspace(0, 1, int(d*SR))*0.13, at); add(HP(noise(d), 3000)*np.linspace(0, 1, int(d*SR))*0.1, at)
zap(5.6); add(sweep(220, 70, 0.25)*env(int(0.25*SR), 0.001, 0.07), 5.9, 0.6)
for i in range(13): beep(6.1 + i*0.05, 1100 + i*90, 0.06)
d = 0.4; rip = LP(HP(noise(d), 600), 6000)*np.linspace(1, 0, int(d*SR))**2*0.5; add(rip, 6.85); add(sweep(200, 1400, 0.25)*env(int(0.25*SR), 0.002, 0.1)*0.3, 6.85)
zap(7.4, 0.35); add(tone(1975.5, 0.4, 0.002, 0.12)*0.1, 7.75)
k = 7.6
while k < 9.6: add(click(rng.uniform(0.1, 0.2)), k, 1, rng.uniform(-0.5, 0.5)); k += rng.uniform(0.03, 0.055)
add(sweep(200, 1200, 0.6)*np.linspace(0, 1, int(0.6*SR))*0.12, 9.3)   # la boucle se referme
for at in (4.35, 5.7, 7.5): slam(at, 0.4)
cut = int(10.0*SR)
for ch in (L, R): ch[cut:cut+fd] *= np.linspace(1, 0, fd); ch[cut+fd:] = 0
# WHAT : passage au premier plan, deux CLACK mécaniques, compteur, triomphe
w = LP(HP(noise(0.5), 250), 2500)*np.sin(np.linspace(0, np.pi, int(0.5*SR)))**2*0.35; add(w, 10.0, 1, -0.3)
add(sweep(500, 3000, 0.4)*np.linspace(0, 1, int(0.4*SR))**2*0.14, 10.15)
d = 0.7; xx = np.arange(int(d*SR))/SR
clack = sum(np.sin(2*np.pi*f*xx)*np.exp(-xx/dd)*a for f, dd, a in [(1130, 0.12, 0.5), (2710, 0.08, 0.35), (4390, 0.05, 0.25), (6200, 0.03, 0.15)])
clack += HP(noise(d), 2000)*np.exp(-xx/0.012)*0.9 + np.sin(2*np.pi*np.cumsum(np.geomspace(110, 40, len(xx)))/SR)*np.exp(-xx/0.12)*1.2
add(clack, 10.55, 0.95); add(clack, 10.85, 0.6)
for i in range(7): add(tone(660*2**(i/7), 0.1, 0.001, 0.03)*0.15, 11.1 + i*0.1); add(click(0.4), 11.1 + i*0.1)
add(tone(1318.5, 0.8, 0.002, 0.25)*0.14, 11.8); add(tone(1975.5, 0.8, 0.002, 0.25)*0.1, 11.87)
d = 15.0-10.6; x = np.arange(int(d*SR))/SR
chord = sum(np.sin(2*np.pi*f*x)+0.3*np.sin(2*np.pi*2*f*x) for f in [110, 220, 277.2, 329.6, 440])
add(LP(chord, 2000)*np.minimum(1, x/0.3)*np.minimum(1, (d-x)/0.8)*0.065, 10.6)
slam(12.2, 0.8)
b = 12.2
while b < 14.6: add(kick(0.7), b); add(hat(0.12), b+0.25); (add(snare(0.38), b) if round((b-12.2)/0.5) % 2 else None); b += 0.5
for i in range(25): add(tone(rng.uniform(2500, 6500), 0.08, 0.001, 0.03), 13.0+rng.uniform(0, 0.5), 0.05, rng.uniform(-0.8, 0.8))
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.4)/np.tanh(1.4); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
with wave.open("public/audio/sniper.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
