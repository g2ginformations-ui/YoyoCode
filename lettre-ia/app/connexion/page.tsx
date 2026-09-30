import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Connexion — Lettre IA" };

const MESSAGES: Record<string, { text: string; ok?: boolean }> = {
  envoye: {
    text: "Si un abonnement actif correspond à cette adresse, un lien de connexion vient de vous être envoyé. Pensez à vérifier vos courriers indésirables.",
    ok: true,
  },
  expire: { text: "Ce lien a expiré ou n'est pas valide. Demandez-en un nouveau." },
  invalide: { text: "Adresse e-mail invalide." },
  indisponible: { text: "La connexion par e-mail n'est pas encore disponible. Contactez-nous pour récupérer votre accès." },
};

export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const notice = Object.keys(MESSAGES).find((key) => params[key]);

  return (
    <main className="narrow">
      <Link href="/" className="back">← Retour</Link>
      <section className="card offer">
        <h1 className="title">Se connecter</h1>
        <p className="muted">
          Saisissez l'adresse e-mail utilisée lors de votre abonnement : nous vous envoyons un lien de connexion, sans mot de passe.
        </p>
        {notice && <p className={MESSAGES[notice].ok ? "success" : "error"}>{MESSAGES[notice].text}</p>}
        <form action="/api/auth/login" method="post" className="stack">
          <input type="email" name="email" required placeholder="vous@entreprise.fr" autoComplete="email" />
          <button type="submit" className="primary pay">Recevoir mon lien de connexion</button>
        </form>
        <p className="muted small center">
          Pas encore abonné ? <Link href="/abonnement">Découvrir l'abonnement</Link>
        </p>
      </section>
    </main>
  );
}
