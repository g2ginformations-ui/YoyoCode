import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { seedStore } from "@/lib/seed";
import type { Store } from "@/lib/types";

// Toute la boutique tient dans un fichier JSON : simple à sauvegarder, à copier et à héberger sur un petit serveur.
export const DATA_DIR = process.env.DATA_DIR || path.join(/*turbopackIgnore: true*/ process.cwd(), "data");
export const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
const STORE_FILE = path.join(DATA_DIR, "store.json");

// Les écritures passent l'une après l'autre pour ne jamais perdre une modification.
let queue: Promise<unknown> = Promise.resolve();

export async function readStore(): Promise<Store> {
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
