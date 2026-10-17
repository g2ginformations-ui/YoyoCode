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

- **Les 2 premières secondes décident de tout** : toutes les vidéos plafonnent vers 800 vues, donc TikTok ne les pousse
  pas plus loin. Priorité absolue à l'accroche : texte lisible dès l'image 0, mouvement tout de suite, pas d'intro.
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
