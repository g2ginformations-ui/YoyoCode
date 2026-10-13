# Son de « L'offre parfaite » VERSION 2 (OffreParfaite2, ≈91 s) — même début que synth_offre.py, puis : sursaut sur « Longtemps »,
# téléphone qui vibre le lendemain matin, « Merci d'être venue », silence total, leçon, CTA à théories.
# Base commune avec la version 1 (synth_offre.py, OffreParfaite) : ambiance d'horreur discrète, sans musique joyeuse. Bourdon grave qui
# bat lentement, ventilateur d'ordinateur, battements de cœur, « ding » faux, chargement MyMotiv, glitch sur « Là… », silence
# total avant « elle n'a encore rien envoyé », téléphone qui vibre sur le bois, souffle de ligne pendant l'appel, réverbère
# qui grésille et vent devant le bâtiment, une note claire pour la leçon. Temps calés sur src/data/offre-voix.json.
import sys
import numpy as np
sys.path.insert(0, "tools")
from histoire_son import SR
from pixel_son import PixelSon

s = PixelSon("offre2", seed=151)
W, PH = s.W_, s.PH
at = lambda i, d=0.08: W(i) - d

def bourdon(t0, t1, g=1.0, base=55.0):
    d = t1 - t0; tt = np.arange(int(d * SR)) / SR
    x = np.sin(2*np.pi*base*tt) + 0.8*np.sin(2*np.pi*(base*1.008)*tt) + 0.45*np.sin(2*np.pi*base*1.5*tt) + 0.25*np.sin(2*np.pi*base*2.02*tt)
    x *= 0.6 + 0.4*np.sin(2*np.pi*0.23*tt)                                     # respiration lente
    x += s.LP(s.noise(d), 220) * 1.5
    x *= np.minimum(1, tt/0.6) * np.minimum(1, (d - tt)/0.5)
    s.put(s.mus, x * g * 0.12, t0)
def ventilo(t0, t1, g=1.0):
    d = t1 - t0; x = s.BP(s.noise(d), 400, 1600) * (0.85 + 0.15*np.sin(np.arange(int(d*SR))/SR*2*np.pi*31))
    s.put(s.amb, x * 0.015 * g, t0)
def coeur(t0, t1, g=0.12):
    t = t0
    while t < t1: s.kick(t, g); s.kick(t + 0.24, g * 0.7); t += 1.05
def grésillement(t0, t1, g=1.0):
    d = t1 - t0; tt = np.arange(int(d*SR))/SR
    x = (np.sign(np.sin(2*np.pi*100*tt)) * 0.3 + np.sin(2*np.pi*200*tt) * 0.3) * (0.7 + 0.3*(np.sin(2*np.pi*3.1*tt) > 0.6))
    s.put(s.amb, s.LP(x, 1800) * 0.03 * g, t0)
    t = t0
    while t < t1:
        s.put(s.fx, s.BP(s.noise(0.02), 2000, 8000) * s.env(int(0.02*SR), 0.0005, 0.006), t, 0.03); t += s.rng.uniform(0.15, 0.9)
def vent(t0, t1, g=1.0):
    d = t1 - t0; tt = np.arange(int(d*SR))/SR
    s.put(s.amb, s.BP(s.noise(d), 180, 900) * (0.5 + 0.5*np.sin(2*np.pi*0.11*tt + 1)) * 0.05 * g, t0)

# accroche → MyMotiv : bourdon + ventilateur
bourdon(0.0, at(97) - 0.45, 1.0); ventilo(0.0, PH(6)[0], 1.0)
s.glitch(0.0, 0.12, 0.05)
coeur(PH(1)[0], PH(2)[0] - 0.2)
s.put(s.fx, s.square(1046.5, 0.25, 0.5, 0.2), at(38), 0.03); s.put(s.fx, s.square(1108.7, 0.25, 0.5, 0.2), at(38) + 0.02, 0.025)  # ding faux
for i in (41, 42, 44): s.ppop(at(i), 0.025)
s.typer(at(58), 6, 0.01); s.riseblips(at(64), 8, 500, 1.08, 0.16, 0.012); s.ping(at(73), 0.02)
for i in (82, 83): s.ppop(at(i), 0.02)
s.glitch(at(86), 0.4, 0.08)
for i in (89, 92): s.put(s.fx, s.tri(110, 0.6, 0.4), at(i), 0.06)
# silence complet juste avant « ne prévenir personne », puis le bourdon revient plus grave
s.impact(at(97), 0.16); bourdon(at(97), PH(8)[0] - 0.1, 1.1, base=49.0)
for t in (PH(5)[0], at(109), at(112)): s.click(t, 0.12)                                              # zoom par paliers
# le téléphone
s.buzz(at(123), 3, 0.16)
d = PH(7)[1] - PH(7)[0] + 0.3; s.put(s.amb, s.BP(s.noise(d), 2000, 4000) * 0.01, PH(7)[0] - 0.1)    # souffle de ligne
# « elle n'a encore rien envoyé » : silence total (le bourdon s'est arrêté), puis une note grave tenue
bourdon(PH(9)[0] - 0.2, PH(10)[0], 1.0, base=41.0)
d = PH(9)[1] - PH(9)[0] + 0.4; s.put(s.amb, s.BP(s.noise(d), 2000, 4000) * 0.01, PH(9)[0] - 0.1)
# la recherche, le bâtiment, la nuit
s.typer(PH(10)[0], 10, 0.012); s.buzzer(at(152), 0.02)
grésillement(at(156), PH(12)[0] - 0.1, 1.0); vent(at(156), PH(12)[0] - 0.1, 1.0)
s.put(s.fx, s.tri(55, 1.2, 0.8), at(172), 0.09)                                                       # quelqu'un est là
# sursaut : la silhouette tourne la tête (deux yeux rouges, 0,3 s)
SURSAUT = at(179)
s.impact(SURSAUT, 0.28); s.glitch(SURSAUT, 0.3, 0.12)
for f in (1480, 1567, 1661): s.put(s.fx, s.square(f, 0.3, 0.5, 0.25), SURSAUT, 0.03)
# le lendemain matin : le téléphone vibre, « Merci d'être venue, Camille », puis silence total
s.buzz(at(185), 2, 0.15)
d = PH(13)[1] - PH(13)[0] + 0.3; s.put(s.amb, s.BP(s.noise(d), 2000, 4000) * 0.01, PH(13)[0] - 0.1)
bourdon(PH(12)[0], PH(13)[1] + 0.1, 0.9, base=46.0)
s.impact(PH(14)[0] - 0.05, 0.14)                                                                   # « elle n'y est jamais allée »
# la leçon : une note claire
s.put(s.mus, s.tone(880, 2.0, 0.02, 1.2) + 0.5 * s.tone(1320, 2.0, 0.02, 1.0), PH(15)[0], 0.05)
# le CTA à théories : le bourdon revient, sons du CTA très bas
bourdon(PH(16)[0], s.DUR, 0.8, base=55.0)
s.ping(at(225), 0.02); s.chime(at(240), 0.02, (1046.5, 1318.5, 1568)); s.ppop(at(243), 0.025, True)
s.mix(mus_g=0.18, fx_g=1.4, amb_g=0.8, duck=0.6)
