# Les Super-recrues · Épisode 2 : « Le SuperCommercial »

> **Version montée** (composition `EpisodeCommercial`) : faite avec la case 1 et la planche de 8 expressions envoyées par le
> propriétaire ; le recruteur est dessiné en ombre chinoise, la lettre et l'interrogatoire en code. Répliques finales :
> `voix-commercial.json`. Les cases 2 à 8 ci-dessous restent utilisables pour une version plus riche.

**Format** : BD animée verticale 9:16, ≈ 50 s, 8 cases, direction artistique « Dark Deco » (cel animation 90s peinte sur fond noir).
**Pitch** : Yann, le justicier masqué, postule au poste de **SuperCommercial B2B** chez **Boréal Logistique** (entreprise fictive).
Il est sûr de lui : « Je sauve des villes, je peux bien vendre des palettes. » Il applique ses méthodes de héros au B2B, et tout
rate. Il finit par décrocher le poste grâce à une lettre qui parle enfin de leurs clients.
**Mentions à l'écran** : « Mise en scène · Parodie » · entreprise fictive · « * temps mesuré : 27 à 35 s par lettre ».
**Règles** : aucun nom de personnage ou de marque de super-héros existants, aucun emblème sur le costume, aucun chiffre inventé.

## Les personnages et leurs voix

| Personnage | Allure (à garder identique dans toutes les cases) | Voix ElevenLabs |
|---|---|---|
| **Yann** (le justicier) | Le look de la case 1 : cagoule noire qui ne laisse voir que les yeux, casquette beige et brune, veste noire ample, silhouette massive. **Joindre `public/episode2/case-1.jpg` comme référence de personnage.** | « David » (`--voix batyann`), grave et sûr de lui |
| **Le recruteur** de Boréal Logistique | Homme élancé et anguleux, costume trois pièces années 30, cheveux gominés, lunettes rondes, sourcil toujours levé. | « Vincent » (`--voix recruteur`) |
| **Le livreur** (case 2) | Petit homme en salopette, casquette de travail, terrifié. | « Maxime » (`--voix candidat`) |
| **Le narrateur** | Voix off de film noir. | « Paul K » (`--voix narrateur`) |

## Comment générer les images
1. Dans ton outil d'images, joins les 4 images de référence de la bible (`image_15` à `image_18`) **et** la case 1 (`public/episode2/case-1.jpg`) pour garder le même Yann.
2. Colle **un prompt par case** et choisis le **format portrait** dans l'outil (sinon il sort en paysage ; un paysage reste utilisable, la caméra glisse dedans).
3. Si l'IA ajoute une enseigne ou un nom connu sur un immeuble (elle a mis un globe « Daily Planet », marque de Superman, dans la case 1), je l'efface au montage.
4. Les images doivent rester **sans texte** : j'ajoute ensuite les bulles, les sous-titres et le vrai site MyMotiv dans le montage.
5. Envoie-moi les 8 images : je fais les voix, la musique, l'animation et la fin.

---

## CASE 1 — L'annonce (accroche) ✅ image reçue
**Image** : `public/episode2/case-1.jpg` (globe « Daily Planet » remplacé par une flèche Art déco). Paysage : la caméra part de la tour
aux projecteurs croisés (le siège de Boréal Logistique) et glisse jusqu'à Yann, qui se retourne.
**Voix off** : « Boréal Logistique cherche un SuperCommercial B2B. »
**Yann** (sûr de lui) : « Commercial ? Je sauve des villes entières. Je peux bien vendre des palettes. »
**Son** : sirène lointaine, pluie fine, coup de grosse caisse sur « palettes ».

```text
Une illustration de dessin animé 2D dans le style "Dark Deco" et film noir des années 90, inspirée de la "cel animation" traditionnelle peinte sur fond noir (backgrounds painted on black illustration boards). Format vertical 9:16. Lignes d'encrage d'une grande netteté, aplats de couleurs, ombres dures, aucune texture moderne, aucun dégradé numérique (image_15.png).

Plan en forte contre-plongée depuis le parapet d'un gratte-ciel Art Déco, la nuit : au premier plan, un homme masqué accroupi sur une statue d'aigle stylisée en pierre, de trois-quarts arrière, consulte un petit téléphone dont l'écran projette une lueur orange sur sa mâchoire. Au loin, une immense tour Art Déco à gradins, sa couronne en éventail illuminée, entourée de six faisceaux de projecteurs parallèles qui transpercent les nuages violets (image_17.png).

Contraste féroce : 60 % de noir d'encre, de bleu nuit et de violet profond ; la ville en contrebas forme une répétition rythmée de milliers de fenêtres dorées et de balises rouges le long des avenues (image_15.png). Seul éclat chaud au premier plan : la lueur orange du téléphone, qui fait écho aux fenêtres lointaines (image_18.png).

L'homme masqué (voir image de référence jointe : cagoule noire qui ne laisse voir que les yeux, casquette beige et brune portée droite, veste noire ample, silhouette massive aux épaules larges, aucun logo ni emblème), massif et sculptural, est presque entièrement dévoré par l'ombre ; un liseré de lumière bleu électrique et ambre découpe son profil et ses épaules (image_18.png).

Pas de texte, aucun logo, aucun nom ni aucune enseigne sur les bâtiments. Sombre, contrasté, nocturne et intensément cinématique.
```

## CASE 2 — « Qualifier un prospect »
**Yann** (penché, menaçant) : « Budget ? Décideur ? Besoin ? Délai ? »
**Le livreur** (paniqué) : « Je… je viens juste livrer des palettes ! »
**Voix off** : « Première leçon de B2B : on ne qualifie pas un prospect… comme un suspect. »
**Son** : grésillement de l'ampoule, chaise qui grince.

```text
Une illustration de dessin animé 2D dans le style "Dark Deco" et film noir des années 90, cel animation traditionnelle peinte sur fond noir. Format vertical 9:16. Encrage épais et net, aplats de couleurs, ombres dures, aucune texture moderne (image_15.png).

Plan en plongée dans une salle d'interrogatoire Art Déco plongée dans le noir : une unique ampoule nue suspendue au plafond dessine un cône de lumière dure. Assis sur une chaise en métal sous la lampe, un petit homme en salopette et casquette de travail, les yeux écarquillés, serre une feuille de bon de livraison ; derrière lui, une palette en bois se devine dans l'ombre. Au premier plan, de dos et en contre-jour, la silhouette massive d'un homme masqué se penche vers lui, les deux mains posées sur la table.

Contraste féroce : tout ce qui sort du cône de lumière disparaît dans le noir d'encre, le bleu nuit et le violet profond (image_17.png). Le cône de l'ampoule crée des éclats jaune d'or et ocre sans transition douce sur le visage du livreur et le bord de la table (image_16.png). Des stores vénitiens projettent des bandes de lumière bleue parallèles sur le mur du fond, en répétition rythmée.

L'homme masqué (voir image de référence jointe : cagoule noire qui ne laisse voir que les yeux, casquette beige et brune portée droite, veste noire ample, silhouette massive aux épaules larges, aucun logo ni emblème) est une silhouette sculpturale aux épaules larges, découpée par un liseré ambre (image_18.png). Ton de comédie : le livreur est minuscule et terrifié, l'homme masqué immense et beaucoup trop sérieux.

Pas de texte, aucun logo, aucun nom ni aucune enseigne sur les bâtiments. Sombre, contrasté, nocturne, théâtral.
```

## CASE 3 — « Prospection à froid »
**Yann** (collé à la vitre, sous la pluie) : « Bonsoir. Vous avez cinq minutes pour parler logistique ? »
**Voix off** : « Deuxième leçon : la prospection à froid, ce n'est pas sur un toit… à minuit. »
**Son** : pluie forte, tasse qui tombe, cri étouffé.

```text
Une illustration de dessin animé 2D dans le style "Dark Deco" et film noir des années 90, cel animation traditionnelle peinte sur fond noir. Format vertical 9:16. Encrage net, aplats, ombres dures, aucune texture moderne (image_15.png).

Plan intrusif depuis l'intérieur d'un bureau de direction Art Déco au dernier étage d'une tour, la nuit : au premier plan, de trois-quarts arrière et dans l'ombre, un directeur en costume sursaute dans son fauteuil en cuir, sa tasse de café renversée en l'air. Derrière la grande fenêtre ziggourat, sous une pluie battante, un homme masqué accroupi sur le rebord extérieur colle son visage à la vitre, un index levé poliment (le cadre dans le cadre, image_17.png).

L'intérieur est plongé dans une pénombre presque totale (noir, bleu nuit, violet profond) ; une seule lampe de bureau à abat-jour vert projette des éclats orangés et ambrés sur le bureau et la tasse, sans dégradé doux (image_18.png). Dehors, la pluie tombe en traits blancs parallèles ; la ville en contrebas scintille de fenêtres dorées et de balises rouges en répétition rythmée ; un éclair bleu électrique découpe la silhouette de l'homme masqué.

L'homme masqué (voir image de référence jointe : cagoule noire qui ne laisse voir que les yeux, casquette beige et brune portée droite, veste noire ample, silhouette massive aux épaules larges, aucun logo ni emblème), massif et anguleux, est découpé par un liseré bleu électrique (image_18.png). Ton de comédie : le directeur est terrorisé, l'homme masqué très courtois.

Pas de texte, aucun logo, aucun nom ni aucune enseigne sur les bâtiments. Sombre, contrasté, nocturne et intensément cinématique.
```

## CASE 4 — Il écrit sa lettre lui-même
*Texte que j'ajoute sur la feuille* : « Madame, Monsieur, je suis rapide, fort et je ne dors jamais. »
**Yann** (fier) : « Parfait. Ils vont adorer. »
**Son** : machine à écrire, « ding » de fin de ligne.

```text
Une illustration de dessin animé 2D dans le style "Dark Deco" et film noir des années 90, cel animation traditionnelle peinte sur fond noir. Format vertical 9:16. Encrage net, aplats, ombres dures (image_15.png).

Plan en légère contre-plongée, de trois-quarts arrière, dans un repaire souterrain Art Déco : un homme masqué est assis à un bureau massif en bois sombre, penché sur une machine à écrire rétro aux touches rondes en métal ; une feuille blanche vierge sort du rouleau. Autour de lui, des boules de papier froissé jonchent le sol et le bureau. Derrière, une grande arche à gradins s'ouvre sur une ville lointaine aux fenêtres dorées et aux projecteurs croisés (image_17.png).

Le repaire est presque entièrement dans le noir d'encre, le bleu nuit et le violet ; une seule lampe de bureau Art Déco projette un cône orange brûlé sur la machine à écrire et la feuille blanche, qui brille comme un éclat saturé (image_16.png). Les reflets métalliques de la machine sont marqués de touches indigo.

L'homme masqué (voir image de référence jointe : cagoule noire qui ne laisse voir que les yeux, casquette beige et brune portée droite, veste noire ample, silhouette massive aux épaules larges, aucun logo ni emblème), aux épaules massives, est découpé par un liseré ambre et bleu (image_18.png). Il tape avec deux doigts seulement, l'air extrêmement satisfait de lui.

Pas de texte, la feuille reste vierge, aucun logo ni enseigne. Sombre, contrasté, nocturne.
```

## CASE 5 — Le recruteur lit la lettre
**Le recruteur** (lisant, pince-sans-rire) : « "Je ne dors jamais." … Vous postulez pour commercial, ou pour vigile de nuit ? »
**Le recruteur** : « On vend à des industriels. Votre lettre ne parle ni d'eux… ni de nous. »
**Yann** (vexé) : « … »
**Son** : horloge, papier froissé, silence gênant.

```text
Une illustration de dessin animé 2D dans le style "Dark Deco" et film noir des années 90, cel animation traditionnelle peinte sur fond noir. Format vertical 9:16. Encrage net, aplats, ombres dures (image_15.png).

Plan en contre-plongée dans un immense bureau de direction Art Déco : au premier plan, de trois-quarts arrière et en amorce, l'épaule et le masque d'un homme assis sur une chaise basse, qui paraît soudain petit. Face à lui, derrière un bureau monumental en ébène, un recruteur élancé et anguleux en costume trois pièces années 30, cheveux gominés, lunettes rondes, tient une feuille du bout des doigts en levant un sourcil. Derrière le recruteur, une fenêtre géante à gradins encadre la ville et six faisceaux de projecteurs parallèles (le cadre dans le cadre, image_17.png).

Le bureau est plongé dans le noir d'encre, le bleu nuit et le violet ; une lampe de banquier verte et une applique éventail Art Déco créent des éclats ambrés sur la feuille, les lunettes et le plateau du bureau, sans dégradé (image_18.png). Les fenêtres lointaines dorées font écho à la lueur de la lampe.

Le recruteur est sculptural et géométrique, découpé par un liseré bleu électrique. L'homme masqué en amorce (voir image de référence jointe : cagoule noire qui ne laisse voir que les yeux, casquette beige et brune portée droite, veste noire ample, silhouette massive aux épaules larges, aucun logo ni emblème) est presque entièrement dans l'ombre, seul un liseré ambre marque sa cagoule et son épaule (image_18.png). Ton de comédie : le recruteur est impassible, l'homme masqué tassé sur sa chaise.

Pas de texte, la feuille reste illisible, aucun logo ni enseigne. Sombre, contrasté, nocturne.
```

## CASE 6 — Le déclic MyMotiv
**Yann** (soupir, sous la pluie) : « Bon. Même les héros ont besoin d'un coup de main. »
**Voix off** : « Le lien de l'offre, son CV… et en trente secondes*, une lettre qui parle de LEURS clients, de LEURS délais, de LEUR métier. »
*J'insère ici le vrai site MyMotiv* (lien de l'offre → CV → génération → « Lettre sur mesure pour Boréal Logistique »,
nouvelle capture du vrai parcours faite avec une offre fictive de Boréal Logistique).
**Son** : pluie, puis carillon doux quand la lettre apparaît.

```text
Une illustration de dessin animé 2D dans le style "Dark Deco" et film noir des années 90, cel animation traditionnelle peinte sur fond noir. Format vertical 9:16. Encrage net, aplats, ombres dures (image_15.png).

Plan rapproché en légère contre-plongée sur le toit d'un gratte-ciel Art Déco sous la pluie, la nuit : un homme masqué est assis sur le rebord, épaules basses, et regarde l'écran d'un téléphone tenu à deux mains. L'écran projette une lumière rose vif sur ses mains et le bas de sa cagoule, comme un unique éclat saturé dans l'obscurité. Derrière lui, la ville s'étend en gradins jusqu'à l'horizon, avec des milliers de fenêtres dorées et une file de balises rouges, et quelques faisceaux de projecteurs blancs percent la brume violette (image_15.png).

Le toit est presque entièrement dans le noir d'encre, le bleu nuit et le violet profond ; la pluie tombe en traits parallèles bleutés. La lueur rose du téléphone fait écho à quelques enseignes rose et or au loin (image_18.png).

L'homme masqué (voir image de référence jointe : cagoule noire qui ne laisse voir que les yeux, casquette beige et brune portée droite, veste noire ample, silhouette massive aux épaules larges, aucun logo ni emblème), massif et sculptural, est découpé par un liseré bleu électrique sur les épaules et un liseré rose sur le visage (image_18.png). Expression : concentré, un léger sourire naît au coin des lèvres.

Pas de texte, l'écran du téléphone reste une simple lueur rose sans interface, aucun logo ni enseigne. Sombre, contrasté, nocturne, intensément cinématique.
```

## CASE 7 — Le deuxième entretien
**Le recruteur** (souriant, la nouvelle lettre à la main) : « Celle-là parle de nos clients mieux que notre plaquette. »
**Yann** (le retour de l'ego) : « Je ne vends pas. Je résous des problèmes. »
**Le recruteur** : « Vous commencez lundi. »
**Yann** : « Je commence ce soir. »
**Le recruteur** (soupir) : « … C'est un CDI, pas une patrouille. »
**Son** : poignée de main, petite fanfare de cuivres en sourdine.

```text
Une illustration de dessin animé 2D dans le style "Dark Deco" et film noir des années 90, cel animation traditionnelle peinte sur fond noir. Format vertical 9:16. Encrage net, aplats, ombres dures (image_15.png).

Plan de face en légère contre-plongée dans le même immense bureau Art Déco que la case précédente : le recruteur élancé (costume trois pièces années 30, cheveux gominés, lunettes rondes) se lève derrière son bureau en ébène et serre la main d'un homme masqué debout face à lui, sûr de lui, le torse bombé. Sur le bureau, une lettre posée sous la lampe brille d'un liseré rose. Derrière eux, la fenêtre géante à gradins encadre la ville, les projecteurs se croisent en X dans le ciel (image_17.png).

Le décor reste plongé dans le noir d'encre, le bleu nuit et le violet ; la lampe de banquier et l'applique éventail créent cette fois des éclats d'or plus généreux sur les deux visages et les mains jointes, sans dégradé doux (image_16.png). La rangée de fenêtres dorées de la ville répète la lumière de la lampe.

L'homme masqué (voir image de référence jointe : cagoule noire qui ne laisse voir que les yeux, casquette beige et brune portée droite, veste noire ample, silhouette massive aux épaules larges, aucun logo ni emblème) et le recruteur sont tous deux découpés par un liseré ambre et bleu électrique (image_18.png). Ton de comédie : le recruteur sourit poliment, l'homme masqué sourit beaucoup trop.

Pas de texte, aucun logo, aucun nom ni aucune enseigne sur les bâtiments. Sombre, contrasté, nocturne, chaleureux au centre.
```

## CASE 8 — Le CTA
**Yann** (face caméra, au sommet de la tour) : « Toi aussi, t'as une mission ? Le poste que tu vises. »
**Yann** : « Colle le lien de l'offre. Ta première lettre est offerte. Lien en bio. »
*À l'écran (ajouté au montage)* : le signal **« mm. »** rose projeté sur les nuages, puis « Dis-moi en commentaire le poste que tu vises ↓ », le logo MyMotiv, « Mise en scène · Parodie · entreprise fictive ».
**Son** : grande nappe de cuivres, tonnerre lointain, carillon final.

```text
Une illustration de dessin animé 2D dans le style "Dark Deco" et film noir des années 90, cel animation traditionnelle peinte sur fond noir. Format vertical 9:16. Encrage net, aplats, ombres dures (image_15.png).

Plan en très forte contre-plongée au sommet d'une tour Art Déco, la nuit : un homme masqué se tient debout au bord de la couronne en éventail, face au spectateur, les poings sur les hanches, sa veste de costume soulevée par le vent. Derrière lui, des projecteurs croisés éclairent un large cercle lumineux vide sur les nuages violets (l'emplacement est laissé vierge). Tout autour, la ville à gradins s'étend jusqu'à l'horizon avec des milliers de fenêtres dorées, des balises rouges en file et des faisceaux blancs parallèles (image_15.png, image_17.png).

Le ciel et la tour sont dans le noir d'encre, le bleu nuit et le violet profond ; le cercle lumineux sur les nuages et les fenêtres dorées sont les seuls éclats saturés, sans transition douce (image_16.png).

L'homme masqué (voir image de référence jointe : cagoule noire qui ne laisse voir que les yeux, casquette beige et brune portée droite, veste noire ample, silhouette massive aux épaules larges, aucun logo ni emblème), massif, anguleux et sculptural, est presque entièrement en silhouette, découpé par un liseré rose et bleu électrique très vif sur le profil, les épaules et la visière de la casquette (image_18.png).

Pas de texte, aucun symbole dans le cercle lumineux, aucun logo ni enseigne. Sombre, contrasté, nocturne et intensément cinématique.
```

---

## Le montage prévu (quand les images arrivent)
- **Mouvements** : lent zoom de caméra sur chaque case, légère parallaxe, pluie et projecteurs animés, éclair sur la case 3.
- **Bulles** : blanches à bord noir, texte qui s'écrit au rythme des voix (comme l'épisode 1).
- **Vrai site** : inséré en case 6 dans un cadre doré Art Déco, avec la note « * temps mesuré : 27 à 35 s par lettre ».
- **Musique** : big band de film noir fabriqué (contrebasse, balais, cuivres en sourdine), qui se tait sur les échecs et éclate sur l'embauche.
- **Fin** : signal « mm. » sur les nuages, logo MyMotiv, appel à commenter le poste visé.
