"use client";

import Link from "next/link";
import NavIcon, { type NavIconName } from "@/components/NavIcon";
import PaymentTrust from "@/components/PaymentTrust";
import { PLANS, PLAN_ORDER, type PlanId } from "@/lib/pricing";
import { useRef, useState } from "react";

// Ce que chaque carte annonce en premier (sous le nom) : le volume, comme « 300 clips/mois » chez les outils vidéo.
const VOLUME: Record<PlanId, string> = {
  letter: "1 lettre + son CV",
  week: "Lettres illimitées*",
  month: "Lettres illimitées*",
  year: "Lettres illimitées*",
  lifetime: "",
};
const PER: Record<PlanId, string> = { letter: "", week: "/semaine", month: "/mois", year: "/an", lifetime: "" };
const NOTE: Record<PlanId, string> = {
  letter: "Paiement unique",
  week: "Sans engagement",
  month: "Sans engagement",
  year: `Soit ${(PLANS.year.cents / 1200).toFixed(2).replace(".", ",")} € par mois`,
  lifetime: "Payé une seule fois",
};

// Inclus dans toutes les offres, avec les icônes du site.
const INCLUDED: [NavIconName, string][] = [
  ["lettres", "Une lettre écrite pour CETTE offre"],
  ["enveloppe", "Le logo de l'entreprise sur la lettre"],
  ["cv", "CV en PDF, Word ou photo"],
];

// Cartes des offres. La case d'accès immédiat (renonciation au droit de rétractation) est obligatoire
// avant tout paiement ; le serveur la vérifie aussi.
export default function OfferForms({ disabled }: { disabled: boolean }) {
  const [consent, setConsent] = useState(false);
  const [remind, setRemind] = useState(false);
  const consentRef = useRef<HTMLInputElement>(null);
  // Sans la case cochée, le bouton ne part pas au paiement : il amène à la case, mise en évidence.
  const askConsent = (e: React.FormEvent) => {
    if (consent) return;
    e.preventDefault();
    setRemind(true);
    consentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    consentRef.current?.focus();
  };

  return (
    <>
      <div className="offers">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          const volume = VOLUME[id] || plan.features[0];
          return (
            <section key={id} className={`offer-card${plan.badge ? " featured" : ""}`}>
              <h2>
                {plan.name}
                {plan.badge && <span className="offer-badge">{plan.badge}</span>}
              </h2>
              <p className="offer-for">{plan.summary}</p>
              <p className="offer-volume">{volume}</p>
              <p className="offer-price">
                {plan.price}
                {PER[id] && <span>{PER[id]}</span>}
              </p>
              <p className="offer-note">{NOTE[id]}</p>
              <form action="/api/checkout" method="post" onSubmit={askConsent}>
                <input type="hidden" name="plan" value={id} />
                <input type="hidden" name="consent" value={consent ? "1" : ""} />
                <button
                  type="submit"
                  className={plan.badge ? "primary pay" : "pay"}
                  disabled={disabled}
                >
                  {plan.mode === "payment" ? "Acheter" : "S'abonner"}
                </button>
              </form>
              <ul className="offer-features">
                {plan.features.filter((feature) => feature !== volume).map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <label className={`consent${remind && !consent ? " remind" : ""}`}>
        <input ref={consentRef} type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={disabled} />
        <span>
          J'accepte les <Link href="/cgv">conditions générales de vente</Link> et je demande l'accès immédiat au
          service : je reconnais perdre mon droit de rétractation dès la mise à disposition des lettres.
        </span>
      </label>
      {remind && !consent && <p className="consent-hint">Cochez cette case pour continuer vers le paiement sécurisé.</p>}

      <PaymentTrust />

      <div className="offers-included">
        <p>Toutes les offres incluent :</p>
        <ul>
          {INCLUDED.map(([icon, label]) => (
            <li key={label}>
              <NavIcon name={icon} size={16} />
              {label}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
