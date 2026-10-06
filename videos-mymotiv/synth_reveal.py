# Bande-son de « Révélation MyMotiv » (src/Reveal.tsx, 16,5 s) : musique de l'utilisateur (public/audio/apres-midi-fond.mp3)
# étouffée pendant l'arrivée de la particule, grand ouverte sur le flash (ses percussions, à 18,9 s du fichier, tombent
# dessus), refermée juste avant le 2e flash puis rouverte pour l'écran de fin ; « whoosh » sur chaque mouvement de caméra,
# frappe, clics, impacts ; ≈ -14 LUFS.
import os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; DUR = 16.5; N = int(SR*DUR); rng = np.random.default_rng(22)
T = dict(flash=0.95, icon=1.0, word=1.35, iconOut=2.2, win=2.45, zoom=3.3, analyse=4.05, pop=5.6, close=6.95, card=8.15, genClic=8.75, result=8.95, trails=9.5, bar=10.4, type=10.6, menu=11.5, barBack=12.95, send=13.35, flash2=13.75, end=14.0)
MUSIC_IN = 18.9 - T["flash"]

def decode(path, ch):
    out = subprocess.run([FF, "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(float).reshape(-1, ch)
def fit(x): y = np.zeros((N,) + x.shape[1:]); y[:min(N, len(x))] = x[:N]; return y

x = np.arange(N)/SR
m = fit(decode("public/audio/apres-midi-fond.mp3", 2)[int(MUSIC_IN*SR):])
muf = sosfilt(butter(2, 600, "lp", fs=SR, output="sos"), m, axis=0)
# ouverture : 0 (étouffée) → 1 (claire) ; hook étouffé, ouvert au point rose, refermé pendant la tension, grand ouvert au drop
k = np.interp(x, [0, T["flash"] - 0.01, T["flash"], T["send"] - 0.4, T["flash2"] - 0.02, T["flash2"]], [0.1, 0.1, 1, 1, 0.2, 1])[:, None]
m = muf*(1 - k)*1.3 + m*k
m *= np.clip(x/0.2, 0, 1)[:, None]*np.clip((DUR - x)/1.6, 0, 1)[:, None]
m /= np.sqrt(np.mean(m**2))*10**(18/20)

L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def noise(d): return rng.standard_normal(int(d*SR))
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a, dec): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
def click(at, g=0.3): add(HP(noise(0.012), 3000)*env(int(0.012*SR), 0.0002, 0.003), at, g)
def pop(at, f0=420, f1=980, g=0.15, pan=0.0): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g, pan)
def air(at, d=0.45, g=0.08): add(LP(HP(noise(d), 600), 5000)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g, at)
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(2*f, 1.4, 0.004, 0.3), at + i*0.06, g)
def boom(at, g=0.6): add(sweep(110, 36, 0.8)*env(int(0.8*SR), 0.002, 0.25), at, g); add(LP(noise(0.3), 500)*env(int(0.3*SR), 0.001, 0.05), at, g*0.5)
def riser(at, d, g=0.1): add(HP(noise(d), 1200)*np.linspace(0, 1, int(d*SR))**2*g + sweep(200, 1200, d)*np.linspace(0, 1, int(d*SR))**3*g*0.3, at)

def whoosh(at, d=0.45, g=0.12): add(LP(HP(noise(d), 300), 6000)*np.sin(np.linspace(0, np.pi, int(d*SR)))**3*g + sweep(300, 90, d)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g*0.3, at)
riser(0.0, T["flash"], 0.12)
boom(T["flash"], 0.9); chime(T["flash"] + 0.02, 0.05)
pop(T["icon"] + 0.05, 300, 900, 0.16)
for i in range(8): click(T["word"] + i*0.06, 0.06)
whoosh(T["iconOut"], 0.5, 0.16); whoosh(T["win"] + 0.05, 0.6, 0.12)
whoosh(T["zoom"], 0.55, 0.12)
for i in range(22): click(T["zoom"] + 0.15 + i*(T["analyse"] - 0.3 - T["zoom"])/22, 0.04)
click(T["analyse"], 0.35); pop(T["analyse"] + 0.05, 500, 1100, 0.1)
for i in range(4): pop(T["analyse"] + 0.2 + i*0.08, 700, 1400, 0.05)
for i in range(6): click(T["analyse"] + 0.45 + i*0.13, 0.08)
whoosh(T["pop"] - 0.05, 0.4, 0.12); pop(T["pop"] + 0.3, 600, 1300, 0.1)
whoosh(T["close"] - 0.2, 0.5, 0.16); air(T["close"] + 0.3, 1.0, 0.04)
whoosh(T["card"] - 0.15, 0.55, 0.16)
click(T["genClic"], 0.45); boom(T["genClic"], 0.25); chime(T["result"] + 0.2, 0.06); pop(T["result"] + 0.3, 900, 1800, 0.1)
riser(T["trails"], T["bar"] - T["trails"], 0.08); pop(T["bar"], 400, 1000, 0.14)
for i in range(42): click(T["type"] + i*0.03, 0.035)
whoosh(T["menu"] - 0.15, 0.45, 0.14)
for i in range(4): pop(T["menu"] + 0.35 + i*0.07, 600, 1200, 0.07)
for i in range(4): click(T["menu"] + 0.35 + i*(T["barBack"] - 0.55 - T["menu"])/4, 0.12)
whoosh(T["barBack"] - 0.15, 0.45, 0.14)
click(T["send"], 0.45); riser(T["send"], T["flash2"] - T["send"], 0.1)
boom(T["flash2"], 0.8); chime(T["flash2"] + 0.05, 0.05)
for i in range(8): pop(T["end"] + i*0.04, 300 + i*60, 700 + i*90, 0.04)
pop(T["end"] + 0.25, 400, 1000, 0.12)
for i in range(38): click(T["end"] + 0.5 + i*0.03, 0.03)
chime(T["end"] + 1.8, 0.07)
sfx = np.stack([L, R], 1)

mix = m + sfx
mix[-int(0.5*SR):] *= np.linspace(1, 0, int(0.5*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/reveal-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR), "public/audio/reveal.wav"], check=True)
os.remove(raw)
print("audio ok")
