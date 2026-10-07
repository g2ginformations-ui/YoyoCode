# Bande-son de « N'écris plus. » (src/NEcrisPlus.tsx), sans voix : musique de l'utilisateur (apres-midi-fond.mp3)
# étouffée pendant le hook (écran sombre), ses percussions (18,9 s du fichier) tombent quand l'écran passe au blanc
# (clic sur MyMotiv), puis grande ouverte jusqu'au logo. Whooshes réels (public/sfx, tools/sfx_lib.py) ; bruitages
# fabriqués ici, nommés selon les catégories UCS : KEYBOARD (frappe, effacement), UI CLICK, POP, WHOOSH, IMPACT,
# MARKER (trait de feutre), BELL, MAGIC/SPARKLE. Volume final ≈ -14 LUFS.
import os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(17)
DUR = 17.2; N = int(SR*DUR)
# mêmes temps clés que src/NEcrisPlus.tsx (objet N)
V = dict(erase=0.12, q=0.62, qOut=1.75, search=1.95, type0=2.15, type1=3.3, load=3.42, result=3.8, click=4.35, white=4.55,
         ne=4.95, neOut=6.62, fan=6.8, s30=7.35, fanOut=8.4, link=8.75, linkType0=9.0, linkType1=9.75, gen=10.15, linkOut=10.6,
         dash=10.78, panel=11.55, dashOut=13.3, spin=13.45, done=13.8, doneOut=14.95, logo=15.05, loop=17.0)
DROP_SRC = 18.9

def decode(path, ch):
    out = subprocess.run([FF, "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(float).reshape(-1, ch)

src = decode("public/audio/apres-midi-fond.mp3", 2)
start = int((DROP_SRC - V["white"])*SR)
m = np.zeros((N, 2)); seg_ = src[start:start + N]; m[:len(seg_)] = seg_
x = np.arange(N)/SR
muf = sosfilt(butter(2, 600, "lp", fs=SR, output="sos"), m, axis=0)
k = np.interp(x, [0, V["white"] - 0.01, V["white"], V["logo"] - 0.1, V["logo"], DUR], [0.1, 0.25, 1, 1, 0.6, 0.6])[:, None]
m = muf*(1 - k)*1.4 + m*k
m *= np.clip(x/0.05, 0, 1)[:, None]*np.clip((DUR - x)/0.6, 0, 1)[:, None]
m /= np.max(np.abs(m)) + 1e-9
m *= 0.5
vv = np.zeros(N)
def rms(a): return np.sqrt(np.mean(a**2) + 1e-12)

L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a, dec): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
def click(at, g=0.3): add(HP(noise(0.012), 3000)*env(int(0.012*SR), 0.0002, 0.003), at, g)
def pop(at, f0=420, f1=980, g=0.15, pan=0.0): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g, pan)
def air(at, d=0.45, g=0.08): add(LP(HP(noise(d), 600), 5000)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g, at)
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(2*f, 1.4, 0.004, 0.3), at + i*0.06, g)
def boom(at, g=0.6): add(sweep(110, 36, 0.8)*env(int(0.8*SR), 0.002, 0.25), at, g); add(LP(noise(0.3), 500)*env(int(0.3*SR), 0.001, 0.05), at, g*0.5)
def riser(at, d, g=0.1): add(HP(noise(d), 1200)*np.linspace(0, 1, int(d*SR))**2*g + sweep(200, 1200, d)*np.linspace(0, 1, int(d*SR))**3*g*0.3, at)
# WHOOSH : sons réels (public/sfx, FILM CRUX) ; le pic du son tombe au milieu du mouvement (at + d/2)
import sys; sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)
def whoosh(at, d=0.45, g=0.12): W.place(add, at + d*0.5, "Court" if d < 0.42 else ("MoyenClair" if g < 0.12 else "MoyenSourd"), g*1.6, max_len=2.2)
def glitch(at, d=0.4, g=0.12):          # GLITCH : rafales numériques hachées
    n = int(d*SR); s = np.zeros(n); t_ = 0
    while t_ < n:
        L_ = int(rng.uniform(0.01, 0.04)*SR); f = rng.uniform(300, 3000)
        s[t_:t_+L_] = np.sign(np.sin(2*np.pi*f*np.arange(min(L_, n - t_))/SR))*rng.uniform(0.3, 1)*(rng.random() > 0.3)
        t_ += L_ + int(rng.uniform(0, 0.02)*SR)
    add(HP(s, 200)*np.linspace(1, 0.3, n), at, g)
def static(at, d, g=0.03): add(sosfilt(butter(2, [800, 5000], "bp", fs=SR, output="sos"), noise(d))*(0.7 + 0.3*np.sin(np.linspace(0, 60, int(d*SR)))), at, g)   # STATIC
def ghostswell(at, d=1.6, g=0.12):      # GHOST : souffle grave qui monte puis s'éteint
    e_ = np.sin(np.linspace(0, np.pi, int(d*SR)))**2; add(LP(noise(d), 500)*e_*g + sweep(160, 70, d)*e_*g*0.5, at)
def sparkle(at, g=0.04):                # MAGIC/SPARKLE
    for i in range(10): add(tone(rng.uniform(2000, 4500), 0.25, 0.002, 0.06), at + i*0.03, g)
def stamp(at, g=0.25): add(LP(noise(0.08), 900)*env(int(0.08*SR), 0.001, 0.02), at, g); pop(at, 300, 140, g*0.5)   # IMPACT léger (✕)


def key(at, g=0.12): add(sosfilt(butter(2, [1500, 6000], "bp", fs=SR, output="sos"), noise(0.02))*env(int(0.02*SR), 0.0005, 0.005), at, g, rng.uniform(-0.3, 0.3))
def marker(at, d, g=0.06): add(sosfilt(butter(2, [1500, 6000], "bp", fs=SR, output="sos"), noise(d))*(0.6 + 0.4*np.sin(np.linspace(0, 40, int(d*SR))))*np.sin(np.linspace(0, np.pi, int(d*SR))), at, g)

# A. hook : effacement à toute vitesse
for i in range(16): key(V["erase"] + i*0.025, 0.16)
# B. la question, mot par mot
for dt in (0, 0.14, 0.3, 0.48, 0.58, 0.68, 0.8): pop(V["q"] + dt, 500 + dt*600, 1100 + dt*800, 0.07)
W.place(add, V["qOut"] + 0.1, "Court", 0.2)
# C. recherche
pop(V["search"] + 0.1, 400, 900, 0.1)
for i in range(27): key(V["type0"] + i*(V["type1"] - V["type0"])/27, 0.09)
air(V["load"], 0.35, 0.05); pop(V["result"], 600, 1400, 0.12)
click(V["click"], 0.5); W.place(add, V["white"] + 0.1, "Long", 0.3); boom(V["white"] + 0.05, 0.5); chime(V["white"] + 0.1, 0.05)
# D. N'écris plus.
for i in range(13): key(V["ne"] + 0.05 + i*0.04, 0.07)
marker(V["ne"] + 0.68, 0.65, 0.07); W.place(add, V["neOut"] + 0.05, "Court", 0.2)
# E. éventail de lettres
for i in range(5): pop(V["fan"] + 0.3 + i*0.07, 400 + i*100, 1000 + i*150, 0.07, (i - 2)*0.3)
chime(V["s30"] + 0.1, 0.05); W.place(add, V["fanOut"] + 0.1, "MoyenClair", 0.2)
# F. lien + Générer
pop(V["link"] + 0.25, 500, 1100, 0.08)
for i in range(31): key(V["linkType0"] + i*(V["linkType1"] - V["linkType0"])/31, 0.07)
click(V["gen"], 0.55); pop(V["gen"] + 0.02, 700, 1500, 0.12); sparkle(V["gen"] + 0.05, 0.05); chime(V["gen"] + 0.08, 0.06)
W.place(add, V["linkOut"] + 0.05, "Court", 0.2)
# G. tableau
for i in range(5): pop(V["dash"] + 0.15 + i*0.07, 600, 1000, 0.05, -0.4)
W.place(add, V["panel"] + 0.2, "Court", 0.18)
for j in range(4): pop(V["panel"] + 0.4 + j*0.28, 800 + j*120, 1600 + j*200, 0.08, 0.4)
W.place(add, V["dashOut"], "Court", 0.18)
# H. lettre prête
for i in range(6): click(V["spin"] + i*0.06, 0.04)
pop(V["done"] + 0.05, 500, 1300, 0.14); chime(V["done"] + 0.08, 0.08); sparkle(V["done"] + 0.1, 0.05)
# I. fin
W.place(add, V["logo"] + 0.05, "Long", 0.3); boom(V["logo"] + 0.02, 0.35); sparkle(V["logo"] + 0.4, 0.05)
pop(V["logo"] + 0.9, 500, 1100, 0.12); chime(V["logo"] + 0.95, 0.05)
for i in range(4): key(V["loop"] + i*0.04, 0.06)

sfx = np.stack([L, R], 1)
mix = m + sfx*4
mix[-int(0.15*SR):] *= np.linspace(1, 0, int(0.15*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/necris-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR), "public/audio/necris.wav"], check=True)
os.remove(raw)
print("audio ok")
