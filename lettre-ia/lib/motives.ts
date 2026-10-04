import { kv, kvEnabled } from "@/lib/kv";

// « Motivés » : personnes qui ont utilisé MyMotiv. Base = utilisateurs du premier site (même service),
// à justifier par ses statistiques ; s'y ajoute chaque nouvel utilisateur qui reçoit sa première lettre ici.
export const PREVIOUS_SITE_USERS = 200;
const KEY = "stats:motives";

export async function countMotive(): Promise<void> {
  if (!kvEnabled()) return;
  await kv(["INCR", KEY]).catch(() => {});
}

export async function motivesTotal(): Promise<number> {
  let added = 0;
  if (kvEnabled()) {
    const raw = await kv<string | number | null>(["GET", KEY]).catch(() => 0);
    added = Number(raw) || 0;
  }
  return PREVIOUS_SITE_USERS + added;
}
