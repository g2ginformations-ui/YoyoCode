---
name: apple-motion
description: Motion design premium pour les vidéos MyMotiv dans Remotion (videos-mymotiv). Partie 1 « style Apple » — morphing de formes (rond → pilule → carte → pilule), rebond d'inertie, décalages, texte qui tombe, appui avant chaque transformation. Partie 2 « style Révélation » — fond sombre et lumière rose, caméra 3D, flou de mise au point, cases du vrai site isolées du téléphone, traînées de lumière, flashs, écran de fin à bulles et pilule noire. À utiliser dès que l'utilisateur demande une vidéo « type Apple », épurée, premium, une pub produit, une démo du site, ou de reprendre la construction d'une vidéo de référence.
---

# Motion design MyMotiv (Remotion)

Outils : `videos-mymotiv/src/apple.tsx` (partie 1) et `videos-mymotiv/src/motion.tsx` (partie 2).
Exemples complets : `AppleMyMotiv`, `AppleKeynote`, `AppleRapide`, `YannStop` (partie 1) ; `Reveal`, `ParcoursSite` (partie 2).
Les règles de `CLAUDE.md` s'appliquent toujours (prix réels, aucun chiffre inventé, exemples fictifs, marque MyMotiv).

## 0. Avant de commencer : la méthode
1. **Money & Vibe** : l'idée fait-elle vendre, et respecte-t-elle l'identité MyMotiv ? Sinon, proposer mieux.
2. **Une idée par vidéo**, avec un angle différent des vidéos existantes (voir `videos-mymotiv/README.md`).
   Angles déjà faits :
   - le problème : `ApresMidi`, `YannStop` ;
   - la keynote avec les prix : `AppleKeynote` ;
   - la rapidité : `AppleRapide` ;
   - la pub produit : `Reveal` ;
   - le vrai parcours : `ParcoursSite`.
3. **Hook en moins d'une seconde** : un gros texte, ou un geste qui casse le défilement.
   Exemples : « Arrête. », le slogan en gros, une particule qui explose, une capture TikTok qu'on entoure.
4. **Lisible sans le son** : un titre court à chaque état, dans la zone sûre TikTok. Viser y 170 à 1500, en évitant le
   bas (légende) et la droite (boutons).
5. **Durée** :
   - 15 à 22 s pour une idée ;
   - 30 s maximum pour un parcours complet.
6. **Fin** : logo, puis « Ta 1re lettre est offerte », puis « Lien en bio ↑ » (et le slogan si la place le permet).
7. **Mentions** : toujours « * temps mesuré : 27 à 35 s par lettre » dès qu'on affiche 30 s, et
   « * 30 lettres par semaine au maximum » dès qu'on écrit « illimité ».
8. **Reprendre une vidéo de référence** : extraire des images à 4 i/s en planches (ffmpeg + PIL), lister les étapes
   avec leurs temps, puis les transposer une à une. On reprend la construction et les mouvements, jamais le logo,
   les images ou les couleurs de l'autre marque.

## Partie 1 — style Apple (`src/apple.tsx`)
- **Fond** :
  - clair : `APPLE.bg` #F2F2F4 avec des cadres blancs ;
  - ou uni noir clair : #1C1C1E avec des cartes #2C2C2E.

  Une seule couleur d'accent (rose #D9828B), Poppins, 60 i/s.
- **Morphing** : un seul cadre et un seul bouton changent de taille, de rayon et de couleur au fil de l'histoire.
- **`bounce(t, keys)`** : clés linéaires plus rebond d'inertie à chaque arrivée (amp 0,05 · fréq 4 · amort. 8).
  - `go(t, t0, t1, a, b)` pour un seul mouvement ;
  - `morph` est le même que `bounce`.
- **Décalages** : ce qui accompagne arrive un peu après :
  - 0,05 s par mot ;
  - 0,03 s par lettre ;
  - 0,08 s entre des cartes.
- **`TextDrop`** : par **mots** pour les titres, par **lettres** pour les prix et la frappe. Le texte tombe, glisse ou
  monte, puis `out` le fait disparaître en fondu de 0,2 s.
- **`press(t, t0)`** : appui 0,1 à 0,2 s **avant** chaque transformation. C'est le bouton qui déclenche la suite.
- **`curve(k, a, b, c)`** : trajets courbes (Bézier quadratique) pour tous les grands déplacements.
- **Liant final** : rotation de tout le groupe (±2,5°, avec rebond), puis retour au rond, puis le logo.
- Recettes éprouvées :
  - anneau chrono façon Apple Watch (cercle SVG `strokeDasharray` de 0 à 30 s*) ;
  - pilules qui se cochent ✓ ;
  - cartes de prix qui jaillissent d'un point rose sur le « drop » ;
  - curseur néon MyMotiv `Pointer` (`src/Lien.tsx`) qui survole puis clique ;
  - `Ripple` au clic.

## Partie 2 — style « Révélation » (`src/motion.tsx`)
- **Ambiance** : `GLOW_BG` (halo rose très sombre), cartes `DARK.card`, lumière rose partout (`box-shadow` rose).
- **Ouverture** :
  1. une particule blanc rose arrive en courbe, avec une traînée de 4 copies floues décalées ;
  2. `Flash` au point d'arrivée, avec `pulse(t, t0)` ;
  3. `Shockwave` ;
  4. `AppIcon` qui rebondit ;
  5. le logo révélé de gauche à droite (`clipPath: inset(0 X% 0 0)`) ;
  6. sortie en flou, avec un agrandissement à 1,5.
- **Caméra 3D** : un conteneur `perspective: 1700`, et sur l'objet
  `translate() rotateY() rotateX() scale()` + `filter: blur()`.
  - Entrée : rotateY 30° → 9°, échelle 0,62 → 0,86, flou 16 → 0 en 0,5 s.
  - Zoom : échelle ×1,4 avec une translation pour cadrer la zone utile.
  - Dérive : légère oscillation permanente (rotateY ±3°).
- **Coup de fouet** entre deux scènes : translateX ±520, rotateY ±28°, flou 16, en 0,35 s, avec un « whoosh ».
- **Flou de mise au point** :
  - ce qui n'est pas le sujet est flou (6 à 8 px) et assombri (`brightness(0.55)`) ;
  - sur un gros plan de liste, `dofBlur(y, focusY)` floute chaque ligne selon sa distance au plan net.
- **Isoler une case du vrai site** (`Crop`) :
  1. capturer le site (`capture/capture-parcours.mjs` → `public/parcours/*.png` + `boxes.json`, cadres en pixels
     1080×1920) ;
  2. la case découpée part de sa place dans le téléphone (même position, même taille), vient au centre agrandie
     (×1,3 à ×1,5, ou ×2,4 pour un petit élément comme l'anneau du score), avec un halo rose ;
  3. le téléphone se floute derrière ;
  4. un titre court explique la case (« Ton CV », « Le lien de l'offre »…) ;
  5. retour à sa place avant la scène suivante.
- **Animer une capture** : enchaîner les captures successives (frappe, chargement en %, anneau qui se remplit)
  au lieu de les recréer. Le contenu reste le vrai site.
- **Barre de saisie** :
  - deux `LightTrails` (chemins SVG, segment lumineux qui avance) convergent ;
  - une barre claire apparaît en rebond ;
  - le texte se tape lettre par lettre (`TextDrop by="chars"`, stagger 0,02 à 0,03) ;
  - on appuie sur le bouton d'envoi ;
  - la barre se resserre, puis `Flash`.
- **Entourer un élément** : `MarkerStroke` (trait de feutre qui se dessine en 0,6 s), puis l'élément s'isole et vole
  en courbe vers sa destination (par exemple le lien de la bio vers la barre d'adresse).
- **Écran de fin** :
  - `Bubbles` (bulles de verre roses qui flottent, centre libre) ;
  - `AppIcon` au-dessus ;
  - `GlossPill` (pilule noire brillante) avec le logo ;
  - `Horizon` (ligne de lumière) ;
  - slogan, « Ta 1re lettre est offerte » et « Lien en bio ↑ ».

## Son (un `synth_<nom>.py` par vidéo)
- Musique de l'utilisateur `public/audio/apres-midi-fond.mp3` : ses **percussions démarrent à 18,9 s du fichier**.
  - Les caler sur le moment fort (flash, clic sur « Générer », prix) : `MUSIC_IN = 18.9 - t_fort`.
  - Avant : musique étouffée (passe-bas 600 Hz). Après : grande ouverte.
  - On peut la refermer juste avant un 2e flash.
  - Si la partie rythmée est trop courte : raccord en boucle sur un nombre entier de temps (temps ≈ 0,86 s, trouvé par
    autocorrélation), au point où le spectre se ressemble le plus, avec un fondu de 80 ms
    (voir `synth_parcours_site.py`).
- Bruitages à chaque geste :
  - `whoosh` à chaque mouvement de caméra ;
  - `click` + `pop` à chaque appui ;
  - clics rapides pour la frappe ;
  - `riser` avant un flash ;
  - `boom` + `chime` sur le flash ;
  - feutre (bruit filtré 1,5 à 6 kHz).
- Voix (si besoin) :
  - l'utilisateur : nettoyée (`tools/nettoyer-voix2.py`, mono 48 kHz) ;
  - Yann : voix de synthèse hors ligne (`tools/voix-yann-tts.py`, écrire « Maille Motiv », « cé vé »).
  - Dans les deux cas : EQ « radio », compresseur, et la musique baisse sous la voix (ducking).
- Volume final : `loudnorm=I=-14:TP=-1` (TikTok).

## Vérifier avant d'envoyer
- Planche d'images (`SCALE=0.5 node render.mjs stills t1 t2 …`), puis une planche PIL pour chaque état :
  - rien de coupé ;
  - rien derrière autre chose (`zIndex`) ;
  - aucune bulle ni carte sur un texte ;
  - un titre à chaque état.
- Une capture manquante fait échouer tout le rendu (« Error loading image ») : vérifier les index des images.
- Rendu en 60 i/s (`BITRATE` de 6 à 9M). Au-delà de 30 Mio : réencoder en deux passes (ffmpeg d'`imageio_ffmpeg`).
- Ne jamais écraser un fichier existant : vérifier avec `ls` / `git status` avant d'écrire une nouvelle composition.
