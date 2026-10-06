# Bruitages réels de public/sfx/ (voir public/sfx/catalogue.json) pour les scripts synth_*.py.
#   from sfx_lib import Whooshes ; W = Whooshes(SR) ; W.place(add, t_pic, "MoyenSourd", gain)
# place() cale le PIC du son sur t_pic (l'action à l'image), et alterne les sons d'un même type pour éviter la répétition.
# Types : Court (pic ≈ 0,45 s, petits mouvements), MoyenSourd / MoyenClair (transitions de caméra, cartes),
#         Long (flash, révélation, écran de fin : longue traîne).
import json, os, subprocess
import numpy as np
import imageio_ffmpeg

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "sfx")


class Whooshes:
    def __init__(self, sr: int):
        self.sr = sr
        self.cat = json.load(open(os.path.join(ROOT, "catalogue.json")))["sons"]
        self.cache: dict = {}
        self.turn: dict = {}

    def _load(self, name: str) -> np.ndarray:
        if name not in self.cache:
            raw = subprocess.run([imageio_ffmpeg.get_ffmpeg_exe(), "-v", "error", "-i", os.path.join(ROOT, name), "-ac", "1",
                                  "-ar", str(self.sr), "-f", "f32le", "-"], capture_output=True, check=True).stdout
            x = np.frombuffer(raw, dtype=np.float32).astype(float)
            self.cache[name] = x / (np.max(np.abs(x)) + 1e-9)   # crête ramenée à 1 : le gain règle le niveau
        return self.cache[name]

    def pick(self, kind: str) -> dict:
        sons = [s for s in self.cat if s["type"] == kind]
        i = self.turn.get(kind, 0); self.turn[kind] = i + 1
        return sons[i % len(sons)]

    def place(self, add, t_peak: float, kind: str = "MoyenSourd", gain: float = 0.2, max_len: float | None = None):
        s = self.pick(kind); x = self._load(s["fichier"])
        if max_len: x = x[:int(max_len*self.sr)] * np.linspace(1, 0, min(len(x), int(max_len*self.sr)))**0.5
        add(x, max(0.0, t_peak - s["pic"]), gain)
