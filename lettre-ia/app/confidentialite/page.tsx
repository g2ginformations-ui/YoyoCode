import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY, LEGAL_UPDATED } from "@/lib/legal";
import { mistralEnabled } from "@/lib/mistral";

export const metadata: Metadata = { title: "Politique de confidentialité — MaMotiv" };

export const dynamic = "force-dynamic";

export default function Confidentialite() {
  const mistral = mistralEnabled();
  return (
    <main className="narrow article">
      <Link href="/" className="back">← Retour</Link>
      <h1>Politique de confidentialité</h1>
      <p className="lead">Dernière mise à jour : {LEGAL_UPDATED}</p>

      <h2>Responsable du traitement</h2>
      <p>
        {COMPANY.name}, {COMPANY.address}. Contact : <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>

      <h2>Données traitées</h2>
      <ul>
        <li>
          <strong>Votre CV et l'offre d'emploi</strong> :{" "}
          {mistral ? (
            <>
              transmis à Mistral AI (France) pour rédiger votre lettre. Nous ne les conservons pas sur nos serveurs.
              Nous utilisons l'offre gratuite de Mistral AI : selon ses conditions, Mistral AI peut utiliser les
              textes reçus pour entraîner ses modèles. Retirez de votre CV les informations que vous ne souhaitez
              pas partager avant de l'envoyer. Détails : <Link href="/ia">utilisation de l'IA</Link>.
            </>
          ) : (
            <>
              transmis à notre fournisseur d'intelligence artificielle (Anthropic) uniquement pour rédiger votre
              lettre. Nous ne les conservons pas sur nos serveurs.
            </>
          )}
        </li>
        <li>
          <strong>Vos lettres et votre saisie</strong> : enregistrées uniquement dans votre navigateur (historique «
          Mes lettres »). Vous pouvez les supprimer à tout moment.
        </li>
        <li>
          <strong>Achat et compte</strong> : adresse e-mail, nom, adresse de facturation et historique d'achat, gérés
          par Stripe pour le paiement, la facturation et la connexion à votre compte. Votre mot de passe n'est jamais
          conservé en clair : seule une empreinte chiffrée (scrypt) est enregistrée. Si vous choisissez « Continuer avec
          Google » ou « Continuer avec Apple », nous recevons uniquement votre adresse e-mail et, le cas échéant, votre
          nom.
        </li>
        <li>
          <strong>Avis</strong> : prénom, note et texte que vous choisissez de publier.
        </li>
      </ul>

      <h2>Finalités et bases légales</h2>
      <ul>
        <li>Fournir le service et gérer vos achats : exécution du contrat.</li>

        <li>Facturation et comptabilité : obligation légale.</li>
        <li>Publication de votre avis : votre consentement, que vous pouvez retirer à tout moment.</li>
      </ul>

      <h2>Durées de conservation</h2>
      <ul>
        <li>CV et offre : aucune conservation après la génération.</li>
        <li>Données de compte : pendant la durée de la relation commerciale, puis 3 ans.</li>
        <li>Factures : 10 ans (obligation comptable).</li>
        <li>Avis : jusqu'à votre demande de suppression.</li>
      </ul>

      <h2>Prestataires</h2>
      <p>
        Vercel (hébergement), {mistral ? "Mistral AI" : "Anthropic"} (intelligence artificielle), Stripe (paiement), Upstash (stockage des avis) et
        notre service d'envoi d'e-mails. Certains sont situés aux États-Unis : les transferts sont encadrés par le Data
        Privacy Framework UE–États-Unis ou par les clauses contractuelles types de la Commission européenne.
      </p>

      <h2>Cookies</h2>
      <p>
        En dehors de la publicité, le site utilise uniquement des cookies nécessaires à son fonctionnement : session de connexion, lettre d'essai
        utilisée, avis déjà déposé. Ils ne servent pas à vous suivre et ne nécessitent pas de consentement.
      </p>
      {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
        <p>
          Des publicités Google AdSense sont affichées aux visiteurs sans offre payante. Google peut déposer des cookies
          publicitaires, uniquement avec votre accord recueilli par le bandeau de consentement.
        </p>
      )}

      <h2>Vos droits</h2>
      <p>
        Vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition, de limitation et de
        portabilité de vos données. Écrivez à <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Vous pouvez
        aussi adresser une réclamation à la CNIL (cnil.fr).
      </p>
    </main>
  );
}
