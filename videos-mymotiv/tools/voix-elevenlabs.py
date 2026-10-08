# Voix off ElevenLabs (texte → MP3) pour les vidéos MyMotiv.
# La clé n'est jamais dans le code : elle est ajoutée automatiquement par l'environnement cloud (secret réseau
# « ELEVENLABS_API_KEY », en-tête xi-api-key, réservé à api.elevenlabs.io).
# Usage : python3 tools/voix-elevenlabs.py <script.txt> <sortie.mp3> [--voix ID] [--modele eleven_v4]
#                                          [--stabilite 0.35] [--similarite 0.75] [--par-paragraphe] [--pause 0.4]
#   script.txt : texte avec balises d'émotion v4 ([excited], [whispers], [sighs], [pause]…), un paragraphe par phrase.
#   --par-paragraphe : un appel par paragraphe (plus stable quand il y a beaucoup de [pause]), puis assemblage avec
#                      --pause secondes de silence entre deux paragraphes.
# Voix par défaut : « Hugo - Serious and Professional » (voix française de la bibliothèque du compte).
import argparse, json, os, subprocess, sys, tempfile
import imageio_ffmpeg

API = "https://api.elevenlabs.io/v1"
p = argparse.ArgumentParser()
p.add_argument("script"); p.add_argument("sortie")
p.add_argument("--voix", default="DbbNuBL7lf62XwY7arQb")
p.add_argument("--modele", default="eleven_v4")
p.add_argument("--stabilite", type=float, default=0.35)
p.add_argument("--similarite", type=float, default=0.75)
p.add_argument("--par-paragraphe", action="store_true")
p.add_argument("--pause", type=float, default=0.4)
a = p.parse_args()

def tts(text: str, out: str):
    body = json.dumps({"text": text, "model_id": a.modele, "language_code": "fr",
                       "voice_settings": {"stability": a.stabilite, "similarity_boost": a.similarite}})
    r = subprocess.run(["curl", "-s", "-o", out, "-w", "%{http_code}", "-X", "POST",
                        f"{API}/text-to-speech/{a.voix}?output_format=mp3_44100_192",
                        "-H", "Content-Type: application/json", "--data-binary", body], capture_output=True, text=True)
    if r.stdout != "200":
        sys.exit(f"ElevenLabs a répondu {r.stdout} : {open(out, errors='replace').read()[:300]}")

texte = open(a.script, encoding="utf-8").read().strip()
if not a.par_paragraphe:
    tts(texte, a.sortie)
else:
    paras = [x.strip() for x in texte.split("\n") if x.strip()]
    FF = imageio_ffmpeg.get_ffmpeg_exe()
    with tempfile.TemporaryDirectory() as d:
        parts = []
        sil = os.path.join(d, "silence.mp3")
        subprocess.run([FF, "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", str(a.pause), "-b:a", "192k", sil], check=True)
        for i, para in enumerate(paras):
            f = os.path.join(d, f"p{i:02d}.mp3"); tts(para, f); parts += [f, sil]
            print(f"✓ paragraphe {i + 1}/{len(paras)}")
        lst = os.path.join(d, "liste.txt")
        open(lst, "w").write("".join(f"file '{x}'\n" for x in parts[:-1]))
        subprocess.run([FF, "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-ar", "44100", "-ac", "1", "-b:a", "192k", a.sortie], check=True)
print("voix ok →", a.sortie)
