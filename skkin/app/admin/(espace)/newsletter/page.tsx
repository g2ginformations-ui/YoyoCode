import { formatDate } from "@/lib/format";
import { readStore } from "@/lib/store";

export default async function NewsletterAdmin() {
  const { subscribers, settings } = await readStore();
  return (
    <>
      <div className="section-head">
        <h1>Newsletter</h1>
        {subscribers.length ? <a href="/admin/newsletter-export" className="button">Télécharger la liste (CSV)</a> : null}
      </div>
      <p className="muted">
        {subscribers.length} inscrit{subscribers.length > 1 ? "s" : ""} · code de bienvenue {settings.newsletter.code} (-{settings.newsletter.percent} %)
      </p>
      {subscribers.length ? (
        <table className="table">
          <thead><tr><th>E-mail</th><th>Inscription</th></tr></thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.email}><td>{s.email}</td><td>{formatDate(s.createdAt)}</td></tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted">Aucun inscrit pour l'instant.</p>
      )}
    </>
  );
}
