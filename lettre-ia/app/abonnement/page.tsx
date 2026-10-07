import type { Metadata } from "next";
import Link from "next/link";
import { currentAccess } from "@/lib/access";
import OfferForms from "@/components/OfferForms";
import { WEEKLY_LIMIT } from "@/lib/pricing";

export const metadata: Metadata = { title: "Offres — MyMotiv" };
export const dynamic = "force-dynamic";

const MESSAGES: Record<string, string> = {
  annule: "Paiement annulé : aucun montant n'a été débité.",
  erreur: "Le paiement n'a pas pu être confirmé. Réessayez ou contactez-nous.",
  consentement: "Cochez la case d'accès immédiat pour continuer vers le paiement.",
};

// Variables dont l'absence est signalée, pour aider à configurer le site.
const CAUSES = new Set(["ACCESS_SECRET", "STRIPE_SECRET_KEY"]);

export default async function Offres({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const notice = Object.keys(MESSAGES).find((key) => params[key]);
  const access = await currentAccess();
  // Le détail technique de Stripe n'est affiché qu'en mode test : en production, un lien piégé
  // ne doit pas pouvoir afficher un faux message sur le site.
  const liveMode = /_live_/.test(process.env.STRIPE_SECRET_KEY ?? "");
  const cause = params.cause && CAUSES.has(params.cause) ? params.cause : null;
  const detail = !liveMode && params.detail ? params.detail.slice(0, 300) : null;

  return (
    <main id="contenu" className="offers-page">
      <Link href="/" className="back">← Retour</Link>
      <header className="offers-head">
        <h1>Offres</h1>
        <p className="lead">Payez seulement ce dont votre recherche a besoin.</p>
        <p className="muted">Prix TTC · sans engagement, résiliable en 2 clics depuis « Mon compte »</p>
      </header>

      {notice && <p className="error">{MESSAGES[notice]}</p>}
      {cause && <p className="error small">Configuration incomplète : la variable {cause} est absente du serveur.</p>}
      {detail && <p className="error small">Réponse de Stripe (mode test) : « {detail} »</p>}
      {access.active && (
        <p className="success">
          Vous avez déjà un accès illimité. <Link href="/">Rédiger une lettre</Link>
        </p>
      )}

      <OfferForms disabled={access.active} />

      <p className="muted small center">
        * Illimité dans la limite de {WEEKLY_LIMIT} lettres par semaine, une protection contre les abus largement
        au-dessus d'un usage normal.
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
