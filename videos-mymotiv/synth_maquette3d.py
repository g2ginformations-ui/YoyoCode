# Bande-son de la « Maquette 3D » (src/Maquette3D.tsx), sans voix (la voix off de l'utilisateur viendra se caler
# dessus) : groove pop lumineux fabriqué ici (do majeur, 112 BPM : marimba, basse, grosse caisse, claps, shaker),
# coupure + montée pendant les orbes, impact sur le flash, « stop » sur chaque mot de « Et ce n'est pas tout !! »,
# projecteur qui s'allume, glissements de la galerie, rubans, atterrissage sur le piédestal.
# Bruitages réels (whooshes FILM CRUX, tools/sfx_lib.py) + fabriqués ici (UCS : UI POP, KEYBOARD, IMPACT, RISER,
# SWITCH, BELL, MAGIC/SPARKLE). Volume final ≈ -14 LUFS.
import os, subprocess, sys, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(41)
DUR = 33.5; N = int(SR*DUR)
# mêmes temps clés que src/Maquette3D.tsx (objet M)
M = dict(pills=[0.0, 0.75, 1.5, 2.25], ring=3.9, black=5.2, flash=6.45, icon=6.5, wipe=7.9, phone=8.1, fluide=9.0, flip=10.7,
         tilt=12.0, tiles=[12.8, 13.6, 14.4, 15.2], tout=16.6, folder=17.7, gallery=18.6, cards=[18.9, 20.2, 21.5, 22.8, 24.1],
         ribbons=25.5, pedestal=26.4, slogan1=27.3, slogan2=28.6, cta=30.0, end=32.4)

def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a, dec): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
mtof = lambda m: 440*2**((m - 69)/12)
def marimba(f, d=0.35): t = np.arange(int(d*SR))/SR; return (np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*f*4*t)*np.exp(-t*30))*np.exp(-t*9)*np.minimum(1, t/0.002)

mL = np.zeros(N); mR = np.zeros(N)
def madd(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: mL[i:j] += s[:j-i]*g*(1 - max(0, pan)); mR[i:j] += s[:j-i]*g*(1 + min(0, pan))
BEAT = 60/112; S16 = BEAT/4
CH = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]      # do, sol, la m, fa (une mesure chacun)
def kick(at, g=0.9): madd(sweep(140, 45, 0.3)*env(int(0.3*SR), 0.001, 0.1), at, g)
def clap(at, g=0.28):
    for o in (0, 0.011, 0.022): madd(sosfilt(butter(2, [900, 3500], "bp", fs=SR, output="sos"), noise(0.16))*env(int(0.16*SR), 0.001, 0.045), at + o, g*0.6)
def shaker(at, g=0.05): madd(sosfilt(butter(2, [5000, 11000], "bp", fs=SR, output="sos"), noise(0.05))*env(int(0.05*SR), 0.004, 0.015), at, g, rng.uniform(-0.3, 0.3))
def bass(at, d, n, g=0.3): t = np.arange(int(d*SR))/SR; madd(np.tanh(np.sin(2*np.pi*mtof(n - 24)*t)*2)*np.exp(-t*3)*np.minimum(1, t/0.004), at, g)
def mode(t):
    if M["black"] <= t < M["flash"]: return "off"
    if M["tout"] <= t < M["gallery"]: return "stop"
    if t >= M["end"]: return "off"
    return "on"
k = 0
while k*S16 < DUR:
    t = k*S16; md = mode(t); bar = int(t/(4*BEAT)); ch = CH[bar % 4]; s = k % 16
    if md == "on":
        if s % 4 == 0: kick(t, 0.85)
        if s in (4, 12): clap(t)
        shaker(t, 0.06 if s % 2 else 0.035)
        if s in (0, 6, 8, 14): bass(t, BEAT*0.9, ch[0], 0.26)
        if s % 2 == 0: madd(marimba(mtof(ch[(s//2) % 3] + 12)), t, 0.09, (-0.35, 0.35)[(s//2) % 2])
        if s in (3, 11): madd(marimba(mtof(ch[2] + 24), 0.25), t, 0.05, 0.3)
    k += 1
# orbes : nappe grave + montée jusqu'au flash
d = M["flash"] - M["black"]
madd(LP(sum(np.sin(2*np.pi*mtof(n - 12)*np.arange(int(d*SR))/SR) for n in (48, 55, 60)), 900)*np.linspace(0.3, 1, int(d*SR)), M["black"], 0.12)
madd(HP(noise(d), 1500)*np.linspace(0, 1, int(d*SR))**2, M["black"], 0.12)
# « Et ce n'est pas tout !! » : un coup par mot
for i in range(6): kick(M["tout"] + i*0.12, 0.7); madd(marimba(mtof(72 + [0, 2, 4, 5, 7, 12][i])), M["tout"] + i*0.12, 0.12)
x = np.arange(N)/SR; ph = (x % BEAT)/BEAT
side = np.where(np.vectorize(mode)(x[::480]).repeat(480)[:N] == "on", 1 - 0.35*np.exp(-ph*7), 1.0)
mL *= side; mR *= side
mus = np.stack([mL, mR], 1); mus /= np.max(np.abs(mus)) + 1e-9

L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def click(at, g=0.3): add(HP(noise(0.012), 3000)*env(int(0.012*SR), 0.0002, 0.003), at, g)
def pop(at, f0=420, f1=980, g=0.15, pan=0.0): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g, pan)
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(2*f, 1.4, 0.004, 0.3), at + i*0.06, g)
def boom(at, g=0.6): add(sweep(110, 36, 0.8)*env(int(0.8*SR), 0.002, 0.25), at, g); add(LP(noise(0.3), 500)*env(int(0.3*SR), 0.001, 0.05), at, g*0.5)
def key(at, g=0.07): add(sosfilt(butter(2, [1500, 6000], "bp", fs=SR, output="sos"), noise(0.02))*env(int(0.02*SR), 0.0005, 0.005), at, g, rng.uniform(-0.3, 0.3))
def sparkle(at, g=0.04):
    for i in range(12): add(tone(rng.uniform(2000, 4500), 0.25, 0.002, 0.06), at + i*0.03, g)
def switch(at, g=0.35): click(at, g); add(LP(noise(0.08), 300)*env(int(0.08*SR), 0.001, 0.03), at + 0.01, g)   # SWITCH : projecteur
def thump(at, g=0.4): add(sweep(90, 45, 0.25)*env(int(0.25*SR), 0.001, 0.08), at, g)
sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)
for i, p in enumerate(M["pills"]):
    W.place(add, p + 0.3, "Court", 0.2); pop(p + 0.45, 500 + i*80, 1100 + i*120, 0.1, 0.3)
    for j in range(8): key(p + 0.15 + j*0.06, 0.05)
W.place(add, M["ring"] + 0.5, "MoyenClair", 0.25)
W.place(add, M["black"] + 0.05, "MoyenSourd", 0.2)
boom(M["flash"], 0.7); W.place(add, M["flash"], "Long", 0.3); chime(M["icon"] + 0.2, 0.06); sparkle(M["icon"] + 0.3, 0.05)
W.place(add, M["wipe"] + 0.2, "Long", 0.25)
W.place(add, M["phone"] + 0.4, "MoyenSourd", 0.22)
for j in range(24): key(M["fluide"] + j*0.042, 0.06)
W.place(add, M["flip"] + 0.45, "MoyenClair", 0.22); W.place(add, M["tilt"] + 0.4, "MoyenSourd", 0.2)
for i, tt in enumerate(M["tiles"]): pop(tt + 0.2, 500 + i*100, 1200 + i*150, 0.14, (-0.3, 0.3)[i % 2])
chime(M["tiles"][3] + 0.25, 0.05)
W.place(add, M["folder"] + 0.25, "Court", 0.2); click(M["folder"] + 0.6, 0.35)
W.place(add, M["gallery"] - 0.2, "MoyenSourd", 0.25); switch(M["gallery"], 0.4)
for c in M["cards"][1:]: W.place(add, c - 0.15, "Court", 0.18)
for c in M["cards"]: pop(c + 0.05, 600, 1100, 0.07)
W.place(add, M["ribbons"] + 0.4, "Long", 0.3)
switch(M["pedestal"], 0.35); thump(M["pedestal"] + 0.45, 0.35); thump(M["pedestal"] + 0.75, 0.45); chime(M["pedestal"] + 0.8, 0.05)
pop(M["slogan1"], 500, 1000, 0.12); pop(M["slogan2"], 600, 1200, 0.12); pop(M["cta"], 700, 1400, 0.14); chime(M["cta"] + 0.05, 0.05)
boom(M["end"], 0.35); W.place(add, M["end"] + 0.2, "Long", 0.22); sparkle(M["end"] + 0.4, 0.04)
sfx = np.stack([L, R], 1)
mix = mus*0.55 + sfx*2.6
mix[-int(1.0*SR):] *= np.linspace(1, 0, int(1.0*SR))[:, None]**1.5
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/maquette3d-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/maquette3d.wav"], check=True)
os.remove(raw)
print("audio ok")
