"use client";

import { useState } from "react";

// Logo de l'entreprise visée, affiché à l'écran (le même que dans le PDF) ; masqué s'il est introuvable.
export default function CompanyLogo({ logoUrl, domain }: { logoUrl: string; domain: string }) {
  const sources = [
    logoUrl && `/api/logo?url=${encodeURIComponent(logoUrl)}`,
    domain && `/api/logo?domain=${encodeURIComponent(domain)}`,
  ].filter(Boolean) as string[];
  const [index, setIndex] = useState(0);
  if (index >= sources.length) return null;
  return (
    <img
      key={sources[index]}
      src={sources[index]}
      alt=""
      className="company-logo"
      width={40}
      height={40}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
