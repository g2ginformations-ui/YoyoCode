import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { type Entitlements, getEntitlements, getSession } from "@/lib/access";
import { PLANS, WEEKLY_LIMIT } from "@/lib/pricing";

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

  let rights: Entitlements | null = null;
  try {
    rights = await getEntitlements(session.customerId);
  } catch (error) {
    console.error(error);
  }
  const sub = rights?.subscription ?? null;
  const subscribed = rights?.plan === "week" || rights?.plan === "month";
  const active = Boolean(rights?.unlimited);

  return (
    <main className="narrow">
      <Link href="/" className="back">← Retour</Link>
      <section className="card offer">
        <h1 className="title">Mon compte</h1>
        <dl className="details">
          <dt>E-mail</dt>
          <dd>{session.email || "—"}</dd>
          <dt>Offre</dt>
          <dd className={active ? "success" : ""}>
            {!rights
              ? "Information indisponible"
              : rights.plan
                ? `${PLANS[rights.plan].name} — ${PLANS[rights.plan].price} ${PLANS[rights.plan].period}`
                : sub
                  ? `Abonnement ${STATUS_LABELS[sub.status] ?? sub.status}`
                  : "Aucune offre illimitée"}
          </dd>
          {subscribed && sub?.renewsAt && (
            <>
              <dt>{sub.cancelAtPeriodEnd ? "Accès jusqu'au" : "Prochain renouvellement"}</dt>
              <dd>{formatDate(sub.renewsAt)}</dd>
            </>
          )}
          {active && rights && (
            <>
              <dt>Cette semaine</dt>
              <dd>
                {rights.weekUsed} / {WEEKLY_LIMIT} lettres
              </dd>
            </>
          )}
          {rights && rights.credits > 0 && (
            <>
              <dt>Lettres à l'unité</dt>
              <dd>{rights.credits} disponible{rights.credits > 1 ? "s" : ""}</dd>
            </>
          )}
        </dl>

        {params.erreur && <p className="error">L'espace client est momentanément indisponible. Réessayez plus tard.</p>}

        {active || (rights && rights.credits > 0) ? (
          <Link href="/" className="button primary">Rédiger une lettre</Link>
        ) : (
          <Link href="/abonnement" className="button primary">Voir les offres</Link>
        )}
        <form action="/api/portal" method="post" className="stack">
          <button type="submit">Mes factures et mon abonnement</button>
        </form>
        <form action="/api/auth/logout" method="post" className="stack">
          <button type="submit" className="link-button">Se déconnecter</button>
        </form>
      </section>
    </main>
  );
}
