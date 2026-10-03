import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Connexion — Lettre IA" };

const MESSAGES: Record<string, { text: string; ok?: boolean }> = {
  identifiants: { text: "E-mail ou mot de passe incorrect." },
  bloque: { text: "Trop d'essais : réessayez dans 15 minutes, ou recevez un lien de connexion par e-mail ci-dessous." },
  erreur: { text: "La connexion est momentanément indisponible. Réessayez dans un instant." },
  envoye: {
    text: "Si un achat en cours de validité correspond à cette adresse, un lien de connexion vient de vous être envoyé. Pensez à vérifier vos courriers indésirables.",
    ok: true,
  },
  expire: { text: "Ce lien a expiré ou n'est pas valide. Demandez-en un nouveau." },
  invalide: { text: "Adresse e-mail invalide." },
  indisponible: {
    text: "L'envoi de liens par e-mail n'est pas encore disponible. Connectez-vous avec votre mot de passe, ou contactez-nous pour récupérer votre accès.",
  },
};

// Messages liés au lien par e-mail : on garde alors cette partie ouverte.
const EMAIL_LINK_NOTICES = new Set(["envoye", "expire", "invalide", "indisponible", "bloque"]);

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
        {notice && <p className={MESSAGES[notice].ok ? "success" : "error"}>{MESSAGES[notice].text}</p>}
        <form action="/api/auth/signin" method="post" className="stack">
          <input type="email" name="email" required placeholder="Adresse e-mail" autoComplete="email" />
          <input
            type="password"
            name="password"
            required
            placeholder="Mot de passe"
            autoComplete="current-password"
          />
          <button type="submit" className="primary pay">Se connecter</button>
        </form>

        <details className="login-link" open={Boolean(notice && EMAIL_LINK_NOTICES.has(notice))}>
          <summary>Mot de passe oublié ou pas encore de mot de passe ?</summary>
          <p className="muted small">
            Saisissez l'adresse e-mail utilisée lors de votre achat : nous vous envoyons un lien de connexion. Vous
            pourrez ensuite choisir un mot de passe dans « Mon compte ».
          </p>
          <form action="/api/auth/login" method="post" className="stack">
            <input type="email" name="email" required placeholder="vous@exemple.fr" autoComplete="email" />
            <button type="submit">Recevoir un lien de connexion</button>
          </form>
        </details>

        <p className="muted small center">
          Pas encore client ? <Link href="/abonnement">Voir les offres</Link>
        </p>
      </section>
    </main>
  );
}
