import type { Metadata } from "next";
import Link from "next/link";
import { adminEnabled, isAdmin } from "@/lib/admin";
import { IMPORTED_REVIEWS } from "@/lib/reviews-imported";
import { reviewsStorageEnabled, storedReviewRows } from "@/lib/reviews";

export const metadata: Metadata = { title: "Modération des avis — MaMotiv", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function formatDate(iso?: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "short", timeZone: "Europe/Paris" });
}

export default async function AdminAvis({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  if (!adminEnabled()) {
    return (
      <main className="narrow">
        <section className="card offer">
          <h1 className="title">Administration</h1>
          <p className="muted">
            L'espace d'administration n'est pas activé. Ajoutez la variable <code>ADMIN_PASSWORD</code> (un mot de passe
            long, connu de vous seul) dans Vercel, puis redéployez le site.
          </p>
        </section>
      </main>
    );
  }

  if (!(await isAdmin())) {
    return (
      <main className="narrow">
        <section className="card offer">
          <h1 className="title">Administration</h1>
          {params.refus && <p className="error">Mot de passe incorrect.</p>}
          <form action="/api/admin/login" method="post" className="stack">
            <input type="password" name="password" required placeholder="Mot de passe administrateur" autoComplete="current-password" />
            <button type="submit" className="primary pay">Entrer</button>
          </form>
        </section>
      </main>
    );
  }

  const storage = reviewsStorageEnabled();
  let rows: Awaited<ReturnType<typeof storedReviewRows>> = [];
  let loadError = false;
  try {
    rows = await storedReviewRows();
  } catch (error) {
    console.error(error);
    loadError = true;
  }

  return (
    <main className="narrow article admin">
      <Link href="/" className="back">← Voir le site</Link>
      <h1>Modération des avis</h1>
      {params.supprime && <p className="success">Avis supprimé.</p>}
      {params.erreur && <p className="error">La suppression a échoué. Réessayez.</p>}
      {!storage && (
        <p className="error">
          Le stockage des avis n'est pas configuré : le formulaire d'avis est masqué sur le site. Créez une base
          Upstash for Redis dans Vercel (onglet Storage) et reliez-la au projet.
        </p>
      )}
      {loadError && <p className="error">Impossible de lire les avis pour le moment.</p>}
      {storage && !loadError && (
        <p className="lead">
          {rows.length} avis déposé{rows.length > 1 ? "s" : ""} sur ce site · {IMPORTED_REVIEWS.length} avis du
          précédent site (dans le code, non modifiables ici)
        </p>
      )}

      <ul className="admin-list">
        {rows.map(({ raw, review }) => (
          <li key={raw} className="card admin-review">
            <div className="review-head">
              <strong>{review.name}</strong>
              <span className="rating-stars">{"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}</span>
            </div>
            <p>{review.text}</p>
            <div className="admin-review-foot">
              <span className="muted small">{formatDate(review.date)}</span>
              <form action="/api/admin/avis" method="post">
                <input type="hidden" name="raw" value={raw} />
                <button type="submit" className="danger">Supprimer</button>
              </form>
            </div>
          </li>
        ))}
      </ul>

      <p className="muted small">
        Ne retirez que les avis injurieux, hors sujet, publicitaires ou manifestement faux : supprimer un avis
        simplement parce qu'il est négatif est interdit.
      </p>
      <form action="/api/admin/logout" method="post">
        <button type="submit" className="link-button">Se déconnecter de l'administration</button>
      </form>
    </main>
  );
}
