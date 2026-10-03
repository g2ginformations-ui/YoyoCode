import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { stripeClient } from "@/lib/stripe";

// Mots de passe des clients : empreinte scrypt salée, stockée dans les métadonnées du client Stripe
// (jamais le mot de passe lui-même). Pas de base de données supplémentaire.
export const MIN_PASSWORD_LENGTH = 8;
const KEY_LENGTH = 32;
const MAX_FAILURES = 5;
const LOCK_MS = 15 * 60 * 1000;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) =>
    scrypt(password.normalize("NFKC"), salt, KEY_LENGTH, { N: 16384, r: 8, p: 1 }, (error, key) =>
      error ? reject(error) : resolve(key),
    ),
  );
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  return `scrypt$${salt.toString("base64")}$${(await derive(password, salt)).toString("base64")}`;
}

async function matches(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const expected = Buffer.from(hash, "base64");
  const actual = await derive(password, Buffer.from(salt, "base64"));
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function hasPassword(customerId: string): Promise<boolean> {
  const customer = await stripeClient().customers.retrieve(customerId);
  return !("deleted" in customer && customer.deleted) && Boolean(customer.metadata.pw_hash);
}

export async function setPassword(customerId: string, password: string): Promise<void> {
  await stripeClient().customers.update(customerId, {
    metadata: { pw_hash: await hashPassword(password), pw_fails: "0", pw_lock_until: "" },
  });
}

export type PasswordCheck = "ok" | "wrong" | "locked" | "none";

// Vérifie le mot de passe d'un client. Après 5 erreurs, le compte est bloqué 15 minutes.
export async function checkPassword(
  customer: { id: string; metadata: Record<string, string> },
  password: string,
): Promise<PasswordCheck> {
  const { pw_hash: stored, pw_fails: fails, pw_lock_until: lockUntil } = customer.metadata;
  if (!stored) return "none";
  if (Number(lockUntil) > Date.now()) return "locked";
  if (await matches(password, stored)) {
    if (fails && fails !== "0") {
      await stripeClient().customers.update(customer.id, { metadata: { pw_fails: "0", pw_lock_until: "" } });
    }
    return "ok";
  }
  const count = (Number.parseInt(fails ?? "", 10) || 0) + 1;
  const locked = count >= MAX_FAILURES;
  await stripeClient().customers.update(customer.id, {
    metadata: { pw_fails: locked ? "0" : String(count), pw_lock_until: locked ? String(Date.now() + LOCK_MS) : "" },
  });
  return locked ? "locked" : "wrong";
}
