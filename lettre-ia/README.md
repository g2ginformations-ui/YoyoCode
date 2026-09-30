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
