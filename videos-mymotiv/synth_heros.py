# Bande-son de « Super-recrues » (src/SuperRecrues.tsx) : voix ElevenLabs assemblée (public/audio/heros-voix.wav,
# tools/assembler-lignes.py) + musique « film noir » fabriquée ici :
#   A. hook → duel : jazz noir en ré mineur (contrebasse qui marche, ride swing, balais, nappe de cordes, cuivre en sourdine
#      à chaque héros), tonnerre sur le justicier ;  coupure sèche puis TAMPON sur « Non. » ;
#   B. la lettre : célesta en arpèges dans la lumière, cachet « mm. » (carillon), puis pulsation douce sur le vrai site ;
#   C. l'Agence Nova : montée (roulement de timbales + souffle) → néon qui grésille → COUP d'orchestre sur « pris » ;
#   D. Yann : contrebasse pizzicato et claquements de doigts, cape qui claque au vent puis s'envole ;
#   E. final : swing big band en fa majeur, cuivres sur « Postulez », accord final sur le logo.
# Ducking sous la voix, bruitages (UCS) : THUNDER, RAIN, IMPACT, STAMP, PAPER, MAGIC, NEON BUZZ, CLOTH FLAP, UI POP,
# + whooshes réels FILM CRUX (tools/sfx_lib.py). Volume final ≈ -14 LUFS.
import json, os, subprocess, sys, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(29)
V = json.load(open("src/data/heros-voix.json"))
DUR = V["duration"]; N = int(SR*DUR)
Wt = lambda i: next(m["t0"] for m in V["mots"] if m["i"] == i)
PH = [(p["t0"], p["t1"]) for p in V["phrases"]]
K = dict(avis=Wt(2), heros=Wt(7), s1=PH[1][0], masque=Wt(11), s2=PH[2][0], rouge=Wt(24), s3=PH[3][0], test=Wt(29), duel=Wt(33),
         non=Wt(38), lettre=Wt(44), avec=Wt(47), mm=Wt(48), s5=PH[5][0], lien=Wt(50), cv=Wt(55), trente=Wt(58), lettre2=Wt(61),
         mission=Wt(66), pas=Wt(67), copie=Wt(70), s6=PH[6][0], postule=Wt(74), agence=Wt(77), nova=Wt(78), s7=PH[7][0], pris=Wt(83),
         s8=PH[8][0], cape=Wt(89), pasGrave=Wt(90), tasCv=Wt(92), cv2=Wt(95), s9=PH[9][0], mm2=Wt(97), postulez=Wt(99),
         recruter=Wt(103), s10=PH[10][0], offerte=Wt(108), lien2=Wt(109), bio=Wt(111), end=PH[10][1])
C = dict(c1=K["s1"] - 0.12, c2=K["s2"] - 0.08, c3=K["s3"] - 0.1, c4=K["non"] + 0.75, c5=K["s5"] - 0.05, c6=K["s6"] - 0.1,
         c7=K["s7"] - 0.1, c8=K["s8"] - 0.1, c9=K["s9"] - 0.2)

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
# instruments
def bass(at, m, d=0.55, g=0.5):      # contrebasse pincée
    f = mtof(m); s = tone(f, d, 0.004, 0.22) + 0.45*tone(2*f, d, 0.004, 0.12) + 0.15*tone(3*f, d, 0.003, 0.06)
    madd(LP(s, 900), at, g)
def ride(at, g=0.05):
    s = HP(noise(0.6), 5000)*env(int(0.6*SR), 0.001, 0.18) + 0.3*sum(tone(f, 0.6, 0.001, 0.3) for f in (3150, 4870, 6530))
    madd(s, at, g, 0.35)
def brush(at, g=0.05, d=0.22): madd(BP(noise(d), 1800, 8000)*env(int(d*SR), 0.04, 0.08), at, g, -0.25)
def snap(at, g=0.14): madd(BP(noise(0.05), 1500, 6000)*env(int(0.05*SR), 0.0005, 0.012) + 0.4*tone(2200, 0.05, 0.0005, 0.01), at, g, 0.2)
def kick(at, g=0.5): madd(sweep(110, 42, 0.28)*env(int(0.28*SR), 0.001, 0.09), at, g)
def snare(at, g=0.12): madd(BP(noise(0.16), 900, 5000)*env(int(0.16*SR), 0.001, 0.05) + 0.4*tone(190, 0.16, 0.001, 0.04), at, g)
def pad(at, notes, d, g=0.05, cut=700):
    n = int(d*SR); s = LP(sum(saw(mtof(m), d) for m in notes), cut)*np.minimum(1, np.arange(n)/SR/0.5)*np.minimum(1, (d - np.arange(n)/SR)/0.5)
    madd(s, at, g, -0.3); madd(s, at + 0.013, g, 0.3)
def brass(at, notes, d=0.5, g=0.12, cut=2200):
    n = int(d*SR); e = env(n, 0.018, d*0.45)
    s = LP(sum(saw(mtof(m), d, 0.004) for m in notes), cut)*e
    madd(s, at, g, -0.15); madd(s, at + 0.01, g, 0.15)
def celesta(at, m, g=0.05):
    f = mtof(m); madd(tone(f, 1.2, 0.002, 0.45) + 0.35*tone(2*f, 1.2, 0.002, 0.2) + 0.12*tone(3*f, 1.2, 0.002, 0.1), at, g, rng.uniform(-0.4, 0.4))
def timp(at, m=38, g=0.25): f = mtof(m); madd(LP(tone(f, 1.0, 0.003, 0.35) + 0.4*noise(1.0)*env(int(SR), 0.001, 0.03), 700), at, g)
def crash(at, g=0.12): madd(HP(noise(2.5), 3500)*env(int(2.5*SR), 0.002, 0.8), at, g)

BEAT = 0.6                                   # 100 temps/min
def swing_bar(t0, chord_root, walk, g=1.0, ride_on=True, brush_on=True, kick_on=False):
    for b in range(4):
        tb = t0 + b*BEAT
        bass(tb, walk[b], g=0.45*g)
        if ride_on: ride(tb, 0.045*g); (b % 2 == 1) and ride(tb + BEAT*0.66, 0.035*g)
        if brush_on: brush(tb, 0.05*g) if b % 2 == 0 else brush(tb, 0.08*g, 0.12)
        if kick_on and b % 2 == 0: kick(tb, 0.35*g)
        if kick_on and b % 2 == 1: snare(tb, 0.08*g)

# A. jazz noir en ré mineur (Ré m – Si♭ – Sol m – La7), de 0 jusqu'à « Non. »
PROG_A = [(38, [38, 41, 45, 48], [50, 53, 57]), (34, [34, 38, 41, 45], [46, 50, 53]), (31, [31, 34, 38, 41], [43, 46, 50]), (33, [33, 37, 40, 43], [45, 49, 52, 55])]
t = 0.0; bar = 0
while t + 4*BEAT <= K["non"] - 0.1 + 0.001:
    root, walk, ch = PROG_A[bar % 4]
    swing_bar(t, root, walk, g=0.75 + 0.25*min(1, t/8))
    pad(t, ch, 4*BEAT + 0.3, 0.035, 650)
    t += 4*BEAT; bar += 1
# fin de mesure incomplète avant « Non. » : contrebasse seule, en montée
for i, m in enumerate((45, 46, 47, 48, 49, 50)):
    if t + i*BEAT/2 < K["non"] - 0.15: bass(t + i*BEAT/2, m, 0.3, 0.4)
# cuivres en sourdine sur chaque héros + tonnerre sur le justicier
brass(K["s1"] + 0.05, [50, 53, 57, 60], 1.2, 0.07, 1100)
brass(K["s2"] + 0.05, [46, 50, 53, 57], 1.2, 0.07, 1300)
brass(K["test"], [43, 46, 50], 0.4, 0.06, 1500); brass(K["duel"], [45, 49, 52], 0.4, 0.06, 1500)
x = np.arange(N)/SR
cut = (x > K["non"] - 0.12) & (x < K["non"] - 0.01); mL[cut] *= 0.03; mR[cut] *= 0.03
# drone grave entre « Non. » et la lettre
pad(K["non"], [26, 38], C["c4"] - K["non"] + 0.6, 0.06, 300)

# B. la lettre dans la lumière : célesta en arpèges (Fa maj7 → Ré m9), puis pulsation sur le site
arp = [65, 69, 72, 76, 77, 76, 72, 69]
tb = C["c4"]; i = 0
while tb < K["s5"] - 0.1:
    celesta(tb, arp[i % 8] + (0 if (i // 8) % 2 == 0 else -3), 0.045); tb += BEAT/2; i += 1
pad(C["c4"], [53, 57, 60, 64], K["s5"] - C["c4"] + 0.4, 0.04, 900)
tb = K["s5"]; i = 0
PROG_B = [(41, [53, 57, 60, 64]), (38, [50, 53, 57, 60]), (34, [46, 50, 53, 57]), (36, [48, 52, 55, 58])]
while tb < C["c6"] - 0.05:
    root, ch = PROG_B[(i // 4) % 4]
    bass(tb, root, 0.4, 0.4); kick(tb, 0.25); ride(tb + BEAT/2, 0.03)
    if i % 4 == 0: pad(tb, ch, 4*BEAT + 0.2, 0.035, 900)
    if i % 2 == 0: celesta(tb + BEAT/2, ch[(i//2) % 4] + 12, 0.03)
    tb += BEAT; i += 1

# C. l'Agence : roulement de timbales qui accélère + souffle qui monte → COUP d'orchestre sur « pris »
tt, step = C["c6"], 0.2
while tt < K["pris"] - 0.08:
    timp(tt, 38, 0.06 + 0.2*(tt - C["c6"])/(K["pris"] - C["c6"])); tt += step; step = max(0.045, step*0.9)
d = K["pris"] - C["c6"]
madd(HP(noise(d), 1500)*np.linspace(0, 1, int(d*SR))**2, C["c6"], 0.1); madd(sweep(150, 900, d)*np.linspace(0, 1, int(d*SR))**3, C["c6"], 0.04)
pad(C["c6"], [38, 45, 50, 53], d, 0.05, 800)
brass(K["pris"], [50, 54, 57, 62, 66], 1.6, 0.2, 2600); timp(K["pris"], 38, 0.5); crash(K["pris"], 0.16)
brass(K["pris"] + 0.45, [52, 55, 59, 64], 0.3, 0.1, 2400); brass(K["pris"] + 0.6, [54, 57, 62, 66], 1.0, 0.13, 2600)

# D. Yann : pizzicato espiègle + claquements de doigts
tb = C["c8"] + 0.15; i = 0
walkD = [50, 53, 55, 57, 58, 57, 55, 53]
while tb < C["c9"] - 0.1:
    bass(tb, walkD[i % 8] - 12, 0.18, 0.4)
    if i % 2 == 1: snap(tb, 0.16)
    tb += BEAT/2 if i % 4 in (1, 3) else BEAT/2; i += 1
pad(C["c8"], [50, 53, 57], C["c9"] - C["c8"], 0.03, 600)

# E. final : swing big band en Fa majeur (Fa – Ré m – Sol m7 – Do7), cuivres sur « Postulez », accord final
PROG_E = [(41, [41, 45, 48, 50], [53, 57, 60, 64]), (38, [38, 41, 45, 48], [50, 53, 57, 60]), (43, [43, 46, 50, 53], [55, 58, 62, 65]), (36, [36, 40, 43, 46], [48, 52, 55, 58])]
t = C["c9"] + 0.1; bar = 0
while t < K["end"] + 0.2:
    root, walk, ch = PROG_E[bar % 4]
    swing_bar(t, root, walk, g=1.0, kick_on=True)
    pad(t, ch, 4*BEAT + 0.3, 0.035, 1000)
    t += 4*BEAT; bar += 1
brass(K["mm2"], [53, 57, 60], 0.35, 0.09, 2000)
brass(K["postulez"], [53, 57, 60, 65, 69], 1.2, 0.2, 2800); crash(K["postulez"], 0.1); timp(K["postulez"], 41, 0.35)
brass(K["recruter"], [55, 58, 62, 67], 0.9, 0.13, 2600)
end_t = K["end"] + 0.35
fin = (x > end_t - 0.05); mL[fin] *= np.exp(-(x[fin] - end_t + 0.05)/0.15); mR[fin] *= np.exp(-(x[fin] - end_t + 0.05)/0.15)
brass(end_t, [41, 53, 57, 60, 62, 67], DUR - end_t, 0.16, 2200); crash(end_t, 0.1)
for k_, m in enumerate((77, 81, 84, 86, 89)): celesta(end_t + 0.1 + k_*0.08, m, 0.04)
mus = np.stack([mL, mR], 1); mus /= np.max(np.abs(mus)) + 1e-9

# ─── bruitages ───
L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def boom(at, g=0.6): add(sweep(110, 36, 0.8)*env(int(0.8*SR), 0.002, 0.25), at, g); add(LP(noise(0.3), 500)*env(int(0.3*SR), 0.001, 0.05), at, g*0.5)
def stamp(at, g=0.35): add(LP(noise(0.12), 900)*env(int(0.12*SR), 0.001, 0.03), at, g); boom(at, g*0.6)
def paper(at, g=0.1): add(BP(noise(0.25), 1200, 7000)*env(int(0.25*SR), 0.01, 0.07), at, g)
def pop(at, f0=420, f1=980, g=0.12, pan=0.0): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g, pan)
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(2*f, 1.4, 0.004, 0.3), at + i*0.06, g)
def sparkle(at, g=0.04, n=12):
    for i in range(n): add(tone(rng.uniform(2000, 4500), 0.25, 0.002, 0.06), at + i*0.03, g)
def thunder(at, g=0.5):
    d = 3.2; n = int(d*SR); s = LP(noise(d), 260)*env(n, 0.02, 0.9)*(1 + 0.6*np.sin(np.arange(n)/SR*9))
    add(s/np.max(np.abs(s)), at, g); add(BP(noise(0.4), 300, 3000)*env(int(0.4*SR), 0.001, 0.08), at, g*0.5)
def key(at, g=0.06): add(BP(noise(0.02), 1500, 6000)*env(int(0.02*SR), 0.0005, 0.005), at, g)
def flap(at, d=0.8, g=0.2):                   # cape qui claque au vent
    n = int(d*SR); s = BP(noise(d), 300, 3000)*(0.5 + 0.5*np.sign(np.sin(2*np.pi*np.arange(n)/SR*14)))*env(n, 0.05, d*0.4)
    add(s, at, g)
def buzz(at, d=0.5, g=0.06):                  # néon qui grésille
    n = int(d*SR); tt = np.arange(n)/SR; s = np.sign(np.sin(2*np.pi*100*tt))*0.5 + BP(noise(d), 2000, 6000)*0.3
    gate = (rng.random(int(d*40) + 1) > 0.35).repeat(int(SR/40) + 1)[:n]
    add(LP(s, 3000)*gate*np.linspace(1, 0.3, n), at, g)
def click(at, g=0.1): add(BP(noise(0.012), 2000, 8000)*env(int(0.012*SR), 0.0002, 0.003), at, g)
def rain(a, b, g=0.03):
    d = b - a; n = int(d*SR); add(BP(noise(d), 2000, 9000)*np.minimum(1, np.minimum(np.arange(n)/SR, (d - np.arange(n)/SR))/0.3), a, g)

sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)
# hook : le signal s'allume
for i in range(3): click(0.0 + i*0.07, 0.2)
boom(0.02, 0.35); W.place(add, 0.05, "Long", 0.18)
W.place(add, K["heros"], "Court", 0.12)
# volets / transitions
for c in (C["c1"], C["c3"], C["c7"]):
    W.place(add, c - 0.05, "MoyenClair", 0.2); add(BP(noise(0.25), 400, 2500)*env(int(0.25*SR), 0.15, 0.05), c - 0.25, 0.08)
thunder(K["s1"] + 0.02, 0.45); rain(C["c1"], C["c2"] + 0.2, 0.035)
add(tone(2600, 0.6, 0.002, 0.2) + tone(3900, 0.6, 0.002, 0.12), K["masque"], 0.05)       # reflet des yeux
W.place(add, C["c2"] + 0.1, "MoyenSourd", 0.22)                                             # caméra vers la lune
W.place(add, K["rouge"], "Long", 0.2); flap(K["rouge"] - 0.3, 1.2, 0.08)                    # le héros passe devant la lune
for a in (K["test"], K["duel"]): W.place(add, a, "Court", 0.16); stamp(a + 0.1, 0.12)
stamp(K["non"], 0.5); W.place(add, K["non"] + 0.15, "MoyenSourd", 0.15)
W.place(add, C["c4"] + 0.4, "Long", 0.12)                                                    # l'enveloppe descend
paper(K["lettre"], 0.08); stamp(K["mm"], 0.25); chime(K["mm"] + 0.04, 0.07); sparkle(K["mm"] + 0.1, 0.05)
W.place(add, C["c5"], "MoyenClair", 0.22)
for a in (K["lien"], K["cv"], K["trente"], K["lettre2"], K["pas"]): pop(a, 600, 1300, 0.12)
for i in range(18): key(K["trente"] - 0.1 + i*0.065, 0.05)
for i in range(7): paper(K["lettre2"] + 0.05 + i*0.12, 0.03)
add(sweep(500, 1500, 0.35)*env(int(0.35*SR), 0.01, 0.12), K["mission"] - 0.2, 0.05)
W.place(add, K["pas"], "Court", 0.16); add(BP(noise(0.3), 1500, 7000)*env(int(0.3*SR), 0.01, 0.08), K["copie"], 0.12); add(BP(noise(0.3), 1500, 7000)*env(int(0.3*SR), 0.01, 0.08), K["copie"] + 0.15, 0.1)
W.place(add, C["c6"] + 0.1, "MoyenSourd", 0.22)
W.place(add, K["postule"], "MoyenClair", 0.14); sparkle(K["postule"], 0.03, 20)
buzz(K["agence"] - 0.1, 0.5, 0.06); click(K["agence"] - 0.1, 0.12)
chime(K["nova"] + 0.05, 0.05)
for i in range(2): W.place(add, C["c7"] + 0.35 + i*0.14, "Court", 0.12)
stamp(K["pris"], 0.55); sparkle(K["pris"] + 0.05, 0.05, 16)
W.place(add, C["c8"], "MoyenSourd", 0.18)                                                    # iris
flap(K["cape"] - 0.1, 0.9, 0.18); W.place(add, K["cape"], "Court", 0.14)
W.place(add, K["pasGrave"] + 0.3, "Long", 0.2); flap(K["pasGrave"] + 0.1, 0.8, 0.12)
pop(K["tasCv"], 500, 1200, 0.14); chime(K["cv2"], 0.04)
W.place(add, C["c9"] + 0.15, "MoyenSourd", 0.2)
for i in range(3): click(K["mm2"] - 0.25 + i*0.09, 0.15)
pop(K["offerte"] - 0.2, 600, 1300, 0.13); chime(K["offerte"], 0.05); pop(K["lien2"] - 0.1, 700, 1400, 0.13)
W.place(add, K["end"] + 0.4, "Long", 0.2)
sfx = np.stack([L, R], 1)

with wave.open("public/audio/heros-voix.wav") as w_:
    vv = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float)/32768
voice = np.zeros(N); voice[:min(N, len(vv))] = vv[:N]
hop = int(0.01*SR); e = np.array([np.sqrt(np.mean(voice[i:i+hop]**2)) for i in range(0, N, hop)])
on = np.clip(np.convolve((e > 0.02).astype(float), np.ones(25)/25, "same")*3, 0, 1)
mus *= (1 - 0.55*np.repeat(on, hop)[:N])[:, None]
mix = mus*0.55 + sfx*2.4 + np.stack([voice, voice], 1)*0.95
von = np.repeat(on, hop)[:N] > 0.9
rms = lambda a: 20*np.log10(np.sqrt(np.mean(a**2)) + 1e-9)
print(f"voix {rms(voice[von]*0.95):.1f} dB · musique sous la voix {rms(mus[von, 0]*0.55):.1f} dB · bruitages {rms(sfx[:, 0]*2.4):.1f} dB")
mix[-int(0.6*SR):] *= np.linspace(1, 0, int(0.6*SR))[:, None]**1.5
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/heros-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/heros.wav"], check=True)
os.remove(raw)
print("audio ok")
