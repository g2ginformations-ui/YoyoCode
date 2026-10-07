# MyMotiv

Application web (SaaS) qui rédige une lettre de motivation à partir d'un **CV** et d'une **offre d'emploi**.

- Import du CV et de l'offre en PDF, DOCX ou TXT (ou copier-coller du texte).
- Choix de la longueur : courte, standard ou longue, plus des consignes libres.
- Ligne d'ajustement après génération : « Plus court », « Plus long » ou n'importe quelle demande (« plus chaleureux », « parler du projet X »…).
- Nom et site de l'entreprise repérés dans l'offre (modifiables) ; le logo de l'entreprise s'affiche dans le PDF.
- Lecture de l'offre depuis son lien (`/api/offre`) : données « JobPosting » de la page (entreprise, site, logo officiel), sinon texte visible. Sites qui bloquent les robots : message invitant à coller le texte. Protections : http(s) seulement, aucune adresse interne, redirections revérifiées, 3 Mo et 8 s maximum, 30 liens par heure et par IP (`lib/safe-fetch.ts`).
- Page « Mon CV adapté » (`/cv`, offres illimitées) : le CV est trié et reformulé pour l'offre sans rien inventer (`/api/cv`, réponse JSON contrôlée par `lib/cv.ts`), aperçu à l'écran et PDF d'une page (`lib/cv-pdf.ts` : échelle réduite puis puces retirées si besoin). Photo facultative recadrée et gardée dans le navigateur ; logo de l'entreprise en option, désactivé par défaut. Visiteurs sans offre : exemple fictif flouté et lien vers les offres. Compte dans la limite hebdomadaire.
- Site et logo de l'entreprise trouvés automatiquement (`lib/company-site.ts`) : site à partir du nom quand l'offre n'a pas de lien (`/api/entreprise` : domaine exact .fr/.com d'abord, Wikidata ensuite sans homonymes), logo publié par le site, logo officiel Wikimedia, ou icônes Google/DuckDuckGo (`/api/logo`). Statut affiché sous l'offre (« ✓ Site et logo trouvés »…). Vérification réelle sur 38 entreprises : workflow `lettre-ia-logos` (`scripts/check-company-logos.mts`).
- Mots-clés de l'offre relevés pendant l'analyse et affichés sous la lettre, cochés quand la lettre les reprend.
- Lettre PDF ajustée pour tenir sur une page (taille du texte puis marges réduites, dans une limite lisible). Style Moderne aux couleurs du logo de l'entreprise.
- Copie et téléchargement direct en PDF, texte modifiable directement.
- 4 styles de PDF : Classique (pour tous), et, inclus dans les offres illimitées (semaine, mois, à vie) : Moderne (liseré mauve), Minimaliste, et Sombre (fond noir, avec un avertissement : déconseillé si la lettre est imprimée ou triée par un logiciel). Les styles réservés s'affichent avec un cadenas et renvoient vers les offres.
- Mode clair / sombre de l'écran au choix (lune / soleil dans le menu), mémorisé dans le navigateur ; le PDF n'en dépend pas.
- Installable sur téléphone (PWA : « Ajouter à l'écran d'accueil »).
- Quatre offres Stripe (Apple Pay) : lettre à l'unité, semaine, mois, à vie ; comptes clients avec mot de passe, « Continuer avec Google / Apple » ou lien par e-mail, espace client.

## Comment la lettre est produite

Chaque lettre passe par trois appels à Claude (`lib/prompts.ts`) :

1. **Analyse** : un « recruteur » lit le CV et l'offre et rédige un brief : besoins réels du poste, preuves concrètes tirées du CV, angle spécifique à l'entreprise, pièges à éviter.
2. **Rédaction** : la lettre est écrite à partir de ce brief, avec des règles strictes (pas d'invention, une preuve concrète par paragraphe, liste de formules creuses interdites, longueur cible).
3. **Humanisation** : un relecteur vérifie chaque affirmation contre le CV, supprime le blabla et les tics d'IA, casse les structures répétitives et ajuste la longueur.

Les ajustements (« plus court », etc.) repartent de la lettre existante avec les mêmes règles.

## Exemples et avis

- La page d'accueil montre trois lettres réellement générées (courte, standard, longue), modifiables dans `lib/examples.ts`.
- Avis clients en bas de page : note moyenne et nombre d'avis calculés sur la liste affichée. Après sa lettre offerte, l'utilisateur est invité à laisser un avis (un par navigateur, réservé à qui a reçu une lettre). Les avis sont stockés dans Redis (liste `avis`). Modération : `/admin/avis`, protégée par `ADMIN_PASSWORD`.
- Les avis de vrais clients du premier site sont dans `lib/reviews-imported.ts`, affichés avec la mention « Précédent site ». Gardez une preuve de leur origine.

## Lancer en local

```bash
cd lettre-ia
npm install
cp .env.example .env.local   # puis collez votre clé ANTHROPIC_API_KEY
npm run dev                  # http://localhost:3000
```

Variables d'environnement :

| Variable | Rôle |
|---|---|
| `MISTRAL_API_KEY` | Clé API Mistral AI (console.mistral.ai). Si elle est présente, toutes les lettres sont rédigées par Mistral (offre gratuite : les textes peuvent servir à entraîner ses modèles, le site l'indique aux utilisateurs) |
| `MISTRAL_MODEL` | Modèle Mistral (par défaut `mistral-large-latest`) |
| `ANTHROPIC_API_KEY` | Clé API Anthropic, utilisée si `MISTRAL_API_KEY` est absente |
| `ANTHROPIC_MODEL` | Modèle des lettres payantes et des ajustements (par défaut `claude-sonnet-5-5`) |
| `ANTHROPIC_TRIAL_MODEL` | Modèle de la lettre offerte (par défaut `claude-haiku-4-5`, moins cher) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (`sk_live_…` en production, `sk_test_…` pour tester) |
| `STRIPE_WEBHOOK_SECRET` | Recommandé : secret de signature du webhook Stripe (`whsec_…`), voir « Webhook Stripe » plus bas |
| `ACCESS_SECRET` | Secret aléatoire qui signe les sessions et les liens de connexion (`openssl rand -hex 32`) |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Envoi des liens de connexion depuis une adresse Gmail, avec un [mot de passe d'application](https://myaccount.google.com/apppasswords) (gratuit, sans nom de domaine) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Ou bien envoi via Resend, sur un domaine vérifié, ex. `MyMotiv <connexion@votre-domaine.fr>` |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Facultatif : bouton « Continuer avec Google » (identifiants OAuth de Google Cloud, URI de redirection `https://<site>/api/auth/google/callback`) |
| `APPLE_SERVICES_ID`, `APPLE_TEAM_ID`, `APPLE_KEY_ID`, `APPLE_PRIVATE_KEY` | Facultatif : bouton « Continuer avec Apple » (compte Apple Developer, retour `https://<site>/api/auth/apple/callback`) |
| `ADMIN_PASSWORD` | Mot de passe de l'espace de modération des avis (`/admin/avis`) |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Base Redis Upstash (Vercel → Storage) : avis clients et protections anti-abus ; ajoutées automatiquement par Vercel |
| `STRIPE_TAX_CODE` | Facultatif : code fiscal du produit, exigé par Stripe Managed Payments (par défaut `txcd_10103000`, SaaS à usage personnel) |
| `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT` | Facultatif : identifiants Google AdSense (`ca-pub-…` et numéro du bloc d'annonces) |
| `FREE_TRIAL` | `false` pour désactiver la lettre offerte aux visiteurs |
| `APP_URL` | Facultatif : URL publique du site |
| `PAYWALL_DISABLED` | `true` pour générer sans abonnement (développement uniquement) |

## Offres (SaaS)

Toutes les offres sont définies dans `lib/pricing.ts` (prix TTC) et présentées sur la page `/abonnement` :

| Offre | Prix | Type | Contenu |
|---|---|---|---|
| 1 lettre | 1,99 € | paiement unique | 1 lettre + 3 ajustements + son CV adapté |
| Semaine | 3,99 € / semaine | abonnement sans engagement | illimité* (badge « Recommandé ») |
| Mois | 6,99 € / mois | abonnement sans engagement | illimité* |
| À vie | 24,99 € | paiement unique | 150 lettres, sans date limite (les accès à vie achetés avant le 7/10/2026 restent illimités*) |

\* Limite de sécurité : 30 lettres par semaine (`WEEKLY_LIMIT`), remise à zéro chaque lundi.

- Le paiement passe par Stripe Checkout : **Apple Pay**, Google Pay ou carte bancaire. Stripe envoie les factures.
- Les achats uniques (lettre, à vie) sont crédités au retour du client sur le site après paiement, ou par le webhook Stripe s'il a fermé l'onglet avant (`lib/fulfill.ts`), une seule fois par paiement. Les crédits, l'accès à vie et le compteur hebdomadaire sont stockés dans les métadonnées du client Stripe.
- Après la souscription, le client est connecté automatiquement sur l'appareil utilisé, et peut créer un mot de passe dans « Mon compte ».
- Sur un autre appareil, il se connecte depuis `/connexion` : e-mail et mot de passe, Google / Apple, ou lien de connexion par e-mail (valable 20 minutes).
- `/compte` : état de l'abonnement, date de renouvellement, bouton vers l'espace client Stripe (résiliation, carte bancaire, factures), déconnexion.
- **Aucune base de données** : Stripe est la source de vérité. À chaque génération, le serveur vérifie auprès de Stripe les droits du client (abonnement actif, accès à vie ou crédits). Une résiliation ou un impayé coupe donc l'accès immédiatement à la fin de la période.

À faire dans le tableau de bord Stripe :
1. Activer le compte (identité, IBAN) pour encaisser en réel.
2. **Paramètres → Moyens de paiement** : vérifier qu'Apple Pay et Google Pay sont activés.
3. **Paramètres → Billing → Portail client** : cliquer sur « Enregistrer » une fois (en mode test et en mode réel) pour activer l'espace client, et autoriser la résiliation.
4. Copier la clé secrète dans `STRIPE_SECRET_KEY`. Pour tester : clé `sk_test_…` et carte `4242 4242 4242 4242`.

### Webhook Stripe (recommandé)

Sans webhook, un client qui ferme l'onglet juste après avoir payé une lettre ou l'accès à vie ne reçoit pas son achat. Pour l'éviter :

1. Stripe → **Développeurs → Webhooks → Ajouter une destination**.
2. URL : `https://<votre-site>/api/stripe/webhook`.
3. Événements : `checkout.session.completed` et `checkout.session.async_payment_succeeded`.
4. Copier le **secret de signature** (`whsec_…`) dans la variable `STRIPE_WEBHOOK_SECRET` sur Vercel, puis redéployer.
5. À refaire en mode réel (le mode test et le mode réel ont chacun leurs webhooks et leur secret).

Connexion par e-mail, au choix :
- **Gmail (gratuit, sans nom de domaine)** : activer la validation en deux étapes du compte Google, créer un mot de passe d'application sur https://myaccount.google.com/apppasswords, puis renseigner `GMAIL_USER` et `GMAIL_APP_PASSWORD`. Limite de Google : environ 500 e-mails par jour.
- **Resend** : créer une clé API (`RESEND_API_KEY`), vérifier votre nom de domaine, puis choisir l'expéditeur `EMAIL_FROM`.

## Lettre offerte, conseils et partenaires

- **Lettre offerte** : chaque visiteur non abonné peut générer une lettre complète, sans inscription. Elle n'est comptée comme utilisée qu'une fois reçue (`/api/essai`). Les ajustements sont réservés aux abonnés. `FREE_TRIAL=false` désactive l'offre.
- La limite repose sur un cookie, complétée par une limite de 2 lettres offertes par connexion (adresse IP) et par jour quand la base Redis est configurée. Pour protéger votre budget, fixez aussi une limite de dépense mensuelle dans la console Anthropic (Settings → Limits).

## Protections contre les abus

Avec la base Redis Upstash configurée (`lib/guard.ts`), le site limite par connexion (adresse IP, jamais stockée en clair) :
- les lettres offertes (2 par jour), les avis (3 par jour), les liens de connexion par e-mail (5 par heure), les essais de mot de passe (20 par quart d'heure) et l'accès administrateur (10 par heure) ;
- une seule rédaction à la fois par compte client : un crédit ne peut pas servir à lancer plusieurs lettres en parallèle.

Sans base Redis, ces limites sont simplement désactivées. Les pages envoient aussi des en-têtes de sécurité (`next.config.ts`).
- **Pages de conseils** : `/conseils` et 5 guides (`lib/guides.ts`), avec `sitemap.xml` et `robots.txt` pour Google. Pour ajouter un guide, ajoutez une entrée dans `GUIDES`.
- **Partenaires (affiliation)** : `lib/partners.ts`. Collez le lien d'affiliation dans `url` pour afficher une recommandation sous la lettre et dans les guides. Sans lien, rien ne s'affiche. Les liens portent `rel="sponsored"` et une mention « liens partenaires ».

## Saisie conservée

- Le CV, l'offre, la longueur, les consignes et la lettre en cours sont gardés dans le navigateur (`lib/draft.ts`) : en revenant sur la page (bouton « précédent », lien « Retour », rechargement), tout est remis en place.
- Le lien « Vider les champs » efface le brouillon ; les lettres déjà générées restent dans « Mes lettres ».

## Historique des lettres

- Chaque lettre générée est enregistrée automatiquement **dans le navigateur de l'utilisateur** (`localStorage`, `lib/history.ts`). Rien n'est conservé sur le serveur.
- Un ajustement ou une retouche manuelle met à jour la même entrée ; une nouvelle génération crée une nouvelle entrée. 50 lettres au maximum, les plus anciennes sont retirées.
- Page `/historique` (« Mes lettres ») : lire, reprendre (recharge la lettre, le CV et l'offre dans l'éditeur), copier, télécharger, supprimer.
- Limite : l'historique est propre à chaque appareil et disparaît si l'utilisateur efface les données de son navigateur. Une synchronisation entre appareils demanderait une base de données.

## Page « Découvrir le créateur »

- Page `/createur`, liée depuis le pied de page : affiche du guide cliquable, texte et bouton vers votre page.
- Texte, nom et lien : `lib/promo.ts`.
- Image : `public/createur.jpg` (dimensions déclarées dans `lib/promo.ts`). Sans image, les initiales s’affichent.
- Photo de profil (facultative) : `public/createur-profil.png`, carrée, affichée en rond en haut de la page.

## Publicité (Google AdSense, facultatif)

- Un emplacement publicitaire s'affiche sous le formulaire, **uniquement pour les visiteurs non abonnés**. Les abonnés n'en voient jamais.
- Tant que `NEXT_PUBLIC_ADSENSE_CLIENT` et `NEXT_PUBLIC_ADSENSE_SLOT` ne sont pas définis, rien ne s'affiche.
- `/ads.txt` est généré automatiquement à partir de `NEXT_PUBLIC_ADSENSE_CLIENT`.
- Ces variables sont intégrées au moment du build : après les avoir modifiées sur Vercel, il faut redéployer.
- AdSense exige un nom de domaine à vous, une politique de confidentialité et, dans l'UE, un bandeau de consentement aux cookies. Le message de consentement se configure gratuitement dans AdSense (« Confidentialité et messages »).

## Mettre en ligne

Le plus simple : [Vercel](https://vercel.com) → importer le dépôt GitHub → **Root Directory** = `lettre-ia` → ajouter `ANTHROPIC_API_KEY` dans les variables d'environnement → Deploy.

## Structure

```
app/page.tsx                    Interface (CV | Offre, entreprise, longueur, consignes, résultat, ajustements)
app/api/extract/route.ts        Conversion PDF / DOCX / TXT → texte
app/api/generate/route.ts       Enchaînement analyse → rédaction → humanisation (progression en direct)
app/api/stripe/webhook/route.ts Webhook Stripe (achats délivrés même si l'onglet est fermé)
lib/prompts.ts                  Tous les prompts, à retravailler ici
lib/ai.ts, lib/claude.ts        Appel à l'IA (Claude, ou Mistral si MISTRAL_API_KEY est définie)
lib/access.ts, lib/fulfill.ts   Droits des clients (Stripe) et livraison des achats
lib/guard.ts, lib/kv.ts         Limites anti-abus et accès à la base Redis
lib/pdf.ts                      Lettre en PDF (4 styles), avec le logo de l'entreprise visée
lib/theme.ts                    Mode clair / sombre de l'écran
```

## Marque

- Nom : **MyMotiv**. Logo du site : « mymotiv. » en Poppins semi-gras, mauve poudré `#8e6e82` ; icône d'onglet « mm. » (`public/icon.png`, `public/apple-icon.png`, `public/icon-512.png`).
- Aperçu de partage (WhatsApp, LinkedIn…) : `public/og.png` (1200 × 630).
- Couleurs (`app/globals.css`) : mauve poudré `#8e6e82` (logo, titres ; boutons en `#876779`, à peine plus profond pour la lisibilité du texte blanc), beige lin `#c8b7a6` (encarts, zones d'import), gris charbon `#333333` (texte), crème `#f9f7f2` (fond).
- Polices : Poppins (titres, logo, boutons) et Open Sans (texte), hébergées avec le site (`@fontsource`).

## Prochaines étapes possibles

- Synchroniser l'historique des lettres entre appareils (nécessite une base de données).
- Offre entreprise multi-utilisateurs (plusieurs salariés sous un même abonnement).
- Application App Store / Play Store en emballant le site avec Capacitor.
