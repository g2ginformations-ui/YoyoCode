# Outils de son des pubs motion design avec voix (AvantApres, ZeroExcuse, VraiPrix) : la musique de l'utilisateur
# (public/audio/apres-midi-fond.mp3, percussions à 18,9 s du fichier) calée sur le moment fort, étouffée avant ; feutre ;
# frappe ; impact. S'utilise avec PixelSon (tools/pixel_son.py), qui fait le mixage avec la voix.
import subprocess
import numpy as np
from scipy.signal import butter, sosfilt
from histoire_son import FF, SR

def decode(path, ch=2):
    out = subprocess.run([FF, "-v", "error", "-i", path, "-ac", str(ch), "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(out, dtype=np.float32).astype(float).reshape(-1, ch)

def musique_utilisateur(s, t_fort, ouverture=None):
    """Place la musique pour que ses percussions tombent sur t_fort ; avant, elle est étouffée (passe-bas 600 Hz).
    ouverture : liste [(t, k)] (0 = étouffée, 1 = claire) pour refermer / rouvrir ailleurs."""
    m = decode("public/audio/apres-midi-fond.mp3")
    debut = 18.9 - t_fort
    if debut >= 0: m = m[int(debut*SR):]
    else: m = np.concatenate([np.zeros((int(-debut*SR), 2)), m])
    y = np.zeros((s.N, 2)); n = min(s.N, len(m)); y[:n] = m[:n]
    muf = sosfilt(butter(2, 600, "lp", fs=SR, output="sos"), y, axis=0)
    x = np.arange(s.N)/SR
    pts = ouverture or [(0, 0.12), (t_fort - 0.01, 0.12), (t_fort, 1.0)]
    k = np.interp(x, [p[0] for p in pts], [p[1] for p in pts])[:, None]
    y = muf*(1 - k)*1.3 + y*k
    y *= np.clip(x/0.15, 0, 1)[:, None]
    s.mus += y

def feutre(s, at, d=0.32, g=0.05):                 # trait de surligneur
    n = int(d*SR); x = s.BP(s.noise(d), 1500, 6000)*(0.6 + 0.4*np.sin(np.arange(n)/SR*2*np.pi*14))*np.sin(np.linspace(0, np.pi, n))
    s.put(s.fx, x, at, g)

def frappe(s, t0, n, dt=0.03, g=0.04):            # clavier
    for i in range(n): s.key(t0 + i*dt, g)
