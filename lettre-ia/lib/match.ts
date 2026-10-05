// Score de correspondance CV ↔ offre, calculé dans le navigateur : on relève les mots-clés les plus
// présents dans l'offre, puis on regarde lesquels figurent déjà dans le CV. Rien n'est inventé :
// le pourcentage affiché est exactement « mots-clés trouvés / mots-clés relevés ».

// Mots trop courants (ou propres à toutes les annonces) pour dire quelque chose du poste.
const STOP = new Set(
  (
    "avec dans pour par sur sous entre vers chez sans plus moins tres bien tout tous toute toutes cette ces ceux celle " +
    "celles leur leurs votre vos notre nos vous nous ils elles sont etre avoir fait faire sera seront ainsi aussi alors " +
    "comme donc dont mais car puis afin selon depuis pendant lors quand quoi quel quelle quels quelles chaque autre autres " +
    "meme memes deja encore toujours souvent egalement notamment plusieurs certains certaines avez avons etes peut peuvent " +
    "doit doivent permet permettant poste postes offre offres entreprise entreprises societe groupe profil profils mission " +
    "missions candidat candidate candidats candidature candidatures equipe equipes rejoindre rejoignez recherche recherchons " +
    "recrute recrutons recrutement emploi emplois travail travailler contrat type temps plein partiel salaire remuneration " +
    "avantages description descriptif propos annonce date lieu localisation france paris poste vous etc ideal idealement " +
    "souhaite souhaitee souhaitez serez aurez sein cadre jour jours semaine mois annee annees heure heures euros brut " +
    "postuler cliquez savoir plus votre vos ensemble grand grande grands grandes nouveau nouvelle nouveaux nouvelles " +
    "activite activites service services client clientes clients partie niveau dote dotee bonne bonnes bons forte fort " +
    "capacite capacites qualite qualites sens esprit gout envie aimez maitrise maitriser connaissance connaissances " +
    "cdi cdd the and for with you our your are will this that from have"
  ).split(" "),
);

export function fold(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Mots-clés de l'offre : fréquence, avec un bonus pour les sigles et outils (SQL, SEO, B2B, Excel…).
export function offerKeywords(offer: string, max = 12, exclude: string[] = []): string[] {
  const skip = new Set(exclude.map(fold));
  const counts = new Map<string, { label: string; score: number }>();
  for (const match of offer.matchAll(/[A-Za-zÀ-ÖØ-öø-ÿ][A-Za-zÀ-ÖØ-öø-ÿ0-9+#.-]*[A-Za-zÀ-ÖØ-öø-ÿ0-9+#]/g)) {
    const raw = match[0];
    const key = fold(raw);
    const acronym = /^[A-Z0-9+#.-]{2,6}$/.test(raw) && /[A-Z]/.test(raw);
    if (!acronym && (key.length < 5 || STOP.has(key))) continue;
    if ((acronym && STOP.has(key)) || skip.has(key)) continue;
    const entry = counts.get(key) ?? { label: raw, score: 0 };
    entry.score += acronym ? 2 : 1;
    counts.set(key, entry);
  }
  return [...counts.values()]
    .filter((entry) => entry.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, max)
    .map((entry) => entry.label);
}

// Un mot-clé est « présent » s'il figure dans le CV, ou sa racine pour les mots longs (gestion/gérer…).
function present(keyword: string, cv: string): boolean {
  const key = fold(keyword);
  if (cv.includes(key)) return true;
  return key.length >= 7 && cv.includes(key.slice(0, 6));
}

export type Match = { score: number; keywords: string[]; found: string[] };

// Le nom de l'entreprise n'est pas une compétence : ses mots sont écartés.
export function matchCvOffer(cv: string, offer: string, company = ""): Match | null {
  const keywords = offerKeywords(offer, 12, company.split(/[\s'’-]+/).filter(Boolean));
  if (keywords.length < 4 || cv.trim().length < 80) return null;
  const folded = fold(cv);
  const found = keywords.filter((k) => present(k, folded));
  return { score: Math.round((found.length / keywords.length) * 100), keywords, found };
}
