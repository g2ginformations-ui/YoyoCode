# Son de « Les RH ne veulent pas que vous sachiez ça mais blc » (SecretRH, ≈42 s) : petit beat lo-fi feutré (piano électrique,
# grosse caisse douce, charleston), comme un face caméra TikTok ; bruitages de la démo (clics, frappe du lien, « lien
# copié », cases qui sortent du téléphone, chrono, lettre prête) ; étiquettes qui « popent ». Temps calés sur src/SecretRH.tsx.
import sys
sys.path.insert(0, "tools")
from pixel_son import PixelSon

s = PixelSon("secretrh", seed=141)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d
sc = lambda i: PH(i)[0] - 0.15
B = 0.68                                                                  # un temps (≈ 88 bpm)
CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]   # Am7 Fmaj7 Cmaj7 G7
s.piano(0.05, s.DUR - 0.6, CH, beat=B, g=0.9)
t = 0.05; k = 0
while t < s.DUR - 1.0:                                                    # grosse caisse sur 1 et 3, charleston en croches
    if k % 2 == 0: s.kick(t, 0.12)
    s.hat(t + B / 2, 0.018); s.hat(t, 0.01)
    t += B; k += 1
s.pad(s.DUR - 2.4, s.DUR, [57, 64, 67, 72], g=1.0)

# coupes et mouvements de caméra
for a in (sc(1), sc(2), sc(5) - 0.3): s.whoosh(a, "MoyenSourd", 0.07)
# Yann : coupes du face caméra (petit clic sec)
for a in [at(6), at(16), sc(5), at(105), at(115), at(130), sc(6), at(136), at(148), sc(7)]: s.click(a, 0.05)
# le navigateur : cœur, clic, « lien copié »
s.pop(at(28), 700, 1500, 0.05); s.click(7.35, 0.1); s.ping(7.45, 0.03)
# MyMotiv : cases qui sortent, CV, frappe du lien, analyse, mots-clés, score, générer, chrono, lettre
for a in (8.25, 9.65, 11.45, 13.05, 15.5, 16.5, 18.3, 19.8, 22.4): s.pop(a, 500, 1100, 0.04)
s.paper(10.4, 0.05); s.click(11.55, 0.1)
for j in range(14): s.key(11.72 + j * 0.045, 0.04)
s.riseblips(13.1, 8, 700, 1.08, 0.18, 0.012)
s.chime(15.55, 0.03, (1318.5, 1568, 2093))
s.click(18.62, 0.1); s.pop(18.62, 600, 1300, 0.05)
for j in range(9): s.click(at(78) + j * 0.1, 0.04)
s.chime(19.78, 0.05)
# étiquettes
for a in (at(112), at(124), at(148), at(151), at(155)): s.pop(a, 700, 1500, 0.045)
s.buzzer(at(130) + 0.3, 0.025)
s.mix(mus_g=0.4, fx_g=1.4, amb_g=0.0, duck=0.55)
