import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/format";
import { readStore } from "@/lib/store";

export default async function OrdersAdmin() {
  const { orders } = await readStore();
  return (
    <>
      <h1>Commandes</h1>
      {orders.length ? (
        <table className="table">
          <thead><tr><th>N°</th><th>Date</th><th>Client</th><th>Articles</th><th>Total</th><th>Statut</th></tr></thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id}>
                <td><Link href={`/admin/commandes/${o.id}`}>{o.id}</Link></td>
                <td>{formatDate(o.createdAt)}</td>
                <td>{o.customer.name}<br /><span className="muted small">{o.customer.email}</span></td>
                <td>{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                <td>{formatPrice(o.totalCents)}</td>
                <td><span className={`status s-${o.status.replace(/\s/g, "-")}`}>{o.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="muted">Aucune commande pour l'instant.</p>
      )}
    </>
  );
}
