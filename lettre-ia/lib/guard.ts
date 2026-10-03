import { createHash } from "node:crypto";
import { kv, kvEnabled } from "@/lib/kv";

// Protections contre les abus, appuyées sur la base Redis : limites par adresse IP et verrou par client.
// Sans base configurée, ou si elle ne répond pas, rien n'est bloqué : le site reste utilisable.

// Adresse IP du visiteur, telle que transmise par Vercel (l'en-tête est réécrit, il ne peut pas être falsifié).
function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return request.headers.get("x-real-ip") || forwarded || "inconnue";
}

// L'adresse IP n'est jamais stockée en clair : seule une empreinte salée sert de clé.
function ipFingerprint(request: Request): string {
  return createHash("sha256")
    .update(`${process.env.ACCESS_SECRET ?? ""}:${clientIp(request)}`)
    .digest("base64url")
    .slice(0, 24);
}

// Compte une action pour cette adresse IP et indique si la limite de la période est dépassée.
export async function rateLimited(
  request: Request,
  action: string,
  max: number,
  windowSeconds: number,
): Promise<boolean> {
  if (!kvEnabled()) return false;
  const window = Math.floor(Date.now() / 1000 / windowSeconds);
  const key = `limite:${action}:${window}:${ipFingerprint(request)}`;
  try {
    const count = await kv<number>(["INCR", key]);
    if (count === 1) await kv(["EXPIRE", key, windowSeconds]);
    return count > max;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Verrou court : une seule rédaction à la fois par client (un crédit ne peut pas servir à lancer
// plusieurs lettres en parallèle), un seul traitement par paiement (retour sur le site et webhook Stripe
// peuvent arriver au même moment). Renvoie false si le verrou est déjà pris.
export async function acquireLock(key: string, seconds: number): Promise<boolean> {
  if (!kvEnabled()) return true;
  try {
    return (await kv<string | null>(["SET", `verrou:${key}`, "1", "NX", "EX", seconds])) === "OK";
  } catch (error) {
    console.error(error);
    return true;
  }
}

export async function releaseLock(key: string): Promise<void> {
  if (!kvEnabled()) return;
  try {
    await kv(["DEL", `verrou:${key}`]);
  } catch (error) {
    console.error(error);
  }
}
