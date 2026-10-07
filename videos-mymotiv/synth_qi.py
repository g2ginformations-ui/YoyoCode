# Bande-son de « Top 5 QI » (src/TopQI.tsx) : voix NATURELLE de l'utilisateur (public/audio/qi-voix.wav, coupes explicites)
# + CHŒUR final « Avec MyMotiv, postulez. Et faites-vous recruter ! » : les 3 prises de l'utilisateur
# (public/audio/qi-choeur-source.m4a) + 4 voix d'hommes en synthèse hors ligne (public/audio/qi-choeur-tts/, une par génie,
# tools/voix-moqueries.py + src/data/choeur-qi.json), toutes recalées à la même durée, réparties gauche/droite, petite salle.
# Sorties : public/audio/qi.wav et src/data/qi-choeur.json (début, durée, coupure entre les deux moitiés, enveloppe 60 i/s
# pour faire sautiller les portraits en rythme).
# Musique de l'utilisateur (apres-midi-fond.mp3) : percussions (18,9 s du fichier) sur « Toi ! », coupée en roulement de
# tambour avant « numéro 1 », rouverte sur « Archimède » (cymbale). Bruitages UCS : DRUMROLL, CYMBAL, IMPACT, WHOOSH,
# POP, BELL, MAGIC/SPARKLE. Volume final ≈ -14 LUFS.
import json, os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter, fftconvolve
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(5)
VX = json.load(open("src/data/qi-voix.json")); P = VX["phrases"]
DUR = VX["duration"]; N = int(SR*DUR)
V = dict(intro=P[0]["t0"], n5=P[1]["t0"], flash=P[2]["t0"], parce=P[3]["t0"], n4=P[4]["t0"], n3=P[5]["t0"], newton=P[6]["t0"], n2=P[7]["t0"],
         vinci=P[8]["t0"], un=P[9]["t0"], archi=P[10]["t0"], cie=P[11]["t0"], offerte=P[12]["t0"], choeur=P[12]["t1"] + 0.4)
DROP_SRC = 18.9

# ── le chœur
CHAIN = "highpass=f=85,agate=threshold=0.015:ratio=4:attack=4:release=180:range=0.1,equalizer=f=300:t=q:w=1.2:g=-2,equalizer=f=4000:t=q:w=1.4:g=3.5,acompressor=threshold=-22dB:ratio=4:attack=5:release=100:makeup=3"
def load(path, a=None, b=None, af=None):
    cmd = [FF, "-v", "error", "-i", path] + (["-af", af] if af else []) + ["-ac", "1", "-ar", str(SR), "-f", "f32le", "-"]
    x = np.frombuffer(subprocess.run(cmd, capture_output=True, check=True).stdout, dtype=np.float32).astype(float)
    return x if a is None else x[int(a*SR):int(b*SR)]
def trim(x, thr=-40):
    h = 480; db = 20*np.log10(np.array([np.sqrt(np.mean(x[i:i+h]**2)) for i in range(0, len(x) - h, h)]) + 1e-9)
    on = np.where(db > thr)[0]; return x[max(0, on[0]*h - 2400):min(len(x), on[-1]*h + h + 4800)]
def stretch(x, L):   # ramène à la durée L (s) sans changer la hauteur
    tmp = "public/audio/_tmp.wav"; import scipy.io.wavfile as wf_; wf_.write(tmp, SR, (x/np.max(np.abs(x))*0.9*32767).astype(np.int16))
    y = load(tmp, af=f"atempo={len(x)/SR/L:.5f}"); os.remove(tmp); return y
takes = [trim(load("public/audio/qi-choeur-source.m4a", a, b, CHAIN)) for a, b in ((0.2, 3.85), (4.4, 8.15), (8.8, 12.55))]
LCH = float(np.median([len(t)/SR for t in takes]))
takes = [stretch(t, LCH) for t in takes]
tts = [stretch(trim(load(f"public/audio/qi-choeur-tts/{n}.wav")), LCH) for n in ("galilee", "newton", "vinci", "archimede")]
n = int(LCH*SR) + int(0.6*SR); CL = np.zeros(n); CR = np.zeros(n)
def put(s, d, g, pan):
    i = int(d*SR); s = s[:n - i]; s = s/max(1e-9, np.sqrt(np.mean(s[np.abs(s) > 0.02]**2)))*0.1
    CL[i:i+len(s)] += s*g*(1 - max(0, pan)); CR[i:i+len(s)] += s*g*(1 + min(0, pan))
for s, d, pan in zip(takes, (0.0, 0.018, 0.03), (0.0, -0.45, 0.45)): put(s, d, 1.0, pan)
for s, d, pan in zip(tts, (0.01, 0.025, 0.012, 0.035), (-0.8, -0.3, 0.3, 0.8)): put(s, d, 0.42, pan)
irn = int(0.9*SR); ir = rng.standard_normal(irn)*np.exp(-np.arange(irn)/SR/0.18); ir /= np.sqrt(np.sum(ir**2))
CL = CL + fftconvolve(CL, ir)[:n]*0.18; CR = CR + fftconvolve(CR, ir)[:n]*0.18
CH = (CL + CR)/2
env = np.array([np.sqrt(np.mean(CH[int(i*SR/60):int((i + 1)*SR/60)]**2)) for i in range(int(len(CH)/SR*60))]); env = env/np.max(env)
sm = np.convolve(env, np.ones(9)/9, "same"); mid = slice(int(len(sm)*0.35), int(len(sm)*0.7))
split = (mid.start + int(np.argmin(sm[mid])))/60
json.dump({"t0": round(V["choeur"], 3), "dur": round(LCH, 3), "split": round(split, 3), "env": [round(float(v), 3) for v in env]}, open("src/data/qi-choeur.json", "w"))
print(f"chœur : {LCH:.2f} s, coupure {split:.2f} s")

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
k = np.interp(x, [0, V["flash"] - 0.01, V["flash"], V["un"] - 0.2, V["un"], V["archi"] - 0.02, V["archi"], DUR], [0.2, 0.3, 1, 1, 0.15, 0.15, 1, 1])[:, None]
m = muf*(1 - k)*1.3 + m*k

m *= np.clip(x/0.15, 0, 1)[:, None]*np.clip((DUR - x)/2.2, 0, 1)[:, None]
voice = decode("public/audio/qi-voix.wav", 1)[:, 0]; vv = np.zeros(N); vv[:min(N, len(voice))] = voice[:N]
vv[int(V["choeur"]*SR):int(V["choeur"]*SR) + len(CH)] += CH[:N - int(V["choeur"]*SR)]
# CANETTE=1 : variante « FantomesCanette » — la phrase « Moins cher qu'un café » est coupée (fondus de 30 ms),
# un « pschitt » de canette qu'on ouvre la remplace (voir plus bas).
CANETTE = os.environ.get("CANETTE") == "1"
if CANETTE:
    a_, b_ = int((P[10]["t0"] - 0.04)*SR), int((P[10]["t1"] + 0.06)*SR); f_ = int(0.03*SR)
    vv[a_:a_+f_] *= np.linspace(1, 0, f_); vv[a_+f_:b_-f_] = 0; vv[b_-f_:b_] *= np.linspace(0, 1, f_)
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
# WHOOSH : sons réels (public/sfx, FILM CRUX) ; le pic du son tombe au milieu du mouvement (at + d/2)
import sys; sys.path.insert(0, "tools"); from sfx_lib import Whooshes
W = Whooshes(SR)
def whoosh(at, d=0.45, g=0.12): W.place(add, at + d*0.5, "Court" if d < 0.42 else ("MoyenClair" if g < 0.12 else "MoyenSourd"), g*1.6, max_len=2.2)
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




def drumroll(at, d, g=0.2):   # DRUMROLL : roulement de caisse claire qui s'accélère et monte
    t_, i = 0.0, 0
    while t_ < d:
        k_ = t_/d; add(HP(noise(0.03), 1500)*env(int(0.03*SR), 0.0005, 0.012)*(0.4 + 0.6*k_), at + t_, g, 0.15*(-1)**i)
        t_ += 0.055 - 0.03*k_; i += 1
def cymbal(at, g=0.25): add(HP(noise(2.2), 4000)*env(int(2.2*SR), 0.002, 0.7), at, g); add(HP(noise(2.2), 7000)*env(int(2.2*SR), 0.001, 0.4), at, g*0.6, 0.3)
def flip(at): W.place(add, at, "Court", 0.2); add(LP(noise(0.06), 900)*env(int(0.06*SR), 0.001, 0.02), at + 0.05, 0.25)

# 0. intro : roulement léger + titre
drumroll(V["intro"] + 2.3, 1.6, 0.08); pop(V["intro"] + 0.1, 300, 800, 0.12); boom(V["intro"] + 3.9, 0.3)
# 1. numéro 5 : toi
flip(V["n5"]); riser(V["n5"] + 0.3, V["flash"] - V["n5"] - 0.3, 0.08)
boom(V["flash"], 0.7); W.place(add, V["flash"], "Long", 0.3); chime(V["flash"] + 0.05, 0.07); sparkle(V["flash"] + 0.05, 0.05)
pop(V["parce"] + 0.9, 500, 1300, 0.1)
# 2. numéros 4, 3, 2
for kk in ("n4", "n3", "n2"): flip(V[kk]); boom(V[kk] + 0.08, 0.3)
for kk, dt in (("n4", 0.9), ("newton", 0.05), ("vinci", 0.05)): chime(V[kk] + dt, 0.05); pop(V[kk] + dt, 700, 1500, 0.1)
add(sweep(1200, 400, 0.5)*env(int(0.5*SR), 0.003, 0.25), V["newton"] + 0.45, 0.05)   # la pomme qui tombe
pop(V["newton"] + 0.95, 260, 120, 0.2)
# 3. numéro 1 : roulement, cymbale sur Archimède
flip(V["un"]); drumroll(V["un"] + 0.1, V["archi"] - V["un"] - 0.1, 0.22)
boom(V["archi"], 0.8); cymbal(V["archi"], 0.28); W.place(add, V["archi"], "Long", 0.3); sparkle(V["archi"] + 0.1, 0.06)
# 4. bonne compagnie, offerte
W.place(add, V["cie"], "MoyenClair", 0.2); pop(V["cie"] + 0.2, 500, 1200, 0.12)
W.place(add, V["offerte"], "MoyenSourd", 0.2); chime(V["offerte"] + 0.6, 0.06); sparkle(V["offerte"] + 0.6, 0.04)
for i in range(14): pop(V["offerte"] + 0.62 + i*0.03, rng.uniform(900, 1600), rng.uniform(1600, 2600), 0.03)
# 5. le chœur : les génies se rassemblent
W.place(add, V["choeur"] - 0.15, "Long", 0.25); boom(V["choeur"] - 0.05, 0.4)
for i in range(4): pop(V["choeur"] - 0.35 + i*0.07, 400 + i*120, 900 + i*200, 0.08, (-0.6, -0.2, 0.2, 0.6)[i])
cymbal(V["choeur"] + LCH - 0.1, 0.18); chime(V["choeur"] + LCH, 0.07); sparkle(V["choeur"] + LCH, 0.05)
sfx = np.stack([L, R], 1)*rms(vv[np.abs(vv) > 0.01])/0.05*0.05

mix = np.stack([vv, vv], 1) + m + sfx
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/qi-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR), "public/audio/qi.wav"], check=True)
os.remove(raw)
print("audio ok")
