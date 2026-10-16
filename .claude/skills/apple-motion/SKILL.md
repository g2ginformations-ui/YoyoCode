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
   - le face caméra masqué + démo du site (accroche TikTok « Les RH ne veulent pas que vous sachiez ça ») : `SecretRH`.
   - le tuto « écran d'ordinateur filmé au téléphone » qui montre les nouvelles fonctions : `TutoEcran`.
   - la pub « tout en un » (accroche → problème → démo en enregistrement d'écran du téléphone → preuve → offre → CTA) : `ToutEnUn`.
   - le thème « coffee shop » (matcha, café filtre, prénom mal écrit sur le gobelet, barista, ticket) sur fond clair : `Matcha`.
   - le tuto « ordinateur filmé + vrai doigt qui montre », style mesuré avec la skill steal (`styles/tuto-doigt.md`) : `TutoDoigt`.
   - la micro-pub d'une seule fonction en 10 s qui boucle (le CV en photo) : `PhotoCV`.
   - la confiance au format « red flag / green flag » : `Flags`.
   - le conseil à enregistrer (la structure en 3 blocs) : `TroisBlocs`.
   - les boucles ouvertes (3 histoires jamais finies, barres « pas fini », révélation, fin qui reboucle sur l'accroche) : `BouclesOuvertes`.
   - les fausses sources révélées (cartes 📄 SOURCE, tampons « INVENTÉ », puis la vraie preuve lettre ← CV) : `SourceMoi`.
   - le face caméra « une question, un plan » (bandeau fixe, gestes calés sur les mots, comptage sur les doigts) : `Frequence`.
   - la même avec les leviers de persuasion honnêtes et la règle-ancre répétée (« Souvent, jamais pareil. ») : `Frequence2`.
   - **le format par défaut** « démo racontée en écran partagé » (site en haut, Yann en bas, mission étape par étape, « commente MOT ») : `DemoMission` (briques `src/splitDemo.tsx`).
   - la pub « ralenti extrême → impact » sur fond crème (compte à rebours, révélation, téléphone, éclatement, logo, offre Semaine) : `Impact`.
   - la confession longue en pixel rose (2 min 15, une idée = une icône pixel tirée d'un émoji, écran de vieux téléviseur, POUR / CONTRE honnête, « commente GO ») : `Confession` (briques `src/pixelRose.tsx`).
   - la pub « ballon sous l'aiguille » sur fond noir (3D maison en canevas, compte à rebours, fil de fer, téléphone, offre Semaine avant le pop, éclatement sur « POP ») : `Ballon` (rendu `src/ballonRendu.ts`).
   - pubs avec voix « qui convertissent », un levier chacune : la preuve avant / après (`AvantApres`), les objections démontées +
     témoignage (`ZeroExcuse`), le prix (`VraiPrix`).
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

## Pubs motion avec voix (`src/pubMotion.tsx`, `tools/pub_son.py`)
- Voix pub « Paul K » ; on fabrique la voix d'abord, puis tout se cale sur ses mots (`horloge(voix)` → `at(i)`, `sc(phrase)`).
- Les titres tombent mot par mot (`Ligne`) et reprennent la voix : ils servent de sous-titres (lisible sans le son).
- Une idée = un levier de conversion : preuve (avant / après), objections (une carte barrée puis retournée sur la réponse), prix.
- Retourner une carte : ne PAS mettre `filter` et `preserve-3d` sur le même élément (le dos disparaît) ; afficher la face ou le
  dos selon l'angle et tourner le dos de 180°.
- Fin commune `FinOfferte` : logo, pilule rose « Ta 1re lettre est offerte », une ligne (« Sans inscription. », « Puis dès 1,99 € »),
  « Lien en bio ↑ » qui sautille. Jamais de faux prix lisible sur pause : une machine à sous affiche « ?,?? € ».
- Son : `musique_utilisateur(s, t_fort)` (la musique de l'utilisateur étouffée, ouverte sur le moment fort), `feutre`, `frappe`.

## Style « typo animée » (`src/kinetic.tsx` : `MotsCles`, `BienJoue`, `SansRien`, `AhATS`)
- Mots géants en Poppins 900 (`PoppinsK`), en capitales, fonds pleins qui alternent noir / rose, coupes sèches sur les mots de la
  voix (`Plans`), « claquement » d'arrivée (1,5 → 1 avec rebond) ou « pop » (0,6 → 1).
- Relief : pile d'ombres décalées de 1 px (`ext`, `depth`) ; « chrome rose » (`Chrome`) : relief foncé derrière, dégradé
  métallique devant (`background-clip: text`). Éclat de rayons qui tourne (`Rayons`), étincelles, mot barré (`Barre`).
- Taille : `fit(texte, max, largeur)` d'après la chasse réelle de chaque caractère (`src/data/poppins-k.json`, mesurée par
  `tools/largeurs-police.mjs`) : pas d'estimation au jugé, sinon les titres débordent ou sont trop petits.
- Le titre de l'image 0 démarre à −0,5 s pour être posé (sans rebond) dès la première image.
- Son : `groove()` (grosse caisse, clap, charleston, basse, accords) et `claque()` sur chaque mot géant (`tools/pub_son.py`).

## Format « face caméra » TikTok (`src/SecretRH.tsx`)
- Le texte d'accroche reste en haut pendant toute la vidéo : Poppins 800, blanc cerné de noir (8 ombres de 3 à 4 px), 45 px sur 2 lignes.
- La personne : une photo détourée par morceau de phrase, coupe sèche avec un zoom alterné (1 / 1,1), léger balancement, bas de la
  photo fondu (`maskImage`) pour ne pas voir la découpe.
- Étiquettes façon texte TikTok : fond plein blanc ou rose, coins arrondis, petit rebond ; mot barré en rouge pour « pas ça ».
- Démo : un navigateur générique « filmé » en biais (rotateX 10°, rotateY −7°, rotateZ −2°), puis le téléphone avec les cases isolées.
  Pendant la démo, un dégradé sombre sous les sous-titres pour qu'ils restent lisibles sur le téléphone.

## Format « écran filmé au téléphone » (`src/TutoEcran.tsx`)
- Captures du vrai site sur ordinateur (1280×800 en ×2, JPEG, `capture/capture-tuto.mjs`, cadres des cases dans `boxes.json`).
- Le moniteur est dessiné en pixels de capture (barre de navigateur avec l'adresse, cadre noir, webcam, pied, bureau) ; la caméra
  est une liste de clés `[début, x, y, zoom, durée]` : le point (x, y) de l'écran se place au centre utile (520, 870).
- « Main qui filme » : petites translations et rotations en sinus, inclinaison 3D (rotateX ≈ 6°, rotateY ≈ −5°), flou de
  mouvement proportionnel à la vitesse de la caméra, reflet en biais et trame légère sur l'écran, vignette.
- Le curseur « mm. » et les cadres roses vivent DANS l'écran (ils bougent avec la caméra) ; les étiquettes d'étape, le tampon et
  l'accroche restent fixes à l'image. Texte d'un cadre dans l'écran : taille divisée par le zoom pour rester lisible.
- L'accroche en bandeau gris translucide (comme le texte TikTok natif), une étape numérotée en étiquette blanche, un voile sombre
  sous les sous-titres (les pages blanches les rendraient illisibles).

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
- Voix de l'utilisateur, **naturelle par défaut** (`tools/voix-narrateur.py` + un fichier de config, voir
  `voix-fantomes.json`) : `"natural": true` → coupe-bas, porte de bruit, EQ +présence 3-5 kHz, compresseur, dé-esseur ;
  effets créatifs ponctuels : `stutter` (bégaiement glitch sur le hook), `effects` → `telephone` (phrase « vieille
  méthode »), `ghost` (copie très grave + grande réverbe), `chorus` (pensée intérieure, « Respire »), `delay` (écho du
  dernier mot pendant le logo). Régler `thr_db` au-dessus du bruit de la pièce. Ne pas accélérer ni baisser la voix sauf
  demande. Bruitages : les nommer selon les catégories UCS (GLITCH, UI CLICK, WHOOSH, IMPACT, STATIC, BELL…).
- Voix (autres cas) :
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
