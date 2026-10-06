# Bande-son de « Arrête d'écrire tes lettres » (src/YannStop.tsx) :
# - voix de Yann (synthèse, public/audio/yann-stop-voix.wav) traitée en voix « radio » (EQ, dé-esseur, compresseur) ;
# - musique de l'utilisateur (public/audio/apres-midi-fond.mp3) : étouffée pendant le problème, elle s'ouvre quand Yann
#   se présente ; ses percussions (18,9 s du fichier) tombent sur le clic « Générer » ; elle s'efface sous la voix ;
# - bruitages discrets style Apple ; volume final ≈ -14 LUFS (TikTok).
import json, os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(7)
DUR = json.load(open("src/data/yann-stop-phrases.json"))["duration"]; N = int(SR*DUR)
CLIC = 12.5; MUSIC_IN = 18.9 - CLIC; OPEN = 6.3

def decode(path, ch, af=None):
    cmd = [FF, "-v", "error", "-i", path] + (["-af", af] if af else []) + ["-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).astype(float).reshape(-1, ch)
def fit(x): y = np.zeros((N,) + x.shape[1:]); y[:min(N, len(x))] = x[:N]; return y
rms = lambda a: np.sqrt(np.mean(a**2) + 1e-12)

# ── voix
voice = fit(decode("public/audio/yann-stop-voix.wav", 1, ",".join([
    "highpass=f=80", "equalizer=f=180:t=q:w=1:g=2", "equalizer=f=350:t=q:w=1.2:g=-2.5", "equalizer=f=3000:t=q:w=1.2:g=3",
    "highshelf=f=9000:g=1.5", "deesser=i=0.3", "acompressor=threshold=-20dB:ratio=3:attack=5:release=80:makeup=2"])))[:, 0]
n = int(1.2*SR); ir = rng.standard_normal(n)*np.exp(-np.arange(n)/SR/0.25); ir = sosfilt(butter(2, 4500, "lp", fs=SR, output="sos"), ir); ir /= np.sqrt(np.sum(ir**2))
room = fftconvolve(voice, ir)[:N]*0.08          # une pointe d'espace, pour ne pas sonner « sec »
vL, vR = voice + room, voice + np.roll(room, int(0.009*SR))

# ── musique
x = np.arange(N)/SR
m = fit(decode("public/audio/apres-midi-fond.mp3", 2)[int(MUSIC_IN*SR):])
muf = sosfilt(butter(2, 650, "lp", fs=SR, output="sos"), m, axis=0)
k = np.clip((x - OPEN)/0.8, 0, 1)[:, None]
m = muf*(1 - k)*1.3 + m*k
m *= np.clip((x - 0.15)/0.25, 0, 1)[:, None]*np.clip((DUR - x)/1.5, 0, 1)[:, None]
venv = np.convolve(np.abs(voice), np.ones(int(0.12*SR))/int(0.12*SR), "same"); venv /= np.max(venv)
duck = 1 - 0.5*np.clip(venv*3, 0, 1); duck = np.convolve(duck, np.ones(int(0.1*SR))/int(0.1*SR), "same")
m *= duck[:, None]
m *= rms(voice[voice != 0])/rms(m)*10**(-14/20)

# ── bruitages
L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i: L[i:j] += s[:j-i]*g*(1 - max(0, pan)); R[i:j] += s[:j-i]*g*(1 + min(0, pan))
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
def HP(s, c): return s - LP(s, c)
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a, dec): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
def noise(d): return rng.standard_normal(int(d*SR))
def click(at, g=0.3): add(HP(noise(0.012), 3000)*env(int(0.012*SR), 0.0002, 0.003), at, g)
def pop(at, f0=420, f1=980, g=0.15): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g)
def air(at, d=0.45, g=0.08): add(LP(HP(noise(d), 600), 5000)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g, at)
def chime(at, g=0.05):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5) + 0.25*tone(2*f, 1.4, 0.004, 0.3), at + i*0.06, g)
def boom(at, g=0.6): add(sweep(120, 38, 0.6)*env(int(0.6*SR), 0.002, 0.18), at, g); add(LP(noise(0.3), 400)*env(int(0.3*SR), 0.001, 0.05)*0.5, at, g)
boom(0.2, 0.7); click(0.2, 0.3)                                       # « Arrête. »
for i in range(11): click(1.3 + i*0.12, 0.05)                           # lignes qui s'écrivent
add(HP(noise(0.35), 1500)*env(int(0.35*SR), 0.01, 0.12), 2.2, 0.12); add(HP(noise(0.35), 1500)*env(int(0.35*SR), 0.01, 0.12), 2.38, 0.12)  # le stylo barre
air(2.85, 0.5, 0.1)
for h in range(4): click(3.4 + h*0.4, 0.12)                             # horloge
for i in range(3): pop(4.2 + i*0.15, 500, 900, 0.07)
pop(5.45, 700, 380, 0.08)                                               # « pas de réponse »
air(6.3, 0.6, 0.1); pop(7.1, 400, 1000, 0.12); pop(7.6, 300, 900, 0.14)
click(8.24, 0.25); air(8.3, 0.4, 0.08)
for i in range(26): click(8.64 + i*0.028, 0.035)                        # frappe du lien
pop(9.45, 700, 1400, 0.12); pop(9.87, 400, 900, 0.1); pop(10.95, 700, 1400, 0.12); pop(11.28, 400, 1000, 0.12)
air(11.6, 0.6, 0.08); click(CLIC, 0.5); boom(CLIC, 0.35)
air(12.6, 0.5, 0.1)
for s in range(31): click(12.95 + s*(15.75 - 12.95)/30, 0.04)           # chrono
chime(15.75, 0.06); pop(16.45, 500, 1100, 0.1)
air(17.85, 0.45, 0.12); pop(18.3, 900, 1800, 0.13); chime(18.35, 0.04)
click(19.8, 0.3); pop(19.85, 900, 500, 0.1); click(20.55, 0.3); pop(20.6, 500, 900, 0.1); pop(21.1, 600, 1300, 0.1)
air(21.6, 0.5, 0.1); pop(21.9, 400, 900, 0.12); chime(23.4, 0.06)
for i in range(14): pop(23.45 + i*0.035, rng.uniform(900, 1600), rng.uniform(1600, 2600), 0.03)   # confettis
pop(24.2, 500, 1000, 0.08); air(25.2, 0.45, 0.1); pop(25.4, 500, 1100, 0.12)
air(26.0, 1.0, 0.05); pop(26.85, 400, 900, 0.12); air(27.1, 0.6, 0.1); chime(28.75, 0.07)
sfx = np.stack([L, R], 1)*rms(voice[voice != 0])/0.05*0.06

mix = np.stack([vL, vR], 1) + m + sfx
mix[-int(0.5*SR):] *= np.linspace(1, 0, int(0.5*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/yann-stop-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR),
                "public/audio/yann-stop.wav"], check=True)
os.remove(raw)
print("audio ok")
