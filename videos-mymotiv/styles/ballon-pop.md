# Style : ballon-pop

Mesuré le 16/10/2026 (méthode de la compétence `steal`) sur une 2e pub de référence envoyée par le propriétaire, de la
même agence que `impact-ralenti.md` : un ballon au ralenti extrême sous une aiguille, 29,7 s (ni son nom, ni son logo,
ni ses images, ni ses phrases ne sont repris). Appliqué dans la composition `Ballon`. Les règles de `CLAUDE.md` passent
avant ce fichier.

## Construction (29,7 s)
1. 0-7 s, SANS VOIX : plan large du ballon (0-1,9 s, « 85 MM »), puis gros plan macro (« 100 MM MACRO ») : l'aiguille
   descend, touche vers 5 s, creuse un entonnoir. HUD (● REC + code temporel, coins d'angle) ; compte à rebours
   « FRAMES TO IMPACT » qui descend de 30 par seconde (vraies images) de 197 à 001 et S'ARRÊTE à 001 : l'impact n'arrive pas.
2. 7,6 s : « tu viens de regarder un ballon pendant 7 secondes » (texte en deux étages sur la surface, mot fort en couleur) ;
   le HUD devient « ● watching 8,5 s » qui compte.
3. 11 s : « un ballon qui n'existe pas » : fil de fer triangulé + étiquettes techniques en police à chasse fixe.
4. 13 s : « et tu es encore là, à attendre qu'il éclate » : retour au rendu, le creux est plus profond.
5. 16,5 s : « imagine que c'était ta marque » : la scène rentre dans un téléphone (texte en haut), qui montre ensuite les
   films de l'agence ; « on fait des films qu'on ne peut pas faire défiler ».
6. 22,5 s : retour plein écran, la pointe perce, la peau se déchire (gros plan), coupe en plan large : la peau se
   rétracte vers le bas, éclats de latex qui volent ; 24,5 s : logo, slogan espacé, pilule « DM … », adresse du site.

## Mesures
- Aucune coupe franche au-dessus de 0,1 (`scdet`) : tout passe par la caméra, le morphing téléphone et l'éclatement.
- Son : ralenti 0-7 s (souffle + grave + tics), coupe nette à 7,2 s ; voix posée sur peu de musique (-20 à -30 dB) ;
  silence presque total juste avant le pop (24 s : -54 dB), puis le pop.
- Fond noir chaud, une seule couleur d'accent (la couleur du ballon), polices sans empattement fines, texte blanc.

## Adaptation MyMotiv (`Ballon`, 44 s)
- Ballon ROSE MyMotiv sur le fond noir de la marque, rendu 3D maison (`src/ballonRendu.ts` : lancer de rayons dans un
  canevas, aucun fichier externe, aucune carte graphique) ; « IMAGES AVANT LE POP » (le mot de l'appel installé dès la
  1re seconde).
- « imagine que c'était ta lettre de motivation » → le téléphone montre le VRAI site (lettre, score, preuve 18 %),
  « MyMotiv l'écrit pour qu'on ait envie de lire la suite » (« pour », pas de promesse de résultat).
- La boucle reste ouverte pendant l'offre : le ballon n'éclate qu'APRÈS la Semaine (badge, 3,99 €, « un centime de
  plus que deux lettres à l'unité », sans engagement, 1re lettre offerte, « *jusqu'à 30 lettres par semaine »).
- Le ballon éclate pile sur le mot « POP » de « Commente… POP ! » ; les éclats deviennent le point de « mymotiv. ».
- On ne reprend pas l'interface de réseau social du téléphone de la référence (pas d'imitation d'une vraie appli) ni son
  logo en étoile.
