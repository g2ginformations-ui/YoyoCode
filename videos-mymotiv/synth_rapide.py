# Bande-son de « 3 étapes, 30 secondes » (src/AppleRapide.tsx, 16,5 s) : musique de l'utilisateur
# (public/audio/apres-midi-fond.mp3) à demi ouverte sur le slogan, qui se referme pendant les étapes puis s'ouvre en grand
# avec un « boum » sur le clic « Générer » (ses percussions, à 18,9 s du fichier, tombent dessus) ; bruitages ; ≈ -14 LUFS.
import os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; DUR = 16.5; N = int(SR*DUR); rng = np.random.default_rng(22)
T = dict(etapes=2.5, cv=3.1, lien=3.9, gen=4.7, clic=5.6, ring=5.9, pret=8.4, logo=9.2, envoi=10.7, envoyee=11.3, offerte=12.5, fin=14.3)
MUSIC_IN = 18.9 - T["clic"]

def decode(path, ch):
    out = subprocess.run([FF, "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(float).reshape(-1, ch)
def fit(x): y = np.zeros((N,) + x.shape[1:]); y[:min(N, len(x))] = x[:N]; return y

x = np.arange(N)/SR
m = fit(decode("public/audio/apres-midi-fond.mp3", 2)[int(MUSIC_IN*SR):])
muf = sosfilt(butter(2, 600, "lp", fs=SR, output="sos"), m, axis=0)
# ouverture : 0 (étouffée) → 1 (claire) ; hook étouffé, ouvert au point rose, refermé pendant la tension, grand ouvert au drop
k = np.interp(x, [0, T["etapes"], T["clic"] - 0.01, T["clic"]], [0.55, 0.55, 0.1, 1])[:, None]
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

for i in range(4): pop(0.0 + i*0.3, 500, 900, 0.07)                      # mots du slogan
air(T["etapes"] - 0.1, 0.45, 0.1); pop(T["etapes"], 400, 1000, 0.1); pop(T["etapes"] + 0.3, 600, 1300, 0.1)
for a in (T["cv"], T["lien"]): air(a - 0.05, 0.4, 0.09); pop(a + 0.1, 400, 900, 0.1); pop(a + 0.5, 700, 1400, 0.12); click(a + 0.5, 0.15)
air(T["gen"] - 0.05, 0.4, 0.09); pop(T["gen"] + 0.1, 400, 1000, 0.12)
riser(T["gen"] + 0.2, T["clic"] - T["gen"] - 0.2, 0.07)
click(T["clic"], 0.5); boom(T["clic"], 0.8); air(T["clic"] + 0.15, 0.45, 0.12)
for s in range(31): click(T["ring"] + 0.2 + s*(T["pret"] - 0.4 - T["ring"])/30, 0.04)   # chrono
chime(T["pret"] - 0.15, 0.06); air(T["pret"], 0.45, 0.1)
air(T["logo"] - 0.45, 0.45, 0.12); pop(T["logo"], 900, 1800, 0.13); chime(T["logo"] + 0.05, 0.04)
riser(T["envoi"] - 0.3, 0.3, 0.05); air(T["envoi"], 0.7, 0.16); pop(T["envoi"] + 0.4, 600, 1400, 0.12); chime(T["envoi"] + 0.45, 0.05)
pop(T["envoyee"], 400, 900, 0.08); pop(T["envoyee"] + 0.35, 500, 1100, 0.08)
air(T["offerte"] - 0.3, 0.5, 0.12); pop(T["offerte"] + 0.1, 400, 1000, 0.14); chime(T["offerte"] + 0.3, 0.06)
click(T["fin"] - 0.1, 0.3); air(T["fin"], 0.6, 0.1); pop(T["fin"] + 0.55, 900, 400, 0.1); chime(T["fin"] + 0.9, 0.07)
sfx = np.stack([L, R], 1)

mix = m + sfx
mix[-int(0.5*SR):] *= np.linspace(1, 0, int(0.5*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/apple-rapide-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR), "public/audio/apple-rapide.wav"], check=True)
os.remove(raw)
print("audio ok")
