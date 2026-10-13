# Storyboard — « Comment faire une montagne de cash »

**Format** : TikTok 9:16, environ 35 s, univers pixel noir et rouge (voir le guide `.claude/skills/da-pixel/`).
**Voix** : Yann (`--voix yann`), ton « tuto » très sérieux… pour une blague.
**Idée** : un faux tuto pour devenir riche. Les étapes sont vraies : trouver une offre, écrire une vraie lettre avec MyMotiv,
décrocher le poste. Puis on empile son premier salaire, 1 400 €, en billets de 5 € pour que ça fasse le plus gros tas
possible. La caméra filme le tas en contre-plongée, comme l'Everest, avec un petit grimpeur et un drapeau… puis elle recule :
c'est une colline à côté d'une tasse de café.
**Pourquoi ça marche** : l'accroche « cash » arrête le scroll. Le tuto passe par la vraie candidature (MyMotiv), et
l'autodérision évite l'effet « deviens riche facilement ». La chute fait sourire, donc on regarde jusqu'au bout.

**Garde-fous**
- Aucune promesse : l'étape 3 dit « ça dépend de toi… donne-toi toutes les chances ».
- « 1 400 € » est un exemple de premier salaire, pas une statistique.
- Le calcul est juste : 280 billets × 5 € = 1 400 €.
- Notification de virement générique : pas l'interface d'une vraie banque.
- Billets dessinés en pixel (le `BILLET` de `GagnerTaVie`), jamais de faux billets qui imitent les euros.
- Entreprise fictive du projet : Maison Lumen.

---

## Les plans

| # | Temps | Image (dans la zone sûre x 120–920, y 280–1440) | Voix | Son |
|---|---|---|---|---|
| 1 | 0 → 3 s | **Accroche.** Dès l'image 0, une montagne de billets pixel en très gros plan, vue d'en bas, avec un drapeau rouge au sommet. En haut, « COMMENT FAIRE UNE\nMONTAGNE DE CASH » (BigTT 52 px, blanc et rouge). Étiquette « TUTO EN 4 ÉTAPES ». Glitch à l'ouverture. | « Comment faire une montagne de cash. Tuto en quatre étapes. » | Accord épique 8 bits + « ka-ching » (caisse enregistreuse) |
| 2 | 3 → 7 s | **Étape 1.** Étiquette rouge « ÉTAPE 1/4 ». Fenêtre « OFFRE D'EMPLOI » : « MAISON LUMEN », 2 lignes grisées. Le curseur pixel clique sur le bouton « POSTULER ». | « Étape un : tu trouves une offre qui te plaît. » | Clics, pop au clic |
| 3 | 7 → 14 s | **Étape 2.** « ÉTAPE 2/4 ». Le logo mymotiv. puis la fenêtre « MYMOTIV » : ✓ PART DE L'OFFRE · ✓ LEURS VRAIS BESOINS · ✓ TES VRAIES PREUVES. Petit bloc rose « 1RE LETTRE OFFERTE ». | « Étape deux : tu écris une lettre qui part de l'offre. Leurs vrais besoins, tes vraies preuves. Ça, MyMotiv le fait pour toi. » | Bips qui montent à chaque ✓ |
| 4 | 14 → 19 s | **Étape 3.** « ÉTAPE 3/4 ». Tampon qui s'écrase : « EMBAUCHÉ ? ». Le « ? » clignote, puis l'étiquette « DONNE-TOI TOUTES\nLES CHANCES ». | « Étape trois : tu décroches le poste. Bon, ça, ça dépend de toi… mais donne-toi toutes les chances. » | Tampon, petit suspense (tic-tac) |
| 5 | 19 → 26 s | **Étape 4.** « ÉTAPE 4/4 ». Notification « VIREMENT REÇU : 1 400 € », puis un distributeur pixel qui crache des billets. Compteur « BILLETS : 0 → 280 » et étiquette « 280 × 5 € = 1 400 € ». Les billets s'empilent par paliers, et la musique monte. | « Étape quatre : premier salaire, mille quatre cents euros. Tu retires tout… en billets de cinq. Deux cent quatre-vingts billets. Et tu empiles. » | Distributeur « brrrt », un « fft » par billet qui accélère, montée épique |
| 6 | 26 → 29 s | **La montagne.** Contre-plongée extrême : le tas remplit l'écran comme un sommet enneigé (billets blancs en haut). Le petit Yann pixel (casquette, cagoule) grimpe avec un piolet et plante un drapeau « 1 400 € ». Étiquette « SOMMET ATTEINT ». Léger tremblement, poussière. | (épique, lent) « Regarde-moi… cette montagne. » | Fanfare 8 bits, vent |
| 7 | 29 → 31 s | **La chute.** La caméra recule d'un coup, en 4 paliers : le « sommet » est un petit tas, à côté d'une tasse de café géante. Le grimpeur est minuscule. Étiquette rouge « C'EST UNE COLLINE. » | « … Bon. C'est une colline. » | Disque qui ralentit, puis « wah-wah » triste (carrés qui descendent) |
| 8 | 31 → 36 s | **CTA.** Fenêtre « COMMENTAIRE » : « MONTAGNE OU\nCOLLINE ? » + cases qui se remplissent. Au-dessus : « 1RE LETTRE OFFERTE » (rose) et « LIEN EN BIO ↑ ». Le petit tas reste en bas, avec son drapeau. | « Montagne ou colline ? Dis-le en commentaire. Première lettre offerte, lien en bio. » | Musique en majeur, ritournelle finale |

---

## Texte de la voix (pour ElevenLabs, une ligne par fichier)

1. [confident] Comment faire une montagne de cash. Tuto en quatre étapes.
2. [confident] Étape un : tu trouves une offre qui te plaît.
3. [warm] Étape deux : tu écris une lettre qui part de l'offre. Leurs vrais besoins, tes vraies preuves. Ça, MyMotiv le fait pour toi.
4. [amused] Étape trois : tu décroches le poste. Bon, ça, ça dépend de toi… mais donne-toi toutes les chances.
5. [excited] Étape quatre : premier salaire, mille quatre cents euros. Tu retires tout… en billets de cinq. Deux cent quatre-vingts billets. Et tu empiles.
6. [dramatic] Regarde-moi… cette montagne.
7. [deadpan] … Bon. C'est une colline.
8. [playful] Montagne ou colline ? Dis-le en commentaire. Première lettre offerte, lien en bio.

---

## Ce qu'il faut fabriquer
- **Sprites** : billet (déjà fait), distributeur, tasse de café, drapeau, piolet, Yann grimpeur (variante du sprite `YANN` de `MonCV`).
- **La montagne** : 280 billets en pixel, empilés avec un léger décalage aléatoire. Contre-plongée = grande échelle + point
  de vue bas, haut en blanc. Le recul se fait en 4 paliers d'échelle, pour rester dans le style pixel.
- **Briques existantes** : `Win`, `Tag`, `BigTT`, `Tampon`, `Curseur`, `FinMyMotiv`, `CtaCommentaire`, et le son `PixelSon.pub`
  (mineur → montée → majeur).

## Option : version tournée en vrai
Tu peux aussi filmer le plan 6 et le plan 7 toi-même.
- Pose ton téléphone à plat sur la table, au ras du tas de billets, avec la lumière de côté.
- Ajoute une petite figurine qui « grimpe », puis recule le téléphone d'un coup pour montrer la tasse.
- Utilise de **vrais billets**, jamais de faux billets qui imitent les euros.
- Si tu n'as pas 280 billets de 5 €, ne dis pas « 280 billets » à l'image : garde la version pixel pour le compteur.

## Description (modèle standard v1)
**TikTok**
```
Comment faire une montagne de cash (tuto en 4 étapes) 💸
Étape 1 : une offre. Étape 2 : une vraie lettre. Étape 3 : le poste. Étape 4 : tu empiles.
Avec MyMotiv, ta lettre part de l'offre et de ton CV, avec tes vraies preuves. 1re lettre offerte, lien en bio.
Montagne ou colline ? 👇
#lettredemotivation #recherchedemploi #alternance #candidature #MyMotiv
```
