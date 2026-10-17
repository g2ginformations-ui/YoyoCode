# Bande-son de « Ton patron va détester cette vidéo. » (src/TonPatron.tsx) : voix de l'utilisateur
# (public/audio/patron-voix.wav, tools/voix-narrateur.py + voix-patron.json) + musique « espiègle » fabriquée ici
# (ré mineur, 104 BPM, grille calée sur « MyMotiv ») : basse en pizzicato et claquements de doigts façon film de casse,
# roulement + montée sur « encore plus simple ? », silence sec puis IMPACT sur « Changer de patron », passage étouffé
# (gris) pendant « des heures / chatbot / outil gratuit », drop complet sur « MyMotiv », fête sur « pot de départ ».
# La musique s'efface sous la voix (ducking). Bruitages réels (whooshes FILM CRUX, tools/sfx_lib.py) + fabriqués ici,
# nommés selon les catégories UCS : UI NOTIFICATION, VIBRATION, LOCK, PAPER, IMPACT, MARKER, CLOCK, BELL, KEYBOARD,
# PARTY POPPER, MAGIC/SPARKLE. Volume final ≈ -14 LUFS.
import json, os, subprocess, sys, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(31)
V = json.load(open("src/data/patron-voix.json"))
DUR = V["duration"]; N = int(SR*DUR)
Wt = lambda i: next(m["t0"] for m in V["mots"] if m["i"] == i)
PH = [(p["t0"], p["t1"]) for p in V["phrases"]]
# mêmes temps clés que src/TonPatron.tsx (objet T)
T = dict(ton=Wt(0), detester=Wt(3), video=Wt(5), depuis=Wt(6), oct=Wt(8), prud=Wt(12), simple1=Wt(15), bulletin=Wt(19),
         liste=Wt(24), suffisent=Wt(28), mais=Wt(29), simple2=Wt(36), changer=Wt(38), patron4=Wt(40), sauf=Wt(41),
         heures=Wt(49), chatbot=Wt(51), generique=Wt(52), outil=Wt(54), retravailler=Wt(59), mm=Wt(60), colles=Wt(63),
         ajoutes=Wt(66), cv=Wt(68), s30=Wt(69), lettre=Wt(72), cv2=Wt(75), entreprise=Wt(79), logo=Wt(82), offerte=Wt(86),
         lien=Wt(88), bio=Wt(91), et=Wt(92), patron11=Wt(94), pot=Wt(99), depart=Wt(101))

def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a, dec): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
mtof = lambda m: 440*2**((m - 69)/12)
def pluck(f, d=0.3, bright=1.0):                       # corde pincée : harmoniques qui s'éteignent de plus en plus vite
    t = np.arange(int(d*SR))/SR; s = np.zeros(len(t))
    for h in range(1, 9): s += np.sin(2*np.pi*f*h*t)*np.exp(-t*(6 + h*h*3/bright))/h**1.2
    return s*np.minimum(1, t/0.002)

# ─── musique ───
mL = np.zeros(N); mR = np.zeros(N)
def madd(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: mL[i:j] += s[:j-i]*g*(1 - max(0, pan)); mR[i:j] += s[:j-i]*g*(1 + min(0, pan))
BEAT = 60/104; E = BEAT/2; G0 = T["mm"]                 # la grille tombe pile sur « MyMotiv »
def kick(at, g=0.9): madd(sweep(130, 45, 0.3)*env(int(0.3*SR), 0.001, 0.1), at, g)
def snap(at, g=0.3): madd(sosfilt(butter(2, [1800, 6000], "bp", fs=SR, output="sos"), noise(0.06))*env(int(0.06*SR), 0.0005, 0.012), at, g, 0.25)
def clap(at, g=0.3):
    for o in (0, 0.011, 0.022): madd(sosfilt(butter(2, [900, 3500], "bp", fs=SR, output="sos"), noise(0.16))*env(int(0.16*SR), 0.001, 0.045), at + o, g*0.6)
def hat(at, g=0.08): madd(HP(noise(0.04), 7500)*env(int(0.04*SR), 0.0005, 0.01), at, g, rng.uniform(-0.35, 0.35))
def snare(at, g=0.2): madd(sosfilt(butter(2, [300, 5000], "bp", fs=SR, output="sos"), noise(0.12))*env(int(0.12*SR), 0.001, 0.03), at, g)
BASS = [38, None, 38, 41, None, 45, 44, 43]              # ré … fa … la, sol#, sol : la marche « espiègle »
MEL = [62, None, 65, None, 69, None, 68, None, 67, None, 65, None, 64, None, 61, None]
def section(t):
    if t < T["mais"]: return "sneak"
    if t < PH[4][0] - 0.05: return "build"
    if t < T["sauf"]: return "hit"
    if t < G0 - 0.1: return "grey"
    if t < PH[11][0]: return "drop"
    if t < T["pot"] - 0.05: return "tension"
    return "party"
k0 = -int(G0/E) - 1; k = k0
while G0 + k*E < DUR - 0.3:
    t = G0 + k*E
    if t < 0: k += 1; continue
    sec = section(t); i8 = k % 8; i16 = k % 16
    n = BASS[i8]
    if sec in ("sneak", "build", "grey", "drop", "tension", "party") and n is not None:
        b = pluck(mtof(n), 0.32, 0.6 if sec == "grey" else 1.0)
        madd(LP(b, 900 if sec == "grey" else 2500), t, 0.32 if sec != "tension" else 0.22)
    if sec in ("drop", "party") and MEL[i16] is not None: madd(pluck(mtof(MEL[i16]), 0.25, 1.4), t, 0.10, (-0.3, 0.3)[i16 % 4 == 0])
    if sec == "sneak":
        if i8 in (2, 6): snap(t, 0.32)
        if i8 % 2 == 1: hat(t, 0.05)
    if sec == "grey" and i8 in (2, 6): snap(t, 0.18)
    if sec in ("drop", "party"):
        if i8 % 2 == 0: kick(t, 0.85 if sec == "party" else 0.8)
        if i8 in (2, 6): clap(t, 0.26)
        hat(t + E/2, 0.07)
    if sec == "tension" and i8 % 4 == 0: kick(t, 0.5)
    k += 1
# montée : roulement de caisse claire qui accélère + souffle, coupure nette avant « Changer »
tt, step, end_b = T["mais"], 0.18, PH[4][0] - 0.12
while tt < end_b:
    snare(tt, 0.08 + 0.22*(tt - T["mais"])/(end_b - T["mais"])); tt += step; step = max(0.035, step*0.9)
d = end_b - T["mais"]; madd(HP(noise(d), 1500)*np.linspace(0, 1, int(d*SR))**2, T["mais"], 0.12)
madd(sweep(200, 1400, d)*np.linspace(0, 1, int(d*SR))**3, T["mais"], 0.05)
x = np.arange(N)/SR
cut = (x > PH[4][0] - 0.1) & (x < T["changer"] - 0.01)       # silence sec juste avant l'impact
mL[cut] *= 0.03; mR[cut] *= 0.03
# respiration (sidechain) après chaque grosse caisse du drop
ph = ((x - G0) % BEAT)/BEAT
side = np.where((x >= G0) & (x < PH[11][0]) | (x >= T["pot"]), 1 - 0.4*np.exp(-ph*7), 1.0)
mL *= side; mR *= side
mus = np.stack([mL, mR], 1)

# ─── bruitages ───
L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def click(at, g=0.3): add(HP(noise(0.012), 3000)*env(int(0.012*SR), 0.0002, 0.003), at, g)
def pop(at, f0=420, f1=980, g=0.15, pan=0.0): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g, pan)
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(2*f, 1.4, 0.004, 0.3), at + i*0.06, g)
def boom(at, g=0.6): add(sweep(110, 36, 0.8)*env(int(0.8*SR), 0.002, 0.25), at, g); add(LP(noise(0.3), 500)*env(int(0.3*SR), 0.001, 0.05), at, g*0.5)
def crash(at, g=0.15): add(HP(noise(2.0), 4000)*env(int(2.0*SR), 0.001, 0.6), at, g)
def ding(at, g=0.12):                    # UI NOTIFICATION : deux notes claires
    add(tone(1568, 0.5, 0.003, 0.18) + 0.3*tone(3136, 0.5, 0.003, 0.08), at, g); add(tone(2093, 0.7, 0.003, 0.25) + 0.3*tone(4186, 0.7, 0.003, 0.1), at + 0.11, g)
def buzz(at, d=0.38, g=0.16):            # VIBRATION : bourdonnement grave haché
    t_ = np.arange(int(d*SR))/SR; s = np.sign(np.sin(2*np.pi*155*t_))*(np.sin(2*np.pi*14*t_) > -0.2)
    add(LP(s, 900)*np.minimum(1, t_/0.01)*np.minimum(1, (d - t_)/0.03), at, g)
def lock(at, g=0.3): click(at, g); add(LP(noise(0.05), 1200)*env(int(0.05*SR), 0.001, 0.012), at + 0.035, g); pop(at + 0.04, 300, 180, g*0.4)
def paper(at, g=0.1): add(sosfilt(butter(2, [1200, 7000], "bp", fs=SR, output="sos"), noise(0.18))*env(int(0.18*SR), 0.01, 0.05), at, g)
def stamp(at, g=0.4): add(LP(noise(0.1), 900)*env(int(0.1*SR), 0.001, 0.03), at, g); boom(at, g*0.45)
def marker(at, d, g=0.08): add(sosfilt(butter(2, [1500, 6000], "bp", fs=SR, output="sos"), noise(d))*(0.6 + 0.4*np.sin(np.linspace(0, 40, int(d*SR))))*np.sin(np.linspace(0, np.pi, int(d*SR))), at, g)
def key(at, g=0.08): add(sosfilt(butter(2, [1500, 6000], "bp", fs=SR, output="sos"), noise(0.02))*env(int(0.02*SR), 0.0005, 0.005), at, g, rng.uniform(-0.3, 0.3))
def sparkle(at, g=0.04):
    for i in range(12): add(tone(rng.uniform(2000, 4500), 0.25, 0.002, 0.06), at + i*0.03, g)
def popper(at, g=0.4):                   # PARTY POPPER : claquement + crépitement de confettis
    add(HP(noise(0.03), 800)*env(int(0.03*SR), 0.0005, 0.008), at, g); add(LP(noise(0.25), 3000)*env(int(0.25*SR), 0.002, 0.06), at, g*0.4)
    for i in range(30): add(HP(noise(0.005), 4000)*0.5, at + 0.05 + rng.uniform(0, 1.2), g*0.25*rng.uniform(0.3, 1), rng.uniform(-0.7, 0.7))
def bell(at, g=0.12): add(tone(392, 2.0, 0.003, 0.6) + 0.5*tone(784, 2.0, 0.003, 0.4) + 0.25*tone(1176, 2.0, 0.003, 0.25), at, g)   # CLOCK CHIME
sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)

ding(0.0, 0.14); buzz(0.0); buzz(0.5); buzz(T["detester"], 0.4, 0.14); boom(0.0, 0.25)
lock(T["video"], 0.35)
W.place(add, T["depuis"] + 0.1, "Court", 0.22); paper(T["depuis"] + 0.05, 0.12); pop(T["oct"], 500, 1200, 0.14)
W.place(add, T["prud"], "Court", 0.2)
for i in range(10): paper(T["simple1"] + i*0.04, 0.06)
W.place(add, T["simple1"] + 0.15, "MoyenClair", 0.2); stamp(T["simple1"] + 0.25, 0.3)
W.place(add, T["bulletin"], "Court", 0.2); paper(T["bulletin"], 0.12)
W.place(add, T["liste"], "Court", 0.2); paper(T["liste"], 0.12)
paper(T["suffisent"] - 0.2, 0.14); stamp(T["suffisent"], 0.38); chime(T["suffisent"] + 0.05, 0.05)
W.place(add, PH[3][0] + 0.15, "MoyenSourd", 0.22)
boom(T["changer"], 0.85); crash(T["changer"], 0.18); W.place(add, T["changer"], "Long", 0.3)
marker(T["patron4"] - 0.05, 0.35, 0.1); W.place(add, T["patron4"] + 0.6, "Court", 0.22)
W.place(add, T["sauf"] + 0.05, "MoyenSourd", 0.22)
tt, step = T["sauf"] + 0.1, 0.32
while tt < T["heures"]:
    click(tt, 0.22); tt += step; step = max(0.05, step*0.9)      # tic-tac qui s'emballe
bell(T["heures"], 0.12)
W.place(add, T["chatbot"] - 0.05, "Court", 0.2); pop(T["chatbot"], 500, 800, 0.1, -0.3); stamp(T["generique"], 0.35)
W.place(add, T["outil"] - 0.05, "Court", 0.2); pop(T["outil"], 500, 800, 0.1, 0.3); stamp(T["retravailler"], 0.35)
W.place(add, T["mm"], "Long", 0.35); boom(T["mm"], 0.6); chime(T["mm"] + 0.1, 0.06); sparkle(T["mm"] + 0.2, 0.04)
W.place(add, T["mm"] + 0.75, "Court", 0.18)
for i in range(14): key(T["colles"] - 0.15 + i*0.05, 0.08)
pop(T["cv"], 500, 1200, 0.13)
chime(T["s30"] + 0.02, 0.06)
for i in range(8): click(T["s30"] + 0.1 + i*0.1, 0.06)
W.place(add, T["lettre"], "MoyenClair", 0.2); paper(T["lettre"], 0.1); W.place(add, T["cv2"], "Court", 0.18); paper(T["cv2"], 0.1)
pop(T["entreprise"], 600, 1300, 0.1)
for i in range(4): click(T["logo"] - 0.4 + i*0.1, 0.1)
pop(T["logo"], 700, 1600, 0.16); chime(T["logo"] + 0.03, 0.06)
W.place(add, PH[10][0] + 0.05, "MoyenClair", 0.2); pop(T["offerte"], 500, 1300, 0.16); sparkle(T["offerte"] + 0.05, 0.05)
pop(T["lien"], 600, 1300, 0.14); chime(T["lien"] + 0.05, 0.04)
ding(T["et"] - 0.03, 0.12); buzz(T["et"]); buzz(T["patron11"], 0.4, 0.14)
popper(T["pot"], 0.5); W.place(add, T["pot"], "Court", 0.2); sparkle(T["pot"] + 0.1, 0.05); chime(T["depart"] + 0.1, 0.05)
W.place(add, PH[11][1] + 0.15, "Long", 0.25); boom(PH[11][1] + 0.12, 0.35); chime(PH[11][1] + 0.5, 0.05)
sfx = np.stack([L, R], 1)

# ─── voix + ducking ───
with wave.open("public/audio/patron-voix.wav") as w_:
    vv = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float)/32768
voice = np.zeros(N); voice[:min(N, len(vv))] = vv[:N]
hop = int(0.01*SR); e = np.array([np.sqrt(np.mean(voice[i:i+hop]**2)) for i in range(0, N, hop)])
on = np.clip(np.convolve((e > 0.02).astype(float), np.ones(25)/25, "same")*3, 0, 1)
duck = 1 - 0.6*np.repeat(on, hop)[:N]
mus *= duck[:, None]
mus /= np.max(np.abs(mus)) + 1e-9
mix = mus*0.5 + sfx*2.6 + np.stack([voice, voice], 1)*0.95
mix[-int(1.0*SR):] *= np.linspace(1, 0, int(1.0*SR))[:, None]**1.5
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/patron-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/patron.wav"], check=True)
os.remove(raw)
print("audio ok")
