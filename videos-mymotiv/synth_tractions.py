# Bande-son de « Le recruteur qui fait des tractions » (src/RecruteurTractions.tsx) : voix ElevenLabs « Alexandre »
# (public/audio/tractions-voix.wav, tools/assembler-lignes.py) + musique fabriquée ici (le son d'origine du tournage, un
# morceau du commerce, n'est PAS repris) : instru trap sombre (140 BPM, fa mineur, 808 glissée, charleston en roulements,
# clochettes), coupée net par l'arrêt sur image (scratch), rembobinage façon cassette, montée, puis le beat retombe sur
# « RECRUTEUR. ». Plus lourd sur « sans méthode, tu forces… », arrêt de bande sur « stagnes », relance pour MyMotiv,
# dernière frappe sur la dernière traction. Bruitages : compteur des 100 000 €, papiers des CV, tampon, frappe sur le vrai
# site, compteur de Léni, bulles de commentaires, whooshes réels FILM CRUX (tools/sfx_lib.py). Ducking sous la voix, ≈ -14 LUFS.
import json, os, subprocess, sys, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(31)
V = json.load(open("src/data/tractions-voix.json"))
DUR = V["duration"]; N = int(SR*DUR)
Wt = lambda i: next(m["t0"] for m in V["mots"] if m["i"] == i)
PH = [(p["t0"], p["t1"]) for p in V["phrases"]]
K = dict(trac1=Wt(5), mais=Wt(6), bureau=Wt(15), recr=Wt(16), cinq=Wt(17), unAn=Wt(24), agence=Wt(30), plus=Wt(43), cent=Wt(45),
         deux=Wt(59), lettre=Wt(66), diff=Wt(70), sans=Wt(76), forces=Wt(79), stagnes=Wt(82), mymotiv=Wt(94), lien=Wt(96), cv=Wt(101),
         s30=Wt(104), cette=Wt(111), onze=Wt(116), sept=Wt(118), ecris=Wt(132), metier=Wt(134), teste=Wt(138), recr3=Wt(148),
         offerte=Wt(155), bio=Wt(159), moi=Wt(160), trac3=Wt(165), end=PH[9][1])
# mêmes repères que dans le .tsx
FREEZE = K["trac1"] + 0.1; CUT1 = K["recr"] - 0.02; CUT2 = PH[5][0] - 0.06; CUT3 = PH[6][0] - 0.1; CUT4 = PH[9][0] - 0.06; TOP3 = K["trac3"] + 0.05

def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def BP(s, lo, hi): return sosfilt(butter(2, [lo, hi], "bp", fs=SR, output="sos"), s)
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a=0.005, dec=0.5): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
mtof = lambda m: 440*2**((m - 69)/12)

# ─── l'instru : une section = une grille qui repart de son début ───
BEAT = 60/140
CH = [[65, 68, 72], [61, 65, 68], [63, 67, 70], [60, 64, 67]]      # Fa m, Ré♭, Mi♭, Do
BS = [41, 37, 39, 36]
MEL = [77, 75, 72, 75, 80, 79, 75, 72]                              # clochette
def section(t0, t1, E=1.0, bell=True, heavy=False, lp=None):
    n = int((t1 - t0)*SR) + int(2*SR); L = np.zeros(n); R = np.zeros(n)
    def a(s, at, g, pan=0.0):
        i = int(at*SR); j = min(n, i + len(s))
        if j > i: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
    k = 0; t = 0.0
    while t < t1 - t0:
        bar = (k // 4) % 4; b = k % 4
        if b == 0 or (b == 2 and k % 8 == 6) or (heavy and b == 3 and k % 2 == 1):
            a(np.tanh(2.5*LP(sweep(150, 42, 0.35)*env(int(0.35*SR), 0.001, 0.12), 1200)), t, 0.55*E)
        if b == 2: [a(BP(noise(0.18), 1200, 6000)*env(int(0.18*SR), 0.001, 0.06), t + o, 0.13*E) for o in (0, 0.01, 0.022)]
        for h in range(4 if (k % 8 == 7 and E > 0.7) else 2):
            a(HP(noise(0.03), 8000)*env(int(0.03*SR), 0.0004, 0.012), t + h*BEAT/(4 if k % 8 == 7 else 2), 0.05*E, 0.25 if h % 2 else -0.25)
        if b in (0, 3) or heavy:                                       # 808 glissée, saturée
            f0 = mtof(BS[bar] - 12 + (12 if heavy and b == 3 else 0)); d = BEAT*(1.6 if b == 0 else 0.9)
            tt = np.arange(int(d*SR))/SR; f = f0*(1 + 0.6*np.exp(-tt*40))
            a(np.tanh(1.8*np.sin(2*np.pi*np.cumsum(f)/SR))*env(len(tt), 0.003, d*0.7), t, 0.32*E)
        if b == 0 and k % 8 == 0:                                      # nappe sombre
            for j, m in enumerate(CH[bar]):
                ln = int(BEAT*8*SR); tt = np.arange(ln)/SR
                pad = (np.sin(2*np.pi*mtof(m - 12)*tt) + 0.3*np.sin(2*np.pi*mtof(m - 12)*1.004*tt))*np.minimum(1, tt/0.4)*np.minimum(1, (ln/SR - tt)/0.5)
                a(LP(pad, 1500), t, 0.035*E, (j - 1)*0.3)
        if bell:
            for h in range(2):
                m = MEL[(2*k + h) % 8] + (0 if bar < 2 else -2)
                a(tone(mtof(m), 0.45, 0.002, 0.18) + 0.3*tone(mtof(m)*2.76, 0.45, 0.002, 0.06), t + h*BEAT/2, 0.04*E, 0.35 if h else -0.35)
        t += BEAT; k += 1
    out = np.stack([L, R], 1)
    if lp: out = np.stack([LP(out[:, 0], lp), LP(out[:, 1], lp)], 1)
    return out[:int((t1 - t0)*SR) + int(1.2*SR)]
def tapestop(x, at, d=0.45):                                          # la bande ralentit jusqu'à l'arrêt
    i = int(at*SR); n = int(d*SR); sp = (1 - np.linspace(0, 1, n))**1.6
    pos = i + np.cumsum(sp); out = x.copy()
    for c in range(2): out[i:i+n, c] = np.interp(pos, np.arange(len(x)), x[:, c])*np.linspace(1, 0.3, n)
    out[i+n:] = 0; return out
mus = np.zeros((N, 2))
def put(x, at, g=1.0):
    i = int(at*SR); j = min(N, i + len(x))
    if j > i: mus[i:j] += x[:j-i]*g
sA = section(0, FREEZE + 0.1, 1.0); sA = tapestop(sA, FREEZE - 0.02, 0.22); put(sA, 0)
def cutoff(x, d, f=0.2):                                              # fondu court puis silence à la fin de la section
    e = int(d*SR); n = int(f*SR); x[e - n:e] *= np.linspace(1, 0, n)[:, None]; x[e:] = 0; return x
sB = cutoff(section(CUT1, CUT2, 0.75, bell=False, lp=2600), CUT2 - CUT1); put(sB, CUT1)
sC = section(CUT2, CUT3, 1.0, bell=False, heavy=True); sC = tapestop(sC, K["stagnes"] - CUT2, 0.5); put(sC, CUT2)
sD = cutoff(section(CUT3, CUT4, 0.8, lp=5000), CUT4 - CUT3); put(sD, CUT3)
sE = section(CUT4, DUR, 0.65, bell=True)
x = np.arange(len(sE))/SR + CUT4; sE *= np.where(x < K["moi"] - 0.3, 0.7, 1.0)[:, None]
end_t = TOP3 + 1.6; sE[x > end_t] *= np.exp(-(x[x > end_t] - end_t)/0.35)[:, None]; put(sE, CUT4)
mus /= np.max(np.abs(mus)) + 1e-9

# ─── bruitages ───
L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if i < 0: s = s[-i:]; i = 0
    if j > i: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def pop(at, f0=420, f1=980, g=0.1, pan=0.0): add(sweep(f0, f1, 0.08)*env(int(0.08*SR), 0.002, 0.03), at, g, pan)
def tick(at, g=0.12): add(BP(noise(0.012), 2500, 7000)*env(int(0.012*SR), 0.0003, 0.003), at, g)
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.3, 0.004, 0.45) + 0.25*tone(2*f, 1.3, 0.004, 0.3), at + i*0.06, g)
def boom(at, g=0.5): add(np.tanh(2*sweep(120, 34, 0.9)*env(int(0.9*SR), 0.002, 0.28)), at, g)
def paper(at, g=0.08): add(BP(noise(0.22), 1200, 7000)*env(int(0.22*SR), 0.01, 0.06), at, g)
def key(at, g=0.05): add(BP(noise(0.02), 1500, 6000)*env(int(0.02*SR), 0.0005, 0.005), at, g)
def stamp(at, g=0.3): add(LP(noise(0.12), 900)*env(int(0.12*SR), 0.001, 0.03), at, g); boom(at, g*0.6)
def scratch(at, g=0.25):                                              # scratch de vinyle : aller-retour rapide
    d = 0.32; tt = np.arange(int(d*SR))/SR; sp = np.sin(np.pi*tt/d*2)
    f = 600 + 2200*np.abs(sp); s = BP(noise(d), 700, 5000)*0.6 + 0.5*np.sin(2*np.pi*np.cumsum(f)/SR)
    add(s*np.abs(sp)**0.5*env(len(tt), 0.003, 0.2), at, g)
def shutter(at, g=0.12): add(BP(noise(0.03), 1500, 6000)*env(int(0.03*SR), 0.0005, 0.008), at, g); add(BP(noise(0.04), 800, 3000)*env(int(0.04*SR), 0.001, 0.012), at + 0.05, g*0.7)
def rewind(t0, t1, g=0.12):                                          # bande qui rembobine : sifflement qui gazouille
    d = t1 - t0; tt = np.arange(int(d*SR))/SR
    f = 2600 + 900*np.sin(2*np.pi*7*tt) + 500*np.sin(2*np.pi*2.3*tt)
    s = 0.5*np.sin(2*np.pi*np.cumsum(f)/SR)*(0.6 + 0.4*np.sin(2*np.pi*11*tt)) + BP(noise(d), 1500, 7000)*0.5
    add(s*np.minimum(1, tt/0.08)*np.minimum(1, (d - tt)/0.12), t0, g)
def riser(t0, t1, g=0.12):
    d = t1 - t0; tt = np.arange(int(d*SR))/SR; out = np.zeros(len(tt)); nz = noise(d)
    for lo in np.geomspace(300, 4000, 6):
        k0 = (np.log(lo/300)/np.log(4000/300)); m = np.clip((tt/d - k0*0.8)/0.2, 0, 1)
        out += BP(nz, lo, lo*1.8)*m
    add(out*(tt/d)**2, t0, g); add(sweep(80, 320, d)*(tt/d)**2*0.6, t0, g)
sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)

scratch(FREEZE - 0.03, 0.3); shutter(FREEZE, 0.14)
add(BP(noise(K["mais"] - FREEZE), 2000, 9000)*0.015, FREEZE)        # souffle de bande pendant l'arrêt
s = W._load(W.pick("Long")["fichier"])[::-1]; add(s, K["bureau"] + 0.25 - len(s)/SR, 0.18)   # whoosh à l'envers
rewind(K["mais"] - 0.12, K["bureau"] + 0.25, 0.1)
riser(K["bureau"] + 0.25, CUT1, 0.14)
boom(CUT1, 0.55); stamp(CUT1 + 0.02, 0.35); W.place(add, CUT1 + 0.05, "Long", 0.18)
pop(K["cinq"] - 0.3, 500, 1100, 0.12); pop(K["unAn"] - 0.3, 520, 1150, 0.12); pop(K["agence"] - 0.35, 600, 1300, 0.11)
W.place(add, PH[3][0], "Court", 0.12)
for i in range(18): tick(K["cent"] - 0.9 + i*0.052, 0.07)
boom(K["cent"] + 0.02, 0.35); chime(K["cent"] + 0.05, 0.05)
W.place(add, PH[4][0], "Court", 0.14)
paper(K["deux"] - 0.25, 0.09); paper(K["deux"] - 0.1, 0.08)
W.place(add, K["lettre"] - 0.05, "Court", 0.15); stamp(K["diff"], 0.25); pop(K["diff"] - 0.15, 700, 1500, 0.1)
W.place(add, CUT2, "MoyenSourd", 0.2); boom(CUT2 + 0.13, 0.25)                 # retour au tournage, sommet à 17,13 s
boom(K["sans"], 0.45); boom(K["forces"], 0.45); stamp(K["stagnes"], 0.3); shutter(K["stagnes"] + 0.02, 0.12)
W.place(add, CUT3 + 0.05, "MoyenClair", 0.2); pop(K["mymotiv"] - 0.3, 600, 1300, 0.12); chime(K["mymotiv"], 0.04)
for at in (K["lien"], K["cv"], K["s30"]): pop(at - 0.2, 600, 1300, 0.1)
for i in range(14): key(K["s30"] - 0.1 + i*0.06, 0.045)
chime(K["cette"], 0.04)
W.place(add, PH[7][0] + 0.1, "Court", 0.14)
for i in range(11): tick(K["onze"] - 0.5 + i*0.05, 0.06)
for i in range(7): tick(K["sept"] - 0.4 + i*0.055, 0.06)
boom(K["sept"], 0.3); chime(K["sept"] + 0.05, 0.05)
W.place(add, PH[8][0] + 0.1, "MoyenSourd", 0.14)
pop(K["ecris"] - 0.2, 600, 1300, 0.12)
for i in range(5): pop(K["metier"] + 0.05 + i*0.22, 700 + 60*i, 1500 + 80*i, 0.08, (i % 2 - 0.5)*0.4)
pop(K["teste"] - 0.25, 600, 1300, 0.1); pop(K["recr3"] - 0.3, 700, 1400, 0.11)
W.place(add, CUT4, "MoyenSourd", 0.16)
pop(K["offerte"] - 0.4, 600, 1300, 0.12); pop(K["bio"] - 0.3, 700, 1400, 0.12)
W.place(add, K["moi"] - 0.3, "Court", 0.12)
boom(TOP3, 0.5); W.place(add, TOP3, "Long", 0.18); chime(K["end"] + 0.3, 0.04)
sfx = np.stack([L, R], 1)

with wave.open("public/audio/tractions-voix.wav") as w_:
    vv = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float)/32768
voice = np.zeros(N); voice[:min(N, len(vv))] = vv[:N]
hop = int(0.01*SR); e = np.array([np.sqrt(np.mean(voice[i:i+hop]**2)) for i in range(0, N, hop)])
on = np.clip(np.convolve((e > 0.02).astype(float), np.ones(25)/25, "same")*3, 0, 1)
duck = (1 - 0.5*np.repeat(on, hop)[:N])
mus *= duck[:, None]
mix = mus*0.4 + sfx*2.2 + np.stack([voice, voice], 1)*0.95
von = np.repeat(on, hop)[:N] > 0.9
rms = lambda a: 20*np.log10(np.sqrt(np.mean(a**2)) + 1e-9)
print(f"voix {rms(voice[von]*0.95):.1f} dB · musique sous la voix {rms(mus[von, 0]*0.4):.1f} dB")
mix[-int(0.6*SR):] *= np.linspace(1, 0, int(0.6*SR))[:, None]**1.5
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/tractions-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/tractions.wav"], check=True)
os.remove(raw)
print("audio ok")
