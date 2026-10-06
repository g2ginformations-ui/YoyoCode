# Bande-son de « Le parcours MyMotiv » (src/ParcoursSite.tsx, 31 s) : musique de l'utilisateur (public/audio/apres-midi-fond.mp3)
# étouffée sur le profil et la recherche, grand ouverte sur le flash d'arrivée sur le site (ses percussions, à 18,9 s du
# fichier, tombent dessus). La partie rythmée étant plus courte que la vidéo, on la prolonge par un raccord en boucle
# (point de reprise choisi automatiquement là où le rythme se ressemble le plus, fondu de 80 ms).
# Bruitages : traits du feutre, « whoosh » d'isolement des cases, frappe, clics, appui long, flashs ; ≈ -14 LUFS.
import os, subprocess, wave, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000; DUR = 31.0; N = int(SR*DUR); rng = np.random.default_rng(31)
T = dict(circle=0.3, linkLift=1.0, browser=1.5, type=1.95, search=2.85, flash1=3.35, cta=5.55, o2=6.6, n1=7.35, o1=8.35, n2=9.0,
         n3=10.4, file=11.55, n4=12.2, lire=14.4, rempli=15.45, n5=16.15, analyse=16.4, hold=19.55, note=20.35, gen=23.3,
         ecrit=23.6, lettre=24.9, flash2=28.0, end=28.1)
LIFTS = [3.85, 5.0, 6.1, 7.85, 9.4, 10.75, 11.6, 12.55, 14.95, 16.55, 18.75, 21.05, 22.0, 22.9, 23.75, 25.05]
DROP_SRC = 18.9

def decode(path, ch):
    out = subprocess.run([FF, "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(float).reshape(-1, ch)

# ── musique + raccord en boucle
src = decode("public/audio/apres-midi-fond.mp3", 2)
mono = src.mean(1); hop = 480
fr = np.lib.stride_tricks.sliding_window_view(mono, 2048)[::hop]
E = np.log1p(np.abs(np.fft.rfft(fr*np.hanning(2048), axis=1))[:, :200])
need_after = DUR - T["flash1"]                      # durée de musique rythmée à fournir
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
A = src[int((DROP_SRC - T["flash1"])*SR):int(J1*SR)]; B = src[int(J0*SR):]
xf = int(0.08*SR); ramp = np.linspace(0, 1, xf)[:, None]
music = np.concatenate([A[:-xf], A[-xf:]*(1 - ramp) + B[:xf]*ramp, B[xf:]])
m = np.zeros((N, 2)); m[:min(N, len(music))] = music[:N]
x = np.arange(N)/SR
muf = sosfilt(butter(2, 600, "lp", fs=SR, output="sos"), m, axis=0)
k = np.interp(x, [0, T["flash1"] - 0.01, T["flash1"], T["flash2"] - 0.6, T["flash2"] - 0.02, T["flash2"]], [0.15, 0.15, 1, 1, 0.3, 1])[:, None]
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

marker(T["circle"], 0.6, 0.12)
air(T["linkLift"], 0.4, 0.1); pop(T["linkLift"] + 0.1, 500, 1100, 0.1)
whoosh(T["browser"] - 0.05, 0.5, 0.16)
for i in range(23): click(T["type"] + i*0.022, 0.04)
pop(T["type"] + 0.55, 400, 1000, 0.1)
click(T["search"], 0.45); riser(T["search"], T["flash1"] - T["search"], 0.1)
boom(T["flash1"], 0.9); chime(T["flash1"] + 0.03, 0.05); whoosh(T["flash1"] + 0.02, 0.5, 0.14)
for a in LIFTS: whoosh(a - 0.03, 0.35, 0.07); pop(a + 0.3, 600, 1200, 0.06)
for c in (T["cta"], T["o2"], T["n1"], T["o1"], T["n2"], T["n3"], T["n4"], T["lire"], T["n5"], T["gen"], 11.0, 12.85, 15.2): click(c, 0.4); pop(c + 0.02, 700, 1300, 0.05)
for i in range(8): click(13.0 + i*0.11, 0.06)                              # le lien de l'offre se tape
pop(T["file"] - 0.1, 300, 700, 0.12)                                          # le CV tombe
for i in range(5): pop(16.8 + i*0.32, 800, 1500, 0.05)                        # étapes de l'analyse cochées
riser(T["hold"], 0.75, 0.1); boom(T["note"], 0.35); chime(T["note"] + 0.02, 0.06)
chime(21.3, 0.05)
for s in range(31): click(24.0 + s*(T["lettre"] - 24.0)/30, 0.035)            # chrono
chime(T["lettre"], 0.06); pop(25.5, 900, 1800, 0.12)
whoosh(T["flash2"] - 0.25, 0.4, 0.14); boom(T["flash2"], 0.8); chime(T["flash2"] + 0.05, 0.05)
for i in range(8): pop(T["end"] + i*0.04, 300 + i*60, 700 + i*90, 0.04)
chime(T["end"] + 1.0, 0.06); pop(T["end"] + 1.7, 500, 1100, 0.1)
sfx = np.stack([L, R], 1)

mix = m + sfx
mix[-int(0.5*SR):] *= np.linspace(1, 0, int(0.5*SR))[:, None]
mix /= np.max(np.abs(mix))*1.05
raw = "public/audio/parcours-site-brut.wav"
with wave.open(raw, "wb") as wf:
    wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((mix*32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89", "-ar", str(SR), "public/audio/parcours-site.wav"], check=True)
os.remove(raw)
print("audio ok")
