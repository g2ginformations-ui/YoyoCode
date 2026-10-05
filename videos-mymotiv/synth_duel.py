# Bande son du concept « Même offre. Pas le même destin. » (30 s), calée sur les temps de src/Duel.tsx.
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 30.0; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(5)
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
# 0–3 s : accroche, deux candidats (rythme léger, neutre)
pad(0.0, 3.0, [220, 261.6, 329.6], 0.035)
for b in np.arange(0.0, 3.0, 0.5): add(kick(0.5), b); add(hat(0.08), b+0.25)
slam(0.6, 0.5); ding(0.15, 0.06)
# 3–9 s : Léo — mineur, gris, frappe, Ctrl+C/V, envois, horloge, attente
whoosh(2.9, 0.45, 0.3)
pad(3.0, 6.0, [110, 130.8, 164.8], 0.045)
for b in np.arange(3.0, 6.5, 0.5): add(kick(0.45), b); add(hat(0.06), b+0.25)
k = 3.2
while k < 6.3: add(click(rng.uniform(0.12, 0.22)), k, 1, rng.uniform(-0.4, 0.4)); k += rng.uniform(0.06, 0.1)
for i in range(11): add(LP(HP(noise(0.12), 600), 3000)*env(int(0.12*SR), 0.01, 0.05)*0.2, 3.6+i*0.245, 1, 0.5)
slam(3.45, 0.45)
cut = int(6.45*SR); fd = int(0.006*SR)
k = 6.5
while k < 9.0: add(click(0.25)*0.6, k, 1, -0.3); k += 0.5   # tic-tac
for i in range(6): add(LP(HP(noise(0.2), 1500), 6000)*env(int(0.2*SR), 0.01, 0.08)*0.18, 6.6+i*0.32, 1, 0.5)
add(tone(220, 1.2, 0.05, 0.6)*0.06, 6.6); slam(6.6, 0.4)
add(tone(1200, 0.08, 0.001, 0.03)*0.1, 7.5)   # message envoyé
# 9 s : coupure franche → Inès (majeur, rose, rythme qui part)
for ch in (L, R): ch[int(8.98*SR):int(8.98*SR)+fd] *= np.linspace(1, 0, fd); ch[int(8.98*SR)+fd:] = 0
add(sweep(170, 40, 0.8)*env(int(0.8*SR), 0.002, 0.25), 9.0, 0.8); add(HP(noise(0.3), 3000)*env(int(0.3*SR), 0.001, 0.08)*0.4, 9.0)
notes = [55, 69.3, 82.4, 61.7]
b = 9.0
while b < 16.95:
    beat = round((b-9.0)/0.5)
    add(kick(0.8), b)
    if beat % 2 == 1: add(snare(0.45), b)
    for h in range(4): add(hat(0.14 if h % 2 else 0.08), b+h*0.125, 1, 0.3 if h % 2 else -0.3)
    add(bass(notes[(beat//2) % 4]*2, 0.48, 0.26), b)
    b += 0.5
pad(9.0, 8.0, [220, 277.2, 329.6, 440], 0.035)
slam(9.2, 0.5); whoosh(10.15, 0.5, 0.35)
for i in range(5): add(sweep(900+i*200, 3000, 0.06)*env(int(0.06*SR), 0.001, 0.03)*0.1, 10.9+i*0.08, 1, 0.5-i*0.2)
add(click(1.0), 11.7); add(sweep(150, 60, 0.2)*env(int(0.2*SR), 0.001, 0.05), 11.7, 0.5)
add(sweep(300, 2400, 0.35)*env(int(0.35*SR), 0.01, 0.15)*0.2, 12.35); ding(12.55, 0.1)
slam(13.6, 0.5)
for i in range(3):
    t0 = 13.55+i*0.7; whoosh(t0, 0.3, 0.3, 500, 5000)
    d = 0.4; xx = np.arange(int(d*SR))/SR; add((np.sin(2*np.pi*1130*xx)*np.exp(-xx/0.08)*0.4 + HP(noise(d), 2000)*np.exp(-xx/0.01)*0.6), t0+0.25, 0.6)
# 17–20 s : les appels pleuvent
for ch in (L, R): ch[int(16.98*SR):int(16.98*SR)+fd] *= np.linspace(1, 0, fd); ch[int(16.98*SR)+fd:] = 0
pad(17.0, 3.0, [261.6, 329.6, 392, 523.2], 0.04)
for b in np.arange(17.0, 20.0, 0.5): add(kick(0.75), b); add(hat(0.12), b+0.25); add(snare(0.35), b+0.5) if round((b-17)/0.5) % 2 == 0 else None
for i in range(4): t0 = 17.3+i*0.6; ring(t0); buzz(t0); ding(t0+0.05, 0.05)
slam(17.2, 0.5)
# 20–23 s : les portes s'ouvrent (boum + onde)
for i in range(3):
    tc = 20.3+i*0.95; whoosh(tc-0.25, 0.3, 0.3, 300, 4000)
    add(sweep(150, 35, 0.7)*env(int(0.7*SR), 0.002, 0.22), tc, 0.9); add(LP(noise(0.5), 2500)*env(int(0.5*SR), 0.001, 0.1), tc, 0.5)
    add(HP(noise(0.4), 3000)*env(int(0.4*SR), 0.001, 0.1)*0.2, tc+0.05, 1, 0.4)
for b in np.arange(20.0, 23.0, 0.25): add(hat(0.1), b, 1, 0.2)
slam(20.35, 0.5)
# 23–25 s : le témoignage (accord lumineux, compteur)
for ch in (L, R): ch[int(22.98*SR):int(22.98*SR)+fd] *= np.linspace(1, 0, fd); ch[int(22.98*SR)+fd:] = 0
pad(23.0, 2.1, [220, 277.2, 329.6, 440], 0.05)
for i in range(11): add(tone(600+i*40, 0.05, 0.001, 0.02)*0.08, 23.3+i*0.055)
for i in range(7): add(tone(900+i*60, 0.06, 0.001, 0.02)*0.1, 23.6+i*0.085)
ding(24.25, 0.14)
# 25–30 s : contrat signé, puis triomphe + bouton
add(LP(HP(noise(0.55), 2000), 7000)*np.linspace(0.3, 1, int(0.55*SR))*0.1, 25.35)   # stylo
d = 0.5; xx = np.arange(int(d*SR))/SR; add(np.sin(2*np.pi*np.cumsum(np.geomspace(120, 40, len(xx)))/SR)*np.exp(-xx/0.1)*1.0 + HP(noise(d), 1500)*np.exp(-xx/0.015)*0.6, 25.9, 0.9)   # tampon
d = 30.0-26.3; x = np.arange(int(d*SR))/SR
chord = sum(np.sin(2*np.pi*f*x)+0.3*np.sin(2*np.pi*2*f*x) for f in [110, 220, 277.2, 329.6, 440])
add(LP(chord, 2000)*np.minimum(1, x/0.2)*np.minimum(1, (d-x)/0.8)*0.065, 26.3)
slam(26.55, 0.8)
b = 26.6
while b < 29.6: add(kick(0.7), b); add(hat(0.12), b+0.25); (add(snare(0.38), b) if round((b-26.6)/0.5) % 2 else None); b += 0.5
for i in range(25): add(tone(rng.uniform(2500, 6500), 0.08, 0.001, 0.03), 26.4+rng.uniform(0, 0.6), 0.05, rng.uniform(-0.8, 0.8))
for tb in (27.6, 28.65): add(tone(880, 0.3, 0.002, 0.1)*0.06, tb)
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.4)/np.tanh(1.4); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
with wave.open("public/audio/duel.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
