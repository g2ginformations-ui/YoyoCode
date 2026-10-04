// Vérification réelle (avec Internet) : pour une liste d'entreprises, le BON site est-il trouvé à partir
// du nom, et un logo exploitable est-il trouvé pour ce site ? Lancé par la CI (.github/workflows/lettre-ia-logos.yml).
// Usage : npx tsx scripts/check-company-logos.mts
import { findCompanyDomain, findLogo, imageSize } from "@/lib/company-site";

// Nom → nom de domaine attendu (sans extension ni tirets). Plusieurs homonymes pièges (Orange, Malt, Alan, Free…).
const COMPANIES: [string, string[]][] = [
  ["Decathlon", ["decathlon"]], ["Doctolib", ["doctolib"]], ["Leroy Merlin", ["leroymerlin"]], ["Carrefour", ["carrefour"]],
  ["BlaBlaCar", ["blablacar"]], ["Qonto", ["qonto"]], ["Back Market", ["backmarket"]], ["Sézane", ["sezane"]],
  ["La Poste", ["laposte", "groupelaposte"]], ["Orange", ["orange"]], ["Michelin", ["michelin"]], ["L'Oréal", ["loreal"]],
  ["Ubisoft", ["ubisoft"]], ["Malt", ["malt"]], ["Swile", ["swile"]], ["Le Slip Français", ["leslipfrancais"]],
  ["Alan", ["alan"]], ["Manpower", ["manpower", "manpowergroup"]], ["Fnac Darty", ["fnacdarty"]], ["Sephora", ["sephora"]],
  ["Welcome to the Jungle", ["welcometothejungle"]], ["Contentsquare", ["contentsquare"]], ["Lydia", ["lydia", "lydiaapp"]],
  ["Veepee", ["veepee", "venteprivee"]], ["Maisons du Monde", ["maisonsdumonde"]], ["Boulanger", ["boulanger"]],
  ["Picard", ["picard"]], ["Saint-Gobain", ["saintgobain"]], ["Adecco", ["adecco", "adeccogroup"]], ["Kiabi", ["kiabi"]],
  ["SNCF", ["sncf", "sncfconnect", "groupesncf"]], ["Auchan", ["auchan"]], ["Engie", ["engie"]], ["Thales", ["thalesgroup", "thales"]],
  ["Capgemini", ["capgemini"]], ["Cdiscount", ["cdiscount"]], ["Vinted", ["vinted"]], ["Free", ["free"]],
];

const label = (domain: string) => domain.split(".").slice(0, -1).join("").replace(/-/g, "").replace(/^www/, "");

let siteOk = 0;
let logoOk = 0;
for (const [name, expected] of COMPANIES) {
  const t = Date.now();
  const domain = await findCompanyDomain(name);
  const right = Boolean(domain) && expected.includes(label(domain));
  const logo = right ? await findLogo(domain) : null;
  const size = logo ? imageSize(logo.body) : null;
  if (right) siteOk++;
  if (logo) logoOk++;
  console.log(
    `${right && logo ? "✓" : "✗"} ${name.padEnd(22)} site: ${(domain || "—").padEnd(26)} ${right ? "bon " : "FAUX"}  logo: ${logo ? `${logo.type} ${size?.width}x${size?.height}` : "—"}  (${Date.now() - t} ms)`,
  );
}
console.log(`\nBons sites : ${siteOk}/${COMPANIES.length} — logos trouvés : ${logoOk}/${COMPANIES.length}`);
