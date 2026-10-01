"use server";

import { readStore, updateStore } from "@/lib/store";

export type NewsletterState = { ok: true; code: string; percent: number } | { ok: false; error: string } | null;

export async function subscribe(_state: NewsletterState, form: FormData): Promise<NewsletterState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Adresse e-mail invalide." };
  const { newsletter } = (await readStore()).settings;
  if (!newsletter.enabled) return { ok: false, error: "Les inscriptions sont fermées pour le moment." };
  await updateStore((store) => {
    if (!store.subscribers.some((s) => s.email === email)) {
      store.subscribers.unshift({ email, createdAt: new Date().toISOString() });
    }
  });
  return { ok: true, code: newsletter.code, percent: newsletter.percent };
}

// Vérifie un code saisi dans le panier sans jamais envoyer le code attendu au navigateur.
export async function checkPromo(code: string): Promise<number | null> {
  const { newsletter } = (await readStore()).settings;
  const valid = newsletter.enabled && newsletter.code && code.trim().toUpperCase() === newsletter.code.toUpperCase();
  return valid ? newsletter.percent : null;
}
