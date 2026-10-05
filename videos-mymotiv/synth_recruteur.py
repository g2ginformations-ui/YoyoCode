# Bande son du concept « Même CV. Pas la même réponse. » (30 s), calée sur les temps de src/Recruteur.tsx.
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
# 0–3 s : accroche
pad(0.0, 3.0, [220, 261.6, 329.6], 0.035); beat(0.0, 3.0, False, 0.5)
slam(0.4, 0.5); whoosh(1.0, 0.7, 0.3); chime(1.75, 1318.5, 0.12)
# 3–4,6 s : Léo envoie un CV seul (terne)
cut_at(2.98); whoosh(2.9, 0.35, 0.3)
pad(3.0, 1.6, [110, 130.8, 164.8], 0.045); beat(3.0, 4.6, False, 0.45, (55, 55, 49, 49))
add(click(0.9), 3.8); whoosh(3.9, 0.6, 0.25, 200, 1500); slam(3.15, 0.4)
# 4,6–7 s : Inès, téléphone, lettre, envoi (lumineux)
cut_at(4.58); add(sweep(150, 45, 0.5)*env(int(0.5*SR), 0.002, 0.15), 4.6, 0.6)
pad(4.6, 2.4, [220, 277.2, 329.6, 440], 0.035); beat(4.6, 7.0, True, 0.7)
add(click(1.0), 5.05); add(sweep(300, 2400, 0.35)*env(int(0.35*SR), 0.01, 0.15)*0.18, 5.5); chime(5.6, 1568, 0.08)
whoosh(6.1, 0.5, 0.3, 400, 5000); add(click(0.9), 6.75); add(sweep(500, 3000, 0.3)*np.linspace(0, 1, int(0.3*SR))*0.12, 6.8)
slam(4.75, 0.45)
# 7–10 s : la boîte mail de Mme Roche (suspense)
cut_at(6.98); whoosh(6.9, 0.4, 0.3)
pad(7.0, 3.0, [196, 233.1, 293.7], 0.04); beat(7.0, 10.0, False, 0.6, (49, 49, 58.3, 58.3))
for at in (7.6, 8.2): chime(at, 1046.5, 0.1); add(click(0.4), at)
slam(7.2, 0.45)
k = 8.6
while k < 10.0: add(click(0.12), k); k += 0.5
# 10 s : ARRÊT SUR IMAGE — le vinyle se raye, silence tendu
cut_at(9.99)
scr = np.sin(2*np.pi*np.cumsum(np.concatenate([np.geomspace(900, 120, int(0.12*SR)), np.geomspace(120, 700, int(0.1*SR))]))/SR)
add((LP(scr, 3000) + HP(noise(0.22), 1500)*0.6)*env(len(scr), 0.001, 0.12)*0.6, 10.0)
x = np.arange(int(1.0*SR))/SR; add(np.sin(2*np.pi*55*x)*np.minimum(1, x/0.1)*np.minimum(1, (1-x)/0.1)*0.08 + HP(noise(1.0), 6000)*0.01, 10.05)
slam(10.05, 0.6)
# 11–14 s : le CV de Léo part à la corbeille
add(sweep(150, 45, 0.3)*env(int(0.3*SR), 0.002, 0.08), 11.0, 0.5)
beat(11.0, 14.0, False, 0.55, (49, 49, 46.2, 46.2)); pad(11.0, 3.0, [196, 233.1, 293.7], 0.03)
add(click(0.9), 11.3); slam(11.5, 0.4)
crumple(12.4, 0.8); whoosh(12.6, 0.6, 0.25, 300, 2500)
d = 0.4; xx = np.arange(int(d*SR))/SR; add(np.sin(2*np.pi*np.cumsum(np.geomspace(160, 60, len(xx)))/SR)*np.exp(-xx/0.07)*0.7 + LP(noise(d), 900)*np.exp(-xx/0.03)*0.4, 13.2)
# 14–18 s : la lettre d'Inès, les mots-clés s'allument, « Répondre »
cut_at(13.98); add(sweep(150, 45, 0.5)*env(int(0.5*SR), 0.002, 0.15), 14.0, 0.5)
pad(14.0, 4.0, [220, 277.2, 329.6, 440], 0.04); beat(14.0, 18.0, True, 0.7)
add(click(1.0), 14.2); slam(14.5, 0.45)
for i in range(4): chime(T_scan := 15.0 + (i+1)*1.6/5, 1318.5*2**(i/6), 0.09)
add(click(1.0), 17.4); add(sweep(400, 1600, 0.25)*env(int(0.25*SR), 0.002, 0.1)*0.2, 17.45)
# 18–21 s : le mail s'écrit, zoom sur 15h30
k = 18.3
while k < 19.3: add(click(rng.uniform(0.12, 0.22)), k, 1, rng.uniform(-0.4, 0.4)); k += rng.uniform(0.035, 0.06)
add(sweep(200, 2600, 0.8)*np.linspace(0, 1, int(0.8*SR))**2*0.16, 19.5); whoosh(19.6, 0.7, 0.35, 400, 6000)
add(sweep(120, 45, 0.4)*env(int(0.4*SR), 0.001, 0.12), 20.3, 0.8); chime(20.32, 1568, 0.16); chime(20.45, 2093, 0.1)
# 21–23 s : les regrets de Léo (descente triste)
cut_at(20.98); pad(21.0, 2.0, [110, 130.8, 164.8], 0.05)
for i, f in enumerate([392, 370, 349, 330]): add(LP(np.sign(np.sin(2*np.pi*f*np.arange(int(0.35*SR))/SR)), 1500)*env(int(0.35*SR), 0.01, 0.25)*0.05, 21.4+i*0.32)
# 23–27 s : entretien, poignée de main, contrat, signature, tampon
cut_at(22.98); pad(23.0, 4.0, [261.6, 329.6, 392, 523.2], 0.04); beat(23.0, 26.6, True, 0.65)
chime(23.1, 1318.5, 0.1); add(HP(noise(0.08), 1500)*env(int(0.08*SR), 0.001, 0.02)*0.5, 23.35)
whoosh(24.2, 1.4, 0.15, 200, 2000)
add(LP(HP(noise(0.6), 2000), 7000)*np.linspace(0.3, 1, int(0.6*SR))*0.12, 26.0)
d = 0.5; xx = np.arange(int(d*SR))/SR; add(np.sin(2*np.pi*np.cumsum(np.geomspace(120, 40, len(xx)))/SR)*np.exp(-xx/0.1)*1.0 + HP(noise(d), 1500)*np.exp(-xx/0.015)*0.6, 26.75, 0.9)
# 27,2–30 s : fin
d = 30.0-27.2; x = np.arange(int(d*SR))/SR
chord = sum(np.sin(2*np.pi*f*x)+0.3*np.sin(2*np.pi*2*f*x) for f in [110, 220, 277.2, 329.6, 440])
add(LP(chord, 2000)*np.minimum(1, x/0.2)*np.minimum(1, (d-x)/0.8)*0.065, 27.2)
slam(27.4, 0.8)
b = 27.4
while b < 29.6: add(kick(0.7), b); add(hat(0.12), b+0.25); (add(snare(0.38), b) if round((b-27.4)/0.5) % 2 else None); b += 0.5
for i in range(25): add(tone(rng.uniform(2500, 6500), 0.08, 0.001, 0.03), 27.3+rng.uniform(0, 0.6), 0.05, rng.uniform(-0.8, 0.8))
for tb in (28.4, 29.45): add(tone(880, 0.3, 0.002, 0.1)*0.06, tb)
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.4)/np.tanh(1.4); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
with wave.open("public/audio/recruteur.wav", "wb") as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print("audio ok")
