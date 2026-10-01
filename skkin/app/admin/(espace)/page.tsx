import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { readStore } from "@/lib/store";

export default async function Dashboard() {
  const store = await readStore();
  const paid = store.orders.filter((o) => o.status === "payée" || o.status === "expédiée");
  const lowStock = store.products.filter((p) => p.published && p.stock <= 5);
  return (
    <>
      <h1>Tableau de bord</h1>
      <div className="stats">
        <div className="card"><p className="muted small">Produits</p><p className="stat">{store.products.length}</p></div>
        <div className="card"><p className="muted small">Pages</p><p className="stat">{store.pages.length}</p></div>
        <div className="card"><p className="muted small">Commandes</p><p className="stat">{store.orders.length}</p></div>
        <div className="card">
          <p className="muted small">Chiffre d'affaires encaissé</p>
          <p className="stat">{formatPrice(paid.reduce((n, o) => n + o.totalCents, 0))}</p>
        </div>
      </div>
      <div className="actions">
        <Link href="/admin/produits/nouveau" className="button primary">+ Ajouter un produit</Link>
        <Link href="/admin/pages/nouveau" className="button">+ Ajouter une page</Link>
        <Link href="/admin/reglages" className="button">Modifier l'accueil et le menu</Link>
      </div>
      {lowStock.length > 0 && (
        <section>
          <h2>Stock bas</h2>
          <ul>
            {lowStock.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/produits/${p.id}`}>{p.name}</Link> : {p.stock} en stock
              </li>
            ))}
          </ul>
        </section>
      )}
      <section>
        <h2>Dernières commandes</h2>
        {store.orders.length ? (
          <table className="table">
            <tbody>
              {store.orders.slice(0, 5).map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/admin/commandes/${o.id}`}>{o.id}</Link></td>
                  <td>{formatDate(o.createdAt)}</td>
                  <td>{o.customer.name}</td>
                  <td>{formatPrice(o.totalCents)}</td>
                  <td><span className={`status s-${o.status.replace(/\s/g, "-")}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">Aucune commande pour l'instant.</p>
        )}
      </section>
    </>
  );
}
