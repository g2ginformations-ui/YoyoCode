import { DOMAIN_PATTERN, ignored, normalizeDomain } from "@/lib/company";
import { safeFetch } from "@/lib/safe-fetch";

// Site officiel et logo d'une entreprise, à partir de son nom ou de son domaine.
// 1. Site : Wikidata (site officiel déclaré), sinon domaines devinés à partir du nom (.fr, .com…),
//    retenus seulement si la page d'accueil mentionne bien l'entreprise.
// 2. Logo : celui que le site publie lui-même (logo déclaré, icône Apple, icônes haute définition),
//    sinon l'icône du site via Google. Seules les images d'au moins 48 px sont gardées.

const HTML_BYTES = 1_500_000;
const IMAGE_BYTES = 400_000;
const MIN_LOGO_PX = 48;

function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

// Mots qui ne distinguent pas une entreprise (forme juridique, articles…).
const STOP = new Set(["sas", "sa", "sarl", "eurl", "sasu", "group", "groupe", "france", "the", "le", "la", "les", "de", "du", "des", "et", "and", "co", "inc", "ltd", "gmbh"]);

function nameTokens(name: string): string[] {
  return fold(name)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !STOP.has(t));
}

// Domaines plausibles : « Maison Lumen » → maisonlumen.fr, maison-lumen.fr, maisonlumen.com…
export function guessDomains(name: string): string[] {
  const tokens = nameTokens(name);
  if (!tokens.length) return [];
  const joined = tokens.join("");
  const dashed = tokens.join("-");
  // Nom complet sans espaces ni ponctuation (« L'Oréal » → loreal), puis variantes sans les mots vides.
  const raw = fold(name).replace(/\b(sas|sasu|sarl|eurl|sa)\b/g, "").replace(/[^a-z0-9]/g, "");
  const labels = [...new Set([raw, joined, dashed, tokens[0]])].filter((l) => l.length >= 3 && l.length <= 40);
  const domains: string[] = [];
  for (const label of labels) for (const tld of ["fr", "com", "eu", "io", "co"]) domains.push(`${label}.${tld}`);
  return domains.filter((d) => DOMAIN_PATTERN.test(d)).slice(0, 15);
}

async function fetchHtml(url: string): Promise<{ html: string; url: URL } | null> {
  try {
    const page = await safeFetch(url, "text/html,application/xhtml+xml", HTML_BYTES);
    if (page.status >= 400 || !page.type.includes("html")) return null;
    return { html: new TextDecoder().decode(page.body), url: page.url };
  } catch {
    return null;
  }
}

function attr(tag: string, name: string): string {
  return tag.match(new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i"))?.[1]?.trim() ?? "";
}

// La page d'accueil parle-t-elle bien de cette entreprise ? (titre, nom du site, texte du haut de page)
export function pageMatchesName(html: string, name: string): boolean {
  const tokens = nameTokens(name);
  if (!tokens.length) return false;
  const head = fold(
    [
      html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "",
      ...[...html.matchAll(/<meta[^>]+>/gi)].map((m) => (/(og:site_name|og:title|application-name)/i.test(m[0]) ? attr(m[0], "content") : "")),
      html.slice(0, 20_000).replace(/<[^>]+>/g, " "),
    ].join(" "),
  );
  const compact = head.replace(/[^a-z0-9]/g, "");
  return tokens.every((t) => head.includes(t)) || compact.includes(tokens.join(""));
}

async function wikidataSite(name: string): Promise<string> {
  try {
    const search = await safeFetch(
      `https://www.wikidata.org/w/api.php?action=wbsearchentities&format=json&language=fr&uselang=fr&type=item&limit=3&search=${encodeURIComponent(name)}`,
      "application/json",
      200_000,
    );
    const ids: string[] = (JSON.parse(new TextDecoder().decode(search.body)).search ?? []).map((r: { id: string }) => r.id);
    if (!ids.length) return "";
    const entities = await safeFetch(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=claims&ids=${ids.join("|")}`,
      "application/json",
      3_000_000,
    );
    const data = JSON.parse(new TextDecoder().decode(entities.body)).entities ?? {};
    for (const id of ids) {
      // P856 : site officiel.
      const url = data[id]?.claims?.P856?.[0]?.mainsnak?.datavalue?.value;
      const domain = typeof url === "string" ? normalizeDomain(url) : "";
      if (domain && DOMAIN_PATTERN.test(domain) && !ignored(domain)) return domain;
    }
  } catch {
    // Wikidata indisponible : on passe aux domaines devinés.
  }
  return "";
}

export async function findCompanyDomain(name: string): Promise<string> {
  const clean = name.trim().slice(0, 80);
  if (nameTokens(clean).length === 0) return "";
  const fromWikidata = await wikidataSite(clean);
  if (fromWikidata) return fromWikidata;
  // Domaines devinés, vérifiés par lots pour rester rapide.
  const guesses = guessDomains(clean);
  for (let i = 0; i < guesses.length; i += 4) {
    const batch = guesses.slice(i, i + 4);
    const results = await Promise.all(
      batch.map(async (domain) => {
        const page = await fetchHtml(`https://${domain}/`);
        return page && pageMatchesName(page.html, clean) ? normalizeDomain(page.url.hostname) : "";
      }),
    );
    const found = results.find((d) => d && !ignored(d));
    if (found) return found;
  }
  return "";
}

// Dimensions d'une image à partir de ses premiers octets (PNG, JPEG, GIF, WebP, ICO), sans la décoder.
export function imageSize(b: Uint8Array): { width: number; height: number } | null {
  const u16 = (o: number, le = false) => (le ? b[o] | (b[o + 1] << 8) : (b[o] << 8) | b[o + 1]);
  const u32 = (o: number) => ((b[o] << 24) | (b[o + 1] << 16) | (b[o + 2] << 8) | b[o + 3]) >>> 0;
  if (b.length > 24 && b[0] === 0x89 && b[1] === 0x50) return { width: u32(16), height: u32(20) };
  if (b.length > 10 && b[0] === 0x47 && b[1] === 0x49) return { width: u16(6, true), height: u16(8, true) };
  if (b.length > 6 && b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0) {
    // ICO : on garde la plus grande image du fichier (0 signifie 256 px).
    let best = 0;
    for (let i = 0; i < u16(4, true) && 6 + i * 16 + 1 < b.length; i++) best = Math.max(best, b[6 + i * 16] || 256);
    return { width: best, height: best };
  }
  if (b.length > 30 && b[0] === 0x52 && b[8] === 0x57) {
    const chunk = String.fromCharCode(b[12], b[13], b[14], b[15]);
    if (chunk === "VP8X") return { width: 1 + (b[24] | (b[25] << 8) | (b[26] << 16)), height: 1 + (b[27] | (b[28] << 8) | (b[29] << 16)) };
    if (chunk === "VP8 ") return { width: u16(26, true) & 0x3fff, height: u16(28, true) & 0x3fff };
    if (chunk === "VP8L") {
      const bits = b[21] | (b[22] << 8) | (b[23] << 16) | (b[24] << 24);
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  if (b.length > 4 && b[0] === 0xff && b[1] === 0xd8) {
    let o = 2;
    while (o + 9 < b.length) {
      if (b[o] !== 0xff) return null;
      const marker = b[o + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { width: u16(o + 7), height: u16(o + 5) };
      o += 2 + u16(o + 2);
    }
  }
  return null;
}

export type LogoImage = { body: Uint8Array; type: string };

const IMAGE_TYPES = /^image\/(png|jpeg|gif|webp|x-icon|vnd\.microsoft\.icon)$/;

// Télécharge une image candidate et la garde si c'est un vrai logo exploitable (format, taille).
export async function fetchLogoImage(url: string): Promise<LogoImage | null> {
  try {
    const res = await safeFetch(url, "image/png,image/jpeg,image/webp,image/gif,image/x-icon,image/*;q=0.5", IMAGE_BYTES);
    let type = res.type.split(";")[0].trim();
    // Certains serveurs envoient les .ico sans type précis.
    if (!IMAGE_TYPES.test(type) && /\.ico(\?|$)/i.test(res.url.pathname)) type = "image/x-icon";
    if (res.status >= 400 || !IMAGE_TYPES.test(type)) return null;
    const size = imageSize(res.body);
    if (!size || size.width < MIN_LOGO_PX || size.height < MIN_LOGO_PX) return null;
    return { body: res.body, type };
  } catch {
    return null;
  }
}

// Logos et icônes annoncés par la page d'accueil, du plus net au moins net.
export function logoCandidates(html: string, base: URL): string[] {
  const out: { url: string; score: number }[] = [];
  const add = (href: string, score: number) => {
    try {
      const url = new URL(href, base);
      if (url.protocol === "https:" || url.protocol === "http:") out.push({ url: url.toString(), score });
    } catch {
      // Lien invalide : ignoré.
    }
  };
  // Logo déclaré dans les données structurées (Organization.logo).
  for (const m of html.matchAll(/"logo"\s*:\s*(?:"([^"]+)"|\{[^}]*?"url"\s*:\s*"([^"]+)")/g)) {
    const href = (m[1] ?? m[2] ?? "").replace(/\\\//g, "/");
    if (href && !/\.svg(\?|$)/i.test(href)) add(href, 100);
  }
  for (const m of html.matchAll(/<link[^>]+>/gi)) {
    const tag = m[0];
    const rel = attr(tag, "rel").toLowerCase();
    const href = attr(tag, "href");
    if (!href || /\.svg(\?|$)/i.test(href)) continue;
    const size = Number(attr(tag, "sizes").split("x")[0]) || 0;
    if (rel.includes("apple-touch-icon")) add(href, 90 + Math.min(size, 512) / 100);
    else if (rel.includes("icon")) add(href, 40 + Math.min(size, 512) / 10);
  }
  add("/apple-touch-icon.png", 30);
  return [...new Map(out.sort((a, b) => b.score - a.score).map((c) => [c.url, c])).keys()].slice(0, 8);
}

export async function findLogo(domainInput: string): Promise<LogoImage | null> {
  const domain = normalizeDomain(domainInput);
  if (!DOMAIN_PATTERN.test(domain)) return null;
  const home = (await fetchHtml(`https://${domain}/`)) ?? (await fetchHtml(`https://www.${domain}/`));
  const candidates = home ? logoCandidates(home.html, home.url) : [`https://${domain}/apple-touch-icon.png`];
  for (const url of candidates) {
    const logo = await fetchLogoImage(url);
    if (logo) return logo;
  }
  // Dernier recours : icône du site connue de Google.
  return fetchLogoImage(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`);
}
