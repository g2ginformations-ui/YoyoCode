import type { Metadata } from "next";
import Link from "next/link";
import { currentAccess } from "@/lib/access";
import OfferForms from "@/components/OfferForms";
import { WEEKLY_LIMIT } from "@/lib/pricing";

export const metadata: Metadata = { title: "Offres — Ma lettre de motiv" };
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  annule: "Paiement annulé : aucun montant n'a été débité.",
  erreur: "Le paiement n'a pas pu être confirmé. Réessayez ou contactez-nous.",
  consentement: "Cochez la case d'accès immédiat pour continuer vers le paiement.",
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

      <OfferForms disabled={access.active} />

      <p className="muted small center">
        * Illimité dans la limite de {WEEKLY_LIMIT} lettres par semaine, une protection contre les abus largement
        au-dessus d'un usage normal. Abonnements sans engagement, résiliables en un clic depuis « Mon compte ».
      </p>
      {!access.loggedIn && (
        <p className="muted small center">
          Déjà client ? <Link href="/connexion">Se connecter</Link>
        </p>
      )}
      <p className="muted small center">
        <Link href="/cgv">CGV</Link> · <Link href="/mentions-legales">Mentions légales</Link> ·{" "}
        <Link href="/confidentialite">Confidentialité</Link> ·{" "}
        <Link href="/ia">Utilisation de l'IA</Link>
      </p>
    </main>
  );
}
