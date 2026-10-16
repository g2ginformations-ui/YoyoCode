# Son de « Source : moi » (SourceMoi, ≈71 s) : piano « documentaire » sérieux (ré mineur) et tic-tac pendant les fausses
# sources, papier + « pop » à chaque carte 📄, disque qui s'arrête quand la phrase est coupée, glitch du faux oubli, puis la
# révélation : silence, tampons « INVENTÉ » en cascade, battements pendant « t'as hoché la tête » ; groove clair (do majeur)
# pour la lettre et MyMotiv (surligneur, tampon « AUCUNE PREUVE », lettre qui part), carillon de la vraie source, offre,
# et retour de l'accroche pour la boucle. Temps calés sur src/SourceMoi.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon
from pub_son import claque, feutre, groove

s = PixelSon("source", seed=517)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
S = [0] + [sc(i) for i in range(1, 11)]
COUPE1, COUPE3 = at(55) + 0.15, at(101) + 0.15
T_TAMPON, T_HOCHE, T_FIN = at(109) - 0.1, at(128) - 0.1, at(234) - 0.1
FIN = PH(10)[1] - 0.15

# ─── musique ───
B = 0.66
DOC = [[50, 53, 57, 62], [46, 50, 53, 58], [48, 52, 55, 60], [45, 49, 52, 57]]          # Dm Bb C A : ton « documentaire »
s.piano(0.05, COUPE1, DOC, beat=B, g=0.85)
s.piano(S[3] + 0.6, COUPE3, DOC, beat=B, g=0.85)
for a, b in ((0.05, COUPE1), (S[3] + 0.6, COUPE3)):
    t = a
    while t < b - 0.1: s.hat(t, 0.018); t += B
s.pad(S[5] + 0.3, S[6] + 0.2, [45, 52, 57], g=1.0)                                     # la révélation : nappe grave
for k in range(4): s.kick(T_HOCHE + k * 0.45, 0.08)
CLAIR = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]       # C G Am F
s.piano(S[6] + 0.05, T_FIN, CLAIR, beat=0.55, g=0.8)
groove(s, S[8], T_FIN, 0.55, CLAIR, g=0.5, stabs=False)
s.pad(T_FIN, S[10] + 0.3, [60, 64, 67, 72], g=1.0)
s.piano(S[10], FIN, [[60, 64, 67, 72], [53, 57, 60, 65]], beat=B, g=0.55, arp=False)

# ─── bruitages ───
claque(s, 0.02, 0.7); s.whoosh(0.0, "Court", 0.05)
claque(s, at(19) - 0.1, 0.8); s.pop(at(23) - 0.1, 600, 1300, 0.04)
for a in (at(28) - 0.15, at(47) - 0.1, at(71) - 0.1, at(89) - 0.1, at(94) - 0.1):   # les cartes 📄
    s.paper(a, 0.05); s.pop(a + 0.05, 700, 1500, 0.04)
s.stamp(at(51) - 0.1, 0.06)
s.tapestop(COUPE1 + 0.05, 0.06); s.glitch(S[3], 0.35, 0.07); s.pop(S[3] + 0.3, 900, 400, 0.04)
claque(s, at(65) - 0.1, 0.8); s.pop(at(69) - 0.1, 600, 1300, 0.04)
s.pop(at(84) - 0.1, 600, 1300, 0.04); claque(s, at(87) - 0.1, 0.8)
s.tapestop(COUPE3 + 0.05, 0.06); s.glitch(S[5], 0.25, 0.06)
for i in range(5): s.pop(at(103) - 0.1 + i * 0.08, 600 + 80 * i, 1400, 0.035)
for i in range(5): s.stamp(T_TAMPON + i * 0.15, 0.16)
s.buzzer(at(115) - 0.1, 0.025); s.buzzer(at(122) - 0.1, 0.025)
claque(s, T_HOCHE, 0.8)
s.pop(at(134) - 0.1, 600, 1300, 0.04); s.pop(at(139) - 0.1, 600, 1300, 0.04); claque(s, at(144) - 0.1, 0.9)
s.whoosh(S[7], "MoyenSourd", 0.06); s.paper(at(161) - 0.15, 0.06)
for i in (164, 165, 166): feutre(s, at(i) - 0.1, 0.25, 0.05); s.ppop(at(i) - 0.05, 0.035, True)
s.stamp(at(174) - 0.1, 0.2)
s.whoosh(at(189) - 0.1, "Court", 0.07)
s.whoosh(S[8], "MoyenSourd", 0.06); s.pop(S[8] + 0.2, 600, 1400, 0.045)
s.ppop(at(200) - 0.1, 0.04, True); s.riseblips(at(209) - 0.05, 6, 700, 1.12, 0.04, 0.012)
s.chime(at(209) + 0.1, 0.04, (1046.5, 1318.5, 1568)); claque(s, at(215) - 0.1, 0.6)
s.buzzer(at(220) - 0.05, 0.025); s.chime(at(229) - 0.05, 0.035)
s.chime(T_FIN, 0.045, (1046.5, 1318.5, 1568)); s.ppop(at(239) - 0.05, 0.05, True)
s.whoosh(S[10], "Court", 0.05); s.pop(at(244) - 0.1, 700, 1500, 0.04)
s.paper(at(253) - 0.15, 0.05); s.chime(at(253), 0.04)
s.riseblips(FIN - 0.4, 8, 1800, 0.86, 0.05, 0.012); claque(s, FIN, 0.6)
s.mix(mus_g=0.4, fx_g=1.4, amb_g=0.0, duck=0.55)
