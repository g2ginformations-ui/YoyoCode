// Offres et prix, partagés entre le serveur et les pages : modifiez-les ici uniquement.
// Tous les prix sont TTC : la TVA est incluse (tax_behavior « inclusive » côté Stripe).
export type PlanId = "letter" | "week" | "month" | "year" | "lifetime";

export type Plan = {
  id: PlanId;
  name: string;
  cents: number;
  price: string;
  period: string;
  mode: "payment" | "subscription";
  interval?: "week" | "month" | "year";
  summary: string;
  features: string[];
  badge?: string;
  productName: string;
};

// Limite de sécurité des offres illimitées, pour protéger le budget de génération.
export const WEEKLY_LIMIT = 30;
// Ajustements inclus avec une lettre achetée à l'unité.
export const ADJUSTMENTS_PER_LETTER = 3;
// Avantage des offres illimitées : tous les styles de PDF (voir lib/pdf.ts), pas seulement « Classique ».
const PDF_STYLES_FEATURE = "4 styles de PDF";
// Avantage des offres illimitées : le CV adapté à l'offre (page /cv).
const CV_FEATURE = "CV adapté à l'offre, sur 1 page";

export const PLANS: Record<PlanId, Plan> = {
  letter: {
    id: "letter",
    name: "1 lettre",
    cents: 199,
    price: "1,99 €",
    period: "paiement unique",
    mode: "payment",
    summary: "Pour une candidature précise.",
    features: ["1 lettre personnalisée", `${ADJUSTMENTS_PER_LETTER} ajustements inclus`, "Le CV adapté à cette offre", "Sans abonnement"],
    productName: "MyMotiv — 1 lettre + CV adapté",
  },
  week: {
    id: "week",
    name: "Semaine",
    cents: 399,
    price: "3,99 €",
    period: "par semaine",
    mode: "subscription",
    interval: "week",
    summary: "Pour une salve de candidatures.",
    features: ["Lettres illimitées*", "Ajustements illimités", CV_FEATURE, PDF_STYLES_FEATURE, "Sans engagement, résiliable en 2 clics"],
    badge: "Recommandé",
    productName: "MyMotiv — accès illimité à la semaine",
  },
  month: {
    id: "month",
    name: "Mois",
    cents: 699,
    price: "6,99 €",
    period: "par mois",
    mode: "subscription",
    interval: "month",
    summary: "Pour toute une recherche d'emploi.",
    features: ["Lettres illimitées*", "Ajustements illimités", CV_FEATURE, PDF_STYLES_FEATURE, "Sans engagement, résiliable en 2 clics"],
    productName: "MyMotiv — abonnement mensuel",
  },
  year: {
    id: "year",
    name: "Annuel",
    cents: 2499,
    price: "24,99 €",
    period: "par an",
    mode: "subscription",
    interval: "year",
    summary: "Pour toutes vos candidatures de l'année.",
    features: ["Lettres illimitées*", "Ajustements illimités", CV_FEATURE, PDF_STYLES_FEATURE, "Sans engagement, résiliable en 2 clics"],
    productName: "MyMotiv — abonnement annuel",
  },
  // Ancienne offre « À vie » (plus vendue depuis octobre 2026) : gardée pour les clients qui l'ont achetée.
  lifetime: {
    id: "lifetime",
    name: "À vie",
    cents: 1299,
    price: "12,99 €",
    period: "paiement unique",
    mode: "payment",
    summary: "Ancienne offre, plus proposée.",
    features: ["Lettres illimitées*", "Ajustements illimités", CV_FEATURE, PDF_STYLES_FEATURE],
    productName: "MyMotiv — accès à vie",
  },
};

// Offres en vente, dans l'ordre d'affichage (« À vie » n'y est plus).
export const PLAN_ORDER: PlanId[] = ["letter", "week", "month", "year"];
export const CHEAPEST_LABEL = `dès ${PLANS.letter.price}`;
export const CHEAPEST_UNLIMITED_LABEL = `dès ${PLANS.week.price} la semaine`;

export function isPlanId(value: unknown): value is PlanId {
  return typeof value === "string" && value in PLANS;
}
