# Bande-son de « Donne-moi 30 secondes » (src/Chrono30.tsx) : voix ElevenLabs assemblée (public/audio/chrono-voix.wav,
# tools/assembler-lignes.py) + musique fabriquée ici, calée sur le compte à rebours : un tic-tac à CHAQUE seconde du
# chrono (de 0:30 à 0:00), une pulsation électro (120 BPM = 2 temps par seconde, alignée sur le chrono) qui s'épaissit
# au fil des secondes, roulement + montée pendant « trois… deux… un… », silence sec puis IMPACT sur « prête »,
# fin apaisée. Ducking sous la voix. Bruitages (UCS) : CLOCK TICK, UI POP, PAPER, IMPACT, RISER, BELL, MAGIC/SPARKLE,
# KEYBOARD, + whooshes réels FILM CRUX (tools/sfx_lib.py). Volume final ≈ -14 LUFS.
import json, os, subprocess, sys, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(61)
V = json.load(open("src/data/chrono-voix.json"))
DUR = V["duration"]; N = int(SR*DUR)
Wt = lambda i: next(m["t0"] for m in V["mots"] if m["i"] == i)
PH = [(p["t0"], p["t1"]) for p in V["phrases"]]
END = Wt(93); T0 = END - 30
K = dict(bateau=Wt(22), cette=Wt(23), offre=Wt(27), logo=Wt(30), cv=Wt(36), madame=Wt(47), onze=Wt(52), sept=Wt(58),
         offerte=Wt(61), inscription=Wt(65), carte=Wt(67), ouvre=Wt(70), copie=Wt(76), bio=Wt(79), trois=Wt(82), deux=Wt(83), un=Wt(84))

def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a, dec): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
mtof = lambda m: 440*2**((m - 69)/12)
def saw(f, d, det=0.006):
    t = np.arange(int(d*SR))/SR
    return sum(2*((t*f*(1 + dd) + k*0.37) % 1) - 1 for k, dd in enumerate((-det, 0, det)))/3

mL = np.zeros(N); mR = np.zeros(N)
def madd(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: mL[i:j] += s[:j-i]*g*(1 - max(0, pan)); mR[i:j] += s[:j-i]*g*(1 + min(0, pan))
def kick(at, g=0.8): madd(sweep(130, 44, 0.3)*env(int(0.3*SR), 0.001, 0.1), at, g)
def hat(at, g=0.05): madd(HP(noise(0.03), 8000)*env(int(0.03*SR), 0.0005, 0.008), at, g, rng.uniform(-0.3, 0.3))
def clap(at, g=0.18):
    for o in (0, 0.011, 0.022): madd(sosfilt(butter(2, [900, 3500], "bp", fs=SR, output="sos"), noise(0.14))*env(int(0.14*SR), 0.001, 0.04), at + o, g*0.6)
CH = [[57, 60, 64], [53, 57, 60], [55, 59, 62], [52, 55, 59]]   # la m, fa, sol, mi m
# avant le chrono : une nappe en suspens
madd(LP(saw(mtof(45), T0 + 0.2, 0.01), 400)*np.linspace(0.3, 1, int((T0 + 0.2)*SR)), 0, 0.1)
# pendant les 30 s : 2 temps par seconde, la densité monte avec le temps écoulé
k = 0
while T0 + k*0.5 < K["trois"] - 0.2:
    t = T0 + k*0.5; prog = (t - T0)/30; ch = CH[(k//8) % 4]
    kick(t, 0.55 + 0.25*prog)
    if k % 2 == 1: clap(t, 0.12 + 0.1*prog)
    hat(t + 0.25, 0.04 + 0.03*prog)
    if prog > 0.35: hat(t + 0.125, 0.03); hat(t + 0.375, 0.03)
    if k % 8 == 0:
        d = 4.0; s = LP(sum(saw(mtof(n), d) for n in ch), 900 + 900*prog)*np.minimum(1, np.arange(int(d*SR))/SR/0.3)*np.minimum(1, (d - np.arange(int(d*SR))/SR)/0.3)
        madd(s, t, 0.05, -0.3); madd(s, t + 0.012, 0.05, 0.3)
    madd(LP(saw(mtof(ch[0] - 24), 0.22, 0.003), 380)*env(int(0.22*SR), 0.003, 0.12), t + 0.25, 0.2)
    k += 1
# trois… deux… un… : roulement qui accélère, montée, puis silence sec juste avant « prête »
tt, step = K["trois"] - 0.2, 0.25
while tt < END - 0.25:
    madd(sosfilt(butter(2, [300, 5000], "bp", fs=SR, output="sos"), noise(0.1))*env(int(0.1*SR), 0.001, 0.03), tt, 0.1 + 0.2*(tt - K["trois"])/(END - K["trois"]))
    tt += step; step = max(0.04, step*0.86)
d = END - 0.2 - (K["trois"] - 0.2)
madd(HP(noise(d), 1500)*np.linspace(0, 1, int(d*SR))**2, K["trois"] - 0.2, 0.12); madd(sweep(200, 1500, d)*np.linspace(0, 1, int(d*SR))**3, K["trois"] - 0.2, 0.05)
x = np.arange(N)/SR
cut = (x > END - 0.18) & (x < END - 0.01); mL[cut] *= 0.05; mR[cut] *= 0.05
# après « prête » : accord ouvert
d = DUR - END
s = LP(sum(saw(mtof(n), d) for n in (57, 64, 69, 72)), 1600)*np.exp(-np.arange(int(d*SR))/SR/1.6)
madd(s, END, 0.08, -0.3); madd(s, END + 0.012, 0.08, 0.3)
mus = np.stack([mL, mR], 1); mus /= np.max(np.abs(mus)) + 1e-9

L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def tick(at, g=0.25, hi=True): add(sosfilt(butter(2, [2500, 7000] if hi else [1200, 3500], "bp", fs=SR, output="sos"), noise(0.015))*env(int(0.015*SR), 0.0003, 0.004), at, g, 0.25 if hi else -0.25)
def pop(at, f0=420, f1=980, g=0.12, pan=0.0): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g, pan)
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(2*f, 1.4, 0.004, 0.3), at + i*0.06, g)
def boom(at, g=0.6): add(sweep(110, 36, 0.8)*env(int(0.8*SR), 0.002, 0.25), at, g); add(LP(noise(0.3), 500)*env(int(0.3*SR), 0.001, 0.05), at, g*0.5)
def stamp(at, g=0.35): add(LP(noise(0.1), 900)*env(int(0.1*SR), 0.001, 0.03), at, g); boom(at, g*0.4)
def paper(at, g=0.1): add(sosfilt(butter(2, [1200, 7000], "bp", fs=SR, output="sos"), noise(0.18))*env(int(0.18*SR), 0.01, 0.05), at, g)
def key(at, g=0.08): add(sosfilt(butter(2, [1500, 6000], "bp", fs=SR, output="sos"), noise(0.02))*env(int(0.02*SR), 0.0005, 0.005), at, g)
def sparkle(at, g=0.04):
    for i in range(12): add(tone(rng.uniform(2000, 4500), 0.25, 0.002, 0.06), at + i*0.03, g)
sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)
for s_ in range(31): tick(T0 + s_, 0.22 + 0.12*s_/30, s_ % 2 == 0)       # tic-tac : une fois par seconde du chrono
boom(0.02, 0.3); W.place(add, T0 + 0.4, "MoyenClair", 0.2)
W.place(add, PH[1][0], "Court", 0.18)
stamp(K["bateau"], 0.3); W.place(add, K["cette"] + 0.1, "Court", 0.2); paper(K["cette"], 0.1); pop(K["offre"], 600, 1200, 0.1)
for i in range(4): tick(K["logo"] - 0.4 + i*0.1, 0.08)
pop(K["logo"], 700, 1500, 0.14); chime(K["logo"] + 0.03, 0.04); paper(K["cv"], 0.1); W.place(add, K["cv"], "Court", 0.16)
W.place(add, PH[3][0], "MoyenSourd", 0.18)
for i in range(17): key(K["madame"] - 0.05 + i*(1.0/17), 0.07)
W.place(add, PH[4][0], "Court", 0.18)
for i in range(11): tick(K["onze"] - 0.3 + i*0.065, 0.08)
boom(K["sept"], 0.4); chime(K["sept"] + 0.05, 0.06); sparkle(K["sept"] + 0.1)
for at in (K["offerte"], K["inscription"], K["carte"]): pop(at, 600, 1300, 0.13)
W.place(add, PH[6][0], "Court", 0.16)
for at in (K["ouvre"], K["copie"], K["bio"]): pop(at, 700, 1400, 0.13)
for at in (K["trois"], K["deux"], K["un"]): boom(at, 0.22)
boom(END, 0.8); W.place(add, END, "Long", 0.32); chime(END + 0.05, 0.08); sparkle(END + 0.15, 0.05); paper(END + 0.2, 0.12)
W.place(add, END + 1.05, "MoyenClair", 0.18); pop(END + 1.2, 600, 1300, 0.12)
sfx = np.stack([L, R], 1)

with wave.open("public/audio/chrono-voix.wav") as w_:
    vv = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float)/32768
voice = np.zeros(N); voice[:min(N, len(vv))] = vv[:N]
hop = int(0.01*SR); e = np.array([np.sqrt(np.mean(voice[i:i+hop]**2)) for i in range(0, N, hop)])
on = np.clip(np.convolve((e > 0.02).astype(float), np.ones(25)/25, "same")*3, 0, 1)
mus *= (1 - 0.6*np.repeat(on, hop)[:N])[:, None]
mix = mus*0.5 + sfx*2.6 + np.stack([voice, voice], 1)*0.95
mix[-int(0.8*SR):] *= np.linspace(1, 0, int(0.8*SR))[:, None]**1.5
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/chrono-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/chrono.wav"], check=True)
os.remove(raw)
print("audio ok")
