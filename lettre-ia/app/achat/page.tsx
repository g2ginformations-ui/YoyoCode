import type { Metadata } from "next";
import Link from "next/link";
import { ACCESS_DAYS, PRICE_LABEL, currentAccess } from "@/lib/access";

export const metadata: Metadata = { title: "Accès complet — Lettre IA" };
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  annule: "Paiement annulé : aucun montant n'a été débité.",
  erreur: "Le paiement n'a pas pu être confirmé. Réessayez ou contactez-nous.",
  expire: "Cet achat a expiré. Vous pouvez renouveler votre accès ci-dessous.",
};

export default async function Achat({
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
        <p className="eyebrow">Accès complet</p>
        <h1 className="price">{PRICE_LABEL}</h1>
        <p className="muted">Paiement unique · accès pendant {ACCESS_DAYS} jours · sans abonnement</p>

        <ul className="features">
          <li>Lettres illimitées, chacune adaptée à l'entreprise visée</li>
          <li>Analyse du CV et de l'offre, rédaction puis relecture « humanisée »</li>
          <li>Ajustements illimités : plus court, plus long, ton, points à mettre en avant</li>
          <li>Import PDF, Word ou texte, sur ordinateur et téléphone</li>
        </ul>

        {notice && <p className="error">{MESSAGES[notice]}</p>}

        {access.active ? (
          <>
            <p className="success">
              Votre accès est actif
              {access.until ? ` jusqu'au ${new Date(access.until).toLocaleDateString("fr-FR")}` : ""}.
            </p>
            <Link href="/" className="button primary">Rédiger une lettre</Link>
          </>
        ) : (
          <form action="/api/checkout" method="post">
            <button type="submit" className="primary pay">
              Payer {PRICE_LABEL}
            </button>
          </form>
        )}

        <p className="pay-methods">Apple Pay · Google Pay · Carte bancaire</p>
        <p className="muted small">
          Paiement sécurisé par Stripe. Vos coordonnées bancaires ne transitent jamais par nos serveurs.
        </p>
      </section>
    </main>
  );
}
