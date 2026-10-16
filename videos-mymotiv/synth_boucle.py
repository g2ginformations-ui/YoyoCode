# Son de « Boucles ouvertes » (BouclesOuvertes, ≈59 s) : piano tendu en la mineur avec un tic-tac sous chaque histoire,
# « disque qui s'arrête » quand la phrase est coupée (« c'est que… »), glitch du faux oubli, nappe grave et battements
# de cœur pendant la révélation, tampon sur « 0 PHRASE FINIE », puis groove clair (do majeur) pour la lettre et MyMotiv,
# carillon de l'offre, et un rembobinage à la toute fin pour que la boucle reparte. Temps calés sur src/BouclesOuvertes.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, groove

s = PixelSon("boucle", seed=416)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
S1, S2, S3, S4, S5, S6, S7, S8 = (sc(i) for i in range(1, 9))
COUPE1, COUPE3 = at(68) + 0.15, at(117) + 0.15
T_FIN = at(190) - 0.1
FIN = PH(8)[1] - 0.2

# ─── musique ───
B = 0.68
TENDU = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]     # Am F Dm E
s.piano(0.05, COUPE1, TENDU, beat=B, g=0.9)
t = 0.05
while t < COUPE1 - 0.1: s.hat(t, 0.02); t += B                                     # tic-tac
s.pad(S3 + 0.2, S4 + 0.3, [57, 60, 63], g=0.8)                                      # le faux oubli : flottement
s.piano(S4 + 0.05, COUPE3, [[50, 53, 57, 62], [46, 50, 53, 58], [53, 57, 60, 65], [52, 56, 59, 64]], beat=B, g=0.9)
t = S4 + 0.05
while t < COUPE3 - 0.1: s.hat(t, 0.02); t += B
s.pad(S5 + 0.1, S6 + 0.2, [45, 52, 57], g=1.1)                                      # la révélation : nappe grave
for k in range(int((S6 - S5 - 0.4) / 0.9)):
    s.kick(S5 + 0.3 + k * 0.9, 0.09); s.kick(S5 + 0.48 + k * 0.9, 0.06)             # battements de cœur
CLAIR = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]     # C G Am F
s.piano(S6 + 0.05, T_FIN, CLAIR, beat=0.55, g=0.8)
groove(s, S7, T_FIN, 0.55, CLAIR, g=0.55, stabs=False)
s.pad(T_FIN, FIN + 0.1, [60, 64, 67, 72], g=1.1)
s.piano(S8, FIN, [[57, 60, 64, 69], [53, 57, 60, 65]], beat=B, g=0.6, arp=False)     # retour du la mineur : ça recommence

# ─── bruitages ───
claque(s, 0.02, 0.7); s.whoosh(0.0, "Court", 0.05)
s.whoosh(S1, "Court", 0.05); s.pop(S1 + 0.02, 600, 1400, 0.045)
for a in (at(24) - 0.1, at(27) - 0.1, at(29) - 0.1): s.ppop(a, 0.045, True)
s.pop(at(34) - 0.1, 300, 160, 0.05)                                                 # 🦠
s.stamp(at(63) - 0.1, 0.07)
s.chime(at(47) - 0.1, 0.03)
s.tapestop(COUPE1 + 0.05, 0.06)
s.glitch(S3, 0.35, 0.07); s.pop(S3 + 0.3, 600, 1400, 0.04); s.pop(S3 + 0.4, 900, 400, 0.04)
s.whoosh(S4, "Court", 0.05); s.pop(S4 + 0.1, 600, 1400, 0.04)
s.riseblips(at(90) - 0.1, 8, 500, 1.1, 0.05, 0.014)
s.ppop(at(95) - 0.15, 0.05, True); s.chime(at(95) - 0.1, 0.03)
s.tapestop(COUPE3 + 0.05, 0.06)
for a in (S5 + 0.05, at(129) - 0.1, at(131) - 0.1): s.pop(a, 600, 1400, 0.045)
claque(s, at(135) - 0.15, 1.0)
s.whoosh(S6, "MoyenSourd", 0.06); s.pop(S6 + 0.05, 700, 1500, 0.04)
s.paper(at(154) - 0.1, 0.05); s.buzzer(at(154) + 0.6, 0.03)
s.paper(at(163) - 0.15, 0.05); s.chime(at(163) + 0.3, 0.035)
s.whoosh(S7, "MoyenSourd", 0.06); s.pop(S7 + 0.2, 600, 1400, 0.045)
s.ppop(at(188) - 0.1, 0.05, True)
s.chime(T_FIN, 0.045, (1046.5, 1318.5, 1568)); s.ppop(at(194) - 0.05, 0.05, True)
s.pop(at(202) - 0.15, 700, 1500, 0.045)
s.riseblips(FIN - 0.45, 8, 1800, 0.86, 0.05, 0.012)                                 # rembobinage
s.whoosh(FIN, "Court", 0.05)
s.mix(mus_g=0.4, fx_g=1.4, amb_g=0.0, duck=0.55)
