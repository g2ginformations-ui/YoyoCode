import { IMPORTED_REVIEWS } from "@/lib/reviews-imported";

// Avis clients. Les nouveaux avis sont stockés dans une base Redis Upstash (offerte depuis Vercel → Storage),
// via son API REST : pas de dépendance supplémentaire.
export type Review = { name: string; rating: number; text: string; date?: string; imported?: boolean };

export const REVIEW_COOKIE = "lettre_ia_avis";
const KEY = "avis";
const MAX_STORED = 1000;

function redisConfig(): { url: string; token: string } | null {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

export function reviewsStorageEnabled(): boolean {
  return redisConfig() !== null;
}

async function redis(command: (string | number)[]): Promise<unknown> {
  const config = redisConfig();
  if (!config) throw new Error("Stockage des avis non configuré.");
  const res = await fetch(config.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Base des avis indisponible (${res.status}).`);
  return ((await res.json()) as { result: unknown }).result;
}

async function storedReviews(): Promise<Review[]> {
  if (!reviewsStorageEnabled()) return [];
  try {
    const rows = (await redis(["LRANGE", KEY, 0, MAX_STORED - 1])) as string[];
    return rows.flatMap((row) => {
      try {
        return [JSON.parse(row) as Review];
      } catch {
        return [];
      }
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function addReview(review: Review): Promise<void> {
  await redis(["LPUSH", KEY, JSON.stringify(review)]);
  await redis(["LTRIM", KEY, 0, MAX_STORED - 1]);
}

export type ReviewSummary = { reviews: Review[]; average: number; count: number; imported: number };

// Les avis déposés ici d'abord (du plus récent au plus ancien), puis ceux repris du premier site.
// La note moyenne et le nombre d'avis sont calculés sur la liste affichée.
export async function reviewSummary(): Promise<ReviewSummary> {
  const reviews = [...(await storedReviews()), ...IMPORTED_REVIEWS.map((r) => ({ ...r, imported: true }))];
  const count = reviews.length;
  const average = count ? reviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  return { reviews, average, count, imported: IMPORTED_REVIEWS.length };
}
