"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import NavIcon, { type NavIconName } from "@/components/NavIcon";

// Barre d'onglets fixée en bas de l'écran, sur téléphone uniquement (masquée par le CSS sur ordinateur).
const TABS: { href: string; label: string; icon: NavIconName; match: string[] }[] = [
  { href: "/conseils", label: "Conseils", icon: "conseils", match: ["/conseils"] },
  { href: "/historique", label: "Mes lettres", icon: "enveloppe", match: ["/historique"] },
  { href: "/abonnement", label: "Tarifs", icon: "barres", match: ["/abonnement"] },
  // « Mon compte » renvoie vers la connexion pour un visiteur qui n'est pas connecté.
  { href: "/compte", label: "Profil", icon: "compte", match: ["/compte", "/connexion"] },
];

export default function TabBar() {
  const pathname = usePathname();
  // Le parcours « /candidature » est plein écran : son bouton « Suivant » occupe le bas.
  if (pathname.startsWith("/admin") || pathname.startsWith("/candidature")) return null;

  return (
    <nav className="tabbar" aria-label="Navigation principale">
      {TABS.map((tab) => {
        const active = tab.match.some((path) => pathname.startsWith(path));
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? "active" : undefined}
            aria-current={active ? "page" : undefined}
          >
            <NavIcon name={tab.icon} size={20} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
