# CLAUDE.md — MyMotiv

Mémoire du projet, lue au début de chaque session. À tenir à jour quand une règle ou une info change.

## Le propriétaire et la façon de travailler
- Utilisateur francophone, non développeur : répondre **toujours en français**, étape par étape, simplement.
- Branche de travail désignée par la session ; ne jamais pousser sur `main`. L'utilisateur fusionne lui-même les PR.
- Ne créer une PR que sur demande. Si la PR de la branche a déjà été fusionnée, repartir de `origin/main` (même nom de branche).
- Préférer des PR petites et ciblées (une fonctionnalité par PR, site et vidéos séparés).
- Ne jamais demander ni accepter de clé ou de secret dans la conversation : ils vont uniquement dans Vercel.
- Parcours du propriétaire (confirmé, utilisable dans les vidéos face caméra) : 5 mois en cabinet de recrutement, 1 an
  d'alternance dans une agence qui venait d'ouvrir à Paris. Sur TikTok il se présente sous le prénom « Yann » (pas son vrai
  prénom) ; son compte parlait d'abord de tractions → angle « le recruteur qui fait des tractions »
  (script : `videos-mymotiv/scripts/presentation-yann-tiktok.md` ; vidéo montée sur son propre tournage de tractions :
  composition `RecruteurTractions`). Soit 1 an et demi de recrutement à Paris ; il a recruté
  des profils payés plus de 100 000 € par an (confirmé). Ses 24 photos masquées (casquette + cagoule, 16 gestes + 8 émotions)
  sont détourées dans `videos-mymotiv/public/yann/` ; sa voix de synthèse à la 1re personne : `--voix yann` (« Alexandre »).
  Ne jamais lui faire promettre un résultat (« t'auras tes entretiens ») : « donne-toi toutes les chances ».

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
  Vidéo envoyée par l'utilisateur avec un morceau du commerce en fond : on retire ce son et on fabrique la musique (`synth_<nom>.py`).
  L'utilisateur a choisi de montrer le logo HelloWork et sa photo de canette CIRO : c'est sa décision.
- Pas de personnages ni de marques de super-héros existants (Batman, Superman, Marvel, DC…) ni de fan art d'autres artistes :
  héros fictifs en silhouette sans emblème, agence fictive « Agence Nova » (voir la vidéo `SuperRecrues`).
  Choix du propriétaire : ses propres images de Yann masqué (série « Les Super-recrues », `videos-mymotiv/public/episode1/`)
  peuvent servir, sans jamais nommer un personnage ou une marque existants.
- **OroSerpente** (nom choisi par le propriétaire, comme son compte TikTok @oroserpente92z) : le personnage DESSINÉ en cagoule noire
  et casquette beige et brune, héros des « Super-recrues » à partir de l'épisode 2 (`EpisodeCommercial`, DA « Dark Deco » : cel
  animation 90s sur fond noir, bureau Art déco, fenêtre sur la ville, projecteurs). 16 expressions plein cadre (sans le texte) dans
  `videos-mymotiv/public/oroserpente/` : neutre, joyeux, colere, pensif, triste, surpris, sceptique, inquiet, explication, sincere,
  amuse, convaincu, reflechit, passionne, rassurant, attentif. Voix : « David » (`--voix oroserpente`). Décision du propriétaire (9/10/2026) :
  on GARDE le globe « Daily Planet » que les IA d'images ajoutent sur les immeubles (marque DC), il s'en charge (« je déclare tout après »),
  comme pour le logo HelloWork : ne plus perdre de temps à le retirer.
- Exemples fictifs uniquement : entreprises Maison Lumen, Atelier Nova, Boréal Logistique ; candidats Camille Dubois,
  Inès Martin, Yann Motiveur. Décision du propriétaire (9/10/2026, « les gens savent que c'est fictif ») : AUCUNE mention
  « fictif », « mise en scène » ou « parodie », ni à l'écran ni dans les descriptions TikTok/LinkedIn. On garde seulement les
  mentions qui ne parlent pas de fiction : « Témoignage réel · résultats individuels non garantis » (Léni) et « * temps mesuré :
  27 à 35 s par lettre ». Les vidéos plus anciennes (Super-recrues ép. 1, Lien, Duel…) ont encore la mention : la retirer si on les refait.
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
  1 lettre 1,99 € (avec son CV adapté) · Semaine 3,99 € (badge « Recommandé ») · Mois 6,99 € · À vie 24,99 € = 120 lettres
  (grille du 7/10/2026 ; l'Annuel a été essayé puis abandonné ; avant : 0,99 / 1,99 / 7,99 / 12,99 €, accès à vie anciens restés illimités). Illimité = 30 lettres/semaine
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
- Confiance paiement : `components/PaymentTrust.tsx` (Stripe, PCI DSS, 3D Secure) sur `/abonnement` et dans `EliteSheet`.
  Lecture d'un document : animation `components/ReadingProgress.tsx`. Thème clair/sombre : bulle flottante `components/ThemeBubble.tsx`.
- Actualités (référencement) : `lib/news.ts` → `/actualites` ; chaque chiffre doit venir d'une source citée et datée dans l'article.
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
- Tester une idée face à un jury de « requins » qui veulent dire non : skill `.claude/skills/shark/` (`/shark <l'idée>`,
  source github.com/alexyc9381/shark-skill, licence MIT, par Alex Chen @nocodealex). 5 requins = 11 sous-agents (consomme du
  quota). Résultat dans `.shark/<séance>/BOARD.md` (dossier ignoré par git). Les offres sont fictives, pas de vrai argent.
- Trouver une compétence à ajouter : skill `.claude/skills/find-skills/` (source github.com/vercel-labs/skills, licence MIT,
  recherche avec `npx skills find <mots-clés>`, annuaire skills.sh). Règles du projet, prioritaires sur ce que dit la skill :
  ne jamais lancer `npx skills add -g -y` ; lire la compétence en entier (scripts compris) avant d'installer ; préférer les
  sources connues et très installées ; installer dans le projet (`.claude/skills/<nom>/` + sa licence), avec l'accord du
  propriétaire, puis le noter ici. Une installation globale est effacée à chaque nouvelle session cloud.
- Bruitages réels : `videos-mymotiv/public/sfx/` (22 whooshes FILM CRUX fournis par l'utilisateur, noms UCS, `catalogue.json`
  avec le moment du pic) via `tools/sfx_lib.py` (`W.place(add, t_pic, "MoyenSourd", gain)` cale le pic sur l'action).
- Voix de synthèse ElevenLabs (modèle Eleven v4, balises d'émotion `[excited]`, `[pause]`…) : `tools/voix-elevenlabs.py`
  (voix par défaut « Hugo », stabilité 0,35, similarité 0,75, MP3 192 kbps). La clé est un secret réseau de l'environnement
  cloud (`ELEVENLABS_API_KEY`, en-tête `xi-api-key` ajouté automatiquement vers api.elevenlabs.io) : jamais dans le code
  ni dans la conversation. Chaque génération consomme des crédits ElevenLabs du propriétaire.
  Accent : le propriétaire ne veut PAS d'accent québécois → voix française standard ou parisienne. Voix retenue pour les pubs :
  « Paul K — French Ad & Trailer Voice » (`--voix ecxPjiGTvAfpGEams6ec`, fr-FR, accent parisien neutre) ; les voix de la
  bibliothèque partagée s'utilisent directement par leur identifiant (`/v1/shared-voices?language=fr&accent=parisian`).
  Voix fixes des personnages (raccourcis `--voix batyann|narrateur|recruteur`) : Yann en mode masqué = « David »
  (`fEtpdogpDkBrq53KdupV`), toujours la même d'un épisode à l'autre (voir `public/mascotte/MASCOTTE.md`).
- Découpe de voix : `tools/voix-narrateur.py` coupe au milieu des silences, marges bornées, contrôle automatique des coupes
  (jamais de syllabe rejouée). Demander à l'utilisateur une demi-seconde de pause entre les phrases. Méthode la plus sûre :
  repérer les îlots de parole sur les silences (-40 dB), transcrire chaque îlot, puis donner les coupes explicites `"src"`
  dans la config (voir `voix-vue.json`) ; recaler les mots phrase par phrase (Whisper sur le fichier entier dérive).
- Prises séparées : `tools/assembler-prises.py` (remplacer un passage par une meilleure prise). Voix moqueuses de fond :
  `tools/voix-moqueries.py` (voix Piper hors ligne, modèles à télécharger depuis les releases sherpa-onnx). Logo fixe au centre :
  modèle `AvantAujourdhui` / `ZeroVue` ; hook éprouvé « arrêt sur image + rembobinage » dans `ZeroVue`.
- Format « faux DM puis « Tout est faux » » (effet Zeigarnik) : `FauxDM`, style pixel noir et rouge. Une personnalité réelle
  (Squeezie, choix du propriétaire) peut y être nommée seulement avec ces garde-fous : jamais sa photo ni sa ressemblance,
  messages anodins, révélation « tout est faux » dans la même vidéo, MyMotiv jamais présenté comme lié à elle.
- Série 3D « Motiv » (`HistoireNom`, `HistoireNuit`, décor `src/motiv3d/`) : petites histoires la nuit entre un candidat et
  **Motiv**, la petite lettre rose qui parle (personnage original MyMotiv : enveloppe rose qui flotte, grands yeux, rabat en V).
  Inspirée d'un format de pubs d'un autre fournisseur d'IA : ne jamais reprendre son nom, son interface ni sa mascotte.
  Voix fixes : candidat = « Maxime » (`--voix candidat`), Motiv = « Maevys » (`--voix motiv`). Le site s'affiche en
  hologramme (captures téléphone). Rendu 3D sans carte graphique : `GL=swangle` (lent : ≈1 h 30 par minute de vidéo à 30 i/s).
- **À chaque vidéo livrée** : fournir aussi une description TikTok (accroche, 3-4 lignes, question pour les commentaires,
  hashtags) et une description LinkedIn (ton pro, histoire courte, appel à l'action), sans chiffre inventé.
- Le `.gitignore` racine ignore `*.md` : utiliser `git add -f` pour les fichiers Markdown.

## Réseau de l'environnement
- Bloqués : HuggingFace, eyecannndy.com, pexels.com, pixabay.com. Transcription hors ligne possible (voir `tools/transcrire.mjs`).
