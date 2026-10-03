// Site web de l'entreprise visée, déduit de l'offre d'emploi (liens ou adresses e-mail),
// pour afficher son logo dans la lettre PDF.
const IGNORED = [
  "indeed", "linkedin", "welcometothejungle", "hellowork", "apec", "francetravail", "pole-emploi", "monster",
  "jobteaser", "glassdoor", "cadremploi", "regionsjob", "meteojob", "jobijoba", "staffme", "studentjob",
  "gmail", "googlemail", "yahoo", "hotmail", "outlook", "live", "icloud", "orange", "free", "sfr", "laposte",
  "wanadoo", "aol", "proton", "protonmail", "gmx", "bit", "lnkd", "google", "facebook", "instagram", "youtube",
];

export const DOMAIN_PATTERN = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/i;

export function normalizeDomain(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#:\s]/)[0];
}

function ignored(domain: string): boolean {
  const labels = domain.split(".");
  return labels.some((label) => IGNORED.includes(label));
}

export function detectCompanyDomain(offer: string): string {
  const candidates = [
    ...offer.matchAll(/https?:\/\/[^\s<>"')]+/gi),
    ...offer.matchAll(/\bwww\.[a-z0-9.-]+\.[a-z]{2,24}/gi),
    ...offer.matchAll(/[a-z0-9._%+-]+@([a-z0-9.-]+\.[a-z]{2,24})/gi),
  ].map((match) => normalizeDomain(match[1] ?? match[0]));
  return candidates.find((domain) => DOMAIN_PATTERN.test(domain) && !ignored(domain)) ?? "";
}
