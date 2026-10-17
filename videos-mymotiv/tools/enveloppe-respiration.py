# Enveloppe « respiration » de la voix, image par image, pour animer un élément au rythme des paroles (pauses,
# respirations, intonations) — ex. la photo qui se floute et se défloute (PortraitVivant, src/Instinct.tsx).
# Différent de tools/enveloppe-voix.py (bouches des vidéos 3D, 60 valeurs/s, autre format) : ne pas confondre.
# Lit public/audio/<nom>-voix.wav et écrit src/data/<nom>-souffle.json : {"fps": 30, "env": [0..1 par image]}.
# Volume en dB ramené entre 0 (silence, respiration) et 1 (syllabe forte), + un petit coup de pouce sur les attaques
# (syllabes accentuées). Montée rapide, retombée plus lente : l'élément « respire » au lieu de clignoter.
# Usage : python3 tools/enveloppe-respiration.py <nom> [fps]
import json, sys, wave
import numpy as np

nom = sys.argv[1]; fps = int(sys.argv[2]) if len(sys.argv) > 2 else 30
with wave.open(f"public/audio/{nom}-voix.wav") as w:
    sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
n = int(len(x) / sr * fps); hop = sr // fps
db = np.array([20 * np.log10(np.sqrt(np.mean(x[max(0, i * hop - hop // 2): i * hop + hop // 2 + 1] ** 2)) + 1e-9) for i in range(n)])
brut = np.clip((db + 42) / 28, 0, 1)                                     # −42 dB → 0, −14 dB → 1
attaque = np.clip(np.diff(brut, prepend=brut[0]), 0, None)              # syllabes accentuées
cible = np.clip(brut + 0.6 * attaque, 0, 1)
env, v = [], 0.0
for c in cible:
    v += (c - v) * (0.55 if c > v else 0.14)                             # montée rapide, retombée lente
    env.append(round(float(v), 3))
json.dump({"fps": fps, "env": env}, open(f"src/data/{nom}-souffle.json", "w"))
print(f"{n} images · moyenne {np.mean(env):.2f} · parole > 0,5 : {np.mean(np.array(env) > 0.5) * 100:.0f} %")
