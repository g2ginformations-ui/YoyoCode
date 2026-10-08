# La mascotte MyMotiv : Yann Motiveur

Son nom : **Yann Motiveur** (ne pas l'afficher dans la vidéo « Mascotte » ; à utiliser dans les prochaines).

Homme en costume noir, chemise noire, cravate rose `#D9828B`, lunettes noires, barbe courte, « mm. » rose sur la poitrine.
Images détourées (fond transparent), à utiliser dans les vidéos Remotion via `staticFile("mascotte/<nom>.png")`.

| Fichier | Expression | Quand l'utiliser |
|---|---|---|
| `pied.png` | En pied, sourire confiant | Intro, fin, appel à l'action (à côté du bouton) |
| `sourire.png` | Sourire assuré | Ton neutre-positif, présentation, « c'est simple » |
| `rire.png` | Mort de rire | Résultat, bonne nouvelle, victoire |
| `surprise.png` | Bouche ouverte, main qui présente | Annonce d'une fonction, « et même… », démonstration |
| `reflexion.png` | Main au menton | Explication, « tu colles le lien… », calcul |
| `choc.png` | Choqué, bouche ouverte | Révélation, « il la reconnaît en 2 secondes », « même son logo ! » |
| `colere.png` | Sourcils froncés | Dénonciation d'un problème (copier-coller, lettre générique) |
| `stress.png` | Gouttes de sueur, dents serrées | Problème du candidat (pas de réponse, pression) |
| `triste.png` | Triste | Échec, attente, regret |

Conseils : les bustes sont coupés en bas, il faut donc les poser **sur le bord inférieur de l'écran**. Faire un petit « pop »
(agrandissement bref) à chaque changement d'expression et faire bouger la mascotte au rythme de la voix (voir `src/Mascotte.tsx`).
Images d'origine fournies par le créateur de MyMotiv.

## Yann en mode masqué (« BatYann », série « Les Super-recrues »)

Images fournies par le propriétaire : `public/episode1/visage-1.jpg` à `visage-8.jpg` (8 expressions) et les cases de BD.
« BatYann » est un surnom interne : ne jamais l'écrire à l'écran ni nommer un personnage ou une marque existants ;
mention « Mise en scène · Parodie » dans chaque épisode.

**Sa voix (toujours la même)** : ElevenLabs « David - Professional Narrator », identifiant `fEtpdogpDkBrq53KdupV`
(voix grave, posée, accent parisien neutre), modèle Eleven v4, stabilité 0,35, similarité 0,75.
Raccourci : `python3 tools/voix-elevenlabs.py texte.txt sortie.mp3 --voix batyann`.
Balises qui lui vont bien : `[smug]`, `[arrogant]`, `[confident]`, `[shocked]`, `[worried]`, `[sighs]`.
Autres voix de la série : recruteur `--voix recruteur` (« Vincent »), narrateur `--voix narrateur` (« Paul K »).
