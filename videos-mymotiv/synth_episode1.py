# Bande-son de « Les Super-recrues · Épisode 1 : L'entretien » (src/EpisodeEntretien.tsx).
# Dialogue ElevenLabs assemblé (public/audio/episode1-voix.wav) + musique de comédie « film noir » fabriquée ici :
#   hook : contrebasse sournoise puis « ba-dum-tss » (caisse claire + cymbale) après « Moi ? » ;
#   carton-titre : accord de cuivres + timbale ; planche : jazz feutré en ré mineur (contrebasse, balais, ride) ;
#   « Lundi ?! » : coup dramatique « DAN-DAN-DAAAN » ; « en combien de temps ? » : tic-tac d'horloge ; « GLUP » ;
#   « Je fais ça entre deux toits » : le swing revient, crâneur ; « Il faut aussi votre CV » : la musique s'arrête net
#   (bande qui ralentit) ; « Trente-cinq, alors » : trombone triste « wah-wah-wah-waaah » ; fin : swing + accord final.
# Bruitages (UCS) : WHOOSH réels FILM CRUX à chaque mouvement de caméra (tools/sfx_lib.py), PAPER (volets),
# UI POP (bulles), STAMP (« À suivre »), GULP, CLOCK TICK, MAGIC (lettre qui brille). Volume final ≈ -14 LUFS.
import json, os, subprocess, sys, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(41)
V = json.load(open("src/data/episode1-voix.json"))
DUR = V["duration"]; N = int(SR*DUR)
Wt = lambda i: next(m["t0"] for m in V["mots"] if m["i"] == i)
PH = [(p["t0"], p["t1"]) for p in V["phrases"]]
SHOT = [PH[1][0] - 0.3, PH[2][0] - 0.25, PH[3][0] - 0.25, PH[4][0] - 0.2, PH[5][0] - 0.2, PH[6][0] - 0.25, PH[7][0] - 0.25, PH[8][0] - 0.25, PH[9][0] - 0.25, PH[10][0] - 0.25]
TITLE = (PH[0][1] + 0.1, PH[1][0] - 0.3); ENDS = PH[10][1] + 0.35
K = dict(moi=Wt(4), sur=Wt(35), lundi=Wt(40), mm=Wt(53), cv=Wt(75), t35=Wt(76), offerte=Wt(91), lien=Wt(92), end=PH[11][1])

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

mL = np.zeros(N); mR = np.zeros(N)
def madd(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: mL[i:j] += s[:j-i]*g*(1 - max(0, pan)); mR[i:j] += s[:j-i]*g*(1 + min(0, pan))
def bass(at, m, d=0.5, g=0.45):
    f = mtof(m); madd(LP(tone(f, d, 0.004, 0.2) + 0.45*tone(2*f, d, 0.004, 0.11) + 0.15*tone(3*f, d, 0.003, 0.05), 900), at, g)
def ride(at, g=0.04): madd(HP(noise(0.5), 5000)*env(int(0.5*SR), 0.001, 0.15) + 0.3*sum(tone(f, 0.5, 0.001, 0.25) for f in (3150, 4870, 6530)), at, g, 0.35)
def brush(at, g=0.05, d=0.2): madd(BP(noise(d), 1800, 8000)*env(int(d*SR), 0.04, 0.07), at, g, -0.25)
def snare(at, g=0.2): madd(BP(noise(0.18), 900, 5000)*env(int(0.18*SR), 0.001, 0.05) + 0.4*tone(190, 0.18, 0.001, 0.04), at, g)
def tom(at, f=140, g=0.25): madd(sweep(f*1.2, f*0.8, 0.3)*env(int(0.3*SR), 0.002, 0.12), at, g)
def crash(at, g=0.12, d=1.8): madd(HP(noise(d), 3500)*env(int(d*SR), 0.002, d*0.35), at, g)
def kick(at, g=0.4): madd(sweep(110, 42, 0.28)*env(int(0.28*SR), 0.001, 0.09), at, g)
def pad(at, notes, d, g=0.04, cut=700):
    n = int(d*SR); s = LP(sum(saw(mtof(m), d) for m in notes), cut)*np.minimum(1, np.arange(n)/SR/0.4)*np.minimum(1, (d - np.arange(n)/SR)/0.4)
    madd(s, at, g, -0.3); madd(s, at + 0.013, g, 0.3)
def brass(at, notes, d=0.5, g=0.12, cut=2200):
    n = int(d*SR); s = LP(sum(saw(mtof(m), d, 0.004) for m in notes), cut)*env(n, 0.018, d*0.45)
    madd(s, at, g, -0.15); madd(s, at + 0.01, g, 0.15)
def timp(at, m=38, g=0.3): f = mtof(m); madd(LP(tone(f, 1.0, 0.003, 0.35) + 0.4*noise(1.0)*env(int(SR), 0.001, 0.03), 700), at, g)
def trombone(at, m0, m1, d, g=0.14):           # glissando avec vibrato (trombone triste)
    n = int(d*SR); tt = np.arange(n)/SR; f = mtof(m0)*(mtof(m1)/mtof(m0))**(tt/d)*(1 + 0.012*np.sin(2*np.pi*5.5*tt)*np.minimum(1, tt/0.25))
    ph = 2*np.pi*np.cumsum(f)/SR; s = sum(np.sin(k*ph)/k**1.1 for k in range(1, 9))
    madd(LP(s, 1400)*env(n, 0.04, d*0.9)*np.minimum(1, (d - tt)/0.08), at, g)

BEAT = 0.6
def bar(t0, walk, g=1.0, ride_on=True, kick_on=False):
    for b in range(4):
        tb = t0 + b*BEAT
        if tb >= N/SR: return
        bass(tb, walk[b], g=0.42*g)
        if ride_on: ride(tb, 0.04*g); (b % 2 == 1) and ride(tb + BEAT*0.66, 0.03*g)
        brush(tb, 0.045*g) if b % 2 == 0 else brush(tb, 0.07*g, 0.11)
        if kick_on and b % 2 == 0: kick(tb, 0.3*g)
        if kick_on and b % 2 == 1: snare(tb, 0.07*g)
WALK_DM = [[38, 41, 45, 48], [34, 38, 41, 45], [31, 34, 38, 41], [33, 37, 40, 43]]
CH_DM = [[50, 53, 57], [46, 50, 53], [43, 46, 50], [45, 49, 52, 55]]

# hook : contrebasse sournoise (pizz) puis « ba-dum-tss »
for i, m in enumerate((38, 41, 43, 44, 45)): bass(0.1 + i*0.32, m, 0.25, 0.4)
tom(K["moi"] + 0.45, 160, 0.22); tom(K["moi"] + 0.62, 120, 0.22); snare(K["moi"] + 0.8, 0.12); crash(K["moi"] + 0.8, 0.09, 1.2)
# carton-titre
brass(TITLE[0] + 0.05, [50, 53, 57, 62], 1.4, 0.14, 1800); timp(TITLE[0] + 0.05, 38, 0.35); crash(TITLE[0] + 0.05, 0.06, 2.0)
# planche, répliques 1 à 3 : jazz feutré
t = TITLE[1]; b = 0
while t + 4*BEAT <= K["lundi"] - 0.25:
    bar(t, WALK_DM[b % 4], 0.8); pad(t, CH_DM[b % 4], 4*BEAT + 0.3, 0.03, 650); t += 4*BEAT; b += 1
x = np.arange(N)/SR
cut = (x > K["lundi"] - 0.3) & (x < K["lundi"] - 0.02); mL[cut] *= 0.05; mR[cut] *= 0.05
# « Lundi ?! » : DAN-DAN-DAAAN
for i, (ch, d) in enumerate((([46, 50, 53], 0.22), ([45, 49, 52], 0.22), ([44, 47, 50, 53], 1.4))):
    at = K["lundi"] - 0.02 + i*0.24; brass(at, ch, d, 0.16, 1700); timp(at, 38 - i, 0.3)
# « en combien de temps ? » / « trente secondes » : tic-tac + nappe tendue
for i in range(int((PH[6][1] - PH[5][0])/0.5) + 1):
    at = PH[5][0] + i*0.5; madd(BP(noise(0.015), 2500 if i % 2 else 1400, 7000 if i % 2 else 3500)*env(int(0.015*SR), 0.0003, 0.004), at, 0.25)
pad(PH[5][0], [38, 39], PH[6][1] - PH[5][0] + 0.3, 0.04, 400)
# « entre deux toits » → le swing revient, crâneur, jusqu'à « Il faut aussi votre CV »
t = PH[7][0] + 0.1; b = 0
stop = PH[9][0] - 0.15
while t < stop:
    bar(t, [w + 5 for w in WALK_DM[b % 4]], 1.0, kick_on=True); pad(t, [c + 5 for c in CH_DM[b % 4]], 4*BEAT + 0.3, 0.035, 900); t += 4*BEAT; b += 1
brass(PH[8][0] + 0.05, [55, 58, 62, 67], 0.5, 0.1, 2200)
# arrêt net façon bande qui ralentit (tape stop)
i0, i1 = int((stop - 0.45)*SR), int(stop*SR)
for ch in (mL, mR):
    seg_ = ch[i0:i1].copy(); n = len(seg_); idx = np.cumsum(np.linspace(1, 0.05, n)); idx = np.clip(idx, 0, n - 1).astype(int)
    ch[i0:i1] = seg_[idx]*np.linspace(1, 0, n); ch[i1:int(PH[10][1]*SR)] = 0
# « … Trente-cinq, alors. » → trombone triste
tb = PH[10][1] + 0.05
for i, (a, b2, d) in enumerate(((58, 57, 0.32), (57, 56, 0.32), (56, 55, 0.32), (55, 52, 1.3))):
    trombone(tb + i*0.36, a - 12, b2 - 12, d, 0.13)
# fin : swing en fa majeur + accord final
t = ENDS + 0.5; b = 0
WALK_F = [[41, 45, 48, 50], [38, 41, 45, 48], [43, 46, 50, 53], [36, 40, 43, 46]]
CH_F = [[53, 57, 60, 64], [50, 53, 57, 60], [55, 58, 62, 65], [48, 52, 55, 58]]
while t < K["end"] + 0.5:
    bar(t, WALK_F[b % 4], 1.0, kick_on=True); pad(t, CH_F[b % 4], 4*BEAT + 0.3, 0.035, 1000); t += 4*BEAT; b += 1
brass(ENDS + 0.5, [53, 57, 60, 65], 0.6, 0.15, 2600); crash(ENDS + 0.5, 0.1)
end_t = K["end"] + 0.6
fin = x > end_t - 0.05; mL[fin] *= np.exp(-(x[fin] - end_t + 0.05)/0.15); mR[fin] *= np.exp(-(x[fin] - end_t + 0.05)/0.15)
brass(end_t, [41, 53, 57, 60, 62, 67], DUR - end_t, 0.15, 2200); crash(end_t, 0.08)
mus = np.stack([mL, mR], 1); mus /= np.max(np.abs(mus)) + 1e-9

# ─── bruitages ───
L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def pop(at, f0=420, f1=980, g=0.1, pan=0.0): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g, pan)
def paper(at, g=0.1): add(BP(noise(0.3), 1200, 7000)*env(int(0.3*SR), 0.02, 0.08), at, g)
def boom(at, g=0.5): add(sweep(110, 36, 0.8)*env(int(0.8*SR), 0.002, 0.25), at, g); add(LP(noise(0.3), 500)*env(int(0.3*SR), 0.001, 0.05), at, g*0.5)
def stamp(at, g=0.35): add(LP(noise(0.12), 900)*env(int(0.12*SR), 0.001, 0.03), at, g); boom(at, g*0.6)
def sparkle(at, g=0.035, n=14):
    for i in range(n): add(tone(rng.uniform(2000, 4500), 0.25, 0.002, 0.06), at + i*0.03, g)
def gulp(at, g=0.35):
    add(sweep(420, 140, 0.16)*env(int(0.16*SR), 0.005, 0.06), at, g); add(LP(noise(0.05), 800)*env(int(0.05*SR), 0.001, 0.01), at + 0.12, g*0.6)
sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)
pop(0.55, 500, 1100, 0.12)                                          # bulle du hook
for c in (TITLE[0], TITLE[1], ENDS): W.place(add, c, "MoyenClair", 0.18); paper(c - 0.15, 0.08)
for i, s in enumerate(SHOT[1:], 1): W.place(add, s + 0.2, "Court" if i % 2 else "MoyenSourd", 0.16)
for p in (1, 2, 3, 8): pop(PH[p][0] - 0.05, 450, 1000, 0.08)
for p in (4, 5, 6, 7, 9): pop(PH[p][0] - 0.05, 600, 1300, 0.1)
sparkle(K["sur"], 0.035)
gulp(PH[6][0] + 0.9, 0.4)
pop(K["t35"] - 0.25, 400, 900, 0.1)
stamp(ENDS + 0.5, 0.4); sparkle(ENDS + 0.6, 0.03)
pop(K["offerte"] - 0.3, 600, 1300, 0.12); pop(K["lien"] - 0.15, 700, 1400, 0.12)
W.place(add, K["end"] + 0.6, "Long", 0.18)
sfx = np.stack([L, R], 1)

with wave.open("public/audio/episode1-voix.wav") as w_:
    vv = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float)/32768
voice = np.zeros(N); voice[:min(N, len(vv))] = vv[:N]
hop = int(0.01*SR); e = np.array([np.sqrt(np.mean(voice[i:i+hop]**2)) for i in range(0, N, hop)])
on = np.clip(np.convolve((e > 0.02).astype(float), np.ones(25)/25, "same")*3, 0, 1)
mus *= (1 - 0.55*np.repeat(on, hop)[:N])[:, None]
mix = mus*0.55 + sfx*2.4 + np.stack([voice, voice], 1)*0.95
von = np.repeat(on, hop)[:N] > 0.9
rms = lambda a: 20*np.log10(np.sqrt(np.mean(a**2)) + 1e-9)
print(f"voix {rms(voice[von]*0.95):.1f} dB · musique sous la voix {rms(mus[von, 0]*0.55):.1f} dB")
mix[-int(0.6*SR):] *= np.linspace(1, 0, int(0.6*SR))[:, None]**1.5
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/episode1-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/episode1.wav"], check=True)
os.remove(raw)
print("audio ok")
