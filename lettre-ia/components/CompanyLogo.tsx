"use client";

import { useEffect, useState } from "react";

// Logo de l'entreprise visée, affiché à l'écran (le même que dans le PDF) ; masqué s'il est introuvable.
// `onResult` indique si un logo a pu être affiché (pour confirmer au candidat qu'il a été trouvé).
export default function CompanyLogo({
  logoUrl,
  domain,
  name = "",
  onResult,
}: {
  logoUrl: string;
  domain: string;
  name?: string;
  onResult?: (found: boolean) => void;
}) {
  const sources = [
    logoUrl && `/api/logo?url=${encodeURIComponent(logoUrl)}`,
    domain && `/api/logo?domain=${encodeURIComponent(domain)}&nom=${encodeURIComponent(name)}`,
  ].filter(Boolean) as string[];
  const key = sources.join("|");
  const [index, setIndex] = useState(0);

  useEffect(() => setIndex(0), [key]);
  useEffect(() => {
    if (!sources.length || index >= sources.length) onResult?.(false);
  }, [key, index]);

  if (index >= sources.length) return null;
  return (
    <img
      key={sources[index]}
      src={sources[index]}
      alt=""
      className="company-logo"
      width={40}
      height={40}
      onLoad={() => onResult?.(true)}
      onError={() => setIndex((i) => i + 1)}
    />
  );
}
