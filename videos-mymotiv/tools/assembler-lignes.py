# Assemble une voix off générée phrase par phrase (ElevenLabs, tools/voix-elevenlabs.py) en une seule piste calée.
# Chaque phrase est rognée sur sa parole (-45 dB), accélérée si demandé (atempo, timbre conservé), mise au même volume,
# puis posée sur la ligne de temps. Les mots viennent de la transcription Whisper de CHAQUE phrase (pas de dérive).
# Usage : python3 tools/assembler-lignes.py <config.json> <nom>
#   config.json : {"dossier": "public/audio/<nom>-lignes", "tempo": 1.06, "debut": 0.3, "fin": 2.6,
#                  "lignes": [{"fichier": "p00.mp3", "transcription": "p00.json", "texte": "…", "pause": 0.35}, …],
#                  "cible": {"ligne": 7, "mot": -1, "temps": 31.45}}   ← facultatif : le mot choisi tombe pile à ce
#                  temps ; les pauses sont alors réparties pour y arriver.
# Sorties : public/audio/<nom>-voix.wav (48 kHz mono) + src/data/<nom>-voix.json (phrases et mots, même format que
#           tools/voix-narrateur.py).
import json, subprocess, sys
import numpy as np
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000
cfg = json.load(open(sys.argv[1])); nom = sys.argv[2]
D, TEMPO = cfg["dossier"], cfg.get("tempo", 1.0)

def load(path):
    raw = subprocess.run([FF, "-v", "error", "-i", path, "-af", f"atempo={TEMPO}", "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)

L = []
for li in cfg["lignes"]:
    x = load(f"{D}/{li['fichier']}")
    hop = SR // 100; db = 20*np.log10(np.array([np.sqrt(np.mean(x[i:i+hop]**2)) for i in range(0, len(x) - hop, hop)]) + 1e-9)
    on = np.where(db > -45)[0]; a = max(0, on[0] - 3)*hop; b = min(len(x), (on[-1] + 6)*hop)
    seg = x[a:b]; seg = seg/np.sqrt(np.mean(seg[np.abs(seg) > 0.01]**2) + 1e-9)*0.12      # même volume pour toutes
    f = int(0.01*SR); seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
    words = [(c["text"].strip(), c["timestamp"][0]/TEMPO - a/SR) for c in json.load(open(f"{D}/{li['transcription']}"))["chunks"]]
    L.append({"x": seg, "dur": len(seg)/SR, "words": words, "texte": li["texte"], "pause": li.get("pause", 0.35)})

# pauses : celles de la config, ou réparties pour que le mot « cible » tombe au temps voulu
starts = []
if "cible" in cfg:
    c = cfg["cible"]; k = c["ligne"]; w_off = L[k]["words"][c["mot"]][1]
    start_k = c["temps"] - w_off
    used = cfg["debut"] + sum(l["dur"] for l in L[:k])
    free = start_k - used
    base = sum(l["pause"] for l in L[:k])
    scale = free/base if base > 0 else 0
    if free < 0: sys.exit(f"Trop long : il manque {-free:.2f} s (augmenter le tempo ou raccourcir le texte).")
    for l in L[:k]: l["pause"] *= scale
t = cfg["debut"]
for l in L: starts.append(t); t += l["dur"] + l["pause"]
total = starts[-1] + L[-1]["dur"] + cfg.get("fin", 2.5)
y = np.zeros(int(total*SR))
for s, l in zip(starts, L):
    i = int(s*SR); y[i:i + len(l["x"])] += l["x"]
y /= np.max(np.abs(y))*1.12
import scipy.io.wavfile as wf
wf.write(f"public/audio/{nom}-voix.wav", SR, (y*32767).astype(np.int16))
phr, mots, wi = [], [], 0
for k, (s, l) in enumerate(zip(starts, L)):
    phr.append({"text": l["texte"], "t0": round(s, 3), "t1": round(s + l["dur"], 3)})
    for w, wt in l["words"]:
        mots.append({"w": w, "i": wi, "phrase": k, "t0": round(s + max(0, wt), 3)}); wi += 1
json.dump({"duration": round(total, 3), "phrases": phr, "mots": mots}, open(f"src/data/{nom}-voix.json", "w"), ensure_ascii=False, indent=1)
for p in phr: print(p["t0"], p["t1"], p["text"])
print("pauses :", [round(l["pause"], 2) for l in L], "· durée", round(total, 2))
