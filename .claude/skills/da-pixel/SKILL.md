---
name: da-pixel
description: Direction artistique MyMotiv « rétro pixel noir et rouge » et règles de motion design des vidéos (TikTok 9:16) — couleurs, police pixel, cadrage TikTok, fenêtres 8 bits, sprites, animations en paliers, calage sur la voix, son chiptune, structure des vidéos, contrôles. À utiliser pour toute nouvelle vidéo, image, miniature ou visuel « dans le style pixel » ou « dans la même DA » que Le faux DM, Le mot rouge, Je lis dans ta tête, les effets psycho, Le jeu du recruteur, G comme gagner ta vie, T'es lequel des 4.
---

# Direction artistique MyMotiv — pixel & motion design

Version 1 — 11/10/2026. Ce fichier rassemble tout ce qui a été construit pour le **design** des vidéos : la DA pixel
(en détail) et les règles de motion design. Il ne parle pas des offres ni du fonctionnement du site.

**Dans une autre conversation** : joins ce fichier et écris « fais-moi une vidéo / un visuel avec cette DA ».
**Dans ce dépôt** : le code des briques est dans `videos-mymotiv/src/` (noms indiqués entre parenthèses).

---

## 1. L'identité en une phrase

**Un vieil ordinateur dans le noir, avec une lueur rouge** : fond noir chaud, halo rouge au centre, fenêtres 8 bits,
gros texte pixel blanc et rouge, petits personnages en pixel art, glitchs et lignes de balayage, musique chiptune.
Le ton : jeu vidéo, mystère, un peu d'humour. Le rose est réservé à MyMotiv (logo, offre, coches ✓).

---

## 2. Les couleurs

| Rôle | Nom dans le code | Couleur |
|---|---|---|
| Fond (noir chaud) | `INK` | `#070303` |
| Accent unique (rouge vif) | `RED` | `#E8262B` |
| Rouge foncé (ombres, boule) | `RED_D` | `#8E1216` |
| Blanc cassé (texte, cadres) | `W_` | `#F4F1EC` |
| Gris (texte éteint, perdu) | `GREY` | `#8A8580` |
| Rose MyMotiv (logo, offre, ✓) | `PINK` | `#D9828B` |
| Fond des cartes de personnage | `FOND` | `#3B1012` |
| Case vide d'une jauge | — | `#3A2526` |
| Lignes « brouillées » d'une lettre | — | `#4A3C3B` / `#5A4A48` |
| Fond d'une fenêtre | — | `rgba(7,3,3,0.92)` |

Règles :
- **Un seul accent** : le rouge. Le blanc pour le texte, le gris pour ce qui est « perdu » ou barré.
- **Le rose n'apparaît qu'avec MyMotiv** (fin de vidéo).
- Les mots importants des sous-titres passent en rouge.

---

## 3. La typographie

| Usage | Police | Graisse | Taille (vidéo 1080×1920) |
|---|---|---|---|
| Tout le texte « écran » (titres, étiquettes, fenêtres) | **Silkscreen** (Google Fonts, licence OFL) | 700 | 40 px minimum ; titres 64 à 120 px ; lettre géante jusqu'à 300 px |
| Sous-titres de la voix | **Poppins** | 800 | 60 px |
| Titre de fenêtre | Silkscreen | 700 | 30 à 32 px (seule exception sous 40 px) |

Règles de la police pixel :
- **Largeur ≈ 0,85 × la taille par lettre** (en gras). Largeur utile maximale : 800 px.
  Taille maximale d'une ligne = 800 ÷ (0,85 × nombre de lettres). Exemple : « VON RESTORFF » (12 signes) → 68 px.
- Glyphes absents : **« … » → écrire « ... »** ; **« ° » → écrire « #1 »** (pas « N°1 », qui s'affiche « N+1 »).
- Les accents (É, È, À, Ç), « ✓ » et « ↑ » passent bien.
- Interlignage 1,05 pour les gros titres, 1,15 ailleurs. Retour à la ligne avec « \n » (style `whiteSpace: pre`).
- Les phrases citées s'écrivent entre guillemets français : « « JE SUIS MOTIVÉ » ».

---

## 4. Le cadre TikTok (obligatoire)

Format 1080 × 1920, 30 images par seconde pour le pixel.

**Zone sûre** : x de 120 à 920, y de 280 à 1440 (fichier `src/tiktok.ts`). En dehors, l'interface de TikTok cache
la vidéo : onglets en haut, boutons à droite, description en bas.
**L'axe central est x = 520**, pas 540 : la zone sûre est décalée par la colonne de boutons.

Grille verticale type :

| Bande (y) | Contenu |
|---|---|
| 330 à 420 | Titre de la scène ou étiquette (« #1 L'ALTERNANCE », « DUEL 1/3 ») |
| 450 à 800 | Le visuel principal (personnage, fenêtre, gros chiffre) |
| 800 à 1130 | Fenêtre d'info, jauges, ou étiquette de conclusion (« DANS LE MILLE ») |
| 1215 à 1360 | Sous-titres (Poppins 60 px, centrés entre 120 et 920) |
| sous 1440 | Rien d'important |

- **Peu d'éléments par écran** : 3 blocs au maximum, plus les sous-titres.
- Le décor (pluie de billets, poussières) peut sortir de la zone sûre, mais **jamais passer sur les sous-titres**
  (il s'efface à 10 % en traversant la bande y ≈ 1215).
- Contrôle : planche d'images avec le calque rouge des zones (`tools/planche-zones.py`).

---

## 5. Le décor de fond (`Ecran`)

1. Fond `#070303`.
2. Halo central : `radial-gradient(ellipse at 50% 52%, rgba(120,12,14,0.55) 0%, rgba(50,6,8,0.35) 40%, rgba(7,3,3,0) 72%)`.
3. 40 poussières de 3 px (et quelques-unes de 6 px) qui dérivent lentement vers le bas et scintillent :
   3 sur 4 en rouge à 35 %, 1 sur 4 en blanc à 25 %.
4. Lignes de balayage par-dessus tout :
   `repeating-linear-gradient(0deg, rgba(0,0,0,0.12) 0 2px, rgba(0,0,0,0) 2px 4px)`.
5. **Glitch** sur les coupes et les révélations : tout le cadre tremble à l'horizontale
   (`translateX(sin(t × 97) × 8 px)`) pendant 0,12 à 0,18 s. Toujours sur la toute première image (t < 0,18 s).
6. Zoom 1 pour TikTok (les anciennes vidéos non cadrées utilisaient 1,35).

---

## 6. Les briques visuelles

| Brique | À quoi elle ressemble |
|---|---|
| **Fenêtre** (`Win`) | Largeur 800 px. Cadre 4 px rouge (ou blanc). Barre de titre pleine, rouge (ou blanche), avec le titre en pixel 30 px et 3 petits carrés de 12 px à droite. Fond `rgba(7,3,3,0.92)`. Ombre : `0 0 0 4px #070303, 0 0 40px rgba(232,38,43,0.25)`. Marges intérieures 18/20 px. |
| **Étiquette** (`Tag`) | Bloc plein : fond blanc + texte noir, ou fond rouge + texte blanc. Marges 6 px / 14 px. |
| **Gros texte** (`BigTT`) | Silkscreen 700, centré, 64 à 300 px, blanc ou rouge. |
| **Tampon** (`Tampon`) | Texte rouge dans un cadre rouge de 6 px, fond noir à 85 %, penché de −8°. Il s'écrase de 1,6 à 1 en 0,12 s. |
| **Bouton** (`Bouton`) | Cadre blanc de 5 à 6 px, plein blanc quand il est « appuyé ». |
| **Ligne à puce** (`Ligne`) | Carré plein (0,75 × la taille du texte) + texte qui s'écrit en 0,45 s. |
| **Réplique** (`Bulle`) | Texte encadré (4 px gris ou rouge) qui s'écrit en 0,5 s. |
| **Rature** | Trait rouge de 10 px, en légère diagonale, qui se dessine en 4 paliers sur 0,2 s. |
| **Barre de progression** (`Barre`) | Fond `#3A2526`, remplissage rouge par paliers de 10 %. |
| **Jauge de jeu** (`Stat`) | Libellé 40 px (colonne de 420 px) + 10 cases de 26 × 40 px espacées de 5 px. Se remplit en 0,4 s. Variantes : en boucle (« ça s'enchaîne »), « décousue » (cases trouées qui sautillent), puis pleine en rouge avec une étiquette qui clignote (« MAX », « TA FORCE », « ??? »). **Jamais de vrai chiffre.** |
| **Carte de personnage** (`Carte`) | Carré de 300 à 340 px (150 en miniature), fond `#3B1012`, cadre blanc de 6 px. Sélectionnée : cadre rouge + lueur `0 0 40px rgba(232,38,43,0.7)`. Numéro dans une pastille en haut à gauche. |
| **Écran de sélection** | 4 cartes en carré 2 × 2 (centres à x 520 ± 160, y 690 et 1005), un curseur rouge qui passe de l'une à l'autre toutes les 0,32 s, puis toutes clignotent. |
| **Curseur de souris** | Flèche blanche à contour noir (SVG `M0 0 L0 48 L12 38 L20 58 L28 54 L20 34 L36 34 Z`). |
| **Fenêtre « COMMENTAIRE »** (`CtaCommentaire`) | Fenêtre à titre blanc, une phrase à compléter en 52 px (« MON SCORE : ? / 3 », « MOI, C'EST LE ... »), des cases grises qui apparaissent à 8 par seconde et un curseur rouge qui clignote à 2,5 Hz. Au-dessus : « 1RE LETTRE OFFERTE » (bloc rose, 52 px) et « LIEN EN BIO ↑ » (étiquette blanche). |
| **Fin MyMotiv** (`FinMyMotiv`) | Logo « mymotiv. » de 540 px de large à y 400, puis une fenêtre « MYMOTIV » avec 2 à 4 étapes cochées « ✓ » en rose (42 px). |
| **Jeu de rôle** (`MonCV`) | En-tête « NIV.1 » rouge + titre blanc à y 330 ; « LEVEL UP ! » rouge en 110 px qui clignote pendant « Niveau x » ; « SUCCÈS DÉBLOQUÉ » + gros chiffre rouge ; compteur qui monte par dizaines ; tampon sur deux lignes (`Tampon2`, −6°). |
| **Autres** | Notification de message, « message privé », « deal » avec lignes barrées, révélation « TOUT EST FAUX », fiche « effet … » avec cerveau et cadenas (`Mecanisme`), recruteur endormi (« zzz »), « LU JUSQU'AU BOUT » (`fauxdmTT.tsx`). |

---

## 7. Le pixel art (sprites)

**Le principe** : un dessin = une liste de lignes de texte. Chaque caractère est un pixel, « . » est transparent.
On l'affiche en carrés SVG nets (`shapeRendering="crispEdges"`), avec une taille de pixel de 5 (miniature) à 24 (très gros).

**Palette des lettres** :
`w` blanc cassé `#F4F1EC` · `r` rouge `#E8262B` · `d` rouge foncé `#8E1216` · `k` presque noir `#141010` ·
`g` gris `#8A8580` · `s` peau / gris clair `#C9C2BA` · `p` rose `#F08A9A` · `y` jaune `#F2C46D` · `b` bleu `#5E6BFF` ·
`m` gris foncé `#3A3433` · `c` beige `#D8C3A0` · `n` brun `#7A4E2D` (casquette de Yann).

Règles :
- **Petit** : 7 à 18 lignes, 6 à 16 colonnes. Toutes les lignes ont la même longueur (à vérifier).
- Les lettres sombres (`k`, `m`) sont **invisibles sur le fond noir** : poser le personnage sur une carte `#3B1012`.
- Personnages génériques uniquement : jamais la ressemblance d'une vraie personne.
- **Photo réelle en pixel** (seulement avec l'accord de la personne) : flou gaussien fort (rayon ≈ 2 % de la largeur),
  réduction à environ 22 × 27 blocs (visage ≈ 7 blocs de large, méconnaissable), 6 couleurs, fond clair rendu transparent,
  agrandissement « pixelated ». La photo d'origine n'entre jamais dans le dépôt. Révélation : chargement de haut en bas
  en 8 paliers, avec une ligne rouge qui balaie.
- **Photo qui respire avec la voix** : 6 mosaïques de 16 à 36 blocs de large (`tools/portrait-niveaux.py`, même la plus
  nette reste floue) ; l'enveloppe de la voix image par image (`tools/enveloppe-voix.py`, montée rapide, retombée lente,
  coup de pouce sur les syllabes accentuées) donne un niveau de 0,4 à 5 (`0,4 + 4,6 × e^1,6`) ; fondu entre les deux
  versions voisines (`PortraitVivant`, `src/Instinct.tsx`). Plus nette quand on parle fort, plus floue dans les pauses.

**Personnages** (14 × 18) :

```
LINA (alternance, sweat rose, sac)      KARIM (1er job, toque de diplômé)
....kkkkkk....                          ...kkkkkkkk...
...kkkkkkkk...                          .kkkkkkkkkkkk.
..kssssssssk..                          ...kkkkkkkky..
..kskssssksk..                          ...ssssssssy..
..kssssssssk..                          ...skssssks...
..ksssppsssk..                          ...ssssssss...
..kksssssskk..                          ...sssmmsss...
..kk..ss..kk..                          ....ssssss....
.kkppppppppkk.                          .....ssss.....
.pppppppppppp.                          ..wwwwrrwwww..
.pprpppppprpp.                          .wwwwwrrwwwww.
.pprpppppprpp.                          .wwwwwrrwwwww.
.ss.pppppp.ss.                          .ww.wwrrww.ww.
....bbbbbb....                          .ss.mmmmmm.ss.
....bbbbbb....                          ....mmmmmm....
....bb..bb....                          ....mm..mm....
....bb..bb....                          ....mm..mm....
...kkk..kkk...                          ...kkk..kkk...

SANDRINE (reconversion, chignon,        DÉTENU (rayures, bras levés : les 2 premières
lunettes, veste rouge)                  lignes = les mains, qui restent sur la barre)
......mm......                          .ss........ss.
.....mmmm.....                          .ss........ss.
...mmmmmmmm...                          .ww..mmmm..ww.
..mmssssssmm..                          .kk.mmmmmm.kk.
..mkkksskkkm..                          .ww.ssssss.ww.
..mssssssssm..                          .kk.skssks.kk.
...sssppsss...                          .ww.ssssss.ww.
....ssssss....                          .kk.smmmms.kk.
.....ssss.....                          .ww..ssss..ww.
..rrrwwwwrrr..                          .kkwwwwwwwwkk.
.rrrrrwwrrrrr.                          ..kkkkkkkkkk..
.rrrrrwwrrrrr.                          ..wwwwwwwwww..
.rr.rrrrrr.rr.                          ..kkkkkkkkkk..
.ss.kkkkkk.ss.                          ...wwwwwwww...
....kkkkkk....                          ...kkk..kkk...
....kk..kk....                          ...www..www...
....kk..kk....                          ...kkk..kkk...
...rrr..rrr...                          ...mm....mm...
```

```
YANN masqué (casquette beige et brune, cagoule, bras levés pour les tractions)
.ss........ss. / .ss........ss. / .mm..cccc..mm. / .mm.cccccc.mm. / .mm.cccccc.mm. / .mm.nnnnnn.mm. / .mm.kkkkkk.mm. /
.mm.skssks.mm. / .mm.kkkkkk.mm. / .mmmkkkkkkmmm. / ..mmmmmmmmmm.. / ..mmmmppmmmm.. / ..mmmmmmmmmm.. / ...mmmmmmmm... /
...kkk..kkk... / ...kkk..kkk... / ...kkk..kkk... / ...ww....ww...
```
Sur une carte, garder l'étiquette du nom au-dessus des mains : taille de pixel 12 pour une carte de 300 px, 7 pour 200 px.

**Objets et icônes** :

```
BILLET          pppppppppppppp / pwwwwwwwwwwwwp / pwppppwwppppwp / pwpppwrrwpppwp / pwppppwwppppwp / pwwwwwwwwwwwwp / pppppppppppppp
CIBLE           ..rrrrr.. / .rwwwwwr. / rwwrrrwwr / rwrrwrrwr / rwrwwwrwr / rwrrwrrwr / rwwrrrwwr / .rwwwwwr. / ..rrrrr..
TÉLÉPHONE       kkkkkk / kwwwwk / kwrrwk / kwwwwk / kwwwwk / kkwwkk / kkkkkk
AGENCE          rrrrrrrrrrrrrr / rwwwwwwwwwwwwr / rrrrrrrrrrrrrr / .wwwwwwwwwwww. / .wkkwwkkwwkkw. / .wkkwwkkwwkkw. / .wwwwwwwwwwww. / .wkkwwwwwwkkw. / .wkkwwmmwwkkw. / .wwwwwmmwwwww. / .wwwwwmmwwwww.
ENVELOPPE       wwwwwwwwwwwwww / wrwwwwwwwwwwrw / wwrwwwwwwwwrww / wwwrwwwwwwrwww / wwwwrrwwrrwwww / wwwwwwrrwwwwww / wwwwwwrrwwwwww / wwwwwwwwwwwwww / wwwwwwwwwwwwww
CŒUR            .rr.rr. / rrrrrrr / rrrrrrr / .rrrrr. / ..rrr.. / ...r...
CADENAS         ..rrrr.. / .r....r. / .r....r. / rrrrrrrr / rrrwwrrr / rrrwwrrr / rrrrrrrr
ŒIL             ...wwwww... / .ww.....ww. / w...rrr...w / w..rrkrr..w / w...rrr...w / .ww.....ww. / ...wwwww...
CERVEAU         ..pppppp.. / .pprpppppp / pppppprppp / pprpppppp. / pppppprppp / .pppprpppp / ..pppppp.. / ....pp....
COURONNE        r..r..r..r / rr.rr.rr.r / rrrrrrrrrr / rrrrrrrrrr / rwrrwrrwrr
BOUCLIER        rrrrrrrrr / rrrrwrrrr / rrrrwrrrr / rrwwwwwrr / rrrrwrrrr / .rrrwrrr. / ..rrrrr.. / ...rrr... / ....r....
FIOLE           ..www.. / ..w.w.. / ..w.w.. / .wr.rw. / wrrrrrw / wrrrrrw / .wwwww.
LECTURE ▶       rr.... / rrrr.. / rrrrrr / rrrr.. / rr....
ZZZ             wwww.. / ...w.. / ..w... / .w.... / wwww..
SILHOUETTE      ...gggg... / ..gggggg.. / ..gggggg.. / ..gggggg.. / ...gggg... / ....gg.... / .gggggggg. / gggggggggg / gggggggggg / gggggggggg
PETIT HOMME     ..ssss.. / .ssssss. / .skssks. / .ssssss. / ..s..s.. / .wwwwww. / wwwwwwww / wwwwwwww
TRACTION        rrrrrrrrrrrrrr / .w..........w. / .w..........w. / ..w..wwww..w.. / ...w.wwww.w... / ....wwwwww.... / ....wwwwww.... / .....wwww..... / ....wwwwww.... / ....wwwwww.... / ....ww..ww.... / ....ww..ww....
BOULE DE VOYANTE  .....rrrrrr..... / ...rrddddddrr... / ..rddddddddddr.. / .rddpwddddddddr. / .rdppdddddddddr. / rddpddddddddddr. / rdddddddddddddr. / rdddddddddddddr. / rdddddddddddddr. / .rddddddddddddr. / .rddddddddddddr. / ..rddddddddddr.. / ...rrddddddrr... / ....kkkkkkkk.... / ...mmmmmmmmmm... / ..mmmmmmmmmmmm..
```

Dans le code : `ICON` (`FauxDM.tsx`), `BOULE` (`Barnum.tsx`), `PULLUP` (`MotRouge.tsx`), `BILLET` et `CIBLE`
(`GagnerTaVie.tsx`), `MONTRE` et `ANCRE` (`Ancrage.tsx`), les 4 personnages (`TesLequel.tsx`).

---

## 8. Le mouvement (motion design pixel)

**Tout bouge par paliers, jamais en douceur** : c'est ce qui donne l'effet « jeu vidéo ».

| Mouvement | Recette |
|---|---|
| **Apparition** (`P`) | Échelle de 0,5 à 1 en **4 paliers** sur 0,16 s, sans fondu. |
| **Texte qui s'écrit** | Lettre par lettre, en 0,45 à 0,5 s par ligne. |
| **Rotation, balancement** | Arrondis : `Math.round(sin(t × 3) × 3) × 3` degrés, ou des pas de 10°. |
| **Clignotement** | `Math.floor(t × k) % 2` : curseur 2,5 Hz, étiquette d'alerte 4 Hz, cartes 5 Hz. |
| **Pulsation** | Échelle +12 % par demi-paliers (cible qui bat). |
| **Glitch** | 0,12 à 0,18 s, sur les coupes et les chocs (tampon, révélation, « Calme-toi »). |
| **Compteur** | Un nombre qui monte d'un cran à chaque action (une traction toutes les 0,7 s). |
| **Animation de sprite** | Découper le sprite : les mains restent fixes, le corps monte de 2 pixels (traction). |
| **Pluie d'objets** (décor) | Billets qui tombent à des vitesses variées, légère rotation par pas de 10°, opacité 85 %. |

À éviter dans le style pixel : flou, ombres douces animées, caméra 3D, courbes d'accélération lisses.
Ces effets sont réservés au style « Révélation » (§ 12).

### Caler l'image sur la voix
- On fabrique **d'abord la voix**, puis on cale tout sur ses mots (`at(i)` = l'instant du mot n° i).
- Un élément apparaît **0,08 s avant son mot**. Une scène change **0,15 s avant le début de sa phrase**.
- **Sous-titres** : morceaux de 6 mots au maximum, coupés à la ponctuation. Chaque mot apparaît 0,08 s avant
  d'être dit. Les mots-clés passent en rouge. On cache les sous-titres pendant un compte à rebours ou une liste à lire.
- Le premier écran est visible **dès l'image 0** (apparition démarrée à −0,2 s) : le hook se lit sans le son.

---

## 9. La structure des vidéos

**Le modèle de base (30 à 35 s)** :
1. **Hook (2 à 3 s)** : une phrase choc en gros, visible dès l'image 0, avec un glitch.
2. **L'illustration (5 à 8 s)** : un exemple concret (une montre soldée, un DM, une lettre).
3. **Le mécanisme** : on nomme l'effet psychologique, ou pas (choix possible : « T'es lequel des 4 » ne le nomme pas).
4. **Le lien avec la lettre** : ce que ça change chez le recruteur.
5. **MyMotiv** : logo + 2 à 4 étapes cochées.
6. **CTA** : une question facile en commentaire (un mot, un chiffre, un score), plus « 1re lettre offerte, lien en bio ».
7. **(option) Une chute drôle** après le CTA (« Et le numéro 4… rends le téléphone »).

**Formats déjà faits** (à réutiliser comme modèles) :

| Format | Idée | Composition |
|---|---|---|
| Faux DM | Une histoire en messages privés, puis « TOUT EST FAUX » (effet Zeigarnik) | `FauxDMTikTok`, `FauxDM30TikTok` |
| Le mot rouge | Test participatif : retenir une liste, un seul mot en rouge (effet Von Restorff) | `MotRougeTikTok` |
| Je lis dans ta tête | Faux voyant avec boule de cristal (effet Barnum) | `BarnumTikTok` |
| Effets psycho | Un effet par vidéo : halo, ancrage, similarité, récence | `PremiereLigne`, `Ancrage`, `Miroir`, `Recence` |
| Quiz | 3 duels lettre A / lettre B avec compte à rebours de 3 s | `QuizRecruteur` |
| Citation retournée | Une phrase connue entre guillemets, retournée en jeu de mots | `GagnerTaVie` |
| Choisis ton personnage | Écran de sélection, une fiche par profil avec jauges, chute d'humour | `TesLequel` |
| Mon CV en jeu de rôle | Qui est derrière MyMotiv : niveaux, succès, recommandations, puis le lien avec MyMotiv | `MonCV` |
| Défi « suis ton instinct » | 3 choix A / B avec compte à rebours ; la révélation finale montre que les bons choix sont un vrai parcours | `Instinct` |

---

## 10. Le son (chiptune)

**La musique** (`PixelSon.pub`), en 4 parties :
- **A (tendu)** : la mineur, fa, ré mineur, mi.
- **Creux (suspense)** : basse seule et tic-tac, pour le moment du doute ou de la révélation.
- **B** : la mineur, sol, fa, sol.
- **C (majeur, avec mélodie)** : do, sol, la mineur, fa. C'est la partie de MyMotiv et du CTA.
- Pour finir : un accord tenu et une petite ritournelle de 4 notes.

Instruments 8 bits adoucis :
- arpège en onde carrée, en doubles-croches ;
- basse en onde triangle, en croches ;
- grosse caisse sur les temps 1 et 3, charleston à contretemps ;
- un temps dure 0,5 à 0,55 s.

**Les bruitages** : un geste = un son.

| Ce qui se passe à l'écran | Son |
|---|---|
| Un élément apparaît | `ppop` : petit « pop » montant |
| Message ou notification | `ping` : deux notes carrées, si puis mi |
| Texte qui s'écrit | `typer` : bips de dialogue vers 1,7 kHz |
| Tampon, coup | `stamp` : coup sourd |
| Erreur, mauvaise réponse | `buzzer` : deux bips graves à 140 Hz |
| Jauge qui se remplit, montée | `riseblips` : bips qui montent |
| Révélation | `impact` (grave qui descend) + `chime` (3 notes claires) |
| Glitch | `glitch` : bruit haché façon « bitcrush » |
| Clic, curseur | `click` |
| « Stop ! », coupure nette | `tapestop` : disque qui ralentit |
| Téléphone qui sonne | carrés alternés 1 320 / 1 660 Hz, toutes les 0,08 s |
| Changement de scène | `whoosh` : vrais whooshes de la bibliothèque `public/sfx/` |

**Le mixage** :
- musique à 0,45, baissée de moitié sous la voix ; bruitages à 1,5 ;
- fondu de sortie de 0,8 s ;
- volume final **−14 LUFS**, crête −1 dB (norme TikTok).

**La voix** :
- ElevenLabs Eleven v4, voix de Yann (« Alexandre »).
- Une phrase par fichier, avec une balise d'émotion au début : `[mysterious]`, `[confident]`, `[warm]`, `[amused]`,
  `[playful]`, `[laughs]`, `[intense]`.
- Accélérée ×1,1, avec 0,2 à 0,35 s de pause entre les phrases.
- Chaque phrase est vérifiée par une transcription automatique, et refaite si un mot est mal prononcé. Deux erreurs de
  la transcription sont de fausses alertes à connaître : « MyMotiv » entendu « Ma émotive », « lien en bio » entendu
  « y'a en bio ».

---

## 11. La méthode et les contrôles (à chaque vidéo)

1. Écrire le texte de la voix (phrases courtes, tutoiement). Fabriquer la voix, puis la vérifier.
2. Vérifier que le nom de la composition est libre (`ls src/`). Ne jamais écraser une vidéo existante.
3. Construire les scènes calées sur les mots, puis le son (`synth_<nom>.py`) calé sur les mêmes instants.
4. **Planches d'images** à 8 à 16 instants clés, avec le calque des zones sûres. Vérifier :
   - rien hors zone ;
   - aucun texte coupé ni trop large ;
   - rien sur les sous-titres ;
   - pas d'écran vide entre deux scènes ;
   - un titre lisible à chaque état ;
   - aucun glyphe manquant (« … », « ° »).
5. Rendu final, puis contrôle :
   - durée et volume (−14 LUFS) ;
   - nouvelles planches tirées de la vidéo finale ;
   - fichier de 30 Mio au maximum.

Commandes du dépôt :

```
python3 tools/voix-elevenlabs.py <ligne.txt> <ligne.mp3> --voix yann
python3 tools/assembler-lignes.py voix-<nom>.json <nom>
python3 synth_<nom>.py
COMP=<Id> REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell node render.mjs stills 0.3 5 12
python3 tools/planche-zones.py "prev/<Id>-*.png" planche.png
COMP=<Id> BITRATE=10M REMOTION_BROWSER=… node render.mjs
```

---

## 12. Les autres DA du projet (résumé)

**Style « Apple »** (`src/apple.tsx`, 60 i/s) :
- Fond clair `#F2F2F4` avec des cadres blancs, ou noir clair `#1C1C1E` avec des cartes `#2C2C2E`.
- Un seul accent rose `#D9828B`, police Poppins.
- Un seul cadre qui se transforme (rond → pilule → carte → pilule), avec un rebond d'inertie à chaque arrivée
  (amplitude 0,05, fréquence 4, amortissement 8).
- Décalages : 0,05 s par mot, 0,03 s par lettre. Un appui de 0,1 à 0,2 s avant chaque transformation.

**Style « Révélation »** (`src/motion.tsx`) :
- Halo rose très sombre, lumière rose partout.
- Caméra 3D : entrée en rotation de 30° à 9°, échelle de 0,62 à 0,86, flou de 16 à 0 en 0,5 s.
- Coups de fouet entre les scènes : 0,35 s, avec un whoosh.
- Flou de mise au point (6 à 8 px) sur ce qui n'est pas le sujet.
- Flash, onde de choc. Fin avec des bulles de verre roses et une pilule noire brillante.

**« Dark Deco »** (Super-recrues, épisode 2, `EpisodeCommercial`) :
- Dessin animé des années 90 peint sur fond noir (encre `#05040A`, papier `#FFF8EA`).
- Bureau Art déco, fenêtre sur la ville la nuit, projecteurs.
- Héros : OroSerpente (cagoule noire, casquette beige et brune).

**Film noir Art déco** (`SuperRecrues`, `EpisodeTele`) :
- Ville de nuit dessinée en code, projecteurs, signal dans les nuages.
- Héros en silhouette, sans emblème.
- Étalonnage « nuit Art déco ».

**3D low-poly « Motiv »** (`HistoireNom`, `HistoireNuit`) :
- La nuit dans une chambre. Motiv, la petite enveloppe rose qui parle (grands yeux, rabat en V).
- Le site s'affiche en hologramme.

**Couleurs et polices de la marque** :
- Fond `#0B0A0B`, rose `#D9828B`, rose clair `#F2B8C0` ; thème clair en bleu `#0A66C2`.
- Poppins pour les titres, Open Sans pour le texte.
- Logo « mymotiv. » en rose.

---

## 13. À ne pas faire (design)

- Pas d'imitation de l'interface d'une vraie marque (ChatGPT, Facebook, TikTok…).
- Pas de photo ni de ressemblance d'une personne réelle.
- Pas de personnages ni de logos de super-héros existants.
- Pas de musique de jeu vidéo existante : on fabrique la nôtre.
- Pas de faux chiffres déguisés en statistiques : les jauges sont des jauges de jeu, sans nombre.
- Pas de texte important hors de la zone sûre, pas plus de 3 blocs par écran.
- Pas de « … » ni de « ° » dans la police pixel.
- Pas de pixels `k` ou `m` directement sur le fond noir.

---

## 14. Décrire cette DA à une autre IA d'images (prompt type, en anglais)

> 8-bit retro pixel art, vertical 9:16, near-black warm background (#070303) with a soft red radial glow in the
> center, subtle CRT scanlines, tiny floating red dust specks. Retro computer windows with thick red borders and a
> solid red title bar with three small squares. Bold pixel font text (Silkscreen style) in off-white (#F4F1EC) and
> vivid red (#E8262B), one accent color only. Small chunky pixel characters with flat colors, no gradients, no blur,
> crisp hard edges. Moody, playful, video-game UI feel. Keep all text inside the central safe area (x 120–920,
> y 280–1440 on 1080×1920).
