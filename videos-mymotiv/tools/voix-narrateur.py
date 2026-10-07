# Voix off « narrateur grave » à partir d'un enregistrement de l'utilisateur (sa propre voix) :
#  1. traitement : débruitage, -3 demi-tons avec timbre préservé (rubberband), graves chauds, présence, brillance,
#     dé-esseur, compression serrée (voix « dans l'oreille ») ;
#  2. montage : découpe en phrases (d'après la transcription Whisper), pauses dramatiques choisies, intro sans voix,
#     trou volontaire pour une séquence visuelle (prix) ; longues pauses internes raccourcies ;
#  3. réverbération discrète (plus marquée sur « Respire ») ;
#  4. sorties : public/audio/<nom>-voix.wav (48 kHz mono) + src/data/<nom>-voix.json (phrases et mots recalés).
# Usage : python3 tools/voix-narrateur.py <enregistrement> <transcription.json (Whisper, chunks)> <nom> [config.json]
#   config.json (facultatif) : {"preroll", "tempo", "pitch", "thr_db", "inner_max", "reverb": [indices de phrases],
#     "phrases": [[premier mot, dernier mot, texte, pause], …],
#     "natural": true → voix naturelle (ni hauteur ni vitesse changées), traitement « voix off pro » : coupe-bas, porte de
#        bruit, EQ (moins de boue, +présence 3-5 kHz), compresseur, dé-esseur après le compresseur ;
#     "stutter": {"phrase": i, "dur": 0.11, "n": 2} → bégaiement « glitch » du début de la phrase i ;
#     "effects": [{"type": "telephone"|"chorus"|"ghost"|"delay", "phrase": i, "last": s}] → effets créatifs sur une phrase
#        (ou ses « last » dernières secondes) : téléphone (passe-bande), chorus (pensée intérieure), fantôme (copie très
#        grave + grande réverbération), écho (delay) qui résonne après le dernier mot ;
#     "src": [[début, fin], …] → coupes explicites dans l'enregistrement, une par phrase (au lieu de la recherche
#        automatique d'après Whisper, dont les horodatages peuvent dériver d'une seconde ou plus).}
import json, subprocess, sys, imageio_ffmpeg
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000
src, trans, nom = sys.argv[1:4]
CFG = json.load(open(sys.argv[4])) if len(sys.argv) > 4 else {}
NATURAL = CFG.get("natural", False)
CHAIN = ",".join(["highpass=f=85", "agate=threshold=0.015:ratio=4:attack=4:release=180:range=0.1", "equalizer=f=300:t=q:w=1.2:g=-2",
                  "equalizer=f=4000:t=q:w=1.4:g=3.5", "acompressor=threshold=-22dB:ratio=4:attack=5:release=100:makeup=3",
                  "deesser=i=0.5:m=0.5:f=0.55"]) if NATURAL else ",".join(["highpass=f=70", "afftdn=nf=-30", f"rubberband=tempo={CFG.get('tempo', 1.06)}:pitch={CFG.get('pitch', 0.841)}:formant=preserved:pitchq=quality",
                  "bass=g=3:f=110", "equalizer=f=320:t=q:w=1.2:g=-2.5", "equalizer=f=3500:t=q:w=1.2:g=3", "treble=g=4:f=9000",
                  "deesser=i=0.4", "acompressor=threshold=-24dB:ratio=4:attack=4:release=90:makeup=3"])
raw = subprocess.run([FF, "-v", "error", "-i", src, "-af", CHAIN, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.float32).astype(float)
TEMPO = 1.0 if NATURAL else CFG.get("tempo", 1.06)   # les temps de la transcription (enregistrement d'origine) sont divisés par ce facteur
words = [(c["text"].strip(), c["timestamp"][0]/TEMPO, c["timestamp"][1]/TEMPO) for c in json.load(open(trans))["chunks"]]

# phrases : (premier mot, dernier mot, texte affiché, pause après en s)
PREROLL = CFG.get("preroll", 2.7)
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
INNER_MAX = CFG.get("inner_max", 0.25)
if "phrases" in CFG: PHRASES = [tuple(p) for p in CFG["phrases"]]

hop = int(0.01*SR)
env = np.array([np.sqrt(np.mean(x[i:i+hop]**2)) for i in range(0, len(x) - hop, hop)])
db = 20*np.log10(np.convolve(env, np.ones(3)/3, "same") + 1e-9)
thr = np.percentile(db, 95) - CFG.get("thr_db", 40)
speech = db > thr
def tidx(t): return int(np.clip(t*100, 0, len(db) - 1))
# frontières entre phrases : au MILIEU du plus long silence entre la fin de la phrase et le début de la suivante
# (les horodatages Whisper du premier mot sont souvent en retard : on ne coupe jamais juste avant une attaque).
floor = np.percentile(db[db > -90], 10)   # sans les silences numériques (prises assemblées)
quiet = db < floor + CFG.get("silence_db", 12)
bounds = [max(0.0, words[PHRASES[0][0]][1] - 0.35)]
for (a, b, _, _), (c, _, _, _) in zip(PHRASES, PHRASES[1:]):
    lo, hi = tidx(words[b][1] + 0.12), tidx(words[c][1] + 0.05)
    if hi <= lo: hi = lo + 1
    best, j = None, lo
    while j < hi:
        if quiet[j]:
            e = j
            while e < hi and quiet[e]: e += 1
            if best is None or e - j > best[1] - best[0]: best = (j, e)
            j = e
        else: j += 1
    bounds.append(((best[0] + best[1])/2 if best else lo + int(np.argmin(db[lo:hi])))/100)
bounds.append(len(x)/SR)

fade = int(0.012*SR); pieces = [np.zeros(int(PREROLL*SR))]; t_new = PREROLL; tmap = []; phr = []
for i, (a, b, text, pause) in enumerate(PHRASES):
    s0, s1 = tidx(bounds[i]), tidx(bounds[i+1])
    on = np.where(speech[s0:s1])[0]
    if not len(on): continue
    # marges de début/fin, sans jamais dépasser les frontières (sinon la 1re syllabe de la phrase suivante
    # se retrouve à la fin de celle-ci, puis est rejouée : « B… bien sûr »)
    p0, p1 = max(bounds[i], (s0 + on[0])/100 - 0.1), min(bounds[i+1], (s0 + on[-1])/100 + 0.18)
    if "src" in CFG: p0, p1 = CFG["src"][i]   # coupes explicites (mesurées sur les silences de l'enregistrement)
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
    st = CFG.get("stutter")
    if st and st["phrase"] == i and segs:
        u0 = segs[0][0]; chunk = x[int(u0*SR):int((u0 + st.get("dur", 0.11))*SR)].copy(); f2 = int(0.006*SR)
        chunk[:f2] *= np.linspace(0, 1, f2); chunk[-f2:] *= np.linspace(1, 0, f2)
        for _ in range(st.get("n", 2)):
            pieces.append(chunk); pieces.append(np.zeros(int(0.025*SR))); t_new += len(chunk)/SR + 0.025
        STUTTER = [round(t_ph0, 3), round(t_new, 3)]
    for si, (u, v) in enumerate(segs):
        seg = x[int(u*SR):int(v*SR)].copy()
        if len(seg) > 2*fade: seg[:fade] *= np.linspace(0, 1, fade); seg[-fade:] *= np.linspace(1, 0, fade)
        tmap.append((u, v, t_new)); pieces.append(seg); t_new += len(seg)/SR
        if si + 1 < len(segs):
            g = min(segs[si+1][0] - v, INNER_MAX); pieces.append(np.zeros(int(g*SR))); t_new += g
    phr.append({"text": text, "t0": round(t_ph0, 3), "t1": round(t_new, 3), "src": [round(p0, 3), round(p1, 3)]})
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
for p in [phr[i] for i in CFG.get("reverb", [2, -1])]:
    a, b = int(p["t0"]*SR), int(p["t1"]*SR); send[a:b] = y[a:b]
wet += fftconvolve(send, ir(2.6, 0.55))[:len(y)]*0.30
y = y + wet

# effets créatifs
def fdelay(sig, d):  # retard fractionnaire (tableau d'échantillons)
    idx = np.arange(len(sig)) - d; i0 = np.clip(np.floor(idx).astype(int), 0, len(sig) - 1); fr = idx - np.floor(idx)
    return sig[i0]*(1 - fr) + sig[np.clip(i0 + 1, 0, len(sig) - 1)]*fr
FX = []
for e in CFG.get("effects", []):
    p = phr[e["phrase"]]; t1 = p["t1"]; t0 = max(p["t0"], t1 - e["last"]) if "last" in e else p["t0"]
    a, b = int(t0*SR), int(t1*SR); seg = y[a:b].copy(); FX.append({"type": e["type"], "t0": round(t0, 3), "t1": round(t1, 3)})
    if e["type"] == "telephone":
        tel = np.tanh(sosfilt(butter(4, [400, 3200], "bp", fs=SR, output="sos"), seg)*3)
        y[a:b] = tel*np.sqrt(np.mean(seg**2))/max(1e-9, np.sqrt(np.mean(tel**2)))
    elif e["type"] == "chorus":
        n = np.arange(len(seg))/SR; out = seg.copy()
        for k, (base, rate) in enumerate(((0.012, 0.8), (0.019, 1.3))):
            out += 0.45*fdelay(seg, (base + 0.004*np.sin(2*np.pi*rate*n + k))*SR)
        y[a:b] = out/1.5
    elif e["type"] == "ghost":
        from scipy.signal import resample
        low = resample(seg, int(len(seg)*1.35)); tail = np.zeros(len(low) + int(2.5*SR)); tail[:len(low)] = low
        g = fftconvolve(tail, ir(2.6, 0.7))[:len(tail)]*0.5 + tail*0.35
        end = min(len(y), a + len(g)); y[a:end] += g[:end - a]*0.6
    elif e["type"] == "delay":
        for r in range(1, 6):
            o = a + int(0.34*r*SR); end = min(len(y), o + len(seg))
            if end > o: y[o:end] += sosfilt(butter(2, 3500, "lp", fs=SR, output="sos"), seg)[:end - o]*(0.55**r)
y /= np.max(np.abs(y))*1.12
import scipy.io.wavfile as wf
wf.write(f"public/audio/{nom}-voix.wav", SR, (y*32767).astype(np.int16))
json.dump({"duration": round(len(y)/SR, 3), "preroll": PREROLL, "phrases": phr, "mots": mots, "effets": FX, "stutter": globals().get("STUTTER")}, open(f"src/data/{nom}-voix.json", "w"), ensure_ascii=False, indent=1)
# contrôle des coupes : chaque coupe dans un silence, aucun chevauchement entre phrases
for i, p in enumerate(phr):
    a_, b_ = p["src"]
    lv = max(db[tidx(a_)], db[tidx(b_) - 1])
    over = i + 1 < len(phr) and b_ > phr[i+1]["src"][0] + 1e-6
    if lv > floor + 20 or over: print(f"⚠ coupe douteuse phrase {i} ({p['text'][:25]}…) : niveau {lv - floor:.0f} dB au-dessus du bruit, chevauchement={over}")
print(round(len(y)/SR, 2))
for p in phr: print(p["t0"], p["t1"], p["text"])
