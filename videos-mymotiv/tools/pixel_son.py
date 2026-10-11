# Boîte à sons « pixel » (format « Le faux DM ») : instruments 8 bits adoucis, morceau en double-croches,
# bruitages (notification, bips de texte, tampon, buzzer, glitch…). Utilisé par synth_fauxdm.py et synth_fauxdm30.py.
import numpy as np
from histoire_son import Son, SR


class PixelSon(Son):
    # ─── instruments 8 bits (adoucis) ───
    def square(self, f, d, duty=0.5, dec=0.25, a=0.004):
        t = np.arange(int(d*SR))/SR
        x = np.where((t*f) % 1 < duty, 1.0, -1.0)
        return self.LP(x, 2600)*self.env(len(t), a, dec)
    @staticmethod
    def tri(f, d, dec=0.6):
        t = np.arange(int(d*SR))/SR
        return (2*np.abs(2*((t*f) % 1) - 1) - 1)*np.minimum(1, t/0.004)*np.minimum(1, (d - t)/0.02)*np.exp(-t/dec)
    def hat(self, at_, g=0.02):
        self.put(self.mus, self.HP(self.noise(0.04), 6000)*self.env(int(0.04*SR), 0.0005, 0.012), at_, g, 0.2)
    def kick(self, at_, g=0.18):
        d = 0.22; f = np.geomspace(140, 45, int(d*SR))
        self.put(self.mus, np.sin(2*np.pi*np.cumsum(f)/SR)*self.env(len(f), 0.002, 0.08), at_, g)

    def section(self, t0, t1, chords, beat, g=1.0, kicks=True, hats=True, arp=True, lead=None):
        """chords : liste d'accords MIDI (fondamentale en premier), un accord par mesure de 4 temps."""
        mt = self.mtof; t, k = t0, 0
        while t < t1 - 0.05:
            ch = chords[(k // 16) % len(chords)]               # k = double-croche
            step = k % 16
            if step % 4 == 0 and kicks and step in (0, 8): self.kick(t, 0.16*g)
            if step % 2 == 0: self.put(self.mus, self.tri(mt(ch[0] - 12), beat/2*0.95, 0.5), t, 0.10*g)     # basse en croches
            if hats and step % 4 == 2: self.hat(t, 0.025*g)
            if arp: self.put(self.mus, self.square(mt(ch[step % len(ch)] + 12), beat/4*0.9, 0.25, 0.08), t, 0.020*g, 0.3 if step % 2 else -0.3)
            if lead and step == 0:
                for j, (n, dd) in enumerate(lead[(k // 16) % len(lead)]):
                    self.put(self.mus, self.square(mt(n), dd*beat, 0.5, 0.5, 0.01), t + j*beat, 0.026*g)
            t += beat/4; k += 1

    # ─── bruitages ───
    def ping(self, t, g=0.06):                       # notification « message reçu »
        self.put(self.fx, self.square(988, 0.09, 0.5, 0.05), t, g); self.put(self.fx, self.square(1319, 0.18, 0.5, 0.08), t + 0.08, g)
    def ppop(self, t, g=0.04, hi=False): self.pop(t, 700 if hi else 420, 1500 if hi else 900, g, self.rng.uniform(-0.3, 0.3))
    def typer(self, t0, n=8, g=0.012):               # texte qui s'écrit (bips de dialogue)
        for k in range(n): self.put(self.fx, self.square(1700 + 120*(k % 3), 0.025, 0.5, 0.012), t0 + k*0.06, g)
    def stamp(self, t, g=0.2):                       # tampon / coup sourd
        self.put(self.fx, self.LP(self.noise(0.12), 500)*self.env(int(0.12*SR), 0.001, 0.04), t, g)
        f = np.geomspace(160, 50, int(0.18*SR)); self.put(self.fx, np.sin(2*np.pi*np.cumsum(f)/SR)*self.env(len(f), 0.001, 0.06), t, g*0.8)
    def buzzer(self, t, g=0.05):
        for k in range(2): self.put(self.fx, self.square(140, 0.16, 0.5, 0.3), t + k*0.2, g)
    def riseblips(self, t, n=8, f0=600, step=1.12, dt=0.06, g=0.02):
        for k in range(n): self.put(self.fx, self.square(f0*step**k, 0.05, 0.5, 0.03), t + k*dt, g)
    def impact(self, t, g=0.32):
        f = np.geomspace(110, 30, int(0.9*SR)); self.put(self.fx, np.sin(2*np.pi*np.cumsum(f)/SR)*self.env(len(f), 0.002, 0.35), t, g)
        self.put(self.fx, self.LP(self.noise(0.5), 2500)*self.env(int(0.5*SR), 0.001, 0.12), t, g*0.35)
    def glitch(self, t, d=0.35, g=0.09):             # bruit « bitcrush » haché
        n = int(d*SR); x = self.noise(d); hold = np.repeat(x[::90], 90)[:n]
        gate = (np.sin(np.arange(n)/SR*2*np.pi*23) > -0.2).astype(float)
        self.put(self.fx, self.BP(hold, 200, 6000)*gate*np.exp(-np.arange(n)/SR/0.25), t, g)
    def click(self, t, g=0.08): self.put(self.fx, self.BP(self.noise(0.015), 1500, 6000)*self.env(int(0.015*SR), 0.0003, 0.004), t, g)
    def tapestop(self, t_end, g=0.05):             # « disque qui s'arrête » juste avant t_end
        n = int(0.35*SR); self.put(self.fx, np.sin(2*np.pi*np.cumsum(np.geomspace(700, 60, n))/SR)*np.linspace(1, 0, n), t_end - 0.33, g)

    # ─── musique type des pubs « effet psycho » (PremiereLigne, Ancrage, Miroir, Recence) ───
    def pub(self, creux0, creux1, c0, t_fin, beat=0.55):
        """A tendu (la mineur) jusqu'à creux0 ; creux (basse + tic-tac) jusqu'à creux1 ; B jusqu'à c0 ; C majeur avec
        mélodie jusqu'à la fin ; accord tenu et ritournelle à t_fin + 0,4 s."""
        mt = self.mtof
        A = [[57, 60, 64, 69], [53, 57, 60, 65], [50, 53, 57, 62], [52, 56, 59, 64]]          # Am F Dm E
        B = [[57, 60, 64], [55, 59, 62], [53, 57, 60], [55, 59, 62]]                           # Am G F G
        C = [[60, 64, 67, 72], [55, 59, 62, 67], [57, 60, 64, 69], [53, 57, 60, 65]]          # C G Am F
        lead = [[(76, 1), (79, 1), (84, 2)], [(83, 2), (79, 2)], [(81, 1), (84, 1), (88, 2)], [(84, 3), (81, 1)]]
        self.section(0.05, creux0 - 0.1, A, beat, g=0.85)
        for k in range(int((creux1 - creux0)/beat)):
            t = creux0 + k*beat
            self.hat(t, 0.025)
            if k % 2 == 0: self.put(self.mus, self.tri(mt(33), beat*0.9, 0.4), t, 0.08)
        self.section(creux1 - 0.05, c0 - 0.1, B, beat, g=0.85)
        self.section(c0 - 0.1, self.DUR - 1.2, C, beat, g=0.85, lead=lead)
        self.pad(self.DUR - 1.6, self.DUR, [60, 64, 67, 72], g=1.2)
        for j, n in enumerate([72, 76, 79, 84]): self.put(self.mus, self.square(mt(n), 0.25, 0.5, 0.15), t_fin + 0.4 + j*0.11, 0.05)

    def cta(self, aOffre, aBio, aWin, aType):                # fin commune : offre, bio, fenêtre « commentaire » qui se remplit
        self.chime(aOffre, 0.04, (1046.5, 1318.5, 1568)); self.ppop(aBio, 0.05, True); self.ping(aWin, 0.04)
        for k in range(10): self.put(self.fx, self.square(1500 + 80*(k % 3), 0.03, 0.5, 0.015), aType + k/8, 0.012)
