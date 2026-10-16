# Son de « C'est combien ? » (≈9,5 s) : le vocal affolé (voix « Amelie » de la bibliothèque ElevenLabs, balises d'émotion
# v4 [screaming] [excited] [panicked] ; aucune voix réelle copiée) passé dans un léger filtre « haut-parleur de téléphone »,
# un petit « tap » quand le vocal démarre, puis la signature sonore MyMotiv sur l'écran de fin. Écrit aussi l'enveloppe du
# vocal (src/data/combien-env.json, une valeur par image à 30 i/s) qui fait trembler la bulle. Temps : src/CestCombien.tsx.
import json, subprocess, sys
import numpy as np
sys.path.insert(0, "tools")
from histoire_son import SR
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe()
T_VOCAL = 0.35                                          # le vocal démarre (même valeur que T_VOCAL dans CestCombien.tsx)

raw = subprocess.run([FF, "-v", "error", "-i", "public/audio/combien-lignes/vocal.mp3", "-af", "highpass=f=220,lowpass=f=7500,acompressor=threshold=-18dB:ratio=3",
                      "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
v = np.frombuffer(raw, dtype=np.float32).astype(float)
on = np.where(np.abs(v) > 0.01)[0]; v = v[max(0, on[0] - 200): on[-1] + 2000]
DUR_V = len(v) / SR
T_FIN = T_VOCAL + DUR_V + 0.3
DUR = T_FIN + 2.4
N = int(DUR * SR); out = np.zeros(N)
a = int(T_VOCAL * SR); out[a:a + len(v)] += v / (np.max(np.abs(v)) + 1e-9) * 0.9

def put(sig, t, g):
    i = int(t * SR); j = min(N, i + len(sig)); out[i:j] += sig[: j - i] * g
tt = np.arange(int(0.05 * SR)) / SR
put(np.sin(2 * np.pi * 1800 * tt) * np.exp(-tt / 0.008), T_VOCAL - 0.12, 0.25)          # tap sur « lecture »
# signature MyMotiv (do-mi-sol aigus) sur l'écran de fin
for k, f in enumerate((1046.5, 1318.5, 1568.0)):
    t2 = np.arange(int(1.4 * SR)) / SR
    put(np.sin(2 * np.pi * f * t2) * np.exp(-t2 / 0.45) * np.minimum(1, t2 / 0.005), T_FIN + 0.35 + k * 0.09, 0.16)
t2 = np.arange(int(1.6 * SR)) / SR
put((np.sin(2 * np.pi * 1046.5 * t2) + np.sin(2 * np.pi * 1318.5 * t2) + np.sin(2 * np.pi * 1568 * t2)) * np.exp(-t2 / 0.7) * np.minimum(1, t2 / 0.01), T_FIN + 0.62, 0.06)

# enveloppe du vocal, une valeur par image (pour faire trembler la bulle)
fps = 30; env = []
for f in range(int(DUR * fps) + 1):
    i = int(f / fps * SR); seg = out[i: i + SR // fps]
    env.append(float(np.sqrt(np.mean(seg ** 2))) if len(seg) else 0.0)
m = max(env) or 1; env = [round(e / m, 3) for e in env]
json.dump({"dur": round(DUR, 3), "vocal": T_VOCAL, "dureeVocal": round(DUR_V, 3), "fin": round(T_FIN, 3), "env": env}, open("src/data/combien-env.json", "w"))

st = np.stack([out, out], 1); st /= np.max(np.abs(st)) * 1.05
import wave
with wave.open("public/audio/combien-brut.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((st * 32767).astype(np.int16).tobytes())
subprocess.run([FF, "-v", "error", "-y", "-i", "public/audio/combien-brut.wav", "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), "public/audio/combien.wav"], check=True)
import os; os.remove("public/audio/combien-brut.wav")
print(f"vocal {DUR_V:.2f} s · durée totale {DUR:.2f} s · audio ok")
