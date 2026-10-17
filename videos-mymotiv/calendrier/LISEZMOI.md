# La vidéo TikTok du jour (tâche automatique)

Demande du propriétaire du 17/10/2026 : « tous les jours une vidéo, et tu choisis l'heure de publication la plus judicieuse ».
Une tâche planifiée lance chaque matin vers 7 h 50 (heure de Paris) une nouvelle session Claude qui :

1. part de la branche `claude/video-du-jour` (elle garde le journal d'un jour à l'autre) et y fusionne `main` ;
2. lit `CLAUDE.md`, ce fichier, `heures.md` et `journal.md` ;
3. choisit le sujet du jour (rotation ci-dessous, jamais un sujet des 14 derniers jours du journal) ;
4. fabrique UNE vidéo courte (20 à 45 s, 1080×1920, zones sûres TikTok, bandeau « 💬 Commente « MOT » » dès 0,3 s) ;
5. choisit l'heure de publication avec `heures.md` ;
6. envoie au propriétaire, sur son téléphone : la vidéo, l'heure conseillée, les descriptions TikTok et LinkedIn
   (modèle `../descriptions/description-standard.md`), les réglages TikTok, et une vidéo du stock pour le 2e compte ;
7. note la ligne du jour dans `journal.md`, enregistre et pousse sur `claude/video-du-jour` (jamais sur `main`, pas de PR :
   le propriétaire fusionne quand il veut).

Les règles de `CLAUDE.md` restent toutes valables (aucun chiffre inventé, aucune promesse de résultat, pas de faux avis,
pas de visage généré, pas de voix d'une personne réelle, le prix lu dans `lettre-ia/lib/pricing.ts`).

## Rotation de la semaine

| Jour | Type de vidéo | Pourquoi | Exemples déjà faits |
|---|---|---|---|
| Lundi | Conseil utile (format « démo racontée »), une seule mention de l'offre à la fin | On enregistre et on partage un conseil | `TroisBlocs`, `SeptSecondes` |
| Mardi | Débat : un vrai dilemme sans bonne réponse, deux camps équilibrés, bandeau = la question | Les commentaires | `TuPrendsQui`, `Flags` |
| Mercredi | Démo du vrai site sur téléphone (`public/tuto-tel/`) + offre Semaine | Montrer une transformation | `ToutEnUn`, `TutoDoigt` |
| Jeudi | Humour / mème dessiné par nous (aucune interface d'appli réelle) | Le partage | `CestCombien`, `Matcha` |
| Vendredi | Vente directe : Semaine 3,99 €, « un centime de plus que deux lettres à l'unité », sans engagement, 1re lettre offerte, « *jusqu'à 30 lettres par semaine » | La conversion | `Impact`, `Ballon` |
| Samedi | Yann et les coulisses : son vrai parcours, UGC fondateur (vraies photos masquées) | La confiance | `UgcFondateur`, `MonCV` |
| Dimanche | Jeu ou quiz (score sur 3, détail caché, « devine ») | Les commentaires | `QuizRecruteur`, `Instinct` |

## Ce que disent les statistiques (relevé du 17/10/2026, détail en bas de `journal.md`)

- **Les 2 premières secondes décident de tout** : toutes les vidéos plafonnent vers 800 vues et les gens partent après
  1,3 à 5,2 s en moyenne (détail par vidéo dans `journal.md`). RÈGLE DE L'ACCROCHE, à respecter dans chaque vidéo du jour :
  1. **Yann masqué en grand dès l'image 0** (vraies photos de `public/yann/`, regard caméra) : c'est la meilleure vidéo
     (5,2 s). Pour une vidéo sans Yann, une phrase choc en très gros au centre et quelque chose qui bouge dès 0 s.
  2. **Une phrase qui promet un secret, choque ou intrigue** (« Les RH ne veulent pas que vous sachiez ça », une citation
     entre guillemets), lisible en 1 s, en GROS (≥ 64 px), pas une question générique qui sonne comme une pub.
  3. **La voix part à 0 s**, sans intro, sans logo, sans musique seule.
  4. **Un changement toutes les ~1 s** pendant les 3 premières secondes (geste de Yann, coupe, zoom, mot qui tombe).
  5. **Rien qui ressemble à une pub avant 3 s** : pas de cartes d'objections, pas de lettre en petit, pas de fond clair.
     La vente (offre, prix) arrive APRÈS l'accroche.
  Contrôle avant le rendu : une planche des images à 0 / 0,5 / 1 / 1,5 / 2 / 3 s, comparée à `les-rh-ne-veulent-pas-tiktok.mp4`.
  But mesurable : dépasser 5,2 s de temps moyen regardé, puis 8 s.
- **Presque personne ne passe par le profil** (68 vues du profil pour 11,5 K vues) : le lien de la bio ne suffit pas. On garde
  toujours « 💬 Commente MOT → je t'envoie le lien » dès 0,3 s.
- **Presque tous les spectateurs sont nouveaux** : créer des rendez-vous (séries, « partie 2 », même format chaque jour de
  la semaine) pour qu'ils reviennent et s'abonnent.
- **Mots recherchés** : « alternance rh », « alternance recrutement commercial », « lettre de motivation » : les mettre
  dans le texte de la vidéo et dans la description quand le sujet s'y prête.
- **Public** : 63 % d'hommes, 36 % de femmes. Rester neutre (candidats « A » et « B », « tu »), ne pas viser un seul profil.

## Les deux comptes

- **@ysl92i** (« MyMotiv. ») : compte principal, reçoit la vidéo du jour à l'heure conseillée.
- **@mymotiv.lettre2motiv** : jamais la même vidéo que sur le compte principal (TikTok peut moins montrer un contenu repris
  à l'identique). On y poste une vidéo du stock (liste en bas de `journal.md`) encore jamais publiée, à son créneau de `heures.md`.
  Jamais une vidéo aux ANCIENS prix (liste dans `CLAUDE.md` : Dilemme, AppleKeynote, AppleMyMotiv, Express, Fantomes,
  FantomesCanette, Recherche/Recherche30), ni `PresentationYann` / `RecruteurTractions` (« cinq mois », « à Paris »).

## Réglages TikTok à rappeler dans le message

- Voix de synthèse ou images faites par IA : activer l'étiquette « contenu généré par l'IA ».
- C'est sa propre marque : « Contenu commercial » → « Votre marque ».
- Le mot à surveiller en commentaire et la réponse en message privé : `yoyo-code.vercel.app/candidature`
  (dans les descriptions aussi : `tinyurl.com/try-mymotiv` passe par une redirection publicitaire).

## Si une étape bloque

- Crédits ElevenLabs épuisés : vidéo sans voix (texte animé + musique `synth_<nom>.py`), et le dire.
- Rendu impossible : proposer une vidéo du stock `rendus/` jamais postée, et dire pourquoi.
- Publication automatique : seulement quand le propriétaire aura connecté son appli développeur TikTok (Composio) ;
  tant que TikTok n'a pas audité l'appli, ses publications restent PRIVÉES (« moi uniquement »).
