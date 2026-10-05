# Bande son du concept publicité « Ta lettre parle d'eux. » (24 s), 120 BPM, calée sur src/Pub.tsx.
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 24.0; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(5)
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
def bass(f, d, g): x = np.arange(int(d*SR))/SR; s = np.sign(np.sin(2*np.pi*f*x))*0.6+np.sin(2*np.pi*f*x); return LP(s, 600)*env(len(x), 0.005, d*0.8)*g
def pad(at, d, freqs, g=0.04, pan=0.2):
    x = np.arange(int(d*SR))/SR; p = LP(sum(np.sin(2*np.pi*f*x)+0.2*np.sin(2*np.pi*2.003*f*x) for f in freqs), 1500)*np.minimum(1, x/0.4)*np.minimum(1, (d-x)/0.3)*g
    add(p, at, 1, -pan); add(p, at+0.012, 1, pan)
def ding(at, g=0.12): add(tone(1318.5, 0.6, 0.002, 0.2)*g, at); add(tone(1975.5, 0.6, 0.002, 0.2)*g*0.7, at+0.06)
def ring(at, d=0.35): x = np.arange(int(d*SR))/SR; add((np.sin(2*np.pi*880*x)+np.sin(2*np.pi*1320*x))*(np.sin(2*np.pi*20*x) > 0)*env(len(x), 0.005, d)*0.07, at)
def buzz(at): x = np.arange(int(0.3*SR))/SR; add(LP(np.sign(np.sin(2*np.pi*150*x)), 600)*(np.sin(2*np.pi*25*x) > 0)*0.08, at)

fd = int(0.006*SR)
def cut_at(at):
    i = int(at*SR)
    for ch in (L, R): ch[i:i+fd] *= np.linspace(1, 0, fd); ch[i+fd:] = 0
def beat(t0, t1, dense=True, g=0.75, notes=(55, 69.3, 82.4, 61.7)):
    b = t0
    while b < t1 - 1e-6:
        k = round((b-t0)/0.5); add(kick(g), b)
        if dense and k % 2 == 1: add(snare(0.4), b)
        for h in range(4 if dense else 2): add(hat(0.12 if h % 2 else 0.07), b+h*(0.125 if dense else 0.25), 1, 0.3 if h % 2 else -0.3)
        add(bass(notes[(k//2) % 4]*2, 0.48, 0.22), b); b += 0.5
def chime(at, f=1568, g=0.1): add(tone(f, 0.5, 0.002, 0.15)*g, at); add(tone(f*1.5, 0.5, 0.002, 0.15)*g*0.6, at+0.05)
def crumple(at, d=0.6):
    k = at
    while k < at+d: add(HP(noise(0.03), 2000)*env(int(0.03*SR), 0.001, 0.008)*rng.uniform(0.2, 0.5), k, 1, rng.uniform(-0.5, 0.5)); k += rng.uniform(0.015, 0.04)
fd = int(0.006*SR)
def cut_at(at):
    i = int(at*SR)
    for ch in (L, R): ch[i:i+fd] *= np.linspace(1, 0, fd); ch[i+fd:] = 0
def beat(t0, t1, dense=True, g=0.75, notes=(55, 69.3, 82.4, 61.7)):
    b = t0
    while b < t1 - 1e-6:
        k = round((b-t0)/0.5); add(kick(g), b)
        if dense and k % 2 == 1: add(snare(0.4), b)
        for h in range(4 if dense else 2): add(hat(0.12 if h % 2 else 0.07), b+h*(0.125 if dense else 0.25), 1, 0.3 if h % 2 else -0.3)
        add(bass(notes[(k//2) % 4]*2, 0.48, 0.22), b); b += 0.5
def chime(at, f=1568, g=0.1): add(tone(f, 0.5, 0.002, 0.15)*g, at); add(tone(f*1.5, 0.5, 0.002, 0.15)*g*0.6, at+0.05)
def crumple(at, d=0.6):
    k = at
    while k < at+d: add(HP(noise(0.03), 2000)*env(int(0.03*SR), 0.001, 0.008)*rng.uniform(0.2, 0.5), k, 1, rng.uniform(-0.5, 0.5)); k += rng.uniform(0.015, 0.04)

fd = int(0.006*SR)
def cut_at(at):
    i = int(at*SR)
    for ch in (L, R): ch[i:i+fd] *= np.linspace(1, 0, fd); ch[i+fd:] = 0
def beat(t0, t1, dense=True, g=0.75, notes=(55, 69.3, 82.4, 61.7)):
    b = t0
    while b < t1 - 1e-6:
        k = round((b-t0)/0.5); add(kick(g), b)
        if dense and k % 2 == 1: add(snare(0.4), b)
        for h in range(4 if dense else 2): add(hat(0.12 if h % 2 else 0.07), b+h*(0.125 if dense else 0.25), 1, 0.3 if h % 2 else -0.3)
        add(bass(notes[(k//2) % 4]*2, 0.48, 0.22), b); b += 0.5
def chime(at, f=1568, g=0.1): add(tone(f, 0.5, 0.002, 0.15)*g, at); add(tone(f*1.5, 0.5, 0.002, 0.15)*g*0.6, at+0.05)
def crumple(at, d=0.6):
    k = at
    while k < at+d: add(HP(noise(0.03), 2000)*env(int(0.03*SR), 0.001, 0.008)*rng.uniform(0.2, 0.5), k, 1, rng.uniform(-0.5, 0.5)); k += rng.uniform(0.015, 0.04)
fd = int(0.006*SR)
def cut_at(at):
    i = int(at*SR)
    for ch in (L, R): ch[i:i+fd] *= np.linspace(1, 0, fd); ch[i+fd:] = 0
def beat(t0, t1, dense=True, g=0.75, notes=(55, 69.3, 82.4, 61.7)):
    b = t0
    while b < t1 - 1e-6:
        k = round((b-t0)/0.5); add(kick(g), b)
        if dense and k % 2 == 1: add(snare(0.4), b)
        for h in range(4 if dense else 2): add(hat(0.12 if h % 2 else 0.07), b+h*(0.125 if dense else 0.25), 1, 0.3 if h % 2 else -0.3)
        add(bass(notes[(k//2) % 4]*2, 0.48, 0.22), b); b += 0.5
def chime(at, f=1568, g=0.1): add(tone(f, 0.5, 0.002, 0.15)*g, at); add(tone(f*1.5, 0.5, 0.002, 0.15)*g*0.6, at+0.05)
def crumple(at, d=0.6):
    k = at
    while k < at+d: add(HP(noise(0.03), 2000)*env(int(0.03*SR), 0.001, 0.008)*rng.uniform(0.2, 0.5), k, 1, rng.uniform(-0.5, 0.5)); k += rng.uniform(0.015, 0.04)


B = 0.5
def clap(g=0.5):
    d = 0.18; n = int(d*SR); out = np.zeros(n)
    for i in range(3): out[i*300:] += (HP(noise(d), 1000)*env(n, 0.001, 0.03))[:n-i*300]
    return out/3*g
def pluck(f, g=0.08): return tone(f, 0.35, 0.002, 0.09)*g + tone(f*2, 0.35, 0.002, 0.05)*g*0.3
def tw(at):
    pan = rng.uniform(-0.3, 0.3); add(HP(noise(0.03), 2000)*env(int(0.03*SR), 0.0005, 0.008)*0.6, at, 1, pan); add(LP(noise(0.05), 400)*env(int(0.05*SR), 0.001, 0.02)*0.5, at, 1, pan)
def hit(at, g=0.9): add(sweep(130, 38, 0.6)*env(int(0.6*SR), 0.001, 0.18), at, g); add(HP(noise(0.2), 1200)*env(int(0.2*SR), 0.001, 0.05)*0.5, at, g)
bassline = [55, 55, 65.41, 49]
# B0–B7 : machine à écrire, un mot par temps, kick feutré
for b in range(6): tw(b*B); tw(b*B+0.07); add(kick(0.35), b*B)
for b in (6, 7): add(kick(0.45), b*B)
add(tone(2093, 0.6, 0.002, 0.2)*0.06, 3.0)   # « ding » de fin de ligne
add(HP(noise(0.25), 2500)*np.linspace(0, 1, int(0.25*SR))*0.3 + sweep(400, 3000, 0.25)*0.06, 3.5)   # le trait barre tout
# B8–B10 : le drop
for b in range(8, 11):
    add(kick(0.9), b*B); add(bass(bassline[0]*2, 0.45, 0.3), b*B)
    if b % 2: add(clap(0.6), b*B)
    for h in range(2): add(hat(0.12), b*B + h*0.25)
hit(4.0, 0.7)
# B11 : un temps de silence total
cut_at(5.5)
# B12–B17 : le recruteur… SON nom, SES mots
for b in range(12, 18):
    add(kick(0.75), b*B); add(hat(0.1), b*B+0.25)
    if b % 2: add(clap(0.45), b*B)
    add(bass(bassline[(b//2) % 4]*2, 0.45, 0.22), b*B)
add(sweep(200, 2400, 1.0)*np.linspace(0, 1, int(1.0*SR))**2*0.1, 8.0)
hit(7.0, 0.75); hit(8.0, 0.75)
# B18–B37 : les 3 étapes, la lettre, une offre = sa lettre (groove complet)
for b in range(18, 38):
    add(kick(0.85), b*B)
    if b % 2: add(clap(0.55), b*B)
    for h in range(4): add(hat(0.13 if h % 2 else 0.07), b*B + h*0.125, 1, 0.3 if h % 2 else -0.3)
    add(bass(bassline[(b//2) % 4]*2, 0.45, 0.28), b*B)
    if b % 2 == 0: add(pluck([440, 523.2, 659.3, 523.2][(b//2) % 4]), b*B + 0.25, 1, 0.3)
for b, f in ((18, 523.2), (22, 659.3), (26, 784)): hit(b*B, 0.5); add(pluck(f*2, 0.14), b*B)   # 1 · 2 · 3
whoosh(9.2, 0.45, 0.3, 300, 3000); add(LP(noise(0.15), 600)*env(int(0.15*SR), 0.002, 0.05)*0.5, 9.75); add(pluck(1568, 0.1), 9.8)   # le CV tombe ✓
for i in range(14): add(click(0.35), 11.5 + i*0.025)   # le lien se colle
add(click(1.0), 12.0); add(pluck(1318.5, 0.12), 12.3); add(tone(1568, 0.5, 0.002, 0.15)*0.12, 12.5); add(tone(2349, 0.5, 0.002, 0.15)*0.07, 12.56)   # site + logo trouvés
add(click(1.0), 13.5); add(sweep(200, 1600, 1.3)*np.linspace(0, 1, int(1.3*SR))*0.08, 13.5)   # générer, la jauge monte
add(tone(1568, 0.6, 0.002, 0.2)*0.12, 14.8); add(tone(2093, 0.6, 0.002, 0.2)*0.08, 14.86)   # lettre prête
whoosh(14.85, 0.35, 0.4, 400, 6000); hit(15.0, 0.7)
for b in range(34, 38): add(sweep(800, 3000, 0.08)*env(int(0.08*SR), 0.001, 0.03)*0.15, b*B); add(click(0.6), b*B)
# B38 → fin
cut_at(18.98); hit(19.0, 0.9)
d = 24.0-19.0; x = np.arange(int(d*SR))/SR
chord = sum(np.sin(2*np.pi*f*x)+0.3*np.sin(2*np.pi*2*f*x) for f in [110, 220, 277.2, 329.6, 440])
add(LP(chord, 2000)*np.minimum(1, x/0.05)*np.minimum(1, (d-x)/0.9)*0.07, 19.0)
for b in range(39, 47):
    add(kick(0.7), b*B); add(hat(0.1), b*B+0.25)
    if b % 2: add(clap(0.45), b*B)
for b in (40, 41): add(sweep(110, 45, 0.4)*env(int(0.4*SR), 0.001, 0.12)*0.6, b*B)
add(click(0.8), 21.0); add(tone(880, 0.3, 0.002, 0.1)*0.08, 21.5); add(tone(1318.5, 0.5, 0.002, 0.2)*0.08, 22.0)
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.4)/np.tanh(1.4); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
with wave.open("public/audio/pub.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
