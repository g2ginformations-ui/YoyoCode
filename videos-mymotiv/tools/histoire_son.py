# Boîte à sons des histoires « Motiv » (3D, la nuit) : ambiance de chambre et de ville, piano électrique doux,
# bruitages (clavier, hologramme qui s'allume, glissement, carillon, vibration de téléphone…), mixage avec la voix.
# Utilisé par synth_nom.py et synth_nuit.py.
import json, os, subprocess, sys, wave
import numpy as np
from scipy.signal import butter, sosfilt, lfilter
import imageio_ffmpeg
FF = imageio_ffmpeg.get_ffmpeg_exe(); SR = 48000


class Son:
    def __init__(self, nom: str, seed: int = 5):
        self.nom = nom; self.rng = np.random.default_rng(seed)
        self.V = json.load(open(f"src/data/{nom}-voix.json")); self.DUR = self.V["duration"]; self.N = int(SR*self.DUR)
        self.mus = np.zeros((self.N, 2)); self.fx = np.zeros((self.N, 2)); self.amb = np.zeros((self.N, 2))
        sys.path.insert(0, "tools"); from sfx_lib import Whooshes
        self.W = Whooshes(SR)

    # ─── outils ───
    def W_(self, i): return next(m["t0"] for m in self.V["mots"] if m["i"] == i)
    def PH(self, k): p = self.V["phrases"][k]; return p["t0"], p["t1"]
    def noise(self, d): return self.rng.standard_normal(int(d*SR))
    @staticmethod
    def LP(s, c): a = np.exp(-2*np.pi*c/SR); return lfilter([1-a], [1, -a], s)
    def HP(self, s, c): return s - self.LP(s, c)
    @staticmethod
    def BP(s, lo, hi): return sosfilt(butter(2, [lo, hi], "bp", fs=SR, output="sos"), s)
    @staticmethod
    def env(n, a, d): t = np.arange(n)/SR; return np.minimum(1, t/max(a, 1e-4))*np.exp(-t/max(d, 1e-4))
    @staticmethod
    def tone(f, d, a=0.005, dec=0.5): t = np.arange(int(d*SR))/SR; return np.sin(2*np.pi*f*t)*Son.env(len(t), a, dec)
    @staticmethod
    def sweep(f0, f1, d): f = np.geomspace(f0, f1, int(d*SR)); return np.sin(2*np.pi*np.cumsum(f)/SR)
    mtof = staticmethod(lambda m: 440*2**((m - 69)/12))
    def put(self, buf, s, at, g=1.0, pan=0.0):
        i = int(at*SR)
        if i < 0: s = s[-i:]; i = 0
        j = min(self.N, i + len(s))
        if j > i: buf[i:j, 0] += s[:j-i]*g*(1 - max(0, pan)); buf[i:j, 1] += s[:j-i]*g*(1 + min(0, pan))

    # ─── ambiance : souffle de la pièce, rumeur de la ville, voitures au loin ───
    def ambiance(self, t0=0.0, t1=None, g=1.0):
        t1 = t1 or self.DUR; d = t1 - t0
        room = self.LP(self.noise(d), 300)*0.5 + self.LP(self.noise(d), 900)*0.15
        city = self.BP(self.noise(d), 80, 400)*(0.6 + 0.4*np.sin(np.arange(int(d*SR))/SR*0.31))
        for c in range(2): self.put(self.amb, (room*0.012 + city*0.02)*g, t0, 1.0, (-0.3, 0.3)[c])
        t = t0 + 3.0
        while t < t1 - 2:                                                    # voiture qui passe au loin
            dd = 3.5; x = self.BP(self.noise(dd), 150, 900)*np.sin(np.linspace(0, np.pi, int(dd*SR)))**2
            self.put(self.amb, x*0.03*g, t, 1.0, self.rng.uniform(-0.6, 0.6)); t += self.rng.uniform(7, 12)

    # ─── musique : piano électrique feutré, nappe, contrebasse douce ───
    def epiano(self, f, d=2.0, bright=1.0):
        t = np.arange(int(d*SR))/SR
        return np.sin(2*np.pi*f*t + bright*1.1*np.exp(-t*5)*np.sin(2*np.pi*f*2*t))*np.exp(-t*1.4)*np.minimum(1, t/0.006)
    def piano(self, t0, t1, chords, beat=0.83, g=1.0, arp=True, bass=True):
        t = t0; k = 0
        while t < t1 - 0.2:
            ch = chords[(k // 4) % len(chords)]
            if k % 4 == 0:
                for j, m in enumerate(ch): self.put(self.mus, self.epiano(self.mtof(m), 3.2, 0.8), t + j*0.025, 0.05*g, (j - 1.5)*0.25)
                if bass: self.put(self.mus, self.LP(self.tone(self.mtof(ch[0] - 24), 3.0, 0.02, 1.2), 400), t, 0.12*g)
            if arp and k % 2 == 1: self.put(self.mus, self.epiano(self.mtof(ch[(k // 2) % len(ch)] + 12), 1.6, 0.5), t, 0.025*g, 0.4 if k % 4 == 1 else -0.4)
            t += beat; k += 1
    def pad(self, t0, t1, notes, g=1.0):
        d = t1 - t0; tt = np.arange(int(d*SR))/SR; x = np.zeros(len(tt))
        for m in notes:
            f = self.mtof(m); x += np.sin(2*np.pi*f*tt) + 0.4*np.sin(2*np.pi*f*1.003*tt + 1) + 0.2*np.sin(2*np.pi*f*2.001*tt)
        x = self.LP(x, 1400)*np.minimum(1, tt/1.2)*np.minimum(1, (d - tt)/1.2)
        self.put(self.mus, x*0.012*g, t0, 1.0)

    # ─── bruitages ───
    def key(self, at, g=0.05): self.put(self.fx, self.BP(self.noise(0.025), 1800, 7000)*self.env(int(0.025*SR), 0.0005, 0.006), at, g, self.rng.uniform(-0.3, 0.3))
    def typing(self, t0, t1, g=0.05):
        t = t0
        while t < t1: self.key(t, g*self.rng.uniform(0.6, 1.1)); t += self.rng.uniform(0.07, 0.16)
    def shimmer(self, at, g=0.05, up=True):                                  # hologramme qui s'allume
        for i in range(14):
            f = (900 + i*180) if up else (3400 - i*180)
            self.put(self.fx, self.tone(f, 0.5, 0.004, 0.15) + 0.3*self.tone(f*1.5, 0.5, 0.004, 0.1), at + i*0.025, g*(0.6 + 0.4*np.sin(i)), (i % 3 - 1)*0.3)
        self.put(self.fx, self.sweep(300, 1400 if up else 250, 0.4)*self.env(int(0.4*SR), 0.05, 0.15), at, g*0.6)
    def blip(self, at, f=1200, g=0.05): self.put(self.fx, self.tone(f, 0.12, 0.002, 0.04) + 0.4*self.tone(f*2, 0.12, 0.002, 0.03), at, g)
    def pop(self, at, f0=500, f1=1100, g=0.06, pan=0.0): self.put(self.fx, self.sweep(f0, f1, 0.08)*self.env(int(0.08*SR), 0.002, 0.03), at, g, pan)
    def chime(self, at, g=0.05, notes=(1318.5, 1760, 2093)):
        for i, f in enumerate(notes): self.put(self.fx, self.tone(f, 1.6, 0.004, 0.55) + 0.25*self.tone(2*f, 1.6, 0.004, 0.35), at + i*0.07, g)
    def paper(self, at, g=0.06): self.put(self.fx, self.BP(self.noise(0.3), 1200, 7000)*self.env(int(0.3*SR), 0.02, 0.08), at, g)
    def whoosh(self, at, kind="Court", g=0.12): self.W.place(lambda s, a, gg: self.put(self.fx, s, a, gg), at, kind, g)
    def buzz(self, at, n=2, g=0.12):                                         # téléphone qui vibre sur le bois
        for k in range(n):
            d = 0.35; t = np.arange(int(d*SR))/SR
            x = np.sign(np.sin(2*np.pi*170*t))*0.5 + np.sin(2*np.pi*85*t)
            self.put(self.fx, self.LP(x, 900)*np.minimum(1, t/0.01)*np.minimum(1, (d - t)/0.03), at + k*0.55, g)
    def creak(self, at, g=0.05):                                             # chaise qui grince
        d = 0.5; t = np.arange(int(d*SR))/SR; f = 240 + 60*np.sin(2*np.pi*3*t)
        x = np.sin(2*np.pi*np.cumsum(f)/SR)*(0.5 + 0.5*np.sign(np.sin(2*np.pi*38*t)))
        self.put(self.fx, self.BP(x, 300, 2500)*np.sin(np.pi*t/d), at, g)
    def steps(self, t0, n=4, g=0.06, dt=0.5):
        for k in range(n): self.put(self.fx, self.LP(self.noise(0.08), 600)*self.env(int(0.08*SR), 0.002, 0.03), t0 + k*dt, g*(1 - k*0.15), -0.3 - k*0.15)

    # ─── mixage ───
    def mix(self, mus_g=0.55, fx_g=1.6, amb_g=1.0, duck=0.55):
        with wave.open(f"public/audio/{self.nom}-voix.wav") as w_:
            vv = np.frombuffer(w_.readframes(w_.getnframes()), dtype=np.int16).astype(float)/32768
        voice = np.zeros(self.N); voice[:min(self.N, len(vv))] = vv[:self.N]
        hop = int(0.01*SR); e = np.array([np.sqrt(np.mean(voice[i:i+hop]**2)) for i in range(0, self.N, hop)])
        on = np.clip(np.convolve((e > 0.02).astype(float), np.ones(30)/30, "same")*3, 0, 1)
        dk = (1 - duck*np.repeat(on, hop)[:self.N])[:, None]
        mus = self.mus/(np.max(np.abs(self.mus)) + 1e-9)
        out = mus*mus_g*dk + self.fx*fx_g + self.amb*amb_g + np.stack([voice, voice], 1)*0.95
        von = np.repeat(on, hop)[:self.N] > 0.9
        rms = lambda a: 20*np.log10(np.sqrt(np.mean(a**2)) + 1e-9)
        print(f"voix {rms(voice[von]*0.95):.1f} dB · musique sous la voix {rms((mus*mus_g*dk)[von, 0]):.1f} dB")
        out[-int(0.8*SR):] *= np.linspace(1, 0, int(0.8*SR))[:, None]**1.5
        out /= np.max(np.abs(out))*1.05
        raw = f"public/audio/{self.nom}-brut.wav"
        with wave.open(raw, "wb") as wf:
            wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR); wf.writeframes((out*32767).astype(np.int16).tobytes())
        subprocess.run([FF, "-v", "error", "-y", "-i", raw, "-af", "loudnorm=I=-14:TP=-1:LRA=11,alimiter=limit=0.89:level=false", "-ar", str(SR), f"public/audio/{self.nom}.wav"], check=True)
        os.remove(raw); print("audio ok")
