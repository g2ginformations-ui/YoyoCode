// Vérification réelle (avec Internet) : pour une liste d'entreprises, le site est-il trouvé à partir
// du nom, et un logo exploitable est-il trouvé pour ce site ? Lancé par la CI (.github/workflows/lettre-ia-logos.yml).
// Usage : npx tsx scripts/check-company-logos.mts
import { findCompanyDomain, findLogo, imageSize } from "@/lib/company-site";

const COMPANIES = [
  "Decathlon", "Doctolib", "Leroy Merlin", "Carrefour", "BlaBlaCar", "Qonto", "Back Market", "Sézane",
  "La Poste", "Orange", "Michelin", "L'Oréal", "Ubisoft", "Malt", "Swile", "Le Slip Français",
  "Alan", "Manpower", "Fnac Darty", "Sephora", "Welcome to the Jungle", "Contentsquare", "Lydia", "Veepee",
  "Maisons du Monde", "Boulanger", "Picard", "Saint-Gobain", "Adecco", "Kiabi",
];

let siteOk = 0;
let logoOk = 0;
for (const name of COMPANIES) {
  const t = Date.now();
  const domain = await findCompanyDomain(name);
  const logo = domain ? await findLogo(domain) : null;
  const size = logo ? imageSize(logo.body) : null;
  if (domain) siteOk++;
  if (logo) logoOk++;
  console.log(
    `${domain ? "✓" : "✗"} ${name.padEnd(22)} site: ${(domain || "—").padEnd(28)} logo: ${logo ? `${logo.type} ${size?.width}x${size?.height}` : "—"}  (${Date.now() - t} ms)`,
  );
}
console.log(`\nSites trouvés : ${siteOk}/${COMPANIES.length} — logos trouvés : ${logoOk}/${COMPANIES.length}`);
