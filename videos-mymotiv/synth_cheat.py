# Bande son du concept « Le Cheat Code » (15 s), calée sur les temps de src/CheatCode.tsx.
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
# WHY 0–3 s : bourdon froid, bips d'ordinateur, frappe, effacement, alarme d'erreur, glitchs
x = np.arange(int(3.0*SR))/SR
drone = (np.sin(2*np.pi*55*x)+0.5*np.sin(2*np.pi*58.3*x)+0.25*np.sin(2*np.pi*110.5*x))*np.minimum(1, x/0.3)*0.1
add(drone, 0.0, 1.0, -0.2); add(drone*0.8, 0.0, 1.0, 0.2)
k = 0.25
while k < 1.25: add(click(rng.uniform(0.15, 0.3)), k, 1, rng.uniform(-0.4, 0.4)); k += rng.uniform(0.05, 0.09)
k = 1.45
while k < 2.0: add(click(0.25)*0.8, k); k += 0.035   # effacement rapide
for i in range(6): add(np.sign(np.sin(2*np.pi*620*np.arange(int(0.12*SR))/SR))*env(int(0.12*SR), 0.002, 0.08)*0.08, 2.05+i*0.32)  # alarme
for tg in (1.5, 1.82, 2.2, 2.6): g = noise(0.12); g = np.repeat(np.round(g[::14]*2)/2, 14)[:len(g)]*env(len(g), 0.001, 0.05)*0.18; add(g, tg)
add(tone(330, 0.5, 0.01, 0.2)*0.08, 2.35)
# 3,0 s : onde de choc rose qui pulvérise + poussière
add(sweep(170, 30, 1.2)*env(int(1.2*SR), 0.003, 0.35), 3.0, 0.9)
add(LP(noise(1.0), 2200)*env(int(1.0*SR), 0.001, 0.2), 3.0, 0.6)
w = HP(noise(0.7), 3000)*np.linspace(1, 0, int(0.7*SR))**1.4*0.35; add(w, 3.25, 1.0, -0.5)
for i in range(60): add(tone(rng.uniform(2500, 7000), 0.06, 0.0005, 0.02), 3.25+rng.exponential(0.2), rng.uniform(0.03, 0.08), rng.uniform(-1, 0))
add(sweep(110, 45, 0.45)*env(int(0.45*SR), 0.001, 0.13), 3.4, 0.7); add(HP(noise(0.15), 1500)*env(int(0.15*SR), 0.001, 0.04), 3.4, 0.4)  # texte 3D
# Musique : 120 BPM dès 3,4 s, plus dense dans le HOW, arrêt net avant le WHAT puis triomphe
notes = [55, 55, 65.41, 49]
def bass(f, d, g): x = np.arange(int(d*SR))/SR; s = np.sign(np.sin(2*np.pi*f*x))*0.6+np.sin(2*np.pi*f*x); return LP(s, 600)*env(len(x), 0.005, d*0.8)*g
b = 3.5
while b < 9.9:
    beat = round((b-3.5)/0.5); dense = b >= 5.0
    add(kick(0.85 if dense else 0.6), b)
    if dense and beat % 2 == 1: add(snare(0.5), b)
    for h in range(4 if dense else 2): add(hat(0.16 if h % 2 else 0.1), b+h*(0.125 if dense else 0.25), 1, 0.3 if h % 2 else -0.3)
    add(bass(notes[(beat//2) % 4]*(2 if dense else 1), 0.48, 0.3 if dense else 0.2), b)
    b += 0.5
# HOW : chute du lien (sifflement descendant) + impact lourd, clic brutal, lasers, aspiration, aimants
add(sweep(2400, 500, 0.6)*np.linspace(0, 1, int(0.6*SR))**2*0.12, 5.3)
add(sweep(120, 35, 0.6)*env(int(0.6*SR), 0.001, 0.16), 5.9, 1.0); add(LP(noise(0.4), 1200)*env(int(0.4*SR), 0.001, 0.08), 5.9, 0.7)
add(click(1.0), 6.4); add(sweep(150, 60, 0.2)*env(int(0.2*SR), 0.001, 0.05), 6.4, 0.6)
for i in range(16):
    tz = 6.5+i*0.05; add(sweep(rng.uniform(2500, 4000), rng.uniform(600, 1200), 0.08)*env(int(0.08*SR), 0.001, 0.04)*0.12, tz, 1, rng.uniform(-0.6, 0.6))
suck = LP(HP(noise(1.0), 400), 5000)*np.linspace(0, 1, int(1.0*SR))**2*0.3; add(suck, 7.0, 1.0)
add(sweep(300, 1600, 0.9)*np.linspace(0, 1, int(0.9*SR))*0.06, 7.2)
for i in range(6):
    tl = 7.3+0.12*i+0.55; add(tone(880*2**(i/6), 0.12, 0.001, 0.04)*0.18, tl); add(click(0.6), tl)
add(sweep(110, 45, 0.45)*env(int(0.45*SR), 0.001, 0.13), 7.55, 0.7); add(HP(noise(0.15), 1500)*env(int(0.15*SR), 0.001, 0.04), 7.55, 0.4)
k = 8.35
while k < 9.0: add(click(0.12), k, 1, rng.uniform(-0.5, 0.5)); k += 0.04
# Arrêt net à 9,9 s, puis WHAT : plaques qui surgissent, brûlure, ding, alignement, triomphe
cut = int(9.9*SR); fd = int(0.006*SR)
for ch in (L, R): ch[cut:cut+fd] *= np.linspace(1, 0, fd); ch[cut+fd:] = 0
add(LP(HP(noise(0.9), 200), 3000)*np.linspace(0, 1, int(0.9*SR))**2*0.35, 9.2)
add(sweep(60, 30, 1.0)*env(int(1.0*SR), 0.01, 0.4), 10.0, 0.8)
w = LP(HP(noise(0.6), 300), 2500)*np.sin(np.linspace(0, np.pi, int(0.6*SR)))**2*0.35; add(w, 10.0, 1, -0.4); add(w, 10.1, 1, 0.4)
sizzle = HP(noise(1.0), 3500)*env(int(1.0*SR), 0.01, 0.35)*0.22; add(sizzle, 11.6, 1, -0.2); add(sizzle, 11.62, 1, 0.2)
add(sweep(400, 90, 0.4)*env(int(0.4*SR), 0.002, 0.1)*0.4, 11.6)
for f, dt in ((1318.5, 0), (1975.5, 0.07), (2637, 0.14)): add(tone(f, 0.9, 0.002, 0.3)*0.16, 11.95+dt)   # Ding !
w = LP(HP(noise(0.5), 400), 3000)*np.sin(np.linspace(0, np.pi, int(0.5*SR)))**2*0.25; add(w, 12.45)
d = 15.0-12.5; x = np.arange(int(d*SR))/SR
chord = sum(np.sin(2*np.pi*f*x)+0.3*np.sin(2*np.pi*2*f*x) for f in [110, 220, 277.2, 329.6, 440])
add(LP(chord, 2000)*np.minimum(1, x/0.4)*np.minimum(1, (d-x)/0.6)*0.065, 12.5)
b = 13.0
while b < 14.8: add(kick(0.75), b); add(hat(0.12), b+0.25); (add(snare(0.4), b) if round((b-13)/0.5) % 2 else None); b += 0.5
add(sweep(110, 45, 0.45)*env(int(0.45*SR), 0.001, 0.13), 13.0, 0.8); add(HP(noise(0.15), 1500)*env(int(0.15*SR), 0.001, 0.04), 13.0, 0.45)
for i in range(25): add(tone(rng.uniform(2500, 6500), 0.08, 0.001, 0.03), 13.4+rng.uniform(0, 0.5), 0.05, rng.uniform(-0.8, 0.8))
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.4)/np.tanh(1.4); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
with wave.open("public/audio/cheat-code.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
