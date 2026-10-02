import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY, HOST, LEGAL_UPDATED } from "@/lib/legal";

export const metadata: Metadata = { title: "Mentions légales — Lettre IA" };

export default function MentionsLegales() {
  return (
    <main className="narrow article">
      <Link href="/" className="back">← Retour</Link>
      <h1>Mentions légales</h1>
      <p className="lead">Dernière mise à jour : {LEGAL_UPDATED}</p>

      <h2>Éditeur du site</h2>
      <ul>
        <li>Dénomination : {COMPANY.name}</li>
        <li>
          Forme juridique : {COMPANY.form}
          {COMPANY.capital && `, au capital de ${COMPANY.capital}`}
        </li>
        <li>Siège social : {COMPANY.address}</li>
        {COMPANY.siret && <li>SIRET : {COMPANY.siret}</li>}
        {COMPANY.rcs && <li>Immatriculation : {COMPANY.rcs}</li>}
        {COMPANY.vat && <li>TVA intracommunautaire : {COMPANY.vat}</li>}
        {COMPANY.director && <li>Directeur de la publication : {COMPANY.director}</li>}
        <li>
          Contact : <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>
        </li>
      </ul>

      <h2>Hébergement</h2>
      <p>{HOST}</p>

      <h2>Propriété intellectuelle</h2>
      <p>
        Les textes, la présentation et le code du site sont la propriété de {COMPANY.name}. Les lettres générées pour
        vous vous appartiennent : vous pouvez les utiliser, les modifier et les envoyer librement.
      </p>

      <h2>Pour aller plus loin</h2>
      <p>
        <Link href="/cgv">Conditions générales de vente</Link> ·{" "}
        <Link href="/confidentialite">Politique de confidentialité</Link>
      </p>
    </main>
  );
}
