import type { Metadata } from "next";
import Link from "next/link";
import { currentAccess } from "@/lib/access";
import { PLANS, PLAN_ORDER, WEEKLY_LIMIT } from "@/lib/pricing";

export const metadata: Metadata = { title: "Offres — Lettre IA" };
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  annule: "Paiement annulé : aucun montant n'a été débité.",
  erreur: "Le paiement n'a pas pu être confirmé. Réessayez ou contactez-nous.",
};

export default async function Offres({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const notice = Object.keys(MESSAGES).find((key) => params[key]);
  const access = await currentAccess();

  return (
    <main className="offers-page">
      <Link href="/" className="back">← Retour</Link>
      <header className="offers-head">
        <p className="eyebrow">Nos offres</p>
        <h1 className="title">Choisissez la formule qui vous convient</h1>
        <p className="muted">Prix TTC · Apple Pay, Google Pay ou carte bancaire · paiement sécurisé par Stripe</p>
      </header>

      {notice && <p className="error">{MESSAGES[notice]}</p>}
      {params.cause && (
        <p className="error small">Configuration incomplète : la variable {params.cause} est absente du serveur.</p>
      )}
      {params.detail && <p className="error small">Réponse de Stripe : « {params.detail} »</p>}
      {access.active && (
        <p className="success">
          Vous avez déjà un accès illimité. <Link href="/">Rédiger une lettre</Link>
        </p>
      )}

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
                <button type="submit" className={plan.badge ? "primary pay" : "pay"} disabled={access.active}>
                  {plan.mode === "payment" ? "Acheter" : "S'abonner"} — {plan.price}
                </button>
              </form>
            </section>
          );
        })}
      </div>

      <p className="muted small center">
        * Illimité dans la limite de {WEEKLY_LIMIT} lettres par semaine, une protection contre les abus largement
        au-dessus d'un usage normal. Abonnements sans engagement, résiliables en un clic depuis « Mon compte ».
      </p>
      {!access.loggedIn && (
        <p className="muted small center">
          Déjà client ? <Link href="/connexion">Se connecter</Link>
        </p>
      )}
    </main>
  );
}
