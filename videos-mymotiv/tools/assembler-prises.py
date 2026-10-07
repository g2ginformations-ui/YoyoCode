# Assemble plusieurs prises de voix en un seul enregistrement (pour remplacer un passage par une prise séparée).
# Usage : python3 tools/assembler-prises.py <sortie.wav> <fichier>:<début>:<fin> [<fichier>:<début>:<fin> …]
# Chaque morceau (en secondes, coupé dans un silence) est mis à niveau (même volume moyen que le 1er morceau) et séparé
# du suivant par 0,6 s de silence, pour que tools/voix-narrateur.py coupe proprement entre les phrases.
import subprocess, sys, imageio_ffmpeg
import numpy as np
import scipy.io.wavfile as wf
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000
out, parts = sys.argv[1], sys.argv[2:]
def load(p):
    raw = subprocess.run([FF, "-v", "error", "-i", p, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, dtype=np.float32).astype(float)
def level(s): v = s[np.abs(s) > 0.02]; return np.sqrt(np.mean(v**2)) if len(v) else 1.0
pieces, ref, f = [], None, int(0.01*SR)
for p in parts:
    path, a, b = p.rsplit(":", 2); s = load(path)[int(float(a)*SR):int(float(b)*SR)].copy()
    s[:f] *= np.linspace(0, 1, f); s[-f:] *= np.linspace(1, 0, f)
    ref = ref or level(s); s *= ref/level(s)
    pieces += [s, np.zeros(int(0.6*SR))]
y = np.concatenate(pieces); y /= max(1.0, np.max(np.abs(y))/0.98)
wf.write(out, SR, (y*32767).astype(np.int16)); print(round(len(y)/SR, 2), "s")
