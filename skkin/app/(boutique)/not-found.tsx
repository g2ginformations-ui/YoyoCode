import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container narrow section">
      <h1>Page introuvable</h1>
      <p className="muted">Cette page n'existe pas ou n'est plus en ligne.</p>
      <Link href="/boutique" className="button primary">Voir la boutique</Link>
    </div>
  );
}
