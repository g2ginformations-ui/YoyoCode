// Liens d'affiliation affichés sous la lettre générée et dans les pages de conseils.
// Un partenaire sans `url` n'est pas affiché : collez ici le lien fourni par le programme d'affiliation.
export type Partner = { title: string; description: string; url: string };

export const PARTNERS: Partner[] = [
  {
    title: "Modèles de CV professionnels",
    description: "Un CV soigné qui accompagne votre lettre.",
    url: "",
  },
  {
    title: "Formations en ligne certifiantes",
    description: "Renforcez votre profil avec une compétence demandée dans l'offre.",
    url: "",
  },
  {
    title: "Offres d'emploi",
    description: "Trouvez d'autres postes auxquels postuler avec votre lettre.",
    url: "",
  },
  {
    title: "Préparer l'entretien",
    description: "Guides et coaching pour réussir l'étape suivante.",
    url: "",
  },
];

export const ACTIVE_PARTNERS = PARTNERS.filter((partner) => partner.url);
