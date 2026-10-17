# Flyer MyMotiv A5 (distribution en ville)

- `flyer-mymotiv-a5-fond-perdu.pdf` : **le fichier à envoyer à l'imprimeur** (2 pages, recto puis verso, A5 148 × 210 mm
  + 3 mm de fond perdu sur chaque bord = 154 × 216 mm, polices intégrées, QR code en vectoriel).
- `flyer-mymotiv-a5-recto.png` / `-verso.png` : aperçus au format fini, 300 dpi (pour les réseaux ou pour vérifier).
- QR code → `https://yoyo-code.vercel.app/candidature` (directement le parcours « 1re lettre offerte »). Vérifié avec un
  lecteur de QR code. On n'utilise pas `tinyurl.com/try-mymotiv` : ce lien passe par une redirection publicitaire (viglink).
- Prix lus dans `lettre-ia/lib/pricing.ts` au moment de la construction : si les prix changent, reconstruire le flyer.

## Reconstruire
```
python3 marketing/flyer/construire-flyer.py     # → flyer.html (autonome : polices, images et QR code intégrés)
node marketing/flyer/imprimer-flyer.mjs         # → PDF d'impression + aperçus PNG
```

## Conseils d'impression
- Papier couché 300 à 350 g, finition mate (le noir du recto marque moins les traces de doigts).
- Recto-verso, quadri, A5. Demander une épreuve (BAT) et scanner le QR code sur le BAT avant de lancer le tirage.

## Distribution
- La mention « Ne pas jeter sur la voie publique » est imprimée au verso.
- Distribuer sur la voie publique peut demander une autorisation de la mairie : se renseigner avant. Pas de collage sur
  les murs ni sur le mobilier urbain (affichage sauvage interdit). Préférer les salons de l'alternance, les forums
  emploi, les sorties de campus et les commerces qui acceptent un présentoir.
