import { ACTIVE_PARTNERS } from "@/lib/partners";

// Recommandations partenaires (liens d'affiliation). Rien n'est affiché tant qu'aucun lien n'est renseigné.
export default function Partners() {
  if (ACTIVE_PARTNERS.length === 0) return null;
  return (
    <aside className="partners" aria-label="Recommandations partenaires">
      <h3>Pour aller plus loin</h3>
      <ul>
        {ACTIVE_PARTNERS.map((partner) => (
          <li key={partner.title}>
            <a href={partner.url} target="_blank" rel="sponsored noopener noreferrer">
              <strong>{partner.title}</strong>
              <span>{partner.description}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="muted small">Liens partenaires : nous pouvons percevoir une commission, sans surcoût pour vous.</p>
    </aside>
  );
}
