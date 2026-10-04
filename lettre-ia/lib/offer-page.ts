import { DOMAIN_PATTERN, ignored, normalizeDomain } from "@/lib/company";

// Lecture d'une page d'offre d'emploi : d'abord les données structurées « JobPosting » (schema.org),
// que la plupart des sites d'emploi publient pour Google, sinon le texte visible de la page.

export type OfferPage = {
  text: string;
  company: string;
  // Site de l'entreprise, quand la page l'indique (pour le logo et le nom).
  domain: string;
  // Logo officiel publié avec l'offre (image), s'il y en a un.
  logoUrl: string;
};

const ENTITIES: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", eacute: "é", egrave: "è", ecirc: "ê", agrave: "à",
  acirc: "â", ccedil: "ç", ocirc: "ô", ucirc: "û", ugrave: "ù", icirc: "î", iuml: "ï", euml: "ë", rsquo: "’",
  lsquo: "‘", ldquo: "“", rdquo: "”", laquo: "«", raquo: "»", hellip: "…", ndash: "–", mdash: "—", bull: "•",
  Eacute: "É", Agrave: "À", oelig: "œ", euro: "€",
};

function decode(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, code: string) => {
    if (code[0] === "#") {
      const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
      return Number.isFinite(n) && n > 0 && n < 0x110000 ? String.fromCodePoint(n) : "";
    }
    return ENTITIES[code] ?? all;
  });
}

// HTML → texte lisible : les blocs deviennent des retours à la ligne, les puces des tirets.
export function htmlToText(html: string): string {
  return decode(
    html
      .replace(/<(script|style|noscript|svg|template|iframe)\b[\s\S]*?<\/\1>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ")
      .replace(/<li\b[^>]*>/gi, "\n- ")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?(p|div|section|article|h[1-6]|ul|ol|tr|table|header|footer|main)\b[^>]*>/gi, "\n")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/[ \t ]+/g, " ")
    .replace(/ *\n */g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

type Json = Record<string, unknown>;

function asObject(value: unknown): Json | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Json) : null;
}

function str(value: unknown): string {
  if (typeof value === "string") return value.trim();
  const obj = asObject(value);
  if (obj) return str(obj.url ?? obj.name ?? obj["@id"] ?? "");
  if (Array.isArray(value)) return str(value[0]);
  return "";
}

// Toutes les fiches JSON-LD de la page, y compris celles regroupées dans un « @graph ».
function jsonLdItems(html: string): Json[] {
  const items: Json[] = [];
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    const obj = asObject(value);
    if (!obj) return;
    items.push(obj);
    if (obj["@graph"]) visit(obj["@graph"]);
  };
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      visit(JSON.parse(match[1].trim()));
    } catch {
      // Bloc mal formé : ignoré.
    }
  }
  return items;
}

function isJobPosting(item: Json): boolean {
  const type = item["@type"];
  return type === "JobPosting" || (Array.isArray(type) && type.includes("JobPosting"));
}

function place(value: unknown): string {
  const first = Array.isArray(value) ? value[0] : value;
  const address = asObject(asObject(first)?.address);
  if (!address) return "";
  return [str(address.addressLocality), str(address.postalCode), str(address.addressRegion)].filter(Boolean).join(" ");
}

function meta(html: string, name: string): string {
  const re = new RegExp(`<meta[^>]+(?:property|name)=["']${name}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0] ?? "";
  return decode(tag.match(/content=["']([^"']*)["']/i)?.[1] ?? "").trim();
}

function siteDomain(value: string): string {
  const domain = normalizeDomain(value);
  return DOMAIN_PATTERN.test(domain) && !ignored(domain) ? domain : "";
}

function absolute(value: string, base: URL): string {
  try {
    const url = new URL(value, base);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : "";
  } catch {
    return "";
  }
}

export function parseOfferPage(html: string, pageUrl: URL): OfferPage {
  // Offre publiée sur le site carrière de l'entreprise elle-même (pas sur un site d'emploi).
  const ownSite = siteDomain(pageUrl.hostname);
  const job = jsonLdItems(html).find(isJobPosting);
  if (job) {
    const org = asObject(job.hiringOrganization) ?? {};
    const company = str(org.name);
    const lines = [
      str(job.title) && `Poste : ${str(job.title)}`,
      company && `Entreprise : ${company}`,
      place(job.jobLocation) && `Lieu : ${place(job.jobLocation)}`,
      str(job.employmentType) && `Contrat : ${str(job.employmentType)}`,
      `\n${htmlToText(decode(str(job.description)))}`,
      str(job.qualifications) && `\nProfil recherché :\n${htmlToText(decode(str(job.qualifications)))}`,
      str(job.responsibilities) && `\nMissions :\n${htmlToText(decode(str(job.responsibilities)))}`,
      str(job.skills) && `\nCompétences :\n${htmlToText(decode(str(job.skills)))}`,
    ];
    return {
      text: lines.filter(Boolean).join("\n").trim(),
      company,
      domain: siteDomain(str(org.sameAs) || str(org.url)) || ownSite,
      logoUrl: absolute(str(org.logo), pageUrl),
    };
  }

  // Pas de données structurées : texte de la zone principale (ou de toute la page), titre et description.
  const main = html.match(/<main\b[\s\S]*?<\/main>/i)?.[0] ?? html.match(/<body\b[\s\S]*?<\/body>/i)?.[0] ?? html;
  const title = meta(html, "og:title") || decode(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "").trim();
  const body = htmlToText(main.replace(/<(nav|aside|form)\b[\s\S]*?<\/\1>/gi, " "));
  return {
    text: [title, body].filter(Boolean).join("\n\n"),
    // Sur un site d'emploi, og:site_name est le nom du site (Indeed…), pas celui de l'entreprise.
    company: ownSite ? meta(html, "og:site_name") : "",
    domain: ownSite,
    logoUrl: "",
  };
}
