# Bande son du concept « L'Onde de Choc Visuelle » (20 s), calée sur les temps de src/Onde.tsx.
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 20.0; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(5)
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
def whoosh(at, d=0.5, g=0.35, lo=300, hi=3000): w = LP(HP(noise(d), lo), hi)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g; add(w, at, 1, rng.uniform(-0.4, 0.4))
def riser(at, d, f0, f1, g): add(sweep(f0, f1, d)*np.linspace(0, 1, int(d*SR))**2*g, at)
notes = [55, 55, 65.41, 49]
def bass(f, d, g): x = np.arange(int(d*SR))/SR; s = np.sign(np.sin(2*np.pi*f*x))*0.6+np.sin(2*np.pi*f*x); return LP(s, 600)*env(len(x), 0.005, d*0.8)*g
# 0 → 2,55 s : hyper-lapse (souffle qui monte, papiers, grondement, tension)
d = 2.55; x = np.arange(int(d*SR))/SR
rumble = LP(noise(d), 120)*np.linspace(0.3, 1, len(x))*0.6; add(rumble, 0.0)
hiss = LP(HP(noise(d), 500), 2000)*np.linspace(0.1, 1, len(x))**2*0.35
add(hiss, 0.0, 1, -0.3); add(hiss[::-1][::-1], 0.01, 1, 0.3)
riser(0.3, 2.25, 80, 900, 0.12)
k = 0.0
while k < 2.5: add(LP(HP(noise(0.08), 900), 6000)*env(int(0.08*SR), 0.003, 0.03)*0.25, k, 1, rng.uniform(-0.8, 0.8)); k += 0.09 - 0.06*(k/2.5)
# 2,55 s : laser ; 2,75 s : coupure (boum + déchirure) ; 2,8 s : texte
add(sweep(4000, 1200, 0.25)*env(int(0.25*SR), 0.001, 0.12)*0.25, 2.55); add(HP(noise(0.22), 4000)*env(int(0.22*SR), 0.001, 0.1)*0.35, 2.55)
cut = int(2.74*SR); fd = int(0.006*SR)
for ch in (L, R): ch[cut:cut+fd] *= np.linspace(1, 0, fd); ch[cut+fd:] = 0
add(sweep(170, 30, 1.2)*env(int(1.2*SR), 0.003, 0.35), 2.75, 0.9); add(LP(noise(0.8), 2500)*env(int(0.8*SR), 0.001, 0.18), 2.75, 0.6)
tear = HP(noise(0.5), 1800)*np.linspace(1, 0, int(0.5*SR))**1.5*0.35; add(tear, 2.78, 1, -0.5); add(tear, 2.8, 1, 0.5)
slam(2.85, 0.6)
x = np.arange(int(1.2*SR))/SR; add((np.sin(2*np.pi*55*x)+0.5*np.sin(2*np.pi*82.4*x))*np.minimum(1, x/0.2)*np.minimum(1, (1.2-x)/0.1)*0.08, 2.85)
# 4 → 8 s : snap zoom, le lien qui glisse, clic, impulsion ; rythme 120 BPM
whoosh(3.85, 0.25, 0.45, 600, 6000); add(sweep(120, 45, 0.3)*env(int(0.3*SR), 0.001, 0.08), 4.0, 0.8)
b = 4.0
while b < 12.95:
    beat = round((b-4.0)/0.5); space = b >= 8.0
    add(kick(0.55 if space else 0.8), b)
    if not space and beat % 2 == 1: add(snare(0.45), b)
    for h in range(4 if not space else 2): add(hat(0.14 if h % 2 else 0.08), b+h*(0.125 if not space else 0.25), 1, 0.3 if h % 2 else -0.3)
    add(bass(notes[(beat//2) % 4]*(2 if not space else 1), 0.48, 0.26), b)
    b += 0.5
slam(4.3, 0.5)
for i in range(6): add(sweep(900+i*200, 3000, 0.06)*env(int(0.06*SR), 0.001, 0.03)*0.1, 4.45+i*0.07, 1, 0.5 - i*0.15)
add(click(0.9), 4.9); add(tone(1500, 0.08, 0.001, 0.03)*0.15, 4.9)
add(click(1.0), 5.9); add(sweep(150, 40, 0.5)*env(int(0.5*SR), 0.001, 0.14), 5.9, 0.8)
for i in range(30): add(tone(rng.uniform(2000, 6000), 0.08, 0.001, 0.03), 5.95+rng.exponential(0.15), 0.05, rng.uniform(-0.9, 0.9))
# 8 s : plongée dans l'espace 3D, flux, impact sur le globe, enveloppement, arrachage du cristal
whoosh(7.7, 0.4, 0.5, 200, 4000); add(sweep(60, 30, 1.2)*env(int(1.2*SR), 0.01, 0.5), 8.0, 0.6)
x = np.arange(int(5.0*SR))/SR
pad = LP(sum(np.sin(2*np.pi*f*x)+0.2*np.sin(2*np.pi*2.003*f*x) for f in [220, 261.6, 329.6]), 1400)*np.minimum(1, x/0.6)*np.minimum(1, (5.0-x)/0.4)*0.04
add(pad, 8.0, 1, -0.2); add(pad, 8.015, 1, 0.2)
riser(8.25, 0.5, 300, 2600, 0.14); slam(8.6, 0.45)
add(sweep(220, 60, 0.4)*env(int(0.4*SR), 0.001, 0.1), 8.75, 0.7); add(tone(1760, 0.6, 0.002, 0.2)*0.1, 8.75)
d = 1.45; sw = HP(noise(d), 1000)*(0.5+0.5*np.sin(2*np.pi*np.cumsum(np.linspace(3, 12, int(d*SR)))/SR))*np.linspace(0.3, 1, int(d*SR))*0.15; add(sw, 8.75, 1, 0.3)
riser(8.9, 1.4, 200, 1200, 0.08)
add(HP(noise(0.25), 1500)*env(int(0.25*SR), 0.001, 0.06)*0.6, 10.4); add(sweep(300, 2000, 0.3)*env(int(0.3*SR), 0.002, 0.1)*0.3, 10.4)
for f, dt in ((1318.5, 0.05), (1975.5, 0.12), (2637, 0.19)): add(tone(f, 1.0, 0.002, 0.35)*0.1, 10.4+dt)
d = 2.0; x = np.arange(int(d*SR))/SR; shim = HP(noise(d), 4000)*(0.5+0.5*np.sin(2*np.pi*5*x))*np.minimum(1, x/0.3)*np.minimum(1, (d-x)/0.3)*0.06; add(shim, 10.9)
# 13 s : le cristal fonce vers la caméra, CLACK, cascade de texte, le CV s'illumine
cut = int(12.95*SR)
for ch in (L, R): ch[cut:cut+fd] *= np.linspace(1, 0, fd); ch[cut+fd:] = 0
riser(13.0, 0.6, 200, 3500, 0.2); whoosh(13.05, 0.55, 0.45, 300, 5000)
d = 0.8; xx = np.arange(int(d*SR))/SR
clack = sum(np.sin(2*np.pi*f*xx)*np.exp(-xx/dd)*a for f, dd, a in [(1130, 0.12, 0.5), (2710, 0.08, 0.35), (4390, 0.05, 0.25), (6200, 0.03, 0.15)])
clack += HP(noise(d), 2000)*np.exp(-xx/0.012)*0.9 + np.sin(2*np.pi*np.cumsum(np.geomspace(110, 35, len(xx)))/SR)*np.exp(-xx/0.16)*1.3
add(clack, 13.6, 1.0)
k = 13.62
while k < 14.3: add(click(rng.uniform(0.12, 0.22)), k, 1, rng.uniform(-0.5, 0.5)); k += 0.022
add(tone(1318.5, 0.8, 0.002, 0.25)*0.12, 14.3); add(tone(1760, 0.8, 0.002, 0.25)*0.09, 14.37)
slam(13.95, 0.6)
d = 20.0-13.6; x = np.arange(int(d*SR))/SR
chord = sum(np.sin(2*np.pi*f*x)+0.3*np.sin(2*np.pi*2*f*x) for f in [110, 220, 277.2, 329.6, 440])
add(LP(chord, 2000)*np.minimum(1, x/0.3)*np.minimum(1, (d-x)/0.8)*0.06, 13.65)
b = 14.1
while b < 19.6: add(kick(0.7), b); add(hat(0.12), b+0.25); (add(snare(0.38), b) if round((b-14.1)/0.5) % 2 else None); b += 0.5
# 17 s : outro (rotation de caméra, bouton néon)
whoosh(16.9, 0.8, 0.3, 200, 2500); slam(17.15, 0.75)
for tb in (18.25, 19.3): add(tone(880, 0.3, 0.002, 0.1)*0.06, tb)
for i in range(25): add(tone(rng.uniform(2500, 6500), 0.08, 0.001, 0.03), 17.7+rng.uniform(0, 0.5), 0.05, rng.uniform(-0.8, 0.8))
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.4)/np.tanh(1.4); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
with wave.open("public/audio/onde.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
