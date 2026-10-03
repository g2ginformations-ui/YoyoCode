import type { Metadata } from "next";
import Link from "next/link";
import { aiProvider } from "@/lib/ai";
import { LEGAL_UPDATED } from "@/lib/legal";

export const metadata: Metadata = { title: "Utilisation de l'IA — Lettre IA" };
export const dynamic = "force-dynamic";

export default function UtilisationIA() {
  const mistral = aiProvider() === "mistral";
  const provider = mistral ? "Mistral AI (Paris, France)" : "Anthropic (États-Unis)";

  return (
    <main className="narrow article">
      <Link href="/" className="back">← Retour</Link>
      <h1>Utilisation de l'intelligence artificielle</h1>
      <p className="lead">Dernière mise à jour : {LEGAL_UPDATED}</p>

      <h2>Qui rédige vos lettres</h2>
      <p>
        Vos lettres sont rédigées par une intelligence artificielle fournie par {provider}. Le texte de votre CV, de
        l'offre d'emploi et de vos consignes lui est transmis à chaque génération ou ajustement.
      </p>

      <h2>Ce que devient votre texte</h2>
      <ul>
        <li>Lettre IA ne conserve ni votre CV ni l'offre sur ses serveurs : vos lettres restent sur votre appareil.</li>
        {mistral ? (
          <li>
            Nous utilisons l'offre gratuite de Mistral AI. Selon ses conditions, Mistral AI peut utiliser les textes
            reçus pour entraîner et améliorer ses modèles d'intelligence artificielle.
          </li>
        ) : (
          <li>Anthropic n'utilise pas les textes envoyés par notre service pour entraîner ses modèles.</li>
        )}
      </ul>

      {mistral && (
        <>
          <h2>Nos conseils</h2>
          <ul>
            <li>
              Avant d'envoyer votre CV, retirez les informations que vous ne souhaitez pas partager : adresse,
              numéro de téléphone, date de naissance, numéro de sécurité sociale…
            </li>
            <li>Votre nom, votre parcours et vos compétences suffisent pour obtenir une lettre personnalisée.</li>
            <li>Vous pourrez ajouter vos coordonnées vous-même dans la lettre finale, avant de l'envoyer.</li>
          </ul>
        </>
      )}

      <h2>Vérifiez toujours la lettre</h2>
      <p>
        L'intelligence artificielle peut se tromper. Relisez la lettre et vérifiez chaque information avant de
        l'envoyer à un recruteur.
      </p>

      <p>
        Pour en savoir plus sur vos données et vos droits : <Link href="/confidentialite">politique de confidentialité</Link>.
      </p>
    </main>
  );
}
