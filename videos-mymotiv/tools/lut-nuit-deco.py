# LUT « nuit Art déco » (bleu nuit / indigo dans les ombres, lumières chaudes jaunes, rouges saturés tirés vers le magenta),
# inspirée d'une image de référence (colorimétrie seulement). Sortie : public/lut/nuit-deco.cube (33³), à appliquer au
# rendu final avec ffmpeg : -vf "lut3d=public/lut/nuit-deco.cube".
# Usage : python3 tools/lut-nuit-deco.py [image_test.png sortie.png]   (sans argument : écrit seulement le .cube)
import os, sys
import numpy as np

def grade(c: np.ndarray) -> np.ndarray:
    r, g, b = c[..., 0], c[..., 1], c[..., 2]
    L = 0.2126*r + 0.7152*g + 0.0722*b
    ws, wh = (1 - L)**2, L**2
    r = r - 0.045*ws + 0.05*wh; g = g - 0.03*ws + 0.03*wh; b = b + 0.11*ws - 0.06*wh     # ombres indigo, hautes lumières chaudes
    mx = np.maximum(g, b)
    red = np.clip(r - mx, 0, None) * np.clip(((r - g)/np.maximum(r, 1e-4) - 0.5)/0.4, 0, 1)   # rouges francs (pas la peau)
    b = b + red*0.42; r = r - red*0.06
    purple = np.clip(np.minimum(b, r) - g, 0, None) * (b > r*0.9)                           # violets → plus bleus
    r = r - purple*0.25
    c = np.stack([r, g, b], -1)
    L2 = (0.2126*c[..., 0] + 0.7152*c[..., 1] + 0.0722*c[..., 2])[..., None]
    c = L2 + (c - L2)*1.12                                                                  # saturation +12 %
    c = np.clip(c, 0, 1)
    c = c + 0.06*np.sin(2*np.pi*(c - 0.25))*0 + 0.08*(c - 0.5)*(1 - np.abs(2*c - 1))*2     # légère courbe en S
    return np.clip(c, 0, 1)

N = 33
root = os.path.join(os.path.dirname(__file__), "..")
os.makedirs(os.path.join(root, "public", "lut"), exist_ok=True)
grid = np.linspace(0, 1, N)
bb, gg, rr = np.meshgrid(grid, grid, grid, indexing="ij")                                  # r varie le plus vite
out = grade(np.stack([rr, gg, bb], -1)).reshape(-1, 3)
with open(os.path.join(root, "public", "lut", "nuit-deco.cube"), "w") as f:
    f.write('TITLE "MyMotiv nuit deco"\nLUT_3D_SIZE 33\n')
    for v in out: f.write(f"{v[0]:.6f} {v[1]:.6f} {v[2]:.6f}\n")
if len(sys.argv) == 3:
    from PIL import Image
    im = np.asarray(Image.open(sys.argv[1]).convert("RGB")).astype(float)/255
    Image.fromarray((grade(im)*255).astype(np.uint8)).save(sys.argv[2])
print("lut ok")
