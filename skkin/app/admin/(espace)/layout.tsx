import type { Metadata } from "next";
import Link from "next/link";
import { logout } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="admin">
      <aside className="admin-nav">
        <Link href="/admin" className="logo">Admin</Link>
        <nav>
          <Link href="/admin">Tableau de bord</Link>
          <Link href="/admin/produits">Produits</Link>
          <Link href="/admin/pages">Pages</Link>
          <Link href="/admin/reglages">Réglages du site</Link>
          <Link href="/admin/commandes">Commandes</Link>
          <a href="/" target="_blank" rel="noreferrer">Voir le site ↗</a>
        </nav>
        <form action={logout}>
          <button className="link-button">Se déconnecter</button>
        </form>
      </aside>
      <div className="admin-main">{children}</div>
    </div>
  );
}
