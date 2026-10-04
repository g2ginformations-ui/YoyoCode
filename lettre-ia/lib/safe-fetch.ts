import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

// Téléchargement d'une page ou d'une image à partir d'une adresse fournie par un visiteur.
// Protections : http(s) uniquement, ports standard, jamais d'adresse interne (réseau local, serveur
// lui-même, métadonnées du cloud), redirections revérifiées une à une, taille et durée limitées.

export class FetchRefused extends Error {}

const MAX_REDIRECTS = 4;
const TIMEOUT_MS = 8000;
// Identification honnête : le site visité sait qui le lit (pas de faux navigateur).
const USER_AGENT = "MyMotivBot/1.0 (+https://yoyo-code.vercel.app ; lecture d'une offre à la demande d'un candidat)";

function privateIPv4(ip: string): boolean {
  const [a, b] = ip.split(".").map(Number);
  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  );
}

function privateIp(ip: string): boolean {
  if (isIP(ip) === 4) return privateIPv4(ip);
  const v6 = ip.toLowerCase();
  const mapped = v6.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (mapped) return privateIPv4(mapped[1]);
  return v6 === "::" || v6 === "::1" || /^f[cd]/.test(v6) || /^fe[89ab]/.test(v6) || v6.startsWith("ff");
}

async function checkUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new FetchRefused("Lien invalide.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new FetchRefused("Seuls les liens http(s) sont acceptés.");
  if (url.port && url.port !== "80" && url.port !== "443") throw new FetchRefused("Lien non pris en charge.");
  if (url.username || url.password) throw new FetchRefused("Lien non pris en charge.");
  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host) || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".internal") || !host.includes(".")) {
    throw new FetchRefused("Lien non pris en charge.");
  }
  const addresses = await lookup(host, { all: true }).catch(() => []);
  if (addresses.length === 0) throw new FetchRefused("Site introuvable : vérifiez le lien.");
  if (addresses.some((a) => privateIp(a.address))) throw new FetchRefused("Lien non pris en charge.");
  return url;
}

export type Fetched = { url: URL; status: number; type: string; body: Uint8Array };

export async function safeFetch(raw: string, accept: string, maxBytes: number, timeoutMs = TIMEOUT_MS): Promise<Fetched> {
  let url = await checkUrl(raw);
  const deadline = AbortSignal.timeout(timeoutMs);
  for (let hop = 0; ; hop++) {
    const res = await fetch(url, {
      redirect: "manual",
      signal: deadline,
      headers: { "User-Agent": USER_AGENT, Accept: accept, "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.5" },
    });
    if (res.status >= 300 && res.status < 400 && res.headers.get("location")) {
      if (hop >= MAX_REDIRECTS) throw new FetchRefused("Trop de redirections.");
      url = await checkUrl(new URL(res.headers.get("location")!, url).toString());
      continue;
    }
    const type = (res.headers.get("content-type") ?? "").toLowerCase();
    if (Number(res.headers.get("content-length") ?? 0) > maxBytes) throw new FetchRefused("Page trop lourde.");
    // Lecture limitée : on s'arrête dès que la taille maximale est atteinte.
    const reader = res.body?.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (reader) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new FetchRefused("Page trop lourde.");
      }
      chunks.push(value);
    }
    const body = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      body.set(chunk, offset);
      offset += chunk.byteLength;
    }
    return { url, status: res.status, type, body };
  }
}
