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

# WHY 0–2,6 s : bourdon froid, frappe de la lettre banale, alarme d'erreur, glitchs
x = np.arange(int(2.6*SR))/SR
drone = (np.sin(2*np.pi*55*x)+0.5*np.sin(2*np.pi*58.3*x)+0.25*np.sin(2*np.pi*110.5*x))*np.minimum(1, x/0.3)*0.1
add(drone, 0.0, 1.0, -0.2); add(drone*0.8, 0.0, 1.0, 0.2)
k = 0.25
while k < 1.25: add(click(rng.uniform(0.15, 0.3)), k, 1, rng.uniform(-0.4, 0.4)); k += rng.uniform(0.05, 0.09)
for i in range(4): add(np.sign(np.sin(2*np.pi*620*np.arange(int(0.12*SR))/SR))*env(int(0.12*SR), 0.002, 0.08)*0.08, 2.05+i*0.16)
for tg in (1.5, 1.85, 2.1, 2.4): g = noise(0.12); g = np.repeat(np.round(g[::14]*2)/2, 14)[:len(g)]*env(len(g), 0.001, 0.05)*0.18; add(g, tg)
# 2,6 s : onde de choc + poussière ; 2,9 s : texte 3D
add(sweep(170, 30, 1.2)*env(int(1.2*SR), 0.003, 0.35), 2.6, 0.9); add(LP(noise(1.0), 2200)*env(int(1.0*SR), 0.001, 0.2), 2.6, 0.6)
add(HP(noise(0.7), 3000)*np.linspace(1, 0, int(0.7*SR))**1.4*0.35, 2.85, 1.0, -0.5)
for i in range(60): add(tone(rng.uniform(2500, 7000), 0.06, 0.0005, 0.02), 2.85+rng.exponential(0.2), rng.uniform(0.03, 0.08), rng.uniform(-1, 0))
def slam(at, g=0.7): add(sweep(110, 45, 0.45)*env(int(0.45*SR), 0.001, 0.13), at, g); add(HP(noise(0.15), 1500)*env(int(0.15*SR), 0.001, 0.04), at, g*0.6)
slam(2.9)
# Musique 120 BPM : de 3,0 s à 8,9 s (plus dense dès 4,0 s), arrêt net, puis triomphe après le CLACK
notes = [55, 55, 65.41, 49]
def bass(f, d, g): x = np.arange(int(d*SR))/SR; s = np.sign(np.sin(2*np.pi*f*x))*0.6+np.sin(2*np.pi*f*x); return LP(s, 600)*env(len(x), 0.005, d*0.8)*g
b = 3.0
while b < 8.9:
    beat = round((b-3.0)/0.5); dense = b >= 4.0
    add(kick(0.85 if dense else 0.6), b)
    if dense and beat % 2 == 1: add(snare(0.5), b)
    for h in range(4 if dense else 2): add(hat(0.16 if h % 2 else 0.1), b+h*(0.125 if dense else 0.25), 1, 0.3 if h % 2 else -0.3)
    add(bass(notes[(beat//2) % 4]*(2 if dense else 1), 0.48, 0.3 if dense else 0.2), b)
    b += 0.5
# HOW : collage, « 1 lien collé », clic, flux de données, impact sur l'icône, scan, extraction, écriture
add(click(0.9), 4.4); add(tone(1500, 0.08, 0.001, 0.03)*0.15, 4.4); slam(4.45, 0.6)
add(click(1.0), 4.95); add(sweep(150, 60, 0.2)*env(int(0.2*SR), 0.001, 0.05), 4.95, 0.6)
add(sweep(400, 2600, 0.35)*np.linspace(0, 1, int(0.35*SR))*0.12, 5.15); add(HP(noise(0.35), 2500)*np.linspace(0, 1, int(0.35*SR))*0.15, 5.15)
add(sweep(220, 70, 0.25)*env(int(0.25*SR), 0.001, 0.07), 5.5, 0.7); add(tone(1760, 0.2, 0.001, 0.06)*0.12, 5.5)
slam(5.3, 0.45)
for i in range(11): add(tone(1200+i*120, 0.05, 0.001, 0.02)*0.07, 5.7+i*0.05, 1, 0.3)
add(sweep(300, 2200, 0.35)*env(int(0.35*SR), 0.01, 0.15)*0.18, 6.3)
for f, dt in ((1318.5, 0.0), (1975.5, 0.06)): add(tone(f, 0.5, 0.002, 0.15)*0.1, 6.32+dt)
hum = np.sin(2*np.pi*440*np.arange(int(2.6*SR))/SR)*(0.5+0.5*np.sin(2*np.pi*3*np.arange(int(2.6*SR))/SR))*0.015; add(hum, 6.5)
k = 5.6
while k < 8.8: add(click(rng.uniform(0.08, 0.16)), k, 1, rng.uniform(-0.5, 0.5)); k += rng.uniform(0.045, 0.08)
cut = int(8.9*SR); fd = int(0.006*SR)
for ch in (L, R): ch[cut:cut+fd] *= np.linspace(1, 0, fd); ch[cut+fd:] = 0
# WHAT : la lettre passe devant (souffle), le CV se cale derrière, la particule file, CLACK premium
w = LP(HP(noise(0.7), 250), 2500)*np.sin(np.linspace(0, np.pi, int(0.7*SR)))**2*0.4; add(w, 9.0, 1, -0.3)
add(sweep(55, 35, 0.9)*env(int(0.9*SR), 0.05, 0.4), 9.0, 0.5)
w2 = LP(HP(noise(0.5), 600), 3500)*np.sin(np.linspace(0, np.pi, int(0.5*SR)))**2*0.15; add(w2, 9.25, 1, 0.4)
add(sweep(500, 3000, 0.45)*np.linspace(0, 1, int(0.45*SR))**2*0.14, 9.55)
d = 0.7; xx = np.arange(int(d*SR))/SR
clack = sum(np.sin(2*np.pi*f*xx)*np.exp(-xx/dd)*a for f, dd, a in [(1130, 0.12, 0.5), (2710, 0.08, 0.35), (4390, 0.05, 0.25), (6200, 0.03, 0.15)])
clack += HP(noise(d), 2000)*np.exp(-xx/0.012)*0.9 + np.sin(2*np.pi*np.cumsum(np.geomspace(110, 40, len(xx)))/SR)*np.exp(-xx/0.12)*1.2
add(clack, 10.0, 0.95)
d = 15.0-10.0; x = np.arange(int(d*SR))/SR
chord = sum(np.sin(2*np.pi*f*x)+0.3*np.sin(2*np.pi*2*f*x) for f in [110, 220, 277.2, 329.6, 440])
add(LP(chord, 2000)*np.minimum(1, x/0.3)*np.minimum(1, (d-x)/0.8)*0.065, 10.05)
slam(10.35, 0.75)
b = 10.85
while b < 14.6: add(kick(0.7), b); add(hat(0.12), b+0.25); (add(snare(0.38), b) if round((b-10.85)/0.5) % 2 else None); b += 0.5
for i in range(25): add(tone(rng.uniform(2500, 6500), 0.08, 0.001, 0.03), 11.9+rng.uniform(0, 0.5), 0.05, rng.uniform(-0.8, 0.8))
add(sweep(400, 900, 0.18)*env(int(0.18*SR), 0.003, 0.08)*0.2, 12.25)
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.4)/np.tanh(1.4); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
with wave.open("public/audio/cheat-code-logo.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
