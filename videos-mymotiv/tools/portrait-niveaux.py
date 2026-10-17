# Fabrique plusieurs versions « mosaïque pixel » d'une photo, de la plus floue à la moins floue, pour une photo qui
# « respire » avec la voix (voir src/Instinct.tsx, PortraitVivant). La photo d'origine reste HORS du dépôt : on ne
# garde que les mosaïques. Le niveau le plus net reste volontairement flou (visage méconnaissable).
# Usage : python3 tools/portrait-niveaux.py <photo.jpg> <dossier de sortie> [largeurs en blocs, ex. 16,20,24,28,32]
import sys
from collections import deque
import numpy as np
from PIL import Image, ImageFilter

src = Image.open(sys.argv[1]).convert("RGB")
out_dir = sys.argv[2]
largeurs = [int(x) for x in (sys.argv[3] if len(sys.argv) > 3 else "16,20,24,28,32").split(",")]
ratio = src.height / src.width
for k, W in enumerate(largeurs):
    H = round(W * ratio)
    flou = src.width * 0.9 / W                                   # flou proportionnel à la taille d'un bloc
    im = src.filter(ImageFilter.GaussianBlur(flou)).resize((W, H), Image.BOX)
    q = np.asarray(im.quantize(colors=6 + k, method=Image.Quantize.MEDIANCUT).convert("RGB"))
    L = np.asarray(im.convert("L")).astype(float) / 255
    fond = np.zeros((H, W), bool); dq = deque([(0, 0), (0, W - 1)])  # fond clair relié aux coins du haut → transparent
    while dq:
        y, x = dq.popleft()
        if 0 <= y < H and 0 <= x < W and not fond[y, x] and L[y, x] > 0.8:
            fond[y, x] = True; dq.extend([(y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)])
    rgba = np.zeros((H, W, 4), np.uint8); rgba[..., :3] = q; rgba[..., 3] = 255; rgba[fond, 3] = 0
    Image.fromarray(rgba, "RGBA").resize((W * 12, H * 12), Image.NEAREST).save(f"{out_dir}/portrait-{k}.png")
    print(f"niveau {k} : {W} × {H} blocs, flou {flou:.0f} px")
