# Voix off « narrateur grave » à partir d'un enregistrement de l'utilisateur (sa propre voix) :
#  1. traitement : débruitage, -3 demi-tons avec timbre préservé (rubberband), graves chauds, présence, brillance,
#     dé-esseur, compression serrée (voix « dans l'oreille ») ;
#  2. montage : découpe en phrases (d'après la transcription Whisper), pauses dramatiques choisies, intro sans voix,
#     trou volontaire pour une séquence visuelle (prix) ; longues pauses internes raccourcies ;
#  3. réverbération discrète (plus marquée sur « Respire ») ;
#  4. sorties : public/audio/<nom>-voix.wav (48 kHz mono) + src/data/<nom>-voix.json (phrases et mots recalés).
# Usage : python3 tools/voix-narrateur.py <enregistrement> <transcription.json (Whisper, chunks)> <nom>
import json, subprocess, sys, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000
src, trans, nom = sys.argv[1:4]
CHAIN = ",".join(["highpass=f=70", "afftdn=nf=-30", "rubberband=tempo=1.06:pitch=0.841:formant=preserved:pitchq=quality",
                  "bass=g=3:f=110", "equalizer=f=320:t=q:w=1.2:g=-2.5", "equalizer=f=3500:t=q:w=1.2:g=3", "treble=g=4:f=9000",
                  "deesser=i=0.4", "acompressor=threshold=-24dB:ratio=4:attack=4:release=90:makeup=3"])
raw = subprocess.run([FF, "-v", "error", "-i", src, "-af", CHAIN, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32).astype(float)
TEMPO = 1.06   # les temps de la transcription (enregistrement d'origine) sont divisés par ce facteur
words = [(c["text"].strip(), c["timestamp"][0]/TEMPO, c["timestamp"][1]/TEMPO) for c in json.load(open(trans))["chunks"]]

# phrases : (premier mot, dernier mot, texte affiché, pause après en s)
PREROLL = 2.7
PHRASES = [
    (0, 12, "3 lettres de motivation en 3 heures, et toujours seul devant ton écran.", 0.4),
    (13, 34, "Même avec un chatbot IA, tu passes 20 minutes par lettre pour un texte générique, sans le logo de l'entreprise.", 0.5),
    (35, 35, "Respire.", 0.7),
    (36, 41, "Avec MyMotiv, c'est 5 clics.", 0.35),
    (42, 53, "Ton CV, le lien de l'offre, la longueur, tes options, Générer.", 0.4),
    (54, 70, "En 30 secondes, ta lettre est écrite pour cette offre, avec le logo de l'entreprise dessus.", 0.35),
    (71, 80, "Un détail à changer ? Plus court ? Plus long ? Un clic.", 0.35),
    (81, 85, "Ta première lettre est offerte,", 3.7),       # trou : séquence des prix
    (86, 90, "le lien est en bio,", 0.25),
    (91, 93, "postule et respire.", 2.4),                  # fin : écran de fin
]
INNER_MAX = 0.25

hop = int(0.01*SR)
env = np.array([np.sqrt(np.mean(x[i:i+hop]**2)) for i in range(0, len(x) - hop, hop)])
db = 20*np.log10(np.convolve(env, np.ones(3)/3, "same") + 1e-9)
thr = np.percentile(db, 95) - 40
speech = db > thr
def tidx(t): return int(np.clip(t*100, 0, len(db) - 1))
# frontières entre phrases : minimum d'énergie entre la fin de la phrase et le début de la suivante
bounds = [max(0.0, words[PHRASES[0][0]][1] - 0.35)]
for (a, b, _, _), (c, _, _, _) in zip(PHRASES, PHRASES[1:]):
    lo, hi = tidx(words[b][1] + 0.12), tidx(words[c][1] + 0.02)
    if hi <= lo: hi = lo + 1
    bounds.append((lo + int(np.argmin(db[lo:hi])))/100)
bounds.append(len(x)/SR)

fade = int(0.012*SR); pieces = [np.zeros(int(PREROLL*SR))]; t_new = PREROLL; tmap = []; phr = []
for i, (a, b, text, pause) in enumerate(PHRASES):
    s0, s1 = tidx(bounds[i]), tidx(bounds[i+1])
    on = np.where(speech[s0:s1])[0]
    if not len(on): continue
    p0, p1 = (s0 + on[0])/100 - 0.1, (s0 + on[-1])/100 + 0.18
    # segments parlés de la phrase, pauses internes raccourcies
    sp = speech[tidx(p0):tidx(p1)].copy(); k = 10
    for j in np.where(sp)[0]: sp[max(0, j-k):j+k+1] = True
    segs = []; j = 0
    while j < len(sp):
        if sp[j]:
            e = j
            while e < len(sp) and sp[e]: e += 1
            segs.append([p0 + j/100, p0 + e/100]); j = e
        else: j += 1
    t_ph0 = t_new
    for si, (u, v) in enumerate(segs):
        seg = x[int(u*SR):int(v*SR)].copy()
        if len(seg) > 2*fade: seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        tmap.append((u, v, t_new)); pieces.append(seg); t_new += len(seg)/SR
        if si + 1 < len(segs):
            g = min(segs[si+1][0] - v, INNER_MAX); pieces.append(np.zeros(int(g*SR))); t_new += g
    phr.append({"text": text, "t0": round(t_ph0, 3), "t1": round(t_new, 3)})
    pieces.append(np.zeros(int(pause*SR))); t_new += pause
y = np.concatenate(pieces)

def remap(t):
    best = None
    for u, v, n0 in tmap:
        if u - 0.15 <= t <= v + 0.15: return round(n0 + min(max(t - u, 0), v - u), 3)
        if t < u and best is None: best = n0
    return round(best if best is not None else t_new, 3)
mots = []
for i, (a, b, text, _) in enumerate(PHRASES):
    for wi in range(a, b + 1):
        mots.append({"w": words[wi][0], "i": wi, "phrase": i, "t0": remap(words[wi][1])})

# réverbération : petite plaque partout, plus large sur les deux « Respire »
rng = np.random.default_rng(3)
def ir(d, tau):
    n = int(d*SR); r = rng.standard_normal(n)*np.exp(-np.arange(n)/SR/tau)
    r = sosfilt(butter(2, [200, 6000], "bp", fs=SR, output="sos"), r); return r/np.sqrt(np.sum(r**2))
wet = fftconvolve(y, ir(1.0, 0.18))[:len(y)]*0.10
send = np.zeros_like(y)
for p in (phr[2], phr[-1]):
    a, b = int(p["t0"]*SR), int(p["t1"]*SR); send[a:b] = y[a:b]
wet += fftconvolve(send, ir(2.6, 0.55))[:len(y)]*0.30
y = y + wet
y /= np.max(np.abs(y))*1.12
import scipy.io.wavfile as wf
wf.write(f"public/audio/{nom}-voix.wav", SR, (y*32767).astype(np.int16))
json.dump({"duration": round(len(y)/SR, 3), "preroll": PREROLL, "phrases": phr, "mots": mots}, open(f"src/data/{nom}-voix.json", "w"), ensure_ascii=False, indent=1)
print(round(len(y)/SR, 2))
for p in phr: print(p["t0"], p["t1"], p["text"])
