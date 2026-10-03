import type { Metadata } from "next";
import Link from "next/link";
import { COMPANY, LEGAL_UPDATED } from "@/lib/legal";
import { ADJUSTMENTS_PER_LETTER, PLANS, PLAN_ORDER, WEEKLY_LIMIT } from "@/lib/pricing";

export const metadata: Metadata = { title: "Conditions générales de vente — Ma lettre de motiv" };

export default function CGV() {
  return (
    <main className="narrow article">
      <Link href="/" className="back">← Retour</Link>
      <h1>Conditions générales de vente</h1>
      <p className="lead">Dernière mise à jour : {LEGAL_UPDATED}</p>

      <h2>1. Vendeur</h2>
      <p>
        Le service Lettre IA est édité par {COMPANY.name}, {COMPANY.address}
        {COMPANY.siret && `, SIRET ${COMPANY.siret}`}. Contact :{" "}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. Les présentes conditions s'appliquent à tout achat
        effectué sur le site.
      </p>

      <h2>2. Service</h2>
      <p>
        Lettre IA rédige des lettres de motivation à l'aide d'une intelligence artificielle, à partir du CV et de
        l'offre d'emploi fournis par l'utilisateur. La lettre est une proposition : l'utilisateur la relit, vérifie
        l'exactitude des informations et reste seul responsable de son usage. Lettre IA ne garantit pas l'obtention
        d'un entretien ou d'un emploi.
      </p>

      <h2>3. Offres et prix</h2>
      <p>Les prix sont indiqués en euros, toutes taxes comprises :</p>
      <ul>
        {PLAN_ORDER.map((id) => (
          <li key={id}>
            <strong>
              {PLANS[id].name} — {PLANS[id].price} {PLANS[id].period}
            </strong>{" "}
            : {PLANS[id].features.join(", ").replace(/\*/g, "")}.
          </li>
        ))}
      </ul>
      <ul>
        <li>
          L'offre « 1 lettre » donne droit à une lettre et à {ADJUSTMENTS_PER_LETTER} ajustements de cette lettre.
        </li>
        <li>
          Les offres illimitées (semaine, mois, à vie) sont soumises à une limite d'usage raisonnable de{" "}
          {WEEKLY_LIMIT} lettres par semaine, remise à zéro chaque lundi.
        </li>
        <li>
          L'offre « À vie » est un paiement unique qui donne accès au service tant que celui-ci est exploité par{" "}
          {COMPANY.name}.
        </li>
        <li>Une lettre d'essai peut être offerte aux nouveaux visiteurs, sans paiement ni inscription.</li>
      </ul>

      <h2>4. Paiement</h2>
      <p>
        Le paiement s'effectue par carte bancaire, Apple Pay ou Google Pay, via la plateforme sécurisée Stripe.{" "}
        {COMPANY.name} n'a jamais accès à vos données bancaires. Une facture est émise pour chaque paiement.
      </p>

      <h2>5. Abonnements</h2>
      <p>
        Les abonnements à la semaine et au mois se renouvellent automatiquement à la fin de chaque période, au prix en
        vigueur. Ils sont sans engagement : vous pouvez les résilier à tout moment depuis « Mon compte », la résiliation
        prenant effet à la fin de la période déjà payée. Aucune période entamée n'est remboursée.
      </p>

      <h2>6. Droit de rétractation</h2>
      <p>
        Le service est un contenu numérique fourni immédiatement après le paiement. Conformément à l'article L221-28
        du Code de la consommation, en cochant la case prévue avant le paiement, vous demandez l'exécution immédiate du
        service et reconnaissez perdre votre droit de rétractation. En cas de problème technique empêchant la
        génération de vos lettres, contactez-nous : nous trouverons une solution ou vous rembourserons.
      </p>

      <h2>7. Responsabilité</h2>
      <p>
        {COMPANY.name} met en œuvre les moyens raisonnables pour assurer la disponibilité du service, sans garantie
        d'accès ininterrompu. Sa responsabilité ne saurait être engagée pour le contenu des lettres envoyées par
        l'utilisateur ni pour les suites données à ses candidatures.
      </p>

      <h2>8. Données personnelles</h2>
      <p>
        Le traitement de vos données est décrit dans la <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>

      <h2>9. Réclamations</h2>
      <p>
        Pour toute réclamation, écrivez à <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
        {COMPANY.mediator.name && (
          <>
            {" "}
            En l'absence de solution amiable, vous pouvez recourir gratuitement au médiateur de la consommation :{" "}
            {COMPANY.mediator.url ? (
              <a href={COMPANY.mediator.url} rel="noopener noreferrer" target="_blank">
                {COMPANY.mediator.name}
              </a>
            ) : (
              COMPANY.mediator.name
            )}
            .
          </>
        )}
      </p>

      <h2>10. Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français.</p>
    </main>
  );
}
