import { getSession, getSubscription, isActive } from "@/lib/access";
import { findReason, recordCancellation } from "@/lib/cancellation";
import { siteUrl, stripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

// Résiliation en 2 clics depuis « Mon compte » : l'abonnement s'arrête à la fin de la période déjà payée.
// La mini-enquête est facultative et n'empêche jamais la résiliation.
export async function POST(request: Request) {
  const base = siteUrl(request);
  const session = await getSession();
  if (!session) return Response.redirect(`${base}/connexion`, 303);

  const form = await request.formData().catch(() => null);
  const reason = findReason(form?.get("raison"));
  const comment = String(form?.get("commentaire") ?? "").trim().slice(0, 500);

  try {
    const sub = await getSubscription(session.customerId);
    if (!sub || !isActive(sub)) return Response.redirect(`${base}/compte?resiliation=aucune`, 303);
    if (!sub.cancelAtPeriodEnd) {
      await stripeClient().subscriptions.update(sub.id, {
        cancel_at_period_end: true,
        cancellation_details: {
          feedback: reason?.feedback,
          comment: [reason?.label, comment].filter(Boolean).join(" — ").slice(0, 500) || undefined,
        },
      });
      await recordCancellation({
        date: new Date().toISOString(),
        plan: sub.interval === "week" ? "Semaine" : "Mois",
        reason: reason?.id ?? null,
        comment,
      });
    }
  } catch (error) {
    console.error(error);
    return Response.redirect(`${base}/compte?resiliation=erreur`, 303);
  }
  return Response.redirect(`${base}/compte?resiliation=ok`, 303);
}
