# CLAUDE.md — MyMotiv

Mémoire du projet, lue au début de chaque session. À tenir à jour quand une règle ou une info change.

## Le propriétaire et la façon de travailler
- Utilisateur francophone, non développeur : répondre **toujours en français**, étape par étape, simplement.
- Branche de travail désignée par la session ; ne jamais pousser sur `main`. L'utilisateur fusionne lui-même les PR.
- Ne créer une PR que sur demande. Si la PR de la branche a déjà été fusionnée, repartir de `origin/main` (même nom de branche).
- Préférer des PR petites et ciblées (une fonctionnalité par PR, site et vidéos séparés).
- Ne jamais demander ni accepter de clé ou de secret dans la conversation : ils vont uniquement dans Vercel.
- Parcours du propriétaire, d'après son CV et ses 2 lettres de recommandation (envoyés le 12/10/2026, gardés hors du dépôt).
  Vie privée : ne jamais citer son nom de famille, sa ville ni le nom du cabinet ; ne pas inventer de ville ni mettre le nom
  d'un autre vrai cabinet à la place : on décrit (« un cabinet de recrutement spécialisé dans les cadres »).
  - 3 mois de stage en développement commercial dans ce cabinet (avril-juillet 2025) : appels aux DRH et aux directeurs pour
    comprendre leurs besoins, **12 rendez-vous qualifiés en 3 mois**.
  - Puis 1 an d'alternance (sept. 2025-août 2026) chez **Temporis** (réseau national d'agences d'emploi en franchise, nom
    gardé par choix du propriétaire), dans une agence qui venait d'ouvrir, secteur géré seul : trouver les postes et les
    candidats, évaluer leurs compétences, les présenter aux entreprises. **100 comptes ouverts dont 60 grandes concessions
    automobiles, CA estimé ≈ 160 000 €.**
  - Formation : bachelor en développement commercial, un semestre en Allemagne, master en conseil en stratégie en cours
    (alternance 2026-2028). Langues : anglais C1, allemand B2, libanais C1. Callisthénie.
  - Recommandations, citations exactes : Richard, président du cabinet (« un excellent sens de l'écoute, de persuasion et
    d'adaptation », « je recommande sans réserve ») ; Guillaume, président de l'agence Temporis (« un réel tempérament
    commercial », « je recommande sans réserve »). Prénoms seuls (accord du propriétaire).
  - ⚠️ Les vidéos `PresentationYann` et `RecruteurTractions` disent « cinq mois » et « à Paris » (ancienne info) : à corriger
    avant de les reposter.
  - 24 ans (octobre 2026). Objectif : ouvrir sa première agence de recrutement dans 2 ans (toujours « je me vois ouvrir »,
    jamais présenté comme fait). Sa vraie photo n'entre jamais dans le dépôt : seules 6 mosaïques pixel (de 16 à 36 blocs
    de large, visage toujours méconnaissable) sont gardées, `videos-mymotiv/public/moi/portrait-0…5.png`
    (`tools/portrait-niveaux.py`). Elles « respirent » avec la voix (plus nettes sur les syllabes fortes, plus floues dans
    les pauses) grâce à `tools/enveloppe-respiration.py` (→ `src/data/<nom>-souffle.json` ; à ne pas confondre avec
    `tools/enveloppe-voix.py`, qui anime les bouches des vidéos 3D), voir `PortraitVivant` dans `src/Instinct.tsx`.
  Sur TikTok il se présente sous le prénom « Yann » (pas son vrai prénom) ; son compte parlait d'abord de tractions → angle
  « le recruteur qui fait des tractions » (script : `videos-mymotiv/scripts/presentation-yann-tiktok.md` ; vidéo montée sur
  son propre tournage de tractions : composition `RecruteurTractions`). Il a recruté des profils payés plus de 100 000 € par
  an (confirmé). Ses 24 photos masquées (casquette + cagoule, 16 gestes + 8 émotions)
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

## Cible (persona)
- `marketing/persona.md` (v1 du 11/10/2026) : persona principal « Lina, 19 ans, cherche son alternance » (TikTok, Semaine 3,99 €),
  secondaire « Karim, 24 ans, junior » (LinkedIn, Mois/À vie), tertiaire « Sandrine, 38 ans, reconversion ». Construit à partir du
  questionnaire du site (profils + 3 blocages) et des vrais avis du premier site ; hypothèses à vérifier (TikTok Analytics, Stripe).

- Flyer A5 recto-verso pour la ville (13/10/2026) : `marketing/flyer/` (PDF d'impression avec 3 mm de fond perdu, aperçus PNG,
  `construire-flyer.py` + `imprimer-flyer.mjs`, voir `LISEZMOI.md`). Le QR code va directement sur `yoyo-code.vercel.app/candidature` :
  `tinyurl.com/try-mymotiv` passe par une redirection publicitaire (viglink, constatée le 13/10/2026).

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
- **Cadrage TikTok (retour du propriétaire le 11/10/2026 : « on peut rien lire » une fois posté)** : tout texte ou élément
  important dans les zones sûres de `src/tiktok.ts` (x 120–920, y 280–1440 sur 1080×1920 : rien sous les onglets du haut, la
  colonne de boutons à droite ni la description du bas) ; sous-titres ≥ 56 px dans le tiers bas (vers y 1215) ; texte pixel en
  gras ≥ 40 px ; peu d'éléments par écran ; pas de « … » dans la police pixel (écrire « ... »). Contrôler avec
  `tools/planche-zones.py` (calque rouge des zones). Briques communes : `src/pixelTT.tsx` (+ `src/fauxdmTT.tsx`). Versions à poster :
  `BarnumTikTok`, `MotRougeTikTok`, `FauxDMTikTok`, `FauxDM30TikTok` (les originales FauxDM, FauxDM30, MotRouge, Barnum ne sont pas aux normes).
  Police pixel grasse ≈ 0,85 em par lettre : vérifier la largeur des mots longs (« VON RESTORFF » à 68 px max dans 800 px).
- Rendu : `COMP=<Id> BITRATE=<débit> REMOTION_BROWSER=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell node render.mjs`
  (aperçus : `... node render.mjs stills 1 4.5 12` → `prev/`). Toujours contrôler par des planches d'images avant d'envoyer.
  `render.mjs` efface son paquet temporaire (≈600 Mo dans /tmp) à la fin ; si le disque est plein : `rm -rf /tmp/remotion-webpack-bundle-*`.
- Son : un script `synth_<nom>.py` par vidéo (numpy/scipy) → `public/audio/<nom>.wav`, calé sur les temps clés du `.tsx`.
- Captures du vrai site dans `public/shots/`, `public/shots2/` et `public/parcours/` (parcours /candidature actuel,
  `capture/capture-parcours.mjs` + `boxes.json` des cases), parcours sur ordinateur dans `public/tuto/` (`capture/capture-tuto.mjs`,
  CV en photo, CV adapté) et sur téléphone dans `public/tuto-tel/` (même script avec `MOBILE=1`) ; vidéos finales gardées dans `rendus/`.
- Envoi à l'utilisateur : 30 Mio maximum par fichier (réencoder en deux passes avec ffmpeg d'`imageio_ffmpeg` si besoin).
- Motion design : skill `.claude/skills/apple-motion/` (à lire avant chaque vidéo). Partie 1 « style Apple » (morphing,
  rebond d'inertie, texte qui tombe) → `src/apple.tsx` ; partie 2 « style Révélation » (caméra 3D, flou de mise au point,
  cases du vrai site isolées, flashs, fin à bulles) → `src/motion.tsx`, exemples `Reveal` et `ParcoursSite`.
- **DA pixel et motion design** (couleurs, police pixel, cadrage, briques, sprites, mouvements, son, structure, contrôles) :
  skill `.claude/skills/da-pixel/` (fichier autonome, réutilisable dans une autre conversation). À lire avant chaque vidéo
  ou visuel pixel, et à compléter quand on crée une nouvelle brique.
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
- Compétences Vercel installées le 13/10/2026 (demande du propriétaire, `npx skills add vercel-labs/agent-skills` fait à la
  main, sans `-g -y`) depuis github.com/vercel-labs/agent-skills (licence MIT, que du Markdown, relu) : `.claude/skills/`
  `vercel-react-best-practices` (performance React / Next.js, pour `lettre-ia/`), `vercel-composition-patterns` (architecture
  des composants) et `vercel-react-view-transitions` (animations de pages du site). Non installées : `deploy-to-vercel`,
  `vercel-cli-with-tokens` et `vercel-optimize` (déploient ou lisent Vercel avec un jeton : les secrets restent dans Vercel et
  le site se déploie quand le propriétaire fusionne la PR), `web-design-guidelines` et `writing-guidelines` (vont chercher
  leurs règles sur Internet à chaque usage, donc impossibles à relire avant ; pas de licence), `react-native-skills` (pas d'appli mobile).
- Copier le style de montage d'une vidéo de référence : skill `.claude/skills/steal/` (installée le 15/10/2026 à la demande du
  propriétaire, depuis github.com/melvynx/video-agent-skills, licence MIT, que du Markdown, relue en entier avec `references/learnings.md`).
  On en garde la MÉTHODE de mesure (planches à 2 i/s, coupes avec `scdet`, spectrogramme, taille du visage, zooms) et la comparaison
  image par image ; les styles mesurés vont dans `videos-mymotiv/styles/<nom>.md`, et on monte avec nos propres briques Remotion (la
  skill `short-editing` qu'elle cite n'est pas installée). Règles du projet prioritaires : on copie le rythme et la construction, jamais
  les affirmations, le nom, le logo ni les images de l'autre ; pas de logos de marques tierces ; pas d'appel payant (ElevenLabs
  isolation ou effets sonores, Treg) sans l'accord du propriétaire ; pas d'images de visage générées (seulement ses vraies photos).
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
- Format « faux DM puis « Tout est faux » » (effet Zeigarnik) : `FauxDM` (≈1 min 46) et `FauxDM30` (résumé ≈33 s), style pixel noir et rouge. Une personnalité réelle
  (Squeezie, choix du propriétaire) peut y être nommée seulement avec ces garde-fous : jamais sa photo ni sa ressemblance,
  messages anodins, révélation « tout est faux » dans la même vidéo, MyMotiv jamais présenté comme lié à elle.
  Même univers pixel, autre axe (test participatif, effet Von Restorff, CTA « dis-moi le 3e mot en commentaire ») : `MotRouge`.
  Puis « Je lis dans ta tête » (faux mentaliste, effet Barnum, CTA « t'y as cru ? » en commentaire) : `Barnum`.
  Pub 30 s « La première ligne » (effet de halo, CTA « colle ta 1re ligne en commentaire, je te dis si elle passe ») :
  `PremiereLigne`, cadrée TikTok dès le départ.
  Série « effets psycho » (même modèle, ≈30-35 s, briques `src/pubTT.tsx`, musique `PixelSon.pub`) : `Ancrage` (le premier chiffre),
  `Miroir` (biais de similarité), `Recence` (la dernière phrase). Ne promettre de MyMotiv que ce que font `lettre-ia/lib/prompts.ts`
  (vrais besoins de l'offre, meilleures preuves du CV, pas de formules creuses, fin sobre qui propose un échange).
  Quiz 1 min 05 « Le jeu du recruteur » (3 duels lettre A / B, compte à rebours, CTA « ton score sur 3 ») : `QuizRecruteur`.
  « G comme gagner ta vie » (34 s) : `GagnerTaVie`. Accroche = phrase de rap « « Le biff trouve tout, même ton point G » » entre guillemets
  (choix du propriétaire), sans nommer l'artiste, aussitôt retournée en « G comme… gagner ta vie ». Jamais de phrase qui lie l'argent
  au corps de quelqu'un (« toucher le point G de qui tu veux ») : refusé.
  « T'es lequel des 4 ? » (51 s) : `TesLequel`. Écran de sélection de personnages ; un portrait par persona (Lina, Karim, Sandrine)
  + un détenu pour l'humour (« rends le téléphone ») ; CTA « 1, 2, 3 ou 4 en commentaire ». Le « ° » n'existe pas dans la police pixel : écrire « #1 ».
  « Mon CV, niveau par niveau » (78 s) : `MonCV`. Qui est derrière MyMotiv : le vrai CV du propriétaire en jeu de rôle
  (LEVEL UP, niveaux, succès, recommandations en tampon) ; CTA « pose ta question sur le recrutement en commentaire ».
  « Suis ton instinct » (57 s) : `Instinct`. Défi en 3 choix A / B (compte à rebours), chaque bon choix = son vrai parcours,
  révélé à la fin avec sa photo en mosaïque pixel qui respire avec la voix, « 24 ans » et l'objectif de la 1re agence ; CTA « ton score sur 3 ».
  « L'affaire de la lettre copiée-collée » (64 s) : `AffaireLettre`. Récit façon true crime (présent de narration, bruitages à
  la bouche « PAF », « SCHLAC », silences, suspects, tampon « COUPABLE ») ; CTA « t'as déjà envoyé une lettre avec le mauvais
  nom ? avoue en commentaire ». Demande du propriétaire « avec la voix de McSkyz » (13/10/2026) : refusée, on ne clone ni
  n'imite la voix d'un créateur réel et on ne le nomme pas ; on reprend seulement le style de narration, avec nos voix.
  « Comment faire une montagne de cash » (32 s, version légère) : `MontagneCash`, storyboard `videos-mymotiv/scripts/storyboard-montagne-de-cash.md`.
  Faux tuto en 4 étapes (offre, lettre MyMotiv, poste « ça dépend de toi », 1 400 € = 280 billets de 5 €), montagne en gros plan
  puis recul : « c'est une colline » à côté d'une tasse ; CTA « montagne ou colline ? ». Billets dessinés en pixel uniquement.
  « L'offre parfaite » (85 s) : `OffreParfaite`, storyboard `videos-mymotiv/scripts/storyboard-offre-parfaite.md`. Histoire glauque
  INVENTÉE (pixel version horreur) : une offre trop parfaite, MyMotiv en fait ressortir les vrais besoins (« ne prévenir
  personne »), appel masqué, « venez seule », bâtiment fermé, quelqu'un attend ; détail caché dès la 1re seconde, dernière image
  = première (boucle), CTA « tu l'as vu ? ». Aucune violence montrée, aucune vraie affaire. Nouvelle demande du 13/10 « une voix
  similaire à McSkyz, un ou deux tons au-dessus » (avec un MP3 de lui) : refusée aussi, le MP3 n'est pas utilisé ; nos voix seulement.
  Version 2 « qui fait parler » (91 s) : `OffreParfaite2` (la v1 reste intacte pour comparer). Même histoire + 5 déclencheurs de
  débat : « TOI AUSSI, T'AURAIS POSTULÉ. » dès l'image 0, faute volontaire « EXPÉRIANCE » dans l'offre, yeux rouges 0,3 s, fin à
  théories (« Merci d'être venue, Camille » alors qu'elle n'y est jamais allée), CTA « qui est venu ? ta théorie ». Pas de gore réel
  (TikTok limite le contenu choquant et la marque doit rester fréquentable) : on fait débattre par le doute, pas par l'image.
  « Comment se faire un réseau (sans piston) » (44 s) : `Reseau`. Carte de réseau en pixel : chaque candidature = ton nom devant une
  personne ; lettre copiée-collée = lien cassé, « oublié » ; lettre ciblée = lien rouge, « une chance qu'elle retienne ton nom » ;
  si c'est non : réponds, remercie, reste en contact ; le réseau grandit « une lettre à la fois » ; CTA « t'as eu un piston ? oui ou non ».
  MyMotiv ne fait pas de réseau à ta place (pas de messages LinkedIn) : on ne lui prête que ce qu'il fait (la lettre).
  « Les RH ne veulent pas que vous sachiez ça mais blc » (42 s) : `SecretRH`. Même accroche qu'une vidéo de référence envoyée par le
  propriétaire (13/10/2026 : une créatrice masquée qui montre l'outil d'un concurrent). Notre version : Yann masqué (vraies photos) + le vrai
  parcours du site. On ne reprend PAS son affirmation « les RH n'utilisent que des filtres ATS, ils ne lisent pas les CV » (rien ne la
  prouve) ni le nom de l'outil concurrent ; le « secret » dit seulement que ce qui sort de la pile, c'est ce qui colle à l'offre.
  3 pubs motion design « qui convertissent » (13/10/2026), voix pub Paul K, briques communes `src/pubMotion.tsx` + `tools/pub_son.py` :
  `AvantApres` (22 s, la preuve : lettre générique → lettre sur mesure), `ZeroExcuse` (29 s, 4 objections démontées + témoignage de Léni
  avec sa mention), `VraiPrix` (25 s, les vrais prix importés de `lettre-ia/lib/pricing.ts`, « moins cher qu'un kebab »). Si les prix
  changent, `VraiPrix` suit tout seul au prochain rendu ; AvantApres et ZeroExcuse n'affichent pas de prix.
  Série « typo animée » (13/10/2026, d'après la construction de 4 pubs d'une néobanque envoyées par le propriétaire) : `MotsCles`,
  `BienJoue`, `SansRien`, `AhATS` (briques `src/kinetic.tsx`). On reprend le rythme et la construction (mots géants, deux couleurs,
  coupes sèches, mots barrés, trio empilé), JAMAIS leurs couleurs, leur police, leurs illustrations, leur logo ni leurs slogans.
  Parler d'ATS honnêtement : c'est le logiciel où arrivent (et se trient) les candidatures ; le recruteur peut y chercher les mots
  de son offre ; MyMotiv relève les mots-clés de l'offre (score `lib/match.ts`), les reprend dans la lettre et le CV adapté
  seulement quand c'est vrai (`lib/prompts.ts`, `lib/cv.ts`). Interdit : « passe les ATS », « 100 % compatible ATS », tout chiffre
  sur les CV rejetés par les ATS.
  « Ta lettre traduite en langage recruteur » (36 s, 14/10/2026, demande « une vidéo qui va percer ») : `Traducteur`. Deux voix (Paul K
  lit la formule creuse, Yann la « traduit »), 5 formules qui sont toutes interdites par `lib/prompts.ts`, jeu « traduis celle-là »
  en commentaire, boucle. Personne ne peut promettre qu'une vidéo « perce » : on met seulement tous les leviers de partage.
  « Les recruteurs veulent pas que tu saches ça » (44 s, 14/10/2026, d'après un tuto « écran filmé » d'un concurrent envoyé par le
  propriétaire, « avec nos nouvelles fonctionnalités bien mises en avant ») : `TutoEcran`. Vrai site sur ordinateur filmé (captures
  `public/tuto/` par `capture/capture-tuto.mjs`) : CV en photo, lien (ou texte si le site bloque), score, mots-clés, rien d'inventé, logo
  trouvé tout seul, 4 styles de PDF, CV adapté 1 page. On ne reprend PAS ses affirmations (« CV qui passe les ATS », « 100 % adapté »),
  ni son nom, ni sa fiche de préparation d'entretien (MyMotiv n'en fait pas). LinkedIn et Indeed bloquent la lecture du lien : ne
  jamais dire « copie le lien sur LinkedIn/Indeed », dire « colle le lien, ou le texte si le site bloque ».
  « La pub qui convertit » (32 s, 15/10/2026, demande « une vidéo qui convertit un max ») : `ToutEnUn`. Tous les leviers en une vidéo
  pour Lina (persona principal) : accroche qui l'interpelle, problème, démo du vrai site sur téléphone (`public/tuto-tel/`), preuve
  (Léni + mention), offre (1re lettre offerte sans carte bancaire, puis le prix de `pricing.ts` avec le CV adapté), « teste-la ce soir ».
  Le prix est DIT par la voix : si `PLANS.letter` change, régénérer la ligne y5 de `voix-tout.json`.
  « Ton matcha est mieux préparé que ta lettre » (42 s, 15/10/2026, demande « matcha, café, tout ce champ lexical ») : `Matcha`. Univers
  coffee shop tout dessiné (pas de marque de café, pas d'image de stock), prénom écrit de travers = lettre qui se trompe d'entreprise,
  barista = voix Paul K, CTA « team matcha ou team café ? ». Police à la main Caveat (OFL) dans `public/fonts/`.
  « TUTO lettre de motiv en 30 secondes* » (23 s, 15/10/2026, d'après un tuto d'un concurrent envoyé par le propriétaire) : `TutoDoigt`,
  style MESURÉ avec la compétence `steal` (`videos-mymotiv/styles/tuto-doigt.md`) ; le doigt = la vraie main de Yann (`public/yann/doigt.png`).
  Trois vidéos du 15/10/2026 (« fais-m'en d'autres, je te fais confiance ») : `PhotoCV` (10 s, micro-pub du CV en photo, en boucle),
  `Flags` (42 s, « red flag ou green flag ? » sur la confiance envers une IA ; red flags génériques, green flags = vraies fonctions
  vérifiées : rien d'inventé, une lettre par offre avec logo, résiliable en 2 clics, tu valides) et `TroisBlocs` (41 s, la structure
  de `lib/prompts.ts` en conseil à enregistrer : accroche, preuve, suite, + le test « elle peut partir ailleurs ? »).
- Série 3D « Motiv » (`HistoireNom`, `HistoireNuit`, décor `src/motiv3d/`) : petites histoires la nuit entre un candidat et
  **Motiv**, la petite lettre rose qui parle (personnage original MyMotiv : enveloppe rose qui flotte, grands yeux, rabat en V).
  Inspirée d'un format de pubs d'un autre fournisseur d'IA : ne jamais reprendre son nom, son interface ni sa mascotte.
  Voix fixes : candidat = « Maxime » (`--voix candidat`), Motiv = « Maevys » (`--voix motiv`). Le site s'affiche en
  hologramme (captures téléphone). Rendu 3D sans carte graphique : `GL=swangle` (lent : ≈1 h 30 par minute de vidéo à 30 i/s).
- **À chaque vidéo livrée** : fournir aussi une description TikTok et une description LinkedIn en suivant le **modèle standard**
  `videos-mymotiv/descriptions/description-standard.md` (parties fixes 🔒 / à changer ✏️, sans chiffre inventé). Le propriétaire
  le fait évoluer toutes les 10 vidéos (v1 = vidéos 1 à 10 depuis le 11/10/2026) : tenir le compteur et l'historique du fichier.
- Le `.gitignore` racine ignore `*.md` : utiliser `git add -f` pour les fichiers Markdown.

## Réseau de l'environnement
- Bloqués : HuggingFace, eyecannndy.com, pexels.com, pixabay.com. Transcription hors ligne possible (voir `tools/transcrire.mjs`).
