# Voix de synthèse de Yann (hors ligne) : sherpa-onnx (pip install sherpa-onnx) + voix Piper « fr_FR-tom-medium »,
# téléchargée depuis https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/vits-piper-fr_FR-tom-medium.tar.bz2
# (dossier extrait à côté de ce script). Prononciation : écrire « Maille Motiv » pour MyMotiv, « cé vé » pour CV.
# usage : python3 tools/voix-yann-tts.py fr_FR-tom-medium 1.08 0 voix-yann < voix-yann/textes.txt
#         puis python3 tools/assembler-voix-yann.py voix-yann voix-yann/textes.txt <nom>
# usage: gen.py <voix> <speed> <sid> <outdir>  -- lit les phrases (une par ligne) sur stdin
import sys, sherpa_onnx, numpy as np, os
import scipy.io.wavfile as wf
v, speed, sid, out = sys.argv[1], float(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
d = os.path.join(os.path.dirname(__file__), "vits-piper-" + v)
cfg = sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(vits=sherpa_onnx.OfflineTtsVitsModelConfig(
    model=f"{d}/{v}.onnx", tokens=f"{d}/tokens.txt", data_dir=f"{d}/espeak-ng-data"), num_threads=4))
tts = sherpa_onnx.OfflineTts(cfg); os.makedirs(out, exist_ok=True)
for i, line in enumerate(l.strip() for l in sys.stdin if l.strip()):
    a = tts.generate(line, sid=sid, speed=speed); x = np.array(a.samples)
    wf.write(f"{out}/{i:02d}.wav", a.sample_rate, (np.clip(x,-1,1)*32767).astype(np.int16)); print(i, round(len(x)/a.sample_rate, 2), line)
