# Lettre IA

Application web (SaaS) qui rédige une lettre de motivation à partir d'un **CV** et d'une **offre d'emploi**.

- Import du CV et de l'offre en PDF, DOCX ou TXT (ou copier-coller du texte).
- Choix de la longueur : courte, standard ou longue, plus des consignes libres.
- Ligne d'ajustement après génération : « Plus court », « Plus long » ou n'importe quelle demande (« plus chaleureux », « parler du projet X »…).
- Copie et téléchargement de la lettre, texte modifiable directement.
- Installable sur téléphone (PWA : « Ajouter à l'écran d'accueil »).

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
| `ACCESS_SECRET` | Secret aléatoire qui signe le cookie d'accès (`openssl rand -hex 32`) |
| `ACCESS_DAYS` | Durée de l'accès après paiement (30 jours par défaut) |
| `STRIPE_PRICE_ID` | Facultatif : prix créé dans Stripe (sinon 19,95 € défini dans le code) |
| `APP_URL` | Facultatif : URL publique du site |
| `PAYWALL_DISABLED` | `true` pour générer sans payer (développement uniquement) |

## Paiement (Stripe, Apple Pay)

- Page d'achat : `/achat`, **19,95 €** en paiement unique, qui débloque la génération pendant `ACCESS_DAYS` jours.
- Le bouton « Payer » ouvre Stripe Checkout, qui propose **Apple Pay** (iPhone, Mac avec Safari), Google Pay et la carte bancaire.
- Au retour, le serveur vérifie auprès de Stripe que le paiement est bien encaissé, puis dépose un cookie d'accès signé. La génération est bloquée côté serveur sans ce cookie.

À faire dans le tableau de bord Stripe :
1. Activer le compte (identité, IBAN) pour encaisser en réel.
2. **Paramètres → Moyens de paiement** : vérifier qu'Apple Pay et Google Pay sont activés.
3. Copier la clé secrète dans `STRIPE_SECRET_KEY`. Pour tester, utilisez la clé `sk_test_…` et la carte `4242 4242 4242 4242`.

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

- Comptes utilisateurs, historique des lettres, paiement (Stripe) pour le modèle SaaS.
- Export PDF / Word mis en page.
- Application App Store / Play Store en emballant le site avec Capacitor.
