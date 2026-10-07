// Actualités de l'emploi : articles datés et sourcés (référencement).
// Règle : chaque chiffre vient d'une source citée dans `sources`, rien n'est inventé.
import type { GuideSection } from "@/lib/guides";

export type NewsSource = { label: string; url: string; date: string };

export type NewsArticle = {
  slug: string;
  title: string;
  description: string;
  date: string; // AAAA-MM-JJ, date de publication sur MyMotiv
  category: "Droit du travail" | "Alternance" | "Stages" | "Intérim";
  intro: string;
  sections: GuideSection[];
  tip: string; // le conseil MyMotiv pour la candidature
  sources: NewsSource[];
};

export const NEWS: NewsArticle[] = [
  {
    slug: "ce-qui-change-1er-octobre-2026",
    title: "Ce qui change pour les salariés au 1er octobre 2026",
    description:
      "Prud'hommes plus simples à saisir, entretien professionnel tous les quatre ans, indemnités des arrêts longs : les nouveautés du droit du travail en octobre 2026.",
    date: "2026-10-07",
    category: "Droit du travail",
    intro:
      "Plusieurs règles du droit du travail évoluent en ce début d'automne. Voici l'essentiel, expliqué simplement, pour les salariés comme pour ceux qui cherchent un poste.",
    sections: [
      {
        heading: "Saisir les prud'hommes devient plus simple",
        paragraphs: [
          "Depuis le 1er octobre 2026, un salarié qui saisit le conseil de prud'hommes n'a plus à fournir toutes ses pièces dès le départ : un bulletin de paie lié au litige et un bordereau suffisent pour lancer la procédure.",
        ],
      },
      {
        heading: "L'entretien professionnel tous les quatre ans",
        paragraphs: [
          "L'intervalle de quatre ans entre deux entretiens professionnels s'impose désormais à toutes les entreprises. Les accords collectifs qui prévoyaient un rythme plus espacé devaient s'adapter avant le 1er octobre.",
          "Cet entretien sert à parler de votre évolution et de vos formations : c'est aussi le bon moment pour préparer une mobilité interne ou externe.",
        ],
      },
      {
        heading: "Arrêts maladie longs : une indemnisation plus courte",
        paragraphs: [
          "Pour les affections de longue durée qui ne sont pas prises en charge à 100 %, les indemnités journalières sont versées au maximum pendant un an au lieu de trois ans, pour les arrêts qui commencent après le 15 octobre 2026.",
        ],
      },
    ],
    tip:
      "Vous profitez de votre entretien professionnel pour envisager un nouveau poste ? MyMotiv rédige une lettre qui met en avant ce que vous avez construit dans votre poste actuel, adaptée à l'offre visée.",
    sources: [
      {
        label: "HelloWork — Ce qui change au 1er octobre 2026",
        url: "https://www.hellowork.com/fr-fr/medias/droit-du-travai-actualite-changement-1er-octobre.html",
        date: "2026-09-24",
      },
      {
        label: "TPE Actu — Ce qui change au 1er octobre 2026 pour les entreprises et les salariés",
        url: "https://tpeactu.fr/2026/09/24/ce-qui-change-1er-octobre-2026-entreprises-salaries/",
        date: "2026-09-24",
      },
    ],
  },
  {
    slug: "aides-apprentissage-2026",
    title: "Aides à l'apprentissage 2026 : ce qui a changé depuis le 8 mars",
    description:
      "Montants de l'aide à l'embauche d'un apprenti en 2026 selon la taille de l'entreprise et le niveau de diplôme, et ce que cela change pour votre recherche d'alternance.",
    date: "2026-10-07",
    category: "Alternance",
    intro:
      "L'aide versée aux employeurs qui recrutent un apprenti a été revue pour les contrats signés depuis le 8 mars 2026. Bon à savoir quand on cherche une alternance : selon votre niveau de diplôme et la taille de l'entreprise, votre embauche ne coûte pas la même chose à l'employeur.",
    sections: [
      {
        heading: "Les montants",
        paragraphs: [
          "Selon l'OPCO EP, l'aide va de 750 € à 5 000 €, selon la taille de l'entreprise et le niveau de qualification préparé. Elle est versée uniquement la première année du contrat, et proratisée pour les contrats de moins d'un an.",
        ],
        bullets: [
          "Entreprises de moins de 250 salariés : les montants les plus élevés vont aux diplômes de niveau bac et infra-bac ; 2 000 € pour une licence ou un master.",
          "Entreprises de 250 salariés et plus : 2 000 € (bac et infra-bac), 1 500 € (bac + 2), 750 € (licence, master).",
          "Apprenti en situation de handicap : 6 000 €, quelle que soit la taille de l'entreprise.",
        ],
      },
      {
        heading: "Pour quels contrats",
        paragraphs: [
          "Le barème concerne les contrats d'apprentissage conclus à partir du 8 mars 2026 dont l'exécution débute avant le 1er janvier 2027.",
        ],
      },
      {
        heading: "Ce que ça change pour vous",
        paragraphs: [
          "Les petites et moyennes entreprises restent les plus aidées : ne les oubliez pas dans vos candidatures, elles recrutent souvent des alternants sans publier beaucoup d'offres. Une candidature spontanée bien ciblée peut y faire la différence.",
        ],
      },
    ],
    tip:
      "Pour une alternance, le recruteur cherche quelqu'un qui a compris le rythme école-entreprise et la mission. MyMotiv rédige une lettre d'alternance qui relie votre formation aux tâches du poste, à partir de votre CV et de l'offre.",
    sources: [
      {
        label: "OPCO EP — Aides à l'apprentissage 2026 : ce qui change depuis le 8 mars",
        url: "https://www.opcoep.fr/actualites/aides-a-l-apprentissage-2026-ce-qui-change-depuis-le-8-mars",
        date: "2026-03-11",
      },
    ],
  },
  {
    slug: "gratification-stage-2026",
    title: "Gratification de stage en 2026 : montant minimum et règles",
    description:
      "À partir de quand un stage doit être payé, le taux horaire minimum en 2026 et comment se calcule la durée : les règles à connaître avant de postuler.",
    date: "2026-10-07",
    category: "Stages",
    intro:
      "Vous cherchez un stage ? Avant de signer votre convention, vérifiez si l'entreprise doit vous verser une gratification et combien, au minimum.",
    sections: [
      {
        heading: "Quand la gratification est obligatoire",
        paragraphs: [
          "La gratification est obligatoire lorsque le stage dure plus de deux mois consécutifs, ou à partir de la 309e heure de stage, même si ces heures ne sont pas consécutives.",
        ],
      },
      {
        heading: "Le montant minimum",
        paragraphs: [
          "Le taux horaire minimum est de 4,50 € par heure de stage. L'entreprise peut verser davantage, notamment si une convention collective le prévoit.",
          "Le calcul se fait sur les heures de présence effective du stagiaire pendant le mois.",
        ],
      },
    ],
    tip:
      "Pour un stage, montrez que vous avez compris la mission et ce que vous allez apprendre. MyMotiv écrit une lettre de stage concrète à partir de votre CV et de l'offre, et vous la relisez avant d'envoyer.",
    sources: [
      {
        label: "Service-Public.fr — Gratification de stage (fiche F32131, vérifiée le 1er janvier 2026)",
        url: "https://www.service-public.gouv.fr/particuliers/vosdroits/F32131",
        date: "2026-01-01",
      },
    ],
  },
  {
    slug: "interim-juillet-2026",
    title: "Intérim : l'emploi intérimaire recule de 3,7 % sur un an en juillet 2026",
    description:
      "Le baromètre Prism'emploi de juillet 2026 : secteurs qui reculent, cadres en hausse, régions contrastées. Où chercher une mission d'intérim ?",
    date: "2026-10-07",
    category: "Intérim",
    intro:
      "Selon le baromètre de Prism'emploi publié le 16 septembre 2026, l'emploi intérimaire s'établit à 736 760 équivalents temps plein en juillet 2026, en baisse de 3,7 % sur un an.",
    sections: [
      {
        heading: "Par secteur",
        bullets: [
          "BTP : −12,6 % sur un an.",
          "Transports et logistique : −5,1 %.",
          "Services : −2,1 %.",
          "Commerce : −1,6 %.",
          "Industrie : −0,3 %, quasiment stable.",
        ],
      },
      {
        heading: "Par qualification",
        bullets: [
          "Cadres et professions intermédiaires : +2,6 %, seule catégorie en hausse.",
          "Ouvriers qualifiés : −3,5 %.",
          "Ouvriers non qualifiés : −4,9 %.",
          "Employés : −6,0 %.",
        ],
      },
      {
        heading: "Par région",
        paragraphs: [
          "Les écarts sont forts : la Normandie (+1,7 %) et l'Auvergne-Rhône-Alpes (+1,1 %) progressent, quand la Bretagne (−12,3 %) et la Nouvelle-Aquitaine (−7,7 %) reculent nettement.",
          "Le CDI intérimaire représente 39 500 équivalents temps plein, soit 5,4 % des effectifs.",
        ],
      },
    ],
    tip:
      "Quand les missions se font plus rares, une candidature soignée auprès de l'agence fait la différence. MyMotiv rédige en une minute un message adapté à chaque offre, pour postuler à plus de missions sans bâcler.",
    sources: [
      {
        label: "Prism'emploi — Baromètre de l'emploi intérimaire, juillet 2026",
        url: "https://www.prismemploi.eu/barometres-nationaux/barometre-prismemploi-lemploi-interimaire-en-juillet-2026",
        date: "2026-09-16",
      },
    ],
  },
];

export function getNews(slug: string) {
  return NEWS.find((article) => article.slug === slug);
}

export function formatNewsDate(date: string) {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}
