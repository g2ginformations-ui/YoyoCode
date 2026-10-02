"use client";

import Link from "next/link";
import { PLANS, PLAN_ORDER } from "@/lib/pricing";
import { useState } from "react";

// Cartes des offres. La case d'accès immédiat (renonciation au droit de rétractation) est obligatoire
// avant tout paiement ; le serveur la vérifie aussi.
export default function OfferForms({ disabled }: { disabled: boolean }) {
  const [consent, setConsent] = useState(false);

  return (
    <>
      <label className="consent">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} disabled={disabled} />
        <span>
          J'accepte les <Link href="/cgv">conditions générales de vente</Link> et je demande l'accès immédiat au
          service : je reconnais perdre mon droit de rétractation dès la mise à disposition des lettres.
        </span>
      </label>

      <div className="offers">
        {PLAN_ORDER.map((id) => {
          const plan = PLANS[id];
          return (
            <section key={id} className={`card offer-card${plan.badge ? " featured" : ""}`}>
              {plan.badge && <span className="offer-badge">{plan.badge}</span>}
              <h2>{plan.name}</h2>
              <p className="offer-price">
                {plan.price} <span>{plan.period}</span>
              </p>
              <p className="muted small">{plan.summary}</p>
              <ul className="features">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <form action="/api/checkout" method="post">
                <input type="hidden" name="plan" value={id} />
                <input type="hidden" name="consent" value={consent ? "1" : ""} />
                <button
                  type="submit"
                  className={plan.badge ? "primary pay" : "pay"}
                  disabled={disabled || !consent}
                  title={consent ? undefined : "Cochez d'abord la case ci-dessus"}
                >
                  {plan.mode === "payment" ? "Acheter" : "S'abonner"} — {plan.price}
                </button>
              </form>
            </section>
          );
        })}
      </div>
    </>
  );
}
