# Style : demo-racontee (FORMAT PAR DÉFAUT depuis le 16/10/2026)

Mesuré le 16/10/2026 avec la méthode de la compétence `steal` sur une vidéo de référence envoyée par le propriétaire
(un créateur qui montre un outil qu'il a construit ; ni son nom, ni son image, ni son produit, ni ses phrases ne sont
repris). Demande du propriétaire : « dorénavant, fonctionne comme ça ». Briques : `src/splitDemo.tsx`. 1re vidéo :
`DemoMission`. Les règles de `CLAUDE.md` passent avant ce fichier.

## Construction (66 s de contenu dans la référence)
1. Accroche 0-4 s : selfie dans une pièce sombre éclairée en rouge, l'ordinateur montre l'outil ; « J'ai construit … je te
   montre » ; sous-titres EN HAUT ; puis un filé flou horizontal (≈ 0,4 s) qui fait entrer l'écran partagé.
2. Écran partagé (l'essentiel de la vidéo) : en haut le produit, en bas la personne qui raconte, sous-titres entre les deux.
3. Le récit d'une MISSION concrète, étape par étape, avec des connecteurs (« Disons que… », « Ensuite… », « Le plus fou,
   c'est que… », « Au final… »), chaque étape montrée en vrai dans le produit.
4. Plans plein écran glissés toutes les 10-15 s : le visage seul sur une phrase forte (« c'est pas une maquette »),
   un détail du produit en grand avec cadres de couleur, l'écran de chiffres (« 7 agents », compteur de temps).
5. Preuve : un « avant / après » ou une vérification montrée (une donnée corrigée, entourée).
6. Bilan en chiffres (gros chiffre blanc + mot en italique coloré, compteur qui défile).
7. Appel « Commente MOT sous ce post et je te l'envoie en DM » : « Commente » en blanc, le MOT géant en italique coloré,
   un champ de commentaire où le mot se tape, puis la réponse qui arrive.

## Mesures
- Coupes (`scdet` 0,25) : 21 en 66 s, une toutes les ≈ 3 s, et le haut de l'écran change encore plus souvent (zooms, pages).
- Débit : 255 mots en 65,4 s = 3,9 mots/s, 7 pauses de plus de 0,4 s seulement (max 1,1 s).
- Son : voix ≈ -17 dB, creux ≈ -17 à -22 dB → musique douce mais présente, ≈ 5-8 dB sous la voix.
- Mise en page (1080×1920) : panneau produit x 30-1050, y 152-975, coins ≈ 34 px, léger halo chaud ; sous-titres à
  y ≈ 1040 ; panneau visage x 47-1033 de y ≈ 1280 jusqu'en bas, coins du haut arrondis, mur chaud (coucher de soleil)
  derrière la personne, halo orange au-dessus. Fond noir à trame de points très discrète.
- Sous-titres : 1 à 3 mots, sans-serif gras blanc ≈ 70 px ; LE mot-clé en italique à empattements (type Instrument
  Serif) dans la couleur d'accent, ≈ 1,3 fois plus grand. Pas d'animation de mot, juste des groupes qui se remplacent.
- Cadres de surbrillance arrondis de la couleur d'accent sur l'élément nommé, caméra qui zoome/glisse dans le produit.

## Chez nous (MyMotiv)
- Couleur d'accent rose `#D9828B` au lieu de l'orange ; police Instrument Serif italique (OFL, `public/fonts/`).
- Panneau produit y 230-1000 (un peu plus bas pour les onglets TikTok) ; sous-titres y 1078 ; visage dès y 1250.
- La personne = Yann masqué (ses vraies photos, une pose par passage) ; voix `--voix yann`, tempo ≈ 1,15.
- Le produit = les VRAIES captures du site (`public/tuto/` ordinateur, `public/tuto-tel/` téléphone). Les réponses de
  l'IA y sont simulées pour l'exemple : dire « le vrai site, pas une maquette », jamais « en direct ».
- Musique `PixelSon` piano + beat (mus_g ≈ 0,6) ; signature sonore MyMotiv (`tools/pub_son.py` → `signature`) sur la fin.
- Appel : « Commente LETTRE … je t'envoie le lien en DM » : le propriétaire doit répondre lui-même aux commentaires.

## Laissé de côté (et pourquoi)
- Le nom du fournisseur d'IA (règle du projet), « en direct », tout chiffre qui ne vient pas du site ou d'une mesure.
- L'habillage de fin TikTok (logo et barre de recherche) : interface d'une marque réelle.
