# Voix « moqueuses » de fond (foule, cour de récré) en synthèse hors ligne : sherpa-onnx + voix Piper françaises
# (vits-piper-fr_FR-tom-medium, -siwis-medium, -upmc-medium [0 Jessica, 1 Pierre]), téléchargées depuis
# https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/ dans le dossier <modeles>.
# Usage : python3 tools/voix-moqueries.py <modeles> <config.json> <dossier de sortie>
#   config : [{"id": "zero1", "texte": "Zéro vue !", "voix": "fr_FR-siwis-medium", "sid": 0, "vitesse": 1.1, "hauteur": 1.08}, …]
#   hauteur > 1 : plus aigu (rééchantillonnage) ; sortie 48 kHz mono <id>.wav
import json, os, sys, sherpa_onnx
import numpy as np
import scipy.io.wavfile as wf
from scipy.signal import resample
mod, cfgp, out = sys.argv[1:4]; os.makedirs(out, exist_ok=True); cache = {}
def tts(v):
    if v not in cache:
        d = os.path.join(mod, "vits-piper-" + v)
        cache[v] = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
            model=f"{d}/{v}.onnx", tokens=f"{d}/tokens.txt", data_dir=f"{d}/espeak-ng-data"), num_threads=4)))
    return cache[v]
for e in json.load(open(cfgp)):
    a = tts(e["voix"]).generate(e["texte"], sid=e.get("sid", 0), speed=e.get("vitesse", 1.0)); x = np.array(a.samples)
    n48 = int(len(x)*48000/a.sample_rate/e.get("hauteur", 1.0)); y = resample(x, n48)
    y /= np.max(np.abs(y)) + 1e-9
    wf.write(f"{out}/{e['id']}.wav", 48000, (y*0.9*32767).astype(np.int16)); print(e["id"], round(len(y)/48000, 2), e["texte"])
