# Flyer A5 recto-verso MyMotiv pour la distribution en ville (impression pro : PDF avec 3 mm de fond perdu).
# Construit flyer.html (polices, images et QR code intégrés, autonome), puis imprimer-flyer.mjs en fait le PDF et les PNG.
# Prix lus dans lettre-ia/lib/pricing.ts ; aucun chiffre inventé (30 s = temps mesuré 27 à 35 s ; Léni S. avec sa mention).
# Usage (depuis la racine du dépôt) : python3 marketing/flyer/construire-flyer.py && node marketing/flyer/imprimer-flyer.mjs
import base64, os, re
import segno

ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.dirname(os.path.dirname(ICI))
V = os.path.join(RACINE, "videos-mymotiv", "public")
LIEN = "https://yoyo-code.vercel.app/candidature"          # direct : pas de redirection publicitaire
LIEN_AFFICHE = "yoyo-code.vercel.app"

def b64(chemin): return base64.b64encode(open(chemin, "rb").read()).decode()
def police(nom, fichier, poids, style="normal"):
    return f"@font-face{{font-family:'{nom}';src:url(data:font/woff2;base64,{b64(os.path.join(V, 'fonts', fichier))}) format('woff2');font-weight:{poids};font-style:{style}}}"

# prix : la source unique du site
pricing = open(os.path.join(RACINE, "lettre-ia", "lib", "pricing.ts"), encoding="utf-8").read()
prix = dict(re.findall(r'(\w+): \{\s*id: "\w+",\s*name: "[^"]+",\s*cents: \d+,\s*price: "([^"]+)"', pricing))
LIMITE = re.search(r"WEEKLY_LIMIT = (\d+)", pricing).group(1)
assert prix.get("letter") and prix.get("week"), prix

def qr(sombre="#0B0A0B"):
    q = segno.make(LIEN, error="q")
    w, h = q.symbol_size(scale=10, border=2)
    svg = q.svg_inline(scale=10, border=2, dark=sombre, light=None)
    svg = re.sub(r'\s(width|height)="[^"]*"', "", svg, count=2)          # la taille vient du CSS, le dessin suit le viewBox
    return svg.replace("<svg ", f'<svg class="qr" viewBox="0 0 {w} {h}" preserveAspectRatio="xMidYMid meet" ', 1)

POLICES = "".join([
    police("Poppins", "poppins-latin-600-normal.woff2", 600), police("Poppins", "poppins-latin-700-normal.woff2", 700),
    police("Poppins", "poppins-latin-800-normal.woff2", 800), police("Poppins", "poppins-latin-900-normal.woff2", 900),
    police("Open Sans", "open-sans-latin-400-normal.woff2", 400), police("Open Sans", "open-sans-latin-600-normal.woff2", 600),
])
LOGO = b64(os.path.join(V, "logo-mymotiv.png"))
MASCOTTE = b64(os.path.join(V, "mascotte", "pied.png"))

html = f"""<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>Flyer MyMotiv A5</title><style>
{POLICES}
@page {{ size: 154mm 216mm; margin: 0 }}
* {{ box-sizing: border-box; margin: 0; padding: 0 }}
html, body {{ background: #777 }}
:root {{ --ink: #0B0A0B; --rose: #D9828B; --rose-l: #F2B8C0; --papier: #FBF6F7 }}
/* une page = A5 + 3 mm de fond perdu ; le contenu reste à 8 mm des bords (3 mm de coupe + 5 mm de marge) */
.page {{ position: relative; width: 154mm; height: 216mm; overflow: hidden; page-break-after: always; font-family: 'Open Sans', sans-serif }}
.zone {{ position: absolute; left: 8mm; right: 8mm; top: 8mm; bottom: 8mm }}
.qr {{ display: block; width: 100%; height: 100% }}

/* ── recto ── */
.recto {{ background: var(--ink); color: #fff }}
.recto .halo {{ position: absolute; inset: 0; background:
  radial-gradient(circle at 78% 64%, rgba(217,130,139,.55) 0, rgba(217,130,139,.18) 28%, rgba(11,10,11,0) 52%),
  radial-gradient(circle at 10% 0%, rgba(217,130,139,.22) 0, rgba(11,10,11,0) 40%) }}
.recto .anneau {{ position: absolute; right: -22mm; top: 92mm; width: 118mm; height: 118mm; border-radius: 50%; border: 1.6mm solid rgba(242,184,192,.35) }}
.recto .mascotte {{ position: absolute; right: -6mm; bottom: -6mm; height: 128mm; filter: drop-shadow(0 0 6mm rgba(217,130,139,.55)) }}
.logo {{ height: 9.5mm; display: block }}
.etiquette {{ display: inline-block; margin-top: 9mm; padding: 1.6mm 3.6mm; border: .45mm solid var(--rose-l); border-radius: 20mm; font: 700 3.3mm/1 Poppins, 'DejaVu Sans', sans-serif; letter-spacing: .5mm; color: var(--rose-l) }}
.titre {{ margin-top: 6mm; font: 900 13.6mm/0.98 Poppins, 'DejaVu Sans', sans-serif; letter-spacing: -.5mm; text-transform: uppercase }}
.titre .rose {{ color: var(--rose) }}
.chapo {{ margin-top: 6mm; width: 74mm; font: 600 4.1mm/1.42 'Open Sans'; color: #E9E2E4 }}
.chapo b {{ color: #fff }}
.carte-qr {{ position: absolute; left: 0; bottom: 9mm; width: 70mm; padding: 4.2mm; border-radius: 6mm; background: #fff; color: var(--ink); display: flex; gap: 3.8mm; align-items: center; box-shadow: 0 0 10mm rgba(217,130,139,.45) }}
.carte-qr .code {{ width: 29mm; height: 29mm; flex: none }}
.carte-qr .scan {{ font: 900 4.6mm/1.05 Poppins, 'DejaVu Sans', sans-serif; text-transform: uppercase }}
.carte-qr .offerte {{ display: inline-block; margin-top: 2.2mm; padding: 1.2mm 2.6mm; border-radius: 10mm; background: var(--rose); color: #fff; font: 800 3.2mm/1.15 Poppins, 'DejaVu Sans', sans-serif }}
.carte-qr .petit {{ margin-top: 1.6mm; font: 600 2.7mm/1.3 'Open Sans'; color: #5B5557 }}
.url {{ position: absolute; left: 0; bottom: 3.2mm; font: 700 3.3mm/1 Poppins, 'DejaVu Sans', sans-serif; color: var(--rose-l) }}
.mention {{ position: absolute; left: 0; bottom: 0; font: 400 2.2mm/1 'Open Sans'; color: #A39C9E }}

/* ── verso ── */
.verso {{ background: var(--papier); color: var(--ink) }}
.verso .bande {{ position: absolute; left: 0; right: 0; bottom: 0; height: 47mm; background: var(--ink) }}
.verso .bande::before {{ content: ''; position: absolute; inset: 0; background: radial-gradient(circle at 85% 30%, rgba(217,130,139,.45) 0, rgba(11,10,11,0) 55%) }}
.h2 {{ font: 900 7.4mm/1 Poppins, 'DejaVu Sans', sans-serif; letter-spacing: -.25mm }}
.h2 .rose {{ color: var(--rose) }}
.etapes {{ margin-top: 5mm; display: grid; grid-template-columns: repeat(3, 1fr); gap: 3mm }}
.etape {{ background: #fff; border-radius: 5mm; padding: 4mm 3.4mm; box-shadow: 0 1.5mm 5mm rgba(11,10,11,.06) }}
.etape .n {{ width: 8mm; height: 8mm; border-radius: 50%; background: var(--rose); color: #fff; font: 900 4.4mm/8mm Poppins, 'DejaVu Sans', sans-serif; text-align: center }}
.etape .t {{ margin-top: 2.6mm; font: 800 4mm/1.1 Poppins, 'DejaVu Sans', sans-serif }}
.etape .d {{ margin-top: 1.4mm; font: 400 2.9mm/1.38 'Open Sans'; color: #4A4446 }}
.points {{ margin-top: 7mm }}
.point {{ display: flex; gap: 2.8mm; align-items: flex-start; margin-top: 3mm; font: 600 3.45mm/1.38 'Open Sans' }}
.point .c {{ flex: none; width: 5.6mm; height: 5.6mm; border-radius: 50%; background: var(--ink); color: var(--rose-l); font: 800 3.2mm/5.6mm Poppins, 'DejaVu Sans', sans-serif; text-align: center; margin-top: .2mm }}
.point small {{ display: block; font: 400 2.75mm/1.35 'Open Sans'; color: #6B6466 }}
.duo {{ margin-top: 6mm; display: grid; grid-template-columns: 1fr 1fr; gap: 3mm }}
.boite {{ border-radius: 5mm; padding: 4mm; background: #fff; box-shadow: 0 1.5mm 5mm rgba(11,10,11,.06) }}
.boite .lab {{ font: 800 2.9mm/1 Poppins, 'DejaVu Sans', sans-serif; letter-spacing: .4mm; text-transform: uppercase; color: var(--rose) }}
.temoin .chiffres {{ margin-top: 2.4mm; font: 900 7mm/1 Poppins, 'DejaVu Sans', sans-serif; letter-spacing: -.2mm }}
.temoin .chiffres span {{ color: var(--rose) }}
.temoin .qui {{ margin-top: 1.6mm; font: 600 3mm/1.3 'Open Sans' }}
.temoin .note {{ margin-top: 2mm; font: 400 2.3mm/1.3 'Open Sans'; color: #8A8385 }}
.prix .l {{ margin-top: 2.2mm; font: 600 3.05mm/1.3 'Open Sans' }}
.prix .l b {{ font: 900 4.4mm/1 Poppins, 'DejaVu Sans', sans-serif }}
.prix .l b.rose {{ color: var(--rose) }}
.prix .note {{ margin-top: 2mm; font: 400 2.3mm/1.3 'Open Sans'; color: #8A8385 }}
.fini {{ margin-top: 6mm; display: flex; flex-wrap: wrap; gap: 2mm; align-items: center; font: 800 3.3mm/1 Poppins, 'DejaVu Sans', sans-serif }}
.fini .tag {{ position: relative; padding: 1.6mm 3mm; border-radius: 10mm; background: #fff; box-shadow: 0 1mm 3mm rgba(11,10,11,.06) }}
.fini .tag::after {{ content: ''; position: absolute; left: 2mm; right: 2mm; top: 50%; height: .7mm; background: var(--rose); transform: rotate(-4deg) }}
.bas {{ position: absolute; left: 8mm; right: 8mm; bottom: 8mm; height: 31mm; display: flex; align-items: center; gap: 5mm; color: #fff }}
.bas .code {{ width: 27mm; height: 27mm; flex: none; padding: 1.8mm; border-radius: 3mm; background: #fff }}
.bas .slogan {{ font: 900 5.6mm/1.08 Poppins, 'DejaVu Sans', sans-serif }}
.bas .slogan span {{ color: var(--rose) }}
.bas .lien {{ margin-top: 2mm; font: 700 3.1mm/1 Poppins, 'DejaVu Sans', sans-serif; color: var(--rose-l) }}
.bas .jeter {{ margin-top: 2.2mm; font: 400 2.2mm/1 'Open Sans'; color: #A39C9E }}
.logo-v {{ position: absolute; right: 8mm; top: 8mm; height: 6.5mm }}
</style></head><body>

<section class="page recto">
  <div class="halo"></div><div class="anneau"></div>
  <img class="mascotte" src="data:image/png;base64,{MASCOTTE}" alt="">
  <div class="zone">
    <img class="logo" src="data:image/png;base64,{LOGO}" alt="mymotiv.">
    <div class="etiquette">ALTERNANCE · STAGE · 1ER JOB</div>
    <h1 class="titre">Ta lettre<br>de motiv’<br><span class="rose">sur mesure</span><br>en 30 s*.</h1>
    <p class="chapo">Tu colles le lien de l’offre. <b>MyMotiv écrit une lettre qui parle de l’entreprise</b>, avec tes vraies expériences.</p>
    <div class="carte-qr">
      <div class="code">{qr()}</div>
      <div><div class="scan">Scanne<br>et essaie</div><div class="offerte">1re lettre offerte</div><div class="petit">Sans inscription.</div></div>
    </div>
    <div class="url">{LIEN_AFFICHE}</div>
    <div class="mention">* temps mesuré : 27 à 35 s par lettre.</div>
  </div>
</section>

<section class="page verso">
  <div class="bande"></div>
  <img class="logo-v" src="data:image/png;base64,{LOGO}" alt="mymotiv.">
  <div class="zone">
    <h2 class="h2">Comment ça <span class="rose">marche ?</span></h2>
    <div class="etapes">
      <div class="etape"><div class="n">1</div><div class="t">Ton CV</div><div class="d">Une seule fois : PDF, Word ou même une photo.</div></div>
      <div class="etape"><div class="n">2</div><div class="t">Le lien de l’offre</div><div class="d">N’importe quel site d’emploi, ou le texte de l’annonce.</div></div>
      <div class="etape"><div class="n">3</div><div class="t">Ta lettre</div><div class="d">Prête en 30 s*. Tu la relis, tu la valides, tu postules.</div></div>
    </div>
    <div class="points">
      <h2 class="h2">Elle sort <span class="rose">de la pile.</span></h2>
      <div class="point"><div class="c">✓</div><div>Elle nomme l’entreprise et répond à ses vrais besoins.</div></div>
      <div class="point"><div class="c">✓</div><div>Elle s’appuie sur tes vraies expériences.<small>Rien n’est inventé, zéro formule toute faite.</small></div></div>
      <div class="point"><div class="c">✓</div><div>Elle reprend les mots-clés de l’offre, quand c’est vrai.<small>Ceux qu’un recruteur cherche, par exemple dans son logiciel de tri (ATS).</small></div></div>
    </div>
    <div class="duo">
      <div class="boite temoin"><div class="lab">Témoignage</div><div class="chiffres">11 → <span>7</span></div><div class="qui">Léni S. : 11 candidatures envoyées, 7 entretiens.</div><div class="note">Témoignage réel · résultats individuels non garantis.</div></div>
      <div class="boite prix"><div class="lab">Les prix</div>
        <div class="l"><b class="rose">0 €</b> ta 1re lettre</div>
        <div class="l"><b>{prix['letter']}</b> la lettre + son CV adapté</div>
        <div class="l"><b>{prix['week']}</b> la semaine, en illimité**</div>
        <div class="note">Sans engagement. ** {LIMITE} lettres par semaine au maximum. Tarifs TTC, octobre 2026.</div></div>
    </div>
    <div class="fini">Fini : <span class="tag">la page blanche</span><span class="tag">le copier-coller</span><span class="tag">les formules creuses</span></div>
  </div>
  <div class="bas">
    <div class="code">{qr()}</div>
    <div><div class="slogan">Avec MyMotiv, postulez.<br><span>Et faites-vous recruter.</span></div><div class="lien">{LIEN_AFFICHE}</div><div class="jeter">* temps mesuré : 27 à 35 s par lettre. Ne pas jeter sur la voie publique.</div></div>
  </div>
</section>
</body></html>"""
open(os.path.join(ICI, "flyer.html"), "w", encoding="utf-8").write(html)
print("flyer.html", round(len(html) / 1024), "Ko · prix", prix["letter"], prix["week"], "· QR →", LIEN)
