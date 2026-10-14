# Son de « Ta lettre traduite en langage recruteur » (Traducteur, ≈36 s) : petit beat léger tout du long ; à chaque
# traduction, le bouton d'échange tourne (whoosh court) puis la phrase « claque » (coup sourd + éclat) ; tampon
# « INTERDITES », carillon MyMotiv, fin sur le jeu en commentaire. Temps calés sur src/Traducteur.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, frappe, groove

s = PixelSon("traduc", seed=211)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
SLAMS = [at(14) - 0.05] + [PH(k)[0] - 0.05 for k in (4, 6, 8, 10)]
FIN, CTA = PH(11)[0] - 0.15, PH(12)[0] - 0.15
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]
groove(s, 0.0, s.DUR - 1.0, 0.52, CH, g=0.8)
s.pad(s.DUR - 2.0, s.DUR, [57, 64, 69, 72], g=1.0)
for k, sl in enumerate(SLAMS):
    p = PH(2*k + 1)[0]
    frappe(s, p, 10, 0.12, 0.02)                                     # la phrase pompeuse s'écrit
    s.whoosh(sl - 0.35, "Court", 0.05)                                # le bouton tourne
    claque(s, sl, 1.2)                                                # la traduction claque
s.whoosh(FIN - 0.05, "MoyenSourd", 0.07)
for i in range(5): s.put(s.fx, s.BP(s.noise(0.2), 1500, 6000)*s.env(int(0.2*48000), 0.01, 0.08), at(69) + i*0.12, 0.05)
claque(s, at(72) - 0.1, 1.4)                                          # tampon « INTERDITES »
s.chime(at(73), 0.05); s.pop(at(83), 600, 1300, 0.05); s.pop(at(86), 700, 1500, 0.04)
s.whoosh(CTA - 0.05, "Court", 0.06); frappe(s, PH(12)[0], 10, 0.12, 0.02); s.pop(PH(13)[0] + 0.2, 500, 1200, 0.05)
s.mix(mus_g=0.3, fx_g=1.4, amb_g=0.0, duck=0.6)
