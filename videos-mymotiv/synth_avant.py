# Bande-son de « Avant / Aujourd'hui » (src/AvantAujourdhui.tsx) : voix NATURELLE de l'utilisateur
# (public/audio/avant-voix.wav) devant ; musique de l'utilisateur (apres-midi-fond.mp3) dessous : pendant les passages
# « Avant » (vieux film) elle sonne comme un vieux disque (passe-bande, crépitement, ronronnement de projecteur), puis
# s'ouvre ; ses percussions (18,9 s du fichier) tombent sur « MyMotiv » ; raccord en boucle calé sur le rythme ; ducking.
# Whooshes réels (public/sfx, tools/sfx_lib.py) ; autres bruitages fabriqués ici, nommés selon les catégories UCS :
# FILM PROJECTOR, VINYL CRACKLE, CAMERA SHUTTER, UI CLICK, POP, IMPACT, BELL, MAGIC/SPARKLE. Volume final ≈ -14 LUFS.
import json, os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; rng = np.random.default_rng(37)
VX = json.load(open("src/data/avant-voix.json")); P = VX["phrases"]
DUR = VX["duration"]; N = int(SR*DUR)
def mot(w, ph): return next((m["t0"] for m in VX["mots"] if m["phrase"] == ph and m["w"].lower().startswith(w)), P[ph]["t0"])
# mêmes temps clés que src/AvantAujourdhui.tsx
V = dict(photo=0.25, film1=P[1]["t0"], burst=P[1]["t0"] + 0.75, parfaite=mot("parfaite", 1), avant2=P[2]["t0"], mais=P[3]["t0"], top=mot("top.", 3),
         recr=P[4]["t0"], lettre=P[5]["t0"], voit=mot("voit", 5), madame=P[6]["t0"], cree=P[7]["t0"], flash=mot("émotive", 7), ref=P[8]["t0"],
         pour=P[9]["t0"], ia=P[10]["t0"], ecrit=P[11]["t0"], s30=mot("30", 11), top2=P[12]["t0"], offerte=P[13]["t0"], offerteMot=mot("offerte", 13),
         fin=P[14]["t0"], bio=P[15]["t0"])
V["gen"] = V["ecrit"] + 0.2; V["ring1"] = V["s30"] + 0.45
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
k = np.interp(x, [0, V["film1"] - 0.05, V["film1"] + 0.1, V["avant2"] - 0.1, V["avant2"], V["mais"], V["mais"] + 0.1, V["flash"] - 0.01, V["flash"], DUR], [0.0, 0.0, 0.3, 0.3, 0.0, 0.0, 0.3, 0.35, 1, 1])[:, None]
m = muf*(1 - k)*1.3 + m*k

# ── « vieux film » : la musique passe par un vieux haut-parleur (passe-bande), + crépitement et projecteur
FILM = np.interp(x, [0, V["film1"] - 0.15, V["film1"] + 0.1, V["avant2"] - 0.2, V["avant2"], V["mais"] - 0.2, V["mais"] + 0.05], [1, 1, 0, 0, 1, 1, 0])
old = sosfilt(butter(2, [300, 2600], "bp", fs=SR, output="sos"), m, axis=0)*1.8
m = m*(1 - FILM[:, None]) + old*FILM[:, None]

m *= np.clip(x/0.15, 0, 1)[:, None]*np.clip((DUR - x)/2.2, 0, 1)[:, None]
voice = decode("public/audio/avant-voix.wav", 1)[:, 0]; vv = np.zeros(N); vv[:min(N, len(voice))] = voice[:N]
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


# FILM PROJECTOR : cliquetis à 24 i/s + souffle ; VINYL CRACKLE : craquements aléatoires
proj = np.zeros(N)
for i in range(int(DUR*24)): proj[int(i*SR/24):int(i*SR/24) + 60] += rng.uniform(0.4, 1)*np.exp(-np.arange(60)/12)
proj = sosfilt(butter(2, [900, 4000], "bp", fs=SR, output="sos"), proj)*0.5 + LP(rng.standard_normal(N), 900)*0.02
crack = np.zeros(N); idx = rng.integers(0, N - 40, int(DUR*30)); crack[idx] = rng.uniform(-1, 1, len(idx))
crack = HP(crack, 1500)*0.5
add((proj + crack)*FILM, 0, 0.16)
def shutter(at, g=0.3):   # CAMERA SHUTTER : deux clacs mécaniques rapprochés
    for d, gg in ((0, 1), (0.055, 0.7)): add(sosfilt(butter(2, [1500, 7000], "bp", fs=SR, output="sos"), noise(0.03))*env(int(0.03*SR), 0.0005, 0.006), at + d, g*gg)
    add(LP(noise(0.05), 600)*env(int(0.05*SR), 0.001, 0.01), at, g*0.4)

# 0. photo qui tombe (vieux film)
whoosh(0.0, 0.5, 0.1); add(LP(noise(0.08), 700)*env(int(0.08*SR), 0.001, 0.02), V["photo"] + 0.48, 0.25)
# 1. Aujourd'hui : brûlure du film, rafale de photos, « parfaite »
W.place(add, V["film1"], "MoyenClair", 0.25); chime(V["film1"] + 0.05, 0.03)
for i in range(5): shutter(V["burst"] + i*0.2, 0.32)
chime(V["parfaite"], 0.06); sparkle(V["parfaite"] + 0.05, 0.04); pop(V["parfaite"], 500, 1200, 0.12)
# 2. Avant, de peu (retour du film) : la photo rapetisse
W.place(add, V["avant2"], "Court", 0.18); pop(V["avant2"] + 0.5, 700, 300, 0.08)
# 3. le top du top : 3 barres qui montent, étoile
W.place(add, V["mais"] + 0.1, "MoyenClair", 0.22)
for i in range(3): add(sweep(300 + i*120, 900 + i*200, 0.35)*env(int(0.35*SR), 0.01, 0.2), V["mais"] + 0.25 + i*0.12, 0.05)
pop(V["top"] - 0.1, 600, 1600, 0.14); sparkle(V["top"], 0.05); chime(V["top"] + 0.02, 0.05)
# 4. recruteur
whoosh(V["recr"] - 0.1, 0.4, 0.12); pop(V["recr"] + 0.15, 400, 900, 0.1)
# 5. copier-coller
whoosh(V["lettre"] - 0.15, 0.4, 0.12); click(V["lettre"] + 0.3, 0.5)
for i in range(4): click(V["lettre"] + 0.55 + i*0.16, 0.3); pop(V["lettre"] + 0.56 + i*0.16, 500, 900, 0.06)
add(sweep(400, 180, 0.4)*env(int(0.4*SR), 0.01, 0.2), V["voit"], 0.06)
# 6. Madame, Monsieur : zoom lent, puis les lettres tombent
air(V["madame"] - 0.1, 0.8, 0.05); W.place(add, V["cree"], "MoyenSourd", 0.2)
# 7. MyMotiv : montée, impact, reflet sur le logo
riser(V["cree"] + 0.2, V["flash"] - V["cree"] - 0.2, 0.1); boom(V["flash"], 0.7); W.place(add, V["flash"], "Long", 0.35); chime(V["flash"] + 0.05, 0.07); sparkle(V["flash"] + 0.1, 0.04)
# 8. La référence / orbite / meilleure IA
pop(V["ref"] + 0.05, 300, 700, 0.14); W.place(add, V["pour"] + 0.3, "MoyenClair", 0.18)
for i in range(3): pop(V["pour"] + 0.15 + i*0.08, 700 + i*150, 1300 + i*200, 0.06)
riser(V["ia"] + 0.1, 1.1, 0.07); sparkle(V["ia"] + 0.3, 0.05); add(sweep(1800, 300, 0.4)*env(int(0.4*SR), 0.005, 0.2), V["ia"] + 1.0, 0.06); pop(V["ia"] + 1.25, 900, 300, 0.12)
# 9. Générer → anneau 30 s → lettre
whoosh(V["ecrit"] - 0.1, 0.4, 0.12); click(V["gen"], 0.55); pop(V["gen"] + 0.02, 700, 1400, 0.12)
n_ = 30
for s_ in range(n_): click(V["gen"] + 0.1 + s_*(V["ring1"] - V["gen"] - 0.1)/n_, 0.04)
chime(V["ring1"], 0.07); pop(V["s30"] + 0.35, 500, 1300, 0.12)
# 10. top du top, offerte
W.place(add, V["top2"] - 0.2, "MoyenClair", 0.22); pop(V["top2"] + 0.25, 900, 1800, 0.14); chime(V["top2"] + 0.3, 0.05)
whoosh(V["offerte"] - 0.1, 0.4, 0.12); chime(V["offerteMot"], 0.07); sparkle(V["offerteMot"], 0.04)
for i in range(14): pop(V["offerteMot"] + 0.02 + i*0.03, rng.uniform(900, 1600), rng.uniform(1600, 2600), 0.03)
# 11. fin
W.place(add, V["fin"], "MoyenSourd", 0.2); add(sweep(500, 1500, 1.2)*np.sin(np.linspace(0, np.pi, int(1.2*SR)))**2, V["fin"] + 0.5, 0.02)
pop(V["bio"], 500, 1100, 0.14); W.place(add, V["bio"] + 0.6, "Long", 0.2); chime(V["bio"] + 0.8, 0.05)
sfx = np.stack([L, R], 1)*rms(vv[np.abs(vv) > 0.01])/0.05*0.05

mix = np.stack([vv, vv], 1) + m + sfx
mix[-int(0.4*SR):] *= np.linspace(1, 0, int(0.4*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/avant-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR), "public/audio/avant.wav"], check=True)
os.remove(raw)
print("audio ok")
