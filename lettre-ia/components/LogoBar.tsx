"use client";

import { usePathname } from "next/navigation";
import LogoLink from "@/components/LogoLink";

// Logo en haut des pages intérieures (l'accueil a déjà le sien, l'administration n'en a pas besoin).
export default function LogoBar() {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/admin")) return null;
  return (
    <div className="logo-bar">
      <LogoLink />
    </div>
  );
}
