# Vidéos MyMotiv (Remotion)

Vidéos TikTok de MyMotiv (format 9:16, 1080×1920, 30 images/s), codées avec [Remotion](https://www.remotion.dev).
Ce dossier est indépendant du site (`lettre-ia/`) : il a ses propres dépendances.

## Les vidéos

| Identifiant | Fichier | Concept |
|---|---|---|
| `CheatCode` | `src/CheatCode.tsx` | « Le Cheat Code » : l'IA générique qui oublie tout → un lien, zéro prompt → CV + lettre |
| `CheatCodeLogo` | `src/CheatCodeLogo.tsx` | « Le Cheat Code », version extraction du logo |
| `Sniper` | `src/Sniper.tsx` | « Le Sniper » : ciblage d'une offre et extraction du logo |
| `Duel` | `src/Duel.tsx` | « Même offre. Pas le même destin. » (30 s) : Léo contre Inès (personnages, `src/Persona.tsx`), témoignage réel de Léni S. |
| `Onde` | `src/Onde.tsx` | « L'Onde de Choc Visuelle » (20 s) : hyper-lapse, globe, cristal-logo, orbite finale |

Les éléments communs (texte 3D, curseur, chat pulvérisé…) sont dans `src/common.tsx`.

## Règles de contenu

- L'interface MyMotiv vient des **vraies captures du site** (`public/shots`), refaites avec `capture/capture.mjs`.
- Exemple fictif : Camille Dubois, Maison Lumen. Aucune marque réelle imitée (chat d'IA générique, site d'emploi générique).
- Aucun chiffre inventé : seulement des chiffres mesurés ou sourcés. « 11 candidatures, 7 entretiens » est le témoignage réel de Léni S. (accord donné), affiché avec « Témoignage réel · résultats individuels non garantis » ; l'histoire de Léo et Inès est signalée « Mise en scène ».

## Commandes

```bash
npm install
npm run studio                                   # aperçu interactif dans le navigateur
COMP=Sniper node render.mjs                      # vidéo complète → out/Sniper.mp4
COMP=Sniper node render.mjs stills 1 4.5 12      # images d'aperçu → prev/
python3 synth_sniper.py                          # régénère la bande son (public/audio)
```

Les bandes son sont synthétisées en Python (numpy, scipy), calées sur les temps de chaque vidéo.

## Refaire les captures du site

Lancer le site en local (`cd ../lettre-ia && npm run build && npx next start -p 3500`), puis depuis `capture/` :
`node capture.mjs` (Playwright). Les réponses des API sont simulées avec l'exemple fictif. Copier ensuite les images utiles dans `public/shots`.

## Licence Remotion

Remotion est gratuit pour un particulier ou une entreprise de 3 personnes maximum ; au-delà, une licence entreprise est nécessaire.
