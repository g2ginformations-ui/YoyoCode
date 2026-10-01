# SKKIN : boutique d'autobronzants

Boutique en ligne complète, avec un espace admin pour tout modifier sans toucher au code.

- **Vitrine** : accueil (bannière, points forts, produits mis en avant, catégories, avis), boutique filtrable par catégorie, fiches produits avec teintes, pages d'information (À propos, FAQ, CGV…).
- **Panier et commande** : panier gardé dans le navigateur, frais de livraison et seuil de livraison offerte, paiement par carte via Stripe Checkout (facultatif).
- **Admin** (`/admin`) :
  - **Produits** : ajouter, modifier, dupliquer, supprimer ; prix, prix barré, stock, catégorie, teintes, photos (envoi depuis l'ordinateur ou adresse web), description, utilisation, composition, mise en ligne, mise en avant.
  - **Pages** : créer et modifier toutes les pages de contenu.
  - **Réglages du site** : nom, logo, couleurs, bandeau d'annonce, bannière d'accueil, menu, pied de page, catégories, avis clients, livraison, contact et réseaux sociaux.
  - **Commandes** : liste, détail client, changement de statut (en attente, payée, expédiée, annulée).

Les produits, pages et textes livrés au départ sont des exemples à remplacer par les vôtres (photos, liste INCI, CGV et mentions légales à compléter).

## Lancer en local

```bash
cd skkin
npm install
cp .env.example .env.local   # puis choisissez ADMIN_PASSWORD
npm run dev                  # http://localhost:3000, admin sur http://localhost:3000/admin
```

| Variable | Rôle |
|---|---|
| `ADMIN_PASSWORD` | Mot de passe de l'espace admin (obligatoire) |
| `ADMIN_SECRET` | Secret aléatoire qui signe la session admin (`openssl rand -hex 32`) |
| `STRIPE_SECRET_KEY` | Facultatif. Active le paiement par carte. Sans clé, les commandes sont enregistrées « en attente » et le règlement se fait hors du site |
| `SITE_URL` | Adresse publique du site, pour le retour après paiement Stripe |
| `DATA_DIR` | Dossier des données (par défaut `./data`) |

## Où sont les données

Tout est dans `data/store.json` (produits, pages, réglages, commandes) et `data/uploads/` (photos envoyées). Ce dossier est créé au premier lancement à partir de `lib/seed.ts`. **Sauvegardez-le régulièrement** : c'est votre boutique.

## Mise en ligne

Le site a besoin d'un serveur avec un disque persistant, pour garder `data/` entre deux redémarrages : un VPS, ou Railway, Render ou Fly.io avec un volume monté sur `DATA_DIR`.

```bash
npm run build
npm start
```

Les hébergements « serverless » sans disque (Vercel, Netlify) ne conservent pas les modifications faites dans l'admin.

## À savoir

- Une commande est enregistrée, et le stock décompté, dès que le client valide le formulaire. Si le client abandonne le paiement Stripe, la commande reste « en attente » : passez-la en « annulée » depuis l'admin.
- Aucun e-mail n'est envoyé automatiquement : les nouvelles commandes apparaissent dans l'admin.
