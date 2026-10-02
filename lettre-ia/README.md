# Lettre IA

Application web (SaaS) qui rédige une lettre de motivation à partir d'un **CV** et d'une **offre d'emploi**.

- Import du CV et de l'offre en PDF, DOCX ou TXT (ou copier-coller du texte).
- Choix de la longueur : courte, standard ou longue, plus des consignes libres.
- Ligne d'ajustement après génération : « Plus court », « Plus long » ou n'importe quelle demande (« plus chaleureux », « parler du projet X »…).
- Copie et téléchargement de la lettre, texte modifiable directement.
- Installable sur téléphone (PWA : « Ajouter à l'écran d'accueil »).
- Quatre offres Stripe (Apple Pay) : lettre à l'unité, semaine, mois, à vie ; comptes clients avec connexion par lien e-mail, espace client.

## Comment la lettre est produite

Chaque lettre passe par trois appels à Claude (`lib/prompts.ts`) :

1. **Analyse** : un « recruteur » lit le CV et l'offre et rédige un brief : besoins réels du poste, preuves concrètes tirées du CV, angle spécifique à l'entreprise, pièges à éviter.
2. **Rédaction** : la lettre est écrite à partir de ce brief, avec des règles strictes (pas d'invention, une preuve concrète par paragraphe, liste de formules creuses interdites, longueur cible).
3. **Humanisation** : un relecteur vérifie chaque affirmation contre le CV, supprime le blabla et les tics d'IA, casse les structures répétitives et ajuste la longueur.

Les ajustements (« plus court », etc.) repartent de la lettre existante avec les mêmes règles.

## Exemples et avis

- La page d'accueil montre trois lettres réellement générées (courte, standard, longue), modifiables dans `lib/examples.ts`.
- Avis clients en bas de page : note moyenne et nombre d'avis calculés sur la liste affichée. Après sa lettre offerte, l'utilisateur est invité à laisser un avis (un par navigateur, réservé à qui a reçu une lettre). Les avis sont stockés dans Redis (liste `avis`) et peuvent être supprimés depuis la console Upstash.
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
| `ANTHROPIC_API_KEY` | Clé API Anthropic (obligatoire) |
| `ANTHROPIC_MODEL` | Modèle utilisé (par défaut `claude-opus-5-5`) |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe (`sk_live_…` en production, `sk_test_…` pour tester) |
| `ACCESS_SECRET` | Secret aléatoire qui signe les sessions et les liens de connexion (`openssl rand -hex 32`) |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | Envoi des liens de connexion depuis une adresse Gmail, avec un [mot de passe d'application](https://myaccount.google.com/apppasswords) (gratuit, sans nom de domaine) |
| `RESEND_API_KEY`, `EMAIL_FROM` | Ou bien envoi via Resend, sur un domaine vérifié, ex. `Lettre IA <connexion@votre-domaine.fr>` |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Base Redis Upstash (Vercel → Storage) qui enregistre les avis clients ; ajoutées automatiquement par Vercel |
| `STRIPE_TAX_CODE` | Facultatif : code fiscal du produit, exigé par Stripe Managed Payments (par défaut `txcd_10103000`, SaaS à usage personnel) |
| `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT` | Facultatif : identifiants Google AdSense (`ca-pub-…` et numéro du bloc d'annonces) |
| `FREE_TRIAL` | `false` pour désactiver la lettre offerte aux visiteurs |
| `APP_URL` | Facultatif : URL publique du site |
| `PAYWALL_DISABLED` | `true` pour générer sans abonnement (développement uniquement) |

## Offres (SaaS)

Toutes les offres sont définies dans `lib/pricing.ts` (prix TTC) et présentées sur la page `/abonnement` :

| Offre | Prix | Type | Contenu |
|---|---|---|---|
| 1 lettre | 0,99 € | paiement unique | 1 lettre + 3 ajustements |
| Semaine | 1,99 € / semaine | abonnement sans engagement | illimité* |
| Mois | 7,99 € / mois | abonnement sans engagement | illimité* |
| À vie | 12,99 € | paiement unique | illimité*, sans limite de durée |

\* Limite de sécurité : 30 lettres par semaine (`WEEKLY_LIMIT`), remise à zéro chaque lundi.

- Le paiement passe par Stripe Checkout : **Apple Pay**, Google Pay ou carte bancaire. Stripe envoie les factures.
- Les achats uniques (lettre, à vie) sont crédités au retour du client sur le site après paiement, une seule fois par paiement. Les crédits, l'accès à vie et le compteur hebdomadaire sont stockés dans les métadonnées du client Stripe.
- Après la souscription, le client est connecté automatiquement sur l'appareil utilisé.
- Sur un autre appareil, il se connecte depuis `/connexion` : il saisit son e-mail et reçoit un lien de connexion (sans mot de passe), valable 20 minutes.
- `/compte` : état de l'abonnement, date de renouvellement, bouton vers l'espace client Stripe (résiliation, carte bancaire, factures), déconnexion.
- **Aucune base de données** : Stripe est la source de vérité. À chaque génération, le serveur vérifie auprès de Stripe les droits du client (abonnement actif, accès à vie ou crédits). Une résiliation ou un impayé coupe donc l'accès immédiatement à la fin de la période.

À faire dans le tableau de bord Stripe :
1. Activer le compte (identité, IBAN) pour encaisser en réel.
2. **Paramètres → Moyens de paiement** : vérifier qu'Apple Pay et Google Pay sont activés.
3. **Paramètres → Billing → Portail client** : cliquer sur « Enregistrer » une fois (en mode test et en mode réel) pour activer l'espace client, et autoriser la résiliation.
4. Copier la clé secrète dans `STRIPE_SECRET_KEY`. Pour tester : clé `sk_test_…` et carte `4242 4242 4242 4242`.

Connexion par e-mail, au choix :
- **Gmail (gratuit, sans nom de domaine)** : activer la validation en deux étapes du compte Google, créer un mot de passe d'application sur https://myaccount.google.com/apppasswords, puis renseigner `GMAIL_USER` et `GMAIL_APP_PASSWORD`. Limite de Google : environ 500 e-mails par jour.
- **Resend** : créer une clé API (`RESEND_API_KEY`), vérifier votre nom de domaine, puis choisir l'expéditeur `EMAIL_FROM`.

## Lettre offerte, conseils et partenaires

- **Lettre offerte** : chaque visiteur non abonné peut générer une lettre complète, sans inscription. Elle n'est comptée comme utilisée qu'une fois reçue (`/api/essai`). Les ajustements sont réservés aux abonnés. `FREE_TRIAL=false` désactive l'offre.
- La limite repose sur un cookie : un visiteur qui l'efface peut obtenir une nouvelle lettre. Pour protéger votre budget, fixez une limite de dépense mensuelle dans la console Anthropic (Settings → Limits).
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
app/page.tsx               Interface (CV | Offre, longueur, consignes, résultat, ajustements)
app/api/extract/route.ts   Conversion PDF / DOCX / TXT → texte
app/api/generate/route.ts  Enchaînement analyse → rédaction → humanisation (progression en direct)
lib/prompts.ts             Tous les prompts, à retravailler ici
lib/claude.ts              Appel à l'API Claude
```

## Prochaines étapes possibles

- Historique des lettres (nécessite une base de données).
- Offre entreprise multi-utilisateurs (plusieurs salariés sous un même abonnement).
- Export PDF / Word mis en page.
- Application App Store / Play Store en emballant le site avec Capacitor.
