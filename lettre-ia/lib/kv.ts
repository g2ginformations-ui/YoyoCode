// Base Redis Upstash (Vercel → Storage), appelée par son API REST, sans dépendance supplémentaire :
// avis clients, limites anti-abus et verrous.
function config(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export function kvEnabled(): boolean {
  return config() !== null;
}

export async function kv<T = unknown>(command: (string | number)[]): Promise<T> {
  const settings = config();
  if (!settings) throw new Error("Base Redis non configurée.");
  const res = await fetch(settings.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${settings.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Base Redis indisponible (${res.status}).`);
  return ((await res.json()) as { result: T }).result;
}
