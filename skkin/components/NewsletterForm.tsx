"use client";

import { useActionState } from "react";
import { subscribe } from "@/app/(boutique)/newsletter-actions";

export function NewsletterForm() {
  const [state, action, pending] = useActionState(subscribe, null);
  if (state?.ok) {
    return (
      <p className="newsletter-success">
        Merci ! Votre code de bienvenue : <strong className="promo-code">{state.code}</strong>
        <br />
        <span className="small">À saisir dans le panier pour -{state.percent} % sur votre première commande.</span>
      </p>
    );
  }
  return (
    <form action={action} className="newsletter-form">
      <label className="sr-only" htmlFor="newsletter-email">E-mail</label>
      <input id="newsletter-email" name="email" type="email" required placeholder="Votre adresse e-mail" autoComplete="email" />
      <button className="button primary" disabled={pending}>{pending ? "…" : "Je m'inscris"}</button>
      {state && !state.ok ? <p className="error small">{state.error}</p> : null}
    </form>
  );
}
