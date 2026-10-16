# Style : impact-ralenti

Mesuré le 16/10/2026 (méthode de la compétence `steal`) sur une pub de référence envoyée par le propriétaire : une agence
de motion design montre une balle au ralenti extrême vers une canette (ni son nom, ni son logo, ni ses images, ni ses
phrases ne sont repris). Appliqué dans la composition `Impact`. Les règles de `CLAUDE.md` passent avant ce fichier.

## Construction (28,5 s de contenu)
1. 0-7 s, SANS VOIX : ralenti extrême (la balle avance de quelques pixels par seconde), habillage de caméra (● REC +
   code temporel en haut à gauche, « 100 000 FPS » à droite, 4 coins d'angle), compte à rebours « FRAMES TO IMPACT »
   182 → 006 en chiffres fins (décroissance ≈ exponentielle, k ≈ 0,49/s), qui passe en couleur sous 25 ; la caméra
   s'approche lentement.
2. 7 s : coupe en plan large, le compteur devient « ● watching 7,2 s » ; texte en deux étages (petite ligne grise +
   grande ligne noire dont les mots arrivent un à un, mot fort en gras) : « tu viens de regarder une balle pendant 7 s ».
3. Révélation en fil de fer sur papier quadrillé (« une balle… qui n'existe pas », étiquettes techniques).
4. « Et tu es encore là, à attendre qu'elle touche » → « Maintenant, imagine que c'était ta marque » : la scène
   rentre dans un téléphone (texte en haut), qui montre ensuite le produit de l'agence (tableaux qui montent).
5. Le téléphone regrandit plein écran, silence, IMPACT : la canette éclate en éclats, un cercle reste et devient le
   logo ; slogan en capitales espacées sous le logo ; pilule « DM "HIT" for a free reel idea ».

## Mesures
- 1 seule coupe franche (`scdet` 0,25) avant l'habillage de fin : tout est fait en mouvements de caméra et en morphings.
- Son : 0-7 s souffle aigu qui monte (60 % d'aigus) + grave qui enfle vers 6 s, coupe nette à 7 s ; voix posée sur une
  ambiance basse (-20 à -27 dB) ; la musique gonfle sur la promesse (-12 dB, grave) ; silence juste avant l'impact.
- Fond crème clair, encre presque noire, une seule couleur d'accent ; polices fines et géométriques ; beaucoup de vide.

## Chez nous (MyMotiv) → `Impact`
- La balle = la lettre rose MyMotiv (enveloppe « mm. »), la canette = LA PILE de candidatures grises « À TRIER »
  (le titre du site : « la candidature qui sort de la pile »). Accent rose `#D9828B`, chiffres en Josefin Sans fin.
- Le téléphone montre le VRAI site (`public/tuto-tel/` : la lettre avec le logo, le score, la preuve 18 % entourée).
- Après l'impact, la lettre se réduit jusqu'au point de « mymotiv. » ; slogan « POSTULEZ | FAITES-VOUS RECRUTER » ;
  signature sonore MyMotiv sur le logo.
- L'offre mise en avant (choix du 16/10/2026) : la Semaine (badge Recommandé du site), prix, avantages et plafond lus
  dans `lettre-ia/lib/pricing.ts` ; argument vrai et calculé : « un centime de plus que deux lettres à l'unité ».
  Appel : « 1re lettre offerte · commente IMPACT » (le propriétaire répond lui-même en DM).

## Laissé de côté (et pourquoi)
- La balle et la canette (arme, marque d'une autre agence), son logo et son slogan, les faux tableaux de revenus
  (« $248,930 », « Built to convert ») : chez nous, seulement le vrai site et des chiffres vrais.
