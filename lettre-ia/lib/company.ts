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

// Nom de l'entreprise visée, deviné à partir de l'offre : simple proposition, toujours modifiable.
const NOT_A_NAME = new Set([
  "nous", "vous", "notre", "votre", "nos", "vos", "la", "le", "les", "l", "un", "une", "des", "ce", "cette",
  "notre équipe", "l'équipe", "l’équipe", "son", "sa", "ses",
]);

function cleanName(raw: string): string {
  const name = raw
    .replace(/\s+/g, " ")
    .replace(/^[«"“'’\s]+|[»"”'’\s,.;:!?)–-]+$/g, "")
    .trim();
  if (name.length < 2 || name.length > 60) return "";
  if (NOT_A_NAME.has(name.toLowerCase())) return "";
  return name;
}

export function nameFromDomain(domain: string): string {
  const label = domain.split(".")[0] ?? "";
  return label
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function detectCompanyName(offer: string, domain = detectCompanyDomain(offer)): string {
  const word = "[\\p{L}\\p{N}_&'’.\\-]";
  const patterns = [
    /^\s*(?:entreprise|société|societe|employeur|company|raison sociale|nom de l['’]entreprise)\s*[:\-–]\s*(.+)$/imu,
    new RegExp(`^\\s*([\\p{Lu}0-9]${word.slice(0, -1)} ]{1,50}?)\\s+(?:recrute|recherche|is hiring)\\b`, "mu"),
    new RegExp(
      `(?:^|\\s)(?:[Cc]hez|[Rr]ejoignez|[Rr]ejoindre|À propos de|A propos de|[Ii]ntégrer)\\s+((?:[\\p{Lu}0-9]${word}*)(?:\\s+(?:[\\p{Lu}0-9]${word}*|de|du|des|&))*)`,
      "u",
    ),
  ];
  for (const pattern of patterns) {
    const match = offer.match(pattern);
    const name = match ? cleanName(match[1]) : "";
    if (name) return name;
  }
  return domain ? nameFromDomain(domain) : "";
}
