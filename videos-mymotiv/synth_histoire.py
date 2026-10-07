# Bande-son de « Notre histoire » (src/NotreHistoire.tsx) : voix de l'utilisateur (public/audio/histoire-voix.wav,
# tools/voix-narrateur.py + voix-histoire.json) + musique électronique futuriste fabriquée ici (la menor, 120 BPM :
# pad de scies désaccordées, basse pulsée, grosse caisse, charleston, claps, arpège pendant le comparatif sans voix),
# qui s'efface sous la voix (ducking) et s'ouvre en grand pendant le comparatif. Avant le « drop » (flash du logo) :
# tic-tac du chrono qui s'accélère, montée, puis coupure nette sur « Moi ? ».
# Bruitages réels (whooshes FILM CRUX, tools/sfx_lib.py) + fabriqués ici, nommés selon les catégories UCS : GLITCH,
# UI CLICK/BEEP, KEYBOARD, WHOOSH, IMPACT, RISER, BELL, MAGIC/SPARKLE, PAPER. Volume final ≈ -14 LUFS.
import json, os, subprocess, sys, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter, fftconvolve
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(23)
V = json.load(open("src/data/histoire-voix.json"))
DUR = V["duration"]; N = int(SR*DUR)
# mêmes temps clés que src/NotreHistoire.tsx (objet K)
K = dict(tu=0.94, combien=1.42, motiv=2.76, h2=3.99, h3=4.93, moi=5.69, s30=6.49, flash=7.32, avec=8.26, mm=8.44,
         phone=8.95, offre=9.4, cv=10.6, ia=11.64, lettre=12.6, cv2=13.48, entreprise=14.4, logo0=15.0, logo=15.77,
         sans=16.11, profil=17.63, prompt0=18.3, ecrire=19.33, robot0=19.8, m1=19.92, m2=20.6, m3=21.3, pile0=21.95,
         sort=23.71, pile=24.17, offerte0=25.05, offerte=26.05, prix0=26.85, c1=27.18, p1=28.74, c2=30.32, p2=31.96,
         c3=33.4, p3=35.12, paye=35.76, sansEng=36.96, ft=38.95, test=41.5, vs=45.5, plus=49.4, punch=51.9, end=53.45,
         mm2=53.6, lettre2=54.8, clics=56.0, bio=56.97)
GLITCHES = [0.02, 0.18, K["h2"], K["h3"], K["moi"], K["flash"], K["prompt0"], K["ecrire"] + 0.08, K["m3"], K["m3"] + 0.35,
            K["pile0"] - 0.05, K["prix0"] - 0.05, K["ft"] - 0.1, K["ft"] + 0.3, K["vs"], K["punch"], K["punch"] + 0.5, K["end"]]

def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a, dec): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
def saw(f, d, det=0.0):
    t = np.arange(int(d*SR))/SR; out = np.zeros(len(t))
    for k_, dd in enumerate((-det, 0, det)): out += 2*((t*f*(1 + dd) + k_*0.31) % 1) - 1
    return out/3
mtof = lambda m: 440*2**((m - 69)/12)

# ─── musique ───
mL = np.zeros(N); mR = np.zeros(N)
def madd(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: mL[i:j] += s[:j-i]*g*(1 - max(0, pan)); mR[i:j] += s[:j-i]*g*(1 + min(0, pan))
BEAT = 0.5; T0 = K["flash"]                                   # le drop tombe sur le flash du logo
CHORDS = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]   # la m, fa, do, sol (2 s chacun)
def chord_at(t): return CHORDS[int(max(0, t - T0)//2) % 4]
def kick(at, g=0.9): madd(sweep(140, 42, 0.35)*env(int(0.35*SR), 0.001, 0.12), at, g); madd(HP(noise(0.01), 2000)*0.3, at, g*0.5)
def hat(at, g=0.12, d=0.05): madd(HP(noise(d), 7000)*env(int(d*SR), 0.0005, d/4), at, g, rng.uniform(-0.3, 0.3))
def clap(at, g=0.3):
    for o in (0, 0.012, 0.024): madd(sosfilt(butter(2, [900, 3500], "bp", fs=SR, output="sos"), noise(0.18))*env(int(0.18*SR), 0.001, 0.05), at + o, g*0.6)
def pad(at, d, notes, g=0.11, cut=1400):
    s = sum(saw(mtof(n), d, 0.006) for n in notes + [notes[0] - 12])
    e = np.minimum(1, np.arange(len(s))/SR/0.25)*np.minimum(1, (d - np.arange(len(s))/SR)/0.3)
    s = LP(LP(s, cut), cut)*e; madd(s, at, g, -0.25); madd(s, at + 0.012, g, 0.25)
def bass(at, d, note, g=0.25): s = saw(mtof(note - 24), d)*env(int(d*SR), 0.003, d*0.7); madd(LP(LP(s, 500), 500), at, g)
def arp(at, d, note, g=0.07, pan=0.0): s = np.sign(np.sin(2*np.pi*mtof(note)*np.arange(int(d*SR))/SR))*env(int(d*SR), 0.002, d*0.5); madd(LP(s, 2600), at, g, pan)

# intro (0 → drop) : drone grave, tic-tac du chrono qui s'accélère, montée, coupure sur « Moi ? »
dr = (saw(mtof(33), K["moi"], 0.004) + 0.5*saw(mtof(45), K["moi"], 0.003))
madd(LP(LP(dr, 260), 260)*np.minimum(1, np.arange(len(dr))/SR/0.3)*np.linspace(0.6, 1, len(dr)), 0, 0.22)
tt = 0.15; step = 0.5
while tt < K["moi"] - 0.05:
    madd(sosfilt(butter(2, [2500, 7000], "bp", fs=SR, output="sos"), noise(0.02))*env(int(0.02*SR), 0.0005, 0.006), tt, 0.35, 0.3 if int(tt*10) % 2 else -0.3)
    tt += step; step = max(0.09, step*0.93)
for at in (K["h2"], K["h3"]): kick(at, 0.8)
madd(HP(noise(K["moi"] - 3.2), 1500)*np.linspace(0, 1, int((K["moi"] - 3.2)*SR))**2, 3.2, 0.09)
# « Moi ? » → silence, puis souffle inversé jusqu'au drop
rv = LP(noise(1.2), 3000)*np.linspace(0, 1, int(1.2*SR))**3; madd(rv, K["flash"] - 1.2, 0.18)
madd(sweep(300, 1600, 1.0)*np.linspace(0, 1, int(1.0*SR))**3, K["flash"] - 1.0, 0.05)

# corps : du drop à la fin du comparatif ; pause sèche sur « Gratuit, c'est bien. » ; fin plus calme
def section(t):
    if t < K["prompt0"]: return "main"
    if t < K["pile0"]: return "half"          # pas de prompt / robot : demi-temps, plus sombre
    if t < K["ft"]: return "main"
    if t < K["punch"]: return "full"          # comparatif sans voix : arpège
    if t < K["end"]: return "break"
    return "end"
b = 0
while T0 + b*BEAT < DUR - 0.4:
    t = T0 + b*BEAT; sec = section(t); ch = chord_at(t)
    if b % 4 == 0 and sec != "break": pad(t, 2.0 + 0.1, ch, 0.10 if sec != "full" else 0.12, 900 if sec == "half" else (2000 if sec == "full" else 1400))
    if sec in ("main", "full"):
        kick(t, 0.85); hat(t + BEAT/2, 0.13)
        if b % 2 == 1: clap(t, 0.22)
        bass(t + BEAT/2, BEAT/2, ch[0], 0.22); bass(t, BEAT/2 - 0.02, ch[0], 0.14)
    elif sec == "half":
        if b % 2 == 0: kick(t, 0.8)
        if b % 4 == 2: clap(t, 0.25)
        bass(t, BEAT, ch[0], 0.2)
    elif sec == "end":
        if b % 2 == 0: kick(t, 0.6)
        hat(t + BEAT/2, 0.08)
    if sec == "full":
        for s16 in range(4):
            arp(t + s16*BEAT/4, BEAT/4, ch[(b*4 + s16) % 3] + 12 + (12 if s16 == 3 else 0), 0.06, (-0.4, 0.4)[s16 % 2])
        hat(t + BEAT/4, 0.06, 0.03); hat(t + 3*BEAT/4, 0.06, 0.03)
    b += 1
# respiration rythmique (sidechain) : la musique se creuse après chaque grosse caisse
x = np.arange(N)/SR; ph = ((x - T0) % BEAT)/BEAT
side = np.where(x >= T0, 1 - 0.45*np.exp(-ph*7), 1.0)
mL *= side; mR *= side
mus = np.stack([mL, mR], 1)

# ─── bruitages ───
L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def click(at, g=0.3): add(HP(noise(0.012), 3000)*env(int(0.012*SR), 0.0002, 0.003), at, g)
def pop(at, f0=420, f1=980, g=0.15, pan=0.0): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g, pan)
def beep(at, f=1800, d=0.06, g=0.06, pan=0.0): add(np.sign(np.sin(2*np.pi*f*np.arange(int(d*SR))/SR))*env(int(d*SR), 0.001, d*0.6), at, g, pan)   # UI BEEP
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(2*f, 1.4, 0.004, 0.3), at + i*0.06, g)
def boom(at, g=0.6): add(sweep(110, 36, 0.8)*env(int(0.8*SR), 0.002, 0.25), at, g); add(LP(noise(0.3), 500)*env(int(0.3*SR), 0.001, 0.05), at, g*0.5)
def riser(at, d, g=0.1): add(HP(noise(d), 1200)*np.linspace(0, 1, int(d*SR))**2*g + sweep(200, 1200, d)*np.linspace(0, 1, int(d*SR))**3*g*0.3, at)
def key(at, g=0.1): add(sosfilt(butter(2, [1500, 6000], "bp", fs=SR, output="sos"), noise(0.02))*env(int(0.02*SR), 0.0005, 0.005), at, g, rng.uniform(-0.3, 0.3))
def glitch(at, d=0.25, g=0.1):
    n = int(d*SR); s = np.zeros(n); t_ = 0
    while t_ < n:
        L_ = int(rng.uniform(0.01, 0.04)*SR); f = rng.uniform(300, 3000)
        s[t_:t_+L_] = np.sign(np.sin(2*np.pi*f*np.arange(min(L_, n - t_))/SR))*rng.uniform(0.3, 1)*(rng.random() > 0.3)
        t_ += L_ + int(rng.uniform(0, 0.02)*SR)
    add(HP(s, 200)*np.linspace(1, 0.3, n), at, g)
def sparkle(at, g=0.04):
    for i in range(10): add(tone(rng.uniform(2000, 4500), 0.25, 0.002, 0.06), at + i*0.03, g)
def stamp(at, g=0.4): add(LP(noise(0.1), 900)*env(int(0.1*SR), 0.001, 0.03), at, g); boom(at, g*0.5)
def hum(at, d, g=0.05): add((tone(120, d, 0.05, 99) + 0.3*tone(240, d, 0.05, 99))*np.sin(np.linspace(0, np.pi, int(d*SR)))*(0.7 + 0.3*np.sin(np.linspace(0, 90, int(d*SR)))), at, g)
def paper(at, g=0.1): add(sosfilt(butter(2, [1200, 7000], "bp", fs=SR, output="sos"), noise(0.18))*env(int(0.18*SR), 0.01, 0.05), at, g)
sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)

for gt in GLITCHES: glitch(gt + 0.02, 0.18, 0.09)
glitch(0.0, 0.4, 0.16); boom(0.02, 0.35)                                   # hook
for at in (K["h2"], K["h3"]): stamp(at, 0.35); glitch(at, 0.2, 0.1)
glitch(K["moi"], 0.3, 0.18); W.place(add, K["moi"] + 0.25, "Court", 0.25)  # rembobinage
for i in range(14): click(K["moi"] + 0.08 + i*0.045, 0.12)
chime(K["s30"] + 0.02, 0.07); pop(K["s30"], 500, 1300, 0.14)
W.place(add, K["flash"], "Long", 0.35); boom(K["flash"], 0.7); chime(K["flash"] + 0.1, 0.05); sparkle(K["mm"] + 0.1, 0.05)
for i in range(16): key(K["mm"] + 0.25 + i*0.02, 0.05)                      # « SYSTÈME EN LIGNE »
W.place(add, K["phone"] + 0.25, "MoyenSourd", 0.3)
for i in range(18): key(K["offre"] + i*0.05, 0.08)
pop(K["cv"] + 0.2, 500, 1200, 0.14); click(K["cv"] + 0.18, 0.3)
hum(K["ia"] - 0.1, 1.0, 0.06)
for i in range(10): beep(K["ia"] + i*0.1, 1400 + (i % 3)*300, 0.04, 0.035, (-0.3, 0.3)[i % 2])
W.place(add, K["lettre"] + 0.2, "MoyenClair", 0.25); paper(K["lettre"] + 0.1, 0.12)
W.place(add, K["cv2"] + 0.1, "Court", 0.22); paper(K["cv2"], 0.1); pop(K["entreprise"] + 0.1, 600, 1300, 0.1)
W.place(add, K["logo0"] + 0.1, "Court", 0.22)
for i in range(5): beep(K["logo"] - 0.5 + i*0.1, 2200, 0.035, 0.04)
beep(K["logo"], 2900, 0.12, 0.06); chime(K["logo"] + 0.03, 0.06)              # verrouillage
hum(K["sans"], K["profil"] + 0.2 - K["sans"], 0.04)
for at in (0.25, 0.47, 0.68): beep(K["sans"] + (K["profil"] - K["sans"])*at, 1900, 0.05, 0.05, 0.4)
W.place(add, K["prompt0"] + 0.15, "Court", 0.22)
for i in range(40): key(K["prompt0"] + 0.15 + i*0.022, 0.07)
W.place(add, K["ecrire"] + 0.05, "Court", 0.3); stamp(K["ecrire"] + 0.12, 0.3); glitch(K["ecrire"] + 0.1, 0.3, 0.12)
for at in (K["m1"], K["m2"]): pop(at, 600, 900, 0.14, -0.3)
glitch(K["m3"], 0.6, 0.2); pop(K["m3"], 300, 200, 0.12)
W.place(add, K["pile0"] - 0.15, "MoyenSourd", 0.28)
riser(K["sort"] - 0.6, 0.75, 0.12); W.place(add, K["pile"], "MoyenClair", 0.2); chime(K["pile"], 0.06); sparkle(K["pile"] + 0.05, 0.04)
stamp(K["offerte"], 0.55); sparkle(K["offerte"] + 0.1, 0.05)
W.place(add, K["prix0"] + 0.05, "MoyenSourd", 0.25)
for c, p in ((K["c1"], K["p1"]), (K["c2"], K["p2"]), (K["c3"], K["p3"])):
    W.place(add, c + 0.2, "Court", 0.2)
    for i in range(10): click(p - 0.5 + i*0.05, 0.09)
    pop(p + 0.03, 500, 1400, 0.16); chime(p + 0.05, 0.045)
for at in (K["paye"], K["sansEng"]): pop(at, 700, 1500, 0.1, 0.4)
W.place(add, K["ft"] - 0.05, "Long", 0.3); boom(K["ft"], 0.45)
for i in range(34): key(K["ft"] + i*0.015, 0.05)
W.place(add, K["test"] + 0.1, "MoyenClair", 0.22)
tt = K["test"] + 0.3
while tt < K["test"] + 2.9: click(tt, 0.08); tt += 0.07                     # chrono qui file
for i in range(8): paper(K["test"] + 0.4 + i*2.5/8, 0.07)
W.place(add, K["vs"] + 0.1, "MoyenSourd", 0.25); boom(K["vs"] + 0.3, 0.4)
for i in range(3): pop(K["vs"] + 0.35 + i*0.8, 500, 1100, 0.12)
sparkle(K["vs"] + 2.1, 0.05)
W.place(add, K["plus"] + 0.1, "Court", 0.22)
for i in range(5): pop(K["plus"] + 0.45 + i*0.26, 700 + i*80, 1400 + i*100, 0.11, (-0.3, 0.3)[i % 2])
stamp(K["punch"] + 0.1, 0.3); stamp(K["punch"] + 0.6, 0.45)
W.place(add, K["end"], "Long", 0.35); boom(K["end"], 0.7); chime(K["end"] + 0.15, 0.05); sparkle(K["mm2"] + 0.2, 0.05)
pop(K["clics"] + 0.35, 500, 1100, 0.1); pop(K["bio"], 600, 1300, 0.16); chime(K["bio"] + 0.05, 0.05)
sfx = np.stack([L, R], 1)

# ─── voix + ducking ───
with wave.open("public/audio/histoire-voix.wav") as w_:
    vv = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float)/32768
voice = np.zeros(N); voice[:min(N, len(vv))] = vv[:N]
hop = int(0.01*SR); e = np.array([np.sqrt(np.mean(voice[i:i+hop]**2)) for i in range(0, N, hop)])
on = (e > 0.02).astype(float)
on = np.convolve(on, np.ones(25)/25, "same"); on = np.clip(on*3, 0, 1)
duck = 1 - 0.68*np.repeat(on, hop)[:N]
mus *= duck[:, None]
mus /= np.max(np.abs(mus)) + 1e-9
mix = mus*0.55 + sfx*3.0 + np.stack([voice, voice], 1)*0.95
mix[:int(0.01*SR)] *= np.linspace(0, 1, int(0.01*SR))[:, None]
mix[-int(1.2*SR):] *= np.linspace(1, 0, int(1.2*SR))[:, None]**1.5
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/histoire-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/histoire.wav"], check=True)
os.remove(raw)
print("audio ok")
