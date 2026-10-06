# Bande-son de « 80 fantômes » (src/Fantomes.tsx) : voix NATURELLE de l'utilisateur (public/audio/fantomes-voix.wav,
# tools/voix-narrateur.py + voix-fantomes.json) devant ; musique de l'utilisateur (apres-midi-fond.mp3) dessous, étouffée
# jusqu'au flash d'arrivée chez MyMotiv puis grande ouverte (ses percussions, à 18,9 s du fichier, tombent sur le flash),
# prolongée par un raccord en boucle calé sur le rythme ; ducking sous la voix.
# Bruitages fabriqués ici et nommés selon les catégories UCS (Universal Category System) : GLITCH, UI CLICK, WHOOSH,
# IMPACT, STATIC (téléviseur), BELL, MAGIC/SPARKLE, GHOST (souffle grave). Volume final ≈ -14 LUFS.
import json, os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(80)
VX = json.load(open("src/data/fantomes-voix.json")); P = VX["phrases"]
DUR = VX["duration"]; N = int(SR*DUR)
# mêmes temps clés que src/Fantomes.tsx
V = dict(click=0.3, type=0.55, cent=P[0]["t0"], grid=P[0]["t0"] + 0.35, refus=P[1]["t0"], fant=P[2]["t0"] + 0.6, ghost=VX["effets"][0]["t0"],
         pasToi=P[3]["t0"], lettre=P[4]["t0"], meme=P[4]["t0"] + 1.0, respire=P[5]["t0"], respEnd=P[5]["t1"], avec=P[6]["t0"], flash=P[6]["t0"] + 0.25,
         clics=P[6]["t1"] - 0.65, steps=P[7]["t0"], cv=P[7]["t0"] + 0.4, lien=P[7]["t0"] + 1.0, generer=P[7]["t1"] - 0.6, s30=P[8]["t0"],
         ecrite=P[8]["t0"] + 1.25, logo=P[8]["t1"] - 1.25, offerte=P[9]["t0"], offerteMot=P[9]["t0"] + 1.2, cafe=P[10]["t0"], save=P[11]["t0"],
         saveTap=P[11]["t0"] + 1.4, bio=P[12]["t0"], postule=P[13]["t0"], end=P[13]["t1"] - 0.2)
DROP_SRC = 18.9

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
k = np.interp(x, [0, V["cent"] - 0.05, V["cent"], V["respire"], V["respEnd"], V["flash"] - 0.01, V["flash"], DUR], [0.55, 0.55, 0.15, 0.15, 0.08, 0.2, 1, 1])[:, None]
m = muf*(1 - k)*1.3 + m*k
m *= np.clip(x/0.15, 0, 1)[:, None]*np.clip((DUR - x)/2.2, 0, 1)[:, None]
voice = decode("public/audio/fantomes-voix.wav", 1)[:, 0]; vv = np.zeros(N); vv[:min(N, len(voice))] = voice[:N]
rms = lambda a: np.sqrt(np.mean(a**2) + 1e-12)
venv = np.convolve(np.abs(vv), np.ones(int(0.12*SR))/int(0.12*SR), "same"); venv /= np.max(venv)
duck = 1 - 0.55*np.clip(venv*3, 0, 1); duck = np.convolve(duck, np.ones(int(0.12*SR))/int(0.12*SR), "same")
m *= duck[:, None]
m *= rms(vv[np.abs(vv) > 0.01])/rms(m[int(V["flash"]*SR):])*10**(-13/20)

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
def glitch(at, d=0.4, g=0.12):          # GLITCH : rafales numériques hachées
    n = int(d*SR); s = np.zeros(n); t_ = 0
    while t_ < n:
        L_ = int(rng.uniform(0.01, 0.04)*SR); f = rng.uniform(300, 3000)
        s[t_:t_+L_] = np.sign(np.sin(2*np.pi*f*np.arange(min(L_, n - t_))/SR))*rng.uniform(0.3, 1)*(rng.random() > 0.3)
        t_ += L_ + int(rng.uniform(0, 0.02)*SR)
    add(HP(s, 200)*np.linspace(1, 0.3, n), at, g)
def static(at, d, g=0.03): add(sosfilt(butter(2, [800, 5000], "bp", fs=SR, output="sos"), noise(d))*(0.7 + 0.3*np.sin(np.linspace(0, 60, int(d*SR)))), at, g)   # STATIC
def ghostswell(at, d=1.6, g=0.12):      # GHOST : souffle grave qui monte puis s'éteint
    e_ = np.sin(np.linspace(0, np.pi, int(d*SR)))**2; add(LP(noise(d), 500)*e_*g + sweep(160, 70, d)*e_*g*0.5, at)
def sparkle(at, g=0.04):                # MAGIC/SPARKLE
    for i in range(10): add(tone(rng.uniform(2000, 4500), 0.25, 0.002, 0.06), at + i*0.03, g)
def stamp(at, g=0.25): add(LP(noise(0.08), 900)*env(int(0.08*SR), 0.001, 0.02), at, g); pop(at, 300, 140, g*0.5)   # IMPACT léger (✕)

# 0. page, clic, frappe
whoosh(0.0, 0.4, 0.1); click(V["click"], 0.45)
for i in range(23): click(V["type"] + i*0.037, 0.05)
# 1. C-c-cent candidatures / refus / fantômes
glitch(V["cent"] - 0.02, 0.45, 0.14); boom(V["cent"] + 0.3, 0.5)
for i in range(100): click(V["grid"] + i*0.009, 0.012)
for i in range(20): stamp(V["refus"] + i*0.02, 0.06)
ghostswell(V["ghost"] - 0.3, 2.0, 0.14); whoosh(V["fant"], 0.9, 0.1)
# 2. pas toi / ta lettre (téléviseur)
whoosh(V["pasToi"] - 0.1, 0.4, 0.1); static(V["lettre"] - 0.05, P[4]["t1"] - P[4]["t0"] + 0.1, 0.035)
for i in range(7): click(V["meme"] + 0.05 + i*0.16, 0.25); pop(V["meme"] + 0.07 + i*0.16, 500, 900, 0.05)
# 3. respire
air(V["respire"] - 0.3, 1.6, 0.06); chime(V["respire"] + 0.05, 0.04)
# 4. retour à la barre, Entrée, flash
whoosh(V["respEnd"] - 0.1, 0.45, 0.12); riser(V["respEnd"] + 0.2, V["flash"] - V["respEnd"] - 0.2, 0.1)
click(V["avec"] + 0.1, 0.55); boom(V["flash"], 0.95); chime(V["flash"] + 0.05, 0.06); whoosh(V["flash"], 0.6, 0.14)
pop(V["clics"], 400, 1000, 0.14)
# 5. étapes
whoosh(V["steps"] - 0.3, 0.4, 0.12)
for a in (V["cv"], V["lien"], V["generer"]): click(a, 0.45); pop(a + 0.02, 700, 1400, 0.1)
boom(V["generer"], 0.3); whoosh(V["generer"] + 0.25, 0.4, 0.12)
# 6. anneau + lettre
for s_ in range(31): click(V["s30"] + 0.05 + s_*(V["ecrite"] - 0.15 - V["s30"])/30, 0.035)
chime(V["ecrite"] - 0.1, 0.06); whoosh(V["ecrite"] - 0.1, 0.4, 0.1)
air(V["logo"] - 0.45, 0.45, 0.12); pop(V["logo"], 900, 1800, 0.14); chime(V["logo"] + 0.05, 0.05)
# 7. offerte, café
whoosh(V["offerte"] - 0.15, 0.4, 0.14); pop(V["offerte"] + 0.15, 400, 1000, 0.14); chime(V["offerteMot"], 0.07); sparkle(V["offerteMot"], 0.04)
for i in range(14): pop(V["offerteMot"] + 0.02 + i*0.03, rng.uniform(900, 1600), rng.uniform(1600, 2600), 0.03)
pop(V["cafe"] - 0.2, 300, 800, 0.12); click(V["cafe"] + 0.35, 0.2)
# 8. enregistre
whoosh(V["save"] - 0.1, 0.4, 0.12); click(V["saveTap"], 0.5); pop(V["saveTap"] + 0.02, 600, 1500, 0.14); sparkle(V["saveTap"] + 0.05, 0.035)
# 9-10. bio, postule, fin
whoosh(V["bio"] - 0.1, 0.4, 0.12); pop(V["bio"], 500, 1100, 0.14)
whoosh(V["postule"] - 0.1, 0.35, 0.1)
for i in range(8): pop(V["end"] + i*0.04, 300 + i*60, 700 + i*90, 0.04)
chime(V["end"] + 0.3, 0.06)
sfx = np.stack([L, R], 1)*rms(vv[np.abs(vv) > 0.01])/0.05*0.05

mix = np.stack([vv, vv], 1) + m + sfx
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/fantomes-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR), "public/audio/fantomes.wav"], check=True)
os.remove(raw)
print("audio ok")
