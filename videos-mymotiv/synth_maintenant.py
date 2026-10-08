# Bande-son de « Commence ton alternance maintenant » (src/AlternanceMaintenant.tsx) : voix ElevenLabs assemblée
# (public/audio/maintenant-voix.wav, tools/assembler-lignes.py) + musique fabriquée ici, en deux parties comme la vidéo :
#   PARTIE 1 : réveil qui sonne (hook), tic-tac d'horloge, nappe tendue et pulsation qui monte le long de la frise des mois,
#              souffle sur « février, c'est demain », silence sec puis IMPACT sur « MAINTENANT » ;
#   PARTIE 2 : groove électro lumineux (120 BPM, la mineur → do majeur), un bruitage par étape (pops, coches, papiers,
#              rature rouge, frappe, envoi, relance, tampon « conseil d'ancien recruteur »), compteur de Léni, final.
# Ducking sous la voix. Bruitages UCS + whooshes réels FILM CRUX (tools/sfx_lib.py). Volume final ≈ -14 LUFS.
import json, os, subprocess, sys, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(97)
V = json.load(open("src/data/maintenant-voix.json"))
DUR = V["duration"]; N = int(SR*DUR)
Wt = lambda i: next(m["t0"] for m in V["mots"] if m["i"] == i)
PH = [(p["t0"], p["t1"]) for p in V["phrases"]]
K = dict(fev=Wt(19), pic=Wt(22), juin=Wt(28), demain=Wt(32), maintenant=Wt(36), etapes=Wt(47), formation=Wt(59), copier=Wt(79),
         mission=Wt(87), lien=Wt(93), cv=Wt(98), s30=Wt(104), spontanee=Wt(113), relance=Wt(118), conseil=Wt(122), onze=Wt(130),
         sept=Wt(132), offerte=Wt(138), bio=Wt(141), go=Wt(144), end=PH[10][1])
P2 = PH[3][0] - 0.3                                                        # mêmes repères que le .tsx
STEPS = [PH[4][0] - 0.2, PH[5][0] - 0.2, PH[6][0] - 0.2, PH[8][0] - 0.2, PH[9][0] - 0.2]

def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def BP(s, lo, hi): return sosfilt(butter(2, [lo, hi], "bp", fs=SR, output="sos"), s)
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a=0.005, dec=0.5): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
mtof = lambda m: 440*2**((m - 69)/12)
def saw(f, d, det=0.006):
    t = np.arange(int(d*SR))/SR
    return sum(2*((t*f*(1 + dd) + k*0.37) % 1) - 1 for k, dd in enumerate((-det, 0, det)))/3
def pluck(f, d=0.35): t = np.arange(int(d*SR))/SR; return sum(np.sin(2*np.pi*f*h*t)*np.exp(-t*(6 + h*h*2.5))/h for h in range(1, 6))*np.minimum(1, t/0.002)

mL = np.zeros(N); mR = np.zeros(N)
def madd(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: mL[i:j] += s[:j-i]*g*(1 - max(0, pan)); mR[i:j] += s[:j-i]*g*(1 + min(0, pan))
def kick(at, g=0.6): madd(sweep(125, 44, 0.28)*env(int(0.28*SR), 0.001, 0.09), at, g)
def hat(at, g=0.04): madd(HP(noise(0.03), 8000)*env(int(0.03*SR), 0.0005, 0.008), at, g, rng.uniform(-0.3, 0.3))
def clap(at, g=0.14):
    for o in (0, 0.011, 0.022): madd(BP(noise(0.14), 900, 3500)*env(int(0.14*SR), 0.001, 0.04), at + o, g*0.6)
def pad(at, notes, d, g=0.04, cut=800):
    n = int(d*SR); s = LP(sum(saw(mtof(m), d) for m in notes), cut)*np.minimum(1, np.arange(n)/SR/0.4)*np.minimum(1, (d - np.arange(n)/SR)/0.4)
    madd(s, at, g, -0.3); madd(s, at + 0.013, g, 0.3)

# ─── PARTIE 1 : nappe tendue (la mineur) + pulsation qui monte, jusqu'au silence avant « MAINTENANT » ───
cut1 = K["maintenant"] - 0.2
pad(0.4, [45, 52, 57, 60], cut1 - 0.4, 0.035, 600)
t = PH[1][0] - 0.2; k = 0
while t < cut1 - 0.05:
    prog = (t - PH[1][0])/(cut1 - PH[1][0])
    kick(t, 0.25 + 0.35*max(0, prog))
    if prog > 0.3: hat(t + 0.25, 0.03 + 0.03*prog)
    madd(LP(saw(mtof(33), 0.2, 0.003), 300)*env(int(0.2*SR), 0.003, 0.1), t + 0.25, 0.14)
    t += 0.5; k += 1
d = cut1 - (K["demain"] - 0.6)
madd(HP(noise(d), 1500)*np.linspace(0, 1, int(d*SR))**2, K["demain"] - 0.6, 0.08); madd(sweep(180, 1400, d)*np.linspace(0, 1, int(d*SR))**3, K["demain"] - 0.6, 0.04)
x = np.arange(N)/SR
sil = (x > cut1) & (x < K["maintenant"] - 0.01); mL[sil] *= 0.03; mR[sil] *= 0.03
# ─── PARTIE 2 : groove lumineux à 120 BPM (la m → fa → do → sol), dès « MAINTENANT » ───
CH = [[57, 60, 64], [53, 57, 60], [48, 52, 55, 60], [55, 59, 62]]
BASS = [33, 29, 36, 31]
t = K["maintenant"]; k = 0
fin_music = K["end"] + 2.0
while t < fin_music:
    bar = (k // 8) % 4; calm = 0.55 if PH[9][0] - 0.2 < t < PH[9][1] else 1.0      # plus doux pendant Léni
    kick(t, 0.5*calm)
    if k % 2 == 1: clap(t, 0.1*calm)
    hat(t + 0.25, 0.035*calm)
    if k % 8 == 0: pad(t, CH[bar], 4.0, 0.035, 1200)
    madd(LP(pluck(mtof(BASS[bar])), 700), t, 0.32*calm); madd(LP(pluck(mtof(BASS[bar])), 700), t + 0.375, 0.18*calm)
    if k % 2 == 0: madd(pluck(mtof(CH[bar][(k // 2) % len(CH[bar])] + 12), 0.3), t + 0.125, 0.06*calm, 0.25)
    t += 0.5; k += 1
end_t = K["end"] + 0.55
fin = x > end_t; mL[fin] *= np.exp(-(x[fin] - end_t)/0.25); mR[fin] *= np.exp(-(x[fin] - end_t)/0.25)
pad(end_t, [45, 57, 60, 64, 69], DUR - end_t, 0.06, 1400)
mus = np.stack([mL, mR], 1); mus /= np.max(np.abs(mus)) + 1e-9

# ─── bruitages ───
L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def pop(at, f0=420, f1=980, g=0.12, pan=0.0): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g, pan)
def tick(at, g=0.18, hi=True): add(BP(noise(0.015), 2500 if hi else 1200, 7000 if hi else 3500)*env(int(0.015*SR), 0.0003, 0.004), at, g, 0.25 if hi else -0.25)
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(2*f, 1.4, 0.004, 0.3), at + i*0.06, g)
def boom(at, g=0.6): add(sweep(110, 36, 0.8)*env(int(0.8*SR), 0.002, 0.25), at, g); add(LP(noise(0.3), 500)*env(int(0.3*SR), 0.001, 0.05), at, g*0.5)
def stamp(at, g=0.35): add(LP(noise(0.1), 900)*env(int(0.1*SR), 0.001, 0.03), at, g); boom(at, g*0.4)
def paper(at, g=0.1): add(BP(noise(0.22), 1200, 7000)*env(int(0.22*SR), 0.01, 0.06), at, g)
def key(at, g=0.06): add(BP(noise(0.02), 1500, 6000)*env(int(0.02*SR), 0.0005, 0.005), at, g)
def sparkle(at, g=0.035, n=12):
    for i in range(n): add(tone(rng.uniform(2000, 4500), 0.25, 0.002, 0.06), at + i*0.03, g)
def alarm(at, d=0.9, g=0.07):                                    # réveil : sonnerie trillée
    n = int(d*SR); tt = np.arange(n)/SR; gate = (np.sin(2*np.pi*22*tt) > 0).astype(float)
    s = (np.sin(2*np.pi*2350*tt) + 0.5*np.sin(2*np.pi*3100*tt))*gate*np.minimum(1, (d - tt)/0.15)
    add(BP(s, 1500, 6000), at, g)
sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)
alarm(0.0, 0.9, 0.06); boom(0.02, 0.25); pop(Wt(10) - 0.2, 500, 1100, 0.12)
for i in range(int((cut1 - PH[1][0])/0.5)): tick(PH[1][0] + i*0.5, 0.14 + 0.06*(i % 2 == 0), i % 2 == 0)   # tic-tac de la frise
W.place(add, PH[1][0] - 0.1, "MoyenClair", 0.18)
W.place(add, K["fev"], "Court", 0.16); pop(K["fev"], 600, 1300, 0.12)
W.place(add, K["pic"] + 0.1, "MoyenSourd", 0.16); add(sweep(200, 900, 0.6)*env(int(0.6*SR), 0.3, 0.2), K["pic"] - 0.1, 0.04)
W.place(add, K["juin"] + 0.4, "Court", 0.14)
W.place(add, K["demain"] - 0.25, "MoyenClair", 0.2); stamp(K["demain"], 0.3)
boom(K["maintenant"], 0.8); W.place(add, K["maintenant"], "Long", 0.3); chime(K["maintenant"] + 0.05, 0.07); sparkle(K["maintenant"] + 0.1, 0.04)
W.place(add, P2, "MoyenClair", 0.2)
for i in range(4): pop(K["etapes"] - 0.35 + i*0.09, 500 + i*120, 1000 + i*200, 0.11)
for s in STEPS[:4]: W.place(add, s + 0.05, "Court", 0.15); pop(s + 0.1, 450, 1000, 0.1)
pop(K["formation"] - 0.2, 600, 1300, 0.1)
for i in range(3): tick(STEPS[1] + 1.0 + i*0.55 + 0.12, 0.2); pop(STEPS[1] + 1.0 + i*0.55 + 0.1, 700, 1400, 0.08)
for i in range(3): paper(STEPS[2] + 0.35 + i*0.12, 0.06)
W.place(add, K["copier"] - 0.1, "Court", 0.14); add(BP(noise(0.3), 1500, 7000)*env(int(0.3*SR), 0.01, 0.08), K["copier"] + 0.15, 0.12); add(BP(noise(0.3), 1500, 7000)*env(int(0.3*SR), 0.01, 0.08), K["copier"] + 0.3, 0.1)
sparkle(K["mission"] - 0.2, 0.03)
W.place(add, PH[7][0], "MoyenSourd", 0.16)
for at in (K["lien"], K["cv"]): pop(at - 0.2, 600, 1300, 0.11)
for i in range(16): key(K["s30"] - 0.7 + i*0.06, 0.05)
pop(K["s30"] - 0.2, 700, 1500, 0.13); chime(K["s30"], 0.04)
W.place(add, K["spontanee"], "MoyenClair", 0.16)
pop(K["relance"] - 0.2, 500, 1100, 0.11)
stamp(K["conseil"], 0.35)
for i in range(11): tick(K["onze"] - 0.5 + i*0.05, 0.07)
for i in range(7): tick(K["sept"] - 0.4 + i*0.055, 0.07)
boom(K["sept"], 0.35); chime(K["sept"] + 0.05, 0.06); sparkle(K["sept"] + 0.1, 0.04)
pop(PH[10][0] - 0.1, 500, 1100, 0.12); pop(K["offerte"] - 0.25, 600, 1300, 0.13); pop(K["bio"] - 0.15, 700, 1400, 0.12)
boom(K["go"], 0.6); W.place(add, K["go"], "Long", 0.24); chime(K["go"] + 0.05, 0.06)
W.place(add, K["end"] + 0.6, "MoyenClair", 0.15)
sfx = np.stack([L, R], 1)

with wave.open("public/audio/maintenant-voix.wav") as w_:
    vv = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float)/32768
voice = np.zeros(N); voice[:min(N, len(vv))] = vv[:N]
hop = int(0.01*SR); e = np.array([np.sqrt(np.mean(voice[i:i+hop]**2)) for i in range(0, N, hop)])
on = np.clip(np.convolve((e > 0.02).astype(float), np.ones(25)/25, "same")*3, 0, 1)
mus *= (1 - 0.55*np.repeat(on, hop)[:N])[:, None]
mix = mus*0.5 + sfx*2.4 + np.stack([voice, voice], 1)*0.95
von = np.repeat(on, hop)[:N] > 0.9
rms = lambda a: 20*np.log10(np.sqrt(np.mean(a**2)) + 1e-9)
print(f"voix {rms(voice[von]*0.95):.1f} dB · musique sous la voix {rms(mus[von, 0]*0.5):.1f} dB")
mix[-int(0.7*SR):] *= np.linspace(1, 0, int(0.7*SR))[:, None]**1.5
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/maintenant-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/maintenant.wav"], check=True)
os.remove(raw)
print("audio ok")
