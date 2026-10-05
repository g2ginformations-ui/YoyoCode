// Liens d'offres copiés depuis les sites d'emploi : on retrouve l'adresse de l'offre elle-même (et non la page de
// résultats où elle était affichée), et on prépare un message clair pour les sites qui bloquent la lecture automatique.

type Board = { name: string; hosts: RegExp; hint: string };

const PASTE = "Ouvrez l'offre, copiez tout son texte et collez-le dans le cadre ci-dessous : c'est aussi efficace.";

const BOARDS: Board[] = [
  {
    name: "LinkedIn",
    hosts: /(^|\.)linkedin\.com$|(^|\.)lnkd\.in$/,
    hint: `LinkedIn réserve ses offres aux membres connectés : MyMotiv ne peut pas les lire automatiquement. Sur l'offre, cliquez sur « Plus » pour tout afficher, puis copiez le texte et collez-le dans le cadre ci-dessous.`,
  },
  { name: "Indeed", hosts: /(^|\.)indeed\.(com|fr)$/, hint: `Indeed bloque la lecture automatique de ses offres. ${PASTE}` },
  { name: "leboncoin", hosts: /(^|\.)leboncoin\.fr$/, hint: `leboncoin bloque la lecture automatique de ses offres. ${PASTE}` },
  { name: "Apec", hosts: /(^|\.)apec\.fr$/, hint: `Les offres de l'Apec s'affichent seulement dans un navigateur. ${PASTE}` },
];

export function boardOf(url: URL): Board | null {
  return BOARDS.find((b) => b.hosts.test(url.hostname.toLowerCase())) ?? null;
}

// Message affiché quand la page n'a pas pu être lue : propre au site s'il est connu.
export function blockedMessage(url: URL | null, fallback: string): string {
  return (url && boardOf(url)?.hint) || fallback;
}

// Adresse directe de l'offre à partir d'un lien de liste, de recherche ou de partage.
export function normalizeOfferUrl(raw: string): string {
  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch {
    return raw;
  }
  const host = url.hostname.toLowerCase();

  // LinkedIn : /jobs/view/123…, ou ?currentJobId=123 sur les pages « Recherche » et « Recommandées ».
  if (/(^|\.)linkedin\.com$/.test(host)) {
    const id = url.pathname.match(/\/jobs\/view\/(?:[^/]*-)?(\d{6,})/)?.[1] ?? url.searchParams.get("currentJobId");
    if (id && /^\d{6,}$/.test(id)) return `https://www.linkedin.com/jobs/view/${id}/`;
  }

  // Indeed : la page de résultats garde l'offre ouverte dans ?vjk= (ou ?jk=).
  if (/(^|\.)indeed\.(com|fr)$/.test(host)) {
    const id = url.searchParams.get("jk") ?? url.searchParams.get("vjk");
    if (id && /^[a-f0-9]{8,}$/i.test(id)) return `https://${host}/viewjob?jk=${id}`;
  }

  return url.toString();
}
