// Gages de confiance sur le paiement (crainte remontée par un client : « mes infos bancaires sont-elles gardées ? »).
// Tout est vrai pour Stripe Checkout : la carte est saisie sur la page de Stripe, jamais sur MyMotiv.
const POINTS: [string, string, string][] = [
  ["lock", "Vos données bancaires ne passent jamais par MyMotiv", "La carte est saisie sur la page sécurisée de Stripe : nous ne voyons ni ne conservons jamais son numéro."],
  ["shield", "Stripe, certifié PCI DSS niveau 1", "Le plus haut niveau de certification exigé par les réseaux de cartes bancaires pour traiter les paiements."],
  ["phone", "3D Secure, Apple Pay et Google Pay", "Votre banque confirme le paiement ; avec Apple Pay ou Google Pay, votre numéro de carte n'est même pas transmis."],
];

const ICONS: Record<string, React.ReactNode> = {
  lock: <path d="M7 10V7a5 5 0 0 1 10 0v3h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1Zm2 0h6V7a3 3 0 0 0-6 0v3Zm3 4a1.5 1.5 0 0 0-1 2.6V18h2v-1.4a1.5 1.5 0 0 0-1-2.6Z" />,
  shield: <path d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Zm-1.2 13.6-3.4-3.4 1.4-1.4 2 2 4.6-4.6 1.4 1.4-6 6Z" />,
  phone: <path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Zm0 3v13h8V5H8Zm4 14.2a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z" />,
};

export default function PaymentTrust({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="trust-compact">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">{ICONS.lock}</svg>
        Paiement chiffré par Stripe (PCI DSS niveau 1) : vos données bancaires ne passent jamais par MyMotiv.
      </p>
    );
  }
  return (
    <section className="trust" aria-label="Sécurité du paiement">
      {POINTS.map(([icon, title, text]) => (
        <div key={icon} className="trust-item">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">{ICONS[icon]}</svg>
          <div>
            <strong>{title}</strong>
            <p>{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
