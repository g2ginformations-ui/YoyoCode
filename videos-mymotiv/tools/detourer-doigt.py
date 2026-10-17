# Détoure la main de Yann à l'index levé (public/yann/g2-argumenter.png, ses vraies photos masquées) pour s'en servir de
# « doigt qui montre l'écran » dans les tutos filmés (TutoDoigt) : on garde la peau dans un cadre autour de la main, on
# bouche les trous, on fond le poignet. → public/yann/doigt.png (bout de l'index : voir la sortie du script).
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as nd
im = Image.open("public/yann/g2-argumenter.png").convert("RGBA")
x0, y0, x1, y1 = 60, 280, 250, 640
c = np.asarray(im.crop((x0, y0, x1, y1))).astype(float)
R, G, B, A = c[..., 0], c[..., 1], c[..., 2], c[..., 3]
mx, mn = np.maximum(np.maximum(R, G), B), np.minimum(np.minimum(R, G), B)
peau = (A > 200) & (R > 90) & (R > G) & (G >= B * 0.9) & ((mx - mn) > 18) & (R + G + B > 260)
peau = nd.binary_opening(peau, iterations=1)
lab, n = nd.label(peau); tailles = nd.sum(peau, lab, range(1, n + 1)); peau = lab == (np.argmax(tailles) + 1)
peau = nd.binary_closing(peau, iterations=3); peau = nd.binary_fill_holes(peau)
peau = nd.binary_opening(peau, iterations=4)                                      # retire les franges fines (revers de la veste)
lab, n = nd.label(peau); tailles = nd.sum(peau, lab, range(1, n + 1)); peau = lab == (np.argmax(tailles) + 1)
peau = nd.binary_erosion(peau, iterations=1)                                      # liseré sombre du détourage
alpha = Image.fromarray((peau * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
a = np.asarray(alpha).astype(float)
h = a.shape[0]; yy = np.arange(h)[:, None]
a *= np.clip((h - 30 - yy) / 60, 0, 1)                                            # poignet fondu
out = np.dstack([R, G, B, a]).astype(np.uint8)
img = Image.fromarray(out, "RGBA")
img = img.crop(img.getbbox())
img = img.resize((img.width * 3, img.height * 3), Image.LANCZOS).filter(ImageFilter.UnsharpMask(2, 60, 2))
img.save("public/yann/doigt.png")
ys, xs = np.nonzero(np.asarray(img)[..., 3] > 128)
top = ys.min(); print("taille", img.size, "bout de l'index ≈", (int(np.median(xs[ys < top + 6])), int(top)))
