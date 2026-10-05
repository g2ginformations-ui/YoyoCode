# Mixage de « MyMotiv expliqué par sa mascotte » : voix nettoyée + musique qui s'efface sous la voix + bruitages calés.
import wave
import numpy as np
from scipy.signal import lfilter
SR = 48000; DUR = 41.5; N = int(SR*DUR); L = np.zeros(N); R = np.zeros(N); rng = np.random.default_rng(8)
def LP(x, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], x)
def HP(x, c): return x - LP(x, c)
def env(n, a, d): x = np.arange(n)/SR; return np.minimum(1, x/max(a, 1e-4))*np.exp(-x/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a=0.002, dec=None): x = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*x)*env(len(x), a, dec or d/3)
M = np.zeros((2, N))  # musique (sera atténuée sous la voix)
def add(s, at, g=1.0, pan=0.0, bus=None):
    i = int(at*SR); j = min(N, i+len(s))
    if i < 0 or i >= N or j <= i: return
    s = s[:j-i]*g
    if bus is None: L[i:j] += s*(1-max(0, pan)); R[i:j] += s*(1+min(0, pan))
    else: bus[0, i:j] += s*(1-max(0, pan)); bus[1, i:j] += s*(1+min(0, pan))
def kick(g=1): return sweep(130, 42, 0.3)*env(int(0.3*SR), 0.001, 0.09)*g
def hat(g=1): return HP(noise(0.04), 7000)*env(int(0.04*SR), 0.0005, 0.01)*g
def snap(g=1): d = 0.15; return HP(noise(d), 1500)*env(int(d*SR), 0.001, 0.04)*g
def click(g=1): return HP(noise(0.025), 2500)*env(int(0.025*SR), 0.0003, 0.005)*g
def whoosh(at, d=0.4, g=0.25, lo=300, hi=4000): w = LP(HP(noise(d), lo), hi)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g; add(w, at, 1, rng.uniform(-0.4, 0.4))
def ding(at, f=1318.5, g=0.09): add(tone(f, 0.6, 0.002, 0.2)*g, at); add(tone(f*1.5, 0.6, 0.002, 0.2)*g*0.6, at+0.05)
def thud(at, g=0.6): add(sweep(150, 45, 0.35)*env(int(0.35*SR), 0.001, 0.1), at, g)
def glitch(at, g=0.18):
    n = noise(0.18); n = np.repeat(np.round(n[::30]*2)/2, 30)[:len(n)]; add(LP(n, 5000)*env(len(n), 0.001, 0.06)*g, at)
# ── musique : groove doux 96 BPM (La m – Fa – Do – Sol), plus lumineux après « Avec MyMotiv »
B = 60/96; chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [196, 261.6, 329.6], [196, 246.9, 293.7]]; bass = [55, 43.65, 65.41, 49]
t = 0.0; bar = 0
while t < DUR - 0.5:
    bright = t >= 10.0; ch = chords[bar % 4]; d = 4*B
    x = np.arange(int(d*SR))/SR; pad = LP(sum(np.sin(2*np.pi*f*x) + 0.25*np.sin(2*np.pi*2.003*f*x) for f in ch), 1600 if bright else 900)*np.minimum(1, x/0.2)*np.minimum(1, (d-x)/0.2)*0.05
    add(pad, t, 1, -0.2, M); add(pad, t+0.01, 1, 0.2, M)
    for b in range(4):
        tb = t + b*B; add(kick(0.55), tb, 1, 0, M); add(hat(0.08), tb + B/2, 1, 0.3, M)
        if b % 2: add(snap(0.25), tb, 1, 0, M)
        xx = np.arange(int(B*0.9*SR))/SR; add(LP(np.sin(2*np.pi*bass[bar % 4]*2*xx)*env(len(xx), 0.005, B*0.6), 500)*0.25, tb, 1, 0, M)
        if bright: add(tone(ch[(b+1) % 3]*2, 0.3, 0.002, 0.08)*0.03, tb + B/2, 1, 0.35 if b % 2 else -0.35, M)
    t += 4*B; bar += 1
M[:, int((DUR-1.2)*SR):] *= np.linspace(1, 0, N - int((DUR-1.2)*SR))
# ── voix (mono → centre) et atténuation de la musique pendant qu'elle parle (sidechain)
w = wave.open('public/audio/voix-mascotte-propre.wav'); v = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float)/32768
VOICE_AT = 0.0; vi = np.zeros(N); vi[int(VOICE_AT*SR):int(VOICE_AT*SR)+len(v)] = v[:N-int(VOICE_AT*SR)]
e = np.sqrt(np.convolve(vi**2, np.ones(int(0.05*SR))/int(0.05*SR), 'same')); e = e/ e.max()
duck = 1 - 0.62*np.clip(e*3, 0, 1); duck = np.convolve(duck, np.ones(int(0.12*SR))/int(0.12*SR), 'same')
L += M[0]*duck; R += M[1]*duck
# ── bruitages calés sur les mots
for i in range(26): add(LP(HP(noise(0.1), 800), 5000)*env(int(0.1*SR), 0.005, 0.04)*0.12, 0.15 + i*0.1, 1, rng.uniform(-0.7, 0.7))   # enveloppes qui partent
add(tone(220, 0.6, 0.01, 0.3)*0.08, 2.8); add(tone(207.6, 0.6, 0.01, 0.3)*0.06, 3.0)   # « 0 réponse »
for cut in (3.42, 7.48, 10.0, 13.3, 18.1, 22.94, 28.9, 34.28, 38.4): glitch(cut - 0.05); whoosh(cut - 0.2, 0.4, 0.2)
for i in range(6): add(click(0.4), 4.58 + i*0.1)   # clones copiés-collés
thud(6.14, 0.7); add(HP(noise(0.12), 1200)*env(int(0.12*SR), 0.001, 0.03)*0.4, 6.14)   # tampon COPIÉ-COLLÉ
for i in range(3): add(tone(1400, 0.05, 0.001, 0.02)*0.08, 6.7 + i*0.25)   # chrono 2 s
for i in range(5): ding(8.44 + i*0.22, 880*2**(i*2/12), 0.05)   # mots-clés qui s'allument
add(sweep(200, 2400, 0.4)*np.linspace(0, 1, int(0.4*SR))**2*0.1, 9.82); thud(10.22, 0.6); ding(10.25, 1568, 0.1)   # MyMotiv
whoosh(11.0, 0.5, 0.2); thud(12.02, 0.6); ding(12.5, 1318.5, 0.08)   # CV + une seule fois
for i in range(5): add(sweep(900 + i*200, 3000, 0.05)*env(int(0.05*SR), 0.001, 0.02)*0.08, 13.48 + i*0.06)   # lien collé
add(HP(noise(0.75), 2500)*np.sin(np.linspace(0, np.pi, int(0.75*SR)))*0.08, 14.64); ding(15.38, 1318.5, 0.07)   # scan + lue
add(tone(988, 0.2, 0.002, 0.06)*0.08, 15.9); add(tone(1318.5, 0.25, 0.002, 0.08)*0.08, 16.05)   # site trouvé
add(sweep(200, 2600, 0.45)*np.linspace(0, 1, int(0.45*SR))**2*0.12, 17.2); thud(17.64, 0.8); ding(17.66, 1568, 0.12); ding(17.8, 2093, 0.07)   # le logo !
add(click(0.8), 18.76); k = 19.7
while k < 20.3: add(click(0.18), k, 1, rng.uniform(-0.4, 0.4)); k += 0.05
add(click(0.8), 20.64)
add(sweep(150, 2200, 0.6)*np.linspace(0, 1, int(0.6*SR))**2*0.12, 21.64)
d = 1.0; xx = np.arange(int(d*SR))/SR; add(np.sin(2*np.pi*np.cumsum(np.geomspace(140, 30, len(xx)))/SR)*np.exp(-xx/0.3)*0.8 + LP(noise(d), 3000)*np.exp(-xx/0.1)*0.5, 22.24, 0.9)   # Générer
for i in range(10): add(tone(1200, 0.03, 0.001, 0.01)*0.05, 22.6 + i*0.17)   # chrono
k = 24.4
while k < 26.0: add(click(0.12), k, 1, rng.uniform(-0.4, 0.4)); k += 0.045   # rédaction
ding(26.08, 1318.5, 0.08)
x = np.arange(int(1.0*SR))/SR; add(LP(sum(np.sin(2*np.pi*f*x) for f in [523.2, 659.3, 784]), 2000)*np.exp(-x/0.5)*0.03, 26.8)   # humanisée (chaleureux)
for i in range(4): whoosh(27.4 + i*0.22, 0.3, 0.12, 600, 6000)
thud(29.04, 0.5); ding(30.44, 1568, 0.08); add(tone(2093, 0.5, 0.002, 0.2)*0.06, 31.56)
add(click(1.0), 33.8); whoosh(33.85, 0.4, 0.15)
add(sweep(1400, 300, 0.4)*env(int(0.4*SR), 0.01, 0.15)*0.1, 35.26)   # téléchargement
add(HP(noise(0.6), 4000)*np.linspace(0, 1, int(0.6*SR))*0.06, 37.3); ding(37.62, 1568, 0.08)   # CV adapté
d = DUR - 38.4; x = np.arange(int(d*SR))/SR   # fin
chord = sum(np.sin(2*np.pi*f*x) + 0.3*np.sin(2*np.pi*2*f*x) for f in [110, 220, 277.2, 329.6, 440]); add(LP(chord, 2000)*np.minimum(1, x/0.1)*np.minimum(1, (d-x)/1.0)*0.05, 38.4)
for i in range(20): add(tone(rng.uniform(2500, 6500), 0.08, 0.001, 0.03), 38.4 + rng.uniform(0, 0.6), 0.035, rng.uniform(-0.8, 0.8))
# ── la voix, au premier plan
L += vi*0.95; R += vi*0.95
mix = np.stack([L, R], 1); mix = np.tanh(mix*1.1)/np.tanh(1.1); mix /= np.max(np.abs(mix))/10**(-1/20)
mix[-int(0.6*SR):] *= np.linspace(1, 0, int(0.6*SR))[:, None]
with wave.open('public/audio/mascotte.wav', 'wb') as wf: wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
print('audio ok')
