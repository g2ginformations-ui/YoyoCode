# Bande-son « L'après-midi candidatures » version musique de l'utilisateur (30,5 s) :
# - voix traitée (ffmpeg) : coupe-bas, débruitage, EQ « radio » (moins de boue, plus de présence), dé-esseur, compresseur ;
# - effet téléphone sur la partie chatbot (« Même avec un chatbot IA… sans logo de l'entreprise. ») ;
# - réverbération douce sur les deux « Respire » ;
# - musique de fond (public/audio/apres-midi-fond.mp3) : étouffée pendant le stress, elle s'ouvre sur « Respire »,
#   ses percussions tombent sur le clic « Générer » ; elle s'efface sous la voix (ducking) ;
# - SANS_MUSIQUE=1 : même voix et bruitages sans la musique (pour ajouter le son depuis la bibliothèque TikTok) ;
# - quelques bruitages discrets, puis volume final normalisé pour TikTok (≈ -14 LUFS, crête -1 dB).
import os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; DUR = 30.5; N = int(SR*DUR); rng = np.random.default_rng(30)
MUSIC_IN = 2.3   # la musique démarre à 2,3 s de son fichier : ses percussions (18,9 s) tombent sur « Générer » (16,6 s)

def decode(path, ch, af=None):
    cmd = [FF, "-v", "error", "-i", path] + (["-af", af] if af else []) + ["-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).astype(float).reshape(-1, ch)

def fit(x):
    y = np.zeros((N,) + x.shape[1:]); y[:min(N, len(x))] = x[:N]; return y

def ramp(t0, t1, fade=0.05):  # 1 entre t0 et t1, fondus de « fade » s
    x = np.arange(N)/SR; return np.clip(np.minimum((x - t0)/fade + 1, (t1 - x)/fade + 1), 0, 1)

# ── voix
voice = fit(decode("public/audio/apres-midi-voix.wav", 1, ",".join([
    "highpass=f=85", "afftdn=nf=-28",
    "equalizer=f=280:t=q:w=1.1:g=-3", "equalizer=f=3200:t=q:w=1.2:g=3.5", "highshelf=f=9000:g=2",
    "deesser=i=0.35", "acompressor=threshold=-21dB:ratio=3:attack=6:release=90:makeup=2.5"])))[:, 0]
# téléphone : bande 350–3400 Hz + légère saturation, mélangé à la voix d'origine
tel = sosfilt(butter(4, [350, 3400], "bp", fs=SR, output="sos"), voice); tel = np.tanh(tel*4)/np.tanh(4)*0.9
k = ramp(4.33, 9.75, 0.06)*0.85
voice = voice*(1 - k) + tel*k*1.6
# réverbération (réponse impulsionnelle synthétique : bruit filtré qui décroît en 1,8 s)
n = int(1.8*SR); ir = rng.standard_normal(n)*np.exp(-np.arange(n)/SR/0.45); ir = sosfilt(butter(2, 5000, "lp", fs=SR, output="sos"), ir)
ir /= np.sqrt(np.sum(ir**2))
send = voice*(ramp(10.38, 11.42, 0.04) + ramp(28.55, 29.0, 0.04))
wet = fftconvolve(send, ir)[:N]*0.45
voiceL = voice + wet*1.0; voiceR = voice + np.roll(wet, int(0.011*SR))  # petit décalage = largeur stéréo

# ── musique
m = decode("public/audio/apres-midi-fond.mp3", 2)[int(MUSIC_IN*SR):]
m = fit(m)
x = np.arange(N)/SR
muf = sosfilt(butter(2, 700, "lp", fs=SR, output="sos"), m, axis=0)        # version étouffée (stress)
open_k = np.clip((x - 10.2)/0.9, 0, 1)[:, None]                          # s'ouvre sur « Respire »
m = muf*(1 - open_k)*1.25 + m*open_k
m *= np.clip(x/0.4, 0, 1)[:, None]                                       # entrée
m *= np.clip((DUR - x)/1.6, 0, 1)[:, None]                               # sortie
venv = np.convolve(np.abs(voice), np.ones(int(0.12*SR))/int(0.12*SR), "same"); venv /= np.max(venv)
duck = 1 - 0.55*np.clip(venv*3, 0, 1); duck = np.convolve(duck, np.ones(int(0.1*SR))/int(0.1*SR), "same")
m *= duck[:, None]
# niveau : musique ≈ 15 dB sous la voix
rms = lambda a: np.sqrt(np.mean(a**2) + 1e-12)
m *= rms(voice[voice != 0])/rms(m)*10**(-15/20)*(0 if os.environ.get("SANS_MUSIQUE") else 1)

# ── bruitages discrets (repris de synth_apresmidi.py, moins forts)
L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0):
    i = int(at*SR); j = min(N, i + len(s))
    if j > i: L[i:j] += s[:j-i]*g; R[i:j] += s[:j-i]*g
def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
def HP(s, c): a = np.exp(-2*np.pi*c/SR); return s - lfilter([1-a], [1, -a], s)
def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
def tone(f, d, a, dec): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*env(len(t), a, dec)
def click(at, g): add(HP(rng.standard_normal(int(0.012*SR)), 3000)*env(int(0.012*SR), 0.0002, 0.003), at, g)
def pop(at, f0, f1, g): add(sweep(f0, f1, 0.09)*env(int(0.09*SR), 0.002, 0.035), at, g)
def chime(at, g):
    for i, f in enumerate((1318.5, 1760, 2093)): add(tone(f, 1.4, 0.004, 0.5), at + i*0.06, g)
for a in (13.47, 14.07, 14.95, 15.67): pop(a, 700, 1400, 0.06); click(a, 0.08)
click(16.57, 0.2); pop(20.33, 900, 1800, 0.07); chime(20.38, 0.025)
click(22.82, 0.15); click(23.51, 0.15); pop(25.1, 400, 900, 0.07); chime(27.95, 0.035)
sfx = np.stack([L, R], 1)*rms(voice[voice != 0])/0.05*0.05

mix = np.stack([voiceL, voiceR], 1) + m + sfx
mix[-int(0.5*SR):] *= np.linspace(1, 0, int(0.5*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
OUT = "public/audio/apres-midi-" + ("voix-seule" if os.environ.get("SANS_MUSIQUE") else "musique") + ".wav"
raw = OUT.replace(".wav", "-brut.wav")
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR),
                OUT], check=True)
os.remove(raw)
print("audio ok")
