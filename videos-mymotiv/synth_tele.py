# Bande-son de la version TÉLÉ de l'épisode 1 (src/EpisodeTele.tsx) : ambiance de pièce, clic de télécommande, allumage
# tout en douceur (relais, souffle grave qui monte, scintillement, petit carillon), fanfare Art déco sur le titre, souffle
# de la plongée dans l'écran, puis la bande-son complète de l'épisode (public/audio/episode1.wav) posée à INTRO,
# retour dans le salon et extinction (clic + « piou » qui descend). Bruitages UCS : UI CLICK, ELECTRIC HUM, MAGIC,
# WHOOSH (réels FILM CRUX via tools/sfx_lib.py), BRASS. Volume final ≈ -14 LUFS.
import json, os, subprocess, sys, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(73)
EP = json.load(open("src/data/episode1-voix.json"))["duration"]
INTRO = 2.75; DUR = INTRO + EP + 0.9; N = int(SR*DUR)                  # mêmes constantes que EpisodeTele.tsx
ON = 0.3; DIVE = (2.5, 3.45); BACK = (INTRO + EP - 1.95, INTRO + EP - 1.05); OFF = INTRO + EP - 0.55

def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def BP(s, lo, hi): return sosfilt(butter(2, [lo, hi], "bp", fs=SR, output="sos"), s)
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a=0.005, dec=0.5): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
mtof = lambda m: 440*2**((m - 69)/12)
def saw(f, d, det=0.005):
    t = np.arange(int(d*SR))/SR
    return sum(2*((t*f*(1 + dd) + k*0.37) % 1) - 1 for k, dd in enumerate((-det, 0, det)))/3

L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i and i >= 0: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def click(at, g=0.12, lo=2000, hi=7000, d=0.01): add(BP(noise(d), lo, hi)*env(int(d*SR), 0.0002, d/3), at, g)
def brass(at, notes, d=0.6, g=0.1, cut=2200):
    n = int(d*SR); s = LP(sum(saw(mtof(m), d) for m in notes), cut)*env(n, 0.02, d*0.45); add(s, at, g, -0.15); add(s, at + 0.01, g, 0.15)
def timp(at, m=38, g=0.3): f = mtof(m); add(LP(tone(f, 1.0, 0.003, 0.35) + 0.4*noise(1.0)*env(int(SR), 0.001, 0.03), 700), at, g)
def crash(at, g=0.08, d=2.0): add(HP(noise(d), 3500)*env(int(d*SR), 0.002, d*0.35), at, g)
def sparkle(at, g=0.03, n=16):
    for i in range(n): add(tone(rng.uniform(2200, 5000), 0.3, 0.002, 0.07), at + i*0.03, g, rng.uniform(-0.5, 0.5))
def pad(at, notes, d, g=0.04, cut=900):
    n = int(d*SR); s = LP(sum(saw(mtof(m), d) for m in notes), cut)*np.minimum(1, np.arange(n)/SR/0.35)*np.minimum(1, (d - np.arange(n)/SR)/0.35)
    add(s, at, g, -0.3); add(s, at + 0.013, g, 0.3)

# ambiance de pièce (très basse) pendant l'intro et la fin
for a, b in ((0, INTRO + 0.6), (BACK[0], DUR)):
    d = b - a; n = int(d*SR); add(LP(noise(d), 400)*np.minimum(1, np.minimum(np.arange(n)/SR, (d - np.arange(n)/SR))/0.3), a, 0.012)
# télécommande puis allumage
click(0.13, 0.14); click(0.16, 0.08)
click(ON, 0.22, 600, 2500, 0.02)                                                   # relais de la télé
d = 0.9; n = int(d*SR); add(LP(sweep(55, 170, d), 600)*env(n, 0.12, 0.35), ON + 0.02, 0.22)   # souffle grave qui monte
add(HP(noise(0.6), 5000)*env(int(0.6*SR), 0.15, 0.18), ON + 0.02, 0.05)            # scintillement de la dalle
for i, m in enumerate((79, 84, 88)): add(tone(mtof(m), 1.6, 0.004, 0.6) + 0.2*tone(2*mtof(m), 1.6, 0.004, 0.3), ON + 0.18 + i*0.07, 0.035)
# titre : nappe + fanfare Art déco
pad(0.7, [50, 57, 62, 66], INTRO - 0.5, 0.035, 800)
brass(1.3, [50, 54, 57, 62], 0.9, 0.11, 2000); timp(1.3, 38, 0.3); crash(1.3, 0.06)
brass(1.85, [52, 55, 59, 64], 0.35, 0.07, 2000); brass(2.05, [54, 57, 62, 66], 0.8, 0.09, 2300)
sparkle(2.0, 0.025)
# plongée dans l'écran
d = DIVE[0] + 0.4 - 2.05; add(HP(noise(d), 1500)*np.linspace(0, 1, int(d*SR))**2, 2.05, 0.05)
sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)
W.place(add, (DIVE[0] + DIVE[1])/2, "Long", 0.18)
# l'épisode
with wave.open("public/audio/episode1.wav") as w_:
    ep = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float).reshape(-1, 2)/32768
i0 = int(INTRO*SR); j0 = min(N, i0 + len(ep)); L[i0:j0] += ep[:j0-i0, 0]; R[i0:j0] += ep[:j0-i0, 1]
# retour dans le salon puis extinction
W.place(add, (BACK[0] + BACK[1])/2, "MoyenSourd", 0.14)
click(OFF, 0.2, 600, 2500, 0.02)
add(sweep(1300, 110, 0.28)*env(int(0.28*SR), 0.003, 0.12), OFF + 0.02, 0.06)      # « piou »
add(BP(noise(0.12), 3000, 9000)*env(int(0.12*SR), 0.001, 0.04), OFF + 0.03, 0.04)

mix = np.stack([L, R], 1)
mix[-int(0.5*SR):] *= np.linspace(1, 0, int(0.5*SR))[:, None]**1.5
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/tele-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/tele.wav"], check=True)
os.remove(raw)
print("audio ok", round(DUR, 2))
