import Link from "next/link";
import { notFound } from "next/navigation";
import { setOrderStatus } from "@/app/admin/actions";
import { formatDate, formatPrice } from "@/lib/format";
import { readStore } from "@/lib/store";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> };

export default async function OrderDetail({ params, searchParams }: Props) {
  const { id } = await params;
  const { ok } = await searchParams;
  const order = (await readStore()).orders.find((o) => o.id === decodeURIComponent(id));
  if (!order) notFound();
  const c = order.customer;
  return (
    <>
      <p><Link href="/admin/commandes">← Commandes</Link></p>
      <h1>Commande {order.id}</h1>
      <p className="muted">Passée le {formatDate(order.createdAt)}</p>
      {ok ? <p className="success">Statut mis à jour.</p> : null}
      <div className="grid-2">
        <div className="card">
          <h2>Client</h2>
          <p>{c.name}<br /><a href={`mailto:${c.email}`}>{c.email}</a>{c.phone ? <><br />{c.phone}</> : null}</p>
          <p>{c.address}<br />{c.zip} {c.city}<br />{c.country}</p>
          {c.note ? <p className="muted">Note : {c.note}</p> : null}
        </div>
        <div className="card">
          <h2>Statut</h2>
          <form action={setOrderStatus} className="stack">
            <input type="hidden" name="id" value={order.id} />
            <select name="status" defaultValue={order.status}>
              <option>en attente</option>
              <option>payée</option>
              <option>expédiée</option>
              <option>annulée</option>
            </select>
            <button className="button primary">Mettre à jour</button>
          </form>
          {order.stripeSessionId ? <p className="muted small">Paiement Stripe : {order.stripeSessionId}</p> : null}
        </div>
      </div>
      <table className="table">
        <thead><tr><th>Produit</th><th>Option</th><th>Prix</th><th>Qté</th><th>Total</th></tr></thead>
        <tbody>
          {order.items.map((i, n) => (
            <tr key={n}>
              <td>{i.name}</td>
              <td>{i.option}</td>
              <td>{formatPrice(i.priceCents)}</td>
              <td>{i.qty}</td>
              <td>{formatPrice(i.priceCents * i.qty)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          {order.discountCents ? (
            <tr><td colSpan={4}>Code {order.promoCode}</td><td>-{formatPrice(order.discountCents)}</td></tr>
          ) : null}
          <tr><td colSpan={4}>Livraison</td><td>{order.shippingCents ? formatPrice(order.shippingCents) : "Offerte"}</td></tr>
          <tr><td colSpan={4}><strong>Total</strong></td><td><strong>{formatPrice(order.totalCents)}</strong></td></tr>
        </tfoot>
      </table>
    </>
  );
}
