# Montage de la voix : on raccourcit les silences, on retire l'hésitation « Et, », on traite le son, et on recale les mots.
import json, wave
import numpy as np
from scipy.signal import butter, sosfilt
w = wave.open('voix48k.wav'); sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
hop = int(0.01*sr); n = len(x)//hop
db = np.array([20*np.log10(np.sqrt(np.mean(x[i*hop:(i+1)*hop]**2)) + 1e-9) for i in range(n)])
speech = db > -34
# on élargit la parole de 70 ms de chaque côté (attaques et fins de mots intactes)
k = 7; sp = speech.copy()
for i in np.where(speech)[0]: sp[max(0, i-k):i+k+1] = True
# coupe manuelle : l'hésitation « Et, » (≈ 25,88 → 26,28 s)
cut_manual = [(25.80, 26.30)]
for a, b in cut_manual: sp[int(a*100):int(b*100)] = False
# segments à garder ; les pauses sont ramenées à 0,07 s (dans la phrase) ou 0,16 s (fin de phrase, pause > 0,4 s)
keep = []; i = 0
while i < n:
    if sp[i]:
        j = i
        while j < n and sp[j]: j += 1
        keep.append([i/100, j/100]); i = j
    else: i += 1
out_segs = []  # (début_orig, fin_orig, pause_après)
for idx, (a, b) in enumerate(keep):
    nxt = keep[idx+1][0] if idx+1 < len(keep) else None
    gap = (nxt - b) if nxt is not None else 0
    pause = 0 if nxt is None else (0.16 if gap > 0.4 else min(gap, 0.07))
    out_segs.append((a, b, pause))
fade = int(0.012*sr); pieces = []; tmap = []; t_new = 0.0
for a, b, pause in out_segs:
    s = x[int(a*sr):int(b*sr)].copy()
    if len(s) > 2*fade: s[:fade] *= np.linspace(0, 1, fade); s[-fade:] *= np.linspace(1, 0, fade)
    tmap.append((a, b, t_new)); pieces.append(s); t_new += len(s)/sr
    if pause > 0: pieces.append(np.zeros(int(pause*sr))); t_new += pause
y = np.concatenate(pieces)
# traitement : passe-haut 80 Hz, léger relief de présence, compression douce, normalisation
y = sosfilt(butter(2, 80, 'hp', fs=sr, output='sos'), y)
pres = sosfilt(butter(2, [2500, 6000], 'bandpass', fs=sr, output='sos'), y); y = y + 0.25*pres
env = np.sqrt(np.convolve(y**2, np.ones(int(0.02*sr))/int(0.02*sr), 'same')) + 1e-6
thr = 10**(-24/20); gain = np.where(env > thr, (thr/env)**(1 - 1/3), 1.0)
gain = np.convolve(gain, np.ones(int(0.005*sr))/int(0.005*sr), 'same'); y = y*gain
y = y / np.max(np.abs(y)) * 10**(-1.5/20)
with wave.open('voix_propre.wav', 'wb') as o: o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr); o.writeframes((y*32767).astype(np.int16).tobytes())
def remap(t):
    for a, b, tn in tmap:
        if t < a: return tn
        if t <= b: return tn + (t - a)
    return t_new
# mots recalés (les mots tombés dans une coupe sont écartés)
d = json.load(open('transcription.json')); words = []
for c in d['chunks']:
    a, b = c['timestamp']; txt = c['text'].strip()
    if not txt or (25.8 <= a < 26.3): continue
    words.append({'w': txt, 't0': round(remap(a), 3), 't1': round(remap(min(b, a + 0.8)), 3)})
# corrections de la transcription (MyMotiv, « tu colles », « l'IA rédige », « relit »)
fix = {'MyMotive,': 'MyMotiv,', 'MyMotive': 'MyMotiv', 'commences': 'colles', 'lia': "l'IA", 'rédiches': 'rédige', 'relie': 'relit', 'envoi': 'envoies', "'envoi": "'envoies"}
for wd in words: wd['w'] = fix.get(wd['w'], wd['w'])
json.dump({'duration': round(t_new, 3), 'words': words}, open('mots.json', 'w'), ensure_ascii=False, indent=1)
print('durée', round(len(x)/sr, 2), '→', round(t_new, 2), 's ;', len(words), 'mots')
