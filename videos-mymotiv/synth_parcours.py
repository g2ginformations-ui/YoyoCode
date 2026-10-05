# Bande son du concept « Le parcours d'Inès » (36 s), calée sur les temps de src/Parcours.tsx.
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 36.0; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(5)
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

# 0–3,2 s : soirée, vibration, message de maman, tap sur le lien
pad(0.0, 3.2, [174.6, 220, 261.6], 0.035)
buzz(0.3); add(tone(1046.5, 0.3, 0.002, 0.1)*0.08, 0.4); add(tone(1318.5, 0.3, 0.002, 0.1)*0.06, 0.48)
for b in np.arange(0.8, 3.2, 0.5): add(kick(0.4), b); add(hat(0.06), b+0.25)
add(click(0.9), 2.6)
# 3,2–5,2 s : le logo sort du téléphone, tourne, portail
add(sweep(200, 2400, 0.9)*np.linspace(0, 1, int(0.9*SR))**2*0.14, 3.2); whoosh(3.25, 0.8, 0.35, 400, 6000)
for i in range(20): add(tone(rng.uniform(2000, 6000), 0.08, 0.001, 0.03), 3.4+rng.uniform(0, 0.8), 0.05, rng.uniform(-0.8, 0.8))
slam(3.45, 0.5); whoosh(4.4, 0.8, 0.45, 150, 3000); add(sweep(60, 30, 1.0)*env(int(1.0*SR), 0.05, 0.4), 4.6, 0.5)
# 5,2–16,2 s : les 3 étapes (rythme qui démarre)
cut_at(5.18); add(sweep(150, 45, 0.5)*env(int(0.5*SR), 0.002, 0.15), 5.2, 0.6)
pad(5.2, 11.0, [220, 277.2, 329.6, 440], 0.035); beat(5.2, 16.2, True, 0.7)
for at in (5.3, 9.1, 13.1): slam(at, 0.45); chime(at+0.05, 1046.5, 0.07)
add(click(1.0), 6.2); add(LP(HP(noise(0.2), 600), 4000)*env(int(0.2*SR), 0.005, 0.08)*0.3, 6.5); chime(7.0, 1568, 0.1)
for i in range(6): add(sweep(900+i*200, 3000, 0.06)*env(int(0.06*SR), 0.001, 0.03)*0.1, 9.4+i*0.08, 1, 0.5-i*0.2)
add(click(1.0), 10.5); chime(11.6, 1318.5, 0.11); chime(11.75, 1975.5, 0.07)
add(click(1.0), 13.4); add(sweep(200, 1200, 1.9)*np.linspace(0, 1, int(1.9*SR))*0.06, 13.5)
add(sweep(300, 2400, 0.35)*env(int(0.35*SR), 0.01, 0.15)*0.2, 15.5); chime(15.6, 1568, 0.12)
# 16,2 s : arrêt sur image (vinyle) puis zoom sur le logo
cut_at(16.19)
scr = np.sin(2*np.pi*np.cumsum(np.concatenate([np.geomspace(900, 120, int(0.12*SR)), np.geomspace(120, 700, int(0.1*SR))]))/SR)
add((LP(scr, 3000) + HP(noise(0.22), 1500)*0.6)*env(len(scr), 0.001, 0.12)*0.6, 16.2)
add(sweep(150, 2000, 0.45)*np.linspace(0, 1, int(0.45*SR))*0.12, 16.25); chime(16.7, 1318.5, 0.14); slam(16.35, 0.55)
x = np.arange(int(1.5*SR))/SR; add(np.sin(2*np.pi*110*x)*np.minimum(1, x/0.1)*np.minimum(1, (1.5-x)/0.2)*0.05, 16.4)
# 18–23,5 s : 3 offres = 3 lettres, postuler
cut_at(17.98); add(sweep(150, 45, 0.5)*env(int(0.5*SR), 0.002, 0.15), 18.0, 0.6)
pad(18.0, 5.5, [220, 277.2, 329.6, 440], 0.035); beat(18.0, 23.5, True, 0.7)
for i in range(3):
    t0 = 18.1+i*0.75; whoosh(t0, 0.3, 0.3, 500, 5000)
    d = 0.4; xx = np.arange(int(d*SR))/SR; add((np.sin(2*np.pi*1130*xx)*np.exp(-xx/0.08)*0.4 + HP(noise(d), 2000)*np.exp(-xx/0.01)*0.6), t0+0.25, 0.6)
slam(18.15, 0.45); slam(21.1, 0.5)
add(click(1.0), 22.6); add(sweep(500, 3000, 0.3)*np.linspace(0, 1, int(0.3*SR))*0.14, 22.7); whoosh(22.9, 0.6, 0.3, 400, 5000)
# 23,5–25,5 s : la nuit passe
cut_at(23.48); x = np.arange(int(2.0*SR))/SR
night = LP(sum(np.sin(2*np.pi*f*x) for f in [130.8, 164.8, 196, 246.9]), 1200)*np.minimum(1, x/0.3)*np.minimum(1, (2.0-x)/0.3)*0.05; add(night, 23.5)
for i in range(8): add(tone(1046.5*2**(i/8), 0.25, 0.005, 0.08)*0.04, 23.7+i*0.2, 1, 0.5-i*0.12)
add(sweep(200, 1600, 1.2)*np.linspace(0, 1, int(1.2*SR))*0.05, 24.3)
# 25,5–29,6 s : appel manqué, le mail, zoom, saut de joie
cut_at(25.48); pad(25.5, 4.1, [220, 277.2, 329.6], 0.03)
for i in range(3): ring(25.8+i*0.12, 0.1); buzz(25.8)
add(tone(523.2, 0.25, 0.005, 0.1)*0.08, 26.15); add(tone(392, 0.3, 0.005, 0.12)*0.08, 26.3)   # « appel manqué »
chime(26.5, 1046.5, 0.12)
add(sweep(200, 2600, 0.7)*np.linspace(0, 1, int(0.7*SR))**2*0.15, 27.4); whoosh(27.5, 0.6, 0.35, 400, 6000)
add(sweep(120, 45, 0.4)*env(int(0.4*SR), 0.001, 0.12), 28.1, 0.8); chime(28.12, 1568, 0.15); chime(28.25, 2093, 0.1)
for i in range(30): add(HP(noise(0.03), 3000)*env(int(0.03*SR), 0.001, 0.01)*0.15, 28.5+rng.uniform(0, 0.9), 1, rng.uniform(-1, 1))
beat(28.5, 29.6, True, 0.7)
# 29,6–33,2 s : recrutée, contrat, réponse à maman
cut_at(29.58); pad(29.6, 3.6, [261.6, 329.6, 392, 523.2], 0.04); beat(29.6, 33.2, True, 0.65)
chime(29.7, 1318.5, 0.1); add(HP(noise(0.08), 1500)*env(int(0.08*SR), 0.001, 0.02)*0.5, 29.95)
add(LP(HP(noise(0.5), 2000), 7000)*np.linspace(0.3, 1, int(0.5*SR))*0.12, 30.9)
d = 0.5; xx = np.arange(int(d*SR))/SR; add(np.sin(2*np.pi*np.cumsum(np.geomspace(120, 40, len(xx)))/SR)*np.exp(-xx/0.1)*1.0 + HP(noise(d), 1500)*np.exp(-xx/0.015)*0.6, 31.65, 0.9)
add(tone(1200, 0.08, 0.001, 0.03)*0.12, 32.25); chime(32.7, 1568, 0.08)
# 33,2–36 s : fin
d = 36.0-33.2; x = np.arange(int(d*SR))/SR
chord = sum(np.sin(2*np.pi*f*x)+0.3*np.sin(2*np.pi*2*f*x) for f in [110, 220, 277.2, 329.6, 440])
add(LP(chord, 2000)*np.minimum(1, x/0.2)*np.minimum(1, (d-x)/0.8)*0.065, 33.2)
slam(33.35, 0.8)
b = 33.4
while b < 35.6: add(kick(0.7), b); add(hat(0.12), b+0.25); (add(snare(0.38), b) if round((b-33.4)/0.5) % 2 else None); b += 0.5
for i in range(25): add(tone(rng.uniform(2500, 6500), 0.08, 0.001, 0.03), 33.3+rng.uniform(0, 0.6), 0.05, rng.uniform(-0.8, 0.8))
for tb in (34.4, 35.45): add(tone(880, 0.3, 0.002, 0.1)*0.06, tb)
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.4)/np.tanh(1.4); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
with wave.open("public/audio/parcours.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
