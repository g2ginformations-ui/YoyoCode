import Link from "next/link";
import { readStore } from "@/lib/store";

export default async function PagesAdmin() {
  const { pages } = await readStore();
  return (
    <>
      <div className="section-head">
        <h1>Pages</h1>
        <Link href="/admin/pages/nouveau" className="button primary">+ Ajouter une page</Link>
      </div>
      <p className="muted small">
        Pour afficher une page dans le menu ou le pied de page, ajoutez son adresse dans{" "}
        <Link href="/admin/reglages">Réglages du site</Link>.
      </p>
      <table className="table">
        <thead><tr><th>Titre</th><th>Adresse</th><th>Statut</th></tr></thead>
        <tbody>
          {pages.map((p) => (
            <tr key={p.id}>
              <td><Link href={`/admin/pages/${p.id}`}>{p.title}</Link></td>
              <td className="muted">/pages/{p.slug}</td>
              <td>{p.published ? "En ligne" : "Brouillon"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
