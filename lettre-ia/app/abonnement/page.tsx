import type { Metadata } from "next";
import Link from "next/link";
import { PERIOD_LABEL, PRICE_LABEL, currentAccess } from "@/lib/access";

export const metadata: Metadata = { title: "Abonnement — Lettre IA" };
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  annule: "Souscription annulée : aucun montant n'a été débité.",
  erreur: "Le paiement n'a pas pu être confirmé. Réessayez ou contactez-nous.",
};

export default async function Abonnement({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const notice = Object.keys(MESSAGES).find((key) => params[key]);
  const access = await currentAccess();

  return (
    <main className="narrow">
      <Link href="/" className="back">← Retour</Link>

      <section className="card offer">
        <p className="eyebrow">Abonnement</p>
        <h1 className="price">
          {PRICE_LABEL} <span className="period">{PERIOD_LABEL}</span>
        </h1>
        <p className="muted">Sans engagement · résiliable en un clic · facture mensuelle</p>

        <ul className="features">
          <li>Lettres illimitées, chacune adaptée à l'entreprise visée</li>
          <li>Analyse du CV et de l'offre, rédaction puis relecture « humanisée »</li>
          <li>Ajustements illimités : plus court, plus long, ton, points à mettre en avant</li>
          <li>Import PDF, Word ou texte, sur ordinateur et téléphone</li>
          <li>Espace client : factures, moyen de paiement, résiliation</li>
        </ul>

        {notice && <p className="error">{MESSAGES[notice]}</p>}

        {access.active ? (
          <>
            <p className="success">Votre abonnement est actif.</p>
            <Link href="/" className="button primary">Rédiger une lettre</Link>
          </>
        ) : (
          <form action="/api/checkout" method="post">
            <button type="submit" className="primary pay">
              S'abonner — {PRICE_LABEL} {PERIOD_LABEL}
            </button>
          </form>
        )}

        <p className="pay-methods">Apple Pay · Google Pay · Carte bancaire</p>
        {!access.loggedIn && (
          <p className="muted small center">
            Déjà abonné ? <Link href="/connexion">Se connecter</Link>
          </p>
        )}
        <p className="muted small">
          Paiement sécurisé par Stripe. Vos coordonnées bancaires ne transitent jamais par nos serveurs.
        </p>
      </section>
    </main>
  );
}
