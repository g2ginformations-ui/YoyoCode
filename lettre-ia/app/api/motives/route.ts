import { motivesTotal } from "@/lib/motives";

export const runtime = "nodejs";

// Nombre de « Motivés » affiché sous le bouton de l'accueil, arrondi à la dizaine inférieure.
export async function GET() {
  const total = await motivesTotal();
  return Response.json(
    { total: Math.floor(total / 10) * 10 },
    { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400" } },
  );
}
