# Bande-son de « Les Super-recrues · Épisode 2 : Le SuperCommercial » (src/EpisodeCommercial.tsx) : voix (voix-commercial.json)
# + jazz de film noir fabriqué ici (contrebasse qui marche, balais, cymbale ride, piano mineur, cuivres en sourdine) :
# intro mystérieuse sur la ville, fanfare du titre, swing léger pendant l'entretien, coupure pour l'interrogatoire (ampoule
# qui grésille, coups de tampon), machine à écrire sur la lettre, trombone triste sur « On vous rappellera », pluie et piano
# de nuit pour MyMotiv, swing plus franc pour l'embauche, final big band avec le signal « mm. ».
import sys; sys.path.insert(0, "tools")
import numpy as np
from histoire_son import Son, SR
s = Son("commercial", seed=29); W, PH = s.W_, s.PH
T = dict(commercial=W(8), budget=W(45), decideur=W(46), besoin=W(47), delai=W(48), rapide=W(60), jamais=W(66), vous=W(67), vigile=W(73),
         rappellera=W(92), cv=W(99), s30=W(102), lettre2=W(105), clients=W(110), delais=W(113), metier=W(116), lundi=W(129), soir=W(133),
         patrouille=W(140), cagoule=W(143), mission=W(152), offerte=W(163), end=PH(15)[1])
S = dict(title=PH(1)[1] + 0.12, interview=PH(2)[0] - 0.12, interro=PH(5)[0] - 0.14, ots3=PH(6)[0] - 0.12, letter=PH(7)[0] - 0.12,
         surpris=T["vous"] - 0.12, nuit=PH(9)[1] + 0.35, site=PH(10)[0] + 0.1, ots4=PH(11)[0] - 0.25, cta=PH(15)[0] - 0.3, endCard=PH(15)[1] + 0.25)
mf = s.mtof; rng = s.rng

# ─── instruments ───
def upright(f, d=0.5):                                                      # contrebasse pincée
    t = np.arange(int(d*SR))/SR
    x = np.sin(2*np.pi*f*t) + 0.35*np.sin(2*np.pi*2*f*t)*np.exp(-t*8) + 0.15*np.sin(2*np.pi*3*f*t)*np.exp(-t*14)
    return s.LP(x*np.minimum(1, t/0.004)*np.exp(-t*3.2), 900)
def brush(d=0.25): n = s.noise(d); t = np.arange(len(n))/SR; return s.BP(n, 2500, 9000)*np.minimum(1, t/0.03)*np.exp(-t*9)
def ride(): n = s.noise(0.6); t = np.arange(len(n))/SR; return (s.HP(n, 6000)*0.6 + 0.4*np.sin(2*np.pi*5200*t)*s.noise(0.6)*0.2)*np.exp(-t*5)
def kick(): t = np.arange(int(0.25*SR))/SR; return np.sin(2*np.pi*np.cumsum(np.geomspace(90, 45, len(t)))/SR)*np.exp(-t*14)
def horn(f, d=0.6, mute=1.0, bend=0.0):                                     # cuivre en sourdine (scie filtrée, vibrato)
    t = np.arange(int(d*SR))/SR; ff = f*(1 + 0.006*np.sin(2*np.pi*5.5*t)*np.minimum(1, t/0.25)) * (1 + bend*t/d)
    ph = 2*np.pi*np.cumsum(ff)/SR; x = sum(np.sin(k*ph)/k for k in range(1, 9))
    x = s.LP(x, 1400*mute + 400)*np.minimum(1, t/0.03)*np.minimum(1, (d - t)/0.08)
    return x
def chord_piano(notes, at, g=0.05, d=2.0):
    for j, m in enumerate(notes): s.put(s.mus, s.epiano(mf(m), d, 0.6), at + j*0.012, g, (j - 1.5)*0.25)

def swing(t0, t1, beat, prog, g=1.0, drums=True, piano=True):
    t = t0; k = 0
    while t < t1 - 0.05:
        ch = prog[(k // 4) % len(prog)]; root = ch[0] - 24
        walk = [root, root + 4, root + 7, root + 9][k % 4] if k % 4 else root
        s.put(s.mus, upright(mf(walk), beat*0.95), t, 0.32*g)
        if drums:
            s.put(s.mus, ride(), t, 0.05*g, 0.3)
            s.put(s.mus, ride(), t + beat*0.66, 0.035*g, 0.3)                # croche swing
            if k % 2 == 1: s.put(s.mus, brush(), t, 0.06*g, -0.2)
            if k % 4 == 0: s.put(s.mus, kick(), t, 0.12*g)
        if piano and k % 4 == 0: chord_piano(ch, t + beat*0.66, 0.035*g, 1.6)
        if piano and k % 4 == 2: chord_piano(ch, t + beat*0.66, 0.025*g, 0.8)
        t += beat; k += 1

NOIR = [[50, 53, 57, 60], [55, 58, 62, 65], [45, 49, 52, 55], [50, 53, 57, 60]]      # Ré m7, Sol m7, La 7, Ré m7
BEAT = 60/92

# ─── 1. la ville (intro mystérieuse) ───
s.ambiance(0, S["title"], 0.9)
s.pad(0.0, S["title"] + 0.3, [38, 45, 50, 53], 1.0)
swing(0.6, S["title"] - 0.1, BEAT, NOIR, 0.55, drums=True, piano=False)
for i, (m, d) in enumerate([(69, 0.5), (72, 0.35), (70, 0.6), (69, 1.1)]):         # phrase de trompette bouchée
    s.put(s.mus, horn(mf(m), d, 0.6), 0.9 + [0, 0.55, 0.95, 1.6][i], 0.05)
s.whoosh(T["commercial"] - 0.3, "MoyenSourd", 0.13)
# ─── 2. le titre : fanfare ───
s.whoosh(S["title"], "Long", 0.16)
for i, at in enumerate([S["title"] + 0.05, S["title"] + 0.3, S["title"] + 0.6]):
    for m in ([50, 57, 62, 65] if i < 2 else [50, 57, 62, 66, 69]):
        s.put(s.mus, horn(mf(m), 0.22 if i < 2 else 0.8, 1.0), at, 0.045)
    s.put(s.mus, kick(), at, 0.25)
# ─── 3. l'entretien : swing léger ───
INT = [[48, 52, 55, 59], [45, 48, 52, 55], [50, 53, 57, 60], [43, 47, 50, 53]]       # Do maj7, La m7, Ré m7, Sol 7
swing(S["interview"], S["interro"] - 0.05, BEAT*0.85, INT, 0.6)
# interrogatoire : ampoule qui grésille, tampons
d = S["ots3"] - S["interro"] + 0.5; tt = np.arange(int(d*SR))/SR
hum = (np.sin(2*np.pi*100*tt) + 0.5*np.sin(2*np.pi*200*tt))*(0.6 + 0.4*(s.noise(d) > 1.6))
s.put(s.fx, hum*0.012, S["interro"])
for k in ("budget", "decideur", "besoin", "delai"):
    s.put(s.fx, s.LP(s.noise(0.15), 700)*s.env(int(0.15*SR), 0.001, 0.04), T[k] - 0.02, 0.35); s.put(s.fx, kick(), T[k] - 0.02, 0.4)
swing(S["ots3"], S["letter"], BEAT*0.85, INT, 0.45, piano=False)
# la lettre : machine à écrire
for (a, b) in ((T["rapide"] - 0.35, T["rapide"] + 0.15), (T["rapide"] + 0.55, T["rapide"] + 0.85), (T["jamais"] - 0.55, T["jamais"] + 0.25)):
    t = a
    while t < b: s.put(s.fx, s.BP(s.noise(0.03), 900, 5000)*s.env(int(0.03*SR), 0.0005, 0.01), t, 0.12); t += rng.uniform(0.07, 0.11)
s.chime(T["jamais"] + 0.3, 0.02, (2093,))
swing(S["surpris"], S["nuit"] - 0.6, BEAT*0.85, INT, 0.45)
# « On vous rappellera » : trombone triste
for i, (m, d) in enumerate([(58, 0.32), (57, 0.32), (56, 0.32), (55, 1.1)]):
    s.put(s.mus, horn(mf(m - 12), d, 0.8, bend=-0.04 if i == 3 else 0), T["rappellera"] + 0.35 + i*0.36, 0.09)
# ─── 4. la nuit : pluie, piano, MyMotiv ───
d = S["ots4"] - S["nuit"]
rain = s.BP(s.noise(d), 1500, 9000)*0.03 + s.LP(s.noise(d), 500)*0.02
s.put(s.amb, rain*np.minimum(1, np.arange(len(rain))/SR/0.5)*np.minimum(1, (d - np.arange(len(rain))/SR)/0.4), S["nuit"])
s.piano(S["nuit"], S["ots4"], [[50, 57, 60, 65], [46, 53, 57, 62], [48, 55, 58, 64], [45, 52, 55, 60]], 0.9, 0.8)
s.shimmer(S["site"], 0.06); s.pop(T["cv"] - 0.15, 600, 1300, 0.05)
for i in range(14): s.key(T["s30"] + i*0.07, 0.03)
s.chime(T["lettre2"] - 0.1, 0.05)
for k in ("clients", "delais", "metier"): s.pop(T[k] - 0.12, 700, 1500, 0.07)
# ─── 5. l'embauche : swing plus franc ───
UP = [[48, 52, 55, 59, 62], [45, 48, 52, 55], [41, 45, 48, 52], [43, 47, 50, 53]]
swing(S["ots4"], S["cta"] - 0.1, BEAT*0.75, UP, 0.75)
for m in (60, 64, 67, 72): s.put(s.mus, horn(mf(m), 0.5, 1.0), T["lundi"] + 0.05, 0.05)       # « Vous commencez lundi »
s.put(s.mus, kick(), T["lundi"] + 0.05, 0.3)
for i, m in enumerate((67, 64)): s.put(s.mus, horn(mf(m), 0.25, 0.7), T["patrouille"] + 0.35 + i*0.28, 0.05)
s.pop(T["cagoule"] - 0.1, 420, 300, 0.07)
# ─── 6. final big band ───
for i in range(6): s.put(s.mus, kick() if i % 2 == 0 else brush(0.2)*2, S["cta"] - 0.6 + i*0.1, 0.18)   # roulement
s.whoosh(S["cta"], "Long", 0.14)
FIN = [[50, 57, 62, 66, 69], [55, 59, 62, 67], [57, 61, 64, 69], [50, 57, 62, 66, 69]]
swing(S["cta"], s.DUR, BEAT*0.75, FIN, 0.9)
for at, notes in ((S["cta"] + 0.02, [62, 66, 69, 74]), (T["offerte"] + 0.1, [62, 66, 69, 74, 78])):
    for m in notes: s.put(s.mus, horn(mf(m), 0.7, 1.0), at, 0.045)
s.chime(S["endCard"] + 0.1, 0.05, (1174.7, 1480, 1760, 2349))
s.mix(mus_g=0.55, fx_g=1.4, amb_g=1.0)
