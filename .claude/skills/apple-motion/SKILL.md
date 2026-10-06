---
name: apple-motion
description: Motion design « style Apple » pour MyMotiv dans Remotion (videos-mymotiv) — morphing de formes (rond → pilule → carte → pilule), rebond d'inertie, décalages de quelques centièmes de seconde, texte qui tombe par mots ou par lettres, appui de bouton avant chaque transformation, fond gris très clair, 60 i/s. À utiliser dès que l'utilisateur demande un motion design « type Apple », épuré, premium, « buttery smooth », ou une démo produit minimaliste.
---

# Motion design « style Apple » (Remotion)

Source : tutoriel « Learn Apple Style Motion Graphics in 20 minutes (After Effects) », transposé d'After Effects vers
Remotion. Outils prêts : `videos-mymotiv/src/apple.tsx`. Exemple complet : `videos-mymotiv/src/AppleMyMotiv.tsx`
(composition `AppleMyMotiv`).

## Les 2 ingrédients
1. **Expressions** → ici des fonctions : `bounce()` (rebond d'inertie à chaque arrivée), `go()`, `morph()`, `curve()`,
   `press()`, `TextDrop`.
2. **Timing** → ce qui fait « premium » : peu de clés, des mouvements courts (0,35 à 0,45 s), des éléments **décalés**
   (0,03 à 0,1 s) plutôt que simultanés, et **60 i/s** pour la fluidité.

## Règles de mise en scène
- **Fond** `APPLE.bg` (#F2F2F4, entre blanc et gris), cadres blancs, ombres très douces, une seule couleur d'accent
  (rose MyMotiv `#D9828B` à la place du bleu Apple), texte `#1D1D1F`, gris secondaire `#86868B`. Police Poppins.
- **Morphing** : un seul « cadre » blanc et un seul « bouton » changent de taille, de rayon et de couleur au fil de
  l'histoire (rond → pilule → carte → pilule). Le bouton **pousse** le cadre : son mouvement et l'agrandissement du
  cadre partagent les mêmes temps, décalés d'une image si besoin.
- **Rebond d'inertie** sur toutes les tailles et positions (`bounce`, amp 0,05 · fréq 4 · amort. 8) : clés linéaires,
  le rebond fait le reste. Ne pas empiler de ressorts cartoon.
- **Décalage** : ce qui accompagne arrive un peu après (flèche 0,1 s après le bouton, mots du titre 0,05 s chacun,
  lettres du prix 0,03 s).
- **Texte** : `TextDrop` par **mots** pour les titres, par **lettres** pour les prix et petits textes ; il tombe d'en
  haut, arrive d'un côté ou monte d'en bas avec un fondu, et disparaît par fondu (0,2 s) avant la transformation suivante.
- **Appui** (`press`) sur le bouton 0,1 à 0,2 s **avant** chaque transformation : c'est lui qui « déclenche » la suite.
- **Trajectoires courbes** (`curve`) pour les grands déplacements du bouton, jamais en ligne droite.
- **Liant final** : une légère rotation de tout le groupe (±2 à 3°, avec rebond), puis retour au rond et au logo.
- Durée type : 8 à 12 s ; 1 idée par état ; textes très courts.

## Recette (squelette)
```tsx
const fw = bounce(t, [[0, 0], [0.45, 220], [1.2, 220], [1.6, 840]]);   // cadre : rond → pilule
const [bx, by] = curve(go(t, 2.7, 3.15, 0, 1), [855, 960], [540, 1440], [855, 1440]); // bouton : trajet courbe
const scale = press(t, 2.5);                                            // appui avant le morphing
<TextDrop t={t} t0={1.42} text="Ta lettre de motivation" from={[0, -70]} out={2.72} />
```

## Vérifier avant d'envoyer
- Planche d'images (`node render.mjs stills …`) : chaque état lisible, rien qui passe derrière un autre élément
  (régler `zIndex`), textes jamais coupés.
- Rendu en 60 i/s ; son discret (clics, souffles, petits « pop », carillon final) via un `synth_<nom>.py`.
- Les règles de `CLAUDE.md` s'appliquent toujours (prix réels, pas de chiffres inventés, marque MyMotiv).
