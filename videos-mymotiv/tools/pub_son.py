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

def groove(s, t0, t1, beat, chords, g=1.0, stabs=True):
    """Beat pop percutant : grosse caisse sur chaque temps, clap sur 2 et 4, charleston en croches, basse et accords plaqués."""
    t = t0; k = 0
    while t < t1 - 0.05:
        s.kick(t, 0.16*g)
        if k % 2 == 1: s.put(s.mus, s.BP(s.noise(0.14), 900, 4000)*s.env(int(0.14*SR), 0.001, 0.05), t, 0.10*g)
        s.hat(t + beat/2, 0.022*g)
        ch = chords[(k // 4) % len(chords)]
        s.put(s.mus, s.LP(s.tone(s.mtof(ch[0] - 24), beat*0.9, 0.005, 0.25), 300), t, 0.25*g)
        if stabs and k % 4 == 0:
            for j, m in enumerate(ch): s.put(s.mus, s.epiano(s.mtof(m), 1.6, 1.0), t + j*0.01, 0.035*g, (j - 1.5)*0.3)
        t += beat; k += 1

def claque(s, at, g=1.0):                          # un mot géant qui claque
    s.impact(at, 0.16*g); s.put(s.fx, s.BP(s.noise(0.08), 1500, 7000)*s.env(int(0.08*SR), 0.0005, 0.02), at, 0.08*g)

def signature(s, at, g=0.05):
    """Signature sonore MyMotiv (à garder IDENTIQUE dans toutes les vidéos, sur l'écran de fin / le logo) : do-mi-sol
    aigus égrenés (1046,5 · 1318,5 · 1568 Hz) puis l'accord tenu, avec un léger scintillement. La répétition du même son
    au même moment de chaque vidéo est ce qui le relie à la marque dans la mémoire."""
    for i, f in enumerate((1046.5, 1318.5, 1568)):
        s.put(s.fx, s.tone(f, 0.9, 0.003, 0.35) + 0.25*s.tone(2*f, 0.9, 0.003, 0.2), at + i*0.09, g)
    for f in (1046.5, 1318.5, 1568, 2093): s.put(s.fx, s.tone(f, 1.8, 0.02, 0.8), at + 0.3, g*0.35)
    s.put(s.fx, s.HP(s.noise(0.6), 7000)*s.env(int(0.6*SR), 0.05, 0.2), at + 0.25, g*0.25)
