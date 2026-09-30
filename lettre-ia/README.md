# Lettre IA

Application web (SaaS) qui rédige une lettre de motivation à partir d'un **CV** et d'une **offre d'emploi**.

- Import du CV et de l'offre en PDF, DOCX ou TXT (ou copier-coller du texte).
- Choix de la longueur : courte, standard ou longue, plus des consignes libres.
- Ligne d'ajustement après génération : « Plus court », « Plus long » ou n'importe quelle demande (« plus chaleureux », « parler du projet X »…).
- Copie et téléchargement de la lettre, texte modifiable directement.
- Installable sur téléphone (PWA : « Ajouter à l'écran d'accueil »).
- Abonnement mensuel Stripe (Apple Pay), comptes clients avec connexion par lien e-mail, espace client.

## Comment la lettre est produite

Chaque lettre passe par trois appels à Claude (`lib/prompts.ts`) :

1. **Analyse** : un « recruteur » lit le CV et l'offre et rédige un brief : besoins réels du poste, preuves concrètes tirées du CV, angle spécifique à l'entreprise, pièges à éviter.
2. **Rédaction** : la lettre est écrite à partir de ce brief, avec des règles strictes (pas d'invention, une preuve concrète par paragraphe, liste de formules creuses interdites, longueur cible).
3. **Humanisation** : un relecteur vérifie chaque affirmation contre le CV, supprime le blabla et les tics d'IA, casse les structures répétitives et ajuste la longueur.

Les ajustements (« plus court », etc.) repartent de la lettre existante avec les mêmes règles.

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
| `RESEND_API_KEY` | Clé Resend, pour envoyer les liens de connexion par e-mail |
| `EMAIL_FROM` | Expéditeur des e-mails, ex. `Lettre IA <connexion@votre-domaine.fr>` |
| `STRIPE_PRICE_ID` | Facultatif : prix mensuel créé dans Stripe (sinon 19,95 €/mois défini dans le code) |
| `STRIPE_TAX_CODE` | Facultatif : code fiscal du produit, exigé par Stripe Managed Payments (par défaut `txcd_10103000`, SaaS à usage personnel) |
| `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_SLOT` | Facultatif : identifiants Google AdSense (`ca-pub-…` et numéro du bloc d'annonces) |
| `FREE_TRIAL` | `false` pour désactiver la lettre offerte aux visiteurs |
| `APP_URL` | Facultatif : URL publique du site |
| `PAYWALL_DISABLED` | `true` pour générer sans abonnement (développement uniquement) |

## Abonnement (SaaS)

- **19,95 € par mois**, sans engagement. Page `/abonnement`.
- Le paiement passe par Stripe Checkout : **Apple Pay**, Google Pay ou carte bancaire. Stripe prélève chaque mois et envoie les factures.
- Après la souscription, le client est connecté automatiquement sur l'appareil utilisé.
- Sur un autre appareil, il se connecte depuis `/connexion` : il saisit son e-mail et reçoit un lien de connexion (sans mot de passe), valable 20 minutes.
- `/compte` : état de l'abonnement, date de renouvellement, bouton vers l'espace client Stripe (résiliation, carte bancaire, factures), déconnexion.
- **Aucune base de données** : Stripe est la source de vérité. À chaque génération, le serveur vérifie auprès de Stripe que l'abonnement est actif. Une résiliation ou un impayé coupe donc l'accès immédiatement à la fin de la période.

À faire dans le tableau de bord Stripe :
1. Activer le compte (identité, IBAN) pour encaisser en réel.
2. **Paramètres → Moyens de paiement** : vérifier qu'Apple Pay et Google Pay sont activés.
3. **Paramètres → Billing → Portail client** : cliquer sur « Enregistrer » une fois (en mode test et en mode réel) pour activer l'espace client, et autoriser la résiliation.
4. Copier la clé secrète dans `STRIPE_SECRET_KEY`. Pour tester : clé `sk_test_…` et carte `4242 4242 4242 4242`.

À faire sur Resend (connexion par e-mail) :
1. Créer un compte sur resend.com et une clé API (`RESEND_API_KEY`).
2. Ajouter et vérifier votre nom de domaine (quelques enregistrements DNS), puis choisir l'expéditeur `EMAIL_FROM`.

## Lettre offerte, conseils et partenaires

- **Lettre offerte** : chaque visiteur non abonné peut générer une lettre complète, sans inscription. Elle n'est comptée comme utilisée qu'une fois reçue (`/api/essai`). Les ajustements sont réservés aux abonnés. `FREE_TRIAL=false` désactive l'offre.
- La limite repose sur un cookie : un visiteur qui l'efface peut obtenir une nouvelle lettre. Pour protéger votre budget, fixez une limite de dépense mensuelle dans la console Anthropic (Settings → Limits).
- **Pages de conseils** : `/conseils` et 5 guides (`lib/guides.ts`), avec `sitemap.xml` et `robots.txt` pour Google. Pour ajouter un guide, ajoutez une entrée dans `GUIDES`.
- **Partenaires (affiliation)** : `lib/partners.ts`. Collez le lien d'affiliation dans `url` pour afficher une recommandation sous la lettre et dans les guides. Sans lien, rien ne s'affiche. Les liens portent `rel="sponsored"` et une mention « liens partenaires ».

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
