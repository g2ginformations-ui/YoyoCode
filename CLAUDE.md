# CLAUDE.md — MyMotiv

Mémoire du projet, lue au début de chaque session. À tenir à jour quand une règle ou une info change.

## Le propriétaire et la façon de travailler
- Utilisateur francophone, non développeur : répondre **toujours en français**, étape par étape, simplement.
- Branche de travail désignée par la session ; ne jamais pousser sur `main`. L'utilisateur fusionne lui-même les PR.
- Ne créer une PR que sur demande. Si la PR de la branche a déjà été fusionnée, repartir de `origin/main` (même nom de branche).
- Préférer des PR petites et ciblées (une fonctionnalité par PR, site et vidéos séparés).
- Ne jamais demander ni accepter de clé ou de secret dans la conversation : ils vont uniquement dans Vercel.

## Règle d'évaluation préalable obligatoire (« Money & Vibe »)
Avant de dire oui à toute idée, fonctionnalité ou pivot, la passer au crible (SONCAS / SWOT orienté cash / SMART-Cash) :
1. Est-ce que ça rapporte de l'argent ou accélère la vente ?
2. Est-ce que ça respecte le délire, l'ergonomie et le positionnement de l'app ?
Si l'une des deux réponses est non : refuser, ou proposer une alternative plus rentable et plus fidèle à l'identité.

## Honnêteté et droits (non négociable)
- **Aucun chiffre inventé** (pas de « +300 % », « +53 % », « +71 % », « 75 % des CV rejetés par les ATS », « fiable à 100 % »…).
  Chiffres autorisés : temps **mesuré** 27 à 35 s par lettre ; **88 %** des candidats pensent qu'une lettre personnalisée
  aide (sondage cité par malettredemotivation.com, opinion et non taux d'entretien) ; témoignage réel de **Léni S.** :
  11 candidatures → 7 entretiens (consentement donné), toujours avec « Témoignage réel · résultats individuels non garantis ».
- Superlatifs marketing autorisés par décision du propriétaire (« la meilleure IA », « la référence ») : le propriétaire en assume la
  responsabilité. Ne pas nommer le fournisseur d'IA dans les pubs. Les chiffres, eux, restent toujours vrais (voir ci-dessus).
- Pas de relecteurs humains chez MyMotiv : la vérification humaine, c'est le candidat qui valide et ajuste.
- Pas d'imitation d'interfaces de marques réelles (ChatGPT, Facebook…), pas d'extraits de films/séries ni d'acteurs
  (EyeCannndy = inspiration seulement, pas de droit de réutilisation), pas de musique de jeux vidéo.
  L'utilisateur a choisi de montrer le logo HelloWork et sa photo de canette CIRO : c'est sa décision.
- Exemples fictifs uniquement : entreprises Maison Lumen, Atelier Nova, Boréal Logistique ; candidats Camille Dubois,
  Inès Martin, Yann Motiveur. Les histoires portent la mention « Mise en scène ».
- Pas d'URL LinkedIn lisible ni de prétention à lire LinkedIn (LinkedIn bloque). Pas de filigrane de logo sur le PDF de lettre.

## La marque
- Nom : **MyMotiv**. Slogan : **« Avec MyMotiv, postulez. Et faites-vous recruter. »**
  Titre de l'accueil : « Générez la candidature qui sort de la pile. » Communauté d'abonnés : **Les Motivés**.
- Couleurs : fond sombre `#0B0A0B`, rose `#D9828B`, rose clair `#F2B8C0` ; thème clair en bleu `#0A66C2` avec logo rose.
  Polices : Poppins (titres), Open Sans (texte).
- Mascotte : **Yann Motiveur** (costume noir, cravate rose, lunettes, « mm. » rose). Images détourées dans
  `videos-mymotiv/public/mascotte/` (voir `MASCOTTE.md`) et `lettre-ia/public/mascotte/` (webp). Ne pas écrire son nom
  dans l'ancienne vidéo « Mascotte ».
- Curseurs de marque : flèche néon rose « mm. » par défaut, viseur rose au survol (dessinés dans `videos-mymotiv/src/Lien.tsx`).
- Lien de la bio TikTok (@oroserpente92z) : `tinyurl.com/try-mymotiv`.

## Le site (`lettre-ia/`, Next.js 16, déployé sur https://yoyo-code.vercel.app)
- Première lettre offerte (sans inscription), puis offres dans `lib/pricing.ts` (source unique des prix) :
  1 lettre 1,99 € (avec son CV adapté) · Semaine 3,99 € (badge « Recommandé ») · Mois 6,99 € · À vie 24,99 € = 150 lettres
  (grille du 7/10/2026 ; avant : 0,99 / 1,99 / 7,99 / 12,99 €, accès à vie anciens restés illimités). Illimité = 30 lettres/semaine
  max ; 4 styles de PDF réservés aux offres illimitées. Les abonnés existants gardent leur prix Stripe.
  ⚠️ Vidéos qui annoncent les ANCIENS prix (ne plus les poster telles quelles) : Dilemme, AppleKeynote, AppleMyMotiv, Express,
  Fantomes, FantomesCanette, Recherche/Recherche30. Paiement Stripe (live) ; les comptes sont des clients Stripe (`lib/access.ts`, `lib/oauth.ts`).
- IA : `lib/claude.ts` (modèle payant et modèle d'essai configurables par variables d'environnement).
- CV en photo (JPG, PNG, WebP) et PDF scanné : lus par l'IA (`lib/extract.ts`, `readDocument` dans `lib/claude.ts`, modèle
  `ANTHROPIC_OCR_MODEL`, sinon Mistral `MISTRAL_VISION_MODEL`), photo réduite dans le navigateur (`prepareUpload`, `lib/upload.ts`),
  20 lectures IA par heure et par IP. Hébergement : on reste sur yoyo-code.vercel.app pour l'instant (décision du propriétaire).
- Parcours « Lancer une candidature » : `app/candidature/` (questionnaire, CV, lien de l'offre, analyse, engagement, score
  calculé par `lib/match.ts`, puis « Générer ma lettre offerte »). Le panneau des offres `components/EliteSheet.tsx` n'arrive
  qu'après la lettre offerte (2e lettre, ajustements, CV adapté, styles PDF). Les abonnés vont droit à l'outil.
- Code promo personnel : créé dans Stripe uniquement (jamais dans le code). Un accès à vie à 0 € est géré dans `lib/fulfill.ts`.
- Vérifier avant de pousser : `npx tsc --noEmit -p .` et `npx next build` dans `lettre-ia/`.
  Captures et tests : Playwright avec Chromium `/opt/pw-browsers/chromium`, serveur `npx next start -p 3500`, API simulées.

## Les vidéos (`videos-mymotiv/`, Remotion)
- Compositions dans `src/Root.tsx` (format TikTok 1080×1920, souvent 60 i/s) ; liste et commandes dans `README.md`.
- Rendu : `COMP=<Id> BITRATE=<débit> REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell node render.mjs`
  (aperçus : `... node render.mjs stills 1 4.5 12` → `prev/`). Toujours contrôler par des planches d'images avant d'envoyer.
- Son : un script `synth_<nom>.py` par vidéo (numpy/scipy) → `public/audio/<nom>.wav`, calé sur les temps clés du `.tsx`.
- Captures du vrai site dans `public/shots/`, `public/shots2/` et `public/parcours/` (parcours /candidature actuel,
  `capture/capture-parcours.mjs` + `boxes.json` des cases) ; vidéos finales gardées dans `rendus/`.
- Envoi à l'utilisateur : 30 Mio maximum par fichier (réencoder en deux passes avec ffmpeg d'`imageio_ffmpeg` si besoin).
- Motion design : skill `.claude/skills/apple-motion/` (à lire avant chaque vidéo). Partie 1 « style Apple » (morphing,
  rebond d'inertie, texte qui tombe) → `src/apple.tsx` ; partie 2 « style Révélation » (caméra 3D, flou de mise au point,
  cases du vrai site isolées, flashs, fin à bulles) → `src/motion.tsx`, exemples `Reveal` et `ParcoursSite`.
- Ne jamais écraser une composition existante : vérifier le nom (`ls src/`) avant d'en créer une.
- Écrire un prompt pour un autre outil d'IA (Midjourney, ElevenLabs, Sora…) : skill `.claude/skills/prompt-master/`
  (source github.com/nidhinjs/prompt-master, licence MIT).
- Bruitages réels : `videos-mymotiv/public/sfx/` (22 whooshes FILM CRUX fournis par l'utilisateur, noms UCS, `catalogue.json`
  avec le moment du pic) via `tools/sfx_lib.py` (`W.place(add, t_pic, "MoyenSourd", gain)` cale le pic sur l'action).
- Découpe de voix : `tools/voix-narrateur.py` coupe au milieu des silences, marges bornées, contrôle automatique des coupes
  (jamais de syllabe rejouée). Demander à l'utilisateur une demi-seconde de pause entre les phrases. Méthode la plus sûre :
  repérer les îlots de parole sur les silences (-40 dB), transcrire chaque îlot, puis donner les coupes explicites `"src"`
  dans la config (voir `voix-vue.json`) ; recaler les mots phrase par phrase (Whisper sur le fichier entier dérive).
- Prises séparées : `tools/assembler-prises.py` (remplacer un passage par une meilleure prise). Voix moqueuses de fond :
  `tools/voix-moqueries.py` (voix Piper hors ligne, modèles à télécharger depuis les releases sherpa-onnx). Logo fixe au centre :
  modèle `AvantAujourdhui` / `ZeroVue` ; hook éprouvé « arrêt sur image + rembobinage » dans `ZeroVue`.
- **À chaque vidéo livrée** : fournir aussi une description TikTok (accroche, 3-4 lignes, question pour les commentaires,
  hashtags) et une description LinkedIn (ton pro, histoire courte, appel à l'action), sans chiffre inventé.
- Le `.gitignore` racine ignore `*.md` : utiliser `git add -f` pour les fichiers Markdown.

## Réseau de l'environnement
- Bloqués : HuggingFace, eyecannndy.com, pexels.com, pixabay.com. Transcription hors ligne possible (voir `tools/transcrire.mjs`).
