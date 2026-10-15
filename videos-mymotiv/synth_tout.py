# Son de la pub « tout en un » (ToutEnUn, ≈32 s) : beat pop énergique dès la 1re image (grosse caisse, clap, basse, accords),
# coupé net sur le problème (tic-tac de l'horloge qui défile, la nuit), relancé sur la démo ; touches de l'écran, photo
# qui file, « coller », analyse, score, lettre prête ; compteurs du témoignage ; impacts sur « offerte » et le prix ; fin.
# Temps calés sur src/ToutEnUn.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, groove

s = PixelSon("tout", seed=271)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
T_PB, T_DEMO, T_LIEN, T_PREUVE, T_OFFRE, T_FIN = sc(1), sc(2), sc(3), sc(4), sc(5), sc(6)
T_ACC, T_TAP_CTA, T_HORLOGE = at(4), at(11) + 0.05, at(23) - 0.05
T_TAP_CV = at(39) - 0.05; T_PHOTO = T_TAP_CV + 0.45; T_LU = at(46) + 0.1
T_TAP_INPUT = at(48) - 0.1; T_COLLER = T_TAP_INPUT + 0.35; T_ANALYSE = at(54) - 0.1; T_SCORE = at(57) + 0.15; T_LETTRE = at(61) - 0.1
T_APRES = at(84) - 0.1

B = 0.48                                                                       # ≈ 125 bpm
CH = [[57, 60, 64, 69], [53, 57, 60, 65], [60, 64, 67, 72], [55, 59, 62, 67]]  # Am F C G
groove(s, 0.0, T_PB - 0.05, B, CH, g=0.9)
s.pad(T_PB, T_DEMO, [45, 52, 57, 60], g=0.9)                                   # le problème : nappe sombre
groove(s, T_DEMO - 0.02, T_FIN + 0.2, B, CH, g=1.0)
s.pad(T_FIN, s.DUR, [57, 64, 69, 72], g=1.1)

# accroche
claque(s, 0.02, 1.2); claque(s, 0.12, 0.8); s.chime(T_ACC, 0.04); s.click(T_TAP_CTA, 0.1); s.pop(T_TAP_CTA, 500, 1100, 0.04)
# le problème
for a in (T_PB, T_DEMO, T_PREUVE, T_OFFRE, T_FIN): s.whoosh(a, "MoyenSourd", 0.07)
s.paper(at(12), 0.05)
for j in range(3): s.paper(at(17) + j * 0.08, 0.035)
s.put(s.fx, s.sweep(500, 900, 0.3) * s.env(int(0.3 * 48000), 0.01, 0.12), at(20) - 0.1, 0.04)   # le trait qui entoure
claque(s, at(22) - 0.1, 1.2); s.buzzer(at(22), 0.025)
for j in range(int((at(32) - T_HORLOGE) / 0.12)): s.click(T_HORLOGE + 0.1 + j * 0.12, 0.05 if j % 2 == 0 else 0.03)   # tic-tac
claque(s, at(32) - 0.1, 1.3)
# la démo
s.click(T_TAP_CV, 0.1); s.paper(T_TAP_CV + 0.2, 0.04); s.pop(T_PHOTO, 400, 900, 0.045)
s.riseblips(T_PHOTO + 0.3, 8, 650, 1.08, (T_LU - T_PHOTO - 0.4) / 8, 0.011)
s.pop(at(42) - 0.1, 700, 1500, 0.045); s.chime(T_LU, 0.035, (1318.5, 1568, 2093))
s.click(T_TAP_INPUT, 0.1); s.click(T_COLLER, 0.1); s.key(T_COLLER + 0.05, 0.06)
for j in range(5): s.blip(T_ANALYSE + 0.05 + j * (T_SCORE - T_ANALYSE - 0.1) / 5, 1100 + 120 * j, 0.025)
s.pop(at(56) - 0.1, 600, 1400, 0.05); s.pop(T_SCORE + 0.05, 500, 1300, 0.045)
s.chime(T_LETTRE, 0.05); s.pop(at(62) - 0.1, 700, 1500, 0.04)
from pub_son import feutre
feutre(s, at(68) - 0.15, 0.3, 0.05)
# la preuve
for j in range(11): s.click(at(75) - 0.35 + j * 0.04, 0.035)
for j in range(7): s.click(at(77) - 0.15 + j * 0.06, 0.04)
s.chime(at(77) + 0.3, 0.05, (1046.5, 1318.5, 1568))
# l'offre
claque(s, at(83) - 0.1, 1.3); s.chime(at(83), 0.045, (1568, 2093, 2637)); s.pop(at(83) + 0.25, 700, 1500, 0.04)
claque(s, at(87) - 0.15, 1.1); s.paper(at(91) - 0.1, 0.05); s.pop(at(93) - 0.1, 700, 1500, 0.045)
# fin
s.chime(T_FIN + 0.2, 0.05, (1046.5, 1318.5, 1568)); s.pop(at(96) - 0.05, 700, 1500, 0.045)
s.mix(mus_g=0.36, fx_g=1.4, amb_g=0.0, duck=0.6)
