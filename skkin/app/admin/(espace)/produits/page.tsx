import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { readStore } from "@/lib/store";

export default async function ProductsAdmin() {
  const { products, settings } = await readStore();
  const sorted = [...products].sort((a, b) => a.position - b.position);
  const categoryName = (slug: string) => settings.categories.find((c) => c.slug === slug)?.name ?? slug;
  return (
    <>
      <div className="section-head">
        <h1>Produits</h1>
        <Link href="/admin/produits/nouveau" className="button primary">+ Ajouter un produit</Link>
      </div>
      <table className="table">
        <thead>
          <tr><th /><th>Nom</th><th>Catégorie</th><th>Prix</th><th>Stock</th><th>Statut</th></tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.id}>
              <td>{p.images[0] ? <img src={p.images[0]} alt="" className="thumb" /> : null}</td>
              <td><Link href={`/admin/produits/${p.id}`}>{p.name}</Link></td>
              <td>{categoryName(p.category)}</td>
              <td>{formatPrice(p.priceCents)}</td>
              <td>{p.stock}</td>
              <td>{p.published ? "En ligne" : "Brouillon"}{p.featured ? " · Mis en avant" : ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
