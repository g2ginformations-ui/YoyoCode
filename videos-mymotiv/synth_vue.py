# Bande-son de « 0 vue » (src/ZeroVue.tsx) : voix NATURELLE de l'utilisateur (public/audio/vue-voix.wav) devant ;
# voix moqueuses de fond (public/audio/vue-moqueries/, tools/voix-moqueries.py) placées aux mêmes temps que MOQ dans
# ZeroVue.tsx, panoramiques gauche/droite, petite salle ; musique de l'utilisateur (apres-midi-fond.mp3) étouffée pendant
# le « problème », coupée sur l'arrêt sur image, puis grande ouverte sur « MyMotiv » (percussions à 18,9 s du fichier).
# Whooshes réels (public/sfx, tools/sfx_lib.py) ; bruitages fabriqués ici, nommés selon les catégories UCS : RECORD SCRATCH,
# TAPE REWIND, NOTIFICATION, WHISTLE, IMPACT (tampon), GLITCH, UI CLICK, POP, BELL, MAGIC/SPARKLE. Volume final ≈ -14 LUFS.
import json, os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter, fftconvolve
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(0)
VX = json.load(open("src/data/vue-voix.json")); P = VX["phrases"]
DUR = VX["duration"]; N = int(SR*DUR)
def mot(w, ph): return next((m["t0"] for m in VX["mots"] if m["phrase"] == ph and m["w"].lower().startswith(w)), P[ph]["t0"])
# mêmes temps clés que src/ZeroVue.tsx
V = dict(freeze=0.85, rewind=1.25, rewEnd=1.8, hook=P[0]["t0"], post=P[1]["t0"], zero=mot("zéro", 1), vu=P[2]["t0"], sans=P[3]["t0"],
         foot=P[4]["t0"], toi=mot("toi", 4), cand=P[5]["t0"], s0=P[6]["t0"], s1=P[7]["t0"], s2=P[8]["t0"], sauf=P[9]["t0"], flash=mot("émotive", 9),
         simple=P[10]["t0"], tout=mot("tout", 11), rapide=P[12]["t0"], s30=mot("30", 13), efficace=P[14]["t0"], cette=mot("cette", 15),
         ref=P[16]["t0"], refMot=mot("référence", 16), offerte=P[17]["t0"], offerteMot=mot("offerte", 17), bio=P[18]["t0"])
MOQ = [("zero1", P[1]["t1"] + 0.05, -0.6), ("zero2", P[1]["t1"] + 0.4, 0.6), ("zero3", P[1]["t0"] + 1.1, 0.5), ("vu2", P[3]["t1"] + 0.05, -0.4),
       ("foot1", P[4]["t0"] + 0.55, -0.7), ("foot2", P[4]["t0"] + 1.05, 0.7), ("foot4", P[4]["t0"] + 1.6, -0.5), ("foot3", P[4]["t1"] + 0.05, 0.4)]
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
k = np.interp(x, [0, V["freeze"] - 0.01, V["freeze"], V["rewEnd"], V["rewEnd"] + 0.05, V["s2"] + 0.8, V["sauf"], V["flash"] - 0.01, V["flash"], DUR], [0.25, 0.25, 0.0, 0.0, 0.25, 0.25, 0.05, 0.3, 1, 1])[:, None]
m = muf*(1 - k)*1.3 + m*k

m *= np.clip(x/0.15, 0, 1)[:, None]*np.clip((DUR - x)/2.2, 0, 1)[:, None]
voice = decode("public/audio/vue-voix.wav", 1)[:, 0]; vv = np.zeros(N); vv[:min(N, len(voice))] = voice[:N]
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


# ── voix moqueuses : petite salle, filtrées (foule), sous la voix principale
from scipy.io import wavfile
irn = int(0.5*SR); ir = rng.standard_normal(irn)*np.exp(-np.arange(irn)/SR/0.08); ir /= np.sqrt(np.sum(ir**2))
for mid, at, pan in MOQ:
    _, mq = wavfile.read(f"public/audio/vue-moqueries/{mid}.wav"); mq = mq.astype(float)/32768
    mq = sosfilt(butter(2, [250, 5000], "bp", fs=SR, output="sos"), mq); mq = mq + fftconvolve(mq, ir)[:len(mq)]*0.35
    g = 0.5 if mid in ("foot3", "zero1") else 0.38
    add(mq*0.05/max(1e-9, rms(mq)), at, g, pan)

def scratch(at, g=0.4):   # RECORD SCRATCH : glissando aller-retour
    d = 0.32; n = int(d*SR); tt = np.arange(n)/SR
    f = 600 + 2200*np.abs(np.sin(2*np.pi*3.1*tt)); ph = np.cumsum(f)/SR
    s = np.sin(2*np.pi*ph)*0.4 + sosfilt(butter(2, [800, 5000], "bp", fs=SR, output="sos"), noise(d))
    add(s*np.sin(np.linspace(0, np.pi, n))**0.5, at, g)
def rewind(at, d, g=0.25):   # TAPE REWIND : gazouillis accéléré qui monte
    n = int(d*SR); tt = np.arange(n)/SR; f = np.geomspace(300, 2400, n)*(1 + 0.3*np.sin(2*np.pi*23*tt))
    s = np.sin(2*np.pi*np.cumsum(f)/SR)*0.5 + HP(noise(d), 2000)*0.4; add(s*np.sin(np.linspace(0, np.pi, n)), at, g)
def notif(at, g=0.12):       # NOTIFICATION : deux notes cristallines
    add(tone(1568, 0.5, 0.003, 0.15), at, g); add(tone(2093, 0.6, 0.003, 0.2), at + 0.09, g)
def whistle(at, d=0.5, g=0.12):  # WHISTLE : sifflet d'arbitre (roulé)
    n = int(d*SR); tt = np.arange(n)/SR; s = np.sin(2*np.pi*(2900 + 60*np.sin(2*np.pi*30*tt))*tt)*(0.6 + 0.4*np.sin(2*np.pi*30*tt))
    add(s*np.minimum(1, tt/0.02)*np.minimum(1, (d - tt)/0.05), at, g)
def stampfx(at, g=0.5): add(LP(noise(0.12), 700)*env(int(0.12*SR), 0.001, 0.03), at, g); add(sweep(160, 50, 0.25)*env(int(0.25*SR), 0.002, 0.08), at, g*0.8)

# 0. hook : la candidature tombe, vole vers la poubelle, STOP, rembobinage, sauvée
pop(0.22, 300, 700, 0.12); whoosh(0.35, 0.5, 0.14)
scratch(V["freeze"] - 0.04, 0.45); boom(V["freeze"], 0.25)
rewind(V["rewind"], V["rewEnd"] - V["rewind"], 0.28); chime(V["rewEnd"], 0.07); sparkle(V["rewEnd"] + 0.05, 0.04)
# 1. 0 vue
whoosh(V["post"] - 0.15, 0.4, 0.12); pop(V["post"] + 0.1, 400, 900, 0.1)
add(sweep(500, 180, 0.35)*env(int(0.35*SR), 0.005, 0.15), V["zero"] + 0.05, 0.1)
# 2. message en Vu
whoosh(V["vu"] - 0.15, 0.4, 0.12); add(sweep(400, 1400, 0.18)*env(int(0.18*SR), 0.003, 0.08), V["vu"] + 0.05, 0.08)
notif(V["vu"] + 0.6, 0.08)
for i in range(6): click(V["vu"] + 1.05 + i*0.12, 0.05)
add(sweep(900, 250, 0.3)*env(int(0.3*SR), 0.003, 0.12), V["sans"] + 0.05, 0.1)
# 3. dernier choisi au foot : sifflet, choix gauche/droite
whoosh(V["foot"] - 0.15, 0.4, 0.12); whistle(V["foot"] + 0.15, 0.45, 0.07)
for k in range(6): pop(V["foot"] + 0.5 + k*0.28, 500, 1100, 0.08, -0.6 if k % 2 == 0 else 0.6)
air(V["toi"] - 0.5, 0.9, 0.06)
# 4. tes candidatures : tampons
whoosh(V["cand"] - 0.1, 0.45, 0.13); pop(V["cand"] + 0.15, 300, 800, 0.12)
for s in ("s0", "s1", "s2"): stampfx(V[s] + 0.1, 0.5); glitch(V[s] + 0.12, 0.12, 0.05)
# 5. Sauf avec MyMotiv : montée, lumière, impact
W.place(add, V["sauf"] + 0.2, "MoyenSourd", 0.25); riser(V["sauf"] + 0.1, V["flash"] - V["sauf"] - 0.1, 0.1)
boom(V["flash"], 0.75); W.place(add, V["flash"], "Long", 0.35); chime(V["flash"] + 0.05, 0.07); sparkle(V["flash"] + 0.1, 0.04)
# 6. Simple / Rapide / Efficace
for s in ("simple", "rapide", "efficace"): pop(V[s], 500, 1300, 0.14); W.place(add, V[s] + 0.05, "Court", 0.14)
pop(V["simple"] + 0.5, 600, 1200, 0.08, -0.4); pop(V["simple"] + 1.05, 600, 1200, 0.08, 0.4)
add(sweep(1500, 200, 0.35)*env(int(0.35*SR), 0.003, 0.15), V["tout"] - 0.3, 0.07); boom(V["tout"] + 0.05, 0.25); chime(V["tout"] + 0.08, 0.05)
r0, r1 = V["s30"] - 0.9, V["s30"] + 0.6
for k in range(30): click(r0 + k*(r1 - r0)/30, 0.04)
chime(r1, 0.07)
W.place(add, V["efficace"] + 0.25, "MoyenClair", 0.18); pop(V["cette"] + 0.4, 900, 1800, 0.14); sparkle(V["cette"] + 0.45, 0.04)
# 7. la référence, offerte, fin
W.place(add, V["ref"], "MoyenSourd", 0.2); boom(V["refMot"], 0.35); chime(V["refMot"] + 0.05, 0.06)
whoosh(V["offerte"] - 0.1, 0.4, 0.12); chime(V["offerteMot"], 0.07); sparkle(V["offerteMot"], 0.04)
for i in range(14): pop(V["offerteMot"] + 0.02 + i*0.03, rng.uniform(900, 1600), rng.uniform(1600, 2600), 0.03)
pop(V["bio"], 500, 1100, 0.14); W.place(add, V["bio"] + 0.5, "Long", 0.2); chime(V["bio"] + 0.7, 0.05)
sfx = np.stack([L, R], 1)*rms(vv[np.abs(vv) > 0.01])/0.05*0.05

mix = np.stack([vv, vv], 1) + m + sfx
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/vue-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR), "public/audio/vue.wav"], check=True)
os.remove(raw)
print("audio ok")
