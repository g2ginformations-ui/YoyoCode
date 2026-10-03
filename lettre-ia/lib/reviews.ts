import { kv, kvEnabled } from "@/lib/kv";
import { IMPORTED_REVIEWS } from "@/lib/reviews-imported";

// Avis clients. Les nouveaux avis sont stockés dans la base Redis Upstash (offerte depuis Vercel → Storage).
export type Review = { name: string; rating: number; text: string; date?: string; imported?: boolean };

export const REVIEW_COOKIE = "lettre_ia_avis";
const KEY = "avis";
const MAX_STORED = 1000;

export function reviewsStorageEnabled(): boolean {
  return kvEnabled();
}

// Avis enregistrés ici, avec leur texte brut (utile pour la suppression depuis l'administration).
export async function storedReviewRows(): Promise<{ raw: string; review: Review }[]> {
  if (!reviewsStorageEnabled()) return [];
  const rows = (await kv(["LRANGE", KEY, 0, MAX_STORED - 1])) as string[];
  return rows.flatMap((raw) => {
    try {
      return [{ raw, review: JSON.parse(raw) as Review }];
    } catch {
      return [];
    }
  });
}

async function storedReviews(): Promise<Review[]> {
  try {
    return (await storedReviewRows()).map((row) => row.review);
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function deleteReview(raw: string): Promise<void> {
  await kv(["LREM", KEY, 1, raw]);
}

export async function addReview(review: Review): Promise<void> {
  await kv(["LPUSH", KEY, JSON.stringify(review)]);
  await kv(["LTRIM", KEY, 0, MAX_STORED - 1]);
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
