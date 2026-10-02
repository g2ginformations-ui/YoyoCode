import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { db, dbEnabled } from "@/lib/db";
import { seedStore } from "@/lib/seed";
import type { Store } from "@/lib/types";

// Toute la boutique tient dans un seul document JSON : dans data/store.json, ou dans Postgres si DATABASE_URL est défini.
export const DATA_DIR = process.env.DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

// Les écritures passent l'une après l'autre pour ne jamais perdre une modification.
let queue: Promise<unknown> = Promise.resolve();

export async function readStore(): Promise<Store> {
  if (dbEnabled()) {
    const sql = await db();
    const [row] = await sql`select data from skkin_store where id = 1`;
    if (row) return withDefaults(row.data as Store);
    const store = seedStore();
    await save(store);
    return store;
  }
  try {
    return withDefaults(JSON.parse(await readFile(STORE_FILE, "utf8")) as Store);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    const store = seedStore();
    await save(store);
    return store;
  }
}

// Une boutique créée avant l'ajout d'un réglage reçoit sa valeur par défaut.
function withDefaults(store: Store): Store {
  const seed = seedStore();
  store.settings = { ...seed.settings, ...store.settings };
  store.subscribers ??= [];
  for (const product of store.products) product.badge ??= "";
  for (const order of store.orders) {
    order.discountCents ??= 0;
    order.promoCode ??= "";
  }
  return store;
}

async function save(store: Store) {
  if (dbEnabled()) {
    const sql = await db();
    const data = sql.json(JSON.parse(JSON.stringify(store)));
    await sql`insert into skkin_store (id, data) values (1, ${data}) on conflict (id) do update set data = excluded.data`;
    return;
  }
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = `${STORE_FILE}.${randomUUID()}.tmp`;
  await writeFile(tmp, JSON.stringify(store, null, 2));
  await rename(tmp, STORE_FILE);
}

export function updateStore<T>(change: (store: Store) => T): Promise<T> {
  const run = queue.then(async () => {
    const store = await readStore();
    const result = change(store);
    await save(store);
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}
