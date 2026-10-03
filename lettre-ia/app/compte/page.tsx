import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { type Entitlements, getEntitlements, getSession } from "@/lib/access";
import { MIN_PASSWORD_LENGTH, hasPassword } from "@/lib/password";
import { PLANS, WEEKLY_LIMIT } from "@/lib/pricing";

export const metadata: Metadata = { title: "Mon compte — MyMotiv" };
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

const PASSWORD_MESSAGES: Record<string, { text: string; ok?: boolean }> = {
  ok: { text: "Mot de passe enregistré : vous pouvez vous connecter avec votre e-mail et ce mot de passe.", ok: true },
  court: { text: `Le mot de passe doit contenir au moins ${MIN_PASSWORD_LENGTH} caractères.` },
  long: { text: "Le mot de passe est trop long (200 caractères maximum)." },
  different: { text: "Les deux mots de passe ne sont pas identiques." },
  erreur: { text: "Le mot de passe n'a pas pu être enregistré. Réessayez dans un instant." },
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
  let passwordSet = false;
  try {
    [rights, passwordSet] = await Promise.all([getEntitlements(session.customerId), hasPassword(session.customerId)]);
  } catch (error) {
    console.error(error);
  }
  const passwordNotice = params.mdp ? PASSWORD_MESSAGES[params.mdp] : undefined;
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
        <form action="/api/auth/password" method="post" className="stack password-form" id="mot-de-passe">
          <h2>{passwordSet ? "Changer mon mot de passe" : "Créer mon mot de passe"}</h2>
          {!passwordSet && (
            <p className="muted small">Pour vous reconnecter en quelques secondes, sur n'importe quel appareil.</p>
          )}
          {passwordNotice && <p className={passwordNotice.ok ? "success" : "error"}>{passwordNotice.text}</p>}
          <input
            type="password"
            name="password"
            required
            minLength={MIN_PASSWORD_LENGTH}
            placeholder={`Nouveau mot de passe (${MIN_PASSWORD_LENGTH} caractères minimum)`}
            autoComplete="new-password"
          />
          <input type="password" name="confirm" required placeholder="Confirmer le mot de passe" autoComplete="new-password" />
          <button type="submit" className={passwordSet ? "" : "primary"}>Enregistrer le mot de passe</button>
        </form>
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
