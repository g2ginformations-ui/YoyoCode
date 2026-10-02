// Offres et prix, partagés entre le serveur et les pages : modifiez-les ici uniquement.
// Tous les prix sont TTC : la TVA est incluse (tax_behavior « inclusive » côté Stripe).
export type PlanId = "letter" | "week" | "month" | "lifetime";

export type Plan = {
  id: PlanId;
  name: string;
  cents: number;
  price: string;
  period: string;
  mode: "payment" | "subscription";
  interval?: "week" | "month";
  summary: string;
  features: string[];
  badge?: string;
  productName: string;
};

// Limite de sécurité des offres illimitées, pour protéger le budget de génération.
export const WEEKLY_LIMIT = 30;
// Ajustements inclus avec une lettre achetée à l'unité.
export const ADJUSTMENTS_PER_LETTER = 3;

export const PLANS: Record<PlanId, Plan> = {
  letter: {
    id: "letter",
    name: "1 lettre",
    cents: 99,
    price: "0,99 €",
    period: "paiement unique",
    mode: "payment",
    summary: "Pour une candidature précise.",
    features: ["1 lettre personnalisée", `${ADJUSTMENTS_PER_LETTER} ajustements inclus`, "Sans abonnement"],
    productName: "Lettre IA — 1 lettre de motivation",
  },
  week: {
    id: "week",
    name: "Semaine",
    cents: 199,
    price: "1,99 €",
    period: "par semaine",
    mode: "subscription",
    interval: "week",
    summary: "Pour une salve de candidatures.",
    features: ["Lettres illimitées*", "Ajustements illimités", "Sans engagement"],
    productName: "Lettre IA — accès illimité à la semaine",
  },
  month: {
    id: "month",
    name: "Mois",
    cents: 799,
    price: "7,99 €",
    period: "par mois",
    mode: "subscription",
    interval: "month",
    summary: "Pour une recherche d'emploi complète.",
    features: ["Lettres illimitées*", "Ajustements illimités", "Sans engagement"],
    productName: "Lettre IA — abonnement mensuel",
  },
  lifetime: {
    id: "lifetime",
    name: "À vie",
    cents: 1299,
    price: "12,99 €",
    period: "paiement unique",
    mode: "payment",
    summary: "Pour toutes vos candidatures, sans limite de durée.",
    features: ["Lettres illimitées*", "Ajustements illimités", "Payé une seule fois"],
    badge: "Le plus avantageux",
    productName: "Lettre IA — accès à vie",
  },
};

export const PLAN_ORDER: PlanId[] = ["letter", "week", "month", "lifetime"];
export const CHEAPEST_LABEL = `dès ${PLANS.letter.price}`;

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLANS;
}
