# Bande-son de « L'après-midi candidatures » (30,5 s) : voix de l'utilisateur (nettoyée), musique douce qui s'efface
# sous la voix (ducking), bruitages discrets style Apple calés sur src/ApresMidi.tsx.
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 30.5; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(30)
def LP(x, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], x)
def HP(x, c): return x - LP(x, c)
def env(n, a, d): x = np.arange(n)/SR; return np.minimum(1, x/max(a, 1e-4))*np.exp(-x/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a=0.002, dec=None): x = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*x)*env(len(x), a, dec or d/3)
M = np.zeros((N, 2))  # musique (sera atténuée sous la voix)
def addm(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i+len(s))
    if j > i: M[i:j, 0] += s[:j-i]*g*(1-max(0, pan)); M[i:j, 1] += s[:j-i]*g*(1+min(0, pan))
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i+len(s))
    if j > i: L[i:j] += s[:j-i]*g*(1-max(0, pan)); R[i:j] += s[:j-i]*g*(1+min(0, pan))
def pluck(f, d=1.2): x = np.arange(int(d*SR))/SR; return (np.sin(2*np.pi*f*x) + 0.35*np.sin(2*np.pi*2*f*x) + 0.12*np.sin(2*np.pi*3*f*x))*np.exp(-x/0.45)*np.minimum(1, x/0.004)
def click(at, g=0.3): add(HP(noise(0.012), 3000)*env(int(0.012*SR), 0.0002, 0.003), at, g); add(tone(2400, 0.03, 0.0005, 0.006)*0.2, at)
def pop(at, f0=420, f1=980, g=0.16): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g)
def air(at, d=0.45, g=0.08): add(LP(HP(noise(d), 600), 5000)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g, at, 1, rng.uniform(-0.2, 0.2))
def chime(at, g=0.05):
    for k, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(f*2, 1.4, 0.004, 0.3), at + k*0.06, g)
# ── musique : arpèges de piano électrique, tendus au début (mineur), apaisés après « Respire » (majeur)
B = 60/92
tense = [[220.0, 261.6, 329.6, 392.0], [196.0, 246.9, 293.7, 349.2]]          # La m7, Sol (tension)
calm = [[261.6, 329.6, 392.0, 493.9], [220.0, 277.2, 329.6, 440.0], [293.7, 369.9, 440.0, 554.4], [246.9, 311.1, 370.0, 493.9]]
t0 = 0.0; k = 0
while t0 < 10.2:
    ch = tense[(k // 8) % 2]; addm(pluck(ch[k % 4]*(2 if k % 8 >= 4 else 1)), t0, 0.05, (k % 4 - 1.5)*0.3); t0 += B/2; k += 1
t0 = 11.4; k = 0
while t0 < 29.6:
    ch = calm[(k // 8) % 4]; addm(pluck(ch[k % 4]*(2 if k % 8 >= 4 else 1)), t0, 0.06, (k % 4 - 1.5)*0.3)
    if k % 8 == 0: addm(LP(sum(np.sin(2*np.pi*f*np.arange(int(B*4*SR))/SR) for f in ch), 900)*np.minimum(1, np.arange(int(B*4*SR))/SR/0.2)*np.exp(-np.arange(int(B*4*SR))/SR/2.0)*0.02, t0)
    t0 += B/2; k += 1
# battement doux pendant les 5 clics
for b in np.arange(13.3, 17.3, B): addm(sweep(110, 45, 0.25)*env(int(0.25*SR), 0.001, 0.07), b, 0.25)
# ── voix + ducking de la musique
w = wave.open("public/audio/apres-midi-voix.wav"); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float)/32768
venv = np.convolve(np.abs(v), np.ones(int(0.12*SR))/int(0.12*SR), 'same'); venv = venv/np.max(venv)
duck = 1 - 0.65*np.clip(venv*3, 0, 1); duck = np.convolve(duck, np.ones(int(0.08*SR))/int(0.08*SR), 'same')
d = np.ones(N); d[:len(duck)] = duck[:N]
M *= d[:, None]
L += M[:, 0]; R += M[:, 1]
vv = np.zeros(N); vv[:min(N, len(v))] = v[:N]; L += vv*0.9; R += vv*0.9
# ── bruitages
pop(0.3, 300, 900, 0.16); [click(0.32 + i*0.17, 0.12) for i in range(3)]
for h in range(3): click(0.6 + h*0.4 + 0.4, 0.1)
air(3.95, 0.5, 0.1)
for i, a in enumerate((6.39, 8.19, 8.83)): pop(a, 600, 900, 0.08)
add(LP(noise(2.6), 300)*np.linspace(0, 1, int(2.6*SR))*0.05, 7.4)   # tension sourde
click(10.29, 0.3); air(10.15, 0.6, 0.12); chime(10.5, 0.045)
pop(11.5, 400, 900, 0.14); air(12.85, 0.5, 0.1)
for a in (13.47, 14.07, 14.95, 15.67): pop(a, 700, 1400, 0.14); click(a, 0.15)
click(16.57, 0.35); air(17.3, 0.5, 0.12); pop(17.77, 500, 1100, 0.12)
air(19.9, 0.45, 0.14); pop(20.33, 900, 1800, 0.14); chime(20.38, 0.05)
click(22.82, 0.3); pop(22.95, 900, 500, 0.12); click(23.51, 0.3); pop(23.64, 500, 900, 0.12)
air(24.8, 0.5, 0.12); pop(25.1, 400, 900, 0.14); pop(26.36, 500, 1100, 0.12)
air(26.6, 1.0, 0.05); air(27.4, 0.5, 0.1); chime(27.95, 0.07)
mix = np.stack([L, R], 1); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.6*SR):] *= np.linspace(1, 0, int(0.6*SR))[:, None]
with wave.open("public/audio/apres-midi.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
