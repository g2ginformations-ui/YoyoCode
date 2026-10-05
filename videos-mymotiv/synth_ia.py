# Bande son du concept publicité « IA × humain » (25 s), calée sur src/IAHumain.tsx.
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 25.0; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(5)
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

def blip(at, f, g=0.06, d=0.06): add(tone(f, d, 0.001, d/3)*g, at, 1, rng.uniform(-0.7, 0.7))
def glitch_burst(at, d=0.25, g=0.35):
    n = noise(d); n = np.repeat(np.round(n[::40]*2)/2, 40)[:len(n)]
    add(LP(n, 5000)*env(len(n), 0.001, d*0.4)*g, at)
    for i in range(6): blip(at + i*0.03, rng.uniform(800, 4000), 0.05, 0.03)
def sub_drop(at, g=0.9): add(sweep(90, 28, 1.4)*env(int(1.4*SR), 0.003, 0.5), at, g)
def beatline(t0, t1, g=0.8, arp=True, warm=False):
    b = t0; k = 0
    while b < t1 - 1e-6:
        add(kick(g), b)
        if k % 2: add(clap(0.45 if not warm else 0.3), b)
        for h in range(4): add(hat(0.11 if h % 2 else 0.06), b + h*0.125, 1, 0.3 if h % 2 else -0.3)
        add(bass(([55, 55, 65.41, 49] if not warm else [65.41, 73.4, 82.4, 61.7])[(k//2) % 4]*2, 0.45, 0.24), b)
        if arp:
            for j in range(4): add(tone(([440, 659.3, 880, 659.3] if not warm else [523.2, 659.3, 784, 659.3])[j]*(1 if k % 4 < 2 else 1.122), 0.12, 0.001, 0.04)*0.045, b + j*0.125, 1, 0.4 if j % 2 else -0.4)
        b += 0.5; k += 1
# 0–3 s : démarrage du cœur IA
x = np.arange(int(3.0*SR))/SR
drone = (np.sin(2*np.pi*41.2*x) + 0.5*np.sin(2*np.pi*82.4*x*(1+0.002*x)))*np.minimum(1, x/0.8)*np.minimum(1, (3.0-x)/0.2)*0.12; add(drone, 0.0)
add(HP(noise(0.35), 3000)*env(int(0.35*SR), 0.001, 0.1)*0.35 + sweep(500, 6000, 0.35)*env(int(0.35*SR), 0.001, 0.1)*0.08, 0.1)
add(sweep(60, 900, 1.0)*np.linspace(0, 1, int(1.0*SR))**2*0.1, 0.3); whoosh(0.4, 0.9, 0.3, 200, 4000)
for i in range(40): blip(0.5 + rng.uniform(0, 2.0), rng.uniform(1500, 6000), 0.04, 0.05)
glitch_burst(1.8, 0.3, 0.4); add(sweep(110, 40, 0.6)*env(int(0.6*SR), 0.001, 0.15), 1.8, 0.7)
for i in range(20): add(tone(rng.uniform(2500, 7000), 0.1, 0.001, 0.04), 1.85 + rng.uniform(0, 0.6), 0.04, rng.uniform(-0.8, 0.8))
# 3–5 s : battement de cœur (moniteur) puis signature humaine (accord chaleureux)
glitch_burst(2.95, 0.2, 0.3)
for i, b in enumerate([3.12, 3.37, 3.62, 3.87]):
    d = 0.18; xx = np.arange(int(d*SR))/SR; th = np.sin(2*np.pi*55*xx)*np.exp(-xx/0.05)
    add(th, b, 0.8); add(th, b + 0.11, 0.5); blip(b, 1000, 0.08, 0.12)
x = np.arange(int(1.6*SR))/SR
warmc = LP(sum(np.sin(2*np.pi*f*x) + 0.3*np.sin(2*np.pi*2*f*x) for f in [261.6, 329.6, 392, 523.2]), 2200)*np.minimum(1, x/0.08)*np.exp(-x/0.9)*0.06; add(warmc, 4.0, 1, -0.2); add(warmc, 4.01, 1, 0.2)
add(tone(1046.5, 1.0, 0.003, 0.4)*0.07, 4.05); add(tone(1568, 1.0, 0.003, 0.4)*0.05, 4.2)
# 5–10 s : ① le CV (rythme qui démarre, panneau, scan laser, extraction)
glitch_burst(4.95, 0.25, 0.35); sub_drop(5.0, 0.6); beatline(5.0, 15.0)
whoosh(5.0, 0.5, 0.35, 300, 5000); whoosh(5.35, 0.5, 0.3, 500, 6000)
d = 1.4; xx = np.arange(int(d*SR))/SR; scan = HP(noise(d), 2000)*(0.5+0.5*np.sin(2*np.pi*24*xx))*0.08 + np.sin(2*np.pi*np.cumsum(np.linspace(600, 1800, len(xx)))/SR)*0.04; add(scan, 6.0, 1, 0.2)
for i in range(50): blip(7.6 + i*0.03, 800 + i*60, 0.035, 0.03)
add(tone(1318.5, 0.6, 0.002, 0.2)*0.12, 9.3); add(tone(1975.5, 0.6, 0.002, 0.2)*0.08, 9.36)
# 10–15 s : ② l'offre (frappe brouillée, clic, sonar, logo matérialisé, mots-clés)
glitch_burst(9.95, 0.25, 0.4); add(sweep(150, 45, 0.4)*env(int(0.4*SR), 0.002, 0.12), 10.0, 0.6)
k = 10.5
while k < 11.5: add(click(0.25), k, 1, rng.uniform(-0.5, 0.5)); blip(k, rng.uniform(2000, 5000), 0.025, 0.02); k += 0.035
add(click(1.0), 11.9); add(sweep(200, 60, 0.25)*env(int(0.25*SR), 0.001, 0.07), 11.9, 0.6)
for i in range(3): add(tone(880, 0.4, 0.002, 0.15)*0.06*(1 - i*0.25), 12.0 + i*0.2, 1, 0.3*(i-1))
add(sweep(200, 3000, 0.5)*np.linspace(0, 1, int(0.5*SR))**2*0.15, 12.4); add(HP(noise(0.5), 4000)*np.linspace(0, 1, int(0.5*SR))*0.12, 12.4)
add(sweep(130, 40, 0.5)*env(int(0.5*SR), 0.001, 0.14), 12.9, 0.7); add(tone(1568, 0.8, 0.002, 0.3)*0.12, 12.9); add(tone(2349, 0.8, 0.002, 0.3)*0.07, 12.95)
for i in range(4): blip(13.3 + i*0.25, 880*2**(i*3/12), 0.12, 0.15)
# 15–18,5 s : ③ générer (montée, impact, surchauffe, matérialisation, logo)
glitch_burst(14.95, 0.25, 0.4)
add(sweep(150, 2500, 0.6)*np.linspace(0, 1, int(0.6*SR))**2*0.18, 15.0); add(HP(noise(0.6), 3000)*np.linspace(0, 1, int(0.6*SR))**3*0.25, 15.0)
cut_at(15.58)
d = 1.2; xx = np.arange(int(d*SR))/SR
impact = np.sin(2*np.pi*np.cumsum(np.geomspace(140, 30, len(xx)))/SR)*np.exp(-xx/0.35)*1.0 + LP(noise(d), 3000)*np.exp(-xx/0.12)*0.7 + HP(noise(d), 5000)*np.exp(-xx/0.3)*0.2
add(impact, 15.6, 1.0)
for i in range(8): glitch_burst(15.75 + i*0.05, 0.05, 0.2)
beatline(16.1, 18.5, 0.85)
for i in range(70): add(tone(rng.uniform(2000, 7000), 0.06, 0.001, 0.02), 16.1 + rng.uniform(0, 1.8), 0.035, rng.uniform(-0.9, 0.9))
k = 16.5
while k < 17.6: add(click(0.15), k, 1, rng.uniform(-0.4, 0.4)); k += 0.045
d = 0.6; xx = np.arange(int(d*SR))/SR
clack = sum(np.sin(2*np.pi*f*xx)*np.exp(-xx/dd)*a for f, dd, a in [(1130, 0.12, 0.5), (2710, 0.08, 0.35), (4390, 0.05, 0.25)]) + HP(noise(d), 2000)*np.exp(-xx/0.012)*0.8
add(clack, 17.6, 0.7)
# 18,5–21,5 s : la touche humaine (son plus chaud)
cut_at(18.48); whoosh(18.4, 0.4, 0.25)
x = np.arange(int(3.0*SR))/SR
pad2 = LP(sum(np.sin(2*np.pi*f*x) + 0.25*np.sin(2*np.pi*2.003*f*x) for f in [261.6, 329.6, 392, 493.9]), 1800)*np.minimum(1, x/0.3)*np.minimum(1, (3.0-x)/0.2)*0.05
add(pad2, 18.5, 1, -0.2); add(pad2, 18.515, 1, 0.2)
beatline(18.5, 21.5, 0.6, True, True)
add(tone(1318.5, 0.5, 0.002, 0.15)*0.1, 18.9); add(tone(1760, 0.5, 0.002, 0.15)*0.07, 18.96)
add(LP(HP(noise(0.5), 1500), 6000)*np.sin(np.linspace(0, np.pi, int(0.5*SR)))*0.18, 19.6)   # le trait de la coche
for f, dt in ((523.2, 0), (659.3, 0.08), (784, 0.16), (1046.5, 0.24)): add((tone(f, 1.2, 0.004, 0.5) + tone(f*2, 1.2, 0.004, 0.3)*0.3)*0.07, 20.3 + dt)
# 21,5–25 s : fin
glitch_burst(21.45, 0.3, 0.45); add(sweep(130, 38, 0.8)*env(int(0.8*SR), 0.001, 0.22), 21.5, 0.9)
d = 25.0-21.5; x = np.arange(int(d*SR))/SR
chord = sum(np.sin(2*np.pi*f*x)+0.3*np.sin(2*np.pi*2*f*x) for f in [110, 220, 277.2, 329.6, 440])
add(LP(chord, 2200)*np.minimum(1, x/0.05)*np.minimum(1, (d-x)/0.9)*0.07, 21.5)
for i in range(25): add(tone(rng.uniform(2500, 7000), 0.1, 0.001, 0.04), 21.5 + rng.uniform(0, 0.8), 0.04, rng.uniform(-0.8, 0.8))
beatline(22.0, 24.5, 0.7, False)
add(sweep(110, 45, 0.4)*env(int(0.4*SR), 0.001, 0.12)*0.6, 21.9); add(click(0.8), 22.4); add(tone(880, 0.3, 0.002, 0.1)*0.08, 22.9); add(tone(1318.5, 0.5, 0.002, 0.2)*0.08, 23.4)
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.4)/np.tanh(1.4); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
with wave.open("public/audio/ia-humain.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
