"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PLANS, type PlanId, WEEKLY_LIMIT } from "@/lib/pricing";
import "./elite-sheet.css";

// Panneau « Débloquez votre candidature d'élite » : affiché après la lettre offerte, quand le candidat veut
// une 2e lettre, le CV adapté ou un style de PDF premium (et à la fin du parcours /candidature sans lettre offerte).
export type EliteReason = "lettre" | "cv" | "pdf" | "ajuster";

const KICKERS: Record<EliteReason, string> = {
  lettre: "Pour votre prochaine candidature",
  cv: "Pour adapter votre CV à l'offre",
  pdf: "Pour les 4 styles de PDF",
  ajuster: "Pour ajuster votre lettre",
};

type Props = {
  reason: EliteReason;
  onClose: () => void;
  // Origine, pour revenir au bon endroit si le paiement est annulé.
  from: "candidature" | "accueil";
  // E-mail déjà saisi : prérempli sur la page de paiement.
  email?: string;
  cancelled?: boolean;
  // Appelé juste avant de partir vers le paiement (pour garder le brouillon).
  onBeforePay?: () => void;
};

function PlanRow({ id, plan, setPlan, title, detail, badge }: { id: PlanId; plan: PlanId; setPlan: (id: PlanId) => void; title: string; detail: string; badge?: string }) {
  const on = plan === id;
  return (
    <button type="button" role="radio" aria-checked={on} className={`es-plan${on ? " on" : ""}`} onClick={() => setPlan(id)}>
      <span className="es-radio" aria-hidden="true">{on ? "✓" : ""}</span>
      <span className="es-plan-main">
        <b>{title}</b>
        <span>
          <strong>{PLANS[id].price}</strong> {PLANS[id].period}
        </span>
      </span>
      <span className="es-plan-side">
        {badge && <em>{badge}</em>}
        <span>{detail}</span>
      </span>
    </button>
  );
}

const euros = (cents: number) => (cents / 100).toFixed(2).replace(".", ",") + " €";

export default function EliteSheet({ reason, onClose, from, email = "", cancelled = false, onBeforePay }: Props) {
  const [plan, setPlan] = useState<PlanId>("month");
  const [consent, setConsent] = useState(false);
  // La lettre à l'unité ne donne ni le CV adapté ni les styles de PDF : elle n'est proposée que pour une lettre.
  const singleLetter = reason === "lettre" || reason === "ajuster";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  return (
    <div className="es-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="es-sheet" role="dialog" aria-modal="true" aria-labelledby="es-title">
        <button type="button" className="es-close" onClick={onClose} aria-label="Fermer">×</button>
        <p className="es-kicker">{KICKERS[reason]}</p>
        {cancelled && <p className="es-error">Paiement annulé : rien n'a été débité. Votre dossier est toujours là.</p>}
        <h2 className="es-sheet-title" id="es-title">Débloquez votre candidature d'élite.</h2>
        <ol className="es-timeline">
          <li><b>Aujourd'hui</b><span>{PLANS.month.price}</span><em>Lettres illimitées*, CV adapté à chaque offre, 4 styles de PDF.</em></li>
          <li><b>Chaque candidature</b><span>27 à 35 s</span><em>Une lettre écrite pour l'offre, avec le logo de l'entreprise.</em></li>
          <li><b>À tout moment</b><span>0 €</span><em>Sans engagement, résiliable en 2 clics.</em></li>
        </ol>

        <div className="es-plans" role="radiogroup" aria-label="Offres">
          <PlanRow id="month" plan={plan} setPlan={setPlan} title="Rejoindre Les Motivés" badge="Recommandé" detail={`soit ${euros(PLANS.month.cents / 30)} par jour`} />
          <PlanRow id="lifetime" plan={plan} setPlan={setPlan} title="À vie" detail="payé une seule fois" />
          {singleLetter ? (
            <PlanRow id="letter" plan={plan} setPlan={setPlan} title="Cette candidature seulement" detail="1 lettre · 3 ajustements" />
          ) : (
            <PlanRow id="week" plan={plan} setPlan={setPlan} title="Une semaine" detail="pour une salve de candidatures" />
          )}
        </div>
        <p className="es-math">
          Le calcul : 1 lettre à l'unité = {PLANS.letter.price}. Dès 9 candidatures dans le mois (9 × {PLANS.letter.price} ={" "}
          {euros(PLANS.letter.cents * 9)}), Les Motivés ({PLANS.month.price}, illimité) reviennent moins cher.
        </p>

        <form action="/api/checkout" method="post" onSubmit={() => onBeforePay?.()}>
          <input type="hidden" name="plan" value={plan} />
          <input type="hidden" name="consent" value={consent ? "1" : ""} />
          <input type="hidden" name="from" value={from} />
          {email && <input type="hidden" name="email" value={email} />}
          <label className="es-consent">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              J'accepte les <Link href="/cgv">CGV</Link> et je demande l'accès immédiat au service : je reconnais perdre mon droit de rétractation dès la mise à disposition des lettres.
            </span>
          </label>
          <button type="submit" className="es-pay" disabled={!consent}>
            {plan === "month" ? "Rejoindre Les Motivés" : plan === "lifetime" ? "Débloquer à vie" : plan === "week" ? "Débloquer la semaine" : "Débloquer cette lettre"}
            <small>{PLANS[plan].price} {PLANS[plan].period}</small>
          </button>
        </form>
        <p className="es-legal">* Dans la limite de {WEEKLY_LIMIT} lettres par semaine. Paiement sécurisé par Stripe. <Link href="/abonnement">Toutes les offres</Link></p>
      </div>
    </div>
  );
}
