import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { type Subscription, getSession, getSubscription, isActive } from "@/lib/access";

export const metadata: Metadata = { title: "Mon compte — Lettre IA" };
export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  active: "Actif",
  trialing: "Période d'essai",
  past_due: "Paiement en retard",
  unpaid: "Impayé",
  canceled: "Résilié",
  incomplete: "Paiement incomplet",
  incomplete_expired: "Expiré",
  paused: "En pause",
};

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default async function Compte({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/connexion");
  const params = await searchParams;

  let sub: Subscription | null = null;
  let unavailable = false;
  try {
    sub = await getSubscription(session.customerId);
  } catch (error) {
    console.error(error);
    unavailable = true;
  }
  const active = isActive(sub);

  return (
    <main className="narrow">
      <Link href="/" className="back">← Retour</Link>
      <section className="card offer">
        <h1 className="title">Mon compte</h1>
        <dl className="details">
          <dt>E-mail</dt>
          <dd>{session.email || "—"}</dd>
          <dt>Abonnement</dt>
          <dd className={active ? "success" : ""}>
            {unavailable ? "Information indisponible" : sub ? STATUS_LABELS[sub.status] ?? sub.status : "Aucun"}
          </dd>
          {sub?.renewsAt && active && (
            <>
              <dt>{sub.cancelAtPeriodEnd ? "Accès jusqu'au" : "Prochain renouvellement"}</dt>
              <dd>{formatDate(sub.renewsAt)}</dd>
            </>
          )}
        </dl>

        {params.erreur && <p className="error">L'espace client est momentanément indisponible. Réessayez plus tard.</p>}

        {active ? (
          <Link href="/" className="button primary">Rédiger une lettre</Link>
        ) : (
          <Link href="/abonnement" className="button primary">Reprendre un abonnement</Link>
        )}
        <form action="/api/portal" method="post" className="stack">
          <button type="submit">Gérer mon abonnement et mes factures</button>
        </form>
        <form action="/api/auth/logout" method="post" className="stack">
          <button type="submit" className="link-button">Se déconnecter</button>
        </form>
      </section>
    </main>
  );
}
