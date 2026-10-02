// Lettres réellement produites par l'application pour un même CV et une même offre, aux trois longueurs.
export type Example = { id: "court" | "standard" | "long"; label: string; text: string };

const SUBJECT = "Objet : Candidature au poste de Consultant en recrutement en alternance";

export const EXAMPLE_CONTEXT = "Candidature au poste de Consultant en recrutement en alternance";

export const EXAMPLES: Example[] = [
  {
    id: "court",
    label: "Courte",
    text: `${SUBJECT}

Madame, Monsieur,

Chez Distrilyon Pro, je gère depuis septembre 2025 un portefeuille d'environ 120 clients TPE et PME sur Lyon Est. J'aimerais désormais aider ce type d'entreprises à recruter, et plus seulement à s'équiper. Chez SKILLS, chaque consultant suit ses clients et ses candidats de A à Z. C'est ce suivi complet qui m'attire.

Le volet commercial du poste, je le pratique déjà. Je décroche 15 à 20 rendez-vous qualifiés par semaine, sur le terrain et au téléphone. Sur l'année, j'ai ouvert 38 nouveaux comptes et atteint 112 % de mon objectif de chiffre d'affaires. Je tenais aussi le CRM à jour et assurais les relances pendant mon alternance.

En revanche, je n'ai jamais recruté, et c'est pour l'apprendre que je postule en alternance. Ce format m'a réussi chez Rhône Bureautique Services. J'y accompagnais les commerciaux seniors en clientèle et j'ai signé 22 contrats en autonomie. L'appui direct d'un manager, tel que vous le décrivez, me convient. Le CDI à la clé compte aussi, car je veux m'installer dans la durée.

Véhiculé et mobile en Auvergne-Rhône-Alpes, je serais heureux d'en parler avec vous.

Je vous prie d'agréer, Madame, Monsieur, mes salutations distinguées.

Lucas Morel`,
  },
  {
    id: "standard",
    label: "Standard",
    text: `${SUBJECT}

Madame, Monsieur,

Pendant deux ans, j'ai fait du développement commercial B2B auprès d'entreprises de la région lyonnaise. Chez SKILLS, chaque consultant gère son portefeuille clients de A à Z. C'est la partie du métier que je pratique déjà. Je prépare [formation et école à préciser], d'où cette candidature en alternance.

Chez Distrilyon Pro, j'ai suivi un portefeuille d'environ 120 TPE/PME sur Lyon Est. Je décrochais 15 à 20 rendez-vous qualifiés par semaine, sur le terrain et au téléphone. Je négociais, rédigeais les devis et les suivais jusqu'à la signature. Sur l'année, j'ai ouvert 38 nouveaux comptes et atteint 112 % de mon objectif de chiffre d'affaires.

Avant cela, en alternance chez Rhône Bureautique Services, je prospectais les zones d'activités en porte-à-porte, par phoning et par e-mailing. J'y ai signé 22 contrats en autonomie et je tenais le CRM à jour. J'utilise aussi Salesforce et HubSpot.

Le sourcing et l'accompagnement d'un candidat jusqu'à son intégration, je viens les apprendre. Évaluer les besoins d'un client professionnel, en revanche, je le fais à chaque rendez-vous. Votre montée en compétences progressive, avec un manager présent, correspond à ce que je cherche pour m'inscrire dans la durée chez SKILLS.

Je vous remercie de votre attention et reste disponible pour un entretien.

Lucas Morel`,
  },
  {
    id: "long",
    label: "Longue",
    text: `${SUBJECT}

Madame, Monsieur,

Chez SKILLS, chaque consultant gère son portefeuille clients et candidats de A à Z. La partie clients, je la pratique depuis deux ans auprès des TPE et PME lyonnaises. Les dirigeants à qui j'ai vendu des fournitures ou des solutions d'impression sont aussi ceux qui cherchent à recruter. C'est ce besoin-là que je veux maintenant traiter.

Mon alternance chez Rhône Bureautique Services, à Villeurbanne, est l'expérience qui m'a le plus formé. Je préparais en parallèle mon Bachelor Responsable du Développement Commercial. Le cadre ressemblait à celui que vous décrivez : apprendre progressivement, aux côtés de collègues plus expérimentés. Je prospectais par phoning, e-mailing et porte-à-porte dans les zones d'activités. Je prenais les rendez-vous, puis j'accompagnais les commerciaux seniors chez les clients. Au fil des mois, j'ai présenté les offres et mené les démonstrations produits moi-même. À la fin de l'année, j'avais signé 22 contrats en autonomie. Je saisissais chaque relance dans le CRM, une habitude que je garderai avec votre outil CRM/ATS.

Distrilyon Pro m'a ensuite recruté en CDI sur le secteur Lyon Est. J'y ai géré un portefeuille d'environ 120 clients et ouvert 38 nouveaux comptes en un an. Je décrochais 15 à 20 rendez-vous qualifiés par semaine, un rythme proche des KPIs hebdomadaires que vous fixez. J'ai terminé l'année à 112 % de mon objectif de chiffre d'affaires. Je menais la négociation, je rédigeais les devis et je suivais chaque dossier jusqu'à la signature. J'en retiens une chose : un client reste quand on a compris son besoin réel avant de lui proposer quoi que ce soit. C'est la posture de consultant que vous attendez, et je veux l'appliquer au recrutement.

Je n'ai encore jamais sourcé ni évalué de candidats. C'est pour cela que je choisis l'alternance : reprendre une formation et apprendre votre méthode avec un manager présent au quotidien. La perspective d'un CDI à l'issue compte aussi, car je veux m'installer dans ce métier sur la durée. Huit ans de football en club m'ont appris à jouer pour une équipe, ce qui rejoint la valeur de collectif que vous mettez en avant. J'utilise déjà LinkedIn Sales Navigator en prospection et j'ai hâte de m'en servir pour la chasse. Je suis véhiculé et mobile sur Lyon et en Auvergne-Rhône-Alpes.

Je serais heureux d'en parler avec vous lors d'un entretien.

Lucas Morel`,
  },
];
