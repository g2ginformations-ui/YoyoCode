import type { Metadata } from "next";
import Link from "next/link";
import { appleEnabled, googleEnabled } from "@/lib/oauth";

export const metadata: Metadata = { title: "Connexion — Ma lettre de motiv" };

const MESSAGES: Record<string, { text: string; ok?: boolean }> = {
  identifiants: { text: "E-mail ou mot de passe incorrect." },
  bloque: { text: "Trop d'essais : réessayez dans 15 minutes, ou recevez un lien de connexion par e-mail ci-dessous." },
  erreur: { text: "La connexion est momentanément indisponible. Réessayez dans un instant." },
  oauth: { text: "La connexion avec Google ou Apple n'a pas abouti. Réessayez, ou utilisez votre e-mail et votre mot de passe." },
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
  const google = googleEnabled();
  const apple = appleEnabled();

  return (
    <main className="narrow">
      <Link href="/" className="back">← Retour</Link>
      <section className="card offer">
        <h1 className="title">Se connecter</h1>
        {notice && <p className={MESSAGES[notice].ok ? "success" : "error"}>{MESSAGES[notice].text}</p>}
        {(google || apple) && (
          <div className="social-login">
            {google && (
              <a href="/api/auth/google/start" className="button social google">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8z" />
                  <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
                  <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z" />
                  <path fill="#EA4335" d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.8 3.6-4.9 6.7-4.9z" />
                </svg>
                Continuer avec Google
              </a>
            )}
            {apple && (
              <a href="/api/auth/apple/start" className="button social apple">
                <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                  <path fill="currentColor" d="M16.4 12.7c0-2.6 2.1-3.8 2.2-3.9a4.8 4.8 0 0 0-3.8-2c-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9a5 5 0 0 0-4.2 2.6c-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.6s1.7-.8 3.3-.8 2 .8 3.4.8 2.2-1.3 3-2.5a10 10 0 0 0 1.4-2.8 4.4 4.4 0 0 1-2.4-4.2zM13.9 5.1A4.4 4.4 0 0 0 15 1.8a4.5 4.5 0 0 0-2.9 1.5 4.2 4.2 0 0 0-1 3.2 3.7 3.7 0 0 0 2.8-1.4z" />
                </svg>
                Continuer avec Apple
              </a>
            )}
            <p className="divider"><span>ou</span></p>
          </div>
        )}
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
