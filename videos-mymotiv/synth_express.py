# Bande-son de « 19 minutes gagnées » (src/Express.tsx, 22,5 s) : musique de l'utilisateur (public/audio/apres-midi-fond.mp3)
# étouffée sur le hook, entrouverte après le 1er flash, grande ouverte sur l'appui « Générer » (ses percussions, à 18,9 s du
# fichier, tombent dessus), refermée juste avant le 2e flash ; « whoosh » à chaque mouvement de caméra, impacts sur les flashs.
import os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; DUR = 22.5; N = int(SR*DUR); rng = np.random.default_rng(31)
X = dict(hook=0, cv=1.7, lien=3.5, gen=5.3, lettre=8.4, temps=10.6, cafe=12.9, leni=15.1, stress=17.6, end=19.6)
F1, CLIC, LOGO, F2 = 1.05, 6.0, 9.35, 19.5
DROP_SRC = 18.9

def decode(path, ch):
    out = subprocess.run([FF, "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(float).reshape(-1, ch)

x = np.arange(N)/SR
m = np.zeros((N, 2)); seg_ = decode("public/audio/apres-midi-fond.mp3", 2)[int((DROP_SRC - CLIC)*SR):]; m[:min(N, len(seg_))] = seg_[:N]
muf = sosfilt(butter(2, 600, "lp", fs=SR, output="sos"), m, axis=0)
k = np.interp(x, [0, F1 - 0.01, F1, CLIC - 0.01, CLIC, F2 - 0.5, F2 - 0.02, F2], [0.15, 0.15, 0.5, 0.3, 1, 1, 0.3, 1])[:, None]
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
def marker(at, d=0.6, g=0.08): add(sosfilt(butter(2, [1500, 6000], "bp", fs=SR, output="sos"), noise(d))*(0.6 + 0.4*np.sin(np.linspace(0, 18, int(d*SR))))*np.sin(np.linspace(0, np.pi, int(d*SR)))*g, at)

riser(0.0, F1, 0.1)
for i in range(6): pop(0.1 + i*0.06, 500, 1000, 0.05)
boom(F1, 0.9); chime(F1 + 0.03, 0.05)
for a in (X["cv"], X["lien"], X["gen"], X["lettre"], X["temps"], X["cafe"], X["leni"], X["stress"]): whoosh(a - 0.08, 0.45, 0.14)
pop(2.5, 300, 700, 0.12); pop(2.7, 700, 1400, 0.12); click(2.7, 0.2)
for i in range(22): click(3.95 + i*0.032, 0.045)
pop(4.8, 700, 1400, 0.12); click(4.8, 0.2)
riser(5.3, CLIC - 5.3, 0.07); click(CLIC, 0.5); boom(CLIC, 0.5)
for s_ in range(31): click(6.35 + s_*1.6/30, 0.035)
chime(7.95, 0.06)
air(LOGO - 0.45, 0.45, 0.12); pop(LOGO, 900, 1800, 0.13); chime(LOGO + 0.05, 0.04)
pop(10.95, 400, 900, 0.08); pop(11.3, 900, 1600, 0.1)
pop(13.15, 300, 800, 0.1); pop(13.45, 600, 1300, 0.12); chime(13.6, 0.04)
pop(15.6, 400, 900, 0.1); pop(16.05, 800, 1600, 0.14); chime(16.1, 0.05)
for i in range(3): pop(17.7 + i*0.5, 500 + i*150, 1000 + i*200, 0.07)
whoosh(F2 - 0.25, 0.4, 0.14); boom(F2, 0.8); chime(F2 + 0.05, 0.05)
for i in range(8): pop(X["end"] + i*0.04, 300 + i*60, 700 + i*90, 0.04)
chime(X["end"] + 0.6, 0.06); pop(X["end"] + 1.2, 500, 1100, 0.1)
sfx = np.stack([L, R], 1)

mix = m + sfx
mix[-int(0.5*SR):] *= np.linspace(1, 0, int(0.5*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/express-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR), "public/audio/express.wav"], check=True)
os.remove(raw)
print("audio ok")
