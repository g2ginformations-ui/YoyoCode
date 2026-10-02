// Identité de l'éditeur, affichée dans les mentions légales, les CGV et la politique de confidentialité.
// Une valeur vide s'affiche « [à compléter] » : toutes doivent être renseignées avant d'encaisser des paiements réels.
export const COMPANY = {
  name: "Lettre IA SAS",
  form: "Société par actions simplifiée (SAS)",
  capital: "", // ex. « 1 000 € »
  address: "12 rue Victor Montieu, 75001 Paris, France",
  siret: "", // 14 chiffres, visible sur l'avis de situation INSEE ou annuaire-entreprises.data.gouv.fr
  rcs: "", // ex. « RCS Paris 123 456 789 »
  vat: "", // numéro de TVA intracommunautaire, ex. « FR12 123456789 »
  director: "", // directeur de la publication : en général le président de la SAS
  email: "contact@lettre-ia.fr",
  // Médiateur de la consommation (obligatoire pour vendre à des particuliers) : nom et site web.
  mediator: { name: "", url: "" },
};

export const HOST = "Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — vercel.com";

export const LEGAL_UPDATED = "2 octobre 2026";

export function field(value: string): string {
  return value.trim() || "[à compléter]";
}
