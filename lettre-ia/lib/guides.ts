// Guides de conseils : pages de contenu destinées à être trouvées sur Google.
export type GuideSection = { heading: string; paragraphs?: string[]; bullets?: string[] };

export type Guide = {
  slug: string;
  title: string;
  description: string;
  intro: string;
  sections: GuideSection[];
  example?: { heading: string; text: string };
};

export const GUIDES: Guide[] = [
  {
    slug: "lettre-de-motivation-stage",
    title: "Lettre de motivation pour un stage : méthode et exemple",
    description:
      "Comment rédiger une lettre de motivation de stage convaincante quand on a peu d'expérience : structure, erreurs à éviter et exemple commenté.",
    intro:
      "Pour un stage, le recruteur ne s'attend pas à un parcours impressionnant. Il cherche un étudiant qui a compris la mission, qui sait ce qu'il peut apporter et qui apprendra vite. Votre lettre doit le montrer en quelques paragraphes concrets.",
    sections: [
      {
        heading: "Ce que le recruteur cherche vraiment",
        paragraphs: [
          "Un tuteur de stage va consacrer du temps à vous former. Il veut être rassuré sur trois points : vous savez pourquoi vous postulez chez eux, vous avez déjà quelques bases utiles, et vous serez autonome rapidement.",
          "Votre formation ne suffit pas à le convaincre : tout le monde a suivi des cours. Ce qui vous distingue, ce sont vos projets, vos jobs, vos engagements associatifs et la façon dont vous les reliez à la mission.",
        ],
      },
      {
        heading: "La structure qui fonctionne",
        bullets: [
          "Accroche : ce qui vous attire dans cette entreprise et cette mission précise (un produit, un projet, un secteur), pas une formule générale.",
          "Vos atouts : deux preuves concrètes tirées de vos études ou expériences (un projet de groupe, un job d'été, un mémoire) reliées aux tâches du stage.",
          "Ce que vous voulez apprendre : montrez que le stage s'inscrit dans votre projet professionnel.",
          "Informations pratiques : dates, durée, convention de stage.",
          "Conclusion : une phrase simple pour proposer un échange.",
        ],
      },
      {
        heading: "Les erreurs qui font décrocher",
        bullets: [
          "Recopier votre CV en phrases : la lettre doit expliquer, pas énumérer.",
          "Parler uniquement de ce que le stage vous apporte, sans dire ce que vous apportez.",
          "Utiliser des adjectifs sans preuve : « motivé, rigoureux, dynamique ».",
          "Oublier les dates et la durée du stage : c'est souvent le premier filtre.",
          "Envoyer la même lettre à dix entreprises : cela se voit dès la première ligne.",
        ],
      },
    ],
    example: {
      heading: "Exemple d'accroche",
      text: "Votre application de réservation de cours de sport, que j'utilise depuis un an, a changé ma façon de m'entraîner. Étudiante en deuxième année de BUT Informatique, je souhaite rejoindre votre équipe mobile pour un stage de dix semaines à partir d'avril, et contribuer aux nouvelles fonctionnalités de planification annoncées dans votre offre.",
    },
  },
  {
    slug: "lettre-de-motivation-reconversion",
    title: "Lettre de motivation pour une reconversion professionnelle",
    description:
      "Changer de métier : comment présenter votre reconversion dans une lettre de motivation, valoriser vos compétences transférables et rassurer le recruteur.",
    intro:
      "En reconversion, la question que se pose le recruteur est simple : « pourquoi prendre quelqu'un qui n'a pas fait ce métier ? ». Votre lettre doit y répondre avant même qu'il ne la formule, en montrant que votre parcours est un atout et non un détour.",
    sections: [
      {
        heading: "Assumer le changement, sans vous justifier",
        paragraphs: [
          "Inutile de raconter longuement pourquoi vous quittez votre ancien métier. Une phrase suffit pour expliquer ce qui vous attire dans le nouveau, de préférence avec un déclencheur concret : une mission qui vous a passionné, une formation suivie, un projet mené à côté.",
          "Évitez le vocabulaire de l'excuse (« malgré mon manque d'expérience »). Présentez votre parcours comme une combinaison originale de compétences.",
        ],
      },
      {
        heading: "Mettre en avant les compétences transférables",
        paragraphs: [
          "Relisez l'offre et identifiez les compétences qui ne dépendent pas du métier : gestion de projet, relation client, organisation, travail en équipe, rédaction, analyse. Pour chacune, trouvez un exemple précis dans votre ancien poste.",
        ],
        bullets: [
          "Un commercial qui devient chargé de recrutement : écoute, négociation, gestion d'un portefeuille.",
          "Un enseignant qui devient formateur en entreprise ou chef de projet : pédagogie, planification, prise de parole.",
          "Un comptable qui devient développeur : rigueur, logique, connaissance des processus métier.",
        ],
      },
      {
        heading: "Prouver que vous avez déjà commencé",
        paragraphs: [
          "Le meilleur moyen de rassurer est de montrer que la reconversion est en marche : une formation certifiante, un stage, un projet personnel, du bénévolat dans le domaine. Citez-le avec des éléments vérifiables (intitulé, durée, réalisation).",
        ],
      },
    ],
    example: {
      heading: "Exemple de paragraphe",
      text: "Pendant huit ans, j'ai géré la relation avec une quarantaine de clients professionnels chez un distributeur de matériel médical. C'est en organisant le recrutement de deux commerciaux pour mon équipe que j'ai découvert le métier de chargé de recrutement. J'ai depuis suivi une formation certifiante de six mois et réalisé un stage de huit semaines en cabinet, où j'ai mené une quinzaine d'entretiens de présélection.",
    },
  },
  {
    slug: "lettre-de-motivation-alternance",
    title: "Lettre de motivation pour une alternance",
    description:
      "Réussir sa lettre de motivation d'alternance : parler à l'entreprise et à l'école, montrer son rythme de travail et son projet, avec un exemple.",
    intro:
      "Une alternance, c'est un engagement d'un ou deux ans pour l'entreprise. Le recruteur veut quelqu'un de fiable, capable de suivre le rythme école-entreprise, et dont le projet professionnel colle au poste.",
    sections: [
      {
        heading: "Les informations à ne pas oublier",
        bullets: [
          "Le diplôme préparé et l'école (ou le CFA), avec l'intitulé exact.",
          "Le rythme de l'alternance (par exemple trois semaines en entreprise, une semaine en formation).",
          "La date de début et la durée du contrat.",
          "Si vous avez déjà une école, dites-le : c'est un point rassurant.",
        ],
      },
      {
        heading: "Montrer votre fiabilité",
        paragraphs: [
          "L'entreprise investit dans votre formation. Prouvez que vous tenez vos engagements : un job étudiant conservé plusieurs années, un projet mené jusqu'au bout, des responsabilités associatives. Ces éléments comptent autant que vos notes.",
        ],
      },
      {
        heading: "Relier la mission à votre projet",
        paragraphs: [
          "Expliquez en quoi les missions décrites dans l'offre correspondent à ce que vous voulez apprendre, et ce que vous pourrez prendre en charge rapidement. Une alternance réussie, c'est un apprenti qui devient vite utile.",
        ],
      },
    ],
  },
  {
    slug: "lettre-de-motivation-sans-experience",
    title: "Lettre de motivation sans expérience : comment convaincre",
    description:
      "Premier emploi ou peu d'expérience : comment écrire une lettre de motivation crédible en valorisant vos projets, vos engagements et votre capacité à apprendre.",
    intro:
      "Ne pas avoir d'expérience professionnelle ne veut pas dire ne rien avoir à montrer. Projets, jobs d'appoint, engagements, formations : la clé est de choisir les bons exemples et de les relier précisément au poste.",
    sections: [
      {
        heading: "Trouver vos preuves",
        bullets: [
          "Projets d'études : un projet de groupe, un mémoire, un challenge, avec votre rôle exact et le résultat.",
          "Jobs étudiants : ils prouvent la ponctualité, le contact client, la résistance au stress.",
          "Engagements : association, sport en club, bénévolat, responsabilités d'organisation.",
          "Projets personnels : un site, une chaîne, une collection, une compétence apprise seul.",
        ],
      },
      {
        heading: "Remplacer les adjectifs par des faits",
        paragraphs: [
          "« Je suis organisé » ne convainc personne. « J'ai organisé le tournoi annuel de mon club, 120 participants et 8 bénévoles à coordonner » montre la même qualité, avec une preuve. Chaque qualité que vous citez doit être suivie d'un exemple.",
        ],
      },
      {
        heading: "Miser sur votre capacité à apprendre",
        paragraphs: [
          "Un recruteur qui embauche un profil junior achète surtout du potentiel. Montrez comment vous avez appris quelque chose de nouveau rapidement, et ce que vous avez déjà fait pour vous préparer au poste (formation en ligne, lecture, projet).",
        ],
      },
    ],
  },
  {
    slug: "candidature-spontanee",
    title: "Lettre de motivation pour une candidature spontanée",
    description:
      "Candidature spontanée : comment cibler l'entreprise, proposer une vraie valeur ajoutée et obtenir une réponse, avec la structure à suivre.",
    intro:
      "Sans offre d'emploi, votre lettre doit faire un travail supplémentaire : expliquer pourquoi cette entreprise, et quel besoin vous pourriez couvrir. Une candidature spontanée réussie ressemble davantage à une proposition qu'à une demande.",
    sections: [
      {
        heading: "Se renseigner avant d'écrire",
        paragraphs: [
          "Consultez le site de l'entreprise, ses actualités, ses offres récentes et les profils de ses équipes. Vous cherchez un point d'accroche concret : un développement, un nouveau produit, une ouverture de site, un recrutement en cours dans un service voisin.",
        ],
      },
      {
        heading: "Proposer, pas demander",
        paragraphs: [
          "Plutôt que « je souhaiterais intégrer votre entreprise », décrivez le type de poste visé et ce que vous pourriez y faire. Appuyez-vous sur une ou deux réalisations passées qui montrent que vous savez déjà le faire.",
        ],
      },
      {
        heading: "Adresser la lettre à la bonne personne",
        paragraphs: [
          "Une candidature envoyée au responsable du service concerné a plus de chances d'être lue qu'un courrier générique. Si vous trouvez son nom, utilisez-le dans la formule d'appel.",
        ],
        bullets: [
          "Précisez le poste ou le domaine visé dès la première phrase.",
          "Gardez la lettre courte : 200 à 250 mots suffisent.",
          "Terminez par une proposition concrète : un appel de quinze minutes, une rencontre.",
        ],
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((guide) => guide.slug === slug);
}
