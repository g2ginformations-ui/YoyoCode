# Bande-son de « Alternance partout » (src/AlternancePartout.tsx) : voix ElevenLabs montée (public/audio/alternance-voix.wav)
# + musique électronique épurée fabriquée ici (fa mineur, 100 BPM) : pulsation sourde qui monte pendant le hook
# (« alternant » partout, l'anneau qui se resserre), chute nette sur « t'es foutu », nappe qui respire sur « Respire »,
# drop sur « MyMotiv » (grosse caisse, basse, notes pincées), plus discrète sous la voix (ducking), ouverture finale.
# Bruitages réels (whooshes FILM CRUX, tools/sfx_lib.py) + fabriqués (UCS : UI POP, IMPACT, RISER, SWITCH, CAMERA
# SHUTTER, BELL, MAGIC/SPARKLE). Volume final ≈ -14 LUFS.
import json, os, subprocess, sys, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(53)
V = json.load(open("src/data/alternance-voix.json"))
DUR = V["duration"]; N = int(SR*DUR)
Wt = lambda i: next(m["t0"] for m in V["mots"] if m["i"] == i)
PH = [(p["t0"], p["t1"]) for p in V["phrases"]]
T = dict(partout=Wt(8), rentree=Wt(29), foutu=Wt(32), respire=Wt(33), cfa=Wt(44), sans=Wt(45), troisMois=Wt(50), q3=PH[5][0],
         mm=Wt(62), meilleure=Wt(65), top=Wt(71), autres=PH[9][0], prompt=Wt(78), generique=Wt(83), reprendre=Wt(87), nous=PH[11][0],
         s30=Wt(89), colles=Wt(92), cv=Wt(98), lettre=Wt(100), logo=Wt(112), inventer=Wt(115), vois=PH[16][0], ia=Wt(127),
         ribbons=PH[18][0], offerte=Wt(140), bio=Wt(144), postule=Wt(147), recruter=Wt(151), end=PH[20][1])
HOOK_AT = [0.0] + [0.12 + i*0.2 for i in range(1, 12)]

def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a, dec): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
mtof = lambda m: 440*2**((m - 69)/12)
def pluck(f, d=0.4): t = np.arange(int(d*SR))/SR; return sum(np.sin(2*np.pi*f*h*t)*np.exp(-t*(5 + h*h*2.5))/h for h in range(1, 6))*np.minimum(1, t/0.002)
def saw(f, d, det=0.006):
    t = np.arange(int(d*SR))/SR
    return sum(2*((t*f*(1 + dd) + k*0.37) % 1) - 1 for k, dd in enumerate((-det, 0, det)))/3

mL = np.zeros(N); mR = np.zeros(N)
def madd(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: mL[i:j] += s[:j-i]*g*(1 - max(0, pan)); mR[i:j] += s[:j-i]*g*(1 + min(0, pan))
BEAT = 0.6; G0 = T["mm"]                                     # 100 BPM, grille calée sur « MyMotiv »
CH = [[53, 56, 60], [49, 53, 56], [56, 60, 63], [51, 55, 58]]   # fa m, ré♭, la♭, mi♭
def kick(at, g=0.8): madd(sweep(130, 44, 0.32)*env(int(0.32*SR), 0.001, 0.11), at, g)
def hat(at, g=0.06): madd(HP(noise(0.035), 8000)*env(int(0.035*SR), 0.0005, 0.009), at, g, rng.uniform(-0.3, 0.3))
def clap(at, g=0.2):
    for o in (0, 0.011, 0.022): madd(sosfilt(butter(2, [900, 3500], "bp", fs=SR, output="sos"), noise(0.15))*env(int(0.15*SR), 0.001, 0.04), at + o, g*0.6)
def pad(at, d, notes, g=0.07, cut=1200):
    s = sum(saw(mtof(n), d) for n in notes); e = np.minimum(1, np.arange(len(s))/SR/0.4)*np.minimum(1, (d - np.arange(len(s))/SR)/0.5)
    s = LP(LP(s, cut), cut)*e; madd(s, at, g, -0.3); madd(s, at + 0.015, g, 0.3)
# hook : pulsation sourde qui accélère avec l'anneau, coupée net sur « t'es foutu »
tt, step = 0.0, 0.6
while tt < T["foutu"] - 0.05:
    madd(sweep(90, 45, 0.25)*env(int(0.25*SR), 0.002, 0.1), tt, 0.5 + 0.3*tt/T["foutu"]); tt += step; step = max(0.25, step*0.95)
d = T["foutu"] - PH[1][0]; madd(LP(saw(mtof(41), d, 0.01), 300)*np.linspace(0.2, 1, int(d*SR)), PH[1][0], 0.12)
madd(HP(noise(T["foutu"] - T["rentree"]), 1500)*np.linspace(0, 1, int((T["foutu"] - T["rentree"])*SR))**2, T["rentree"], 0.1)
# « Respire » : nappe qui respire jusqu'à MyMotiv
d = T["mm"] - T["respire"]
e_ = 0.6 + 0.4*np.sin(np.linspace(-np.pi/2, np.pi*2.5, int(d*SR)))
madd(LP(sum(saw(mtof(n), d) for n in (53, 60, 65)), 900)*e_*np.minimum(1, np.arange(int(d*SR))/SR/1.0), T["respire"], 0.06)
madd(HP(noise(1.0), 1500)*np.linspace(0, 1, int(SR))**2, T["mm"] - 1.0, 0.1)
# drop : groove épuré jusqu'à la fin
b = 0
while G0 + b*BEAT < DUR - 0.3:
    t = G0 + b*BEAT; ch = CH[(b//4) % 4]; final = t >= T["end"] + 0.5
    if b % 4 == 0: pad(t, 4*BEAT + 0.1, ch, 0.06)
    if not final:
        kick(t, 0.75); hat(t + BEAT/2)
        if b % 2 == 1: clap(t)
        madd(LP(saw(mtof(ch[0] - 24), BEAT*0.45, 0.003), 400)*env(int(BEAT*0.45*SR), 0.003, 0.2), t + BEAT/2, 0.22)
        madd(pluck(mtof(ch[b % 3] + 12)), t, 0.07, (-0.3, 0.3)[b % 2])
    b += 1
x = np.arange(N)/SR; ph = ((x - G0) % BEAT)/BEAT
mL *= np.where(x >= G0, 1 - 0.35*np.exp(-ph*7), 1.0); mR *= np.where(x >= G0, 1 - 0.35*np.exp(-ph*7), 1.0)
mus = np.stack([mL, mR], 1); mus /= np.max(np.abs(mus)) + 1e-9

L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def click(at, g=0.3): add(HP(noise(0.012), 3000)*env(int(0.012*SR), 0.0002, 0.003), at, g)
def pop(at, f0=420, f1=980, g=0.12, pan=0.0): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g, pan)
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(2*f, 1.4, 0.004, 0.3), at + i*0.06, g)
def boom(at, g=0.5): add(sweep(110, 36, 0.8)*env(int(0.8*SR), 0.002, 0.25), at, g); add(LP(noise(0.3), 500)*env(int(0.3*SR), 0.001, 0.05), at, g*0.5)
def sparkle(at, g=0.035):
    for i in range(10): add(tone(rng.uniform(2000, 4500), 0.25, 0.002, 0.06), at + i*0.03, g)
def switch(at, g=0.3): click(at, g); add(LP(noise(0.08), 300)*env(int(0.08*SR), 0.001, 0.03), at + 0.01, g)
def shutter(at, g=0.25): click(at, g); click(at + 0.06, g*0.8); add(HP(noise(0.05), 2500)*env(int(0.05*SR), 0.001, 0.015), at + 0.02, g*0.5)
def thump(at, g=0.35): add(sweep(90, 45, 0.25)*env(int(0.25*SR), 0.001, 0.08), at, g)
sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)
boom(0.0, 0.35)
for i, at in enumerate(HOOK_AT): pop(max(0, at + 0.05), 500 + (i % 4)*120, 1000 + (i % 4)*200, 0.1, (-0.4, 0.4)[i % 2])
W.place(add, PH[1][0] + 0.4, "MoyenSourd", 0.22)
pop(T["rentree"] - 0.2, 400, 700, 0.12)
W.place(add, T["foutu"] + 0.3, "Long", 0.25); boom(T["foutu"] + 0.05, 0.3)
pop(T["cfa"] - 0.1, 600, 1200, 0.12); pop(T["sans"], 500, 900, 0.1); chime(T["troisMois"], 0.05)
W.place(add, T["q3"] + 0.05, "Court", 0.2); boom(T["q3"], 0.3)
boom(T["mm"], 0.6); W.place(add, T["mm"], "Long", 0.3); chime(T["mm"] + 0.15, 0.05); sparkle(T["mm"] + 0.25)
W.place(add, PH[7][0], "Court", 0.18); pop(T["top"], 700, 1500, 0.15); sparkle(T["top"] + 0.05)
switch(T["autres"], 0.35)
for at in (T["prompt"], T["generique"], T["reprendre"]): W.place(add, at, "Court", 0.15)
switch(T["nous"], 0.35); boom(T["s30"], 0.35); chime(T["s30"] + 0.05, 0.06)
W.place(add, PH[13][0], "MoyenClair", 0.22)
for i in range(12): click(T["colles"] + i*0.05, 0.05)
pop(T["cv"], 500, 1200, 0.12)
for i, at in enumerate((T["lettre"], Wt(105), T["logo"], T["inventer"])): pop(at, 600 + i*100, 1300 + i*120, 0.12, (-0.3, 0.3)[i % 2])
W.place(add, T["vois"] + 0.2, "MoyenSourd", 0.2); shutter(T["vois"] + 0.6, 0.3); pop(T["ia"], 700, 1500, 0.14)
W.place(add, T["ribbons"] + 0.3, "Long", 0.3); thump(T["ribbons"] + 0.85, 0.35); thump(T["ribbons"] + 1.05, 0.45)
pop(T["offerte"], 600, 1300, 0.14); pop(T["bio"], 700, 1400, 0.14); chime(T["bio"] + 0.05, 0.04)
pop(T["postule"], 500, 1000, 0.12); sparkle(T["recruter"] + 0.1); W.place(add, T["end"] + 0.9, "Long", 0.22)
sfx = np.stack([L, R], 1)

with wave.open("public/audio/alternance-voix.wav") as w_:
    vv = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float)/32768
voice = np.zeros(N); voice[:min(N, len(vv))] = vv[:N]
hop = int(0.01*SR); e = np.array([np.sqrt(np.mean(voice[i:i+hop]**2)) for i in range(0, N, hop)])
on = np.clip(np.convolve((e > 0.02).astype(float), np.ones(25)/25, "same")*3, 0, 1)
mus *= (1 - 0.62*np.repeat(on, hop)[:N])[:, None]
mix = mus*0.5 + sfx*2.6 + np.stack([voice, voice], 1)*0.95
mix[-int(1.0*SR):] *= np.linspace(1, 0, int(1.0*SR))[:, None]**1.5
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/alternance-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/alternance.wav"], check=True)
os.remove(raw)
print("audio ok")
