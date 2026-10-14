# Son du tuto « Les recruteurs veulent pas que tu saches ça » (TutoEcran, ≈44 s) : petit beat lo-fi feutré comme un face
# caméra TikTok (piano électrique, grosse caisse douce, charleston) ; bruitages de la démo filmée à l'écran (clics de souris,
# menu « partager », « lien copié », photo du CV qu'on glisse et qui est lue, analyse, score, tampon « rien d'inventé »,
# lettre prête) ; étiquettes qui « popent ». Temps calés sur src/TutoEcran.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon

s = PixelSon("tuto", seed=314)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
T_ECRAN, T_PARTAGE, T_COPIE, T_MM = sc(1), at(26) + 0.05, at(27) + 0.05, at(30) - 0.1
T_DESSUS, T_LACHE, T_LU = at(40) + 0.15, at(42) - 0.05, at(47) - 0.05
T_OFFRE, T_COLLE, T_LIRE, T_ANALYSE, T_RES = PH(3)[0] - 0.1, at(50) + 0.05, at(65) + 0.1, sc(4), at(78) + 0.3
T_GEN, T_LETTRE, T_TROUVE, T_STYLES, T_CV, T_FIN, T_YANN = at(102) - 0.02, at(110) - 0.05, at(122) - 0.1, sc(7), at(132) - 0.12, sc(8), sc(9)

B = 0.66                                                                  # un temps (≈ 91 bpm)
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]   # Am7 Fmaj7 Cmaj7 G7
s.piano(0.05, s.DUR - 0.6, CH, beat=B, g=0.85)
t = 0.05; k = 0
while t < s.DUR - 1.0:                                                    # grosse caisse sur 1 et 3, charleston en croches
    if k % 2 == 0 and not (T_FIN - 0.4 < t < T_FIN + 0.9): s.kick(t, 0.12)
    s.hat(t + B / 2, 0.018); s.hat(t, 0.01)
    t += B; k += 1
s.pad(s.DUR - 2.6, s.DUR, [57, 64, 67, 72], g=1.0)

# coupes et mouvements de la caméra (téléphone qui filme l'écran)
for a in (T_ECRAN, T_MM, T_OFFRE, T_ANALYSE, T_LETTRE, T_STYLES, T_CV, T_YANN): s.whoosh(a, "MoyenSourd", 0.06)
for a in (at(17), at(34) - 0.1, at(57) - 0.1, at(83) - 0.1, at(117) - 0.15, at(137) - 0.1): s.whoosh(a, "Court", 0.035)
s.click(at(8), 0.05); s.pop(at(13), 500, 1000, 0.04)                     # face caméra : coupe et zoom
# l'offre : partager, menu, copier, « lien copié »
s.click(T_PARTAGE, 0.1); s.pop(T_PARTAGE + 0.02, 600, 1200, 0.035)
s.click(T_COPIE, 0.1); s.ping(T_COPIE + 0.1, 0.03)
# MyMotiv : la photo glissée, lâchée, lue
s.paper(at(36), 0.05); s.click(T_LACHE, 0.08); s.pop(T_LACHE, 400, 900, 0.04)
s.riseblips(T_LACHE + 0.15, 9, 650, 1.08, (T_LU - T_LACHE - 0.3) / 9, 0.010)
s.chime(T_LU, 0.035, (1318.5, 1568, 2093))
# le lien collé, le cadre « colle le texte », lire l'offre
s.click(T_COLLE - 0.05, 0.08); s.key(T_COLLE, 0.06); s.key(T_COLLE + 0.06, 0.05)
s.pop(at(61) - 0.1, 600, 1300, 0.04)
s.click(T_LIRE, 0.1)
# analyse : étapes cochées, puis le score
for j in range(5): s.blip(T_ANALYSE + 0.3 + j * (T_RES - T_ANALYSE - 0.6) / 5, 1100 + 120 * j, 0.025)
s.chime(T_RES, 0.04)
s.pop(at(83), 500, 1400, 0.05)
for j in range(7): s.click(at(85) + j * 0.13, 0.04)                       # mots-clés cochés
for j in range(3): s.pop(at(91) + j * 0.15, 900, 500, 0.03)               # ceux qui manquent
s.stamp(at(96) - 0.05, 0.16)                                              # tampon « rien d'inventé »
# la lettre : clic, génération, lettre prête, logo, « trouvé tout seul »
s.click(T_GEN, 0.1); s.riseblips(T_GEN + 0.15, 8, 700, 1.07, (T_LETTRE - T_GEN - 0.3) / 8, 0.012)
s.chime(T_LETTRE, 0.05)
s.pop(at(117) - 0.05, 600, 1400, 0.045); s.pop(T_TROUVE + 0.1, 700, 1500, 0.045)
# 4 styles de PDF, CV adapté, « 1 page »
for j in range(4): s.pop(at(126) + j * 0.22, 500 + 120 * j, 1100 + 150 * j, 0.035)
s.paper(T_CV, 0.04); s.pop(at(137) + 0.2, 600, 1300, 0.045)
# fin : 1re lettre offerte, lien en bio, appel à commenter
s.chime(T_FIN + 0.2, 0.05, (1046.5, 1318.5, 1568)); s.pop(at(148) - 0.05, 700, 1500, 0.045)
s.pop(at(154) - 0.1, 600, 1400, 0.05)
# étiquettes d'étape
for a in (T_ECRAN + 0.3, at(34), at(43) - 0.05, T_OFFRE + 0.05, T_ANALYSE + 0.05, at(83) - 0.1, at(101) - 0.15, at(117) - 0.15, T_STYLES + 0.05, T_CV):
    s.pop(a, 700, 1500, 0.03)
s.mix(mus_g=0.4, fx_g=1.4, amb_g=0.0, duck=0.55)
