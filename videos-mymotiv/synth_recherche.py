# Bande-son de « Recherche » (src/Recherche.tsx) : voix de l'utilisateur traitée façon narrateur grave
# (public/audio/recherche-voix.wav, tools/voix-narrateur.py) devant, musique de l'utilisateur (apres-midi-fond.mp3)
# dessous : à demi ouverte sur la page internet, étouffée pendant le récit et « Respire », grande ouverte sur le flash
# (ses percussions, à 18,9 s du fichier, tombent sur l'arrivée chez MyMotiv), prolongée par un raccord en boucle calé sur
# le rythme ; elle s'efface sous la voix (ducking). Bruitages à chaque geste ; volume final ≈ -14 LUFS.
import json, os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(44)
DUR = json.load(open("src/data/recherche-voix.json"))["duration"]; N = int(SR*DUR)
V = dict(click=0.55, type=1.0, rewind=2.25, lettres=3.02, heures=4.48, seul=5.26, ecran=5.8, meme=7.76, min20=9.62, generique=11.3,
         sansLogo=11.94, respire=14.32, back=15.7, avec=16.46, flash=16.62, clics=17.34, cv=18.92, lien=19.5, longueur=20.3,
         options=20.95, generer=21.9, s30=23.64, ecrite=24.4, logo=26.4, detail=28.58, court=29.94, long=30.66, unClic=31.38,
         offerte=32.72, offerteMot=33.64, prix=34.05, bio=37.96, postule=39.74, respire2=40.66, end=41.15, save=42.5)
DROP_SRC = 18.9
# Version courte (COURT=1) : montage de src/data/recherche30.json ; les temps ci-dessous restent ceux de la version longue
# et sont convertis (fmap) ; les bruitages des passages coupés disparaissent.
COURT = bool(os.environ.get("COURT"))
SEGS = json.load(open("src/data/recherche30.json"))["segs"] if COURT else [[0, DUR, 1]]
def fmap(s):
    acc = 0
    for a, b, v in SEGS:
        if a <= s < b: return acc + (s - a)/v
        acc += (b - a)/v
    return None
V_SRC = dict(V)
if COURT:
    DUR = sum((b - a)/v for a, b, v in SEGS); N = int(SR*DUR)
    V = {k: (fmap(x) if fmap(x) is not None else -10) for k, x in V.items()}
OUT = "recherche30" if COURT else "recherche"

def decode(path, ch):
    out = subprocess.run([FF, "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(float).reshape(-1, ch)

# ── musique + raccord en boucle
src = decode("public/audio/apres-midi-fond.mp3", 2)
mono = src.mean(1); hop = 480
fr = np.lib.stride_tricks.sliding_window_view(mono, 2048)[::hop]
E = np.log1p(np.abs(np.fft.rfft(fr*np.hanning(2048), axis=1))[:, :200])
need_after = DUR - V["flash"]                      # durée de musique rythmée à fournir
# période du rythme (autocorrélation de l'attaque des notes sur la partie rythmée), puis raccord sur un nombre entier de temps
on = np.maximum(0, np.diff(E, axis=0)).sum(1); seg_on = on[int(19*SR/hop):int(36*SR/hop)]; seg_on = seg_on - seg_on.mean()
ac = np.correlate(seg_on, seg_on, "full")[len(seg_on)-1:]; lags = np.arange(len(ac))*hop/SR
win = (lags > 0.35) & (lags < 1.0); BEAT = lags[win][np.argmax(ac[win])]
best = (-1e9, 0, 0)
for j1 in np.arange(28.0, 35.0, 0.02):
    for nb in range(4, 24):
        j0 = j1 - nb*BEAT
        if j0 < 19.2 or (j1 - DROP_SRC) + (src.shape[0]/SR - 0.5 - j0) < need_after: continue
        a, b = int(j1*SR/hop), int(j0*SR/hop); w = 150
        if a + w >= len(E): continue
        sc = -np.mean((E[a:a+w] - E[b:b+w])**2) - np.mean((E[a-w:a] - E[b-w:b])**2)
        if sc > best[0]: best = (sc, j1, j0)
print(f"temps : {BEAT:.3f} s")
_, J1, J0 = best
print(f"raccord : {J1:.2f} s → {J0:.2f} s")
A = src[int((DROP_SRC - V["flash"])*SR):int(J1*SR)]; B = src[int(J0*SR):]
xf = int(0.08*SR); ramp = np.linspace(0, 1, xf)[:, None]
music = np.concatenate([A[:-xf], A[-xf:]*(1 - ramp) + B[:xf]*ramp, B[xf:]])
m = np.zeros((N, 2)); m[:min(N, len(music))] = music[:N]
x = np.arange(N)/SR
muf = sosfilt(butter(2, 550, "lp", fs=SR, output="sos"), m, axis=0)
k = (np.interp(x, [0, V["rewind"], V["rewind"] + 0.5, V["flash"] - 0.01, V["flash"], DUR], [0.6, 0.6, 0.15, 0.25, 1, 1]) if COURT else
     np.interp(x, [0, V["rewind"], V["rewind"] + 0.5, 13.0, 13.6, V["back"], V["flash"] - 0.01, V["flash"], DUR], [0.6, 0.6, 0.2, 0.2, 0.08, 0.15, 0.25, 1, 1]))[:, None]
m = muf*(1 - k)*1.3 + m*k
m *= np.clip(x/0.15, 0, 1)[:, None]*np.clip((DUR - x)/1.8, 0, 1)[:, None]
# voix + ducking
voice = decode("public/audio/recherche-voix.wav", 1)[:, 0]; vv = np.zeros(N)
acc_ = 0.0
for a_, b_, v_ in SEGS:
    if v_ == 1:
        piece = voice[int(a_*SR):int(b_*SR)].copy(); f_ = int(0.01*SR)
        if len(piece) > 2*f_: piece[:f_] *= np.linspace(0, 1, f_); piece[-f_:] *= np.linspace(1, 0, f_)
        i_ = int(acc_*SR); vv[i_:i_ + len(piece)] = piece[:max(0, N - i_)]
    acc_ += (b_ - a_)/v_
rms = lambda a: np.sqrt(np.mean(a**2) + 1e-12)
venv = np.convolve(np.abs(vv), np.ones(int(0.12*SR))/int(0.12*SR), "same"); venv /= np.max(venv)
duck = 1 - 0.55*np.clip(venv*3, 0, 1); duck = np.convolve(duck, np.ones(int(0.12*SR))/int(0.12*SR), "same")
m *= duck[:, None]
m *= rms(vv[np.abs(vv) > 0.01])/rms(m[int(V["flash"]*SR):])*10**(-13/20)

L = np.zeros(N); R = np.zeros(N)
def add(s, at, g=1.0, pan=0.0):
    if COURT:
        at = fmap(at)
        if at is None: return
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

def whoosh(at, d=0.45, g=0.12): add(LP(HP(noise(d), 300), 6000)*np.sin(np.linspace(0, np.pi, int(d*SR)))**3*g + sweep(300, 90, d)*np.sin(np.linspace(0, np.pi, int(d*SR)))**2*g*0.3, at)
def tape(at, d=0.5, g=0.12): add(sweep(900, 120, d)*np.linspace(1, 0, int(d*SR))*g + HP(noise(d), 2000)*np.linspace(0.6, 0, int(d*SR))*g*0.3, at)
V = V_SRC   # bruitages : temps de la version longue (convertis dans add)
# 0. page internet, clic, zoom, frappe, retour en arrière
whoosh(0.0, 0.5, 0.12); click(V["click"], 0.45); whoosh(V["click"] + 0.03, 0.45, 0.1)
for i in range(23): click(V["type"] + i*0.041, 0.05)
tape(V["rewind"], 0.55, 0.16); whoosh(V["rewind"], 0.5, 0.14)
# 1-2. récit
for i in range(3): pop(V["lettres"] + 0.1 + i*0.22, 400, 800, 0.06)
for h in range(4): click(V["heures"] - 0.1 + h*0.2, 0.12)
whoosh(V["meme"] - 0.3, 0.45, 0.1)
for i in range(30): click(V["meme"] + i*0.02, 0.03)
for a in (V["min20"], V["generique"], V["sansLogo"]): pop(a, 700, 380, 0.12); add(LP(noise(0.25), 400)*env(int(0.25*SR), 0.002, 0.06), a, 0.2)
add(LP(noise(1.2), 260)*np.linspace(0, 1, int(1.2*SR))*0.06, 11.8)
# 3. respire
air(13.4, 1.6, 0.06); chime(V["respire"] + 0.05, 0.045)
# 4. retour à la barre, Entrée, flash
whoosh(V["back"] - 0.05, 0.5, 0.12); riser(V["back"] + 0.2, V["flash"] - V["back"] - 0.2, 0.1)
click(V["avec"], 0.55); boom(V["flash"], 0.95); chime(V["flash"] + 0.05, 0.06); whoosh(V["flash"], 0.6, 0.14)
pop(V["clics"], 400, 1000, 0.14)
# 5. étapes
whoosh(17.95, 0.4, 0.12)
for i in range(5): pop(18.0 + i*0.07, 500, 900, 0.04)
for a in (V["cv"], V["lien"], V["longueur"], V["options"], V["generer"]): click(a, 0.45); pop(a + 0.02, 700, 1400, 0.1)
boom(V["generer"], 0.3); whoosh(V["generer"] + 0.3, 0.45, 0.12)
# 6. anneau
for s_ in range(31): click(22.95 + s_*1.3/30, 0.035)
chime(24.25, 0.06)
# 7. lettre
whoosh(V["ecrite"] - 0.1, 0.45, 0.12)
for i in range(14): click(V["ecrite"] + 0.25 + i*0.06, 0.03)
air(V["logo"] - 0.45, 0.45, 0.12); pop(V["logo"], 900, 1800, 0.14); chime(V["logo"] + 0.05, 0.05)
# 8. ajustements
for a in (V["court"], V["long"]): click(a, 0.45); pop(a + 0.03, 900 if a == V["court"] else 500, 500 if a == V["court"] else 900, 0.1)
pop(V["unClic"], 600, 1300, 0.12)
# 9. offerte
whoosh(V["offerte"] - 0.15, 0.4, 0.14); pop(V["offerte"] + 0.15, 400, 1000, 0.14); chime(V["offerteMot"], 0.07)
for i in range(14): pop(V["offerteMot"] + 0.02 + i*0.03, rng.uniform(900, 1600), rng.uniform(1600, 2600), 0.03)
# 10. prix
for i in range(4): whoosh(34.3 + i*0.85 - 0.05, 0.35, 0.13); pop(34.3 + i*0.85 + 0.15, 500 + i*120, 1100 + i*160, 0.1)
chime(34.3 + 3*0.85 + 0.2, 0.06); pop(34.9, 600, 1200, 0.08)
# 11-12. bio, postule, fin
whoosh(V["bio"] - 0.1, 0.4, 0.12); pop(V["bio"], 500, 1100, 0.14)
whoosh(V["postule"] - 0.1, 0.35, 0.1); whoosh(V["respire2"] - 0.1, 0.35, 0.1)
for i in range(8): pop(V["end"] + i*0.04, 300 + i*60, 700 + i*90, 0.04)
chime(V["end"] + 0.4, 0.06); pop(V["end"] + 1.0, 500, 1100, 0.1); click(V["save"], 0.45); pop(V["save"] + 0.02, 600, 1500, 0.14); chime(V["save"] + 0.05, 0.05)
sfx = np.stack([L, R], 1)*rms(vv[np.abs(vv) > 0.01])/0.05*0.05

mix = np.stack([vv, vv], 1) + m + sfx
mix[-int(0.5*SR):] *= np.linspace(1, 0, int(0.5*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
raw = f"public/audio/{OUT}-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR), f"public/audio/{OUT}.wav"], check=True)
os.remove(raw)
print("audio ok")
