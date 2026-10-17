# Bande-son de « Moi c'est Yann » (src/PresentationYann.tsx) : voix ElevenLabs de Yann (public/audio/yann-voix.wav,
# tools/assembler-lignes.py) + musique fabriquée ici : groove chaleureux et moderne (100 BPM, ré majeur, piano électrique,
# basse ronde, grosse caisse feutrée, claps), qui s'ouvre sur « Alors j'ai créé MyMotiv » et redescend pour Léni.
# Bruitages (UCS) : mosaïque qui s'allume (UI POP en cascade), déclic à chaque changement de pose (CAMERA SHUTTER léger),
# compteur des 100 000 € (CLICK TICK + CASH-like chime), papiers des CV, tampon « Retenu », frappe sur le vrai site,
# cloche du prix, compteur de Léni, whooshes réels FILM CRUX (tools/sfx_lib.py). Ducking sous la voix. ≈ -14 LUFS.
import json, os, subprocess, sys, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(23)
V = json.load(open("src/data/yann-voix.json"))
DUR = V["duration"]; N = int(SR*DUR)
Wt = lambda i: next(m["t0"] for m in V["mots"] if m["i"] == i)
PH = [(p["t0"], p["t1"]) for p in V["phrases"]]
K = dict(bonjour=Wt(0), yann=Wt(4), mm=Wt(11), possible=Wt(18), anDemi=Wt(21), paris=Wt(30), cent=Wt(39), chose=Wt(55), deuxCv=Wt(57),
         lettre=Wt(64), diff=Wt(68), cree=Wt(72), lien=Wt(78), cv=Wt(83), s30=Wt(86), cette=Wt(95), semaine=Wt(106), prix=Wt(109),
         mesure=Wt(114), entretiens=Wt(131), onze=Wt(135), sept=Wt(137), offerte=Wt(143), bio=Wt(149), jouer=Wt(153), end=PH[9][1])
# mêmes changements de pose que POSES dans le .tsx
POSES = [1.25, PH[1][0], 4.8, PH[2][0], 8.0, PH[3][0], K["cent"] - 0.15, PH[4][0], K["chose"] - 0.6, K["deuxCv"] - 0.25, K["deuxCv"] + 0.85,
         K["lettre"] - 0.1, PH[5][0], K["lien"] - 0.45, K["cv"] - 0.05, K["cette"] - 1.1, PH[6][0], Wt(103) - 0.4, K["semaine"] - 0.7,
         K["prix"] - 0.2, PH[7][0], Wt(121) - 0.15, Wt(127) - 0.6, PH[8][0], PH[9][0]]

def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def BP(s, lo, hi): return sosfilt(butter(2, [lo, hi], "bp", fs=SR, output="sos"), s)
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a=0.005, dec=0.5): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
mtof = lambda m: 440*2**((m - 69)/12)
def epiano(f, d=1.2):                                   # piano électrique (FM simple)
    t = np.arange(int(d*SR))/SR
    return np.sin(2*np.pi*f*t + 1.2*np.exp(-t*6)*np.sin(2*np.pi*f*2*t))*np.exp(-t*2.2)*np.minimum(1, t/0.004)

mL = np.zeros(N); mR = np.zeros(N)
def madd(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: mL[i:j] += s[:j-i]*g*(1 - max(0, pan)); mR[i:j] += s[:j-i]*g*(1 + min(0, pan))
def kick(at, g=0.5): madd(LP(sweep(110, 45, 0.3)*env(int(0.3*SR), 0.002, 0.1), 900), at, g)
def clap(at, g=0.1):
    for o in (0, 0.012, 0.024): madd(BP(noise(0.15), 900, 3500)*env(int(0.15*SR), 0.001, 0.045), at + o, g*0.6)
def hat(at, g=0.03): madd(HP(noise(0.03), 7500)*env(int(0.03*SR), 0.0005, 0.01), at, g, rng.uniform(-0.3, 0.3))
def bass(at, m, d=0.5, g=0.3): f = mtof(m); madd(LP(tone(f, d, 0.005, 0.25) + 0.3*tone(2*f, d, 0.005, 0.12), 600), at, g)

BEAT = 0.6
CH = [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 67]]     # Ré maj7, Si m7, Sol maj7, La7
BS = [38, 35, 31, 33]
t = 0.0; k = 0
while t < K["end"] + 0.6:
    bar = (k // 4) % 4
    full = PH[5][0] - 0.1 <= t < PH[8][0] - 0.1 or t >= PH[9][0] - 0.1     # plus plein à partir de MyMotiv, sauf Léni
    intro = t < PH[1][0] - 0.1
    if not intro:
        kick(t, 0.42 if full else 0.3)
        if k % 2 == 1: clap(t, 0.09 if full else 0.06)
        hat(t + BEAT/2, 0.03); (full and hat(t + BEAT/4, 0.02)); (full and hat(t + 3*BEAT/4, 0.02))
        bass(t, BS[bar], 0.45, 0.28 if full else 0.2); bass(t + BEAT*0.75, BS[bar] + 12, 0.2, 0.1)
    if k % 4 == 0:
        for j, m in enumerate(CH[bar]): madd(epiano(mtof(m), 2.4), t + j*0.012, 0.05 if not intro else 0.07, (j - 1.5)*0.2)
    if k % 2 == 1: madd(epiano(mtof(CH[bar][(k // 2) % 4] + 12), 0.8), t + BEAT/2, 0.03, 0.3)
    t += BEAT; k += 1
x = np.arange(N)/SR
end_t = K["end"] + 0.4
fin = x > end_t; mL[fin] *= np.exp(-(x[fin] - end_t)/0.4); mR[fin] *= np.exp(-(x[fin] - end_t)/0.4)
for j, m in enumerate((50, 62, 66, 69, 73, 76)): madd(epiano(mtof(m), DUR - end_t), end_t + j*0.03, 0.06, (j - 2.5)*0.15)
mus = np.stack([mL, mR], 1); mus /= np.max(np.abs(mus)) + 1e-9

L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def pop(at, f0=420, f1=980, g=0.1, pan=0.0): add(sweep(f0, f1, 0.08)*env(int(0.08*SR), 0.002, 0.03), at, g, pan)
def tick(at, g=0.12): add(BP(noise(0.012), 2500, 7000)*env(int(0.012*SR), 0.0003, 0.003), at, g)
def shutter(at, g=0.07): add(BP(noise(0.03), 1500, 6000)*env(int(0.03*SR), 0.0005, 0.008), at, g); add(BP(noise(0.04), 800, 3000)*env(int(0.04*SR), 0.001, 0.012), at + 0.05, g*0.7)
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.3, 0.004, 0.45) + 0.25*tone(2*f, 1.3, 0.004, 0.3), at + i*0.06, g)
def boom(at, g=0.5): add(sweep(110, 36, 0.7)*env(int(0.7*SR), 0.002, 0.22), at, g)
def paper(at, g=0.08): add(BP(noise(0.22), 1200, 7000)*env(int(0.22*SR), 0.01, 0.06), at, g)
def key(at, g=0.05): add(BP(noise(0.02), 1500, 6000)*env(int(0.02*SR), 0.0005, 0.005), at, g)
def sparkle(at, g=0.03, n=12):
    for i in range(n): add(tone(rng.uniform(2000, 4500), 0.25, 0.002, 0.06), at + i*0.03, g)
sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)
for i in range(24):                                     # la mosaïque s'allume, du centre vers les bords
    c, r = i % 4, i // 4; d = ((c - 1.5)**2 + (r - 2.5)**2) ** 0.5
    pop(-0.1 + d*0.06 + 0.12, 500 + 40*(i % 6), 1100 + 60*(i % 5), 0.035, (c - 1.5)*0.25)
W.place(add, 1.0, "MoyenClair", 0.2)
boom(K["yann"], 0.4); chime(K["yann"] + 0.03, 0.05)
for p in POSES[1:]: shutter(p, 0.06)
pop(K["mm"] - 0.2, 600, 1300, 0.12); sparkle(K["possible"] - 0.2, 0.03)
pop(K["anDemi"] - 0.3, 500, 1100, 0.12); pop(K["paris"] - 0.3, 600, 1300, 0.1)
for i in range(18): tick(K["cent"] - 0.9 + i*0.052, 0.07)
boom(K["cent"] + 0.02, 0.35); chime(K["cent"] + 0.05, 0.05)
W.place(add, PH[4][0], "Court", 0.14)
paper(K["deuxCv"] - 0.25, 0.09); paper(K["deuxCv"] - 0.1, 0.08)
W.place(add, K["lettre"] - 0.05, "Court", 0.15); pop(K["diff"] - 0.15, 700, 1500, 0.13); boom(K["diff"], 0.25)
W.place(add, PH[5][0] + 0.1, "MoyenSourd", 0.18)
for at in (K["lien"], K["cv"], K["s30"]): pop(at - 0.2, 600, 1300, 0.1)
for i in range(14): key(K["s30"] - 0.1 + i*0.06, 0.045)
chime(K["cette"], 0.04)
W.place(add, K["semaine"] - 0.3, "MoyenClair", 0.18); boom(K["prix"], 0.3); chime(K["prix"] + 0.03, 0.06)
for i in range(4): tick(K["prix"] + 0.3 + i*0.12, 0.08)
for i in range(3): pop(K["mesure"] - 0.2 + i*0.18, 650, 1400, 0.08)
pop(K["entretiens"] - 0.35, 700, 1500, 0.12); sparkle(K["entretiens"], 0.03)
for i in range(11): tick(K["onze"] - 0.5 + i*0.05, 0.06)
for i in range(7): tick(K["sept"] - 0.4 + i*0.055, 0.06)
boom(K["sept"], 0.3); chime(K["sept"] + 0.05, 0.05)
pop(K["offerte"] - 0.4, 600, 1300, 0.12); pop(K["bio"] - 0.3, 700, 1400, 0.12)
boom(K["jouer"], 0.45); W.place(add, K["jouer"], "Long", 0.2)
for i in range(24): pop(K["end"] + ((i % 4 - 1.5)**2 + (i // 4 - 2.5)**2) ** 0.5 * 0.06 + 0.05, 600, 1200, 0.025)
sfx = np.stack([L, R], 1)

with wave.open("public/audio/yann-voix.wav") as w_:
    vv = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float)/32768
voice = np.zeros(N); voice[:min(N, len(vv))] = vv[:N]
hop = int(0.01*SR); e = np.array([np.sqrt(np.mean(voice[i:i+hop]**2)) for i in range(0, N, hop)])
on = np.clip(np.convolve((e > 0.02).astype(float), np.ones(25)/25, "same")*3, 0, 1)
mus *= (1 - 0.5*np.repeat(on, hop)[:N])[:, None]
mix = mus*0.36 + sfx*2.3 + np.stack([voice, voice], 1)*0.95
von = np.repeat(on, hop)[:N] > 0.9
rms = lambda a: 20*np.log10(np.sqrt(np.mean(a**2)) + 1e-9)
print(f"voix {rms(voice[von]*0.95):.1f} dB · musique sous la voix {rms(mus[von, 0]*0.36):.1f} dB")
mix[-int(0.7*SR):] *= np.linspace(1, 0, int(0.7*SR))[:, None]**1.5
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/yann-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/yann.wav"], check=True)
os.remove(raw)
print("audio ok")
