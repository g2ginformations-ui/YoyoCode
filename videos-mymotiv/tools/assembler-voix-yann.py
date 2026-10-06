# Assemble la voix de synthèse de Yann (phrases WAV séparées) en une seule piste 48 kHz mono, avec des blancs choisis,
# et écrit les temps de début/fin de chaque phrase (src/data/<nom>-phrases.json).
# usage : python3 tools/assembler-voix-yann.py <dossier_phrases> <fichier_textes> <nom>
import sys, json, glob, subprocess, numpy as np, imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000
src, textes, nom = sys.argv[1:4]
lines = [l.strip() for l in open(textes) if l.strip()]
GAPS = [0.35, 0.4, 0.25, 0.15, 0.15, 0.75, 0.3, 0.3, 0.3, 0.35, 0.3]   # blanc après chaque phrase (s)
START, TAIL = 0.2, 1.4
def load(f):
    raw = subprocess.run([FF, "-v", "error", "-i", f, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).astype(float)
    e = np.convolve(np.abs(x), np.ones(480)/480, "same"); on = np.where(e > 0.01*e.max())[0]
    return x[max(0, on[0]-240):on[-1]+480]                                  # coupe les silences du début et de la fin
out, phrases, t = [np.zeros(int(START*SR))], [], START
for i, f in enumerate(sorted(glob.glob(f"{src}/*.wav"))):
    x = load(f); phrases.append({"text": lines[i], "t0": round(t, 3), "t1": round(t + len(x)/SR, 3)})
    out.append(x); t += len(x)/SR
    g = GAPS[i] if i < len(GAPS) else TAIL; out.append(np.zeros(int(g*SR))); t += g
v = np.concatenate(out); v /= np.max(np.abs(v))*1.12
import scipy.io.wavfile as wf
wf.write(f"public/audio/{nom}-voix.wav", SR, (v*32767).astype(np.int16))
json.dump({"duration": round(len(v)/SR, 3), "phrases": phrases}, open(f"src/data/{nom}-phrases.json", "w"), ensure_ascii=False, indent=1)
print(round(len(v)/SR, 2)); [print(p["t0"], p["t1"], p["text"]) for p in phrases]
