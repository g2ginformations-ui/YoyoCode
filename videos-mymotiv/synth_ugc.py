# Son de « UGC fondateur » (≈31 s) : petit groove « lo-fi » discret sous la voix de Yann (ambiance de vidéo tournée au
# téléphone), « whoosh » court à chaque coupe sautée, « pop » à chaque autocollant, deux appuis de doigt sur l'écran,
# carillon sur « 30 s », frappe du mot « LETTRE » dans le champ de commentaire, signature sonore MyMotiv sur la réponse
# en message privé. Temps calés sur src/UgcFondateur.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import frappe, signature

s = PixelSon("ugc", seed=1717)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
T_DEMO, T_SELFIE2, T_CTA = sc(1), sc(5), sc(7)
T_CV, T_PHOTO, T_LIEN, T_30, T_LETTRE, T_PREUVES, T_RIEN = at(13), at(16), at(18), at(29), at(34), at(41), at(43)
T_CREE, T_RECRU, T_OFFERTE, T_SEMAINE, T_CENTIME, T_TAPE, T_DM = at(48), at(58), at(73), at(81), at(87), at(99), at(103)

B = 0.42
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [60, 64, 67, 71], [55, 59, 62, 67]]
s.piano(0.0, s.DUR - 0.6, CH, beat=B * 2, g=0.6)
t = 0.0; k = 0
while t < s.DUR - 0.8:
    if k % 2 == 0: s.kick(t, 0.08)
    else: s.click(t, 0.025)
    s.hat(t + B / 2, 0.012); t += B; k += 1
for a in (at(5) - 0.05, T_DEMO, T_SELFIE2, T_RECRU - 0.05, T_OFFERTE - 0.05, T_SEMAINE - 0.05, T_CENTIME - 0.05, T_CTA): s.whoosh(a, "Court", 0.035)
for a in (at(4) - 0.05, T_RIEN - 0.05, T_CREE - 0.05, T_RECRU - 0.05, T_OFFERTE - 0.05, T_SEMAINE - 0.05): s.ppop(a, 0.045, True)
for a in (T_CV, T_LIEN): s.click(a, 0.09); s.pop(a, 500, 900, 0.03)
for a in (T_PHOTO, sc(2) - 0.05, T_LIEN + 0.25, sc(3) - 0.05, T_LETTRE): s.click(a, 0.04)
s.chime(T_30 - 0.05, 0.04, (1046.5, 1318.5, 1568))
s.pop(at(84) - 0.05, 600, 1400, 0.05)
frappe(s, T_TAPE - 0.1, 6, 0.08, 0.05)
signature(s, T_DM, 0.05)
s.mix(mus_g=0.38, fx_g=1.3, amb_g=0.0, duck=0.55)
