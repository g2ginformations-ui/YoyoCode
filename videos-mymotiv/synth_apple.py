# Sound design de « MyMotiv, façon Apple » (10,5 s) — clics doux, souffles et « pop » à chaque morphing, calé sur src/AppleMyMotiv.tsx.
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 10.5; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(17)
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
def click(at, g=0.35): add(HP(noise(0.012), 3000)*env(int(0.012*SR), 0.0002, 0.003), at, g); add(tone(2400, 0.03, 0.0005, 0.006)*0.25, at)
def pop(at, f0=420, f1=980, g=0.22): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g)
def air(at, d=0.45, g=0.12): add(LP(HP(noise(d), 600), 5000)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g, at, 1, rng.uniform(-0.2, 0.2))
def chime(at, g=0.06):
    for k, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(f*2, 1.4, 0.004, 0.3), at + k*0.06, g)
# nappe très douce
x = np.arange(N)/SR
pad = LP(sum(np.sin(2*np.pi*f*x) for f in (261.6, 329.6, 392, 493.9)), 1400)*np.minimum(1, x/1.0)*np.minimum(1, (DUR-x)/0.8)*0.018
L += pad; R += pad
pop(0.05, 300, 900, 0.25); pop(0.18, 500, 1200, 0.15)
air(1.15); pop(1.45, 500, 1100, 0.12)
click(2.4); air(2.65, 0.5, 0.16); pop(3.05, 400, 900, 0.18); pop(3.25, 700, 1400, 0.1)
click(4.3); air(4.55, 0.5, 0.16); pop(4.95, 500, 1100, 0.2); chime(5.0, 0.05)
air(6.0, 1.2, 0.07)
click(7.3); air(7.55, 0.5, 0.14); pop(8.0, 900, 400, 0.15); pop(8.45, 1100, 300, 0.12)
chime(8.35, 0.07)
for i in range(30): click(9.35 + i*0.012, 0.03)
mix = np.stack([L, R], 1); mix /= np.max(np.abs(mix))/10**(-3/20)
mix[-int(0.5*SR):] *= np.linspace(1, 0, int(0.5*SR))[:, None]
with wave.open("public/audio/apple-mymotiv.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
