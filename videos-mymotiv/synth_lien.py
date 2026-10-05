# Sound design de « Le lien dans ma bio » (35 s) — calé sur src/Lien.tsx.
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 35.0; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(35)
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
def tap(at, g=0.6): add(HP(noise(0.02), 2500)*env(int(0.02*SR), 0.0003, 0.004), at, g); add(tone(1600, 0.04, 0.0005, 0.01)*0.2, at); add(sweep(500, 140, 0.08)*env(int(0.08*SR), 0.001, 0.03)*0.25, at)
def whoosh(at, d=0.45, g=0.3, lo=250, hi=4000): w = LP(HP(noise(d), lo), hi)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g; add(w, at, 1, rng.uniform(-0.3, 0.3))
def pop(at, g=0.35): add(sweep(300, 900, 0.08)*env(int(0.08*SR), 0.002, 0.03), at, g)
def ding(at, f=1568, g=0.12): add((tone(f, 1.0, 0.002, 0.35) + 0.4*tone(f*2.01, 1.0, 0.002, 0.2) + 0.2*tone(f*3, 1.0, 0.002, 0.1)), at, g)
def chime(at, g=0.09):
    for k, f in enumerate((1046.5, 1318.5, 1568, 2093)): add((tone(f, 1.2, 0.003, 0.45) + 0.3*tone(f*2, 1.2, 0.003, 0.3))*g, at + k*0.07)
def impact(at, g=0.8): add(sweep(150, 38, 0.6)*env(int(0.6*SR), 0.001, 0.2)*g, at); add(LP(noise(0.5), 3000)*env(int(0.5*SR), 0.001, 0.12)*0.35*g, at)
def riser(at, d, g=0.25): x = np.linspace(0, 1, int(d*SR)); add(HP(noise(d), 1500)*x**2*g + sweep(200, 2400, d)*x**2*g*0.3, at)
def kick(g=1): return sweep(130, 42, 0.32)*env(int(0.32*SR), 0.001, 0.09)*g
def clap(g=1): return HP(noise(0.18), 900)*env(int(0.18*SR), 0.001, 0.05)*g
def hat(g=1): return HP(noise(0.04), 7000)*env(int(0.04*SR), 0.0005, 0.01)*g
def bass(f, d, g): x = np.arange(int(d*SR))/SR; return LP(np.sign(np.sin(2*np.pi*f*x))*0.6 + np.sin(2*np.pi*f*x), 500)*np.minimum(1, x/0.01)*np.exp(-x/(d*0.8))*g
def pad(at, d, freqs, g, cut=1800):
    x = np.arange(int(d*SR))/SR; p = LP(sum(np.sin(2*np.pi*f*x) + 0.2*np.sin(2*np.pi*2.003*f*x) for f in freqs), cut)*np.minimum(1, x/0.3)*np.minimum(1, (d-x)/0.3)*g
    add(p, at, 1, -0.25); add(p, at + 0.012, 1, 0.25)

# ── musique : 125 BPM, coupée pour le chrono et la nuit, relancée au réveil
B = 60/125; ROOTS = [55.0, 55.0, 43.65, 49.0]  # La, La, Fa, Sol
def groove(t0, t1, full=True):
    b = t0; k = 0
    while b < t1 - 0.01:
        add(kick(0.55), b)
        if k % 2: add(clap(0.22), b, 1, 0.1)
        add(hat(0.07), b + B/2, 1, 0.3); add(hat(0.04), b + B/4, 1, -0.3) if full else None
        if k % 2 == 0: add(bass(ROOTS[(k//4) % 4], B*2, 0.2 if full else 0.12), b)
        b += B; k += 1
groove(0.0, 3.4, False)
pad(0.0, 3.5, [220, 261.6, 329.6], 0.02, 2200)
groove(3.45, 15.55, True)
pad(3.45, 12.1, [220, 261.6, 329.6, 392], 0.016, 2000)
groove(18.35, 23.1, True)
pad(23.3, 2.9, [110, 164.8, 196, 246.9], 0.05, 900)   # la nuit
groove(26.0, 31.2, True)
pad(31.3, 3.7, [261.6, 329.6, 392, 523.2], 0.03, 2600)

# ── 1. avatar, lien, on traverse l'écran
pop(0.08, 0.3); ding(0.15, 2093, 0.05)
tap(0.62); whoosh(0.66, 0.55, 0.3, 300, 6000); add(sweep(300, 1200, 0.5)*env(int(0.5*SR), 0.01, 0.2)*0.08, 0.66)
whoosh(1.75, 0.6, 0.15, 400, 3000)
tap(2.6, 0.8); ding(2.62, 2349, 0.08)
riser(2.75, 0.67, 0.35); add(sweep(80, 900, 0.67)*np.linspace(0, 1, int(0.67*SR))**2*0.25, 2.75)
impact(3.42, 1.0); add(HP(noise(0.8), 3000)*env(int(0.8*SR), 0.001, 0.3)*0.25, 3.42)
# ── 2. le site, écran partagé, on remonte, on touche le bouton, whip
chime(3.6, 0.05)
whoosh(4.75, 0.45, 0.35, 200, 5000); impact(5.0, 0.35)
whoosh(5.25, 1.1, 0.12, 800, 6000)
tap(6.75); pop(6.95, 0.25)
whoosh(8.2, 0.6, 0.45, 150, 7000)
# ── 3. étapes
for s in (8.9, 11.0, 14.2): pop(s, 0.35); add(tone(880, 0.12, 0.002, 0.05)*0.08, s + 0.05)
tap(9.65); whoosh(9.7, 0.45, 0.25, 600, 6000); ding(10.15, 1568, 0.14); ding(10.22, 2093, 0.08)
whoosh(10.88, 0.3, 0.4, 200, 8000)
k = 11.45
while k < 12.55: add(HP(noise(0.02), 2500)*env(int(0.02*SR), 0.0003, 0.005)*rng.uniform(0.15, 0.3), k, 1, rng.uniform(-0.3, 0.3)); k += 1.1/22
tap(12.75); add(sweep(400, 1600, 0.25)*env(int(0.25*SR), 0.01, 0.1)*0.08, 12.8); ding(13.5, 1760, 0.1); ding(13.8, 2637, 0.08)
whoosh(14.08, 0.3, 0.4, 200, 8000)
tap(14.85, 0.8); add(sweep(200, 600, 0.6)*env(int(0.6*SR), 0.01, 0.3)*0.1, 14.9)
# chrono accéléré : tic-tac qui s'emballe puis s'arrête
r0, r1 = 15.6, 18.2; tt = r0; step = 0.25
while tt < r1:
    add(HP(tone(3200, 0.03, 0.0005, 0.006), 1000)*0.25 + HP(noise(0.03), 4000)*env(int(0.03*SR), 0.0003, 0.003)*0.2, tt, 1, rng.uniform(-0.2, 0.2))
    p = (tt - r0)/(r1 - r0); step = max(0.025, 0.25*(1 - np.sin(p*np.pi))**1.5 + 0.02); tt += step
riser(15.6, 2.55, 0.18); add(sweep(60, 400, 2.6)*np.linspace(0, 1, int(2.6*SR))*0.12, 15.6)
add(HP(noise(0.06), 3000)*env(int(0.06*SR), 0.0005, 0.02)*0.6, 18.32); impact(18.35, 0.7); chime(18.4, 0.08)  # déclencheur + arrêt sur image
# ── 4. Yann postule
pop(19.95, 0.4); add(sweep(200, 500, 0.15)*env(int(0.15*SR), 0.002, 0.06)*0.2, 19.95)
pop(20.3, 0.3)
tap(21.35, 0.8); add(LP(noise(0.35), 2500)*env(int(0.35*SR), 0.005, 0.12)*0.3, 21.4)  # papier plié
whoosh(21.7, 0.55, 0.45, 300, 8000); add(sweep(400, 2500, 0.5)*env(int(0.5*SR), 0.01, 0.2)*0.1, 21.7)
chime(21.95, 0.1)
add(sweep(1200, 300, 0.6)*env(int(0.6*SR), 0.01, 0.3)*0.06, 23.15); whoosh(23.15, 0.5, 0.15, 1000, 8000)
# ── 5. nuit (vent doux, grillons) puis matin (oiseaux)
add(LP(noise(2.6), 500)*np.sin(np.linspace(0, np.pi, int(2.6*SR)))*0.12, 23.4)
for i in range(16): add(tone(4200 + rng.uniform(-200, 200), 0.05, 0.002, 0.012)*0.03, 24.0 + i*0.07 + rng.uniform(0, 0.03), 1, rng.uniform(-0.6, 0.6))
for i in range(6):
    b0 = 25.2 + i*0.13; add(sweep(2600, 4200, 0.07)*env(int(0.07*SR), 0.003, 0.03)*0.05, b0, 1, rng.uniform(-0.6, 0.6))
# ── 6. téléphone, appel manqué (vibration), e-mail
whoosh(26.0, 0.5, 0.3, 200, 5000)
for b0 in (26.6, 26.95):
    x = np.arange(int(0.28*SR))/SR; add(LP(np.sign(np.sin(2*np.pi*170*x)), 600)*np.minimum(1, x/0.01)*np.minimum(1, (0.28-x)/0.02)*0.18, b0)
ding(27.45, 1318.5, 0.14); ding(27.55, 1760, 0.12)
impact(28.7, 0.45); add(sweep(500, 180, 0.4)*env(int(0.4*SR), 0.005, 0.2)*0.12, 28.7)
chime(29.6, 0.11); [pop(29.6 + 0.06*i, 0.12) for i in range(8)]
# ── 7. fin
add(HP(noise(0.5), 3000)*np.linspace(0, 1, int(0.5*SR))**2*0.2, 30.8); impact(31.3, 0.8)
chime(31.45, 0.09); pop(32.2, 0.3); ding(32.25, 2637, 0.07)
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.4)/np.tanh(1.4); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.8*SR):] *= np.linspace(1, 0, int(0.8*SR))[:, None]
with wave.open("public/audio/lien.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
