# Vidéos MyMotiv (Remotion)

Vidéos TikTok de MyMotiv (format 9:16, 1080×1920, 30 images/s), codées avec [Remotion](https://www.remotion.dev).
Ce dossier est indépendant du site (`lettre-ia/`) : il a ses propres dépendances.

## Les vidéos

| Identifiant | Fichier | Concept |
|---|---|---|
| `CheatCode` | `src/CheatCode.tsx` | « Le Cheat Code » : l'IA générique qui oublie tout → un lien, zéro prompt → CV + lettre |
| `CheatCodeLogo` | `src/CheatCodeLogo.tsx` | « Le Cheat Code », version extraction du logo |
| `Sniper` | `src/Sniper.tsx` | « Le Sniper » : ciblage d'une offre et extraction du logo |
| `Lien` | `src/Lien.tsx` | « Le lien dans ma bio » (35 s, 60 i/s) : POV clic sur le profil puis le lien de la bio, pass through vers le vrai site (captures `public/shots2`), 2 chemins en split screen, 3 étapes, chrono accéléré, Yann Motiveur postule, jour/nuit en slit scan, appel manqué + e-mail d'entretien (mise en scène). Rendu : `BITRATE=6400k COMP=Lien node render.mjs` |
| `Creer` | `src/Creer.tsx` | « Créer ma lettre » (20 s, 60 i/s) : interface en verre, React + Tailwind + Lucide, ressorts « Framer Motion » (raideur 300, amortissement 20). Rendu : `BITRATE=16M COMP=Creer node render.mjs` |
| `Mascotte` | `src/Mascotte.tsx` | « MyMotiv expliqué par sa mascotte » (~41 s, 2K, 60 i/s) : voix off réelle nettoyée, sous-titres karaoké, mascotte qui réagit. Rendu : `BITRATE=14M COMP=Mascotte2K node render.mjs` (2K natif) |
| `IAHumain` | `src/IAHumain.tsx` | Publicité « IA × humain » (25 s, 60 i/s) : effets et transitions, 3 étapes, relue par l'IA et validée par le candidat. Rendu : `BITRATE=12M COMP=IAHumain node render.mjs` |
| `Pub` | `src/Pub.tsx` | Publicité « Ta lettre parle d'eux. » (24 s) : typographie épurée calée sur 120 BPM, 3 étapes (CV, lien de l'offre, Générer) |
| `Parcours` | `src/Parcours.tsx` | « Le parcours d'Inès » (36 s) : le lien de sa mère, les 3 étapes du site, l'arrêt sur image sur le logo, le mail du lendemain, recrutée |
| `Recruteur` | `src/Recruteur.tsx` | « Même CV. Pas la même réponse. » (30 s) : côté recruteur avec Mme Roche, corbeille contre entretien à 15h30, signature |
| `Duel` | `src/Duel.tsx` | « Même offre. Pas le même destin. » (30 s) : Léo contre Inès (personnages, `src/Persona.tsx`), témoignage réel de Léni S. |
| `Onde` | `src/Onde.tsx` | « L'Onde de Choc Visuelle » (20 s) : hyper-lapse, globe, cristal-logo, orbite finale |

Les éléments communs (texte 3D, curseur, chat pulvérisé…) sont dans `src/common.tsx`.

## La mascotte

Voir `public/mascotte/MASCOTTE.md` : 8 expressions + 1 en pied, fond transparent, à réutiliser dans les vidéos.

## Voix off

Pipeline utilisé pour `Mascotte` : transcription mot à mot (Whisper « small », hors ligne), suppression des silences et hésitations,
traitement de la voix, puis mixage avec musique atténuée sous la voix (`synth_mascotte.py`). Les horaires des mots sont dans `src/data/voix-mascotte.json`.

## Règles de contenu

- L'interface MyMotiv vient des **vraies captures du site** (`public/shots`), refaites avec `capture/capture.mjs`.
- Exemple fictif : Camille Dubois, Maison Lumen. Aucune marque réelle imitée (chat d'IA générique, site d'emploi générique).
- Aucun chiffre inventé : seulement des chiffres mesurés ou sourcés. « 11 candidatures, 7 entretiens » est le témoignage réel de Léni S. (accord donné), affiché avec « Témoignage réel · résultats individuels non garantis » ; l'histoire de Léo et Inès est signalée « Mise en scène ».

## Tailwind CSS et icônes

Tailwind est activé dans Remotion (`@remotion/tailwind`, `tailwind.config.cjs`, `src/tailwind.css`, preflight désactivé pour ne pas modifier les autres vidéos).
Icônes : `lucide-react`.

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
