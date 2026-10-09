# Enveloppe d'une voix off (60 valeurs par seconde, 0..1) pour animer les bouches : src/data/<nom>-env.json.
# Usage : python3 tools/enveloppe-voix.py <nom>   (lit public/audio/<nom>-voix.wav)
import json, sys, wave
import numpy as np
nom = sys.argv[1]
with wave.open(f"public/audio/{nom}-voix.wav") as w:
    sr = w.getframerate(); x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float) / 32768
hop = sr // 60
e = np.array([np.sqrt(np.mean(x[i:i + hop] ** 2)) for i in range(0, len(x) - hop, hop)])
e = np.clip(e / (np.percentile(e[e > 0.01], 90) + 1e-9), 0, 1)
json.dump([round(float(v), 3) for v in e], open(f"src/data/{nom}-env.json", "w"))
print(nom, len(e), "valeurs")
